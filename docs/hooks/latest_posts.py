"""首頁「最新動態」的自動填充。

首頁的 `<!-- latest-posts:N -->` 會在建置時換成 blog/posts 底下最新的 N 篇。

改成生成的理由：原本三語系各維護一份手動清單，2026-05-03 建立、更新兩次之後
就停在 2026-06-13。到 2026-08 為止漏掉 14 篇新文章，首頁最顯眼的位置掛著兩個
月前的資訊，讀者看到會以為站上沒有動靜。維護成本乘以三是它失效的主因，改成
建置時掃描就不會再有這個問題。

三語系共用這一支，各自掃 config['docs_dir'] 底下的 blog/posts。標籤取 front
matter 的 categories 裡第一個對得到顏色的那一個，挑法見 _pick_category。各語系
的 front matter 本來就是自己的語言，所以標籤文字不必在這裡維護對照表。需要對照
的只有標點、日期格式，以及分類到顏色 class 的 CATEGORY_CLASSES。

只掃 blog/posts。改版前的清單混進過 activity/ 底下的活動頁（COSCUP 徵稿），
那類頁面現在不會自動出現，需要放上首頁的話照慣例也發一篇 blog post。
"""

import datetime as dt
import logging
import re
from pathlib import Path

import yaml

log = logging.getLogger("mkdocs.hooks.latest_posts")

PLACEHOLDER = re.compile(r"<!--\s*latest-posts:(\d+)\s*-->")
# 站上幾乎每個 H1 都以 Material 圖示開頭（# :material-lock-outline: 標題），
# 圖示不是標題的一部分，取標題時要先剝掉。
ICON = re.compile(r":[a-z0-9_-]+:\s*")
H1 = re.compile(r"^#\s+(.+)$", re.MULTILINE)

# 標籤顏色走 CSS class，不寫 inline style。理由是 inline 的色值沒辦法跟著亮暗
# 模式換，改版前六個色值裡每一個都在其中一個模式低於 WCAG AA 4.5（例如預設的
# --brand-cyan-800 在 slate 只有 2.80）。色值與兩個模式的對比數字寫在三份
# stylesheets/extra.css 的 .post-tag 區塊。

# 分類到 class 後綴的對照。三語系是同一套語意，同一篇文章在三邊的分類本來就
# 對得起來（社群 / 社区 / Community）。key 比對時轉小寫，所以英文那組全部小寫。
# 對不到的分類走 .post-tag 自己的中性色，不必在這裡窮舉所有主題分類。
CATEGORY_CLASSES = {
    "zh-TW": {"更新": "update", "活動": "event", "社群": "community", "公告": "news", "技術": "tech"},
    "zh-CN": {"更新": "update", "活动": "event", "社区": "community", "公告": "news", "技术": "tech"},
    "en": {
        "update": "update",
        "updates": "update",
        "event": "event",
        "events": "event",
        "community": "community",
        "news": "news",
        "technology": "tech",
    },
}

# 三語系的標點與日期格式不同，照各自首頁改版前的既有寫法。
LOCALES = {
    "zh-TW": {"sep": "：", "dash": " - ", "date": "{y}/{m}/{d}"},
    "zh-CN": {"sep": "：", "dash": " - ", "date": "{y}/{m}/{d}"},
    "en": {"sep": ": ", "dash": " — ", "date": "{y}-{m}-{d}"},
}


def _parse_post(path):
    """回傳 (date, categories, title, slug)，格式不合就回 None。"""
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return None
    parts = text.split("---", 2)
    if len(parts) < 3:
        return None
    try:
        meta = yaml.safe_load(parts[1]) or {}
    except yaml.YAMLError:
        return None
    if not isinstance(meta, dict):
        return None
    date = meta.get("date")
    # Material 的 blog plugin 也接受 date: {created: ...}，站上目前都是純日期，
    # 真的出現 dict 就跳過那篇，不要讓首頁排出沒有日期的項目。
    if not isinstance(date, dt.date):
        return None
    title = meta.get("title")
    if not title:
        match = H1.search(parts[2])
        title = ICON.sub("", match.group(1)).strip() if match else path.stem
    categories = [str(c).strip() for c in (meta.get("categories") or []) if str(c).strip()]
    return date, categories, str(title).strip(), path.stem


# 同一篇文章掛得到多個分類時的挑選順序，愈前面愈優先。社群排最後是因為它涵蓋
# 面最廣，2026-09 的五篇裡有四篇都掛著它，固定取 categories[0] 的話首頁整排都
# 是同一個顏色，標籤等於沒有在分類。把它讓給比較具體的那幾個，讀者掃過去才知道
# 每一列是什麼性質的內容。
CATEGORY_PRIORITY = ("event", "update", "news", "tech", "community")


def _pick_category(categories, classes):
    """挑出要顯示的分類與它的 class 後綴。

    不固定取 categories[0]，改成在對得到顏色的分類裡照 CATEGORY_PRIORITY 挑。
    例如 `社群 / 技術 / 公告` 顯示公告，`社群 / 活動` 顯示活動。

    整串都對不到顏色時回第一個，標籤照樣出現，只是走中性色。
    """
    matched = {}
    for category in categories:
        suffix = classes.get(category.lower())
        if suffix and suffix not in matched:
            matched[suffix] = category
    for suffix in CATEGORY_PRIORITY:
        if suffix in matched:
            return matched[suffix], suffix
    return (categories[0], None) if categories else (None, None)


def on_page_markdown(markdown, page, config, files, **kwargs):
    match = PLACEHOLDER.search(markdown)
    if not match:
        return markdown

    docs_dir = Path(config["docs_dir"])
    locale = LOCALES.get(docs_dir.name)
    classes = CATEGORY_CLASSES.get(docs_dir.name, {})
    if locale is None:
        # strict 模式下 warning 會讓建置失敗，這裡刻意如此：語系設定漏了的話，
        # 首頁會留下一個裸露的 HTML 註解，不該悄悄上線。
        log.warning("latest_posts：未知的語系目錄 %s，佔位符保持原樣", docs_dir.name)
        return markdown

    posts_dir = docs_dir / "blog" / "posts"
    posts = []
    for path in sorted(posts_dir.glob("*.md")):
        parsed = _parse_post(path)
        if parsed:
            posts.append(parsed)
    if not posts:
        log.warning("latest_posts：%s 底下找不到可用的文章", posts_dir)
        return markdown

    # 同一天多篇時用檔名倒序當次要排序，讓輸出穩定，不會因檔案系統順序而變動。
    posts.sort(key=lambda p: (p[0], p[3]), reverse=True)

    limit = int(match.group(1))
    line_start = markdown.rfind("\n", 0, match.start()) + 1
    indent = markdown[line_start:match.start()]

    lines = []
    for date, categories, title, slug in posts[:limit]:
        shown = locale["date"].format(y=date.year, m=f"{date.month:02d}", d=f"{date.day:02d}")
        link = f"[{title}](./blog/posts/{slug}.md)"
        category, suffix = _pick_category(categories, classes)
        if category:
            names = f".post-tag .post-tag--{suffix}" if suffix else ".post-tag"
            label = f'`{category}`{{{names}}}{locale["sep"]}'
        else:
            label = ""
        lines.append(f'- {label}{link}{locale["dash"]}{shown}')

    body = ("\n" + indent).join(lines)
    return markdown[: match.start()] + body + markdown[match.end() :]
