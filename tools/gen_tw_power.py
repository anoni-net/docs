#!/usr/bin/env python3
"""產生台灣變電所的容量與負載資料（docs/zh-TW/games/tor-network/tw-power.json）。

資料來源三份，各自的授權不同，輸出裡逐項標明：

  台灣電力公司二次變電所主變壓器裝置容量及負載
    政府資料開放平臺 dataset 16960，政府資料開放授權條款-第1版。
    280 座變電所的裝置容量、可靠容量、前一年最大負載與供電範圍。沒有座標。

  內政部國土測繪中心 鄉鎮市區界線
    dataset 7441，同樣的授權。這裡只用它的屬性表建「鄉鎮市區 → 縣市」對照。

  OpenStreetMap
    ODbL，用來補座標。使用時要標註「© OpenStreetMap contributors」。

=== 負載率的口徑，寫文案前先讀這段 ===

「可靠容量」是 N-1 容量，也就是最大的那台主變壓器故障時，剩下的還能供多少。
所以「最大負載 ÷ 可靠容量」超過 100% 的意思是「尖峰時如果掉一台主變，剩下的撐不住」，
不是「現在就過載」。實測 263 座可算的裡面有 64 座超過 100%，最高 209%。
這兩件事差很多，文案不能寫成「過載」或「超載」，那是把備援餘裕講成當下的故障。

另外有 17 座的可靠容量是 0，那是只有一台主變的站，沒有 N-1 這個概念。它們不是
「負載率無限大」，是「本來就沒有備援」，輸出裡 ratio 給 null 並另外標 solo，
不要拿去跟有備援的站排在同一個名次裡。

=== 對名 ===

台電那份沒有座標，OSM 有。名稱對得上：台電寫「基隆S/S」，OSM 寫「基隆變電所」。
兩邊都去掉尾綴取詞幹再比。OSM 那邊的寫法很雜，實測有「大甲變電所(S/S)」這種
種類與尾綴都帶的，所以去尾綴要做兩次，中間夾一次去種類。

實測對名率 71.8%（280 座裡 201 座）。對不到的多半是 OSM 真的沒收錄，OSM 那 1,034
個變電所裡有 367 個連 name 都沒有。對不到的照樣輸出，只是 lat/lon 給 null，
面板的縣市彙總用全部 280 座，地圖上只畫得出有座標的那些。這個落差要標在畫面上。

=== 抓取成本 ===

Overpass 整個台灣一次查會 504，切成 1 度見方的格子慢慢抓，25 格跑完大約 20 分鐘。
Overpass 是志工營運的公共服務，格子之間刻意留間隔，不要縮短也不要平行化。
鄉鎮市區那份為了 35 KB 的屬性表要下載 12.8 MB 的 zip，因為 SHP 跟 DBF 包在一起。
這支是人工執行的產生器不是定期排程，這個成本可以接受。

用法：
  python3 tools/gen_tw_power.py [輸出路徑]
"""
import collections
import csv
import io
import json
import os
import re
import struct
import subprocess
import sys
import time
import urllib.parse
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DEFAULT_OUT = os.path.join(ROOT, "docs", "zh-TW", "games", "tor-network", "tw-power.json")

DS_POWER = os.environ.get("TP_SUB_DATASET", "16960")
DS_TOWN = os.environ.get("MOI_TOWN_DATASET", "7441")
API = "https://data.gov.tw/api/v2/rest/dataset/"
OVERPASS = [
    os.environ.get("OVERPASS_API", "https://overpass.private.coffee/api/interpreter"),
    "https://overpass-api.de/api/interpreter",
]
# 台灣本島與離島，1 度見方
TILES = [(la, lo, la + 1, lo + 1) for la in range(21, 26) for lo in range(118, 123)]

MIN_SUBS = 200   # 少於這個數就是抓壞了，不要安靜輸出半殘的檔


def curl(url, binary=False, timeout="300"):
    r = subprocess.run(
        ["curl", "-sL", "--max-time", timeout, "-A", "Mozilla/5.0", url],
        capture_output=True)
    if r.returncode != 0 or not r.stdout:
        raise SystemExit(f"下載失敗：{url}")
    return r.stdout if binary else r.stdout.decode("utf-8-sig", "replace")


def resource_url(dataset, want_format):
    meta = json.loads(curl(API + dataset))
    dist = (meta.get("result") or {}).get("distribution") or []
    if not dist:
        raise SystemExit(f"dataset {dataset} 的 distribution 是空的，可能下架了")
    for d in dist:
        if (d.get("resourceFormat") or "").upper() == want_format:
            u = d.get("resourceDownloadUrl")
            if not u:
                continue
            p = urllib.parse.urlsplit(u)
            return urllib.parse.urlunsplit(
                (p.scheme, p.netloc, urllib.parse.quote(p.path), p.query, p.fragment))
    have = "、".join(str(d.get("resourceFormat")) for d in dist)
    raise SystemExit(f"dataset {dataset} 沒有 {want_format} 格式，只有：{have}")


def read_dbf(buf):
    n_rec, hdr, rl = struct.unpack("<IHH", buf[4:12])
    fields, off = [], 32
    while buf[off] != 0x0D:
        raw = buf[off:off + 32]
        fields.append((raw[:11].split(b"\x00")[0].decode("utf-8", "replace"), raw[16]))
        off += 32
    rows = []
    for i in range(n_rec):
        rec = buf[hdr + i * rl: hdr + (i + 1) * rl]
        if not rec or rec[0:1] == b"*":
            continue
        vals, p = {}, 1
        for nm, ln in fields:
            vals[nm] = rec[p:p + ln].decode("utf-8", "replace").strip()
            p += ln
        rows.append(vals)
    return rows


def norm(s):
    """台電那份混用台與臺，統一成臺再比對。"""
    return (s or "").replace("台", "臺").strip()


def town_lookup():
    """鄉鎮市區 → 縣市。同時收現名與去後綴的詞幹，後者用來吃改制前的舊地名。

    台電那份還在用桃園縣時期的寫法（中壢市、觀音鄉、平鎮市），現行資料裡是中壢區、
    觀音區、平鎮區，去掉後綴之後詞幹一樣，對得上。
    """
    blob = curl(resource_url(DS_TOWN, "SHP"), binary=True)
    z = zipfile.ZipFile(io.BytesIO(blob))
    dbf = next((n for n in z.namelist()
                if n.lower().endswith(".dbf") and "TOWN_MOI" in n.upper()), None)
    if not dbf:
        dbf = next((n for n in z.namelist() if n.lower().endswith(".dbf")), None)
    if not dbf:
        raise SystemExit("鄉鎮市區的 zip 裡找不到 dbf")
    rows = read_dbf(z.read(dbf))
    if len(rows) < 300:
        raise SystemExit(f"鄉鎮市區只有 {len(rows)} 筆，應該有三百多筆")
    # 鄉鎮名會撞：東區、西區、中正區這些好幾個縣市都有，所以值收成集合，
    # 判定時要求唯一。用 dict 直接覆蓋會出事，實測嘉義市只有東區與西區兩個區，
    # 兩個都被別的縣市蓋掉之後，嘉義市會整個從縣市清單裡消失，
    # 於是「嘉義市博愛路」連縣市前綴那一關都過不了。
    full, stem = collections.defaultdict(set), collections.defaultdict(set)
    counties = set()
    for r in rows:
        c, t = norm(r["COUNTYNAME"]), norm(r["TOWNNAME"])
        counties.add(c)
        full[t].add(c)
        stem[re.sub(r"[市鄉鎮區]$", "", t)].add(c)
    if len(counties) < 22:
        raise SystemExit(f"只認出 {len(counties)} 個縣市，應該有 22 個：{sorted(counties)}")
    return sorted(counties, key=len, reverse=True), full, stem


SUF = "市鄉鎮區"


def resolve_county(loc, counties, full, stem):
    """台電的所在地欄位判縣市。回傳 (縣市, 怎麼判出來的)。"""
    loc = norm(loc)
    for c in counties:
        if loc.startswith(c):
            return c, "縣市前綴"
    # 鄉鎮全名，長的優先，避免「南投市」被「南」之類的短名吃掉。
    # 撞名的（東區、中正區之類）不猜，往下走或直接回報。
    for n in sorted(full, key=len, reverse=True):
        if loc.startswith(n):
            cs = full[n]
            if len(cs) == 1:
                return next(iter(cs)), "鄉鎮全名"
            return None, f"鄉鎮「{n}」在 {'、'.join(sorted(cs))} 都有，無法判定"
    # 改制前的舊名。切法要長的優先：「平鎮市」不能被切成「平鎮」（鎮 是後綴字）
    cands = [loc[:i + 1] for i, ch in enumerate(loc[:5]) if ch in SUF]
    for cand in sorted(cands, key=len, reverse=True):
        cs = stem.get(re.sub(r"[市鄉鎮區]$", "", cand))
        if cs and len(cs) == 1:
            return next(iter(cs)), "改制前舊名"
        if cs and len(cs) > 1:
            return None, f"詞幹「{cand}」在 {'、'.join(sorted(cs))} 都有，無法判定"
    return None, "無法判定"


TAIL = r"\s*[（(]?\s*(S/S|E/S|D/S|P/S|SS)\s*[)）]?\s*$"
KIND = r"(超高壓|特高壓|一次|二次|三次|臨時|高壓)?(變電所|變電站|配電站|開閉所|開關場|配電變電所)$"


def name_stem(name):
    s = norm(name)
    s = re.sub(TAIL, "", s, flags=re.I)
    s = re.sub(KIND, "", s)
    s = re.sub(TAIL, "", s, flags=re.I)   # 「大甲變電所(S/S)」種類與尾綴都帶，要再去一次
    return s.strip("（）() ")


def overpass_tile(bbox):
    q = (f'[out:json][timeout:90];'
         f'nwr["power"="substation"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});'
         f'out center tags;')
    for host in OVERPASS:
        for attempt in range(3):
            r = subprocess.run(
                ["curl", "-s", "--max-time", "120", "-A", "anoni.net-docs/1.0",
                 "--data-urlencode", f"data={q}", host],
                capture_output=True, text=True)
            if r.returncode == 0 and r.stdout.lstrip().startswith("{"):
                try:
                    return json.loads(r.stdout).get("elements", [])
                except json.JSONDecodeError:
                    pass
            time.sleep(6 + attempt * 6)
    return None


def fetch_osm(cache=None):
    """分區抓。cache 指到一個檔就會先讀它，沒有才真的去抓，抓完寫回去。

    這一段要跑三十分鐘，而後面的對名與檢查常常要重跑，每次都重抓對 Overpass
    不禮貌也浪費時間。快取只給開發時用，正式產資料前把檔案刪掉重抓一次。
    """
    if cache and os.path.exists(cache):
        with open(cache, encoding="utf-8") as f:
            d = json.load(f)
        print(f"  用快取 {cache}（{len(d['osm'])} 個詞幹）", file=sys.stderr)
        return d["osm"], d["failed"]
    out, failed = _fetch_osm_live()
    if cache:
        with open(cache, "w", encoding="utf-8") as f:
            json.dump({"osm": out, "failed": failed}, f, ensure_ascii=False)
    return out, failed


def _fetch_osm_live():
    out, failed = {}, []
    for i, b in enumerate(TILES):
        el = overpass_tile(b)
        if el is None:
            failed.append(b)
            print(f"  格子 {i + 1}/{len(TILES)} 取不到，略過", file=sys.stderr)
        else:
            for e in el:
                c = e.get("center") or e
                if c.get("lat") is None:
                    continue
                nm = (e.get("tags") or {}).get("name", "")
                if not nm:
                    continue
                out.setdefault(name_stem(nm), []).append(
                    {"ref": f"{e['type']}/{e['id']}", "name": nm,
                     "lat": round(c["lat"], 5), "lon": round(c["lon"], 5)})
        time.sleep(4)   # 志工營運的公共服務，不要縮短也不要平行化
    return out, failed


def num(x):
    x = (x or "").strip().replace(",", "")
    try:
        return float(x)
    except ValueError:
        return None


def in_ring(flat, lon, lat):
    """射線法。flat 是扁平化的 lon/lat 陣列，跟 tw-admin.json 的 p 同格式。"""
    hit = False
    n = len(flat)
    j = n - 2
    for i in range(0, n, 2):
        yi, yj = flat[i + 1], flat[j + 1]
        if (yi > lat) != (yj > lat):
            if lon < (flat[j] - flat[i]) * (lat - yi) / (yj - yi) + flat[i]:
                hit = not hit
        j = i
    return hit


def load_county_polys():
    """讀 gen_tw_admin.py 產出的縣市界，用來驗證對名到的座標真的落在該縣市。

    對名是靠名稱詞幹，全台唯一才採用，但唯一不代表對。像「信義」這種地名到處都有，
    萬一台電那筆在羅東而 OSM 那個在台北，名稱一樣就會配錯，配錯之後點會畫到別的縣市。
    有縣市界就能直接驗，落在別的縣市就把座標丟掉，記錄下來，不要猜。

    產不出來就跳過這道檢查並提醒，不要因為少一個檔就整支失敗。
    """
    p = os.path.join(ROOT, "docs", "zh-TW", "games", "tor-network", "tw-admin.json")
    if not os.path.exists(p):
        print(f"  提醒：找不到 {p}，跳過座標與縣市的一致性檢查。"
              f"先跑 tools/gen_tw_admin.py 會比較安心。", file=sys.stderr)
        return None
    with open(p, encoding="utf-8") as f:
        d = json.load(f)
    return {norm(c["zh"]): c["p"] for c in d.get("c", [])}


def main():
    out = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT)
    t0 = time.time()

    print("  取鄉鎮市區對照表…", file=sys.stderr)
    counties, full, stem = town_lookup()

    print("  取台電變電所清單…", file=sys.stderr)
    csv_text = curl(resource_url(DS_POWER, "CSV"))
    rows = list(csv.DictReader(io.StringIO(csv_text)))
    if len(rows) < MIN_SUBS:
        raise SystemExit(f"只讀到 {len(rows)} 座變電所，應該有兩百多座，來源可能改了")
    need = ["變電所名", "所在地", "供電範圍"]
    for k in need:
        if k not in rows[0]:
            raise SystemExit(f"CSV 缺欄位「{k}」，欄位定義可能改了：{list(rows[0])}")
    # 容量與負載的欄名帶著民國年（前一年(113年)…），用關鍵字找不要寫死
    def col(*kw):
        for k in rows[0]:
            if all(x in k for x in kw):
                return k
        raise SystemExit(f"CSV 找不到含 {kw} 的欄位：{list(rows[0])}")
    c_cap, c_rel, c_load = col("裝置容量"), col("可靠容量"), col("最大負載")

    print("  抓 OSM 座標（分區慢慢抓，約二十分鐘）…", file=sys.stderr)
    osm, failed_tiles = fetch_osm(os.environ.get("OSM_CACHE"))
    polys = load_county_polys()

    subs, unresolved, matched, wrong_county = [], [], 0, []
    for r in rows:
        name = (r["變電所名"] or "").strip()
        if not name:
            continue
        county, how = resolve_county(r["所在地"], counties, full, stem)
        if not county:
            unresolved.append((name, r["所在地"], how))
            continue
        cap, rel, load = num(r[c_cap]), num(r[c_rel]), num(r[c_load])
        # 全台詞幹唯一才採用。有兩個以上同名就寧可沒有座標，也不要賭是哪一個。
        cand = osm.get(name_stem(name)) or []
        pos = cand[0] if len(cand) == 1 else None
        # 唯一不等於對。用縣市界驗一次，落在別的縣市就丟掉座標並記下來。
        if pos and polys is not None:
            rings = polys.get(county) or []
            if not any(in_ring(r, pos["lon"], pos["lat"]) for r in rings):
                wrong_county.append((name, county, pos["ref"], pos["lat"], pos["lon"]))
                pos = None
        if pos:
            matched += 1
        subs.append({
            "name": name,
            "county": county,
            "loc": (r["所在地"] or "").strip(),
            "area": (r["供電範圍"] or "").strip(),
            "cap": cap,
            "rel": rel,
            "load": load,
            # 可靠容量 0 是只有一台主變、沒有 N-1 可言，不是負載率無限大
            "solo": rel == 0,
            "ratio": round(load / rel, 3) if (rel and load is not None) else None,
            "lat": pos["lat"] if pos else None,
            "lon": pos["lon"] if pos else None,
            "osm": pos["ref"] if pos else None,
        })
    if unresolved:
        raise SystemExit("這幾座判不出縣市，補進對照或檢查來源：\n  "
                         + "\n  ".join(f"{n}｜{l}｜{w}" for n, l, w in unresolved))
    if len(subs) < MIN_SUBS:
        raise SystemExit(f"只整理出 {len(subs)} 座，應該有兩百多座")

    agg = collections.defaultdict(lambda: {"n": 0, "cap": 0.0, "rel": 0.0, "load": 0.0, "tight": 0, "solo": 0})
    for s in subs:
        a = agg[s["county"]]
        a["n"] += 1
        a["cap"] += s["cap"] or 0
        a["rel"] += s["rel"] or 0
        a["load"] += s["load"] or 0
        if s["ratio"] is not None and s["ratio"] > 1:
            a["tight"] += 1
        if s["solo"]:
            a["solo"] += 1
    counties_out = [
        {"county": c, **{k: (round(v, 1) if isinstance(v, float) else v) for k, v in a.items()},
         "ratio": round(a["load"] / a["rel"], 3) if a["rel"] else None}
        for c, a in sorted(agg.items(), key=lambda kv: -kv[1]["load"])
    ]

    payload = {
        "sources": [
            {"name": "台灣電力公司二次變電所主變壓器裝置容量及負載",
             "url": f"https://data.gov.tw/dataset/{DS_POWER}",
             "license": "政府資料開放授權條款-第1版",
             "licenseUrl": "https://data.gov.tw/license",
             "note": "裝置容量、可靠容量、最大負載、供電範圍"},
            {"name": "內政部國土測繪中心 鄉鎮市區界線",
             "url": f"https://data.gov.tw/dataset/{DS_TOWN}",
             "license": "政府資料開放授權條款-第1版",
             "licenseUrl": "https://data.gov.tw/license",
             "note": "只用屬性表建鄉鎮市區到縣市的對照"},
            {"name": "OpenStreetMap contributors",
             "url": "https://www.openstreetmap.org/copyright",
             "license": "ODbL 1.0",
             "licenseUrl": "https://opendatacommons.org/licenses/odbl/",
             "note": "變電所座標"},
        ],
        "loadYear": c_load,
        "total": {
            "n": len(subs),
            "located": matched,
            "cap": round(sum(s["cap"] or 0 for s in subs), 1),
            "rel": round(sum(s["rel"] or 0 for s in subs), 1),
            "load": round(sum(s["load"] or 0 for s in subs), 1),
            "tight": sum(1 for s in subs if s["ratio"] is not None and s["ratio"] > 1),
            "solo": sum(1 for s in subs if s["solo"]),
            "ratable": sum(1 for s in subs if s["ratio"] is not None),
        },
        "counties": counties_out,
        "subs": sorted(subs, key=lambda s: -(s["ratio"] or 0)),
    }

    os.makedirs(os.path.dirname(out), exist_ok=True)
    tmp = out + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")
    os.replace(tmp, out)

    t = payload["total"]
    print(f"寫出 {out}")
    print(f"  變電所 {t['n']} 座，其中 {t['located']} 座有座標"
          f"（{t['located'] / t['n'] * 100:.0f}%，OSM 沒收錄的畫不出來）")
    print(f"  裝置容量 {t['cap']:,.0f} MVA｜可靠容量 {t['rel']:,.0f}｜最大負載 {t['load']:,.0f} MVA")
    print(f"  尖峰負載超過可靠容量的 {t['tight']} 座（可算的 {t['ratable']} 座）"
          f"，只有單一主變的 {t['solo']} 座")
    if wrong_county:
        print(f"  對名到的座標有 {len(wrong_county)} 座落在別的縣市，已丟棄座標：", file=sys.stderr)
        for n, c, ref, la, lo in wrong_county[:10]:
            print(f"    {n}（台電說在{c}）→ OSM {ref} [{la}, {lo}]", file=sys.stderr)
    print(f"  耗時 {time.time() - t0:.0f}s"
          + (f"，Overpass 有 {len(failed_tiles)} 格取不到" if failed_tiles else ""))


if __name__ == "__main__":
    main()
