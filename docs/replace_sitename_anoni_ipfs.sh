# Strip standard-build-only analytics block from overrides before mkdocs build。
# aa.anoni.net 分析端點僅在 standard 生效，避免 IPFS 使用者連到 clearnet endpoint
sed -i '/anoni-analytics-start/,/anoni-analytics-end/d' \
	./overrides/main.html \
	./overrides_en/main.html \
	./overrides_cn/main.html

# 站台層量測腳本同樣只給 standard 版。main.html 裡的引用已經跟著 anoni-analytics 區塊
# 一起被刪掉，這裡把檔案本身也拿掉，產物裡才不會留一支載不到也用不到的 analytics.js。
rm -f ./zh-TW/js/analytics.js ./zh-CN/js/analytics.js ./en/js/analytics.js

find ./output -path './onion' -prune -o \
	-type f ! -name 'replace_sitename_anoni_ipfs.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec grep -l 'https://anoni.net/docs' {} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename_anoni_ipfs.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|https://anoni.net/docs|https://anoni-net.ipns.dweb.link|g' {} +

# pymdownx snippets（--8<--）的正本放 repo 根目錄（base_path 含 '..'），
# 例如 community/become-anoni.md 嵌入 ../BECOME_ANONI.md。這些檔在 docs/ 之外，
# 上面 find ./ 掃不到，build 時會把含 https://anoni.net/docs 的原文 inline 進 output，
# 害 build_docs_anoni_ipfs.sh 的 sanity check 失敗。先一併改寫 repo 根的 markdown snippet 來源。
# （build_docs_anoni_ipfs.sh 的 cleanup trap 用 git restore :/ 還原整個 repo）
find .. -maxdepth 1 -type f -name '*.md' \
	-exec sed -i 's|https://anoni.net/docs|https://anoni-net.ipns.dweb.link|g' {} +

# 語言選單（extra.alternate）的 link 是站台根相對路徑，IPFS 鏡像換成 IPNS gateway 的
# 絕對網址。一條規則涵蓋三個語系：/docs/ → gateway 根（zh-TW 預設語系建在根路徑）、
# /docs/zh-cn/ → gateway 的 /zh-cn/、/docs/en/ → gateway 的 /en/。
find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename_anoni_ipfs.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|link: /docs/|link: https://anoni-net.ipns.dweb.link/|g' {} +

find ./output \
	-type f ! -name 'replace_sitename_anoni_ipfs.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|https://anoni.net||g' {} +

find ./output \
	-type f ! -name 'replace_sitename_anoni_ipfs.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec grep -l 'anoni\.net' {} +
