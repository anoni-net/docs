---
title: 學生的校園隱私
description: 學校發的平板、學校帳號、校園網路與學生證都會留下紀錄。本頁寫給國高中生與大學生，說明學校與教育單位實際看得到什麼、如何把學校與私人的生活分開、書包與手機的檢查規定，以及對學校的做法有疑問時可以走的管道。
icon: material/school-outline
---

# :material-school-outline: 學生的校園隱私

學校發的平板、學校開的帳號、校園的 Wi-Fi 與學生證，每一樣都會留下紀錄，看得到這些紀錄的除了老師，還可能有教育局、教育部與提供服務的廠商。EFF 的看法是，校園監控工具越來越普遍，卻還沒有證據顯示它們讓學生更安全，反而可能讓學生不敢搜尋、不敢說話[^ssd]。

本頁寫給國高中生與大學生，說明學校實際看得到什麼、如何把學校與私人的生活分開，以及覺得學校做得太多時可以怎麼提出。本頁參考 EFF Surveillance Self-Defense 的〈Privacy for Students〉改寫，台灣的學校系統與法規另外查證（出處見[本頁的來源與核對](#本頁的來源與核對)）。

!!! note "從家長那一邊看"

    家長能做什麼、家長監護工具的能與不能，見 [家長與孩子的網路隱私](./parents-youth.md)。

!!! tip "時間有限的話，先看這幾點"

    - 學校發的平板、學校帳號、學校的 Wi-Fi，都當成會被看到的地方
    - 私人的帳號、敏感的搜尋與對話，用自己的裝置與行動網路
    - 不要用學校的 email 註冊私人服務，畢業前把要留的資料備份出來
    - 對學校的做法有疑問，可以找學生代表、學生會，或依規定提出申訴

## 學校看得到的資料

### 學校發的平板

以花蓮縣的要點為例，「生生用平板」這類政府補助的學習載具都要納入教育部的行動裝置管理系統（MDM，讓管理者遠端設定、派送 App 與收集使用資料的系統）[^hualien]。教育部的系統以裝置序號為單位，每天收集使用時間，用來統計各校的使用率[^moe-2024]。

學校實際用來管理平板的是 Jamf、Intune、Google 這類廠商的系統。以高中職的 MDM 研習資料為例，學校可以替平板派送與限制 App、關閉 App Store、透過過濾連線擋掉黑名單上的網站，老師在課堂上也可以同時看到約 30 位學生的畫面。平板被重設之後，連上網路就會自動裝回管理設定[^jamf-basic][^jamf-qa]。Apple 的說明寫到，受管理的 iPad 在管理者開啟「遺失模式」時可以查到位置，解除時使用者會收到通知[^apple-lost]。

可以帶回家的平板也一樣受管理。教育部提供給學校的同意書範例寫明，學校保留監管、檢查、存取載具的權利，並儲存學生的電子郵件與網路存取紀錄，已經有學校照著範例使用[^thsd][^chjh]。

### 學校帳號

教育雲端帳號是終身帳號，學校自己開的帳號多半在畢業後停用或刪除[^openid]。這些帳號常常也是學生的 Google Workspace 或 Microsoft 365 帳號，例如臺北市的 Google 帳號由教育局在後台建立，使用資料會進到教育局的報表[^tp-google][^tp-cool]。

管理這類帳號的人，技術上可以存取帳號裡的內容[^google-admin]。Google 的管理工具可以搜尋與匯出帳號裡的 Gmail 與雲端硬碟資料，雲端硬碟的檢視、下載、分享紀錄也會記下使用者的 IP，保存 6 個月[^google-vault][^google-logs]。Microsoft 365 的電子文件探索與稽核紀錄有類似的功能，稽核紀錄預設保存 180 天，學校常用的教育版是否包含這些功能，我們沒有查到[^ms-ediscovery][^ms-audit]。這些文件說明的是管理者做得到什麼，不代表學校或教育局實際這樣做，但寫在學校帳號裡的東西，要假設不只你看得到。

### 校園網路

國中小與高中職的網路經過教育部的「不當資訊防護系統」，擋下色情、賭博、暴力恐怖、毒品等類別的網站，誤擋可以向維運的中山大學團隊通報[^tanwp]。教育部表示，這套系統自 2018 年起已經擋下超過 14 億次連線，黑名單的來源包括使用者回報與 iWIN 的申訴[^moe-tanwp]。系統會不會保存瀏覽紀錄、保存多久，沒有公開資料。

以中山大學的無線網路規範為例，使用時會記錄登入的帳號、使用時間、IP 與裝置的 MAC 位址[^nsysu-wifi]，暨南大學則規定網路服務的使用紀錄至少保存 6 個月[^ncnu]。教育部 2001 年訂定的校園網路使用規範要求學校尊重網路隱私，不得任意窺視使用者的資料，但維護系統安全、有合理懷疑違反校規、配合司法調查時例外[^moe-campus-net]。

學校或公司管理的電腦，管理者可以在上面安裝自己的根憑證，之後就能解開這台電腦的 HTTPS 流量[^ssd]。用學校的電腦時，不要假設網址列的鎖頭代表沒有人看得到。

### 學生證與監視器

有感應功能的學生證可能記錄刷卡的時間與地點。以臺北市的數位學生證為例，用途包括到校、離校的刷卡，資料的蒐集單位包括教育局、學校、市立圖書館、臺北捷運與悠遊卡公司，利用方式包含統計研究分析，不同意的學生仍然可以領到不記名的卡[^tp-card]。

校園裡的人臉辨識，教育部的指引寫明未成年學生要同時取得法定代理人同意，不同意時學校要提供替代方案[^moe-bio]。2019 年臺中女中在宿舍裝了人臉辨識，學生指出裝設前沒有取得同意，學校問卷調查後在 2020 年拆除[^tcgs]。2026 年 5 月輔仁大學的圖書館發現偽裝成偵煙器的攝影機，學生會要求公開監視器的數量與位置、讓學生參與監督，教育部隨後要求各校盤點校內有錄影功能的設備[^cameras]。

## 學校與私人的分開

能做的事大多是把學校與私人的生活分開[^ssd]：

- **私人的事用自己的裝置與網路**：健康、性別、感情、政治這類搜尋與對話，不要用學校的平板、電腦或 Wi-Fi。學校的平板帶回家、連上家裡的網路，仍然在管理之下
- **學校帳號只做學校的事**：不要用學校的 email 註冊社群或購物網站，也不要在學校的雲端硬碟放私人檔案。帳號可能在畢業後停用，作品與要留的資料提前備份到自己的地方
- **社群帳號的設定**：設成私人帳號、檢查誰在追蹤你、想清楚哪些內容放公開帳號，見 [社群平台的隱私設定](../tools/social-media-settings.md)
- **位置與 App 權限**：用不到時關掉位置，逐一檢查 App 的權限，見 [手機隱私設定逐步指引](../tools/phone-privacy-settings.md)
- **帳號與裝置的保護**：開啟兩步驟驗證、用密碼管理器，替自己的手機與電腦設定密碼與加密，見 [密碼管理器入門](../tools/password-manager.md) 與 [裝置加密與資料抹除](../tools/device-encryption.md)

隱私也是朋友之間的事。朋友在活動上拍的照片帶有時間與地點，標註之後，沒有出現在學校系統裡的朋友也會被串進來。例如參加 LGBTQ+ 或政治活動的照片被標註，可能讓不支持的家長或學校知道[^ssd]。跟朋友說好哪些照片不要公開、不要標註，家人控管下的本機痕跡見 [LGBTQ+ 與性少數的匿名社交](./lgbtq.md)。

## 書包與手機的檢查規定

高中以下的學校檢查學生的身體、書包或上鎖的置物櫃，依教育部的注意事項要有特定條件，例如學生有危害他人生命、身體之虞，或涉嫌犯罪、攜帶違禁物品並經緊急會商認定有危害之虞[^discipline]。檢查時至少兩人執行，學生可以請一到兩位教職員或同學陪同，學生想在場時學校應該同意，過程要全程錄影[^discipline]。

手機上課時被收走，通常是依同一份注意事項的暫時保管：物品有妨害學習或校園安全之虞時可以先保管，保管期間不得損壞，沒有妨害時要還給學生[^discipline]。注意事項裡沒有關於查看手機內容的條文。依教育部 2019 年的行動載具使用原則，各校的手機使用規定要邀請學生代表一起討論、經校務會議通過[^mobile-rule]。2025 年教育部提出更嚴的手機管理草案，有高中生到教育部前靜坐要求撤回草案，教育部承諾舉辦學生座談會[^cna-sitin]，截至 2026 年 11 月我們沒有查到草案是否定案。

## 提出疑問的管道

先弄清楚學校用了哪些系統。可以問資訊組或學務處：用了哪些平台與監控工具、記錄哪些資料、保存多久、誰看得到[^ssd]。

- **自己的資料**：公立學校屬於公務機關，你可以依個人資料保護法請求查詢、閱覽或複製學校保存的你的資料，學校要在 15 天內決定，必要時可以延長 15 天[^pdpa]。私立學校適用非公務機關的規定，同樣可以提出請求[^pdpa][^moj-private]
- **學生代表與學生會**：高中的校務會議裡，學生代表不得少於成員的 8%，訂定生活輔導與獎懲規章的會議也要有學生代表出席，學校應輔導學生成立學生會[^hs-act]。大學的校務會議學生代表不得少於十分之一[^univ-act]。國中小的學生只能列席校務會議[^edu-act]
- **申訴**：高中生或學生自治組織認為學校的措施違法或不當、損害自己的權益，可以在知道的隔天起 30 天內以書面向學校申訴，不服再向主管機關申訴[^hs-act]。大學要把申訴制度寫在學生手冊裡[^univ-act]，國中小由家長代為申訴[^edu-act]
- **校刊、連署與公開討論**：把問題寫出來、找同學一起連署，都是 SSD 建議的做法[^ssd]

未滿 18 歲的學生，可以引用《兒童權利公約》第 16 條：兒童的隱私與通訊不受恣意或非法干預，這份公約在台灣有國內法的效力[^crc]。

## 常聽到的理由與回應

- **「沒做壞事就不怕被看」**：隱私保護的是去診所、參加集會這類正當的事[^ssd]
- **「學校不會濫用」**：資料存在廠商與教育局的系統裡，看得到的不只學校，資料可能被分享或外洩[^ssd]
- **「這是為了你的安全」**：EFF 的看法是，目前沒有證據顯示這類工具讓學生更安全，而且會改變學生的行為、破壞信任[^ssd]
- **「反對也沒用」**：臺中女中的人臉辨識在學生提出意見、學校問卷調查之後拆除了[^tcgs]

## 本頁的來源與核對

本頁參考 EFF [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"} 的〈[Privacy for Students](https://ssd.eff.org/module/privacy-students){target="_blank"}〉改寫，該篇審閱日 2020-03-01，以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hant){target="_blank"} 授權。

跟原文不同的地方：原文寫於 2020 年，以美國學校為例，本頁沿用它對校園監控的分類、學校與私人分開的建議與常見說法的回應，學校的系統、檢查規定與提出疑問的管道改寫成台灣的版本，依各自註腳的教育部文件、法規、廠商說明與新聞。原文到學校董事會發言、聯絡州與聯邦議員的建議，換成台灣的學生代表、學生會與申訴制度。與原文不同之處由匿名網路社群 anoni.net 負責，不代表 EFF 的立場。

2026 年 11 月核對。各縣市與各校的做法不同，你的學校實際用了哪些系統，以學校的公告與規定為準。

## 相關閱讀

- [家長與孩子的網路隱私](./parents-youth.md)：家長那一邊的安全計畫與家長監護
- [社群平台的隱私設定](../tools/social-media-settings.md)：決定同學、老師、陌生人看得到你什麼
- [LGBTQ+ 與性少數的匿名社交](./lgbtq.md)：帳號分層與家人控管下的本機痕跡
- [網路封鎖的手法與繞過方式](../basics/network-censorship.md)：學校網路的過濾屬於哪一種封鎖

[^ssd]: [Privacy for Students](https://ssd.eff.org/module/privacy-students){target="_blank"} - EFF Surveillance Self-Defense，審閱日 2020-03-01。
[^hualien]: [花蓮縣國民中小學促進數位學習載具使用要點](https://xc.hlc.edu.tw/~sljh_www/uploads/tadnews/file/nsn_4454_1_eDU.pdf){target="_blank"} - 花蓮縣政府，學校轉載。
[^moe-2024]: [113 年精進方案推動工作說明](https://www.klgsh.kl.edu.tw/wp-content/uploads/sites/67/2024/05/02-113年精進方案推動工作說明EDU0315-會議版.pdf){target="_blank"} - 教育部資訊及科技教育司，2024-03-15，學校轉載。
[^jamf-basic]: [行動載具管理 MDM 研習 iOS 系統初階操作](https://www.pmai.tn.edu.tw/wp-content/uploads/sites/25/2023/05/112.05.17-行動載具管理MDM研習-第3場次-iOS系統初階操作-講師簡報-05.22更新.pdf){target="_blank"} - 2023-05-18，學校轉載。
[^jamf-qa]: [行動載具管理 MDM 研習 iOS 系統進階操作 Q&A](https://www.pmai.tn.edu.tw/wp-content/uploads/sites/25/2023/05/112.05.24-行動載具管理MDM研習-第4場次-iOS系統進階操作-QA.pdf){target="_blank"} - 2023-05-24，學校轉載。
[^apple-lost]: [Lock and locate devices](https://support.apple.com/guide/deployment/lock-and-locate-devices-depb980a0be4/web){target="_blank"} - Apple Platform Deployment。
[^thsd]: [111 年推動中小學數位學習精進方案 BYOD & THSD 實施計畫第二次徵件](https://www.htjh.tp.edu.tw/wp-content/uploads/doc/t230/111%20年推動中小學數位學習精進方案%20-%20BYOD%20&%20THSD%20實施計畫第二次徵件.pdf){target="_blank"} - 教育部，附錄 1 同意書參考範例，學校轉載。
[^chjh]: [學習載具管理規定及同意書](https://www.chjh.ilc.edu.tw/wp-content/uploads/sites/1482/2024/06/學習載具管理規定及同意書.pdf){target="_blank"} - 宜蘭縣立中華國中，2024-06。
[^openid]: [教育體系單一簽入服務研習 Q&A](https://www.pmai.tn.edu.tw/wp-content/uploads/sites/25/2023/11/112.10.24-教育體系單一簽入服務Open-ID研習-第3場次-QA-1.pdf){target="_blank"} - 2023-10-24，學校轉載。
[^tp-google]: [114 年臺北市公立高級中等以下各級學校申請 Google Workspace 帳號暨酷 AI 學習平臺整合推動計畫](https://www.cyhs.tp.edu.tw/uploads/1764289157911VPI72CvB.pdf){target="_blank"} - 臺北市政府教育局，學校轉載。
[^tp-cool]: [Google Workspace 帳號暨酷 AI 學習平臺整合推動計畫說明會](https://www.yaes.tp.edu.tw/uploads/1764809976571rWueBmkT.pdf){target="_blank"} - 臺北市政府教育局，2025-11-21，學校轉載。
[^google-admin]: [If your account is managed by an administrator](https://support.google.com/accounts/answer/181692?hl=en){target="_blank"} - Google 帳戶說明。
[^google-vault]: [Vault 總覽](https://knowledge.workspace.google.com/vault/getting-started/vault-overview?hl=zh-Hant){target="_blank"} - Google Workspace 管理說明。Vault 在教育版的 Fundamentals、Standard、Plus 都有，見[比較教育版](https://knowledge.workspace.google.com/admin/getting-started/editions/compare-education-editions?hl=en){target="_blank"}。
[^google-logs]: [雲端硬碟記錄事件](https://knowledge.workspace.google.com/admin/reports/drive-log-events?hl=zh-Hant){target="_blank"} - Google Workspace 管理說明。保存期間見 [Data retention and lag times](https://knowledge.workspace.google.com/admin/reports/data-retention-and-lag-times?hl=en){target="_blank"}。
[^ms-ediscovery]: [Learn about eDiscovery](https://learn.microsoft.com/en-us/purview/edisc){target="_blank"} - Microsoft Learn。
[^ms-audit]: [Audit solutions overview](https://learn.microsoft.com/en-us/purview/audit-solutions-overview){target="_blank"} - Microsoft Learn。
[^tanwp]: [TANet 不當資訊防護系統說明](https://tnrc.edu.tw/var/file/81/1081/img/613/516993901.pdf){target="_blank"} - 臺南區域網路中心轉載。
[^moe-tanwp]: [教育部攜手國立中山大學創建不當資訊網路防護系統](https://depart.moe.edu.tw/ed2700/News_Content.aspx?n=727087A8A1328DEE&sms=49589CE1E2730CC8&s=92ABD7DA331EAF76){target="_blank"} - 教育部資訊及科技教育司，2023-07-31。
[^nsysu-wifi]: [國立中山大學校園無線網路使用規範](https://regs.nsysu.edu.tw/rule/file/202508291750340674.pdf){target="_blank"} - 國立中山大學。
[^ncnu]: [國立暨南國際大學校園網路使用辦法](https://cc.ncnu.edu.tw/var/file/1/1001/img/518267081.pdf){target="_blank"} - 國立暨南國際大學，第十一條。
[^moe-campus-net]: [校園網路使用規範](https://edu.law.moe.gov.tw/LawContent.aspx?id=FL051333){target="_blank"} - 教育部主管法規查詢系統。
[^tp-card]: [台北通數位學生證個人資料蒐集、處理及利用同意書](https://www.hs.ntnu.edu.tw/static/webroot/G162269182249820/application/NN165528245103404.pdf){target="_blank"} - 臺北市政府，學校轉載。
[^moe-bio]: [學校使用生物特徵辨識技術個人資料保護指引](https://www.sfsh.tn.edu.tw/resource/openfid.php?id=8365){target="_blank"} - 教育部，學校轉載。
[^tcgs]: [臺中市校園人臉辨識系統爭議專案報告](https://www.rdec.taichung.gov.tw/media/599098/1091006-4-臺中市校園人臉辨識系統爭議-108課綱前導學校未依課程計畫書執行之亂象暨教學正常化落實情形及各校學生權利-學生代表會議席次保障專案報告-教育局.pdf){target="_blank"} - 臺中市政府教育局，2020-10-06。另見[中女中宿舍擬以人臉辨識代理舍監 爆隱私爭議](https://news.pts.org.tw/article/492908){target="_blank"} - 公視新聞網，2020-09-04。
[^cameras]: [針孔風波引發學生不安 教育部促校園盤點設備](https://udn.com/news/story/6885/9534565){target="_blank"} - 聯合新聞網，2026-05-30。另見[輔大針孔案校方說明不被接受 學生會嚴正抗議提出四項訴求](https://udn.com/news/story/7321/9533832){target="_blank"} - 聯合新聞網。
[^discipline]: [學校訂定教師輔導與管教學生辦法注意事項](https://edu.law.moe.gov.tw/LawContent.aspx?id=GL002147){target="_blank"} - 教育部，2024-02-05 修正，第二十九至三十一點。
[^mobile-rule]: [高級中等以下學校校園行動載具使用原則](https://www.dmps.ptc.edu.tw/uploads/1717381719037f60K6hlx.pdf){target="_blank"} - 教育部，2019-06-17，學校轉載，第三點。
[^cna-sitin]: [學生靜坐盼退校園手機管理草案 教育部承諾6/1辦座談會](https://www.cna.com.tw/news/ahel/202505240034.aspx){target="_blank"} - 中央社，2025-05-24。
[^pdpa]: [個人資料保護法](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0050021){target="_blank"} - 全國法規資料庫，第 3、10、13 條。
[^moj-private]: [法務部 102 年 6 月 24 日法律字第 10200571790 號書函](https://laws.gov.taipei/law/Interpretation/Content/FE259819){target="_blank"} - 臺北市法規查詢系統轉載，私立學校屬非公務機關。
[^hs-act]: [高級中等教育法](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=H0060043){target="_blank"} - 全國法規資料庫，第 25、53、54、55 條。
[^univ-act]: [大學法](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=H0030001){target="_blank"} - 全國法規資料庫，第 15、33 條。
[^edu-act]: [國民教育法](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=H0070001){target="_blank"} - 全國法規資料庫，第 19、45 條。
[^crc]: [兒童權利公約施行法](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050193){target="_blank"} - 全國法規資料庫，第 2 條。
