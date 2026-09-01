// -----------------------------------------------------------------------------
// Supabase 連線設定
//
// 到 Supabase 專案首頁按右上角的 Copy，複製 Project URL 與 Publishable key
// （新版格式是 sb_publishable_...；舊專案是 eyJ... 開頭的 anon key，兩種都可以）。
//
// 這兩個值本來就設計成公開（前端一定看得到，名字就叫 publishable），
// 實際權限完全由資料庫的 RLS 規則把關，放在 GitHub 公開儲存庫上是安全的。
// 絕對不要把 service_role 或 secret key 填進來。
// 詳細步驟見 README.md。
// -----------------------------------------------------------------------------
export const SUPABASE_URL = "https://kbcufareazknsxrxkwzi.supabase.co";
export const SUPABASE_KEY = "PASTE_YOUR_PUBLISHABLE_KEY_HERE";

export const APP_VERSION = "v2";

export function configured() {
  const url = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(SUPABASE_URL);
  // 新版 publishable key 比舊的 anon JWT 短很多，兩種格式都要放行
  const key = /^sb_publishable_[A-Za-z0-9_-]{10,}$/.test(SUPABASE_KEY) || /^eyJ[\w-]+\./.test(SUPABASE_KEY);
  return url && key;
}
