---
title: OONI 更新日志
description: OONI Probe、Explorer、Run 等 OONI 工具各版本更新的中文重点整理，方便华语读者掌握网络审查观测工具的关键变更与新功能。
icon: material/access-point-network
---

# :material-access-point-network: OONI 更新日志

[OONI](../tools/what-is-ooni.md) Probe、Explorer、Run 等网络审查观测工具的版本更新整理。新版本永远在最上面，每个条目附「完整翻译文章」链接。

## OONI Probe 6.2.0

> 2026-08-13 · [上游公告](https://github.com/ooni/probe-multiplatform/releases/tag/v6.2.0){target="_blank"}

- 量测引擎升至 OONI Probe CLI v3.30.0，是 6.x 系列首次更动引擎版本，先前各版皆停在 v3.29.0。
- Android 版新增 app 内语言切换，与桌面版在 6.1.1 已有的功能对齐。
- 强化离线处理与重试机制。量测提交遇到无法解析的报告会妥善处理，写文件改为原子操作。
- 匿名凭证（anonymous credentials）新增管理界面与重置功能。匿名凭证让提交端证明自己有权提交测量结果，同时不揭露身份。
- Passport 升至 0.1.5，支持 proxy 与超时设定。
- macOS 与 iOS 的 secure storage 补上错误处理与重试机制。
- 新增未读完成结果的计数查询索引。
- 依赖项更新，Kotlin 升至 2.4.10，Android Gradle Plugin 升至 9.1.1。
- 翻译更新。

## OONI Probe CLI v3.30.0

> 2026-07-27 · [上游发布页](https://github.com/ooni/probe-cli/releases/tag/v3.30.0){target="_blank"}

- 测量引擎与命令行工具共用同一个版本号，跨平台应用从 6.2.0 起带的就是这一版。
- 命令行版新增匿名凭证（anonymous credentials）的提交路径，跟 app 端在 6.1.0 引入的机制对应。
- 移除 `GetFeatureFlag` 里误留的调试输出。
- Android、iOS 与桌面版的 `pom.xml` 拆开，各平台的发布不再互相牵动。
- 构建工具链更新：Go 先升到 1.25.3、该版收尾时再升到 1.26.5，Android NDK 升到最新稳定版，内置资产升至 probe-assets v0.31。

## OONI Probe 6.1.1

> 2026-07-07 · [上游公告](https://github.com/ooni/probe-multiplatform/releases/tag/v6.1.1){target="_blank"}

- 量测引擎维持使用 OONI Probe CLI v3.29.0。
- 桌面版新增 app 内语言切换，不必再跟着系统语系走。
- Android 版迁移至 AGP 9，并补上 JNA 与 UniFFI 绑定所需的 ProGuard 规则。
- 数据库改为过滤后才写入，并为 `Measurement.is_done` 加上索引。
- 修正用量数值在 GB 级距显示错误的问题。
- 翻译更新：德文、巴西葡萄牙文、欧洲葡萄牙文、土耳其文。

## OONI Probe 6.1.0

> 2026-06-25 · [上游公告](https://github.com/ooni/probe-multiplatform/releases/tag/v6.1.0){target="_blank"}

- 量测引擎维持使用 OONI Probe CLI v3.29.0。
- 新增匿名凭证（anonymous credentials）支持，整合 passport 机制。
- 桌面版新增「开机时启动」偏好设置。
- macOS 桌面版打包并签署 JavaFX 原生库，JavaFX 改为桌面发行版的可选组件。
- 桌面版数据库访问固定在单一专用线程，提升稳定性。
- descriptors 界面新增手动刷新按钮。
- 翻译更新，升级 Kotlin、Compose 等依赖项目。
- 多项 bug 修正与稳定性提升。

## OONI Probe 6.0.2

> 2026-05-25 · [上游公告](https://github.com/ooni/probe-multiplatform/releases/tag/v6.0.2){target="_blank"}

- 量测引擎维持使用 OONI Probe CLI v3.29.0。
- 错误量测结果页面 UI 改版，阅读更顺。
- 翻译更新：日文、希腊文、葡萄牙文、德文、中文。
- Android、桌面（macOS、Linux、Windows）与 iOS 平台导入 secure storage 机制。
- 桌面版新增 Windows Store 发行通道，并重构桌面发行通道架构。
- 桌面版 tray menu 新增 Force Quit 选项（按住 Alt 显示）。
- 桌面数据库启用 WAL 模式，I/O 表现更稳定。
- Java 升级至 25，依赖项目（Kotlin、Ktor、Sentry SDK、Compose）同步更新。
- 多项 bug 修正与稳定性提升。

!!! info "OONI Probe 6.0.1、6.0.0 与 5.3.0"

    OONI Probe 6.0.1、6.0.0、5.3.0 等版本的发布条目目前仅在 [正体中文版](https://anoni.net/docs/changelog/ooni/){target="_blank"} 提供，简体中文版会随社群翻译滚动补上。下方保留早期的策展条目。

## OONI Probe CLI v3.29.1

> 2026-05-12 · [上游发布页](https://github.com/ooni/probe-cli/releases/tag/v3.29.1){target="_blank"}

- 维护性发布，上游没有列出变更项目。跨平台应用 6.0.x 与 6.1.x 带的都是 v3.29.x 这条线。

## OONI Probe Desktop 6.0.1 beta

> 2026-04-11 · [GitHub 发布页](https://github.com/ooni/probe-multiplatform/releases/v6.0.1){target="_blank"} · [完整翻译文章](../blog/posts/2026-ooni-probe-desktop-beta.md)

- 推出全新跨平台 OONI Probe Desktop 与仪表板，邀请社群下载内测版回报问题与建议。

## OONI Probe CLI v3.29.0

> 2026-02-10 · [上游发布页](https://github.com/ooni/probe-cli/releases/tag/v3.29.0){target="_blank"}

- 停止支持 psiphon。按照上游的规划（issue 1761），2026 年 1 月 1 日起 psiphon 通道与 psiphon 实验都不再运作。做审查观测数据分析的人要留意，那个测项从此不会有新数据。
- 新增 `userauth` 内部包，是匿名凭证机制的基础。匿名凭证让提交端证明自己有权提交，同时不揭露身份。
- HTTP 响应正文加上读取上限，避免异常或恶意的响应把内存吃光。
- 更新内置证书与 C 依赖。

## OONI Explorer 主题审查页面

> 2025-04-08 · [上游公告](https://ooni.org/post/2025-ooni-explorer-thematic-censorship-pages/){target="_blank"} · [完整翻译文章](../blog/posts/2025-ooni-explorer-thematic-censorship-pages.md)

- 推出全新 OONI Explorer 主题审查页面，呈现全球社交媒体、新闻媒体与翻墙工具的封锁情况图表与报告。
