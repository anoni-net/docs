---
title: 加密暫存區（實驗）
description: 用 passkey 解鎖的本機加密儲存，實驗階段。建立時把資料金鑰放進 passkey 的 user.id，之後只要驗證就能解開。
search:
  exclude: true
hide:
  - navigation
offline_assets:
  - utils/vendor/age/age-encryption/dist/armor.js
  - utils/vendor/age/age-encryption/dist/cbor.js
  - utils/vendor/age/age-encryption/dist/format.js
  - utils/vendor/age/age-encryption/dist/index.js
  - utils/vendor/age/age-encryption/dist/io.js
  - utils/vendor/age/age-encryption/dist/recipients.js
  - utils/vendor/age/age-encryption/dist/stream.js
  - utils/vendor/age/age-encryption/dist/webauthn.js
  - utils/vendor/age/age-encryption/dist/x25519.js
  - utils/vendor/age/noble-ciphers/_arx.js
  - utils/vendor/age/noble-ciphers/_poly1305.js
  - utils/vendor/age/noble-ciphers/chacha.js
  - utils/vendor/age/noble-ciphers/utils.js
  - utils/vendor/age/noble-curves/abstract/curve.js
  - utils/vendor/age/noble-curves/abstract/edwards.js
  - utils/vendor/age/noble-curves/abstract/fft.js
  - utils/vendor/age/noble-curves/abstract/hash-to-curve.js
  - utils/vendor/age/noble-curves/abstract/modular.js
  - utils/vendor/age/noble-curves/abstract/montgomery.js
  - utils/vendor/age/noble-curves/abstract/oprf.js
  - utils/vendor/age/noble-curves/abstract/weierstrass.js
  - utils/vendor/age/noble-curves/ed25519.js
  - utils/vendor/age/noble-curves/nist.js
  - utils/vendor/age/noble-curves/utils.js
  - utils/vendor/age/noble-hashes/_md.js
  - utils/vendor/age/noble-hashes/_u64.js
  - utils/vendor/age/noble-hashes/hkdf.js
  - utils/vendor/age/noble-hashes/hmac.js
  - utils/vendor/age/noble-hashes/pbkdf2.js
  - utils/vendor/age/noble-hashes/scrypt.js
  - utils/vendor/age/noble-hashes/sha2.js
  - utils/vendor/age/noble-hashes/sha3.js
  - utils/vendor/age/noble-hashes/utils.js
  - utils/vendor/age/noble-post-quantum/_crystals.js
  - utils/vendor/age/noble-post-quantum/hybrid.js
  - utils/vendor/age/noble-post-quantum/ml-kem.js
  - utils/vendor/age/noble-post-quantum/utils.js
  - utils/vendor/age/scure-base/index.js
  - js/vault.js
  - js/vault-lab.js
---

# 加密暫存區（實驗）

一個用 passkey 解鎖的本機加密儲存。建立時產生一把資料金鑰，放進 passkey 的 `user.id`，之後在任何有這把 passkey 的裝置上驗證一次就能解開。不必記密語。

這一頁是實驗，內容暫時只有一個文字欄位。真正要放的是 checklist 那類讀者主動打開才看的東西。

<script type="importmap">
{
  "imports": {
    "age-encryption": "../../utils/vendor/age/age-encryption/dist/index.js",
    "@noble/ciphers/chacha.js": "../../utils/vendor/age/noble-ciphers/chacha.js",
    "@noble/curves/abstract/edwards.js": "../../utils/vendor/age/noble-curves/abstract/edwards.js",
    "@noble/curves/abstract/fft.js": "../../utils/vendor/age/noble-curves/abstract/fft.js",
    "@noble/curves/abstract/montgomery.js": "../../utils/vendor/age/noble-curves/abstract/montgomery.js",
    "@noble/curves/abstract/weierstrass.js": "../../utils/vendor/age/noble-curves/abstract/weierstrass.js",
    "@noble/curves/ed25519.js": "../../utils/vendor/age/noble-curves/ed25519.js",
    "@noble/curves/nist.js": "../../utils/vendor/age/noble-curves/nist.js",
    "@noble/curves/utils.js": "../../utils/vendor/age/noble-curves/utils.js",
    "@noble/hashes/hkdf": "../../utils/vendor/age/noble-hashes/hkdf.js",
    "@noble/hashes/hkdf.js": "../../utils/vendor/age/noble-hashes/hkdf.js",
    "@noble/hashes/hmac": "../../utils/vendor/age/noble-hashes/hmac.js",
    "@noble/hashes/hmac.js": "../../utils/vendor/age/noble-hashes/hmac.js",
    "@noble/hashes/scrypt.js": "../../utils/vendor/age/noble-hashes/scrypt.js",
    "@noble/hashes/sha2": "../../utils/vendor/age/noble-hashes/sha2.js",
    "@noble/hashes/sha2.js": "../../utils/vendor/age/noble-hashes/sha2.js",
    "@noble/hashes/sha3.js": "../../utils/vendor/age/noble-hashes/sha3.js",
    "@noble/hashes/utils": "../../utils/vendor/age/noble-hashes/utils.js",
    "@noble/hashes/utils.js": "../../utils/vendor/age/noble-hashes/utils.js",
    "@noble/post-quantum/hybrid.js": "../../utils/vendor/age/noble-post-quantum/hybrid.js",
    "@scure/base": "../../utils/vendor/age/scure-base/index.js"
  }
}
</script>

<style>
/*
  這一頁的樣式。原本一條都沒寫，三個按鈕靠 appendChild 接在一起，中間連空白字元都沒有，
  在手機上就是三個緊貼的目標，按「儲存」很容易點到旁邊的「匯出」跳出下載對話框。
  按鈕之間留間距，觸控目標給到 2.75rem（約 44 px，觸控介面的建議下限）。
  顏色用 theme 的變數，深色模式跟著走。
*/
#vault-lab .vl-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 1.1rem 0;
  align-items: center;
}
#vault-lab .vl-btn {
  min-height: 2.75rem;
  padding: 0.55rem 1.1rem;
  font-size: 0.75rem;
  line-height: 1.4;
  border: 1px solid var(--md-default-fg-color--lighter);
  border-radius: 0.4rem;
  background: var(--md-default-bg-color);
  color: var(--md-default-fg-color);
  cursor: pointer;
}
#vault-lab .vl-primary {
  border-color: var(--md-primary-fg-color);
  background: var(--md-primary-fg-color);
  color: var(--md-primary-bg-color);
  font-weight: 600;
}
#vault-lab .vl-btn:disabled { opacity: 0.5; cursor: default; }
#vault-lab .vl-label {
  display: block;
  margin: 1.2rem 0 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
}
#vault-lab .vl-note {
  width: 100%;
  margin-top: 0.4rem;
  padding: 0.6rem;
  font-family: var(--md-code-font-family, monospace);
  font-size: 0.78rem;
  border: 1px solid var(--md-default-fg-color--lighter);
  border-radius: 0.4rem;
  background: var(--md-default-bg-color);
  color: var(--md-default-fg-color);
}
#vault-lab .vl-row { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.4rem; }
#vault-lab .vl-row input { flex: 1 1 auto; min-width: 0; }
#vault-lab .vl-label input {
  width: 100%;
  padding: 0.5rem;
  font-size: 0.78rem;
  border: 1px solid var(--md-default-fg-color--lighter);
  border-radius: 0.4rem;
  background: var(--md-default-bg-color);
  color: var(--md-default-fg-color);
}
#vault-lab .vl-secret {
  word-break: break-all;
  font-family: var(--md-code-font-family, monospace);
  font-size: 0.72rem;
  padding: 0.5rem;
  border-radius: 0.3rem;
  background: var(--md-code-bg-color);
}
#vault-lab .vl-msg { font-weight: 600; }
#vault-lab .vl-hint { font-size: 0.72rem; opacity: 0.85; }
#vault-lab .vl-file { font-size: 0.72rem; }
</style>

<div id="vault-lab"></div>
<script src="../../js/vault.js"></script>
<script src="../../js/vault-lab.js"></script>

## 它怎麼運作

資料金鑰是 32 個隨機位元組，那正好也是一把 age 私鑰的長度，所以直接拿來加密，輸出是標準 age 檔。金鑰放在 passkey 的 `user.id` 裡，每次驗證時原樣回傳，任何 provider、任何裝置都一樣。[實驗頁](passkey-lab.md)量的就是這件事。

密文存在這台裝置的 IndexedDB。解鎖之後金鑰只留在記憶體，分頁關掉就沒了。

## 一把鑰匙服務兩件事

建立時同時要求 PRF 擴充。拿得到的話，這把鑰匙也能給[本機檔案加密](../utils/age.md)用，那邊選 passkey 模式時挑同一把就好，密碼管理器裡不必留兩筆。已經在這裡建過的人不需要再去[鑰匙頁](../utils/passkey.md)建。

PRF 拿不到不算失敗，暫存區走的是 `user.id` 那條，跟 PRF 無關。iPhone 配第三方密碼管理器就是這種情況，建出來的鑰匙只給暫存區用。

PRF 的秘密是建立當下由 authenticator 產生的，所以**在哪裡建立決定了這把鑰匙有沒有那個能力**，之後換到支援的裝置也補不回來。想要兩種能力都有，在電腦上建第一把（Bitwarden 的瀏覽器擴充、Windows Hello、Mac 都可以），或者在 iPhone 上選 iCloud 鑰匙圈。

## 跟站上檔案加密的差別

[本機檔案加密](../utils/age.md)的 passkey 模式走 WebAuthn 的 PRF 擴充，保證是「就算密碼管理器的 vault 洩漏，也算不出金鑰」。代價是 iPhone 配第三方密碼管理器拿不到 PRF。

這一層改把金鑰放進 `user.id`，任何支援 passkey 的環境都能用，代價是金鑰跟著 credential 存在 vault 裡，能解開 vault 的人就能解開這裡的資料。兩種取捨各有適合的東西，所以是兩套並存而不是互相取代。

## 備援金鑰

沒有 WebAuthn 的環境（例如 Tor Browser）只剩備援私鑰這條路，passkey 全丟了也一樣。建立時可以產生一把，公鑰會被加進收件人，私鑰只顯示一次，自己存進密碼管理器。

用備援私鑰解開是唯讀的，看得到內容也匯得出去，改不了。資料金鑰在 passkey 裡，備援那條路拿不到它。

## 換一台裝置

passkey 有同步（Bitwarden、iCloud 鑰匙圈）的話，那台裝置直接解得開。不同步的環境要另外處理，那部分還沒做。

匯出的是標準 age 檔，可以自己搬到另一台裝置匯入。
