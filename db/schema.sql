-- TravelCheck 資料庫結構
-- 在 Supabase 專案的 SQL Editor 貼上整份執行一次即可。
-- 可重複執行（會先移除舊的表），但重跑會清空所有資料，請小心。

-- ---------------------------------------------------------------------------
-- 清除舊結構
-- ---------------------------------------------------------------------------
drop table if exists trip_custom_items cascade;
drop table if exists trip_item_states cascade;
drop table if exists trip_templates cascade;
drop table if exists trips cascade;
drop table if exists template_items cascade;
drop table if exists templates cascade;

-- ---------------------------------------------------------------------------
-- 模板
--   owner_id 為 null 且 is_public = true 者為公用模板（所有人可讀、沒有人可改）
--   owner_id 有值者為使用者自己的模板（只有本人可讀寫）
-- ---------------------------------------------------------------------------
create table templates (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references auth.users (id) on delete cascade,
  is_public   boolean not null default false,
  slug        text,
  name        text not null,
  icon        text,
  kind        text not null default 'item' check (kind in ('item', 'todo')),
  hint        text,
  hot         boolean not null default false,
  seq         boolean not null default false,
  -- 新增清單時，這個模板是否預設勾選（場景類與寵物類預設不勾）
  default_on  boolean not null default true,
  sort_order  integer not null default 0,
  copied_from uuid references templates (id) on delete set null,
  created_at  timestamptz not null default now(),
  -- 公用模板不能有 owner，私人模板一定要有 owner
  constraint templates_owner_check check (
    (is_public and owner_id is null) or (not is_public and owner_id is not null)
  )
);

create index templates_owner_idx on templates (owner_id);
create index templates_public_idx on templates (is_public) where is_public;
create unique index templates_public_slug_idx on templates (slug) where is_public;

-- ---------------------------------------------------------------------------
-- 模板項目
--   flags 沿用原本單檔版的旗標：
--     red 重要（紅字）／ f 女性用品 ／ m 男性用品 ／ pet 寵物 ／ inp 自填欄
-- ---------------------------------------------------------------------------
create table template_items (
  id          uuid primary key default gen_random_uuid(),
  template_id uuid not null references templates (id) on delete cascade,
  title       text not null default '',
  note        text,
  flags       jsonb not null default '{}'::jsonb,
  sort_order  integer not null default 0
);

create index template_items_template_idx on template_items (template_id, sort_order);

-- ---------------------------------------------------------------------------
-- 旅行清單（每次旅行一份，例如「成都旅遊」「遼寧旅遊」）
--   prefs: { pet, tab, vMode, vSex, hideSkip, todoOnly }
-- ---------------------------------------------------------------------------
create table trips (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  destination text,
  depart_date date,
  memo        text,
  prefs       jsonb not null default '{}'::jsonb,
  archived    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index trips_owner_idx on trips (owner_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 清單使用了哪些模板
--   這裡只存參照，不複製模板內容。
--   因此之後在模板編輯介面改動模板，所有引用它的清單都會跟著變動。
-- ---------------------------------------------------------------------------
create table trip_templates (
  trip_id     uuid not null references trips (id) on delete cascade,
  template_id uuid not null references templates (id) on delete cascade,
  sort_order  integer not null default 0,
  primary key (trip_id, template_id)
);

create index trip_templates_trip_idx on trip_templates (trip_id, sort_order);

-- ---------------------------------------------------------------------------
-- 每份清單對每個模板項目的狀態
--   status: 0 未勾選 ／ 1 已完成 ／ 2 這項不需要
--   prev_status: 標成「不需要」之前的狀態，用來復原
--   value: flags.inp 自填欄的文字內容
-- ---------------------------------------------------------------------------
create table trip_item_states (
  trip_id     uuid not null references trips (id) on delete cascade,
  item_id     uuid not null references template_items (id) on delete cascade,
  status      smallint not null default 0 check (status between 0 and 2),
  prev_status smallint,
  value       text,
  updated_at  timestamptz not null default now(),
  primary key (trip_id, item_id)
);

create index trip_item_states_trip_idx on trip_item_states (trip_id);

-- ---------------------------------------------------------------------------
-- 清單內臨時新增的項目（只屬於這份清單，不會回寫模板）
-- ---------------------------------------------------------------------------
create table trip_custom_items (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references trips (id) on delete cascade,
  template_id uuid not null references templates (id) on delete cascade,
  title       text not null default '',
  status      smallint not null default 0 check (status between 0 and 2),
  prev_status smallint,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index trip_custom_items_trip_idx on trip_custom_items (trip_id, template_id, sort_order);

-- ---------------------------------------------------------------------------
-- Row Level Security
--   前端只帶公開的 anon key，實際權限完全由以下規則決定。
-- ---------------------------------------------------------------------------
alter table templates         enable row level security;
alter table template_items    enable row level security;
alter table trips             enable row level security;
alter table trip_templates    enable row level security;
alter table trip_item_states  enable row level security;
alter table trip_custom_items enable row level security;

-- 模板：公用的大家都讀得到，自己的只有自己讀得到
create policy templates_select on templates
  for select using (is_public or owner_id = auth.uid());

-- 只能新增自己的模板（is_public 必須為 false，由上面的 constraint 一起把關）
create policy templates_insert on templates
  for insert with check (owner_id = auth.uid() and not is_public);

create policy templates_update on templates
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy templates_delete on templates
  for delete using (owner_id = auth.uid());

-- 模板項目：跟著所屬模板的權限走。公用模板 owner_id 為 null，因此改不動 → 唯讀。
create policy template_items_select on template_items
  for select using (
    exists (
      select 1 from templates t
      where t.id = template_items.template_id
        and (t.is_public or t.owner_id = auth.uid())
    )
  );

create policy template_items_write on template_items
  for all using (
    exists (
      select 1 from templates t
      where t.id = template_items.template_id and t.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from templates t
      where t.id = template_items.template_id and t.owner_id = auth.uid()
    )
  );

-- 清單：只有本人
create policy trips_all on trips
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- 以下三張表都以所屬 trip 的 owner 判定
create policy trip_templates_all on trip_templates
  for all using (
    exists (select 1 from trips t where t.id = trip_templates.trip_id and t.owner_id = auth.uid())
  ) with check (
    exists (select 1 from trips t where t.id = trip_templates.trip_id and t.owner_id = auth.uid())
  );

create policy trip_item_states_all on trip_item_states
  for all using (
    exists (select 1 from trips t where t.id = trip_item_states.trip_id and t.owner_id = auth.uid())
  ) with check (
    exists (select 1 from trips t where t.id = trip_item_states.trip_id and t.owner_id = auth.uid())
  );

create policy trip_custom_items_all on trip_custom_items
  for all using (
    exists (select 1 from trips t where t.id = trip_custom_items.trip_id and t.owner_id = auth.uid())
  ) with check (
    exists (select 1 from trips t where t.id = trip_custom_items.trip_id and t.owner_id = auth.uid())
  );
