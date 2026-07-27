#!/usr/bin/env python3
"""產生「Tor 中繼地球儀」的 OONI 觀測快照（docs/zh-TW/games/tor-network/ooni.json）。

資料來源：OONI（Open Observatory of Network Interference）的 aggregation API，
免驗證、免金鑰。取 tor 測試近 30 天各國的測試數與異常數。

授權：OONI 發布的測量資料是 CC BY-NC-SA 4.0，明文涵蓋 api.ooni.io 與 explorer.ooni.io
（https://github.com/ooni/license/blob/master/data/LICENSE.md）。三個條款都要照顧到：
  BY  來源要標註，畫面上的 credit 與這個檔案的 source 欄位都有寫。
  NC  非商業使用。anoni.net 是社群站，這一層不得用於商業情境。
  SA  這份衍生資料沿用同一個授權，ooni.json 的 license 欄位就是給下游看的。
所以這份資料刻意跟 snapshot.json（Onionoo）分開存。兩邊授權不同，混在一個檔案裡
會讓「哪些欄位受哪個授權拘束」講不清楚。

=== 讀這支程式前一定要知道的事：anomaly 不等於審查 ===

OONI 的 anomaly 只代表「測試沒有照預期完成」，成因包含審查、網路不穩、ISP 暫時性
故障、測試程式本身的問題。把 anomaly 當成封鎖率畫在地圖上會產生假指控。

實測（2026-07，近 30 天）佐證：
  torsf（snowflake）  UY 100%、SN 99.5%、DE 89.3%   → 整個不能用。德國是中繼第二大國
  vanilla_tor         NZ 71%、CY 60%、EE 54%、PT 44% → 整個不能用。全是非審查國家
  tor                 PK 100%、EG 97.6%、RU 95.8%    → 只有高端對得上現實
所以這裡只取 tor 測試，而且只把高到極端的那幾國標成「明顯受阻」。tor 測試的中段同樣
是雜訊，實測 CA 21.2%、CH 22.2%、NZ 41.1%，那些數字拿來上色會讓瑞士看起來像審查國家。

confirmed_count 對 tor 測試幾乎恆為 0，因為 Tor 連不上不會回一個封鎖頁，只是連不上，
沒有 blockpage 可以判定。想靠 confirmed 拿乾淨訊號在這個測試上行不通。

用法：
  python3 tools/gen_ooni_snapshot.py [輸出路徑]
"""
import json
import os
import subprocess
import sys
import time
from datetime import date, timedelta

API = os.environ.get("OONI_API", "https://api.ooni.org/api/v1/aggregation")
TEST = "tor"          # 見上方說明，torsf 與 vanilla_tor 的 anomaly 是雜訊，不要換
DAYS = 30
MIN_MEASURE = 300     # 測試數太少的國家，比率沒有意義（幾十次測試一個壞探針就爆表）
BLOCK_PCT = 85        # 標成「明顯受阻」的門檻。壓這麼高是因為中段全是雜訊
DEFAULT_OUT = os.path.join(os.path.dirname(__file__), "..", "docs", "zh-TW",
                           "games", "tor-network", "ooni.json")


def fetch(since, until):
    args = ["curl", "-s", "--max-time", "90", "-G", API,
            "--data-urlencode", f"test_name={TEST}",
            "--data-urlencode", f"since={since}",
            "--data-urlencode", f"until={until}",
            "--data-urlencode", "axis_x=probe_cc"]
    for attempt in range(3):
        r = subprocess.run(args, capture_output=True, text=True).stdout
        if r.lstrip().startswith("{"):
            try:
                return json.loads(r).get("result") or []
            except json.JSONDecodeError:
                pass
        print(f"  第 {attempt + 1} 次取回失敗，等一下再試", file=sys.stderr)
        time.sleep(5)
    raise SystemExit("OONI aggregation API 取回失敗")


def main():
    out = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT)
    until = date.today()
    since = until - timedelta(days=DAYS)
    t0 = time.time()

    rows = fetch(since.isoformat(), until.isoformat())
    cc = {}
    blocked = []
    for r in rows:
        m = r.get("measurement_count") or 0
        if not m:
            continue
        key = (r.get("probe_cc") or "").lower()
        if len(key) != 2:
            continue
        # anomaly 與 confirmed 都算進「沒有照預期完成」。confirmed 在 tor 測試幾乎恆為 0，
        # 加它是為了萬一哪天 OONI 改了判定方式，這裡不會漏掉。
        a = (r.get("anomaly_count") or 0) + (r.get("confirmed_count") or 0)
        cc[key] = [m, a]
        if m >= MIN_MEASURE and a / m * 100 >= BLOCK_PCT:
            blocked.append(key)
    blocked.sort(key=lambda k: -cc[k][1] / cc[k][0])

    total_m = sum(v[0] for v in cc.values())
    total_a = sum(v[1] for v in cc.values())
    data = {
        "source": "OONI (Open Observatory of Network Interference)",
        "sourceUrl": "https://ooni.org/",
        "license": "CC BY-NC-SA 4.0",
        "licenseUrl": "https://github.com/ooni/license/blob/master/data/LICENSE.md",
        "test": TEST,
        "since": since.isoformat(),
        "until": until.isoformat(),
        "days": DAYS,
        "minMeasure": MIN_MEASURE,
        "blockPct": BLOCK_PCT,
        "note": ("anomaly 代表測試沒有照預期完成，成因包含審查、網路不穩與 ISP 故障。"
                 "blocked 只收異常率極高且樣本足夠的國家，中段數值是雜訊，不要拿來上色。"),
        "all": [total_m, total_a],
        "blocked": blocked,        # 異常率高到可以指名的國家，由高到低
        "cc": cc,                  # ISO2 → [測試數, 異常數]
    }
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
    print(f"DONE → {out}（{time.time() - t0:.0f} 秒）")
    print(f"  {since} ~ {until}｜{len(cc)} 國｜測試 {total_m:,} 次｜異常 {total_a:,} 次"
          f"（{total_a / total_m * 100:.1f}%）")
    print(f"  明顯受阻（>={BLOCK_PCT}% 且 >={MIN_MEASURE} 次）："
          + "、".join(f"{k.upper()} {cc[k][1] / cc[k][0] * 100:.0f}%" for k in blocked))
    print(f"  檔案 {os.path.getsize(out):,} bytes")


if __name__ == "__main__":
    main()
