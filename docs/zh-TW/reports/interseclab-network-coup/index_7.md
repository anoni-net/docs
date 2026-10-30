---
title: 封鎖網路隱私與規避工具
description: Geedge 的設備在客戶國家封鎖 Tor、VPN 與 Psiphon 的手法，以及這些工具受到的影響。
icon: material/arrow-right-bottom
---

# :material-file-outline: 封鎖網路隱私與規避工具

!!! note ""

    - 本章翻譯自 InterSecLab 的報告「[The Internet Coup: A Technical Analysis on How a Chinese Company is Exporting The Great Firewall to Autocratic Regimes](https://interseclab.org/wp-content/uploads/2025/09/The-Internet-Coup_September2025.pdf){target="_blank"}」（[報告介紹頁](https://interseclab.org/research/the-internet-coup/){target="_blank"}），以正體中文、臺灣用語翻譯。
    - 本章對應原報告目錄（INDEX）的第 7/8 章。
    - 歡迎[參與討論](./index.md#參與討論)，或查看譯文的[更新紀錄](./index.md#更新紀錄)。

客戶國家正用 Geedge Networks（積至公司）的產品封鎖部分隱私與規避工具。具體來說，外洩文件顯示，Geedge 的設備曾用來阻擋使用者連上 Tor、VPN，以及 Psiphon 等規避工具。

## 對 Tor 的封鎖 { #封鎖-Tor }

Tor 網路是免費、開放原始碼的系統，設計目的是加強上網的隱私與匿名性。許多想保護隱私的人都在用 Tor，例如身處高壓統治地區的記者與社運人士，以及想規避網路審查的人。Tor 的去中心化網路由全球超過 7,000 個志工營運的中繼節點組成，採用洋蔥路由（onion routing）技術轉送流量。使用者的流量會依序經過三個中繼節點，每一段都經過加密，外界很難追查使用者的上網活動。Tor 採用多種技術手段躲避深度封包檢測（DPI）與其他審查技術的偵測，例如不公開列出的橋接中繼節點（bridge relay，沒有列在公開清單上的入口節點），但仍有一些政府設法限制或封鎖使用者連上 Tor[^73]。

從外洩資料可以看到 Geedge Networks 封鎖 Tor 的許多重要細節。緬甸與中國的客戶正積極限制使用者連上 Tor，主要針對以 Tor 為基礎的行動版 App，例如 Android 版 Tor Browser 與 Orbot（讓手機上的其他 App 經由 Tor 連線的工具）。開放網路干擾觀測站（Open Observatory of Network Interference，OONI）的資料，以及 Tor Project 公布的中繼節點統計，都顯示 Tor 從 2024 年 5 月起在緬甸遭到有效封鎖。外洩文件證實先前的推測，這些限制確實是用 Geedge Networks 的設備實施的。

Tor 橋接的完整清單沒有公開，但使用者無法直接連上 Tor 時，可以向橋接的發放管道索取一小部分橋接。雖然橋接經常有增有減，整體集合仍相對固定，因此有心的對手反覆向橋接發放系統查詢，最後可能彙整出幾乎完整的清單。我們無法明確判斷 Geedge Networks 是自行蒐集這些資訊，還是從第三方取得。

Snowflake 是一種可插拔傳輸（pluggable transport，替 Tor 流量換上其他協定外觀、躲避偵測的模組），把 Tor 流量偽裝成 WebRTC 流量，用來規避深度封包檢測。WebRTC 是常用於語音與視訊會議的點對點協定。Geedge 成功封鎖 Tor 的直接連線之後，緬甸使用者的 Tor Browser 預設連線方式改為 Snowflake。

WebTunnel 是 Tor 新推出的可插拔傳輸，可以把網路流量偽裝成無害的 HTTPS 網頁流量。在資料外洩的時間點，Geedge Networks 似乎還沒有任何有效對付 WebTunnel 的手段。不過我們在調查中發現，中國科學院 Mesalab 實驗室（Massive and Effective Stream Analysis）的學生做過初步研究，探討封鎖 WebTunnel 的可能方法。由此看來，Geedge Networks 知道 WebTunnel 是有效的審查規避方法，只是到資料外洩時還沒有發展出有效的封鎖措施。

我們已與 Tor Project 協調，以負責任揭露（先私下通知開發團隊，再對外公開）的方式處理這些發現。我們要特別強調，目前沒有找到任何證據，顯示 Geedge Networks 發現或正在利用 Tor 軟體或 Tor 設計上任何先前未知的漏洞。

## 對 VPN 的封鎖 { #封鎖-VPN }

VPN（虛擬私人網路）是一種服務，在使用者的裝置與遠端伺服器之間建立安全、加密的連線，隱藏使用者的 IP 位址。使用者可以讓網路流量經由不同的地點轉送，看起來就像從另一個國家上網。

VPN 的主要用途是保護企業網路之間的通訊，但也常用來規避審查，協助使用者繞過政府或網路管理者設下的限制。VPN 使用者連上設在其他地區、當地沒有封鎖這些內容的伺服器，就能造訪在自己國家可能受限的網站與服務。各國封鎖 VPN 的規定不盡相同。全面封鎖 VPN 會干擾用 VPN 規避審查的人，也會干擾其他用途，例如企業環境中為了法規遵循而使用 VPN。

政府客戶會把想封鎖的 VPN 應用程式清單交給 Geedge，再由 Geedge 替客戶制定封鎖規則。外洩文件顯示，這些工作主要針對行動版的 VPN App。

Geedge Networks 用逆向工程制定封鎖規則，同時採用靜態分析與動態分析。靜態分析是反編譯 App 的原始碼，找出會回傳伺服器清單的 API，再封鎖清單上的伺服器。動態分析是實際執行 VPN App，分析它的網路流量，找出可用於封鎖的特徵。

從外洩資料中的證據看來，Geedge Networks 在多家熱門 VPN 業者持有付費帳號，用來分析並封鎖這些業者的 App。天狗安全閘道（TSG）的硬體也能辨識 IPSec、OpenVPN 與 WireGuard 等常見的 VPN 協定。

## 繞過 Psiphon 防護的手法 { #繞過-Psiphon-的保護措施 }

Psiphon 由加拿大的 Psiphon Inc. 開發，是免費、開放原始碼的網路規避工具，協助使用者繞過網路審查、取得受限的內容[^74]。

Psiphon 主要在網路審查嚴重的國家使用，包括中國、伊朗、埃及與土耳其[^75]。在政治動盪期間，例如 2021 年緬甸的反軍政府抗議與 2021 年的古巴抗議，Psiphon 是民眾取得遭審查資訊的重要管道。

Psiphon3 用名為混淆伺服器清單（Obfuscated Server Lists，OSL）的機制，把伺服器節點的資訊發送給用戶端。跟其他 VPN 應用程式不同，Psiphon3 的伺服器清單經過加密，使用的方法稱為伺服器清單加密金鑰（SLOK）。加密的目的是確保只有受信任的用戶端能取得完整的伺服器節點清單，防止自動化程式與伺機而動的對手大量抓取這些資訊。

根據外洩資料，Geedge Networks 似乎開發了名為 Psiphon3-SLOK 的內部工具，試圖繞過這項防護措施。這個工具的用途是持續抓取混淆伺服器清單，產生一份要封鎖的 IP 位址清單，再透過 TSG Galaxy 發送到客戶據點的 TSG 節點。

我們跟 Psiphon 團隊討論時得知，2024 年 5 月下旬，來自緬甸的使用者急遽增加，用戶端選擇伺服器的方式也出現變化，符合有人先做伺服器列舉（逐一找出伺服器位址）、再針對性封鎖的情形。這段期間正好是 Geedge 系統在緬甸部署的時間。Psiphon 提供的內部資料顯示，從 2024 年 5 月 30 日開始，Psiphon 記錄到約 50 萬名新使用者。緬甸的流量原本分散在多種取得伺服器的方式（REMOTE 與 EMBEDDED），後來轉成以 OBFUSCATED 伺服器為主，這類伺服器要達到一定條件才解鎖（merit-based）。從這個轉變可以看出，許多伺服器同時遭到部分 ISP（網路服務供應商）封鎖。雖然有些伺服器遭到封鎖，以連線通道維持的時間與傳輸的資料量衡量，整體連線品質仍維持正常。封鎖持續的時間與嚴重程度因 ISP 而異。

Psiphon 用多層的流程讓用戶端找到可用的伺服器（server discovery）。首先，EMBEDDED 伺服器在安裝時就已內建，提供一份馬上可用的節點清單。接著，用戶端在第一次連線之後取得 DISCOVERY 伺服器，增加可連線的選擇。REMOTE 伺服器可以從遠端取得，OBFUSCATED 伺服器則要達到一定條件才解鎖，設計上較安全，特別難以列舉與封鎖。

從 2024 年 5 月起，也就是 Geedge 整套系統在緬甸部署的時間，Psiphon 觀察到使用者行為明顯轉變。REMOTE 使用者的比例下降，OBFUSCATED 的使用比例相應增加。有人試圖靠伺服器列舉封鎖 Psiphon 時，預期就會出現這樣的變化。由此可見，Geedge 封鎖 Psiphon 的行動只有部分成功，使用者持續調整做法，找到其他連線途徑。

[^73]: Sentinel HASP 最初由馬里蘭州的小公司 Aladdin Knowledge Systems 開發，之後先後由 SafeNet、Gemalto 收購，目前屬於法國航太與國防巨擘 Thales 集團。（譯註：原報告這則註腳的內容與所在段落無法對應，內容與原報告第 55 頁、[第 6 章「西方公司的共謀」](./index_6.md#西方公司的共謀)一節的正文相同，照原文翻譯。）
[^74]: Brody Ford，[Cubans Evade Internet Curbs with U.S.-Backed Tech PSIPHON](https://www.bloomberg.com/news/articles/2021-07-16/over-1-million-cubans-evade-internet-curbs-with-u-s-backed-tech){target="_blank"}，Bloomberg，2021-07-16。
[^75]: Brody Ford，[Cubans Evade Internet Curbs with U.S.-Backed Tech PSIPHON](https://www.bloomberg.com/news/articles/2021-07-16/over-1-million-cubans-evade-internet-curbs-with-u-s-backed-tech){target="_blank"}，Bloomberg，2021-07-16。

*[TSG]: 天狗安全閘道，Geedge Networks 的旗艦產品，國家等級的防火牆與流量管理系統
*[ISP]: 網路服務供應商，提供上網連線的電信或網路業者
*[OONI]: 開放網路干擾觀測站，蒐集各國網路審查量測資料的計畫
