---
title: 幫忙 pin 文件站的 IPFS 鏡像
description: 用一個常駐的 IPFS 節點加排程腳本，幫 anoni.net 文件站 pin 最新鏡像，提高抗刪除存活率。給 Windows、Linux、macOS 的節點貢獻者，含 Docker 與非 Docker 做法。
icon: simple/ipfs
---

# :simple-ipfs: 幫忙 pin 文件站的 IPFS 鏡像

anoni.net 文件站除了主站，還有一份 IPFS 鏡像，讓文件在主站被封鎖或下架時仍然讀得到。IPFS 上的內容要有節點 pin 才會存活，目前只有社群自己的節點在 pin。你多跑一個節點幫忙 pin，網路上就多一份完整複本，抗刪除的底氣更足。

這頁教你用一個常駐的 IPFS 節點，加一支自動跟上最新版本的排程腳本。整個過程對 Windows、Linux、macOS 都適用，有沒有用 Docker 都可以。

!!! tip "要幫忙，你需要"

    - 一台幾乎整天開著、能連網的電腦（桌機、家用伺服器、或一台小主機都可以）。
    - 安裝 IPFS（下面會帶你裝）。
    - 跑一支排程腳本，每隔幾小時自動 pin 最新版本。

    幫不了節點也沒關係，文末的「不想自架節點」有用 pinning service 代 pin 的替代做法。

## 為什麼 CID 每次都不一樣（IPFS 30 秒入門）

第一次接觸 IPFS 的話，先理解一件事，後面的排程才講得通。IPFS 的深入設計見 [去中心化網站發布](../advanced/dweb-ipfs-onion.md)，這裡只講到夠用為止。

- IPFS 把檔案內容算出一段 hash，叫做 CID（Content Identifier），這段 CID 就是內容在 IPFS 上的位址。內容相同，CID 就相同。
- 內容一改，CID 就跟著變。文件站每次更新、重新發布，都會產生一個全新的 CID。
- IPNS（InterPlanetary Name System）是一個固定不變的名字，永遠指向「目前最新」的那個 CID。文件站的 IPNS 名字就是下面那串 `k51…`。
- pin 的意思是「保證留住某個 CID 的內容」。pin 綁在 CID 上，不會自己跟著 IPNS 走。所以文件站一發新版，你上次 pin 的還是舊 CID。

結論就是這支腳本要做的事：先把 IPNS 換算成當前的 CID，再 pin 那個新 CID，然後放掉舊的。因為 CID 會變，這件事要定期重跑，這就是為什麼要排程。

## 運作原理（為什麼排程就夠，不用等通知）

你不需要社群通知你「換新版了」。IPNS 就是大家共用的同步點，你的腳本自己去解析就拿得到最新 CID。文件站發布時只是照常更新 IPNS，你這邊每隔幾小時解析一次、發現變了就 pin 新版，全程不用人工協調。

!!! info ""

    文件站的 IPFS 座標（公開值，可以直接用）：

    - IPNS 名稱：`k51qzi5uqu5dlfm2jj0f70ex3r3babmwy8qh071inwknttr7wqa3uhdwvlmrmw`
    - 瀏覽器打開看：[https://anoni-net.ipns.dweb.link/](https://anoni-net.ipns.dweb.link/){target="_blank"}

腳本每次跑的動作是：解析 IPNS 拿到當前 CID，pin 新 CID，unpin 上次那版，回收空間。腳本先確認新版 pin 成功，才會放掉舊版。萬一解析失敗或抓不到內容，它會保留你手上現有的複本，不會讓你的節點變空。

## 步驟一：跑一個常駐的 IPFS 節點

pin 要能抓齊內容，本機就得有一個持續運作的 IPFS daemon。下面依你的環境選一種。

=== "Linux / macOS"

    安裝 [kubo](https://docs.ipfs.tech/install/command-line/){target="_blank"}（IPFS 官方的命令列版本）。macOS 可以用 Homebrew：

    ```bash
    brew install ipfs
    ```

    Linux 依 [官方說明](https://docs.ipfs.tech/install/command-line/){target="_blank"} 下載對應架構的 kubo。裝好後初始化並啟動 daemon：

    ```bash
    ipfs init          # 第一次才需要
    ipfs daemon
    ```

    要讓 daemon 長時間常駐，Linux 建議做成 systemd user service，macOS 可以用 `brew services` 或 launchd。臨時測試時，直接讓 `ipfs daemon` 在背景跑也可以。

=== "Windows"

    最省事的是安裝 [IPFS Desktop](https://docs.ipfs.tech/install/ipfs-desktop/){target="_blank"}，它內含 kubo，登入後會自動在系統匣常駐，daemon 一直開著。

    裝好後確認命令列能呼叫到 `ipfs`。獨立版 kubo 需要自己把 `ipfs.exe` 加進系統 PATH，用 IPFS Desktop 的話，若 PATH 找不到 `ipfs`，在腳本裡改用完整路徑即可。

=== "Docker"

    用一個 `docker-compose.yml` 跑 kubo，容器名取 `ipfs_host`：

    ```yaml
    services:
      ipfs_host:
        image: ipfs/kubo:latest
        restart: always
        volumes:
          - ./ipfs-data:/data/ipfs
        ports:
          - "4001:4001"   # swarm，對外開有助於連到其他節點
    ```

    啟動：

    ```bash
    docker compose up -d
    ```

    之後對 IPFS 下指令都透過容器，設一個環境變數讓腳本自動套用（下一步會用到）：

    ```bash
    export IPFS_CMD="docker exec ipfs_host ipfs"
    ```

## 步驟二：取得 pin 腳本

腳本會自己解析 IPNS、pin 新版、unpin 舊版。IPNS 名字已經寫死在裡面，不用改。Docker 使用者記得先設好上一步的 `IPFS_CMD`。

### Linux、macOS、Docker：`anoni-pin.sh`

[:material-download: 下載 anoni-pin.sh](https://raw.githubusercontent.com/anoni-net/docs/main/docs/_scripts/anoni-pin.sh){ .md-button }

```bash
--8<-- "_scripts/anoni-pin.sh"
```

存檔後給執行權限：

```bash
chmod +x anoni-pin.sh
./anoni-pin.sh          # 先手動跑一次確認正常
```

### Windows：`anoni-pin.ps1`

[:material-download: 下載 anoni-pin.ps1](https://raw.githubusercontent.com/anoni-net/docs/main/docs/_scripts/anoni-pin.ps1){ .md-button }

```powershell
--8<-- "_scripts/anoni-pin.ps1"
```

先手動跑一次確認正常（PowerShell 預設會擋腳本，用 `-ExecutionPolicy Bypass` 放行這一次）：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\anoni-pin.ps1
```

## 步驟三：設定排程

讓腳本每隔幾小時自動跑。文件站更新不頻繁，每 6 小時足夠，想更快跟上可以縮短。

=== "Linux / macOS"

    用 cron。編輯排程表：

    ```bash
    crontab -e
    ```

    加一行，每 6 小時跑一次，並把輸出寫進 log：

    ```bash
    0 */6 * * * /path/to/anoni-pin.sh >> $HOME/.anoni-pin/log 2>&1
    ```

    想要開機補跑漏掉的排程，也可以改用 systemd timer（設 `Persistent=true`），效果更穩。

=== "Windows"

    用「工作排程器」。最快的方式是命令列建立，每 6 小時跑一次：

    ```powershell
    schtasks /Create /TN "anoni-ipfs-pin" `
      /TR "powershell -NoProfile -ExecutionPolicy Bypass -File C:\Tools\anoni-pin.ps1" `
      /SC HOURLY /MO 6 /RL LIMITED
    ```

    把 `C:\Tools\anoni-pin.ps1` 換成你實際存放的路徑。也可以用「工作排程器」的圖形介面，觸發程序填 `powershell`，引數填 `-NoProfile -ExecutionPolicy Bypass -File 你的路徑`。

=== "Docker"

    排程照你主機的作業系統設（Linux、macOS 用 cron，Windows 用工作排程器，見前兩個分頁）。差別只在腳本執行前要先設好 `IPFS_CMD`，例如包一層小 wrapper：

    ```bash
    #!/usr/bin/env bash
    export IPFS_CMD="docker exec ipfs_host ipfs"
    exec /path/to/anoni-pin.sh
    ```

    把 cron 指到這支 wrapper 即可。

## 步驟四：驗證

確認腳本真的把內容 pin 住了。先解析出當前 CID，再看它在不在 pin 清單：

```bash
CID=$(ipfs name resolve --nocache /ipns/k51qzi5uqu5dlfm2jj0f70ex3r3babmwy8qh071inwknttr7wqa3uhdwvlmrmw)
ipfs pin ls --type=recursive | grep "${CID#/ipfs/}"
```

也可以在本機 gateway 開起來看，內容正常顯示就成功了：`http://127.0.0.1:8080${CID}/`。Docker 使用者把上面的 `ipfs` 換成 `docker exec ipfs_host ipfs`。

## 維護與注意事項

- **會自動跟上新版**：文件站換 CID 後，下一次排程就會 pin 新版、放掉舊版，你不用做任何事。
- **磁碟不會一直長大**：腳本 unpin 舊版後會執行一次垃圾回收，只留最新版本佔空間。文件站是純靜態網站，體積不大。
- **不會弄丟你手上的版本**：腳本先確認新版 pin 成功才放掉舊版，解析或下載失敗時會保留現有複本。
- **想停止幫忙**：unpin 目前版本、把排程移除即可，不影響其他節點。
- **隱私與風險**：你 pin 的是公開文件，沒有隱私顧慮。提供 IPFS pin 在不同司法管轄下的風險不同，相關限制見 [去中心化網站發布](../advanced/dweb-ipfs-onion.md) 的「已知限制與風險」。

## 不想自架節點：用 pinning service 代 pin

不想維護 daemon 與排程的話，可以改用 [Pinata](https://www.pinata.cloud/){target="_blank"}、[Storacha](https://storacha.network/){target="_blank"} 這類 pinning service。在它們的介面直接貼上當前 CID 手動 pin，或用它們的 API 寫個排程餵新 CID，邏輯跟本頁腳本一樣（解析 IPNS 拿 CID，再送給服務 pin）。

差別在存活重新依賴第三方服務商，而不是你自己的節點。當備援可以，想真正分散化還是自架節點最直接。

## :fontawesome-solid-diagram-project: 相關閱讀

<div class="grid cards" markdown>

- [:material-web-box: 去中心化網站發布](../advanced/dweb-ipfs-onion.md)
- [:material-server-network: 如何搭建 Tor Relay](./setup-tor-relay.md)
- [:material-chat-question: 什麼是 Tor](../tools/what-is-tor.md)

</div>
