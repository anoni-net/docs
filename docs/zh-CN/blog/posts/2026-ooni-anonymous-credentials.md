---
date: 2026-02-05
authors:
    - toomore
categories:
    - 技术
    - OONI
summary: "从高层次介绍 OONI 如何为 OONI Probe 设计并打造匿名凭证系统。"
description: "从高层次介绍 OONI 如何为 OONI Probe 设计并打造匿名凭证系统。"
---

# OONI 全新的匿名凭证系统

!!! info ""

    **翻译说明：**OONI 依赖全球志愿者上传网络审查观测数据，但随着参与者增加，虚假数据或错误测量也可能混入，影响数据库的可信度。传统做法如 IP 封锁、要求账户登录或设备认证，会暴露志愿者身份，与 OONI 保护隐私的承诺相冲突。因此 OONI 转向**匿名凭证**：用密码学方式验证「这笔测量来自符合条件的 OONI Probe」，却不揭露用户是谁、身在何处，也不让不同网络的活动被串起来。以下内容将介绍 OONI 如何打造这套系统。

    以下内容原文翻译来自以下文章，主词角色为 OONI：

    - [Announcing OONI's New Anonymous Credential System, OONI Team 2026-01-30](https://ooni.org/post/2025-announcing-ooni-new-anonymous-credential-system/){target="_blank"}

在先前的文章中，我们已说明[为什么 OONI 需要匿名凭证系统](./2025-probe-security-without-identification.md)，并整理了这类系统必须满足的[信息安全与隐私需求](http://ooni.org/post/2025-requirements-for-oonis-anonymous-credentials/){target="_blank"}。核心挑战在于：OONI 必须在「不建立任何可能暴露用户身份、或造成跨网络追踪的识别码」的前提下，仍能对上传的测量结果建立可信度[^1]。

匿名凭证（anonymous credentials）提供一种密码学机制：可以在不暴露用户是谁、身在何处、也不把其活动在不同网络之间串起来的情况下，验证 OONI Probe 的某些属性（例如长期参与程度或测量量）。

<!-- more -->

## OONI 的需求

要符合 OONI 的威胁模型（threat model），凭证系统必须满足以下限制：

- **防止跨网络可关联性（cross-network linkability）**：仅支持「网络在地（network-local）」的识别方式。
- **验证元数据（metadata）**（probe_age、measurement_count、blocklist/trust status），但不揭露原始数值，也不破坏匿名性。
- **抵抗伪造与女巫攻击（Sybil attacks）**：确保恶意者不易大量创造或操弄身份。
- **支持频繁、多次出示（multi-show presentations）**：因为 OONI Probe 会持续不断上传测量数据。
- **避免缩小匿名集合（anonymity sets）**[^2]：即使在测量数据中加入更多元数据，也不要让用户变得更容易被识别。

既有的凭证生态系统（例如以盲签名为基础、适合零知识的签名、或基于 SNARK 的建构）各自能满足其中一部分需求，但无法一次涵盖全部。尤其是 OONI 需要 **签发者在地验证（issuer-local verification）**、**高效率的范围证明（range proofs）**、**依网络而定的假名（network-dependent pseudonyms）**，以及 **凭证更新协议（credential update protocols）**。在不做重大妥协的前提下，市面上没有现成方案能完整符合这些限制[^3]。

## 打造模块化、具表达力的凭证框架

我们与 Ian Goldberg（滑铁卢大学）、Lindsey Tulloch（Tor Project）、Victor Graf（Risc Zero）合作，打造了一个分层式系统，用来建构零知识凭证与相关协议。这套系统包含三个 Rust crate（*cmz*、*sigma-compiler*、*sigma-proofs*）：实现经充分研究的 sigma-protocols，并把高阶陈述（statements）编译成高效率、以线性代数为核心的证明陈述。
同时，我们也在推动这些协议的 CFRG 草案（[draft-irtf-cfrg-sigma-protocols](https://datatracker.ietf.org/doc/draft-irtf-cfrg-sigma-protocols/)、[draft-irtf-cfrg-fiat-shamir](https://datatracker.ietf.org/doc/draft-irtf-cfrg-fiat-shamir/)）[^4]。

其中一些对 OONI 特别重要的功能包括：

1. **可多次出示（multi-show）且签发者在地验证（issuer-local verification）**：OONI 的使用模式类似 KVAC 凭证（签发者＝验证者），CMZ 与 μCMZ 方案可直接支持。
2. **高效率的范围证明（range proofs）**：probe_age 与 measurement_count 需要以「粗略区间」[^5]呈现（例如 >1 周、>1000 笔测量），以避免产生近乎唯一的组合。sigma-rs 的堆栈可用相对精简的方式支持这些范围证明。
3. **网络在地假名（network-local pseudonyms）**：OONI Probe 必须做到「每个网络呈现一个身份」，但在不同网络之间仍要保持不可关联。这很自然地映射到 sigma-rs 使用的属性与约束系统（例如：pseudonym = secret * DOMAIN）。
4. **签发与更新协议（issuance + update protocols）**：我们的模型需要「出示旧凭证、在不揭露底层数值的情况下取得更新后的新凭证」（例如 measurement_count +1），这正是 UserAuth 范例描述的模式。

## OONI 的凭证长什么样

OONI 的匿名凭证包含以下属性：

``` rust
CMZ! { UserAuthCredential:
    nym_id, // a stable per-installation secret
    age, // coarse bucket
    measurement_count // measurements submitted
}
```

这些属性对应到我们在需求文章中描述的额外元数据，同时仍遵守匿名性的限制。

### 「提交测量」协议的高阶概观

使用 sigma-rs 的 μCMZ API，「提交新的测量」在概念上大致长得像这样：

``` rust
muCMZProtocol!(submit<min_age_today, max_age, min_measurement_count, max_measurement_count, @DOMAIN, @NYM>,
    Old: UserAuthCredential { nym_id: H, age: H, measurement_count: H},
    New: UserAuthCredential { nym_id: H, age: H, measurement_count: H},
    // the per-installation secret is the same
    Old.nym_id = New.nym_id,
    // the age is the same
    Old.age = New.age,
    // the new measurement count is increased
    New.measurement_count = Old.measurement_count + 1,
    // the submitted NYM is correct
    NYM = Old.nym_id * DOMAIN,
    // the age and measurement counts are within the desired range
    (min_age_today..=max_age).contains(Old.age),
    (min_measurement_count..=max_measurement_count).contains(Old.measurement_count) );
```

这能确保：

- OONI Probe 维持相同的网络在地假名
- measurement_count 单调递增（不会倒退或跳号造假）
- 年龄分桶（age bucket）保持正确
- OONI 看不到原始数值——只能验证「被证明的陈述」
- 恶意客户端无法伪造可信度元数据

*服务器只会看到证明（proof）*[^6]，看不到底层属性值。

属性 `measurement_count` 用于评估用户在该网络中的参与程度，而不是用来对用户做速率限制（rate limit）。

## 与 OONI 代码库的整合

OONI Probe 引擎主要以 Go 编写，而匿名凭证系统则以 Rust 实现。为了干净地整合两者，我们在 Rust 端提供一个小型、兼容 C 的 API，并通过 rust2go 产生 Go 的绑定（bindings）。设计上我们清楚切分职责：Rust 负责所有密码学（凭证签发、零知识证明、验证、更新），而客户端负责协调流程、持久化（persistence）与状态机（state machines）。

Rust 函数库扮演一个自成一体的「加密引擎（crypto engine）」：它接收不透明（opaque）的输入（目前的凭证与协议参数），产生要送给服务器的协议消息，并处理服务器响应以返回更新后的凭证。所有状态管理则刻意交由调用端应用程序处理，以让 API 维持精简且易于移植[^7]。

- 在移动设备 App 上，这是 OONI 的跨平台客户端：[OONI probe-multiplatform](https://github.com/ooni/probe-multiplatform)
- 在 CLI 上，这是 OONI 的 Go CLI 客户端（miniooni、ooniprobe）：[OONI probe-cli](https://github.com/ooni/probe-cli)

客户端负责存储与重新加载：

- 最新的凭证 blob
- 在请求之间需要保留的任何本机状态（例如 request/response 之间尚未完成的协议状态）

这能让边界维持干净：Go 端把凭证与协议消息都当作不透明的 bytes。Rust 端则在内部强制所有正确性与隐私性属性。

### 数据交换模型

在 Rust↔Go 的边界之间，我们只传递：

- **不透明（opaque）的序列化协议消息**：bytes，为了 JSON 传输通常会再做 Base64 编码。
- **公开参数（public parameters）**：例如签发者公钥、协议参数。
- **网络情境（network context）**：domain separators、cc/asn 等。

这种做法让 Go 能整合该系统而不用重新实现密码学，同时也能让网络通讯与应用程序逻辑维持与 OONI Probe 其他部分一致。

长期密钥（long term keys）会依赖操作系统的原生能力来管理与存储。实践中，Android 会使用 [Android Keystore](https://developer.android.com/privacy-and-security/keystore)，iOS 则使用 [Keychain services](https://developer.apple.com/documentation/security/keychain-services)。

## 接下来会做什么

OONI 用户很快就能依下列条件筛选或标注测量数据：

- 长期运行 vs. 新加入的 OONI Probe 
- 高测量量的贡献者
- 被封锁（blocklisted）或故障的 OONI Probe 
- 受信任的机构型 OONI Probe 

虽然完整的女巫攻击（通过建立许多虚假账户）抵抗仍属于应用层问题（例如注册阶段的速率限制），但经过验证的 `measurement_count` 与 `probe_age` 分桶，仍能对潜在攻击者形成实质阻力。

如果你是密码学研究者、实现者，或只是好奇，**我们都非常欢迎给予 OONI 团队反馈**，这项工作希望能以安全、透明的方式服务全球的 OONI 社群。

敬请期待我们接下来更深入的分享：协议设计细节、效能基准测试，以及 sigma-rs 将如何随着下一个 OONI Probe 主要版本一起发布。

[^1]: 这里的「可信度」指的是：服务器需要能分辨测量是否来自「符合某些条件的 OONI Probe」，但同时又不能让测量内容带有可长期追踪的固定身份。「跨网络追踪」的风险在于：如果同一个用户在不同网络（例如家用 Wi‑Fi、公司网络、移动网络）都被认出是同一人，就可能被用来推回真实身份或行为轨迹。
[^2]: 「匿名集合」可以理解为「看起来都一样的一群人」：如果你附带的元数据太细（例如精确年龄、精确笔数），很容易形成近乎唯一的组合，反而把匿名性削弱。OONI 在这里希望验证的是「我符合某个范围、条件」，而不是「我到底是多少」。
[^3]: 「issuer-local verification」在 OONI 的使用情境下，通常意味着「签发者（issuer）同时也是验证者（verifier）」：由 OONI 自己签发与验证，而不是把验证交给第三方。「范围证明」则是用零知识方式证明「某个值落在某个区间内」（例如大于 1 周、超过 1000 笔），但不透露精确数值。
[^4]: CFRG（Crypto Forum Research Group）是 IRTF 底下的密码学研究论坛，草案通常会朝标准化方向前进。「Fiat–Shamir」是把交互式证明（需要来回挑战、响应）转成非交互式证明的常见技巧，常用于让客户端可以一次送出「证明」给服务器验证。
[^5]: 这里刻意用「粗略区间」而不是精确数值，是为了避免把用户的特征变得过于独特（例如 17,382 笔测量 + 39 天），导致容易被追踪。「每网络一个身份」通常会通过「网络相关的 domain separator」把同一个安装的秘密值映射到不同假名，以达成跨网络不可关联。
[^6]: 这段协议同时涵盖「出示旧凭证」与「取得新凭证（更新）」：服务器验证你确实把计数 +1，但不会知道你原本的精确计数。`@DOMAIN` / `NYM` 通常用来做 domain separation（避免跨情境重用导致可关联），让同一个安装在不同网络产生不同假名。
[^7]: 这里的关键设计是「边界清楚」：Go 端不要碰密码学细节，只把它当成黑盒（opaque bytes）来用。密码学正确性与隐私性由 Rust 端封装保证。通过 C ABI 再产生 Go binding，是常见的跨语言整合方式，也能降低在 Go 端重写密码学导致出错的风险。
