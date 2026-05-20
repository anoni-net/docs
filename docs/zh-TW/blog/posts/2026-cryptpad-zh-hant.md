---
date: 2026-05-25
authors:
    - toomore
categories:
    - 社群
    - 公告
slug: 2026-cryptpad-zh-hant
image: "assets/images/post-update.png"
summary: "CryptPad 是少數讓伺服器看不到內容的線上協作工具，介面過去缺少正體中文。anoni.net 社群花兩年半在 CryptPad 上游做翻譯，2026/05 隨 CryptPad 2026.5.0 收進內建語系。現在打開 cryptpad.anoni.net，從 Drive 到分享權限對話框介面都是正體中文，台灣、香港、澳門的使用者可以直接上手。"
description: "CryptPad 是少數讓伺服器看不到內容的線上協作工具，介面過去缺少正體中文。anoni.net 社群花兩年半在 CryptPad 上游做翻譯，2026/05 隨 CryptPad 2026.5.0 收進內建語系。現在打開 cryptpad.anoni.net，從 Drive 到分享權限對話框介面都是正體中文，台灣、香港、澳門的使用者可以直接上手。"
---

# CryptPad 2026.5.0 上線：正體中文（zh_Hant）正式收進內建語系

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/cryptpad-drive-zh-hant.png" target="_blank">
        <img src="https://assets.anoni.net/docs/cryptpad-drive-zh-hant.png"
            alt="CryptPad Drive 首頁切換為正體中文後的介面，左側為檔案分類、頂端 +新增 按鈕可看到 Rich Text、文件、試算表、簡報、看板、白板、繪圖、表單、行事曆等 app"
            title="cryptpad.anoni.net 切換成「中文(正體)」後的 Drive 首頁"
            class="brand-frame">
    </a>
    <figcaption>cryptpad.anoni.net 切換成「中文(正體)」後的 Drive 首頁，所有檔案分類與 app 入口都已在地化</figcaption>
</figure>

在台灣，以及更廣的正體中文使用環境，想找一套真正不會被第三方平台默默收走內容的協作工具，其實沒有想像中容易。Google Docs、Notion、Microsoft 365 都很好用，但每一段文字、每一個改動，都會以可被服務商讀取的形式存放在他們的伺服器上。在這之上，演算法、廣告、訓練語料、政府調閱請求，各有各的取用方式。

這層差異對記者寫不能曝光的稿、社運工作者協商不能被監聽的策略、NGO 整理脆弱使用者的求助紀錄、學者研究敏感議題這些情境，往往決定一份草稿能不能安全寫得出來。

[CryptPad](https://cryptpad.org/){target="_blank"} 是少數真的讓伺服器看不到內容的線上協作工具。內容在你瀏覽器端就完成加密，伺服器收到的是密文，但功能完整到一個介面就能取代 Google Docs、Sheets、Slides、看板、白板、表單與行事曆。

這套工具過去有一個明顯的門檻，介面只有英文與簡體中文，正體中文是缺的。從 2023 年底在 CryptPad 上游開的第一個 PR 起算，到 2026 年 5 月 13 日 [CryptPad 2026.5.0「🌷 Spring release」](https://github.com/cryptpad/cryptpad/releases/tag/2026.5.0){target="_blank"} 正式把正體中文（zh_Hant）收進內建語系，前後花了兩年半。社群自架的 [cryptpad.anoni.net](https://cryptpad.anoni.net/){target="_blank"} 升級完成。**現在打開 cryptpad.anoni.net，從 Drive 介面、文件編輯器到分享權限對話框，看到的都是正體中文。台灣、香港、澳門的使用者可以直接上手，不必先去學英文選單。**

<!-- more -->

## CryptPad 是什麼

CryptPad 由法國 [XWiki SAS](https://xwiki.com/){target="_blank"} 開發，使用 [AGPLv3](https://github.com/cryptpad/cryptpad/blob/main/LICENSE){target="_blank"} 授權，定位是**端對端加密（E2EE）的線上協作辦公套件**。一個帳號可以使用以下應用：

- **Rich Text 文件**：類似 Google Docs 的所見即所得編輯器
- **Document**：整合 OnlyOffice 的進階文件處理（.docx 相容）
- **Sheets**：試算表，整合 OnlyOffice（.xlsx 相容）
- **Presentation**：簡報，含 Markdown Slides 與 OnlyOffice 兩種模式
- **Kanban**：看板，做專案管理用
- **Whiteboard**：白板
- **Diagram**：繪圖，整合 [Drawio](https://www.drawio.com/){target="_blank"}（2026.5.0 升級到 Drawio 29.6.7）
- **Forms**：表單，可做問卷與資料收集
- **Calendar**：行事曆
- **Code/Markdown**：程式碼與 Markdown 編輯器
- **Drive**：雲端硬碟，整合上述所有檔案類型

關鍵在於**所有內容都在你瀏覽器端就完成加密**，伺服器收到的是密文，CryptPad 的營運者、anoni.net 的維護者，都沒有解開內容的鑰匙。這套架構稱為 zero-knowledge（零知識），意思是「即便我們想看，也看不到」。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/cryptpad-richtext-collab.png" target="_blank">
        <img src="https://assets.anoni.net/docs/cryptpad-richtext-collab.png"
            alt="CryptPad Rich Text 編輯器多人協作畫面，右上角顯示協作者頭像與即時 cursor，右側為格式化工具列"
            title="Rich Text app 的多人即時協作介面"
            class="brand-frame">
    </a>
    <figcaption>Rich Text app 的多人即時協作介面。所有編輯內容在瀏覽器端就完成加密，伺服器只看得到密文</figcaption>
</figure>

## 為什麼社群選擇 CryptPad 做為自架的協作平台

社群自架的服務不只 CryptPad，也有 [Etherpad](https://pad.anoni.net/){target="_blank"} 做即時共筆、Matrix 做即時討論（三者分工見 [社群自架服務](../../community/tools.md)）。CryptPad 在我們的選擇順位裡，承擔的是「需要長期保存、需要加密、需要多人協作完整文件」的場景。願意花兩年半把介面翻成正體中文，理由有幾個。

**E2EE 與 zero-knowledge 架構**：社群討論的內容很常涉及威脅模型、揭弊者保護、Tor Relay 校園推動的協商紀錄，這些東西放在 Google Docs 或 Notion 上，等於把所有未公開的策略攤在第三方平台與其廣告合作對象面前。CryptPad 從架構上把「營運者能看到內容」這件事拿掉，技術保證遠強於 SLA 承諾。

**功能完整、可取代主流雲端套件**：Etherpad 適合臨時共筆，但沒辦法做表格、簡報、看板。CryptPad 一個介面涵蓋 Google Workspace 大部分常用情境，而且每個文件都繼承同一套加密與權限模型，不必為了「這份要保密、那份不用」在多套工具間切換。

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/cryptpad-share-permission.png" target="_blank">
        <img src="https://assets.anoni.net/docs/cryptpad-share-permission.png"
            alt="CryptPad 分享對話框，可選僅檢視、可編輯、嵌入三種權限模式，並可加密碼、設定過期時間"
            title="CryptPad 每份 pad 的分享權限對話框"
            class="brand-frame">
    </a>
    <figcaption>每份 pad 都繼承同一套加密與權限模型，分享時可選僅檢視、可編輯或嵌入，並可加密碼與過期時間</figcaption>
</figure>

**開源、可自架、可審視**：AGPLv3 授權保證任何衍生服務都必須開源，我們自架時也能完整檢查程式碼。加密協議與資料結構公開可審視，跟 Tor、Tails、OONI 一樣，是可被驗證的隱私。

**由維護者與社群決定如何治理**：自架的好處跟 [自架 Matrix](2026-discord-matrix-statement.md) 的理由一致，紀錄保存策略、註冊政策、頻道規則由我們決定，可預期、可問責、可隨社群需求調整。

**有歐洲公部門與民間組織的真實部署經驗**：CryptPad 在歐洲多個公部門專案、NGO 與研究單位內被採用，合規、可靠性、長期維護三方面都有實際使用紀錄，把它推給更多正體中文使用者時不必擔心是 demo 漂亮的玩具。

## 正體中文（zh_Hant）翻譯：兩年半的時間線

CryptPad 主應用、Accounts plugin 與 User Guide 加起來上千條字串，每一條都要對齊它在介面上會出現的情境、顧及上下文、避免在「儲存」、「另存新檔」這類詞之間混用。CryptPad 還在持續開發，新功能會帶來新字串，每個版本上線前都得回頭再校一輪。

**2023/12/05**：在 CryptPad 開 [PR #1329](https://github.com/cryptpad/cryptpad/pull/1329){target="_blank"}，修正當時介面語言選單的用詞，把 `zh-Hans` 標籤改為「中文(簡體)」、`zh-Hant` 改為「中文(正體)」。當時 CryptPad 還只有 `zh_Hans` 的翻譯內容，`zh_Hant` 是空的，所以 PR 內也順便詢問 CryptPad 團隊「想新增 zh-Hant 語言要走哪個流程」。

**2024–2025**：CryptPad 團隊在 [Weblate](https://weblate.cryptpad.org/){target="_blank"} 上為 zh_Hant 開了多個子專案的翻譯空間，包含 CryptPad 主應用（[App](https://weblate.cryptpad.org/projects/cryptpad/app/zh_Hant/){target="_blank"}）、[Accounts plugin](https://weblate.cryptpad.org/projects/cryptpad/accounts-plugin/zh_Hant/){target="_blank"}，以及 User Guide 的 Drive、FAQ、Application Document、Application General、Application Presentation、Share and Access、Collaboration 等子段。

**2026/03/13**：所有上述項目的 zh_Hant 字串翻譯完成，社群在 CryptPad 倉庫開 [Issue #2237](https://github.com/cryptpad/cryptpad/issues/2237){target="_blank"} 回報進度，請 CryptPad 團隊評估在下一個 release 啟用 `zh_Hant` 為內建可選語系。

**2026/05/13**：CryptPad [2026.5.0「🌷 Spring release」](https://github.com/cryptpad/cryptpad/releases/tag/2026.5.0){target="_blank"} 發布，release notes 在 Improvements 段落明列：

> Enable zh-Hant/zh-Hans locales (#2237) and add alias system for locales [#2254](https://github.com/cryptpad/cryptpad/pull/2254){target="_blank"} by @toomore

這次合併除了把 `zh_Hant` 與 `zh_Hans` 打開為正式語系，也加上了 locale alias 機制，讓舊有以 `zh_CN`、`zh_TW` 為設定值的帳號可以自動 fallback 對應到新的 `zh_Hans`、`zh_Hant`，不會在升級後跑回英文。

## 關於「正體中文」與「繁體中文」的用字

CryptPad 介面選單最早寫的是「中文(繁體)」。我們在 PR #1329 提的修改是改成「中文(正體)」。改字面看起來是小事，背後是社群比較傾向「正體」這個用詞。「繁」字暗示「相對於簡體比較複雜」，但這套字系在台灣、香港、澳門的使用脈絡，本來就是延續漢字源流而來的正統寫法，沒有「繁」與「簡」的對比關係。OS 與多數軟體仍寫「繁體中文」，我們不要求所有人都改，但在自己貢獻的翻譯裡能改就改。用什麼字稱呼一個族群使用的字系，是普及工作的一部分。

## 怎麼開始用 cryptpad.anoni.net

上手方式：

- **入口**：[https://cryptpad.anoni.net/](https://cryptpad.anoni.net/){target="_blank"}
- **帳號申請**：寫信到 <whisper@anoni.net> 申請註冊碼。預設容量 50 MB，後續可調整。註冊時不要求信箱、不綁定實名，跟 Matrix 的申請流程一致。
- **切換語系**：升級後右上角設定頁可選「中文(正體)」。網址加 `?lang=zh_Hant` 也能切換。
- **完整工具清單**：見 [社群自架服務](../../community/tools.md)。

如果你發現翻譯有錯字、用詞不順、或是有新版字串還沒翻完，歡迎到 [Weblate 上的 zh_Hant 專案](https://weblate.cryptpad.org/projects/cryptpad/-/zh_Hant/){target="_blank"} 直接提交修改，或來信 <whisper@anoni.net> 告訴我們。

## 相關閱讀

- [從 Discord 年齡驗證談起：我們為什麼自架 Matrix](2026-discord-matrix-statement.md)
- [社群自架服務](../../community/tools.md)
- [中文化與文件翻譯](../../community/i18n.md)
