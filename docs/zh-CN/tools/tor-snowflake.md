---
title: Tor Snowflake
description: 通过 WebRTC 伪装为视频通信方式协助建立桥接点
icon: material/snowflake
---
# :material-snowflake: Tor Snowflake 桥接点建立（网页版）

直接通过网页的方式建立 Tor 桥接点，只需要一步「启用」，即可帮助无法通过传统的 Tor 连接方式建立 onion 连接。

!!! warning "香港读者：参与前请先评估风险"

    Snowflake 会让你的浏览器暂时变成替他人转发 Tor 流量的桥接点。在香港，2020 年《国安法》与 2026 年 3 月生效的装置解密义务（持令状调查国安案件时可要求交出装置密码，拒绝最高可判一年徒刑）之下[^hk]，一旦装置被搜查，「为什么你的浏览器在帮审查地区的人连接 Tor」本身可能引来额外关注。技术上合法、可用，但请先按自身所在地区评估风险，可参考 [VPN 的风险与选择](./vpn-guide.md)。

## 启动 Snowflake 桥接点

<div class="grid cards" markdown>

-   <iframe src="https://snowflake.torproject.org/embed.html" width="100%" height="250" frameborder="0" scrolling="no"></iframe>

-   
    - 请直接点击「启动」按钮。
    - 此页面可放置在标签页后台中运行。
    - 如果启动后没有正常运作，请检查是否启用了 WebRTC 功能，理论上可以建立视频会议的浏览器都支持。
    - 可通过浏览器插件安装，详情请参考[官方页面](https://snowflake.torproject.org/zh-CN/){target="_blank"}说明。

</div>

## 常见问题

### 什么是 Snowflake？

Tor Snowflake 是一种用于 Tor 网络的桥接技术，主要帮助用户绕过互联网审查。通过全世界志愿者使用 WebRTC 通讯建立临时的点对点连接，使被封锁或受限的用户能够访问被阻挡的网站和服务。

### Snowflake 如何运作？

Snowflake 使用一种叫做 WebRTC 的技术，这项技术通常被应用在视频会议软件中。它的运作方式是让你的 Tor 使用看起来像是在进行音频或视频通话，以此方式来掩盖并避开网络审查。

### 我可以使用浏览器扩展来绕过审查吗？

如果你想绕过审查，你需要下载一个使用 Tor 技术的应用程序，如 Tor Browser 或 Orbot。如果应用程序无法连接，并且看起来连接仍然被阻挡，你可以到应用程序的设置中，启用 Snowflake 来协助解封。

[^hk]: 香港 2026 年 3 月生效的装置解密义务见 [Hong Kong introduces new requirement for national security suspects to hand over passwords](https://hongkongfp.com/2026/03/23/hong-kong-introduces-offence-requiring-national-security-suspects-to-hand-over-passwords/){target="_blank"} - HKFP。
