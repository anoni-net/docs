---
title: RSS 订阅入门
description: 不需要账号、按发布时间排列、订阅列表留在自己设备上的网站追踪方式。阅读器的选择、订阅步骤、经由 Tor 读取、接入团队聊天工具，以及 anoni.net 各站的 feed 网址。
icon: material/rss
---

# :material-rss: RSS 订阅入门

想追踪一个网站的新文章，常见的做法是关注它的社交媒体账号，或订阅电子报。关注社交媒体账号要先有平台账号，看得到哪几篇由算法决定。订阅电子报要交出 email 地址。RSS 让你把想追踪的网站加进一个阅读器，新文章按发布时间出现在同一个地方，不必注册账号，订了哪些网站也只记在自己的设备上。

anoni.net 的文档站、软件更新日志与新闻导读都提供 RSS。直接点开网页上的 RSS 链接，多半只会看到一整页代码，因为那份文件是给阅读器读的。装好阅读器、贴上网址之后，新文章就会自动出现。

!!! tip "时间有限的话，先看这几点"

    - 先装一个阅读器：Android 用 Feeder，iPhone、iPad 与 Mac 用 NetNewsWire，电脑用 Thunderbird 或 Fluent Reader
    - 在阅读器里添加订阅，贴上 feed 网址（[本页最后](#anoninet-的-feed-网址)有 anoni.net 的列表）
    - 选不必登录的本地阅读器，订阅列表只留在自己的设备上
    - 不想让网站看到自己的 IP，可以经由 Tor 读取 onion 版本的 feed
    - 团队可以把 feed 接入 Slack、Matrix 这类聊天工具，代价是订阅列表交给平台或机器人

## RSS 的运作方式

网站把最新文章的标题、摘要或全文整理成一份固定网址的文件，称为 feed。阅读器每隔一段时间读取一次这份文件，发现新文章就放进你的列表。整个过程由阅读器单方向读取，网站无法主动推送内容给你，也不会取得你的联系方式。

Atom 与 JSON Feed 是同一类的格式，常见的阅读器都能读取，本页统称 RSS。

## RSS 的隐私取舍

### 与社交平台、电子报的差别

关注社交媒体账号时，平台知道你关注了谁、在哪一条帖子停留多久，这些记录会用在排序与广告投放（细节见[社群平台怎么收集你的数据](../basics/platform-tracking.md)）。订阅电子报要交出 email，许多电子报服务还会在邮件里放追踪图片，记录你何时打开邮件。RSS 阅读器没有账号，网站端看到的是某个 IP 定时来读取一份文件。

### 网站仍然看得到的部分

阅读器每次读取 feed，网站与网站前面的 CDN 都看得到连接的 IP、时间，以及阅读器的名称与版本，跟用浏览器打开一个网页相同。文章里的图片在阅读器显示时另外下载，也会留下连接记录。点进原文网页就是一般的浏览，网页上的分析工具照样会加载。

不想让网站看到自己的 IP，可以[经由 Tor 读取](#经由-Tor-读取)。

### 本地阅读器与云端阅读器

Inoreader、Feedly 这类云端阅读器由服务商的服务器代你读取 feed，好处是多台设备之间同步已读状态，网站端看到的也是服务商的服务器。代价是你订了哪些网站、读了哪几篇，服务商全部知道，而且都记在你的账号下。本地阅读器把订阅列表与已读记录存在设备上，换成网站端看得到你的 IP。

订阅列表看得出你关心哪些议题、用哪些设备与软件。例如按设备订阅软件更新日志，列表上就写着你用的是 iPhone 还是 Android、有没有在用 Tails。交给云端服务商之前，先想过一次这份列表的敏感程度。

## 阅读器的选择

下面几个阅读器都是开源软件，免费，不必注册账号就能使用，最近一年内都有新版本发布：

- Android：[Feeder](https://github.com/spacecowboy/Feeder){target="_blank"}，有简体中文界面。中国大陆无法直接使用 Google Play，可以从 [F-Droid](https://f-droid.org/packages/com.nononsenseapps.feeder/){target="_blank"} 或 [GitHub 的发布页](https://github.com/spacecowboy/Feeder/releases){target="_blank"}下载 APK
- iPhone、iPad、Mac：[NetNewsWire](https://netnewswire.com/){target="_blank"}，界面只有英文，从 App Store 安装
- Windows、Mac、Linux：[Thunderbird](https://www.thunderbird.net/zh-CN/){target="_blank"} 或 [Fluent Reader](https://hyliu.me/fluent-reader/){target="_blank"}，两者都有简体中文界面

Thunderbird 原本是邮件软件，已经在用它收邮件的人不必另外安装。Fluent Reader 专门用来读 RSS，版面接近新闻 App。NetNewsWire 默认把订阅存在设备上，设置里另有 iCloud 同步，开启之后订阅列表会存到 iCloud。

Inoreader 在 2017 年从中国区 App Store 下架，2020 年又轮到 Reeder 与 Fiery Feeds，当时 Feedly 在中国区也已经无法下载（见 [TechCrunch 的报道](https://techcrunch.com/2020/09/30/apple-removes-two-rss-feed-readers-from-china-app-store/){target="_blank"}）。NetNewsWire 在 2026 年 9 月仍可以从中国区下载，之后找不到的话，改用其他地区的 Apple 账号，或换用电脑版的阅读器。

## 订阅的步骤

各阅读器的按钮位置不同，步骤相近：

1. 复制 feed 网址。可以从[本页最后的列表](#anoninet-的-feed-网址)复制，或在网页的 RSS 链接上按右键、选「复制链接」
2. 在阅读器里找到添加订阅的地方，贴上网址。Feeder 是「添加订阅源」，Fluent Reader 在「管理订阅源」里添加。NetNewsWire 在 iPhone 与 iPad 上按 `+` 选「Add Feed」，在 Mac 上用菜单的「New Feed…」
3. 阅读器读到 feed 之后会列出网站名称与最近的文章，确认后加入

有些阅读器也接受网站首页的网址，会自动找出 feed 的位置。找不到的话，改贴 feed 网址。

### Thunderbird

Thunderbird 要先建立一个收取点账户，之后的订阅都放在这个账户下：

1. 右上角的应用程序菜单，选「添加账户」、「收取点」，取一个名称完成建立
2. 在左侧点选刚建立的账户，右侧的账户页点「管理收取点订阅」
3. 在「收取点网址」栏位贴上网址，按「添加」

## 经由 Tor 读取

anoni.net 的每一份 feed 都有 onion 版本（网址在[本页最后的列表](#anoninet-的-feed-网址)）。经由 Tor 读取 onion 版本时，网站端看不到你的 IP，你的网络运营商也只看得到你在使用 Tor。所在的网络封锁了 anoni.net 的话，onion 版本的 feed 照样可以读取。在中国大陆，Tor 本身也被封锁，Tor Browser 要先设置网桥才能连上（见[中继点与桥接点](./what-is-tor.md#中继点与桥接点)）。

阅读器需要支持 SOCKS 代理才能经由 Tor 连接。Thunderbird 的设置方式：

1. 开着 Tor Browser，它会在本机的 `127.0.0.1:9150` 提供 Tor 连接
2. 打开 Thunderbird 的「设置」、「常规」，拉到最下方的网络区块，按「设置…」
3. 选「手动配置代理」，「SOCKS 主机」填 `127.0.0.1`、「端口」填 `9150`，选 SOCKS v5，并勾选让 DNS 查询也经由 SOCKS v5 代理的选项。没有勾选的话，onion 网址会无法连接

代理设置对整个 Thunderbird 生效。同一个 Thunderbird 也用来收邮件的话，邮件同样会经由 Tor 连接，有些邮件服务会因此要求额外验证或拦下登录。只想让 RSS 经由 Tor，可以另外建立一个专门读 RSS 的 Thunderbird 配置文件（profile）。关掉 Tor Browser 之后，这个设置下的 Thunderbird 会无法连接。

Tor 本身的介绍见[什么是 Tor](./what-is-tor.md)。

## 团队一起收

组织常用的聊天工具多半也能订阅 RSS，新文章会自动贴进指定的频道。一个人设置一次，频道里的成员都能收到，其他人不必另外安装阅读器。

接入聊天工具之后，实际读取 feed 的换成平台的服务器或第三方机器人，对方也就知道这个团队订了哪些来源。按设备订阅软件更新日志的团队，等于把团队用哪些设备与软件交给对方。下面按订阅列表交给谁分成三类。

### 列表留在组织内

- Matrix：自建的服务器装好 [hookshot](https://matrix-org.github.io/matrix-hookshot/latest/setup/feeds.html){target="_blank"} 并开启 feeds 功能之后，在房间输入 `!hookshot feed <网址>`
- Zulip：官方的 [RSS 集成](https://zulip.com/integrations/rss){target="_blank"} 是一支放在自己机器上、定时执行的程序，读到新文章就贴进指定的频道

读取 feed 的是组织自己的机器，订阅列表不会交给外部服务商。代价是要有人负责搭建与维护。

### 列表交给平台

- Slack：官方的 RSS app，在频道输入 `/feed subscribe <网址>`（见 [Slack 的说明](https://slack.com/help/articles/218688467-Add-RSS-feeds-to-Slack){target="_blank"}）
- Microsoft Teams：原本的 RSS 连接器已在 2026 年 5 月停用，改用 Workflows 的 RSS 模板

团队平常的对话本来就放在这些平台上，多交出去的是订阅列表。

### 多一个第三方

- Discord：没有内建 RSS，常见的做法是加入 [MonitoRSS](https://monitorss.xyz/){target="_blank"} 这类机器人，或用 Zapier 之类的服务接 webhook（让外部服务把消息贴进频道的专属网址）
- Telegram：同样依赖第三方机器人

机器人的运营者知道你们订了哪些来源，而且可以在频道里发消息。MonitoRSS 与 [RSS-to-Telegram-Bot](https://github.com/Rongronggg9/RSS-to-Telegram-Bot){target="_blank"} 都是开源软件，可以自行搭建，少掉运营者这一层。

## anoni.net 的 feed 网址

=== "一般网络"

    文档站的近期公告：

    ```
    https://anoni.net/docs/zh-cn/feed_rss_created.xml
    ```

    软件更新日志的全部条目：

    ```
    https://anoni.net/docs/zh-cn/changelog/feed.xml
    ```

    软件更新日志，只收需要立刻与尽快处理的更新：

    ```
    https://anoni.net/docs/zh-cn/changelog/feed-urgent.xml
    ```

    新闻导读：

    ```
    https://anoni.net/news/zh-cn/feed.xml
    ```

    新闻导读的正体中文版与英文版：

    ```
    https://anoni.net/news/feed.xml
    ```

    ```
    https://anoni.net/news/en/feed.xml
    ```

=== "Tor（onion）"

    文档站的近期公告：

    ```
    http://docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/zh-cn/feed_rss_created.xml
    ```

    软件更新日志的全部条目：

    ```
    http://docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/zh-cn/changelog/feed.xml
    ```

    软件更新日志，只收需要立刻与尽快处理的更新：

    ```
    http://docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/zh-cn/changelog/feed-urgent.xml
    ```

    新闻导读：

    ```
    http://news.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/zh-cn/feed.xml
    ```

    新闻导读的正体中文版与英文版：

    ```
    http://news.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/feed.xml
    ```

    ```
    http://news.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/en/feed.xml
    ```

软件更新日志另外按设备与用途分成 iPhone 与 iPad、Mac、Windows、Linux、Android、Tails 等几份 feed，订阅链接在[软件更新日志](../changelog/index.md)各筛选项的旁边。只订自己用得到的那几份，阅读器里就不会堆满无关的更新。

## 不想安装阅读器的话

也可以[订阅电子报](../contact.md)，社群的项目进度与活动信息会寄到邮箱。不想交出平常用的 email，可以用[邮件别名](./email-alias.md)订阅，日后不想收时直接关掉别名。

## 相关阅读

- [软件更新日志](../changelog/index.md)：匿名工具与操作系统的版本更新，按设备分别订阅
- [社群平台怎么收集你的数据](../basics/platform-tracking.md)：关注社交媒体账号时，平台取得了哪些记录
- [邮件别名怎么用，以及它把信任交给谁](./email-alias.md)：订阅电子报时不交出实名邮箱的做法
- [什么是 Tor](./what-is-tor.md)：经由 Tor 读取 feed 之前，先了解 Tor 能保护什么
