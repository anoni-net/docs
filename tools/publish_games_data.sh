#!/usr/bin/env bash
#
# 在正式機上重生地球儀的兩份會變動的資料，檢查過內容之後才發布到 assets。
#
#   snapshot.json  Onionoo 中繼快照，每小時都在變，是最需要定期重生的一份
#   torusers.json  Tor Metrics 的使用者數與橋接數，每日更新
#
# 另外五份（countries、continents、cables、ooni、shutdowns）變動以季或年計，
# 跟著文件站一起發布就好，不在這支腳本的範圍內。
#
# 相依只有 python3 與 curl，兩支產生腳本都只用標準庫，正式機不需要 venv。
#
# 用法：
#   ./tools/publish_games_data.sh              # 產生、檢查、發布
#   ./tools/publish_games_data.sh --dry-run    # 產生並檢查，不發布
#   DEST=/tmp/x ./tools/publish_games_data.sh  # 換發布目錄
#
# 發布是先寫到目標目錄的暫存檔再 mv。同一顆檔案系統上的 mv 是原子操作，
# 讀取端不會拿到寫到一半的 JSON。直接 cp 過去就會有這個空窗。

set -euo pipefail

DEST="${DEST:-/srv/images-anoni-net/games}"
BASE_URL="${BASE_URL:-https://assets.anoni.net/games/}"
DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

say() { printf '%s\n' "$*"; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

command -v python3 >/dev/null || die "找不到 python3"
command -v curl    >/dev/null || die "找不到 curl"

# 產生到暫存目錄而不是 repo 底下。跑壞了不會弄髒工作區，也不會有人不小心把
# 半成品 commit 進去。
say "== 產生 =="
python3 "$ROOT/tools/gen_tor_snapshot.py"      "$WORK/snapshot.json" >/dev/null || die "snapshot 產生失敗（onionoo.anoni.net 可達嗎）"
python3 "$ROOT/tools/gen_torusers_snapshot.py" "$WORK/torusers.json" >/dev/null || die "torusers 產生失敗（metrics.torproject.org 可達嗎）"
say "   snapshot.json  $(stat -c%s "$WORK/snapshot.json") bytes"
say "   torusers.json  $(stat -c%s "$WORK/torusers.json") bytes"

# 上游掛掉或改格式時，產生腳本有可能寫出一份語法正確但內容是空的檔案。
# 沒有這關的話，某天 Onionoo 出問題就會把線上的地球儀變成一顆空球，而且
# 因為舊檔已經被蓋掉，回不去。門檻抓得寬鬆，只擋明顯壞掉的情況。
say "== 檢查 =="
python3 - "$WORK/snapshot.json" "$WORK/torusers.json" <<'PY' || die "內容檢查沒過，不發布，線上維持舊版"
import json, sys

snap_p, users_p = sys.argv[1], sys.argv[2]
bad = []

try:
    s = json.load(open(snap_p, encoding="utf-8"))
except Exception as e:
    bad.append(f"snapshot.json 不是合法 JSON：{e}")
else:
    total = s.get("total", 0)
    relays = s.get("relays") or []
    countries = s.get("countries") or []
    if total < 5000:
        bad.append(f"中繼總數 {total} 低於 5000，全網長期在九千上下，這個數字代表取回不完整")
    if len(relays) < 5000:
        bad.append(f"逐台資料只有 {len(relays)} 筆")
    if len(countries) < 40:
        bad.append(f"只涵蓋 {len(countries)} 個國家，平常在 80 上下")
    if not s.get("published"):
        bad.append("缺 published 欄位")
    if not s.get("license"):
        bad.append("缺 license 欄位，NOTICE 承諾每份資料都帶授權")
    print(f"   snapshot  {total} 台、{len(countries)} 國、published {s.get('published')}")

try:
    u = json.load(open(users_p, encoding="utf-8"))
except Exception as e:
    bad.append(f"torusers.json 不是合法 JSON：{e}")
else:
    if not u.get("usersAll"):
        bad.append("缺 usersAll")
    if len(u.get("users") or {}) < 40:
        bad.append(f"使用者資料只涵蓋 {len(u.get('users') or {})} 國")
    if not u.get("license"):
        bad.append("缺 license 欄位")
    print(f"   torusers  {u.get('usersAll')} 人、{len(u.get('users') or {})} 國、date {u.get('date')}")

if bad:
    for b in bad:
        print("   不通過：" + b)
    sys.exit(1)
print("   通過")
PY

if [ "$DRY_RUN" = "1" ]; then
    say "== dry-run，不發布 =="
    say "   產物留在 $WORK（腳本結束後會清掉）"
    exit 0
fi

say "== 發布到 $DEST =="
[ -d "$DEST" ] || die "$DEST 不存在，請先建好目錄（mkdir -p $DEST）"
[ -w "$DEST" ] || die "$DEST 不可寫，請確認執行者的權限"

for f in snapshot.json torusers.json; do
    # 留一份上一版。發布之後才發現有問題時，把 .prev 換回來就好，
    # 不必等下一次重生，也不必回去翻 git。
    [ -f "$DEST/$f" ] && cp -p "$DEST/$f" "$DEST/$f.prev"
    cp "$WORK/$f" "$DEST/$f.tmp"
    chmod 644 "$DEST/$f.tmp"
    mv -f "$DEST/$f.tmp" "$DEST/$f"   # 同檔案系統的 mv 是原子操作
    say "   $f  →  ${BASE_URL}$f"
done

say "== 完成 =="
say "   線上驗證：curl -sI ${BASE_URL}snapshot.json"
say "   要回上一版：cd $DEST && mv snapshot.json.prev snapshot.json"
