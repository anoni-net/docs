---
title: ASN 观测资料撷取与分析
description: anoni-net/docs 提供的 OONI 资料撷取程序如何设置与使用，是 ASN 观测分析的延伸操作指南。
icon: material/database-search
---

# :material-database-search: ASN 观测资料撷取与分析

这页是 [在地脉络 → ASN 自治网络观测资料分析](../taiwan/ooni-asn-coverage.md) 的技术延伸：当你想自己动手抓 OONI 公开资料、计算特定区域 ASN 的观测覆盖率时，这篇介绍 [anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"} 提供的撷取程序如何设置与使用。

开始前建议先读 [项目研究预先准备](./setup-repo.md) 把开发环境建好。

## 资料来源

OONI Probe 的观测资料会回传到 OONI 的 [AWS S3 Open Data](https://registry.opendata.aws/ooni/){target="_blank"} 中储存。你可以：

- 直接读 [OONI Docs](https://docs.ooni.org/data){target="_blank"} 介绍的撷取方式
- 或透过 [anoni-net/docs 的 asn_coverage 程序](https://github.com/anoni-net/docs/tree/main/asn_coverage){target="_blank"} 来操作

资料栏位结构参考 [ooni/spec](https://github.com/ooni/spec){target="_blank"}。

## 撷取与分析指令

### 回看观察资料

```bash title="回看观察资料"
python3 ./ooni.py lookback [--unit=36] [--loc=TW] [--frame=hours]
```

区间单位为小时，默认为 36 个单位（36 小时），区域为台湾（`TW`）。执行后会依单位储存以下格式的文件：

- `lookback_{loc}_{YYYYMMDD}_{units}_{frame}.csv`

### 取得区间资料

```bash title="取得区间资料"
python3 ./ooni.py span --start=YYYY/MM/DD --end=YYYY/MM/DD [--loc=TW]
```

带入开始时间（`start`）与结束时间（`end`），取得台湾这期间各小时区间的资料。

### 转换为试算表资料

```bash title="转换为试算表资料"
python3 ./ooni.py sheetrow --path={资料路径}
```

将已撷取的资料展开后、方便在试算表中进行计算使用，将另存一份开头为 `rows_` 的资料文件。

### 计算 ASN 统计

建议使用「取得区间资料」加「转换为试算表资料」后，可以统计各 ASN 出现的次数与不重复统计计算。再取得目前台湾所有的 ASN 资料：

```bash title="计算统计 ASNs"
python3 ./ripe.py save --loc=TW
```

即可计算占比等统计资料。

## 范例试算表

实际分析输出的试算表范例（2023-09 至 2023-12）：

[:material-google-spreadsheet: 20230901-20231204-TW](https://docs.google.com/spreadsheets/d/1lMDsqX8Oa3GKW68y8TuFeKQW2nKM7X0u4z-RopfJIaA/){ .md-button .md-button--primary target="_blank" }

## 下一步

<div class="grid cards" markdown>

- [:material-access-point-network: ASN 自治网络观测资料分析](../taiwan/ooni-asn-coverage.md)
- [:octicons-mark-github-24: 项目研究预先准备](./setup-repo.md)
- [:material-hand-heart: 如何参与与认领主题](./how-to-contribute.md)

</div>
