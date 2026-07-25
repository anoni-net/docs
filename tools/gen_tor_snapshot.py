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

取回策略（繞開 proxy 的已知限制，見 anoni-net/onionoo-fastapi#2）：
  - total 與 countries 取自 aggregate_countries（伺服器端聚合，準確涵蓋全網，
    與 aggregate_flags 的 Running 相符）。
  - 逐台 relays 改成「按國家分頁」而不是全域 offset 分頁。全域分頁會漏抓約 15%
    （實測 8199／9696），按國家分頁誤差在 ±0.5% 以內（時間差造成，非分頁漏抓）。
  - fields 單獨帶會 500，搭配 raw=true 就正常，payload 因此小很多（一國一頁約 1 秒）。
  - limit 上限仍是 200，所以大國要多頁；跨國家用執行緒平行取回。
  - fingerprint 去重，避免分頁邊界重複。

用法：
  python3 tools/gen_tor_snapshot.py [輸出路徑]
  預設輸出 docs/zh-TW/games/tor-network/snapshot.json
"""
import json, os, subprocess, sys, threading, time
from collections import Counter
from concurrent.futures import ThreadPoolExecutor

MCP = os.environ.get("ONIONOO_MCP", "https://onionoo.anoni.net/mcp")
PAGE_LIMIT = 200  # proxy 上限 200，帶更大的值會被 input validation 擋下
FIELDS = "fingerprint,country,flags,consensus_weight"  # 只要畫地球用得到的欄位
WORKERS = int(os.environ.get("SNAPSHOT_WORKERS", "4"))
# Onionoo 給的這幾種國別沒有明確位置（eu 泛指歐洲、?? 未知），country 參數也查不到，
# 地球上本來就不畫，逐台取回時直接跳過。
NO_PLACE = {"eu", "??", "xx", ""}
DEFAULT_OUT = os.path.join(os.path.dirname(__file__), "..", "docs", "zh-TW", "games", "tor-network", "snapshot.json")

_local = threading.local()


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
    """每個執行緒各自持有一個 MCP session，避免共用時互相干擾。"""
    if not getattr(_local, "sid", None):
        _local.sid = new_session()
    return _local.sid


def call(name, arguments, tries=3):
    for attempt in range(tries):
        o = _parse(_curl(session(), {"jsonrpc": "2.0", "id": 2, "method": "tools/call",
                                     "params": {"name": name, "arguments": arguments}}))
        if o and "result" in o:
            txt = o["result"]["content"][0]["text"]
            if txt.strip().startswith(("{", "[")):
                return json.loads(txt)
        if attempt < tries - 1:
            _local.sid = None  # session 可能已過期，下一輪重新握手
            time.sleep(1)
    return None


def fetch_country(cc, expect):
    """抓單一國家的全部 running relay，回傳 (fingerprint → relay dict, relays_published)。"""
    got, published, off = {}, None, 0
    cap = expect + PAGE_LIMIT * 2  # 上限保護，避免 proxy 異常時無限翻頁
    while off < cap:
        d = call("get_details", {"running": True, "country": cc, "limit": PAGE_LIMIT,
                                 "offset": off, "fields": FIELDS, "raw": True})
        if d is None:
            print(f"  {cc} offset {off} 取回失敗，該國停在 {len(got)}／{expect}", file=sys.stderr)
            break
        page = d.get("relays", [])
        published = published or d.get("relays_published")
        for r in page:
            fp = r.get("fingerprint")
            if fp:
                got[fp] = r
        if len(page) < PAGE_LIMIT:
            break
        off += PAGE_LIMIT
    return got, published


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

    # 2) 逐台 relay：按國家平行分頁取回
    targets = [(cc, n) for cc, n in countries if cc not in NO_PLACE]
    relays, published = {}, None
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        for (cc, expect), (got, pub) in zip(targets, pool.map(lambda t: fetch_country(*t), targets)):
            relays.update(got)
            published = published or pub
            if abs(len(got) - expect) > max(5, expect * 0.02):
                print(f"  注意：{cc} 取回 {len(got)}，聚合值 {expect}", file=sys.stderr)

    out_relays, rc = [], Counter()
    for r in relays.values():
        country = (r.get("country") or "??").lower()
        fl = r.get("flags") or []
        role = (2 if "Exit" in fl else 0) + (1 if "Guard" in fl else 0)
        out_relays.append([country, role, int(r.get("consensus_weight") or 0)])
        rc[role] += 1

    snap = {
        "published": published,
        "source": "onionoo.anoni.net MCP",
        "total": total,                                 # 準確（aggregate）
        "sampled": len(out_relays),                     # 地球上實際畫出的點數
        "noPlace": no_place,                            # 沒有明確國別、地球上不畫的台數
        "byRole": {str(k): rc[k] for k in sorted(rc)},  # 逐台實際計數
        "topCountries": top_countries,
        "countries": countries,                         # 全部國家，等值區圖上色用
        "relays": out_relays,
    }
    with open(out, "w", encoding="utf-8") as f:
        json.dump(snap, f, separators=(",", ":"), ensure_ascii=False)
    covered = len(out_relays) / (total - no_place) * 100 if total > no_place else 0
    print(f"DONE → {out}（{time.time() - t0:.0f} 秒）")
    print(f"  total(aggregate)={total}  dots={len(out_relays)}  無國別={no_place}  "
          f"有國別涵蓋率={covered:.1f}%  countries={len(buckets)}  byRole={dict(rc)}")


if __name__ == "__main__":
    main()
