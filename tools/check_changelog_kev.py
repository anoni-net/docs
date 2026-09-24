#!/usr/bin/env python3
"""把 CISA 的已知遭利用漏洞目錄（KEV）跟更新日誌對一遍，找出已被利用、頁面還沒寫的漏洞。

更新日誌的「立刻」大多建立在「上游標注已被利用」上，而那個標注不一定出現在我們
讀的那份公告裡。2026 年 9 月就漏過兩次：Pixel 數據機的 CVE-2026-58704 只寫在晚一週
發布的 Pixel 更新公告，Android 安全公告沒提；Windows IKE 的 CVE-2026-33824 在 4 月
修補時沒有標為已被利用，8 月 18 日才進 KEV，那時 4 月那則早就寫完了。兩次都是拿
KEV 回頭對才發現的。

KEV 的收錄條件就是「已有被利用的證據」，一週只多幾筆，JSON 格式穩定，拿來當補網
剛好。直接用 NVD 做關鍵字搜尋的雜訊太多，查 WhatsApp 會得到一堆 WordPress 外掛，
查 Signal 會得到 Oracle 的 Demand Signal Repository。

做法：抓 KEV，取期間內新增、屬於我們追蹤的產品的條目，檢查 CVE 編號有沒有出現在
對應的頁面裡。只查 zh-TW，那是三語系的來源。沒出現的列出來，由人判斷要補在哪一則、
怎麼寫，這支不改任何內容。

分三類輸出：

- 要補：對得到頁面，頁面裡卻沒有這個 CVE。有這一類時結束碼是 1
- 翻譯落後：zh-TW 有，zh-CN 或 en 沒有
- 參考：追蹤的廠商但頁面不涵蓋的產品（Windows 頁只談桌面，SharePoint 這類伺服器
  產品不收），或是多年前的舊漏洞最近才被收錄（CISA 常一次補收一批 2010 年前後的
  CVE，那些不會出現在任何一則月度整理裡）

用法：

    python3 tools/check_changelog_kev.py                 # 近 60 天
    python3 tools/check_changelog_kev.py --days 120
    python3 tools/check_changelog_kev.py --kev-file kev.json --today 2026-09-24

每週由 .github/workflows/changelog-kev.yml 執行一次，有「要補」時開或更新一張 issue。
純標準庫，無外部相依。
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
import urllib.request
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
LANGS = ("zh-TW", "zh-CN", "en")


@dataclass(frozen=True)
class Rule:
    vendor: str
    product: str  # 正則，比對 KEV 的 product 欄位
    pages: tuple[str, ...]  # 其中任一頁出現這個 CVE 就算有寫

# KEV 的廠商與產品名要對到哪幾頁。順序有意義，第一條對上的就採用。
# 要新增追蹤的產品時，先到 KEV 裡查它的 vendorProject 與 product 實際怎麼寫。
RULES: tuple[Rule, ...] = (
    Rule("Google", r"Chromium|V8|Skia|Dawn|ANGLE", ("browsers",)),
    Rule("Mozilla", r"Firefox", ("browsers",)),
    Rule("Google", r"Android|Pixel", ("android", "grapheneos")),
    Rule("Apple", r".*", ("ios", "macos")),
    Rule("Meta Platforms", r"WhatsApp", ("messaging",)),
    Rule("Signal", r".*", ("messaging",)),
    Rule("Tor Project", r".*", ("tor", "tor-daemon")),
    # Windows 頁只談桌面 Windows。產品名帶 Windows 的，或是 Windows 內建元件
    # （KEV 有時只寫元件名，例如 Internet Key Exchange (IKE) Service Extensions）
    Rule("Microsoft", r"Windows|Win32k|Internet Key Exchange|DirectX|NTFS|SMB", ("windows",)),
)

# 追蹤的廠商裡，頁面刻意不涵蓋的部分。對上這些只列為參考，不算漏。
OUT_OF_SCOPE: tuple[Rule, ...] = (
    Rule("Microsoft", r".*", ()),  # SharePoint、Exchange、SQL Server、Defender 等
    Rule("Google", r".*", ()),
    Rule("Mozilla", r".*", ()),  # Thunderbird
    Rule("Meta Platforms", r".*", ()),  # React、Proxygen
)

CVE_YEAR = re.compile(r"CVE-(\d{4})-")


@dataclass
class Finding:
    cve: str
    added: str
    vendor: str
    product: str
    name: str
    pages: tuple[str, ...] = ()
    missing_langs: tuple[str, ...] = ()


def match(rules, vendor: str, product: str) -> Rule | None:
    for rule in rules:
        if rule.vendor == vendor and re.search(rule.product, product):
            return rule
    return None


def is_old(cve: str, added: str) -> bool:
    """CVE 編號的年份比收錄年份早兩年以上，視為舊漏洞補收。"""
    m = CVE_YEAR.match(cve)
    return bool(m) and int(m.group(1)) < int(added[:4]) - 1


def page_text(docs: Path, lang: str, stem: str) -> str:
    path = docs / lang / "changelog" / f"{stem}.md"
    return path.read_text(encoding="utf-8") if path.is_file() else ""


def check(kev: dict, since: str, docs: Path = DOCS):
    """回 (要補, 翻譯落後, 參考) 三組 Finding。"""
    missing, lagging, info = [], [], []
    for v in kev.get("vulnerabilities", []):
        added = v.get("dateAdded", "")
        if added < since:
            continue
        cve, vendor, product = v["cveID"], v.get("vendorProject", ""), v.get("product", "")
        f = Finding(cve, added, vendor, product, v.get("vulnerabilityName", ""))
        rule = match(RULES, vendor, product)
        if rule is None:
            if match(OUT_OF_SCOPE, vendor, product):
                info.append(f)
            continue
        f.pages = rule.pages
        if is_old(cve, added):
            info.append(f)
            continue
        if not any(cve in page_text(docs, "zh-TW", p) for p in rule.pages):
            missing.append(f)
            continue
        lag = tuple(
            lang for lang in LANGS[1:]
            if not any(cve in page_text(docs, lang, p) for p in rule.pages)
        )
        if lag:
            f.missing_langs = lag
            lagging.append(f)
    key = lambda f: (f.added, f.cve)
    return sorted(missing, key=key), sorted(lagging, key=key), sorted(info, key=key)


def render(missing, lagging, info, since: str, today: str) -> str:
    def pages(f):
        return "、".join(f"`{p}.md`" for p in f.pages)

    out = [f"KEV 在 {since} 到 {today} 之間新增的條目，跟更新日誌（zh-TW）對過一遍。", ""]
    out.append(f"## 要補（{len(missing)}）")
    out.append("")
    if missing:
        out.append("已被利用，對應的頁面裡沒有這個 CVE 編號。補在哪一則、怎麼寫，照 `docs/CHANGELOG_SOURCES.md`。")
        out.append("")
        for f in missing:
            out.append(f"- [ ] {f.added} `{f.cve}` {f.vendor} {f.product}：{f.name}（應出現在 {pages(f)}）")
    else:
        out.append("沒有。")
    out.append("")
    if lagging:
        out.append(f"## 翻譯落後（{len(lagging)}）")
        out.append("")
        for f in lagging:
            out.append(f"- {f.added} `{f.cve}`：zh-TW 有，{'、'.join(f.missing_langs)} 還沒有（{pages(f)}）")
        out.append("")
    if info:
        out.append(f"## 參考（{len(info)}）")
        out.append("")
        out.append("追蹤的廠商裡頁面不涵蓋的產品，或多年前的舊漏洞最近才收錄，不算漏。")
        out.append("")
        for f in info:
            reason = "舊漏洞補收" if f.pages else "頁面不涵蓋"
            out.append(f"- {f.added} `{f.cve}` {f.vendor} {f.product}：{f.name}（{reason}）")
        out.append("")
    return "\n".join(out)


def load_kev(path: str | None) -> dict:
    if path:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    req = urllib.request.Request(KEV_URL, headers={"User-Agent": "anoni-net-docs changelog check"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.load(resp)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--days", type=int, default=60, help="往回看幾天（預設 60）")
    ap.add_argument("--today", help="以哪一天為準，YYYY-MM-DD，預設今天")
    ap.add_argument("--kev-file", help="改讀本機的 KEV JSON，不連網")
    ap.add_argument("--output", help="結果另外寫進這個檔案（給 workflow 當 issue 內文）")
    args = ap.parse_args(argv)

    today = dt.date.fromisoformat(args.today) if args.today else dt.date.today()
    since = (today - dt.timedelta(days=args.days)).isoformat()
    missing, lagging, info = check(load_kev(args.kev_file), since)
    text = render(missing, lagging, info, since, today.isoformat())
    print(text)
    if args.output:
        Path(args.output).write_text(text + "\n", encoding="utf-8")
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main())
