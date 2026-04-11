# Pulse - Tor 中繼監控系統

> 即時監控與統計 Tor 網路中繼資料，提供 API 供前端查詢與視覺化

Pulse 是 Anoni.net 專案的 Tor 網路監控系統，定期收集並儲存 Tor 中繼節點資料，透過 FastAPI 提供 REST API 與 Vega-Lite 圖表端點，支援前端應用進行資料視覺化。

## 📊 系統架構

```
pulse/
├── backend/           # Python 後端程式碼
│   ├── api.py        # FastAPI 主應用
│   ├── tor.py        # Tor 資料收集 CLI
│   ├── tor_onionoo.py # Onionoo API 客戶端
│   ├── ooni.py       # OONI API 客戶端
│   ├── pgdb.py       # PostgreSQL 資料庫操作
│   ├── structs.py    # 資料結構定義
│   ├── routers/      # API 路由
│   │   └── vega.py   # Vega-Lite 圖表端點
│   └── dbtxt/        # SQL schema 定義
│       ├── relay_details.sql
│       └── asn_count.sql
├── docker-compose.yml # Docker 編排設定
└── .env.sample       # 環境變數範例
```

## ✨ 功能特點

- **定期資料收集**: 每小時自動收集 TW、JP、KR、HK 的 Tor 中繼資料
- **完整資料儲存**: PostgreSQL 資料庫儲存中繼節點詳細資訊與歷史紀錄
- **RESTful API**: FastAPI 提供高效能 REST API
- **視覺化支援**: Vega-Lite 格式圖表資料端點
- **健康檢查**: 內建 `/api/healthz` 和 `/api/readyz` 端點（`root_path="/api"`）
- **CORS 支援**: 可配置跨域請求設定
- **Docker 部署**: 一鍵啟動完整服務

## 🛠️ 技術堆疊

- **語言**: Python 3.12+
- **Web 框架**: FastAPI
- **資料庫**: PostgreSQL 17
- **資料庫驅動**: psycopg 3
- **排程器**: Alpine crond
- **容器化**: Docker + Docker Compose
- **套件管理**: uv

## 🚀 快速開始

### 環境需求

- Docker 和 Docker Compose
- （可選）Python 3.12+ 和 uv（用於本地開發）

### 安裝與啟動

1. **複製環境設定檔**

```bash
cp .env.sample .env
```

2. **編輯 `.env` 設定資料庫與 API**

```bash
PG_HOST="127.0.0.1:5432"
API_HOST="127.0.0.1:8000"
PG_DB="your_database"
PG_USER="your_username"
PG_PASSWORD="your_password"

# Optional: CORS 設定
CORS_ALLOW_ORIGINS="https://example.com"
CORS_ALLOW_CREDENTIALS="false"
```

3. **啟動所有服務**

```bash
docker-compose up -d
```

4. **查看服務狀態**

```bash
docker-compose ps
```

5. **存取 API 文件**

開啟瀏覽器訪問：`http://localhost:8000/api/readme`

### 停止服務

```bash
docker-compose down
```

## 📡 Docker 服務說明

### db (PostgreSQL)
- **映像**: `postgres:17.7-alpine3.23`
- **功能**: PostgreSQL 資料庫服務
- **健康檢查**: 使用 `pg_isready` 確認資料庫可用性
- **資料持久化**: 掛載 `./data` 目錄

### db-init
- **映像**: `postgres:17.7-alpine3.23`
- **功能**: 初始化資料庫 schema
- **執行時機**: 僅在 db 服務健康後執行一次
- **SQL 檔案**: 自動執行 `dbtxt/*.sql`

### backend
- **基礎映像**: `python:3.12.12-alpine3.23`
- **功能**: 定期收集 Tor 中繼資料
- **排程**:
  - `@reboot`: 容器啟動時立即執行一次
  - `5 * * * *`: 每小時第 5 分鐘執行
- **監控國家**: TW, JP, KR, HK

### api
- **基礎映像**: `python:3.12.12-alpine3.23`
- **功能**: 提供 REST API 與圖表資料端點
- **端點路徑**: `/api/*` (配置 `root_path="/api"`)
- **文件**: `/api/readme` (Swagger UI)
- **健康檢查**:
  - `/api/healthz`: 基本健康檢查
  - `/api/readyz`: 包含資料庫連線檢查

## 🔧 API 端點

### 健康檢查

- `GET /api/healthz` - 基本健康檢查
- `GET /api/readyz` - 就緒檢查（含資料庫連線）

### Vega-Lite 圖表資料

詳見 API 文件：`http://localhost:8000/api/readme`

## 💻 本地開發

### 設定開發環境

```bash
cd backend
uv sync
```

### 啟動 API 開發伺服器

```bash
# 使用 FastAPI CLI
uv run fastapi dev api.py

# 或使用 uvicorn
uv run uvicorn api:app --reload
```

### 手動收集資料

```bash
# 收集台灣的 Tor 中繼資料
uv run python tor.py details --country=tw

# 收集日本的 Tor 中繼資料
uv run python tor.py details --country=jp
```

## 🗄️ 資料庫 Schema

### relay_details 表

儲存 Tor 中繼節點的詳細資訊：

| 欄位 | 類型 | 說明 |
|------|------|------|
| created_at | timestamp | 資料收集時間 |
| fingerprint | varchar(40) | 中繼節點指紋 |
| nickname | varchar(20) | 節點暱稱 |
| running | boolean | 是否運行中 |
| measured | boolean | 是否已測量 |
| asn | varchar(10) | ASN 編號 |
| as_name | varchar(100) | ASN 名稱 |
| consensus_weight | smallserial | 共識權重 |
| platform | varchar(100) | 平台資訊 |
| version | varchar(20) | Tor 版本 |
| country | varchar(10) | 國家代碼 |
| country_name | varchar(40) | 國家名稱 |
| contact | varchar(400) | 聯絡資訊 |
| flags | varchar(20)[] | 節點旗標 |
| first_seen | timestamp | 首次發現時間 |
| last_seen | timestamp | 最後發現時間 |
| last_changed | timestamp | 最後變更時間 |
| bandwidth_rate | bigserial | 頻寬速率 |
| bandwidth_burst | bigserial | 突發頻寬 |
| observed_bandwidth | bigserial | 觀測頻寬 |
| advertised_bandwidth | bigserial | 宣告頻寬 |
| guard_probability | NUMERIC(7, 6) | Guard 機率 |
| middle_probability | NUMERIC(7, 6) | Middle 機率 |
| exit_probability | NUMERIC(7, 6) | Exit 機率 |

**唯一約束**: `(created_at, fingerprint)`

### asn_count 表

儲存 ASN 統計資料（請參閱 `dbtxt/asn_count.sql`）

## ⏰ 定期任務

Backend 容器使用 Alpine Linux 的 crond 執行定期任務：

```cron
# 容器啟動時立即執行一次
@reboot cd /app; uv run tor.py details
@reboot cd /app; uv run tor.py details --country=jp
@reboot cd /app; uv run tor.py details --country=kr
@reboot cd /app; uv run tor.py details --country=hk

# 每小時第 5 分鐘執行
5 * * * * cd /app; uv run tor.py details
5 * * * * cd /app; uv run tor.py details --country=jp
5 * * * * cd /app; uv run tor.py details --country=kr
5 * * * * cd /app; uv run tor.py details --country=hk
```

## 🔍 日誌查看

```bash
# 查看所有服務日誌
docker-compose logs -f

# 查看特定服務日誌
docker-compose logs -f api
docker-compose logs -f backend
docker-compose logs -f db
```

## 🛡️ 安全注意事項

- 請勿將 `.env` 檔案提交到版本控制系統
- 使用強密碼設定資料庫
- 在生產環境中適當配置 CORS 設定
- 定期更新 Docker 映像檔

## 📝 開發指南

### 程式碼風格

- 使用 `ruff` 進行程式碼檢查（配置於 `pyproject.toml`）
- Python 版本：3.12+
- 行長度：100 字元
- 啟用規則：E (錯誤), F (pyflakes), I (import sorting)

### 資料庫連線

- 使用 psycopg 3（非 psycopg2）
- 連線字串格式：`postgresql://{user}:{password}@{host}:{port}/{database}`
- 環境變數：`PG_CONN`

### API 開發注意事項

- 所有端點需加上 `/api` 前綴（`root_path="/api"`）
- CORS 透過環境變數 `CORS_ALLOW_ORIGINS` 和 `CORS_ALLOW_CREDENTIALS` 控制
- 使用 FastAPI 的自動文件生成功能

## 📄 授權

MIT License - 詳見專案根目錄的 LICENSE 檔案

---

# Pulse - Tor Relay Monitoring System

> Real-time monitoring and statistics of Tor network relay data, providing APIs for frontend queries and visualization

Pulse is the Tor network monitoring system for the Anoni.net project. It periodically collects and stores Tor relay node data, providing REST API and Vega-Lite chart endpoints through FastAPI for frontend data visualization.

## 📊 System Architecture

```
pulse/
├── backend/           # Python backend code
│   ├── api.py        # FastAPI main application
│   ├── tor.py        # Tor data collection CLI
│   ├── tor_onionoo.py # Onionoo API client
│   ├── ooni.py       # OONI API client
│   ├── pgdb.py       # PostgreSQL database operations
│   ├── structs.py    # Data structure definitions
│   ├── routers/      # API routers
│   │   └── vega.py   # Vega-Lite chart endpoints
│   └── dbtxt/        # SQL schema definitions
│       ├── relay_details.sql
│       └── asn_count.sql
├── docker-compose.yml # Docker orchestration config
└── .env.sample       # Environment variables example
```

## ✨ Features

- **Scheduled Data Collection**: Automatically collect Tor relay data from TW, JP, KR, HK every hour
- **Complete Data Storage**: PostgreSQL database stores relay node details and historical records
- **RESTful API**: High-performance REST API provided by FastAPI
- **Visualization Support**: Vega-Lite format chart data endpoints
- **Health Checks**: Built-in `/healthz` and `/readyz` endpoints
- **CORS Support**: Configurable cross-origin request settings
- **Docker Deployment**: One-click launch of complete services

## 🛠️ Tech Stack

- **Language**: Python 3.12+
- **Web Framework**: FastAPI
- **Database**: PostgreSQL 17
- **Database Driver**: psycopg 3
- **Scheduler**: Alpine crond
- **Containerization**: Docker + Docker Compose
- **Package Manager**: uv

## 🚀 Quick Start

### Requirements

- Docker and Docker Compose
- (Optional) Python 3.12+ and uv (for local development)

### Installation & Launch

1. **Copy environment configuration file**

```bash
cp .env.sample .env
```

2. **Edit `.env` to configure database and API**

```bash
PG_HOST="127.0.0.1:5432"
API_HOST="127.0.0.1:8000"
PG_DB="your_database"
PG_USER="your_username"
PG_PASSWORD="your_password"

# Optional: CORS settings
CORS_ALLOW_ORIGINS="https://example.com"
CORS_ALLOW_CREDENTIALS="false"
```

3. **Start all services**

```bash
docker-compose up -d
```

4. **Check service status**

```bash
docker-compose ps
```

5. **Access API documentation**

Open browser and visit: `http://localhost:8000/api/readme`

### Stop Services

```bash
docker-compose down
```

## 📡 Docker Services

### db (PostgreSQL)
- **Image**: `postgres:17.7-alpine3.23`
- **Function**: PostgreSQL database service
- **Health Check**: Uses `pg_isready` to verify database availability
- **Data Persistence**: Mounts `./data` directory

### db-init
- **Image**: `postgres:17.7-alpine3.23`
- **Function**: Initialize database schema
- **Execution**: Runs once after db service is healthy
- **SQL Files**: Automatically executes `dbtxt/*.sql`

### backend
- **Base Image**: `python:3.12.12-alpine3.23`
- **Function**: Periodically collect Tor relay data
- **Schedule**:
  - `@reboot`: Execute once immediately on container startup
  - `5 * * * *`: Execute at minute 5 of every hour
- **Monitored Countries**: TW, JP, KR, HK

### api
- **Base Image**: `python:3.12.12-alpine3.23`
- **Function**: Provide REST API and chart data endpoints
- **Endpoint Path**: `/api/*` (configured with `root_path="/api"`)
- **Documentation**: `/api/readme` (Swagger UI)
- **Health Checks**:
  - `/api/healthz`: Basic health check
  - `/api/readyz`: Readiness check (includes database connection)

## 🔧 API Endpoints

### Health Checks

- `GET /api/healthz` - Basic health check
- `GET /api/readyz` - Readiness check (includes database connection)

### Vega-Lite Chart Data

See API documentation: `http://localhost:8000/api/readme`

## 💻 Local Development

### Setup Development Environment

```bash
cd backend
uv sync
```

### Start API Development Server

```bash
# Using FastAPI CLI
uv run fastapi dev api.py

# Or using uvicorn
uv run uvicorn api:app --reload
```

### Manual Data Collection

```bash
# Collect Taiwan Tor relay data
uv run python tor.py details --country=tw

# Collect Japan Tor relay data
uv run python tor.py details --country=jp
```

## 🗄️ Database Schema

### relay_details Table

Stores detailed information about Tor relay nodes:

| Field | Type | Description |
|-------|------|-------------|
| created_at | timestamp | Data collection time |
| fingerprint | varchar(40) | Relay node fingerprint |
| nickname | varchar(20) | Node nickname |
| running | boolean | Whether running |
| measured | boolean | Whether measured |
| asn | varchar(10) | ASN number |
| as_name | varchar(100) | ASN name |
| consensus_weight | smallserial | Consensus weight |
| platform | varchar(100) | Platform information |
| version | varchar(20) | Tor version |
| country | varchar(10) | Country code |
| country_name | varchar(40) | Country name |
| contact | varchar(400) | Contact information |
| flags | varchar(20)[] | Node flags |
| first_seen | timestamp | First seen time |
| last_seen | timestamp | Last seen time |
| last_changed | timestamp | Last changed time |
| bandwidth_rate | bigserial | Bandwidth rate |
| bandwidth_burst | bigserial | Burst bandwidth |
| observed_bandwidth | bigserial | Observed bandwidth |
| advertised_bandwidth | bigserial | Advertised bandwidth |
| guard_probability | NUMERIC(7, 6) | Guard probability |
| middle_probability | NUMERIC(7, 6) | Middle probability |
| exit_probability | NUMERIC(7, 6) | Exit probability |

**Unique Constraint**: `(created_at, fingerprint)`

### asn_count Table

Stores ASN statistics (see `dbtxt/asn_count.sql`)

## ⏰ Scheduled Tasks

The backend container uses Alpine Linux's crond to execute scheduled tasks:

```cron
# Execute once immediately on container startup
@reboot cd /app; uv run tor.py details
@reboot cd /app; uv run tor.py details --country=jp
@reboot cd /app; uv run tor.py details --country=kr
@reboot cd /app; uv run tor.py details --country=hk

# Execute at minute 5 of every hour
5 * * * * cd /app; uv run tor.py details
5 * * * * cd /app; uv run tor.py details --country=jp
5 * * * * cd /app; uv run tor.py details --country=kr
5 * * * * cd /app; uv run tor.py details --country=hk
```

## 🔍 View Logs

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f backend
docker-compose logs -f db
```

## 🛡️ Security Considerations

- Do not commit `.env` file to version control
- Use strong passwords for database configuration
- Configure CORS settings appropriately in production
- Regularly update Docker images

## 📝 Development Guide

### Code Style

- Use `ruff` for code linting (configured in `pyproject.toml`)
- Python version: 3.12+
- Line length: 100 characters
- Enabled rules: E (errors), F (pyflakes), I (import sorting)

### Database Connection

- Use psycopg 3 (not psycopg2)
- Connection string format: `postgresql://{user}:{password}@{host}:{port}/{database}`
- Environment variable: `PG_CONN`

### API Development Notes

- All endpoints need `/api` prefix (`root_path="/api"`)
- CORS controlled through environment variables `CORS_ALLOW_ORIGINS` and `CORS_ALLOW_CREDENTIALS`
- Use FastAPI's automatic documentation generation

## 📄 License

MIT License - See LICENSE file in project root directory

---

**Copyright © 2023-2025 Anoni.net Pulse Project**
