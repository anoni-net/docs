#!/usr/bin/env python3
"""offline_index hook 的回歸測試。

這支 hook 決定「離線內容管理頁上列出哪些東西」。錯了不會讓建置變紅燈：漏掉章節
就是讀者在管理頁上找不到那些頁面（而管理頁存在的理由正是讓讀者拿到預設不下載的
那幾頁），多列聚合頁則是讓人下載到一堆重複的摘要，還把估算的大小灌水。

分組規則改動時，請一併在這裡補上對應案例。不跑 mkdocs，只測純邏輯。
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


class FakeSection:
    def __init__(self, title, parent=None):
        self.title = title
        self.parent = parent


class FakePage:
    def __init__(self, url, title, parent=None):
        self.url = url
        self.title = title
        self.parent = parent


def build(pages, html="x"):
    """把一串 (url, title, parent) 餵過 hook，回傳寫出來的 JSON。"""
    offline_index._pages.clear()
    for page in pages:
        offline_index.on_post_page(html, page, None)
    with tempfile.TemporaryDirectory() as tmp:
        config = {"site_dir": tmp, "theme": {"language": "zh-TW"}}
        offline_index.on_post_build(config)
        target = pathlib.Path(tmp) / offline_index.OUTPUT_NAME
        if not target.exists():
            return None
        return json.loads(target.read_text(encoding="utf-8"))


def keys_of(index):
    return [section["key"] for section in index["sections"]]


def section_by_key(index, key):
    for section in index["sections"]:
        if section["key"] == key:
            return section
    # 找不到時回一份空的而不是 None。分組壞掉時整個 key 會消失，直接取欄位會讓
    # 這支腳本崩在 TypeError 上，看不到是哪一項對不起來。
    return {"key": key, "title": None, "bytes": 0, "pages": []}


# --- 分組 key ---

index = build(
    [
        FakePage("", "首頁"),
        FakePage("about/", "關於我們"),
        FakePage("tools/", "工具層"),
        FakePage("tools/what-is-tor/", "什麼是 Tor"),
        FakePage("blog/2026/04/x/", "某篇文章"),
    ]
)
# 章節的 index 頁（tools/）與底下的內容（tools/x/）要落在同一組
check("key 分組", keys_of(index), ["", "about", "tools", "blog"])
check("index 頁與內容同組", len(section_by_key(index, "tools")["pages"]), 2)
check("首頁自成一組", len(section_by_key(index, "")["pages"]), 1)

# --- 章節標題 ---

# nav 的頂層標題在這個站分不出組（tools、basics、scenarios 都掛在「指南」底下），
# 所以標題優先取該章節 index 頁的標題
guides = FakeSection("指南")
index = build(
    [
        FakePage("tools/", "工具層", parent=guides),
        FakePage("tools/what-is-tor/", "什麼是 Tor", parent=guides),
        FakePage("basics/", "概念層", parent=guides),
    ]
)
check("章節標題取 index 頁", section_by_key(index, "tools")["title"], "工具層")
check("同一個 nav 標題也分得開", section_by_key(index, "basics")["title"], "概念層")

# 沒有 index 頁時退回 nav 的頂層標題
nested = FakeSection("在地脈絡", parent=None)
child = FakeSection("子章節", parent=nested)
index = build([FakePage("taiwan/pdpa-2025/", "個資法", parent=child)])
check("沒有 index 頁時用 nav 頂層標題", section_by_key(index, "taiwan")["title"], "在地脈絡")

# 兩者都沒有時退回 key，管理頁至少還分得出組
index = build([FakePage("reports/x/", "某份報告")])
check("都沒有時退回 key", section_by_key(index, "reports")["title"], "reports")

# --- 排除 ---

index = build(
    [
        FakePage("blog/2026/04/x/", "某篇文章"),
        FakePage("blog/page/2/", "第 2 頁"),
        FakePage("blog/archive/2025/", "2025 年"),
        FakePage("blog/category/updates/", "更新"),
        FakePage("offline/", "離線閱讀"),
        FakePage("404.html", "找不到"),
    ]
)
# 聚合頁的內容都在個別文章裡，讓讀者勾只會下載到一堆重複的摘要
check("只留真正的文章", [page["url"] for page in section_by_key(index, "blog")["pages"]], ["blog/2026/04/x/"])
check("管理頁與 404 不列", keys_of(index), ["blog"])

# --- 大小 ---

index = build([FakePage("tools/", "工具層"), FakePage("tools/x/", "某頁")], html="12345")
check("章節大小是頁面加總", section_by_key(index, "tools")["bytes"], 10)
check("單頁大小是 HTML 位元組數", section_by_key(index, "tools")["pages"][0]["bytes"], 5)

# 中文是多位元組，算的要是位元組不是字元數
index = build([FakePage("tools/", "工具層")], html="中文")
check("中文算位元組", section_by_key(index, "tools")["bytes"], 6)

# --- 全空 ---

check("沒有任何頁面時不產生檔案", build([]), None)

# --- 語系 ---

offline_index._pages.clear()
offline_index.on_post_page("x", FakePage("tools/", "Tools"), None)
with tempfile.TemporaryDirectory() as tmp:
    offline_index.on_post_build({"site_dir": tmp, "theme": {"language": "en"}})
    written = json.loads((pathlib.Path(tmp) / offline_index.OUTPUT_NAME).read_text(encoding="utf-8"))
check("帶上語系", written["lang"], "en")


if __name__ == "__main__":
    if failures:
        print(f"✗ {len(failures)} 項失敗\n")
        for failure in failures:
            print("  " + failure)
        sys.exit(1)
    print("offline_index：全部通過")
