---
title: 什麼是 CryptPad
description: CryptPad 是少數讓伺服器看不到內容的線上協作辦公套件，所有文件在瀏覽器端就完成加密。一個介面涵蓋 Google Docs、Sheets、Slides、看板、白板、表單與行事曆。台灣社群自架 cryptpad.anoni.net，介面有完整正體中文（zh_Hant）。
icon: material/file-lock-outline
---

# :material-file-lock-outline: 什麼是 CryptPad？

寫一份不能曝光的文件，最直接的選擇是什麼？Google Docs 寫起來最順，但每一段文字、每一次修訂都以可被服務商讀取的形式存在他們的伺服器上。Notion、Microsoft 365 也是同樣的結構。對記者寫不能曝光的稿、社運工作者協商不能被監聽的策略、NGO 整理脆弱使用者的求助紀錄、學者研究敏感議題這些情境，工具的選擇決定了草稿能不能從頭到尾不被服務商讀取。

[CryptPad](https://cryptpad.org/){target="_blank"} 是少數真的讓伺服器看不到內容的線上協作辦公套件。由法國 [XWiki SAS](https://xwiki.com/){target="_blank"} 開發，採用 [AGPLv3](https://github.com/cryptpad/cryptpad/blob/main/LICENSE){target="_blank"} 授權。內容在你瀏覽器端就完成加密，伺服器收到的是密文，但功能完整到一個介面就能涵蓋大部分 Google Workspace 的常用情境。

社群自架的 [cryptpad.anoni.net](https://cryptpad.anoni.net/){target="_blank"} 自 CryptPad 2026.5.0（2026/05/13）起內建正體中文（zh_Hant），中港澳台與海外華語使用者打開介面即可上手，不必先學英文選單。詳細的翻譯歷程見 [CryptPad 2026.5.0 上線：正體中文（zh_Hant）正式收進內建語系](../blog/posts/2026-cryptpad-zh-hant.md)。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/cryptpad-drive-zh-hant.png" target="_blank">
        <img src="https://assets.anoni.net/docs/cryptpad-drive-zh-hant.png"
            alt="CryptPad Drive 首頁切換為正體中文後的介面，左側為檔案分類、頂端 +新增 按鈕可看到 Rich Text、文件、試算表、簡報、看板、白板、繪圖、表單、行事曆等 app"
            title="cryptpad.anoni.net 切換成「中文(正體)」後的 Drive 首頁"
            class="brand-frame">
    </a>
    <figcaption>cryptpad.anoni.net 切換成「中文(正體)」後的 Drive 首頁</figcaption>
</figure>

## Zero-knowledge 是什麼意思

CryptPad 採用 zero-knowledge（零知識）架構。具體地說：

- **加密發生在瀏覽器**：你輸入的文字、貼上的圖片、共編的每一個改動，在離開你的電腦前就先被加密。
- **伺服器只看到密文**：CryptPad 的營運者、anoni.net 的維護者、你連線經過的任何中間方，看到的都是無法解讀的密文流。
- **鑰匙在 URL 的 fragment**：解密 pad 所需的鑰匙寫在 URL 的 `#` 之後（fragment），這段不會送到伺服器。分享 pad 的連結就等於分享鑰匙，鑰匙是否外洩取決於你如何傳這條 URL。
- **多人共編也維持加密**：當其他人透過你的分享連結加入時，他們在瀏覽器端拿到同一把鑰匙，在自己的瀏覽器解密與重新加密所有改動。

**即便我們想看，也看不到。**

這層保證的代價是兩個現實限制。第一，**密碼或鑰匙遺失就無法復原內容**。CryptPad 不能幫你 reset。第二，**全文搜尋、內容索引、AI 摘要這類需要伺服器讀內容的功能不存在**。對於需要長期保密的工作來說，這通常是可以接受的取捨。

技術細節可參考 [CryptPad Whitepaper](https://blog.cryptpad.org/2023/02/02/CryptPad-Whitepaper/){target="_blank"} 與 [How CryptPad's encryption works](https://cryptpad.org/what-is-cryptpad/){target="_blank"}。

## 一個介面，多個 app

CryptPad 的 Drive 就是雲端硬碟入口，一個帳號可以開以下 app：

- **Rich Text 文件**：類似 Google Docs 的所見即所得編輯器，最常用。
- **Document**：整合 [OnlyOffice](https://www.onlyoffice.com/){target="_blank"} 的進階文件處理（.docx 相容）。
- **Sheets**：試算表，整合 OnlyOffice（.xlsx 相容）。
- **Presentation**：簡報，含 Markdown Slides 與 OnlyOffice 兩種模式。
- **Kanban**：看板，做專案管理用，類似 Trello。
- **Whiteboard**：白板，自由手繪、便利貼。
- **Diagram**：繪圖，整合 [Drawio](https://www.drawio.com/){target="_blank"}。
- **Forms**：表單，可做問卷與資料收集。
- **Calendar**：行事曆。
- **Code/Markdown**：程式碼與 Markdown 編輯器。

每個 app 的編輯都繼承同一套加密與權限模型。也就是說，沒有「這個 app 比較安全、那個 app 比較不安全」的差別，全部都是 zero-knowledge。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/cryptpad-richtext-collab.png" target="_blank">
        <img src="https://assets.anoni.net/docs/cryptpad-richtext-collab.png"
            alt="CryptPad Rich Text 編輯器多人協作畫面，右上角顯示協作者頭像與即時 cursor"
            title="Rich Text app 的多人即時協作介面"
            class="brand-frame">
    </a>
    <figcaption>Rich Text app 的多人即時協作，所有改動在瀏覽器端就完成加密</figcaption>
</figure>

## 分享與權限模型

每份 pad 都繼承同一套分享機制。打開 pad 後點右上角的「分享」會看到：

- **僅檢視**：對方可讀但不能編輯。
- **可編輯**：對方可即時共編。
- **嵌入**：產生可以放在其他網頁的 iframe 連結（僅檢視）。
- **加密碼**：在分享連結之外再加一層密碼，沒密碼者連連結都打不開。
- **設定過期時間**：到期後自動失效。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/cryptpad-share-permission.png" target="_blank">
        <img src="https://assets.anoni.net/docs/cryptpad-share-permission.png"
            alt="CryptPad 分享對話框，可選僅檢視、可編輯、嵌入三種權限模式，並可加密碼、設定過期時間"
            title="CryptPad 每份 pad 的分享權限對話框"
            class="brand-frame">
    </a>
    <figcaption>每份 pad 都繼承同一套加密與權限模型</figcaption>
</figure>

實務上的取捨：**分享連結就是鑰匙**。把連結貼進不安全的管道（明文 email、Discord、未驗證的訊息應用）等於同時把鑰匙交出去。敏感協作的標準做法是透過 Matrix 或其他 E2EE 訊息工具傳遞 pad 連結，並視情況開「加密碼 + 過期時間」的雙層保護。

## 在地化與多語系

CryptPad 自 2026.5.0 起內建以下中文介面：

- **中文(正體)**：對應 `zh_Hant` 語系碼，覆蓋台灣、香港、澳門使用脈絡。
- **中文(簡體)**：對應 `zh_Hans` 語系碼，覆蓋中國大陸、新馬等使用脈絡。

切換方式：登入後右上角設定頁可選語言，或於 URL 加 `?lang=zh_Hant`、`?lang=zh_Hans`。舊有以 `zh_CN`、`zh_TW` 為設定值的帳號會自動 fallback 到對應的新語系碼，不會在升級後跑回英文。

社群為 zh_Hant 投入兩年半的上游翻譯歷程，從第一個 PR 到內建語系的細節見 [CryptPad 2026.5.0 上線：正體中文（zh_Hant）正式收進內建語系](../blog/posts/2026-cryptpad-zh-hant.md)。要協助補新版本字串或修錯字，到 [Weblate 上的 zh_Hant 專案](https://weblate.cryptpad.org/projects/cryptpad/-/zh_Hant/){target="_blank"} 即可。

## CryptPad vs 其他協作工具

| 維度 | CryptPad | Google Docs | Notion | Etherpad |
|---|---|---|---|---|
| 內容對伺服器加密 | E2EE / zero-knowledge | 否 | 否 | 否 |
| 多人即時共編 | 是 | 是 | 是 | 是 |
| 試算表、簡報、表單 | 內建（OnlyOffice） | 內建 | 內建 | 無 |
| 註冊門檻 | 註冊碼制（cryptpad.anoni.net）、一般註冊（cryptpad.org） | Google 帳號 | 信箱 + 密碼 | 多為無帳號 |
| 自架成本 | AGPLv3，可完整自架 | 不可 | 不可 | 開源，可自架 |
| 適用情境 | 長期、敏感、加密協作 | 一般辦公 | 知識庫、專案管理 | 臨時共筆、活動現場 |

延伸閱讀：[端對端加密如何運作](../advanced/e2ee.md) 解釋 E2EE 的密碼學基礎。

## 什麼時候用 CryptPad，什麼時候不用

**適合**：

- 需要長期保存且不能讓平台讀取的協作文件（會議紀錄、調查筆記、揭弊者陳述、敏感策略草稿）
- 跨組織協作但又不想把資料統一託管在某一方雲端的場景
- 想要替代 Google Workspace 同時保留多種文件類型的小團隊或社群
- 一份文件同時要做表格、文字、看板，但又必須加密

**不適合**：

- 一次性公開協作（用 [Etherpad](https://pad.anoni.net/){target="_blank"} 就夠了，加密不是必要條件）
- 大規模即時聊天（用 [Matrix 或其他 IM](../community/tools.md)）
- 需要 AI 自動摘要、全文檢索整個資料庫的場景（Notion 系生態）
- 視訊會議（CryptPad 不做視訊）

## 如何開始使用

主要有三種選擇：

**1. 使用社群自架的 cryptpad.anoni.net**

- **入口**：[https://cryptpad.anoni.net/](https://cryptpad.anoni.net/){target="_blank"}
- **帳號申請**：寫信到 <whisper@anoni.net> 申請註冊碼。預設容量 50 MB，後續可調整。註冊時不要求信箱、不綁定實名，跟 Matrix 流程一致。
- **適合對象**：信任社群維運、希望帳號管理輕量、想優先支持在地 instance 的使用者。

**2. 使用上游 cryptpad.org**

- **入口**：[https://cryptpad.fr/](https://cryptpad.fr/){target="_blank"}（XWiki 官方 instance）。
- **帳號申請**：一般註冊（信箱即可）。
- **適合對象**：偏好直接連 XWiki 維運的官方服務、單純試用、不需要在地社群入口。

**3. 自架**

- AGPLv3 授權，原始碼公開在 [GitHub](https://github.com/cryptpad/cryptpad){target="_blank"}。
- 部署指引見 [CryptPad Admin Documentation](https://docs.cryptpad.org/en/admin_guide/index.html){target="_blank"}。
- 適合對象：組織內部協作、有專屬合規需求、想完全掌握資料保存政策。

## 常見問題

??? question "鑰匙丟了怎麼辦？"

    無法復原。CryptPad 的營運者也沒有你的鑰匙。這是 zero-knowledge 架構的代價。建議使用 [密碼管理器](./password-manager.md) 保存登入密碼與重要 pad 的分享連結。

??? question "分享連結被別人轉貼出去怎麼辦？"

    pad 的密文加密強度沒變，但只要有人拿到原始連結（含 `#` 後的鑰匙）就能解開。預防方式：建立 pad 時開「需要密碼」、設定過期時間、用 Matrix 等 E2EE 管道傳連結。若已確認連結外洩，建立新的 pad 把內容複製過去並廢棄舊連結。

??? question "在中國大陸能用嗎？"

    `cryptpad.anoni.net` 與 `cryptpad.org` 都沒有針對中國大陸的特別託管，在大陸網路環境下可能會連線不穩或被阻斷。建議搭配 [Tor Browser](https://www.torproject.org/zh-TW/download/){target="_blank"} 與 [Snowflake 橋接](./tor-snowflake.md)，或在 [Tails](./what-is-tails.md) 環境內使用。CryptPad 內容是 E2EE 的，無論你的連線管道是 Tor、VPN 或直連，服務器都看不到你的內容，差別只在於能不能連上。

??? question "CryptPad 跟 Etherpad 該選哪個？"

    看用途。**Etherpad 適合臨時、可丟棄、無加密的共筆**（活動現場記錄、提案 brainstorm），無須帳號、有連結就能進。**CryptPad 適合長期、敏感、加密協作**，需要帳號但內容對伺服器不可見。社群兩個都有自架，分工見 [社群自架服務](../community/tools.md)。

??? question "可以做 AI 摘要、自動翻譯嗎？"

    無法。Zero-knowledge 架構意味著伺服器看不到內容，所以伺服器端的 AI 服務（OpenAI、Claude 等）也讀不到你的 pad。如果要用 AI 處理 CryptPad 內容，你必須先在瀏覽器端把內容複製出來，自己決定要交給哪個 AI 服務（並承擔該服務的隱私風險）。

??? question "免費嗎？容量會不會被收費？"

    [cryptpad.anoni.net](https://cryptpad.anoni.net/){target="_blank"} 由社群維運，目前無收費規劃。預設配額 50 MB，要更多容量可來信討論。上游 [cryptpad.fr](https://cryptpad.fr/){target="_blank"} 有免費與付費 plan，依需求選擇。AGPLv3 授權的程式碼則永遠免費可自架。

??? question "怎麼把舊的 Google Docs 搬過來？"

    Drive 支援匯入 .docx、.xlsx、.pptx 等格式。從 Google Docs 匯出後直接上傳即可。注意 OnlyOffice 在格式相容性上比 Google Docs 嚴格，複雜表格或巢狀格式可能需要手動調整。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-chat-question: 端對端加密如何運作](../advanced/e2ee.md)
- [:material-chat-question: 威脅模型如何建立](../basics/threat-model.md)
- [:material-chat-question: 什麼是匿名網路](./what-is-anonymity-network.md)

</div>

## :fontawesome-solid-diagram-project: 下一步

<div class="grid cards" markdown>

- [:material-account-group: 社群自架服務](../community/tools.md)
- [:material-translate-variant: 中文化與文件翻譯](../community/i18n.md)
- [:material-file-document: CryptPad 2026.5.0 上線：正體中文（zh_Hant）正式收進內建語系](../blog/posts/2026-cryptpad-zh-hant.md)

</div>
