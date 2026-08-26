# Strip standard-build-only analytics block from overrides before mkdocs build。
# aa.anoni.net 分析端點僅在 standard 生效，避免 IPFS 使用者連到 clearnet endpoint
sed -i '/anoni-analytics-start/,/anoni-analytics-end/d' \
	./overrides/main.html \
	./overrides_en/main.html \
	./overrides_cn/main.html

# 站台層量測腳本同樣只給 standard 版。main.html 裡的引用已經跟著 anoni-analytics 區塊
# 一起被刪掉，這裡把檔案本身也拿掉，產物裡才不會留一支載不到也用不到的 analytics.js。
rm -f ./zh-TW/js/analytics.js ./zh-CN/js/analytics.js ./en/js/analytics.js

# 公開 gateway 的位址集中在 IPFS_GATEWAY，由 build_docs_anoni_ipfs.sh export 進來，
# 單獨執行本腳本時走這裡的 fallback。mkdocs*.yml 的 extra.ipfs_gateway 讀同一個變數，
# 所以頁尾連結與 site_url 不會各說各話。
# 集中的理由是公開 gateway 會停。Cloudflare 的 cf-ipfs.com 在 2024-08 除役並把流量
# 導向 dweb.link 與 ipfs.io，Shipyard 又宣布 2026-09-30 停止營運那兩個
# （https://ipshipyard.com/blog/2026-the-end-of-ipfs-at-shipyard/）。
IPFS_GATEWAY="${IPFS_GATEWAY:-https://ipfs.anoni.net}"

# site_url 是少數必須用絕對網址的地方，mkdocs 拿它產生 canonical、og:url 與 sitemap，
# 填相對路徑會讓 sitemap 產不出來。zh-TW 讀 mkdocs.yml 的預設值，en 與 zh-CN 由
# run_en.sh、run_zh-cn.sh 的 export 覆蓋，三個都要改，只改 yml 不會生效。
sed -i "/^site_url:/s|https://anoni.net/docs|$IPFS_GATEWAY|" \
	./mkdocs.yml ./mkdocs_en.yml ./mkdocs_cn.yml
sed -i "/^export SITE_URL=/s|https://anoni.net/docs|$IPFS_GATEWAY|" \
	./run_en.sh ./run_zh-cn.sh

# 內文寫死的主站網址改成網站根目錄的相對路徑，不指向任何一個 gateway。同一份 CID 因此在
# 任何 subdomain gateway 上都讀得到，換 gateway 不必重建鏡像、不必重發 IPNS。
# 做法沿用 replace_sitename_anoni_onion.sh 處理語言選單的那條規則。
# 前提是鏡像掛在 gateway 的根路徑（subdomain gateway 或自架 gateway 都是這樣），
# path gateway 形式（https://gw/ipns/anoni.net/）不適用，相對路徑會落到 gateway 的根。
find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename_anoni_ipfs.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|https://anoni.net/docs||g' {} +

# 少數內文把跨語系連結寫成站台根絕對路徑（例如 blog/posts/2025to2026.md 的
# [英文版本](/docs/en/)）。三個語系各自是獨立的 mkdocs build，跨語系連不成 doc 相對
# 路徑，clearnet 掛在 /docs/ 底下所以這樣寫可行。鏡像的 docs 就是自己的根，前綴要拔掉，
# 留著會連到 gateway 的 /docs/ 而不是鏡像內的語系區段。
find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename_anoni_ipfs.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|](/docs/|](/|g' {} +

# pymdownx snippets（--8<--）的正本放 repo 根目錄（base_path 含 '..'），
# 例如 community/become-anoni.md 嵌入 ../BECOME_ANONI.md。這些檔在 docs/ 之外，
# 上面 find ./ 掃不到，build 時會把含 https://anoni.net/docs 的原文 inline 進 output，
# 害 build_docs_anoni_ipfs.sh 的 sanity check 失敗。先一併改寫 repo 根的 markdown snippet 來源。
# （build_docs_anoni_ipfs.sh 的 cleanup trap 用 git restore :/ 還原整個 repo）
find .. -maxdepth 1 -type f -name '*.md' \
	-exec sed -i 's|https://anoni.net/docs||g' {} +

# 語言選單（extra.alternate）的 link 是網站根目錄的相對路徑，clearnet 掛在 /docs/ 底下，
# IPFS 鏡像的 docs 就是自己的根，把前綴整段拔掉。一條規則涵蓋三個語系：
# /docs/ → /（zh-TW 預設語系建在根路徑）、/docs/zh-cn/ → /zh-cn/、/docs/en/ → /en/。
find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename_anoni_ipfs.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|link: /docs/|link: /|g' {} +

# 這裡曾經有兩條掃 ./output 的診斷 find。build_docs_anoni_ipfs.sh 在呼叫本腳本之前
# 就 rm -rf ./output/*，兩條永遠掃不到東西，./output 不存在時（乾淨的 clone）還會
# 讓 find 回非零、連帶讓 set -e 的 build 腳本中止。真正的檢查在 build 腳本裡，
# 建置完成之後掃 ./anoni-net-docs-ipfs/。
