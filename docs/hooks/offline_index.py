"""產生 `offline-index.json`：這個語系有哪些頁面、屬於哪個章節、多大。

離線內容管理頁（`offline.md`）用它列出可勾選的清單，讀者自己決定要把哪些頁面
留在裝置上。沒有這份索引的話，管理頁就只能顯示 service worker 那三份硬編清單，
而那些清單刻意排除了身分敏感的頁面，讀者反而拿不到那幾頁。

排除的判準寫在 `docs/zh-TW/sw.js` 的 `CORE_PAGES_ZH` 上方：指導單一受威脅身分的
頁面不進預設下載，因為 Cache Storage 裡躺著那些頁面本身就是指向性證據。這份索引
不重複那條判準，它列出全部頁面，「預設下載了哪些」由 service worker 回答，管理頁
把兩邊疊起來呈現。站台不替讀者決定，讀者自己知情選擇。

三語系是三次獨立的 mkdocs 執行，各自產出自己那一份，寫進各自的 site_dir 根目錄。

`bytes` 是渲染後 HTML 的位元組數，不含圖片與 CSS/JS。實際下載時抓的也只有 HTML，
圖片維持原本的行為（讀者實際瀏覽過才會留在裝置上），所以這個數字跟真正會增加的
量是對得起來的。
"""

import json
import logging
from pathlib import Path

log = logging.getLogger("mkdocs.hooks.offline_index")

OUTPUT_NAME = "offline-index.json"

# 不列進管理頁的頁面。管理頁自己與 404 沒有離線留存的意義。
SKIP_URLS = {"offline/", "404.html", "tags/"}

# blog plugin 生成的聚合頁：分頁、年份彙整、分類索引。內容都在個別文章裡，
# 讓讀者勾這些只會下載到一堆重複的摘要。
SKIP_SEGMENTS = ("/page/", "/archive/", "/category/")

# 收集在模組層級。mkdocs 一次執行只建一個語系，三語系是三個 process，不會互相污染。
_pages = []


def _top_section(page):
    """走到 nav 的頂層章節，回傳它的標題。不在 nav 裡的頁面回 None。"""
    node = getattr(page, "parent", None)
    if node is None:
        return None
    while getattr(node, "parent", None) is not None:
        node = node.parent
    return getattr(node, "title", None)


def on_post_page(output, page, config, **kwargs):
    url = page.url
    if url in SKIP_URLS:
        return output
    if any(segment in "/" + url for segment in SKIP_SEGMENTS):
        return output
    _pages.append(
        {
            "url": url,
            "title": page.title,
            "section": _top_section(page),
            # URL 第一段。章節的 index 頁（tools/）與底下的內容（tools/x/）要落在
            # 同一組，所以先去掉結尾的斜線再切。首頁的 url 是空字串，自成一組。
            # 這個 key 在三個語系之間是穩定的，不受翻譯影響。
            "key": url.rstrip("/").split("/")[0],
            "bytes": len(output.encode("utf-8")),
        }
    )
    return output


def on_post_build(config, **kwargs):
    if not _pages:
        log.warning("offline_index: 沒有收集到任何頁面，不產生 %s", OUTPUT_NAME)
        return

    # 依 key 分組，保留第一次出現的順序，也就是 nav 的順序
    groups = {}
    for entry in _pages:
        group = groups.setdefault(
            entry["key"],
            {"key": entry["key"], "title": None, "nav_title": None, "pages": []},
        )
        # 章節的 index 頁標題最貼切。nav 的頂層標題在這個站分不出組（tools、
        # basics、scenarios 在 nav 上都掛在「指南」底下），只當備援。
        if entry["url"].rstrip("/") == entry["key"]:
            group["title"] = entry["title"]
        if group["nav_title"] is None and entry["section"]:
            group["nav_title"] = entry["section"]
        group["pages"].append(
            {"url": entry["url"], "title": entry["title"], "bytes": entry["bytes"]}
        )

    sections = []
    for group in groups.values():
        sections.append(
            {
                "key": group["key"],
                # index 頁、nav 標題、key 依序當備援，管理頁至少還分得出組
                "title": group["title"] or group["nav_title"] or group["key"] or "",
                "bytes": sum(page["bytes"] for page in group["pages"]),
                "pages": group["pages"],
            }
        )

    index = {
        "lang": config["theme"]["language"],
        "sections": sections,
    }
    target = Path(config["site_dir"]) / OUTPUT_NAME
    target.write_text(
        json.dumps(index, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    total = sum(len(section["pages"]) for section in sections)
    log.info(
        "offline_index: %s 收錄 %d 頁、%d 個章節", OUTPUT_NAME, total, len(sections)
    )
    _pages.clear()
