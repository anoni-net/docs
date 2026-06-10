---
title: 出国前数字安全：用 AI 自助生成目的地概况
description: 复制这些 prompt 去问你自己的 AI，出发前先摸清目的地的网络审查、法律、SIM 与紧急联络。适用任何国家，你的查询不会经过我们。
icon: material/shield-airplane-outline
---

# :material-shield-airplane-outline: 出国前数字安全：用 AI 自助生成目的地概况

出国前你会查签证、插头、换汇，但很少有人查「我要去的地方，网络被怎么管？我的工作在那里合不合法？出事找谁？」对记者、人权工作者、NGO 成员、研究者与社运参与者来说，这些才是真正影响安全的问题。

这一页**不是**一份各国资料表。那种预先整理好的版本请看 [出差与研讨会的数字准备（东亚与东南亚）](./asia-travel.md)。这一页适用**任何目的地**，我们给你一组可复制的提问（prompt），你把它贴进**自己的 AI**，由 AI 帮你生成一份行前的数字与人身安全概况。

!!! note "为什么不做成在线查询工具"
    我们刻意**不**做成一个「输入目的地就回答」的服务。因为对这群使用者来说，「我要去 X 国、我是记者、日期是 Y」这组查询本身就是敏感情资，放上任何服务器都会被记录、可能被调阅或泄漏。改成你复制文字、回去问**自己的** AI，**你的目的地与身分就不会经过我们**。代价是答案的质量取决于你用哪个 AI，所以请务必对照本页底部的「一手来源」自行核对。

!!! tip "贴进云端 AI 仍会泄漏给该供应商"
    就算不经过我们，把 query 贴进云端 AI（ChatGPT、Claude、Gemini 等）还是会让那家供应商看到。**目的地敏感**时，建议用本地、自架模型，或至少用下方「低资料版」开场 prompt，只填到国家层级、不要写自己的名字、组织、精确日期。

## 怎么用

1. **只填一次**：在「开场 prompt」里把 `{出发地}`、`{目的地}`、`{停留天数}` 换成你的信息（日期与身分可留白），贴给 AI。
2. **问题直接复制**：下面的调查项目不用再改字，逐项复制贴上即可，AI 会记得开场设定的目的地与出发地。
3. **自己验证**：拿 AI 的答案去对照本页底部的一手来源，**别盲信**。

!!! warning "AI 会编造电话、法条与资费"
    语言模型很会「讲得很有把握其实是错的」。把 AI 的回答当成「我接下来该查哪些东西」的起点，不要当成最终答案。尤其是紧急电话、法条编号、签证规则与资费，**一定**回到官方一手来源核对。

## 开场 prompt（先贴这个设定 AI 角色）

=== "完整版（自架、本地 AI）"

    ```text
    你是一位协助公民社会工作者（记者、人权工作者、NGO 成员、研究者、社运参与者）
    做出国前数字与人身安全评估的助理。

    我即将从 {出发地} 前往 {目的地}，停留约 {停留天数} 天。
    （可选）期间大约是 {日期区间}；我的工作性质是 {可留白}。

    接下来我会逐项贴上问题。问题里不会再重复目的地与出发地，一律以上面这段为准。
    每一项请：
    1. 尽量引用可查证的一手来源（OONI、Tor Metrics／Onionoo、Access Now、双方
       外交部、RSF、Freedom House、CIVICUS 等），附上链接与资料时间。
    2. 明确区分「有来源的事实」与「你的研判推测」。
    3. 不确定就说不确定——不要编造电话号码、法条编号或资费。
    4. 每一项结尾用一句话总结「所以我该做什么」。
    ```

=== "低资料版（云端 AI）"

    ```text
    你是一位协助公民社会工作者做出国前数字与人身安全评估的助理。
    我要前往 {目的地}（国家层级即可），停留时间以「短期停留」为准。
    我不会提供姓名、组织或精确日期。

    接下来我会逐项贴问题。问题里不会再重复目的地，一律以上面这段为准。
    每一项请引用可查证的一手来源并附链接、区分事实与研判、
    不确定就说不确定、结尾给一句行动建议。
    ```

## 调查项目（逐项复制）

这里每个区块是一题。一题一题来，复制一题、送出，看 AI 的回答并对照本页底部的来源，再贴下一题。开场 prompt 已经设定成逐题回答，分开问每题会答得更完整，也比较好逐项查证。整批一次贴上的话，AI 容易把所有问题合在一起给一个笼统的回答，反而难逐项查证。

### 一、数字环境：审查、Tor、VPN、设备搜查

```text
【数字环境 1／审查与封锁】请查 OONI Explorer 关于目的地最近 6–12 个月的
测量：Tor、Signal、WhatsApp、Telegram、主流 VPN（如 ProtonVPN）、独立新闻
与人权网站，是否出现 DNS／TCP／HTTP 封锁或 anomaly？列出 confirmed／anomaly
与发生时间，并附 OONI Explorer 链接。
```

```text
【数字环境 2／Tor 可达性】目的地目前有多少运作中的 Tor relay 与 bridge、
总带宽大约多少（参考 Tor Metrics／Onionoo）？据此判断 Tor 能否直接连线，
或需要 obfs4／Snowflake／WebTunnel 等 pluggable transport。给我落地后的
连线策略与备援顺序。
```

!!! tip "想让 AI 查到真实的 Tor 节点数字，先接 onionoo MCP"
    这题问的 relay、bridge 数量与带宽，AI 若没有外部资料来源，很可能凭记忆编一个给你（就是这页开头警告的那种错）。社群自架的 [onionoo MCP](../community/onionoo-mcp.md) 把 Tor Project 的 Onionoo 公开资料接成一个网址，在 claude.ai 这类 AI 助理贴上去，AI 就能查到查询当下、可引用的真实数字。

```text
【数字环境 3／VPN 合法性与可用性】在目的地使用 VPN 是否合法？WireGuard、
OpenVPN 等协议是否被封锁或限速？是否只允许政府核可的 VPN？出发前该先装好
哪些、并准备哪些备援？
```

```text
【数字环境 4／边境与设备搜查】入境目的地时，海关是否可能搜查手机、笔电，
或要求登入社交账号？当地是否有强制交出密码或加密密钥的法律？持有或使用
加密通讯 app 是否违法？是否有记者或人权工作者被拒入境、被拘留的纪录？
```

```text
【数字环境 5／网络关闭风险】目的地过去是否发生过 internet shutdown 或
带宽限速（参考 Access Now #KeepItOn）？若我停留期间与选举、抗议或敏感
纪念日重叠，封锁升高的风险如何？我该预先准备哪些离线备援？
```

### 二、法律与政治风险

```text
【法律与政治 6／旅游警示】我出发地的外交部目前对目的地发布的旅游警示灯号
是什么？对照美国国务院、英国 FCDO 的 advisory 现况。近期是否有政治动荡、
抗议或冲突？附官方链接与更新日期。
```

```text
【法律与政治 7／对我角色的法律风险】针对记者／NGO／行动者，目的地的法律
环境如何？请参考 RSF 新闻自由指数、Freedom House「Freedom on the Net」、
CIVICUS Monitor 评级。是否有 foreign-agent／NGO 注册法、诽谤或冒犯王室／
亵渎宗教罪、集会限制？哪些我习以为常的活动在当地可能触法？
```

```text
【法律与政治 8／入境与身分】持我出发地的护照入境目的地，签证或电子旅行
许可（ETA／ETIAS 等）要求为何？以我的停留天数计算，是否在免签额度内？
出发地与目的地的外交关系是否会影响我能得到的领务协助？
```

### 三、连线与通讯（SIM、eSIM）

```text
【连线与通讯 9／SIM 与 eSIM】在目的地购买实体 SIM 是否需要实名登记
（护照／生物辨识）？依我的停留天数与出发地，建议用区域型或单国 eSIM
（如 Airalo）还是原号漫游？请列几个方案、大概价格与接取的当地电信，并
提醒：语音尽量走 Signal／WhatsApp 等 VoIP，少用传统漫游通话。
```

### 四、紧急联络与支持网络

```text
【紧急联络 10／领务代表处】我出发地在目的地的代表处／大使馆的「急难救助」
24 小时电话、一般联络电话、地址与上班时间为何？若目的地没有设馆，最近的
兼辖馆处是哪一个？请整理成可抄写的格式。
```

```text
【紧急联络 11／数字安全与在地支持】请列出 Access Now Digital Security Helpline
的联络方式（24/7、多语、help@accessnow.org，会在两小时内回复）。目的地有
哪些在地的数字人权、记者保护或法律支持组织？设备被扣或账号被攻击时该找谁？
```

```text
【紧急联络 12／当地紧急号码与法律援助】目的地的报案、救护、消防号码各是
什么？若被拦查或拘留，有哪些当地的法律援助或律师热线可即时联络？
```

### 五、实体与监控环境（选用）

```text
【实体环境 13／监控与治安（选用）】目的地的公共监控程度如何（CCTV、
人脸辨识）？警方对集会、街头拍摄的态度为何？哪些区域或行为对我这类工作者
风险较高、应该避免？
```

## 把结果整理成一张随身紧急卡

跑完上面几项后，把第四节「紧急联络与支持网络」问到的关键联络抄成一张卡片，印出来过塑、钱包与行李各放一张，并同步存进手机离线笔记与（若你用）Tails。下面是空白模板：

```text
【数字安全事件】Access Now Digital Security Helpline（24/7・多语）
  help@accessnow.org

【领务｜{目的地}】{出发地} 驻 {目的地} 代表处
  急难 24h：________________（限车祸／抢劫／生命安危）
  一般：    ________________（上班时间 ______）
  地址：    ________________

【{出发地} 外交部 24h 紧急联络中心】
  ________________

【当地 报案／救护／消防】________ ／ ________ ／ ________

【在地数字／法律支持】________________________
```

## 一手来源（请自行核对 AI 的答案）

- **OONI Explorer**（各国网络审查、封锁测量）：<https://explorer.ooni.org/>{target="_blank"}
- **Tor Metrics**（Tor relay、bridge、各国连线数）：<https://metrics.torproject.org/>{target="_blank"}
- **Access Now Digital Security Helpline**（24/7 数字安全求助）：<https://www.accessnow.org/help/>{target="_blank"}
- **Access Now #KeepItOn**（网络关闭追踪）：<https://www.accessnow.org/keepiton/>{target="_blank"}
- **你的国家外交部**：旅游警示与驻外馆处急难电话（可参考所在地外交部官网）
- **RSF 新闻自由指数**：<https://rsf.org/en/index>{target="_blank"}
- **Freedom House「Freedom on the Net」**：<https://freedomhouse.org/report/freedom-net>{target="_blank"}
- **CIVICUS Monitor**（公民社会空间评级）：<https://monitor.civicus.org/>{target="_blank"}
- **EFF Surveillance Self-Defense**：<https://ssd.eff.org/>{target="_blank"}
- **Front Line Defenders**：<https://www.frontlinedefenders.org/>{target="_blank"}

## 延伸阅读

- [出差与研讨会的数字准备（东亚与东南亚）](./asia-travel.md)：14 地已预填好审查、VPN、SIM 与入境查机，只去东亚东南亚、或赶时间不想自己跑 prompt 时，直接查那篇更快。
- [威胁模型](../basics/threat-model.md)：先想清楚对手是谁、能拿到什么。
- [什么是 OONI](../tools/what-is-ooni.md)、[什么是 Tor](../tools/what-is-tor.md)、[Snowflake](../tools/tor-snowflake.md)、[通讯软件比较](../tools/messaging-comparison.md)
- [onionoo MCP：Tor 中继节点查询服务](../community/onionoo-mcp.md)：把上面【数字环境 2】那题交给 AI 自己查。接上这个网址，AI 助理就能用中文问出某地有几个 Tor 节点、带宽多少、落在哪些电信网络，数字来自 Tor Project 官方 Onionoo。
- [这页背后的想法（blog）](../blog/posts/travel-ai-briefing.md)：为什么把该问的问题打包成 prompt，带回去问你自己信任的 AI。

---

这一页给的是「该问的问题」，不是现成答案。若你有特定目的地的实地经验想分享，欢迎到 [Matrix 公开 room](../community/tools.md) 讨论，或匿名寄到 [whisper@anoni.net](mailto:whisper@anoni.net)。
