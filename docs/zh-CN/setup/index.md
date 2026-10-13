---
title: 架设与运营
description: 架设 Tor 中继节点、WebTunnel 桥接与 onion 服务的步骤，以及帮文档站的 IPFS 镜像 pin 一份副本。
icon: material/hammer-wrench
---

# :material-hammer-wrench: 架设与运营

架起一个 Tor 中继节点或桥接，受审查地区的使用者就多一个连上 Tor 的入口。架一个 onion 服务，读者不必离开 Tor 网络也能打开你的网站。各篇都从安装写到上线之后的运维。

## Tor 节点与 onion 服务

- [Tor Relay 架设指南](https://anoni.net/zh-cn/join/setup-tor-relay/){target="_blank"}：中继、网桥与出口节点的差别，以及架设时的法律、技术与行政考量。
- [Tor WebTunnel 桥接架设指南](https://anoni.net/zh-cn/join/setup-tor-webtunnel/){target="_blank"}：把 Tor 流量伪装成一般的 HTTPS 连接，从 VPS、域名、TLS 到 nginx 与 Docker 的完整步骤。
- [.onion 服务架设指南](https://anoni.net/zh-cn/join/setup-onion-service/){target="_blank"}：用 Tor 官方方式架设 v3 onion 服务，接上 nginx 与子域名。

## 文档站的镜像

- [文档站 IPFS 镜像的 pin 节点](https://anoni.net/zh-cn/join/pin-ipfs-mirror/){target="_blank"}：用一个常驻的 IPFS 节点加定时脚本，替文档站多保存一份副本。
