#!/usr/bin/env python3
"""docs_style_lint.py 的回歸測試。

這支 linter 是全站寫作規範的守門員，但先前沒有任何測試。實際踩過兩個 bug：

1. `JIANG_RE` 只比對正體「講」，簡體「讲」完全不受檢查，zh-CN 等於沒有這條規則。
2. `colloquial-must` 的 lookbehind 例外字集繁簡不對稱（有「曉」「捨」沒有「晓」「舍」），
   簡中的「晓得先」會誤報。

兩個都是「規則寫了但覆蓋不全」，靠人工抽樣看不出來，只有逐條列出期望行為才會現形。
新增或修改規則時，請一併在這裡補上「應攔」與「不應攔」兩組案例。

執行：

    python3 tools/test_docs_style_lint.py

沒有外部依賴，不需要 pytest。
"""

from __future__ import annotations

import pathlib
import re
import subprocess
import sys
import tempfile

LINT = pathlib.Path(__file__).with_name("docs_style_lint.py")

# (本文, 應該被攔下來嗎, 說明)
CASES: list[tuple[str, bool, str]] = [
    # --- em-dash（error）---
    ("這是一段話——插入語——後面接著。", True, "em-dash 雙破折號"),
    ("這是一段話：後面接著。", False, "冒號取代破折號"),

    # --- 不是…而是…（error）---
    ("重點不是速度，而是正確。", True, "不是…而是…"),
    ("重點在於正確。", False, "正向直述"),

    # --- 分號 ---
    ("先做這件事；再做那件事。", True, "全形分號斷句"),
    ("先做這件事。再做那件事。", False, "改用句號"),

    # --- 全形斜線 ---
    ("讀寫／執行權限", True, "全形斜線"),
    ("讀寫、執行權限", False, "頓號並列"),

    # --- 連續引號之間要有頓號 ---
    ("角色分為「決策者」「被諮詢者」。", True, "連續引號未加頓號"),
    ("角色分為「決策者」、「被諮詢者」。", False, "引號間有頓號"),

    # --- 句首 AI 套語 ---
    ("值得注意的是，這個設計有取捨。", True, "AI 開場語"),
    ("這個設計有取捨。", False, "直接進入重點"),

    # --- 口語「講」：繁簡都要攔，正當複合詞都要放 ---
    ("他在會上講了這件事。", True, "口語 講（正體）"),
    ("他在会上讲了这件事。", True, "口語 讲（簡體，先前完全漏掉）"),
    ("這場演講很精彩。", False, "演講"),
    ("这场演讲很精彩。", False, "演讲"),
    ("主講人是誰。", False, "主講"),
    ("主讲人是谁。", False, "主讲"),
    ("他講座辦得很好。", False, "講座"),
    ("他讲座办得很好。", False, "讲座"),
    ("與某人合講一場議程。", False, "合講（共同演講）"),
    ("与某人合讲一场议程。", False, "合讲"),

    # --- 得先／得靠：例外字集必須繁簡對稱 ---
    ("你得先安裝套件。", True, "得先"),
    ("這件事得靠社群。", True, "得靠"),
    ("我不曉得先做哪個。", False, "曉得先（正體）"),
    ("我不晓得先做哪个。", False, "晓得先（簡體，先前誤報）"),
    ("我記得先前提過。", False, "記得先前"),

    # --- 其餘口語詞（繁簡並收）---
    ("我們動手改設定。", True, "動手（正體）"),
    ("我们动手改设定。", True, "动手（簡體）"),
    ("這個工具跑起來很快。", True, "跑（執行軟體）"),
    ("他每天跑步。", False, "跑步"),
    ("我拿到了金鑰。", True, "拿到"),
    ("你想知道它長怎樣。", True, "怎樣"),
    ("你想知道它长怎样。", True, "怎样（簡體）"),
    ("換句話說，結論相同。", True, "填充轉折"),
    ("换句话说，结论相同。", True, "填充轉折（簡體）"),
    ("其實作方式如下。", False, "其+實作，不該被「其實」吃掉"),
    ("這樣比較省事。", True, "省事"),
    ("設定被弄壞了。", True, "弄壞"),
    ("设定被弄坏了。", True, "弄坏（簡體）"),

    # --- 「這」密集重複：只攔同句內堆疊，隔得夠遠或跨句都要放行 ---
    ("這件事說明有人在賣這個概念，不等於這套技術可用。", True, "同句 3 次（正體）"),
    ("这件事说明有人在卖这个概念，不等于这套技术可用。", True, "同句 3 次（簡體）"),
    ("這篇文章把這個問題拆成具體設定。", True, "相鄰兩個相隔 5 個字"),
    ("这标志着这个国家进入新阶段。", True, "相鄰兩個相隔 4 個字（簡體）"),
    ("這份報告整理了近三年的觀測資料，接下來說明這些數字怎麼讀。", False, "兩個相隔夠遠"),
    ("這是第一句話。這是第二句話。", False, "分屬兩句，不累計"),
    ("| 這個欄位 | 這個說明 |", False, "表格不同格，不累計"),

    # --- 段落開頭的粗體整句：只攔「自成一句、以句號收尾」的形式 ---
    ("**位置。** OONI 記錄國家與 ASN，不記錄縣市。", True, "粗體整句開頭"),
    ("**第五步，排除誤判。** 兩個當天遇到的例子。", True, "粗體整句開頭（句中帶逗號）"),
    ("**對照日**用同樣的參數，日期換成 8 月 12 日。", False, "粗體詞當句子成分，不帶句號"),
    ("**資料來源**：OONI measurements API。", False, "粗體詞當清單標籤，不帶句號"),
    ("### 位置", False, "改正後的小標題"),
    ("量測結果顯示**下載掉到百分之一。**後續段落說明成因。", False, "粗體不在行首"),
    ("- **想開始寫作或翻譯**：申請 Matrix 帳號。", False, "清單項目的粗體標籤"),

    # --- 抑制指示 ---
    ("這是一段話——插入語。 <!-- docs-style-lint: disable-line -->", False, "disable-line 抑制"),
]

BLOCK_CASE = (
    "<!-- docs-style-lint: disable -->\n"
    "這是一段話——插入語。\n"
    "重點不是速度，而是正確。\n"
    "<!-- docs-style-lint: enable -->\n",
    False,
    "disable/enable 區塊抑制",
)

SUMMARY = re.compile(r"總計：(\d+) error、(\d+) warn")


def run_lint(body: str, tmpdir: pathlib.Path) -> int:
    """回傳 error + warn 的總數。"""
    f = tmpdir / "case.md"
    f.write_text(f"---\ntitle: t\n---\n\n# t\n\n{body}\n", encoding="utf-8")
    out = subprocess.run(
        [sys.executable, str(LINT), str(f)], capture_output=True, text=True
    ).stdout
    m = SUMMARY.search(out)
    if not m:
        raise AssertionError(f"無法解析 linter 輸出：\n{out}")
    return int(m.group(1)) + int(m.group(2))


def main() -> int:
    tmpdir = pathlib.Path(tempfile.mkdtemp())
    failures = []
    for body, should_flag, label in [*CASES, BLOCK_CASE]:
        n = run_lint(body, tmpdir)
        flagged = n > 0
        if flagged != should_flag:
            failures.append(
                f"  [{label}] 期望{'攔下' if should_flag else '放行'}，"
                f"實際{'攔下' if flagged else '放行'}（{n} 件）\n    輸入：{body!r}"
            )

    total = len(CASES) + 1
    if failures:
        print(f"失敗 {len(failures)} / {total}\n")
        print("\n".join(failures))
        return 1
    print(f"全部通過（{total} 個案例）")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
