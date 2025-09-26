---
title: 主要發現
icon: material/arrow-right-bottom
---

# :material-file-outline: 主要發現

!!! note ""

    - 本篇報告翻譯自 "[The Internet Coup: A Technical Analysis on How a Chinese Company is Exporting The Great Firewall to Autocratic Regimes | InterSecLab](https://interseclab.org/research/the-internet-coup/){target="_blank"}" 的 "[The Internet Coup: A Technical Analysis on How a Chinese Company is Exporting The Great Firewall to Autocratic Regimes](https://interseclab.org/wp-content/uploads/2025/09/The-Internet-Coup_September2025.pdf){target="_blank"}" 報告，內容以正體中文、臺灣用語翻譯。
    - 本章節內容翻譯範圍為報告 **INDEX 2/8** 的內容。

## 中國「防火長城」模式的大量出口

這份報告清楚顯示，Geedge Networks 如何將防火長城（GFW）的能力出售給哈薩克、衣索比亞、巴基斯坦和緬甸政府，以及另一個未被識別的國家。Geedge Networks 可能將自己包裝為一家傳統的資安公司，提供標準的網路管理硬體和軟體解決方案，類似於其他商業化系統。然而，實際上，Geedge Networks 的產品使全面監控和審查成為可能。這些系統讓客戶政府能夠進行廣泛的群體監控和網路關閉，同時也能對網路使用者進行細緻的監控以及針對性的封鎖和審查。這些產品明顯地被推銷給那些忽視國民個人資料隱私與安全的威權政權。

### 在中國內部推動防火長城的區域化

除了與國際政府客戶合作外，這項研究還提供了證據顯示中國正在推出補充國家防火長城的省級防火牆模式。Geedge Networks 正與中國多個地方政府合作，建立省級防火牆，這些防火牆的審查規則可能因地區而異。InterSecLab 已經確認了中國在新疆、福建和江蘇的省級防火牆計畫。

### 監控能力的商品化

Geedge Networks 提供的一系列產品讓客戶政府能夠前所未有地獲取網路使用者的數據，並利用這些數據來監管國家和區域網路。這些功能包括：進行深度封包檢測，用於進階分類、攔截和操控應用程式及使用者流量；即時監控行動用戶的地理位置；分析特定地區的彙總網路流量，例如在抗議或活動期間；將異常流量模式標記為可疑；建立客製化的封鎖規則來阻擋特定網站或應用程式的訪問（例如 VPN 或翻牆工具）；限制特定服務的流量；辨識個別網路使用者進入網站或使用翻牆工具或 VPN 的行為；根據使用者的線上活動為其分配聲譽分數；以及通過沿路注入的手段向使用者植入惡意軟體。

### 辨識 VPN 和翻牆工具

通過 Geedge Networks 的產品套件，客戶（政府）能夠偵測到許多不同的 VPN 和其他翻牆工具，例如 Tor 和 Psiphon。InterSecLab 審查過的文件顯示，Geedge Networks 的客戶（政府）可以回溯一名網路使用者的過去活動，查看他們是否訪問過之後被封鎖的網站。這似乎違反了法律不溯及既往的基本原則。此外，Geedge Networks 的產品亦能夠識別特定個體為已知的 VPN 使用者。一旦這些已知的翻牆工具使用者轉換到尚未被封鎖的新提供商，Geedge Networks 可以監控這些使用者的流量，並利用他們遺留下的痕跡來識別未來需要封鎖的新 VPN。

### 透過定期操作系統更新擴展數位威權主義

客戶能夠要求 Geedge Networks 優先開發新的監控軟體版本功能與能力。一旦 Geedge Networks 推出這些軟體更新，每一個客戶（政府）都能享受這些新功能。Geedge Networks 似乎正在探討和測試的新功能包括：為租用提供分散式阻斷服務（DDoS）、更換 SIM 卡的能力、經常撥打國際電話號碼，以及建構關係圖譜和為特定用戶建立地理圍欄的能力。

### 在資料共享和使用上沒有內建的法律或道德限制

InterSecLab 沒有發現任何證據顯示 Geedge Networks 提供功能來記錄使用情況，以理解他們的產品如何被使用（以及可能被濫用），或了解用戶的個人資料如何在各國部署的網路系統中被儲存或共享。此外，所有客戶政府都缺乏公共監督使用情況的問責機制。

### 設計與商用硬體廠商的互操作性，使得針對性制裁更加困難

Geedge Networks 似乎設計其產品以便能夠與各種硬體廠商進行互操作，以提高其抵禦針對性制裁的能力。他們的產品在其他已存在於客戶（國家）的網路服務供應商網路設備方面是廠商中立的，基於開放標準的整合方式。這也意味著，當制裁針對特定公司時，例如巴基斯坦的 Sandvine 案例，Geedge Networks 能夠與該公司客戶政府合作，填補空缺並建構在現有基礎設施之上。

### 國際資助的網路服務供應商涉入其中

Geedge Networks 直接與網路服務供應商（ISPs）合作安裝其產品。資料會在 ISP 的數據中心內部被截取並儲存，政府工作人員則從控制指揮中心遠端存取這些資料。若這些ISP希望在某國持續營運，可能無法拒絕在其數據中心安裝 Geedge Networks 的設備。然而，這也牽涉到特定供應商，如緬甸的 Frontiir，這些公司公開否認與政府合作進行審查和監控。此外，與客戶（政府）和 Geedge Networks 合作的 ISP，如 Frontiir 和 Safaricom，從西方國家、公司和金融機構獲得外國直接投資。至於他們在與 Geedge Networks 合作中，向西方投資者和股東透露了多少資訊，仍然成疑。

### 複製並改進現有商業產品和開源程式碼

這項研究顯示，Geedge Networks 經常複製西方公司開發的現有產品。Geedge Networks 似乎在抄襲某些商業產品，如 Greynoise 和 Fortinet 的網路設備。他們也以可能違反許可條款的方式融入開源程式碼。Geedge 似乎利用這些策略來獲取競爭優勢——更迅速地提供一套具備領先競爭者能力的產品，同時建立對制裁的韌性。
