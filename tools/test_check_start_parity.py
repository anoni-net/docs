#!/usr/bin/env python3
r"""check_start_parity.py 的測試。

檢查腳本自己壞掉是最糟的一種壞法：它每次都回綠燈，看起來一切正常，實際上什麼都
沒守。所以三種 error 各構造一次真的壞掉的樹，確認它紅得起來，而不是只驗「正常的
樹會過」。

跑法：
    python3 tools/test_check_start_parity.py
"""

import pathlib
import shutil
import sys
import tempfile
import unittest

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import check_start_parity as mod  # noqa: E402


PAGE = """---
title: {title}
---

# {title}

## 第一節

看 [別頁]({link})。

## 不分身分都要做到的

每一條路徑都要走得到 [一般人平常該做到什麼](../scenarios/everyday-baseline.md)。
"""

TARGET = """---
title: 目標
---

# 目標

## 存在的小標

內文。
"""


class Harness(unittest.TestCase):
    """每個案例在暫存目錄裡搭一棵最小的 docs 樹，跑完還原模組的全域設定。"""

    def setUp(self):
        self.tmp = pathlib.Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.tmp, True)
        self._docs = mod.DOCS
        self.addCleanup(lambda: setattr(mod, "DOCS", self._docs))
        mod.DOCS = self.tmp / "docs"

    def build(self, *, langs=("zh-TW", "zh-CN", "en"), pages=("index.md",),
              link="../scenarios/target.md#存在的小標", nav_skip=()):
        for lang in langs:
            (mod.DOCS / lang / "start").mkdir(parents=True, exist_ok=True)
            (mod.DOCS / lang / "scenarios").mkdir(parents=True, exist_ok=True)
            (mod.DOCS / lang / "scenarios" / "target.md").write_text(TARGET, encoding="utf-8")
            # 每個入口頁都要連到這一篇，PAGE 裡就寫著，所以它得真的存在
            (mod.DOCS / lang / "scenarios" / "everyday-baseline.md").write_text(
                TARGET.replace("目標", "不分身分都要做到的"), encoding="utf-8")
            listed = []
            for name in pages:
                (mod.DOCS / lang / "start" / name).write_text(
                    PAGE.format(title=name, link=link), encoding="utf-8")
                if name not in nav_skip:
                    listed.append(f"      - start/{name}")
            cfg = mod.DOCS / mod.CONFIGS[lang]
            cfg.write_text("nav:\n  - index.md\n" + "\n".join(listed) + "\n", encoding="utf-8")

    def run_check(self):
        return mod.main()


class TestHealthy(Harness):
    def test_一切正常時回_0(self):
        self.build()
        self.assertEqual(self.run_check(), 0)

    def test_缺少整個_start_目錄時跳過而不是報錯(self):
        # 還沒有這一區的分支不該被這支擋下來
        self.build(langs=("zh-TW",))
        self.assertEqual(self.run_check(), 0)


class TestFilenameParity(Harness):
    def test_某語系少一頁時紅燈(self):
        self.build()
        (mod.DOCS / "zh-CN" / "start" / "extra.md").write_text(
            PAGE.format(title="extra", link="../scenarios/target.md#存在的小標"),
            encoding="utf-8")
        cfg = mod.DOCS / mod.CONFIGS["zh-CN"]
        cfg.write_text(cfg.read_text(encoding="utf-8") + "      - start/extra.md\n",
                       encoding="utf-8")
        self.assertEqual(self.run_check(), 1)

    def test_基準語系少一頁時也紅燈(self):
        self.build(pages=("index.md", "media.md"))
        (mod.DOCS / "zh-TW" / "start" / "media.md").unlink()
        self.assertEqual(self.run_check(), 1)


class TestNavListing(Harness):
    def test_頁面沒列進_nav_時紅燈(self):
        # mkdocs 對這種情況只給 INFO，strict 也不擋，所以要在這裡擋
        self.build(pages=("index.md", "media.md"), nav_skip=("media.md",))
        self.assertEqual(self.run_check(), 1)


class TestAnchors(Harness):
    def test_錨點不存在時紅燈(self):
        self.build(link="../scenarios/target.md#這個小標不存在")
        self.assertEqual(self.run_check(), 1)

    def test_入口頁沒連到那份共同內容時紅燈(self):
        # index.md 說一般大眾那條「其他四種身分同樣要做到」，而 2026-08-29 查的
        # 時候，公民團體、新聞媒體、獨立記者三頁一個字都沒提到它。宣稱寫在 index，
        # 少掉的是另外三頁的連結，兩邊分開看都很正常。
        self.build(pages=("index.md", "media.md"))
        for lang in ("zh-TW", "zh-CN", "en"):
            path = mod.DOCS / lang / "start" / "media.md"
            path.write_text(
                path.read_text(encoding="utf-8").replace(
                    "../scenarios/everyday-baseline.md", "../scenarios/target.md"
                ),
                encoding="utf-8",
            )
        self.assertEqual(self.run_check(), 1)

    def test_說明句提到目標頁沒有的東西時紅燈(self):
        # 2026-08-30：civil-society.md 說 upload-sensitive「裡面有 PGP 與 OnionShare
        # 兩種做法的取捨」，而那一頁的正文從頭到尾只有社群自架 Send 的上傳流程。
        self.build()
        for lang in mod.LANGS:
            path = mod.DOCS / lang / "start" / "index.md"
            path.write_text(
                path.read_text(encoding="utf-8").replace(
                    "看 [別頁](../scenarios/target.md#存在的小標)。",
                    "看 [別頁](../scenarios/target.md)：裡面有 PGP 的做法。",
                ),
                encoding="utf-8",
            )
        self.assertEqual(self.run_check(), 1)

    def test_目標頁的_frontmatter_不算數(self):
        # PGP 只寫在目標頁的 description 裡，正文一個字都沒有。grep 掃整個檔案會
        # 命中然後放行，人工 review 那次就是這樣漏掉的。
        self.build()
        for lang in mod.LANGS:
            target = mod.DOCS / lang / "scenarios" / "target.md"
            target.write_text(
                TARGET.replace("title: 目標", "title: 目標\ndescription: 含 PGP 公鑰"),
                encoding="utf-8",
            )
            path = mod.DOCS / lang / "start" / "index.md"
            path.write_text(
                path.read_text(encoding="utf-8").replace(
                    "看 [別頁](../scenarios/target.md#存在的小標)。",
                    "看 [別頁](../scenarios/target.md)：裡面有 PGP 的做法。",
                ),
                encoding="utf-8",
            )
        self.assertEqual(self.run_check(), 1)

    def test_說明句提到的東西在正文裡就放行(self):
        self.build()
        for lang in mod.LANGS:
            target = mod.DOCS / lang / "scenarios" / "target.md"
            target.write_text(TARGET.replace("內文。", "內文提到 PGP。"), encoding="utf-8")
            path = mod.DOCS / lang / "start" / "index.md"
            path.write_text(
                path.read_text(encoding="utf-8").replace(
                    "看 [別頁](../scenarios/target.md#存在的小標)。",
                    "看 [別頁](../scenarios/target.md)：裡面有 PGP 的做法。",
                ),
                encoding="utf-8",
            )
        self.assertEqual(self.run_check(), 0)

    def test_連到不存在的檔案時紅燈(self):
        self.build(link="../scenarios/nope.md#存在的小標")
        self.assertEqual(self.run_check(), 1)

    def test_沒有錨點的連結不檢查(self):
        # 純檔案連結由 mkdocs 的 strict build 擋，這支不重複做
        self.build(link="../scenarios/target.md")
        self.assertEqual(self.run_check(), 0)


class TestSlugify(unittest.TestCase):
    def test_複製了_pymdownx_預設行為(self):
        for text, expected in mod.SLUG_SELFTEST:
            self.assertEqual(mod.slugify(text), expected, text)

    def test_icon_語法不算進_slug(self):
        # :material-x: 渲染後是 <svg>，會被清掉，只解析原始碼的話要自己拿掉
        self.assertEqual(mod.slugify(":material-home: 首頁"), "首頁")

    def test_code_fence_裡的井號不算標題(self):
        tmp = pathlib.Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, tmp, True)
        f = tmp / "a.md"
        f.write_text("## 真的標題\n\n```bash\n# 這是註解不是標題\n```\n", encoding="utf-8")
        self.assertEqual(mod.anchors_of(f), {"真的標題"})


if __name__ == "__main__":
    unittest.main(verbosity=2)
