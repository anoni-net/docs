#!/usr/bin/env bash
# 建置 anoni.net docs 的 IPFS 鏡像版本（zh-TW / en / zh-CN）並 publish 到 IPNS
#
# Usage:
#   ./build_docs_anoni_ipfs.sh              # build + upload + publish IPNS
#   ./build_docs_anoni_ipfs.sh --no-upload  # 只 build 不 upload，產物在 ./anoni-net-docs-ipfs/
#   IPFS_GATEWAY=https://ipfs.example.net ./build_docs_anoni_ipfs.sh  # 換公開入口
#
# 流程：
#   1. 確認 working tree clean（避免 replace_sitename in-place 改動污染未提交修改）
#   2. 設 trap，任何狀況退出都 git restore 還原 source
#   3. 跑 replace_sitename_anoni_ipfs.sh 把 source URL 改成 IPFS URL（in-place）
#   4. mkdocs build 三語（zh-TW 建在根路徑，en 與 zh-CN 各自語系區段），產物匯到 ./anoni-net-docs-ipfs/
#   5. sanity check 確認鏡像內無殘留 https://anoni.net/docs URL
#   6. (預設) 跑 upload_to_ipfs.sh 上傳 + publish IPNS

set -euo pipefail

# IPFS 鏡像的公開入口，一個值餵三個地方：replace_sitename_anoni_ipfs.sh 用它改寫
# site_url，mkdocs*.yml 的 extra.ipfs_gateway 用它產生頁尾連結，upload_to_ipfs.sh
# 用它 pre-warm。鏡像的內部連結是網站根目錄的相對路徑，換 gateway 只要改這個環境變數，
# 不必重建鏡像。
export IPFS_GATEWAY="${IPFS_GATEWAY:-https://anoni-net.ipns.dweb.link}"

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
cp -r ./output/* ./anoni-net-docs-ipfs/

# Sanity check：IPFS 鏡像內不該還有主站 URL
echo "[build] sanity check：確認 IPFS 鏡像內無殘留 https://anoni.net/docs URL"
if grep -r "https://anoni.net/docs" ./anoni-net-docs-ipfs/ >/dev/null 2>&1; then
  echo "[build] ERROR: replace_sitename_anoni_ipfs.sh 沒跑完整，仍有 https://anoni.net/docs 出現於：" >&2
  grep -rl "https://anoni.net/docs" ./anoni-net-docs-ipfs/ | head -5 | sed 's/^/  /' >&2
  exit 1
fi

# Sanity check：canonical 與 og:url 來自 site_url，必須是 gateway 的絕對網址。
# 三個語系的 site_url 分別由 mkdocs.yml、run_en.sh、run_zh-cn.sh 決定，漏改任何一個
# 都會讓那個語系的 canonical 掉回主站網址，這裡逐語系檢查。
echo "[build] sanity check：確認三個語系的 canonical 指向 $IPFS_GATEWAY"
for page in ./anoni-net-docs-ipfs/index.html \
            ./anoni-net-docs-ipfs/en/index.html \
            ./anoni-net-docs-ipfs/zh-cn/index.html; do
  if ! grep -q "rel=\"canonical\" href=\"$IPFS_GATEWAY" "$page"; then
    echo "[build] ERROR: $page 的 canonical 不是 $IPFS_GATEWAY，site_url 沒被改寫" >&2
    grep -o 'rel="canonical" href="[^"]*"' "$page" | head -1 | sed 's/^/  /' >&2
    exit 1
  fi
done

if [ "${1:-}" != "--no-upload" ]; then
  sh ./upload_to_ipfs.sh
fi
