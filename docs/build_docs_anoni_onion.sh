# 頁首的版本小標記讀這個值。run.sh 等三支是子行程，export 會傳下去。
export BUILD_VARIANT=onion

sh ./replace_sitename_anoni_onion.sh
rm -rf ./output/*
# 清掉 privacy plugin 快取，避免外部資源（如 vega-embed）換 URL 形狀後殘留舊鏡像 symlink 害圖表不 render
rm -rf .cache/plugin/privacy
sh ./run.sh
sh ./run_en.sh
sh ./run_zh-cn.sh
sh ./replace_og.sh
rm -rf /srv/ooni-docs-output/*
# service worker 只在 clearnet 註冊（overrides/base.html 的 hostname 白名單），
# onion 與 IPFS 版不會用到，且這裡沒有做 __BUILD_VERSION__ 替換。
# 留著是永遠不會執行的死檔案，會誤導後人，部署前移除。
find ./output -name "sw.js" -delete
cp -r ./output/* /srv/ooni-docs-output/
cp ./robots_onion.txt /srv/ooni-docs-output/robots.txt
sudo chown -R ubuntu:nginx /srv/ooni-docs-output/*
