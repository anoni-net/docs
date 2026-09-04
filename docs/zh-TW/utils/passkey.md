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

1. 按「建立 passkey」，瀏覽器會問你要存到哪裡。存到會同步的地方，其他裝置才能用同一把。在 iPhone 與 iPad 上選 iCloud 鑰匙圈，那是目前唯一算得出金鑰的保管方式，理由見下面的「存到哪裡」。
2. 按「試解鎖」，確認指紋或 PIN 的流程順暢。在另一台同步過的裝置上再按一次，確認那邊也能用。
3. 按「產生備援金鑰」，把私鑰存進密碼管理器，放在跟密文不同的地方。公鑰是加密時要貼的「備援金鑰」。

做完就到[本機檔案加密](age.md)，選「passkey」模式。

## 這把鑰匙能做什麼

做完上面三步，你手上有兩樣東西：一把存在密碼管理器或鑰匙圈裡的 passkey，以及一組備援金鑰。

站上目前用得到它的只有[本機檔案加密](age.md)。鑰匙切到「passkey」之後，加密時按一次指紋就好，不用想密語也不用打字。加密時預設會同時加密給 passkey 與備援金鑰，兩把任何一把都開得了。備援那一把可以取消，取消之後只有 passkey 開得了，代價寫在加密工具的畫面上。

一個實際的例子：[威脅模型自我檢查](threat-model.md)產出的摘要寫著你要防誰、手上有什麼，那一頁刻意不把答案存進裝置，決定要留一份的時候就用這把鑰匙包成密文再存。

有幾種情況還是該用密語模式：

- 要在別台電腦用 age 命令列解開，而那台電腦沒有你的 passkey
- 要給別人，對方不可能有你的 passkey
- 你用 Tor Browser，它整個關閉 WebAuthn
- 你要用的裝置算不出金鑰，見下面的表格

兩種模式輸出的都是標準 age 檔，差別只在收件人是誰。同一份資料兩種各做一份、放在不同地方，也是可以的。

## 存到哪裡

別的網站用 passkey 登入，需要的只是簽個名證明是你，任何保管方式都做得到。這一頁要它多做一件事，算出一把加密金鑰。那個能力要保管方式另外實作才有，所以同一把 passkey 在別的網站好好的，在這裡卻可能算不出金鑰。下面這張表列的就是哪些保管方式做得到後面這件事。


| 存放位置 | 會不會同步到其他裝置 | 算得出金鑰嗎 |
|---|---|---|
| iCloud 鑰匙圈 | 會，Apple 裝置之間 | macOS 15、iOS 18.4 以上 |
| Google 密碼管理員 | 會 | Android 的 Chrome |
| Bitwarden、1Password、Dashlane | 會 | 電腦上的瀏覽器擴充可以，iPhone 與 iPad 的 app 不行 |
| Windows Hello | 只在這台電腦 | Windows 11 加 2026 年 2 月更新之後 |
| USB 安全金鑰 | 帶著走 | 本頁不支援，它需要另一種保管方式 |

### iPhone 與 iPad 要選 iCloud 鑰匙圈

建立時系統會問存到哪裡，選 iCloud 鑰匙圈。Apple 的實作不把算金鑰要用的資料傳給 iCloud 鑰匙圈以外的保管方式，所以在 iPhone 上選了第三方密碼管理器的 app，passkey 建得起來，接著就會看到「算不出加密金鑰」。

在另一台裝置上掃 QR code 建立的那條路也一樣拿不到。要在哪一台裝置上用，就在那一台上直接建立。

## 兩台以上的裝置

passkey 模式的檔案同時加密給 passkey 與備援金鑰，所以跨裝置有兩條路，代價不一樣。

### 讓 passkey 跟著你走

存在 iCloud 鑰匙圈、Google 密碼管理員、Bitwarden、1Password 這類會同步的地方，另一台裝置打開網站就直接解得開，什麼都不用貼。代價是那個密碼管理器的帳號變成單點，帳號沒了，所有裝置上的鑰匙一起沒。

### 用備援私鑰開

Windows Hello 這種只留在本機的環境，另一台裝置上沒有那把 passkey，解密時要把備援私鑰貼進去。這條路不依賴任何雲端帳號，代價是私鑰會比較常出現在剪貼簿與螢幕上，而它一旦外流，加密就等於沒做。

主力裝置用會同步的 passkey，備援私鑰收在密碼管理器裡當最後一道，兩者放在不同地方，是多數人適用的安排。

## 注意

- passkey 綁在 `anoni.net` 這個網域。鏡像站、onion 位址用不了，Tor Browser 整個關閉 WebAuthn。
- passkey 丟了、密碼管理員的帳號沒了，只剩備援金鑰能開。備援金鑰也丟了就永遠打不開，沒有任何人能救。
- 站上不會存任何跟 passkey 有關的東西，也查不出你有沒有建過。頁面每次打開都是空的，刻意如此。
- 第一次使用需要連上網把程式抓回來，之後會留在裝置上。
