---
title: Geedge 的營運與客戶
description: Geedge 如何在客戶國家部署審查與監控系統，以及在哈薩克、衣索比亞、巴基斯坦、緬甸與中國各地的營運紀錄。
icon: material/arrow-right-bottom
---

# :material-file-outline: Geedge 的營運與客戶

!!! note ""

    - 本章翻譯自 InterSecLab 的報告「[The Internet Coup: A Technical Analysis on How a Chinese Company is Exporting The Great Firewall to Autocratic Regimes](https://interseclab.org/wp-content/uploads/2025/09/The-Internet-Coup_September2025.pdf){target="_blank"}」（[報告介紹頁](https://interseclab.org/research/the-internet-coup/){target="_blank"}），以正體中文、臺灣用語翻譯。
    - 本章對應原報告目錄（INDEX）的第 6/8 章。
    - 歡迎[參與討論](./index.md#參與討論)，或查看譯文的[更新紀錄](./index.md#更新紀錄)。

## Geedge 產品的部署方式

Geedge Networks（積至公司）把產品整套賣給政府客戶。Geedge 到新的地點建置時，不同客戶之間有些共通之處，但每次部署都依客戶的個別需求量身調整。客戶通常已有既定的監控與審查法律和做法，所以 Geedge 的部署與導入流程會配合各國特定的管控重點與基礎設施調整。

### 營運效率

和部分客戶國家沿用已久的網路管控系統相比，Geedge 的運作效率高出許多。有些案例裡，政府客戶多年來難以完成的工作，Geedge 幾個月就完成。此外，Geedge 的某個客戶要求新功能時（例如封鎖特定 VPN 的能力），只要一次簡單的軟體更新，就能把這項新能力部署給 Geedge 的其他客戶。一地的審查與監控技術進展因此能迅速跨越國界，在 Geedge 的其他客戶國家大幅助長數位威權。

### 客戶的建置與日常營運

與政府客戶簽下新合約、開始在當地部署之後，Geedge 的下一步是和當地的 ISP（網路服務供應商）合作，讓系統上線。到新的國家或省分建置時，Geedge 員工會前往客戶所在地，把硬體安裝在政府與當地 ISP 擁有的場地。當地 ISP 是建置 Geedge 系統不可或缺的一環。安裝期間，ISP 需要讓 Geedge 員工進入場地，並提供網路規劃，說明 Geedge 硬體如何整合進 ISP 既有的系統。負責收集、儲存大量資料的 Geedge 硬體，就放在各家 ISP 的資料中心裡。ISP 顯然參與 Geedge 的部署流程，也因此脫不了干係，但多數 ISP 員工很可能並不完全清楚系統與功能的所有細節。

### 客戶國家境內的系統架構

Geedge 在各客戶國家的系統架構大致相同，但不同客戶之間仍有些差異。Geedge 在當地的建置通常包含一個指揮控制中心，多半稱為國家中心（national center）。有幾個國家設有兩個國家中心，而非只有一個。多數情況下，國家中心是系統的核心，連接十多個節點，由這些節點把資料送進國家中心[^19]。把資料送進核心的節點位在各家 ISP 的場地裡，Geedge 把這些 ISP 資料中心的所在地稱為「區域中心」（regional centers）。每個國家中心只查詢區域中心的儲存伺服器上收集、儲存的資料。

<figure markdown="span">
  [![圖 13](https://assets.anoni.net/the-internet-coup/index-6-31-1.png)](https://assets.anoni.net/the-internet-coup/index-6-31-1.png){target="_blank"}
  <figcaption>圖 13：Geedge Networks 的系統部署流程。Geedge 在國家指揮控制中心與區域中心安裝硬體、設定審查規則（policy），並持續收集、保存資料來執行監控。Geedge 也持續提供技術支援，並把資料分享給中國科學院的 Mesalab 實驗室（Massive and Effective Stream Analysis），用來改善系統。</figcaption>
</figure>

### 日常營運

Geedge 提供的是代管服務，在與政府客戶的合約期間，Geedge 員工會提供技術支援，大多是遠端支援。國家指揮控制中心的當地技術人員可以執行部分維護與設定工作，但這家中國公司透過遠端存取完成的工作之多，令人憂心。沒有證據顯示 Geedge 在客戶國家長期派駐技術人員。

日常營運中，政府客戶的非技術分析人員以 Cyber Narrator 作為操作入口。一般政府員工就是用這個 Geedge 程式選定、監控目標。其他產品如天狗安全閘道（TSG），由客戶國家的技術網路管理員操作，或由 Geedge 員工以代管服務的形式從遠端操作。Network Zodiac 用來維護系統的其他元件（各產品的功能見[第 5 章](./index_5.md)）。硬體方面，就我們所知，Ether Fabric 是 Geedge 唯一專為自家系統設計的客製產品。不過 Ether Fabric 並非必要，有些案例中 Geedge 把既有的硬體改作他用，只是需要更多設定。

### 審查與監控的系統模式

Geedge 系統主要有兩種部署模式，鏡像（mirrored）與內聯（in-line），用來協助管控網路。鏡像模式在文件中有時稱為「被動」（passive）模式，資料透過網路分流器（network tap）複製一份送到 Geedge 設備（鏡像）。具體來說，這裡的網路分流器是光纖旁路交換器（optical bypass switch）。封包不必等待處理，就能繼續前往目的地。在鏡像模式下，即使 Geedge 系統故障，網路仍會照常運作。鏡像模式的優點是不會因為處理延遲或壅塞而增加網路延遲。在鏡像模式下，客戶無法擋下特定流量，只能靠注入封包（送出偽造的封包）來阻斷連線。

內聯模式在文件中也稱為「主動」（active）模式，流量必須先通過 Geedge 設備，才能繼續前往目的地。在內聯模式下，Geedge 系統一旦故障，網路就會停擺。內聯模式確實會因為處理而增加網路延遲，網路壅塞、流量超過 Geedge 系統的容量時，還可能造成額外的延遲。

內聯模式的優點是可以完全擋下特定的流量，讓它根本無法通過網路。想要絕對控制的客戶常選擇這種做法，代價是犧牲可靠度與網路品質。

<figure markdown="span">
  [![內聯模式與鏡像模式](https://assets.anoni.net/the-internet-coup/index-6-33-1.png)](https://assets.anoni.net/the-internet-coup/index-6-33-1.png){target="_blank"}
  <figcaption>Geedge 系統的內聯（主動）模式與鏡像（被動）模式。內聯模式下，流量（封包）在網路使用者與全球網路之間雙向傳遞，都會先經過 Geedge 的設備，再繼續前往目的地。鏡像模式下，資料透過光纖旁路交換器（圖中的 OBS）鏡像到 Geedge 設備，在這種被動模式中，封包不必等待處理就能繼續前往目的地。</figcaption>
</figure>

### Geedge 監控系統與合法監聽的差別

先說清楚，Geedge 的產品套件有別於世界上多數國家用於合法監聽的監控系統。ISP 為配合合法監聽要求而保存的資料，涵蓋的資料點有限得多（例如連線時間戳記、連線時使用的 IP 位址）。合法監聽通常不涉及深度封包檢測（DPI，檢視連線內容的技術，可用來分析、記錄或攔截流量）。Geedge 系統的監控能力更進階，遭濫用的可能也隨之提高。

## 客戶概況，Geedge 在各國的營運

從外洩文件可以看到 Geedge Networks 在多個國家的營運情形，包括 Geedge 在各個客戶國家或地區開始營運的時間、顯示規模擴張的修訂日誌與紀錄、政府如何與 Geedge 合作準備斷網的線索，以及 Geedge 與政府客戶之間持續的關係。根據 2024 年的一份新聞稿，Geedge Networks 的首席科學家是方濱興，外界公認他是中國防火長城（GFW）之父[^20]。這些技術在許多方面源自中國的防火長城，也延伸防火長城的能力，因此一般人可能會以為它們先在中國部署，之後才輸出到其他國家。不過從公司的發展時間軸來看，Geedge 是先為國際客戶開發產品，之後才把同一套工具賣到中國國內。Geedge Networks 成立於 2018 年，第一個政府客戶是 2019 年的哈薩克。我們的研究顯示，Geedge 直到 2022 年才在中國部署產品，當時開始與中國三個省分的地方政府合作。

### 外洩文件裡的政府客戶代號

分析過的文件顯示，Geedge Networks 用代號稱呼公司營運的地區，這種做法或許在 Mesalab 的學術活動與 Geedge Networks 的商業營運之間，形成「有需要才知道」（need-to-know）的區隔。目前辨識出的客戶代號有哈薩克（`K18` 與 `K24`）、巴基斯坦（`P19`）、衣索比亞（`E21`）、緬甸（`M22`）與新疆（`J24`）。資料裡還提到一個身分不明的客戶，代號 `A24`。代號的最後兩位數字可能代表 Geedge Networks 在當地開始專案的年份，但並非每個代號都符合。

以下各節以政府客戶概況的形式，整理外洩資料中值得注意的發現。本章整理的發現並未全面分析外洩資料裡的所有部署資料。全面評估 Geedge 進駐對客戶國家人民的影響，超出本專案的範圍。

<figure markdown="span">
  [![圖 14](https://assets.anoni.net/the-internet-coup/index-6-35-1.png)](https://assets.anoni.net/the-internet-coup/index-6-35-1.png){target="_blank"}
  <figcaption>圖 14：Geedge Networks 營運的管轄區域。</figcaption>
</figure>

## 哈薩克（K18、K24）

!!! abstract "時間軸（原報告以圖呈現）"

    - 2019 年 6 月：曾任駐中國外交官的托卡耶夫（Kassym-Jomart Tokayev）當選總統
    - 2019 年 7 月：哈薩克政府再次推出根憑證，用來攔截加密流量
    - 2019 年：Geedge 與哈薩克開始往來
    - 2020 年 9 月：Geedge 的網路規劃日誌開始記錄事件，國家中心與 17 個城市執行 Geedge 的產品
    - 2022 年 1 月：阿拉木圖的網路遭封鎖 5 天（民眾抗議燃料價格）
    - 2022 年 10 月：Geedge 的日誌記錄把努爾蘇丹（Nur-Sultan）站點的名稱改回阿斯塔納（Astana）
    - 2024 年 9 月與 10 月：Geedge 從中國把網路設備運送給哈薩克的 TJJ-Company

### 背景

哈薩克的法律為政府審查、管控通訊系統提供依據。2011 年 12 月通過的《國家安全法》賦予哈薩克政府為打擊恐怖主義或暴動而暫停電信服務的權力[^21]。2017 年 7 月 27 日發布、2019 年 3 月 26 日修訂的第 457 號政府命令，讓政府壟斷全國的網路基礎設施[^22]。政府也強制所有國際網路流量經過一個集中的網際網路交換中心（各家網路業者互相交換流量的地方），由國家安全委員會掌控的國家技術服務局（State Technical Service）營運[^23]。獨立的網際網路交換中心只提供國內流量的對等互連（peering，網路業者之間直接互通流量）。根據自由之家（Freedom House）的報告，2024 年哈薩克發生數次短暫、針對特定地區的網路中斷[^24]。

哈薩克從 2015 年開始鋪路，削弱國內網路通訊的完整性，當年建立一張根安全憑證（root security certificate，作業系統與瀏覽器用來判斷加密連線是否可信的最上層憑證）。掌握這張根憑證，政府就能攔截、解密境內所有加密的網路流量，取得私人通訊的中繼資料與實際內容。2019 年，哈薩克政府宣布境內的網路使用者必須下載這張根憑證。Google、Mozilla、Apple 等科技公司抵制政府把偽造憑證放進自家作業系統與瀏覽器的做法，它們認為允許此類憑證會動搖現代資安的根基，若其他國家也發行自己的根憑證，情況更是如此[^25]。Geedge 與哈薩克的往來，大約也在此時開始。

### 哈薩克與 Geedge

從外洩文件看來，哈薩克似乎是 Geedge 的第一個客戶。雙方的關係大約始於 2019 年托卡耶夫當選總統之時。托卡耶夫早年在蘇聯駐北京大使館擔任外交官，職業生涯從中國起步。

Geedge 的產品 TSG 能發動類似政府發行根憑證的攻擊[^26]，或許因此成為 Geedge 當初接觸哈薩克政府時的賣點。一張日期為 2020 年 10 月 16 日的圖片，列出一個國家中心與另外 17 個城市的 IP 位址，這些地點執行三種 Geedge 產品：Bifang（中央管理系統）、Galaxy（TSG-Galaxy 的原名）與 Nezha（Network Zodiac 的舊名）[^27]。Geedge 一份未完成的網路規劃文件，從 2020 年 9 月開始記錄與哈薩克國家中心相關的事件。這份日誌收錄的事件持續到 2022 年 10 月，並附有一張專案修訂紀錄表，列出每次更新的日期、版本號、修改內容與負責的作者。

此外，國際特赦組織取得 Geedge 運往哈薩克的貨運公開來源情報（OSINT），並分享給整個聯合調查團隊。這些貨運資料來自商業貿易資料彙整網站，共有兩筆從中國運往哈薩克的紀錄，日期是 2024 年 9 月 25 日與 2024 年 10 月 21 日，收貨方都是哈薩克公司 TOO TJJ-Company[^28]。其中一筆貨運紀錄把運送的產品標為「光纖旁路保護器」（optical bypass protectors）。TJJ-Company 看來仍在營業，但收到這些貨物幾個月後，公司的郵件伺服器就離線了。截至本報告發布時，公司網站（`tjj[.]kz`）已無法連上。不過從網站的封存頁面可以看到，公司的專家曾參與「哈薩克網路之盾」（Cyber Shield of Kazakhstan）的開發與實施[^29]。一名 TJJ 前員工到 2024 年 5 月為止擔任專案經理，列出的工作職責包括「成功建立包含深度封包檢測在內的整合式網路安全系統」。

### 中國系統與俄羅斯系統

外洩文件與貨運紀錄裡有一項關鍵證據，顯示哈薩克的網路監控機制經由 Geedge 取自中國，而非先前研究推測的俄羅斯。長久以來，外界一直認為哈薩克政府執行的是以俄羅斯 SORM（System for Operative Investigative Activities，偵查行動措施系統）為基礎的深度封包檢測系統。會假設哈薩克的 SORM 系統具備 DPI 能力、而且來自俄羅斯，很可能是因為兩國文化關係密切，加上 2019 年有些聲明與報導提到 SORM 和俄羅斯的關聯[^30]。

和 SORM 相比，Geedge 套件是另一種系統，監控能力更進階。SORM 可視為「合法監聽」（legal intercept，LI）系統，收集的是連線時間戳記、使用者 IP 位址這類簡單資料[^31]。Geedge 系統透過 DPI 擷取的資訊多得多，設計上就是要做到超越合法監聽能力的大規模監控。

外洩的原始文件顯示，Geedge 為哈薩克專案把給終端使用者的文件譯成俄文，沒有譯成官方的國家語言哈薩克語。這可能代表 Geedge 有意把產品推銷到其他獨立國家國協（CIS）國家。

哈薩克是 Geedge Networks 的第一個客戶，從這個案例可以看出 Geedge 最早的商業模式。哈薩克的法律環境，讓當地成為對 Geedge 很有吸引力的市場。此外，哈薩克使用 Geedge 的產品套件，讓托卡耶夫政府一邊維持政治改革的表象，一邊對人民與反對派施加前所未有的控制。托卡耶夫提出的「傾聽型國家」（listening state）概念，在 Geedge Networks 的技術下多出第二層令人不寒而慄的意思：國家可以竊聽全國的網路與行動通訊[^32]。

## 衣索比亞（E21）

!!! abstract "時間軸（原報告以圖呈現）"

    - 2020 年 11 月：提格雷地區爆發內戰，當地的網路與電話開始中斷
    - 2021 年 7 月：Safaricom 取得執照，成為衣索比亞新的電信業者
    - 2021 年 12 月：Dire Dawa-IGW 資料中心切換到內聯模式，Adama 資料中心切換到內聯模式
    - 2022 年 11 月：提格雷停火協定簽署
    - 2022 年 12 月：聯合國網際網路治理論壇（IGF）在衣索比亞舉行，Geedge 簽核兩座 Safaricom 資料中心
    - 2023 年 2 月：Safaricom 的 STEP HQ IGW 資料中心切換到內聯模式，奧羅米亞發生反政府抗議後，當局開始針對性封鎖社群媒體網站
    - 2024 年 6 月：衣索比亞 Geedge 修訂日誌的最後一筆紀錄

### 背景

衣索比亞政府在衝突期間，向來會以中斷網路作為管控手段。Access Now 的 Keep It On 聯盟記錄到 2016 年至 2023 年間的 26 次斷網[^33]。

政府通常以國家安全、防止假訊息與仇恨言論擴散為名，替斷網辯護[^34]。政府以國家安全相關立法作為斷網的法律依據，例如資訊網路安全局（Information Network Security Agency）的第 808/2013 號與第 320/2014 號重新設立公告、2020 年的《網路犯罪法案》，以及宣布緊急狀態[^35]。

衣索比亞斷網最鮮明的例子之一，是 2020 年 11 月到 2023 年 1 月的提格雷斷網。從 2020 年開始，衣索比亞部隊與厄利垂亞軍隊在提格雷地區，與提格雷人民解放陣線（Tigray People's Liberation Front）爆發內戰，這場戰爭引發種族滅絕的指控。提格雷停火協定在 2022 年 11 月 2 日簽署，僅僅兩週後，出席聯合國 IGF 的各國代表抵達阿迪斯阿貝巴。據報導，提格雷到 2023 年 1 月已部分恢復網路連線[^36]。提格雷斷網是史上最長的斷網之一，聯邦政府讓數百萬人斷絕網路與電話通訊超過兩年。

衣索比亞的網路在大部分的歷史裡都由國家壟斷，由 Ethio Telecom 提供。2021 年，肯亞電信公司 Safaricom 取得在衣索比亞營運的執照。國際投資人參與出資，成立這家肯亞電信巨頭在當地的子公司 Safaricom Telecommunications Ethiopia。公開紀錄顯示，這家子公司在 2022 年 10 月啟用全國網路[^37]。儘管政府持續斷網，外界仍把 Safaricom 進入衣索比亞電信市場，宣傳為當地通訊自由化與商機的里程碑[^38]。

### 衣索比亞與 Geedge

根據外洩文件，Geedge Networks 在 2021 年開始在衣索比亞營運，比 2022 年的提格雷停火早一年，也大約是 Safaricom 進入衣索比亞電信市場的時候。一份修訂日誌記錄 Geedge 員工執行的作業，最早可追溯到 2021 年 9 月。

一份名為「E21 現場網路規劃與方案部署規劃」（E21 On-site Network Planning and Program Deployment Planning）的文件，詳細記載 Geedge 技術在衣索比亞各城市的部署概況。這份文件：

- 有兩張表格，一張列出所有運作中的區域與國家資料中心及網路連線，另一張詳列各資料中心設定的重大變更。
- 記錄維護與營運工作，寫下變更日期，以及簽核每項變更的 Geedge 員工姓名。

修訂日誌涵蓋 2021 年 9 月到 2024 年 6 月的事件。

2022 年 12 月的一筆日誌記載，Geedge 技術長 Zheng Chao 簽核阿迪斯阿貝巴兩座 Safaricom 區域資料中心的工作。2023 年 2 月的修訂日誌也詳細記錄 Geedge 為 Safaricom 擴充容量的工作。Geedge 協助 Safaricom 衣索比亞的資料中心安裝監控與審查技術的同時，Safaricom 衣索比亞在 2023 年 6 月取得 1,090 萬美元的投資，投資人包括世界銀行集團，以及英國政府的開發金融機構英國國際投資公司（British International Investment）[^39]。

2023 年間，Geedge 持續擴充容量，並擴展到新的資料中心。日誌在 2024 年只記錄兩次維護，其中一次和修理網路卡有關。

### 壓制社會動盪的工具

提格雷戰爭或許是衣索比亞政府決定找新承包商處理網路審查與監控的動機之一，但從獨立量測的結果可以清楚看到，系統建置完成後，也用在因應其他社會動盪事件。2023 年 2 月，衣索比亞正教會與中央政府之間的爭端，在奧羅米亞引發抗議，造成數人死亡[^40]。監測網路審查的組織，例如網路干擾開放觀測站（Open Observatory of Network Interference，OONI），回報當地的社群媒體網路遭到限制[^41]。TSG 等 Geedge 服務，能實施上述針對性的中斷與限制。

Geedge 的修訂日誌顯示，從鏡像模式切換到內聯模式，和政府準備斷網之間有關聯[^42]。舉例來說，從鏡像設定切換到內聯設定，可能代表即將斷網。大致而言，鏡像模式比較適合監控，內聯模式比較適合斷網。日誌總共記錄衣索比亞 18 次切換到內聯模式的變更，其中兩次發生在 2023 年 2 月斷網前，地點是 Safaricom 的資料中心。

衣索比亞的例子有幾個值得深究的原因。衣索比亞是中國在非洲的重要夥伴國，非洲聯盟與其他國際治理組織都設在阿迪斯阿貝巴[^43]。衣索比亞的合約，是一個國家利用 Geedge 協助的斷網，掩蓋國家嚴重罪行的實例，這些罪行包括可能的戰爭罪與種族滅絕。衣索比亞電信業的歷史，也讓我們可以研究 Geedge 系統如何部署在競爭有限、網路服務不久前仍由國家壟斷的環境。最後，衣索比亞是我們所知 Geedge 唯一位於亞洲以外的客戶國家，了解當地的營運情形，有助於看出 Geedge 未來的擴張方向。

## 巴基斯坦（P19）

### 背景

多年來，巴基斯坦政府替監控與審查民眾鋪路。Access Now 的 Keep It On 聯盟從 2016 年起記錄巴基斯坦的網路中斷[^44]。

2024 年，Keep It On 記錄到 21 次斷網，是巴基斯坦單一年度的最高紀錄。巴基斯坦電信管理局（PTA）在 2024 年年報裡承認，特定內容遭封鎖的次數超過 10 萬次[^45]。依照 PTA 的報告，多數網站封鎖的理由是「道德」、「國家安全」與「基於宗教煽動仇恨」，但法律沒有替這些用語下明確的定義。此外，《2016 年電子犯罪防制法》（Prevention of Electronic Crimes Act, 2016）讓政府可以執行大規模監控與針對性監控。2013 年，公民實驗室（Citizen Lab）發表報告，記錄巴基斯坦使用加拿大公司 Netsweeper 的技術過濾、封鎖網路流量[^46]。2018 年 3 月，PTA 公開招標一套網路管理系統（Web Management System，WMS），要求系統可以「自我學習」，辨識褻瀆宗教或威脅國家安全的網站[^47]。招標之後，Coda Story 報導巴基斯坦在 2018 年 12 月與第二家加拿大公司 Sandvine 簽下 1,850 萬美元的合約，採購這套系統的其中一個版本[^48]。國際特赦組織的安全實驗室（Security Lab）檢視貨運紀錄後判定，Sandvine 的 WMS 技術從 2017 年開始出貨，一直持續到 2022 年[^49]。巴基斯坦國家防火牆（也就是 WMS）的第一代使用深度封包檢測，替電信主管機關 PTA 監看通訊。

### 巴基斯坦與 Geedge

Geedge 替巴基斯坦專案取的代號是 `P19`。從新外洩文件裡的證據來看，Geedge 在巴基斯坦的營運到 2023 年才開始，時間點與 Sandvine 結束巴基斯坦合約的時間吻合。Sandvine 為了因應美國商務部的制裁，在 2023 年 11 月終止合約[^50]。

Geedge 版本的巴基斯坦國家防火牆，國際特赦組織安全實驗室稱為 WMS 2.0，多了 TSG-OS 帶來的新功能。新的防火牆可以儲存哪些人在使用規避審查的工具、哪些 IP 位址造訪過哪些網站。系統可以監控國內的網路流量與電話通訊，也可以追蹤、封鎖 VPN 等規避工具與特定網站的連線。

一位巴基斯坦 ISP 高階主管接受半島電視台（Al Jazeera）採訪時的用語，和 Geedge 的行銷資料非常接近[^51]。這位不具名的主管說，新的 WMS 正在部署，地點除了國家的網際網路閘道，也包括行動網路業者與 ISP 的本地資料中心[^52]。舊系統只能監控進出國境的內容，所以巴基斯坦無法審查 Netflix、Meta 等公司在當地架設的快取內容傳遞網路（CDN）上的內容。受訪主管比較 WMS 1.0 與 WMS 2.0 時說：「新的 DPI 系統和 Sandvine 的系統不同，現在可以監控本地的網路流量。」他說新系統採用「內聯網路」（in-line network），比較可能拖慢使用者的網速。他也提到，中國（Geedge）的技術可以在「細緻的層級」（granular level）管理應用程式與網站，功能比 Sandvine 更好。

和其他使用 Geedge 服務的國家不同，巴基斯坦沒有國家中心或區域中心。Geedge 的設備安裝在三個據點，很可能是沿用舊 Sandvine 系統留下的架構：PCAP（資料中心的通稱，註記為「備援」）、MSH（大部分 TSG 硬體所在的地方）、TWA（可能是 Transworld Associates 公司擁有的喀拉蚩海底電纜登陸站）。

### 舊硬體上的 Geedge 平台與令人憂心的隱私問題

國際特赦組織安全實驗室在新發表的報告《Shadows of Control》中寫到，Geedge Networks 文件外洩帶出的最重要發現之一，是「不同供應商的技術可以互相依存，也可以改作他用、彼此搭配運作。」[^53]也就是說，Geedge 以 Sandvine 建立的系統為基礎，在 Sandvine 的合約沒有續約之後，把原有的硬體改裝成執行 Geedge 作業系統的設備。國際特赦組織找到一份 2023 年 7 月 20 日的 WMS 設計文件，文件裡的設計是在改作他用的 Sandvine 硬體上執行 Geedge 的 TSG 平台[^54]。

雖然系統建在改作他用的硬體上，仍可以從半島電視台的一篇報導看出 Geedge 系統可能的造價。以匿名為條件接受這家卡達新聞媒體採訪的官員說，來自不具名供應商的中國新系統，會讓巴基斯坦花上 200 億到 300 億盧比（7,200 萬到 1 億 700 萬美元），2024 年下半年使用者回報的網速變慢與全面斷網，也是這套系統造成的[^55]。

Geedge 系統可以擷取的不只是中繼資料。連線沒有加密時，系統也會伺機擷取內容。國際特赦組織在 Geedge 內部的工單系統 Jira 裡找到一張技術支援工單，上面有兩封電子郵件的完整內容（含附件）與電子郵件密碼，都是 TSG 從一條連到郵件伺服器、沒有加密的連線上攔截到的[^56]。

敏感的使用者資料出現在第三方服務供應商的技術支援工單裡，又成為外洩資料的一部分，令人擔憂。巴基斯坦案例的使用者資料與隱私問題還不只如此。國際特赦組織提到，自 2015 年起，巴基斯坦發給行動網路用戶的每一張新 SIM 卡，都必須登記在特定使用者名下。SIM 卡也要連結到使用者在國家資料庫與登記管理局（NADRA）留存的指紋等生物特徵。民眾需要 NADRA 檔案才能使用醫療、銀行、教育等基本服務。NADRA 檔案也連到選民登記、稅務紀錄等其他資料庫，合起來就是每一位公民的完整紀錄[^57]。Geedge 的 Sanity Directory 元件有一項核心功能，是把流量對應到特定的 SIM 卡。有了 Sanity Directory，除了大規模監控，也能對巴基斯坦與 Geedge 營運的其他國家裡的特定個人，執行高度鎖定的微型監控。

從巴基斯坦的案例可以看到，導入 Geedge 的系統讓政府的監控能力大為增加，政府多了監控本地網路流量、追蹤規避工具使用情形的新能力。Geedge 改用 Sandvine 的硬體，凸顯這家公司善於調整、沿用既有的基礎設施，也願意把競爭對手遭到制裁當成市場機會。此外，TSG-OS 與 SIM 卡登記的生物特徵資料整合，顯示 Geedge 系統可以和其他監控系統結合，形成更全面的監控架構。

## 緬甸（M22）

### 背景

2021 年 2 月，一場軍事政變推翻翁山蘇姬的民選政府。政變讓緬甸陷入大範圍的動盪，各地的民主派團體與少數民族武裝組織起兵抵抗。2023 年，名為國家行政委員會（SAC）的軍政府仍未能鞏固權力，也一直無法完全掌控人民與領土[^58]。政變之後，軍政府加強監控民眾，把斷網當成武器，光是 2024 年就下令斷網 76 次[^59]。《紐約時報》（The New York Times）在 2025 年 3 月寫到，一場重創緬甸的強烈地震發生後，救災受到阻礙，「部分原因是緬甸的網路審查歷史……軍方一再關閉網路、切斷社群媒體的連線，讓緬甸在數位上與世界其他地方隔絕。」[^60]

2024 年 5 月，緬甸軍政府宣布禁止使用 VPN，士兵會檢查民眾的手機，威脅、罰款、逮捕使用 VPN 的人[^61]。2025 年 1 月，軍政府施行揚言多時的《網路安全法》（Cybersecurity Law），使用 VPN 的人將受到處罰[^62]。

### 緬甸與 Geedge

依照倡議團體 Justice For Myanmar 在 2024 年 6 月發表的研究，2024 年 5 月之後，緬甸的網路審查系統由 Geedge Networks 供應[^63]。不過從外洩文件來看，系統在前一年、也就是 2023 年就開始導入，當時軍政府已掌權兩年。

原始文件呈現的是 Geedge 系統在 2025 年地震之前的樣貌[^64]。依照文件的紀錄，到 2024 年為止，軍政府一直能成功封鎖網際網路、VPN 的連線，甚至封鎖 Tor 這類匿名網路。

緬甸相關的文件包括 Geedge 系統的導入規劃文件、部署計畫、網路拓樸、變更紀錄、統計資料、Geedge 服務封鎖 VPN 等規避工具效果的測試，以及修復硬體、軟體與效能問題的往來通訊。

此外，另一個來源的文件裡有一份未簽署的合約草稿，採購的產品是「安全網頁閘道」（secure web gateway）。合約寫明買方是「緬甸聯邦共和國政府運輸與通訊部」，賣方是一家不具名的公司，銀行帳戶開在北京一家中國的銀行。合約上唯一的日期是 2023 年。

緬甸的一份變更紀錄標示的建立日期是 2023 年 11 月，可以看成當時的快照。紀錄列出資料中心的名稱、所在城市、容量與流量的資訊，以及每個資料中心安裝給 Geedge 使用的伺服器數量。從紀錄來看，到 2023 年底，Geedge 的系統已安裝在 30 個資料中心。之後一份 2024 年 2 月 24 日的進度報告顯示，三個城市的系統導入進度達到 100%。

一份網路與部署規劃文件顯示，資料中心分布在仰光、曼德勒、大其力、內比都、木姐與妙瓦底，其他含有網路圖的文件也互相佐證。國家指揮中心（National Command Center）是主管機關管理、控制流量的地方，設在內比都，不過規劃文件裡的表格顯示仰光還有第二個國家中心。國家中心由 Geedge 營運，區域中心由 ISP 營運，裡面的 Geedge 系統由國家中心統一協調。此外，一位不具名的 Geedge 員工回覆客戶時，把內比都的國家中心形容為「主要用來展示」[^65]，可見真正的指揮與控制中心在仰光。表格裡總共有 30 個資料中心，分布在六座城市，其中 2 個是國家中心、28 個是區域中心。

規劃文件列出緬甸境內每一家 ISP 的資料中心，不論國營或民營。表上有 MyTel、Ooredoo、MPT 與 ATOM 這「四大」ISP，也有規模較小的業者，例如 Frontiir、Global Technology Group、Golden TMH Telecom、Stream Net、IM-Net、Myanmar Broadband Telecom、Myanmar Telecommunications Network Public Company Limited、Campana 與中國聯通（China Unicom）。

文件裡也有每一家 ISP 的線路測試報告，記錄 2024 年間不同日期執行的網站連線測試。測試的目的看來是評估各家 ISP 網路上的審查成效。

### ISP 對 Geedge 硬體的否認與 VPN 封鎖

2025 年 5 月，調查新聞媒體 Finance Uncovered 與緬甸媒體 Myanmar Now 報導，獲得丹麥、挪威與英國政府投資的 ISP 業者 Frontiir，在自家資料中心裡運作 Geedge 的技術，這套技術可以「在網路上追蹤民眾、封鎖網站」與 VPN[^66]。Frontiir 的發言人否認曾在自家網路上「建置、規劃或設計任何與監控相關的東西」。然而外洩文件顯示，緬甸所有 ISP（包括 Frontiir）的建築物裡都裝有 Geedge 硬體。文件詳細記錄安裝的情形，以及各家 ISP 的線路如何互相連接。下方是網路規劃文件裡的示意圖，呈現 Geedge 系統如何整合進 Frontiir 的資料中心。

必須指出，Geedge 不可能在 ISP 不知情、不配合的情況下安裝硬體。根據外洩文件裡的證據，我們知道 Frontiir 等 ISP 聲稱不知道自家網路上部署監控設備，這類否認與事實不符。

我們的團隊聯絡本報告提到的緬甸 ISP，收到 ATOM（前身為 Telenor Myanmar）的母公司 Investcom Holding 回覆。Investcom Holding 在信中表示，ATOM 的網路不會設計、指揮和（或）執行大規模的非法監控。信中也寫到，ATOM 營運電信網路，必須遵守具約束力的法律與法規，ATOM 也依照《聯合國企業與人權指導原則》（UNGPs）執行公司內部的人權盡職調查程序。

Investcom Holding 回覆的完整內容見[附錄](./index_8.md#附錄)。

<figure markdown="span">
  [![圖 15](https://assets.anoni.net/the-internet-coup/index-6-49-1.png)](https://assets.anoni.net/the-internet-coup/index-6-49-1.png){target="_blank"}
  <figcaption>圖 15：從 Geedge Networks 資料集擷取的圖片，呈現 Frontiir 仰光資料中心的網路拓樸，Geedge 的硬體整合在 ISP 的網路基礎設施裡。</figcaption>
</figure>

外洩文件也詳細記錄如何封鎖 VPN、Tor（尤其是以 Tor 為基礎的手機 App Orbot）與規避工具 Psiphon。緬甸想封鎖的 VPN 清單，比衣索比亞、哈薩克等部分客戶國家提供的封鎖清單更長。文件記錄 Geedge 替「高優先順序 App」開發封鎖規則的過程，清單上有 55 個要封鎖的 App，包括通訊軟體 Signal 與 WhatsApp[^67]。特別的是，封鎖規則由 Geedge 開發，客戶國家不必自行制定，多數競爭產品可能沒有提供這種服務。有些客戶可能不想直接參與制定封鎖特定社群媒體 App、VPN 與網站的規則，對這些客戶來說，把「制定規則」外包出去可能是一項賣點。

Geedge 的監控技術部署在緬甸，凸顯軍政府倚賴數位工具控制人民。系統在 2023 年導入，距離政變只有兩年，顯示 Geedge 有能力利用緬甸既有的基礎設施，也願意擴充軍政府的監控能力。從外洩文件可以看到 Geedge 系統的精密程度，包括封鎖 VPN 的能力與封鎖 Tor 的嘗試，可見 Geedge 願意調整技術，配合壓迫性政府的需求。2025 年 3 月的緬甸地震，讓外界看到斷網與通訊限制的嚴重後果，斷網妨礙緊急救援，也和一些原本可以避免的死亡有關[^68]。Geedge Networks 的系統和威權政府結合之後可能妨礙人道救援，緬甸是令人警惕的例子。

## 初期階段的未知客戶（A24）

本報告點名的客戶國家，在外洩文件裡都有對應的具體地點和（或）ISP，但 `A24` 的相關資料沒有任何可以辨識客戶的線索。關於 `A24` 客戶的身分，唯一的線索是首字母 A 與年份 2024。

除此之外，從資料來看，外洩發生時 `A24` 與 Geedge 的關係似乎還在初期階段。合作內容是兩次 Geedge 設備的概念驗證（proof of concept）部署，一次採鏡像模式，另一次採內聯模式，目的是向客戶說明兩種模式的差異。

### 西方公司的共謀

西方機構支援、資助在 Geedge 客戶國家營運的 ISP，可能等同默許 Geedge 的審查做法。在 Geedge 控制網路的行動裡，西方直接共謀最令人不安的例子之一，是數位版權管理（DRM）方案 Sentinel HASP。Sentinel HASP 最初由馬里蘭州的小公司 Aladdin Knowledge Systems 開發（譯註：Aladdin Knowledge Systems 在 1985 年於以色列創立，2009 年由 Vector Capital 收購，之後併入總部在馬里蘭州的 SafeNet）。SafeNet 後來收購這家公司，之後再轉到 Gemalto 手上，目前屬於法國航太與國防大廠 Thales 集團。

從外洩資料可以清楚看到，Geedge Networks 使用 Sentinel HASP 技術，替天狗安全閘道的作業系統實施按訂閱計費、有期限的授權。也就是說，授權期滿之後軟體就會停止運作，Geedge 因此可以掌控客戶能使用軟體多久。Thales 把 Sentinel HASP 技術賣給 Geedge Networks，等於提供工具，讓 Geedge 得以從事監控與審查的營運。從 Thales 與 Geedge 的關係可以看到，西方公司即使只是間接參與，也在延續網路壓迫上扮演角色。

我們與聯合調查團隊的夥伴一起聯絡 Thales 集團，請他們說明。Thales 在回覆中確認 Geedge Networks 是他們的客戶。

Thales 的回覆裡也寫到：「Thales 的產品 Sentinel 是軟體授權系統，設計用途是讓軟體在各種商業模式下都能變現。不過，Geedge Networks 的軟體並不仰賴 Sentinel 才能運作。因此，Sentinel 對 Geedge Networks 軟體的效能與運作沒有貢獻，也和 Geedge Networks 產品的監控功能毫無關係。」＊

Thales 集團在信中也寫到，公司遵守嚴格的準則，降低產品與服務遭到濫用、進而嚴重侵害人權與基本自由的風險。

＊回覆原文為德文，上方引文是意譯。Thales 在 2025 年 8 月 29 日回覆聯合調查團隊的詢問，完整內容見[附錄](./index_8.md#附錄)。

## 中國

Mingshi Wu、Ali Zohaib 等人在 2025 年發表研究，主張區域審查是中國防火長城的下一個階段[^69]。作者分析中國七個地區的量測資料後認為，河南出現更嚴格、區域化的審查機制。作者也寫到，「在地化的審查顯示中國正偏離中央集權的審查體系，讓地方當局可以在各自轄區內施加更大程度的控制。」Geedge Networks 與 Mesalab 的外洩文件，似乎印證 Wu 等人發現的新趨勢。

### 新疆（J24）

#### 背景

新疆被形容為全世界監控最嚴密的地區之一，當地集中部署大量用來控制與監控人口的高科技系統，密度獨一無二。新疆住著 1,100 萬維吾爾人，維吾爾人是中國在語言與宗教上的少數群體。新疆也被稱為試驗場，各種工具先在這裡部署、試驗、修改，再用在其他人群身上[^70]。

#### 新疆與 Geedge

外洩資料裡有一份 2024 年 6 月 22 日在中國科學院（中科院）新疆分院（Xinjiang Branch of the Chinese Academy of Sciences，原報告附的中文是「新疆分中心」）演講的筆記。筆記可能出自 Geedge 員工之手，記下 Geedge 的專案「目標是把區域中心轉型為反恐的先鋒力量，特別是在壓制翻牆方面。」[^71]筆記提到「國家（防火牆）正從集中式模式走向分散式模式」，新疆區域中心的目標是「成為省級（防火牆）建設的典範，可供其他地方複製或借鏡。」依照筆記，演講者主張他的分中心著重如何運用技術打擊規避工具的使用，鎖定個人不在重點之內。Geedge 外洩的其他文件則顯示，公司正同時建立鎖定個人與打擊規避工具的能力。從會議筆記也可以看到一些政治關係的證據，筆記提到 2024 年 4 月曾有一位部長聽取會議的簡報（譯註：原文如此，2024 年 4 月早於 6 月 22 日的演講，可能指另一場會議）。

#### 新疆專案

`J24` 看來是 Geedge 替新疆專案取的代號。新疆專案和 Geedge 的其他政府客戶不同，原因在於專案與 Mesalab、中科院之間有密切的交流。Geedge 獲准在新疆營運，也顯示 Geedge 與中國政府關係密切。啟動 `J24` 專案之前，Geedge 先在新疆與中國聯通、中國移動、中國電信三大 ISP 做過一次實地測試。名為 Xinjiang Network Performance Monitoring（NPM，新疆網路效能監測）的測試在 2022 年開始，在試點 ISP 的資料中心安裝 TSG 硬體。系統用 Cyber Narrator 產生每週報告，內容有流量資料，以及依流量排名的熱門應用程式、網站與 IP 位址。

一份關鍵文件的標題大致可譯為「新疆聯通 IDC 專案 Cyber Narrator 系統概述」（IDC 指網際網路資料中心），從文件可以看到實地測試的細節。專案一開始著重替 ISP 與內容傳遞網路業者改善網路效能，也想偵測省內的加密貨幣挖礦、電信詐騙等當局不樂見的活動。專案看起來是為了監控與系統評估而設計，審查並非主要重點。

實地測試的系統整合在 2022 年 4 月開始，同月就全面上線運作。到 2023 年 12 月，所有網路線路都已下線。系統執行 23 個月後，在 2024 年 3 月 29 日正式除役，`J24` 專案隨即展開。

和先前的專案相比，`J24` 的規模大得多，也不再以 ISP 作為終端使用者。`J24` 的架構和 Geedge 在國外客戶的營運相似，由一個「國家中心」（在新疆，Geedge 稱為中央指揮中心）監管分散各地的區域中心（Geedge 稱為電信業者中心）。`J24` 的電信業者中心設在中國電信、中國移動、中國廣電與中國聯通的資料機房裡。和所謂的國家中心一樣，中央指揮中心可以遠端管理部署在電信業者據點的監控設備。根據一份文件，這些 ISP 的機房裡共有 17 個電信業者中心。

#### J24 專案的新增功能測試

在標題為 CBNR-J24 Requirement Organization（需求整理）的文件裡，Geedge 列出新疆部署要加進 Cyber Narrator 的功能。Geedge Networks 希望 Cyber Narrator 可以彙整、分析使用者的上網行為、生活模式與人際關係。Geedge 也想加入繪製關係圖的能力，依目標的通訊對象建立關係圖，並依使用的應用程式或造訪的網站把人分群。

未來開發的需求還提到，要能查詢哪些使用者連在特定的行動基地台，以便透過基地台做三角定位，並偵測大量人群在特定區域聚集。

此外，專案計畫加入建立地理圍欄（geofence）的功能，特定個人進入指定區域時就觸發警示。專案也著重查詢歷史位置資料，追溯過去的行蹤。Geedge 希望可以標記經常更換 SIM 卡、撥打國際電話，或使用規避審查工具與國外社群媒體 App 的人。

`J24` 專案也包含針對特定群體設計的功能，可以在地圖上顯示受監控群體的地理分布，並偵測群體成員在特定地點的異常聚集。系統操作人員因此可以追蹤、預判大型抗議與示威的形成。

新疆專案和 Geedge 在國外的營運明顯不同。Geedge 與中科院 Mesalab 的關係在新疆專案最清楚，Geedge 與中國政府的密切關係也有證據可循。從新疆專案可以看到科技公司、學術機構與地方當局之間的整合，監控與審查的做法因此更能量身打造，也更具實驗性。從替 Cyber Narrator 提出的新增功能需求來看，Geedge 的商業模式已經展現調適能力，這些功能未來也可能部署到中國其他地區與國外。區域化審查與監控的趨勢可以看作防火長城的補充，讓控制落實到省級。政府也能依地方需求調整壓制策略，少數民族聚居的地區可能因此受到更嚴密的審視。

### Geedge 在福建與江蘇的據點

文件顯示，Geedge Networks 從 2022 年起在福建執行類似的省級防火牆試點專案，福建是與台灣隔海相望的省分。不過和其他部署相比，福建專案的資訊有限。外洩文件裡，試點沒有代號，只稱為「福建项目」（Fujian Project）。

文件只有營運層面的細節，除了從 Jira 的營運問題工單推測出的部分，沒有規劃階段或客戶需求的資訊。Geedge Networks 的硬體安裝在福建泉州、福州、漳州、寧德與廈門的資料中心。其中一張問題工單寫明政府客戶是福建省的行政機關。另一張工單列出的需求之一，是把 HTTP 請求重新導向到另一個 URL。

一張福建專案儀表板的截圖，呈現 2022 年 8 月某一週的資料，標題是「泉州市公安局清源系统」（Quanzhou Public Security Bureau Qingyuan System），從畫面可以看到當週封鎖的「詐騙網站」大多架設在美國。

<figure markdown="span">
  [![圖 16](https://assets.anoni.net/the-internet-coup/index-6-54-1.png)](https://assets.anoni.net/the-internet-coup/index-6-54-1.png){target="_blank"}
  <figcaption>圖 16：從 Geedge 資料集擷取的福建專案儀表板截圖。</figcaption>
</figure>

另外有幾份文件提到江蘇的專案，江蘇是中國東部的沿海省分。Geedge 與地方主管機關江蘇省公安廳（JPSB）合作，名義上的動機是打擊網路詐騙。從往來通訊可以看到，江蘇省公安廳不太願意讓 Geedge 建立巨量資料叢集，比較希望 Geedge 把工具部署在既有的基礎設施上。名為 Jiangsu Nanjing 的初期測試環境在 2023 年 2 月上線，江蘇反詐騙專案（Jiangsu Anti-Scam Project）看起來在 2024 年 3 月 15 日前已進入正式上線階段。

Wu 等人在研究中寫到，「從美國到中國各地的測試，一致辨識出同樣 411 個遭 GFW 封鎖的網域，只有一個例外：從美國到江蘇省的測試偵測到 440 個遭封鎖的網域。」[^72]作者在 2023 年 11 月到 2025 年 3 月之間量測，2024 年 3 月到 10 月有一段量測空窗。這些量測可能捕捉到 Geedge 在江蘇剛起步的營運。

Geedge Networks 曾在不同時期，到中國其他省分部署測試環境與示範系統，但看起來都是暫時的，只為了展示產品或供學術用途。

從福建與江蘇的試點專案可以看出，Geedge 在中國的版圖從新疆延伸到其他地區。雖然文件不足、細節有限，這些計畫仍顯示 Geedge 的觸角持續擴大，也能靈活配合地方當局的需求。前面提到的區域化審查與監控趨勢，在福建與江蘇的發展中更加明顯，Geedge Networks 在中國整體網路控制體系中的份量也持續增加。

*[DPI]: 深度封包檢測，檢視連線內容，用來分析、記錄或攔截流量的技術
*[ISP]: 網路服務供應商，提供上網連線的電信業者或公司
*[TSG]: 天狗安全閘道，Geedge 的旗艦產品，國家等級的防火牆與流量管理系統
*[Mesalab]: 中國科學院的實驗室，與 Geedge 共享資料、改善監控系統
*[SORM]: 俄羅斯的偵查行動措施系統，電信業者依法安裝的監聽設備
*[OSINT]: 公開來源情報，從公開資料蒐集與分析的情報
*[WMS]: 巴基斯坦的網路管理系統（Web Management System），也就是國家防火牆
*[NADRA]: 巴基斯坦的國家資料庫與登記管理局，負責國民身分登記
*[CDN]: 內容傳遞網路，把網站內容放在離使用者較近的伺服器
*[Jira]: Atlassian 的工單與專案管理系統

[^19]: 巴基斯坦是例外，當地沿用先前與另一家供應商簽約時留下的硬體，架構因此略有不同。
[^20]: 這份新聞稿使用的是 Geedge 的舊公司名稱。Sohu，[海南省方滨兴院士工作站在海南生态软件园揭牌](https://www.sohu.com/a/751088620_121719902){target="_blank"}（海南省方濱興院士工作站在海南生態軟體園揭牌），2024-01-11。（譯註：原報告寫「former company name: Sohu」，Sohu 是刊登這份新聞稿的搜狐網站，原報告沒有寫出 Geedge 的舊名稱。）
[^21]: ARTICLE 19，[Analysis on National Security Law](https://www.article19.org/data/files/medialibrary/37125/Kazakhstan--National-Security-Law.pdf){target="_blank"}。
[^22]: Zakon.kz，[Постановление Правительства Республики Казахстан от 27 июля 2017 года № 457 О некоторых вопросах государственной технической службы (с изменениями от 26.03.2019 г.)](https://online.zakon.kz/Document/?doc_id=33104760#pos=0;124.44445037841797){target="_blank"}（哈薩克共和國政府 2017 年 7 月 27 日第 457 號命令〈國家技術服務局的若干問題〉，2019 年 3 月 26 日修訂）。
[^23]: 這種集中化並非 Geedge 系統運作的必要條件，可能是先前集中審查與監控的嘗試留下的遺緒。
[^24]: Freedom House，[Freedom in the World 2025, Kazakhstan](https://freedomhouse.org/country/kazakhstan/freedom-world/2025){target="_blank"}，2025。
[^25]: Apple 在 2019 年明確封鎖哈薩克國家憑證機構（sovereign certificate authority）攔截 TLS 通訊的企圖。
[^26]: 以天狗前端引擎（Tiangou Frontend Engine，TFE）元件發動的 TLS 中間人攻擊（MITM）。
[^27]: 哈薩克執行的是完整的 Geedge 產品套件，但因為它很可能是 Geedge 的第一個海外客戶，文件裡用的是這些產品的舊名稱。
[^28]: TOO 是俄文「有限責任公司」（LLC）的縮寫。見 [TOO TJJ-Company 的公司登記資料](https://ba.prg.kz/710000000-astana/191140019083-too-tjj-company/){target="_blank"}。
[^29]: TJJ-Company 的前技術長 Ramil Bektimirov 先前在國家技術服務局任職九年。他在網路上的社群媒體個人檔案中寫到，自己參與過 Qaznet 根憑證的中間人攻擊專案。TJJ 網站的封存頁面見 [Internet Archive 的頁面快照](https://web.archive.org/web/20220407023616/https:/tjj.kz/?page_id=169){target="_blank"}。
[^30]: 例如，瑞典 ISP Tele2 在 2019 年退出哈薩克市場，寄給股東的倫理報告說明退出原因時，提到 SORM 是當地的合法監聽系統。Tele2 認為這套系統可能遭到濫用，報告寫道「Tele2 KZ 無從得知 SORM 系統的使用頻率，也無從得知是否已取得必要的許可」。此外，2020 年俄語駭客團體「Digital Revolution」外洩資料，當地媒體報導時，錯把從事 SORM 相關專案的俄羅斯研究機構 Kwant-labs，與另一家同名的哈薩克公司當成同一家。那家哈薩克公司不久前才得標一項秘密的政府標案，要開發一套「分析哈薩克語影音資料」的軟體。報導拿兩個實體的名稱當作證據，主張哈薩克正在導入以俄羅斯 SORM 為基礎的 DPI，其他網路自由研究之後也引用這個錯誤。
[^31]: ISP 必須在網路中安裝合法監聽系統，保存網路存取紀錄。執法單位可以向合法監聽系統調閱資料，要取得個別使用者的資訊，則還需要取得許可。
[^32]: David Wemer，[First Glimpses of Tokayev’s Kazakhstan: The Listening State?](https://www.atlanticcouncil.org/commentary/long-take/first-glimpses-of-tokayevs-kazakhstan/){target="_blank"}，Atlantic Council，2019-09-17。
[^33]: Access Now，[Preserving Freedom in Crisis: Ethiopia’s Internet Shutdowns Must Not Become the Norm](https://www.accessnow.org/press-release/open-statement-internet-shutdown-amhara/){target="_blank"}，2023-09-12。
[^34]: 2020 年，奧羅莫族歌手暨社運人士 Hachalu Hundessa 遇害後，衣索比亞斷網兩週（[NetBlocks 的報告](https://netblocks.org/reports/internet-cut-in-ethiopia-amid-unrest-following-killing-of-singer-pA25Z28b){target="_blank"}）。2023 年 4 月到 7 月，衣索比亞國防軍（ENDF）與 Fano 民兵團體交戰，阿姆哈拉地區因此斷網數月（[Internet Society Pulse 的紀錄](https://pulse.internetsociety.org/en/shutdowns/internet-suspended-in-amhara-ethiopia-6-april-2023/){target="_blank"}）。2023 年 8 月，當局再次下令阿姆哈拉地區斷網，直到 2024 年 7 月才結束（[Internet Society Pulse 的紀錄](https://pulse.internetsociety.org/en/shutdowns/internet-suspended-in-amhara-ethiopia-3-august-2023/){target="_blank"}）。（譯註：原報告的兩個 Internet Society Pulse 網址已失效，2026-10 換成同一筆紀錄的新網址。）
[^35]: Kinfe Micheal Yilma，[Network Disruptions and the Law in Ethiopia: A Legal Guide](https://internews.org/wp-content/uploads/2022/08/Network-Disruptions-and-the-Law-in-Ethiopia.pdf){target="_blank"}，Internews，2021。（譯註：Internews 網站上的這份 PDF 在 2026-10 查核時已無法取得，網址照錄原報告。）
[^36]: Internet Society Pulse，[Shutdown - Ethiopia](https://pulse.internetsociety.org/en/shutdowns/internet-suspended-in-oromia-ethiopia-4-november-2020/){target="_blank"}，日期不詳（譯註：原報告的網址已失效，2026-10 換成同一筆紀錄的新網址，記錄 2020-11-04 至 2023-01-31 的斷網）。Carolyn Tackett、Felicia Anthonio，[After Years under a Shutdown, Tigray Is Slowly Coming Back Online](https://www.accessnow.org/tigray-shutdown-slowly-coming-back-online/){target="_blank"}，Access Now，2023-03-17。
[^37]: Paula Gilbert，[Ethiopia’s Telecoms Liberalization Makes Progress – Omdia](https://www.connectingafrica.com/connectivity/ethiopia-s-telecoms-liberalization-makes-progress-omdia){target="_blank"}，Connecting Africa，2024-10-21。
[^38]: Paula Gilbert，[Ethiopia’s Telecoms Liberalization Makes Progress – Omdia](https://www.connectingafrica.com/connectivity/ethiopia-s-telecoms-liberalization-makes-progress-omdia){target="_blank"}，Connecting Africa，2024-10-21。Natalie Donback，[Faster, Cheaper: How Ending the Government Monopoly Improved Ethiopia’s Internet](https://restofworld.org/2023/safaricom-creates-competition-ethio-telecom/){target="_blank"}，Rest of World，2023-03-17。
[^39]: British International Investment，[Safaricom Telecommunications Ethiopia Private Limited ...](https://www.bii.co.uk/en/our-impact/investment/safaricom-telecommunications-ethiopia-private-limited-company-investment-01){target="_blank"}，2025-08-13 讀取。International Finance Corporation，[Flagship Telecommunications Project to Bring Affordable, Reliable Internet and Mobile Services to Millions More in Ethiopia](https://www.ifc.org/en/pressroom/2023/flagship-telecommunications-project-to-bring-affordable-reliable-internet-and-mobile-services-to-millions-more-in-ethiopia){target="_blank"}，2023-06-08。（譯註：正文的投資對象，原報告寫「the company」，依本註腳的出處解讀為 Safaricom 衣索比亞。）
[^40]: Al Jazeera，[Social Media Restricted in Ethiopia as Church Rift Turns Violent](https://www.aljazeera.com/news/2023/2/10/social-media-restricted-in-ethiopia-after-church-rift-turns-violent){target="_blank"}，2023-02-10。
[^41]: NetBlocks，[Social Media and Messaging Apps Restricted in Ethiopia amid Religious Tensions](https://netblocks.org/reports/social-media-and-messaging-apps-restricted-in-ethiopia-amid-religious-tensions-DA3RJz8W){target="_blank"}，2023-02-09。Maria Xynou、Arturo Filastò，[Ethiopia: Ongoing Blocking of Social Media](https://ooni.org/post/2023-ethiopia-blocks-social-media/){target="_blank"}，OONI，2023-02-15。Amnesty International，[Social Media Blockade in Ethiopia Enters Second Month](https://www.amnesty.org/en/latest/news/2023/03/ethiopians-in-social-media-blackout-for-second-month/){target="_blank"}，2023-03-15。
[^42]: 更具體地說，在鏡像模式下，Geedge 的硬體一旦故障，使用者仍然可以上網，失效的是 Geedge 系統的審查功能。在內聯模式下，故障的結果就是斷網。無論鏡像或內聯模式，TSG 都能攔截、竄改流量。兩種模式的技術細節，請見本報告的「[審查與監控的系統模式](#審查與監控的系統模式)」一節。
[^43]: ROAPE，[Ethiopia as a Belt and Road Initiative Model](https://roape.net/2024/07/24/ethiopia-as-a-belt-and-road-initiative-model/){target="_blank"}，2024-07-24（譯註：原報告寫 2024-07-25，依 ROAPE 網站的發布日期改為 07-24）。
[^44]: Access Now，[EMBOLDENED OFFENDERS, ENDANGERED COMMUNITIES: Internet Shutdowns in 2024](https://www.accessnow.org/wp-content/uploads/2025/02/KeepItOn-2024-Internet-Shutdowns-Annual-Report.pdf){target="_blank"}，2025 年 2 月。
[^45]: Pakistan Telecommunication Authority，[Annual Report 2024](https://www.pta.gov.pk/assets/media/2024-12-16-pta_annual_report.pdf){target="_blank"}，2024-12-16。
[^46]: Irene Poetranto，[Netsweeper in Pakistan](https://citizenlab.ca/2013/08/netsweeper-in-pakistan/){target="_blank"}，The Citizen Lab，2013-08-01。
[^47]: Pakistan Telecommunication Authority，[Replies to Queries Raised on Pre-Qualification Process for Web Management System](https://pta.gov.pk/assets/media/response_queries_210318.pdf){target="_blank"}，2018-03-20。
[^48]: Umer Ali、Ramsha Jahangir，[Pakistan Moves to Install Nationwide ‘Web Monitoring System.’](https://www.codastory.com/authoritarian-tech/pakistan-nationwide-web-monitoring/){target="_blank"}，Coda Story，2019-10-24。
[^49]: Amnesty International，[Shadows of Control](https://www.amnesty.org/en/documents/asa33/0206/2025/en/){target="_blank"}，2025-09-09。
[^50]: 美國商務部自 2024 年 2 月 28 日起將 Sandvine 列入實體清單（Entity List），Sandvine 的出口因此須符合更嚴格的許可要求。見 U.S. Department of State，[The United States Adds Sandvine to the Entity List for Enabling Human Rights Abuses](https://2021-2025.state.gov/the-united-states-adds-sandvine-to-the-entity-list-for-enabling-human-rights-abuses/){target="_blank"}，2024-02-28。制裁在 2024 年 11 月解除，但 Sandvine 在巴基斯坦的業務已接近尾聲。
[^51]: 根據半島電視台的報導，Sandvine 與巴基斯坦的合約從 2018 年開始、原訂 2023 年到期，2022 年政府更迭後沒有續約。新的領導階層轉而尋找能提供更細緻內容過濾的公司。見 Hussain，[Pakistan Tests Secret China-like ‘Firewall’ to Tighten Online Surveillance](https://www.aljazeera.com/news/2024/11/26/pakistan-tests-china-like-digital-firewall-to-tighten-online-surveillance){target="_blank"}，Al Jazeera，2024-11-26。
[^52]: 需要說明的是，半島電視台的報導沒有指名與新 WMS 相關的中國科技公司就是 Geedge。
[^53]: Amnesty International，[Shadows of Control](https://www.amnesty.org/en/documents/asa33/0206/2025/en/){target="_blank"}。
[^54]: Amnesty International，[Shadows of Control](https://www.amnesty.org/en/documents/asa33/0206/2025/en/){target="_blank"}。
[^55]: Hussain，[Pakistan Tests Secret China-like ‘Firewall’ to Tighten Online Surveillance](https://www.aljazeera.com/news/2024/11/26/pakistan-tests-china-like-digital-firewall-to-tighten-online-surveillance){target="_blank"}，Al Jazeera，2024-11-26。
[^56]: Amnesty International，[Shadows of Control](https://www.amnesty.org/en/documents/asa33/0206/2025/en/){target="_blank"}。
[^57]: Amnesty International，[Shadows of Control](https://www.amnesty.org/en/documents/asa33/0206/2025/en/){target="_blank"}。
[^58]: Matteo Fumagalli，[Myanmar 2023: New Conflicts and Coalitions Reshape War Narrative, Challenging an Embattled Junta](https://www.asiamaior.org/the-journal/18-asia-maior-vol-xxxiv-2023/myanmar-2023-new-conflicts-and-coalitions-reshape-war-narrative-challenging-an-embattled-junta.html){target="_blank"}，Asia Maior（義大利的亞洲研究智庫），2024。
[^59]: Tommy Walker、Darko Janjevic，[Myanmar: Why Is Junta Shutting down Internet?](https://www.dw.com/en/myanmar-why-is-junta-shutting-down-internet/a-71770580){target="_blank"}，dw.com，2025-02-27。
[^60]: Adam Satariano、Paul Mozur，[Myanmar’s Internet Censorship Limits Information about Earthquake](https://www.nytimes.com/2025/03/28/world/asia/myanmar-earthquake-internet-censorship.html){target="_blank"}，The New York Times，2025-03-28。
[^61]: RFA Burmese，[Myanmar Junta Imposes Random Searches for VPNs](https://www.rfa.org/english/news/myanmar/myanmar-internet-restrictions-vpn-ban-06132024163512.html){target="_blank"}，Radio Free Asia，2024-06-13。Golda Benjamin、Wai Phyo Myint，[Worse than China or Iran? Myanmar’s Dangerous VPN Ban](https://www.accessnow.org/myanmar-vpn-ban/){target="_blank"}，Access Now，2024-06-26。
[^62]: RFA Burmese，[Myanmar Enacts Cybersecurity Law That Aims to Restrict Use of VPNs](https://www.rfa.org/english/myanmar/2025/01/02/cybersecurity-law-vpn/){target="_blank"}，Radio Free Asia，2025-01-02。
[^63]: Justice For Myanmar，[The Myanmar Junta’s Partners in Digital Surveillance and Censorship](https://www.justiceformyanmar.org/stories/the-myanmar-juntas-partners-in-digital-surveillance-and-censorship){target="_blank"}，2024-06-19。
[^64]: 這批文件沒有涵蓋 2024 年 12 月之後的事件。不過有報導寫到，部分審查系統在 2025 年 3 月的地震中損毀。
[^65]: 內比都是新首都，所以這個據點可能是設給政府官員使用的，可能是拍照宣傳與官方參訪的地點，日常營運不在此處。
[^66]: Caroline Henshaw、Aung Naing，[Chinese Technology Capable of Mass Surveillance ‘installed’ by Myanmar Internet Company Funded by UK](https://www.financeuncovered.org/stories/british-norwegian-and-danish-governments-back-internet-provider-in-military-run-myanmar-which-hosts-notorious-chinese-surveillance-system){target="_blank"}，Finance Uncovered，2025-05-21。Caroline Henshaw、Aung Naing，[European Govts Back Company That Uses Chinese Tech to Monitor Myanmar Internet Users](https://myanmar-now.org/en/news/european-govts-back-company-that-uses-chinese-tech-to-monitor-myanmar-internet-users/){target="_blank"}，Myanmar Now，2025-05-23。
[^67]: 根據外洩文件，Geedge 的應用程式清單共有 281 個應用程式。外洩資料裡的另一份文件列出緬甸軍政府提供的 55 個高優先順序應用程式。
[^68]: Access Now，[Joint Statement: Myanmar Must Lift Internet Restrictions Following Devastating Earthquake](https://www.accessnow.org/press-release/call-for-lifting-of-internet-restrictions-myanmar/?tztc=1){target="_blank"}，2025-04-04。
[^69]: Mingshi Wu、Ali Zohaib、Zakir Durumeric、Amir Houmansadr、Eric Wustrow，[A Wall Behind A Wall: Emerging Regional Censorship in China](https://gfw.report/publications/sp25/data/paper/paper.pdf){target="_blank"}，Great Firewall Report，2025 年 5 月。
[^70]: Human Rights Watch，[China’s Algorithms of Repression](https://www.hrw.org/report/2019/05/01/chinas-algorithms-repression/reverse-engineering-xinjiang-police-mass){target="_blank"}，2019-05-01。Zeyi Yang，[The Chinese Surveillance State Proves That the Idea of Privacy Is More ‘Malleable’ than You’d Expect](https://www.technologyreview.com/2022/10/10/1060982/china-pandemic-cameras-surveillance-state-book/){target="_blank"}，MIT Technology Review，2022-10-10。Josh Chin、Clément Bürge，[Twelve Days in Xinjiang: How China’s Surveillance State Overwhelms Daily Life](https://www.wsj.com/articles/twelve-days-in-xinjiang-how-chinas-surveillance-state-overwhelms-daily-life-1513700355){target="_blank"}，The Wall Street Journal，2017-12-19。Chris Buckley、Paul Mozur，[How China Uses High-Tech Surveillance to Subdue Minorities](https://www.nytimes.com/2019/05/22/world/asia/china-surveillance-xinjiang.html){target="_blank"}，The New York Times，2019-05-22。
[^71]: 會議筆記寫作 FQ。FQ 應該是指「翻墙」（fān qiáng），字面意思是「爬牆」，在中國常用來指繞過防火長城的人。
[^72]: Mingshi Wu、Ali Zohaib、Zakir Durumeric、Amir Houmansadr、Eric Wustrow，[A Wall Behind A Wall: Emerging Regional Censorship in China](https://gfw.report/publications/sp25/data/paper/paper.pdf){target="_blank"}，Great Firewall Report，2025 年 5 月。
