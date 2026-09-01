// -----------------------------------------------------------------------------
// 我的旅行清單（總覽）、新增清單、整包匯出與匯入。
// -----------------------------------------------------------------------------
import * as api from "./api.js";
import * as store from "./store.js";
import { errText } from "./supabase.js";

const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

let cache = null; // 最近一次載入的整包資料，匯出時直接用

/* ---------------------------- 進度計算 ----------------------------------- */
// 規則與清單內頁一致：不需要的不算、性別與寵物過濾掉的不算、
// 空的自填欄與空的自訂項目不算。
function progressOf(trip, tplIds, itemsByTpl, statesByTrip, customsByTrip) {
  const prefs = trip.prefs || {};
  const pet = !!prefs.pet;
  const states = statesByTrip.get(trip.id) || new Map();
  let done = 0, total = 0;
  tplIds.forEach((tid) => {
    (itemsByTpl.get(tid) || []).forEach((it) => {
      const f = it.flags || {};
      const r = states.get(it.id);
      const s = r ? r.status : 0;
      if (s === 2) return;
      if (!pet && f.pet) return;
      if ((prefs.vSex === "male" && f.f) || (prefs.vSex === "female" && f.m)) return;
      if (f.inp && !((r && r.value) || "").trim()) return;
      total++;
      if (s === 1) done++;
    });
  });
  (customsByTrip.get(trip.id) || []).forEach((cu) => {
    if (!tplIds.includes(cu.template_id)) return;
    if (cu.status === 2 || !String(cu.title || "").trim()) return;
    total++;
    if (cu.status === 1) done++;
  });
  return { done, total };
}

/* ---------------------------- 總覽畫面 ----------------------------------- */

export async function render() {
  const grid = $("tripGrid");
  grid.innerHTML = '<p class="msg">載入中⋯⋯</p>';
  $("tripEmpty").hidden = true;

  const [trips, templates, items, links, states, customs] = await Promise.all([
    api.fetchTrips(),
    api.fetchTemplates(),
    api.fetchTemplateItems(),
    api.fetchTripTemplates(null),
    api.fetchItemStates(null),
    api.fetchCustomItems(null),
  ]);

  const byTpl = new Map(templates.map((t) => [t.id, t]));
  const itemsByTpl = new Map();
  items.forEach((it) => {
    if (!itemsByTpl.has(it.template_id)) itemsByTpl.set(it.template_id, []);
    itemsByTpl.get(it.template_id).push(it);
  });
  const linksByTrip = new Map();
  links.forEach((l) => {
    if (!linksByTrip.has(l.trip_id)) linksByTrip.set(l.trip_id, []);
    linksByTrip.get(l.trip_id).push(l.template_id);
  });
  const statesByTrip = new Map();
  states.forEach((r) => {
    if (!statesByTrip.has(r.trip_id)) statesByTrip.set(r.trip_id, new Map());
    statesByTrip.get(r.trip_id).set(r.item_id, r);
  });
  const customsByTrip = new Map();
  customs.forEach((c) => {
    if (!customsByTrip.has(c.trip_id)) customsByTrip.set(c.trip_id, []);
    customsByTrip.get(c.trip_id).push(c);
  });

  cache = { trips, templates, items, links, states, customs };

  grid.innerHTML = "";
  $("tripEmpty").hidden = trips.length > 0;

  trips.forEach((trip) => {
    const tplIds = linksByTrip.get(trip.id) || [];
    const { done, total } = progressOf(trip, tplIds, itemsByTpl, statesByTrip, customsByTrip);
    const pct = total ? ((done / total) * 100).toFixed(1) : 0;
    const names = tplIds.map((id) => byTpl.get(id)?.name).filter(Boolean);
    const bits = [trip.destination, trip.depart_date].filter(Boolean).join("　");

    const card = document.createElement("button");
    card.className = "tripcard";
    card.dataset.id = trip.id;
    card.innerHTML =
      "<h3>" + esc(trip.name) + "</h3>" +
      (bits ? '<div class="sub">' + esc(bits) + "</div>" : "") +
      '<div class="pbar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="pnum">已完成 ' + done + " ／ 需要 " + total + "</div>" +
      '<div class="tmpl">' +
      (names.length ? esc(names.slice(0, 4).join("、")) + (names.length > 4 ? " 等 " + names.length + " 個模板" : "") : "尚未選任何模板") +
      "</div>";
    card.onclick = () => { location.hash = "#/trip/" + trip.id; };
    grid.appendChild(card);
  });
}

/* ---------------------------- 新增清單 ----------------------------------- */

export async function renderNew() {
  const box = $("newPick");
  box.innerHTML = '<p class="msg">載入模板⋯⋯</p>';
  $("newName").value = "";
  $("newDest").value = "";
  $("newDate").value = "";
  $("newMsg").textContent = "";

  const templates = await api.fetchTemplates();
  const items = await api.fetchTemplateItems();
  const count = new Map();
  items.forEach((it) => count.set(it.template_id, (count.get(it.template_id) || 0) + 1));

  const mine = templates.filter((t) => !t.is_public);
  const pub = templates.filter((t) => t.is_public);

  const row = (t) =>
    '<li><label><input type="checkbox" value="' + t.id + '"' + (t.default_on ? " checked" : "") + ">" +
    '<span class="txt"><span class="tname">' + esc(t.name) + "</span>" +
    '<span class="tmeta">' + (t.kind === "todo" ? "待辦" : "物品") + "　" +
    (count.get(t.id) || 0) + " 項</span></span></label></li>";

  const group = (title, list, hint) =>
    !list.length ? "" :
    '<div class="tpickgroup"><h3>' + title + '<span class="n">' + list.length + " 個</span></h3>" +
    (hint ? '<p class="ghint">' + hint + "</p>" : "") +
    '<ul class="tpicklist">' + list.map(row).join("") + "</ul></div>";

  box.innerHTML =
    '<div class="pickbar"><button class="btn ghost" data-pick="all">全選</button>' +
    '<button class="btn ghost" data-pick="none">全不選</button>' +
    '<span id="pickCount"></span></div>' +
    group("我的模板", mine) +
    group("公用模板", pub, "場景類（高山、海邊、滑雪、露營）與寵物類預設不勾，需要再自己加。");

  const boxes = () => [...box.querySelectorAll('input[type=checkbox]')];
  const paint = () => {
    const n = boxes().filter((b) => b.checked).length;
    $("pickCount").textContent = "已選 " + n + " 個模板";
  };
  box.addEventListener("change", paint);
  box.querySelector('[data-pick="all"]').onclick = () => { boxes().forEach((b) => (b.checked = true)); paint(); };
  box.querySelector('[data-pick="none"]').onclick = () => { boxes().forEach((b) => (b.checked = false)); paint(); };
  paint();
}

async function createTrip() {
  const name = $("newName").value.trim();
  const msg = $("newMsg");
  if (!name) {
    msg.className = "msg err";
    msg.textContent = "請先給這份清單一個名字。";
    $("newName").focus();
    return;
  }
  const ids = [...$("newPick").querySelectorAll("input:checked")].map((i) => i.value);
  const btn = $("btnCreateTrip");
  btn.disabled = true;
  msg.className = "msg";
  msg.textContent = "建立中⋯⋯";
  try {
    const trip = await api.createTrip({
      name,
      destination: $("newDest").value.trim(),
      depart_date: $("newDate").value,
      templateIds: ids,
    });
    location.hash = "#/trip/" + trip.id;
  } catch (e) {
    msg.className = "msg err";
    msg.textContent = errText(e);
  } finally {
    btn.disabled = false;
  }
}

/* ---------------------------- 匯出與匯入 --------------------------------- */

async function exportAll() {
  if (!cache) await render();
  const mine = cache.templates.filter((t) => !t.is_public);
  const mineIds = new Set(mine.map((t) => t.id));
  const payload = {
    format: "travelcheck-backup",
    version: 1,
    exported_at: new Date().toISOString(),
    templates: mine.map((t) => ({
      id: t.id, name: t.name, icon: t.icon, kind: t.kind, hint: t.hint,
      hot: t.hot, seq: t.seq, default_on: t.default_on,
      items: cache.items
        .filter((i) => i.template_id === t.id)
        .map((i) => ({ id: i.id, title: i.title, note: i.note, flags: i.flags, sort_order: i.sort_order })),
    })),
    public_slugs: Object.fromEntries(
      cache.templates.filter((t) => t.is_public).map((t) => [t.id, t.slug]),
    ),
    trips: cache.trips.map((tr) => ({
      name: tr.name, destination: tr.destination, depart_date: tr.depart_date,
      memo: tr.memo, prefs: tr.prefs,
      template_ids: cache.links.filter((l) => l.trip_id === tr.id).sort((a, b) => a.sort_order - b.sort_order).map((l) => l.template_id),
      states: cache.states.filter((s) => s.trip_id === tr.id).map((s) => ({
        item_id: s.item_id, status: s.status, prev_status: s.prev_status, value: s.value,
      })),
      customs: cache.customs.filter((c) => c.trip_id === tr.id).map((c) => ({
        template_id: c.template_id, title: c.title, status: c.status, sort_order: c.sort_order,
      })),
    })),
    _mine: [...mineIds],
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "travelcheck-" + new Date().toISOString().slice(0, 10) + ".json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  say("備份檔已下載。");
}

function say(text, isErr) {
  const el = $("tripsMsg");
  el.className = isErr ? "msg err" : "msg";
  el.textContent = text;
  if (!isErr) setTimeout(() => { if (el.textContent === text) el.textContent = ""; }, 5000);
}

// 匯入一律建立「新的」模板與清單，不覆蓋現有資料，出錯也不會弄壞原本的東西。
async function importAll(file) {
  let data;
  try {
    data = JSON.parse(await file.text());
  } catch (e) {
    say("這個檔案不是有效的 JSON。", true);
    return;
  }
  if (data.format !== "travelcheck-backup") {
    say("這不是旅行清單的備份檔。", true);
    return;
  }
  say("匯入中⋯⋯");
  try {
    const templates = await api.fetchTemplates();
    const bySlug = new Map(templates.filter((t) => t.is_public).map((t) => [t.slug, t.id]));

    // 舊 id → 新 id
    const tplMap = new Map();
    const itemMap = new Map();
    for (const [oldId, slug] of Object.entries(data.public_slugs || {})) {
      if (bySlug.has(slug)) tplMap.set(oldId, bySlug.get(slug));
    }
    for (const t of data.templates || []) {
      const created = await api.createTemplate({
        name: t.name + "（匯入）", icon: t.icon, kind: t.kind, hint: t.hint,
        hot: !!t.hot, seq: !!t.seq, default_on: t.default_on !== false,
      });
      tplMap.set(t.id, created.id);
      for (const [i, it] of (t.items || []).entries()) {
        const row = await api.createItem(created.id, {
          title: it.title, note: it.note, flags: it.flags || {}, sort_order: it.sort_order ?? i,
        });
        itemMap.set(it.id, row.id);
      }
    }

    for (const tr of data.trips || []) {
      const ids = (tr.template_ids || []).map((id) => tplMap.get(id)).filter(Boolean);
      const trip = await api.createTrip({
        name: tr.name, destination: tr.destination, depart_date: tr.depart_date, templateIds: ids,
      });
      await api.updateTrip(trip.id, { memo: tr.memo || null, prefs: tr.prefs || {} });
      const rows = (tr.states || [])
        .map((s) => ({
          item_id: itemMap.get(s.item_id) || s.item_id,
          status: s.status, prev_status: s.prev_status, value: s.value,
        }))
        // 只送出這個帳號真的看得到的項目，避免整批被外鍵擋掉
        .filter((s) => s.item_id);
      for (let i = 0; i < rows.length; i += 200) {
        try {
          await api.putItemStates(trip.id, rows.slice(i, i + 200));
        } catch (e) {
          /* 對不到的項目略過，不影響其餘資料 */
        }
      }
      for (const cu of tr.customs || []) {
        const tid = tplMap.get(cu.template_id);
        if (!tid) continue;
        const row = await api.createCustomItem(trip.id, tid, cu.sort_order || 0);
        await api.updateCustomItem(row.id, { title: cu.title, status: cu.status });
      }
    }
    await render();
    say("匯入完成，已建立為新的清單與模板。");
  } catch (e) {
    say("匯入失敗：" + errText(e), true);
  }
}

/* ------------------------------ 事件綁定 --------------------------------- */

let wired = false;
export function wire() {
  if (wired) return;
  wired = true;
  $("btnNewTrip").onclick = () => { location.hash = "#/trips/new"; };
  $("btnCreateTrip").onclick = createTrip;
  $("btnCancelNew").onclick = () => { location.hash = "#/trips"; };
  $("newName").addEventListener("keydown", (e) => { if (e.key === "Enter") createTrip(); });
  $("btnExportAll").onclick = exportAll;
  $("btnImportAll").onclick = () => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "application/json,.json";
    inp.onchange = () => inp.files[0] && importAll(inp.files[0]);
    inp.click();
  };
}

export function invalidate() {
  cache = null;
}
