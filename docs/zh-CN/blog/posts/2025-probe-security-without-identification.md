---
date: 2025-03-16
authors:
    - toomore
categories:
    - 技术
    - OONI
    - 翻译文章
slug: 2025-probe-security-without-identification
image: "assets/images/ooni-credentials-table.png"
summary: "OONI 预计实施匿名凭证以减缓虚假观测数据对观测数据库可信度的影响"
description: "OONI 预计实施匿名凭证以减缓虚假观测数据对观测数据库可信度的影响"
---

# 去识别化的观测数据安全

!!! info ""

    以下内容原文翻译自以下文章，主词角色为 OONI：

    - [Probe Security Without Identification, Michele Orrù 2025-02-20](https://ooni.org/post/2025-probe-security-without-identification/){target="_blank"}

<figure markdown="span">
    <a href="https://ooni.org/post/2025-probe-security-without-identification/images/chaum.png" target="_blank">
        <img src="https://ooni.org/post/2025-probe-security-without-identification/images/chaum.png"
            alt="Security without identification: transaction systems to make big brother obsolete"
            title="Security without identification: transaction systems to make big brother obsolete"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 100%);">
    </a>
    <capture>在他那篇具有开创性的论文《[没有身份识别的安全性：使老大哥过时的交易系统](https://dl.acm.org/doi/10.1145/4372.4373){target="_blank"}》中，Chaum 构想了一个用户可以使用单一数字钱包匿名与多个组织互动的未来，即使这些组织互相勾结。</capture>
</figure>

为了提升 OONI 观测数据的可信度，并防止故意或无意上传的错误测量结果对 OONI 数据库的影响，我们正在考虑在 OONI Probe 中设计和实施匿名凭证。在这篇文章中，我们提供了匿名凭证的现有文献回顾。这是为了让对密码学领域不太熟悉但又好奇的读者能够深入了解其所依据的协议。

## 为什么要为 OONI 建立匿名凭证系统？

OONI 的运作依赖于全球志愿者社区，他们进行测试以检测和记录世界各地的网络审查状况，从而提高关于数字人权侵犯的透明度。随着 OONI Probe 网络的扩展，部分用户（无论是自愿或非自愿）可能会通过向服务器提供错误观测数据资料来污染测量结果的风险也随之增加。这可能源于刻意攻击，通过上传假测量数据来诋毁 OONI 平台，又或者是由于 OONI Probe 安装错误所导致。

<!-- more -->

例如，恶意行为者可能会在相同网络上、对仅仅少数网站、并在短时间内上传虚假测量数据，这将使得识别这些伪造的测量相对容易。一名更高级的行为者可能会通过多个网络上传涉及多个 URL 的少量虚假数据，并且分散在很长一段时间内进行，这样更难以检测到他们的活动。在这些情况下，攻击者的目标可能是用虚假数据来污染 OONI 数据库，使平台的可信度受到质疑。他们也可能感兴趣于利用 OONI 观测数据来散布特定国家或地区的审查误导信息，例如声称某些被封锁的网站并没有被封锁，或反之亦然。

常见的缓解错误测量污染风险的方法包括实施基于 IP 的封锁、用户账户（需要注册和登录）以及设备认证。这些解决方案对 OONI 来说都不太理想，因为这可能会暴露我们的社区（甚至使其处于危险之中）。因此，我们一直在**研究可能的密码学解决方案，以便在不追踪用户或妥协用户匿名性的情况下建立信任**。

OONI 的基础设施相当特殊：用户上传的隐私在网络层级和应用层级都被优先考虑。而且，用户也可以通过使用绕过或匿名工具（例如 Tor）来上传测量数据，从而维持更强的匿名性。此外，OONI 负责接收和维护用户上传的数据。主要的数据流结构如 OONI 的后端文件中所示：

![OONI Data Flow](https://ooni.org/post/2025-probe-security-without-identification/images/backend.png)

理想情况下，我们希望能够导入并建立对上传观测数据的信任。我们特别想在 `checkIn(ProbeMeta)` 和 `upload(Measurements)` 流程中建立信任，并能在不增加流程复杂性或对用户或服务器造成负担的情况下，阻止错误（或恶意）的观测结果。

简单来说，我们正在寻找一个具备以下特性的匿名身份验证系统：

* 能够扩展到每秒数百次的验证
* 不识别化用户
* 允许 OONI 实施政策以缓解潜在攻击或错误数据上传
* 能够融入 OONI 的测量数据上传系统
* 给长期贡献于系统的用户分配更高的信任等级
* 惩罚上传不良数据的用户

近年来，一些大型 VPN 供应商和内容交付网络（CDN）采取了一种方法，我们也一直密切关注：**匿名凭证**。

匿名凭证是一种签名，但签名持有者不是直接揭示它，而是在零知识的情况下证明这些属性满足某个特定条件。展示凭证可以证明用户具备特定属性，但不会揭露过多的信息。我们称这个过程为展示凭证。发行凭证的实体称为「发行者」；接收到凭证的实体称为「证明者」。验证凭证的实体称为「验证者」。在 OONI 的语境中，[OONI Probe](https://ooni.org/install/){target="_blank"} 是用户，而 [OONI 后端](https://github.com/ooni/backend){target="_blank"}则同时是发行者和验证者。

## 文献回顾：匿名凭证

在匿名凭证的领域中，可以区分两条研究路线：

1. 键控验证凭证（Keyed-verification credentials, KVAC）：其中发行者和使用者是同一个实体，并且都持有相同的签名密钥。这些方案通常依赖于较轻量的密码学技术，例如，今天的 [Signal](https://signal.org/){target="_blank"} 就采用了这些方案。

2. 公开验证凭证（Public-verification credentials）：其中发行者和使用者可以是不同的实体。在这种情况下，发行者持有签名密钥，而使用者则持有相应的验证密钥。如你所料，在此情况下，验证者无法生成新的凭证。这是大型身份项目，如 [Idemix](https://github.com/IBM/idemix){target="_blank"} 的案例。

!!! info "翻译补充"
    在中国大陆的语境下，**键控验证凭证（Keyed-verification credentials, KVAC）**和**公开验证凭证（Public-verification credentials）**可以关联到以下几个服务与应用：
    - Keyed-verification credentials (KVAC):
        - 金融交易验证：例如使用手机 APP 进行移动支付时，通过银行的数字凭证和多重身份验证机制来确认交易安全性。
        - 企业内部系统：大型公司内部使用的验证系统，如利用企业专属密钥来确保只有授权员工可以访问敏感数据或系统。
    - Public-verification credentials:
        - 居民身份证电子证书：中国政府发行的证书，用于验证个人在网络上的身份，例如办理各类政务服务时的线上验证。
        - SSL 证书：用于网页加密，确保用户浏览的网站是安全的，并且网站身份可被公众验证，例如政府机构或大型企业的网站通常会使用这种证书。

凭证还可以从另一个角度进行观察：

1. **单次使用凭证**：这类凭证在用户出示一次后便不可再次使用。它们的处理速度非常快，甚至可以简单到只需使用盲签名方案（例如20世纪80年代由 David Chaum \[[Chaum82]{target="_blank"}\] 发明的方案）。单次使用的键控验证凭证（KVAC）有时被称为「匿名令牌（anonymous tokens）」，通常受到可验证随机函数 \[[RFC9497](https://datatracker.ietf.org/doc/rfc9497/){target="_blank"}\] 的启发，它依赖于由Jarecki等人 \[[JarKiaKra14](https://eprint.iacr.org/2014/650.pdf){target="_blank"}\] 用于 [IETF 隐私通行证](https://datatracker.ietf.org/wg/privacypass/documents/){target="_blank"}标准的 VOPRF，或是 Chaum \[[Chaum82]{target="_blank"}\] 的盲 RSA 签名方案。此处一些应用例子包括：
[Chaum82]: https://sceweb.sce.uhcl.edu/yang/teaching/csci5234WebSecurityFall2011/Chaum-blind-signatures.PDF
      * Google 的 BoringSSL 实现了匿名令牌 \[[KLOR20](https://eprint.iacr.org/2020/072.pdf){target="_blank"}\]。
      * 盲 RSA 签名也被 [Apple Cloud Relay](https://www.apple.com/icloud/docs/iCloud_Private_Relay_Overview_Dec2021.pdf){target="_blank"} 和 [Google One 的 VPN 服务](https://one.google.com/about/vpn/howitworks){target="_blank"}所使用。

1. **多次使用凭证**：此类凭证允许用户多次出示同一凭证。它们由 Anna Lysyanskaya 和 Jan Camenisch 于 2002 年引入（用于公开验证），由 Melissa Chase、Sarah Meiklejohn 和 Greg Zaverucha 于 2014 年引入 [CMZ14]（用于键控验证）。例子包括：
      * **基于 Camenisch–Lysyanskaya** \[[CamLys01]{target="_blank"}, [CamLys02]{target="_blank"}\]：这包括由 Open Wallet Foundation 赞助的 [Bifold](https://github.com/openwallet-foundation/bifold-wallet){target="_blank"} 和 [Aries RFC](https://hyperledger.github.io/aries-rfcs/latest/){target="_blank"}。
      * **基于 Chase–Meiklejohn–Zaverucha** \[[ChaMeiZav14]{target="_blank"}, [PoiSan16]\]：用于 [Signal](https://signal.org/blog/signal-private-group-system/){target="_blank"} 的私人群组系统 \[[ChaPerZav20]{target="_blank"}\]，[NYM Technologies](https://nymtech.net/docs/coconut.html){target="_blank"}，以及 Tor 用于桥接节点的分发 \[[TulGol23]{target="_blank"}\]。
      * **基于 BBS 签名** \[[BonBoySha04]{target="_blank"}, [TesZhu23b]{target="_blank"}\]：这种方案是在公开验证环境中历史最悠久且使用最广泛的。BBS 正在被 W3C 和 IETF 考虑：W3C 在[分散身份](https://decentralized-id.com/web-standards/w3c/verifiable-credentials/data-integrity-bbs+/){target="_blank"}和[可验证凭证](https://www.w3.org/TR/vc-data-model-2.0/){target="_blank"}方面进行多项努力，并在这些努力中提到 BBS。IETF 目前对 [BBS 凭证](https://datatracker.ietf.org/doc/draft-irtf-cfrg-bbs-signatures/){target="_blank"}有一个正在进行中的提案。此外，BBS 被[建议](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/issues/200){target="_blank"}作为欧洲数字身份的解决方案，并被 [Idemix](https://github.com/hyperledger/fabric/blob/main/docs/source/idemix.rst){target="_blank"} 用于其 DLOG 凭证（Idemix 也由 [IRMA](https://github.com/privacybydesign/irmago){target="_blank"} 实现），以及提供可重复使用数字身份和可验证凭证的区块链网络 [Dock](https://github.com/docknetwork/crypto){target="_blank"} 所采用。

[CamLys01]: https://www.iacr.org/archive/eurocrypt2001/20450093.pdf
[CamLys02]: https://cs.brown.edu/~alysyans/papers/camlys02b.pdf
[ChaMeiZav14]: https://eprint.iacr.org/2013/516
[PoiSan16]: https://eprint.iacr.org/2017/1197.pdf
[ChaPerZav20]: https://signal.org/blog/pdfs/signal_private_group_system.pdf
[TulGol23]: https://petsymposium.org/popets/2023/popets-2023-0029.pdf
[BonBoySha04]: https://crypto.stanford.edu/~dabo/papers/groupsigs.pdf
[TesZhu23b]: https://eprint.iacr.org/2023/275

为什么有人需要多次出示一个凭证呢？想想纸质的身份文件：它们也会被多次出示（但它们在隐私保护方面很差）。在 OONI 中，我们预期用户会多次上传观测报告，虽然我们可以发送一批单次使用的凭证（这在过去被 Cloudflare 用于 [Internet Challenge Bypass Privacy Pass](https://research.cloudflare.com/publications/Davidson2018/){target="_blank"}），但这样的方式效率不高。

当然，可以想象一个应用程序发放 1,000 个一次性令牌，然后每次「烧掉」其中一个来替代多次使用凭证。然而，这样会在应用层面增加负担，必须调整凭证发放的数量并确定何时检查、更新可用令牌的库存。因此专门为多次使用情境设计的方案就更有效率。

![Credentials Hardness](https://ooni.org/post/2025-probe-security-without-identification/images/credentials-hardness.png)

除了基本的凭证系统中，允许用户仅表示他们已被系统「信任」之外，还有许多非必要的功能可以匿名地向服务器证明。这些密码学扩展功能包括：

* **有效期限：**实施基于时间的凭证有效期限。
* **网络相关身份：**在不同网络中保持用户不可关联性，但在相同网络中保持一致的临时标记。
* **发行门槛：**设定一些受信任的权威机构负责发行凭证，并集体决定谁不应该拥有访问权。
* **撤销：**允许移除被破坏或过期的凭证。
* **发行者盲视：**防止发行者了解他们所签署凭证的内容。
* **范围证明：**证明数值属性需位于特定范围内。
* **凭证对接：**在不同系统间连接凭证，同时保持隐私。

这些功能可以独立于基础凭证系统实现 \[[Orru24]{target="_blank"}\]，允许根据特定需求进行灵活部署。虽然每个功能会带来其特有的运算和存储成本，但这些权衡可以与核心凭证协议分开评估。

[Orru24]: https://eprint.iacr.org/2024/1552.pdf

<figure markdown="span">
    <a href="https://ooni.org/post/2025-probe-security-without-identification/images/credentials-table.png" target="_blank">
        <img src="https://ooni.org/post/2025-probe-security-without-identification/images/credentials-table.png"
            alt="匿名凭证在理论密码学中的全貌，以及 OONI 的定位。"
            title="匿名凭证在理论密码学中的全貌，以及 OONI 的定位。"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 100%);">
    </a>
    <capture>匿名凭证在理论密码学中的全貌，以及 OONI 的定位。</capture>
</figure>

在文献之外，观察**当前部署凭证的生态系统**，从成熟的老牌公司到新兴的早期区块链项目，可以看到以下三种类型：

1. **基于通用盲签章的凭证：**这些凭证非常轻量，但在效率和可用性之间进行了取舍，对支持的功能和使用次数加以限制。在过去几年中出现了多种一次性凭证，尤其是在键控验证环境中，Verifiable Oblivious Pseudorandom Functions 已经成为主要方案。尽管这些签章很简单，但在离散对数环境中发行这些签章需要**超过**一次的交互。

2. **基于支持零知识的签名方案和消息验证码的凭证：**这种方法选择具有优良「代数」属性的签名方案。若这些「代数」属性与零知识证明系统中的代数运算兼容，就能得到一个匿名凭证，用户可以证明任何基于底层零知识证明系统所支持的内容。例如，这些签名不需要依赖哈希函数，通常是基于离散对数问题难以解决的群。这些数据结构的一个优势是可以在一次互动中完成：在发行时，用户可以请求凭证，服务器会立即回应。

3. **基于零知识证明的凭证：**这一广泛类别的凭证通常依赖于 SNARKs 和递归 SNARKs，通常集中在为一个标准化的通用签名方案证明签名验证，或完全去除签名，建立用户所拥有的秘密密钥的哈希树，然后通过证明成员资格和非成员资格用于身份验证。这种类别通常缺乏公开的可验证安全性形式化。在区块链等难以确认有签名权的单一实体或小群体的情境中，这是常见的状况。但在理论上很难见到这种方法的形式化。以下是两个例子：

    * [Semaphore 库](https://semaphore.pse.dev/){target="blank"} 和来自 [Privacy Scaling Explorations (PSE)] 的 [Anon Aadhaar 协议](https://pse.dev/en/projects/anon-aadhaar){target="_blank"} 是一套用于在以太坊区块链上构建匿名通信应用程序的工具，依赖于通用的零知识简洁证明（zk-SNARKs）。
    * [Zupass](https://github.com/proofcarryingdata/zupass){target="_blank"} 是基于证明数据记载的身份验证系统。

基于签章的方案与高效率的协议似乎能够提供我们所需的一切：一次互动、可靠的安全证明，并具备可扩展的空间——同时保持实时高效和可延展。

匿名凭证似乎是用户登录和基于位置封锁的极佳替代方案。对我们来说，它们可以在不影响最重要因素的情况下加强我们的测量平台：那些优秀的志愿者社区的隐私和安全，这将使得 OONI 的审查观测成为可能。

我们已经在尝试一个原型，迫不及待想与您分享我们的进展。
