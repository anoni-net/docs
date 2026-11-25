---
title: 手机的位置追踪与监控手法
description: 手机只要开着就不断向外发出信号，基站、伪基站、Wi-Fi 与蓝牙、App 与广告标识符都能拿来定位你。本页从手机本身出发，说明每一种追踪方式能做到什么、你能做什么，以及传感器、生物辨识、一次性手机与手机被扣押时的取证。
icon: material/cellphone-marker
---

# :material-cellphone-marker: 手机的位置追踪与监控手法

手机一直在用发出的信号告诉别人你在哪里，这是它对隐私最深、也最不容易察觉的威胁。除了你主动分享的位置，至少还有四种方式可以追踪一支手机：基站、伪基站、Wi-Fi 与蓝牙，以及 App 与网页泄漏的位置[^ssd-loc]。

本页从手机本身出发，说明每一种方式的原理与你能做的事。谁有能力做这些事、成本多高，见 [监控现在做得到什么](./surveillance-capability.md)。实际要调整的设置，见 [手机隐私设置逐步指引](../tools/phone-privacy-settings.md)。

本页依 EFF Surveillance Self-Defense 的手机系列五篇合并改写（出处见[本页的来源与核对](#本页的来源与核对)）。

!!! tip "时间有限的话，先看这几点"

    - 手机开机、插着 SIM 卡，运营商就知道你大概在哪里，这一点除了不带手机之外没有办法
    - App 的位置权限能关就关，能给大概位置就不给精确位置，广告标识符也一并关闭
    - 在已经关闭 2G 的地区（例如台湾），手机出现 2G 信号很可能是伪基站
    - 一般电话与短信不安全，敏感的内容改用端对端加密的通信工具

## 基站的定位

手机开机并连上电信网络时，运营商就能从各基站收到的信号推算出手机的位置。有三座以上基站时，精确度大约一公里，较新的网络还能回报手机的 GPS 座标。只要手机开机、插着登记过的 SIM 卡并连上电信网络，就无法躲过这种追踪[^ssd-loc]。

政府可以要求运营商交出实时或过去的位置记录，也可以要求列出某个时间、某个地点出现过的所有手机（基站数据调取，tower dump），例如查出谁出现在某一场抗议[^ssd-loc]。台湾的运营商保存哪些记录、保存多久，见 [监控现在做得到什么](./surveillance-capability.md) 的〈电信商〉。

能做的事很有限，追踪是在运营商那一端发生的，唯一的方法是不带手机[^ssd-loc]。

## 伪基站

伪基站（IMSI catcher，也叫 Stingray）是可以带着走的假基站，冒充正牌基站，让附近的手机连上，借此检测手机在场、监听通信。很多伪基站利用的是 2G 网络的安全缺陷[^ssd-loc]。

伪基站在台湾也被诈骗集团拿来用。2024 年刑事局破获首宗案件，嫌犯把基站信号发射器放在车上，假冒「111 政府专属短码」发送钓鱼短信。台湾的通讯传播委员会（NCC）提醒，台湾已经关闭 2G 网络，手机收到 2G 信号属于不正常，可能遇到假基站[^cna]。

- **Android**：Android 12 起提供关闭 2G 的开关，位置依品牌不同，多在 SIM 卡或移动网络的设置里[^aosp-2g]
- **iPhone**：打开锁定模式会禁用 2G，但也会关掉很多其他功能[^ssd-loc]
- **通信内容**：改用端对端加密的通信工具，即使连上伪基站，内容也无法被拦截[^ssd-loc]

## Wi-Fi 与蓝牙

Wi-Fi 与蓝牙的信号传得比移动网络近，通常在同一个房间或同一栋建筑内收得到。两者的信号都带有设备的硬件地址（MAC 地址），开着 Wi-Fi 的手机会不时发出搜索网络的信号，零售商店过去就用这些地址追踪顾客的动线[^ssd-loc]。

新版的 iOS 与 Android 在搜索网络时默认使用随机的 MAC 地址，追踪变得困难许多，但实作可能有漏洞。连上某个网络时，手机通常会对该网络使用固定的地址，网络的经营者就能认出你是不是之前来过的那台设备，不需要你输入任何姓名或 email。iOS 18 以后大约每两周更换一次地址，Android 可以在各 Wi-Fi 网络的隐私设置里选择使用随机的 MAC 地址。在意这类追踪时，可以暂时关闭 Wi-Fi 与蓝牙[^ssd-loc]。

别人放在你身上的蓝牙追踪器是另一回事，检测方式见 [蓝牙追踪器的检测与处理](../tools/bluetooth-tracker.md)。

## App 与网页泄漏的位置

手机用 GPS、附近的基站与 Wi-Fi 推算自己的位置，App 取得权限之后就能读取，有些 App 会把位置传回自己的服务器，再分享给合作的第三方。位置记录能看出的不只是你现在在哪里，还有你的信仰、参加过的活动与人际关系，例如谁在什么时段去了谁家、谁出席了某场会议或抗议，或是记者的消息来源是谁。美国的执法机关就曾多次不经令状，直接购买 App 搜集的位置数据[^ssd-loc]。

能做的事是尽量收回 App 的位置权限，能给大概位置就不给精确位置，想想每个 App 是否真的需要。导航需要精确位置，天气 App 输入城市名称通常就够了，游戏多半不需要。不确定时就收回，之后随时可以再给[^ssd-loc]。位置权限的设置步骤见 [手机隐私设置逐步指引](../tools/phone-privacy-settings.md) 的第 4 步。

## 广告标识符与行为数据

很多 App 内置广告公司的代码，记录你安装、打开、使用 App 的行为，通过实时竞价广告分享给数十家广告商与数据经纪商。单一笔数据看起来无关紧要，靠广告标识符串起来之后，就能拼出一个人在不同 App 里的完整行为。广告标识符本身不含真实身份，但数据经纪商要把它对应到本人并不难，例如从 App 里填过的姓名或 email。政府也曾搭着这些商业监控取得数据[^ssd-loc]。

iPhone 的 App 要先取得你的同意才能读取广告标识符，Android 默认每个 App 都读得到，但可以删除[^ssd-loc]。设置步骤见 [手机隐私设置逐步指引](../tools/phone-privacy-settings.md) 的第 5 步，平台还搜集了什么见 [社交平台怎么收集你的数据](./platform-tracking.md)。

## 一般电话与短信

移动网络当初设计时没有考虑防止窃听。现在虽然有加密，但很多加密技术设计不良、部署不一致，部分国家的运营商甚至没有打开加密，用对的无线电设备仍可能拦截空中发送的通话与短信，执法机关也能直接从运营商取得内容。最安全的假设是一般电话与短信都没有防窃听保护[^ssd-spy]。

敏感的内容改用端对端加密的工具，例如 Signal、WhatsApp，以及 iMessage（只有双方都用 Apple 设备、对话泡泡是蓝色时才有端对端加密）[^ssd-spy]。Signal 的设置见 [Signal 的设置与群组管理](../tools/signal-guide.md)。

## 手机里的组件与传感器

- **GPS**：GPS 卫星只发送信号，不接收任何东西，卫星不知道谁在使用。所谓的「GPS 追踪」是手机上的 App 读取位置再传出去。执法机关可以向 App 业者调取特定人的 GPS 数据，也有要求业者列出某时某地所有设备的「地理围栏」调取[^ssd-sensors]
- **NFC**：感应距离大约四厘米，用在移动支付、门禁与酒店房卡。它不会知道你在世界上的哪里，但每次感应付款或进出建筑都可能留下记录。Android 可以关闭 NFC，iPhone 的 NFC 只开放给 Apple Pay 与 AirDrop 这类功能[^ssd-sensors]
- **动作与环境传感器**：加速度计与陀螺仪用来计步、导航，研究显示加速度计可以从振动推测附近电脑键盘的按键，陀螺仪可以当作粗糙的麦克风。实际被这样利用的机会很低，把手机收进包包或口袋就能降低风险。其他还有磁力计、气压计、距离传感器、环境光传感器、LiDAR，以及 iPhone 用来跟 AirTag 等 Apple 设备沟通的 U1、U2 芯片[^ssd-sensors]

## 生物辨识解锁

存在手机上的指纹与脸部数据经过加密，放在与系统其他部分隔离的安全硬件里，不会离开手机，Apple、Google 这些厂商也拿不到。恶意软件要读取这些数据，必须先攻破那块隔离的硬件，门槛很高，所以恶意软件通常改试着绕过生物辨识锁[^ssd-bio]。

生物辨识防不了的是有人要你「自愿」解锁，例如执法人员与海关。这跟硬件无关，是权力关系的问题。处境涉及执法单位时，只用 PIN 码或密码解锁比较安全[^ssd-bio]。过境时的准备见 [出差与研讨会的数字准备](../scenarios/asia-travel.md)。

数字身份或年龄验证要你扫脸、上传自拍时，数据送去哪里、存在哪里，跟手机本身的生物辨识完全不同，第三方服务读不到你手机上用来解锁的生物辨识数据[^ssd-bio]。台湾的行动自然人凭证则走 FIDO 标准，搭配手机本身的生物辨识（见 [一般人平常该做到什么](../scenarios/everyday-baseline.md)）。

## 恶意软件与关机

手机上的恶意软件可以读取短信与照片，偷偷打开麦克风、相机与 GPS，也可以在 Signal、WhatsApp 的消息于手机上解密显示时读取内容[^ssd-other]。iPhone 的锁定模式能挡下部分恶意软件，Google 的高级保护计划替整个 Google 账号加上保护[^ssd-other]。一般恶意软件的防范见 [恶意软件的防范与处理](../tools/malware.md)。

有人建议谈敏感的事情前把手机关机，甚至拔掉电池，因为有些恶意软件会让手机看起来关机、实际上仍在监听。现在的手机多半拆不了电池，比较好的做法是把手机放进法拉第袋，2G 到 5G、蓝牙、Wi-Fi 与 GPS 的信号都会被挡住，即使手机已经被入侵也一样[^ssd-other]。

## 一次性手机的限制

用完就丢的手机（burner）要真的难以追踪，条件相当严格[^ssd-other]：

- 换 SIM 卡或把 SIM 卡移到别支手机，保护很有限，运营商看得到哪张 SIM 卡用在哪支手机上，eSIM 也一样
- 不同的手机常常一起移动、在同样的地点使用，分析人员就能推测它们属于同一个人
- 每个人的通话对象组合几乎独一无二，换了号码之后又打给同样的家人与同事，新号码很快就会被认出来

因此至少要做到：SIM 卡与手机都不重复使用、不同的手机不一起携带、不在相同的地点使用、不当成长期的方案、不同的手机不联系同一群人。这份清单还不完整，就已经很难做到[^ssd-other]。台湾的预付卡也要实名登记，取舍见 [社运行动者的数字准备](../scenarios/activist.md) 的〈一次性手机（burner）的取舍〉。

## 手机被扣押时的取证

手机取证已经是成熟的专业，取证人员把扣押的手机接上专用设备，能读出通话记录、照片、位置记录、App 数据与消息，包括 Signal、WhatsApp 这类加密通信 App 里的对话，有时还能救回已经删除的短信。取证的第一步是解锁，手机的安全机制能挡下一部分，但也曾经被取证设备突破[^ssd-other]。

远程抹除可以在手机遗失或被偷时保护数据，但手机被执法机关扣押之后才抹除，在部分司法管辖区会被另外追究湮灭证据或妨碍侦查，后果可能比原本的案件还重[^ssd-other]。在台湾该如何处理，见 [社运行动者的数字准备](../scenarios/activist.md) 的〈删除「证据」前的合规考量〉，并先咨询律师。

## 本页的来源与核对

本页合并 EFF [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"} 手机系列的五篇改写，都以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hans){target="_blank"} 授权：

- 〈[Mobile Phones: Location Tracking](https://ssd.eff.org/module/mobile-phones-location-tracking){target="_blank"}〉，审阅日 2024-11-05
- 〈[Mobile Phones: Spying on Mobile Communications](https://ssd.eff.org/module/mobile-phones-spying-mobile-communications){target="_blank"}〉，审阅日 2024-11-05
- 〈[Mobile Phones: Phone Components and Sensors](https://ssd.eff.org/module/mobile-phones-phone-components-and-sensors){target="_blank"}〉，审阅日 2024-11-05
- 〈[Mobile Phones: Device-Bound Biometrics](https://ssd.eff.org/module/mobile-phones-device-bound-biometrics){target="_blank"}〉，审阅日 2026-10-28
- 〈[Mobile Phones: Other Surveillance Techniques](https://ssd.eff.org/module/mobile-phones-malware){target="_blank"}〉，审阅日 2024-11-05

改写时加入台湾伪基站的案例与 NCC 的提醒、Android 关闭 2G 的官方说明，美国的法院判决、计划名称与个案改为概述，并连到文档站既有的设置与情境页。本页未经 EFF 审阅，内容与原文不同之处由匿名网络社区 anoni.net 负责。

## 相关阅读

- [监控现在做得到什么](./surveillance-capability.md)：平台、电信、国家与商用间谍软件各自的能力边界
- [手机隐私设置逐步指引](../tools/phone-privacy-settings.md)：位置权限、广告追踪与遗失遭窃的设置
- [Metadata 是什么，为什么重要](./metadata.md)：通联记录为什么比内容更能看出一个人
- [社运行动者的数字准备](../scenarios/activist.md)：一次性手机、现场的设备设置与法律支持

[^ssd-loc]: [Mobile Phones: Location Tracking](https://ssd.eff.org/module/mobile-phones-location-tracking){target="_blank"} - EFF Surveillance Self-Defense，审阅日 2024-11-05。
[^ssd-spy]: [Mobile Phones: Spying on Mobile Communications](https://ssd.eff.org/module/mobile-phones-spying-mobile-communications){target="_blank"} - EFF Surveillance Self-Defense，审阅日 2024-11-05。
[^ssd-sensors]: [Mobile Phones: Phone Components and Sensors](https://ssd.eff.org/module/mobile-phones-phone-components-and-sensors){target="_blank"} - EFF Surveillance Self-Defense，审阅日 2024-11-05。
[^ssd-bio]: [Mobile Phones: Device-Bound Biometrics](https://ssd.eff.org/module/mobile-phones-device-bound-biometrics){target="_blank"} - EFF Surveillance Self-Defense，审阅日 2026-10-28。
[^ssd-other]: [Mobile Phones: Other Surveillance Techniques](https://ssd.eff.org/module/mobile-phones-malware){target="_blank"} - EFF Surveillance Self-Defense，审阅日 2024-11-05。
[^cna]: [刑事局破首宗假冒「111」政府短信骗个资 逮2嫌](https://www.cna.com.tw/news/asoc/202411220166.aspx){target="_blank"} - 中央社，2024-11-22。
[^aosp-2g]: [禁用 2G](https://source.android.com/docs/security/features/cellular-security/disable-2g?hl=zh-cn){target="_blank"} - Android 开放源代码项目。
