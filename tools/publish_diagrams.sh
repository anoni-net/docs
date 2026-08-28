#!/usr/bin/env bash
#
# 把 docs/diagrams/ 的示意圖發布到 assets.anoni.net。
#
# 圖片檔案不進 mkdocs 的建置目錄。三個語系各有自己的 docs/<lang>/assets/images/，
# 是三份實體檔案，同一張圖要複製三次，漏掉一個語系就是一頁破圖而且建置不會報錯
# （zh-CN 的七張 drawio 圖就是這樣壞了一段時間）。改成放 assets.anoni.net 之後
# 只有一份來源，三個語系引用同一個網址。
#
# 讀者不會直接連到 assets.anoni.net。mkdocs-material 的 privacy 外掛在建置時把
# 外部資產抓成本地檔案，產物裡的 img src 是 assets/external/assets.anoni.net/...
# 的相對路徑，所以 onion 版與 IPFS 鏡像照樣是自足的，不會有讀者向 clearnet 發請求。
#
# 這也代表建置時 assets.anoni.net 必須連得到。privacy 外掛下載失敗時仍會把檔案
# 登記進 files，接著 copy_static_files 找不到檔案就丟 FileNotFoundError，整個建置
# 失敗，外掛本身沒有重試。CI 有快取 docs/.cache/plugin/privacy 擋一層，快取全新
# 或被 LRU 淘汰時那層保護不存在。詳見 .github/workflows/build_docs.yml 的註解。
#
# 順序很重要：先發布圖，確認網址回得了 200，才改 Markdown 的引用。反過來做會讓
# 下一次建置直接失敗。
#
# 用法：
#   ./tools/publish_diagrams.sh              # 檢查、上傳、驗證
#   ./tools/publish_diagrams.sh --dry-run    # 只檢查，不上傳
#   DIAGRAMS_HOST=other ./tools/publish_diagrams.sh   # 換 ssh host（預設讀 ssh config 的 m6_tailscale）

set -euo pipefail

HOST="${DIAGRAMS_HOST:-m6_tailscale}"
DEST="${DIAGRAMS_DEST:-/srv/images-anoni-net/diagrams}"
BASE_URL="${DIAGRAMS_BASE_URL:-https://assets.anoni.net/diagrams}"
DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/docs/diagrams"

say() { printf '%s\n' "$*"; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

command -v python3 >/dev/null || die "找不到 python3"
command -v curl    >/dev/null || die "找不到 curl"
[ -d "$SRC" ] || die "找不到 $SRC"

shopt -s nullglob
FILES=("$SRC"/*.svg)
[ "${#FILES[@]}" -gt 0 ] || die "$SRC 裡沒有 svg"

# 壞掉的 SVG 上傳上去，站上就是一個破圖，而且 privacy 外掛照樣會抓回來、建置照樣
# 會過，沒有任何一關會擋。最容易寫壞的是 style 區塊裡的註解夾了尖括號，那會讓
# 整份檔案不是合法的 XML。
say "== 檢查 =="
for f in "${FILES[@]}"; do
    python3 -c "import sys, xml.dom.minidom; xml.dom.minidom.parse(sys.argv[1])" "$f" \
        || die "$(basename "$f") 不是合法的 XML"
    say "   $(basename "$f")  $(stat -c%s "$f") bytes"
done

if [ "$DRY_RUN" = "1" ]; then
    say "== dry run，不上傳 =="
    exit 0
fi

say "== 上傳到 $HOST:$DEST =="
ssh "$HOST" "mkdir -p '$DEST' && chmod 775 '$DEST'" || die "建立目錄失敗"
scp -q "${FILES[@]}" "$HOST:$DEST/" || die "上傳失敗"
ssh "$HOST" "chmod 644 '$DEST'/*.svg" || die "設定權限失敗"

say "== 驗證 =="
BAD=0
for f in "${FILES[@]}"; do
    name="$(basename "$f")"
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$BASE_URL/$name")"
    if [ "$code" = "200" ]; then
        say "   200  $BASE_URL/$name"
    else
        say "   $code  $BASE_URL/$name"
        BAD=1
    fi
done
[ "$BAD" = "0" ] || die "有網址取不到，先不要改 Markdown 的引用"

# Cloudflare 那層的 max-age 是 12 小時。新檔案第一次上傳不受影響（edge 上沒有舊
# 的可以回），改同名檔案就會拿到舊版，改了配色卻看不出來通常就是這件事。
#
# 清除需要 Zone -> Cache Purge 權限的 token，跟 tools/cf_purge.py 用的是同一組。
# 沒有設就只印提醒，不當成錯誤：新增圖片是常態，那種情況本來就不用清。
if [ -n "${CF_ZONE_ID:-}" ] && [ -n "${CF_PURGE_TOKEN:-}" ]; then
    say "== 清除 Cloudflare 快取 =="
    urls="$(printf '"%s/%s",' "$BASE_URL" "$(basename "${FILES[0]}")")"
    for f in "${FILES[@]:1}"; do
        urls="$urls$(printf '"%s/%s",' "$BASE_URL" "$(basename "$f")")"
    done
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
        -H "Authorization: Bearer $CF_PURGE_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{\"files\":[${urls%,}]}" \
        | python3 -c "import json,sys; r=json.load(sys.stdin); print('   ' + ('已清除' if r.get('success') else '失敗：' + json.dumps(r.get('errors'), ensure_ascii=False)))"
else
    say "== 沒有設 CF_ZONE_ID 與 CF_PURGE_TOKEN，跳過清快取 =="
    say "   改了同名檔案的話，edge 上的舊版最多還會存在 12 小時"
fi

say ""
say "發布完成。接下來才輪到改 Markdown 的引用："
say "    https://assets.anoni.net/diagrams/<檔名>"
