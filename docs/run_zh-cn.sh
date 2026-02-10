#!/bin/bash
export DOCS_DIR='zh-CN'
export SITE_NAME='匿名网络社群 Anoni.net/Docs'
export SITE_URL='https://anoni.net/docs/zh-cn/'
export EDIT_URI='https://github.com/anoni-net/docs/blob/main/docs/zh-CN/'
export SITE_DESC='匿名网络、Tor、Tails、OONI、网络自由、网络审查、ASNs 观测范围、检测列表、本地推广与翻译 '
export NAV_ABOUT='关于我们'
export NAV_COMMUNITY="社群参与"
export NAV_INTRO='项目简介'
export NAV_EVENT='活动参与'
export NAV_PP='参与项目'
export NAV_PPP='参与准备'
export NAV_POST='信息更新'
export NAV_EVENT_PREPARE="筹备页面"
export NAV_WATCHER='监控观察'
export CATE_NAME='文章类型'
export LANGUAGE='zh'
export OVERRIDES='overrides_cn'

mkdocs build -v -s -f ./mkdocs_cn.yml -d ./output/zh-cn
