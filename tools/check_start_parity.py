#!/usr/bin/env python3
r"""檢查 docs/<lang>/start/ 三個語系的對齊，守三件建置擋不到的事。

=== 為什麼需要這支 ===

start/ 是依身分的起步入口，整區只做聚合，每一頁的內容幾乎都是連往別頁的連結。
它有三種壞法，三個語系各自 sh run.sh 都會是綠的，紅不起來：

1. 三語系的檔名清單不一致

   docs/overrides/partials/hreflang_alternate_links.html 用 base ~ page.url 無條件
   替每一頁產生三個語系的 alternate 連結，不看對面的檔案存不存在。zh-CN 少寫一頁，
   zh-TW 那一頁的 hreflang 與語言選單照樣指過去，讀者按下切換就是 404。頁首那幾個
   連結是搜尋引擎用來組 hreflang cluster 的，指到 404 也一起餵給它們。

2. 頁面沒有被對應的 mkdocs*.yml 列進 nav

   mkdocs 對「檔案存在但不在 nav」的等級是 INFO，strict 也不擋。頁面建得出來、
   網址打得開，只是側邊欄與上一頁下一頁都沒有它，讀者只能靠搜尋撞到。

3. 章節錨點斷掉

   mkdocs.yml 沒有寫 validation，預設的 links.anchors 是 20（INFO）。實測把
   docs/zh-TW/start/media.md 的 #媒體側的紀錄 改成一個不存在的錨點，sh run.sh
   照樣 Documentation built，連一句警告都沒有。

   而 media.md 與 independent-journalist.md 三分之一的連結都指向
   scenarios/journalist.md 的章節錨點，那一篇改個小標就會整批斷掉，斷了以後讀者
   點進去落在文章開頭，看起來像是連結沒問題，只是「跳錯地方」。

=== 怎麼驗 ===

全部只解析 Markdown 原始檔，不需要建置產物，PR 階段就能跑完。

錨點那一項要自己算 slug。三個語系的 mkdocs 設定都是
`slugify: !!python/object/apply:pymdownx.slugs.slugify {}`，也就是預設參數：大小寫
不變、移除 [^\w\- ] 之外的字元、空白轉 sep。這支複製同一套規則，SLUG_SELFTEST 用
實際站上算過的幾組標題把它釘住，pymdown-extensions 換行為時這裡會先紅。

分級：檔名清單、nav、錨點是 error，會讓這支回 exit 1。h2 骨架的差異只提醒，
在地化本來就可能刻意多寫一節（zh-CN 的 start/index.md 就多了一節講地區差異）。

用法：
    python3 tools/check_start_parity.py
"""

import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
DOCS = HERE.parent / "docs"

# zh-TW 是基準語系，另外兩個跟它比。順序影響的只有報告的呈現。
BASE_LANG = "zh-TW"
LANGS = ["zh-TW", "zh-CN", "en"]
CONFIGS = {"zh-TW": "mkdocs.yml", "zh-CN": "mkdocs_cn.yml", "en": "mkdocs_en.yml"}

SECTION = "start"

RE_TAGS = re.compile(r"</?[^>]*>")
RE_INVALID_SLUG_CHAR = re.compile(r"[^\w\- ]", re.UNICODE)
RE_SEP = re.compile(r" ")
# :material-account-group: 這種 icon 在渲染後是一個 <svg>，被 RE_TAGS 清掉。這支只
# 看得到 Markdown 原始碼，所以先自己拿掉，否則會把冒號之間那串算進 slug。
RE_EMOJI_SHORTHAND = re.compile(r":[a-z0-9_+-]+:", re.IGNORECASE)
RE_HEADING = re.compile(r"^(#{1,6})\s+(.*?)\s*$", re.M)
# ](../a/b.md#anchor) 與 ](./a.md)，只取站內的相對連結
RE_LINK = re.compile(r"\]\((\.{1,2}/[^)\s]+)\)")
# 連結加上後面那句說明。start/ 的寫法是 [文字](路徑)：說明，說明講的是目標頁有什麼。
RE_CLAIM = re.compile(r"\[([^\]]+)\]\((\.\./[^)#]+\.md)\)([^\n]*)")
RE_FRONTMATTER = re.compile(r"^---\n.*?\n---\n", re.S)


def slugify(text: str) -> str:
    """複製 pymdownx.slugs.slugify() 預設參數的行為。"""
    text = RE_EMOJI_SHORTHAND.sub("", text)
    slug = RE_INVALID_SLUG_CHAR.sub("", RE_TAGS.sub("", text)).strip()
    return RE_SEP.sub("-", slug)


# 站上實際算出來的幾組，把 slugify 釘住。中文原樣保留、英文保留大小寫、標點消失、
# 空白轉連字號，四種行為各有一例。
SLUG_SELFTEST = [
    ("媒體側的紀錄", "媒體側的紀錄"),
    ("去除 metadata", "去除-metadata"),
    ("First contact", "First-contact"),
    ("Sources who don't use these tools", "Sources-who-dont-use-these-tools"),
    ("Consent, and what the source actually agreed to",
     "Consent-and-what-the-source-actually-agreed-to"),
]


def headings(path: pathlib.Path) -> list[tuple[int, str]]:
    """回傳 [(層級, 標題原文), ...]，跳過 code fence 裡的 #。"""
    out = []
    in_fence = False
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.lstrip().startswith("```"):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        m = RE_HEADING.match(line)
        if m:
            out.append((len(m.group(1)), m.group(2)))
    return out


def anchors_of(path: pathlib.Path) -> set[str]:
    return {slugify(text) for _, text in headings(path)}


def start_pages(lang: str) -> dict[str, pathlib.Path]:
    d = DOCS / lang / SECTION
    if not d.is_dir():
        return {}
    return {p.name: p for p in sorted(d.glob("*.md"))}


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []

    for text, expected in SLUG_SELFTEST:
        got = slugify(text)
        if got != expected:
            errors.append(
                f"slugify 自我測試失敗：{text!r} 應為 {expected!r}，實際 {got!r}。"
                "pymdown-extensions 的行為可能變了，先確認再改這支"
            )
    if errors:
        print("\n".join(f"  - {e}" for e in errors))
        return 1

    pages = {lang: start_pages(lang) for lang in LANGS}
    missing_section = [lang for lang in LANGS if not pages[lang]]
    if missing_section:
        print(f"  找不到 docs/{{{','.join(missing_section)}}}/{SECTION}/，跳過檢查。")
        return 0

    # 一、三語系的檔名清單要一致
    base_names = set(pages[BASE_LANG])
    for lang in LANGS:
        if lang == BASE_LANG:
            continue
        only_base = sorted(base_names - set(pages[lang]))
        only_lang = sorted(set(pages[lang]) - base_names)
        for name in only_base:
            errors.append(
                f"{BASE_LANG} 有 {SECTION}/{name}，{lang} 沒有。"
                f"{BASE_LANG} 那一頁的 hreflang 會指向不存在的 {lang} 網址"
            )
        for name in only_lang:
            errors.append(
                f"{lang} 有 {SECTION}/{name}，{BASE_LANG} 沒有。"
                f"該頁的 hreflang 會指向不存在的 {BASE_LANG} 網址"
            )

    # 二、每一頁都要被對應的 mkdocs 設定列進 nav
    for lang in LANGS:
        cfg = DOCS / CONFIGS[lang]
        if not cfg.is_file():
            errors.append(f"找不到 {cfg.relative_to(DOCS.parent)}")
            continue
        raw = cfg.read_text(encoding="utf-8")
        for name in pages[lang]:
            ref = f"{SECTION}/{name}"
            if ref not in raw:
                errors.append(
                    f"{lang} 的 {ref} 沒有列進 {CONFIGS[lang]} 的 nav，"
                    "頁面建得出來但側邊欄看不到"
                )

    # 三、指向章節錨點的連結，目標章節要真的存在
    for lang in LANGS:
        for name, path in pages[lang].items():
            body = path.read_text(encoding="utf-8")
            # 同一頁常常從不同段落連到同一個小標，壞掉的是同一件事，報一次就好
            seen: set[str] = set()
            for link in RE_LINK.findall(body):
                target, _, frag = link.partition("#")
                if not frag or link in seen:
                    continue
                seen.add(link)
                dest = (path.parent / target).resolve() if target else path
                if not dest.is_file():
                    errors.append(f"{lang} 的 {SECTION}/{name} 連到不存在的檔案：{link}")
                    continue
                if frag not in anchors_of(dest):
                    rel = dest.relative_to(DOCS / lang)
                    errors.append(
                        f"{lang} 的 {SECTION}/{name} 指向 {rel} 的錨點 #{frag}，"
                        "那一篇沒有這個小標。改標題的時候要一起改"
                    )

    # 四、每個入口頁都要通往那份不分身分的內容
    #
    # index.md 的「一般大眾」卡片寫著「其他四種身分同樣要做到」，而 2026-08-29
    # 查的時候，公民團體、新聞媒體、獨立記者三頁一個字都沒提到它，讀者從那三條路徑
    # 進來走不到那一頁。開發者那頁有「不分身分都要做到的」那一節，另外三頁是漏掉了。
    #
    # 這一項機械驗得出來：五頁都要連到 scenarios/everyday-baseline.md。身分特有的
    # 建議永遠蓋不掉「帳號被盜、密碼重複用」這一層，那是每一種處境都要做到的。
    BASELINE = "scenarios/everyday-baseline.md"
    for lang in LANGS:
        for name, path in sorted(pages[lang].items()):
            if name == "index.md":
                continue
            body = path.read_text(encoding="utf-8")
            if BASELINE not in body:
                errors.append(
                    f"{lang} 的 {SECTION}/{name} 沒有連到 {BASELINE}。"
                    "index.md 說那是所有身分同樣要做到的，每條路徑都要走得到"
                )

    # 五、說明句裡的專有名詞要在目標頁的正文出現
    #
    # 2026-08-30：civil-society.md 說 upload-sensitive「裡面有 PGP 與 OnionShare 兩種
    # 做法的取捨」，而那一頁的正文從頭到尾只有社群自架 Send 的上傳流程。PGP 與
    # OnionShare 只出現在它自己的 frontmatter description 裡，那個 description 同樣
    # 是錯的。用 grep 掃整個檔案會命中 frontmatter 然後放行，人工 review 那次就是
    # 這樣漏掉的，所以這裡切掉 frontmatter 只看正文。
    #
    # 只對中文語系跑。中文的說明句裡出現的 ASCII 詞幾乎都是專有名詞（PGP、OONI、
    # Send、Tor），英文版的句首大寫是普通詞，抽出來只會製造雜訊，實測 en 會報
    # Answers 與 Mainland 這種。
    #
    # 抓得到的是「說明句提到某個東西，目標頁一個字都沒有」。目標頁提了但講得很淺，
    # 或者說明句用中文概括（「三題」「四封信」），這一項驗不出來，那些仍然要人看。
    TERM = re.compile(r"\b[A-Z][A-Za-z0-9]{2,}\b")
    # 句首大寫的普通英文詞，出現在中文說明句裡的機會很低，先擋掉最常見的幾個
    TERM_STOP = {"The", "This", "That", "And", "For", "With", "How", "What"}
    for lang in ("zh-TW", "zh-CN"):
        for name, path in sorted(pages.get(lang, {}).items()):
            for label, target, rest in RE_CLAIM.findall(path.read_text(encoding="utf-8")):
                claim = rest.strip().lstrip("：:").strip()
                if not claim:
                    continue
                dest = (path.parent / target).resolve()
                if not dest.is_file():
                    errors.append(f"{lang} 的 {SECTION}/{name} 連到不存在的檔案：{target}")
                    continue
                body = RE_FRONTMATTER.sub("", dest.read_text(encoding="utf-8"), count=1)
                for term in sorted(set(TERM.findall(claim)) - TERM_STOP):
                    if term in body:
                        continue
                    rel = dest.relative_to(DOCS / lang)
                    errors.append(
                        f"{lang} 的 {SECTION}/{name} 說 {rel} 有「{term}」，"
                        f"那一篇的正文沒有提到它（frontmatter 不算）"
                    )

    # 六、h2 骨架，只提醒
    for name in sorted(base_names & set.intersection(*(set(pages[l]) for l in LANGS))):
        counts = {l: sum(1 for lv, _ in headings(pages[l][name]) if lv == 2) for l in LANGS}
        if len(set(counts.values())) > 1:
            shape = "、".join(f"{l} {counts[l]}" for l in LANGS)
            warnings.append(
                f"{SECTION}/{name} 的 h2 數量三語系不同（{shape}）。"
                "在地化刻意多寫一節的話忽略即可"
            )

    if warnings:
        print("提醒：")
        for w in warnings:
            print(f"  - {w}")
    if errors:
        print("\n對齊檢查失敗：")
        for e in errors:
            print(f"  - {e}")
        return 1

    total = sum(len(p) for p in pages.values())
    print(f"  {SECTION}/ 三語系各 {len(base_names)} 頁，檔名清單一致。")
    print(f"  {total} 個頁面都列進了 nav，指向章節錨點的連結全部命中。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
