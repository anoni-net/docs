# 匿名網路社群文件 | Anoni.net Docs

> 本目錄為 Anoni.net 多語系文件網站，推廣與翻譯 Tor、Tails、OONI 等匿名網路與觀測工具。

此為 MkDocs 驅動的文件子專案，提供繁體中文、簡體中文與英文三種語言版本。

## 主要內容

- Tor、Tails、OONI 教學與翻譯文件
- 社群活動資訊與工作坊內容
- 網路審查觀測報告
- 參與專案的指南

## 技術特點

- 多語系：zh-TW / zh-CN / en
- 主題：[MkDocs Material](https://squidfunk.github.io/mkdocs-material/)
- 部落格、RSS、Vega-Lite 圖表
- 三種部署：標準網站、IPFS、Tor Onion

## 本地開發

```bash
cd docs
uv sync
source .venv/bin/activate
mkdocs serve   # 預設 zh-TW
```

或使用腳本啟動不同語言版本：

```bash
sh run.sh          # zh-TW（預設）
sh run_zh-tw.sh    # zh-TW
sh run_zh-cn.sh    # zh-CN
sh run_en.sh       # en
```

開啟瀏覽器訪問 `http://127.0.0.1:8000`。

## 建置文件

```bash
sh build_docs_anoni.sh        # 標準版
sh build_docs_anoni_ipfs.sh   # IPFS 版
sh build_docs_anoni_onion.sh  # Onion 版
```

注意：`build_docs_anoni.sh` 與 `build_docs_anoni_onion.sh` 內含伺服器專用路徑，僅供特定部署環境使用。`replace_sitename_anoni_ipfs.sh` 會對產出與來源做 `sed -i` 修改，請僅在乾淨建置環境執行。

## 多語系架構

- 設定檔：`mkdocs.yml`、`mkdocs_en.yml`、`mkdocs_cn.yml`
- 內容目錄：`zh-TW/`、`zh-CN/`、`en/`

## 貢獻

- 直接編輯 `zh-TW/`、`zh-CN/`、`en/` 下的 Markdown
- 部落格文章：`{語言}/blog/posts/`
- 更多說明請見專案根目錄 [README](../README.md) 與 [CLAUDE.md](../CLAUDE.md)

## 資源連結

- 線上文件：[https://anoni.net/docs/](https://anoni.net/docs/)
- GitHub：[https://github.com/anoni-net/docs](https://github.com/anoni-net/docs)
- Tor Onion：`docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion`

## 授權

- 文件內容：CC-BY 4.0  
- Copyright 2023-2025 Anoni.net Docs Project

---

# Anoni.net Documentation

> This directory is the Anoni.net multilingual documentation site, promoting and translating Tor, Tails, OONI, and related anonymous network and measurement tools.

This is the MkDocs-driven documentation subproject, providing Traditional Chinese, Simplified Chinese, and English versions.

## Main Content

- Tor, Tails, and OONI tutorials and translated documentation
- Community activity information and workshop content
- Internet censorship observation reports
- Guides for project participation

## Technical Features

- Multilingual: zh-TW / zh-CN / en
- Theme: [MkDocs Material](https://squidfunk.github.io/mkdocs-material/)
- Blog, RSS, Vega-Lite charts
- Three deployment targets: standard web, IPFS, Tor Onion

## Local Development

```bash
cd docs
uv sync
source .venv/bin/activate
mkdocs serve   # Default: zh-TW
```

Or use scripts to serve a specific language:

```bash
sh run.sh          # zh-TW (default)
sh run_zh-tw.sh    # zh-TW
sh run_zh-cn.sh    # zh-CN
sh run_en.sh       # en
```

Open `http://127.0.0.1:8000` in your browser.

## Building the Docs

```bash
sh build_docs_anoni.sh        # Standard build
sh build_docs_anoni_ipfs.sh   # IPFS build
sh build_docs_anoni_onion.sh  # Onion build
```

Note: `build_docs_anoni.sh` and `build_docs_anoni_onion.sh` contain server-specific paths and are intended for a specific deployment environment only. `replace_sitename_anoni_ipfs.sh` modifies output and source with `sed -i`; run only in a clean build environment.

## Multilingual Structure

- Config: `mkdocs.yml`, `mkdocs_en.yml`, `mkdocs_cn.yml`
- Content directories: `zh-TW/`, `zh-CN/`, `en/`

## Contributing

- Edit Markdown under `zh-TW/`, `zh-CN/`, or `en/`
- Blog posts: `{lang}/blog/posts/`
- See the project root [README](../README.md) and [CLAUDE.md](../CLAUDE.md) for more.

## Links

- Online docs: [https://anoni.net/docs/](https://anoni.net/docs/)
- GitHub: [https://github.com/anoni-net/docs](https://github.com/anoni-net/docs)
- Tor Onion: `docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion`

## License

- Documentation content: CC-BY 4.0  
- Copyright 2023-2025 Anoni.net Docs Project
