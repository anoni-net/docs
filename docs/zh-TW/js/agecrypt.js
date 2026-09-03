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
 * scrypt 不在主執行緒上算。2026-09-03 在 GrapheneOS 的 IronFox 上發現工具像當掉：
 * IronFox 預設關閉 JavaScript 的 JIT（Tor Browser 的「較安全」等級也關），純 JS 的 scrypt
 * 慢五十倍以上，桌機實測一次 2^18 從 0.9 秒變 50 秒，而 typage 內建的同步 scrypt 把主執行緒
 * 整段占住，轉圈不會動、點什麼都沒反應。noble 的 scryptAsync 也救不了，它只用 microtask
 * 讓步，畫面一樣進不來，headless Firefox 關 JIT 實測往返 48 秒。所以這裡照 typage 的
 * ScryptRecipient 與 ScryptIdentity 重做一份收件人與身分物件，格式一個位元組都不差，
 * 只把 scrypt 換成送進 agecrypt-worker.js 算，主執行緒只等訊息與進度。typage 允許自訂
 * 這兩種物件，vendor 不用動。worker 起不來就退回主執行緒的 scryptAsync，慢但能用。
 *
 * 第一次按下時先量一次 2^12 推算整趟要多久，超過二十秒就先把預估時間與原因顯示出來，
 * 讓讀者決定要不要等。決定要等的話省略解回比對那一趟，時間減半。快的環境維持比對。
 *
 * 貼進來的文字也能處理，密文可以輸出成 ASCII armor 的文字。這是 #425 討論的 A′：讀者把密文
 * 跟密語一起存進自己的密碼管理器，另一台裝置貼回來解開，跨裝置由他們信任的管理器負責，
 * 站上維持什麼都不存。age 命令列也直接認 armor，貼出去的文字存成檔案照樣能用 age -d 解。
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

  // worker 的網址從這一支自己的網址推，三個語系的 js/ 都是 symlink 指向同一份
  const scriptUrl = (document.currentScript && document.currentScript.src) || new URL("../../js/agecrypt.js", location.href).href;

  // --- 純邏輯（tools/test_agecrypt.mjs 從這裡原地抽出來測）---

  const AGE_HEADER = "age-encryption.org/v1";
  const AGE_ARMOR = "-----BEGIN AGE ENCRYPTED FILE-----";
  const AGE_ARMOR_END = "-----END AGE ENCRYPTED FILE-----";

  // 檔案要輸出成文字時的大小上限。armor 膨脹三分之一，密碼管理器的筆記欄位多半只收幾萬字。
  const ARMOR_MAX_BYTES = 64 * 1024;

  // 貼進來的文字當成檔案處理時的名字
  const TEXT_NAME = "note.txt";

  // 整份檔案在記憶體裡處理：讀進來、加密、再解回來比對，等於同時存三份。
  // 超過這個大小在手機上會直接失敗，先擋下來說清楚。
  const MAX_BYTES = 200 * 1024 * 1024;

  // age 命令列的預設值。2^18 在桌機約半秒，手機約兩到五秒。
  const SCRYPT_LOG2_N = 18;

  // 密語的詞數建議。六個詞是 77 bits，理由寫在 asian-diceware.md。
  const WORDS_SUGGESTED = 6;

  // scrypt 段落的規格，跟 typage 的 ScryptRecipient 與 ScryptIdentity 逐項對齊
  const SCRYPT_LABEL = "age-encryption.org/v1/scrypt";
  const SCRYPT_MAX_LOG2_N = 20;

  // 校準用的工作因數，成本是 2^18 的 1/64。有 JIT 十幾毫秒，沒有 JIT 接近一秒。
  const CALIBRATE_LOG2_N = 12;

  // 整趟預估超過這個毫秒數就先問過讀者。有 JIT 的手機兩趟加起來十秒內，碰不到。
  const SLOW_MS = 20000;

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

  // 開頭是 armor 的頭行就是文字形式的 age 檔
  function isArmored(bytes) {
    return asciiPrefix(bytes, AGE_ARMOR.length) === AGE_ARMOR;
  }

  // 貼進來的文字：開頭是 armor 就當 age 密文解，其餘原樣當明文加密
  function classifyText(text) {
    const trimmed = text.trim();
    if (trimmed.indexOf(AGE_ARMOR) === 0) {
      return { mode: "decrypt", bytes: new TextEncoder().encode(trimmed), armored: true };
    }
    return { mode: "encrypt", bytes: new TextEncoder().encode(text), armored: false };
  }

  // 解出來的東西能不能直接顯示成文字：UTF-8 解得開、沒有控制字元、不超過上限
  function decodeUtf8Text(bytes, maxBytes) {
    if (bytes.length > maxBytes) return null;
    let text;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch (err) {
      return null;
    }
    if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text)) return null;
    return text;
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

  // scrypt 的鹽是固定標籤接上段落裡那 16 位元組
  function scryptSalt(salt) {
    const label = new TextEncoder().encode(SCRYPT_LABEL);
    const out = new Uint8Array(label.length + salt.length);
    out.set(label);
    out.set(salt, label.length);
    return out;
  }

  // 量過一個小的工作因數，推算大的。scrypt 的時間跟 N 成正比。
  function estimateMs(sampleMs, sampleLog2N, targetLog2N) {
    return sampleMs * Math.pow(2, targetLog2N - sampleLog2N);
  }

  // 整趟要幾次 scrypt：加密一次，解回比對再一次，解密一次
  function plannedMs(perScryptMs, mode, verify) {
    return perScryptMs * (mode === "encrypt" && verify ? 2 : 1);
  }

  function scryptParams(logN, onProgress) {
    const params = { N: Math.pow(2, logN), r: 8, p: 1, dkLen: 32 };
    if (onProgress) params.onProgress = onProgress;
    return params;
  }

  // typage 的 Encrypter.addRecipient 接受自訂物件，這裡照它的 ScryptRecipient 重做一份，
  // 輸出的段落逐位元組相同，差別只在 scrypt 用非同步版本。deps 由介面從 vendor 載入後傳進來。
  function scryptRecipient(deps, passphrase, logN, onProgress) {
    return {
      async wrapFileKey(fileKey) {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const key = await deps.scryptAsync(passphrase, scryptSalt(salt), scryptParams(logN, onProgress));
        const body = deps.chacha20poly1305(key, new Uint8Array(12)).encrypt(fileKey);
        return [new deps.Stanza(["scrypt", deps.base64nopad.encode(salt), String(logN)], body)];
      },
    };
  }

  // 對應 Decrypter.addIdentity。檢查條件跟 typage 的 ScryptIdentity 一樣：scrypt 段落
  // 必須是唯一的段落，鹽 16 位元組，工作因數不超過上限，密語不對就回 null。
  function scryptIdentity(deps, passphrase, onProgress) {
    return {
      async unwrapFileKey(stanzas) {
        for (let i = 0; i < stanzas.length; i += 1) {
          const s = stanzas[i];
          if (s.args.length < 1 || s.args[0] !== "scrypt") continue;
          if (stanzas.length !== 1) throw new Error("scrypt recipient is not the only one in the header");
          if (s.args.length !== 3 || !/^[1-9][0-9]*$/.test(s.args[2])) throw new Error("invalid scrypt stanza");
          const salt = deps.base64nopad.decode(s.args[1]);
          if (salt.length !== 16) throw new Error("invalid scrypt stanza");
          const logN = Number(s.args[2]);
          if (logN > SCRYPT_MAX_LOG2_N) throw new Error("scrypt work factor is too high");
          if (s.body.length !== 32) throw new Error("invalid stanza");
          const key = await deps.scryptAsync(passphrase, scryptSalt(salt), scryptParams(logN, onProgress));
          try {
            return deps.chacha20poly1305(key, new Uint8Array(12)).decrypt(s.body);
          } catch (err) {
            return null;
          }
        }
        return null;
      },
    };
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
    #age-tool textarea.ag-paste, #age-tool textarea.ag-out {
      width: 100%; box-sizing: border-box; font-size: .74rem; line-height: 1.6;
      font-family: var(--md-code-font-family, monospace); padding: .5rem .6rem;
      border: .05rem solid var(--md-default-fg-color--lighter); border-radius: .1rem;
      background: var(--md-code-bg-color); color: inherit; resize: vertical;
    }
    #age-tool .ag-or { font-size: .74rem; margin: .8rem 0 .2rem; }
    #age-tool .ag-check { display: flex; gap: .4rem; align-items: flex-start; font-size: .74rem; margin: .6rem 0 0; cursor: pointer; }
    #age-tool .ag-check input { margin-top: .25rem; }
    #age-tool .ag-slow {
      border-left: .15rem solid #ef6c00; padding: .1rem 0 .1rem .6rem;
      margin: .8rem 0; font-size: .74rem; line-height: 1.7;
    }
    #age-tool .ag-progress { font-variant-numeric: tabular-nums; }
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
      pasteLabel: "或貼一段文字",
      pastePlaceholder: "貼明文就加密。貼 age 的文字密文（-----BEGIN AGE ENCRYPTED FILE----- 開頭）就解密。",
      useText: "用這段文字",
      textEncryptMode: "要加密：貼進來的文字（{size}）",
      textDecryptMode: "貼進來的是 age 文字密文，要解密（{size}）",
      armorOut: "輸出成文字，方便貼進密碼管理器的筆記。大小會多三分之一。",
      outputText: "輸出",
      copy: "複製",
      copied: "已複製",
      crossDevice: "把密文與密語一起存進你的密碼管理器，另一台裝置打開這一頁貼回來就能解開。密文由你信任的管理器同步，站上什麼都不存。",
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
      encryptedNoVerify: "加密完成。這個環境慢，省略了解回比對那一趟。",
      decrypted: "解開了。",
      slow: "這個瀏覽器算 scrypt 很慢，預估要 {time}。多半是關掉了 JavaScript 的 JIT：IronFox 預設關閉，可在設定的 Security 開啟。Tor Browser 的「較安全」等級也會關。繼續的話加密會省略解回比對那一趟，期間頁面照常能操作。",
      slowGo: "還是繼續，約 {time}",
      progress: "scrypt 第 {pass}/{passes} 趟，{percent}%",
      seconds: "{n} 秒",
      minutes: "{n} 分鐘",
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
      pasteLabel: "或贴一段文字",
      pastePlaceholder: "贴明文就加密。贴 age 的文字密文（-----BEGIN AGE ENCRYPTED FILE----- 开头）就解密。",
      useText: "用这段文字",
      textEncryptMode: "要加密：贴进来的文字（{size}）",
      textDecryptMode: "贴进来的是 age 文字密文，要解密（{size}）",
      armorOut: "输出成文字，方便贴进密码管理器的笔记。大小会多三分之一。",
      outputText: "输出",
      copy: "复制",
      copied: "已复制",
      crossDevice: "把密文与密语一起存进你的密码管理器，另一台设备打开这一页贴回来就能解开。密文由你信任的管理器同步，站上什么都不存。",
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
      encryptedNoVerify: "加密完成。这个环境慢，省略了解回比对那一趟。",
      decrypted: "解开了。",
      slow: "这个浏览器算 scrypt 很慢，预估要 {time}。多半是关掉了 JavaScript 的 JIT：IronFox 默认关闭，可在设置的 Security 开启。Tor Browser 的「较安全」等级也会关。继续的话加密会省略解回比对那一趟，期间页面照常能操作。",
      slowGo: "还是继续，约 {time}",
      progress: "scrypt 第 {pass}/{passes} 趟，{percent}%",
      seconds: "{n} 秒",
      minutes: "{n} 分钟",
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
      pasteLabel: "Or paste some text",
      pastePlaceholder: "Paste plain text to encrypt it. Paste an age text file (starting with -----BEGIN AGE ENCRYPTED FILE-----) to decrypt it.",
      useText: "Use this text",
      textEncryptMode: "To encrypt: pasted text ({size})",
      textDecryptMode: "The pasted text is an age file, to decrypt ({size})",
      armorOut: "Output as text, easy to paste into a password manager note. About a third larger.",
      outputText: "Output",
      copy: "Copy",
      copied: "Copied",
      crossDevice: "Store the ciphertext and the passphrase together in your password manager. Open this page on another device, paste it back, and decrypt. Your manager does the syncing. This site stores nothing.",
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
      encryptedNoVerify: "Encrypted. This environment is slow, so the decrypt-and-compare pass was skipped.",
      decrypted: "Decrypted.",
      slow: "scrypt is slow in this browser: about {time} expected. Usually the JavaScript JIT is off. IronFox turns it off by default (Settings, Security), and Tor Browser's Safer level does too. If you go on, encryption skips the decrypt-and-compare pass. The page stays usable meanwhile.",
      slowGo: "Go on anyway, about {time}",
      progress: "scrypt pass {pass}/{passes}, {percent}%",
      seconds: "{n} s",
      minutes: "{n} min",
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
    file: null,      // { name, size, bytes, mode, source: "file" | "text", armored }
    passphrase: "",
    show: false,
    working: false,
    armorOut: false, // 檔案輸入時勾「輸出成文字」
    result: null,    // { url, name, size, verified, text, armored }
    error: null,
    drawn: null,
    words: null,     // null 還沒抓、false 抓失敗、陣列抓到了
    drawing: false,
    perScryptMs: null,   // 校準結果：一次 2^18 預估幾毫秒，整頁只量一次
    slow: null,          // 等讀者決定時放預估毫秒數，其餘時候 null
    slowAccepted: false, // 讀者答應等過一次，之後不再問，也不再解回比對
  };

  function humanTime(ms) {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 90) return fill(t.seconds, { n: seconds });
    return fill(t.minutes, { n: Math.ceil(seconds / 60) });
  }

  function releaseResult() {
    if (state.result && state.result.url) URL.revokeObjectURL(state.result.url);
    state.result = null;
  }

  // typage 與它相依的 noble、scure 經由頁面的 import map 載入，路徑在 vendor/age/ 底下。
  // scrypt 收件人自己組，所以除了入口還要拿非同步 scrypt、ChaCha20-Poly1305 與 base64。
  let libPromise = null;
  function lib() {
    if (!libPromise) {
      libPromise = Promise.all([
        import("age-encryption"),
        import("@noble/hashes/scrypt.js"),
        import("@noble/ciphers/chacha.js"),
        import("@scure/base"),
      ]).then(([age, scryptMod, chachaMod, baseMod]) => ({
        age: age,
        deps: {
          Stanza: age.Stanza,
          scryptAsync: makeScrypt(scryptMod.scryptAsync),
          chacha20poly1305: chachaMod.chacha20poly1305,
          base64nopad: baseMod.base64nopad,
        },
      })).catch((err) => {
        libPromise = null;
        throw err;
      });
    }
    return libPromise;
  }

  // scrypt 送進 worker 算，主執行緒只等訊息，轉圈與進度才畫得出來。worker 起不來
  // （舊瀏覽器、被擋）就退回主執行緒的 scryptAsync，慢但至少能用。
  let worker = null;
  let workerBroken = false;
  let workerSeq = 0;
  const workerJobs = new Map();

  function failWorkerJobs() {
    workerJobs.forEach((job) => job.reject(new Error("worker")));
    workerJobs.clear();
    worker = null;
    workerBroken = true;
  }

  function workerScrypt(passphrase, salt, params) {
    return new Promise((resolve, reject) => {
      if (!worker) {
        try {
          worker = new Worker(new URL("agecrypt-worker.js", scriptUrl), { type: "module" });
        } catch (err) {
          workerBroken = true;
          reject(new Error("worker"));
          return;
        }
        worker.addEventListener("message", (event) => {
          const job = workerJobs.get(event.data.id);
          if (!job) return;
          if (event.data.progress !== undefined) {
            if (job.onProgress) job.onProgress(event.data.progress);
            return;
          }
          workerJobs.delete(event.data.id);
          if (event.data.error) job.reject(new Error(event.data.error));
          else job.resolve(event.data.key);
        });
        worker.addEventListener("error", failWorkerJobs);
      }
      const id = ++workerSeq;
      workerJobs.set(id, { resolve: resolve, reject: reject, onProgress: params.onProgress });
      worker.postMessage({ id: id, passphrase: passphrase, salt: salt, N: params.N, r: params.r, p: params.p, dkLen: params.dkLen });
    });
  }

  // 收件人與身分物件拿到的 scryptAsync 就是這一個：先試 worker，不行才在主執行緒算
  function makeScrypt(scryptAsync) {
    return (passphrase, salt, params) => {
      if (workerBroken || typeof Worker === "undefined") return scryptAsync(passphrase, salt, params);
      return workerScrypt(passphrase, salt, params).catch((err) => {
        if (err && err.message === "worker") return scryptAsync(passphrase, salt, params);
        throw err;
      });
    };
  }

  // 第一次按下時量一次 2^12 推算 2^18。JIT 關掉的瀏覽器在這一步就看得出來，
  // 不必讓讀者卡五十秒才知道。
  async function calibrate(deps) {
    if (state.perScryptMs === null) {
      const t0 = performance.now();
      await deps.scryptAsync("calibrate", scryptSalt(new Uint8Array(16)), scryptParams(CALIBRATE_LOG2_N, null));
      state.perScryptMs = estimateMs(performance.now() - t0, CALIBRATE_LOG2_N, SCRYPT_LOG2_N);
    }
    return state.perScryptMs;
  }

  // noble 每千分之一就回報一次，只在百分比變了才動 DOM
  function reportProgress(pass, passes) {
    let shown = -1;
    return (ratio) => {
      const percent = Math.floor(ratio * 100);
      if (percent === shown) return;
      shown = percent;
      const node = root.querySelector(".ag-progress");
      if (node) node.textContent = fill(t.progress, { pass: pass, passes: passes, percent: percent });
    };
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
      source: "file", armored: isArmored(bytes),
    };
    render();
  }

  function loadText(text) {
    if (!text || !text.trim()) return;
    releaseResult();
    state.error = null;
    state.drawn = null;
    const parsed = classifyText(text);
    if (parsed.bytes.length > MAX_BYTES) {
      state.file = null;
      state.error = "tooLarge";
      render();
      return;
    }
    state.file = {
      name: TEXT_NAME, size: parsed.bytes.length, bytes: parsed.bytes,
      mode: parsed.mode, source: "text", armored: parsed.armored,
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
    let loaded;
    try {
      loaded = await lib();
    } catch (err) {
      state.working = false;
      state.error = "libMissing";
      render();
      return;
    }
    const age = loaded.age;
    const deps = loaded.deps;
    const passphrase = state.passphrase;
    const mode = state.file.mode;
    const perScrypt = await calibrate(deps);
    // 慢的環境先問過再開始。答應過一次就不再問，並省略解回比對那一趟。
    if (!state.slowAccepted && plannedMs(perScrypt, mode, true) > SLOW_MS) {
      state.working = false;
      state.slow = plannedMs(perScrypt, mode, false);
      render();
      return;
    }
    const verify = mode === "encrypt" && !state.slowAccepted;
    const passes = verify ? 2 : 1;
    // 文字輸入的輸出一律是文字，檔案輸入看讀者有沒有勾
    const wantArmor = mode === "encrypt" && (state.file.source === "text" || state.armorOut);
    try {
      let output;
      let resultText = null;
      if (mode === "encrypt") {
        const encrypter = new age.Encrypter();
        encrypter.addRecipient(scryptRecipient(deps, passphrase, SCRYPT_LOG2_N, reportProgress(1, passes)));
        output = await encrypter.encrypt(state.file.bytes);
        if (verify) {
          // 交出去之前自己解回來比對。比對的是雜湊，兩份一起留在記憶體裡太占。
          const decrypter = new age.Decrypter();
          decrypter.addIdentity(scryptIdentity(deps, passphrase, reportProgress(2, passes)));
          const back = await decrypter.decrypt(output, "uint8array");
          if (!sameBytes(await sha256(back), await sha256(state.file.bytes))) {
            throw new Error("verify");
          }
        }
        if (wantArmor) {
          resultText = age.armor.encode(output);
          output = new TextEncoder().encode(resultText);
        }
      } else {
        // armor 的文字形式先解回位元組，typage 的 Decrypter 只認位元組
        let input = state.file.bytes;
        if (state.file.armored) {
          try {
            input = age.armor.decode(new TextDecoder().decode(input));
          } catch (err) {
            throw new Error("broken");
          }
        }
        const decrypter = new age.Decrypter();
        decrypter.addIdentity(scryptIdentity(deps, passphrase, reportProgress(1, 1)));
        try {
          output = await decrypter.decrypt(input, "uint8array");
        } catch (err) {
          throw new Error(/passphrase|identit|scrypt|MAC|no recipient|incorrect/i.test(String(err && err.message)) ? "wrongPassphrase" : "broken");
        }
        // 貼進來的密文解出來若是文字就直接顯示，檔案解出來只給下載
        if (state.file.source === "text") resultText = decodeUtf8Text(output, ARMOR_MAX_BYTES);
      }
      const blob = new Blob([output], { type: resultText !== null ? "text/plain;charset=utf-8" : "application/octet-stream" });
      let name = outputName(state.file.name, mode);
      if (state.file.source === "text") name = mode === "encrypt" ? TEXT_NAME + ".age" : TEXT_NAME;
      state.result = {
        url: URL.createObjectURL(blob),
        name: name,
        size: blob.size,
        verified: verify,
        text: resultText,
        armored: wantArmor,
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

    const orLabel = el("label", "ag-or", t.pasteLabel);
    const paste = document.createElement("textarea");
    paste.className = "ag-paste";
    paste.rows = 4;
    paste.placeholder = t.pastePlaceholder;
    paste.spellcheck = false;
    paste.setAttribute("autocomplete", "off");
    orLabel.appendChild(paste);
    root.appendChild(orLabel);
    const useRow = el("div", "ag-row");
    useRow.appendChild(button(t.useText, null, () => loadText(paste.value)));
    root.appendChild(useRow);
  }

  // 複製到剪貼簿，按鈕文字短暫改成「已複製」。沒有 clipboard API 的環境就全選讓讀者自己複製。
  function copyButton(getText, textarea) {
    const node = button(t.copy, null, () => {
      const done = () => {
        node.textContent = t.copied;
        setTimeout(() => { node.textContent = t.copy; }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(getText()).then(done, () => textarea.select());
      } else {
        textarea.select();
      }
    });
    return node;
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
    let nameText = fill(file.mode === "decrypt" ? t.decryptMode : t.encryptMode, { name: file.name, size: humanSize(file.size) });
    if (file.source === "text") nameText = fill(file.mode === "decrypt" ? t.textDecryptMode : t.textEncryptMode, { size: humanSize(file.size) });
    box.appendChild(el("p", "ag-name", nameText));

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
      if (event.key === "Enter" && state.slow === null) run();
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
    if (file.mode === "encrypt" && file.source === "file" && file.size <= ARMOR_MAX_BYTES) {
      const check = el("label", "ag-check");
      const box2 = document.createElement("input");
      box2.type = "checkbox";
      box2.checked = state.armorOut;
      box2.disabled = state.working;
      box2.addEventListener("change", () => { state.armorOut = box2.checked; });
      check.appendChild(box2);
      check.appendChild(document.createTextNode(t.armorOut));
      box.appendChild(check);
    }

    if (state.slow !== null) {
      box.appendChild(el("p", "ag-slow", fill(t.slow, { time: humanTime(state.slow) })));
    }

    const actions = el("div", "ag-actions ag-row");
    let primaryLabel = file.mode === "decrypt" ? t.decrypt : t.encrypt;
    if (state.slow !== null) primaryLabel = fill(t.slowGo, { time: humanTime(state.slow) });
    const primary = button(state.working ? "" : primaryLabel, "ag-primary", () => {
      if (state.slow !== null) {
        state.slowAccepted = true;
        state.slow = null;
      }
      run();
    });
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
      state.slow = null;
      state.armorOut = false;
      render();
    });
    another.disabled = state.working;
    actions.appendChild(another);
    box.appendChild(actions);
    if (state.working) {
      box.appendChild(el("p", "ag-progress ag-hint", ""));
    }

    if (state.error) {
      box.appendChild(el("p", "ag-error", fill(t.errors[state.error] || t.errors.broken, { limit: humanSize(MAX_BYTES) })));
    }
    if (state.result) {
      const result = el("div", "ag-result");
      result.appendChild(el("p", null, file.mode === "decrypt" ? t.decrypted : (state.result.verified ? t.encrypted : t.encryptedNoVerify)));
      result.appendChild(el("p", null, fill(t.sizeLine, { a: humanSize(file.size), b: humanSize(state.result.size) })));
      if (state.result.text !== null) {
        const outLabel = el("label", "ag-label", t.outputText);
        const out = document.createElement("textarea");
        out.className = "ag-out";
        out.rows = Math.min(12, Math.max(3, state.result.text.split("\n").length));
        out.readOnly = true;
        out.spellcheck = false;
        out.value = state.result.text;
        outLabel.appendChild(out);
        result.appendChild(outLabel);
        const tools = el("div", "ag-row");
        tools.appendChild(copyButton(() => state.result.text, out));
        const link = el("a", "ag-dl", fill(t.download, { name: state.result.name }));
        link.href = state.result.url;
        link.download = state.result.name;
        tools.appendChild(link);
        result.appendChild(tools);
        if (state.result.armored) result.appendChild(el("p", "ag-hint", t.crossDevice));
      } else {
        const link = el("a", "ag-dl", fill(t.download, { name: state.result.name }));
        link.href = state.result.url;
        link.download = state.result.name;
        result.appendChild(link);
      }
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
