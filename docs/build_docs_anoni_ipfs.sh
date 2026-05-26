#!/usr/bin/env bash
# 建置 anoni.net docs 的 IPFS 鏡像版本（zh-TW / en / zh-CN）並 publish 到 IPNS
#
# Usage:
#   ./build_docs_anoni_ipfs.sh              # build + upload + publish IPNS
#   ./build_docs_anoni_ipfs.sh --no-upload  # 只 build 不 upload，產物在 ./anoni-net-docs-ipfs/
#
# 流程：
#   1. 確認 working tree clean（避免 replace_sitename in-place 改動污染未提交修改）
#   2. 設 trap，任何狀況退出都 git restore 還原 source
#   3. 跑 replace_sitename_anoni_ipfs.sh 把 source URL 改成 IPFS URL（in-place）
#   4. mkdocs build 三語 + 主站，產物匯到 ./anoni-net-docs-ipfs/
#   5. sanity check 確認鏡像內無殘留 https://anoni.net/docs URL
#   6. (預設) 跑 upload_to_ipfs.sh 上傳 + publish IPNS

set -euo pipefail

# macOS 本地建置前置：
# - gnu-sed：BSD sed 不接受 `sed -i 's|x|y|g'` 格式
# - DYLD_FALLBACK_LIBRARY_PATH：cairosvg 需 libcairo.2.dylib，SIP 會 strip 子 sh 的 DYLD_*
#   因此 macOS 改用 sourced subshell `(. ./xxx.sh)` 而非 `sh ./xxx.sh`，避免再 fork 一層子 shell
# - .venv/bin：sourced subshell 不會帶外層的 venv 啟用狀態，靠 PATH 補進來
if [ "$(uname)" = "Darwin" ]; then
  if [ -d /opt/homebrew/opt/gnu-sed/libexec/gnubin ]; then
    PATH="/opt/homebrew/opt/gnu-sed/libexec/gnubin:$PATH"
    export PATH
  else
    echo "[build] macOS 缺 gnu-sed，請先 \`brew install gnu-sed\`" >&2
    exit 1
  fi
  if [ -d /opt/homebrew/lib ]; then
    DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib
    export DYLD_FALLBACK_LIBRARY_PATH
  fi
  if [ -x ./.venv/bin/mkdocs ]; then
    PATH="$PWD/.venv/bin:$PATH"
    export PATH
  fi
  RUN() { ( . "./$1" ); }
else
  RUN() { sh "./$1"; }
fi

# 跑前確認 working tree clean：replace_sitename_anoni_ipfs.sh 會 in-place 修改 source，
# 跟使用者 uncommitted 變動混在一起會導致 git restore 階段丟失工作
if ! git diff --quiet; then
  echo "[build] ERROR: working tree dirty，請先 commit 或 stash 後再跑" >&2
  echo "[build] dirty files (前 10 個)：" >&2
  git diff --name-only | head -10 | sed 's/^/  /' >&2
  exit 1
fi

# 任何狀況（正常結束、中途失敗、Ctrl-C）都還原 source
# 避免 replace_sitename_anoni_ipfs.sh 的 in-place 修改殘留在 working tree
cleanup_source() {
  rc=$?
  echo "[build] 還原 source（清除 replace 留下的 in-place 修改）"
  git restore . 2>/dev/null || true
  exit $rc
}
trap cleanup_source EXIT

rm -rf ./output/*
RUN replace_sitename_anoni_ipfs.sh
RUN run.sh
RUN run_en.sh
RUN run_zh-tw.sh
RUN run_zh-cn.sh
mkdir -p ./anoni-net-docs-ipfs
rm -rf ./anoni-net-docs-ipfs/*
cp -r ./output/* ./anoni-net-docs-ipfs/

# Sanity check：IPFS 鏡像內不該還有主站 URL
echo "[build] sanity check：確認 IPFS 鏡像內無殘留 https://anoni.net/docs URL"
if grep -r "https://anoni.net/docs" ./anoni-net-docs-ipfs/ >/dev/null 2>&1; then
  echo "[build] ERROR: replace_sitename_anoni_ipfs.sh 沒跑完整，仍有 https://anoni.net/docs 出現於：" >&2
  grep -rl "https://anoni.net/docs" ./anoni-net-docs-ipfs/ | head -5 | sed 's/^/  /' >&2
  exit 1
fi

if [ "${1:-}" != "--no-upload" ]; then
  sh ./upload_to_ipfs.sh
fi
