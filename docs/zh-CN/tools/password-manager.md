---
title: 密码管理器入门
description: 为什么需要密码管理器、如何选择，以及 Bitwarden、KeePassXC、1Password 的取舍。
icon: material/key-variant
---

# :material-key-variant: 密码管理器入门

重复密码、简单密码、写在便条纸上的密码，是被攻击时最常见的破口。密码管理器让你只需要记一组主密码，其他密码可以又长又随机，并在不同装置之间同步。这篇文章说明密码管理器的核心威胁模型、四类常见工具的取舍（KeePassXC、Bitwarden、1Password、Apple Passwords）、TOTP 双因子验证的搭配方式、Passkey 与硬件密钥的角色，以及在台湾使用时的特殊情境与备援策略。动之前可以先回头看 [威胁模型如何建立](../basics/threat-model.md)，知道自己在抗谁。

## 为什么需要密码管理器

过去十年的大规模数据外泄，把人类密码的弱点完整暴露出来。现代攻击者不需要破解你的密码，他们从某次外泄事件取得「Email + 密码」的数据库，再把同样组合往别的服务试（这叫 credential stuffing，重复密码从 A 站流到 B 站）。如果你在 10 个服务都用同一组密码，只要其中一个外泄，10 个账号全部失守。

简单密码也撑不住。一台普通电脑每秒可以试上千万个常见密码组合，加上社交工程取得的姓名、生日、宠物名字，「定制化字典」攻击速度更快。再串上 SIM swap（攻击者透过社交工程把你的号码移到他们的 SIM 卡，拦截短信验证码），单纯的「密码 + 短信 2FA」就会失守。

浏览器与操作系统内置的密码管理（Apple 的 Passwords、Google 密码管理工具、Firefox）是最容易上手的起点，最好的密码管理器就是你真的会用的那一个。内置在浏览器里的自动填充可以防钓鱼，也不必另外安装扩展[^ssd-pm]。代价是绑在单一浏览器或生态系（Firefox 的只能在 Firefox 里用），也比独立的密码管理器少了加密笔记、安全问题的答案、家人共享这类功能。各家默认的加密程度不同，Google 的需要自行开启，见下方的[浏览器内置的密码管理与自动填充](#浏览器内置的密码管理与自动填充)。

密码管理器的核心承诺是：**你只记一组难记的主密码，其他每个服务都用不同、随机、长密码，由密钥库加密保管**。主密码用来解锁密钥库，密钥库里是你所有的密码、TOTP 种子、安全笔记。

## 主密码与 passphrase

主密码是整套系统的单一支点，值得花一点时间想清楚。

**用 passphrase，不要用单字密码**。Passphrase 是随机英文单字串成的句子（例如 `oolong lantern basket typhoon pencil marble`，仅为示意），熵比短而复杂的密码高得多，也比较好记。用作主密码或全盘加密的密码时，至少用 6 个字[^ssd-pw]。可以用 [diceware](https://theworld.com/~reinhold/diceware.html){target="_blank"} 字典随机抽单字，避免自己选有意义的词。社区也做了一份带亚洲味、与 EFF 兼容的 [Asian Diceware 密语字典](./asian-diceware.md)，附 A5 小册与掷骰、安全随机数的产生教学。

**主密码不要重用**。这个密码一旦曝露，等于你所有的账号全部曝露。除了密码管理器，其他任何服务都不能用这组密码。

**不要存在电脑上**。记在脑中、写在纸上、放保险柜。可以给家人或律师一份封存的副本，作为遗产规划。

**装置要保持干净**。电脑或手机被装了间谍软件，你输入主密码的过程会被记录下来，密钥库里的内容也可能被偷走[^ssd-pw]。主密码再强也挡不住，用密码管理器的同时仍要防范恶意软件（做法见[恶意软件的防范与处理](./malware.md)）。

## 四类密码管理器与选择取舍

依储存与同步方式可分成四类，各有适合的用户。

### 离线密钥库：KeePassXC（与 GNOME Secrets）

[KeePassXC](https://keepassxc.org/){target="_blank"} 把密钥库存在你电脑上的 `.kdbx` 文件，跨装置同步靠你自己处理（[Syncthing](https://syncthing.net/){target="_blank"}、自架云端、加密硬盘）。客户端齐全：桌面用 KeePassXC、Android 用 KeePassDX、iOS 用 Strongbox。

[Tails 7.6](../changelog/tails.md) 起预装 GNOME Secrets 取代 KeePassXC，使用相同的 `.kdbx` 格式，原本的密钥库文件可以直接开启。

`.kdbx` 是公开格式，2017 年后陆续有新一代客户端从零开始实现、能开同一个密钥库：Apple 平台原生 SwiftUI 的 [KeePassium](https://keepassium.com/){target="_blank"} 与 [Strongbox](https://strongboxsafe.com/){target="_blank"}（GPL）、跨平台 Flutter 的 [AuthPass](https://authpass.app/){target="_blank"}。换 client 不用搬数据，密钥库格式跟着你走，不被任何一家绑死。

适合：自己掌握储存的人、Tails 用户、不想依赖厂商云端的人。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/pm-keepassxc-main.png" target="_blank">
        <img src="https://assets.anoni.net/docs/pm-keepassxc-main.png"
            alt="KeePassXC 主画面显示密钥库项目列表"
            title="KeePassXC 主画面显示密钥库项目列表"
            class="brand-frame">
    </a>
    <figcaption>KeePassXC 主画面显示密钥库项目列表（图片来源：<a href="https://keepassxc.org/docs/" target="_blank">KeePassXC 官方文件</a>）</figcaption>
</figure>

### 云端同步：Bitwarden

[Bitwarden](https://bitwarden.com/){target="_blank"} 是开源密码管理器，厂商提供云端储存与同步，端对端加密由厂商实现。免费版功能齐全（无限项目、无限装置、无限平台），Premium 每年 19.80 美元（2026 年 1 月调涨，实际以官网为准），加上 TOTP 整合、进阶报告、优先支持。

技术上，Bitwarden 有公开的第三方安全 audit，源代码开放。如果你不信任 Bitwarden 公司本身，可以自架 [Vaultwarden](https://github.com/dani-garcia/vaultwarden){target="_blank"}（社区重写的兼容后端），客户端不变。

信任前提是：厂商不被攻破、E2EE 实现正确。即使厂商被攻破，攻击者取得的也是加密过的密钥库，需要再破解你的主密码。但 LastPass 2022 的事件提醒：密钥库的元数据（网站 URL 等栏位）并未加密，攻击者能据此规划针对性钓鱼。

适合：跨多装置、多平台使用、能接受厂商依赖的人。

### 商业整合：1Password

[1Password](https://1password.com/){target="_blank"} 是付费服务（个人每年约 48 美元，2026 年 3 月调涨，实际以官网为准），在 UX 与额外功能上做得最完整。Watchtower 主动监控你的密码是否出现在外泄数据库、是否使用弱密码、哪些服务该开 2FA 还没开。家庭与团队计划成熟，多人共享部分项目方便。

各家的家庭方案通常让每位成员各有私人密钥库，水电、流媒体这类共用账号再另外共享。家庭账号的管理者可能有办法恢复成员的密码，等于能看到内容，加入之前要确认自己在一定程度上信任管理者[^ssd-pm]。

1Password 是闭源，但有公开第三方 audit，并用「Secret Key」设计：除了主密码，还有一组装置上才有的长随机字串，攻击者光取得主密码也解不开密钥库。

适合：愿意付费换 UX 与监控功能、需要家庭或团队共享、追求最低操作摩擦的用户。

### 系统整合：Apple Passwords / iCloud Keychain

iOS 18 与 macOS Sequoia 起，Apple 把密码功能独立成 [Passwords](https://support.apple.com/zh-cn/guide/passwords/welcome/mac){target="_blank"} app，跨 Apple 装置自动同步、支持 passkey 与 TOTP，整合到系统 autofill。

限制：Android 与 Windows 上的跨平台体验弱（只能用 [iCloud for Windows](https://support.apple.com/zh-cn/guide/icloud-windows/welcome/icloud){target="_blank"} 或 web 接口），不适合多平台用户。同步绑 Apple ID，威胁模型要把「Apple ID 失守 = 密码全失守」算进去。

适合：完全在 Apple 生态的个人用户、不想额外装 app 的人。

## 浏览器内置的密码管理与自动填充

Apple 的 Passwords 默认就有端对端加密，Google 密码管理工具默认没有[^ssd-pm]。Google 另外提供「设备端加密」，设置之后只有你自己握有解锁的密钥，Google 也无法读取你存的密码与 passkey。解锁时用 Google 账号密码或兼容装置的屏幕锁。Google 的说明写了之后会逐步为所有人设置，在那之前需要自行到 Google 密码管理工具的设置里开启[^google-ode]，用 Chrome 或 Android 存密码的人建议开启。

设备端加密设置之后无法移除，忘记 Google 账号密码而无法登录时，存着的密码也可能无法取回[^google-ode]。开启前先确认账号的辅助电话号码与辅助邮箱是最新的。其他浏览器内置的密码管理，使用前先查它如何加密数据。

自动填充对多数人是防钓鱼的重要保护，假网站的网址不相符，密码就不会填进去。独立的密码管理器靠浏览器扩展做自动填充，扩展也是密码管理器最常出现漏洞的地方。被政府这类强大的对手锁定时，可以考虑关掉扩展的自动填充[^ssd-pm]，改从密码管理器的 app 复制粘贴。少了自动填充，防钓鱼就更需要依靠硬件密钥或 passkey（见下方的[硬件密钥](#硬件密钥YubiKeySolo)）。

## TOTP（两步验证）与密码管理器的关系

两步验证在密码之外加一道时效验证码。TOTP（Time-based One-Time Password）是最常见的形式，每 30 秒换一次。

存放策略上有两派：

- **同密钥库存 TOTP**：KeePassXC、Bitwarden（Premium）、1Password 都支持。方便、跨装置同步自动处理。缺点是主密码曝露 = TOTP 也曝露，等于两步验证变成一步
- **独立 app 存 TOTP**：Android 用 [Aegis](https://getaegis.app/){target="_blank"}，iOS 与跨平台用 [Ente Auth](https://ente.io/auth/){target="_blank"}。多一道分层，安全多一道。iOS 的 Raivo 在 2023 年被收购后，隐私政策纳入广告追踪器与 log 收集，不建议新采用[^raivo]（挑选 TOTP app 的判准见[怎么维持多个网络身分](../basics/multiple-identities.md)）

社区建议：高敏感账号（Email、银行、云端服务）用独立 app，其他可以同密钥库图方便。

短信 2FA 在台湾的银行、政府服务还是常态，但 SIM swap 攻击在台近年也常见，只要服务支持 TOTP 一律改 TOTP。TOTP 的 recovery codes（救援码）要跟主密码分开存，不要一起放在密钥库里，否则密钥库一掉就全部都掉。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/pm-bitwarden-totp.png" target="_blank">
        <img src="https://assets.anoni.net/docs/pm-bitwarden-totp.png"
            alt="Bitwarden 为账号设定 TOTP authenticator 的画面"
            title="Bitwarden 为账号设定 TOTP authenticator 的画面"
            class="brand-frame">
    </a>
    <figcaption>Bitwarden 为账号设定 TOTP authenticator 的画面（图片来源：<a href="https://bitwarden.com/help/integrated-authenticator/" target="_blank">Bitwarden 官方说明</a>）</figcaption>
</figure>

## Passkeys：取代密码的新方案

Passkey 是基于 [FIDO2 / WebAuthn](https://fidoalliance.org/passkeys/){target="_blank"} 标准的无密码登录方式。2026 年已经在主流服务（Google、Apple、Microsoft、GitHub、PayPal）广泛支持。

运作上：你的装置产生一对公私钥，公钥交给服务，私钥存在你的密码管理器或硬件密钥上。登录时用生物辨识（Face ID、指纹）解锁私钥签名挑战。没有打字输入的密码，自然就没有 phishing 风险。

哪些密码管理器存得了 passkey：Bitwarden、1Password、Apple Passwords，KeePassXC 透过 plugin 也可以。

过渡期建议：能用 passkey 就用，但保留密码加 TOTP 作为备援。不是每个服务都支持 passkey，更不是每台装置都能扫指纹。如果常切换不同人的装置（公用电脑、家人装置），passkey 的同步机制要先弄清楚。

跟匿名情境的取舍：passkey 跟生物辨识与装置绑定，在纯匿名浏览（例如用 Tor Browser 开不同身份）的情境下难用。请依 [威胁模型](../basics/threat-model.md) 判断。

## 硬件密钥（YubiKey、Solo）

硬件密钥跟密码管理器搭配使用，是 2FA 与 passkey 的最强层级，主要对抗钓鱼（Phishing-resistant 2FA）。即使你被钓鱼网站骗到输入密码，硬件密钥会检查域名，不对的就不会送出签名。

主流产品：[YubiKey](https://www.yubico.com/){target="_blank"}（含 NFC 版本，能跟手机配合）、[Solo](https://solokeys.com/){target="_blank"}（开源硬件）。透过 USB、NFC、Lightning 与装置沟通。

适合放在谁身上：高敏感账号（个人 Email、银行、政府服务、GitHub 开发者账号）。Bitwarden、1Password、Google、GitHub、Microsoft、Apple ID 都支持硬件密钥当作 2FA。

**至少买两支**：一支日常用、一支备用（锁在家里的保险柜或信任的家人那边）。只买一支遗失就被锁死，要走服务的「账号回复」流程，那是你不会想经历的麻烦。

## 常见错误（避免踩坑）

社区实际遇过的踩坑案例：

- **导出后忘了删文件**：从浏览器或旧密码管理器导出时是 CSV / JSON 明文，导入新工具后忘记删掉文件，后来电脑被偷或文件外流就裸奔
- **两个密钥库并存没同步**：家用装置一个密钥库、工作装置另一个密钥库，新增密码只在一边，要用时找不到。决定一套就好
- **主密码跟其他服务的密码重用**：违反主密码的核心原则。哪怕是「跟某个自己旧账号类似」也算重用
- **密钥库文件放没加密的云端**：`.kdbx` 本身有加密，但放在共用云端硬盘（Dropbox 共享文件夹、Google Drive 工作文件夹）会增加曝露面，建议再加一层自己的加密
- **不开 2FA 的密码管理器账号**：Bitwarden / 1Password 账号本身的登录务必开 2FA，最好用硬件密钥

## 备援与恢复策略

密码管理器是单一支点，备援要做到位。

**主密码纸本备份**：写在纸上、放保险柜 / 律师 / 信任的家人。可以分两半放两个地方，要两个合起来才能还原。

**密钥库文件多地备份**（离线用户）：加密硬盘、家中第二个地点、云端加密上传。`.kdbx` 文件本身已经是加密的，但放云端时依然建议再加一层自己的加密。

各家工具的 recovery 机制：

- **KeePassXC / GNOME Secrets**：你自己的 `.kdbx` 文件备份就是 recovery，没有厂商可以帮你回复
- **Bitwarden**：个人账号可以设 Recovery Code，组织账号靠 Master Password Hint（保护弱）
- **1Password**：Emergency Kit（一张 PDF 包含 Secret Key、留空栏填主密码），打印放安全处
- **Apple Passwords**：iCloud Account Recovery 机制 + Recovery Contacts（信任联络人，可帮你重置 Apple ID）

**至少一人知道**「万一我出事，密码在哪、怎么解开」。家人、配偶、律师择一。要交代的是「保险柜在哪、Emergency Kit 在哪、怎么开」这些操作流程。主密码本身不必、也不该交给对方。

Tails 用户：把 `.kdbx` 存进 Persistent Storage 并另外备份到加密硬盘。Tails 默认关机就清空，没做 Persistent Storage 设定的话下次开机什么都没了。

## 被要求交出密码的情况

各地法律对交出密码的规定不同。有些地方或许可以在法律上挑战交出密码的要求，有些地方的法律允许政府要求你交出，甚至可以因为怀疑你知道某组密码或密钥就将人监禁。也有人以人身威胁强迫对方交出密码。过境时拒绝交出密码或解锁装置，可能被延误通关或扣下装置[^ssd-pw]。

密码管理器把所有密码集中在一组主密码后面，被迫交出主密码时，失去的是整个密钥库。事先想清楚谁可能强迫你或你身边的人交出密码，以及交出与拒绝各自的后果。东亚与东南亚各地入境时被要求解锁的后果与应对，见[出差与研讨会的数字准备](../scenarios/asia-travel.md#入境时被要求解锁或交出设备)。

## 在台湾与香港的补充

台湾、香港有几个跟密码管理器相关的特殊情境，国际指南通常不会提：

- **短信 2FA 是常态但不安全**：银行（网银、信用卡 OTP）、政府服务（自然人凭证、健保署）多半依赖短信。能改 TOTP 的服务（Google、Microsoft、PChome、虾皮、各家交易所）一律改，并把 recovery codes 存进密钥库
- **SIM swap 在台近年常见**：跟电信业者设定「号码异动需临柜 + 双重验证」，避免攻击者打客服就能把号码移走
- **双证件账号**：自然人凭证、行动自然人凭证、健保卡的 PIN 与恢复码存进密钥库，但**主密码仍要跟这些 PIN 分开**
- **Apple ID 在台等同关键账号**：很多服务（电商、串流、订阅制 app）透过 Sign in with Apple 登录，Apple ID 失守会连带失去多个服务。Apple ID 本身务必开 2FA、设 Recovery Contacts
- **被盗后的补救**：见 [紧急求救](../help/index.md) 的「账号被盗或被异常登录」章节，这篇是预防、求救页是事后补救

香港的对应情境：

- **政府与银行服务的 2FA**：HKID、iAM Smart（政府数字身份）与网银多用短信 OTP，SIM swap 同样存在，能改 TOTP 的服务就改，recovery codes 存进密钥库
- **Apple ID 一样是关键账号**：Sign in with Apple 绑定多个服务的逻辑在香港一样成立，务必开 2FA 与 Recovery Contacts

## 本页的来源与核对

本页部分内容依 EFF [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"} 的〈[Choosing a Password Manager](https://ssd.eff.org/module/choosing-the-password-manager-that-s-right-for-you){target="_blank"}〉（审阅日 2025-03-06）与〈[Creating Strong Passwords](https://ssd.eff.org/module/creating-strong-passwords){target="_blank"}〉（审阅日 2023-08-18）改写，以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hans){target="_blank"} 授权。依 SSD 补上的是主密码至少 6 个字、间谍软件会记录主密码、家庭方案的管理者、浏览器内置密码管理的取舍与被要求交出密码的情况。Google 设备端加密的说明 2026 年 11 月依 Google 帐号帮助核对。本页未经 EFF 审阅，内容与原文不同之处由匿名网络社区 anoni.net 负责。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-chat-question: 威胁模型如何建立](../basics/threat-model.md)
- [:material-chat-question: Metadata 是什么](../basics/metadata.md)
- [:material-account-multiple-outline: 怎么维持多个网络身分](../basics/multiple-identities.md)
- [:material-email-multiple-outline: 邮件别名怎么用，以及它把信任交给谁](./email-alias.md)
- [:material-chat-question: 什么是 Tails](./what-is-tails.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-shield-lock-outline: 个人隐私指引研究专题](https://anoni.net/zh-cn/join/privacy-guide/){target="_blank"}
- [:material-lifebuoy: 紧急求救](../help/index.md)
- [:material-translate-variant: 中文化与文件翻译](../community/i18n.md)

</div>

[^ssd-pm]: [Choosing a Password Manager](https://ssd.eff.org/module/choosing-the-password-manager-that-s-right-for-you){target="_blank"} - EFF Surveillance Self-Defense，审阅日 2025-03-06。
[^ssd-pw]: [Creating Strong Passwords](https://ssd.eff.org/module/creating-strong-passwords){target="_blank"} - EFF Surveillance Self-Defense，审阅日 2023-08-18。
[^google-ode]: [设备端加密功能使用入门](https://support.google.com/accounts/answer/11350823?hl=zh-Hans){target="_blank"} - Google 帐号帮助，查证日 2026-11。
[^raivo]: [PSA: Raivo OTP for iOS was acquired by Mobime a few months ago](https://www.ghacks.net/2023/12/19/psa-raivo-otp-for-ios-was-acquired-by-mobime-a-few-months-ago/){target="_blank"} - gHacks，2023 年 12 月。Privacy Guides 社区同期讨论指出新东家的隐私政策含 Facebook 与 Google AdMob 追踪器并收集 IP 等 log 数据。查证日 2026-08。
