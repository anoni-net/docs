#!/usr/bin/env python3
"""產生「Tor 中繼地球儀」的海底電纜底圖（docs/zh-TW/games/tor-network/cables.json）。

資料來源：OpenStreetMap，經 Overpass API 取 communication=line + submarine=yes 的線段。
授權 ODbL，使用時要標註「© OpenStreetMap contributors」，畫面上與這個檔案都有註明。

OSM 的海底電纜覆蓋並不完整（例如台灣周邊只收錄了一部分），這個圖層的定位是「海洋
不要一片空白」的背景質感，不是完整的海纜清單，畫面文案要照這個口徑寫。

Overpass 是志工營運的公共服務，這支腳本刻意分區慢慢抓並重試，不要縮短間隔或平行化。

用法：
  python3 tools/gen_cables.py [輸出路徑]
"""
import json
import math
import os
import subprocess
import sys
import time

API = os.environ.get("OVERPASS_API", "https://overpass-api.de/api/interpreter")
UA = "anoni.net-globe/1.0 (docs.anoni.net; submarine cable basemap)"
LON_STEP = 30          # 每塊經度寬度，太大會逾時
PAUSE = 8              # 每次查詢之間的間隔秒數，對公共服務的基本禮貌
RETRY = 3
TOLERANCE = 0.015      # 簡化容差（度）。0.05 會把 63% 的線砍成兩點直線，形狀整個沒了
MIN_POINTS = 2
DEFAULT_OUT = os.path.join(os.path.dirname(__file__), "..", "docs", "zh-TW",
                           "games", "tor-network", "cables.json")


def overpass(lon0, lon1):
    q = ('[out:json][timeout:120];'
         f'way["communication"="line"]["submarine"="yes"](-85,{lon0},85,{lon1});'
         'out geom;')
    for attempt in range(RETRY):
        r = subprocess.run(
            ["curl", "-s", "--max-time", "180", "-H", f"User-Agent: {UA}",
             "-X", "POST", API, "--data-urlencode", f"data={q}"],
            capture_output=True, text=True).stdout
        if r.lstrip().startswith("{"):
            try:
                return json.loads(r).get("elements", [])
            except json.JSONDecodeError:
                pass
        wait = PAUSE * (attempt + 2)
        print(f"    第 {attempt + 1} 次失敗（多半是速率限制），等 {wait} 秒再試", file=sys.stderr)
        time.sleep(wait)
    print(f"    經度 {lon0}..{lon1} 放棄", file=sys.stderr)
    return []


def perp(px, py, ax, ay, bx, by):
    """點到線段的垂直距離，簡化用。"""
    dx, dy = bx - ax, by - ay
    if dx == 0 and dy == 0:
        return math.hypot(px - ax, py - ay)
    t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def simplify(pts, tol):
    """Douglas-Peucker。座標點數直接決定檔案大小，這裡砍掉肉眼看不出的轉折。"""
    if len(pts) <= 2:
        return pts
    ax, ay = pts[0]
    bx, by = pts[-1]
    worst, idx = 0.0, 0
    for i in range(1, len(pts) - 1):
        d = perp(pts[i][0], pts[i][1], ax, ay, bx, by)
        if d > worst:
            worst, idx = d, i
    if worst <= tol:
        return [pts[0], pts[-1]]
    return simplify(pts[:idx + 1], tol)[:-1] + simplify(pts[idx:], tol)


def main():
    out = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT)
    t0 = time.time()
    seen, lines = set(), []
    for lon0 in range(-180, 180, LON_STEP):
        lon1 = lon0 + LON_STEP
        els = overpass(lon0, lon1)
        print(f"  經度 {lon0:>4}..{lon1:<4} → {len(els)} 條", file=sys.stderr)
        for e in els:
            if e.get("id") in seen:
                continue        # 跨區塊的線會被兩邊都抓到
            seen.add(e.get("id"))
            geom = e.get("geometry") or []
            pts = [(round(g["lon"], 3), round(g["lat"], 3)) for g in geom if "lon" in g]
            if len(pts) < MIN_POINTS:
                continue
            pts = simplify(pts, TOLERANCE)
            lines.append(pts)
        time.sleep(PAUSE)

    # 攤平成 [lon, lat, lon, lat, ...]，前端直接讀，不用再解物件
    flat = [[c for p in ln for c in p] for ln in lines]
    total_pts = sum(len(f) // 2 for f in flat)
    data = {
        "source": "OpenStreetMap contributors",
        "license": "ODbL 1.0",
        "note": "communication=line + submarine=yes。OSM 的海纜覆蓋不完整，這是底圖不是完整清單。",
        "lines": flat,
    }
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
    print(f"DONE → {out}（{time.time() - t0:.0f} 秒）")
    print(f"  {len(flat)} 條線，{total_pts:,} 個座標點，{os.path.getsize(out):,} bytes")


if __name__ == "__main__":
    main()
