---
title: 端对端加密的保护范围
description: 传输加密、端对端加密与存储加密各自能防范谁，以及备份、metadata、手机号注册与安全码这些加密范围之外的环节。
icon: material/key-chain-variant
---

# :material-key-chain-variant: 端对端加密的保护范围

App 标示「已加密」，服务商仍可能读取你的消息。加密有好几种，差别在密钥放在谁手上。密钥在服务商那里，服务商就能解开内容。密钥只在你和对方的设备上，服务商经手的只是一串无法解读的数据。端对端加密（End-to-End Encryption，E2EE）属于后者，保护的是消息内容，备份、通联记录与账号身份都在范围之外，要另外处理。

## 三种加密的界线

| 加密方式 | 能防范 | 无法防范 | 常见例子 |
|---|---|---|---|
| 传输加密 | 连接路径上的人，例如同一个 Wi-Fi 的其他用户、网络运营商 | 服务本身，数据到了服务器就解开 | 网址开头的 HTTPS、超过 50 人的 LINE 群组、云端 AI 服务 |
| 端对端加密 | 路径上的人与服务商 | 双方的设备被取得或被入侵、通联记录（metadata） | Signal、LINE 的一对一聊天 |
| 存储加密 | 硬盘或服务器被偷走时想读取数据的人 | 持有密钥的一方，密钥由服务商保管时服务商可以读取 | 手机与电脑的设备加密、一般的云盘 |

### 传输加密

浏览器地址栏的 HTTPS 就是传输加密（TLS），保护你的设备到服务器之间的那一段。同一个咖啡店 Wi-Fi 的人、网络运营商可以看到你连到哪个网站，无法读取内容。数据抵达服务器之后就解开了，服务商可以读取、保存，也可以在司法协助请求下提供。云端 AI 服务属于同一种模型，服务需要读取你的输入才能回应（见[用 AI 工作时怎么避免数据外泄](../tools/ai-privacy.md)）。

### 端对端加密

消息在你的设备上加密，只有对方的设备能解开，中间的服务器只负责转发，手上没有密钥。服务商收到调取要求，也无法交出消息内容。保护的范围到两端的设备为止，手机被拿走又被解锁时，聊天记录一样可以直接读取。

### 存储加密

手机与电脑的设备加密，在设备遗失或被偷时保护里面的文件。云盘多半也会加密存放的文件，但密钥由服务商保管，服务商自己仍然可以读取。要让服务商也无法读取，需要改用端对端加密的服务，例如 [CryptPad](../tools/what-is-cryptpad.md)，或是上传前先用 [age](../tools/what-is-age.md) 这类工具在自己的设备上加密。

## 双方共用密钥的产生方式

两个人只能通过服务器传话，却要协商出一把服务器不知道的密钥，常见的比喻是混色。双方从同一个公开的基底色出发，各自加入只有自己知道的秘密色，再把混合后的颜色交给对方。两人把收到的混合色加上自己的秘密色，最后手上的颜色相同，中间经手的人只看过混合色，无法在合理时间内反推出秘密色。数学上这套方法叫 Diffie-Hellman 密钥交换。

Signal 这类工具每传一条消息就换一把密钥，今天的密钥被偷，昨天的消息仍然无法解开，这项性质叫前向保密。Double Ratchet、群组加密与各种协议的比较，写在社区首页的[端对端加密的协议机制](https://anoni.net/zh-cn/articles/e2ee-protocols/){target="_blank"}。

## 加密范围外的 metadata

端对端加密保护消息内容，谁在什么时间发消息给谁、多久发一次、从哪个 IP 连接，这些 metadata 仍然经过服务器。光是通联关系就能还原一个人的社交网络与作息（见 [Metadata 是什么，为什么重要](./metadata.md)）。Signal 的 Sealed Sender 隐藏单条消息的发件人，账号本身的 metadata 仍留在服务器上。LINE 的通联记录全部经过服务器。SimpleX、Session 从设计上减少服务器端取得的信息，各自的取舍见[匿名通讯工具比较](../tools/messaging-comparison.md)。

## 多设备与备份的取舍

手机、平板、电脑要同时看到同一段对话，或换手机时要带走旧消息，密钥就需要离开原本的那台设备。常见的做法有三种：

- **关联设备**（Signal、WhatsApp）：每台设备各自有密钥，新设备扫描主设备上的二维码加入。隐私保护最好，新设备通常看不到加入之前的消息，除非主设备另外传送过去
- **加密云端备份**（WhatsApp、iMessage）：消息记录用你设定的密码或密钥加密后存到云端。换手机方便，安全程度取决于密码强度，服务商被入侵时，所有人的密文集中在同一处
- **所有设备共用一把长期密钥**（早期的 iMessage、部分企业通讯软件）：同步最简单，任何一台设备被偷，全部对话都会曝光

Telegram 的私密聊天（Secret Chats）走相反的路，只存在参与对话的两台设备上，没有云端备份，换手机就无法带走。

Signal 在 2025 年 9 月推出加密备份（Secure Backups），先在 Android 的 beta 版提供，2026 年 9 月 iOS 版上线时各平台都已提供[^1]。解开备份的是一组在你的设备上产生的 64 个字符的恢复密钥，Signal 的服务器不会取得这组密钥，遗失时 Signal 也无法替你找回。免费方案涵盖全部的文字消息与最近 45 天的媒体，更早的媒体需要每月 US$1.99 的付费方案。

## LINE 与 Signal 的在地脉络 { #在地脈絡正體中文社群為何用-Signal-與-Matrix }

台湾与日本最普及的通讯软件是 LINE。LINE 的端对端加密叫 Letter Sealing，2015 年以可选功能推出，2016 年扩及群组，同年起在主要的客户端默认开启，2021 年起无法手动关闭[^2]。一对一的文字、媒体与语音、视频通话都受到保护，以下几种情况只有传输加密，LINE 在司法协助请求下可以提供内容：

- 超过 50 人的群组
- 有官方账号或聊天机器人加入的聊天室，从加入那一刻起的消息
- 群组语音通话、群组视频通话与 LINE Meeting

LINE 的客户端不开源，密钥管理无法由第三方独立审计，metadata 也全部经过服务器。

香港最普及的通讯软件是 WhatsApp。《国安法》之后，通讯与社交平台上的记录成为国安、煽动案件的证据来源[^hk]，威胁模型要对应国安监控，不只是一般的司法协助请求。中国大陆以微信为主，微信没有端对端加密，账号采实名注册，跟这一页谈的其他工具属于不同的类别。

各地主流平台的落差多半集中在群组加密与 metadata 两处。匿名网络社区 anoni.net 建议两条路：

- **Signal**：一对一与小群组的首选，操作接近主流的通讯软件，门槛低
- **Matrix**：开源、联邦式、可以自建，适合群组与社区讨论，anoni.net 也自建了一台服务器

在敏感的工作情境，两条路的差异会更明显，见[记者保护消息来源](../scenarios/journalist.md)、[社运行动者的数字准备](../scenarios/activist.md)与[家暴受害者的数字准备](../scenarios/domestic-violence.md)。

## Signal 的手机号与免手机号注册

Signal 的账号长期建立在手机号上。在中国大陆、香港、澳门、台湾办理手机号都要实名登记，消息加密得再严密，账号通过运营商的登记数据仍然对应到本人。Signal 从 2024 年起提供 username，联系人之间可以只交换 username，号码也可以设成不对任何人显示，但 Signal 的服务器上仍然记着每个账号绑定的号码[^3]。

2026 年 9 月，Signal 在 Android 的 beta 版开放不需要手机号的注册方式 Signal Login，改收一笔一次性的费用（说明页写 US$2.99），目前只能通过 Google Play 付款[^4]。付款与账号之间用零知识证明切开，Signal 对不回是哪一笔付款建立了哪个账号，但付款日期仍然跟着账号存下来，Google 也留有购买记录。用手机号注册仍然免费，也仍是主要的注册方式，正式版与 iOS 的时程截至 2026 年 9 月都还没有公布。付款记录会留下什么、依威胁模型如何选择，见[Signal 免手机号注册与付款记录](../blog/posts/2026-signal-login-numberless.md)。

## 安全码的核对

端对端加密保证只有对话的两端能解开消息，前提是另一端真的是对方。Signal 为每段对话产生一组安全码（safety number），在对方的个人资料页点「查看安全码」，可以当面互扫二维码，或通过另一条可信的渠道比对那串数字。

收到安全码变更的通知，代表对方的密钥换了，可能只是换手机或重新安装，也可能是账号被别人接管。先停下来，通过另一条渠道确认过再继续谈敏感的事。

Signal 在 2026 年 8 月推出自动密钥验证，由 App 与第三方审计方确认联系人的公钥在整个系统中一致，无需另约时间当面核对。功能需要你手上有对方的电话号码，只通过 username 联系的对象仍要用安全码核对，限制与做法见[介绍 Signal 自动密钥验证](../blog/posts/signal-automatic-key-verification.md)。

## 相关阅读

- [匿名通讯工具比较](../tools/messaging-comparison.md)：Signal、SimpleX、Session、Briar、Matrix 的身份绑定、metadata 与群组设计
- [Metadata 是什么，为什么重要](./metadata.md)：消息加密之后仍然暴露的通联关系
- [什么是匿名网络？](../tools/what-is-anonymity-network.md)：隐藏连接来源的另一层保护
- [端对端加密的协议机制](https://anoni.net/zh-cn/articles/e2ee-protocols/){target="_blank"}：Double Ratchet、Sender Keys、MLS 与四种协议的对照
- [后量子密码概观](https://anoni.net/zh-cn/articles/post-quantum/){target="_blank"}：量子计算机对现有加密的威胁与迁移时程
- [零知识身份验证与支付](https://anoni.net/zh-cn/articles/zk-identity-payments/){target="_blank"}：证明身份或付款而不透露其他信息的密码学方法
- [记者保护消息来源](../scenarios/journalist.md)、[社运行动者的数字准备](../scenarios/activist.md)：加密通讯在实际情境里的用法
- [中文化与文件翻译](../community/i18n.md)：欢迎一起参与文档站的翻译

[^1]: [Introducing Signal Secure Backups](https://signal.org/blog/introducing-secure-backups/){target="_blank"} - Signal
[^2]: [LINE Encryption Report](https://www.lycorp.co.jp/en/privacy-security/security/transparency/encryption-report/2025/){target="_blank"} - LY Corporation
[^3]: [Keep your phone number private with Signal usernames](https://signal.org/blog/phone-number-privacy-usernames/){target="_blank"} - Signal Blog
[^4]: [Phone Numberless Registration for Android](https://support.signal.org/hc/en-us/articles/11197884108826-Phone-Numberless-Registration-for-Android){target="_blank"} - Signal Support
[^hk]: 香港《国安法》后的监控与言论起诉脉络见 [Internet censorship in Hong Kong](https://hongkongfp.com/2024/10/12/internet-censorship-in-hong-kong/){target="_blank"} - Hong Kong Free Press、[Hong Kong: New Security Law a Full-Scale Assault on Rights](https://www.hrw.org/news/2024/03/19/hong-kong-new-security-law-full-scale-assault-on-rights){target="_blank"} - Human Rights Watch。
