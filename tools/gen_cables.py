#!/usr/bin/env python3
"""產生「Tor 中繼地球儀」的海底電纜底圖（docs/zh-TW/games/tor-network/cables.json）。

資料來源：OpenStreetMap，經 Overpass API 取 seamark:type=cable_submarine 的線段。
海纜在 OSM 主要是用航海圖那套 seamark 標籤在記（海纜關係到船隻拋錨），數量是
communication=line + submarine=yes 的十幾倍，亞太的覆蓋差別尤其大。
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
LON_STEP = 15          # 每塊經度寬度，太大會逾時。換標籤後資料多了十幾倍，切細一點
PAUSE = 8              # 每次查詢之間的間隔秒數，對公共服務的基本禮貌
RETRY = 3
TOLERANCE = 0.015      # 簡化容差（度）。0.05 會把 63% 的線砍成兩點直線，形狀整個沒了
MIN_POINTS = 2
MIN_LEN_KM = 15        # 太短的多半是港內或登陸段，畫在地球儀上只是雜點
STITCH_KM = 40         # 端點相距這個距離以內就接起來，OSM 把一條電纜拆成多個 way
DEFAULT_OUT = os.path.join(os.path.dirname(__file__), "..", "docs", "zh-TW",
                           "games", "tor-network", "cables.json")


def overpass(lon0, lon1):
    q = ('[out:json][timeout:120];'
         f'way["seamark:type"="cable_submarine"](-85,{lon0},85,{lon1});'
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


def hav_km(a, b):
    """兩個 (lon, lat) 的球面距離，公里。"""
    r = 6371
    p1, p2 = math.radians(a[1]), math.radians(b[1])
    dp, dl = math.radians(b[1] - a[1]), math.radians(b[0] - a[0])
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(min(1, math.sqrt(h)))


def stitch(lines, tol_km=STITCH_KM):
    """把首尾相近的線接起來。

    OSM 常把一條電纜拆成好幾個 way，端點之間留下幾公里到幾十公里的縫。畫在地球上
    就是一段一段斷開的線，看起來像渲染壞掉，其實是資料的切法。這裡把接得起來的接起來。
    """
    remain = [list(ln) for ln in lines]
    out = []
    while remain:
        cur = remain.pop()
        joined = True
        while joined:
            joined = False
            for i, other in enumerate(remain):
                pairs = (
                    (hav_km(cur[-1], other[0]), False, False),   # 尾接頭
                    (hav_km(cur[-1], other[-1]), False, True),   # 尾接尾（對方要反轉）
                    (hav_km(cur[0], other[-1]), True, False),    # 頭接尾
                    (hav_km(cur[0], other[0]), True, True),      # 頭接頭（對方要反轉）
                )
                d, at_head, flip = min(pairs, key=lambda x: x[0])
                if d > tol_km:
                    continue
                seg = list(reversed(other)) if flip else other
                cur = (seg[:-1] + cur) if at_head else (cur + seg[1:])
                remain.pop(i)
                joined = True
                break
        out.append(cur)
    return out


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
            lines.append(pts)
        time.sleep(PAUSE)

    # 濾掉太短的線段
    def length_km(pts):
        return sum(hav_km(pts[i], pts[i + 1]) for i in range(len(pts) - 1))
    lines = [ln for ln in lines if length_km(ln) >= MIN_LEN_KM]

    # 先接合再簡化。順序反過來的話，簡化會先把端點挪動，接縫更難對上。
    before = len(lines)
    lines = stitch(lines)
    lines = [simplify(ln, TOLERANCE) for ln in lines]
    print(f"  接合：{before} 條 → {len(lines)} 條", file=sys.stderr)

    # 攤平成 [lon, lat, lon, lat, ...]，前端直接讀，不用再解物件
    flat = [[c for p in ln for c in p] for ln in lines]
    total_pts = sum(len(f) // 2 for f in flat)
    data = {
        "source": "OpenStreetMap contributors",
        "license": "ODbL 1.0",
        "note": "seamark:type=cable_submarine。OSM 的海纜覆蓋仍不完整，這是底圖不是完整清單。",
        "lines": flat,
    }
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
    print(f"DONE → {out}（{time.time() - t0:.0f} 秒）")
    print(f"  {len(flat)} 條線，{total_pts:,} 個座標點，{os.path.getsize(out):,} bytes")


if __name__ == "__main__":
    main()
