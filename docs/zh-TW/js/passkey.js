/*
 * passkey 鑰匙（utils/passkey.md），以及給其他小工具共用的 passkey 介面（window.anoniPasskey）。
 *
 * === 這是什麼 ===
 *
 * 讓讀者建立一把 anoni.net 的 passkey，存進自己的密碼管理器或鑰匙圈，之後站上要保護資料時
 * 就請這把 passkey 算出金鑰。沒有帳號、沒有伺服器、沒有任何識別碼離開裝置：passkey 本身
 * 就是身分，我們手上什麼都沒有，連讀者有沒有建過都不知道（瀏覽器基於隱私不讓網頁查）。
 *
 * === 為什麼是金鑰派生而非門禁 ===
 *
 * 靜態站沒有伺服器能檢查「這個人通過了驗證」，寫在 JavaScript 裡的「驗證通過才顯示」誰都
 * 繞得過。這裡用的是 WebAuthn 的 PRF 擴充：passkey 內部多藏一把秘密，讀者通過指紋或 PIN
 * 之後，驗證器對我們給的輸入算 HMAC，回傳固定的 32 位元組。同一把 passkey 配同一段輸入永遠
 * 得到同一段輸出，於是可以拿來包 age 的 file key。沒有 passkey 就算不出金鑰，資料就是密文。
 * 這一段在 typage 的 webauthn 模組裡，vendor/age/ 原封不動，這一支只負責介面與流程。
 *
 * === 幾個決定 ===
 *
 * RP ID 明確指定 anoni.net。passkey 綁在 RP ID 上，將來搬到子網域不會斷，鏡像站與 onion
 * 用不了，Tor Browser 整個關閉 WebAuthn，頁面上直說。
 *
 * 備援金鑰是必要的一步。passkey 丟了、換到不支援 PRF 的環境、密碼管理員的帳號沒了，
 * 資料就永遠打不開。所以建立流程的最後一步是產生一把 X25519 備援身分，只顯示一次，
 * 請讀者存進密碼管理器、放在跟密文不同的地方。本機檔案加密的 passkey 模式強制要有它。
 *
 * 只做 passkey（可被同步、可被列出的憑證），不做 USB 安全金鑰的非 discoverable 模式，
 * 那需要讀者保管識別字串才能解，是另一種工具。
 *
 * 三個語系共用這一份，docs/en/js/ 與 docs/zh-CN/js/ 底下是指向這裡的 symlink。
 * 純邏輯由 tools/test_passkey.mjs 原地抽出來測，那支另外用替身的 navigator.credentials
 * 把 typage 的 webauthn 模組整個跑起來，對照獨立實作的 PRF 段落數學。
 */
(function () {
  "use strict";

  // --- 純邏輯（tools/test_passkey.mjs 從這裡原地抽出來測）---

  // RP ID：正式站與它的子網域都用 anoni.net，其他主機名（本機測試、鏡像）用自己的
  const SITE_RP_ID = "anoni.net";
  function rpIdFor(hostname) {
    const host = String(hostname || "").toLowerCase();
    if (host === SITE_RP_ID || host.slice(-(SITE_RP_ID.length + 1)) === "." + SITE_RP_ID) return SITE_RP_ID;
    return host;
  }

  // age 的 X25519 公鑰是 age1 加 58 個 bech32 字元，私鑰是大寫的 AGE-SECRET-KEY-1 加 58 個。
  // 只檢查形狀，checksum 交給 typage 在真正使用時驗。
  const BECH32_LOWER = "[qpzry9x8gf2tvdw0s3jn54khce6mua7l]";
  const BECH32_UPPER = "[QPZRY9X8GF2TVDW0S3JN54KHCE6MUA7L]";
  function looksLikeRecipient(text) {
    return new RegExp("^age1" + BECH32_LOWER + "{58}$").test(String(text || "").trim());
  }
  function looksLikeIdentity(text) {
    return new RegExp("^AGE-SECRET-KEY-1" + BECH32_UPPER + "{58}$").test(String(text || "").trim());
  }
  // typage 給 passkey 的識別字串，對 passkey 只是選憑證時的提示
  function looksLikePasskeyIdentity(text) {
    return new RegExp("^AGE-PLUGIN-FIDO2PRF-1" + BECH32_UPPER + "+$").test(String(text || "").trim());
  }

  // 能力判讀。caps 是 PublicKeyCredential.getClientCapabilities() 的結果，舊瀏覽器沒有這個 API，
  // 那就只能等真正建立時才知道 PRF 能不能用，回 null。
  function prfSupport(hasWebAuthn, caps) {
    if (!hasWebAuthn) return { webauthn: false, prf: false };
    if (caps && typeof caps === "object" && "extension:prf" in caps) {
      return { webauthn: true, prf: !!caps["extension:prf"] };
    }
    return { webauthn: true, prf: null };
  }

  // 錯誤分類：讀者取消、PRF 不可用、環境不支援、其他
  function classifyError(err) {
    const name = err && err.name;
    const message = String((err && err.message) || "");
    if (name === "NotAllowedError" || name === "AbortError") return "cancelled";
    if (/PRF/i.test(message)) return "noPrf";
    if (name === "NotSupportedError" || name === "SecurityError") return "unsupported";
    return "failed";
  }

  // 建立時給密碼管理器看的名字。帶日期，建過兩把才分得出哪一把是哪一把。
  function keyName(date) {
    return SITE_RP_ID + " " + date.toISOString().slice(0, 10);
  }

  // --- 介面 ---

  const rpId = rpIdFor(location.hostname);

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

  async function support() {
    const has = typeof PublicKeyCredential !== "undefined" && !!(navigator.credentials && navigator.credentials.create);
    let caps = null;
    if (has && typeof PublicKeyCredential.getClientCapabilities === "function") {
      try {
        caps = await PublicKeyCredential.getClientCapabilities();
      } catch (err) {
        caps = null;
      }
    }
    return prfSupport(has, caps);
  }

  // 建立一把 passkey。建立的動作在 vault.js，那一支把 32 位元組金鑰放進 user.id、同時
  // 要求 PRF，所以從這裡建的鑰匙兩邊都能用：檔案加密走 PRF，暫存區走 user.id。這一頁
  // 只建鑰匙，不寫任何東西進裝置，維持頁面上「站上什麼都不存」那句承諾。
  //
  // 回的是 { hasPrf }。原本回 typage 的識別字串，那串對 passkey 只是選憑證時的提示，
  // 頁面上標著選用，拿掉不影響任何流程；貼上外來識別字串那條路照舊。
  async function create() {
    if (!window.anoniVault || typeof window.anoniVault.createKey !== "function") {
      throw new Error("vault.js not loaded");
    }
    return window.anoniVault.createKey();
  }

  // 做一次 PRF 解鎖：拿一把隨機的 file key 包一次，包得起來就代表這把 passkey 的 PRF 可用
  async function testUnlock(identity) {
    const age = await lib();
    const recipient = new age.webauthn.WebAuthnRecipient(identity ? { identity: identity } : { rpId: rpId });
    await recipient.wrapFileKey(crypto.getRandomValues(new Uint8Array(16)));
    return true;
  }

  // X25519 備援身分：私鑰只顯示一次，公鑰是加密時要一起加的收件人
  async function backupKey() {
    const age = await lib();
    const secret = await age.generateIdentity();
    const recipient = await age.identityToRecipient(secret);
    return { secret: secret, recipient: recipient };
  }

  // 給本機檔案加密用的收件人與身分物件
  async function recipient(identity) {
    const age = await lib();
    return new age.webauthn.WebAuthnRecipient(identity ? { identity: identity } : { rpId: rpId });
  }
  async function identity(identityString) {
    const age = await lib();
    return new age.webauthn.WebAuthnIdentity(identityString ? { identity: identityString } : { rpId: rpId });
  }

  window.anoniPasskey = {
    rpId: rpId,
    support: support,
    create: create,
    testUnlock: testUnlock,
    backupKey: backupKey,
    recipient: recipient,
    identity: identity,
    looksLikeRecipient: looksLikeRecipient,
    looksLikeIdentity: looksLikeIdentity,
    looksLikePasskeyIdentity: looksLikePasskeyIdentity,
    classifyError: classifyError,
  };

  // 底下是 utils/passkey.md 那一頁的介面。其他頁面只用上面的 API，沒有這個容器就到此為止。
  const root = document.getElementById("passkey-tool");
  if (!root) return;

  const CSS = `
    #passkey-tool { margin: 1em 0; font-size: .74rem; line-height: 1.7; }
    #passkey-tool .pk-status { border-left: .15rem solid var(--md-primary-fg-color); padding: .1rem 0 .1rem .6rem; margin: 0 0 .8rem; }
    #passkey-tool .pk-status--bad { border-left-color: #c62828; }
    #passkey-tool .pk-step { border: .05rem solid var(--md-default-fg-color--lighter); border-radius: .2rem; padding: .8rem; margin: .8rem 0 0; }
    #passkey-tool .pk-step--done { border-left: .15rem solid #2e7d32; }
    #passkey-tool .pk-title { font-weight: 600; margin: 0 0 .3rem; }
    #passkey-tool .pk-row { display: flex; flex-wrap: wrap; gap: .4rem; align-items: center; margin: .5rem 0 0; }
    #passkey-tool button {
      font: inherit; font-size: .74rem; color: inherit; cursor: pointer; background: none;
      border: .05rem solid var(--md-default-fg-color--lighter); border-radius: .1rem; padding: .3rem .7rem;
    }
    #passkey-tool button:hover:not(:disabled):not(.pk-primary) { border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color); }
    #passkey-tool .pk-primary { background: var(--md-primary-fg-color); color: var(--md-primary-bg-color); border-color: var(--md-primary-fg-color); }
    #passkey-tool .pk-primary:hover:not(:disabled) { filter: brightness(1.1); }
    #passkey-tool button:disabled { opacity: .5; cursor: default; }
    #passkey-tool .pk-code {
      font-family: var(--md-code-font-family, monospace); font-size: .72rem; background: var(--md-code-bg-color);
      padding: .5rem .7rem; border-radius: .1rem; margin: .4rem 0 0; user-select: all; word-break: break-all;
    }
    #passkey-tool .pk-secret { border-left: .15rem solid #ef6c00; }
    #passkey-tool .pk-hint { opacity: .75; font-size: .7rem; margin: .3rem 0 0; }
    #passkey-tool .pk-error { border-left: .15rem solid #c62828; padding: .1rem 0 .1rem .6rem; margin: .6rem 0 0; }
    @media (pointer: coarse) { #passkey-tool button { min-height: 2.2rem; } }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const STRINGS = {
    "zh-TW": {
      checking: "正在確認這個瀏覽器支不支援。",
      supported: "這個瀏覽器可以用。它建得出 passkey，也算得出加密金鑰。",
      maybe: "這個瀏覽器建得出 passkey。能不能拿它算出加密金鑰，要等你真的建一把才知道。",
      noWebAuthn: "這個瀏覽器用不了 passkey。Tor Browser 把這個功能整個關掉了，Firefox Android 也還不支援。",
      noPrf: "這個瀏覽器建得出 passkey，可是算不出加密金鑰。這裡要的能力比登入多一項，哪些保管方式做得到見下面的「存到哪裡」。",
      step1: "1. 建立一把 passkey",
      step1Body: "按下去之後瀏覽器會問你要存到哪裡。存到 iCloud 鑰匙圈、Google 密碼管理員、Bitwarden、1Password 這類會同步的地方，其他裝置才能用同一把。只存在這台裝置上的話，資料也只在這一台解得開。",
      create: "建立 passkey",
      createdBoth: "建好了。這一把同時能給本機檔案加密與加密暫存區用，密碼管理器裡只需要這一筆。",
      createdVaultOnly: "建好了。這個環境算不出檔案加密要用的金鑰，這一把只給加密暫存區用。兩種都想要的話，換到電腦上再建一把。",
      creating: "等你在瀏覽器的提示裡完成",
      step2: "2. 試一次解鎖",
      step2Body: "請 passkey 算一次金鑰，確認指紋或 PIN 的流程順暢。換到另一台同步過的裝置也可以來這裡按一下，確認那邊能用。",
      test: "試解鎖",
      testing: "等你在瀏覽器的提示裡完成",
      tested: "解鎖成功，PRF 可用。",
      step3: "3. 產生備援金鑰",
      step3Body: "passkey 丟了、密碼管理員的帳號沒了、換到不支援 PRF 的環境，資料就永遠打不開。備援金鑰是另一條路：本機檔案加密會把檔案同時加密給 passkey 與這把金鑰。",
      backup: "產生備援金鑰",
      backupSecret: "私鑰，只顯示這一次。存進密碼管理器，放在跟密文不同的地方。",
      backupRecipient: "公鑰。加密時貼進「備援金鑰」欄位，可以公開。",
      copy: "複製",
      copied: "已複製",
      next: "接下來到本機檔案加密，選「passkey」模式。",
      errors: {
        cancelled: "你取消了，或瀏覽器沒有完成。再按一次即可。",
        noPrf: "這把 passkey 算不出加密金鑰。它在別的網站登入沒問題，這裡要的能力多一項。換一個保管方式再建一次，見下面的「存到哪裡」。",
        unsupported: "這個環境不允許建立 passkey。網址開頭要是 https 的正式站，而且瀏覽器沒有把這個功能關掉。",
        failed: "沒有成功。換一個瀏覽器或密碼管理員再試。",
        libMissing: "程式還沒載入。第一次使用需要連上網，之後會留在裝置上。",
      },
      note: "站上不會存任何跟這把 passkey 有關的東西，也查不出你有沒有建過。每一次算金鑰都要你用指紋或 PIN 同意。",
    },
    zh: {
      checking: "正在确认这个浏览器支不支持。",
      supported: "这个浏览器可以用。它创建得出 passkey，也算得出加密密钥。",
      maybe: "这个浏览器创建得出 passkey。能不能拿它算出加密密钥，要等你真的创建一把才知道。",
      noWebAuthn: "这个浏览器用不了 passkey。Tor Browser 把这个功能整个关掉了，Firefox Android 也还不支持。",
      noPrf: "这个浏览器创建得出 passkey，可是算不出加密密钥。这里要的能力比登录多一项，哪些保管方式做得到见下面的「存到哪里」。",
      step1: "1. 创建一把 passkey",
      step1Body: "按下去之后浏览器会问你要存到哪里。存到 iCloud 钥匙串、Google 密码管理器、Bitwarden、1Password 这类会同步的地方，其他设备才能用同一把。只存在这台设备上的话，数据也只在这一台解得开。",
      create: "创建 passkey",
      createdBoth: "创建好了。这一把同时能给本机文件加密与加密暂存区用，密码管理器里只需要这一笔。",
      createdVaultOnly: "创建好了。这个环境算不出文件加密要用的密钥，这一把只给加密暂存区用。两种都想要的话，换到电脑上再创建一把。",
      creating: "等你在浏览器的提示里完成",
      step2: "2. 试一次解锁",
      step2Body: "请 passkey 算一次密钥，确认指纹或 PIN 的流程顺畅。换到另一台同步过的设备也可以来这里按一下，确认那边能用。",
      test: "试解锁",
      testing: "等你在浏览器的提示里完成",
      tested: "解锁成功，PRF 可用。",
      step3: "3. 生成备援密钥",
      step3Body: "passkey 丢了、密码管理器的账号没了、换到不支持 PRF 的环境，数据就永远打不开。备援密钥是另一条路：本机文件加密会把文件同时加密给 passkey 与这把密钥。",
      backup: "生成备援密钥",
      backupSecret: "私钥，只显示这一次。存进密码管理器，放在跟密文不同的地方。",
      backupRecipient: "公钥。加密时贴进「备援密钥」栏位，可以公开。",
      copy: "复制",
      copied: "已复制",
      next: "接下来到本机文件加密，选「passkey」模式。",
      errors: {
        cancelled: "你取消了，或浏览器没有完成。再按一次即可。",
        noPrf: "这把 passkey 算不出加密密钥。它在别的网站登录没问题，这里要的能力多一项。换一个保管方式再创建一次，见下面的「存到哪里」。",
        unsupported: "这个环境不允许创建 passkey。网址开头要是 https 的正式站，而且浏览器没有把这个功能关掉。",
        failed: "没有成功。换一个浏览器或密码管理器再试。",
        libMissing: "程序还没加载。第一次使用需要联网，之后会留在设备上。",
      },
      note: "站上不会存任何跟这把 passkey 有关的东西，也查不出你有没有建过。每一次算密钥都要你用指纹或 PIN 同意。",
    },
    en: {
      checking: "Checking whether this browser supports it.",
      supported: "This browser works. It can create a passkey and derive an encryption key from it.",
      maybe: "This browser can create a passkey. Whether it can derive an encryption key only becomes clear once you create one.",
      noWebAuthn: "This browser cannot use passkeys. Tor Browser turns the feature off entirely, and Firefox on Android does not support it yet.",
      noPrf: "This browser can create a passkey but cannot derive an encryption key from it. What this page needs goes one step beyond signing in. See \"Where to store it\" below for the options that can do it.",
      step1: "1. Create a passkey",
      step1Body: "The browser will ask where to store it. Choose something that syncs (iCloud Keychain, Google Password Manager, Bitwarden, 1Password) so your other devices can use the same passkey. If it stays on this device only, the data can only be opened here.",
      create: "Create a passkey",
      createdBoth: "Created. This one works for both local file encryption and the encrypted stash, so your password manager only needs this single entry.",
      createdVaultOnly: "Created. This environment cannot derive the key that file encryption needs, so this one only works for the encrypted stash. To have both, create another one on a computer.",
      creating: "Finish in the browser prompt",
      step2: "2. Test an unlock",
      step2Body: "Ask the passkey to derive a key once and check that the fingerprint or PIN flow works. On another synced device, come back here and press it to confirm it works there too.",
      test: "Test unlock",
      testing: "Finish in the browser prompt",
      tested: "Unlocked. PRF works.",
      step3: "3. Generate a backup key",
      step3Body: "If the passkey is lost, the password manager account is gone, or you move to an environment without PRF, the data is gone forever. The backup key is the other way in: local file encryption encrypts to both the passkey and this key.",
      backup: "Generate a backup key",
      backupSecret: "Secret key, shown only once. Store it in your password manager, apart from the ciphertexts.",
      backupRecipient: "Public key. Paste it into the “Backup key” field when encrypting. Safe to share.",
      copy: "Copy",
      copied: "Copied",
      next: "Next, go to local file encryption and choose the “passkey” mode.",
      errors: {
        cancelled: "You cancelled, or the browser did not finish. Press again.",
        noPrf: "This passkey cannot derive an encryption key. It signs you in to other sites fine; this page needs one step more. Create another one somewhere else, see \"Where to store it\" below.",
        unsupported: "This environment does not allow creating a passkey. It needs the production site, at an https address, and a browser that has not turned the feature off.",
        failed: "It did not work. Try another browser or password manager.",
        libMissing: "The code has not loaded. The first use needs a connection; after that it stays on the device.",
      },
      note: "This site stores nothing about the passkey and cannot tell whether you created one. Every key derivation needs your fingerprint or PIN.",
    },
  };
  const t = STRINGS[document.documentElement.lang] || STRINGS["zh-TW"];

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function button(label, className, onClick) {
    const node = el("button", className, label);
    node.type = "button";
    node.addEventListener("click", onClick);
    return node;
  }
  function busyButton(label) {
    const node = button("", "pk-primary", () => {});
    const spin = el("span", "anoni-spinner");
    spin.setAttribute("aria-hidden", "true");
    node.appendChild(spin);
    node.appendChild(document.createTextNode(label));
    node.setAttribute("aria-busy", "true");
    node.disabled = true;
    return node;
  }
  function copyButton(getText) {
    const node = button(t.copy, null, () => {
      const done = () => {
        node.textContent = t.copied;
        setTimeout(() => { node.textContent = t.copy; }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(getText()).then(done, () => {});
    });
    return node;
  }

  const state = {
    support: null,     // null 還在查
    creating: false,
    testing: false,
    tested: false,
    generating: false,
    backup: null,      // { secret, recipient }
    error: null,       // { step, code }
  };

  async function guarded(step, flag, action) {
    state.error = null;
    state[flag] = true;
    render();
    try {
      await action();
    } catch (err) {
      const code = err && err.message === "lib" ? "libMissing" : classifyError(err);
      state.error = { step: step, code: code };
    }
    state[flag] = false;
    render();
  }

  function render() {
    root.textContent = "";
    const s = state.support;
    let statusText = t.checking;
    let bad = false;
    if (s) {
      if (!s.webauthn) { statusText = t.noWebAuthn; bad = true; }
      else if (s.prf === false) { statusText = t.noPrf; bad = true; }
      else statusText = s.prf === true ? t.supported : t.maybe;
    }
    root.appendChild(el("p", "pk-status" + (bad ? " pk-status--bad" : ""), statusText));
    const usable = !!(s && s.webauthn && s.prf !== false);

    // 1. 建立
    const step1 = el("div", "pk-step" + (state.made ? " pk-step--done" : ""));
    step1.appendChild(el("p", "pk-title", t.step1));
    step1.appendChild(el("p", null, t.step1Body));
    const row1 = el("div", "pk-row");
    if (state.creating) row1.appendChild(busyButton(t.creating));
    else {
      const b = button(t.create, "pk-primary", () => guarded("create", "creating", async () => {
        state.made = await create();
      }));
      b.disabled = !usable;
      row1.appendChild(b);
    }
    step1.appendChild(row1);
    if (state.made) {
      // 這一把拿到了哪些能力要當場講。PRF 的秘密是建立當下產生的，換裝置補不回來。
      step1.appendChild(el("p", null, state.made.hasPrf ? t.createdBoth : t.createdVaultOnly));
    }
    if (state.error && state.error.step === "create") step1.appendChild(el("p", "pk-error", t.errors[state.error.code] || t.errors.failed));
    root.appendChild(step1);

    // 2. 試解鎖
    const step2 = el("div", "pk-step" + (state.tested ? " pk-step--done" : ""));
    step2.appendChild(el("p", "pk-title", t.step2));
    step2.appendChild(el("p", null, t.step2Body));
    const row2 = el("div", "pk-row");
    if (state.testing) row2.appendChild(busyButton(t.testing));
    else {
      const b = button(t.test, "pk-primary", () => guarded("test", "testing", async () => {
        await testUnlock();
        state.tested = true;
      }));
      b.disabled = !usable;
      row2.appendChild(b);
    }
    step2.appendChild(row2);
    if (state.tested) step2.appendChild(el("p", null, t.tested));
    if (state.error && state.error.step === "test") step2.appendChild(el("p", "pk-error", t.errors[state.error.code] || t.errors.failed));
    root.appendChild(step2);

    // 3. 備援金鑰
    const step3 = el("div", "pk-step" + (state.backup ? " pk-step--done" : ""));
    step3.appendChild(el("p", "pk-title", t.step3));
    step3.appendChild(el("p", null, t.step3Body));
    const row3 = el("div", "pk-row");
    if (state.generating) row3.appendChild(busyButton(t.backup));
    else row3.appendChild(button(t.backup, "pk-primary", () => guarded("backup", "generating", async () => {
      state.backup = await backupKey();
    })));
    step3.appendChild(row3);
    if (state.backup) {
      step3.appendChild(el("p", null, t.backupSecret));
      step3.appendChild(el("p", "pk-code pk-secret", state.backup.secret));
      const r1 = el("div", "pk-row");
      r1.appendChild(copyButton(() => state.backup.secret));
      step3.appendChild(r1);
      step3.appendChild(el("p", null, t.backupRecipient));
      step3.appendChild(el("p", "pk-code", state.backup.recipient));
      const r2 = el("div", "pk-row");
      r2.appendChild(copyButton(() => state.backup.recipient));
      step3.appendChild(r2);
      step3.appendChild(el("p", "pk-hint", t.next));
    }
    if (state.error && state.error.step === "backup") step3.appendChild(el("p", "pk-error", t.errors[state.error.code] || t.errors.failed));
    root.appendChild(step3);

    root.appendChild(el("p", "pk-hint", t.note));
  }

  render();
  support().then((s) => { state.support = s; render(); });
})();
