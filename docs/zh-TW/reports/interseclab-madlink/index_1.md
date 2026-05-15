---
title: 摘要與主要發現
description: MADLink / 台灣在 Geedge 供應鏈中的遺留 | InterSecLab
icon: material/arrow-right-bottom
---

# :material-file-outline: 摘要與主要發現

!!! note ""

    - 本篇報告翻譯自「[MADLink: A Taiwanese Vestige in the Geedge Supply Chain | InterSecLab](https://interseclab.org/research/madlink-a-taiwanese-vestige-in-the-geedge-supply-chain/){target="_blank"}」，內容以正體中文、臺灣用語翻譯。
    - 本章節內容翻譯範圍為報告 **第 1/5 章** 的內容，對應原文的 Executive Summary、What we found、Why it matters 三個段落。
    - 你可以[參與討論](./index.md#參與討論)或檢視[報告翻譯更新](./index.md#更新紀錄)。

## 摘要

台灣公司凌華科技（ADLINK Technologies）向中國公司 Geedge Networks 出貨超過 1,700 台專用網路硬體設備，Geedge Networks 是一家為各國政府打造與輸出國家級網路審查與監控系統的中國公司。凌華科技向 InterSecLab 證實了這批出貨紀錄，並說明其出口合規程序並未識別出最終用途，原因是 Geedge 並未揭露。這批硬體最終部署於哈薩克，用以運作 Geedge 的天狗安全閘道（Tiangou Secure Gateway，TSG），這項產品的能力可媲美中國防火長城（GFW）。

## 主要發現

凌華科技在 2019 至 2020 年間向 Geedge Networks 出貨了 1,708 台 CSA-7400 網路設備。這批設備構成 Geedge 第一代防火牆平台的基礎，部署於哈薩克以推動國家層級的網路審查與監控。CSA-7400 是一款高密度網路平台，廠商定位主要用於防火牆與深度封包檢測（DPI）應用。

凌華科技的硬體也出現在 Geedge 的 EtherFabric 之中。EtherFabric 是一款客製打造的網路封包經紀（network packet broker，NPB），用來在多個 TSG 節點之間進行流量負載平衡，部署在緬甸。從外洩文件中找到的一組 MAC 位址可追溯到凌華科技，顯示該公司在 Geedge 產品線中的元件影響並未止於最初的 CSA-7400 交易。

Geedge 目前這一代的 TSG 硬體部署在衣索比亞、巴基斯坦和緬甸，所用的伺服器由 Nettrix 提供。Nettrix 是中國超級電腦公司中科曙光（Sugon）的子公司，後者已遭美國政府制裁。儲存設備則來自浪潮（Inspur）。這些都是標準的 x86 伺服器，可與 Dell 或 HP 的通用硬體相比擬，即便直接採購受到限制，其元件大致仍可從次級市場取得。

## 為什麼這件事重要

凌華科技的出口合規審查未對「向中國公司出貨超過 1,700 台專用網路設備」這件事提出警示，儘管這款硬體本身就是為支撐網路審查的深度封包檢測而設計。凌華向 InterSecLab 表示，Geedge 在採購過程中並未揭露最終應用。

台灣現行的出口管制框架參照國際防擴散機制，並依據聯合國及盟友國家的制裁清單維護實體清單，但這套機制並未阻止該筆交易。台灣經濟部回應 InterSecLab 的詢問時，說明了這套框架，但以法律限制為由，未對個案表達看法。台灣立法委員沈伯洋則認為現行做法不夠完整，呼籲政府建立屬於台灣自己的實體清單，不要僅依賴美國與歐盟的清單，並建立更清楚的標準，釐清在什麼情況下元件製造商需要對最終用途負責。

雖然 Geedge 的軟體堆疊建立在開源軟體之上，目前這一代的硬體大多採用通用伺服器元件，凌華科技的硬體卻是顯著的例外。CSA-7400 是一款專為深度封包檢測與防火牆應用設計、行銷的高密度平台，EtherFabric 則是 Geedge 從零打造、用以在其監控節點之間做流量負載平衡的客製化網路設備。這兩款都難以從次級市場取得，使它們成為出口管制措施更可行的對象。

對政策制定者而言，這項區別至關重要。供應鏈介入對通用元件的效果有限，但像 CSA-7400 這類具備監控能力的專用硬體、以及 EtherFabric 中使用的元件，正是更嚴格的盡職調查（due diligence）與出口管制最能發揮效果的地方。

*[ADLINK]: 凌華科技股份有限公司（ADLINK Technology, Inc.），台灣上市公司（股票代號 6166），總部位於新北市。在中國設有 ADLINK Technology (China) Co., Ltd.，含北京分公司。
*[Geedge Networks]: 中文簡稱：積至公司（积至公司），商業名稱：積至（海南）信息技術有限公司，是一家中國網路公司，涉及網際網路審查與監控技術的研發、部署與對外出口。
*[Geedge]: 積至公司（积至公司）。
*[InterSecLab]: 資安實驗室，本報告發佈的組織。
*[CSA-7400]: 凌華科技推出的高密度 4U 網路平台設備，廠商行銷定位用於防火牆與深度封包檢測應用。
*[DPI]: 深度封包檢測 Deep Packet Inspection，縮寫為 DPI，是一種電腦網路封包過濾技術，用來檢查透過檢測點封包的資料部分以搜尋不符合規範的協定、病毒、垃圾郵件、入侵，或依預定準則來決定封包是否可透過、需被路由至其他不同目的地，或是為了收集統計資料。
*[TSG]: 天狗安全閘道（Tiangou Secure Gateway）是 Geedge Networks 提供的旗艦產品，作為運營商級別或國家級防火牆與流量管理解決方案，其全面能力可媲美中國防火長城（GFW）。
*[GFW]: 防火長城 Great Firewall，中國對國際網路流量進行審查與封鎖的整套技術系統。
*[NPB]: 網路封包經紀（network packet broker），用以在多個監控或防火牆節點之間分配、複製、過濾網路流量的硬體設備。
*[Nettrix]: 中科曙光（Sugon）旗下的伺服器子公司，組裝 x86 伺服器，使用 Intel 處理器及 Mellanox 光纖網卡。
*[Sugon]: 中科曙光（中科曙光信息產業股份有限公司），中國超級電腦製造商，已遭美國政府制裁。
*[Inspur]: 浪潮信息（浪潮電子信息產業股份有限公司），中國伺服器與儲存設備製造商。
