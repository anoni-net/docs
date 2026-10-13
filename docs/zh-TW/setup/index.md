---
title: 架設與營運
description: 架設 Tor 中繼節點、WebTunnel 橋接與 onion 服務的步驟，在校園推動 Tor Relay 的提案範本、SOP 與 FAQ，以及幫文件站的 IPFS 鏡像 pin 一份副本。
icon: material/hammer-wrench
---

# :material-hammer-wrench: 架設與營運

架起一個 Tor 中繼節點或橋接，受審查地區的使用者就多一個連上 Tor 的入口。架一個 onion 服務，讀者不必離開 Tor 網路也能開啟你的網站。各篇都從安裝寫到上線之後的維運，並說明台灣的法規與網路環境要留意的地方。

## Tor 節點與 onion 服務

- [如何搭建 Tor Relay](../community/setup-tor-relay.md)：中繼、橋接與出口節點的差別，以及架設時的法律、技術與行政考量。
- [如何搭建 Tor WebTunnel 橋接](../community/setup-tor-webtunnel.md)：把 Tor 流量偽裝成一般的 HTTPS 連線，從 VPS、網域、TLS 到 nginx 與 Docker 的完整步驟。
- [如何搭建 .onion 服務](../community/setup-onion-service.md)：用 Tor 官方方式架設 v3 onion 服務，接上 nginx 與子網域。

## 校園 Tor Relay

在學校架設中繼節點，除了技術步驟，更多時間花在跟資訊中心與法務溝通。三篇整理自已經上線的校園節點的經驗，可以照順序使用。

- [校園 Tor Relay 提案範本](../community/campus-tor-relay-proposal.md)：提案文件、四封溝通信件與行政時間軸。
- [校園 Tor Relay 架設 SOP](../community/campus-tor-relay-sop.md)：torrc、防火牆規則、監控與事件處置的完整步驟。
- [校園 Tor Relay：給校方與法務的 FAQ](../community/campus-relay-faq.md)：校方最常擔心的十個問題與回應建議。

## 文件站的鏡像

- [幫忙 pin 文件站的 IPFS 鏡像](../community/pin-ipfs-mirror.md)：用一個常駐的 IPFS 節點加排程腳本，替文件站多保存一份副本。
