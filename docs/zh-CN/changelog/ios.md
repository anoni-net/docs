---
title: iOS 安全更新
description: iPhone 与 iPad 每次安全更新的白话整理，说明这次修了什么、需不需要马上更新，以及旧机型还收不收得到修补。
icon: material/apple-ios
digest:
  name: iOS
  devices: [iphone]
  basis: 按 Apple 是否标注已被利用分级
---

# :material-apple-ios: iOS 安全更新

iPhone 与 iPad 的安全更新整理。Apple 一次更新动辄上百个 CVE，逐条读完也很难判断该怎么做，所以这一页不做逐条翻译，只回答三个问题：需不需要马上更新、修补打到哪些常见的攻击路径、旧机型还收不收得到。新版本永远在最上面。

原始数据来自 Apple 的[安全更新发布页](https://support.apple.com/en-us/100100){target="_blank"}。没有出现在那一页的小改版，本页不另立条目。出现在那一页、Apple 却注记没有公布 CVE 项目的版本，会立一则简短条目，让读者知道自己手上还不是最新版。

## 紧急程度怎么判断

- <span class="urg-tag urg-tag--now">立刻</span>Apple 在公告里标注该问题可能已被实际利用，或漏洞被美国 CISA 的已知遭利用漏洞目录收录。看到这一级，当天就更新。
- <span class="urg-tag urg-tag--soon">尽快</span>修补涵盖 WebKit 或 Kernel 的内存损坏类问题（程序写错内存位置，攻击者可以借此塞进自己的代码执行）。前者是访问网页就可能触发的环节，后者决定攻击者能取得多少权限，两者串起来就是一条完整的远程攻击链。几天内更新。
- <span class="urg-tag urg-tag--routine">一般</span>其余修补，跟着平常的节奏更新即可。

颜色回答的是「该多快处理」。「有没有人已经在利用」是另一个维度，每一则条目都会写明。这一页的「立刻」需要证据，也就是 Apple 自己标注可能已被实际利用，或漏洞进了 CISA 的目录。其他页面的判准基础不一定相同，跨页比较时要看该页自己的说明。

分级是社群志愿者读完公告后的整理，Apple 自己不做这种标示。判断不确定时以较高一级为准。

长期可能被锁定的人（记者、律师、人权工作者、社运参与者）另外开启锁定模式（Lockdown Mode），位置在设置、隐私与安全性、锁定模式。它会关掉多项常被用来递送攻击的功能，代价是部分网页与附件无法正常显示。

## 你的机器走哪一条线

Apple 同一天常常发好几条更新线，版本号差很多，内容也不一样。以 2026 年 9 月 14 日 iOS 27 推出之后的状况来说：

| 机型 | 目前的更新线 |
|---|---|
| iPhone 11 以后、iPad Pro 12.9 英寸四代以后、iPad Pro 11 英寸二代以后、iPad Air 4 以后、iPad 9 以后、iPad mini 6 以后 | 27.x |
| iPad Pro 12.9 英寸三代、iPad Pro 11 英寸一代、iPad Air 3、iPad 8、iPad mini 5 | 26.x，硬件升不上 27 |
| iPhone XS、XS Max、XR、iPad 7 | 18.x |
| iPad Pro 12.9 英寸二代、iPad Pro 10.5 英寸、iPad 6 | 17.x |
| iPhone 8、8 Plus、X、iPad 5、iPad Pro 9.7 英寸、iPad Pro 12.9 英寸一代 | 16.x |
| iPhone 6s、7、SE 一代、iPad Air 2、iPad mini 4、iPod touch 7 | 15.x |

iPhone 11 以后的机型两条线都收得到，26.7 那一版是给暂时不想升上 27 的人。iPad 这一侧的分界比较硬，12.9 英寸三代、11 英寸一代、Air 3、iPad 8 与 mini 5 最高只到 26.x。

越旧的线收到的修补越少也越慢，下面 2026-04-22 那则有具体例子。完全收不到更新的机型代表已知漏洞不再有人修，处理敏感数据的话该考虑换机。

## iOS 27、iPadOS 27（同日另有 26.7）

> 2026-09-14 · [27 公告](https://support.apple.com/en-us/149034){target="_blank"} · [26.7 公告](https://support.apple.com/en-us/149041){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>年度大版本与旧线的安全更新同日发出，27 补 126 个 CVE、26.7 补 82 个。Apple 没有标注任何一项已被实际利用。
- Kernel 是数量最大的一组，27 占 20 个、26.7 占 18 个。多数是应用造成系统异常终止或内核内存损坏，两条线各有一个让恶意应用取得 root 权限。AVEVideoEncoder 有一个沙箱内的应用可以用内核权限执行任意代码，那是从沙箱一路打进内核的完整路径。
- 跟踪类的修补这次特别多，对在意身份关联的读者比 CVE 总数更值得看。27 这一侧，App Store、AuthKit 与 CloudKit 各有一个本地应用读得到常驻账号标识符，Photos Storage 与 Sandbox Profiles 各有一个应用可以对用户做指纹识别。26.7 那一侧同一类只有 AuthKit 一个。
- 两条线共通的有三项：Power Management 一个应用可以对设备做指纹识别，Symptom Framework 一个恶意程序可以判定用户当前的位置，NetworkExtension 一个应用可以查出你装了哪些其他应用，27 另有 Accessibility 的同类问题。装了什么本身就是一组识别特征，安装清单里有特定的通信或工具软件，足以把你缩小到某一群人。
- 浏览器引擎这一侧，27 有 3 个 WebKit 加 1 个 WebKit Canvas，26.7 各有 1 个，涵盖恶意网页内容泄漏敏感用户信息、非预期的进程终止与 Safari 崩溃。26.7 另有 5 个 ImageIO，数量比 27 那一侧多。
- 两份清单不是单纯的包含关系。26.7 的 82 个里有 7 个没有出现在 27 的清单，27 多出来的 51 个集中在 CoreUI、Kernel、WebKit、Baseband 与 CloudKit。两条线都收得到的人装哪一个都可以，安全上没有落差。
- 同日另有 macOS Golden Gate 27、Tahoe 26.7 与 Sequoia 15.8，整理在 [macOS 安全更新](./macos.md)。18.x 线这一轮没有更新，还在那条线的机型最新仍是 8 月 17 日的 18.7.10。

## iOS 26.6.2、iPadOS 26.6.2

> 2026-09-08 · [安全更新发布页](https://support.apple.com/en-us/100100){target="_blank"}

- <span class="urg-tag urg-tag--routine">一般</span>Apple 把这一版列进安全更新发布页，那一行的注记说明这次更新没有公布任何 CVE 项目，也没有附上安全内容说明的链接。没有标注已被实际利用的问题。
- 没有明细就看不出修了什么，跟着平常的节奏更新即可。Apple 之后补上安全内容说明时，这一则会改写。
- 同一天没有 macOS 与 18.x 线的更新。还在 18.x 的机型最新仍是 8 月 17 日的 18.7.10。

## iOS 26.6.1、iPadOS 26.6.1（同日另有 18.7.10）

> 2026-08-17 · [26.6.1 公告](https://support.apple.com/en-us/148282){target="_blank"} · [18.7.10 公告](https://support.apple.com/en-us/148287){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>没有标注已被实际利用的问题，不过 WebKit 与 Kernel 都在修补范围内。
- 26.x 线补了 29 个问题，其中 19 个落在 WebKit，多数是处理恶意网页内容造成的内存损坏或崩溃。ImageIO 有一个「处理图像可能导致任意代码执行」，这一类常被用在传一张图过去就能触发的攻击。
- Telephony 修掉一个问题：处于特权网络位置的攻击者可以绕过 IPSec 验证并拦截流量。
- 18.x 线同日发 18.7.10，一次补 122 个，WebKit 占 38 个、Kernel 占 18 个。数量远多于新机那条线，反映旧机的修补是累积一阵子才一次补齐。还在用 iPhone XS、XS Max、XR 与 iPad 7 的人尤其该装。

## iOS 26.6、iPadOS 26.6

> 2026-07-27 · [上游公告](https://support.apple.com/en-us/128066){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>86 个修补，Kernel 占 19 个、WebKit 占 7 个、ImageIO 占 6 个。Apple 没有标注任何一项已被实际利用。
- WebKit 修掉一个浏览记录外泄：网站有办法知道你是否访问过某个链接。同一组还修了恶意内容违反 iframe 沙盒策略（沙盒是把嵌入的网页关在隔离环境里，破得掉就能碰到不该碰的东西），以及网页内嵌恶意内容造成的界面伪装。
- Kernel 有一个连到恶意 NFS 服务器就可能造成内核内存损坏的问题，接不明网络存储空间的人要留意。
- Contacts 修了三个问题，包含 app 未经授权新增联系人，以及处理恶意联系人数据造成的数据外泄。

## iOS 26.5.2、iPadOS 26.5.2

> 2026-06-29 · [上游公告](https://support.apple.com/en-us/127594){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>38 个修补里有 24 个在 WebKit、4 个在 WebRTC，整包几乎都是浏览器引擎。Apple 没有标注任何一项已被实际利用。
- 多个「恶意网站跨源窃取数据」与「处理恶意网页内容泄漏敏感用户信息」，这一类直接影响在浏览器里登录的服务。
- 有一个恶意网站可以在沙盒外处理受限网页内容，沙盒是浏览器隔离网页的最后一道，破得掉就等于少一层防护。
- 6 月 1 日另有 26.5.1，Apple 没有发布 CVE 清单，本页不另立条目。

## iOS 26.5、18.7.9（同日另有 17.7.11、16.7.16、15.8.8）

> 2026-05-11 · [26.5 公告](https://support.apple.com/en-us/127110){target="_blank"} · [18.7.9 公告](https://support.apple.com/en-us/127111){target="_blank"}

- <span class="urg-tag urg-tag--soon">尽快</span>26.x 线补 67 个，WebKit 占 21 个、Kernel 占 6 个。Kernel 那组有一个 app 可能取得 root 权限（系统的最高控制权，取得之后等同设备的主人）。Apple 没有标注任何一项已被实际利用。
- 18.x 线补 49 个，其中两个是值得注意的隐私问题：app 可能绕过 App 隐私报告的记录（那份报告本来就是拿来审查 app 在背后连了哪里），以及 app 可能列举设备上已安装的应用程序（可用来侧写用户身份）。另有一个 Wi-Fi 组件的问题让 app 可能以内核权限执行任意代码，那一个的后果比隐私泄漏更严重。
- 同日发给更旧设备的 17.7.11、16.7.16、15.8.8 各只补一个问题，就是下面 4 月 22 日那个通知保留问题。

## iOS 26.4.2、18.7.8

> 2026-04-22 · [26.4.2 公告](https://support.apple.com/en-us/127002){target="_blank"} · [18.7.8 公告](https://support.apple.com/en-us/127003){target="_blank"}

- <span class="urg-tag urg-tag--routine">一般</span>隐私意涵值得知道。整个更新只修一个问题。Apple 没有标注任何一项已被实际利用。
- CVE-2026-28950：标记为删除的通知，可能仍然被保留在设备上。原因是日志记录的问题，Apple 用改进的数据脱敏修好。以为划掉就消失的通知内容，实际上还留在设备里，对拿走设备的人可见。
- 同一个修补到 17.x、16.x、15.x 这三条旧线是 5 月 11 日，晚了 19 天。旧机不只收到的修补比较少，时间也比较慢。
