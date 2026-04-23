#!/usr/bin/env bash
set -eu

# ~/.ssh/config 中的 Host alias，可用環境變數覆蓋
IPFS_SSH_ALIAS="${IPFS_SSH_ALIAS:-ipfs-node}"
IPFS_API="--api /ip4/127.0.0.1/tcp/5001"
# IPNS 位址（來自 replace_sitename_anoni_ipfs.sh）
# 需要重新匯入 `docker exec -i ipfs_host ipfs key import anoni-net /data/ipfs/keystore/key_mfxg63tjfvsg6y3t`
IPFS_IPNS_ADDR="k51qzi5uqu5dlfm2jj0f70ex3r3babmwy8qh071inwknttr7wqa3uhdwvlmrmw"
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
ipfs $IPFS_API name publish --key=anoni-net "/ipfs/$NEW_CID"

if [ -n "$OLD_CID" ]; then
    OLD_HASH="${OLD_CID#/ipfs/}"
    echo "[upload] Unpin 舊版本: $OLD_HASH"
    ipfs $IPFS_API pin rm "$OLD_HASH" 2>/dev/null || echo "[upload] Unpin 失敗（可能已移除），繼續"
fi

echo "[upload] 執行 repo GC..."
ipfs $IPFS_API repo gc

echo "[upload] 完成。"
echo "[upload] IPNS: https://ipfs.io/ipns/$IPFS_IPNS_ADDR"
