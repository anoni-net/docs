#!/usr/bin/env python3
"""部署後清除 Cloudflare edge 快取，範圍限這次建置產出的 /docs/ 網址。

anoni.net 這個 zone 底下還有主站、pad、form、search 等服務，`purge_everything`
會把它們一起清掉，只是為了換 docs 的內容並不划算。Cloudflare 的 purge by prefix
與 purge by hostname 都是 Enterprise 功能，本 zone 是 Pro，所以改成逐 URL 清：
把建置產物的每個檔案映射回對外網址，每批 30 條送一次（Pro 的單次上限）。

映射規則：

    output/index.html            -> {base}/
    output/basics/index.html     -> {base}/basics/
    output/404.html              -> {base}/404.html
    output/stylesheets/extra.css -> {base}/stylesheets/extra.css

只清目錄式網址，不另外清 `.../index.html`。站上是 MkDocs 的
`use_directory_urls`，訪客與爬蟲要到的都是帶結尾斜線的那個形式，那才是實際被
快取的 key。

資產也一起清。Material 自己的 bundle 檔名帶 content hash（`main.<hash>.min.css`）
本來就不會殘留，但 `stylesheets/extra.css`、`sw.js`、`sitemap.xml`、RSS feed
這些沒有 hash，改了就必須清，逐一挑選容易漏，整份清掉才 48 次呼叫。

用法：
    python3 tools/cf_purge.py --output docs/output
    python3 tools/cf_purge.py --output docs/output --dry-run   # 只印，不呼叫 API

需要環境變數 CF_ZONE_ID 與 CF_PURGE_TOKEN，token 權限只需 Zone -> Cache Purge。
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import quote

# Pro 方案 purge by URL 的單次上限。Enterprise 是 500，改方案時記得一起調。
BATCH_SIZE = 30
API = "https://api.cloudflare.com/client/v4/zones/{zone}/purge_cache"
DEFAULT_BASE_URL = "https://anoni.net/docs"


def to_url(rel_path: Path, base_url: str) -> str:
    """把產物的相對路徑映射成對外網址。"""
    parts = list(rel_path.parts)
    if parts and parts[-1] == "index.html":
        parts = parts[:-1]
        tail = "/".join(quote(p, safe="") for p in parts)
        return f"{base_url}/{tail}/" if tail else f"{base_url}/"
    tail = "/".join(quote(p, safe="") for p in parts)
    return f"{base_url}/{tail}"


def collect_urls(output_dir: Path, base_url: str) -> list[str]:
    """列出這份產物對應的所有網址，含不帶結尾斜線的站台根路徑。"""
    base_url = base_url.rstrip("/")
    urls = {
        to_url(p.relative_to(output_dir), base_url)
        for p in output_dir.rglob("*")
        if p.is_file()
    }
    # nginx 對 `/docs`（無結尾斜線）自己發 301，那個回應也會進 edge 快取。
    urls.add(base_url)
    return sorted(urls)


def batched(items: list[str], size: int):
    for i in range(0, len(items), size):
        yield items[i : i + size]


def purge_batch(zone: str, token: str, urls: list[str], attempts: int = 3) -> None:
    """送出一批 purge，失敗時重試。全部失敗就丟 RuntimeError。"""
    body = json.dumps({"files": urls}).encode("utf-8")
    req = urllib.request.Request(
        API.format(zone=zone),
        data=body,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    last_err = ""
    for attempt in range(1, attempts + 1):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
            if payload.get("success") is True:
                return
            last_err = json.dumps(payload.get("errors", payload), ensure_ascii=False)
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", "replace")[:500]
            last_err = f"HTTP {exc.code}: {detail}"
            # 認證與權限錯誤重試幾次也不會變，直接放棄。
            if exc.code in (400, 401, 403):
                break
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            last_err = f"{type(exc).__name__}: {exc}"
        if attempt < attempts:
            time.sleep(2 * attempt)
    raise RuntimeError(last_err or "unknown error")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True, help="建置產物目錄（例如 docs/output）")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="對外網址前綴")
    parser.add_argument("--dry-run", action="store_true", help="只印出網址，不呼叫 API")
    args = parser.parse_args()

    output_dir = Path(args.output)
    if not output_dir.is_dir():
        print(f"::error::找不到產物目錄 {output_dir}", file=sys.stderr)
        return 1

    urls = collect_urls(output_dir, args.base_url)
    # 產物是空的代表前面的建置或搬移出了問題，清空快取只會讓狀況更糟。
    if len(urls) <= 1:
        print(f"::error::{output_dir} 幾乎沒有檔案，中止清除", file=sys.stderr)
        return 1

    batches = list(batched(urls, BATCH_SIZE))
    print(f"準備清除 {len(urls)} 個網址，分 {len(batches)} 批（每批最多 {BATCH_SIZE} 條）")

    if args.dry_run:
        for u in urls:
            print(u)
        return 0

    zone = os.environ.get("CF_ZONE_ID", "")
    token = os.environ.get("CF_PURGE_TOKEN", "")
    if not zone or not token:
        print(
            "::warning::CF_ZONE_ID 或 CF_PURGE_TOKEN 未設定，略過快取清除。"
            "S3 已更新，但站上可能還是舊內容。",
        )
        return 0

    for i, chunk in enumerate(batches, 1):
        try:
            purge_batch(zone, token, chunk)
        except RuntimeError as exc:
            print(f"::error::第 {i}/{len(batches)} 批清除失敗：{exc}", file=sys.stderr)
            return 1
        print(f"  第 {i}/{len(batches)} 批完成（{len(chunk)} 條）")

    print(f"Cloudflare 快取已清除，共 {len(urls)} 個 {args.base_url} 底下的網址")
    return 0


if __name__ == "__main__":
    sys.exit(main())
