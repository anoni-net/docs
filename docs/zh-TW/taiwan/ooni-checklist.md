---
title: OONI 網站檢測清單
description: OONI Probe 在台灣使用的網站檢測清單怎麼維護，以及社群如何協助分類與更新。
icon: material/list-status
---
# :material-list-status: OONI 網站檢測清單

<figure markdown="span">
    <a target="_blank"
       href="../../assets/images/ooni_asn.svg">
        <img src="../../assets/images/ooni_asn.svg"
            alt="OONI Probe 檢測流程"
            title="OONI Probe 檢測流程"
        >
    </a>
    <caption>OONI Probe 檢測流程</caption>
</figure>

在使用 OONI Probe 進行「網站」檢測時，檢測程式會根據事先列舉的「網站清單」逐一檢測。而這裡所提及的「網站清單」實際上是透過 [Citizen Lab](https://citizenlab.ca/){target="_blank"} 所維護的 [test-lists](https://github.com/citizenlab/test-lists){target="_blank"} 專案，分別收錄本地（local）、全球（global）熱門的網站網址。

全球（global）名單上的大多數網站以英語呈現。而本地名單則由地區提供，內容涵蓋當地和地區層級的多種分類，並使用當地語言。在有網際網路審查的國家，本地清單還包括了許多已被封鎖的網站。

名單收錄標準大致上可廣泛的分為四大類：

1. **政治：**主要關注於那些表達與現任政府持不同立場的網站。與人權、言論自由、少數族裔權利和宗教運動更廣泛相關的內容也被納入考量。
2. **社會：**包括與性別、賭博、非法藥物和酒精相關，以及其他可能在社會上被視為敏感或具冒犯性的話題。
3. **衝突、安全：**包括與武裝衝突、邊界爭議、分裂運動和激進團體相關的內容。
4. **網際網路工具：**提供電子郵件、雲端空間、搜尋、翻譯、網路電話（VoIP）服務和規避審查方法的網站被歸類在這一類別中。

## 臺灣觀察名單現況

目前臺灣的名單 [tw.csv](https://github.com/citizenlab/test-lists/blob/master/lists/tw.csv){target="_blank" } 大部分在 2017 年新增建立的，但由於後續沒有持續維護的關係，目前名單上有滿多網站已經結束或已更換品牌網址、舊網址無效或 `http://` 開頭⋯等問題，勢必需要先整理目前的名單內容。

!!! note "http:// → https://"

    有些網站不會自動將 `http://` 開頭的傳輸協定透過轉址方式（如：[`301 Moved Permanently`](https://developer.mozilla.org/zh-TW/docs/Web/HTTP/Status/301){target="_blank"}、[`308 Permanent Redirect`](https://developer.mozilla.org/zh-TW/docs/Web/HTTP/Status/308){target="_blank"}）到 `https://` 而造成檢測錯誤。而目前在申請 TLS/SSL 憑證門檻降低與加密傳輸過程為基本網站建構的條件下，`https://` 應為預設的輸入網址格式。

## 名單更新

如同現況的問題，我們第一步需要逐一檢查目前在 [tw.csv](https://github.com/citizenlab/test-lists/blob/master/lists/tw.csv){target="_blank"} 上所列舉的網站的狀況，標記：需更新或可棄用。再提交一份 [Pull Request](https://gitbook.tw/chapters/github/pull-request){target="_blank"} 到 [citizenlab/test-lists](https://github.com/citizenlab/test-lists){target="_blank"} 請求更新。

!!! info "PR #1444"

    在 2023/09/28 [已提交](https://github.com/citizenlab/test-lists/pull/1444){target="_blank"}過一份檢測名單修正，但因為後續無持續更新進度，預計在 2025 將重新提交一份修正與正確的調整方式。

## 名單新增

如同名單於 2017 年所建立，已有約 8 年無作修正與調整，需要再透過審視目前也需要加入檢測的網站清單。

!!! warning "後續規劃"

    如何新增與募集挑選這部份還需要規劃後進行，預計在 2025/Q2、待名單初步修正後再來規劃「新增」的項目。

## :fontawesome-solid-diagram-project: 下一步

<div class="grid cards" markdown>

- [:material-chat-question: 什麼是 OONI？](../tools/what-is-ooni.md)
- [:material-chat-question: 網路自由為什麼重要](../basics/internet-freedom.md)
- [:octicons-mark-github-24: 專案研究預先準備](../community/setup-repo.md)

</div>
