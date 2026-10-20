#!/usr/bin/env bash
# 在本機建置 anoni.net docs 的 IPFS 版本（zh-TW / en / zh-CN），產物在 ./anoni-net-docs-ipfs/
#
# Usage:
#   ./build_docs_anoni_ipfs.sh
#   IPFS_GATEWAY=https://ipfs.example.net ./build_docs_anoni_ipfs.sh  # 換頁尾連結的公開入口
#
# 2026-10 起 IPFS 鏡像是 anoni.net 整站，文件站放在鏡像的 /docs/，組裝、上傳與發布 IPNS 由
# anoni-net/ipfs-mirror 在 m6 上進行（toomore/anoni-net-ws#422）。正式的產物由 build_docs.yml
# 的 ipfs 那一格建置，這支給本機預覽與除錯用，不上傳。
#
# 流程：
#   1. 確認 working tree clean（避免 replace_sitename in-place 改動污染未提交修改）
#   2. 設 trap，任何狀況退出都 git restore 還原 source
#   3. 跑 replace_sitename_anoni_ipfs.sh 拿掉流量統計（in-place）
#   4. mkdocs build 三語（zh-TW 建在根路徑，en 與 zh-CN 各自語系區段），結構跟 clearnet 相同
#   5. tools/ipfs_links.py 改寫 <body> 的連結並檢查，產物匯到 ./anoni-net-docs-ipfs/

set -euo pipefail

# IPFS 鏡像的公開入口，mkdocs*.yml 的 extra.ipfs_gateway 用它產生頁尾與頁首的連結。
# 鏡像的內部連結是網站根目錄的相對路徑，換 gateway 不必重建鏡像。
export IPFS_GATEWAY="${IPFS_GATEWAY:-https://ipfs.anoni.net}"

# 頁首的版本小標記與 IPFS 版專屬的橫幅讀這個值。
export BUILD_VARIANT=ipfs

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
# 避免 replace_sitename_anoni_ipfs.sh 的 in-place 修改殘留在 working tree。
# 用 :/（整個 repo）而非 .（僅 docs/），因為 replace 也會改寫 repo 根的 snippet 正本
# （如 ../BECOME_ANONI.md）。開頭的 git diff --quiet 已檢查整個 repo，還原範圍對齊它才安全。
cleanup_source() {
  rc=$?
  echo "[build] 還原 source（清除 replace 留下的 in-place 修改）"
  git restore :/ 2>/dev/null || true
  exit $rc
}
trap cleanup_source EXIT

rm -rf ./output/*
# 清掉 privacy plugin 快取，避免外部資源（如 vega-embed）換 URL 形狀後殘留舊鏡像 symlink 害圖表不 render
rm -rf .cache/plugin/privacy
RUN replace_sitename_anoni_ipfs.sh
RUN run.sh
RUN run_en.sh
RUN run_zh-cn.sh
mkdir -p ./anoni-net-docs-ipfs
rm -rf ./anoni-net-docs-ipfs/*
# service worker 只在 clearnet 註冊（overrides/base.html 的 hostname 白名單），
# onion 與 IPFS 版不會用到，且這裡沒有做 __BUILD_VERSION__ 替換。
# 留著是永遠不會執行的死檔案，會誤導後人，部署前移除。
find ./output -name "sw.js" -delete
python3 ../tools/ipfs_links.py ./output
cp -r ./output/* ./anoni-net-docs-ipfs/
echo "[build] 產物在 ./anoni-net-docs-ipfs/，在鏡像裡放在 /docs/"
