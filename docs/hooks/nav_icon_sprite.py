"""把導覽列上每一頁的圖示收成一份外部 SVG sprite，頁面裡改用 `<use>` 參照。

文章 front matter 的 `icon:` 會被 Material 以 inline SVG 畫進導覽列，而導覽列在每一頁
都是整棵樹，於是每一頁都揹著整站所有頁面的圖示。2026-09 量 zh-TW 318 頁，拿掉這批
圖示之後 HTML 壓縮後從 17.3 MB 降到 10.8 MB，未壓縮從 71.8 MB 降到 52.9 MB。站上的
讀者多半在行動網路上，離線閱讀又是整頁 HTML 存進裝置（全部存到裝置約 76 MB），這批
重複的圖示是 HTML 裡最大的一塊。

做法是不動樣板，建置時處理：

- `on_env` 讀每一頁的 front matter，把用到的圖示從 theme 的 `.icons/` 讀出來，組成
  一份 sprite，檔名帶內容雜湊（`assets/nav-icons.<hash>.svg`）。圖示換了檔名就換，
  service worker 與 CDN 的舊副本不會冒充新的
- `on_post_page` 把導覽連結（`md-nav__link`、`md-tabs__link`）裡的 inline SVG 換成
  `<svg ...><use href=".../nav-icons.<hash>.svg#id"></use></svg>`。外層 `<svg>` 的開頭
  標籤原封不動，theme 的 CSS 選擇器、尺寸與顏色繼承都跟原本一樣
- `on_post_build` 把 sprite 寫進 site_dir

不覆寫 `partials/nav-item.html`，因為 Material for MkDocs 2026-11-05 停止維護，覆寫的
樣板越多，換框架時要處理的就越多。這支只認輸出的 HTML 形狀，對不上的圖示保留 inline
（寧可省得少，也不要畫出空白的圖示），數量印在建置 log。

離線：`offline_index.py` 把 `<use href>` 也算成頁面資產，sprite 每一頁都引用，會落進
索引的 `shell`，由 service worker 跟著每頁共用的樣式一起預快取。
"""

import hashlib
import logging
import posixpath
import re
from pathlib import Path
from urllib.parse import urlsplit

log = logging.getLogger("mkdocs.hooks.nav_icon_sprite")

SPRITE_DIR = "assets/"
SPRITE_PREFIX = "nav-icons."

# 導覽連結的開頭標籤，後面緊接著圖示的 <svg>。Material 用 <a>、<label> 與 <div>
# 三種標籤畫連結（一般頁面、可展開的章節、帶索引頁的章節）。
RE_NAV_ICON = re.compile(
    r'(<(?:a|label|div)\b[^>]*\bclass="md-(?:nav|tabs)__link\b[^"]*"[^>]*>\s*)'
    r"(<svg\b[^>]*>)(.*?)</svg>",
    re.S,
)
RE_VIEWBOX = re.compile(r'\bviewBox="([^"]+)"')
RE_SVG = re.compile(r"^\s*(<svg\b[^>]*>)(.*)</svg>\s*$", re.S)

# 模組層級的狀態。mkdocs 一次執行只建一個語系，三語系是三個 process，不會互相污染。
# inner 內容 -> symbol id
_symbols = {}
# 寫進 site_dir 的 sprite 內容與相對路徑
_sprite = {"text": None, "path": None}
_stats = {"replaced": 0, "kept": 0}


def symbol_id(name):
    """圖示名稱換成可以當 XML id 的字串，material/shield-lock 變成 material--shield-lock。"""
    return re.sub(r"[^A-Za-z0-9_-]", "-", name.replace("/", "--"))


def build_sprite(icons):
    """icons 是 {圖示名稱: 原始 SVG 內容}，回 (sprite 文字, {inner 內容: symbol id})。

    symbol 只放內層，外層的屬性（fill、stroke 之類）留在頁面上那個 <svg>，靠繼承
    傳進 <use> 的內容，跟原本 inline 時的算法一樣。沒有 viewBox 的圖示不收，<use>
    畫不出正確的比例。
    """
    symbols = []
    mapping = {}
    for name in sorted(icons):
        match = RE_SVG.match(icons[name])
        if not match:
            continue
        viewbox = RE_VIEWBOX.search(match.group(1))
        if not viewbox:
            continue
        inner = match.group(2)
        if inner in mapping:
            continue
        ident = symbol_id(name)
        mapping[inner] = ident
        symbols.append(
            f'<symbol id="{ident}" viewBox="{viewbox.group(1)}">{inner}</symbol>'
        )
    if not symbols:
        return None, {}
    text = '<svg xmlns="http://www.w3.org/2000/svg">' + "".join(symbols) + "</svg>"
    return text, mapping


def sprite_path(text):
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()[:8]
    return SPRITE_DIR + SPRITE_PREFIX + digest + ".svg"


def rewrite(html, href, mapping, stats=None):
    """把導覽連結裡認得的圖示換成 <use>。href 是從這一頁指到 sprite 的相對網址。"""

    def swap(match):
        inner = match.group(3)
        ident = mapping.get(inner)
        if ident is None:
            if stats is not None:
                stats["kept"] += 1
            return match.group(0)
        if stats is not None:
            stats["replaced"] += 1
        return f'{match.group(1)}{match.group(2)}<use href="{href}#{ident}"></use></svg>'

    return RE_NAV_ICON.sub(swap, html)


def _front_matter_icons(files):
    # mkdocs 在用到時才 import。tools/test_nav_icon_sprite.py 在沒有裝 mkdocs 的 CI
    # 環境（tools-tests.yml）裡測底下那幾支純函式。
    from mkdocs.utils.meta import get_data

    names = set()
    for file in files:
        src = getattr(file, "abs_src_path", None)
        if not src or not str(src).endswith(".md"):
            continue
        try:
            _, meta = get_data(Path(src).read_text(encoding="utf-8"))
        except (OSError, UnicodeDecodeError):
            continue
        icon = meta.get("icon") if isinstance(meta, dict) else None
        if isinstance(icon, str) and icon:
            names.add(icon)
    return names


def on_env(env, config, files, **kwargs):
    _symbols.clear()
    _sprite["text"] = None
    _sprite["path"] = None
    _stats["replaced"] = 0
    _stats["kept"] = 0
    icons = {}
    for name in _front_matter_icons(files):
        try:
            source, _, _ = env.loader.get_source(env, ".icons/" + name + ".svg")
        except Exception:  # noqa: BLE001  找不到的圖示 Material 自己會報錯，這裡略過
            continue
        icons[name] = source
    text, mapping = build_sprite(icons)
    if text is None:
        return env
    _symbols.update(mapping)
    _sprite["text"] = text
    _sprite["path"] = sprite_path(text)
    return env


def on_post_page(output, page, config, **kwargs):
    if not _sprite["path"]:
        return output
    from mkdocs.utils import get_relative_url

    # get_relative_url 對目錄形狀的網址算的是相對於該目錄，正好是瀏覽器解析的基準
    href = get_relative_url(_sprite["path"], page.url or ".")
    return rewrite(output, href, _symbols, _stats)


def on_post_template(output_content, template_name, config, **kwargs):
    """404 頁是靜態樣板，不經過 on_post_page。

    它會出現在任何一個不存在的網址底下，相對路徑解析出來的位置每次都不同，所以改用
    site_url 的路徑拼出絕對網址。其他靜態樣板（sitemap 之類）沒有導覽列，對不到東西。
    """
    if not _sprite["path"] or not template_name.endswith(".html"):
        return output_content
    base = urlsplit(config.get("site_url") or "/").path or "/"
    if not base.endswith("/"):
        base += "/"
    return rewrite(output_content, base + _sprite["path"], _symbols, _stats)


def on_post_build(config, **kwargs):
    if not _sprite["path"]:
        return
    target = Path(config["site_dir"]) / _sprite["path"]
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(_sprite["text"], encoding="utf-8")
    log.info(
        "nav_icon_sprite: %s 收 %d 個圖示，換掉 %d 處 inline SVG，保留 %d 處",
        posixpath.basename(_sprite["path"]),
        len(_symbols),
        _stats["replaced"],
        _stats["kept"],
    )
