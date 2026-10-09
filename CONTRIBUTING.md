# 貢獻指南 | Contributing

本儲存庫是 **MkDocs 文件站**與支撐它的共用腳本 **tools**。Pulse（Tor 中繼監控）與 ASN Coverage（OONI 分析 CLI）在 2026-10 拆成獨立的 repo，分別是 [`anoni-net/pulse`](https://github.com/anoni-net/pulse) 與 [`anoni-net/asn-coverage`](https://github.com/anoni-net/asn-coverage)，那兩個工具的 issue 與 PR 請送到那邊。

## 專案與目錄

| 目錄 | 說明 | 新手最常動到 |
|------|------|----------------|
| [`docs/`](docs/) | 多語系文件站（MkDocs Material） | `docs/zh-TW/`、`zh-CN/`、`en/` 下的 Markdown，部落格在 `blog/posts/` |
| [`tools/`](tools/) | 共用腳本與 CI 檢查：編輯標準掃描、前端測試、資料產生、部署 | `docs_style_lint.py`，細節見 [`tools/README.md`](tools/README.md) |

詳細開發指令見 [AGENTS.md](./AGENTS.md)。用 AI 工具協助貢獻時，入口檔與角色分工見貢獻者百科的「AI 協作」一節。

## 分支與 CI（精簡對照）

| 行為 | 說明 |
|------|------|
| **`main`** | 預設開發與合併目標分支。 |
| **Push 到 `docs` 分支** | 觸發 [`.github/workflows/build_docs.yml`](.github/workflows/build_docs.yml)：建置多語系文件並部署（需設定之 secrets）。 |

若你的預設分支名稱不是 `main`，請以團隊約定為準，並同步調整 workflow 檔案中的 `branches:`。

## 建議貢獻流程

1. 搜尋或開 [GitHub Issue](https://github.com/anoni-net/docs/issues/new/choose) 說明要改什麼。新人可直接用 issue 表單分流：翻譯認領、內容提案、來源建議、文件錯誤。
2. Fork 本儲存庫，從 `main` 開分支（命名清楚即可，例如 `fix/docs-typo-zh-tw`）。
3. 只改與主題相關的檔案。大改動可開 **Draft PR** 先收集意見。
4. 送出 Pull Request，維護者會依時間回覆。

互動請遵循[行為準則](./CODE_OF_CONDUCT.md)。第一次參與的完整入門見[如何參與與認領主題](https://anoni.net/join/)。

## 授權（貢獻前請知悉）

貢獻內容將依各目錄授權釋出，請勿假設「整個 repo 都是同一授權」：

| 範圍 | 授權 |
|------|------|
| `docs/` 網站內容 | [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `tools/` 腳本與測試 | [MIT](tools/LICENSE)（不含 `tools/data/`，見 [`NOTICE`](./NOTICE)）|

說明與根目錄 `LICENSE` 的關係見 [README.md](./README.md)（〈授權〉一節）。

---

## English (short)

This repository contains the **docs site** and the shared **tools** scripts. Pulse and ASN Coverage moved to [`anoni-net/pulse`](https://github.com/anoni-net/pulse) and [`anoni-net/asn-coverage`](https://github.com/anoni-net/asn-coverage) in 2026-10; send issues and pull requests for those tools there. See the table above for where to edit, and [AGENTS.md](./AGENTS.md) for development commands. If you work with AI tools, see "Working with AI tools" in the contributor handbook for entry files and roles.

- **Branches / CI**: site build runs on pushes to the **`docs`** branch (`build_docs.yml`).
- **Licensing**: docs content is **CC-BY 4.0**; `tools/` code is **MIT** (`tools/data/` excluded, see [NOTICE](./NOTICE)). See [README.md](./README.md).
