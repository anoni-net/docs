---
title: 威胁模型清单
description: 把「要保护什么、要防谁、愿意付出多少」三题答成一份可复制的清单，并标出答案里的错配。答案预设不存，要留的话用 passkey 加密存在你的设备上。
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

# :material-clipboard-check-outline: 威胁模型清单

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

常见的两种处境：

- **正在准备离开一段有控制欲的关系，但还没搬走**：搬走之前，对方仍然拿得到你的手机与电脑。三题答完会很清楚：要保护的设备跟要防的人在同一个屋檐下，而成本题的重点是别被发现正在准备。
- **刚加入一个团体，被交代要注意安全却不知道从哪开始**：答完再看下面的错配清单，多半会发现自己选了一堆对手却没填对应的成本。填完的清单就是一个起点。

## 跟威胁模型那篇文章的关系

[威胁模型如何建立](../basics/threat-model.md)把三题写完之后，给了一段操作流程：拿一张纸或开个协作文档，依序回答。这份清单就是那张纸的网页版。

三题的分级跟原文完全一样，资产四类、对手六级、成本三级（从随手翻看的人一路到国家级情报单位）。答完会产出一份可以复制的纯文字摘要，并列出建议先读的页面。

## 真正有用的是错配清单

三题各自看都很合理，凑在一起就未必。几种常见的凑不起来会被标出来：

- **对手选到执法或国家级，成本却填最低**：文章那句「一个你撑不到三个月的方案，等于没有方案」写的正是这种落差，两边要动一边。
- **要防亲密关系的人，却没把设备列进要保护的东西**：这一级对手最常用的路径是取得你的手机或电脑，密码与屏幕锁通常比选什么通讯软件更关键。
- **只防随意路人，却打算大改工作流程**：用大炮打蚊子，投入的力气多半几周后就放弃。
- **要保护消息来源的身份，却没把联系关系列进来**：谁跟谁通讯本身就是线索，内容加密挡不住这一层。
- **选了五个以上的对手**：一份清单对应一个场景比较有用，工作与私人生活分开写，各自都会更清楚。

一题一题答的时候不容易看出冲突，五种答案并排列出来，例如对手选到国家级却填最低成本，落差马上就跳出来。

## 答案预设不存

填的内容只留在浏览器标签页里，不写进任何一种浏览器存储空间，也不送到任何地方，刷新就回到空白。要留一份有两条路：按「复制摘要」贴到你自己选的地方，或按「存进我的暂存区」，用你的 [passkey](passkey.md) 加密存在这台设备上，跟[我的准备清单](checklist.md)同一份密文。两条都要你自己按，这一页不替你决定。下次进来，顶端会问要不要填回上次的答案。

有一种情况不提供存档：对手选了亲密关系、一国执法或国家级。他们碰得到你的设备，也可能要求你解锁，passkey 没有比屏幕锁更强。「我要防的是亲密关系的人」这种答案留在对方碰得到的设备上，正好是最不该留的东西。那时只剩「复制摘要」，贴到对方碰不到的地方。

有一项测试守着三件事：这一页自己不碰任何存储空间，存档只经 passkey 暂存区，上面那几种对手选了就不提供存档。

## 这份清单是活的

换工作、换伴侣、换城市、开始参与新议题、出现一次安全事件之后，回头再填一次。每次不用重写，只要问上次写的还准不准。

## 接下来

答完之后照着建议的页面往下读。要挑具体工具时，[工具层](../tools/index.md)每一篇都会回头对应到三题的答案。

小工具区的其他页面也对得上答案：

- 第一题选了「谁是我的消息来源」，接[隐形字符检测](invisible.md)，里面有一节写记者查证时怎么不烧掉来源
- 第二题选了「亲密关系」，接[你的浏览器透露了什么](leaks.md)看换设备之后还剩下什么线索
- 第一题选了「何时何地出现过」，接[照片 metadata 清除器](strip-metadata.md)，照片里的坐标是最常见的泄漏管道
- 第三题填了低成本，[密语与密码生成器](passphrase.md)是投入最少、效果最直接的一项

## 离线可用

跟这一区其他工具一样，程序存进设备之后没有网络也能用。域名被封、连线被切之后还打得开，正是这份清单最需要被打开的时候。

要把这一页带着走，见[离线阅读](../offline.md)。
