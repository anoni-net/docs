---
date: 2026-09-25
authors:
    - anoni-net
categories:
    - 技术
    - 隐私
slug: 2026-signal-login-numberless
image: "https://assets.anoni.net/blog/2026-signal-login-numberless.webp"
summary: "Signal 在 Android beta 开放不绑手机号的注册方式 Signal Login，改收一笔约 3 美元的一次性费用。付款沿用捐款系统的零知识证明，Signal 对不上哪一笔付款建立了哪个账号，但付款日期仍跟着账号存下来，Google Play 也留有「你买过」的记录。文中整理付款与账号之间被切断与仍然留着的环节，以及依不同担心的做法。"
description: "Signal Login 让 Android 用户付费注册、不必绑手机号。说明付款记录会留下什么、查不到什么，以及依威胁模型决定要不要用、用什么方式付款。"
---

<!-- zh-CN：Claude Code 候选稿，待人工校对（词汇差异与政治措辞） -->

# :material-message-lock-outline: Signal 免手机号注册与付款记录

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/2026-signal-login-numberless.webp" target="_blank">
        <img src="https://assets.anoni.net/blog/2026-signal-login-numberless.webp"
            alt="木桌上一只钱包露出现金与卡片，旁边放着一部手机与一串钥匙"
            style="border-radius: 5px;">
    </a>
    <figcaption markdown="span">图片：钱包、手机与钥匙，对应用付款与密钥取代手机号的注册方式。摄影 Towfiqu barbhuiya，来源 [Pexels](https://www.pexels.com/photo/brown-wallet-beside-the-blue-and-black-smartphone-9053308/){target="_blank"}（Pexels License）。</figcaption>
</figure>

在中国大陆、香港、澳门、台湾办理手机号，包括预付卡，都要实名登记，中国大陆的 SIM 卡自 2019 年底起还强制实名加人脸。Signal 的账号建立在手机号上，消息加密得再严密，账号通过运营商的登记数据，仍然对应到一个有名有姓的人。东亚与东南亚多数地方的手机号也采实名制。对记者的消息来源、跨境工作的倡议者，以及不想让账号连回本人的用户来说，绑手机号一直是 Signal 最常被提到的限制。

2026 年 9 月，Signal 在 Android 的 beta 版开放一种不需要手机号的注册方式 Signal Login，代价是一笔一次性的小额付款。消息传开后，不少人担心付款记录会把身份带回来。Signal 用捐款系统的零知识证明，让账号对不回是哪一笔付款，但付款日期仍然跟着账号存下来，Google 那端也留有「你买过」的记录。要不要用、用什么方式付款，取决于你担心的是哪一种追查。

<!-- more -->

!!! info "撰写时的状态"

    本文依 2026 年 9 月 Android beta 的状态撰写（8.28.1 起开放，9 月 23 日的最新 beta 为 8.28.4），价格、付款方式与 iOS 时程在正式版推出前都可能调整，更新时会补在文末。

## 手机号在 Signal 账号上的角色

Signal 从 2024 年起提供 username[^1]，联系人之间可以只交换 username，号码也可以设成没有人看得到、没有人能用号码搜索到。设了 username 之后别人看不到号码，但 Signal 服务器上仍然记着每个账号绑定的号码。

依 Signal 公开的政府调取记录，Signal 能提供的数据只有账号的注册时间与最后一次连接的日期[^2]，消息内容、联系人与群组都不在其中。执法机关手上只要有手机号，就能向 Signal 查询号码有没有注册、何时注册，再向运营商取得登记数据。这份范围来自 Signal 自己公布的调取回应，反映的是服务器目前保存的数据，并非密码学上的保证，系统设计改变时范围也会跟着改变（Signal Login 就新增了一笔，见后文）。

手机号还带来另一层风险。注册验证靠短信，SIM 卡被盗换（SIM swap）或验证短信被拦截时，别人可能用你的号码重新注册账号。Signal 的注册锁（Registration Lock）可以挡下这种情况，但要用户自行开启。Signal Login 没有手机号，也就没有这条短信验证的路径。

## Signal Login 的注册流程

Signal 的 Android 开发者 Greyson Parrelli 在 9 月 16 日于 Signal 社区论坛公告 Signal Login[^3]。功能目前只开放给 Android beta 的测试者，正式版与 iOS 的时程都还没有公布。

注册时选择不使用电话号码注册（Register Without Phone Number），再付一笔一次性的费用。说明页写的是 US$2.99，论坛公告写约 3 美元，各国价格可能不同。付款完成后，Signal 产生一组 32 个字符的 Account ID 与一组 64 个字符的密钥（论坛公告称 Account Key，说明页称 Recovery Key）[^4]，两者相当于账号与密码，取代手机号成为登录的身份。

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/2026-signal-login-numberless-screen.webp" target="_blank">
        <img src="https://assets.anoni.net/blog/2026-signal-login-numberless-screen.webp"
            alt="Signal App 的 Your Signal Login 画面，说明购买完成、忘记登录信息就无法恢复账号，下方一张蓝色卡片列出 Account 与 Recovery 两组字符串，只显示末四位，底下有存入密码管理器与手动保存两个按钮"
            style="border-radius: 5px; max-width: 320px;">
    </a>
    <figcaption markdown="span">付款完成后显示的 Signal Login 画面，Account 与 Recovery 各只显示末四位。图片来源：[Signal Support](https://support.signal.org/hc/en-us/articles/11197884108826-Phone-Numberless-Registration-for-Android){target="_blank"}。</figcaption>
</figure>

收费是为了阻挡垃圾账号，公告的原话是「如果免费，垃圾消息发送者会大量取得这种账号，毁掉我们的网络」[^3]。用手机号注册仍然免费，也仍然是主要的注册方式，付费注册是另外加上的选项。

Account ID 与密钥同时取代了原本的 Signal PIN，遗失就无法恢复账号，Signal 没有其他恢复渠道，建议存入密码管理器。

账号可以加上 TOTP 两步验证（Google Authenticator 这类 App 产生的一次性密码）。设置之后，别人即使取得 Account ID 与密钥，没有一次性密码也无法在另一台设备登录[^11]，产生密码的 App 最好放在另一台设备上。反过来，所有两步验证的设备都遗失时，账号会永久锁住，论坛公告建议设置不只一个[^3]。

没有手机号，朋友手机通讯录里的号码也不会自动匹配到你的账号。username 是选配，不设的话别人无法找到你，只能由你主动发起对话。Signal Desktop 这类关联设备的用法与手机号账号相同。目前只有新账号能用这种方式注册，已经绑手机号的账号无法移除号码。

## 付款与账号之间的零知识凭证

Signal Login 的付款沿用 Signal 捐款系统的零知识证明（zero-knowledge proof，证明自己符合某个条件、却不透露其他信息的密码学方法）[^3]。依 Signal 捐款常见问题的说明，付款之后 App 向服务器取得一张凭证，服务器能验证出示凭证的人属于付过款的那群人，但凭证里没有能对应到某一笔付款的信息[^5]。Signal 的私密群组用的也是同一套匿名凭证机制。

套用到注册流程上，Signal 的服务器有一笔 Signal Login 的付款记录，也有一个新账号出示了有效的凭证，凭证本身对不回是哪一笔付款，但付款日期仍然留了下来。

Signal 服务器的源代码是公开的。签发凭证时，凭证的到期日由 Google Play 的付款时间加上五年算出，只取到日期[^6]。账号建立时，服务器把凭证的到期日连同账号编号一起写入数据库[^7]，到期日往回减五年就是付款那一天。另一张数据表保存每一笔 Google Play 购买的标识符与同一个到期日，保存到到期后 30 天[^10]。从 Signal 手上的数据，可以推回每个 Signal Login 账号是哪一天付款的，也能列出当天每一笔购买的标识符。Google 再把标识符对回各自的 Google 账号，同一天付款的人就成了一份具名的名单。

## 付款端留下的记录

前一段的切断只发生在 Signal 服务器上，付款本身走 Google Play 的 App 内购买。依论坛公告，目前只接受这种付款方式，之后会加上其他方式[^3]。Google 的记录跟任何一笔 App 内购买一样，记着哪个 Google 账号、什么时间、向 Signal 买了什么。

| 谁手上有记录 | 查得到 | 查不到 |
|---|---|---|
| Google | 某个 Google 账号在某个时间买了 Signal Login | 买完之后建立的是哪个 Signal 账号 |
| 发卡银行或运营商 | 一笔付给 Google Play 的款项，账单上可能带有 App 名称 | 同上 |
| Signal | 每个 Signal Login 账号的付款日期（以日计）、注册时间、每一笔购买的 Google Play 标识符 | 账号是哪一笔付款建立的 |

付款记录最多只能证明你买过，也就是你很可能有一个不绑手机号的 Signal 账号。单凭付款记录查不到是哪一个账号，更查不到账号里的联系人与消息，要缩小范围需要把 Google 与 Signal 两边的数据合起来比对（见下一节）。手机号的情况不同，号码本身就是账号的标识符，取得号码就能直接对应到账号。

Signal 与 Google Play 在中国大陆都被封锁，境内用户需要先翻墙才能使用，付款方式以下以台湾的 Google Play 为例。付款方式决定付款记录连回本人的程度，台湾 Google Play 常见的付款方式有以下几种[^8]：

- 信用卡或借记卡：发卡银行开户时做过实名审核（KYC），记录直接对应到本人
- 运营商账单代付：费用并入手机号的账单，付款记录回到原本想避开的手机号上
- PayPal 与便利店付款：两者都连到账户，便利店付款需要先绑定玉山 e-Pay，并不等于在便利店用现金付款
- Google Play 礼品卡：在便利店用现金购买后充值，付款不经过银行与运营商

礼品卡只处理了金流，Google 账号通常绑着手机号码或其他邮箱，设备登录 Google Play 也会留下记录。要让 Google 账号也与本人脱钩，需要另外准备一个没有个人数据的账号。Google 的隐私权政策写明，登录时会把设备的唯一标识符与账号一起保存[^12]，同一部手机先后登录实名账号与新账号，两个账号的记录可能指向同一台设备，要完全拆开需要一部没有登录过实名账号的手机。同一份政策也列出会收集移动网络信息，包括运营商名称与电话号码，手机里插着实名手机号的 SIM 卡时，付款的 Google 账号也可能连到这个号码，绕了一圈又回到手机号上。金流为什么特别难匿名，见[为什么匿名支付重要](../../basics/payments-anonymity.md)。

## 还没解决的问题

付款与注册几乎同时发生，两边的时间都可以调取。Signal 回应调取时会提供账号的注册时间[^2]，Google 有精确的付款时间与付款人。两份数据放在一起，注册前几分钟内付款的人就是候选名单。就算只有 Signal 自己的数据，前面提到的付款日期也能把范围缩到同一天付款的人。

beta 期间用这种方式注册的人还不多，同一天、同几分钟内的购买可能只有少数几笔，比对相对容易。使用的人增加之后，同一天的名单会变长，但无法预期什么时候会长到足以掩护个人，现在就要把这项风险当成存在。论坛上已经有用户提出同样的疑虑，建议 Signal 把注册时间的记录降到以日计[^3]，截至 9 月 23 日 Signal 还没有回应。

注册当下的连接 IP 是另一条线索。Signal 公开的服务器源代码里，不绑手机号的注册流程没有读取 IP，账号数据也没有 IP 字段[^11]，但速率限制等机制会经手连接 IP，其中部分模块没有公开源代码，保留多久无从确认。付款那一端，Google 的隐私权政策写明会收集 IP 地址[^12]。担心这一点的用户，可以在付款与注册时都通过 Tor 或 VPN 连接。

没有 Google Play 服务的手机目前无法付款，也就无法用这种方式注册。[GrapheneOS](../../tools/grapheneos.md) 默认不带 Google 服务，用户要先装上沙盒化的 Google Play 并登录 Google 账号才能付款[^9]。其他付款方式还没有公布是哪些。

iOS 版还没有公布时程。Signal 说明页的注册步骤写着用 Apple Pay 或 Google Pay 付款[^4]，与论坛公告所说的 Play Store 内购不同，说明页可能还没定稿。

## 不同追查情境下的做法

只想避免联系人或陌生人看到号码的话，现有的 username 就够了，iPhone 用户现在也可以设置。在 Signal 的隐私设置里，把号码的可见范围与可搜索范围都设成「没有人」，对外只给 username。

记者的消息来源、跨境工作的倡议者这类需要让账号对应不回本人的用户，改用 Signal Login 之后，账号与本人之间少了手机号这条直接的线索，付款日期与时间比对的线索仍然存在。付款尽量选礼品卡这类不经过银行的方式，Account ID 与密钥存入密码管理器并另外备份。beta 版可能还有错误，账号的密钥又只有一份，重要的联系渠道等正式版推出再搬过去比较稳妥。

如果要防的是有人证明你用过 Signal，Signal Login 无法处理，Google 的购买记录本身就是证据，用手机号注册同样会留下记录。需要连使用过都不留痕迹的情境，要回到[威胁模型](../../basics/threat-model.md)重新评估，替代方案见下一节。

## Signal 之外的替代方案

评估之后认为 Signal Login 也不够用时，要看风险落在哪一层再选工具（各工具的完整比较见[匿名通讯工具比较](../../tools/messaging-comparison.md)）。

| 评估出的风险 | 替代方案 | 适合的理由 | 主要代价 |
|---|---|---|---|
| 账号会对应回本人 | [SimpleX](https://simplex.chat/){target="_blank"} | 没有任何用户标识符，每段对话各用一组独立的队列，注册不需要手机号、邮箱或付款 | 学习曲线高，没有传统的联系人列表 |
| 同上，希望操作接近一般通讯软件 | [Threema](https://threema.com/){target="_blank"} | 不需要手机号或邮箱，账号是随机产生的 8 位 Threema ID，官方商店可以用现金或比特币购买授权码，付款不经过 Google 或 Apple | 需付费，定价 6 美元或 6 欧元，依商店与国家而定。服务器由 Threema 集中运营，位于瑞士。没有绑手机号或邮箱时，忘记 ID 就无法找回 |
| 同上，不想付费 | [Session](https://getsession.org/){target="_blank"} | 账号是随机 ID，靠一组助记词恢复，流量经过多跳路由 | 目前的正式版没有前向保密，所有消息用同一把长期密钥加密，密钥一旦外泄，过去的消息都可能被解开，具前向保密的新协议还没有发布[^13]。群组功能较弱、消息延迟较高 |
| 不信任中央服务器，或担心服务器端的记录被调取 | [Briar](https://briarproject.org/){target="_blank"} | 点对点传讯，没有中央服务器，网络中断时还能用蓝牙与 Wi-Fi 在近距离传讯 | 没有 iOS 版，一台设备就是一个账号，双方要同时在线才能发送（可用一部闲置的 Android 手机架设 Briar Mailbox 代收） |
| 团体长期协作，想自行掌握服务器 | [Matrix](https://matrix.org/){target="_blank"}（自架 homeserver） | 服务器与记录的保存方式由社区自行决定 | homeserver 看得到谁在哪个房间、何时发言，公开房间默认不加密 |
| 手机可能被扣押或检查 | [Molly](https://molly.im/){target="_blank"} | Signal 的 Android 分支，没有密码就打不开手机里的聊天记录，闲置一段时间后自动上锁，通知可以不经过 Google 的推送服务 | 仍走 Signal 的服务器、仍要注册账号，只处理设备这一层 |

如果风险只是 Signal 在所在地被封锁，可以先试 [Signal Proxy](../../tools/signal-proxy.md)，不一定要换工具。

换工具时对方也要一起安装，比较可行的做法是分流，只把最敏感的几个联系人搬到新工具，其他对话留在原处。

从 Google Play 或 App Store 安装 SimpleX、Session，下载记录同样留在 Google 或 Apple 账号里，跟 Signal Login 的付款记录属于同一类问题。Android 可以改用 F-Droid 或官方网站提供的 APK，iOS 没有这个选项。

SimpleX 能处理身份，无法处理手机被扣押。Briar 不经过服务器，但没有 iOS 版。每个工具只涵盖其中几层，先确定要防的是哪一层再选工具，判断方式见[威胁模型如何建立](../../basics/threat-model.md)。

### Signal 账号的删除

只删除 App，账号仍留在 Signal 的服务器上，绑定的手机号与注册时间也还在，要从 App 内的「设置 → 账号 → 删除账号」正式删除。删除前先把群组管理员权限交给其他成员，并通过其他渠道告知联系人新的联系方式，避免对方继续发消息到已经停用的账号。

## 相关阅读

- [Metadata 是什么](../../basics/metadata.md)：消息加密之后，谁跟谁联系、什么时候联系仍然看得到
- [为什么匿名支付重要](../../basics/payments-anonymity.md)：金流记录为什么比其他 metadata 更难消除
- [匿名通讯工具比较](../../tools/messaging-comparison.md)：Signal、SimpleX、Session、Briar、Matrix 的身份模型差异
- [记者保护消息来源](../../scenarios/journalist.md)：与消息来源第一次接触、交换联系方式与文件的做法
- [出差与研讨会的数字准备（东亚与东南亚）](../../scenarios/asia-travel.md)：各地的 SIM 实名、入境查机现况与跨境手机号的取舍
- [社运行动者的数字准备](../../scenarios/activist.md)：行动中的通讯与设备设置、被盘查时的应对
- [介绍 Signal 自动密钥验证](./signal-automatic-key-verification.md)：Signal 2026 年 8 月推出的另一项安全更新

[^1]: [Keep your phone number private with Signal usernames](https://signal.org/blog/phone-number-privacy-usernames/){target="_blank"} - Signal Blog
[^2]: [Government Communication](https://signal.org/bigbrother/){target="_blank"} - Signal
[^3]: [Beta feedback for the upcoming Android 8.28 release](https://community.signalusers.org/t/beta-feedback-for-the-upcoming-android-8-28-release/76457){target="_blank"} - Signal Community Forum
[^4]: [Phone Numberless Registration for Android](https://support.signal.org/hc/en-us/articles/11197884108826-Phone-Numberless-Registration-for-Android){target="_blank"} - Signal Support
[^5]: [Donor FAQs](https://support.signal.org/hc/en-us/articles/360031949872-Donor-FAQs){target="_blank"} - Signal Support
[^6]: [LoginPurchaseManager.java](https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/subscriptions/LoginPurchaseManager.java){target="_blank"} - signalapp/Signal-Server
[^7]: [Accounts.java](https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/storage/Accounts.java){target="_blank"}、[RedeemedReceiptsManager.java](https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/storage/RedeemedReceiptsManager.java){target="_blank"} - signalapp/Signal-Server
[^8]: [Google Play 接受的付款方式 - 台灣](https://support.google.com/googleplay/answer/2651410?hl=zh-Hant&co=GENIE.CountryCode%3DTW){target="_blank"} - Google Play 說明
[^9]: [GrapheneOS usage guide](https://grapheneos.org/usage){target="_blank"} - GrapheneOS
[^10]: [IssuedReceiptsManager.java](https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/storage/IssuedReceiptsManager.java){target="_blank"} - signalapp/Signal-Server
[^11]: [RegistrationController.java](https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/controllers/RegistrationController.java){target="_blank"} - signalapp/Signal-Server
[^12]: [Google 隐私权政策](https://policies.google.com/privacy?hl=zh-CN){target="_blank"} - Google
[^13]: [Session Protocol V2](https://getsession.org/session-protocol-v2){target="_blank"} - Session
