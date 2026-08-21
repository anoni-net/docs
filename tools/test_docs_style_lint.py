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

    # --- 「那」密集重複：與「這」同標準，兩個字分別計數 ---
    ("那份文件寫了那個結論，那套流程也一樣。", True, "那 同句 3 次"),
    ("那篇更新裡那段說明很關鍵。", True, "那 相鄰兩個相隔 5 個字"),
    ("那份報告整理了近三年的觀測資料，接下來說明那些數字怎麼讀。", False, "那 兩個相隔夠遠"),
    ("這份文件提到那個結論。", False, "這與那分別計數，各 1 次"),
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
    # onion 建置的驗證會 grep 產物裡的分析端點主機名，出現就中止上傳
    ("你會看到這一頁連了 `aa.anoni.net` 那個端點。", True, "內文寫出分析端點主機名"),
    ("你會看到這一頁連了一個 anoni.net 底下的子網域。", False, "改成描述性的寫法"),

    # 兩岸用詞：error correction 的等級
    ("把糾錯等級調到最高。", True, "「糾錯」是中國慣用詞"),
    ("把容錯度調到最高。", False, "臺灣用「容錯度」"),

    # 兩岸用詞：掃過全站之後只收真的踩到的那幾個
    ("這個網絡很慢。", True, "「網絡」是中國慣用詞"),
    ("這個網路很慢。", False, "臺灣用「網路」"),
    ("代價在《網絡安全法》要求電信實名。", False, "法律正式名稱照錄"),
    ("新加坡防止網絡謠言法案（POFMA）。", False, "法案正式譯名照錄"),
    ("連到那台服務器。", True, "「服務器」是中國慣用詞"),
    ("連到那台伺服器。", False, "臺灣用「伺服器」"),
    ("開放的端口之一。", True, "「端口」是中國慣用詞"),
    ("開放的連接埠之一。", False, "臺灣用「連接埠」"),
    ("跟舊版兼容。", True, "「兼容」是中國慣用詞"),
    ("跟舊版相容。", False, "臺灣用「相容」"),
    ("走本地緩存。", True, "「緩存」是中國慣用詞"),
    ("走本地快取。", False, "臺灣用「快取」"),
    ("改裝現有硬件設施。", True, "「硬件」是中國慣用詞"),
    ("改裝現有硬體設施。", False, "臺灣用「硬體」"),
    # 這幾個臺灣也用，刻意沒收進規則
    ("中華電信的用戶。", False, "電信講「用戶」是臺灣正常用語"),
    ("把學校名稱登錄到官網。", False, "臺灣的「登錄」是登記的意思"),
    ("解讀觀測數據。", False, "「數據」臺灣通用"),

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


def run_lint(body: str, tmpdir: pathlib.Path, english: bool = False) -> int:
    """回傳 error + warn 的總數。

    english=True 時把檔案寫進含 /en/ 的路徑，linter 會據此改套 PROSE_RULES_EN。
    判斷邏輯在 docs_style_lint.is_english_doc。
    """
    d = tmpdir / "en" if english else tmpdir
    d.mkdir(exist_ok=True)
    f = d / "case.md"
    f.write_text(f"---\ntitle: t\n---\n\n# t\n\n{body}\n", encoding="utf-8")
    out = subprocess.run(
        [sys.executable, str(LINT), str(f)], capture_output=True, text=True
    ).stdout
    m = SUMMARY.search(out)
    if not m:
        raise AssertionError(f"無法解析 linter 輸出：\n{out}")
    return int(m.group(1)) + int(m.group(2))


def run_lint_cn(body: str, tmpdir: pathlib.Path) -> int:
    """把檔案寫進含 /zh-CN/ 的路徑，兩岸用詞規則會據此放行。

    判斷邏輯在 docs_style_lint.is_simplified_doc。
    """
    d = tmpdir / "zh-CN"
    d.mkdir(exist_ok=True)
    f = d / "case.md"
    f.write_text(f"---\ntitle: t\n---\n\n# t\n\n{body}\n", encoding="utf-8")
    out = subprocess.run(
        [sys.executable, str(LINT), str(f)], capture_output=True, text=True
    ).stdout
    m = SUMMARY.search(out)
    if not m:
        raise AssertionError(f"無法解析 linter 輸出：\n{out}")
    return int(m.group(1)) + int(m.group(2))


# zh-CN 的案例。兩岸用詞那組規則的判準是「臺灣用什麼」，對簡體版沒有意義，
# 所以預設不套。例外是兩岸都不慣用的詞（目前只有「站台」）。
#
# 這幾條原本靠 regex 多半用正體專有字形碰巧擋住，簡繁同形的「硬件」「端口」
# 「兼容」漏掉了，zh-CN 全站因此吃到 137 個誤報。
# (本文, 應該被攔下來嗎, 說明)
CN_CASES: list[tuple[str, bool, str]] = [
    ("这台设备的硬件规格。", False, "簡繁同形的「硬件」不該對 zh-CN 誤報"),
    ("把端口设定改掉。", False, "簡繁同形的「端口」不該對 zh-CN 誤報"),
    ("这个格式跟旧版兼容。", False, "簡繁同形的「兼容」不該對 zh-CN 誤報"),
    ("这个站台的说明。", True, "「站台」兩岸都不慣用，簡體版照樣要攔"),
    ("拿到之后就可以用。", True, "口語詞規則兩版都適用，不受這次改動影響"),
]


# docs/en 的案例。跑在含 /en/ 的路徑上，套 PROSE_RULES_EN。
# (本文, 應該被攔下來嗎, 說明)
EN_CASES: list[tuple[str, bool, str]] = [
    # --- bold-lead-sentence 英文版（warn）---
    ("**Even if we wanted to read it, we could not.** The server only holds ciphertext.",
     True, "en 粗體整句開頭"),
    ("**Data source**: the OONI public dataset.", False, "en 清單標籤不帶句點"),
    ("The **control day** uses the same parameters.", False, "en 粗體詞當句子成分"),

    # --- ai-opener 英文版（error）---
    ("It is worth noting that the exit relay sees the destination.",
     True, "en AI 套語開頭"),
    ("The exit relay sees the destination.", False, "en 直述開頭"),

    # --- em-dash 在英文是正常標點，不應攔 ---
    ("The relay — the middle one — sees neither end.", False, "en 破折號屬正常排版"),

    # --- 中文專屬規則不應套到 en ---
    ("The tools are listed here; the comparison follows.", False, "en 半形分號正常"),
]

# title-colon 檢查的是標題行，不是內文，所以獨立成一組，直接把整份文件餵進去。
# (整份文件, 應該被攔下來嗎, 說明)
HEADING_CASES: list[tuple[str, bool, str]] = [
    ("## What it protects: the core design\n\nText.", True, "冒號句構標題"),
    ("## 標題：說明\n\n內文。", True, "全形冒號句構標題"),
    ("## What GrapheneOS protects\n\nText.", False, "完整陳述句標題"),
    ("## :material-lock-outline: What it protects\n\nText.",
     False, "Material 圖示的冒號不算句構"),
    ("### Workshop 1: Circumventing censorship\n\nText.",
     False, "編號式標題是列舉序號"),
    ("### Option A: Nginx and Onionoo\n\nText.",
     False, "單一大寫字母的選項序號也算編號式標題"),
    ("### Optional: turn on the bridge\n\nText.",
     True, "Optional 不是序號，仍是冒號句構"),
    ("## Note:\n\nText.", False, "行尾冒號沒有說明部分"),
]

# title-colon 只對 docs/en 生效，zh 側維持原樣。這條驗證範圍沒有溢出。
# (整份文件, 應該被攔下來嗎, 說明)
ZH_HEADING_CASES: list[tuple[str, bool, str]] = [
    ("## 一對一通訊：Diffie-Hellman 金鑰交換\n\n內文。",
     False, "zh 的冒號標題不由 linter 攔（見 docs_style_lint 的說明）"),
]


def run_lint_raw(doc: str, tmpdir: pathlib.Path, english: bool = False) -> int:
    """跟 run_lint 一樣，但不自動補標題，整份內容照原樣寫入。"""
    d = tmpdir / "raw" / ("en" if english else "zh")
    d.mkdir(parents=True, exist_ok=True)
    f = d / "case.md"
    f.write_text(f"---\ntitle: t\n---\n\n{doc}\n", encoding="utf-8")
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

    for body, should_flag, label in CN_CASES:
        n = run_lint_cn(body, tmpdir)
        flagged = n > 0
        if flagged != should_flag:
            failures.append(
                f"  [{label}] 期望{'攔下' if should_flag else '放行'}，"
                f"實際{'攔下' if flagged else '放行'}（{n} 件）\n    輸入：{body!r}"
            )

    for body, should_flag, label in EN_CASES:
        n = run_lint(body, tmpdir, english=True)
        flagged = n > 0
        if flagged != should_flag:
            failures.append(
                f"  [{label}] 期望{'攔下' if should_flag else '放行'}，"
                f"實際{'攔下' if flagged else '放行'}（{n} 件）\n    輸入：{body!r}"
            )

    for doc, should_flag, label in HEADING_CASES:
        n = run_lint_raw(doc, tmpdir, english=True)
        flagged = n > 0
        if flagged != should_flag:
            failures.append(
                f"  [{label}] 期望{'攔下' if should_flag else '放行'}，"
                f"實際{'攔下' if flagged else '放行'}（{n} 件）\n    輸入：{doc!r}"
            )

    for doc, should_flag, label in ZH_HEADING_CASES:
        n = run_lint_raw(doc, tmpdir)
        flagged = n > 0
        if flagged != should_flag:
            failures.append(
                f"  [{label}] 期望{'攔下' if should_flag else '放行'}，"
                f"實際{'攔下' if flagged else '放行'}（{n} 件）\n    輸入：{doc!r}"
            )

    total = (len(CASES) + 1 + len(CN_CASES) + len(EN_CASES) + len(HEADING_CASES)
             + len(ZH_HEADING_CASES))
    if failures:
        print(f"失敗 {len(failures)} / {total}\n")
        print("\n".join(failures))
        return 1
    print(f"全部通過（{total} 個案例）")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
