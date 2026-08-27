#!/usr/bin/env python3
"""語言切換器：目前語系不出現在選單上，但仍留在 DOM 裡。

=== 為什麼需要這支 ===

選單不列出目前語系，最直覺的寫法是在 {% for %} 裡跳過那一筆。那樣寫畫面上看起來
一模一樣，壞掉的是看不見的兩件事：

  - overrides/base.html 的語言偏好 JS 從這份清單認出「目前這一頁是哪個語系」
    （比對 link.pathname 與 location.pathname）。認不出來的話首頁的偏好轉址整條
    失效，讀者選過的語言從此沒有作用
  - 底部的語言選擇卡片也是從同一份清單長出來的。少了目前語系那一顆按鈕，讀者
    就沒有辦法把「我要讀正體中文」這個偏好存下來，卡片每次都會再問一次

所以正確的做法是照樣渲染，只在目前語系那一項加 hidden。這支測試守的就是這個分界。

順便驗 current_lang 有沒有寫錯。值對不上任何一筆 alternate 的 lang 時不會有錯誤
訊息，只是三個語系的選單都恢復成列出自己，那種壞法沒有人會注意到。

不碰網路，不需要建置產物，零外部相依。

用法：
  python3 tools/test_lang_switcher.py
"""

from __future__ import annotations

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PARTIAL = ROOT / "docs" / "overrides" / "partials" / "alternate.html"
CONFIGS = [
    ROOT / "docs" / "mkdocs.yml",
    ROOT / "docs" / "mkdocs_cn.yml",
    ROOT / "docs" / "mkdocs_en.yml",
]

failures: list[str] = []


def fail(message: str) -> None:
    failures.append(message)


def alternate_langs(text: str) -> list[str]:
    """取出 extra.alternate 底下每一筆的 lang，順序照原檔。"""
    block = re.search(r"\n  alternate:\n((?:    .*\n|\n)*)", text)
    if not block:
        return []
    return re.findall(r"^\s+lang:\s*(\S+)\s*$", block.group(1), re.M)


def test_menu_renders_every_language() -> None:
    """迴圈裡不准跳過任何一筆，每一筆都要有自己的 <li> 與帶 hreflang 的連結。"""
    text = PARTIAL.read_text(encoding="utf-8")
    body = re.search(r"\{%\s*for\s+alt\s+in\s+config\.extra\.alternate\s*%\}(.*?)\{%\s*endfor\s*%\}", text, re.S)
    if not body:
        fail(f"{PARTIAL.name}: 找不到跑 config.extra.alternate 的迴圈")
        return
    inner = body.group(1)

    items = re.findall(r'<li class="md-select__item"', inner)
    if len(items) != 1:
        fail(f"{PARTIAL.name}: 迴圈裡應該只有一個 md-select__item，實際有 {len(items)} 個")

    head, _, _ = inner.partition("<li class=\"md-select__item\"")
    if re.search(r"\{%\s*(if|for)\b", head):
        fail(
            f"{PARTIAL.name}: <li> 前面出現了條件式，目前語系會整筆消失。"
            " 要藏起來請在 <li> 上加 hidden，不要跳過那一筆，理由見本檔檔頭。"
        )

    if 'hreflang="{{ alt.lang }}"' not in inner:
        fail(f"{PARTIAL.name}: 連結沒有帶 hreflang=\"{{{{ alt.lang }}}}\"，JS 靠它認語系")


def test_current_language_is_hidden() -> None:
    """目前語系那一項要帶 hidden，判斷條件讀 config.extra.current_lang。"""
    text = PARTIAL.read_text(encoding="utf-8")
    marker = re.search(
        r'<li class="md-select__item"\{%\s*if\s+alt\.lang\s*==\s*config\.extra\.current_lang\s*%\}\s*hidden\{%\s*endif\s*%\}>',
        text,
    )
    if not marker:
        fail(
            f"{PARTIAL.name}: 目前語系那一項沒有加 hidden。"
            " 少了它選單會列出讀者已經在讀的語言，選了會回到原地。"
        )


def test_current_lang_matches_an_alternate() -> None:
    """三份設定各自的 current_lang 都要對得上自己 alternate 裡的一筆 lang。"""
    for path in CONFIGS:
        text = path.read_text(encoding="utf-8")
        found = re.search(r"^  current_lang:\s*(\S+)\s*$", text, re.M)
        if not found:
            fail(f"{path.name}: extra 底下缺 current_lang，這一份的選單會列出自己")
            continue
        langs = alternate_langs(text)
        if not langs:
            fail(f"{path.name}: 讀不到 extra.alternate 的 lang 清單")
            continue
        if found.group(1) not in langs:
            fail(
                f"{path.name}: current_lang 是 {found.group(1)}，"
                f" 對不上 alternate 的任何一筆（{', '.join(langs)}）"
            )


def test_every_language_is_current_somewhere() -> None:
    """三份設定合起來要蓋到全部語系，漏掉的那一個永遠看得到自己。"""
    declared = set()
    langs: set[str] = set()
    for path in CONFIGS:
        text = path.read_text(encoding="utf-8")
        found = re.search(r"^  current_lang:\s*(\S+)\s*$", text, re.M)
        if found:
            declared.add(found.group(1))
        langs.update(alternate_langs(text))
    missing = langs - declared
    if missing:
        fail(f"沒有任何一份設定把這些語系標成 current_lang：{', '.join(sorted(missing))}")


def main() -> int:
    for fn in [
        test_menu_renders_every_language,
        test_current_language_is_hidden,
        test_current_lang_matches_an_alternate,
        test_every_language_is_current_somewhere,
    ]:
        fn()
    if failures:
        print(f"FAILED ({len(failures)})")
        for f in failures:
            print("  " + f)
        return 1
    print("lang switcher tests passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
