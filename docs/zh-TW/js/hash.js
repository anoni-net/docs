/*
 * 檔案雜湊比對（utils/hash.md）。
 *
 * 東西用實體方式送出去（隨身碟、記憶卡、託人帶過去），對方收到之後要確認拿到的
 * 跟送出的是同一份。這一頁算出檔案的 SHA-256，兩邊比對那串字。
 *
 * 檔案不離開裝置，沒有上傳，也沒有寫進任何本機儲存。
 *
 * === 為什麼自己寫 SHA-256 ===
 *
 * 瀏覽器內建的 crypto.subtle.digest 要一次吃下整份檔案的 ArrayBuffer。隨身碟裡的
 * 影片動輒好幾 GB，手機上那樣讀會直接失敗，而失敗的形式是分頁沒有反應，讀者不會
 * 知道發生什麼事。這裡改成一塊一塊餵，記憶體用量固定在一個 chunk，順便能報進度。
 *
 * 自己寫雜湊的風險是算錯了畫面上看起來一樣正常，只是那串字是錯的。所以
 * tools/test_hash.mjs 拿三組來源交叉驗：NIST 的標準測試向量、Node 的 crypto 模組
 * （獨立實作）、以及跨 chunk 邊界的切法（同一份資料切成不同大小餵進去，結果必須
 * 一樣）。最後一項守的是增量實作特有的錯，一次餵完會對、分次餵就錯。
 *
 * === 比對為什麼用「找得到」而不是逐字比 ===
 *
 * 對方給的雜湊格式不一定：可能是純一串字，可能是 sha256sum 的輸出（雜湊、兩個
 * 空格、檔名），可能是一整份清單，也可能大小寫混著。要求讀者自己剪貼出正確的
 * 那一段，是把工具的麻煩推給人。所以貼進來的東西整段掃，抽出裡面所有 64 個
 * 十六進位字元的段落，再看算出來的雜湊在不在裡面。
 *
 * 三個語系共用這一份，docs/en/js/ 與 docs/zh-CN/js/ 底下是指向這裡的 symlink。
 */
(function () {
  "use strict";

  // --- 純邏輯（tools/test_hash.mjs 從這裡原地抽出來測）---

  // SHA-256 的 64 個輪常數，前 64 個質數立方根的小數部分取前 32 位元。
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);

  // 增量的 SHA-256。update() 可以呼叫任意次、每次餵任意長度，digest() 之後就不能
  // 再 update。所有加法都存進 Uint32Array，溢位由型別自己截掉，不必逐行寫 >>> 0。
  function createSha256() {
    const h = new Uint32Array([
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
    ]);
    const w = new Uint32Array(64);
    const tail = new Uint8Array(64);
    let tailLen = 0;
    let totalBytes = 0;
    let done = false;

    function compress(bytes, at) {
      for (let i = 0; i < 16; i++) {
        const p = at + i * 4;
        w[i] = (bytes[p] << 24) | (bytes[p + 1] << 16) | (bytes[p + 2] << 8) | bytes[p + 3];
      }
      for (let i = 16; i < 64; i++) {
        const x = w[i - 15];
        const y = w[i - 2];
        const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
        const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
        w[i] = w[i - 16] + s0 + w[i - 7] + s1;
      }
      let a = h[0], b = h[1], c = h[2], d = h[3];
      let e = h[4], f = h[5], g = h[6], hh = h[7];
      for (let i = 0; i < 64; i++) {
        const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        const ch = (e & f) ^ (~e & g);
        const t1 = (hh + S1 + ch + K[i] + w[i]) >>> 0;
        const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) >>> 0;
        hh = g;
        g = f;
        f = e;
        e = (d + t1) >>> 0;
        d = c;
        c = b;
        b = a;
        a = (t1 + t2) >>> 0;
      }
      h[0] += a; h[1] += b; h[2] += c; h[3] += d;
      h[4] += e; h[5] += f; h[6] += g; h[7] += hh;
    }

    return {
      update(bytes) {
        if (done) throw new Error("digest 之後不能再 update");
        totalBytes += bytes.length;
        let at = 0;
        // 上一次剩下的不滿一塊，先補滿再說
        if (tailLen > 0) {
          const need = Math.min(64 - tailLen, bytes.length);
          tail.set(bytes.subarray(0, need), tailLen);
          tailLen += need;
          at = need;
          if (tailLen < 64) return;
          compress(tail, 0);
          tailLen = 0;
        }
        while (at + 64 <= bytes.length) {
          compress(bytes, at);
          at += 64;
        }
        if (at < bytes.length) {
          tail.set(bytes.subarray(at), 0);
          tailLen = bytes.length - at;
        }
      },
      digest() {
        if (done) throw new Error("digest 只能呼叫一次");
        done = true;
        // 補一個 0x80，補到剩 8 個位元組，最後放訊息長度（以位元計，big-endian）
        const bits = totalBytes * 8;
        const pad = new Uint8Array(tailLen < 56 ? 64 : 128);
        pad.set(tail.subarray(0, tailLen), 0);
        pad[tailLen] = 0x80;
        const at = pad.length - 8;
        // 位元長度可能超過 32 位元，拆成高低兩段寫。2^53 個位元約等於 1 PB 的檔案，
        // 在那之前 Number 都還是精確的
        const high = Math.floor(bits / 0x100000000);
        const low = bits >>> 0;
        pad[at] = (high >>> 24) & 0xff;
        pad[at + 1] = (high >>> 16) & 0xff;
        pad[at + 2] = (high >>> 8) & 0xff;
        pad[at + 3] = high & 0xff;
        pad[at + 4] = (low >>> 24) & 0xff;
        pad[at + 5] = (low >>> 16) & 0xff;
        pad[at + 6] = (low >>> 8) & 0xff;
        pad[at + 7] = low & 0xff;
        for (let i = 0; i < pad.length; i += 64) compress(pad, i);
        let out = "";
        for (let i = 0; i < 8; i++) out += h[i].toString(16).padStart(8, "0");
        return out;
      },
    };
  }

  // 一次算完的版本，測試與小資料用得到。
  function sha256Hex(bytes) {
    const s = createSha256();
    s.update(bytes);
    return s.digest();
  }

  // 從讀者貼進來的任何東西裡，抽出所有看起來是 SHA-256 的段落。
  //
  // 前後不能再接十六進位字元，否則 SHA-512 那種 128 個字的雜湊會被切成兩段，每一段
  // 都長得像合法的 SHA-256，比對就會給出沒有根據的結果。
  function extractHashes(text) {
    const out = new Set();
    if (typeof text !== "string") return out;
    const re = /[0-9a-fA-F]{64}/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      const start = m.index;
      const before = start > 0 ? text[start - 1] : "";
      const after = start + 64 < text.length ? text[start + 64] : "";
      const hex = /[0-9a-fA-F]/;
      if (!hex.test(before) && !hex.test(after)) out.add(m[0].toLowerCase());
      // 往前挪一格重掃，長串裡夾著的合法段落才不會被跳過
      re.lastIndex = start + 1;
    }
    return out;
  }

  // 檔案大小寫給人看。用 1024 進位，跟作業系統顯示的一致。
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    const units = ["KB", "MB", "GB", "TB"];
    let value = bytes / 1024;
    let i = 0;
    while (value >= 1024 && i < units.length - 1) {
      value /= 1024;
      i += 1;
    }
    return (value >= 100 ? value.toFixed(0) : value.toFixed(1)) + " " + units[i];
  }

  // 比對結果。貼上的內容裡沒有任何雜湊時是 pending，那跟「比對不符」是兩件事，
  // 畫面上不能長得一樣。
  function compareState(hash, pasted) {
    if (!hash) return "pending";
    if (!pasted || pasted.size === 0) return "pending";
    return pasted.has(hash) ? "match" : "differ";
  }

  // 每次讀進來的塊大小。太小的話 await 的次數變多、整體變慢，太大的話一次佔用的
  // 記憶體變高，手機上會被系統收掉。4 MiB 在測過的機器上都不會卡住畫面。
  const CHUNK = 4 * 1024 * 1024;

  // --- 介面 ---

  const root = document.getElementById("hash-tool");
  if (!root) return;

  const CSS = `
    #hash-tool { margin: 1em 0; }
    #hash-tool .hs-drop {
      border: .1rem dashed var(--md-default-fg-color--lighter);
      border-radius: .2rem; padding: 1.6rem 1rem; text-align: center;
      font-size: .78rem; line-height: 1.8; cursor: pointer;
    }
    #hash-tool .hs-drop--over {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #hash-tool input[type="file"] { display: none; }
    #hash-tool .hs-item {
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .7rem; margin: .8rem 0 0;
    }
    #hash-tool .hs-name {
      font-size: .78rem; line-height: 1.7; word-break: break-all; margin: 0 0 .3rem;
    }
    #hash-tool .hs-size { font-size: .7rem; opacity: .7; }
    #hash-tool .hs-hash {
      font-family: var(--md-code-font-family, monospace);
      font-size: .74rem; line-height: 1.7; word-break: break-all; user-select: all;
      background: var(--md-default-fg-color--lightest);
      padding: .4rem .5rem; border-radius: .1rem; margin: .3rem 0 0;
    }
    #hash-tool .hs-state {
      font-size: .76rem; line-height: 1.7; margin: .5rem 0 0; padding-left: .6rem;
    }
    #hash-tool .hs-state--match { border-left: .15rem solid #2e7d32; }
    #hash-tool .hs-state--differ { border-left: .15rem solid var(--md-typeset-del-color, #f44336); }
    #hash-tool .hs-state--pending { border-left: .15rem solid var(--md-default-fg-color--lighter); opacity: .8; }
    #hash-tool .hs-progress {
      font-size: .72rem; opacity: .8; margin: .4rem 0 0;
      font-variant-numeric: tabular-nums;
    }
    #hash-tool textarea {
      width: 100%; min-height: 5.5rem; margin: .4rem 0 0; padding: .5rem;
      font-family: var(--md-code-font-family, monospace);
      font-size: max(16px, .74rem); line-height: 1.7;
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; background: var(--md-default-bg-color);
      color: var(--md-default-fg-color); box-sizing: border-box; resize: vertical;
    }
    #hash-tool .hs-label { font-size: .78rem; line-height: 1.7; margin: 1.2rem 0 0; }
    #hash-tool .hs-found { font-size: .72rem; opacity: .8; margin: .3rem 0 0; }
    #hash-tool button {
      font: inherit; color: inherit; cursor: pointer; background: none;
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .35rem .8rem; margin: .4rem .4rem 0 0;
      font-size: .74rem;
    }
    #hash-tool button:hover:not(:disabled) {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #hash-tool button:disabled { opacity: .5; cursor: default; }
    #hash-tool .hs-note { font-size: .7rem; opacity: .7; line-height: 1.6; margin: 1rem 0 0; }
    @media (pointer: coarse) { #hash-tool button { min-height: 2.2rem; } }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const STRINGS = {
    "zh-TW": {
      drop: "把檔案拖進來，或點一下選檔案。可以一次選多個",
      pick: "選檔案",
      clear: "清空",
      copy: "複製",
      copied: "已複製",
      compareLabel: "把對方給你的雜湊貼在這裡",
      comparePlaceholder: "整段貼上就好，sha256sum 的輸出、一整份清單、單獨一串字都認得",
      found: (n) => "在貼上的內容裡找到 " + n + " 個雜湊",
      foundNone: "貼上的內容裡沒有看到 SHA-256 的雜湊",
      match: "相符，這個檔案跟對方手上那份內容一樣",
      differ: "不相符，內容有差異",
      pending: "還沒有可以比對的雜湊",
      reading: (pct) => "計算中 " + pct + "%",
      failed: "這個檔案讀不到，可能是傳輸中斷或裝置有問題",
      note: "檔案在你的瀏覽器裡計算，沒有上傳，也沒有存進裝置。關掉頁面就沒了。",
    },
    "zh-CN": {
      drop: "把文件拖进来，或点一下选文件。可以一次选多个",
      pick: "选文件",
      clear: "清空",
      copy: "复制",
      copied: "已复制",
      compareLabel: "把对方给你的哈希贴在这里",
      comparePlaceholder: "整段粘贴就好，sha256sum 的输出、一整份清单、单独一串字都认得",
      found: (n) => "在粘贴的内容里找到 " + n + " 个哈希",
      foundNone: "粘贴的内容里没有看到 SHA-256 的哈希",
      match: "相符，这个文件跟对方手上那份内容一样",
      differ: "不相符，内容有差异",
      pending: "还没有可以比对的哈希",
      reading: (pct) => "计算中 " + pct + "%",
      failed: "这个文件读不到，可能是传输中断或设备有问题",
      note: "文件在你的浏览器里计算，没有上传，也没有存进设备。关掉页面就没了。",
    },
    en: {
      drop: "Drop files here, or click to choose. Several at once is fine",
      pick: "Choose files",
      clear: "Clear",
      copy: "Copy",
      copied: "Copied",
      compareLabel: "Paste the hash you were given here",
      comparePlaceholder: "Paste the whole thing. sha256sum output, a full list, or a bare string all work",
      found: (n) => "Found " + n + " hash(es) in what you pasted",
      foundNone: "No SHA-256 hash found in what you pasted",
      match: "Match. This file has the same content as the one they hold",
      differ: "No match. The contents differ",
      pending: "Nothing to compare against yet",
      reading: (pct) => "Hashing " + pct + "%",
      failed: "This file could not be read, which may mean the transfer was cut short or the device is faulty",
      note: "Files are hashed in your browser. Nothing is uploaded and nothing is stored on the device. Closing the page clears it.",
    },
  };
  const t = STRINGS[document.documentElement.lang] || STRINGS["zh-TW"];

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  // 畫面上的每一份檔案。hash 為 null 代表還在算或算失敗。
  const items = [];
  let pasted = new Set();

  const drop = el("div", "hs-drop", t.drop);
  drop.setAttribute("role", "button");
  drop.setAttribute("tabindex", "0");
  const input = el("input");
  input.type = "file";
  input.multiple = true;
  const list = el("div", "hs-list");
  const label = el("p", "hs-label", t.compareLabel);
  const box = el("textarea");
  box.placeholder = t.comparePlaceholder;
  box.setAttribute("aria-label", t.compareLabel);
  const found = el("p", "hs-found", "");
  const clear = el("button", "hs-clear", t.clear);
  const note = el("p", "hs-note", t.note);

  root.append(drop, input, list, label, box, found, clear, note);

  function renderItem(item) {
    const node = el("div", "hs-item");
    const name = el("p", "hs-name", item.name);
    name.append(" ", el("span", "hs-size", formatSize(item.size)));
    node.append(name);
    if (item.error) {
      node.append(el("p", "hs-state hs-state--differ", t.failed));
      return node;
    }
    if (item.hash === null) {
      node.append(el("p", "hs-progress", t.reading(item.progress)));
      return node;
    }
    const hash = el("p", "hs-hash", item.hash);
    node.append(hash);
    const copy = el("button", "hs-copy", t.copy);
    copy.addEventListener("click", () => {
      navigator.clipboard.writeText(item.hash).then(() => {
        copy.textContent = t.copied;
        setTimeout(() => { copy.textContent = t.copy; }, 1500);
      });
    });
    node.append(copy);
    const state = compareState(item.hash, pasted);
    const line = el("p", "hs-state hs-state--" + state, t[state]);
    node.append(line);
    return node;
  }

  function render() {
    list.textContent = "";
    for (const item of items) list.append(renderItem(item));
    found.textContent = pasted.size ? t.found(pasted.size) : (box.value.trim() ? t.foundNone : "");
    clear.disabled = items.length === 0 && box.value === "";
  }

  async function hashFile(item, file) {
    const sha = createSha256();
    let read = 0;
    try {
      const reader = file.stream().getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        sha.update(value);
        read += value.length;
        const pct = item.size ? Math.floor((read / item.size) * 100) : 100;
        if (pct !== item.progress) {
          item.progress = pct;
          render();
        }
      }
      item.hash = sha.digest();
    } catch (err) {
      item.error = true;
    }
    render();
  }

  function add(files) {
    for (const file of files) {
      const item = { name: file.name, size: file.size, hash: null, progress: 0, error: false };
      items.push(item);
      hashFile(item, file);
    }
    render();
  }

  drop.addEventListener("click", () => input.click());
  drop.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      input.click();
    }
  });
  input.addEventListener("change", () => {
    if (input.files && input.files.length) add(input.files);
    input.value = "";
  });
  drop.addEventListener("dragover", (event) => {
    event.preventDefault();
    drop.classList.add("hs-drop--over");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("hs-drop--over"));
  drop.addEventListener("drop", (event) => {
    event.preventDefault();
    drop.classList.remove("hs-drop--over");
    if (event.dataTransfer && event.dataTransfer.files.length) add(event.dataTransfer.files);
  });
  box.addEventListener("input", () => {
    pasted = extractHashes(box.value);
    render();
  });
  clear.addEventListener("click", () => {
    items.length = 0;
    box.value = "";
    pasted = new Set();
    render();
  });

  render();
})();
