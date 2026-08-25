---
title: 如何搭建 .onion 服務
description: 用 Tor 官方方式架設 v3 onion 服務，接上 nginx 導流與子網域，含權限、日誌、除錯與上線後的維運，另說明 vanity 位址的產生方式與它給不了的保證。
icon: material/onepassword
---

# :material-onepassword: 如何搭建 .onion 服務

Onion 服務讓別人透過 Tor 直接連到你的伺服器，過程中不需要公開伺服器的 IP，也不需要向任何憑證機構註冊網域。連線兩端都在 Tor 網路內完成，加密由 Tor 本身處理。

這份文件帶你架起一個 v3 onion 服務，接上 nginx 導流，處理子網域，並在卡住的時候知道要看哪裡。

!!! info "這跟架 relay 或橋接是兩件事"

    [Tor Relay](./setup-tor-relay.md)、[WebTunnel 橋接](./setup-tor-webtunnel.md) 與 [Snowflake](../tools/tor-snowflake.md) 都是**把頻寬貢獻給 Tor 網路**，替別人轉送流量。

    Onion 服務是**用 Tor 架自己的站**，只服務你自己的內容，不轉送任何人的流量，對 Tor 網路的容量也沒有貢獻。兩者的風險、法律處境與維運負擔都不一樣。

    onion 服務的設計原理、它與 IPFS 的取捨，以及 anoni.net 文件站三軌部署的整體架構，見 [去中心化發布：IPFS 與 Onion](../advanced/dweb-ipfs-onion.md)。只是想臨時分享檔案或架一個用完即丟的站，[OnionShare](../tools/onionshare.md) 的成本比自己架設服務低。

## 需要什麼

- 一台你能控制的伺服器，Linux 為主
- 已安裝的 `tor`。確認方式是 `tor --version`，套件庫版本通常都支援 v3
- 一個網頁服務，而且它要監聽在 `127.0.0.1`

### 確認你的網頁服務監聽在哪

```bash
sudo ss -ltnp | grep -E 'nginx|apache|caddy'
```

看 `Local Address` 那欄。`127.0.0.1:80` 表示只有本機連得到，這正是我們要的。`0.0.0.0:80` 或 `*:80` 表示對整個網際網路開放。

兩種情況都可以接 onion 服務。如果你想讓網站同時保留 clearnet 版本，維持對外監聽即可，Tor 一樣連得到 `127.0.0.1`。如果你的目的是讓伺服器完全不從 clearnet 被看見，才需要把服務改成只綁 `127.0.0.1` 並關掉對外的埠。

### 出站連線要通

Tor 需要主動連出去才能加入 Tor 網路。防火牆**不需要**為 onion 服務開任何入站埠，但如果這台機器在企業內網、出站被限制，Tor 會連不上 Tor 網路，後面每一步都不會成功。這是內網環境最常遇到的第一個問題。

## 一、Tor 官方的做法

設定檔在 `/etc/tor/torrc`。編輯它並加上兩行，[Tor 官方文件](https://community.torproject.org/onion-services/setup/){target="_blank"} 的範例如下：

```
HiddenServiceDir /var/lib/tor/my_website/
HiddenServicePort 80 127.0.0.1:80
```

`HiddenServiceDir` 是 Tor 存放這個服務身分的目錄，`HiddenServicePort` 的前一個數字是 onion 上對外的埠，後面是後端服務實際監聽的位址與埠。

同一個 `torrc` 可以放多組，每一組是一個獨立的 onion 位址：

```
HiddenServiceDir /var/lib/tor/site-a/
HiddenServicePort 80 127.0.0.1:8080

HiddenServiceDir /var/lib/tor/site-b/
HiddenServicePort 80 127.0.0.1:8081
```

`HiddenServicePort` 一律歸屬在它前面最近的那個 `HiddenServiceDir` 底下。

### 目錄權限

官方文件對權限只寫了一句，目錄要「readable/writeable by the user that will be running Tor」，沒有給出具體的權限數值。實務上的門檻是明確的，**目錄權限必須是 `0700`**，放寬就會被拒絕。

套件安裝的 `tor` 通常以 `debian-tor` 或 `tor` 這個使用者執行，確認方式：

```bash
systemctl cat tor@default.service | grep -E 'User=|debian-tor'
ps -o user= -C tor
```

權限設定與確認：

```bash
sudo chown -R debian-tor:debian-tor /var/lib/tor/my_website
sudo chmod 0700 /var/lib/tor/my_website
sudo ls -ld /var/lib/tor/my_website
```

如果目錄由 Tor 自己建立（`torrc` 寫好後重啟即可），權限本來就會是對的，上面兩行是手動建立目錄時才需要。

如果有其他程序需要讀取 `hostname`，`torrc` 有 `HiddenServiceDirGroupReadable 1` 可以開放同群組讀取目錄與 `hostname` 檔，預設是 `0`。金鑰檔本身不會因此變成群組可讀。

### 套用設定

```bash
sudo tor --verify-config          # 先檢查語法，不會動到執行中的服務
sudo systemctl restart tor@default
sudo systemctl status tor@default
```

!!! warning "Debian 與 Ubuntu 有兩個 unit，重啟錯的那個不會生效"

    套件同時提供 `tor.service` 與 `tor@default.service`。實際運作的是 `tor@default.service`，`tor.service` 只是一個什麼都不做的外殼。只重啟 `tor.service` 不會套用新設定，但畫面上看不出差別。

    不確定的話用 `systemctl list-units 'tor*'` 看哪一個在 `running`。

### 日誌在哪裡看

Tor 出問題時的答案幾乎都在日誌裡。走 systemd 的話：

```bash
sudo journalctl -u tor@default -n 50 --no-pager
sudo journalctl -u tor@default -f          # 持續輸出新的日誌
```

`torrc` 也可以自己開一個日誌檔，預設是註解掉的：

```
Log notice file /var/log/tor/notices.log
```

第一件要確認的事是 Tor 有沒有連上 Tor 網路，日誌裡要看到這一行：

```
Bootstrapped 100% (done): Done
```

沒有這一行就代表 Tor 本身還沒連上網路，此時不管 `HiddenServiceDir` 設定對不對都不會有 onion 位址。多半是出站連線被擋。

### 取得位址

Tor 正常啟動後，`HiddenServiceDir` 底下會有下列檔案：

| 檔案 | 內容 |
|---|---|
| `hostname` | 56 字元的 v3 位址加上 `.onion` |
| `hs_ed25519_public_key` | 公鑰 |
| `hs_ed25519_secret_key` | **私鑰，外洩即無法挽回** |
| `authorized_clients/` | 存取控制用的目錄，預設是空的 |

目錄是 `0700`、檔案是 `0600`，全部由 Tor 自己建立。因為只有 Tor 的執行身分讀得到，看位址要用 `sudo`：

```bash
sudo cat /var/lib/tor/my_website/hostname
```

其餘檔案是這個服務的金鑰。官方文件的警告值得逐字讀：

> The other files are your Onion Service keys, so it is imperative that these are kept private. If your keys leak, other people can impersonate your Onion Service, deeming it compromised, useless, and dangerous to visit.

金鑰外洩的後果沒有補救方式。onion 位址就是公鑰的編碼，沒有撤銷機制，也沒有機構可以幫你註銷。唯一的處理是產生新位址並通知所有讀者，而通知本身在抗審查的情境下往往做不到。

!!! tip "怎麼確認自己目前是安全的"

    `sudo ls -la /var/lib/tor/my_website` 看到目錄是 `drwx------`、檔案是 `-rw-------`、擁有者是 Tor 的執行身分，就是正常狀態。Tor 自己建立的目錄本來就是如此，不需要額外處理。

    備份 `HiddenServiceDir` 的整個目錄。存放的位置要用跟伺服器同等或更高的標準保護，具體來說是加密（例如放進已加密的密碼管理器或用 `gpg -c` 加密後再存），不要放進一般的雲端硬碟或程式碼倉庫。

## 二、接到 nginx

Onion 服務本身只負責把連線送到你指定的位址與埠，導流由 nginx 決定。

Debian 與 Ubuntu 的慣例是把設定放進 `/etc/nginx/sites-available/`，再連結到 `sites-enabled/`：

```bash
sudo nano /etc/nginx/sites-available/onion
sudo ln -s /etc/nginx/sites-available/onion /etc/nginx/sites-enabled/
sudo nginx -t                     # 語法檢查，一定要先執行
sudo systemctl reload nginx
```

設定內容：

```nginx
server {
    listen 127.0.0.1:80;
    server_name <你的位址>.onion;

    root /var/www/site;
    index index.html;
}
```

`server_name` 要填入實際的 onion 位址。如果這個 `listen` 上只有這一個 server block，填錯也不會出事。一旦有多個 server block 共用同一個 `listen`（例如下一節的子網域），沒對上的請求就會落到 nginx 的 default server，取得錯誤的內容或預設頁。

### 改用 Unix socket

`torrc` 那邊寫成 `unix:` 的話，nginx 這邊要對應改成監聽同一個 socket，後端就完全不在 TCP 上出現。

!!! danger "不要用 `/run/tor/`"

    那是 Tor 自己的 runtime 目錄，由 systemd 在啟動時以 `debian-tor` 身分建立（`ExecStartPre` 裡就寫著 `-o debian-tor -g debian-tor -d /run/tor`）。nginx 以 `www-data` 執行，在那裡建立不了 socket。

建一個兩邊都能用的目錄：

```bash
sudo mkdir -p /run/onion
sudo chown www-data:debian-tor /run/onion
sudo chmod 0770 /run/onion
```

`/run` 是 tmpfs，重開機會清空。要讓目錄重開機後仍然存在，建一個 tmpfiles 規則：

```bash
echo 'd /run/onion 0770 www-data debian-tor -' | sudo tee /etc/tmpfiles.d/onion.conf
sudo systemd-tmpfiles --create
```

接著 `torrc` 與 nginx 兩邊指向同一個路徑：

```
HiddenServicePort 80 unix:/run/onion/site.sock
```

```nginx
server {
    listen unix:/run/onion/site.sock;
    server_name <你的位址>.onion;

    root /var/www/site;
    index index.html;
}
```

socket 由 nginx 建立，Tor 是連過去的一方，所以 Tor 的執行身分要能寫入它。nginx 的 `listen` 指令沒有任何設定 socket 擁有者、群組或權限的參數，所以控制點只能放在目錄那一層。

reload 之後實際確認一次，不要假設預設值可用：

```bash
ls -l /run/onion/site.sock
```

權限太嚴 Tor 連不上，太鬆則是本機任何使用者都連得到你的後端，兩個方向都要看。

`torrc` 的 `GroupWritable` 與 `WorldWritable` 旗標對這裡沒有作用。那兩個是給 Tor 自己建立的 socket 用的，例如 `ControlSocket` 與 `SocksPort`。

### HTTPS 的取捨

Tor 對 onion 服務的連線本身已經是端到端加密並經過驗證，位址就是公鑰。再包一層 TLS 在密碼學上不會增加保護，所以預設建議是保持 HTTP，讓 Tor 處理加密。

有兩件事值得先知道：

- **公開憑證機構簽得出來**：CA/Browser Forum 在 2021 年通過修正案，允許為 v3 `.onion` 核發 DV 憑證，目前有商業 CA 提供這項服務（付費）。如果你的稽核規定要求「一律要有 TLS」，這是一條實際存在的路
- **Tor Browser 仍會顯示不安全提示**：純 HTTP 的 `.onion` 在 Tor Browser 上會被標示為不安全，這是官方追蹤中的已知議題（`#21321`）。密碼學上沒有問題，但非技術的使用者看到那個字樣很可能誤判並回報問題，內部工具尤其容易遇到

### 最常出錯的地方

- **後端在回應裡寫死 clearnet 網址**：頁面上的連結、表單 action、重新導向如果指向原本的網域，訪客一點就跳出 Tor，匿名性當場失效
- **外部資源**：圖片、字型、分析腳本如果從 clearnet 載入，同樣會讓訪客的瀏覽器對外連線
- **Referrer 外洩**：頁面上如果有連到 clearnet 網站的連結，瀏覽器預設會帶 `Referer`，對方的日誌就會看到你的 `.onion` 位址。加上 `add_header Referrer-Policy no-referrer;` 或在連結加 `rel="noreferrer"`
- **`Host` 標頭檢查**：有些應用程式框架會拒絕不在允許清單內的 `Host`，onion 位址要另外加進去
- **access log 的來源都是 `127.0.0.1`**：所有連線都經過本機的 Tor 轉發，日誌記到的永遠是本機位址而不是訪客的真實來源。這是正常現象，日誌設定沒有問題

## 三、子網域怎麼運作

Onion 位址可以帶子網域，而且不需要另外申請或設定任何 DNS。Tor 會把完整的 `Host` 原樣傳給後端，由 nginx 決定怎麼分流。

anoni.net 文件站的位址正好是下面的結構：

```
docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion
└┬─┘ └──────────────────── 56 字元的 v3 位址 ────────────────────┘
 └── 子網域，由 nginx 的 server_name 分流
```

一個 onion 位址可以承載多個子網域，nginx 的寫法：

```nginx
server {
    listen 127.0.0.1:80;
    server_name docs.<你的位址>.onion;
    root /var/www/docs;
}

server {
    listen 127.0.0.1:80;
    server_name <你的位址>.onion;
    root /var/www/main;
}
```

`torrc` 那邊不需要為了子網域多做任何設定，一組 `HiddenServiceDir` 與 `HiddenServicePort` 就夠了。

## 四、限制誰能存取

如果這個服務不打算對所有人開放，v3 onion 有內建的存取控制（client authorization）。授權以外的連線在交會階段就被拒絕，看不到任何內容，比只靠位址保密可靠得多。

伺服器端把授權用的公鑰放進 `HiddenServiceDir/authorized_clients/`，用戶端在自己的 `torrc` 設 `ClientOnionAuthDir` 指向存放私鑰的目錄。內部工具、只給特定夥伴的鏡像，都適合走這條路。

金鑰的產生方式與檔案格式見 [Tor 官方的 client authorization 說明](https://community.torproject.org/onion-services/advanced/client-auth/){target="_blank"}。

## 五、vanity 位址（選用）

!!! info "這一節可以跳過"

    Vanity 位址純粹是讓開頭字串好記，不影響服務能不能用、也不影響安全性。第一次架服務建議先跳過，等服務運作正常再回來。

預設產生的位址是完全隨機的 56 個字元。想讓開頭是可辨識的字串，例如 anoni.net 的 `anoninet`，需要反覆產生金鑰直到開頭符合為止。

[mkp224o](https://github.com/cathugger/mkp224o){target="_blank"} 是常用的工具，[Tor 官方的 vanity 位址說明](https://community.torproject.org/onion-services/advanced/vanity-addresses/){target="_blank"} 也以它為主。

先裝編譯需要的套件，mkp224o 的說明列出下列套件：

```bash
sudo apt install gcc libc6-dev libsodium-dev make autoconf
```

編譯與執行：

```bash
./autogen.sh
./configure
make
./mkp224o -d nekokeys neko
```

AMD64 平台可以在 `configure` 加上 `--enable-amd64-51-30k` 取得較好的效能，BSD 系統把 `make` 換成 `gmake`。產生的金鑰目錄結構與 `HiddenServiceDir` 相同，搬過去之後記得把擁有者與權限改成前面那一節的樣子。

### 成本

mkp224o 的說明給的估計是，6 個字元的前綴「shouldn't take more than few tens of minutes」，但那個數字有前提，原文寫的是 `if using batch mode`，細節在它的 `OPTIMISATION.txt`。7 個字元「can take hours to days」。它同時提醒這件事「depends on pure luck」，沒辦法給出保證。

每多一個字元，搜尋空間乘以 32。anoni.net 用的 `anoninet` 是 8 個字元，也就是比官方說明裡「hours to days」的 7 個字元再難 32 倍。

### 字元集的限制

onion 位址用 base32 編碼，字元集是 `a` 到 `z` 與 `2` 到 `7`。數字 `0`、`1`、`8`、`9` 不存在，所以帶這些數字的前綴不可能產生出來。mkp224o 會在開始前檢查並提早報錯。

### vanity 位址證明不了身分

這是最容易被誤解的地方。Tor 官方文件的說明是：

> An attacker wishing to impersonate an existing onionsite by creating a fake version of it might use vanity addresses as an additional way to convince users that their address is the right one.

任何人都可以用一般的運算資源產生另一組以 `anoninet` 開頭的位址。前綴相同不代表是同一個服務，它只是好記，沒有任何驗證作用。

所以自己架 vanity 位址的時候要清楚，前綴帶來的是可讀性，不是可信度。對外公布位址時要給完整的 56 個字元，讀者驗證時也要比對完整位址而不是只看開頭。

安全性本身不受影響。前綴以外的部分仍然是隨機產生的，vanity 位址不會比一般位址容易被破解。

## 六、上線前的檢查

依序確認，每一步都有明確的判準：

**1. Tor 連上 Tor 網路了**

```bash
sudo journalctl -u tor@default | grep -i bootstrapped | tail -1
```

要看到 `Bootstrapped 100% (done)`。

**2. 位址產生了**

```bash
sudo cat /var/lib/tor/my_website/hostname
```

要看到 56 個字元加上 `.onion`。

**3. 後端在本機回應正常**

```bash
curl -sI http://127.0.0.1:80/ -H 'Host: <你的位址>.onion' | head -1
```

要看到 `HTTP/1.1 200 OK`。帶 `Host` 標頭是為了模擬 Tor 實際會送過來的請求，順便驗證 `server_name` 有對上。

**4. 從 Tor 連得到**

用 Tor Browser 開那個 `.onion` 位址。沒有圖形介面的話：

```bash
sudo apt install torsocks
torsocks curl -sI http://<你的位址>.onion/ | head -1
```

!!! warning "第一次連不上很可能只是還沒好"

    服務的描述子要先發布到 Tor 網路上，剛設定完的前幾分鐘連不到是正常的。等幾分鐘再試一次，先不要回頭改設定。

    重啟 Tor 之後也會有同樣的空窗。

**5. 沒有東西連出去**

檢視頁面原始碼，確認圖片、字型、腳本都不是從 clearnet 載入的。點過站上主要的連結，確認不會跳出 Tor。

**6. 金鑰備份好了**

見前面「怎麼確認自己目前是安全的」。

clearnet 網站可以加上 `Onion-Location` 標頭，讓 Tor Browser 的訪客自動看到 onion 版本的提示：

```nginx
add_header Onion-Location http://<你的位址>.onion$request_uri;
```

依官方說明，這個標頭要放在**走 HTTPS 的 clearnet 網站**上，放在 onion 站自己身上沒有作用。

## 七、卡住的時候

??? question "Tor 起不來"

    先看日誌：`sudo journalctl -u tor@default -n 50`。

    看到 `Permissions on directory ... are too permissive` 就是目錄權限問題，`sudo chmod 0700` 那個目錄即可。

    看到 `Failed to parse/validate config` 表示 `torrc` 語法有誤，`sudo tor --verify-config` 會指出是哪一行。

??? question "改了 torrc 但好像沒生效"

    多半是重啟到 `tor.service` 而不是 `tor@default.service`。用 `systemctl list-units 'tor*'` 確認哪一個正在運作。

??? question "日誌看起來正常，但就是連不到"

    依序排除：

    1. 日誌有沒有 `Bootstrapped 100%`。沒有的話是 Tor 連不上 Tor 網路，檢查出站防火牆
    2. `hostname` 檔存不存在。不存在表示 `HiddenServiceDir` 那段沒有生效
    3. 剛設定完或剛重啟的話，描述子發布需要時間，等幾分鐘再試
    4. 本機直接連後端通不通（見上一節第 3 步）。不通的話問題在 nginx 不在 Tor

??? question "權限看起來完全正確，但 Tor 就是存取不了"

    如果你用了非預設的路徑，可能是 AppArmor 或 SELinux 擋下來的。這種失敗不會表現成權限錯誤，`ls -l` 看起來一切正常。

    ```bash
    sudo journalctl -k | grep -i 'apparmor.*DENIED'
    sudo dmesg | grep -i denied
    ```

    有命中的話，把路徑改回 `/var/lib/tor/` 底下是最快的解法。systemd unit 本身的沙盒設定（`ProtectSystem`、`ReadWritePaths`）也可能擋，非預設路徑要一併確認。

??? question "nginx 那一側怎麼查"

    ```bash
    sudo nginx -t
    sudo tail -50 /var/log/nginx/error.log
    ```

    走 Unix socket 的話，確認 socket 檔存在且 Tor 的身分寫得進去：`ls -l /run/onion/site.sock`。

??? question "重開機之後就連不上了"

    如果 socket 放在 `/run` 底下，那是 tmpfs，重開機會清空。需要 `/etc/tmpfiles.d/` 的規則才會重建，見第二節。

    另外確認 nginx 與 tor 兩個服務的啟動順序，nginx 要先建立好 socket，Tor 才連得上。

## 八、上線之後

### 服務不會自己通報故障

Tor 的行程存活不代表描述子還正常發布在網路上。定期從外部實際連一次是最直接的檢查方式，例如用 `torsocks curl` 排一個定時工作。

### 重啟會有空窗

每次重啟 Tor，描述子要重新發布，服務會有幾分鐘連不到，那不是故障。

### 延遲是固定成本

連線要繞過數個中繼，往返延遲通常是幾百毫秒到超過一秒。互動式的應用（後台管理介面、即時協作）在 onion 上的體感會明顯比 clearnet 差，靜態內容影響較小。這一點在決定要不要把某個服務放上 onion 時就要先想清楚。

### 換機器要搬的是 HiddenServiceDir

位址綁在金鑰上，只要把整個目錄搬過去、權限設對，位址不會變。這也是為什麼那個目錄的備份要當成機密資料保管。

### 主動下線

把 `torrc` 裡對應的兩行移除並重啟即可。位址一旦停用就無法讓別人知道發生什麼事，如果有讀者依賴它，先在 clearnet 那側公告。

## 九、Caddy 的做法

如果你的環境已經在用 Caddy，[Onion mirror with Caddy](https://flower.codes/2025/10/23/onion-mirror.html){target="_blank"} 有一份可以照做的說明。

Caddy 預設會自動申請 TLS 憑證，用在 onion 服務上要記得關掉，理由與前面 HTTPS 那節相同。整體流程與本文一致，差別只在導流那一層的設定語法。

## 相關閱讀

- [去中心化發布：IPFS 與 Onion](../advanced/dweb-ipfs-onion.md)：原理、兩者的取捨，以及 anoni.net 三軌部署的整體架構
- [協助 pin 文件站的 IPFS 鏡像](./pin-ipfs-mirror.md)：另一種抗封鎖鏡像的做法
- [如何搭建 Tor Relay](./setup-tor-relay.md)：把頻寬貢獻給 Tor 網路，跟本文是不同性質的任務
- [OnionShare](../tools/onionshare.md)：臨時分享檔案與架站，不需要自己維運服務

需要多台機器分攤同一個 onion 位址的流量時，Tor Project 底下有 [OnionBalance](https://gitlab.torproject.org/tpo/onion-services/onionbalance){target="_blank"} 這個專案。它在 2021 到 2025 年之間沉寂過一段時間，2025 年 4 月恢復發布，最新版本是 `0.2.4`，評估時值得先看一下專案的近況。
