#!/usr/bin/env python3
"""地球儀的一級行政區界線（州、省、縣），每國一份，貼近那一國才載入。

=== 只畫內部界線 ===

一級行政區的外框就是海岸線與國界，那兩條地球儀上已經有了。把整圈都畫出來的話，
外框會跟既有的線錯開幾百公尺，看起來是兩條。所以只留同一國裡相鄰兩區共用的那條
邊，外框交給國界與海岸線。

這個做法順帶避開一件事：竹島／獨島、釣魚台、北方四島這類主權有爭議的島嶼，在資料
裡都是孤立的多邊形，沒有跟任何一區共用邊，自然不會被畫出來，地球儀也就不必替它們
的歸屬表態。

抽共用邊靠的是相鄰兩區在邊界上的頂點完全重合。Natural Earth 與香港民政事務總署的
資料都是從同一份拓撲切出來的，實測日本 47 個都道府縣有 44.9% 的邊是共用的、香港
18 區是 87.3%，頂點都對得上。先抽出共用邊、串成折線，再整條簡化，兩區看到的是同
一條線。反過來先各自簡化再比對的話，兩邊砍掉的點不一樣，共用邊就對不上了。

=== 資料來源 ===

在地政府的開放資料優先，Natural Earth 是後備。

  香港  民政事務總署的 18 區界線（DATA.GOV.HK），帶正體中文與英文區名。
        Natural Earth 的香港只有 580 條邊，官方這份有 18,892 條，細緻度差 30 倍
  日本  Natural Earth 10m 一級行政區
  韓國  Natural Earth 10m 一級行政區
  東南亞 11 國（越南、寮國、柬埔寨、泰國、緬甸、馬來西亞、新加坡、印尼、菲律賓、
        汶萊、東帝汶）  Natural Earth 10m 一級行政區

Natural Earth 的一級行政區不是每一國都跟上現況。已知的一處是印尼：2022 年巴布亞
拆出四個新省，現在是 38 省，這份資料還是 33 省，巴布亞那一帶畫的是舊界線。

台灣的縣市界另有一份用內政部資料產的 tw-admin.json，是獨立的一層（tw-admin），因為
變電所卡片的縣市名稱、導覽的台灣那一站都要用到它的資料。索引裡台灣那一筆不指向
檔案，指向那一層（layer: 'tw-admin'），前端貼近台灣時打開那一層，跟其他國家同一套
判斷。那一份畫的是整圈外框，因為它同時是台灣的海岸線，細節見 NOTICE。

=== 香港的區界含海域 ===

民政事務總署的區界把海面也分給各區，離島區尤其大。原樣畫出來，海上會多出好幾條
幾十公里長的直線，看起來像海上的國界。所以香港的界線要裁到陸地上，陸地範圍取
countries.json 裡香港的輪廓（東亞那一級簡化到約 330 公尺）。線段先加密到 50 公尺
一點再逐點判斷落在陸地內外，連續落在陸地上的那幾段才留。裁切點跟海岸線會有幾百
公尺的誤差，那是陸地輪廓本身的精度。

Natural Earth 的一級行政區有兩個已知的問題，所以不能無差別地整批收：馬祖（南竿、
北竿、東引）不在任何行政區裡，被當成海；區名的中文是簡體字。加一國之前要先看過
那一國的資料。

=== 輸出 ===

  docs/zh-TW/games/tor-network/play/admin1/index.json   每國的範圍與典型行政區大小
  docs/zh-TW/games/tor-network/play/admin1/<cc>.json    那一國的內部界線與區名

索引裡的 r 是行政區面積中位數開根號，單位度。前端用它決定界線什麼時候淡入：一個
典型行政區在螢幕上夠大了才畫，日本的縣大、香港的區小，出現的時機自然不同。

=== 正體中文區名 ===

Natural Earth 的 name_zht 名義上是正體，實際上新加坡、印尼、菲律賓、汶萊那幾國填的是
簡體字（「东南苏拉威西省」「马来奕县」）。所以一律再過一次 OpenCC 的 s2tw，本來就是
正體的字不受影響。用 s2tw 而不是 s2twp，後者會連用語一起換，把新加坡的「社區發展
理事會」換成「社群發展理事會」，專有名詞不該被改。

用法（需要 OpenCC，uv 可以臨時帶上）：
  NE_CACHE=/tmp uv run --no-project --with opencc-python-reimplemented python tools/gen_admin1.py
"""
import json
import math
import os
import statistics
import subprocess
import sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'docs', 'zh-TW', 'games', 'tor-network', 'play', 'admin1')
sys.path.insert(0, HERE)
from gen_world_geo import simplify  # noqa: E402  同一支道格拉斯-普克，迭代版
from opencc import OpenCC  # noqa: E402

TO_TW = OpenCC('s2tw')

NE_BASE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/'
NE_FILE = 'ne_10m_admin_1_states_provinces.geojson'
HK_URL = 'https://www.had.gov.hk/psi/hong-kong-administrative-boundaries/hksar_18_district_boundary.json'

NE_META = {
    'source': 'Natural Earth 1:10m Admin 1 – States, Provinces',
    'sourceUrl': 'https://www.naturalearthdata.com/',
    'license': 'public domain',
    'licenseUrl': 'https://www.naturalearthdata.com/about/terms-of-use/',
}
HK_META = {
    'source': '民政事務總署 地方行政區界線（DATA.GOV.HK）',
    'sourceUrl': 'https://data.gov.hk/tc-data/dataset/hk-had-json1-hong-kong-administrative-boundaries',
    'license': 'DATA.GOV.HK 使用條款',
    'licenseUrl': 'https://data.gov.hk/tc/terms-and-conditions',
}

# 容差以度計。香港的區界是幾公里的尺度，要細得多才看得出形狀。
# 日本與韓國跟東亞的海岸線同一級（0.002 度，約 220 公尺），兩條線並排時不會一條平滑一條折角。
COUNTRIES = {
    'jp': {'from': 'ne', 'iso': 'JP', 'tol': 0.002},
    'kr': {'from': 'ne', 'iso': 'KR', 'tol': 0.002},
    'hk': {'from': 'hk', 'tol': 0.0003, 'land': 'hk'},
    # 東南亞。容差跟日韓同一級
    **{cc: {'from': 'ne', 'iso': cc.upper(), 'tol': 0.002}
       for cc in ('vn', 'la', 'kh', 'th', 'mm', 'my', 'sg', 'id', 'ph', 'bn', 'tl')},
}
WORLD = os.path.join(HERE, '..', 'docs', 'zh-TW', 'games', 'tor-network', 'play', 'countries.json')


def inside(pt, ring):
    x, y = pt
    c = False
    n = len(ring)
    for i in range(n):
        x1, y1 = ring[i]
        x2, y2 = ring[i - 1]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            c = not c
    return c


def clip_to_land(line, rings, step=0.0005):
    """把折線裁到陸地上。回傳落在陸地上的那幾段。"""
    dense = [line[0]]
    for (x1, y1), (x2, y2) in zip(line, line[1:]):
        n = max(1, int(math.ceil(math.hypot(x2 - x1, y2 - y1) / step)))
        for k in range(1, n + 1):
            dense.append((x1 + (x2 - x1) * k / n, y1 + (y2 - y1) * k / n))
    out, run = [], []
    for pt in dense:
        if any(inside(pt, r) for r in rings):
            run.append(pt)
        else:
            if len(run) >= 2:
                out.append(run)
            run = []
    if len(run) >= 2:
        out.append(run)
    return out


def fetch(url, name):
    """NE_CACHE 指到目錄的話先看那裡有沒有同名檔案，反覆調參數時不必每次都重抓 40 MB。"""
    cache = os.environ.get('NE_CACHE')
    if cache:
        p = os.path.join(cache, name)
        if os.path.exists(p):
            with open(p, encoding='utf-8') as f:
                return json.load(f)
    r = subprocess.run(['curl', '-sL', '--max-time', '900', url], capture_output=True, check=True)
    if cache:
        with open(os.path.join(cache, name), 'wb') as f:
            f.write(r.stdout)
    return json.loads(r.stdout)


def rings_of(geom):
    if not geom:
        return []
    polys = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
    return [ring for poly in polys for ring in poly]


def key(p):
    return (round(p[0], 7), round(p[1], 7))


def ring_area_deg2(ring):
    """經緯度平面上的多邊形面積，經度乘上緯度的餘弦，量級對了就好。"""
    if len(ring) < 3:
        return 0.0
    lat0 = sum(p[1] for p in ring) / len(ring)
    k = math.cos(math.radians(lat0))
    s = 0.0
    for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]):
        s += x1 * k * y2 - x2 * k * y1
    return abs(s) / 2


def internal_lines(regions):
    """regions 是 [(區的代號, [環, ...]), ...]。回傳只屬於內部界線的折線。

    一條邊被兩個不同的區用到，才是內部界線。接著把這些邊串成折線：在分岔點（三區
    交會）或端點斷開，其餘的點都只連著兩條邊，順著走就是一條線。
    """
    owners = defaultdict(set)
    for rid, rings in regions:
        for ring in rings:
            for a, b in zip(ring, ring[1:]):
                ka, kb = key(a), key(b)
                if ka == kb:
                    continue
                owners[tuple(sorted((ka, kb)))].add(rid)
    edges = [e for e, who in owners.items() if len(who) >= 2]
    adj = defaultdict(list)
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    used = set()
    lines = []

    def walk(start, nxt):
        line = [start, nxt]
        used.add(tuple(sorted((start, nxt))))
        prev, cur = start, nxt
        while len(adj[cur]) == 2:
            n2 = adj[cur][0] if adj[cur][1] == prev else adj[cur][1]
            e = tuple(sorted((cur, n2)))
            if e in used:
                break
            used.add(e)
            line.append(n2)
            prev, cur = cur, n2
        return line

    # 先從端點與分岔點出發，剩下的是自己圍成一圈的內部界線（例如被另一區整個包住的區）
    for node, ns in adj.items():
        if len(ns) != 2:
            for n in ns:
                if tuple(sorted((node, n))) not in used:
                    lines.append(walk(node, n))
    for a, b in edges:
        if (a, b) not in used and (b, a) not in used and tuple(sorted((a, b))) not in used:
            lines.append(walk(a, b))
    return lines, len(edges)


def build_ne(ne, iso):
    feats = [f for f in ne['features'] if f['properties'].get('iso_a2') == iso and f['geometry']]
    regions, names = [], []
    for f in feats:
        p = f['properties']
        rings = [[tuple(pt[:2]) for pt in r] for r in rings_of(f['geometry'])]
        regions.append((p['adm1_code'], rings))
        names.append({
            # Natural Earth 的 name_zht 是正體，name_zh 是簡體。沒有正體的時候寧可用英文，
            # 不把簡體字放進正體中文的介面
            'zh': TO_TW.convert(p.get('name_zht') or p.get('name_zh') or '') or p.get('name_en') or p['name'],
            'zhCn': p.get('name_zh') or p.get('name_en') or p['name'],
            'en': p.get('name_en') or p['name'],
            'm': [round(p['longitude'], 3), round(p['latitude'], 3)],
        })
    return regions, names


def build_hk(hk):
    regions, names = [], []
    for f in hk['features']:
        p = f['properties']
        rings = [[tuple(pt[:2]) for pt in r] for r in rings_of(f['geometry'])]
        regions.append((p['地區號碼'], rings))
        biggest = max(rings, key=ring_area_deg2)
        cx = sum(pt[0] for pt in biggest) / len(biggest)
        cy = sum(pt[1] for pt in biggest) / len(biggest)
        names.append({'zh': p['地區'], 'zhCn': p['地區'], 'en': p['District'],
                      'm': [round(cx, 4), round(cy, 4)]})
    return regions, names


def main():
    os.makedirs(OUT, exist_ok=True)
    ne = hk = None
    index = []
    for cc, cfg in COUNTRIES.items():
        if cfg['from'] == 'ne':
            ne = ne or fetch(NE_BASE + NE_FILE, NE_FILE)
            regions, names = build_ne(ne, cfg['iso'])
            meta = NE_META
        else:
            hk = hk or fetch(HK_URL, 'hksar_18_district_boundary.json')
            regions, names = build_hk(hk)
            meta = HK_META
        raw, n_edges = internal_lines(regions)
        if cfg.get('land'):
            with open(WORLD, encoding='utf-8') as f:
                world = json.load(f)
            land = [[(r[i], r[i + 1]) for i in range(0, len(r), 2)]
                    for c in world['c'] if c['k'] == cfg['land'] for r in c['p']]
            before = len(raw)
            raw = [seg for ln in raw for seg in clip_to_land(ln, land)]
            print(f'  {cc}：裁到陸地上，{before} 條折線剩 {len(raw)} 段')
        tol = cfg['tol']
        dec = 4 if tol < 0.001 else 3
        lines, pts = [], 0
        for ln in raw:
            s = simplify(ln, tol)
            if len(s) < 2:
                continue
            flat = []
            for x, y in s:
                flat += [round(x, dec), round(y, dec)]
            lines.append(flat)
            pts += len(s)
        allpts = [p for _, rings in regions for r in rings for p in r]
        lons = [p[0] for p in allpts]
        lats = [p[1] for p in allpts]
        bbox = [round(min(lons), 2), round(min(lats), 2), round(max(lons), 2), round(max(lats), 2)]
        areas = [sum(ring_area_deg2(r) for r in rings) for _, rings in regions]
        r_deg = round(math.sqrt(statistics.median(areas)), 3)
        doc = {**meta, 'cc': cc, 'toler': tol, 'lines': lines, 'regions': names}
        path = os.path.join(OUT, cc + '.json')
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(doc, f, ensure_ascii=False, separators=(',', ':'))
        index.append({'cc': cc, 'file': 'admin1/' + cc + '.json', 'bbox': bbox, 'r': r_deg, 'n': len(names)})
        print(f'  {cc}：{len(names)} 區，共用邊 {n_edges:,} 條，串成 {len(lines)} 條折線、'
              f'簡化後 {pts:,} 點，典型區 {r_deg}°，{os.path.getsize(path) / 1024:.0f} KB')
    # 台灣：指向 tw-admin 那一層，範圍與典型縣市大小從那一份算
    with open(os.path.join(HERE, '..', 'docs', 'zh-TW', 'games', 'tor-network', 'play', 'tw-admin.json'),
              encoding='utf-8') as f:
        tw = json.load(f)
    rings = [[(r[i], r[i + 1]) for i in range(0, len(r), 2)] for c in tw['c'] for r in c['p']]
    # 範圍只算本島、澎湖、金馬與釣魚台那一帶。太平島在北緯 10 度、東沙在東經 116 度，
    # 算進去的話外接框蓋住整個南海，看越南或菲律賓時都會去抓台灣這份（gzip 63 KB）
    rings = [r for r in rings if 117.5 <= r[0][0] <= 124.5 and 21.0 <= r[0][1] <= 27.0]
    lons = [x for r in rings for x, _ in r]
    lats = [y for r in rings for _, y in r]
    areas = [sum(ring_area_deg2([(r[i], r[i + 1]) for i in range(0, len(r), 2)]) for r in c['p']) for c in tw['c']]
    index.append({'cc': 'tw', 'layer': 'tw-admin',
                  'bbox': [round(min(lons), 2), round(min(lats), 2), round(max(lons), 2), round(max(lats), 2)],
                  'r': round(math.sqrt(statistics.median(areas)), 3), 'n': len(tw['c'])})
    print(f"  tw：指向 tw-admin 那一層，{len(tw['c'])} 縣市，典型縣市 {index[-1]['r']}°")
    with open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8') as f:
        json.dump({'countries': index}, f, ensure_ascii=False, separators=(',', ':'))
    print('DONE →', os.path.normpath(OUT))


if __name__ == '__main__':
    main()
