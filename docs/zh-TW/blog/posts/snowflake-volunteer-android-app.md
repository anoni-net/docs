---
date: 2026-08-05
authors:
    - anoni-net
categories:
    - 更新
    - Tor
    - 翻譯文章
slug: snowflake-volunteer-android-app
image: "assets/images/tor.webp"
summary: "Tor Project 8 月發文介紹 4 月上架的 Snowflake Volunteer，把貢獻 Snowflake 志工橋接做成一支 Android App，志工橋接數單月成長 29%。文末說明台灣讀者可以如何用這支 App 貢獻橋接。"
description: "翻譯 Tor Project 官方公告，介紹 Snowflake Volunteer 這支 Android App：開發背景、如何運作、上線後的成長數字，以及台灣讀者可以如何用手機貢獻 Snowflake 橋接。"
---

# Snowflake Volunteer：Tor Project 推出手機志工橋接 App

!!! info ""

    以下內容改寫自 Tor Project 官方部落格文章，主詞角色為 Tor Project 與文章作者 Pavel：

    - [Snowflake Volunteer, an Android app to help people bypass censorship | August 3, 2026](https://blog.torproject.org/snowflake-volunteer-standalone-app-to-help-people-bypass-censorship/){target="_blank"}

<figure markdown="span">
    <a href="https://forum.torproject.org/uploads/default/original/2X/c/c9143874b416a1c6e0d676145c11846ad63bad39.jpeg" target="_blank">
        <img src="https://forum.torproject.org/uploads/default/original/2X/c/c9143874b416a1c6e0d676145c11846ad63bad39.jpeg"
            alt="Snowflake Volunteer 官方宣傳圖，畫面中多支手機顯示 App 的啟用開關、設定選項與統計畫面"
            style="border-radius: 10px;">
    </a>
    <figcaption>圖片來源：<a target="_blank" href="https://blog.torproject.org/snowflake-volunteer-standalone-app-to-help-people-bypass-censorship/">Tor Project Blog</a>。</figcaption>
</figure>

我們在[伊朗封網後的那篇](iran-blackout-webtunnel.md)提過，[Snowflake](../../tools/tor-snowflake.md) 是幫人連上 Tor 門檻最低的方式：開一個瀏覽器分頁放著不動，就是在幫忙轉發流量。2026 年 8 月 3 日，Tor Project 發文介紹 4 月已經上架的 Snowflake Volunteer，把「貢獻志工橋接」做成一支獨立的 Android App，門檻又降了一階。過去要貢獻 Snowflake 橋接，需透過瀏覽器擴充功能、網站內嵌 widget、桌面版命令列工具，或 Android 上的 [Orbot Kindness Mode](https://orbot.app/en/kindness/){target="_blank"}。新 App 只做這一件事，介面與設定都只為此設計。

<!-- more -->

## 為什麼需要一支獨立的 App

Snowflake 的運作原理，是把使用者的流量偽裝成視訊通話，再透過志工提供的臨時連線轉發，讓審查者更難偵測與封鎖。機制要運作得好，需要大量穩定在線的志工橋接。2026 年上半年，Snowflake 的媒合伺服器（broker）平均每天約有 146,000 個不重複志工橋接 IP 位址回報[^1]，其中約三分之一來自 Orbot 的 Kindness Mode，它會顯示自己的裝置協助過多少條連線，讓貢獻變得具體可見。

葡萄牙的 Android App 工作室 [Bloco](https://www.bloco.io/){target="_blank"} 先前參與 [OONI](https://ooni.org/){target="_blank"}（Open Observatory of Network Interference，網路干擾開放觀測，擁有全球最大的網路審查開放資料集）的合作，看到 NGO 與行動者高度依賴反審查工具維持安全與連線。他們發現貢獻 Snowflake 橋接的門檻不高，想以自身專業回饋這個開源專案，注意到 Kindness Mode 貢獻的比重後，好奇一支「只做志工橋接」的獨立 App 能不能吸引更多人參與，於是主動接洽 Tor 的反審查團隊。對方本來就有類似計畫，只是尚無餘力著手，這個任務便交給了 Bloco。

## App 的功能

Bloco 站在 [Guardian Project](https://guardianproject.info){target="_blank"} 既有的行動端 Tor 生態基礎上開發，特別是函式庫 [IPtProxy](https://github.com/tladesignz/IPtProxy){target="_blank"}，它把行動 App 串接 Tor 所需的工具與 pluggable transport（可插拔傳輸，讓流量偽裝成其他外觀以規避審查的技術模組）打包在一起。有了這些現成元件，Bloco 可以把心力放在背景穩定運作與省電、讓使用者看得懂並能照自己的網路狀況正確設定，以及用統計數字持續呈現志工協助了多少連線。

成果是 Snowflake Volunteer：使用者可以設定讓它在背景執行、只在 Wi-Fi 等非計量網路下運作、只在充電時運作，也可以設定同時協助的連線數上限。啟用後，App 會自動與需要 Snowflake 橋接的使用者配對，協助把對方的連線導向 Tor 網路，過程中雙方互不知道彼此身分。

瀏覽器分頁版本的 Snowflake 在手機上有已知限制：分頁進入背景後，Android 系統經常會直接中斷 WebRTC 連線，長時間貢獻一直都建議改用桌上型電腦或筆電。Snowflake Volunteer 是獨立 App，用的是 Android 允許持續執行的背景服務，不受分頁被系統回收的限制，正是手機能長期貢獻的關鍵差異。

<figure markdown="span">
    <a href="https://blog.torproject.org/snowflake-volunteer-standalone-app-to-help-people-bypass-censorship/features-overview.png" target="_blank">
        <img src="https://blog.torproject.org/snowflake-volunteer-standalone-app-to-help-people-bypass-censorship/features-overview.png"
            alt="Snowflake Volunteer App 三個畫面的截圖：啟用中的主畫面顯示幫助人數與流量統計、設定頁可調整背景執行與限制 Wi-Fi 或充電時執行、統計頁列出逐日的連線數與流量"
            style="border-radius: 10px;">
    </a>
    <figcaption>App 的主畫面、設定頁與統計頁截圖。圖片來源：<a target="_blank" href="https://blog.torproject.org/snowflake-volunteer-standalone-app-to-help-people-bypass-censorship/">Tor Project Blog</a>。</figcaption>
</figure>

## 上線後的成效

Snowflake Volunteer 經過一段社群測試與意見回饋後，於 4 月正式在 [F-Droid](https://f-droid.org/en/packages/io.bloco.snowflake/){target="_blank"} 與 [Google Play](https://play.google.com/store/apps/details?id=io.bloco.snowflake){target="_blank"} 上架。5 月平均每天約 1,300 個不重複志工橋接 IP，6 月成長到約 1,700 個，單月成長 29%，單日尖峰曾超過 2,100 個橋接。相對於整體約 146,000 個橋接的規模，這批新增志工還只是一小塊，但原本並不在池子裡，多半是過去被瀏覽器分頁版本擋在門外的手機使用者。

App 目前支援 8 種語言（英文、法文、德文、日文、葡萄牙文、土耳其文、越南文，以及簡體中文），這些語言版本來自社群在地化志工的貢獻。目前還沒有正體中文版本，想協助的人可以到 [Weblate 專案頁](https://hosted.weblate.org/projects/snowflake-volunteers/){target="_blank"}，或先讀 [Tor 的在地化流程說明](https://community.torproject.org/localization/){target="_blank"}。

## 對台灣讀者來說多了一個選項

[Tor Snowflake 橋接點](../../tools/tor-snowflake.md) 已經整理過台灣為什麼適合貢獻橋接：對外連線受審查程度低、頻寬充足，比起架設 [Tor Relay](../../community/setup-tor-relay.md) 門檻明顯較低。安裝這支 App，表示手機會替受審查地區的使用者轉發 Tor 流量，實際運作上有幾件事值得先知道：對外網站看到的是 Tor 出口節點，不是你的 IP，你自己也看不到流量內容，因為流量在轉發前已經被 Tor 加密。預設設定下對日常網路使用幾乎無感，勾選只在 Wi-Fi、只在充電時運作，就不會動用行動網路的流量或電量。在公司或學校網路上執行，等於把那個網路的 IP 用來轉發第三方流量，資訊政策嚴格的環境建議先問過資訊部門。

已經在用 Orbot Kindness Mode 的人不必重複安裝，可以繼續用它。Snowflake Volunteer 的差別在於只做橋接一件事，能單獨設定只在 Wi-Fi、只在充電時運作，不必連著整個 Orbot 一起開，適合只想幫這個忙、不想順便用 Orbot 上網的人。

跟瀏覽器版一樣，如果你在香港，參與前請先讀 [Tor Snowflake 橋接點](../../tools/tor-snowflake.md) 頁裡的香港讀者提醒，把國安監控風險一併評估。

## 如何安裝

Snowflake Volunteer 可以從 [F-Droid](https://f-droid.org/en/packages/io.bloco.snowflake/){target="_blank"}、[Google Play](https://play.google.com/store/apps/details?id=io.bloco.snowflake){target="_blank"} 下載，一般使用者用 Google Play 即可，偏好開源商店的人可以用 F-Droid。原始碼開源在 [GitHub](https://github.com/blocoio/snowflake){target="_blank"}，可以自行編譯，遇到問題也可以直接[開 issue](https://github.com/blocoio/snowflake/issues/new){target="_blank"}。iOS 目前沒有對應的 App，iPhone 使用者可以改用[瀏覽器版橋接點](../../tools/tor-snowflake.md)。

## 相關閱讀

- [Tor Snowflake 橋接點](../../tools/tor-snowflake.md)：瀏覽器版橋接點如何開，以及香港讀者要注意的風險
- [伊朗封網 80 多天後重新開放，流量湧進社群架設的 Tor WebTunnel](iran-blackout-webtunnel.md)：橋接點在真實審查情境下的作用
- [Tor Relay 校園建立研究專題](../../community/relay-on-campus.md)：想投入更多心力的下一步

[^1]: 統計依據 2026 年 1 月 1 日至 6 月 30 日、共 180 份 Snowflake broker 每日報告，數據來自 Tor Metrics 的 [CollecTor 封存](https://metrics.torproject.org/collector/archive/snowflakes/){target="_blank"} 彙整的 snowflake-stats descriptor。
