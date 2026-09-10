/*
 * PDF 頁面整理（utils/pdf-pages.md）。
 *
 * 合併、抽頁、刪頁、換順序、轉方向，全部在本機做完。
 *
 * === 為什麼收進小工具區 ===
 *
 * 這件事本身不是資安工作，是雜事，而雜事正是讀者每天真的會打開瀏覽器做的事。
 * 現行的免費線上服務要把整份檔案上傳。以其中一家的隱私政策為例，寫的是處理完
 * 兩小時內刪除，政策乾淨，但那兩小時裡完整的檔案在別人的伺服器上，而多數人
 * 沒讀過那份政策。合約、報帳單、陳情附件、履歷都這樣送出去過。
 *
 * === 輸出不帶原檔的文件欄位 ===
 *
 * 這一頁跟 strip-metadata 是同一組動作的兩端。pdf-lib 的 copyPages 只搬頁面內容，
 * 文件層的標題、作者、主旨、關鍵字留在來源那一份，不會跟過來，而新文件的製作
 * 軟體欄位由我們自己清空。整理完的檔案因此比原檔乾淨。頁面內容裡的東西不在
 * 這一頁的守備範圍，見 utils/redact.md 與 utils/strip-metadata.md。
 *
 * 檔名固定 pages.pdf。原檔名常帶承辦人姓名、案號與日期，那本身就是一種洩漏，
 * 跟 redact.js 固定成 redacted.png 是同一個理由。
 *
 * === 交出去之前先驗一次 ===
 *
 * 輸出組好之後重新載入一次，比對頁數、每一頁的方向與尺寸是不是跟計畫一致，
 * 對不上就不給下載。理由跟 redact.js 逐像素檢查一樣：讀者不會自己打開檢查，
 * 而錯誤的輸出看起來跟正確的一模一樣。
 *
 * === 這一期沒有頁面預覽 ===
 *
 * 畫出頁面長什麼樣需要一個完整的 PDF 算繪器（pdf.js，約 1.4 MB），pdf-lib 做不到。
 * 這一期先不付那個成本，改成把每一頁的尺寸與目前方向寫在頁碼旁邊，選頁靠頁碼。
 * 之後要做「遮蔽有沒有真的生效」的檢查時會一起把 pdf.js 帶進來，那時再補預覽。
 *
 * 三個語系共用這一份，docs/en/js/ 與 docs/zh-CN/js/ 底下是指向這裡的 symlink。
 * 純邏輯由 tools/test_pdfpages.mjs 原地抽出來測，那支另外掃原始碼確認沒有任何
 * 送出或留存資料的手段。
 */
(function () {
  "use strict";

  // --- 純邏輯（tools/test_pdfpages.mjs 從這裡原地抽出來測）---

  // 輸出檔名固定。原檔名常帶承辦人姓名、案號與日期。
  const OUTPUT_NAME = "pages.pdf";

  // 一次收多少份。超過這個數量的操作已經不是「整理」而是批次作業，那種需求
  // 該用命令列工具，瀏覽器裡把記憶體吃光只會讓分頁被系統收掉。
  const MAX_FILES = 20;

  // 全部檔案合計的頁數上限。pdf-lib 把整份文件放在記憶體裡，手機上撐不住太多。
  const MAX_PAGES = 500;

  // 單一檔案的位元組上限。超過的多半是掃描檔，那種檔案在手機上載入就會卡住。
  const MAX_BYTES = 100 * 1024 * 1024;

  // PDF 的方向欄位只認四個角度，其他值 pdf-lib 會拒絕。
  const ROTATIONS = [0, 90, 180, 270];

  /**
   * 把使用者打的頁碼字串換成 0 起算的頁次陣列。
   *
   * 接受 "1-3, 5, 8-" 這種寫法，逗號與頓號都收，全形逗號也收，因為中文輸入法
   * 底下打出全形是常態。空字串當成「全部」，那是最常用的情況（合併整份）。
   *
   * 回傳 { pages, error }。error 不是 null 的時候 pages 一定是空陣列，呼叫端
   * 不必再自己判斷。
   */
  function parsePageRange(text, total) {
    const empty = { pages: [], error: null };
    if (total <= 0) return empty;

    const raw = String(text == null ? "" : text).trim();
    if (!raw) return { pages: allPages(total), error: null };

    const normalized = raw
      .replace(/[，、]/g, ",")
      .replace(/[－–—~～]/g, "-")
      .replace(/\s+/g, "");

    const seen = new Set();
    const pages = [];
    for (const part of normalized.split(",")) {
      if (!part) continue;

      const dash = part.indexOf("-");
      if (dash === -1) {
        const n = toPageNumber(part);
        if (n === null) return { pages: [], error: "badRange" };
        if (n < 1 || n > total) return { pages: [], error: "outOfRange" };
        pushOnce(pages, seen, n - 1);
        continue;
      }

      // "8-" 代表第 8 頁到最後一頁，"-3" 代表第 1 頁到第 3 頁
      const headText = part.slice(0, dash);
      const tailText = part.slice(dash + 1);
      const head = headText === "" ? 1 : toPageNumber(headText);
      const tail = tailText === "" ? total : toPageNumber(tailText);
      if (head === null || tail === null) return { pages: [], error: "badRange" };
      if (head < 1 || tail < 1 || head > total || tail > total) {
        return { pages: [], error: "outOfRange" };
      }
      // 反著寫（"7-3"）當成正著寫，使用者要的是那個區間
      const from = Math.min(head, tail);
      const to = Math.max(head, tail);
      for (let n = from; n <= to; n += 1) pushOnce(pages, seen, n - 1);
    }

    if (!pages.length) return { pages: [], error: "badRange" };
    return { pages, error: null };
  }

  function toPageNumber(text) {
    // 只認半形與全形的阿拉伯數字，其他一律當成打錯
    const half = text.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
    if (!/^\d+$/.test(half)) return null;
    const n = Number(half);
    return Number.isSafeInteger(n) ? n : null;
  }

  function pushOnce(list, seen, value) {
    if (seen.has(value)) return;
    seen.add(value);
    list.push(value);
  }

  function allPages(total) {
    const out = [];
    for (let i = 0; i < total; i += 1) out.push(i);
    return out;
  }

  /**
   * 目前角度加上一個增量，收斂回 PDF 認得的四個值。
   * 來源檔案裡出現過負值與 450 這種角度，直接丟給 pdf-lib 會整份失敗。
   */
  function normalizeRotation(current, delta) {
    const base = Number.isFinite(current) ? current : 0;
    const step = Number.isFinite(delta) ? delta : 0;
    const value = (((base + step) % 360) + 360) % 360;
    // 不是 90 的倍數的來源角度，取最近的一個，不要把整份擋下來。
    // 正中間（45、135…）往大的那一邊走，這是 Math.round 的行為，寫死在測試裡。
    return (Math.round(value / 90) * 90) % 360;
  }

  /**
   * 把一份文件的頁面尺寸換成人看得懂的描述。
   * 沒有預覽的情況下，尺寸與方向是讀者唯一能用來確認選對頁的線索。
   */
  function describeSize(width, height, rotation) {
    const w = Math.round(Number(width) || 0);
    const h = Math.round(Number(height) || 0);
    if (!w || !h) return "";
    // 轉過 90 或 270 度的頁面，讀者看到的長寬是反的
    const turned = rotation === 90 || rotation === 270;
    const shownW = turned ? h : w;
    const shownH = turned ? w : h;
    const name = paperName(Math.min(shownW, shownH), Math.max(shownW, shownH));
    const orientation = shownW > shownH ? "landscape" : "portrait";
    return { w: shownW, h: shownH, name, orientation };
  }

  // 常見紙張的點數（1 pt = 1/72 吋）。容許幾個點的誤差，掃描與轉檔常有零頭。
  const PAPERS = [
    { name: "A4", short: 595, long: 842 },
    { name: "A3", short: 842, long: 1191 },
    { name: "A5", short: 420, long: 595 },
    { name: "Letter", short: 612, long: 792 },
    { name: "Legal", short: 612, long: 1008 },
    { name: "B5", short: 499, long: 709 },
  ];

  function paperName(short, long) {
    for (const paper of PAPERS) {
      if (Math.abs(short - paper.short) <= 4 && Math.abs(long - paper.long) <= 4) {
        return paper.name;
      }
    }
    return "";
  }

  /**
   * 把「哪幾份檔案、各自要哪幾頁」換成一份輸出計畫。
   * 計畫是驗證的依據：輸出組好之後重新載入，逐頁比對這份計畫。
   */
  function buildPlan(files) {
    const plan = [];
    for (const file of files) {
      if (!file || !file.pages) continue;
      for (const index of file.selection) {
        const page = file.pages[index];
        if (!page) continue;
        plan.push({
          fileId: file.id,
          index,
          rotation: normalizeRotation(page.rotation, page.turn || 0),
          width: page.width,
          height: page.height,
        });
      }
    }
    return plan;
  }

  /**
   * 比對輸出的實際內容與計畫。回傳沒對上的那一項，全部對上回 null。
   *
   * 尺寸用四捨五入後比對。pdf-lib 搬頁面時保留原本的 MediaBox，但浮點數在
   * 寫檔與重讀之間會有小數點以下的差異，直接比會假警報。
   */
  function verifyPlan(plan, actual) {
    if (!Array.isArray(actual)) return { reason: "shape", at: -1 };
    if (actual.length !== plan.length) {
      return { reason: "count", at: -1, expected: plan.length, got: actual.length };
    }
    for (let i = 0; i < plan.length; i += 1) {
      const want = plan[i];
      const got = actual[i];
      if (!got) return { reason: "shape", at: i };
      if (normalizeRotation(got.rotation, 0) !== want.rotation) {
        return { reason: "rotation", at: i, expected: want.rotation, got: got.rotation };
      }
      // 尺寸比的是 MediaBox，轉方向不會動到它，所以兩邊直接比就好。頁面轉過
      // 之後讀者看到的長寬會對調，那是 describeSize 的事，不是這裡的事。
      if (
        Math.abs(Math.round(want.width) - Math.round(got.width)) > 1 ||
        Math.abs(Math.round(want.height) - Math.round(got.height)) > 1
      ) {
        return { reason: "size", at: i };
      }
    }
    return null;
  }

  /** 把一份檔案在清單裡往前或往後移一格，回傳新的順序。 */
  function moveFile(list, id, delta) {
    const from = list.findIndex((item) => item.id === id);
    if (from === -1) return list;
    const to = from + (delta < 0 ? -1 : 1);
    if (to < 0 || to >= list.length) return list;
    const next = list.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  }

  /** 把頁次陣列寫回 "1-3, 5" 這種最短的表示法。 */
  function compactRange(pages) {
    if (!pages.length) return "";
    const parts = [];
    let start = pages[0];
    let prev = pages[0];
    for (let i = 1; i <= pages.length; i += 1) {
      const current = pages[i];
      if (current === prev + 1) {
        prev = current;
        continue;
      }
      parts.push(start === prev ? String(start + 1) : start + 1 + "-" + (prev + 1));
      start = current;
      prev = current;
    }
    return parts.join(", ");
  }

  function humanSize(bytes) {
    const n = Number(bytes) || 0;
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1).replace(/\.0$/, "") + " KB";
    return (n / 1024 / 1024).toFixed(1).replace(/\.0$/, "") + " MB";
  }

  // --- 介面 ---

  const root = document.getElementById("pdfpages-tool");
  if (!root) return;

  const CSS = `
    #pdfpages-tool { margin: 1em 0; }
    #pdfpages-tool .pp-drop {
      border: .1rem dashed var(--md-default-fg-color--lighter);
      border-radius: .2rem; padding: 1.6rem 1rem; text-align: center;
      font-size: .78rem; line-height: 1.8; cursor: pointer;
    }
    #pdfpages-tool .pp-drop--over {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #pdfpages-tool input[type="file"] { display: none; }
    #pdfpages-tool .pp-file {
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .6rem .7rem; margin: .6rem 0;
    }
    #pdfpages-tool .pp-file-head {
      display: flex; flex-wrap: wrap; align-items: baseline; gap: .4rem;
      font-size: .76rem; margin-bottom: .4rem;
    }
    #pdfpages-tool .pp-file-name { font-weight: 700; word-break: break-all; }
    #pdfpages-tool .pp-file-meta { font-size: .7rem; opacity: .75; }
    #pdfpages-tool .pp-file-tools { margin-left: auto; display: flex; gap: .3rem; }
    #pdfpages-tool .pp-range {
      display: flex; flex-wrap: wrap; align-items: center; gap: .4rem;
      font-size: .74rem; margin: .4rem 0;
    }
    #pdfpages-tool .pp-range input[type="text"] {
      font: inherit; font-size: .74rem; color: inherit; background: none;
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .25rem .5rem; min-width: 8rem; flex: 1 1 8rem;
    }
    #pdfpages-tool .pp-turns { display: flex; flex-wrap: wrap; gap: .4rem; margin: .4rem 0 0; }
    #pdfpages-tool .pp-pages { display: flex; flex-wrap: wrap; gap: .25rem; margin: .4rem 0 0; }
    #pdfpages-tool .pp-page {
      font: inherit; font-size: .68rem; line-height: 1.3; color: inherit; cursor: pointer;
      background: none; border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .2rem .4rem; min-width: 2rem; text-align: center;
    }
    #pdfpages-tool .pp-page--on {
      background: var(--md-accent-fg-color--transparent);
      border-color: var(--md-accent-fg-color);
    }
    #pdfpages-tool .pp-page-size { display: block; font-size: .6rem; opacity: .7; }
    #pdfpages-tool .pp-status { font-size: .74rem; margin: .8rem 0 .3rem; }
    #pdfpages-tool .pp-actions { display: flex; flex-wrap: wrap; gap: .4rem; margin: 0 0 .8rem; }
    #pdfpages-tool button, #pdfpages-tool a.pp-dl {
      font: inherit; font-size: .74rem; color: inherit; cursor: pointer; background: none;
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .3rem .7rem; display: inline-block; text-decoration: none;
    }
    /* 填了底色的按鈕不套通用 hover，不然文字會跟底色融在一起（offline-library 踩過） */
    #pdfpages-tool button:hover:not(:disabled):not(.pp-primary), #pdfpages-tool a.pp-dl:hover {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #pdfpages-tool .pp-primary {
      background: var(--md-primary-fg-color); color: var(--md-primary-bg-color);
      border-color: var(--md-primary-fg-color);
    }
    #pdfpages-tool .pp-primary:hover:not(:disabled) { filter: brightness(1.1); }
    #pdfpages-tool button:disabled { opacity: .5; cursor: default; }
    #pdfpages-tool .pp-result {
      border-left: .15rem solid #2e7d32; padding: .1rem 0 .1rem .6rem;
      margin: .8rem 0; font-size: .74rem; line-height: 1.7;
    }
    #pdfpages-tool .pp-result a.pp-dl { margin-top: .4rem; }
    #pdfpages-tool .pp-error {
      border-left: .15rem solid #c62828; padding: .1rem 0 .1rem .6rem;
      margin: .8rem 0; font-size: .74rem; line-height: 1.7;
    }
    #pdfpages-tool .pp-loading {
      font-size: .78rem; line-height: 1.8; margin: .8rem 0 0;
      border-left: .15rem solid var(--md-primary-fg-color); padding-left: .6rem;
    }
    #pdfpages-tool .pp-note { font-size: .7rem; opacity: .75; line-height: 1.7; margin: .8rem 0 0; }
    @media (pointer: coarse) {
      #pdfpages-tool button, #pdfpages-tool a.pp-dl { min-height: 2.2rem; }
      #pdfpages-tool .pp-page { min-height: 2.2rem; }
    }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const STRINGS = {
    "zh-TW": {
      drop: "把 PDF 拖進來，或點一下選檔案。可以一次選好幾份。",
      dropOver: "放開就載入",
      loading: "載入中",
      working: "整理中",
      addMore: "再加一份",
      clear: "全部清掉",
      up: "往前",
      down: "往後",
      remove: "移除",
      rangeLabel: "要哪幾頁",
      rangePlaceholder: "留空就是整份，也可以打 1-3, 5, 8-",
      pageCount: "{n} 頁",
      selected: "選了 {n} 頁",
      total: "輸出會有 {n} 頁",
      nothing: "還沒有選到任何一頁",
      rotateLeft: "整份左轉",
      rotateRight: "整份右轉",
      make: "產生整理好的 PDF",
      done: "整理完成，{n} 頁，{size}。輸出已經重新讀過一次，頁數與每一頁的方向都對得上。",
      download: "下載 " + OUTPUT_NAME,
      portrait: "直向",
      landscape: "橫向",
      note: "檔案不會離開你的裝置。程式存進裝置之後斷網也能用，那就是它沒有偷送東西最直接的證明。",
      errors: {
        notPdf: "只收 PDF。其他格式請用別的工具。",
        tooMany: "一次最多 " + MAX_FILES + " 份。",
        tooBig: "單一檔案超過 " + humanSize(MAX_BYTES) + "，瀏覽器載不動。",
        tooManyPages: "全部合計超過 " + MAX_PAGES + " 頁，瀏覽器記憶體不夠。",
        broken: "這份 PDF 讀不開，檔案可能損壞。",
        encrypted: "這份 PDF 有密碼保護，先解開再回來。",
        libMissing: "處理 PDF 需要的函式庫還沒載入完，稍等一下再試一次。",
        badRange: "頁碼看不懂，可以打 1-3, 5, 8- 這樣。",
        outOfRange: "頁碼超出這份檔案的範圍。",
        empty: "沒有選到任何一頁。",
        build: "組檔案的時候出錯，這份 PDF 可能有這個工具處理不了的結構。",
        verify: "輸出跟預期對不上，已經擋下來不給下載。這是工具的問題，請到 GitHub 回報。",
      },
    },
    "zh-CN": {
      drop: "把 PDF 拖进来，或点一下选文件。可以一次选好几份。",
      dropOver: "放开就加载",
      loading: "加载中",
      working: "整理中",
      addMore: "再加一份",
      clear: "全部清掉",
      up: "往前",
      down: "往后",
      remove: "移除",
      rangeLabel: "要哪几页",
      rangePlaceholder: "留空就是整份，也可以打 1-3, 5, 8-",
      pageCount: "{n} 页",
      selected: "选了 {n} 页",
      total: "输出会有 {n} 页",
      nothing: "还没有选到任何一页",
      rotateLeft: "整份左转",
      rotateRight: "整份右转",
      make: "生成整理好的 PDF",
      done: "整理完成，{n} 页，{size}。输出已经重新读过一次，页数与每一页的方向都对得上。",
      download: "下载 " + OUTPUT_NAME,
      portrait: "竖向",
      landscape: "横向",
      note: "文件不会离开你的设备。程序存进设备之后断网也能用，那就是它没有偷送东西最直接的证明。",
      errors: {
        notPdf: "只收 PDF。其他格式请用别的工具。",
        tooMany: "一次最多 " + MAX_FILES + " 份。",
        tooBig: "单一文件超过 " + humanSize(MAX_BYTES) + "，浏览器载不动。",
        tooManyPages: "全部合计超过 " + MAX_PAGES + " 页，浏览器内存不够。",
        broken: "这份 PDF 读不开，文件可能损坏。",
        encrypted: "这份 PDF 有密码保护，先解开再回来。",
        libMissing: "处理 PDF 需要的函式库还没加载完，稍等一下再试一次。",
        badRange: "页码看不懂，可以打 1-3, 5, 8- 这样。",
        outOfRange: "页码超出这份文件的范围。",
        empty: "没有选到任何一页。",
        build: "组文件的时候出错，这份 PDF 可能有这个工具处理不了的结构。",
        verify: "输出跟预期对不上，已经拦下来不给下载。这是工具的问题，请到 GitHub 回报。",
      },
    },
    en: {
      drop: "Drop PDFs here, or click to choose files. You can pick several at once.",
      dropOver: "Release to load",
      loading: "Loading",
      working: "Working",
      addMore: "Add another",
      clear: "Clear all",
      up: "Move up",
      down: "Move down",
      remove: "Remove",
      rangeLabel: "Pages to keep",
      rangePlaceholder: "Leave empty for all, or type 1-3, 5, 8-",
      pageCount: "{n} pages",
      selected: "{n} pages selected",
      total: "The output will have {n} pages",
      nothing: "No pages selected yet",
      rotateLeft: "Rotate all left",
      rotateRight: "Rotate all right",
      make: "Build the PDF",
      done: "Done: {n} pages, {size}. The output was read back once, and the page count and every page's orientation match.",
      download: "Download " + OUTPUT_NAME,
      portrait: "portrait",
      landscape: "landscape",
      note: "Your files never leave your device. Once the code is stored on your device it works offline, which is the most direct proof that nothing is being sent anywhere.",
      errors: {
        notPdf: "PDFs only. Use another tool for other formats.",
        tooMany: "At most " + MAX_FILES + " files at a time.",
        tooBig: "That file is over " + humanSize(MAX_BYTES) + ", which the browser cannot load.",
        tooManyPages: "More than " + MAX_PAGES + " pages in total, which is beyond the browser's memory.",
        broken: "This PDF cannot be opened. The file may be damaged.",
        encrypted: "This PDF is password protected. Unlock it first.",
        libMissing: "The library needed for PDFs has not finished loading. Wait a moment and try again.",
        badRange: "That page range is not readable. Try something like 1-3, 5, 8-",
        outOfRange: "That page number is outside this file's range.",
        empty: "No pages selected.",
        build: "Something went wrong while building the file. This PDF may use a structure this tool cannot handle.",
        verify: "The output does not match what was planned, so it has been withheld. This is a bug. Please report it on GitHub.",
      },
    },
  };

  const t = STRINGS[document.documentElement.lang] || STRINGS["zh-TW"];
  const fill = (text, vars) =>
    String(text).replace(/\{(\w+)\}/g, (match, key) => (key in vars ? vars[key] : match));

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  // pdf-lib 有三百多 KB。放在頁面裡用 script 標籤載，等於每個打開這一頁的人都要
  // 先等它下載完。改成第一次真的要處理檔案才去拿，寫法跟 stripmeta.js 一致。
  //
  // 離線副本仍然包含它：那個檔案列在這一頁 frontmatter 的 offline_assets 裡。
  let pdfLibLoading = null;

  function pdfLib() {
    return typeof window !== "undefined" ? window.PDFLib : null;
  }

  function loadPdfLib() {
    if (pdfLib()) return Promise.resolve(pdfLib());
    if (!pdfLibLoading) {
      pdfLibLoading = new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = new URL("../vendor/pdf-lib.min.js", location.href).href;
        script.onload = () => resolve(pdfLib());
        script.onerror = () => {
          // 失敗就讓下一次重試，不要卡在一個永遠不會完成的 promise 上
          pdfLibLoading = null;
          resolve(null);
        };
        document.head.appendChild(script);
      });
    }
    return pdfLibLoading;
  }

  let files = [];
  let nextId = 1;
  let working = false;
  let error = null;
  let result = null;

  function releaseResult() {
    if (result && result.url) URL.revokeObjectURL(result.url);
    result = null;
  }

  function totalPages() {
    return files.reduce((sum, file) => sum + file.selection.length, 0);
  }

  async function addFiles(list) {
    const incoming = Array.from(list || []).filter(Boolean);
    if (!incoming.length) return;
    releaseResult();
    error = null;

    if (files.length + incoming.length > MAX_FILES) {
      error = "tooMany";
      render();
      return;
    }

    working = true;
    render();

    const lib = await loadPdfLib();
    if (!lib) {
      working = false;
      error = "libMissing";
      render();
      return;
    }

    for (const file of incoming) {
      const looksPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name || "");
      if (!looksPdf) {
        error = "notPdf";
        continue;
      }
      if (file.size > MAX_BYTES) {
        error = "tooBig";
        continue;
      }
      const loaded = await readOne(lib, file);
      if (loaded.error) {
        error = loaded.error;
        continue;
      }
      const sum = files.reduce((n, item) => n + item.pages.length, 0);
      if (sum + loaded.file.pages.length > MAX_PAGES) {
        error = "tooManyPages";
        continue;
      }
      files.push(loaded.file);
    }

    working = false;
    render();
  }

  async function readOne(lib, file) {
    let bytes;
    try {
      bytes = new Uint8Array(await file.arrayBuffer());
    } catch (err) {
      return { error: "broken" };
    }
    let doc;
    try {
      doc = await lib.PDFDocument.load(bytes, { updateMetadata: false, ignoreEncryption: true });
    } catch (err) {
      return { error: "broken" };
    }
    if (doc.isEncrypted) return { error: "encrypted" };

    const pages = doc.getPages().map((page) => {
      const size = page.getSize();
      return {
        width: size.width,
        height: size.height,
        rotation: normalizeRotation(page.getRotation().angle, 0),
        turn: 0,
      };
    });
    if (!pages.length) return { error: "broken" };

    return {
      file: {
        id: nextId++,
        name: file.name || "document.pdf",
        size: file.size,
        bytes,
        pages,
        selection: allPages(pages.length),
        rangeText: "",
        rangeError: null,
      },
    };
  }

  function applyRange(file, text) {
    file.rangeText = text;
    const parsed = parsePageRange(text, file.pages.length);
    file.rangeError = parsed.error;
    if (!parsed.error) file.selection = parsed.pages;
    releaseResult();
  }

  function turnFile(file, delta) {
    for (const page of file.pages) page.turn = (page.turn || 0) + delta;
    releaseResult();
    render();
  }

  async function build() {
    releaseResult();
    error = null;
    const plan = buildPlan(files);
    if (!plan.length) {
      error = "empty";
      render();
      return;
    }

    working = true;
    render();

    const lib = await loadPdfLib();
    if (!lib) {
      working = false;
      error = "libMissing";
      render();
      return;
    }

    let bytes;
    try {
      // updateMetadata 一定要在建檔時就關掉。開著的話 pdf-lib 會在存檔時把
      // Producer 蓋成自己的名字、把修改時間改成當下，底下清空的那幾欄就白清了。
      // 這個選項只有 create() 與 load() 認得，save() 沒有這一項。
      const out = await lib.PDFDocument.create({ updateMetadata: false });

      // 文件層的欄位全部留空。pdf-lib 預設會把自己寫進 Producer 與 Creator，
      // 那兩欄會告訴收檔的人這份檔案是用什麼整理的，沒有必要。
      out.setTitle("");
      out.setAuthor("");
      out.setSubject("");
      out.setKeywords([]);
      out.setProducer("");
      out.setCreator("");
      // 建立與修改時間會寫出「這份檔案是什麼時候整理的」。歸零的做法跟
      // stripmeta.js 一致，兩支工具處理同一份檔案的結果才會一樣。
      const epoch = new Date(0);
      out.setCreationDate(epoch);
      out.setModificationDate(epoch);

      // 來源分好幾份，同一份只載入一次，逐頁複製過去。
      const sources = new Map();
      for (const file of files) {
        if (!file.selection.length) continue;
        sources.set(
          file.id,
          await lib.PDFDocument.load(file.bytes, { updateMetadata: false, ignoreEncryption: true })
        );
      }
      for (const item of plan) {
        const source = sources.get(item.fileId);
        if (!source) throw new Error("missing source");
        const [copied] = await out.copyPages(source, [item.index]);
        copied.setRotation(lib.degrees(item.rotation));
        out.addPage(copied);
      }
      bytes = await out.save({ useObjectStreams: true });
    } catch (err) {
      working = false;
      error = "build";
      render();
      return;
    }

    // 交出去之前重新讀一次，逐頁比對計畫。理由跟 redact.js 逐像素檢查一樣：
    // 讀者不會自己打開檢查，而錯誤的輸出看起來跟正確的一模一樣。
    let actual;
    try {
      const back = await lib.PDFDocument.load(bytes, { updateMetadata: false });
      actual = back.getPages().map((page) => {
        const size = page.getSize();
        return {
          width: size.width,
          height: size.height,
          rotation: page.getRotation().angle,
        };
      });
    } catch (err) {
      working = false;
      error = "verify";
      render();
      return;
    }
    if (verifyPlan(plan, actual)) {
      working = false;
      error = "verify";
      render();
      return;
    }

    const blob = new Blob([bytes], { type: "application/pdf" });
    result = { url: URL.createObjectURL(blob), size: blob.size, pages: plan.length };
    working = false;
    render();
  }

  function button(label, className, onClick, disabled) {
    const node = el("button", className, label);
    node.type = "button";
    if (disabled) node.disabled = true;
    node.addEventListener("click", onClick);
    return node;
  }

  function renderPicker(label) {
    const picker = document.createElement("input");
    picker.type = "file";
    picker.accept = "application/pdf,.pdf";
    picker.multiple = true;
    picker.addEventListener("change", () => {
      addFiles(picker.files);
      picker.value = "";
    });

    const drop = el("div", "pp-drop", label);
    drop.addEventListener("click", () => picker.click());
    drop.addEventListener("dragover", (event) => {
      event.preventDefault();
      drop.classList.add("pp-drop--over");
      drop.textContent = t.dropOver;
    });
    drop.addEventListener("dragleave", () => {
      drop.classList.remove("pp-drop--over");
      drop.textContent = label;
    });
    drop.addEventListener("drop", (event) => {
      event.preventDefault();
      drop.classList.remove("pp-drop--over");
      drop.textContent = label;
      addFiles(event.dataTransfer && event.dataTransfer.files);
    });
    root.appendChild(picker);
    root.appendChild(drop);
  }

  function renderWorking(label) {
    const line = el("p", "pp-loading");
    // 轉圈用全站共用的那顆，樣式定義在 overrides/base.html
    const spin = el("span", "anoni-spinner");
    spin.setAttribute("aria-hidden", "true");
    line.appendChild(spin);
    line.appendChild(document.createTextNode(label));
    line.setAttribute("aria-busy", "true");
    line.setAttribute("aria-live", "polite");
    root.appendChild(line);
  }

  function renderFile(file, index) {
    const box = el("div", "pp-file");

    const head = el("div", "pp-file-head");
    head.appendChild(el("span", "pp-file-name", file.name));
    head.appendChild(
      el("span", "pp-file-meta", fill(t.pageCount, { n: file.pages.length }) + "・" + humanSize(file.size))
    );
    const tools = el("div", "pp-file-tools");
    tools.appendChild(
      button(t.up, "", () => {
        files = moveFile(files, file.id, -1);
        releaseResult();
        render();
      }, index === 0)
    );
    tools.appendChild(
      button(t.down, "", () => {
        files = moveFile(files, file.id, 1);
        releaseResult();
        render();
      }, index === files.length - 1)
    );
    tools.appendChild(
      button(t.remove, "", () => {
        files = files.filter((item) => item.id !== file.id);
        releaseResult();
        render();
      })
    );
    head.appendChild(tools);
    box.appendChild(head);

    const range = el("div", "pp-range");
    const label = el("label", "", t.rangeLabel);
    const input = document.createElement("input");
    input.type = "text";
    input.value = file.rangeText;
    input.placeholder = t.rangePlaceholder;
    input.id = "pp-range-" + file.id;
    label.setAttribute("for", input.id);
    input.addEventListener("input", () => {
      applyRange(file, input.value);
      renderPagesInto(pages, file);
      status.textContent = statusText();
    });
    range.appendChild(label);
    range.appendChild(input);
    box.appendChild(range);

    // 轉方向自己一列。跟頁碼欄擠在同一列的話，390px 上會折行折在中間，看起來
    // 像是不小心掉下來的，而它們作用的對象也不同（頁碼挑頁，轉方向動整份）。
    const turns = el("div", "pp-turns");
    turns.appendChild(button(t.rotateLeft, "", () => turnFile(file, -90)));
    turns.appendChild(button(t.rotateRight, "", () => turnFile(file, 90)));
    box.appendChild(turns);

    if (file.rangeError) {
      box.appendChild(el("p", "pp-error", t.errors[file.rangeError] || t.errors.badRange));
    }

    const pages = el("div", "pp-pages");
    renderPagesInto(pages, file);
    box.appendChild(pages);

    return box;
  }

  function renderPagesInto(container, file) {
    container.textContent = "";
    const chosen = new Set(file.selection);
    file.pages.forEach((page, index) => {
      const on = chosen.has(index);
      const node = el("button", "pp-page" + (on ? " pp-page--on" : ""));
      node.type = "button";
      node.setAttribute("aria-pressed", on ? "true" : "false");
      node.appendChild(document.createTextNode(String(index + 1)));

      const shown = describeSize(page.width, page.height, normalizeRotation(page.rotation, page.turn || 0));
      if (shown && shown.w) {
        const label = shown.name
          ? shown.name + " " + t[shown.orientation]
          : shown.w + "×" + shown.h;
        node.appendChild(el("span", "pp-page-size", label));
      }

      node.addEventListener("click", () => {
        // 點頁碼是「就這幾頁」的另一條路，改完把上面的頁碼欄同步成實際結果，
        // 兩邊講的是同一件事，不要讓欄位停在跟畫面不一樣的舊值上。
        const next = new Set(file.selection);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        file.selection = Array.from(next).sort((a, b) => a - b);
        file.rangeText = compactRange(file.selection);
        file.rangeError = null;
        releaseResult();
        render();
      });
      container.appendChild(node);
    });
  }

  let status = el("p", "pp-status");

  function statusText() {
    const n = totalPages();
    return n ? fill(t.total, { n: n }) : t.nothing;
  }

  function render() {
    root.textContent = "";

    if (!files.length) {
      renderPicker(t.drop);
      if (working) renderWorking(t.loading);
      if (error) root.appendChild(el("p", "pp-error", t.errors[error] || t.errors.broken));
      root.appendChild(el("p", "pp-note", t.note));
      return;
    }

    files.forEach((file, index) => root.appendChild(renderFile(file, index)));

    renderPicker(t.addMore);

    status = el("p", "pp-status", statusText());
    root.appendChild(status);

    const actions = el("div", "pp-actions");
    const make = el("button", "pp-primary", working ? "" : t.make);
    make.type = "button";
    if (working) {
      // 按下去之後把按鈕換成轉圈加狀態字。整份重組再重讀驗證，大檔在手機上要
      // 好幾秒，按鈕沒有變化的話讀者會以為沒按到而重複按。
      const spin = el("span", "anoni-spinner");
      spin.setAttribute("aria-hidden", "true");
      make.appendChild(spin);
      make.appendChild(document.createTextNode(t.working));
      make.disabled = true;
    } else {
      make.addEventListener("click", build);
      make.disabled = !totalPages();
    }
    actions.appendChild(make);
    actions.appendChild(
      button(t.clear, "", () => {
        files = [];
        releaseResult();
        error = null;
        render();
      })
    );
    root.appendChild(actions);

    if (error) root.appendChild(el("p", "pp-error", t.errors[error] || t.errors.broken));

    if (result) {
      const box = el("div", "pp-result");
      box.appendChild(
        el("p", "", fill(t.done, { n: result.pages, size: humanSize(result.size) }))
      );
      const link = el("a", "pp-dl", t.download);
      link.href = result.url;
      link.download = OUTPUT_NAME;
      box.appendChild(link);
      root.appendChild(box);
    }

    root.appendChild(el("p", "pp-note", t.note));
  }

  render();
})();
