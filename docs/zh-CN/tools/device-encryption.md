---
title: 设备加密与数据抹除
description: 全盘加密让遗失、被偷或被拿走的电脑与手机读不出数据，也是固态硬盘唯一可靠的删除方式。本页说明恢复密钥该存在哪里、Windows、Mac、Linux、iPhone、Android 如何打开加密，以及丢弃文件、出售或送出设备之前要做的事。
icon: material/harddisk
---

# :material-harddisk: 设备加密与数据抹除

笔记本电脑忘在公交车上、手机被偷，或室友、同事、家人、执法人员取得你的设备，里面的数据能不能被读出来，取决于有没有打开全盘加密（也称为设备加密）。打开之后，设备关机时整个存储空间都是加密的，要输入密码登录才会解开，把硬盘拆下来接到别台电脑也读不出内容[^ssd-enc]。

加密也跟删除有关。把文件丢进垃圾桶再清空，文件仍留在磁盘上，现代电脑与手机用的固态硬盘（SSD）更是几乎无法可靠地覆写单一文件。对 SSD 来说，事先加密、再重置设备，是最实际的删除方式[^ssd-del]。

本页依 EFF Surveillance Self-Defense 的〈How to: Encrypt Your Windows, Mac, or Linux Computer〉与〈How to: Delete Your Computer's Data Securely〉两篇合并改写（出处见[本页的来源与核对](#本页的来源与核对)）。

!!! tip "时间有限的话，先看这几点"

    - iPhone 设好密码、Android 设好屏幕锁定，手机就已经加密，重点是密码够长
    - 电脑确认 Windows 的「设备加密」或 BitLocker、Mac 的「文件保险箱」已经打开
    - 恢复密钥存在 Microsoft 或 Apple 账号里比较不会弄丢，代价是厂商握有解锁的钥匙
    - 出售或送出设备之前，先确认已加密，再用系统的重置功能清除

## 全盘加密挡得住什么

全盘加密保护的是关机或锁定中的设备。开机登录之后数据就是解开的状态，这时被人拿走、或被要求当场解锁，加密都帮不上忙[^ssd-enc]。出入境被要求解锁的情境见 [出差与研讨会的数字准备](../scenarios/asia-travel.md)。

Windows 与 macOS 都内置免费的全盘加密，不必另外安装软件。两者都是封闭源代码，但使用 Windows 或 macOS 本来就某种程度信任了 Microsoft 与 Apple。多数 Linux 发行版用 LUKS（Linux Unified Key Setup）[^ssd-enc]。

## 恢复密钥存在哪里

打开加密时，系统会产生一组恢复密钥，忘记密码时用它解锁。密钥与密码都弄丢的话，数据多半就永远救不回来了[^ssd-enc]。保存的方式有两种：

- **存在 Microsoft 或 Apple 账号里**：忘记密码时用账号就能解锁，厂商也能协助恢复访问。代价是厂商握有解密需要的密钥，依法被要求时可能交给执法机关。对窃贼与其他人仍然有保护效果[^ssd-enc]
- **自行保存**：厂商拿不到密钥，但弄丢了就没有任何补救方式。捡到密钥的人也能解锁你的电脑，所以要存在安全的地方[^ssd-enc]

自行保存时，印在纸上的话，放进防火保险箱，或交给住在别处、你信任的亲友。存成数字文件的话，不要放在同一台电脑或你平常用的云盘，改存进密码管理器，而且密码管理器的账号密码要跟电脑的不同[^ssd-enc]。密码管理器的选择见 [密码管理器入门](./password-manager.md)。

## 各设备的打开方式

=== "Windows"

    Windows 的全盘加密有两种名称，「设备加密」与「BitLocker 驱动器加密」。设备加密在家用版也能使用，但硬件要支持。用 Microsoft 账户或公司、学校账户第一次登录时，设备加密会自动打开，恢复密钥也会存进该账户。使用本地账户时不会自动打开[^ms-enc]。

    确认或打开的位置是「设置」>「隐私和安全性」>「设备加密」，需要用管理员账户登录。看不到这个选项，可能是硬件不支持，或你登录的是标准用户账户[^ms-enc]。

    BitLocker 只在专业版、企业版、教育版提供，打开时可以选择把恢复密钥存进 Microsoft 账户、存成文件或印出来[^ssd-enc]。存在 Microsoft 账户里的恢复密钥，可以在另一台设备登录 [account.microsoft.com/devices/recoverykey](https://account.microsoft.com/devices/recoverykey){target="_blank"} 查看[^ms-key]。

    家用版的硬件又不支持设备加密时，就没有内置的加密可以用，EFF 建议改用 VeraCrypt，操作可以参考新闻自由基金会（Freedom of the Press Foundation）的教学[^ssd-enc]。

=== "Mac"

    配备 Apple 芯片或 T2 安全芯片的 Mac，数据本来就会自动加密。打开「文件保险箱」之后，必须输入登录密码才能解密，多一层保护。没有这两种芯片的 Mac，要打开「文件保险箱」才会加密[^apple-fv]。

    1. 苹果菜单 >「系统设置」>「隐私与安全」>「文件保险箱」（可能需要向下滚动）
    2. 打开「文件保险箱」，输入密码
    3. 选择忘记密码时的解锁方式：「允许我的 iCloud 账户解锁我的磁盘」，或「创建恢复密钥且不使用我的 iCloud 账户」。选后者的话，写下恢复密钥并保存在安全的地方，不要跟 Mac 放在一起[^apple-fv]

=== "Linux"

    多数 Linux 发行版只能在安装操作系统时打开全盘加密，Ubuntu、Fedora、Arch Linux 都是如此。安装时没有打开的话，通常要备份数据、清空磁盘、重新安装[^ssd-enc]。

    以 Ubuntu 为例，在安装程序的磁盘设置选择使用 LVM 并加密新的安装，接着设置加密用的密码，也可以选择产生恢复密钥。安装完成后，每次开机都要先输入加密密码，这组密码跟登录密码不同[^ssd-enc]。各发行版的选项名称与位置不同，以安装程序的说明为准。

=== "iPhone"

    设置密码就会打开数据保护，用 256 位 AES 加密 iPhone 上的数据[^apple-passcode]。位置在「设置」>「面容 ID 与密码」（依机型可能是「触控 ID 与密码」）。6 位数字之外，可以在「密码选项」改用更长的字母数字密码。

=== "Android"

    Android 10 以上出厂的新设备使用基于文件的加密[^aosp-enc]。保护效果取决于屏幕锁定，没有设置 PIN、图案或密码时，取得手机的人不需要任何密码就能读取数据。屏幕锁定的设置见 [手机隐私设置逐步指引](./phone-privacy-settings.md)。

## 删除文件为什么删不干净

电脑一般不会真的「删除」文件。丢进垃圾桶再清空，系统只是把文件隐藏起来，标记那块空间可以被覆写，实际被覆写可能是几周、几个月甚至几年之后。在那之前，用恢复软件或取证工具就可能把文件找回来[^ssd-del]。

传统的机械硬盘可以靠立刻覆写解决。SSD、U 盘与存储卡则用了「磨损均衡」（wear leveling）的技术，每个区块能抹写的次数有限，磁盘会把修改后的数据写到别的区块，旧区块只标记为失效。即使你发出指令覆写一个文件，也无法保证原本的区块真的被覆写。操作系统删除文件后会送出 TRIM 指令，数据最终会被清掉，但无法确定是什么时候[^ssd-del]。2015 年以后买的电脑多半是 SSD[^ssd-del]。

所以在 SSD 上，加密比事后删除可靠。文件就算还留在磁盘上，取得设备的人没有密钥也只看到乱码[^ssd-del]。

## 出售、送人或丢弃之前

- **电脑（SSD）**：先确认已经加密，再重置成出厂状态。部分 SSD 厂商在 BIOS 提供安全抹除工具，可以当作额外的一步[^ssd-del]
    - Windows：「初始化电脑」选「删除所有内容」，并开启「清理数据」，会删除文件并清理驱动器。Microsoft 注明这项功能不符合政府与产业的数据清除标准[^ms-reset]
    - Mac：「系统设置」>「通用」>「传输或还原」>「抹掉所有内容和设置」[^apple-mac-erase]
- **电脑（机械硬盘）**：整颗磁盘先覆写过再处理。磁盘一直都有加密的话，销毁主密钥就能让内容无法读取，比整颗覆写快得多[^ssd-del]
- **iPhone**：先退出登录 Apple 账户，再到「设置」>「通用」>「传输或还原 iPhone」>「抹掉所有内容和设置」[^apple-iphone-sell]
- **Android**：先记下手机上的 Google 账户与密码，再恢复出厂设置，各品牌的菜单位置不同[^google-reset]
- **光盘**：跟纸本一样用碎纸机处理，没有碎纸机就折成小块再丢[^ssd-del]

在二手平台出售物品时的照片与数据处理，见 [在二手平台卖东西](../utils/case-secondhand.md)。

## 删除单一文件

机械硬盘上的单一文件，可以用开放源代码的 [BleachBit](https://www.bleachbit.org/){target="_blank"} 安全删除，支持 Windows 与 Linux。macOS 很早就拿掉了安全删除功能，Mac 请改靠「文件保险箱」[^ssd-del]。BleachBit 的主要功能[^ssd-del]：

- **Shred Files / Shred Folders**：选择文件或文件夹后永久删除，文件夹会先逐一删除里面的文件
- **预设清理项目**：一次清除某个软件的痕迹，例如浏览器的暂存盘、浏览记录与密码。有些项目会清掉软件本身以外的所有数据，先按 Preview 看清楚要删什么，不确定用途的系统项目不要勾
- **Wipe Free Space**：把磁盘的空白区域覆写成随机数据，清掉已删除文件的残留，空间越大花的时间越久

这些功能在 SSD 上无法保证效果，原因见上一节。

## 删除的其他限制

以上方法只删得到这台电脑上的那一份。备份、另一颗硬盘、U 盘、邮件服务器、云端，以及已经寄给别人的副本都不会一起删除，要安全删除一个文件，必须删掉所有副本。文件放上 Dropbox 这类云端服务之后，通常无法保证它被永久删除[^ssd-del]。

文件删掉了，名称与痕迹也可能留在系统里，例如 Office 的「最近使用的文档」、终端机的指令记录，类似的程序可能有几十个。要百分之百确定记录消失，只能整颗磁盘覆写并重新安装操作系统[^ssd-del]。

## 本页的来源与核对

本页合并 EFF [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"} 的两篇指南改写，两篇都以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hans){target="_blank"} 授权：

- 〈[How to: Encrypt Your Windows, Mac, or Linux Computer](https://ssd.eff.org/module/how-encrypt-your-windows-device){target="_blank"}〉，审阅日 2025-02-06
- 〈[How to: Delete Your Computer's Data Securely](https://ssd.eff.org/module/how-delete-your-data-securely-windows){target="_blank"}〉，审阅日 2025-05-08

改写时加入手机的加密、出售设备前的重置步骤，并依官方说明更新了 Windows 设备加密的行为（使用 Microsoft 账户登录时自动打开、恢复密钥存入账户）。原文 BleachBit 的逐步安装说明没有收录。本页未经 EFF 审阅，内容与原文不同之处由匿名网络社区 anoni.net 负责。

设置步骤 2026 年 11 月依 Microsoft 支持、Apple 的 Mac 与 iPhone 使用手册、Apple 支持、Android 帮助中心与 Android 开放源代码项目核对。照着做却找不到选项，欢迎到社区的在线聊天室（[Matrix 公开 room](https://anoni.net/services/){target="_blank"}）告诉我们。

## 相关阅读

- [一般人平常该做到什么](../scenarios/everyday-baseline.md)：全盘加密在日常准备里的位置
- [出差与研讨会的数字准备](../scenarios/asia-travel.md)：被要求当场解锁时，加密之外要准备的事
- [在二手平台卖东西](../utils/case-secondhand.md)：上架照片的 metadata 与截屏屏蔽
- [什么是 age](./what-is-age.md)：只加密单一文件时的做法

[^ssd-enc]: [How to: Encrypt Your Windows, Mac, or Linux Computer](https://ssd.eff.org/module/how-encrypt-your-windows-device){target="_blank"} - EFF Surveillance Self-Defense，审阅日 2025-02-06。
[^ssd-del]: [How to: Delete Your Computer's Data Securely](https://ssd.eff.org/module/how-delete-your-data-securely-windows){target="_blank"} - EFF Surveillance Self-Defense，审阅日 2025-05-08。
[^ms-enc]: [Windows 中的设备加密](https://support.microsoft.com/zh-cn/windows/cf7e2b6f-3e70-4882-9532-18633605b7df){target="_blank"} - Microsoft 支持。
[^ms-key]: [查找 BitLocker 恢复密钥](https://support.microsoft.com/zh-cn/windows/6b71ad27-0b89-ea08-f143-056f5ab347d6){target="_blank"} - Microsoft 支持。
[^ms-reset]: [初始化电脑](https://support.microsoft.com/zh-cn/windows/0ef73740-b927-549b-b7c9-e6f2b48d275e){target="_blank"} - Microsoft 支持。
[^apple-fv]: [使用文件保险箱保护 Mac 上的数据](https://support.apple.com/zh-cn/guide/mac-help/mh11785/mac){target="_blank"} - Mac 使用手册。
[^apple-passcode]: [在 iPhone 上设定密码](https://support.apple.com/zh-cn/guide/iphone/iph14a867ae/ios){target="_blank"} - iPhone 使用手册。
[^apple-mac-erase]: [抹掉 Mac 并还原为出厂设置](https://support.apple.com/zh-cn/102664){target="_blank"} - Apple 支持。
[^apple-iphone-sell]: [出售、赠送或折抵 iPhone 或 iPad 前该怎么做](https://support.apple.com/zh-cn/109511){target="_blank"} - Apple 支持。
[^aosp-enc]: [Encryption](https://source.android.com/docs/security/features/encryption){target="_blank"} - Android 开放源代码项目。Android 10 以上的新设备不允许使用全磁盘加密，改用基于文件的加密。
[^google-reset]: [将 Android 设备恢复出厂设置](https://support.google.com/android/answer/6088915?hl=zh-Hans){target="_blank"} - Android 帮助。
