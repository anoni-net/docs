---
title: OONI 怎么判定一个网站被封锁
description: 网络连线测试（Web Connectivity）的 blocking 栏位怎么算出来，四种判定各自对应什么证据，以及为什么 blocking 有值不等于确认封锁。用五笔真实测量说明判读方法与常见误判来源。
icon: material/shield-search
---

# :material-shield-search: OONI 怎么判定一个网站被封锁

[OONI 测量资料结构导览](./ooni-data-format.md) 说明各栏位的位置，本页说明判定栏位的计算方式。`blocking: "dns"` 在多数情况下并不足以断定某个网站在台湾被封锁。

`blocking` 纪录的是单次测量与对照组不一致，与「确认封锁」尚有距离。以下拆解判定机制、四种类型各自对应的证据，以及单笔测量推向可信结论所需的补强。

## 判定的基础：双边对照

Probe 单独测一个网站，无法区分「网站遭到干预」与「网站本身无法连线」。`web_connectivity` 的作法是同一个网址测两次，一次从 Probe 所在的网络，一次请 OONI 的 test helper 从外部网络测，再比对两边结果。

test helper 是 OONI 架设在外部网络的测量服务器，观测结果收在 `test_keys.control` 底下，包含 DNS 解析结果、TCP 连线状态与 HTTP 回应。判定栏位全部建立在双边差异上：

| 差异出现的位置 | 判定 |
|---|---|
| DNS 解析结果不一致 | `blocking: "dns"` |
| DNS 一致，Probe 连不上但 test helper 连得上 | `blocking: "tcp_ip"` |
| TCP 连得上，HTTP 阶段失败 | `blocking: "http-failure"` |
| HTTP 有回应，内容与 test helper 取得的不同 | `blocking: "http-diff"` |
| 两边都正常且内容相符 | `blocking: false`、`accessible: true` |

判定顺序由前往后，DNS 阶段出问题即不再往下比对。四个 `*_match` 栏位在前三种情况下全为 `null`，原因正是比对已在更早的阶段中止。

!!! tip "先看 `control` 再看 `blocking`"

    `blocking` 是双边比对的结果，并非 Probe 单方面的观测。判读异常测量时，应先确认 `test_keys.control` 中 test helper 的观测内容，再回头读 `blocking`。下一节的 `tcp_ip` 范例即说明，忽略 `control` 会把网站自身的问题误判成封锁。

## 四种判定对应的证据

后续章节引用的五笔测量都是 2026-08-04 的公开资料，可在 [OONI Explorer](https://explorer.ooni.org/){target="_blank"} 查到原始内容。

### `dns`：解析结果不一致

台湾 `https://ntc.party/` 的测量，Probe 对 A 与 AAAA 的查询都回报 `dns_nxdomain_error`（域名不存在），test helper 端查得到，因此 `dns_consistency` 标为 `inconsistent`。

```json title="test_keys.queries"
{"query_type": "A", "failure": "dns_nxdomain_error", "answers": []}
{"query_type": "AAAA", "failure": "dns_nxdomain_error", "answers": []}
```

DNS 判定须留意解析器归属。该笔的 `resolver_asn` 是 `AS13335`（Cloudflare），`probe_asn` 则是 `AS3462`（中华电信）。测量者将 DNS 指向境外服务时，DNS 阶段的异常未必反映本地电信商的行为。

### `tcp_ip`：连不到目标位址

台湾 `http://www.tkec.com.tw/` 的测量判定为 `tcp_ip`，DNS 正常解析到 `210.64.193.1`，Probe 连 `80` 埠逾时。

单看 Probe 端容易误读成封锁，对照 `control` 的结果则得出不同结论：

```json title="test_keys.control.tcp_connect"
{"210.64.193.1:443": {"status": true,  "failure": null},
 "210.64.193.1:80":  {"status": false, "failure": "generic_timeout_error"}}
```

test helper 从外部连 `80` 埠同样逾时，代表该网站的 `80` 埠从外部亦无法连通，与台湾的网络环境无关。同一个 IP 的 `443` 埠两侧皆通，进一步显示问题出在该埠而非路径。

### `http-failure`：连线建立后取不到内容

台湾 `https://bit.ly/` 的测量判定为 `http-failure`。DNS 正常，两个目标 IP 的 `443` 埠皆可连通，`control` 显示 test helper 端亦同，差异出现在 HTTP 阶段的 `generic_timeout_error`。

连线层正常而应用层失败，常见于服务器端的速率限制、对特定来源的拒绝服务，以及 TLS 层的中断。区分成因须查看 `tls_handshakes` 与 `network_events` 的时序。

### `http-diff`：取得的内容不一致

台湾的资料中有 `http-diff`，但样态与封锁告示页不同（见文末台湾现况），以下改用印尼的测量说明典型的告示页样态。

四种类型中只有 `http-diff` 会用到四个 `*_match` 栏位。印尼 `http://www.sportsinteraction.com/` 的测量是典型例子：

| 观测方 | 状态码 | 标题 | 内容长度 |
|---|---|---|---|
| Probe | `200` | `Trustpositif` | 7,044 |
| test helper | `403` | `Maintenance` | 7,067 |

Probe 的请求被重导向到 `http://lamanlabuh.aduankonten.id/`，落在印尼官方的内容申诉域名，页面标题 `Trustpositif` 是当地网络内容过滤系统的名称。ISP 在连线途中将使用者导向告示页，是 `http-diff` 最典型的成因。

该笔同时显示单一栏位不足以作为判准：

```text title="四个 *_match 栏位与 body_proportion"
title_match: false        status_code_match: false
headers_match: true       body_length_match: true
body_proportion: 0.9967
```

`body_length_match` 为 `true`、`body_proportion` 逼近 `1`，起因仅是封锁告示页与对照组页面的长度接近。单看长度会得到错误结论，四个栏位须一并判读，其中 `title_match` 与 `status_code_match` 的鉴别力通常最高。

## 误判的来源

`blocking` 有值而实际上没有网络干预，是资料集中的常态。前述 `tkec.com.tw` 的 `80` 埠不通即为一例，以下是一笔更隐蔽的。

埃及 `http://www.newipnow.com/` 的测量判定为 `http-diff`，四个 `*_match` 有三个不符，`body_proportion` 仅 `0.02`，表面上近似被插入封锁页。实际内容如下：

| 观测方 | 状态码 | 标题 |
|---|---|---|
| Probe | `520` | `newipnow.com \| 520: Web server is returning an unknown error` |
| test helper | `200` | `Buy Private Proxies: $0.88 per Dedicated Premium IP - NewIPNow` |

`520` 是目标网站前方的 Cloudflare 在来源服务器异常时回应的错误页，代表该网站当下发生异常，与埃及的网络管制无关。该笔的 `probe_asn` 是 `AS13335`（Cloudflare），测量端本身亦位于 Cloudflare 的网络上，属于下列第二类的测量环境因素。

常见的误判来源可分为几类：

- **来源网站自身状态**：服务器错误、维护页、CDN 错误页、地理限制。
- **测量环境**：Probe 启用 VPN 或 Tor 时，测得的是出口所在地的网络。
- **网站的动态内容**：轮播广告、个人化内容、A/B 测试会使两侧内容原本即不相同。
- **对照组本身失败**：`control_failure` 有值时，双边比对的前提不成立。

OONI 在资料集层级亦处理同一类问题，作法见 [OONI 如何分辨坏掉的量测资料](../blog/posts/2026-ooni-faulty-measurements.md)，该文整理了 OONI 过滤异常投稿所用的启发式规则。

## 从单笔测量到可信结论

将观测推进到「某个网站在某地被封锁」，单笔资料并不足够。实务上须补上几个维度：

1. **跨时间**：同一个网址在数天到数周内反覆出现同样的判定，方能排除偶发故障。
2. **跨 ASN**：多家电信商测得相同结果，指向网络层的普遍行为。仅在单一 ASN 出现者，较可能是该业者的个别设置。
3. **跨解析器**：更换 DNS 解析器后仍然异常，方能排除解析器自身问题。
4. **`confirmed` 栏位**：OONI 后端以已知的封锁告示页指纹比对测量，命中时将 `confirmed` 标为 `true`。该栏位位于 [measurements API](https://api.ooni.io/api/v1/measurements){target="_blank"} 的回应中，属于后端分析结果，不在 Probe 产生的原始资料内。

跨时间与跨 ASN 比对的批次取用作法，见 [ASN 观测资料撷取与分析](./asn-coverage-howto.md)。

!!! warning "`confirmed` 为 `true` 不等于 `http-diff`"

    两者易于混淆。`confirmed` 标记的依据是封锁指纹比对，DNS 被导向已知的封锁用 IP 同样会标记为 `confirmed`，判定类型仍是 `dns`。撰稿时抽查伊朗、俄罗斯、土耳其、中国各 5 笔 `confirmed` 测量，样本全部落在 `blocking: "dns"`。样本数少，仅能说明两者并非同一件事，不足以推论一般规律。

## 台湾现况

以下数字取自 2026-08-05 往前 24 小时的台湾 `web_connectivity` 全量资料，共 22,105 笔测量。统计方式是把该区间 S3 上的每一笔逐行解析，取 `test_keys.blocking` 依 ASN 累计：

| 判定 | 笔数 | 占比 |
|---|---|---|
| `false`（未观测到干预） | 21,029 | 95.13% |
| `none`（没有判定结果） | 512 | 2.32% |
| `tcp_ip` | 312 | 1.41% |
| `dns` | 150 | 0.68% |
| `http-failure` | 67 | 0.30% |
| `http-diff` | 35 | 0.16% |

四种干预类型合计 564 笔，占全部测量的 2.55%。`none` 是缺 `test_keys` 或 `blocking` 为 `null` 的测量，计算异常率前须先决定是否纳入分母。

另外抽查 100 笔异常测量，`confirmed` 为 `true` 的有 0 笔，与 [ASN 自治网络观测资料分析](../taiwan/ooni-asn-coverage.md) 长期以来的描述一致。

!!! warning "小样本会给出错误的分布"

    本页初稿曾以 measurements API 异常清单的 40 笔抽样估计判定分布，得到 `dns` 最多、`http-diff` 为零的结论。改用全量统计后两点皆不成立：`tcp_ip` 为 `dns` 的两倍以上，`http-diff` 亦确实存在。API 的异常清单另有排序逻辑，迳自视为随机样本会失准。判定分布应以全量统计取得，作法见 [ASN 观测资料撷取与分析](./asn-coverage-howto.md)。

台湾的 `http-diff` 与前述印尼的例子属于不同现象。抽查 4 小时区间内的 15 笔，`body_proportion` 全部落在 `0.004` 到 `0.21`，Probe 取得的内容远短于对照组，与封锁告示页逼近 `1` 的样态相反。内容极短通常指向错误页或空回应，成因须逐笔查验证据层方能判断，本页不下结论。

重新执行上述统计的指令：

```bash title="取得判定分布"
uv run python ooni.py lookback --units=24 --loc=TW --frame=hours
```

该指令会印出 `blocking` 的合计，并将逐 ASN 的分布写入 CSV。单笔查验仍使用 API：

```bash title="列出台湾的异常测量"
curl -s "https://api.ooni.io/api/v1/measurements?probe_cc=TW&test_name=web_connectivity&anomaly=true&limit=100" \
  | python3 -m json.tool | head -40
```

以上是单一 24 小时区间的快照，反映当日样态，不足以作为长期趋势的结论。趋势分析须涵盖更长时间，而台湾的观测本身即存在 ASN 集中度过高的限制，细节见前述 [ASN 自治网络观测资料分析](../taiwan/ooni-asn-coverage.md)。

## 延伸阅读

跨时间、跨 ASN 的比对从撷取指南开始。

<div class="grid cards" markdown>

- [:material-database-search: ASN 观测资料撷取与分析](./asn-coverage-howto.md)
- [:material-code-json: OONI 测量资料结构导览](./ooni-data-format.md)
- [:material-table-search: OONI 测项速查表](./ooni-nettests-map.md)
- [:material-access-point-network: ASN 自治网络观测资料分析](../taiwan/ooni-asn-coverage.md)
- [:material-list-status: OONI 网站检测清单](../taiwan/ooni-checklist.md)

</div>

判定演算法的完整定义在上游 [ts-017-web-connectivity](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"}，失败字串的统一命名在 [df-007-errors](https://github.com/ooni/spec/blob/master/data-formats/df-007-errors.md){target="_blank"}。
