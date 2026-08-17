#!/usr/bin/env python3
"""產生「Tor 中繼地球儀」的使用者面資料（docs/zh-TW/games/tor-network/play/torusers.json）。

資料來源：Tor Metrics 的兩份 CSV，免驗證、免金鑰。

  userstats-relay-country.csv    各國直接連上 Tor 的人數估計
  userstats-bridge-combined.csv  各國透過橋接連線的人數，細到用哪一種規避協定

授權：CC0（metrics.torproject.org/about.html 寫明「Data on this site is freely
available under a CC0 no copyright declaration」）。跟 Onionoo 同源同授權，但產生方式
不同（一個是 API，一個是 CSV 下載），所以另存一個檔案，載入失敗也不會拖垮主體。

=== 這份資料補的是地球儀原本缺的那一半 ===

snapshot.json 畫的是「中繼架在哪裡」，那是供給端。這份是需求端：人在哪裡用。兩者的
地理分布差很多，歐洲幾國因為機房便宜佔了中繼大宗，使用者的排序完全是另一回事。

橋接那份跟 ooni.json 是一組的。OONI 說「這幾國連不上」，橋接資料說「所以他們改用什麼
繞過去」。實測中國是唯一以 snowflake 為主的國家，其他受阻國家都是 obfs4 打頭，這個差別
本身就說明了封鎖強度的不同。

=== 讀數字前要知道的事 ===

1. 這是估計值不是普查。Tor Metrics 用中繼收到的目錄請求反推，官方文件自己只稱其為
   estimate。CSV 裡的 lower/upper 是信心區間，台灣實測 10,585 人的區間是 3,722 到
   21,578，寬得很，畫面上要嘛標出區間，要嘛講清楚這是估計。
2. frac 欄位是「當天有多少比例的中繼回報了統計」，同一天所有國家的值都一樣，那是
   全網當日的資料完整度，不是逐國的信心水準。不要誤讀成「這國的數字比較不準」。
3. 小國樣本少，單日數字會劇烈跳動。這裡存 30 天平均就是為了壓掉那個雜訊，畫面上
   優先用平均值，單日值只當參考。
4. 橋接的國家分布只能從這種跨全部橋接聚合過的統計拿。Onionoo 在 2017 年主動移除了
   逐橋接的 countries 欄位，理由是小型橋接只服務少數人，逐橋接揭露國別有去匿名化
   風險。不要想辦法從單一橋接層級湊這個數字，湊得出來也不該做。

抓取注意：兩份 CSV 不帶日期參數會回傳 2011 年至今的全部歷史，各約 37 MB。務必帶
start 與 end。另外檔頭有幾行 # 註解，csv 模組要先濾掉才不會把 # 當成欄位名。

=== 評估過但不採用：Tor Metrics 的異常事件（events=on）===

Tor Metrics 有一套異常偵測，官網有「Top-10 countries by possible censorship events」
這張表。取法是在 userstats-relay-country.csv 加上 events=on 與 country=xx，回應會多
lower/upper 兩欄，實際人數掉出區間就算一次事件（沒有獨立的 CSV，
userstats-censorship-events.csv 回 404）。country=all 拿不到，只能逐國要。

實作跑過，結論是**這個訊號不適合畫在地球上**，已經退掉。

2026-07-30 對使用者數前 25 名的國家取近 90 天，事件最多的是愛爾蘭（跌破下界 7 次、
衝破上界 11 次）、捷克（3 / 10）、西班牙（3 / 5）。伊朗 0 / 8，中國 0 / 1。
對照官網自己的表，前幾名是土克斯與凱科斯群島（16 / 18）、東加（16 / 12）、
白俄羅斯（14 / 6）、密克羅尼西亞（13 / 10）、阿魯巴、萬那杜、安圭拉。愛爾蘭那組
數字跟本地算出來的完全一致，所以取法沒問題，是這份指標本身被小樣本雜訊主導，
正好是上面第 3 點講的那個現象。白俄羅斯是少數看起來有意義的一筆。

跟 ooni.json 的中段異常率是同一類陷阱，差別在 OONI 還能靠 85% 門檻切出訊號，
這個連「只取使用者數前段的國家」都濾不掉雜訊，愛爾蘭的使用者基數並不小。
要重新考慮的話，得先實作 Tor Metrics 技術報告裡真正的偵測演算法，而不是拿
lower/upper 直接比。

用法：
  python3 tools/gen_torusers_snapshot.py [輸出路徑]
"""
import csv
import io
import json
import os
import subprocess
import sys
import time
from collections import defaultdict
from datetime import date, timedelta

BASE = "https://metrics.torproject.org/"
USERS_CSV = "userstats-relay-country.csv"
BRIDGE_CSV = "userstats-bridge-combined.csv"
DAYS = 30              # 使用者數取這麼多天算平均，壓掉單日雜訊
BRIDGE_DAYS = 5        # 橋接只要最新一天，多抓幾天是因為最新幾天可能還沒產出
MIN_USERS = 50         # 少於這個數的國家不存，估計值在這個量級沒有意義
TOP_TRANSPORT = 4      # 每國留幾種規避協定
DEFAULT_OUT = os.path.join(os.path.dirname(__file__), "..", "docs", "zh-TW",
                           "games", "tor-network", "play", "torusers.json")


def fetch_csv(name, start, end):
    """抓一份 Tor Metrics CSV，回傳去掉註解行之後的 dict 列表。"""
    url = f"{BASE}{name}?start={start}&end={end}"
    for attempt in range(3):
        r = subprocess.run(["curl", "-s", "--max-time", "120", url],
                           capture_output=True, text=True).stdout
        if r and "date" in r[:2000]:
            lines = [ln for ln in io.StringIO(r) if not ln.startswith("#") and ln.strip()]
            return list(csv.DictReader(lines))
        print(f"  {name} 第 {attempt + 1} 次取回失敗，等一下再試", file=sys.stderr)
        time.sleep(5)
    raise SystemExit(f"{name} 取回失敗")


def main():
    out = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT)
    t0 = time.time()
    today = date.today()

    # 1) 各國直連使用者。資料有幾天延遲，用實際拿到的最新日期，不要假設是今天。
    rows = fetch_csv(USERS_CSV, (today - timedelta(days=DAYS + 5)).isoformat(), today.isoformat())
    rows = [r for r in rows if r.get("country") and r.get("users")]
    if not rows:
        raise SystemExit("使用者統計沒有資料")
    latest = max(r["date"] for r in rows)
    per_cc_days = defaultdict(list)
    for r in rows:
        cc = (r["country"] or "").lower()
        if len(cc) != 2 or cc == "??":
            continue
        try:
            per_cc_days[cc].append((r["date"], int(r["users"] or 0)))
        except ValueError:
            continue

    users, users_all = {}, 0
    for cc, days in per_cc_days.items():
        cur = next((n for d, n in days if d == latest), None)
        if cur is None or cur < MIN_USERS:
            continue
        avg = round(sum(n for _, n in days) / len(days))
        users[cc] = [cur, avg]
        users_all += cur

    # 2) 橋接使用者依規避協定。low/high 是區間，取中點當代表值。
    brows = fetch_csv(BRIDGE_CSV, (today - timedelta(days=BRIDGE_DAYS + 5)).isoformat(),
                      today.isoformat())
    brows = [r for r in brows if r.get("country") and r.get("transport")]
    bridge, bridge_date = {}, ""
    if brows:
        bridge_date = max(r["date"] for r in brows)
        acc = defaultdict(dict)
        for r in brows:
            if r["date"] != bridge_date:
                continue
            cc = (r["country"] or "").lower()
            if len(cc) != 2 or cc == "??":
                continue
            try:
                mid = (int(r["low"] or 0) + int(r["high"] or 0)) // 2
            except ValueError:
                continue
            if mid > 0:
                # <OR> 是沒有掛可插拔傳輸的一般橋接，畫面上叫「一般橋接」比較好懂
                acc[cc][r["transport"] or "?"] = mid
        for cc, m in acc.items():
            top = sorted(m.items(), key=lambda x: -x[1])[:TOP_TRANSPORT]
            bridge[cc] = [[k, v] for k, v in top]

    data = {
        "source": "Tor Metrics (metrics.torproject.org)",
        "sourceUrl": "https://metrics.torproject.org/",
        "license": "CC0 1.0",
        "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
        "date": latest,
        "days": DAYS,
        "note": ("使用者數是用中繼收到的目錄請求反推的估計值，不是普查，"
                 "官方文件也只稱其為 estimate。橋接數字同理。"),
        "usersAll": users_all,
        "users": users,          # ISO2 → [最新一天, 30 天平均]
        "bridgeDate": bridge_date,
        "bridge": bridge,        # ISO2 → [[協定, 人數], ...] 由多到少
    }
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"), ensure_ascii=False)

    top = sorted(users.items(), key=lambda x: -x[1][0])[:6]
    print(f"DONE → {out}（{time.time() - t0:.0f} 秒）")
    print(f"  使用者 {latest}｜{len(users)} 國｜合計 {users_all:,} 人")
    print("  前六：" + "、".join(f"{k.upper()} {v[0]:,}" for k, v in top))
    print(f"  橋接 {bridge_date}｜{len(bridge)} 國")
    for cc in ("ru", "cn", "ir", "tw"):
        if cc in bridge:
            print(f"    {cc.upper()}：" + "、".join(f"{k} {v:,}" for k, v in bridge[cc]))
    print(f"  檔案 {os.path.getsize(out):,} bytes")


if __name__ == "__main__":
    main()
