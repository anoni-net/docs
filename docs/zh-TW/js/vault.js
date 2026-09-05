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
  const CRED_NAME = "anoni.net 加密暫存區";

  // 解鎖之後的金鑰只活在這裡。分頁關掉、重新整理都會沒有，這是刻意的。
  let unlockedKey = null;
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

  function withStore(mode, run) {
    return openDb().then(
      (db) =>
        new Promise((resolve, reject) => {
          const tx = db.transaction(STORE, mode);
          const request = run(tx.objectStore(STORE));
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
          tx.oncomplete = () => db.close();
        })
    );
  }

  const readBlob = () => withStore("readonly", (store) => store.get(BLOB_KEY));
  const writeBlob = (bytes) => withStore("readwrite", (store) => store.put(bytes, BLOB_KEY));
  const dropBlob = () => withStore("readwrite", (store) => store.delete(BLOB_KEY));

  // --- passkey：只用核心欄位，沒有任何擴充 ---

  async function createCredential(keyBytes) {
    const cred = await navigator.credentials.create({
      publicKey: {
        rp: { name: RP_NAME, id: location.hostname },
        // user.id 就是金鑰。name 與 displayName 會顯示在密碼管理器裡，寫得讓讀者認得出來。
        user: { id: keyBytes, name: CRED_NAME, displayName: CRED_NAME },
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        pubKeyCredParams: [
          { type: "public-key", alg: -8 },
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        // discoverable 才會在驗證時回傳 userHandle，那是整條路的前提
        authenticatorSelection: { residentKey: "required", userVerification: "required" },
        timeout: 120000,
      },
    });
    if (!cred) throw new Error("cancelled");
    return cred;
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
    async create(backupRecipient) {
      const keyBytes = crypto.getRandomValues(new Uint8Array(KEY_BYTES));
      await createCredential(keyBytes);
      unlockedKey = keyBytes;
      await api.save({}, backupRecipient);
      return true;
    },

    async unlock() {
      const keyBytes = await keyFromCredential();
      const blob = await readBlob();
      if (blob) {
        // 解得開才算數，解不開代表這把 passkey 不是當初那一把
        await decryptData(blob, await identityOf(keyBytes));
      }
      unlockedKey = keyBytes;
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
      return decryptData(blob, secret.trim());
    },

    async read() {
      if (!unlockedKey) throw new Error("locked");
      const blob = await readBlob();
      if (!blob) return {};
      return decryptData(blob, await identityOf(unlockedKey));
    },

    async save(data, backupRecipient) {
      if (!unlockedKey) throw new Error("locked");
      const bytes = await encryptData(data, unlockedKey, backupRecipient);
      await writeBlob(bytes);
      return true;
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

    async adopt(keyBytes) {
      await createCredential(keyBytes);
      unlockedKey = keyBytes;
      return true;
    },

    lock() {
      unlockedKey = null;
    },

    async clear() {
      unlockedKey = null;
      await dropBlob();
      return true;
    },
  };

  window.anoniVault = api;
})();
