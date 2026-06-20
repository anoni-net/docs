---
title: GrapheneOS：高度隱私的行動作業系統
description: GrapheneOS 把 Android 大幅安全強化並去 Google 化，是目前 hardening 最徹底的行動作業系統。當 Google 收緊 AOSP、app 廠商用 attestation 鎖定非官方系統，它替正體中文使用者保留一台自己能掌握的手機。
icon: material/cellphone-lock
---

# :material-cellphone-lock: GrapheneOS：高度隱私的行動作業系統

手機是我們身上最貼身的一台裝置，隨身攜帶、長時間連網，裡面有定位、通訊錄、訊息、相簿、健康紀錄。原廠 Android 預設綁一個 Google 帳號，在背景持續回傳遙測資料（裝置狀態與使用情形），多數應用程式又各自蒐集可識別你的資訊。想重新掌握這台手機，自行決定它連接哪些服務、向外送出哪些資料，[GrapheneOS](https://grapheneos.org/){target="_blank"} 是目前社群最常推薦的選擇。

GrapheneOS 是一套以 AOSP（Android Open Source Project，Android 的開源核心）為基底、把安全防護大幅強化並移除 Google 綁定的行動作業系統，由非營利的 GrapheneOS Foundation 維護、開源開發。它縮小一台 Android 手機的攻擊面、補強容易外洩資料的環節，同時把是否使用 Google 服務、以及使用方式的選擇權交還給你。它的重點是安全與隱私，不在於讓桌面更好看。

!!! tip "30 秒結論"

    - **它是什麼**：把 Android 安全強化、移除 Google 綁定的手機作業系統，非營利、開源。
    - **它保護**：縮小手機被入侵的攻擊面、把 Google 服務關進沙箱、給你逐 app 的網路與感測器開關。
    - **它不保護**：GrapheneOS 不是匿名工具，無法阻擋電信商的基地台定位，要匿名仍要搭配 [Tor](./what-is-tor.md)。
    - **硬體**：目前幾乎只跑在 Google Pixel，因為只有它同時提供可重新鎖回的 bootloader、安全晶片與長期更新。

    展開細節見下方各節。

## 它保護什麼：核心設計

GrapheneOS 的功能可以分成三組：縮減攻擊面、減少對 Google 的依賴、納入實體與脅迫風險。以下描述以官方 [Features](https://grapheneos.org/features){target="_blank"} 頁為準。

### 縮減攻擊面

- **hardened_malloc**：GrapheneOS 自製的記憶體分配器，針對最常見的一類漏洞（記憶體破壞）做防禦，從底層降低被攻破的機會。
- **MTE（Memory Tagging Extension，記憶體標記）**：ARM 的硬體功能，能在程式誤用記憶體時當場攔截，把可能的入侵擋在造成傷害之前。需要 Pixel 8 系列之後的 ARMv9 晶片才支援。在支援的機型上，系統層預設啟用。含原生程式碼（native code）的第三方 app 則預設不開，使用者可自行到 Settings 開啟。
- **Vanadium 瀏覽器**：強化版的 Chromium，預設關閉 JavaScript JIT（一種把網頁程式即時編譯加速的機制，也是常見的攻擊入口），可逐站打開。少數互動密集的網頁速度會略慢，可針對該網站單獨開啟。
- **verified boot 與重鎖 bootloader**：安裝完成後，GrapheneOS 會引導你把 bootloader 重新鎖回並關掉 OEM 解鎖，完整啟用 verified boot（開機時逐層驗證系統沒被竄改）。
- **Auditor app**：用手機的安全晶片，對韌體與系統的真偽和完整性做硬體層級的驗證，確認沒被動過手腳。

### 減少對 Google 的依賴

- **預設完全不含 Google 服務**：開機就是一套不向 Google 報到的系統（俗稱 degoogled）。
- **sandboxed Google Play**：需要用到 Google app 時，GrapheneOS 把整套 Google Play 服務（Google Play 服務、Play 商店、服務框架）當成一般、無特權的應用程式，關進標準的應用程式沙箱執行。官方說明 Google Play 在 GrapheneOS 上「完全無法取得任何特殊存取或權限」。
- **逐 app 的 Network 權限**：可以對單一 app 整個斷網。關閉後系統對它回報「網路不通」，連間接的網路存取也一併阻擋。
- **逐 app 的 Sensors 權限**：關閉後，該 app 無法存取加速度計、陀螺儀、指南針、氣壓計、溫度計這些 Android 原本沒有獨立權限控管的感測器。
- **Storage Scopes 與 Contact Scopes**：不必把整個儲存空間或整本通訊錄交給一個 app，可以只授權它看你指定的檔案或聯絡人。Contact Scopes 預設讓 app 讀到的通訊錄是空的。

### 納入實體與脅迫風險

- **duress PIN/password（脅迫密碼）**：選擇性功能，預設不啟用，不設定就不會誤觸。啟用後你會多一組密碼，在任何要求解鎖的畫面輸入它，會不可逆地抹除整台裝置（連已安裝的 eSIM 一起），用在被迫交出手機的情境。
- **auto-reboot（自動重開機）**：預設 18 小時沒有解鎖就自動重開機，回到開機後尚未首次解鎖的加密狀態（BFU，Before First Unlock）。資料在這個狀態下更難被鑑識工具取出。時間可在 10 分鐘到 72 小時之間調整或關閉。
- **USB-C 控制**：預設「鎖定時只充電、不傳資料」，縮小用 USB 連接埠攻擊的縫隙。

## 它不解決什麼：與匿名的界線

隱私與匿名的界線對 anoni.net 的讀者特別重要。GrapheneOS 把重點放在 privacy（隱私）與 security（安全），它讓別人更難入侵你的手機、更難從你的 app 蒐集資料，但它不宣稱讓你匿名。

只要連上電信商的行動網路，你就必然要向電信商表明身分，GrapheneOS 無法改變這一點，唯一能避免基地台層級定位的方式是開飛航模式。要在網路層匿名（不洩漏真實 IP、不被綁定瀏覽身分），仍要靠 [Tor](./what-is-tor.md)。GrapheneOS 官方也把內建的 DNS-over-TLS 明講成「不是 Tor 或 VPN 的替代品」。

操作前先讀 [匿名與隱私的差別](../basics/anonymity-vs-privacy.md)，確認你要的是哪一種保護，再用 [威脅模型如何建立](../basics/threat-model.md) 釐清自己在抗誰。桌面端的整機隔離方案見 [Tails、Whonix、Qubes 的差別](./tails-vs-whonix-vs-qubes.md)，行動端的 OS 強化跟桌面端的匿名作業系統處理的是不同層次的問題，依威脅模型搭配使用。

## 為什麼幾乎只支援 Pixel

GrapheneOS 對硬體的要求很嚴格，列在官方 [FAQ](https://grapheneos.org/faq){target="_blank"}：bootloader 要能解鎖、刷完客製系統後還能重新鎖回（重鎖才能完整啟用 verified boot）、要有安全晶片提供的 StrongBox keystore 與硬體金鑰驗證、韌體與作業系統都要 A/B 雙槽更新加上防回滾保護、原廠還要給夠長的安全更新（GrapheneOS 要求至少 5 年，Pixel 目前提供 7 年）。

目前同時滿足這些條件的消費級手機幾乎只有 Google Pixel。Pixel 從第 6 代起搭載 Titan M2 安全晶片（第 3 到 5 代是第一代 Titan M），這顆晶片是金鑰保護與硬體驗證的信任根。

GrapheneOS 目前只能跑在 Google 自家的 Pixel 上，但它要對付的，正是 Google 服務對手機的滲透。Google 對 Pixel 與 Android 的每一個政策調整，都會直接影響 GrapheneOS 的處境，而 Android 17 之後，Google 收緊的力道越來越強。

## Android 17 之後：Google 收緊 AOSP 與 Pixel 資料的開放程度

2025 年起，Google 連續兩步墊高了第三方系統的開發成本。先是在 2025 年 3 月把 Android 開發移進內部分支，只在版本發布時才把原始碼推上 AOSP，開發過程不再公開可追（仍是開源，但外部看不到中間的演進）。接著在 2025 年 6 月發布 Android 16 時，不再把 Pixel 的 device tree（描述機型硬體、讓系統能驅動它的設定檔）放進 AOSP，第三方開發者只能靠反推補回這些資料。

即使如此，GrapheneOS 在 2026 年 6 月 16 日 Android 17 發布當天就完成移植，韌性還在。它同時開始替 Pixel 找替代出路，2026 年 3 月與 Motorola 宣布長期合作，第一次把硬體選項鋪到 Pixel 以外（具體機型與時間官方尚未公布）。

另一條壓力來自 attestation（裝置認證，由 app 在背景檢查你的手機是不是「原廠認可」的狀態）。Google 的 Play Integrity 把非官方系統判為不合格，連帶讓部分銀行、企業 app 拒絕在 GrapheneOS 上執行，即使它比原廠更安全。

Google 收緊 AOSP、attestation 鎖定非官方系統的完整時間軸與分析（兩步收緊、Motorola 合作、Microsoft 與歐盟的動向），整理在 [Android 17 上線後的 GrapheneOS（blog）](../blog/posts/2026-grapheneos-android-17.md)。

## 在台灣與正體中文社群的補充

- **取得管道**：Pixel 在台灣沒有官方銷售，多數人透過水貨、海外代購或出國時自行購入。買之前先到官方 [FAQ](https://grapheneos.org/faq){target="_blank"} 確認那台是 GrapheneOS 支援的型號，二手機要特別確認 bootloader 沒有被鎖死（電信商綁約機常鎖住 bootloader，一旦鎖住就無法解鎖刷機）。
- **app 鎖定的實際衝擊**：銀行、政府、企業驗證類 app 越來越常用 attestation 檢查裝置，GrapheneOS 使用者可能遇到某些 app 拒絕執行。對把手機當主要上網裝置的在地使用者，轉用前要先確認每天必用的 app 有哪些可能受影響、自己能否接受，再決定是否轉移。
- **側載限制正在逼近**：Android 17 新增的應用程式側載「開發者驗證」流程，2026 年先在巴西、印尼、新加坡、泰國試行，2027 年擴大。APAC 是第一批試驗場，台灣雖不在首批，但這類政策通常會逐步擴大到鄰近地區。
- 取得管道、app 鎖定、側載限制，指向的都是同一件事，誰有權決定你買來的手機上能跑什麼系統、能裝什麼 app。GrapheneOS 讓使用者在原廠系統之外仍然有得選。

## 常見問題

??? question "我一定要買 Pixel 嗎？"

    目前實務上幾乎是。只有 Pixel 同時滿足 GrapheneOS 要求的可重鎖 bootloader、安全晶片、完整 verified boot 與長期更新。2026 年 3 月宣布的 Motorola 合作可能在未來提供 Pixel 以外的選項，但具體機型與上市時間還沒公布，現在要用 GrapheneOS 仍要準備一台支援的 Pixel。

??? question "安裝 GrapheneOS 後，還能使用 Google 地圖、Gmail 嗎？"

    可以。透過 sandboxed Google Play，你能安裝官方的 Google app，差別在於整套 Google Play 服務是以無特權的一般 app 身分被關進沙箱，沒有系統層權限。你可以完全不裝，也可以只在需要的設定檔裡安裝，是否使用全由你決定。

??? question "GrapheneOS 能讓我匿名嗎？"

    不能，也不該這樣期待。GrapheneOS 做的是 hardening 與去 Google 化，連上電信網路就會向電信商表明身分，這不是 GrapheneOS 能解決的範圍。要匿名請搭配 [Tor](./what-is-tor.md)，並先讀 [匿名與隱私的差別](../basics/anonymity-vs-privacy.md) 釐清需求。

??? question "銀行 app、政府 app 能正常使用嗎？"

    視 app 類別而定。通訊、瀏覽與多數一般 app 透過 sandboxed Google Play 大多正常運作。最容易被擋下的是用 Play Integrity 之類 attestation 檢查裝置的銀行、政府、支付 app，它們可能把 GrapheneOS 判為不合格而拒絕執行。台灣常用 app 的社群回報還不多，最穩的做法是先列出自己「不能沒有」的 app 清單，到 [GrapheneOS 官方論壇](https://discuss.grapheneos.org/){target="_blank"} 搜尋有沒有人回報過，或先保留一支舊手機備用，確認關鍵 app 均可正常運作後再全面轉移。

??? question "與 LineageOS、CalyxOS、/e/OS 有什麼不同？"

    四套的取捨不同。GrapheneOS 是 hardening 最徹底的一套，要求在 Pixel 上重鎖 bootloader 以維持完整的安全模型。CalyxOS 走 microG（一套開源的 Google 服務替代實作）加上重鎖 bootloader 的實用中間路線。LineageOS 支援的機型最廣，但不提供同等的安全強化，而且在很多機型上解鎖 bootloader 後就削弱了 Android 預設的安全保護。/e/OS 以延續舊硬體可用為主，漏洞緩解的等級最低。要最高的安全與隱私選 GrapheneOS，要照顧更多舊機型或想更省事，可以看其他幾套。

## 接下來

GrapheneOS 的安裝是在電腦上用官方 [Web Installer](https://grapheneos.org/install/web){target="_blank"} 對 Pixel 刷機，整個流程在瀏覽器裡有步驟導引、中途失敗可以重來，按步驟操作不會讓手機無法開機（俗稱「變磚」），過程會引導你重鎖 bootloader。操作前先釐清自己的威脅模型，再決定是否以及如何使用 sandboxed Google Play。

行動端的 OS 強化只是整體隱私實踐的一塊。連線層的 [Tor](./what-is-tor.md)、通訊層的 [匿名通訊工具比較](./messaging-comparison.md)、帳號層的 [密碼管理器入門](./password-manager.md)，依你的威脅模型整體搭配。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-chat-question: 威脅模型如何建立](../basics/threat-model.md)
- [:material-incognito: 匿名與隱私的差別](../basics/anonymity-vs-privacy.md)
- [:material-compare-horizontal: Tails、Whonix、Qubes 的差別](./tails-vs-whonix-vs-qubes.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-message-lock-outline: 匿名通訊工具比較](./messaging-comparison.md)
- [:material-key-outline: 密碼管理器入門](./password-manager.md)
- [:material-newspaper-variant-outline: Android 17 上線後的 GrapheneOS](../blog/posts/2026-grapheneos-android-17.md)

</div>
