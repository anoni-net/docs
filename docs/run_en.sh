#!/bin/bash
export DOCS_DIR='en'
export SITE_NAME='anoni.net Docs — Sinophone Asia-Pacific Networked Freedom Observatory'
export SITE_URL='https://anoni.net/docs/en/'
export EDIT_URI='https://github.com/anoni-net/docs/blob/main/docs/en/'
export SITE_DESC='Taiwan-anchored volunteer observatory tracking networked freedom across the Sinophone Asia-Pacific region — OONI measurements, Tor relay monitoring, and on-the-ground community context.'
export NAV_ABOUT='About'
export NAV_COMMUNITY="Community"
export NAV_GUIDES='Guides'
export NAV_BASICS='Concepts'
export NAV_SCENARIOS='Scenarios'
export NAV_REGIONAL='Regional'
export NAV_REPORTS='Reports'
export NAV_EVENT='Events'
export NAV_POST='Updates'
export NAV_EVENT_PREPARE="Pre-Event"
export CATE_NAME='Categories'
export LANGUAGE='en'
export FONT_TEXT='Public Sans'
export FONT_CODE='DM Mono'
export OVERRIDES='overrides_en'

mkdocs build -v -s -f ./mkdocs_en.yml -d ./output/en
