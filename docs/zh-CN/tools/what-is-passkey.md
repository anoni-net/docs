---
title: 什么是 passkey
description: passkey 是存在密码管理器或钥匙串里的一把凭证，配上 PRF 扩展就能算出加密密钥。它为什么能当站上数据的钥匙、跟密语差在哪、限制在哪。
icon: material/fingerprint
---

# :material-fingerprint: 什么是 passkey

passkey 是一把存在你设备或密码管理器里的凭证。网站请它签名时，你用指纹、脸或 PIN 同意，它就签。它一般用来登录，站上的用法完全不同：没有登录，没有账号，没有服务器。我们只用它做一件事，算出加密密钥。

## 为什么 passkey 能当钥匙

WebAuthn 的 PRF 扩展让 passkey 内部多藏一把秘密，永远不离开验证器。网页每次验证附一段输入，你同意之后，验证器回传固定 32 字节的输出。同一把 passkey 配同一段输入，永远得到同一段输出。passkey 因此变成一台「只在你按指纹时才回答的密钥计算机」。

站上的[本机文件加密](../utils/age.md)拿这段输出去包 age 的 file key。没有 passkey 就算不出密钥，数据就是一堆密文。这跟「验证通过才显示」完全不同，后者是写在网页里的门禁，谁都绕得过。前者是数学。

## 跟密语差在哪

| | 密语 | passkey |
|---|---|---|
| 要记什么 | 一组六个词以上的密语 | 不用记，指纹或 PIN |
| 强度来源 | 密语本身，scrypt 拖慢猜测 | 验证器里的随机秘密，猜不了 |
| 跨设备 | 密语跟着人走 | passkey 要同步过去，只在同步的设备上有 |
| 能在哪里解 | 任何装了 age 命令行工具的电脑 | 只有 anoni.net 的网页，而且浏览器要支持 |
| 丢了怎么办 | 忘了就永远打不开 | 丢了就永远打不开，所以要有备援密钥 |
| Tor Browser | 可以 | 不行，WebAuthn 整个关闭 |

密语模式的文件在任何地方都解得开，passkey 模式的文件绑在这个域名与你的设备上。两种模式输出的都是标准 age 文件，只是收件人不同。

## 限制

passkey 绑在 `anoni.net` 这个 RP ID 上。浏览器只允许在同一个域名使用，镜像站与 onion 地址用不了。Tor Browser 整个关闭 WebAuthn，`security.webauth.webauthn` 在它的默认配置里是 false。

PRF 扩展的支持面到 2026 年 3 月：macOS 15 以上的 Safari 18、Chrome 132、Firefox 139，iOS 18.4 以上，Android 的 Chrome 配 Google 密码管理器，Windows 11 要 2026 年 2 月的更新之后。1Password、Bitwarden、Dashlane 支持。Firefox Android 与 Windows 10 不支持。

passkey 丢了、密码管理器的账号没了、换到不支持 PRF 的环境，数据就永远打不开。所以站上的流程强制搭一把 X25519 备援密钥，文件同时加密给 passkey 与它。备援密钥放在跟密文不同的地方。

## 站上存了什么

什么都没有。浏览器基于隐私不让网页查询「这个域名有没有 passkey」，任何查询都会跳提示。所以站上连你有没有建过都不知道，passkey 页每次打开都是空的。每一次算密钥都要你当场同意。

## 相关阅读

- [passkey 钥匙](../utils/passkey.md)：创建、试解锁、生成备援密钥。
- [什么是 age](what-is-age.md)：passkey 包的是 age 的 file key。
- [本机文件加密](../utils/age.md)：选「passkey」模式。
