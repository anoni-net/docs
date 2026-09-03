---
title: passkey 鑰匙
description: 建立一把 anoni.net 的 passkey，存進你的密碼管理器或鑰匙圈，試一次解鎖，再產生備援金鑰。沒有帳號、沒有伺服器，站上什麼都不存。
icon: material/fingerprint
offline_assets:
  # typage 與相依的 noble、scure 由 import map 接到 vendor/age/，hooks/offline_index.py 只認
  # <script src>，所以逐一列在下面。清單由 tools/test_agecrypt.mjs 對照 vendor 目錄。
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
---

# :material-fingerprint: passkey 鑰匙

建立一把 anoni.net 的 passkey，存進你的密碼管理器或鑰匙圈。之後站上要保護你的資料時，就請它算出金鑰，每一次都要你用指紋或 PIN 同意。沒有帳號、沒有伺服器、沒有任何識別碼離開裝置。passkey 是什麼、為什麼能當鑰匙、限制在哪，見[什麼是 passkey](../tools/what-is-passkey.md)。

<script type="importmap">
{
  "imports": {
    "age-encryption": "../vendor/age/age-encryption/dist/index.js",
    "@noble/ciphers/chacha.js": "../vendor/age/noble-ciphers/chacha.js",
    "@noble/curves/abstract/edwards.js": "../vendor/age/noble-curves/abstract/edwards.js",
    "@noble/curves/abstract/fft.js": "../vendor/age/noble-curves/abstract/fft.js",
    "@noble/curves/abstract/montgomery.js": "../vendor/age/noble-curves/abstract/montgomery.js",
    "@noble/curves/abstract/weierstrass.js": "../vendor/age/noble-curves/abstract/weierstrass.js",
    "@noble/curves/ed25519.js": "../vendor/age/noble-curves/ed25519.js",
    "@noble/curves/nist.js": "../vendor/age/noble-curves/nist.js",
    "@noble/curves/utils.js": "../vendor/age/noble-curves/utils.js",
    "@noble/hashes/hkdf": "../vendor/age/noble-hashes/hkdf.js",
    "@noble/hashes/hkdf.js": "../vendor/age/noble-hashes/hkdf.js",
    "@noble/hashes/hmac": "../vendor/age/noble-hashes/hmac.js",
    "@noble/hashes/hmac.js": "../vendor/age/noble-hashes/hmac.js",
    "@noble/hashes/scrypt.js": "../vendor/age/noble-hashes/scrypt.js",
    "@noble/hashes/sha2": "../vendor/age/noble-hashes/sha2.js",
    "@noble/hashes/sha2.js": "../vendor/age/noble-hashes/sha2.js",
    "@noble/hashes/sha3.js": "../vendor/age/noble-hashes/sha3.js",
    "@noble/hashes/utils": "../vendor/age/noble-hashes/utils.js",
    "@noble/hashes/utils.js": "../vendor/age/noble-hashes/utils.js",
    "@noble/post-quantum/hybrid.js": "../vendor/age/noble-post-quantum/hybrid.js",
    "@scure/base": "../vendor/age/scure-base/index.js"
  }
}
</script>

<div id="passkey-tool"></div>
<script src="../../js/passkey.js"></script>

## 怎麼用

1. 按「建立 passkey」，瀏覽器會問你要存到哪裡。存到會同步的地方（iCloud 鑰匙圈、Google 密碼管理員、Bitwarden、1Password），其他裝置才能用同一把。
2. 按「試解鎖」，確認指紋或 PIN 的流程順暢。在另一台同步過的裝置上再按一次，確認那邊也能用。
3. 按「產生備援金鑰」，把私鑰存進密碼管理器，放在跟密文不同的地方。公鑰是加密時要貼的「備援金鑰」。

做完就到[本機檔案加密](age.md)，選「passkey」模式。

## 存到哪裡

| 存放位置 | 會不會同步到其他裝置 | PRF 支援 |
|---|---|---|
| iCloud 鑰匙圈 | 會，Apple 裝置之間 | macOS 15、iOS 18.4 以上 |
| Google 密碼管理員 | 會 | Android 的 Chrome |
| Bitwarden、1Password、Dashlane | 會 | 支援 |
| Windows Hello | 只在這台電腦 | Windows 11 加 2026 年 2 月更新之後 |
| USB 安全金鑰 | 帶著走 | 本頁不支援，它需要另一種保管方式 |

## 注意

- passkey 綁在 `anoni.net` 這個網域。鏡像站、onion 位址用不了，Tor Browser 整個關閉 WebAuthn。
- passkey 丟了、密碼管理員的帳號沒了，只剩備援金鑰能開。備援金鑰也丟了就永遠打不開，沒有任何人能救。
- 站上不會存任何跟 passkey 有關的東西，也查不出你有沒有建過。頁面每次打開都是空的，刻意如此。
- 第一次使用需要連上網把程式抓回來，之後會留在裝置上。
