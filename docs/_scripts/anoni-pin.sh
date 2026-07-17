#!/usr/bin/env bash
#
# anoni-pin.sh — pin the latest IPFS mirror of the anoni.net docs site.
#
# Usage:
#   ./anoni-pin.sh          # uses the local `ipfs`
# Run it on a schedule (cron) every 6 hours or so. See the docs for setup.
#
# Docker users: route ipfs commands through the container
#   export IPFS_CMD="docker exec ipfs_host ipfs"
#
# Design: pin the new version first, only then unpin the old one. If resolving
# or fetching fails, keep the copy you already have — never leave the node empty.
#
set -eu

# The docs site's IPNS name (public value, same as DNSLink _dnslink.anoni.net)
IPNS="k51qzi5uqu5dlfm2jj0f70ex3r3babmwy8qh071inwknttr7wqa3uhdwvlmrmw"

# Override the ipfs command via IPFS_CMD (see the Docker note above)
IPFS="${IPFS_CMD:-ipfs}"

# Remembers the last CID we pinned, so we can unpin it next time
STATE="${ANONI_PIN_STATE:-${HOME}/.anoni-pin/last_cid}"
mkdir -p "$(dirname "$STATE")"

# 1. Resolve the IPNS name to the current CID (--nocache forces a fresh lookup)
NEW="$($IPFS name resolve --nocache "/ipns/$IPNS" 2>/dev/null || true)"
if [ -z "$NEW" ]; then
    echo "[anoni-pin] resolve failed (network or node issue), keeping current state"
    exit 0
fi

OLD="$(cat "$STATE" 2>/dev/null || true)"
if [ "$NEW" = "$OLD" ]; then
    echo "[anoni-pin] already on the latest version $NEW, nothing to do"
    exit 0
fi

# 2. Pin the new version first (fetches the whole thing). With set -e, a failure
#    here aborts the script before we unpin anything.
echo "[anoni-pin] pinning new version: $NEW"
$IPFS pin add "$NEW"

# 3. Record state, unpin the old version, reclaim space
echo "$NEW" > "$STATE"
if [ -n "$OLD" ] && [ "$OLD" != "$NEW" ]; then
    echo "[anoni-pin] unpinning old version: $OLD"
    $IPFS pin rm "$OLD" || true
fi
$IPFS repo gc >/dev/null 2>&1 || true
echo "[anoni-pin] done, now pinning $NEW"
