#!/bin/bash
export DISABLE_MKDOCS_2_WARNING=true
export NO_MKDOCS_2_WARNING=true

mkdocs build -v -s -d ./output
