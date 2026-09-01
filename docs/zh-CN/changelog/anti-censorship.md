---
title: 抗审查传输更新日志
description: Snowflake、WebTunnel、lyrebird 各版本的中文重点整理，说明每次更新对绕过封锁有什么影响，以及三种传输各自适合什么情况。
icon: material/shield-key-outline
---

# :material-shield-key-outline: 抗审查传输更新日志

连不上 Tor 网络时要换的那几种传输方式（pluggable transports）的版本整理。这里的更新多半在调整伪装手法，跟封锁方的检测是持续来回的过程，所以看更新的重点放在「伪装有没有跟上」，而不是安全修补。相关的使用说明见 [Tor Browser 进阶设置](../tools/tor-browser-advanced.md)与 [Snowflake](../tools/tor-snowflake.md)。

新版本永远在最上面。

## 三种传输适合什么情况

- **Snowflake**：不需要事先获取网桥地址，在 Tor Browser 里选了就能用，靠世界各地志愿者的浏览器当临时中转。适合封锁不算严密、或临时需要连接的情况。速度不稳定是它的常态。
- **WebTunnel**：把 Tor 流量包装成一般的 HTTPS 网站流量，在只放行 443 端口又做深度包检测的网络里最有机会。需要事先获取网桥地址。
- **obfs4**：老牌选项，把流量变成没有特征的随机字节。在已经针对它建立特征库的地区成功率会下降，运行它的程序现在是 lyrebird。

三种都在 Tor Browser 的连接设置里，不必另外安装。网桥地址可以从 [bridges.torproject.org](https://bridges.torproject.org/){target="_blank"} 或 Moat 自动获取。

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
