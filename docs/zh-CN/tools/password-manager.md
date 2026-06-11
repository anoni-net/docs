---
title: 密码管理器入门
description: 为什么需要密码管理器、如何选择，以及 Bitwarden、KeePassXC、1Password 的取舍。
icon: material/key-variant
---

# :material-key-variant: 密码管理器入门

重复密码、简单密码、写在便条纸上的密码，是被攻击时最常见的破口。密码管理器让你只需要记一组主密码，其他密码可以又长又随机，并在不同装置之间同步。这篇文章说明密码管理器的核心威胁模型、四类常见工具的取舍（KeePassXC、Bitwarden、1Password、Apple Passwords）、TOTP 双因子验证的搭配方式、Passkey 与硬件密钥的角色，以及在台湾使用时的特殊情境与备援策略。动之前可以先回头看 [威胁模型如何建立](../basics/threat-model.md)，知道自己在抗谁。

## 为什么需要密码管理器

过去十年的大规模数据外泄，把人类密码的弱点完整暴露出来。现代攻击者不需要破解你的密码，他们从某次外泄事件拿到「Email + 密码」的数据库，再把同样组合往别的服务试（这叫 credential stuffing，重复密码从 A 站流到 B 站）。如果你在 10 个服务都用同一组密码，只要其中一个外泄，10 个账号全部失守。

简单密码也撑不住。一台普通电脑每秒可以试上千万个常见密码组合，加上社交工程拿到的姓名、生日、宠物名字，「定制化字典」攻击速度更快。再串上 SIM swap（攻击者透过社交工程把你的号码移到他们的 SIM 卡，拦截短信验证码），单纯的「密码 + 短信 2FA」就会失守。

浏览器内建的「记住密码」功能能帮一点忙，但限制明显：跨装置同步弱、被偷装置就全暴露、恶意的浏览器扩展可以读取、没有恢复机制。

密码管理器的核心承诺是：**你只记一组难记的主密码，其他每个服务都用不同、随机、长密码，由密钥库加密保管**。主密码用来解锁密钥库，密钥库里是你所有的密码、TOTP 种子、安全笔记。

## 主密码与 passphrase

主密码是整套系统的单一支点，值得花一点时间想清楚。

**用 passphrase，不要用单字密码**。Passphrase 是 4 到 6 个随机英文单字串成的句子（例如 `correct horse battery staple`），熵比短而复杂的密码高得多，也比较好记。可以用 [diceware](https://theworld.com/~reinhold/diceware.html){target="_blank"} 字典随机抽单字，避免自己选有意义的词。

**主密码不要重用**。这个密码一旦曝露，等于你所有的账号全部曝露。除了密码管理器，其他任何服务都不能用这组密码。

**不要存在电脑上**。记在脑中、写在纸上、放保险柜。可以给家人或律师一份封存的副本，作为遗产规划。

## 四类密码管理器与选择取舍

依储存与同步方式可分成四类，各有适合的用户。

### 离线密钥库：KeePassXC（与 GNOME Secrets）

[KeePassXC](https://keepassxc.org/){target="_blank"} 把密钥库存在你电脑上的 `.kdbx` 文件，跨装置同步靠你自己处理（[Syncthing](https://syncthing.net/){target="_blank"}、自架云端、加密硬盘）。客户端齐全：桌面用 KeePassXC、Android 用 KeePassDX、iOS 用 Strongbox。

[Tails 7.6](../blog/posts/2026-tails-7-6.md) 起预装 GNOME Secrets 取代 KeePassXC，使用相同的 `.kdbx` 格式，原本的密钥库文件可以直接开启。

`.kdbx` 是公开格式，2017 年后陆续有新一代客户端从零开始实作、能开同一个密钥库：Apple 平台原生 SwiftUI 的 [KeePassium](https://keepassium.com/){target="_blank"} 与 [Strongbox](https://strongboxsafe.com/){target="_blank"}（GPL）、跨平台 Flutter 的 [AuthPass](https://authpass.app/){target="_blank"}。换 client 不用搬资料，密钥库格式跟着你走，不被任何一家绑死。

适合：自己掌握储存的人、Tails 用户、不想依赖厂商云端的人。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/pm-keepassxc-main.png" target="_blank">
        <img src="https://assets.anoni.net/docs/pm-keepassxc-main.png"
            alt="KeePassXC 主画面显示密钥库项目列表"
            title="KeePassXC 主画面显示密钥库项目列表"
            class="brand-frame">
    </a>
    <capture>KeePassXC 主画面显示密钥库项目列表（图片来源：<a href="https://keepassxc.org/docs/" target="_blank">KeePassXC 官方文件</a>）</capture>
</figure>

### 云端同步：Bitwarden

[Bitwarden](https://bitwarden.com/){target="_blank"} 是开源密码管理器，厂商提供云端储存与同步，端对端加密由厂商实作。免费版功能齐全（无限项目、无限装置、无限平台），Premium 每年 19.80 美元（2026 年 1 月调涨，实际以官网为准），加上 TOTP 整合、进阶报告、优先支援。

技术上，Bitwarden 有公开的第三方安全 audit，源代码开放。如果你不信任 Bitwarden 公司本身，可以自架 [Vaultwarden](https://github.com/dani-garcia/vaultwarden){target="_blank"}（社群重写的相容后端），客户端不变。

信任前提是：厂商不被攻破、E2EE 实作正确。即使厂商被攻破，攻击者拿到的也是加密过的密钥库，需要再破解你的主密码。但 LastPass 2022 的事件提醒：密钥库的元数据（网站 URL 等栏位）并未加密，攻击者能据此规划针对性钓鱼。

适合：跨多装置、多平台使用、能接受厂商依赖的人。

### 商业整合：1Password

[1Password](https://1password.com/){target="_blank"} 是付费服务（个人每年约 48 美元，2026 年 3 月调涨，实际以官网为准），在 UX 与额外功能上做得最完整。Watchtower 主动监控你的密码是否出现在外泄数据库、是否使用弱密码、哪些服务该开 2FA 还没开。家庭与团队计划成熟，多人共享部分项目方便。

1Password 是闭源，但有公开第三方 audit，并用「Secret Key」设计：除了主密码，还有一组装置上才有的长随机字串，攻击者光拿到主密码也解不开密钥库。

适合：愿意付费换 UX 与监控功能、需要家庭或团队共享、追求最低操作摩擦的用户。

### 系统整合：Apple Passwords / iCloud Keychain

iOS 18 与 macOS Sequoia 起，Apple 把密码功能独立成 [Passwords](https://support.apple.com/zh-cn/guide/passwords/welcome/mac){target="_blank"} app，跨 Apple 装置自动同步、支援 passkey 与 TOTP，整合到系统 autofill。

限制：Android 与 Windows 上的跨平台体验弱（只能用 [iCloud for Windows](https://support.apple.com/zh-cn/guide/icloud-windows/welcome/icloud){target="_blank"} 或 web 接口），不适合多平台用户。同步绑 Apple ID，威胁模型要把「Apple ID 失守 = 密码全失守」算进去。

适合：完全在 Apple 生态的个人用户、不想额外装 app 的人。

## TOTP（两步验证）与密码管理器的关系

两步验证在密码之外加一道时效验证码。TOTP（Time-based One-Time Password）是最常见的形式，每 30 秒换一次。

存放策略上有两派：

- **同密钥库存 TOTP**：KeePassXC、Bitwarden（Premium）、1Password 都支援。方便、跨装置同步自动处理。缺点是主密码曝露 = TOTP 也曝露，等于两步验证变成一步
- **独立 app 存 TOTP**：Android 用 [Aegis](https://getaegis.app/){target="_blank"}、iOS 用 [Raivo](https://raivo-otp.com/){target="_blank"} 或 [Ente Auth](https://ente.io/auth/){target="_blank"}（跨平台）。多一道分层，安全多一道

社群建议：高敏感账号（Email、银行、云端服务）用独立 app，其他可以同密钥库图方便。

短信 2FA 在台湾的银行、政府服务还是常态，但 SIM swap 攻击在台近年也常见，只要服务支援 TOTP 一律改 TOTP。TOTP 的 recovery codes（救援码）要跟主密码分开存，不要一起放在密钥库里，否则密钥库一掉就全部都掉。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/pm-bitwarden-totp.png" target="_blank">
        <img src="https://assets.anoni.net/docs/pm-bitwarden-totp.png"
            alt="Bitwarden 为账号设定 TOTP authenticator 的画面"
            title="Bitwarden 为账号设定 TOTP authenticator 的画面"
            class="brand-frame">
    </a>
    <capture>Bitwarden 为账号设定 TOTP authenticator 的画面（图片来源：<a href="https://bitwarden.com/help/integrated-authenticator/" target="_blank">Bitwarden 官方说明</a>）</capture>
</figure>

## Passkeys：取代密码的新方案

Passkey 是基于 [FIDO2 / WebAuthn](https://fidoalliance.org/passkeys/){target="_blank"} 标准的无密码登录方式。2026 年已经在主流服务（Google、Apple、Microsoft、GitHub、PayPal）广泛支援。

运作上：你的装置产生一对公私钥，公钥交给服务，私钥存在你的密码管理器或硬件密钥上。登录时用生物辨识（Face ID、指纹）解锁私钥签名挑战。没有打字输入的密码，自然就没有 phishing 风险。

哪些密码管理器存得了 passkey：Bitwarden、1Password、Apple Passwords，KeePassXC 透过 plugin 也可以。

过渡期建议：能用 passkey 就用，但保留密码加 TOTP 作为备援。不是每个服务都支援 passkey，更不是每台装置都能扫指纹。如果常切换不同人的装置（公用电脑、家人装置），passkey 的同步机制要先弄清楚。

跟匿名情境的取舍：passkey 跟生物辨识与装置绑定，在纯匿名浏览（例如用 Tor Browser 开不同身份）的情境下难用。请依 [威胁模型](../basics/threat-model.md) 判断。

## 硬件密钥（YubiKey、Solo）

硬件密钥跟密码管理器搭配使用，是 2FA 与 passkey 的最强层级，主要对抗钓鱼（Phishing-resistant 2FA）。即使你被钓鱼网站骗到输入密码，硬件密钥会检查域名，不对的就不会送出签名。

主流产品：[YubiKey](https://www.yubico.com/){target="_blank"}（含 NFC 版本，能跟手机配合）、[Solo](https://solokeys.com/){target="_blank"}（开源硬件）。透过 USB、NFC、Lightning 与装置沟通。

适合放在谁身上：高敏感账号（个人 Email、银行、政府服务、GitHub 开发者账号）。Bitwarden、1Password、Google、GitHub、Microsoft、Apple ID 都支援硬件密钥当作 2FA。

**至少买两支**：一支日常用、一支备用（锁在家里的保险柜或信任的家人那边）。只买一支遗失就被锁死，要走服务的「账号回复」流程，那是你不会想经历的麻烦。

## 常见错误（避免踩坑）

社群实际遇过的踩坑案例：

- **匯出后忘了删档**：从浏览器或旧密码管理器匯出时是 CSV / JSON 明文，匯入新工具后忘记删掉文件，后来电脑被偷或文件外流就裸奔
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

## 在台湾的补充

台湾有几个跟密码管理器相关的特殊情境，国际指南通常不会提：

- **短信 2FA 是常态但不安全**：银行（网银、信用卡 OTP）、政府服务（自然人凭证、健保署）多半依赖短信。能改 TOTP 的服务（Google、Microsoft、PChome、虾皮、各家交易所）一律改，并把 recovery codes 存进密钥库
- **SIM swap 在台近年常见**：跟电信业者设定「号码异动需临柜 + 双重验证」，避免攻击者打客服就能把号码移走
- **双证件账号**：自然人凭证、行动自然人凭证、健保卡的 PIN 与恢复码存进密钥库，但**主密码仍要跟这些 PIN 分开**
- **Apple ID 在台等同关键账号**：很多服务（电商、串流、订阅制 app）透过 Sign in with Apple 登录，Apple ID 失守会连带失去多个服务。Apple ID 本身务必开 2FA、设 Recovery Contacts
- **被盗后的补救**：见 [紧急求救](../help/index.md) 的「账号被盗或被异常登录」章节，这篇是预防、求救页是事后补救

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-chat-question: 威胁模型如何建立](../basics/threat-model.md)
- [:material-chat-question: Metadata 是什么](../basics/metadata.md)
- [:material-chat-question: 什么是 Tails](./what-is-tails.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-shield-lock-outline: 个人隐私指引研究专题](../community/privacy-guide.md)
- [:material-lifebuoy: 紧急求救](../help/index.md)
- [:material-translate-variant: 中文化与文件翻译](../community/i18n.md)

</div>
