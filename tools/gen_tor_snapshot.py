#!/usr/bin/env python3
"""產生「Tor 中繼地球儀」的靜態 snapshot.json（docs/zh-TW/games/tor-network/）。

資料來源：自架的 onionoo.anoni.net MCP（Streamable HTTP，無需驗證），它是 Onionoo 的
read-only proxy。用意是讓 clearnet/onion/IPFS 三種 build 都讀同一份靜態快照，不在瀏覽器
端打外部請求。適合排程（cron）每小時重生成。

輸出（給 atlas.js 讀）：
  { published, source, total, byRole, topCountries, relays: [[country, role, weight], ...] }
  role 編碼：0 中繼 / 1 guard / 2 exit / 3 guard+exit

準確度策略：
  - total 與 topCountries 取自 aggregate_countries（伺服器端聚合，準確涵蓋全網）。
  - 逐台 relays（地球上的點）取自 get_details 分頁。
    ※ 已知該 proxy 的 get_details 有 fields 500 / limit 上限 200 / offset 分頁漏抓
      （anoni-net/onionoo-fastapi#2）。修好後把 PAGE_LIMIT 拉大或改全量即可。

用法：
  python3 tools/gen_tor_snapshot.py [輸出路徑]
  預設輸出 docs/zh-TW/games/tor-network/snapshot.json
"""
import json, subprocess, sys, time, os
from collections import Counter

MCP = os.environ.get("ONIONOO_MCP", "https://onionoo.anoni.net/mcp")
PAGE_LIMIT = 200  # proxy 目前上限 200；修好後可調大
DEFAULT_OUT = os.path.join(os.path.dirname(__file__), "..", "docs", "zh-TW", "games", "tor-network", "snapshot.json")


def _curl(args, timeout="90"):
    base = ["curl", "-s", "--max-time", timeout, "--compressed", "-X", "POST", MCP,
            "-H", "Content-Type: application/json", "-H", "Accept: application/json, text/event-stream"]
    return subprocess.run(base + args, capture_output=True, text=True).stdout


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


def session():
    hdr = subprocess.run(
        ["curl", "-s", "--max-time", "30", "-D", "-", "-o", "/dev/null", "-X", "POST", MCP,
         "-H", "Content-Type: application/json", "-H", "Accept: application/json, text/event-stream",
         "-d", json.dumps({"jsonrpc": "2.0", "id": 1, "method": "initialize",
                           "params": {"protocolVersion": "2024-11-05", "capabilities": {},
                                      "clientInfo": {"name": "gen_tor_snapshot", "version": "1"}}})],
        capture_output=True, text=True).stdout
    sid = next((l.split(":", 1)[1].strip() for l in hdr.splitlines()
                if l.lower().startswith("mcp-session-id:")), None)
    if not sid:
        raise SystemExit("無法建立 MCP session（onionoo.anoni.net 可達嗎？）")
    _curl(["-H", "mcp-session-id: " + sid, "-d", json.dumps({"jsonrpc": "2.0", "method": "notifications/initialized"})])
    return sid


def call(sid, name, arguments, tries=2):
    for _ in range(tries):
        raw = _curl(["-H", "mcp-session-id: " + sid,
                     "-d", json.dumps({"jsonrpc": "2.0", "id": 2, "method": "tools/call",
                                       "params": {"name": name, "arguments": arguments}})])
        o = _parse(raw)
        if o and "result" in o:
            txt = o["result"]["content"][0]["text"]
            if txt.strip().startswith(("{", "[")):
                return json.loads(txt)
        time.sleep(1)
    return None


def main():
    out = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT)
    sid = session()

    # 1) 準確總數與國家排名（伺服器端聚合）
    agg = call(sid, "aggregate_countries", {"running": True, "top": 300})
    buckets = agg["buckets"] if agg else []
    total = sum(b["relay_count"] for b in buckets)
    top_countries = [[b["key"], b["relay_count"]] for b in sorted(buckets, key=lambda x: -x["relay_count"])[:20]]

    # 2) 逐台 relay（地球上的點），分頁取 details
    relays, published, off = [], None, 0
    while off < 20000:
        d = call(sid, "get_details", {"running": True, "limit": PAGE_LIMIT, "offset": off})
        if d is None:
            print(f"  offset {off} 失敗，停在此（已 {len(relays)} 筆）", file=sys.stderr)
            break
        page = d.get("relays", [])
        published = published or d.get("relays_published")
        relays += page
        if len(page) < PAGE_LIMIT:
            break
        off += PAGE_LIMIT

    out_relays, rc = [], Counter()
    for r in relays:
        country = (r.get("country") or "xx").lower()
        fl = r.get("flags") or []
        role = (2 if "Exit" in fl else 0) + (1 if "Guard" in fl else 0)
        out_relays.append([country, role, int(r.get("consensus_weight") or 0)])
        rc[role] += 1

    # byRole 依樣本比例推估到準確總數，讓角色分布與 total 一致（dots 補齊後 scale≈1，即精確值）
    grand = total or len(out_relays)
    scale = (grand / len(out_relays)) if out_relays else 1
    by_role = {str(k): round(rc[k] * scale) for k in sorted(rc)}
    snap = {
        "published": published,
        "source": "onionoo.anoni.net MCP",
        "total": grand,                               # 準確（aggregate）
        "sampled": len(out_relays),                   # 目前地球上實際畫出的點數
        "byRole": by_role,                            # 依樣本比例推估到 total
        "topCountries": top_countries,                # 準確（aggregate）
        "relays": out_relays,
    }
    with open(out, "w", encoding="utf-8") as f:
        json.dump(snap, f, separators=(",", ":"), ensure_ascii=False)
    print(f"DONE → {out}")
    print(f"  total(aggregate)={snap['total']}  sampled(dots)={snap['sampled']}  countries={len(buckets)}  byRole={dict(rc)}")


if __name__ == "__main__":
    main()
