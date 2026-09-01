// -----------------------------------------------------------------------------
// 清單內頁。畫面與互動沿用原本的單檔版，資料來源換成模板 + 資料庫。
// -----------------------------------------------------------------------------
import * as api from "./api.js";
import { icon, bico, EYE } from "./icons.js";
import * as store from "./store.js";
import { MINSKIP } from "./minskip.js";

const $ = (id) => document.getElementById(id);

let trip = null;          // 這份清單
let sections = [];        // [{id, ic, kind, t, hint, hot, seq, items:[], customs:[]}]
let ST = new Map();       // id -> {s 狀態, p 先前狀態, v 自填文字, c 是否為自訂項目}
let prefs = {};           // {pet, tab, vMode, vSex, hideSkip, todoOnly}
let allTemplates = [];    // 模板挑選彈窗用
let usedIds = [];         // 這份清單目前使用的模板 id

let tab = "all", todoOnly = false, hideSkip = false, lastCount = "0 / 0";
let jumpDirty = true, lastFocus = null, wired = false;

const listEl = () => $("list");
const st = (id) => ST.get(id) || { s: 0, p: null, v: "", c: false };

/* ------------------------------ 資料存取 -------------------------------- */

function writeState(id) {
  const r = st(id);
  if (r.c) {
    const cu = findCustom(id);
    store.push("custom:" + id, {
      t: "custom", id, title: cu ? cu.title : "", status: r.s, prev: r.p,
    });
  } else {
    store.push("state:" + id, {
      t: "state", tripId: trip.id, itemId: id, status: r.s, prev: r.p, value: r.v || null,
    });
  }
}

function setState(id, patch) {
  ST.set(id, { ...st(id), ...patch });
  writeState(id);
}

function findCustom(id) {
  for (const sec of sections) {
    const c = sec.customs.find((x) => x.id === id);
    if (c) return c;
  }
  return null;
}

function patchTrip(patch) {
  Object.assign(trip, patch);
  store.push("trip:" + trip.id, { t: "trip", tripId: trip.id, patch });
}

function savePrefs() {
  patchTrip({ prefs: { ...prefs } });
}

/* ------------------------------ 載入清單 -------------------------------- */

export async function load(tripId) {
  trip = await api.getTrip(tripId);
  if (!trip) return false;

  const [templates, items, links, states, customs] = await Promise.all([
    api.fetchTemplates(),
    api.fetchTemplateItems(),
    api.fetchTripTemplates([tripId]),
    api.fetchItemStates(tripId),
    api.fetchCustomItems(tripId),
  ]);

  allTemplates = templates;
  usedIds = links.map((l) => l.template_id);
  const byTpl = new Map(templates.map((t) => [t.id, t]));
  const itemsByTpl = new Map();
  items.forEach((it) => {
    if (!itemsByTpl.has(it.template_id)) itemsByTpl.set(it.template_id, []);
    itemsByTpl.get(it.template_id).push(it);
  });

  sections = links
    .map((l) => byTpl.get(l.template_id))
    .filter(Boolean)
    .map((t) => ({
      id: t.id,
      ic: t.icon,
      kind: t.kind || "item",
      t: t.name,
      hint: t.hint,
      hot: t.hot,
      seq: t.seq,
      items: itemsByTpl.get(t.id) || [],
      customs: customs.filter((c) => c.template_id === t.id),
    }));

  ST = new Map();
  states.forEach((r) => ST.set(r.item_id, { s: r.status, p: r.prev_status, v: r.value || "", c: false }));
  customs.forEach((r) => ST.set(r.id, { s: r.status, p: r.prev_status, v: "", c: true }));

  prefs = { ...(trip.prefs || {}) };
  tab = prefs.tab || "all";
  todoOnly = !!prefs.todoOnly;
  hideSkip = !!prefs.hideSkip;
  return true;
}

/* -------------------------------- 篩選 ---------------------------------- */

const petOn = () => !!prefs.pet;
const sexHidden = (f) =>
  (prefs.vSex === "male" && f.f) || (prefs.vSex === "female" && f.m);

/* -------------------------------- 繪製 ---------------------------------- */

export function build() {
  const el = listEl();
  el.innerHTML = "";
  sections.forEach((sec) => {
    const s = document.createElement("section");
    if (sec.hot) s.className = "hot";
    s.dataset.sec = sec.id;
    s.dataset.kind = sec.kind;
    if (sec.seq) s.dataset.seq = "1";

    const keys = sec.items.map((i) => i.id).concat(sec.customs.map((c) => c.id));
    const allSkip = keys.length > 0 && keys.every((k) => st(k).s === 2);

    s.innerHTML =
      '<h2>' + icon(sec.ic) + '<span>' + esc(sec.t) + '</span><span class="n" data-n="' + sec.id + '"></span>' +
      '<button class="secskip" data-sec="' + sec.id + '" title="整組不需要">' +
      (allSkip ? "整組復原" : EYE + '<span class="sklab">整組不需要</span>') + "</button></h2>" +
      (sec.hint ? '<p class="hint">' + sec.hint + "</p>" : "");

    const ul = document.createElement("ul");
    sec.items.forEach((it, i) => {
      const f = it.flags || {};
      const r = st(it.id);
      const li = document.createElement("li");
      li.dataset.key = it.id;
      li.dataset.s = r.s;
      if (f.pet) li.dataset.pet = "1";
      if (f.f) li.dataset.f = "1";
      if (f.m) li.dataset.m = "1";
      const seq = sec.seq ? '<span class="step">' + (i + 1) + "</span> " : "";
      const body = f.inp
        ? '<input class="fill" type="text" data-v="' + it.id + '" placeholder="自行填寫" value="' + attr(r.v) + '">'
        : seq + (f.red ? '<span class="imp">' + esc(it.title) + "</span>" : esc(it.title)) +
          (it.note ? '<span class="note">' + esc(it.note) + "</span>" : "");
      li.innerHTML =
        '<label><span class="box"></span><span class="txt">' + body + "</span></label>" +
        '<button class="skipbtn" title="這項不需要">' + (r.s === 2 ? "復原" : EYE) + "</button>";
      ul.appendChild(li);
    });

    sec.customs.forEach((cu) => {
      const li = document.createElement("li");
      li.dataset.key = cu.id;
      li.dataset.s = st(cu.id).s;
      li.innerHTML =
        '<label><span class="box"></span><span class="txt">' +
        '<input class="cname" data-k="' + cu.id + '" placeholder="自己新增的項目" value="' + attr(cu.title) + '"></span></label>' +
        '<button class="skipbtn cdel" data-k="' + cu.id + '" data-sec="' + sec.id + '" title="刪除這一項">✕</button>';
      ul.appendChild(li);
    });

    const add = document.createElement("li");
    add.className = "addrow";
    add.innerHTML = '<button class="addbtn" data-sec="' + sec.id + '">＋ 新增項目</button>';
    ul.appendChild(add);
    s.appendChild(ul);
    el.appendChild(s);
  });

  if (!sections.length) {
    el.innerHTML =
      '<div class="empty">這份清單還沒有選任何模板。<br>按上面的「模板」挑幾個進來。</div>';
  }
  refresh();
}

const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attr = (s) => esc(s).replace(/"/g, "&quot;");

/* ------------------------------ 進度統計 -------------------------------- */

export function refresh() {
  let done = 0, total = 0;
  sections.forEach((sec) => {
    let d = 0, t = 0;
    const inTab = tab === "all" || sec.kind === tab;
    sec.items.forEach((it) => {
      const f = it.flags || {};
      const r = st(it.id);
      if (r.s === 2) return;
      if (!petOn() && f.pet) return;
      if (sexHidden(f)) return;
      if (f.inp && !(r.v || "").trim()) return;
      t++;
      if (r.s === 1) d++;
    });
    sec.customs.forEach((cu) => {
      const r = st(cu.id);
      if (r.s === 2 || !String(cu.title || "").trim()) return;
      t++;
      if (r.s === 1) d++;
    });
    if (inTab) { done += d; total += t; }
    const n = listEl().querySelector('[data-n="' + sec.id + '"]');
    if (n) n.textContent = t ? d + " / " + t : "—";
  });
  lastCount = done + " / " + total;
  $("count").textContent = lastCount;
  $("fill").style.width = total ? ((done / total) * 100).toFixed(1) + "%" : "0%";
  applyFilter();
}

export function applyFilter() {
  const qEl = $("q");
  const q = (qEl.value || "").trim().toLowerCase();
  let found = 0;
  const el = listEl();
  el.querySelectorAll("li[data-key]").forEach((li) => {
    const v = st(li.dataset.key).s;
    const hiddenByFlag =
      (li.dataset.pet && !petOn()) ||
      (li.dataset.f && prefs.vSex === "male") ||
      (li.dataset.m && prefs.vSex === "female");
    if (q) {
      const ie = li.querySelector(".cname,.fill");
      const hit = !hiddenByFlag && (li.textContent + " " + (ie ? ie.value : "")).toLowerCase().includes(q);
      li.classList.toggle("hide", !hit);
      if (hit) found++;
    } else {
      li.classList.toggle(
        "hide",
        hiddenByFlag || (todoOnly && v === 1) || (hideSkip && v === 2) || (todoOnly && v === 2),
      );
    }
  });
  el.querySelectorAll("section").forEach((s) => {
    const all = [...s.querySelectorAll("li[data-key]")];
    const inTab = q ? true : tab === "all" || s.dataset.kind === tab;
    s.style.display = inTab && all.some((li) => !li.classList.contains("hide")) ? "" : "none";
    s.classList.toggle("allskip", all.length > 0 && all.every((li) => st(li.dataset.key).s === 2));
  });
  el.querySelectorAll("li.addrow").forEach((x) => x.classList.toggle("hide", !!q));
  el.querySelectorAll("section[data-seq]").forEach((sec) => {
    let k = 0;
    sec.querySelectorAll("li[data-key]").forEach((li) => {
      const sp = li.querySelector(".step");
      if (!sp) return;
      if (li.classList.contains("hide")) { sp.textContent = ""; return; }
      k++;
      sp.textContent = k;
    });
  });
  let nr = $("noresult");
  if (q && found === 0) {
    if (!nr) {
      nr = document.createElement("p");
      nr.id = "noresult";
      nr.className = "noresult";
      el.appendChild(nr);
    }
    nr.textContent = "找不到含有「" + qEl.value.trim() + "」的項目。";
  } else if (nr) nr.remove();
  $("count").textContent = q ? "搜尋到 " + found + " 項" : lastCount;
  jumpDirty = true;
}

/* --------------------------- 極簡模式與性別 ------------------------------ */

// 把所有「不需要」清掉，再依目前的模式重新標記（與原本單檔版行為一致）
function applyPresets() {
  const rows = [];
  sections.forEach((sec) =>
    sec.items.forEach((it) => {
      const r = st(it.id);
      const wasSkip = r.s === 2;
      let next = wasSkip ? r.p || 0 : r.s;
      let prev = wasSkip ? null : r.p;
      if (prefs.vMode === "min" && MINSKIP.includes(it.title)) {
        if (next !== 2) { prev = next || null; next = 2; }
      }
      if (next !== r.s || prev !== r.p) {
        ST.set(it.id, { ...r, s: next, p: prev });
        rows.push({ item_id: it.id, status: next, prev_status: prev, value: r.v || null });
      }
    }),
  );
  if (rows.length) store.push("bulk:" + Date.now(), { t: "states", tripId: trip.id, rows });
  if (prefs.vMode === "min") { hideSkip = true; press("fHide", true); prefs.hideSkip = true; }
  savePrefs();
  build();
}

function press(id, on) {
  $(id).setAttribute("aria-pressed", on ? "true" : "false");
}

function paintPresetBtns() {
  document.querySelectorAll("#view-trip [data-g]").forEach((b) => {
    const cur = b.dataset.g === "mode" ? prefs.vMode || "full" : prefs.vSex || "full";
    b.setAttribute("aria-pressed", b.dataset.v === cur ? "true" : "false");
  });
  document.querySelectorAll("#view-trip [data-add]").forEach((b) => {
    b.setAttribute("aria-pressed", petOn() ? "true" : "false");
    const pm = b.querySelector(".pm");
    if (pm) pm.textContent = petOn() ? "✓" : "＋";
  });
  document.querySelectorAll("#gauge [data-t]").forEach((x) =>
    x.setAttribute("aria-pressed", x.dataset.t === tab ? "true" : "false"),
  );
  press("fAll", !todoOnly);
  press("fTodo", todoOnly);
  press("fHide", hideSkip);
}

/* ------------------------------ 跳到段落 -------------------------------- */

function buildJump() {
  const jlist = $("jlist");
  jlist.innerHTML = "";
  let shown = 0;
  listEl().querySelectorAll("section").forEach((el) => {
    if (el.style.display === "none") return;
    const sec = sections.find((x) => x.id === el.dataset.sec);
    if (!sec) return;
    const n = [...el.querySelectorAll("li[data-key]")].filter((li) => {
      if (li.classList.contains("hide")) return false;
      const ie = li.querySelector(".cname,.fill");
      return !ie || ie.value.trim() !== "";
    }).length;
    if (n === 0) return;
    shown++;
    const b = document.createElement("button");
    b.className = "jitem" + (sec.hot ? " hot" : "");
    const todo = sec.kind === "todo";
    b.innerHTML =
      '<span class="jk' + (todo ? " todo" : "") + '">' + (todo ? "待辦" : "物品") + "</span>" +
      icon(sec.ic) + "<span>" + esc(sec.t.replace(/^[^｜]*｜/, "")) + "</span>" +
      '<span class="jn">' + n + "</span>";
    b.onclick = () => { closeJump(); setTimeout(() => goTo(sec.id), 120); };
    jlist.appendChild(b);
  });
  if (!shown) {
    const e = document.createElement("p");
    e.className = "noresult";
    e.style.padding = "18px 16px";
    e.textContent = "目前的篩選條件下沒有可跳轉的段落。";
    jlist.appendChild(e);
  }
}

const openJump = () => {
  if (jumpDirty) { buildJump(); jumpDirty = false; }
  $("jumpOv").hidden = false;
  document.body.classList.add("noscroll");
};
const closeJump = () => {
  $("jumpOv").hidden = true;
  document.body.classList.remove("noscroll");
};

function goTo(id) {
  const el = listEl().querySelector('section[data-sec="' + id + '"]');
  if (!el) return;
  const off = $("gauge").offsetHeight + 10;
  const y = el.getBoundingClientRect().top + window.pageYOffset - off;
  window.scrollTo({ top: y < 0 ? 0 : y, behavior: "smooth" });
}

/* ---------------------------- 模板挑選彈窗 ------------------------------- */

function openTmplPick() {
  const box = $("tmplPick");
  const mine = allTemplates.filter((t) => !t.is_public);
  const pub = allTemplates.filter((t) => t.is_public);
  const group = (title, list) =>
    !list.length ? "" :
    '<div class="tpickgroup"><h3>' + title + '<span class="n">' + list.length + " 個</span></h3><ul class=\"tpicklist\">" +
    list.map((t) =>
      '<li><label><input type="checkbox" value="' + t.id + '"' + (usedIds.includes(t.id) ? " checked" : "") + ">" +
      '<span class="txt"><span class="tname">' + esc(t.name) + "</span>" +
      '<span class="tmeta">' + (t.kind === "todo" ? "待辦" : "物品") + "</span></span></label></li>",
    ).join("") + "</ul></div>";
  box.innerHTML = group("我的模板", mine) + group("公用模板", pub);
  $("tmplOv").hidden = false;
  document.body.classList.add("noscroll");
}

const closeTmplPick = () => {
  $("tmplOv").hidden = true;
  document.body.classList.remove("noscroll");
};

async function applyTmplPick() {
  const ids = [...$("tmplPick").querySelectorAll("input:checked")].map((i) => i.value);
  closeTmplPick();
  store.toast("更新中⋯⋯");
  await store.flushNow();
  await api.setTripTemplates(trip.id, ids);
  await load(trip.id);
  paintAll();
  store.toast("模板已更新。");
}

/* ------------------------------ 事件綁定 -------------------------------- */

function wire() {
  if (wired) return;
  wired = true;

  listEl().addEventListener("click", onListClick);
  listEl().addEventListener("input", onListInput);

  const qEl = $("q"), qclr = $("qclr");
  const runSearch = () => { qclr.classList.toggle("on", !!qEl.value); applyFilter(); };
  ["input", "change", "keyup", "compositionend", "search", "paste", "cut"].forEach((ev) =>
    qEl.addEventListener(ev, () => setTimeout(runSearch, 0)),
  );
  $("qgo").onclick = () => { runSearch(); qEl.blur(); };
  qEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); runSearch(); qEl.blur(); }
  });
  qclr.onclick = () => { qEl.value = ""; qclr.classList.remove("on"); applyFilter(); qEl.focus(); };

  $("jumpBtn").onclick = openJump;
  $("jumpX").onclick = closeJump;
  $("jumpOv").addEventListener("click", (e) => { if (e.target === $("jumpOv")) closeJump(); });

  $("btnTripTmpl").onclick = openTmplPick;
  $("tmplX").onclick = closeTmplPick;
  $("tmplOk").onclick = applyTmplPick;
  $("tmplOv").addEventListener("click", (e) => { if (e.target === $("tmplOv")) closeTmplPick(); });

  $("toTop").onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  $("toBot").onclick = () => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  window.addEventListener("scroll", navPaint, { passive: true });
  window.addEventListener("resize", navPaint, { passive: true });

  document.querySelectorAll("#view-trip [data-g]").forEach((b) => {
    b.onclick = () => {
      if (b.dataset.g === "mode") {
        prefs.vMode = b.dataset.v;
        // 離開極簡時把「收起不需要」關掉，否則整段被標成不需要的段落會整個消失
        if (b.dataset.v !== "min") { hideSkip = false; prefs.hideSkip = false; }
      } else prefs.vSex = b.dataset.v;
      paintPresetBtns();
      applyPresets();
      paintPresetBtns();
    };
  });
  document.querySelectorAll("#view-trip [data-add]").forEach((b) => {
    b.onclick = () => { prefs.pet = prefs.pet ? 0 : 1; savePrefs(); paintPresetBtns(); refresh(); };
  });
  document.querySelectorAll("#gauge [data-t]").forEach((b) => {
    b.onclick = () => { tab = b.dataset.t; prefs.tab = tab; savePrefs(); paintPresetBtns(); refresh(); };
  });
  $("fAll").onclick = () => { todoOnly = false; prefs.todoOnly = false; savePrefs(); paintPresetBtns(); applyFilter(); };
  $("fTodo").onclick = () => { todoOnly = true; prefs.todoOnly = true; savePrefs(); paintPresetBtns(); applyFilter(); };
  $("fHide").onclick = () => { hideSkip = !hideSkip; prefs.hideSkip = hideSkip; savePrefs(); paintPresetBtns(); applyFilter(); };

  $("mDest").addEventListener("input", () => patchTrip({ destination: $("mDest").value }));
  $("mDate").addEventListener("change", () => patchTrip({ depart_date: $("mDate").value || null }));
  $("memo").addEventListener("input", () => patchTrip({ memo: $("memo").value }));

  wireReset();
  document.querySelectorAll("#view-trip button.big[data-ic]").forEach((b) => {
    if (!b.querySelector(".bic")) b.insertAdjacentHTML("afterbegin", bico(b.dataset.ic));
  });
}

function navPaint() {
  const nav = $("navBtns");
  if (nav.hidden) return;
  const y = window.pageYOffset, h = document.body.scrollHeight - window.innerHeight;
  $("toTop").classList.toggle("on", y > 360);
  $("toBot").classList.toggle("on", h - y > 360);
}

async function onListClick(e) {
  if (e.target.classList.contains("fill") || e.target.classList.contains("cname")) return;

  const ab = e.target.closest(".addbtn");
  if (ab) {
    const sec = sections.find((s) => s.id === ab.dataset.sec);
    const row = await api.createCustomItem(trip.id, sec.id, sec.customs.length);
    sec.customs.push(row);
    ST.set(row.id, { s: 0, p: null, v: "", c: true });
    build();
    const el = listEl().querySelector('.cname[data-k="' + row.id + '"]');
    if (el) { el.focus(); try { el.scrollIntoView({ block: "center" }); } catch (_) {} }
    return;
  }

  const cd = e.target.closest(".cdel");
  if (cd) {
    const sec = sections.find((s) => s.id === cd.dataset.sec);
    sec.customs = sec.customs.filter((x) => x.id !== cd.dataset.k);
    ST.delete(cd.dataset.k);
    await api.deleteCustomItem(cd.dataset.k);
    build();
    return;
  }

  const sb2 = e.target.closest(".secskip");
  if (sb2) {
    const sec = sections.find((x) => x.id === sb2.dataset.sec);
    const keys = sec.items.map((i) => i.id).concat(sec.customs.map((c) => c.id));
    const allSkip = keys.every((k) => st(k).s === 2);
    keys.forEach((k) => {
      const r = st(k);
      if (allSkip) setState(k, { s: r.p || 0, p: null });
      else setState(k, { s: 2, p: r.s && r.s !== 2 ? r.s : r.p });
    });
    build();
    return;
  }

  const li = e.target.closest("li[data-key]");
  if (!li) return;
  const k = li.dataset.key, r = st(k);
  if (e.target.closest(".skipbtn")) {
    if (r.s === 2) setState(k, { s: r.p || 0, p: null });
    else setState(k, { s: 2, p: r.s || null });
  } else if (r.s !== 2) {
    setState(k, { s: r.s === 1 ? 0 : 1 });
  } else return;

  li.dataset.s = st(k).s;
  li.querySelector(".skipbtn").innerHTML = st(k).s === 2 ? "復原" : EYE;
  refresh();
}

function onListInput(e) {
  if (e.target.classList.contains("cname")) {
    const k = e.target.dataset.k;
    const cu = findCustom(k);
    if (cu) cu.title = e.target.value;
    const r = st(k);
    const s = !e.target.value.trim() && r.s === 1 ? 0 : r.s;
    setState(k, { s });
    const li = e.target.closest("li");
    if (li) li.dataset.s = s;
    refresh();
    return;
  }
  if (e.target.classList.contains("fill")) {
    const k = e.target.dataset.v, val = e.target.value;
    const r = st(k);
    const s = !val.trim() && r.s === 1 ? 0 : r.s;
    setState(k, { v: val, s });
    const li = e.target.closest("li");
    if (li) li.dataset.s = s;
    refresh();
  }
}

/* ------------------------ 全部還原 / 刪除這份清單 ------------------------- */

let armed = 0, armTimer = null;
function wireReset() {
  const btn = $("btnReset"), msg = $("resetMsg");
  const base = msg.textContent;
  const disarm = () => {
    armed = 0;
    clearTimeout(armTimer);
    btn.textContent = "全部還原";
    btn.classList.remove("danger");
    msg.textContent = base;
  };
  btn.onclick = async () => {
    if (!armed) {
      armed = 1;
      btn.textContent = "再按一次確認";
      btn.classList.add("danger");
      armTimer = setTimeout(disarm, 8000);
      return;
    }
    disarm();
    await store.flushNow();
    await api.resetTrip(trip.id);
    await load(trip.id);
    paintAll();
    store.toast("已全部還原。");
  };

  let armedDel = 0, delTimer = null;
  const del = $("btnDeleteTrip");
  del.onclick = async () => {
    if (!armedDel) {
      armedDel = 1;
      del.textContent = "再按一次刪除，無法復原";
      del.classList.add("fill");
      delTimer = setTimeout(() => {
        armedDel = 0;
        del.textContent = "刪除這份清單";
        del.classList.remove("fill");
      }, 8000);
      return;
    }
    clearTimeout(delTimer);
    armedDel = 0;
    del.textContent = "刪除這份清單";
    del.classList.remove("fill");
    await store.flushNow();
    await api.deleteTrip(trip.id);
    location.hash = "#/trips";
  };
}

/* -------------------------------- 進出 ---------------------------------- */

export function paintAll() {
  $("tripName").textContent = trip.name;
  $("mDest").value = trip.destination || "";
  $("mDate").value = trip.depart_date || "";
  $("memo").value = trip.memo || "";
  paintPresetBtns();
  build();
  navPaint();
}

export function enter() {
  wire();
  $("tripHeader").hidden = false;
  $("gauge").hidden = false;
  $("navBtns").hidden = false;
  paintAll();
  setTimeout(navPaint, 200);
}

export function leave() {
  $("tripHeader").hidden = true;
  $("gauge").hidden = true;
  $("navBtns").hidden = true;
  closeJump();
  closeTmplPick();
  store.flushNow();
}

export function currentTrip() {
  return trip;
}
