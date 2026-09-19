#!/usr/bin/env python3
"""把地球表面切成六角格，判定每一格落在哪個國家，輸出給地球儀用。

=== 這是什麼 ===

社群的標記是三個六角形，這份資料是把同一個形狀鋪到球面上：地球表面切成大小一致的
六角格，每一格記下它落在哪個國家。中繼分布目前畫成國界內的隨機點加上色塊，換成
六角格之後，同一份國別資料就有了規則、可數、點得到的容器。

=== 球面沒有純六角的鋪法 ===

歐拉公式擋住了這條路：只用六邊形鋪不滿球面，一定要有 12 個五邊形。這裡走的是
Goldberg 多面體，也就是正二十面體細分之後取對偶，12 個五邊形就落在原本二十面體的
12 個頂點上。這不是瑕疵，是球面拓撲的硬性結果，H3 那類系統同樣有這 12 個奇異點，
差別只在它們把五邊形藏在海上。

細分等級 n 的格數是 10 * 4^n + 2：

    n=5   10,242 格   每格 49,801 km²   邊長 138 km   對角 277 km
    n=6   40,962 格   每格 12,452 km²   邊長  69 km   對角 139 km
    n=7  163,842 格   每格  3,113 km²   邊長  35 km   對角  69 km
    n=8  655,362 格   每格    778 km²   邊長  17 km   對角  35 km

台灣是 36,193 km²，所以 n=5 只佔得到 1 格，n=6 是 3 格，n=7 是 12 格，n=8 是 47 格。

單一密度在任何縮放下都好看是做不到的，格子在螢幕上的大小跟畫面涵蓋度成反比。
所以這幾份會同時存在，由 atlas.js 依當下的涵蓋度挑一份，放大就換細的，跟地圖
圖磚的做法一樣。

尺度本身對得上兩個東西：level 7 的對角 69 km 約等於光纖 1 毫秒來回的直線距離
（單模光纖裡光速約 2e5 km/s，實際路徑約直線的 1.4 倍），level 8 的 35 km 對應
0.5 毫秒。一條 Tor 電路的延遲落在 100 到 300 毫秒，同一格內的兩台中繼差不到
1 毫秒，在電路層級分不出來。

=== 小國會掉格 ===

國界來自 countries.json，也就是 Natural Earth 110m，那個比例尺裡本來就沒有新加坡、
香港這類小地方，它們在任何等級下都分不到格。地球儀原本靠 CENTROID 手調座標補這一塊，
六角層沒有對應的補救，所以輸出時會把「有中繼卻沒有格子」的國家列出來，呼叫端自己
決定要不要留原本的點。

=== 前端怎麼用這份資料 ===

檔案裡只有國碼，沒有任何幾何。幾何由 hexgrid.js 在瀏覽器裡用同一套細分算出來，
兩邊的頂點順序必須一模一樣，否則整層的國碼會錯位。probe 欄位就是為了這件事：
取樣幾格的中心經緯度，前端載入時比對得上才畫。

用法：
    python3 tools/gen_hexgrid.py --level 8      # 產出 hexgrid-8.json
    python3 tools/gen_hexgrid.py --level 6 --out /tmp/x.json

相依只有標準庫。
"""
import argparse
import base64
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PLAY = os.path.join(HERE, '..', 'docs', 'zh-TW', 'games', 'tor-network', 'play')

# 正二十面體。頂點用黃金比例那組座標，面的繞向全部朝外。
# 這一份與 hexgrid.js 的 ICO_V、ICO_F 必須逐字一致，細分的結果才會是同一個順序。
PHI = (1 + 5 ** 0.5) / 2
ICO_V = [(-1, PHI, 0), (1, PHI, 0), (-1, -PHI, 0), (1, -PHI, 0),
         (0, -1, PHI), (0, 1, PHI), (0, -1, -PHI), (0, 1, -PHI),
         (PHI, 0, -1), (PHI, 0, 1), (-PHI, 0, -1), (-PHI, 0, 1)]
ICO_F = [(0, 11, 5), (0, 5, 1), (0, 1, 7), (0, 7, 10), (0, 10, 11),
         (1, 5, 9), (5, 11, 4), (11, 10, 2), (10, 7, 6), (7, 1, 8),
         (3, 9, 4), (3, 4, 2), (3, 2, 6), (3, 6, 8), (3, 8, 9),
         (4, 9, 5), (2, 4, 11), (6, 2, 10), (8, 6, 7), (9, 8, 1)]


def normalize(p):
    L = math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2])
    return (p[0] / L, p[1] / L, p[2] / L)


def build(level):
    """細分 level 次，回傳球面上的頂點。每個頂點就是一格的中心。

    新頂點一律 append 在尾端，而且每條邊只插一次，所以頂點索引在兩次執行之間穩定。
    前端照同樣的順序跑一次就會得到同一份索引。
    """
    verts = [normalize(v) for v in ICO_V]
    faces = [list(f) for f in ICO_F]
    for _ in range(level):
        mid = {}

        def middle(a, b):
            key = (a, b) if a < b else (b, a)
            if key in mid:
                return mid[key]
            p, q = verts[a], verts[b]
            verts.append(normalize(((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2)))
            mid[key] = len(verts) - 1
            return mid[key]

        nxt = []
        for a, b, c in faces:
            ab, bc, ca = middle(a, b), middle(b, c), middle(c, a)
            nxt += [[a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]]
        faces = nxt
    return verts


def to_ll(p):
    """球面座標換經緯度。必須是 atlas.js 那支 llToVec 的反函數。

    llToVec 用 phi = 90 - lat、theta = lon + 180，展開之後
    x = cos(lat)cos(lon)、y = sin(lat)、z = -cos(lat)sin(lon)，所以經度是 atan2(-z, x)。

    第一版寫成 atan2(x, z)，算出來的經度整整多 90 度。前端與這裡用同一個錯式子，
    所以 probe 比對、格數、五邊形數量全部照樣通過，畫面上卻是每一格都塗成東邊
    90 度那個國家的顏色。這條式子動到的時候，先跑 tools/check_hexgrid.mjs。
    """
    lat = math.degrees(math.asin(max(-1.0, min(1.0, p[1]))))
    lon = math.degrees(math.atan2(-p[2], p[0]))
    return lat, lon


def in_rings(rings, lon, lat):
    """射線法，照搬 atlas.js 的 inRings。

    全部 ring 一起算偶奇，所以內部的洞（例如南非包著賴索托）會自動被扣掉。
    """
    hit = False
    for r in rings:
        n = len(r)
        j = n - 2
        for i in range(0, n, 2):
            yi, yj = r[i + 1], r[j + 1]
            if (yi > lat) != (yj > lat):
                if lon < (r[j] - r[i]) * (lat - yi) / (yj - yi) + r[i]:
                    hit = not hit
            j = i
    return hit


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--level', type=int, default=6, help='細分等級，格數是 10*4^n+2')
    ap.add_argument('--out', default=None)
    ap.add_argument('--world', default=os.path.join(PLAY, 'countries.json'))
    ap.add_argument('--snapshot', default=os.path.join(PLAY, 'snapshot.json'),
                    help='用來檢查有中繼的國家有沒有分到格子')
    args = ap.parse_args()
    if args.level < 1 or args.level > 8:
        sys.exit('level 只支援 1 到 8。level 9 是 262 萬格，瀏覽器端建幾何要好幾秒')

    world = json.load(open(args.world, encoding='utf-8'))
    # 先算每個國家的外接框。逐格對 177 國做射線法太慢，用框先篩掉九成九。
    boxes = []
    for c in world['c']:
        if not c.get('k'):
            continue
        lo0 = la0 = 1e9
        lo1 = la1 = -1e9
        for r in c['p']:
            for i in range(0, len(r), 2):
                lo0 = min(lo0, r[i]); lo1 = max(lo1, r[i])
                la0 = min(la0, r[i + 1]); la1 = max(la1, r[i + 1])
        boxes.append((c['k'], lo0, la0, lo1, la1, c['p']))

    verts = build(args.level)
    codes = []          # 1-based 的國碼表，0 留給海
    index = {}
    cc = bytearray(len(verts))
    for i, p in enumerate(verts):
        lat, lon = to_ll(p)
        for k, lo0, la0, lo1, la1, rings in boxes:
            if lon < lo0 or lon > lo1 or lat < la0 or lat > la1:
                continue
            if in_rings(rings, lon, lat):
                if k not in index:
                    codes.append(k)
                    index[k] = len(codes)   # 1-based
                cc[i] = index[k]
                break
    if len(codes) > 255:
        sys.exit(f'國家數 {len(codes)} 超過 255，Uint8 放不下')

    land = sum(1 for x in cc if x)
    area = 4 * math.pi * 6371 ** 2 / len(verts)
    # 取樣幾格的中心，前端拿它驗自己算出來的順序對不對。頭尾與中間各取一點，
    # 少了尾端那一筆的話，細分最後一層出錯不會被發現。
    picks = sorted({0, 1, 11, len(verts) // 3, len(verts) // 2, len(verts) - 1})
    probe = [[i] + [round(x, 6) for x in to_ll(verts[i])] for i in picks]

    out = {
        'source': world.get('source', 'Natural Earth'),
        'sourceUrl': world.get('sourceUrl', ''),
        'license': world.get('license', ''),
        'licenseUrl': world.get('licenseUrl', ''),
        'note': '每格的國碼。幾何不在這裡，由 hexgrid.js 用同一套細分算出來，'
                'probe 是給前端比對順序用的取樣點。',
        'level': args.level,
        'cells': len(verts),
        'land': land,
        'cellAreaKm2': round(area),
        'codes': codes,
        'probe': probe,
        'cc': base64.b64encode(bytes(cc)).decode('ascii'),
    }
    path = args.out or os.path.join(PLAY, f'hexgrid-{args.level}.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    size = os.path.getsize(path)

    print(f'level {args.level}：{len(verts):,} 格，每格 {area:,.0f} km²，'
          f'邊長約 {math.sqrt(area / 2.598):.0f} km')
    print(f'陸地 {land:,} 格（{land / len(verts) * 100:.0f}%），{len(codes)} 個國家')
    print(f'寫出 {path}，{size / 1024:.0f} KB')

    # 有中繼卻分不到格子的國家。Natural Earth 110m 沒有新加坡、香港這類小地方，
    # 六角層畫不出它們，呼叫端要自己決定原本的點要不要留著。
    try:
        snap = json.load(open(args.snapshot, encoding='utf-8'))
    except OSError:
        return
    have = set(codes)
    miss = {}
    for cc_, _role, _w in snap['relays']:
        if cc_ and cc_ not in have:
            miss[cc_] = miss.get(cc_, 0) + 1
    if miss:
        top = sorted(miss.items(), key=lambda x: -x[1])
        total = sum(miss.values())
        print(f'有中繼但沒有格子：{total} 台分布在 {len(top)} 個國碼 '
              + '、'.join(f'{k} {v}' for k, v in top[:12]))


if __name__ == '__main__':
    main()
