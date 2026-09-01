#!/usr/bin/env node
// 由 index.html 產生本機試用版 dev-test.html。
// 差別只有：用 import map 把 Supabase client 與設定換成 tools/ 底下的假替身。
// 用法：node tools/make-dev-test.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let html = readFileSync(join(root, "index.html"), "utf8");

const REAL = '<script type="module" src="js/app.js"></script>';
if (!html.includes(REAL)) throw new Error("在 index.html 找不到載入 js/app.js 的那一行");

const INJECT = `<!-- 本機測試專用：把 Supabase client 與設定換成 tools/ 底下的假替身 -->
<!-- 這個檔案由 tools/make-dev-test.mjs 產生，請不要直接改，改 index.html 後重跑腳本 -->
<script type="importmap">
{"imports":{
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.58.0/+esm": "./tools/mock-supabase.js",
  "/js/config.js": "./tools/test-config.js"
}}
</script>
<script type="module">
  import { seedPublicTemplates } from "./tools/mock-supabase.js";
  const seed = await (await fetch("./tools/seed.json")).json();
  await seedPublicTemplates(seed);
</script>
${REAL}`;

html = html.replace(REAL, INJECT).replace("<title>旅行清單</title>", "<title>旅行清單（本機測試）</title>");
writeFileSync(join(root, "dev-test.html"), html);
console.log("dev-test.html 已更新");
