---
title: 抗审查传输更新日志
description: Snowflake、WebTunnel、lyrebird 各版本的中文重点整理，说明每次更新对绕过封锁有什么影响，以及三种传输各自适合什么情况。
icon: material/shield-key-outline
digest:
  name: 抗审查传输
  devices: [windows, mac, linux, android, relay]
---

# :material-shield-key-outline: 抗审查传输更新日志

连不上 Tor 网络时要换的那几种传输方式（pluggable transports）的版本整理。这里的更新多半在调整伪装手法，跟封锁方的检测是持续来回的过程，所以看更新的重点放在「伪装有没有跟上」，而不是安全修补。相关的使用说明见 [Tor Browser 进阶设置](../tools/tor-browser-advanced.md)与 [Snowflake](../tools/tor-snowflake.md)。

新版本永远在最上面。

## 三种传输适合什么情况

- **Snowflake**：不需要事先获取网桥地址，在 Tor Browser 里选了就能用，靠世界各地志愿者的浏览器当临时中转。适合封锁不算严密、或临时需要连接的情况。速度不稳定是它的常态。
- **WebTunnel**：把 Tor 流量包装成一般的 HTTPS 网站流量，在只放行 443 端口又做深度包检测的网络里最有机会。需要事先获取网桥地址。
- **obfs4**：老牌选项，把流量变成没有特征的随机字节。在已经针对它建立特征库的地区成功率会下降，运行它的程序现在是 lyrebird。

三种都在 Tor Browser 的连接设置里，不必另外安装。网桥地址可以从 [bridges.torproject.org](https://bridges.torproject.org/){target="_blank"} 或 Moat 自动获取。

## Snowflake 2.15.0、2.15.1

> 2026-10-07 · [ChangeLog](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/snowflake/-/blob/main/ChangeLog){target="_blank"}

- 2.15.0 的修补大多落在 Broker（替客户端与代理配对的中介服务器）与代理端。Broker 由 Tor Project 运营，用 Tor Browser 内置 Snowflake 的人不需要做任何事，自己运行 Snowflake 代理的人要更新。上游没有提到已被实际利用。
- Broker 恢复按 IP 限制代理轮询的频率（issue 40506）。频率限制先前应用到所有端点，疑似拖慢客户端配对而整个移除。没有限制时，恶意代理可以频繁轮询，分到不成比例的客户端，再丢弃或拖慢它们的连接。
- 外部安全审计发现一个 Medium 等级的问题，代理可以用自己填写的 Forwarded 头伪造来源 IP，绕过上面那项频率限制，也能操纵 Tor Metrics 公布的代理数量与地区统计（issue 40564）。修正后 Broker 只采信反向代理附加的 X-Forwarded-For。
- NAT 配对从两类改成三类（issue 40077）：open（没有 NAT、full cone 或 restricted cone NAT）、moderate（port-restricted cone NAT）与 strict（symmetric NAT）。原本的分法会让 port-restricted NAT 后面的客户端配到 symmetric NAT 后面、实际上连不通的代理。手机代理越来越多、IPv4 地址越来越紧张，这种配对失败会随之增加。
- 代理端与 Probetest 只接受第一个打开的数据通道（issue 40554、40563）。代理端新增 `-interface` 选项，可以限定对外连接使用的网络接口（issue 40380）。
- 发布流程改用 goreleaser 生成 Debian 软件包（issue 40409），Go 工具链升到 1.25。2.15.1 只修发布用的 tarball 构建镜像，功能与 2.15.0 相同。

## lyrebird 0.9.0

> 2026-10-06 · [ChangeLog](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/lyrebird/-/blob/main/ChangeLog){target="_blank"}

- 修掉 Snowflake 传输忽略代理配置的错误。在 Tor 里配置上游代理时（例如 Tor Browser 连接设置里的代理选项），通过 lyrebird 运行的 Snowflake 原本不会经过那个代理，只能通过代理上网的环境会因此无法连接。
- 发布流程改用 goreleaser 生成软件包，依赖同步更新。这一版没有安全问题，也就没有利用与否的问题。
- ChangeLog 上这一版标注的日期是 9 月 21 日，那是修正合并的日子，版本标签在 10 月 6 日才创建。截至 10 月 8 日，Tor Browser 还没有带这一版的新版本。

## WebTunnel 0.0.7

> 2026-09-15 · [项目页](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/webtunnel){target="_blank"}

- 只影响自架 WebTunnel 网桥的人，一般用户不受影响。0.0.6 以来只有三个提交，都落在打包与构建：deb 的构建与上传流程调整，容器镜像加上 arm64 架构，用容器架网桥的人可以在 arm64 主机上直接取得镜像。
- 这一版没有安全修补，伪装手法也没有变动。WebTunnel 没有维护独立的 changelog，条目是从版本标签与提交信息整理的，细节比 Snowflake 与 lyrebird 少。

## WebTunnel 0.0.6

> 2026-07-23 · [项目页](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/webtunnel){target="_blank"}

- 只影响自架 WebTunnel 网桥的人，一般用户不受影响：加入 Debian 软件包，架设网桥不必再自己编译。
- WebTunnel 没有维护独立的 changelog，这一页的条目是从版本标签与提交信息整理的，细节比其他两个项目少。

## WebTunnel 0.0.5

> 2026-07-02 · [项目页](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/webtunnel){target="_blank"}

- 只影响自架网桥的人：新增可信代理跳数（Trusted Proxy Hops）设置。网桥架在 CDN 或反向代理后面时，这个设置决定要信任几层转发标头，关系到记录下来的客户端地址正不正确。

## Snowflake 2.14.1

> 2026-06-25 · [ChangeLog](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/snowflake/-/blob/main/ChangeLog){target="_blank"}

- 检查类型断言，并验证收到的 WebRTC offer 与 answer（issue 40546）。这类输入来自对面的节点，没有验证就处理有机会让代理端崩溃，报告者是 Bogdan Barchuk 与 Alexander Kucher。
- Probetest 加入以 SOCKS5 为基础的交互连接测试，用来排查代理端连不上的问题。

## Snowflake 2.14.0

> 2026-06-09 · [ChangeLog](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/snowflake/-/blob/main/ChangeLog){target="_blank"}

- 更新 covert-dtls 并整理公开接口。covert-dtls 负责让 DTLS 握手看起来像一般的 WebRTC 应用，是 Snowflake 避开特征检测的关键一环。
- covert-dtls 配置新增 `none` 选项，代理端可以关掉伪装。
- 以下两项只影响自己运营 Snowflake 代理或 Broker 的人。Broker 的轮询间隔改为可从文件加载并以毫秒表示，代理端不必再重新编译就能调整上报频率。
- 修掉 Broker 一个可能的 nil 指针解引用，以及计量启动失败时没有报告监听错误的问题。

## Snowflake 2.13.0

> 2026-04-08 · [ChangeLog](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/snowflake/-/blob/main/ChangeLog){target="_blank"}

- 代理端的 covert-dtls 默认值改为 `randomizemimic`（issue 40530），DTLS 握手的特征每次都不一样，比固定模仿单一实现更难被建成特征。
- Broker 加入轮询间隔字段与 `NextPoll` 消息，让代理端知道下次该什么时候上报。

## Snowflake 2.13.1、2.12.1

> 2026-03-10 · [ChangeLog](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/snowflake/-/blob/main/ChangeLog){target="_blank"}

- 两个版本都只修发布流程使用的 Go 版本（分别是 1.24 与 1.23），功能没有变动。

## lyrebird 0.8.1

> 2026-01-14 · [ChangeLog](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/lyrebird/-/blob/main/ChangeLog){target="_blank"}

- 修正 chrome120 模仿配置文件。lyrebird 用 uTLS 模仿特定浏览器的 TLS 指纹，模仿配置一旦跟真实的 Chrome 对不上，反而变成可辨识的特征。
- lyrebird 是 obfs4、meek、WebTunnel 与 Snowflake 的统一可执行程序，Tor Browser 内置的就是它。0.7.0 为 WebTunnel 加了证书哈希链固定、多重服务器名称与 SNI 模仿选项，0.8.0 让 meek 支持多组网址与 front 配对。
