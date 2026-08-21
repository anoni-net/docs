/*
 * 密語與密碼產生器（utils/passphrase.md）。
 *
 * 全部在讀者的瀏覽器裡跑，什麼都不送出，斷網照樣能用。最後那件事是這個工具最強的
 * 保證：連得上網才能運作的密碼產生器，讀者沒有辦法確認它有沒有偷送東西出去。
 *
 * 隨機來源是 crypto.getRandomValues，取樣用 rejection sampling 去掉模偏差，理由寫在
 * randomBelow 上面。詞表是社群自己做的 asian-diceware（7776 字，CC BY 4.0），跟
 * tools/asian-diceware.md 那篇講的是同一份。
 *
 * 三個語系共用這一份，docs/en/js/ 與 docs/zh-CN/js/ 底下是指向這裡的 symlink，
 * 跟 offline-library.js 同一個做法。純邏輯的部分寫成獨立函式，由
 * tools/test_passphrase.mjs 原地抽出來測，那幾支錯了是讀者拿到看起來安全的弱密碼。
 */
(function () {
  "use strict";

  // --- 純邏輯（tools/test_passphrase.mjs 從這裡原地抽出來測）---

  // 從 [0, limit) 取一個無偏的隨機整數。
  //
  // 直接對 32 位元隨機數取模會有偏差：2^32 不是 7776 的倍數，餘數落在前面那幾個
  // 字的機率比後面高一點點。這裡把不能整除的尾巴丟掉重抽，讓每個字的機率相同。
  // 偏差很小，但這是密碼工具，沒有理由把「很小」留在裡面。
  function randomBelow(limit, randomUint32) {
    const range = 4294967296; // 2^32
    const cutoff = range - (range % limit);
    let value;
    do {
      value = randomUint32();
    } while (value >= cutoff);
    return value % limit;
  }

  // 抽 count 個字。允許重複：Diceware 每一次都是獨立的擲骰，排除重複反而會讓
  // 熵比宣稱的低（後面幾個字的可選範圍變小）。
  function pickWords(words, count, randomUint32) {
    const out = [];
    for (let i = 0; i < count; i += 1) {
      out.push(words[randomBelow(words.length, randomUint32)]);
    }
    return out;
  }

  function makePassword(charset, length, randomUint32) {
    let out = "";
    for (let i = 0; i < length; i += 1) {
      out += charset[randomBelow(charset.length, randomUint32)];
    }
    return out;
  }

  // 熵。密語是 count × log2(詞表大小)，密碼是 length × log2(字元集大小)。
  // 這個數字只在「每一次抽取都獨立且均勻」時成立，所以上面那兩支不能偷懶。
  function entropyBits(poolSize, count) {
    if (poolSize < 2 || count < 1) return 0;
    return count * Math.log2(poolSize);
  }

  // 字元集。刻意不提供「排除易混淆字元」的選項：拿掉 l、1、O、0 會讓字元集變小、
  // 熵變低，而讀者多半用密碼管理器存，不會手抄。
  const CHARSETS = {
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    digit: "0123456789",
    symbol: "!#$%&*+-=?@^_~",
  };

  function buildCharset(picked) {
    let out = "";
    for (const key of ["lower", "upper", "digit", "symbol"]) {
      if (picked[key]) out += CHARSETS[key];
    }
    return out;
  }

  // 熵落在哪一級。數字本身對多數人沒有意義，要有一句話說它夠不夠用。
  // 分界取自 EFF 對 Diceware 的建議（六個字約 77 bits）與 NIST SP 800-63B 的討論。
  function strengthOf(bits) {
    if (bits < 50) return "weak";
    if (bits < 70) return "fair";
    if (bits < 90) return "good";
    return "strong";
  }

  // --- 介面 ---

  const root = document.getElementById("passphrase-tool");
  if (!root) return;

  const CSS = `
    #passphrase-tool { margin: 1em 0; }
    #passphrase-tool .pp-modes { display: flex; gap: .4rem; margin: 0 0 1rem; }
    #passphrase-tool button {
      font: inherit; color: inherit; cursor: pointer; background: none;
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .35rem .8rem;
    }
    #passphrase-tool button:hover:not(:disabled) {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #passphrase-tool button:disabled { opacity: .5; cursor: default; }
    #passphrase-tool button[aria-pressed="true"] {
      border-color: var(--md-primary-fg-color);
      background: var(--md-primary-fg-color);
      color: var(--md-primary-bg-color);
    }
    #passphrase-tool .pp-row {
      display: flex; align-items: center; flex-wrap: wrap; gap: .6rem; margin: 0 0 .8rem;
    }
    #passphrase-tool label { cursor: pointer; }
    #passphrase-tool input[type="range"] { flex: 1 1 8rem; min-width: 6rem; }
    #passphrase-tool .pp-count { font-variant-numeric: tabular-nums; min-width: 2.4rem; }
    #passphrase-tool .pp-out {
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .8rem; margin: 1rem 0 .6rem;
      font-family: var(--md-code-font-family, monospace);
      font-size: .78rem; line-height: 1.7; word-break: break-all;
      user-select: all; min-height: 2.4rem;
    }
    #passphrase-tool .pp-meta { font-size: .7rem; opacity: .75; margin: 0 0 1rem; }
    #passphrase-tool .pp-bar {
      height: .2rem; border-radius: .1rem; margin: .35rem 0;
      background: var(--md-default-fg-color--lightest); overflow: hidden;
    }
    #passphrase-tool .pp-bar span { display: block; height: 100%; width: 0; }
    #passphrase-tool .pp-weak span { background: #c62828; }
    #passphrase-tool .pp-fair span { background: #ef6c00; }
    #passphrase-tool .pp-good span { background: #2e7d32; }
    #passphrase-tool .pp-strong span { background: var(--md-primary-fg-color); }
    #passphrase-tool .pp-note {
      font-size: .7rem; opacity: .7; line-height: 1.6; margin: .8rem 0 0;
    }
    @media (pointer: coarse) {
      #passphrase-tool button { min-height: 2.2rem; }
    }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const STRINGS = {
    "zh-TW": {
      loading: "詞表載入中",
      failed: "詞表載入失敗。連上網重新整理一次，之後這一頁離線也能用。",
      modePhrase: "密語",
      modePassword: "隨機密碼",
      words: "字數",
      length: "長度",
      separator: "分隔",
      generate: "重新產生",
      copy: "複製",
      copied: "已複製",
      entropy: "約 {bits} bits 的熵，相當於從 {pool} 個候選裡獨立抽 {count} 次",
      weak: "偏弱，只適合不重要的地方",
      fair: "普通，一般網站夠用",
      good: "夠強，重要帳號可以用",
      strong: "很強，主密碼等級",
      charsetEmpty: "至少要選一種字元",
      note: "全部在你的瀏覽器裡產生，沒有送出任何東西，斷網時照樣可以用。複製之後記得剪貼簿的內容其他程式讀得到，貼進密碼管理器就清掉。",
    },
    zh: {
      loading: "词表加载中",
      failed: "词表加载失败。连上网刷新一次，之后这一页离线也能用。",
      modePhrase: "密语",
      modePassword: "随机密码",
      words: "字数",
      length: "长度",
      separator: "分隔",
      generate: "重新生成",
      copy: "复制",
      copied: "已复制",
      entropy: "约 {bits} bits 的熵，相当于从 {pool} 个候选里独立抽 {count} 次",
      weak: "偏弱，只适合不重要的地方",
      fair: "普通，一般网站够用",
      good: "够强，重要账号可以用",
      strong: "很强，主密码等级",
      charsetEmpty: "至少要选一种字符",
      note: "全部在你的浏览器里生成，没有送出任何东西，断网时照样可以用。复制之后记得剪贴板的内容其他程序读得到，贴进密码管理器就清掉。",
    },
    en: {
      loading: "Loading the word list",
      failed: "The word list could not be loaded. Reload once while online and this page will work offline afterwards.",
      modePhrase: "Passphrase",
      modePassword: "Random password",
      words: "Words",
      length: "Length",
      separator: "Separator",
      generate: "Generate again",
      copy: "Copy",
      copied: "Copied",
      entropy: "About {bits} bits of entropy, the same as drawing {count} times independently from {pool} candidates",
      weak: "Weak, fine only where it does not matter",
      fair: "Fair, enough for an ordinary account",
      good: "Good, usable for accounts that matter",
      strong: "Strong, master-password grade",
      charsetEmpty: "Pick at least one character type",
      note: "Everything is generated in your browser. Nothing is sent anywhere, and it works with the network off. After copying, remember that other programs can read the clipboard, so clear it once it is in your password manager.",
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

  const randomUint32 = () => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0];
  };

  const state = {
    words: null,
    mode: "phrase",
    wordCount: 6,
    separator: "-",
    length: 20,
    charset: { lower: true, upper: true, digit: true, symbol: true },
    value: "",
    copied: false,
  };

  function generate() {
    if (state.mode === "phrase") {
      if (!state.words) return;
      state.value = pickWords(state.words, state.wordCount, randomUint32).join(
        state.separator
      );
    } else {
      const charset = buildCharset(state.charset);
      state.value = charset
        ? makePassword(charset, state.length, randomUint32)
        : "";
    }
    state.copied = false;
  }

  function currentEntropy() {
    if (state.mode === "phrase") {
      return {
        bits: entropyBits(state.words ? state.words.length : 0, state.wordCount),
        pool: state.words ? state.words.length : 0,
        count: state.wordCount,
      };
    }
    const charset = buildCharset(state.charset);
    return {
      bits: entropyBits(charset.length, state.length),
      pool: charset.length,
      count: state.length,
    };
  }

  function button(label, onClick, pressed) {
    const node = el("button", null, label);
    node.type = "button";
    if (pressed !== undefined) node.setAttribute("aria-pressed", String(pressed));
    node.addEventListener("click", onClick);
    return node;
  }

  function render() {
    root.textContent = "";

    const modes = el("div", "pp-modes");
    modes.appendChild(
      button(t.modePhrase, () => {
        state.mode = "phrase";
        generate();
        render();
      }, state.mode === "phrase")
    );
    modes.appendChild(
      button(t.modePassword, () => {
        state.mode = "password";
        generate();
        render();
      }, state.mode === "password")
    );
    root.appendChild(modes);

    if (state.mode === "phrase") {
      const row = el("div", "pp-row");
      row.appendChild(el("span", null, t.words));
      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = "4";
      slider.max = "12";
      slider.value = String(state.wordCount);
      slider.addEventListener("input", () => {
        state.wordCount = Number(slider.value);
        generate();
        render();
      });
      row.appendChild(slider);
      row.appendChild(el("span", "pp-count", String(state.wordCount)));
      root.appendChild(row);

      const sep = el("div", "pp-row");
      sep.appendChild(el("span", null, t.separator));
      for (const [label, value] of [["-", "-"], [".", "."], ["␣", " "]]) {
        sep.appendChild(
          button(label, () => {
            state.separator = value;
            generate();
            render();
          }, state.separator === value)
        );
      }
      root.appendChild(sep);
    } else {
      const row = el("div", "pp-row");
      row.appendChild(el("span", null, t.length));
      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = "8";
      slider.max = "64";
      slider.value = String(state.length);
      slider.addEventListener("input", () => {
        state.length = Number(slider.value);
        generate();
        render();
      });
      row.appendChild(slider);
      row.appendChild(el("span", "pp-count", String(state.length)));
      root.appendChild(row);

      const sets = el("div", "pp-row");
      for (const [key, sample] of [
        ["lower", "a-z"],
        ["upper", "A-Z"],
        ["digit", "0-9"],
        ["symbol", "!#$"],
      ]) {
        const label = document.createElement("label");
        const box = document.createElement("input");
        box.type = "checkbox";
        box.checked = state.charset[key];
        box.addEventListener("change", () => {
          state.charset[key] = box.checked;
          generate();
          render();
        });
        label.appendChild(box);
        label.appendChild(document.createTextNode(" " + sample));
        sets.appendChild(label);
      }
      root.appendChild(sets);
    }

    const out = el("div", "pp-out");
    if (state.mode === "phrase" && !state.words) {
      out.textContent = state.words === false ? t.failed : t.loading;
    } else if (!state.value && state.mode === "password") {
      out.textContent = t.charsetEmpty;
    } else {
      out.textContent = state.value;
    }
    root.appendChild(out);

    const { bits, pool, count } = currentEntropy();
    if (bits > 0) {
      const level = strengthOf(bits);
      const bar = el("div", "pp-bar pp-" + level);
      const fillBar = document.createElement("span");
      // 128 bits 當作滿格，超過就滿。再多的位元對讀者沒有實際差別。
      fillBar.style.width = Math.min(100, Math.round((bits / 128) * 100)) + "%";
      bar.appendChild(fillBar);
      root.appendChild(bar);
      root.appendChild(
        el(
          "p",
          "pp-meta",
          // 一位小數，跟文章裡寫的 77.5 對得起來。取整會變 78，讀者會以為兩邊算的不是同一件事。
          fill("entropy", { bits: bits.toFixed(1), pool: pool, count: count }) +
            "。" +
            t[level]
        )
      );
    }

    const actions = el("div", "pp-row");
    const regenerate = button(t.generate, () => {
      generate();
      render();
    });
    regenerate.disabled = !state.value;
    actions.appendChild(regenerate);

    const copy = button(state.copied ? t.copied : t.copy, () => {
      if (!state.value || !navigator.clipboard) return;
      navigator.clipboard.writeText(state.value).then(() => {
        state.copied = true;
        render();
      });
    });
    copy.disabled = !state.value || !navigator.clipboard;
    actions.appendChild(copy);
    root.appendChild(actions);

    root.appendChild(el("p", "pp-note", t.note));
  }

  render();

  // 詞表跟頁面分開放，換詞表不必動這支。它列在這一頁的 frontmatter offline_assets
  // 裡，所以讀者把這一頁存下來時會一起存，離線照樣抽得出密語。
  // 詞表放在 utils/ 底下，而這一頁是 utils/passphrase/，所以往上一層。
  fetch(new URL("../asian-diceware-7776.txt", location.href).href, {
    credentials: "same-origin",
  })
    .then((response) => (response.ok ? response.text() : null))
    .then((text) => {
      const words = text ? text.split("\n").map((w) => w.trim()).filter(Boolean) : null;
      state.words = words && words.length > 1 ? words : false;
      generate();
      render();
    })
    .catch(() => {
      state.words = false;
      render();
    });
})();
