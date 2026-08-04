---
date: 2026-08-04
authors:
    - anoni-net
categories:
    - 更新
    - Tor
    - 翻譯文章
slug: snowflake-volunteer-android-app
image: "assets/images/tor.webp"
summary: "Tor Project 8 月推出 Snowflake Volunteer，把當 Snowflake 志工橋接獨立成一支 Android App，上線後三個月志工橋接數成長近 6 成。文末補上台灣讀者可以怎麼用這支 App 幫忙翻牆。"
description: "翻譯 Tor Project 官方公告，介紹新上線的 Snowflake Volunteer Android App：背景由來、怎麼運作、上線後的成長數字，以及台灣讀者可以怎麼用手機貢獻 Snowflake 橋接。"
---

# Snowflake Volunteer 上線：Tor Project 推出手機志工橋接 App

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

Tor Project 在 2026 年 8 月 3 日發布 [Snowflake Volunteer](https://f-droid.org/en/packages/io.bloco.snowflake/){target="_blank"}，一支專門讓人用 Android 手機當 [Snowflake](../../tools/tor-snowflake.md) 志工橋接的獨立 App。過去要貢獻 Snowflake 橋接，需透過瀏覽器擴充功能、網站內嵌 widget、桌機命令列工具，或 Android 上的 [Orbot Kindness Mode](https://orbot.app/en/kindness/){target="_blank"}。新 App 把「當志工橋接」獨立成一個單一用途的應用程式，介面與流程都只為此設計。

<!-- more -->

## 為什麼要多做一支獨立 App

Snowflake 的原理是把使用者的流量偽裝成視訊通話的樣子，再透過志工提供的臨時連線轉送，讓審查者更難偵測與封鎖。這個機制要運作得好，需要一大群穩定在線的志工橋接。2026 年上半年，Snowflake broker 平均每天約有 14 萬 6 千個不重複志工橋接 IP 位址回報[^1]，其中約三分之一來自 Orbot 的 Kindness Mode。Kindness Mode 會顯示這個橋接幫過幾個連線，讓貢獻變得具體可見。

葡萄牙的 Android App 工作室 [Bloco](https://www.bloco.io/){target="_blank"} 看到 Kindness Mode 貢獻的比重後，好奇一支「只做志工橋接」的獨立 App，能不能吸引到更多人參與。他們主動找上 Tor 的反審查團隊，發現對方本來就有類似計畫，只是尚無餘裕著手，於是接下了開發工作。背後的原因，是 Bloco 團隊先前參與 [OONI](https://ooni.org/){target="_blank"}（Open Observatory of Network Interference，全球最大規模的網路封鎖觀測計畫）合作時，看到 NGO 與行動者有多依賴反審查工具維持安全與連線，發現貢獻 Snowflake 橋接的門檻不高後，就想拿自己的專業回饋這個開源專案。

## App 做了什麼

Bloco 站在 [Guardian Project](https://guardianproject.info){target="_blank"} 既有的行動端 Tor 生態基礎上開發，特別是 [IPtProxy](https://github.com/tladesignz/IPtProxy){target="_blank"} 這個函式庫，把 Tor 整合進行動 App 所需的工具與 pluggable transport 整合在一起。有這層基礎，Bloco 就能把心力集中在三件事。第一是讓 App 能長時間在背景穩定運作、盡量省電。第二是把使用者體驗做對，讓每個人都看得懂 App 在做什麼、能照自己的網路狀況正確設定。第三是用統計數字持續呈現志工幫上了多少忙，維持參與的動力。

成果是 Snowflake Volunteer，一支把「什麼時候貢獻、貢獻多少」的控制權交給志工自己的單一用途 App。使用者可以讓它在背景執行、限制只在 Wi-Fi（非計量網路）下運作、設定只在充電時執行，也可以設定同時能幫幾個連線。啟用後，App 會自動跟需要 Snowflake 橋接的使用者配對，協助把對方的連線導向 Tor 網路。

<figure markdown="span">
    <a href="https://blog.torproject.org/snowflake-volunteer-standalone-app-to-help-people-bypass-censorship/features-overview.png" target="_blank">
        <img src="https://blog.torproject.org/snowflake-volunteer-standalone-app-to-help-people-bypass-censorship/features-overview.png"
            alt="Snowflake Volunteer App 三個畫面的截圖：啟用中的主畫面顯示幫助人數與流量統計、設定頁可調整背景執行與限制 Wi-Fi 或充電時執行、統計頁列出逐日的連線數與流量"
            style="border-radius: 10px;">
    </a>
    <figcaption>App 的主畫面、設定頁與統計頁截圖。圖片來源：<a target="_blank" href="https://blog.torproject.org/snowflake-volunteer-standalone-app-to-help-people-bypass-censorship/">Tor Project Blog</a>。</figcaption>
</figure>

## 上線後的成效

Snowflake Volunteer 經過一輪社群測試與意見回饋後，於 4 月正式公開上線。5 月平均每天約 1,300 個不重複志工橋接 IP，6 月成長到約 1,700 個，單月成長 29%。這段期間單日尖峰曾超過 2,100 個橋接。這個數字顯示，一支專用 App 確實能把額外的志工帶進 Snowflake 社群。

App 目前已支援 8 種語言（中文、英文、法文、德文、日文、葡萄牙文、土耳其文、越南文），要感謝社群在地化志工的貢獻。想協助擴大語言覆蓋，可以透過 [Weblate 專案頁](https://hosted.weblate.org/projects/snowflake-volunteers/){target="_blank"} 或參考 [Tor 的在地化流程說明](https://community.torproject.org/localization/){target="_blank"} 加入。

## 怎麼安裝

Snowflake Volunteer 可以從 [F-Droid](https://f-droid.org/en/packages/io.bloco.snowflake/){target="_blank"}、[Google Play](https://play.google.com/store/apps/details?id=io.bloco.snowflake){target="_blank"} 下載，原始碼開源在 [GitHub](https://github.com/blocoio/snowflake){target="_blank"}，想自己編譯或回報問題都可以直接[開 issue](https://github.com/blocoio/snowflake/issues/new){target="_blank"}。

[^1]: 統計依據 2026 年 1 月 1 日至 6 月 30 日、共 180 份 Snowflake broker 每日報告，資料來自 Tor Metrics 的 [CollecTor 封存](https://metrics.torproject.org/collector/archive/snowflakes/){target="_blank"} 彙整的 snowflake-stats descriptor。

## 對台灣讀者來說多了一個選項

[Tor Snowflake 橋接點](../../tools/tor-snowflake.md) 已經整理過台灣為什麼適合貢獻橋接：對外連線受審查程度低、頻寬充足，比起架設 [Tor Relay](../../community/setup-tor-relay.md) 門檻低很多。過去門檻是「開一個瀏覽器分頁、電腦留著運作」，現在多了「裝一支 Android App、手機留著運作」這個選項，對平常用手機比用電腦多的人來說更容易安裝，也更容易長期留著背景執行。

跟瀏覽器分頁一樣，安裝這支 App 代表你的裝置會替受審查地區的使用者轉發 Tor 流量。如果你在香港，參與前請先看 [Tor Snowflake 橋接點](../../tools/tor-snowflake.md) 頁裡的香港讀者提醒，把國安監控風險一併考慮進去。

## 相關閱讀

- [Tor Snowflake 橋接點](../../tools/tor-snowflake.md)：瀏覽器版橋接點怎麼開，以及香港讀者要注意的風險
- [伊朗封網 80 多天後重新開放，流量湧進社群架設的 Tor WebTunnel](iran-blackout-webtunnel.md)：橋接點在真實審查情境下的作用
- [Tor Relay 校園建立研究專題](../../community/relay-on-campus.md)：想投入更多心力的下一步
