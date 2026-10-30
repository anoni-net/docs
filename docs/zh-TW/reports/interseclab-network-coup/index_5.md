---
title: 產品與服務
description: Geedge Networks 銷售的監控與審查產品，從 Cyber Narrator、TSG 到 Network Zodiac 的功能與部署方式。
icon: material/arrow-right-bottom
---

# :material-file-outline: 產品與服務

!!! note ""

    - 本章翻譯自 InterSecLab 的報告「[The Internet Coup: A Technical Analysis on How a Chinese Company is Exporting The Great Firewall to Autocratic Regimes](https://interseclab.org/wp-content/uploads/2025/09/The-Internet-Coup_September2025.pdf){target="_blank"}」（[報告介紹頁](https://interseclab.org/research/the-internet-coup/){target="_blank"}），以正體中文、臺灣用語翻譯。
    - 本章對應原報告目錄（INDEX）的第 5/8 章。
    - 歡迎[參與討論](./index.md#參與討論)，或查看譯文的[更新紀錄](./index.md#更新紀錄)。

分析外洩資料，可以詳細了解 Geedge Networks（積至公司）向客戶推銷的監控與審查能力，也能深入掌握 Geedge 的開發流程、與客戶的往來，以及旗下產品如何建立在既有的網路軟硬體之上。我們在下方逐一介紹 Geedge Networks 提供的產品，說明各項產品在技術上如何部署、有哪些功能，以及對 Geedge 營運所在地區的網路使用者有什麼影響。

下方雖然先分別介紹各項產品，但要特別說明，Geedge Networks 是把這些產品當成整套方案銷售。在建置初期，Geedge 與政府客戶密切合作，依對方的需求量身打造審查與監控功能，可以沿用既有的硬體，也可以全部改用新硬體建置系統。

<figure markdown="span">
  [![圖 1](https://assets.anoni.net/the-internet-coup/index-5-13-1.png)](https://assets.anoni.net/the-internet-coup/index-5-13-1.png){target="_blank"}
  <figcaption>圖 1：Geedge Networks 簡報裡的示意圖，說明 Geedge 的系統如何整合進 ISP（網路服務供應商）既有的網路。灰色圖示是 ISP 原有的基礎設施，彩色圖示是安裝 Geedge 系統時加入的元件。圖中可以看到，來自所有接取點的使用者流量都會經過 TSG-X，由中央管理系統（Central Management）過濾、記錄在 TSG Galaxy，再透過 Cyber Narrator 呈現成視覺化畫面。圖中也說明 Network Zodiac 如何即時監測 Geedge 系統的效能，並特別標示 Geedge 的網路封包代理器（NPB）Ether Fabric。</figcaption>
</figure>

## Cyber Narrator，全知的監看介面 { #Cyber-Narrator全視之眼 }

Cyber Narrator 是 Geedge Networks 開發的電信等級安全資訊與事件管理（SIEM）與線上分析處理（OLAP）方案[^4]。客戶使用 Geedge 的產品從事監控時，主要操作的就是 Cyber Narrator 的使用者介面，它也是 Geedge 唯一為非技術人員設計的產品。實際使用時，政府分析人員會在國家指揮控制中心的辦公室裡，透過 Cyber Narrator 存取資料。

Cyber Narrator 功能強大，可以追蹤到個別用戶層級的網路流量，也能把行動網路用戶的活動對應到特定的基地台識別碼（Cell ID），即時找出用戶所在的地理位置。系統也讓政府客戶查看彙整後的網路流量，因此 Cyber Narrator 可以用來監控特定地理區域裡的網路使用者群體，例如抗議現場或大型群眾活動。

<figure markdown="span">
  [![圖 2](https://assets.anoni.net/the-internet-coup/index-5-14-1.png)](https://assets.anoni.net/the-internet-coup/index-5-14-1.png){target="_blank"}
  <figcaption>圖 2：Cyber Narrator 位置地圖的截圖，可以看到系統如何監控特定區域裡的人群。六角形的顏色代表人口密度，畫面上的資料包括 CID、MSISDN（手機門號）與群體分類。範例把上海的特定行動網路用戶標記為恐怖分子首腦。Cyber Narrator 的使用者可以點選六角形查看用戶數，並區分當地居民、外來訪客與使用漫遊服務的人。</figcaption>
</figure>

Cyber Narrator 的資料來源有兩個，一是 Geedge 的資料倉儲方案 TSG Galaxy 所蒐集的資料，二是 Geedge Networks 開發的另一項工具 WebSketch。WebSketch 是由 Geedge 託管與營運的網路情報搜尋服務，也是 Geedge 唯一不架設在客戶端的機房、改由 Geedge 自行託管的產品。WebSketch 的資料來自 Geedge 自己的網路調查，以及從第三方資料仲介取得的資訊彙整。

WebSketch 整合 Shodan 與 Greynoise 這兩個熱門資安情報服務的功能。WebSketch 和 Shodan 一樣，會掃描整個網際網路，依裝置獨有的識別碼找出網路攝影機、路由器、伺服器等連網裝置。WebSketch 也仿照 Greynoise，讓客戶可以把 IP 位址、網域名稱等本身沒有意義的識別碼，標記為與特定網路服務有關，例如微信之類的通訊 App 或虛擬私人網路（VPN）服務。WebSketch 明顯以 Greynoise 為藍本，Geedge 的設計文件甚至寫明員工開發新功能時要參考 Greynoise。本報告分析的外洩資料中，有一份在中國新疆部署 Cyber Narrator 的詳細需求清單，明訂產品要能辨識「可疑」的通訊模式，例如使用 VPN 與國際漫遊。

Cyber Narrator 在新疆的使用情境（詳見[第 6 章](./index_6.md)的中國一節）清楚顯示，Cyber Narrator 可以讓政府客戶與安全部隊更容易標記個別用戶。用戶遭到標記的原因，可能是使用規避工具，或使用政府客戶認為可能有惡意的其他應用程式、造訪這類網頁。Cyber Narrator 的分析能力也能用來阻擋使用者連上特定網站或 VPN 服務。政府客戶還可以透過 Cyber Narrator，找出在限制生效之前就造訪過特定內容、使用過特定服務的人。實際上，客戶國家可以「回到過去」，找出曾經造訪某個網站、而網站後來才列為非法的人。公民自由與言論自由可能因此受到令人憂心的影響，網路使用者可能因為當時合法的線上活動遭到識別、監控，甚至受罰。這項能力仰賴 Geedge 另一項產品天狗安全閘道（TSG）的大規模資料蒐集與彙整功能，詳見「天狗安全閘道」一節。

## TSG Galaxy，大規模監控的彙整分析 { #TSG-GALAXY聚合分析以進行大規模監控 }

TSG Galaxy 是 Geedge Networks 的擷取、轉換、載入（ETL）資料倉儲方案，專為涵蓋整個網際網路的大規模監控而設計。TSG Galaxy 在客戶國家蒐集並彙整大量資訊，對象包括所有網路使用者，以及在網路上傳送的內容。TSG Galaxy 建立在開源的 Apache Kafka 串流處理平台上[^5]，Apache Kafka 是常見的資料處理軟體，經常用在網路零售商與廣告商的顧客分析。本研究分析的外洩資料包含 TSG Galaxy 的 SQL 結構描述（schema）[^6]，從中可以看出 TSG Galaxy 用來儲存所有 TCP 與 UDP 連線的紀錄，以及國內所有的 SIP 通話連線。TCP 與 UDP 是寬頻與行動網路主要使用的傳輸協定，SIP 則是網路電話（VoIP，Voice over Internet Protocol）使用的協定，大多數現代電話網路都以 VoIP 為基礎。也就是說，TSG Galaxy 不只能監控網際網路上的流量與內容，也能監控電話通話。

TSG Galaxy 使用 IP 流量資訊匯出（IPFIX）分析流量，並以深度封包檢測（DPI）擷取中繼資料。透過 DPI 可以擷取詳細的指紋，包括傳輸層安全（TLS）與 QUIC 連線的伺服器名稱指示（SNI，連線時以明文送出的網站名稱）、DNS 查詢與電子郵件標頭。TSG Galaxy 也採用 JA3 雜湊值這類連線指紋辨識技術，讓 Cyber Narrator 找出模式，協助判斷使用者的作業系統，以及連線時用的是哪些應用程式。這項技術可以協助辨識使用者是否用 VPN 這類規避工具隱藏流量或繞過審查。在 TSG Galaxy 裡，這些資訊會結合 ISP 提供的資訊，對應到個別網路使用者，使用的識別碼包括 IP 位址、用戶 ID、IMEI（手機的裝置序號）與 IMSI（SIM 卡上的用戶識別碼）[^7]。從 TSG Galaxy 擷取的中繼資料會送進一個資料庫，客戶可以透過 Cyber Narrator 查詢。

本研究的一項重要發現是，TSG Galaxy 在政府客戶所在地蒐集的網路使用者資料，Geedge Networks 的員工似乎都能存取。從資料看來，真實客戶資料的快照有時會分享給中國科學院（中科院）的 Mesalab 實驗室（Massive and Effective Stream Analysis），這個學術實驗室看起來與 Geedge Networks 關係密切。資料也透露，Mesalab 的工程系學生可能曾用真實世界的客戶資訊做研究，目的是更了解並阻擋規避網路審查的行為。Geedge 與相關單位保留客戶資料多久，目前仍不清楚。

<figure markdown="span">
  [![圖 3](https://assets.anoni.net/the-internet-coup/index-5-16-2.png)](https://assets.anoni.net/the-internet-coup/index-5-16-2.png){target="_blank"}
  <figcaption>圖 3：Mesalab 文件裡的照片，記錄一趟新疆出差（2021 年 3 月 14 日至 4 月 28 日），可能是中國科學院的成員或畢業生在部署 TSG 期間，於伺服器機房裡拍攝。照片收在一份報告裡，報告的重點是實驗室的政治、科學與商業目標，並引用一段號召科學家為中國國家利益服務的話。據稱北京團隊因為辦公空間有限，只好「窩」在伺服器機房裡。</figcaption>
</figure>

<figure markdown="span">
  [![圖 4](https://assets.anoni.net/the-internet-coup/index-5-16-1.png)](https://assets.anoni.net/the-internet-coup/index-5-16-1.png){target="_blank"}
  <figcaption>圖 4：流量紀錄匯入系統、資料從 TSG 流向 Cyber Narrator 的過程。一位網路使用者想連上「example.com」，網路請求先送到 ISP 的基礎設施，由 TSG-X 擷取。TSG-X 向 Sanity Directory 查詢這個 IP 的使用者是誰。Sanity Directory 從 ISP 的信令（signaling，電信網路用來建立連線、驗證用戶的控制訊息）取得身分，回傳 Jane Doe（代稱）。TSG-X 在這個 IP 上標記擁有者的名字與造訪的網站，寫成一筆紀錄存進 TSG Galaxy。之後，政府官員就能在 Cyber Narrator 查詢 Jane Doe 造訪過哪些網站。</figcaption>
</figure>

## 天狗安全閘道，審查與控制中心

天狗安全閘道（TSG）是 Geedge Networks 的旗艦產品，屬於電信等級或國家等級的防火牆與流量管理方案，功能完整，可以和中國的防火長城（GFW）相提並論。TSG[^8] 可以監看整個國家所有使用者的流量，也能辨識並封鎖網頁內容與應用程式。TSG 和企業環境裡部署的防火牆設備相去不遠，差別在於規模可以擴充到處理整個國家的網際網路流量。這項技術看起來不受任何維護人權的倫理防線約束。

TSG 的功能相當廣泛，包括以深度封包檢測做到的監控與審查、辨識並封鎖 VPN 與規避工具、對流量限速、監控、追蹤、標記並封鎖個別網路使用者，還能讓使用者感染惡意軟體。下方各節先說明這些功能，再詳細介紹 TSG 的軟硬體如何部署與管理。

<figure markdown="span">
  [![圖 5](https://assets.anoni.net/the-internet-coup/index-5-17-1.png)](https://assets.anoni.net/the-internet-coup/index-5-17-1.png){target="_blank"}
  <figcaption>圖 5：TSG 緬甸主儀表板的截圖，呈現即時流量的快照，依總頻寬與活躍連線數分類。畫面上也有 Network Zodiac 提供的監控摘要，以及用來管控網路流量、目前啟用中的規則（policy）數量。下方是受監控的網際網路流量，依用戶端（Client）、伺服器 IP 與熱門應用程式（Top Applications）分類。</figcaption>
</figure>

### TSG 的功能 { #TSG-的功能能力 }

#### 深度封包檢測

TSG 對 IP 封包使用深度封包與流量檢測技術，對應用程式與使用者的流量做進階的分類、攔截與竄改。TSG 可以深入檢視多種傳輸與應用協定，包括 HTTP、DNS、電子郵件、TLS、QUIC 與 SIP。TSG 設計成可以同時監控網際網路流量與電話通訊，還能辨識並審查特定的應用程式與網站，以及封鎖 VPN 和其他規避方法。TSG 也能即時竄改 HTTP 連線，手法包括偽造重新導向回應、修改標頭、注入指令碼、替換文字與覆寫回應內容。

TSG 可以比對一系列中繼資料，包括 IP 位址、主機名稱、內建與使用者自訂的分類、URL 與 TLS 指紋，據此封鎖、監控、攔截或竄改網路流量。連線沒有用 TLS 加密時，TSG 甚至能攔截 HTTP 標頭特徵、密碼、電子郵件信箱、附件與電子郵件內容。此外，TSG 也能擷取電話通訊的中繼資料，包括發話與受話雙方的電話號碼。

TSG 分析 TLS 流量的方法主要有兩種。第一種是用中間人攻擊（MITM）的技術完整解密，前提是用戶要安裝一張自簽的根憑證授權單位（CA）憑證。第二種是用深度封包檢測與機器學習技術，從加密流量擷取中繼資料。第二種比較常用，因為網路使用者完全無法察覺，不需要安裝 CA 憑證，也不必設定任何代理伺服器。兩種方法也可以混用，只對特定的一部分網域完整解密。解密後的流量還可以鏡像到另一台設備做進一步檢查。負責執行 TLS 中間人攻擊的元件稱為天狗前端引擎（Tiangou Frontend Engine，TFE）。

Geedge 採用兩種不同的 TLS 分析方法，可能與在哈薩克部署時做的決定有關，哈薩克是 Geedge 最早的客戶國家之一。遠在 Geedge 成立之前，哈薩克第一次嘗試實施全國性審查，就曾考慮要求所有網路使用者安裝一張由政府控制的 TLS 憑證授權單位憑證。政府若自行營運 CA、在全球網路的信任體系之外運作，就能攔截所有加密流量。不過每台裝置都需要手動安裝憑證，實務上不可行，國際瀏覽器廠商封鎖這張根憑證之後，做法便宣告失敗。[第 6 章](./index_6.md)的哈薩克一節有更詳細的說明。

#### 封鎖 VPN 與規避工具 { #阻擋-VPN-和翻牆工具 }

TSG 也用深度封包檢測全面辨識 VPN 與規避工具使用的協定，例如 OpenVPN 與 WireGuard。接著客戶可以和 Geedge Networks 合作制定規則集，封鎖特定服務供應商的連線。Geedge 管理一座行動裝置農場，在受控的環境裡安裝並執行 VPN 應用程式。此外，Geedge Networks 的員工似乎可以在辦公室裡架設 Wi-Fi 網路，讓任何裝置從遠端連進客戶的網路，用來確認封鎖機制在真實環境中確實有效。

即使 TSG 無法辨識使用者活動所對應的應用程式或服務，也能把任何異常的大流量標記為可疑。標記之後，系統可以設定在預定的時間後封鎖這些流量，例如 24 小時。這個做法與外界對 GFW 的觀察相符，GFW 也會在一段時間後封鎖高頻寬的加密流量，即使無法判斷流量的實際性質[^9]。

AppSketch 是集中存放特徵檔的資料庫。Geedge 在這裡依流量指紋[^10]替所有服務供應商建立特徵檔，客戶便能選擇性地封鎖 VPN 與其他應用程式，同時保留給核准的公司或政府機關使用。有了 AppSketch，制定封鎖規則的人不需要深厚的技術知識，政府客戶就能把特定公司列入白名單、允許使用 VPN，並決定哪些 VPN 可以放行。舉例來說，依緬甸的《網路安全法》，緬甸政府維護一份可以使用受限 VPN 與應用程式的公司名單（詳見[第 6 章](./index_6.md)的緬甸一節）。

Geedge Networks 正在開發名為 AppSketch Works 的沙盒引擎，用來自動產生應用程式的分類特徵檔。這類產品一旦完成，客戶只要在手機上執行任何應用程式，系統就能自動學會如何在網路上封鎖它。

不過在資料外洩的時候，AppSketch Works 專案似乎還在開發初期，原型也收到客戶的負面回饋，原因是設定需要較高的技術能力，而且有誤判分類的問題[^11]。即便如此，這項工具仍然值得留意。工具若進一步開發，Geedge 將可以把定義封鎖規則的責任轉移給政府客戶，客戶也不必每次都把這項工作外包給 Geedge。

<figure markdown="span">
  [![圖 6](https://assets.anoni.net/the-internet-coup/index-5-20-1.png)](https://assets.anoni.net/the-internet-coup/index-5-20-1.png){target="_blank"}
  <figcaption>圖 6：從 Geedge Networks 資料集擷取的 AppSketch 截圖。截圖出自一份給客戶的操作指南，說明更新封鎖功能時，要先刪除針對各應用程式的舊版封鎖規則，再上傳新的規則。</figcaption>
</figure>

#### 流量限速 { #限制流量 }

TSG 內建流量整形（traffic shaping）功能，可以優先處理或限速特定服務的流量，降低服務品質而不直接封鎖。實作方式有兩種，一是直接整形流量，二是加上差異化服務代碼點（DSCP）標記，DSCP 是限制或優先處理流量的業界標準。我們從這裡再次看到，Geedge 的客戶可以使用任何廠牌的網路設備，這些設備都能與 TSG 相容。

#### 使用者信譽分數 { #賦予使用者聲譽分數 }

Sanity Directory（SAN），又稱使用者信譽流量管理系統，是一套用戶感知系統，設計用來讓 TSG 與 ISP 既有的信令，以及 RADIUS、3GPP、電信等級網路位址轉換（CGNAT）等身分驗證、授權與計費（AAA）協定緊密整合。整合之後，流量就能對應到真實身分。

系統可以替每位用戶維護一個信譽分數，依據是用戶的線上活動，以及系統掌握了他多少個人資訊。用戶的信譽分數大幅下降時，網路服務可能遭到切斷，用戶可能需要通過附照片的身分證件與臉部辨識驗證，證明身分並提高分數。此外，系統可以把個別用戶標記為已知的 VPN 使用者，之後持續追蹤他的網路使用情況，把未來任何無法辨識的高頻寬流量都歸類為可疑。網路使用者換用新的 VPN 供應商時，這種針對個人的分類可能讓原本尚未辨識出來的服務也遭到辨識與封鎖。新的 VPN 可能因此曝光，受牽連的除了已遭辨識的那位網路使用者，還有這項服務的所有其他使用者。

#### 個別網路使用者的識別與封鎖 { #識別和封鎖個別網路使用者 }

TSG 也能辨識共用同一個公有 IP 位址的個別網路使用者。TSG 內含自己實作的網路位址轉換（NAT），稱為 WAN-NAT，可以用來源 NAT（SNAT）模式實作 CGNAT，也可以用目的地 NAT（DNAT）模式，把要送往網際網路的流量重新導向。例如，TSG 可以把原本要送到公共 DNS 解析器的流量，轉送到電信業者或政府控制的 DNS 解析器。TSG 也能偵測並封鎖使用網路共用（tethering）功能、把手機的網路連線分享給其他裝置的用戶[^12]。這幾項功能的特別之處，在於吸引的是 ISP 而非政府客戶，對應的是網路管理與節省成本的需求。除了範圍更廣的監控與審查功能，再提供這些吸引 ISP 的服務，或許有助於讓 ISP 願意在自己的網路上安裝 Geedge 的系統。

#### 惡意軟體感染 { #用惡意軟體感染使用者 }

TSG 具備路徑內注入（in-path injection）功能，可以在網路上傳輸的檔案裡插入惡意程式碼。Geedge Networks 毫不掩飾這項功能的用途，就是在網際網路流量通過 TSG 系統時植入惡意軟體。這項功能類似其他路徑內注入系統，例如 FinFisher 過去販售的 FinFly ISP 系統，以及在埃及用來把使用者導向有害流量的 Sandvine PacketLogic 系統。TSG 可以在使用者造訪的網頁注入惡意的 JavaScript 與 CSS，也能即時竄改使用者下載的執行檔，嵌入惡意程式碼。

透過路徑內注入，TSG 可以讓惡意程式碼精準鎖定特定使用者，即時修改多種格式的檔案，包括 HTML、CSS、JavaScript，還有 Android 的 APK 檔、Windows 的 EXE 檔、macOS 的 DMG 磁碟映像檔與 Linux 的 RPM 套件。TSG 也能竄改 JPG、GIF、PNG、SVG 等多種圖片格式，ZIP、RAR 等壓縮檔格式，以及文書檔案、PDF、JSON 與 XML 檔案。Cyber Narrator 的分析功能也能從旁配合，找出最適合劫持的網址，用來感染特定的人，例如鎖定某個人常造訪、卻沒有使用 TLS 的網站。

舉例來說，Geedge 的政府客戶不必猜測如何鎖定一位使用者。政府客戶可以回頭查看這位網路使用者過去的活動，看他是否做過讓裝置容易遭到入侵的事，再利用這個弱點，在之後感染他的裝置。

#### DDoS 即服務 { #DDoS-作為一項服務 }

前面描述的功能可以用來讓使用者感染任何其他公司提供的傭兵間諜軟體（mercenary spyware，由商業公司開發、賣給政府監控特定對象的間諜軟體）。不過 Geedge Networks 自己也嘗試把路徑內注入功能武器化，格外引人注意。

外洩資料集裡最令人費解的 Geedge Networks 產品之一是 DLL Active Defence，比較像是會在網路犯罪黑市看到的產品。DLL Active Defence 乍看之下像是用來防禦分散式阻斷服務（DDoS）攻擊的系統，仔細檢視才發現，它實際上是對政治上不受歡迎的網站與其他網路服務發動 DDoS 攻擊的平台。DLL Active Defence 看起來是 Geedge 自己實作的中國「大砲」（Great Cannon），公民實驗室（Citizen Lab）在 2015 年的報告裡記錄過大砲的運作[^13]。

也就是說，國家防火牆封鎖的網站，只有國內民眾無法連上，DLL Active Defence 則能讓全世界的網路使用者都無法連上同一個網站，範圍不限於國家防火牆之內。

<figure markdown="span">
  [![圖 7](https://assets.anoni.net/the-internet-coup/index-5-23-1.png)](https://assets.anoni.net/the-internet-coup/index-5-23-1.png){target="_blank"}
  <figcaption>圖 7：網路使用者造訪網站時 TSG 系統的處理流程。TSG 會先檢查國家中心的中央管理系統定義的規則。符合政府所定規則的流量會放行，再送到使用者端，不允許的流量則即時遭到封鎖或竄改。</figcaption>
</figure>

DLL 的做法是掃描網際網路，找出遞迴 DNS 伺服器這類可以放大流量的節點，當作反射式阻斷服務攻擊的發射台。DLL 再利用 TSG 的路徑內注入功能，讓毫不知情的使用者電腦加入攻擊，形成殭屍網路（botnet）。這是首次證實有資安公司向客戶提供實質上等同「booter」的 DDoS 租用服務（DDoS-for-hire）。

### TSG 的運作方式

我們在下方從技術面分析 TSG 背後的軟體開發做法與網路硬體運作。內容雖然細節很多，但要理解系統實際的功能與實作方式，這些資訊不可或缺。

#### TSGX，Geedge 的整合式硬體方案 { #TSGXGeedge-的整合硬體解決方案 }

天狗安全閘道主要以整合式硬體方案 TSGX 的形式銷售。TSGX 起初執行在 HP Enterprise 與 DELL 提供的白牌硬體（不掛原廠品牌、由其他廠商貼上自家品牌銷售的硬體）上。現在 TSGX 改用中國伺服器製造商寧暢（Nettrix）提供的硬體。寧暢是超級電腦製造商中科曙光（Sugon）分拆出來的公司，中科曙光因為遭指控與中國人民解放軍有關聯，受到美國政府制裁。

<figure markdown="span">
  [![圖 8 與圖 9](https://assets.anoni.net/the-internet-coup/index-5-24-1.png)](https://assets.anoni.net/the-internet-coup/index-5-24-1.png){target="_blank"}
  <figcaption>圖 8 與圖 9：左側是中國伺服器製造商寧暢提供的硬體上的 TSG-X（圖 9），右側是 HP Enterprise 提供的白牌硬體上的 TSG-X（圖 8）。</figcaption>
</figure>

TSG 節點設計成可以組成叢集，網際網路流量通過叢集時會分散到各個節點。一般的防火牆部署只有一台設備，或為了備援準備兩台。TSG-X 則可以水平擴充，客戶可以自行增加節點，每多一個節點就能多處理一些網際網路流量。各個節點透過網路封包代理器相連，依來源與目的地平衡流量負載。NPB 是硬體設備，從資料可以看到，有些部署案用的是第三方廠商的 NPB，例如 Niagara Networks。Geedge 也提供自家的產品 Ether Fabric，後面會再說明。

TSG 叢集裡的節點由中央管理系統（Central Management，CM）集中管理，這套系統也以舊的內部代號 Bifang（毕方）稱呼[^14]。中央管理系統提供網頁介面與應用程式介面（API），用來操作與設定執行防火牆的所有 TSG 硬體[^15]。

#### TSG-OS

Geedge 的軟體開發做法相當現代。TSG 使用 Geedge Networks 自行開發的作業系統 TSG-OS，以 Red Hat Enterprise Linux 為基礎，初始佈建使用開放網路安裝環境（Open Network Install Environment，ONIE）。TSG-OS 以現代的 DevOps 工具建置，用 Ansible 做部署與宣告式設定，TSG 的各個元件則以 Docker 與 K3s（輕量版 Kubernetes）容器化。這種架構與許多老牌西方網路設備廠商的做法大不相同，老牌廠商的程式碼往往累積數十年的舊有複雜度。Geedge Networks 成立於 2018 年，相較之下提供的軟體明顯現代得多。

TSG-OS 也能執行在一般的通用硬體上，或以虛擬設備的形式運作，這點值得注意。例如在巴基斯坦的初期營運中，TSG-OS 部署在加拿大公司 Sandvine 的 ActiveLogic 硬體上，硬體是改作他用的舊設備。Sandvine 先前向埃及等威權政權提供深度封包檢測技術，因而受到外界檢視，也遭美國政府制裁。Sandvine 在 2024 年整頓業務做法、制裁隨後解除，Geedge Networks 可能從中看到商機，向受制裁影響的政權提供替代的作業系統與技術支援合約。Geedge 打進巴基斯坦市場，沿用 Sandvine 既有的硬體，協助巴基斯坦降低成本。[第 6 章](./index_6.md)的巴基斯坦一節有更詳細的說明。

<figure markdown="span">
  [![圖 10](https://assets.anoni.net/the-internet-coup/index-5-25-1.png)](https://assets.anoni.net/the-internet-coup/index-5-25-1.png){target="_blank"}
  <figcaption>圖 10：外洩資料中與 Geedge 巴基斯坦部署相關的示意圖。PCAP、MSH 與 TWA 是部署 Geedge 系統的三座資料中心。圖中可以看到 TSG-OS 安裝在加拿大公司 Sandvine 的 ActiveLogic 硬體上。</figcaption>
</figure>

#### MARSIO

MARSIO 是 Geedge Networks 在 Linux 使用者空間（userspace）實作的第二層與第三層網路轉送平面（forwarding plane），在 TSG-OS 裡提供交換與路由功能。主要功能包括 VLAN 與生成樹協定（spanning tree）等交換功能，以及最長前綴比對（longest-prefix match）的路徑選擇、路由權重排序、相容 OSPF 與 BGP 等協定的路由功能。通過天狗安全閘道的封包，大多數不必經過 Linux 核心的資料平面與轉送平面，避開核心的限制，深度封包檢測因此更有效率。Linux 核心的網路堆疊先天效率不佳，所以其他網路設備廠商也常採用這種架構。MARSIO 以資料平面開發套件（Data Plane Development Kit，DPDK）為基礎，DPDK 是 Linux 基金會管理的開源專案。

使用開源的 DPDK，讓 Geedge 的網路堆疊不受限於特定的硬體廠商，因為與各種網路硬體相容的工作，DPDK 專案已經替 Geedge 完成。

#### Ether Fabric

Ether Fabric 是網路封包代理器，用來在叢集架構裡連接多個 TSG 節點並平衡負載。Ether Fabric 依 IP 五元組（5-tuple，來源與目的地的 IP 位址、連接埠，加上傳輸協定）的雜湊值，把受監控的流量分配到各個節點，可以用主動（串接，in-line）或被動（鏡像，mirrored）的方式部署。這樣的負載平衡方式，讓同一條連線的封包永遠送到同一個 TSG 節點，避免腦裂（split-brain，同一條連線分散到不同節點，各節點掌握的狀態互相矛盾）問題。除了平衡負載，Ether Fabric 也能挑出特定的網路流，導向特定節點。Ether Fabric 是 Geedge Networks 自行設計的專用硬體產品，據我們所知，也是 Geedge 產品線中唯一不採用市售白牌硬體的產品。

<figure markdown="span">
  [![圖 11](https://assets.anoni.net/the-internet-coup/index-5-26-1.png)](https://assets.anoni.net/the-internet-coup/index-5-26-1.png){target="_blank"}
  <figcaption>圖 11：Ether Fabric 硬體的照片。Ether Fabric 是 Geedge Networks 唯一的專用硬體，從照片可以看到先進電信運算架構（AdvancedTCA，ATCA）規格的外觀。</figcaption>
</figure>

Ether Fabric 的硬體元件大多可以互換。硬體採用 ATCA 規格，屬於電信設備常用的模組化工業電腦規格。各個元件裝在抽取式托架（sled）上，背面有專用接頭連接電源與乙太網路，資料中心常用的通用伺服器很少採用這種規格。交換板以中國公司 Beijing Hengguang Information Technology Co., Ltd.（恒光信息）的 VELA 平台為基礎。Ether Fabric 內部使用 Barefoot Networks（隸屬 Intel）的 3.2 Tbit/s 交換晶片，晶片可以用 P4 程式語言編寫。P4 是用來管理網路設備封包轉送平面的程式語言。

恒光 VELA 平台的公開資訊有限，不過硬體看起來與中國公司 EmbedWay 生產的 OptiWay ATCA 平台相似。此外，用文件中管理介面的 MAC 位址查詢廠商，結果顯示部分硬體可能由台灣公司凌華科技（ADLINK Technology Inc.）製造。控制平面以 Open Network Linux 為基礎，由 Geedge Networks 自行開發。

P4 程式語言與目標硬體無關（target-independence），所以 Barefoot 交換晶片可以替換。外洩資料中有資訊顯示，Geedge Networks 已經評估過 AMD、博通（Broadcom）與 Mellanox（隸屬 NVIDIA）的替代方案。例如，P4 也能用在以 FPGA 為基礎的平台，像是 EmbedWay 其他產品採用的 Intel PA8921 加速卡。根據 Intel 在官方網站發布、至今仍可在網路上取得的 2023 年 11 月技術簡報，Intel 確實提供加速卡給 EmbedWay，用於深度封包檢測應用[^16]。不過我們的研究並未發現 Geedge Networks 使用這些加速卡的證據。

## Network Zodiac，網路硬體的監控 { #Network-Zodiac-監控網路硬體 }

Network Zodiac（Nezha，哪吒）是 Geedge Networks 開發的全網資產管理與監控方案[^17]。Network Zodiac 似乎以 Grafana 為範本，Grafana 是許多企業使用的熱門開源分析與監控平台。Network Zodiac 和 Grafana 一樣，讓組織能以視覺化的方式即時掌握網路的效能、使用情況與錯誤。不過 Grafana 主要分析的是軟體應用程式，Network Zodiac 則把功能延伸到分析網路硬體設備的效能[^18]。Network Zodiac 能監控的設備數量也多得多。客戶可以用這項產品診斷整個網路的問題。Network Zodiac 採用分散式的監控架構，由名為「NZ-TALON」的軟體代理程式從每個節點（個別的硬體設備）蒐集資料，再把所有指標彙整到政府客戶或 ISP 營運的資料中心。資料接著傳送到全域的 NZ-Agent 執行個體長期保存，客戶可以在 Network Zodiac 的網頁介面查詢這個全域執行個體，取得並以視覺化方式呈現彙整後的效能指標。

<figure markdown="span">
  [![圖 12](https://assets.anoni.net/the-internet-coup/index-5-28-1.png)](https://assets.anoni.net/the-internet-coup/index-5-28-1.png){target="_blank"}
  <figcaption>圖 12：從 Geedge Networks 資料集擷取的 Network Zodiac 儀表板截圖，顯示受監控設備的地圖，以及每座資料中心裡的設備狀態。</figcaption>
</figure>

Network Zodiac 與熱門開源方案的一大差異，是內建網頁終端機，網路管理員可以用 SSH 從遠端連上任何受監控的端點。客戶因此可以直接存取網路設備，排除問題與管理設備，但也讓客戶暴露在重大的資安風險中。最壞的情況下，駭客可能取得客戶在國內部署的所有安全設備的存取權。這種取捨顯示，Geedge 把大規模管理的便利與易用放在基本資安之前。

[^4]: 資料中看到的客戶部署案，Cyber Narrator 都執行在中國伺服器製造商浪潮（Inspur）的高密度儲存伺服器上。軟體本身不綁定特定硬體，可以部署在任何廠商的通用伺服器硬體上。
[^5]: TSG Galaxy 以 Apache Kafka 為基礎，並使用 Apache Druid 資料儲存、Apache Flink 分散式處理引擎與 ClickHouse 分析資料庫。
[^6]: SQL 結構描述（schema）基本上就是資料庫的組織架構。
[^7]: 也就是說，TSG Galaxy 的客戶可以把網路流量對應到一個 IP 位址，也能對應到特定的手機或 SIM 卡。
[^8]: 在中國神話裡，天狗常以狗的形象出現，在日食或月食時吞食太陽或月亮。
[^9]: Mingshi Wu et al.，[How the Great Firewall of China Detects and Blocks Fully Encrypted Traffic](https://www.usenix.org/conference/usenixsecurity23/presentation/wu-mingshi){target="_blank"}，Proceedings of the 32nd USENIX Security Symposium，2023 年 8 月 9 日至 11 日，美國加州安納罕。
[^10]: Geedge 與 Mesalab 的學生用自行修改的開源工具 tcpdump 擷取這些指紋，修改版稱為 tcpdump_mesa。指紋擷取之後，再用四套深度封包檢測系統的其中一套轉換成規則集。第一套是 SAPP（Stream Analyze Process Platform），以 C 語言撰寫的封包解析與注入函式庫。第二套是 Stellar，有狀態防火牆的外掛平台，抽象層級比 SAPP 高。第三套是宣告式系統 Maat，用 Maat 開發新規則不需要程式設計知識，SAPP 與 Stellar 則需要。Maat 可以比對常見的連線指紋，包括 IP 位址、網域名稱、TLS 的 SNI、JA3/JA4 指紋，比對條件寫在 JSON 檔案裡。TSG 叢集的各節點透過 Redis 資料庫同步 Maat 的規則，讓每個節點套用相同的規則。第四套深度封包檢測系統由兩個二進位檔組成，檔名是「libqmengine.so」與「libqmbundle.so」。外洩資料裡沒有這套系統的原始碼，只有 Jira 工單提到它，稱為 QDPI 或「第三方识别引擎库」（third-party recognition engine library），可見它可能不是 Geedge Networks 開發的。我們分析的 Jira 工單裡，有人擔心無法修改第三方引擎的行為，也有人提到難以取得技術支援的聯絡窗口，更佐證兩個二進位檔並非 Geedge Networks 自行開發。初步逆向工程的結果顯示，這兩個二進位檔參與網路協定與服務的分類。與第三方引擎的整合，是透過名為 qdpi_detector 的 Stellar 外掛完成。
[^11]: Geedge 找了中國國內的一個地區客戶試用這套系統。軟體的初期版本收到這個客戶的負面回饋，主要原因是要和應用程式互動，需要用 Python 撰寫使用者介面自動化指令碼。終端使用者通常沒有撰寫指令碼的能力，成為很大的障礙。此外，客戶擔心自動分類流程可能誤判，把廣告聯播網與第三方函式庫產生的其他網路請求誤當成指紋，造成誤報。
[^12]: 目前市面上的網路共用偵測方案，大多分析收到的 IP 封包的存活時間（TTL）值，TSG 採用的方法更精密。TSG 結合被動式作業系統偵測技術與深度封包檢測，辨識與強制登入頁面（captive portal）偵測有關的 HTTP 請求，也就是所謂的 generate_204 請求，這類請求依使用的作業系統而不同。因此，只要有用戶透過行動連線、以桌上型電腦的作業系統上網，系統就會視為有網路共用的跡象。天狗安全閘道採用的另一種技術，是分析 TCP 時間戳記（TCP Timestamp）值的差異。在現代的 TCP 協定堆疊中，時間戳記是開機時以隨機值初始化的計數器，數值不一致代表網路位址轉換（NAT）後面有多台裝置。
[^13]: Bill Marczak et al.，[China’s Great Cannon](https://citizenlab.ca/2015/04/chinas-great-cannon/){target="_blank"}，2015 年 4 月 10 日（原報告誤植為 2025 年）。
[^14]: 在中國神話裡，畢方是一種單腳的鳥，是不祥之兆，尤其與火災有關，據說牠一出現，當地就可能發生災禍。
[^15]: 中央管理系統整合統一身分驗證，背後有一個中央設定儲存區，負責把設定同步到叢集裡的各個節點，也整合容錯移轉（failover）機制，確保營運不中斷。在底層，CM 透過 RESTful API 查詢叢集裡各元件的狀態與故障資訊。這組 API 在內部稱為 TSG-OAM，OAM 是營運與維護（Operations and Maintenance）的縮寫。
[^16]: Intel Corporation，[EmbedWay Shipping PA8921 FPGA Acceleration Card Based on Intel Agilex® 7 FPGAs F-Series Optimized for DPI and RDMA Network Acceleration](https://web.archive.org/web/20250624201825/https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2023-11/embedway-shipping-pa88921-fpga-acceleration-card-solution-brief.pdf){target="_blank"}，技術簡報（Solution Brief），2023 年 11 月。
[^17]: 在中國神話裡，哪吒是一位護法神，常以少年戰士的形象出現。（譯註：原報告正文寫作「哪吃」，應為「哪吒」。）
[^18]: Network Zodiac 的主要差異，在於可以同時使用 Prometheus 與 PromQL，以及網路設備上更普遍的簡易網路管理協定（SNMP）。

*[DPI]: 深度封包檢測，逐一分析封包內容、判斷是否放行的技術
*[MITM]: 中間人攻擊，攻擊者介入通訊雙方之間，攔截或竄改內容
*[TSG]: 天狗安全閘道，Geedge Networks 的旗艦防火牆與流量管理產品
*[Geedge Networks]: 積至公司，開發並出口審查與監控技術的中國公司
*[Geedge]: 積至公司，開發並出口審查與監控技術的中國公司
