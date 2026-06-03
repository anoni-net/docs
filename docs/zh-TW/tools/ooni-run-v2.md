---
title: OONI Run v2 操作說明
icon: material/help-network
description: 如何建立動態的 OONI Probe 檢測名單，協助觀察特定網站是否被審查或封鎖。
---

# :material-help-network: OONI Run v2 操作說明

![OONI RUN v2 Header](https://assets.anoni.net/docs/ooni-run-v2-header.png){.brand-frame}

你想追蹤一批網站是否被特定地區封鎖，但又無法親自到當地測試。OONI Run v2 的解法是：建立一個行動裝置連結、把要測的網站列進去、分享給當地協助者，協助者用 [OONI Probe](https://ooni.org/install/mobile){target="_blank"} 開啟連結就能跑測試，結果即時上傳到 [OONI](./what-is-ooni.md) 的公開資料庫。

[OONI Run](https://run.ooni.org/){target="_blank"} 是這個流程的入口。委內瑞拉、馬來西亞、印度等地的社群長期[用它做審查測量活動](https://ooni.org/support/ooni-censorship-measurement-campaigns#examples-of-ooni-censorship-measurement-campaigns){target="_blank"}，把當地的封鎖事件即時觀測下來。OONI 團隊在 2020 年根據[可用性研究](https://ooni.org/post/2020-06-09-ooni-run-usability-study-findings/){target="_blank"}的社群回饋推出 v2，連結變短、可動態更新、協助者已安裝過就會自動同步新加的網站，不用重發。測量結果可以直接在 [OONI Explorer](https://explorer.ooni.org/zh-Hant){target="_blank"} 用連結 ID 搜尋。

## OONI Run v2 適合誰

OONI Run 適合需要追蹤特定網站封鎖狀況的人：研究員針對個案做縱貫觀察、記者要為其他國家的封鎖事件取證、倡議者組織社群驅動的檢測活動。透過 OONI Run，你可以**分享一個行動裝置連結，讓協助者用 OONI Probe 測試你選定的網站是否被審查**，測試結果會即時上傳到 OONI 的公開資料庫。

跟 v1 比，v2 的連結更短、更容易分享，也可以自訂連結要呈現給協助者的資訊。建立連結後，登入 OONI Run v2 平台就能編輯，把你想加進來的網站直接更新到既有連結，**不必另發一條新連結**。協助者只要在 OONI Probe 行動 App 內安裝過你的連結，後續的更新會自動同步，連結內的網站也會持續被測試，覆蓋量會隨時間累積。所有測量結果即時公開在 OONI Explorer 上。

下面是建立、分享、使用、查看資料的完整流程。

## anoni.net 如何使用

社群維運的 OONI Run 連結 ID 是 `10328`，網址 [run.ooni.org/v2/10328](https://run.ooni.org/v2/10328){target="_blank"}，目前納入 anoni.net 的官網、Cryptpad、Etherpad、SearXNG、Send、Matrix 與 docs 站。協助者用 OONI Probe 安裝這條連結後，每次跑測試都會把這幾個自架服務的可達性回傳到 OONI 公開資料庫。對社群來說，這是長期確認「我們的服務在台灣不同電信商眼中還連得上」的低成本方式。

連結之外，[OONI 網站檢測清單](../taiwan/ooni-checklist.md) 整理了台灣脈絡下值得長期觀測的網站清單，配套的 [ASNs 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md) 把 OONI 全部結果按 ASN 切開，看不同電信商連到不同國際服務的狀況。如果你想協助跑這條連結的測試，行動裝置安裝 OONI Probe 後點上面的網址即可。

## 你應該知道的事

建立或分享 OONI Run 連結之前，了解以下幾點會更安心：

- **建立者的 email 會跟連結綁定**。OONI 用建立者的 email 作為協助者識別連結來源的依據，你的 email 會顯示在連結卡片上，後端也會儲存。
- **測試結果完全公開**。所有測量會出現在 [OONI Explorer](https://explorer.ooni.org/){target="_blank"}，含協助者所在的 ASN 與時間戳。OONI 不公開個人 IP，但 ASN 加時間已可推斷協助者大致位置。
- **不要隨便把連結傳給高審查地區的協助者**。運行 OONI Probe 在某些地區可能違法或引起 ISP 注意，當地是否能安全運行請先評估。
- **VPN、Tor 同時開不會得到「當地的」測試結果**。OONI 測量的是測試裝置實際走的網路，VPN 開著會測到 VPN 業者所在地的網路，不是協助者本地的封鎖狀況。
- **連結到期後資料仍保留**。OONI Run 連結是分發機制，到期後協助者就無法再加入測試，但已收集的測量資料留在 OONI 公開資料庫永久保存。

要更系統地評估這些風險，可參考 [威脅模型如何建立](../basics/threat-model.md)。

## 操作說明

### 建立和分享連結

要開始使用 OONI Run v2，請連結到 OONI Run 網站：<https://run.ooni.org/>{target="_blank"}

你可以透過以下步驟來建立和分享 OONI Run v2 連結。

![取得 Log in 連結](https://assets.anoni.net/docs/ooni-run-v2-1.png){.brand-frame}

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

![取得 Log in 連結](https://assets.anoni.net/docs/ooni-run-v2-2.png){.brand-frame}

你可以隨意的透過挑選圖標、顏色來自定義你的 OONI Run 連結。並完成頁面中必要的資料欄位填寫。

<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/docs/ooni-run-v2-4.png" alt="填寫標題、說明文字" style="width:80%">
</figure>

* **步驟 5.** 為你的 OONI Run 連結建立一個標題。你也可以選擇性地為你的標題增加翻譯。「標題」將會顯示在測試者安裝於其 OONI Probe 行動應用程式內的 OONI Run 連結卡片中。建議使用一個簡短且能清晰傳達測試類型的標題。在上述範例中，我們將標題設為「**匿名網路社群 anoni.net**」，因為我們希望在 OONI Run 連結中納入社群所建立的服務網站進行測試。
* **步驟 6.** 為你的 OONI Run 連結新增一個簡短的描述。你也可以選擇性地增加多語言的翻譯。在上述範例中，我們已指定計劃新增到 OONI Run 連結中的網站服務，並請求 OONI Probe 行動應用程式使用者進行測試。我們建議具體標明測試的平台或新增其他有用的內容，以鼓勵進行測試。
* **步驟 7.** 為你的 OONI Run 連結新增一個「較長的」描述。透過這樣的方式來詳細說明測試內容，以及為什麼這些測試很重要。你也可以選擇性地增加翻譯。

<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/docs/ooni-run-v2-5.png" alt="新增到期日期、檢測網址" style="width:80%">
</figure>

* **步驟 8.** 為你的 OONI Run 連結新增一個到期日期（Expiration Date）。根據你希望 OONI Probe 使用者執行你的 OONI Run 連結的時間長度來決定到期日期。
* **步驟 9.** 點擊「Add URL+」來開始將網址加入你的 OONI Run 連結。在開始增加網址之前，請確保每個網址輸入正確。如果輸入錯誤，OONI Probe 將無法測試預期的網站，這可能會導致測試結果不準確。

    ??? warning "網址格式"

        有幾點需要注意：

        * 網站是使用 **HTTP** 還是 **HTTPS**？如果是後者，請在 `http` 後加一個 `s`。
        * 網域是否包含 `www`？如果有，請一併加上。
        * 如果網站是使用 HTTPS（例如：`https://www.hrw.org/`），你不需要指定網頁（例如：`https://www.hrw.org/publications`），因為當網站使用 HTTPS 託管時，網際網路服務提供商（ISP）通常無法只封鎖特定網頁。他們必須封鎖整個網站的存取。

        為了確保每個網址輸入正確，**請從瀏覽器中複製貼上**。

        建議可以**在文字編輯器中建立一個網站清單**，將每個網址分別寫在單獨一行。不需要用逗號或其他方式分隔網址。全選複製所有內容後，在第一個網址欄位貼上，表格會自動處理協助分別、分開、依序貼到多個欄位中。

* **步驟 10.** 點擊「**Create link**」按鈕，來建立你的 OONI Run 連結。將看到 OONI Run 連結頁面，其中包括你新增的標題和描述、連結的到期日期，以及你新增的待測試網址清單。

<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/docs/ooni-run-v2-6.png" alt="建立完成的 OONI Run 連結頁面">
</figure>

* **步驟 11.** 如果你想編輯你的 OONI Run 連結，請點擊右上角的「Edit」按鈕。或者，點擊連結到期日期旁的「**Update Now**」按鈕。這兩種操作都能讓你編輯你的 OONI Run 連結中的資料。
* **步驟 12.** 要**分享**你的 OONI Run 連結，在「**Share this link**」部分，點擊你的 OONI Run 連結旁的「**:material-content-copy: 複製圖標**」。然後將複製的連結分享給你想要進行測試的 OONI Probe 使用者。

### 使用連結

![分享、安裝頁面](https://assets.anoni.net/docs/ooni-run-v2-7.png){.brand-frame}

在建立頁面完成後取得的 <https://run.ooni.org/v2/10328>{target="_blank"} 連結，可以直接透過分享給協助者，透過連結可以帶到一個簡單的介紹頁面，如果檢測者沒有安裝 OONI Probe，頁面的連結也會協助他們前往應用程式商店下載、安裝。

對於有安裝 OONI Probe 的協助者，則會開啟 OONI Probe 應用程式，進入到詢問是否加入此檢測項目的徵詢流程，按下「Install Link」確認安裝。在安裝前，請確認此檢測名單的建立者是否正確無誤。

<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/docs/ooni-run-v2-m1.png" alt="行動裝置上的 Install Link 徵詢畫面" style="width:50%">
</figure>

透過 OONI Probe 安裝完成後，在「儀表板」列表中可以找到標題為「**匿名網路社群 anoni.net**」的檢測卡片。進入卡片後可以按下上方「**執行 :material-timer-outline:**」的按鈕後，畫面移動到最下方按下「**Run 1 tests**」的按鈕開啟執行檢測。

<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/docs/ooni-run-v2-m2.png" alt="OONI Probe 儀表板上的檢測卡片與執行按鈕" style="width:50%">
</figure>

### 用 miniooni CLI 跑檢測

行動裝置之外，OONI 也有命令列版本 [miniooni](https://github.com/ooni/probe-cli){target="_blank"}，方便在伺服器、研究腳本或自動化環境跑檢測。把 OONI Run v2 連結餵給 CLI 有個容易踩到的雷，**不能直接把網頁版的網址丟給 `-i`**。

```bash
# 不會 work，CLI 拿到 HTML，JSON 解析就會失敗
miniooni oonirun -i https://run.ooni.org/v2/10328

# 正確用法，直接指向 API 的 descriptor JSON
miniooni oonirun -i https://api.ooni.org/api/v2/oonirun/links/10328
```

原因是 miniooni 的 `-i` 會把你給的網址當成 descriptor JSON 端點直接 GET，期望拿到 JSON 回來。`run.ooni.org/v2/<ID>` 是給瀏覽器看的網頁，回應是 HTML，CLI 解析就會失敗。實際的 descriptor 由 API 提供，網址格式為 `https://api.ooni.org/api/v2/oonirun/links/<LINK_ID>`，`<LINK_ID>` 直接從網頁網址末段取得（社群連結為 `10328`）。

桌面版與行動 App 不受這個限制影響，作業系統會把 `https://run.ooni.org/v2/<ID>` 交給 OONI Probe 自行處理。這個限制目前只影響 miniooni CLI，upstream 已有 [TODO 標註](https://github.com/ooni/probe-cli/blob/master/internal/oonirun/link.go){target="_blank"}，後續可能會補上自動轉換。

## 觀察資料

所有的檢測資料最後都會上傳到 OONI 的公開資料庫中，在 [OONI Explorer](https://explorer.ooni.org/zh-Hant/chart/mat?test_name=web_connectivity&axis_x=measurement_start_day&since=2025-09-01&until=2025-10-16&time_grain=day&ooni_run_link_id=10328){target="_blank"} 的搜尋介面中，可以直接在「OONI Run Link ID」欄位輸入分享連結的編號，例如範例為 `https://run.ooni.org/v2/10328`，其編碼為 `10328`，就可以輸入此編碼搜尋協助者的檢測結果。

<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/docs/ooni-run-v2-8.png" alt="OONI Explorer 用 OONI Run Link ID 搜尋的結果">
</figure>

可以透過圖表上的「[檢視測量資料 >](https://explorer.ooni.org/search?since=2025-09-15&until=2026-04-16&test_name=web_connectivity&failure=true&ooni_run_link_id=10328){target="_blank"}」，輸入 `10328` 後看到每一筆檢測結果的詳細資料。

<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/docs/ooni-run-v2-9.png" alt="OONI Explorer 列出每一筆檢測結果的詳細資料">
</figure>

## 常見問題

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

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-chat-question: 網路自由為什麼重要](../basics/internet-freedom.md)
- [:material-chat-question: 什麼是 OONI？](./what-is-ooni.md)
- [:material-chat-question: 什麼是 Tor？](./what-is-tor.md)
- [:material-snowflake: Tor Snowflake](./tor-snowflake.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-list-status: OONI 網站檢測清單](../taiwan/ooni-checklist.md)
- [:material-access-point-network: ASNs 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md)
- [:material-server-network: 如何搭建 Tor Relay](../community/setup-tor-relay.md)

</div>
