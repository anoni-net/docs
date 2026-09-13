#!/usr/bin/env python3
"""`check_url_contract.py` 的回歸測試。

這支腳本自己失準是最糟的壞法：合約一路綠，而網址早就換過一輪。所以四件事各自要有
測試，一是「產物路徑換得出站台網址」，二是「分得出 redirect 頁與真的頁面」，三是
「寫出去的合約讀得回來」，四是「增與減分得開」。

第四項是重點。新增紅燈的話，人類會學會「紅了就重新產生」，接著它再也擋不住任何
東西。所以測試裡新增與移除各佔一半，確認方向沒有反過來。

最後兩項跑真實的 repo，把「合約現在是乾淨的」這個狀態釘住。

用法：
    python3 tools/test_check_url_contract.py
需要三個語系都建置過才驗得到產物那一項，沒有產物時該項跳過。
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import check_url_contract as checker  # noqa: E402

passed = 0
failed = 0
skipped = 0


def check(name, fn):
    global passed, failed
    try:
        fn()
    except AssertionError as err:
        failed += 1
        print(f"  ✗ {name}\n    {err}")
    else:
        passed += 1
        print(f"  ✓ {name}")


def skip(name, why):
    global skipped
    skipped += 1
    print(f"  - {name}（跳過：{why}）")


PAGE_HTML = """<!doctype html><html><head><title>x</title></head><body>
<h1 id="標題">標題<a class="headerlink" href="#標題"></a></h1>
<div id="__drawer" class="md-nav"></div>
<h2 id="Metadata-從哪裡來">Metadata 從哪裡來</h2>
<li id="fn:1">註腳不是錨點</li>
</body></html>"""

REDIRECT_HTML = """<!doctype html><html><head>
<title>Redirecting...</title>
<link rel="canonical" href="../basics/internet-freedom/">
<meta http-equiv="refresh" content="0; url=../basics/internet-freedom/">
</head></html>"""


def test_index_maps_to_directory(tmp_root):
    got = checker.url_of(tmp_root / "basics" / "metadata" / "index.html", tmp_root)
    assert got == "/basics/metadata/", got


def test_site_root_is_a_bare_slash(tmp_root):
    assert checker.url_of(tmp_root / "index.html", tmp_root) == "/"


def test_loose_html_keeps_its_filename(tmp_root):
    # 404.html 不是 index.html，網址就是它自己。當成目錄會變成 /404.html/，
    # 而伺服器上不存在那個路徑。
    assert checker.url_of(tmp_root / "404.html", tmp_root) == "/404.html"


def test_headings_become_anchors():
    kind, anchors = checker.read_page(PAGE_HTML)
    assert kind == "page", kind
    assert set(anchors) == {"標題", "Metadata-從哪裡來"}, anchors


def test_non_heading_ids_are_not_anchors():
    # Material 的版面元件（__drawer、__search）與註腳（fn:1）都帶 id，收進來的話
    # 合約會被主題的實作細節灌滿，而那些沒有人從站外連進來。
    _, anchors = checker.read_page(PAGE_HTML)
    assert "__drawer" not in anchors, anchors
    assert "fn:1" not in anchors, anchors


def test_redirect_page_is_not_a_page():
    kind, target = checker.read_page(REDIRECT_HTML)
    assert kind == "redirect", kind
    assert target == "../basics/internet-freedom/", target


def test_redirect_target_becomes_a_site_path(tmp_root):
    (tmp_root / "internet-freedom-matter").mkdir(parents=True, exist_ok=True)
    (tmp_root / "internet-freedom-matter" / "index.html").write_text(
        REDIRECT_HTML, encoding="utf-8"
    )
    entries = checker.scan(tmp_root)
    kind, target = entries["/internet-freedom-matter/"]
    assert kind == "redirect", kind
    # meta refresh 寫的是相對路徑，留著原樣的話換一個來源路徑就比不出目的地變了。
    assert target == "/basics/internet-freedom/", target


def test_render_and_parse_round_trip():
    entries = {
        "/": ("page", ["近期公告"]),
        "/about/": ("page", ["關於我們", "聯絡"]),
        "/report/": ("redirect", "/reports/"),
    }
    pages, anchors, redirects = checker.parse(checker.render(entries))
    assert pages == {"/", "/about/"}, pages
    assert anchors == {"/#近期公告", "/about/#關於我們", "/about/#聯絡"}, anchors
    assert redirects == {"/report/": "/reports/"}, redirects


def test_anchor_without_a_page_is_loud():
    # 縮排的那幾行靠前一行的頁面定位。檔案被手改過而順序亂掉時，安靜地把錨點掛到
    # 錯的頁面上，會讓比對從此失準。
    try:
        checker.parse("\t#孤兒錨點\n")
    except ValueError:
        return
    raise AssertionError("錨點沒有所屬頁面時應該報錯，不該安靜跳過")


def contract(pages=(), anchors=(), redirects=None):
    return set(pages), set(anchors), dict(redirects or {})


def test_removed_page_is_an_error():
    errors, _, _ = checker.compare(
        contract(pages=["/", "/about/"]), contract(pages=["/"])
    )
    assert any("/about/" in line for line in errors), errors


def test_added_page_is_not_an_error():
    errors, _, additions = checker.compare(
        contract(pages=["/"]), contract(pages=["/", "/new/"])
    )
    assert errors == [], errors
    assert additions, "新增應該要印出來，只是不擋"


def test_removed_anchor_is_an_error():
    errors, _, _ = checker.compare(
        contract(pages=["/a/"], anchors=["/a/#舊標題"]),
        contract(pages=["/a/"], anchors=["/a/#新標題"]),
    )
    assert any("/a/#舊標題" in line for line in errors), errors


def test_added_anchor_is_not_an_error():
    errors, _, additions = checker.compare(
        contract(pages=["/a/"], anchors=["/a/#一"]),
        contract(pages=["/a/"], anchors=["/a/#一", "/a/#二"]),
    )
    assert errors == [], errors
    assert additions, additions


def test_page_turned_redirect_is_only_a_warning():
    # 網址還在，讀者還到得了目的地，算可接受的改版。
    errors, warnings, _ = checker.compare(
        contract(pages=["/old/"], anchors=["/old/#一節"]),
        contract(redirects={"/old/": "/new/"}),
    )
    assert errors == [], errors
    assert any("/old/" in line for line in warnings), warnings


def test_redirect_changing_target_is_an_error():
    errors, _, _ = checker.compare(
        contract(redirects={"/old/": "/new/"}),
        contract(redirects={"/old/": "/somewhere-else/"}),
    )
    assert any("/somewhere-else/" in line for line in errors), errors


def test_vanished_page_does_not_repeat_every_anchor():
    # 一頁被刪掉，上面已經報過一條。底下四十個錨點再各報一條只會把真正要看的淹掉。
    errors, _, _ = checker.compare(
        contract(pages=["/gone/"], anchors=[f"/gone/#第{n}節" for n in range(40)]),
        contract(),
    )
    assert len(errors) == 1, errors


def test_committed_contract_parses():
    # 不需要建置產物，每一個 PR 都驗得到：合約檔案本身沒有被手改壞。
    assert checker.CONTRACT.is_file(), f"{checker.CONTRACT} 不存在"
    pages, anchors, redirects = checker.parse(
        checker.CONTRACT.read_text(encoding="utf-8")
    )
    assert pages, "合約裡一頁都沒有"
    assert anchors, "合約裡一個錨點都沒有"
    assert redirects, "合約裡一條 redirect 都沒有，mkdocs.yml 的 redirect_maps 有四十幾條"
    assert "/" in pages, "首頁不在合約裡"


def test_committed_contract_is_canonical():
    # --update 寫出來的形狀就是檔案裡的形狀。有人手改過的話這裡會紅，而手改最容易
    # 弄壞的是排序，排序一亂，下一次 --update 的 diff 會變成整份重寫。
    text = checker.CONTRACT.read_text(encoding="utf-8")
    pages, anchors, redirects = checker.parse(text)
    entries = {url: ("page", []) for url in pages}
    for url, target in redirects.items():
        entries[url] = ("redirect", target)
    for anchor in anchors:
        url, name = anchor.split("#", 1)
        entries[url][1].append(name)
    for url, (kind, payload) in entries.items():
        if kind == "page":
            payload.sort()
    assert checker.render(entries) == text, "合約檔案不是 --update 產出的形狀"


def test_output_matches_contract():
    assert checker.main([]) == 0, "check_url_contract.py 對現在的產物回報了破壞性變更"


def main():
    tmp_root = Path(__file__).resolve().parent / ".tmp-url-contract-test"
    tmp_root.mkdir(parents=True, exist_ok=True)

    try:
        print("check_url_contract：")
        check("index.html 對應到目錄網址", lambda: test_index_maps_to_directory(tmp_root))
        check("站台根目錄是單一斜線", lambda: test_site_root_is_a_bare_slash(tmp_root))
        check("404.html 保留自己的檔名", lambda: test_loose_html_keeps_its_filename(tmp_root))
        check("heading 變成錨點", test_headings_become_anchors)
        check("版面元件與註腳的 id 不算錨點", test_non_heading_ids_are_not_anchors)
        check("redirect 頁不算一篇文章", test_redirect_page_is_not_a_page)
        check("redirect 目的地換算成站台路徑", lambda: test_redirect_target_becomes_a_site_path(tmp_root))
        check("寫出去的合約讀得回來", test_render_and_parse_round_trip)
        check("孤兒錨點會報錯", test_anchor_without_a_page_is_loud)
        check("移除頁面是錯誤", test_removed_page_is_an_error)
        check("新增頁面不是錯誤", test_added_page_is_not_an_error)
        check("移除錨點是錯誤", test_removed_anchor_is_an_error)
        check("新增錨點不是錯誤", test_added_anchor_is_not_an_error)
        check("頁面改成 redirect 只是提醒", test_page_turned_redirect_is_only_a_warning)
        check("redirect 換目的地是錯誤", test_redirect_changing_target_is_an_error)
        check("整頁消失不逐條列錨點", test_vanished_page_does_not_repeat_every_anchor)
        check("提交的合約讀得回來", test_committed_contract_parses)
        check("提交的合約是產生器寫出來的形狀", test_committed_contract_is_canonical)
        if checker.OUTPUT.is_dir():
            check("產物與合約相符", test_output_matches_contract)
        else:
            skip("產物與合約相符", "docs/output 不存在，三個語系建置過再跑")
    finally:
        for path in sorted(tmp_root.rglob("*"), reverse=True):
            path.rmdir() if path.is_dir() else path.unlink()
        tmp_root.rmdir()

    tail = f"，{skipped} 跳過" if skipped else ""
    print(f"\n{passed} 通過，{failed} 失敗{tail}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
