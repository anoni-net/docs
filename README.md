# 匿名網路社群文件 | Anoni.net Docs

> 推廣與翻譯匿名網路 Tor、Tails 與 OONI 觀測工具

此專案是「匿名網路社群 Anoni.net」的核心文件系統，致力於推廣網路自由與隱私保護工具。專案包含多語系文件網站、Tor 中繼監控系統，以及 OONI 觀測資料分析工具。

## 📚 專案結構

```
anoni-net-docs/
├── docs/           # MkDocs 多語系文件網站（zh-TW, zh-CN, en）
├── pulse/          # Tor 中繼監控系統（FastAPI + PostgreSQL）
└── asn_coverage/   # OONI 觀測資料與 ASN 涵蓋率分析工具
```

### 1. Docs - 文件網站

基於 [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) 的多語系文件系統，提供繁體中文、簡體中文與英文三種語言版本。

**主要內容：**
- Tor、Tails、OONI 教學與翻譯文件
- 社群活動資訊與工作坊內容
- 網路審查觀測報告
- 參與專案的指南

**技術特點：**
- 多語系支援（zh-TW / zh-CN / en）
- 內建部落格系統與 RSS 訂閱
- Vega-Lite 資料視覺化圖表
- 支援標準網站、IPFS、Tor Onion 多種部署方式

### 2. Pulse - Tor 中繼監控系統

即時監控與統計 Tor 網路中繼資料的系統，提供 API 供前端查詢與視覺化。

**功能特點：**
- 定期收集指定國家（TW、JP、KR、HK）的 Tor 中繼資料
- PostgreSQL 資料庫儲存歷史紀錄
- FastAPI REST API 與 Vega-Lite 圖表端點
- Docker Compose 一鍵部署

**技術架構：**
- Backend: Python 3.12+ / FastAPI / psycopg 3
- Database: PostgreSQL 17
- Scheduler: Alpine crond
- Deployment: Docker + Docker Compose

### 3. ASN Coverage - OONI 涵蓋率分析

分析 OONI 觀測資料在各區域 ASN 的涵蓋狀況，協助識別測量盲點。

**資料來源：**
- OONI AWS S3 公開資料集（`ooni-data-eu-fra`）
- 支援回溯歷史資料與指定時間區間分析

**主要功能：**
- 統計各 ASN 的 OONI 測量次數
- 多執行緒平行下載與處理
- 輸出 CSV 格式分析報告

## 🚀 快速開始

### 環境需求

- **Python**: 3.12+
- **套件管理**: [uv](https://github.com/astral-sh/uv)
- **Docker**: 用於 Pulse 系統部署（可選）

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
mkdocs serve  # 預設啟動 zh-TW 版本
```

開啟瀏覽器訪問 `http://127.0.0.1:8000`

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

## 📖 文件與資源

- **線上文件**: [https://anoni.net/docs/](https://anoni.net/docs/)
- **GitHub Repo**: [https://github.com/anoni-net/docs](https://github.com/anoni-net/docs)
- **Tor Onion**: `docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion`
- **詳細開發指南**: 請參閱 [CLAUDE.md](./CLAUDE.md)

## 🤝 貢獻

我們歡迎任何形式的貢獻。流程、分支與 CI 說明請見 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 📝 授權

本儲存庫內不同目錄適用不同授權，請以各目錄的 `LICENSE` 與下表為準（**並非**所有程式碼皆為 MIT）。

| 範圍 | 授權 |
|------|------|
| `docs/` 網站內容（Markdown 等） | [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [`pulse/`](pulse/) 程式碼 | [MIT](pulse/LICENSE) |
| [`asn_coverage/`](asn_coverage/) 程式碼 | [GPL-3.0](asn_coverage/LICENSE) |

- 根目錄 [`LICENSE`](LICENSE) 為 **CC-BY 4.0** 全文，作為文件與網站內容之預設授權標示。
- 根目錄 [`LICENSE-asn_coverage`](LICENSE-asn_coverage) 為 **`asn_coverage` 子專案 GPL-3.0** 全文之副本，便於在根目錄瀏覽；以 [`asn_coverage/LICENSE`](asn_coverage/LICENSE) 為準。

---

**Copyright © 2023-2026 Anoni.net Docs Project**

---

# Anoni.net Documentation

> Promoting and translating Tor, Tails, and OONI measurement tools for anonymous networks

This project is the core documentation system for the "Anonymous Network Community Anoni.net", dedicated to promoting internet freedom and privacy protection tools. The project includes a multilingual documentation website, a Tor relay monitoring system, and OONI measurement data analysis tools.

## 📚 Project Structure

```
anoni-net-docs/
├── docs/           # MkDocs multilingual documentation site (zh-TW, zh-CN, en)
├── pulse/          # Tor relay monitoring system (FastAPI + PostgreSQL)
└── asn_coverage/   # OONI measurement data and ASN coverage analysis tool
```

### 1. Docs - Documentation Website

A multilingual documentation system based on [MkDocs Material](https://squidfunk.github.io/mkdocs-material/), providing Traditional Chinese, Simplified Chinese, and English versions.

**Main Content:**
- Tor, Tails, and OONI tutorials and translated documentation
- Community activity information and workshop content
- Internet censorship observation reports
- Guides for project participation

**Technical Features:**
- Multilingual support (zh-TW / zh-CN / en)
- Built-in blog system with RSS feed
- Vega-Lite data visualization charts
- Support for standard web, IPFS, and Tor Onion deployment

### 2. Pulse - Tor Relay Monitoring System

A system for real-time monitoring and statistics of Tor network relay data, providing APIs for frontend queries and visualization.

**Key Features:**
- Periodically collect Tor relay data from specified countries (TW, JP, KR, HK)
- PostgreSQL database for historical records
- FastAPI REST API with Vega-Lite chart endpoints
- One-click deployment with Docker Compose

**Technical Stack:**
- Backend: Python 3.12+ / FastAPI / psycopg 3
- Database: PostgreSQL 17
- Scheduler: Alpine crond
- Deployment: Docker + Docker Compose

### 3. ASN Coverage - OONI Coverage Analysis

Analyze OONI measurement data coverage across regional ASNs to help identify measurement blind spots.

**Data Source:**
- OONI AWS S3 public dataset (`ooni-data-eu-fra`)
- Support for historical data lookback and specified time range analysis

**Main Features:**
- Statistics on OONI measurements per ASN
- Multi-threaded parallel download and processing
- Output analysis reports in CSV format

## 🚀 Quick Start

### Requirements

- **Python**: 3.12+
- **Package Manager**: [uv](https://github.com/astral-sh/uv)
- **Docker**: For Pulse system deployment (optional)

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
mkdocs serve  # Default: zh-TW version
```

Open browser and visit `http://127.0.0.1:8000`

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

## 📖 Documentation & Resources

- **Online Documentation**: [https://anoni.net/docs/](https://anoni.net/docs/)
- **GitHub Repo**: [https://github.com/anoni-net/docs](https://github.com/anoni-net/docs)
- **Tor Onion**: `docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion`
- **Detailed Development Guide**: See [CLAUDE.md](./CLAUDE.md)

## 🤝 Contributing

We welcome contributions of all kinds. See [CONTRIBUTING.md](./CONTRIBUTING.md) for workflow, branches, and CI.

## 📝 License

This repository contains multiple licenses. Use the table below and each subdirectory’s `LICENSE` file (**not** all code is MIT).

| Scope | License |
|-------|---------|
| `docs/` site content (Markdown, etc.) | [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [`pulse/`](pulse/) code | [MIT](pulse/LICENSE) |
| [`asn_coverage/`](asn_coverage/) code | [GPL-3.0](asn_coverage/LICENSE) |

- The root [`LICENSE`](LICENSE) file is the full **CC-BY 4.0** text used as the default license notice for documentation and site content.
- Root [`LICENSE-asn_coverage`](LICENSE-asn_coverage) is a **duplicate copy** of the GPL-3.0 text for `asn_coverage`; [`asn_coverage/LICENSE`](asn_coverage/LICENSE) is authoritative.

---

**Copyright © 2023-2026 Anoni.net Docs Project**
