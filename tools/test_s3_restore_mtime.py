#!/usr/bin/env python3
"""s3_restore_mtime.py 的回歸測試。

這支決定「部署時哪些檔案不用重傳」。判斷錯的方向有兩個，代價差很多：

- 該傳的沒傳（把內容不同的檔案誤判成相同）：站上留著舊內容，而且不會有任何一步
  變紅燈，跟 2026-08-07 那次 Cloudflare 沒清乾淨一樣難發現
- 不該傳的傳了：只是慢一點，沒有正確性問題

所以測試偏重前者：內容只差一個 byte、大小完全相同、multipart 的 ETag、遠端沒有
的新檔，這幾種都不能被誤判成「相同」。

不呼叫網路，S3 清單用替身。執行：

    python3 tools/test_s3_restore_mtime.py
"""

from __future__ import annotations

import datetime
import hashlib
import os
import pathlib
import sys
import tempfile

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

from s3_restore_mtime import file_md5, remote_index, restore  # noqa: E402

failures: list[str] = []


def check(label: str, got, want) -> None:
    if got != want:
        failures.append(f"{label}\n    got:  {got!r}\n    want: {want!r}")


class FakePaginator:
    def __init__(self, pages):
        self.pages = pages

    def paginate(self, **kwargs):
        return self.pages


class FakeClient:
    def __init__(self, pages):
        self.pages = pages

    def get_paginator(self, name):
        assert name == "list_objects_v2"
        return FakePaginator(self.pages)


def _obj(key, etag, when="2026-01-01T00:00:00+00:00"):
    return {
        "Key": key,
        "ETag": f'"{etag}"',
        "LastModified": datetime.datetime.fromisoformat(when),
    }


def test_remote_index_strips_prefix_and_quotes() -> None:
    client = FakeClient([{"Contents": [_obj("docs/a.html", "aaa"), _obj("docs/sub/b.css", "bbb")]}])
    index = remote_index(client, "bucket", "docs/")
    check("key 去掉 prefix", sorted(index), ["a.html", "sub/b.css"])
    check("ETag 去掉引號", index["a.html"][0], "aaa")


def test_remote_index_walks_every_page() -> None:
    # S3 一次最多回 1000 筆，產物有兩千多個，漏掉分頁就會有一大批被當成「遠端沒有」
    pages = [
        {"Contents": [_obj(f"docs/p{i}.html", f"e{i}") for i in range(1000)]},
        {"Contents": [_obj(f"docs/p{i}.html", f"e{i}") for i in range(1000, 2260)]},
    ]
    index = remote_index(FakeClient(pages), "bucket", "docs/")
    check("兩頁都收", len(index), 2260)


def test_remote_index_ignores_other_prefixes() -> None:
    # docs 與 docs-onion 在同一個 bucket，前綴比對錯了會互相污染
    pages = [{"Contents": [_obj("docs/a.html", "aaa"), _obj("docs-onion/a.html", "zzz")]}]
    index = remote_index(FakeClient(pages), "bucket", "docs/")
    check("只收自己 prefix 底下的", sorted(index), ["a.html"])


def _tree(files: dict[str, bytes]) -> pathlib.Path:
    root = pathlib.Path(tempfile.mkdtemp())
    for rel, data in files.items():
        p = root / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(data)
    return root


def test_restore_only_touches_identical_content() -> None:
    root = _tree({
        "same.html": b"hello\n",
        "changed.html": b"world\n",
        "new.html": b"brand new\n",
    })
    remote_time = 1_700_000_000.0
    index = {
        "same.html": (hashlib.md5(b"hello\n").hexdigest(), remote_time),
        # 內容不同但長度一樣，這是最容易被誤放過的一種
        "changed.html": (hashlib.md5(b"WORLD\n").hexdigest(), remote_time),
        # new.html 遠端沒有
    }
    before = {p.name: p.stat().st_mtime for p in root.rglob("*") if p.is_file()}
    restored, scanned = restore(root, index)
    after = {p.name: p.stat().st_mtime for p in root.rglob("*") if p.is_file()}

    check("只還原一個", restored, 1)
    check("掃過三個", scanned, 3)
    check("內容相同的被調到遠端時間之前", after["same.html"], remote_time - 1)
    check("內容不同的不動", after["changed.html"], before["changed.html"])
    check("遠端沒有的不動", after["new.html"], before["new.html"])


def test_restore_skips_multipart_etag() -> None:
    # multipart 的 ETag 是 <md5>-<段數>，不會被誤判成相同。實作裡那行 `"-" in etag`
    # 只是省下白算一次雜湊，拿掉之後 MD5 比對照樣擋得住，所以這個案例在兩種寫法下
    # 都會通過。留著是為了記錄這個格式的存在，不是在守某一行程式碼。
    root = _tree({"big.bin": b"x" * 100})
    index = {"big.bin": (hashlib.md5(b"x" * 100).hexdigest() + "-2", 1_700_000_000.0)}
    before = (root / "big.bin").stat().st_mtime
    restored, _ = restore(root, index)
    check("multipart 不還原", restored, 0)
    check("時間戳沒被動", (root / "big.bin").stat().st_mtime, before)


def test_restore_handles_nested_paths() -> None:
    root = _tree({"a/b/c.html": b"deep\n"})
    index = {"a/b/c.html": (hashlib.md5(b"deep\n").hexdigest(), 1_700_000_000.0)}
    restored, scanned = restore(root, index)
    check("巢狀路徑對得起來", restored, 1)
    check("掃到一個", scanned, 1)


def test_restore_empty_index_does_nothing() -> None:
    root = _tree({"a.html": b"x\n"})
    before = (root / "a.html").stat().st_mtime
    restored, scanned = restore(root, {})
    check("遠端全空時不還原", restored, 0)
    check("時間戳沒被動", (root / "a.html").stat().st_mtime, before)


def test_file_md5_matches_hashlib() -> None:
    # 分塊讀不能算出跟一次讀進來不同的結果
    data = b"".join(bytes([i % 256]) for i in range(3_000_000))
    root = _tree({"big.bin": data})
    check("分塊讀的 MD5 正確", file_md5(root / "big.bin"), hashlib.md5(data).hexdigest())


def main() -> int:
    for fn in [
        test_remote_index_strips_prefix_and_quotes,
        test_remote_index_walks_every_page,
        test_remote_index_ignores_other_prefixes,
        test_restore_only_touches_identical_content,
        test_restore_skips_multipart_etag,
        test_restore_handles_nested_paths,
        test_restore_empty_index_does_nothing,
        test_file_md5_matches_hashlib,
    ]:
        fn()
    if failures:
        print(f"FAILED ({len(failures)})")
        for f in failures:
            print("  " + f)
        return 1
    print("s3_restore_mtime tests passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
