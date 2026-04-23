rm -rf ./output/*
sh ./replace_sitename_anoni_ipfs.sh
sh ./run.sh
sh ./run_en.sh
sh ./run_zh-tw.sh
sh ./run_zh-cn.sh
rm -rf ./anoni-net-docs-ipfs/*
cp -r ./output/* ./anoni-net-docs-ipfs/

if [ "${1:-}" != "--no-upload" ]; then
  sh ./upload_to_ipfs.sh
fi
