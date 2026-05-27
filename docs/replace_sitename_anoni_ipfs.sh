# Strip standard-build-only analytics block from overrides before mkdocs build。
# aa.anoni.net 分析端點僅在 standard 生效，避免 IPFS 使用者連到 clearnet endpoint
sed -i '/anoni-analytics-start/,/anoni-analytics-end/d' \
	./overrides/main.html \
	./overrides_en/main.html \
	./overrides_cn/main.html

find ./output -path './onion' -prune -o \
	-type f ! -name 'replace_sitename_anoni_ipfs.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec grep -l 'https://anoni.net/docs' {} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename_anoni_ipfs.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|https://anoni.net/docs|https://anoni-net.ipns.dweb.link|g' {} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename_anoni_ipfs.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|link: /docs/zh-tw/|link: https://anoni-net.ipns.dweb.link/zh-tw/|g' {} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename_anoni_ipfs.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|link: /docs/zh-cn/|link: https://anoni-net.ipns.dweb.link/zh-cn/|g' {} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename_anoni_ipfs.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|link: /docs/en/|link: https://anoni-net.ipns.dweb.link/en/|g' {} +

find ./output \
	-type f ! -name 'replace_sitename_anoni_ipfs.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|https://anoni.net||g' {} +

find ./output \
	-type f ! -name 'replace_sitename_anoni_ipfs.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec grep -l 'anoni\.net' {} +
