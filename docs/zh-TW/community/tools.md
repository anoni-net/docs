---
title: 社群自架服務
description: anoni.net 自架的 Matrix、Cryptpad、Etherpad、SearXNG、Send、Formbricks，以及搭配的外部 Jitsi，給社群討論、共筆、搜尋、傳檔、表單等協作場景使用。
icon: material/server-network-outline
---

# :material-server-network-outline: 社群自架服務

社群自架 Matrix、Cryptpad、Etherpad、SearXNG、Send、Formbricks 6 個服務，搭配外部 Jitsi 做線上會議。自架的目的是減少對第三方的依賴、保留資料主權，也為社群討論與敏感協作提供可信任的基礎建設。

關於我們為什麼自架 Matrix（與背後的隱私取捨），可參考 [從 Discord 年齡驗證談起：我們為什麼自架 Matrix](../blog/posts/2026-discord-matrix-statement.md)。

## 即時溝通與長期協作

### Matrix（即時討論）

- **用途**：日常討論、主題意願表達、各主題 room 討論與活動協調
- **家伺服器（homeserver）**：`im.anoni.net`
    - **網頁版（Element）**：[https://matrix.anoni.net/](https://matrix.anoni.net/){target="_blank"}
    - **應用程式（Element X）**：[下載應用程式](https://element.io/download)，安裝後請將家伺服器設定為 `im.anoni.net`。
    !!! note "補充說明"

        如果你本身已經有 `matrix.org` 的帳號，也可以繼續使用自己的帳號登入。Element 無論是網頁版或應用程式皆可跨邦聯運作，只要家伺服器設定正確即可。

- **帳號申請**：目前 `im.anoni.net` 的 Matrix 帳號需來信 <whisper@anoni.net> 申請，我們會回覆註冊方式與注意事項。
- **建議加入**：社群設有 **[Public Space](https://matrix.to/#/#community:im.anoni.net)**，可一次加入社群相關 room。
- **如何加入**：註冊後於 Element 開啟上述 Space 連結加入，或依需要加入個別 room。

### Cryptpad（加密共筆）

- **用途**：共筆、活動共編、機敏內容加密協作
- **入口**：社群 Cryptpad [首頁](https://cryptpad.anoni.net/)
- **帳號申請**：目前 Cryptpad 帳號亦需來信 <whisper@anoni.net> 申請，預設提供 50 MBs 的容量，未來可調整。
- **使用方式**：取得帳號後可開新 pad、分享連結、設定權限（僅檢視、可編輯），活動共筆連結通常會貼在 Matrix 公布。

### Etherpad（即時共筆）

- **用途**：活動現場共同記錄、低門檻臨時筆記。內容無加密，有連結即可訪問，不適合放敏感資訊。
- **入口**：[https://pad.anoni.net/](https://pad.anoni.net/){target="_blank"}
- **帳號申請**：無須帳號，建立 pad 後分享連結即可協作。
- **使用方式**：適合公開、可丟棄的內容。需要長期保存或加密協作時改用 Cryptpad。
- **臨時聊天場景**：當下遇到一個人但雙方都不想交換 app 帳號時，可開新 pad 把 URL 給對方，使用 pad 內建的 chat sidebar 當作一次性對話空間。聊完關閉分頁、清空 pad 內容即可。注意內容無加密，server 端理論上仍可看到。

## 個人隱私工具

### SearXNG（隱私搜尋）

- **用途**：聚合多個搜尋引擎，不留紀錄、無廣告、無第三方 cookie。
- **入口**：[https://search.anoni.net/](https://search.anoni.net/){target="_blank"}
- **帳號申請**：無須帳號。
- **使用方式**：可在瀏覽器設成預設搜尋引擎。URL 直接加 `?q=keyword` 也能搜尋。

### Send（端對端加密檔案分享）

- **用途**：暫時性的加密檔案傳遞，連結可設密碼、下載次數與過期時間。
- **入口**：[https://send.anoni.net/](https://send.anoni.net/){target="_blank"}
- **帳號申請**：無須帳號（依設定，登入帳號通常可獲得更大配額與更長保留時間）。
- **使用方式**：上傳檔案、選擇有效期、設定下載次數，視需要再加密碼，最後分享連結。逾期或達下載次數上限後即刪除。

## 社群運作工具

### Formbricks（隱私表單）

- **用途**：訂閱表單、活動報名、社群回饋收集。自架可避免被第三方表單服務追蹤，目前 newsletter 訂閱即透過此服務。
- **入口**：[https://form.anoni.net/](https://form.anoni.net/){target="_blank"}
- **帳號申請**：填表者直接打開連結填寫，無須帳號。維運者要建立新表單請來信 <whisper@anoni.net> 申請後台帳號。
- **使用方式**：建立後分享連結即可收集回應，後台可看回應彙整與匯出。

## 線上會議（外部）

### Jitsi（線上視訊）

- **用途**：線上會議（主題討論、定期 sync）
- **服務**：[https://jitsi.goodmeet.asia/](https://jitsi.goodmeet.asia/){target="_blank"}（免費使用，非自架）。
- **使用方式**：開啟連結、建立或輸入會議室名稱、分享連結（會在 Matrix Room 中公布）。

---

**延伸閱讀**：想了解我們為什麼自架 Matrix、以及如何兼顧隱私與社群品質，可參考 [從 Discord 年齡驗證談起：我們為什麼自架 Matrix](../blog/posts/2026-discord-matrix-statement.md)。
