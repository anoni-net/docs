---
date: 2026-10-30
authors:
    - anoni-net
categories:
    - 更新
slug: interseclab-coup-retranslation
image: "assets/images/post-update.png"
summary: "InterSecLab〈The Internet Coup〉（網路政變）的正體中文譯文八章全部從原報告重新翻譯。舊譯文漏掉或譯錯了幾處重要的內容，包括 Geedge 是否掌握 Tor 的漏洞、沒有加密的連線會被攔截到什麼、各國使用者的資料有哪些人能存取，以及相關公司如何回覆。新譯文補上漏譯的段落與四個國家的時間軸，公司回覆信逐句對照原信重譯。"
description: "網路政變八章從原報告重新翻譯，補上漏譯的段落與時間軸，修正誤譯與公司回覆信。讀過舊版的人有四個地方值得回頭再看。"
---

# 網路政變報告的全文重譯

![The Internet Coup 報告封面](https://assets.anoni.net/the-internet-coup/The-Internet-Coup-InterSecLab-2048x986.png){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

InterSecLab 報告[網路政變](../../reports/interseclab-network-coup/index.md)的舊譯文有幾處把原報告的意思漏掉或譯錯，包括中國公司 Geedge 是否掌握匿名網路 Tor 的漏洞、沒有加密的連線會被攔截到什麼、各國使用者的資料有哪些人能存取，以及相關公司如何回覆。讀舊版的人可能以為 Tor 已經被攻破，也不知道沒有加密的連線連密碼都會被攔截。社群把八章全部從原報告 PDF 重新翻譯，網址不變。

<!-- more -->

InterSecLab 在 2025 年 9 月發表〈The Internet Coup〉，分析中國公司 Geedge Networks（積至公司）超過 10 萬份外洩文件，記錄防火長城（中國用來審查與監控網路的系統）的技術如何做成產品，賣給哈薩克、衣索比亞、巴基斯坦、緬甸等國的政府。社群在 2025 年 10 月釋出正體中文譯文，舊譯文另有不少「數據」、「運營」、「訪問」這類中國用語，句子多半照英文語序翻譯，讀起來不順。

## 補上與更正的內容

舊譯文的主要發現少了整節「對資料主權的重大影響」，第 7 章「對 Tor 的封鎖」一節少了最後一段。原報告在哈薩克、衣索比亞、巴基斯坦、緬甸四個國家的小節開頭各有一張時間軸圖，舊譯文一張也沒有譯出。新譯文補上了這些段落，也把四張時間軸圖中的事件譯成條列。

舊譯文的深度封包檢測（逐筆分析連線內容的技術）一節，把封鎖 VPN 與竄改網頁混成同一句，還漏掉了連線沒有加密時可以攔截的項目。附錄的公司回覆信也有譯錯的地方，例如 AppLogic Networks 就 Sandvine 回覆的那封信，原文是 Sandvine 的產品「過去或現在」都沒有解密使用者資料的能力，舊譯文寫成「也未曾或現能夠解密使用者資料」，可以讀成現在能夠解密。回覆信是各公司對外的正式說法，新譯文逐句對照原信重譯，不潤飾公司的用語。

原報告在推論處用了 appears、seems 這類推測語氣，舊譯文有幾處寫成肯定句。例如 Network Zodiac（Geedge 監控網路設備的系統）「似乎」以 Grafana 為範本，舊譯文寫成「顯然」。新譯文照原文的語氣翻譯。目前公開的原報告 PDF 裡，哪吒寫成「哪吃」，方濱興的英文名拼成 Fang Bixing，新譯文改用正確的寫法，並加上譯註說明。

## 讀過舊版的人可以回頭看的四個地方

### Geedge 對 WebTunnel 的封鎖研究

Tor 是隱藏使用者位置、讓網路業者無法得知你連去哪裡的匿名網路，WebTunnel 是 Tor 的一種連線方式，把 Tor 的流量偽裝成一般的 HTTPS 網頁連線。在資料外洩的時間點，Geedge 看來還沒有能有效封鎖 WebTunnel 的手段，不過 Mesalab（與 Geedge 關係密切的中國科學院實驗室）的學生已經在研究封鎖的方法。報告作者據此推論，Geedge 知道 WebTunnel 是有效的規避工具。舊譯文把這段寫成 Mesalab 學生的研究證明 WebTunnel 很有效，沒有提到他們在研究如何封鎖。

研究團隊在同一節的最後一段說明，他們先把發現告知 Tor Project 再對外公開，也沒有找到證據顯示 Geedge 發現或正在利用 Tor 軟體與設計上的未知漏洞。舊譯文漏了這一段。詳見第 7 章[對 Tor 的封鎖](../../reports/interseclab-network-coup/index_7.md#封鎖-Tor)。

### 沒有加密的連線

天狗安全閘道（TSG）是 Geedge 賣給各國政府的國家等級防火牆。原報告寫到，連線沒有加密（網址不是 https）時，TSG 能攔截密碼、電子郵件信箱、附件與信件內容。舊譯文漏了密碼與信件內容，附件也譯成只有中繼資料。瀏覽器網址列標示「不安全」的網站，不要在上面登入或輸入個人資料。也不要安裝來路不明的憑證，原報告寫到，使用者裝了自簽的根憑證，TSG 就能解密 HTTPS 連線。詳見第 5 章的[深度封包檢測](../../reports/interseclab-network-coup/index_5.md#深度封包檢測)。

### 各國資料的存取與分享

系統由 Geedge 在中國的員工遠端管理，Geedge 的員工似乎能存取各國網路使用者的資料。資料看來也分享給 Mesalab 的學生，用來研究如何阻擋規避審查的工具，保留多久則還不清楚。舊譯文的第 5 章有提到這件事，但主要發現漏了整節，只讀摘要與主要發現的人無從得知。詳見[主要發現](../../reports/interseclab-network-coup/index_2.md)。

### 公司回覆信

緬甸電信業者 ATOM（前身為 Telenor Myanmar）的母公司被問到，是否知道有人以 Geedge 產品替緬甸運輸與通訊部實施「大規模監控與審查」。舊譯文的提問漏了運輸與通訊部，無法得知監控是替誰做的。Sandvine 曾把審查設備賣給巴基斯坦，AppLogic Networks 就 Sandvine 的部分回覆。信裡寫的是 Sandvine「先前並不知道」Geedge Networks，舊譯文寫成「並不知情」，讀起來像到現在仍不知道。詳見第 8 章的[附錄](../../reports/interseclab-network-coup/index_8.md#附錄)。

## 舊連結與回報

章節的網址都沒有改，小標題改名之後，舊連結指向的段落仍然存在，書籤與其他文章裡的連結都能用。更動的摘要記在譯文首頁的[更新紀錄](../../reports/interseclab-network-coup/index.md#更新紀錄)。

讀到不通順或看起來不對的地方，可以用頁面右上方的編輯圖示直接到 GitHub 提交修正，或到譯文首頁列出的 Matrix 頻道一起討論。

## 相關閱讀

- [研究報告中譯](../../reports/index.md)：網路政變與 MADLink 兩份 InterSecLab 報告的中譯
- [Tor Browser 進階設定](../../tools/tor-browser-advanced.md)：無法連上 Tor 時如何設定橋接
- [VPN 的風險與選擇](../../tools/vpn-guide.md)：選擇 VPN 時要考慮的風險
- [Metadata 是什麼，為什麼重要](../../basics/metadata.md)：連線加密之後，仍會露出連到哪個網站
- [InterSecLab 網路政變報告的正體中文翻譯](https://anoni.net/updates/2025/10/report-the-internet-coup/){target="_blank"}：2025 年 10 月譯文上線時的公告
