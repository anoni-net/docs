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

import cf_purge  # noqa: E402
from cf_purge import BATCH_SIZE, batched, collect_urls, to_url, to_urls  # noqa: E402

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


def test_to_urls_covers_both_shapes() -> None:
    """index.html 有兩個網址指向同一份內容，只清一個另一個會留著舊的。

    2026-08-22 抽驗正式站時撞到：目錄式網址與新產物一致，檔案式的同一頁還是上一版，
    cf-cache-status 是 HIT。站內連結都是目錄式，所以平常看不出來。
    """
    import pathlib as _p
    check("首頁兩種形式", to_urls(_p.Path("index.html"), BASE),
          [f"{BASE}/", f"{BASE}/index.html"])
    check("一般頁面兩種形式", to_urls(_p.Path("basics/index.html"), BASE),
          [f"{BASE}/basics/", f"{BASE}/basics/index.html"])
    check("多層路徑", to_urls(_p.Path("zh-cn/utils/qrcode/index.html"), BASE),
          [f"{BASE}/zh-cn/utils/qrcode/", f"{BASE}/zh-cn/utils/qrcode/index.html"])
    # 不是 index.html 的只有一個網址，不能無中生有
    check("404.html 只有一個", to_urls(_p.Path("404.html"), BASE), [f"{BASE}/404.html"])
    check("靜態資產只有一個", to_urls(_p.Path("assets/x.css"), BASE), [f"{BASE}/assets/x.css"])
    # to_url 仍然回目錄式那一個，它是站內連結用的正規形式
    check("to_url 維持正規形式", to_url(_p.Path("basics/index.html"), BASE), f"{BASE}/basics/")


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
                # 每個 index.html 的檔案式網址是獨立的快取項目，見 to_urls
                f"{BASE}/index.html",
                f"{BASE}/basics/index.html",
                f"{BASE}/zh-cn/index.html",
                f"{BASE}/en/index.html",
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


# === 並行送出 ===
#
# 逐批循序呼叫時，四十幾批每批往返一秒多，光清快取就吃掉部署的五分之一。改成並行
# 之後，「錯一批就整支失敗」與「每一批都送到」這兩件事要有測試守著，不然清一半
# 也會是綠燈，而漏清的症狀是訪客看到舊內容，不會有人立刻發現。

def _fake_purge(sent, fail_on=()):
    import threading
    lock = threading.Lock()

    def fake(zone, token, urls, attempts=3):
        with lock:
            sent.append(tuple(urls))
        if urls[0] in fail_on:
            raise RuntimeError("boom")

    return fake


def _run(batches, fail_on=()):
    sent = []
    original = cf_purge.purge_batch
    cf_purge.purge_batch = _fake_purge(sent, fail_on)
    try:
        code = cf_purge.run_batches("z", "t", batches, sum(len(b) for b in batches), BASE)
    finally:
        cf_purge.purge_batch = original
    return code, sent


def test_run_batches_sends_every_batch() -> None:
    batches = [[f"{BASE}/p{i}/"] for i in range(50)]
    code, sent = _run(batches)
    check("全部成功時回 0", code, 0)
    check("每一批都送到", len(sent), 50)
    check("沒有漏件", sorted(x for c in sent for x in c),
          sorted(x for c in batches for x in c))


def test_run_batches_fails_when_any_batch_fails() -> None:
    batches = [[f"{BASE}/p{i}/"] for i in range(20)]
    code, sent = _run(batches, fail_on={f"{BASE}/p7/"})
    check("有一批失敗就回 1", code, 1)
    # 已經送出去的讓它跑完，中途硬停只會讓清除範圍更難講清楚
    check("其餘批次照樣送完", len(sent), 20)


def test_run_batches_empty() -> None:
    code, sent = _run([])
    check("沒有東西要清時回 0", code, 0)
    check("沒有呼叫", sent, [])


def main() -> int:
    for fn in [
        test_to_url,
        test_to_url_encodes_special_chars,
        test_to_urls_covers_both_shapes,
        test_collect_urls,
        test_batched,
        test_run_batches_sends_every_batch,
        test_run_batches_fails_when_any_batch_fails,
        test_run_batches_empty,
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
