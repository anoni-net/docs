---
title: 蓝牙追踪器的检测与处理
description: AirTag 这类蓝牙追踪器被偷放进包里或车上时，iPhone 与 Android 可以自动提醒，也可以手动扫描。本页说明两种手机各自检测得到哪些追踪器、收到提醒后如何找出来，以及找到之后先顾安全、再决定是否停用。
icon: material/bluetooth
---

# :material-bluetooth: 蓝牙追踪器的检测与处理

AirTag、Tile、Samsung SmartTag 这类蓝牙追踪器原本用来找钥匙与行李，体积跟硬币相近，塞进包的夹层、外套口袋或车上都不容易发现。放的人在自己的手机上就看得到追踪器目前的位置，被追踪的人可能完全不知情。

iPhone 与 Android 都内建检测功能，有不明追踪器跟着你移动一段时间之后会发出提醒，也可以手动扫描附近。两边检测得到的品牌不同，提醒也有延迟。本页整理各自的范围、收到提醒之后如何找出追踪器，以及找到之后的处理。

本页依 EFF Surveillance Self-Defense 的〈How to: Detect Bluetooth Trackers〉改写，并依 Apple 与 Google 2026 年的官方说明更新步骤（出处与差异见[本页的来源与核对](#本页的来源与核对)）。

!!! warning "怀疑是伴侣、前任或家人放的"

    停用追踪器之后，对方会发现位置不再更新，可能改用更危险的方式。处理之前先读 [家暴受害者的数字准备](../scenarios/domestic-violence.md) 的〈离开是风险最高的时刻〉，或联系当地的求助热线讨论安全计划（各地热线见该页的〈在地脉络〉）。

!!! tip "时间有限的话，先看这几点"

    - iPhone 更新到 iOS 17.5 以上、Android 6.0 以上并装有 Google Play 服务，系统就会自动提醒 AirTag 与兼容的追踪器，前提是蓝牙、定位与通知都开着
    - 提醒要等追踪器跟着你移动一段时间才会出现，怀疑的当下改用手动扫描
    - Android 内建手动扫描，iPhone 没有，需要另外安装 AirGuard
    - 找到之后先截屏保留序列号与物主信息，再决定要不要停用

## 蓝牙追踪器的运作方式

追踪器本身没有 GPS，也没有移动网络。它持续发出蓝牙信号，附近的手机收到之后，把手机自己的大概位置回报给厂商，物主再从 App 看到追踪器在哪里。Apple 的网络叫“查找”，iPhone 默认都会参与。Google 的网络叫“查找中心”，Samsung 与 Tile 各有自己的网络。参与的手机越多位置越准，在人多的城市通常相当准确[^ssd]。

物主要用账号注册追踪器，账号通常绑着姓名、邮箱或电话号码，追踪器被找到时，这是可以追查的线索。AirTag 可以共享给其他人，被共享的人不会收到这个 AirTag 的提醒，扫描 AirTag 取得的物主信息也不会显示它共享给了谁[^ssd]。

AirTag 的物主只看得到目前的位置，看不到移动的历史记录。Tile、Samsung SmartTag 等其他品牌则可能保留历史记录给物主[^ssd]。

## 常见的追踪器

- **Apple AirTag**：白色圆形，比一元硬币略大
- **Tile**：有方形、卡片型、贴片型等多种外型
- **Samsung Galaxy SmartTag**
- **Chipolo、Pebblebee、Motorola moto tag**：部分型号可以加入 Apple 的“查找”或 Google 的“查找中心”[^google]

AirTag 与兼容的追踪器离开物主一段时间之后，移动时会发出提示音[^apple]。没有智能手机的人，这个声音可能是唯一的线索，但喇叭可以被拆掉，听不到声音不代表没有追踪器[^ssd]。

藏放的位置以包的内袋与夹层、外套口袋、车上最常见，车上包含车牌后方[^ssd]。

## 手机的自动提醒

| | iPhone | Android |
|---|---|---|
| 系统需求 | iOS 14.5 以上可以检测 AirTag 与“查找”网络配件，iOS 17.5 以上再加上兼容的第三方追踪器 | Android 6.0 以上，功能由 Google Play 服务在后台更新 |
| 检测得到 | AirTag、AirPods、“查找”网络配件、兼容的蓝牙追踪器 | AirTag、与“查找中心”兼容的追踪器与耳机 |
| 要另外处理 | Samsung SmartTag、Tile | Samsung SmartTag、Tile |

Apple 与 Google 的说明页都没有把 Samsung SmartTag 与 Tile 列为兼容的追踪器[^apple][^google]，这两个品牌要靠各自的 App 或 AirGuard（见[手动扫描](#手动扫描)）。

Android 的提醒功能由 Google Play 服务提供[^google]。在中国大陆销售、没有 Google Play 服务的 Android 手机可能没有这项功能，在设置里找不到「不明追踪器提醒」的话，改用 AirGuard。

提醒要等追踪器跟着你移动一段时间才会出现，Apple 与 Google 都没有公布确切的时间，EFF 测试时最长要等到 24 小时[^ssd]。借朋友的钥匙、跟带着追踪器的人同行，也可能收到提醒，收到时先想想最近有没有借用别人的东西。

=== "iPhone"

    确认以下设置都已开启[^apple]：

    1. 「设置」>「通用」>「关于本机」，确认 iOS 版本。17.5 以上才检测得到第三方追踪器
    2. 「设置」>「隐私与安全性」>「定位服务」，打开「定位服务」，再到「系统服务」打开「重要地点」
    3. 「设置」>「蓝牙」，打开蓝牙
    4. 「设置」>「通知」>「跟踪通知」，打开「允许通知」
    5. 关闭飞行模式，飞行模式下收不到跟踪通知

    提醒的文字会是「发现正在跟随你移动的 AirTag」、「发现‘产品名称’正随你移动」或「发现未知配件」。点开通知，“查找”会显示地图，红点是你的 iPhone 检测到这个物品的位置，虚线标出检测的先后顺序。红点的时间不代表物主在那个时间查看了位置[^apple]。

    点「继续」之后有两个选项：

    - **播放声音**：让追踪器发出声音。无法播放时，可能是物品已经不在身边、物主就在附近，或标识符已经更改
    - **查找附近地点**：未知的物品是 AirTag，而且你的 iPhone 支持超宽带时，屏幕会显示到 AirTag 的距离与方向

    向家人借用的物品，可以在通知里把该物品的提醒关闭一天或永久关闭。之前收到的提醒列在“查找”>「物品」最下方的「检测到你携带的未知物品」[^apple]。

=== "Android"

    提醒功能默认开启。确认的位置在「设置」>「安全和紧急情况」>「不明追踪器提醒」，「允许接收提醒」要开着。Android 11 以下在「设置」>「Google」>「个人与设备安全」>「不明追踪器提醒」。自动提醒需要开启位置信息[^google]。

    点开通知会显示地图，标出系统检测到追踪器跟着你移动的位置。接着可以：

    - **响铃**：让追踪器发出声音，物主不会收到通知
    - **后续步骤 > 查找附近设备**：限与“查找中心”兼容的追踪器，越靠近，屏幕上的图形填充得越满

    同一个追踪器每天只会提醒一次。之前的提醒在同一个设置页中间的按钮查看，48 小时后删除[^google]。

## 手动扫描

自动提醒要等追踪器跟着你移动一段时间，怀疑的当下可以手动扫描。在停车场、公寓楼这类人多的地方，结果会混进别人的追踪器，尽量到附近没有其他人的地方扫描，多扫几次比对[^ssd]。

=== "Android"

    「设置」>「安全和紧急情况」>「不明追踪器提醒」>「立即扫描」，大约 10 秒完成。结果只列出不在物主身边的追踪器。Android 11 以上不必开启位置信息也能扫描[^google]。

    内建扫描找不到 Samsung SmartTag 与 Tile。要一并检测，或者手机没有 Google Play 服务，可以安装 AirGuard，Android 版检测得到 AirTag、Samsung SmartTag 与“查找中心”的追踪器。除了 Google Play，AirGuard 也可以从 F-Droid 或 GitHub 的 Releases 页面下载[^airguard]。

=== "iPhone"

    iPhone 没有内建手动扫描，需要安装第三方 App。EFF 测试过的是德国达姆施塔特工业大学（TU Darmstadt）研究团队开发的 AirGuard，iPhone 版检测得到 Samsung SmartTag 与 Tile，中国大陆的 App Store 也有上架[^airguard]。

    AirGuard 会要求位置、蓝牙与通知权限。不给位置权限也能使用，只是不会记录在哪里检测到追踪器[^ssd]。打开扫描页面之后，点选不认得的追踪器，进入搜索画面，屏幕上的百分比是手机跟追踪器之间的信号强度。拿着手机移动，数字变大代表越来越近，到 90% 以上时追踪器就在很近的地方[^ssd]。

    EFF 测试时，AirGuard 有几次比预期晚才检测到追踪器，不要只依赖它[^ssd]。

=== "Samsung Galaxy"

    除了 Android 内建的提醒，Samsung 的 SmartThings App 在 SmartThings Find 的设置里有「未知标签检测」（Unknown tag detection），未知的智能标签跟着你移动时会通知你[^samsung]。中文界面的选项名称可能与此不同，找不到时用 App 里的搜索。

## 找到追踪器之后

追踪器可能是伴侣、前任或家人放的时候，先想清楚安全。停用之后对方会知道你发现了，可能改用其他方式找你。先跟信任的人或当地的求助热线讨论，再决定如何处理[^ssd]。

### 保留证据

- 截屏保存提醒画面与地图
- AirTag：把 iPhone 或支持 NFC 的 Android 手机顶部靠近 AirTag 白色的一面，会打开一个网页，显示序列号与注册者电话号码的最后四位。电话可能是另外办的号码[^apple][^ssd]
- AirTag 的物主如果把它标记为丢失，网页会显示物主留下的联系方式[^apple]
- 其他品牌：照手机屏幕的指示取得设备 ID，部分追踪器的机身印有序列号[^google]

### 停用

- 在提醒画面点「停用说明」，照着屏幕操作，通常是取出电池。停用之后物主不再收到位置更新，但可能仍看得到停用前最后的位置[^apple][^google]
- 部分追踪器停用之后会恢复出厂设置，不再关联原本的物主，警方就无法再向厂商查询物主。打算报警的话，先截屏保留信息，再决定是否停用[^google]
- 关闭手机的蓝牙、定位或开启飞行模式，挡不住物主看到追踪器的位置，其他人的手机仍会回报它[^apple][^google]

### 报警与求助

觉得有立即危险时，先到人多的公共场所，再拨打当地的报警电话。警方可以向 Apple 等厂商调取物主的资料，会需要追踪器的序列号或设备 ID[^apple]。

各地的求助热线与法律依据不同，见 [家暴受害者的数字准备](../scenarios/domestic-violence.md) 的〈在地脉络〉。以台湾为例，[跟踪骚扰防制法](https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0080211&flno=3){target="_blank"} 第 3 条把「监视、观察、跟踪或知悉特定人行踪」列为跟踪骚扰行为之一，要件是反复或持续、违反对方意愿、与性或性别有关，并使对方心生畏怖。对象是特定人的配偶、亲属等关系密切的人时，不需要与性或性别有关[^stalking]。是否构成要看个案，报警时把上面保留的证据一并带着。

## 检测的限制

- 提醒有延迟，Android 上同一个追踪器每天只提醒一次[^google]
- 追踪器的蓝牙标识符会定期更改，离开物主较久时大约一天更改一次，更改之后系统会把它当成新的追踪器[^google]
- 只检测得到加入 Apple 与 Google 共同标准的品牌，其他品牌要靠各自的 App 或 AirGuard
- 插 SIM 卡、自行用移动网络回报位置的 GPS 定位器不靠附近的手机回报，本页的检测方式找不到它们，只能实际检查包与车辆
- 手机上的追踪类 App、共用账号的位置共享是另一种渠道，见 [家暴受害者的数字准备](../scenarios/domestic-violence.md) 与 [手机隐私设置逐步指引](./phone-privacy-settings.md) 的第 7 步

## 本页的来源与核对

本页依 EFF [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"} 的〈[How to: Detect Bluetooth Trackers](https://ssd.eff.org/module/how-to-detect-bluetooth-trackers){target="_blank"}〉改写，原文的审阅日是 2024-07-15，以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hans){target="_blank"} 授权。改写时加入各地的求助入口，并依官方说明更新了三处：

- Android 从 6.0 起就内建不明追踪器提醒，原文写 Android 14 以上
- iPhone 从 iOS 17.5 起检测得到兼容的第三方追踪器，原文写只检测得到 AirTag
- 部分追踪器停用之后会恢复出厂设置，警方无法再查询物主，原文没有提到

本页未经 EFF 审阅，内容与原文不同之处由匿名网络社区 anoni.net 负责。

步骤依下列官方说明整理，2026 年 11 月核对：

- iPhone：Apple 支持〈当你收到有 AirTag、AirPods、“查找”网络配件或兼容的蓝牙位置跟踪设备正在跟随你移动的警告时该怎么做〉，该页的发布日期是 2026-03-24
- Android：Android 帮助中心〈查找不明追踪器〉
- Samsung Galaxy：Samsung 美国支持页，中文界面的名称没有核对

照着做却找不到选项，欢迎到社区的在线聊天室（[Matrix 公开 room](https://anoni.net/services/){target="_blank"}）告诉我们手机型号与系统版本，我们会查证后更新。

## 相关阅读

- [家暴受害者的数字准备](../scenarios/domestic-violence.md)：位置追踪之外的账号共用、追踪类 App 与智能家居，以及如何在不惊动对方的前提下确认
- [手机隐私设置逐步指引](./phone-privacy-settings.md)：第 7 步检查谁看得到你的位置
- [监控现在做得到什么](../basics/surveillance-capability.md)：平台、运营商、国家与商用间谍软件各自的能力边界
- [威胁模型如何建立](../basics/threat-model.md)：先想清楚面对的是谁，再决定要做到哪里

[^ssd]: [How to: Detect Bluetooth Trackers](https://ssd.eff.org/module/how-to-detect-bluetooth-trackers){target="_blank"} - EFF Surveillance Self-Defense，审阅日 2024-07-15。
[^apple]: [当你收到有 AirTag、AirPods、“查找”网络配件或兼容的蓝牙位置跟踪设备正在跟随你移动的警告时该怎么做](https://support.apple.com/zh-cn/119874){target="_blank"} - Apple 支持，发布日期 2026-03-24。
[^google]: [查找不明追踪器](https://support.google.com/android/answer/13658562?hl=zh-Hans){target="_blank"} - Android 帮助。支持的追踪器、手动扫描、停用后恢复出厂设置、标识符更改，以及提醒功能由 Google Play 服务提供，都写在这一页。
[^airguard]: [AirGuard](https://github.com/seemoo-lab/AirGuard){target="_blank"} - 达姆施塔特工业大学 Secure Mobile Networking Lab，以及 App Store、Google Play 与 [F-Droid](https://f-droid.org/packages/de.seemoo.at_tracking_detection/){target="_blank"} 上的 App 说明。iPhone 版最近一次更新是 2025-05，Android 版是 2026-09。
[^samsung]: [Use SmartThings Find with the SmartThings app](https://www.samsung.com/us/support/answer/ANS10004549/){target="_blank"} - Samsung 美国支持页。
[^stalking]: [跟踪骚扰防制法 第 3 条](https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0080211&flno=3){target="_blank"} - 台湾全国法规数据库。
