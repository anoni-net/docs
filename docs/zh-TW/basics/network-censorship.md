---
title: 網路封鎖的手法與繞過方式
description: 連不上某個網站時，可能是網站故障，也可能是網路的某一段在擋。本頁說明封鎖發生在哪裡、DNS、IP、網域名稱與協定封鎖各自的運作方式，如何用 OONI Probe 確認，以及加密 DNS、VPN、Tor 與通訊軟體的 Proxy 各自擋得住哪一種封鎖、會留下什麼痕跡。
icon: material/wall-fire
---

# :material-wall-fire: 網路封鎖的手法與繞過方式

政府、電信業者、學校與公司都可能在網路上擋掉特定的網站或服務。封鎖之前需先看得到流量，所以封鎖與監控用的是同一套能力，能減少網路管理者看到的內容的工具，同時也讓選擇性封鎖更難執行[^ssd-cens]。多數情況下都有辦法繞過封鎖取得資訊，但繞過的方法各自有代價：有些只解決一種封鎖，有些會讓網路管理者知道你在使用繞過工具，在部分國家，使用本身就有法律風險[^ssd-cens]。

本頁依 EFF Surveillance Self-Defense 的〈How to: Understand and Circumvent Network Censorship〉改寫，補上台灣的封鎖制度與中國大陸的法規（出處見[本頁的來源與核對](#本頁的來源與核對)）。網路自由為什麼重要見 [網路自由為什麼重要](./internet-freedom.md)，整個網路被切斷時的準備見 [網路中斷時的準備與應對](../scenarios/shutdown.md)。

!!! tip "時間有限的話，先看這幾點"

    - 先確認是被封鎖、還是網站本身故障，OONI Probe 可以測，但在部分國家執行測試本身有風險
    - 只被 DNS 擋的話，改用加密 DNS 通常就能連上
    - VPN 與 Tor 擋得住更多種封鎖，但網路管理者通常看得出你在使用它們
    - 在中國大陸，條文禁止個人自行使用其他通道連上國際網路，有個人被罰款的案例，出發或使用前先評估

## 封鎖發生在哪裡

從你的裝置到網站之間，有三個地方可以擋[^ssd-cens]：

- **你的裝置上**：學校或公司發的電腦與手機，管理者可以安裝軟體限制能連的網站與能用的通訊方式。間諜軟體的運作方式跟這類管理軟體相近，見 [惡意軟體的防範與處理](../tools/malware.md)
- **區域網路**：學校、公司、咖啡店的 Wi-Fi，管理者可以過濾或記錄你連到哪裡、搜尋了哪些關鍵字
- **網路服務業者（ISP）**：許多國家的政府要求業者過濾，業者也可能把過濾當成服務賣給家庭與公司

台灣也有業者層級的封鎖，對象是詐騙網站與經法院扣押的盜版網站。依《詐欺犯罪危害防制條例》第 42 條，主管機關可以命令網路業者對涉詐網站「停止解析」或「限制接取」[^xhs]。數位發展部的參考程序由 TWNIC 協調各家業者以 DNS RPZ（讓業者的 DNS 伺服器對清單上的網域不回應）執行，觸發條件限定法院裁定或合法的行政命令，程序文件也記載了誤擋 Instagram、wordpress.com 這類案例[^moda-rpz]。2025 年 12 月，刑事警察局依同一條對小紅書實施停止解析與限制接取[^xhs]。

## 封鎖的手法

### DNS 封鎖

連上網站前，裝置要先問 DNS 伺服器「這個網域的 IP 位址是什麼」。預設的 DNS 伺服器多半屬於你的 ISP，它可以對被封鎖的網域回傳錯誤的位址，或者不回應。改用其他 DNS 伺服器時，如果查詢沒有加密，ISP 仍然可以攔下或改寫答案[^ssd-cens]。

### IP 封鎖

業者或網路管理者維護一份 IP 位址清單，丟掉往返這些位址的流量。許多網站共用同一個 IP，許多使用者也共用同一個對外 IP，所以 IP 封鎖常常擋到不相干的網站[^ssd-cens]。台灣的參考程序因為這個原因，目前較少採用 IP 封鎖[^moda-rpz]。

### 依網域名稱過濾 HTTPS 連線

HTTPS 加密了網址的路徑與網頁內容，網域名稱在連線開始時仍以明文送出，這個欄位叫 SNI（Server Name Indication，告訴伺服器你要連哪個網站）。網路管理者看得到你連的是 `eff.org`，看不到你讀的是哪一頁，可以依網域名稱擋掉整個網站[^ssd-cens]。

新的 ECH（Encrypted Client Hello）把網域名稱也加密起來。Chrome 117 起、Firefox 119 起預設啟用，Cloudflare 的免費方案網站預設支援[^chrome-ech][^cf-ech]。ECH 要搭配加密 DNS 才完整，中國與伊朗的做法是封鎖加密 DNS，間接讓 ECH 無法使用[^foci-ech]。2020 年 7 月中國的防火長城就曾直接丟棄帶有 ECH 前身（ESNI）的連線[^gfw-esni]。

### 關鍵字過濾

業者讀取沒有加密的流量內容，網頁出現特定字詞就擋下。網站普遍改用 HTTPS 之後，這種做法變少了[^ssd-cens]。要注意的例外是學校與公司管理的裝置，管理者可以在裝置上安裝自己的根憑證（CA certificate），之後就能解開裝置上的 HTTPS 流量逐一檢查[^ssd-cens]。

### 協定與連接埠封鎖

防火牆可以從流量的協定特徵與連接埠辨識出 VoIP、P2P 檔案分享或 VPN 這類技術，整類擋掉[^ssd-cens]。深度封包檢測（DPI，逐筆分析連線特徵、判斷要不要放行的技術）讓這類辨識更準，所以強審查地區要用把流量偽裝成一般 HTTPS 的混淆方案（見 [VPN 的風險與選擇](../tools/vpn-guide.md)）。

### 斷網與限速

最極端的做法是拔掉實體的網路設備、切斷基地台，或擋掉全部的國外 IP、只留國內連線。另一種是限速，選擇性地讓某些服務慢到不能用，比直接封鎖難察覺，使用者常以為是自己的網路或對方的服務有問題[^ssd-cens]。斷網的分級與準備見 [網路中斷時的準備與應對](../scenarios/shutdown.md)。

## 確認是否被封鎖

[OONI Probe](../tools/what-is-ooni.md) 可以幫你判斷遇到的是哪一種封鎖[^ssd-cens]。它的網站連線測試（Web Connectivity）從你的網路與 OONI 的對照伺服器各做一次 DNS 查詢、TCP 連線與 HTTP 請求，比對兩邊的結果，判斷是 DNS、TCP/IP 還是 HTTP 層的封鎖[^ooni-wc]。

單次的「異常」不等於封鎖，網路不穩、網站故障、網站依國家提供不同內容都會造成異常。比較可靠的判斷方式是看 [OONI Explorer](https://explorer.ooni.org/){target="_blank"} 上同一個網站的長期結果，並依網路業者（ASN，自治系統編號）分開看，同一家業者反覆出現相同的錯誤，才是比較強的封鎖訊號[^ooni-interp]。

執行 OONI Probe 之前先了解 OONI 自己寫的風險[^ooni-risks]：

- 監控你網路的人看得出你在執行 OONI Probe，被測試的網站也會看到你的 IP
- 在部分國家，任何主動的網路量測都可能違法，可能面臨民事、刑事或法律以外的懲罰。測試清單裡也可能有在當地瀏覽就違法的網站
- 測試結果預設公開，包含大略位置與網路業者，可以在 App 的設定裡關閉公開
- OONI 建議在高風險的地方先諮詢律師

## 繞過的方法

越少讓網路看到你連去哪裡，選擇性封鎖就越難執行。下面四種方法由輕到重排列，適用的封鎖手法不同[^ssd-cens]。

### 加密 DNS

只被 DNS 擋的時候，改用加密 DNS（DoH、DoT）就能繞過，網路上的人也看不到你查詢了哪些網域[^ssd-cens]。一份 2022 年的研究估計，加密網域名稱可以解開中國約 55%、其他依賴 DNS 過濾的國家約 95% 被封鎖的網域[^pam]。

加密 DNS 解決不了依網域名稱過濾的 HTTPS 連線與 IP 封鎖。常見的加密 DNS 服務（例如 `1.1.1.1`、`8.8.8.8`）本身也可能被封鎖，伊朗在 2022 年封鎖過已知的加密 DNS 服務，中國、俄羅斯與沙烏地阿拉伯也有封鎖加密 DNS 的紀錄[^ssd-cens][^pam]。換了 DNS 服務，原本 ISP 看得到的查詢紀錄就換成新的服務看得到，選擇方式與設定步驟見 [加密 DNS 怎麼選、怎麼確認真的生效](../tools/encrypted-dns.md)。

### VPN

VPN 把你所有的流量加密，送到另一個國家的伺服器再連出去，擋得住當地的 IP 封鎖與多數依網域名稱的過濾。網路管理者看不到內容，但通常看得出你在用 VPN，強審查地區會封鎖 VPN 的協定，標準的 WireGuard、OpenVPN 可能完全連不上[^ssd-cens]。

VPN 業者看得到你連去哪裡，可能留存紀錄，政府取得業者紀錄或監聽 VPN 連線的風險，對部分使用者來說大於翻牆帶來的好處[^ssd-cens]。如何挑選見 [VPN 的風險與選擇](../tools/vpn-guide.md)。

### Tor Browser 與橋接

遇到協定封鎖、IP 封鎖、DNS 封鎖，或者 VPN 無法使用時，可以改用 Tor Browser。流量經過世界各地不同人經營的三個中繼節點，你的 ISP 看不出你連到哪個網站，網站也看不出你從哪裡來[^ssd-cens]。

Tor 本身也會被封鎖，網路管理者也看得出你在使用 Tor[^ssd-cens]。被擋的時候用橋接（bridge）：Tor Browser 的「連線協助」會依你的所在地自動挑選橋接，也可以手動選擇 obfs4（讓流量看起來像隨機資料）、Snowflake（看起來像視訊通話）、WebTunnel（看起來像一般的 HTTPS 網站）或 meek（看起來像連到雲端服務）[^tor-pt]。Tor Project 對中國的建議依序是 WebTunnel、Snowflake、meek，WebTunnel 不在內建選單裡，要另外索取[^tor-cn]。Tor 的基本用法見 [什麼是 Tor](../tools/what-is-tor.md)。

Tor Browser 一定要從官方網站或官方管道下載。官網被封鎖時，可以從 Telegram 的 `@gettor_bot` 或寄信到 `gettor@torproject.org` 取得[^tor-cn]。

### 通訊軟體的 Proxy

Signal 或 WhatsApp 被封鎖時，可以透過 Proxy 連線。訊息仍然是端對端加密，Proxy 的經營者讀不到內容，但看得到你的 IP[^ssd-cens]。Signal 的 Proxy 外觀就像一般的加密網頁流量，要在手機上設定，電腦版目前不支援。公開張貼的 Proxy 位址比較容易被封鎖，私下分享比較能持久[^signal-proxy]。設定與自架方式見 [Signal Proxy](../tools/signal-proxy.md)。

## 使用繞過工具本身的風險

管理網路的人可能注意到你在使用某種繞過工具，進而對你或其他人採取行動[^ssd-cens]。工具名稱有「匿名」字樣，不代表它會隱藏你的身分，判斷前先想清楚自己要防誰（見 [威脅模型如何建立](./threat-model.md)）[^ssd-cens]。

各地的法律風險差很多。台灣使用 VPN 與 Tor 完全合法。在中國大陸，《计算机信息网络国际联网管理暂行规定》第 6 條規定任何單位和個人不得自行建立或使用其他通道連上國際網路，第 14 條的罰則是警告，可併處人民幣 15,000 元以下罰款，並沒收違法所得[^cn-reg]。公開的處罰案例不多，但個人被罰的案例確實存在。2018 年廣東韶關有人因使用翻牆軟體被罰 1,000 元[^sixthtone]。2023 年河北承德一名替國外公司工作的程式設計師被罰 200 元，另被沒收三年多來約 105 萬元的收入[^cdt]。

出入境時的手機檢查、各國 VPN 與 Tor 的可用性，見 [出差與研討會的數位準備（東亞與東南亞）](../scenarios/asia-travel.md)。

## 本頁的來源與核對

本頁依 EFF [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"} 的〈[How to: Understand and Circumvent Network Censorship](https://ssd.eff.org/module/understanding-and-circumventing-network-censorship){target="_blank"}〉改寫，該篇審閱日 2024-02-01，以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hant){target="_blank"} 授權。

跟原文不同的地方：加上台灣的詐騙網站封鎖制度、中國大陸的法規與罰款案例、OONI 對結果判讀與執行風險的說明、ECH 的現況、Tor Project 目前的橋接建議與 Signal Proxy 的細節，這幾項依各自註腳的來源。原文逐一說明瀏覽器與作業系統設定加密 DNS 的步驟，本頁改連到文件站的加密 DNS 頁。與原文不同之處由匿名網路社群 anoni.net 負責，不代表 EFF 的立場。

2026 年 11 月核對。

## 相關閱讀

- [什麼是 OONI](../tools/what-is-ooni.md)：網路審查的公開觀測資料從哪裡來
- [VPN 的風險與選擇](../tools/vpn-guide.md)：挑選標準、混淆與各地區的可用性
- [什麼是 Tor](../tools/what-is-tor.md)：Tor Browser 的基本用法與注意事項
- [在中國大陸的公開平台傳播資訊](../scenarios/mainland-speech.md)：實名環境下的風險與取捨

[^ssd-cens]: [How to: Understand and Circumvent Network Censorship](https://ssd.eff.org/module/understanding-and-circumventing-network-censorship){target="_blank"} - EFF Surveillance Self-Defense，審閱日 2024-02-01。
[^moda-rpz]: [運用 DNS RPZ 自律機制停止解析違法網站處理參考程序](https://www-api.moda.gov.tw/File/Get/moda/zh-tw/Qv1tZuiNEVfsLIl){target="_blank"} - 數位發展部，2025-01。
[^xhs]: [小紅書遭依法中止連線 刑事局說明啟動處置原因](https://udn.com/news/story/124671/9185901){target="_blank"} - 聯合新聞網，2025-12-06。
[^chrome-ech]: [Encrypted Client Hello (ECH)](https://chromestatus.com/feature/6196703843581952){target="_blank"} - Chrome Platform Status。Firefox 見 [Firefox 119 release notes](https://www.mozilla.org/en-US/firefox/119.0/releasenotes/){target="_blank"}。
[^cf-ech]: [Encrypted Client Hello](https://developers.cloudflare.com/ssl/edge-certificates/ech/){target="_blank"} - Cloudflare Docs。
[^foci-ech]: [Encrypted Client Hello (ECH) in Censorship Circumvention](https://petsymposium.org/foci/2025/foci-2025-0016.php){target="_blank"} - Niere et al., FOCI 2025。
[^gfw-esni]: [Exposing and Circumventing China's Censorship of ESNI](https://gfw.report/blog/gfw_esni_blocking/en/){target="_blank"} - GFW Report、iYouPort 與 Geneva 團隊，2020-08。
[^ooni-wc]: [Web Connectivity](https://ooni.org/nettest/web-connectivity/){target="_blank"} - OONI。
[^ooni-interp]: [Interpreting OONI data](https://ooni.org/support/interpreting-ooni-data/){target="_blank"} - OONI。
[^ooni-risks]: [Risks: Things you should know before running OONI Probe](https://ooni.org/about/risks/){target="_blank"} - OONI。
[^pam]: [Measuring the Accessibility of Domain Name Encryption and Its Impact on Internet Filtering](https://arxiv.org/abs/2202.00663){target="_blank"} - Hoang, Polychronakis, Gill, PAM 2022。
[^tor-pt]: [Unblocking Tor](https://support.torproject.org/tor-browser/circumvention/unblocking-tor/){target="_blank"} - Tor Project Support。
[^tor-cn]: [Connecting to Tor from censored regions](https://support.torproject.org/tor-browser/circumvention/connecting-from-censored-regions/){target="_blank"} - Tor Project Support。
[^signal-proxy]: [Proxy Support](https://support.signal.org/hc/en-us/articles/360056052052-Proxy-Support){target="_blank"} - Signal Support。
[^cn-reg]: [中华人民共和国计算机信息网络国际联网管理暂行规定](https://www.cac.gov.cn/1996-02/02/c_126468621.htm){target="_blank"} - 國家互聯網信息辦公室。2024 年修訂只刪除第 6 條第 1 款的「邮电部」，第 6 條第 2 款與第 14 條未變動。
[^sixthtone]: [Guangdong Man Fined $150 for Using a VPN](https://www.sixthtone.com/news/1003431){target="_blank"} - Sixth Tone，2019-01。
[^cdt]: [Chengde Seizes Three Years of "Illegal Income" From Programmer Who Used VPN for Overseas Work](https://chinadigitaltimes.net/2023/09/chengde-seizes-three-years-of-illegal-income-from-programmer-who-used-vpn-for-overseas-work/){target="_blank"} - China Digital Times，2023-09。
