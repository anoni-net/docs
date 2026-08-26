#!/usr/bin/env bash
set -eu

# ~/.ssh/config 中的 Host alias，可用環境變數覆蓋
IPFS_SSH_ALIAS="${IPFS_SSH_ALIAS:-ipfs-node}"
IPFS_API="--api /ip4/127.0.0.1/tcp/5001"
# IPNS 位址（來自 replace_sitename_anoni_ipfs.sh）
# 需要重新匯入 `docker exec -i ipfs_host ipfs key import anoni-net /data/ipfs/keystore/key_mfxg63tjfvsg6y3t`
IPFS_IPNS_ADDR="k51qzi5uqu5dlfm2jj0f70ex3r3babmwy8qh071inwknttr7wqa3uhdwvlmrmw"
# 公開入口。由 build_docs_anoni_ipfs.sh export 進來，單獨執行時走 fallback。
IPFS_GATEWAY="${IPFS_GATEWAY:-https://ipfs.anoni.net}"
TUNNEL_PID=""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
    if [ -n "$TUNNEL_PID" ] && kill -0 "$TUNNEL_PID" 2>/dev/null; then
        echo "[upload] 關閉 SSH tunnel (PID $TUNNEL_PID)"
        kill "$TUNNEL_PID" 2>/dev/null || true
    fi
}
trap cleanup EXIT INT TERM

echo "[upload] 建立 SSH tunnel → $IPFS_SSH_ALIAS:5001"
# 若本地 5001 已有 tunnel（前一次未清掉），直接重用
if ss -tlnp 2>/dev/null | grep -q ':5001 ' || netstat -tlnp 2>/dev/null | grep -q ':5001 '; then
    echo "[upload] 本地 5001 已在監聽，跳過建立 tunnel"
    TUNNEL_PID=""
else
    ssh -f -N \
        -o ConnectTimeout=10 \
        -o ExitOnForwardFailure=yes \
        -L 5001:127.0.0.1:5001 \
        "$IPFS_SSH_ALIAS"
    TUNNEL_PID=$(pgrep -n -f "ssh -f -N" || true)
fi

echo "[upload] 等待 API 就緒..."
for i in $(seq 1 30); do
    if curl -sf -X POST http://127.0.0.1:5001/api/v0/id > /dev/null; then
        echo "[upload] API 就緒"
        break
    fi
    if [ "$i" -eq 30 ]; then
        echo "[upload] 錯誤：API 30 秒內未就緒，請確認 SSH tunnel 與節點狀態" >&2
        exit 1
    fi
    sleep 1
done

echo "[upload] 解析舊 CID..."
OLD_CID=$(ipfs $IPFS_API name resolve "/ipns/$IPFS_IPNS_ADDR" 2>/dev/null || echo "")
if [ -n "$OLD_CID" ]; then
    echo "[upload] 舊 CID: $OLD_CID"
else
    echo "[upload] 尚無舊版本（首次發布）"
fi

echo "[upload] 上傳 $SCRIPT_DIR/anoni-net-docs-ipfs/ ..."
NEW_CID=$(ipfs $IPFS_API add -r --cid-version=1 --quieter "$SCRIPT_DIR/anoni-net-docs-ipfs/")
echo "[upload] 新 CID: $NEW_CID"

echo "[upload] 發布 IPNS ([anoni-net] key)..."
# --lifetime=720h：DHT 上的 IPNS record 30 天內有效，避免 gateway 解析時找不到（預設 24h 對非每日 deploy 太短）
# --ttl=1m：客戶端/閘道 cache IPNS 解析結果 1 分鐘，縮短發布後換新版的空窗。
#          這個註解原本寫「配合節點已開的 Routing.AcceleratedDHTClient，重新解析很便宜」，
#          那個前提不成立：ipfs_host 上 Routing.AcceleratedDHTClient 實際是 false。
#          不過 2026-08-26 實測 `ipfs name resolve --nocache` 是 0.27 到 0.42 秒，
#          解析本身不慢，ttl 壓低沒有問題。真正被這個 ttl 影響的是下面 GC 的時機。
ipfs $IPFS_API name publish \
    --key=anoni-net \
    --lifetime=720h \
    --ttl=1m \
    "/ipfs/$NEW_CID"

# 主動把新 CID 宣告到 DHT（root 即可，閘道連上本節點後會用 bitswap 抓其餘區塊）。
# 非致命，失敗不中斷發布。節點沒有開 Routing.AcceleratedDHTClient，
# provide 會比開了慢，內容照樣宣告得出去，只是別預期它是瞬間完成。
echo "[upload] provide 新 CID 到 DHT..."
ipfs $IPFS_API routing provide "$NEW_CID" || echo "[upload] provide 非致命失敗，繼續"

# Pre-warm 公開閘道：先抓一次，逼閘道解析並把內容收進邊緣快取，縮短第一個訪客的等待。
# 兩類目標：用新 CID 直接暖內容，以及用 DNSLink 網址觸發重新解析。全部非致命。
# dweb.link 與 ipfs.io 由 Shipyard 營運到 2026-09-30 為止
# （https://ipshipyard.com/blog/2026-the-end-of-ipfs-at-shipyard/），之後這幾行會開始
# 印 warm 失敗。清單用 IPFS_PREWARM_URLS 覆蓋（空白分隔），或直接刪掉停掉的那幾個。
PREWARM_URLS="${IPFS_PREWARM_URLS:-https://dweb.link/ipfs/$NEW_CID/ https://ipfs.io/ipfs/$NEW_CID/ $IPFS_GATEWAY/}"
echo "[upload] Pre-warm 公開閘道..."
for gw in $PREWARM_URLS; do
    if curl -fsS -o /dev/null --max-time 60 "$gw"; then
        echo "[upload]   warmed: $gw"
    else
        echo "[upload]   warm 失敗（略過）: $gw"
    fi
done

if [ -n "$OLD_CID" ]; then
    OLD_HASH="${OLD_CID#/ipfs/}"
    if [ "$OLD_HASH" = "$NEW_CID" ]; then
        # 內容未變時 add 出的 CID 會與舊版相同，這時 unpin + 後續 repo gc 會把剛發布的內容刪掉。
        echo "[upload] 內容未變（CID 與舊版相同 $NEW_CID），跳過 unpin 以免移除剛發布的內容"
    else
        # 舊版本要等 IPNS 的 ttl 過去才能刪。閘道在 ttl 內仍然把 DNSLink 解析成舊 CID，
        # 這時候舊 CID 的區塊已經被 unpin 加 GC 掉，閘道只好轉去網路上找一份沒有人
        # 提供的內容，最後逾時。2026-08-26 那次發布之後，連續兩次請求回 504，第三次
        # 才 200，就是這個窗口。nginx 的錯誤日誌沒有 upstream timeout，504 是 kubo 自己回的。
        #
        # 等待長度用 IPFS_GC_GRACE 覆蓋（秒），設 0 可以完全跳過。預設 90 秒是
        # 上面 --ttl=1m 再加一點緩衝。
        GC_GRACE="${IPFS_GC_GRACE:-90}"
        if [ "$GC_GRACE" -gt 0 ]; then
            echo "[upload] 等 ${GC_GRACE}s 讓閘道的 IPNS 快取過期，再移除舊版本..."
            sleep "$GC_GRACE"
        fi
        echo "[upload] Unpin 舊版本: $OLD_HASH"
        ipfs $IPFS_API pin rm "$OLD_HASH" 2>/dev/null || echo "[upload] Unpin 失敗（可能已移除），繼續"
    fi
fi

# GC 維持無條件執行。沒有 unpin 任何東西時（首次發布，或內容未變 CID 相同）它也沒有
# 東西可刪，跑一次不影響剛發布的內容。
echo "[upload] 執行 repo GC..."
ipfs $IPFS_API repo gc

echo "[upload] 完成。"
echo "[upload] IPNS 名稱: /ipns/$IPFS_IPNS_ADDR"
echo "[upload] 公開入口: $IPFS_GATEWAY/"
echo "[upload] DNSLink: _dnslink.anoni.net 指向同一個 IPNS 名稱，換 gateway 只要換主機名"
