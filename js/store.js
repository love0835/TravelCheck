// -----------------------------------------------------------------------------
// 寫入佇列：畫面先改，再把變更批次送回資料庫。
// 送出失敗（例如網路斷了）就留在佇列裡，存進 localStorage，之後自動重送。
// -----------------------------------------------------------------------------
import * as api from "./api.js";

const LSKEY = "travelcheck_pending_v2";
const DEBOUNCE = 550;

let queue = new Map(); // key -> op
let timer = null;
let sending = false;
let backoff = 0;
let noteEl = null;

/* --------------------------- 畫面下方的同步提示 ---------------------------- */
export function toast(text, kind) {
  if (!noteEl) noteEl = document.getElementById("syncNote");
  if (!noteEl) return;
  if (!text) {
    noteEl.hidden = true;
    return;
  }
  noteEl.textContent = text;
  noteEl.className = kind === "err" ? "err" : "";
  noteEl.hidden = false;
  clearTimeout(toast._t);
  if (kind !== "err") toast._t = setTimeout(() => (noteEl.hidden = true), 2200);
}

/* ------------------------------- 佇列本體 -------------------------------- */
function persist() {
  try {
    const arr = [...queue.entries()];
    if (arr.length) localStorage.setItem(LSKEY, JSON.stringify(arr));
    else localStorage.removeItem(LSKEY);
  } catch (e) {
    /* 隱私模式等情況寫不進去，忽略即可 */
  }
}

function restore() {
  try {
    const raw = localStorage.getItem(LSKEY);
    if (raw) queue = new Map(JSON.parse(raw));
  } catch (e) {
    queue = new Map();
  }
}

function schedule(delay) {
  clearTimeout(timer);
  timer = setTimeout(flush, delay ?? DEBOUNCE);
}

// key 相同的操作會覆蓋前一筆，所以連點十下只會送出最後的狀態
export function push(key, op) {
  const prev = queue.get(key);
  queue.set(key, prev && op.t === "trip" ? { ...prev, patch: { ...prev.patch, ...op.patch } } : op);
  persist();
  schedule();
}

async function run(op) {
  if (op.t === "state") {
    await api.putItemState(op.tripId, op.itemId, {
      status: op.status,
      prev_status: op.prev,
      value: op.value,
    });
  } else if (op.t === "states") {
    await api.putItemStates(op.tripId, op.rows);
  } else if (op.t === "custom") {
    await api.updateCustomItem(op.id, {
      title: op.title,
      status: op.status,
      prev_status: op.prev,
    });
  } else if (op.t === "trip") {
    await api.updateTrip(op.tripId, op.patch);
  }
}

export async function flush() {
  if (sending || !queue.size) return;
  sending = true;
  const batch = [...queue.entries()];
  let failed = false;
  for (const [key, op] of batch) {
    try {
      await run(op);
      queue.delete(key);
    } catch (e) {
      failed = true;
      break; // 大多是網路或權限問題，繼續送也是白費
    }
  }
  persist();
  sending = false;

  if (failed) {
    backoff = Math.min(backoff ? backoff * 2 : 2000, 30000);
    toast(`有 ${queue.size} 筆變更還沒存上去，正在重試⋯⋯`, "err");
    schedule(backoff);
  } else {
    if (backoff) toast("已全部同步。");
    backoff = 0;
  }
}

export function pendingCount() {
  return queue.size;
}

// 需要「確定寫完」的時機（例如離開清單頁）就 await 這個
export async function flushNow() {
  clearTimeout(timer);
  await flush();
  return queue.size === 0;
}

restore();
if (queue.size) schedule(1200);

window.addEventListener("online", () => {
  backoff = 0;
  schedule(200);
});

window.addEventListener("beforeunload", (e) => {
  if (queue.size) {
    flush();
    e.preventDefault();
    e.returnValue = "";
  }
});
