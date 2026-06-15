rm -rf ./output/*
# 清掉 privacy plugin 快取，避免外部資源（如 vega-embed）換 URL 形狀後殘留舊鏡像 symlink 害圖表不 render
rm -rf .cache/plugin/privacy
sh ./run.sh
sh ./run_en.sh
sh ./run_zh-tw.sh
sh ./run_zh-cn.sh
sh ./replace_og.sh
# PWA: 注入 build 版本到 service worker，讓每次部署換版並清掉舊快取
BUILD_VERSION=$(date +%Y%m%d%H%M)
find ./output -name 'sw.js' -exec sed -i "s/__BUILD_VERSION__/${BUILD_VERSION}/" {} \;
rm -rf /srv/anoni-net/anoni-net/website/docs/*
cp -r ./output/* /srv/anoni-net/anoni-net/website/docs/
# 預壓 >=100KB 的可壓縮檔：Cloudflare 對大檔的 edge 壓縮不可靠（連數百 KB 都可能放棄），
# 改由 nginx gzip_static always 直接送預壓好的 .gz。小檔交給 Cloudflare 即時壓即可。
find /srv/anoni-net/anoni-net/website/docs -type f \
  \( -iname '*.json' -o -iname '*.js' -o -iname '*.css' -o -iname '*.html' \
     -o -iname '*.xml' -o -iname '*.svg' -o -iname '*.txt' \) \
  -size +100k ! -iname '*.gz' -exec gzip -9 -k -f {} \;
sudo chown -R ubuntu:nginx /srv/anoni-net/anoni-net/website/docs/*
