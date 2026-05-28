---
title: Tor Snowflake
description: 開瀏覽器分頁，協助受審查地區的 Tor 使用者連線。在台灣門檻最低的網路自由貢獻方式。
icon: material/snowflake
---
# :material-snowflake: Tor Snowflake 橋接點（網頁版）

打開瀏覽器分頁，幫世界上連不上 Tor 的人連上 Tor 網路。不需要安裝、不需要伺服器，分頁開著就在運作。

## 為什麼要開 Snowflake

在伊朗、緬甸、白俄羅斯這類嚴重審查地區，Tor 的入口節點長期被偵測與封鎖。當地使用者要連上 Tor，需要透過外部志工提供的「橋接點」繞過。Snowflake 把你的瀏覽器變成一個臨時橋接點，受審查地區的 Tor 使用者透過你的瀏覽器連上 Tor 網路。可參考 [InterSecLab 中國防火長城資料外洩研究](../reports/interseclab-network-coup/index_7.md) 與 [2025 年 10 月國際網路自由觀察](../blog/posts/internetfreedom-oct2025.md) 了解全球審查現況。

對在台灣的我們，這是門檻最低的網路自由貢獻方式：

- 對外連線受審查程度低、頻寬充足，是合適的橋接點來源國家。
- 比起架 [Tor Relay](../community/setup-tor-relay.md) 需要的伺服器、頻寬、運維成本，Snowflake 只需要一個分頁。
- 適合白天電腦長開、放著分頁背景跑的工作者。

對於有興趣投入更多的人，下一步可以參考 [Tor Relay 校園建立](../community/relay-on-campus.md)。

## 啟動瀏覽器版橋接點

<div class="grid cards" markdown>

-   <iframe src="https://snowflake.torproject.org/embed.html" width="100%" height="250" frameborder="0" scrolling="no"></iframe>

-   
    - 點擊 widget 中的「ON」按鈕。
    - 此分頁可以放在背景跑，不會影響其他工作。
    - 啟動後 widget 會顯示是否有人正在透過你連線。
    - 關閉分頁就停止運作，沒有殘留設定。

</div>

??? note "看不到 widget 或 ON 按下去沒反應"

    - 確認瀏覽器允許 WebRTC 功能。多數瀏覽器預設開啟，企業或學校網路可能阻擋。
    - 嘗試切換到沒有強制 captive portal 的網路（家用、行動網路）。
    - 改用瀏覽器擴充套件版本（見下一段）。

## 進階：用瀏覽器擴充套件

如果你的電腦長時間開著，建議改用擴充套件版本：

- 開機自動啟動，不必保留分頁。
- 流量上限、是否啟用都可在設定中調整。
- 安裝後直接執行，不影響其他瀏覽行為。

<div class="grid cards" markdown>

- [:material-firefox: Firefox 擴充套件](https://addons.mozilla.org/zh-TW/firefox/addon/torproject-snowflake/){target="_blank"}
- [:material-google-chrome: Chrome 擴充套件](https://chrome.google.com/webstore/detail/snowflake/mafpmfcccpbjnhfhjnllmmalhifmlcie){target="_blank"}
- [:material-web: 官方頁面](https://snowflake.torproject.org/zh-TW/){target="_blank"}

</div>

## 你應該知道的事

啟動 Snowflake 之前，了解以下幾點會更安心：

- **不會洩漏你的真實 IP 給最終使用者**。受審查地區的 Tor 使用者透過你連線後，他們的網路請求會經過 Tor 多層加密，最後從 Tor 出口節點離開。對外網站看到的是出口節點，不是你的 IP。
- **你不會看到別人在做什麼**。流量在你的瀏覽器中只是被中繼，內容已被 Tor 加密，無法解讀。
- **你的 IP 不會被公開列為固定橋接**。Snowflake 採用短暫配對機制，跟傳統 Tor Bridge 的公開列表不同，IP 流動性高。
- **頻寬影響很小**。預設值對日常瀏覽幾乎無感。擴充套件可以調整流量上限。
- **企業或校園網路請先確認政策**。在公司或學校網路啟動 Snowflake，等於把該網路的 IP 用來轉發第三方流量。資訊政策嚴格的環境（金融、政府、研究單位）建議先問過資訊部門。

## 常見問題

??? question "開著要多久才有用？"

    沒有最低時數要求，任何時間打開都會被分配連線。不過短暫開關幾次的效益遠不如連續開幾小時，建議在工作時段把分頁放在背景。

??? question "我自己也用 Tor，開 Snowflake 會混淆我自己的流量嗎？"

    不會。Snowflake 是「出」，把你的瀏覽器變成橋接點轉發別人的流量。Tor Browser 是「入」，你連上 Tor 網路。兩者在你的電腦上是各自獨立的程序，不互相影響。

??? question "手機可以開嗎？"

    可以，但效果有限。手機網路常變動 IP，App 進入背景後系統會中斷 WebRTC 連線。長時間貢獻建議用桌面或筆電。

??? question "跟架 Tor Relay 比，貢獻有差嗎？"

    兩者貢獻量級與架設門檻都差很多。Tor Relay 提供穩定中繼，需要公網 IP 與長時間運轉的伺服器。Snowflake 提供短暫橋接，分頁開著就在運作，門檻最低。如果你有穩定上行頻寬與運維能力，Relay 的貢獻量級更大，可參考 [如何搭建 Tor Relay](../community/setup-tor-relay.md)。如果是一般瀏覽用網路，從 Snowflake 開始是合適的入門。

??? question "VPN 開著可以同時跑 Snowflake 嗎？"

    技術上可以，但流量會經過 VPN 業者，對 Tor 的橋接其實是 VPN 的 IP 與 ASN，不是你本地的網路。如果想保護自己的 Snowflake IP 不被觀察，VPN 是合理選擇。如果要貢獻台灣的 ASN 多樣性與頻寬，建議用本地連線直接跑。

??? question "我家是 IPv6-only 或 CGNAT，可以跑嗎？"

    Snowflake 走 WebRTC 並使用 STUN/TURN 穿透，多數家用 NAT 環境可以正常運作。CGNAT 環境穿透成功率較低但不會完全失敗。IPv6-only 目前 Snowflake 端有部分相容性限制，可參考 [Snowflake 官方頁面](https://snowflake.torproject.org/zh-TW/){target="_blank"} 的最新狀態。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-chat-question: 網路自由為什麼重要](../basics/internet-freedom.md)
- [:material-chat-question: 什麼是 Tor](./what-is-tor.md)
- [:material-chat-question: 什麼是匿名網路](./what-is-anonymity-network.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-tunnel-outline: 如何搭建 Tor WebTunnel 橋接](../community/setup-tor-webtunnel.md)
- [:material-server-network: 如何搭建 Tor Relay](../community/setup-tor-relay.md)
- [:material-school-outline: Tor Relay 校園建立](../community/relay-on-campus.md)
- [:material-translate-variant: 中文化與文件翻譯](../community/i18n.md)

</div>
