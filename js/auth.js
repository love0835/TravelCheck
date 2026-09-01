// -----------------------------------------------------------------------------
// 登入與註冊。使用 Supabase Auth 的 Email + 密碼。
// -----------------------------------------------------------------------------
import { sb, errText } from "./supabase.js";
import { defer } from "./timing.js";

let mode = "in"; // "in" 登入 ／ "up" 註冊
let onDone = null;

const $ = (id) => document.getElementById(id);

export async function currentUser() {
  const { data } = await sb.auth.getSession();
  return data?.session?.user || null;
}

export async function signOut() {
  await sb.auth.signOut();
}

export function onAuthChange(cb) {
  return sb.auth.onAuthStateChange((_evt, session) => {
    // Supabase 會在持有 auth lock 時等待這個回呼結束。如果直接回傳
    // cb() 的 Promise，cb 裡又發出需要 session 的資料庫查詢，兩邊會互等。
    // 讓 auth 回呼立即結束，下一個 task 才開始載入頁面資料。
    defer(cb, session?.user || null);
  });
}

function paint() {
  $("authTitle").textContent = mode === "in" ? "登入" : "建立帳號";
  $("authLead").textContent =
    mode === "in"
      ? "用你的 Email 與密碼登入，清單會存在雲端，換手機也拿得到。"
      : "設定 Email 與密碼就能開始，不需要收驗證信。";
  $("authSubmit").textContent = mode === "in" ? "登入" : "建立帳號";
  $("authPass").autocomplete = mode === "in" ? "current-password" : "new-password";
  $("authSwapWrap").innerHTML =
    mode === "in"
      ? '還沒有帳號？<button type="button" id="authSwap">建立一個</button>'
      : '已經有帳號了？<button type="button" id="authSwap">直接登入</button>';
  $("authSwap").onclick = () => {
    mode = mode === "in" ? "up" : "in";
    msg("");
    paint();
  };
}

function msg(text, isErr) {
  const el = $("authMsg");
  el.textContent = text;
  el.className = isErr ? "msg err" : "msg";
}

export function showError(text) {
  msg(text, true);
}

async function submit(e) {
  e.preventDefault();
  const email = $("authEmail").value.trim();
  const pass = $("authPass").value;
  if (!email || pass.length < 6) {
    msg("請填 Email，密碼至少 6 個字。", true);
    return;
  }
  const btn = $("authSubmit");
  btn.disabled = true;
  msg(mode === "in" ? "登入中⋯⋯" : "建立中⋯⋯");
  try {
    if (mode === "up") {
      const { data, error } = await sb.auth.signUp({ email, password: pass });
      if (error) throw error;
      if (!data.session) {
        // Supabase 後台仍開著「Confirm email」時會走到這裡
        msg("帳號建好了，但這個專案要求先收驗證信。請到信箱點連結後再回來登入。", true);
        mode = "in";
        paint();
        return;
      }
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
    }
    msg("");
    $("authPass").value = "";
    if (onDone) onDone();
  } catch (err) {
    msg(errText(err), true);
  } finally {
    btn.disabled = false;
  }
}

export function initAuthView(done) {
  onDone = done;
  paint();
  $("authForm").addEventListener("submit", submit);
}

export function resetAuthView() {
  mode = "in";
  msg("");
  paint();
}
