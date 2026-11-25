---
title: 学生的校园隐私
description: 学校发的平板、学校账号、校园网络与学生证都会留下记录。本页写给国高中生与大学生，说明学校与教育单位实际看得到什么、如何把学校与私人的生活分开、书包与手机的检查规定，以及对学校的做法有疑问时可以走的管道。
icon: material/school-outline
---

# :material-school-outline: 学生的校园隐私

学校发的平板、学校开的账号、校园的 Wi-Fi 与学生证，每一样都会留下记录，看得到这些记录的除了老师，还可能有教育局、教育部与提供服务的厂商。EFF 的看法是，校园监控工具越来越普遍，却还没有证据显示它们让学生更安全，反而可能让学生不敢搜索、不敢说话[^ssd]。

本页写给国高中生与大学生，说明学校实际看得到什么、如何把学校与私人的生活分开，以及觉得学校做得太多时可以怎么提出。本页参考 EFF Surveillance Self-Defense 的〈Privacy for Students〉改写，台湾的学校系统与法规另外查证（出处见[本页的来源与核对](#本页的来源与核对)）。

!!! note "本页以台湾的学校为例"

    学校的系统、检查规定与申诉管道都依台湾的教育部文件与法规。中国大陆、香港、澳门与新马的学校制度不同，本页没有涵盖，「学校与私人的分开」一节的做法仍然适用。

!!! note "从家长那一边看"

    家长能做什么、家长监护工具的能与不能，见 [家长与孩子的网络隐私](./parents-youth.md)。

!!! tip "时间有限的话，先看这几点"

    - 学校发的平板、学校账号、学校的 Wi-Fi，都当成会被看到的地方
    - 私人的账号、敏感的搜索与对话，用自己的设备与移动网络
    - 不要用学校的 email 注册私人服务，毕业前把要留的数据备份出来
    - 对学校的做法有疑问，可以找学生代表、学生会，或依规定提出申诉

## 学校看得到的数据

### 学校发的平板

「生生用平板」这类政府补助的学习载具，都要纳入教育部的行动设备管理系统（MDM，让管理者远程设置、派送 App 与收集使用数据的系统）[^hualien]。教育部的系统以设备序号为单位，每天收集使用时间，用来统计各校的使用率[^moe-2024]。

学校实际用来管理平板的是 Jamf、Intune、Google 这类厂商的系统。学校 MDM 研习的资料写到，学校可以替平板派送与限制 App、关闭 App Store、通过过滤连接挡掉黑名单上的网站，老师在课堂上也可以同时看到约 30 位学生的画面。平板被重设之后，连上网络就会自动装回管理设置[^jamf-qa]。iPad 的位置只有在管理者打开「遗失模式」时才查得到，解除时用户会收到通知[^apple-lost]。

可以带回家的平板也一样受管理。教育部提供给学校的同意书范例写明，学校保留监管、检查、访问载具的权利，并保存学生的电子邮件与网络访问记录，已经有学校照着范例使用[^thsd][^chjh]。

### 学校账号

教育云端账号是终身账号，学校自己开的账号多半在毕业后停用或删除[^openid]。这些账号常常也是学生的 Google Workspace 或 Microsoft 365 账号，例如台北市的 Google 账号由教育局在后台创建，使用数据会进到教育局的报表[^tp-google][^tp-cool]。

管理这类账号的人，技术上可以访问账号里的内容[^google-admin]。Google 的管理工具可以搜索与导出账号里的 Gmail 与云端硬盘数据，云端硬盘的查看、下载、分享记录也会记下用户的 IP，保存 6 个月[^google-vault][^google-logs]。Microsoft 365 的电子文档探索与审核记录有相同的功能，审核记录预设保存 180 天[^ms-ediscovery][^ms-audit]。这些文档说明的是管理者做得到什么，不代表学校或教育局实际这样做，但写在学校账号里的东西，要假设不只你看得到。

### 校园网络

国中小与高中职的网络经过教育部的「不当信息防护系统」，挡下色情、赌博、暴力恐怖、毒品等类别的网站，误挡可以向维运的中山大学团队通报[^tanwp]。教育部表示，这套系统自 2018 年起已经挡下超过 14 亿次连接，黑名单的来源包括用户回报与 iWIN 的申诉[^moe-tanwp]。系统会不会保存浏览记录、保存多久，没有公开数据。

大学的校园网络会记录登录的账号、使用时间、IP 与设备的 MAC 地址[^nsysu-wifi]，有学校规定网络服务的使用记录至少保存 6 个月[^ncnu]。教育部 2001 年订定的校园网络使用规范要求学校尊重网络隐私，不得任意窥视用户的数据，但维护系统安全、有合理怀疑违反校规、配合司法调查时例外[^moe-campus-net]。

学校或公司管理的电脑，管理者可以在上面安装自己的根凭证，之后就能解开这台电脑的 HTTPS 流量[^ssd]。用学校的电脑时，不要假设网址列的锁头代表没有人看得到。

### 学生证与监视器

有感应功能的学生证会记录到校、离校与搭车的刷卡时间。以台北市的数字学生证为例，数据的搜集单位包括教育局、学校、市立图书馆、台北捷运与悠游卡公司，利用方式包含统计研究分析，不同意的学生仍然可以领到不记名的卡[^tp-card]。

校园里的人脸辨识，教育部的指引写明未成年学生要同时取得法定代理人同意，不同意时学校要提供替代方案[^moe-bio]。2019 年台中女中在宿舍装了人脸辨识，学生指出装设前没有取得同意，学校问卷调查后在 2020 年拆除[^tcgs]。2026 年 5 月辅仁大学的图书馆发现伪装成侦烟器的摄影机，学生会要求公开监视器的数量与位置、让学生参与监督，教育部随后要求各校盘点校内有录像功能的设备[^cameras]。

## 学校与私人的分开

能做的事大多是把学校与私人的生活分开[^ssd]：

- **私人的事用自己的设备与网络**：健康、性别、感情、政治这类搜索与对话，不要用学校的平板、电脑或 Wi-Fi。学校的平板带回家、连上家里的网络，仍然在管理之下
- **学校账号只做学校的事**：不要用学校的 email 注册社交或购物网站，也不要在学校的云端硬盘放私人文件。账号可能在毕业后停用，作品与要留的数据提前备份到自己的地方
- **社交账号的设置**：设成私人账号、检查谁在追踪你、想清楚哪些内容放公开账号，见 [社交平台的隐私设置](../tools/social-media-settings.md)
- **位置与 App 权限**：用不到时关掉位置，逐一检查 App 的权限，见 [手机隐私设置逐步指引](../tools/phone-privacy-settings.md)
- **账号与设备的保护**：打开两步验证、用密码管理器，替自己的手机与电脑设置密码与加密，见 [密码管理器入门](../tools/password-manager.md) 与 [设备加密与数据抹除](../tools/device-encryption.md)

隐私也是朋友之间的事。朋友在活动上拍的照片带有时间与地点，标注之后，没有出现在学校系统里的朋友也会被串进来。例如参加 LGBTQ+ 或政治活动的照片被标注，可能让不支持的家长或学校知道[^ssd]。跟朋友说好哪些照片不要公开、不要标注，家人控管下的本机痕迹见 [LGBTQ+ 与性少数的匿名社交](./lgbtq.md)。

## 书包与手机的检查规定

高中以下的学校检查学生的身体、书包或上锁的置物柜，依教育部的注意事项要有特定条件，例如学生有危害他人生命、身体之虞，或涉嫌犯罪、携带违禁物品并经紧急会商认定有危害之虞[^discipline]。检查时至少两人运行，学生可以请一到两位教职员或同学陪同，学生想在场时学校应该同意，过程要全程录像[^discipline]。

手机上课时被收走，通常是依同一份注意事项的暂时保管：物品有妨害学习或校园安全之虞时可以先保管，保管期间不得损坏，没有妨害时要还给学生[^discipline]。注意事项里没有关于查看手机内容的条文。各校的手机使用规定依教育部的原则，要邀请学生代表一起讨论、经校务会议通过[^mobile-rule]。2025 年教育部提出更严的手机管理草案时，有高中生到教育部前静坐，要求在规范里纳入学生的意见[^cna-sitin]。

## 提出疑问的管道

先弄清楚学校用了哪些系统。可以问信息组或学务处：用了哪些平台与监控工具、记录哪些数据、保存多久、谁看得到[^ssd]。

- **自己的数据**：公立学校属于公务机关，你可以依个人数据保护法请求查找、阅览或拷贝学校保存的你的数据，学校要在 15 天内决定，必要时可以延长 15 天[^pdpa]。私立学校适用非公务机关的规定，同样可以提出请求[^pdpa][^moj-private]
- **学生代表与学生会**：高中的校务会议里，学生代表不得少于成员的 8%，订定生活辅导与奖惩规章的会议也要有学生代表出席，学校应辅导学生成立学生会[^hs-act]。大学的校务会议学生代表不得少于十分之一[^univ-act]。国中小的学生只能列席校务会议[^edu-act]
- **申诉**：高中生或学生自治组织认为学校的措施违法或不当、损害自己的权益，可以在知道的隔天起 30 天内以书面向学校申诉，不服再向主管机关申诉[^hs-act]。大学要把申诉制度写在学生手册里[^univ-act]，国中小由家长代为申诉[^edu-act]
- **校刊、连署与公开讨论**：把问题写出来、找同学一起连署，都是 SSD 建议的做法[^ssd]

《儿童权利公约》在台湾有国内法的效力，第 16 条保障儿童的隐私与通信不受恣意或非法干预[^crc]。提出意见时可以引用。

## 常听到的理由与回应

- **「没做坏事就不怕被看」**：隐私保护的是去诊所、参加集会这类正当的事[^ssd]
- **「学校不会滥用」**：数据存在厂商与教育局的系统里，看得到的不只学校，数据可能被分享或外泄[^ssd]
- **「这是为了你的安全」**：EFF 的看法是，目前没有证据显示这类工具让学生更安全，而且会改变学生的行为、破坏信任[^ssd]
- **「反对也没用」**：台中女中的人脸辨识在学生提出意见、学校问卷调查之后拆除了[^tcgs]

## 本页的来源与核对

本页参考 EFF [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"} 的〈[Privacy for Students](https://ssd.eff.org/module/privacy-students){target="_blank"}〉改写，该篇审阅日 2020-03-01，以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hant){target="_blank"} 授权。

跟原文不同的地方：原文写于 2020 年，以美国学校为例，本页沿用它对校园监控的分类、学校与私人分开的建议与常见说法的回应，学校的系统、检查规定与提出疑问的管道改写成台湾的版本，依各自注脚的教育部文件、法规、厂商说明与新闻。原文到学校董事会发言、联系州与联邦议员的建议，换成台湾的学生代表、学生会与申诉制度。与原文不同之处由匿名网络社区 anoni.net 负责，不代表 EFF 的立场。

2026 年 11 月核对。各县市与各校的做法不同，你的学校实际用了哪些系统，以学校的公告与规定为准。

## 相关阅读

- [家长与孩子的网络隐私](./parents-youth.md)：家长那一边的安全计划与家长监护
- [社交平台的隐私设置](../tools/social-media-settings.md)：决定同学、老师、陌生人看得到你什么
- [LGBTQ+ 与性少数的匿名社交](./lgbtq.md)：账号分层与家人控管下的本机痕迹
- [网络封锁的手法与绕过方式](../basics/network-censorship.md)：学校网络的过滤属于哪一种封锁

[^ssd]: [Privacy for Students](https://ssd.eff.org/module/privacy-students){target="_blank"} - EFF Surveillance Self-Defense，审阅日 2020-03-01。
[^hualien]: [花莲县国民中小学促进数字学习载具使用要点](https://xc.hlc.edu.tw/~sljh_www/uploads/tadnews/file/nsn_4454_1_eDU.pdf){target="_blank"} - 花莲县政府，学校转载。
[^moe-2024]: [113 年精进方案推动工作说明](https://www.klgsh.kl.edu.tw/wp-content/uploads/sites/67/2024/05/02-113年精进方案推动工作说明EDU0315-会议版.pdf){target="_blank"} - 教育部信息及科技教育司，2024-03-15，学校转载。
[^jamf-qa]: [行动载具管理 MDM 研习 iOS 系统高级操作 Q&A](https://www.pmai.tn.edu.tw/wp-content/uploads/sites/25/2023/05/112.05.24-行动载具管理MDM研习-第4场次-iOS系统高级操作-QA.pdf){target="_blank"} - 2023-05-24，学校转载。
[^apple-lost]: [Lock and locate devices](https://support.apple.com/guide/deployment/lock-and-locate-devices-depb980a0be4/web){target="_blank"} - Apple Platform Deployment。
[^thsd]: [111 年推动中小学数字学习精进方案 BYOD & THSD 实施计划第二次征件](https://www.htjh.tp.edu.tw/wp-content/uploads/doc/t230/111%20年推动中小学数字学习精进方案%20-%20BYOD%20&%20THSD%20实施计划第二次征件.pdf){target="_blank"} - 教育部，附录 1 同意书参考范例，学校转载。
[^chjh]: [学习载具管理规定及同意书](https://www.chjh.ilc.edu.tw/wp-content/uploads/sites/1482/2024/06/学习载具管理规定及同意书.pdf){target="_blank"} - 宜兰县立中华国中，2024-06。
[^openid]: [教育体系单一签入服务研习 Q&A](https://www.pmai.tn.edu.tw/wp-content/uploads/sites/25/2023/11/112.10.24-教育体系单一签入服务Open-ID研习-第3场次-QA-1.pdf){target="_blank"} - 2023-10-24，学校转载。
[^tp-google]: [114 年台北市公立高级中等以下各级学校申请 Google Workspace 账号暨酷 AI 学习平台整合推动计划](https://www.cyhs.tp.edu.tw/uploads/1764289157911VPI72CvB.pdf){target="_blank"} - 台北市政府教育局，学校转载。
[^tp-cool]: [Google Workspace 账号暨酷 AI 学习平台整合推动计划说明会](https://www.yaes.tp.edu.tw/uploads/1764809976571rWueBmkT.pdf){target="_blank"} - 台北市政府教育局，2025-11-21，学校转载。
[^google-admin]: [If your account is managed by an administrator](https://support.google.com/accounts/answer/181692?hl=en){target="_blank"} - Google 帐户说明。
[^google-vault]: [Vault 总览](https://knowledge.workspace.google.com/vault/getting-started/vault-overview?hl=zh-Hant){target="_blank"} - Google Workspace 管理说明。Vault 在教育版的 Fundamentals、Standard、Plus 都有，见[比较教育版](https://knowledge.workspace.google.com/admin/getting-started/editions/compare-education-editions?hl=en){target="_blank"}。
[^google-logs]: [云端硬盘记录事件](https://knowledge.workspace.google.com/admin/reports/drive-log-events?hl=zh-Hant){target="_blank"} - Google Workspace 管理说明。保存期间见 [Data retention and lag times](https://knowledge.workspace.google.com/admin/reports/data-retention-and-lag-times?hl=en){target="_blank"}。
[^ms-ediscovery]: [Learn about eDiscovery](https://learn.microsoft.com/en-us/purview/edisc){target="_blank"} - Microsoft Learn。
[^ms-audit]: [Audit solutions overview](https://learn.microsoft.com/en-us/purview/audit-solutions-overview){target="_blank"} - Microsoft Learn。
[^tanwp]: [TANet 不当信息防护系统说明](https://tnrc.edu.tw/var/file/81/1081/img/613/516993901.pdf){target="_blank"} - 台南局域网路中心转载。
[^moe-tanwp]: [教育部携手国立中山大学创建不当信息网络防护系统](https://depart.moe.edu.tw/ed2700/News_Content.aspx?n=727087A8A1328DEE&sms=49589CE1E2730CC8&s=92ABD7DA331EAF76){target="_blank"} - 教育部信息及科技教育司，2023-07-31。
[^nsysu-wifi]: [国立中山大学校园无线网络使用规范](https://regs.nsysu.edu.tw/rule/file/202508291750340674.pdf){target="_blank"} - 国立中山大学。
[^ncnu]: [国立暨南国际大学校园网络使用办法](https://cc.ncnu.edu.tw/var/file/1/1001/img/518267081.pdf){target="_blank"} - 国立暨南国际大学，第十一条。
[^moe-campus-net]: [校园网络使用规范](https://edu.law.moe.gov.tw/LawContent.aspx?id=FL051333){target="_blank"} - 教育部主管法规查找系统。
[^tp-card]: [台北通数字学生证个人数据搜集、处理及利用同意书](https://www.hs.ntnu.edu.tw/static/webroot/G162269182249820/application/NN165528245103404.pdf){target="_blank"} - 台北市政府，学校转载。
[^moe-bio]: [学校使用生物特征辨识技术个人数据保护指引](https://www.sfsh.tn.edu.tw/resource/openfid.php?id=8365){target="_blank"} - 教育部，学校转载。
[^tcgs]: [台中市校园人脸辨识系统争议项目报告](https://www.rdec.taichung.gov.tw/media/599098/1091006-4-台中市校园人脸辨识系统争议-108课纲前导学校未依课程计划书运行之乱象暨教学正常化落实情形及各校学生权利-学生代表会议席次保障项目报告-教育局.pdf){target="_blank"} - 台中市政府教育局，2020-10-06。另见[中女中宿舍拟以人脸辨识代理舍监 爆隐私争议](https://news.pts.org.tw/article/492908){target="_blank"} - 公视新闻网，2020-09-04。
[^cameras]: [针孔风波引发学生不安 教育部促校园盘点设备](https://udn.com/news/story/6885/9534565){target="_blank"} - 联合新闻网，2026-05-30。另见[辅大针孔案校方说明不被接受 学生会严正抗议提出四项诉求](https://udn.com/news/story/7321/9533832){target="_blank"} - 联合新闻网。
[^discipline]: [学校订定教师辅导与管教学生办法注意事项](https://edu.law.moe.gov.tw/LawContent.aspx?id=GL002147){target="_blank"} - 教育部，2024-02-05 修正，第二十九至三十一点。
[^mobile-rule]: [高级中等以下学校校园行动载具使用原则](https://www.dmps.ptc.edu.tw/uploads/1717381719037f60K6hlx.pdf){target="_blank"} - 教育部，2019-06-17，学校转载，第三点。
[^cna-sitin]: [学生静坐盼退校园手机管理草案 教育部承诺6/1办座谈会](https://www.cna.com.tw/news/ahel/202505240034.aspx){target="_blank"} - 中央社，2025-05-24。
[^pdpa]: [个人数据保护法](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0050021){target="_blank"} - 全国法规数据库，第 3、10、13 条。
[^moj-private]: [法务部 102 年 6 月 24 日法律字第 10200571790 号书函](https://laws.gov.taipei/law/Interpretation/Content/FE259819){target="_blank"} - 台北市法规查找系统转载，私立学校属非公务机关。
[^hs-act]: [高级中等教育法](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=H0060043){target="_blank"} - 全国法规数据库，第 25、53、54、55 条。
[^univ-act]: [大学法](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=H0030001){target="_blank"} - 全国法规数据库，第 15、33 条。
[^edu-act]: [国民教育法](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=H0070001){target="_blank"} - 全国法规数据库，第 19、45 条。
[^crc]: [儿童权利公约施行法](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050193){target="_blank"} - 全国法规数据库，第 2 条。
