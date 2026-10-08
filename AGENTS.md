# AGENTS.md

本文件寫給在 anoni-net/docs 工作的 AI 協作工具與使用它們的貢獻者，不限定哪一家的服務。Claude Code 從 `CLAUDE.md` 引入本文件，其他工具多半直接讀 `AGENTS.md`。寫作與協作的規則以[貢獻者百科](https://anoni.net/docs/community/contributor-handbook/)為準，這裡整理 repo 結構、開發指令與容易出錯的地方。

## 專案概述

此專案是「匿名網路社群 anoni.net」的文件系統，主要包含三個子專案與一組共用腳本：

1. **docs/** - MkDocs 驅動的多語系文件網站（zh-TW, zh-CN, en）
2. **pulse/** - Tor 中繼監控系統（FastAPI + PostgreSQL）
3. **asn_coverage/** - OONI 觀測資料與 ASN 涵蓋率分析工具
4. **tools/** - 跨子專案的共用腳本（文件編輯標準掃描、快取清除、地球儀資料與版面檢查）

### 整體架構

```
anoni-net-docs/
├── docs/           # 文件網站 (MkDocs Material)
├── pulse/          # Tor 監控系統 (FastAPI backend + PostgreSQL)
├── asn_coverage/   # OONI ASN 分析工具 (Python CLI)
└── tools/          # 共用腳本 (docs linter、快取清除、games 資料與檢查)
```

### 子目錄的說明檔

三個目錄有自己的 `AGENTS.md`，處理該目錄的檔案時再讀：`pulse/AGENTS.md`（Pulse 的開發與架構）、`tools/AGENTS.md`（`tools/` 與 `docs/hooks/` 的每支腳本）、`.github/AGENTS.md`（CI/CD 與發布）。三個目錄各有一份只寫 `@AGENTS.md` 的 `CLAUDE.md`，Claude Code 只在處理該目錄的檔案時才載入，不會在開場就全部讀進來。

### 授權一覽

| 範圍 | 授權 |
|------|------|
| `docs/` 網站內容 | [CC-BY 4.0](./LICENSE)（根目錄 `LICENSE` 為全文） |
| `pulse/` 程式碼 | [MIT](./pulse/LICENSE) |
| `asn_coverage/` 程式碼 | [GPL-3.0](./asn_coverage/LICENSE) |
| `.claude/skills/drawio/` | [Apache-2.0](./.claude/skills/drawio/LICENSE)，取自 [jgraph/drawio-mcp](https://github.com/jgraph/drawio-mcp)，開頭增補一段本 repo 的用法 |

根目錄 `LICENSE-asn_coverage` 為 `asn_coverage` 之 GPL-3.0 全文副本，以 `asn_coverage/LICENSE` 為準。

`docs/zh-TW/games/tor-network/` 底下有六份外部資料，各自沿用原始授權，其中 `ooni.json` 是
CC BY-NC-SA 4.0（禁止商業使用）。清單見根目錄 [`NOTICE`](./NOTICE)。

### 兩套 OONI 相關程式（勿混淆）

| 位置 | 用途 | 資料來源 |
|------|------|----------|
| `pulse/backend/ooni.py` | Pulse 服務內建的 **OONI API** 客戶端（與監控後端一併部署） | OONI API |
| `asn_coverage/ooni.py` | **批次**下載 S3 觀測資料、ASN 涵蓋分析 CLI | OONI AWS S3 公開資料集 |

### tools/ 共用腳本

`tools/` 與 `docs/hooks/` 底下每支腳本與 hook 的說明在 [`tools/AGENTS.md`](./tools/AGENTS.md)，改這兩個目錄的檔案之前先讀那份。

## 開發環境設置

此專案使用 **uv** 作為 Python 套件管理工具。所有子專案都使用 Python 3.12+。

### 初始化開發環境

```bash
# 安裝 uv (如果尚未安裝)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 在各子專案目錄中同步依賴
cd docs && uv sync
cd pulse/backend && uv sync
cd asn_coverage && uv sync
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
    `docs/zh-TW/community/brand-assets.md` 的「社群分享卡」一節
- **特殊功能**: 使用 `custom_dir` 設定客製化的 overrides（針對不同語言有不同的 overrides 目錄）

### 軟體更新日誌（changelog/）

`docs/<lang>/changelog/` 底下十四頁追蹤 Tor 家族、OONI、OnionShare、五種作業系統、瀏覽器與通訊軟體的版本更新，目標是讓非工程師讀者能依風險自己判斷要不要更新。

動這批頁面之前先讀 [`docs/CHANGELOG_SOURCES.md`](./docs/CHANGELOG_SOURCES.md)，那裡記了各頁的上游在哪、怎麼取，以及十個會踩的坑。最容易誤判的三個：MSRC 的嚴重度是每個受影響產品各記一筆，直接數會膨脹好幾倍。GrapheneOS 發布說明裡的「List of additional fixed CVEs」是提前修補未來月份的累積清單，不是當月涵蓋範圍。Apple 同一輪多條維護線的公告元件同名，修的卻不一定是同一項，歸屬要逐條看 `Impact:`。

急迫程度標籤的判準各頁不同，有的看證據、有的看官方發布形式，那一份也寫明了。

首頁 `changelog/index.md` 的「最近的更新」與 `changelog/feed*.xml` 的 RSS 由 `docs/hooks/changelog_digest.py` 在建置時產生，資料來自各頁的條目（`## 標題` 加上 `> 日期` 那一行），不要手寫。各頁的顯示名稱、對應的篩選項與分級判準寫在該頁 front matter 的 `digest`，首頁的文字與篩選項寫在 `index.md` 的 `changelog_digest`。新增一頁時兩邊都要補，漏了 `digest` 建置會出 warning。「現在要處理的」最上面固定一列 Tor Browser 目前的穩定版，由 `changelog_digest.pinned` 指定頁面、`pinned_note` 寫旁邊的說明，取的是該頁最新一則非 Alpha 的條目，不受 45 天的期間限制。每個篩選項各有一份 feed，登記在網址合約裡，拿掉篩選項等於讓訂閱的人收不到東西，CI 會擋。三語系都接上了，篩選項的 id 三邊要一致。一頁收兩個產品時（瀏覽器頁的 Chrome 與 Firefox、通訊軟體頁的 WhatsApp 與 Signal），在 `digest.tracks` 列出產品名、條目標題以產品名開頭，首頁會每個產品各取最新一則，否則同一頁的另一個產品會從「現在要處理的」消失。

## Pulse 監控系統

Tor 中繼監控系統，定期收集並儲存 Tor 網路資料，提供 API 供前端查詢。開發指令、架構、排程與環境設定見 [`pulse/AGENTS.md`](./pulse/AGENTS.md)，Claude Code 處理 `pulse/` 的檔案時會自動載入那份。

## ASN Coverage 分析工具

分析 OONI 觀測資料在各區域 ASN 的涵蓋狀況。

### 資料來源

使用 OONI 在 AWS S3 的公開資料集：
- Bucket: `ooni-data-eu-fra` (eu-central-1)
- 格式: `raw/{date}/{hour}/{country}/webconnectivity/*.jsonl.gz`

### 使用方式

```bash
cd asn_coverage

# 回溯最近 36 小時的資料
uv run python ooni.py lookback --units=36 --loc=TW --frame=hours

# 指定時間區間
uv run python ooni.py span --start=2025/01/01 --end=2025/01/31 --loc=TW --chunk=40

# 轉換原始資料為行格式
uv run python ooni.py sheetrow --path=./lookback_TW_20250101_36_hours.csv
```

### 資料處理流程

1. 從 S3 下載指定時間區間的 `jsonl.gz` 檔案
2. 解析 JSON 並統計每個 ASN 的觀測次數
3. 輸出為 CSV 格式（包含時間、地區、ASN、統計資料）
4. 可使用 `sheetrow` 命令轉換為更易讀的行格式

### 效能優化

- 使用多執行緒 (Threading) 平行下載與處理資料
- 支援 chunk 分批處理，避免記憶體溢出
- 顯示進度條追蹤下載狀態

## Git 工作流程

### 主要分支

- `main`: 主要開發分支
- `docs`: 文件建置觸發分支（CI/CD）

### CI/CD

GitHub Actions 的觸發條件、建置、部署與發布流程見 [`.github/AGENTS.md`](./.github/AGENTS.md)。重點是 `main` 合併不會發布，要推 `docs` 分支才會觸發建置並上傳，細節與例外都在那份。

## 專案特定注意事項

### 撰寫文件時

- 預設使用正體中文（zh-TW）撰寫
- 部落格文章放在 `docs/{lang}/blog/posts/` 目錄
- front matter、註腳、圖表與結構化資料的寫法見貢獻者百科的「文章格式」一節
- 支援 Vega-Lite 圖表（使用 ````vegalite` code fence）
- 寫作風格的單一來源是[貢獻者百科](https://anoni.net/docs/community/contributor-handbook/)（原始檔 `docs/zh-TW/community/contributor-handbook.md`）的「寫作風格規範」一節。要新增或修改規則先改那裡
- 寫作風格規範的套用範圍不限於 `docs/` 的內容。repo 根目錄的說明文件（`README.md`、`CONTRIBUTING.md`、`AGENTS.md`、`CLAUDE.md`、`NOTICE`、各子目錄的 `README.md`）同樣要遵守。這幾個檔案不在 CI 的觸發路徑內，改完自己執行一次 linter。`NOTICE` 沒有 `.md` 副檔名，linter 只收 `.md` 與 `.js`，那一份要人工看
  - 規則文件本身逐條寫出被禁用的標點與句型，掃自己的規則描述必然全紅。貢獻者百科與這份投影靠 linter 的 `RULE_DOCS` 依檔名豁免，`tools/README.md` 的規則表與已知邊界兩段改用 `<!-- docs-style-lint: disable -->` 與 `enable` 包住。往後寫規則說明時照同一個做法，不要改掉引用的例子
- 送 PR 前可先執行 `python3 tools/docs_style_lint.py <path>` 自檢，CI 會對變更的中文 Markdown 執行同一支
- 語系的資料夾與對外 URL 規則不同：`docs/zh-TW/` 對應 `https://anoni.net/docs/`（預設語系不帶語系區段），`docs/zh-CN/` 對應 `/docs/zh-cn/`（URL 小寫），`docs/en/` 對應 `/docs/en/`
- `/docs/zh-tw/` 是已停用的舊網址，由 Cloudflare Redirect Rule 301 導回 `/docs/`。它曾經是 `run_zh-tw.sh` 建出來的第二棵樹，內容與根路徑完全相同，兩邊各自 self-canonical 又各自進 sitemap，等於自製重複內容。語言選單的 zh-TW 項填 `/docs/` 就夠，不要再加回那份建置

### 做小工具時

- 對外的四條規則寫在 `docs/zh-TW/utils/index.md` 的前言，要改規則先改那裡，三語系一起改
- 不做任何把資料送到伺服器的便利功能，「存起來給別人看」的分享連結也算。核心運算在瀏覽器裡完成，跟這個工具有沒有側門是兩件事，而畫面上分不出來。JSONFormatter 與 CodeBeautify 的政策寫著 `99% of our tools are doing processing on browser using Java Script`，那句話是真的，出事的是另外一顆存檔按鈕，存下來的內容預設公開且搜尋引擎索引得到。watchTowr Labs 2025 年從那裡取得八萬多份提交、超過 5 GB，涵蓋五年份的內容，裡面有資料庫密碼、雲端金鑰與企業內部帳號。兩站的政策都警告過不要存機密資料，看到的人不多
- 判準是「斷網之後這個工具還做得完它宣稱的事嗎」，做得完才收進來。這條同時擋掉需要外部服務的功能與需要伺服器才成立的便利功能
- 互動成本有上限。讀者要做的選擇與輸入落在個位數到十位數，超過就變成在做一套應用程式，說明留給文章。開工前先量一次

### 修改 API 時

- FastAPI 使用 `root_path="/api"` 設定，所有端點需加上 `/api` 前綴
- CORS 設定透過環境變數 `CORS_ALLOW_ORIGINS` 和 `CORS_ALLOW_CREDENTIALS` 控制
- 健康檢查端點：`/api/healthz`（只回版本，不連資料庫）與 `/api/readyz`（每次呼叫都連資料庫，連不上回 503）。容器 healthcheck 探測 `/api/readyz`，`healthz` 綠燈不代表資料查得到

### 資料庫操作

- 使用 psycopg 3 (非 psycopg2)
- 連線字串格式: `postgresql://{user}:{password}@{host}:{port}/{database}`
- Schema 變更需更新 `dbtxt/*.sql` 並重新執行 db-init

### 使用 OONI 資料時

- 需使用 s5cmd（不支援 s3cmd）或 boto3 存取公開 bucket
- 設定 `signature_version=UNSIGNED` 存取公開資料
- 注意已知問題：某些 ASN 的地區標籤可能不準確（如 AS38136）

## 程式碼風格

- Python: 使用 ruff 進行 linting（僅 pulse/backend 有設定）
  - 目標版本: Python 3.12
  - 行長度: 100 字元
  - 啟用規則: E (錯誤), F (pyflakes), I (import sorting)

- 文件：使用 `tools/docs_style_lint.py`，規則出自貢獻者百科，三語系都掃。error 級擋 merge，warn 級只提醒
- 使用 uv 管理所有 Python 專案依賴
- 所有專案使用 Python 3.12+
