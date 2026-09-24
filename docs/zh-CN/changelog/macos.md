---
title: macOS 安全更新
description: Mac 每次安全更新的白话整理，说明这次修了什么、需不需要马上更新，以及三条维护线各自的状态。
icon: material/apple
digest:
  name: macOS
  devices: [mac]
  basis: 依 Apple 是否标注已被利用分级
---

# :material-apple: macOS 安全更新

Mac 的安全更新整理。Apple 一次更新动辄上百个 CVE，逐条读完也很难判断该怎么做，所以这一页不做逐条翻译，只回答三个问题：需不需要马上更新、修补打到哪些常见的攻击路径、旧系统还收不收得到。新版本永远在最上面。

原始数据来自 Apple 的[安全更新发布页](https://support.apple.com/en-us/100100){target="_blank"}。判断方式与 [iOS 安全更新](./ios.md)那一页一致。

## 紧急程度怎么判断

- <span class="urg-tag urg-tag--now">立刻</span>Apple 在公告里标注该问题可能已被实际利用，或漏洞被美国 CISA 的已知遭利用漏洞目录收录。看到这一级，当天就更新。
- <span class="urg-tag urg-tag--soon">尽快</span>修补涵盖 WebKit 或 Kernel 的内存损坏类问题（程序写错内存位置，攻击者可以借此塞进自己的代码执行），或有取得 root 权限（系统的最高控制权）、绕过 Gatekeeper 与隐私偏好的项目。几天内更新。
- <span class="urg-tag urg-tag--routine">一般</span>其余修补，跟着平常的节奏更新即可。

颜色回答的是「该多快处理」。「有没有人已经在利用」是另一个维度，每一则条目都会写明。这一页的「立刻」需要证据，也就是 Apple 自己标注可能已被实际利用，或漏洞进了 CISA 的目录。

分级是社群志愿者读完公告后的整理，Apple 自己不做这种标示。判断不确定时以较高一级为准。

macOS 上特别值得留意的是绕过类问题。Gatekeeper 挡的是没有签名的程序，隐私偏好（系统设置里的访问权限）挡的是 app 读取屏幕、麦克风与文件。这两层被绕过时，界面上不会有任何异状。

## 三条维护线

Apple 同时维护最新版与前两代，安全修补三条线都发，但只有最新线拿得到新功能与完整的修补集。

| 线 | 版本号 | 状态 |
|---|---|---|
| Golden Gate | 27.x | 最新，修补最完整 |
| Tahoe | 26.x | 前一代，安全修补跟上 |
| Sequoia | 15.x | 再前一代，收到的修补数量最少 |

2026 年 9 月 14 日 Golden Gate 27 推出，三条线整个往后推一格。Sonoma 14.x 在那一轮没有对应版本，最后一次收到修补是 8 月 6 日的 14.8.9，看起来已经走到终点，下一轮才能确定。

同一天三条线一起发是常态，数量落差很正常，见下面 2026-07-27 那则的比较。硬件太旧升不上最新线的话，留在 Tahoe 或 Sequoia 仍然收得到安全修补。

## macOS Golden Gate 27（同日另有 Tahoe 26.7、Sequoia 15.8）

> 2026-09-14 · [Golden Gate 27 公告](https://support.apple.com/en-us/149035){target="_blank"} · [Tahoe 26.7 公告](https://support.apple.com/en-us/149042){target="_blank"} · [Sequoia 15.8 公告](https://support.apple.com/en-us/149043){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>年度大版本 Golden Gate 27 推出，三条线同日发出，分别补 210、153 与 154 个 CVE。Apple 没有标注任何一项已被实际利用。
- 绕过类问题是这一轮的主轴，正好是本页开头提醒要留意的那一类。Gatekeeper 的绕过 Golden Gate 27 有 6 个，落在 autofs、copyfile、Kernel、系统设置（两个）与 WebDAV。两条旧线各 4 个，autofs、copyfile 与 Kernel 三项共通，第四项 Tahoe 26.7 在 CoreServices、Sequoia 15.8 在 WebDAV。隐私偏好那一侧，三条线都有一个 CoreServices 的绕过，Golden Gate 27 另外修了 TCC 可被修改隐私偏好与 Accounts 绕过隐私偏好。
- 取得 root 权限的项目，Golden Gate 27 有 9 个、Tahoe 26.7 有 7 个、Sequoia 15.8 有 6 个。CUPS、Directory Utility、Disk Images、odproxyd、CoreServices 与 Kernel 三条线都有，Golden Gate 27 另外多一个 Bluetooth。autofs 那一个更值得注意，三条线也都有：控制了网络目录服务器的攻击者可以用 root 权限执行任意代码，接公司或学校网络磁盘的人优先处理。
- Kernel 是数量最大的一组，三条线分别占 33、27 与 29 个。CUPS 与 SMB 各有 8 到 10 个，那是打印与文件共享的服务，平常用不到就在系统设置里关掉，直接少掉一整组暴露面。
- 沙箱逃逸与沙箱限制绕过，Golden Gate 27 有 9 个、Tahoe 26.7 有 7 个、Sequoia 15.8 有 6 个，整轮出现的组件有 AppleMobileFileIntegrity、Archive Utility、Automator、iWork、libxpc 与 quarantine。Golden Gate 27 另有一个 MediaRemote，沙箱内的应用读得到系统钥匙串。
- 三份清单不是单纯的包含关系。Tahoe 26.7 有 4 个、Sequoia 15.8 有 11 个没有出现在 Golden Gate 27 的清单里。
- 跟踪类的修补与 iOS 那一侧重叠。三条线都有的是 AuthKit 的常驻账号标识符、NetworkExtension 可以查出你装了哪些其他应用、Symptom Framework 可以判定用户当前的位置。App Store 的标识符问题只出现在 Golden Gate 27 与 Tahoe 26.7，Sandbox Profiles 的用户指纹识别只出现在 Golden Gate 27。逐项说明写在 [iOS 安全更新](./ios.md)。

## macOS Tahoe 26.6.2

> 2026-08-17 · [上游公告](https://support.apple.com/en-us/148281){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>28 个修补，其中 19 个在 WebKit，多数是处理恶意网页内容造成的内存损坏或崩溃。Apple 没有标注任何一项已被实际利用。
- ImageIO 有一个「处理图像可能导致任意代码执行」，这一类常被用在传一张图过去就能触发的攻击。
- Kernel 有 3 个、IOGPUFamily 有 1 个。这一波只发给 Tahoe，Sequoia 与 Sonoma 没有对应版本。

## macOS Tahoe 26.6.1、Sequoia 15.7.9、Sonoma 14.8.9

> 2026-08-06 · [26.6.1 公告](https://support.apple.com/en-us/148170){target="_blank"} · [15.7.9 公告](https://support.apple.com/en-us/148171){target="_blank"} · [14.8.9 公告](https://support.apple.com/en-us/148172){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>三条线同时发，各自只修一个问题。单一修补动用三条线，代表 Apple 认为不能等到下次排程。Apple 没有标注任何一项已被实际利用。
- CVE-2026-65400：同一网络上的攻击者可以在没有有效凭证的情况下通过屏幕共享（Screen Sharing）的验证。成因是验证流程的状态管理问题。
- 有开启屏幕共享的人优先处理。系统设置里的「通用」、「共享」可以确认自己有没有开，平常用不到就关掉，那是最直接的处理方式。

## macOS Tahoe 26.6、Sequoia 15.7.8、Sonoma 14.8.8

> 2026-07-27 · [26.6 公告](https://support.apple.com/en-us/128067){target="_blank"} · [15.7.8 公告](https://support.apple.com/en-us/128071){target="_blank"} · [14.8.8 公告](https://support.apple.com/en-us/128072){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>年度最大的一波，Tahoe 补 153 个、Sequoia 138 个、Sonoma 127 个。三条线的数量落差就是旧线收到的修补比较少的具体证据。Apple 没有标注任何一项已被实际利用。
- Kernel 是重点，Tahoe 占 27 个、Sequoia 21 个、Sonoma 20 个。
- Accounts 有一个 app 可能取得 root 权限。Assets 有一个恶意应用程序可以绕过隐私偏好，也就是不必经过你同意就取得原本要授权的权限。
- AppleDouble 处理恶意文件时可能导致应用程序异常退出，或是被执行任意代码。Model I/O 与 HFS 各有多个文件解析类的问题，这一类的触发方式通常是打开一个别人给的文件。

## macOS Tahoe 26.5.2

> 2026-06-29 · [上游公告](https://support.apple.com/en-us/127595){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>38 个修补里有 24 个在 WebKit、4 个在 WebRTC，整包几乎都是浏览器引擎。Apple 没有标注任何一项已被实际利用。
- 影响范围不只 Safari。系统上任何用 WebView 显示网页内容的 app 都走同一套引擎，包含邮件预览与许多聊天软件的内置浏览器。

## macOS Tahoe 26.5

> 2026-05-11 · [上游公告](https://support.apple.com/en-us/127115){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>87 个修补，WebKit 占 22 个、Kernel 占 9 个。Apple 没有标注任何一项已被实际利用。
- CUPS 有一个 app 可能取得 root 权限。CUPS 是打印系统，平常不会想到它，而它默认就在运行。
- BOM 有一个恶意的 ZIP 压缩文件可以绕过 Gatekeeper 检查。解压别人寄来的文件是很日常的动作，这条值得知道。
- Accounts 有一个绕过部分隐私偏好的问题，mDNSResponder 有 4 个。
