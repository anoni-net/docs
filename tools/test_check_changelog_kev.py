#!/usr/bin/env python3
"""check_changelog_kev 的回歸測試。

這支的價值在於「漏掉的會被列出來、不該列的不會」。對照表寫錯的症狀很安靜：
規則對不上就一筆都不報，看起來像更新日誌什麼都沒漏。所以這裡用一份假的 KEV 與
假的頁面，把每一類各走一次。不連網，不讀真的 docs/。
"""

from __future__ import annotations

import pathlib
import sys
import tempfile

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

import check_changelog_kev as ck  # noqa: E402

failures: list[str] = []


def check(label: str, got, want) -> None:
    if got != want:
        failures.append(f"{label}\n    got:  {got!r}\n    want: {want!r}")


def kev(*rows):
    return {"vulnerabilities": [
        {"cveID": c, "dateAdded": d, "vendorProject": v, "product": p, "vulnerabilityName": f"{v} {p}"}
        for c, d, v, p in rows
    ]}


with tempfile.TemporaryDirectory() as tmp:
    docs = pathlib.Path(tmp)
    pages = {
        ("zh-TW", "browsers"): "Chrome CVE-2026-85046 已被利用",
        ("zh-CN", "browsers"): "Chrome CVE-2026-85046",
        ("en", "browsers"): "Chrome",  # 英文版還沒補
        ("zh-TW", "android"): "",
        ("zh-TW", "grapheneos"): "CVE-2026-58704 也寫在 GrapheneOS 頁",
        ("zh-CN", "grapheneos"): "CVE-2026-58704",
        ("en", "grapheneos"): "CVE-2026-58704",
        ("zh-TW", "windows"): "CVE-2026-81963",
        ("zh-CN", "windows"): "CVE-2026-81963",
        ("en", "windows"): "CVE-2026-81963",
    }
    for (lang, stem), text in pages.items():
        path = docs / lang / "changelog" / f"{stem}.md"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")

    data = kev(
        ("CVE-2026-85046", "2026-09-04", "Google", "Chromium V8"),
        ("CVE-2026-87491", "2026-09-09", "Google", "Chromium V8"),
        ("CVE-2026-58704", "2026-09-16", "Google", "Pixel"),
        ("CVE-2026-81963", "2026-09-08", "Microsoft", "Windows"),
        ("CVE-2026-33824", "2026-08-18", "Microsoft", "Internet Key Exchange (IKE) Service Extensions"),
        ("CVE-2026-55040", "2026-08-18", "Microsoft", "SharePoint"),
        ("CVE-2010-0249", "2026-08-20", "Microsoft", "Windows"),
        ("CVE-2026-53266", "2026-09-18", "Linux", "Kernel"),
        ("CVE-2026-11645", "2026-06-09", "Google", "Chromium V8"),
    )
    missing, lagging, info = ck.check(data, "2026-07-26", docs)

    check("頁面沒寫的已被利用漏洞列為要補",
          [f.cve for f in missing], ["CVE-2026-33824", "CVE-2026-87491"])
    check("Windows 內建元件只寫元件名也對得到 Windows 頁",
          [f.pages for f in missing if f.cve == "CVE-2026-33824"], [("windows",)])
    check("寫在對應頁面其中之一就算有寫（Pixel 寫在 GrapheneOS 頁）",
          any(f.cve == "CVE-2026-58704" for f in missing), False)
    check("zh-TW 有、其他語系沒有的列為翻譯落後，並寫出缺哪幾個語系",
          [(f.cve, f.missing_langs) for f in lagging], [("CVE-2026-85046", ("en",))])
    check("頁面不涵蓋的伺服器產品與多年前的舊漏洞只列參考",
          sorted(f.cve for f in info), ["CVE-2010-0249", "CVE-2026-55040"])
    check("沒追蹤的廠商完全不列", any(f.cve == "CVE-2026-53266" for f in missing + lagging + info), False)
    check("期間之前收錄的不列", any(f.cve == "CVE-2026-11645" for f in missing + lagging + info), False)

    text = ck.render(missing, lagging, info, "2026-07-26", "2026-09-24")
    check("要補的項目做成勾選清單，給 issue 用", "- [ ] 2026-08-18 `CVE-2026-33824`" in text, True)
    check("標題寫出要補幾筆", "## 要補（2）" in text, True)

    empty = ck.render([], [], [], "2026-07-26", "2026-09-24")
    check("沒有要補的時候寫明沒有", "## 要補（0）\n\n沒有。" in empty, True)

check("CVE 年份早收錄兩年以上才算舊漏洞", (ck.is_old("CVE-2024-1", "2026-01-01"), ck.is_old("CVE-2025-1", "2026-01-01")), (True, False))

# 對照表每一條都要至少對得到一頁，而且那一頁真的存在，否則那條規則形同虛設
docs_root = pathlib.Path(__file__).resolve().parent.parent / "docs" / "zh-TW" / "changelog"
for rule in ck.RULES:
    for stem in rule.pages:
        check(f"對照表裡的 {stem}.md 存在", (docs_root / f"{stem}.md").is_file(), True)

if failures:
    print(f"{len(failures)} 項失敗：")
    for f in failures:
        print(" -", f)
    sys.exit(1)
print("check_changelog_kev：全部通過")
