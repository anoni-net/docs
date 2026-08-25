#!/usr/bin/env python3
"""檢查 theme 資產的檔名有沒有跟著 mkdocs-material 的版本一起換。

=== 為什麼需要這支 ===

docs/overrides/base.html 是 mkdocs-material base.html 的 fork，styles 與 scripts
兩個 block 把資產檔名寫死成帶雜湊的形式（main.<hash>.min.css）。mkdocs-material
改版時那些雜湊會變，套件裡只會有新的那一份，舊檔名不存在。

2026-08-24 的 #338 用 uv sync -U 把 mkdocs-material 從 9.7.6 帶到 9.7.7，
base.html 與 docs/zh-TW/sw.js 的雜湊都留在舊版。部署那步是 s3 sync --delete，
舊檔案跟著被刪，於是線上三個語系的 HTML 同時指向 404 的 main.*.min.css 與
bundle.*.min.js。

這種壞法特別難救：壞的網址寫在伺服器送出來的 HTML 裡，讀者清快取、移除再重裝
PWA 都只會拿到同一份。service worker 還讓症狀更難懂，precacheFor 用
Promise.allSettled 容忍個別失敗，404 被靜靜跳過，install 照樣成功，接著 activate
清掉舊的 PRECACHE，連原本靠舊快取撐著的裝置也一起失去樣式。

=== 怎麼驗 ===

兩層，各自守不同的時機。

第一層不需要建置產物，PR 階段就能跑：docs/uv.lock 解出來的 mkdocs-material 版本，
要等於 base.html 檔頭 theme-assets-from 記的版本。升級套件而沒回來換雜湊，這裡
就會紅燈。

第二層要有 docs/output（sh run.sh、run_zh-cn.sh、run_en.sh 建過），驗的是產物本身：
三個語系的首頁 HTML 裡每一個指向 assets/ 的網址，在產物裡都要有對應的檔案。驗產物
而不是驗模板，是因為讀者實際會去抓的就是這些網址，模板寫對而建置沒複製到一樣是 404。
找不到 docs/output 時跳過那一層，沒建置過就不該擋人。

用法：
    python3 tools/check_theme_assets.py
"""

import pathlib
import re
import sys
import tomllib
from html.parser import HTMLParser

HERE = pathlib.Path(__file__).resolve().parent
DOCS = HERE.parent / "docs"
BASE = DOCS / "overrides" / "base.html"
LOCK = DOCS / "uv.lock"
OUT = DOCS / "output"

# 三個語系各跑一次 mkdocs build，assets 也各有一份。zh-TW 由 run.sh 建在根路徑。
LANG_ROOTS = ["", "en", "zh-cn"]

VERSION_MARK = re.compile(r"theme-assets-from:\s*mkdocs-material\s+(\S+)")


def locked_version(lock_path=LOCK):
    """uv.lock 裡鎖定的 mkdocs-material 版本，找不到回 None。"""
    data = tomllib.loads(lock_path.read_text(encoding="utf-8"))
    for package in data.get("package", []):
        if package.get("name") == "mkdocs-material":
            return package.get("version")
    return None


def recorded_version(base_path=BASE):
    """base.html 檔頭記著「這些雜湊來自哪一版」，找不到回 None。"""
    match = VERSION_MARK.search(base_path.read_text(encoding="utf-8"))
    return match.group(1) if match else None


class AssetRefs(HTMLParser):
    """抓 HTML 裡 href 與 src 指向 assets/ 的本地網址。"""

    def __init__(self):
        super().__init__()
        self.refs = []

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name not in ("href", "src") or not value:
                continue
            if "://" in value or value.startswith(("//", "#", "data:", "mailto:")):
                continue
            # 路徑段剛好等於 assets 才算，community/brand-assets/ 那種頁面連結不是。
            parts = value.split("?")[0].split("#")[0].split("/")
            if "assets" in parts:
                self.refs.append(value)


def missing_assets(out_dir=OUT, lang_roots=LANG_ROOTS):
    """回傳 (語系首頁, 網址, 解出來的路徑) 三元組，全部都在的話是空的。"""
    missing = []
    for lang in lang_roots:
        page = out_dir / lang / "index.html" if lang else out_dir / "index.html"
        if not page.exists():
            missing.append((str(page), "", "首頁不存在，建置沒跑完或語系少了一份"))
            continue
        parser = AssetRefs()
        parser.feed(page.read_text(encoding="utf-8"))
        for ref in parser.refs:
            target = (page.parent / ref.split("?")[0].split("#")[0]).resolve()
            if not target.exists():
                missing.append((str(page), ref, str(target)))
    return missing


def main():
    problems = []

    locked = locked_version()
    recorded = recorded_version()
    if locked is None:
        problems.append("docs/uv.lock 裡找不到 mkdocs-material")
    elif recorded is None:
        problems.append(
            "docs/overrides/base.html 檔頭少了 theme-assets-from 標記，"
            "補一行 `theme-assets-from: mkdocs-material <版本>`"
        )
    elif locked != recorded:
        problems.append(
            f"mkdocs-material 鎖在 {locked}，但 base.html 的資產雜湊記的是 {recorded}。\n"
            f"    改版後雜湊會變，舊檔名在套件裡不存在，部署會讓線上的 HTML 指向 404。\n"
            f"    到 .venv/lib/python3.12/site-packages/material/templates/assets/ 抄新的檔名，\n"
            f"    改 base.html 的 styles、scripts 兩個 block 與 search worker、\n"
            f"    docs/zh-TW/sw.js 的 SHELL_ASSETS，最後把檔頭那一行改成 {locked}。"
        )
    else:
        print(f"  mkdocs-material {locked}，base.html 的資產雜湊標記一致。")

    if OUT.exists():
        missing = missing_assets()
        for page, ref, target in missing:
            problems.append(f"{page} 指向的 {ref} 在產物裡不存在（{target}）")
        if not missing:
            print("  三個語系首頁引用的 assets 都對得到 docs/output 裡的檔案。")
    else:
        print("  找不到 docs/output，跳過產物那一層。先建置過再跑這支。")

    if problems:
        print("\n資產檢查失敗：")
        for problem in problems:
            print(f"  - {problem}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
