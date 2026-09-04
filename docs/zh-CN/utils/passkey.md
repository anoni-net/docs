---
title: passkey 钥匙
description: 创建一把 anoni.net 的 passkey，存进你的密码管理器或钥匙串，试一次解锁，再生成备援密钥。没有账号、没有服务器，站上什么都不存。
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

# :material-fingerprint: passkey 钥匙

创建一把 anoni.net 的 passkey，存进你的密码管理器或钥匙串。之后站上要保护你的数据时，就请它算出密钥，每一次都要你用指纹或 PIN 同意。没有账号、没有服务器、没有任何识别码离开设备。passkey 是什么、为什么能当钥匙、限制在哪，见[什么是 passkey](../tools/what-is-passkey.md)。

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

## 怎么用

1. 按「创建 passkey」，浏览器会问你要存到哪里。存到会同步的地方（iCloud 钥匙串、Google 密码管理器、Bitwarden、1Password），其他设备才能用同一把。
2. 按「试解锁」，确认指纹或 PIN 的流程顺畅。在另一台同步过的设备上再按一次，确认那边也能用。
3. 按「生成备援密钥」，把私钥存进密码管理器，放在跟密文不同的地方。公钥是加密时要贴的「备援密钥」。

做完就到[本机文件加密](age.md)，选「passkey」模式。

## 这把钥匙能做什么

做完上面三步，你手上有两样东西：一把存在密码管理器或钥匙串里的 passkey，以及一组备援密钥。

站上目前用得到它的只有[本机文件加密](age.md)。钥匙切到「passkey」之后，加密时按一次指纹就好，不用想密语也不用打字。加密时预设会同时加密给 passkey 与备援密钥，两把任何一把都开得了。备援那一把可以取消，取消之后只有 passkey 开得了，代价写在加密工具的画面上。

一个实际的例子：[威胁模型自我检查](threat-model.md)产出的摘要写着你要防谁、手上有什么，那一页刻意不把答案存进设备，决定要留一份的时候就用这把钥匙包成密文再存。

有几种情况还是该用密语模式：

- 要在别台电脑用 age 命令行解开，而那台电脑没有你的 passkey
- 要给别人，对方不可能有你的 passkey
- 你用 Tor Browser，它整个关闭 WebAuthn
- 你要用的设备不支持 PRF，见下面的表格

两种模式输出的都是标准 age 文件，差别只在收件人是谁。同一份资料两种各做一份、放在不同地方，也是可以的。

## 存到哪里

| 存放位置 | 会不会同步到其他设备 | PRF 支持 |
|---|---|---|
| iCloud 钥匙串 | 会，Apple 设备之间 | macOS 15、iOS 18.4 以上 |
| Google 密码管理器 | 会 | Android 的 Chrome |
| Bitwarden、1Password、Dashlane | 会 | 支持 |
| Windows Hello | 只在这台电脑 | Windows 11 加 2026 年 2 月更新之后 |
| USB 安全密钥 | 带着走 | 本页不支持，它需要另一种保管方式 |

## 两台以上的设备

passkey 模式的文件同时加密给 passkey 与备援密钥，所以跨设备有两条路，代价不一样。

### 让 passkey 跟着你走

存在 iCloud 钥匙串、Google 密码管理器、Bitwarden、1Password 这类会同步的地方，另一台设备打开网站就直接解得开，什么都不用贴。代价是那个密码管理器的账号变成单点，账号没了，所有设备上的钥匙一起没。

### 用备援私钥开

Windows Hello 这种只留在本机的环境，另一台设备上没有那把 passkey，解密时要把备援私钥贴进去。这条路不依赖任何云端账号，代价是私钥会比较常出现在剪贴板与屏幕上，而它一旦外流，加密就等于没做。

主力设备用会同步的 passkey，备援私钥收在密码管理器里当最后一道，两者放在不同地方，是多数人适用的安排。

## 注意

- passkey 绑在 `anoni.net` 这个域名。镜像站、onion 地址用不了，Tor Browser 整个关闭 WebAuthn。
- passkey 丢了、密码管理器的账号没了，只剩备援密钥能开。备援密钥也丢了就永远打不开，没有任何人能救。
- 站上不会存任何跟 passkey 有关的东西，也查不出你有没有建过。页面每次打开都是空的，刻意如此。
- 第一次使用需要联网把程序抓回来，之后会留在设备上。
