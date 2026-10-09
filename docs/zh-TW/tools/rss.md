---
title: RSS 訂閱入門
description: 不需要帳號、依發布時間排列、訂閱清單留在自己裝置上的網站追蹤方式。閱讀器的選擇、訂閱步驟、經由 Tor 讀取、接到團隊聊天工具，以及 anoni.net 各站的 feed 網址。
icon: material/rss
---

# :material-rss: RSS 訂閱入門

想追蹤一個網站的新文章，常見的做法是追蹤它的社群帳號，或訂閱電子報。追蹤社群帳號要先有平台帳號，看得到哪幾篇由演算法決定。訂閱電子報要交出 email 地址。RSS 讓你把想追的網站加進一個閱讀器，新文章依發布時間出現在同一個地方，不必註冊帳號，訂了哪些網站也只記在自己的裝置上。

anoni.net 的文件站、軟體更新日誌與新聞導讀都提供 RSS。直接點開網頁上的 RSS 連結，多半只會看到一整頁程式碼，因為那份檔案是給閱讀器讀的。裝好閱讀器、貼上網址之後，新文章就會自己出現。

!!! tip "時間有限的話，先看這幾點"

    - 先裝一個閱讀器：Android 用 Feeder，iPhone、iPad 與 Mac 用 NetNewsWire，電腦用 Thunderbird 或 Fluent Reader
    - 在閱讀器裡新增訂閱，貼上 feed 網址（[本頁最後](#anoninet-的-feed-網址)有 anoni.net 的清單）
    - 選不必登入的本機閱讀器，訂閱清單只留在自己的裝置上
    - 不想讓網站看到自己的 IP，可以經由 Tor 讀取 onion 版本的 feed
    - 團隊可以把 feed 接到 Slack、Matrix 這類聊天工具，代價是訂閱清單交給平台或機器人

## RSS 的運作方式

網站把最新文章的標題、摘要或全文整理成一份固定網址的檔案，稱為 feed。閱讀器每隔一段時間讀取一次這份檔案，發現新文章就放進你的清單。整個過程由閱讀器單方向讀取，網站無法主動推送內容給你，也不會取得你的聯絡方式。

Atom 與 JSON Feed 是同一類的格式，常見的閱讀器都能讀取，本頁統稱 RSS。

## RSS 的隱私取捨

### 與社群平台、電子報的差別

追蹤社群帳號時，平台知道你追了誰、在哪一則貼文停留多久，這些紀錄會用在排序與廣告投放（細節見[社群平台怎麼收集你的資料](../basics/platform-tracking.md)）。訂閱電子報要交出 email，許多電子報服務還會在信裡放追蹤圖片，記錄你何時開信。RSS 閱讀器沒有帳號，網站端看到的是某個 IP 定時來讀取一份檔案。

### 網站仍然看得到的部分

閱讀器每次讀取 feed，網站與網站前面的 CDN 都看得到連線的 IP、時間，以及閱讀器的名稱與版本，跟用瀏覽器開一個網頁相同。文章裡的圖片在閱讀器顯示時另外下載，也會留下連線紀錄。點進原文網頁就是一般的瀏覽，網頁上的分析工具照樣會載入。

不想讓網站看到自己的 IP，可以[經由 Tor 讀取](#經由-Tor-讀取)。

### 本機閱讀器與雲端閱讀器

Inoreader、Feedly 這類雲端閱讀器由業者的伺服器代你讀取 feed，好處是多台裝置之間同步已讀狀態，網站端看到的也是業者的伺服器。代價是你訂了哪些網站、讀了哪幾篇，業者全部知道，而且都記在你的帳號底下。本機閱讀器把訂閱清單與已讀紀錄存在裝置上，換成網站端看得到你的 IP。

訂閱清單看得出你關心哪些議題、用哪些裝置與軟體。例如依裝置訂閱軟體更新日誌，清單上就寫著你用的是 iPhone 還是 Android、有沒有在用 Tails。交給雲端業者之前，先想過一次這份清單的敏感程度。

## 閱讀器的選擇

下面幾個閱讀器都是開源軟體，免費，不必註冊帳號就能使用，最近一年內都有新版本發布：

- Android：[Feeder](https://github.com/spacecowboy/Feeder){target="_blank"}，有正體中文介面，從 [F-Droid](https://f-droid.org/packages/com.nononsenseapps.feeder/){target="_blank"} 或 Google Play 安裝
- iPhone、iPad、Mac：[NetNewsWire](https://netnewswire.com/){target="_blank"}，介面只有英文，從 App Store 安裝
- Windows、Mac、Linux：[Thunderbird](https://www.thunderbird.net/zh-TW/){target="_blank"} 或 [Fluent Reader](https://hyliu.me/fluent-reader/){target="_blank"}，兩者都有正體中文介面

Thunderbird 原本是郵件軟體，已經在用它收信的人不必另外安裝。Fluent Reader 專門用來讀 RSS，版面接近新聞 App。NetNewsWire 預設把訂閱存在裝置上，設定裡另有 iCloud 同步，開啟之後訂閱清單會存到 iCloud。

## 訂閱的步驟

各閱讀器的按鈕位置不同，步驟相近：

1. 複製 feed 網址。可以從[本頁最後的清單](#anoninet-的-feed-網址)複製，或在網頁的 RSS 連結上按右鍵、選「複製連結」
2. 在閱讀器裡找到新增訂閱的地方，貼上網址。Feeder 是「新增訂閱」，Fluent Reader 在「管理訂閱源」裡新增。NetNewsWire 在 iPhone 與 iPad 上按 `+` 選「Add Feed」，在 Mac 上用選單的「New Feed…」
3. 閱讀器讀到 feed 之後會列出網站名稱與最近的文章，確認後加入

有些閱讀器也接受網站首頁的網址，會自動找出 feed 的位置。找不到的話，改貼 feed 網址。

### Thunderbird

Thunderbird 要先建立一個消息來源帳號，之後的訂閱都放在這個帳號底下：

1. 右上角的應用程式選單，選「新增帳號」、「消息來源」，取一個名稱完成建立
2. 在左側點選剛建立的帳號，右側的帳號頁點「管理資訊來源訂閱項目」
3. 在「來源 URL」欄位貼上網址，按「新增」

## 經由 Tor 讀取

anoni.net 的每一份 feed 都有 onion 版本（網址在[本頁最後的清單](#anoninet-的-feed-網址)）。經由 Tor 讀取 onion 版本時，網站端看不到你的 IP，你的網路業者也只看得到你在使用 Tor。所在的網路封鎖了 anoni.net 的話，onion 版本的 feed 照樣可以讀取。Tor 本身也被封鎖時，Tor Browser 要先設定橋接（見[中繼點與橋接點](./what-is-tor.md#中繼點與橋接點)）。

閱讀器需要支援 SOCKS proxy 才能經由 Tor 連線。Thunderbird 的設定方式：

1. 開著 Tor Browser，它會在本機的 `127.0.0.1:9150` 提供 Tor 連線
2. 開啟 Thunderbird 的「設定」、「一般」，拉到最下方的網路區塊，按「設定…」
3. 選「手動設定 Proxy」，「SOCKS 主機」填 `127.0.0.1`、Port 填 `9150`，選 SOCKS v5，並勾選讓 DNS 查詢也經由 SOCKS v5 代理的選項。沒有勾選的話，onion 網址會無法連線

Proxy 設定對整個 Thunderbird 生效。同一個 Thunderbird 也用來收信的話，郵件同樣會經由 Tor 連線，有些郵件服務會因此要求額外驗證或擋下登入。只想讓 RSS 經由 Tor，可以另外建立一個專門讀 RSS 的 Thunderbird 設定檔（profile）。關掉 Tor Browser 之後，這個設定下的 Thunderbird 會無法連線。

Tor 本身的介紹見[什麼是 Tor](./what-is-tor.md)。

## 團隊一起收

組織常用的聊天工具多半也能訂閱 RSS，新文章會自動貼進指定的頻道。一個人設定一次，頻道裡的成員都能收到，其他人不必另外安裝閱讀器。

接到聊天工具之後，實際讀取 feed 的換成平台的伺服器或第三方機器人，對方也就知道這個團隊訂了哪些來源。依裝置訂閱軟體更新日誌的團隊，等於把團隊用哪些裝置與軟體交給對方。下面依訂閱清單交給誰分成三類。

### 清單留在組織內

- Matrix：自架的伺服器裝好 [hookshot](https://matrix-org.github.io/matrix-hookshot/latest/setup/feeds.html){target="_blank"} 並開啟 feeds 功能之後，在房間輸入 `!hookshot feed <網址>`
- Zulip：官方的 [RSS 整合](https://zulip.com/integrations/rss){target="_blank"} 是一支放在自己機器上、定時執行的程式，讀到新文章就貼進指定的頻道

讀取 feed 的是組織自己的機器，訂閱清單不會交給外部業者。代價是要有人負責架設與維護。

### 清單交給平台

- Slack：官方的 RSS app，在頻道輸入 `/feed subscribe <網址>`（見 [Slack 的說明](https://slack.com/help/articles/218688467-Add-RSS-feeds-to-Slack){target="_blank"}）
- Microsoft Teams：原本的 RSS 連接器已在 2026 年 5 月停用，改用 Workflows 的 RSS 範本

團隊平常的對話本來就放在這些平台上，多交出去的是訂閱清單。

### 多一個第三方

- Discord：沒有內建 RSS，常見的做法是加入 [MonitoRSS](https://monitorss.xyz/){target="_blank"} 這類機器人，或用 Zapier 之類的服務接 webhook（讓外部服務把訊息貼進頻道的專屬網址）
- Telegram：同樣仰賴第三方機器人

機器人的營運者知道你們訂了哪些來源，而且可以在頻道裡發訊息。MonitoRSS 與 [RSS-to-Telegram-Bot](https://github.com/Rongronggg9/RSS-to-Telegram-Bot){target="_blank"} 都是開源軟體，可以自行架設，少掉營運者這一層。

## anoni.net 的 feed 網址

=== "一般網路"

    文件站的近期公告：

    ```
    https://anoni.net/docs/feed_rss_created.xml
    ```

    軟體更新日誌的全部條目：

    ```
    https://anoni.net/docs/changelog/feed.xml
    ```

    軟體更新日誌，只收需要立刻與儘快處理的更新：

    ```
    https://anoni.net/docs/changelog/feed-urgent.xml
    ```

    新聞導讀：

    ```
    https://anoni.net/news/feed.xml
    ```

    新聞導讀的简体中文版與英文版：

    ```
    https://anoni.net/news/zh-cn/feed.xml
    ```

    ```
    https://anoni.net/news/en/feed.xml
    ```

=== "Tor（onion）"

    文件站的近期公告：

    ```
    http://docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/feed_rss_created.xml
    ```

    軟體更新日誌的全部條目：

    ```
    http://docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/changelog/feed.xml
    ```

    軟體更新日誌，只收需要立刻與儘快處理的更新：

    ```
    http://docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/changelog/feed-urgent.xml
    ```

    新聞導讀：

    ```
    http://news.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/feed.xml
    ```

    新聞導讀的简体中文版與英文版：

    ```
    http://news.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/zh-cn/feed.xml
    ```

    ```
    http://news.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/en/feed.xml
    ```

軟體更新日誌另外依裝置與用途分成 iPhone 與 iPad、Mac、Windows、Linux、Android、Tails 等幾份 feed，訂閱連結在[軟體更新日誌](../changelog/index.md)各篩選項的旁邊。只訂自己用得到的那幾份，閱讀器裡就不會堆滿無關的更新。

## 不想安裝閱讀器的話

也可以[訂閱電子報](https://anoni.net/contact/)，社群的專案進度與活動資訊會寄到信箱。不想交出平常用的 email，可以用[郵件別名](./email-alias.md)訂閱，日後不想收時直接關掉別名。

## 相關閱讀

- [軟體更新日誌](../changelog/index.md)：匿名工具與作業系統的版本更新，依裝置分別訂閱
- [社群平台怎麼收集你的資料](../basics/platform-tracking.md)：追蹤社群帳號時，平台取得了哪些紀錄
- [郵件別名怎麼用，以及它把信任交給誰](./email-alias.md)：訂閱電子報時不交出本名信箱的做法
- [什麼是 Tor](./what-is-tor.md)：經由 Tor 讀取 feed 之前，先了解 Tor 能保護什麼
