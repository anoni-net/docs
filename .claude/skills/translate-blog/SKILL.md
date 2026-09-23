---
name: translate-blog
description: 把外部文章（Tor Project、OONI、EFF 等組織的部落格）翻成 anoni.net 文件站的 blog，產出 zh-TW、zh-CN 與 en。使用者要翻譯一篇外部文章，或 zh-TW 校稿完要接著做 zh-CN 與 en 時使用。
---

# 翻譯外部文章到 blog

順序、front matter、內文結構與各語系的觀點段，寫在 `docs/zh-TW/community/i18n.md` 的「翻譯外部文章到 blog」一節，寫作規則照 `docs/zh-TW/community/contributor-handbook.md`。開始前兩份都要讀，這份只補 Claude Code 的操作方式。

## 停點

流程有兩個校稿停點，到了就停下來，等使用者確認再往下：

1. zh-TW 寫完：回報檔案路徑、拿不準的譯名，以及台灣脈絡觀點段的論點，請使用者校稿。
2. zh-CN 與 en 寫完：回報兩個檔案，說明 en 改寫的角度，或者為什麼這篇不做 en。

使用者校過的 zh-TW 是 zh-CN 的依據。校稿期間 zh-TW 又改了，zh-CN 以最新的 zh-TW 為準。

## 開 PR 前

- 執行 `python3 tools/docs_style_lint.py` 掃三個檔案，error 要清掉
- 需要時叫用 `fact-checker` 核對數字與宣稱，`line-editor` 看語句
- PR 描述照範本填。翻譯需求如果來自非公開的地方（私有 repo 的 issue、內部討論），PR 描述不要放它的連結
