---
title: 社交平台的隐私设置
description: 同事、前任、家人与陌生人，跟你用的是同一个平台。本页整理 LINE、Facebook、Instagram、Threads 与微信上决定别人能不能找到你、看得到你什么的设置，加上 Facebook 社团的管理方式，以及建立账号时就该避开的串连点。
icon: material/account-eye-outline
---

# :material-account-eye-outline: 社交平台的隐私设置

用社交平台时要防的对象有两种，一种是平台本身，另一种是同一个平台上的其他人：同事、前任、家人，或者有你电话号码的陌生人[^ssd-sn]。平台收集哪些数据见 [社交平台怎么收集你的数据](../basics/platform-tracking.md)，本页处理后者，整理台湾常用的 LINE、Facebook、Instagram、Threads 上，决定别人能不能找到你、看得到你什么的设置。

默认值通常偏向公开，值得逐项检查的有三件事：贴文给谁看、别人能不能用电话号码或 email 找到你，以及位置有没有自动分享出去[^ssd-sn]。

本页依 EFF Surveillance Self-Defense 的〈Protecting Yourself on Social Networks〉与〈Facebook Groups: Reducing Risks〉改写（出处见[本页的来源与核对](#本页的来源与核对)）。LINE 与 Facebook 的菜单名称取自官方说明中心的正体中文版，转成简体字，简体中文界面的实际名称可能不同。这四个平台在中国大陆都需要翻墙才能使用，在中国大陆的读者可以直接跳到[微信](#微信)。

!!! tip "时间有限的话，先看这几点"

    - LINE：关闭「允许利用ID加入好友」与「允许被加入好友」，不想让通讯录里的人看到你，再关闭「自动加入好友」
    - Facebook：把未来贴文的分享对象改成朋友，关闭用电话号码与 email 找到你
    - Instagram 与 Threads：改成私密账号，限制谁可以标注或提及你
    - 微信：开启「加我为朋友时需要验证」，不想让对方看到生活的朋友设成「仅聊天」
    - 不同用途的账号，头像与电话号码都不要重复

## 建立账号的注意事项

账号建立之后，最容易把你跟其他账号串在一起的是电话号码、email 与照片[^ssd-sn]：

- **名字**：部分平台的实名规定已经放宽，不想用本名就不要用。想用昵称时，先想一下认得这个昵称的有哪些人[^ssd-sn]
- **电话号码与 email**：只给必要的数据。想跟主要身份分开的账号，用另一个 email，能不给电话就不给。email 别名可以替每个账号产生不同的地址，见 [邮件别名怎么用](./email-alias.md)。别名服务看得到经过它的信，等于多信任一家服务商[^ssd-sn]
- **头像**：照片的 metadata 可能有拍摄时间与地点，画面本身也会透露信息，例如家门口、公司、门牌、路标，连玻璃上的反射都可能认出地点[^ssd-sn]
- **密码提示问题**：「出生的城市」、「宠物的名字」这类答案常常能从你的贴文找到。可以填一个假答案，存在密码管理器的备注栏[^ssd-sn]（见 [密码管理器入门](./password-manager.md)）
- **登录保护**：每个平台都用不重复的强密码，打开两步验证[^ssd-sn]

想让两个账号分开，两边的头像要用没在其他地方出现过的照片。可以用以图搜图检查一张照片还出现在哪里，也可以用 username 检查服务找出自己忘记的旧账号[^ssd-sn]。找到不想公开的数据时，一次处理一笔即可，不必一口气把自己从网络上清掉[^ssd-sn]。分层经营账号的完整做法见 [怎么维持多个网络身分](../basics/multiple-identities.md)。

新兴的社交平台在安全、隐私与举报工具上可能比较简陋，隐私政策也比较常改。Mastodon 这类联邦式的平台运作方式不同，贴文可能被复制到其他服务器，要用另一套方式思考隐私[^ssd-sn]。

## LINE

LINE 的隐私设置集中在「主页 > 设置」底下，多数要在手机上操作，电脑版与平板只有部分选项。2026 年 10 月改版后，好友分页移到「聊天」页的上方[^line-ui]。

### ID 与电话号码的加好友设置

- **允许利用ID加入好友**：主页 > 设置 >「个人资料」，关闭之后，包含好友在内，没有人可以用 LINE ID 搜索到你。LINE ID 设置之后就不能更改[^line-add]
- **允许被加入好友**：主页 > 设置 >「好友」，关闭之后，有你电话号码的人无法用号码加你[^line-add]
- **行动条码与邀请链接**：给过别人的 QR code 与链接会一直有效，到「聊天 > ＋ > 显示行动条码」按「更新」，旧的才会失效[^line-add]

### 通讯录与「您可能认识的人？」

「自动加入好友」在主页 > 设置 >「好友」，打开之后，LINE 会把你手机通讯录里有用 LINE 的人加成你的好友，通讯录也会上传到 LINE 的服务器比对（官方说明号码加密保存，不会显示给其他用户）[^line-contacts]。

只关「允许被加入好友」还不够。你的「自动加入好友」如果开着，通讯录里存了你号码、也开着「自动加入好友」的人，仍然可能在他的「您可能认识的人？」名单看到你，显示的是你在 LINE 上设的名称[^line-pymk]。不想让前任或同事从通讯录找到你，两个开关都要关。LINE 的说明也写明，要让自己完全不出现在别人的好友或「您可能认识的人？」名单，只能删除账号[^line-contacts]。

### 非好友的消息与群组邀请

- **阻挡消息**：主页 > 设置 >「隐私设置」，打开之后不会收到「您可能认识的人？」名单上的人传来的消息，已经是好友的人不受影响[^line-block]
- **未读聊天邀请**：非好友的消息与群组邀请集中在「聊天」页上方的「未读聊天邀请」，可以逐一加入好友、封锁、接受或拒绝群组邀请。支持中心没有列出拒绝所有群组邀请的设置，群组也无法封锁，只能退出，退出时所有成员都会看到你已退出[^line-invite][^line-group]

### 个人资料与生日

好友点你的头像就看得到你的个人图片、名称、封面、状态消息与生日，支持中心没有列出分项设置谁可以看哪一栏的功能[^line-profile]。生日在主页 > 设置 >「个人资料」>「生日」，关闭「显示我的生日」之后别人就看不到[^line-profile]。

LINE VOOM 在台湾已于 2026 年 9 月 30 日结束服务，贴文、限时动态与追踪功能都一起停止，网络上教 VOOM 公开范围的文章已经不适用[^line-voom]。

### 隐藏、封锁与已读

在好友名单长按对方，可以选「隐藏」、「封锁」或「删除」。隐藏之后仍然会收到对方的消息与通话，封锁之后收不到。三种操作都不会通知对方，你也不会从对方的好友名单消失。被封锁的人在你们共同的群组里发的消息，你仍然看得到[^line-hide]。

支持中心没有列出关闭已读的设置。对方的通知跳出时，系统就可能判定为已读，群组里显示的是已读的人数[^line-read]。

### 社群的个人资料

LINE 社群（OpenChat）可以不公开你的 LINE 账号名称加入，每个社群可以设置不同的昵称与图片[^line-openchat]。想在兴趣社群里发言、又不想让人连到你的主要账号，就在加入时换一个个人资料，头像也不要沿用主要账号的照片。

### 密码锁定与其他设备

- **密码锁定**：主页 > 设置 >「隐私设置」，打开之后打开 LINE 要输入密码，可以搭配 Face ID 或指纹。忘记密码只能重装 App，没备份的聊天记录会消失[^line-lock]
- **允许自其他设备登录**：主页 > 设置 >「我的账号」，控制电脑与平板能不能用你的账号登录。同一页的「登录中的设备」可以看到目前登录的设备，逐一注销或全部注销[^line-devices]。家人或伴侣可能在你不知情时登录电脑版，定期检查这份清单

## Facebook

Facebook 的设置都从右上角的大头贴照进入「设置和隐私 > 设置」，大部分在「分享对象和能见度」底下。下面的路径依 Facebook 说明中心的电脑版说明，手机 App 的路径我们没有逐一核对。Facebook 也有「隐私设置检查」，用问答的方式一步步检查分享对象与别人如何找到你，第一次调整时可以从那里开始[^fb-checkup]。

### 贴文的分享对象

- **往后的贴文**：设置 > 分享对象和能见度 >「贴文」>「谁可以查看你往后的贴文？」，改成「朋友」。发文时也可以逐则调整[^fb-future]
- **旧贴文**：同一页的「限制旧贴文分享对象」会把所有公开或朋友的朋友可见的旧贴文一次改成「朋友」，无法一键复原。别人发文标注你的贴文不受影响，由发文的人决定[^fb-past]
- **打卡**：打卡的地点跟着那则贴文的分享对象。公开的打卡贴文，地点粉丝专页的管理员也看得到[^fb-checkin]

### 被搜索与被找到的途径

- **用电话号码与 email 找到你**：分享对象和能见度 >「其他人如何寻找和联系你」，「拥有你电子邮件地址的用户」与「拥有你手机号码的用户」两列都改成「没有人」。说明中心写明，email 地址里如果含有你的全名，仍可能被搜到[^fb-lookup]
- **搜索引擎**：同一页关闭「是否要让 Facebook 以外的搜索引擎链接你的个人资料？」。已经公开的信息仍可能被搜索引擎另外收录[^fb-search]
- **朋友名单**：同一页的「谁可以查看你的朋友名单？」默认是公开，可以改成只限本人。朋友把自己的名单设为公开时，你们的朋友关系仍然看得到[^fb-friends]
- **个人数据**：个人资料 >「关于」>「联系和基本资料」，工作经历、学历、感情状况、家庭成员、地点与生日可以逐栏设置公开、朋友或只限本人[^fb-about]

### 标注与上线状态

- **标签检阅**：分享对象和能见度 >「个人资料和标签」，打开「检阅其他人对你贴文添加的标签」与「检阅你被标注在内的贴文」，别人标注你之后要你同意才会显示在你的个人资料上。被标注的贴文仍可能出现在搜索与动态消息[^fb-tagreview][^fb-timeline]
- **上线状态**：Facebook 与 Messenger 要分别关闭，只关一边，另一边仍可能显示你在在线。关闭之后你也看不到别人的上线状态[^fb-active]

Facebook 另有「锁住个人资料」，锁住之后非朋友只看得到有限的内容，但说明中心写明只开放部分国家或地区，在台湾能否使用请以你的 App 为准[^fb-lock]。

### Facebook 社团

许多倡议与社区组织用 Facebook 社团联系，但社团的设计不是为了安全协作，Facebook 本身看得到所有内容，也可能收到政府要求交出内容或成员数据[^ssd-fbg]。话题敏感的话，可以考虑改用端对端加密的工具（见 [匿名通讯工具比较](./messaging-comparison.md)），成员无法离开 Facebook 时，下面几点可以降低风险[^ssd-fbg]。

- **公开或私密**：公开社团的贴文所有人都看得到，私密社团只有成员看得到贴文与成员名单，管理员可以再选择「开放搜索」或「隐藏」。私密社团设为开放搜索时，管理员与版主是谁所有 Facebook 用户都看得到，设为隐藏才只有成员与受邀的人看得到[^fb-groups]
- **改成私密的限制**：公开社团要改成私密，限成员少于 10,000 人或成立不满 30 天[^fb-groups]，所以创建前就要想好社团的主题、谁该知道它的存在、成员想不想让别人知道自己加入[^ssd-fbg]
- **用昵称发文**：其他成员看不到你的主要个人资料，管理员、版主与 Facebook 系统仍然看得到你的姓名与大头贴照[^fb-anon]
- **社团规则**：截屏与转传在技术上挡不掉，可以在社团说明写明不得截屏外流，违反者移出社团[^ssd-fbg]
- **管理员**：至少要有两位管理员，最好其中一位用本名。Facebook 要求使用真实身份，用假名的管理员可能被举报停权，社团的管理权会因此转到其他人手上[^ssd-fbg]
- **移出与封锁**：只有管理员可以移除成员。不想让退出的人再看到社团，要封锁对方，暂时处理可以先停权[^ssd-fbg]
- **另外保存成员名单**：Facebook 可能删除违反规定的社团，讨论纪录与成员名单会一起消失。没有另外留存联系方式，就无法再联系社区[^ssd-fbg]

## Instagram

我们没能从官方说明中心取得 Instagram 正体中文界面的菜单名称，下面依英文版说明描述功能，实际名称以你的 App 为准。

- **私密账号**：在设置的账号隐私打开私密账号，只有你核准的追踪者看得到贴文与限时动态。未满 18 岁的账号默认就是私密账号，商业账号不能设成私密账号[^ig-private]
- **挚友**：限时动态可以只分享给挚友名单，加入或移出名单都不会通知对方[^ig-close]
- **已读**：可以对所有聊天室或单一聊天室关闭已读回条，单一聊天室的设置优先[^ig-read]
- **地图**：Instagram 的地图功能默认不分享位置。打开之后，每次打开 App 会更新位置，分享对象在地图的设置里选择，这个设置跟手机的定位权限分开。说明页没有写哪些地区开放这个功能[^ig-map]
- **标注与提及**：可以限制谁能标注或提及你[^ig-tags]

## Threads

Threads 也一样，我们没能取得正体中文的菜单名称，下面依官方说明描述功能。

- **名称、大头贴照、用户名与自我介绍一律公开**，在 Threads 以外与 Facebook 等 Meta 的产品上都看得到，改成私人个人资料也一样[^threads-private]
- **私人个人资料**：只有你核准的追踪者，以及你回复过的人，看得到你的贴文，别人也不能把你的贴文分享到 Instagram 或 Facebook 的限时动态[^threads-private]
- **联邦宇宙分享**：打开之后，Mastodon 等其他服务器的用户可以搜索、追踪、转分享你的贴文。改回私人个人资料会关闭分享，并要求其他服务器删除你的数据，但不保证都会删除[^threads-fedi]

## 微信

微信的聊天不是端对端加密，Citizen Lab 2024 年的分析指出，微信的服务器可以解密传输中的消息[^citizenlab]。平台本身能取得哪些数据，见 [社交平台怎么收集你的数据](../basics/platform-tracking.md) 的〈境内平台另有一套〉，下面只处理同一个平台上的其他人。路径依 2026 年 8 月 17 日生效的《微信隐私保护指引》与腾讯客服的说明[^wx-privacy]。

### 加好友的方式

- **加我为朋友时需要验证**：我 > 设置 > 朋友权限，开启之后，别人要等你通过验证才能加你[^wx-verify]
- **添加我的方式**：同一页可以分别关闭别人用手机号、微信号、QQ号搜索到你[^wx-search]。关闭搜索之后，别人仍可能通过扫二维码这类其他方式加你[^wx-other]
- **向我推荐通讯录朋友**：同一页可以关闭，微信就不再读取通讯录推荐朋友[^wx-privacy]

### 朋友圈的可见范围

- **时间范围**：我 > 设置 > 朋友权限 > 朋友圈，「允许朋友查看朋友圈的范围」可以选最近三天、最近一个月、最近半年或全部。同一页可以关闭「允许陌生人查看十条朋友圈」[^wx-range]
- **不让他（她）看**：同一页可以一次选多位朋友，也可以从单一朋友的资料页设置[^wx-hide]
- **单条朋友圈**：发布时点「谁可以看」，可以选公开、私密、部分可见或不给谁看，已经发出的可以从右上角修改可见范围[^wx-post]

### 仅聊天

每位朋友的朋友权限可以设成「仅聊天」，对方只能跟你聊天、音视频通话、转账、发红包，看不到你在朋友圈、视频动态与微信运动发表的内容[^wx-chatonly]。工作上必须加、又不想让对方看到生活的人，可以这样设置。

### 微信运动、视频号与附近的人

- **微信运动**：朋友看得到你的步数排行，在微信运动的「隐私及提醒设置」关闭「加入排行榜」，或者整个停用[^wx-werun]
- **视频号的赞**：爱心赞的内容可能会向朋友展示，拇指赞只有自己看得到[^wx-privacy]
- **附近的人**：会记录你的位置，从发现 >「附近的人」> 右上角「…」>「清除位置信息并退出」关闭。部分版本的发现页没有这个入口[^wx-privacy]

### 群聊

群成员看得到你的头像与昵称[^wx-privacy]。群成员可以直接把你拉进群，微信目前不支持拒绝或屏蔽加入群聊，只能事后退出[^wx-group]。

## 朋友之间的隐私

保护隐私是朋友之间互相的事。即使你没有账号，或者把自己的标注拿掉，朋友仍然可能在照片里认出你、透露你在哪里、公开你们的关系[^ssd-sn]。可以跟朋友谈好哪些事不要贴出来，例如聚会的地点、合照里有谁、孩子的照片。家人与伴侣共用设备或账号时的状况，另见 [家暴受害者的数字准备](../scenarios/domestic-violence.md)。

各平台的设置会随改版变动，有时变得更保护隐私，有时把原本不公开的信息变成公开，或者多出新的开关，平台公告隐私政策更新时值得回来检查一次[^ssd-sn]。

## 本页的来源与核对

本页依 EFF [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"} 的两篇指南改写，两篇都以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hant){target="_blank"} 授权：

- 〈[Protecting Yourself on Social Networks](https://ssd.eff.org/module/protecting-yourself-social-networks){target="_blank"}〉，审阅日 2023-10-13
- 〈[Facebook Groups: Reducing Risks](https://ssd.eff.org/module/facebook-groups-reducing-risks){target="_blank"}〉，审阅日 2023-10-13

跟原文不同的地方：原文以通则说明各平台常见的设置，本页改成 LINE、Facebook、Instagram、Threads 逐项的设置，简体中文版另加微信。菜单名称与功能依 LINE 支持中心（台湾）、Facebook 说明中心（正体中文，电脑版）、Instagram 说明中心（英文，读取自网页存档）与腾讯客服。Facebook 社团的设置以 2026 年的说明中心为准，例如公开社团改成私密的门槛已经从原文的 5,000 名成员改成 10,000 名。原文建议读隐私政策、封锁第三方 cookie 与关闭广告识别码的段落，文档站已经写在 [社交平台怎么收集你的数据](../basics/platform-tracking.md) 与 [手机隐私设置逐步指引](./phone-privacy-settings.md)，本页不重复。与原文不同之处由匿名网络社区 anoni.net 负责，不代表 EFF 的立场。

菜单名称 2026 年 11 月核对。平台改版频繁，照着做却找不到选项，欢迎到社区的在线聊天室（[Matrix 公开 room](https://anoni.net/services/){target="_blank"}）告诉我们。

## 相关阅读

- [社交平台怎么收集你的数据](../basics/platform-tracking.md)：平台本身取得哪些数据
- [怎么维持多个网络身分](../basics/multiple-identities.md)：账号分层与外部观察者的反查手法
- [手机隐私设置逐步指引](./phone-privacy-settings.md)：App 的位置、通讯录与照片权限
- [Signal 的设置与群组管理](./signal-guide.md)：敏感的对话与群组改用端对端加密

[^ssd-sn]: [Protecting Yourself on Social Networks](https://ssd.eff.org/module/protecting-yourself-social-networks){target="_blank"} - EFF Surveillance Self-Defense，审阅日 2023-10-13。
[^ssd-fbg]: [Facebook Groups: Reducing Risks](https://ssd.eff.org/module/facebook-groups-reducing-risks){target="_blank"} - EFF Surveillance Self-Defense，审阅日 2023-10-13。
[^line-ui]: [LINE页面更新相关说明](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=200001630){target="_blank"} - LINE 支持中心。
[^line-add]: [拒绝被加入好友](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20000383){target="_blank"} - LINE 支持中心。
[^line-contacts]: [使用通讯录数据的相关说明](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=10002423){target="_blank"} - LINE 支持中心。
[^line-pymk]: [显示在「您可能认识的人？」名单的条件](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20000382){target="_blank"} - LINE 支持中心。
[^line-block]: [如何避免被不认识的人邀请加入聊天室或群组？](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20027010){target="_blank"} - LINE 支持中心。
[^line-invite]: [如何管理来自非好友用户的邀请？](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=200002115){target="_blank"} - LINE 支持中心。
[^line-group]: [退出／删除／封锁群组的操作方法](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20000420){target="_blank"} - LINE 支持中心。 <!-- docs-style-lint: disable-line -->
[^line-profile]: [个人资料的基本说明](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20000134){target="_blank"} - LINE 支持中心。
[^line-voom]: [【结束服务】LINE VOOM结束服务公告](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=200000301){target="_blank"} - LINE 支持中心，更新日 2026-11-02。
[^line-hide]: [隐藏好友、封锁好友与删除好友的基本说明](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20000390){target="_blank"} - LINE 支持中心。
[^line-read]: [聊天消息发送状况及已读／未读的确认方法](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20021705){target="_blank"} - LINE 支持中心。 <!-- docs-style-lint: disable-line -->
[^line-openchat]: [社群的基本设计说明（社群成员用）](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20005375){target="_blank"} - LINE 支持中心。
[^line-lock]: [如何设置LINE的密码锁定功能？](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20023658){target="_blank"} - LINE 支持中心。
[^line-devices]: [如何确认自己在哪些设备上登录LINE或LINE相关服务？](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20008468){target="_blank"} - LINE 支持中心。另见[允许自追加设备（电脑／平板电脑）登录的设置变更方法](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20000112){target="_blank"}。 <!-- docs-style-lint: disable-line -->
[^fb-checkup]: [Facebook 隐私设置检查](https://www.facebook.com/help/443357099140264?locale=zh_TW){target="_blank"} - Facebook 说明中心。
[^fb-future]: [设置 Facebook 贴文的默认分享对象](https://www.facebook.com/help/336801584336688?locale=zh_TW){target="_blank"} - Facebook 说明中心。
[^fb-past]: [选择可以看到您先前 Facebook 贴文的对象](https://www.facebook.com/help/236898969688346?locale=zh_TW){target="_blank"} - Facebook 说明中心。
[^fb-checkin]: [如何使用 Facebook 在附近地点打卡](https://www.facebook.com/help/174846215904356?locale=zh_TW){target="_blank"} - Facebook 说明中心。
[^fb-lookup]: [控制 Facebook 能根据您的电子邮件地址或手机号码向谁建议您的个人资料](https://www.facebook.com/help/131297846947406?locale=zh_TW){target="_blank"} - Facebook 说明中心。
[^fb-search]: [如果不想要搜索引擎链接你的 Facebook 个人资料，该怎么做](https://www.facebook.com/help/124518907626945?locale=zh_TW){target="_blank"} - Facebook 说明中心。
[^fb-friends]: [调整谁能在 Facebook 看到您的「朋友」区块](https://www.facebook.com/help/115450405225661?locale=zh_TW){target="_blank"} - Facebook 说明中心。
[^fb-about]: [如何编辑 Facebook 个人资料及其分享对象](https://www.facebook.com/help/276177272409629?locale=zh_TW){target="_blank"} - Facebook 说明中心。
[^fb-tagreview]: [检阅用户在您 Facebook 贴文添加的标签](https://www.facebook.com/help/247746261926036?locale=zh_TW){target="_blank"} - Facebook 说明中心。
[^fb-timeline]: [在您被标注的贴文出现在您的个人资料中之前先行查看](https://www.facebook.com/help/168229546579373?locale=zh_TW){target="_blank"} - Facebook 说明中心。
[^fb-active]: [Facebook 和 Messenger 上线状态的运作方式](https://www.facebook.com/help/448141485230424?locale=zh_TW){target="_blank"} - Facebook 说明中心。
[^fb-lock]: [锁住您的 Facebook 个人资料](https://www.facebook.com/help/196419427651178?locale=zh_TW){target="_blank"} - Facebook 说明中心。
[^fb-groups]: [公开与私密 Facebook 社团的差异](https://www.facebook.com/help/220336891328465?locale=zh_TW){target="_blank"} - Facebook 说明中心。
[^fb-anon]: [在 Facebook 社团中使用昵称参与交互](https://www.facebook.com/help/1997112804420300?locale=zh_TW){target="_blank"} - Facebook 说明中心。
[^ig-private]: [Instagram Help Center：私人账号](https://help.instagram.com/448523408565555){target="_blank"} - 英文说明页，读取自 2026 年的网页存档。
[^ig-close]: [Instagram Help Center：挚友](https://help.instagram.com/476003390920140){target="_blank"} - 英文说明页，读取自 2026 年的网页存档。
[^ig-read]: [Instagram Help Center：已读回执](https://help.instagram.com/1586876252167004){target="_blank"} - 英文说明页，读取自 2026 年的网页存档。
[^ig-map]: [Instagram Help Center：地图](https://help.instagram.com/402343555458995){target="_blank"} - 英文说明页，读取自 2026 年的网页存档。
[^ig-tags]: [Who can mention or tag you on Instagram](https://help.instagram.com/345505572238391){target="_blank"} - Instagram Help Center。
[^threads-private]: [Threads Help Center：公开与私密个人资料](https://help.instagram.com/756440792648838){target="_blank"} - 英文说明页，读取自 2026 年的网页存档。
[^threads-fedi]: [Threads Help Center：联邦宇宙分享](https://help.instagram.com/760878905943039){target="_blank"} - 英文说明页，读取自 2026 年的网页存档。
[^citizenlab]: [Should We Chat, Too? Security Analysis of WeChat's MMTLS Encryption Protocol](https://citizenlab.ca/2024/10/should-we-chat-too-security-analysis-of-wechats-mmtls-encryption-protocol/){target="_blank"} - Citizen Lab，2024-10-15。
[^wx-privacy]: [微信隐私保护指引](https://weixin.qq.com/cgi-bin/readtemplate?lang=zh_CN&t=weixin_agreement&s=privacy&head=true){target="_blank"} - 腾讯，2026-08-17 生效。
[^wx-verify]: [微信如何设置加我为好友时需要验证？](https://kf.qq.com/touch/wxappfaq/150609q6rmUv150609byquA3.html){target="_blank"} - 腾讯客服。
[^wx-search]: [微信如何能让别人添加好友时搜索不到我？](https://kf.qq.com/touch/wxappfaq/120813euEJVf141211fIVjQV.html){target="_blank"} - 腾讯客服。
[^wx-other]: [添加/删除微信好友及公众号的方法](https://kf.qq.com/faq/161223eEzAR7161223VjAf63.html){target="_blank"} - 腾讯客服。
[^wx-range]: [微信朋友圈怎么设置权限](https://kf.qq.com/touch/wxappfaq/180914J7jQrm180914uUVbq2.html){target="_blank"} - 腾讯客服。
[^wx-hide]: [微信如何设置不让他看我的朋友圈？](https://kf.qq.com/touch/wxappfaq/120813euEJVf141211i2yuqY.html){target="_blank"} - 腾讯客服。
[^wx-post]: [微信朋友圈发布照片时如何设置公开/私密权限？](https://kf.qq.com/touch/wxappfaq/120813euEJVf141211bQfMRV.html){target="_blank"} - 腾讯客服。
[^wx-chatonly]: [设置朋友权限](https://support.weixin.qq.com/cgi-bin/mmsupport-bin/newreadtemplate?t=contact%2Ffaq1){target="_blank"} - 微信帮助中心。
[^wx-werun]: [微信运动步数排行榜怎么开启或关闭？](https://kf.qq.com/touch/wxappfaq/181012iqEzYB181012JZNFzi.html){target="_blank"} - 腾讯客服。
[^wx-group]: [微信怎么建群？](https://kf.qq.com/touch/wxappfaq/120813euEJVf141211vYzMbi.html){target="_blank"} - 腾讯客服。
