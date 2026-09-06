---
title: 威脅模型清單
description: 把「要保護什麼、要防誰、願意付出多少」三題答成一份可複製的清單，並標出答案裡的錯配。答案預設不存，要留的話用 passkey 加密存在你的裝置上。
icon: material/clipboard-check-outline
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
  - js/vault.js
  - js/threatmodel.js
---

# :material-clipboard-check-outline: 威脅模型清單

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

<div id="threatmodel-tool"></div>
<script src="../../js/vault.js"></script>
<script src="../../js/threatmodel.js"></script>

常見的兩種處境：

- **正在準備離開一段有控制欲的關係，但還沒搬走**：搬走之前，對方仍然拿得到你的手機與電腦。三題答完會很清楚：要保護的裝置跟要防的人在同一個屋簷下，而成本題的重點是別被發現正在準備。
- **剛加入一個團體，被交代要注意資安卻不知道從哪開始**：答完再看下面的錯配清單，多半會發現自己選了一堆對手卻沒填對應的成本。填完的清單就是一個起點。

## 跟威脅模型那篇文章的關係

[威脅模型如何建立](../basics/threat-model.md)把三題寫完之後，給了一段操作流程：拿一張紙或開個共筆，依序回答。這份清單就是那張紙的網頁版。

三題的分級跟原文完全一樣，資產四類、對手六級、成本三級（從隨手翻看的人一路到國家級情報單位）。答完會產出一份可以複製的純文字摘要，並列出建議先讀的頁面。

## 真正有用的是錯配清單

三題各自看都很合理，湊在一起就未必。幾種常見的湊不起來會被標出來：

- **對手選到執法或國家級，成本卻填最低**：文章那句「一個你撐不到三個月的方案，等於沒有方案」寫的正是這種落差，兩邊要動一邊。
- **要防親密關係的人，卻沒把裝置列進要保護的東西**：這一級對手最常用的路徑是取得你的手機或電腦，密碼與螢幕鎖通常比選什麼通訊軟體更關鍵。
- **只防隨意路人，卻打算大改工作流程**：用大砲打蚊子，投入的力氣多半幾週後就放棄。
- **要保護消息來源的身分，卻沒把聯絡關係列進來**：誰跟誰通訊本身就是線索，內容加密擋不住這一層。
- **選了五個以上的對手**：一份清單對應一個場景比較有用，工作與私人生活分開寫，各自都會更清楚。

一題一題答的時候不容易看出衝突，五種答案並排列出來，例如對手選到國家級卻填最低成本，落差馬上就跳出來。

## 答案預設不存

填的內容只留在瀏覽器分頁裡，不寫進任何一種瀏覽器儲存空間，也不送到任何地方，重新整理就回到空白。要留一份有兩條路：按「複製摘要」貼到你自己選的地方，或按「存進我的暫存區」，用你的 [passkey](passkey.md) 加密存在這台裝置上，跟[我的準備清單](checklist.md)同一份密文。兩條都要你自己按，這一頁不替你決定。下次進來，頂端會問要不要填回上次的答案。

有一種情況不提供存檔：對手選了親密關係、一國執法或國家級。他們碰得到你的裝置，也可能要求你解鎖，passkey 沒有比螢幕鎖更強。「我要防的是親密關係的人」這種答案留在對方碰得到的裝置上，正好是最不該留的東西。那時只剩「複製摘要」，貼到對方碰不到的地方。

有一項測試守著三件事：這一頁自己不碰任何儲存空間，存檔只經 passkey 暫存區，上面那幾種對手選了就不提供存檔。

## 這份清單是活的

換工作、換伴侶、換城市、開始參與新議題、出現一次資安事件之後，回頭再填一次。每次不用重寫，只要問上次寫的還準不準。

## 接下來

答完之後照著建議的頁面往下讀。要挑具體工具時，[工具層](../tools/index.md)每一篇都會回頭對應到三題的答案。

小工具區的其他頁面也對得上答案：

- 第一題選了「誰是我的消息來源」，接[隱形字元偵測](invisible.md)，裡面有一節寫記者查證時怎麼不燒掉來源
- 第二題選了「親密關係」，接[你的瀏覽器透露了什麼](leaks.md)看換裝置之後還剩下什麼線索
- 第一題選了「何時何地出現過」，接[照片 metadata 清除器](strip-metadata.md)，照片裡的座標是最常見的洩漏管道
- 第三題填了低成本，[密語與密碼產生器](passphrase.md)是投入最少、效果最直接的一項

## 離線可用

跟這一區其他工具一樣，程式存進裝置之後沒有網路也能用。網域被封、連線被切之後還打得開，正是這份清單最需要被打開的時候。

要把這一頁帶著走，見[離線閱讀](../offline.md)。
