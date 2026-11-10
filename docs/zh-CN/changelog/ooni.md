---
title: OONI 更新日志
description: OONI Probe、Explorer、Run 等 OONI 工具各版本更新的中文重点整理，方便华语读者掌握网络审查观测工具的关键变更与新功能。
icon: material/access-point-network
digest:
  name: OONI Probe
  devices: [ooni]
---

# :material-access-point-network: OONI 更新日志

[OONI](../tools/what-is-ooni.md) Probe、Explorer、Run 等网络审查观测工具的版本更新整理。新版本永远在最上面，每个条目附「完整翻译文章」链接。

## OONI Probe 6.3.1

> 2026-11-09 · [上游公告](https://github.com/ooni/probe-multiplatform/releases/tag/v6.3.1){target="_blank"}

- 测量引擎升至 OONI Probe CLI v3.31.1，app 因此带进 Brotli（网页常用的一种压缩格式）解压缩库的修补，细节见下方 v3.31.1 那一则。app 的发布说明没有另外列出安全修补，也没有提到已被实际利用。
- 新增塞尔维亚语，拉丁字母与西里尔字母两种写法都有。
- 自定义代理服务器的主机字段改成接受 `localhost` 与超过六个字母的顶级域名，原本这两种会被判成格式错误。
- 另外修正三个错误：数值在一百万到一千万之间时单位换算错误、结果筛选的网络名称可能是空值，以及发生错误的测量结果无法取消选择。
- 依赖项与翻译更新。

## OONI Probe CLI v3.31.1

> 2026-11-03 · [上游发布页](https://github.com/ooni/probe-cli/releases/tag/v3.31.1){target="_blank"}

- 测量引擎与命令行工具的小改版，跨平台应用从 6.3.1 起带这一版。
- 安全相关的是依赖包更新（#1862）。Go 版的 Brotli 库从 1.1.1 升到 1.2.7，修补对应 Brotli 的 CVE-2026-111497（又称 HTTP2Shell，解压缩特制数据时的越界写入）。CISA 在 10 月 27 日把这个漏洞收入已知遭利用漏洞目录（KEV），收录的是 Google 以 C 语言写的原始实现。安全公司 Sweet Security 的分析文章写到 Go 版同样受影响，文中重现的结果是程序异常终止（panic），建议升到 1.2.7 以上。
- Brotli 在 OONI Probe 里是间接依赖的包。提交修补的贡献者评估它在 Go 里的严重程度低，OONI 的发布说明与 PR 都没有提到 OONI Probe 被实际利用。
- 同一个 PR 把 utls（模仿浏览器 TLS 握手特征的库）从 2021 年之后就没有更新的 yawning/utls 换成 refraction-networking/utls，PR 说明里写了旧版 utls 有已公开的安全公告。压缩库 klauspost/compress 也从 1.19.1 升到 1.20.3。
- 测量时发出的 User-Agent 换成较新的 Chrome 版本，原因是网站的机器人管理服务会拦下版本号太旧的 User-Agent（#1861）。
- 引擎向调用它的 app 公开自己的名称与版本（#1860）。

## OONI Probe 6.3.0

> 2026-11-02 · [上游公告](https://github.com/ooni/probe-multiplatform/releases/tag/v6.3.0){target="_blank"}

- 测量引擎升至 OONI Probe CLI v3.31.0，引擎里移除 eMudhra 根证书与 Go 升到 1.27.3 这两项安全相关的变更，从这一版起进到 app（见下方 v3.31.0 那一则）。app 的发布说明没有另外列出安全修补，也没有提到已被实际利用。Passport 升至 0.1.8。
- 自定义代理支持 SOCKS5 的用户名密码验证（RFC 1929）。原本需要用户名密码的代理连不上，Android 上有人用用户名密码挡住不受信任的 app 使用同一个代理。
- 测量结果提交失败时，改为发送到备用的 `api.oo-srv.com`。
- 桌面版的自动更新多了备用的更新来源。对应的 issue 写的情境是 GitHub 被限速、下载经常失败的地方。
- macOS 与 iOS 也能检测加密 DNS 有没有开启，判断依据是系统实际发出的 DNS 查询走 HTTPS、TLS，还是一般的 UDP、TCP。6.2.1 起写进测量结果的 `resolver_type` 注记，原本只有 Android 判断得出私人 DNS。
- Android 版的网络库从 ktor-android 换成 OkHttp。
- 依赖项与翻译更新。

## OONI Probe CLI v3.31.0

> 2026-10-22 · [上游发布页](https://github.com/ooni/probe-cli/releases/tag/v3.31.0){target="_blank"}

- 测量引擎与命令行工具的新版。跨平台应用最新的 6.2.1 仍带 v3.30.0，app 要等下一次发版才会换上这一版引擎。
- 安全相关的有两项，发布说明没有提到已被实际利用。内置的 CA 证书列表移除 eMudhra 的根证书，原因是它下面的中间证书遭到盗用（#1853）。Go 升到 1.27.3，纳入 CVE-2026-111943 的修补，Go 的 `crypto/x509` 新增一份黑名单，系统的信任列表没有更新时，也会拒绝已知不再可信的中间证书（#1854）。
- 新增 richer input 的支持，排给测量的每个网址或目标可以附带各自的设置。网络连接测试（Web Connectivity）、即时通讯类的测试，以及从 check-in 获取列表的实验都已经接上，check-in 也可以指定实验的版本。命令行的 miniooni 支持 OONI Run v2.1。
- 新增 DDR 实验，检查系统使用的 DNS 解析器有没有通过 DDR（RFC 9462，让解析器告诉客户端自己支持哪些加密 DNS 的协议）公布加密 DNS 的入口。TLS 中间设备探测（tlsmiddlebox）加上 TCP traceroute，也为了在手机版推出做了调整。
- 修正：Psiphon 测试停用时不再提交它的测量结果，echcheck 在 TCP 连接失败时不再尝试 TLS 握手，原本使用的 STUN 服务器 stun.ekiga.net 换成 Cloudflare 的。
- 构建工具链更新：Go 从 1.26 系列升到 1.27.3，Debian 镜像换成 bookworm，Android NDK 与 C 依赖升到最新版，quic-go 升到 0.56.0。

## OONI Probe 6.2.1

> 2026-09-28 · [上游公告](https://github.com/ooni/probe-multiplatform/releases/tag/v6.2.1){target="_blank"}

- 量测引擎维持 OONI Probe CLI v3.30.0，跟 6.2.0 相同。这一版以错误修正为主，发布说明没有列出安全修补。
- 测量结果新增 DNS 解析方式的注记（`resolver_type`），值有私人 DNS（private_dns）、VPN、系统默认与未知四种。Android 版会检测系统设置里的私人 DNS 有没有开启，其他平台只会标成 VPN 或未知。已有用户反馈，开着加密 DNS 测量时，被 DNS 篡改挡掉的网站会显示为可以连接（ooni/probe#2857）。OONI 决定先收集这个注记的数据评估影响，暂时不在 app 里提醒用户关掉，因为关掉加密 DNS 反而让用户多一分风险。
- 修掉结果页不显示午夜之后新结果的问题，原本要重开 app 才会出现。
- iOS 版的最低系统要求从 iOS 14 提高到 iOS 15，还在 iOS 14 的设备装不了这一版。
- iOS 版把匿名凭证存进钥匙串时，改为开机后第一次解锁之后就能访问。重新开机后、还没解锁前的后台运行，写入钥匙串会失败（`errSecInteractionNotAllowed`），现在改为延后保存，不再当成错误。
- Passport 升至 0.1.7。
- 依赖项目与翻译更新。

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

    OONI Probe 6.0.1、6.0.0、5.3.0 等版本的发布条目目前仅在 [正体中文版](https://anoni.net/docs/changelog/ooni/){target="_blank"} 提供，简体中文版会随社区翻译滚动补上。下方保留早期的策展条目。

## OONI Probe CLI v3.29.1

> 2026-05-12 · [上游发布页](https://github.com/ooni/probe-cli/releases/tag/v3.29.1){target="_blank"}

- 维护性发布，上游没有列出变更项目。跨平台应用 6.0.x 与 6.1.x 带的都是 v3.29.x 这条线。

## OONI Probe Desktop 6.0.1 beta

> 2026-04-11 · [GitHub 发布页](https://github.com/ooni/probe-multiplatform/releases/v6.0.1){target="_blank"}

- 推出全新跨平台 OONI Probe Desktop 与仪表板，邀请社区下载内测版试用。程序错误用 app 内置的错误报告发送（会一并附上 app 的日志），其他意见写信到 team@ooni.org 或在 [GitHub](https://github.com/ooni/probe-multiplatform/issues){target="_blank"} 开 issue。

## OONI Probe CLI v3.29.0

> 2026-02-10 · [上游发布页](https://github.com/ooni/probe-cli/releases/tag/v3.29.0){target="_blank"}

- 停止支持 psiphon。按照上游的规划（issue 1761），2026 年 1 月 1 日起 psiphon 通道与 psiphon 实验都不再运作。做审查观测数据分析的人要留意，那个测项从此不会有新数据。
- 新增 `userauth` 内部包，是匿名凭证机制的基础。匿名凭证让提交端证明自己有权提交，同时不揭露身份。
- HTTP 响应正文加上读取上限，避免异常或恶意的响应把内存吃光。
- 更新内置证书与 C 依赖。

## OONI Explorer 主题审查页面

> 2025-04-08 · [上游公告](https://ooni.org/post/2025-ooni-explorer-thematic-censorship-pages/){target="_blank"} · [完整翻译文章](../blog/posts/2025-ooni-explorer-thematic-censorship-pages.md)

- 推出全新 OONI Explorer 主题审查页面，呈现全球社交媒体、新闻媒体与翻墙工具的封锁情况图表与报告。
