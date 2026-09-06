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

建立一把 anoni.net 的 passkey，存進你的密碼管理器或鑰匙圈。之後站上要保護你的資料時，就請這把 passkey 開鎖，每一次都要你用指紋或 PIN 同意。沒有帳號、沒有伺服器、沒有任何識別碼離開裝置。同一把 passkey 在站上有兩種用法，下面分開講。passkey 是什麼、兩種用法各靠什麼機制、限制在哪，見[什麼是 passkey](../tools/what-is-passkey.md)。

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
<script src="../../js/vault.js"></script>
<script src="../../js/passkey.js"></script>

## 怎麼用

1. 按「建立 passkey」，瀏覽器會問你要存到哪裡。存到會同步的地方（iCloud 鑰匙圈、Google 密碼管理員、Bitwarden、1Password），其他裝置才能用同一把。建好之後畫面會列出它能做哪些事。
2. 要用清單那類工具，到這裡就好。打開[我的準備清單](checklist.md)按「用我已有的鑰匙開」。
3. 要用本機檔案加密，先按「試解鎖」確認這個環境算得出金鑰，再按「產生備援金鑰」，把私鑰存進密碼管理器、放在跟密文不同的地方。做完到[本機檔案加密](age.md)選「passkey」模式。

## 這把鑰匙能做什麼

同一把 passkey 在站上有兩種用法，機制不同，能用的環境也不同。

### 暫存區

建立時站上產生一把資料金鑰，放進 passkey 裡跟著它走。之後在任何有這把 passkey 的裝置上驗證一次，資料金鑰就回來，站上用它解開存在你裝置裡的密文。[我的準備清單](checklist.md)、[威脅模型清單](threat-model.md)的存檔、本機檔案加密裡的收件人簿都放在這個暫存區，三個共用同一份密文。任何保管方式都能用，iPhone 配 Bitwarden 也行。

passkey 丟了，暫存區就打不開。清單重勾就好，威脅模型存檔與收件人簿會一起沒，要留退路就用清單頁的「匯出」或「傳到另一台」多放一份。

### 檔案加密

[本機檔案加密](age.md)請 passkey 用 PRF 現場算出金鑰，秘密永遠不離開驗證器，強度比暫存區高一級。代價是只有部分保管方式做得到，見下面的表格。加密時預設同時加密給 passkey 與備援金鑰，兩把任何一把都開得了。備援那一把可以取消，取消之後只有 passkey 開得了，代價寫在加密工具的畫面上。

有幾種情況還是該用密語模式：

- 要在別台電腦用 age 命令列解開，而那台電腦沒有你的 passkey
- 要給別人，對方不可能有你的 passkey
- 你用 Tor Browser，它整個關閉 WebAuthn
- 你要用的裝置算不出金鑰，見下面的表格

兩種模式輸出的都是標準 age 檔，差別只在收件人是誰。同一份資料兩種各做一份、放在不同地方，也是可以的。

## 存到哪裡

別的網站用 passkey 登入，需要的只是簽個名證明是你，任何保管方式都做得到，暫存區也只需要這個能力。檔案加密要它多做一件事，算出一把加密金鑰，那個能力要保管方式另外實作才有。所以同一把 passkey 在別的網站與暫存區好好的，檔案加密卻可能算不出金鑰。下面這張表列的就是哪些做得到。

| 存放位置 | 會不會同步到其他裝置 | 暫存區 | 檔案加密算得出金鑰嗎 |
|---|---|---|---|
| iCloud 鑰匙圈 | 會，Apple 裝置之間 | 可以 | macOS 15、iOS 18.4 以上 |
| Google 密碼管理員 | 會 | 可以 | Android 的 Chrome |
| Bitwarden、1Password、Dashlane | 會 | 可以 | 電腦上的瀏覽器擴充可以，iPhone 與 iPad 的 app 不行 |
| Windows Hello | 只在這台電腦 | 可以 | Windows 11 加 2026 年 2 月更新之後 |
| USB 安全金鑰 | 帶著走 | 本頁不支援 | 本頁不支援，它需要另一種保管方式 |

### iPhone 與 iPad 上要用檔案加密就選 iCloud 鑰匙圈

只用暫存區的話，存哪裡都行。要用檔案加密的話，建立時選 iCloud 鑰匙圈。Apple 的實作不把算金鑰要用的資料傳給 iCloud 鑰匙圈以外的保管方式，選了第三方密碼管理器的 app，passkey 建得起來，鑰匙頁會說這一把只給暫存區用。在另一台裝置上掃 QR code 建立的那條路也一樣拿不到。要在哪一台裝置上做檔案加密，就在那一台上直接建立。

## 兩台以上的裝置

三條路，對應不同的處境。

### 讓 passkey 跟著你走

存在會同步的地方，另一台裝置打開網站就直接解得開，暫存區與檔案加密都是。代價是那個密碼管理器的帳號變成單點，帳號沒了，所有裝置上的鑰匙一起沒。

### 登錄另一台裝置

passkey 不會同步過去的第二台（不同生態系、硬體金鑰），在[我的準備清單](checklist.md)解開後按「登錄另一台裝置」，另一台按「用另一台的鑰匙登錄這台」拍 QR code 或貼上字串，另一台就建出一把用同一份資料金鑰的 passkey。這條路只給暫存區。畫面上那串就是資料金鑰本身，只在自己的兩台裝置之間用。暫存區的資料再用「傳到另一台」搬。

### 用備援私鑰開檔案

Windows Hello 這種只留在本機的環境，另一台裝置上沒有那把 passkey，解密時把備援私鑰貼進去。這條路只給檔案加密，不依賴任何雲端帳號，代價是私鑰會比較常出現在剪貼簿與螢幕上，它一旦外流，加密就等於沒做。

主力裝置用會同步的 passkey，備援私鑰收在密碼管理器裡當最後一道，兩者放在不同地方，是多數人適用的安排。

## 注意

- passkey 綁在 `anoni.net` 這個網域。鏡像站、onion 位址用不了，Tor Browser 整個關閉 WebAuthn。
- passkey 丟了、密碼管理員的帳號沒了，用它加密的檔案只剩備援金鑰能開，備援金鑰也丟了就永遠打不開，沒有任何人能救。暫存區只剩你用匯出或傳到另一台多放的那一份。
- 站上不會存任何跟 passkey 有關的東西，也查不出你有沒有建過。頁面每次打開都是空的，刻意如此。
- 第一次使用需要連上網把程式抓回來，之後會留在裝置上。
