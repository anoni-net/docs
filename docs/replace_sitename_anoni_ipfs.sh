find ./output -path './onion' -prune -o \
	-type f ! -name 'replace_sitename_anoni_ipfs.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec grep -l 'https://anoni.net/docs' {} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename_anoni_ipfs.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|https://anoni.net/docs|https://ipfs.io/ipns/k51qzi5uqu5dlfm2jj0f70ex3r3babmwy8qh071inwknttr7wqa3uhdwvlmrmw|g' {} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename_anoni_ipfs.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|link: /docs/zh-tw/|link: /ipns/k51qzi5uqu5dlfm2jj0f70ex3r3babmwy8qh071inwknttr7wqa3uhdwvlmrmw/zh-tw/|g' {} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename_anoni_ipfs.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|link: /docs/zh-cn/|link: /ipns/k51qzi5uqu5dlfm2jj0f70ex3r3babmwy8qh071inwknttr7wqa3uhdwvlmrmw/zh-cn/|g' {} +

find ./ -path './onion' -prune -o \
	-type f ! -name 'replace_sitename_anoni_ipfs.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|link: /docs/en/|link: /ipns/k51qzi5uqu5dlfm2jj0f70ex3r3babmwy8qh071inwknttr7wqa3uhdwvlmrmw/en/|g' {} +

find ./output \
	-type f ! -name 'replace_sitename_anoni_ipfs.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec sed -i 's|https://anoni.net||g' {} +

find ./output \
	-type f ! -name 'replace_sitename_anoni_ipfs.sh' \
	-type f ! -name 'replace_sitename_anoni_onion.sh' \
	-exec grep -l 'anoni\.net' {} +
