---
title: 什麼是 OONI？
description: OONI，全名為「Open Observatory of Network Interference」（網路干擾開放觀測），是一項全球性倡議，主要目標是監測和報告網路審查及干擾情況。
icon: material/chat-question

---
# :material-chat-question: 什麼是 OONI？

OONI，全名為「Open Observatory of Network Interference」（網路干擾開放觀測），是一項全球性倡議，主要目標是監測和報告網路審查及干擾情況。OONI 透過提供開放原始碼的工具與收集網路測試數據資料，協助使用者識別是否存在網際網路封鎖、監控或降速等現象，並提供即時與公開的網路審查觀測資料分析。

## OONI 計畫主要推動事項

1. **測試網路審查：**[OONI Probe](https://ooni.org/install/ "前往下載。"){target="_blank"} 用於測試網站或網路可訪問性的應用程式，使用者可以使用它來檢查特定網站或線上服務是否被封鎖。
2. **開放資料：**OONI 將收集到的檢測數據[資料公開](https://ooni.org/data/){target="_blank"}，提供自由開放的[查閱與分析](https://explorer.ooni.org/zh-Hant "線上查閱觀測資料。"){target="_blank"}，提高對[全球網路](https://explorer.ooni.org/zh-Hant/countries "各國家目前觀測資料的數量。"){target="_blank"}審查狀況的認知。
3. **倡議與研究：**通過分析檢測數據資料，OONI 與研究人員和倡議者合作，共同關注全球及區域性網路干擾的[趨勢與影響](https://ooni.org/post/){target="_blank"}。
4. **在地社群合作：**OONI 與[其他組織](https://ooni.org/partners/){target="_blank"}、在地社群與專案合作，以增強檢測技術能力，推進網路開放及無障礙訪問的目標。

參與 OONI 的檢測活動，使用者能夠幫助提高對全球網路開放性的認識，並支持促進數位資訊自由流通的努力。

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
    1. DNS 篡改（DNS tampering、DNS 異常）
    2. IP 封鎖（DNS tampering、TCP/IP 異常）
    3. HTTP 封鎖（HTTP blocking、例如：封鎖頁面）
    4. 基於 TLS 的干擾（例如在 TLS 握手期間的 ClientHello 訊息後觀察到的連線重置）
- **Tor：**[洋蔥路由網路](https://zh.wikipedia.org/zh-tw/%E6%B4%8B%E8%91%B1%E8%B7%AF%E7%94%B1 "前往 Wiki 了解更多！"){target="_blank"}，將連線請求透過三層節點的轉介傳送取得資訊。
- **Helper：**檢測目標對象，可能為：網站、通訊軟體連線、VPN 連線、連線效能⋯等。

在臺灣比較熟悉與類似的阻擋行為與技術如中華電信提供的「[色情守門員](https://hicare.hinet.net/CHT/hicare/){target="_blank"}」、透過 DNS 阻擋廣告、惡意網站的 [AdGuard](https://adguard.com/zh_tw/welcome.html){target="_blank"}、[Pi-Hole](https://pi-hole.net/){target="_blank"}。 或是數位發展部與財團法人臺灣網路資訊中心（TWNIC）進行網域阻擋的[打擊詐騙方式](https://moda.gov.tw/press/press-releases/6303){target="_blank"}，都可算是阻擋網頁瀏覽。

!!! question "我們所處的網路是否真的自由？"

    以上舉例通常都是針對惡意網站、網路廣告、釣魚詐騙來進行善意阻擋（如：[DNS RPZ](https://blog.twnic.tw/2020/09/23/15311/){target="_blank"}），但如果是刻意阻擋某些內容呢？或是來自某些未被觀察紀錄到 ASNs 的阻擋行為？**雖然目前觀測的資料都無大規模阻擋**，但因為觀測資料多樣性不足，都只集中在中華電信（[AS3462](https://radar.cloudflare.com/zh-tw/as3462){target="_blank"}）的[觀測資料](https://explorer.ooni.org/chart/mat?probe_cc=TW&since=2024-10-01&until=2024-12-31&time_grain=month&axis_x=measurement_start_day&axis_y=probe_asn&test_name=web_connectivity){target="_blank"}，因此在「各區域觀察資料與 ASNs 涵蓋率」研究項目中會比對目前我們還有多少在 TW 的 ASNs 是未被觀測到的。

## 如何安裝 OONI Probe 觀測程式

OONI Probe 觀測程式提供[行動裝置版本](https://ooni.org/install/){target="_blank"}（Android, iOS）、[桌面版本](https://ooni.org/install/){target="_blank"}（Windows 64bit, macOS）、或是無任何桌面介面的[終端程式版本](https://ooni.org/install/cli){target="_blank"}。

<figure markdown="span">
    <a href="../../assets/images/ooni_screen_desktop.png">
        <img src="../../assets/images/ooni_screen_desktop.png"
            alt="OONI 桌面程式操作頁面"
            title="OONI 桌面程式操作頁面"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 50%);width:75%;">
    </a>
</figure>

終端機介面可以使用 `ooniprobe run` 執行所有檢測項目。或是設定 `cronjob` 在空閒時間跑觀察檢測。

``` bash
# 在第 4、10 和 22 小時的第 10 分鐘執行。
10 4,10,22 * * * ooniprobe run > /dev/null 2>&1 &
```

!!! warning "自動執行"

    目前 `ooniprobe autorun` 的指令還未實作完成，因此先使用 `cronjob` 方式定時檢測。

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

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-chat-question: 網路自由為什麼重要](../basics/internet-freedom.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-access-point-network: ASNs 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md)
- [:material-list-status: OONI 網站檢測清單](../taiwan/ooni-checklist.md)
- [:material-translate-variant: 中文化與文件翻譯](../community/i18n.md)

</div>
