---
title: 什麼是 OONI
description: OONI 是讓網路審查可被觀測的開放工具與資料集。在台灣可以用它把「連不上」、「跑很慢」這些個人感受，變成有時間、地點、ASN 對得上的公開觀測紀錄。
icon: material/access-point-network
---

# :material-access-point-network: 什麼是 OONI

連不上某個網站時，第一個直覺通常是「是我網路有問題嗎？」OONI（Open Observatory of Network Interference，網路干擾開放觀測）就是為了把這種感受轉成可驗證的資料。它提供開源檢測工具 [OONI Probe](https://ooni.org/install/){target="_blank"} 與公開資料平台 [OONI Explorer](https://explorer.ooni.org/zh-Hant){target="_blank"}，讓任何人都能跑檢測、查紀錄，把封鎖、監控、降速這些行為留下時間、地點、ASN 都對得上的觀測痕跡。

對在台灣的我們，OONI 的核心價值在於讓討論能以資料為基礎。某個網站連不上，不必停在「是不是被封鎖了」的猜測，OONI 能留下時間、地點、ASN 都對得上的紀錄，讓社群、媒體、研究者佐證一次連線異常時有可引用、可重現的依據。也因此，[ASN 觀測涵蓋率](../taiwan/ooni-asn-coverage.md) 在台灣才會是個值得長期關注的議題，觀測點越多元，這份紀錄的代表性就越強。

## OONI 計畫主要推動事項

OONI 的工作可以拆成四塊。核心是 [OONI Probe](https://ooni.org/install/ "前往下載。"){target="_blank"} 這個檢測應用程式，用來檢查特定網站或線上服務是否被封鎖。跑出來的結果會[公開成資料集](https://ooni.org/data/){target="_blank"}，任何人都能[線上查閱與分析](https://explorer.ooni.org/zh-Hant "線上查閱觀測資料。"){target="_blank"}，了解[各地網路](https://explorer.ooni.org/zh-Hant/countries "各國家目前觀測資料的數量。"){target="_blank"}的審查狀況。OONI 同時跟研究人員、倡議者合作，分析這些資料、追蹤全球與區域網路干擾的[趨勢與影響](https://ooni.org/post/){target="_blank"}，也跟[各地組織](https://ooni.org/partners/){target="_blank"}與在地社群合作，把檢測能力鋪到更多網路角落。

參與 OONI 的檢測活動，等於把你這條網路的觀測資料留進公開資料集。當其他人需要佐證封鎖事件、追跨境差異、或對照不同 ASN 的狀況時，會有更多元的紀錄可以引用。

## 如何運作？

<figure markdown="span">
    <a href="../../assets/images/how-ooni-works.svg">
        <img src="../../assets/images/how-ooni-works.svg"
            alt="OONI 如何運作，透過比對網頁呈現來推測是否內容被干預"
            title="OONI 如何運作，透過比對網頁呈現來推測是否內容被干預"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 0%);">
    </a>
</figure>

- **Probe：**為 OONI 檢測觀察程式。
- **Censor：**為資訊傳輸過程中的監控者，可能為公司 IT 網路、電信公司、國家等級的網路架構。網路干預可透過以下方式進行，但其結果與目的都是阻止檢視網站內容。
    1. DNS 篡改（DNS tampering、DNS 異常）：把網址解析導到錯誤位址，讓你連到假網站或直接連不上。
    2. IP 封鎖（TCP/IP 異常）：直接擋掉目標伺服器的 IP，封包送不到。
    3. HTTP 封鎖（HTTP blocking）：在網頁連線層攔截，常見是跳出一頁封鎖告示。
    4. 基於 TLS 的干擾：在加密連線剛要建立（TLS 握手）時把它切斷，例如 ClientHello 訊息後出現連線重置或連線逾時（timeout）。
- **Tor：**[洋蔥路由網路](https://zh.wikipedia.org/zh-tw/%E6%B4%8B%E8%91%B1%E8%B7%AF%E7%94%B1 "前往 Wiki 了解更多！"){target="_blank"}，將連線請求透過三層節點的轉介傳送取得資訊。
- **Helper：**檢測目標對象，可能為網站、通訊軟體連線、VPN 連線、連線效能等。

在臺灣比較熟悉與類似的阻擋行為與技術如中華電信提供的「[色情守門員](https://hicare.hinet.net/CHT/hicare/){target="_blank"}」、透過 DNS 阻擋廣告、惡意網站的 [AdGuard](https://adguard.com/zh_tw/welcome.html){target="_blank"}、[Pi-Hole](https://pi-hole.net/){target="_blank"}。 或是數位發展部與財團法人臺灣網路資訊中心（TWNIC）進行網域阻擋的[打擊詐騙方式](https://moda.gov.tw/press/press-releases/6303){target="_blank"}，都可算是阻擋網頁瀏覽。

!!! question "我們所處的網路是否真的自由？"

    以上舉例通常都是針對惡意網站、網路廣告、釣魚詐騙來進行善意阻擋（如：[DNS RPZ](https://blog.twnic.tw/2020/09/23/15311/){target="_blank"}），但如果是刻意阻擋某些內容呢？或是來自某些未被觀察紀錄到 ASNs 的阻擋行為？**雖然目前觀測的資料都無大規模阻擋**，但因為觀測資料多樣性不足，都只集中在中華電信（[AS3462](https://radar.cloudflare.com/zh-tw/as3462){target="_blank"}）的[觀測資料](https://explorer.ooni.org/chart/mat?probe_cc=TW&since=2024-10-01&until=2024-12-31&time_grain=month&axis_x=measurement_start_day&axis_y=probe_asn&test_name=web_connectivity){target="_blank"}，因此在「各區域觀察資料與 ASNs 涵蓋率」研究項目中會比對目前我們還有多少在 TW 的 ASNs 是未被觀測到的。

## OONI 適合做什麼、不適合做什麼

OONI 的定位跟 [Tor](./what-is-tor.md)、[Tails](./what-is-tails.md) 不一樣：Tor 與 Tails 給使用者保護自己用，OONI 給社群、媒體、研究者觀測網路環境用。動手前先回頭看 [威脅模型如何建立](../basics/threat-model.md) 有助於釐清需求是不是真的對得上 OONI 解決的問題。

**適合**：

- 佐證封鎖事件。某個網站某個時段在某個 ASN 連不上，OONI Probe 跑過會留下可引用的紀錄。
- 長期觀測單一地區的網路環境變化。把 OONI Probe 跑成 cronjob，幾個月下來能看到趨勢。
- 跨 ASN、跨地區比較。OONI Explorer 上不同 ASN 的觀測結果可以對照，找出哪一段網路有差異。
- 媒體、研究、倡議用途。需要外部可驗證的數據時，公開資料集是堅實的引用基礎。

**不適合**：

- 即時警報。OONI Explorer 上的資料透過 fastpath 接近即時，但仍不是給「現在這一秒網站連不上」做秒級告警用的。S3 原始資料集另有約一小時的批次延遲。
- 判斷單一裝置中毒或本地 DNS 設錯。OONI 看的是網路層的可及性，不是端點安全。
- 辨識深度封包檢測（DPI）行為的細節。OONI 觀察的是「結果」（連得上/連不上、回應內容是否異常），不是「過程」中的封包細節。
- 取代 Tor 或 VPN。OONI 不會把你的連線匿名化，它只是讓你知道網路有沒有在干預。

OONI Probe 觀測程式提供[行動裝置版本](https://ooni.org/install/){target="_blank"}（Android, iOS）、[桌面版本](https://ooni.org/install/){target="_blank"}（Windows 64bit, macOS）、或是無任何桌面介面的[終端程式版本](https://ooni.org/install/cli){target="_blank"}。

<figure markdown="span">
    <a href="../../assets/images/ooni_screen_desktop.png">
        <img src="../../assets/images/ooni_screen_desktop.png"
            alt="OONI 桌面程式操作頁面"
            title="OONI 桌面程式操作頁面"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 50%);width:75%;">
    </a>
</figure>

終端機介面可以使用 `ooniprobe run` 執行所有檢測項目。或是設定 `cronjob`（Linux 上的排程工具，讓指令定時自動執行）在空閒時間跑觀察檢測。

``` bash
# 在第 4、10 和 22 小時的第 10 分鐘執行。
10 4,10,22 * * * ooniprobe run > /dev/null 2>&1 &
```

!!! warning "自動執行"

    `ooniprobe autorun` 指令目前僅在 macOS 有效。在 Debian/Ubuntu Linux 上安裝 CLI 後，背景定期測試預設就會啟用，不必另設 cronjob。上面的 cronjob 範例適用於沒有自動執行的環境。

## OONI Explorer 觀測資料

<figure markdown="span">
    <a href="../../assets/images/ooni_explorer.png">
        <img src="../../assets/images/ooni_explorer.png"
            alt="OONI Explore 觀測資料網站（延遲一小時）"
            title="OONI Explore 觀測資料網站（延遲一小時）"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 50%);width:75%;">
    </a>
</figure>

檢測到的觀察資料會即時回傳到 OONI 的資料庫，可透過 [OONI Explorer](https://explorer.ooni.org/zh-Hant/chart/mat?probe_cc=TW&since=2024-10-01&until=2025-01-01&time_grain=day&axis_x=measurement_start_day&test_name=web_connectivity){target="_blank"} 線上分析各個區域的狀況及不同檢測項目的結果。此外，也可以直接存取 [S3 儲存空間（Registry of Open Data on AWS）](https://registry.opendata.aws/ooni/){target="_blank"}，下載延遲一小時的原始觀測資料，以便進行更深入的交叉分析。可根據分析議題需求選擇即時查閱或下載詳細資料進行進一步研究。

!!! info "觀察 AS 資料"

    可將「縱軸」項目選成 ASN 篩選分離各 ASN 觀測資料狀況。

    <figure markdown="span">
        <a href="../../assets/images/ooni_explorer_asn.png">
            <img src="../../assets/images/ooni_explorer_asn.png"
                alt="OONI Explore 可將「縱軸」項目選成 ASN 篩選分離各 ASN 觀測資料狀況。"
                title="OONI Explore 可將「縱軸」項目選成 ASN 篩選分離各 ASN 觀測資料狀況。"
                style="border-radius: 10px;border:1px solid hsl(0, 0%, 50%);width:80%;">
        </a>
    </figure>

## 常見問題

??? question "我在家裡跑 OONI Probe，會不會被 ISP 標記？"

    OONI Probe 的測試行為（連到一份公開的測試清單上的網站、記錄回應）跟一般使用者瀏覽網頁差別不大，台灣目前沒有任何 ISP 因為跑 OONI 而封鎖或警告使用者的案例。如果擔心，預設清單（[Test List](https://github.com/citizenlab/test-lists){target="_blank"}）排除了多數高敏感類型的網站，可以放心。在審查嚴格的國家（如中國、伊朗）情況不同，OONI 官方文件有額外的風險說明。

??? question "OONI 檢測會不會誤判？"

    會。OONI 看到的是「連線結果與一般情況不同」，不會自動斷定原因。常見誤判來源：對方網站本身故障、CDN 負載平衡造成 IP 變動、本地 DNS 設定錯誤、企業/校園網路的合規過濾。OONI Explorer 把判斷邏輯（DNS、TCP、TLS、HTTP 各層的觀察結果）公開，誤判可以被追查與修正。要做嚴謹結論前，建議交叉比對多個 ASN、多個時段的紀錄。

??? question "TWNIC 的 DNS RPZ 阻擋詐騙網站，OONI 算這是審查嗎？"

    OONI 的角色是觀測與記錄，不是判定。它會把「在這個 ASN、這個時段、這個網站 DNS 解析異常」如實寫下來。是不是「審查」、是不是「合理」要靠人去詮釋。TWNIC 的詐騙網站封鎖在 OONI 資料裡會呈現為 DNS 異常，但不會被自動標記成審查。這也是為什麼觀測資料的價值在於「公開、可重現」，而不是「誰說了算」。

??? question "可以同時跑 OONI Probe 跟 Tor 嗎？"

    可以，但要分清楚目的。OONI Probe 是觀測工具，跑檢測時走的是你本地的 ISP 連線（這樣才能觀測到當地的網路環境）。如果讓 OONI 走 Tor，觀測到的是 Tor 出口節點的網路環境，不是你本地的，失去意義。Tor Browser 與 OONI Probe 在同一台電腦上可以共存，各跑各的。

??? question "我在台灣，最簡單的貢獻方式是什麼？"

    手機裝 [OONI Probe](https://ooni.org/install/){target="_blank"}，每天讓它跑一次自動檢測就是有效貢獻。如果家裡有 Linux 主機，照本文「如何安裝」段的 cronjob 範例設定，就能持續累積。想再進一步可以參考 [OONI 網站檢測清單](../taiwan/ooni-checklist.md) 補充本地關注的網站，或讀 [ASN 觀測涵蓋率](../taiwan/ooni-asn-coverage.md) 了解哪些 ASN 還缺觀測點。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-chat-question: 威脅模型如何建立](../basics/threat-model.md)
- [:material-chat-question: 網路自由為什麼重要](../basics/internet-freedom.md)
- [:material-chat-question: 什麼是匿名網路](./what-is-anonymity-network.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-list-status: OONI 網站檢測清單](../taiwan/ooni-checklist.md)
- [:material-access-point-network: ASNs 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md)
- [:material-server-network: Tor Relay 觀測點](../taiwan/tor-relay-watcher.md)

</div>
