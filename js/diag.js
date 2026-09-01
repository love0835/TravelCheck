// -----------------------------------------------------------------------------
// 連線診斷頁。把「伺服器慢」和「瀏覽器端卡住」分開來看：
// 同一筆資料分別用 supabase-js 和原生 fetch 各打一次，兩邊的耗時一比就知道問題在哪。
// -----------------------------------------------------------------------------
import { sb } from "./supabase.js";
import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";

const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const STEP_TIMEOUT = 20000;
const lines = [];

function row(name, ms, ok, detail) {
  lines.push(`${name}\t${ms === null ? "-" : ms + "ms"}\t${ok ? "OK" : "FAIL"}\t${detail}`);
  const tr = document.createElement("div");
  tr.className = "drow " + (ok ? "ok" : "bad");
  tr.innerHTML =
    "<b>" + esc(name) + "</b>" +
    '<span class="dms">' + (ms === null ? "—" : ms + " ms") + "</span>" +
    '<span class="dv">' + esc(detail) + "</span>";
  $("diagRows").appendChild(tr);
}

async function timed(name, fn) {
  const t0 = performance.now();
  let timer;
  try {
    const v = await Promise.race([
      fn(),
      new Promise((_, rej) => {
        timer = setTimeout(() => rej(new Error("逾時，" + STEP_TIMEOUT / 1000 + " 秒內沒有回應")), STEP_TIMEOUT);
      }),
    ]);
    row(name, Math.round(performance.now() - t0), true, v);
    return true;
  } catch (e) {
    row(name, Math.round(performance.now() - t0), false, String(e.message || e));
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function decodeJwt(token) {
  try {
    const p = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(p + "=".repeat((4 - (p.length % 4)) % 4)));
  } catch (e) {
    return null;
  }
}

async function run() {
  lines.length = 0;
  $("diagRows").innerHTML = "";
  $("diagRun").disabled = true;
  $("diagCopy").disabled = true;

  lines.push("=== 旅行清單連線診斷 " + new Date().toISOString() + " ===");
  row("瀏覽器", null, true, navigator.userAgent.slice(0, 90));
  row("裝置目前時間", null, true, new Date().toString());
  row("navigator.locks", null, true, "locks" in navigator ? "有支援" : "不支援");

  // 1. 登入狀態與 token 的時間戳
  let token = null;
  await timed("讀取本機登入狀態", async () => {
    const { data, error } = await sb.auth.getSession();
    if (error) throw error;
    if (!data.session) return "沒有登入";
    token = data.session.access_token;
    return data.session.user.email;
  });

  if (token) {
    const c = decodeJwt(token);
    if (c) {
      const now = Math.floor(Date.now() / 1000);
      const skew = c.iat - now;
      // iat 比裝置時間晚，代表這台裝置的時鐘比伺服器慢；差太多就會出現 JWT 相關錯誤
      row(
        "token 簽發時間 vs 裝置時間",
        null,
        Math.abs(skew) < 30,
        "簽發 " + new Date(c.iat * 1000).toLocaleString() +
          "／到期 " + new Date(c.exp * 1000).toLocaleString() +
          "／差 " + skew + " 秒" + (Math.abs(skew) >= 30 ? "（偏差過大）" : ""),
      );
      row("token 是否已過期", null, c.exp > now, c.exp > now ? "還有 " + (c.exp - now) + " 秒" : "已過期");
    }
  }

  // 2. 不經過 supabase-js，直接用原生 fetch 打同一支 API
  await timed("原生 fetch 讀 templates（不經過 supabase-js）", async () => {
    const r = await fetch(SUPABASE_URL + "/rest/v1/templates?select=id&limit=1", {
      headers: {
        apikey: SUPABASE_KEY,
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
    });
    const body = await r.text();
    if (!r.ok) throw new Error("HTTP " + r.status + " " + body.slice(0, 120));
    return "HTTP " + r.status + "，回傳 " + body.length + " bytes";
  });

  // 3. 同樣的查詢，改用 supabase-js。和上面一比就知道是不是函式庫卡住
  await timed("supabase-js 讀 templates", async () => {
    const { data, error } = await sb.from("templates").select("id").limit(1);
    if (error) throw error;
    return data.length + " 筆";
  });

  // 4. 首頁實際會用到的六個查詢，逐一計時
  const queries = [
    ["trips", () => sb.from("trips").select("*")],
    ["templates（全部）", () => sb.from("templates").select("*")],
    ["template_items（最重，約 373 筆）", () => sb.from("template_items").select("*")],
    ["trip_templates", () => sb.from("trip_templates").select("*")],
    ["trip_item_states", () => sb.from("trip_item_states").select("*")],
    ["trip_custom_items", () => sb.from("trip_custom_items").select("*")],
  ];
  for (const [name, q] of queries) {
    await timed(name, async () => {
      const { data, error } = await q();
      if (error) throw error;
      return data.length + " 筆";
    });
  }

  // 5. 六個一起並行，也就是首頁真正的做法
  await timed("六個查詢同時並行（首頁的實際做法）", async () => {
    const rs = await Promise.all(queries.map(([, q]) => q()));
    const bad = rs.find((r) => r.error);
    if (bad) throw bad.error;
    return rs.map((r) => r.data.length).join(" / ") + " 筆";
  });

  $("diagRun").disabled = false;
  $("diagCopy").disabled = false;
  $("diagMsg").textContent = "跑完了。按「複製結果」把文字貼給我，比截圖好讀。";
}

const HTML = `
<div class="pagehead">
  <h1>連線診斷</h1>
  <p>把每個查詢分開計時，看是伺服器慢還是瀏覽器這端卡住。
     跑完按「複製結果」，把文字貼回對話就好。</p>
</div>
<div class="btnrow">
  <button class="btn primary" id="diagRun">開始診斷</button>
  <button class="btn ghost" id="diagCopy" disabled>複製結果</button>
  <button class="btn ghost" id="diagBack">回我的清單</button>
</div>
<p class="msg" id="diagMsg"></p>
<div class="dtable" id="diagRows"></div>
<p class="ghint" style="margin-top:14px">
  每一項最多等 20 秒。看「原生 fetch」和「supabase-js」這兩列的耗時差多少：
  前者快、後者慢，就是瀏覽器端的函式庫卡住；兩個都慢就是伺服器那邊的問題。
</p>
`;

let built = false;
export function render() {
  const el = $("view-diag");
  if (!built) {
    el.innerHTML = '<div class="wrap">' + HTML + "</div>";
    $("diagRun").onclick = run;
    $("diagBack").onclick = () => { location.hash = "#/trips"; };
    $("diagCopy").onclick = async () => {
      const text = lines.join("\n");
      try {
        await navigator.clipboard.writeText(text);
        $("diagMsg").textContent = "已複製，貼回對話即可。";
      } catch (e) {
        $("diagMsg").textContent = "複製失敗，請直接截圖。";
      }
    };
    built = true;
  }
  // 進來就自動跑一次，少按一步
  run();
}
