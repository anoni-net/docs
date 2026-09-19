#!/usr/bin/env python3
"""產生「Tor 中繼地球儀」的世界底圖資料（docs/zh-TW/games/tor-network/play/）。

資料來源：Natural Earth 50m（public domain），從 nvkelso/natural-earth-vector 取 GeoJSON。

=== 為什麼從 110m 換成 50m ===

站上的讀者多半在亞洲，而 110m 那個比例尺對這一帶太粗：新加坡、香港、澳門整個
沒有收錄，金門被畫進中國的多邊形裡，島鏈的形狀全是幾個點連成的折線。新加坡有
一百多台中繼、香港十幾台，在六角層上卻一格都分不到，因為那裡根本沒有陸地。

50m 這四個都有。代價是座標數從 10,642 漲到 99,432，所以要簡化。

=== 亞洲用細的容差，其餘用粗的 ===

同一份 50m 的資料，簡化時給兩種容差：亞洲那個框裡用 0.01 度（約 1.1 公里），
框外用 0.05 度（約 5.5 公里，跟 110m 的精度相當）。這樣讀者最常看的那一區細，
其餘維持原本的檔案量級，而且因為是同一份來源，兩區之間沒有接縫。

分界照國家的外接框判，不是照 Natural Earth 的 CONTINENT 欄位。那個欄位把俄羅斯
整個歸在 Europe，照它切的話西伯利亞會用粗的容差，跟隔壁的蒙古、哈薩克對不齊。

輸出兩個檔：
  countries.json  國家多邊形，給前端畫成海陸填色、國界線、依中繼數上色的等值區圖
                  { c: [ { k: "tw", m: [lon, lat], p: [[lon,lat,lon,lat,...], ...] }, ... ] }
                  k = ISO 3166-1 alpha-2 小寫（對得上 Onionoo 的 country 欄位），無代碼者為空字串
                  m = 最大環的質心，給前端當國家定位的後備值
                  p = 外環座標，扁平化的 lon/lat 陣列，四捨五入到小數兩位（110m 的精度上限）
  continents.json 海岸線線段，給前端畫成發光輪廓
                  { seg: [lon0,lat0,lon1,lat1, ...] }，每四個數字一條線段

用法：
  python3 tools/gen_world_geo.py
"""
import json
import os
import subprocess
import sys

BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "docs", "zh-TW", "games", "tor-network", "play")


def fetch(name):
    r = subprocess.run(["curl", "-sL", "--max-time", "120", BASE + name], capture_output=True, text=True)
    if r.returncode != 0 or not r.stdout.startswith("{"):
        raise SystemExit(f"下載失敗：{name}")
    return json.loads(r.stdout)


# 亞洲那個框。東邊到 180，西邊收在 25 度（含中東），南到 -12（印尼南端），
# 北到 82（西伯利亞北岸）。框裡的國家用細的容差。
ASIA_BOX = (25.0, -12.0, 180.0, 82.0)
# 容差。座標一律存兩位小數，也就是 0.01 度，所以細的那一邊沒必要小於這個數。
TOL_FINE = 0.01    # 約 1.1 公里，亞洲那個框裡
TOL_COARSE = 0.16  # 約 18 公里，框外。110m 的實際點距就在這個量級


def simplify(ring, tol):
    """道格拉斯-普克。座標是經緯度，容差用度，高緯度會比實際公里數嚴一點，無妨。

    迭代版而不是遞迴版：俄羅斯與加拿大的單一環有上萬個點，遞迴會把 Python 的
    堆疊吃完。
    """
    n = len(ring)
    if n < 3:
        return ring
    keep = [False] * n
    keep[0] = keep[n - 1] = True
    stack = [(0, n - 1)]
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        x0, y0 = ring[i]
        x1, y1 = ring[j]
        dx, dy = x1 - x0, y1 - y0
        den = dx * dx + dy * dy
        best, bi = -1.0, -1
        for k in range(i + 1, j):
            x, y = ring[k]
            if den < 1e-18:
                d = (x - x0) ** 2 + (y - y0) ** 2
            else:
                t = ((x - x0) * dx + (y - y0) * dy) / den
                t = 0.0 if t < 0 else (1.0 if t > 1 else t)
                px, py = x0 + t * dx, y0 + t * dy
                d = (x - px) ** 2 + (y - py) ** 2
            if d > best:
                best, bi = d, k
        if best > tol * tol:
            keep[bi] = True
            stack.append((i, bi))
            stack.append((bi, j))
    return [ring[i] for i in range(n) if keep[i]]


def rings_of(feature):
    g = feature["geometry"]
    polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
    return [p[0] for p in polys]  # 只取外環，110m 內環（洞）僅一處且視覺上無差別


def centroid(ring):
    """外環的面積加權質心。大多數國家會落在陸地上，夠當定位後備值。"""
    a = cx = cy = 0.0
    for i in range(len(ring) - 1):
        x0, y0 = ring[i]
        x1, y1 = ring[i + 1]
        f = x0 * y1 - x1 * y0
        a += f
        cx += (x0 + x1) * f
        cy += (y0 + y1) * f
    if abs(a) < 1e-9:
        xs = [p[0] for p in ring]
        ys = [p[1] for p in ring]
        return [sum(xs) / len(xs), sum(ys) / len(ys)]
    return [cx / (3 * a), cy / (3 * a)]


def in_asia(p):
    """這個點在不在亞洲那個框裡。"""
    return ASIA_BOX[0] <= p[0] <= ASIA_BOX[2] and ASIA_BOX[1] <= p[1] <= ASIA_BOX[3]


def simplify_mixed(line):
    """沿著線切段，框內的段用細容差，框外用粗的。

    第一版是拿整個環的外接框判，結果俄羅斯橫跨 180 度必定命中，整條北極海岸線
    都吃了細容差，兩份檔案合起來漲到 1.5 MB。改成逐點判、沿線切段之後，同一個
    國家的歐洲側與西伯利亞側可以各走各的。

    切點重疊放進兩段，接回去才不會斷。
    """
    if len(line) < 3:
        return line, len(line)
    segs = []
    cur = [line[0]]
    fine = in_asia(line[0])
    for p in line[1:]:
        f = in_asia(p)
        if f != fine:
            cur.append(p)
            segs.append((fine, cur))
            cur = [p]
            fine = f
        else:
            cur.append(p)
    segs.append((fine, cur))
    out = []
    fine_pts = 0
    for f, seg in segs:
        simp = simplify(seg, TOL_FINE if f else TOL_COARSE)
        if f:
            fine_pts += len(simp)
        out.extend(simp if not out else simp[1:])
    return out, fine_pts


def build_countries():
    d = fetch("ne_50m_admin_0_countries.geojson")
    out = []
    kept = dropped = 0
    for f in d["features"]:
        iso = f["properties"].get("ISO_A2_EH") or f["properties"].get("ISO_A2") or "-99"
        key = "" if iso in ("-99", "-9") else iso.lower()
        rings, biggest, best = [], None, -1.0
        for ring in rings_of(f):
            simp, fine_n = simplify_mixed(ring)
            kept += len(simp)
            dropped += len(ring) - len(simp)
            flat = []
            last = None
            for x, y in simp:
                # 兩位小數就是 0.01 度，跟細的那一邊的容差同級，再多一位是白付檔案大小。
                # 四捨五入之後相鄰點可能重合，去掉才不會留下零長度的邊。
                xy = (round(x, 2), round(y, 2))
                if xy == last:
                    continue
                last = xy
                flat += [xy[0], xy[1]]
            if len(flat) < 8:
                continue
            rings.append(flat)
            xs = [p[0] for p in ring]
            ys = [p[1] for p in ring]
            span = (max(xs) - min(xs)) * (max(ys) - min(ys))
            if span > best:
                best, biggest = span, ring
        if not rings:
            continue
        m = centroid(biggest)
        out.append({"k": key, "m": [round(m[0], 2), round(m[1], 2)], "p": rings})
    print(f"  國界：{len(out)} 國，簡化後留下 {kept:,} 個座標，丟掉 {dropped:,} 個")
    return {"c": out}


def build_coastline():
    """海岸線。跟國界同一份比例尺與同一組容差，兩層才不會在亞洲那一帶錯開。"""
    d = fetch("ne_50m_coastline.geojson")
    seg = []
    for f in d["features"]:
        g = f["geometry"]
        lines = g["coordinates"] if g["type"] == "MultiLineString" else [g["coordinates"]]
        for line in lines:
            simp, _ = simplify_mixed(line)
            for i in range(len(simp) - 1):
                x0, y0 = simp[i]
                x1, y1 = simp[i + 1]
                if abs(x1 - x0) > 180:  # 跨換日線的假線段，略過
                    continue
                seg += [round(x0, 2), round(y0, 2), round(x1, 2), round(y1, 2)]
    print(f"  海岸線：{len(seg) // 4:,} 條線段")
    return {"seg": seg}


# 每份資料檔都自帶來源與授權，是 NOTICE 那張表的機器可讀版本。少一份就等於 NOTICE 說謊。
CREDIT = {
    "source": "Natural Earth",
    "sourceUrl": "https://www.naturalearthdata.com/",
    "license": "public domain",
    "licenseUrl": "https://www.naturalearthdata.com/about/terms-of-use/",
}


def write(name, data):
    data = {**CREDIT, **data}
    path = os.path.abspath(os.path.join(OUT_DIR, name))
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
    print(f"DONE → {path}  ({os.path.getsize(path) // 1024} KB)")


def main():
    write("countries.json", build_countries())
    write("continents.json", build_coastline())
    return 0


if __name__ == "__main__":
    sys.exit(main())
