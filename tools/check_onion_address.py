#!/usr/bin/env python3
"""
onion 位址的單一來源檢查。

=== 為什麼需要這支 ===

onion 位址從金鑰推出來，換金鑰就換位址。換的時候如果只改了一半，症狀是
「建置成功、CI 全綠、產物看起來正常」，壞掉的只有讀者點下去那一刻，而且
onion 讀者多半沒有第二條路可走。

2026-09-11 盤點時，同一個位址出現在 23 個檔案裡。其中六份模板各自寫死一次，
而 overrides/partials/header.html 早就用 config.extra.onion_base 了，同一件事
兩套做法，正確的那一套只用在一個地方。改寫腳本裡另外寫死八處。

現在機器讀的地方收斂成這些：

  - docs/replace_sitename_anoni_onion.sh 的 ONION_ROOT 預設值（本機執行用）
  - .github/workflows/build_docs.yml 的 ONION_ROOT 環境變數（CI 用）
  - 三份 mkdocs 設定的 extra.onion_base
  - 三份 mkdocs 設定的 extra.social 裡那一個 Tor 圖示連結

最後那一組沒辦法再收斂，YAML 沒有把 !ENV 的值接上路徑的寫法，而那個連結各語系
的路徑不同。它渲染在每一頁的頁尾，第一輪盤點正好漏掉它，因為用檔案層級的 grep
去數，同一個檔案裡的兩處被算成一處。

這一支比對這幾邊是不是同一個位址，並且確認模板與建置腳本裡沒有第二處寫死。
文章與 README 裡的位址不在管轄範圍，那些是給人讀的，輪替時由人決定要不要改，
這一支只把它們列出來當清單。

=== 怎麼驗 ===

純文字比對，不建置也不連網。要證明它擋得住，把任何一邊的位址改一個字元再執行。

用法：
  python3 tools/check_onion_address.py
"""
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent

SH = ROOT / "docs" / "replace_sitename_anoni_onion.sh"
WORKFLOW = ROOT / ".github" / "workflows" / "build_docs.yml"
CONFIGS = [
    ROOT / "docs" / "mkdocs.yml",
    ROOT / "docs" / "mkdocs_cn.yml",
    ROOT / "docs" / "mkdocs_en.yml",
]
TEMPLATE_DIRS = [
    ROOT / "docs" / "overrides",
    ROOT / "docs" / "overrides_cn",
    ROOT / "docs" / "overrides_en",
]

# v3 的位址是 56 個 base32 字元加 .onion，前面可以有子網域
ONION = re.compile(r"\b(?:[a-z0-9-]+\.)*([a-z2-7]{56}\.onion)\b")

problems = []
notes = []


def read(path):
    return path.read_text(encoding="utf-8")


def one(pattern, text, label):
    found = re.findall(pattern, text)
    if len(found) != 1:
        problems.append(f"{label}：預期剛好一處，實際 {len(found)} 處")
        return None
    return found[0]


sh_text = read(SH)
root_sh = one(r'ONION_ROOT="\$\{ONION_ROOT:-([a-z2-7]{56}\.onion)\}"', sh_text, f"{SH.name} 的 ONION_ROOT 預設值")

wf_text = read(WORKFLOW)
root_wf = one(r"\n\s+ONION_ROOT:\s*([a-z2-7]{56}\.onion)", wf_text, f"{WORKFLOW.name} 的 ONION_ROOT")

if root_sh and root_wf and root_sh != root_wf:
    problems.append(
        f"位址對不上：{SH.name} 是 {root_sh}，{WORKFLOW.name} 是 {root_wf}"
    )

root = root_sh or root_wf
if root:
    want = f"http://docs.{root}"
    for cfg in CONFIGS:
        text = read(cfg)
        got = one(r'onion_base:\s*!ENV \[ONION_BASE, "([^"]+)"\]', text, f"{cfg.name} 的 onion_base")
        if got and got != want:
            problems.append(f"{cfg.name} 的 onion_base 是 {got}，應該是 {want}")

        # extra.social 的 Tor 圖示連結。YAML 沒辦法把 !ENV 的值接上路徑，所以這一處
        # 只能寫死，那就把它綁在同一個位址上。它渲染在每一頁的頁尾，漏改的話整站
        # 都會指向死掉的位址，而 2026-09-11 第一輪盤點正好漏掉它：用檔案層級的
        # grep 去數，同一個檔案裡的兩處被算成一處。
        link = one(r"icon: simple/torbrowser\n\s+link: (\S+)", text, f"{cfg.name} 的 social Tor 連結")
        if link and not link.startswith(want + "/"):
            problems.append(f"{cfg.name} 的 social Tor 連結是 {link}，應該以 {want}/ 開頭")

        hits = ONION.findall(text)
        if len(hits) != 2:
            problems.append(f"{cfg.name} 裡出現 {len(hits)} 處位址，應該只有 onion_base 與 social 兩處")

# 機器讀的地方不准有第二處寫死。位址一旦換掉，漏改的那一處不會有任何徵兆。
for path, allowed in [(SH, 1), (WORKFLOW, 1)]:
    hits = ONION.findall(read(path))
    if len(hits) != allowed:
        problems.append(f"{path.name} 裡出現 {len(hits)} 處位址，應該只有 {allowed} 處")

for directory in TEMPLATE_DIRS:
    if not directory.is_dir():
        continue
    for path in sorted(directory.rglob("*")):
        if not path.is_file() or path.is_symlink():
            continue
        hits = ONION.findall(read(path))
        if hits:
            rel = path.relative_to(ROOT)
            problems.append(f"{rel} 裡寫死了 onion 位址，改用 config.extra.onion_base")

# 文章與說明文件裡的位址不擋，列出來當輪替時的人工清單。只列本站的位址，
# 文章裡引用別人的 onion 服務跟這件事無關。
if root:
    for path in sorted(ROOT.rglob("*.md")):
        rel = path.relative_to(ROOT)
        if str(rel).startswith(("docs/output/", ".git/")):
            continue
        if root in read(path):
            notes.append(str(rel))

print(f"  位址：{root or '（讀不到）'}")
print(f"  機器讀的地方：{SH.name}、{WORKFLOW.name}、mkdocs 三份各兩處")
if notes:
    print(f"  文章與說明文件裡另外提到 {len(notes)} 處，輪替時由人決定要不要改：")
    for item in notes:
        print(f"    {item}")

if problems:
    print()
    for item in problems:
        print(f"  ✗ {item}")
    print(f"\n{len(problems)} 個問題")
    sys.exit(1)

print("\n機器讀的地方位址一致，模板與建置腳本裡沒有第二處寫死")
