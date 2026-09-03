---
title: 本机文件加密
description: 选一个文件、输入密语，在浏览器里加密成 age 格式下载，或把 age 文件解回来。文件与密语都不离开设备，任何装了 age 命令行工具的电脑都能解开。
icon: material/lock-outline
offline_assets:
  # 加解密用的 typage 与它相依的 noble、scure 函数库是 ES module，由页面的 import map
  # 接到 vendor/age/ 底下，hooks/offline_index.py 只认 <script src>，所以逐一列在下面，
  # 读者把这一页存下来时才会一起存。清单由 tools/test_agecrypt.mjs 对照 vendor 目录。
  - utils/asian-diceware-7776.txt
  - js/agecrypt-worker.js
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

# :material-lock-outline: 本机文件加密

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

<div id="age-tool"></div>

<script src="../../js/agecrypt.js"></script>

## 怎么用

1. 把文件拖进来，或点一下选，或把一段文字贴进下面的框。工具看开头决定要做什么：age 文件或 age 的文字密文就解密，其余一律加密。
2. 输入密语。加密时可以按「抽一组密语」，会从 Asian Diceware 词表抽六个词，抄下来，关掉页面就没了。
3. 按「加密并下载」。页面会用同一组密语把输出解回来比对，一致才给下载，文件名是原文件名加 `.age`。解密时文件名去掉 `.age`。环境太慢时会先告诉你预估时间，由你决定要不要等，等的话省略比对那一趟。

输出是标准的 age 格式，任何装了命令行工具的电脑都能解开，不需要这个网站：

```
age -d -o backup.tar backup.tar.age
```

age 是什么、格式长什么样、跟 PGP 差在哪，见[什么是 age](../tools/what-is-age.md)。

## 跨设备，贴进你的密码管理器

贴一段文字进来加密，或加密文件时勾「输出成文字」，得到的是 `-----BEGIN AGE ENCRYPTED FILE-----` 开头的纯文字。把它跟密语一起存进你已经在用的密码管理器（Bitwarden、Proton Pass、1Password 的安全笔记都行），另一台设备打开这一页贴回来、输入密语就解开。跨设备同步由你信任的管理器负责，站上什么都不存。

文字形式的密文存成文件一样是标准 age 文件，命令行会自己认出来：

```
age -d -o note.txt note.txt.age
```

文字形式比二进制大三分之一，所以文件超过 64 KB 只给二进制下载。密码管理器的笔记栏位多半也收不下更大的东西。

## 密语就是全部

工具只做密语模式，没有密钥要管，代价是加密的强度完全等于密语的强度。scrypt 让每一次猜测都要花零点几秒，能拖慢暴力尝试，但对一个好猜的密语没有帮助。六个词以上、不是名言或歌词、没有在别处用过，理由见 [Asian Diceware 密语字典](../tools/asian-diceware.md)。忘了密语没有任何人能救，备份的密语自己也要备份，写在纸上放在跟备份不同的地方。

## 注意

- 整份文件在内存里处理，超过 200 MB 会先挡下。大的备份先切小，或直接用命令行工具。
- 文件名不在密文里，输出文件名是原文件名加 `.age`，别人会看到。备份取一个不透露内容的文件名。
- 用密钥（`age1` 开头的公钥）加密的文件需要对应的私钥，工具无法处理，用命令行工具解。
- 第一次使用需要联网把程序抓回来，之后会留在设备上。
- 关掉 JavaScript JIT 的浏览器算 scrypt 慢五十倍以上，桌机实测一次要 50 秒。IronFox 默认关闭，可在设置的 Security 开启。Tor Browser 的「较安全」等级也会关。工具会先量一次再告诉你预估时间，期间页面照常能操作。

## 离线可用

跟这一区其他工具一样，程序存进设备之后断网也能用，那就是文件与密语没有偷偷送出去最直接的证明。

要把这一页带着走，见[离线阅读](../offline.md)。
