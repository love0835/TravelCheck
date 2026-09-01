// -----------------------------------------------------------------------------
// 模板編輯介面。
// 公用模板唯讀（RLS 也擋著改不動），按「複製成我的模板」得到可編輯的副本。
// 改動自己的模板後，所有引用它的清單下次開啟就是新內容。
// -----------------------------------------------------------------------------
import * as api from "./api.js";
import { icon, ICON_KEYS } from "./icons.js";
import * as store from "./store.js";
import { errText } from "./supabase.js";

const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attr = (s) => esc(s).replace(/"/g, "&quot;");

let templates = [];
let itemsByTpl = new Map();
let sel = null; // 目前選到的模板 id
let swapOffer = null; // 剛從公用模板複製完，提供「把既有清單換過來」的選項
let usage = new Map(); // 模板 id -> 有幾份清單在用

const debouncers = new Map();
function debounce(key, fn, ms = 450) {
  clearTimeout(debouncers.get(key));
  debouncers.set(key, setTimeout(fn, ms));
}

export async function render(preferId) {
  const [tpl, items, links] = await Promise.all([
    api.fetchTemplates(),
    api.fetchTemplateItems(),
    api.fetchTripTemplates(null),
  ]);
  templates = tpl;
  itemsByTpl = new Map();
  items.forEach((it) => {
    if (!itemsByTpl.has(it.template_id)) itemsByTpl.set(it.template_id, []);
    itemsByTpl.get(it.template_id).push(it);
  });
  usage = new Map();
  links.forEach((l) => usage.set(l.template_id, (usage.get(l.template_id) || 0) + 1));

  if (preferId && templates.some((t) => t.id === preferId)) sel = preferId;
  if (!sel || !templates.some((t) => t.id === sel)) {
    sel = (templates.find((t) => !t.is_public) || templates[0])?.id || null;
  }
  paintSide();
  paintMain();
}

function paintSide() {
  const mine = templates.filter((t) => !t.is_public);
  const pub = templates.filter((t) => t.is_public);
  const li = (t) =>
    '<li><button class="pick" data-id="' + t.id + '" aria-current="' + (t.id === sel) + '">' +
    icon(t.icon) + "<span>" + esc(t.name) + '</span><span class="c">' +
    (itemsByTpl.get(t.id) || []).length + "</span></button></li>";

  $("tplSide").innerHTML =
    "<h3>我的模板</h3>" +
    (mine.length ? "<ul>" + mine.map(li).join("") + "</ul>" : '<p class="ghint">還沒有自己的模板。</p>') +
    '<button class="newbtn" id="btnNewTpl">＋ 新建空白模板</button>' +
    '<h3 class="gap">公用模板（唯讀）</h3><ul>' + pub.map(li).join("") + "</ul>";

  $("tplSide").querySelectorAll(".pick").forEach((b) => {
    b.onclick = () => {
      sel = b.dataset.id;
      paintSide();
      paintMain();
      // 手機上兩欄是上下排的，選完要自動捲到內容，否則看起來像沒反應
      if (window.innerWidth < 820) $("tplMain").scrollIntoView({ behavior: "smooth", block: "start" });
    };
  });
  $("btnNewTpl").onclick = newTemplate;
}

function paintMain() {
  const main = $("tplMain");
  const t = templates.find((x) => x.id === sel);
  if (!t) {
    main.innerHTML = '<p class="ghint">左邊挑一個模板來看內容。</p>';
    return;
  }
  const items = itemsByTpl.get(t.id) || [];
  const used = usage.get(t.id) || 0;

  if (t.is_public) {
    main.innerHTML =
      '<div class="lockrow"><b>公用模板，唯讀。</b>想改內容就複製一份成自己的，' +
      "改副本不會影響其他人。</div>" +
      "<h2>" + icon(t.icon) + " " + esc(t.name) + "</h2>" +
      (t.hint ? '<p class="ghint">' + t.hint + "</p>" : "") +
      '<p class="ghint">' + (t.kind === "todo" ? "待辦" : "物品") + "　共 " + items.length + " 項" +
      (used ? "　目前有 " + used + " 份清單在用" : "") + "</p>" +
      '<div class="btnrow"><button class="btn primary" id="btnCopyTpl">複製成我的模板</button></div>' +
      '<ul class="itemtable">' +
      items.map((it, i) =>
        '<li><div class="r1"><span class="ord">' + (i + 1) + "</span>" +
        '<span class="tname">' + esc(it.title) + "</span></div>" +
        (it.note ? '<div class="r2"><span>' + esc(it.note) + "</span></div>" : "") + "</li>",
      ).join("") +
      "</ul>";
    $("btnCopyTpl").onclick = () => copyTemplate(t, items);
    return;
  }

  const offer =
    swapOffer && swapOffer.newId === t.id && swapOffer.count > 0
      ? '<div class="lockrow"><b>還有 ' + swapOffer.count + " 份清單在用原本的公用模板。</b>" +
        "要把它們一起換成這個副本嗎？換過去之後，你在這裡的改動就會反映到那些清單。" +
        '<button class="btn primary" id="btnSwapTpl">換過去</button>' +
        '<button class="btn ghost" id="btnSkipSwap">不用</button></div>'
      : "";

  main.innerHTML =
    offer +
    '<div class="lockrow">改動會<b>立刻套用到所有使用這個模板的清單</b>' +
    (used ? "（目前 " + used + " 份）" : "（目前沒有清單在用）") + "。已勾選的紀錄不會被清掉。</div>" +
    '<div class="field"><label for="tplName">模板名稱</label>' +
    '<input id="tplName" maxlength="60" value="' + attr(t.name) + '">' +
    '<p class="sub">用「｜」分段的名字（例如 託運｜盥洗）在「跳到段落」會自動省略前半段。</p></div>' +
    '<div class="tplrow2">' +
    '<div class="field"><label for="tplKind">分類</label><select id="tplKind">' +
    '<option value="item"' + (t.kind === "item" ? " selected" : "") + ">物品（要帶的東西）</option>" +
    '<option value="todo"' + (t.kind === "todo" ? " selected" : "") + ">待辦（要做的事）</option>" +
    "</select></div>" +
    '<div class="field"><label>圖示</label><div class="icongrid" id="tplIcons"></div></div>' +
    "</div>" +
    '<div class="field"><label for="tplHint">段落提示（可留空）</label>' +
    '<textarea id="tplHint" rows="2">' + esc(t.hint || "") + "</textarea>" +
    '<p class="sub">顯示在段落標題下方的小字說明。</p></div>' +
    '<ul class="itemtable" id="tplItems"></ul>' +
    '<div class="btnrow"><button class="btn primary" id="btnAddItem">＋ 新增項目</button>' +
    '<button class="btn ghost" id="btnDupTpl">複製這個模板</button>' +
    '<button class="btn warn" id="btnDelTpl">刪除模板</button>' +
    '<span class="msg" id="tplMsg"></span></div>';

  const grid = $("tplIcons");
  grid.innerHTML = ICON_KEYS.map(
    (k) => '<button type="button" data-ic="' + k + '" aria-pressed="' + (t.icon === k) + '">' + icon(k) + "</button>",
  ).join("");
  grid.querySelectorAll("button").forEach((b) => {
    b.onclick = async () => {
      t.icon = b.dataset.ic;
      grid.querySelectorAll("button").forEach((x) =>
        x.setAttribute("aria-pressed", x.dataset.ic === t.icon ? "true" : "false"),
      );
      await api.updateTemplate(t.id, { icon: t.icon });
      paintSide();
      note("已儲存。");
    };
  });

  $("tplName").oninput = () => {
    t.name = $("tplName").value;
    debounce("name", async () => {
      await api.updateTemplate(t.id, { name: t.name });
      paintSide();
      note("已儲存。");
    });
  };
  $("tplKind").onchange = async () => {
    t.kind = $("tplKind").value;
    await api.updateTemplate(t.id, { kind: t.kind });
    note("已儲存。");
  };
  $("tplHint").oninput = () => {
    t.hint = $("tplHint").value;
    debounce("hint", async () => {
      await api.updateTemplate(t.id, { hint: t.hint || null });
      note("已儲存。");
    });
  };
  if (offer) {
    $("btnSwapTpl").onclick = async () => {
      const { oldId, itemMap } = swapOffer;
      swapOffer = null;
      store.toast("切換中⋯⋯");
      const n = await api.swapTemplate(oldId, t.id, itemMap);
      await render(t.id);
      store.toast("已把 " + n + " 份清單改用你的副本。");
    };
    $("btnSkipSwap").onclick = () => { swapOffer = null; paintMain(); };
  }
  $("btnAddItem").onclick = () => addItem(t);
  $("btnDupTpl").onclick = () => copyTemplate(t, itemsByTpl.get(t.id) || []);
  wireDelete(t);
  paintItems(t);
}

function note(text, isErr) {
  const el = $("tplMsg");
  if (!el) return;
  el.className = isErr ? "msg err" : "msg";
  el.textContent = text;
  if (!isErr) setTimeout(() => { if (el.textContent === text) el.textContent = ""; }, 2500);
}

function paintItems(t) {
  const items = itemsByTpl.get(t.id) || [];
  const ul = $("tplItems");
  if (!items.length) {
    ul.innerHTML = '<li><span class="ghint">還沒有項目，按下面的「＋ 新增項目」開始。</span></li>';
    return;
  }
  const flag = (it, k, label) =>
    '<label><input type="checkbox" data-flag="' + k + '" data-id="' + it.id + '"' +
    ((it.flags || {})[k] ? " checked" : "") + ">" + label + "</label>";

  ul.innerHTML = items.map((it, i) =>
    '<li data-id="' + it.id + '">' +
    '<div class="r1"><span class="ord">' + (i + 1) + "</span>" +
    '<input class="it" data-id="' + it.id + '" placeholder="項目名稱" value="' + attr(it.title) + '">' +
    '<button class="mv" data-mv="up" data-id="' + it.id + '" title="上移">↑</button>' +
    '<button class="mv" data-mv="down" data-id="' + it.id + '" title="下移">↓</button>' +
    '<button class="del" data-id="' + it.id + '" title="刪除">✕</button></div>' +
    '<div class="r1" style="margin-left:33px"><input class="inote" data-id="' + it.id + '" placeholder="補充說明（可留空）" value="' + attr(it.note || "") + '"></div>' +
    '<div class="r2">' + flag(it, "red", "重要（紅字）") + flag(it, "inp", "自填欄") +
    flag(it, "pet", "寵物") + flag(it, "f", "女性") + flag(it, "m", "男性") + "</div></li>",
  ).join("");

  ul.querySelectorAll("input.it").forEach((inp) => {
    inp.oninput = () => {
      const it = items.find((x) => x.id === inp.dataset.id);
      it.title = inp.value;
      debounce("it" + it.id, async () => { await api.updateItem(it.id, { title: it.title }); note("已儲存。"); });
    };
  });
  ul.querySelectorAll("input.inote").forEach((inp) => {
    inp.oninput = () => {
      const it = items.find((x) => x.id === inp.dataset.id);
      it.note = inp.value;
      debounce("in" + it.id, async () => { await api.updateItem(it.id, { note: it.note || null }); note("已儲存。"); });
    };
  });
  ul.querySelectorAll("input[data-flag]").forEach((cb) => {
    cb.onchange = async () => {
      const it = items.find((x) => x.id === cb.dataset.id);
      it.flags = { ...(it.flags || {}) };
      if (cb.checked) it.flags[cb.dataset.flag] = 1;
      else delete it.flags[cb.dataset.flag];
      await api.updateItem(it.id, { flags: it.flags });
      note("已儲存。");
    };
  });
  ul.querySelectorAll(".del").forEach((b) => {
    b.onclick = async () => {
      const id = b.dataset.id;
      itemsByTpl.set(t.id, items.filter((x) => x.id !== id));
      paintItems(t);
      paintSide();
      await api.deleteItem(id);
      note("已刪除，使用這個模板的清單也會少掉這一項。");
    };
  });
  ul.querySelectorAll(".mv").forEach((b) => {
    b.onclick = async () => {
      const i = items.findIndex((x) => x.id === b.dataset.id);
      const j = b.dataset.mv === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= items.length) return;
      [items[i], items[j]] = [items[j], items[i]];
      paintItems(t);
      await api.reorderItems(items.map((x) => x.id));
      note("順序已儲存。");
    };
  });
}

async function addItem(t) {
  const items = itemsByTpl.get(t.id) || [];
  const row = await api.createItem(t.id, { title: "", note: null, flags: {}, sort_order: items.length });
  items.push(row);
  itemsByTpl.set(t.id, items);
  paintItems(t);
  paintSide();
  const el = $("tplItems").querySelector('input.it[data-id="' + row.id + '"]');
  if (el) { el.focus(); try { el.scrollIntoView({ block: "center" }); } catch (_) {} }
}

async function newTemplate() {
  try {
    const t = await api.createTemplate({ name: "新的模板", kind: "item", icon: "bag", sort_order: 999 });
    await render(t.id);
    const el = $("tplName");
    if (el) { el.focus(); el.select(); }
  } catch (e) {
    store.toast(errText(e), "err");
  }
}

async function copyTemplate(t, items) {
  store.toast("複製中⋯⋯");
  try {
    const { template: copy, itemMap } = await api.copyTemplate(t, items);
    swapOffer = t.is_public
      ? { oldId: t.id, newId: copy.id, count: usage.get(t.id) || 0, itemMap }
      : null;
    await render(copy.id);
    store.toast("已複製成你自己的模板，可以開始改了。");
  } catch (e) {
    store.toast(errText(e), "err");
  }
}

let armDel = 0, delTimer = null;
function wireDelete(t) {
  const b = $("btnDelTpl");
  const reset = () => { armDel = 0; b.textContent = "刪除模板"; b.classList.remove("fill"); };
  reset();
  b.onclick = async () => {
    if (!armDel) {
      armDel = 1;
      const used = usage.get(t.id) || 0;
      b.textContent = used ? "有 " + used + " 份清單在用，再按一次刪除" : "再按一次刪除";
      b.classList.add("fill");
      delTimer = setTimeout(reset, 8000);
      return;
    }
    clearTimeout(delTimer);
    reset();
    await api.deleteTemplate(t.id);
    sel = null;
    await render();
    store.toast("模板已刪除。");
  };
}
