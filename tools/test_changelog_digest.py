#!/usr/bin/env python3
"""changelog_digest hook 的回歸測試。

這支 hook 決定更新日誌首頁「現在要處理的」列出什麼。錯了不會讓建置變紅燈：
日期抓錯是條目落在錯的位置或整則消失，Alpha 沒跳過是穩定版的讀者被帶去測試版，
舊的紅標沒撤下是整塊永遠一片紅色，三種都只能靠讀者發現。

不跑 mkdocs，只測純邏輯。條目格式或挑選規則改動時，請一併在這裡補上對應案例。
"""

from __future__ import annotations

import datetime as dt
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "docs" / "hooks"))

import changelog_digest as cd  # noqa: E402

failures: list[str] = []


def check(label: str, got, want) -> None:
    if got != want:
        failures.append(f"{label}\n    got:  {got!r}\n    want: {want!r}")


NOW = '<span class="urg-tag urg-tag--now">立刻</span>'
SOON = '<span class="urg-tag urg-tag--soon">儘快</span>'
ROUTINE = '<span class="urg-tag urg-tag--routine">一般</span>'
STABLE = '<span class="chan-tag chan-tag--stable">穩定版</span>'
ALPHA = '<span class="chan-tag chan-tag--alpha">Alpha</span>'


def page(stem, body, devices=("windows",), name=None, **kw):
    return cd.PageInfo(stem=stem, name=name or stem, devices=list(devices),
                       entries=cd.parse_entries(stem, body), **kw)


# --- 條目切分與日期 ---

body = f"""
## 急迫程度怎麼判斷

- {NOW}說明文字，不是條目

## Tails 7.13

> 2026-09-16 · [上游公告](https://example.org/){{target="_blank"}}

- {SOON}例行版本

## Tails 7.12

> 2026-09-03 · [上游公告](https://example.org/)

- {ROUTINE}例行版本
"""
entries = cd.parse_entries("tails", body)
check("沒有日期那一行的小節不算條目", [e.heading for e in entries], ["Tails 7.13", "Tails 7.12"])
check("日期取引用行的 ISO 日期", entries[0].date, dt.date(2026, 9, 16))
check("急迫程度取該則的第一個標籤", (entries[0].urgency, entries[0].urgency_label), ("soon", "儘快"))
check("說明小節的標籤不會算到下一則", entries[1].urgency, "routine")

graphene = cd.parse_entries("grapheneos", """
## 2026 年 9 月

> 版本 `2026090500`、`2026091900`、`2026091000` · [官方發布頁](https://grapheneos.org/releases)

- 內容
""")
check("GrapheneOS 取版本號裡最新的日期", graphene[0].date, dt.date(2026, 9, 19))

android = cd.parse_entries("android", "## 2026 年 9 月\n\n> 修補等級 2026-09-05 · [公告](https://x/)\n")
check("Android 取修補等級的日期", android[0].date, dt.date(2026, 9, 5))

check("版本號不像日期的不採用", cd._entry_date("> 版本 `2026139900`"), None)

# --- 最新一則跳過 Alpha ---

tor = page("tor", f"""
## Tor Browser 16.0a12

> 2026-09-22 · x

- {ALPHA}測試版

## Tor Browser 15.0.23

> 2026-09-15 · x

- {STABLE}穩定版
""")
check("最新一則跳過 Alpha", cd.latest(tor).heading, "Tor Browser 15.0.23")

only_alpha = page("tor", f"## Tor Browser 16.0a1\n\n> 2026-09-22 · x\n\n- {ALPHA}\n")
check("只有 Alpha 時沒有最新", cd.latest(only_alpha), None)

# --- 「現在要處理的」 ---

today = dt.date(2026, 9, 24)
since = today - dt.timedelta(days=45)

windows = page("windows", f"## 2026 年 9 月\n\n> 2026-09-08 · x\n\n- {NOW}\n\n## 2026 年 8 月\n\n> 2026-08-11 · x\n\n- {NOW}\n")
ios = page("ios", f"## iOS 27\n\n> 2026-09-14 · x\n\n- {SOON}\n", devices=("iphone",))
tails = page("tails", f"## Tails 7.14\n\n> 2026-09-20 · x\n\n- {ROUTINE}\n\n## Tails 7.13.1\n\n> 2026-09-18 · x\n\n- {NOW}\n", devices=("tails",))
stale = page("onionshare", f"## OnionShare 2.6.5\n\n> 2026-07-28 · x\n\n- {SOON}\n")
daemon = page("tor-daemon", f"## tor 0.4.9.13\n\n> 2026-09-23 · x\n\n- {NOW}\n", devices=("relay",))

picked = cd.pressing([windows, ios, tails, stale, daemon], since)
check("立刻排在儘快前面，同級新的在前",
      [(e.page, e.heading) for e in picked],
      [("tor-daemon", "tor 0.4.9.13"), ("windows", "2026 年 9 月"), ("ios", "iOS 27")])
check("同一頁只看最新一則，舊的紅標被新版蓋過", any(e.page == "tails" for e in picked), False)
check("超過期間的不列", any(e.page == "onionshare" for e in picked), False)

# --- 時間線 ---

timeline = cd.recent([windows, ios, daemon], since)
check("時間線由新到舊，期間內的舊月份也收",
      [e.heading for e in timeline],
      ["tor 0.4.9.13", "iOS 27", "2026 年 9 月", "2026 年 8 月"])
check("時間線不收期間之外的", cd.recent([stale], since), [])

# --- 輸出 ---

cfg = {
    "days": 45, "date_format": "{y}/{m}/{d}", "asof": "資料截至 {date}",
    "filter_label": "篩選", "all": "全部", "latest": "最新：{title} · {date}",
    "empty_now": "沒有", "empty_recent": "沒有條目", "empty_filtered": "這個選項沒有",
    "filters": [{"id": "windows", "label": "Windows"}, {"id": "iphone", "label": "iPhone"},
                {"id": "relay", "label": "中繼"}, {"id": "ooni", "label": "觀測"}],
}
pages = {p.stem: p for p in (windows, ios, daemon)}
windows.basis = "依微軟是否標注已被利用分級"
daemon.audience = "給營運者"
slug = lambda text: text.replace(" ", "-")

html_now = cd.render_now(picked, pages, cfg, slug)
check("判準跟著日期一起露出", "2026/09/08 · 依微軟是否標注已被利用分級" in html_now, True)
check("受影響的族群跟著露出", "給營運者" in html_now, True)
check("標題已含頁面名稱就不加前綴", "[iOS 27](./ios.md#iOS-27)" in html_now, True)
check("只寫月份的標題補上頁面名稱", "[windows · 2026 年 9 月](./windows.md#2026-年-9-月)" in html_now, True)
check("篩選後會空的選項才有說明列", '<li class="cl-empty" data-cl="ooni">' in html_now, True)
check("期間內什麼都沒有時給整段說明", cd.render_now([], pages, cfg, slug), '<p class="cl-none">沒有</p>')

html_filter = cd.render_filter(cfg, today)
for fid in ("windows", "iphone", "relay", "ooni"):
    check(f"選項 {fid} 有 radio 也有對應的 CSS 規則",
          (f'id="cl-f-{fid}"' in html_filter, f'#cl-f-{fid}:checked' in html_filter,
           f'[data-cl~="{fid}"]' in html_filter),
          (True, True, True))
check("「全部」預設選取", '<input type="radio" name="cl-filter" id="cl-f-all" checked>' in html_filter, True)
check("寫出資料截至的日期", "資料截至 2026/09/24" in html_filter, True)

check("清單後面的最新一則不帶頁面名稱", cd.render_latest(windows, cfg),
      '<span class="cl-latest">最新：2026 年 9 月 · 2026/09/08</span>')
check("找不到頁面時不輸出", cd.render_latest(None, cfg), "")


if failures:
    print(f"{len(failures)} 項失敗：")
    for f in failures:
        print(" -", f)
    sys.exit(1)
print("changelog_digest：全部通過")
