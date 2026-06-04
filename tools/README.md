# docs 編輯標準掃描器（docs_style_lint）

把公開[貢獻者百科](https://anoni.net/docs/community/contributor-handbook/)「寫作風格規範」裡可機器判斷的硬規則做成檢查，輸出 `file:line` 與規則代碼。

編輯標準的單一來源是貢獻者百科，這支腳本是它的執法工具。規則是中文寫作規範，套用在 zh-TW 與 zh-CN，不掃英文版（docs/en 的破折號、分號等在英文是正常的）。透過 [`.github/workflows/docs-style-lint.yml`](../.github/workflows/docs-style-lint.yml) 在每個 PR 對變更的中文 Markdown 自動跑，目前為 warn 階段（提醒不擋）。

## 用法

```bash
# 掃單檔或整個目錄
python3 tools/docs_style_lint.py ../anoni-net-docs/docs/zh-TW

# 只看會擋 CI 的 error
python3 tools/docs_style_lint.py --no-warn <path>

# JSON 輸出（給後續聚合或 CI annotation）
python3 tools/docs_style_lint.py --format json <path>
```

純 Python 3 標準庫，無外部相依。有任一 error 回 exit code 1，warn 不影響 exit code。

掃描前會剝除 fenced code、inline code、HTML 註解、Markdown 連結的 URL 與裸 URL，避免在程式碼與網址上誤判。front matter 不套用內文標點規則，只做欄位檢查。

## CI：GitHub Action（只掃變更檔）

舊文有不少遺留違規（見下方試跑結果）。CI 不全庫掃，只掃這次 PR 變更到的 Markdown，避免舊文擋住新貢獻。由 [`.github/workflows/docs-style-lint.yml`](../.github/workflows/docs-style-lint.yml) 處理：`pull_request` 觸發、用 `git diff` 算出變更的中文 Markdown（`docs/zh-TW`、`docs/zh-CN`，不含 en），跑 `--format github` 把問題以 annotation 標在 PR 的變更行上。

目前是 **warn 階段**：問題只提醒，job 維持綠燈，不擋 merge。要改 blocking：拿掉 workflow 裡的 `continue-on-error`，並在 repo 設定把這個 check 設為 branch protection 必過。

本機重現 CI 的掃法：

```bash
git diff --name-only --diff-filter=ACM origin/main... \
  | grep -E '\.md$' \
  | xargs -r python3 tools/docs_style_lint.py
```

全庫掃描留作選擇性的清理 pass。

## Tier 1：本工具會自動檢查

| 規則代碼 | 嚴重度 | 內容 |
|---|---|---|
| `em-dash` | error | 破折號「—」當插入語（表格空資料格 `| — |` 放行）|
| `semicolon` | error | 全形分號「；」 |
| `fullwidth-slash` | error | 全形「／」 |
| `bushi-ershi` | error | 「不是…而是…」句型 |
| `buzhi-ershi` | error | 「不再只是…而是…」句型 |
| `quote-juxtapose` | error | 並列引號之間缺「、」（`」「`）|
| `ai-opener` | error | 句首「值得注意的是/總的來說/綜上所述」|
| `frontmatter-missing` | error | blog post 缺 date/slug/categories/authors |
| `definition-phrasing` | warn | 「談的是/指的是/涵蓋的是」|
| `colloquial-jiang` | warn | 口語「講」（已扣除演講/講座等正當詞）|
| `machine-field` | warn | 機器欄位名直接出現在內文（如 `web_connectivity`）|
| `title-missing` / `frontmatter-summary` | warn | blog 無 H1 標題 / 無 summary |

## Tier 2：本工具「不」檢查，需 AI 或人工複審

這些規則需要語意判斷，正則做不準，刻意不在此掃，避免假裝涵蓋了。校稿或 review 時仍要靠人或 AI 輔助：

- 去 AI 味：開場鋪陳句（meta scaffolding）、「這…」開頭、抽象改具體、去誇飾
- 過度對稱的三段結構
- 安全寫作：不提供可被濫用的全量枚舉、逐一抓取等操作配方
- 隱私：不揭露個別操作者的個人帳號 / handle，用地區或角色代稱

未來可加一個 `--ai` 模式，把 Tier 2 交給 LLM 逐段判斷。

## 已知邊界（會誤報或需人判斷）

- `em-dash`：若破折號出現在外部專有名詞的連結文字（例 `[Cloudflare Radar — Iran](...)`），會被標記。必要時改寫標籤或人工放行。表格空資料格 `| — |`（整格只有一個破折號）已自動放行，破折號跟其他文字混在同一格仍會被標記。
- `colloquial-jiang`、`definition-phrasing`：列為 warn 而非 error，因為「講清楚」、「指的是什麼呢」等仍有正當用法，只當提醒。

## 關閉特定檢查

- 規則文件本身（`contributor-handbook.md`、`docs-writing-style.md`）會引用被禁的句型當例子，預設略過。要連它們一起掃用 `--include-rule-docs`。
- 任何頁面要展示違規範例時，用 inline 指令局部關閉：

    ```markdown
    <!-- docs-style-lint: disable -->
    這段示範了被禁的句型，不會被檢查。
    <!-- docs-style-lint: enable -->
    ```

  同一行結尾放 `<!-- docs-style-lint: disable-line -->` 可只關閉該行。

## 試跑結果（2026-06，全 zh-TW）

| 規則 | 數量 |
|---|---|
| semicolon | 36 |
| em-dash | 25 |
| colloquial-jiang（warn） | 11 |
| definition-phrasing（warn） | 6 |
| quote-juxtapose | 5 |
| frontmatter-missing（slug） | 2 |
| bushi-ershi / buzhi-ershi / fullwidth-slash | 各 1 |

共 71 error、17 warn、32 個檔案。最近校稿過的文章乾淨，違規集中在較早的翻譯文。

## 上線進程

1. 私有試跑穩定。✅
2. 移入公開 `anoni-net/docs`，GitHub Action 對變更檔跑「warn 不擋」。← 現在
3. 收斂誤報後升為 blocking gate（拿掉 `continue-on-error` + 設 branch protection 必過）。
4. 視需要做一次全庫清理 pass，把舊文遺留違規補掉。
