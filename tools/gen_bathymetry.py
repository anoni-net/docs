#!/usr/bin/env python3
"""產生「Tor 中繼地球儀」的海底地形（docs/zh-TW/games/tor-network/bathymetry.json）。

資料來源：Natural Earth 10m bathymetry（public domain），從 nvkelso/natural-earth-vector
取 GeoJSON，跟 gen_world_geo.py 同一個 repo、同一種取法。

=== 為什麼要這一層 ===

海面原本是一片沒有起伏的純色。加了深度之後最有用的一條線是大陸棚緣（-200 公尺），
海纜幾乎都沿著陸棚鋪、避開深海盆與海溝，所以陸棚一畫出來，既有的海纜層就從「海上
有些線」變成「線為什麼走這裡」。這是選這份資料而不是選別的海洋資料的理由。

=== 只取四層 ===

Natural Earth 提供 0、200、1000 一路到 10000 公尺共十二層。十二層疊在 2048 寬的貼圖上
是一團糊，而且深海那幾層的差異在畫面上根本分不出來。這裡只取四層：

  200   大陸棚緣，主角
  1000  陸坡
  3000  深海平原的起點
  5000  最深的那幾塊

這四層在畫面上是四階由淺到深的藍。沒有取的那八層不是資料有問題，是階數再多也讀不出來。

=== 簡化 ===

前端把這份畫進 2048x1024 的等距長方投影貼圖，一個像素約 0.176 度，所以座標留到小數
一位（0.1 度）就已經比貼圖細，再細只是讓檔案變大。

但位數不是重點，點數才是。原始的等深線沿著海底地形起伏，一條環動輒上千點，四捨五入
完全不會減少點數。實測只做四捨五入是 3.88 MB（gzip 847 KB），對照 countries.json
才 138 KB，整個作品現在也才載入幾百 KB，那個量級不能接受。

所以要真的做幾何化簡，用 Douglas-Peucker，容差設在貼圖一個像素上下。被拿掉的是那些
在貼圖上根本畫不出來的鋸齒。另外面積太小的環直接丟，那些在貼圖上不到幾個像素。

環（ring）要全部保留，不能像 gen_world_geo.py 那樣只取外環。等深線的洞是「這一塊比
周圍淺」，中洋脊就是這種形狀而且面積很大，丟掉洞會把整條中洋脊塗成深海。前端用
evenodd 填色，這樣不必假設 GeoJSON 的環繞方向有沒有照右手定則。

用法：
  python3 tools/gen_bathymetry.py [輸出路徑]
"""
import json
import os
import subprocess
import sys
import time

BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/"
# (深度公尺, 檔名)。順序就是畫的順序，由淺到深，深的疊在淺的上面。
LAYERS = [
    (200, "ne_10m_bathymetry_K_200.geojson"),
    (1000, "ne_10m_bathymetry_J_1000.geojson"),
    (3000, "ne_10m_bathymetry_H_3000.geojson"),
    (5000, "ne_10m_bathymetry_F_5000.geojson"),
]
PREC = 1          # 座標小數位數。貼圖一個像素約 0.176 度，0.1 度已經比貼圖細
TOLER = 0.18      # Douglas-Peucker 容差（度）。約等於貼圖一個像素
MIN_SPAN = 0.8    # 外接框長寬都小於這個度數的環就丟，貼圖上不到五個像素
MIN_PTS = 4       # 少於這麼多點的環構不成面
DEFAULT_OUT = os.path.join(os.path.dirname(__file__), "..", "docs", "zh-TW",
                           "games", "tor-network", "bathymetry.json")


def fetch(name):
    r = subprocess.run(["curl", "-sL", "--max-time", "300", BASE + name],
                       capture_output=True, text=True)
    if r.returncode != 0 or not r.stdout.startswith("{"):
        raise SystemExit(f"下載失敗：{name}")
    return json.loads(r.stdout)


def douglas_peucker(pts, tol):
    """經典的線段化簡。用堆疊跑，不遞迴，長環有上萬點會爆 Python 的遞迴上限。

    距離用平面上的點到線段距離，單位是度。等距長方投影下高緯度的一度經度比較短，
    所以高緯度實際被化簡得比較兇。這一層是海面的底色，那個偏差看不出來。
    """
    n = len(pts)
    if n < 3:
        return pts
    keep = [False] * n
    keep[0] = keep[n - 1] = True
    stack = [(0, n - 1)]
    while stack:
        i0, i1 = stack.pop()
        if i1 <= i0 + 1:
            continue
        x0, y0 = pts[i0]
        x1, y1 = pts[i1]
        dx, dy = x1 - x0, y1 - y0
        den = dx * dx + dy * dy
        best, bi = -1.0, -1
        for i in range(i0 + 1, i1):
            px, py = pts[i]
            if den <= 0:
                d = (px - x0) ** 2 + (py - y0) ** 2
            else:
                # 投影參數夾在 0 到 1，端點外的點算到端點的距離
                t = ((px - x0) * dx + (py - y0) * dy) / den
                t = 0.0 if t < 0 else (1.0 if t > 1 else t)
                qx, qy = x0 + t * dx, y0 + t * dy
                d = (px - qx) ** 2 + (py - qy) ** 2
            if d > best:
                best, bi = d, i
        if best > tol * tol:
            keep[bi] = True
            stack.append((i0, bi))
            stack.append((bi, i1))
    return [pts[i] for i in range(n) if keep[i]]


def simplify(ring):
    """化簡、四捨五入、丟掉太小的環。回傳扁平化的 lon/lat 陣列或 None。"""
    pts = [(p[0], p[1]) for p in ring]
    if len(pts) < MIN_PTS:
        return None
    pts = douglas_peucker(pts, TOLER)
    out = []
    lo0 = la0 = 1e9
    lo1 = la1 = -1e9
    prev = None
    for lon, lat in pts:
        lon, lat = round(lon, PREC), round(lat, PREC)
        if (lon, lat) == prev:   # 化簡完再四捨五入，還是可能壓出相鄰重複點
            continue
        prev = (lon, lat)
        out.append(lon)
        out.append(lat)
        lo0 = min(lo0, lon); lo1 = max(lo1, lon)
        la0 = min(la0, lat); la1 = max(la1, lat)
    if len(out) < MIN_PTS * 2:
        return None
    if (lo1 - lo0) < MIN_SPAN and (la1 - la0) < MIN_SPAN:
        return None
    return out


def rings_of(feature):
    """一個 feature 底下所有的環，外環與洞都要。洞是「比周圍淺」的區域，丟不得。"""
    g = feature.get("geometry") or {}
    t = g.get("type")
    if t == "Polygon":
        polys = [g["coordinates"]]
    elif t == "MultiPolygon":
        polys = g["coordinates"]
    else:
        return []
    return [ring for poly in polys for ring in poly]


def main():
    out = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT)
    t0 = time.time()
    levels = []
    for depth, name in LAYERS:
        gj = fetch(name)
        kept, dropped, pts = [], 0, 0
        for feat in gj.get("features", []):
            for ring in rings_of(feat):
                s = simplify(ring)
                if s is None:
                    dropped += 1
                    continue
                kept.append(s)
                pts += len(s) // 2
        levels.append({"d": depth, "p": kept})
        print(f"  {name}｜環 {len(kept)} 保留、{dropped} 丟棄｜點 {pts:,}")

    data = {
        "source": "Natural Earth",
        "sourceUrl": "https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-bathymetry/",
        "license": "public domain",
        "licenseUrl": "https://www.naturalearthdata.com/about/terms-of-use/",
        "note": ("Natural Earth 10m 等深線，只取 200、1000、3000、5000 四層，"
                 "座標簡化到 0.1 度。環包含洞，前端要用 evenodd 填色。"),
        "levels": levels,   # 由淺到深，前端照順序畫，深的疊在淺的上面
    }
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
    size = os.path.getsize(out)
    print(f"DONE → {out}（{time.time() - t0:.0f} 秒）")
    print(f"  檔案 {size:,} bytes（{size / 1024 / 1024:.2f} MB）")


if __name__ == "__main__":
    main()
