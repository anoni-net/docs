---
title: macOS 安全更新
description: Mac 每次安全更新的白话整理，说明这次修了什么、需不需要马上更新，以及三条维护线各自的状态。
icon: material/apple
---

# :material-apple: macOS 安全更新

Mac 的安全更新整理。Apple 一次更新动辄上百个 CVE，逐条读完也很难判断该怎么做，所以这一页不做逐条翻译，只回答三个问题：需不需要马上更新、修补打到哪些常见的攻击路径、旧系统还收不收得到。新版本永远在最上面。

原始数据来自 Apple 的[安全更新发布页](https://support.apple.com/en-us/100100){target="_blank"}。判断方式与 [iOS 安全更新](./ios.md)那一页一致。

## 紧急程度怎么判断

- <span class="urg-tag urg-tag--now">立刻</span>Apple 在公告里标注该问题可能已被实际利用，或漏洞被美国 CISA 的已知遭利用漏洞目录收录。看到这一级，当天就更新。
- <span class="urg-tag urg-tag--soon">尽快</span>修补涵盖 WebKit 或 Kernel 的内存损坏类问题，或有取得 root 权限、绕过 Gatekeeper 与隐私偏好的项目。几天内更新。
- <span class="urg-tag urg-tag--routine">一般</span>其余修补，跟着平常的节奏更新即可。

分级是社群志愿者读完公告后的整理，Apple 自己不做这种标示。判断不确定时以较高一级为准。

macOS 上特别值得留意的是绕过类问题。Gatekeeper 挡的是没有签名的程序，隐私偏好（系统设置里的访问权限）挡的是 app 读取屏幕、麦克风与文件。这两层被绕过时，界面上不会有任何异状。

## 三条维护线

Apple 同时维护最新版与前两代，安全修补三条线都发，但只有最新线拿得到新功能与完整的修补集。

| 线 | 版本号 | 状态 |
|---|---|---|
| Tahoe | 26.x | 最新，修补最完整 |
| Sequoia | 15.x | 前一代，安全修补跟上 |
| Sonoma | 14.x | 再前一代，收到的修补数量最少 |

同一天三条线一起发是常态，数量落差很正常，见下面 2026-07-27 那则的比较。硬件太旧升不上 Tahoe 的话，留在 Sequoia 或 Sonoma 仍然收得到安全修补，但要注意 Sonoma 这条线再过一轮就会停止支持。

## macOS Tahoe 26.6.2

> 2026-08-17 · [上游公告](https://support.apple.com/en-us/148281){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>28 个修补，其中 19 个在 WebKit，多数是处理恶意网页内容造成的内存损坏或崩溃。
- ImageIO 有一个「处理图像可能导致任意代码执行」，这一类常被用在传一张图过去就能触发的攻击。
- Kernel 有 3 个、IOGPUFamily 有 1 个。这一波只发给 Tahoe，Sequoia 与 Sonoma 没有对应版本。

## macOS Tahoe 26.6.1、Sequoia 15.7.9、Sonoma 14.8.9

> 2026-08-06 · [26.6.1 公告](https://support.apple.com/en-us/148170){target="_blank"} · [15.7.9 公告](https://support.apple.com/en-us/148171){target="_blank"} · [14.8.9 公告](https://support.apple.com/en-us/148172){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>三条线同时发，各自只修一个问题。单一修补动用三条线，代表 Apple 认为不能等到下次排程。
- CVE-2026-65400：同一网络上的攻击者可以在没有有效凭证的情况下通过屏幕共享（Screen Sharing）的验证。成因是验证流程的状态管理问题。
- 有开启屏幕共享的人优先处理。系统设置里的「通用」、「共享」可以确认自己有没有开，平常用不到就关掉，那是最直接的处理方式。

## macOS Tahoe 26.6、Sequoia 15.7.8、Sonoma 14.8.8

> 2026-07-27 · [26.6 公告](https://support.apple.com/en-us/128067){target="_blank"} · [15.7.8 公告](https://support.apple.com/en-us/128071){target="_blank"} · [14.8.8 公告](https://support.apple.com/en-us/128072){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>年度最大的一波，Tahoe 补 153 个、Sequoia 138 个、Sonoma 127 个。三条线的数量落差就是旧线收到的修补比较少的具体证据。
- Kernel 是重点，Tahoe 占 27 个、Sequoia 21 个、Sonoma 20 个。
- Accounts 有一个 app 可能取得 root 权限。Assets 有一个恶意应用程序可以绕过隐私偏好，也就是不必经过你同意就取得原本要授权的权限。
- AppleDouble 处理恶意文件时可能导致应用程序异常退出。Model I/O 与 HFS 各有多个文件解析类的问题，这一类的触发方式通常是打开一个别人给的文件。

## macOS Tahoe 26.5.2

> 2026-06-29 · [上游公告](https://support.apple.com/en-us/127595){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>38 个修补里有 24 个在 WebKit、4 个在 WebRTC，整包几乎都是浏览器引擎。
- 影响范围不只 Safari。系统上任何用 WebView 显示网页内容的 app 都走同一套引擎，包含邮件预览与许多聊天软件的内置浏览器。

## macOS Tahoe 26.5

> 2026-05-11 · [上游公告](https://support.apple.com/en-us/127115){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>87 个修补，WebKit 占 22 个、Kernel 占 9 个。
- CUPS 有一个 app 可能取得 root 权限。CUPS 是打印系统，平常不会想到它，而它默认就在运行。
- BOM 有一个恶意的 ZIP 压缩文件可以绕过 Gatekeeper 检查。解压别人寄来的文件是很日常的动作，这条值得知道。
- Accounts 有一个绕过部分隐私偏好的问题，mDNSResponder 有 4 个。
