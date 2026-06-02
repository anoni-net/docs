---
title: 匿名通訊工具比較
description: Signal、SimpleX、Session、Briar、Matrix 的端對端加密、Metadata 與身分模型差異，以及在台灣使用時的補充。
icon: material/message-text-outline
---

# :material-message-text-outline: 匿名通訊工具比較

「端對端加密」這幾個字在 LINE、Telegram、WhatsApp、Signal、SimpleX、Session、Briar、Matrix 上意義差很多。差異涵蓋多個面向：金鑰由誰持有、註冊時要不要綁手機號碼或郵件、Metadata 留在哪個 server、伺服器掉線後還能不能通訊、群組與多裝置的設計選擇。

這篇文章從幾個面向比較常見的匿名通訊工具，重點放在 5 個主軸（Signal、SimpleX、Session、Briar、Matrix/Element）與 3 個對照（LINE、Telegram、WhatsApp）。動手前可以先回頭看 [威脅模型怎麼想](../basics/threat-model.md) 了解自己在抗誰，需要協議層細節（Double Ratchet、Sender Keys、MLS）可參考 [端對端加密如何運作](../advanced/e2ee.md)，Metadata 為什麼是獨立風險可看 [Metadata 是什麼](../basics/metadata.md)。

## 為什麼要分開比較這些工具

「端對端加密」聽起來像一個技術合格章，但實際上要追問三件事才有意義：

- **「端」是什麼**：是裝置、是帳號、還是一段隨機 ID？決定了攻擊者拿到帳號還是裝置時的風險。
- **預設啟用嗎**：很多工具的 E2EE 是可選功能，要使用者主動切換才生效。
- **Metadata 留在哪**：訊息內容加密了，「誰跟誰、什麼時候、多頻繁」這層往往沒加密。

LINE、Telegram、WhatsApp 三家在前述三個問題上都有明顯短處，所以不在主名單。它們在台灣社交網絡裡仍然不可避免，後面的「在台灣的補充」會說明怎麼分流。

主名單的 5 個工具是社群實際在用、且設計目標就是 E2EE 與 Metadata 最小化的選項。下面先給判讀框架，再開始一個一個介紹。

## 五個比較軸

讀每個工具時可以對照這五個軸看：

1. **身分綁定方式**：手機號碼、email、隨機 ID、Tor 隱藏服務、實體裝置金鑰。決定了「跟我聯絡的人能不能透過這個 ID 找到我的真實身分」。
2. **E2EE 與前向保密**：是否預設啟用、用什麼協議、有沒有 Double Ratchet（每則訊息獨立金鑰）。
3. **Metadata 暴露面**：server 或對手能看到誰跟誰、訊息時間、訊息大小、群組成員。
4. **跨裝置同步與離線可用性**：手機掉了訊息能不能救回來、沒網路時還能不能傳訊息（mesh）。
5. **群組與多裝置 UX**：Sender Keys 還是 MLS、新成員加入有沒有歷史訊息、踢人後能不能立即斷新訊息。

額外還會看「開源與審計」，但這對 5 個主軸全部都是「是」，沒有區分作用，所以不單獨拉出來討論。

## 軸度速查表

| 工具 | 身分綁定 | E2EE 預設 | Metadata 留在哪 | 多裝置 | 群組 | 開源 |
|------|---------|----------|---------------|--------|------|------|
| Signal | 手機號碼（可加 username） | 是（Signal Protocol） | 中央 server，最小化設計 | 行 | Sender Keys | 是 |
| SimpleX | 隨機 queue ID | 是 | 設計上不知道誰跟誰 | 行（裝置間自管） | 行 | 是 |
| Session | 隨機 ID（無手機） | 是（fork Signal） | Onion-routed 網路，去中心化 | 限制較多 | 部分 | 是 |
| Briar | 裝置內金鑰對 | 是（Tor、Bluetooth、Wi-Fi mesh） | 不存在中央 server | 不行 | 行 | 是 |
| Matrix/Element | email 或 username | 房間級（要手動開） | 房間參與的 homeserver 都看得到 | 行 | MLS 推進中 | 是 |
| (對照) LINE | 手機號碼 | 限對話與部分內容（Letter Sealing） | 全部，server 端可解 | 行 | 部分 | 否 |
| (對照) Telegram | 手機號碼 | 僅 Secret Chat | 全部 | 行 | 不適用 | 部分（client） |
| (對照) WhatsApp | 手機號碼 | 是（Signal Protocol） | 廣（Meta 集團） | 行 | 行 | 否 |

對照組的「E2EE 預設」一欄寫的是訊息內容層級，不代表 metadata 也加密。Telegram 的「不適用」是因為一般群組與頻道根本不走 E2EE，沒辦法談「群組 E2EE 機制」。

## Signal

[Signal](https://signal.org/){target="_blank"} 是 E2EE 通訊工具的當前共識答案，協議成熟、UX 接近主流 IM。一對一用 Double Ratchet（每則訊息獨立金鑰），群組用 Sender Keys，協議細節見 [端對端加密如何運作](../advanced/e2ee.md)。

身分模型上，Signal 註冊仍需手機號碼，但 2024 年正式推出 username 功能，可以在不揭露號碼的情況下交換聯絡方式。Sealed Sender 設計讓 server 看不到單則訊息的寄件人，私聯絡人探索（private contact discovery）也讓 server 不知道你的通訊錄。

**適合誰**：日常通訊首選、跟記者第一次接觸（搭配 username 可以避開手機號碼）、跨組織協作的長期通道。台灣社群多數對外聯絡的工作通道都是 Signal。

**限制**：

- 註冊仍需手機號碼，雖然能加 username，初次驗證仍有電話這層
- Sealed Sender 隱藏單則訊息的寄件人，不隱藏「這個帳號存在」這件事
- 多裝置靠 device linking，新裝置看不到舊訊息（除非開啟 2024 年加入的加密訊息備份）
- 客戶端 UX 偏「美式」，部分功能（已讀回條、群組權限）跟亞洲使用者習慣不一致

## SimpleX

[SimpleX Chat](https://simplex.chat/){target="_blank"} 在身分模型上做了最大膽的選擇：完全沒有 user identifier。每段對話走一組「queue」，由隨機 ID 識別，server 看到的只是「這個 queue 收到一個訊息要轉給誰」，不知道你的帳號是誰、你的聯絡人有誰、你跟誰在通訊。

加好友的方式是交換一個 invitation link 或 QR code，雙方在第一次連線時建立 queue，之後就用這組 queue 通訊。換句話說，SimpleX 沒有「帳號」這個資料項，要找你的對手連個搜尋目標都沒有。

**適合誰**：

- 完全不想暴露身分（連手機號碼都不要）
- 跨組織協作的初次接觸（雙方互不認識，又需要建立加密通道）
- 跟「來路不明但需要保護」的對象通訊（爆料人、跨境議題的訪問對象）

**限制**：

- 學習曲線高，多數人第一次用會困惑「沒有聯絡人列表怎麼維護」
- 生態小，對方不裝就無法用
- 自架 server 是進階選項，多數人會用官方 server，雖然 SimpleX 的設計讓 server 即使被入侵也看不到誰跟誰，但一致性與 metadata 抗監控能力會跟自架有差距
- 多裝置同步要自己處理裝置間的金鑰搬遷

## Session

[Session](https://getsession.org/){target="_blank"} 是從 Signal fork 出來的版本，把手機號碼換成隨機 ID，訊息流量走類 Tor 的網路（Lokinet）降低 metadata。跨裝置同步靠一段 24 字 mnemonic，這也是你的「帳號備份」。

身分模型上，每個 Session ID 是 66 個十六進位字元（裝置產生的公鑰），沒有任何電話或 email 綁定。對方想找你只能拿到這個 ID。理論上連 server 都不知道誰跟誰在通訊。

**適合誰**：

- 拒絕電話號碼綁定、又不想花時間學 SimpleX 的使用者
- 可接受訊息延遲較高（去中心化網路的代價）的長期通道
- 一次性協作（mnemonic 寫下來收好，之後在哪台裝置都可恢復）

**限制**：

- 群組功能比 Signal、SimpleX 都弱，大群組支援限制較多
- Lokinet 路由的設計過去曾因不同於 Tor 的選擇被質疑，社群審計仍在持續
- 訊息送達延遲明顯比 Signal 高（因為走多跳 onion routing）
- 早期版本沒有完整前向保密，新版本仍在轉換中（決定使用前可看 [端對端加密如何運作](../advanced/e2ee.md) 的協議對照）

## Briar

[Briar](https://briarproject.org/){target="_blank"} 是另一條路：完全去中心化、不需要 server。訊息走 Tor、Bluetooth、Wi-Fi Direct 三種傳輸層，網路被切斷時可以用 Bluetooth 或 Wi-Fi mesh 直接點對點通訊。

身分綁在裝置上的金鑰對，沒有帳號可以登入別的裝置。每支手機是一個獨立 Briar，要備份只能整個 .kdbx 風格的金鑰檔輸出。

**適合誰**：

- **行動現場**：警察封網、地區網路被切時，Bluetooth + Wi-Fi mesh 仍可以在實體距離內通訊
- **無 server 風險場景**：沒有 server 就沒有 server 被搜索的問題
- 高敏感的小群組、知道對方裝置就在身邊

**限制**：

- 一台裝置就是一個帳號，手機掉了帳號就沒了，不能跨裝置
- UX 偏粗糙，年代較早、設計目標不是大眾化
- 訊息要對方上線才送達（沒有中繼 server 暫存），離線太久會收不到
- 不適合日常通訊，更像「行動現場備援」

跟 Briar 同類的工具還有 Bridgefy，但 2020 年 Bridgefy 被研究團隊指出加密設計缺陷[^1]，社群推薦從 Bridgefy 遷移到 Briar 或其他驗證過的方案。

## Matrix / Element

[Matrix](https://matrix.org/){target="_blank"} 是聯邦化的開源即時通訊協議，最常用的客戶端是 [Element](https://element.io/){target="_blank"}（也叫 Element X 在新版）。設計上類似 email：每個人有一個 homeserver，homeserver 之間互通。

anoni.net 自己跑一個 Matrix homeserver（`im.anoni.net`），是社群長期協作的主要管道。社群的 Public Space 在 `#community:im.anoni.net`，公開房間可以加入。

E2EE 是房間級別的開關，不是預設全部啟用。建立私人房間時可以勾選 E2EE，公開房間通常不開（因為要讓新成員看得到歷史）。協議目前用 Megolm（類 Sender Keys 的設計），未來轉向 MLS。

**適合誰**：

- 社群長期協作（多人、多房間、需要保留歷史）
- 跨組織討論（不同 homeserver 的人可以在同一個房間）
- 社群想自架 server 的場景（聯邦化讓你不被單一服務商綁死）
- 整合既有 IRC、bridge 到其他平台（Discord、Slack、Telegram）

**限制**：

- E2EE 是房間級需手動開，公開房間預設不加密
- Metadata 在 homeserver 端可見：homeserver 知道誰加入哪個房間、訊息時間、訊息大小
- Device verification 流程比 Signal 複雜，新裝置加入時的 cross-signing 操作對新手不友善
- 群組規模成長到上千人時，舊版 Megolm 的同步壓力會明顯，MLS 過渡完成前是過渡期

加入 anoni.net 的 Matrix（含註冊方式）見 [社群自架服務](../community/tools.md)。

## 不在主名單的工具

### LINE

[LINE](https://line.me/){target="_blank"} 是台灣社交網絡的基礎建設，但 E2EE 設計受限。

- **Letter Sealing**（2015 年推出）：覆蓋一對一對話與部分群組訊息，但須雙方都啟用且使用最新版本才生效。
- **群組與其他內容**：直播、貼圖、相簿、Keep、官方帳號訊息都不在 E2EE 範圍。
- **Server 端可解**：在司法協助請求下，LINE server 端可以提供未加密的訊息內容。
- **Metadata**：通訊圖譜全在 LINE server 端，是廣告與精準行銷的基礎。

LINE 不是「加密通訊工具」，是「有部分加密的社交平台」。在台灣切不掉的處境下，分流是務實做法（後面在台灣補充段會展開）。

### Telegram

[Telegram](https://telegram.org/){target="_blank"} 預設不是 E2EE。

- **Secret Chat**：唯一走 E2EE 的模式，需要手動開啟，限一對一，不能跨裝置同步。
- **一般對話、群組、頻道**：走 client-server 加密，Telegram server 看得到所有內容。
- **常見誤解**：「Telegram 是加密通訊工具」是錯的，它是預設不加密、可選 Secret Chat 的工具。
- **2026 年最新狀況**：Telegram 受多國司法壓力後加強對特定情境的合規回應，但對一般使用者的隱私模型沒有結構性改變。

### WhatsApp

[WhatsApp](https://www.whatsapp.com/){target="_blank"} 用 Signal Protocol 做訊息加密（強），但 metadata 在 Meta 集團（Facebook、Instagram、Threads、Messenger）。

- **訊息內容**：E2EE，server 看不到對話內容
- **Metadata**：跟 Meta 帳號圖譜共享：誰跟誰、什麼時候、多頻繁、地點、裝置、商業互動
- **隱私風險不在「對話內容會洩漏」**：在「跟誰、什麼時候、多頻繁」的圖譜分析能力，這層 Meta 集團掌握得很完整
- **企業帳號與廣告整合**：WhatsApp Business API 與 Meta 廣告系統的整合會持續擴張，這對隱私敏感使用者是長期警示

## 在台灣的補充

幾個跟台灣使用情境特別相關的補充：

**LINE 是生活基礎建設，先承認再分流**：跟家人、學校、公部門、許多服務提供者都切不掉。務實的做法是分流：

- 重要的、敏感的、長期會留下紀錄的對話（醫療、法律、金融、敏感議題）切到 Signal 或 Matrix
- 一般生活、訂購、學校群組、公司一般工作留在 LINE
- 知道哪些對話該切、哪些不必切，比硬要全切更可行

**簡訊 SMS 仍是常見驗證但不安全**：銀行、政府服務（自然人憑證、健保署）、許多服務的 OTP 仍走簡訊，但 SIM swap 在台近年常見。能改 TOTP 的服務一律改 TOTP，做法見 [密碼管理器入門](./password-manager.md) 的對應段落。

**Telegram 在反送中後曾累積特定使用者**：因為當時香港社運使用，部分台灣使用者誤以為它是「保密工具」。實際上 Telegram 預設不是 E2EE，把它當「平台分流」可以，但不要當「加密通訊」。

**社群討論在 Matrix**：anoni.net 的 Matrix homeserver `im.anoni.net` 有 Public Space `#community:im.anoni.net`，帳號申請與加入方式見 [社群自架服務](../community/tools.md)。

**協議層的台灣脈絡**：Signal、Matrix 為什麼是社群兩條主要路徑，協議層的細節見 [端對端加密如何運作](../advanced/e2ee.md) 的「在地脈絡」一節。

## 常見問題

??? question "我所有人都在 LINE，怎麼開始用 Signal"

    分流而不是替換。先把 3-5 個最敏感的對話對象（家人、長期合作的記者、律師、特定議題的同事）邀到 Signal，其他人繼續留在 LINE。Signal 的 username 功能讓你不需要先公開手機號碼也能交換聯絡。期待「全部人換掉」是不切實際的目標，期待「對的對話用對的工具」才實際。

??? question "群組裡有不熟的人，metadata 還是會洩漏嗎"

    會。E2EE 保護的是訊息內容，群組成員列表本身仍是 metadata。多人群組一旦有對手在裡面，他能看到所有訊息、知道誰在群組、知道你的裝置是哪一支、知道你發訊的時間。敏感對話的群組要嚴格限制成員，必要時拆成只有信任成員的子群組。Signal 的「群組管理員核可加入」與 Matrix 的「邀請才能加入」設定都要善用。

??? question "Signal 換手機怎麼搬"

    舊手機開啟「轉移帳號到新手機」流程，新手機掃 QR code，訊息歷史會直接從舊裝置同步過去。如果舊手機已經壞了或被搶，沒有先設加密訊息備份的話訊息歷史就回不來，但新裝置仍可以用同一個號碼登入。建議事前打開「設定 → 聊天 → 備份」設定一段強 passphrase，避免換手機時整段歷史消失。

??? question "Briar 在沒網路時真的能用？"

    在實體距離內可以。Briar 支援 Bluetooth（10 公尺內）與 Wi-Fi Direct（同個房間到 30 公尺內）的點對點通訊，雙方直接交換訊息不需要任何 server 或 ISP。長距離不行，要等任一方接上 Tor 後訊息才會跨距離投遞。實際情境：一場活動現場斷網時，能用 Briar 跟同場的人聯絡，但要聯絡場外的人就回不去了。

??? question "Matrix 自架值得嗎"

    視規模與技術人力。20 人以下的小社群、沒專人維運，用 anoni.net 或其他公開 homeserver 比較划算。50 人以上、有長期維護人力、想完全控制 metadata 的組織值得自架。自架要處理的不只是 server 本身，還有 storage、聯邦的網路設定、E2EE 金鑰備份、device verification 教學、突發 spam 與 abuse 處理。社群可參考 [社群自架服務](../community/tools.md) 看 anoni.net 的部署選擇。

??? question "P2P 訊息工具（Briar、SimpleX）會被防火牆擋嗎"

    Briar 預設走 Tor，跟 Tor Browser 一樣會遇到 Tor 網路被封鎖的場景。在被封鎖的網路下需要橋接（[Tor Snowflake](./tor-snowflake.md)）。Bluetooth 與 Wi-Fi Direct 不受 ISP 層級封鎖影響，但有實體距離限制。SimpleX 的官方 server 是普通 HTTPS 端點，多數防火牆放行，但若遇到 DPI 等級的封鎖（如部分國家），可能要走 Tor 或自架 server。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-chat-question: 威脅模型怎麼想](../basics/threat-model.md)
- [:material-shield-search: Metadata 是什麼](../basics/metadata.md)
- [:material-key-chain-variant: 端對端加密如何運作](../advanced/e2ee.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-shield-lock-outline: 個人隱私指引研究專題](../community/privacy-guide.md)
- [:material-server-network-outline: 社群自架服務](../community/tools.md)
- [:material-translate-variant: 中文化與文件翻譯](../community/i18n.md)

</div>

[^1]: [Bridgefy, the messenger promising secure, private chat for activists, was a bug-ridden mess](https://blog.cryptographyengineering.com/2020/08/24/anatomy-of-a-bad-idea-bridgefys-broken-encryption/){target="_blank"} - Cryptography Engineering blog
