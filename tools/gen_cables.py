#!/usr/bin/env python3
"""產生「Tor 中繼地球儀」的海底電纜底圖（docs/zh-TW/games/tor-network/cables.json）。

資料來源：OpenStreetMap，經 Overpass API 取 seamark:type=cable_submarine 的線段。
海纜在 OSM 主要是用航海圖那套 seamark 標籤在記（海纜關係到船隻拋錨），數量是
communication=line + submarine=yes 的十幾倍，亞太的覆蓋差別尤其大。
授權 ODbL，使用時要標註「© OpenStreetMap contributors」，畫面上與這個檔案都有註明。

OSM 的海底電纜覆蓋並不完整（例如台灣周邊只收錄了一部分），這個圖層的定位是「海洋
不要一片空白」的背景質感，不是完整的海纜清單，畫面文案要照這個口徑寫。

Overpass 是志工營運的公共服務，這支腳本刻意分區慢慢抓並重試，不要縮短間隔或平行化。
主站 overpass-api.de 常態性回 504，換 OVERPASS_API 指到鏡像（overpass.private.coffee
實測可用）比一直重試有效。

=== 查過但不存在：海纜登陸點 ===

登陸點是海纜的咽喉，台灣那幾個的脆弱性也有話可講，所以查過能不能加。結論是
**OSM 沒有這份資料**，不是抓不到。用 taginfo 查全球數量，五個候選標籤全都是 0 筆：

  man_made=cable_landing_point   0
  seamark:type=landing_point     0
  landing_point=yes              0
  man_made=landing_point         0
  communication=landing_point    0

另外直接看台灣周邊（18-28N、115-128E）47 條海纜 way 的標籤，也沒有任何登陸點的痕跡。
登陸點座標跟纜線幾何一樣沒有進 OSM，理由見 blog/posts/games-globe-open-data.md 記的
那段授權不相容。要做只能自己從公開的登陸地點清單手繪，性質會變成跟 TRUNK 一樣的示意，
不是實測資料。

補充（2026-08-01 查到的更精確狀況）：TeleGeography 曾經在 GitHub 公開整份 GeoJSON，
repo 是 `telegeography/www.submarinecablemap.com`，路徑 `web/public/api/v3/` 下有
`cable-geo.json` 與 `landing-point-geo.json`。那份的 LICENSE 是 CC BY-NC-SA 3.0。
現在該 repo 與整個 GitHub org 都回 404，官網 FAQ 也改成地圖圖片 CC BY-SA 4.0、
geocoded 資料另外付費授權。也就是說開放版本存在過，後來被收回。

網路上找得到 2022 年的 fork（`lintaojlu/submarine_cable_information`），內容完整，
1335 個登陸點，台灣 6 個（Toucheng、Tanshui、Fangshan、Pa Li、Guningtou、Lake Ci），
505 個 cable JSON。fork 帶著原始的 CC BY-NC-SA 3.0 LICENSE 檔。CC 授權對已散布的
副本不可撤回，所以法律上大概站得住，但有三個實際問題。NC 條款的商業定義模糊，
SA 3.0 的 copyleft 會傳染到我們的衍生檔，資料停在 2022 年。加上原始權利人明顯是
刻意收回的，用它等於逆著對方的意思走。要用之前先想清楚願不願意承擔這些。

=== 已知偏差：混到電力海纜 ===

這支沒有做任何標籤過濾，凡是 seamark:type=cable_submarine 都收。而那個標籤同時涵蓋
通訊海纜與電力海纜。實測台灣周邊 47 條裡有 29 條帶 power 標籤、17 條帶 communication、
13 條帶 telecom:medium，也就是說畫面上有一部分「海底電纜」其實是電力纜。

在「海面不要一片空白」的定位下這個偏差可以接受，但畫面文案說的是海底電纜，嚴格講
不夠精確。要修的話在 overpass() 的查詢加上排除 power，或改成只收帶 communication /
telecom:medium 的那些，代價是線更少、太平洋更空。動之前先想清楚要哪一種。

=== 查過但行不通：用 BGP 推測海纜 ===

2026-08-01 查證，結論是 BGP 推不出海纜，別再花時間。分兩個層次講。

推路線幾何：學術界確實有 Bischof 2018（HotNets）、Nautilus 2023（SIGMETRICS）、
Calypso 2025（SIGCOMM）這條線的工作，但它們做的是把 IP 連線「對應到」某條已知海纜，
主力訊號是 traceroute 的 RTT 與地理可行性，BGP 只是配角。而且三者都需要一份現成的
海纜清單與登陸點座標當輸入。Nautilus 論文的參考文獻 `[12]` 直接指向上面那個已經
404 的 TeleGeography repo。這條路的前提資料就是我們原本卡住的東西。

偵測斷纜：這個方向合理，但實測訊號比想像中弱很多。拿 2025-09-06 紅海 SMW4/IMEWE
斷纜當已知事件驗過兩種做法。

一、RouteViews 新加坡 collector 的 MRT，事件當下 22:30-23:15 UTC 對照一週前同時段，
UPDATE 訊息 508,344 對 430,407（×1.18），撤回前綴 52,059 對 41,966（×1.24），
都在日常波動範圍內。逐 ASN 看更亂，Airtel 行動 ×96 但 Reliance Jio ×0.0，
而完全無關的對照組中華電信 `AS3462` 是 ×6.2，比多數受影響的 ASN 還高。
單一 collector 加短時窗的 churn 量，雜訊蓋過訊號。

二、IODA 的 BGP 可見度（這個指標本來就是為偵測斷網設計的），2025-08-30 到 09-14
逐日看，巴基斯坦、阿聯全平，印度只從 160,250 掉到 160,064，也就是 0.1%。

原因很單純。BGP 看的是「連不連得上」，海纜斷掉通常只是繞路變慢，前綴照樣宣告著。
要讓 BGP 可見度真的掉下來，得是整國斷網那種等級。Anurag Bhatia 2025-09 那篇用
IXP looking glass 的路由數確實抓得到大事件，但他自己寫明認不出是哪一條纜，
而且 Tier-1 因為 peering policy 會維持一致路由，斷在他們身上完全看不見。

授權方面順手查了，備忘。RouteViews 原始 MRT 是 CC BY 4.0，可以用，
但要 `mrtparse` 這類套件解析（純 python、Apache-2.0），且單一 collector 一天約
96 個檔、260 MB，超出 publish_games_data.sh 只靠 python3 與 curl 的規模。
RIPEstat 的條款明文寫 `A User may not re-package, compile, re-distribute`，不能收。
IODA 的 API 回應裡 copyright 是 `All Rights Reserved`（Georgia Tech Research
Corporation），也不能收。

真正可行的組合還是現在這個方向。BGP 那半我們拿不到也不需要，moda 的維修表已經
直接給了「哪一條纜、什麼原因、修復進度」，那是 BGP 推不出來的資訊。

用法：
  python3 tools/gen_cables.py [輸出路徑]
"""
import json
import math
import os
import subprocess
import sys
import time

API = os.environ.get("OVERPASS_API", "https://overpass-api.de/api/interpreter")
UA = "anoni.net-globe/1.0 (docs.anoni.net; submarine cable basemap)"
LON_STEP = 15          # 每塊經度寬度，太大會逾時。換標籤後資料多了十幾倍，切細一點
PAUSE = 8              # 每次查詢之間的間隔秒數，對公共服務的基本禮貌
RETRY = 3
TOLERANCE = 0.015      # 簡化容差（度）。0.05 會把 63% 的線砍成兩點直線，形狀整個沒了
MIN_POINTS = 2
MIN_LEN_KM = 15        # 太短的多半是港內或登陸段，畫在地球儀上只是雜點
STITCH_KM = 40         # 端點相距這個距離以內就接起來，OSM 把一條電纜拆成多個 way
DEFAULT_OUT = os.path.join(os.path.dirname(__file__), "..", "docs", "zh-TW",
                           "games", "tor-network", "cables.json")


def overpass(lon0, lon1):
    q = ('[out:json][timeout:120];'
         f'way["seamark:type"="cable_submarine"](-85,{lon0},85,{lon1});'
         'out geom;')
    for attempt in range(RETRY):
        r = subprocess.run(
            ["curl", "-s", "--max-time", "180", "-H", f"User-Agent: {UA}",
             "-X", "POST", API, "--data-urlencode", f"data={q}"],
            capture_output=True, text=True).stdout
        if r.lstrip().startswith("{"):
            try:
                return json.loads(r).get("elements", [])
            except json.JSONDecodeError:
                pass
        wait = PAUSE * (attempt + 2)
        print(f"    第 {attempt + 1} 次失敗（多半是速率限制），等 {wait} 秒再試", file=sys.stderr)
        time.sleep(wait)
    print(f"    經度 {lon0}..{lon1} 放棄", file=sys.stderr)
    return []


def perp(px, py, ax, ay, bx, by):
    """點到線段的垂直距離，簡化用。"""
    dx, dy = bx - ax, by - ay
    if dx == 0 and dy == 0:
        return math.hypot(px - ax, py - ay)
    t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def simplify(pts, tol):
    """Douglas-Peucker。座標點數直接決定檔案大小，這裡砍掉肉眼看不出的轉折。"""
    if len(pts) <= 2:
        return pts
    ax, ay = pts[0]
    bx, by = pts[-1]
    worst, idx = 0.0, 0
    for i in range(1, len(pts) - 1):
        d = perp(pts[i][0], pts[i][1], ax, ay, bx, by)
        if d > worst:
            worst, idx = d, i
    if worst <= tol:
        return [pts[0], pts[-1]]
    return simplify(pts[:idx + 1], tol)[:-1] + simplify(pts[idx:], tol)


def hav_km(a, b):
    """兩個 (lon, lat) 的球面距離，公里。"""
    r = 6371
    p1, p2 = math.radians(a[1]), math.radians(b[1])
    dp, dl = math.radians(b[1] - a[1]), math.radians(b[0] - a[0])
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(min(1, math.sqrt(h)))


def stitch(lines, tol_km=STITCH_KM):
    """把首尾相近的線接起來。

    OSM 常把一條電纜拆成好幾個 way，端點之間留下幾公里到幾十公里的縫。畫在地球上
    就是一段一段斷開的線，看起來像渲染壞掉，其實是資料的切法。這裡把接得起來的接起來。
    """
    remain = [list(ln) for ln in lines]
    out = []
    while remain:
        cur = remain.pop()
        joined = True
        while joined:
            joined = False
            for i, other in enumerate(remain):
                pairs = (
                    (hav_km(cur[-1], other[0]), False, False),   # 尾接頭
                    (hav_km(cur[-1], other[-1]), False, True),   # 尾接尾（對方要反轉）
                    (hav_km(cur[0], other[-1]), True, False),    # 頭接尾
                    (hav_km(cur[0], other[0]), True, True),      # 頭接頭（對方要反轉）
                )
                d, at_head, flip = min(pairs, key=lambda x: x[0])
                if d > tol_km:
                    continue
                seg = list(reversed(other)) if flip else other
                cur = (seg[:-1] + cur) if at_head else (cur + seg[1:])
                remain.pop(i)
                joined = True
                break
        out.append(cur)
    return out


def main():
    out = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT)
    t0 = time.time()
    seen, lines = set(), []
    for lon0 in range(-180, 180, LON_STEP):
        lon1 = lon0 + LON_STEP
        els = overpass(lon0, lon1)
        print(f"  經度 {lon0:>4}..{lon1:<4} → {len(els)} 條", file=sys.stderr)
        for e in els:
            if e.get("id") in seen:
                continue        # 跨區塊的線會被兩邊都抓到
            seen.add(e.get("id"))
            geom = e.get("geometry") or []
            pts = [(round(g["lon"], 3), round(g["lat"], 3)) for g in geom if "lon" in g]
            if len(pts) < MIN_POINTS:
                continue
            lines.append(pts)
        time.sleep(PAUSE)

    # 濾掉太短的線段
    def length_km(pts):
        return sum(hav_km(pts[i], pts[i + 1]) for i in range(len(pts) - 1))
    lines = [ln for ln in lines if length_km(ln) >= MIN_LEN_KM]

    # 先接合再簡化。順序反過來的話，簡化會先把端點挪動，接縫更難對上。
    before = len(lines)
    lines = stitch(lines)
    lines = [simplify(ln, TOLERANCE) for ln in lines]
    print(f"  接合：{before} 條 → {len(lines)} 條", file=sys.stderr)

    # 攤平成 [lon, lat, lon, lat, ...]，前端直接讀，不用再解物件
    flat = [[c for p in ln for c in p] for ln in lines]
    total_pts = sum(len(f) // 2 for f in flat)
    data = {
        "source": "OpenStreetMap contributors",
        "sourceUrl": "https://www.openstreetmap.org/copyright",
        "license": "ODbL 1.0",
        "licenseUrl": "https://opendatacommons.org/licenses/odbl/1-0/",
        "note": "seamark:type=cable_submarine。OSM 的海纜覆蓋仍不完整，這是底圖不是完整清單。",
        "lines": flat,
    }
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
    print(f"DONE → {out}（{time.time() - t0:.0f} 秒）")
    print(f"  {len(flat)} 條線，{total_pts:,} 個座標點，{os.path.getsize(out):,} bytes")


if __name__ == "__main__":
    main()
