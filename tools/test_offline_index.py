#!/usr/bin/env python3
"""offline_index hook 的回歸測試。

這支 hook 決定「離線內容管理頁上列出哪些東西、照什麼順序」。錯了不會讓建置變紅燈：
漏掉章節就是讀者在管理頁上找不到那些頁面（而管理頁存在的理由正是讓讀者拿到預設
不下載的那幾頁），順序亂掉則是整份清單跟側邊欄對不起來，打開不知道從何看起。

分組與排序規則改動時，請一併在這裡補上對應案例。不跑 mkdocs，只測純邏輯。
"""

from __future__ import annotations

import json
import logging
import pathlib
import sys
import tempfile

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "docs" / "hooks"))

import offline_index  # noqa: E402

# 「沒有任何頁面」是其中一項要驗的行為，它會 log 一則 warning。這裡壓下去，
# 免得正常跑完的輸出裡混著看起來像錯誤的訊息。
logging.getLogger("mkdocs.hooks.offline_index").setLevel(logging.ERROR)

failures: list[str] = []


def check(label: str, got, want) -> None:
    if got != want:
        failures.append(f"{label}\n    got:  {got!r}\n    want: {want!r}")


class FakePage:
    is_section = False
    is_page = True

    def __init__(self, url, title, meta=None):
        self.url = url
        self.title = title
        self.parent = None
        self.meta = meta or {}


class FakeSection:
    is_section = True
    is_page = False

    def __init__(self, title, children):
        self.title = title
        self.children = list(children)
        self.parent = None
        for child in self.children:
            child.parent = self


class FakeNav:
    def __init__(self, items):
        self.items = list(items)


def build(nav, pages, html="x", files=None):
    """跑一輪 hook，回傳寫出來的 JSON。

    pages 是 mkdocs 實際處理頁面的順序，跟 nav 的順序不同（mkdocs 照檔案路徑的
    字母序跑），測試刻意傳打亂的順序，驗輸出仍照 nav。

    html 可以是字串（所有頁面共用）或 {url: html}。files 是要在假的 site_dir 裡
    造出來的檔案 {路徑: 大小}，hook 靠它算資產大小。
    """
    offline_index._pages.clear()
    offline_index._order.clear()
    offline_index.on_nav(nav, None)
    for page in pages:
        body = html.get(page.url, "x") if isinstance(html, dict) else html
        offline_index.on_post_page(body, page, None)
    with tempfile.TemporaryDirectory() as tmp:
        for path, size in (files or {}).items():
            target = pathlib.Path(tmp) / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(b"x" * size)
        # 資產從建置產物解析，所以每一頁的 HTML 也要真的寫出來
        for page in pages:
            body = html.get(page.url, "x") if isinstance(html, dict) else html
            target = pathlib.Path(tmp) / page.url / "index.html"
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(body, encoding="utf-8")
        offline_index.on_post_build({"site_dir": tmp, "theme": {"language": "zh-TW"}})
        target = pathlib.Path(tmp) / offline_index.OUTPUT_NAME
        return json.loads(target.read_text(encoding="utf-8")) if target.exists() else None


def titles(index):
    return [(s["group"], s["title"], len(s["pages"])) for s in index["sections"]]


# --- 順序照 nav，不是照頁面被處理的先後 ---

home = FakePage("", "首頁")
guides_index = FakePage("guides/", "指南")
basics_index = FakePage("basics/", "概念層")
basics_page = FakePage("basics/metadata/", "Metadata")
tools_index = FakePage("tools/", "工具層")
tools_deep = FakePage("tools/what-is-tor/", "什麼是 Tor")
about = FakePage("about/", "關於我們")
contact = FakePage("contact/", "持續關注")

nav = FakeNav([
    home,
    FakeSection("指南", [
        guides_index,
        FakeSection("概念", [basics_index, basics_page]),
        # 第三層：nav 上「工具」底下還有「連線層」這種子分組
        FakeSection("工具", [tools_index, FakeSection("連線層", [tools_deep])]),
    ]),
    FakeSection("關於我們", [about, contact]),
])

# 刻意用字母序餵進去，那是 mkdocs 實際的處理順序
index = build(nav, [about, basics_index, basics_page, contact, guides_index, home, tools_index, tools_deep])
check(
    "順序照 nav 而不是字母序",
    titles(index),
    [("", "首頁", 1), ("指南", "指南", 1), ("指南", "概念", 2), ("指南", "工具", 2), ("關於我們", "關於我們", 2)],
)

# 第三層的頁面併回第二層。全展開會變成三十組，其中好幾組只有兩三頁。
check("第三層併回第二層", [p["url"] for p in index["sections"][3]["pages"]], ["tools/", "tools/what-is-tor/"])

# 網站的「關於我們」底下是 about/ 與 contact.md 兩個不同目錄，照 URL 分會變成
# 兩組各一頁，在側邊欄上它們本來就是同一節
check("同一節的不同目錄合併", len(index["sections"][4]["pages"]), 2)

# --- nav 上沒有的插回同一個頂層的尾巴 ---

posts_index = FakePage("blog/", "資訊更新")
changelog = FakePage("changelog/", "軟體更新日誌")
community = FakePage("community/", "社群")
# blog 外掛的文章在 on_nav 之後才進 nav，hook 走 nav 時看不到
article = FakePage("blog/2026/04/x/", "某篇文章")
article.parent = FakeSection("近期公告", [])
article.parent.parent = FakeSection("資訊更新", [])

nav2 = FakeNav([
    FakeSection("資訊更新", [posts_index, FakeSection("軟體更新日誌", [changelog])]),
    FakeSection("社群", [community]),
])
index2 = build(nav2, [article, changelog, community, posts_index])
# 一律附在最後的話，「近期公告」會離它的「資訊更新」隔著整個社群
check(
    "nav 上沒有的插回同一個頂層的尾巴",
    titles(index2),
    [("資訊更新", "資訊更新", 1), ("資訊更新", "軟體更新日誌", 1), ("資訊更新", "近期公告", 1), ("社群", "社群", 1)],
)

# --- 排除 ---

post = FakePage("blog/2026/04/x/", "某篇文章")
section = FakeSection("資訊更新", [post])
skipped = [
    FakePage("blog/page/2/", "第 2 頁"),
    FakePage("blog/archive/2025/", "2025 年"),
    FakePage("blog/category/updates/", "更新"),
    FakePage("offline/", "離線閱讀"),
    FakePage("404.html", "找不到"),
]
for page in skipped:
    page.parent = section
index3 = build(FakeNav([section]), [post] + skipped)
# 聚合頁的內容都在個別文章裡，讓讀者勾只會下載到一堆重複的摘要
check("只留真正的文章", [p["url"] for p in index3["sections"][0]["pages"]], ["blog/2026/04/x/"])
check("管理頁與 404 不列", len(index3["sections"]), 1)

# --- 大小 ---

a = FakePage("tools/", "工具層")
b = FakePage("tools/x/", "某頁")
index4 = build(FakeNav([FakeSection("工具", [a, b])]), [a, b], html="12345")
check("章節大小是頁面加總", index4["sections"][0]["bytes"], 10)
check("單頁大小是 HTML 位元組數", index4["sections"][0]["pages"][0]["bytes"], 5)

# 中文是多位元組，算的要是位元組不是字元數
c = FakePage("tools/", "工具層")
index5 = build(FakeNav([FakeSection("工具", [c])]), [c], html="中文")
check("中文算位元組", index5["sections"][0]["bytes"], 6)

# --- 不在 nav 裡的頁面 ---

orphan = FakePage("strays/x/", "孤兒頁")
index6 = build(FakeNav([]), [orphan])
# 標題退回頁面自己的標題，至少列得出來
check("不在 nav 裡的頁面照樣收錄", titles(index6), [("", "孤兒頁", 1)])

# --- 全空 ---

check("沒有任何頁面時不產生檔案", build(FakeNav([]), []), None)

# --- 語系 ---

d = FakePage("tools/", "Tools")
offline_index._pages.clear()
offline_index._order.clear()
offline_index.on_nav(FakeNav([FakeSection("Guides", [d])]), None)
offline_index.on_post_page("x", d, None)
with tempfile.TemporaryDirectory() as tmp:
    offline_index.on_post_build({"site_dir": tmp, "theme": {"language": "en"}})
    written = json.loads((pathlib.Path(tmp) / offline_index.OUTPUT_NAME).read_text(encoding="utf-8"))
check("帶上語系", written["lang"], "en")


# --- 頁面自己引用的資產 ---
#
# 存離線副本只抓 HTML 的話，讀者離線打開會缺圖，而互動類的頁面（小工具）連跑都
# 跑不起來，它的程式與資料就在這些資產裡。

parsed = offline_index._page_assets(
    '<img src="../../assets/images/a.webp">'
    '<script src="../js/tool.js"></script>'
    '<script src="../../assets/javascripts/bundle.min.js"></script>'
    '<img src="https://example.com/x.png">'
    '<img src="data:image/png;base64,AAAA">',
    "tools/what-is-tor/",
    None,
)
# 相對路徑正規化成相對建置根目錄，theme 的 app shell 與外部網址都不列
check("資產：解析並正規化", parsed, ["assets/images/a.webp", "tools/js/tool.js"])

# JS 裡 fetch 的東西不會出現在 HTML 標籤上，由該頁的 frontmatter 自己宣告
declared = offline_index._page_assets(
    "<p>沒有任何標籤</p>",
    "utils/passphrase/",
    {"offline_assets": ["utils/asian-diceware-7776.txt"]},
)
check("資產：frontmatter 宣告得出來", declared, ["utils/asian-diceware-7776.txt"])

# 每頁都載入的東西不算在個別頁面頭上（實際案例是 mkdocs-charts-plugin 那組 Vega，
# 每頁 808 KB 而真正畫圖表的只有三篇）
shared_nav = FakeNav([FakePage("a/", "A"), FakePage("b/", "B"), FakePage("c/", "C")])
shared_pages = [FakePage("a/", "A"), FakePage("b/", "B"), FakePage("c/", "C")]
vega = '<script src="../vendor/vega.js"></script>'
index = build(
    shared_nav,
    shared_pages,
    html={
        "a/": vega + '<img src="../img/only-a.png">',
        "b/": vega,
        "c/": vega,
    },
    files={"vendor/vega.js": 800, "img/only-a.png": 100},
)
by_url = {p["url"]: p for s in index["sections"] for p in s["pages"]}
check("資產：過半頁面共用的不列進個別頁面", by_url["a/"]["assets"], ["img/only-a.png"])
check("資產：共用的那個誰也沒有", by_url["b/"]["assets"], [])
check("資產：大小從建置產物量", by_url["a/"]["assetBytes"], 100)

# 章節的資產大小要去重，同一張圖在這一章出現幾次都只算一次。
# 四頁裡兩頁共用，沒有超過「過半」那道門檻，所以不會被當成全站資產濾掉。
dup_nav = FakeNav(
    [FakeSection("章", [FakePage(u, u) for u in ("a/", "b/", "c/", "d/")])]
)
dup_pages = [FakePage(u, u) for u in ("a/", "b/", "c/", "d/")]
same = '<img src="../img/same.png">'
index = build(
    dup_nav,
    dup_pages,
    html={"a/": same, "b/": same, "c/": "x", "d/": "x"},
    files={"img/same.png": 500},
)
section = index["sections"][0]
check("資產：章節大小去重", section["assetBytes"], 500)
check("資產：索引給出全域大小表", index["assets"], {"img/same.png": 500})
check(
    "資產：頁面各自照列",
    [p["assetBytes"] for p in section["pages"]],
    [500, 500, 0, 0],
)


if __name__ == "__main__":
    if failures:
        print(f"✗ {len(failures)} 項失敗\n")
        for failure in failures:
            print("  " + failure)
        sys.exit(1)
    print("offline_index：全部通過")
