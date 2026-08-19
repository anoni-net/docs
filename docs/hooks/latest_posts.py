"""首頁「最新動態」的自動填充。

首頁的 `<!-- latest-posts:N -->` 會在建置時換成 blog/posts 底下最新的 N 篇。

改成生成的理由：原本三語系各維護一份手動清單，2026-05-03 建立、更新兩次之後
就停在 2026-06-13。到 2026-08 為止漏掉 14 篇新文章，首頁最顯眼的位置掛著兩個
月前的資訊，讀者看到會以為站上沒有動靜。維護成本乘以三是它失效的主因，改成
建置時掃描就不會再有這個問題。

三語系共用這一支，各自掃 config['docs_dir'] 底下的 blog/posts。標籤取 front
matter 的第一個 category，各語系的 front matter 本來就是自己的語言，所以標籤
文字不必在這裡維護對照表。需要對照的只有標點、日期格式與顏色 token。

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

ACTION = "var(--accent-action)"

# 三語系的標點、日期格式與顏色 token 都不同，照各自首頁改版前的既有寫法。
# colors 的 key 比對時轉小寫。
LOCALES = {
    "zh-TW": {
        "sep": "：",
        "dash": " - ",
        "date": "{y}/{m}/{d}",
        "colors": {"活動": ACTION, "更新": "#2e7d32"},
        "default_color": "var(--brand-cyan-800)",
    },
    "zh-CN": {
        "sep": "：",
        "dash": " - ",
        "date": "{y}/{m}/{d}",
        "colors": {"活动": ACTION, "更新": "#2e7d32"},
        "default_color": "var(--brand-cyan-800)",
    },
    "en": {
        "sep": ": ",
        "dash": " — ",
        "date": "{y}-{m}-{d}",
        "colors": {
            "event": ACTION,
            "update": "var(--cat-privacy)",
            "updates": "var(--cat-privacy)",
        },
        "default_color": "var(--brand-cyan-600)",
    },
}


def _parse_post(path):
    """回傳 (date, category, title, slug)，格式不合就回 None。"""
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
    categories = meta.get("categories") or []
    category = str(categories[0]).strip() if categories else None
    return date, category, str(title).strip(), path.stem


def on_page_markdown(markdown, page, config, files, **kwargs):
    match = PLACEHOLDER.search(markdown)
    if not match:
        return markdown

    docs_dir = Path(config["docs_dir"])
    locale = LOCALES.get(docs_dir.name)
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
    for date, category, title, slug in posts[:limit]:
        shown = locale["date"].format(y=date.year, m=f"{date.month:02d}", d=f"{date.day:02d}")
        link = f"[{title}](./blog/posts/{slug}.md)"
        if category:
            color = locale["colors"].get(category.lower(), locale["default_color"])
            label = f'`{category}`{{style="color: {color};"}}{locale["sep"]}'
        else:
            label = ""
        lines.append(f'- {label}{link}{locale["dash"]}{shown}')

    body = ("\n" + indent).join(lines)
    return markdown[: match.start()] + body + markdown[match.end() :]
