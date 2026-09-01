// -----------------------------------------------------------------------------
// 新手教學頁。內容是靜態的，只有「三種狀態」那一段做成可以直接點的示範。
// -----------------------------------------------------------------------------
import { EYE, icon } from "./icons.js";

const $ = (id) => document.getElementById(id);
let built = false;

const HTML = `
<div class="pagehead">
  <h1>教學</h1>
  <p>五分鐘看完，之後隨時可以從上面的「教學」回來查。</p>
</div>

<section class="gsec">
  <h2><span class="gnum">1</span>60 秒上手</h2>
  <ol class="gsteps">
    <li><b>開一份清單</b>：到「我的清單」按 <span class="gk">＋ 新增清單</span>，
        取個名字，例如「成都旅遊」。目的地和出發日可以留空。</li>
    <li><b>挑模板</b>：下面會列出所有模板。一般行程的已經幫你勾好了，
        高山、海邊、滑雪、露營、寵物這幾類要自己加。</li>
    <li><b>開始勾</b>：東西收好一樣就點一樣。進度條會告訴你還剩幾項。</li>
  </ol>
  <p class="gnote">下次旅行不用重來一遍 —— 再開一份新清單就好，兩份的進度是分開的。</p>
</section>

<section class="gsec">
  <h2><span class="gnum">2</span>清單和模板，差在哪</h2>
  <div class="gdiagram">
    <div class="gcol">
      <div class="gcolhead">模板＝內容</div>
      <div class="gbox tpl">隨身</div>
      <div class="gbox tpl">託運｜盥洗</div>
      <div class="gbox tpl">場景｜滑雪</div>
    </div>
    <div class="garrow" aria-hidden="true">
      <svg viewBox="0 0 40 120" width="40" height="120" fill="none" stroke="currentColor" stroke-width="1.6">
        <path d="M4 26h26M4 60h26M4 94h26" stroke-dasharray="3 4"/>
        <path d="M26 21l6 5-6 5M26 55l6 5-6 5M26 89l6 5-6 5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div class="gcol">
      <div class="gcolhead">清單＝一次旅行</div>
      <div class="gbox trip">成都旅遊<small>用了：隨身、託運｜盥洗</small></div>
      <div class="gbox trip">遼寧旅遊<small>用了：隨身、場景｜滑雪</small></div>
    </div>
  </div>
  <p><b>清單不會把模板的內容複製一份</b>，只是「借來用」。所以：</p>
  <ul class="gbullets">
    <li>你在模板頁改了「隨身」，<b>成都旅遊和遼寧旅遊會一起變</b>。</li>
    <li>但兩份清單<b>各自的勾選是分開的</b>，改模板不會把你勾好的洗掉。</li>
    <li>清單建好之後還能加減模板 —— 在清單裡按右上角的<span class="gk">模板</span>。</li>
  </ul>
</section>

<section class="gsec">
  <h2><span class="gnum">3</span>每一項有三種狀態</h2>
  <p>這段可以直接點點看，跟真的清單一模一樣：</p>
  <ul class="gdemo" id="gDemo"></ul>
  <ul class="gbullets">
    <li><b>點名稱</b>＝已經帶了／已經做了，會變綠色打勾。</li>
    <li><b>點右邊的閉眼圖示</b>＝這次不需要，會變灰色，而且<b>從進度裡扣掉</b>。再點「復原」就回來。</li>
    <li>段落標題右邊的<span class="gk">整組不需要</span>可以一次收起一整段，例如這趟不住飯店就把酒店那段收掉。</li>
  </ul>
  <p class="gnote">「不需要」和「沒勾」是不一樣的。沒勾的會一直提醒你還沒帶，
     標成不需要的則完全不算進進度，這樣進度條才不會永遠到不了 100%。</p>
</section>

<section class="gsec">
  <h2><span class="gnum">4</span>東西太多找不到</h2>
  <ul class="gbullets">
    <li><b>搜尋</b>：最上面那格，打「眼罩」就只剩含眼罩的項目。</li>
    <li><span class="gk">跳到段落</span>：一次看到所有段落和各自剩幾項，點了直接跳過去。</li>
    <li>右下角的圓鈕：<b>↑</b> 回最上面、<b>↓</b> 到最下面、
        <b>!</b> 重要提醒（緊急電話、上機前注意事項）、<b>?</b> 說明。</li>
  </ul>
</section>

<section class="gsec">
  <h2><span class="gnum">5</span>篩選：讓清單只剩你要看的</h2>
  <div class="gtable">
    <div><b>模式</b><span>「極簡」會把飯店通常有提供、或當地買得到的東西自動標成不需要。行李想輕就用這個。</span></div>
    <div><b>寵物</b><span>按了才會出現餵食、保姆那些項目。沒養寵物就別開。</span></div>
    <div><b>性別</b><span>選「男生」會收掉女性用品，選「女生」反之。</span></div>
    <div><b>檢視</b><span>「只看未帶」＝把已經勾好的藏起來，打包最後階段很好用。「收起不需要」＝把灰掉的也藏起來。</span></div>
    <div><b>分類</b><span>最上面的「全部／物品／待辦」。物品是要帶的東西，待辦是要做的事（訂位、換錢、關瓦斯）。</span></div>
  </div>
  <p class="gnote">這些可以互相組合，而且會記在這份清單裡，下次打開還是同樣的設定。</p>
</section>

<section class="gsec">
  <h2><span class="gnum">6</span>加自己的東西</h2>
  <ul class="gbullets">
    <li>每一段最下面都有<span class="gk">＋ 新增項目</span>，打字就會加進去。</li>
    <li>這樣加的只存在<b>這一份清單</b>裡，不會動到模板，也不會影響別份清單。</li>
    <li>「隨身」段落最後有一格空白欄，是留給你填自己的常用藥的。填了才會算進進度。</li>
    <li>想讓某樣東西<b>每次旅行都出現</b>，那就要加到模板裡（看下一段）。</li>
  </ul>
</section>

<section class="gsec">
  <h2><span class="gnum">7</span>做自己的模板</h2>
  <p>公用模板有 31 個、373 項，是大家共用的，所以<b>唯讀不能改</b>。要改就複製一份：</p>
  <ol class="gsteps">
    <li>上面按<span class="gk">模板</span>，左邊挑一個公用模板，例如「隨身」。</li>
    <li>按<span class="gk">複製成我的模板</span>。它會問你要不要把<b>已經在用原版的清單一起換過來</b>
        —— 按「換過去」的話，你原本勾好的紀錄會一起搬過去，不會白勾。</li>
    <li>之後就能改名字、改圖示、增刪項目、調順序。改完自動存，不用按儲存。</li>
  </ol>
  <p>也可以按<span class="gk">＋ 新建空白模板</span>從零開始，例如做一個「出差」或「帶小孩」的模板。</p>
  <p class="gwarn">改模板會<b>立刻套用到所有正在用它的清單</b>。編輯畫面最上面會寫目前有幾份清單在用，
     刪項目前先看一眼。</p>
</section>

<section class="gsec">
  <h2><span class="gnum">8</span>資料存在哪、會不會不見</h2>
  <ul class="gbullets">
    <li>全部存在你的帳號裡。換手機、換電腦、換瀏覽器，<b>登入就看得到</b>。</li>
    <li>勾選是即時存的，不用按儲存。網路斷掉的話會先記在本機，連回來自動補送。</li>
    <li>想留一份離線副本：「我的清單」按<span class="gk">匯出備份</span>，會下載一個 JSON 檔。</li>
    <li><span class="gk">匯入備份</span>一律<b>建立成新的</b>清單與模板，不會覆蓋你現有的東西。</li>
  </ul>
</section>

<section class="gsec">
  <h2><span class="gnum">9</span>常見問題</h2>
  <div class="gqa">
    <div><b>刪掉的清單救得回來嗎？</b><span>救不回來。刪除要按兩次就是這個原因。在意的話先匯出備份。</span></div>
    <div><b>「全部還原」會刪掉什麼？</b><span>只清空<b>這一份清單</b>的勾選、自己加的項目和備註。其他清單和所有模板都不受影響。</span></div>
    <div><b>公用模板為什麼不能改？</b><span>那是所有人共用的一份。你改了別人也會被改到，所以鎖起來。複製一份就能隨便改。</span></div>
    <div><b>出現「載入失敗」怎麼辦？</b><span>先按「重試」。還是不行就按「清除本機登入狀態」重新登入 —— 你的資料在雲端，不會因為這樣不見。</span></div>
    <div><b>可以把清單分享給旅伴嗎？</b><span>目前不行，每個帳號的資料是完全隔開的。要共用的話，兩個人登入同一個帳號。</span></div>
  </div>
</section>

<div class="btnrow" style="margin:26px 0 8px">
  <button class="btn primary" id="gGoTrips">開始建立我的第一份清單</button>
</div>
<footer>看不懂或哪裡怪怪的，都可以再問。</footer>
`;

// 三種狀態的互動示範：行為刻意和真的清單一致
const DEMO = [
  { t: "護照", n: "沒有它哪裡都去不了", s: 0 },
  { t: "行動電源", n: "只能隨身，不可託運", s: 1 },
  { t: "吹風機", n: "飯店大多有提供", s: 2 },
];

function paintDemo() {
  const ul = $("gDemo");
  ul.innerHTML = DEMO.map(
    (d, i) =>
      '<li data-i="' + i + '" data-s="' + d.s + '">' +
      '<label><span class="box"></span><span class="txt">' + d.t +
      '<span class="note">' + d.n + "</span></span></label>" +
      '<button class="skipbtn">' + (d.s === 2 ? "復原" : EYE) + "</button></li>",
  ).join("");
}

function wireDemo() {
  $("gDemo").addEventListener("click", (e) => {
    const li = e.target.closest("li[data-i]");
    if (!li) return;
    const d = DEMO[+li.dataset.i];
    if (e.target.closest(".skipbtn")) d.s = d.s === 2 ? 0 : 2;
    else if (d.s !== 2) d.s = d.s === 1 ? 0 : 1;
    else return;
    paintDemo();
  });
}

export function render() {
  const el = $("view-guide");
  if (!built) {
    el.innerHTML = '<div class="wrap guidewrap">' + HTML + "</div>";
    paintDemo();
    wireDemo();
    $("gGoTrips").onclick = () => { location.hash = "#/trips/new"; };
    built = true;
  }
}
