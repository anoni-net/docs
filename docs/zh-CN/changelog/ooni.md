---
title: OONI 更新日志
description: OONI Probe、Explorer、Run 等 OONI 工具各版本更新的中文重点整理，方便华语读者掌握网络审查观测工具的关键变更与新功能。
icon: material/access-point-network
---

# :material-access-point-network: OONI 更新日志

[OONI](../tools/what-is-ooni.md) Probe、Explorer、Run 等网络审查观测工具的版本更新整理。新版本永远在最上面，每个条目附「完整翻译文章」链接。

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
- 桌面版数据库存取固定在单一专用线程，提升稳定性。
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

## OONI Probe Desktop 6.0.1 beta

> 2026-04-11 · [GitHub 发布页](https://github.com/ooni/probe-multiplatform/releases/v6.0.1){target="_blank"} · [完整翻译文章](../blog/posts/2026-ooni-probe-desktop-beta.md)

- 推出全新跨平台 OONI Probe Desktop 与仪表板，邀请社群下载内测版回报问题与建议。

## OONI Explorer 主题审查页面

> 2025-04-08 · [上游公告](https://ooni.org/post/2025-ooni-explorer-thematic-censorship-pages/){target="_blank"} · [完整翻译文章](../blog/posts/2025-ooni-explorer-thematic-censorship-pages.md)

- 推出全新 OONI Explorer 主题审查页面，呈现全球社交媒体、新闻媒体与翻墙工具的封锁情况图表与报告。
