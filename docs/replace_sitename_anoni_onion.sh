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

# pymdownx snippets（--8<--）的正本放 repo 根目錄（base_path 含 '..'），
# 例如 community/become-anoni.md 嵌入 ../BECOME_ANONI.md。這些檔在 docs/ 之外，
# 上面 find ./ 掃不到，build 時會把含主站 URL 的原文 inline 進 output，
# 害 onion 鏡像殘留 clearnet 連結。一併改寫 repo 根的 markdown snippet 來源。
find .. -maxdepth 1 -type f -name '*.md' -exec sed -i \
	-e 's|https://anoni.net/api|http://anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/api|g' \
	-e 's|https://anoni.net/docs|http://docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion|g' \
	-e 's|https://form.anoni.net|http://form.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion|g' \
	-e 's|https://pad.anoni.net|http://pad.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion|g' \
	{} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|https://form.anoni.net|http://form.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion|g' {} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|https://pad.anoni.net|http://pad.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion|g' {} +

# 圖片主機。assets.anoni.net 是 clearnet 網域，onion 鏡像原樣留著的話，讀者的
# Tor Browser 得繞出口去抓圖，慢又等於把「我在看這頁」透露給出口與 CDN。
# 主站的 onion vhost 有 location /assets 指到同一顆 /srv/images-anoni-net/，
# 換過去就走完整的 onion 路徑。docs onion 自己沒有 /assets，所以指的是主站那個。
find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|https://assets.anoni.net/|http://anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/assets/|g' {} +

# 語言選單（extra.alternate）的 link 是站台根相對路徑，clearnet 掛在 /docs/ 底下，
# onion 站的 docs 就是自己的根，把前綴整段拔掉。一條規則涵蓋三個語系：
# /docs/ → /（zh-TW 預設語系建在根路徑）、/docs/zh-cn/ → /zh-cn/、/docs/en/ → /en/。
find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|link: /docs/|link: /|g' {} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec grep -l 'anoni\.net' {} +
