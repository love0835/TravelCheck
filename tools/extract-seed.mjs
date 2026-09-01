#!/usr/bin/env node
// 從 legacy/v260901n.html 裡的 DATA 陣列產生公用模板的 seed SQL。
// 用法：node tools/extract-seed.mjs > db/seed_public_templates.sql
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "legacy/v260901n.html"), "utf8");

const start = html.indexOf("const DATA = [");
const end = html.indexOf("const BICO=", start);
if (start < 0 || end < 0) throw new Error("在 legacy HTML 裡找不到 DATA 陣列");

const src = html.slice(start, end).trim().replace(/;?\s*$/, "");
const DATA = new Function(`${src}; return DATA;`)();

// qs：一定產生字串（給 not null 的欄位）；q：空值產生 null（給可為 null 的欄位）
const qs = (v) => `'${String(v ?? "").replace(/'/g, "''")}'`;
const q = (v) => (v === null || v === undefined || v === "" ? "null" : qs(v));
const b = (v) => (v ? "true" : "false");

// 場景類與寵物類：新增清單時預設不勾選
const defaultOff = (sec) => !!(sec.terr || sec.pet);

// --json：改為輸出給本機測試用的 seed JSON（tools/seed.json）
if (process.argv.includes("--json")) {
  process.stdout.write(JSON.stringify(DATA.map((sec, si) => ({
    slug: sec.id, name: sec.t, icon: sec.ic, kind: sec.kind || "item",
    hint: sec.hint || null, hot: !!sec.hot, seq: !!sec.seq,
    default_on: !defaultOff(sec), sort_order: si,
    items: sec.items.map((it, i) => ({
      title: it[0] || "", note: it[1] || null, flags: it[2] || {}, sort_order: i,
    })),
  }))));
  process.exit(0);
}

const out = [];
out.push("-- 公用模板 seed（由 tools/extract-seed.mjs 自動產生，請勿手改）");
out.push("-- 來源：legacy/v260901n.html 的 DATA 陣列");
out.push("-- 重跑本檔會先刪掉舊的公用模板再重建。");
out.push("");
out.push("delete from templates where is_public;");
out.push("");

DATA.forEach((sec, si) => {
  out.push(`-- ${sec.t}`);
  out.push(
    "insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values",
  );
  out.push(
    `  (true, ${q(sec.id)}, ${q(sec.t)}, ${q(sec.ic)}, ${q(sec.kind || "item")}, ` +
      `${q(sec.hint)}, ${b(sec.hot)}, ${b(sec.seq)}, ${b(!defaultOff(sec))}, ${si});`,
  );

  const rows = sec.items.map((it, i) => {
    const flags = { ...(it[2] || {}) };
    // 區塊層級的 pet 旗標不再需要：寵物模板本身就是要另外挑選的
    delete flags.pet2;
    const fl = JSON.stringify(flags);
    // 明確標注型別，避免 VALUES 第一列是 null 時 Postgres 推不出欄位型別
    return `  (${qs(it[0])}::text, ${q(it[1])}::text, ${qs(fl)}::jsonb, ${i})`;
  });

  out.push(
    `insert into template_items (template_id, title, note, flags, sort_order)\n` +
      `select t.id, v.title, v.note, v.flags, v.sort_order\n` +
      `from templates t\n` +
      `cross join (values\n${rows.join(",\n")}\n) as v(title, note, flags, sort_order)\n` +
      `where t.is_public and t.slug = ${q(sec.id)};`,
  );
  out.push("");
});

const items = DATA.reduce((n, s) => n + s.items.length, 0);
out.push(`-- 共 ${DATA.length} 個公用模板、${items} 個項目`);
process.stdout.write(out.join("\n") + "\n");
