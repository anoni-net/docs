#!/bin/bash
export DISABLE_MKDOCS_2_WARNING=true
export NO_MKDOCS_2_WARNING=true
export DOCS_DIR='ja'
export SITE_NAME='anoni.net Docs 日本語版'
export SITE_URL='https://anoni.net/docs/ja/'
export EDIT_URI='https://github.com/anoni-net/docs/blob/main/docs/ja/'
export SITE_DESC='台湾を拠点とするボランティア観測コミュニティ。OONI 観測、Tor リレー監視、現地の文脈をアジア太平洋の中国語圏から発信しています。'
export NAV_ABOUT='私たちについて'
export NAV_COMMUNITY='コミュニティ'
export NAV_GUIDES='ガイド'
export NAV_BASICS='基本概念'
export NAV_TOOLS='ツール'
export NAV_SCENARIOS='シナリオ'
export NAV_REGIONAL='地域観測'
export NAV_REPORTS='レポート'
export NAV_EVENT='イベント'
export NAV_POST='更新情報'
export NAV_EVENT_PREPARE='準備ページ'
export CATE_NAME='カテゴリ'
export LANGUAGE='ja'
export OVERRIDES='overrides_ja'

mkdocs build -v -s -f ./mkdocs_ja.yml -d ./output/ja
