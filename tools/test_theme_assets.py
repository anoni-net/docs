#!/usr/bin/env python3
"""check_theme_assets.py 的測試，外加 repo 本身的資產版本一致性。

守的是兩件事。一件是那支檢查腳本的判斷邏輯：漏判會讓壞掉的產物過關，誤判會擋住
沒問題的 PR，兩個方向都要有案例。另一件更直接，最後一個測試拿真實的 docs/uv.lock
與 docs/overrides/base.html 比對，PR 只要升級了 mkdocs-material 而沒回來換資產雜湊，
這支就會紅燈。那正是 2026-08-24 #338 漏掉的檢查，代價是線上三個語系同時掉樣式。

不碰網路，不需要建置產物。
"""

from __future__ import annotations

import pathlib
import sys
import tempfile

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

from check_theme_assets import (  # noqa: E402
    locked_version,
    missing_assets,
    recorded_version,
)

failures: list[str] = []


def check(label: str, got, want) -> None:
    if got != want:
        failures.append(f"{label}\n    got:  {got!r}\n    want: {want!r}")


LOCK_SAMPLE = """
version = 1

[[package]]
name = "mkdocs"
version = "1.6.1"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "mkdocs-material"
version = "9.7.7"
source = { registry = "https://pypi.org/simple" }
"""


def test_locked_version() -> None:
    with tempfile.TemporaryDirectory() as td:
        lock = pathlib.Path(td) / "uv.lock"
        lock.write_text(LOCK_SAMPLE, encoding="utf-8")
        check("locked_version", locked_version(lock), "9.7.7")

        # 套件被移掉時回 None 而不是丟例外，呼叫端才有機會印出人看得懂的訊息
        lock.write_text('version = 1\n\n[[package]]\nname = "mkdocs"\nversion = "1.6.1"\n', encoding="utf-8")
        check("locked_version 缺套件", locked_version(lock), None)


def test_recorded_version() -> None:
    with tempfile.TemporaryDirectory() as td:
        base = pathlib.Path(td) / "base.html"
        base.write_text(
            "{#-\n  theme-assets-from: mkdocs-material 9.7.7\n-#}\n<html></html>\n",
            encoding="utf-8",
        )
        check("recorded_version", recorded_version(base), "9.7.7")

        # 標記被刪掉時回 None，檢查腳本會要求補回來而不是默默放行
        base.write_text("<html></html>\n", encoding="utf-8")
        check("recorded_version 無標記", recorded_version(base), None)


PAGE = """<!doctype html>
<html><head>
<link rel="stylesheet" href="{css}">
<link rel="stylesheet" href="https://fonts.example.com/css?family=X">
<link rel="canonical" href="//cdn.example.com/assets/x.css">
</head><body>
<a href="community/brand-assets/">品牌資產</a>
<img src="assets/images/logo-white.svg?v=2">
<script src="{js}"></script>
</body></html>
"""


def build_output(root: pathlib.Path, *, drop: str | None = None) -> None:
    """造一份三語系的假產物。drop 指定的檔案不建立，用來模擬雜湊沒同步。"""
    files = [
        "assets/stylesheets/main.ec1eaa64.min.css",
        "assets/javascripts/bundle.d7400e89.min.js",
        "assets/images/logo-white.svg",
        "en/assets/stylesheets/main.ec1eaa64.min.css",
        "en/assets/javascripts/bundle.d7400e89.min.js",
        "en/assets/images/logo-white.svg",
        "zh-cn/assets/stylesheets/main.ec1eaa64.min.css",
        "zh-cn/assets/javascripts/bundle.d7400e89.min.js",
        "zh-cn/assets/images/logo-white.svg",
    ]
    for rel in files:
        if rel == drop:
            continue
        path = root / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("x", encoding="utf-8")
    for lang in ["", "en", "zh-cn"]:
        page = root / lang / "index.html" if lang else root / "index.html"
        page.parent.mkdir(parents=True, exist_ok=True)
        page.write_text(
            PAGE.format(
                css="assets/stylesheets/main.ec1eaa64.min.css",
                js="assets/javascripts/bundle.d7400e89.min.js",
            ),
            encoding="utf-8",
        )


def test_missing_assets_all_present() -> None:
    with tempfile.TemporaryDirectory() as td:
        root = pathlib.Path(td)
        build_output(root)
        # 外部網址、協定相對網址與 community/brand-assets/ 那種頁面連結都不該被算進來，
        # 誤判會擋住沒問題的 PR。帶 ?v=2 的圖也要能對到檔案。
        check("產物齊全", missing_assets(root), [])


def test_missing_assets_detects_stale_hash() -> None:
    with tempfile.TemporaryDirectory() as td:
        root = pathlib.Path(td)
        build_output(root, drop="en/assets/stylesheets/main.ec1eaa64.min.css")
        missing = missing_assets(root)
        check("只抓到 en 那一份", len(missing), 1)
        if missing:
            page, ref, _ = missing[0]
            check("回報的語系", pathlib.Path(page).parent.name, "en")
            check("回報的網址", ref, "assets/stylesheets/main.ec1eaa64.min.css")


def test_missing_assets_reports_absent_page() -> None:
    with tempfile.TemporaryDirectory() as td:
        root = pathlib.Path(td)
        build_output(root)
        (root / "zh-cn" / "index.html").unlink()
        missing = missing_assets(root)
        check("少一個語系首頁", len(missing), 1)


def test_repo_versions_match() -> None:
    """真實檔案的一致性。升級 mkdocs-material 而沒換資產雜湊時，這裡紅燈。"""
    locked = locked_version()
    recorded = recorded_version()
    if locked is None:
        failures.append("docs/uv.lock 裡找不到 mkdocs-material")
        return
    if recorded is None:
        failures.append("docs/overrides/base.html 檔頭少了 theme-assets-from 標記")
        return
    if locked != recorded:
        failures.append(
            f"mkdocs-material 鎖在 {locked}，base.html 的資產雜湊記的是 {recorded}。"
            " 改版後雜湊會變，部署會讓線上的 HTML 指向 404。"
            " 詳細的修法見 tools/check_theme_assets.py 的檔頭。"
        )


def main() -> int:
    for fn in [
        test_locked_version,
        test_recorded_version,
        test_missing_assets_all_present,
        test_missing_assets_detects_stale_hash,
        test_missing_assets_reports_absent_page,
        test_repo_versions_match,
    ]:
        fn()
    if failures:
        print(f"FAILED ({len(failures)})")
        for f in failures:
            print("  " + f)
        return 1
    print("theme assets tests passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
