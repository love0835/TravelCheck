// -----------------------------------------------------------------------------
// Supabase 連線設定
//
// 到 Supabase 專案的 Project Settings → API 複製這兩個值填進來，然後 commit。
// 這兩個值本來就設計成公開（前端一定看得到），實際權限由資料庫的 RLS 規則把關，
// 放在 GitHub 上是安全的。詳細步驟見 README.md。
// -----------------------------------------------------------------------------
export const SUPABASE_URL = "PASTE_YOUR_SUPABASE_URL_HERE";
export const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY_HERE";

export const APP_VERSION = "v2";

export function configured() {
  return (
    /^https:\/\/.+\.supabase\.co\/?$/.test(SUPABASE_URL) &&
    SUPABASE_ANON_KEY.length > 40
  );
}
