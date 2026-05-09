---
title: 貢獻者百科
description: 寫作風格、命名規則、PR 流程、Issue 模板與常見問題的整合指引。
icon: material/book-open-variant
---

# :material-book-open-variant: 貢獻者百科

社群協作久了會累積許多不成文規定：標題該怎麼下、檔名怎麼命名、PR 描述要寫什麼、Issue 怎麼分類、新貢獻者第一週會碰到的疑問。這份貢獻者百科把這些散落在 README、Issue 留言、Matrix 對話裡的內容整合成一頁，方便新成員一次看完，也讓資深成員有共同對話的依據。

如果你是第一次參與，建議先看 [如何參與與認領主題](./how-to-contribute.md) 決定方向，再回來這頁查具體做法。完整的工具入口與帳號申請見 [社群自架服務](./tools.md)。

## 第一週的入門路徑

依「我想做什麼」分流：

- **想試水溫，先看看內容**：先讀 [基礎概念](../basics/index.md) 任一篇，再用 [自我技能評估表](./skill-level.md) 評估自己對 Tor、Tails、OONI 的熟悉度
- **想開始寫作或翻譯**：申請 Matrix 帳號（見 [社群自架服務](./tools.md)）→ 加入 Public Space → 表達意願 → 認領一個 Issue
- **想參與技術維運**：申請 GitHub 對 [anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"} 的協作權限 → 看 [專案研究預先準備](./setup-repo.md) 建好開發環境
- **想加入活動籌備**：到 Matrix 對應 room 詢問近期活動（COSCUP、工作坊、小聚），協助文宣、現場、報名等任務

每條路徑的第一步都是「進到 Matrix 表達意願」。社群運作偏向 async，留訊息後等一兩天回覆是正常節奏。

## 寫作風格規範

### 禁用句型與標點

- 不使用 `——`（雙破折號）作為句中插入語。需要補充說明時，改用冒號、逗號，或拆成兩句
- 不使用「不是...而是...」句型。改用正向直述
- 避免用「；」斷句，優先用「。」或拆句
- 並列詞語或短語請用「、」，不要用全形「／」當列舉符號（半形 `/` 用在路徑、URL、技術慣用寫法）

### 並列引號的標點

連續的「」引號之間要加「、」。錯誤與正確對照：

- :material-close: `「決策者」「被諮詢者」「需被告知者」`
- :material-check: `「決策者」、「被諮詢者」、「需被告知者」`

### 段落語氣

- 像一位了解主題的社群成員在解釋，而非教科書或百科條目
- 不在每段末尾加總結句，讓段落自然收尾
- 避免「值得注意的是」、「總的來說」、「綜上所述」、「談的是」、「指的是」、「涵蓋的是」這類開頭

### 標點集合

正文主要使用：「、」、「，」、「。」、「：」、「「」」、「（）」。技術術語（Tor、OONI、IP、USB 等）保持英文原文，不加引號。

## 檔案命名與目錄

### 檔名

- 全部小寫，使用連字號分隔（`tor-browser-advanced.md`、`anonymity-vs-privacy.md`）
- slug 以英文為主，避免中文檔名
- 縮寫保持小寫（`vasp-2026.md` 而非 `VASP-2026.md`）

### 目錄結構

文件站的目錄結構維持扁平，不再加深層子目錄。新文章放進現有的 7 大分類：

| 分類 | 內容性質 |
|---|---|
| `basics/` | 概念層，匿名與隱私的核心思考工具 |
| `tools/` | 工具層，具體的工具介紹與比較 |
| `scenarios/` | 場景層，特定角色或情境的應用 |
| `advanced/` | 進階層，技術深度的延伸閱讀 |
| `taiwan/` | 在地脈絡，台灣的法規、觀測、研究 |
| `reports/` | 嚴選報告，外部研究的中譯 |
| `community/` | 社群文件，治理、流程、入口頁 |

如果你的新文章不確定該放哪一類，先在 Matrix 上問一聲，避免直接 PR 後又要搬。

## 圖片與資源

- 圖片放在 `docs/zh-TW/assets/images/`
- 在 markdown 引用：對於 `basics/`、`tools/` 等深度 1 的目錄，用 `../../assets/images/檔名`
- 對於 `reports/interseclab-network-coup/` 等深度 2 的目錄，用 `../../assets/images/檔名`（剛好一樣）
- 截圖優先使用 webp 或最佳化過的 png，不直接放手機原始大檔
- 圖片如果有 lightbox（點擊放大），HTML 用 `<figure>` + `<a href>` 包 `<img>`，兩個的相對路徑都要對齊

## 跨檔連結規則

內部連結用相對路徑，不要寫成 `/docs/zh-TW/...` 絕對路徑：

- 同一目錄：`./other-file.md` 或直接 `other-file.md`
- 跨目錄：`../basics/anonymity-vs-privacy.md`
- 跨深度：`../../blog/posts/2025to2026.md`

文章末尾建議放「接下來」、「相關閱讀」之類的小節，連結到 2–4 篇相關文章。基礎、工具、場景、進階之間的橫向連結比單向引用更有用。

## PR 流程

### Branch 命名

- `docs/<short-slug>` 處理文件變動（例：`docs/vasp-2026-rewrite`）
- `feat/<short-slug>` 處理新功能或新分類（例：`feat/payments-stubs`）
- `fix/<short-slug>` 處理 bug 修正

### Commit 訊息格式

採用 conventional commits：

```
<type>(<scope>): <subject>

<body>
```

常用 type：`docs`、`feat`、`fix`、`chore`、`refactor`。scope 用語系或子專案名稱（`zh-TW`、`zh-CN`、`en`、`pulse`、`asn_coverage`）。

### PR 描述

PR 描述至少包含：

- 改動的「為什麼」（連結 Issue 或社群討論）
- 改動的範圍（哪些檔案、哪幾個段落）
- 對讀者的影響（連結是否會壞、URL 是否變更、有沒有相依的檔案要一起改）

### Review

- 翻譯、文字校對：請求至少一位非作者 review
- 結構性變動（搬檔、改 nav）：先在 Matrix 提案討論，再開 PR
- 圖片、資源：自我檢查 alt 文字、檔名、版權標示

## Issue 分類

Issue 標籤體系（持續調整中）：

- `type:docs` 文件相關
- `type:bug` 行為錯誤
- `type:enhancement` 改進建議
- `type:question` 問題討論
- `area:zh-TW` / `area:zh-CN` / `area:en` 語系區分
- `area:tools` / `area:scenarios` 等對應分類
- `good first issue` 給新貢獻者的入門 Issue
- `help wanted` 需要更多協助的 Issue

開 Issue 前可以先在 GitHub 搜尋既有 Issue，避免重複。

## 翻譯流程

zh-TW 是 single source of truth，zh-CN 與 en 從 zh-TW 同步。詳細流程見 [中文化與文件翻譯](./i18n.md)：

- 新文章預設先寫 zh-TW
- zh-CN 用工具輔助初翻 + 人工調整詞彙差異（用語、慣用詞）
- en 需要更多人工，因為文化脈絡轉換比語系翻譯費時
- zh-CN 與 en 的翻譯不必同步上線，依社群人力滾動處理

## 提問前先看哪裡

新貢獻者最常問的問題與對應出處：

| 問題 | 看這裡 |
|---|---|
| 怎麼選一個主題開始？ | [如何參與與認領主題](./how-to-contribute.md) |
| 怎麼申請 Matrix 帳號？ | [社群自架服務](./tools.md) |
| 我的程度適合做什麼？ | [自我技能評估表](./skill-level.md) |
| 怎麼設好開發環境？ | [專案研究預先準備](./setup-repo.md) |
| 翻譯有什麼規範？ | [中文化與文件翻譯](./i18n.md) |
| 緊急情況的對外資源？ | [緊急求救](../help/index.md) |

如果上述都沒答案，到 Matrix 詢問。詢問前盡量提供：你想做什麼、你已經試過什麼、你卡在哪。

## 行為準則摘要

社群以開放、互助、合法為原則。完整的治理章程見 [治理章程](./governance.md)（撰寫中）。重點：

- **互相尊重**：不同背景、不同熟悉度的成員一視同仁
- **討論議題不攻擊個人**：對事不對人
- **合法前提**：所有討論與協作以合法用途為前提，不協助洗錢、規避稅務、騷擾、跟蹤、未授權入侵等行為
- **資訊揭露**：涉及個人資料、機敏資訊的處理走 [上傳機敏資訊流程](./upload-sensitive.md)
- **爭議處理**：先在 Matrix 討論，沒有共識可提案到下一次社群同步討論

違反原則的行為會由核心成員依治理章程處理。

## 這份百科是活文件

新貢獻者遇到不在這頁的問題、發現某個流程其實沒寫清楚，歡迎提案改這頁。改 contributor-handbook 本身就是一個 good first issue 的好題目。
