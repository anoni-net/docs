---
title: OnionShare 更新日志
description: OnionShare 各版本更新的中文重点整理，从上游 changelog 与安全公告翻译而成，方便华语读者掌握安全修补与新功能。
icon: material/share-variant
digest:
  name: OnionShare
  devices: [windows, mac, linux]
  basis: 有安全修补就标为尽快
---

# :material-share-variant: OnionShare 更新日志

[OnionShare](../tools/onionshare.md) 的版本发布整理，从上游 changelog 与安全公告条列摘译。新版本永远在最上面。

OnionShare 的发版节奏比 Tor Browser 与 Tails 慢很多，2.6.3 到 2.6.4 之间隔了十五个月。长时间没有新版属于正常状态，重点放在每次发布的安全修补有没有打到自己的用法。

## 紧急程度怎么判断

- <span class="urg-tag urg-tag--soon">尽快</span>该版含安全修补。OnionShare 的服务在运行期间是对外可触及的，修补通常关系到谁读得到你分享的内容。
- <span class="urg-tag urg-tag--routine">一般</span>功能、依赖包与打包更新。

这一页的「尽快」涵盖所有安全修补，不分类别与严重度，筛选比 iOS 那几页宽。看到尽快时要自己读一下条目内容判断轻重。

发版节奏慢，目前没有出现过需要当天更新的等级，所以这一页还没有「立刻」。

## OnionShare 2.7

> 2026-10-16 · [上游发布页](https://github.com/onionshare/onionshare/releases/tag/v2.7){target="_blank"} · [GHSA-2pj7-hh2q-hjrh](https://github.com/onionshare/onionshare/security/advisories/GHSA-2pj7-hh2q-hjrh){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>补完 2.6.4 那个符号链接（symlink）修补漏掉的一条路径，影响 2.6.4 与 2.6.5，桌面版与 `onionshare-cli` 都受影响。安全公告只附了概念验证，没有提到已被实际利用。
- GHSA-2pj7-hh2q-hjrh 没有 CVE 编号，严重度评为中等（CVSS 4.8）。2.6.4 的 CVE-2026-54706 挡住了文件夹里的符号链接，分享内容只有单个文件时走的是另一条下载路径，那里没有检查。分享的那个文件本身是指向别处的符号链接时，获得 onion 地址的对方就能读到 OnionShare 进程读得到的任何本地文件。开发者附注，这需要用户分享错文件，或电脑已经遭到入侵才会发生。
- 新增下载模式，可以直接在 OnionShare 里下载别人用 OnionShare 分享的文件，不必另外打开 Tor Browser。
- 连接设置支持 WebTunnel 网桥（三种传输的差别见[抗审查传输更新日志](./anti-censorship.md)）。内置的 meek-azure 按上游改名为 meek。
- 接收模式可以设置上传大小的上限，分成单次上传与整段服务期间两种。开着接收模式等陌生人投递文件时，可以避免磁盘被塞满。
- Linux 与 macOS 上的本地网页服务器改用 UNIX socket，不再开 TCP 端口。发布说明没有交代改动的理由。内置 Tor 与 OnionShare 的缓存从 `~/.config` 搬到 `XDG_CACHE_HOME`。
- 内置的 tor 升到 0.4.9.14，验证 Tor 下载文件用的签名公钥也一并更新。修掉接收模式在自动停止的时间到了、大文件还在上传时抛出异常，以及大文件的压缩进度条数值溢出等问题。
- 支持的平台没有变动，仍是 Windows、macOS、Flatpak 与 Snap。

## OnionShare 2.6.5

> 2026-07-28 · [上游发布页](https://github.com/onionshare/onionshare/releases/tag/v2.6.5){target="_blank"}

- <span class="urg-tag urg-tag--routine">一般</span>依赖包更新，涵盖内置的 tor、Python 包与网页端依赖。这一级是给已经装了 2.6.4 的人看的。安全公告没有提到已被实际利用。
- 没有新功能与行为变更。还停在 2.6.3 或更早的人请视同「尽快」，因为升上来会一并带进 2.6.4 的两个安全修补，直接装 2.6.5 即可。

## OnionShare 2.6.4

> 2026-06-09 · [上游发布页](https://github.com/onionshare/onionshare/releases/tag/v2.6.4){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>修补两个安全问题，影响 2.6.3 与更早的版本，桌面版与 `onionshare-cli` 都受影响，两者共用同一份 web 模块。安全公告没有提到已被实际利用。
- CVE-2026-54706（[GHSA-22p9-r2f5-22mf](https://github.com/onionshare/onionshare/security/advisories/GHSA-22p9-r2f5-22mf){target="_blank"}）：分享模式与网站模式会跟着文件夹里的符号链接（symlink）走，把链接指向的文件一并提供出去。分享的文件夹里若有他人放进来或来源不明的符号链接，获得 onion 地址的对方就能读到 OnionShare 进程权限范围内的其他本地文件。严重度评为中等，利用前提是对方要先有办法把符号链接放进你分享的文件夹。
- CVE-2026-54707（[GHSA-v833-3823-cmhp](https://github.com/onionshare/onionshare/security/advisories/GHSA-v833-3823-cmhp){target="_blank"}）：接收模式勾选「停用文件上传」之后，限制没有落实到实际写文件那一段。发出特制的 multipart 请求仍会把文件写进磁盘，路由处理只是不把它计入上传记录。设置成纯文本消息端点的服务因此可能被写入非预期的文件。同一版顺手修掉空的 POST 请求会创建空文件夹的问题。
- 依赖包更新，包含内置的 tor 与 flatpak runtime。
- 连接 Tor 的等待期间改为显示不确定进度并提示用户，避免以为程序没有反应。

## OnionShare 2.6.3

> 2025-02-25 · [上游发布页](https://github.com/onionshare/onionshare/releases/tag/v2.6.3){target="_blank"}

- <span class="urg-tag urg-tag--routine">一般</span>CLI 新增 `--log-filenames`，分享模式与网站模式可以看到哪些网址被访问过。这一版没有安全修补。
- 保存下来的持久 onion 标签页，可在 OnionShare 启动并连上 Tor 之后自动开始服务。
- 修好无法获取网桥、无法使用 meek 传输的问题，以及网桥查询没有返回结果时的致命错误。
- 修好 CLI 关闭时线程竞争造成的 segfault，以及分享模式在有人访问过之后自动停止计时器失效的问题。
- 界面新增爱尔兰语、斯洛伐克语与泰米尔语，其他语言的翻译也有增补。
- 文档补齐配置文件各字段的说明，并加入用 systemd unit 维持持久 onion 的示例。
- 打包：snap 支持 Ubuntu 24.04 以上，修正 ARM64 的 flatpak 打包，armhf 因为取不到 PySide6 包暂停支持。

## OnionShare 2.6.2

> 2024-03-21 · [上游发布页](https://github.com/onionshare/onionshare/releases/tag/v2.6.2){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>全部是安全修补，集中在接收模式与聊天模式的输入处理。安全公告没有提到已被实际利用。
- 历史记录项目的路径移除换行字符。
- 接收模式的文本消息长度上限设为 524288 字符。
- 用户名只允许特定 ASCII 字符并移除控制字符，另补上名称验证的异常处理，避免无声加入聊天室。
- 收到 `disconnect` 事件时强制断开该用户的连接。
