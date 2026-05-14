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

rm -rf ./output/*
RUN replace_sitename_anoni_ipfs.sh
RUN run.sh
RUN run_en.sh
RUN run_zh-tw.sh
RUN run_zh-cn.sh
rm -rf ./anoni-net-docs-ipfs/*
cp -r ./output/* ./anoni-net-docs-ipfs/

if [ "${1:-}" != "--no-upload" ]; then
  sh ./upload_to_ipfs.sh
fi
