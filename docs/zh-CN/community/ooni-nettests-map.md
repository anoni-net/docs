---
title: OONI 测项速查表
description: ooni/spec 收录的 41 个网络测项各自测什么、哪些还在产出数据、台湾实际测到哪几个。附上游规格链接，供挑选测项或解读数据时对照。
icon: material/table-search
---

# :material-table-search: OONI 测项速查表

[ooni/spec](https://github.com/ooni/spec/tree/master/nettests){target="_blank"} 的 `nettests` 目录收录 41 份测项规格，其中有相当比例已停止使用。挑选测项或解读既有数据时，先确认哪些仍在产出数据，效率高于逐份阅读规格。

本页将 41 份规格整理成一张对照表，标注上游规格的状态、实际是否仍有公开数据，以及台湾观测到的项目。

!!! info "状态栏位的定义"

    **spec 状态**取自各份规格开头的 `_status_` 标记，分为 `current`、`experimental`、`obsolete` 三种，反映上游对该测项的定位。

    **数据流通**是实测结果，以撰稿当日（2026-08-04）为快照，透过 [OONI API](https://api.ooni.io/api/v1/measurements){target="_blank"} 盘点各测项最近的公开测量。

    **台湾**栏位来自 S3 公开数据集，抽查 2026-08-03 五个时段台湾底下出现过的测项目录。

## 状态标记不等于实际有数据

规格标记与实际数据不一致的情况确实存在，落差有两个方向：

- **标为 `current` 却查不到数据**：`tlsmiddlebox`、`portfiltering`、`captiveportal` 三个。
- **标为 `experimental` 却每日都有数据**：`dnscheck`、`echcheck`、`openvpn`、`stunreachability`、`vanilla_tor` 等，数据量与部分 `current` 测项相当。

`experimental` 仅反映规格本身的成熟度，与数据量多寡没有必然关系。判断测项是否适合用于分析，直接查询 API 是否有数据，较状态标记可靠。

## 依用途分群

以下依观测目的分群，细节再对照后方表格：

- **网站封锁检测**：`web_connectivity`
- **中间设备与干扰手法**：`http_header_field_manipulation`、`http_invalid_request_line`、`sni_blocking`、`echcheck`
- **通讯软件可达性**：`telegram`、`whatsapp`、`signal`、`facebook_messenger`
- **规避工具可用性**：`tor`、`vanilla_tor`、`torsf`、`psiphon`、`riseupvpn`、`openvpn`
- **DNS 行为**：`dnscheck`、`dnsping`
- **连线效能**：`ndt`、`dash`、`stunreachability`、`quicping`

## 仍在产出数据的测项

以下测项在撰稿当日皆查得到公开测量，也是解读 OONI 数据时最常遇到的测项。

| 测项 | 量测内容 | spec 状态 | 台湾 |
|---|---|---|---|
| [`web_connectivity`](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"} | 网站可达性与封锁判定，数据量最大的测项 | current | 有 |
| [`tor`](https://github.com/ooni/spec/blob/master/nettests/ts-023-tor.md){target="_blank"} | Tor 目录权威节点与桥接的可达性 | current | 有 |
| [`vanilla_tor`](https://github.com/ooni/spec/blob/master/nettests/ts-016-vanilla-tor.md){target="_blank"} | 未经伪装的 Tor 能否顺利启动连线 | experimental | 有 |
| [`torsf`](https://github.com/ooni/spec/blob/master/nettests/ts-030-torsf.md){target="_blank"} | 透过 Snowflake 传输层的 Tor 连线 | experimental | 无 |
| [`telegram`](https://github.com/ooni/spec/blob/master/nettests/ts-020-telegram.md){target="_blank"} | Telegram 网页版与数据中心端点可达性 | current | 有 |
| [`whatsapp`](https://github.com/ooni/spec/blob/master/nettests/ts-018-whatsapp.md){target="_blank"} | WhatsApp 端点与注册服务可达性 | current | 有 |
| [`signal`](https://github.com/ooni/spec/blob/master/nettests/ts-029-signal.md){target="_blank"} | Signal 服务端点可达性 | current | 有 |
| [`facebook_messenger`](https://github.com/ooni/spec/blob/master/nettests/ts-019-facebook-messenger.md){target="_blank"} | Facebook Messenger 端点可达性 | current | 有 |
| [`dnscheck`](https://github.com/ooni/spec/blob/master/nettests/ts-028-dnscheck.md){target="_blank"} | 指定 DNS 解析器的行为，涵盖加密查询（DoH、DoT） | experimental | 有 |
| [`dnsping`](https://github.com/ooni/spec/blob/master/nettests/ts-035-dnsping.md){target="_blank"} | DNS 查询的延迟与回应行为 | experimental | 无 |
| [`echcheck`](https://github.com/ooni/spec/blob/master/nettests/ts-039-echcheck.md){target="_blank"} | 加密客户端问候（ECH）的支持与干扰状况 | experimental | 有 |
| [`http_header_field_manipulation`](https://github.com/ooni/spec/blob/master/nettests/ts-006-header-field-manipulation.md){target="_blank"} | 中间设备是否窜改 HTTP 标头 | current | 有 |
| [`http_invalid_request_line`](https://github.com/ooni/spec/blob/master/nettests/ts-007-http-invalid-request-line.md){target="_blank"} | 中间设备对异常请求行的反应，用于检测透明代理 | current | 有 |
| [`openvpn`](https://github.com/ooni/spec/blob/master/nettests/ts-040-openvpn.md){target="_blank"} | OpenVPN 握手能否完成 | experimental | 有 |
| [`psiphon`](https://github.com/ooni/spec/blob/master/nettests/ts-015-psiphon.md){target="_blank"} | Psiphon 规避工具能否建立连线 | current | 有 |
| [`riseupvpn`](https://github.com/ooni/spec/blob/master/nettests/ts-026-riseupvpn.md){target="_blank"} | RiseupVPN 服务可达性 | current | 有 |
| [`stunreachability`](https://github.com/ooni/spec/blob/master/nettests/ts-025-stun-reachability.md){target="_blank"} | STUN 服务器可达性，牵动 WebRTC 通话 | experimental | 有 |
| [`ndt`](https://github.com/ooni/spec/blob/master/nettests/ts-022-ndt.md){target="_blank"} | 连线速度与效能诊断 | current | 有 |
| [`dash`](https://github.com/ooni/spec/blob/master/nettests/ts-021-dash.md){target="_blank"} | 影音串流播放品质 | current | 有 |
| [`browser_web`](https://github.com/ooni/spec/blob/master/nettests/ts-036-browser_web.md){target="_blank"} | 以真实浏览器引擎载入网页 | experimental | 无 |

!!! note "表中出现的缩写"

    - **DoH、DoT**：把 DNS 查询包在 HTTPS 或 TLS 里传送，避免查询内容以明文经过网络。详见 [加密 DNS](../tools/encrypted-dns.md)。
    - **ECH（Encrypted Client Hello）**：TLS 握手的第一个消息原本会以明文带出要连的域名，ECH 把该栏位加密。
    - **SNI（Server Name Indication）**：TLS 握手时以明文送出的目标域名，常被当成封锁判断的依据。
    - **STUN**：协助装置找出自己对外 IP 与埠号的协定，WebRTC 通话建立连线时会用到。
    - **QUIC**：以 UDP 为基础的传输协定，HTTP/3 建立在其上。

## 偶尔才有数据的测项

| 测项 | 量测内容 | spec 状态 | 最近一笔 |
|---|---|---|---|
| [`quicping`](https://github.com/ooni/spec/blob/master/nettests/ts-031-quicping.md){target="_blank"} | QUIC 协定的可达性 | experimental | 2026-07-30 |
| [`sni_blocking`](https://github.com/ooni/spec/blob/master/nettests/ts-024-sni-blocking.md){target="_blank"} | 针对 TLS SNI 栏位的封锁检测 | experimental | 2026-07-20 |

## 查不到公开数据的测项

以下七个测项在 API 查不到公开测量。规格仍保留在上游仓库，可供设计新测项或研究方法时参考。

| 测项 | 量测内容 | spec 状态 |
|---|---|---|
| [`tlsmiddlebox`](https://github.com/ooni/spec/blob/master/nettests/ts-037-tlsmiddlebox.md){target="_blank"} | TLS 连线路径上的中间设备行为 | current |
| [`portfiltering`](https://github.com/ooni/spec/blob/master/nettests/ts-038-port-filtering.md){target="_blank"} | 特定连接埠是否被过滤 | current |
| [`captiveportal`](https://github.com/ooni/spec/blob/master/nettests/ts-010-captive-portal.md){target="_blank"} | 是否处于需要登录的受控网络 | current |
| [`urlgetter`](https://github.com/ooni/spec/blob/master/nettests/ts-027-urlgetter.md){target="_blank"} | 供其他测项复用的通用抓取元件 | experimental |
| [`tcpping`](https://github.com/ooni/spec/blob/master/nettests/ts-032-tcpping.md){target="_blank"} | TCP 层的往返延迟 | experimental |
| [`tlsping`](https://github.com/ooni/spec/blob/master/nettests/ts-033-tlsping.md){target="_blank"} | TLS 握手的往返延迟 | experimental |
| [`simplequicping`](https://github.com/ooni/spec/blob/master/nettests/ts-034-simplequicping.md){target="_blank"} | QUIC 的简化延迟量测 | experimental |

## 标记为 obsolete 的历史测项

上游标为 `obsolete` 的有 12 份，多数功能已被 `web_connectivity` 吸收，或随测量方法演进而退场。处理历史数据时仍可能遇到这些测项的纪录，规划新的观测则无采用的理由。

| 测项 | 规格 |
|---|---|
| bridgeT | [ts-001](https://github.com/ooni/spec/blob/master/nettests/ts-001-bridget.md){target="_blank"} |
| DNS Consistency | [ts-002](https://github.com/ooni/spec/blob/master/nettests/ts-002-dns-consistency.md){target="_blank"} |
| HTTP Requests | [ts-003](https://github.com/ooni/spec/blob/master/nettests/ts-003-http-requests.md){target="_blank"} |
| HTTP Host | [ts-004](https://github.com/ooni/spec/blob/master/nettests/ts-004-http-host.md){target="_blank"} |
| DNS Spoof | [ts-005](https://github.com/ooni/spec/blob/master/nettests/ts-005-dns-spoof.md){target="_blank"} |
| TCP Connect | [ts-008](https://github.com/ooni/spec/blob/master/nettests/ts-008-tcp-connect.md){target="_blank"} |
| Multi Protocol Traceroute | [ts-009](https://github.com/ooni/spec/blob/master/nettests/ts-009-multi-protocol-traceroute.md){target="_blank"} |
| Bridge Reachability | [ts-011](https://github.com/ooni/spec/blob/master/nettests/ts-011-bridge-reachability.md){target="_blank"} |
| DNS Injection | [ts-012](https://github.com/ooni/spec/blob/master/nettests/ts-012-dns-injection.md){target="_blank"} |
| Lantern | [ts-013](https://github.com/ooni/spec/blob/master/nettests/ts-013-lantern.md){target="_blank"} |
| Meek Fronted Requests | [ts-014](https://github.com/ooni/spec/blob/master/nettests/ts-014-meek-fronted-requests.md){target="_blank"} |
| OpenVPN Client Test（旧版） | [ts-016](https://github.com/ooni/spec/blob/master/nettests/ts-016-openvpn.md){target="_blank"} |

!!! note "编号重复的两份 OpenVPN 规格"

    上游有两份规格同编为 `ts-016`，分别是上表标为 `obsolete` 的 `ts-016-openvpn.md` 与标为 `experimental` 的 `ts-016-vanilla-tor.md`。现行的 OpenVPN 测项规格是 `ts-040-openvpn.md`，引用时须留意勿取到旧版。

## 台湾观测到哪些测项

抽查 2026-08-03 五个时段，台湾底下出现过 17 个测项（以下用 API 的下划线写法）：`web_connectivity`、`tor`、`vanilla_tor`、`telegram`、`whatsapp`、`signal`、`facebook_messenger`、`dnscheck`、`echcheck`、`http_header_field_manipulation`、`http_invalid_request_line`、`openvpn`、`psiphon`、`riseupvpn`、`stunreachability`、`ndt`、`dash`。

S3 上的目录名与 `test_name` 写法不同，目录名没有下划线（`webconnectivity`、`vanillator`、`facebookmessenger`），API 查询须用下划线形式（`web_connectivity`、`vanilla_tor`、`facebook_messenger`）。取用路径的细节见 [ASN 观测数据提取与分析](./asn-coverage-howto.md)。

台湾目前的观测集中在 `web_connectivity`，其他测项的样本量偏小。扩充在地观测的涵盖面时，`tor` 与 `dnscheck` 是与社群既有主题最接近的两个方向。

执行特定测项有两条路径。[OONI Probe](https://ooni.org/install/){target="_blank"} 桌面或行动版可在设置中挑选启用的测项。若要邀集他人共同测试固定的网址清单，则以 [OONI Run v2](../tools/ooni-run-v2.md) 建立链接分享，社群目前维运的链接 ID 是 `10328`。

## 延伸阅读

<div class="grid cards" markdown>

- [:material-code-json: OONI 测量数据结构导览](./ooni-data-format.md)
- [:material-shield-search: OONI 怎么判定一个网站被封锁](./ooni-blocking-determination.md)
- [:material-database-search: ASN 观测数据提取与分析](./asn-coverage-howto.md)
- [:material-help-network: OONI Run v2 操作说明](../tools/ooni-run-v2.md)
- [:material-access-point-network: 什么是 OONI](../tools/what-is-ooni.md)

</div>

各测项的完整算法定义在上游 [nettests](https://github.com/ooni/spec/tree/master/nettests){target="_blank"} 目录。测项输出的共通栏位定义在 [data-formats](https://github.com/ooni/spec/tree/master/data-formats){target="_blank"}。
