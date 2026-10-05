---
title: 出國的門號與網路連線
description: 出國時用原門號漫遊、旅遊 eSIM 或當地 SIM 卡，各自由誰登記你的身分、流量從哪個國家出去、當地網路看得到什麼，以及依需求怎麼選。加上雙卡手機的兩個號碼、旅館 Wi-Fi 的暴露面，以及旅行路由器能擋掉與擋不掉的部分。
icon: material/sim-outline
---

# :material-sim-outline: 出國的門號與網路連線

出國前選門號，多數人比較的是價格與訊號。同一個選擇也決定了誰登記你的身分、你的網路流量從哪個國家出去，以及當地的網站過濾與紀錄留存管不管得到你。到了旅館與會場，Wi-Fi 又是另一層，你帶的每一台裝置都會在那個網路上留下名稱。

本頁從技術面整理這兩層，適用任何目的地。各地的 SIM 實名規定、審查現況與入境查機，整理在 [出差與研討會的數位準備](./asia-travel.md)，目的地的風險高低先看那一頁的對照表。

!!! tip "出發前先做這三件事"

    1. 依下方〈怎麼選〉決定這趟用哪一種門號
    2. 手機與筆電的裝置名稱改成不含本名，做法見〈裝置名稱〉
    3. 能換掉的兩步驟驗證，從簡訊換成驗證 App 或 passkey，做法見〈雙卡手機的兩個號碼〉

    到了當地之後，關掉 Wi-Fi 查一次自己的出口在哪個國家，做法見〈到了之後查一次出口〉。

## 先認識三個詞

- **出口**：你的網路流量最後從哪一家業者、哪個國家連上網際網路。網站看到的是出口那一端的 IP 位址，所以出口在哪裡，你在網站眼中就在哪裡，那個國家的網站過濾與紀錄規定也管得到這段流量
- **IMSI**：SIM 卡裡的一組識別碼，電信網路用它認出「這是哪一個門號的用戶」。它跟電話號碼是兩組不同的編號，但都指向同一個人
- **IMEI**：手機本身的硬體識別碼，每一支手機一組。換 SIM 卡不會換掉它

## 三種門號，流量各自怎麼走

### 原門號漫遊

數據漫遊的主要做法是「回母網路」（home-routed），你的流量經由業者之間的專屬網路繞回台灣的電信業者，再從台灣連上網際網路[^rfc7445]。出口在台灣，網站看到的你人在台灣，當地的網站過濾多半管不到，速度則會因為繞路而慢一些。台灣三家電信業者的官方說明沒有寫明漫遊上網的出口在哪裡，到了當地自己查一次最準。

出口在台灣，不代表當地看不到你。手機連的仍然是當地電信業者的基地台，當地業者知道你的 IMSI、IMEI，以及你在哪一座基地台附近[^3gpp-attach]。一般的電話與簡訊經過當地網路。行動通訊的國際標準要求當地業者具備監聽入境漫遊用戶的能力，被列為監聽對象的漫遊用戶進出當地網路時要能通知執法機關，也要能在不經母國業者協助的情況下提供位置[^3gpp-li]。實際會不會用、用在誰身上，依各國法律與程序而定。

Signal、LINE 這類 App 的通話與訊息走的是網路，內容有加密，當地網路看得到的是你在使用網路、用了多少流量，看不到內容。

### 旅遊 eSIM

旅遊 eSIM 多半也是漫遊，只是「母網路」換成了賣家合作的電信公司，那家公司可能在第三個國家，出口就在那裡。Holafly 的官方說明寫著，部分合作夥伴會從自有的基礎設施分配 IP 位址，跟你人在哪裡無關[^holafly]。

Northeastern University 的研究團隊在美國實測了一批旅遊 eSIM，發表在 2025 年的 USENIX Security[^esim-paper]。幾乎每一張的出口都不在使用者所在地，多數落在第三國。量測當時，總部在愛爾蘭的 Holafly 與中國移動旗下的 CMLink，出口都在中國移動國際（China Mobile International）的網路，路由經過香港。出口那一家業者負責把你的流量送上網際網路，你連到哪裡、何時連線都經過它。那是單一地點、單一時期的量測，業者的合作對象會換，結果不能直接套用到今天。

同一份研究也記錄了賣家拿得到什麼。多數賣你 eSIM 的網站或 App 是轉售商，向電信業者批發之後轉賣。研究團隊只用一個 email 與付款方式就成為轉售商，平台會提供每一張使用中 eSIM 的 IMSI 與門號，其中一個平台還提供裝置的大略位置，實測有時誤差在 800 公尺內。轉售商也能主動對使用者發送簡訊。

旅遊 eSIM 免去了當地實名，換來的是一條你看不清楚的路徑。可以做的有幾件：

- 購買前看賣家的說明頁有沒有寫合作業者或出口國家，沒寫的話，到了當地自己查一次出口
- 帳號用的 email 與付款方式，就是這張 eSIM 對到你本人的線索，介意的話用不跟主要身分綁在一起的 email
- 安裝用的 QR code 只從賣家官方取得。手機設定裡的行動服務或 SIM 卡清單，偶爾看一下有沒有自己沒裝過的 eSIM
- 很多 eSIM 只能安裝一次，刪除之後就無法重新安裝，行程結束之前不要刪

實名的要求也開始延伸到 eSIM，日本已修法把純數據 SIM 與 eSIM 納入身分確認，出發前查目的地的當下規定。

### 當地 SIM 卡

當地 SIM 卡的流量直接從當地業者出去，出口在當地。當地的網站過濾、紀錄留存與執法調取，跟當地居民一樣全部適用。辦卡多半要用護照實名登記，部分地方還要人臉，等於把護照與門號一起送進當地業者與政府的資料庫。

### 三種方式對照

| | 原門號漫遊 | 旅遊 eSIM | 當地 SIM 卡 |
|---|---|---|---|
| 誰登記你的身分 | 台灣的電信業者 | eSIM 賣家（email 與付款） | 當地業者，通常用護照 |
| 出口 | 通常是台灣 | 常常是第三國，賣家多半不說明 | 當地 |
| 當地的網站過濾 | 多半管不到 | 看出口在哪裡 | 全部適用 |
| 當地電信網路看得到 | IMSI、IMEI、位置、一般電話與簡訊 | 同左 | 同左，再加上全部的上網紀錄 |
| 經手的業者 | 台灣業者與當地業者 | 賣家、合作業者、當地業者，可能跨三個國家 | 當地業者 |
| 費用與方便 | 最貴，不必換卡，台灣號碼照常收簡訊 | 便宜，出發前在手機上安裝 | 便宜，有當地號碼，要到門市或櫃台辦 |

三種方式在當地電信網路那一列都一樣。只要手機連上當地的基地台，位置與 IMEI 就在當地業者手上，換哪一種門號都改變不了。想讓當地基地台完全看不到這支手機，只能開飛航模式，代價是收不到電話與簡訊。

## 怎麼選

依這趟最需要的東西來選：

- 一定要收台灣門號的簡訊驗證碼，例如銀行，或行程只有兩三天、不想多花心思：原門號漫遊
- 主要是上網，想控制費用：旅遊 eSIM。台灣門號要不要同時開著，見下一節
- 需要當地號碼叫車、訂餐廳、讓主辦單位聯絡：當地 SIM 卡，接受護照實名這個代價
- 目的地在 [出差與研討會的數位準備](./asia-travel.md) 對照表裡屬於高風險：先讀那一頁對應的分層準備，門號的選擇只是其中一項

常見的組合是旅遊 eSIM 上網，台灣門號開著收簡訊。好處是兩邊都顧到，代價是台灣門號也連在當地網路上，可能另外產生漫遊費用。

## 雙卡手機的兩個號碼

用旅遊 eSIM 上網時，台灣的門號如果還開著，兩個號碼都連在當地網路上，都收得到電話與簡訊[^apple-esim-travel]。關掉台灣的門號，就收不到寄到這個號碼的簡訊驗證碼。

出發前能換的先換。Google、Apple、社群帳號這類支援驗證 App 或 passkey 的服務，把兩步驟驗證從簡訊換掉，關掉台灣門號也不會被鎖在帳號外面。驗證 App 是在手機上每 30 秒產生一組數字的 App，passkey 是存在手機或密碼管理器裡的登入憑證，兩者都不需要收簡訊，差別見 [什麼是 passkey](../tools/what-is-passkey.md)，各帳號的檢查位置見 [手機隱私設定逐步指引](../tools/phone-privacy-settings.md#9-帳號的登入保護)。銀行這類只能收簡訊的服務換不掉，就讓台灣門號開著。

台灣門號要關掉時：

=== "iPhone"

    打開「設定」>「行動服務」，點台灣的號碼，關閉「開啟此號碼」。

    iMessage 與 FaceTime 走網路，台灣號碼關掉之後，仍然可以用台灣號碼的身分收發[^apple-esim-travel]。

=== "Android"

    打開「設定」>「網路和網際網路」，點台灣的號碼，關閉使用這張 SIM 卡的開關。

    其他品牌搜尋「SIM」。

=== "Samsung Galaxy"

    搜尋「SIM 卡管理員」，點台灣的號碼，把它關閉。

關掉的號碼不再連上當地網路，研究團隊在測試環境裡也觀察到，停用的 eSIM 會向網路登出[^esim-paper]。

## 到了之後查一次出口

先關掉 Wi-Fi，確認手機走的是行動網路，再用瀏覽器打開 [ipinfo.io](https://ipinfo.io/what-is-my-ip){target="_blank"} 或 [ifconfig.co](https://ifconfig.co/){target="_blank"}，看 IP 位址屬於哪個國家、哪一家業者。兩個網站用的地理資料庫不同，判斷的國家偶爾不一致，業者名稱比國家更能說明流量經過誰。

查到的結果怎麼看：

- 原門號漫遊查到台灣，符合預期
- 旅遊 eSIM 查到第三國，代表那個國家的業者經手你的流量。網頁與 App 的內容多半有加密，對方看得到的是你連到哪些網站與何時連線
- 不希望那一家業者看到這些時，開啟 VPN，出口就換成 VPN 業者，再查一次確認。怎麼挑 VPN 見 [VPN 的風險與選擇](../tools/vpn-guide.md)

連上旅館 Wi-Fi 之後也照同樣方式查一次。

## 裝置名稱

手機的名稱會顯示在藍牙、AirDrop 與個人熱點上，iPhone 的個人熱點名稱就是裝置名稱[^apple-hotspot]。電腦連上 Wi-Fi 時，Windows 會把電腦名稱交給網路[^ms-dhcp]，Mac 會用電腦名稱讓同一個網路上的其他裝置認出它[^mac-hostname]。Android 15 起，每個 Wi-Fi 網路有一個「傳送裝置名稱」的開關，原生 Android 的預設是開啟[^aosp-hostname]。

很多人的手機與電腦名稱就是自己的名字。Microsoft 的說明也寫到，裝置名稱透露使用者的資訊，可能構成安全風險[^ms-rename]。出發前全部改成不含本名的名稱：

- 手機：見 [手機隱私設定逐步指引](../tools/phone-privacy-settings.md#2-裝置名稱)，同一步也會關掉 Android 的「傳送裝置名稱」
- Windows：打開「設定」>「系統」>「關於」，選「重新命名此電腦」，改完重新啟動[^ms-rename]
- Mac：選擇「蘋果」選單 >「系統設定」>「一般」>「關於」，修改電腦的名稱[^mac-hostname]

## 旅館與會場的 Wi-Fi

旅館的 Wi-Fi 可以用，留意下面幾件事就好。

多數網站與 App 的連線已經加密，美國聯邦貿易委員會（FTC）因此認為使用公共 Wi-Fi 通常是安全的，主要的風險在假冒的網站[^ftc-wifi]。加密保護的是內容，旅館網路仍然看得到你連到哪些網站、何時連線。

同一個旅館網路上還有其他房客的裝置。有些網路會阻擋同網路的裝置互相連線，這叫「用戶隔離」，但 2026 年的一份研究測試了多款路由器與網路，每一個都至少有一種方法可以繞過[^airsnitch]。所以電腦上的檔案分享功能（Windows 的「網路探索」與檔案共用、Mac 的「檔案共享」）出門前關掉，同網路的人才讀不到你分享出來的資料夾[^cisa-wireless]。

FBI 對旅館 Wi-Fi 的提醒[^fbi-hotel]還有兩件事：

- 跟櫃台確認旅館官方的網路名稱。有人會架一個名稱相近的假 Wi-Fi，連上去之後流量都經過對方
- 不用的時候關閉藍牙，以及手機與電腦的「可被附近裝置發現」

用房號與姓名登入的認證頁面，會把你這台裝置跟住房資料連在一起。裝置連 Wi-Fi 時用的是網卡的硬體位址（MAC 位址），手機預設會對每個網路換一組隨機的位址，所以認證頁記到的是這組隨機位址加上你的房號。

## 旅行路由器

旅行路由器是一台手掌大小的無線路由器。它連上旅館的 Wi-Fi，再發出一個你自己的 Wi-Fi，手機、筆電、平板改連這個自己的 Wi-Fi。

### 什麼情況值得帶

在旅館房間或固定的會場待得久、一次帶兩三台裝置用 Wi-Fi 的人最用得上。行程大多在外面走動、主要靠手機行動網路的人，路由器幫得上的地方不多，做好手機設定比較實際。

### 能擋掉的部分

- 旅館網路只看到路由器一台裝置，你的手機、筆電各自的名稱與位址留在路由器後面。以常見的 GL.iNet 機種為例，預設模式會替你的裝置隔出一個獨立的小網路，擋在旅館網路與你的裝置之間[^glinet-repeater]
- 同一個旅館網路上的其他房客，連不到路由器後面的裝置
- 認證頁面只需要登入一次，不會每一台裝置各留一筆紀錄
- 在路由器上設定 VPN，後面的裝置全部經過 VPN，包括電子書閱讀器這類不能自己裝 VPN 的裝置

以下用 GL.iNet 的官方文件當例子，因為它的旅館使用情境寫得最完整，不代表推薦這個品牌，其他品牌多半有對應的功能。

### 出發前要設定好的部分

- 更新路由器的系統軟體（韌體），改掉預設的 Wi-Fi 名稱與密碼。預設的 Wi-Fi 名稱多半帶著品牌與型號，印在機身底部的標籤上[^glinet-setup]
- 設定一組夠長的管理密碼，那是進入路由器設定頁的密碼
- 設定 VPN。路由器上用的是 WireGuard 或 OpenVPN 這兩種 VPN 協定，多數 VPN 業者的網站可以下載對應的設定檔，上傳到路由器即可。VPN 帳號要另外向 VPN 業者申請
- 開啟 kill switch，意思是 VPN 斷線時，路由器擋下所有連線，不讓裝置改走旅館網路直接連出去。GL.iNet 4.8 版之後的韌體，VPN 啟用時預設會開啟[^glinet-killswitch]。出發前在家把 VPN 連線關掉試一次，裝置應該全部連不上網路

有些旅館只允許每個房間連兩台裝置，用的是 MAC 位址來數。路由器可以複製手機的 MAC 位址，讓旅館以為連上的是那支手機，就不會被擋[^glinet-portal]。

### 認證頁面的處理

旅館的認證頁面要在一般的網頁連線下才能顯示，VPN 開著時常常打不開。GL.iNet 的做法是暫時切到公共熱點登入模式，官方文件寫明這段時間你的網路活動可能被旅館或商場看到[^glinet-portal]。所以順序是：

1. 用手機連上路由器，打開瀏覽器，跳出旅館的認證頁面就登入
2. 登入完成後，立刻在路由器的設定頁開回 VPN
3. 照〈到了之後查一次出口〉查一次，確認出口是 VPN 業者

### 擋不掉的部分

- 手機的行動網路。手機只要開著行動網路，就照樣連在當地的基地台上，位置與 IMEI 都在當地業者手上
- 手機在 Wi-Fi 訊號差時自動改用行動數據。在房間裡想確保上網只走路由器，關掉行動數據就好。想連當地基地台都不連，開飛航模式之後再把 Wi-Fi 打開，代價是收不到電話與簡訊
- 藍牙。路由器只處理 Wi-Fi，藍牙裝置名稱仍然會被附近的人看到
- VPN 業者。流量經過 VPN 之後，看得到連線紀錄的從旅館換成 VPN 業者
- 過境檢查。預先設好 VPN 的路由器在檢查時一看就知道是連線工具。入境查機風險高的地方，見 [出差與研討會的數位準備](./asia-travel.md) 對照表的入境裝置檢查一欄

路由器整天放在房間裡沒人看管，理論上有被人改裝的可能。一般出差的機率很低，前往高風險地方時，出門帶著走。

## 出發前的檢查

- 依〈怎麼選〉決定這趟用哪一種門號，旅遊 eSIM 先看賣家有沒有說明合作業者
- 能換的兩步驟驗證從簡訊換成驗證 App 或 passkey
- 手機與電腦的裝置名稱改成不含本名，電腦的檔案分享關掉
- 帶旅行路由器的話，更新韌體、改掉預設名稱與密碼、設好 VPN 與 kill switch，在家實測一次
- 到了之後，行動網路、旅館 Wi-Fi、VPN 各查一次出口

## 相關閱讀

- [出差與研討會的數位準備](./asia-travel.md)：十四地的審查、VPN 與 Tor 可達性、SIM 實名與入境查機，以及乾淨機的取捨
- [出國前數位安全：用 AI 自助產生目的地概況](./travel-ai-briefing.md)：任何目的地都適用的行前概況產生方式
- [手機隱私設定逐步指引](../tools/phone-privacy-settings.md)：出發前先把手機的基本設定做完
- [VPN 的風險與選擇](../tools/vpn-guide.md)：在旅館與路由器上用 VPN 之前，先挑一家值得信任的業者
- [Metadata 是什麼，為什麼重要](../basics/metadata.md)：內容加密之後，電信網路仍然看得到的那一層

[^rfc7445]: [RFC 7445: Analysis of Failure Cases in IPv6 Roaming Scenarios](https://www.rfc-editor.org/rfc/rfc7445.html){target="_blank"} - IETF（2015）。第 2.1.1 節說明回母網路模式下，裝置的 IP 由母網路分配，流量全部繞回母網路，是國際數據漫遊的主要模式。
[^3gpp-attach]: [3GPP TS 23.401](https://www.3gpp.org/ftp/Specs/archive/23_series/23.401/){target="_blank"} - 3GPP。第 5.3.2.1 節，手機註冊網路時由網路端取得設備識別碼。
[^3gpp-li]: [3GPP TS 33.126](https://www.3gpp.org/ftp/Specs/archive/33_series/33.126/){target="_blank"} - 3GPP。第 6.3 節的 R6.3-110、R6.3-130、R6.3-330，分別是當地業者監聽入境漫遊用戶、監聽對象進出網路時通知執法機關、依令狀自行提供位置的能力要求。
[^holafly]: [流量路由機制：我們如何保障您海外行動數據的安全](https://esim.holafly.com/zh/faq/about-esims/traffic-routing/){target="_blank"} - Holafly。
[^esim-paper]: Motallebighomi、Veara、Bitsikas、Ranganathan，[eSIMplicity or eSIMplification? Privacy and Security Risks in the eSIM Ecosystem](https://www.usenix.org/conference/usenixsecurity25/presentation/motallebighomi){target="_blank"} - USENIX Security 2025。量測在美國單一地點進行四個月，出口 IP 的歸屬見論文的 Table 1。原文的位置誤差寫作 0.5 英里。
[^apple-esim-travel]: [出國時在 iPhone 上使用 eSIM](https://support.apple.com/zh-tw/118227){target="_blank"} - Apple 支援。
[^apple-hotspot]: [從 iPhone 分享你的網際網路連線](https://support.apple.com/zh-tw/guide/iphone/iph45447ca6/ios){target="_blank"} - iPhone 使用手冊。
[^aosp-hostname]: [WifiConfiguration.java](https://android.googlesource.com/platform/packages/modules/Wifi/+/refs/heads/main/framework/java/android/net/wifi/WifiConfiguration.java){target="_blank"} - Android 開放原始碼專案，`mIsSendDhcpHostnameEnabled` 的預設值為 `true`。手機廠商可以改變預設，GrapheneOS 在 [2024 年 10 月的版本](https://grapheneos.org/releases){target="_blank"} 把它改成預設關閉。
[^ms-dhcp]: [MS-DHCPE Appendix A](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-dhcpe/73d899d4-6978-4328-a151-5d20f3ef8271){target="_blank"} - Microsoft。DHCP 用戶端在要求 IP 位址時送出主機名稱。
[^ms-rename]: [重新命名你的 Windows 裝置](https://support.microsoft.com/zh-tw/help/4558981){target="_blank"} - Microsoft 支援。
[^mac-hostname]: [在 Mac 上更改電腦的名稱或本機主機名稱](https://support.apple.com/zh-tw/guide/mac-help/mchlp2322/mac){target="_blank"} - Mac 使用手冊。
[^ftc-wifi]: [Are Public Wi-Fi Networks Safe? What You Need To Know](https://consumer.ftc.gov/articles/are-public-wi-fi-networks-safe-what-you-need-know){target="_blank"} - FTC。
[^airsnitch]: [AirSnitch: Demystifying and Breaking Client Isolation in Wi-Fi Networks](https://ndss-symposium.org/ndss-paper/airsnitch-demystifying-and-breaking-client-isolation-in-wi-fi-networks/){target="_blank"} - NDSS 2026。
[^cisa-wireless]: [Using Wireless Technology Securely](https://www.cisa.gov/sites/default/files/publications/Wireless-Security.pdf){target="_blank"} - CISA。
[^fbi-hotel]: [A COVID 19-Driven Increase in Telework from Hotels Could Pose a Cyber Security Risk for Guests](https://www.ic3.gov/PSA/2020/PSA201006){target="_blank"} - FBI IC3（2020）。
[^glinet-repeater]: [Repeater](https://docs.gl-inet.com/router/en/4/interface_guide/internet_repeater/){target="_blank"} - GL.iNet 文件。
[^glinet-setup]: [First time setup](https://docs.gl-inet.com/router/en/4/faq/first_time_setup/){target="_blank"} - GL.iNet 文件。
[^glinet-killswitch]: [VPN Kill Switch](https://docs.gl-inet.com/router/en/4/faq/block_non_vpn_traffic/){target="_blank"} - GL.iNet 文件。
[^glinet-portal]: [Connect to public hotspot with Captive Portal](https://docs.gl-inet.com/router/en/4/faq/connect_to_a_hotspot_with_captive_portal/){target="_blank"} - GL.iNet 文件。
