/*
 * QR code 產生器（utils/qrcode.md）。
 *
 * 用途是把一段文字交給旁邊的人，不經過任何網路：onion 網址、Tor bridge、一次性的
 * 聯絡方式。那些場合往往正好沒有網路，或者不該用網路傳。
 *
 * 編碼交給 utils/vendor/qrcode-generator.js（MIT，原封不動）。這一支負責介面、輸入
 * 檢查與 SVG 輸出。畫成 SVG 而不是 canvas：可以無損放大、可以直接下載成檔案，而且
 * 不需要 canvas 的像素 API。
 *
 * 純邏輯的部分由 tools/test_qrcode.mjs 原地抽出來測，那支另外寫了一個獨立的解碼器，
 * 把產生的矩陣讀回字串再比對。QR 最糟的失敗是「掃得出來但內容錯」，那種錯誤在畫面上
 * 完全看不出來。
 *
 * 三個語系共用這一份，docs/en/js/ 與 docs/zh-CN/js/ 底下是指向這裡的 symlink。
 */
(function () {
  "use strict";

  // --- 純邏輯（tools/test_qrcode.mjs 從這裡原地抽出來測）---

  // UTF-8 之後有幾個位元組。QR 的 byte mode 算的是位元組，中文一個字三個。
  function byteLength(text) {
    return new TextEncoder().encode(text).length;
  }

  // 各糾錯等級能修復多少比例的碼字，用來跟讀者說明取捨。
  const ERROR_LEVELS = { L: 7, M: 15, Q: 25, H: 30 };

  // 規範要求四格留白。少了它有些掃描器對不到邊界，尤其是把 QR 直接貼在深色背景上時。
  const QUIET_ZONE = 4;

  // 挑一個裝得下的版本。qrcode-generator 的 typeNumber 0 是自動，但它在放不下時
  // 丟例外而不是回錯誤，這裡先算好再叫它，才有辦法給出「太長了，少打一點」這種訊息。
  //
  // 上限取版本 40。再往上規範就沒有了，而那時的容量遠超過這個工具的使用情境。
  function fitVersion(text, level, capacityOf) {
    const bytes = byteLength(text);
    for (let version = 1; version <= 40; version += 1) {
      if (capacityOf(version, level) >= bytes) return version;
    }
    return null;
  }

  // 模組矩陣轉成 SVG。
  //
  // 每個模組畫一個 rect 會產生幾千個節點，改成一列一段連續的黑格畫成一個 rect，
  // 節點數少一個數量級。quiet zone 是規範要求的四格留白，少了它有些掃描器讀不到。
  function toSvg(modules, options) {
    const size = modules.length;
    const quiet = options.quiet;
    const total = size + quiet * 2;
    const parts = [];
    for (let row = 0; row < size; row += 1) {
      let start = -1;
      for (let col = 0; col <= size; col += 1) {
        const dark = col < size && modules[row][col];
        if (dark && start < 0) start = col;
        if (!dark && start >= 0) {
          parts.push(
            `<rect x="${start + quiet}" y="${row + quiet}" width="${col - start}" height="1"/>`
          );
          start = -1;
        }
      }
    }
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" ` +
      `shape-rendering="crispEdges" role="img" aria-label="${options.label}">` +
      `<rect width="${total}" height="${total}" fill="${options.background}"/>` +
      `<g fill="${options.foreground}">${parts.join("")}</g></svg>`
    );
  }

  // --- 介面 ---

  const root = document.getElementById("qrcode-tool");
  if (!root) return;

  const CSS = `
    #qrcode-tool { margin: 1em 0; }
    #qrcode-tool textarea {
      width: 100%; box-sizing: border-box; font: inherit;
      font-family: var(--md-code-font-family, monospace);
      /* iOS Safari 在輸入框字級小於 16px 時，一聚焦就把整頁放大，而且不會縮回去。
         material 的 rem 基準是 20px，.78rem 只有 15.6px 剛好踩到。用 max 撐到 16px，
         桌機上的差別看不出來。不改 viewport 的 user-scalable，那會讓需要放大的人
         沒辦法放大。 */
      font-size: max(16px, .78rem);
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .6rem; min-height: 5rem; resize: vertical;
      background: var(--md-default-bg-color); color: var(--md-default-fg-color);
    }
    #qrcode-tool .qr-row {
      display: flex; align-items: center; flex-wrap: wrap; gap: .5rem; margin: .8rem 0;
    }
    #qrcode-tool button {
      font: inherit; color: inherit; cursor: pointer; background: none;
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .35rem .8rem;
    }
    /* 同 passphrase.js：填了底色的按鈕不套這條，不然選中之後文字會看不見 */
    #qrcode-tool button:hover:not(:disabled):not([aria-pressed="true"]) {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #qrcode-tool button[aria-pressed="true"]:hover:not(:disabled) {
      filter: brightness(1.1);
    }
    #qrcode-tool button:disabled { opacity: .5; cursor: default; }
    #qrcode-tool button[aria-pressed="true"] {
      border-color: var(--md-primary-fg-color);
      background: var(--md-primary-fg-color);
      color: var(--md-primary-bg-color);
    }
    #qrcode-tool .qr-out {
      display: flex; justify-content: center; margin: 1rem 0 .4rem;
    }
    #qrcode-tool .qr-out svg {
      width: 100%; max-width: 16rem; height: auto;
      border: .05rem solid var(--md-default-fg-color--lightest);
    }
    #qrcode-tool .qr-meta { font-size: .7rem; opacity: .75; text-align: center; margin: 0 0 1rem; }
    #qrcode-tool .qr-error {
      border-left: .15rem solid var(--md-typeset-del-color, #f44336);
      padding: .1rem 0 .1rem .6rem; margin: 1rem 0;
    }
    #qrcode-tool .qr-note { font-size: .7rem; opacity: .7; line-height: 1.6; margin: .8rem 0 0; }
    @media (pointer: coarse) { #qrcode-tool button { min-height: 2.2rem; } }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const STRINGS = {
    "zh-TW": {
      placeholder: "貼上要傳出去的文字，例如 onion 網址或一行 bridge",
      level: "糾錯",
      levelHint: "{level} 級，髒污或遮住 {percent}% 以內還讀得出來",
      empty: "上面輸入內容之後就會出現 QR code。",
      tooLong: "內容太長，QR code 裝不下。目前 {bytes} 個位元組，最多 {max} 個。分成兩段或改用別的方式傳。",
      meta: "版本 {version}，{modules} × {modules} 格，{bytes} 個位元組",
      download: "下載 SVG",
      note: "QR code 裡的內容是明文，任何拍到它的人都讀得到，包括牆上的攝影機。要傳的東西如果本身敏感，先確認現場沒有鏡頭，傳完把畫面關掉。全部在你的瀏覽器裡產生，沒有送出任何東西，斷網時照樣可以用。",
    },
    zh: {
      placeholder: "粘贴要传出去的文字，例如 onion 网址或一行 bridge",
      level: "纠错",
      levelHint: "{level} 级，脏污或遮住 {percent}% 以内还读得出来",
      empty: "上面输入内容之后就会出现 QR code。",
      tooLong: "内容太长，QR code 装不下。目前 {bytes} 个字节，最多 {max} 个。分成两段或改用别的方式传。",
      meta: "版本 {version}，{modules} × {modules} 格，{bytes} 个字节",
      download: "下载 SVG",
      note: "QR code 里的内容是明文，任何拍到它的人都读得到，包括墙上的摄像头。要传的东西如果本身敏感，先确认现场没有镜头，传完把画面关掉。全部在你的浏览器里生成，没有送出任何东西，断网时照样可以用。",
    },
    en: {
      placeholder: "Paste what you want to hand over, such as an onion address or one bridge line",
      level: "Correction",
      levelHint: "Level {level}, still readable with up to {percent}% obscured",
      empty: "Type something above and the QR code appears here.",
      tooLong: "Too long for a QR code. That is {bytes} bytes and the limit is {max}. Split it in two or use another channel.",
      meta: "Version {version}, {modules} × {modules} modules, {bytes} bytes",
      download: "Download SVG",
      note: "The contents of a QR code are in the clear. Anyone who photographs it can read it, including a camera on the wall. If what you are handing over is sensitive, check the room first and close the screen afterwards. Everything is generated in your browser, nothing is sent anywhere, and it works with the network off.",
    },
  };
  const t = STRINGS[document.documentElement.lang] || STRINGS["zh-TW"];
  const fill = (key, vars) =>
    t[key].replace(/\{(\w+)\}/g, (_, name) => String(vars[name]));

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  // 函式庫預設把字串當 Latin-1 處理（每個字元 `charCodeAt & 0xff`），中文會被截成
  // 單一位元組，掃出來是亂碼。UTF-8 那一份它有提供，只是沒有預設啟用。
  //
  // 這個要在任何 addData 之前設定。漏掉的話畫面上照樣出現一個漂亮的 QR，掃了才知道
  // 內容壞掉，而做這個工具的人多半用英文測。
  window.qrcode.stringToBytes = window.qrcode.stringToBytesFuncs["UTF-8"];

  // vendor 的函式庫算得出每個版本裝得下多少位元組，不必自己抄一份容量表。
  const capacityOf = (version, level) => {
    try {
      const qr = window.qrcode(version, level);
      return qr.getRawLength ? qr.getRawLength() : rawCapacity(version, level);
    } catch (err) {
      return 0;
    }
  };

  // getRawLength 在某些版本的函式庫沒有，退回試作法：塞得下就算得下。
  function rawCapacity(version, level) {
    let low = 0;
    let high = 4000;
    while (low < high) {
      const mid = Math.ceil((low + high + 1) / 2);
      try {
        const qr = window.qrcode(version, level);
        qr.addData("x".repeat(mid));
        qr.make();
        low = mid;
      } catch (err) {
        high = mid - 1;
      }
    }
    return low;
  }

  const state = { text: "", level: "M", svg: "", error: null, info: null };

  function build() {
    state.svg = "";
    state.error = null;
    state.info = null;
    if (!state.text) return;

    const version = fitVersion(state.text, state.level, capacityOf);
    if (!version) {
      state.error = fill("tooLong", {
        bytes: byteLength(state.text),
        max: capacityOf(40, state.level),
      });
      return;
    }
    const qr = window.qrcode(version, state.level);
    qr.addData(state.text);
    qr.make();
    const count = qr.getModuleCount();
    const modules = [];
    for (let row = 0; row < count; row += 1) {
      const line = [];
      for (let col = 0; col < count; col += 1) line.push(qr.isDark(row, col));
      modules.push(line);
    }
    state.svg = toSvg(modules, {
      quiet: QUIET_ZONE,
      background: "#ffffff",
      foreground: "#000000",
      label: "QR code",
    });
    state.info = { version: version, modules: count, bytes: byteLength(state.text) };
  }

  function render() {
    root.textContent = "";

    const input = document.createElement("textarea");
    input.placeholder = t.placeholder;
    input.value = state.text;
    input.spellcheck = false;
    input.addEventListener("input", () => {
      state.text = input.value;
      build();
      update();
    });
    root.appendChild(input);

    const levels = el("div", "qr-row");
    levels.appendChild(el("span", null, t.level));
    for (const level of ["L", "M", "Q", "H"]) {
      const node = el("button", null, level);
      node.type = "button";
      node.setAttribute("aria-pressed", String(state.level === level));
      node.addEventListener("click", () => {
        state.level = level;
        build();
        render();
        // 換等級之後焦點留在輸入框，讀者多半還要繼續改內容
        const box = root.querySelector("textarea");
        if (box) box.focus();
      });
      levels.appendChild(node);
    }
    levels.appendChild(
      el("span", "qr-meta", fill("levelHint", {
        level: state.level,
        percent: ERROR_LEVELS[state.level],
      }))
    );
    root.appendChild(levels);

    root.appendChild(el("div", "qr-out"));
    root.appendChild(el("p", "qr-meta"));
    root.appendChild(el("div", "qr-row"));
    root.appendChild(el("p", "qr-note", t.note));
    update();
  }

  // 只換輸出的部分。整頁重畫會讓輸入框失去焦點，打字打到一半就中斷。
  function update() {
    const out = root.querySelector(".qr-out");
    const meta = root.querySelector(".qr-meta:not(.qr-row .qr-meta)");
    const actions = root.querySelectorAll(".qr-row")[1];
    if (!out || !actions) return;

    out.textContent = "";
    actions.textContent = "";
    const info = root.querySelectorAll(".qr-meta");
    const line = info[info.length - 1];

    if (state.error) {
      out.appendChild(el("p", "qr-error", state.error));
      if (line) line.textContent = "";
      return;
    }
    if (!state.svg) {
      out.appendChild(el("p", "qr-meta", t.empty));
      if (line) line.textContent = "";
      return;
    }

    // innerHTML 只吃這一支自己組出來的 SVG，內容全部來自 toSvg 的數字與固定字串
    const holder = document.createElement("div");
    holder.innerHTML = state.svg;
    out.appendChild(holder.firstChild);
    if (line) line.textContent = fill("meta", state.info);

    const download = el("button", null, t.download);
    download.type = "button";
    download.addEventListener("click", () => {
      const blob = new Blob([state.svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "qrcode.svg";
      link.click();
      URL.revokeObjectURL(url);
    });
    actions.appendChild(download);
  }

  render();
})();
