---
title: tor daemon 更新日志
description: Tor 的 C 语言实现 tor daemon 各版本的中文重点整理，说明每次安全发布修了什么、中继与 onion 服务运营者需不需要立刻升级。
icon: material/server-network
---

# :material-server-network: tor daemon 更新日志

tor daemon（社群惯称 c-tor）是 [Tor](../tools/what-is-tor.md) 网络的 C 语言实现，中继、网桥与 onion 服务都运作在它上面。这一页整理每次发布修了什么、需不需要立刻升级，读者主要是自己架设中继或 onion 服务的人。用 Tor Browser 上网的读者不需要看这一页，浏览器会自己带着对应版本，那些变动整理在 [Tor 更新日志](./tor.md)。

新版本永远在最上面。原始数据来自官方的 [ChangeLog](https://gitlab.torproject.org/tpo/core/tor/-/blob/main/ChangeLog){target="_blank"}。

## 紧急程度怎么判断

- <span class="urg-tag urg-tag--now">立刻</span>官方标为安全发布（security release），通常带 TROVE 编号（Tor Project 对外公布安全问题时用的编号）。中继与 onion 服务是长期在线的目标，这一级的问题多半可以被远程触发。
- <span class="urg-tag urg-tag--soon">尽快</span>影响连接质量或网络健康，但没有可被远程利用的安全问题。
- <span class="urg-tag urg-tag--routine">一般</span>其余维护性发布。

这一页的「立刻」依据的是官方的发布形式（标为安全发布、带 TROVE 编号），不是已经有人在攻击。中继与 onion 服务长期在线，被扫到的机会远高于个人设备，所以门槛设得比 iOS 那几页低。判断不确定时以较高一级为准。

2026 年上半的发布几乎都落在「立刻」。这段期间 Tor 的安全审视强度提高，连续修出多个可被远程触发的问题，分级反映的就是实际状况。运营中继的人这半年确实需要每次都跟上。

## 两条维护线

`0.4.9.x` 是目前的主线，`0.4.8.x` 是长期支持线，安全修补会同步 backport。发行版软件包常常停在 0.4.8.x，看到同一天发两个版本是正常的，装哪一条看你的软件源。

## conflux 是什么

下面多则条目都在修 conflux。它让客户端同时用两条电路传同一个连接的数据以提升速度，2023 年进入 Tor，是这半年多起安全问题的共同来源。新的代码路径带来新的错误面，这批修补集中在那里并不意外。

## tor 0.4.9.11

> 2026-06-25 · [ChangeLog](https://gitlab.torproject.org/tpo/core/tor/-/blob/tor-0.4.9.11/ChangeLog){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>距离上一版只隔两天的安全发布，官方说明是又发现高优先级的问题，其中一个影响 onion 服务。上游没有提到已被实际利用。
- 修掉一个竞态条件：在特定情况下，会合点（rendezvous point）可以冒充客户端想连的那个 onion 服务，形成中间人。架设 onion 服务的人这一版务必要升（bug 41297，问题从 0.3.5.3-alpha 就存在）。
- 客户端遇到 onion 服务把某个引介点的公钥编成全零时，不再直接中止退出（bug 41295）。
- 目录权威不再接受出口策略里把端口写成 0 的写法。原本的次要检查误把 `0` 解析成 `1-0` 这个端口范围，生成 networkstatus 投票时会触发 assert。

## tor 0.4.9.10

> 2026-06-23 · [ChangeLog](https://gitlab.torproject.org/tpo/core/tor/-/blob/tor-0.4.9.10/ChangeLog){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>安全发布，官方强烈建议尽快升级。上游没有提到已被实际利用。
- TROVE-2026-025：拒绝在已经有附挂流的电路上收到的 `CONFLUX_LINK` 信元。恶意客户端可以先发 `RELAY_COMMAND_BEGIN` 再发 `CONFLUX_LINK`，挂上的出口流最后会变成孤儿，留下悬空的电路反向指针，电路被释放时形成 use-after-free，也就是内存还回去之后又被拿来用，结果是中继当掉（bug 41258）。
- 未设置 `SafeSocks` 时，恢复对不安全 SOCKS 协议（socks4 或不带主机名的 socks5）的警告。这个警告消失了很久，而它防的是把要解析的域名直接泄漏给本机以外的地方（bug 41290）。
- 客户端的入口守卫（entry guard）过期时间回到一致的 48 到 60 天。

## tor 0.4.9.9

> 2026-06-01 · [ChangeLog](https://gitlab.torproject.org/tpo/core/tor/-/blob/tor-0.4.9.9/ChangeLog){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>安全发布，一次修掉三个主要问题。上游没有提到已被实际利用。
- TROVE-2026-022：压缩炸弹检查可以被绕过。攻击者把多个 gzip 或 zlib 子流接在一起，每一段都刚好低于单流的检测门槛，整体就闪过了检查（bug 41275，问题从 0.3.1.1-alpha 就存在）。
- TROVE-2026-021：解压被截断的 zlib/gzip 流时陷入无穷循环。截断的流永远到不了 `Z_STREAM_END`，zlib 返回的 `Z_BUF_ERROR` 被误判成输出缓冲区满了，于是无限重试（bug 41274）。
- TROVE-2026-017：发出 `CONFLUX_SWITCH` 信元失败时的 NULL write after free。发送失败会关闭电路并移除该条腿，但返回值被忽略，调用端接着往已经释放的内存写入而崩溃（bug 41263）。

## tor 0.4.9.8

> 2026-05-07 · [ChangeLog](https://gitlab.torproject.org/tpo/core/tor/-/blob/tor-0.4.9.8/ChangeLog){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>前一版发出后的紧急补发，起因是 CI 构建过程的一个无声错误，把备援目录（fallback directory）清单整份清空了。这一版没有安全问题，也就没有利用与否的问题。
- 影响的是新安装的客户端：没有备援目录可用时，只能直接对目录权威做 bootstrap，那几台机器的负载与可观测性都因此变差。
- 重新生成 2026 年 5 月 7 日版本的备援目录清单。

## tor 0.4.9.7、0.4.8.24

> 2026-05-06 · [ChangeLog](https://gitlab.torproject.org/tpo/core/tor/-/blob/tor-0.4.9.7/ChangeLog){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>安全发布，两条维护线同时发布。上游没有提到已被实际利用。
- TROVE-2026-011：处理 END、TRUNCATE 与 TRUNCATED 信元时，若载荷里没有原因字段会发生越界读取，也就是读到不该读的内存，可能让中继当掉或泄漏内存内容。这个问题从 0.1.1.1-alpha 存在到现在（bug 41254）。
- TROVE-2026-008：不再通过 conflux 的分腿尝试或接受 `BEGIN_DIR`（bug 41243）。
- TROVE-2026-010：清空 conflux 的乱序队列时修正计数（bug 41251）。

## tor 0.4.9.6、0.4.8.23

> 2026-03-25 · [ChangeLog](https://gitlab.torproject.org/tpo/core/tor/-/blob/tor-0.4.9.6/ChangeLog){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>安全发布，两个问题都可能让中继被远程弄崩。上游没有提到已被实际利用。
- TROVE-2026-003：恶意的 `CREATED2` 造成 11 个字节的栈溢出，结果是远程崩溃（bug 41231）。
- TROVE-2026-004：conflux 子系统的内存比对用错长度，同样可能导致远程崩溃（bug 41232）。
- 另外修了一批纵深防御性质的问题，以及 big-endian 平台上的 polyval 实现。
