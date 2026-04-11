# 貢獻指南 | Contributing

本儲存庫為單一 Git 專案，內含 **MkDocs 文件站**、**Pulse（Tor 中繼監控）**、**ASN Coverage（OONI 分析 CLI）** 三塊子專案。依你關心的範圍挑選目錄即可，不必一次熟悉全部。

## 專案與目錄

| 目錄 | 說明 | 新手最常動到 |
|------|------|----------------|
| [`docs/`](docs/) | 多語系文件站（MkDocs Material） | `docs/zh-TW/`、`zh-CN/`、`en/` 下的 Markdown；部落格在 `blog/posts/` |
| [`pulse/`](pulse/) | Tor 中繼資料收集、FastAPI、PostgreSQL、Docker Compose | `pulse/backend/`、`docker-compose.yml` |
| [`asn_coverage/`](asn_coverage/) | 從 OONI S3 下載並分析涵蓋率、RIPE ASN 列表等 CLI | `ooni.py`、`ripe.py` |

詳細開發指令（`uv`、Docker、API 端點）見 [CLAUDE.md](./CLAUDE.md)。

## 分支與 CI（精簡對照）

| 行為 | 說明 |
|------|------|
| **`main`** | 預設開發與合併目標分支。 |
| **Push 到 `docs` 分支** | 觸發 [`.github/workflows/build_docs.yml`](.github/workflows/build_docs.yml)：建置多語系文件並部署（需設定之 secrets）。 |
| **`asn_coverage` 相關 workflow** | [check-ripe.yml](.github/workflows/check-ripe.yml)、[lookback-ooni.yml](.github/workflows/lookback-ooni.yml)：**`push` 僅在 `main` 會跑**；`workflow_dispatch`（手動）與 `schedule`（排程）仍可使用。 |

若你的預設分支名稱不是 `main`，請以團隊約定為準，並同步調整 workflow 檔案中的 `branches:`。

## 建議貢獻流程

1. 搜尋或開 [GitHub Issues](https://github.com/anoni-net/docs/issues) 說明要改什麼（翻譯、錯字、功能、bug）。
2. Fork 本儲存庫，從 `main` 開分支（命名清楚即可，例如 `fix/docs-typo-zh-tw`）。
3. 只改與主題相關的檔案；大改動可開 **Draft PR** 先收集意見。
4. 送出 Pull Request；維護者會依時間回覆。

## 授權（貢獻前請知悉）

貢獻內容將依各目錄授權釋出，請勿假設「整個 repo 都是同一授權」：

| 範圍 | 授權 |
|------|------|
| `docs/` 網站內容 | [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `pulse/` 程式碼 | [MIT](pulse/LICENSE) |
| `asn_coverage/` 程式碼 | [GPL-3.0](asn_coverage/LICENSE) |

說明與根目錄 `LICENSE`、`LICENSE-asn_coverage` 的關係見 [README.md](./README.md)（〈授權〉一節）。

---

## English (short)

This monorepo contains the **docs site**, **Pulse**, and **asn_coverage** tools. See the table above for where to edit. Use [CLAUDE.md](./CLAUDE.md) for `uv`, Docker, and API details.

- **Branches / CI**: site build runs on pushes to the **`docs`** branch (`build_docs.yml`). **`asn_coverage` workflows** run on **`push` to `main` only** (manual and scheduled runs still available).  
- **Licensing**: docs content is **CC-BY 4.0**; **Pulse** code is **MIT**; **asn_coverage** code is **GPL-3.0**. See [README.md](./README.md).
