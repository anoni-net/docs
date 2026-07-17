---
date: 2026-07-20
authors:
    - anoni-net
categories:
    - 更新
    - 隱私
slug: 2026-grapheneos-android-17
image: "https://assets.anoni.net/blog/2026-grapheneos-android-17.jpg"
summary: "Android 17 在 2026 年 6 月 16 日上線，GrapheneOS 當天完成移植。真正的故事是 Google 從 2025 年起連續兩步收緊 AOSP，加上 Play Integrity、Microsoft Authenticator、歐盟 Unified Attestation 一路把更安全的系統擋在門外。這些動作指向同一件事，你買的手機，到底誰決定它能跑什麼系統。"
description: "Android 17 上線後 GrapheneOS 的處境：Google 收緊 AOSP、attestation 鎖定非官方系統，以及這對台灣與正體中文使用者代表什麼。"
---

# Android 17 上線後的 GrapheneOS：誰決定手機上能跑什麼系統

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/2026-grapheneos-android-17.jpg" target="_blank">
        <img src="https://assets.anoni.net/blog/2026-grapheneos-android-17.jpg"
            alt="Android 17 上線後的 GrapheneOS：誰決定手機上能跑什麼系統"
            style="border-radius: 5px;">
    </a>
    <figcaption>圖片：智慧型手機被鎖鏈纏繞，象徵裝置被外部規則鎖住。攝影 Towfiqu barbhuiya，來源 [Pexels](https://www.pexels.com/photo/close-up-of-a-smart-phone-with-a-lock-11391947/){target="_blank"}（Pexels License）。</figcaption>
</figure>

手機是你花錢買的，但它能裝什麼、能執行什麼系統，越來越不是你能決定的。這個問題平常不會浮上檯面，直到你想換一套更保護隱私的系統，卻發現某些 app 因為「偵測到非原廠系統」而拒絕執行，或是你信任的開源系統因為得不到硬體資料而越來越難維護。Android 17 在 2026 年 6 月 16 日上線[^1]，把這個問題又往前推了一步。

對隱私使用者來說，首當其衝的是 [GrapheneOS](https://grapheneos.org/){target="_blank"}，一套把 Android 安全強化、移除 Google 綁定的行動作業系統。它幾乎只能跑在 Google Pixel 上，而 Google 正一步步調整 Android 與 Pixel 的開放程度，維持一套乾淨、由使用者掌握的手機系統，成本也隨之升高。

<!-- more -->

## Google 兩步收緊：開發移入內部分支、Pixel device tree 移出 AOSP

GrapheneOS 這類系統，必須仰賴 Google 公開的 Android 原始碼與 Pixel 硬體資料才能開發。Google 接下來的兩個動作，收緊的正是這兩項來源。

第一步在 2025 年 3 月。Google 把 Android 的主線開發移進內部分支，只在版本正式發布時才把原始碼一次推上 AOSP（Android Open Source Project，Android 的開源核心），開發過程不再公開可追[^2]。Android 仍然是開源專案，外部開發者能取得最終的程式碼，但看不到中間的演進，也更難即時跟上。

第二步在 2025 年 6 月，衝擊更直接。Google 發布 Android 16 時，不再把 Pixel 的 device tree 放進 AOSP[^3]。device tree 是描述某款手機硬體配置、讓系統能正確驅動它的一組設定檔，對要把系統移植到該機型的人來說是地基。Google 同時把 AOSP 的官方參考裝置，從實體的 Pixel 換成虛擬機 Cuttlefish。少了 Pixel 的 device tree 與驅動原始碼，第三方系統開發者只能從 Pixel 出廠的成品檔案回頭猜它每個月的硬體改動，費時又容易出錯。

這兩步加起來，把第三方系統的開發成本墊高了一截。LineageOS（另一套知名的第三方 Android 系統）的貢獻者形容，現在等於要「盲猜，從預編譯的二進位檔反向工程 Pixel 每月的變更」[^3]。

## GrapheneOS 如期完成移植，但開發成本持續升高

即使如此，GrapheneOS 在 Android 17 發布當天（2026 年 6 月 16 日）就完成移植[^4]。過程中遇到 Android 17 本身一個影響 recovery 側載的上游 bug，第一版 build 因此沒有直接推送，修正後的版本 `2026061800` 在 6 月 18 日進入 Alpha 測試通道[^4]。

移植速度沒有變慢，這是 GrapheneOS 工程能力的展示。但每一代要付出的反向工程成本都在增加，而這個成本是 Google 的政策單方面加上去的。一個原本可以靠公開資料順暢進行的工作，現在得靠逆向工程填補缺口。GrapheneOS 能維持這樣的移植速度多久，取決於 Google 後續是否繼續縮減公開資料的範圍。

## 另一種壓力：attestation 將非官方系統判為不合格

除了開發端，GrapheneOS 還面對使用端的壓力，來源是 attestation（裝置認證，由 app 在背景檢查你的手機是不是「原廠認可」的狀態）。

Google 的 Play Integrity API 會把非 Google 認證的系統判為不合格。GrapheneOS 在安全上比原廠 Android 更嚴格，卻因為不是 GMS（Google 行動服務）授權的系統，常被當成被 root（取得最高權限、繞過系統限制）的手機一併拒絕執行。越安全的系統，反而越容易被這套機制排除在外。

attestation 的壓力在 2026 年明顯增強，下面三件事幾乎同時推進：

- **Microsoft Authenticator**：2026 年 2 月底起，開始對 Android 裝置做 root 偵測，GrapheneOS 因為被 Play Integrity 標記而受影響。Microsoft 分三階段推行（先警告、再擋新增帳號、最後清除既有憑證），計畫在 2026 年 7 月完成最後階段，清除受影響帳號的 Entra 憑證[^5]。截至本文撰寫的 6 月，這個期限還沒到、是否如期執行未知。Microsoft 也公開表示不支援 GrapheneOS。
- **歐盟 Unified Attestation**：歐盟版的統一裝置認證提案，GrapheneOS 認為這是 Play Integrity 的歐洲翻版，會把非授權系統一樣擋在 app 生態圈外，已公開呼籲隱私導向的 app 開發者抵制[^6]。
- **Android 17 的側載限制**：Android 17 新增應用程式側載的「開發者驗證」流程，2026 年先在巴西、印尼、新加坡、泰國試行，2027 年擴大到更多地區[^7]。

這些機制各有各的理由（防詐騙、防濫用、青少年保護），但效果相互疊加，使未獲官方認可的系統越來越難用於日常。

## Motorola 合作與 Pixel 的不確定未來

面對 Pixel 的不確定，GrapheneOS 開始找替代硬體。2026 年 3 月 1 日的 MWC 2026，GrapheneOS 與 Motorola 宣布長期合作，計畫推出預載 GrapheneOS、支援 bootloader 解鎖與重鎖的機型[^8]。這是 GrapheneOS 第一次把硬體出路鋪到 Pixel 以外，具體機型與上市時間官方都還沒公布。

回頭看這次合作的起因，GrapheneOS 表示，正是 Google 停止公開 Pixel 共用的驅動程式原始碼，才促成 Motorola 主動找上門[^9]。Google 想把 Android 收得更緊，反而把一個原本綁在自家硬體上的專案推向了競爭對手。

至於 Pixel 本身，GrapheneOS 的說法是「不確定之後還會不會替新推出的 Pixel 加上支援」[^10]。媒體據此推測 Pixel 11 可能是最後一款受官方支援的新 Pixel，但這是媒體的推論，GrapheneOS 官方並沒有做出這個承諾，Pixel 11 之後的機型是否支援仍在未定之天。

## 誰決定手機上能跑什麼系統

Google 收緊 AOSP、用 Play Integrity 決定哪些系統合格，Microsoft 跟著把不合格的系統排除，歐盟研議自己的認證框架，Android 17 要求側載先過驗證。這些機制累加下來，你手機上能跑什麼系統、能裝什麼 app，能自己決定的部分越來越少。

這跟我們在 [從 Discord 年齡驗證談起：我們為什麼自架 Matrix](./2026-discord-matrix-statement.md) 與 [金融公司當起審查者](./2026-financial-companies-as-censors.md) 談過的是同一類問題。當關鍵的基礎設施掌握在少數平台手中，規則由它們單方面決定，一般使用者難以參與，也難以脫離。手機作業系統是其中最貼身的一層，定位、通訊、相簿與身分都存在這一層上。

GrapheneOS 的價值，就在於它讓使用者在原廠系統之外仍然有得選。它不完美，依賴 Pixel、可能被部分 app 拒絕執行、需要一定的學習成本，但它證明了這件事在技術上可行。

## 對台灣與正體中文使用者的意義

上述變化看似都在美國的 Google 與歐盟法規層面，但離正體中文使用者並不遠。

Android 17 的側載驗證，2026 年第一批試驗場就包含印尼、新加坡、泰國，APAC 是最早被納入的地區之一[^7]，這類政策後續往鄰近地區擴大並不意外。另一個更切身的壓力是 attestation。台灣的網銀、行動支付、政府服務 app 越來越常檢查裝置是不是原廠狀態，對把手機當主要上網工具的在地使用者，選用 GrapheneOS 這類系統前，要先確認自己每天必用的 app 是否仍能正常執行。

如果你關心能不能擁有一台真正由自己掌握的手機，GrapheneOS 是現在最成熟的選項，也是觀察 Google 後續動向最直接的視角。Google 接下來的每一步，都會影響 GrapheneOS 作為可行選項還能維持多久。

## 進一步了解 GrapheneOS

這篇文章聚焦處境與脈絡。GrapheneOS 本身是什麼、有哪些隱私與安全設計、為什麼只支援 Pixel、跟匿名工具的界線在哪，整理在 [GrapheneOS：高度隱私的行動作業系統](../../tools/grapheneos.md)。操作前也建議先讀 [威脅模型如何建立](../../basics/threat-model.md) 與 [匿名與隱私的差別](../../basics/anonymity-vs-privacy.md)，釐清自己真正的需求，再評估 GrapheneOS 是否適合自己。

[^1]: [Android 17 release | Android Open Source Project](https://source.android.com/docs/whatsnew/android-17-release){target="_blank"} - Android Open Source Project
[^2]: [Google will develop the Android OS fully in private going forward](https://9to5google.com/2025/03/26/google-android-aosp-developement-private/){target="_blank"} - 9to5Google
[^3]: [AOSP isn't dead, but Google just landed a huge blow to custom ROM developers](https://www.androidauthority.com/google-not-killing-aosp-3566882/){target="_blank"} - Android Authority
[^4]: [GrapheneOS has been ported to Android 17 and official releases are coming soon](https://discuss.grapheneos.org/d/36469-grapheneos-has-been-ported-to-android-17-and-official-releases-are-coming-soon){target="_blank"} - GrapheneOS Discussion Forum
[^5]: [Microsoft tightens Authenticator checks on Android and iOS](https://www.theregister.com/on-prem/2026/03/10/microsoft_tightens_authenticator_checks_on/){target="_blank"} - The Register
[^6]: [GrapheneOS calls on privacy-focused app developers to boycott European Unified Attestation](https://piunikaweb.com/2026/03/10/grapheneos-calls-on-privacy-focused-app-developers-to-boycott-european-unified-attestation/){target="_blank"} - PiunikaWeb
[^7]: [Android sideloading changes: here's the full timeline](https://www.androidauthority.com/android-sideloading-changes-timeline-3679204/){target="_blank"} - Android Authority
[^8]: [Motorola confirms GrapheneOS partnership for a future smartphone](https://9to5google.com/2026/03/01/motorola-confirms-grapheneos-partnership-for-a-future-smartphone-porting-features/){target="_blank"} - 9to5Google
[^9]: [GrapheneOS explains Motorola partnership origin & the uncertain future of Pixels](https://piunikaweb.com/2026/03/12/grapheneos-explains-motorola-partnership-origin-the-uncertain-future-of-pixels/){target="_blank"} - PiunikaWeb
[^10]: [Pixel 11 could be the last new Pixel to gain GrapheneOS support](https://piunikaweb.com/2026/01/26/pixel-11-could-be-the-last-new-pixel-to-gain-grapheneos-support/){target="_blank"} - PiunikaWeb
