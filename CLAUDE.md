# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

此專案是「匿名網路社群 Anoni.net」的文件系統，主要包含三個子專案：

1. **docs/** - MkDocs 驅動的多語系文件網站（zh-TW, zh-CN, en）
2. **pulse/** - Tor 中繼監控系統（FastAPI + PostgreSQL）
3. **asn_coverage/** - OONI 觀測資料與 ASN 涵蓋率分析工具

### 整體架構

```
anoni-net-docs/
├── docs/           # 文件網站 (MkDocs Material)
├── pulse/          # Tor 監控系統 (FastAPI backend + PostgreSQL)
└── asn_coverage/   # OONI ASN 分析工具 (Python CLI)
```

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

# 或使用腳本啟動不同語言版本
sh run.sh          # zh-TW (預設)
sh run_zh-tw.sh    # zh-TW
sh run_zh-cn.sh    # zh-CN
sh run_en.sh       # en
```

### 建置文件

```bash
cd docs

# 建置所有語言版本
sh build_docs_anoni.sh        # 標準版本
sh build_docs_anoni_ipfs.sh   # IPFS 版本
sh build_docs_anoni_onion.sh  # Onion 版本
```

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
  - `social`: Open Graph 社交卡片生成
- **特殊功能**: 使用 `custom_dir` 設定客製化的 overrides（針對不同語言有不同的 overrides 目錄）

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

- **build_docs.yml**: 建置多語系文件並上傳至 S3
  - 觸發條件: push to `docs` branch 或手動觸發
  - 建置所有語言版本（zh-TW, zh-CN, en）
  - 處理 Open Graph 圖片
  - 清理並上傳至 S3

- **check-ripe.yml**: 檢查 RIPE ASN 資料
- **lookback-ooni.yml**: 定期收集 OONI 資料

## 專案特定注意事項

### 撰寫文件時

- 預設使用正體中文（zh-TW）撰寫
- 部落格文章放在 `docs/{lang}/blog/posts/` 目錄
- 使用 YAML front matter 設定文章 metadata（title, date, categories）
- 支援 Vega-Lite 圖表（使用 ````vegalite` code fence）

### 修改 API 時

- FastAPI 使用 `root_path="/api"` 設定，所有端點需加上 `/api` 前綴
- CORS 設定透過環境變數 `CORS_ALLOW_ORIGINS` 和 `CORS_ALLOW_CREDENTIALS` 控制
- 健康檢查端點：`/api/healthz` (基礎健康) 和 `/api/readyz` (含資料庫檢查)

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

- 使用 uv 管理所有 Python 專案依賴
- 所有專案使用 Python 3.12+
