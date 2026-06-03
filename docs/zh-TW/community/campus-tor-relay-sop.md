---
title: 校園 Tor Relay 架設 SOP
description: 在台灣校園網路場景下架設 Tor Relay 的完整技術步驟。含 torrc 範例、UFW 防火牆規則、狀態網頁方案、監控與事件處置 runbook、驗收測試。整理自台灣師範大學 NZ 的實作經驗。
icon: material/server-network-outline
---

# :material-server-network-outline: 校園 Tor Relay 架設 SOP

這份 SOP 是 [如何搭建 Tor Relay](./setup-tor-relay.md) 的進階補充，專門處理**校園網路場景**下的特殊性。內容整理自社群夥伴 NZ 在台灣師範大學的實作經驗，請搭配 [校園 Tor Relay 提案範本](./campus-tor-relay-proposal.md) 與 [校園 FAQ](./campus-relay-faq.md) 一併使用。

如果你還在評估「該不該做」、「如何說服學校」，請先回到 [校園提案範本](./campus-tor-relay-proposal.md)。這一頁假設你已經拿到上線許可，正準備動手。

## 跟個人架設的差異

校園場景跟家用、個人 VPS 有幾個結構性差異，會直接影響技術選擇：

- **IP 來自學校配發**：通常一組固定 IPv4，需走資訊中心申請流程
- **IPv6 要另外申請**：多數學校預設不開 v6，雙堆疊需要額外提出
- **TANet 對外連線預設全封鎖**：所有對外服務都要走例外開放申請
- **SSH 來源建議限校內 VPN 段**：避免直接暴露到 Internet
- **校方期待「可被解釋」**：每個對外開放的 port、每段流量都要能對應到計畫書中的描述
- **長期維運要考慮畢業交接**：ContactInfo 不要綁個人主 email

## 專案範疇與非範疇

跟資訊中心溝通時，**先說清楚自己不要做什麼**，比說清楚要做什麼更重要。

**範疇內**

- 僅建置 Non-Exit Relay（Entry Guard 與 Middle Relay）
- 對外公開資訊：節點狀態頁（不含使用者資料）

**範疇外**

- 不提供 VPN、代理上網、Tor 客戶端服務（Socks/DNSPort）
- 不提供 Onion Services（.onion 隱匿服務）
- 不變更校園邊界防火牆策略、DNS 解析策略、內容過濾策略
- 不執行深度封包檢測（DPI）

**可逆性**

- 任一時間可在 10 分鐘內下線：停止 systemd 服務 + 關閉 ORPort

## 服務與連線一覽

### 對外公開的連接埠（Inbound）

| 服務 | Port/協定 | 來源 | 說明 |
|---|---|---|---|
| Tor ORPort | 9001/tcp | Internet | Relay 之間的 TLS 連線，唯一必需對外開放 |
| HTTP（ACME） | 80/tcp | Internet | Let's Encrypt 簽證與 301 轉導 |
| HTTPS（狀態頁） | 443/tcp | Internet | 對外狀態網頁 |
| SSH | 22/tcp | 校內 VPN 段 | 管理用，限校內網段 |
| DirPort | 不開放 | – | 預設不開 DirPort，減少攻擊面 |

原則：**只對外開放一個 Tor 相關 TCP 連接埠（ORPort）**。如果 443 對外被佔用，也可考慮把 ORPort 改成 443，這在審查嚴峻地區的使用者連線更友善。

### 對外主動連線（Outbound）

| 用途 | Port/協定 | 去向 |
|---|---|---|
| 取得目錄共識、聯繫其他 Relay | TCP 443/9001（動態） | Tor 目錄權威與各 Relay |
| 系統更新 | TCP 80/443 | 套件鏡像站 |
| 時間同步 | UDP 123 | 指定 NTP server |

### 明確封鎖

- 所有 UDP（NTP 指定對象除外）
- SMTP 25/465/587 等郵件 port
- IRC 6667/6697、P2P 常用 port
- SocksPort、DNSPort、HTTPTunnelPort 一律不啟用

## 作業系統與基線

建議用 Ubuntu Server 24.04 LTS（minimal install）：

1. **最小化安裝**：只裝 `tor`、`nginx`、`certbot`、`fail2ban`、`unattended-upgrades`、`rsyslog`、`auditd`、`chrony`，視需要加上 `prometheus-node-exporter`
2. **SSH 設定**
    - 僅允許金鑰登入：`PasswordAuthentication no`
    - 停用 root 直接登入：`PermitRootLogin no`
    - 限定使用者：`AllowUsers <你的帳號>`
    - 連線逾時：`ClientAliveInterval 300`
3. **自動安全更新**：啟用 `unattended-upgrades`
4. **時間同步**：`chrony`，事件調查時序一律以 UTC 記錄
5. **強化保護**：啟用 AppArmor、`fs.protected_*` 參數
6. **日誌持久化**：`journald` 設為 `Storage=persistent`，可選擇透過 `rsyslog` 轉送到校內 SIEM
7. **檔案完整性（選用）**：部署 AIDE，週期性基線比對
8. **磁碟加密（選用）**：硬體允許的話，LUKS 全碟或至少保護 `/var/lib/tor`
9. **備份**：離線或異地備份 `/etc/tor/torrc`、`/var/lib/tor/keys/`（**身份金鑰嚴格保密**）

## Tor 安裝建議

- **版本來源**：優先使用 [Tor Project 官方套件庫](https://support.torproject.org/apt/tor-deb-repo/){target="_blank"}，發行版內建版本通常落後一兩個版本
- **服務帳號**：使用套件預設的 `debian-tor` 帳號執行，**不要用 root**
- **只跑非出口**：以 `ExitRelay 0` 與 `ExitPolicy reject *:*` 明確宣告，避免被誤當成 Exit Relay

## torrc 參考設定

設定檔位置：`/etc/tor/torrc`

```bash
# 基本身分
Nickname    <YourSchoolRelayName>
ContactInfo <project-email@example.edu> - Non-exit relay at <Dept/School>; Abuse: <noc@example.edu>

# 只做 Guard/Middle（非出口）
ExitRelay   0
ExitPolicy  reject *:*

# ORPort：對外服務的唯一必要入口
ORPort      0.0.0.0:9001

# 如無需目錄鏡像，關閉 DirPort
DirPort     0

# 不提供本機 Socks 代理
SocksPort   0
SocksPolicy reject *

# 控制埠（本機用，給 nyx 或維運）
ControlPort           127.0.0.1:9051
CookieAuthentication  1
CookieAuthFileGroupReadable 1
DataDirectoryGroupReadable  1

# 頻寬與突發（依學校政策調整）
# 例：持續 80 MB/s，突發 120 MB/s
RelayBandwidthRate    80 MB
RelayBandwidthBurst   120 MB

# 日誌（notice 等級即可，避免敏感細節）
Log notice file /var/log/tor/notices.log

# MetricsPort（選用）：只給本機或內網監控，絕不對外
# MetricsPort       127.0.0.1:9035
# MetricsPortPolicy accept 127.0.0.1
```

**ContactInfo 寫法注意**：

- 不要綁個人主 email，建議用專案 email 或社團共用帳號
- 留下 abuse 聯絡信箱方便 Tor Network Health team 聯繫
- 這個欄位會公開出現在 Relay Search，**請當作公開資訊處理**

**MetricsPort 安全提醒**：

`MetricsPort` 可讓 Prometheus 擷取 relay metrics，但 [Tor 官方強烈建議不要對外公開](https://support.torproject.org/relay-operators/relay-bridge-overloaded/){target="_blank"}。如需遠端擷取，請以防火牆與 `MetricsPortPolicy` 嚴格限制來源，並透過 TLS Proxy。

## UFW 防火牆設計

預設策略：

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw logging on
```

SSH 限校內 VPN 段（替換 `<學校 IP 段>` 為自己學校的 CIDR）：

```bash
sudo ufw allow from <學校 IP 段> to any port 22 proto tcp comment 'SSH from campus VPN'
sudo ufw limit 22/tcp comment 'Rate-limit SSH'
```

Web 服務（狀態頁）：

```bash
sudo ufw allow 80/tcp  comment 'HTTP for ACME/redirect'
sudo ufw allow 443/tcp comment 'HTTPS status site'
```

Tor ORPort（Guard/Middle 唯一必需）：

```bash
sudo ufw allow 9001/tcp comment 'Tor ORPort'
```

MetricsPort（預設不開，若有內網監控主機 `<監控主機 IP>`）：

```bash
sudo ufw allow from <監控主機 IP> to any port 9035 proto tcp comment 'Prometheus -> Tor MetricsPort'
```

啟用並驗證：

```bash
sudo ufw enable
sudo ufw status numbered
```

## 對外狀態網頁方案

讓校方與外部可以查到「這台 relay 在運作中」對信任建立很有幫助。兩種架構擇一即可。

### 方案 A：Nginx + Onionoo（簡潔、低風險，推薦）

- 用 Nginx 提供 HTTPS 狀態頁
- 頁面從 [Tor Onionoo API](https://metrics.torproject.org/onionoo.html){target="_blank"} 抓自己 fingerprint 的公開資料（流量、旗標、上線狀態）
- 只顯示公開資訊，不暴露任何內部 endpoint

優點：簡單、零內部風險、純前端拉取
缺點：圖表彈性較低

### 方案 B：MetricsPort + Prometheus + Grafana（可觀測性完整）

- 本機啟用 `MetricsPort 127.0.0.1:9035`（**不對外**）
- 本機或內網架 Prometheus 抓取 `/metrics`
- Grafana 出報表
- 對外只能曝光 Grafana，**且必須**：
    1. 只讀帳號、強密碼或 SSO
    2. HTTPS
    3. 僅允許公開且無敏感資訊的圖表
    4. **不要**把 Prometheus 直接對外
    5. **絕不**把 MetricsPort 對外

### Nginx / TLS 重點

- 用 `certbot --nginx` 自動簽發與續期
- 僅啟用 TLS 1.2/1.3，關閉弱 cipher
- 啟用 HSTS、`X-Content-Type-Options: nosniff`、`Content-Security-Policy`
- 加上 `X-Robots-Tag: noindex, nofollow` 避免被搜尋引擎索引
- `/.well-known/acme-challenge/` 走 80/TCP，其餘 80 全部 301 轉到 443

## 監控、日誌與事件處置

### 日誌

- `journald` 持久化、`rsyslog` 視需要轉送
- Nginx、Tor 各自獨立檔案並 `logrotate`
- Tor 建議 `Log notice` 等級，避免敏感細節
- 事件發生時可臨時調高，事後恢復

### 主機層可觀測性

- `node_exporter` 綁 `127.0.0.1:9100`
- 本機 Prometheus 抓取，Grafana 顯示（**對外限只讀**）

### 帳變與稽核

- `auditd` 記錄關鍵檔案異動：`/etc/tor/torrc`、`/var/lib/tor/keys/`
- AIDE 週期比對，結果寄到維運信箱

### 備份與金鑰保全

- 離線/異地備份 `torrc` 與 `/var/lib/tor/keys/`
- 身份金鑰丟失會導致換身分，不利於穩定度

### 事件處置 Runbook

收到異常告警時的順序：

1. **Triage**：
    ```bash
    sudo ss -tnlp | egrep ':22|:80|:443|:9001|:9035'
    sudo journalctl -u tor -n 200
    sudo ufw status numbered
    ```
2. **快速降權**：
    ```bash
    sudo systemctl stop tor@default
    ```
    保留 `/var/log` 與 `/var/lib/tor/` 完整快照
3. **內部通報**：30 分鐘內初步事故報告（影響面、起因、處置、回復時間）
4. **如懷疑入侵**：「封存證據 → 隔離 → 重建」，使用備份的身份金鑰復原（前提是可確定金鑰未洩）

**下線條件**：影響校務網路、資安異常、主管或教授要求。

## 驗收與連線測試

1. **本機設定檢查**：
    ```bash
    sudo -u debian-tor tor --verify-config
    ```
2. **ORPort 可達性**：
    ```bash
    # 從校外另一台主機
    nmap -p 9001 <你的公網 IP>
    # 或
    telnet <你的公網 IP> 9001
    ```
    如果 Tor 日誌出現 `ORPort reachability` 警告，通常是防火牆或對外開放未通
3. **Relay 上線確認**：等待數分鐘到數十分鐘後，到 [Tor Metrics Relay Search](https://metrics.torproject.org/rs.html){target="_blank"} 用 fingerprint 查詢狀態

## IPv6 設定（選用）

如要支援 IPv6，先跟資訊中心申請一段 IPv6 位址，然後在 `torrc` 加入：

```bash
ORPort [<你的 IPv6>]:9001
```

UFW 也要對應放行 v6 流量。IPv6 雖然是選用，但對 Tor 網路的多元性貢獻很高，建議推動。

## 交接與畢業後維運

校園 Relay 跟個人 Relay 最大的差別是**人會畢業**。從 Day 1 就要為交接做準備：

- **ContactInfo 不綁個人主 email**：用社團 email、專案 email 或共用信箱
- **金鑰備份兩份以上**：一份在維運者手上、一份在指導教授實驗室
- **建立交接清單**：torrc、ufw 規則、SSH 金鑰、CDN 與監控帳號、ContactInfo 信箱密碼
- **提早物色接手者**：畢業前一學期就要找到下一棒
- **寫一份交接手冊**：把這台主機的歷史、踩過的雷、約定的維運節奏寫下來

!!! tip "下一步"

    Relay 上線後，這個案例就活在 Tor 網路裡了。建議：

    - **回報案例**：透過 [社群自架服務](./tools.md) 聯繫匿名網路社群 anoni.net，我們會把你的案例加進 [Tor Relay 校園建立研究專題](./relay-on-campus.md) 的「已完成的事」，讓第三、第四所學校有更多參考
    - **長期維運參考**：[如何搭建 Tor Relay](./setup-tor-relay.md) 末尾的 FAQ 有 nyx 監控、套件升級、Guard Relay 機制的補充
    - **想做更多**：可以額外運行 [Tor Snowflake 橋接點](../tools/tor-snowflake.md) 幫助審查地區的使用者連上 Tor

    每個成功上線的校園 Relay 都讓推動成本變低一點。你的案例會幫到下一所學校。

## 相關閱讀

- [如何搭建 Tor Relay](./setup-tor-relay.md)：個人/家用視角的基礎安裝
- [校園 Tor Relay 提案範本](./campus-tor-relay-proposal.md)：跟學校溝通的提案文件範本
- [校園 Tor Relay：給校方與法務的 FAQ](./campus-relay-faq.md)：校方常見疑慮 Q&A
- [Tor Relay 校園建立研究專題](./relay-on-campus.md)：社群推動主題入口
- [Tor Project Relay Operator Guides](https://community.torproject.org/relay/){target="_blank"}：官方營運指南
- [Tor Relay Post-install and good practices](https://community.torproject.org/relay/setup/post-install/){target="_blank"}：上線後注意事項

## 資料來源與致謝

這份 SOP 由社群夥伴 **蘇恩立（NZ）** 提供原始設計文件與實作經驗，整理自他在台灣師範大學的部署過程。原始材料由 NZ 同意以本站 [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hant){target="_blank"} 授權釋出。

如果你照這份 SOP 走，發現有任何步驟對你的學校環境不適用、或可以補強的細節，**歡迎回報給社群**。我們會持續更新這份 SOP，讓它愈用愈接近台灣校園的實際情況。聯絡方式見 [社群自架服務](./tools.md)。
