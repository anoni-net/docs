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

國界來自 countries.json，也就是 Natural Earth 50m。那一份的亞洲簡化到約 1 公里，新加坡、
香港、澳門都有，110m 那個比例尺整個沒收錄它們。地球儀原本靠 CENTROID 手調座標補這一塊，
六角層沒有對應的補救，所以輸出時會把「有中繼卻沒有格子」的國家列出來，呼叫端自己
決定要不要留原本的點。

=== 台灣的領土另外判 ===

Natural Earth 對台灣的離島收得不全。金門、馬祖、烏坵在 50m 裡沒有收錄（110m 更糟，
金門直接落在它畫的中國多邊形裡）。照它判的話那些離島會變成海上的空白。

所以台灣改用 tw-admin.json，也就是內政部國土測繪中心的直轄市、縣市界線，22 個縣市
都在，容差 67 公尺，比 50m 精確一個數量級以上。判定順序是台灣優先：格心先對縣市界試
一次，中了就是 tw，沒中才去問 countries.json。

釣魚台列嶼、東沙島與南沙太平島照那份原始資料所屬的縣市收錄，跟地球儀的縣市界圖層
同一個處理方式，這裡不另外做判斷。

=== 比一格還小的島要另外補 ===

判定是看格心落在誰的領土裡，所以比一格小的島幾乎不可能被收到：馬祖南竿 10 公里、
綠島 4 公里、蘭嶼 6 公里，而 level 8 一格的對角是 35 公里。實測金門在 level 8 剛好
有一個格心落在島上，其餘全部算成海。

所以小島另外補一輪：把每一座島的中心對到最近的格，那一格如果還是海就指給台灣。
已經屬於別國的格不搶，寧可那一級畫不出那座島。補進來的格子會比島本身大很多，
澎湖那一格畫出來是 778 平方公里而馬公本島只有 65 平方公里，這是離散化的必然，
比整座島消失好。

島太小就不補：對角不到格子對角 12% 的島，補出來會是一整格代表一個小點，那已經
不是精度不足而是誤導。那些島在更細的等級才會出現。

補完小島還要再掃一次「有中繼卻一格都沒有」的國家。50m 的邊界比 110m 準，細長的
國家反而更容易整個掉格：荷蘭有 1,154 台中繼，在 level 5 那個 138 公里的格子下，
格心全部落在海上。這種情況補一格在它最大那塊陸地的中心，找不到空格就放棄。

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
import collections
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


def ll_to_vec(lat, lon):
    """經緯度換球面座標。跟 atlas.js 的 llToVec 同一套，to_ll 是它的反函數。"""
    phi = math.radians(90 - lat)
    th = math.radians(lon + 180)
    return (-math.sin(phi) * math.cos(th), math.cos(phi), math.sin(phi) * math.sin(th))


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


# === 局部網格 ===
#
# 台灣是這個作品唯一做到縣市尺度的地區，六角格也就值得在那裡多一級。但全球的
# level 9 是 262 萬格，瀏覽器端算幾何要好幾秒、吃掉一百多 MB，只為了台灣那兩百格
# 不划算。
#
# 所以局部網格走另一條路：細分的時候就把離台灣太遠的面丟掉，格數從 262 萬降到
# 三千出頭，而且幾何直接寫進 JSON（兩百格的座標才二十幾 KB），前端連算都不用算。
#
# 丟面要留一圈緩衝。取對偶需要一格周圍的六個面都在，邊界上的格子少了面就會缺角，
# 所以保留的範圍比實際要輸出的多兩度。
TW_CENTER = (23.7, 121.0)
TW_RADIUS = 3.6   # 涵蓋本島、澎湖、金門、馬祖、綠島、蘭嶼。東沙與南沙太遠，不在這一份裡
TW_BUFFER = 2.0   # 取對偶用的緩衝，最後只輸出中心落在 TW_RADIUS 內的格


def build_local(level, center, radius_deg):
    """只細分中心附近的那一塊。回傳頂點與留下來的面。"""
    cv = ll_to_vec(*center)
    verts = [normalize(v) for v in ICO_V]
    faces = [list(f) for f in ICO_F]
    # 剔除的半徑要跟著每一級的三角形大小縮。正二十面體的邊長約 63.4 度，細分一次
    # 減半，所以前幾級的三角形比整個台灣還大，拿最終半徑去砍會一刀砍光。
    ico_edge = 63.4
    for it in range(level):
        keep_cos = math.cos(math.radians(min(180.0, radius_deg + TW_BUFFER + ico_edge / (2 ** it))))
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
        # 三個頂點全都離中心太遠才丟。留一個在範圍內就保住，邊界的格子才不會缺面。
        faces = [f for f in nxt
                 if any(verts[i][0] * cv[0] + verts[i][1] * cv[1] + verts[i][2] * cv[2] >= keep_cos
                        for i in f)]
    return verts, faces, cv


def dual_local(verts, faces):
    """取對偶。只有周圍的面全都在的頂點才算數，缺面的邊界格直接不收。"""
    around = {}
    centers = {}
    for fi, (a, b, c) in enumerate(faces):
        x = (verts[a][0] + verts[b][0] + verts[c][0]) / 3
        y = (verts[a][1] + verts[b][1] + verts[c][1]) / 3
        z = (verts[a][2] + verts[b][2] + verts[c][2]) / 3
        centers[fi] = normalize((x, y, z))
        for v in (a, b, c):
            around.setdefault(v, []).append(fi)
    out = {}
    for v, fs in around.items():
        # 二十面體的頂點是五邊形，其餘是六邊形。數量不對就是邊界上被切掉的，不收。
        if len(fs) not in (5, 6):
            continue
        n = verts[v]
        f0 = centers[fs[0]]
        ux, uy, uz = f0[0] - n[0], f0[1] - n[1], f0[2] - n[2]
        d = ux * n[0] + uy * n[1] + uz * n[2]
        ux -= d * n[0]; uy -= d * n[1]; uz -= d * n[2]
        L = math.sqrt(ux * ux + uy * uy + uz * uz)
        ux, uy, uz = ux / L, uy / L, uz / L
        wx = n[1] * uz - n[2] * uy
        wy = n[2] * ux - n[0] * uz
        wz = n[0] * uy - n[1] * ux
        ang = []
        for fi in fs:
            c = centers[fi]
            dx, dy, dz = c[0] - n[0], c[1] - n[1], c[2] - n[2]
            ang.append((math.atan2(dx * wx + dy * wy + dz * wz, dx * ux + dy * uy + dz * uz), fi))
        ang.sort()
        out[v] = [centers[fi] for _, fi in ang]
    return out


def gen_local(args, tw_rings, tw_box, boxes):
    """台灣的局部高解析網格。幾何直接寫進檔案，前端不必自己算。"""
    level = args.local_level
    verts, faces, cv = build_local(level, TW_CENTER, TW_RADIUS)
    rings = dual_local(verts, faces)
    keep_cos = math.cos(math.radians(TW_RADIUS))
    codes, index = [], {}
    cells = []
    for v, poly in rings.items():
        p = verts[v]
        if p[0] * cv[0] + p[1] * cv[1] + p[2] * cv[2] < keep_cos:
            continue
        lat, lon = to_ll(p)
        k = None
        if tw_box and tw_box[0] <= lon <= tw_box[2] and tw_box[1] <= lat <= tw_box[3] \
                and in_rings(tw_rings, lon, lat):
            k = 'tw'
        else:
            for kk, lo0, la0, lo1, la1, rr in boxes:
                if lon < lo0 or lon > lo1 or lat < la0 or lat > la1:
                    continue
                if in_rings(rr, lon, lat):
                    k = kk
                    break
        if not k:
            continue
        if k not in index:
            codes.append(k)
            index[k] = len(codes)
        cells.append((index[k], lat, lon, [to_ll(q) for q in poly]))

    r = lambda x: round(x, 4)   # 小數點後四位約 11 公尺，比這一級的格子細三個數量級
    out = {
        'source': 'Natural Earth 50m + 內政部國土測繪中心直轄市、縣市界線',
        'note': '台灣的局部高解析六角格。幾何直接存在這裡，全球那幾份只存國碼由前端算。',
        'local': 'tw', 'level': level, 'center': list(TW_CENTER), 'radius': TW_RADIUS,
        'cells': len(cells), 'codes': codes,
        'cc': base64.b64encode(bytes(c[0] for c in cells)).decode('ascii'),
        'sides': base64.b64encode(bytes(len(c[3]) for c in cells)).decode('ascii'),
        'center_ll': [r(x) for c in cells for x in (c[1], c[2])],
        'ring_ll': [r(x) for c in cells for q in c[3] for x in q],
    }
    path = args.out or os.path.join(PLAY, f'hexgrid-{args.local}{level}.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    area = 4 * math.pi * 6371 ** 2 / (10 * 4 ** level + 2)
    per = collections.Counter(codes[c[0] - 1] for c in cells)
    print(f'局部 level {level}：中心 {TW_CENTER}、半徑 {TW_RADIUS}°，'
          f'一格 {area:,.0f} km²、邊長 {math.sqrt(area / 2.598):.1f} km')
    print(f'收了 {len(cells)} 格：' + '、'.join(f'{k} {v}' for k, v in per.most_common()))
    print(f'寫出 {path}，{os.path.getsize(path) / 1024:.0f} KB')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--level', type=int, default=6, help='細分等級，格數是 10*4^n+2')
    ap.add_argument('--out', default=None)
    ap.add_argument('--world', default=os.path.join(PLAY, 'countries.json'))
    ap.add_argument('--tw-admin', default=os.path.join(PLAY, 'tw-admin.json'),
                    help='台灣的縣市界。國界那份沒有收錄金門馬祖，所以台灣優先用這份')
    ap.add_argument('--local', default=None, choices=['tw'],
                    help='產出局部高解析網格而不是全球的那一份')
    ap.add_argument('--local-level', type=int, default=9)
    ap.add_argument('--snapshot', default=os.path.join(PLAY, 'snapshot.json'),
                    help='用來檢查有中繼的國家有沒有分到格子')
    args = ap.parse_args()
    if args.level < 1 or args.level > 8:
        sys.exit('全球網格只支援 level 1 到 8。再細的用 --local，只算需要的那一塊')
    if args.local and (args.local_level < 1 or args.local_level > 11):
        sys.exit('局部網格的 level 只支援 1 到 11')

    world = json.load(open(args.world, encoding='utf-8'))
    # 台灣的縣市界。這一份要在國界之前判，理由見檔頭「台灣的領土另外判」。
    tw_rings, tw_box = [], None
    try:
        adm = json.load(open(args.tw_admin, encoding='utf-8'))
        for c in adm.get('c', []):
            tw_rings.extend(c.get('p', []))
    except OSError:
        print('（找不到 tw-admin.json，台灣改用國界判，金門與馬祖會變成海）')
    if tw_rings:
        lo0 = la0 = 1e9
        lo1 = la1 = -1e9
        for r in tw_rings:
            for i in range(0, len(r), 2):
                lo0 = min(lo0, r[i]); lo1 = max(lo1, r[i])
                la0 = min(la0, r[i + 1]); la1 = max(la1, r[i + 1])
        tw_box = (lo0, la0, lo1, la1)

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

    if args.local:
        gen_local(args, tw_rings, tw_box, boxes)
        return

    verts = build(args.level)
    codes = []          # 1-based 的國碼表，0 留給海
    index = {}
    cc = bytearray(len(verts))
    for i, p in enumerate(verts):
        lat, lon = to_ll(p)
        # 台灣優先。中了就不必再問國界，離島也就不會變成海上的空白。
        if tw_box and tw_box[0] <= lon <= tw_box[2] and tw_box[1] <= lat <= tw_box[3] \
                and in_rings(tw_rings, lon, lat):
            if 'tw' not in index:
                codes.append('tw')
                index['tw'] = len(codes)
            cc[i] = index['tw']
            continue
        for k, lo0, la0, lo1, la1, rings in boxes:
            if lon < lo0 or lon > lo1 or lat < la0 or lat > la1:
                continue
            if in_rings(rings, lon, lat):
                if k not in index:
                    codes.append(k)
                    index[k] = len(codes)   # 1-based
                cc[i] = index[k]
                break
    # 小島補格。理由見檔頭「比一格還小的島要另外補」。
    if tw_rings and tw_box:
        edge_km = math.sqrt(4 * math.pi * 6371 ** 2 / len(verts) / 2.598)
        diag_deg = 2 * edge_km / 111.19
        # 先把候選格縮到台灣外接框再放一格的範圍，否則每座島都要掃過全球的格心
        pad = diag_deg
        cand = []
        for i, p in enumerate(verts):
            lat, lon = to_ll(p)
            if tw_box[0] - pad <= lon <= tw_box[2] + pad and tw_box[1] - pad <= lat <= tw_box[3] + pad:
                cand.append((i, p))
        added = 0
        for ring in tw_rings:
            lo0 = la0 = 1e9
            lo1 = la1 = -1e9
            for i in range(0, len(ring), 2):
                lo0 = min(lo0, ring[i]); lo1 = max(lo1, ring[i])
                la0 = min(la0, ring[i + 1]); la1 = max(la1, ring[i + 1])
            # 經度差要照緯度收窄，高緯度的一度經度比一度緯度短
            dlon = (lo1 - lo0) * math.cos(math.radians((la0 + la1) / 2))
            if math.hypot(dlon, la1 - la0) < diag_deg * 0.12:
                continue
            clat, clon = (la0 + la1) / 2, (lo0 + lo1) / 2
            cv = ll_to_vec(clat, clon)
            best, bd = -1, -2.0
            for i, p in cand:
                d = p[0] * cv[0] + p[1] * cv[1] + p[2] * cv[2]
                if d > bd:
                    bd, best = d, i
            if best >= 0 and cc[best] == 0:
                if 'tw' not in index:
                    codes.append('tw')
                    index['tw'] = len(codes)
                cc[best] = index['tw']
                added += 1
        if added:
            print(f'小島補格：{added} 格（比一格小的島，格心落不到島上）')

    # 有中繼卻一格都沒有的國家，補一格在它最大那塊陸地的中心。
    # 50m 的邊界比 110m 準，細長的國家反而更容易整個掉格，荷蘭在 level 5 就是這樣。
    want = set()
    try:
        snap0 = json.load(open(args.snapshot, encoding='utf-8'))
        for cc_, _r, _w in snap0['relays']:
            if cc_:
                want.add(cc_)
    except OSError:
        pass
    if want:
        have = {c for c in codes}
        miss = [c for c in boxes if c[0] in want and c[0] not in have]
        edge_km = math.sqrt(4 * math.pi * 6371 ** 2 / len(verts) / 2.598)
        diag_deg = 2 * edge_km / 111.19
        fixed = []
        for k, lo0, la0, lo1, la1, rings in miss:
            # 取面積最大的那個環當代表，離島不能代表整個國家
            best_ring, best_area = None, -1.0
            for r in rings:
                a0 = a1 = 1e9
                b0 = b1 = -1e9
                a0 = min(r[i] for i in range(0, len(r), 2))
                b0 = max(r[i] for i in range(0, len(r), 2))
                a1 = min(r[i] for i in range(1, len(r), 2))
                b1 = max(r[i] for i in range(1, len(r), 2))
                area = (b0 - a0) * (b1 - a1)
                if area > best_area:
                    best_area, best_ring = area, (a0, a1, b0, b1)
            if not best_ring:
                continue
            clon = (best_ring[0] + best_ring[2]) / 2
            clat = (best_ring[1] + best_ring[3]) / 2
            cv = ll_to_vec(clat, clon)
            # 找最近的「還是海」的格，不是最近的格。新加坡 728 平方公里，在 level 7
            # 那個 3,113 平方公里的格子底下，離它最近的格早就被馬來西亞佔走了，
            # 只看最近一格的話它永遠補不到，而那裡有 101 台中繼。
            best, bd = -1, -2.0
            for i, p in enumerate(verts):
                if cc[i]:
                    continue
                d = p[0] * cv[0] + p[1] * cv[1] + p[2] * cv[2]
                if d > bd:
                    bd, best = d, i
            # 離得太遠就不補。補在別的大陸上比沒有還糟。放寬到兩格，因為現在找的是
            # 空格，而被鄰國包住的小國本來就要多跳一格才找得到。
            if best < 0 or math.degrees(math.acos(min(1.0, bd))) > diag_deg * 2:
                continue
            codes.append(k)
            index[k] = len(codes)
            cc[best] = index[k]
            fixed.append(k)
        if fixed:
            print(f'補回整個掉格的國家：{"、".join(fixed)}')

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
    tw_n = sum(1 for x in cc if x == index.get('tw', -1))
    print(f'陸地 {land:,} 格（{land / len(verts) * 100:.0f}%），{len(codes)} 個國家，台灣 {tw_n} 格')
    print(f'寫出 {path}，{size / 1024:.0f} KB')

    # 有中繼卻分不到格子的國家。國界那份收不到的小地方，
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
