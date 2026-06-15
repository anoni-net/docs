sh ./replace_sitename_anoni_onion.sh
rm -rf ./output/*
# 清掉 privacy plugin 快取，避免外部資源（如 vega-embed）換 URL 形狀後殘留舊鏡像 symlink 害圖表不 render
rm -rf .cache/plugin/privacy
sh ./run.sh
sh ./run_en.sh
sh ./run_zh-tw.sh
sh ./run_zh-cn.sh
sh ./replace_og.sh
rm -rf /srv/ooni-docs-output/*
cp -r ./output/* /srv/ooni-docs-output/
cp ./robots_onion.txt /srv/ooni-docs-output/robots.txt
sudo chown -R ubuntu:nginx /srv/ooni-docs-output/*
