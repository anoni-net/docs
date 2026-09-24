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
    "subscribe": "訂閱「{label}」", "subscribe_urgent": "只訂閱立刻與儘快", "feed_label": "RSS：",
    "feed_title": "更新日誌：{label}", "feed_description": "說明", "feed_urgent": "立刻與儘快",
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

# --- RSS ---

import xml.etree.ElementTree as ET  # noqa: E402

html_filter = cd.render_filter(cfg, today)
check("每個選項都有自己的訂閱連結",
      all(f'data-feed="{f["id"]}" href="feed-{f["id"]}.xml"' in html_filter for f in cfg["filters"]), True)
check("選了選項就換成那一份訂閱連結",
      '.md-typeset:has(#cl-f-windows:checked) .cl-feed [data-feed="windows"] { display: inline; }' in html_filter, True)
check("提到 RSS 的地方前面有 RSS 圖示", f"{cd.RSS_ICON} RSS：" in html_filter, True)
check("急迫條目的訂閱連結一直都在", '<a href="feed-urgent.xml">只訂閱立刻與儘快</a>' in html_filter, True)

check("急迫 feed 收所有立刻與儘快，不只每頁最新一則",
      [(e.page, e.heading) for e in cd.feed_entries([windows, tails, ios], "urgent")],
      [("tails", "Tails 7.13.1"), ("ios", "iOS 27"), ("windows", "2026 年 9 月"), ("windows", "2026 年 8 月")])
check("篩選項的 feed 只收對應的頁面",
      {e.page for e in cd.feed_entries([windows, ios, daemon], "relay")}, {"tor-daemon"})
many = page("tor", "".join(f"## Tor Browser 15.0.{i}\n\n> 2026-01-{i + 1:02d} · x\n\n" for i in range(30))
            + "".join(f"## Tor Browser 14.5.{i}\n\n> 2025-12-{i + 1:02d} · x\n\n" for i in range(30)))
check("每份 feed 有則數上限", len(cd.feed_entries([many], None)), cd.FEED_ITEMS)

feeds = cd.build_feeds([windows, ios, daemon], cfg, "https://example.org/docs/changelog/",
                       lambda stem: f"https://example.org/docs/changelog/{stem}/", "zh-TW",
                       dt.datetime(2026, 9, 24, tzinfo=dt.timezone.utc), slug)
check("全部、各選項與急迫各出一份",
      sorted(feeds), sorted(["feed.xml", "feed-urgent.xml", "feed-windows.xml", "feed-iphone.xml",
                             "feed-relay.xml", "feed-ooni.xml"]))
root = ET.fromstring(feeds["feed-windows.xml"])
items = root.findall("./channel/item")
check("feed 是合法的 XML，項目由新到舊", [i.findtext("title") for i in items],
      ["立刻 · windows · 2026 年 9 月", "立刻 · windows · 2026 年 8 月"])
check("項目連回條目的錨點，非 ASCII 有編碼", items[0].findtext("link"),
      "https://example.org/docs/changelog/windows/#2026-%E5%B9%B4-9-%E6%9C%88")
check("說明帶判準", items[0].findtext("description"), "2026/09/08 · 依微軟是否標注已被利用分級")
check("guid 不含主機名，換到 onion 不會變成新的一則",
      items[0].findtext("guid"), "anoni-changelog:windows:2026-09-08:2026 年 9 月")
check("feed 自己的網址", root.find("./channel/{http://www.w3.org/2005/Atom}link").get("href"),
      "https://example.org/docs/changelog/feed-windows.xml")
check("沒有條目的選項也出一份空的 feed，訂閱不會 404",
      ET.fromstring(feeds["feed-ooni.xml"]).findall("./channel/item"), [])

# --- 一頁收好幾個產品（tracks） ---

browsers = page("browsers", f"""
## Chrome 2026 年 9 月

> 2026-09-22 · x

- {NOW}已被利用

## Firefox 2026 年 9 月

> 2026-09-15 · x

- {SOON}有安全修補

## Chrome 2026 年 8 月

> 2026-08-25 · x

- {SOON}
""", name="瀏覽器")
browsers.tracks = ["Chrome", "Firefox"]
check("分線的頁面每條線各取最新一則",
      [e.heading for e in cd.latest_each(browsers)], ["Chrome 2026 年 9 月", "Firefox 2026 年 9 月"])
check("分線的頁面在「現在要處理的」兩條線都出現",
      [e.heading for e in cd.pressing([browsers], since)], ["Chrome 2026 年 9 月", "Firefox 2026 年 9 月"])
check("標題以線名開頭就不加頁面名稱", cd._title(browsers.entries[1], browsers), "Firefox 2026 年 9 月")
check("清單後面每條線一行",
      cd.render_latest(browsers, cfg).count('class="cl-latest"'), 2)
browsers.tracks = []
check("沒有分線時照舊只取整頁最新一則", [e.heading for e in cd.latest_each(browsers)], ["Chrome 2026 年 9 月"])


if failures:
    print(f"{len(failures)} 項失敗：")
    for f in failures:
        print(" -", f)
    sys.exit(1)
print("changelog_digest：全部通過")
