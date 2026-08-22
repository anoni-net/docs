---
title: ASN 观测数据提取与分析
description: anoni-net/docs 提供的 OONI 数据提取程序如何设置与使用，包含 S3 公开数据集的路径结构、三种取用路径的取舍、程序输出的 CSV 栏位格式，以及覆盖率的计算方式。
icon: material/database-search
---

# :material-database-search: ASN 观测数据提取与分析

本页是 [ASN 自治网络观测数据分析](../taiwan/ooni-asn-coverage.md) 的技术延伸，说明 [anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"} 提供的提取程序如何设置与使用，用于提取 OONI 公开数据并计算特定区域 ASN 的观测覆盖率。

开始前建议先读 [项目研究预先准备](./setup-repo.md) 建置开发环境。

!!! tip "执行位置"

    以下指令均在 `anoni-net-docs/asn_coverage/` 目录下执行。初次使用先 `cd` 进该目录，执行 `uv sync` 安装依赖，再依下方范例以 `uv run python ooni.py ...` 执行。

## 三种取用路径

OONI 的观测数据有三个入口，用途差异很大，着手前需先选定：

| 入口 | 适合的情境 | 限制 |
|---|---|---|
| [AWS S3 公开数据集](https://registry.opendata.aws/ooni/){target="_blank"} | 批次分析、全量统计、跨时间比对 | 需自行解析，下载量以 GB 计 |
| [OONI API](https://api.ooni.io/api/v1/measurements){target="_blank"} | 依条件筛选、取单笔完整测量 | 单次返回笔数有上限 |
| [OONI Explorer](https://explorer.ooni.org/){target="_blank"} | 人工查阅、确认个别测量 | 不适合程序化取用 |

`asn_coverage` 采用 S3 路径，目的是统计覆盖率而非查询单笔。单笔查询与小量筛选的 API 用法见 [OONI 测量数据结构导览](./ooni-data-format.md)。

## 程序能回答什么

`ooni.py` 现阶段做覆盖率与判定分布统计，取用范围有三个限制：

- **只读 `webconnectivity` 目录**。同一小时底下其他十几个测项未纳入，`tor`、`telegram`、`signal` 等测项的观测不会出现在统计中。各测项的量测对象见 [OONI 测项速查表](./ooni-nettests-map.md)。
- **每笔测量只取三个栏位**，`probe_asn`、`annotations.network_type` 与 `test_keys.blocking`。证据层的 `queries`、`tcp_connect`、`requests` 未读取，因此输出可回答「哪些 ASN 有人在测、测了几次、判定结果的分布」，无法回答「单笔测量的证据内容」。
- **只取 `.jsonl.gz`**，同目录的 `.tar.gz` 会跳过。

`blocking` 未观测到干预时是布尔值 `false`、有干预时是字串，程序在计数前已统一为同一组键，没有判定结果的测量记为 `none`，因此每个 ASN 的判定分布加总必然等于测量笔数。判读前提见 [OONI 怎么判定一个网站被封锁](./ooni-blocking-determination.md)。

再往下一层须取证据层的栏位逐笔比对，该作法需要另行设计储存方式，单纯的计数统计无法容纳。

## S3 数据集的摆放方式

Bucket 名称是 `ooni-data-eu-fra`，位于 `eu-central-1`，公开读取不需认证凭证。路径依「日期、小时、国码、测项」分成四层：

```text title="路径结构"
raw/{YYYYMMDD}/{HH}/{国码}/{测项}/{YYYYMMDDHH}_{国码}_{测项}.n{编号}.{序号}.jsonl.gz
```

!!! warning "日期与小时都是 UTC"

    路径中的 `{YYYYMMDD}` 与 `{HH}`，以及后续 CSV 输出的 `date` 与 `hour` 栏位，全部使用 UTC。程序内部一律以 `arrow.Arrow.utcnow()` 取时间。分析「台湾某个时段的观测分布」时须加 8 小时换算，否则图表会整体偏移。

文件名尾端的 `.n{编号}.{序号}` 是 OONI 内部的批次编号，解析时可忽略。

确认目录内容不需安装任何工具：

```bash title="列出台湾某小时的所有测项"
curl -s "https://ooni-data-eu-fra.s3.eu-central-1.amazonaws.com/?list-type=2&prefix=raw/20260804/00/TW/&delimiter=/" \
  | grep -oE '<Prefix>raw/[^<]+</Prefix>'
```

回应是未断行的 XML，上例接 `grep` 只取出目录名称。台湾在单一小时内通常有十几个测项目录，`webconnectivity` 仅为其中之一，同层还有 `tor`、`telegram`、`signal`、`whatsapp`、`dnscheck`、`echcheck`、`openvpn`、`psiphon`、`ndt`、`dash` 等。

每个测项目录底下同一批数据有两种封装，`.jsonl.gz` 与 `.tar.gz`。`.jsonl.gz` 解开后一行一笔测量，适合逐行解析，程序取用的即为 `.jsonl.gz`。以 2026-08-04 台湾的 `webconnectivity` 为例，单一文件约 10 MB，换算成整月全国数据相当可观，执行前应先估算频宽与执行时间。程序采串流处理，原始文件不会落地保存，最终只输出 CSV。

各栏位的判读方式见 [OONI 测量数据结构导览](./ooni-data-format.md)，判定栏位的含义见 [OONI 怎么判定一个网站被封锁](./ooni-blocking-determination.md)。

## 提取与分析指令

### 回看观察数据

```bash title="回看最近 36 小时"
uv run python ooni.py lookback --units=36 --loc=TW --frame=hours
```

三个参数均可省略，默认值即为上例。`--frame` 决定回溯总长度的单位，可填 `hours`、`days`、`weeks` 等，无论何者，数据一律按小时切分。输出文件名格式：

- `lookback_{loc}_{YYYYMMDD}_{units}_{frame}.csv`

文件名中的 `{YYYYMMDD}` 是执行当日的 UTC 日期，并非数据涵盖的区间，实际范围须查看文件内容。文件写入当前的工作目录。

### 取得区间数据

```bash title="取得指定区间"
uv run python ooni.py span --start=2026/08/01 --end=2026/08/03 --loc=TW --chunk=40
```

带入开始时间（`start`）与结束时间（`end`），取得该期间各小时区间的数据。`--chunk` 控制同时处理的小时数，默认 `40`，网络或内存不足时应调小。输出文件名格式：

- `span_{loc}_{开始YYYYMMDD}_{结束YYYYMMDD}.csv`

### 转换为试算表数据

```bash title="展开为试算表格式"
uv run python ooni.py sheetrow --path=./span_TW_20260801_20260803.csv
```

将已提取的数据展开，便于在试算表中计算。输出文件名为原文件名前加上 `rows_`，上例即 `rows_span_TW_20260801_20260803.csv`。

## 输出的 CSV 栏位格式

`lookback` 与 `span` 产出的文件有四个栏位，一列代表一个小时：

| 栏位 | 内容 |
|---|---|
| `loc` | 国码，例如 `TW` |
| `date` | 日期，格式 `YYYY/MM/DD`，UTC |
| `hour` | 小时，格式 `HH`，UTC |
| `statistics` | 该小时的统计结果，内容是一段 JSON |

`statistics` 内含三份计数，`counts` 依 ASN 统计测量笔数，`network_type` 依连线类型统计，`blocking` 依 ASN 统计判定结果的分布。以 2026-08-04 台湾 `00` 时的实际数据为例，该小时共 551 笔测量：

```json title="statistics 栏位展开"
{"counts": {"AS3462": 300, "AS17716": 100, "AS18419": 100, "AS24158": 51},
 "network_type": {"mobile": 44, "no_internet": 7},
 "blocking": {"AS3462": {"false": 294, "dns": 1, "tcp_ip": 1, "none": 4},
              "AS17716": {"false": 94, "none": 6},
              "AS18419": {"false": 99, "none": 1},
              "AS24158": {"false": 51}}}
```

`counts` 与 `blocking` 的加总逐 ASN 相等，`network_type` 则不会对上。`network_type` 由 Probe 自行标记，行动版 App 通常会写入，CLI 与桌面版多半不会，上例 551 笔中仅 51 笔带标记，程序会跳过未标记的测量。其中 `no_internet` 代表 Probe 在测量当下判定自身没有连线。标记涵盖率不到一成，适合观察趋势，不适合作为行动与固网的比例依据。

`blocking` 中的 `none` 代表该笔没有判定结果，缺 `test_keys` 或 `blocking` 为 `null` 均计入此类。上例 551 笔中有 11 笔属之，占比不高但每个 ASN 都出现，计算异常率前须决定是否纳入分母。

巢状 JSON 不易在试算表中计算，`sheetrow` 的作用即是将其摊平为一列一个 ASN：

| `loc` | `date` | `hour` | `asn` | `count` | `anomaly` | `blocking_false` | `blocking_dns` | `blocking_tcp_ip` |
|---|---|---|---|---|---|---|---|---|
| `TW` | `2026/08/04` | `00` | `AS3462` | `300` | `2` | `294` | `1` | `1` |
| `TW` | `2026/08/04` | `00` | `AS17716` | `100` | `0` | `94` | `0` | `0` |

完整栏位还有 `blocking_http_failure`、`blocking_http_diff`、`blocking_none` 与 `blocking_other`，上表受限于版面仅列前几栏。`anomaly` 是四种干预类型的加总，可直接在试算表中作为分子。`blocking_other` 收 ts-017 尚未定义的值，正常情况下应为 `0`，出现非零即代表上游新增了判定类型。

实际分析输出的试算表范例（2023-09 至 2023-12）：

[:material-google-spreadsheet: 20230901-20231204-TW](https://docs.google.com/spreadsheets/d/1lMDsqX8Oa3GKW68y8TuFeKQW2nKM7X0u4z-RopfJIaA/){ .md-button .md-button--primary target="_blank" }

## 计算 ASN 覆盖率

覆盖率需要两份数字，观测数据中出现过的不重复 ASN 数，以及该区域登记在案的 ASN 总数。前者由上一节摊平后的 CSV 以枢纽分析取得，后者以 `ripe.py` 向 RIPE NCC 索取：

```bash title="取得该区域的全量 ASN 清单"
uv run python ripe.py save --loc=TW
```

输出文件名为 `asns_{YYYYMMDDTHH}.csv`，六个栏位分别是 `no`、`location`、`org_id`、`registrar`、`reserved`、`name`。

!!! warning "两边的 ASN 格式不同，比对前须先统一"

    `ripe.py` 输出的 `no` 栏位是纯数字（`3462`），OONI 数据的 `probe_asn` 带 `AS` 前缀（`AS3462`）。迳以 VLOOKUP 比对会全部落空，须先为其中一边补上或去除 `AS`。

两份数字备齐后即可计算：

```text title="覆盖率算式"
覆盖率 = 观测资料中出现的不重复 ASN 数 ÷ 该区域登记的 ASN 总数
```

以 [ASN 自治网络观测数据分析](../taiwan/ooni-asn-coverage.md) 引用的 2023-12 报告为例，台湾当时约有 437 组 ASN，观测数据涵盖的不重复 ASN 占 7.32%。同一算式可用于重算近期区间，对照覆盖率是否改善。

## 下一步

取得数据之后，接续判读各栏位的内容。

<div class="grid cards" markdown>

- [:material-code-json: OONI 测量数据结构导览](./ooni-data-format.md)
- [:material-shield-search: OONI 怎么判定一个网站被封锁](./ooni-blocking-determination.md)
- [:material-table-search: OONI 测项速查表](./ooni-nettests-map.md)
- [:material-access-point-network: ASN 自治网络观测数据分析](../taiwan/ooni-asn-coverage.md)
- [:octicons-mark-github-24: 项目研究预先准备](./setup-repo.md)
- [:material-hand-heart: 如何参与与认领主题](./how-to-contribute.md)

</div>
