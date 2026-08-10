---
title: 出差与研讨会的数位准备（东亚与东南亚）
description: 整理东亚与东南亚十四个常见出差与研讨会地点的网络审查、VPN 与 Tor 可达性、SIM 实名与入境查机现况，加上干净机与跨境号码的取舍，帮华语读者在出发前安排对应的数位准备。
icon: material/bag-suitcase-outline
---

# :material-bag-suitcase-outline: 出差与研讨会的数位准备（东亚与东南亚）

带着平常的手机与笔电出国，多数时候不会有事。问题出在你去的地方，网络环境可能跟你熟悉的差很多。同一支手机、同一套工具，换个地方就可能用不了：有的地方 Signal 要挂 VPN 才连得上，有的地方在社交平台上按个赞，就可能遇到当地刑法。出差或参加研讨会时，先知道目的地的网络审查与监控到什么程度，才能在出发前做对准备，而不是落地才发现工具用不了、或不小心让自己暴露在法律风险里。

这篇整理东亚与东南亚十四个常见地点的现况，做成一张对照表，再给出依风险分层的准备清单。无论你从中国大陆、港澳、新马、台湾或其他华语环境出发，都可以拿这张表当行前依据。

!!! warning "查证日与时效"
    审查现况变动很快，VPN 能不能用、哪个服务被封，可能几个月就翻一次。本表整体查证日为 **2026 年 8 月**，每地的判断以该段时间的公开来源为准。出发前请以 [OONI Explorer](https://explorer.ooni.org/){target="_blank"} 查目的地的最新观测、以各地官方公告查 SIM 与入境规定，不要把静态表格当成当下的保证。每地的[逐地注记](#逐地注记)末尾都附了该地的 OONI Explorer 直达链接。

## 如何读这张表

- **审查强度**用 Freedom House 的 [Freedom on the Net](https://freedomhouse.org/report/freedom-net){target="_blank"}（FOTN，年度网络自由评比，满分 100，分数越高越自由）2025 年版的分数与分级。香港、澳门不在 FOTN 单独评分范围，改用质性描述标注。表格以区域内最开放的台湾（FOTN 亚洲第 1）为参照基准，方便对照其他地点的落差。
- **分数高不代表没有风险**。香港、澳门主流服务都连得上，表面像自由网，真正的代价在实名登记、浏览记录长期留存与法律追究，香港自 2026 年 3 月起还多了国安调查下的装置解密义务。读的时候要把「能不能连上」跟「连上之后会不会被究责」分开看。
- **VPN 与 Tor 两栏**呈现工具的技术可达性与合法性。Tor 是把连接经过多个中继转送、隐藏你来源位置的免费匿名工具（详见 [什么是 Tor](../tools/what-is-tor.md)），不熟的人可以先看 VPN 栏，把 Tor 栏当进阶参考。即使工具能用，发表特定内容仍可能触法，这部分看逐地注记与最后的研讨会提醒。
- 先看下一节的「出发前通用准备」，每个地点都适用，再依目的地落在哪个风险层补上加码准备。

## 东亚与东南亚网络监控对照表

| 地区 | 审查强度（FOTN 2025） | VPN | Tor | SIM 实名 | 入境装置检查 |
|---|---|---|---|---|---|
| 台湾（参照） | 79（自由），亚洲第 1 | 合法 | 可直连 | 护照、第二证件 | 低 |
| 日本 | 78（自由） | 合法 | 可直连 | 语音号码实名，数据 SIM 纳管待施行 | 低 |
| 南韩 | 65（部分自由） | 合法 | 可直连 | 护照实名 | 低 |
| 菲律宾 | 61（部分自由） | 合法 | 可直连 | 护照实名，旅客卡 30 天 | 低 |
| 马来西亚 | 60（部分自由） | 合法 | 可直连 | 护照正本、住宿地址 | 中 |
| 新加坡 | 53（部分自由） | 合法 | 可直连 | 护照实名，30 天有效 | 中（搜查授权强） |
| 印尼 | 48（部分自由） | 合法 | 可直连 | 护照实名、IMEI 登录 | 中 |
| 香港 | 未单独评分（FiW 41，部分自由） | 合法 | 一般可直连 | 护照实名（2023 起） | **高**（2026/3 起国安调查可要求解锁，含转机） |
| 澳门 | 未涵盖 | 合法 | 一般可直连 | 护照实名、ISP 留存一年 | 中（资料少） |
| 柬埔寨 | 42（部分自由） | 合法 | 一般可直连 | 多需证件，无强制法 | 低 |
| 泰国 | 39（不自由） | 合法 | 建议备桥接 | 护照、脸部辨识，每业者上限 3 张 | 中高 |
| 越南 | 22（不自由） | 合法（受网安法规范） | 建议备桥接 | 护照实名 | 中（资料少） |
| 中国大陆 | 9（不自由） | 灰色，须强混淆 | 重度封锁 | 护照、人脸 | 高 |
| 缅甸 | 9（不自由） | 提供服务入罪（2025 网安法） | 重度封锁 | 护照或 NRC、拦截设备 | 高 |

香港、澳门未列入 FOTN 单独评分，香港的 FiW（Freedom in the World）2026 年为 41 分（部分自由）仅供质性对照。SIM 与入境规定为 2026 年 8 月查证，细节以出发前官方公告为准。

自上一版（2026 年 6 月）以来改动最大的是香港，入境装置检查从「中」升到「高」，理由是 2026 年 3 月生效的国安装置解密义务，细节见后面逐地注记的香港一节。其余变动集中在泰国的 SIM 新规、南韩的 CDN 层封锁、新加坡的新监理机关，同样见逐地注记。

## 出发前的通用准备（每个地点都适用）

这几项不分地点都建议做，风险越高的目的地越要做满。

- **带最简化的装置**。出差用的手机、笔电里，跟这趟无关的数据越少越好。高风险地建议准备一支只装必要 App 的干净机，敏感数据留在云端或家里，需要时再透过加密连接取用。要不要另外准备一台机器、能不能在外地买、带回来会发生什么，展开在下方的 [干净机与 burner 手机的取舍](#干净机与-burner-手机的取舍)。
- **出发前装好并测试规避工具**。VPN、Tor Browser 与桥接都要在家里先装好、连一次确认可用。到了审查严的地方，App 商店与工具官网本身就连不上，落地才想下载通常来不及。Tor 的桥接设定见 [Tor Snowflake 桥接点](../tools/tor-snowflake.md) 与 [Tor Browser 进阶设定](../tools/tor-browser-advanced.md)，自架桥接见 [如何架设 Tor WebTunnel](../community/setup-tor-webtunnel.md)。
- **准备两种以上的连接方式**。单一 VPN 协议常被封，多带一两款备援。多数目的地用一般 VPN 就够，只有中国、缅甸这种强封锁地，标准的 WireGuard、OpenVPN 几秒内就被封，要改用有混淆（obfuscation，把 VPN 流量伪装成一般 HTTPS）功能的方案。具备这类混淆的服务，例如 Proton VPN（Stealth 协议）、Mullvad（混淆、Shadowsocks 桥接）、ExpressVPN（自动混淆，Lightway 协议）、NordVPN（NordWhisper）、Surfshark（Camouflage Mode）、Astrill（StealthVPN）。哪些「现在能用」会随封锁更新而变，出发前查当地最新回报并先测试一次。怎么挑一个值得信任的 VPN（审计、所有权、匿名付款）见 [VPN 的风险与选择](../tools/vpn-guide.md)。
- **敏感通讯改用端对端加密工具**。Signal 是常见选择，但部分地区会封锁，出发前确认目的地能不能连，连不上时改走 Tor 或 VPN。团队出差可事先约好主要与备用管道。
- **账号分流**。研讨会社交、商务联络与个人账号分开，减少一个被盯上时牵连到其他身份。每一层要准备哪些独立的 email、浏览器 profile 与两阶段验证，见 [怎么维持多个网络身分](../basics/multiple-identities.md)。
- **SIM 用漫游或纯数据 eSIM**。三种方式都会留下某种身份记录，差别在这份记录落在谁手上、当地政府能不能直接把号码对应到你本人：
    - **落地办实名卡**：护照（部分地区还加人脸）与这个本地号码，直接登进当地电信商与政府的数据库，当地执法即查即得，且常长期留存。
    - **本国号码漫游**：登记你身份的是家乡的电信商，当地只看到一个外国漫游号码的连接与位置，要对应到本人通常得走跨境调取。
    - **纯数据 eSIM（无本地号码）**：连本地号码这层都省掉，身份多半只留在 eSIM 供应商与你的付款记录里。

    对「目的地监控」这个威胁来说，漫游与 eSIM 把对应留在境外，比较难被当场对应到本人。需要本地号码收验证码时，再评估是否落地办卡。实名要求正在往 eSIM 延伸，日本已修法把纯数据 SIM 与 eSIM 纳入本人确认义务，施行日由政令另订、最迟 2027 年 5 月，境外供应商是否纳管也尚未明确。各地规则不同而且都在变，出发前查目的地的当下规定，不要预设 eSIM 一定匿名。
- **开启全盘加密、设好开机密码**。入境查机风险高的地方，关机状态加上强密码，比解锁状态安全。要分清楚这道防护挡的是什么，加密挡的是装置被拿去离线取出数据，挡不掉「当场要求你解锁」。香港 2026 年 3 月起，涉国安调查时拒绝交出密码本身就是刑事罪，中国、缅甸则有现场临检。在这些地方，真正有效的是装置里本来就没有敏感内容。
- **留好离线备份与紧急联络方式**。遇到断网或装置被扣，至少还能联络上同事或家人。

## 依风险分层的加码准备

先做完上一节的通用准备，再依目的地落在哪一层补上加码项。这节给的是跨地的准备强度，每地更细的被封服务与查证来源见后面的逐地注记。

### 低风险：台湾（参照）、日本、南韩

台湾、日本、南韩接近完全开放的网络环境，用平常的工具即可。主要记得办 SIM 要带护照，日本把数据 SIM 纳入实名的修法已完成、施行日待定。南韩有内容过滤与较强的通讯拦截法制，2026 年起又把封锁推进到 CDN 层，过度封锁波及正常网站的机会变高，处理敏感数据或遇到连不上的站台时自备 VPN。

### 中风险：菲律宾、马来西亚、新加坡、印尼、澳门

主流服务大致可用，VPN 与 Tor 可连，但各有针对性封锁与较强的法律工具。这里真正要顾的是你发表了什么、以及实名登记留下的记录，连接本身通常不成问题。落地办卡带齐证件，公共与会场 Wi-Fi 一律走 VPN，对外发表前先了解当地的诽谤与内容法规。

### 高风险：香港、泰国、越南、柬埔寨、中国大陆

系统性封锁规模大，法律对线上言论的追诉力道强。出发前务必装好混淆型 VPN 与 Tor 桥接并测试，带干净机，敏感工作不要在当地网络上做。中国要假设所有连接都受监看、境外服务都连不到。泰国、越南建议预设 Tor 桥接，因为近年封锁规模大增、直连可能受阻。连接层的混淆准备对应的是泰国、越南、柬埔寨与中国大陆，香港的准备重点在装置本身，见下一段。

香港的连接环境接近中风险，Google、社群与通讯服务照常可达，VPN 合法、Tor 一般也可直连，真正的门槛在入境检查站。2026 年 3 月起，涉及国安调查时可要求交出装置密码或解密方法，适用所有国籍，包含只在香港机场转机并通关的旅客，拒绝本身即构成犯罪。这个风险型态与其他四地不同，也是香港被放进这一层的原因。装置内容成为主要暴露面之后，准备强度就要拉到干净机这一层，带最少的东西过关比事后解释有用。

### 极高风险：缅甸

数位环境是亚洲最危险的之一。2025 年网络安全法把未经授权的 VPN 服务入罪化，街头与检查哨会临检手机、搜查 VPN App 与社群贴文，冲突区随时可能全面断网。携带最简化的干净装置、避免落地办卡绑定身份、全程假设受监控。涉及敏感主题者面临人身与数据双重风险，行前应做完整的威胁评估，必要时咨询有当地经验的组织。

## 干净机与 burner 手机的取舍

通用准备里的「带最简化的装置」这一条，展开来就是要不要另外准备一台机器。以下处理有没有必要、能不能在外地买、带回来之后会发生什么。

### 先把「装置」与「号码」分开

burner 这个俗称把两件事混在一起，风险来源并不相同：

- **装置**：手机本体有 IMEI（每台机器的硬件识别码），换 SIM 不换机，电信商仍然看得到是同一台机器
- **号码**：SIM 卡的实名登记把号码绑到你本人

分开之后，多数出差情境的答案是一台可重复使用的干净机，搭配依地点取得的号码。整套用完就丢的做法成本高，实际需要的人不多。

### 谁需要

| 情境 | 建议 |
|---|---|
| 一般商务出差、研讨会参加者 | 多数不需要另外准备。把主力手机的资料清干净、关掉自动同步就够 |
| 前往中国大陆、缅甸，或工作涉及当地敏感议题 | 准备干净机，主力手机留在家 |
| 记者、NGO 工作者到高风险地采访 | 干净机，并且评估要不要在当地留下任何号码记录 |
| 已被告知特定风险的个人 | 见 [社运行动者的数位准备](./activist.md) 的一次性手机一节，那里有动员场景的完整判断与事前准备步骤 |

干净机的基本设定跟动员场景一样，二手机重装、不登入本名账号、只装这趟用得到的 app。

### 在境外买不见得比较匿名

「在外地买一张没人知道是我的卡」在东亚与东南亚几乎做不到。上面对照表的「SIM 实名」栏就是答案，十四地里只有柬埔寨没有强制实名的法规，而当地电信商办卡多半仍要求出示证件。日本的纯数据 SIM 目前也还没有本人确认义务，但纳管的法律已经公布，最迟 2027 年 5 月施行，空隙有期限。

- 落地办实名卡等于把护照送进当地电信商与政府的数据库
- 中国大陆与泰国另外要求人脸，泰国自 2025 年 8 月起导入脸部活体侦测
- 旅客卡多半有效期短，新加坡 30 天、泰国 60 天

降低当地政府当场把号码对应到你的风险，做法在上面的通用准备已经给过（漫游或纯数据 eSIM，把对应留在境外）。境外购买本身不提供匿名。

### 带回中国境内会发生什么

以下以带回中国境内为准。港澳、新马、台湾的读者请对照自身法域，几条结论会明显不同，见本节最后。繁体中文版的同一节以带回台湾为准。

- **境外号码在境内漫游**：一个外国漫游号码长期出现在你住处附近，在境内不但不低调，反而显眼，也一样落在监控范围内。跨境调取的门槛不构成保护
- **入境时装置本身可能被查**：2024 年 7 月起新规授权国安人员检查个人电子设备，深圳、上海有海关抽查手机与笔电的报告。本表把中国大陆的入境查机风险列为最高一级
- **预付卡有效期**：旅客卡多为 30 到 60 天，带回来很快就失效，之后要靠原发卡地充值或换卡
- **换插境内 SIM**：境内办卡自 2019 年底起强制实名加人脸，机器就跟你的实名身份绑在一起，干净机的意义同时消失
- **IMEI 会把两个号码串起来**：同一台机器先用境外卡、回来再用境内卡，电信商侧看到的是同一个 IMEI 底下换过两个号码
- **海关**：携带多支手机本身不违法，但在入境查机风险高的地方会增加被询问的机会

在境内平台发表内容的风险与既有实践，见 [在中国大陆的公开平台传播信息](./mainland-speech.md)。

!!! note "带回港澳、新马或台湾时"

    这几个法域的入境查机风险低得多，境外漫游号码要对应到本人通常得走跨境调取，那一层确实构成一定程度的保护。预付卡实名的要求各地不同，见下方逐地注记。

### 比较实际的做法

- 装置留着重复使用，每趟出发前重设，回来后不要拿它处理日常事务
- 不要在同一台机器上混用境外与本地号码
- 回到常住地真的需要另一个号码时，在当地取得。实名这一层多数法域都避不掉，各地的登记要求见下方逐地注记
- 装置确实涉入高风险、需要彻底退役时，再评估物理销毁，做法见 [社运行动者的数位准备](./activist.md)

### burner 帮不上忙的地方

换机器不会换掉行为。以下情况再干净的装置都无效：

- 在干净机上登入日常的 email、社群或云端账号
- 联系同一批人、维持同样的作息、出现在同样的位置
- 两台机器同时开机带在身上，基地台讯号会把它们配对起来

装置只是其中一层，账号层要怎么分见 [怎么维持多个网络身分](../basics/multiple-identities.md)。

## 逐地注记

每地列出主要被封服务、SIM 与入境重点，以及该段时间的查证来源。

### 中国大陆

防火长城（Great Firewall）长期完整封锁 Google、YouTube、Facebook、Instagram、WhatsApp、Signal、Telegram、X 与全语系 Wikipedia，外媒多数被封。手法含 DNS 污染、SNI 过滤与深度封包检测（DPI，逐笔分析连接判断是否放行的技术）。个人翻墙属违法灰色地带，2025 年底国安部公开警告会究责。VPN 要选有强混淆的方案、入境前装好至少两款。Tor 直连在中国无法使用，obfs4 桥接长期被封。Tor Project 对中国目前建议优先用 WebTunnel，Snowflake、meek 作为备选，但可用性会随封锁更新大幅波动，出发前务必先测试，并多备几种桥接。SIM 自 2019 年底起强制实名加人脸，外籍旅客同样适用。2024 年 7 月起新规授权国安人员检查个人电子装置，深圳、上海有海关抽查手机与笔电的报告。在境内平台发表内容的风险与既有实践，见 [在中国大陆的公开平台传播信息](./mainland-speech.md)。查证来源（2026-08）：[FOTN 2025 China](https://freedomhouse.org/country/china/freedom-net/2025){target="_blank"}、[Tor 对中国的连接指引](https://support.torproject.org/censorship/connecting-from-china/){target="_blank"}。最新观测：[OONI Explorer 中国大陆](https://explorer.ooni.org/zh-CN/country/CN){target="_blank"}。

### 香港

不适用防火长城，Google、社群与通讯服务一般正常可达。但《国安法》下出现选择性封锁，2021 年起有 ISP 依法封锁 HKChronicles 等网站，2024 年通过的《维护国家安全条例》（基本法 23 条立法）扩大调查与下架权限。SIM 自 2023 年 2 月起全面实名，旅客可用护照登记。2024 年已有外国企业赴港改用抛弃式（burner）手机的报导。

2026 年 3 月 23 日刊宪并即日生效的《国安法》第 43 条实施细则修订，把装置内容变成赴港的主要暴露面。修订要求受国安调查的人交出电子装置密码或解密方法，范围还及于被指定为知悉密码的其他人，法律分析指出这可能涵盖同住家人与配偶。个人拒绝最高可判监禁一年并罚款 10 万港元，明知而提供虚假或误导数据最高三年与 50 万港元。美国国务院说明这项修订适用于所有人，包含只在香港国际机场转机并通关的旅客，美国驻港澳总领事馆于 3 月 26 日发出安全警示。

这条的前提是国安调查，适用时机不等同入境时的无差别搜查，一般商务旅客日常过关被要求解锁的机率不高。真正棘手的地方在国安条文的认定范围宽、裁量权在当局，而且一旦被要求，拒绝本身就构成犯罪，少了「不配合、顶多被拒绝入境」这个相对轻的选项。另有说法称同年 3 月底还生效一套不以国安嫌疑为前提的边境解锁权，这个说法只见于旅游信息网站，各家对生效日与罚则的描述互相矛盾，官方公报与第一线媒体都查不到对应文本，本文不予采信，读者在别处看到时也建议回头查官方公告。

实务上要把准备从「连接加密」移到「装置内容最小化」，敏感数据留在境外、用干净机过关，比到了柜台再考虑要不要配合有用。主流服务连得上不等于安全，敏感讨论用端对端加密工具，并避免留存在本地装置。查证来源（2026-08）：[Internet censorship in Hong Kong](https://hongkongfp.com/2024/10/12/internet-censorship-in-hong-kong/){target="_blank"} - HKFP、[2026 年第 43 条实施细则修订刊宪](https://www.info.gov.hk/gia/general/202603/23/P2026032300310.htm){target="_blank"} - 香港政府新闻公报、[香港引入国安嫌疑人交出密码的罪行](https://hongkongfp.com/2026/03/23/hong-kong-introduces-offence-requiring-national-security-suspects-to-hand-over-passwords/){target="_blank"} - HKFP、[修订扩大警方权力的法律分析](https://eusee.hivos.org/alert/hong-kong-amends-national-security-law-implementation-rules-to-expand-police-powers/){target="_blank"} - Hivos EU SEE、[Security Alert：拒绝交出移动装置密码在香港已入罪](https://hk.usconsulate.gov/security-alert-2026032601/){target="_blank"} - 美国驻港澳总领事馆、[FiW 2026 Hong Kong](https://freedomhouse.org/country/hong-kong/freedom-world/2026){target="_blank"}。最新观测：[OONI Explorer 香港](https://explorer.ooni.org/zh-CN/country/HK){target="_blank"}。

### 澳门

无防火长城，Google、Facebook、YouTube、X、WhatsApp、Telegram、LINE 通常正常运作。代价在《网络安全法》要求电信实名，且 ISP 须保留用户浏览记录至少一年，等于连接行为被长期记录。SIM 自 2019 年底起须登记，旅客以护照办理。建议用 VPN 盖住浏览内容、SIM 用漫游或纯数据 eSIM。澳门的 Tor 可达性与入境查机公开资料较少，属证据不足，敏感任务仍采干净装置原则。香港 2026 年 3 月的装置解密义务只适用于香港，澳门目前未见同类公开规定，但港澳常排在同一趟行程，只要途中经过香港，整趟就按香港的标准准备。查证来源（2026-08）：[FOTN 2025 报告](https://freedomhouse.org/report/freedom-net/2025/uncertain-future-global-internet){target="_blank"}（未含澳门，说明覆盖范围）。最新观测：[OONI Explorer 澳门](https://explorer.ooni.org/zh-CN/country/MO){target="_blank"}。

### 日本

无系统性封锁，一般旅客连接完全开放。唯一的灰色地带是盗版网站的著作权执法走法院途径，不影响日常上网。VPN 完全合法，Tor 直连可用，日本本身就是 Tor 中继与出口节点的重要所在地。SIM 实名规定正在分两阶段收紧，两者容易被混为一谈。2026 年 4 月起生效的省令，强化的是既有规范对象（语音号码与可收短信的 SIM、eSIM）的验证方式，废止上传证件照片，改以读取 IC 芯片核对身份。把纯数据 SIM 与 eSIM 一并纳入本人确认义务的则是另一部法律修正案，2026 年 5 月 29 日公布，施行日由政令另订、最迟不超过 2027 年 5 月 29 日，截至 2026 年 8 月尚未施行。修法动机是诈骗集团以盗用的账号密码大量取得数据 SIM。境外 eSIM 供应商是否纳入规范，法律事务所的解说指出法案文件并未写明，留待后续省令厘清，出发前不要把「境外买的 eSIM 一定不受规范」当成确定前提。语音号码一向要验证身份、短期旅客多半办不到，本国号码保留收银行验证码。查证来源（2026-08）：[FOTN 2025 Japan](https://freedomhouse.org/country/japan/freedom-net/2025){target="_blank"}、[本人确认义务扩大至数据 SIM 的修法解说](https://www.morihamada.com/ja/insights/newsletters/138336){target="_blank"} - 森・滨田松本法律事务所。最新观测：[OONI Explorer 日本](https://explorer.ooni.org/zh-CN/country/JP){target="_blank"}。

### 南韩

主流外站不封锁，旅客一般浏览不受影响。但有系统性的内容过滤，审议机关（原 KCSC，2025 年 10 月改组为방송미디어통신심의위원회）对色情、赌博、北韩宣传等类别封锁，官方统计的年度通讯审议案件从 2008 年的 2 万 9 千余件增至 2024 年的 35 万 6 千余件，其中实际下架或封锁的数量另计。技术上采 SNI 过滤（监看 HTTPS 连接中未加密的域名字段来比对黑名单），等于 ISP 拿得到你造访的域名清单。VPN 合法，常被用来绕过过滤。Tor 直连一般可用。SIM 须出示护照实名，观光 eSIM 较宽松但仍绑护照。南韩通讯拦截法制偏强，《通讯秘密保护法》授权即时拦截，处理敏感数据者宜纳入威胁模型。

依 2025 年 5 月施行的非法信息接取阻断技术义务化规定，主管机关于 2025 年 9 月行文要求 Cloudflare 配合封锁指定域名，2026 年 5 月 1 日起经 Cloudflare 代管的目标站台对韩国连接直接回 HTTP `451`，封锁层级从 ISP 端推进到全球 CDN 业者端。同年 5 月 11 日再上路著作权侵害网站的紧急阻断制度，由文化体育观光部长先命令 ISP 封锁、著作权保护审议委员会五日内事后审议，首日就对 34 个站台发出命令。CDN 端执行的封锁改 DNS 规避不了，有报导指出过去在 ISP 端有效的规避工具也一并失效，这点目前缺少公开的实测验证。对商务旅客而言真正的风险是误封，已有二次元同人站、烟品经销这类与色情赌博无关的合法站台被一并封锁的用户回报，行程仰赖特定服务时先备好 VPN。查证来源（2026-08）：[FOTN 2025 South Korea](https://freedomhouse.org/country/south-korea/freedom-net/2025){target="_blank"}、[South Korea SNI filtering](https://www.bleepingcomputer.com/news/security/south-korea-is-censoring-the-internet-by-snooping-on-sni-traffic/){target="_blank"} - BleepingComputer、[行政审查统计与制度批评](https://www.opennetkorea.org/en/wp/5153){target="_blank"} - Open Net Korea、[主管机关要求 Cloudflare 封锁的原始通知](https://lumendatabase.org/notices/73101162){target="_blank"} - Lumen Database、[文化体育观光部依新法对 34 站发出紧急阻断命令](https://www.koreatimes.co.kr/entertainment/20260511/culture-minister-blocks-access-to-illegal-sites-under-new-anti-piracy-law){target="_blank"} - Korea Times。最新观测：[OONI Explorer 南韩](https://explorer.ooni.org/zh-CN/country/KR){target="_blank"}。

### 台湾（参照）

区域内最开放的网络环境，FOTN 2025 亚洲第 1、全球第 7，主流服务皆不封锁，作为本表的最开放参照点。Freedom House 点出的疑虑在制度层面：TWNIC 透明度报告显示 2025 上半年逾 5 万个域名被列入 RPZ 屏蔽，多数透过紧急请求（RPZ 1.5）、未经事前司法审查，属治理透明度问题，非旅客日常会遇到的广泛封锁。TWNIC 已上线 2025 下半年与年度报告，并开放历年报告下载，要引用数字时以该站当期公布为准。VPN 合法、Tor 直连可用。SIM 预付卡须出示护照（含入境章），通常还要第二证件，机场购买多半只需护照。查证来源（2026-08）：[FOTN 2025 Taiwan](https://freedomhouse.org/country/taiwan/freedom-net/2025){target="_blank"}、[TWNIC RPZ 透明度报告](https://rpz.twnic.tw/){target="_blank"}。最新观测：[OONI Explorer 台湾](https://explorer.ooni.org/zh-CN/country/TW){target="_blank"}。

### 菲律宾

东南亚中相对开放的一个，无系统性封锁。最受关注的事件是 NTC 在 2022 年依《反恐法》要求封锁含独立媒体 Bulatlat、Pinoy Weekly 在内的 27 个网站，该封锁令已于 2025 年 11 月经法院判违宪撤销。一度传出要封 Telegram，2026 年 2 月政府与平台达成内容防制协议后不予封锁。VPN 与 Tor 可正常使用。SIM 依 2022 年《SIM Registration Act》（RA 11934）强制实名，旅客以护照加当地地址登记，卡片 30 天有效。主要法律风险是网络诽谤（cyberlibel），公开发表留意用词。查证来源（2026-08）：[FOTN 2025 Philippines](https://freedomhouse.org/country/philippines/freedom-net/2025){target="_blank"}、[Court voids NTC blocking order](https://www.bulatlat.com/2025/11/25/bulatlat-wins-censorship-case-court-voids-memo-blocking-27-websites/){target="_blank"} - Bulatlat。最新观测：[OONI Explorer 菲律宾](https://explorer.ooni.org/zh-CN/country/PH){target="_blank"}。

### 马来西亚

有封锁，但以线上赌博、色情、侵权为大宗，2018 至 2024 年累计封逾 24,000 个网站。政治动机封锁过 Sarawak Report、Medium，两者已于 2025 年 3 月前解封。2024 年底两项新法扩权：《通讯与多媒体法》修正案，以及《线上安全法》（Online Safety Act 2025，2024 年 12 月国会通过），赋予 MCMC 更广的内容移除与监控权。《线上安全法》已于 2026 年 1 月 1 日生效，在马用户数达 800 万以上的社群与通讯平台自动视为持牌，须配合内容处置要求，子法的风险缓解与儿少保护规范则到 2026 年 6 月才陆续到位。法规对象是平台业者，一般使用者不在直接规范范围，实际影响落在内容被移除的速度变快。2025 年对 Telegram 取得针对特定公开频道的法院禁制令。WhatsApp、Telegram、Signal 一般可用，VPN 与 Tor 可用。SIM 自 2018 年起强制实名，旅客须出示护照正本（不接受影本）加在马住宿地址，2025 年底起本地新卡登记须绑 MyDigital ID（限马国公民，外国旅客不适用，仍以护照登记）。真正的红线是涉及王室、煽动、宗教与种族的内容。查证来源（2026-08）：[FOTN 2025 Malaysia](https://freedomhouse.org/country/malaysia/freedom-net/2025){target="_blank"}、[MCMC SIM 登记 FAQ](https://www.mcmc.gov.my/en/faqs/prepaid-registration/what-type-of-documents-can-be-used-for-the-registr){target="_blank"}。最新观测：[OONI Explorer 马来西亚](https://explorer.ooni.org/zh-CN/country/MY){target="_blank"}。

### 新加坡

封锁范围窄但法律工具强。2024 年 10 月封锁 10 个被指可用于对新加坡发动敌意信息行动的网站。新闻网站受 IMDA 牌照与 POFMA（防止网络假信息与操纵法）约束，政府可对被认定不实的陈述发更正指令。VPN 与 Tor 合法可用，主流服务日常可达。SIM 须以护照登记，以护照登记的非居民卡自 2024 年 7 月起有效期仅 30 天。2024 年《刑事诉讼修正法》扩大无令状搜查权，逮捕可疑犯罪者时得搜查其持有或控制的物件，实务上一般旅客少见随机解锁，但法律门槛低。

2026 年 6 月 29 日起，依《线上安全（救济与问责）法》成立的线上安全委员会（Online Safety Commission）开始受理案件，首阶段受理的五类线上伤害是网络骚扰、网络跟踪、起底、未经同意散布私密影像，以及儿少影像性剥削。委员会可要求平台限期移除内容，平台不配合时得命令 ISP 封锁特定页面、群组，必要时封锁整个平台。封锁整个平台被定位成平台拒绝配合时才动用的后盾机制，这项权力让新加坡的封锁工具箱从 POFMA 的个案更正指令扩大到服务层级。最大风险仍在你发表了什么（POFMA、诽谤、FICA）。查证来源（2026-08）：[FOTN 2025 Singapore](https://freedomhouse.org/country/singapore/freedom-net/2025){target="_blank"}、[Criminal Procedure Amendments Act 2024](https://sso.agc.gov.sg/Acts-Supp/5-2024/Published/20240318?DocDate=20240318){target="_blank"}、[线上安全委员会与《线上安全（救济与问责）法》自 2026 年 6 月 29 日施行](https://www.mlaw.gov.sg/online-safety-commission-and-online-safety-relief-and-accountability-act-2025-to-start-on-29-june-2026/){target="_blank"} - 新加坡律政部。最新观测：[OONI Explorer 新加坡](https://explorer.ooni.org/zh-CN/country/SG){target="_blank"}。

### 印尼

中度且大致可预测的审查，封锁集中在色情与赌博，透过 Trust Positif 黑名单以 DNS 窜改执行。另有 PSE 平台注册制，未注册就封锁：2022 年曾封 PayPal、Steam、Epic Games 等，2024 年 7 月封 DuckDuckGo，2026 年 2 月 25 日到 4 月 30 日封锁 Wikimedia 的登录域名 `auth.wikimedia.org`，同样以未完成注册为由，该期间读者浏览条目不受影响，受阻的是登录与编辑。2026 年 5 月 22 日以线上赌博为由封锁预测市场平台 Polymarket。另自 2026 年 3 月 28 日起施行儿少数字空间保护规则（PP Tunas，`PP Nomor 17 Tahun 2025`），未满 16 岁不得在高风险平台持有账号，平台须配合验证年龄。WhatsApp、Tor 在测试期间多为可达，VPN 普及合法。SIM 外国旅客以护照办理，另自 2020 年起手机须登录 IMEI，用本地 SIM 时需在入境向海关登录装置。整体对一般商务旅客风险可控，行前确认常用服务是否在封锁名单上，需要登录编辑维基或使用小众服务的人尤其要先测。查证来源（2026-08）：[FOTN 2025 Indonesia](https://freedomhouse.org/country/indonesia/freedom-net/2025){target="_blank"}、[iMAP Indonesia 2024](https://imap.sinarproject.org/reports/2024/imap-indonesia-2024-internet-censorship-report){target="_blank"} - Sinar Project。最新观测：[OONI Explorer 印尼](https://explorer.ooni.org/zh-CN/country/ID){target="_blank"}。

### 柬埔寨

采选择性 DNS 封锁独立媒体，非全国性大断网。Voice of Democracy 于 2023 年被关闭，2023 年大选前封锁 Cambodia Daily、Radio Free Asia 等。OONI 量测显示被封站多为新闻与人权类，由多家 ISP 以 DNS 执行。VPN 与 Tor 合法可用，是绕过被封新闻站的常见手段，边境一般不查手机。SIM 目前无强制实名法规，但电信商办卡多会要求出示证件。需留意 National Internet Gateway（国家网关）计划在 2025 年复活、规划 2026 年起建设单一对外网关，一旦上线会大幅增加集中式审查与监控能力。这项计划自 2022 年原定启用日起多次延期，截至 2026 年 8 月仍未见上线的公开确认，出发前值得再查一次状态。查证来源（2026-08）：[FOTN 2025 Cambodia](https://freedomhouse.org/country/cambodia/freedom-net/2025){target="_blank"}、[Cambodia resurrects internet gateway plan](https://asia.nikkei.com/business/telecommunication/cambodia-resurrects-plan-for-controversial-internet-gateway){target="_blank"} - Nikkei Asia。最新观测：[OONI Explorer 柬埔寨](https://explorer.ooni.org/zh-CN/country/KH){target="_blank"}。

### 泰国

东南亚主要商旅目的地中审查最受关注的一个，FOTN 列为不自由（与越南、缅甸同列）。法源是《电脑犯罪法》与刑法第 112 条（冒犯王室，lèse-majesté，刑期 3 至 15 年）。法院下令、数位经济与社会部执行 URL 封锁，泰国皇家警察的科技犯罪打击中心统计 2025 年 10 月到 2026 年 5 月封锁逾 71 万个赌博相关 URL。LINE 为主流，WhatsApp、Telegram、Signal 目前可用。VPN 合法普遍，但近年封锁规模大增，建议旅客预设 Tor 桥接以防直连受阻。

NBTC 于 2026 年 5 月 15 日公报、5 月 16 日生效的科技犯罪防制公告修订了 2025 年 8 月版，外国人在每一家业者最多只能登记 3 张 SIM，护照为主要登记文件、须本人到场并通过含生物特征的查验，插满四张卡以上的多卡设备会被业者阻断。有两个都成立、意义却不同的 60 天要分清楚，一是旅客卡本身的使用有效期上限为 60 天，逾期不能靠储值延长、须重新以护照验证身份才能续用，二是 2026 年新增的规定，登记后 60 天内未启用就要重新验证才能开通。实际贩售的旅客方案（8 天、15 天、30 天等）有效期通常远短于这个上限。

第 112 条与电脑犯罪法适用境内任何人、不分国籍，外国人曾因相关贴文被捕、没收护照、驱逐并终身禁入，按赞与转发都可能担责。绝不公开评论王室。查证来源（2026-08）：[FOTN 2025 Thailand](https://freedomhouse.org/country/thailand/freedom-net/2025){target="_blank"}、[Thailand biometric SIM registration](https://www.biometricupdate.com/202508/thailand-mandates-biometric-liveness-detection-for-sim-registration){target="_blank"} - Biometric Update、[NBTC 收紧电信登记与 IP 地址规则](https://www.tilleke.com/insights/thailand-tightens-telecom-registration-data-and-ip-address-rules-to-combat-tech-crime/){target="_blank"} - Tilleke & Gibbins、[泰国 2026 年 SIM 卡新规](https://lexbangkok.com/thailand-sim-card-rules-2026/){target="_blank"} - Lex Bangkok、[科技犯罪打击中心的赌博站封锁统计](https://news.worldcasinodirectory.com/thailand-intensifies-fight-against-online-gambling-123003){target="_blank"}、[True Tourist SIM（60 天有效期上限、护照登记）](https://www.true.th/en/prepaid/sim/tourist){target="_blank"}。最新观测：[OONI Explorer 泰国](https://explorer.ooni.org/zh-CN/country/TH){target="_blank"}。

### 越南

高审查环境，FOTN 22 分。2025 年 5 月电信局下令 ISP 封锁 Telegram，用户未挂 VPN 即难以连上。Decree 53/2022 要求外国业者数据在地化、留存数据至少 24 个月。Decree 147/2024 要求大型平台以越南手机号或身份证实名、24 小时内移除违法内容，Facebook 受影响最大。另有数万人规模的「47 部队」网军以检举与带风向压制异议。

修订版《网络安全法》（Law 116/2025/QH15）自 2026 年 7 月 1 日生效，取代 2018 年网安法与 2015 年网络信息安全法，整并成单一框架，维持数据在地化与留存要求，并把下架时限写进法律，一般违法内容 24 小时、紧急案件 6 小时内须依公安部要求移除。《个人数据保护法》（Law 91/2025/QH15）也于 2026 年 1 月 1 日生效。这几部法的规范对象都是业者，对旅客的意义在境内平台的下架速度更快、连接与账号记录留在越南境内的量更大。新法未新增针对 VPN 的专属条文，个人使用在观光与商务旅客层级实务上几乎不见执法。

VPN 使用合法但受网安法规范，建议行前装好设定。Tor 直连大致可用，但审查机制活跃，建议备妥 WebTunnel 或 Snowflake 桥接。SIM 强制护照实名。会场与饭店 Wi-Fi 不应视为可信，敏感通讯改用 Signal 并先确认可达。查证来源（2026-08）：[FOTN 2025 Vietnam](https://freedomhouse.org/country/vietnam/freedom-net/2025){target="_blank"}、[Vietnam orders Telegram ban](https://www.aljazeera.com/news/2025/5/24/vietnam-orders-ban-on-popular-messaging-app){target="_blank"} - Al Jazeera。最新观测：[OONI Explorer 越南](https://explorer.ooni.org/zh-CN/country/VN){target="_blank"}。

### 缅甸

与中国并列全球最差，FOTN 9 分。政变后封锁 Facebook、X、Instagram、WhatsApp，2024 年中封锁 Signal 与主要 VPN。2024 年起以中国 Geedge Networks 的 DPI 技术全国封锁 VPN，《Cybersecurity Law No. 1/2025》于 2025 年 7 月 30 日生效，未经授权提供 VPN 服务可判 1 至 6 个月徒刑或并科 100 万至 1,000 万缅元罚款，且具域外效力。这部法律的规范对象是未经授权的 VPN 服务提供者，定稿版把早期草案中针对个人使用的刑责拿掉了，条文在这点上并不含糊。剩下的不确定性在执法与解读，对旅客来说实际风险来自临检时手机里被搜出 VPN App 与社群内容。Tor 与 Psiphon 都被当作非法目标封锁，旅客不应假设预设 Tor 或一般桥接能连上。SIM 强制实名，军方已令电信商安装拦截设备，SIM 与国民登记卡连结，检查哨以监控系统核对身份。街头与检查哨会搜查手机里的 VPN 与社群内容。冲突区频繁全面断网，Access Now 记录缅甸 2024 年至少 85 次、2025 年至少 95 次断网，连两年居全球之冠。2025 年全球至少 313 次、遍及 52 国，是该组织有记录以来最高，缅甸一国就占了近三成。涉敏感主题者面临人身与数据双重风险。查证来源（2026-08）：[FOTN 2025 Myanmar](https://freedomhouse.org/country/myanmar/freedom-net/2025){target="_blank"}、[Myanmar cybersecurity law restricts VPNs](https://www.rfa.org/english/myanmar/2025/01/02/cybersecurity-law-vpn/){target="_blank"} - RFA、[internet shutdowns in 2025](https://www.accessnow.org/internet-shutdowns-2025/){target="_blank"} - Access Now。最新观测：[OONI Explorer 缅甸](https://explorer.ooni.org/zh-CN/country/MM){target="_blank"}。

## 研讨会场景的特别提醒

研讨会跟单纯出差不同，下面几项要另外准备。

- **报到实名与议程资料**。不少研讨会报名要绑实名与单位，到了现场领的识别证、签到系统都会留下出席记录。涉及敏感议题的活动，评估用哪个身份报名、要不要公开出席。
- **经香港转机也算通关**。区域研讨会常把香港排成转机点或主办地，2026 年 3 月起的解密义务涵盖只在香港机场转机并通关的旅客，带着整台工作机与未发表的会议数据过关，暴露程度高过在会场连 Wi-Fi。行程含香港时，把装置最小化排进准备清单。
- **会场与饭店 Wi-Fi 一律视为不可信**。公共网络有假热点与窃听风险，连接一律走 VPN 加密。在中国、越南、缅甸这类地方，更要假设场馆网络本身受监控。
- **公开发表的法律风险才是大宗**。多数地点连得上网，真正会出事的是你发表了什么、分享了什么。泰国的刑法第 112 条、新加坡的 POFMA 与诽谤法、马来西亚涉王室与宗教的内容、越南与中国的政治言论，都可能让外国与会者被追诉。发表涉当地政治、王室、宗教、种族的内容前先查清楚规范。
- **团队出差约好通讯管道**。主要与备用管道各一，遇到断网或单一工具被封时还能联络。缅甸这类随时可能断网的地方尤其要先约好。

## 回报过时信息

审查现况变动快，本表难免有落后现实的地方。如果你发现某地的封锁、VPN、SIM 或入境规定已经跟表上不同，欢迎到 [社群 Matrix 公开 room](../community/tools.md) 回报，或匿名寄到 [whisper@anoni.net](mailto:whisper@anoni.net)，我们会查证后更新。有当地第一手经验、愿意补充逐地注记的人，也欢迎一起参与。

## 相关阅读

- [一般人平常该做到什么](./everyday-baseline.md)：不分身分的共同基线，这一页假设你已经做到
- [出国前数字安全：用 AI 自助生成目的地概况](./travel-ai-briefing.md)：本表没收录的目的地，用这一页的 prompt 问你自己的 AI，自己生成对照。
- [威胁模型](../basics/threat-model.md)：先想清楚对手是谁、能取得什么，才知道每地要做到哪种程度。
- [Metadata 为什么重要](../basics/metadata.md)：连接与装置留下的记录，是出差时最容易忽略的暴露面。
- [LGBTQ+ 与性少数的匿名社交](./lgbtq.md)：其中的跨国旅行装置准备一节，可搭配本文的干净机建议。
- [社运行动者的数位准备](./activist.md)：一次性手机在动员场景的判断与事前准备步骤，跟本文的干净机是同一套装置思路。
- [怎么维持多个网络身分](../basics/multiple-identities.md)：换装置挡不掉账号层的关联，这页处理账号怎么分层。
- [Tor Browser 进阶设定](../tools/tor-browser-advanced.md) 与 [什么是 Tor](../tools/what-is-tor.md)：桥接与规避设定的操作细节。
