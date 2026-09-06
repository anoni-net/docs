/*
 * 加密暫存區：用 passkey 解鎖的本機儲存
 *
 * === 為什麼不是 PRF ===
 *
 * WebAuthn 的 PRF 擴充是「用 passkey 算出金鑰」的正規做法，站上的檔案加密走的就是它。
 * 可是 Apple 不把擴充的資料交給 iCloud 鑰匙圈以外的 provider，iPhone 配 Bitwarden 就
 * 拿不到金鑰，largeBlob 撞的是同一面牆。要做到「讀者從頭到尾只按指紋」，那條路走不通。
 *
 * 這裡改用核心欄位 user.id。建立 passkey 時把 32 個隨機位元組放進去，之後每次驗證都
 * 原樣回傳，任何 provider、任何裝置都一樣。2026-09-05 在 iPhone 配 Bitwarden 上實測
 * 過，量測頁留在 community/passkey-lab。
 *
 * 代價要說清楚：金鑰跟著 credential 存在密碼管理器的 vault 裡，能解開 vault 的人就能
 * 解開這裡的資料。PRF 那條路的保證是「就算 vault 洩漏也算不出金鑰」，這條沒有。換到的
 * 是所有支援 passkey 的環境都能用。
 *
 * === 那 32 個位元組就是一把 age 私鑰 ===
 *
 * age 的 identity 本來就是 32 位元組的 X25519 私鑰，所以 user.id 直接拿來用，不必再
 * 衍生。加密走站上既有的 age 實作，輸出是標準 age 檔，備援公鑰當第二收件人，匯出的
 * 東西跟本機檔案加密那邊同一個格式，命令列也解得開。
 *
 * === 幾條規則 ===
 *
 * 金鑰不出現在畫面上，也不進剪貼簿。量測頁把它印出來是為了比對，這裡不會。
 *
 * 解鎖一次，金鑰留在記憶體，分頁關掉就沒了。不寫進任何儲存空間，這一點有測試守著。
 *
 * 只放讀者主動打開才需要的資料。語系偏好那種在頁面載入路徑上的東西不能放進來，否則
 * 每次開站都要先按一次指紋。
 *
 * 加第二台裝置：passkey 有同步就不必做什麼。不同步的環境要用同一個 user.id 在那台
 * 建立一把新的，所以得先在已解鎖的裝置上把金鑰帶過去，那是 exportKey 的用途。
 */
(function () {
  const DB_NAME = "anoni-vault";
  const STORE = "blob";
  const BLOB_KEY = "main";
  const KEY_BYTES = 32;
  const RP_NAME = "anoni.net";

  // 顯示在密碼管理器裡的名字。一把鑰匙同時服務檔案加密與暫存區，所以不叫「暫存區」，
  // 帶日期讓讀者分得出哪一把是哪天建的。
  function keyName(date) {
    const d = date || new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return "anoni.net " + d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  // 解鎖之後的金鑰只活在這裡。分頁關掉、重新整理都會沒有，這是刻意的。
  let unlockedKey = null;
  // 這份密文的備援公鑰。它跟著密文一起存（見 wrapEnvelope），解開時讀回來，之後每一次
  // 儲存都要繼續加密給它。原本沒有這一項，備援只保護建立當下那一次寫入，讀者重開頁面
  // 解鎖後的每一次儲存都把備援收件人丟掉了，而備援私鑰打不開的那一刻才會發現。
  let currentBackup = null;
  let agePromise = null;

  const lib = () => {
    if (!agePromise) agePromise = import("age-encryption");
    return agePromise;
  };

  // --- IndexedDB：只存一份密文，不需要 schema ---

  function openDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 寫入要等交易 commit 才算數。
  //
  // request.onsuccess 只代表那一個請求被接受了，資料還在交易裡。在那個時間點回報成功
  // 的話，畫面會說「存好了」，而讀者這時重新整理，交易還沒 commit 就被中斷，東西就
  // 沒了。實際遇到的症狀是建立完存第一筆存不進去，重新整理再存一次才留得住。
  function withStore(mode, run) {
    return openDb().then(
      (db) =>
        new Promise((resolve, reject) => {
          const tx = db.transaction(STORE, mode);
          const request = run(tx.objectStore(STORE));
          let result;
          request.onsuccess = () => {
            result = request.result;
          };
          request.onerror = () => reject(request.error);
          tx.oncomplete = () => {
            db.close();
            resolve(result);
          };
          tx.onerror = () => {
            db.close();
            reject(tx.error);
          };
          tx.onabort = () => {
            db.close();
            reject(tx.error);
          };
        })
    );
  }

  const readBlob = () => withStore("readonly", (store) => store.get(BLOB_KEY));
  const writeBlob = (bytes) => withStore("readwrite", (store) => store.put(bytes, BLOB_KEY));
  const dropBlob = () => withStore("readwrite", (store) => store.delete(BLOB_KEY));

  // --- passkey：只用核心欄位，沒有任何擴充 ---

  // 建立一把 anoni.net 的鑰匙。它同時要兩種能力，讀者的密碼管理器裡因此只需要一筆。
  //
  // user.id 放資料金鑰，那是暫存區用的，任何 provider 都拿得回來。同時要求 PRF 擴充，
  // 拿得到的話這把鑰匙也能給本機檔案加密用（那邊的收件人只認 rpId，不綁特定 credential，
  // 所以挑同一把就行）。
  //
  // PRF 拿不到不算失敗。iPhone 配第三方密碼管理器就是這種情況，那時暫存區照樣能用，
  // 少的只是檔案加密那項能力。回傳時把結果講出來，畫面才寫得出這一把拿到了哪些。
  //
  // PRF 的秘密是建立當下由 authenticator 產生的，所以「在哪裡建立」決定了這把鑰匙
  // 有沒有那個能力，之後換到支援的裝置也補不回來。
  async function createCredential(keyBytes) {
    const cred = await navigator.credentials.create({
      publicKey: {
        rp: { name: RP_NAME, id: location.hostname },
        // user.id 就是金鑰。name 與 displayName 會顯示在密碼管理器裡，寫得讓讀者認得出來。
        user: { id: keyBytes, name: keyName(), displayName: keyName() },
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        pubKeyCredParams: [
          { type: "public-key", alg: -8 },
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        // discoverable 才會在驗證時回傳 userHandle，那是整條路的前提
        authenticatorSelection: { residentKey: "required", userVerification: "required" },
        extensions: { prf: {} },
        timeout: 120000,
      },
    });
    if (!cred) throw new Error("cancelled");
    const results = cred.getClientExtensionResults ? cred.getClientExtensionResults() : {};
    return { hasPrf: !!(results.prf && results.prf.enabled) };
  }

  async function keyFromCredential() {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        // 空的清單讓讀者自己挑，也才走得到 discoverable 那條路
        allowCredentials: [],
        userVerification: "required",
        timeout: 120000,
      },
    });
    const handle = assertion && assertion.response && assertion.response.userHandle;
    if (!handle) throw new Error("no-handle");
    const bytes = new Uint8Array(handle);
    if (bytes.length !== KEY_BYTES) throw new Error("bad-handle");
    return bytes;
  }

  // --- 金鑰的形狀轉換 ---

  // age 的 identity 就是 32 位元組的 X25519 私鑰，bech32 編碼之後長成 AGE-SECRET-KEY-1…
  // 編碼方式跟 typage 的 generateX25519Identity 一模一樣，那邊也是隨機 32 位元組直接編。
  async function identityOf(keyBytes) {
    const { bech32 } = await import("@scure/base");
    return bech32.encodeFromBytes("AGE-SECRET-KEY-", keyBytes).toUpperCase();
  }

  async function recipientOf(identity) {
    const age = await lib();
    return age.identityToRecipient(identity);
  }

  // --- 信封 ---
  //
  // 密文裡放的不是裸資料，是 { v, backupRecipient, data }。
  // v 是格式版本，現在加幾乎不花力氣，等內容變複雜再加就要寫遷移。
  // backupRecipient 是公鑰，放在加密內容裡沒有洩漏的問題，好處是匯出時跟著走，另一台
  // 裝置匯入解開之後知道該繼續加密給誰。
  const ENVELOPE_VERSION = 1;

  function wrapEnvelope(data, backupRecipient) {
    return { v: ENVELOPE_VERSION, backupRecipient: backupRecipient || null, data: data || {} };
  }

  // 第一版之前的密文沒有信封，整個物件就是資料，讀到那種形狀就當成沒有備援公鑰的舊格式。
  function unwrapEnvelope(obj) {
    if (obj && typeof obj === "object" && typeof obj.v === "number") {
      return { backupRecipient: obj.backupRecipient || null, data: obj.data || {} };
    }
    return { backupRecipient: null, data: obj || {} };
  }

  // --- 加解密 ---

  async function encryptData(data, keyBytes, backupRecipient) {
    const age = await lib();
    const identity = await identityOf(keyBytes);
    const encrypter = new age.Encrypter();
    encrypter.addRecipient(await recipientOf(identity));
    if (backupRecipient) encrypter.addRecipient(backupRecipient.trim());
    const json = new TextEncoder().encode(JSON.stringify(data));
    return encrypter.encrypt(json);
  }

  async function decryptData(bytes, identity) {
    const age = await lib();
    const decrypter = new age.Decrypter();
    decrypter.addIdentity(identity);
    const out = await decrypter.decrypt(bytes, "uint8array");
    return JSON.parse(new TextDecoder().decode(out));
  }

  // --- 對外的介面 ---

  const api = {
    available() {
      return !!(window.PublicKeyCredential && window.indexedDB && window.crypto);
    },

    locked() {
      return unlockedKey === null;
    },

    async exists() {
      const blob = await readBlob();
      return !!blob;
    },

    // 密文多大。畫面上要能講出「這台裝置上有沒有東西、有多少」，讀者才分得出
    // 「解開了但裡面是空的」跟「根本沒解開」。
    async size() {
      const blob = await readBlob();
      return blob ? blob.length || blob.byteLength || 0 : 0;
    },

    // 建立：先產生金鑰，用它建 passkey，再寫一份空的密文進去。
    // 順序是刻意的，passkey 沒建成功就什麼都不留。
    // 只建一把鑰匙，什麼都不寫進裝置。鑰匙頁用這一支，那一頁承諾「站上不會存任何跟
    // passkey 有關的東西」，建鑰匙不能順手留下一份密文。金鑰在 user.id 裡，之後到暫存區
    // 頁用 openWithExisting 就拿得回來。
    async createKey() {
      const keyBytes = crypto.getRandomValues(new Uint8Array(KEY_BYTES));
      return createCredential(keyBytes);
    },

    // 建鑰匙加上開一個空的暫存區，給從這一頁開始、手上還沒有鑰匙的讀者。
    async create(backupRecipient) {
      const keyBytes = crypto.getRandomValues(new Uint8Array(KEY_BYTES));
      const made = await createCredential(keyBytes);
      unlockedKey = keyBytes;
      currentBackup = backupRecipient ? backupRecipient.trim() : null;
      await api.save({});
      return made;
    },

    // 用已經有的鑰匙開一個空的暫存區。在鑰匙頁建過的讀者走這裡，不必再建第二把，
    // 密碼管理器裡也就只有一筆。驗證一次拿回 user.id 裡那把金鑰，寫一份空的密文。
    async openWithExisting(backupRecipient) {
      const keyBytes = await keyFromCredential();
      unlockedKey = keyBytes;
      currentBackup = backupRecipient ? backupRecipient.trim() : null;
      await api.save({});
      return true;
    },

    async unlock() {
      const keyBytes = await keyFromCredential();
      const blob = await readBlob();
      let backup = null;
      if (blob) {
        // 解得開才算數，解不開代表這把 passkey 不是當初那一把。順便把備援公鑰讀回來。
        backup = unwrapEnvelope(await decryptData(blob, await identityOf(keyBytes))).backupRecipient;
      }
      unlockedKey = keyBytes;
      currentBackup = backup;
      return true;
    },

    // 備援私鑰那條路：Tor Browser 那種沒有 WebAuthn 的環境，或 passkey 全丟了。
    //
    // 它解得開資料，卻拿不到資料金鑰，因為那把金鑰在 passkey 的 user.id 裡。所以這條
    // 路是唯讀的，讀者看得到內容也匯得出去，要恢復寫入得回到有 passkey 的裝置，或者
    // 把匯出的內容倒進一個新建的暫存區。
    async unlockWithBackup(secret) {
      const blob = await readBlob();
      if (!blob) throw new Error("empty");
      unlockedKey = null;
      currentBackup = null;
      return unwrapEnvelope(await decryptData(blob, secret.trim())).data;
    },

    async read() {
      if (!unlockedKey) throw new Error("locked");
      const blob = await readBlob();
      if (!blob) return {};
      return unwrapEnvelope(await decryptData(blob, await identityOf(unlockedKey))).data;
    },

    // 每一次儲存都加密給目前記著的備援公鑰。呼叫端不必再傳，也不能傳錯。
    async save(data) {
      if (!unlockedKey) throw new Error("locked");
      const bytes = await encryptData(wrapEnvelope(data, currentBackup), unlockedKey, currentBackup);
      await writeBlob(bytes);
      return true;
    },

    // 這份密文有沒有備援公鑰。畫面要能講出「備援已設」或「沒有退路」。
    backupRecipient() {
      return currentBackup;
    },

    // 匯出就是那份密文，標準 age 檔，另一台裝置匯入或用命令列解都可以
    async exportBlob() {
      const blob = await readBlob();
      if (!blob) throw new Error("empty");
      return blob;
    },

    async importBlob(bytes) {
      await writeBlob(bytes);
      return true;
    },

    // 帶著金鑰去另一台裝置建立 passkey 時用得到。回的是原始位元組，呼叫端負責不要
    // 讓它落在畫面或剪貼簿上。
    exportKey() {
      if (!unlockedKey) throw new Error("locked");
      return unlockedKey.slice();
    },

    // 不同步的環境（Windows Hello）要加第二台裝置：帶著 exportKey 拿出來的金鑰，在那台
    // 用同一個 user.id 建一把新的。還沒有介面。
    async enrollDevice(keyBytes) {
      const made = await createCredential(keyBytes);
      unlockedKey = keyBytes;
      return made;
    },

    lock() {
      unlockedKey = null;
      currentBackup = null;
    },

    async clear() {
      unlockedKey = null;
      currentBackup = null;
      await dropBlob();
      return true;
    },
  };

  window.anoniVault = api;
})();
