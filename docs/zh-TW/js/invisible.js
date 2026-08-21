/*
 * 隱形字元偵測（utils/invisible.md）。
 *
 * 貼一段文字進來，找出看不見但確實存在的字元：零寬字元、方向控制字元、標籤字元，
 * 以及混在拉丁字母裡的同形字。
 *
 * 三種真實情境：機構發給每個人的文件插入不同的零寬字元組合，外洩時比對就知道是誰
 * 流出去的；釣魚網址用西里爾字母的 а 冒充拉丁字母的 a；程式碼裡的方向控制字元讓
 * 人看到的順序跟編譯器讀到的不一樣（Trojan Source）。
 *
 * 誤判是這支最需要小心的地方。ZWJ（U+200D）在 emoji 裡是正常的組字元件，👨‍👩‍👧 就是
 * 三個 emoji 用兩個 ZWJ 接起來的；變體選擇器 U+FE0F 也是 emoji 的一部分；RTL 標記
 * 在阿拉伯文與希伯來文裡本來就該有。全部報成可疑的話，這個工具會變成狼來了。
 *
 * 純字元掃描，沒有任何網路請求，文字也不寫進任何儲存。
 *
 * 三個語系共用這一份，docs/en/js/ 與 docs/zh-CN/js/ 底下是指向這裡的 symlink。
 * 純邏輯由 tools/test_invisible.mjs 原地抽出來測。
 */
(function () {
  "use strict";

  // --- 純邏輯（tools/test_invisible.mjs 從這裡原地抽出來測）---

  // 看不見的字元。level 是「不必看語境就可疑」還是「要看前後才知道」。
  //
  // 一律用跳脫寫法。直接放字元的話，任何一次複製貼上、任何一個會清理空白的編輯器
  // 都可能把它們吃掉，而吃掉之後這份表看起來完全正常。
  const HIDDEN = {
    "\u200B": { key: "zwsp", level: "suspect" },
    "\u200C": { key: "zwnj", level: "context" },
    "\u200D": { key: "zwj", level: "context" },
    "\u2060": { key: "wordjoiner", level: "suspect" },
    "\uFEFF": { key: "bom", level: "suspect" },
    "\u00AD": { key: "softhyphen", level: "suspect" },
    "\u180E": { key: "mvs", level: "suspect" },
    "\u2062": { key: "invisibletimes", level: "suspect" },
    "\u2063": { key: "invisibleseparator", level: "suspect" },
    "\u2064": { key: "invisibleplus", level: "suspect" },
  };

  // 方向控制。RTL 語言用得到，所以只有在整段沒有任何 RTL 文字時才算可疑。
  const BIDI = {
    "\u202A": "lre", "\u202B": "rle", "\u202C": "pdf",
    "\u202D": "lro", "\u202E": "rlo",
    "\u2066": "lri", "\u2067": "rli", "\u2068": "fsi", "\u2069": "pdi",
    "\u200E": "lrm", "\u200F": "rlm",
  };

  // 同形字：長得像拉丁字母的西里爾與希臘字母。釣魚網址最常用的那一批。
  const HOMOGLYPHS = {
    "а": "a", "е": "e", "о": "o", "р": "p", "с": "c",
    "х": "x", "у": "y", "і": "i", "ј": "j", "һ": "h",
    "А": "A", "В": "B", "Е": "E", "К": "K", "М": "M",
    "Н": "H", "О": "O", "Р": "P", "С": "C", "Т": "T",
    "Х": "X", "Ѕ": "S", "І": "I", "Ј": "J",
    "α": "a", "ο": "o", "ρ": "p", "ν": "v", "χ": "x",
    "Α": "A", "Β": "B", "Ε": "E", "Ζ": "Z", "Η": "H",
    "Ι": "I", "Κ": "K", "Μ": "M", "Ν": "N", "Ο": "O",
    "Ρ": "P", "Τ": "T", "Υ": "Y", "Χ": "X",
  };

  // 這個字是不是 emoji 的一部分。判斷 ZWJ 與變體選擇器算不算正常用途時要用。
  //
  // 不做完整的 emoji 屬性判斷，那要一整張 Unicode 表。取幾個主要區塊就夠分辨
  // 「👨‍👩‍👧 裡的 ZWJ」與「兩個中文字中間的 ZWJ」，後者才是要抓的。
  function isEmojiLike(code) {
    if (code === undefined) return false;
    return (
      (code >= 0x1f300 && code <= 0x1faff) || // 各類符號與圖形
      (code >= 0x2600 && code <= 0x27bf) ||   // 雜項符號與裝飾符號
      (code >= 0x1f000 && code <= 0x1f2ff) || // 麻將、撲克、圍住的字元
      code === 0xfe0f || code === 0xfe0e ||  // 變體選擇器本身
      (code >= 0x1f3fb && code <= 0x1f3ff) || // 膚色修飾
      (code >= 0x2190 && code <= 0x21ff) ||   // 箭頭
      code === 0x2764 || code === 0x2642 || code === 0x2640
    );
  }

  // 掃一段文字，回傳每一個可疑字元的位置、種類與嚴重程度。
  //
  // 用 Array.from 而不是 for 迴圈跑索引：那樣一個 emoji 是一個元素，不會被拆成
  // 兩半，報出來的位置對得上讀者看到的字。
  function scan(text) {
    const chars = Array.from(text);
    const codes = chars.map((c) => c.codePointAt(0));
    const hasRtl = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFC]/.test(text);
    const findings = [];

    for (let i = 0; i < chars.length; i += 1) {
      const ch = chars[i];
      const code = codes[i];

      const hidden = HIDDEN[ch];
      if (hidden) {
        let level = hidden.level;
        if (hidden.key === "zwj" || hidden.key === "zwnj") {
          // emoji 中間的 ZWJ 是組字用的，前後都是 emoji 就不報
          level = isEmojiLike(codes[i - 1]) && isEmojiLike(codes[i + 1]) ? "ok" : "suspect";
        }
        if (level !== "ok") findings.push({ index: i, kind: hidden.key, level: level });
        continue;
      }

      if (BIDI[ch]) {
        // 整段有 RTL 文字的話，方向標記本來就該在
        findings.push({ index: i, kind: BIDI[ch], level: hasRtl ? "context" : "suspect" });
        continue;
      }

      // 變體選擇器：接在 emoji 後面是正常的，接在別的字後面不是
      if (code >= 0xfe00 && code <= 0xfe0f) {
        if (!isEmojiLike(codes[i - 1])) {
          findings.push({ index: i, kind: "variation", level: "suspect" });
        }
        continue;
      }

      // 標籤字元。整段隱藏訊息可以編碼在這裡面，正常文字用不到。
      if (code >= 0xe0000 && code <= 0xe007f) {
        findings.push({ index: i, kind: "tag", level: "suspect" });
        continue;
      }

      const looksLike = HOMOGLYPHS[ch];
      if (looksLike) {
        // 整段都是西里爾文或希臘文的話，那是正常的文字而不是偽裝
        findings.push({ index: i, kind: "homoglyph", level: "context", looksLike: looksLike });
      }
    }
    return findings;
  }

  // 同形字要不要報，看整段文字的組成。整段俄文裡的 а 是俄文，混在英文單字裡才是偽裝。
  function homoglyphVerdict(text, findings) {
    const cyrillic = (text.match(/[\u0400-\u04FF]/g) || []).length;
    const greek = (text.match(/[\u0370-\u03FF]/g) || []).length;
    const latin = (text.match(/[A-Za-z]/g) || []).length;
    const homoglyphs = findings.filter((f) => f.kind === "homoglyph").length;
    if (!homoglyphs) return "none";
    // 那些字母幾乎全是同形字候選，而且旁邊有拉丁字母，那就是混進來的
    if (latin > 0 && cyrillic + greek <= homoglyphs) return "mixed";
    return "script";
  }

  // 清掉所有看不見的字元。同形字不動：那是可見的字，自動換掉會改變原意，
  // 而讀者可能正在處理一段真的俄文。
  function strip(text) {
    return Array.from(text)
      .filter((ch) => {
        const code = ch.codePointAt(0);
        if (HIDDEN[ch] || BIDI[ch]) return false;
        if (code >= 0xfe00 && code <= 0xfe0f) return false;
        if (code >= 0xe0000 && code <= 0xe007f) return false;
        return true;
      })
      .join("");
  }

  // 只清掉「不必看語境就可疑」的那些，保留 emoji 的組字元件與 RTL 標記。
  function stripSuspect(text) {
    const suspect = new Set(scan(text).filter((f) => f.level === "suspect").map((f) => f.index));
    return Array.from(text)
      .filter((_, i) => !suspect.has(i))
      .join("");
  }

  // --- 介面 ---

  const root = document.getElementById("invisible-tool");
  if (!root) return;

  const CSS = `
    #invisible-tool { margin: 1em 0; }
    #invisible-tool textarea {
      width: 100%; box-sizing: border-box; font: inherit;
      font-family: var(--md-code-font-family, monospace);
      /* iOS 在輸入框字級小於 16px 時一聚焦就放大整頁 */
      font-size: max(16px, .78rem);
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .6rem; min-height: 6rem; resize: vertical;
      background: var(--md-default-bg-color); color: var(--md-default-fg-color);
    }
    #invisible-tool button {
      font: inherit; color: inherit; cursor: pointer; background: none;
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .35rem .8rem;
    }
    #invisible-tool button:hover:not(:disabled) {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #invisible-tool button:disabled { opacity: .5; cursor: default; }
    #invisible-tool .iv-row { display: flex; flex-wrap: wrap; gap: .5rem; margin: .8rem 0; }
    #invisible-tool .iv-verdict { font-size: .78rem; line-height: 1.7; margin: .8rem 0 .4rem; }
    #invisible-tool .iv-clean-verdict { border-left: .15rem solid #2e7d32; padding-left: .6rem; }
    #invisible-tool .iv-dirty-verdict { border-left: .15rem solid #ef6c00; padding-left: .6rem; }
    #invisible-tool .iv-marked {
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .7rem; margin: .6rem 0;
      font-family: var(--md-code-font-family, monospace);
      font-size: .74rem; line-height: 2.2; word-break: break-word; white-space: pre-wrap;
    }
    #invisible-tool .iv-mark {
      background: #ef6c00; color: #fff; border-radius: .1rem;
      padding: 0 .2rem; font-size: .62rem; margin: 0 .1rem;
    }
    #invisible-tool .iv-mark--context { background: var(--md-default-fg-color--light); }
    #invisible-tool .iv-list { list-style: none; margin: .6rem 0 0; padding: 0; font-size: .72rem; }
    #invisible-tool .iv-list li { margin: 0 0 .3rem; line-height: 1.6; }
    #invisible-tool .iv-code {
      font-family: var(--md-code-font-family, monospace);
      background: var(--md-default-fg-color--lightest); padding: 0 .2rem; border-radius: .1rem;
    }
    #invisible-tool .iv-note { font-size: .7rem; opacity: .7; line-height: 1.6; margin: 1rem 0 0; }
    @media (pointer: coarse) { #invisible-tool button { min-height: 2.2rem; } }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const STRINGS = {
    "zh-TW": {
      placeholder: "貼上要檢查的文字",
      clean: "沒有找到隱形字元或同形字。",
      found: "找到 {suspect} 個可疑的字元，另有 {context} 個要看語境。下面用橘色標出位置。",
      foundContext: "找到 {context} 個要看語境的字元。在這段文字裡它們可能是正常的，下面標出位置供你判斷。",
      homoglyphMixed: "有拉丁字母以外的字母混在拉丁單字裡。網址如果長這樣，那多半是偽裝。",
      homoglyphScript: "整段文字本來就是西里爾文或希臘文，那些字母是正常的。",
      copySuspect: "複製清掉可疑字元的版本",
      copyAll: "複製清掉全部隱形字元的版本",
      copied: "已複製",
      stripNote: "同形字不會被自動換掉。那是可見的字，換掉會改變原意，而你可能正在處理一段真的俄文。",
      note: "全部在你的瀏覽器裡處理，文字沒有送到任何地方，也沒有寫進任何儲存。斷網時照樣可以用。",
      kinds: {
        zwsp: "零寬空格",
        zwnj: "零寬不連字",
        zwj: "零寬連字",
        wordjoiner: "字詞連接",
        bom: "位元組順序記號",
        softhyphen: "軟連字號",
        mvs: "蒙古母音分隔",
        invisibletimes: "隱形乘號",
        invisibleseparator: "隱形分隔",
        invisibleplus: "隱形加號",
        lre: "左至右嵌入",
        rle: "右至左嵌入",
        pdf: "方向結束",
        lro: "左至右覆寫",
        rlo: "右至左覆寫",
        lri: "左至右隔離",
        rli: "右至左隔離",
        fsi: "首字強度隔離",
        pdi: "隔離結束",
        lrm: "左至右標記",
        rlm: "右至左標記",
        variation: "變體選擇器",
        tag: "標籤字元",
        homoglyph: "同形字",
      },
      about: {
        zwsp: "看不見也不佔寬度。插在字之間的組合可以當成識別碼，是文件外流追蹤最常用的一種。",
        zwj: "在 emoji 裡是組字用的，出現在一般文字之間就不是。",
        zwnj: "阿拉伯文與波斯文用得到，中文與英文之間出現就可疑。",
        bom: "檔案開頭的編碼標記。出現在文字中間沒有正當用途。",
        tag: "整段隱藏訊息可以編碼在這一區，正常文字用不到。",
        rlo: "把後面的文字反向顯示。程式碼裡放這個，人看到的順序跟編譯器讀到的不一樣。",
        homoglyph: "長得像拉丁字母的西里爾或希臘字母。釣魚網址最常用的手法。",
        variation: "接在 emoji 後面是正常的，接在一般文字後面不是。",
      },
    },
    zh: {
      placeholder: "粘贴要检查的文字",
      clean: "没有找到隐形字符或同形字。",
      found: "找到 {suspect} 个可疑的字符，另有 {context} 个要看语境。下面用橙色标出位置。",
      foundContext: "找到 {context} 个要看语境的字符。在这段文字里它们可能是正常的，下面标出位置供你判断。",
      homoglyphMixed: "有拉丁字母以外的字母混在拉丁单词里。网址如果长这样，那多半是伪装。",
      homoglyphScript: "整段文字本来就是西里尔文或希腊文，那些字母是正常的。",
      copySuspect: "复制清掉可疑字符的版本",
      copyAll: "复制清掉全部隐形字符的版本",
      copied: "已复制",
      stripNote: "同形字不会被自动换掉。那是可见的字，换掉会改变原意，而你可能正在处理一段真的俄文。",
      note: "全部在你的浏览器里处理，文字没有送到任何地方，也没有写进任何存储。断网时照样可以用。",
      kinds: {
        zwsp: "零宽空格",
        zwnj: "零宽不连字",
        zwj: "零宽连字",
        wordjoiner: "字词连接",
        bom: "字节顺序记号",
        softhyphen: "软连字号",
        mvs: "蒙古元音分隔",
        invisibletimes: "隐形乘号",
        invisibleseparator: "隐形分隔",
        invisibleplus: "隐形加号",
        lre: "左至右嵌入",
        rle: "右至左嵌入",
        pdf: "方向结束",
        lro: "左至右覆写",
        rlo: "右至左覆写",
        lri: "左至右隔离",
        rli: "右至左隔离",
        fsi: "首字强度隔离",
        pdi: "隔离结束",
        lrm: "左至右标记",
        rlm: "右至左标记",
        variation: "变体选择器",
        tag: "标签字符",
        homoglyph: "同形字",
      },
      about: {
        zwsp: "看不见也不占宽度。插在字之间的组合可以当成识别码，是文件外流追踪最常用的一种。",
        zwj: "在 emoji 里是组字用的，出现在一般文字之间就不是。",
        zwnj: "阿拉伯文与波斯文用得到，中文与英文之间出现就可疑。",
        bom: "文件开头的编码标记。出现在文字中间没有正当用途。",
        tag: "整段隐藏消息可以编码在这一区，正常文字用不到。",
        rlo: "把后面的文字反向显示。代码里放这个，人看到的顺序跟编译器读到的不一样。",
        homoglyph: "长得像拉丁字母的西里尔或希腊字母。钓鱼网址最常用的手法。",
        variation: "接在 emoji 后面是正常的，接在一般文字后面不是。",
      },
    },
    en: {
      placeholder: "Paste the text to check",
      clean: "No invisible characters or homoglyphs found.",
      found: "Found {suspect} suspicious characters, plus {context} that depend on context. Positions are marked in orange below.",
      foundContext: "Found {context} characters that depend on context. They may be legitimate in this text; positions are marked below so you can judge.",
      homoglyphMixed: "Non-Latin letters are mixed into Latin words. In a URL, that is almost always impersonation.",
      homoglyphScript: "This text is Cyrillic or Greek throughout, so those letters are simply the script.",
      copySuspect: "Copy with suspicious characters removed",
      copyAll: "Copy with all invisible characters removed",
      copied: "Copied",
      stripNote: "Homoglyphs are not replaced automatically. They are visible characters, replacing them changes the meaning, and you may be working with genuine Russian.",
      note: "Everything happens in your browser. The text is not sent anywhere and not written to storage. It works with the network off.",
      kinds: {
        zwsp: "ZWSP",
        zwnj: "ZWNJ",
        zwj: "ZWJ",
        wordjoiner: "word joiner",
        bom: "BOM",
        softhyphen: "soft hyphen",
        mvs: "Mongolian vowel separator",
        invisibletimes: "invisible times",
        invisibleseparator: "invisible separator",
        invisibleplus: "invisible plus",
        lre: "LRE",
        rle: "RLE",
        pdf: "PDF",
        lro: "LRO",
        rlo: "RLO",
        lri: "LRI",
        rli: "RLI",
        fsi: "FSI",
        pdi: "PDI",
        lrm: "LRM",
        rlm: "RLM",
        variation: "variation selector",
        tag: "tag character",
        homoglyph: "homoglyph",
      },
      about: {
        zwsp: "Invisible and zero width. Combinations inserted between characters work as an identifier, the most common way of tracking leaked documents.",
        zwj: "Legitimate inside emoji sequences, not between ordinary characters.",
        zwnj: "Used in Arabic and Persian. Between CJK or Latin text it is suspicious.",
        bom: "An encoding marker for the start of a file. It has no legitimate purpose mid-text.",
        tag: "An entire hidden message can be encoded in this block. Ordinary text never uses it.",
        rlo: "Reverses the display order of what follows. In source code, what a human reads differs from what the compiler does.",
        homoglyph: "Cyrillic or Greek letters shaped like Latin ones. The standard trick for phishing URLs.",
        variation: "Legitimate after an emoji, not after ordinary text.",
      },
    },
  };

  const t = STRINGS[document.documentElement.lang] || STRINGS["zh-TW"];
  const fill = (key, vars) => t[key].replace(/\{(\w+)\}/g, (_, n) => String(vars[n]));

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const state = { input: "", copied: "" };

  function render() {
    root.textContent = "";
    const box = document.createElement("textarea");
    box.placeholder = t.placeholder;
    box.value = state.input;
    box.spellcheck = false;
    box.addEventListener("input", () => {
      state.input = box.value;
      state.copied = "";
      update();
    });
    root.appendChild(box);
    root.appendChild(el("div", "iv-body"));
    root.appendChild(el("p", "iv-note", t.note));
    update();
  }

  // 把文字重畫一次，可疑的字元換成看得見的標記。這是這一頁的重點：讀者要看到
  // 那些東西在哪裡，只給一個數字沒有用。
  function renderMarked(text, findings) {
    const byIndex = new Map(findings.map((f) => [f.index, f]));
    const wrap = el("div", "iv-marked");
    const chars = Array.from(text);
    let buffer = "";
    for (let i = 0; i < chars.length; i += 1) {
      const found = byIndex.get(i);
      if (!found) {
        buffer += chars[i];
        continue;
      }
      if (buffer) {
        wrap.appendChild(document.createTextNode(buffer));
        buffer = "";
      }
      const label = found.kind === "homoglyph"
        ? chars[i] + "→" + found.looksLike
        : (t.kinds[found.kind] || found.kind);
      wrap.appendChild(
        el("span", "iv-mark" + (found.level === "context" ? " iv-mark--context" : ""), label)
      );
    }
    if (buffer) wrap.appendChild(document.createTextNode(buffer));
    return wrap;
  }

  function copyButton(label, getText, id) {
    const node = el("button", null, state.copied === id ? t.copied : label);
    node.type = "button";
    node.addEventListener("click", () => {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(getText()).then(() => {
        state.copied = id;
        update();
      });
    });
    node.disabled = !navigator.clipboard;
    return node;
  }

  function update() {
    const body = root.querySelector(".iv-body");
    if (!body) return;
    body.textContent = "";
    const text = state.input;
    if (!text) return;

    const findings = scan(text);
    const suspect = findings.filter((f) => f.level === "suspect").length;
    const context = findings.length - suspect;

    if (!findings.length) {
      body.appendChild(el("p", "iv-verdict iv-clean-verdict", t.clean));
      return;
    }

    body.appendChild(
      el("p", "iv-verdict iv-dirty-verdict",
        fill(suspect ? "found" : "foundContext", { suspect: suspect, context: context }))
    );
    body.appendChild(renderMarked(text, findings));

    // 每一類出現幾次，以及那一類是什麼東西
    const counts = {};
    for (const f of findings) counts[f.kind] = (counts[f.kind] || 0) + 1;
    const list = el("ul", "iv-list");
    for (const [kind, n] of Object.entries(counts)) {
      const li = document.createElement("li");
      li.appendChild(el("code", "iv-code", t.kinds[kind] || kind));
      li.appendChild(document.createTextNode(" × " + n + "　" + (t.about[kind] || "")));
      list.appendChild(li);
    }
    body.appendChild(list);

    const verdict = homoglyphVerdict(text, findings);
    if (verdict === "mixed") body.appendChild(el("p", "iv-verdict", t.homoglyphMixed));
    if (verdict === "script") body.appendChild(el("p", "iv-note", t.homoglyphScript));

    const row = el("div", "iv-row");
    if (suspect) {
      row.appendChild(copyButton(t.copySuspect, () => stripSuspect(text), "suspect"));
    }
    row.appendChild(copyButton(t.copyAll, () => strip(text), "all"));
    body.appendChild(row);
    body.appendChild(el("p", "iv-note", t.stripNote));
  }

  render();
})();
