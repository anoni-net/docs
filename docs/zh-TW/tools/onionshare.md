---
title: OnionShare
description: 透過 Tor 起臨時 onion service，匿名傳檔、收檔、架站、聊天。會話結束就消失，不需要第三方 server。
icon: material/share-circle
---
# :material-share-circle: OnionShare 透過 Tor 匿名傳輸

[OnionShare](https://onionshare.org/){target="_blank"} 是一個開源工具，在你電腦上起一個臨時的 Tor onion service，讓你跟對方匿名傳檔、收檔、架站、聊天。檔案不上雲、不註冊帳號、流量走 Tor 多層加密。會話結束你關掉視窗，那個 onion service 就消失，沒有殘留。

## 為什麼用 OnionShare

- **不必信任第三方平台**。檔案直接從你的電腦傳到對方的 Tor Browser，中間沒有 Google Drive、沒有 Dropbox、沒有 anoni.net。
- **無帳號、無 ID**。對方拿到的只是一個 `.onion` 網址，他不會知道你是誰、你的 IP 是什麼。你也不會知道對方是誰。
- **會話即用即丟**。關掉 OnionShare，onion service 同時下線，網址自動失效。沒有後台 log、沒有 metadata 落地。
- **跨平台桌面工具**。macOS、Windows、Linux、Tails 都有 GUI。也有 CLI 可以架在 server 做長期收件箱。

## 你應該知道的事

開始操作前，先掌握幾個使用前提：

- **IP 不會洩漏給對方**。流量走 Tor，對方只看到 `.onion` 網址，看不到你的真實 IP。
- **會話結束就消失**。關閉 OnionShare 視窗，onion service 同時下線，沒有殘留。Tor 網路也不會留下這個 onion 曾經存在的紀錄。
- **網址要透過安全管道交給對方**。OnionShare 不負責配送網址。如果你用 LINE 把網址傳給對方，那一段就不再匿名。常見做法是 Signal、Cryptpad 或當面口頭交換。
- **對方需要 Tor Browser**。如果對方完全不會用 Tor，OnionShare 不適合。改用 [send.anoni.net](https://send.anoni.net/){target="_blank"} 或 PGP 加密郵件。
- **長期 Receive 收件箱建議用獨立硬體**。掛在主力電腦 24/7 容易被當作攻擊面，建議用 Tails USB 或專用 Linux box。
- **流量會用到你的網路頻寬**。對方下載大檔時，你的網路上傳會被佔用，速度也受限於 Tor 網路（速度受 Tor 網路當下壅塞情況影響，可能偏慢）。

## 四種使用模式

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionshare-modes.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionshare-modes.png"
            alt="OnionShare 主視窗的四個模式分頁"
            title="OnionShare 主視窗的四個模式分頁"
            class="brand-frame">
    </a>
    <capture>OnionShare 主視窗的四個模式分頁，從左到右分別是 Share Files、Receive Files、Host a Website、Chat Anonymously。</capture>
</figure>

### Send（送檔）

把檔案丟進 OnionShare，產生一個 `.onion` 網址。把網址透過安全管道交給對方，對方用 Tor Browser 開啟、下載。

- **適用**：把證據傳給律師、把訪談材料寄給編輯、行動結束分發紀錄、給法律顧問送一次性檔案。
- **限制**：對方需要 Tor Browser。下載完成後啟動者要手動關閉 OnionShare（也可以設定下載完自動停）。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionshare-send-url.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionshare-send-url.png"
            alt="OnionShare Send 模式產生 .onion URL 與 private key"
            title="OnionShare Send 模式產生 .onion URL 與 private key"
            class="brand-frame">
    </a>
    <capture>Send 模式啟動分享後，OnionShare 會產生 .onion 網址與 private key。把網址跟 private key 透過不同安全管道交給對方，可避免中間人替換。</capture>
</figure>

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionshare-receiver-view.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionshare-receiver-view.png"
            alt="接收方在 Tor Browser 看到的 OnionShare 下載頁"
            title="接收方在 Tor Browser 看到的 OnionShare 下載頁"
            class="brand-frame">
    </a>
    <capture>接收方拿到 .onion 網址後，在 Tor Browser 開啟看到的是預設的下載頁面，外觀像一般靜態網站，不必額外學習。</capture>
</figure>

### Receive（收檔）

開放一個上傳介面，產生 `.onion` 網址。投件人用 Tor Browser 開啟網址、上傳檔案，你在本機收到。

- **適用**：記者公開的隱蔽收件箱、組織徵集匿名投稿、危機通報窗口。
- **限制**：要長時間掛在線上，建議搭配獨立硬體（不是日常電腦）。`scenarios/journalist.md` 提到的「自架收件箱」就是這個模式。

### Host a Website（暫時架站）

把一份 HTML、CSS、JS 丟進去，OnionShare 會起一個 onion 靜態站。

- **適用**：臨時公布敏感內容、活動期間限定資料、無法上 clearnet 的研究草稿、給特定對象看的 preview 頁。
- **限制**：純靜態，沒有後端、沒有資料庫。流量上限受限於你的網路頻寬。

### Chat（一次性聊天室）

多人加密聊天室，記憶體中執行，沒有持久紀錄。啟動者關掉，整個聊天室就消失。

- **適用**：行動現場臨時協調、敏感會議的會中通訊、不希望事後留下對話紀錄的小組討論。
- **限制**：所有人都要 Tor Browser 連入。歷史訊息不保留，無法事後翻閱。

## 如何安裝

- **macOS、Windows、Linux 桌面**：到 [onionshare.org](https://onionshare.org/){target="_blank"} 下載官方 GUI。
- **Flatpak 或 Snap**：對 Linux 使用者更方便的封裝，套件庫名稱 `org.onionshare.OnionShare`。
- **Tails**：已預裝。Applications 選單找得到，搭配 [什麼是 Tails](./what-is-tails.md) 了解整體系統定位。
- **CLI 版**：適合架在 server 做長期 Receive 收件箱，或整合到自動化流程。

## 跟其他工具的取捨

| 工具 | 適用 | 與 OnionShare 的差別 |
|---|---|---|
| [send.anoni.net](https://send.anoni.net/){target="_blank"} | 一次性加密傳檔，網頁瀏覽器即可使用 | 雙方都不需 Tor，門檻低。檔案經過 anoni.net server（端對端加密、可設密碼、過期自動刪除），信任邊界比 OnionShare 大 |
| [SecureDrop](https://securedrop.org/){target="_blank"} | 媒體機構的隱蔽收件系統 | 需要專業部署與長期運維，國際大型媒體（紐約時報、衛報、Intercept）使用。OnionShare Receive 是個人記者就能跑的輕量版 |
| Signal 附件 | 已建立信任的雙方傳檔 | Signal 綁手機號碼，第一次接觸前對方可能不想暴露號碼。OnionShare 完全無帳號、無 ID，適合首次接觸 |

選擇邏輯：

- 對方不會用 Tor、檔案敏感度中等，選 [send.anoni.net](https://send.anoni.net/){target="_blank"}
- 媒體機構長期收件、需要審計追蹤，選 SecureDrop
- 已經在 Signal 對話中、單純傳一份檔，用 Signal 附件就夠
- 第一次接觸、對方不該暴露身分、不想經第三方，用 OnionShare

## 常見問題

??? question "對方完全沒用過 Tor，怎麼引導？"

    把 [Tor Browser 進階設定](./tor-browser-advanced.md) 的入門段落連結傳給對方，請對方先安裝 Tor Browser，再開你的 `.onion` 網址。如果對方拒絕安裝 Tor，改用 [send.anoni.net](https://send.anoni.net/){target="_blank"} 或 PGP 加密郵件。

??? question "怎麼確認對方拿到的是正確網址、沒被替換？"

    OnionShare 產生網址的同時會給一個 private key 或 public key 指紋。把網址跟指紋分開兩個管道交給對方（例如網址用 Signal、指紋用當面口頭），對方在 Tor Browser 開啟時驗證指紋。OnionShare GUI 也支援「需要對方輸入 password 才能下載」，敏感場景建議啟用。

??? question "Receive 模式可以收多大的檔案？"

    技術上沒有檔案大小限制，實務上受限於三個因素，你的網路上傳頻寬、Tor 網路速度（速度受 Tor 網路當下壅塞情況影響，可能偏慢）、你願意把 OnionShare 開多久。超過 1 GB 的檔案建議拆段或改用其他管道。

??? question "Chat 模式跟 Signal、SimpleX 有什麼差？"

    Signal、SimpleX 是長期帳號加上長期裝置的通訊工具，適合日常通訊。OnionShare Chat 是一次性、無帳號、無歷史紀錄的會議室，啟動者關閉就完全消失。適合一次性協調，不適合日常通訊。可參考 [匿名通訊工具比較](./messaging-comparison.md)。

??? question "手機可以用嗎？"

    OnionShare 有官方 Android app（Google Play 與 F-Droid 可裝，仍是 beta），iOS app 仍在開發中（截至 2026 年）。手機端較成熟的用法仍是當「接收方」，用 Tor Browser for Android 或 Onion Browser for iOS 開啟對方提供的 `.onion` 網址。要當發送方建議用桌面或 Tails。

??? question "OnionShare 跟 Tor Bridge、Snowflake 有關係嗎？"

    沒有直接關係。Tor Bridge、[Snowflake](./tor-snowflake.md) 是「幫助別人連上 Tor 網路」的入口節點，OnionShare 則是「在 Tor 網路上提供服務」的工具。兩者是 Tor 生態裡不同位置的角色。

## 接下來

第一次要把敏感檔案傳出去，先挑一個模式試跑一次（送檔最單純），熟悉「產生 `.onion` 網址、透過安全管道交給對方」這個流程。要把它接進完整的工作流程，可以延伸看 [記者保護消息來源](../scenarios/journalist.md) 與 [上傳機敏資訊流程](../community/upload-sensitive.md)。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-chat-question: 什麼是 Tor](./what-is-tor.md)
- [:material-chat-question: 什麼是 Tails](./what-is-tails.md)
- [:material-chat-question: 匿名通訊工具比較](./messaging-comparison.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-newspaper: 記者保護消息來源（場景）](../scenarios/journalist.md)
- [:material-snowflake: Tor Snowflake 橋接點](./tor-snowflake.md)
- [:material-translate-variant: 中文化與文件翻譯](../community/i18n.md)

</div>
