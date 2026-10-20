# IPFS 版建置前要改的原始檔。2026-10 起 IPFS 鏡像是 anoni.net 整站（toomore/anoni-net-ws#422），
# 文件站放在鏡像的 /docs/，路徑跟 clearnet 相同，site_url 維持 https://anoni.net/docs，
# canonical 指回 clearnet。所以這裡不再改寫 site_url，也不再拔 /docs 前綴，連結的改寫在建置
# 之後由 tools/ipfs_links.py 對產物做，只動 <body> 裡的 href 與 src。

# Strip standard-build-only analytics block from overrides before mkdocs build。
# aa.anoni.net 分析端點僅在 standard 生效，避免 IPFS 使用者連到 clearnet endpoint
sed -i '/anoni-analytics-start/,/anoni-analytics-end/d' \
	./overrides/main.html \
	./overrides_en/main.html \
	./overrides_cn/main.html

# 站台層量測腳本同樣只給 standard 版。main.html 裡的引用已經跟著 anoni-analytics 區塊
# 一起被刪掉，這裡把檔案本身也拿掉，產物裡才不會留一支載不到也用不到的 analytics.js。
rm -f ./zh-TW/js/analytics.js ./zh-CN/js/analytics.js ./en/js/analytics.js
