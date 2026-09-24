#!/usr/bin/env python3
"""比對建置產物的網址與 `tools/data/url_contract.txt` 這份合約。

=== 為什麼需要這支 ===

網址是這個站對外唯一的承諾，而依賴它的人全部在 CI 管不到的地方：讀者的書籤、搜尋
引擎的索引、別人文章裡的連結、社群貼文、以及讀者裝置上已經存好的離線內容。改壞了
不會有任何一個測試變紅，發現的人是讀者，時機是他點下去那一刻。

`redirect_maps` 裡那四十幾條就是上一次的帳單，其中一批標著「GSC 404 補漏（2026-07-22
匯出）」，代表搜尋引擎先發現，社群後補。這支把補救改成事前攔截。

錨點的壞法更安靜。`toc` 用 `pymdownx.slugs.slugify()` 算 heading 的 id，改一個小標題
的字就換一個 id，而建置不會提到任何事，連 strict 都綠。換靜態網站產生器等於換一套
slugify，兩百多頁的錨點可能整批位移，建置照樣全綠、部署照樣成功。

=== 合約記什麼 ===

判準是「站外的人依賴它嗎」。

記：每一個頁面網址、每一頁的 heading 錨點、每一條 redirect 的來源與目的地、少數幾個
機器在讀的端點（sitemap、RSS、offline-index.json、sw.js）。

不記：HTML 內容本身（改一個字就紅燈，然後大家學會無視它）、檔名帶雜湊的主題資產
（那些本來就該變，由 `tools/check_theme_assets.py` 負責）、側邊欄的渲染結果。

=== 增與減的意義不同 ===

合約承諾的內容是「我不會拿走我給過的東西」。它沒有承諾「我永遠長這樣」。

所以新增網址與新增錨點一律放行，只印一行提醒；移除、改名、redirect 改目的地才擋。
天真的快照測試每篇新文章都紅一次，接著人類學會「紅了就重新產生」，然後它再也抓不到
東西，這是快照測試最常見的失效方式。對照 semver 會更清楚：新增是 minor，移除是
breaking，這支只擋 breaking。

頁面被改成 redirect 是可接受的變更，網址仍然解析得到，讀者仍然到得了目的地。那一頁
原本的錨點會跟著消失（meta refresh 之後 hash 由 redirect 頁的那行 script 轉手），
所以降級成提醒，不擋。

=== 怎麼更新合約 ===

改動是刻意的就執行 `--update`，把新的一份寫回去。重點在那份 diff 會進 PR，移除哪幾條
網址攤在審閱者眼前，跟 `check_core_pages.py` 的 `EXCLUDED` 同一個想法：不禁止你做，
只是不准你靜悄悄地做。

=== 用法 ===

需要三個語系都建置過（`sh run.sh`、`sh run_zh-cn.sh`、`sh run_en.sh`），產物在
`docs/output`。找不到產物時直接跳過，沒建置過不該擋人。

CI 上由 `.github/workflows/url-contract.yml` 在 PR 階段建站執行，`build_docs.yml`
在上傳之前再驗一次，涵蓋沒走 PR 的推送。本機要驗的話，關掉 social 與 privacy 兩個
外掛建得比較快，實測產出的合約與開著時逐位元組相同：

    cd docs && SOCIAL_CARDS=false PRIVACY_ASSETS=false \
      sh run.sh && sh run_zh-cn.sh && sh run_en.sh

    python3 tools/check_url_contract.py            # 比對
    python3 tools/check_url_contract.py --update   # 認可目前的產物，寫回合約
"""

import argparse
import posixpath
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "docs" / "output"
CONTRACT = ROOT / "tools" / "data" / "url_contract.txt"

# 站台掛在 https://anoni.net/docs/ 底下，合約裡的路徑相對於那個根。onion 與 IPFS 兩種
# 產物的主機名不同，相對結構一樣，所以同一份合約三種產物通用。
SITE_ROOT = "https://anoni.net/docs"

HEADING = re.compile(r"<h[1-6][^>]*\sid=\"([^\"]+)\"")
# mkdocs-redirects 產出的頁面，整份就是一個 meta refresh 加一行 script。
REDIRECT_TITLE = re.compile(r"<title>Redirecting\.\.\.</title>")
REDIRECT_TARGET = re.compile(
    r"<meta[^>]+http-equiv=\"refresh\"[^>]+url=([^\"']+)\"", re.I
)

# 機器在讀的端點。它們不是 HTML，掃不到，但少了任何一個都有東西會壞：sitemap 掉了
# 搜尋引擎重新爬要好幾週，offline-index.json 掉了離線閱讀的「更新」整個停擺，sw.js
# 掉了已經裝好 PWA 的讀者拿不到新版。逐語系一份。
WELL_KNOWN = (
    "404.html",
    "sitemap.xml",
    "sitemap.xml.gz",
    "offline-index.json",
    "sw.js",
    "feed_rss_created.xml",
    "feed_rss_updated.xml",
)
LANG_ROOTS = ("", "en", "zh-cn")

# redirect 行的分隔符號。產物裡的路徑與錨點都不含空白（實測 0 筆），拿它當分隔安全，
# 而且比 tab 好認：合約是給人審的，tab 在 diff 裡看不見。
REDIRECT_ARROW = " -> "

HEADER = (
    "# 這個站對外的網址合約，由 tools/check_url_contract.py --update 產生，不要手改。",
    "#",
    f"# 每一行是一個 {SITE_ROOT} 底下的路徑。縮排的 #開頭 是上一行那一頁的 heading",
    f"# 錨點，帶「{REDIRECT_ARROW.strip()}」的是 redirect 與它的目的地。",
    "#",
    "# 移除任何一行都是對讀者的破壞性變更，新增則隨時可以。判準寫在那支腳本的檔頭。",
    "#",
)


def url_of(path, root):
    """產物裡的檔案路徑換成站台路徑。

    `output/index.html` → `/`，`output/basics/metadata/index.html` →
    `/basics/metadata/`，`output/404.html` → `/404.html`。
    """
    rel = path.relative_to(root).as_posix()
    if rel == "index.html":
        return "/"
    if rel.endswith("/index.html"):
        return "/" + rel[: -len("index.html")]
    return "/" + rel


def read_page(html):
    """一份 HTML 是 redirect 還是真的頁面，以及它帶了哪些錨點。

    回 `("redirect", 目的地)` 或 `("page", [錨點])`。目的地留原樣的相對路徑，
    呼叫端再換成站台路徑，這樣這個函式不需要知道自己在哪一頁。
    """
    if REDIRECT_TITLE.search(html):
        target = REDIRECT_TARGET.search(html)
        return "redirect", target.group(1) if target else ""
    return "page", HEADING.findall(html)


def scan(root=OUTPUT):
    """走過產物，回一份 `路徑 -> 條目` 的對照。

    條目是 `("page", [錨點])` 或 `("redirect", 目的地)`。
    """
    entries = {}
    for path in root.rglob("*.html"):
        url = url_of(path, root)
        kind, payload = read_page(path.read_text(encoding="utf-8", errors="replace"))
        if kind == "redirect":
            # meta refresh 寫的是相對路徑，換成站台路徑才比得出「目的地變了」。
            target = posixpath.normpath(posixpath.join(url, payload))
            if not target.endswith("/") and payload.endswith("/"):
                target += "/"
            entries[url] = ("redirect", target)
            continue
        # 同一頁出現重複 id 是 Markdown 那邊的事，這裡去重，合約只講「這個錨點到得了」。
        entries[url] = ("page", sorted(set(payload)))

    for lang in LANG_ROOTS:
        base = root / lang if lang else root
        names = list(WELL_KNOWN)
        # 更新日誌的 RSS，一個篩選項一份，檔名跟著篩選項走所以用掃的。拿掉篩選項會讓
        # 那一份消失，訂閱的閱讀器從此收不到東西也不會報錯，所以跟其他端點一樣登記。
        names += sorted(p.relative_to(base).as_posix() for p in (base / "changelog").glob("feed*.xml"))
        for name in names:
            if (base / name).is_file():
                entries.setdefault(
                    "/" + (f"{lang}/{name}" if lang else name), ("page", [])
                )

    return entries


def render(entries):
    """寫成合約的文字形式。

    錨點縮排掛在它所屬的頁面底下，不重複那一段路徑。整份檔案照路徑排序，新增一頁會
    插在該在的位置，diff 只會多出那一頁與它的錨點。逐行重複完整路徑的話檔案會大一倍，
    而審閱的人要從每一行的尾巴找差異。
    """
    out = list(HEADER)
    for url in sorted(entries):
        kind, payload = entries[url]
        if kind == "redirect":
            out.append(f"{url}{REDIRECT_ARROW}{payload}")
            continue
        out.append(url)
        out.extend(f"\t#{anchor}" for anchor in payload)
    return "\n".join(out) + "\n"


def parse(text):
    """讀回合約，分成頁面、錨點、redirect 三組。

    錨點展開成完整路徑（`/about/#關於我們`），比對與報錯都直接拿它當識別碼。
    """
    pages, anchors, redirects = set(), set(), {}
    current = None
    for raw in text.splitlines():
        line = raw.rstrip("\n")
        if not line or line.startswith("#"):
            continue
        if line.startswith("\t"):
            if current is None:
                raise ValueError(f"錨點沒有所屬頁面：{line.strip()}")
            anchors.add(current + line.lstrip("\t"))
            continue
        if REDIRECT_ARROW in line:
            source, target = line.split(REDIRECT_ARROW, 1)
            redirects[source] = target
            current = None
            continue
        pages.add(line)
        current = line
    return pages, anchors, redirects


def compare(old, new):
    """兩份合約的差異，依「對讀者是不是破壞」分成三堆。"""
    old_pages, old_anchors, old_redirects = old
    new_pages, new_anchors, new_redirects = new

    # redirect 頁的網址照樣解析得到，所以算在「還在」裡面。
    old_urls = old_pages | set(old_redirects)
    new_urls = new_pages | set(new_redirects)

    errors, warnings, additions = [], [], []

    gone = old_urls - new_urls
    for url in sorted(gone):
        errors.append(f"網址不見了：{url}")

    for url in sorted(old_redirects):
        if url in new_redirects and new_redirects[url] != old_redirects[url]:
            errors.append(
                f"redirect 換了目的地：{url} 原本指向 {old_redirects[url]}，"
                f"現在指向 {new_redirects[url]}"
            )

    # 文章改成 redirect 是可接受的變更，網址仍然到得了目的地。錨點跟著失效是那個
    # 決定本身的代價，降成提醒。
    now_redirect = old_pages & set(new_redirects)
    for url in sorted(now_redirect):
        warnings.append(
            f"{url} 從文章改成 redirect，指向 {new_redirects[url]}，原本的錨點跟著失效"
        )

    # 整頁不見的那些，上面已經各報過一條。再把它底下幾十個錨點逐一列出來只會把真正
    # 要看的東西淹掉。
    silenced = gone | now_redirect
    for anchor in sorted(old_anchors - new_anchors):
        if anchor.split("#", 1)[0] in silenced:
            continue
        errors.append(f"錨點不見了：{anchor}")

    added_urls = new_urls - old_urls
    # 新頁面的錨點不另外算，那一頁本身已經報過一次。這裡只看既有頁面多出來的。
    added_anchors = {
        a for a in new_anchors - old_anchors if a.split("#", 1)[0] in old_pages
    }
    if added_urls:
        additions.append(f"新增 {len(added_urls)} 個網址")
    if added_anchors:
        additions.append(f"既有頁面新增 {len(added_anchors)} 個錨點")

    return errors, warnings, additions


def main(argv=None):
    parser = argparse.ArgumentParser(description="比對產物的網址與合約")
    parser.add_argument(
        "--update", action="store_true", help="認可目前的產物，把合約寫回去"
    )
    args = parser.parse_args(argv)

    if not OUTPUT.is_dir():
        print(
            "找不到 docs/output，跳過。三個語系都建置過再執行："
            "\n  cd docs && sh run.sh && sh run_zh-cn.sh && sh run_en.sh"
        )
        return 0

    entries = scan()
    current = parse(render(entries))
    print(
        f"產物裡有 {len(current[0])} 頁、{len(current[1])} 個錨點、"
        f"{len(current[2])} 條 redirect"
    )

    if args.update:
        CONTRACT.parent.mkdir(parents=True, exist_ok=True)
        CONTRACT.write_text(render(entries), encoding="utf-8")
        print(f"\n已寫回 {CONTRACT.relative_to(ROOT)}，記得把那份 diff 一起送審。")
        return 0

    if not CONTRACT.is_file():
        print(
            f"\n✗ 還沒有 {CONTRACT.relative_to(ROOT)}。"
            "\n第一次建立：python3 tools/check_url_contract.py --update"
        )
        return 1

    recorded = parse(CONTRACT.read_text(encoding="utf-8"))
    errors, warnings, additions = compare(recorded, current)

    for line in additions:
        print(f"新增：{line}（執行 --update 收進合約）")
    for line in warnings:
        print(f"提醒：{line}")

    if errors:
        shown = errors[:40]
        print(f"\n✗ {len(errors)} 項破壞性變更：")
        for line in shown:
            print(f"  {line}")
        if len(errors) > len(shown):
            print(f"  …還有 {len(errors) - len(shown)} 項")
        print(
            "\n這些網址現在在讀者的書籤、搜尋引擎的索引與別人的文章裡。"
            "\n改名或搬家的話，在 mkdocs.yml 的 redirect_maps 補一條接住舊網址，"
            "\n或者把新網址寫進 Cloudflare 的 Redirect Rules。"
            "\n確定要拿掉才執行 --update，那份 diff 會讓審閱的人看見拿掉了什麼。"
        )
        return 1

    print("\n合約裡的每一個網址與錨點都還在。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
