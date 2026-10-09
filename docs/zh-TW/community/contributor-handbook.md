---
title: 貢獻者百科
description: 文件站的檔案命名、連結與文章格式、PR 流程、Issue 分類與翻譯流程，以及新貢獻者第一週會碰到的疑問。寫作風格規範在社群首頁。
icon: material/book-open-variant
---

# :material-book-open-variant: 貢獻者百科

社群協作久了會累積許多不成文規定：檔名如何命名、PR 描述要寫什麼、Issue 如何分類、新貢獻者第一週會碰到的疑問。貢獻者百科把散落在 README、Issue 留言、Matrix 對話裡的內容整合成一頁，方便新成員一次看完，也讓資深成員有共同對話的依據。

如果你是第一次參與，建議先看 [如何參與與認領主題](https://anoni.net/join/) 決定方向，再回來這頁查具體做法。完整的工具入口與帳號申請見 [社群自架服務](https://anoni.net/services/)。

## 第一週的入門路徑

依「我想做什麼」分流：

- **想試水溫，先看看內容**：先讀 [基礎概念](../basics/index.md) 任一篇，再用 [自我技能評估表](./skill-level.md) 評估自己對 Tor、Tails、OONI 的熟悉度
- **想開始寫作或翻譯**：申請 Matrix 帳號（見 [社群自架服務](https://anoni.net/services/)）→ 加入 Public Space → 表達意願 → 認領一個 Issue
- **想參與技術維運**：申請 GitHub 對 [anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"} 的協作權限 → 看 [專案研究預先準備](./setup-repo.md) 建好開發環境
- **想加入活動籌備**：到 Matrix 對應 room 詢問近期活動（COSCUP、工作坊、小聚），協助文宣、現場、報名等任務

每條路徑的第一步都是「進到 Matrix 表達意願」。社群運作偏向 async，留訊息後等一兩天回覆是正常節奏。

## 寫作風格規範

寫作風格是 anoni.net 三個網站共用的規範，全文在社群首頁的[寫作風格規範](https://anoni.net/join/writing-style/)，英文照它的[英文版](https://anoni.net/en/join/writing-style/)。這一節只寫文件站執行 linter 的方式。

### 執行 linter

CI 的 `docs-style-lint` 只在 `docs/zh-TW`、`docs/zh-CN`、`docs/en` 的 Markdown 變更時觸發。根目錄的 `README.md`、`CONTRIBUTING.md` 這類說明文件改完，需要自己執行一次：

```bash
python3 tools/docs_style_lint.py README.md CONTRIBUTING.md
```

`NOTICE` 沒有 `.md` 副檔名，linter 只收 `.md` 與 `.js`，那一份要人工看。

有一組規則明文豁免既有內容，目前只有寫作風格規範「標題句構」的 `title-colon`。CI 傳 `--changed-since <base>`，讓這組規則只在這個 PR 真的動過的行上報。本機想看整個檔案的全貌就不要帶那個旗標：

```bash
python3 tools/docs_style_lint.py --changed-since origin/main docs/en/tools/vpn-guide.md
```

沒有這個機制的話，改一行圖片引用就會帶出整篇舊標題的 annotation，跟作者的改動無關，而真正該修的那幾條會被淹在裡面。

規則文件本身逐條寫出被禁用的標點與句型，掃自己的規則描述必然全紅。社群首頁的寫作風格規範、這份百科與工作區的投影檔靠 linter 的 `RULE_DOCS` 依檔名豁免，`tools/README.md` 的規則表與已知邊界兩段用 `<!-- docs-style-lint: disable -->` 與 `enable` 包住。寫規則說明時照同一個做法，引用的例子要保持原樣。

## 檔案命名與目錄

### 檔名

- 全部小寫，使用連字號分隔（`tor-browser-advanced.md`、`anonymity-vs-privacy.md`）
- slug 以英文為主，避免中文檔名
- 縮寫保持小寫（`vasp-2026.md` 而非 `VASP-2026.md`）
- 數字直接接連字號（`roadmap-2026.md`、`updates-202506.md`）

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
| `community/` | 架設與營運的教學、讀懂觀測資料的方法、貢獻與翻譯規範 |

社群本身的頁面與公告不放在文件站。關於我們、參與方式、自架服務、活動與社群動態在 [anoni.net](https://anoni.net/)，原始碼是 [`anoni-net/www`](https://github.com/anoni-net/www)，活動公告、專案上線、工作進度這類社群公告發在該 repo 的 `updates/`。文件站的 `blog/` 放外部文章的翻譯、技術分析、觀測報告與文件站自己的更新回顧。

如果你的新文章不確定該放哪一類，先在 Matrix 上問一聲，避免直接 PR 後又要搬。

### 搬檔、改名、刪頁要補 redirect

移動、改名或刪除已上線的頁面時，在同一個 PR 補上 redirect，讓舊網址不會變成 404。舊網址會長期活在搜尋引擎、書籤與外部連結裡，少了 redirect 就流失既有讀者與累積的 SEO 權重。

- redirect 寫在三支 mkdocs 設定的 `plugins.redirects.redirect_maps`：`mkdocs.yml` 對應 zh-TW（`/docs/`）、`mkdocs_en.yml` 對應 en、`mkdocs_cn.yml` 對應 zh-cn。
- 格式是「舊路徑: 新路徑」，路徑相對各語系的 docs 目錄，不含 `docs/<lang>/` 前綴。例：`'tools/what-is-ooni.md': 'tools/index.md'`。
- 找不到一對一的新頁時，導向所屬分類的 index 頁（`community/index.md`、`tools/index.md` 等）。
- 既有 redirect 保留不刪，舊網址會一直有人點進來。唯一要回頭改的情況：某條的目標頁自己也被移掉，redirect 變成斷鏈。

### 拆頁或搬走段落要回頭檢查入口連結

redirect 管不到內容搬移。頁面留著、只有其中一段被拆到新頁時，舊網址仍然回 200，沒有任何工具會報錯，但指向舊頁的按鈕與連結承諾的東西已經在別處。

- 拆頁或把段落搬到別頁時，在同一個 PR 內搜尋站內指向來源頁的連結，把文案提到搬走內容的那幾條重新指向新頁。
- strict build 與 `docs-style-lint` 都抓不到這種錯。兩個目標檔都存在，錯的是連結語意而非能不能連，只有讀按鈕文案對照目的地才找得到。
- 已發布的 blog 文也算在內。按鈕是功能性入口，讀者點它是要找那份內容，重新指向不等於改寫文章當時的記述。

實例：2025-05 把工作坊頁拆成兩頁時，`event-workshop-2025.md` 留下活動資訊，招募與籌備內容搬到 `event-workshop-2025-prepare.md`。兩篇 2025-04 的貼文有「查看工作坊招募頁面說明」與「瞭解籌備事項」兩個按鈕仍指向活動頁，到 2026-08 才被發現。

## 圖片與資源

截圖與示意圖走不同的路徑。

截圖（操作畫面、網站畫面）放在 `docs/<lang>/assets/images/`：

- 在 markdown 引用：對於 `basics/`、`tools/` 等深度 1 的目錄，用 `../../assets/images/檔名`
- 對於 `reports/interseclab-network-coup/` 等深度 2 的目錄，用 `../../assets/images/檔名`（剛好一樣）
- 優先使用 webp 或最佳化過的 png，不直接放手機原始大檔
- 有 lightbox（點擊放大）時，HTML 用 `<figure>` + `<a href>` 包 `<img>`，兩個的相對路徑都要對齊
- 三個語系的 `assets/images/` 各自獨立，補了一個語系記得補另外兩個。漏掉的話建置不會報錯，站上就是一頁破圖，執行 `python3 tools/check_image_refs.py` 掃得出來

示意圖（流程圖、架構圖、對照矩陣、時間軸）的原始檔放 `docs/diagrams/`，發布到 assets.anoni.net，三個語系引用同一個網址。製作、命名與發布流程見[文件站的視覺規範](visual-guide.md)的「貢獻技術圖示」一節。

## 跨檔連結規則

內部連結用相對路徑，不要寫成 `/docs/zh-TW/...` 絕對路徑：

- 同一目錄：`./other-file.md` 或直接 `other-file.md`
- 跨目錄：`../basics/anonymity-vs-privacy.md`
- 跨深度：`../../blog/posts/2025to2026.md`

正文的連結用描述性的文字，不直接露出網址，也不拿網址當連結文字。例：`詳見[社群工具頁](https://anoni.net/services/)`。

外部連結加 `{target="_blank"}`，在新分頁開啟：`[Freedom on the Net](https://freedomhouse.org/explore-the-map){target="_blank"}`。

需要寫對外完整網址時（社群貼文、外部引用），網站預設語系 zh-TW 不帶語系區段：`docs/zh-TW/community/i18n.md` 對應 `https://anoni.net/docs/community/i18n/`。zh-CN 用小寫 `https://anoni.net/docs/zh-cn/...`，en 用 `https://anoni.net/docs/en/...`。資料夾路徑仍保留語系大小寫。

文章末尾建議放「接下來」、「相關閱讀」之類的小節，連結到 2–4 篇相關文章。基礎、工具、場景、進階之間的橫向連結比單向引用更有用。

## 文章格式

### front matter

每一頁開頭的 front matter 至少有三個欄位：

```yaml
---
title: 威脅模型
description: 一句完整的句子，說明這一頁在講什麼、對讀者有什麼用
icon: material/shield-account-outline
---
```

- `title` 不加問號，也不加站名。社群分享卡與頁面標題會自動帶上站名
- `description` 會用在搜尋結果的摘要與社群分享卡。寫成一句完整的句子，交代這一頁對讀者有什麼用，不要只重述標題
- `icon` 以 `material/` 為主，少數情境用 `fontawesome-solid-`、`fontawesome-brands-`
- front matter 之後緊接 H1，寫成 `# :material-icon-name: 標題`，圖示通常與 `icon` 欄位相同
- blog 文章另外要有 `date`、`slug`、`categories`、`authors`
- 社群分享卡要換標題、描述或底圖時，見[文件站的視覺規範](./visual-guide.md)的「社群分享卡」一節

### 註腳

引用研究與報導時用 Markdown 註腳，註腳放在文章末尾：

```markdown
中國的防火長城[^1]長期過濾大量國際網站。

[^1]: [原文標題](https://example.org/article){target="_blank"} - 媒體名稱
```

主要來源避免選付費牆的內容。只找得到付費牆版本時，另外附一個 archive.org 的存檔連結。

### 圖表

文件站支援 Vega-Lite 圖表（`mkdocs-charts-plugin`），用語言標記為 `vegalite` 的程式碼區塊撰寫，資料來源優先用 Pulse API（`https://api.anoni.net/api/...`）。可參考 `taiwan/tor-relay-watcher.md`。

### 結構化資料

整站的 `Organization` JSON-LD 寫在 `docs/overrides/main.html`，文章裡不要再手動加 `<script type="application/ld+json">`。

## PR 流程

### Branch 命名

- `blog/<short-slug>` 處理 blog 文章（例：`blog/throttle-drill-results`）
- `feat/<short-slug>` 處理新功能、新分類、寫作規範，以及既有文件的大幅改寫（例：`feat/title-colon-rule`）
- `fix/<short-slug>` 處理 bug、樣式與小幅修正（例：`fix/table-width`）

`docs/` 不能當前綴。`docs` 本身是建置觸發分支，git 不允許同一個名稱同時是 ref 與 ref 的目錄，`git switch -c docs/vasp-2026-rewrite` 會回報 `cannot lock ref`。

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

Issue 標籤沿用 GitHub 預設的那一組，另外加上 `l10n`。用 Issue 模板開單時，類型標籤會自動帶上：

| 標籤 | 用途 |
|---|---|
| `documentation` | 新增或修改文章內容 |
| `enhancement` | 改進建議、小工具提案、技術評估 |
| `bug` | 網站或工具的行為錯誤 |
| `l10n` | 翻譯與在地化 |
| `question` | 問題討論 |
| `good first issue` | 範圍明確，不必先熟悉整個 repo 就能接手 |
| `help wanted` | 需要更多人手 |
| `duplicate`、`invalid`、`wontfix` | 結案時註明原因 |

語系與分類不另設標籤，寫在 Issue 的標題或內文。第一次參與可以從 [good first issue 清單](https://github.com/anoni-net/docs/labels/good%20first%20issue){target="_blank"}挑一張，在 Issue 下留言認領，避免兩個人做同一件事。

開 Issue 前可以先在 GitHub 搜尋既有 Issue，避免重複。

## 翻譯流程

zh-TW 是 single source of truth，zh-CN 與 en 從 zh-TW 同步。詳細流程見 [中文化與文件翻譯](./i18n.md)：

- 新文章預設先寫 zh-TW
- zh-CN 用工具輔助初翻 + 人工調整詞彙差異（用語、慣用詞）
- en 需要更多人工，因為文化脈絡轉換比語系翻譯費時
- zh-CN 與 en 的翻譯不必同步上線，依社群人力滾動處理
- 把外部文章（Tor Project、OONI、EFF 等部落格）翻成 blog 的順序、格式與各語系的觀點段，見[中文化與文件翻譯](./i18n.md)的「翻譯外部文章到 blog」一節
- 校對時要抓「翻漏」，也就是 zh-TW 具名的國家、公司、機構、法條、數字在譯文被換成上位詞。判準與檢查方式見 [校對時要抓的是翻漏](./i18n.md#校對時要抓的是翻漏)

## AI 協作

這個專案不限制貢獻者用哪一家的 AI 服務協助寫作、翻譯或寫程式。為了讓不同的人、不同的工具產出一致的內容，規則只寫在這份百科，AI 設定檔都指回這裡。

### 入口檔

- repo 根目錄的 `AGENTS.md` 整理 repo 結構、開發指令與容易出錯的地方，多數 AI 工具會自動讀它。`pulse/` 另有一份
- `CLAUDE.md` 引入 `AGENTS.md`，另外說明 `.claude/` 底下的 subagent 與 skill
- 使用的工具不會自動讀這兩份時，開工前把 `AGENTS.md` 與這份百科的「寫作風格規範」一節提供給它

### AI 產出的檢查

AI 產出與人工撰寫走同一套流程：執行 `docs_style_lint.py`、照 PR 範本自我檢查、經過 review。「安全與隱私寫作」一節的界線同樣適用。AI 給的數字、引文與來源連結要實際點開核對，送出 PR 的人為內容負責。

### 角色

寫一篇文章時，可以把工作拆給幾個角色，各自只做一件事。使用 Claude Code 的貢獻者可以直接叫用 `.claude/agents/` 底下對應的 subagent，其他工具照下面的描述下指令即可。每個角色的讀者前提相同：記者、公民團體、開源科技社群，熟悉 Tor、OONI 與數位人權的專家也會讀。

動筆前的三個角色：

- **選題雷達**：掃指定期間（預設近兩週）匿名網路工具、數位身分與 eID、監控與審查立法、審查量測、支付隱私、吹哨與洩密平台、台灣與 APAC 數位人權的新事件，篩掉炒作、純產品發布與無關的題目。每則候選回報一句話的事件、日期、一手來源連結、跟社群的關聯、有沒有台灣或 APAC 的角度、時效，依值得寫的程度排序，最多六則。不寫文章，也不決定切角
- **切角顧問**：針對一個題目提出三到四個切角，說明每個切角從哪個面向切入、社群能補什麼觀點、有沒有台灣或 APAC 的在地連結，並排出建議順序。只給選項，不替作者決定，也不動筆
- **資料蒐集**：題目選定後，蒐集一手來源（官方公告、原始文件、權威報導）並附連結與發布日期，掃 `docs/zh-TW/blog/posts/` 列出該交叉連結的既有文章與相對路徑，標出之後寫進文章時要附出處的宣稱。站內已有很接近的文章時直接指出。不寫文章，也不決定切角

審稿的四個角色：

- **結構審查**：讀完全文，用一句話寫出核心主張與它想說服的對象，再檢查每段是否服務這條主線，哪些順序該調、哪些可刪、哪些缺銜接。回報主線判讀、依嚴重程度排序的結構問題（標出段落位置）與調整建議。不改字句
- **文字潤稿**：找出冗詞、語意含糊與邏輯跳接的句子，檢查語氣前後一致，雙語文件核對兩個版本說的是同一件事。每個問題回報原句位置、問題與改寫版本，針對句子，不重寫整段
- **事實查核**：列出文章裡每個可查證的宣稱，包括數字、日期、國家案例、技術描述、對專案或組織的描述，逐一判定為準確、需要出處、可能有誤或過度宣稱，可能有誤的實際查證。每個問題回報原句位置與宣稱、判定、證據或來源連結、建議改法（改數字、加出處、改成保守的說法或刪除）。不潤稿，也不評論文采
- **目標讀者**：扮演一位不熟主題、願意花五分鐘讀完的讀者，標出哪句讀不懂、哪個論點沒被說服、讀完記得什麼、會想做什麼。只給讀者反應，不給編輯建議

## 提問前先看哪裡

新貢獻者最常問的問題與對應出處：

| 問題 | 看這裡 |
|---|---|
| 如何選擇主題開始？ | [如何參與與認領主題](https://anoni.net/join/) |
| 如何申請 Matrix 帳號？ | [社群自架服務](https://anoni.net/services/) |
| 我的程度適合做什麼？ | [自我技能評估表](./skill-level.md) |
| 如何設定開發環境？ | [專案研究預先準備](./setup-repo.md) |
| 翻譯有什麼規範？ | [中文化與文件翻譯](./i18n.md) |
| 緊急情況的對外資源？ | [緊急求救](../help/index.md) |

如果上述都沒答案，到 Matrix 詢問。詢問前盡量提供：你想做什麼、你已經試過什麼、你卡在哪。

## 行為準則摘要

社群以開放、互助、合法為原則。以下是快速摘要，完整版（含角色定義、決策流程、爭議處理）見 [治理章程](https://anoni.net/about/governance/)，兩者不一致時以治理章程為準。重點：

- **互相尊重**：不同背景、不同熟悉度的成員一視同仁
- **討論議題不攻擊個人**：對事不對人
- **合法前提**：所有討論與協作以合法用途為前提，不協助洗錢、規避稅務、騷擾、跟蹤、未授權入侵等行為
- **資訊揭露**：涉及個人資料、機敏資訊的處理走 [上傳機敏資訊流程](https://anoni.net/join/upload-sensitive/)
- **爭議處理**：先在 Matrix 討論，沒有共識可提案到下一次社群同步討論

違反原則的行為會由核心成員依治理章程處理。

## 這份百科是活文件

新貢獻者遇到本頁沒有涵蓋的問題、發現某個流程其實沒寫清楚，歡迎提案修改本頁。改 contributor-handbook 本身就是一個 good first issue 的好題目。
