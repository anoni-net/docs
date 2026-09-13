#!/usr/bin/env python3
"""比對 `sw.js` 的 `CORE_PAGES_*` 與 `docs/` 底下實際存在的文章。

=== 為什麼需要這支 ===

`CORE_PAGES_ZH` 與 `CORE_PAGES_EN` 是手維護的清單，決定讀者選過閱讀語言之後，網站
自動存進他裝置的是哪幾十頁。新增一篇文章不會讓它自己進去，而漏掉的症狀是「什麼都
正常」：文章線上讀得到、建置綠燈、離線閱讀頁也列得出來，只有實際斷網的讀者會發現
那一篇打不開，而在那個當下他已經沒有辦法補存。

漏掉與刻意不收在程式裡長得一模一樣，都是清單裡少一行。這支要求兩者分開寫：收進
`CORE_PAGES_*`，或者列進下面的 `EXCLUDED` 並寫明理由。兩邊都沒有就是還沒有人判斷過。

2026-09-14 第一次跑的時候，`basics/` 與 `tools/` 有 13 頁落在這個狀態，而那兩區的
註解寫著「全部」。`CORE_PAGES_EN` 收了其中幾頁，`CORE_PAGES_ZH` 沒有，同一篇文章在
兩個語系的自動下載範圍不一樣，也沒有任何地方講得出為什麼。

=== 判準 ===

要不要收，照 `docs/zh-TW/sw.js` 裡 `CORE_PAGES_ZH` 上方那段長註解問：

    這頁是不是用第二人稱或隱含第二人稱，指導「唯一一種身分的人」在採取某個具體
    行動前後該做什麼準備？

是的話就不要收，因為那些頁面躺在 Cache Storage 裡本身就是指向性證據。讀者主動點開
時執行期快取仍會存下來，那是他自己的選擇。

=== 涵蓋範圍 ===

只掃註解寫著「全部」的那幾區（概念、工具、進階、在地）。`scenarios/` 與 `utils/`
刻意只選錄，預設就是不收，新增一頁不進清單是正確的行為，不該報。

用法：
    python3 tools/check_core_pages.py
不需要建置產物，也沒有外部相依。
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SW = ROOT / "docs" / "zh-TW" / "sw.js"

# 註解寫著「全部」的那幾區，少一頁就是漏掉。zh-TW 與 zh-CN 共用 CORE_PAGES_ZH，
# en 是策展型原創軌道，章節名稱不同（在地脈絡叫 regional/ 不叫 taiwan/）。
TRACKS = (
    {
        "name": "zh",
        "const": "CORE_PAGES_ZH",
        "docs": ("zh-TW", "zh-CN"),
        "dirs": ("basics", "tools", "advanced", "taiwan"),
    },
    {
        "name": "en",
        "const": "CORE_PAGES_EN",
        "docs": ("en",),
        "dirs": ("basics", "tools", "advanced", "regional"),
    },
)

# 判斷過、刻意不收的頁面。加一行進來就要同時寫下理由，理由會印在報表上，下一個人
# 才不必回頭重新判斷一次。
EXCLUDED = {
    "zh": {
        "taiwan/whistleblower-law/": (
            "整篇是揭弊者本人的行動準備清單，依判準排除。它放在法規資料夾，"
            "按資料夾掃會漏掉"
        ),
    },
    "en": {
        "regional/taiwan-whistleblower-law/": (
            "同 zh 版的 taiwan/whistleblower-law，揭弊者本人的行動準備清單"
        ),
    },
}


def core_pages(source, name):
    """從 sw.js 抽出某一份清單的頁面路徑。

    照字串字面抓，不執行那份 js。清單裡只有字串與註解，正則夠用，而把 sw.js 餵給
    node 會連帶要湊出 self.registration 那一整套替身。
    """
    match = re.search(rf"^const {name} = \[(.*?)\n\];", source, re.S | re.M)
    if not match:
        raise SystemExit(f"sw.js 裡找不到 {name}")
    body = re.sub(r"//[^\n]*", "", match.group(1))
    return set(re.findall(r'"([^"]*)"', body))


def pages_on_disk(docs_dir, dirs, root=ROOT):
    """docs/<lang>/ 底下那幾區實際有哪些文章，回成 CORE_PAGES 用的路徑形狀。

    `basics/metadata.md` 對應 `basics/metadata/`，`basics/index.md` 對應 `basics/`。
    那幾區底下沒有子目錄，也沒有 .md 以外的檔案，掃一層就夠。
    """
    found = {}
    for name in dirs:
        folder = root / "docs" / docs_dir / name
        if not folder.is_dir():
            continue
        for path in sorted(folder.glob("*.md")):
            stem = path.stem
            url = f"{name}/" if stem == "index" else f"{name}/{stem}/"
            found[url] = path.relative_to(root)
    return found


def main():
    source = SW.read_text(encoding="utf-8")
    errors = []
    warnings = []

    for track in TRACKS:
        listed = core_pages(source, track["const"])
        excluded = EXCLUDED.get(track["name"], {})
        primary = track["docs"][0]
        on_disk = pages_on_disk(primary, track["dirs"])

        scoped = {
            url for url in listed if url.split("/")[0] in track["dirs"]
        }

        for url, path in on_disk.items():
            if url in listed or url in excluded:
                continue
            errors.append(
                f"{track['const']} 沒有收 {url}（{path}），"
                f"也沒有列進 EXCLUDED 說明為什麼"
            )

        for url in sorted(scoped - set(on_disk)):
            errors.append(
                f"{track['const']} 收了 {url}，但 docs/{primary}/ 底下沒有這一頁。"
                f"改過檔名或刪過文章的話，清單要跟著改"
            )

        for url, reason in sorted(excluded.items()):
            if url in listed:
                errors.append(
                    f"{url} 同時出現在 {track['const']} 與 EXCLUDED，兩邊說法相反"
                )
            elif url not in on_disk:
                warnings.append(f"EXCLUDED 列著 {url}，但那一頁已經不在了")

        # 次要語系（zh-CN）缺頁只提醒。install 用 allSettled 容忍個別 404，翻譯
        # 進度落後是正常狀態，不該擋住 zh-TW 的文章。
        for other in track["docs"][1:]:
            other_pages = pages_on_disk(other, track["dirs"])
            for url in sorted(scoped - set(other_pages)):
                warnings.append(
                    f"{track['const']} 收了 {url}，docs/{other}/ 還沒有這一頁，"
                    f"那個語系的讀者離線時會缺這一篇"
                )

        print(
            f"{track['const']}：那幾區共 {len(on_disk)} 頁，"
            f"收了 {len(scoped)} 頁，刻意排除 {len(excluded)} 頁"
        )
        for url, reason in sorted(excluded.items()):
            print(f"  排除 {url}：{reason}")

    for line in warnings:
        print(f"提醒：{line}")

    if errors:
        print(f"\n✗ {len(errors)} 個問題：")
        for line in errors:
            print(f"  {line}")
        print(
            "\n新增文章時照 sw.js 裡 CORE_PAGES_ZH 上方那段判準決定要不要收，"
            "\n排除的話列進 tools/check_core_pages.py 的 EXCLUDED 並寫明理由。"
            "\n兩邊都沒有的話，斷網的讀者會發現那一篇打不開，而那時候補存已經來不及。"
        )
        return 1

    print("\n那幾區的每一頁都有人判斷過，收或不收都寫在該寫的地方。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
