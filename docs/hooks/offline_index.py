"""產生 `offline-index.json`：這個語系有哪些頁面、屬於哪個章節、多大。

離線內容管理頁（`offline.md`）用它列出可勾選的清單，讀者自己決定要把哪些頁面
留在裝置上。沒有這份索引的話，管理頁就只能顯示 service worker 那三份硬編清單，
而那些清單刻意排除了身分敏感的頁面，讀者反而拿不到那幾頁。

排除的判準寫在 `docs/zh-TW/sw.js` 的 `CORE_PAGES_ZH` 上方：指導單一受威脅身分的
頁面不進預設下載，因為 Cache Storage 裡躺著那些頁面本身就是指向性證據。這份索引
不重複那條判準，它列出全部頁面，「預設下載了哪些」由 service worker 回答，管理頁
把兩邊疊起來呈現。網站不替讀者決定，讀者自己知情選擇。

三語系是三次獨立的 mkdocs 執行，各自產出自己那一份，寫進各自的 site_dir 根目錄。

`bytes` 是渲染後 HTML 的位元組數，不含圖片與 CSS/JS。實際下載時抓的也只有 HTML，
圖片維持原本的行為（讀者實際瀏覽過才會留在裝置上），所以這個數字跟真正會增加的
量是對得起來的。
"""

import json
import logging
import posixpath
import re
from collections import Counter
from pathlib import Path

log = logging.getLogger("mkdocs.hooks.offline_index")

# 頁面自己引用的資產。存離線副本時只抓 HTML 的話，讀者離線打開會缺圖，而互動類的
# 頁面（小工具）連跑都跑不起來，它的程式與資料就在這裡面。
#
# 抓 <img> 與 <script>。theme 的 CSS 與 JS 不列，那批 app shell 已經在預快取裡。
_ASSET_PATTERNS = (
    re.compile(r'<img[^>]+src="([^"]+)"'),
    re.compile(r'<script[^>]+src="([^"]+)"'),
)
_ASSET_SKIP_PREFIXES = ("assets/javascripts/", "assets/stylesheets/")

# 頁面用得到但沒寫在 HTML 標籤裡的東西（例如小工具在 JS 裡 fetch 的字典），
# 由該頁的 frontmatter 自己宣告：
#
#     ---
#     offline_assets:
#       - utils/asian-diceware-7776.txt
#     ---
_ASSET_META_KEY = "offline_assets"


def _page_assets(html, url, meta):
    """這一頁引用到的站內資產，回相對於該語系建置根目錄的路徑。"""
    found = set()
    for pattern in _ASSET_PATTERNS:
        for raw in pattern.findall(html):
            if raw.startswith(("http://", "https://", "//", "data:")):
                continue
            path = posixpath.normpath(posixpath.join(url, raw)).lstrip("/")
            if path.startswith(_ASSET_SKIP_PREFIXES):
                continue
            found.add(path)
    for declared in (meta or {}).get(_ASSET_META_KEY, []) or []:
        found.add(str(declared).lstrip("/"))
    return sorted(found)

OUTPUT_NAME = "offline-index.json"

# 不列進管理頁的頁面。管理頁自己與 404 沒有離線留存的意義。
SKIP_URLS = {"offline/", "404.html", "tags/"}

# blog plugin 生成的聚合頁：分頁、年份彙整、分類索引。內容都在個別文章裡，
# 讓讀者勾這些只會下載到一堆重複的摘要。
SKIP_SEGMENTS = ("/page/", "/archive/", "/category/")

# 收集在模組層級。mkdocs 一次執行只建一個語系，三語系是三個 process，不會互相污染。
_pages = []
# nav 樹走過一遍得到的章節順序。管理頁照這個排，讀者在側邊欄看到什麼順序，
# 在這裡就看到什麼順序。
_order = []


def _nav_path(page):
    """這一頁在 nav 上的章節路徑，由外而內。不在 nav 裡的頁面回空 list。"""
    node = getattr(page, "parent", None)
    path = []
    while node is not None:
        title = getattr(node, "title", None)
        if title:
            path.append(title)
        node = getattr(node, "parent", None)
    path.reverse()
    return path


def _nav_titles(page):
    """回傳 (頂層章節, 第二層章節)。

    nav 最深有三層（指南 > 工具 > 連線層：Tor 工具家族）。管理頁只取到第二層，
    第三層的頁面併回它所屬的第二層章節。全展開會變成三十組，其中好幾組只有兩三頁，
    那份清單比現在更難看起。取兩層之後對得上側邊欄折起來時的樣子。
    """
    path = _nav_path(page)
    if not path:
        return None, None
    return path[0], (path[1] if len(path) > 1 else path[0])


def _key(group, section):
    return (group or "") + "|" + (section or "")


def on_nav(nav, config, **kwargs):
    """記下 nav 的章節順序。

    不能靠頁面被處理的先後：mkdocs 是照檔案路徑的字母序跑 on_post_page，那個順序
    跟讀者在側邊欄看到的完全對不上（「進階」會排在「概念」前面，零星的單頁散在
    中間）。這裡走一次 nav 樹，拿到的才是側邊欄的順序。
    """
    _order.clear()

    def walk(items, path):
        for item in items:
            if getattr(item, "is_section", False):
                walk(item.children, path + [item.title])
            elif getattr(item, "is_page", False):
                key = _key(path[0] if path else None, path[1] if len(path) > 1 else (path[0] if path else None))
                if key not in _order:
                    _order.append(key)

    walk(nav.items, [])


def on_post_page(output, page, config, **kwargs):
    url = page.url
    if url in SKIP_URLS:
        return output
    if any(segment in "/" + url for segment in SKIP_SEGMENTS):
        return output
    group, section = _nav_titles(page)
    _pages.append(
        {
            "url": url,
            "title": page.title,
            "group": group,
            "section": section,
            "bytes": len(output.encode("utf-8")),
            # 資產等 on_post_build 再從寫出來的 HTML 解析，理由見 _collect_assets
            "meta": dict(getattr(page, "meta", None) or {}),
        }
    )
    return output


def _collect_assets(site_dir):
    """從建置產物解析每一頁引用的資產。

    不在 on_post_page 做，因為那時看到的還不是最終的 HTML。material 的 privacy
    外掛會把外部圖片下載到本地再改寫網址，而它跑在這支之後，所以那個階段看到的
    `assets/external/...` 還是原本的 https://github.com/... ，會被當成外部網址濾掉。
    實測有兩張圖就是這樣漏掉的。改讀寫出來的檔案，看到的跟讀者拿到的是同一份。
    """
    for entry in _pages:
        target = site_dir / entry["url"] / "index.html"
        try:
            html = target.read_text(encoding="utf-8")
        except OSError:
            entry["assets"] = []
            continue
        entry["assets"] = _page_assets(html, entry["url"], entry["meta"])


def on_post_build(config, **kwargs):
    if not _pages:
        log.warning("offline_index: 沒有收集到任何頁面，不產生 %s", OUTPUT_NAME)
        return

    site_dir = Path(config["site_dir"])
    _collect_assets(site_dir)

    # 每頁都載入的東西不算在個別頁面頭上。目前是 mkdocs-charts-plugin 那組 Vega：
    # 每頁 808 KB，而真正畫圖表的只有三篇。那種東西跟頁面內容無關，讀者勾一頁就
    # 揹一份不合理。門檻取一半，只有真的全站共用才會落進來。
    counts = Counter()
    for entry in _pages:
        counts.update(entry["assets"])
    shared = {path for path, n in counts.items() if n > len(_pages) / 2}
    if shared:
        log.info(
            "offline_index: %d 個資產出現在過半頁面，不列進個別頁面（%s）",
            len(shared),
            "、".join(sorted(shared)[:3]),
        )

    def asset_size(path):
        try:
            return (site_dir / path).stat().st_size
        except OSError:
            # 建置產物裡找不到就當 0。少算大小總比讓整份索引產不出來好，
            # 真的漏了會在 check_precache.mjs 那邊現形。
            return 0

    # 依 nav 的章節分組。用 (頂層, 所屬章節) 當依據而不是 URL 的第一段：網站的
    # 「關於我們」底下是 about/、contact.md 與 help/ 三個不同目錄，照 URL 分會變成
    # 三組各一頁，散在清單裡不知道從何看起，而在側邊欄上它們本來就是同一節。
    groups = {}
    for entry in _pages:
        key = _key(entry["group"], entry["section"])
        group = groups.setdefault(
            key,
            {
                "key": key,
                "group": entry["group"] or "",
                "title": entry["section"] or "",
                "pages": [],
            },
        )
        assets = [path for path in entry["assets"] if path not in shared]
        group["pages"].append(
            {
                "url": entry["url"],
                "title": entry["title"],
                "bytes": entry["bytes"],
                "assets": assets,
                # 這一頁自己的資產加起來多大。同一張圖被多頁引用時各頁都會算一次，
                # 實際存下來只有一份，去重是管理頁的事（它才知道讀者勾了哪些）。
                "assetBytes": sum(asset_size(path) for path in assets),
            }
        )

    # nav 走過的先排。nav 上沒有的插回同一個頂層章節的尾巴，不要一律丟到最後：
    # blog 外掛的文章結構在 on_nav 之後才建，一律附在後面的話「近期公告」會離它的
    # 「資訊更新」隔著整個社群與活動參與，讀者不會知道那兩者是同一節。
    ordered = [groups.pop(key) for key in _order if key in groups]
    for group in groups.values():
        at = len(ordered)
        for index, existing in enumerate(ordered):
            if existing["group"] == group["group"]:
                at = index + 1
        ordered.insert(at, group)

    sections = []
    for group in ordered:
        sections.append(
            {
                "key": group["key"],
                # nav 上的名稱優先。整份索引就是側邊欄的投影，名稱不一致的話
                # 讀者得自己在兩邊之間對照。
                "title": group["title"] or group["group"] or group["pages"][0]["title"],
                "group": group["group"],
                "bytes": sum(page["bytes"] for page in group["pages"]),
                # 章節的資產大小去重，同一張圖在這一章出現幾次都只算一次
                "assetBytes": sum(
                    asset_size(path)
                    for path in {
                        asset for page in group["pages"] for asset in page["assets"]
                    }
                ),
                "pages": group["pages"],
            }
        )

    every_asset = {
        asset
        for section in sections
        for page in section["pages"]
        for asset in page["assets"]
    }
    index = {
        "lang": config["theme"]["language"],
        # 每個資產多大。管理頁要算的是「勾這幾頁實際會下載多少」，資產要先去重才
        # 知道，所以給一張全域的表。只有每頁的合計是不夠的：同一張圖被三頁引用時，
        # 管理頁沒有辦法從合計裡把它拆出來，只能估，而估出來會差到兩倍以上。
        "assets": {path: asset_size(path) for path in sorted(every_asset)},
        "sections": sections,
    }
    target = Path(config["site_dir"]) / OUTPUT_NAME
    target.write_text(
        json.dumps(index, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    total = sum(len(section["pages"]) for section in sections)
    log.info(
        "offline_index: %s 收錄 %d 頁、%d 個章節、%d 個資產（去重後 %.1f MB）",
        OUTPUT_NAME,
        total,
        len(sections),
        len(every_asset),
        sum(asset_size(path) for path in every_asset) / 1024 / 1024,
    )
    _pages.clear()
