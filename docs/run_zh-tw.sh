#!/bin/bash
export DISABLE_MKDOCS_2_WARNING=true
export NO_MKDOCS_2_WARNING=true
export SITE_URL='https://anoni.net/docs/zh-tw/'

mkdocs build -v -s -d ./output/zh-tw
