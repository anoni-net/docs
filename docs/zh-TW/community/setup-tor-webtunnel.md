---
title: 如何搭建 Tor WebTunnel 橋接
description: 在台灣架設 Tor WebTunnel 橋接，把 Tor 流量偽裝成一般 HTTPS 網頁連線，協助伊朗、中國這類重度審查地區的使用者連上 Tor。含 VPS、網域、TLS、nginx 反向代理、Docker 的完整步驟與維運指引。
icon: material/tunnel-outline
---

# :material-tunnel-outline: 如何搭建 Tor WebTunnel 橋接

WebTunnel 是 Tor 目前抗審查能力最強的橋接方式。它把 Tor 流量包進一個正常的 HTTPS 連線裡，在審查者眼中跟一般人瀏覽網站沒有兩樣。當審查系統用深度封包檢測（DPI）封鎖 obfs4 這類「看起來不像 HTTPS」的協定時，WebTunnel 依然能穿過去。

這份文件帶你在台灣的一台小型 VPS 上，用官方 Docker 方式架起一個 WebTunnel 橋接，從網域、TLS 憑證、nginx 反向代理到上線驗證，並附上監控、偽裝頁、防火牆與事件處置的維運做法。

!!! info "先理解橋接與中繼的差別"

    如果你對 Tor 還不熟，可以先看「[什麼是 Tor？](../tools/what-is-tor.md)」。

    Tor 的對外貢獻有幾種，門檻與抗審查強度各不相同：

    - [Tor Snowflake](../tools/tor-snowflake.md)：開瀏覽器分頁就能跑的臨時橋接，門檻最低，但走 WebRTC，部分審查環境偵測得到。
    - **WebTunnel（本文）**：需要 VPS、網域與 TLS，偽裝成 HTTPS，重度審查地區最難封鎖。
    - [Tor Relay](./setup-tor-relay.md)：中繼節點，撐起 Tor 網路的頻寬與多元性，不屬於橋接。

    橋接（Bridge）跟中繼一樣不直接連向使用者要去的目的地，對外網站看到的是 Tor 出口節點，不是你的伺服器，因此營運橋接的法律風險跟入口、中間節點同級，遠低於出口節點。

## 為什麼台灣適合架 WebTunnel

- **對外連線受審查程度低、頻寬充足**：台灣是合適的橋接來源地。
- **IP 與 ASN 多元性有價值**：審查者會去封鎖已知的橋接 IP，分散在不同國家、不同網路供應商的橋接越多，當地使用者能用的入口就越多。
- **比架中繼省資源**：一台 512MB 到 1GB RAM 的 VPS 就夠跑，成本與運維負擔比 Tor Relay 低。
- **回應真實需求**：2026 年伊朗在軍事行動期間封網近三個月，重新開放後大量流量湧入志工架設的 WebTunnel。這類橋接在極端審查下是當地人能否連上 Tor 的關鍵。

## 開始前要準備的東西

- 一台 VPS（Debian 或 Ubuntu，512MB RAM 以上，建議 1GB 讓 Tor 進程有餘裕）。
- 一個網域或子網域，並能編輯它的 DNS。
- 對外開放 443 連線埠（WebTunnel 走標準 HTTPS 埠才像正常網站）。
- 一個聯絡用 email，會公開在橋接的 `ContactInfo`。

!!! tip "網域與營運隱私"

    WebTunnel 的偽裝效果靠「這個網域看起來就是個普通網站」。建議：

    - 用一個不會一眼看出是 Tor 橋接的網域或子網域。
    - 根路徑（`/`）放一個無害的頁面（個人首頁、放置頁、簡單部落格都可以），讓掃描者看到的是一個普通網站。
    - 在台灣這類低風險環境，用既有網域的子網域通常沒問題。若你想要更高的營運隱私，再考慮用匿名註冊的獨立網域。

整個流程分兩部分：先把網域、TLS、反向代理這層架好（讓伺服器看起來像個正常 HTTPS 網站），再用 Docker 把橋接跑起來。

## 第一部分：網域、TLS 與 nginx 反向代理

### 設定 DNS

在你的網域 DNS 加一筆 A record，把網域（或子網域）指向 VPS 的 IP。例如 `bridge.example.com` 指到伺服器的對外 IP。等 DNS 生效後再進行下一步。

### 取得 TLS 憑證

WebTunnel 需要一張瀏覽器信任的 TLS 憑證，讓連線看起來就是連到一個真的 HTTPS 網站。用 Let's Encrypt 最方便。

```bash
apt update
apt install certbot python3-certbot-nginx
certbot --nginx -d bridge.example.com
```

certbot 套件會裝好 systemd timer 自動續期，可以這樣確認：

```bash
systemctl status certbot.timer
```

!!! info "其他取得憑證的方式"

    也可以用 `acme.sh` 之類的 ACME 客戶端簽憑證，做法見官方文件：[Tor Project | WebTunnel Bridge](https://community.torproject.org/relay/setup/webtunnel/){target="_blank"}。

### 設定 nginx 反向代理

WebTunnel 橋接會在本機 `127.0.0.1:15000` 監聽，由 nginx 處理對外的 HTTPS，再把某個「秘密路徑」反向代理到橋接。請先想一個隨機字串當作這個秘密路徑，下面範例用 `$PATH` 代表。

在既有的 vhost（或新建一個）裡加上這段 `location` 區塊，注意要帶 WebSocket 標頭：

```nginx
location = /$PATH {
    proxy_pass http://127.0.0.1:15000;
    proxy_http_version 1.1;
    ### WebSocket 標頭 ###
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    ### Proxy 標頭 ###
    proxy_set_header Accept-Encoding "";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    add_header Front-End-Https on;
    proxy_redirect off;
    access_log off;
    error_log /dev/null;
}
```

!!! tip "進階：兩個官方沒提的反向代理加固"

    上面的設定能正常運作。有兩個官方文件沒寫的小調整，能讓秘密路徑更難被探測、長連線更穩定，實務上很值得加。

    **把秘密路徑藏得更徹底**

    預設情況下，對秘密路徑送一個沒有 WebSocket 握手的普通請求，會被轉發給橋接，而橋接的回應可能跟站上其他路徑長得不一樣，反而暴露出這個路徑的存在。加一行，讓沒有 Upgrade 標頭的請求一律回 404，這個路徑就跟站上任何不存在的網址沒有兩樣：

    ```nginx
    location = /$PATH {
        # 只有真正的 WebTunnel 握手能通過，普通探測一律回 404
        if ($http_upgrade = "") { return 404; }
        proxy_pass http://127.0.0.1:15000;
        # ⋯⋯其餘設定同上
    }
    ```

    真正的 WebTunnel 連線一定帶 Upgrade 標頭，這行不會擋到正常的橋接客戶端。

    **別讓 nginx 切斷長連線**

    nginx 的 `proxy_read_timeout` 預設只有 60 秒，連線超過 60 秒沒有資料流動就會被切掉，對長時間掛著的 Tor 電路會造成莫名的斷線。把 `location` 區塊裡的逾時拉長，並開啟 TCP keepalive：

    ```nginx
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        proxy_socket_keepalive on;
    ```

根路徑 `location /` 維持回傳一個正常網頁，讓伺服器整體看起來像普通網站，只有知道秘密路徑的 Tor 客戶端會走到橋接。改完測試設定並重新載入：

```bash
nginx -t && systemctl reload nginx
```

## 第二部分：用 Docker 跑 WebTunnel 橋接

### 安裝 Docker

```bash
apt install curl sudo
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh ./get-docker.sh
```

### 建立 `.env` 設定檔

把 `URL` 換成你的網域加上秘密路徑（對齊第一部分 nginx 設的 `$PATH`），`OPERATOR_EMAIL` 換成你的聯絡信箱，然後執行：

```bash
truncate --size 0 .env
echo "URL=https://bridge.example.com/your-secret-path" >> .env
echo "OPERATOR_EMAIL=your@email.org" >> .env
echo "BRIDGE_NICKNAME=WTBr$(cat /dev/urandom | tr -cd 'qwertyuiopasdfghjklzxcvbnmMNBVCXZLKJHGFDSAQWERTUIOP0987654321'|head -c 10)" >> .env
echo "GENEDORPORT=4$(cat /dev/urandom | tr -cd '0987654321'|head -c 4)" >> .env
```

### 下載 docker-compose 設定

```bash
curl https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/webtunnel/-/raw/main/release/container/docker-compose.yml?inline=false > docker-compose.yml
```

這份 compose 預設開啟自動更新，橋接會自己更新到新版，不需要額外動作。接著啟動：

```bash
docker compose up -d
```

### 取得橋接行並驗證

```bash
docker compose exec webtunnel-bridge get-bridge-line.sh
```

把輸出的 bridge line 貼進 Tor Browser 的橋接設定就能測試是否可用。

!!! warning "指令失效時的替代寫法"

    在較新版本的容器上，容器名稱可能改成 `webtunnelBridge`，原指令會失敗。改用：

    ```bash
    docker exec webtunnelBridge get-bridge-line.sh
    ```

橋接行裡的 IP（特別是 IPv6）是隨機產生的佔位符，不會真的被使用，這是 pluggable transport 規格要求那個位置要有 IP 而已。實際連線是靠你的網域與秘密路徑。預設情況下，你的橋接會透過 [bridges.torproject.org](https://bridges.torproject.org/){target="_blank"} 自動派發給需要的使用者。

## 進階維運

### 防火牆

只開必要的連線埠。WebTunnel 對外只需要 443（HTTPS），SSH 視管理需求保留。橋接監聽的 `15000` 綁在 `127.0.0.1`，不要對外開放。

```bash
ufw allow 443/tcp
ufw allow OpenSSH
ufw enable
ufw status
```

### 偽裝頁設計

根路徑那個「無害頁面」是偽裝的一部分。建議放一個有實際內容、不會引人懷疑的靜態頁（個人作品集、技術筆記、放置中頁面都行），避免空白頁或預設的 nginx 歡迎頁，那反而顯眼。

### 監控與健康檢查

- 看容器狀態與日誌：

    ```bash
    docker compose ps
    docker compose logs -f
    ```

- 確認 TLS 憑證還有效、續期正常：`systemctl status certbot.timer`。
- 橋接上線數小時後，可在 [bridges.torproject.org](https://bridges.torproject.org/){target="_blank"} 流程或 Tor Browser 實測它是否被派發、是否可連。

### 軟體更新

compose 預設自動更新橋接本體。系統層的 Docker、nginx、certbot 仍要定期 `apt update && apt upgrade`，TLS 憑證續期則交給 certbot timer。

### 事件處置 runbook

- **橋接連不上**：先看 `docker compose logs`，再確認 nginx 反向代理的秘密路徑與 `.env` 的 `URL` 路徑一致、TLS 憑證未過期、443 有開。
- **憑證過期**：`certbot renew` 後 `systemctl reload nginx`。
- **收到濫用或法律詢問**：橋接屬於入口、中間性質，不直接連向目的地。可向對方說明 Tor 橋接的角色，並參考 [EFF Tor 中繼營運者法律 FAQ](https://community.torproject.org/relay/community-resources/eff-tor-legal-faq/){target="_blank"}。
- **要下線**：`docker compose down` 停止橋接，移除 nginx 的 `location` 區塊並重載。

## 常見問題

??? question "WebTunnel 跟 Snowflake、obfs4 有什麼不同？"

    三者都是幫人繞過審查連上 Tor 的橋接。Snowflake 走 WebRTC（瀏覽器做視訊通話用的那種即時連線技術）、開瀏覽器就能跑，但易被偵測。obfs4 把流量變成隨機雜訊，但 DPI 仍可能辨識出它不像 HTTPS 而封鎖。WebTunnel 把流量包進真正的 HTTPS 連線，審查者要封它就得連帶封掉大量正常網站，因此在中國、伊朗、哈薩克這類 DPI 嚴格的地方最有效。

??? question "營運 WebTunnel 橋接合法嗎？會被找上門嗎？"

    橋接跟入口、中間節點一樣不連向最終目的地，對外網站看到的是 Tor 出口節點，不是你的伺服器。台灣網路相對自由，目前允許營運這類節點。風險遠低於出口節點。若收到詢問，可參考 [EFF Tor 中繼營運者法律 FAQ](https://community.torproject.org/relay/community-resources/eff-tor-legal-faq/){target="_blank"}。

??? question "需要多大的伺服器？"

    一台 512MB RAM 的小 VPS 跑得動，但建議配到 1GB，因為 Tor 進程本身可能吃到接近 1GiB 的記憶體。CPU 與頻寬需求都不高。

??? question "我可以用家裡的網路架嗎？"

    可以，但需要固定對外 IP、能在路由器做埠轉發（443），且 ISP 允許這類流量。家用動態 IP 會讓橋接位址不穩定。用 VPS 通常更省事、更穩定。

??? question "橋接行裡的 IP 是我的伺服器 IP 嗎？"

    不是。WebTunnel 橋接行裡的 IP 是隨機產生的佔位符，僅為符合規格。客戶端實際是靠你的網域與秘密路徑連上來的。

??? question "一定要用 Docker 嗎？"

    不是唯一方式。也可以從原始碼編譯 Go 二進位檔來跑，做法見 [Tor Project | Compile and run WebTunnel from source](https://community.torproject.org/relay/setup/webtunnel/source/){target="_blank"}。對多數人來說 Docker 是最省事的路。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-chat-question: 網路自由為什麼重要](../basics/internet-freedom.md)
- [:material-chat-question: 什麼是 Tor](../tools/what-is-tor.md)
- [:material-snowflake: Tor Snowflake 橋接點](../tools/tor-snowflake.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-server-network: 如何搭建 Tor Relay](./setup-tor-relay.md)
- [:material-school-outline: Tor Relay 校園建立](./relay-on-campus.md)
- [:material-list-status: Tor Relays 觀測點](../taiwan/tor-relay-watcher.md)

</div>

## 官方參考文件

- [Tor Project | WebTunnel Bridge](https://community.torproject.org/relay/setup/webtunnel/){target="_blank"}：網域、TLS、nginx 設定主文件。
- [Tor Project | WebTunnel Docker setup](https://community.torproject.org/relay/setup/webtunnel/docker/){target="_blank"}：Docker 部署。
- [Tor Project | Compile and run WebTunnel from source](https://community.torproject.org/relay/setup/webtunnel/source/){target="_blank"}：從原始碼編譯。
- [Introducing WebTunnel](https://blog.torproject.org/introducing-webtunnel-evading-censorship-by-hiding-in-plain-sight/){target="_blank"}：WebTunnel 設計理念。
