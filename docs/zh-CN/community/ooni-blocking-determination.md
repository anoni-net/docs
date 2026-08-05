---
title: OONI 怎么判定一个网站被封锁
description: 网络连线测试（Web Connectivity）的 blocking 栏位怎么算出来，四种判定各自对应什么证据，以及为什么 blocking 有值不等于确认封锁。用五笔真实测量说明判读方法与常见误判来源。
icon: material/shield-search
---

# :material-shield-search: OONI 怎么判定一个网站被封锁

[OONI 测量资料结构导览](./ooni-data-format.md) 说明了栏位放在哪里，接下来的问题是栏位值怎么算出来。看到 `blocking: "dns"` 时，多数情况还不足以断定某个网站在台湾被封锁。

`blocking` 只纪录单次测量与对照组不一致，距离「确认封锁」还有几步。以下拆解判定机制、四种类型各自对应的证据，以及把单笔测量推到可信结论需要补上什么。

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

判定顺序由前往后，DNS 阶段就出问题时不会继续往下比对。四个 `*_match` 栏位在前三种情况下全是 `null`，原因正是比对在更早的阶段就中止。

!!! tip "先看 `control` 再看 `blocking`"

    `blocking` 是双边比对的结果，不是 Probe 单方面的观测。判读任何一笔异常测量时，先确认 `test_keys.control` 里 test helper 看到什么，再回头读 `blocking`。下一节的 `tcp_ip` 范例会示范，忽略 `control` 会把网站自身的问题误判成封锁。

## 四种判定对应的证据

后续章节引用的五笔测量都是 2026-08-04 的公开资料，可在 [OONI Explorer](https://explorer.ooni.org/){target="_blank"} 查到原始内容。

### `dns`：解析结果不一致

台湾 `https://ntc.party/` 的测量，Probe 对 A 与 AAAA 的查询都回报 `dns_nxdomain_error`（域名不存在），test helper 端查得到，因此 `dns_consistency` 标为 `inconsistent`。

```json title="test_keys.queries"
{"query_type": "A", "failure": "dns_nxdomain_error", "answers": []}
{"query_type": "AAAA", "failure": "dns_nxdomain_error", "answers": []}
```

DNS 判定要留意解析器归属。该笔的 `resolver_asn` 是 `AS13335`（Cloudflare），`probe_asn` 则是 `AS3462`（中华电信）。测量者把 DNS 指向境外服务时，DNS 阶段的异常未必反映本地电信商的行为。

### `tcp_ip`：连不到目标位址

台湾 `http://www.tkec.com.tw/` 的测量判定为 `tcp_ip`，DNS 正常解析到 `210.64.193.1`，Probe 连 `80` 埠逾时。

只看 Probe 端容易误读成封锁，对照 `control` 的结果就会得到不同结论：

```json title="test_keys.control.tcp_connect"
{"210.64.193.1:443": {"status": true,  "failure": null},
 "210.64.193.1:80":  {"status": false, "failure": "generic_timeout_error"}}
```

test helper 从外部连 `80` 埠同样逾时，代表该网站的 `80` 埠从外部一样连不上，与台湾的网络环境无关。同一个 IP 的 `443` 埠两边都通，更说明问题出在该埠而非路径。

### `http-failure`：连得上但取不到内容

台湾 `https://bit.ly/` 的测量判定为 `http-failure`。DNS 正常，两个目标 IP 的 `443` 埠都连得上，`control` 显示 test helper 端也一样，差异出现在 HTTP 阶段的 `generic_timeout_error`。

连线层没问题而应用层失败，常见于服务器端的速率限制、对特定来源的拒绝服务，以及 TLS 层的中断。要区分成因需要看 `tls_handshakes` 与 `network_events` 的时序。

### `http-diff`：取得的内容不一致

台湾目前的公开资料里查不到同类样态（见文末台湾现况），以下改用印尼的测量说明。

四种类型里只有 `http-diff` 会让四个 `*_match` 栏位派上用场。印尼 `http://www.sportsinteraction.com/` 的测量是典型例子：

| 观测方 | 状态码 | 标题 | 内容长度 |
|---|---|---|---|
| Probe | `200` | `Trustpositif` | 7,044 |
| test helper | `403` | `Maintenance` | 7,067 |

Probe 的请求被重导向到 `http://lamanlabuh.aduankonten.id/`，落在印尼官方的内容申诉域名，页面标题 `Trustpositif` 是当地网络内容过滤系统的名称。ISP 在连线途中把使用者导向告示页，是 `http-diff` 最典型的成因。

该笔同时示范了单一栏位不可靠：

```text title="四个 *_match 栏位与 body_proportion"
title_match: false        status_code_match: false
headers_match: true       body_length_match: true
body_proportion: 0.9967
```

`body_length_match` 为 `true`、`body_proportion` 逼近 `1`，纯粹因为封锁告示页与对照组页面的长度刚好接近。只看长度会得到错误结论，四个栏位要一起读，其中 `title_match` 与 `status_code_match` 的鉴别力通常最高。

## 误判从哪里来

`blocking` 有值而实际上没有网络干预，是资料集里的常态。前面 `tkec.com.tw` 的 `80` 埠不通已经是一例，再看一笔更隐蔽的。

埃及 `http://www.newipnow.com/` 的测量判定为 `http-diff`，四个 `*_match` 有三个不符，`body_proportion` 只有 `0.02`。看起来像被插入封锁页，实际内容是：

| 观测方 | 状态码 | 标题 |
|---|---|---|
| Probe | `520` | `newipnow.com \| 520: Web server is returning an unknown error` |
| test helper | `200` | `Buy Private Proxies: $0.88 per Dedicated Premium IP - NewIPNow` |

`520` 是目标网站前方的 Cloudflare 在来源服务器异常时回应的错误页，代表该网站当下发生异常，与埃及的网络管制无关。另外值得留意的是，该笔的 `probe_asn` 是 `AS13335`（Cloudflare），测量端本身也走在 Cloudflare 的网络上，属于下面第二类的测量环境因素。

常见的误判来源可以归成几类：

- **来源网站自身状态**：服务器错误、维护页、CDN 错误页、地理限制。
- **测量环境**：Probe 开着 VPN 或 Tor 时，测到的是出口所在地的网络。
- **网站的动态内容**：轮播广告、个人化内容、A/B 测试会让两边的内容本来就不同。
- **对照组本身失败**：`control_failure` 有值时，双边比对的前提不成立。

OONI 在资料集层级也处理同一类问题，作法可参考 [OONI 如何分辨坏掉的量测资料](../blog/posts/2026-ooni-faulty-measurements.md)，该文整理了 OONI 用哪些启发式规则过滤异常投稿。

## 从单笔测量到可信结论

要把观测推进到「某个网站在某地被封锁」，单笔资料不够。实务上补上几个维度：

1. **跨时间**：同一个网址在数天到数周内反覆出现同样的判定，才能排除偶发故障。
2. **跨 ASN**：多家电信商都测到相同结果，指向网络层的普遍行为。只在单一 ASN 出现，较可能是该业者的个别设置。
3. **跨解析器**：换不同 DNS 解析器仍然异常，才能排除解析器自身问题。
4. **看 `confirmed` 栏位**：OONI 后端会用已知的封锁告示页指纹比对测量，命中时把 `confirmed` 标为 `true`。该栏位在 [measurements API](https://api.ooni.io/api/v1/measurements){target="_blank"} 的回应中，属于后端分析结果，不在 Probe 产生的原始资料里。

想自己执行跨时间或跨 ASN 的比对，[ASN 观测资料撷取与分析](./asn-coverage-howto.md) 有批次取用的作法。

!!! warning "`confirmed` 为 `true` 不等于 `http-diff`"

    两者容易混淆。`confirmed` 标记的依据是封锁指纹比对，DNS 被导向已知的封锁用 IP 也会标记为 `confirmed`，判定类型仍是 `dns`。撰稿时抽查伊朗、俄罗斯、土耳其、中国各 5 笔 `confirmed` 测量，样本全部落在 `blocking: "dns"`。样本数少，仅能说明两者并非同一件事，不足以推论一般规律。

## 台湾现况

撰稿时抽样观察台湾的 `web_connectivity` 资料，纪录到两个现象：

- **抽查 100 笔异常测量，`confirmed` 为 `true` 的有 0 笔**，与 [ASN 自治网络观测资料分析](../taiwan/ooni-asn-coverage.md) 长期以来的描述一致。
- **抽查 40 笔异常测量的判定分布，`dns` 31 笔、`tcp_ip` 6 笔、`http-failure` 3 笔、`http-diff` 0 笔**。台湾目前的公开观测资料里没有出现重导向到封锁告示页的样态，前面的 `http-diff` 范例才需要引用印尼与埃及的资料。

两组样本都取自 measurements API 的异常清单，查询条件如下，你可以自行重新执行确认结论是否仍成立：

```bash title="列出台湾的异常测量"
curl -s "https://api.ooni.io/api/v1/measurements?probe_cc=TW&test_name=web_connectivity&anomaly=true&limit=100" \
  | python3 -m json.tool | head -40
```

判定分布需要逐笔取 `raw_measurement` 后统计 `test_keys.blocking`，前述 40 笔即以此方式取得。

以上是特定时间点的抽样，样本量小，仅供理解资料样态，不足以当作长期趋势的结论。要做有代表性的统计，需要涵盖更长时间与更多 ASN，而台湾的观测本身就存在 ASN 集中度过高的限制，细节见前面提到的 [ASN 自治网络观测资料分析](../taiwan/ooni-asn-coverage.md)。

## 延伸阅读

想自己执行跨时间、跨 ASN 的比对，从撷取指南开始。

<div class="grid cards" markdown>

- [:material-database-search: ASN 观测资料撷取与分析](./asn-coverage-howto.md)
- [:material-code-json: OONI 测量资料结构导览](./ooni-data-format.md)
- [:material-table-search: OONI 测项速查表](./ooni-nettests-map.md)
- [:material-access-point-network: ASN 自治网络观测资料分析](../taiwan/ooni-asn-coverage.md)
- [:material-list-status: OONI 网站检测清单](../taiwan/ooni-checklist.md)

</div>

判定演算法的完整定义在上游 [ts-017-web-connectivity](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"}，失败字串的统一命名在 [df-007-errors](https://github.com/ooni/spec/blob/master/data-formats/df-007-errors.md){target="_blank"}。
