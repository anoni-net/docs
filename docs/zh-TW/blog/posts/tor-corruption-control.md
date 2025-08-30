---
date: 2025-08-30
authors:
    - toomore
categories:
    - 更新
    - Tor
    - Tails
slug: tor-corruption-control
image: "assets/images/tor.webp"
summary: "自網路在土庫曼開始普及以來，就一直受到嚴格的限制和審查。整個國家的電信產業要麼由政府直接掌控，要麼由與統治家族有關聯的人士持有"
description: "自網路在土庫曼開始普及以來，就一直受到嚴格的限制和審查。整個國家的電信產業要麼由政府直接掌控，要麼由與統治家族有關聯的人士持有"
---

# 貪腐與控管：土庫曼如何將網路審查變成一門生意

!!! info ""

    以下內容原文翻譯來自以下文章，主詞角色為 Tor：

    - [Corruption and Control: How Turkmenistan turned internet censorship into a business, Tor Blog, by gus, nina, 2025-08-27](https://blog.torproject.org/Corruption-Control-Turkmenistan-internet-censorship-business/){target="_blank"}

![](https://forum.torproject.org/uploads/default/original/2X/f/f0a900173e408d4d9f15f346fa3b5b7750efce96.png)

2021 年 7 月，一個關於 Tor 使用量在土庫曼驟降的現象[引起了我們的注意](https://archive.is/5Kp4s){target="_blank"}。Tor 後來了解到，這標誌著這個後蘇聯國家進入了審查與限制的新時代。不過讓我們倒退回去看整件事情的起源...

Tor 社群長期以來致力於捍衛網路自由，運營中繼節點並[提供橋接服務以對抗網路審查](https://blog.torproject.org/2024-defend-internet-freedom-during-elections/){target="_blank"}。多年來，Tor 專案呼籲更多人加入[架設橋接](https://forum.torproject.org/t/tor-relays-help-turkmens-to-bypass-internet-censorship-run-an-obfs4-bridge/7002){target="_blank"}、使用 Snowflake 代理，同時我們也調查並調整我們的反審查策略，並分享有關土庫曼網路審查的訊息。

現代的網路審查規避系統通常建立在「[附帶損害](https://www.bamsoftware.com/papers/fronting/){target="_blank"}」的概念上，也就是說，審查者如果要封鎖某些內容，就必須封鎖整個網際網路或某些熱門的在線服務。然而，在土庫曼，審查者的行為卻出奇地不同。他們毫不避諱地封鎖了網際網路的大部分內容，對於可能造成的附帶損害不以為意，引發了人們的好奇：為什麼土庫曼的審查者似乎對其行為產生的附帶損害無動於衷呢？

<!-- more -->

## 土庫曼背景

土庫曼由專制的別爾德穆哈梅多夫家族執政。該國在全球自由和透明度指數中始終排在末端。在 2025 年無國界記者組織（RSF）的新聞自由指數中，土庫曼在 180 個國家中[排名第 174](https://rsf.org/en/country/turkmenistan){target="_blank"}。自由之家（Freedom House）給予該國的總體自由度評分只有 1/100。首都阿什哈巴德，常被稱為「白色大理石之城」，既是極權奢華的展示，也是[市民依賴翻牆工具來突破審查的地方](https://theurbanactivist.com/governance/protecting-internet-freedom-in-the-city-of-white-marble/){target="_blank"}。

土庫曼的官方人口約為 600 萬人，但根據[一些估計](https://www.rferl.org/a/turkmenistan-population-decline-exodus/31355045.html){target="_blank"}，實際人數可能不到 300 萬。過去十年間，數百萬人離開了這個國家，主要的流向是土耳其、俄羅斯及[其他國家](https://eurasianet.org/turkmen-labor-migrants-turning-elsewhere-as-turkey-is-less-welcoming){target="_blank"}。為了減少人口外流，土庫曼政府要求土耳其對土庫曼公民施行簽證政策，而該要求已被滿足。

土庫曼的**腐敗是系統性的**。有多個[調查報導](https://www.occrp.org/en/investigation/how-a-51-million-state-built-beauty-clinic-in-turkmenistan-ended-up-in-the-hands-of-the-presidents-family-at-a-massive-discount){target="_blank"}和紀錄片，例如《[聖書之影](https://archive.org/details/shadow-of-the-holy-book-19353633-163997017){target="_blank"}》，都聚焦於此。該國的網路滲透率是全球最低之一，網速也位居[全球最慢之列](https://bestbroadbanddeals.co.uk/broadband/speed/worldwide-speed-league/#speed){target="_blank"}。

強迫勞動（包括童工）在[棉花田普遍存在](https://www.cottoncampaign.org/turkmenistan){target="_blank"}，人權侵犯系統性地發生。女性是特別脆弱的群體，她們薪資較低，必須遵守[著裝規定](https://www.rferl.org/a/turkmenistan-color-clothing-women-rules-repression/33349460.html){target="_blank"}，還面臨非正式限制，例如禁用某些美容程序或[取得駕照](https://turkmen.news/vlasti-turkmenistana-obyasnili-pochemu-ne-vydavali-voditelskie-prava-zhenshchinam/){target="_blank"}的極大困難。

極少數的活動人士願意談論國內情況。即使他們離開國家，仍面臨被遣返回土庫曼的風險，例如住在土耳其的[部落客阿里舍爾·薩特夫（Alisher Sahtov）和阿不都拉·奧魯索夫（Abdulla Orusov）](https://www.hrw.org/news/2025/07/30/turkiye-turkmen-risking-deportation-reported-missing){target="_blank"}，他們今年似乎[被遣返回國](https://turkmen.news/istochnik-blogerov-sahatova-i-orusova-estradirovali-v-turkmenistan/){target="_blank"}。

許多土庫曼公民不敢公開發聲，擔心留在土庫曼的親友的安全和福祉。國內的打壓手段可以從 75 歲記者索爾坦·阿奇洛娃（Soltan Achilova）的例子看出。她原本計劃前往瑞士領取馬丁·恩納爾斯人權捍衛者獎。為了[阻止她](https://rsf.org/en/turkmenistan-rsf-denounces-poisoning-attempt-soltan-achilova){target="_blank"}前往，土庫曼當局試圖毒害她，當企圖失敗時，[強行將她住院](https://cpj.org/2024/11/turkmen-journalist-soltan-achilova-forcibly-hospitalized-prevented-from-traveling-abroad/){target="_blank"}。

儘管有數百萬土庫曼公民旅居海外，他們的政府無所不用其極地割斷本國居民與海外移民之間的家庭聯繫，而嚴厲的網路審查正是其工具之一。

## 網路審查與對抗網際網路

自網路在土庫曼開始普及以來，就一直受到嚴格的限制和審查。整個國家的電信產業要麼由政府直接掌控，要麼由與統治家族有關聯的人士持有。儘管前總統在 2013 年通過了一項[法律禁止新聞審查](https://cpj.org/2013/02/turkmenistan-opens-up-media-in-name-only/){target="_blank"}，但這部法律僅存在於文件上。在實際運作中，幾乎所有的社群網站和消息應用程式都被封鎖。像 YouTube、Facebook、Instagram、WhatsApp、TikTok、Discord、Signal、[IMO](https://www.rferl.org/a/turkmenistan-last-messaging-app-internet/32535618.html){target="_blank"} 和 Telegram 這樣的熱門服務在該國都是無法訪問的。根據 Progres 基金會的報告，這樣的網路封鎖可能使土庫曼的年度 [GDP 損失高達 8%](https://progres.online/reports/internet-freedom/what-does-internet-shutdown-cost-the-turkmen-economy){target="_blank"}。

2021 年，公民甚至被強迫[對著古蘭經發誓不使用 VPN](https://www.rferl.org/a/turkmenistan-vpn-koran-ban/31402718.html){target="_blank"}。如果被抓到使用 VPN，罰款為 1,500 馬納特（按市場匯率約 80 美元），這大約相當於一個月的平均薪水。然而，數年來並沒有官方的封鎖網站列表。

由於封鎖的程度和規模，從土庫曼內部衡量網路審查幾乎是不可能的，但 [OONI Explorer](https://explorer.ooni.org/chart/mat?probe_cc=TM&test_name=web_connectivity&since=2024-07-23&until=2025-07-24&axis_x=measurement_start_day&time_grain=day){target="_blank"} 上偶爾會出現一些測試結果。2022 年，[一個研究團隊](https://tmc.np-tokumei.net/){target="_blank"}使用一種創新的[測量技術](https://arxiv.org/pdf/2304.04835){target="_blank"}成功地繪製了該政權的審查地圖，而這種技術不依賴於當地測試或觀測點。他們的發現顯示超過 183,000 條封鎖規則和[超過 122,000 個域名被封鎖](https://advox.globalvoices.org/2023/04/12/new-study-finds-internet-censorship-in-turkmenistan-reaches-over-122000-domains/){target="_blank"}。

## 土庫曼的網路審查產業

真相是在一篇由 [Turkmen.news](https://en.turkmen.news/news/internet-access-a-money-spinner-for-turkmenistan-s-cyber-security-service/){target="_blank"} 的調查報導中揭露的。土庫曼網路審查負責機構——網路安全部門，不僅負責封鎖如 Tor 這類翻牆工具，還在暗中出售網路接入。正如報導所言：「**一旦行賄，土庫曼公民就能獲得完整的高速網路自由接入。**」

到 2023 年，這種網路審查商業模式已無法忽視。Turkmen.news 的新報告揭示，網路安全部門的代理正在銷售付費 VPN 服務，並提供 IP 白名單服務，這些卻是他們自己對公眾限制的。

他們不僅從網路壓制中賺取利益，更是創造了需求。在一種彷彿出自《1984》的情節轉折中，那些封鎖網路的人，正是秘密將網路賣回去的人，以土庫曼人大多無法負擔的價格出售。報導曝光後，土庫曼官員甚至[試圖付錢讓文章下架](https://en.turkmen.news/news/turkmen-official-behind-internet-restrictions-offers-to-pay-for-removal-of-expose/){target="_blank"}。

換句話說，封鎖 Tor 並不僅僅關乎國家安全或意識形態，而是為「網路安全」部門自身創造了一個可盈利的市場空間。那些阻止接入的人，正是把接入賣回去的人。Tor 是免費且有效的突破審查工具，這對其灰色市場 VPN 服務的盈利能力構成威脅。

## 2025 的「網路大赦」與審查制度

在 2024 年年中，土庫曼的網路情況短暫出現了一些變化。幾個月間，網路審查似乎有所放鬆，大量 IP 封鎖被解除，包括翻牆工具也可使用。甚至 Tor 專案的網站在土庫曼境內也可以短暫訪問。

這段短暫的時期被稱為「[網路大赦](https://turkmen.news/internet-amnistiya-v-turkmenistane-razblokirovany-3-milliarda-ip-adresov-hostingi-i-cdn/){target="_blank"}」。然而，到 12 月時，網路審查又回歸，並且掀起了新一波的審查浪潮，瞄準整個 IP 範圍和在線服務進行封鎖。

到 2025 年 4 月，報告證實灰色市場的 VPN 業務已經恢復。VPN 的使用權以每月 1,000 馬納特（約 50 美元）的價格出售，還有更便宜的每週「方案」，但經常排除音樂和影音串流等在線服務。而每月支付 2,000 美元即可移除所有連線過濾。正如Turkmen.news 的[分析所言](https://turkmen.news/v-turkmenistane-vnov-blokiruyut-internet-krupnymi-podsetyami-politicheskogo-smysla-v-etom-nikakogo/){target="_blank"}：

> 「最近一波的大規模封鎖是網路安全官員的一種營銷活動。他們故意惡化網路環境以增加對其服務的需求。」

在其他地方被稱為「網路安全」的，在土庫曼卻變成了相反的現象：故意干擾網路接入以維持一場盈利的騙局。

這個故事不僅關於審查，更涉及到國家支持的敲詐勒索，當審查者成為了供應者。網路安全部門的官員正運行一個貪腐計劃，利用監控與控制的工具，從已經受到嚴格統治的民眾中榨取金錢。

## 審查無國界、請分享這個故事

這是一個報導不足，但影響遠超出一國範疇的故事。了解更多關於《[土庫曼網路安全部門人員公然在線銷售 VPN 服務](https://turkmen.news/dilery-upravleniya-kiberbezopasnosti-turkmenistana-otkryto-torguyut-vpn-servisami-online/){target="_blank"}》的資訊，並分享這篇文章，支持那些追究權力責任的記者。擴大他們的報導能幫助增加公眾壓力，確保這些重要的故事不被默默消失。
