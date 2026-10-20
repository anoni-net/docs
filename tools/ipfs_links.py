#!/usr/bin/env python3
"""IPFS 鏡像版的連結改寫與檢查。

    python3 tools/ipfs_links.py docs/output          # 改寫，接著檢查
    python3 tools/ipfs_links.py --check docs/output  # 只檢查

anoni.net 的 IPFS 鏡像把社群首頁、文件站、新聞導讀與隱私推理遊戲組成同一個目錄，路徑照
clearnet 排列，文件站在 /docs/（toomore/anoni-net-ws#422，組裝在 anoni-net/ipfs-mirror）。
鏡像是備援，site_url 維持 https://anoni.net/docs，canonical、og、hreflang、sitemap 與 RSS
都指回 clearnet，搜尋引擎不會把鏡像當成另一個網站。

這支只改寫每一頁 <body> 裡 href 與 src 的網址：https://anoni.net/ 開頭的改成根目錄的相對
路徑，在鏡像裡連到同一個目錄的其他專案。Gears 與 API 不在鏡像裡，維持 clearnet。<head>
與內文寫出來的網址（例如程式碼區塊）都不動。

檢查三件事：<body> 沒有漏改的連結、canonical 指向 clearnet、產物裡沒有流量統計的端點。
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

SITE = "https://anoni.net/docs"
# 不在鏡像裡的網站，連結維持 clearnet
KEEP = ("https://anoni.net/gears", "https://anoni.net/api")
ATTR = re.compile(r'\b(href|src)="([^"]*)"')
CANONICAL = re.compile(r'<link rel="canonical" href="([^"]*)"')
ANALYTICS = "aa.anoni.net"


def rewrite_url(url: str) -> str:
    if url.startswith(KEEP):
        return url
    if url == "https://anoni.net":
        return "/"
    if url.startswith("https://anoni.net/"):
        return url[len("https://anoni.net"):]
    return url


def rewrite_html(text: str) -> str:
    head, mark, body = text.partition("<body")
    if not mark:
        return text
    return head + mark + ATTR.sub(lambda m: f'{m[1]}="{rewrite_url(m[2])}"', body)


def problems_in(text: str, where: str) -> list[str]:
    problems = []
    head, _, body = text.partition("<body")
    for _, url in ATTR.findall(body):
        if rewrite_url(url) != url:
            problems.append(f"{where}：連結沒有改寫 {url}")
    for url in CANONICAL.findall(head):
        if not url.startswith(SITE):
            problems.append(f"{where}：canonical 沒有指向 {SITE}（{url}）")
    return problems


def check(root: Path) -> list[str]:
    problems = []
    pages = sorted(root.rglob("*.html"))
    if not pages:
        return [f"{root} 底下沒有任何頁面"]
    for page in pages:
        problems += problems_in(page.read_text(encoding="utf-8"), str(page.relative_to(root)))
    for path in sorted(root.rglob("*")):
        if path.suffix in {".html", ".js"} and ANALYTICS in path.read_text(encoding="utf-8", errors="replace"):
            problems.append(f"{path.relative_to(root)}：有流量統計的端點 {ANALYTICS}")
    return problems


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("root", type=Path, help="建置產物的目錄，通常是 docs/output")
    parser.add_argument("--check", action="store_true", help="只檢查，不改寫")
    args = parser.parse_args()
    if not args.check:
        changed = 0
        for page in args.root.rglob("*.html"):
            text = page.read_text(encoding="utf-8")
            new = rewrite_html(text)
            if new != text:
                page.write_text(new, encoding="utf-8")
                changed += 1
        print(f"改寫 {changed} 頁")
    problems = check(args.root)
    if problems:
        print(f"IPFS 版檢查沒過，共 {len(problems)} 項：")
        print("\n".join(f"  {p}" for p in problems[:50]))
        return 1
    print("IPFS 版檢查通過")
    return 0


if __name__ == "__main__":
    sys.exit(main())
