---
title: 什么是 age
description: age 是 2019 年出现的文件加密格式与工具，规范只有一页长，没有选项可以设错，密钥只有一行。介绍它怎么用、格式长什么样、跟 PGP 差在哪，以及站上规划中的本机文件加密工具为什么选它而非 PGP。
icon: material/file-key-outline
---

# :material-file-key-outline: 什么是 age？

出门前要把备份加密后放上云端，或者要把一份文件交给另一个人，多数人第一个想到 PGP，然后在生成密钥、导入公钥、决定信任等级那几步放弃。[age](https://github.com/FiloSottile/age){target="_blank"} 是为「把一个文件加密给某个人或某组密语」重新设计的工具：密钥只有一行，没有选项，一个文件格式，规范只有一页长。

站上规划中的[本机文件加密工具](https://github.com/anoni-net/docs/issues/421){target="_blank"}输出的就是 age 格式。这一页先说明 age 是什么、怎么用、跟 PGP 差在哪，以及为什么选它。

## age 是什么

age 由 Go 语言密码学函数库的维护者 Filippo Valsorda 设计，2019 年公开，格式规范由 [C2SP](https://github.com/C2SP/C2SP/blob/main/age.md){target="_blank"} 社区规范计划维护，网址就是格式的第一行 `age-encryption.org/v1`。作者对它的描述是「简单、现代、安全的文件加密工具、格式与函数库」，设计目标写得很直白：小而明确的密钥、没有设置项、能跟 UNIX 管道组合。

三种实现可以互相解开彼此的文件：

- [age](https://github.com/FiloSottile/age){target="_blank"}：Go 写的参考实现与命令行工具。
- [rage](https://github.com/str4d/rage){target="_blank"}：Rust 实现，命令行界面相同。
- [typage](https://github.com/FiloSottile/typage){target="_blank"}：TypeScript 实现，在浏览器里也能执行，站上的工具会用它。

插件机制让硬件密钥（例如 YubiKey）也能当收件人，命令行工具另外支持直接用 SSH 公钥加密。2025 年之后规范加入了后量子混合密钥的收件人类型，命令行工具用 `-pq` 开启。

## 怎么用

安装：macOS 与 Linux 用 `brew install age`，Debian 12 之后 `apt install age`，Windows 用 `winget install --id FiloSottile.age`。

密语模式，不需要任何密钥：

```
age -p -o backup.tar.age backup.tar
age -d -o backup.tar backup.tar.age
```

第一行会问你密语两次，第二行解密时问一次。密语的强度就是整份加密的强度，用[密语生成器](../utils/passphrase.md)抽六个词以上，理由见 [Asian Diceware 密语字典](./asian-diceware.md)。

公钥模式，把文件加密给某个人：

```
age-keygen -o key.txt
age -r age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p -o file.age file
age -d -i key.txt -o file file.age
```

`age-keygen` 生成的私钥文件里附着公钥，那一行 `age1` 开头的 62 个字符就是可以公开贴给别人的收件人。`-r` 可以重复给好几个收件人，同一份密文任何一位都能解开。加上 `-a` 输出会变成纯文本，可以贴进邮件或聊天窗口。

## 格式长什么样

age 文件的前面几行是纯文本，用文本编辑器打开就能看见：

```
age-encryption.org/v1
-> X25519 <一段 base64 的临时公钥>
<一段 base64>
--- <header 的验证码>
```

第一行是版本。中间每一段 `->` 开头的叫收件人段落，一位收件人一段，里面是用该收件人的密钥包起来的文件密钥。密语模式只有一段，类型是 `scrypt`，带着 16 字节的盐与工作因数。`---` 那一行是整个 header 的 HMAC-SHA-256，改动任何一段都会被发现。

header 之后是密文本体。内容用 ChaCha20-Poly1305 切成每 64 KiB 一段加密，每一段都有自己的验证标签，段落顺序与最后一段都编进 nonce 里。这代表三件事：任何一个字节被改过都会在解密时被拦下，大文件可以边读边解，不必整份载入内存，以及密文比原文件大一点（每 64 KiB 多 16 字节，加上 header）。

公钥模式的收件人段落只含一个临时公钥，不含收件人自己的公钥，所以从密文本身无法看出是加密给谁，只看得出有几位收件人。这一点跟 PGP 默认把收件人的密钥 ID 写进密文不同。

## 跟 PGP 差在哪

PGP 是 1991 年的软件，OpenPGP 是它的公开标准，[RFC 9580](https://www.rfc-editor.org/rfc/rfc9580){target="_blank"}（2024 年）是最新版，取代 2007 年的 RFC 4880。它做的事比 age 多得多：加密、签名、身份、信任网、密钥服务器，一份密钥上挂着名字、电子邮件、期限与好几把子密钥。

| | age | OpenPGP |
|---|---|---|
| 做的事 | 只加密文件 | 加密、签名、身份与信任网 |
| 算法 | 固定一组：X25519、ChaCha20-Poly1305、scrypt、HMAC-SHA-256 | 多种可选，双方协商 |
| 密钥长什么样 | 一行 62 个字符 | 一个区块，上千字符，含身份与期限 |
| 设置项 | 没有 | GnuPG 的配置文件有上百项 |
| 完整性 | 每 64 KiB 一段验证，改一个字节就解不开 | 旧格式的 MDC 只给警告，2024 年起才有 AEAD |
| 签名 | 没有 | 有 |
| 密文透露收件人 | 不透露 | 默认写进密钥 ID，要另外开选项才藏 |
| 规范长度 | 一页 | 上百页 |
| 实现 | Go、Rust、TypeScript 三份互通 | GnuPG 为主，其余实现各自覆盖部分规范 |

两件 PGP 的历史值得知道。1999 年的可用性研究「Why Johnny Can't Encrypt」找了十二个人用 PGP 5.0 寄一封加密信，多数人在九十分钟内无法完成，还有人把私钥寄了出去。2018 年的 [EFAIL](https://efail.de/){target="_blank"} 攻击利用旧格式的密文可以被改动、邮件软件对验证失败只给警告照样显示这两件事，把加密邮件的内容从 HTML 外链里偷出来。两者的根源相同：选项太多、能设错的地方太多、规范留给实现的自由度太大。age 的设计就是把那些地方全部拿掉。

age 也放弃了几件事。它不签名，能解开一个文件不代表知道是谁加密的，来源要用别的方式确认。它没有身份与信任模型，对方的公钥要通过你信任的渠道取得，通常是当面或既有的加密通讯。两者都没有前向保密：私钥或密语一旦泄漏，过去所有用它加密的文件都能被解开。

## 为什么站上的工具选 age

读者三年后要解一份备份时，手上可能只剩一台装了命令行工具的电脑，网站还在不在都不一定。age 是公开格式，三份独立实现互通，任何一台电脑都能解开，这是选公开格式而非自定义格式的全部理由。

在公开格式里选 age 而非 PGP，理由是上面那张表的每一行都指向同一件事：没有选项就没有设错的机会，规范短就能在浏览器里实现得小而能审，密语模式不需要任何密钥管理。站上的工具只做密语模式，读者要做的事只有选文件、输入密语、下载。

PGP 留在它该在的地方。站上的[敏感数据上传](../community/upload-sensitive.md)流程用 PGP，因为那里需要长期的身份、要跟邮件生态兼容，而且对方是已经在用 PGP 的记者与组织。分工是：邮件与身份用 PGP，文件与备份用 age。

## 注意

- 密语模式的安全全在密语。scrypt 让每次猜测变慢，但无法抵挡一个弱密语。
- 文件名不在密文里，你把加密文件存成什么名字，别人就看到什么名字。备份取一个不透露内容的文件名。
- 密文大小约略反映原文件大小，藏不了文件有多大。
- 解密后的文件落在磁盘上就是明文，用完要删，磁盘本身没有全盘加密的话删了也可能被还原。

## 相关阅读

- [Asian Diceware 密语字典](./asian-diceware.md)：密语模式要配够强的密语
- [密语与密码生成器](../utils/passphrase.md)：在浏览器里抽一组，不送出任何数据
- [端对端加密](../advanced/e2ee.md)：加密在传输与存储两端各解决什么
- [网络中断时的准备与应对](../scenarios/shutdown.md)：加密备份要断网也解得开，age 不需要联网
- [敏感数据上传](../community/upload-sensitive.md)：站上用 PGP 的地方
