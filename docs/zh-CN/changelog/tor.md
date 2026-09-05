---
title: Tor 更新日志
description: Tor Browser、Tor daemon 与 Onion 服务各版本更新的中文重点整理，从上游 changelog 翻译而成，方便华语读者掌握每次发布的关键变更与安全修补。
icon: simple/torbrowser
---

# :simple-torbrowser: Tor 更新日志

[Tor Browser](../tools/what-is-tor.md)、Tor daemon 与 Onion 服务的版本更新整理。新版本永远在最上面，每个条目附「完整翻译文章」链接。

## 两个发布通道

- <span class="chan-tag chan-tag--stable">稳定版</span>一般用户用这个，版本号形如 15.0.20。
- <span class="chan-tag chan-tag--alpha">Alpha</span>仅供测试，可能含影响可用性、安全与隐私的错误，版本号带 a（例如 16.0a10）。需要强匿名保护的人不要用。

Alpha 从 16.0a6（2026 年 5 月）起改以 Firefox beta 为基底，逐版小步 rebase。追的那条 beta 线在 7 月成为新的 Firefox ESR 153，所以 16.0a9 之后的版号标示又回到 esr，那是同一条线的延续，不是换回旧基底。稳定版几乎每次发布都带 Firefox 或 tor daemon 的安全修补，看到新版就更新即可。Firefox 从 2026 年 9 月起改为两周发布一次，Tor Browser 跟着改，稳定版的更新会比过去更密。

## Tor Browser 16.0a11（Alpha 测试通道）

> 2026-09-02 · [上游公告](https://blog.torproject.org/new-alpha-release-tor-browser-160a11/){target="_blank"}

- <span class="chan-tag chan-tag--alpha">Alpha</span>Alpha 通道仅供测试，一般用户请继续用稳定版（15.x）。
- Firefox 基底 rebase 至 153.2.0esr（tor-browser#45254），Android 版 GeckoView 同步，并从 Firefox 155 backport 安全修补（tor-browser#45259）。
- Android 版一律启用本地网络访问（Local Network Access，LNA）限制，作为纵深防御（tor-browser#44155）。开启后网页不能直接连向局域网或本机地址，少掉一条探测同一个网络内其他设备的路。
- TorConnect 的重定向改由父进程处理（tor-browser#45264），与稳定版 15.0.21 是同一项修正。
- 构建流程改从 gcc.gnu.org 取得 GCC 源码（tor-browser-build#41860），构建工具链的 Go 升至 1.26.8。

## Tor Browser 15.0.21

> 2026-09-01 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15021/){target="_blank"}

- <span class="chan-tag chan-tag--stable">稳定版</span>以 Firefox 安全修补为主的小版本。
- Firefox 基底 rebase 至 140.15.0esr（tor-browser#45253），Android 版 GeckoView 同步，并从 Firefox 155 backport 安全修补（tor-browser#45259）。
- 修好在非隐私浏览模式启动浏览器时 `about:torconnect` 不显示的问题（tor-browser#45223）。TorConnect 的重定向改由父进程处理（tor-browser#45264）。
- NoScript 升至 13.6.32.1984，OpenSSL 升至 3.5.8，构建工具链的 Go 升至 1.25.14。
- 上游把 32 位 Linux 的提示改成版本过期消息，跟踪项目写明这是 15.0 系列的最后一版（tor-browser#44996）。16.0 稳定版依 16.0a9 公告的规划在 9 月接手，还在 15.x 的人可以准备换过去。

## Tor Browser 16.0a10（Alpha 测试通道）

> 2026-08-27 · [上游公告](https://blog.torproject.org/new-alpha-release-tor-browser-160a10/){target="_blank"}

- <span class="chan-tag chan-tag--alpha">Alpha</span>Alpha 通道仅供测试，一般用户请继续用稳定版（15.x）。
- 新增「使用通用窗口标题」选项，在设置的隐私与安全、高级设置、防范第三方应用程序那一组，开启后所有窗口标题一律显示 Tor Browser Alpha。窗口标题默认跟着网页的 title 变动，操作系统与其他程序不需特殊权限就读得到，可以当成侧录浏览记录的旁路通道。此功能已上游进 Firefox，一般 Firefox 用户可在 `about:config` 把 `privacy.exposeContentTitleInWindow` 与 `privacy.exposeContentTitleInWindow.pbm` 设为 false。官方原本希望 16.0 稳定版就默认开启，顾虑无障碍软件与非标准桌面环境的兼容性，改为先开放测试。
- 桌面版内置手册改版，把更新过的官方说明内容打包进浏览器取代旧版手册，地址栏输入 `about:manual` 可直接打开，界面上的「Learn more」也都指向新版。
- 设置页改用 Mozilla 的新版 `about:preferences` 设计并默认启用，连接、letterboxing、安全等级等自定义项目都已搬到新版面。
- Firefox 基底 rebase 至 153.1.0esr（tor-browser#45205），并从 Firefox 154 backport 安全修补（tor-browser#45219）。
- 停用以语系为基础的字体规则，作为浏览器指纹的纵深防御（tor-browser#44257）。
- NoScript 升至 13.6.31.90301984，OpenSSL 升至 3.5.8。
- tor daemon 崩溃时，`about:torconnect` 会显示错误信息（tor-browser#43570）。网桥连接失败时也会更新网桥设置的显示（tor-browser#43939）。

## Tor Browser 15.0.20

> 2026-08-18 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15020/){target="_blank"}

- <span class="chan-tag chan-tag--stable">稳定版</span>以 Firefox 安全修补为主的小版本。
- Firefox 基底 rebase 至 140.14.0esr（tor-browser#45204），桌面版与 Android 版 GeckoView 同步升至 140.14.0esr。
- 从 Firefox 154 backport 安全修补（tor-browser#45219）。
- libevent 升至 2.1.13（tor-browser-build#41839）。
- 构建工具链的 Go 升至 1.25.13（Windows、Linux、Android）。
- 更新构建流程的 torbrowser.gpg keyring，加入新子密钥并调整主密钥到期日（tor-browser-build#41850）。

## Tor Browser 16.0a9（Alpha 测试通道）

> 2026-07-23 · [上游公告](https://blog.torproject.org/new-alpha-release-tor-browser-160a9/){target="_blank"}

- <span class="chan-tag chan-tag--alpha">Alpha</span>Alpha 通道仅供测试，一般用户请继续用稳定版（15.x）。
- Firefox 基底大幅 rebase 至 153.0esr（前一版为 140.0esr），Android 版 GeckoView 同步升至 153.0esr（tor-browser#45101）。
- 官方宣布 Alpha 通道日后改为持续追踪 Firefox beta 版本、逐步小步 rebase，取代过去一次跳过整年版本的做法，目标让 16.0 稳定版于 9 月提前发布。
- NoScript 升至 13.6.30.90201984，构建工具链的 Go 升至 1.26.5，libevent 升至 2.1.13。
- 追踪用途的依赖仅剩 Mozilla Telemetry（默认停用）。
- 已知问题：部分画面仍残留 Firefox 品牌图示。Android 版网址栏图示目前一律显示「不安全」，需手动点击查验证书。

## Tor Browser 15.0.19

> 2026-07-21 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15019/){target="_blank"}

- <span class="chan-tag chan-tag--stable">稳定版</span>以 Firefox 安全修补为主的小版本，带入来自 Firefox 的重要安全更新。
- Firefox 基底 rebase 至 140.13.0esr（tor-browser#45117），桌面版与 Android 版 GeckoView 同步升至 140.13.0esr。
- 从 Firefox 153 backport 安全修补（tor-browser#45124）。
- NoScript 升至 13.6.31.1984。
- 还原先前 Funding the Commons 相关的实现变更（tor-browser#44748）。

## Tor Browser 15.0.18

> 2026-07-14 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15018/){target="_blank"}

- <span class="chan-tag chan-tag--stable">稳定版</span>以 Firefox 安全修补为主的小版本。
- Firefox 基底维持 140.12.0esr，改以 cherry-pick 带入 firefox/esr140 分支的后续修补（tor-browser#45111），未做 rebase。
- NoScript 升至 13.6.30.1984，构建工具链的 Go 升至 1.25.12（Windows、Linux、Android）。
- 构建流程更新 boklm 的 GPG 子密钥（tor-browser-build#41821）。

## Tor Browser 16.0a8（Alpha 测试通道）

> 2026-07-02 · [上游公告](https://blog.torproject.org/new-alpha-release-tor-browser-160a8/){target="_blank"}

- <span class="chan-tag chan-tag--alpha">Alpha</span>Alpha 通道仅供测试，可能含影响可用性、安全与隐私的错误，一般用户请继续用稳定版（15.x）。
- 重要的 Firefox 安全更新，rebase 至 Firefox 152.0a1（前一个 Alpha 16.0a7 为 151.0a1），Android 版 GeckoView 同步升至 152.0a1。
- tor 客户端升至 0.4.9.11、NoScript 升至 13.6.25.90301984、OpenSSL 升至 3.5.7、构建工具链的 Go 升至 1.26.4。
- 修补跨站 oracle 漏洞，Safer Mode 下拒绝 worklet。16.0 系列停用 XSLT。
- 桌面版停用 IP Protection，并修正 letterboxing 背景显示与 Firefox 152 rebase 后的多项 regression。Android 版在 Tor connection assist 加入常用区域、移除默认浏览器功能，omni.ja 改用 xz 压缩。

## Tor Browser 15.0.17

> 2026-06-28 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15017/){target="_blank"}

- <span class="chan-tag chan-tag--stable">稳定版</span>以 tor 安全更新为主的小版本，未变动 Firefox 基底。
- tor 客户端升至 0.4.9.11，NoScript 升至 13.6.25.1984。
- 构建流程更新 boklm 的 GPG 子密钥与 morgan 的续期密钥（tor-browser-build#41821、#41827）。

## Tor Browser 15.0.16

> 2026-06-17 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15016/){target="_blank"}

- <span class="chan-tag chan-tag--stable">稳定版</span>重要的 Firefox 安全更新。
- rebase 至 Firefox 140.12.0esr（tor-browser#45046），backport 自 Firefox 152 的安全修补（tor-browser#45054），Android 版 GeckoView 同步升至 140.12.0esr。
- NoScript 升至 13.6.24.1984，修正前一版 13.6.19.902 在 DocStartInjection 上的 regression（tor-browser#45044），OpenSSL 升至 3.5.7。
- 签章流程移除对 tor daemon 的依赖（tor-browser-build#41802），构建工具链的 Go 升至 1.25.11。

## Tor Browser 15.0.15

> 2026-06-03 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15015/){target="_blank"}

- <span class="chan-tag chan-tag--stable">稳定版</span>tor daemon 重要安全更新，修正部分审查规避问题。
- tor 客户端升至 0.4.9.9，NoScript 升至 13.6.20.1984。
- Moat 模块支持设置多组 (front, reflector) domain fronting 配对（tor-browser#42436）。
- 修正桌面版 Captcha 无法运行的问题（tor-browser#44997），并通知 Linux i686 用户不再提供更新（tor-browser#44886）。

## Tor Browser 16.0a7（Alpha 测试通道）

> 2026-06-03 · [dist 目录](https://dist.torproject.org/torbrowser/16.0a7/){target="_blank"}

- <span class="chan-tag chan-tag--alpha">Alpha</span>Alpha 通道仅供测试，一般用户请继续用稳定版（15.x）。已在 dist 提供二进制文件，官方博客尚未发布对应公告。改以 Firefox 151.0a1 为基础（前一个 Alpha 16.0a6 为 150.0a1）。

!!! info "更早的 Tor Browser 版本"

    Tor Browser 15.0.14、15.0.13、16.0a6（Alpha 测试通道）、15.0.12、15.0.11 等条目目前仅在 [正体中文版](https://anoni.net/docs/changelog/tor/){target="_blank"} 提供，简体中文版会随社群翻译滚动补上。

    更多 Tor 相关翻译保留在 [近期公告](../blog/index.md)，包括：

    - [Onionmasq 流量隔离实验](../blog/posts/tor-sambent-onionmasq.md)
    - [oniux 内核层级 Tor 隔离技术](../blog/posts/oniux-kernel-level-tor.md)
    - [Cure53 完成 Tor VPN 安全审计](../blog/posts/2026-code-audit-for-tor-vpn-completed-by-cure53.md)
