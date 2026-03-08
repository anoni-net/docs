rm -rf ./output/*
sh ./run.sh
sh ./run_en.sh
sh ./run_zh-tw.sh
sh ./run_zh-cn.sh
sh ./replace_og.sh
rm -rf /srv/anoni-net/anoni-net/website/docs/*
cp -r ./output/* /srv/anoni-net/anoni-net/website/docs/
sudo chown -R ubuntu:nginx /srv/anoni-net/anoni-net/website/docs/*
