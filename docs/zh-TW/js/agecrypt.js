/*
 * 本機檔案加密（utils/age.md）。
 *
 * 選一個檔案、輸入密語，在瀏覽器裡加密成 age 格式下載，或把 age 檔解回來。檔案與
 * 密語都不離開裝置。為什麼是 age 而非 PGP、格式長什麼樣，寫在 tools/what-is-age.md，
 * 這一頁只放操作。
 *
 * === 程式從哪裡來 ===
 *
 * 加解密交給 typage（age 作者維護的 TypeScript 實作），連同它相依的 noble 與 scure
 * 函式庫一起原封不動放在 utils/vendor/age/ 底下，每一個檔案都能跟 npm 上的版本逐位元組
 * 比對。它們是 ES module，頁面用 import map 把 "age-encryption" 與 "@noble/..." 這些名稱
 * 接到 vendor 路徑，這一支再用 import() 動態載入。第一次載入需要網路，之後 service
 * worker 與離線閱讀頁的清單（offline_assets 逐一列了那 38 個檔案）會留住它們。
 *
 * === 幾個決定 ===
 *
 * 只做密語模式。公鑰模式需要金鑰管理，是另一個工具的範圍。
 *
 * 模式由檔案內容決定：開頭是 age 的版本行就解密，其餘一律加密。少一個要讀者選的開關。
 *
 * 加密完先用同一組密語解回來比對，一致才給下載。跟 metadata 清除器同一個原則：
 * 工具要是把檔案弄壞了，這一步會攔下來，讀者不會拿著一份解不開的備份離開。
 *
 * scrypt 的工作因數用 age 命令列的預設值 2^18。手機上要幾秒，按鈕會轉圈。
 * 不偷降：降了檔案照樣能被別的實作解開，但猜密語也變快。
 *
 * 密語不存、不送、不記。重新整理就沒了。「抽一組密語」用的是 Asian Diceware 的詞表，
 * 跟密語產生器同一份，取樣方式也相同（拒絕重抽，理由見 passphrase.js）。
 *
 * 三個語系共用這一份，docs/en/js/ 與 docs/zh-CN/js/ 底下是指向這裡的 symlink。
 * 純邏輯由 tools/test_agecrypt.mjs 原地抽出來測，那支另外用 Node 內建的 crypto 獨立
 * 實作了 age 的密語模式，把 typage 的輸出解回來、也讓 typage 解它的輸出，兩邊互驗。
 */
(function () {
  "use strict";

  // --- 純邏輯（tools/test_agecrypt.mjs 從這裡原地抽出來測）---

  const AGE_HEADER = "age-encryption.org/v1";
  const AGE_ARMOR = "-----BEGIN AGE ENCRYPTED FILE-----";

  // 整份檔案在記憶體裡處理：讀進來、加密、再解回來比對，等於同時存三份。
  // 超過這個大小在手機上會直接失敗，先擋下來說清楚。
  const MAX_BYTES = 200 * 1024 * 1024;

  // age 命令列的預設值。2^18 在桌機約半秒，手機約兩到五秒。
  const SCRYPT_LOG2_N = 18;

  // 密語的詞數建議。六個詞是 77 bits，理由寫在 asian-diceware.md。
  const WORDS_SUGGESTED = 6;

  function asciiPrefix(bytes, length) {
    let text = "";
    for (let i = 0; i < length && i < bytes.length; i += 1) {
      text += String.fromCharCode(bytes[i]);
    }
    return text;
  }

  // 開頭是版本行的就是 age 檔，ASCII armor 那種也算
  function isAgeFile(bytes) {
    const head = asciiPrefix(bytes, AGE_ARMOR.length);
    return head.indexOf(AGE_HEADER) === 0 || head.indexOf(AGE_ARMOR) === 0;
  }

  // 輸出檔名。加密加上 .age，解密去掉 .age，沒有 .age 的解密輸出加 .decrypted，
  // 兩份放在同一個資料夾不會互相蓋掉。
  function outputName(name, mode) {
    const base = String(name || "file");
    if (mode === "encrypt") return base + ".age";
    if (/\.age$/i.test(base)) return base.slice(0, -4);
    return base + ".decrypted";
  }

  // 直接對 32 位元隨機數取模會有偏差，超過最後一個完整區間的值丟掉重抽。
  function randomBelow(limit, randomUint32) {
    const span = Math.floor(4294967296 / limit) * limit;
    for (;;) {
      const value = randomUint32();
      if (value < span) return value % limit;
    }
  }

  function pickWords(words, count, randomUint32) {
    const out = [];
    for (let i = 0; i < count; i += 1) {
      out.push(words[randomBelow(words.length, randomUint32)]);
    }
    return out;
  }

  // --- 介面 ---

  const root = document.getElementById("age-tool");
  if (!root) return;

  const CSS = `
    #age-tool { margin: 1em 0; }
    #age-tool .ag-drop {
      border: .1rem dashed var(--md-default-fg-color--lighter);
      border-radius: .2rem; padding: 1.6rem 1rem; text-align: center;
      font-size: .78rem; line-height: 1.8; cursor: pointer;
    }
    #age-tool .ag-drop--over { border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color); }
    #age-tool input[type="file"] { display: none; }
    #age-tool .ag-file {
      border: .05rem solid var(--md-default-fg-color--lighter); border-radius: .2rem;
      padding: .8rem; margin: .8rem 0 0; font-size: .74rem; line-height: 1.7;
    }
    #age-tool .ag-file--decrypt { border-left: .15rem solid var(--md-primary-fg-color); }
    #age-tool .ag-name { font-family: var(--md-code-font-family, monospace); word-break: break-all; margin: 0 0 .4rem; }
    #age-tool label.ag-label { display: block; font-size: .74rem; margin: .8rem 0 .2rem; }
    #age-tool .ag-row { display: flex; flex-wrap: wrap; gap: .4rem; align-items: center; }
    #age-tool input[type="password"], #age-tool input[type="text"] {
      font: inherit; font-size: .8rem; flex: 1; min-width: 12rem;
      padding: .4rem .6rem; border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; background: var(--md-default-bg-color); color: inherit;
    }
    #age-tool .ag-drawn {
      font-family: var(--md-code-font-family, monospace); font-size: .8rem;
      background: var(--md-code-bg-color); padding: .5rem .7rem; border-radius: .1rem;
      margin: .4rem 0; user-select: all; word-break: break-word;
    }
    #age-tool button, #age-tool a.ag-dl {
      font: inherit; font-size: .74rem; color: inherit; cursor: pointer; background: none;
      border: .05rem solid var(--md-default-fg-color--lighter); border-radius: .1rem;
      padding: .3rem .7rem; display: inline-block; text-decoration: none;
    }
    #age-tool button:hover:not(:disabled):not(.ag-primary), #age-tool a.ag-dl:hover {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #age-tool .ag-primary {
      background: var(--md-primary-fg-color); color: var(--md-primary-bg-color);
      border-color: var(--md-primary-fg-color);
    }
    #age-tool .ag-primary:hover:not(:disabled) { filter: brightness(1.1); }
    #age-tool button:disabled { opacity: .5; cursor: default; }
    #age-tool .ag-actions { margin: .8rem 0 0; }
    #age-tool .ag-result {
      border-left: .15rem solid #2e7d32; padding: .1rem 0 .1rem .6rem;
      margin: .8rem 0; font-size: .74rem; line-height: 1.7;
    }
    #age-tool .ag-error {
      border-left: .15rem solid #c62828; padding: .1rem 0 .1rem .6rem;
      margin: .8rem 0; font-size: .74rem; line-height: 1.7;
    }
    #age-tool .ag-hint { font-size: .7rem; opacity: .75; line-height: 1.7; margin: .3rem 0 0; }
    #age-tool .ag-note { font-size: .7rem; opacity: .75; line-height: 1.7; margin: .8rem 0 0; }
    @media (pointer: coarse) { #age-tool button, #age-tool a.ag-dl { min-height: 2.2rem; } }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const STRINGS = {
    "zh-TW": {
      drop: "把要加密的檔案拖進來，或點一下選檔案。拖進來的是 age 檔就會改成解密。",
      dropOver: "放開就載入",
      encryptMode: "要加密：{name}（{size}）",
      decryptMode: "這是 age 檔，要解密：{name}（{size}）",
      passphrase: "密語",
      show: "顯示",
      hide: "隱藏",
      draw: "抽一組密語",
      drawing: "詞表載入中",
      drawn: "抽好了，抄下來。關掉頁面就沒了，忘了密語沒有任何人能救。",
      short: "少於 {n} 個詞的密語擋不了認真猜的人，用「抽一組密語」或自己組長一點。",
      encrypt: "加密並下載",
      decrypt: "解密並下載",
      working: "處理中，密語要先經過 scrypt 拉長運算，手機上要幾秒",
      encrypted: "加密完成，已用同一組密語解回來比對，跟原檔一致。",
      decrypted: "解開了。",
      download: "下載 {name}",
      sizeLine: "原始 {a}，輸出 {b}",
      another: "換一個檔案",
      errors: {
        empty: "先輸入密語。",
        tooLarge: "檔案超過 {limit}，整份要在記憶體裡處理，太大會失敗。先切小，或用命令列工具。",
        wrongPassphrase: "密語不對，或者這個 age 檔不是用密語加密的。用金鑰加密的檔案這一頁解不了。",
        broken: "不是完整的 age 檔，或已經損壞。",
        verify: "加密完解回來比對不一致，那是工具的問題。原始檔沒有被動到，請不要用輸出的那一份，並回報。",
        libMissing: "加密用的程式還沒載入。第一次使用需要連上網，之後會留在裝置上。",
        words: "詞表載不進來，自己輸入一組密語，或到密語產生器抽一組。",
      },
      note: "檔案與密語都在你的瀏覽器裡處理，沒有送到任何地方。密語不會被記住，重新整理就沒了。",
    },
    zh: {
      drop: "把要加密的文件拖进来，或点一下选文件。拖进来的是 age 文件就会改成解密。",
      dropOver: "松开就加载",
      encryptMode: "要加密：{name}（{size}）",
      decryptMode: "这是 age 文件，要解密：{name}（{size}）",
      passphrase: "密语",
      show: "显示",
      hide: "隐藏",
      draw: "抽一组密语",
      drawing: "词表加载中",
      drawn: "抽好了，抄下来。关掉页面就没了，忘了密语没有任何人能救。",
      short: "少于 {n} 个词的密语挡不了认真猜的人，用「抽一组密语」或自己组长一点。",
      encrypt: "加密并下载",
      decrypt: "解密并下载",
      working: "处理中，密语要先经过 scrypt 拉长运算，手机上要几秒",
      encrypted: "加密完成，已用同一组密语解回来比对，跟原文件一致。",
      decrypted: "解开了。",
      download: "下载 {name}",
      sizeLine: "原始 {a}，输出 {b}",
      another: "换一个文件",
      errors: {
        empty: "先输入密语。",
        tooLarge: "文件超过 {limit}，整份要在内存里处理，太大会失败。先切小，或用命令行工具。",
        wrongPassphrase: "密语不对，或者这个 age 文件不是用密语加密的。用密钥加密的文件这一页解不了。",
        broken: "不是完整的 age 文件，或已经损坏。",
        verify: "加密完解回来比对不一致，那是工具的问题。原始文件没有被动到，请不要用输出的那一份，并回报。",
        libMissing: "加密用的程序还没加载。第一次使用需要联网，之后会留在设备上。",
        words: "词表加载不进来，自己输入一组密语，或到密语生成器抽一组。",
      },
      note: "文件与密语都在你的浏览器里处理，没有送到任何地方。密语不会被记住，刷新就没了。",
    },
    en: {
      drop: "Drop the file to encrypt here, or click to choose one. Drop an age file and it switches to decrypting.",
      dropOver: "Release to load",
      encryptMode: "To encrypt: {name} ({size})",
      decryptMode: "This is an age file, to decrypt: {name} ({size})",
      passphrase: "Passphrase",
      show: "Show",
      hide: "Hide",
      draw: "Draw a passphrase",
      drawing: "Loading the word list",
      drawn: "Drawn. Write it down. It is gone when you close the page, and nobody can recover a forgotten passphrase.",
      short: "Fewer than {n} words will not hold against a determined guess. Use “Draw a passphrase” or make your own longer.",
      encrypt: "Encrypt and download",
      decrypt: "Decrypt and download",
      working: "Working. The passphrase goes through scrypt first, which takes a few seconds on a phone",
      encrypted: "Encrypted, and decrypted again with the same passphrase to check: it matches the original.",
      decrypted: "Decrypted.",
      download: "Download {name}",
      sizeLine: "Original {a}, output {b}",
      another: "Another file",
      errors: {
        empty: "Enter a passphrase first.",
        tooLarge: "The file is over {limit}. It is processed whole in memory, and a file this large would fail. Split it, or use the command-line tool.",
        wrongPassphrase: "Wrong passphrase, or this age file was not encrypted with a passphrase. Files encrypted to a key cannot be opened here.",
        broken: "Not a complete age file, or damaged.",
        verify: "Decrypting the output did not match the original. That is a bug in this tool. Your original is untouched. Do not use the output, and please report it.",
        libMissing: "The encryption code has not loaded. The first use needs a connection; after that it stays on the device.",
        words: "The word list could not be loaded. Type a passphrase yourself, or draw one on the passphrase generator page.",
      },
      note: "The file and the passphrase are handled in your browser and sent nowhere. The passphrase is not remembered. Reload and it is gone.",
    },
  };
  const t = STRINGS[document.documentElement.lang] || STRINGS["zh-TW"];
  const fill = (text, vars) =>
    Object.keys(vars || {}).reduce((out, name) => out.split("{" + name + "}").join(vars[name]), text);

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function humanSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(1) + " MB";
  }

  const state = {
    file: null,      // { name, size, bytes, mode }
    passphrase: "",
    show: false,
    working: false,
    result: null,    // { url, name, size }
    error: null,
    drawn: null,
    words: null,     // null 還沒抓、false 抓失敗、陣列抓到了
    drawing: false,
  };

  function releaseResult() {
    if (state.result && state.result.url) URL.revokeObjectURL(state.result.url);
    state.result = null;
  }

  // typage 經由頁面的 import map 載入，路徑在 vendor/age/ 底下
  let libPromise = null;
  function lib() {
    if (!libPromise) {
      libPromise = import("age-encryption").catch((err) => {
        libPromise = null;
        throw err;
      });
    }
    return libPromise;
  }

  const randomUint32 = () => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0];
  };

  function loadWords() {
    if (state.words !== null || state.drawing) return Promise.resolve(state.words);
    state.drawing = true;
    render();
    // 詞表放在 utils/ 底下，這一頁是 utils/age/，所以往上一層。跟密語產生器同一份。
    return fetch(new URL("../asian-diceware-7776.txt", location.href).href, { credentials: "same-origin" })
      .then((response) => (response.ok ? response.text() : null))
      .then((text) => {
        const words = text ? text.split("\n").map((w) => w.trim()).filter(Boolean) : null;
        state.words = words && words.length > 1 ? words : false;
      })
      .catch(() => {
        state.words = false;
      })
      .then(() => {
        state.drawing = false;
        return state.words;
      });
  }

  async function load(file) {
    if (!file) return;
    releaseResult();
    state.error = null;
    state.drawn = null;
    if (file.size > MAX_BYTES) {
      state.file = null;
      state.error = "tooLarge";
      render();
      return;
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    state.file = {
      name: file.name, size: file.size, bytes: bytes,
      mode: isAgeFile(bytes) ? "decrypt" : "encrypt",
    };
    render();
  }

  async function sha256(bytes) {
    return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  }

  function sameBytes(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
    return true;
  }

  async function run() {
    if (!state.file || state.working) return;
    if (!state.passphrase) {
      state.error = "empty";
      render();
      return;
    }
    releaseResult();
    state.error = null;
    state.working = true;
    render();
    await new Promise((next) => setTimeout(next, 0));
    let age;
    try {
      age = await lib();
    } catch (err) {
      state.working = false;
      state.error = "libMissing";
      render();
      return;
    }
    const passphrase = state.passphrase;
    try {
      let output;
      if (state.file.mode === "encrypt") {
        const encrypter = new age.Encrypter();
        encrypter.setPassphrase(passphrase);
        encrypter.setScryptWorkFactor(SCRYPT_LOG2_N);
        output = await encrypter.encrypt(state.file.bytes);
        // 交出去之前自己解回來比對。比對的是雜湊，兩份一起留在記憶體裡太占。
        const decrypter = new age.Decrypter();
        decrypter.addPassphrase(passphrase);
        const back = await decrypter.decrypt(output, "uint8array");
        if (!sameBytes(await sha256(back), await sha256(state.file.bytes))) {
          throw new Error("verify");
        }
      } else {
        const decrypter = new age.Decrypter();
        decrypter.addPassphrase(passphrase);
        try {
          output = await decrypter.decrypt(state.file.bytes, "uint8array");
        } catch (err) {
          throw new Error(/passphrase|identit|scrypt|MAC|no recipient|incorrect/i.test(String(err && err.message)) ? "wrongPassphrase" : "broken");
        }
      }
      const blob = new Blob([output], { type: "application/octet-stream" });
      state.result = {
        url: URL.createObjectURL(blob),
        name: outputName(state.file.name, state.file.mode),
        size: blob.size,
      };
    } catch (err) {
      const reason = err && err.message;
      state.error = ["verify", "wrongPassphrase", "broken"].indexOf(reason) >= 0 ? reason : "broken";
    }
    state.working = false;
    render();
  }

  function button(label, className, onClick) {
    const node = el("button", className, label);
    node.type = "button";
    node.addEventListener("click", onClick);
    return node;
  }

  function renderPicker() {
    const picker = document.createElement("input");
    picker.type = "file";
    picker.addEventListener("change", () => load(picker.files && picker.files[0]));
    const drop = el("div", "ag-drop", t.drop);
    drop.addEventListener("click", () => picker.click());
    drop.addEventListener("dragover", (event) => {
      event.preventDefault();
      drop.classList.add("ag-drop--over");
      drop.textContent = t.dropOver;
    });
    drop.addEventListener("dragleave", () => {
      drop.classList.remove("ag-drop--over");
      drop.textContent = t.drop;
    });
    drop.addEventListener("drop", (event) => {
      event.preventDefault();
      drop.classList.remove("ag-drop--over");
      const files = event.dataTransfer && event.dataTransfer.files;
      load(files && files[0]);
    });
    root.appendChild(picker);
    root.appendChild(drop);
  }

  function render() {
    // 輸入框在打字時不能重建，重畫會失去焦點。密語欄位存在就只更新其他部分。
    root.textContent = "";

    if (!state.file) {
      renderPicker();
      if (state.error) root.appendChild(el("p", "ag-error", fill(t.errors[state.error] || t.errors.broken, { limit: humanSize(MAX_BYTES) })));
      root.appendChild(el("p", "ag-note", t.note));
      return;
    }

    const file = state.file;
    const box = el("div", "ag-file" + (file.mode === "decrypt" ? " ag-file--decrypt" : ""));
    box.appendChild(el("p", "ag-name", fill(file.mode === "decrypt" ? t.decryptMode : t.encryptMode, {
      name: file.name, size: humanSize(file.size),
    })));

    const label = el("label", "ag-label", t.passphrase);
    const row = el("div", "ag-row");
    const input = document.createElement("input");
    input.type = state.show ? "text" : "password";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.value = state.passphrase;
    input.addEventListener("input", () => {
      state.passphrase = input.value;
      // 只動按鈕的停用狀態，不整頁重畫
      const primary = root.querySelector(".ag-primary");
      if (primary) primary.disabled = state.working || !state.passphrase;
      const hint = root.querySelector(".ag-short");
      if (hint) hint.hidden = !isShort(state.passphrase);
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") run();
    });
    row.appendChild(input);
    row.appendChild(button(state.show ? t.hide : t.show, null, () => {
      state.show = !state.show;
      render();
    }));
    if (file.mode === "encrypt") {
      const draw = button(state.drawing ? t.drawing : t.draw, null, () => {
        loadWords().then((words) => {
          if (!words) {
            state.error = "words";
            render();
            return;
          }
          state.drawn = pickWords(words, WORDS_SUGGESTED, randomUint32).join(" ");
          state.passphrase = state.drawn;
          state.show = true;
          state.error = null;
          render();
        });
      });
      draw.disabled = state.drawing || state.working;
      row.appendChild(draw);
    }
    label.appendChild(row);
    box.appendChild(label);
    if (state.drawn) {
      box.appendChild(el("p", "ag-drawn", state.drawn));
      box.appendChild(el("p", "ag-hint", t.drawn));
    }
    if (file.mode === "encrypt") {
      const short = el("p", "ag-hint ag-short", fill(t.short, { n: WORDS_SUGGESTED }));
      short.hidden = !isShort(state.passphrase);
      box.appendChild(short);
    }

    const actions = el("div", "ag-actions ag-row");
    const primary = button(state.working ? "" : (file.mode === "decrypt" ? t.decrypt : t.encrypt), "ag-primary", run);
    if (state.working) {
      // 轉圈用全站共用的那顆，樣式定義在 overrides/base.html。scrypt 在手機上要幾秒，
      // 按鈕沒有變化的話讀者會以為沒按到而重複按。
      const spin = el("span", "anoni-spinner");
      spin.setAttribute("aria-hidden", "true");
      primary.appendChild(spin);
      primary.appendChild(document.createTextNode(t.working));
      primary.setAttribute("aria-busy", "true");
    }
    primary.disabled = state.working || !state.passphrase;
    actions.appendChild(primary);
    const another = button(t.another, null, () => {
      releaseResult();
      state.file = null;
      state.passphrase = "";
      state.drawn = null;
      state.error = null;
      render();
    });
    another.disabled = state.working;
    actions.appendChild(another);
    box.appendChild(actions);

    if (state.error) {
      box.appendChild(el("p", "ag-error", fill(t.errors[state.error] || t.errors.broken, { limit: humanSize(MAX_BYTES) })));
    }
    if (state.result) {
      const result = el("div", "ag-result");
      result.appendChild(el("p", null, file.mode === "decrypt" ? t.decrypted : t.encrypted));
      result.appendChild(el("p", null, fill(t.sizeLine, { a: humanSize(file.size), b: humanSize(state.result.size) })));
      const link = el("a", "ag-dl", fill(t.download, { name: state.result.name }));
      link.href = state.result.url;
      link.download = state.result.name;
      result.appendChild(link);
      box.appendChild(result);
    }
    root.appendChild(box);
    root.appendChild(el("p", "ag-note", t.note));
  }

  // 少於建議詞數、又不夠長的密語。不擋，只提醒。
  function isShort(passphrase) {
    const words = passphrase.trim().split(/\s+/).filter(Boolean);
    return passphrase.length > 0 && words.length < WORDS_SUGGESTED && passphrase.length < 20;
  }

  render();
})();
