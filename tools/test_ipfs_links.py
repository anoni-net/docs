#!/usr/bin/env python3
"""ipfs_links.py 的回歸測試。

這支決定 IPFS 鏡像裡的文件站連到哪裡。錯的方向各有各的安靜：

- <body> 的連結漏改：讀者在鏡像裡點一下就回到 clearnet，anoni.net 停擺時那個連結是斷的
- <head> 被改成相對路徑：canonical 失效，搜尋引擎可能把鏡像當成另一個網站收錄
- Gears 與 API 被改寫：鏡像裡沒有這兩個網站，連結落在 404

不需要建置產物。執行：

    python3 tools/test_ipfs_links.py
"""

from __future__ import annotations

import pathlib
import sys
import tempfile

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

from ipfs_links import check, problems_in, rewrite_html, rewrite_url  # noqa: E402

failures: list[str] = []


def expect(label: str, got, want) -> None:
    if got != want:
        failures.append(f"{label}\n    got:  {got!r}\n    want: {want!r}")


# 連結的改寫
for url, want in [
    ("https://anoni.net/docs/tools/", "/docs/tools/"),
    ("https://anoni.net/join/pin-ipfs-mirror/", "/join/pin-ipfs-mirror/"),
    ("https://anoni.net/news/2026/10/x/", "/news/2026/10/x/"),
    ("https://anoni.net", "/"),
    ("https://anoni.net/gears/", "https://anoni.net/gears/"),
    ("https://anoni.net/api/readme", "https://anoni.net/api/readme"),
    ("https://form.anoni.net/s/abc", "https://form.anoni.net/s/abc"),
    ("https://anoni.network/", "https://anoni.network/"),
    ("../basics/", "../basics/"),
]:
    expect(f"rewrite_url({url})", rewrite_url(url), want)

PAGE = (
    '<html><head><link rel="canonical" href="https://anoni.net/docs/tools/">'
    '<meta property="og:url" content="https://anoni.net/docs/tools/"></head>'
    '<body><a href="https://anoni.net/join/">參與</a>'
    '<img src="https://anoni.net/docs/assets/x.png">'
    '<code>https://anoni.net/docs/</code>'
    '<a href="https://anoni.net/gears/">Gears</a></body></html>'
)
out = rewrite_html(PAGE)
expect("canonical 不動", '<link rel="canonical" href="https://anoni.net/docs/tools/">' in out, True)
expect("og:url 不動", 'content="https://anoni.net/docs/tools/"' in out, True)
expect("body 的連結改寫", '<a href="/join/">' in out, True)
expect("body 的圖片改寫", '<img src="/docs/assets/x.png">' in out, True)
expect("內文寫出來的網址不動", "<code>https://anoni.net/docs/</code>" in out, True)
expect("Gears 維持 clearnet", '<a href="https://anoni.net/gears/">' in out, True)
expect("沒有 <body> 的片段整段不改", rewrite_html('<a href="https://anoni.net/">x</a>'), '<a href="https://anoni.net/">x</a>')
expect("改寫過的頁面檢查通過", problems_in(out, "p"), [])

# 檢查要擋得下的三種
expect("漏改的連結", problems_in(PAGE, "p"), ["p：連結沒有改寫 https://anoni.net/join/", "p：連結沒有改寫 https://anoni.net/docs/assets/x.png"])

# 搬到社群首頁的頁面留下的轉址頁，轉址目標要改，canonical 不改
REDIRECT_PAGE = (
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Redirecting...</title>'
    '<link rel="canonical" href="https://anoni.net/join/">'
    '<script>var anchor=window.location.hash.substr(1);location.href="https://anoni.net/join/"+(anchor?"#"+anchor:"")</script>'
    '<meta http-equiv="refresh" content="0; url=https://anoni.net/join/"></head>'
    '<body>You\'re being redirected to a <a href="https://anoni.net/join/">new destination</a>.</body></html>'
)
moved = rewrite_html(REDIRECT_PAGE)
expect("轉址頁的 canonical 不動", '<link rel="canonical" href="https://anoni.net/join/">' in moved, True)
expect("轉址頁的 location.href", 'location.href="/join/"' in moved, True)
expect("轉址頁的 meta refresh", 'content="0; url=/join/"' in moved, True)
expect("轉址頁改寫後檢查通過", problems_in(moved, "r"), [])
expect("轉址頁沒改寫", len(problems_in(REDIRECT_PAGE, "r")), 3)

with tempfile.TemporaryDirectory() as tmp:
    root = pathlib.Path(tmp)
    expect("空目錄", check(root), [f"{root} 底下沒有任何頁面"])
    home = out.replace("https://anoni.net/docs/tools/", "https://anoni.net/docs/")
    for rel in ("index.html", "zh-cn/index.html", "en/index.html"):
        (root / rel).parent.mkdir(parents=True, exist_ok=True)
        (root / rel).write_text(home.replace("/docs/", "/docs/" + rel.replace("index.html", "")), encoding="utf-8")
    expect("乾淨的產物", check(root), [])
    # site_url 被改成閘道的話，三個首頁的 canonical 都會跟著錯
    (root / "en/index.html").write_text(home.replace('canonical" href="https://anoni.net/docs/', 'canonical" href="https://ipfs.anoni.net/'), encoding="utf-8")
    expect("canonical 指到閘道", check(root), ["en/index.html：canonical 沒有指向 https://anoni.net/docs/（https://ipfs.anoni.net/）"])
    (root / "en/index.html").write_text(home.replace("/docs/", "/docs/en/"), encoding="utf-8")
    (root / "js").mkdir()
    (root / "js" / "analytics.js").write_text('fetch("https://aa.anoni.net/api/send")', encoding="utf-8")
    expect("流量統計的端點", check(root), ["js/analytics.js：有流量統計的端點 aa.anoni.net"])

if failures:
    print(f"{len(failures)} 項失敗：")
    print("\n".join(failures))
    sys.exit(1)
print("ipfs_links 測試通過")
