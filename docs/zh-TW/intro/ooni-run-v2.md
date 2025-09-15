---
title: OONI Run v2 操作說明
icon: material/help-network
description: 如何建立動態的檢測名單，隨時檢測網路監控狀況！
---

# OONI Run v2 操作說明

![OONI RUN v2 Header](https://assets.anoni.net/docs/ooni-run-v2-header.png){style="border-radius:10px;border:1px solid #00aeff;box-shadow:0px 0px 0.3rem #00aeff;"}

[OONI Run](https://run.ooni.org/){target="_blank"} 最初於 2017 年 9 月[推出](https://ooni.org/post/ooni-run/){target="_blank"}，是一個用來建立行動裝置[深層連結（Mobile Deep Links）](https://zh.wikipedia.org/zh-tw/%E7%A7%BB%E5%8A%A8%E6%B7%B1%E5%BA%A6%E9%80%A3%E7%B5%90){target="_blank"}的平台，讓你可以與 [OONI Probe](https://ooni.org/install/mobile){target="_blank"} 使用者分享、協助測試網站是否遭到審查與阻擋。在過去的日子中，OONI Run 被委內瑞拉、馬來西亞、印度及全球的[社群成員廣泛使用](https://ooni.org/support/ooni-censorship-measurement-campaigns#examples-of-ooni-censorship-measurement-campaigns){target="_blank"}，作為審查測量活動的一部分，期望能夠觀察監控並快速回應新出現的審查事件。為了改善 OONI Run 平台，且更好地滿足社群的需求，OONI 團隊之前進行了一項 OONI Run [可用性研究](https://ooni.org/post/2020-06-09-ooni-run-usability-study-findings/){target="_blank"}，並藉此記錄了大量的社群意見回覆。

OONI Run v2，是一個重大改版，主要針對[社群的建議和需求](https://ooni.org/post/2020-06-09-ooni-run-usability-study-findings/){target="_blank"}來實作。OONI Run v2 包含以下的新功能：

* 縮短的 OONI Run 連結。
* 能夠動態更新 OONI Run 連結。
* 自動化測試 OONI Run 連結。
* 能夠輕鬆辨識、搜尋檢視在 [OONI Explorer](https://explorer.ooni.org/zh-Hant){target="_blank"} 上整合來自 OONI Run 連結的測量結果。

## OONI Run v2 簡介

你是一名研究員，對於研究特定網站被封鎖的情況感興趣嗎？或是你是一名記者或倡議者，想要收集數據資料以確認某些網站在其他國家被封鎖的狀況？如果是這樣，OONI Run 非常適合你。你可以使用 OONI Run 來**分享行動裝置連結，讓你可以測試自己選擇的網站是否被審查**，並即時將測試結果作為開放資料發佈。

OONI Run v2 將社群驅使的審查測試提升到全新層次。OONI Run v2 的連結不僅更短、更容易分享，還可以根據想要與志工社群分享的資訊來自定義連結。你只需登入 OONI Run v2 平台，就可以存取你所建立的所有連結，並持續更新它們**（不需要重新建立新連結！）**，以包含任意想測試的額外網站。你的志工社群在其 OONI Probe 應用程式中安裝了你的 OONI Run 連結後，會自動收到任何你所做的更新，且你分享的連結將自動進行測試，確保持續的測試和更廣泛的測量覆蓋範圍。你可以在 OONI Explorer 上找到這些測試的結果，所有測量結果將即時作為開放資料發佈。

想開始使用 OONI Run v2 嗎？透過以下內容了解更多。

## 操作說明

### 建立和分享連結

要開始使用 OONI Run v2，請連結到 OONI Run 網站：<https://run.ooni.org/>{target="_blank"}

你可以透過以下步驟來建立和分享 OONI Run v2 連結。

![取得 Log in 連結](https://assets.anoni.net/docs/ooni-run-v2-1.png){style="border-radius:10px;border:1px solid #00aeff;box-shadow:0px 0px 0.3rem #00aeff;"}

* **步驟 1.** 點擊「**Log In To Create OONI Run Link**」按鈕。
* **步驟 2.** 在電子郵件欄位中填入你的電子郵件地址。
* **步驟 3.** 點擊「**傳送連結給我**」按鈕。

!!! info "關於電子郵件地址"

    當你登入時，OONI 網站不會儲存電子郵件地址，只有在你建立 OONI Run 連結時才會儲存。OONI 網站儲存你的電子郵件地址，這樣當 OONI Probe 使用者收到你發送的 OONI Run 連結時，可以根據你的電子郵件地址來信任該連結（這會顯示在你建立的 OONI Run 連結中），有助於降低執行惡意連結的風險。

送出後請到信箱中找到 OONI 團隊寄來的信件：

``` txt
寄件人：admin@ooni.org
收件人：me
標題：OONI Account activation email

Welcome to OONI

**Please login here**

The link can be used on multiple devices and will expire in 24 hours.
```

* **步驟 4.** 點擊發送到你電子郵件中的連結「**Please login here**」來登入 OONI Run v2 平台。登入 OONI Run 平台後，可以在「**Create OONI Run Link**」頁面開始建立 OONI Run v2 連結。

![取得 Log in 連結](https://assets.anoni.net/docs/ooni-run-v2-2.png){style="border-radius:10px;border:1px solid #00aeff;box-shadow:0px 0px 0.3rem #00aeff;"}

你可以隨意的透過挑選圖標、顏色來自定義你的 OONI Run 連結。並完成頁面中必要的資料欄位填寫。

<center>
    <img width="80%" src="https://assets.anoni.net/docs/ooni-run-v2-4.png"
         title="填寫標題、說明文字" alt="填寫標題、說明文字"
         style="border-radius:10px;border:1px solid #00aeff;box-shadow:0px 0px 0.3rem #00aeff;">
</center>

* **步驟 5.** 為你的 OONI Run 連結建立一個標題。你也可以選擇性地為你的標題增加翻譯。「標題」將會顯示在測試者安裝於其 OONI Probe 行動應用程式內的 OONI Run 連結卡片中。建議使用一個簡短且能清晰傳達測試類型的標題。在上述範例中，我們將標題設為「**匿名網路社群 anoni.net**」，因為我們希望在 OONI Run 連結中納入社群所建立的服務網站進行測試。
* **步驟 6.** 為你的 OONI Run 連結新增一個簡短的描述。你也可以選擇性地增加多語言的翻譯。在上述範例中，我們已指定計劃新增到 OONI Run 連結中的網站服務，並請求 OONI Probe 行動應用程式使用者進行測試。我們建議具體標明測試的平台或新增其他有用的內容，以鼓勵進行測試。
* **步驟 7.** 為你的 OONI Run 連結新增一個「較長的」描述。透過這樣的方式來詳細說明測試內容，以及為什麼這些測試很重要。你也可以選擇性地增加翻譯。

<center>
    <img width="80%" src="https://assets.anoni.net/docs/ooni-run-v2-5.png"
         title="新增到期日期、檢測網址" alt="新增到期日期、檢測網址"
         style="border-radius:10px;border:1px solid #00aeff;box-shadow:0px 0px 0.3rem #00aeff;">
</center>

* **步驟 8.** 為你的 OONI Run 連結新增一個到期日期（Expiration Date）。根據你希望 OONI Probe 使用者執行你的 OONI Run 連結的時間長度來決定到期日期。
* **步驟 9.** 點擊「Add URL+」來開始將網址加入你的 OONI Run 連結。在開始增加網址之前，請確保每個網址輸入正確。如果輸入錯誤，OONI Probe 將無法測試預期的網站，這可能會導致測試結果不準確。

    ??? warning "網址格式"

        有幾點需要注意：

        * 網站是使用 **HTTP** 還是 **HTTPS**？如果是後者，請在 `http` 後加一個 `s`。
        * 網域是否包含 `www`？如果有，請一併加上。
        * 如果網站是使用 HTTPS（例如：`https://www.hrw.org/`），你不需要指定網頁（例如：`https://www.hrw.org/publications`），因為當網站使用 HTTPS 託管時，網際網路服務提供商（ISP）通常無法只封鎖特定網頁。他們必須封鎖整個網站的存取。

        為了確保每個網址輸入正確，**請從瀏覽器中複製貼上**。

        建議可以**在文字編輯器中建立一個網站清單**，將每個網址分別寫在單獨一行。不需要用逗號或其他方式分隔網址。全選複製所有內容後，在第一個網址欄位貼上，表格會自動處理協助分別、分開、依序貼到多個欄位中。

* **步驟 11.** 點擊「**Create link**」按鈕，來建立你的 OONI Run 連結。將看到 OONI Run 連結頁面，其中包括你新增的標題和描述、連結的到期日期，以及你新增的待測試網址清單。

<center>
    <img src="https://assets.anoni.net/docs/ooni-run-v2-6.png"
         title="新增到期日期、檢測網址" alt="新增到期日期、檢測網址"
         style="border-radius:10px;border:1px solid #00aeff;box-shadow:0px 0px 0.3rem #00aeff;">
</center>

* **步驟 12.** 如果你想編輯你的 OONI Run 連結，請點擊右上角的「Edit」按鈕。或者，點擊連結到期日期旁的「**Update Now**」按鈕。這兩種操作都能讓你編輯你的 OONI Run 連結中的資料。
* **步驟 13.** 要**分享**你的 OONI Run 連結，在「**Share this link**」部分，點擊你的 OONI Run 連結旁的「**:material-content-copy: 複製圖標**」。然後將複製的連結分享給你想要進行測試的 OONI Probe 使用者。

### 使用連結

![分享、安裝頁面](https://assets.anoni.net/docs/ooni-run-v2-7.png){style="border-radius:10px;border:1px solid #00aeff;box-shadow:0px 0px 0.3rem #00aeff;"}

在建立頁面完成後取得的 <https://run.ooni.org/v2/10238>{target="_blank"} 連結，可以直接透過分享給協助者，透過連結可以帶到一個簡單的介紹頁面，如果檢測者沒有安裝 OONI Probe，頁面的連結也會協助他們前往應用程式商店下載、安裝。

對於有安裝 OONI Probe 的協助者，則會開啟 OONI Probe 應用程式，進入到詢問是否加入此檢測項目的徵詢流程，按下「Install Link」確認安裝。在安裝前，請確認此檢測名單的建立者是否正確無誤。

<center>
    <img width="50%" src="https://assets.anoni.net/docs/ooni-run-v2-m1.png"
         title="行動裝置安全檢測名單" alt="行動裝置安全檢測名單"
         style="border-radius:10px;border:1px solid #00aeff;box-shadow:0px 0px 0.3rem #00aeff;">
</center>

透過 OONI Probe 安裝完成後，在「儀表板」列表中可以找到標題為「**匿名網路社群 anoni.net**」的檢測卡片。進入卡片後可以按下上方「**執行 :material-timer-outline:**」的按鈕後，畫面移動到最下方按下「**Run 1 tests**」的按鈕開啟執行檢測。

<center>
    <img width="50%" src="https://assets.anoni.net/docs/ooni-run-v2-m2.png"
         title="執行檢測卡片" alt="執行檢測卡片"
         style="border-radius:10px;border:1px solid #00aeff;box-shadow:0px 0px 0.3rem #00aeff;">
</center>

## 觀察資料

所有的檢測資料最後都會上傳到 OONI 的公開資料庫中，在 [OONI Explorer](https://explorer.ooni.org/zh-Hant/chart/mat?test_name=web_connectivity&axis_x=measurement_start_day&since=2025-09-01&until=2025-10-16&time_grain=day&ooni_run_link_id=10238){target="_blank"} 的搜尋介面中，可以直接在「OONI Run Link ID」欄位輸入分享連結的編號，例如範例為 `https://run.ooni.org/v2/10238`，其編碼為 `10238`，就可以輸入此編碼搜尋協助者的檢測結果。

<center>
    <img src="https://assets.anoni.net/docs/ooni-run-v2-8.png"
         title="透過 OONI Explorer 檢視資料" alt="透過 OONI Explorer 檢視資料"
         style="border-radius:10px;border:1px solid #00aeff;box-shadow:0px 0px 0.3rem #00aeff;">
</center>

可以透過圖表上的「[檢視測量資料 >](https://explorer.ooni.org/search?since=2025-09-15&until=2026-04-16&test_name=web_connectivity&failure=true&ooni_run_link_id=10238){target="_blank"}」，輸入 `10238` 後看到每一筆檢測結果的詳細資料。

<center>
    <img src="https://assets.anoni.net/docs/ooni-run-v2-9.png"
         title="或透過其他介面檢視詳細資料" alt="或透過其他介面檢視詳細資料"
         style="border-radius:10px;border:1px solid #00aeff;box-shadow:0px 0px 0.3rem #00aeff;">
</center>

## 常見問題

??? warning "使用時，需注意的風險。"

    使用 OONI Probe 檢測網路監控狀況時，可能會面臨以下風險：

    1. **法律風險**：某些國家或地區可能將使用此類工具視為非法活動。因此，在使用前請了解當地法律規範。
    2. **隱私風險**：進行測試可能會引起網路服務供應商（ISP）或其他監控機構的注意，進而影響使用者隱私。使用者應注意其數據資料的保護和匿名性。
    3. **被標記風險**：長期使用此工具可能導致 IP 地址被監控系統紀錄，從而可能影響網路連線的穩定性或速度。

    為了降低這些風險，使用者斟酌衡量並保護個人隱私，在確保安全和所在地區的法律合規的前提下進行操作。

??? question "名單更新後，需要重新發佈嗎？"

    當更新名單後，之前已經安裝的使用者不需要重新安裝，在開啟 OONI Probe 應用程式的時候會檢查 OONI Run 的名單並完成更新。

??? question "可以開著 VPN 執行 OONI Probe 嗎？"

    不建議在開啟 VPN 的情況下執行 OONI Probe。這是因為在使用 VPN 執行測試時，所測量的將不再是您本地的網路環境，而是 VPN 提供者的網路。如要捕捉當地使用者的網路審查情況，您需要在執行 OONI Probe 測試前關閉 VPN 或其他翻牆軟體。

??? question "如果檢測出來發現網站有問題，我還可以做什麼？"

    如果你透過 OONI Probe 檢測發現網站有問題，可以採取以下步驟：

    1. 確認問題：使用 [OONI Explorer](https://explorer.ooni.org/zh-Hant){target="_blank"} 進一步調查，查詢具體的測量結果，了解該網站是否已被確認封鎖或出現異常情況。
    2. 分析結果：根據測量結果分析問題類型，看是否是暫時性的網路問題或是內容審查所導致。
    3. 分享測試結果：考慮將你的測試結果分享給 [OONI 社群](https://slack.ooni.org/){target="_blank"}和[其他](../about/index.md){target="_blank"}關注**網路自由**的組織，幫助更多人了解問題的範圍和嚴重性。
    4. 報告問題：若確認為網路封鎖，你可以向相關監督機關或法律顧問反映問題，探索進一步的合法行動。
    5. 嘗試解決方法：如果你需要訪問該網站，可嘗試透過 VPN 換區域、Tor 瀏覽或其他繞過審查的方法來解決訪問限制問題。

<div class="grid cards" markdown>

- [:fontawesome-regular-circle-question: 網路自由為什麼重要？](../internet-freedom-matter.md)
- [:fontawesome-regular-circle-question: 什麼是 OONI？](../what-is-ooni.md)
- [:fontawesome-regular-circle-question: 什麼是 Tor？](../what-is-tor.md)
- [:fontawesome-regular-circle-question: 什麼是 Tails？](../what-is-tails.md)

</div>
