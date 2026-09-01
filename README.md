# 旅行清單 TravelCheck

可以重複使用的旅行打包／待辦清單。每次旅行開一份清單，挑幾個模板，照著勾一遍。

- **帳號登入**：Email + 密碼，資料存雲端，換手機登入就看得到
- **模板**：31 個公用模板（唯讀），可複製成自己的自由增刪，也能從零新建
- **多份清單**：成都旅遊、遼寧旅遊各開一份，進度互不影響
- **模板一改，清單跟著變**：清單只「引用」模板，不複製內容
- **內建教學**：導覽列的「教學」有完整說明，第一次登入的空清單頁有三步驟引導

畫面與手機操作手感沿用原始單檔版（`legacy/v260901n.html`），資料層換成 Supabase。

---

## 先試用，不用設定任何東西

把整包 clone 下來，開一個靜態伺服器，打開 **`dev-test.html`**：

```bash
python3 -m http.server 8000
# 瀏覽器開 http://localhost:8000/dev-test.html
```

這個頁面用 `tools/mock-supabase.js` 假替身跑，資料只存在你自己的瀏覽器裡，
不需要 Supabase、不需要註冊。適合先看看整套流程長什麼樣。

正式站請用 `index.html`，需要下面的設定。

---

## 正式上線：四個步驟

### 1. 開一個 Supabase 免費專案

到 [supabase.com](https://supabase.com) 註冊，建立一個新專案（Free 方案就夠）。
記住你設定的資料庫密碼，之後不一定用得到，但弄丟很麻煩。

### 2. 建表與匯入公用模板

專案左側選 **SQL Editor**，**依序**貼上並執行這兩個檔案的內容：

1. `db/schema.sql` — 建立 6 張表與權限規則（RLS）
2. `db/seed_public_templates.sql` — 匯入 31 個公用模板、373 個項目

> `schema.sql` 開頭會先 `drop table`，重跑會清空所有資料，正式用之後別再執行第二次。

### 3. 設定登入方式

- **Authentication → Sign In / Providers → Email**：把 **Confirm email** 關掉
  （不關的話，使用者註冊完要先去收驗證信才能登入。程式有處理這個情況，
  會提示去收信，但自己人用的話關掉方便得多）
- **Authentication → URL Configuration → Site URL**：填你的網站網址，
  例如 `https://love0835.github.io/TravelCheck/`

### 4. 填連線資訊並開站

在 Supabase 專案首頁按網址旁邊的 **Copy**，取得 **Project URL** 與 **Publishable key**
（新版格式是 `sb_publishable_...`；比較舊的專案是 Project Settings → API 裡
`eyJ...` 開頭的 anon key，兩種這個專案都支援）。填進 `js/config.js`：

```js
export const SUPABASE_URL = "https://xxxxxxxx.supabase.co";
export const SUPABASE_KEY = "sb_publishable_....";
```

> 這兩個值本來就設計成公開（前端一定看得到，key 的名字就叫 publishable），
> 實際權限完全由資料庫的 RLS 規則把關，放在 GitHub 公開儲存庫上是安全的。
> **千萬不要**把 `service_role` 或 `secret` key 放進來。

commit 並 push 之後，到 GitHub 儲存庫的 **Settings → Pages**，
Source 選 **Deploy from a branch**，挑你的分支與根目錄，儲存。
幾十秒後就能從 `https://<帳號>.github.io/TravelCheck/` 打開。

---

## 資料怎麼存的

| 表 | 放什麼 |
|---|---|
| `templates` | 模板本身。`owner_id` 為 null 且 `is_public` 為 true 者是公用模板 |
| `template_items` | 模板底下的項目，`flags` 記重要／自填欄／寵物／男女 |
| `trips` | 每一份旅行清單 |
| `trip_templates` | **這份清單用了哪些模板（只存參照，不複製內容）** |
| `trip_item_states` | 每份清單對每個項目的狀態：0 未勾／1 已完成／2 不需要 |
| `trip_custom_items` | 在清單裡臨時加的項目，不會回寫模板 |

**為什麼改模板時清單會跟著變**：清單不存模板內容，只存 `trip_templates` 這條參照，
畫面是每次開啟時即時組合出來的。所以模板一改，所有引用它的清單立刻是新內容；
勾選狀態以項目 id 為鍵分開存，不會被模板改動洗掉。模板刪項目時，
對應的勾選紀錄由 `on delete cascade` 一併清乾淨。

權限方面，公用模板的 `owner_id` 是 null，而更新／刪除的規則要求 `owner_id = auth.uid()`，
所以任何人都改不動公用模板 —— 唯讀是資料庫層級保證的，不是只靠前端藏按鈕。

---

## 檔案結構

```
index.html                 正式站入口
dev-test.html              本機試用版（用假資料庫，不需設定）
css/app.css                樣式（前半段原樣取自 legacy 單檔版）
js/config.js               Supabase 連線設定 ← 要自己填
js/supabase.js             建立 Supabase client
js/app.js                  路由、登入把關、說明與提醒彈窗
js/auth.js                 註冊與登入
js/api.js                  所有資料庫存取
js/store.js                寫入佇列：畫面先改，批次寫回，斷線會重試
js/checklist.js            清單內頁（原本那個畫面）
js/trips.js                清單總覽、新增清單、匯出匯入
js/templates.js            模板編輯介面
js/guide.js                新手教學頁
js/icons.js  js/minskip.js 圖示與極簡模式清單（取自 legacy）
db/schema.sql              建表與 RLS
db/seed_public_templates.sql  公用模板資料（自動產生，勿手改）
tools/extract-seed.mjs     從 legacy HTML 重新產生上面那份 seed
tools/mock-supabase.js     本機試用版用的假 Supabase
tools/make-dev-test.mjs    由 index.html 產生 dev-test.html
legacy/v260901n.html       原始單檔版，保留備查
```

`dev-test.html` 是由 `index.html` 產生的，**改完 index.html 記得重跑**，
否則本機試用版會跟正式站對不起來：

```bash
node tools/make-dev-test.mjs
```

重新產生公用模板 seed（只有動到 `legacy/v260901n.html` 才需要）：

```bash
node tools/extract-seed.mjs > db/seed_public_templates.sql
node tools/extract-seed.mjs --json > tools/seed.json
```

---

## 備份

「我的清單」頁面有 **匯出備份**，會下載一份含所有清單、勾選與自訂模板的 JSON。
**匯入備份**一律建立成新的清單與模板，不會覆蓋現有資料。
