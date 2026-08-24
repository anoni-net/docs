---
title: 如何搭建 .onion 服務
description: 用 Tor 官方方式架設 v3 onion 服務，接上 nginx 導流與子網域，並說明 vanity 位址的產生方式與它給不了的保證。
icon: material/onepassword
---

# :material-onepassword: 如何搭建 .onion 服務

Onion 服務讓別人透過 Tor 直接連到你的伺服器，過程中不需要公開伺服器的 IP，也不需要向任何憑證機構註冊網域。連線兩端都在 Tor 網路內完成，加密由 Tor 本身處理。

這份文件帶你架起一個 v3 onion 服務，接上 nginx 導流，處理子網域，並說明 vanity 位址怎麼產生、以及它給不了什麼保證。

!!! info "先理解原理再回來"

    這頁是操作步驟。onion 服務的設計原理、它與 IPFS 的取捨、以及 anoni.net 文件站三軌部署的整體架構，見 [去中心化發布：IPFS 與 Onion](../advanced/dweb-ipfs-onion.md)。

    只是想臨時分享檔案或架一個用完即丟的站，[OnionShare](../tools/onionshare.md) 的成本比自己架設服務低。這頁說明的是長期運作的服務。

## 需要什麼

- 一台你能控制的伺服器，Linux 為主
- 已安裝的 `tor`，套件庫版本通常都支援 v3
- 一個已經在 `127.0.0.1` 上運作的網頁服務

不需要網域，不需要公開的 IP，不需要 TLS 憑證。

## 一、Tor 官方的做法

編輯 `torrc`，加上兩行。[Tor 官方文件](https://community.torproject.org/onion-services/setup/){target="_blank"} 的範例是這樣：

```
HiddenServiceDir /var/lib/tor/my_website/
HiddenServicePort 80 127.0.0.1:80
```

`HiddenServiceDir` 是 Tor 存放這個服務身分的目錄，`HiddenServicePort` 的前一個數字是 onion 上對外的埠，後面是後端服務實際監聽的位址與埠。

也可以走 Unix socket，避免後端在 TCP 上監聽：

```
HiddenServiceDir /var/lib/tor/my-website/
HiddenServicePort 80 unix:/var/run/tor/my-website.sock
```

### 目錄權限

官方文件對這點只寫了一句，目錄要「readable/writeable by the user that will be running Tor」，沒有給出具體的權限數值。

實務上這個目錄必須只有 Tor 的執行身分能讀寫。權限放寬到同群組或其他人可讀時，Tor 會拒絕啟動並在日誌裡說明原因。套件安裝的 `tor` 通常以 `debian-tor` 或 `tor` 這個使用者執行，確認方式是看發行版的 service 設定。

如果 Tor 起不來，第一個要看的就是這個目錄的擁有者與權限。

### 取得位址

重啟 `tor` 之後，`HiddenServiceDir` 底下會出現幾個檔案。`hostname` 裡面是這個服務的 v3 位址，56 個字元加上 `.onion`。

其餘檔案是這個服務的金鑰。官方文件的警告值得逐字讀：

> The other files are your Onion Service keys, so it is imperative that these are kept private. If your keys leak, other people can impersonate your Onion Service, deeming it compromised, useless, and dangerous to visit.

金鑰外洩的後果沒有補救方式。onion 位址就是公鑰的編碼，沒有撤銷機制，也沒有機構可以幫你註銷。唯一的處理是產生新位址並通知所有讀者，而通知本身在抗審查的情境下往往做不到。

備份 `HiddenServiceDir` 的整個目錄，存放的位置要用跟伺服器同等或更高的標準保護。

## 二、接到 nginx

Onion 服務本身只負責把連線送到你指定的位址與埠，導流由 nginx 決定。

後端只綁 `127.0.0.1`，不對外開埠。伺服器的防火牆不需要為了 onion 服務開任何入站埠，Tor 是主動對外建立連線的。

```nginx
server {
    listen 127.0.0.1:80;
    server_name <你的位址>.onion;

    root /var/www/site;
    index index.html;
}
```

`server_name` 要填入實際的 onion 位址。沒有填的話請求會落到 nginx 的 default server，通常會取得錯誤的內容或預設頁。

### 不要在 onion 上另外啟用 HTTPS

Tor 對 onion 服務的連線本身已經是端到端加密並經過驗證，位址就是公鑰。再包一層 TLS 只會帶來兩個問題，公開憑證機構通常不簽發 `.onion` 憑證，而自簽憑證會讓每個訪客看到瀏覽器警告。

保持 HTTP，讓 Tor 處理加密。

### 常見的踩雷

- **後端在回應裡寫死 clearnet 網址**。頁面上的連結、表單 action、重新導向如果指向原本的網域，訪客一點就跳出 Tor，匿名性當場失效
- **外部資源**。圖片、字型、分析腳本如果從 clearnet 載入，同樣會讓訪客的瀏覽器對外連線
- **`Host` 標頭檢查**。有些應用程式框架會拒絕不在允許清單內的 `Host`，onion 位址要另外加進去

## 三、子網域怎麼運作

Onion 位址可以帶子網域，而且不需要另外申請或設定任何 DNS。Tor 會把完整的 `Host` 原樣傳給後端，由 nginx 決定怎麼分流。

anoni.net 文件站的位址正好是這個結構：

```
docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion
└┬─┘ └──────────────────── 56 字元的 v3 位址 ────────────────────┘
 └── 子網域，由 nginx 的 server_name 分流
```

一個 onion 位址可以承載多個子網域，nginx 這樣寫：

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

## 四、vanity 位址

預設產生的位址是完全隨機的 56 個字元。想讓開頭是可辨識的字串，例如 anoni.net 的 `anoninet`，需要反覆產生金鑰直到開頭符合為止。

[mkp224o](https://github.com/cathugger/mkp224o){target="_blank"} 是常用的工具，[Tor 官方的 vanity 位址說明](https://community.torproject.org/onion-services/advanced/vanity-addresses/){target="_blank"} 也以它為主。

編譯與執行：

```bash
./autogen.sh
./configure
make
./mkp224o -d nekokeys neko
```

AMD64 平台可以在 `configure` 加上 `--enable-amd64-51-30k` 取得較好的效能，BSD 系統把 `make` 換成 `gmake`。產生的金鑰目錄結構與 `HiddenServiceDir` 相同，直接搬過去即可。

### 成本

mkp224o 的說明給的估計是，6 個字元的前綴在批次模式下「shouldn't take more than few tens of minutes」，7 個字元「can take hours to days」。它同時提醒這件事「depends on pure luck」，沒辦法給出保證。

每多一個字元，搜尋空間乘以 32。anoni.net 用的 `anoninet` 是 8 個字元，比官方說明裡「hours to days」的 7 個字元再高一個數量級。

### 字元集的限制

onion 位址用 base32 編碼，字元集是 `a` 到 `z` 與 `2` 到 `7`。數字 `0`、`1`、`8`、`9` 不存在，所以帶這些數字的前綴不可能產生出來。mkp224o 會在開始前檢查並提早報錯。

### vanity 位址證明不了身分

這是最容易被誤解的地方。Tor 官方文件的說明是：

> An attacker wishing to impersonate an existing onionsite by creating a fake version of it might use vanity addresses as an additional way to convince users that their address is the right one.

任何人都可以用一般的運算資源產生另一組以 `anoninet` 開頭的位址。前綴相同不代表是同一個服務，它只是好記，沒有任何驗證作用。

所以自己架 vanity 位址的時候要清楚，前綴帶來的是可讀性，不是可信度。對外公布位址時要給完整的 56 個字元，讀者驗證時也要比對完整位址而不是只看開頭。

安全性本身不受影響。前綴以外的部分仍然是隨機產生的，vanity 位址不會比一般位址容易被破解。

## 五、上線前的檢查

- 用 Tor Browser 實際連一次，確認內容正確
- 檢視頁面原始碼，確認沒有任何從 clearnet 載入的資源
- 點過站上主要的連結，確認不會跳出 Tor
- 確認 `HiddenServiceDir` 已備份，且備份的存放位置有適當保護

clearnet 網站可以加上 `Onion-Location` 標頭，讓 Tor Browser 的訪客自動看到 onion 版本的提示。

## 六、Caddy 的做法

如果你的環境已經在用 Caddy，[Onion mirror with Caddy](https://flower.codes/2025/10/23/onion-mirror.html){target="_blank"} 有一份可以照做的說明。

Caddy 預設會自動申請 TLS 憑證，用在 onion 服務上要記得關掉，理由與前面 nginx 那節相同。整體流程與本文一致，差別只在導流那一層的設定語法。

## 相關閱讀

- [去中心化發布：IPFS 與 Onion](../advanced/dweb-ipfs-onion.md)：原理、兩者的取捨，以及 anoni.net 三軌部署的整體架構
- [協助 pin 文件站的 IPFS 鏡像](./pin-ipfs-mirror.md)：另一種抗封鎖鏡像的做法
- [如何搭建 Tor 中繼節點](./setup-tor-relay.md)：對 Tor 網路的另一種貢獻方式
- [OnionShare](../tools/onionshare.md)：臨時分享檔案與架站，不需要自己維運服務
