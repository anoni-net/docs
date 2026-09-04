# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

### 授權一覽

| 範圍 | 授權 |
|------|------|
| `docs/` 網站內容 | [CC-BY 4.0](./LICENSE)（根目錄 `LICENSE` 為全文） |
| `pulse/` 程式碼 | [MIT](./pulse/LICENSE) |
| `asn_coverage/` 程式碼 | [GPL-3.0](./asn_coverage/LICENSE) |

根目錄 `LICENSE-asn_coverage` 為 `asn_coverage` 之 GPL-3.0 全文副本，以 `asn_coverage/LICENSE` 為準。

`docs/zh-TW/games/tor-network/` 底下有六份外部資料，各自沿用原始授權，其中 `ooni.json` 是
CC BY-NC-SA 4.0（禁止商業使用）。清單見根目錄 [`NOTICE`](./NOTICE)。

### 兩套 OONI 相關程式（勿混淆）

| 位置 | 用途 | 資料來源 |
|------|------|----------|
| `pulse/backend/ooni.py` | Pulse 服務內建的 **OONI API** 客戶端（與監控後端一併部署） | OONI API |
| `asn_coverage/ooni.py` | **批次**下載 S3 觀測資料、ASN 涵蓋分析 CLI | OONI AWS S3 公開資料集 |

### tools/ 共用腳本

| 群組 | 檔案 | 用途 |
|------|------|------|
| 離線內容索引 | `docs/hooks/offline_index.py` | mkdocs hook，建置時產出各語系的 `offline-index.json`（有哪些頁面、屬於哪個章節、多大）。離線內容管理頁 `docs/<lang>/offline.md` 用它列出可勾選的清單，介面在 `docs/zh-TW/js/offline-library.js`（另兩語是 symlink）。同一份索引的 `paths` 記著 `start/*.md` 五條起步路徑各連到哪些頁面，從起步頁自己的 Markdown 連結解析。`start/index.md` 上的路徑下載按鈕由同一支 js 以 `#start-offline` 為根節點畫出來，按下去把該路徑的頁面連同內文圖送進讀者自選的快取，不記住讀者選了哪一條。哪幾條要在按鈕旁掛敏感提醒，由起步頁 frontmatter 的 `offline_caution: true` 決定|
| 文件編輯標準 | `docs_style_lint.py`、`test_docs_style_lint.py` | 把貢獻者百科「寫作風格規範」可機器判斷的部分做成檢查。三語系都掃，中英各一組規則（破折號與分號在英文屬正常用法，不套中文那組）。除了 Markdown，也掃 `docs/zh-TW/js/*.js` 裡 `STRINGS` 物件的 UI 字串，語系從物件的 key 判斷而不是路徑。純標準庫，無外部相依。細節見 [`tools/README.md`](./tools/README.md) |
| 三語系對齊 | `check_start_parity.py`、`test_check_start_parity.py` | `docs/<lang>/start/` 三個語系的檔名清單、nav 收錄與章節錨點。這三件 mkdocs 都不擋：`hreflang_alternate_links.html` 無條件替每頁產生三個語系的 alternate，對面檔案不存在就是 404。nav 漏收只給 INFO。`links.anchors` 預設也是 INFO，實測把錨點改壞照樣 Documentation built。start 整區只做聚合、每頁都是連結，斷了讀者只會落在文章開頭，看起來像連對了。由 [`docs-style-lint.yml`](./.github/workflows/docs-style-lint.yml) 觸發，掛在那支是因為錨點檢查看的是被連結那篇的小標，只有它的 paths 涵蓋得到「改目標文章、沒碰 start/」的 PR |
| 小工具 | `test_passphrase.mjs`、`test_qrcode.mjs`、`test_leaks.mjs`、`test_cleanurl.mjs`、`test_invisible.mjs`、`test_qrread.mjs`、`test_redact.mjs`、`test_agecrypt.mjs`、`test_passkey.mjs` | `docs/zh-TW/js/passphrase.js` 的取樣、熵計算、字元集與詞表完整性。取樣那幾項刻意構造出「直接取模」與「拒絕重抽」會給出不同答案的輸入，寫回 `% n` 就會紅。這類錯誤畫面上完全正常，照樣吐出看起來很隨機的字，而受害的讀者不會知道自己受害。`test_qrcode.mjs` 另外寫了一個獨立的 QR 解碼器，把產生的矩陣讀回字串再比對，驗的是「掃得出來而且內容對」，人眼讀不了 QR，這種錯只有解回文字才驗得到。`test_leaks.mjs` 掃指紋示範頁的原始碼，出現任何送資料或寫入儲存的手段就紅，那一頁的整個立論建立在「什麼都不送」上。`test_cleanurl.mjs` 守的是網址清理器「必要參數不能被誤刪」，刪掉 `?v=` 讀者只會覺得對方給錯連結，不會怪到工具頭上。`test_invisible.mjs` 的誤判案例跟偵測案例一樣多，emoji 裡的 ZWJ、RTL 文字裡的方向標記、整段俄文裡的西里爾字母都不該報，全部報成可疑的話那支工具會變成狼來了。`test_redact.mjs` 守截圖遮蔽的兩件事：方框正規化後每個被碰到的像素都在框內（邊緣不留半遮的原內容），以及原始碼裡沒有模糊、沒有任何送出或留存資料的手段，輸出檔名固定不帶原檔名。`test_agecrypt.mjs` 用 Node 內建的 crypto 獨立實作 age 的密語模式，跟 `utils/vendor/age/` 裡原封不動的 typage 互相解開對方的輸出，並對照 vendor 的檔案清單、頁面的 import map 與 `offline_assets` 三邊一致 |
| 部署 | `cf_purge.py`、`test_cf_purge.py` | 建置完把產物映射回網址，分批並行清除 Cloudflare 快取（每批 30 條，同時 6 批）。測試由 [`tools-tests.yml`](./.github/workflows/tools-tests.yml) 在 PR 觸發 |
| 部署 | `s3_restore_mtime.py`、`test_s3_restore_mtime.py` | 上傳前比對 MD5 與 S3 的 ETag，內容沒變的把時間戳調回遠端版本，讓 `aws s3 sync` 跳過。`sync` 只看大小與時間，不看內容 |
| 地球儀資料 | `gen_*.py`、`publish_games_data.sh` | 產生 `docs/zh-TW/games/tor-network/` 的靜態 JSON。`snapshot.json`、`torusers.json`、`seacable.json` 會持續變動，由 `publish_games_data.sh` 在正式機重生並檢查後發布到 assets，其餘幾份變動以季或年計，跟文件站一起發布即可 |
| 地球儀版面檢查 | `check_double_tap.mjs`、`check_focus.mjs`、`check_pinch_release.mjs`、`check_sub_gauge.mjs`、`fix_trunk_land.mjs`、`shoot_games.mjs` | headless Chrome 執行的互動與版面檢查，由 `games-checks.yml` 在 PR 觸發 |
| PWA 與離線 | `check_precache.mjs`、`test_sw_offline.mjs`、`test_lang_preference.mjs`、`test_offline_index.py`、`test_offline_library.mjs` | `check_precache.mjs` 比對預快取清單與 `docs/output` 的實際檔案，驗索引頁連出去的網址形狀命中得了快取的 key，並反過來驗每一頁載入的樣式、腳本與 manifest 都有人負責預快取（需先建置）。反向那道是 2026-09-04 補的：`stylesheets/extra.css` 每頁都載入，`SHELL_ASSETS` 沒收，建置端又因為「每頁都出現」把它從個別頁面的資產移除，兩邊都以為對方負責，離線打開任何一頁都是白的，而清單往檔案的那道檢查看不到這種漏洞。其餘四支把原始碼原地抽出來單元測試，不需要建置：`test_sw_offline.mjs` 測 `docs/zh-TW/sw.js` 的離線路徑，`test_lang_preference.mjs` 測 `docs/overrides/base.html` 的語言導向，`test_offline_index.py` 測 `docs/hooks/offline_index.py` 的分組，`test_offline_library.mjs` 餵一組最小 DOM 替身把 `docs/zh-TW/js/offline-library.js` 整份執行起來，驗它畫出來的結構與送給 service worker 的指令（版面與樣式驗不到，那要靠實機）。由 [`tools-tests.yml`](./.github/workflows/tools-tests.yml) 在 PR 觸發。`check_precache.mjs` 需要建置產物，不在那一支裡，改由 [`build_docs.yml`](./.github/workflows/build_docs.yml) 在建完 standard 版之後執行，壞掉會擋下部署而不是擋下 PR。本機改 `docs/zh-TW/sw.js` 之後可以先建置再手動執行一次 |

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

`docs/<lang>/changelog/` 底下十二頁追蹤 Tor 家族、OONI、OnionShare 與五種作業系統的版本更新，目標是讓非工程師讀者能依風險自己判斷要不要更新。

動這批頁面之前先讀 [`docs/CHANGELOG_SOURCES.md`](./docs/CHANGELOG_SOURCES.md)，那裡記了各頁的上游在哪、怎麼取，以及七個會踩的坑。最容易誤判的兩個：MSRC 的嚴重度是每個受影響產品各記一筆，直接數會膨脹好幾倍。GrapheneOS 發布說明裡的「List of additional fixed CVEs」是提前修補未來月份的累積清單，不是當月涵蓋範圍。

急迫程度標籤的判準各頁不同，有的看證據、有的看官方發布形式，那一份也寫明了。

## Pulse 監控系統

Tor 中繼監控系統，定期收集並儲存 Tor 網路資料，提供 API 供前端查詢。

### 本地開發

```bash
cd pulse

# 啟動所有服務 (PostgreSQL + Backend + API)
docker-compose up -d

# 查看服務狀態
docker-compose ps

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down
```

### 環境設定

複製 `.env.sample` 並依據需求修改：

```bash
cp .env.sample .env
# 編輯 .env 檔案設定資料庫密碼、API host 等
```

### 架構說明

- **db**: PostgreSQL 17 資料庫
- **db-init**: 初始化資料庫 schema（執行 `dbtxt/*.sql`）
- **backend**: 排程任務容器，使用 cron 定期執行 `tor.py details` 收集各國家的 Tor 中繼資料
- **api**: FastAPI 應用，提供 REST API 和 Vega-Lite 圖表資料端點

### API 開發

```bash
cd pulse/backend

# 本地開發 API
uv run fastapi dev api.py

# 或使用 uvicorn
uv run uvicorn api:app --reload
```

API 文件位於: `http://localhost:8000/api/readme` (Swagger UI)

### 資料庫操作

資料庫 schema 定義在 `pulse/backend/dbtxt/`:
- `relay_details.sql`: Tor 中繼詳細資料表
- `asn_count.sql`: ASN 統計資料表

### 定期任務

Backend 容器使用 Alpine Linux 的 crond 定期執行：
- 每小時第 5 分鐘收集 TW, JP, KR, HK 的 Tor 中繼資料
- 容器啟動時執行一次 (@reboot)

### 程式碼結構

```
pulse/backend/
├── api.py              # FastAPI 主應用
├── routers/
│   └── vega.py         # Vega-Lite 圖表端點
├── tor.py              # Tor 資料收集 CLI
├── tor_onionoo.py      # Onionoo API 客戶端
├── ooni.py             # OONI API 客戶端
├── pgdb.py             # PostgreSQL 資料庫操作
├── structs.py          # 資料結構定義
└── dbtxt/              # SQL schema 定義
```

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

使用 GitHub Actions 自動建置與部署：

- **build_docs.yml**: 建置多語系文件並發布
  - 觸發條件: push to `docs` branch 且變更落在會改變產物的路徑（`docs/**`、根目錄的 `BECOME_ANONI*.md`、`tools/cf_purge.py` 與其測試、workflow 自己），或手動觸發
  - 只動 `tools/` 其他檔案或 CI 設定時推 `docs` 不會建置，那是刻意的，產物沒有變。真的需要重新建置時，從 Actions 頁面用 `workflow_dispatch`
  - 建置所有語言版本（zh-TW, zh-CN, en）
  - 處理 Open Graph 圖片
  - 以 `aws s3 sync --delete` 上傳至 S3：clearnet 產物在 `docs/`，onion 產物在同一個 bucket 的 `docs-onion/`。單一步覆寫，站上任何時刻都有完整的一份，不再有先清空再上傳造成的空窗
  - 上傳後由 `tools/cf_purge.py` 清除這次產出網址的 Cloudflare 快取，範圍限 `/docs/`，不動 zone 內其他服務

  **S3 是正式站的讀取來源**，所以推 `docs` 分支且這個 workflow 執行完，內容就已經上線，不需要額外的手動發布步驟。發布指令：

  ```bash
  git push origin origin/main:refs/heads/docs
  ```

- **docs-style-lint.yml**: 對 PR 變更到的中文 Markdown 與小工具區的 UI 字串執行 `tools/docs_style_lint.py`
  - 觸發路徑：`docs/zh-TW/**/*.md`、`docs/zh-CN/**/*.md`、`docs/en/**/*.md` 與 linter 本身
  - 只掃這次 PR 變更的檔案，避免舊文的遺留違規擋住新貢獻
  - 這個 job 會擋 merge。error 級規則讓 linter 回 exit 1，job 就紅。warn 級規則仍只以 annotation 標在變更行上，不影響 exit code
  - 待辦：repo 設定尚未把這個 check 列為 branch protection 必過，所以目前擋得住 PR 的紅燈，擋不住有權限的人直接合併

- **tools-tests.yml**: 執行 `tools/` 底下那幾支零相依的測試
  - 觸發路徑：`tools/**`、`docs/zh-TW/sw.js`、`docs/overrides/base.html`、`docs/hooks/**`
  - 內容：`test_sw_offline.mjs`（service worker 的離線行為）、`test_lang_preference.mjs`（語言偏好導向）、`test_offline_index.py`（離線內容索引的分組與排序）、`test_offline_library.mjs`（離線內容管理頁的介面）、`test_passphrase.mjs`（密語與密碼產生器的取樣與熵）、`test_qrcode.mjs`（QR code 的編碼往返）、`test_leaks.mjs`（指紋示範頁不送資料）、`test_cf_purge.py`（快取清除映射）
  - 不需要建置產物，執行完不到十秒。`test_docs_style_lint.py` 不在這裡，由 `docs-style-lint.yml` 執行
  - `check_precache.mjs` 需要 `docs/output`，不在這一支裡，由 `build_docs.yml` 在建完 standard 版之後執行

- **check-ripe.yml** 與 **lookback-ooni.yml**: `asn_coverage/` 的資料抓取
  - 觸發路徑：`asn_coverage/**` 與各自的 workflow。原本任何 main 的 push 都觸發，2026-08-19 一天被 docs 的 PR 觸發 18 次，每次四個 job（2 OS × 2 Python），把並行額度佔滿，連 BuildDocs 都排不進去
  - `timeout-minutes: 30` 與 `concurrency` 的 `cancel-in-progress`。同一天有六個 run 卡在 `apt-get update`（runner 的 apt mirror 沒有回應），沒有 timeout 就會佔著 runner 到預設的六小時
  - 憑證那一步改成 `continue-on-error`，runner image 本來就帶 ca-certificates，那一步失敗不該擋住整個 job

- **games-checks.yml**: 「Tor 中繼地球儀」的互動與版面檢查（headless Chrome）
  - 觸發路徑：`docs/zh-TW/games/tor-network/**`、`tools/check_*.mjs`
  - 檢查項目：捏合放開不彈開、擋掉 iOS Safari 雙擊放大、網址關注區域的取景、變電所容量計版面（280 座 × 三語系 × 寬窄視窗）

- **check-ripe.yml**: 檢查 RIPE ASN 資料（`asn_coverage/`）
  - **push** 僅在 **`main`** 分支觸發。`workflow_dispatch` 與 `schedule` 維持可用
- **lookback-ooni.yml**: 定期回溯 OONI 資料（`asn_coverage/`）
  - **push** 僅在 **`main`** 分支觸發。`workflow_dispatch` 與 `schedule` 維持可用

## 專案特定注意事項

### 撰寫文件時

- 預設使用正體中文（zh-TW）撰寫
- 部落格文章放在 `docs/{lang}/blog/posts/` 目錄
- 使用 YAML front matter 設定文章 metadata（title, date, categories）
- 支援 Vega-Lite 圖表（使用 ````vegalite` code fence）
- 寫作風格的單一來源是[貢獻者百科](https://anoni.net/docs/community/contributor-handbook/)（原始檔 `docs/zh-TW/community/contributor-handbook.md`）的「寫作風格規範」一節。要新增或修改規則先改那裡
- 寫作風格規範的套用範圍不限於 `docs/` 的內容。repo 根目錄的說明文件（`README.md`、`CONTRIBUTING.md`、`CLAUDE.md`、`NOTICE`、各子目錄的 `README.md`）同樣要遵守。這幾個檔案不在 CI 的觸發路徑內，改完自己執行一次 linter。`NOTICE` 沒有 `.md` 副檔名，linter 只收 `.md` 與 `.js`，那一份要人工看
  - 規則文件本身逐條寫出被禁用的標點與句型，掃自己的規則描述必然全紅。貢獻者百科與這份投影靠 linter 的 `RULE_DOCS` 依檔名豁免，`tools/README.md` 的規則表與已知邊界兩段改用 `<!-- docs-style-lint: disable -->` 與 `enable` 包住。往後寫規則說明時照同一個做法，不要改掉引用的例子
- 送 PR 前可先執行 `python3 tools/docs_style_lint.py <path>` 自檢，CI 會對變更的中文 Markdown 執行同一支
- 語系的資料夾與對外 URL 規則不同：`docs/zh-TW/` 對應 `https://anoni.net/docs/`（預設語系不帶語系區段），`docs/zh-CN/` 對應 `/docs/zh-cn/`（URL 小寫），`docs/en/` 對應 `/docs/en/`
- `/docs/zh-tw/` 是已停用的舊網址，由 Cloudflare Redirect Rule 301 導回 `/docs/`。它曾經是 `run_zh-tw.sh` 建出來的第二棵樹，內容與根路徑完全相同，兩邊各自 self-canonical 又各自進 sitemap，等於自製重複內容。語言選單的 zh-TW 項填 `/docs/` 就夠，不要再加回那份建置

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
