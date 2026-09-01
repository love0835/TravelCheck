// 本機測試用的假設定（dev-test.html 專用，正式站用的是 js/config.js）
export const SUPABASE_URL = "https://localtest.supabase.co";
export const SUPABASE_KEY = "sb_publishable_localmocktestkey000000";
export const APP_VERSION = "dev";
export function configured() { return true; }
