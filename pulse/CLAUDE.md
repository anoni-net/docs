# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案定位

Pulse 是 Tor 中繼監控系統，定期從 Tor Onionoo API 收集 TW/JP/KR/HK 四個地區的中繼節點資料，儲存至 PostgreSQL，並透過 FastAPI 提供 Vega-Lite 圖表資料端點。

## 開發指令

```bash
# 本地 API 開發（熱重載）
cd backend
uv sync
uv run fastapi dev api.py

# 手動觸發資料收集
uv run python tor.py details                 # TW
uv run python tor.py details --country=jp   # JP/KR/HK 同理

# 載入 OONI ASN 資料
uv run python ooni.py asn --path=<csv_file> --save=True

# Lint（ruff，設定於 pyproject.toml）
uv run ruff check .
uv run ruff format .

# 完整 stack（PostgreSQL + backend cron + API）
docker-compose up -d
docker-compose logs -f
```

## 架構概覽

四個 Docker 服務：

| 服務 | 職責 |
|------|------|
| **db** | PostgreSQL 17 |
| **db-init** | 一次性執行 `dbtxt/*.sql` 建 schema |
| **backend** | Alpine crond，每小時第 5 分鐘收集四地區資料 |
| **api** | FastAPI，port 8000 |

資料流：`Onionoo API → tor.py → relay_details 表 → vega.py 端點 → Vega-Lite 前端`

## 程式碼結構

```
backend/
├── api.py              # FastAPI 進入點，含 CORS / healthz / readyz
├── tor.py              # Click CLI，fetch → validate → upsert
├── tor_onionoo.py      # requests.Session 封裝 Onionoo API
├── ooni.py             # OONI CSV 資料匯入
├── pgdb.py             # psycopg3 context manager（PGConn）
├── structs.py          # Pydantic v2 models（Relay, Details）
├── routers/vega.py     # 5 個 Vega-Lite 圖表端點
└── dbtxt/              # SQL schema（relay_details, asn_count）
```

## 關鍵設計

**DB 操作**：使用 `with PGConn() as pg:` context manager，commit/rollback 自動處理；驅動為 psycopg3（非 psycopg2）。

**Pydantic 欄位別名**：`structs.py` 中 `Relay` 的 `asn` 對應 Onionoo 的 `as` 欄位，`last_changed` 對應 `last_changed_address_or_port`，`model_dump()` 輸出用於 SQL 插入。

**Node type 計算**：`vega.py` 中依 `guard_probability / middle_probability / exit_probability` 欄位判斷節點類型（GUARD / MIDDLE / EXIT），非從 Onionoo 直接取得。

**API 路由前綴**：`root_path="/api"`，所有端點實際路徑加 `/api`。Swagger UI 在 `GET /api/readme`。

**Vega 端點**：共 5 個，均接受 `country`（TW/JP/KR/HK enum）和 `limit=45` 參數，回傳 Pydantic model 的 JSON 陣列。

**Cron 設定**：Dockerfile 建置時寫入 `/etc/crontabs/root`，`5 * * * *` 執行四次（各地區），容器重啟時 `@reboot` 也觸發一次。

## 環境設定

`.env.sample` → 複製為 `.env`，關鍵變數：

```
PG_HOST="127.0.0.1:5432"
PG_DB="..."
PG_USER="..."
PG_PASSWORD="..."
API_HOST="127.0.0.1:8000"
```

Backend 內部讀取 `PG_CONN` 連線字串（由 docker-compose 組合）。`CORS_ALLOW_ORIGINS` 為逗號分隔的允許來源清單（預設 `*`）。

## Schema 修改流程

修改 `dbtxt/*.sql` 後，需重建 db-init 容器讓新 schema 生效：

```bash
docker-compose up -d --force-recreate db-init
```
