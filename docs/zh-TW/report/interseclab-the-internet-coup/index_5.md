---
title: 產品與服務
description: 網路政變 / The Internet Coup | InterSecLab
icon: material/arrow-right-bottom
---

# :material-file-outline: 產品與服務

!!! note ""

    - 本篇報告翻譯自 "[The Internet Coup: A Technical Analysis on How a Chinese Company is Exporting The Great Firewall to Autocratic Regimes | InterSecLab](https://interseclab.org/research/the-internet-coup/){target="_blank"}" 的 "[The Internet Coup: A Technical Analysis on How a Chinese Company is Exporting The Great Firewall to Autocratic Regimes](https://interseclab.org/wp-content/uploads/2025/09/The-Internet-Coup_September2025.pdf){target="_blank"}" 報告，內容以正體中文、臺灣用語翻譯。
    - 本章節內容翻譯範圍為報告 **INDEX 5/8** 的內容。
    - 你可以[參與討論](./index.md#參與討論)或檢視[報告翻譯更新](./index.md#更新紀錄)。

洩漏資料的分析提供了對 Geedge Networks 向其客戶推銷的監控和審查能力的詳細理解，並深入剖析了 Geedge 的開發過程、與客戶互動以及其產品如何建立在現有網路軟硬體之上。以下，我們概述了 Geedge Networks 提供的各項產品，提供這些產品如何在技術上部署的見解，其功能，以及對 Geedge 運營地區內網路使用者的影響。

雖然以下產品是獨立描述的，但需要注意的是，Geedge Networks[^4] 以完整套件形式銷售這些產品。該公司在初期階段與客戶（政府）密切合作，以滿足其訂製的審查和監控需求，並能夠重新使用現有硬體或透過新硬體完全建立系統。

<figure markdown="span">
  [![圖片於報告 13 頁](https://assets.anoni.net/the-internet-coup/index-5-13-1.png)](https://assets.anoni.net/the-internet-coup/index-5-13-1.png){target="_blank"}
  <figcaption>圖片說明：這是一張來自 Geedge Networks 的簡報圖示，顯示其系統如何整合進 ISP 的現有網路。灰色圖標代表 ISP 的原始基礎設施，而彩色圖標代表作為 Geedge 系統一部分安裝的組件。圖中顯示來自所有接入點的使用者流量如何通過 TSG-X，經由中央管理系統過濾，記錄在 TSG Galaxy 中，並透過 Cyber Narrator 進行視覺化。此外，它也展示了 Network Zodiac 如何提供 Geedge 系統性能的即時網路見解，並強調了 Geedge 的網路流量複製器（network packet broker, NPB） Ether Fabric。</figcaption>
</figure>

## Cyber Narrator：全視之眼

Cyber Narrator 是由 Geedge Networks 開發的運營商級別安全資訊和事件管理（SIEM）以及線上分析處理（OLAP）解決方案。這是客戶在使用 Geedge 的監控產品時主要的使用者介面，也是唯一為非技術使用者設計的產品。在實際應用中，政府分析師會在國家指揮中心的辦公室中使用這個介面來存取資料。

Cyber Narrator 是個強大的工具，能夠追蹤網路流量到個別用戶層級，並透過將其活動與特定的基地台標識（cell IDs）連結來即時識別行動用戶的地理位置。系統也允許政府客戶查看匯總的網路流量，因此，可以用來監控特定地區的網路使用者群體，如抗議或大型人群聚集的活動中。

<figure markdown="span">
  [![圖片於報告 14 頁](https://assets.anoni.net/the-internet-coup/index-5-14-1.png)](https://assets.anoni.net/the-internet-coup/index-5-14-1.png){target="_blank"}
  <figcaption>圖片說明：這是一個來自 Cyber Narrator 的定位地圖截圖，顯示它如何監控特定區域的個人群體。六角形顏色代表人口密度。顯示的數據包括 CID、MSISDN 和群體分類。此範例中，特定行動用戶在上海被標示為恐怖份子首腦。Cyber Narrator 使用者可以點擊六角形來查看用戶數，區分當地人、訪客和使用漫遊服務的人群。</figcaption>
</figure>

Cyber Narrator 從其資料倉儲解決方案 TSG Galaxy 所收集的數據，以及另一個由 Geedge Networks 開發的工具 WebSketch 中提取資料。WebSketch 是一個由 Geedge 建立並運行的網路情報搜尋工具，是 Geedge 唯一一個不在客戶端設置，而由 Geedge 自己托管的產品。WebSketch 的數據來源於 Geedge 自身的網路研究，並通過與第三方數據經紀公司獲取的資訊進行彙整。

WebSketch 結合了流行的資安情報服務 Shodan 和 Greynoise 的功能。像 Shodan 一樣，WebSketch 通過掃描網際網路以發現連接的設備，如攝影機、路由器和伺服器。WebSketch 也仿效 Greynoise 的功能，讓客戶能將原本無意義的標識如 IP 位址和域名標記為連結到特定網路服務，如微信或 VPN 服務。WebSketch 的設計文件中 Geedge 員工被要求在設計新功能時參考 Greynoise，這顯示其對 Greynoise 的高度依賴。分析該報告的洩漏數據中包含了在中國新疆部署 Cyber Narrator 的詳細要求清單，確保產品能識別「可疑」的通信模式，如使用 VPN 和國際漫遊。這種 Cyber Narrator 的使用案例（如下述中國部署部分所述）明確顯示出，Cyber Narrator 能夠使客戶（政府）和安全部隊更容易標記使用隱蔽工具或訪問其他應用程式或網頁的個別用戶，這些工具和網站都被客戶（政府）視為可能的惡意工具。Cyber Narrator 的分析能力也能阻擋對特定網站或虛擬私人網路（VPN）服務的訪問。

透過 Cyber Narrator，客戶（政府）還能識別出在限制實施之前訪問過該內容或服務的個人。實際上，這意味著客戶（國家）可以「回溯時間」找出那些曾經訪問過後來被定為非法網站的人。這對公民自由和言論自由具有令人擔憂的含義，因為網路使用者可能因於當初合法的線上行為而被識別、監控甚至受懲罰。這種能力是透過另一 Geedge 產品天狗安全閘道（Tiangou Secure Gateway，TSG）的巨量資料數據收集和聚合功能實現的，更詳細的描述可在 Tiangou Secure Gateway 章節中找到。

### TSG GALAXY：聚合分析以進行大規模監控

TSG Galaxy 是 Geedge Networks 的提取、轉換、載入（Extract, Transform, Load, ETL）資料倉儲解決方案，專為網際網路級別的大規模監控而設計，收集並整合客戶國家所有網路使用者以及透過網路傳輸的海量數據。它基於開源的 Apache Kafka 流處理平台[^5]，這是一個常用於為線上電子商務和廣告商提供客戶分析的資料數據處理軟體。這項研究中分析的洩漏數據包含 TSG Galaxy 的 SQL 模式[^6]，顯示 TSG Galaxy 被用來儲存所有 TCP 和 UDP 會話、這些主要用於寬頻和行動數據的傳輸協議，以及國內所有 SIP 會話。SIP 是用於 VoIP（網際網路語音協議）的協議，是大多數現代電話網路的基礎。這意味著 TSG Galaxy 不僅能監控網際網路上的流量和內容，還能監控電話通話。

TSG Galaxy 使用 IP 資料數據流訊息輸出（IP Flow Information Export, IPFIX）來分析流量，並使用深度封包檢測（DPI）萃取元資料數據。通過 DPI，他們可以萃取詳細的獨一無二的指紋數據，包括 TLS 和 QUIC 伺服器名稱指示、DNS 查詢和電子郵件標頭。TSG Galaxy 還實施了連接指紋技術，如 JA3 哈希，允許 Cyber Narrator 識別模式以幫助確定用戶所使用的操作系統以及他們所用來連接的應用程式。這項技術可用來幫助識別用戶是否使用了如 VPN 等規避工具來隱藏流量或繞過審查。在 TSG Galaxy 中，所有這些訊息與來自網路服務提供商（ISP）的訊息相結合，通過各種標記，如 IP 地址、用戶 ID、IMEI 和 IMSI[^7]，將其連接到個別網路使用者。從 TSG Galaxy 萃取的元數據被發送到一個可由客戶通過 Cyber Narrator 進行查詢的數據資料庫。

<figure markdown="span">
  [![圖片於報告 16 頁](https://assets.anoni.net/the-internet-coup/index-5-16-1.png)](https://assets.anoni.net/the-internet-coup/index-5-16-1.png){target="_blank"}
  <figcaption>圖片說明：這個圖示展示了流量記錄如何被吸收以及數據從 TSG 流向 Cyber Narrator 的過程。起初，網路使用者嘗試訪問一個網站，對 "example.com" 的網站請求被送往 ISP 的基礎設施並在此由 TSG-X 捕捉。TSG-X 查詢 Sanity Directory 以識別用戶 IP 的所有者。這一由 Sanity Directory 從 ISP 信號收集的身份回傳為 Jane Doe。然後 TSG-X 將該 IP 標記為 IP 所有者名和訪問的網站，並將這一記錄記錄在 TSG Galaxy 中。通過 Cyber Narrator，一名政府官員可以查詢 Jane Doe 訪問過的網站。</figcaption>
</figure>

這項研究的一個重要發現是，所有在客戶（政府）位置內由 TSG Galaxy 收集的網路使用者數據似乎對 Geedge Networks 的員工可見。數據同時顯示，真實客戶資料數據的快照有時會分享給中科院的 Mesalab，這是一個似乎與 Geedge Networks 緊密相關的學術實驗室。資料數據顯示，Mesalab 的工程學生使用這些真實世界的客戶資訊進行研究，目的是更好地理解和阻止網路審查規避。Geedge 與其附屬機構保存客戶數據的時間長短仍不明確。

<figure markdown="span">
  [![圖片於報告 16 頁](https://assets.anoni.net/the-internet-coup/index-5-16-2.png)](https://assets.anoni.net/the-internet-coup/index-5-16-2.png){target="_blank"}
  <figcaption>圖片說明：這些是來自 Mesalab 文件的照片，顯示了 2021 年 3 月 14 日至 4 月 28 日期間的一次新疆出差，可能是由中國科學院的成員或畢業生在 TSG 部署工作期間拍攝的，照片中可能是在伺服器室拍攝的。這些照片是報告的一部分，報導集中於實驗室的政治、科學和商業目標，引用科學家呼籲為國家的利益服務。據報導，由於北京團隊辦公空間有限，不得不「窩」在伺服器室裡。</figcaption>
</figure>

### 天狗安全閘道：審查與控制中心

天狗安全閘道（TSG）是 Geedge Networks 提供的旗艦產品，作為一個運營商級別或國家級防火牆與流量管理解決方案，其全面能力可媲美中國防火長城（GFW）。TSG[^8] 允許對整個國家所有用戶流量進行全面監控，並促進識別和阻擋網頁內容及應用程式。TSG 與企業環境中部署的防火牆設備相似，但能夠擴展以處理整個國家的網際網路流量。這項技術似乎缺乏保障人權的倫理限制。

TSG 具備全面的監控和審查功能，透過深度封包檢測，具備識別和封鎖 VPN 及翻牆工具、限制流量、監控、追蹤、標記及阻擋個別網路使用者，並能夠向使用者植入惡意軟體的能力。以下章節將描述這些功能，並詳細說明 TSG 軟硬體如何部署與管理。

<figure markdown="span">
  [![圖片於報告 17 頁](https://assets.anoni.net/the-internet-coup/index-5-17-1.png)](https://assets.anoni.net/the-internet-coup/index-5-17-1.png){target="_blank"}
  <figcaption>圖片說明：這是 TSG 為緬甸設置的主儀表板截圖。截圖顯示了根據總頻寬和活躍連接數分類的即時流量快照。另外，它顯示了由 Network Zodiac 提供的監控摘要，以及管理網路流量的活躍政策數量。下方，顯示了按用戶端、伺服器 IP 和熱門應用程式分類的被監控網際網路流量。</figcaption>
</figure>

## TSG 的功能能力

### 深度封包檢測

TSG 使用深度封包和流量檢查技術來處理網際網路協議（IP）資料包，以達成進階分類、攔截和操作應用程式與用戶流量的效果。TSG 能對多種運輸和應用協議提供廣泛的可視性，包括 HTTP、DNS、電子郵件、TLS、QUIC 和 SIP。TSG 設計用來監控網路流量和電話會話，並且可以過濾網站、應用程式和其他規避技術（如 VPN）以即時進行審查。TSG 具備識別與封鎖虛擬私人網路（VPN）的能力，也能對 HTTP 回應進行偽造、重定向，改變標頭、注入腳本、取代文字並覆蓋回應內容。

TSG 能夠通過匹配 IP 地址、主機名稱、內建和使用者定義的類別、URL 和 TLS 指紋的一系列元數據，來封鎖、監控、攔截或操作網路流量。如果連接沒有使用 TLS 加密，它甚至可以攔截 HTTP 標頭內容。更進一步，TSG 可以提取電子郵件地址、簽名、附件的元數據，以及電話和電子郵件通訊的來源與目的地號碼。

TSG 能夠通過兩種主要的方法分析傳輸層安全（TLS）流量。第一種方法是使用中間人（MITM）技術進行完整的解密，需要用戶安裝自簽名的根證書機構（CA）證書。第二種方法則運用深度封包檢測（DPI）和機器學習技術，從加密流量中提取元數據。由於後者對網路使用者是隱形的，無需使用者安裝 CA 證書或配置代理設置，因此更常被使用。再者，可以進行混合操作，僅對特定子集的域名進行完整解密。解密後的流量也可以鏡像到另一設備以供進一步檢查。負責執行 TLS MITM 攻擊的組件被稱為天狗前端引擎（TFE）。

公司使用這兩種不同的 TLS 分析方法可能起源於在 Geedge 的第一個客戶（國家）之一——哈薩克——部署時所做的決定。當時，哈薩克曾嘗試在全國推行網路審查，遠在 Geedge 成立之前，該國探索要求所有網路使用者安裝政府控制的 TLS 證書授權機構。這種方法將允許他們透過運行自己的 CA 來攔截所有加密流量，並運作在全球網路信任系統之外。然而，這種方法因需於每個裝置上手動安裝而被證明不切實際，且最終在國際瀏覽器製造商封鎖根證書後失敗。這個例子在國家部署章節中有更詳細描述。

### 阻擋 VPN 和翻牆工具

TSG 也運用深度封包檢測來全面識別與虛擬私人網路（VPN）和翻牆工具相關的協議，例如 OpenVPN 和 WireGuard。它允許客戶與 Geedge Networks 合作制定規則來阻擋特定服務供應商的訪問，Geedge 同時管理一個行動裝置農場，在受控環境下安裝和運行 VPN 應用程式。此外，Geedge Networks 的員工似乎有能力在其辦公室內建立 Wi-Fi 網路，以遠端連接任何裝置到客戶網路。這一功能讓他們能在真實情境中驗證封鎖機制是否運作有效。

即使當 TSG 無法識別與使用者活動相關的應用程式或服務時，系統也能標記任何異常的大流量為可疑流量。系統能夠配置將這些標記的流量在預定時間（例如 24 小時）後進行封鎖。這種方法與防火長城（GFW）的觀察結果一致，觀察顯示其在一段時間後封鎖任何高頻寬加密流量，即使無法識別流量的具體性質[^9]。

AppSketch 是一個資料庫，作為集中式存儲庫，其中 Geedge 根據流量指紋[^10]為所有服務提供商創建檔案，讓客戶能夠更選擇性地阻擋 VPN 和其他應用程式，這些應用程式可能被公司或政府組織使用。AppSketch 的設計使得制定阻擋規則的人員不需要具有深厚的技術知識，這意味著客戶（政府）可以將某些公司列入白名單以使用 VPN，並決定哪些 VPN 可以被允許使用。舉例來說，緬甸的網路安全法規定，緬甸政府會維護一個允許使用受限制的 VPN 和應用程式的公司清單。

Geedge Networks 正在開發一個稱為 AppSketch Works 的沙盒引擎，旨在自動生成應用程式分類檔案。這類產品將允許客戶在手機上運行任何應用程式，系統將自動學習如何在網路上封鎖它。

然而，在洩漏的時間點上，AppSketch Works 項目似乎仍處於開發初期階段，由於需要較高級別的技術技能來配置它以及誤分類的問題[^11]，該原型受到了客戶的不利反饋。然而，值得注意的是，此工具的進一步開發將允許 Geedge 將定義封鎖規則的責任轉移給政府客戶，取代客戶總是將此過程外包給 Geedge。

<figure markdown="span">
  [![圖片於報告 20 頁](https://assets.anoni.net/the-internet-coup/index-5-20-1.png)](https://assets.anoni.net/the-internet-coup/index-5-20-1.png){target="_blank"}
  <figcaption>圖片說明：這是從 Geedge Networks 數據集中截取的 AppSketch 截圖。此截圖包含在指導客戶如何通過在上傳新版本之前刪除舊版本的應用程式封鎖規則來更新封鎖功能的指南中。</figcaption>
</figure>

### 限制流量

TSG 包含流量調整功能，能優先處理或限制來自特定服務的流量，從而降低服務質量而不是直接封鎖。這可以透過直接的流量調整或應用差異化服務代碼點（DSCP）標記來完成，後者是限制或優化流量的業界標準。這再次顯示 Geedge 的客戶能夠使用任何廠商的網路設備，且這些設備將與 TSG 相容。

### 賦予用戶聲譽分數

Sanity Directory（SAN）或使用者聲譽流量管理系統是一個訂閱者識別系統，專為與網際網路服務提供商（ISPs）現有的信令和認證、授權與計費（AAA）協定（包括 RADIUS、3GPP 和 CGNAT）無縫整合而設計，這種的整合方式促進將流量歸因於真實身份。

該系統具備為每位訂閱者維持聲譽分數的能力，分數由他們的線上活動和系統所收集的個人訊息的數量所決定。如果訂閱者的聲譽分數顯著下降，他們的網路服務可能會被切斷，並可能需要進行照片 ID 和面部辨識驗證來確認其身份並改善其分數。此外，系統可以識別個別訂閱者為已知的 VPN 使用者，並在後續追蹤他們的網路使用情況，將任何未來未知的高頻寬流量標記為可疑。這種個人化的分類可能導致識別和封鎖先前未被識別的服務，當網路使用者切換到新 VPN 供應商時，可能會揭露此新 VPN，並牽連到不僅是被識別的網路使用者，還包括所有其他使用該服務的使用者。

### 識別和封鎖個別網路使用者

TSG 還能識別共享相同公共 IP 地址的個別網路使用者。TSG 包含自己的網路位址轉換（NAT）實作，稱為 WAN-NAT，可以在「來源 NAT」（SNAT）模式下運作以實現運營商級別網路位址轉換（CGNAT），或在「目的地 NAT」（DNAT）模式下運作以重定向往網際網路的流量。例如，它可以重新路由原本打算給公共 DNS 解析器的流量到由運營商或政府控制的 DNS 解析器。TSG 也能偵測並封鎖使用手機網路共享，即「網路分享」（tethering）功能將行動裝置網路連接分享給其他設備的用戶[^12]。

這些功能是值得注意的，因為這些功能對於網路服務提供商（ISPs）來說頗具吸引力，而不僅僅是針對客戶（政府），滿足了網路管理和成本節約的需求。這可能有助於通過提供額外的吸引服務，例如更廣泛的監控和審查功能，來確保 ISPs 在其網路上安裝 Geedge 的支持。

### 用惡意軟體感染使用者

TSG 配備了沿路注入功能，允許在網路傳輸的檔案中插入惡意代碼。Geedge Networks 明確指出這一功能用於在經過 TSG 系統的網路流量中插入惡意軟體。這個功能可與其他沿路注入系統相媲美，如之前由 FinFisher 出售的 FinFly ISP 系統以及在埃及用於將用戶重定向到有害流量的 Sandvine PacketLogic 系統。TSG 能夠在用戶訪問的網頁中注入惡意的 JavaScript 和 CSS，也可以即時修改和嵌入惡意代碼到下載的可執行文件中。

TSG 的沿路注入功能系統能針對特定用戶進行精確針對性的惡意代碼插入，支持對多種檔案格式的動態修改，包括 HTML、CSS 和 JavaScript，以及 Android APK 檔案、Windows EXE 檔案、macOS DMG 磁碟映像和 Linux RPM 軟體包。此外，TSG 還能修改多種圖像格式，如 JPG、GIF、PNG 和 SVG，及各種壓縮格式，如 ZIP 和 RAR，以及辦公文件、PDF、JSON 和 XML 檔案。這也得到了 Cyber Narrator 的補充，其擁有分析功能，能識別最合適的網址進行劫持以感染特定個人。例如，它能針對某人經常訪問但不使用傳輸層安全性（TLS）的網路。

作為這一功能的例證，Geedge 的政府客戶可以不再只是盲猜如何定位用戶，而是回溯用戶的網路活動，查看他們是否曾經做過讓自己容易被駭入的行為，從而在未來利用這一弱點來感染他們的裝置。

### DDoS 作為一項服務

上面描述的功能可以用來感染用戶以部署任何其他公司提供的間諜軟體。然而，值得注意的是，Geedge Networks 也試圖自行將此功能武器化。

在洩漏的資料數據中，Geedge Networks 識別出的最令人困惑的產品之一是 DLL Active Defence，這通常是在網路犯罪黑市上才會找到的產品。乍看之下，這似乎是一個用來防護分散式阻斷服務（DDoS）攻擊的系統；然而，細看之後發現，它實際上是一個用來對付被認為在政治上不受歡迎的網站和其他網路服務的 DDoS 攻擊平台。這看起來像是 Geedge 對中國「大炮」（Great Cannon） 的自主實作，如 2015 年公民實驗室（Citizen Lab）報告[^13]所描述的那樣。

這一功能的存在意味著，當國家防火牆可以封鎖國內公民無法訪問的網站時，DLL Active Defence 功能則可以使該網站對全球所有網路使用者都無法訪問，而不僅僅是在國家防火牆範圍內。

DLL 透過網路掃描來識別流量放大點，比如遞迴 DNS 服務器，這些可以用作反射型拒絕服務攻擊的發起點。它利用 TSG 中的沿路注入功能，有效地將毫無防備的用戶電腦招募為攻擊的一部分，從而建立一個僵屍網路。這是首次確認有資安公司向其客戶提供實質上作為 DDoS 租用的「booter」解決方案。

<figure markdown="span">
  [![圖片於報告 23 頁](https://assets.anoni.net/the-internet-coup/index-5-23-1.png)](https://assets.anoni.net/the-internet-coup/index-5-23-1.png){target="_blank"}
  <figcaption>圖片說明：這個圖表展示當網路用戶訪問一個網站時，TSG 系統會發生什麼。TSG 首先會檢查國家中心由中央管理制定的政策。符合政府制定政策的流量獲准並被導向用戶，不允許的流量則被即時封鎖或修改。</figcaption>
</figure>

## TSG 的運作方式

以下的技術分析將探討天狗安全閘道（TSG）背後的軟體開發實踐和網路硬體運作。儘管細節繁多，但這些資訊對於理解系統的實際功能和實施方法至關重要。

### TSGX：Geedge 的整合硬體解決方案

天狗安全閘道主要作為一個整合硬體解決方案，稱為 TSGX。在早期階段，它運行於由 HP Enterprise 和 DELL 提供的白牌硬體上；然而，現在它使用由中國伺服器製造商 Nettrix 提供的硬體，該公司是超級計算機製造商中科曙光（Sugon）的分支。中科曙光因據稱與中國人民解放軍有聯繫，而遭到美國政府制裁。

<figure markdown="span">
  [![圖片於報告 24 頁](https://assets.anoni.net/the-internet-coup/index-5-24-1.png)](https://assets.anoni.net/the-internet-coup/index-5-24-1.png){target="_blank"}
  <figcaption>左圖：Nettrix 提供的硬體上的 TSGX 圖像。右圖：HP Enterprise 提供的白牌硬體上的 TSGX 圖像。</figcaption>
</figure>

TSG 節點被設計為可以被組合成一個叢集，並且網路流量通過其中並在節點間分配。TSGX 不僅僅是擁有一個或兩個防火牆設備以提高冗餘能力，而是可以水平擴展，客戶可以新增更多節點。每個節點都增加了處理更多網路流量的能力。個別節點透過網路封包經紀進行連接，根據流量的來源和目的地來進行負載平衡。網路封包經紀（NPBs）是硬體設備，數據顯示 Geedge 有使用來自第三方供應商如 Niagara Networks 的 NPBs。此外，Geedge 還提供他們自己的產品 Ether Fabric，以下將有詳細介紹。

TSG 叢集中的節點透過一個名為中央管理系統（Central Management, CM）來進行集中管理，該系統也以其前內部名稱「畢方」（Bifang）[^14]識別。這個系統提供一個網頁介面和應用程式介面（API），用於與所有運行防火牆的 TSG 硬體進行互動和配置[^15]。

### TSG-OS

Geedge 的軟體開發實踐顯得非常現代化。TSG 採用了內部開發的作業系統，稱為 TSG-OS，這個系統基於 Red Hat Enterprise Linux，並使用 Open Network Install Environment（ONIE）進行初始設置。TSG-OS 使用了現代 DevOps 工具包開發，運用 Ansible 進行部署和宣告式配置，而 TSG 的各個組件則使用 Docker 和 K3s（輕量級 Kubernetes）進行容器化。這種架構顯示出與許多西方傳統網路供應商的做法有重大不同，後者的代碼庫往往包含數十年的遺留複雜性。Geedge Networks 成立於 2018 年，其提供的軟體在現代化程度上顯著對比。

值得注意的是，TSG-OS 也能運行在標準商用硬體上或作為虛擬設備。例如，在巴基斯坦的初期運作中，TSG-OS 部署在來自加拿大公司 Sandvine 的改裝 ActiveLogic 硬體上。這家公司之前因向包括埃及在內的威權政權提供深度封包檢測技術而受到關注和美國政府的制裁。在 Sandvine 於 2024 年清理其業務操作並解除制裁後，Geedge Networks 可能看到商機，為受到制裁影響的政權提供替代的作業系統和支援合約。Geedge 進入巴基斯坦市場，協助他們透過改裝 Sandvine 的現有硬件設施以降低成本。我們在下面的巴基斯坦部署章節中會更詳細地討論這一點。

<figure markdown="span">
  [![圖片於報告 25 頁](https://assets.anoni.net/the-internet-coup/index-5-25-1.png)](https://assets.anoni.net/the-internet-coup/index-5-25-1.png){target="_blank"}
  <figcaption>圖片說明：此圖來自關於 Geedge 在巴基斯坦部署的洩漏資料。PCAP、MSH 和 TWA 是 Geedge 系統部署的三個數據中心。圖中顯示 TSG-OS 安裝在來自加拿大公司 Sandvine 的 ActiveLogic 硬體上。</figcaption>
</figure>

### MARSIO

MARSIO 是 Geedge Networks 在 Linux 基礎上的用戶空間實作，作為 Layer-2 和 Layer-3 網路轉發平臺，旨在支持 TSG-OS 中的交換和路由功能。其主要功能包括 VLAN 支持與生成樹協議等交換能力，以及如最長前綴匹配尋徑、路由權重排序，並與 OSPF 和 BGP 等協議相容的路由功能。這一實作通過繞過 Linux 核心數據和轉發平面的局限性，促進高效的深度封包檢測，適用於大多數經由天狗安全閘道處理的資料包。由於 Linux 核心網路堆疊的內在效率低下，這種架構在其他網路設備供應商中也很常見。MARSIO 基於由 Linux 基金會管理的開源數據平面開發工具包（DPDK）專案。

使用開源 DPDK 讓他們能夠使網路堆疊避免依賴於特定的硬體供應商，因為該堆疊已經被設計為與多種網路硬體相容。

### Ether Fabric

Ether Fabric 是一款網路流量複製器（network packet broker, NPB），專為在叢集配置中連接和負載平衡多個 TSG 節點而設計。它基於 IP 5-tuple 的哈希值來將監控的流量分配到這些節點，並可以以主動（線路內）或被動（鏡像）配置的方式部署。這意味著負載平衡的實施確保與特定連接相關的封包始終被發送到同一個 TSG 節點，從而避免「分裂腦（Split-Brain Problem）」問題。除了負載平衡能力外，Ether Fabric 還能選擇特定的網路流量並將其導向到特定的節點。Ether Fabric 是 Geedge Networks 建立的專屬硬體產品，也是他們產品中唯一一個不是現成的白牌硬體。

<figure markdown="span">
  [![圖片於報告 26 頁](https://assets.anoni.net/the-internet-coup/index-5-26-1.png)](https://assets.anoni.net/the-internet-coup/index-5-26-1.png){target="_blank"}
  <figcaption>圖片說明：Ether Fabric 硬體的照片，這是 Geedge Networks 唯一一款專屬硬體，展示了 ATCA 規格的樣子。</figcaption>
</figure>

Ether Fabric 的硬體組件在很大程度上是可互換的，其建造基於先進電信計算架構（ATCA）模組化工業 PC 規格，這在電信設備中很常見。獨立的組件安裝在滑板上，並在後面有專用連接器連接電源和乙太網，這與通常會放入數據中心的普通伺服器形式不同。交換板基於中國公司北京恒光信息技術有限公司（恒光信息）的 VELA 平台。在內部，Ether Fabric 使用了 Barefoot Networks（隸屬於 Intel）的一款 3.2 Tbit/s 交換芯片，這款芯片可以使用 P4 編程語言進行編程，以管理網路設備中的封包轉發平面。

有關恒光 VELA 平台的公開訊息有限；然而，硬體似乎類似於中國公司 Embedway 生產的 OptiWay ATCA 平台。此外，文件中所包含的管理介面供應商 MAC 地址查詢結果顯示，部分硬體可能由台灣公司 ADLINK Technology Inc. 製造。控制平面基於 Open Network Linux，並由 Geedge Networks 內部開發。

由於 P4 編程語言的目標獨立性，Barefoot 交換芯片是可以互換的。洩露的資訊指出，Geedge Networks 已經研究了來自 AMD、博通和美滿（隸屬於 NVIDIA）的替代解決方案。例如，P4 也可以用於 FPGA 平台，如 Intel 的 PA8921 加速卡，用於 Embedway 的其他產品中。根據 Intel 在其官方網站上發布的 2023 年 11 月技術簡報，Intel 確實向 Embedway 提供了用於深度封包檢測應用的加速卡[^16]。不過，我們的研究沒有發現任何這些加速卡由 Geedge Networks 使用的證據。

### Network Zodiac 監控網路硬體

Network Zodiac（哪吒）是由 Geedge Networks 開發的一款網路級資產管理和監控解決方案。Network Zodiac 顯然是以 Grafana 為藍本開發的，Grafana 是許多商業實體廣泛使用的開源分析和監控平台。與 Grafana 相似，Network Zodiac 幫助組織即時視覺化和理解其網路的效能、使用情況和錯誤。然而，雖然 Grafana 主要提供針對軟體應用的分析，Network Zodiac 則擴展了這一功能以分析硬體網路設備的效能。Network Zodiac 還允許監控大量的設備。這個產品提供客戶診斷網路問題的能力，利用一個分佈式的監控架構，一個稱為 "NZ-TALON" 的軟體代理從每個節點（單個硬體設備）收集數據，並在客戶（政府）或 ISP 管理的數據中心聚合所有的指標。這些數據隨後傳輸到一個全球 NZ-Agent 節點中以進行長期儲存，允許客戶在 Network Zodiac 網頁介面中查詢全球節點，以檢索和視覺化聚合的效能指標。

<figure markdown="span">
  [![圖片於報告 28 頁](https://assets.anoni.net/the-internet-coup/index-5-28-1.png)](https://assets.anoni.net/the-internet-coup/index-5-28-1.png){target="_blank"}
  <figcaption>圖片說明：這是從 Geedge Networks 數據集提取的 Network Zodiac 儀表板截圖，顯示監控設備的地圖以及每個數據中心內的狀態。</figcaption>
</figure>

Network Zodiac 與流行的開源解決方案的一個顯著不同功能是其集成的網頁終端，該終端允許網路管理員使用 SSH 遠端連接到任何受監控的端點。這一功能為客戶提供直接訪問網路設備的能力，方便進行故障排除和管理。然而，這也使客戶承受了顯著的安全風險。在最壞的情況下，駭客可能會訪問部署在一個國家內部的所有安全設備。這種取捨顯示 Geedge 優先考慮大規模管理的便捷和易用性，而非基本的安全性。

[^4]: 從資料中看到的客戶部署情況顯示，Cyber Narrator 運行於中國伺服器製造商浪潮的高密度存儲伺服器上。該軟體本身並不依賴於特定硬體，可部署於任何供應商的通用伺服器硬體上。
[^5]: 它基於 Apache Kafka，利用了 Apache Druid 資料儲存、Apache Rink 分散式處理引擎和 ClickHouse 分析型資料庫構建而成。
[^6]: SQL 模式本質上是一個資料庫的組織系統。
[^7]: 這意味著，TSG Galaxy 的客戶可以將網路流量歸因於一個 IP 位址，以及特定的手機或 SIM 卡。
[^8]: 在中國神話中，天狗通常被描繪為一隻在日食或月食中吞噬太陽或月亮的狗。
[^9]: Minqshi Wuet et al, "How the Great Firewall of China Detects and Blocks Fully Encrypted Traffic", Proceedings of  the 32nd USENIX Securitmposium. August 9-11 2023. Anaheim CA USA <https://www.usenix.org/conference/usenixsecurity23/presentation/wu-mingshi>{target="_blank"}.
[^10]: 為了提取這些指紋，Geedge 和 Mesalab 的學生使用了一個開源工具 tcpdump 的修改版本，稱為 tcpdump_mesa。接著，指紋會被轉換為規則集，使用四個深度數據包檢查系統之一：SAPP（Stream Analyze Process Platform），一個 C 語言的封包解析和注入庫；Stellar，一個狀態防火牆插件平台，相較於 SAPP 運作在更高的抽象層次；或是 Maat，一個宣告式系統。與 SAPP 和 Stellar 不同，Maat 不需要編程知識以開發新規則。Maat 能夠匹配常見的連接指紋，包括 IP 位址、域名、TLS 伺服器名稱指示（SNI）、JA3/JA4 指紋，這些指紋在 JSON 文件中被指定。Maat 規則透過使用 Redis 資料庫進行同步，以確保這些規則在 TSG 叢集的節點中一致應用。另一個執行深度數據包檢查的系統由兩個二進位文件組成，分別為「libqmengine.so」和「libqmbundle.so」。雖然洩漏的信息不包括相關的源代碼，其中包含的 Jira 票據將這一系統稱作 QDPI 或「第三方識別引擎庫」，這暗示了該系統可能不是由 Geedge Networks 開發。分析數據中的 Jira 票據表達了關於無法修改第三方引擎行為的擔憂，並強調了在獲取此系統技術支援時的挑戰。這些擔憂進一步支持了這些二進位文件不是由 Geedge Networks 開發的觀點。對這些二進位文件的初步逆向工程指出它們參與了網路協議和服務的分類。與第三方引擎的整合是透過使用名為 qdpi_detector 的 Stellar 插件來完成的。
[^11]: 他們在中國的一個區域性國內客戶中試驗了這個系統。該軟體的初始版本收到此客戶的負面反饋，主要原因是需要在 Python 中進行用戶介面自動化腳本編寫以促進與應用程式的互動。這成了一個重大挑戰，因為終端使用者通常缺乏必要的腳本編寫技能。此外，客戶擔心自動分類過程可能會導致誤報，將廣告網路和由第三方庫產生的其他網路請求錯誤分類為指紋。
[^12]: 儘管當今市場上大多數網路分享檢測解決方案主要依靠分析收到的 IP 封包的生存時間（TTL）值，TSG 採用的是更為複雜的方法。它結合被動作業系統檢測技術與深度數據包檢查來識別與驗證入口網頁檢測（特別是所謂的 generate_204 請求）相關的 HTTP 請求，這些請求根據所用的作業系統而有所不同。因此，任何通過行動連線進入網路的桌面作業系統客戶均被視為網路分享活動的指示。天狗安全閘道採用的另一種技術涉及分析 TCP 時間戳值中的差異，在現代 TCP 堆疊中，這個計數器在啟動時初始化為一個隨機值；這些值的變化表明在網路位址轉換（NAT）背後存在多個裝置。
[^13]: Bill Marczak et al, "China's Great Cannon", published on April 10 2025. <https://citizenlab.ca/2015/04/chinas-great-cannon/>{target="_blank"}.
[^14]: 在中國神話中，畢方是一種獨腳鳥，象徵著不幸的預兆，特別是與火相關的不幸。據信它的出現預示著該地區可能有災難發生。
[^15]: 該系統整合了統一認證，並由中央配置存儲支撐，這可將設置同步到叢集中的各個節點，同時還整合了故障轉移機制以確保運營的連續性。其底層使用一個 Restful API 來查詢叢集中的各種組件以獲取狀態和故障信息。此 API 在內部被稱為 TSG-OAM，其中 OAM 是運營和維護的縮寫。
[^16]: Intel Corporation. "EmbedWay Shipping PA8921 FPGA Acceleration Card Based on Intel Agilex® 7 FPGAs F-Series Optimized for DPI and RDMA Network Acceleration. Solution Brief. November 2023. <https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2023-11/embedway-shipping-pa88921-fpga-acceleration-card-solution-brief.pdf>{target="_blank"}.

*[Cyber Narrator]: Cyber Narrator 是由 Geedge Networks 開發的運營商級別安全資訊和事件管理（SIEM）以及線上分析處理（OLAP）解決方案。這是客戶在使用 Geedge 的監控產品時主要的使用者介面，也是唯一為非技術使用者設計的產品。在實際應用中，政府分析師會在國家指揮中心的辦公室中使用這個介面來存取資料。
*[DPI]: 深度封包檢測 Deep Packet Inspection，縮寫為 DPI，是一種電腦網路封包過濾技術，用來檢查通過檢測點封包的資料部分（也可能包含其標頭），以搜尋不符合規範的協定、病毒、垃圾郵件、入侵，或以預定準則來決定封包是否可通過或需被路由至其他不同目的地，或是為了收集統計資料。
*[Geedge Networks]: 中文簡稱：積至公司（积至公司），商業名稱：積至（海南）信息技術有限公司，是一家中國網路公司，涉及網際網路審查與監控技術的研發、部署與對外出口。
*[Geedge]: 積至公司（积至公司）是一家中國網路公司，涉及網際網路審查與監控技術的研發、部署與對外出口。
*[MITM]: 中間人攻擊 Man-in-the-middle attack，縮寫：MITM，在密碼學和電腦安全領域中是指攻擊者與通訊的兩端分別建立獨立的聯絡，並交換其所收到的資料，使通訊的兩端認為他們正在通過一個私密的連接與對方直接對話，但事實上整個對談都被攻擊者完全控制。
*[TSG]: 天狗安全閘道（TSG）是 Geedge Networks 提供的旗艦產品，作為一個運營商級別或國家級防火牆與流量管理解決方案，其全面能力可媲美中國防火長城（GFW）。TSG5 允許對整個國家所有用戶流量進行全面監控，並促進識別和阻擋網頁內容及應用程式。TSG 與企業環境中部署的防火牆設備相似，但能夠擴展以處理整個國家的網際網路流量。這項技術似乎缺乏保障人權的倫理限制。
