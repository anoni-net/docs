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
sudo chown -R ubuntu:nginx /srv/anoni-net/anoni-net/website/docs/*
