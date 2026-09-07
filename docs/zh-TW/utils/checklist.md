---
title: 我的準備清單
description: 把站上的行動建議收成一份可勾的清單，勾選狀態用 passkey 加密存在你自己的裝置上。沒有帳號、沒有伺服器，站上什麼都不存。
icon: material/checkbox-marked-outline
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
  - utils/vendor/qrcode-generator.js
  - utils/vendor/jsQR.js
  - js/vault.js
  - js/checklist.js
---

# :material-checkbox-marked-outline: 我的準備清單

[一般人平常該做到什麼](../scenarios/everyday-baseline.md)跟[出差與研討會的數位準備（東亞與東南亞）](../scenarios/asia-travel.md)列了該做的事，做到哪裡沒有地方記。這一頁把那些小標題收成一份清單，勾了就加密存在這台裝置上，鑰匙是你的 passkey，下次按一次指紋就看得到進度。站上什麼都不收，我們連你有沒有清單都不知道。

還沒有 passkey 的話，先到[passkey 鑰匙](passkey.md)建一把，或直接在下面建。passkey 是什麼、限制在哪，見[什麼是 passkey](../tools/what-is-passkey.md)。

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

<div id="checklist-tool"></div>
<script src="../vendor/qrcode-generator.js"></script>
<script src="../vendor/jsQR.js"></script>
<script src="../../js/vault.js"></script>
<script src="../../js/checklist.js"></script>

## 怎麼運作

- 勾選的內容加密後放在瀏覽器的 IndexedDB，金鑰在你的 passkey 裡，解開時才在記憶體裡出現，離開這一頁就消失。所以項目的連結都開新分頁，這一頁留著就不用重新解鎖。閒置 5 分鐘會自動鎖上，鎖之前會先把勾選存好，離開前還是按一下「鎖上」。
- passkey 存在會同步的地方（iCloud、Google、Bitwarden）的話，另一台打開就有，什麼都不用做。要搬的是這台裝置上的資料：用「匯出」帶走密文，另一台匯進來後用同一把 passkey 解開，或按「傳到另一台」，用 [QR 影格串流](qr-stream.md)直接播給另一台掃，收齊之後那一頁會給一顆「匯入我的準備清單」，兩台不需要共用網路。
- 這份清單只記你勾了什麼跟哪一天勾的。passkey 丟了、清單打不開，重勾一次就好，這裡沒有備援金鑰那一步。
- 文章改標題不影響已勾的項目，勾選跟著項目的內部編號走。
- 「每年重看」那一組是文章裡一年一次的檢查那九題。任何項目超過一年沒動會標出來，「只看超過一年沒動的」把清單縮成該重看的那幾項，按「今天確認過」把日期換成今天。
- passkey 沒有同步到另一台時（例如手機用 iCloud 鑰匙圈、電腦用 Windows Hello），這台解開後按「登錄另一台裝置」，會顯示一個 QR code 與一串字，限時一分鐘。另一台按「用另一台的鑰匙登錄這台」拍照或貼上，就建出一把用同一份鑰匙的 passkey。登錄完資料還在原來那台，再用「傳到另一台」搬。那串就是資料金鑰本身，只在自己的兩台裝置之間用，被拍到就收不回來，也沒有換掉的功能，只能清掉暫存區重建一把。
- 這裡的加密強度等於保管 passkey 的地方：要防的人碰得到這台裝置、又知道解鎖密碼或密碼管理器的主密碼，他一樣看得到你勾了什麼。那種處境先讀[家暴受害者的數位準備](../scenarios/domestic-violence.md)，考慮不在這台裝置上留任何準備的痕跡。要防的人是同住的伴侶、執法單位或國家級時，清單只勾不存，怎麼判斷見[威脅模型清單的「答案預設不存」](threat-model.md#答案預設不存)。
- [威脅模型清單](threat-model.md)是另一個清單型工具，答的是要保護什麼、防誰，答案不存起來。這一頁記的是做到哪一步。
