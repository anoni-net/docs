"""軟體更新日誌首頁的「最近的更新」。

`changelog/index.md` 原本只列十二頁的連結，讀者進來看不出最近有什麼更新、有沒有
需要馬上處理的事，要一頁一頁點進去翻。這支在建置時掃同目錄的各頁，把最近的條目
收成三塊，填進首頁的佔位符：

- `<!-- changelog-digest:filter -->`：依裝置與用途篩選的選項，以及資料截至哪一天
- `<!-- changelog-digest:now -->`：有急迫程度分級的頁面，各取最新一則，只留「立刻」
  與「儘快」
- `<!-- changelog-digest:recent -->`：期間內所有頁面的條目，由新到舊
- `<!-- changelog-latest:<檔名> -->`：接在頁面清單每一項後面，寫出該頁最新的一則

同一份條目另外寫成 RSS，放在首頁旁邊：`feed.xml` 收全部，`feed-<篩選項>.xml` 各收一個
篩選項，`feed-urgent.xml` 只收「立刻」與「儘快」。提供訂閱只做 RSS，不做 email 與網頁
推播，因為那兩種都要網站保存訂閱者資料，而「誰在追哪個工具的安全漏洞」本身就是敏感
名單。RSS 由讀者的閱讀器來抓，網站不知道誰訂了。feed 網址登記在網址合約裡
（tools/check_url_contract.py），拿掉篩選項會讓對應的 feed 消失，那是對訂閱者的破壞性
變更，CI 會擋。

改成生成的理由跟首頁的 latest_posts 一樣，手寫的摘要會過期。changelog 的數字一週
內就可能改好幾次（Windows 2026 年 9 月那則三天內改了兩次），摘要要是手抄，首頁與
內頁很快就對不起來。

條目的格式沿用各頁既有的寫法，不需要另外標記：

- `## 標題` 開一則，下一個非空行是 `> 日期 · 連結`。日期取那一行第一個 ISO 日期。
  GrapheneOS 那一行只有版本號（`2026091900`），改取其中最新的一個換算成日期。
  Android 那一行的日期是修補等級（2026-09-05），公告實際發布會晚幾天，差距不影響排序
- 急迫程度取該則第一個 `urg-tag--*`，發布通道取第一個 `chan-tag--*`，標籤文字照抄
  頁面上的，所以三語系不必在這裡維護對照
- 沒有日期那一行的小節（例如「急迫程度怎麼判斷」）不算條目

各頁的顯示名稱、屬於哪些裝置與用途、分級的判準，寫在各頁 front matter 的 `digest`。
判準要跟著標籤一起露出來，因為六頁的「立刻」意義不同：iOS、macOS、Windows 需要已被
利用的證據，Tails 與 tor daemon 看的是官方的發布形式（見 docs/CHANGELOG_SOURCES.md）。
兩種並排卻不寫判準，讀者會以為嚴重程度相同。

篩選不用 JavaScript。Tor Browser 調到最安全等級會關掉 JavaScript，而這一頁的讀者
正好有很多人在用它。做法是一組 radio 加上 `:has()` 選擇器，選中某個選項就藏起
`data-cl` 不含該 id 的項目。每個選項對應一條 CSS 規則，規則隨選項清單一起由這支產生，
兩邊不會對不上。不支援 `:has()` 的瀏覽器篩選沒有作用，所有項目照常顯示。

「最近」以建置當天為準，網站沒有重新建置的話這一塊不會自己前進，所以輸出裡寫明
資料截至哪一天。預覽時可以用環境變數 CHANGELOG_DIGEST_TODAY=YYYY-MM-DD 固定日期。
"""

from __future__ import annotations

import datetime as dt
import html
import logging
import os
import posixpath
import re
from email.utils import format_datetime
from urllib.parse import quote
from xml.sax.saxutils import escape as xml_escape
from dataclasses import dataclass, field
from pathlib import Path

log = logging.getLogger("mkdocs.hooks.changelog_digest")

PLACEHOLDER = re.compile(r"<!--\s*changelog-(digest|latest):([a-z0-9-]+)\s*-->")
HEADING = re.compile(r"^##\s+(.+?)\s*$", re.MULTILINE)
ISO_DATE = re.compile(r"\b(\d{4})-(\d{2})-(\d{2})\b")
GRAPHENE_VERSION = re.compile(r"\b(20\d{2})(\d{2})(\d{2})\d{2}\b")
URG = re.compile(r'<span class="urg-tag urg-tag--(now|soon|routine)">([^<]+)</span>')
CHAN = re.compile(r'<span class="chan-tag chan-tag--(stable|alpha)">([^<]+)</span>')
FILTER_ID = re.compile(r"^[a-z0-9-]+$")

# 「現在要處理的」只收這兩級，順序也照這個排。
PRESSING = ("now", "soon")

# 全站提到 RSS 的地方前面都放這個圖示，讀者一眼認得出是訂閱。顏色寫在三份 extra.css 的 .rss-icon。
RSS_ICON = ":material-rss-box:{ .rss-icon }"

# 每份 feed 的則數上限。閱讀器只看得到新進的項目，舊的留著只是讓檔案變大。
FEED_ITEMS = 50

# on_page_markdown 算好的 feed，等 on_post_build 再寫進產物。
_feeds: dict[str, str] = {}
_feed_dir: str | None = None


@dataclass
class Entry:
    page: str  # 檔名，不含 .md
    heading: str
    date: dt.date
    urgency: str | None = None  # now / soon / routine
    urgency_label: str | None = None
    channel: str | None = None  # stable / alpha
    channel_label: str | None = None


@dataclass
class PageInfo:
    stem: str
    name: str
    devices: list[str] = field(default_factory=list)
    basis: str | None = None
    audience: str | None = None
    entries: list[Entry] = field(default_factory=list)
    # 一頁收好幾個產品時（瀏覽器頁的 Chrome 與 Firefox），各自是一條線，條目標題以線名開頭
    tracks: list[str] = field(default_factory=list)


def _entry_date(quote_line: str) -> dt.date | None:
    match = ISO_DATE.search(quote_line)
    if match:
        try:
            return dt.date(*map(int, match.groups()))
        except ValueError:
            return None
    dates = []
    for y, m, d in GRAPHENE_VERSION.findall(quote_line):
        try:
            dates.append(dt.date(int(y), int(m), int(d)))
        except ValueError:
            continue
    return max(dates) if dates else None


def parse_entries(stem: str, body: str) -> list[Entry]:
    """把一頁的內文切成條目，由上到下，也就是由新到舊。"""
    heads = list(HEADING.finditer(body))
    entries = []
    for i, head in enumerate(heads):
        end = heads[i + 1].start() if i + 1 < len(heads) else len(body)
        section = body[head.end() : end]
        first = next((line.strip() for line in section.splitlines() if line.strip()), "")
        if not first.startswith(">"):
            continue
        date = _entry_date(first)
        if date is None:
            continue
        entry = Entry(page=stem, heading=head.group(1), date=date)
        urg = URG.search(section)
        if urg:
            entry.urgency, entry.urgency_label = urg.group(1), urg.group(2)
        chan = CHAN.search(section)
        if chan:
            entry.channel, entry.channel_label = chan.group(1), chan.group(2)
        entries.append(entry)
    return entries


def latest(page: PageInfo, track: str | None = None) -> Entry | None:
    """該頁（或該頁某一條線）最新的一則。Alpha 通道跳過，一般讀者要知道的是穩定版到哪一版。"""
    for entry in page.entries:
        if entry.channel == "alpha":
            continue
        if track is None or entry.heading.startswith(track):
            return entry
    return None


def latest_each(page: PageInfo) -> list[Entry]:
    """每條線各自最新的一則，沒有分線的頁面就是整頁最新的一則。

    一頁收兩個產品卻只取整頁最新的一則，會漏掉另一個產品的狀態：瀏覽器頁 2026 年 9 月
    Chrome 是「立刻」、Firefox 是「儘快」，只看最新一則的話 Firefox 就從首頁消失了。
    """
    if not page.tracks:
        entry = latest(page)
        return [entry] if entry else []
    return [e for e in (latest(page, t) for t in page.tracks) if e]


def pressing(pages: list[PageInfo], since: dt.date) -> list[Entry]:
    """有分級的頁面各取最新一則，留下期間內的「立刻」與「儘快」。

    只看最新一則是刻意的。同一頁更新的版本會涵蓋舊版的修補，舊的紅標留著只會讓
    這一塊永遠整片紅色，讀者很快就不看了。
    """
    picked = []
    for page in pages:
        for entry in latest_each(page):
            if entry.urgency in PRESSING and entry.date >= since:
                picked.append(entry)
    picked.sort(key=lambda e: (PRESSING.index(e.urgency), -e.date.toordinal(), e.page))
    return picked


def recent(pages: list[PageInfo], since: dt.date) -> list[Entry]:
    entries = [e for page in pages for e in page.entries if e.date >= since]
    entries.sort(key=lambda e: (-e.date.toordinal(), e.page, e.heading))
    return entries


def _title(entry: Entry, page: PageInfo) -> str:
    # 標題已經帶著產品名稱（Tor Browser 15.0.23、iOS 27）就不再加前綴，
    # 只寫月份的（2026 年 9 月）或名稱不同的（tor 0.4.9.13）才補上頁面名稱。
    if page.name.lower() in entry.heading.lower():
        return entry.heading
    # 分線的頁面，標題本身就以產品名開頭（Chrome 2026 年 9 月）
    if any(entry.heading.startswith(t) for t in page.tracks):
        return entry.heading
    return f"{page.name} · {entry.heading}"


def _link(entry: Entry, page: PageInfo, slugify) -> str:
    text = _title(entry, page).replace("[", r"\[").replace("]", r"\]")
    return f"[{text}](./{entry.page}.md#{slugify(entry.heading)})"


def _tag(entry: Entry) -> str:
    if entry.urgency:
        return f'<span class="urg-tag urg-tag--{entry.urgency}">{html.escape(entry.urgency_label)}</span>'
    if entry.channel:
        return f'<span class="chan-tag chan-tag--{entry.channel}">{html.escape(entry.channel_label)}</span>'
    return ""


def _date(date: dt.date, fmt: str) -> str:
    return fmt.format(y=date.year, m=f"{date.month:02d}", d=f"{date.day:02d}")


def _devices(page: PageInfo) -> str:
    return html.escape(" ".join(page.devices))


def _empty_items(items_by_filter: dict[str, int], filter_ids: list[str], message: str) -> str:
    """篩選之後一項都不剩的選項，給一列說明，免得讀者以為頁面壞了。

    哪些選項會空在建置時就算得出來，把它們的 id 寫進這一列的 data-cl，沿用項目的
    篩選規則就只在那幾個選項下出現。「全部」底下由 CSS 另外藏起來。
    """
    empty = [fid for fid in filter_ids if items_by_filter.get(fid, 0) == 0]
    if not empty:
        return ""
    return f'<li class="cl-empty" data-cl="{html.escape(" ".join(empty))}">{html.escape(message)}</li>'


def _count_by_filter(entries: list[Entry], pages: dict[str, PageInfo]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for entry in entries:
        for fid in pages[entry.page].devices:
            counts[fid] = counts.get(fid, 0) + 1
    return counts


def render_filter(cfg: dict, today: dt.date) -> str:
    filters = cfg["filters"]
    rules = "\n".join(
        f'.md-typeset:has(#cl-f-{f["id"]}:checked) .cl-list [data-cl]:not([data-cl~="{f["id"]}"]) {{ display: none; }}'
        for f in filters
    )
    options = [
        '<input type="radio" name="cl-filter" id="cl-f-all" checked>'
        f'<label for="cl-f-all">{html.escape(cfg["all"])}</label>'
    ]
    for f in filters:
        options.append(
            f'<input type="radio" name="cl-filter" id="cl-f-{f["id"]}">'
            f'<label for="cl-f-{f["id"]}">{html.escape(f["label"])}</label>'
        )
    # 訂閱連結跟著選項切換，一次只露出目前選項那一份。預設（含不支援 :has() 的瀏覽器）
    # 只露出「全部」，跟篩選沒有作用時看到的內容一致。
    feed_rules = "\n".join(
        f'.md-typeset:has(#cl-f-{f["id"]}:checked) .cl-feed [data-feed="all"] {{ display: none; }}\n'
        f'.md-typeset:has(#cl-f-{f["id"]}:checked) .cl-feed [data-feed="{f["id"]}"] {{ display: inline; }}'
        for f in filters
    )
    links = [f'<a data-feed="all" href="{feed_name(None)}">'
             f'{html.escape(cfg["subscribe"].format(label=cfg["all"]))}</a>']
    for f in filters:
        links.append(f'<a data-feed="{f["id"]}" href="{feed_name(f["id"])}">'
                     f'{html.escape(cfg["subscribe"].format(label=f["label"]))}</a>')
    urgent = f'<a href="{feed_name("urgent")}">{html.escape(cfg["subscribe_urgent"])}</a>'
    asof = html.escape(cfg["asof"].format(date=_date(today, cfg["date_format"])))
    return (
        f"<style>\n{rules}\n{feed_rules}\n</style>\n\n"
        f'<div class="cl-filter" role="radiogroup" aria-label="{html.escape(cfg["filter_label"])}">'
        + "".join(options)
        + f'</div>\n\n<p class="cl-asof">{asof}</p>'
        # markdown="span" 讓 md_in_html 處理圖示的 shortcode，連結本身是 HTML 不受影響
        + f'\n\n<p class="cl-feed" markdown="span">{RSS_ICON} {html.escape(cfg["feed_label"])}{"".join(links)} · {urgent}</p>'
    )


def render_now(entries: list[Entry], pages: dict[str, PageInfo], cfg: dict, slugify) -> str:
    if not entries:
        return f'<p class="cl-none">{html.escape(cfg["empty_now"])}</p>'
    items = []
    for entry in entries:
        page = pages[entry.page]
        meta = [_date(entry.date, cfg["date_format"])]
        if page.basis:
            meta.append(page.basis)
        if page.audience:
            meta.append(page.audience)
        meta_html = html.escape(" · ".join(meta))
        items.append(
            f'<li data-cl="{_devices(page)}" markdown="span">{_tag(entry)}{_link(entry, page, slugify)}'
            f'<span class="cl-meta">{meta_html}</span></li>'
        )
    ids = [f["id"] for f in cfg["filters"]]
    items.append(_empty_items(_count_by_filter(entries, pages), ids, cfg["empty_filtered"]))
    return '<ul class="cl-list cl-now" markdown="block">\n' + "\n".join(i for i in items if i) + "\n</ul>"


def render_recent(entries: list[Entry], pages: dict[str, PageInfo], cfg: dict, slugify) -> str:
    if not entries:
        return f'<p class="cl-none">{html.escape(cfg["empty_recent"])}</p>'
    items = []
    for entry in entries:
        page = pages[entry.page]
        shown = _date(entry.date, cfg["date_format"])
        items.append(
            f'<li data-cl="{_devices(page)}" markdown="span">'
            f'<time datetime="{entry.date.isoformat()}">{shown}</time>'
            f'<span class="cl-item">{_tag(entry)}{_link(entry, page, slugify)}</span></li>'
        )
    ids = [f["id"] for f in cfg["filters"]]
    items.append(_empty_items(_count_by_filter(entries, pages), ids, cfg["empty_filtered"]))
    return '<ul class="cl-list cl-recent" markdown="block">\n' + "\n".join(i for i in items if i) + "\n</ul>"


def render_latest(page: PageInfo | None, cfg: dict) -> str:
    if page is None:
        return ""
    # 接在該頁的連結後面，讀者已經知道是哪一頁，不必再加頁面名稱當前綴。分線的頁面每條線一行
    spans = []
    for entry in latest_each(page):
        text = cfg["latest"].format(title=entry.heading, date=_date(entry.date, cfg["date_format"]))
        spans.append(f'<span class="cl-latest">{html.escape(text)}</span>')
    return "".join(spans)


def feed_name(key: str | None) -> str:
    return "feed.xml" if key is None else f"feed-{key}.xml"


def feed_entries(pages: list[PageInfo], key: str | None) -> list[Entry]:
    """某份 feed 要收的條目，由新到舊，最多 FEED_ITEMS 則。

    `urgent` 收所有標了「立刻」或「儘快」的條目，不只每頁最新一則。訂閱的人要的是
    「出現新的急迫條目時通知我」，首頁那一塊則是「現在還沒處理完的有哪些」。
    """
    if key == "urgent":
        chosen = [e for p in pages for e in p.entries if e.urgency in PRESSING]
    elif key is None:
        chosen = [e for p in pages for e in p.entries]
    else:
        chosen = [e for p in pages if key in p.devices for e in p.entries]
    chosen.sort(key=lambda e: (-e.date.toordinal(), e.page, e.heading))
    return chosen[:FEED_ITEMS]


def render_feed(*, title: str, description: str, link: str, self_link: str, language: str,
                entries: list[Entry], pages: dict[str, PageInfo], entry_url, cfg: dict,
                built: dt.datetime) -> str:
    """寫成 RSS 2.0。站上 blog 的 feed 也是 RSS 2.0，閱讀器那邊的表現一致。"""
    items = []
    for entry in entries:
        page = pages[entry.page]
        label = entry.urgency_label or entry.channel_label
        item_title = f"{label} · {_title(entry, page)}" if label else _title(entry, page)
        meta = [_date(entry.date, cfg["date_format"])]
        if entry.urgency and page.basis:
            meta.append(page.basis)
        if page.audience:
            meta.append(page.audience)
        url = entry_url(entry)
        # guid 用固定格式而不是網址，網站換主機（onion、IPFS）時閱讀器不會把同一則當成新的
        guid = f"anoni-changelog:{entry.page}:{entry.date.isoformat()}:{entry.heading}"
        pub = dt.datetime.combine(entry.date, dt.time(0, 0), tzinfo=dt.timezone.utc)
        items.append(
            "    <item>\n"
            f"      <title>{xml_escape(item_title)}</title>\n"
            f"      <link>{xml_escape(url)}</link>\n"
            f'      <guid isPermaLink="false">{xml_escape(guid)}</guid>\n'
            f"      <pubDate>{format_datetime(pub)}</pubDate>\n"
            f"      <description>{xml_escape(' · '.join(meta))}</description>\n"
            "    </item>"
        )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
        "  <channel>\n"
        f"    <title>{xml_escape(title)}</title>\n"
        f"    <link>{xml_escape(link)}</link>\n"
        f'    <atom:link href="{xml_escape(self_link)}" rel="self" type="application/rss+xml"/>\n'
        f"    <description>{xml_escape(description)}</description>\n"
        f"    <language>{xml_escape(language)}</language>\n"
        f"    <lastBuildDate>{format_datetime(built)}</lastBuildDate>\n"
        + "".join(i + "\n" for i in items)
        + "  </channel>\n</rss>\n"
    )


def build_feeds(pages: list[PageInfo], cfg: dict, base_url: str, page_url, language: str,
                built: dt.datetime, slugify) -> dict[str, str]:
    """回 `檔名 -> RSS 內容`。base_url 是首頁的絕對網址，page_url 把檔名換成頁面的絕對網址。"""
    by_stem = {p.stem: p for p in pages}

    def entry_url(entry):
        return page_url(entry.page) + "#" + quote(slugify(entry.heading), safe="-_.")

    feeds = {}
    keys = [(None, cfg["all"])] + [(f["id"], f["label"]) for f in cfg["filters"]]
    keys.append(("urgent", cfg["feed_urgent"]))
    for key, label in keys:
        name = feed_name(key)
        feeds[name] = render_feed(
            title=cfg["feed_title"].format(label=label),
            description=cfg["feed_description"],
            link=base_url,
            self_link=base_url + name,
            language=language,
            entries=feed_entries(pages, key),
            pages=by_stem,
            entry_url=entry_url,
            cfg=cfg,
            built=built,
        )
    return feeds


def _split_front_matter(text: str) -> tuple[dict, str]:
    import yaml  # 延後載入，tools/ 的測試只測純邏輯，不需要裝 PyYAML

    if not text.startswith("---"):
        return {}, text
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text
    try:
        meta = yaml.safe_load(parts[1]) or {}
    except yaml.YAMLError:
        return {}, text
    return (meta if isinstance(meta, dict) else {}), parts[2]


def load_pages(directory: Path, filter_ids: set[str]) -> list[PageInfo]:
    pages = []
    for path in sorted(directory.glob("*.md")):
        if path.stem == "index":
            continue
        meta, body = _split_front_matter(path.read_text(encoding="utf-8"))
        digest = meta.get("digest")
        if not isinstance(digest, dict) or not digest.get("name"):
            # 新增一頁卻沒寫 digest 的話它不會出現在首頁，這種漏法沒有別的徵兆，
            # 所以用 warning，strict 建置會因此失敗。
            log.warning("changelog_digest：%s 的 front matter 沒有 digest.name", path.name)
            continue
        devices = [str(d) for d in (digest.get("devices") or [])]
        unknown = [d for d in devices if d not in filter_ids]
        if unknown:
            log.warning("changelog_digest：%s 的 devices 有未定義的篩選項 %s", path.name, unknown)
        pages.append(
            PageInfo(
                stem=path.stem,
                name=str(digest["name"]),
                devices=devices,
                basis=digest.get("basis"),
                audience=digest.get("audience"),
                entries=parse_entries(path.stem, body),
                tracks=[str(t) for t in (digest.get("tracks") or [])],
            )
        )
    return pages


REQUIRED = ("days", "date_format", "asof", "filter_label", "all", "latest",
            "empty_now", "empty_recent", "empty_filtered", "filters",
            "subscribe", "subscribe_urgent", "feed_label", "feed_title", "feed_description",
            "feed_urgent")


def _today() -> dt.date:
    override = os.environ.get("CHANGELOG_DIGEST_TODAY")
    return dt.date.fromisoformat(override) if override else dt.date.today()


def _slugify(config):
    """跟 toc 用同一個 slugify，錨點才對得上。設定裡沒有就用 toc 的預設。"""
    toc = config["mdx_configs"].get("toc") or {}
    func = toc.get("slugify")
    if func is None:
        from markdown.extensions.toc import slugify as func
    separator = toc.get("separator") or "-"
    return lambda text: func(text, separator)


def on_page_markdown(markdown, page, config, files, **kwargs):
    if not PLACEHOLDER.search(markdown):
        return markdown

    cfg = page.meta.get("changelog_digest")
    missing = [k for k in REQUIRED if not isinstance(cfg, dict) or k not in cfg]
    if missing:
        log.warning("changelog_digest：%s 的 front matter 缺少 changelog_digest.%s，佔位符保持原樣",
                    page.file.src_uri, "、".join(missing))
        return markdown
    for f in cfg["filters"]:
        if not FILTER_ID.match(str(f.get("id", ""))) or f.get("id") in ("all", "urgent"):
            # all 與 urgent 已經是「全部」與急迫條目那兩份 feed 的名字
            log.warning("changelog_digest：篩選項 id %r 只能用小寫英數與連字號，且不能是 all 或 urgent",
                        f.get("id"))
            return markdown

    directory = Path(page.file.abs_src_path).parent
    pages = load_pages(directory, {f["id"] for f in cfg["filters"]})
    by_stem = {p.stem: p for p in pages}
    today = _today()
    since = today - dt.timedelta(days=int(cfg["days"]))
    slugify = _slugify(config)

    global _feed_dir
    here = posixpath.dirname(page.file.src_uri)
    site_url = config["site_url"] or "/"
    if not site_url.endswith("/"):
        site_url += "/"

    def page_url(stem):
        target = files.get_file_from_path(posixpath.join(here, f"{stem}.md"))
        return site_url + (target.url if target else f"{here}/{stem}/")

    _feeds.clear()
    _feeds.update(build_feeds(
        pages, cfg, site_url + page.url, page_url, config["theme"]["language"],
        dt.datetime.now(dt.timezone.utc).replace(microsecond=0), slugify,
    ))
    _feed_dir = here

    def replace(match):
        kind, name = match.groups()
        if kind == "latest":
            if name not in by_stem:
                log.warning("changelog_digest：changelog-latest:%s 找不到對應的頁面", name)
            return render_latest(by_stem.get(name), cfg)
        if name == "filter":
            return render_filter(cfg, today)
        if name == "now":
            return render_now(pressing(pages, since), by_stem, cfg, slugify)
        if name == "recent":
            return render_recent(recent(pages, since), by_stem, cfg, slugify)
        log.warning("changelog_digest：不認得的佔位符 changelog-digest:%s", name)
        return match.group(0)

    return PLACEHOLDER.sub(replace, markdown)


def on_pre_build(config, **kwargs):
    # serve 模式每次重建都會重跑，上一輪算好的 feed 不能留到這一輪
    global _feed_dir
    _feed_dir = None
    _feeds.clear()


def on_post_build(config, **kwargs):
    if _feed_dir is None:
        return
    out = Path(config["site_dir"]) / _feed_dir
    out.mkdir(parents=True, exist_ok=True)
    for name, body in _feeds.items():
        (out / name).write_text(body, encoding="utf-8")
