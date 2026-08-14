#!/usr/bin/env python3
"""anoni.net/docs 編輯標準掃描器（Tier 1）。

把貢獻者百科「寫作風格規範」裡可機器判斷的硬規則做成檢查，輸出 file:line 與
規則代碼。語意層的規則（去 AI 味、安全配方、操作者帳號、三段對稱）需 AI 或人工
複審，不在此掃描，清單見 tools/README.md。

用法：
    python3 tools/docs_style_lint.py <檔案或目錄> [...]
    python3 tools/docs_style_lint.py --no-warn <path>     # 只看 error
    python3 tools/docs_style_lint.py --format json <path>

掃描前會剝除 fenced code、inline code、HTML 註解、Markdown 連結的 URL 與裸 URL，
避免在程式碼與網址上誤判。front matter 不套用內文標點規則，只做欄位檢查。em-dash
規則對下列情況放行：表格空資料格佔位（| — |）、引用的連結標題（[原文標題](url)，
照錄來源原文）、以及 docs/en 英文檔（破折號在英文是正常排版）。

exit code：有任一 error 回 1，否則回 0（warn 不影響 exit code）。
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

# 嚴重度
ERROR = "error"
WARN = "warn"

# (代碼, 嚴重度, 已編譯 regex, 訊息)。regex 跑在「已剝除程式碼/URL」的內文上。
PROSE_RULES = [
    ("em-dash", ERROR, re.compile(r"—"),
     "禁用破折號「—」，改用冒號、逗號或拆成兩句"),
    ("semicolon", ERROR, re.compile(r"；"),
     "避免分號「；」，改用「。」或拆句"),
    ("fullwidth-slash", ERROR, re.compile(r"／"),
     "不使用全形「／」，並列用「、」，需斜線用半形 /"),
    ("bushi-ershi", ERROR, re.compile(r"不是[^。！？\n]{0,40}?而是"),
     "禁用「不是…而是…」句型，改用正向直述"),
    ("buzhi-ershi", ERROR, re.compile(r"不再只是[^。！？\n]{0,40}?而是"),
     "禁用「不再只是…而是…」句型，改用正向直述"),
    ("quote-juxtapose", ERROR, re.compile(r"」「"),
     "並列引號之間要加「、」（「甲」、「乙」）"),
    # 定義句型，偶有正當用法（指的是），列為 warn
    ("definition-phrasing", WARN, re.compile(r"(談的是|指的是|涵蓋的是)"),
     "避免「談的是/指的是/涵蓋的是」，直接把定義說完整"),
    # 機器欄位名直接出現在內文，提醒人性化（附原文）
    ("machine-field", WARN, re.compile(r"\bweb_connectivity\b"),
     "機器欄位名請人性化並附原文，例：網路連線測試（Web Connectivity）"),
    # 段落開頭的粗體整句，是 AI 寫作的典型模式，屬「精簡與去 AI 味」那一節。
    # 只攔「粗體內容自成一句、以句號收尾」的形式，例：**位置。** 後面接內文。
    # 粗體詞當句子成分（**對照日**用同樣的參數）與清單標籤（**資料來源**：…）不在
    # 此限，兩者都不帶句號，regex 因此以「。」為判準。改法要看語境（並列的升成小
    # 標題，單獨一段改寫成正常句子），機器不宜代勞，列 warn。
    ("bold-lead-sentence", WARN, re.compile(r"^\*\*[^*\n]+。\*\*"),
     "段落開頭不要用粗體整句，並列項目升成小標題，單獨一段改寫成正常句子"),
]

# 句首 AI 套語（套用在剝除後、每行去掉清單/引言標記後的開頭）
AI_OPENERS = ["值得注意的是", "總的來說", "綜上所述"]
AI_OPENER_RE = re.compile(r"^[\s>*\-+]*(" + "|".join(AI_OPENERS) + r")")

# 「這／这」密集重複。貢獻者百科已有「避免『這…』開頭」，但沒有密度標準，實際校稿
# 時反覆處理的是同一句裡連著出現的指代堆疊，例：
#
#     這件事說明有人在賣這個概念，不等於這套技術已經在大規模運作
#
# 判定分兩種，命中任一就報：同一句 3 次以上，或相鄰兩個之間隔不到 ZHE_GAP + 1 個字。
# 距離門檻取 8，是對全站 429 篇試跑校準出來的，再放寬會開始收進正當用法（相隔十幾
# 個字的兩個「這」指涉不同對象，讀起來不重複）。改法要看語境（換成它指的名詞、拆句、
# 或整句重寫），機器不宜代勞，列 warn。
ZHE_RE = re.compile(r"[這这]")
ZHE_GAP = 8
# 句子單位。表格的 | 也算分隔，同一列不同格是獨立內容，不該互相累計。
ZHE_SPLIT = re.compile(r"[。！？|]")

# 口語「講」，扣掉常見正當詞。繁簡兩種寫法都收。
#
# 原本只比對正體「講」，zh-CN 完全不受檢查。實測 zh-CN 全站 86 個「讲」裡
# 83 個是正當複合詞，欠債很少，但規則本身的缺口會讓新寫的簡中內容一路漏掉。
# 「合講／合讲」（共同演講）與「講演／讲演」也是正當用法，一併收進例外清單。
JIANG_RE = re.compile(r"[講讲]")
JIANG_ALLOW = re.compile(
    r"(演講|講座|講師|講者|講習|講義|講堂|講稿|講話|講求|講究|講評|宣講|主講|開講|聽講|合講|講評|講演"
    r"|演讲|讲座|讲师|讲者|讲习|讲义|讲堂|讲稿|讲话|讲求|讲究|讲评|宣讲|主讲|开讲|听讲|合讲|讲演)"
)

# 其餘口語詞（貢獻者百科「口語字改書面語」）。比對方式與 JIANG 相同：
# 取命中處前後各 2 字的視窗去對例外清單，避開正當複合詞。繁簡兩種寫法都收。
# 全部列為 warn，因為替換詞要看語境（跑 → 執行／架設／運作／營運），不宜機器直接改。
COLLOQUIAL_RULES = [
    ("colloquial-run", re.compile(r"跑"),
     re.compile(r"(跑步|奔跑|跑道|賽跑|长跑|長跑|赛跑|跑很慢)"),
     "口語「跑」請依語境改書面語（執行、架設、運作、營運）"),
    ("colloquial-get", re.compile(r"拿到"), None,
     "「拿到」改書面語（取得）"),
    # 例外字集原本繁簡混雜且不對稱（有「曉」「捨」卻沒有「晓」「舍」），
    # 簡中的「晓得先」「舍得先」會誤報。兩套都補齊。
    ("colloquial-must", re.compile(r"(?<![值取懂覺記使獲曉捨觉记获晓舍])得(先|靠)"), None,
     "口語「得先／得靠」改書面語（需先、需仰賴）"),
    ("colloquial-hands-on", re.compile(r"動手|动手"), None,
     "「動手」改書面語（實際操作、著手、實作）"),
    ("filler-transition", re.compile(r"(換句話說|换句话说|其實(?![施質力現體效作驗例況用行政])|其实(?![施质力现体效作验例况用行政]))"), None,
     "填充轉折請刪除或改寫（貢獻者百科「去 AI 味」一節）"),
    # 「怎樣」的替換要看文法：當副詞（怎樣做）用「如何」，當修飾語（怎樣的 X）
    # 用「什麼樣的」。「長怎樣」在臺灣是固定說法，改「長如何」不成話，要整句改寫。
    ("colloquial-zenyang", re.compile(r"怎樣|怎样"), None,
     "「怎樣」改書面語：副詞用「如何」，修飾語（怎樣的 X）用「什麼樣的」，「長怎樣」整句改寫"),
    ("colloquial-word", re.compile(
        r"(踩到|找上門|找上门|省事|省力|照舊|照旧|差不多|沒空|没空|搞|弄壞|弄坏|弄錯|弄错|掛了|挂了)"),
     None, "口語詞請改書面語"),
]

# 部落格 front matter 必填欄位（title 來自 H1，不在此列）
BLOG_REQUIRED = ["date", "slug", "categories", "authors"]

# inline 關閉指令：<!-- docs-style-lint: disable --> / enable / disable-line
LINT_DIRECTIVE = re.compile(r"<!--\s*docs-style-lint:\s*(disable|enable|disable-line)\s*-->")

# 規則文件本身會引用被禁的句型當例子，預設略過（可用 --include-rule-docs 強制掃）
RULE_DOCS = {
    "contributor-handbook.md",
    "docs-writing-style.md",
    "BECOME_ANONI.md",
    "BECOME_ANONI.zh-CN.md",
}


def split_front_matter(text: str):
    """回傳 (front_matter_lines, body_start_lineno, fm_dict)。沒有 front matter 回 ([],0,{})。"""
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return [], 0, {}
    for i in range(1, len(lines)):
        if lines[i].strip() in ("---", "..."):
            fm = {}
            for ln in lines[1:i]:
                m = re.match(r"^([A-Za-z0-9_\-]+)\s*:", ln)
                if m:
                    fm[m.group(1)] = ln.split(":", 1)[1].strip()
            return lines[1:i], i + 1, fm
    return [], 0, {}


def strip_noise(line: str, state: dict) -> str:
    """把程式碼、URL、註解換成等長空白，保留行號與其餘字元位置。"""
    # 多行 fenced code
    fence = re.match(r"^\s*(```|~~~)", line)
    if state.get("in_fence"):
        if fence:
            state["in_fence"] = False
        return " " * len(line)
    if fence:
        state["in_fence"] = True
        return " " * len(line)
    # 多行 HTML 註解
    out = line
    if state.get("in_comment"):
        end = out.find("-->")
        if end == -1:
            return " " * len(out)
        out = " " * (end + 3) + out[end + 3:]
        state["in_comment"] = False

    def blank(m):
        return " " * len(m.group(0))

    # 單行 HTML 註解 / 未閉合註解
    out = re.sub(r"<!--.*?-->", blank, out)
    if "<!--" in out:
        idx = out.index("<!--")
        state["in_comment"] = True
        out = out[:idx] + " " * (len(out) - idx)
    # inline code
    out = re.sub(r"`[^`]*`", blank, out)
    # Markdown 連結的 URL 部分：[text](url) → 保留 [text]，URL 換空白
    out = re.sub(r"(\]\()([^)]*)(\))", lambda m: m.group(1) + " " * len(m.group(2)) + m.group(3), out)
    # 裸 URL
    out = re.sub(r"https?://\S+", blank, out)
    return out


def in_empty_table_cell(clean: str, pos: int) -> bool:
    """clean 行中 pos 位置的破折號，是否為「整格只有一個破折號」的表格空資料格。

    表格用 `| — |` 表示該格無資料是正當寫法，不該套用 em-dash 插入語規則。判定條件：
    位置左右最近的 `|` 之間、去空白後剛好只有一個破折號。其餘情況（插入語、與文字
    混在同一格）仍會被標記。
    """
    left = clean.rfind("|", 0, pos)
    right = clean.find("|", pos)
    if left == -1 or right == -1:
        return False
    return clean[left + 1:right].strip() == "—"


def in_link_text(clean: str, pos: int) -> bool:
    """clean 行中 pos 位置的破折號，是否落在 Markdown 連結文字 [text](url) 的 text 內。

    引用外部資料時，連結文字常是來源的原始標題，標題本身的破折號屬照錄，不該套用
    插入語規則（例：`[Developer mode — apps...](url)`）。判定條件：pos 左右最近的
    `[` `]` 之間沒有其他中括號，且 `]` 後緊接 `(`（行內連結，而非一般方括號）。
    """
    left = clean.rfind("[", 0, pos)
    right = clean.find("]", pos)
    if left == -1 or right == -1:
        return False
    if "]" in clean[left + 1:pos] or "[" in clean[pos:right]:
        return False
    return right + 1 < len(clean) and clean[right + 1] == "("


def iter_sentences(clean: str):
    """把一行切成句子單位，回傳 (該句在行內的起始位移, 句子文字)。

    strip_noise 保持長度不變，所以位移可以直接拿去索引原始行，用來取 snippet。
    """
    start = 0
    for m in ZHE_SPLIT.finditer(clean):
        yield start, clean[start:m.start()]
        start = m.end()
    yield start, clean[start:]


def check_zhe_repeat(raw: str, clean: str):
    """回傳該行所有「這」密集重複的 (訊息, snippet)，一個句子單位最多報一次。"""
    out = []
    for off, sent in iter_sentences(clean):
        pos = [m.start() for m in ZHE_RE.finditer(sent)]
        if len(pos) >= 3:
            reason = f"同一句出現 {len(pos)} 次"
        elif any(b - a <= ZHE_GAP for a, b in zip(pos, pos[1:])):
            reason = f"相鄰兩個相隔不到 {ZHE_GAP + 1} 個字"
        else:
            continue
        snippet = raw[off + pos[0]: off + pos[-1] + 6].strip()
        out.append((f"「這」密集重複（{reason}），改成它指的名詞或拆句重寫", snippet[:40]))
    return out


def is_english_doc(path: Path) -> bool:
    """en 文件採英文排版，破折號 — 屬正常用法，不套用 em-dash 規則。

    對應 CI 既有設定（docs-style-lint.yml 只掃 docs/zh-TW、docs/zh-CN）。手動對含
    docs/en 的路徑掃描時，這裡確保 en 不被 em-dash 規則誤判。
    """
    return "/en/" in path.as_posix()


def lint_file(path: Path):
    findings = []
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as e:
        findings.append((0, ERROR, "read-error", str(e), ""))
        return findings

    fm_lines, body_start, fm = split_front_matter(text)

    # front matter 欄位檢查（只對 blog posts 強制全部欄位）
    if "/blog/posts/" in path.as_posix():
        for key in BLOG_REQUIRED:
            if key not in fm:
                findings.append((1, ERROR, "frontmatter-missing",
                                 f"blog post 缺 front matter 欄位「{key}」", ""))
        has_h1 = re.search(r"^# \S", text, re.MULTILINE) is not None
        if "title" not in fm and not has_h1:
            findings.append((1, WARN, "title-missing",
                             "blog post 沒有 title front matter，也沒有 H1 標題", ""))
        if "summary" not in fm and "description" not in fm:
            findings.append((1, WARN, "frontmatter-summary",
                             "blog post 建議有 summary 或 description", ""))

    english = is_english_doc(path)
    state = {}
    in_fm = bool(fm_lines)
    fm_end_line = body_start  # 1-based 行號：front matter 結尾的 --- 行
    disabled = False
    for i, raw in enumerate(text.splitlines(), start=1):
        # 略過 front matter 區塊（含起訖 ---）的內文規則
        if in_fm and i <= fm_end_line:
            continue
        d = LINT_DIRECTIVE.search(raw)
        if d:
            kind = d.group(1)
            if kind == "disable":
                disabled = True
                continue
            if kind == "enable":
                disabled = False
                continue
            if kind == "disable-line":
                continue
        if disabled:
            continue
        clean = strip_noise(raw, state)
        if not clean.strip():
            continue
        for code, sev, rx, msg in PROSE_RULES:
            if code == "em-dash" and english:
                continue
            for m in rx.finditer(clean):
                # em-dash 放行：表格空資料格（| — |）與引用的連結標題（[原文標題](url)）
                if code == "em-dash" and (
                    in_empty_table_cell(clean, m.start())
                    or in_link_text(clean, m.start())
                ):
                    continue
                snippet = raw[max(0, m.start() - 8): m.start() + 12].strip()
                findings.append((i, sev, code, msg, snippet))
        if AI_OPENER_RE.search(clean):
            findings.append((i, ERROR, "ai-opener",
                             "避免以「值得注意的是/總的來說/綜上所述」開頭", raw.strip()[:24]))
        for msg, snippet in check_zhe_repeat(raw, clean):
            findings.append((i, WARN, "zhe-repeat", msg, snippet))
        for m in JIANG_RE.finditer(clean):
            around = clean[max(0, m.start() - 1): m.start() + 2]
            if not JIANG_ALLOW.search(around):
                findings.append((i, WARN, "colloquial-jiang",
                                 "口語「講」建議改書面語（提到、說明）", raw[max(0, m.start() - 6): m.start() + 6].strip()))
        for code, rx, allow, msg in COLLOQUIAL_RULES:
            for m in rx.finditer(clean):
                around = clean[max(0, m.start() - 2): m.end() + 2]
                if allow is not None and allow.search(around):
                    continue
                findings.append((i, WARN, code, msg,
                                 raw[max(0, m.start() - 6): m.start() + 6].strip()))
    return findings


def iter_md(paths):
    for p in paths:
        p = Path(p)
        if p.is_dir():
            yield from sorted(p.rglob("*.md"))
        elif p.suffix == ".md":
            yield p


def main(argv=None):
    ap = argparse.ArgumentParser(description="anoni.net/docs 編輯標準掃描器（Tier 1）")
    ap.add_argument("paths", nargs="+", help="要掃描的 .md 檔或目錄")
    ap.add_argument("--no-warn", action="store_true", help="只顯示 error")
    ap.add_argument("--include-rule-docs", action="store_true",
                    help="連規則文件本身（貢獻者百科等）一起掃")
    ap.add_argument("--format", choices=["text", "json", "github"], default="text",
                    help="github: 輸出 GitHub Actions annotation（::error/::warning）")
    args = ap.parse_args(argv)

    results = {}
    n_err = n_warn = n_files = n_skipped = 0
    for f in iter_md(args.paths):
        if not args.include_rule_docs and f.name in RULE_DOCS:
            n_skipped += 1
            continue
        n_files += 1
        items = lint_file(f)
        if args.no_warn:
            items = [x for x in items if x[1] == ERROR]
        if not items:
            continue
        results[str(f)] = items
        for _, sev, *_ in items:
            if sev == ERROR:
                n_err += 1
            else:
                n_warn += 1

    if args.format == "json":
        out = {fp: [dict(line=l, severity=s, rule=c, message=m, snippet=sn)
                    for (l, s, c, m, sn) in items]
               for fp, items in results.items()}
        print(json.dumps({"files": out, "errors": n_err, "warnings": n_warn},
                         ensure_ascii=False, indent=2))
    elif args.format == "github":
        # GitHub Actions workflow command，問題會 inline 標在 PR 變更行上
        for fp, items in results.items():
            for (l, sev, code, msg, sn) in sorted(items):
                cmd = "error" if sev == ERROR else "warning"
                text = f"[{code}] {msg}" + (f"  | {sn}" if sn else "")
                text = text.replace("%", "%25").replace("\r", "%0D").replace("\n", "%0A")
                print(f"::{cmd} file={fp},line={l}::{text}")
        print(f"docs-style-lint: {n_err} error, {n_warn} warn, {n_files} files",
              file=sys.stderr)
    else:
        for fp, items in results.items():
            print(f"\n{fp}")
            for (l, sev, code, msg, sn) in sorted(items):
                tag = "ERROR" if sev == ERROR else "warn "
                extra = f"  | {sn}" if sn else ""
                print(f"  {l:>4}: {tag} [{code}] {msg}{extra}")
        skip_note = f"，略過規則文件 {n_skipped} 個" if n_skipped else ""
        print(f"\n總計：{n_err} error、{n_warn} warn，掃描 {n_files} 個檔案{skip_note}")

    return 1 if n_err else 0


if __name__ == "__main__":
    sys.exit(main())
