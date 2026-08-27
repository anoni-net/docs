# 匿名網路社群文件 | anoni.net Docs

> 本目錄為 anoni.net 多語系文件網站，推廣與翻譯 Tor、Tails、OONI 等匿名網路與觀測工具。

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
- 社群分享卡：`layouts/anoni.yml`，三語系共用的自訂版型
- 三種部署：標準網站、IPFS、Tor Onion

## 本地開發

```bash
cd docs
uv sync
source .venv/bin/activate
mkdocs serve   # 預設 zh-TW
```

開啟瀏覽器訪問 `http://127.0.0.1:8000`。

要驗證三個語系，用 `run_*.sh` 建置到 `output/`。三支腳本各自 export 該語系需要的環境變數，直接執行 `mkdocs build -f mkdocs_en.yml` 會因為 `DOCS_DIR` 之類的變數落回預設值而產生假警報：

```bash
sh run.sh          # zh-TW（預設語系，建在根路徑）
sh run_zh-cn.sh    # zh-CN
sh run_en.sh       # en
```

## 建置文件

```bash
sh build_docs_anoni.sh        # 標準版
sh build_docs_anoni_ipfs.sh   # IPFS 版
sh build_docs_anoni_onion.sh  # Onion 版
```

注意：`build_docs_anoni.sh` 與 `build_docs_anoni_onion.sh` 內含伺服器專用路徑，僅供特定部署環境使用。`replace_sitename_anoni_ipfs.sh` 會對產出與來源做 `sed -i` 修改，請僅在乾淨建置環境執行。

## 本地建置排錯

### 圖表在本地是空白的，線上卻正常

先看頁面原始碼裡載入 vega-embed 的那行。壞掉時長這樣：

```
../../../../https:/cdn.jsdelivr.net/npm/vega-embed@6/build/vega-embed.min.js
```

正常時會指向本地副本：

```
../../../../assets/external/cdn.jsdelivr.net/npm/vega-embed@6/build/vega-embed.min.js
```

Material 的 privacy plugin 會把 `mkdocs.yml` 裡 `extra_javascript` 的 CDN 資源下載到 `.cache/plugin/privacy/`。當某個資源的 URL 從無子路徑改成有子路徑時，舊快取會擋住新的目錄：

```yaml
- https://cdn.jsdelivr.net/npm/vega-embed@6                          # 舊：快取存成一個檔案
- https://cdn.jsdelivr.net/npm/vega-embed@6/build/vega-embed.min.js  # 新：快取需要一個同名目錄
```

同名的舊檔案佔住路徑，目錄建不起來，下載落空，URL 也就沒被改寫成本地路徑，`https://` 被當成相對路徑接在頁面路徑後面。CI 每次都是乾淨 checkout，不會有舊快取，所以只有本地會壞。`mkdocs build` 的產出同樣會壞，不只是 `mkdocs serve`。

刪掉擋路的那一項後重建：

```bash
rm .cache/plugin/privacy/assets/external/cdn.jsdelivr.net/npm/vega-embed@6
```

不確定是哪一項時，整包刪掉重建也可以，代價是下次建置要重新下載：

```bash
rm -rf .cache/plugin/privacy
```

`.cache/` 已列入 `.gitignore`，屬於本地快取，刪掉不影響版本控制。往後任何 `extra_javascript` 的 CDN 網址改變路徑結構，都可能再遇到，處理方式相同。

## 多語系架構

- 設定檔：`mkdocs.yml`、`mkdocs_en.yml`、`mkdocs_cn.yml`
- 內容目錄：`zh-TW/`、`zh-CN/`、`en/`

## 貢獻

- 直接編輯 `zh-TW/`、`zh-CN/`、`en/` 下的 Markdown
- 部落格文章：`{語言}/blog/posts/`
- 更多說明請見 [CONTRIBUTING.md](../CONTRIBUTING.md)、專案根目錄 [README](../README.md) 與 [CLAUDE.md](../CLAUDE.md)

## 資源連結

- 線上文件：[https://anoni.net/docs/](https://anoni.net/docs/)
- GitHub：[https://github.com/anoni-net/docs](https://github.com/anoni-net/docs)
- Tor Onion：`docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion`

## 授權

- 文件內容：CC-BY 4.0  
- Copyright 2023-2026 anoni.net Docs Project

---

# anoni.net Documentation

> This directory is the anoni.net multilingual documentation site, promoting and translating Tor, Tails, OONI, and related anonymous network and measurement tools.

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

Open `http://127.0.0.1:8000` in your browser.

To verify all three locales, build into `output/` with the `run_*.sh` scripts. Each exports the environment variables that locale needs; running `mkdocs build -f mkdocs_en.yml` directly lets variables such as `DOCS_DIR` fall back to their defaults and raises spurious warnings:

```bash
sh run.sh          # zh-TW (default locale, built at the site root)
sh run_zh-cn.sh    # zh-CN
sh run_en.sh       # en
```

## Building the Docs

```bash
sh build_docs_anoni.sh        # Standard build
sh build_docs_anoni_ipfs.sh   # IPFS build
sh build_docs_anoni_onion.sh  # Onion build
```

Note: `build_docs_anoni.sh` and `build_docs_anoni_onion.sh` contain server-specific paths and are intended for a specific deployment environment only. `replace_sitename_anoni_ipfs.sh` modifies output and source with `sed -i`; run only in a clean build environment.

## Local Build Troubleshooting

### Charts are blank locally but fine in production

Check the script tag that loads vega-embed in the page source. When broken, it looks like this:

```
../../../../https:/cdn.jsdelivr.net/npm/vega-embed@6/build/vega-embed.min.js
```

When working, it points at the local copy:

```
../../../../assets/external/cdn.jsdelivr.net/npm/vega-embed@6/build/vega-embed.min.js
```

Material's privacy plugin downloads the CDN resources listed under `extra_javascript` in `mkdocs.yml` into `.cache/plugin/privacy/`. When a resource's URL changes from having no sub-path to having one, the stale cache entry blocks the new directory:

```yaml
- https://cdn.jsdelivr.net/npm/vega-embed@6                          # old: cached as a file
- https://cdn.jsdelivr.net/npm/vega-embed@6/build/vega-embed.min.js  # new: cache needs a directory of the same name
```

The old file occupies the path, the directory cannot be created, the download silently fails, and the URL is never rewritten to a local path, so `https://` gets appended to the page path as if it were relative. CI always starts from a clean checkout and has no stale cache, so only local builds break. This affects `mkdocs build` output as well, not just `mkdocs serve`.

Delete the blocking entry and rebuild:

```bash
rm .cache/plugin/privacy/assets/external/cdn.jsdelivr.net/npm/vega-embed@6
```

If you are not sure which entry is at fault, dropping the whole cache is safe. The cost is re-downloading on the next build:

```bash
rm -rf .cache/plugin/privacy
```

`.cache/` is already listed in `.gitignore`, so removing it has no effect on version control. Any future `extra_javascript` CDN URL that changes its path structure can hit the same issue, with the same fix.

## Multilingual Structure

- Config: `mkdocs.yml`, `mkdocs_en.yml`, `mkdocs_cn.yml`
- Content directories: `zh-TW/`, `zh-CN/`, `en/`

## Contributing

- Edit Markdown under `zh-TW/`, `zh-CN/`, or `en/`
- Blog posts: `{lang}/blog/posts/`
- See [CONTRIBUTING.md](../CONTRIBUTING.md), the project root [README](../README.md), and [CLAUDE.md](../CLAUDE.md) for more.

## Links

- Online docs: [https://anoni.net/docs/](https://anoni.net/docs/)
- GitHub: [https://github.com/anoni-net/docs](https://github.com/anoni-net/docs)
- Tor Onion: `docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion`

## License

- Documentation content: CC-BY 4.0  
- Copyright 2023-2026 anoni.net Docs Project
