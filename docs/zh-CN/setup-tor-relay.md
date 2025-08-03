---
title: 如何搭建 Tor Relay
icon: simple/torproject
---

# :simple-torproject: 如何搭建 Tor Relay

如何在台湾的网络上安装 Tor 中继站（Relay）、桥接站点（Bridge）与出口站点（Exit Node）。

!!! warning "建立前需衡量事项！"

    如果您对 Tor 还不是很了解，可以先参考「[什么是 Tor？](./what-is-tor.md)」的介绍。

    <figure markdown="span">
        <a target="_blank"
        href="../assets/images/tor_diagram.original.webp">
            <img src="../assets/images/tor_diagram.original.webp"
                alt="Tor Relay 运作流程"
                title="Tor Relay 运作流程"
            >
        </a>
        <caption>Tor Relay 运作流程</caption>
    </figure>

    以下的教学仅使用入口节点与中间节点作为范例，如果您想要进行更高级的节点建立操作，请思考以下问题并评估可承受的风险：

    - 您想要建立一个 Tor 出口节点还是非出口（桥接、入口、中间）节点？
    - 如果您想建立一个出口节点：您要在出口政策中允许哪些连接端口？更多的连接端口通常意味着可能会有更多的滥用或违法投诉。
    - 您希望使用哪个外部 TCP 连接端口来接受 Tor 连接？`ORPort` 设置：如果您的服务器上没有其他服务占用此连接端口，我们建议使用 443 连接端口。推荐使用 `ORPort 443`，是因为这通常是公共 Wi-Fi 网络中少数几个开放的端口之一。连接端口 9001 也是另一个常用的 `ORPort`。
    - 您将使用哪个电子邮件作为节点的联系信息 `ContactInfo` 字段？这些信息将会公开。
    - 您希望允许多少带宽、每月流量用于 Tor 流量？
    - 服务器是否允许 IPv6 地址？

## 如何建立 Middle Relay

建立一个 Middle Relay 需要一些技术知识和基本的安装与设置。建议使用 Debian 或 Ubuntu 操作系统来进行安装，以下范例也将采用 Debian/Ubuntu 系统进行操作。

!!! info "其他操作系统"

    其他操作系统或更详细的安装说明可以参考官方文档：[Tor Project | Middle/Guard relay](https://community.torproject.org/relay/setup/guard/){target="_blank"}。

### 安装 tor

```bash
apt update
apt install tor
```

!!! info "不同版本的选择"

    Tor 在各个 Linux 发行版中可能会不是最新版本，如果需要安装最新或测试版本，可以参考官方说明文档进行调整：[Why and how I can enable Tor Package Repository in Debian?](https://support.torproject.org/apt/tor-deb-repo/){target="_blank"}

### 设置

调整配置文件 `/etc/tor/torrc`

```bash
Nickname    myNiceRelay # 调整 "myNiceRelay" 为你要公开呈现的名称
ContactInfo your@e-mail # 联系方式，将公开呈现
                        # 如不想公开，可设置成 none
ORPort      9001        # 默认的 Port 为 9001
                        # 如果能提供 443, 80 等看起来像
                        # 网页常用的 Port，更能帮助严峻的国家
                        # 也请记得开启防火墙或对外 Port 设置。
ExitRelay   0           # 不成为出口节点
SocksPort   0
Log notice file /var/log/tor/notices.log # 开启日志记录
```

重新启动 Tor，默认设置为 `tor@default`

```bash
systemctl restart tor@default
```

查看日志或系统日志 `/var/log/syslog` 是否出现 `Self-testing indicates your ORPort` 字样及说明 `reachable`。大约三个小时之后，可以在 [Relay Search](https://metrics.torproject.org/rs.html){target="_blank"} 中搜索到你的 Relay 信息。

!!! info "安装后的注意事项"

    安装后需要注意的事项可以参考官方文档：[Tor Project | Relay Post-install and good practices](https://community.torproject.org/relay/setup/post-install/){target="_blank"}。

## 使用 nyx 监控
使用 nyx 来监控您的 Relay 状态和性能：

```bash
apt install nyx
```

## 建立多组 Tor 配置文件 `tor-instance-create`

`tor-instance-create` 是一个用来在同一台服务器上建立多个独立 Tor 的工具。这在需要运行多个 Tor 以增加匿名性或流量分散的情况下特别有用。`tor-instance-create` 是 Tor 的一部分，通常已经随 Tor 软件包一起安装。

### 建立新的 Tor Instance

```bash
tor-instance-create tor@{instance-name}
tor-instance-create tor@mytor2
```

这将建立一个名为 `mytor2` 的新 Tor 实例，其配置文件目录将创建在 `/var/lib/tor-instances/mytor2` 下。

### 设置新的配置文件

新的配置文件位置在 `/var/lib/tor-instances/mytor2/torrc`，在配置文件中，您可以设置各种参数，例如：

```bash
ORPort 9002  # 设置新的 ORPort，确保每个实例使用不同的端口。
DataDirectory /var/lib/tor-instances/mytor2/data
Log notice file /var/lib/tor-instances/mytor2/notice.log
```

### 启动

启动或重新启动新建立的 Tor 实例。

```bash
# systemctl start tor@{instance-name}
systemctl start tor@mytor2
```

### 使用 nyx 监控新的配置文件

```bash
nyx -s /run/tor-instances/{instance-name}/control
```

## 搭建 Tor Relay 的常见问题

??? question "搭建 Tor Relay 会被警察找上门吗？"

    Relay 有三层：入口节点（Guard Relay）、中间节点（Middle Relay）、出口节点（Exit Relay）。其中入口节点与中间节点在 Tor 网络中扮演的是传输转送的角色，不负责连接和访问最终目的地的节点主机，因此与执法单位接触的可能性很低。因此，搭建出口节点的潜在风险需要经过慎重评估后再决定是否行动。

??? question "使用家庭网络搭建可行吗？"

    使用家庭网络（例如：中国电信的家庭光纤、有线电视网络等类似网络）搭建可能需要调整电信公司提供的路由器，会有一定的技术门槛需要跨越。如果能手动设置和调整路由器等设置，请注意开启防火墙和限定连入的连接端口，默认路由器通常关闭所有连入的连接端口。

??? question "我为什么要运行一个 Tor Relay？"

    建立和运行 Tor Relay 帮助扩展 Tor 网络的带宽和稳定性，使更多人能够安全、匿名地上网。这对于网络自由和隐私权的推广至关重要。

??? question "我能从运行 Tor Relay 中获得什么样的好处？"

    虽然运行 Tor Relay 通常不会带来直接的经济利益，但可以帮助促进网络自由，支持全球的言论自由、网络自由和隐私权。此外，它让你成为开源社区的一部分，促进匿名互联网的基础设施安全。

??? question "运行 Tor Relay 需要很多技术知识吗？"

    不一定。虽然基本的网络知识（如 IP 地址、连接端口设置）会有用，但 Tor 官方提供详细的安装指南，各大社区论坛也积极提供帮助。任何有兴趣的人都可以学习并建立运行一个 Relay。

??? question "运行 Tor Relay 是否合法？"

    在中国大陆，使用 Tor 和运行 Tor Relay 并不合法，因此建议关注与网络自由相关议题及法律。在其他地方，如台湾，网络相对自由，目前允许使用 Tor Relay，但法律状况可能随时变动。不过，建立出口节点（Exit Relay）可能面临更多法律风险，建议先了解相关法规。

??? question "运作 Tor Relay 有什么要求？"

    建立 Tor Relay 前，确保您的网络有稳定的上传和下载速度。至少需具备 100 KB/s 的上传带宽且有固定的 IP 地址。此外，确认你的 ISP 允许这类流量，并且你的网络设备（如防火墙和路由器）可正确设置所需的连接端口转发。

??? question "Tor Relay 会影响我的网速吗？"

    Tor Relay 使用你设置的最大带宽，因此不会占用所有的网络资源。不过，你可能会注意到在高负载时，网速稍有降低。你可以根据需要调整设置中的带宽限制参数。

??? question "如何保护运作 Tor Relay 时的隐私？"

    Tor Relay 本身不会访问或追踪用户的流量，但建议在设置时小心选择可识别信息，例如不要使用可识别个人信息的电子邮件。此外，定期更新 Tor 软件以确保安全性。

??? question "如何升级我的 Tor Relay 软件？"

    保持 Tor 软件更新非常重要，以获得最新的安全更新和功能。在大多数 Linux 系统上，可以通过包管理器来更新 Tor。Windows 和 macOS 用户应定期检查 Tor 官网上的更新。

??? question "如何成为 Guard Relay？"

    Guard Relay 由 Tor 网络自动选定，用户无法手动配置。如果节点稳定运行且具备足够的带宽，就有可能被选为 Guard Relay。