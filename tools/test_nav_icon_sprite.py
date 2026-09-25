#!/usr/bin/env python3
"""nav_icon_sprite hook 的回歸測試。

這支 hook 把導覽列上每一頁的 inline SVG 換成指向外部 sprite 的 <use>。錯了建置照樣
綠燈，症狀全在畫面上：symbol 的 id 對不上是一排空白的圖示，viewBox 沒帶過去是圖示
縮成一角，外層 <svg> 的屬性被改掉則是尺寸或顏色跟原本不一樣。這些在截圖上看得出來，
在 CI 裡看不出來，所以把會出錯的那幾步拆成純函式在這裡驗。

不需要 mkdocs，也不需要建置產物。

用法：
  python3 tools/test_nav_icon_sprite.py
"""

from __future__ import annotations

import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "docs" / "hooks"))

import nav_icon_sprite as hook  # noqa: E402

failures: list[str] = []


def check(label: str, got, want) -> None:
    if got != want:
        failures.append(f"{label}\n    got:  {got!r}\n    want: {want!r}")


HOME = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 20v-6h4v6"/></svg>'
LOCK = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M4 4h8v8H4z"/></svg>\n'
BARE = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>'

text, mapping = hook.build_sprite(
    {"material/home": HOME, "octicons/lock-16": LOCK, "material/bare": BARE}
)

# symbol 只放內層，viewBox 跟著原本那一份走。16 格與 24 格的圖示混在一起，帶錯
# viewBox 就是縮成一角或被裁掉。
check(
    "sprite：symbol 帶原本的 viewBox",
    re.findall(r'<symbol id="([^"]+)" viewBox="([^"]+)">', text),
    [("material--home", "0 0 24 24"), ("octicons--lock-16", "0 0 16 16")],
)
# 沒有 viewBox 的收進來也畫不出正確比例，留在頁面上照原本 inline
check("sprite：沒有 viewBox 的不收", "material--bare" in text, False)
check(
    "sprite：內層對到 id",
    mapping,
    {'<path d="M10 20v-6h4v6"/>': "material--home", '<path d="M4 4h8v8H4z"/>': "octicons--lock-16"},
)
check("sprite：外層宣告 SVG 命名空間", text.startswith('<svg xmlns="http://www.w3.org/2000/svg">'), True)

# 檔名帶內容雜湊。圖示換了檔名就換，service worker 與 CDN 的舊副本不會冒充新的
path = hook.sprite_path(text)
check("檔名：形狀", bool(re.fullmatch(r"assets/nav-icons\.[0-9a-f]{8}\.svg", path)), True)
check("檔名：同樣內容同一個名字", hook.sprite_path(text), path)
other, _ = hook.build_sprite({"material/home": HOME})
check("檔名：內容變了名字就變", hook.sprite_path(other) != path, True)

check("id：斜線換成兩個連字號", hook.symbol_id("fontawesome/brands/signal"), "fontawesome--brands--signal")

# Material 用三種標籤畫導覽連結：一般頁面的 <a>、可展開章節的 <label>、帶索引頁的
# 章節的 <div>，頂端的分頁是 md-tabs__link。四種都要換。
page = (
    '<a href="../x/" class="md-nav__link md-nav__link--active">\n  ' + HOME + '<span>X</span></a>'
    '<label class="md-nav__link" for="__nav_2">' + HOME + "</label>"
    '<div class="md-nav__link md-nav__container">' + HOME + "</div>"
    '<a href="../" class="md-tabs__link">' + HOME + "首頁</a>"
)
stats = {"replaced": 0, "kept": 0}
out = hook.rewrite(page, "../../assets/nav-icons.ab12cd34.svg", mapping, stats)
check("改寫：四種連結都換掉", stats, {"replaced": 4, "kept": 0})
check("改寫：內層路徑不再 inline", 'd="M10 20v-6h4v6"' in out, False)
# 外層開頭標籤原封不動，theme 的 CSS 選擇器、尺寸與 fill 繼承都跟原本一樣
check(
    "改寫：外層 svg 原樣保留，裡面換成 use",
    out.count('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'
              '<use href="../../assets/nav-icons.ab12cd34.svg#material--home"></use></svg>'),
    4,
)
check("改寫：連結後面的文字不受影響", "<span>X</span></a>" in out and "首頁</a>" in out, True)

# 不在 sprite 裡的圖示保留 inline。寧可省得少，也不要畫出空白的圖示
unknown = '<a href="x/" class="md-nav__link"><svg viewBox="0 0 24 24"><path d="M1 1"/></svg>X</a>'
stats = {"replaced": 0, "kept": 0}
check("改寫：認不得的留著", hook.rewrite(unknown, "s.svg", mapping, stats), unknown)
check("改寫：留著的有算到", stats, {"replaced": 0, "kept": 1})

# 內文裡的圖示（emoji 擴充畫出來的 twemoji）不是導覽列，不動
body = '<p><span class="twemoji">' + HOME + "</span></p>"
check("改寫：內文圖示不動", hook.rewrite(body, "s.svg", mapping), body)


# 404 頁出現在任何一個不存在的網址底下，相對路徑解析出來的位置每次都不同，要用
# site_url 的路徑拼絕對網址
class Config(dict):
    pass


hook._symbols.clear()
hook._symbols.update(mapping)
hook._sprite["path"] = path
nav = '<a href="/docs/" class="md-nav__link">' + HOME + "</a>"
out = hook.on_post_template(nav, "404.html", Config(site_url="https://anoni.net/docs/en/"))
check("404：絕對網址", f'<use href="/docs/en/{path}#material--home">' in out, True)
out = hook.on_post_template(nav, "404.html", Config(site_url=""))
check("404：沒有 site_url 時從根路徑算", f'<use href="/{path}#material--home">' in out, True)
check("404：非 HTML 的樣板不動", hook.on_post_template(nav, "sitemap.xml", Config()), nav)


if __name__ == "__main__":
    if failures:
        print(f"✗ {len(failures)} 項失敗\n")
        for failure in failures:
            print("  " + failure)
        sys.exit(1)
    print("nav_icon_sprite：全部通過")
