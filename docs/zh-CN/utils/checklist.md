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
<script src="../../js/vault.js"></script>
<script src="../../js/checklist.js"></script>

## 怎么运作

- 勾选的内容加密后放在浏览器的 IndexedDB，密钥在你的 passkey 里，解开时才在内存里出现，离开这一页就消失。所以项目的链接都开新标签页，这一页留着就不用重新解锁。
- 换设备用「导出」带走密文，另一台导进来后用同一把 passkey 解开。passkey 存在密码管理器里的话，另一台设备本来就有它。
- 这份清单只记你勾了什么跟哪一天勾的。passkey 丢了、清单打不开，重勾一次就好，这里没有备援密钥那一步。
- 文章改标题不影响已勾的项目，勾选跟着项目的内部编号走。
- [威胁模型清单](threat-model.md)是另一个清单型工具，答的是要保护什么、防谁，答案不存起来。这一页记的是做到哪一步。
