# 匿名網路社群文件 | anoni.net Docs

> 推廣與翻譯匿名網路 Tor、Tails 與 OONI 觀測工具

「匿名網路社群 anoni.net」的核心文件系統。倉庫裡有四個目錄：對外的多語系文件網站、Tor 中繼監控後端、OONI 觀測資料分析 CLI，以及支撐前三者的共用腳本與 CI 檢查。

## 📚 專案結構

```
anoni-net-docs/
├── docs/           # MkDocs 多語系文件網站（zh-TW、zh-CN、en）
├── pulse/          # Tor 中繼監控系統（FastAPI + PostgreSQL）
├── asn_coverage/   # OONI 觀測資料與 ASN 涵蓋率分析 CLI
└── tools/          # 共用腳本：編輯標準掃描、前端測試、資料產生、部署
```

四個目錄各有自己的 README，授權也不同，見下方「授權」一節。

### 1. docs：文件網站

基於 [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) 的多語系網站，提供正體中文、簡體中文與英文三個版本。

**網站分區：**

| 分區 | 內容 |
|------|------|
| 指南 | 概念、工具、場景、進階、報告五組。工具依「連線層」、「環境層」、「觀測層」、「日常隱私基本功」分類 |
| 在地脈絡 | 台灣的觀測資料與法規制度（個資法、VASP、揭弊者保護） |
| 小工具 | 在瀏覽器內執行的隱私工具：威脅模型盤點、密語產生、QR code 產生與讀取、metadata 清除、網址清理、隱形字元偵測、瀏覽器指紋示範 |
| 互動與呈現 | 洋蔥路由與會合點的動畫，以及 Tor 中繼地球儀 |
| 資訊更新 | 部落格與 Tor、Tails、Arti、OONI 的軟體更新日誌 |
| 社群 | 參與方式、翻譯流程、貢獻者百科、架設中繼與 onion 服務、讀懂觀測資料 |
| 關於我們 | 專案介紹、聯絡方式、離線內容管理 |

**技術特點：**

- 三語系內容分別存放於 `docs/zh-TW/`、`docs/zh-CN/`、`docs/en/`，各有一份 mkdocs 設定檔。預設語系 zh-TW 建在根路徑
- 外掛：`blog`、`rss`、`charts`（Vega-Lite）、`social`（Open Graph 卡片）、`privacy`（建置時把 CDN 資源取回本地）、`git-revision-date-localized`、`redirects`
- 小工具區的運算全部在瀏覽器內完成，不送出使用者輸入。對應的守門測試放在 `tools/`
- PWA 與離線閱讀：`docs/zh-TW/sw.js` 提供離線路徑，建置時由 `docs/hooks/offline_index.py` 產出各語系的 `offline-index.json`，離線內容管理頁據此列出可下載的章節
- 三種部署目標：Clearnet（S3 加 Cloudflare）、Tor Onion（同一個 bucket 的另一個 prefix）、IPFS（IPNS 名稱指向最新版本）

### 2. pulse：Tor 中繼監控系統

定期收集與統計 Tor 網路中繼資料的系統，提供 API 供前端查詢與視覺化。

**功能特點：**

- 每小時收集指定國家（TW、JP、KR、HK）的 Tor 中繼資料
- PostgreSQL 資料庫儲存歷史紀錄
- FastAPI REST API 與 Vega-Lite 圖表端點
- 健康檢查分兩個端點：`/api/healthz` 只回版本，`/api/readyz` 每次呼叫都連資料庫
- Docker Compose 一鍵部署

**技術架構：**

- Backend: Python 3.12+ / FastAPI / psycopg 3
- Database: PostgreSQL 17
- Scheduler: Alpine crond
- Deployment: Docker + Docker Compose

### 3. asn_coverage：OONI 涵蓋率分析

分析 OONI 觀測資料在各區域 ASN 的涵蓋狀況，協助識別測量盲點。

**資料來源：**

- OONI AWS S3 公開資料集（`ooni-data-eu-fra`）
- 支援回溯歷史資料與指定時間區間分析

**主要功能：**

- 統計各 ASN 的 OONI 測量次數
- 多執行緒平行下載與處理
- 輸出 CSV 格式分析報告

### 4. tools：共用腳本與檢查

跨子專案的腳本，多數零外部相依，由 GitHub Actions 在 PR 觸發。

| 群組 | 內容 |
|------|------|
| 編輯標準 | `docs_style_lint.py` 把[貢獻者百科](https://anoni.net/docs/community/contributor-handbook/)「寫作風格規範」可機器判斷的部分做成檢查。三語系都掃，中英各一組規則。細節見 [`tools/README.md`](./tools/README.md) |
| 前端守門測試 | 小工具區每一支 js 的行為驗證：取樣與熵、QR code 編碼往返、指紋示範頁不送出資料、網址清理不誤刪必要參數、隱形字元偵測的誤判案例。分析事件另有白名單測試，擋住搜尋詞之類的內容被送出 |
| 離線與 PWA | service worker 的離線路徑、語言偏好導向、離線索引分組、離線內容管理頁的介面，以及預快取清單與建置產物的比對 |
| 建置一致性 | `check_theme_assets.py` 比對 `overrides/base.html` 與 `sw.js` 寫死的主題資產雜湊與實際安裝的版本，升級 mkdocs-material 漏同步時會擋下來 |
| 地球儀資料 | `gen_*.py` 產生 `docs/zh-TW/games/tor-network/` 的靜態 JSON，`publish_games_data.sh` 在正式機重生並發布會持續變動的那幾份 |
| 互動與版面檢查 | headless Chrome 執行的手勢、取景與版面檢查 |
| 部署 | `cf_purge.py` 分批並行清除 Cloudflare 快取，`s3_restore_mtime.py` 讓內容沒變的檔案被 `aws s3 sync` 跳過 |

## 🚀 快速開始

### 環境需求

- **Python**: 3.12+
- **套件管理**: [uv](https://github.com/astral-sh/uv)
- **Docker**: 用於 Pulse 系統部署（可選）
- **Node.js**: 用於 `tools/` 的前端測試（可選，僅需標準庫）

### 安裝 uv

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 本地開發

#### Docs 文件網站

```bash
cd docs
uv sync
source .venv/bin/activate
mkdocs serve       # 預設語系 zh-TW，http://127.0.0.1:8000
```

三語系的建置驗證用 `run_*.sh`，各自 export 該語系需要的環境變數再建置到 `output/`：

```bash
sh run.sh          # zh-TW（預設語系，建在根路徑）
sh run_zh-cn.sh    # zh-CN
sh run_en.sh       # en
```

直接執行 `mkdocs build -f mkdocs_en.yml` 會因為 `DOCS_DIR` 之類的環境變數落回預設值而產生假警報，驗證三語系請走這三支腳本。`build_docs_anoni*.sh` 是正式機的部署腳本，內含伺服器專用路徑，本機不要執行。

#### Pulse 監控系統

```bash
cd pulse
cp .env.sample .env
# 編輯 .env 設定資料庫密碼等

docker-compose up -d
```

API 文件位於：`http://localhost:8000/api/readme`

#### ASN Coverage 分析工具

```bash
cd asn_coverage
uv sync

# 回溯最近 36 小時的 TW 觀測資料
uv run python ooni.py lookback --units=36 --loc=TW --frame=hours
```

### 送 PR 之前

```bash
# 編輯標準自檢，CI 對變更的 Markdown 執行同一支
python3 tools/docs_style_lint.py docs/zh-TW/<變更的檔案>.md

# 改到小工具或 service worker 時，一併執行對應測試
node tools/test_sw_offline.mjs
```

## 🔁 建置與發布

### 分支模型

`main` 是開發分支，`docs` 是建置觸發分支。PR 合併進 `main` 只代表內容進了倉庫，正式站讀取的來源是 S3，需要推 `docs` 分支才會建置並上傳：

```bash
git push origin origin/main:refs/heads/docs
```

workflow 執行完，clearnet 與 onion 兩份產物就上線。沒有自動把 `main` 同步到 `docs` 的機制，屬於刻意設計：要發布哪些內容、什麼時候發布，由人決定。

推了 `docs` 也不一定會建置。觸發路徑限定在會改變產物的檔案（`docs/**`、根目錄的 `BECOME_ANONI*.md`、`tools/cf_purge.py` 與 `tools/s3_restore_mtime.py` 及兩者的測試、`.github/workflows/build_docs.yml` 自己）。只動 `tools/` 其他檔案時推 `docs` 不會建置，需要重新建置時從 Actions 頁面用 `workflow_dispatch` 手動觸發。

### CI workflow

| Workflow | 觸發 | 內容 |
|----------|------|------|
| `BuildDocs` | push `docs` 分支、手動 | 建置三語系、處理 Open Graph 圖片、以 `aws s3 sync --delete` 上傳 clearnet 與 onion 產物、由 `cf_purge.py` 清除這次產出網址的 Cloudflare 快取 |
| `docs-style-lint` | PR | 對變更到的 Markdown 與小工具 UI 字串執行編輯標準掃描。error 級擋 merge，warn 級只標 annotation |
| `invisible-chars` | PR | 全站隱形字元掃描。零寬字元、BOM、Markdown 裡的不斷行空白會擋 merge |
| `tools-tests` | PR | `tools/` 底下零相依的測試，執行完不到十秒 |
| `games-checks` | PR | Tor 中繼地球儀的互動與版面檢查（headless Chrome） |
| `RIPE ASN name lists`、`Lookback OONI Data` | push `main`、每日排程、手動 | `asn_coverage/` 的資料抓取 |

## 📖 文件與資源

- **線上文件**: [https://anoni.net/docs/](https://anoni.net/docs/)
- **GitHub Repo**: [https://github.com/anoni-net/docs](https://github.com/anoni-net/docs)
- **Tor Onion**: `docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion`
- **IPFS 閘道**: [https://ipfs.anoni.net/](https://ipfs.anoni.net/)（社群自架，pin 的做法見[鏡像文件](https://anoni.net/docs/community/pin-ipfs-mirror/)）
- **詳細開發指南**: 請參閱 [CLAUDE.md](./CLAUDE.md)

## 🤝 貢獻

我們歡迎任何形式的貢獻。第一次來，照下面四條路徑找到自己的起點：

- **看到錯字或失效連結** → 開 [文件錯誤 Issue](https://github.com/anoni-net/docs/issues/new?template=bug.yml)，或小修直接送 PR。
- **想翻譯一篇文章** → 開 [翻譯認領 Issue](https://github.com/anoni-net/docs/issues/new?template=translation.yml)，流程見[中文化與文件翻譯](https://anoni.net/docs/community/i18n/)。
- **想提新主題、補在地案例，或推薦來源** → 用[內容提案](https://github.com/anoni-net/docs/issues/new?template=content.yml)或[來源建議](https://github.com/anoni-net/docs/issues/new?template=source-suggestion.yml) Issue。
- **想參與推廣、活動或維運** → 到 Matrix [社群 Public Space](https://matrix.to/#/#community:im.anoni.net) 打聲招呼。

工具操作與安全情境類內容（tools、scenarios、advanced）由維護者技術審核才合併，其餘內容輕量審核。寫作風格的單一來源是[貢獻者百科](https://anoni.net/docs/community/contributor-handbook/)的「寫作風格規範」一節，送 PR 前可先執行 `tools/docs_style_lint.py` 自檢。完整入門見[如何參與與認領主題](https://anoni.net/docs/community/how-to-contribute/)。流程、分支與 CI、授權見 [CONTRIBUTING.md](./CONTRIBUTING.md)，互動規範見[行為準則](./CODE_OF_CONDUCT.md)。

**找人**：Matrix [Public Space](https://matrix.to/#/#community:im.anoni.net)（帳號申請來信 whisper@anoni.net）、[GitHub Discussions](https://github.com/anoni-net/docs/discussions)、加密共筆 [Cryptpad](https://cryptpad.anoni.net/)。

## 📝 授權

本儲存庫內不同目錄適用不同授權，請以各目錄的 `LICENSE` 與下表為準（**並非**所有程式碼皆為 MIT）。

| 範圍 | 授權 |
|------|------|
| `docs/` 網站內容（Markdown 等） | [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [`pulse/`](pulse/) 程式碼 | [MIT](pulse/LICENSE) |
| [`asn_coverage/`](asn_coverage/) 程式碼 | [GPL-3.0](asn_coverage/LICENSE) |
| [`tools/`](tools/) 腳本與測試 | [MIT](tools/LICENSE)（不含 `tools/data/`）|
| `docs/zh-TW/games/tor-network/` 的外部資料 | 各自沿用原始授權，清單見 [`NOTICE`](./NOTICE) |

- 根目錄 [`LICENSE`](LICENSE) 為 **CC-BY 4.0** 全文，作為文件與網站內容之預設授權標示。
- 根目錄 [`LICENSE-asn_coverage`](LICENSE-asn_coverage) 為 **`asn_coverage` 子專案 GPL-3.0** 全文之副本，便於在根目錄瀏覽。以 [`asn_coverage/LICENSE`](asn_coverage/LICENSE) 為準。
- 地球儀的外部資料中，`ooni.json` 為 CC BY-NC-SA 4.0，**禁止商業使用**，重製前請先看 [`NOTICE`](./NOTICE)。
- `tools/data/` 放的是資料來源檔，座標部分取自 OpenStreetMap 採 ODbL，不在 `tools/` 的 MIT 範圍內，見 [`NOTICE`](./NOTICE)。

---

**Copyright © 2023-2026 anoni.net Docs Project**

---

# anoni.net Documentation

> Promoting and translating Tor, Tails, and OONI measurement tools for anonymous networks

The core documentation system for the "Anonymous Network Community anoni.net". The repository holds four directories: the public multilingual documentation site, the Tor relay monitoring backend, the OONI measurement analysis CLI, and the shared scripts and CI checks that support the first three.

## 📚 Project Structure

```
anoni-net-docs/
├── docs/           # MkDocs multilingual documentation site (zh-TW, zh-CN, en)
├── pulse/          # Tor relay monitoring system (FastAPI + PostgreSQL)
├── asn_coverage/   # OONI measurement data and ASN coverage analysis CLI
└── tools/          # Shared scripts: style linting, frontend tests, data generation, deployment
```

Each directory has its own README and its own license. See the License section below.

### 1. docs: Documentation Website

A multilingual site built on [MkDocs Material](https://squidfunk.github.io/mkdocs-material/), published in Traditional Chinese, Simplified Chinese, and English.

**Site sections:**

| Section | Content |
|---------|---------|
| Guides | Concepts, tools, scenarios, advanced topics, and reports. Tools are grouped by connection layer, environment layer, measurement layer, and everyday privacy basics |
| Local Context | Taiwan-specific measurement data and regulation (PDPA, VASP, whistleblower protection) |
| Utilities | Privacy tools that run entirely in the browser: threat-model inventory, passphrase generator, QR code generator and reader, metadata stripper, URL cleaner, invisible-character detector, browser fingerprint demo |
| Interactive | Onion routing and rendezvous animations, plus the Tor relay globe |
| Updates | Blog plus changelogs for Tor, Tails, Arti, and OONI |
| Community | How to participate, translation workflow, contributor handbook, running relays and onion services, reading measurement data |
| About | Project introduction, contact, offline content manager |

**Technical features:**

- Content for the three locales lives in `docs/zh-TW/`, `docs/zh-CN/`, and `docs/en/`, each with its own mkdocs config. The default locale zh-TW is built at the site root
- Plugins: `blog`, `rss`, `charts` (Vega-Lite), `social` (Open Graph cards), `privacy` (fetches CDN assets locally at build time), `git-revision-date-localized`, `redirects`
- Everything in the utilities section computes in the browser and sends no user input anywhere. The matching guard tests live under `tools/`
- PWA and offline reading: `docs/zh-TW/sw.js` handles the offline path, and `docs/hooks/offline_index.py` emits a per-locale `offline-index.json` at build time that the offline content manager reads to list downloadable sections
- Three deployment targets: clearnet (S3 plus Cloudflare), Tor Onion (a second prefix in the same bucket), and IPFS (an IPNS name pointing at the latest build)

### 2. pulse: Tor Relay Monitoring System

Collects and aggregates Tor relay data on a schedule, exposing APIs for frontend queries and visualization.

**Key features:**

- Hourly collection of Tor relay data for selected countries (TW, JP, KR, HK)
- PostgreSQL for historical records
- FastAPI REST API with Vega-Lite chart endpoints
- Two health endpoints: `/api/healthz` returns the version only, `/api/readyz` hits the database on every call
- One-command deployment with Docker Compose

**Technical stack:**

- Backend: Python 3.12+ / FastAPI / psycopg 3
- Database: PostgreSQL 17
- Scheduler: Alpine crond
- Deployment: Docker + Docker Compose

### 3. asn_coverage: OONI Coverage Analysis

Analyzes OONI measurement coverage across regional ASNs to help identify measurement blind spots.

**Data source:**

- OONI AWS S3 public dataset (`ooni-data-eu-fra`)
- Supports historical lookback and explicit time ranges

**Main features:**

- Measurement counts per ASN
- Multi-threaded parallel download and processing
- CSV analysis reports

### 4. tools: Shared Scripts and Checks

Cross-subproject scripts, mostly dependency-free, triggered by GitHub Actions on pull requests.

| Group | Content |
|-------|---------|
| Style linting | `docs_style_lint.py` turns the machine-checkable parts of the [contributor handbook's](https://anoni.net/docs/community/contributor-handbook/) writing style rules into a linter. It scans all three locales with separate Chinese and English rule sets. See [`tools/README.md`](./tools/README.md) |
| Frontend guard tests | Behavioral checks for every script in the utilities section: sampling and entropy, QR code encode/decode round-trip, the fingerprint demo sending nothing, the URL cleaner not stripping required parameters, false-positive cases for invisible-character detection. Analytics events have their own allowlist test that keeps content such as search terms from being sent |
| Offline and PWA | Service worker offline paths, language preference routing, offline index grouping, the offline content manager UI, and a precache-list comparison against build output |
| Build consistency | `check_theme_assets.py` compares the theme asset hashes hardcoded in `overrides/base.html` and `sw.js` against the installed version, catching a missed sync after a mkdocs-material upgrade |
| Globe data | `gen_*.py` produces the static JSON under `docs/zh-TW/games/tor-network/`, and `publish_games_data.sh` regenerates and publishes the files that keep changing |
| Interaction and layout checks | Gesture, framing, and layout checks driven by headless Chrome |
| Deployment | `cf_purge.py` purges Cloudflare cache in parallel batches, and `s3_restore_mtime.py` lets `aws s3 sync` skip files whose content has not changed |

## 🚀 Quick Start

### Requirements

- **Python**: 3.12+
- **Package Manager**: [uv](https://github.com/astral-sh/uv)
- **Docker**: For Pulse deployment (optional)
- **Node.js**: For the frontend tests in `tools/` (optional, standard library only)

### Install uv

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Local Development

#### Docs Documentation Website

```bash
cd docs
uv sync
source .venv/bin/activate
mkdocs serve       # default locale zh-TW, http://127.0.0.1:8000
```

To verify all three locales, use the `run_*.sh` scripts. Each exports the environment variables that locale needs and builds into `output/`:

```bash
sh run.sh          # zh-TW (default locale, built at the site root)
sh run_zh-cn.sh    # zh-CN
sh run_en.sh       # en
```

Running `mkdocs build -f mkdocs_en.yml` directly lets variables such as `DOCS_DIR` fall back to their defaults and raises spurious warnings, so verify locales through these three scripts. The `build_docs_anoni*.sh` scripts are for the production host and contain server-specific paths; do not run them locally.

#### Pulse Monitoring System

```bash
cd pulse
cp .env.sample .env
# Edit .env to configure database password, etc.

docker-compose up -d
```

API documentation available at: `http://localhost:8000/api/readme`

#### ASN Coverage Analysis Tool

```bash
cd asn_coverage
uv sync

# Lookback recent 36 hours of TW measurement data
uv run python ooni.py lookback --units=36 --loc=TW --frame=hours
```

### Before Opening a PR

```bash
# Style self-check; CI runs the same linter on changed Markdown
python3 tools/docs_style_lint.py docs/zh-TW/<changed-file>.md

# When touching a utility script or the service worker, run its test
node tools/test_sw_offline.mjs
```

## 🔁 Build and Publish

### Branch Model

`main` is the development branch and `docs` is the build trigger. Merging a PR into `main` only means the content landed in the repository. The production site reads from S3, so publishing requires pushing the `docs` branch:

```bash
git push origin origin/main:refs/heads/docs
```

Once the workflow finishes, both the clearnet and onion builds are live. There is no automatic sync from `main` to `docs`, by design: a human decides what ships and when.

Pushing `docs` does not always trigger a build. The trigger paths are limited to files that change the output (`docs/**`, `BECOME_ANONI*.md` at the repo root, `tools/cf_purge.py` and `tools/s3_restore_mtime.py` with their tests, and `.github/workflows/build_docs.yml` itself). Touching other files under `tools/` will not build; use `workflow_dispatch` from the Actions page when a rebuild is genuinely needed.

### CI Workflows

| Workflow | Trigger | Content |
|----------|---------|---------|
| `BuildDocs` | push to `docs`, manual | Builds all three locales, processes Open Graph images, uploads clearnet and onion output with `aws s3 sync --delete`, then purges the Cloudflare cache for the produced URLs via `cf_purge.py` |
| `docs-style-lint` | PR | Runs the style linter over changed Markdown and utility UI strings. Error-level rules block merge, warn-level rules only annotate |
| `invisible-chars` | PR | Repository-wide invisible-character scan. Zero-width characters, BOM, and non-breaking spaces in Markdown block merge |
| `tools-tests` | PR | The dependency-free tests under `tools/`, finishing in under ten seconds |
| `games-checks` | PR | Interaction and layout checks for the Tor relay globe (headless Chrome) |
| `RIPE ASN name lists`, `Lookback OONI Data` | push to `main`, daily schedule, manual | Data fetching for `asn_coverage/` |

## 📖 Documentation & Resources

- **Online Documentation**: [https://anoni.net/docs/](https://anoni.net/docs/)
- **GitHub Repo**: [https://github.com/anoni-net/docs](https://github.com/anoni-net/docs)
- **Tor Onion**: `docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion`
- **IPFS Gateway**: [https://ipfs.anoni.net/](https://ipfs.anoni.net/) (community-run; see the [mirror guide](https://anoni.net/docs/en/community/pin-ipfs-mirror/) for pinning)
- **Detailed Development Guide**: See [CLAUDE.md](./CLAUDE.md)

## 🤝 Contributing

We welcome contributions of all kinds. Pick your starting point:

- **Typo or broken link** → open a [bug issue](https://github.com/anoni-net/docs/issues/new?template=bug.yml), or send a small PR directly.
- **Translate an article** → open a [translation issue](https://github.com/anoni-net/docs/issues/new?template=translation.yml); see the [i18n workflow](https://anoni.net/docs/community/i18n/).
- **Propose a topic, add a local case, or suggest a source** → use the [content](https://github.com/anoni-net/docs/issues/new?template=content.yml) or [source](https://github.com/anoni-net/docs/issues/new?template=source-suggestion.yml) issue forms.
- **Help with outreach, events, or ops** → say hi in the Matrix [community Public Space](https://matrix.to/#/#community:im.anoni.net).

Tool and operational-security content (tools, scenarios, advanced) is reviewed by maintainers before merge; everything else is lighter. The single source of truth for writing style is the writing style section of the [contributor handbook](https://anoni.net/docs/community/contributor-handbook/), and `tools/docs_style_lint.py` is available for a local self-check. See [CONTRIBUTING.md](./CONTRIBUTING.md) for workflow, branches, CI, and licensing, and the [Code of Conduct](./CODE_OF_CONDUCT.md). Reach us via Matrix Public Space (account requests: whisper@anoni.net), [GitHub Discussions](https://github.com/anoni-net/docs/discussions), or [Cryptpad](https://cryptpad.anoni.net/).

## 📝 License

This repository contains multiple licenses. Use the table below and each subdirectory's `LICENSE` file (**not** all code is MIT).

| Scope | License |
|-------|---------|
| `docs/` site content (Markdown, etc.) | [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [`pulse/`](pulse/) code | [MIT](pulse/LICENSE) |
| [`asn_coverage/`](asn_coverage/) code | [GPL-3.0](asn_coverage/LICENSE) |
| [`tools/`](tools/) scripts and tests | [MIT](tools/LICENSE) (excluding `tools/data/`) |
| Third-party data under `docs/zh-TW/games/tor-network/` | Retains its original license; see [`NOTICE`](./NOTICE) |

- The root [`LICENSE`](LICENSE) file is the full **CC-BY 4.0** text used as the default license notice for documentation and site content.
- Root [`LICENSE-asn_coverage`](LICENSE-asn_coverage) is a **duplicate copy** of the GPL-3.0 text for `asn_coverage`; [`asn_coverage/LICENSE`](asn_coverage/LICENSE) is authoritative.
- Among the globe datasets, `ooni.json` is CC BY-NC-SA 4.0 and **prohibits commercial use**. Read [`NOTICE`](./NOTICE) before redistributing.
- `tools/data/` holds source data files whose coordinates come partly from OpenStreetMap under ODbL. They fall outside the MIT license covering `tools/`; see [`NOTICE`](./NOTICE).

---

**Copyright © 2023-2026 anoni.net Docs Project**
