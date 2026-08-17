#!/usr/bin/env python3
"""產生台灣的能源三件套（docs/zh-TW/games/tor-network/play/tw-energy.json）。

三份都來自台灣電力公司，都採政府資料開放授權條款-第1版：

  再生能源各場址資料（dataset 17141）
    台電自建的風力、太陽能、地熱場址，含能源別、型號、裝置容量、風機數量與地址。
    沒有座標，地址靠 Nominatim（OpenStreetMap，ODbL）地理編碼。

  各縣市住宅、服務業及機關用電統計（dataset 29935）
    每月、按縣市、按用電性質的售電量。這是需求面，跟 gen_tw_power.py 那份變電所
    容量的供給面配成一對。

  本年度每日尖峰備轉容量率（dataset 25850）
    每天一列，備轉容量與備轉容量率。電網每天離極限多近。

=== 地理編碼的分寸 ===

地址細到里與門牌，Nominatim 查得到的多半是里級，精度大約一公里。這個層級對
「台電在哪裡有再生能源場址」夠用，但不要拿去講「這座風機在這個座標」。
輸出的 precision 欄位據實標，跟海纜登陸點那份同一個原則。

離岸風場的地址是「彰化縣芳苑鄉外海7.2-8.7公里處」，那不是地址，地理編碼一定失敗。
這種照實留 null，不要退而求其次抓到芳苑鄉的陸地上，那會把離岸風場畫到岸上。

Nominatim 是志工營運的公共服務，條款要求每秒最多一次請求並帶可識別的 User-Agent，
這支照做，九十幾筆大約兩分鐘。開發時用 GEO_CACHE 避免重複查。

=== 三份資料的坑 ===

一、17141 有小計列，能源別是空的、名稱長「18站」這樣，容量欄卻是真數字。
   用「能源別為空」判掉，不能只看容量能不能解析。

二、29935 的售電量有些帶千分位逗號有些不帶，同一欄混用。年月是民國年月（11504
   代表民國115年4月，也就是 2026 年 4 月）。

三、25850 的日期是 YYYYMMDD 的西元年，跟上面那份不同，不要混。

用法：
  python3 tools/gen_tw_energy.py [輸出路徑]
  GEO_CACHE=/tmp/geo.json python3 tools/gen_tw_energy.py   # 開發時免得重查
"""
import collections
import csv
import io
import json
import os
import re
import subprocess
import sys
import time
import urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DEFAULT_OUT = os.path.join(ROOT, "docs", "zh-TW", "games", "tor-network", "play", "tw-energy.json")

DS_SITE = os.environ.get("TP_SITE_DATASET", "17141")
DS_USE = os.environ.get("TP_USE_DATASET", "29935")
DS_RESERVE = os.environ.get("TP_RESERVE_DATASET", "25850")
API = "https://data.gov.tw/api/v2/rest/dataset/"
NOMINATIM = "https://nominatim.openstreetmap.org/search"
# Nominatim 的使用條款要求帶可識別的聯絡方式
UA = "anoni-net-docs/1.0 (https://anoni.net; toomore0929@gmail.com)"

MIN_SITES = 60
MIN_USE_ROWS = 5000
MIN_RESERVE = 30


def curl(url, args=None):
    r = subprocess.run(args or ["curl", "-sL", "--max-time", "180", "-A", "Mozilla/5.0", url],
                       capture_output=True)
    if r.returncode != 0 or not r.stdout:
        raise SystemExit(f"下載失敗：{url}")
    return r.stdout.decode("utf-8-sig", "replace")


def resource_url(dataset, want="CSV"):
    meta = json.loads(curl(API + dataset))
    dist = (meta.get("result") or {}).get("distribution") or []
    if not dist:
        raise SystemExit(f"dataset {dataset} 的 distribution 是空的，可能下架了")
    for d in dist:
        if (d.get("resourceFormat") or "").upper() == want:
            u = d.get("resourceDownloadUrl")
            if not u:
                continue
            p = urllib.parse.urlsplit(u)
            return urllib.parse.urlunsplit(
                (p.scheme, p.netloc, urllib.parse.quote(p.path), p.query, p.fragment))
    have = "、".join(str(d.get("resourceFormat")) for d in dist)
    raise SystemExit(f"dataset {dataset} 沒有 {want}，只有：{have}")


def rows_of(dataset):
    return list(csv.DictReader(io.StringIO(curl(resource_url(dataset)))))


def num(x):
    s = str(x or "").replace(",", "").strip()
    return float(s) if re.fullmatch(r"-?\d+(\.\d+)?", s) else None


def norm(s):
    return (s or "").replace("台", "臺").strip()


def zh(v):
    """這幾份的欄位值常是「中文/English」，取中文那半。"""
    return (v or "").split("/")[0].strip()


COUNTIES = [
    "臺北市", "新北市", "桃園市", "臺中市", "臺南市", "高雄市", "基隆市", "新竹市", "嘉義市",
    "新竹縣", "苗栗縣", "彰化縣", "南投縣", "雲林縣", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣",
    "臺東縣", "澎湖縣", "金門縣", "連江縣",
]


def county_of(addr):
    a = norm(addr)
    return next((c for c in COUNTIES if a.startswith(c)), None)


def geocode(addr, cache):
    """回傳 (lat, lon, precision) 或 (None, None, 原因)。

    地址查不到就往上退一級（去掉門牌、再去掉里），退到鄉鎮就停。再退下去會落在
    縣市中心，那跟「這裡有一座場址」是兩回事，寧可沒有。
    """
    a = norm(addr)
    if not a:
        return None, None, "無地址"
    # 外海那種不是地址，直接放棄，不要退而求其次抓到岸上
    if re.search(r"外海|海域|離岸", a):
        return None, None, "外海，無法定位"
    if a in cache:
        c = cache[a]
        return c[0], c[1], c[2]

    tries = [(a, "門牌"), (re.sub(r"\d+.*$", "", a), "里"),
             (re.match(r"^(.{2,3}[市縣].{1,4}[區鄉鎮市])", a).group(1) if
              re.match(r"^(.{2,3}[市縣].{1,4}[區鄉鎮市])", a) else None, "鄉鎮")]
    for q, prec in tries:
        if not q or len(q) < 5:
            continue
        r = subprocess.run(
            ["curl", "-s", "--max-time", "30", "-A", UA, "-G", NOMINATIM,
             "--data-urlencode", f"q={q}", "--data-urlencode", "format=jsonv2",
             "--data-urlencode", "countrycodes=tw", "--data-urlencode", "limit=1"],
            capture_output=True, text=True)
        time.sleep(1.1)          # 條款要求每秒最多一次
        try:
            hit = json.loads(r.stdout)
        except json.JSONDecodeError:
            continue
        if hit:
            lat, lon = round(float(hit[0]["lat"]), 5), round(float(hit[0]["lon"]), 5)
            cache[a] = [lat, lon, prec]
            return lat, lon, prec
    cache[a] = [None, None, "查無"]
    return None, None, "查無"


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
    """讀 gen_tw_admin.py 產出的縣市界，用來驗地理編碼的結果真的落在該縣市。

    county_of() 只是拿地址字串的前綴對縣市清單，那驗的是「台電怎麼寫」，不是
    「Nominatim 把它放到哪裡」。地址寫新北市而編碼結果掉到桃園，字串比對看不出來。
    這道檢查才是真的在驗座標。

    產不出來就跳過並提醒，不要因為少一個檔就整支失敗。
    """
    p = os.path.join(ROOT, "docs", "zh-TW", "games", "tor-network", "play", "tw-admin.json")
    if not os.path.exists(p):
        print(f"  提醒：找不到 {p}，跳過座標與縣市的一致性檢查。"
              f"先跑 tools/gen_tw_admin.py 會比較安心。", file=sys.stderr)
        return None
    with open(p, encoding="utf-8") as f:
        d = json.load(f)
    return {norm(c["zh"]): c["p"] for c in d.get("c", [])}


def verify_counties(sites, polys):
    """把落在所述縣市之外的座標丟掉。回傳丟掉幾筆。

    寧可沒有座標也不要錯的座標。畫錯位置比不畫更糟，因為看的人不會知道它是錯的。
    """
    if not polys:
        return 0
    bad = 0
    for s in sites:
        if s["lat"] is None or not s["county"]:
            continue
        rings = polys.get(norm(s["county"]))
        if not rings:
            continue
        if any(in_ring(r, s["lon"], s["lat"]) for r in rings):
            continue
        print(f"  丟掉 {s['name']}：編碼到 {s['lat']:.5f},{s['lon']:.5f}，"
              f"不在台電所述的 {s['county']} 境內", file=sys.stderr)
        s["lat"] = s["lon"] = None
        s["precision"] = "縣市界驗證未通過"
        bad += 1
    return bad


def build_sites(cache):
    rows = rows_of(DS_SITE)
    if len(rows) < MIN_SITES:
        raise SystemExit(f"再生能源場址只讀到 {len(rows)} 列，應該有九十幾列")

    def col(kw):
        return next((k for k in rows[0] if kw in k), None)
    c_ty, c_nm, c_cap = col("能源別"), col("發電站名稱"), col("裝置容量")
    c_addr, c_model, c_wt = col("地址"), col("型號"), col("風機數量")
    if not all([c_ty, c_nm, c_cap, c_addr]):
        raise SystemExit(f"再生能源場址缺欄位，實際是：{list(rows[0])}")

    out, skipped, unlocated = [], 0, 0
    for r in rows:
        ty = zh(r[c_ty])
        # 小計列的能源別是空的，名稱長「18站」那樣。容量欄卻是真數字，
        # 所以不能只看容量能不能解析。
        if not ty:
            skipped += 1
            continue
        cap = num(r[c_cap])
        if cap is None:
            skipped += 1
            continue
        addr = (r[c_addr] or "").strip()
        lat, lon, prec = geocode(addr, cache)
        if lat is None:
            unlocated += 1
        out.append({
            "name": zh(r[c_nm]),
            "type": ty,
            "cap": round(cap / 1000, 3),      # 瓩換成 MW，跟其他發電資料同單位
            "model": zh(r.get(c_model)) if c_model else "",
            "units": (r.get(c_wt) or "").strip() if c_wt else "",
            "addr": addr,
            "county": county_of(addr) or "",
            "lat": lat, "lon": lon,
            "precision": prec,
        })
    return out, skipped, unlocated


def build_demand():
    rows = rows_of(DS_USE)
    if len(rows) < MIN_USE_ROWS:
        raise SystemExit(f"用電統計只讀到 {len(rows)} 列，應該有上萬列")
    need = ("年月", "縣市", "用電性質", "售電量(度)")
    for k in need:
        if k not in rows[0]:
            raise SystemExit(f"用電統計缺欄位「{k}」，實際是：{list(rows[0])}")
    yms = sorted({r["年月"] for r in rows if r.get("年月")})
    last = yms[-1]
    # 民國年月轉西元。11504 是民國115年4月，也就是 2026 年 4 月。
    roc = int(last)
    label = f"{roc // 100 + 1911}-{roc % 100:02d}"
    agg = collections.defaultdict(lambda: collections.defaultdict(float))
    for r in rows:
        if r["年月"] != last:
            continue
        v = num(r["售電量(度)"])
        if v is None:
            continue
        agg[norm(r["縣市"])][r["用電性質"]] += v
    counties = [
        {"county": c, "total": round(sum(s.values())),
         "sectors": {k: round(v) for k, v in sorted(s.items(), key=lambda kv: -kv[1])}}
        for c, s in sorted(agg.items(), key=lambda kv: -sum(kv[1].values()))
    ]
    if len(counties) < 20:
        raise SystemExit(f"最新月份只有 {len(counties)} 個縣市，應該有 22 個")
    return {"ym": last, "label": label, "months": len(yms), "counties": counties}


def build_reserve():
    rows = rows_of(DS_RESERVE)
    if len(rows) < MIN_RESERVE:
        raise SystemExit(f"備轉容量率只讀到 {len(rows)} 列")
    k_d = next((k for k in rows[0] if "日期" in k), None)
    k_p = next((k for k in rows[0] if "率" in k), None)
    if not k_d or not k_p:
        raise SystemExit(f"備轉容量率缺欄位，實際是：{list(rows[0])}")
    days = []
    for r in rows:
        p = num(r[k_p])
        d = (r[k_d] or "").strip()
        if p is None or not re.fullmatch(r"\d{8}", d):
            continue
        days.append([d, round(p, 2)])
    days.sort()
    v = sorted(x[1] for x in days)
    return {
        "days": days,
        "from": days[0][0], "to": days[-1][0],
        "min": v[0], "max": v[-1], "median": v[len(v) // 2],
        # 備轉容量率低於 10% 是台電自己的橙燈門檻，供電吃緊
        "tight": sum(1 for x in v if x < 10),
    }


def main():
    out = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT)
    t0 = time.time()
    cache_path = os.environ.get("GEO_CACHE")
    cache = {}
    if cache_path and os.path.exists(cache_path):
        with open(cache_path, encoding="utf-8") as f:
            cache = json.load(f)
        print(f"  地理編碼用快取 {cache_path}（{len(cache)} 筆）", file=sys.stderr)

    print("  取再生能源各場址並地理編碼（每秒一次，約兩分鐘）…", file=sys.stderr)
    sites, skipped, unlocated = build_sites(cache)
    # 地理編碼完就驗座標落在台電所述的縣市裡。這道檢查一直寫在 NOTICE 與畫面的
    # 來源說明裡，但先前只有 gen_tw_power.py 真的做，這支沒有，說明與實作對不上。
    dropped = verify_counties(sites, load_county_polys())
    unlocated += dropped
    if cache_path:
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(cache, f, ensure_ascii=False)

    print("  取各縣市用電統計…", file=sys.stderr)
    demand = build_demand()
    print("  取每日尖峰備轉容量率…", file=sys.stderr)
    reserve = build_reserve()

    by_type = collections.Counter()
    for s in sites:
        by_type[s["type"]] += s["cap"]
    payload = {
        "sources": [
            {"name": "台灣電力公司再生能源各場址資料",
             "url": f"https://data.gov.tw/dataset/{DS_SITE}",
             "license": "政府資料開放授權條款-第1版", "licenseUrl": "https://data.gov.tw/license"},
            {"name": "台灣電力公司各縣市住宅、服務業及機關用電統計資料",
             "url": f"https://data.gov.tw/dataset/{DS_USE}",
             "license": "政府資料開放授權條款-第1版", "licenseUrl": "https://data.gov.tw/license"},
            {"name": "台灣電力公司本年度每日尖峰備轉容量率",
             "url": f"https://data.gov.tw/dataset/{DS_RESERVE}",
             "license": "政府資料開放授權條款-第1版", "licenseUrl": "https://data.gov.tw/license"},
            {"name": "OpenStreetMap contributors（Nominatim 地理編碼）",
             "url": "https://www.openstreetmap.org/copyright",
             "license": "ODbL 1.0", "licenseUrl": "https://opendatacommons.org/licenses/odbl/"},
        ],
        "sites": sites,
        "siteTotal": {
            "n": len(sites),
            "located": sum(1 for s in sites if s["lat"] is not None),
            "cap": round(sum(s["cap"] for s in sites), 1),
            "byType": [{"type": k, "cap": round(v, 1)} for k, v in by_type.most_common()],
        },
        "demand": demand,
        "reserve": reserve,
    }

    os.makedirs(os.path.dirname(out), exist_ok=True)
    tmp = out + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")
    os.replace(tmp, out)

    st = payload["siteTotal"]
    print(f"寫出 {out}")
    print(f"  再生能源場址 {st['n']} 處（跳過 {skipped} 列小計），合計 {st['cap']:,.1f} MW")
    print(f"    定位到 {st['located']} 處，{unlocated} 處沒有（多半是離岸或地址查不到）")
    print(f"    縣市界驗證：{st['located']} 處全部落在台電所述的縣市內"
          if not dropped else
          f"    縣市界驗證：丟掉 {dropped} 處落在別的縣市的座標")
    print(f"  用電統計 {demand['label']}，{len(demand['counties'])} 個縣市，"
          f"資料涵蓋 {demand['months']} 個月")
    print(f"  備轉容量率 {reserve['from']} 到 {reserve['to']}，"
          f"最低 {reserve['min']}%、中位 {reserve['median']}%、低於 10% 的有 {reserve['tight']} 天")
    print(f"  {os.path.getsize(out) / 1024:.0f} KB｜耗時 {time.time() - t0:.0f}s")


if __name__ == "__main__":
    main()
