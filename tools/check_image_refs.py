#!/usr/bin/env python3
"""檢查三個語系的 Markdown 有沒有引用到不存在的本地圖片。

三個語系各有自己的 `docs/<lang>/assets/images/`，是各自獨立的實體檔案而不是
共用一份。新增圖片時只補了 zh-TW、忘記另外兩個語系，建置不會報錯，mkdocs 對
Markdown 裡的 img 路徑不做存在性檢查，站上就是一個破圖，通常要等讀者回報。

2026-08 掃出來的實際狀況：zh-CN 少了七張 drawio 圖，`zh-CN/advanced/` 四篇
全部破圖，存在了一段時間沒有人發現。同一輪把那七張改放 assets.anoni.net，
三個語系共用同一份，這支腳本留下來盯住還沒改的部分。

比對的是檔名，不是相對路徑的深度。站上圖片全部集中在 `<lang>/assets/images/`，
而引用要寫幾個 `../` 取決於該頁產生出來的網址深度（`use_directory_urls` 會讓
`basics/foo.md` 變成 `/basics/foo/`，blog 文章又多帶年月兩層）。照著檔案位置
去算深度會對 blog 全體誤報，所以這裡只回答「這個檔名在這個語系有沒有」。

外部圖不在範圍內。`https://assets.anoni.net/...` 由 mkdocs-material 的 privacy
外掛在建置時抓取，抓不到會直接讓建置失敗，那條路徑本來就擋得住。

用法：
    python3 tools/check_image_refs.py                # 檢查三個語系
    python3 tools/check_image_refs.py docs/zh-CN     # 只檢查一個語系
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

# 只認副檔名像圖片的引用。連到 .md 的相對路徑由 mkdocs 自己檢查，不重複做。
IMAGE_SUFFIX = re.compile(r"\.(svg|png|jpe?g|webp|gif|avif)$", re.IGNORECASE)

# 兩種寫法都要抓：HTML 的 src="..."（站上大多數圖是 figure 包 img）與
# Markdown 的 ![alt](path)。只收相對路徑，絕對網址交給 privacy 外掛。
REF_PATTERN = re.compile(r"""(?:src=["']|\]\()(\.{1,2}/[^"'\)\s]+)""")

# 規範說明文件裡的佔位寫法，例如 `<name>.drawio.svg`，不是真的引用。
PLACEHOLDER = re.compile(r"[<>{}]")

DEFAULT_LANGS = ["zh-TW", "zh-CN", "en"]


def scan(lang_root: Path) -> list[tuple[Path, str]]:
    """回傳 (markdown 檔, 引用字串) 的清單，只含在 assets/images/ 找不到的。

    一個語系底下不只一個 assets/images。除了語系根目錄那個，blog 另外有
    `blog/posts/assets/images/`，文章寫的是 `./assets/images/...`。這裡把該語系
    底下所有 assets/images 的檔名收成一個集合，不去分辨引用該落在哪一個。
    """
    have = {
        p.name
        for images_dir in lang_root.rglob("assets/images")
        if images_dir.is_dir()
        for p in images_dir.iterdir()
    }

    broken = []
    for md in sorted(lang_root.rglob("*.md")):
        for ref in REF_PATTERN.findall(md.read_text(encoding="utf-8")):
            if not IMAGE_SUFFIX.search(ref) or PLACEHOLDER.search(ref):
                continue
            if "assets/images/" not in ref:
                continue
            if ref.rsplit("/", 1)[-1] not in have:
                broken.append((md, ref))
    return broken


def main() -> int:
    repo = Path(__file__).resolve().parent.parent
    roots = [Path(a).resolve() for a in sys.argv[1:]]
    if not roots:
        roots = [repo / "docs" / lang for lang in DEFAULT_LANGS]

    total = 0
    for root in roots:
        if not root.is_dir():
            print(f"跳過 {root}，目錄不存在")
            continue
        broken = scan(root)
        total += len(broken)
        if broken:
            print(f"{root.name}：{len(broken)} 個引用找不到檔案")
            for md, ref in broken:
                # 傳進來的目錄可能不在這份 repo 底下（拿這支腳本去掃另一份
                # checkout 是常見用法），所以用 relpath 而不是 relative_to。
                print(f"   {os.path.relpath(md)} -> {ref}")
        else:
            print(f"{root.name}：全部引用都有對應檔案")

    if total:
        print(f"\n合計 {total} 個斷掉的圖片引用。")
        print("補上缺的檔案，或把圖片改放 assets.anoni.net 讓三個語系共用同一份。")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
