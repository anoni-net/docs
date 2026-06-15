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

# pymdownx snippets（--8<--）的正本放 repo 根目錄（base_path 含 '..'），
# 例如 community/become-anoni.md 嵌入 ../BECOME_ANONI.md。這些檔在 docs/ 之外，
# 上面 find ./ 掃不到，build 時會把含 https://anoni.net/docs 的原文 inline 進 output，
# 害 build_docs_anoni_ipfs.sh 的 sanity check 失敗。先一併改寫 repo 根的 markdown snippet 來源。
# （build_docs_anoni_ipfs.sh 的 cleanup trap 用 git restore :/ 還原整個 repo）
find .. -maxdepth 1 -type f -name '*.md' \
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
