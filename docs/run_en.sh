#!/bin/bash
export DOCS_DIR='en'
export SITE_NAME='Anonymity Network Community, Anoni.net/Docs'
export SITE_URL='https://anoni.net/docs/en/'
export EDIT_URI='https://github.com/anoni-net/docs/blob/main/docs/en/'
export SITE_DESC='Promotion and Translation of Anonymous Network Tools: Tor, Tails, and OONI in Taiwan.'
export NAV_ABOUT='About'
export NAV_COMMUNITY="Community"
export NAV_INTRO='Overview'
export NAV_EVENT='Activity'
export NAV_PP='Projects'
export NAV_PPP='Preparation'
export NAV_POST='News'
export NAV_EVENT_PREPARE="Pre-Event"
export NAV_WATCHER='Monitoring'
export CATE_NAME='Categories'
export LANGUAGE='en'
export FONT_TEXT='Public Sans'
export FONT_CODE='DM Mono'
export OVERRIDES='overrides_en'

mkdocs build -v -s -f ./mkdocs_en.yml -d ./output/en
