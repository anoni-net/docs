---
title: 数位凭证皮夹保护了什么
description: 从源代码看数位凭证皮夹的三个隐私性质，发证方看不看得到出示记录、验证方之间能不能串连、谁能要求你出示。
icon: material/wallet-outline
---

# :material-wallet-outline: 数位凭证皮夹保护了什么

数位发展部的数位凭证皮夹 2025 年底进入试营运，便利商店取货已经可以用它代替实体证件[^1]。官方说明的重点是选择性披露（Selective Disclosure），只给验证需要的栏位，不必把整张证件交出去。公民团体的批评则集中在法制面，至今没有法律规范保障其中的隐私权与平等近用公共服务[^2]。台湾的数字身份议题已经争论过一次，2021 年的数位身分证计划就是在同一个争点上暂缓的。

两边的说法都成立，但都没有回答技术上的具体问题。皮夹的源代码以 MIT 授权公开在 [`moda-gov-tw/TWDIW-official-app`](https://github.com/moda-gov-tw/TWDIW-official-app){target="_blank"}[^3]，所以问题答得出来。本页分开检查发证方的视角、验证方之间的串连、出示的资格三件事，各自给出结论。

!!! info "本页的依据与写作时间"

    技术结论读自 `moda-gov-tw/TWDIW-official-app` 的 commit `99e9deb105b6`（2026-07-27），本页的代码链接都钉在该版本，日后改版不影响链接指向的内容。官方说法引自 [wallet.gov.tw](https://wallet.gov.tw/){target="_blank"} 的技术介绍页、常见问题页与隐私权政策，该站内容可能随时调整。

## 皮夹要解决的问题

官方政策页的开头写明界线[^30]：

> 數位憑證皮夾不是電子錢包或數位身分證，而是各類「憑證」（Credentials）的數位載具 <!-- docs-style-lint: disable-line -->

出示实体证件时披露是全有或全无，出示驾照就等于把姓名、生日、地址与身份证字号一并交出。传统流程往往要留影本，影本外流就可能遭冒用。各机构各自核发凭证与 App，彼此不通，用户需安装多个。

官方列出的效益是选择性披露加强个资保护、跨国互通提升数字经济效率、迈向数字社会，理由是「未来，大部分工商行为与政府服务皆在线上进行，个人需证明其参与资格」[^30]。

皮夹属于「数字创新关键基础建设计划」的一环，推动期 2024 到 2027，跨部会总预算 4.6 亿元，首年约 1.6 亿元。数位发展部 2023 年加入 W3C 研究分布式身份管理，成为后来的技术基础[^31]。

开头那句「不是数位身分证」出现在政策文件的第一行，早于后来的争议。

## 台湾采用的架构在区域里的位置

台湾不是欧盟成员国，却采用欧盟那套规格，原因与成员资格无关。W3C 的可验证凭证（Verifiable Credential）、IETF 的 SD-JWT、OpenID Foundation 的 OpenID4VCI 与 OpenID4VP 都是公开规格，任何人都能实现。

数字身份有两种做法，差别在出示的当下发证方在不在场。

身份提供者模式里，验证方向政府查询，政府回复对方是谁。新加坡的 Singpass 属于前者，其官方开发者文件里写[^32]：

> Singpass is Singapore's national digital identity authentication provider using the OpenID Connect 1.0 protocol. It stores users' identity information and authenticates them for transactions with government agencies and private organizations online.

验证方在协定里是 Relying Party，向 Singpass 索取 ID token，因此每一次验证 Singpass 都在流程中间。

持有者出示模式里，凭证存在用户手机上，直接交给验证方，由密码学验证真伪，台湾与欧盟采用后者。

邻近地区的分布：

| 地区 | 模式 | 出示时发证方在不在场 |
|---|---|---|
| 新加坡 Singpass | 中央身份提供者，OpenID Connect | 在场 |
| 日本 マイナンバーカード | 凭证存在卡片或手机安全元件，采用中央 PKI（JPKI）[^33] | 部分在场 |
| 韩国 모바일 신분증 | 以区块链 DID 为基础，数据分散存在手机[^34] | 较接近台湾 |
| 台湾 数位凭证皮夹 | 持有者出示，W3C 可验证凭证加 SD-JWT | 不在场 |
| 欧盟 EUDI | 持有者出示，同一套规格 | 不在场 |

Singpass 常被当成数字政府的模范，普及率也确实高，但在其架构里，政府位于每一次验证的中间。直接复制该案例，得到的会是一个政府看得见所有验证记录的系统。

就邻近地区而言，台湾采用的架构对持有者比较有利，韩国也采用类似的架构。单就架构一项来说，台湾选的是持有者出示模式，政府无法像 Singpass 那样站在每一次验证的中间。

## 三个该分开问的问题

出示实体证件时，隐私上牵涉三件事，数字版本各自对应不同的技术机制。

1. **发证方的视角**：知不知道你何时何地出示。实体驾照不会回报给监理所，数字版本要看设计
2. **验证方之间**：能不能串连你。两家店取得的证明能不能对上同一个人
3. **出示的资格**：谁有资格要求你出示。实体世界靠情境判断，数字世界靠协定

## 发证方看不到你何时何地出示

官方技术介绍页写「使用时，无需每次都得透过发行单位连接确认」[^4]。源代码与此一致，出示时皮夹用手上的凭证即时产生可验证证明（Verifiable Presentation），不回头连发证方。

撤销状态的查询避开了同一个陷阱。凭证被撤销或停权时要有机制让验证方知道，最直接的做法是验证方用凭证编号询问发证方，但那等于每次出示都通知发证方一次。皮夹采用的是状态清单（status list）[^5]，`StatusListPrepareTask` 里的注释写明最小尺寸[^6]：

```java
// generate 1st status list
// prepare initial bit string with 0s (min. size = 16 KB)
byte[] bytes = new byte[16 * 1024];
Arrays.fill(bytes, (byte) 0x00);
encodedList = ZipUtils.gzipCompressThenBase64(bytes);
```

16 KB 是 131,072 个比特。皮夹的实现是每张凭证占 1 个比特（`byteIndex = statusListIndex / 8`），所以一份清单涵盖十三万张凭证的状态。撤销与停权还分成两份独立的清单。

对持有者的意义是，验证方下载的是一份十三万人共用的清单，取回后自行比对其中一格，不必指名向发证方查询你这一张。

验证方取回整份清单后自行比对对应的比特，发证方只知道有人下载了清单，不知道查的是哪一张。规格把这个性质称为群体隐私（herd privacy），同时也列出其边界[^5]。发证方仍可从 HTTP 请求的来源位址辨识验证方，发行量远小于清单容量的小型发证方群体隐私会明显变差，而发证方若刻意把清单切小甚至一张凭证一份清单，这层保护就失效。

隐私权政策的说法也相符：「可验证凭证之认证或对外提供个人资料，本部均不会接收到任何个人资料」[^7]。

## 不同的验证方能串连你

选择性披露用的格式是 SD-JWT（Selective Disclosure for JSON Web Tokens）。其做法是把每个栏位加盐哈希，出示时只揭开需要的那几个[^8]。

哈希是把一段内容换算成固定长度的乱码，从乱码回推不出原文。加盐是换算前先掺一段随机字符串，让同样的内容每次算出来的乱码都不同。凭证里存的是这些乱码，出示时才把需要的那几格还原成原文，其余留在手机里。所以「你多给了什么」确实被挡住了。

挡不住的是「这两次是同一个人」。同一张凭证每次出示时，发证方的签名、所有栏位的哈希值、发证方识别码与绑定的持有者公钥都是固定的。两家店比对收到的证明，或同一家店比对你两次造访，认得出来自同一张凭证。栏位披露得再少都一样，因为那组固定值本身就构成识别码。这是皮夹目前最实质的隐私限制。

规格对此写得很直接[^8]：

> SD-JWT only conceals the value of claims that are not revealed. It does not meet the security properties for anonymous credentials. In particular, colluding Verifiers and Issuers can know when they have seen the same credential no matter what fields have been disclosed, even when none have been disclosed.

国际上处理这件事的做法是批次发行一次性凭证，发证方一次给一叠，每张用过就丢，彼此之间看不出关联[^9]。台湾的实现没有这一层[^10]：

- `CredentialRequestDTO` 只有单一的 `credentialType`、`holderDid`、`holderPublicKey` 与 `nonce`，没有批次发证用的凭证数量参数
- `CredentialService.generate()` 返回单一字符串而非清单
- 凭证带 `expirationDate`，采用的是有效期模型而非用过即丢

官方技术介绍页写「数位凭证皮夹未来也将支持零知识证明（Zero Knowledge Proof）技术」[^4]，与源代码的现况一致。零知识证明是另一条路径，能在不出示签名本身的前提下证明条件成立，做到之后可链接性才会消失。

零知识证明在数字身份皮夹上还没有成熟的大规模实现，这不是台湾独有的落后。eIDAS 2.0 的前言第 14 点把它列为鼓励方向，但没有写成有拘束力的条文或施行细则[^19]，相关的技术规格也还在公开征询[^11]。差别在欧盟先用批次发行把影响降到最低，而欧盟自己的文件写明那只是部分缓解（partly mitigate）[^9]。

数位发展部的另一个项目 `tw-did` 把行动自然人凭证（TW FidO）桥接到 W3C 的分布式识别码，其中一种模式用 Semaphore 的零知识证明，README 写明发证方与验证方在验证过程中都认不出是哪一位国民[^35]，而皮夹目前缺的正是这个性质。两个项目在代码层面没有关联，`tw-did` 的定位是桥接与研究，规模与正式服务的工程约束不同，不宜当成皮夹应该比照的范例，但它说明该路径在同一个部会的视野之内。

## 皮夹查询验证方身份却不挡下请求

验证方向皮夹要数据时，请求里会带一个 `client_id` 字符串自称身份。任何人都能在那里填任何字符串，所以皮夹能不能查证对方确实是该字符串所指的单位，决定了这个宣称有没有意义。

能不能查证，取决于那个字符串属于哪一种识别码[^12]。有些种类本身解析得出公钥，皮夹可以要求对方用对应的私钥签署请求，签得出来才算数。有些种类只是一个网址，没有可供比对的密钥。台湾的服务器端支持四种[^13]：

```java
PRE_REGISTERED("pre-registered")
REDIRECT_URI("redirect_uri")
DID("did")
VERIFIER_ATTESTATION("verifier_attestation")
```

用门口有人自称是自来水公司员工来比喻。`REDIRECT_URI` 是口头声称，`DID` 是出示一张识别证，证件编号查得到、而且证明得了这张是他本人的，`VERIFIER_ATTESTATION` 则是那张识别证另有可信机关加签，`PRE_REGISTERED` 是你手上本来就有一份名单。

上面四个名称来自 OpenID4VP 较早的草案。正式发布的 1.0 版把该概念改名为 Client Identifier Prefix，`did` 也改成 `decentralized_identifier`[^12]。用现行规格对照会找不到 `did` 字符串，本页以皮夹实际执行的代码为准。

实际产生授权请求与 QR Code 的端点都写死 `DID`，`REDIRECT_URI` 的那一行留在源代码里被注释掉[^14]。用 `DID` 形式时授权请求必须签名，这是 OpenID4VP 的规格要求而非实现选择[^12]，`VERIFIER_ATTESTATION` 同样要求。相对于连请求完整性都无法验证的 `REDIRECT_URI`，`DID` 明显偏强。

但 DID 证明的是身份的一致性，不是身份的可信度。任何人都能自己产生一个 DID，签名只说明「持续是同一个身份」。`VERIFIER_ATTESTATION` 需要被信任方背书，那一层外部审核 DID 单独无法提供。皮夹取得 DID 之后还要另外查询信任清单，推测与这个落差有关，不过源代码没有写明设计动机。

皮夹收到请求后会用验证方的 DID 查询信任清单[^15]。问题出在查询之后怎么处理，Android 的字符串资源里写[^16]：

> 提醒您，您將提供資料的單位尚未列入【信任清單】，建議再次確認是否要『送出資料』

`KxIdentifierManagerImpl.kt` 里的注释写得更直白[^17]：

> 如果錯誤代碼是4012且是401i，則跳出信任單位警告視窗並且繼續往下走

未列入清单的验证方会跳出警告窗口，用户可以选择继续。皮夹把判断交还给用户，隐私权政策的立场也是同一个：「用户应自行评估是否透过数位凭证皮夹APP的机制将个人资料分享或披露予第三方」[^7]。

皮夹在两个时机都查询同一个中央服务，问的问题不一样。收到凭证时问的是「这个发行方现在有效吗」，出示凭证时只问「这个 DID 查得到吗」[^15]：

| 时机 | 判断条件 | 实际检查的事 |
|---|---|---|
| 收到凭证时 | `issStatus['data']['status'] == 1` | 发行方目前的状态是否有效 |
| 出示凭证时 | `issStatus['error'] != null` | 该 DID 是否为服务所知 |

出示时只确认查得到查不到，没有再看状态。清单里登记过但状态已非有效的验证方，出示时不会触发警告。

## 信任清单的信任锚点在一个中央服务

官方技术介绍页描述信任清单的存储方式[^4]：

> 此外我們將信任清單——可信任的憑證發行者列表——記錄在區塊鏈上，讓清單就像被刻在石碑上，無法被任何人偽造或篡改。 <!-- docs-style-lint: disable-line -->

皮夹实际查询的方式是对一个中央服务发 HTTP 请求，路径是 `GET {frontUrl}/api/did/{issDID}`[^18]。公开的源代码里没有任何区块链相关的代码，Java、Kotlin、Dart 与 Markdown 文件里都搜不到。

公开数据无法区分两种解释。区块链可能是支撑该中央服务的独立元件，只是没有随代码开源，也可能该描述对应的是别的东西。不宜据此推论官方说法不实。

不论背后是什么，皮夹信任的是那个中央服务。服务若被攻破或被要求配合，刻在石碑上的性质保护不到用户，因为皮夹查询的对象是那个中央服务，从来不是石碑本身。

## 台湾的数字身份计划暂缓过一次

皮夹一路强调自己不是数位身分证，而 2021 年暂缓的正是数位身分证计划，两者是同一个争点。

2021-01-21 行政院宣布暂缓数位身分证（New eID）的换发。当时的院长苏贞昌提出三个再推动的条件[^23]：

> 待整個法制完備後…與社會各界能夠瞭解及溝通再來推行…待行政院院會通過，送立法院三讀完成後再來進行

监察院同年三月的调查报告指出，内政部规划过程规避既有法制、授权不足[^28]。

专法一直没有送进立法院，停在行政部门内部研议。2024-07-31 内政部的说法比 2021 年宽松[^29]：

> 數位身分證計畫經國發會審度政策形成過程與社會各界共識，制定專法並非唯一選擇

同一则新闻稿里写，后续推动要等个人资料保护委员会成立之后，再做政策、信息安全与法制的跨部会意见整合。而个保会至今仍是筹备处，组织法尚未完成三读，详见 [台湾个资法 2025 修法](./pdpa-2025.md)。

2021 年承诺的专法没有进立法院，2024 年主管机关改为表示专法并非唯一选择，而其指定的前提条件个保会也还没成立。同一段时间里，数位凭证皮夹已经从规划进入便利商店的实际运作。

数位发展部的立场是两者不同，官方文件反复强调数位凭证皮夹并非发行数位身分证，只是整合多种数字证件的容器。技术上这个区分成立，皮夹本身确实不发行身份识别。争点在于 2021 年那三个条件是对「数字身份」这件事说的，而不是对某一张证件说的。

## 在地讨论的焦点落在法制

2026-02-09 一份由台湾人权促进会发起、多个公民团体连署的声明提出三项诉求[^24]：

1. 数位发展部应完善数字皮夹的法律制度
2. 在建立法律之前，于数字身份计划的各个阶段进行个资冲击风险及人权风险评估
3. 以制度落实国际原则

第三项的原文是：

> 樂觀地空想技術會自己長成符合國際原則的樣子

台湾人权促进会 2024 年 11 月依政府信息公开向数位发展部申请数字皮夹设计案与建置案的阶段交付成果，经过数次沟通，到 2026 年仍未公布。

被反复提起的前例是台北通。依同一份声明，2021 到 2022 年初有民众反应图书馆借书这类基本公共服务被要求先注册台北通才能使用[^24]。在地最具体的担忧落在强制使用与近用门槛，而非密码学。

### 更根本的批评指向皮夹之外

2026-07-06 中央广播电台的一则报导整理了几位法律学者的意见，论点比「缺法源」更深一层[^25]。

中央研究院法律学研究所信息法中心主任吴全峰认为去中心化的安全保障恐流于形式，理由是政府本来就常在缺乏法律规范与授权的情况下串接个资，而且没有保留调取记录供问责。律师黄昱中指出户籍、税务、车籍、健保、劳保这些分散存放的数据，透过自然人凭证就串接得起来，而机关之间存取个资的依据「都是行政命令位阶，不是法律位阶」。东海大学法律系退休教授范姜真媺以 M-Police 为例，质疑内政部建立人脸数据库的法律依据。

学者的批评跟本页前面的技术检查互补。皮夹把证件数据存在手机上确实避开了单一数据库的风险，但政府手上的原始数据并没有因此变得难以串接。皮夹的架构管得到「出示时给了什么」，管不到「机关之间本来就怎么调用」。

### 技术社群的评价偏正面

2025-03 区块势的一篇评论把皮夹称为身份自主的隐私革命，论点是选择性披露让民众精准控制分享范围、采用 W3C 标准打破各应用各自孤立的状态、数据存在手机端而非中央数据库，并以验钞的浮水印作比喻，验证方不用与发行方建立热线，用密码学就确认得了证件真伪[^26]。该文同时写出保留之处，短期只适用便利商店取货这类简单场景，复杂系统无法立刻整合。

同一篇也写，记者会没有说明采用的是哪一条区块链。抱持正面态度的评论者一样查不到，这与本页前面对信任清单的观察互相印证。

另有开发者用沙盒环境做出同时扮演发行方与验证方的门禁与访客发证流程，README 记下选择性披露在实务上确实运作[^27]：

> 同樣的員工卡，只揭露「是不是有效員工」，姓名 / 生日 / 子女數等欄位一律留在皮夾內

同一份文件也记下摩擦，凭证样板的必填栏位限制让开发者需先用员工卡样板填入访客信息作为权宜做法，要正规的访客通行证卡面需回后台另建样板。整套机制堪用，细节仍有待改善。

## 欧盟对同一套技术的要求不同

欧盟的数字身份皮夹（EU Digital Identity Wallet）采用的标准与台湾同一套。差别在 eIDAS 2.0 把几项隐私性质写成法律义务，技术设计是为了满足义务而来。

欧盟的规定分三种位阶，条文（Article）有拘束力，前言（Recital）属说明性质，技术文件（ARF）是实现指引。以下逐项标明各自的出处。

验证方（Relying Party）那一端，eIDAS 2.0 第 5b 条第 1 项要求「the relying party shall register in the Member State where it is established」，同条第 7 项要求各成员国提供识别与验证验证方的共同机制[^19]。相关凭证的核发与撤销规定在施行细则 Implementing Regulation (EU) 2025/848[^20]。前言第 17 点写明注册「should not entail a pre-authorisation process」[^19]，所以欧盟的模型是「要问就得可被识别并先宣告用途」，不含政府核准谁可以问的环节。

超额索取的处理写在 ARF 的高阶需求，属技术文件而非条文[^22]：

> In a transaction, a wallet solution shall inform the wallet user whenever the wallet-relying party is asking for more information than what they have registered as intended use and the user will have possibility to reject the transaction.

施行细则的前言有语气较弱的对应版本，没有让用户拒绝交易那一句[^20]。

位阶最高的是不可链接性，写在第 5a 条第 16 项[^19]。该项要求技术框架须支持确保不可链接性的隐私技术，并禁止证明提供者于发证后取得可用以追踪、链接或关联用户行为的数据，除非用户明示授权。

四项对照：

| 项目 | 欧盟 EUDI | 台湾数位凭证皮夹 |
|---|---|---|
| 验证方注册 | 条文强制，并由成员国提供识别与验证的共同机制，不采事前许可 | 查中央信任清单，未列入时警告而用户可继续 |
| 可要求的栏位 | 只能要求已登记且宣告用途者，超出时皮夹须告知。细节写在 ARF 技术文件 | 未见对应机制 |
| 不可链接性 | 第 5a 条条文要求，实现用批次发行一次性凭证部分缓解 | 无批次发证，官方写明零知识证明为未来工作 |
| 发证方不得追踪 | 第 5a 条条文禁止 | 出示不回连发证方，技术上已达成 |

一项相同、一项较弱、两项未见对应。

## 三个问题的答案

开头立的三个问题，各自的结论：

| 问题 | 答案 | 依据 |
|---|---|---|
| 发证方看得到你何时何地出示吗 | 看不到 | 出示时不回连发证方，撤销状态查的是一份十三万张凭证共用的清单 |
| 不同的验证方能串连你吗 | 能 | 没有批次发行一次性凭证，SD-JWT 的签名固定，零知识证明官方列为未来工作 |
| 谁能要求你出示 | 会查但不会挡 | `client_id` 用 `DID` 形式，皮夹查得出对方的公钥，信任清单未列入时只显示警告（错误码 `4012`）并继续流程 |

三题的答案不同，笼统问「皮夹安不安全」得到的会是三题混在一起的印象。

## 技术做到哪一步取决于有没有人要求

欧盟那四项性质的来源是法律。eIDAS 2.0 先写成义务，实现再依义务发展。台湾目前没有对应的法律要求，公民团体批评的就是这一点。

所以问题不在工程能力。批次发行一次性凭证是现成的做法，验证方登记用途也是写得出来的机制，欧盟的实现就在公开的代码库里。差别在有没有一份文件要求它做到，以及做不到的时候谁能主张权利。

本网站在地脉络分类里的其他议题也是同一个结构。能力已经建成，限制它的是授权与程序。

## 读者可以做什么

### 先看自己的用法

便利商店取货这类一次性、低风险的场景，本页列出的限制影响有限。可链接性的风险要在同一张凭证反复出示给多个验证方时才会累积，领一次包裹跟出示实体证件给店员看的差别不大。想更保守就继续带实体证件，皮夹目前是多一个选项。

可放进皮夹的证件种类与使用场合都在扩张，同一张凭证用得越频繁、场合越多样，被串连起来的轮廓就越完整。

### 知道自己在同意什么

皮夹出示时的警告窗口按下之后流程就会继续，该窗口是目前唯一由用户决定的关口。看到「尚未列入信任清单」的提示时，意思是对方没有登记在案。

### 分开想两件事

「给了哪些栏位」与「被认出是同一个人」是两回事。选择性披露解决前者，后者目前没有对应的机制。需要匿名的场合不在数位凭证皮夹的设计目标之内。

### 追踪法制进度

本页的技术结论会随版本改变，真正决定长期走向的是有没有法律要求。相关的法制动态见 [台湾个资法 2025 修法](./pdpa-2025.md)。

## 本页的限制

结论全部来自公开的源代码与官方文件，没有实测 App 的网络行为。官方常见问题页说明 App 采用 GuardSquare DexGuard 提供反静态分析与反动态分析的防护[^21]，所以「手机上执行的二进制文件是否等同这份源代码」没有被独立验证过。源代码公开与发行档加固可以同时成立，对想自行查核的人来说两者意义不同。

中央信任清单服务与区块链的关系同样没有结果。检视过的来源包括皮夹的技术介绍页、常见问题页、隐私权政策、政策页，App 内的用户条款，`TWDIW-official-app` 全部源代码，`moda-gov-tw` 组织底下的所有公开 repo，以及中文媒体报导。用户条款里出现同一句话，措辞与技术介绍页完全相同，没有补充细节。哪一条链、如何锚定、由谁维运，这三件事在上述范围内都找不到说明。

本页没有就这些发现向数位发展部提出询问并取得回复，所有官方立场都引自既有的公开页面。信任清单那一段的落差尤其应该有官方的说明，本页停在「公开数据无法区分」，不代表没有答案，只代表本页没有提出询问。

## 延伸阅读

<div class="grid cards" markdown>

- [:material-key-chain: 什么是 passkey](../tools/what-is-passkey.md)
- [:material-account-multiple-outline: 多重身份](../basics/multiple-identities.md)
- [:material-scale-balance: 台湾个资法 2025 修法](./pdpa-2025.md)
- [:material-island: 在地脉络](./index.md)

</div>

[^1]: [數位發展部舉辦「數位憑證皮夾」試營運暨應用體驗記者會 打造全民數位生活新紀元](https://moda.gov.tw/press/press-releases/18262){target="_blank"} - 数位发展部，2025-12-17
[^2]: [數位皮夾缺乏法律保障基本權，將淪為下一個台北通](https://www.amnesty.tw/node/23762){target="_blank"} - 国际特赦组织台湾分会
[^3]: [moda-gov-tw/TWDIW-official-app](https://github.com/moda-gov-tw/TWDIW-official-app){target="_blank"} - 数位发展部，MIT 授权
[^4]: [技術介紹](https://wallet.gov.tw/zh-tw/Developer.html){target="_blank"} - 数位凭证皮夹官方网站
[^5]: [Token Status List](https://datatracker.ietf.org/doc/draft-ietf-oauth-status-list/){target="_blank"} - IETF OAuth 工作组，Privacy Considerations 一节。另见 [Bitstring Status List](https://www.w3.org/TR/vc-bitstring-status-list/){target="_blank"} - W3C
[^6]: [`StatusListPrepareTask.java`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/core-system/twdiw-vc-handler/src/main/java/gov/moda/dw/issuer/vc/task/StatusListPrepareTask.java){target="_blank"} - TWDIW-official-app
[^7]: [隱私權政策](https://wallet.gov.tw/zh-tw/privacyPolicy.html){target="_blank"} - 数位凭证皮夹官方网站
[^8]: [RFC 9901 Selective Disclosure for JSON Web Tokens (SD-JWT)](https://www.rfc-editor.org/rfc/rfc9901.html){target="_blank"} - IETF，第 10.1 节 Unlinkability
[^9]: [Re-issuance and batch issuance of PIDs and attestations](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/discussion-topics/b-re-issuance-and-batch-issuance-of-pids-and-attestations.md){target="_blank"} - EU Digital Identity Wallet 的 ARF 讨论文件，批次发行的目的写为 partly mitigate Relying Party linkability
[^10]: [`CredentialRequestDTO.java`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/core-system/twdiw-vc-handler/src/main/java/gov/moda/dw/issuer/vc/service/dto/CredentialRequestDTO.java){target="_blank"} 与 [`CredentialService.java`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/core-system/twdiw-vc-handler/src/main/java/gov/moda/dw/issuer/vc/service/CredentialService.java){target="_blank"} - TWDIW-official-app
[^11]: [G - Zero Knowledge Proof](https://eudi.dev/latest/discussion-topics/g-zero-knowledge-proof/){target="_blank"} - EU Digital Identity Wallet 讨论章节
[^12]: [OpenID for Verifiable Presentations 1.0](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html){target="_blank"} - OpenID Foundation，Client Identifier Prefix 一节
[^13]: [`ClientIdScheme.java`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/core-system/twdiw-oid4vp-handler/src/main/java/gov/moda/dw/verifier/oidvp/model/oid4vp/ClientIdScheme.java){target="_blank"} - TWDIW-official-app
[^14]: [`OidvpEndpointController.java`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/core-system/twdiw-oid4vp-handler/src/main/java/gov/moda/dw/verifier/oidvp/web/rest/oidvp/OidvpEndpointController.java){target="_blank"} - TWDIW-official-app
[^15]: [`openid_vc_vp.dart`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/APP/APPSDK/lib/openid_vc_vp.dart){target="_blank"} - TWDIW-official-app
[^16]: [`sdk_error_code.xml`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/APP/moda-digitalwallet-holder-androidapp/app/src/main/res/values/sdk_error_code.xml){target="_blank"} - TWDIW-official-app
[^17]: [`KxIdentifierManagerImpl.kt`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/APP/moda-digitalwallet-holder-androidapp/app/src/main/java/tw/gov/moda/digitalwallet/core/identifier/KxIdentifierManagerImpl.kt){target="_blank"} - TWDIW-official-app
[^18]: [`http_service.dart`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/APP/APPSDK/lib/http_service.dart){target="_blank"} - TWDIW-official-app
[^19]: [Regulation (EU) 2024/1183](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202401183){target="_blank"} - eIDAS 2.0。第 5a 条第 16 项（不可链接性）、第 5b 条第 1 项与第 7 项（验证方注册）、前言第 14 点（零知识证明）、前言第 17 点（不采事前许可）
[^20]: [Commission Implementing Regulation (EU) 2025/848](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202500848){target="_blank"} - 存取凭证的核发与撤销，前言第 10 点为超额索取的对应规定
[^21]: [常見問題](https://wallet.gov.tw/zh-tw/qa.html){target="_blank"} - 数位凭证皮夹官方网站
[^23]: [暫緩數位身分證發行計畫 蘇揆：完善法制後再推動](https://www.ey.gov.tw/Page/9277F759E41CCD91/e80e55a2-0102-4031-b6d3-a7c40f4cac6a){target="_blank"} - 行政院，2021-01-21
[^24]: [【聯合聲明】數位皮夾缺乏法律保障基本權，將淪為下一個台北通](https://www.tahr.org.tw/news/3845){target="_blank"} - 台湾人权促进会，2026-02-09
[^25]: [數位皮夾能解隱私疑慮？ 學者：法規模糊才是台灣資料治理根本問題](https://tw.news.yahoo.com/%E6%95%B8%E4%BD%8D%E7%9A%AE%E5%A4%BE%E8%83%BD%E8%A7%A3%E9%9A%B1%E7%A7%81%E7%96%91%E6%85%AE-%E5%AD%B8%E8%80%85-%E6%B3%95%E8%A6%8F%E6%A8%A1%E7%B3%8A%E6%89%8D%E6%98%AF%E5%8F%B0%E7%81%A3%E8%B3%87%E6%96%99%E6%B2%BB%E7%90%86%E6%A0%B9%E6%9C%AC%E5%95%8F%E9%A1%8C-082000055.html){target="_blank"} - 中央广播电台，2026-07-06
[^26]: [數位憑證皮夾：出示證件的新方法、身分自主的隱私革命](https://www.blocktrend.today/p/676){target="_blank"} - 区块势，2025-03-12
[^27]: [did-usecase-visitor](https://github.com/kkdai/did-usecase-visitor){target="_blank"} - 第三方开发者以沙盒环境实现的范例项目
[^28]: [監察院調查報告 110內調0010](https://www.cy.gov.tw/CyBsBox.aspx?CSN=1){target="_blank"} - 监察院，2021-03-18 公告
[^29]: [數位身分證政策為更周全完善，待個資保護委員會成立進行跨部會意見整合](https://www.moi.gov.tw/News_Content.aspx?n=8&s=318494){target="_blank"} - 内政部，2024-07-31
[^30]: [數位憑證皮夾](https://moda.gov.tw/major-policies/wallet/1695){target="_blank"} - 数位发展部重点政策页
[^31]: [數位憑證皮夾打造數位環境的信任基石](https://www.ithome.com.tw/news/173833){target="_blank"} - iThome，计划期程与经费
[^32]: [Singpass API Introduction](https://docs.developer.singpass.gov.sg/docs/introduction){target="_blank"} - Singpass 官方开发者文件
[^33]: [Japanese Public Key Infrastructure (JPKI)](https://www.digital.go.jp/en/policies/mynumber/private-business/jpki-introduction){target="_blank"} - 日本デジタル庁
[^34]: [블록체인 기반 DID 기술 적용한 디지털 신분증](http://www.boannews.com/media/view.asp?idx=97149){target="_blank"} - 보안뉴스，韩国行政安全部的行动身份证以区块链 DID 为基础
[^35]: [moda-gov-tw/tw-did](https://github.com/moda-gov-tw/tw-did){target="_blank"} - 数位发展部，把 TW FidO 桥接到 W3C DID 的项目，支持 Semaphore 零知识证明模式
[^22]: [X relying party registration](https://eudi.dev/latest/discussion-topics/x-relying-party-registration/){target="_blank"} - EU Digital Identity Wallet 的 Architecture and Reference Framework 讨论文件，高阶需求第 8 条
