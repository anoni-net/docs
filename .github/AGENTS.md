# CI/CD

GitHub Actions 各個 workflow 的觸發條件、建置與部署流程，以及發布時要注意的事。改 `.github/workflows/` 或要排查建置、部署問題時讀本檔。2026-10 從根目錄的 `AGENTS.md` 搬來，Claude Code 只在處理本目錄的檔案時才載入本檔（`.github/CLAUDE.md` 引入）。

使用 GitHub Actions 自動建置與部署：

- **build_docs.yml**: 建置多語系文件並發布
  - 觸發條件: push to `docs` branch 且變更落在會改變產物的路徑（`docs/**`、根目錄的 `BECOME_ANONI*.md`、`tools/cf_purge.py` 與其測試、workflow 自己），或手動觸發
  - 只動 `tools/` 其他檔案或 CI 設定時推 `docs` 不會建置，那是刻意的，產物沒有變。真的需要重新建置時，從 Actions 頁面用 `workflow_dispatch`
  - 建置所有語言版本（zh-TW, zh-CN, en）
  - 處理 Open Graph 圖片
  - 以 `aws s3 sync --delete` 上傳至 S3：clearnet 產物在 `docs/`，onion 產物在同一個 bucket 的 `docs-onion/`。單一步覆寫，站上任何時刻都有完整的一份，不再有先清空再上傳造成的空窗
  - 上傳後由 `tools/cf_purge.py` 清除這次產出網址的 Cloudflare 快取，範圍限 `/docs/`，不動 zone 內其他服務

  **S3 是正式站的讀取來源**，所以推 `docs` 分支且這個 workflow 執行完，內容就已經上線，不需要額外的手動發布步驟。發布指令：

  ```bash
  git push origin origin/main:refs/heads/docs
  ```

- **docs-style-lint.yml**: 對 PR 變更到的中文 Markdown 與小工具區的 UI 字串執行 `tools/docs_style_lint.py`
  - 觸發路徑：`docs/zh-TW/**/*.md`、`docs/zh-CN/**/*.md`、`docs/en/**/*.md` 與 linter 本身
  - 只掃這次 PR 變更的檔案，避免舊文的遺留違規擋住新貢獻
  - 這個 job 會擋 merge。error 級規則讓 linter 回 exit 1，job 就紅。warn 級規則仍只以 annotation 標在變更行上，不影響 exit code
  - 待辦：repo 設定尚未把這個 check 列為 branch protection 必過，所以目前擋得住 PR 的紅燈，擋不住有權限的人直接合併

- **tools-tests.yml**: 執行 `tools/` 底下那幾支零相依的測試
  - 觸發路徑：`tools/**`、`docs/zh-TW/sw.js`、`docs/overrides/base.html`、`docs/hooks/**`
  - 內容：`test_sw_offline.mjs`（service worker 的離線行為）、`test_lang_preference.mjs`（語言偏好導向）、`test_offline_index.py`（離線內容索引的分組與排序）、`test_offline_library.mjs`（離線內容管理頁的介面）、`test_passphrase.mjs`（密語與密碼產生器的取樣與熵）、`test_qrcode.mjs`（QR code 的編碼往返）、`test_leaks.mjs`（指紋示範頁不送資料）、`test_cf_purge.py`（快取清除映射）、`test_layers.mjs`（地球儀的圖層清單，這邊涵蓋「改了 `sw.js` 或 `tools/`、沒碰地球儀」那個方向）
  - 不需要建置產物，執行完不到十秒。`test_docs_style_lint.py` 不在這裡，由 `docs-style-lint.yml` 執行
  - `check_precache.mjs` 需要 `docs/output`，不在這一支裡，由 `build_docs.yml` 在建完 standard 版之後執行

- **changelog-kev.yml**: 每週一執行 `tools/check_changelog_kev.py`，有已被利用、更新日誌還沒寫的漏洞時開一張 issue，已經有開著的就更新內文
  - 結束碼 1 代表有要補的項目，其他非零值代表腳本本身失敗（例如抓不到 KEV），那種情況 job 變紅、不開 issue

- **check-ripe.yml** 與 **lookback-ooni.yml**: `asn_coverage/` 的資料抓取
  - 觸發路徑：`asn_coverage/**` 與各自的 workflow。原本任何 main 的 push 都觸發，2026-08-19 一天被 docs 的 PR 觸發 18 次，每次四個 job（2 OS × 2 Python），把並行額度佔滿，連 BuildDocs 都排不進去
  - `timeout-minutes: 30` 與 `concurrency` 的 `cancel-in-progress`。同一天有六個 run 卡在 `apt-get update`（runner 的 apt mirror 沒有回應），沒有 timeout 就會佔著 runner 到預設的六小時
  - 憑證那一步改成 `continue-on-error`，runner image 本來就帶 ca-certificates，那一步失敗不該擋住整個 job

- **games-checks.yml**: 「Tor 中繼地球儀」的互動與版面檢查（headless Chrome）
  - 觸發路徑：`docs/zh-TW/games/tor-network/**`、`tools/check_*.mjs`
  - 檢查項目：捏合放開不彈開、擋掉 iOS Safari 雙擊放大、網址關注區域的取景、變電所容量計版面（280 座 × 三語系 × 寬窄視窗）、六角層的幾何與國碼對齊、國家標籤上的事件穿透、點標籤與點地表開得出卡片、工作坊導覽走得完、圖層清單與來源檔案及三語字串對得上、每一層開得起來也關得掉、拖曳滾輪捏合時手指底下那一點不動（`check_globe_nav.mjs` 驗算法，`check_globe_nav_browser.mjs` 在真的頁面上驗接線）、各國行政區界線的資料與預快取對得上且爭議島嶼沒被畫進去（`check_admin1.mjs`）

- **check-ripe.yml**: 檢查 RIPE ASN 資料（`asn_coverage/`）
  - **push** 僅在 **`main`** 分支觸發。`workflow_dispatch` 與 `schedule` 維持可用
- **lookback-ooni.yml**: 定期回溯 OONI 資料（`asn_coverage/`）
  - **push** 僅在 **`main`** 分支觸發。`workflow_dispatch` 與 `schedule` 維持可用
