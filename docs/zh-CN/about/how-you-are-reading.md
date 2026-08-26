---
title: 你正在用哪一种方式阅读
description: 文档站同时发布在标准网站、Tor Onion 与 IPFS。三份内容一样，送到你面前的路径不一样，过程中谁看得到什么也不一样。
icon: material/routes
---

# :material-routes: 你正在用哪一种方式阅读

文档站同时发布成三份，内容完全一样。差别在内容怎么送到你面前，以及过程中谁看得到什么。页首右上角的小标记会告诉你手上这一份是哪一种，标准网站不挂标记。

## 三种方式对照

| | 标准网站 | Onion | IPFS 镜像 |
|---|---|---|---|
| 地址 | `anoni.net/docs` | `docs.…onion` | `ipfs.anoni.net` 或其他网关 |
| 谁看得到你的 IP | 我们的 CDN 与主机 | 没有人 | 你连上的网关运营方 |
| 谁知道你读了哪几页 | 同上 | 没有人 | 同上 |
| 你的网络运营商看得到 | 你连了 anoni.net | 你在用 Tor | 你连了那个网关 |
| 网站被下架时 | 读不到 | 不受影响 | 不受影响 |
| 需要什么 | 一般浏览器 | Tor Browser | 一般浏览器 |
| 离线阅读 | 提供 | 不提供 | 不提供 |
| 流量统计 | 有 | 没有 | 没有 |

## 标准网站

走一般的网络连到 `anoni.net`，速度最快，功能最完整，[离线阅读](../offline.md) 只有这一版提供。

代价是我们的 CDN 与主机看得到你的 IP，站上也有一份不记录个人身份的流量统计。域名被封锁或被处理的时候，这一版就读不到了。

## Onion

网站直接运作在 Tor 网络里。访客与网站互相看不到 IP，中间不经过 DNS，也没有证书颁发机构。你的网络运营商只看得到你在用 Tor，看不到你连了哪个站、读了哪一页。

`.onion` 地址没有证书颁发机构背书，核对地址本身就是唯一的验证手段。完整地址印在每一页的页尾，拿它跟地址栏比对，对得上就是我们的站。这一步值得养成习惯，因为相似地址的钓鱼站是真实存在的手法。

这一版不加载任何分析脚本，也不注册后台的 Service Worker，所以没有离线阅读。延迟比标准网站高，那是 Tor 的常态。

## IPFS 镜像

内容用指纹（CID）寻址，任何节点都能提供同一份内容，没有单一可以被下架的位置。社群成员可以帮忙留存一份，做法见 [帮忙 pin 文档站的 IPFS 镜像](../community/pin-ipfs-mirror.md)。

要注意的是走 IPFS 读不会让连接变匿名。你用的是一般浏览器连到一台网关，那台网关看得到你的 IP 与你请求的每一个地址，在网络上你看起来就是一个普通的 HTTPS 客户端。想同时要抗下架与连接匿名，用 Tor Browser 打开 Onion 版。

完整的暴露面说明见 [常被误认为匿名的网络](../advanced/mistaken-for-anonymity.md)，发布端的设计取舍见 [去中心化网站发布](../advanced/dweb-ipfs-onion.md)。

## 怎么选

平常阅读用标准网站就好。

在意连接被看到，或者人在会被监看的网络环境，用 Onion 版。

标准网站连不上而手边没有 Tor Browser 的时候，IPFS 镜像是读得到内容的备援。别把它当成匿名手段。

## :fontawesome-solid-diagram-project: 相关阅读

<div class="grid cards" markdown>

- [:material-web-box: 去中心化网站发布](../advanced/dweb-ipfs-onion.md)
- [:material-incognito: 常被误认为匿名的网络](../advanced/mistaken-for-anonymity.md)
- [:simple-ipfs: 帮忙 pin 文档站的 IPFS 镜像](../community/pin-ipfs-mirror.md)
- [:material-download: 离线阅读](../offline.md)

</div>
