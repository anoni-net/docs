#!/usr/bin/env python3
"""產生台灣海纜登陸點資料（docs/zh-TW/games/tor-network/tw-landing.json）。

把人工維護的 tools/data/tw_landing.toml 跟數位發展部的海纜清單合併起來，
輸出地球儀要用的 JSON。

=== 這是自建資料集 ===

海纜登陸點座標沒有進過任何開放資料庫，OSM 的五個候選標籤全是 0 筆，Wikidata 的
190 個海底通訊電纜項目只有 1 個帶座標。唯一完整的是 TeleGeography，而他們 2022 年
底之後收回 GitHub 上的 CC 授權版本，改成年費授權。

網路上流通的 CC BY-NC-SA 3.0 快照只有台灣 6 個登陸點，現行版有 21 個，差的那 15 個
正好是馬祖、澎湖、金門。所以這裡不碰 TeleGeography 的任何資料，範圍縮到台灣，
從公開文獻與 OSM 自己建。每一筆的出處寫在 toml 裡，不是靠記憶填的。

=== 精度是資料的一部分 ===

登陸點的精度差很多。頭城與枋山是 OSM 有明確標註的海纜站，而且有海纜線段端點在幾十
公尺內佐證。東引、南竿只查得到鄉鎮級地名，座標是取鄉鎮中心。這個差別會原樣輸出到
JSON 的 precision 欄位，畫面上要據此決定口徑，站址等級才可以說「登陸站」。

=== 對照 moda 清單 ===

toml 裡 link 段的 cable 欄位是海纜英文簡稱，這支會去 moda 的海纜清單頁查證那個代號
真的存在。moda 改版或纜線除役都會讓它對不上，那時候要大聲失敗，不要安靜輸出。

清單頁取不到的時候（moda 掛掉、網路不通）只警告不失敗，登陸點本身仍然輸出，
因為那部分不依賴 moda。

用法：
  python3 tools/gen_tw_landing.py [輸出路徑]
"""
import json
import os
import sys
import time
import tomllib

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(HERE, "data", "tw_landing.toml")
DEFAULT_OUT = os.path.join(ROOT, "docs", "zh-TW", "games", "tor-network", "tw-landing.json")

PRECISION = ("站址", "設施", "端點", "里", "鄉鎮")
# 台灣範圍：涵蓋本島、澎湖、金門、馬祖、蘭嶼、小琉球
LAT_RANGE = (21.5, 26.5)
LON_RANGE = (118.0, 122.5)


def load_source():
    if not os.path.exists(SRC):
        raise SystemExit(f"找不到來源檔 {SRC}")
    with open(SRC, "rb") as f:
        return tomllib.load(f)


def check_points(points):
    """每一筆都要有來源、座標要落在台灣、精度要是認得的值。"""
    seen = {}
    for i, p in enumerate(points):
        where = f"第 {i + 1} 筆（id={p.get('id', '?')}）"
        for key in ("id", "name_zh", "name_en", "admin", "lat", "lon", "precision"):
            if not p.get(key) and p.get(key) != 0:
                raise SystemExit(f"{where} 缺欄位 {key}")
        if p["id"] in seen:
            raise SystemExit(f"{where} 的 id 重複，前面第 {seen[p['id']] + 1} 筆已經用過")
        seen[p["id"]] = i
        if p["precision"] not in PRECISION:
            raise SystemExit(f"{where} 的 precision「{p['precision']}」不在 {PRECISION}")
        if not LAT_RANGE[0] <= p["lat"] <= LAT_RANGE[1]:
            raise SystemExit(f"{where} 的 lat {p['lat']} 超出台灣範圍 {LAT_RANGE}")
        if not LON_RANGE[0] <= p["lon"] <= LON_RANGE[1]:
            raise SystemExit(f"{where} 的 lon {p['lon']} 超出台灣範圍 {LON_RANGE}")
        if not p.get("sources"):
            raise SystemExit(f"{where} 沒有 sources。自建資料集的每一筆都要能查證。")
    return seen


def check_links(links, point_ids, cables):
    """link 的 points 要指得到，cable 代號要存在於 moda 清單。"""
    known = {v.get("abbr") for v in cables.values() if v.get("abbr")}
    unknown = []
    for i, ln in enumerate(links):
        where = f"link 第 {i + 1} 筆（cable={ln.get('cable', '?')}）"
        if not ln.get("cable"):
            raise SystemExit(f"{where} 缺 cable")
        if not ln.get("points"):
            raise SystemExit(f"{where} 缺 points")
        for pid in ln["points"]:
            if pid not in point_ids:
                raise SystemExit(f"{where} 指到不存在的登陸點 id「{pid}」")
        if not ln.get("sources"):
            raise SystemExit(f"{where} 沒有 sources")
        if known and ln["cable"] not in known:
            unknown.append(ln["cable"])
    if unknown:
        raise SystemExit(
            "這些代號在 moda 的海纜清單裡找不到：" + "、".join(unknown) +
            "。可能是纜線除役或 moda 改版，請對照 "
            "https://moda.gov.tw/major-policies/subseacable/1747 後修正 toml。")


def main():
    out = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT)
    t0 = time.time()

    data = load_source()
    points = data.get("point") or []
    links = data.get("link") or []
    if not points:
        raise SystemExit("toml 裡沒有任何 point")
    point_ids = check_points(points)

    # moda 的海纜清單。取不到就跳過對照，登陸點照樣輸出。
    cables = {}
    try:
        sys.path.insert(0, HERE)
        from gen_seacable_faults import fetch_cables
        cables = fetch_cables() or {}
    except SystemExit:
        raise
    except Exception as e:
        print(f"  提醒：moda 海纜清單取不到（{e}），跳過代號對照", file=sys.stderr)
    if cables:
        print(f"  moda 清單 {len(cables)} 條海纜", file=sys.stderr)
    else:
        print("  提醒：moda 清單是空的，跳過代號對照", file=sys.stderr)
    check_links(links, point_ids, cables)

    # 反查：每個登陸點掛了哪些纜線
    by_point = {}
    for ln in links:
        for pid in ln["points"]:
            by_point.setdefault(pid, []).append(ln["cable"])

    meta = data.get("meta") or {}
    payload = {
        "updated": meta.get("updated"),
        "note": meta.get("note"),
        "license": "自建資料集。OSM 來源採 ODbL，須標註 © OpenStreetMap contributors。",
        "source_url": "https://moda.gov.tw/major-policies/subseacable/1747",
        "points": [
            {
                "id": p["id"],
                "zh": p["name_zh"],
                "en": p["name_en"],
                "admin": p["admin"],
                "lat": round(float(p["lat"]), 5),
                "lon": round(float(p["lon"]), 5),
                "precision": p["precision"],
                "operator": p.get("operator", ""),
                "cables": sorted(by_point.get(p["id"], [])),
                "sources": list(p["sources"]),
            }
            for p in points
        ],
        "links": [
            {
                "cable": ln["cable"],
                "points": list(ln["points"]),
                "confidence": ln.get("confidence", ""),
                "note": ln.get("note", ""),
                "sources": list(ln["sources"]),
            }
            for ln in links
        ],
    }

    os.makedirs(os.path.dirname(out), exist_ok=True)
    tmp = out + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=1)
        f.write("\n")
    os.replace(tmp, out)

    stat = {}
    for p in payload["points"]:
        stat[p["precision"]] = stat.get(p["precision"], 0) + 1
    print(f"寫出 {out}")
    print(f"  登陸點 {len(payload['points'])} 個｜纜線對應 {len(payload['links'])} 筆"
          f"｜耗時 {time.time() - t0:.1f}s")
    print("  精度分布：" + "、".join(f"{k} {v}" for k, v in sorted(stat.items())))


if __name__ == "__main__":
    main()
