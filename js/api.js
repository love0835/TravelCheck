// -----------------------------------------------------------------------------
// 所有資料存取都集中在這裡。
// 清單不複製模板內容，只透過 trip_templates 參照模板，
// 因此模板一改，所有引用它的清單立刻跟著變。
// -----------------------------------------------------------------------------
import { sb } from "./supabase.js";

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export async function uid() {
  const { data } = await sb.auth.getUser();
  return data?.user?.id || null;
}

/* ------------------------------- 模板 ------------------------------------ */

// RLS 已經把可見範圍限制成「公用 + 自己的」，所以直接全撈即可。
export async function fetchTemplates() {
  return unwrap(
    await sb
      .from("templates")
      .select("*")
      .order("is_public", { ascending: false })
      .order("sort_order")
      .order("created_at"),
  );
}

export async function fetchTemplateItems() {
  return unwrap(await sb.from("template_items").select("*").order("sort_order"));
}

export async function createTemplate(patch) {
  const owner = await uid();
  const rows = unwrap(
    await sb
      .from("templates")
      .insert({ ...patch, owner_id: owner, is_public: false })
      .select(),
  );
  return rows[0];
}

// 把一個模板（通常是公用模板）複製成自己的，之後可自由增刪
export async function copyTemplate(tpl, items) {
  const copy = await createTemplate({
    name: tpl.is_public ? tpl.name : `${tpl.name}（副本）`,
    icon: tpl.icon,
    kind: tpl.kind,
    hint: tpl.hint,
    hot: tpl.hot,
    seq: tpl.seq,
    default_on: tpl.default_on,
    sort_order: tpl.sort_order,
    copied_from: tpl.id,
  });
  const itemMap = {};
  if (items.length) {
    const rows = unwrap(
      await sb
        .from("template_items")
        .insert(
          items.map((it, i) => ({
            template_id: copy.id,
            title: it.title,
            note: it.note,
            flags: it.flags,
            sort_order: i,
          })),
        )
        .select(),
    );
    // 依 sort_order 對回原本的項目，換模板時才能把勾選一起搬過去
    rows
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .forEach((r, i) => {
        if (items[i]) itemMap[items[i].id] = r.id;
      });
  }
  return { template: copy, itemMap };
}

export async function updateTemplate(id, patch) {
  return unwrap(await sb.from("templates").update(patch).eq("id", id).select())[0];
}

export async function deleteTemplate(id) {
  unwrap(await sb.from("templates").delete().eq("id", id));
}

export async function createItem(templateId, patch) {
  return unwrap(
    await sb
      .from("template_items")
      .insert({ template_id: templateId, ...patch })
      .select(),
  )[0];
}

export async function updateItem(id, patch) {
  unwrap(await sb.from("template_items").update(patch).eq("id", id));
}

export async function deleteItem(id) {
  unwrap(await sb.from("template_items").delete().eq("id", id));
}

export async function reorderItems(ids) {
  // 逐筆更新排序（項目數量不多，這樣最單純也最不會出錯）
  await Promise.all(ids.map((id, i) => sb.from("template_items").update({ sort_order: i }).eq("id", id)));
}

/* ------------------------------- 清單 ------------------------------------ */

export async function fetchTrips() {
  return unwrap(
    await sb.from("trips").select("*").eq("archived", false).order("created_at", { ascending: false }),
  );
}

export async function fetchTripTemplates(tripIds) {
  if (tripIds && !tripIds.length) return [];
  let q = sb.from("trip_templates").select("*").order("sort_order");
  if (tripIds) q = q.in("trip_id", tripIds);
  return unwrap(await q);
}

export async function fetchItemStates(tripId) {
  let q = sb.from("trip_item_states").select("*");
  if (tripId) q = q.eq("trip_id", tripId);
  return unwrap(await q);
}

export async function fetchCustomItems(tripId) {
  let q = sb.from("trip_custom_items").select("*").order("sort_order");
  if (tripId) q = q.eq("trip_id", tripId);
  return unwrap(await q);
}

export async function createTrip({ name, destination, depart_date, templateIds }) {
  const owner = await uid();
  const trip = unwrap(
    await sb
      .from("trips")
      .insert({
        owner_id: owner,
        name,
        destination: destination || null,
        depart_date: depart_date || null,
        prefs: {},
      })
      .select(),
  )[0];
  await setTripTemplates(trip.id, templateIds);
  return trip;
}

export async function setTripTemplates(tripId, ids) {
  unwrap(await sb.from("trip_templates").delete().eq("trip_id", tripId));
  if (ids.length) {
    unwrap(
      await sb
        .from("trip_templates")
        .insert(ids.map((template_id, i) => ({ trip_id: tripId, template_id, sort_order: i }))),
    );
  }
}

// 把「目前使用 oldId 這個模板」的清單改成使用 newId。
// RLS 只讓你動到自己的清單，所以不會影響別人。
export async function swapTemplate(oldId, newId, itemMap = {}) {
  const links = unwrap(await sb.from("trip_templates").select("*").eq("template_id", oldId));
  for (const l of links) {
    // 把這份清單原本的勾選搬到副本的對應項目上
    const olds = Object.keys(itemMap);
    if (olds.length) {
      const states = unwrap(
        await sb.from("trip_item_states").select("*").eq("trip_id", l.trip_id).in("item_id", olds),
      );
      const moved = states
        .filter((s) => itemMap[s.item_id])
        .map((s) => ({
          item_id: itemMap[s.item_id],
          status: s.status,
          prev_status: s.prev_status,
          value: s.value,
        }));
      await putItemStates(l.trip_id, moved);
    }
    // 自己新增的項目也要跟著掛到副本底下
    unwrap(
      await sb.from("trip_custom_items").update({ template_id: newId })
        .eq("trip_id", l.trip_id).eq("template_id", oldId),
    );

    // 已經有新模板的清單只要移除舊的那筆，避免主鍵撞在一起
    const dup = unwrap(
      await sb.from("trip_templates").select("trip_id").eq("trip_id", l.trip_id).eq("template_id", newId),
    );
    if (dup.length) {
      unwrap(await sb.from("trip_templates").delete().eq("trip_id", l.trip_id).eq("template_id", oldId));
    } else {
      unwrap(
        await sb.from("trip_templates").update({ template_id: newId })
          .eq("trip_id", l.trip_id).eq("template_id", oldId),
      );
    }
  }
  return links.length;
}

export async function updateTrip(id, patch) {
  unwrap(await sb.from("trips").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id));
}

export async function deleteTrip(id) {
  unwrap(await sb.from("trips").delete().eq("id", id));
}

export async function getTrip(id) {
  const rows = unwrap(await sb.from("trips").select("*").eq("id", id).limit(1));
  return rows[0] || null;
}

// 清空這份清單的所有勾選與自訂項目
export async function resetTrip(tripId) {
  unwrap(await sb.from("trip_item_states").delete().eq("trip_id", tripId));
  unwrap(await sb.from("trip_custom_items").delete().eq("trip_id", tripId));
  await updateTrip(tripId, { memo: null, prefs: {} });
}

/* --------------------------- 勾選狀態的寫入 -------------------------------- */

export async function putItemState(tripId, itemId, row) {
  unwrap(
    await sb.from("trip_item_states").upsert(
      {
        trip_id: tripId,
        item_id: itemId,
        status: row.status,
        prev_status: row.prev_status ?? null,
        value: row.value ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "trip_id,item_id" },
    ),
  );
}

export async function putItemStates(tripId, rows) {
  if (!rows.length) return;
  unwrap(
    await sb.from("trip_item_states").upsert(
      rows.map((r) => ({
        trip_id: tripId,
        item_id: r.item_id,
        status: r.status,
        prev_status: r.prev_status ?? null,
        value: r.value ?? null,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "trip_id,item_id" },
    ),
  );
}

export async function createCustomItem(tripId, templateId, sortOrder) {
  return unwrap(
    await sb
      .from("trip_custom_items")
      .insert({ trip_id: tripId, template_id: templateId, title: "", sort_order: sortOrder })
      .select(),
  )[0];
}

export async function updateCustomItem(id, patch) {
  unwrap(await sb.from("trip_custom_items").update(patch).eq("id", id));
}

export async function deleteCustomItem(id) {
  unwrap(await sb.from("trip_custom_items").delete().eq("id", id));
}
