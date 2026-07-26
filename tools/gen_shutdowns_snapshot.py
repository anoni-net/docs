#!/usr/bin/env python3
"""產生「Tor 中繼地球儀」的斷網事件資料（docs/zh-TW/games/tor-network/shutdowns.json）。

資料來源：Access Now 的 #KeepItOn STOP（Shutdown Tracker Optimization Project），
由 #KeepItOn 聯盟人工彙整、逐筆查證的全球網路關閉事件庫，公開在 Google Sheet。

授權：CC BY 4.0（accessnow.org 的 #KeepItOn 資料頁標示）。跟站台的 CC-BY 4.0 相容，
但仍另存一個檔案，跟 CC0 的 Tor Metrics 與 CC BY-NC-SA 的 OONI 分開，這樣每份資料
受哪個授權拘束不會講不清楚。

=== 為什麼這份資料比測量類的乾淨 ===

ooni.json 那層的 anomaly 是統計異常，成因要我們自己猜，所以只敢標極端值。這份不一樣，
每筆事件的成因是人工查證後填在 actual_cause 欄位裡的，還附 info_source_link 可以回溯到
原始新聞或 OONI Explorer。要講「這裡發生過人為斷網、理由是什麼」，這份資料撐得住。

實測的成因分布很說明問題：除了 Conflict、Protests、Information control 之外，還有
Exam cheating（為了防考試作弊關掉全國網路）與 Visits by government officials（官員
來訪期間斷網）這種分類。

=== 三個要注意的地方 ===

1. Conflict 與 Communal violence 這兩類未必是政府主動決策，可能是戰事破壞基礎設施或
   第三方衝突連帶造成。呈現時要跟資訊管制類分開，不要一律講成「政府封鎖」。這裡把
   分類原樣存下來，判斷交給畫面那一層。
2. 這是人工彙整，更新是不定期的，比即時測量慢。畫面上要寫清楚資料截止時間，不要讓人
   以為是即時狀態。
3. 事件數多寡跟該國是否被關注有關。有國際組織長期盯著的地方紀錄比較完整，沒人盯的
   地方不代表沒發生過。這是所有人工事件庫共通的取樣偏差。

另外印度的事件數是全球數一數二的，成因多半是地區性斷網（單一邦或單一區），跟 ooni.json
標紅的那幾個全國性受阻國家性質不同，一起呈現時要留意這個差別。

用法：
  python3 tools/gen_shutdowns_snapshot.py [輸出路徑]
"""
import csv
import io
import json
import os
import subprocess
import sys
import time
from collections import Counter, defaultdict

# Access Now 的公開 Google Sheet，從 accessnow.org/keepiton-data-spreadsheet 轉址過來
SHEET = ("https://docs.google.com/spreadsheets/d/"
         "1DvPAuHNLp5BXGb0nnZDGNoiIwEeu2ogdXEIDvT4Hyfk/export?format=csv")
DEFAULT_OUT = os.path.join(os.path.dirname(__file__), "..", "docs", "zh-TW",
                           "games", "tor-network", "shutdowns.json")

# 資料裡的國名是 UN 全稱，要對成地球儀用的 ISO2。沒有 pycountry 可用，而且只有 52 個，
# 手工對照反而好審。新增國家時這裡會噴警告，不會安靜漏掉。
ISO2 = {
    "Afghanistan": "af", "Albania": "al", "Algeria": "dz", "Angola": "ao",
    "Belarus": "by", "Cambodia": "kh", "Cameroon": "cm", "Central African Republic": "cf",
    "Chad": "td", "China": "cn", "Congo (Democratic Republic of the)": "cd",
    "Equatorial Guinea": "gq", "Ethiopia": "et", "Guinea": "gn", "Guinea-Bissau": "gw",
    "India": "in", "Indonesia": "id", "Iran (Islamic Republic of)": "ir", "Iraq": "iq",
    "Jordan": "jo", "Kenya": "ke", "Kyrgyzstan": "kg", "Latvia": "lv", "Lebanon": "lb",
    "Libya": "ly", "Lithuania": "lt", "Malaysia": "my", "Myanmar": "mm", "Nepal": "np",
    "Nigeria": "ng", "Oman": "om", "Pakistan": "pk", "Palestine, State of": "ps",
    "Panama": "pa", "Papua New Guinea": "pg", "Qatar": "qa", "Russian Federation": "ru",
    "Saudi Arabia": "sa", "South Sudan": "ss", "Sudan": "sd", "Syrian Arab Republic": "sy",
    "Tanzania, United Republic of": "tz", "Togo": "tg", "Turkey": "tr",
    "Turkmenistan": "tm", "Uganda": "ug", "Ukraine": "ua",
    "United Arab Emirates": "ae", "United States of America": "us",
    "Venezuela (Bolivarian Republic of)": "ve", "Viet Nam": "vn", "Yemen": "ye",
}
# 政府主動決策的資訊管制類。Conflict 與 Communal violence 刻意不列入，那兩類可能是
# 戰事破壞或第三方衝突造成，算進來會把「基礎設施被打壞」講成「政府下令封鎖」。
CONTROL_CAUSES = {"Information control", "Protests", "Elections",
                  "Exam cheating", "Visits by government officials"}


def fetch():
    for attempt in range(3):
        r = subprocess.run(["curl", "-sL", "--max-time", "120", SHEET],
                           capture_output=True, text=True).stdout
        if r and "country" in r[:4000]:
            return list(csv.DictReader(io.StringIO(r)))
        print(f"  第 {attempt + 1} 次取回失敗，等一下再試", file=sys.stderr)
        time.sleep(5)
    raise SystemExit("KeepItOn 試算表取回失敗")


def year_of(s):
    """欄位是 M/D/YYYY，只取年份。格式壞掉的就放棄這一筆的年份。"""
    parts = (s or "").split("/")
    if len(parts) == 3 and parts[2].isdigit():
        return int(parts[2])
    return None


def main():
    out = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT)
    t0 = time.time()
    rows = fetch()

    per_cc = defaultdict(lambda: {"n": 0, "c": Counter(), "y": 0, "ctl": 0})
    causes_all = Counter()
    years, unknown_names, total = [], Counter(), 0
    for r in rows:
        raw = (r.get("country") or "").strip()
        if not raw:
            continue
        cause = (r.get("actual_cause") or "").strip() or "Unknown"
        y = year_of(r.get("start_date"))
        if y:
            years.append(y)
        causes_all[cause] += 1
        total += 1
        # 少數事件橫跨兩國，用分號隔開，兩邊各算一次
        for name in [x.strip() for x in raw.split(";") if x.strip()]:
            cc = ISO2.get(name)
            if not cc:
                unknown_names[name] += 1
                continue
            e = per_cc[cc]
            e["n"] += 1
            e["c"][cause] += 1
            if cause in CONTROL_CAUSES:
                e["ctl"] += 1
            if y and y > e["y"]:
                e["y"] = y

    if unknown_names:
        print("  對不到 ISO2 的國名（請補進 ISO2 表）：", file=sys.stderr)
        for n, k in unknown_names.most_common():
            print(f"    {n}（{k} 筆）", file=sys.stderr)

    data = {
        "source": "Access Now #KeepItOn / STOP",
        "sourceUrl": "https://www.accessnow.org/keepiton-data-dashboard/",
        "license": "CC BY 4.0",
        "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
        "total": total,
        "years": [min(years), max(years)] if years else [],
        "note": ("人工彙整、逐筆查證的斷網事件。Conflict 與 Communal violence 未必是"
                 "政府主動決策，可能是戰事破壞基礎設施，畫面上要跟資訊管制類分開講。"),
        "controlCauses": sorted(CONTROL_CAUSES),
        "causesAll": dict(causes_all.most_common()),
        # ISO2 → [事件數, 資訊管制類件數, 最近年份, {成因: 次數}]
        "cc": {cc: [e["n"], e["ctl"], e["y"], dict(e["c"].most_common(4))]
               for cc, e in per_cc.items()},
    }
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"), ensure_ascii=False)

    top = sorted(per_cc.items(), key=lambda x: -x[1]["n"])[:8]
    print(f"DONE → {out}（{time.time() - t0:.0f} 秒）")
    print(f"  {total} 筆事件｜{len(per_cc)} 國｜{data['years'][0]} ~ {data['years'][1]}")
    print("  事件最多：" + "、".join(f"{cc.upper()} {e['n']}" for cc, e in top))
    print("  成因：" + "、".join(f"{k} {v}" for k, v in causes_all.most_common(6)))
    print(f"  檔案 {os.path.getsize(out):,} bytes")


if __name__ == "__main__":
    main()
