---
title: 匿名通讯工具比较
description: Signal、SimpleX、Session、Briar、Matrix 的端对端加密、Metadata 与身份模型差异，以及在中国大陆使用时的可达性与替代选择。
icon: material/message-text-outline
---

# :material-message-text-outline: 匿名通讯工具比较

「端对端加密」这几个字在 微信、Telegram、WhatsApp、Signal、SimpleX、Session、Briar、Matrix 上意义差很多。差异涵盖多个面向：密钥由谁持有、注册时要不要绑手机号码或邮箱、Metadata 留在哪个 server、服务器掉线后还能不能通讯、群组与多装置的设计选择。

这篇文章从几个面向比较常见的匿名通讯工具，重点放在 5 个主轴（Signal、SimpleX、Session、Briar、Matrix/Element）与 3 个对照（微信、Telegram、WhatsApp）。动手前可以先回头看 [威胁模型如何建立](../basics/threat-model.md) 了解自己在抗谁，需要协议层细节（Double Ratchet、Sender Keys、MLS）可参考 [端对端加密如何运作](../advanced/e2ee.md)，Metadata 为什么是独立风险可看 [Metadata 是什么](../basics/metadata.md)。在中国大陆，本文 5 个主名单工具多数需要先解决境外网络可达性才能稳定使用，可达性细节见后面的「在中国大陆的补充」一节。

## 为什么要分开比较这些工具

「端对端加密」听起来像一个技术合格章，但实际上要追问三件事才有意义：

- **「端」是什么**：是装置、是账号、还是一段随机 ID？决定了攻击者拿到账号还是装置时的风险。
- **默认启用吗**：很多工具的 E2EE 是可选功能，要使用者主动切换才生效。
- **Metadata 留在哪**：消息内容加密了，「谁跟谁、什么时候、多频繁」这层往往没加密。

微信、Telegram、WhatsApp 三家在前述三个问题上都有明显短处，所以不在主名单。在中国大陆，微信仍然是社交基础建设切不掉，后面的「在中国大陆的补充」会讲如何分流。

主名单的 5 个工具是社群实际在用、且设计目标就是 E2EE 与 Metadata 最小化的选项。下面先给判读框架，再开始一个一个介绍。

## 五个比较轴

读每个工具时可以对照这五个轴看：

1. **身份绑定方式**：手机号码、邮箱、随机 ID、Tor 隐藏服务、实体装置密钥。决定了「跟我联络的人能不能透过这个 ID 找到我的真实身份」。
2. **E2EE 与前向保密**：是否默认启用、用什么协议、有没有 Double Ratchet（每则消息独立密钥）。
3. **Metadata 暴露面**：server 或对手能看到谁跟谁、消息时间、消息大小、群组成员。
4. **跨装置同步与离线可用性**：手机掉了消息能不能救回来、没网络时还能不能传消息（mesh）。
5. **群组与多装置 UX**：Sender Keys 还是 MLS、新成员加入有没有历史消息、踢人后能不能立即断新消息。

额外还会看「开源与审计」，但这对 5 个主轴全部都是「是」，没有区分作用，所以不单独拉出来讨论。

## 轴度速查表

| 工具 | 身份绑定 | E2EE 默认 | Metadata 留在哪 | 多装置 | 群组 | 开源 |
|------|---------|----------|---------------|--------|------|------|
| Signal | 手机号码（可加 username） | 是（Signal Protocol） | 中央 server，最小化设计 | 行 | Sender Keys | 是 |
| SimpleX | 随机 queue ID | 是 | 设计上不知道谁跟谁 | 行（装置间自管） | 行 | 是 |
| Session | 随机 ID（无手机） | 是（fork Signal） | Onion-routed 网络，去中心化 | 限制较多 | 部分 | 是 |
| Briar | 装置内密钥对 | 是（Tor、Bluetooth、Wi-Fi mesh） | 不存在中央 server | 不行 | 行 | 是 |
| Matrix/Element | 邮箱或 username | 房间级（要手动开） | 房间参与的 homeserver 都看得到 | 行 | MLS 推进中 | 是 |
| (对照) 微信 | 手机号码（实名） | 否（无 E2EE 设计） | 全部，server 端可读 | 行 | 行 | 否 |
| (对照) Telegram | 手机号码 | 仅 Secret Chat | 全部 | 行 | 不适用 | 部分（client） |
| (对照) WhatsApp | 手机号码 | 是（Signal Protocol） | 广（Meta 集团） | 行 | 行 | 否 |

对照组的「E2EE 默认」一栏写的是消息内容层级，不代表 metadata 也加密。Telegram 的「不适用」是因为一般群组与频道根本不走 E2EE，没办法谈「群组 E2EE 机制」。

## Signal

[Signal](https://signal.org/){target="_blank"} 是 E2EE 通讯工具的当前共识答案，协议成熟、UX 接近主流 IM。一对一用 Double Ratchet（每则消息独立密钥），群组用 Sender Keys，协议细节见 [端对端加密如何运作](../advanced/e2ee.md)。

身份模型上，Signal 注册仍需手机号码，但 2024 年正式推出 username 功能，可以在不揭露号码的情况下交换联络方式。Sealed Sender 设计让 server 看不到单则消息的寄件人，私联络人探索（private contact discovery）也让 server 不知道你的通讯录。

**适合谁**：日常通讯首选、跟记者第一次接触（搭配 username 可以避开手机号码）、跨组织协作的长期通道。台湾社群多数对外联络的工作通道都是 Signal。

**限制**：

- 注册仍需手机号码，虽然能加 username，初次验证仍有电话这层
- Sealed Sender 隐藏单则消息的寄件人，不隐藏「这个账号存在」这件事
- 多装置靠 device linking，新装置看不到旧消息（除非开启 2024 年加入的加密消息备份）
- 客户端 UX 偏「美式」，部分功能（已读回条、群组权限）跟亚洲使用者习惯不一致
- 在中国大陆被「长城防火墙」（Great Firewall, GFW）封锁（约 2021 年起），需透过 Tor Snowflake、WebTunnel 等桥接才能稳定连接

## SimpleX

[SimpleX Chat](https://simplex.chat/){target="_blank"} 在身份模型上做了最大胆的选择：完全没有 user identifier。每段对话走一组「queue」，由随机 ID 识别，server 看到的只是「这个 queue 收到一个消息要转给谁」，不知道你的账号是谁、你的联络人有谁、你跟谁在通讯。

加好友的方式是交换一个 invitation link 或 QR code，双方在第一次连接时建立 queue，之后就用这组 queue 通讯。换句话说，SimpleX 没有「账号」这个数据项，要找你的对手连个搜索目标都没有。

**适合谁**：

- 完全不想暴露身份（连手机号码都不要）
- 跨组织协作的初次接触（双方互不认识，又需要建立加密通道）
- 跟「来路不明但需要保护」的对象通讯（爆料人、跨境议题的访问对象）

**限制**：

- 学习曲线高，多数人第一次用会困惑「没有联络人列表怎么维护」
- 生态小，对方不装就无法用
- 自架 server 是进阶选项，多数人会用官方 server，虽然 SimpleX 的设计让 server 即使被入侵也看不到谁跟谁，但一致性与 metadata 抗监控能力会跟自架有差距
- 多装置同步要自己处理装置间的密钥搬迁
- 在中国大陆部分官方 server 受 IP 或域名层级影响，可达性视使用的 server 而定

## Session

[Session](https://getsession.org/){target="_blank"} 是从 Signal fork 出来的版本，把手机号码换成随机 ID，消息流量走类 Tor 的网络（Lokinet）降低 metadata。跨装置同步靠一段 13 字 recovery password（mnemonic），这也是你的「账号备份」。

身份模型上，每个 Session ID 是 66 个十六进位字符（装置产生的公钥），没有任何电话或邮箱绑定。对方想找你只能拿到这个 ID。理论上连 server 都不知道谁跟谁在通讯。

**适合谁**：

- 拒绝电话号码绑定、又不想花时间学 SimpleX 的使用者
- 可接受消息延迟较高（去中心化网络的代价）的长期通道
- 一次性协作（recovery password 写下来收好，之后在哪台装置都可恢复）

**限制**：

- 群组功能比 Signal、SimpleX 都弱，大群组支援限制较多
- Lokinet 路由的设计过去曾因不同于 Tor 的选择被质疑，社群审计仍在持续
- 消息送达延迟明显比 Signal 高（因为走多跳 onion routing）
- 早期版本没有完整前向保密，新版本仍在转换中（决定使用前可看 [端对端加密如何运作](../advanced/e2ee.md) 的协议对照）
- 在中国大陆 Lokinet 节点被封锁，与 Signal 同样需要桥接

## Briar

[Briar](https://briarproject.org/){target="_blank"} 是另一条路：完全去中心化、不需要 server。消息走 Tor、Bluetooth、Wi-Fi Direct 三种传输层，网络被切断时可以用 Bluetooth 或 Wi-Fi mesh 直接点对点通讯。

身份绑在装置上的密钥对，没有账号可以登入别的装置。每支手机是一个独立 Briar，要备份只能整个 .kdbx 风格的密钥档输出。

**适合谁**：

- **行动现场**：警察封网、地区网络被切时，Bluetooth + Wi-Fi mesh 仍可以在实体距离内通讯
- **无 server 风险场景**：没有 server 就没有 server 被搜索的问题
- 高敏感的小群组、知道对方装置就在身边

**限制**：

- 一台装置就是一个账号，手机掉了账号就没了，不能跨装置
- UX 偏粗糙，年代较早、设计目标不是大众化
- 消息要对方上线才送达（没有中继 server 暂存），离线太久会收不到
- 不适合日常通讯，更像「行动现场备援」
- 在中国大陆 Tor 模式需 Snowflake 桥接，但 Bluetooth 与 Wi-Fi Direct 不受 ISP 层级封锁影响

跟 Briar 同类的工具还有 Bridgefy，但 2020 年 Bridgefy 被研究团队指出加密设计缺陷[^1]，社群推荐从 Bridgefy 迁移到 Briar 或其他验证过的方案。

## Matrix / Element

[Matrix](https://matrix.org/){target="_blank"} 是联邦化的开源即时通讯协议，最常用的客户端是 [Element](https://element.io/){target="_blank"}（也叫 Element X 在新版）。设计上类似 email：每个人有一个 homeserver，homeserver 之间互通。

anoni.net 自己跑一个 Matrix homeserver（`im.anoni.net`），是社群长期协作的主要管道。社群的 Public Space 在 `#community:im.anoni.net`，公开房间可以加入。

E2EE 是房间级别的开关，不是默认全部启用。建立私人房间时可以勾选 E2EE，公开房间通常不开（因为要让新成员看得到历史）。协议目前用 Megolm（类 Sender Keys 的设计），未来转向 MLS。

**适合谁**：

- 社群长期协作（多人、多房间、需要保留历史）
- 跨组织讨论（不同 homeserver 的人可以在同一个房间）
- 社群想自架 server 的场景（联邦化让你不被单一服务商绑死）
- 整合既有 IRC、bridge 到其他平台（Discord、Slack、Telegram）

**限制**：

- E2EE 是房间级需手动开，公开房间默认不加密
- Metadata 在 homeserver 端可见：homeserver 知道谁加入哪个房间、消息时间、消息大小
- Device verification 流程比 Signal 复杂，新装置加入时的 cross-signing 操作对新手不友善
- 群组规模成长到上千人时，旧版 Megolm 的同步压力会明显，MLS 过渡完成前是过渡期
- 在中国大陆访问境外 homeserver（含 anoni.net 的 `im.anoni.net`）需可靠的境外网络连接

加入 anoni.net 的 Matrix（含注册方式）见 [社群自架服务](../community/tools.md)。

## 不在主名单的工具

### 微信

[微信](https://weixin.qq.com/){target="_blank"} 是中国大陆社交网络的基础建设，但设计目标完全没有 E2EE 的位置。

- **没有端对端加密**：所有消息走 Tencent server，server 端可读
- **强制实名**：注册需手机号，手机号需身份证实名（即等同身份证），账号无法匿名持有
- **数据留存**：聊天历史、朋友圈、群组、文件、视频号、小程序使用纪录都在 server 端长期保留
- **协助义务**：在《网络安全法》、《数据安全法》、《个人信息保护法》框架下，平台对监管有数据留存与协助查询义务
- **跨产品识别**：微信账号跨 QQ、QQ 邮箱、Tencent 视频、Tencent 游戏共享身份与 metadata 图谱

微信不是「中国版 LINE」，是设计目标完全不同的产品。在大陆要用微信几乎切不掉，但同时要清楚它的位置（后面「在中国大陆的补充」会展开分流策略）。

### QQ

[QQ](https://im.qq.com/){target="_blank"} 跟微信同属 Tencent，无 E2EE、同样实名制，差别在 QQ 的聊天历史云端保存习惯比微信更明显（旧版预设全部上云），30 岁以上的使用者比较多。

### 钉钉

[钉钉](https://www.dingtalk.com/){target="_blank"} 是阿里旗下的工作场景 IM，工作群组、考勤、文件协作整合度高，但设计目标是企业管理而非个人隐私。「DING 通知」的强制提醒、读取已读、聊天纪录企业级管理都在设计内。

### LINE

[LINE](https://line.me/){target="_blank"} 在中国大陆被封锁，是港、台、日、东南亚的主流 IM。即便能连入，E2EE 设计仍受限：Letter Sealing（2015 年推出，自 2021 年起预设开启、无法手动关闭）只覆盖一对一对话与部分群组消息，server 端在司法协助请求下可提供未加密内容。

### Telegram

[Telegram](https://telegram.org/){target="_blank"} 在中国大陆被封锁（2015 年起），需桥接才能连入。即便能用，预设非 E2EE 这一事实仍然成立：

- **Secret Chat**：唯一走 E2EE 的模式，需要手动开启，限一对一，不能跨装置同步
- **一般对话、群组、频道**：走 client-server 加密，Telegram server 看得到所有内容
- **常见误解**：「Telegram 是加密通讯工具」是错的，它是默认不加密、可选 Secret Chat 的工具
- **2026 年最新状况**：Telegram 受多国司法压力后加强对特定情境的合规回应，但对一般使用者的隐私模型没有结构性改变

### WhatsApp

[WhatsApp](https://www.whatsapp.com/){target="_blank"} 在中国大陆被封锁（2017 年起）。即便绕过封锁，metadata 仍在 Meta 集团（Facebook、Instagram、Threads、Messenger）：

- **消息内容**：E2EE，server 看不到对话内容
- **Metadata**：跟 Meta 账号图谱共享：谁跟谁、什么时候、多频繁、地点、装置、商业互动
- **隐私风险不在「对话内容会泄漏」**：在「跟谁、什么时候、多频繁」的图谱分析能力，这层 Meta 集团掌握得很完整
- **企业账号与广告整合**：WhatsApp Business API 与 Meta 广告系统的整合会持续扩张，这对隐私敏感使用者是长期警示

## 在中国大陆与香港的补充

几个跟中国大陆、香港使用情境特别相关的补充：

**境内可达性**：本文 5 个主名单工具多数被「长城防火墙」（Great Firewall, GFW）封锁，境内直连不稳。整理大致情况：

| 工具 | 直连 | 解法 |
|------|------|------|
| Signal | 不可（约 2021 年起） | Tor Snowflake、WebTunnel 桥接 |
| SimpleX | 视 server 而定 | 自架 server 或换 server |
| Session | 不可 | 桥接 |
| Briar (Tor) | 不可 | Snowflake 桥接 |
| Briar (Bluetooth、Wi-Fi mesh) | 可 | 不需要外网，限实体距离 |
| Matrix（境外 homeserver） | 不可 | 桥接 |

桥接选项 Tor Snowflake、WebTunnel 在 2025 年底仍是境内较稳定的进入路径，操作细节见 [Tor Browser 进阶设定](./tor-browser-advanced.md) 的桥接段落，原理见 [Tor Snowflake 桥接点](./tor-snowflake.md)。

**微信是社会基础建设，先承认再分流**：跟家人、单位、政府服务（医保、社保、政务通办）、商业服务（外卖、约车、医院挂号、预约缴费）都切不掉。务实做法是分流：

- 重要的、敏感的、长期会留下纪录的对话切到 Signal 或 Matrix（前提是双方都能稳定连接外网）
- 一般生活、订购、单位群组、家人聊天留在微信
- 知道哪些对话该切、哪些不必切，比硬要全切更可行

**实名制与手机号**：境内手机号注册需身份证实名验证，注册 SIM 卡时已经把号码与身份证绑定。这意味着「短信 2FA」事实上等同身份验证。能改 TOTP（Aegis、Ente Auth、Google Authenticator）的服务一律改 TOTP，做法见 [密码管理器入门](./password-manager.md) 的对应段落。境外服务（Signal、ProtonMail）注册时若使用境内手机号，号码与身份的关联仍然存在。

**自架 Matrix 在境内的合规风险**：境内 ICP 备案要求让自架公开 Matrix homeserver 的合规成本高，多数社群最后选择用境外 homeserver（如 anoni.net 的 `im.anoni.net`）。访问境外 homeserver 仍需要可靠的网络连接，这层成本要先评估。

**iOS AirDrop 受限**（2022 年 11 月起）：国行 iPhone 的 AirDrop「所有人」选项被改为 10 分钟自动关闭，对在公共空间用 AirDrop 临时传讯的场景产生明显影响。Briar 的 Bluetooth、Wi-Fi Direct 是一个替代方案。

**社群讨论在 Matrix**：anoni.net 的 Matrix homeserver `im.anoni.net` 有 Public Space `#community:im.anoni.net`，账号申请与加入方式见 [社群自架服务](../community/tools.md)。境内访问需可靠的境外网络连接。

**协议层细节**：Signal 与 Matrix 各自的协议设计与威胁模型见 [端对端加密如何运作](../advanced/e2ee.md)。

香港的分流对象与威胁模型跟大陆不同：

- **要分流的主流工具是 WhatsApp（非微信）**：香港最普及的即时通讯是 WhatsApp，跟家人、公司、服务商多半切不掉。务实做法同样是分流，把敏感、长期留痕的对话切到 Signal 或 Matrix，一般生活留在 WhatsApp。
- **2FA 生态不同**：香港的银行与政府服务（HKID、iAM Smart 数字身份）多用短信 OTP，SIM swap 同样是风险，能改 TOTP 的服务就改，做法见 [密码管理器入门](./password-manager.md) 的对应段落。
- **威胁模型要对应国安监控**：2019 年反送中运动期间，Telegram、Signal 因为群组动员与较强的加密特性被大量采用。《国安法》之后，通讯与社群平台上的记录成为国安、煽动案件的证据来源[^hk]，这层政治风险跟大陆的合规关切不是同一量级，脉络见 [VPN 的风险与选择](./vpn-guide.md)。

## 常见问题

??? question "我所有人都在微信，怎么开始用 Signal"

    分流而不是替换。但在中国大陆，要先解决一个前提：Signal 在境内被封锁，你跟对方都需要稳定的桥接（Tor Snowflake、WebTunnel 等）才能用。这层不解决，邀请别人下载也用不起来。

    桥接稳定后，先把 3-5 个最敏感的对话对象（家人、特定议题的同事、需要长期保护的合作对象）邀到 Signal，其他人继续留在微信。Signal 的 username 功能让你不需要先公开手机号码也能交换联络。期待「全部人换掉」是不切实际的目标，期待「对的对话用对的工具」才实际。

??? question "群组里有不熟的人，metadata 还是会泄漏吗"

    会。E2EE 保护的是消息内容，群组成员列表本身仍是 metadata。多人群组一旦有对手在里面，他能看到所有消息、知道谁在群组、知道你的装置是哪一支、知道你发讯的时间。敏感对话的群组要严格限制成员，必要时拆成只有信任成员的子群组。Signal 的「群组管理员核可加入」与 Matrix 的「邀请才能加入」设置都要善用。

??? question "Signal 换手机怎么搬"

    旧手机开启「转移账号到新手机」流程，新手机扫 QR code，消息历史会直接从旧装置同步过去。如果旧手机已经坏了或被抢，没有先设加密消息备份的话消息历史就回不来，但新装置仍可以用同一个号码登入。建议事前打开「设置 → 聊天 → 备份」设置一段强 passphrase，避免换手机时整段历史消失。

??? question "Briar 在没网络时真的能用？"

    在实体距离内可以。Briar 支援 Bluetooth 与 Wi-Fi Direct 的点对点通讯（约 10–30 公尺，视环境与障碍物而定），双方直接交换消息不需要任何 server 或 ISP。长距离不行，要等任一方接上 Tor 后消息才会跨距离投递。实际情境：一场活动现场断网时，能用 Briar 跟同场的人联络，但要联络场外的人就回不去了。

??? question "Matrix 自架值得吗"

    视规模、技术人力与所在地法规。20 人以下的小社群、没专人维运，用 anoni.net 或其他公开 homeserver 比较划算。50 人以上、有长期维护人力、想完全控制 metadata 的组织值得自架。自架要处理的不只是 server 本身，还有 storage、联邦的网络设置、E2EE 密钥备份、device verification 教学、突发 spam 与 abuse 处理。

    在中国大陆境内自架公开 homeserver 还要处理 ICP 备案与内容合规义务，这条路对多数社群来说成本过高，常见做法是改用境外 homeserver（如 anoni.net 的 `im.anoni.net`），代价是访问需要可靠的境外网络连接。社群可参考 [社群自架服务](../community/tools.md) 看 anoni.net 的部署选择。

??? question "P2P 消息工具（Briar、SimpleX）会被防火墙挡吗"

    在中国大陆，Briar 默认走 Tor，会遇到跟 Tor Browser 一样的封锁，需要 Snowflake 桥接（见 [Tor Snowflake 桥接点](./tor-snowflake.md)）。Briar 的 Bluetooth 与 Wi-Fi Direct 不受 ISP 层级封锁影响，是 Briar 在境内的主要价值，限制是实体距离。SimpleX 的官方 server 是普通 HTTPS 端点，部分 IP 或域名层级受影响，可能需要换 server 或自架。境内 DPI（深度包检测）比一般地区更积极，对 P2P 工具的检测与封锁会持续演化，工具选择要把这层成本算进去。

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-chat-question: 威胁模型如何建立](../basics/threat-model.md)
- [:material-shield-search: Metadata 是什么](../basics/metadata.md)
- [:material-key-chain-variant: 端对端加密如何运作](../advanced/e2ee.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的专案

<div class="grid cards" markdown>

- [:material-shield-lock-outline: 个人隐私指引研究专题](../community/privacy-guide.md)
- [:material-server-network-outline: 社群自架服务](../community/tools.md)
- [:material-translate-variant: 中文化与文件翻译](../community/i18n.md)

</div>

[^1]: [Bridgefy, the messenger promising secure, private chat for activists, was a bug-ridden mess](https://blog.cryptographyengineering.com/2020/08/24/anatomy-of-a-bad-idea-bridgefys-broken-encryption/){target="_blank"} - Cryptography Engineering blog
[^hk]: 香港《国安法》后监控与通讯记录作为证据的脉络见 [Internet censorship in Hong Kong](https://hongkongfp.com/2024/10/12/internet-censorship-in-hong-kong/){target="_blank"} - Hong Kong Free Press。
