sh ./replace_sitename_anoni_onion.sh
rm -rf ./output/*
sh ./run.sh
sh ./run_en.sh
sh ./run_zh-tw.sh
sh ./run_zh-cn.sh
sh ./replace_og.sh
rm -rf /srv/ooni-docs-output/*
cp -r ./output/* /srv/ooni-docs-output/
cp ./robots_onion.txt /srv/ooni-docs-output/robots.txt
sudo chown -R ubuntu:nginx /srv/ooni-docs-output/*
