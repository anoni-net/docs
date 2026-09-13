#!/usr/bin/env python3
"""`check_core_pages.py` 的回歸測試。

檢查腳本自己回綠燈是最糟的壞法：清單早就漂移了，而 CI 一路綠，沒有人會回頭看。
所以抽出來的兩件事各自要有測試，一是「從 sw.js 抽得出清單」，二是「檔名對應得到
清單裡的路徑形狀」。這兩件只要有一件默默失準，整支就變成永遠通過的裝飾品。

最後一項直接跑真實的 repo，等於把「現在沒有漂移」這個狀態釘住。

用法：
    python3 tools/test_check_core_pages.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import check_core_pages as checker  # noqa: E402

passed = 0
failed = 0


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


def test_core_pages_parses():
    source = '''
const CORE_PAGES_ZH = [
  "",
  // basics（概念，全部）
  "basics/",
  "basics/metadata/",
];
'''
    got = checker.core_pages(source, "CORE_PAGES_ZH")
    assert got == {"", "basics/", "basics/metadata/"}, got


def test_comment_strings_are_not_pages():
    # 那幾份清單的註解很長，裡面引用過頁面路徑。註解沒有剝掉的話，被排除的頁面會
    # 被當成收進來了，而那正是這支要抓的東西，方向剛好相反。
    source = '''
const CORE_PAGES_ZH = [
  // 依這個判準移除了 "scenarios/journalist/"，不是漏掉
  "basics/",
];
'''
    got = checker.core_pages(source, "CORE_PAGES_ZH")
    assert got == {"basics/"}, got


def test_missing_const_is_loud():
    try:
        checker.core_pages("const OTHER = [];", "CORE_PAGES_ZH")
    except SystemExit:
        return
    raise AssertionError("抽不到清單時應該中止，不該回空集合當成沒有頁面")


def test_index_maps_to_directory(tmp_root):
    got = checker.pages_on_disk("zh-TW", ("basics",), root=tmp_root)
    assert "basics/" in got, got
    assert "basics/index/" not in got, got


def test_article_maps_to_trailing_slash(tmp_root):
    got = checker.pages_on_disk("zh-TW", ("basics",), root=tmp_root)
    assert "basics/metadata/" in got, got


def test_non_markdown_ignored(tmp_root):
    got = checker.pages_on_disk("zh-TW", ("basics",), root=tmp_root)
    assert all(url.endswith("/") for url in got), got
    assert "basics/notes.txt" not in got, got


def test_missing_directory_is_not_an_error(tmp_root):
    got = checker.pages_on_disk("zh-TW", ("nope",), root=tmp_root)
    assert got == {}, got


def test_excluded_entries_carry_a_reason():
    for track, entries in checker.EXCLUDED.items():
        for url, reason in entries.items():
            assert reason.strip(), f"{track} 的 {url} 沒有寫理由"


def test_repo_has_no_drift():
    # 真實的 repo 現在是乾淨的。這一項紅了就是有人新增文章而沒有決定要不要收，
    # 或者改了檔名而清單沒跟著改。
    assert checker.main() == 0, "check_core_pages.py 對現在的 repo 回報了問題"


def main():
    tmp_root = Path(__file__).resolve().parent / ".tmp-core-pages-test"
    basics = tmp_root / "docs" / "zh-TW" / "basics"
    basics.mkdir(parents=True, exist_ok=True)
    (basics / "index.md").write_text("", encoding="utf-8")
    (basics / "metadata.md").write_text("", encoding="utf-8")
    (basics / "notes.txt").write_text("", encoding="utf-8")

    try:
        print("check_core_pages：")
        check("從 sw.js 抽得出清單", test_core_pages_parses)
        check("註解裡引用的路徑不算收進來", test_comment_strings_are_not_pages)
        check("抽不到清單時中止而不是回空集合", test_missing_const_is_loud)
        check("index.md 對應到章節本身", lambda: test_index_maps_to_directory(tmp_root))
        check("文章對應到帶斜線的路徑", lambda: test_article_maps_to_trailing_slash(tmp_root))
        check("非 Markdown 檔不算頁面", lambda: test_non_markdown_ignored(tmp_root))
        check("語系缺整個章節時不當成錯", lambda: test_missing_directory_is_not_an_error(tmp_root))
        check("排除清單每一筆都寫了理由", test_excluded_entries_carry_a_reason)
        check("現在的 repo 沒有漂移", test_repo_has_no_drift)
    finally:
        for path in sorted(tmp_root.rglob("*"), reverse=True):
            path.rmdir() if path.is_dir() else path.unlink()
        tmp_root.rmdir()

    print(f"\n{passed} 通過，{failed} 失敗")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
