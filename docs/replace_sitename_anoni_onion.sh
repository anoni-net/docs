# onion 位址只寫在這裡一次，下面所有改寫都跟著它走。輪替的時候改這一行。
#
# CI 由 .github/workflows/build_docs.yml 用同一個名字帶進來，本機直接執行用這裡
# 的預設值。tools/check_onion_address.py 比對這個預設值、workflow 帶進來的值、
# 以及三份 mkdocs 設定的 onion_base 有沒有對上，任何一邊漏改就紅。
#
# 曾經有八處寫死在這一支裡，加上六份模板各自寫死一次。位址換掉而漏改任何一處，
# 建置照樣成功、CI 照樣綠，壞的只有讀者點下去那一刻。
ONION_ROOT="${ONION_ROOT:-anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion}"

# Strip standard-build-only analytics block from overrides before mkdocs build。
# aa.anoni.net 分析端點僅在 standard 生效，避免 Onion 使用者連到 clearnet endpoint
sed -i '/anoni-analytics-start/,/anoni-analytics-end/d' \
	./overrides/main.html \
	./overrides_en/main.html \
	./overrides_cn/main.html

# 站台層量測腳本同樣只給 standard 版。main.html 裡的引用已經跟著 anoni-analytics 區塊
# 一起被刪掉，這裡把檔案本身也拿掉，產物裡才不會留一支載不到也用不到的 analytics.js。
rm -f ./zh-TW/js/analytics.js ./zh-CN/js/analytics.js ./en/js/analytics.js

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec grep -l 'https://anoni.net/docs' {} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i "s|https://anoni.net/api|http://${ONION_ROOT}/api|g" {} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i "s|https://anoni.net/docs|http://docs.${ONION_ROOT}|g" {} +

# pymdownx snippets（--8<--）的正本放 repo 根目錄（base_path 含 '..'），
# 例如 community/become-anoni.md 嵌入 ../BECOME_ANONI.md。這些檔在 docs/ 之外，
# 上面 find ./ 掃不到，build 時會把含主站 URL 的原文 inline 進 output，
# 害 onion 鏡像殘留 clearnet 連結。一併改寫 repo 根的 markdown snippet 來源。
find .. -maxdepth 1 -type f -name '*.md' -exec sed -i \
	-e "s|https://anoni.net/api|http://${ONION_ROOT}/api|g" \
	-e "s|https://anoni.net/docs|http://docs.${ONION_ROOT}|g" \
	-e "s|https://form.anoni.net|http://form.${ONION_ROOT}|g" \
	-e "s|https://pad.anoni.net|http://pad.${ONION_ROOT}|g" \
	{} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i "s|https://form.anoni.net|http://form.${ONION_ROOT}|g" {} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i "s|https://pad.anoni.net|http://pad.${ONION_ROOT}|g" {} +

# assets.anoni.net 刻意不改寫。這裡曾經加過一條把它換成 onion /assets 的規則，
# 理由是「onion 讀者不該繞出口抓圖」，那個前提是錯的：mkdocs 的 privacy plugin
# 本來就會在建置時把外部資源抓下來鏡像進站內，產出的 HTML 指向
# assets/external/assets.anoni.net/...，三個版本都一樣，onion 讀者拿到的一直是本機檔案。
#
# 換成 .onion 之後反而會壞：這支在 mkdocs build 之前跑，privacy plugin 接著要去下載
# 那些網址，CI runner 解析不了 .onion，抓不到就在寫鏡像檔時 FileNotFoundError 中止。
# 詳見 run 32053989479。要動 assets 的話請改 privacy plugin 的 assets_exclude，不要在這裡 sed。

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
