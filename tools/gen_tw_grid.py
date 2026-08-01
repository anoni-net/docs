#!/usr/bin/env python3
"""產生台灣的發電廠與電網骨幹（docs/zh-TW/games/tor-network/tw-grid.json）。

資料來源三份：

  台灣電力公司各機組發電量即時資訊（含外購電力）
    政府資料開放平臺 dataset 8931，政府資料開放授權條款-第1版，每十分鐘更新。
    214 個機組的類型、裝置容量與當下淨發電量。沒有座標。

  OpenStreetMap
    ODbL。發電廠的位置，以及 345kV 輸電線的幾何。
    使用時要標註「© OpenStreetMap contributors」。

  說明：這支不碰變電所，那是 gen_tw_power.py 的事。

=== 為什麼電網只畫 345kV ===

不是選擇，是能力上限。不限電壓抓 power=line，一度見方的格子在 Overpass 主站與
鏡像都會超時（實測回 695 bytes 的錯誤頁）。加上 voltage=345000 之後同一格是
58 條、1,631 個節點，抓得動。

而且 345kV 正好就是台灣電網的骨幹，南電北送走的就是這一層，線名是台電的正式命名
（中寮北~中港線、中火南~全興線）。161kV 以下的配電網不畫，畫面文案要講清楚
這是骨幹不是全部，不要讓人以為看到的是完整電網。

=== 即時發電量那份的坑 ===

一、有「小計」列。它的裝置容量欄位長這樣：`15918.1(26.264%)`，百分比混在數字裡，
   所以「解不出純數字就是小計列」是比比對名稱更穩的過濾條件，兩個都用。

二、有彙總桶。「其它購電太陽能」一列就 14,881 MW，那是全台分散式光電的總和，
   不是一座電廠，沒有位置可言。這類（其它、其他開頭）從地圖排除，但另外算成
   distributed 一項報出來，不然總量會少一大塊而讀者不知道少在哪。

三、儲能與儲能負載是同一批機組的兩個方向，11 個名稱重疊。兩邊都加會重複計算，
   所以儲能負載整類跳過，只留儲能。

四、機組類型欄位裡有 HTML 標籤殘留，實測
   `儲能負載(Energy Storage System Load)</b>`。輸出前要洗掉。

=== 機組聚成電廠 ===

機組名稱像「大潭CC#1」「林口#1」「德基#3」，去掉機組編號的尾巴就是電廠名。
聚起來之後大潭 9 個機組 7,544 MW、台中 12 個機組 5,500 MW，跟公開資料對得上。

電廠再用名稱跟 OSM 的 power=plant 對，對到才有座標。對不到的照樣輸出，
只是畫不到地圖上，統計仍然用全部。

用法：
  python3 tools/gen_tw_grid.py [輸出路徑]
  OSM_GRID_CACHE=/tmp/x.json python3 tools/gen_tw_grid.py   # 開發時免得重抓
"""
import collections
import json
import os
import re
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DEFAULT_OUT = os.path.join(ROOT, "docs", "zh-TW", "games", "tor-network", "tw-grid.json")

GEN_URL = os.environ.get(
    "TP_GEN_URL", "https://service.taipower.com.tw/data/opendata/apply/file/d006001/001.json")
GEN_PAGE = "https://data.gov.tw/dataset/8931"
# 主站排在前面。實測 overpass.private.coffee 這陣子對含幾何的查詢會限流回錯誤頁，
# 而主站反而穩，跟 gen_cables.py 當初記的情況相反，所以兩個都留著輪。
OVERPASS = [
    os.environ.get("OVERPASS_API", "https://overpass-api.de/api/interpreter"),
    "https://overpass.private.coffee/api/interpreter",
]
TILES = [(la, lo, la + 1, lo + 1) for la in range(21, 26) for lo in range(118, 123)]

VOLT = "345000"     # 只畫這一層，理由見檔頭
MIN_UNITS = 150     # 機組少於這個數就是抓壞了
SIMPLIFY = 0.002    # 輸電線簡化容差（度），約 220 公尺
DIGITS = 4


def curl(url, args=None):
    r = subprocess.run(["curl", "-sL", "--max-time", "180", "-A", "Mozilla/5.0", url]
                       if not args else args, capture_output=True)
    if r.returncode != 0 or not r.stdout:
        raise SystemExit(f"下載失敗：{url}")
    return r.stdout.decode("utf-8-sig", "replace")


def overpass(q):
    for host in OVERPASS:
        for attempt in range(3):
            r = subprocess.run(
                ["curl", "-s", "--max-time", "200", "-A", "anoni.net-docs/1.0",
                 "--data-urlencode", f"data={q}", host],
                capture_output=True, text=True)
            if r.returncode == 0 and r.stdout.lstrip().startswith("{"):
                try:
                    return json.loads(r.stdout).get("elements", [])
                except json.JSONDecodeError:
                    pass
            time.sleep(8 + attempt * 8)
    return None


def fetch_osm(cache=None):
    """一趟把發電廠與 345kV 線都抓回來。Overpass 是志工營運的公共服務，
    格子之間刻意留間隔，不要縮短也不要平行化。"""
    if cache and os.path.exists(cache):
        with open(cache, encoding="utf-8") as f:
            d = json.load(f)
        print(f"  用快取 {cache}（廠 {len(d['plants'])}、線 {len(d['lines'])}）", file=sys.stderr)
        return d["plants"], d["lines"], d["failed"]
    plants, lines, failed = {}, {}, []
    for i, b in enumerate(TILES):
        q = (f'[out:json][timeout:170];'
             f'(nwr["power"="plant"]({b[0]},{b[1]},{b[2]},{b[3]});'
             f' way["power"="line"]["voltage"~"{VOLT}"]({b[0]},{b[1]},{b[2]},{b[3]}););'
             f'out geom tags;')
        el = overpass(q)
        if el is None:
            failed.append(list(b))
            print(f"  格子 {i + 1}/{len(TILES)} 取不到", file=sys.stderr)
        else:
            for e in el:
                t = e.get("tags") or {}
                key = f"{e['type']}/{e['id']}"
                if t.get("power") == "plant":
                    c = e.get("center") or e
                    if c.get("lat") is None and e.get("geometry"):
                        g = e["geometry"]
                        c = {"lat": sum(p["lat"] for p in g) / len(g),
                             "lon": sum(p["lon"] for p in g) / len(g)}
                    if c.get("lat") is None:
                        continue
                    plants[key] = {"name": t.get("name", ""), "operator": t.get("operator", ""),
                                   "source": t.get("plant:source", ""),
                                   "lat": round(c["lat"], 5), "lon": round(c["lon"], 5)}
                elif t.get("power") == "line" and e.get("geometry"):
                    lines[key] = {"name": t.get("name", ""), "voltage": t.get("voltage", ""),
                                  "circuits": t.get("circuits", ""),
                                  "g": [[round(p["lon"], 5), round(p["lat"], 5)] for p in e["geometry"]]}
            print(f"  格子 {i + 1}/{len(TILES)}　廠 {len(plants)}　線 {len(lines)}", file=sys.stderr)
        time.sleep(5)
    if cache:
        with open(cache, "w", encoding="utf-8") as f:
            json.dump({"plants": plants, "lines": lines, "failed": failed}, f, ensure_ascii=False)
    return plants, lines, failed


def num(x):
    """純數字才算。小計列長成 `15918.1(26.264%)`，這裡會回 None，正好拿來當過濾。"""
    s = str(x or "").strip().replace(",", "")
    if not re.fullmatch(r"-?\d+(\.\d+)?", s):
        return None
    return float(s)


def clean_type(t):
    """機組類型欄位有 HTML 標籤殘留，實測 `儲能負載(...)</b>`。"""
    return re.sub(r"</?[a-zA-Z][^>]*>", "", t or "").strip()


def plant_of(unit):
    """機組名稱去掉編號尾巴就是電廠名。大潭CC#1 → 大潭、德基#3 → 德基。"""
    n = (unit or "").strip()
    n = re.sub(r"\(.*?\)\s*$", "", n)                    # 去掉 (註4) 這種
    n = re.sub(r"(CC|GT|ST|CT|IGCC|Gas)?#\d+.*$", "", n)  # 去掉機組編號
    n = re.sub(r"\d+$", "", n)
    return n.strip()


# OSM 電廠名稱的正規化。開頭可能帶容量與台電，結尾是各種廠站字樣，
# 中間還夾著燃料與型式的限定詞，全都要去掉才對得上台電那份的簡稱。
P_LEAD = r"^(\d+(\.\d+)?\s*[MK]W)?\s*(臺電(公司)?)?\s*"
P_TAIL = r"(發電廠|發電站|發電場|電廠|電站|光電廠|光電場|光電站|太陽光電場|分廠|機組|一廠|二廠|三廠|案場.*)$"
P_QUAL = r"(火力|水力|風力|地熱|太陽能|太陽光電|複循環|燃煤|燃氣|燃油|汽電共生|抽蓄|超超臨界)"


def plant_stem(name):
    s = re.sub(P_LEAD, "", norm(name))
    for _ in range(4):     # 尾綴與限定詞會交錯出現，來回剝幾次
        s = re.sub(P_TAIL, "", s).strip()
        s = re.sub(P_QUAL + r"$", "", s).strip()
    return s


def km_between(la1, lo1, la2, lo2):
    import math
    return math.hypot((la1 - la2) * 111,
                      (lo1 - lo2) * 111 * math.cos(math.radians(la1)))


def simplify(pts, tol):
    """迭代式 Douglas-Peucker，跟其他產生器同一套。"""
    n = len(pts)
    if n < 3:
        return pts
    keep = [False] * n
    keep[0] = keep[-1] = True
    stack = [(0, n - 1)]
    while stack:
        a, b = stack.pop()
        if b <= a + 1:
            continue
        x0, y0 = pts[a]
        x1, y1 = pts[b]
        dx, dy = x1 - x0, y1 - y0
        den = (dx * dx + dy * dy) ** 0.5
        best, bi = -1.0, -1
        for i in range(a + 1, b):
            x, y = pts[i]
            d = (abs(dy * x - dx * y + x1 * y0 - y1 * x0) / den if den
                 else ((x - x0) ** 2 + (y - y0) ** 2) ** 0.5)
            if d > best:
                best, bi = d, i
        if best > tol:
            keep[bi] = True
            stack.append((a, bi))
            stack.append((bi, b))
    return [p for p, k in zip(pts, keep) if k]


def norm(s):
    return (s or "").replace("台", "臺").strip()


def main():
    out = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT)
    t0 = time.time()

    print("  取台電即時發電資訊…", file=sys.stderr)
    gen = json.loads(curl(GEN_URL))
    rows = gen.get("aaData") or []
    stamp = gen.get("DateTime") or ""
    if len(rows) < MIN_UNITS:
        raise SystemExit(f"只讀到 {len(rows)} 個機組，應該有兩百多個，來源可能改了")
    need = ("機組類型", "機組名稱", "裝置容量(MW)", "淨發電量(MW)")
    for k in need:
        if k not in rows[0]:
            raise SystemExit(f"缺欄位「{k}」，欄位定義可能改了：{list(rows[0])}")

    print("  抓 OSM 發電廠與 345kV 輸電線（分區慢慢抓）…", file=sys.stderr)
    osm_plants, osm_lines, failed = fetch_osm(os.environ.get("OSM_GRID_CACHE"))

    # 機組聚成電廠。小計列、彙總桶、儲能負載各自處理，理由見檔頭。
    plants, distributed, skipped = collections.defaultdict(
        lambda: {"units": 0, "cap": 0.0, "out": 0.0, "types": collections.Counter()}), [], 0
    for r in rows:
        ty = clean_type(r["機組類型"])
        name = (r["機組名稱"] or "").strip()
        cap = num(r["裝置容量(MW)"])
        outv = num(r["淨發電量(MW)"])
        if cap is None:                      # 小計列，容量欄夾著百分比
            skipped += 1
            continue
        if any(k in name for k in ("小計", "合計", "總計")):
            skipped += 1
            continue
        if "儲能負載" in ty:                  # 跟儲能是同一批機組的另一個方向，加了會重複
            skipped += 1
            continue
        if name.startswith(("其它", "其他")):  # 分散式的彙總桶，沒有位置
            distributed.append({"name": name, "type": ty, "cap": cap, "out": outv})
            continue
        p = plants[plant_of(name)]
        p["units"] += 1
        p["cap"] += cap
        p["out"] += outv or 0
        p["types"][ty] += 1

    # 對 OSM 拿座標。
    #
    # OSM 的電廠命名很雜，實測有「大林火力發電廠」「3900MW興達複循環燃煤電廠」
    # 「台電綠島發電廠」「明潭發電廠鉅工分廠」這些寫法，所以要去的不只是尾綴，
    # 還有開頭的容量與台電字樣、以及夾在中間的燃料與型式限定詞。
    #
    # 同一座電廠在 OSM 常常有好幾個條目（興達 2 個、大觀 3 個、明潭 6 個），
    # 那是同一座廠的不同區塊。第一版要求全台唯一才採用，把這些正當的對應全擋掉了。
    # 改成多筆時檢查彼此距離，五公里內就取形心，散得太開才拒絕並回報。
    idx = collections.defaultdict(list)
    for ref, v in osm_plants.items():
        if not v["name"]:
            continue
        st = plant_stem(v["name"])
        if st:
            idx[st].append((ref, v))
    items, located, scattered = [], 0, []
    for pname, p in sorted(plants.items(), key=lambda kv: -kv[1]["cap"]):
        cand = idx.get(norm(pname)) or []
        hit = None
        if len(cand) == 1:
            hit = {"lat": cand[0][1]["lat"], "lon": cand[0][1]["lon"], "ref": cand[0][0]}
        elif len(cand) > 1:
            la = sum(x[1]["lat"] for x in cand) / len(cand)
            lo = sum(x[1]["lon"] for x in cand) / len(cand)
            spread = max(km_between(la, lo, x[1]["lat"], x[1]["lon"]) for x in cand)
            if spread <= 5:
                hit = {"lat": round(la, 5), "lon": round(lo, 5),
                       "ref": "+".join(x[0] for x in cand[:3])}
            else:
                scattered.append((pname, len(cand), round(spread, 1)))
        if hit:
            located += 1
        items.append({
            "name": pname,
            "type": p["types"].most_common(1)[0][0] if p["types"] else "",
            "units": p["units"],
            "cap": round(p["cap"], 1),
            "out": round(p["out"], 1),
            "lat": hit["lat"] if hit else None,
            "lon": hit["lon"] if hit else None,
            "osm": hit["ref"] if hit else None,
        })

    # 輸電線。同名的多段合併不做，那需要拓樸，這裡照原樣一條一條輸出。
    lines = []
    raw_pts = 0
    for ref, v in osm_lines.items():
        raw_pts += len(v["g"])
        g = simplify([tuple(p) for p in v["g"]], SIMPLIFY)
        if len(g) < 2:
            continue
        lines.append({
            "name": v["name"], "volt": v["voltage"], "circuits": v["circuits"],
            "p": [round(c, DIGITS) for pt in g for c in pt],
        })
    kept_pts = sum(len(x["p"]) // 2 for x in lines)

    by_type = collections.Counter()
    for it in items:
        by_type[it["type"]] += it["cap"]
    payload = {
        "stamp": stamp,
        "sources": [
            {"name": "台灣電力公司各機組發電量即時資訊（含外購電力）", "url": GEN_PAGE,
             "license": "政府資料開放授權條款-第1版", "licenseUrl": "https://data.gov.tw/license"},
            {"name": "OpenStreetMap contributors", "url": "https://www.openstreetmap.org/copyright",
             "license": "ODbL 1.0", "licenseUrl": "https://opendatacommons.org/licenses/odbl/",
             "note": "發電廠位置與 345kV 輸電線幾何"},
        ],
        "volt": VOLT,
        "total": {
            "plants": len(items),
            "located": located,
            "cap": round(sum(i["cap"] for i in items), 1),
            "out": round(sum(i["out"] for i in items), 1),
            # 分散式那一塊沒有位置，畫不到地圖上，但量很大，要單獨報出來
            "distCap": round(sum(d["cap"] for d in distributed), 1),
            "distOut": round(sum(d["out"] or 0 for d in distributed), 1),
            "lines": len(lines),
        },
        "byType": [{"type": k, "cap": round(v, 1)} for k, v in by_type.most_common()],
        "plants": items,
        "distributed": distributed,
        "lines": lines,
    }

    os.makedirs(os.path.dirname(out), exist_ok=True)
    tmp = out + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")
    os.replace(tmp, out)

    t = payload["total"]
    print(f"寫出 {out}")
    print(f"  資料時間 {stamp}｜跳過 {skipped} 列（小計、儲能負載）")
    if scattered:
        print(f"  這幾座在 OSM 的多個條目散得太開，沒有採用座標：{scattered[:6]}", file=sys.stderr)
    print(f"  電廠 {t['plants']} 座，其中 {t['located']} 座有座標"
          f"（{t['located'] / max(1, t['plants']) * 100:.0f}%）")
    print(f"  裝置容量 {t['cap']:,.0f} MW，當下淨發電 {t['out']:,.0f} MW")
    print(f"  另有分散式（其它購電太陽能等）{t['distCap']:,.0f} MW，發電 {t['distOut']:,.0f} MW，無位置")
    print(f"  {VOLT} 輸電線 {t['lines']} 條，節點 {raw_pts:,} → {kept_pts:,}")
    print(f"  {os.path.getsize(out) / 1024:.0f} KB｜耗時 {time.time() - t0:.0f}s"
          + (f"，Overpass 有 {len(failed)} 格取不到" if failed else ""))


if __name__ == "__main__":
    main()
