---
title: COSCUP 2026 匿名网络社群议程轨
description: 匿名网络社群 anoni.net 在 COSCUP 2026 社群议程轨的两日议程与工作坊，涵盖 Tor、Tails、OONI、浏览器追踪、校园 Tor 节点、健保数据库个资权利、隐私指南与匿名支付，并与 ETHTaipei 合办匿名支付场，适合关注隐私与数字安全的台湾读者到现场参与。
icon: material/calendar-star
social:
  cards: false
og:
  enabled: true
  image: https://assets.anoni.net/event/anoni-net-eth-taipei.png
  image_type: image/png
  image_width: 1536
  image_height: 1024
  twitter_card: summary_large_image
---

# :material-calendar-star: COSCUP 2026 匿名网络社群议程轨

![COSCUP 2026 匿名网络社群议程轨主视觉](https://assets.anoni.net/event/anoni-net-eth-taipei.webp){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

记者要保护消息来源、公民团体要守住成员与捐款人的安全、开发者想确认手上的工具真的挡得住监控，还有被诈骗短信吓过、被广告追着跑而想拿回一点主导权的一般人。在审查与监控扩散的环境里，这些需求都落在同一组风险上，通信可能被拦截、身分可能被追踪、一笔转帐的时间与金额足以反推出整张关系网，组织的成员名单与金流甚至可能在你不知情时就被摊开。

匿名网络社群 anoni.net 把这一年在 [Tor](../tools/what-is-tor.md)、[Tails](../tools/what-is-tails.md)、[OONI](../tools/what-is-ooni.md)、个人隐私与匿名支付累积的实作经验，带进 COSCUP 2026 的开源社群现场。两天的议程从网络与审查如何运作开始，一路到现实世界的开源隐私工具、校园 Tor 节点、浏览器追踪、健保数据库的个资权利，以及与 ETHTaipei 合办的匿名支付场。不论你是来找马上能用的工具，还是想一起贡献开源项目，都能挑到对应的场次。

!!! info "活动信息"

    - 日期：2026/08/08（六）、2026/08/09（日）
    - 地点：国立台湾科技大学（NTUST），社群议程轨在 `TR-510`，8/08 下午与 ETHTaipei 合办场在 `TR-511`
    - 形式：社群议程、实作工作坊、与 ETHTaipei 合办的匿名支付场
    - 入场：COSCUP 免费入场，社群议程轨不需另外报名，当天到场即可参与（议程时间到活动前仍可能微调，以 COSCUP 官方议程为准）

[前往 COSCUP 2026 议程](#议程总览){ .md-button .md-button--primary }

!!! tip "免费入场、不需报名，可以「匿名」来参加"

    COSCUP 免费入场，社群议程轨不需事先报名，当天走进教室就能参与。一个推广匿名的社群，参加方式本身也可以匿名，你不必为了听议程留下任何个人信息。如果你正在为隐私、匿名的需求找解法，非常欢迎直接来 `TR-510`（8/08 下午的匿名支付场在 `TR-511`），从这次丰富多元的议程里挑到适合自己的场次，中场也欢迎来跟讲者和社群成员聊聊。

!!! tip "依你的身分，建议从这几场开始"

    - **新闻媒体、独立记者**：8/08 上午「现实世界的开源隐私工具」盘点记者实际在用的安全收件管道、去识别化与隔离工具，可搭配「威胁模型与 Metadata 入门」。8/09 下午的「浏览器追踪技术、反追踪策略」会拆解你每天用的浏览器如何泄漏你联系过谁，「健保数据库案之后」与「隐私指南 2026」再延伸到个资权利与法律调取的因应。延伸阅读：[记者保护消息来源](../scenarios/journalist.md)。
    - **公民团体、NGO**：8/08 上午四场导论最贴近组织处境，「现实世界的开源隐私工具」直接盘点公民团体与 NGO 的加密通信、内部协作与检举投递工具，「隐私指南 2026」谈到组织遭法律调取数据时的事前准备。想评估匿名捐款管道，先听 8/08 上午「为什么匿名支付重要」（白话、不需加密货币背景），想再深入可接 8/08 下午与 ETHTaipei 合办场的「我不洗钱，为何要理解匿名支付？」。
    - **开源、科技社群**：8/09 技术含量最高，OpenWRT、台师大 Tor 节点、浏览器指纹研究都能动手。8/08 下午的零知识证明（ZK）自然人凭证、隐私保护的 KYC（金融机构确认客户身分）流程、隐匿地址是协议层最扎实的内容。想一起贡献见[如何参与](../community/how-to-contribute.md)。
    - 也欢迎带同事、伙伴一起来听。

## :material-calendar-text: 议程总览 { #议程总览 }

以下为社群议程轨的规划，实际时间以 [COSCUP 官方议程](https://pretalx.coscup.org/coscup-2026/){target="_blank"} 为准。场次之间安排换场休息（8/08 上午每场间 10 分钟、8/09 因议程较满改为 5 分钟）。各场详细摘要见下方[议程介绍](#议程介绍)。

### Day 1：2026/08/08（六）

8/08 上午由 anoni.net 社群成员担纲四场开源匿名网络导论，特别适合公民团体、新闻媒体与独立记者，从入门角度切入，四场都扣着开源主轴。下午 13:00 接续与 ETHTaipei 合办的「匿名支付」场，协议层的技术含量更高。

**上午 09:30-12:00　社群开源匿名网络导论（教室 `TR-510`）**

| 时间 | 议程 | 讲者 |
|------|------|------|
| 09:30-10:00<br>30 分钟 | <span class="sess-tag sess-tag--basic">通用</span> :material-account-group: **匿名网络社群 anoni.net 介绍：开源匿名工具、社群实践与 2026 三大主题**<br>:material-arrow-right-bottom: 有一群人在台湾把 Tor、Tails、OONI 这些隐私工具中文化、实际推广。这场介绍他们是谁、在做什么，也说明为什么高风险工作要用验得了的开源工具、而不是无从检查的黑箱软件 | anoni.net 社群 |
| 10:10-10:40<br>30 分钟 | <span class="sess-tag sess-tag--basic">通用</span> :material-target-account: **威胁模型与 Metadata 入门：认识你的对手，以及为什么匿名工具要开源才可信**<br>:material-arrow-right-bottom: 就算通话内容没被监听，谁在什么时间联系了谁，常常就足以让消息来源曝光。这场带你判断自己该防谁、又要防到什么程度 | anoni.net 社群 |
| 10:50-11:20<br>30 分钟 | <span class="sess-tag sess-tag--basic">通用</span> :material-toolbox-outline: **现实世界的开源隐私工具：公民团体、独立记者与个人隐私防护的实际运用**<br>:material-arrow-right-bottom: 记者、NGO 与在意隐私的一般人，实际上都在用哪些源代码公开、可被检验的免费工具保护自己？这场直接列出来，不管你是谁都能挑一两个回家用 | anoni.net 社群 |
| 11:30-12:00<br>30 分钟 | <span class="sess-tag sess-tag--basic">通用</span> :material-cash-multiple: **为什么匿名支付重要：开源、去中心化的金流与台湾 VASP 法 2026**<br>:material-arrow-right-bottom: 一笔给敏感议题组织的捐款、给线人的转帐，金流本身就会泄漏关系。这场用白话说明金流隐私，不需要加密货币背景 | anoni.net 社群 |

**下午 13:00-16:30　ETHTaipei 合办「匿名支付」场（教室 `TR-511`，议程由 ETHTaipei 安排）**

| 时间 | 议程 | 讲者 |
|------|------|------|
| 13:00-13:30<br>30 分钟 | <span class="sess-tag sess-tag--payments">匿名支付</span> :material-card-account-details-outline: **零知识证明与自然人凭证身份验证**<br>:material-arrow-right-bottom: 不必交出任何个资，就能用自然人凭证向网站证明你是台湾公民 | Ya-wen Jeng |
| 13:40-14:10<br>30 分钟 | <span class="sess-tag sess-tag--payments">匿名支付</span> :material-account-check-outline: **The Privacy-preserving Identity Pipeline in KYC**<br>:material-arrow-right-bottom: 用一组密码学原语组出能通过 KYC，却不让服务器看到身分数据的流程 | ryanycw（Ryan Wang） |
| 14:20-14:50<br>30 分钟 | <span class="sess-tag sess-tag--payments">匿名支付</span> :material-link-off: **从不可链接性出发：隐匿地址如何解决链上金融隐私（以 Fluidkey 为例）**<br>:material-arrow-right-bottom: 用隐匿地址让同一人每次收款都落在不相关的地址，外部串不成同一身分 | Jennifer HSU |
| 15:00-15:30<br>30 分钟 | <span class="sess-tag sess-tag--payments">匿名支付</span> :material-bitcoin: **我不洗钱，为何要理解匿名支付？从零开始介绍隐私加密金流交易**<br>:material-arrow-right-bottom: 为什么倡议组织与捐款人也该懂加密货币金流的隐私风险，用白话走过几套解法 | 黄豆泥 mashbean |
| 15:40-16:30<br>50 分钟 | <span class="sess-tag sess-tag--payments">匿名支付</span> :material-hammer-wrench: **隐私支付实作工作坊：从龙卷风现金到隐私池**<br>:material-arrow-right-bottom: 用道具与实机示范 Tornado Cash 与 Privacy Pool 的用法，不用自己动手、跟着看就好 | Liangcc |

### Day 2：2026/08/09（日）

8/09 全天排定七场录取议程，题材从网络与审查基础、家用网络与校园 Tor 节点，到健保数据库的个资权利与个人隐私防护。技术场与贴近生活的场交错，开发者、记者、公民团体都能找到适合自己的场。

**上午 10:00-12:00（教室 `TR-510`）**

| 时间 | 议程 | 讲者 |
|------|------|------|
| 10:00-10:50<br>50 分钟 | <span class="sess-tag sess-tag--basic">通用</span> :material-web: **The Workings of the Internet：网络如何运作、审查如何挡住你（英文进行）**<br>:material-arrow-right-bottom: 用寄明信片的比喻，看清你连上网站的路上有谁能偷看或窜改内容，英文不熟也能跟上大意 | Raghu |
| 10:55-11:25<br>30 分钟 | <span class="sess-tag sess-tag--basic">通用</span> :material-router-network: **以 OpenWRT 等开源软件创建家用网络环境**<br>:material-arrow-right-bottom: 在家用路由器上做到一般机种没有的高级设置，含 VLAN 隔离、多 WAN、site-to-site VPN 与 Tor 上游 | Pellaeon Lin |
| 11:30-12:00<br>30 分钟 | <span class="sess-tag sess-tag--payments">匿名支付</span> :material-fingerprint: **区块链网络上基于开放标准的实体身份识别方法**<br>:material-arrow-right-bottom: VASP 法通过后，台湾人的身分在区块链上会用哪些开放标准被定位 | Yusef Schultz |

（12:00-13:00 午休）

**下午 13:00-16:00（教室 `TR-510`）**

| 时间 | 议程 | 讲者 |
|------|------|------|
| 13:00-13:30<br>30 分钟 | <span class="sess-tag sess-tag--relay">Tor Relay</span> :simple-torproject: **在学校种洋葱？台师大 Tor 节点创建实务与 EFF Tor University Challenge 经验谈**<br>:material-arrow-right-bottom: 在台师大架设学术 Tor 节点的完整历程，从技术配置到校内政策协调 | NZ |
| 13:35-14:25<br>50 分钟 | <span class="sess-tag sess-tag--privacy">个人隐私</span> :material-eye-off-outline: **浏览器追踪技术、反追踪策略和用户自主**<br>:material-arrow-right-bottom: 你每天用的浏览器如何被指纹追踪、可能泄漏你联系了谁，以及如何反追踪 | Pellaeon Lin |
| 14:30-15:00<br>30 分钟 | <span class="sess-tag sess-tag--privacy">个人隐私</span> :material-database-lock: **健保数据库案之后：停止利用权如何实践？以及其他大型数据库**<br>:material-arrow-right-bottom: 健保数据库退出权诉讼到修法的经过，以及如何申请停止利用权 | Kuan-Ju Chou |
| 15:05-15:55<br>50 分钟 | <span class="sess-tag sess-tag--privacy">个人隐私</span> :material-shield-account-outline: **隐私指南 2026**<br>:material-arrow-right-bottom: 从个人隐私风险矩阵，到 NGO 与媒体面对法律调取数据的准备，再到门槛签章、MPC 等组织级高级工具 | Justyn |

## :material-text-box-multiple-outline: 议程介绍 { #议程介绍 }

### Day 1（8/08 上午）：社群开源匿名网络导论

四场导论由 anoni.net 社群成员担纲，取材自既有文档与 2025 工作坊内容。介绍的工具（Tor、Tails、OONI、Signal、SecureDrop、OnionShare、Cryptpad、mat2 等）全是自由开源软件，社群本身也以贡献国际开源项目（翻译、架设中继节点、回报问题）的方式参与。

??? abstract ":material-account-group: 匿名网络社群 anoni.net 介绍：开源匿名工具、社群实践与 2026 三大主题"

    匿名网络社群 anoni.net 是台湾在地的开源社群，这一年持续推广 Tor、Tails、OONI 这些自由开源的匿名网络工具。开场先说明社群的缘起与运作方式，以及如何以开源协作参与国际项目，把 Tor、Tails、OONI 与 Tor University Challenge 的界面翻成正体中文、回报问题、协助在校园架设中继节点。

    你会清楚这个社群在做什么、可以从哪里参与，也会理解为什么记者、公民团体、人权倡议者这类高风险工作特别倚赖源代码可被公开查看的开源工具，封闭的黑箱软件无从验证有没有被动过手脚。最后会带到社群 2026 年推进的三个主题，依情境分级的个人隐私指引、校园 Tor Relay 中继节点创建，以及在合法前提下对匿名支付的开源工具探索。

    :material-open-in-new: [COSCUP 官方议程页](https://pretalx.coscup.org/coscup-2026/talk/8CZ7ER/){target="_blank"}

??? abstract ":material-target-account: 威胁模型与 Metadata 入门：认识你的对手，以及为什么匿名工具要开源才可信"

    挑工具之前，先回答三个问题：你要保护什么、要防的对手是谁、愿意付出多少成本。这场用[威胁模型](../basics/threat-model.md)把这三个问题搭成**判断框架**，也说明 [metadata](../basics/metadata.md)（那些没被加密的连接、时间、联系对象等纪录）的风险，就算通话内容没被监听，对手仍可能从通联纪录知道你在什么时间联系了谁、联系多久。

    带着这套框架，你以后遇到新工具、新威胁就知道如何对号入座，也会明白和开源直接相关的一点，当对手有能力检查你的设备与通信时，工具能不能被独立审核就攸关安全，这也是 Tor Browser、Tails 采用开放源代码与可重现建置（reproducible build，任何人都能从源代码编出比特相同的程序、验证没被动过手脚）的原因。对记者与公民团体来说，这类 metadata 往往足以反推出消息来源与行动网络。

    :material-open-in-new: [COSCUP 官方议程页](https://pretalx.coscup.org/coscup-2026/talk/GFKLC8/){target="_blank"}

??? abstract ":material-toolbox-outline: 现实世界的开源隐私工具：公民团体、独立记者与个人隐私防护的实际运用"

    这场整理公民团体、独立记者与注重隐私的个人在现实中实际采用的开源隐私工具，分成三个场景依序介绍，每一项都说清楚由谁采用、在什么情境下派上用场。这些高风险场景特别倚赖源代码可被公开审核的开源工具，封闭软件无从验证是否遭到窜改，正好回扣前一场[威胁模型](../basics/threat-model.md)的判断框架。这场重点放在几样最容易上手的工具，你不必记住整份清单，听完能先挑一两个回家用。

    公民团体与 NGO 对外用 Signal、Matrix 加密通信，内部协作用 CryptPad、Etherpad，并以 SecureDrop、[OnionShare](../tools/onionshare.md) 接受检举与敏感数据投递，另以 OONI 观测各地的网络审查。独立记者这一段涵盖安全收件管道、以 mat2 与 Metadata Cleaner 清除文件内嵌的作者与 GPS metadata，并运用 Tails、Qubes OS 隔离高风险作业。个人隐私防护则有 Tor Browser 与 Brave 抵御网页追踪、GrapheneOS 与 LineageOS 取回手机的控制权、KeePassXC 与 Bitwarden 管理密码。完整的场景与工具对照见[记者保护消息来源](../scenarios/journalist.md)与[通信工具比较](../tools/messaging-comparison.md)。

    :material-open-in-new: [COSCUP 官方议程页](https://pretalx.coscup.org/coscup-2026/talk/QPDZEC/){target="_blank"}

??? abstract ":material-cash-multiple: 为什么匿名支付重要：开源、去中心化的金流与台湾 VASP 法 2026"

    这场不需要任何加密货币背景。谈匿名与隐私时，金流常被遗漏。一笔转帐的时间、金额、收款对象，配上信用卡号或银行户名，几乎能还原一个人的社交网络与活动范围。金流是最难摆脱的一种 metadata，开户需要实名 KYC（金融机构确认客户身分的进程），纪录依法长期保存，跨机构双向留存，在合法进程下可被调阅，也容易被当成审查工具，从 PayPal、Venmo 冻结特定帐号的案例，到长年架设 Tor 中继节点，却被支付平台无预警关停的处境。

    听完你会看懂以开源协定为基础的替代方案各有什么取舍，例如协议层就屏蔽交易信息的隐私币 Monero、Zcash，以及零知识证明、多重签署等开源实作在技术门槛、合法性与接受度上的差别，也会掌握台湾 2026 年上路的[虚拟资产服务法（VASP 法）](../taiwan/vasp-2026.md)带来的在地脉络。社群一向强调合法是匿名支付的前提，工具用于教育与理解风险。这也为下午与 ETHTaipei 合办的匿名支付场铺路，想直接看 Monero、Zcash 与多重签署在协定层怎么各自屏蔽金流、又各自付出什么合规代价，下午那几场会逐一展开。

    :material-open-in-new: [COSCUP 官方议程页](https://pretalx.coscup.org/coscup-2026/talk/WYGFAZ/){target="_blank"}

### Day 1（8/08 下午）：ETHTaipei 合办「匿名支付」场

13:00-16:30 为与 [ETHTaipei](https://ethtaipei.org/){target="_blank"}（台北以太坊社群）合办的「匿名支付」主题场，在 `TR-511` 教室进行，议程由 ETHTaipei 安排，共五场。上午由社群导论谈「为什么要用」（公民与倡议视角、白话、不碰密码学细节），下午这五场接续展开「如何实作」，从零知识证明结合自然人凭证、KYC 的隐私保护流程、链上隐匿地址，一路谈到隐私加密金流与实作工作坊。两个社群在匿名支付主题上各有切入角度，分工与背景见[跨社群合作](#跨社群合作)。

??? abstract ":material-card-account-details-outline: 零知识证明与自然人凭证身份验证（Ya-wen Jeng，30 分钟）"

    如何在不泄漏任何个人信息的前提下，向服务提供者证明「我是台湾公民」？这场把零知识证明（zero-knowledge proof，不透露内容就能证明某件事为真的密码学方法）与自然人凭证结合成一套隐私保护身分验证系统。自然人凭证内置 RSA 非对称密钥，可对任意消息数字签章，系统以 OpenAC 电路框架设计一套 ZKP proving scheme，解析并验证凭证产生的 RSA 签章，同时在电路层面隐藏所有可识别个人的字段。

    你会看到整套流程如何在用户设备上完成，应用程序请求自然人凭证对特定 challenge 签章后，于本地端生成零知识证明，最后只把 proof 提交给验证方，验证方能确认对方是持有合法自然人凭证的台湾公民，却无从得知姓名、身分证字号等个资。讲者也会介绍已发布的 SDK 与范例应用，并涵盖 RSA 签章电路设计、on-device proof 生成的性能优化与集成示范，适合对隐私强化技术（PET）、去中心化身分（DID）与密码学应用于公民科技有兴趣的听众。

    :material-open-in-new: [COSCUP 官方议程页](https://pretalx.coscup.org/coscup-2026/talk/997SN8/){target="_blank"}

??? abstract ":material-account-check-outline: The Privacy-preserving Identity Pipeline in KYC（ryanycw / Ryan Wang，30 分钟）"

    KYC（金融机构确认客户身分的进程）有一个内在矛盾，主管机关要求强力的身分证明，但服务每多保存一笔身分数据，就多一块永久的外泄破口，传统做法把证件收齐、查核、归档，反而让每个 KYC 服务商成为高价值攻击目标、让用户承担永久的揭露风险。这场介绍 zkKYC 领域正在运作的另一套流程，用一组精选的密码学原语组合出能证明用户宣称（护照有效、已成年、与上个月注册的是同一人）却不让服务器看到身分数据的系统。

    你会创建一套评估**隐私保护身分系统**的语汇，看懂设备绑定密钥、加密的身分保存、政府签署的证件链、生物特征承诺、零知识证明与经过认证的宣称递送如何组合在一起。内容以系统设计与架构图为主，对每个密码学原语只做高层次说明、不深入数学，适合工程师与产品人，讲者也会诚实盘点尚未解决的问题，例如生物特征撤销、后量子 SNARK、不牺牲不可链接性的去重。

    :material-open-in-new: [COSCUP 官方议程页](https://pretalx.coscup.org/coscup-2026/talk/BBQDPR/){target="_blank"}

??? abstract ":material-link-off: 从不可链接性出发：隐匿地址如何解决链上金融隐私（以 Fluidkey 为例）（Jennifer HSU，30 分钟）"

    区块链上任何人都能查到一个地址的完整交易历史与余额，这种永久公开的财务纪录并不符合日常支付、薪资发放或商业往来对隐私的基本需求。这场从 ECDH 密钥交换出发，拆解隐匿地址（Stealth Address）的 ERC-5564 推导流程，收款方公开一组 stealth meta-address，每次收款都推导出一个全新的一次性地址，即使同一人收到上百笔款项，也会落在上百个彼此无关的链上地址，外部观察者无法把它们连到同一个身分，只有持有对应 viewing key 的收款人能扫出哪些地址属于自己。

    你会理解隐匿地址提供的是不可链接性（unlinkability），不保证不可追溯性（untraceability），每笔交易在链上依然可见、金额与流向都可审计，被切断的只是地址与身分、以及同一人不同地址之间的关联，因此在税务、审计这类需要选择性揭露的场景比全匿名方案更实用。最后以 Fluidkey 为例，看它把 ephemeral key 改为从 viewing key 以 BIP-32 阶层式路径推导，让用户能完全独立地重放历史地址、恢复资金，不必依赖任何中心化服务。

    :material-open-in-new: [COSCUP 官方议程页](https://pretalx.coscup.org/coscup-2026/talk/WK8EEE/){target="_blank"}

??? abstract ":material-bitcoin: 我不洗钱，为何要理解匿名支付？从零开始介绍隐私加密金流交易（黄豆泥 mashbean，30 分钟）"

    很多人以为加密货币是匿名的，事实正好相反，只要知道一个钱包地址，就能在公开链上看到对方完整的金流、社会关系与行动轨迹，对倡议组织、跨境协作的公民团体、需要保护身分的捐款人与受助者来说，这是被严重低估的风险。用最白话的方式走过链上隐私金流的设计逻辑，对照近年区块链社群发展出的三套风格迥异的方案，从被美国制裁、开发者遭起诉的混币器 Tornado Cash，到走白名单路线、把合规与隐私放进同一个架构协商的 Privacy Pool，再到以黑名单搭配冷却期与集体侦测、在 2025 年挡下 zkLend 黑客约 950 万美元洗钱的 Railgun，以及把隐私设为所有钱包默认值的 Kohaku。

    离开时你会带走一个比技术更难的问题，当隐私从技术问题延伸成**治理问题**，由谁来定义好人与坏人？这场适合关心数字人权与公民安全的工作者、想了解加密货币合规边界的法遵与会计人员，以及对「我又没做坏事，为什么要在乎隐私」这句话感到不太对劲的人。

    :material-open-in-new: [COSCUP 官方议程页](https://pretalx.coscup.org/coscup-2026/talk/QGUGMK/){target="_blank"}

??? abstract ":material-hammer-wrench: 隐私支付实作工作坊：从龙卷风现金到隐私池（Liangcc，50 分钟）"

    工作坊从用户视角出发，介绍龙卷风现金（Tornado Cash）的设计哲学，以及隐私池（Privacy Pool）在它之上的改进。

    现场会用道具与实机操作示范两样工具如何操作，不需自备电脑或动手写程序，跟着看就好，你能带走的是实际使用上的隐私眉角，密码学细节则点到为止。时间允许的话，也会谈这些工具的沿革与在现实世界造成的冲击。

    :material-open-in-new: [COSCUP 官方议程页](https://pretalx.coscup.org/coscup-2026/talk/3WHJYA/){target="_blank"}

### Day 2（8/09）：七场录取议程

这七场从网络与审查如何运作的基础开始，接着是家用网络与校园 Tor 节点的实地部署，再到区块链身分、浏览器追踪、健保数据库个资权利与个人隐私指南等制度与个人层面的实践，技术深浅不一，可挑与自己最相关的场次听。

??? abstract ":material-web: The Workings of the Internet：网络如何运作、审查如何挡住你（Raghu，50 分钟，英文进行）"

    你在浏览器输入 `google.com` 按下 enter，封包到底经过哪些方的手？这场用**寄明信片的比喻**，带你看清楚从你的设备到目标网站之间，有哪些（多半合法的）角色经手、它们能看到什么、又能改动什么。议程以英文进行，但用生活比喻切入、不预设技术背景，英文不熟也能跟上大意。

    理解这套机制之后，你会看懂审查、监控与数据外泄是如何发生的，也看得出那些把你吓去买「某某 VPN」的广告话术问题在哪。听完你可能会惊讶预设情况下网络有多不隐私，也会开始更严格地看待那些掠夺式的 VPN 行销。

    :material-open-in-new: [COSCUP 官方议程页](https://pretalx.coscup.org/coscup-2026/talk/UY8UQN/){target="_blank"}

??? abstract ":material-router-network: 以 OpenWRT 等开源软件创建家用网络环境（Pellaeon Lin，30 分钟）"

    OpenWRT 是一套开源的路由器操作系统。跳过基本网络设置，直接示范一般家用路由器不提供、但用一点 OpenWRT 设置就能达成的方便、安全与隐私功能。

    你会学到挑选支持 OpenWRT 硬件的要点、用 VLAN 做访客网络与危险设备隔离、把电信商配发的多个 IP 透过多 WAN 充分运用、设置策略路由与 site-to-site VPN、阻挡危险 IP 与域名，以及把 VPN 供应商与 Tor 设成特殊上游网络。

    :material-open-in-new: [COSCUP 官方议程页](https://pretalx.coscup.org/coscup-2026/talk/CNNASG/){target="_blank"}

??? abstract ":material-fingerprint: 区块链网络上基于开放标准的实体身份识别方法（Yusef Schultz，30 分钟）"

    各国政府陆续参考并引入区块链防洗钱法案，避免国际犯罪，共同特色就是定位用户本身。台湾称为**虚拟资产服务法**的法案已在 2026 年 4 月 2 日通过，台湾人的身分如何被定位，将逐渐成为台湾虚拟资产持有者关注的议题。

    讲者会盘点现代用于链上身分定位的几种开放标准，听完你会对「自己的身分在区块链上如何被认定」有具体概念，也会了解密码学研究为这个领域带来的正面技术影响。

    :material-open-in-new: [COSCUP 官方议程页](https://pretalx.coscup.org/coscup-2026/talk/ZV88PP/){target="_blank"}

??? abstract ":simple-torproject: 在学校种洋葱？台师大 Tor 节点创建实务与 EFF Tor University Challenge 经验谈（NZ，30 分钟）"

    学术网络带宽稳定、IP 声誉良好，一直是全球 Tor 网络最重要的支柱之一，但在校园环境部署 Tor 节点要同时处理技术配置与校内政策。讲者会分享在国立台湾师范大学（NTNU）创建学术 Tor 节点的完整历程。

    从 EFF 发起的 Tor University Challenge 计划缘起与意义，到 Linux 环境下的节点配置与防火墙规则、如何与学校信息单位沟通并应用 EFF 提供的法律指南，以及创建节点后的流量观察，你会得到一套能拷贝到自己学校的实战参考，讲者也希望藉这段经验鼓励更多台湾学研单位投入全球隐私基础设施的建设。社群整理过的校园架设脉络见[校园 Tor Relay 创建](../community/relay-on-campus.md)。

    :material-open-in-new: [COSCUP 官方议程页](https://pretalx.coscup.org/coscup-2026/talk/7AP8HY/){target="_blank"}

??? abstract ":material-eye-off-outline: 浏览器追踪技术、反追踪策略和用户自主（Pellaeon Lin，50 分钟）"

    现代浏览器提供许多看似不属于网页的 API：WebGL 让网页使用图形加速、WebAudio 让网页运行复杂的音频合成、WebAssembly 让网页直接运行低级脚本。这些与硬件紧密结合的 API 让网页能做的事变多，也让网页得以搜集更多用户数据、更精准地**追踪与识别用户**，而且网页要求时就自动激活，不会征询用户同意。

    Pellaeon Lin 会分享他对浏览器指纹（browser fingerprint）与反追踪的研究，你会看清自己的浏览器可能如何泄漏行踪，以及 Tor Browser、Brave、VPN 等软件各自的反追踪策略、潜在解法与实际使用心得。

    :material-open-in-new: [COSCUP 官方议程页](https://pretalx.coscup.org/coscup-2026/talk/KSWEDB/){target="_blank"}

??? abstract ":material-database-lock: 健保数据库案之后：停止利用权如何实践？以及其他大型数据库（Kuan-Ju Chou，30 分钟）"

    台湾的就医数据多年来未经病人同意，就提供产业与学界使用。自台湾人权促进会、台湾女人连接、健保监督联盟三个民间团体发动退出权诉讼以来，健保数据库的目的外利用陆续停止贩售光盘、限缩至仅供研究使用。2022 年宪法诉讼最终确认政府必须让人民实践**停止利用权**，也就是不同意将个资提供其他目的使用，去年台湾完成修法，开始让民众行使这项权利，但立法过程增加不少例外，大幅缩小了范围。

    现场会说明如何申请停止利用权、目前有哪些限制，你会知道如何为自己的医疗个资行使这项权利，也会认识台湾还有哪些规范不明、对个资当事人权利保障尚不清楚的大型数据库，需要公民社会一起监督。

    :material-open-in-new: [COSCUP 官方议程页](https://pretalx.coscup.org/coscup-2026/talk/GEKJRV/){target="_blank"}

??? abstract ":material-shield-account-outline: 隐私指南 2026（Justyn，50 分钟）"

    从个人到组织，这场工作坊与座谈依序处理三件事。第一，创建**个人隐私风险矩阵**，把广告追踪与数据仲介、诈骗与盗帐号、亲密关系加害者、跨境盘查、针对性监控等威胁来源分级，对应到数字身分、行动设备、SaaS 与云端、金流四个暴露面，每一格给出以开源工具与设备内置设置为主的预设配置建议。第二，自我检核方法学，重点放在方法本身，如何看 App 内嵌的追踪器、如何观察设备真正连去哪里、如何读懂 iOS App Privacy Report，并对照 NIST Privacy Framework 与 OWASP MASVS 做最小自评。第三，组织层面的多人协作隐私，针对 NGO、独立媒体、小型公司，涵盖共享密码管理、端对端加密协作、组织遭遇法律调取数据的事前准备，以及 Shamir Secret Sharing、门槛签章（FROST、TSS）、MPC（多方计算）、Private Set Intersection（隐私集合交集）、OpenMLS 等较高级、适合技术背景组织管理者的前瞻工具（非技术背景可略过这串工具名，不影响前两部分。有密码学背景的组织管理者，第三部分的门槛签章、MPC、PSI 才是重点）。

    不管你是个人、NGO 还是小型团队，都能带走一份对照自己情境的预设配置与**自我检核方法**，遇到新工具、新威胁、新法规时知道如何自己判断，不必死背一份推荐清单，密码学细节本身则点到为止。

    :material-open-in-new: [COSCUP 官方议程页](https://pretalx.coscup.org/coscup-2026/talk/K8BYBU/){target="_blank"}

## :material-handshake: 跨社群合作：匿名网络社群 × ETHTaipei { #跨社群合作 }

今年社群与 [ETHTaipei](https://ethtaipei.org/){target="_blank"}（台北以太坊社群）展开议程合作，8/08 下午的「匿名支付」合办场把关心数字人权的社群和区块链开发者带到同一个房间。NGO 与记者能在这里了解捐款与金流的隐私风险，开发者则能听到协议层的零知识证明与隐匿地址实作。应用导向、科普类稿件安排在匿名网络社群议程轨，技术、协议层稿件可能调整到 ETHTaipei 区块链议程轨（见[征稿与联合审稿安排](./coscup-2026-cfp.md#anoni-netxETHTaipei)），欢迎在两个议程轨之间跨场。

## :material-account-voice: 讲者简介 { #讲者简介 }

8/08 上午四场开源匿名网络导论由 anoni.net 社群成员担纲（社群中实际维运 Tor 中继节点、参与 Tails 与 OONI 正体中文化与问题回报的成员），社群背景见[关于我们](../about/index.md)。以下依议程顺串行出邀请与合办讲者，点名字可看 COSCUP pretalx 上讲者本人提供的完整简介。

**8/08 下午 ETHTaipei 合办「匿名支付」场**

- **[Ya-wen Jeng（Vivian Jeng）](https://pretalx.coscup.org/coscup-2026/speaker/KBPWBX/){target="_blank"}**：任职 Ethereum Foundation 的 Privacy Stewards of Ethereum 团队，专注零知识证明与隐私技术推广，主导 Mopro、Unirep 等开源工具开发。主讲「零知识证明与自然人凭证身份验证」。
- **[ryanycw（Ryan Wang）](https://pretalx.coscup.org/coscup-2026/speaker/8WM9UR/){target="_blank"}**：DeFi 开发者，ETHTaipei 共同主办，关注隐私、技术与以太坊。主讲「The Privacy-preserving Identity Pipeline in KYC」。
- **[Jennifer HSU](https://pretalx.coscup.org/coscup-2026/speaker/ZJ98MX/){target="_blank"}**：任职自托管隐私钱包 Fluidkey，台湾开发者社群 XueDAO 创办人，推广区块链技术。主讲「从不可链接性出发：隐匿地址如何解决链上金融隐私」。
- **[黄豆泥 mashbean](https://pretalx.coscup.org/coscup-2026/speaker/ZMHFCQ/){target="_blank"}**：专注分布式科技与数字自主权，Matters 总经理，曾任数字发展部资安制度工程师（推动数字凭证皮夹与开放网络标准、参与 W3C），现为哈佛大学政策访问研究员与以太坊基金会 Silviculture 成员。主讲「我不洗钱，为何要理解匿名支付？」。
- **[Liangcc（CC）](https://pretalx.coscup.org/coscup-2026/speaker/UYKEPE/){target="_blank"}**：在以太坊生态开发零知识应用，关注人文、经济与密码学证明。带领「隐私支付实作工作坊：从龙卷风现金到隐私池」。

**8/09 Day 2 议程**

- **[Raghu](https://pretalx.coscup.org/coscup-2026/speaker/X3GX3V/){target="_blank"}**：后端工程师，投入 IP、TCP、封包分析与资安研究。主讲「The Workings of the Internet」（英文进行）。
- **[Pellaeon Lin](https://pretalx.coscup.org/coscup-2026/speaker/BJYRYX/){target="_blank"}**：数字安全研究员与讲师，关注数字人权与自由软件。主讲「以 OpenWRT 等开源软件创建家用网络环境」与「浏览器追踪技术、反追踪策略和用户自主」两场。
- **[Yusef Schultz](https://pretalx.coscup.org/coscup-2026/speaker/FAGUY7/){target="_blank"}**：主讲「区块链网络上基于开放标准的实体身份识别方法」，完整简介见 pretalx 讲者页。
- **[NZ（苏恩立）](https://pretalx.coscup.org/coscup-2026/speaker/WCJNBL/){target="_blank"}**：台师大资工系学生，维运台湾学术网络（TANet）首个 Tor 节点，关注资安与网络治理。主讲「在学校种洋葱？台师大 Tor 节点创建实务与 EFF Tor University Challenge 经验谈」。
- **[Kuan-Ju Chou](https://pretalx.coscup.org/coscup-2026/speaker/UAREZS/){target="_blank"}**：在台湾人权促进会服务，负责数字人权。主讲「健保数据库案之后：停止利用权如何实践？」。
- **[Justyn](https://pretalx.coscup.org/coscup-2026/speaker/WZGMJG/){target="_blank"}**：主讲「隐私指南 2026」，完整简介稍后于 pretalx 讲者页更新。

## :material-link-variant: 相关链接

- [COSCUP 2026 公开征稿](./coscup-2026-cfp.md)：征稿主题、跨社群合作与投稿说明
- [匿名网络工作坊 2025（活动纪录）](../event-workshop-2025.md)：去年两日工作坊与圆桌会议的内容
- [延续 2025，走向 2026：个人隐私指引、Tor Relay 校园创建竞赛、匿名支付探索](../blog/posts/2025to2026.md)
- [关于我们](../about/index.md)
- [如何参与与认领主题](../community/how-to-contribute.md)：想一起贡献 Tor、OONI、翻译或架设节点的入口
- [Tor Project 生态与对接](../community/tor-project-ecosystem.md)：与上游 Tor 项目对接的导引

!!! info "活动更新与联系"

    议程细节与时间到活动前仍可能调整，最新时间请以 [COSCUP 官方议程](https://pretalx.coscup.org/coscup-2026/){target="_blank"} 为准。想收到社群活动通知，欢迎[持续关注](../contact.md)我们的电子报与联系管道。
