// Supabase client（從 CDN 載入，不需要任何 build 步驟）
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.58.0/+esm";
import { SUPABASE_URL, SUPABASE_KEY, configured } from "./config.js";

export const isConfigured = configured();

export const sb = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

// 把 Supabase 的英文錯誤訊息換成看得懂的中文
export function errText(err) {
  if (!err) return "";
  const m = String(err.message || err);
  if (/Invalid login credentials/i.test(m)) return "Email 或密碼不對。";
  if (/User already registered/i.test(m)) return "這個 Email 已經註冊過了，直接登入吧。";
  if (/Password should be at least/i.test(m)) return "密碼至少要 6 個字。";
  if (/Unable to validate email/i.test(m) || /invalid.*email/i.test(m)) return "Email 格式怪怪的。";
  if (/Email not confirmed/i.test(m)) return "這個帳號還沒完成信箱驗證。";
  if (/rate limit|too many/i.test(m)) return "太頻繁了，請等一下再試。";
  if (/Failed to fetch|NetworkError/i.test(m)) return "連不上伺服器，檢查一下網路。";
  return m;
}
