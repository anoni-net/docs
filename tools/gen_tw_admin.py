#!/usr/bin/env python3
"""產生「Tor 中繼地球儀」的台灣縣市界線（docs/zh-TW/games/tor-network/tw-admin.json）。

資料來源：內政部國土測繪中心「直轄市、縣市界線(TWD97經緯度)」，
政府資料開放平臺 dataset 7442，授權政府資料開放授權條款-第1版。

=== 為什麼是向量線不是貼圖 ===

底圖是一張 2048x1024 的 canvas 貼上球面，等於每度只有 5.7 個像素，台灣本島在那張
貼圖裡只有 14 像素寬。畫面涵蓋 1 度地表時，那 14 像素要撐滿整個螢幕，放大 158 倍。
縣市界線靠貼圖畫不出來，只能走向量線，那個不論放多大都是銳利的。

=== 下載網址不要寫死 ===

檔名帶著民國日期（COUNTY_MOI_1140318），資料更新時整串會變。這支從 data.gov.tw 的
API v2 取 distribution 裡的 SHP 下載網址，網址含中文要先做 percent-encoding。
API 改版或找不到 SHP 就大聲失敗，不要退回一個寫死的舊網址靜靜產出過期資料。

=== 剖析 ===

SHP 與 DBF 都用標準庫的 struct 直接讀，不裝任何套件。Polygon(shape type 5) 的格式
很單純：表頭 100 bytes，每筆記錄是 parts 索引陣列加上 points 陣列。DBF 的編碼看
同一包裡的 CPG 檔，這份是 UTF-8，不必處理 Big5。

座標系是 GCS_TWD97[2020]，基於 GRS-1980 橢球。跟 WGS84 的差異是公分等級，
在這個尺度下當成同一套用沒有問題。

=== 簡化 ===

原始資料 22 個縣市、697 個環、332,091 個點，直接上網太重。用 Douglas-Peucker 簡化，
容差 TOLER 度。畫面涵蓋 1 度地表、短邊 900 像素時，一個像素是 0.0011 度，所以
0.0006 度的容差在那個深度仍然是次像素，看不出被簡化過。

跨距小於 MIN_SPAN 的環丟掉。那是澎湖的礁岩那種等級，畫出來只有一兩個像素。
實測 697 環會剩 84 環、12,955 點，而蘭嶼、綠島、小琉球、澎湖本島、金門本島、
南竿、東沙島、太平島都還在。有加測試守住這件事，改參數的時候會擋。

=== 領土範圍照原資料收錄 ===

這份官方資料把釣魚台列嶼歸在宜蘭縣、東沙島與南沙太平島歸在高雄市，所以整份的
緯度範圍是 10.37N 到 26.39N，比一般認知的台灣大得多。這裡照原資料收錄不做刪改，
那是資料提供機關的界定。但要注意「把畫面拉到台灣」那種取景不能直接吃這份的
bounding box，會被太平島拉到南海去。

用法：
  python3 tools/gen_tw_admin.py [輸出路徑]
"""
import io
import json
import math
import os
import struct
import subprocess
import sys
import time
import urllib.parse
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DEFAULT_OUT = os.path.join(ROOT, "docs", "zh-TW", "games", "tor-network", "tw-admin.json")

DATASET = os.environ.get("MOI_COUNTY_DATASET", "7442")
API = f"https://data.gov.tw/api/v2/rest/dataset/{DATASET}"
PAGE = f"https://data.gov.tw/dataset/{DATASET}"

TOLER = 0.0006     # Douglas-Peucker 容差（度），約 67 公尺
MIN_SPAN = 0.005   # 環的最大跨距小於這個就丟掉（度），約 555 公尺
DIGITS = 4         # 座標小數位，約 11 公尺，遠低於 TOLER，不會反而變成瓶頸

# 簡體寫法。22 筆而已，人工對過，不引進轉換套件。
ZH_CN = {
    "臺北市": "台北市", "新北市": "新北市", "桃園市": "桃园市", "臺中市": "台中市",
    "臺南市": "台南市", "高雄市": "高雄市", "基隆市": "基隆市", "新竹市": "新竹市",
    "嘉義市": "嘉义市", "新竹縣": "新竹县", "苗栗縣": "苗栗县", "彰化縣": "彰化县",
    "南投縣": "南投县", "雲林縣": "云林县", "嘉義縣": "嘉义县", "屏東縣": "屏东县",
    "宜蘭縣": "宜兰县", "花蓮縣": "花莲县", "臺東縣": "台东县", "澎湖縣": "澎湖县",
    "金門縣": "金门县", "連江縣": "连江县",
}
# 一定要留下來的島，跨距門檻調鬆之後會先犧牲這些，所以明確測
MUST_KEEP = {
    "蘭嶼": (22.05, 121.53), "綠島": (22.66, 121.49), "小琉球": (22.34, 120.37),
    "澎湖本島": (23.57, 119.58), "金門本島": (24.44, 118.35), "南竿": (26.15, 119.94),
}


def curl(url, binary=False):
    args = ["curl", "-sL", "--max-time", "300", "-A", "Mozilla/5.0", url]
    r = subprocess.run(args, capture_output=True)
    if r.returncode != 0 or not r.stdout:
        raise SystemExit(f"下載失敗：{url}")
    return r.stdout if binary else r.stdout.decode("utf-8", "replace")


def shp_url():
    """從開放資料平臺的 API 取 SHP 的下載網址。檔名帶民國日期，不要寫死。"""
    try:
        meta = json.loads(curl(API))
    except json.JSONDecodeError:
        raise SystemExit(f"{API} 回的不是 JSON，API 可能改版了")
    res = (meta.get("result") or {})
    dist = res.get("distribution") or []
    if not dist:
        raise SystemExit(f"{API} 的 distribution 是空的，資料集可能下架了")
    for d in dist:
        if (d.get("resourceFormat") or "").upper() == "SHP":
            u = d.get("resourceDownloadUrl")
            if not u:
                continue
            p = urllib.parse.urlsplit(u)
            # 路徑含中文，要編碼才送得出去
            return urllib.parse.urlunsplit(
                (p.scheme, p.netloc, urllib.parse.quote(p.path), p.query, p.fragment))
    have = "、".join(str(d.get("resourceFormat")) for d in dist)
    raise SystemExit(f"這個資料集裡找不到 SHP，只有：{have}")


def read_dbf(buf):
    n_rec, hdr_len, rec_len = struct.unpack("<IHH", buf[4:12])
    fields, off = [], 32
    while buf[off] != 0x0D:
        raw = buf[off:off + 32]
        fields.append((raw[:11].split(b"\x00")[0].decode("utf-8", "replace"), raw[16]))
        off += 32
    rows = []
    for i in range(n_rec):
        rec = buf[hdr_len + i * rec_len: hdr_len + (i + 1) * rec_len]
        if not rec:
            continue
        vals, p = {}, 1
        for name, flen in fields:
            vals[name] = rec[p:p + flen].decode("utf-8", "replace").strip()
            p += flen
        if rec[0:1] != b"*":     # 刪除標記
            rows.append(vals)
    return rows


def read_shp(buf):
    """回傳 [ [ring, ...], ... ]，ring 是 [(lon, lat), ...]"""
    code, = struct.unpack(">i", buf[0:4])
    if code != 9994:
        raise SystemExit(f"不是 shapefile（file code {code}）")
    out, off = [], 100
    while off < len(buf):
        _n, clen = struct.unpack(">ii", buf[off:off + 8])
        off += 8
        end = off + clen * 2
        (shp,) = struct.unpack("<i", buf[off:off + 4])
        if shp == 0:
            out.append([])
            off = end
            continue
        if shp != 5:
            raise SystemExit(f"只處理 Polygon(5)，遇到 shape type {shp}")
        n_parts, n_pts = struct.unpack("<ii", buf[off + 36:off + 44])
        pb = off + 44
        parts = struct.unpack(f"<{n_parts}i", buf[pb:pb + n_parts * 4])
        xb = pb + n_parts * 4
        co = struct.unpack(f"<{n_pts * 2}d", buf[xb:xb + n_pts * 16])
        rings = []
        for k in range(n_parts):
            a = parts[k]
            b = parts[k + 1] if k + 1 < n_parts else n_pts
            rings.append([(co[j * 2], co[j * 2 + 1]) for j in range(a, b)])
        out.append(rings)
        off = end
    return out


def simplify(pts, tol):
    """迭代式 Douglas-Peucker。用堆疊不用遞迴，環長上萬點時遞迴會爆。"""
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
        den = math.hypot(dx, dy)
        best, bi = -1.0, -1
        for i in range(a + 1, b):
            x, y = pts[i]
            d = abs(dy * x - dx * y + x1 * y0 - y1 * x0) / den if den else math.hypot(x - x0, y - y0)
            if d > best:
                best, bi = d, i
        if best > tol:
            keep[bi] = True
            stack.append((a, bi))
            stack.append((bi, b))
    return [p for p, k in zip(pts, keep) if k]


def span(ring):
    xs = [p[0] for p in ring]
    ys = [p[1] for p in ring]
    return max(max(xs) - min(xs), max(ys) - min(ys))


def centroid(ring):
    """面積加權質心。給前端當縣市定位的後備值。"""
    a = cx = cy = 0.0
    for i in range(len(ring) - 1):
        x0, y0 = ring[i]
        x1, y1 = ring[i + 1]
        f = x0 * y1 - x1 * y0
        a += f
        cx += (x0 + x1) * f
        cy += (y0 + y1) * f
    if abs(a) < 1e-12:
        return (sum(p[0] for p in ring) / len(ring), sum(p[1] for p in ring) / len(ring))
    a *= 0.5
    return (cx / (6 * a), cy / (6 * a))


def main():
    out = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT)
    t0 = time.time()

    url = shp_url()
    print(f"  取自 {url.rsplit('/', 1)[-1]}", file=sys.stderr)
    blob = curl(url, binary=True)
    try:
        z = zipfile.ZipFile(io.BytesIO(blob))
    except zipfile.BadZipFile:
        raise SystemExit("下載到的不是 zip，來源可能改了或被擋了")
    names = z.namelist()
    shp_name = next((n for n in names if n.lower().endswith(".shp")), None)
    dbf_name = next((n for n in names if n.lower().endswith(".dbf")), None)
    if not shp_name or not dbf_name:
        raise SystemExit(f"zip 裡缺 shp 或 dbf：{names}")
    cpg = next((n for n in names if n.lower().endswith(".cpg")), None)
    if cpg:
        enc = z.read(cpg).decode("ascii", "replace").strip()
        if enc.upper().replace("-", "") != "UTF8":
            raise SystemExit(f"CPG 說編碼是 {enc}，這支只處理 UTF-8，要改剖析器")

    rows = read_dbf(z.read(dbf_name))
    polys = read_shp(z.read(shp_name))
    if len(rows) != len(polys):
        raise SystemExit(f"dbf {len(rows)} 筆對不上 shp {len(polys)} 筆")
    if len(rows) < 22:
        raise SystemExit(f"只有 {len(rows)} 個縣市，應該至少 22 個，資料可能不完整")
    for f in ("COUNTYID", "COUNTYCODE", "COUNTYNAME", "COUNTYENG"):
        if f not in rows[0]:
            raise SystemExit(f"dbf 缺欄位 {f}，欄位定義可能改了：{list(rows[0])}")

    raw_rings = sum(len(r) for r in polys)
    raw_pts = sum(len(x) for r in polys for x in r)

    items, kept_rings, kept_pts = [], 0, 0
    for row, rings in zip(rows, polys):
        zh = row["COUNTYNAME"]
        keep = []
        for ring in rings:
            if span(ring) < MIN_SPAN:
                continue
            s = simplify(ring, TOLER)
            if len(s) < 4:
                continue
            keep.append(s)
        if not keep:
            raise SystemExit(f"{zh} 簡化之後一個環都不剩，TOLER 或 MIN_SPAN 太鬆")
        keep.sort(key=len, reverse=True)
        kept_rings += len(keep)
        kept_pts += sum(len(k) for k in keep)
        m = centroid(keep[0])
        items.append({
            "id": row["COUNTYCODE"],
            "zh": zh,
            "zhCn": ZH_CN.get(zh, zh),
            "en": row["COUNTYENG"],
            "m": [round(m[0], DIGITS), round(m[1], DIGITS)],
            "p": [[c for p in k for c in (round(p[0], DIGITS), round(p[1], DIGITS))] for k in keep],
        })
    missing = [i["zh"] for i in items if i["zh"] not in ZH_CN]
    if missing:
        raise SystemExit(f"這幾個縣市沒有簡體寫法，補進 ZH_CN：{'、'.join(missing)}")

    # 重要離島有沒有被 MIN_SPAN 濾掉。跨距門檻一放鬆就會先犧牲這些。
    all_rings = [k for it in items for k in it["p"]]
    lost = []
    for nm, (la, lo) in MUST_KEEP.items():
        best = 1e9
        for flat in all_rings:
            n = len(flat) // 2
            cx = sum(flat[i * 2] for i in range(n)) / n
            cy = sum(flat[i * 2 + 1] for i in range(n)) / n
            d = math.hypot((cy - la) * 111, (cx - lo) * 111 * math.cos(math.radians(la)))
            best = min(best, d)
        if best > 8:
            lost.append(f"{nm}（最近的環在 {best:.0f} 公里外）")
    if lost:
        raise SystemExit("這幾個島被濾掉了，MIN_SPAN 太大：" + "、".join(lost))

    lats = [flat[i * 2 + 1] for flat in all_rings for i in range(len(flat) // 2)]
    payload = {
        "source": "內政部國土測繪中心",
        "sourceUrl": PAGE,
        "license": "政府資料開放授權條款-第1版",
        "licenseUrl": "https://data.gov.tw/license",
        "dataset": os.path.basename(shp_name),
        "toler": TOLER,
        "minSpan": MIN_SPAN,
        "c": items,
    }
    os.makedirs(os.path.dirname(out), exist_ok=True)
    tmp = out + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")
    os.replace(tmp, out)

    size = os.path.getsize(out)
    print(f"寫出 {out}")
    print(f"  {len(items)} 個縣市｜環 {raw_rings} → {kept_rings}｜點 {raw_pts:,} → {kept_pts:,}"
          f"｜{size / 1024:.0f} KB｜耗時 {time.time() - t0:.1f}s")
    print(f"  緯度範圍 {min(lats):.2f}N 到 {max(lats):.2f}N"
          f"（含釣魚台列嶼、東沙島與南沙太平島，照原資料收錄）")


if __name__ == "__main__":
    main()
