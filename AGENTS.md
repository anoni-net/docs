# AGENTS.md

本文件寫給在 anoni-net/docs 工作的 AI 協作工具與使用它們的貢獻者，不限定哪一家的服務。Claude Code 從 `CLAUDE.md` 引入本文件，其他工具多半直接讀 `AGENTS.md`。寫作與協作的規則以[貢獻者百科](https://anoni.net/docs/community/contributor-handbook/)為準，這裡整理 repo 結構、開發指令與容易出錯的地方。

## 專案概述

此專案是「匿名網路社群 anoni.net」的文件系統，包含文件網站與一組共用腳本：

1. **docs/** - MkDocs 驅動的多語系文件網站（zh-TW, zh-CN, en）
2. **tools/** - 共用腳本（文件編輯標準掃描、快取清除、地球儀資料與版面檢查）

原本放在這裡的 Pulse 與 ASN Coverage 在 2026-10 拆成獨立的 repo，見下方「拆出去的工具」。

### 整體架構

```
anoni-net-docs/
├── docs/           # 文件網站 (MkDocs Material)
└── tools/          # 共用腳本 (docs linter、快取清除、games 資料與檢查)
```

### 子目錄的說明檔

兩個目錄有自己的 `AGENTS.md`，處理該目錄的檔案時再讀：`tools/AGENTS.md`（`tools/` 與 `docs/hooks/` 的每支腳本）、`.github/AGENTS.md`（CI/CD 與發布）。兩個目錄各有一份只寫 `@AGENTS.md` 的 `CLAUDE.md`，Claude Code 只在處理該目錄的檔案時才載入，不會在開場就全部讀進來。

### 授權一覽

| 範圍 | 授權 |
|------|------|
| `docs/` 網站內容 | [CC-BY 4.0](./LICENSE)（根目錄 `LICENSE` 為全文） |
| `.claude/skills/drawio/` | [Apache-2.0](./.claude/skills/drawio/LICENSE)，取自 [jgraph/drawio-mcp](https://github.com/jgraph/drawio-mcp)，開頭增補一段本 repo 的用法 |

`docs/zh-TW/games/tor-network/` 底下有六份外部資料，各自沿用原始授權，其中 `ooni.json` 是
CC BY-NC-SA 4.0（禁止商業使用）。清單見根目錄 [`NOTICE`](./NOTICE)。

### tools/ 共用腳本

`tools/` 與 `docs/hooks/` 底下每支腳本與 hook 的說明在 [`tools/AGENTS.md`](./tools/AGENTS.md)，改這兩個目錄的檔案之前先讀那份。

## 開發環境設置

此專案使用 **uv** 作為 Python 套件管理工具，Python 3.12+。

### 初始化開發環境

```bash
# 安裝 uv (如果尚未安裝)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 同步文件網站的依賴
cd docs && uv sync
```

## Docs 文件網站

### 本地開發

```bash
cd docs

# 啟動開發伺服器 (預設 zh-TW 版本)
source .venv/bin/activate
mkdocs serve
```

三語系的建置驗證用 `run_*.sh`。三支都是 `mkdocs build`，各自 export 該語系需要的環境變數再建置到 `output/`：

```bash
sh run.sh          # zh-TW（預設語系，建在根路徑）
sh run_zh-cn.sh    # zh-CN
sh run_en.sh       # en
```

直接執行 `mkdocs build -f mkdocs_en.yml` 會因為 `DOCS_DIR` 之類的環境變數落回預設值而產生假警報，驗證三語系一律走這三支腳本。

只是要驗結構或網址時，關掉 social 與 privacy 兩個外掛會快很多（三語系 72 秒降到 41 秒），產出的網址與錨點逐位元組相同：

```bash
SOCIAL_CARDS=false PRIVACY_ASSETS=false sh run.sh
```

兩個旗標預設都是 `true`，`build_docs.yml` 不帶它們，發布的產物照樣有社群卡片與本地化的外部資產。要驗卡片或外部資產本身的時候不要關。

### 建置文件

```bash
cd docs

# 建置所有語言版本
sh build_docs_anoni.sh        # 標準版本
./build_docs_anoni_ipfs.sh    # IPFS 版本
sh build_docs_anoni_onion.sh  # Onion 版本
```

IPFS 那支要用 `./` 或 `bash` 執行，不能用 `sh`。它需要 bash 的 `set -o pipefail`，
Ubuntu 的 `sh` 是 dash，一進去就中止在 `Illegal option -o pipefail`。錯誤發生在
`trap` 裝好之前，看起來像什麼都沒做就結束。另外兩支沒有 bash 專用語法，`sh` 可以。

### 多語系架構

- 使用環境變數控制不同語言的設定（透過 mkdocs.yml, mkdocs_en.yml, mkdocs_cn.yml）
- 文件內容分別存放在 `zh-TW/`, `zh-CN/`, `en/` 目錄
- 支援三種部署目標：標準網站、IPFS、Tor Onion

### MkDocs 設定重點

- **Theme**: Material for MkDocs
- **外掛**:
  - `git-revision-date-localized`: 顯示文件修改時間
  - `blog`: 部落格功能
  - `rss`: RSS feed
  - `charts`: Vega-Lite 圖表支援（用於數據視覺化）
  - `social`: Open Graph 社群分享卡。版型是 `docs/layouts/anoni.yml`，三個語系共用一份，
    語系差異（字型、卡片上的站名）寫在各自的 `mkdocs*.yml`。`cards_layout_dir` 相對於
    執行 mkdocs 的目錄，所以建置一律在 `docs/` 底下執行。設計說明見
    `docs/zh-TW/community/visual-guide.md` 的「社群分享卡」一節
- **特殊功能**: 使用 `custom_dir` 設定客製化的 overrides（針對不同語言有不同的 overrides 目錄）

### 軟體更新日誌（changelog/）

`docs/<lang>/changelog/` 底下十四頁追蹤 Tor 家族、OONI、OnionShare、五種作業系統、瀏覽器與通訊軟體的版本更新，目標是讓非工程師讀者能依風險自己判斷要不要更新。

動這批頁面之前先讀 [`docs/CHANGELOG_SOURCES.md`](./docs/CHANGELOG_SOURCES.md)，那裡記了各頁的上游在哪、怎麼取，以及十個會踩的坑。最容易誤判的三個：MSRC 的嚴重度是每個受影響產品各記一筆，直接數會膨脹好幾倍。GrapheneOS 發布說明裡的「List of additional fixed CVEs」是提前修補未來月份的累積清單，不是當月涵蓋範圍。Apple 同一輪多條維護線的公告元件同名，修的卻不一定是同一項，歸屬要逐條看 `Impact:`。

急迫程度標籤的判準各頁不同，有的看證據、有的看官方發布形式，那一份也寫明了。

首頁 `changelog/index.md` 的「最近的更新」與 `changelog/feed*.xml` 的 RSS 由 `docs/hooks/changelog_digest.py` 在建置時產生，資料來自各頁的條目（`## 標題` 加上 `> 日期` 那一行），不要手寫。各頁的顯示名稱、對應的篩選項與分級判準寫在該頁 front matter 的 `digest`，首頁的文字與篩選項寫在 `index.md` 的 `changelog_digest`。新增一頁時兩邊都要補，漏了 `digest` 建置會出 warning。「現在要處理的」最上面固定一列 Tor Browser 目前的穩定版，由 `changelog_digest.pinned` 指定頁面、`pinned_note` 寫旁邊的說明，取的是該頁最新一則非 Alpha 的條目，不受 45 天的期間限制。每個篩選項各有一份 feed，登記在網址合約裡，拿掉篩選項等於讓訂閱的人收不到東西，CI 會擋。三語系都接上了，篩選項的 id 三邊要一致。一頁收兩個產品時（瀏覽器頁的 Chrome 與 Firefox、通訊軟體頁的 WhatsApp 與 Signal），在 `digest.tracks` 列出產品名、條目標題以產品名開頭，首頁會每個產品各取最新一則，否則同一頁的另一個產品會從「現在要處理的」消失。

## 拆出去的工具

文件站觀測頁用到的兩個工具在 2026-10 拆成獨立的 repo，commit 歷史一併帶過去，開發說明各自寫在那邊的 `AGENTS.md` 與 README。

| 工具 | repo | 授權 | 跟文件站的關係 |
|------|------|------|----------------|
| Pulse | [`anoni-net/pulse`](https://github.com/anoni-net/pulse) | MIT | 提供 `https://anoni.net/api/` 的資料，「Tor Relays 觀測點」等頁的 Vega-Lite 圖表直接呼叫這個 API |
| ASN Coverage | [`anoni-net/asn-coverage`](https://github.com/anoni-net/asn-coverage) | GPL-3.0 | 「ASNs 自治網路觀測資料分析」與 `community/asn-coverage-howto` 的分析與操作步驟來自這個工具 |

兩者都沒有讀這個 repo 的檔案，文件站也沒有讀它們的產出，只透過 API 網址與頁面連結銜接。

## 程式碼風格

- 文件：使用 `tools/docs_style_lint.py`，規則出自貢獻者百科，三語系都掃。error 級擋 merge，warn 級只提醒
- 使用 uv 管理所有 Python 專案依賴
- 所有專案使用 Python 3.12+
