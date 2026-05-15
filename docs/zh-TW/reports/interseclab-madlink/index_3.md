---
title: EtherFabric 與 ADLINK 的角色和回應
description: MADLink / 台灣在 Geedge 供應鏈中的遺留 | InterSecLab
icon: material/arrow-right-bottom
---

# :material-file-outline: EtherFabric 與 ADLINK 的角色和回應

!!! note ""

    - 本篇報告翻譯自「[MADLink: A Taiwanese Vestige in the Geedge Supply Chain | InterSecLab](https://interseclab.org/research/madlink-a-taiwanese-vestige-in-the-geedge-supply-chain/){target="_blank"}」，內容以正體中文、臺灣用語翻譯。
    - 本章節內容翻譯範圍為報告 **第 3/5 章** 的內容，對應原文的 EtherFabric: Geedge's custom network packet broker 與 ADLINK's role and response 兩段。
    - 你可以[參與討論](./index.md#參與討論)或檢視[報告翻譯更新](./index.md#更新紀錄)。

## EtherFabric：Geedge 自家的網路封包經紀

為了讓防火牆能擴展到一整個國家的網路流量，Geedge 使用網路封包經紀（NPB）把流量分散到多個 TSG 節點。市面上其他廠牌的商用 NPB 也能達到相同目的，外洩資料也顯示 Geedge 在巴基斯坦的部署中沿用了客戶既有的 Niagara Networks NPB。除此之外，Geedge 也設計了自己的 NPB，名為 EtherFabric。這是 Geedge 目前已知唯一一款從零打造的客製化硬體產品。

<figure markdown="span">
  [![EtherFabric 硬體照片，Geedge Networks 唯一一款客製化硬體](https://interseclab.org/wp-content/uploads/2026/04/EtherFabric-Geedge-Networks.jpg)](https://interseclab.org/wp-content/uploads/2026/04/EtherFabric-Geedge-Networks.jpg){target="_blank"}
  <figcaption>圖片說明：來自 Geedge 外洩資料中的 EtherFabric 硬體照片，Geedge Networks 目前唯一一款客製化硬體。圖片來源：InterSecLab。</figcaption>
</figure>

EtherFabric 看起來重用了與 TSG-9140 相同的、來自北京恒光信息技術的 VELA ATCA 硬體，但角色不同。外洩文件還指出，部分網路元件可能由凌華科技提供，與第一代 TSG-ADC 是同一家台灣供應商。

一份標題為「Login to SMBIO」的外洩文件，記錄了 EtherFabric 板卡執行 Open Network Linux 時的序列主控台輸出，其中可以看到管理用網路介面。`ifconfig` 指令輸出顯示該介面的 MAC 位址為 `00:30:64:37:42:17`。MAC 位址前綴 `00:30:64` 的 OUI（組織唯一識別碼）登記在 ADLINK Technology, Inc. 名下，這證實了 EtherFabric 的管理與控制平面是建立在凌華科技的網路介面或主板上。換成白話來說，EtherFabric 內部那台操作員用來設定、監控和更新設備的專用電腦，至少包含一個凌華科技的元件，最有可能是運行管理軟體的運算主板。

EtherFabric 部署在緬甸（M22）客戶站點，也作為概念驗證部署給一個只以代號 A24 識別的未知客戶。

## 凌華科技的角色與回應

上述證據指出，凌華科技在兩款不同的產品中向 Geedge Networks 供應了硬體：用於第一代 TSG-ADC 的 CSA-7400 平台，以及在 EtherFabric 中發現的網路元件。和 Geedge 從其他廠商取得的通用 x86 伺服器硬體不同，凌華科技的貢獻是專為網路安全與深度封包檢測應用所設計的專用元件，這讓凌華科技在 Geedge 的硬體供應鏈中是位置特別關鍵的供應商。

InterSecLab 聯絡凌華科技，詢問該公司與 Geedge Networks 之間關係的性質與範圍，特別針對為 EtherFabric 與 TSG-ADC 供應硬體一事。凌華科技證實，凌華科技（中國）有限公司北京分公司向 Geedge Networks 供應了標準的 CSA-7400 網路安全平台設備。該公司表示，已完成出口管制名單篩查，確認 Geedge 不在任何受限名單上，並依例行合規審查出貨產品。對於外洩資料中暗示凌華是否曾向 Geedge 提供 Intel 的 Testpoint 軟體一事，凌華科技並未正面回答。

凌華科技表示，公司僅提供通用硬體平台，未參與任何與該產品最終用途相關的軟體整合、系統設計或運營活動。然而，這項說法與外洩文件互相矛盾。外洩文件顯示，Geedge 的 TSG-ADC 配置在負載平衡功能上仰賴凌華科技的 PacketManager 軟體。

在後續往來的訊息中，凌華科技確認出貨持續到 2020 年初，並表示出貨給 Geedge 的 CSA-7400 總數為 1,708 台。該公司也表示將啟動內部稽核，調查其產品可能遭到濫用的情況，並願意與研究機構合作以釐清事實。凌華科技初步回應的全文收錄在[附錄](./index_5.md)。

凌華科技把 CSA-7400 描述為「通用」平台，但這種說法與該產品本身的行銷定位互相矛盾。CSA-7400 的官方行銷把它定位為一款為深度封包檢測與防火牆應用所設計的高密度網路安全設備。一筆超過 1,700 台同型設備出貨給中國買家的交易，竟未在合規審查中觸發進一步審視，這讓人質疑凌華科技盡職調查程序的完善程度。凌華科技主張 Geedge 並未揭露最終用途，這項說法或許屬實，但也顯示該公司的合規程序仰賴客戶自行揭露，而不是獨立的風險評估。

*[ADLINK]: 凌華科技股份有限公司（ADLINK Technology, Inc.），台灣上市公司（股票代號 6166）。
*[Geedge Networks]: 中文簡稱：積至公司，是一家中國網路公司，涉及網際網路審查與監控技術的研發、部署與對外出口。
*[Geedge]: 積至公司。
*[CSA-7400]: 凌華科技推出的高密度 4U 網路平台設備，廠商行銷定位用於防火牆與深度封包檢測應用。
*[DPI]: 深度封包檢測 Deep Packet Inspection。
*[NPB]: 網路封包經紀（network packet broker），在多節點之間分配流量的硬體設備。
*[TSG]: 天狗安全閘道（Tiangou Secure Gateway），Geedge Networks 的旗艦防火牆產品。
*[TSG-ADC]: 第一代 TSG 平台，建立在凌華科技 CSA-7400 硬體之上，部署在哈薩克。
*[TSG-9140]: 第二代 TSG 平台，採用 ATCA 規格與北京恒光 VELA 平台，部署在衣索比亞。
*[ATCA]: AdvancedTCA，電信設備常見的模組化機櫃硬體規格。
*[MAC]: 媒體存取控制位址（Media Access Control address），網路設備的硬體層識別碼。
*[OUI]: 組織唯一識別碼（Organizationally Unique Identifier），由 IEEE 分配給網路設備製造商的識別碼前綴，是 MAC 位址前三組（24 bits）。
*[M22]: 外洩文件中對緬甸客戶站點的代號。
*[A24]: 外洩文件中對某個身分未明客戶的代號。
*[Testpoint]: Intel 提供用以設定 FM10000 系列交換晶片的軟體工具，一般須與 Intel 簽訂授權協議才能取得。
*[PacketManager]: 凌華科技所開發、用於 CSA-7400 平台的網路封包管理軟體。
