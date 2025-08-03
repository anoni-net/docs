---
title: 如何搭建 Tor Relay
icon: simple/torproject
---

# :simple-torproject: 如何搭建 Tor Relay

如何安裝 Tor 中繼站（Relay）、橋接站點（Bridge）與出口站點（Exit Node）於臺灣網路。

!!! warning "建立前需衡量事項！"

    如果您對 Tor 還不是很瞭解，可以先參考「[什麼是 Tor？](./what-is-tor.md)」的介紹。

    <figure markdown="span">
        <a target="_blank"
        href="../assets/images/tor_diagram.original.webp">
            <img src="../assets/images/tor_diagram.original.webp"
                alt="Tor Relay 運作流程"
                title="Tor Relay 運作流程"
            >
        </a>
        <caption>Tor Relay 運作流程</caption>
    </figure>

    以下的教學僅使用入口節點與中間節點作為範例，如果您想要進階的節點建立操作，請思考以下問題並評估可承擔的風險：

    - 您想要建立一個 Tor 出口節點還是非出口（橋接、中間）節點？
    - 如果您想建立一個出口節點：您要在出口政策中允許哪些連線埠？更多的連線埠通常代表可能會有更多的濫用或違法投訴。
    - 您希望使用哪個外部 TCP 連線埠來接受 Tor 連接？`ORPort` 設定：如果您的伺服器上沒有其他服務佔用此連線埠，我們建議使用 443 連線埠。推薦使用 `ORPort 443`，是因為這通常是公共 Wi-Fi 網絡中少數幾個開放的端口之一。連線埠 9001 也是另一個常用的 `ORPort`。
    - 您將使用哪個電子郵件作為節點的聯絡訊息 `ContactInfo` 欄位？這個資訊將會公開。
    - 您希望允許多少頻寬、每月流量用於 Tor 流量？
    - 伺服器是否允許 IPv6 地址？

## 如何建立 Middle Relay

建立一個 Middle Relay 需要一些技術知識和基本的安裝與設定。建議使用 Debian 或 Ubuntu 作業系統來安裝，以下範例也將使用 Debian/Ubuntu 操作。

!!! info "其他作業系統"

    其他作業系統或是更細節的安裝說明可以參考官方文件：[Tor Project | Middle/Guard relay](https://community.torproject.org/relay/setup/guard/){target="_blank"}。

### 安裝 tor

```bash
apt update
apt install tor
```

!!! info "不同版本的選擇"

    Tor 在各 Linux 發行版中可能會有非最新版本的狀況，如需要安裝最新或測試版本，可以參考官方說明文件來調整：[Why and how I can enable Tor Package Repository in Debian?](https://support.torproject.org/apt/tor-deb-repo/){target="_blank"}

### 設定

調整設定檔 `/etc/tor/torrc`

```bash
Nickname    myNiceRelay # 調整 "myNiceRelay" 為你要公開呈現的名稱
ContactInfo your@e-mail # 聯絡方式，將公開呈現
                        # 如不想公開，可設定成 none
ORPort      9001        # 預設的 Port 為 9001
                        # 如果能提供 443, 80 等看起來像
                        # 網頁常用的 Port，更能幫助嚴峻的國家
                        # 也請記得開啟防火牆或對外 Port 設定。
ExitRelay   0           # 不成為出口節點
SocksPort   0
Log notice file /var/log/tor/notices.log # 開啟 log 紀錄
```

重新啟動 tor，預設設定為 `tor@default`

```bash
systemctl restart tor@default
```

查看日誌或系統日誌 `/var/log/syslog` 是否有出現 `Self-testing indicates your ORPort` 文字及說明 `reachable`。大約３個小時之後，可以在 [Relay Search](https://metrics.torproject.org/rs.html){target="_blank"} 中搜尋到你的 Relay 資訊。

!!! info "安裝後的注意事項"

    安裝後需要注意的事項可以參考官方文件：[Tor Project | Relay Post-install and good practices](https://community.torproject.org/relay/setup/post-install/){target="_blank"}。

## 使用 nyx 監控

使用 nyx 來監控您的 Relay 狀態和性能：

```bash
apt install nyx
```

## 建立多組 Tor 設定檔 `tor-instance-create`

`tor-instance-create` 是一個用來在同一台伺服器上建立多個獨立 Tor 的工具。這在需要運行多個 Tor 以增加匿名性或流量分散的情況下特別有用。`tor-instance-create` 是 Tor 的一部分，通常已經隨 Tor 套件一起安裝。

### 建立新的 Tor Instance

```bash
tor-instance-create tor@{instance-name}
tor-instance-create tor@mytor2
```

這將建立一個名為 `mytor2` 的新 Tor instance，其設定檔目錄將在 `/var/lib/tor-instances/mytor2` 下建立。

### 設定新的設定檔

新的設定檔位置在 `/var/lib/tor-instances/mytor2/torrc`，在設定檔中，您可以設定各種參數，例如：

```bash
ORPort 9002  # 設定新的 ORPort，確保每個 instance 使用不同的端口
DataDirectory /var/lib/tor-instances/mytor2/data
Log notice file /var/lib/tor-instances/mytor2/notice.log
```

### 啟動

啟動或重新啟動新建立的 Tor Instance。

```bash
# systemctl start tor@{instance-name}
systemctl start tor@mytor2
```

### 使用 nyx 監控新的設定檔

```bash
nyx -s /run/tor-instances/{instance-name}/control
```

## 搭建 Tor Relay 的常見問題

??? question "搭建 Tor Relay 會被警察找上門嗎？"

    Relay 有三層：入口節點（Guard Relay）、中間節點（Middle Relay）、出口節點（Exit Relay）。其中入口節點與中間節點是扮演 Tor 網路內傳輸轉送的類型，不是連結存取最終目的地的節點主機，因此不會與執法單位接觸的可能。也因此搭建出口節點的潛在風險也需要審慎評估後再決定是否行動。

??? question "使用家庭網路搭建可行嗎？"

    透過家庭網路（例如：中華電信家用光世代、有線電視網路⋯等類似網路）搭建可能會需要調整電信公司所提供的路由器，會有一定的技術門檻需要跨越，如果能手動設定調整路由器等設定，也請注意開啟防火牆與限定連入連線埠，預設路由器會關閉所有連入的連線埠。

??? question "我為什麼要運行一個 Tor Relay？"

    建立運作 Tor Relay 協助擴展 Tor 網路的頻寬和穩定性，使更多人能安全、匿名地上網。這對網路自由和隱私權的推廣至關重要。

??? question "我能從運行 Tor Relay 中獲得什麼樣的好處？"

    雖然運行 Tor Relay 通常不會帶來直接的經濟利益，但可以幫助促進網絡自由，支持全球的言論自由、網路自由和隱私權。此外，它讓你成為開源社群的一部分，促進匿名網際網路的基礎架構安全。

??? question "運行 Tor Relay 需要很多技術知識嗎？"

    不一定。雖然基本的網路知識（如 IP 位址、連線埠設定）會有用，但 Tor 官方提供詳細的安裝指南，各大社群論壇也積極提供幫助。任何有興趣的人都可以學習並建立運作一個 Relay。

??? question "運行 Tor Relay 是否合法？"

    臺灣網路還算自由，目前允許使用 Tor Relay，但法律狀況可能隨時變動，因此建議隨時關注與網路自由相關議題及法律。不過，建立出口節點（Exit Relay）可能面臨更多法律風險，建議先了解相關法規。

??? question "運作 Tor Relay 有什麼要求？"

    建立 Tor Relay 前，確保您的網路有穩定的上傳和下載速度。至少需具備 100 KB/s 的上傳頻寬且有固定的 IP 位址。此外，確認你的 ISP 允許這類流量，並且你的網路設備（如防火牆和路由器）可正確設定所需的連線埠轉發。

??? question "Tor Relay 會影響我的網速嗎？"

    Tor Relay 使用你設定的最大頻寬，因此不會占用所有的網絡資源。不過，你可能會注意到在高負載時，網速稍有降低。你可以根據需要調整設定中的頻寬限制參數。

??? question "如何保護運作 Tor Relay 時的隱私？"

    Tor Relay 本身不會存取或追蹤使用者的流量，但建議在設定時小心選擇可識別資訊，例如不要使用可識別個人訊息的電子郵件。此外，定期更新 Tor 軟體以確保安全性。

??? question "如何升級我的 Tor Relay 軟體？"

    保持 Tor 軟體更新非常重要，以獲得最新的安全更新和功能。大多數 Linux 系統上，可以通過套件管理器來更新 Tor。Windows 和 macOS 使用者應定期檢查 Tor 官網上的更新。

??? question "如何成為 Guard Relay？"

    Guard Relay 由 Tor 網路自動選定，使用者無法手動配置。若節點穩定運行且具備足夠頻寬，便有可能被選為 Guard Relay。