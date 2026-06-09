---
title: 出差与研讨会的数位准备（东亚与东南亚）
description: 整理东亚与东南亚十四个常见出差与研讨会地点的网络审查、VPN 与 Tor 可达性、SIM 实名与入境查机现况，帮华语读者在出发前安排对应的数位准备。
icon: material/bag-suitcase-outline
---

# :material-bag-suitcase-outline: 出差与研讨会的数位准备（东亚与东南亚）

带着平常的手机与笔电出国，多数时候不会有事。问题出在你去的地方，网络环境可能跟你熟悉的差很多。同一支手机、同一套工具，换个地方就可能用不了：有的地方 Signal 要挂 VPN 才连得上，有的地方在社交平台上按个赞，就可能踩到当地刑法。出差或参加研讨会时，先知道目的地的网络审查与监控到什么程度，才能在出发前做对准备，而不是落地才发现工具用不了、或不小心让自己暴露在法律风险里。

这篇整理东亚与东南亚十四个常见地点的现况，做成一张对照表，再给出依风险分层的准备清单。无论你从中国大陆、港澳、新马、台湾或其他华语环境出发，都可以拿这张表当行前依据。

!!! warning "查证日与时效"
    审查现况变动很快，VPN 能不能用、哪个服务被封，可能几个月就翻一次。本表整体查证日为 **2026 年 6 月**，每地的判断以该段时间的公开来源为准。出发前请以 [OONI Explorer](https://explorer.ooni.org/){target="_blank"} 查目的地的最新观测、以各地官方公告查 SIM 与入境规定，不要把静态表格当成当下的保证。

## 如何读这张表

- **审查强度**用 Freedom House 的 [Freedom on the Net](https://freedomhouse.org/report/freedom-net){target="_blank"}（FOTN，年度网络自由评比，满分 100，分数越高越自由）2025 年版的分数与分级。香港、澳门不在 FOTN 单独评分范围，改用质性描述标注。表格以区域内最开放的台湾（FOTN 亚洲第 1）为参照基准，方便对照其他地点的落差。
- **分数高不代表没有风险**。香港、澳门主流服务都连得上，表面像自由网，真正的代价在实名登记、浏览记录长期留存与法律追究。读的时候要把「能不能连上」跟「连上之后会不会被究责」分开看。
- **VPN 与 Tor 两栏**呈现工具的技术可达性与合法性。即使工具能用，发表特定内容仍可能触法，这部分看逐地注记与最后的研讨会提醒。
- 先看下一节的「出发前通用准备」，每个地点都适用，再依目的地落在哪个风险层补上加码准备。

## 东亚与东南亚网络监控对照表

| 地区 | 审查强度（FOTN 2025） | VPN | Tor | SIM 实名 | 入境装置检查 |
|---|---|---|---|---|---|
| 台湾（参照） | 79（自由），亚洲第 1 | 合法 | 可直连 | 护照、第二证件 | 低 |
| 日本 | 78（自由） | 合法 | 可直连 | 数据 eSIM 2026/4 起须验护照 | 低 |
| 南韩 | 65（部分自由） | 合法 | 可直连 | 护照实名 | 低 |
| 菲律宾 | 61（部分自由） | 合法 | 可直连 | 护照实名，旅客卡 30 天 | 低 |
| 马来西亚 | 60（部分自由） | 合法 | 可直连 | 护照正本、住宿地址 | 中 |
| 新加坡 | 53（部分自由） | 合法 | 可直连 | 护照实名，30 天有效 | 中（搜查授权强） |
| 印尼 | 48（部分自由） | 合法 | 可直连 | 护照实名、IMEI 登录 | 中 |
| 香港 | 未单独评分（FiW 41，部分自由） | 合法 | 一般可直连 | 护照实名（2023 起） | 中（升高中） |
| 澳门 | 未涵盖 | 合法 | 一般可直连 | 护照实名、ISP 留存一年 | 中（资料少） |
| 柬埔寨 | 42（部分自由） | 合法 | 一般可直连 | 多需证件，无强制法 | 低 |
| 泰国 | 39（不自由） | 合法 | 建议备桥接 | 护照、脸部辨识，60 天 | 中高 |
| 越南 | 22（不自由） | 合法（受网安法规范） | 建议备桥接 | 护照实名 | 中（资料少） |
| 中国大陆 | 9（不自由） | 灰色，须强混淆 | 重度封锁 | 护照、人脸 | 高 |
| 缅甸 | 9（不自由） | 入罪（2025 网安法） | 重度封锁 | 护照或 NRC、拦截设备 | 高 |

香港、澳门未列入 FOTN 单独评分，香港的 FiW（Freedom in the World）2026 年为 41 分（部分自由）仅供质性对照。SIM 与入境规定为 2026 年 6 月查证，细节以出发前官方公告为准。

## 出发前的通用准备（每个地点都适用）

这几项不分地点都建议做，风险越高的目的地越要做满。

- **带最简化的装置**。出差用的手机、笔电里，跟这趟无关的数据越少越好。高风险地建议准备一支只装必要 App 的干净机，敏感数据留在云端或家里，需要时再透过加密连接取用。
- **出发前装好并测试规避工具**。VPN、Tor Browser 与桥接都要在家里先装好、连一次确认可用。到了审查严的地方，App 商店与工具官网本身就连不上，落地才想下载通常来不及。Tor 的桥接设定见 [Tor Snowflake 桥接点](../tools/tor-snowflake.md) 与 [Tor Browser 进阶设定](../tools/tor-browser-advanced.md)，自架桥接见 [如何架设 Tor WebTunnel](../community/setup-tor-webtunnel.md)。
- **准备两种以上的连接方式**。单一 VPN 协议常被封，多带一两款备援。中国这类地方标准 WireGuard、OpenVPN 几秒内被封，要选有混淆（obfuscation，把 VPN 流量伪装成一般 HTTPS）功能的方案。具备这类混淆的服务，例如 Proton VPN（Stealth 协议）、Mullvad（混淆、Shadowsocks 桥接）、ExpressVPN（Lightway 自动混淆）、NordVPN（NordWhisper）、Surfshark（Camouflage Mode）、Astrill（StealthVPN）。哪些「现在能用」会随封锁更新而变，出发前查当地最新回报并先测试一次。
- **敏感通讯改用端对端加密工具**。Signal 是常见选择，但部分地区会封锁，出发前确认目的地能不能连，连不上时改走 Tor 或 VPN。团队出差可事先约好主要与备用管道。
- **账号分流**。研讨会社交、商务联络与个人账号分开，减少一个被盯上时牵连到其他身份。
- **SIM 用漫游或纯数据 eSIM**。三种方式都会留下某种身份记录，差别在这份记录落在谁手上、当地政府能不能直接把号码对应到你本人：
    - **落地办实名卡**：护照（部分地区还加人脸）与这个本地号码，直接登进当地电信商与政府的数据库，当地执法即查即得，且常长期留存。
    - **本国号码漫游**：登记你身份的是家乡的电信商，当地只看到一个外国漫游号码的连接与位置，要对应到本人通常得走跨境调取。
    - **纯数据 eSIM（无本地号码）**：连本地号码这层都省掉，身份多半只留在 eSIM 供应商与你的付款记录里。

    对「目的地监控」这个威胁来说，漫游与 eSIM 把对应留在境外，比较难被当场对应到本人。需要本地号码收验证码时，再评估是否落地办卡。要注意一个例外，日本 2026 年 4 月起连纯数据 eSIM 都要验护照，这个优势在部分地区正在缩小。
- **开启全盘加密、设好开机密码**。入境查机风险高的地方，关机状态加上强密码，比解锁状态安全。
- **留好离线备份与紧急联络方式**。遇到断网或装置被扣，至少还能联络上同事或家人。

## 依风险分层的加码准备

### 低风险：台湾（参照）、日本、南韩

台湾、日本、南韩接近完全开放的网络环境，用平常的工具即可。主要记得办 SIM 要带护照，日本 2026 年 4 月起连纯数据 eSIM 都要验护照。南韩有内容过滤与较强的通讯拦截法制，处理敏感数据时仍建议自备 VPN。

### 中风险：菲律宾、马来西亚、新加坡、印尼、香港、澳门

主流服务大致可用，VPN 与 Tor 可连，但各有针对性封锁与较强的法律工具。这里真正要顾的是你发表了什么、以及实名登记留下的记录，连接本身通常不成问题。落地办卡带齐证件，公共与会场 WiFi 一律走 VPN，对外发表前先了解当地的诽谤与内容法规。

### 高风险：泰国、越南、柬埔寨、中国大陆

系统性封锁规模大，法律对线上言论的追诉力道强。出发前务必装好混淆型 VPN 与 Tor 桥接并测试，带干净机，敏感工作不要在当地网络上做。中国要假设所有连接都被看、境外服务都连不到。泰国、越南建议预设 Tor 桥接，因为近年封锁规模大增、直连可能受阻。

### 极高风险：缅甸

数位环境是亚洲最危险的之一。2025 年网络安全法把未经授权的 VPN 服务入罪化，街头与检查哨会临检手机、搜查 VPN App 与社群贴文，冲突区随时可能全面断网。携带最简化的干净装置、避免落地办卡绑定身份、全程假设受监控。涉及敏感主题者面临人身与数据双重风险，行前应做完整的威胁评估，必要时咨询有当地经验的组织。

## 逐地注记

每地列出主要被封服务、SIM 与入境重点，以及该段时间的查证来源。

### 中国大陆

防火长城（Great Firewall）长期完整封锁 Google、YouTube、Facebook、Instagram、WhatsApp、Signal、Telegram、X 与全语系 Wikipedia，外媒多数被封。手法含 DNS 污染、SNI 过滤与深度封包检测（DPI，逐笔分析连接判断是否放行的技术）。个人翻墙属违法灰色地带，2025 年底国安部公开警告会究责。VPN 要选有强混淆的方案、入境前装好至少两款。Tor 直连无法使用，obfs4、meek、Snowflake 几乎都失效，WebTunnel 偶尔连得上但常数分钟内被封，不应视为可靠管道。SIM 自 2019 年底起强制实名加人脸，外籍旅客同样适用。2024 年 7 月起新规授权国安人员检查个人电子装置，深圳、上海有海关抽查手机与笔电的报告。查证来源（2026-06）：[FOTN 2025 China](https://freedomhouse.org/country/china/freedom-net/2025){target="_blank"}、[Tor 对中国的连接指引](https://support.torproject.org/censorship/connecting-from-china/){target="_blank"}。

### 香港

不适用防火长城，Google、社群与通讯服务一般正常可达。但《国安法》下出现选择性封锁，2021 年起有 ISP 依法封锁 HKChronicles 等网站，2024 年通过的《维护国家安全条例》（基本法 23 条立法）扩大调查与下架权限。SIM 自 2023 年 2 月起全面实名，旅客可用护照登记。2024 年已有外国企业赴港改用抛弃式（burner）手机的报导。主流服务连得上不等于安全，敏感讨论建议用端对端加密工具、避免存在本地装置。查证来源（2026-06）：[Internet censorship in Hong Kong](https://hongkongfp.com/2024/10/12/internet-censorship-in-hong-kong/){target="_blank"} - HKFP、[FiW 2026 Hong Kong](https://freedomhouse.org/country/hong-kong/freedom-world/2026){target="_blank"}。

### 澳门

无防火长城，Google、Facebook、YouTube、X、WhatsApp、Telegram、LINE 通常正常运作。代价在《网络安全法》要求电信实名，且 ISP 须保留用户浏览记录至少一年，等于连接行为被长期记录。SIM 自 2019 年底起须登记，旅客以护照办理。建议用 VPN 盖住浏览内容、SIM 用漫游或纯数据 eSIM。澳门的 Tor 可达性与入境查机公开资料较少，属证据不足，敏感任务仍采干净装置原则。查证来源（2026-06）：[FOTN 2025 报告](https://freedomhouse.org/report/freedom-net/2025/uncertain-future-global-internet){target="_blank"}（未含澳门，说明覆盖范围）。

### 日本

无系统性封锁，一般旅客连接完全开放。唯一的灰色地带是盗版网站的著作权执法走法院途径，不影响日常上网。VPN 完全合法，Tor 直连可用，日本本身就是 Tor 中继与出口节点的重要所在地。SIM 方面，2026 年 4 月起依总务省省令，连纯数据 eSIM 业者结帐时都要上传护照或居留证照片。语音号码一向要验证身份、短期旅客多半办不到。建议旅客选数据型 eSIM，本国号码保留收银行验证码。查证来源（2026-06）：[FOTN 2025 Japan](https://freedomhouse.org/country/japan/freedom-net/2025){target="_blank"}。

### 南韩

主流外站不封锁，旅客一般浏览不受影响。但有系统性的内容过滤，KCSC 对色情、赌博、北韩宣传等类别封锁，2023 年封锁约 22 万个网站或网页，技术上采 SNI 过滤（监看 HTTPS 连接中未加密的域名字段来比对黑名单），等于 ISP 拿得到你造访的域名清单。VPN 合法，常被用来绕过过滤。Tor 直连一般可用。SIM 须出示护照实名，观光 eSIM 较宽松但仍绑护照。南韩通讯拦截法制偏强，《通讯秘密保护法》授权即时拦截，处理敏感数据者宜纳入威胁模型。查证来源（2026-06）：[FOTN 2025 South Korea](https://freedomhouse.org/country/south-korea/freedom-net/2025){target="_blank"}、[South Korea SNI filtering](https://www.bleepingcomputer.com/news/security/south-korea-is-censoring-the-internet-by-snooping-on-sni-traffic/){target="_blank"} - BleepingComputer。

### 台湾（参照）

区域内最开放的网络环境，FOTN 2025 亚洲第 1、全球第 7，主流服务皆不封锁，作为本表的最开放参照点。Freedom House 点出的疑虑在制度层面：TWNIC 透明度报告显示 2025 上半年逾 5 万个网站被列入封锁（多走 DNS RPZ 框架、且大多未经司法审查），属治理透明度问题，非旅客日常会遇到的广泛封锁。VPN 合法、Tor 直连可用。SIM 预付卡须出示护照（含入境章），通常还要第二证件，机场购买多半只需护照。查证来源（2026-06）：[FOTN 2025 Taiwan](https://freedomhouse.org/country/taiwan/freedom-net/2025){target="_blank"}。

### 菲律宾

东南亚中相对开放的一个，无系统性封锁。最受关注的事件是 NTC 在 2022 年依《反恐法》要求封锁含独立媒体 Bulatlat、Pinoy Weekly 在内的 27 个网站，该封锁令已于 2025 年 11 月经法院判违宪撤销。一度传出要封 Telegram，2026 年 2 月政府与平台达成内容防制协议后不予封锁。VPN 与 Tor 可正常使用。SIM 依 2022 年《SIM Registration Act》（RA 11934）强制实名，旅客以护照加当地地址登记，卡片 30 天有效。主要法律风险是网络诽谤（cyberlibel），公开发表留意用词。查证来源（2026-06）：[FOTN 2025 Philippines](https://freedomhouse.org/country/philippines/freedom-net/2025){target="_blank"}、[Court voids NTC blocking order](https://www.bulatlat.com/2025/11/25/bulatlat-wins-censorship-case-court-voids-memo-blocking-27-websites/){target="_blank"} - Bulatlat。

### 马来西亚

有封锁，但以线上赌博、色情、侵权为大宗，2018 至 2024 年累计封逾 24,000 个网站。政治动机封锁过 Sarawak Report、Medium，两者已于 2025 年 3 月前解封。2024 年底两项新法扩权：《通讯与多媒体法》修正案与《线上安全法》，赋予 MCMC 更广的内容移除与监控权。2025 年对 Telegram 取得针对特定公开频道的法院禁制令。WhatsApp、Telegram、Signal 一般可用，VPN 与 Tor 可用。SIM 自 2018 年起强制实名，旅客须出示护照正本（不接受影本）加在马住宿地址，2025 年底起新卡须搭配 MyDigital ID。真正的红线是涉及王室、煽动、宗教与种族的内容。查证来源（2026-06）：[FOTN 2025 Malaysia](https://freedomhouse.org/country/malaysia/freedom-net/2025){target="_blank"}、[MCMC SIM 登记 FAQ](https://www.mcmc.gov.my/en/faqs/prepaid-registration/what-type-of-documents-can-be-used-for-the-registr){target="_blank"}。

### 新加坡

封锁范围窄但法律工具强。2024 年 10 月封锁 10 个被指可用于对新加坡发动敌意信息行动的网站。新闻网站受 IMDA 牌照与 POFMA（防止网络假信息与操纵法）约束，政府可对被认定不实的陈述发更正指令。VPN 与 Tor 合法可用，主流服务日常可达。SIM 须以护照登记，以护照登记的非居民卡自 2024 年 7 月起有效期仅 30 天。2024 年《刑事诉讼修正法》扩大警方与移民关卡局的搜查权，合法逮捕时可搜查随身手机毋须另行令状，实务上一般旅客少见随机解锁，但法律门槛低。最大风险在你发表了什么（POFMA、诽谤、FICA）。查证来源（2026-06）：[FOTN 2025 Singapore](https://freedomhouse.org/country/singapore/freedom-net/2025){target="_blank"}、[Criminal Procedure Amendments Act 2024](https://sso.agc.gov.sg/Acts-Supp/5-2024/Published/20240318?DocDate=20240318){target="_blank"}。

### 印尼

中度且大致可预测的审查，封锁集中在色情与赌博，透过 Trust Positif 黑名单以 DNS 窜改执行。另有 PSE 平台注册制，未注册就封锁：2022 年曾封 PayPal、Steam、Epic Games 等，2024 年 7 月封 DuckDuckGo。WhatsApp、Tor 在测试期间多为可达，VPN 普及合法。SIM 外国旅客以护照办理，另自 2020 年起手机须登录 IMEI，用本地 SIM 时需在入境向海关登录装置。整体对一般商务旅客风险可控，行前确认常用服务是否在封锁名单上。查证来源（2026-06）：[FOTN 2025 Indonesia](https://freedomhouse.org/country/indonesia/freedom-net/2025){target="_blank"}、[iMAP Indonesia 2024](https://imap.sinarproject.org/reports/2024/imap-indonesia-2024-internet-censorship-report){target="_blank"} - Sinar Project。

### 柬埔寨

采选择性 DNS 封锁独立媒体，非全国性大断网。Voice of Democracy 于 2023 年被关闭，2023 年大选前封锁 Cambodia Daily、Radio Free Asia 等。OONI 量测显示被封站多为新闻与人权类，由多家 ISP 以 DNS 执行。VPN 与 Tor 合法可用，是绕过被封新闻站的常见手段，边境一般不查手机。SIM 目前无强制实名法规，但电信商办卡多会要求出示证件。需留意 National Internet Gateway（国家网关）计画在 2025 年复活、规划 2026 年起建设单一对外网关，一旦上线会大幅增加集中式审查与监控能力。查证来源（2026-06）：[FOTN 2025 Cambodia](https://freedomhouse.org/country/cambodia/freedom-net/2025){target="_blank"}、[Cambodia resurrects internet gateway plan](https://asia.nikkei.com/business/telecommunication/cambodia-resurrects-plan-for-controversial-internet-gateway){target="_blank"} - Nikkei Asia。

### 泰国

东南亚中最受限，FOTN 唯一列为不自由的一个。法源是《电脑犯罪法》与刑法第 112 条（冒犯王室，lèse-majesté，刑期 3 至 15 年）。法院下令、数位经济与社会部执行 URL 封锁，官方称 2025 年底到 2026 年初封锁逾 22 万个 URL（多数为线上赌博）。LINE 为主流，WhatsApp、Telegram、Signal 目前可用。VPN 合法普遍，但近年封锁规模大增，建议旅客预设 Tor 桥接以防直连受阻。SIM 自 2025 年 8 月起导入脸部活体侦测，所有人办卡须本人到场、出示护照正本，旅客卡 60 天有效。第 112 条与电脑犯罪法适用境内任何人、不分国籍，外国人曾因相关贴文被捕、没收护照、驱逐并终身禁入，按赞与转发都可能担责。绝不公开评论王室。查证来源（2026-06）：[FOTN 2025 Thailand](https://freedomhouse.org/country/thailand/freedom-net/2025){target="_blank"}、[Thailand biometric SIM registration](https://www.biometricupdate.com/202508/thailand-mandates-biometric-liveness-detection-for-sim-registration){target="_blank"} - Biometric Update。

### 越南

高审查环境，FOTN 22 分。2025 年 5 月电信局下令 ISP 封锁 Telegram，用户未挂 VPN 即难以连上。Decree 53/2022 要求外国业者数据在地化、留存数据至少 24 个月。Decree 147/2024 要求大型平台以越南手机号或身份证实名、24 小时内移除违法内容，Facebook 受影响最大。另有数万人规模的「47 部队」网军以检举与带风向压制异议。VPN 使用合法但受网安法规范，建议行前装好设定。Tor 直连大致可用，但审查机制活跃，建议备妥 WebTunnel 或 Snowflake 桥接。SIM 强制护照实名。会场与饭店 WiFi 不应视为可信，敏感通讯改用 Signal 并先确认可达。查证来源（2026-06）：[FOTN 2025 Vietnam](https://freedomhouse.org/country/vietnam/freedom-net/2025){target="_blank"}、[Vietnam orders Telegram ban](https://www.aljazeera.com/news/2025/5/24/vietnam-orders-ban-on-popular-messaging-app){target="_blank"} - Al Jazeera。

### 缅甸

与中国并列全球最差，FOTN 9 分。政变后封锁 Facebook、X、Instagram、WhatsApp，2024 年中封锁 Signal 与主要 VPN。2024 年起以中国 Geedge Networks 的 DPI 技术全国封锁 VPN，《Cybersecurity Law No. 1/2025》于 2025 年 7 月 30 日生效，未经授权提供 VPN 服务最高可判 6 个月徒刑与高额罚款，且具域外效力。Tor 与 Psiphon 都被当作非法目标封锁，旅客不应假设预设 Tor 或一般桥接能连上。SIM 强制实名，军方已令电信商安装拦截设备，SIM 与国民登记卡连结，检查哨以监控系统核对身份。街头与检查哨会搜查手机里的 VPN 与社群内容。冲突区频繁全面断网，Access Now 记录缅甸 2024 年至少 85 次、2025 年至少 95 次断网，连两年居全球之冠。涉敏感主题者面临人身与数据双重风险。查证来源（2026-06）：[FOTN 2025 Myanmar](https://freedomhouse.org/country/myanmar/freedom-net/2025){target="_blank"}、[Myanmar cybersecurity law restricts VPNs](https://www.rfa.org/english/myanmar/2025/01/02/cybersecurity-law-vpn/){target="_blank"} - RFA、[internet shutdowns in 2025](https://www.accessnow.org/internet-shutdowns-2025/){target="_blank"} - Access Now。

## 研讨会场景的特别提醒

研讨会跟单纯出差不同，下面几项要另外准备。

- **报到实名与议程资料**。不少研讨会报名要绑实名与单位，到了现场领的识别证、签到系统都会留下出席记录。涉及敏感议题的活动，评估用哪个身份报名、要不要公开出席。
- **会场与饭店 WiFi 一律视为不可信**。公共网络有假热点与窃听风险，连接一律走 VPN 加密。在中国、越南、缅甸这类地方，更要假设场馆网络本身受监控。
- **公开发表的法律风险才是大宗**。多数地点连得上网，真正会出事的是你发表了什么、分享了什么。泰国的刑法第 112 条、新加坡的 POFMA 与诽谤法、马来西亚涉王室与宗教的内容、越南与中国的政治言论，都可能让外国与会者被追诉。发表涉当地政治、王室、宗教、种族的内容前先查清楚规范。
- **团队出差约好通讯管道**。主要与备用管道各一，遇到断网或单一工具被封时还能联络。缅甸这类随时可能断网的地方尤其要先约好。

## 回报过时信息

审查现况变动快，本表难免有落后现实的地方。如果你发现某地的封锁、VPN、SIM 或入境规定已经跟表上不同，欢迎到 [社群 Matrix 公开 room](../community/tools.md) 回报，或匿名寄到 [whisper@anoni.net](mailto:whisper@anoni.net)，我们会查证后更新。有当地第一手经验、愿意补充逐地注记的人，也欢迎一起参与。

## 相关阅读

- [出国前数字安全：用 AI 自助生成目的地 briefing](./travel-ai-briefing.md)：本表没收录的目的地，用这一页的 prompt 问你自己的 AI，自己生成对照。
- [威胁模型](../basics/threat-model.md)：先想清楚对手是谁、能取得什么，才知道每地要做到哪种程度。
- [Metadata 为什么重要](../basics/metadata.md)：连接与装置留下的记录，是出差时最容易忽略的暴露面。
- [LGBTQ+ 与性少数的匿名社交](./lgbtq.md)：其中的跨国旅行装置准备一节，可搭配本文的干净机建议。
- [Tor Browser 进阶设定](../tools/tor-browser-advanced.md) 与 [什么是 Tor](../tools/what-is-tor.md)：桥接与规避设定的操作细节。
