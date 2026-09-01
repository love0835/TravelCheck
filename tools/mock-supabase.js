// -----------------------------------------------------------------------------
// 只給本機測試用的 Supabase 假替身（dev-test.html 透過 import map 換進來）。
// 實作了 app 真正用到的那一小塊 API，資料存在 localStorage，
// 並且照著 db/schema.sql 的 RLS 規則與 on delete cascade 行為過濾。
// 正式站不會載到這支檔案。
// -----------------------------------------------------------------------------
const LS = "mock_sb_db_v1";
const SESS = "mock_sb_session_v1";

const PK = {
  templates: ["id"],
  template_items: ["id"],
  trips: ["id"],
  trip_templates: ["trip_id", "template_id"],
  trip_item_states: ["trip_id", "item_id"],
  trip_custom_items: ["id"],
};

// 對應 db/schema.sql 裡各欄位的 default，缺了會讓 .eq("archived", false) 之類的查詢失準
const DEFAULTS = {
  templates: { owner_id: null, is_public: false, slug: null, icon: null, kind: "item",
    hint: null, hot: false, seq: false, default_on: true, sort_order: 0, copied_from: null },
  template_items: { title: "", note: null, flags: {}, sort_order: 0 },
  trips: { name: "", destination: null, depart_date: null, memo: null, prefs: {},
    archived: false, updated_at: null },
  trip_templates: { sort_order: 0 },
  trip_item_states: { status: 0, prev_status: null, value: null, updated_at: null },
  trip_custom_items: { title: "", status: 0, prev_status: null, sort_order: 0 },
};

const uuid = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

let db = load();
let session = loadSession();
const listeners = [];

function load() {
  try {
    const raw = localStorage.getItem(LS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    users: [],
    templates: [],
    template_items: [],
    trips: [],
    trip_templates: [],
    trip_item_states: [],
    trip_custom_items: [],
  };
}
function save() {
  localStorage.setItem(LS, JSON.stringify(db));
}
function loadSession() {
  try {
    const raw = localStorage.getItem(SESS);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
function setSession(s) {
  session = s;
  if (s) localStorage.setItem(SESS, JSON.stringify(s));
  else localStorage.removeItem(SESS);
  listeners.forEach((cb) => cb(s ? "SIGNED_IN" : "SIGNED_OUT", s));
}

const uid = () => session?.user?.id || null;

/* ------------------------------ 種子資料 --------------------------------- */
export async function seedPublicTemplates(seed) {
  if (db.templates.some((t) => t.is_public)) return;
  seed.forEach((s) => {
    const t = {
      id: uuid(), owner_id: null, is_public: true, slug: s.slug, name: s.name,
      icon: s.icon, kind: s.kind, hint: s.hint, hot: s.hot, seq: s.seq,
      default_on: s.default_on, sort_order: s.sort_order, copied_from: null,
      created_at: new Date().toISOString(),
    };
    db.templates.push(t);
    s.items.forEach((it) =>
      db.template_items.push({
        id: uuid(), template_id: t.id, title: it.title, note: it.note,
        flags: it.flags, sort_order: it.sort_order,
      }),
    );
  });
  save();
}

/* -------------------------- RLS（可見範圍）------------------------------- */
function visible(table, row) {
  const me = uid();
  if (!me) return false;
  if (table === "templates") return row.is_public || row.owner_id === me;
  if (table === "template_items") {
    const t = db.templates.find((x) => x.id === row.template_id);
    return !!t && (t.is_public || t.owner_id === me);
  }
  if (table === "trips") return row.owner_id === me;
  const trip = db.trips.find((x) => x.id === row.trip_id);
  return !!trip && trip.owner_id === me;
}

function writable(table, row) {
  const me = uid();
  if (!me) return false;
  if (table === "templates") return row.owner_id === me && !row.is_public;
  if (table === "template_items") {
    const t = db.templates.find((x) => x.id === row.template_id);
    return !!t && t.owner_id === me;
  }
  return visible(table, row);
}

/* ------------------------------ 連鎖刪除 --------------------------------- */
function cascadeDelete(table, row) {
  if (table === "templates") {
    db.template_items.filter((i) => i.template_id === row.id).forEach((i) => cascadeDelete("template_items", i));
    db.template_items = db.template_items.filter((i) => i.template_id !== row.id);
    db.trip_templates = db.trip_templates.filter((l) => l.template_id !== row.id);
    db.trip_custom_items = db.trip_custom_items.filter((c) => c.template_id !== row.id);
  } else if (table === "template_items") {
    db.trip_item_states = db.trip_item_states.filter((s) => s.item_id !== row.id);
  } else if (table === "trips") {
    db.trip_templates = db.trip_templates.filter((l) => l.trip_id !== row.id);
    db.trip_item_states = db.trip_item_states.filter((s) => s.trip_id !== row.id);
    db.trip_custom_items = db.trip_custom_items.filter((c) => c.trip_id !== row.id);
  }
}

/* ----------------------------- 查詢建構器 -------------------------------- */
class Q {
  constructor(table) {
    this.table = table;
    this.op = "select";
    this.filters = [];
    this.orders = [];
    this._limit = null;
    this.payload = null;
    this.wantRows = false;
  }
  select() { if (this.op === "select") this.wantRows = true; else this.wantRows = true; return this; }
  insert(rows) { this.op = "insert"; this.payload = Array.isArray(rows) ? rows : [rows]; return this; }
  upsert(rows) { this.op = "upsert"; this.payload = Array.isArray(rows) ? rows : [rows]; return this; }
  update(patch) { this.op = "update"; this.payload = patch; return this; }
  delete() { this.op = "delete"; return this; }
  eq(col, v) { this.filters.push((r) => r[col] === v); return this; }
  in(col, list) { this.filters.push((r) => list.includes(r[col])); return this; }
  order(col, opt) { this.orders.push([col, opt?.ascending === false ? -1 : 1]); return this; }
  limit(n) { this._limit = n; return this; }

  match(r) { return this.filters.every((f) => f(r)); }

  run() {
    const t = this.table;
    if (!uid()) return { data: null, error: { message: "not authenticated" } };
    try {
      if (this.op === "select") {
        let rows = db[t].filter((r) => visible(t, r) && this.match(r));
        this.orders.forEach(([col, dir]) => {
          rows = rows.slice().sort((a, b) => {
            const x = a[col], y = b[col];
            if (x === y) return 0;
            if (x === null || x === undefined) return 1;
            if (y === null || y === undefined) return -1;
            return x > y ? dir : -dir;
          });
        });
        if (this._limit) rows = rows.slice(0, this._limit);
        return { data: JSON.parse(JSON.stringify(rows)), error: null };
      }

      if (this.op === "insert" || this.op === "upsert") {
        const out = [];
        for (const raw of this.payload) {
          const row = { ...DEFAULTS[t], id: uuid(), created_at: new Date().toISOString(), ...raw };
          if (t === "templates") {
            row.is_public = !!row.is_public;
            row.owner_id = row.owner_id ?? uid();
            row.hot = !!row.hot; row.seq = !!row.seq;
            row.default_on = row.default_on !== false;
            row.sort_order = row.sort_order ?? 0;
          }
          if (t === "template_items") row.flags = row.flags || {};
          if (this.op === "upsert") {
            const keys = PK[t];
            const i = db[t].findIndex((r) => keys.every((k) => r[k] === row[k]));
            if (i >= 0) {
              if (!writable(t, db[t][i])) return { data: null, error: { message: "row level security" } };
              db[t][i] = { ...db[t][i], ...row };
              out.push(db[t][i]);
              continue;
            }
          }
          if (!writable(t, row)) return { data: null, error: { message: "new row violates row-level security policy" } };
          db[t].push(row);
          out.push(row);
        }
        save();
        return { data: JSON.parse(JSON.stringify(out)), error: null };
      }

      if (this.op === "update") {
        const out = [];
        db[t].forEach((r, i) => {
          if (!this.match(r)) return;
          if (!writable(t, r)) return;
          db[t][i] = { ...r, ...this.payload };
          out.push(db[t][i]);
        });
        save();
        return { data: JSON.parse(JSON.stringify(out)), error: null };
      }

      if (this.op === "delete") {
        const gone = db[t].filter((r) => this.match(r) && writable(t, r));
        gone.forEach((r) => cascadeDelete(t, r));
        db[t] = db[t].filter((r) => !gone.includes(r));
        save();
        return { data: JSON.parse(JSON.stringify(gone)), error: null };
      }
    } catch (e) {
      return { data: null, error: { message: String(e.message || e) } };
    }
  }

  then(resolve, reject) {
    return Promise.resolve().then(() => this.run()).then(resolve, reject);
  }
}

/* ------------------------------ client ---------------------------------- */
export function createClient() {
  return {
    from: (table) => new Q(table),
    auth: {
      async getSession() { return { data: { session }, error: null }; },
      async getUser() { return { data: { user: session?.user || null }, error: null }; },
      async signUp({ email, password }) {
        if (db.users.some((u) => u.email === email))
          return { data: {}, error: { message: "User already registered" } };
        if (String(password).length < 6)
          return { data: {}, error: { message: "Password should be at least 6 characters" } };
        const user = { id: uuid(), email, password };
        db.users.push(user);
        save();
        const s = { user: { id: user.id, email } };
        setSession(s);
        return { data: { session: s, user: s.user }, error: null };
      },
      async signInWithPassword({ email, password }) {
        const u = db.users.find((x) => x.email === email && x.password === password);
        if (!u) return { data: {}, error: { message: "Invalid login credentials" } };
        const s = { user: { id: u.id, email } };
        setSession(s);
        return { data: { session: s, user: s.user }, error: null };
      },
      async signOut() { setSession(null); return { error: null }; },
      onAuthStateChange(cb) {
        listeners.push(cb);
        return { data: { subscription: { unsubscribe() {} } } };
      },
    },
  };
}
