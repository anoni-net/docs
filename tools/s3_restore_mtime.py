#!/usr/bin/env python3
"""把內容與 S3 上相同的本機檔案，修改時間調回遠端那一版的時間。

=== 為什麼需要這支 ===

部署最後一步是 `aws s3 sync`，而 sync 判斷要不要上傳，看的是檔案大小與修改時間，
不是內容。每次 run 都是全新 checkout 加重新建置，2260 個產出檔案的時間戳全部是
「現在」，一律比遠端新，於是每次都重傳全部。

實測 mkdocs 的產出幾乎完全可重現，同一個 commit 建兩次只有兩個 RSS feed 因為嵌了
時間戳而不同。而一次內容改動很大的部署（115 個原始檔）也只讓 246 個產出檔案真的
變化，佔 10.9%。換句話說每次部署有九成的上傳是白費的，實測佔掉 76 秒。

這支在 sync 之前跑：比對本機檔案的 MD5 與 S3 物件的 ETag，一樣的就把本機時間戳
調回遠端的 LastModified，讓後面的 sync 自己跳過它。

=== 為什麼不直接換掉 sync ===

自己寫上傳要重現 aws cli 的 content-type 推斷、ACL、multipart 與重試。content-type
弄錯的後果是整站的 CSS 與 JS 變成 binary/octet-stream，頁面還在但全壞，而且不會有
任何一步變紅燈。這支只動時間戳，上傳那條路徑完全沒碰。

=== 安全性 ===

任何一步出問題都退回「什麼都不做」，讓 sync 照原本的方式跑完整上傳。慢一點總比
漏傳好。ETag 帶 `-` 的（multipart 上傳的物件）不比對，那種 ETag 不是 MD5。

用法：

    python3 tools/s3_restore_mtime.py --bucket BUCKET --prefix docs/ --root ./output
"""

from __future__ import annotations

import argparse
import datetime
import hashlib
import os
import sys
from pathlib import Path

# 一次讀進來算 MD5 的區塊大小。產物最大的檔案不到 5 MB，整個讀進記憶體也無妨，
# 但分塊讀不會因為哪天多了一個大檔就吃掉 runner 的記憶體。
CHUNK = 1024 * 1024


def file_md5(path: Path) -> str:
    digest = hashlib.md5()
    with path.open("rb") as fh:
        for block in iter(lambda: fh.read(CHUNK), b""):
            digest.update(block)
    return digest.hexdigest()


def remote_index(client, bucket: str, prefix: str) -> dict[str, tuple[str, float]]:
    """遠端物件的 key 對到 (ETag, LastModified 的 epoch 秒)。

    key 去掉 prefix，跟本機的相對路徑對得起來。分頁一定要處理，S3 一次最多回
    1000 筆，而產物有兩千多個。
    """
    index: dict[str, tuple[str, float]] = {}
    paginator = client.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        for obj in page.get("Contents", []):
            key = obj["Key"]
            if not key.startswith(prefix):
                continue
            etag = obj["ETag"].strip('"')
            index[key[len(prefix):]] = (etag, obj["LastModified"].timestamp())
    return index


def restore(root: Path, index: dict[str, tuple[str, float]]) -> tuple[int, int]:
    """回傳 (調整過時間戳的檔案數, 掃描過的檔案數)。

    時間戳設成遠端時間減一秒。設成一模一樣也可以，減一秒是為了不去猜 aws cli 對
    「相等」的處理，落在明確比較舊的那一側。
    """
    restored = 0
    scanned = 0
    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        scanned += 1
        rel = str(path.relative_to(root))
        entry = index.get(rel)
        if entry is None:
            continue
        etag, last_modified = entry
        # multipart 上傳的物件 ETag 是 <md5>-<段數>。下面的 MD5 比對本來就不會讓它
        # 通過（雜湊值不可能長成 <md5>-<n>），這一行只是省下白算一次雜湊，不是
        # 正確性上的必要條件。產物目前最大的檔案不到 5 MB，都在 aws cli 的 8 MB
        # multipart 門檻以下，實際上不會走到這裡。
        if "-" in etag:
            continue
        if file_md5(path) != etag:
            continue
        stamp = last_modified - 1
        os.utime(path, (stamp, stamp))
        restored += 1
    return restored, scanned


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bucket", required=True)
    parser.add_argument("--prefix", required=True, help="結尾要有斜線，例如 docs/")
    parser.add_argument("--root", required=True, help="建置產物目錄")
    parser.add_argument("--endpoint-url", default=None, help="測試用")
    args = parser.parse_args()

    root = Path(args.root)
    if not root.is_dir():
        print(f"::warning::找不到產物目錄 {root}，略過時間戳還原", file=sys.stderr)
        return 0
    if not args.prefix.endswith("/"):
        print("::error::--prefix 結尾要有斜線", file=sys.stderr)
        return 1

    # 匯入失敗跟讀取失敗分開處理。讀不到清單可能是一時的（憑證、網路、S3 抽風），
    # 退回完整上傳就好，warning 的份量剛好。匯入失敗是環境壞了，每一次部署都會踩到，
    # 而這一步失敗不會讓任何一格變紅，只留下一則沒人看的訊息，這個優化就這樣靜靜
    # 失效了好一段時間（awscli 1.46.0 把 botocore 內嵌成 awscli.botocore，不再宣告
    # 頂層相依）。所以匯入失敗用 error 標，讓它在 Actions 頁面上是紅的。
    # 仍然回 0：這是效能優化，不值得為它擋下整個部署。
    try:
        import botocore.session
    except ImportError as exc:
        print(
            f"::error::botocore 匯入失敗（{exc}），略過時間戳還原，這次會完整上傳。"
            "這是環境問題不是暫時性錯誤，補上相依之前每次部署都會完整上傳",
            file=sys.stderr,
        )
        return 0

    try:
        client = botocore.session.get_session().create_client(
            "s3", endpoint_url=args.endpoint_url
        )
        index = remote_index(client, args.bucket, args.prefix)
    except Exception as exc:  # noqa: BLE001 - 讀不到就退回什麼都不做
        print(
            f"::warning::讀不到 S3 物件清單（{type(exc).__name__}: {exc}），"
            "略過時間戳還原，這次會完整上傳",
            file=sys.stderr,
        )
        return 0

    if not index:
        print("S3 上還沒有物件，這次完整上傳")
        return 0

    restored, scanned = restore(root, index)
    print(
        f"掃描 {scanned} 個產出檔案，其中 {restored} 個內容與 S3 相同，"
        f"時間戳已調回遠端版本，sync 會跳過它們"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
