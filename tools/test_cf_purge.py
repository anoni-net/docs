#!/usr/bin/env python3
"""cf_purge.py 的回歸測試。

這支腳本決定「部署後哪些網址會被清掉」，錯了不會有人立刻發現：漏清就是訪客看到
舊內容（2026-08-07 的 COSCUP 置頂公告就是這樣，部署成功但站上半天沒換），多清則
是把 zone 底下其他服務一起波及。兩種都不會讓建置變紅燈，只能靠測試守住。

映射規則改動時，請一併在這裡補上對應案例。不呼叫網路，只測純函式。
"""

from __future__ import annotations

import pathlib
import sys
import tempfile

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

from cf_purge import BATCH_SIZE, batched, collect_urls, to_url  # noqa: E402

BASE = "https://anoni.net/docs"

failures: list[str] = []


def check(label: str, got, want) -> None:
    if got != want:
        failures.append(f"{label}\n    got:  {got!r}\n    want: {want!r}")


def test_to_url() -> None:
    cases = [
        # 首頁的 index.html 收斂成網站根路徑，不是 /docs//
        ("index.html", f"{BASE}/"),
        # 一般頁面用目錄式網址，結尾要有斜線
        ("basics/index.html", f"{BASE}/basics/"),
        ("zh-cn/activity/coscup-2026/index.html", f"{BASE}/zh-cn/activity/coscup-2026/"),
        ("en/offline-install/index.html", f"{BASE}/en/offline-install/"),
        # 非 index 的 HTML 保留檔名
        ("404.html", f"{BASE}/404.html"),
        # 沒有 content hash、改了就必須清的那幾支
        ("stylesheets/extra.css", f"{BASE}/stylesheets/extra.css"),
        ("sw.js", f"{BASE}/sw.js"),
        ("sitemap.xml", f"{BASE}/sitemap.xml"),
        ("manifest.webmanifest", f"{BASE}/manifest.webmanifest"),
        # 一般資產
        ("assets/images/logo-tonal.svg", f"{BASE}/assets/images/logo-tonal.svg"),
    ]
    for rel, want in cases:
        check(f"to_url({rel})", to_url(pathlib.Path(rel), BASE), want)


def test_to_url_encodes_special_chars() -> None:
    # 檔名含空白或非 ASCII 時要送出百分比編碼的形式，否則清到的不是實際的快取 key
    check(
        "to_url(空白)",
        to_url(pathlib.Path("assets/a b.png"), BASE),
        f"{BASE}/assets/a%20b.png",
    )
    check(
        "to_url(中文)",
        to_url(pathlib.Path("assets/圖.png"), BASE),
        f"{BASE}/assets/%E5%9C%96.png",
    )
    check(
        "to_url(中文目錄頁)",
        to_url(pathlib.Path("測試/index.html"), BASE),
        f"{BASE}/%E6%B8%AC%E8%A9%A6/",
    )


def test_collect_urls() -> None:
    with tempfile.TemporaryDirectory() as td:
        root = pathlib.Path(td)
        for rel in [
            "index.html",
            "basics/index.html",
            "zh-cn/index.html",
            "en/index.html",
            "404.html",
            "stylesheets/extra.css",
            "assets/stylesheets/main.484c7ddc.min.css",
        ]:
            p = root / rel
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text("x", encoding="utf-8")
        # 空目錄不該產生網址
        (root / "emptydir").mkdir()

        urls = collect_urls(root, BASE)

        want = sorted(
            {
                BASE,  # 無結尾斜線的 301
                f"{BASE}/",
                f"{BASE}/basics/",
                f"{BASE}/zh-cn/",
                f"{BASE}/en/",
                f"{BASE}/404.html",
                f"{BASE}/stylesheets/extra.css",
                f"{BASE}/assets/stylesheets/main.484c7ddc.min.css",
            }
        )
        check("collect_urls", urls, want)

        # 只清 base 底下，不會外溢到 zone 的其他服務
        stray = [u for u in urls if not u.startswith(BASE)]
        check("collect_urls 不外溢", stray, [])

        # 結尾斜線的 base 應該得到同樣結果，不會出現 //
        check("collect_urls(base 帶斜線)", collect_urls(root, BASE + "/"), want)


def test_batched() -> None:
    items = [str(i) for i in range(70)]
    chunks = list(batched(items, BATCH_SIZE))
    check("batched 批數", len(chunks), 3)
    check("batched 每批上限", max(len(c) for c in chunks), BATCH_SIZE)
    check("batched 不漏件", [x for c in chunks for x in c], items)
    check("batched 空清單", list(batched([], BATCH_SIZE)), [])


def main() -> int:
    for fn in [
        test_to_url,
        test_to_url_encodes_special_chars,
        test_collect_urls,
        test_batched,
    ]:
        fn()
    if failures:
        print(f"FAILED ({len(failures)})")
        for f in failures:
            print("  " + f)
        return 1
    print("cf_purge tests passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
