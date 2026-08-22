---
title: OONI 测量数据结构导览
description: 一笔 OONI 测量数据由哪些栏位组成，怎么从中读出「谁在哪里测的」与「测出什么结果」。用两笔台湾的真实测量对照说明，并对应到上游 ooni/spec 的规格文件。
icon: material/code-json
---

# :material-code-json: OONI 测量数据结构导览

一笔 OONI 测量有二十多个顶层栏位，`test_keys` 底下还有二十几个。[ASN 观测数据提取与分析](./asn-coverage-howto.md) 说明提取公开数据的方法，本页接续说明提取之后如何判读栏位。

以下以两笔台湾的真实测量对照，拆解网络连线测试（`web_connectivity`）的组成，并标出各栏位对应上游 [ooni/spec](https://github.com/ooni/spec){target="_blank"} 的哪份规格。

!!! info "范例数据来源"

    两笔都是 2026-08-04 由台湾的 OONI Probe 产生的公开数据，可在 [OONI Explorer](https://explorer.ooni.org/){target="_blank"} 查到原始内容。

    | | 正常通过 | 判定异常 |
    |---|---|---|
    | 测量对象 | `http://presidentlee.tw/` | `https://ntc.party/` |
    | `measurement_uid` | `20260804085935.603513_TW_webconnectivity_4a5fd27dec0b32f6` | `20260804084548.416537_TW_webconnectivity_f4e7b0ab3d0251bf` |

## 一笔测量的三层结构

一笔测量可以拆成三层：

1. **外壳**：谁在哪里、用什么软件、什么时候测的。所有测项共用同一套栏位，规格是 [df-000-base](https://github.com/ooni/spec/blob/master/data-formats/df-000-base.md){target="_blank"}。
2. **判定**：测量得出的结论。栏位随测项而异，全部收在 `test_keys` 底下，`web_connectivity` 的定义在 [ts-017](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"}。
3. **证据**：支撑结论的原始纪录，包含每一次 DNS 查询、TCP 连线、TLS 握手与 HTTP 请求，以及对照组的同类纪录。同样放在 `test_keys` 底下，各自对应一份 `df-` 开头的规格。

判定层给出结论，证据层保留支撑结论的纪录。

## 取得一笔测量

公开 API 可直接取得单笔测量，不需事先架设环境。先列出符合条件的测量：

```bash title="列出台湾最近的网络连线测试"
curl -s "https://api.ooni.io/api/v1/measurements?probe_cc=TW&test_name=web_connectivity&limit=5" \
  | python3 -m json.tool | head -40
```

回应中的 `measurement_uid` 可以换取完整内容：

```bash title="取得单笔完整测量资料"
curl -s "https://api.ooni.io/api/v1/raw_measurement?measurement_uid=<measurement_uid>" \
  | python3 -m json.tool | head -60
```

原始回应是未断行的长字串，上面两段接 `python3 -m json.tool` 排版后才易于阅读。查询参数加上 `anomaly=true` 可筛出判定异常的测量，适合用于寻找对照范例。改写 `probe_cc` 与 `probe_asn` 即可查询指定地区与网络的观测纪录。

批次处理大量数据时，AWS S3 公开数据集的效率较高，作法见 [ASN 观测数据提取与分析](./asn-coverage-howto.md)。

## 外壳记录谁在哪里测的

外壳层的栏位在所有测项中一致，其中常用者如下：

| 栏位 | 正常通过那笔 | 判定异常那笔 | 说明 |
|---|---|---|---|
| `probe_cc` | `TW` | `TW` | 测量发生的国家代码 |
| `probe_asn` | `AS3462` | `AS3462` | 执行测量的网络所属 ASN |
| `probe_network_name` | `Chunghwa Telecom Co., Ltd.` | `Chunghwa Telecom Co., Ltd.` | 该 ASN 的组织名称 |
| `resolver_asn` | `AS3462` | `AS13335` | 测量时实际使用的 DNS 解析器所属 ASN |
| `resolver_network_name` | `Chunghwa Telecom Co., Ltd.` | `Cloudflare Inc` | 解析器的组织名称 |
| `input` | `http://presidentlee.tw/` | `https://ntc.party/` | 测量对象的网址 |
| `test_name` | `web_connectivity` | `web_connectivity` | 测项名称 |
| `software_name` | `ooniprobe-cli` | `ooniprobe-desktop-unattended` | 产生数据的 Probe 种类 |
| `software_version` | `3.29.1` | `3.26.0` | Probe 版本 |
| `measurement_start_time` | `2026-08-04 08:59:30` | `2026-08-04 08:45:45` | 测量开始时间（UTC）|
| `report_id` | `20260804T062033Z_webconnectivity_TW_3462_n4_uEH5rGoD07cN2oYQ` | `20260804T084446Z_webconnectivity_TW_3462_n4_dFfWCDrwouM0TsT2` | 同一次执行产生的多笔测量共用此值 |

`probe_asn` 与 `resolver_asn` 可能分属不同网络，上表即为实例。两笔测量都在中华电信的网络上执行，其中一笔的使用者将 DNS 指向 Cloudflare。ASN 分析须将两者分开计算，混用会使「特定电信商网络上的观测结果」失准。

!!! note "`probe_ip` 永远是 `127.0.0.1`"

    OONI 刻意不收集测量者的真实 IP，`probe_ip` 固定写入本机位址。回溯测量来源只能仰赖 `probe_asn` 与时间，[OONI Run v2 操作说明](../tools/ooni-run-v2.md) 针对同一条隐私边界另有提醒。

## 判定是测量得出的结论

判定栏位全部收在 `test_keys` 底下，其计算基础是双边对照。Probe 测完之后，OONI 架设在外部网络的测量服务器（test helper）会对同一个网址再测一次，两边结果的差异即为判定依据。test helper 那一侧的纪录收在 `test_keys.control`，下表的「对照组」即指该侧纪录。

判定结果与内容比对共八个栏位，两笔并排如下：

| 栏位 | 正常通过 | 判定异常 | 说明 |
|---|---|---|---|
| `blocking` | `false` | `"dns"` | 判定的干预类型，可能值为 `dns`、`tcp_ip`、`http-failure`、`http-diff`，未观测到干预时为布尔值 `false` |
| `accessible` | `true` | `false` | 是否取得了合理的回应 |
| `dns_consistency` | `"consistent"` | `"inconsistent"` | Probe 的 DNS 结果与对照组是否一致 |
| `title_match` | `true` | `null` | 网页标题是否与对照组相符 |
| `headers_match` | `true` | `null` | 回应标头是否相符 |
| `status_code_match` | `true` | `null` | HTTP 状态码是否相符 |
| `body_length_match` | `true` | `null` | 回应内容长度是否相近 |
| `body_proportion` | `1` | `0` | 内容长度与对照组的比值 |

各阶段的失败原因另有三个栏位，须与上表一并判读：

| 栏位 | 纪录什么 |
|---|---|
| `dns_experiment_failure` | DNS 阶段的失败原因，判定异常那笔为 `"dns_nxdomain_error"` |
| `http_experiment_failure` | HTTP 阶段的失败原因，例如 `"generic_timeout_error"` |
| `control_failure` | 对照组本身是否失败。有值时双边比对的前提不成立，判定结果不可信 |

`blocking` 的四种值分别对应不同阶段的异常：`dns` 是解析结果与对照组不一致、`tcp_ip` 是封包送不到目标位址、`http-failure` 是连线建立后 HTTP 阶段失败、`http-diff` 是取得的内容与对照组不同（常见于封锁告示页）。四种干预手法的概念说明见 [什么是 OONI](../tools/what-is-ooni.md)。

!!! tip "两个容易误判的类型问题"

    `blocking` 未观测到干预时是布尔值 `false`，有干预时是字串。统计前需先统一类型，否则 `false` 与 `"dns"` 会被归为两类。

    四种值的命名本身不一致，`tcp_ip` 用下划线，`http-failure` 与 `http-diff` 用连字号。上游即如此定义，引用时照原样写入，不应自行统一。

四个 `*_match` 栏位在异常那笔全为 `null`，原因是 DNS 阶段即失败，连线未建立，后续无可比对的内容。遇到整排 `null`，应回溯测量流程中第一个有值的 failure 栏位，该处才是问题发生的阶段。

!!! warning "异常不等于封锁"

    `blocking` 有值仅代表该笔测量的结果与对照组不一致，确认是否存在网络干预需要更多佐证。以判定异常那笔为例，Probe 对 `ntc.party` 的 A 与 AAAA 查询都回报 `dns_nxdomain_error`（域名不存在），但撰稿时以多个公开 DNS 解析器查询，该域名可解析到 IPv6 位址。单笔测量无法区分网络干预、解析器的暂时状态与域名自身的设置变动。

    认定封锁需以跨时间、跨 ASN、跨解析器的多笔测量交叉比对。判定机制的完整拆解与常见误判来源见 [OONI 怎么判定一个网站被封锁](./ooni-blocking-determination.md)，数据集层级的品质控制见 [OONI 如何分辨坏掉的量测数据](../blog/posts/2026-ooni-faulty-measurements.md)。

## 证据是支撑结论的原始纪录

`test_keys` 底下另有数个栏位，纪录测量过程中的每一次网络操作，各对应一份规格：

| 栏位 | 内容 | 规格 |
|---|---|---|
| `queries` | 每一次 DNS 查询的问题、回应与失败原因 | [df-002-dnst](https://github.com/ooni/spec/blob/master/data-formats/df-002-dnst.md){target="_blank"} |
| `tcp_connect` | 每一次 TCP 连线尝试的目标与结果 | [df-005-tcpconnect](https://github.com/ooni/spec/blob/master/data-formats/df-005-tcpconnect.md){target="_blank"} |
| `tls_handshakes` | 每一次 TLS 握手的参数、凭证与结果 | [df-006-tlshandshake](https://github.com/ooni/spec/blob/master/data-formats/df-006-tlshandshake.md){target="_blank"} |
| `requests` | 每一次 HTTP 请求与回应的完整内容 | [df-001-httpt](https://github.com/ooni/spec/blob/master/data-formats/df-001-httpt.md){target="_blank"} |
| `network_events` | 连线过程的时序事件，用于分析延迟与中断点 | [df-008-netevents](https://github.com/ooni/spec/blob/master/data-formats/df-008-netevents.md){target="_blank"} |
| `control` | 对照组的同类纪录，结构与 Probe 侧对应，判定栏位全部由它与 Probe 端的差异算出 | [ts-017](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"} |
| 各栏位的 `failure` 字串 | 所有失败原因的统一命名，例如 `dns_nxdomain_error`、`generic_timeout_error`、`ssl_unknown_authority` | [df-007-errors](https://github.com/ooni/spec/blob/master/data-formats/df-007-errors.md){target="_blank"} |

两笔的 `queries` 对照如下：

```json title="正常通过：查到位址"
{
  "hostname": "presidentlee.tw",
  "query_type": "A",
  "failure": null,
  "answers": [{"answer_type": "A", "ipv4": "43.254.17.201"}]
}
```

```json title="判定异常：查询落空"
{
  "hostname": "ntc.party",
  "query_type": "A",
  "failure": "dns_nxdomain_error",
  "answers": []
}
```

判定层的 `dns_consistency` 是结论，`queries` 与 `control` 是其依据。判定是否合理，查验证据层即可确认。

## 版本与兼容性

对照 spec 前需先确认版本：

- **`data_format_version` 目前是 `0.2.0`**。外壳层的栏位定义稳定，[df-000-base](https://github.com/ooni/spec/blob/master/data-formats/df-000-base.md){target="_blank"} 可以直接对照。
- **`web_connectivity` 实际流通的 `test_version` 是 `0.4.3`**。[ts-017](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"} 的规格内容已更新为描述 v0.5 算法，但生产环境仍以 v0.4 为主。spec 明订新版算法必须使用不同的 test_keys 栏位，v0.4 的栏位定义保持兼容，因此上表的栏位读法对两个版本都适用。
- **`x_` 开头的栏位不在 spec 内**。实际数据中会看到 `x_dns_runtime`、`x_status`、`x_th_runtime` 等栏位，属于实现端的实验性扩充，随版本增减，分析程序不应依赖它们。

上游 spec 的 master 分支自 2025-06 起没有新的合并，但 issue 与 PR 讨论持续进行（进行中的提案包含 ICMP 数据格式与 DPI 分片测项）。spec 现阶段可作为稳定参考。引用时应连回上游原文，避免复制规格内容后因上游更新而失准。

## 延伸阅读

判定栏位的计算方式，以及有值为何不等于封锁，见以下各篇。

<div class="grid cards" markdown>

- [:material-shield-search: OONI 怎么判定一个网站被封锁](./ooni-blocking-determination.md)
- [:material-table-search: OONI 测项速查表](./ooni-nettests-map.md)
- [:material-access-point-network: 什么是 OONI](../tools/what-is-ooni.md)
- [:material-database-search: ASN 观测数据提取与分析](./asn-coverage-howto.md)
- [:material-access-point-network: ASN 自治网络观测数据分析](../taiwan/ooni-asn-coverage.md)
- [:material-list-status: OONI 网站检测清单](../taiwan/ooni-checklist.md)

</div>

上游规格的完整目录在 [ooni/spec](https://github.com/ooni/spec){target="_blank"}，其中 [data-formats](https://github.com/ooni/spec/tree/master/data-formats){target="_blank"} 收录数据格式、[nettests](https://github.com/ooni/spec/tree/master/nettests){target="_blank"} 收录各测项的算法定义。
