#!/usr/bin/env python3
"""產生「Tor 中繼地球儀」的靜態 snapshot.json（docs/zh-TW/games/tor-network/）。

資料來源：自架的 onionoo.anoni.net MCP（Streamable HTTP，無需驗證），它是 Onionoo 的
read-only proxy。用意是讓 clearnet/onion/IPFS 三種 build 都讀同一份靜態快照，不在瀏覽器
端打外部請求。

目前是人工執行這支腳本再把 snapshot.json commit 進 repo，沒有排程。畫面上的
「資料快照」時間就是這份檔案的產出時間，久沒重跑的話畫面看起來仍然正常，但資料是舊的。

輸出（給 atlas.js 讀）：
  { published, source, total, sampled, noPlace, byRole, topCountries, countries,
    relays: [[country, role, weight], ...] }
  role 編碼：0 中繼 / 1 guard / 2 exit / 3 guard+exit

取回策略：
  - total 與 countries 取自 aggregate_countries（伺服器端聚合，準確涵蓋全網，
    與 aggregate_flags 的 Running 相符）。
  - 逐台 relays 一次取回：帶 fields 投影時 limit 可以開到全網大小，實測 limit=20000
    兩秒就拿回全部，不必分頁。
  - 不要用 offset 分頁。實測分頁仍會漏抓（9 頁只拿到 8999/9901，少約 9%），
    一次取完就沒有這個問題（anoni-net/onionoo-fastapi#2 的 fields 與 limit 已修好，
    分頁那項還在）。
  - 仍照 fingerprint 去重，多一層保險。

用法：
  python3 tools/gen_tor_snapshot.py [輸出路徑]
  預設輸出 docs/zh-TW/games/tor-network/snapshot.json
"""
import json, os, subprocess, sys, time
from collections import Counter, defaultdict

MCP = os.environ.get("ONIONOO_MCP", "https://onionoo.anoni.net/mcp")
FULL_LIMIT = 20000  # 帶 fields 投影時可以開到全網大小，一次取完
FIELDS = "fingerprint,country,flags,consensus_weight,as,as_name,recommended_version"  # 只要畫地球用得到的欄位
AS_TOP_PER_COUNTRY = 3   # 每國留前幾大托管商
AS_TOP_GLOBAL = 15       # 全球托管商排行留幾筆
AS_NAME_MAX = 26         # 名稱截斷，避免 snapshot 被一堆公司全名撐大
# Onionoo 給的這幾種國別沒有明確位置（eu 泛指歐洲、?? 未知），country 參數也查不到，
# 地球上本來就不畫，逐台取回時直接跳過。
NO_PLACE = {"eu", "??", "xx", ""}
DEFAULT_OUT = os.path.join(os.path.dirname(__file__), "..", "docs", "zh-TW", "games", "tor-network", "snapshot.json")

_SID = None


def _curl(sid, payload, timeout="120"):
    args = ["curl", "-s", "--max-time", timeout, "--compressed", "-X", "POST", MCP,
            "-H", "Content-Type: application/json", "-H", "Accept: application/json, text/event-stream"]
    if sid:
        args += ["-H", "mcp-session-id: " + sid]
    args += ["-d", json.dumps(payload)]
    return subprocess.run(args, capture_output=True, text=True).stdout


def _parse(raw):
    for line in raw.splitlines():
        line = line.strip()
        if line.startswith("data:"):
            line = line[5:].strip()
        if line.startswith("{"):
            try:
                return json.loads(line)
            except json.JSONDecodeError:
                pass
    return None


def new_session():
    hdr = subprocess.run(
        ["curl", "-s", "--max-time", "30", "-D", "-", "-o", "/dev/null", "-X", "POST", MCP,
         "-H", "Content-Type: application/json", "-H", "Accept: application/json, text/event-stream",
         "-d", json.dumps({"jsonrpc": "2.0", "id": 1, "method": "initialize",
                           "params": {"protocolVersion": "2024-11-05", "capabilities": {},
                                      "clientInfo": {"name": "gen_tor_snapshot", "version": "2"}}})],
        capture_output=True, text=True).stdout
    sid = next((l.split(":", 1)[1].strip() for l in hdr.splitlines()
                if l.lower().startswith("mcp-session-id:")), None)
    if not sid:
        raise SystemExit("無法建立 MCP session（onionoo.anoni.net 可達嗎？）")
    _curl(sid, {"jsonrpc": "2.0", "method": "notifications/initialized"})
    return sid


def session():
    global _SID
    if not _SID:
        _SID = new_session()
    return _SID


def call(name, arguments, tries=3):
    for attempt in range(tries):
        o = _parse(_curl(session(), {"jsonrpc": "2.0", "id": 2, "method": "tools/call",
                                     "params": {"name": name, "arguments": arguments}}))
        if o and "result" in o:
            txt = o["result"]["content"][0]["text"]
            if txt.strip().startswith(("{", "[")):
                return json.loads(txt)
        if attempt < tries - 1:
            global _SID
            _SID = None  # session 可能已過期，下一輪重新握手
            time.sleep(1)
    return None


def fetch_all():
    """一次取回全網 running relay，回傳 (fingerprint → relay dict, relays_published)。"""
    d = call("get_details", {"running": True, "limit": FULL_LIMIT, "fields": FIELDS})
    if d is None:
        raise SystemExit("get_details 取回失敗")
    got = {}
    for r in d.get("relays", []):
        fp = r.get("fingerprint")
        if fp:
            got[fp] = r
    return got, d.get("relays_published")


def main():
    out = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT)
    t0 = time.time()

    # 1) 準確總數與各國中繼數（伺服器端聚合）
    agg = call("aggregate_countries", {"running": True, "top": 300})
    if not agg or "buckets" not in agg:
        raise SystemExit("aggregate_countries 取回失敗")
    buckets = sorted(agg["buckets"], key=lambda x: -x["relay_count"])
    total = sum(b["relay_count"] for b in buckets)
    countries = [[b["key"], b["relay_count"]] for b in buckets]
    top_countries = countries[:20]
    no_place = sum(n for cc, n in countries if cc in NO_PLACE)

    # 2) 逐台 relay：一次取回全網
    relays, published = fetch_all()
    want = total - no_place
    if len(relays) < want * 0.98:
        print(f"  注意：取回 {len(relays)} 台，聚合值扣掉無國別後是 {want}", file=sys.stderr)

    out_relays, rc = [], Counter()
    as_by_cc = defaultdict(Counter)   # 國家 → 各托管商台數
    as_global = Counter()             # 全球托管商台數
    as_names = {}                     # AS 代號 → 名稱
    ver_by_cc = defaultdict(lambda: [0, 0])  # 國家 → [總數, 跑官方建議版本的台數]
    for r in relays.values():
        country = (r.get("country") or "??").lower()
        if country in NO_PLACE:
            continue  # 地球上沒有位置可放，存了也畫不出來
        fl = r.get("flags") or []
        role = (2 if "Exit" in fl else 0) + (1 if "Guard" in fl else 0)
        out_relays.append([country, role, int(r.get("consensus_weight") or 0)])
        rc[role] += 1
        asn = r.get("as")
        if asn:
            as_by_cc[country][asn] += 1
            as_global[asn] += 1
            nm = (r.get("as_name") or "").strip()
            if nm and asn not in as_names:
                as_names[asn] = nm[:AS_NAME_MAX]
        ver_by_cc[country][0] += 1
        if r.get("recommended_version"):
            ver_by_cc[country][1] += 1

    # 只存聚合值。逐台把 AS 存下來會讓檔案多 43%，而畫面上用不到那個粒度。
    asn_by_cc = {
        cc: {"t": [[a, as_names.get(a, ""), n] for a, n in c.most_common(AS_TOP_PER_COUNTRY)], "n": len(c)}
        for cc, c in as_by_cc.items()
    }
    asn_top = [[a, as_names.get(a, ""), n] for a, n in as_global.most_common(AS_TOP_GLOBAL)]
    ver_total = sum(v[0] for v in ver_by_cc.values())
    ver_rec = sum(v[1] for v in ver_by_cc.values())

    snap = {
        "published": published,
        "source": "onionoo.anoni.net MCP",
        "total": total,                                 # 準確（aggregate）
        "sampled": len(out_relays),                     # 地球上實際畫出的點數
        "noPlace": no_place,                            # 沒有明確國別、地球上不畫的台數
        "byRole": {str(k): rc[k] for k in sorted(rc)},  # 逐台實際計數
        "topCountries": top_countries,
        "countries": countries,                         # 全部國家，等值區圖上色用
        "asn": asn_by_cc,                               # 各國前幾大托管商與相異家數
        "asnTop": asn_top,                              # 全球托管商排行
        "asnCount": len(as_global),                     # 全球有多少家托管商
        "version": {cc: v for cc, v in ver_by_cc.items()},  # 各國 [總數, 跑建議版本數]
        "versionAll": [ver_total, ver_rec],             # 全網 [總數, 跑建議版本數]
        "relays": out_relays,
    }
    with open(out, "w", encoding="utf-8") as f:
        json.dump(snap, f, separators=(",", ":"), ensure_ascii=False)
    covered = len(out_relays) / (total - no_place) * 100 if total > no_place else 0
    print(f"DONE → {out}（{time.time() - t0:.0f} 秒）")
    print(f"  total(aggregate)={total}  dots={len(out_relays)}  無國別={no_place}  "
          f"有國別涵蓋率={covered:.1f}%  countries={len(buckets)}  byRole={dict(rc)}")
    print(f"  托管商：全球 {len(as_global)} 家，最大 {asn_top[0][1] or asn_top[0][0]} {asn_top[0][2]} 台"
          f"｜跑建議版本 {ver_rec}/{ver_total}（{ver_rec / ver_total * 100:.1f}%）")


if __name__ == "__main__":
    main()
