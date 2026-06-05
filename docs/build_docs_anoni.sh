rm -rf ./output/*
# 清掉 privacy plugin 快取，避免外部資源（如 vega-embed）換 URL 形狀後殘留舊鏡像 symlink 害圖表不 render
rm -rf .cache/plugin/privacy
sh ./run.sh
sh ./run_en.sh
sh ./run_zh-tw.sh
sh ./run_zh-cn.sh
sh ./replace_og.sh
rm -rf /srv/anoni-net/anoni-net/website/docs/*
cp -r ./output/* /srv/anoni-net/anoni-net/website/docs/
# 預壓 search_index.json：Cloudflare 對 >1MB 的 JSON 不做 edge 壓縮，
# 改由 nginx gzip_static always 直接吐預壓好的 .gz（搭配 anoni.net vhost 的 location 設定）
find /srv/anoni-net/anoni-net/website/docs -name 'search_index.json' -exec gzip -9 -k -f {} \;
sudo chown -R ubuntu:nginx /srv/anoni-net/anoni-net/website/docs/*
