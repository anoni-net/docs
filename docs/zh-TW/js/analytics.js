/**
 * 整站共通的行為量測。
 *
 * 這支只在 standard 版載入。overrides/main.html 的 anoni-analytics 區塊裡才有
 * <script src="js/analytics.js">，而那整個區塊會被 replace_sitename_anoni_onion.sh
 * 與 replace_sitename_anoni_ipfs.sh 刪掉，所以 onion 與 IPFS 版連這個檔案的請求都
 * 不會發出。
 *
 * === 送出去的東西 ===
 *
 * 只有列舉代號，沒有一個欄位裝得下讀者的內容：
 *
 *   search-used  { len: short | medium | long }   有人用了搜尋，len 是字數級距
 *   search-zero  { len: short | medium | long }   那次搜尋零結果
 *   search-hit   { rank: first | top3 | rest }    點了第幾組結果
 *   lang-switch  { from, to }                     語系切換，值是 zh-TW/zh-CN/en
 *   read-depth   { depth: 25 | 50 | 75 | 100 }    捲到的最深處
 *
 * 搜尋關鍵字本身一個字都不送。這個站的讀者可能正在搜「防火長城」「翻牆」，
 * 那種記錄留在任何地方都是風險。字數級距足夠回答「索引好不好用」，關鍵字內容不需要。
 * 已經回報過的查詢字串只存在這支的區域變數裡，用來避免同一次搜尋重複計數。
 *
 * 每一筆最後還會經過 overrides/main.html 的 anoniBeforeSend 白名單，事件名或值只要
 * 對不上就整筆丟掉。
 *
 * 對應的測試：tools/test_analytics.mjs
 */
(function () {
  "use strict";

  // onion 與 IPFS 版沒有這個函式。理論上那兩版也不會載入本檔案，這裡再擋一次，
  // 免得將來有人把 script 標籤搬出 anoni-analytics 區塊。
  if (typeof window.anoniTrack !== "function") return;

  const track = window.anoniTrack;

  // ---------------------------------------------------------------- 純函式

  // 搜尋字數的級距。中文兩個字往往已經是一個完整詞，級距切得比英文密。
  function queryBucket(length) {
    if (length <= 1) return "short";
    if (length <= 4) return "medium";
    return "long";
  }

  // 點到第幾組結果。用來回答排序準不準，位置本身不透露搜尋內容。
  // 值不能含有 + 之類的符號，anoniBeforeSend 的 VALUE_RE 只收 [A-Za-z0-9/_-]。
  function rankBucket(index) {
    if (index <= 0) return "first";
    if (index <= 2) return "top3";
    return "rest";
  }

  // documentElement.lang 是 zh-TW / zh / en（見 run_zh-cn.sh 的 LANGUAGE='zh'），
  // 語言選單的 hreflang 則是 zh-TW / zh-CN / en。兩邊統一成後者才比得起來。
  function normalizeLang(lang) {
    if (!lang) return "unknown";
    if (lang === "zh") return "zh-CN";
    if (lang === "zh-TW" || lang === "zh-CN") return lang;
    if (lang.slice(0, 2) === "en") return "en";
    return "other";
  }

  // 捲動位置換算成級距。視窗底部碰到文件底部才算 100。
  function depthReached(scrollTop, viewport, docHeight) {
    if (!docHeight || docHeight <= 0) return 0;
    const ratio = (scrollTop + viewport) / docHeight;
    if (ratio >= 0.99) return 100;
    if (ratio >= 0.75) return 75;
    if (ratio >= 0.5) return 50;
    if (ratio >= 0.25) return 25;
    return 0;
  }

  // 一屏就看得完的頁面沒有閱讀深度可言，載入當下就是 100，全部送出去只會把
  // 平均值灌爆。要求文件至少比視窗高一半才開始量。
  function worthMeasuring(viewport, docHeight) {
    return docHeight > viewport * 1.5;
  }

  // ---------------------------------------------------------------- 搜尋

  function setupSearch() {
    const box = document.querySelector("input[data-md-component=search-query]");
    const panel = document.querySelector("[data-md-component=search-result]");
    if (!box || !panel) return;

    // 這兩個集合只活在記憶體裡，作用是同一個查詢不重複計數。內容不會送出去。
    const usedSeen = Object.create(null);
    const zeroSeen = Object.create(null);
    let current = "";
    let typingTimer = 0;
    let settleTimer = 0;

    function onTypingSettled() {
      const query = box.value.trim();
      current = query;
      if (!query || usedSeen[query]) return;
      usedSeen[query] = true;
      track("search-used", { len: queryBucket(query.length) });
    }

    function onResultsSettled() {
      const query = current;
      if (!query || zeroSeen[query]) return;
      if (panel.querySelectorAll(".md-search-result__link").length > 0) return;
      zeroSeen[query] = true;
      track("search-zero", { len: queryBucket(query.length) });
    }

    box.addEventListener("input", function () {
      window.clearTimeout(typingTimer);
      typingTimer = window.setTimeout(onTypingSettled, 700);
    });

    new MutationObserver(function () {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(onResultsSettled, 400);
    }).observe(panel, { childList: true, subtree: true });

    // 從 ?q= 進來的搜尋不會經過 input 事件。Material 支援分享搜尋連結，點進來的人
    // 一載入就有結果。不先讀一次的話 current 會是空字串，零結果與點擊位置都不計數。
    if (box.value.trim()) onTypingSettled();

    panel.addEventListener("click", function (event) {
      const link = event.target.closest && event.target.closest(".md-search-result__link");
      if (!link) return;
      const all = panel.querySelectorAll(".md-search-result__link");
      const index = Array.prototype.indexOf.call(all, link);
      track("search-hit", { rank: rankBucket(index) });
    });
  }

  // ---------------------------------------------------------------- 語系切換

  // 文件站不看 navigator.language，語系完全跟著讀者自己選（見 tools/test_lang_preference.mjs）。
  // 所以切換次數是唯一能知道翻譯有沒有人用的訊號。zh-TW 讀者往 en 跑通常代表術語
  // 或譯文有問題，那是要回頭修內容的線索。
  function setupLangSwitch() {
    document.addEventListener("click", function (event) {
      const link = event.target.closest && event.target.closest("a.md-select__link[hreflang]");
      if (!link) return;
      const from = normalizeLang(document.documentElement.lang);
      const to = normalizeLang(link.getAttribute("hreflang"));
      if (from === to) return;
      track("lang-switch", { from: from, to: to });
    });
  }

  // ---------------------------------------------------------------- 閱讀深度

  // 文件站最常做的決定是「這篇要不要拆」。目前只能靠猜，這個數字直接回答。
  function setupReadDepth() {
    const sent = { 25: false, 50: false, 75: false, 100: false };
    let ticking = false;

    function measure() {
      ticking = false;
      const viewport = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      if (!worthMeasuring(viewport, docHeight)) return;
      const depth = depthReached(window.scrollY || window.pageYOffset || 0, viewport, docHeight);
      const marks = [25, 50, 75, 100];
      for (let i = 0; i < marks.length; i++) {
        if (depth >= marks[i] && !sent[marks[i]]) {
          sent[marks[i]] = true;
          track("read-depth", { depth: String(marks[i]) });
        }
      }
    }

    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(measure);
      },
      { passive: true }
    );
  }

  // ---------------------------------------------------------------- 退出開關

  // umami 的 script.js 每次送出前都會檢查 localStorage 的 umami.disabled，有值就一筆
  // 都不送。這是它內建的機制，我們只是把開關做出來讓讀者按得到。
  //
  // 揭露頁講了收哪些東西，卻沒有給讀者關掉的方法，那個揭露是不完整的。
  const OPT_OUT_KEY = "umami.disabled";

  const OPT_OUT_STRINGS = {
    "zh-TW": {
      on: "分析已關閉",
      off: "分析目前開著",
      turnOff: "關掉分析",
      turnOn: "重新開啟",
      note: "設定存在這台裝置的 localStorage，清掉瀏覽器資料就會回到預設。",
      unavailable: "這個瀏覽器不讓網站用 localStorage，開關沒辦法記住。",
    },
    "zh-CN": {
      on: "分析已关闭",
      off: "分析目前开着",
      turnOff: "关掉分析",
      turnOn: "重新开启",
      note: "设定存在这台设备的 localStorage，清掉浏览器资料就会回到预设。",
      unavailable: "这个浏览器不让网站用 localStorage，开关没办法记住。",
    },
    en: {
      on: "Analytics is off",
      off: "Analytics is on",
      turnOff: "Turn analytics off",
      turnOn: "Turn it back on",
      note: "The setting lives in this device's localStorage. Clearing browser data resets it.",
      unavailable: "This browser blocks localStorage, so the switch cannot be remembered.",
    },
  };

  function readOptOut(storage) {
    try {
      return !!(storage && storage.getItem(OPT_OUT_KEY));
    } catch (err) {
      return false;
    }
  }

  function writeOptOut(storage, disabled) {
    try {
      if (disabled) storage.setItem(OPT_OUT_KEY, "1");
      else storage.removeItem(OPT_OUT_KEY);
      return true;
    } catch (err) {
      return false;
    }
  }

  function setupOptOut() {
    const host = document.getElementById("anoni-optout");
    if (!host) return;
    const t =
      OPT_OUT_STRINGS[normalizeLang(document.documentElement.lang)] || OPT_OUT_STRINGS["zh-TW"];

    let storage = null;
    try {
      storage = window.localStorage;
    } catch (err) {
      storage = null;
    }

    if (!storage) {
      const warn = document.createElement("p");
      warn.className = "anoni-optout-note";
      warn.textContent = t.unavailable;
      host.appendChild(warn);
      return;
    }

    const status = document.createElement("p");
    status.className = "anoni-optout-status";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "md-button anoni-optout-button";
    const note = document.createElement("p");
    note.className = "anoni-optout-note";
    note.textContent = t.note;

    function render() {
      const off = readOptOut(storage);
      status.textContent = off ? t.on : t.off;
      button.textContent = off ? t.turnOn : t.turnOff;
      host.setAttribute("data-state", off ? "off" : "on");
    }

    button.addEventListener("click", function () {
      writeOptOut(storage, !readOptOut(storage));
      render();
    });

    render();
    host.appendChild(status);
    host.appendChild(button);
    host.appendChild(note);
  }

  // ----------------------------------------------------------------

  function start() {
    setupSearch();
    setupLangSwitch();
    setupReadDepth();
    setupOptOut();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
