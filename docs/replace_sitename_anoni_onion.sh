# Strip standard-build-only analytics block from overrides before mkdocs build。
# aa.anoni.net 分析端點僅在 standard 生效，避免 Onion 使用者連到 clearnet endpoint
sed -i '/anoni-analytics-start/,/anoni-analytics-end/d' \
	./overrides/main.html \
	./overrides_en/main.html \
	./overrides_cn/main.html

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec grep -l 'https://anoni.net/docs' {} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|https://anoni.net/api|http://anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/api|g' {} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|https://anoni.net/docs|http://docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion|g' {} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|https://form.anoni.net|http://form.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion|g' {} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|https://pad.anoni.net|http://pad.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion|g' {} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|link: /docs/zh-tw/|link: /zh-tw/|g' {} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|link: /docs/zh-cn/|link: /zh-cn/|g' {} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|link: /docs/en/|link: /en/|g' {} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec grep -l 'anoni\.net' {} +
