#!/usr/bin/env python3
"""產生「Tor 中繼地球儀」的世界底圖資料（docs/zh-TW/games/tor-network/play/）。

資料來源：Natural Earth 10m（public domain），從 nvkelso/natural-earth-vector 取 GeoJSON。

=== 為什麼從 110m 換成 50m ===

站上的讀者多半在亞洲，而 110m 那個比例尺對這一帶太粗：新加坡、香港、澳門整個
沒有收錄，金門被畫進中國的多邊形裡，島鏈的形狀全是幾個點連成的折線。新加坡有
一百多台中繼、香港十幾台，在六角層上卻一格都分不到，因為那裡根本沒有陸地。

50m 這四個都有。代價是座標數從 10,642 漲到 99,432，所以要簡化。

=== 三級容差 ===

同一份資料，簡化時照位置給三種容差：

    東亞核心   0.003 度（約 330 公尺）   讀者最常放大的那一塊
    其餘亞洲   0.02 度（約 2.2 公里）
    世界其他   0.16 度（約 18 公里，跟 110m 的精度相當）

這樣讀者最常看的那一區細，其餘維持原本的檔案量級，而且因為是同一份來源，
區與區之間沒有接縫。

分界照點判、沿著線切段，不是照國家的外接框，也不是照 Natural Earth 的 CONTINENT
欄位。用外接框的話俄羅斯橫跨 180 度必定命中，整條北極海岸線都會吃到細容差；
用 CONTINENT 的話俄羅斯整個歸在 Europe，西伯利亞會跟隔壁的蒙古、哈薩克對不齊。

=== 為什麼從 50m 再換到 10m ===

50m 在亞洲的相鄰點距量出來中位 11.2 公里、第 90 百分位 28 公里。放大到縣市尺度
（畫面涵蓋 3 度）時，一段線在螢幕上就有 27 到 67 個像素，海岸線看起來是一段一段
的折線。容差再怎麼調都救不了，因為那是原始資料的點密度，不是簡化造成的。

對照台灣那份內政部的縣市界，點距中位 378 公尺，所以只有台灣看起來是平滑的。

輸出兩個檔：
  countries.json  國家多邊形，給前端畫成海陸填色、國界線、依中繼數上色的等值區圖
                  { c: [ { k: "tw", m: [lon, lat], p: [[lon,lat,lon,lat,...], ...] }, ... ] }
                  k = ISO 3166-1 alpha-2 小寫（對得上 Onionoo 的 country 欄位），無代碼者為空字串
                  m = 最大環的質心，給前端當國家定位的後備值
                  p = 外環座標，扁平化的 lon/lat 陣列，四捨五入到小數兩位（110m 的精度上限）
  continents.json 海岸線，給前端畫成發光輪廓
                  { lines: [[lon,lat,lon,lat, ...], ...] }，每個陣列是一條連續折線

                  折線而不是獨立線段：一條 N 個點的海岸線，拆成線段要存 4(N-1) 個
                  數字，存成折線只要 2N 個，相鄰段共用端點。10m 這個等級下差了
                  將近一半的檔案大小。前端照樣展開成 LineSegments。

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
    """抓一份 GeoJSON。10m 那兩份分別是 25 MB 與 8 MB，逾時要給夠。

    NE_CACHE 指向一個目錄的話，先看那裡有沒有同名檔案，有就直接讀。反覆調容差的
    時候不必每次重抓幾十 MB，正式產出不依賴它。
    """
    cache = os.environ.get("NE_CACHE")
    if cache:
        local = os.path.join(cache, name)
        if os.path.exists(local):
            with open(local, encoding="utf-8") as f:
                return json.load(f)
    r = subprocess.run(["curl", "-sL", "--max-time", "600", BASE + name], capture_output=True, text=True)
    if r.returncode != 0 or not r.stdout.startswith("{"):
        raise SystemExit(f"下載失敗：{name}")
    if cache:
        os.makedirs(cache, exist_ok=True)
        with open(os.path.join(cache, name), "w", encoding="utf-8") as f:
            f.write(r.stdout)
    return json.loads(r.stdout)


# 亞洲那個框。東邊到 180，西邊收在 25 度（含中東），南到 -12（印尼南端），
# 北到 82（西伯利亞北岸）。
ASIA_BOX = (25.0, -12.0, 180.0, 82.0)
# 東亞核心。中國東南沿海、台灣、日本、韓國、菲律賓、中南半島、馬來半島與蘇門答臘，
# 也就是讀者最常放大去看的那一塊。範圍收得比整個亞洲小，省下來的額度才夠讓這一塊
# 真的細。
#
# 西邊界原本收在 105 度，結果新加坡（103.8）與整條馬來半島落在框外，只吃到亞洲那一
# 級的容差，量出來點距 12 到 18 公里，放大之後那一帶幾乎沒有海岸線可看。改成 95 度
# 之後新加坡的點距降到 3 公里，代價是兩份檔案合計多 55 KB（gzip）。
EAST_BOX = (95.0, 0.0, 150.0, 50.0)

# 兩份檔案的容差分開給，但都會被畫成線，所以東亞那一級要同一個量級。
#
# 海岸線是讀者看到的輪廓，東亞留到 0.002 度（約 220 公尺），點距中位 1.3 公里。
#
# 國界除了判六角格的國碼與畫成底圖貼圖，也被 atlas.js 的 buildBorders() 畫成線疊在
# 球面上，跟海岸線並排出現在同一個畫面裡。所以「貼圖一個像素就是 19 公里，國界再細
# 也畫不出來」這個理由只對貼圖成立，對線不成立。
#
# 那個理由後來連對貼圖也不成立了。atlas.js 另外畫了一張 2048 見方、只涵蓋東亞的細部
# 貼圖，那一塊一個像素是 2.8 公里，這一份的精度直接決定填色的形狀能不能看。
#
# 第一版照那個錯的理由給了 0.01 度容差加兩位小數，兩者疊起來的效果是把國界的每個點
# 釘在 0.01 度（1.1 公里）的網格上，線段只能走水平、垂直或 45 度，放大到香港、深圳
# 那一帶就是一整排直角階梯，而同一個位置的海岸線是平滑的。量出來國界點距 3.9 公里，
# 海岸線 1.3 公里，差三倍。
#
# 改成 0.003 度容差加三位小數之後國界點距 1.5 公里，與海岸線同級，網格階梯消失。
#
# 三個數字分別是世界其他、其餘亞洲、東亞核心。
COAST_TOL = (0.25, 0.03, 0.002)
COAST_ROUND = (2, 2, 3)
BORDER_TOL = (0.25, 0.05, 0.003)
BORDER_ROUND = (2, 2, 3)


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


def in_box(p, box):
    return box[0] <= p[0] <= box[2] and box[1] <= p[1] <= box[3]


def zone_of(p):
    """這個點屬於哪一區。0 是世界其他、1 是亞洲、2 是東亞核心。"""
    if in_box(p, EAST_BOX):
        return 2
    if in_box(p, ASIA_BOX):
        return 1
    return 0


def round_at(x, y, rounds):
    """照所在的區決定留幾位小數。粗的那一區留兩位就跟它的容差同級了。"""
    r = rounds[zone_of((x, y))]
    return (round(x, r), round(y, r))


def simplify_mixed(line, tols):
    """沿著線切段，各段照自己所在的區用不同容差。

    第一版是拿整個環的外接框判，結果俄羅斯橫跨 180 度必定命中，整條北極海岸線
    都吃了細容差，兩份檔案合起來漲到 1.5 MB。改成逐點判、沿線切段之後，同一個
    國家的歐洲側與西伯利亞側可以各走各的。

    切點重疊放進兩段，接回去才不會斷。
    """
    if len(line) < 3:
        return line, len(line)
    segs = []
    cur = [line[0]]
    z = zone_of(line[0])
    for p in line[1:]:
        zp = zone_of(p)
        if zp != z:
            cur.append(p)
            segs.append((z, cur))
            cur = [p]
            z = zp
        else:
            cur.append(p)
    segs.append((z, cur))
    out = []
    fine_pts = 0
    for zz, seg in segs:
        simp = simplify(seg, tols[zz])
        if zz:
            fine_pts += len(simp)
        out.extend(simp if not out else simp[1:])
    return out, fine_pts


def build_countries():
    d = fetch("ne_10m_admin_0_countries.geojson")
    out = []
    kept = dropped = 0
    for f in d["features"]:
        iso = f["properties"].get("ISO_A2_EH") or f["properties"].get("ISO_A2") or "-99"
        key = "" if iso in ("-99", "-9") else iso.lower()
        rings, biggest, best = [], None, -1.0
        for ring in rings_of(f):
            simp, fine_n = simplify_mixed(ring, BORDER_TOL)
            kept += len(simp)
            dropped += len(ring) - len(simp)
            flat = []
            last = None
            for x, y in simp:
                # 小數位數照所在的區決定。四捨五入之後相鄰點可能重合，去掉才不會
                # 留下零長度的邊。
                xy = round_at(x, y, BORDER_ROUND)
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
    d = fetch("ne_10m_coastline.geojson")
    out = []
    segs = 0
    for f in d["features"]:
        g = f["geometry"]
        lines = g["coordinates"] if g["type"] == "MultiLineString" else [g["coordinates"]]
        for line in lines:
            simp, _ = simplify_mixed(line, COAST_TOL)
            # 跨換日線的那一段是投影造成的假線，遇到就把折線切斷，兩邊各自成一條
            run = []
            last = None
            for x, y in simp:
                p = round_at(x, y, COAST_ROUND)
                if last is not None and abs(p[0] - last[0]) > 180:
                    if len(run) >= 4:
                        out.append(run)
                        segs += len(run) // 2 - 1
                    run = []
                if not run or (p[0], p[1]) != (run[-2], run[-1]):
                    run += [p[0], p[1]]
                last = p
            if len(run) >= 4:
                out.append(run)
                segs += len(run) // 2 - 1
    print(f"  海岸線：{len(out):,} 條折線、{segs:,} 段")
    return {"lines": out}


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
