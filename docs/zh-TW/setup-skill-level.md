---
title: 自我技能評估表
icon: octicons/paste-24
---

# :octicons-paste-24: 自我技能評估表

這裡提供一份自我評估的量表，方便快速定位對於 Tor、Tails、OONI 瞭解的程度。如果不知道從哪裡開始學習，可以把評估表當作學習的指引參考。

!!! info "如何使用評估表"

    | 層級 | 你能做到的事 | 適合對象 |
    |------|------------|---------|
    | **認識** | 閱讀文件、理解概念 | 任何想了解網路自由議題的人 |
    | **實作** | 動手安裝、日常操作工具 | 記者、公民社會工作者、任何需要保護通訊安全的人 |
    | **貢獻** | 技術建置、資料分析、社群參與 | 具備基本命令列操作或資料分析能力的開源社群成員 |

## Tor 技能分級

=== ":material-checkbox-marked-circle-outline: 認識"

    **自我評估**（勾選你已能做到的項目）：

    - [ ] 我能夠說明 Tor 的運作原理（洋蔥路由、三層中繼節點）。
    - [ ] 我能夠解釋網路自由為何重要，以及匿名網路的用途。
    - [ ] 我能夠描述自己所在地區的網路自由現況。
    - [ ] 我能夠說明不同地區在網路自由上的差異，並舉出具體事例。

    ??? tip "還沒到這個程度？從這裡開始"
        1. 閱讀「[什麼是 Tor？](./what-is-tor.md){target="_blank"}」（約 5–10 分鐘）
        2. 閱讀「[什麼是匿名網路？](./what-is-anonymous-network.md){target="_blank"}」
        3. 閱讀「[網路自由為什麼重要？](./internet-freedom-matter.md){target="_blank"}」
        4. 完成後回來勾選清單，確認自己的理解。

    !!! abstract "參考說明"

        ??? question "Tor 的運作原理。"

            可以先從「[什麼是 Tor？](./what-is-tor.md){target="_blank"}」章節開始了解。

            Tor 通常指「洋蔥路由（The Onion Router）」，透過三層節點將網路連線隨機轉送到三台主機進出。「Tor 瀏覽器」是 Tor 團隊利用開源瀏覽器 Firefox ESR 針對洋蔥網路所設計的，方便連結 `.onion` 結尾的網站。

            :octicons-question-24: **補充說明**

            1. **Tor 的背景**：Tor 最初由美國海軍研究實驗室開發，目的是保護政府的資訊傳遞，後來開放給大眾使用，以支持言論自由和隱私保護。
            2. **運作方式**：Tor 將你的網路流量加密並隨機轉送多個中繼節點，使流量難以被追蹤。
            3. **隱私與安全**：Tor 能防止網路監控和流量分析，也能繞過地理封鎖和網路審查。
            4. **限制**：速度通常比一般連線慢，且若使用者主動洩露身份資訊（如登入帳號），仍可能被識別。
            5. **法律考量**：在部分國家或地區，使用 Tor 可能受到法律限制，使用前應了解當地規定。

        ??? question "網路自由為何重要？匿名網路是什麼？"

            可以先從「[網路自由為什麼重要？](./internet-freedom-matter.md){target="_blank"}」章節開始了解。

            :octicons-question-24: **補充說明**

            1. **網路自由的重要性**：網路自由涉及言論自由、資訊流通和隱私權。自由的網路讓人們可以不受拘束地交流思想、獲取資訊，對民主和創新的發展至關重要。在部分國家，政府可能封鎖網站、限制社群媒體，甚至監控個人流量。
            2. **匿名網路是什麼**：匿名網路讓使用者能在隱藏身份的情況下瀏覽網路，保護使用者的隱私及安全。這些網路依賴多層加密及路由技術（例如 Tor 洋蔥路由），讓使用者的流量難以被追蹤。
            3. **優點與風險**：匿名網路可以保護隱私，幫助使用者繞過網路審查。但也被部分非法活動利用，使用者在獲得匿名性的同時，必須理解由此帶來的風險。

        ??? question "你所在地區的網路自由現況如何？"

            網路自由的現況因地而異，可以從以下幾個角度來理解自己所在地區的狀況：

            :octicons-question-24: **補充說明**

            1. **國際排名與報告**：「自由之家」（Freedom House）每年發布《網路自由》年度報告，評估各國在網路訪問開放性、言論自由及用戶權利保障方面的表現，是一個很好的參考起點。
            2. **台灣的狀況**：根據多份國際評估，台灣的網路自由度名列前茅，民眾可自由瀏覽大多數國際網站，也能公開表達不同的政治觀點。但假消息和網路霸凌是現存挑戰。
            3. **香港、馬來西亞的參照**：香港在《國家安全法》實施後，網路自由度受到影響。馬來西亞在政治敏感時期也曾出現部分內容的封鎖。這些例子說明，網路自由的狀況可能在短時間內出現明顯變化。

        ??? question "網路自由在不同地區的差異。"

            這是一個開放的議題，建議自行搜尋、了解不同地區的網路自由狀況。以下提供幾個起點：

            **關鍵字**

            1. **網路自由報告**：搜尋「Freedom House Internet Freedom Report」了解各國排名。
            2. **防火長城（Great Firewall）**：中國大陸的網路審查機制。
            3. **國家安全法（National Security Law）**：香港影響網路自由的法律。
            4. **網路中斷（Internet Shutdowns）**：與緬甸、伊朗等地相關的事件。
            5. **網路監控法規（Internet Surveillance Laws）**：各國的監控措施與影響。

            **值得關注的事件**

            1. **2021 年緬甸軍事政變**：對該國網路自由的衝擊。
            2. **新加坡防止網絡謠言法案（POFMA）**：假訊息法案的實施效果。
            3. **泰國街頭示威與王室批評**：政府對網路言論的壓制。
            4. **越南的內容封鎖措施**：具體的網路使用控制案例。

=== ":material-checkbox-marked-circle-outline: 實作"

    **自我評估**（勾選你已能做到的項目）：

    - [ ] 我能夠下載並安裝 Tor 瀏覽器。
    - [ ] 我能夠說明 Bridge、Snowflake、WebTunnel 各自的使用場景。
    - [ ] 我能夠判斷是否應搭配 VPN 使用 Tor，以及兩者的差異。
    - [ ] 我能夠透過直接連線與橋接方式連接 Tor 網路，並已實際使用至少一週。
    - [ ] 我能夠操作切換目前的連線路徑（New Tor Circuit）。
    - [ ] 我能夠連線到 `.onion` 網域。

    ??? tip "還沒到這個程度？從這裡開始"
        1. 前往 [Tor Project 官方網站](https://www.torproject.org/zh-TW/download/){target="_blank"} 下載 Tor 瀏覽器。
        2. 安裝後，用 Tor 瀏覽器進行日常瀏覽，持續至少一週，熟悉其介面與特性。
        3. 嘗試連線到本專案的 `.onion` 網站，確認橋接連線方式也能運作。

    !!! abstract "參考說明"

        ??? question "Tor 瀏覽器的連線方式。"

            「[Tor 瀏覽器](https://www.torproject.org/zh-TW/download/){target="_blank"}」是 Tor 團隊利用開源瀏覽器 [Firefox ESR](https://www.mozilla.org/zh-TW/firefox/enterprise/){target="_blank"} 長期支援版本針對洋蔥網路所設計的，方便連結 `.onion` 結尾的網站。目前 [Brave](https://brave.com/zh-tw/){target="_blank"}、[Mullvad](https://mullvad.net/zh-hant/browser){target="_blank"} 瀏覽器也支援連結 `.onion` 網站。

            Tor 瀏覽器與一般瀏覽器相似，但特別強調隱私保護，並能有效阻擋廣告追蹤。連線到一般網站時，資料會隨機經過三台 Tor 中繼傳輸。連線到 `.onion` 網站時，則在第三台中繼之後進入 `.onion` 網路。

            :octicons-question-24: **補充說明**

            1. **匿名瀏覽**：流量經過隨機選擇的中繼伺服器，進行多層加密和路由，使追蹤來源的難度大幅提高。
            2. **規避審查**：流量被轉送至多個國家的中繼伺服器，使監控和過濾機制難以辨識和阻止連線請求。
            3. **臨時使用設計**：關閉 Tor 瀏覽器後，瀏覽歷史、Cookies、登入資訊等臨時資料會自動清除。
            4. **開放原始碼**：Tor 的原始碼公開，允許開發人員和安全專家進行檢視與修正。

        ??? question "Tor 橋接（Bridge）類型：Bridge、Snowflake、WebTunnel。"

            橋接（Bridge）伺服器的存在，是為了幫助受到網路審查或封鎖的使用者連上 Tor。以下是幾種不同類型的 Tor 橋接：

            1. **Bridge**：最基本的 Tor 橋接類型。橋接是一種不列於公開 Tor 網路中的秘密入口點，因此不易被封鎖。使用者可手動取得橋接來連線 Tor 網路。（可參考如何取得 [Tor Bridge](https://bridges.torproject.org/){target="_blank"}）
            2. **Snowflake**：透過 WebRTC 協議讓志工使用瀏覽器成為臨時的 Tor 入口點。因為動態且去中心化，封鎖難度較高。（可參考如何安裝 [Snowflake](https://snowflake.torproject.org/){target="_blank"}）
            3. **WebTunnel**：使用 HTTPS 伺服器作為入口點，流量難以與一般 HTTPS 流量區分，適合應對更複雜的封鎖策略。（可參考如何建立 [WebTunnel](https://community.torproject.org/relay/setup/webtunnel/){target="_blank"}）

        ??? question "各橋接類型的使用場景與時機。"

            1. **Bridge**：適合在對 Tor 有基本封鎖的環境（如某些學校、職場），足以解決大多數基於 IP 的封鎖。
            2. **Snowflake**：面臨類似中國、伊朗等使用深層封包檢測（DPI）的強力封鎖時，Snowflake 是更好的選擇。
            3. **WebTunnel**：當其他橋接類型均失效，且面臨極端封鎖策略時嘗試使用。其 HTTPS 偽裝能更有效地隱藏 Tor 流量。

        ??? question "是否可以透過 VPN 連線 Tor？"

            透過 VPN 連接 Tor 是常見做法，常見有兩種方向：

            1. **Tor-over-VPN**：先連接到 VPN，再從 VPN 連接到 Tor。這是較常使用的方式。原始 IP 被隱藏在 VPN 伺服器後，ISP 無法看到你正在使用 Tor。VPN 也能幫助繞過對 Tor 入口的封鎖。
            2. **VPN-over-Tor**：先連接到 Tor，再透過 Tor 使用 VPN。這種配置較少見，需要 VPN 提供商支援透過 Tor 連接，且不一定能對 IP 提供額外保護。

        ??? question "安裝 Tor 瀏覽器並實際使用至少一週。"

            1. 前往 [Tor Project 官方網站](https://www.torproject.org/zh-TW/){target="_blank"}，下載適用於你的作業系統的 Tor 瀏覽器。
            2. 完成下載後，按照指示安裝並啟動 Tor 瀏覽器。
            3. 在整個使用的一週內，用 Tor 瀏覽器進行日常的網路瀏覽，熟悉介面和特性，注意使用時的匿名性與安全性，也留意可能造成的不便之處。

        ??? question "透過直接連線與橋接方式連線到 Tor 網路。"

            1. 啟動 Tor 瀏覽器時，通常會看到瀏覽器正在建立連線。
            2. 輸入網址即直接透過 Tor 網路瀏覽，此途徑最適合未封鎖 Tor 網路的地區。
            3. 可透過網址列左側第一個圖示（Tor Circuit，類似 :material-map-marker-path: 的圖示）點擊查看目前的路線與連線方式。
            4. 假設你的網路封鎖了 Tor，請選擇「設定（Settings）」、「連線（Connection）」、「橋接（Bridges）」，從內建橋接伺服器類型中選擇，或輸入你從其他途徑取得的橋接連結資訊。

        ??? question "操作切換目前的連線路徑。"

            1. 透過網址列左側第一個圖示（Tor Circuit）點擊查看目前的路線與連線方式。
            2. 點擊最後一行「New Tor circuit for this site」，讓 Tor 瀏覽器重新建立連線路徑。這在出口節點剛好被網站阻擋時，可以嘗試切換不同國家的方式連線。

        ??? question "連線至 .onion 網域。"

            1. 連線到[專案網站](https://anoni.net/docs/){target="_blank"}，注意網址列後方出現紫色按鈕「.onion available」，按下後即可跳轉到 `.onion` 網域。當出現這個按鈕，表示該網站有主動提供指引連線到 `.onion` 網域。
            2. DuckDuckGo 也提供了 `.onion` 服務：<https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion/>{target="_blank"}

=== ":material-checkbox-marked-circle-auto-outline: 貢獻"

    **自我評估**（勾選你已能做到的項目）：

    - [ ] 我能夠清楚區分 Tor（洋蔥路由協定）、Onion 網路、Tor 瀏覽器三者各自所指的技術。
    - [ ] 我能夠使用 Snowflake 瀏覽器擴充套件建立 Tor 橋接。
    - [ ] 我能夠啟動 Tor 服務並透過 SOCKS v5 方式讓其他程式使用。
    - [ ] 我能夠在 [metrics.torproject.org](https://metrics.torproject.org){target="_blank"} 查詢特定地區的中繼點狀態。
    - [ ] 我能夠建立並維護 Tor Relay 中繼點。
    - [ ] 我能夠建立 Tor Bridge 橋接點或 WebTunnel 中繼點。
    - [ ] 我能夠建立 `.onion` 網站。

    ??? tip "還沒到這個程度？從這裡開始"
        1. 先完成「實作」層的所有項目。
        2. 閱讀「[如何搭建 Tor Relay](./setup-tor-relay.md){target="_blank"}」，了解中繼站的安裝與設定流程。
        3. 參考「[Tor Relays 觀測點](./watcher-tor-relays.md){target="_blank"}」，了解如何觀察中繼站的運作狀況。
        4. 參考「[Tor Snowflake](./tor-snowflake.md){target="_blank"}」，了解如何透過瀏覽器或獨立程式提供 Snowflake 橋接。

    !!! abstract "參考說明"

        ??? question "Tor、Onion 網路、Tor 瀏覽器的區別。"

            - **Tor（洋蔥路由協定）**：指底層的匿名路由技術，透過多層加密與中繼節點傳遞流量，使流量來源難以被追蹤。
            - **Onion 網路**：指以 `.onion` 結尾的隱藏服務網路，只能透過 Tor 協定存取。
            - **Tor 瀏覽器**：以 Firefox ESR 為基礎，整合 Tor 協定的瀏覽器，讓一般使用者能方便地連線 Tor 網路與 `.onion` 網站。

        ??? question "使用 Snowflake 瀏覽器擴充套件建立橋接。"

            Snowflake 讓你用瀏覽器成為一個臨時的 Tor 橋接，協助受審查地區的使用者連線。

            1. 在 Chrome 或 Firefox 安裝 [Snowflake 擴充套件](https://snowflake.torproject.org/){target="_blank"}。
            2. 安裝後會自動運作。你可以在擴充套件圖示上查看目前轉發的連線數量。
            3. 可參考專案頁面「[Tor Snowflake](./tor-snowflake.md){target="_blank"}」的詳細說明。

        ??? question "啟動 Tor 服務並透過 SOCKS v5 方式連線。"

            除了 Tor 瀏覽器之外，也可以在系統中直接安裝並啟動 Tor 服務，讓其他程式透過 SOCKS v5 使用 Tor 網路。

            1. 在 Debian/Ubuntu 安裝：`apt install tor`
            2. 預設 SOCKS v5 埠號為 `9050`。
            3. 在支援 SOCKS v5 代理的程式中，設定代理伺服器為 `127.0.0.1:9050` 即可使用 Tor 網路。
            4. 可用 `curl --socks5-hostname 127.0.0.1:9050 https://check.torproject.org/api/ip` 確認是否已透過 Tor 連線。

        ??? question "在 metrics.torproject.org 查詢中繼點狀態。"

            [Tor Metrics](https://metrics.torproject.org){target="_blank"} 提供 Tor 網路的各種統計資料，包括中繼點數量、頻寬使用、地區分布等。

            1. 前往 [Relay Search](https://metrics.torproject.org/rs.html){target="_blank"}，可依國家、名稱或 Fingerprint 搜尋中繼點。
            2. 以臺灣（TW）為例，可在「Advanced options」中選擇 Country: TW，查看目前運作中的中繼站清單。
            3. 也可以在「[Tor Relays 觀測點](./watcher-tor-relays.md){target="_blank"}」頁面查看本專案整理的視覺化觀測資料。

        ??? question "建立並維護 Tor Relay 中繼點。"

            建立 Tor Relay 需要具備 Linux 基本操作能力，以及一台具有固定 IP 和穩定頻寬的伺服器。

            完整的安裝與設定步驟請參考「[如何搭建 Tor Relay](./setup-tor-relay.md){target="_blank"}」，其中涵蓋：

            - Middle Relay 的安裝與設定（`/etc/tor/torrc`）
            - Bridge 橋接點的建立
            - WebTunnel 中繼點的建立
            - 安裝後的維護注意事項

        ??? question "建立 .onion 網站。"

            `.onion` 網站是只能透過 Tor 網路存取的隱藏服務。建立時需要在伺服器端設定 Tor 服務，並指定隱藏服務的本地監聽埠號。

            官方文件請參考 [Tor Project | Set up Your Onion Service](https://community.torproject.org/onion-services/setup/){target="_blank"}。

## Tails 技能分級

=== ":material-checkbox-marked-circle-outline: 認識"

    **自我評估**（勾選你已能做到的項目）：

    - [ ] 我能夠說明 Tails 是什麼，以及它與一般作業系統的主要差異。
    - [ ] 我能夠說明 Tails 適合在什麼情境下使用，以及它的主要限制。
    - [ ] 我能夠解釋網路自由為何重要，以及匿名網路的用途。（與 Tor 認識層相同）
    - [ ] 我能夠描述自己所在地區的網路自由現況。（與 Tor 認識層相同）

    ??? tip "還沒到這個程度？從這裡開始"
        1. 閱讀「[什麼是 Tails？](./what-is-tails.md){target="_blank"}」（約 5–10 分鐘）
        2. 「網路自由」與「匿名網路」的背景知識與 Tor 認識層相同，可先完成「[Tor 認識](#Tor-技能分級)」再回來繼續。
        3. 完成後回來勾選清單，確認自己的理解。

    !!! abstract "參考說明"

        ??? question "Tails 是什麼，以及它的運作原理。"

            可以先從「[什麼是 Tails？](./what-is-tails.md){target="_blank"}」章節開始了解。

            Tails 是一個以安全為核心設計的可攜式作業系統，從 USB 隨身碟開機後運行於記憶體中，不在你使用的電腦上留下任何痕跡。所有對外的網路連線預設透過 Tor 網路傳輸。

        ??? question "網路自由為何重要？匿名網路是什麼？"

            這部分的背景知識與 Tor 認識層相同，請參考「[Tor 認識](#Tor-技能分級)」中的對應說明，以及「[網路自由為什麼重要？](./internet-freedom-matter.md){target="_blank"}」章節。

        ??? question "你所在地區的網路自由現況如何？"

            這部分的背景知識與 Tor 認識層相同，請參考「[Tor 認識](#Tor-技能分級)」中的對應說明。

=== ":material-checkbox-marked-circle-outline: 實作"

    **自我評估**（勾選你已能做到的項目）：

    - [ ] 我能夠製作 Tails 開機隨身碟，並從 USB 開機進入 Tails。
    - [ ] 我知道哪些 Mac 機型無法使用 Tails，原因為何。
    - [ ] 我了解 Tails 的主要使用情境與限制。
    - [ ] 我能夠建立持久性加密磁區（Persistent Storage）。
    - [ ] 我能夠設定 Bridge 橋接，調整 Tails 的 Tor 連線方式。
    - [ ] 我能夠使用 OnionShare 透過 Tor 網路分享檔案，並已實際使用 Tails 至少一週。

    ??? tip "還沒到這個程度？從這裡開始"
        1. 前往 [Tails 官方網站](https://tails.net/){target="_blank"} 下載 Tails 映像檔。
        2. 準備一個至少 8GB 的 USB 隨身碟，使用 [Balena Etcher](https://etcher.balena.io/){target="_blank"} 製作開機碟。
        3. 參考 [Tails 官方安裝指南](https://tails.net/install/index.en.html){target="_blank"} 完成製作並從 USB 開機。
        4. 使用 Tails 進行一週的日常操作，熟悉其功能與設定。

    !!! abstract "參考說明"

        ??? question "如何製作 Tails 開機隨身碟。"

            - **下載 Tails**：前往 [Tails 官方網站](https://tails.net/){target="_blank"}，下載 Tails ISO 映像檔。
            - **準備工具**：需要一個至少 8GB 的 USB 隨身碟，以及 [Balena Etcher](https://etcher.balena.io/){target="_blank"} 或 [Rufus](https://rufus.ie/zh_TW/){target="_blank"} 等工具來製作開機碟。
            - **安裝與製作**：參閱[官網提供的製作流程](https://tails.net/install/index.en.html){target="_blank"}，選擇合適的作業系統執行。

        ??? question "設定電腦從 USB 隨身碟開機。"

            - **進入 BIOS/UEFI 設定**：重新啟動電腦後，按下對應的按鍵（如 F2、F12、Delete）進入 BIOS 或 UEFI 設定。
            - **調整開機順序**：在開機選單中，調整設定使 USB 隨身碟成為主要開機裝置。儲存變更後重新啟動，系統將自動從 USB 開機。

        ??? question "哪些 Mac 機型無法使用 Tails？"

            - **不支援的類型**：使用 Apple T2 晶片或 Apple Silicon（M 系列晶片）的 Mac，由於啟動安全機制，可能無法順利從非蘋果認證的 USB 裝置啟動。

        ??? question "Tails 的使用情境與限制。"

            - **使用情境**：Tails 主要針對需要高隱私保護的人士，例如記者、人權工作者，或任何希望匿名瀏覽的人。它運行於記憶體中，關閉後不會在電腦上留下資料。
            - **限制**：
                1. **硬體相容性**：對某些新型無線網卡的驅動程式支援有限。
                2. **操作習慣**：Tails 基於 Linux（Debian）和 GNOME 桌面環境，對不熟悉 Linux 的人有一定的學習曲線。
                3. **永久儲存**：雖然可建立持久性加密磁區保留部分資料，但 Tails 的設計初衷是不留痕跡。
                4. **頻繁更新**：為確保安全性，Tails 更新頻繁，需持續保持更新。

        ??? question "建立持久性加密磁區（Persistent Storage）。"

            - 開啟 Tails 後，在桌面上找到「Applications」選單，選擇「Tails」、「Configure persistent volume」。
            - 依照指示設定持久性加密磁區，這個區域讓你可以保存設定檔案、電子郵件等個人資料，並透過加密保護資料安全。
            - 完成後，當你重啟 Tails 時，可在登入頁面選擇是否啟用這個加密磁區。

        ??? question "使用 Bridge 設定 Tails 的 Tor 連線。"

            - 登入 Tails 後，會出現連線到 Tor 的網路設定畫面。
            - 若你的地區封鎖了直接連接至 Tor，選擇設定橋接（Bridge）方式。
            - 可選擇內建的橋接，或手動輸入已取得的橋接資訊以繞過封鎖。

        ??? question "使用 OnionShare 分享檔案。"

            - OnionShare 是一個可以透過 Tor 網路安全分享檔案的工具。
            - 在 Tails 的「Applications」選單中找到並啟動 OnionShare。
            - 透過拖放或選取檔案的方式，將想分享的檔案載入 OnionShare。
            - 啟動分享後，OnionShare 會生成一個 `.onion` 網址，將這網址提供給信任的人，他們即可使用 Tor 瀏覽器下載。

=== ":material-checkbox-marked-circle-auto-outline: 貢獻"

    **自我評估**（勾選你已能做到的項目）：

    - [ ] 我能夠透過 Thunderbird 設定 Gmail 信箱的接收與傳送（IMAP 協定）。
    - [ ] 我能夠將 Tails 更新到下一個最新版本。
    - [ ] 我理解 MAC 位址匿名化（MAC Address Anonymization）的作用。
    - [ ] 我能夠備份持久性加密磁區（Persistent Storage）到另一個 USB。
    - [ ] 我能夠使用 GNOME Secrets 管理密碼。
    - [ ] 我能夠使用 GnuPG 與 Kleopatra 建立加密金鑰並加密檔案。
    - [ ] 我能夠透過 Thunderbird 寄送加密郵件。

    ??? tip "還沒到這個程度？從這裡開始"
        1. 先完成「實作」層的所有項目。
        2. 在 Tails 中啟動 Thunderbird，依照提示設定 IMAP 帳號。
        3. 參考 [Tails 官方文件](https://tails.net/doc/index.en.html){target="_blank"} 中關於 GNOME Secrets 和 GnuPG 的操作說明。

    !!! abstract "參考說明"

        ??? question "透過 Thunderbird 設定 Gmail（IMAP 協定）。"

            1. 在 Tails 中開啟 Thunderbird。
            2. 依照設定精靈，輸入 Gmail 帳號，選擇 IMAP 協定。
            3. Gmail 目前需要使用「應用程式密碼（App Password）」才能在 Thunderbird 中驗證，需先在 Google 帳號安全設定中開啟兩步驟驗證，再產生應用程式密碼。
            4. 完成設定後，電子郵件將透過 Tor 網路傳輸。

        ??? question "更新 Tails 到最新版本。"

            - Tails 內建自動偵測更新的功能。啟動 Tails 後，如果有新版本可用，系統會在桌面通知你。
            - 依照提示執行更新，更新過程需要另一個 USB 隨身碟來完成（從舊版克隆到新版）。
            - 詳細步驟可參考 [Tails 官方更新說明](https://tails.net/doc/upgrade/index.en.html){target="_blank"}。

        ??? question "MAC 位址匿名化（MAC Address Anonymization）。"

            - MAC 位址是網路卡的唯一識別碼，在同一個區域網路內可被其他裝置看到。
            - Tails 預設啟用 MAC 位址匿名化，啟動時會隨機產生一個虛假的 MAC 位址，避免你的設備在同一個 Wi-Fi 環境中被識別。
            - 如果你的網路需要固定 MAC 位址才能連線（如企業網路），可在 Tails 啟動選單中暫時停用此功能。

        ??? question "備份持久性加密磁區。"

            - 在 Tails 中，可以將持久性加密磁區複製到另一個 Tails USB 隨身碟作為備份。
            - 前往「Applications」、「Tails」、「Clone Tails」，依照步驟複製，選擇是否一併複製持久性磁區。
            - 建議定期備份，以防 USB 隨身碟損壞導致資料遺失。

        ??? question "使用 GNOME Secrets 管理密碼。"

            - GNOME Secrets 是 Tails 7.6 起取代 KeePassXC 的內建密碼管理工具，與 GNOME 桌面環境整合更緊密。
            - 啟動後，建立一個新的密碼資料庫，並設定一組主密碼。
            - 將所有帳號的密碼儲存在資料庫中，下次使用時只需記住主密碼即可。
            - GNOME Secrets 使用與 KeePassXC 相同的資料庫格式，原有的 KeePassXC 密碼資料庫可直接在 GNOME Secrets 開啟。
            - 資料庫檔案可儲存在持久性加密磁區中，以便下次使用 Tails 時取用。

        ??? question "使用 GnuPG 與 Kleopatra 建立加密金鑰並加密檔案。"

            1. 在 Tails 中開啟 Kleopatra（位於「Applications」、「Accessories」）。
            2. 建立一組新的 OpenPGP 金鑰對（包含公鑰與私鑰）。
            3. 公鑰可分享給他人，讓對方用來加密傳送給你的檔案或郵件。
            4. 私鑰保存在持久性加密磁區中。
            5. 可透過 Kleopatra 加密或解密檔案，也可透過 Thunderbird 寄送加密郵件。

        ??? question "透過 Thunderbird 寄送加密郵件。"

            - 完成 GNOME Secrets 金鑰建立與 Thunderbird 設定後，可以嘗試向本專案的加密郵件地址 `whisper@anoni.net` 寄送加密郵件。
            - 取得 `whisper@anoni.net` 的公開金鑰，請參考「[持續關注](./contact.md){target="_blank"}」頁面。
            - 在 Thunderbird 撰寫郵件，選擇加密後寄出，收件方會使用其私鑰解密。

## OONI 技能分級

=== ":material-checkbox-marked-circle-outline: 認識"

    **自我評估**（勾選你已能做到的項目）：

    - [ ] 我能夠說明 OONI 是什麼，以及它的目的。
    - [ ] 我能夠區分網路監視（surveillance）與網路審查（censorship）的差異。
    - [ ] 我能夠說明 OONI 的檢測運作方式。
    - [ ] 我能夠描述不同地區在網路監視與審查上的差異。

    ??? tip "還沒到這個程度？從這裡開始"
        1. 閱讀「[什麼是 OONI？](./what-is-ooni.md){target="_blank"}」（約 5–10 分鐘）
        2. 閱讀「[網路自由為什麼重要？](./internet-freedom-matter.md){target="_blank"}」
        3. 完成後回來勾選清單，確認自己的理解。

    !!! abstract "參考說明"

        ??? question "OONI 是什麼。"

            可以先從「[什麼是 OONI？](./what-is-ooni.md){target="_blank"}」章節開始了解。

        ??? question "網路監視（surveillance）與網路審查（censorship）的差異。"

            - **網路監視（surveillance）**：指政府、組織或個人監看和記錄使用者的網路活動，如電子郵件、搜尋歷史、網站瀏覽及通話。監視通常涉及深層封包檢測等技術，以獲取特定的流量資訊。
            - **網路審查（censorship）**：指限制或控制使用者對網際網路上某些資訊的訪問，包括封鎖網站、過濾內容或禁止某些關鍵字搜尋。審查往往由政府實施，也可能由企業或其他機構施行。

        ??? question "OONI 的檢測運作方式。"

            - OONI 提供免費的開源工具 OONI Probe，使用者可在自己的網路環境執行測試，檢測網路是否被審查。
            - OONI Probe 會定期發送請求至多個網站和服務，確認[名單上](./ooni-weblists.md){target="_blank"}的網站是否可以正常訪問。
            - 測試結果會匿名上傳到 OONI 的資料伺服器，並在 [OONI Explorer](https://explorer.ooni.org/zh-Hant){target="_blank"} 上公開，供研究者和公眾使用。

        ??? question "不同地區在網路監視與審查上的差異。"

            - **台灣**：網路環境相對自由，政府並未大規模實施網路審查或監控，對個人隱私權的保護也相對重視。
            - **中國大陸**：執行嚴格的網路封鎖和審查政策，通稱「防火長城（Great Firewall）」，限制訪問許多外國網站和服務。
            - **北韓**：對網路訪問進行極端限制，僅允許極少數精選內容。
            - **俄羅斯、伊朗**：進行不同程度的網路監控和網站封鎖。
            - 可參考「[網路自由為什麼重要？](./internet-freedom-matter.md){target="_blank"}」章節。

=== ":material-checkbox-marked-circle-outline: 實作"

    **自我評估**（勾選你已能做到的項目）：

    - [ ] 我能夠安裝並使用 OONI Probe 產生檢測報告。
    - [ ] 我能夠說明為何不建議在 VPN 下使用 OONI Probe 進行檢測。
    - [ ] 我了解 OONI Probe 在網路審查嚴格地區使用時的風險。
    - [ ] 我能夠說明 ASN 自治網路的運作方式。
    - [ ] 我能夠在 OONI Explorer 整理特定國家近期的觀測資料。
    - [ ] 我能夠透過 OONI Explorer 比較不同國家的觀測資料。
    - [ ] 我能夠建立 OONI Run 檢測連結，並找到該連結的線上報告。

    ??? tip "還沒到這個程度？從這裡開始"
        1. 前往 [OONI 官方網站](https://ooni.org/install/){target="_blank"} 下載並安裝 OONI Probe 應用程式。
        2. 啟動後執行一次完整的網站檢測，查看結果。
        3. 前往 [OONI Explorer](https://explorer.ooni.org/zh-Hant){target="_blank"} 查看你的測試結果出現在哪裡。

    !!! abstract "參考說明"

        ??? question "安裝並使用 OONI Probe 產生檢測報告。"

            - **安裝 OONI Probe**：透過 [OONI 官方網站](https://ooni.org/install/){target="_blank"} 下載 OONI Probe 應用程式。
            - **使用 OONI Probe**：
                - 啟動後，選擇要進行的測試類型，例如測試網站封鎖、即時通訊應用程式的連接性，或中間盒（middleboxes）干擾。
                - 點選開始測試後，OONI Probe 會自動執行檢測並產生結果。
                - 結果會上傳至 OONI 的伺服器，也可在 OONI Explorer 查看更詳細的報告。

        ??? question "為何不建議在 VPN 下使用 OONI Probe？"

            - VPN 會改變你的流量路徑和 IP 位址，可能導致 OONI Probe 測試到改變後的網路環境，而非你實際所在地的審查狀況。
            - OONI Probe 的目的是測試本地網路的審查情形，應在不使用 VPN 的情況下進行，才能反映真實的網路狀況。

        ??? question "使用 OONI Probe 時的風險。"

            - 在網路審查較嚴格的地區，使用 OONI Probe 進行檢測可能引起網路管理員的注意，應了解所在區域的網路政策，衡量使用可能帶來的風險。
            - OONI Probe 在測試時會訪問不同的網站和服務，可能觸發網路監控系統的記錄。

        ??? question "ASN 自治網路的運作。"

            - ASN 是用於識別自治網路（AS）的唯一識別碼。
            - 自治網路是由一個或多個網路服務提供者（ISP）或大型企業管理的一組 IP 位址區塊。每個 AS 透過 ASN 在網際網路上互相通訊，交換路由資訊。
            - 可參考「[ASNs 自治網路觀測資料分析](./ooni-asns-coverage.md){target="_blank"}」中的介紹。

        ??? question "透過 OONI Explorer 整理特定國家近期的觀測資料。"

            - 前往 [OONI Explorer](https://explorer.ooni.org/zh-Hant/){target="_blank"} 網站。
            - 在國家欄中選擇要查看的地區。
            - 使用日期範圍選擇功能，設定要查看的時間範圍。
            - 查看不同類型的測試結果，例如網站封鎖、即時通訊應用程式的連接狀況等。
            - 可下載或記錄這段期間出現的相關數據和事件，進行進一步分析。

        ??? question "透過 OONI Explorer 比較不同國家的觀測資料。"

            - 在 OONI Explorer 頁面上，縱軸（Rows）選擇「國家」，使用篩選器（Filters）分別選擇要比較的國家。（[參考設定](https://explorer.ooni.org/zh-Hant/chart/mat?test_name=web_connectivity&axis_x=measurement_start_day&since=2025-05-01&until=2025-05-30&time_grain=day&axis_y=probe_cc){target="_blank"}）
            - 查看這些國家在不同測試中的結果差異，包括網站封鎖、中間人攻擊檢測等。
            - 可匯出 CSV 資料進行進一步比較。

        ??? question "檢視目前網路封鎖的報告。"

            - 在 OONI Explorer 主頁中，可查看關於全球網路審查和封鎖的最新報告和趨勢。
            - 瀏覽「[搜尋](https://explorer.ooni.org/zh-Hant/search){target="_blank"}」，或搜尋特定服務和網站查看連接性狀況。
            - 也可查看「[網路審查](https://explorer.ooni.org/zh-Hant/social-media){target="_blank"}」底下不同的測試類型，例如社群網站、新聞媒體等。

        ??? question "建立 OONI Run 檢測連結並找到線上報告。"

            - 在 [OONI Run](https://run.ooni.org/){target="_blank"} 頁面提供電子郵件取得登入連結。
            - 透過連結登入後，依表單必填項目完成填寫。
            - 在「Add URL+」項目新增要檢測的網站網址。完成後按下「Create Link」完成建立。
            - 分享網址或點擊網址後，依引導開啟 OONI Probe 開始檢測。（[參考檢測](https://run.ooni.org/v2/10182){target="_blank"}）
            - 網址後方的數字（如 `https://run.ooni.org/v2/10182` 中的 `10182`）即為 OONI Run Link ID，可在 OONI Explorer 直接輸入 ID 查找檢測結果。（[參考結果](https://explorer.ooni.org/search?since=2025-04-29&until=2026-07-01&failure=false&ooni_run_link_id=10182){target="_blank"}）

=== ":material-checkbox-marked-circle-auto-outline: 貢獻"

    **自我評估**（勾選你已能做到的項目）：

    - [ ] 我能夠使用命令列的方式啟動 OONI Probe 並執行指定測試。
    - [ ] 我理解網站觀測名單（test lists）的收錄方式與分類標準。
    - [ ] 我能夠檢查現有名單中的網址狀況，標記需要更新或棄用的項目。
    - [ ] 我能夠提交 Pull Request 更新 Citizen Lab 的網站觀測名單。
    - [ ] 我能夠透過原始觀測資料（Raw Data）進行資料整理與分析。

    ??? tip "還沒到這個程度？從這裡開始"
        1. 先完成「實作」層的所有項目。
        2. 閱讀「[OONI 網站檢測清單](./ooni-weblists.md){target="_blank"}」，了解名單的收錄方式與現況。
        3. 閱讀「[ASNs 自治網路觀測資料分析](./ooni-asns-coverage.md){target="_blank"}」，了解原始資料的分析方式。
        4. 前往 [citizenlab/test-lists](https://github.com/citizenlab/test-lists){target="_blank"} GitHub 專案，瀏覽各國的名單格式。

    !!! abstract "參考說明"

        ??? question "使用命令列啟動 OONI Probe。"

            OONI Probe 除了圖形介面版本之外，也提供命令列工具（OONI Probe CLI）：

            1. 前往 [OONI Probe CLI 說明頁面](https://ooni.org/install/cli){target="_blank"} 下載適用版本。
            2. 安裝後，可使用 `ooniprobe run` 執行全部測試，或用 `ooniprobe run websites` 只執行網站檢測。
            3. 命令列版本適合在伺服器或定期排程環境下運行，方便持續觀測特定地區的網路狀況。

        ??? question "網站觀測名單的收錄方式。"

            OONI Probe 在進行「網站」檢測時，會根據 [Citizen Lab](https://citizenlab.ca/){target="_blank"} 維護的 [test-lists](https://github.com/citizenlab/test-lists){target="_blank"} 專案，逐一檢測名單上的網址。

            名單分為：
            - **全球（global）名單**：涵蓋全球熱門網站，以英語網站為主。
            - **本地（local）名單**：各地區提供，包含當地語言的分類內容，在有網路審查的國家也會收錄已遭封鎖的網站。

            名單的收錄分為四大類別：政治、社會、衝突與安全、網際網路工具。

            可參考「[OONI 網站檢測清單](./ooni-weblists.md){target="_blank"}」了解更多。

        ??? question "如何協助整理與更新名單。"

            目前台灣名單（`tw.csv`）大部分建立於 2017 年，有許多網址已失效或需要更新。貢獻的步驟如下：

            1. 前往 [citizenlab/test-lists](https://github.com/citizenlab/test-lists){target="_blank"} 找到 `lists/tw.csv`。
            2. 逐一檢查名單中的網址，標記需更新（網址失效、已更換域名）或可棄用（網站已停止營運）的項目。
            3. 修改完成後，提交 Pull Request 請求更新。
            4. 詳細流程可參考「[OONI 網站檢測清單](./ooni-weblists.md){target="_blank"}」中的說明。

        ??? question "透過原始觀測資料進行分析。"

            OONI 在 AWS S3 提供公開的原始觀測資料，可用於更深入的資料分析：

            1. 資料存放於 S3 bucket `ooni-data-eu-fra`（eu-central-1 區域）。
            2. 格式為 `raw/{date}/{hour}/{country}/webconnectivity/*.jsonl.gz`。
            3. 本專案的 [ASN 涵蓋分析工具](./ooni-asns-coverage.md){target="_blank"} 提供了下載與分析的範例，可參考 `asn_coverage/ooni.py` 的實作方式。
            4. 原始資料可用於分析特定 ASN 的觀測涵蓋率、追蹤特定網站在不同時間點的封鎖狀態，以及進行跨地區比較。
