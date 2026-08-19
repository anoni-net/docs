---
title: Signal Proxy
description: Signal 在伊朗、中国、俄罗斯这些地区被封锁，proxy 让当地用户把连接绕回 Signal 服务器。说明运作方式、用户怎么套用、运营者看得到什么，以及在网络不受限的地区架一台的门槛与风险。
icon: material/transit-connection-variant
---
# :material-transit-connection-variant: Signal Proxy

Signal Proxy 是一台架在没有封锁地区的转接服务器。被封锁地区的用户把它填进 Signal App，App 的连接先送到这台服务器，再由它转给 Signal 的正式服务器。在当地网络上看起来，用户只是连上一个普通的 HTTPS 网站。

以下分两个部分。前半给需要用 proxy 连接的人，后半给想架一台提供出去的人。

## Signal 为什么在有些地方连不上

Signal 的服务器地址固定，封锁起来相当直接。常见手法是把 Signal 的域名从 DNS 响应里移除、把服务器 IP 放进黑名单，或在 TLS 握手时读 SNI 栏位认出目的地再切断连接。App 的表现就是一直停在「连接中」，消息送不出去。

几个已知的封锁时间点：

- **伊朗**：2021 年 2 月起大规模封锁，Signal 为此在官方博客[向社区征求 proxy 志愿者](https://signal.org/blog/help-iran-reconnect/){target="_blank"}。
- **中国**：2021 年 3 月起需要 proxy 或其他绕行工具才能使用。2024 年 4 月 App Store 中国区也应主管机关要求下架 Signal。
- **俄罗斯**：2024 年 8 月起受到主管机关限制。

Proxy 处理的是连接这一段。注册需要的短信验证码走电信网络，proxy 帮不上忙，主要场景是已经有账号的人在封锁环境里重新连上服务。

## Proxy 怎么运作

Signal 官方的做法叫做 TLS proxy，跟一般的 HTTP proxy 有明显差别。连上一般 HTTP proxy 时，客户端会先送出一段明文的 `CONNECT` 请求说明要连去哪里，审查系统看到这段就知道有人在用 proxy。Signal TLS Proxy 没有这个步骤，整段连接从第一个数据包开始就是加密的 HTTPS 流量，每台 proxy 都配有效的 TLS 证书，在线路上跟一般网站浏览难以区分。

服务器端只把流量转给 Signal 的服务器，非 Signal 的流量会被挡掉。它不是一个通用的翻墙代理，做不到用它去连其他被封锁的网站。

端对端加密在这个过程中完全不受影响。消息在你的设备上加密、在对方设备上解密，proxy 中间看到的是一段它读不了的 TLS 流量。

### 挡得住哪一种封锁

TLS proxy 对付的是「Signal 的服务器地址被封」这一类手法。审查系统靠 DNS、IP 黑名单、SNI 过滤认出目的地时，把连接导向一台还没被列管的服务器就绕得过去。

审查强度更高的环境要另外评估。防火长城会做主动探测（active probing，主动连向可疑的服务器测试它是不是 proxy），DPI 的辨识能力也比多数地区强，Signal Proxy 在这种环境不保证能用。手边需要有备援方案，可以看 [WebTunnel 桥接](../community/setup-tor-webtunnel.md)、[Tor Snowflake](./tor-snowflake.md)，以及 [VPN 的风险与选择](./vpn-guide.md) 里的混淆协议一节。

!!! warning "境内使用者请先评估法律风险"

    中国对个人翻墙长期属法律灰色地带，2025 年底官方公开示警翻墙会被究责[^china]。使用 Signal 本身、以及连接一台境外转接服务器，在当地的处境跟使用 VPN 类似。这一节不评价任何人的选择，判断值不值得是当事人的事，相关的风险层次见 [在中国大陆的公开平台传播信息](../scenarios/mainland-speech.md)。

## 用户怎么套用 proxy

### 用分享链接一键设定

Signal 的 Android 与 iOS App 都注册处理 `signal.tube` 这个域名的链接。运营者提供的分享链接长这样：

```
https://signal.tube/#proxy.example.com
```

在手机上点这个链接，Signal App 会接手并自动把 `#` 后面的主机名填进 proxy 设定。这是最不容易出错的方式，也不需要记选单在哪里。

### 手动填入

取得的是主机名而非链接时，在 Signal 设定里找到代理服务器（Proxy）栏位填入。Android 在「数据与存储空间」底下，iOS 在「隐私」的「进阶」底下。App 版本改版时选单位置可能调整，找不到的话以官方的 [Proxy Support 说明](https://support.signal.org/hc/en-us/articles/360056052052-Proxy-Support){target="_blank"} 为准。

填的内容只有主机名（`proxy.example.com`），不要加 `https://` 或端口。存档后 App 会尝试连接，接上以后主画面上方会出现连接标示。

### 取得链接之后

一台 proxy 的 IP 被审查者发现就会进黑名单，所以手边最好有两三个不同来源的地址备用。运营者换 IP 或重建服务时，旧的链接会失效，需要重新索取一份。

## 使用前要知道的事

- **proxy 运营者看得到你的 IP 与连接时间**。看不到消息内容、对象、群组成员，这些都在端对端加密里面。用谁的 proxy，等于把「某个 IP 在某个时间连了 Signal」的记录交给谁保管。
- **proxy 不隐藏「你在用 Signal」这件事**。对你的 ISP 而言，流量看起来是连到某个普通网站，不过使用 Signal 本身在当地已构成风险时，proxy 解决不了这个问题。需要连使用行为都藏起来，要看 [Tor Browser 进阶设定](./tor-browser-advanced.md) 或移动设备上的 Orbot 这类方案。
- **公开张贴的链接寿命较短**。Signal 官方建议公开宣布自己架了 proxy，地址则透过私信给需要的人。一个地址在社交平台被大量转贴，通常很快就会被封。
- **来源可信度要能追溯**。任何人都能架一台 proxy，地址最好来自你认得的组织或个人，而非来路不明的清单。

## anoni.net 社区的 proxy

!!! warning "规划中，尚未上线"

    社区正在评估架设一台公开的 Signal Proxy。服务上线后，这一节会补上分享链接、取得地址的管道，以及更换地址时的通知方式。在此之前这页只是说明文件，没有可用的地址可以取得。

## 自己架一台

Signal 官方维护 [Signal-TLS-Proxy](https://github.com/signalapp/Signal-TLS-Proxy){target="_blank"}，用 Docker Compose 包好，架设门槛在抗审查基础建设里属于偏低的一类。这一段是给人在网络不受限地区的读者看的，架起来的 proxy 提供给被封锁地区的人使用。

### 需要准备的东西

- 一台 VPS，`80` 与 `443` 两个端口都要能对外开放。
- 一个域名或子域名，A record 指到这台 VPS 的 IP。
- 主机上装好 Docker。

规格需求不高。Signal 在 2021 年的说明中提到，一台便宜的小型 VPS 就能负担数百个同时连接的用户。

### 架设步骤

```bash
git clone https://github.com/signalapp/Signal-TLS-Proxy.git
cd Signal-TLS-Proxy
./init-certificate.sh
docker compose up --detach
```

`init-certificate.sh` 会用 Let's Encrypt 取得 TLS 证书，执行前要先确认 DNS 已经生效，否则证书申请会失败。执行完之后 proxy 就在运作了，分享链接是 `https://signal.tube/#<你的域名>`。

### 运维纪律

官方对这个 repo 有一份稳定性政策，Signal 服务端的兼容性变更会尽量提前 30 天推上 repo。运营者要至少每 30 天检查一次更新，超过太久没更新，proxy 可能突然无法连上 Signal 服务。

更新方式：

```bash
git pull
docker compose down
docker compose build
docker compose up --detach
```

建议搭配一个外部监控，定期从 proxy 以外的网络确认 `443` 还通，服务中断时才不会等到用户回报。

### 分发策略

地址暴露得越广，被封锁得越快。实务上的做法是公开表明「我有一台 Signal proxy」，地址走私信、加密邮件或小群组给出去。同一台服务器如果服务对象太集中在一个地区，也会加速被当地审查系统盯上。

社区层级的做法是多备几台、分散在不同的网络供应商，一台被封就换下一台，这跟 Tor 桥接分发的逻辑相同。

### 架设端的风险评估

Signal Proxy 只把流量转给 Signal 的服务器，不是任意目的地的通用出口。从法律风险看，它跟 [Tor Exit Relay](../community/setup-tor-relay.md) 差距很大，Exit 会有任意用户的任意流量以你的 IP 出去，Signal Proxy 的目的地固定且单一，滥用空间小得多。

就目前掌握的信息，台湾这类没有审查命令的地区，没有限制个人或组织提供转接服务的规定。以上是社区的整理，不构成法律意见。实际要留意的是主机商的服务条款，以及带宽用量是否超出方案限制。租用前可以先看主机商对 proxy 与 VPN 类服务的政策说明。人在对绕行审查工具有管制的司法管辖区，架设本身要另外评估，不能照搬。

## 常见问题

??? question "跟 VPN 差在哪？"

    VPN 把整台设备的流量都导过去，Signal Proxy 只服务 Signal 一个 App 的连接。范围小带来两个好处，一是设定在 App 内完成，不影响其他网络使用，二是流量特征单纯，比 VPN 难被辨识。需要绕行的是整体网络访问而非单一 App 时，[VPN 的风险与选择](./vpn-guide.md) 那篇比较适合。

??? question "架一台要多少带宽？"

    文字消息的流量很小，语音与视频通话才是带宽的主要来源。一般 VPS 方案附的流量额度通常足够，服务量大到需要担心时，会先在主机商的月流量账单上看出来。

??? question "proxy 运营者会被要求交出用户数据吗？"

    服务器上能留下的是连接 IP 与时间，消息内容与通讯对象都在端对端加密内，技术上无法取得。降低风险的做法是不开额外的连接记录、不长期保存 log。

??? question "我可以只给特定几个人用吗？"

    可以。不公开地址、只私下给指定对象，是 Signal 官方建议的分发方式。小规模的私人 proxy 反而比公开清单上的地址活得久。

??? question "跟 Tor Snowflake 比，哪个贡献比较大？"

    两者服务的对象不同。Snowflake 帮的是连不上 Tor 网络的人，涵盖整体网络浏览的匿名需求。Signal Proxy 只处理 Signal 的通讯需求，范围窄但直接对应「联络不上家人朋友」这个具体处境。架设门槛上，Snowflake 开分页就能运作，Signal Proxy 需要 VPS 与域名，跟 [WebTunnel 桥接](../community/setup-tor-webtunnel.md) 接近。

[^china]: [FOTN 2025 China](https://freedomhouse.org/country/china/freedom-net/2025){target="_blank"} - Freedom House。2025 年底官方公开示警见 [AI Cop Signals VPN Crackdown](https://chinamediaproject.org/2025/11/13/ai-cop-signals-vpn-crackdown/){target="_blank"} - China Media Project

## :material-chat-question: 一同了解

<div class="grid cards" markdown>

- [:material-chat-question: 匿名通讯工具比较](./messaging-comparison.md)
- [:material-chat-question: 网络自由为什么重要](../basics/internet-freedom.md)
- [:material-chat-question: 端对端加密如何运作](../advanced/e2ee.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可参与的项目

<div class="grid cards" markdown>

- [:material-snowflake: Tor Snowflake 桥接点](./tor-snowflake.md)
- [:material-tunnel-outline: 如何搭建 Tor WebTunnel 桥接](../community/setup-tor-webtunnel.md)
- [:material-server-network: 如何搭建 Tor Relay](../community/setup-tor-relay.md)

</div>
