---
title: 我的准备清单
description: 把站上的行动建议收成一份可勾的清单，勾选状态用 passkey 加密存在你自己的设备上。没有账号、没有服务器，站上什么都不存。
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

# :material-checkbox-marked-outline: 我的准备清单

[一般人平常该做到什么](../scenarios/everyday-baseline.md)跟[出差与研讨会的数字准备（东亚与东南亚）](../scenarios/asia-travel.md)列了该做的事，做到哪里没有地方记。这一页把那些小标题收成一份清单，勾了就加密存在这台设备上，钥匙是你的 passkey，下次按一次指纹就看得到进度。站上什么都不收，我们连你有没有清单都不知道。

还没有 passkey 的话，先到[passkey 钥匙](passkey.md)创建一把，或直接在下面创建。passkey 是什么、限制在哪，见[什么是 passkey](../tools/what-is-passkey.md)。

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

## 怎么运作

- 勾选的内容加密后放在浏览器的 IndexedDB，密钥在你的 passkey 里，解开时才在内存里出现，离开这一页就消失。所以项目的链接都开新标签页，这一页留着就不用重新解锁。闲置 5 分钟会自动锁上，锁之前会先把勾选存好，离开前还是按一下「锁上」。
- passkey 存在会同步的地方（iCloud、Google、Bitwarden）的话，另一台打开就有，什么都不用做。要搬的是这台设备上的数据：用「导出」带走密文，另一台导进来后用同一把 passkey 解开，或按「传到另一台」，用 [QR 影格串流](qr-stream.md)直接播给另一台扫，收齐之后那一页会给一颗「导入我的准备清单」，两台不需要共用网络。
- 这份清单只记你勾了什么跟哪一天勾的。passkey 丢了、清单打不开，重勾一次就好，这里没有备援密钥那一步。
- 文章改标题不影响已勾的项目，勾选跟着项目的内部编号走。
- 「每年重看」那一组是文章里一年一次的检查那九题。任何项目超过一年没动会标出来，「只看超过一年没动的」把清单缩成该重看的那几项，按「今天确认过」把日期换成今天。
- passkey 没有同步到另一台时（例如手机用 iCloud 钥匙串、电脑用 Windows Hello），这台解开后按「登录另一台设备」，会显示一个 QR code 与一串字，限时一分钟。另一台按「用另一台的钥匙登录这台」拍照或贴上，就创建出一把用同一份钥匙的 passkey。登录完数据还在原来那台，再用「传到另一台」搬。那串就是数据密钥本身，只在自己的两台设备之间用，被拍到就收不回来，也没有换掉的功能，只能清掉暂存区重建一把。
- 这里的加密强度等于保管 passkey 的地方：要防的人碰得到这台设备、又知道解锁密码或密码管理器的主密码，他一样看得到你勾了什么。那种处境先读[家暴受害者的数位准备](../scenarios/domestic-violence.md)，考虑不在这台设备上留任何准备的痕迹。
- [威胁模型清单](threat-model.md)是另一个清单型工具，答的是要保护什么、防谁，答案不存起来。这一页记的是做到哪一步。
