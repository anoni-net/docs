---
title: Privacy for students
description: School-issued tablets, school accounts, campus networks, and student ID cards all leave records. Written for secondary and university students in Taiwan, this page covers what schools and education authorities can actually see, how to keep school and personal life apart, the rules on searching bags and phones, and how to raise concerns.
icon: material/school-outline
---

# :material-school-outline: Privacy for students

School tablets, school accounts, campus Wi-Fi, and student ID cards all leave records, and the people who can see them include not only teachers but also education bureaus, the Ministry of Education, and vendors. EFF's view is that school surveillance tools are spreading without evidence that they make students safer, and that they can make students afraid to search or speak[^ssd].

This page adapts EFF Surveillance Self-Defense's [Privacy for Students](https://ssd.eff.org/module/privacy-students){target="_blank"} and replaces its US school context with Taiwan's systems and rules (see [Sources and review](#Sources-and-review)). For the parent's side, see [online privacy for parents and youth](./parents-youth.md).

!!! tip "Short on time? Start here"

    - Treat school tablets, school accounts, and school Wi-Fi as places others can see
    - Use your own device and mobile data for personal accounts and sensitive searches
    - Do not sign up for personal services with your school email, and back up what you want to keep before you graduate
    - If you object to how your school monitors students, go through student representatives, the student council, or a formal complaint

## What schools can see

- **School tablets**: government-funded learning devices must be enrolled in the Ministry of Education's device management (MDM) system, which collects daily usage time per device[^hualien][^moe-2024]. Schools' MDM tools can push and restrict apps, close the App Store, filter websites, and let teachers view about 30 students' screens in class[^jamf-qa]. The Ministry's sample consent form for take-home tablets says schools may monitor, inspect, and access the device and keep students' email and browsing records[^thsd]
- **School accounts**: Education Cloud accounts are lifelong, while school-created accounts are often closed after graduation[^openid]. Administrators of Google Workspace and Microsoft 365 accounts can search and export mail and files and review activity logs, though the documentation describes capability, not what any school actually does[^google-admin][^ms-ediscovery]
- **Campus networks**: schools below university level sit behind the Ministry's inappropriate-content filtering system, which it says has blocked over 1.4 billion requests since 2018. Whether browsing records are kept is not public[^moe-tanwp]. University networks log accounts, times, IP and MAC addresses, and one university keeps service logs for at least six months[^nsysu-wifi][^ncnu]
- **ID cards and cameras**: contactless student IDs record arrivals, departures, and transit. Taipei's digital student ID lists the education bureau, schools, the metro, and the card company as data collectors, and students who decline still get an unregistered card[^tp-card]. Ministry guidance requires guardian consent for biometric systems on minors and an alternative for those who refuse[^moe-bio]. A face recognition system installed in a Taichung girls' high school dormitory was removed in 2020 after students objected[^tcgs]

## Keeping school and personal life apart

Do personal searches and conversations on your own device and network, keep school accounts for schoolwork, and back up what you want to keep before graduating[^ssd]. Make social accounts private ([social media privacy settings](../tools/social-media-settings.md)), turn off location when you do not need it ([phone privacy settings](../tools/phone-privacy-settings.md)), and protect your devices ([device encryption and data erasure](../tools/device-encryption.md)). Agree with friends on which photos not to post or tag, since tagged photos from LGBTQ+ or political events can reach unsupportive parents or school staff[^ssd].

## Searches and confiscated phones

For schools below university level, Ministry rules allow searching a student's body, bag, or locker only under specific conditions, such as a risk of harm to others or suspected crime. At least two staff must be present, the student may ask one or two staff or classmates to accompany them and may be present, and the search must be recorded on video. Phones taken in class fall under temporary custody: they must not be damaged and must be returned once there is no disruption. The rules say nothing about examining phone contents[^discipline].

## Raising concerns

Ask the school what systems it uses, what they record, and who can see it[^ssd]. Under the Personal Data Protection Act you can request access to your own records, and public schools must decide within 15 days[^pdpa]. Senior high school councils must include at least 8% student representatives and university councils at least one tenth, and senior high and university students can file written complaints[^hs-act][^univ-act]. Taiwan gives the Convention on the Rights of the Child domestic legal effect, and its Article 16 protects children's privacy and correspondence[^crc].

## Sources and review

Adapted from [Privacy for Students](https://ssd.eff.org/module/privacy-students){target="_blank"} in EFF's [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"}, last reviewed on 2020-03-01 and licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/){target="_blank"}. We kept its categories of school surveillance, its advice on separating school and personal life, and its responses to common arguments, and replaced the US school context with Taiwan's systems, rules, and complaint channels, each sourced in the footnotes. anoni.net is responsible for any differences from the original, and this page does not represent EFF's views.

## Where to go from here

- [Online privacy for parents and youth](./parents-youth.md): the parent's side
- [Social media privacy settings](../tools/social-media-settings.md): what classmates, teachers, and strangers can see
- [How network blocking works and how to get around it](../basics/network-censorship.md): where school filtering fits

[^ssd]: [Privacy for Students](https://ssd.eff.org/module/privacy-students){target="_blank"} - EFF Surveillance Self-Defense, last reviewed 2020-03-01.
[^hualien]: [花蓮縣國民中小學促進數位學習載具使用要點](https://xc.hlc.edu.tw/~sljh_www/uploads/tadnews/file/nsn_4454_1_eDU.pdf){target="_blank"} - Hualien County (Chinese).
[^moe-2024]: [113 年精進方案推動工作說明](https://www.klgsh.kl.edu.tw/wp-content/uploads/sites/67/2024/05/02-113年精進方案推動工作說明EDU0315-會議版.pdf){target="_blank"} - Ministry of Education (Chinese), 2024-03-15.
[^jamf-qa]: [行動載具管理 MDM 研習 iOS 系統進階操作 Q&A](https://www.pmai.tn.edu.tw/wp-content/uploads/sites/25/2023/05/112.05.24-行動載具管理MDM研習-第4場次-iOS系統進階操作-QA.pdf){target="_blank"} - school MDM workshop (Chinese), 2023-05-24.
[^thsd]: [111 年推動中小學數位學習精進方案 BYOD & THSD 實施計畫第二次徵件](https://www.htjh.tp.edu.tw/wp-content/uploads/doc/t230/111%20年推動中小學數位學習精進方案%20-%20BYOD%20&%20THSD%20實施計畫第二次徵件.pdf){target="_blank"} - Ministry of Education (Chinese), Appendix 1.
[^openid]: [教育體系單一簽入服務研習 Q&A](https://www.pmai.tn.edu.tw/wp-content/uploads/sites/25/2023/11/112.10.24-教育體系單一簽入服務Open-ID研習-第3場次-QA-1.pdf){target="_blank"} - (Chinese), 2023-10-24.
[^google-admin]: [If your account is managed by an administrator](https://support.google.com/accounts/answer/181692?hl=en){target="_blank"} - Google Account Help.
[^ms-ediscovery]: [Learn about eDiscovery](https://learn.microsoft.com/en-us/purview/edisc){target="_blank"} - Microsoft Learn.
[^moe-tanwp]: [教育部攜手國立中山大學創建不當資訊網路防護系統](https://depart.moe.edu.tw/ed2700/News_Content.aspx?n=727087A8A1328DEE&sms=49589CE1E2730CC8&s=92ABD7DA331EAF76){target="_blank"} - Ministry of Education (Chinese), 2023-07-31.
[^nsysu-wifi]: [國立中山大學校園無線網路使用規範](https://regs.nsysu.edu.tw/rule/file/202508291750340674.pdf){target="_blank"} - National Sun Yat-sen University (Chinese).
[^ncnu]: [國立暨南國際大學校園網路使用辦法](https://cc.ncnu.edu.tw/var/file/1/1001/img/518267081.pdf){target="_blank"} - National Chi Nan University (Chinese), Article 11.
[^tp-card]: [台北通數位學生證個人資料蒐集、處理及利用同意書](https://www.hs.ntnu.edu.tw/static/webroot/G162269182249820/application/NN165528245103404.pdf){target="_blank"} - Taipei City Government (Chinese).
[^moe-bio]: [學校使用生物特徵辨識技術個人資料保護指引](https://www.sfsh.tn.edu.tw/resource/openfid.php?id=8365){target="_blank"} - Ministry of Education (Chinese).
[^tcgs]: [中女中宿舍擬以人臉辨識代理舍監 爆隱私爭議](https://news.pts.org.tw/article/492908){target="_blank"} - Public Television Service (Chinese), 2020-09-04; [Taichung education bureau report](https://www.rdec.taichung.gov.tw/media/599098/1091006-4-臺中市校園人臉辨識系統爭議-108課綱前導學校未依課程計畫書執行之亂象暨教學正常化落實情形及各校學生權利-學生代表會議席次保障專案報告-教育局.pdf){target="_blank"} (Chinese), 2020-10-06.
[^discipline]: [學校訂定教師輔導與管教學生辦法注意事項](https://edu.law.moe.gov.tw/LawContent.aspx?id=GL002147){target="_blank"} - Ministry of Education (Chinese), points 29 to 31.
[^pdpa]: [Personal Data Protection Act](https://law.moj.gov.tw/ENG/LawClass/LawAll.aspx?pcode=I0050021){target="_blank"} - Laws & Regulations Database, Articles 3, 10, and 13.
[^hs-act]: [高級中等教育法](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=H0060043){target="_blank"} - Laws & Regulations Database (Chinese), Articles 25 and 54.
[^univ-act]: [大學法](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=H0030001){target="_blank"} - Laws & Regulations Database (Chinese), Articles 15 and 33.
[^crc]: [兒童權利公約施行法](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050193){target="_blank"} - Laws & Regulations Database (Chinese), Article 2.
