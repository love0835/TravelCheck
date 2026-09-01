// -----------------------------------------------------------------------------
// 進入點：路由、登入把關、說明與提醒彈窗。
// -----------------------------------------------------------------------------
import { isConfigured, sb } from "./supabase.js";
import { APP_VERSION } from "./config.js";
import * as auth from "./auth.js";
import * as trips from "./trips.js";
import * as tpls from "./templates.js";
import * as checklist from "./checklist.js";
import * as store from "./store.js";

const $ = (id) => document.getElementById(id);
let user = null;
let inTrip = false;

/* ------------------------------ 尚未設定 -------------------------------- */
if (!isConfigured) {
  document.body.innerHTML =
    '<div class="wrap"><div class="authcard"><h1>還沒設定資料庫</h1>' +
    '<p class="lead">請打開 <b>js/config.js</b>，把 Supabase 專案的 URL 與 anon key 填進去，' +
    "然後重新整理。完整步驟寫在 <b>README.md</b>。</p></div></div>";
  throw new Error("Supabase not configured");
}

/* -------------------------------- 路由 ---------------------------------- */

const VIEWS = ["view-auth", "view-trips", "view-new", "view-trip", "view-templates"];

function showView(id) {
  VIEWS.forEach((v) => $(v).classList.toggle("on", v === id));
  if (inTrip && id !== "view-trip") {
    inTrip = false;
    checklist.leave();
  }
  $("appbar").hidden = id === "view-auth";
  const navFor = id === "view-templates" ? "templates" : "trips";
  document.querySelectorAll("#appbar nav a").forEach((a) => {
    if (a.dataset.nav === navFor && id !== "view-auth") a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  if (id !== "view-trip") window.scrollTo(0, 0);
}

function parse() {
  const h = location.hash.replace(/^#\/?/, "");
  const parts = h.split("/").filter(Boolean);
  return { head: parts[0] || "", rest: parts.slice(1) };
}

let routing = false;
async function route() {
  if (routing) return;
  routing = true;
  try {
    const { head, rest } = parse();

    if (!user) {
      auth.resetAuthView();
      showView("view-auth");
      return;
    }

    if (head === "templates") {
      showView("view-templates");
      await tpls.render();
      return;
    }

    if (head === "trips" && rest[0] === "new") {
      showView("view-new");
      await trips.renderNew();
      return;
    }

    if (head === "trip" && rest[0]) {
      const ok = await checklist.load(rest[0]);
      if (!ok) {
        store.toast("找不到這份清單，可能已經刪掉了。", "err");
        location.hash = "#/trips";
        return;
      }
      showView("view-trip");
      inTrip = true;
      checklist.enter();
      maybeOpenHelp();
      return;
    }

    showView("view-trips");
    trips.invalidate();
    await trips.render();
  } catch (e) {
    console.error(e);
    store.toast("載入失敗：" + (e.message || e), "err");
  } finally {
    routing = false;
  }
}

window.addEventListener("hashchange", route);

/* ------------------------------ 登入狀態 -------------------------------- */

function paintUser() {
  $("whoEmail").textContent = user ? user.email : "";
  $("verTag").textContent = APP_VERSION;
}

auth.initAuthView(() => {
  // 登入成功後由 onAuthStateChange 接手導頁
});

$("btnLogout").onclick = async () => {
  await store.flushNow();
  await auth.signOut();
  location.hash = "#/login";
};

auth.onAuthChange(async (u) => {
  const was = !!user;
  user = u;
  paintUser();
  if (!u) {
    trips.invalidate();
    showView("view-auth");
    return;
  }
  if (!was || !location.hash || location.hash === "#/login") location.hash = "#/trips";
  await route();
});

/* --------------------------- 說明與重要提醒 ------------------------------ */

const seen = (k) => {
  try { return localStorage.getItem("tc_" + k) === "1"; } catch (e) { return true; }
};
const mark = (k) => {
  try { localStorage.setItem("tc_" + k, "1"); } catch (e) {}
};

const helpOv = $("helpOv"), warnOv = $("warnOv");
let lastFocus = null;

function openHelp() {
  lastFocus = document.activeElement;
  helpOv.hidden = false;
  document.body.classList.add("noscroll");
  setTimeout(() => $("helpX").focus(), 50);
}
function closeHelp() {
  helpOv.hidden = true;
  document.body.classList.remove("noscroll");
  mark("helpSeen");
  if (!seen("warnSeen") && inTrip) setTimeout(openWarn, 180);
  else if (lastFocus?.focus) lastFocus.focus();
}
function openWarn() {
  lastFocus = document.activeElement;
  warnOv.hidden = false;
  document.body.classList.add("noscroll");
  setTimeout(() => $("warnX").focus(), 50);
}
function closeWarn() {
  warnOv.hidden = true;
  document.body.classList.remove("noscroll");
  mark("warnSeen");
  if (lastFocus?.focus) lastFocus.focus();
}

function maybeOpenHelp() {
  if (!seen("helpSeen")) openHelp();
  else if (!seen("warnSeen")) openWarn();
}

$("helpFab").onclick = openHelp;
$("helpX").onclick = closeHelp;
$("helpOk").onclick = closeHelp;
helpOv.addEventListener("click", (e) => { if (e.target === helpOv) closeHelp(); });

$("warnBtn").onclick = openWarn;
$("warnFab").onclick = openWarn;
$("warnX").onclick = closeWarn;
$("warnOk").onclick = closeWarn;
warnOv.addEventListener("click", (e) => { if (e.target === warnOv) closeWarn(); });

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!helpOv.hidden) closeHelp();
  else if (!warnOv.hidden) closeWarn();
  else if (!$("jumpOv").hidden) $("jumpX").click();
  else if (!$("tmplOv").hidden) $("tmplX").click();
});

/* -------------------------------- 啟動 ---------------------------------- */

trips.wire();
(async () => {
  const { data } = await sb.auth.getSession();
  user = data?.session?.user || null;
  paintUser();
  if (user && (!location.hash || location.hash === "#/login")) location.hash = "#/trips";
  await route();
})();
