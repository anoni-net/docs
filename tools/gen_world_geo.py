#!/usr/bin/env python3
"""產生「Tor 中繼地球儀」的世界底圖資料（docs/zh-TW/games/tor-network/）。

資料來源：Natural Earth 110m（public domain），從 nvkelso/natural-earth-vector 取 GeoJSON。

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
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "docs", "zh-TW", "games", "tor-network")


def fetch(name):
    r = subprocess.run(["curl", "-sL", "--max-time", "120", BASE + name], capture_output=True, text=True)
    if r.returncode != 0 or not r.stdout.startswith("{"):
        raise SystemExit(f"下載失敗：{name}")
    return json.loads(r.stdout)


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


def build_countries():
    d = fetch("ne_110m_admin_0_countries.geojson")
    out = []
    for f in d["features"]:
        iso = f["properties"].get("ISO_A2_EH") or "-99"
        key = "" if iso == "-99" else iso.lower()
        rings, biggest, best = [], None, -1.0
        for ring in rings_of(f):
            flat = []
            for x, y in ring:
                flat += [round(x, 2), round(y, 2)]
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
    return {"c": out}


def build_coastline():
    d = fetch("ne_110m_coastline.geojson")
    seg = []
    for f in d["features"]:
        g = f["geometry"]
        lines = g["coordinates"] if g["type"] == "MultiLineString" else [g["coordinates"]]
        for line in lines:
            for i in range(len(line) - 1):
                x0, y0 = line[i]
                x1, y1 = line[i + 1]
                if abs(x1 - x0) > 180:  # 跨換日線的假線段，略過
                    continue
                seg += [round(x0, 2), round(y0, 2), round(x1, 2), round(y1, 2)]
    return {"seg": seg}


def write(name, data):
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
