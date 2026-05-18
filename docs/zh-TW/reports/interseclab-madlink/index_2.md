---
title: Geedge 供應鏈深入解析（三代 TSG 硬體）
description: MADLink / 台灣在 Geedge 供應鏈中的遺留 | InterSecLab
icon: material/arrow-right-bottom
---

# :material-file-outline: Geedge 供應鏈深入解析（三代 TSG 硬體）

!!! note ""

    - 本篇報告翻譯自「[MADLink: A Taiwanese Vestige in the Geedge Supply Chain | InterSecLab](https://interseclab.org/research/madlink-a-taiwanese-vestige-in-the-geedge-supply-chain/){target="_blank"}」，內容以正體中文、臺灣用語翻譯。
    - 本章節內容翻譯範圍為報告 **第 2/5 章** 的內容，對應原文的 Geedge Networks' Supply Chain: A Closer Look，以及三代 TSG 硬體（TSG-ADC、TSG-9140、TSG-X）的段落。
    - 你可以[參與討論](./index.md#參與討論)或檢視[報告翻譯更新](./index.md#更新紀錄)。

## Geedge Networks 的供應鏈：深入探究

Geedge Networks 是一家中國公司，向各國政府銷售一站式的網路審查與監控系統。其旗艦產品為天狗安全閘道（TSG），是一款防火牆設備，能力可媲美中國防火長城。它能在國家層級監測、過濾並封鎖網路流量。產品線還包括 Cyber Narrator（用以查詢 TSG 所收集監控資料的分析師工具）以及 Network Zodiac（用以監控與維運部署狀態的資產管理軟體）。

在發布[「The Internet Coup（網路政變）」](../interseclab-network-coup/index.md)報告詳細記錄 Geedge 的產品及其在威權政府的部署狀況之後，我們現在開始一系列追蹤 Geedge 運營背後供應商與廠商的調查。本系列首篇聚焦於 Geedge 用來建立和運營其產品所依賴的伺服器與網路硬體。

Geedge 的系統與一般企業防火牆最大的差別在於規模。一般企業防火牆是「一台設備保護一間辦公室網路」的等級，Geedge 則可以在一個國家的各 ISP 內部署多組防火牆節點叢集，每秒監測 TB 等級的流量。Geedge 透過網路封包經紀（NPBs）來達成此目標，把即時流量分配到多個共同運作的 TSG 節點上。硬體安裝在當地 ISP 的資料中心，但設備所有權屬於客戶政府，並由中央指揮中心遠端管理。在中國的 Geedge 工程師也保有遠端存取權限以提供技術支援。

Geedge 的整套軟體堆疊建立在開源基礎上。其作業系統 TSG-OS 以 Rocky Linux 為基礎（更早期版本是 CentOS），網路封包處理則仰賴 Intel 開源的 DPDK 工具包。外洩文件顯示，在某次與政府官員會議後，Geedge 曾考慮改用華為 EulerOS，但因授權費用過高而放棄。這個開源基礎讓 Geedge 的軟體能在大多數通用 x86 伺服器硬體上運行。外洩的 RPM 軟體倉庫也顯示，Geedge 正在把軟體移植到華為旗下海思（HiSilicon）的國產 ARM CPU，不過沒有跡象顯示有支援龍芯（Loongson）CPU 架構。

Geedge 要麼直接把所有伺服器硬體出貨給政府客戶，要麼在某些情況下，把軟體安裝到客戶既有的設備上。例如在巴基斯坦，Geedge 把 TSG-OS 安裝在先前用於 Sandvine Inc.（在美國制裁後又解除後改名為 AppLogic Networks）國家級防火牆的伺服器上。

Geedge 為其 TSG 防火牆設備陸續供應了三代伺服器硬體。每一代都更換了伺服器供應商，但保留整體設計：把封包處理與深度封包檢測分散到多個運算節點。每一代被部署到不同的客戶地點。

## 第一代：TSG-ADC（哈薩克）

第一代 TSG 平台 TSG-ADC 建立在 CSA-7400 之上。CSA-7400 是台灣公司凌華科技推出的高密度 4U 網路機箱。每台 CSA-7400 包含一塊使用 Intel FM10000 晶片的乙太網路交換板，以及四個運行 Geedge TSG-OS 的 x86 運算模組。其中一個運算模組負責封包入口處理，並判斷封包是否應該轉發給另外三個模組做較重的處理（例如深度封包檢測）。容量擴充透過鏈路聚合（LAG）或第三方網路封包經紀，把多台 CSA-7400 互連起來達成。

包含 DPI 在內的核心功能由 Geedge 自行實作，部分負載平衡功能則仰賴凌華科技的 PacketManager 軟體，以及 Intel 的 Testpoint 工具來設定 FM10000 交換晶片。根據一份外洩文件，凌華科技直接向 Geedge 提供 Testpoint，這款軟體一般只能透過與 Intel 簽訂授權協議才能取得。

外洩文件顯示這套配置只部署在哈薩克（代號 K18）客戶站點。凌華科技向 InterSecLab 證實，2019 至 2020 年初之間出貨給 Geedge 的 CSA-7400 共有 1,708 台。

## 第二代：TSG-9140（衣索比亞）

第二代平台 TSG-9140 採用 AdvancedTCA（ATCA）規格，這是電信設備常見的形式，而非標準的機架式伺服器。它應該是基於中國公司北京恒光信息技術的 VELA ATCA 平台。該平台包括一個機櫃，搭配一塊交換板。根據外洩文件，交換板使用 Barefoot Networks 的 3.2 Tbit/s 可程式交換晶片（Barefoot 自 2019 年起隸屬於 Intel）。多個 ATCA 運算模組插入機櫃，透過 ATCA 背板互連。

外洩的 Git 儲存庫「tango_9140_hardware」包含這款硬體的韌體、軟體與 Ansible 設定腳本。其中一個名為 `jut_shm` 的二進位執行檔內含版權標註，暗示部分元件可能由另一家中國公司上海集眾科技（Shanghai Joinus Technology Corporation）提供。

外洩文件顯示 TSG-9140 只部署在衣索比亞（代號 E21）客戶站點。

## 現行版本：TSG-X（衣索比亞、巴基斯坦、緬甸）

現行版本 TSG-X 的主要 TSG 運算節點採用 Nettrix 伺服器，儲存 Cyber Narrator 所使用監控資料的儲存伺服器則來自浪潮（Inspur）。Nettrix 是中科曙光（Sugon）的子公司，曙光是已遭美國政府制裁的中國超級電腦製造商。和 Geedge 一樣，曙光最初也是從中國科學院的研究分拆出來的公司。

雖然伺服器由 Nettrix 組裝，但內部使用的是通用的 x86 Intel 處理器，以及 Mellanox（自 2020 年起隸屬於 NVIDIA）的光纖網路卡。這些都是標準伺服器元件，可與 Dell 或 HP 的通用硬體相比。

TSG-X 部署於衣索比亞（E21）、巴基斯坦（P19）和緬甸（M22）等客戶站點。在巴基斯坦，Geedge 的 TSG-X 硬體補充了先前用於 Sandvine Inc. 國家級防火牆的伺服器，Geedge 同時也在這些伺服器上安裝了自己的軟體。

*[ADLINK]: 凌華科技股份有限公司（ADLINK Technology, Inc.），台灣上市公司（股票代號 6166），總部位於新北市。
*[Geedge Networks]: 中文簡稱：積至公司，是一家中國網路公司，涉及網際網路審查與監控技術的研發、部署與對外出口。
*[Geedge]: 積至公司。
*[CSA-7400]: 凌華科技推出的高密度 4U 網路平台設備，廠商行銷定位用於防火牆與深度封包檢測應用。
*[DPI]: 深度封包檢測 Deep Packet Inspection。
*[DPDK]: Data Plane Development Kit，由 Linux Foundation 管理的開源資料平面開發工具包，用於加速網路封包處理。
*[TSG]: 天狗安全閘道（Tiangou Secure Gateway），Geedge Networks 的旗艦防火牆產品。
*[TSG-OS]: TSG 系列硬體所使用的作業系統，以 Rocky Linux（更早期是 CentOS）為基礎。
*[TSG-ADC]: 第一代 TSG 平台，建立在凌華科技 CSA-7400 硬體之上，部署在哈薩克。
*[TSG-9140]: 第二代 TSG 平台，採用 ATCA 規格、北京恒光 VELA 平台，部署在衣索比亞。
*[TSG-X]: 現行 TSG 平台，採用 Nettrix 伺服器與浪潮儲存，部署在衣索比亞、巴基斯坦、緬甸。
*[ATCA]: AdvancedTCA，電信設備常見的模組化機櫃硬體規格。
*[NPB]: 網路封包經紀（network packet broker），在多節點之間分配流量的硬體設備。
*[ISP]: 網際網路服務供應商（Internet Service Provider）。
*[Cyber Narrator]: Geedge Networks 開發的安全資訊與事件管理（SIEM）與線上分析（OLAP）工具，是 TSG 監控資料的主要查詢介面。
*[Network Zodiac]: Geedge Networks 開發的網路資產管理與監控工具，內部別名「哪吒」。
*[K18]: 外洩文件中對哈薩克客戶站點的代號。
*[E21]: 外洩文件中對衣索比亞客戶站點的代號。
*[P19]: 外洩文件中對巴基斯坦客戶站點的代號。
*[M22]: 外洩文件中對緬甸客戶站點的代號。
*[LAG]: 鏈路聚合（Link Aggregation），把多條網路連線結合成一條邏輯連線，提升頻寬或容錯。
*[Sandvine]: 加拿大網路設備公司，曾因向威權政府提供深度封包檢測技術而遭美國制裁。制裁解除後改名為 AppLogic Networks。
*[Nettrix]: 中科曙光旗下的伺服器子公司，組裝 x86 伺服器。
*[Sugon]: 中科曙光，中國超級電腦製造商，已遭美國政府制裁。
*[Inspur]: 浪潮信息，中國伺服器與儲存設備製造商。
*[Mellanox]: 高效能網路設備品牌，自 2020 年起隸屬 NVIDIA，常見於資料中心的光纖網路卡與交換器。
*[HiSilicon]: 海思半導體，華為旗下晶片設計公司，產品涵蓋手機、伺服器、ARM CPU。
*[Loongson]: 龍芯，中國自主指令集（LoongArch）的 CPU 架構與處理器系列。
