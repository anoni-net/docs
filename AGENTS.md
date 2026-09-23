# AGENTS.md

本文件寫給在 anoni-net/docs 工作的 AI 協作工具與使用它們的貢獻者，不限定哪一家的服務。Claude Code 從 `CLAUDE.md` 引入本文件，其他工具多半直接讀 `AGENTS.md`。寫作與協作的規則以[貢獻者百科](https://anoni.net/docs/community/contributor-handbook/)為準，這裡整理 repo 結構、開發指令與容易出錯的地方。

## 專案概述

此專案是「匿名網路社群 anoni.net」的文件系統，主要包含三個子專案與一組共用腳本：

1. **docs/** - MkDocs 驅動的多語系文件網站（zh-TW, zh-CN, en）
2. **pulse/** - Tor 中繼監控系統（FastAPI + PostgreSQL）
3. **asn_coverage/** - OONI 觀測資料與 ASN 涵蓋率分析工具
4. **tools/** - 跨子專案的共用腳本（文件編輯標準掃描、快取清除、地球儀資料與版面檢查）

### 整體架構

```
anoni-net-docs/
├── docs/           # 文件網站 (MkDocs Material)
├── pulse/          # Tor 監控系統 (FastAPI backend + PostgreSQL)
├── asn_coverage/   # OONI ASN 分析工具 (Python CLI)
└── tools/          # 共用腳本 (docs linter、快取清除、games 資料與檢查)
```

### 授權一覽

| 範圍 | 授權 |
|------|------|
| `docs/` 網站內容 | [CC-BY 4.0](./LICENSE)（根目錄 `LICENSE` 為全文） |
| `pulse/` 程式碼 | [MIT](./pulse/LICENSE) |
| `asn_coverage/` 程式碼 | [GPL-3.0](./asn_coverage/LICENSE) |
| `.claude/skills/drawio/` | [Apache-2.0](./.claude/skills/drawio/LICENSE)，取自 [jgraph/drawio-mcp](https://github.com/jgraph/drawio-mcp)，開頭增補一段本 repo 的用法 |

根目錄 `LICENSE-asn_coverage` 為 `asn_coverage` 之 GPL-3.0 全文副本，以 `asn_coverage/LICENSE` 為準。

`docs/zh-TW/games/tor-network/` 底下有六份外部資料，各自沿用原始授權，其中 `ooni.json` 是
CC BY-NC-SA 4.0（禁止商業使用）。清單見根目錄 [`NOTICE`](./NOTICE)。

### 兩套 OONI 相關程式（勿混淆）

| 位置 | 用途 | 資料來源 |
|------|------|----------|
| `pulse/backend/ooni.py` | Pulse 服務內建的 **OONI API** 客戶端（與監控後端一併部署） | OONI API |
| `asn_coverage/ooni.py` | **批次**下載 S3 觀測資料、ASN 涵蓋分析 CLI | OONI AWS S3 公開資料集 |

### tools/ 共用腳本

| 群組 | 檔案 | 用途 |
|------|------|------|
| 離線內容索引 | `docs/hooks/offline_index.py` | mkdocs hook，建置時產出各語系的 `offline-index.json`（有哪些頁面、屬於哪個章節、多大）。離線內容管理頁 `docs/<lang>/offline.md` 用它列出可勾選的清單，介面在 `docs/zh-TW/js/offline-library.js`（另兩語是 symlink）。同一份索引的 `paths` 記著 `start/*.md` 五條起步路徑各連到哪些頁面，從起步頁自己的 Markdown 連結解析。`start/index.md` 上的路徑下載按鈕由同一支 js 以 `#start-offline` 為根節點畫出來，按下去把該路徑的頁面連同內文圖送進讀者自選的快取，不記住讀者選了哪一條。哪幾條要在按鈕旁掛敏感提醒，由起步頁 frontmatter 的 `offline_caution: true` 決定。按過「全部存到裝置」的語系會在 `sw.js` 的 `SAVE_ALL_URL` 記一筆，「更新已存的內容」據此把索引裡新增的頁面一起補下來，新文章才不會被更新漏掉。旗標放 `SETTINGS` 而不是 localStorage，清除所有離線內容會連它一起刪掉，勾掉任何一頁也會取消它，讀者挑過的範圍不被下一次更新推翻|
| 文件編輯標準 | `docs_style_lint.py`、`test_docs_style_lint.py` | 把貢獻者百科「寫作風格規範」可機器判斷的部分做成檢查。三語系都掃，中英各一組規則（破折號與分號在英文屬正常用法，不套中文那組）。除了 Markdown，也掃 `docs/zh-TW/js/*.js` 裡 `STRINGS` 物件的 UI 字串，語系從物件的 key 判斷而不是路徑。純標準庫，無外部相依。細節見 [`tools/README.md`](./tools/README.md) |
| 三語系對齊 | `check_start_parity.py`、`test_check_start_parity.py` | `docs/<lang>/start/` 三個語系的檔名清單、nav 收錄與章節錨點。這三件 mkdocs 都不擋：`hreflang_alternate_links.html` 無條件替每頁產生三個語系的 alternate，對面檔案不存在就是 404。nav 漏收只給 INFO。`links.anchors` 預設也是 INFO，實測把錨點改壞照樣 Documentation built。start 整區只做聚合、每頁都是連結，斷了讀者只會落在文章開頭，看起來像連對了。由 [`docs-style-lint.yml`](./.github/workflows/docs-style-lint.yml) 觸發，掛在那支是因為錨點檢查看的是被連結那篇的小標，只有它的 paths 涵蓋得到「改目標文章、沒碰 start/」的 PR |
| 小工具 | `test_passphrase.mjs`、`test_qrcode.mjs`、`test_leaks.mjs`、`test_cleanurl.mjs`、`test_invisible.mjs`、`test_qrread.mjs`、`test_redact.mjs`、`test_agecrypt.mjs`、`test_passkey.mjs`、`test_vault.mjs`、`test_checklist.mjs`、`test_script_src.mjs` | `docs/zh-TW/js/passphrase.js` 的取樣、熵計算、字元集與詞表完整性。取樣那幾項刻意構造出「直接取模」與「拒絕重抽」會給出不同答案的輸入，寫回 `% n` 就會紅。這類錯誤畫面上完全正常，照樣吐出看起來很隨機的字，而受害的讀者不會知道自己受害。`test_qrcode.mjs` 另外寫了一個獨立的 QR 解碼器，把產生的矩陣讀回字串再比對，驗的是「掃得出來而且內容對」，人眼讀不了 QR，這種錯只有解回文字才驗得到。`test_leaks.mjs` 掃指紋示範頁的原始碼，出現任何送資料或寫入儲存的手段就紅，那一頁的整個立論建立在「什麼都不送」上。`test_cleanurl.mjs` 守的是網址清理器「必要參數不能被誤刪」，刪掉 `?v=` 讀者只會覺得對方給錯連結，不會怪到工具頭上。`test_invisible.mjs` 的誤判案例跟偵測案例一樣多，emoji 裡的 ZWJ、RTL 文字裡的方向標記、整段俄文裡的西里爾字母都不該報，全部報成可疑的話那支工具會變成狼來了。`test_redact.mjs` 守截圖遮蔽的兩件事：方框正規化後每個被碰到的像素都在框內（邊緣不留半遮的原內容），以及原始碼裡沒有模糊、沒有任何送出或留存資料的手段，輸出檔名固定不帶原檔名。`test_agecrypt.mjs` 用 Node 內建的 crypto 獨立實作 age 的密語模式與 X25519 公鑰模式（含 bech32），跟 `utils/vendor/age/` 裡原封不動的 typage 互相解開對方的輸出，並對照 vendor 的檔案清單、頁面的 import map 與 `offline_assets` 三邊一致。`test_vault.mjs` 抽出 `docs/zh-TW/js/vault.js` 的封套與金鑰換算：passkey `user.id` 的 32 bytes 直接是 age identity，備援公鑰寫在封套裡跟著密文走，每次儲存都繼續加密給它，沒有版本欄位的舊 blob 也讀得回來。`test_checklist.mjs` 守 `docs/zh-TW/js/checklist.js` 的三邊對齊：骨架裡每個項目 id 三語系都有標籤與連結、連到的文章存在、建置產物在的話錨點也對，另守原始碼沒有送出或落地的手段。`test_script_src.mjs` 掃三語系每份 md 的 `<script src>`，相對路徑從頁面所在目錄解析，檔案不在就紅。en 與 zh-CN 的 `js/` 是逐檔指向 zh-TW 的 symlink，新增一支 js 要手動補兩個連結，漏了的話建置不報錯、`check_precache.mjs` 也只驗 zh-TW 那一份 |
| onion 位址 | `check_onion_address.py` | onion 位址從金鑰推出來，換金鑰就換位址，而換的時候只改一半的症狀是「建置成功、CI 全綠、產物看起來正常」，壞掉的只有讀者點下去那一刻。2026-09-11 盤點時同一個位址散在 23 個檔案裡，其中六份模板各自寫死一次，而 `overrides/partials/header.html` 早就在用 `config.extra.onion_base`，同一件事兩套做法。現在模板一律走設定，改寫腳本收斂成一個 `ONION_ROOT` 變數，workflow 用同名的環境變數帶進去，檢查工具比對這幾邊，加上三份 mkdocs 的 `onion_base` 與 `extra.social` 的 Tor 連結是不是同一個位址。social 那一處沒辦法再收斂，YAML 沒有把`!ENV` 接上路徑的寫法，而它渲染在每一頁的頁尾，第一輪盤點正好漏掉它，因為用檔案層級的 grep 去數，同一個檔案裡的兩處被算成一處。文章與 README 裡的位址不擋，列出來當輪替時的人工清單。驗證方式是拿假位址做一次完整的 onion 建置，產物裡的真位址從 282 個檔案降到 6 個，那 6 個全部來自刻意不動的文章 |
| 小工具瀏覽器檢查 | `check_qrstream_browser.mjs`、`check_vault_browser.mjs`、`check_redact_detect.mjs`、`check_redact_ui.mjs` | headless Chrome 開 CDP 把頁面真的執行一遍，補 node 測不到的部分。`check_qrstream_browser.mjs` 用 Y4M 檔當假攝影機走完收檔流程，並量每段文字的對比。`check_vault_browser.mjs` 用 `WebAuthn.addVirtualAuthenticator` 造一顆有 PRF 的假驗證器，驗鑰匙頁建的 passkey 換到暫存區直接能開、真的鍵盤輸入撐得過重繪、IndexedDB 重新整理後還在、390x844 下按鈕有間距。要一顆 Chrome 與開著的 server，不進 CI，改頁面邏輯或樣式之後本機執行，`--shots` 存截圖。`check_redact_detect.mjs` 量截圖遮蔽的臉部偵測在五種合成場景上的召回與誤判（乾淨、人多且臉小、街拍那種大小差很多、頭傾斜、遠景模糊），參數從 `redact.js` 原地讀。訂參數時踩過三次坑，每次都是驗證用的樣張太順：只用四張大臉的樣張調出來的參數，人多會漏一半、戴眼鏡抓不到、街拍的遠景全部低於最小尺寸。樣張是 picojs 專案的範例圖，執行時抓到 `.cache/` 而不放進 repo（那是真人照片），抓不到就跳過。`tools/test_redact.mjs` 在 CI 裡守參數的上下界並寫著每個界線的代價，這一支守的是「換了偵測器或改了縮放邏輯之後召回有沒有掉一大截」。計分是把每個偵測的中心點對回放進去的臉，一對一，對不上的才算多框。第一版只數框出幾個，21 張臉框出 21 個可能是全中也可能是 17 張加 4 個多框，兩種意義相反，訂門檻的時候正好靠這個分辨。`check_redact_ui.mjs` 走的是介面：手機尺寸開 utils/redact，塞樣張進去，按下自動找出人臉之後直接讀 canvas 像素，確認臉還沒有變黑而畫面上有藍色的空心框、產生按鈕是停用的、點一下移得掉一個候選框、按下全部遮起來之後藍色像素歸零。需要建置產物與同一張樣張，缺一就跳過，也不進 CI |
| 自動存清單 | `check_core_pages.py`、`test_check_core_pages.py` | `sw.js` 的 `CORE_PAGES_ZH` 與 `CORE_PAGES_EN` 是手維護的清單，決定讀者選過閱讀語言之後網站自動存進他裝置的是哪幾十頁。新增文章不會讓它自己進去，而漏掉的症狀是「什麼都正常」：線上讀得到、建置綠燈、離線閱讀頁也列得出來，只有實際斷網的讀者會發現文章打不開，而在那個當下補存已經來不及。漏掉與刻意不收在程式裡都是清單少一行，這支要求兩者分開寫，收進清單或列進腳本的 `EXCLUDED` 並寫明理由。只掃註解寫著「全部」的那幾區（概念、工具、進階、在地），`scenarios/` 與 `utils/` 刻意只選錄，不在範圍內。掛兩支 workflow：[`docs-style-lint.yml`](./.github/workflows/docs-style-lint.yml) 涵蓋「新增文章、沒碰 sw.js」，[`tools-tests.yml`](./.github/workflows/tools-tests.yml) 涵蓋反過來的「改了清單、沒碰文章」。2026-09-14 第一次執行抓到 13 頁落在沒人判斷過的狀態，而 `CORE_PAGES_EN` 收了其中幾頁、`CORE_PAGES_ZH` 沒有，同一篇文章在兩個語系的自動下載範圍不一樣 |
| 網址合約 | `check_url_contract.py`、`test_check_url_contract.py`、`tools/data/url_contract.txt` | 網址是這個站對外唯一的承諾，而依賴它的人全部在 CI 管不到的地方：讀者的書籤、搜尋引擎的索引、別人文章裡的連結、讀者裝置上已經存好的離線內容。改壞了沒有任何測試會紅，發現的人是讀者。`mkdocs.yml` 的 `redirect_maps` 裡那批標著「GSC 404 補漏」的就是上一次的帳單，搜尋引擎先發現、社群後補。合約記四件事：每一個頁面網址、每一頁的 heading 錨點、每一條 redirect 的來源與目的地、少數機器在讀的端點（sitemap、RSS、`offline-index.json`、`sw.js`）。錨點特別容易靜默壞掉，`toc` 用 `pymdownx.slugs.slugify()` 算 id，改一個小標題的字就換一個 id，strict 建置照樣綠。增與減的意義不同：新增網址與錨點一律放行只印提醒，移除、改名、redirect 改目的地才擋，頁面改成 redirect 降成提醒（網址還到得了目的地）。天真的快照測試每篇新文章都紅一次，接著人類學會「紅了就重新產生」，然後它再也擋不住東西。改動是刻意的就執行 `--update`，重點在那份 diff 會進 PR，拿掉哪幾條網址攤在審閱者眼前。比對那一層要三個語系的產物，主要的攔截點是 [`url-contract.yml`](./.github/workflows/url-contract.yml)，在 PR 上建三個語系再驗，作者還在手上的時候就看得到。那一支帶 `SOCIAL_CARDS=false` 與 `PRIVACY_ASSETS=false`，兩個外掛跟網址無關，關掉之後產出的合約逐位元組相同，而且避開 social 偶發的 PIL 字型錯誤與 privacy 抓外部資產失敗這兩個紅燈來源，一個時不時自己變紅的檢查會讓人學會無視它。合約要跟著改的時候，那一支會把 diff 貼進 job summary 並附一份完整檔案當 artifact，只改一篇文章的貢獻者不必在本機備齊建置環境。[`build_docs.yml`](./.github/workflows/build_docs.yml) 在上傳前再驗一次，涵蓋沒走 PR 的推送與 `workflow_dispatch`，紅燈擋下的是部署。[`tools-tests.yml`](./.github/workflows/tools-tests.yml) 那一支只驗兩件事，合約檔案本身沒被手改壞，以及增與減分得開 |
| 部署 | `cf_purge.py`、`test_cf_purge.py` | 建置完把產物映射回網址，分批並行清除 Cloudflare 快取（每批 30 條，同時 6 批）。測試由 [`tools-tests.yml`](./.github/workflows/tools-tests.yml) 在 PR 觸發 |
| 部署 | `s3_restore_mtime.py`、`test_s3_restore_mtime.py` | 上傳前比對 MD5 與 S3 的 ETag，內容沒變的把時間戳調回遠端版本，讓 `aws s3 sync` 跳過。`sync` 只看大小與時間，不看內容 |
| 地球儀資料 | `gen_*.py`、`publish_games_data.sh` | 產生 `docs/zh-TW/games/tor-network/` 的靜態 JSON。`snapshot.json`、`torusers.json`、`seacable.json` 會持續變動，由 `publish_games_data.sh` 在正式機重生並檢查後發布到 assets，其餘幾份變動以季或年計，跟文件站一起發布即可 |
| 地球儀圖層清單 | `test_layers.mjs` | 地球儀整合的十五份資料，每一份的來源、新鮮度策略、離地高度與疊放順序宣告在 `docs/zh-TW/games/tor-network/play/layers.js`，`atlas.js` 依那份清單載入並綁三語字串。這支拿清單當基準掃另外四邊：來源檔案在不在、`label` 與 `credit` 的 key 三語系齊不齊、面板節點與來源節點在不在 `index.html`、`sw.js` 的預快取有沒有收 `layers.js`。四種漏法的症狀都不會讓建置變紅，最安靜的是 i18n 少一條，那一區的小標在英文版與簡中版維持繁體而其餘部分都對。另外把 `loadLayers` 與 `fetchLayer` 原地抽出來注入假的取檔函式重放一次，確認發出的請求與快取策略跟清單宣告的一致，以及必要的層抓不到會中止、可選的層抓不到收斂成 null。清單自己是基準，所以清單寫錯驗不到，`fresh` 與 `required` 這兩個決策另外在測試裡釘一份對照，改的時候被迫想一次為什麼。離地高度那一項反過來掃 `atlas.js`，同一個數字再出現就是有人寫死了第二份，那種錯的症狀是點畫在一個高度、按得到的位置在另一個高度。掛 `games-checks.yml` 與 `tools-tests.yml` 兩支，涵蓋「改地球儀沒碰 tools」與反過來的情況。開場開哪幾層（`on`）與哪幾層關不掉（`core`）是產品決策，不是實作細節，兩組都在測試裡釘一份對照，改的時候被迫想一次第一印象。工作坊導覽每一站宣告自己要哪幾層，那些 id 也在這裡對照清單，打錯的症狀是那一站少一層資料而導覽照樣走得完。陸地亮度的指標同樣由層供應，宣告在 `metrics`，算法在 `atlas.js` 的 `METRIC_VALUES`，兩邊用 id 連起來，宣告了卻沒有算法的話按鈕會照常出現而按下去陸地整片暗掉，看起來像資料剛好都是零 |
| 地球儀圖層開關 | `check_layers_toggle.mjs` | 讀者自己開關資料層。每一層被關掉時要收回三樣東西：掛在地球上的物件、模組層級那幾個材質與網格的參照、側欄裡那一區的文字。三樣的漏法各自安靜，物件沒收就是關掉之後那一層還畫著而按鈕顯示關著，參照沒歸零就是每幀對著已經 dispose 的材質設透明度，面板沒清就是側欄留著上一次的數字。反方向一樣要走得通，原本每一層的 `fill` 只有「資料缺就收起來」那一條路，因為載入只會發生一次，少了回頭那一半的症狀是關掉再打開區塊不見了。這支開一顆 headless Chrome 把作品完整執行一遍，用 `?debug` 掛上的 `window.__atlas` 把每一層開一次關一次再開一次，每一輪回頭數地球上的物件，數字沒回到原點就是有東西沒收乾淨。另外驗網址參數（`?layers=tw-power,ooni` 與空的 `?layers=`）決定得了初始疊法，以及按下「開始導覽」之後七站要用的層會自己補載。沒有 google-chrome 或 WebGPU 起不來就跳過並回 0，跳過的時候會印出卡在哪一關（`navigator.gpu` 不存在、`requestAdapter` 回 null、adapter 有了但 `renderer.init` 沒過是三種不同的事）。第一次掛上 CI 那一輪是綠的，只花 22 秒，實際輸出是「WebGPU 起不來，跳過」，ubuntu runner 沒有顯示卡，102 項行為檢查等於只在本機有效，而綠燈看起來跟真的執行過一模一樣。加上 `--enable-unsafe-swiftshader` 與 `--use-webgpu-adapter=swiftshader` 走軟體路徑之後才真的執行得起來。代價是 Chrome 關閉時 SwiftShader 會回收 WebGPU device 並噴一批 device lost 與 popErrorScope，那批訊息要排除，否則 102 項全過的那一輪照樣是紅的。連續導頁要先清成空白頁再導，`Page.navigate` 本身不等頁面換掉，接著問 `#loading.done` 問到的是上一輪那個頁面而它的答案是 true |
| 地球儀版面檢查 | `check_double_tap.mjs`、`check_focus.mjs`、`check_pinch_release.mjs`、`check_sub_gauge.mjs`、`check_click_card.mjs`、`fix_trunk_land.mjs`、`shoot_games.mjs` | headless Chrome 執行的互動與版面檢查，由 `games-checks.yml` 在 PR 觸發。`check_click_card.mjs` 用 CDP 送真的滑鼠事件點國家標籤、點地表、從標籤上拖曳。捕捉指標的時機與 click 送給哪個元素是瀏覽器決定的，抽函式注入假相依驗不到。#563 在按下的當下就捕捉到畫布，桌機上點標籤的 click 從此送到畫布。觸控的 click 照樣送到手指底下的標籤，點標籤那一半在手機上重現不出來，點地表那一半則跟輸入方式無關。觸控另有目標校正，點在小標籤旁邊會被吸到標籤上，所以這支只送滑鼠事件 |
| PWA 與離線 | `check_precache.mjs`、`test_sw_offline.mjs`、`test_lang_preference.mjs`、`test_offline_index.py`、`test_offline_library.mjs` | `check_precache.mjs` 比對預快取清單與 `docs/output` 的實際檔案，驗索引頁連出去的網址形狀命中得了快取的 key，並反過來驗每一頁載入的樣式、腳本與 manifest 都有人負責預快取（需先建置）。反向那道是 2026-09-04 補的：`stylesheets/extra.css` 每頁都載入，`SHELL_ASSETS` 沒收，建置端又因為「每頁都出現」把它從個別頁面的資產移除，兩邊都以為對方負責，離線打開任何一頁都是白的，而清單往檔案的那道檢查看不到這種漏洞。其餘四支把原始碼原地抽出來單元測試，不需要建置：`test_sw_offline.mjs` 測 `docs/zh-TW/sw.js` 的離線路徑，`test_lang_preference.mjs` 測 `docs/overrides/base.html` 的語言導向，`test_offline_index.py` 測 `docs/hooks/offline_index.py` 的分組，`test_offline_library.mjs` 餵一組最小 DOM 替身把 `docs/zh-TW/js/offline-library.js` 整份執行起來，驗它畫出來的結構與送給 service worker 的指令（版面與樣式驗不到，那要靠實機）。由 [`tools-tests.yml`](./.github/workflows/tools-tests.yml) 在 PR 觸發。`check_precache.mjs` 需要建置產物，不在那一支裡，改由 [`build_docs.yml`](./.github/workflows/build_docs.yml) 在建完 standard 版之後執行，壞掉會擋下部署而不是擋下 PR。本機改 `docs/zh-TW/sw.js` 之後可以先建置再手動執行一次 |

## 開發環境設置

此專案使用 **uv** 作為 Python 套件管理工具。所有子專案都使用 Python 3.12+。

### 初始化開發環境

```bash
# 安裝 uv (如果尚未安裝)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 在各子專案目錄中同步依賴
cd docs && uv sync
cd pulse/backend && uv sync
cd asn_coverage && uv sync
```

## Docs 文件網站

### 本地開發

```bash
cd docs

# 啟動開發伺服器 (預設 zh-TW 版本)
source .venv/bin/activate
mkdocs serve
```

三語系的建置驗證用 `run_*.sh`。三支都是 `mkdocs build`，各自 export 該語系需要的環境變數再建置到 `output/`：

```bash
sh run.sh          # zh-TW（預設語系，建在根路徑）
sh run_zh-cn.sh    # zh-CN
sh run_en.sh       # en
```

直接執行 `mkdocs build -f mkdocs_en.yml` 會因為 `DOCS_DIR` 之類的環境變數落回預設值而產生假警報，驗證三語系一律走這三支腳本。

只是要驗結構或網址時，關掉 social 與 privacy 兩個外掛會快很多（三語系 72 秒降到 41 秒），產出的網址與錨點逐位元組相同：

```bash
SOCIAL_CARDS=false PRIVACY_ASSETS=false sh run.sh
```

兩個旗標預設都是 `true`，`build_docs.yml` 不帶它們，發布的產物照樣有社群卡片與本地化的外部資產。要驗卡片或外部資產本身的時候不要關。

### 建置文件

```bash
cd docs

# 建置所有語言版本
sh build_docs_anoni.sh        # 標準版本
./build_docs_anoni_ipfs.sh    # IPFS 版本
sh build_docs_anoni_onion.sh  # Onion 版本
```

IPFS 那支要用 `./` 或 `bash` 執行，不能用 `sh`。它需要 bash 的 `set -o pipefail`，
Ubuntu 的 `sh` 是 dash，一進去就中止在 `Illegal option -o pipefail`。錯誤發生在
`trap` 裝好之前，看起來像什麼都沒做就結束。另外兩支沒有 bash 專用語法，`sh` 可以。

### 多語系架構

- 使用環境變數控制不同語言的設定（透過 mkdocs.yml, mkdocs_en.yml, mkdocs_cn.yml）
- 文件內容分別存放在 `zh-TW/`, `zh-CN/`, `en/` 目錄
- 支援三種部署目標：標準網站、IPFS、Tor Onion

### MkDocs 設定重點

- **Theme**: Material for MkDocs
- **外掛**:
  - `git-revision-date-localized`: 顯示文件修改時間
  - `blog`: 部落格功能
  - `rss`: RSS feed
  - `charts`: Vega-Lite 圖表支援（用於數據視覺化）
  - `social`: Open Graph 社群分享卡。版型是 `docs/layouts/anoni.yml`，三個語系共用一份，
    語系差異（字型、卡片上的站名）寫在各自的 `mkdocs*.yml`。`cards_layout_dir` 相對於
    執行 mkdocs 的目錄，所以建置一律在 `docs/` 底下執行。設計說明見
    `docs/zh-TW/community/brand-assets.md` 的「社群分享卡」一節
- **特殊功能**: 使用 `custom_dir` 設定客製化的 overrides（針對不同語言有不同的 overrides 目錄）

### 軟體更新日誌（changelog/）

`docs/<lang>/changelog/` 底下十二頁追蹤 Tor 家族、OONI、OnionShare 與五種作業系統的版本更新，目標是讓非工程師讀者能依風險自己判斷要不要更新。

動這批頁面之前先讀 [`docs/CHANGELOG_SOURCES.md`](./docs/CHANGELOG_SOURCES.md)，那裡記了各頁的上游在哪、怎麼取，以及八個會踩的坑。最容易誤判的三個：MSRC 的嚴重度是每個受影響產品各記一筆，直接數會膨脹好幾倍。GrapheneOS 發布說明裡的「List of additional fixed CVEs」是提前修補未來月份的累積清單，不是當月涵蓋範圍。Apple 同一輪多條維護線的公告元件同名，修的卻不一定是同一項，歸屬要逐條看 `Impact:`。

急迫程度標籤的判準各頁不同，有的看證據、有的看官方發布形式，那一份也寫明了。

## Pulse 監控系統

Tor 中繼監控系統，定期收集並儲存 Tor 網路資料，提供 API 供前端查詢。

### 本地開發

```bash
cd pulse

# 啟動所有服務 (PostgreSQL + Backend + API)
docker-compose up -d

# 查看服務狀態
docker-compose ps

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down
```

### 環境設定

複製 `.env.sample` 並依據需求修改：

```bash
cp .env.sample .env
# 編輯 .env 檔案設定資料庫密碼、API host 等
```

### 架構說明

- **db**: PostgreSQL 17 資料庫
- **db-init**: 初始化資料庫 schema（執行 `dbtxt/*.sql`）
- **backend**: 排程任務容器，使用 cron 定期執行 `tor.py details` 收集各國家的 Tor 中繼資料
- **api**: FastAPI 應用，提供 REST API 和 Vega-Lite 圖表資料端點

### API 開發

```bash
cd pulse/backend

# 本地開發 API
uv run fastapi dev api.py

# 或使用 uvicorn
uv run uvicorn api:app --reload
```

API 文件位於: `http://localhost:8000/api/readme` (Swagger UI)

### 資料庫操作

資料庫 schema 定義在 `pulse/backend/dbtxt/`:
- `relay_details.sql`: Tor 中繼詳細資料表
- `asn_count.sql`: ASN 統計資料表

### 定期任務

Backend 容器使用 Alpine Linux 的 crond 定期執行：
- 每小時第 5 分鐘收集 TW, JP, KR, HK 的 Tor 中繼資料
- 容器啟動時執行一次 (@reboot)

### 程式碼結構

```
pulse/backend/
├── api.py              # FastAPI 主應用
├── routers/
│   └── vega.py         # Vega-Lite 圖表端點
├── tor.py              # Tor 資料收集 CLI
├── tor_onionoo.py      # Onionoo API 客戶端
├── ooni.py             # OONI API 客戶端
├── pgdb.py             # PostgreSQL 資料庫操作
├── structs.py          # 資料結構定義
└── dbtxt/              # SQL schema 定義
```

## ASN Coverage 分析工具

分析 OONI 觀測資料在各區域 ASN 的涵蓋狀況。

### 資料來源

使用 OONI 在 AWS S3 的公開資料集：
- Bucket: `ooni-data-eu-fra` (eu-central-1)
- 格式: `raw/{date}/{hour}/{country}/webconnectivity/*.jsonl.gz`

### 使用方式

```bash
cd asn_coverage

# 回溯最近 36 小時的資料
uv run python ooni.py lookback --units=36 --loc=TW --frame=hours

# 指定時間區間
uv run python ooni.py span --start=2025/01/01 --end=2025/01/31 --loc=TW --chunk=40

# 轉換原始資料為行格式
uv run python ooni.py sheetrow --path=./lookback_TW_20250101_36_hours.csv
```

### 資料處理流程

1. 從 S3 下載指定時間區間的 `jsonl.gz` 檔案
2. 解析 JSON 並統計每個 ASN 的觀測次數
3. 輸出為 CSV 格式（包含時間、地區、ASN、統計資料）
4. 可使用 `sheetrow` 命令轉換為更易讀的行格式

### 效能優化

- 使用多執行緒 (Threading) 平行下載與處理資料
- 支援 chunk 分批處理，避免記憶體溢出
- 顯示進度條追蹤下載狀態

## Git 工作流程

### 主要分支

- `main`: 主要開發分支
- `docs`: 文件建置觸發分支（CI/CD）

### CI/CD

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

## 專案特定注意事項

### 撰寫文件時

- 預設使用正體中文（zh-TW）撰寫
- 部落格文章放在 `docs/{lang}/blog/posts/` 目錄
- front matter、註腳、圖表與結構化資料的寫法見貢獻者百科的「文章格式」一節
- 支援 Vega-Lite 圖表（使用 ````vegalite` code fence）
- 寫作風格的單一來源是[貢獻者百科](https://anoni.net/docs/community/contributor-handbook/)（原始檔 `docs/zh-TW/community/contributor-handbook.md`）的「寫作風格規範」一節。要新增或修改規則先改那裡
- 寫作風格規範的套用範圍不限於 `docs/` 的內容。repo 根目錄的說明文件（`README.md`、`CONTRIBUTING.md`、`AGENTS.md`、`CLAUDE.md`、`NOTICE`、各子目錄的 `README.md`）同樣要遵守。這幾個檔案不在 CI 的觸發路徑內，改完自己執行一次 linter。`NOTICE` 沒有 `.md` 副檔名，linter 只收 `.md` 與 `.js`，那一份要人工看
  - 規則文件本身逐條寫出被禁用的標點與句型，掃自己的規則描述必然全紅。貢獻者百科與這份投影靠 linter 的 `RULE_DOCS` 依檔名豁免，`tools/README.md` 的規則表與已知邊界兩段改用 `<!-- docs-style-lint: disable -->` 與 `enable` 包住。往後寫規則說明時照同一個做法，不要改掉引用的例子
- 送 PR 前可先執行 `python3 tools/docs_style_lint.py <path>` 自檢，CI 會對變更的中文 Markdown 執行同一支
- 語系的資料夾與對外 URL 規則不同：`docs/zh-TW/` 對應 `https://anoni.net/docs/`（預設語系不帶語系區段），`docs/zh-CN/` 對應 `/docs/zh-cn/`（URL 小寫），`docs/en/` 對應 `/docs/en/`
- `/docs/zh-tw/` 是已停用的舊網址，由 Cloudflare Redirect Rule 301 導回 `/docs/`。它曾經是 `run_zh-tw.sh` 建出來的第二棵樹，內容與根路徑完全相同，兩邊各自 self-canonical 又各自進 sitemap，等於自製重複內容。語言選單的 zh-TW 項填 `/docs/` 就夠，不要再加回那份建置

### 做小工具時

- 對外的四條規則寫在 `docs/zh-TW/utils/index.md` 的前言，要改規則先改那裡，三語系一起改
- 不做任何把資料送到伺服器的便利功能，「存起來給別人看」的分享連結也算。核心運算在瀏覽器裡完成，跟這個工具有沒有側門是兩件事，而畫面上分不出來。JSONFormatter 與 CodeBeautify 的政策寫著 `99% of our tools are doing processing on browser using Java Script`，那句話是真的，出事的是另外一顆存檔按鈕，存下來的內容預設公開且搜尋引擎索引得到。watchTowr Labs 2025 年從那裡取得八萬多份提交、超過 5 GB，涵蓋五年份的內容，裡面有資料庫密碼、雲端金鑰與企業內部帳號。兩站的政策都警告過不要存機密資料，看到的人不多
- 判準是「斷網之後這個工具還做得完它宣稱的事嗎」，做得完才收進來。這條同時擋掉需要外部服務的功能與需要伺服器才成立的便利功能
- 互動成本有上限。讀者要做的選擇與輸入落在個位數到十位數，超過就變成在做一套應用程式，說明留給文章。開工前先量一次

### 修改 API 時

- FastAPI 使用 `root_path="/api"` 設定，所有端點需加上 `/api` 前綴
- CORS 設定透過環境變數 `CORS_ALLOW_ORIGINS` 和 `CORS_ALLOW_CREDENTIALS` 控制
- 健康檢查端點：`/api/healthz`（只回版本，不連資料庫）與 `/api/readyz`（每次呼叫都連資料庫，連不上回 503）。容器 healthcheck 探測 `/api/readyz`，`healthz` 綠燈不代表資料查得到

### 資料庫操作

- 使用 psycopg 3 (非 psycopg2)
- 連線字串格式: `postgresql://{user}:{password}@{host}:{port}/{database}`
- Schema 變更需更新 `dbtxt/*.sql` 並重新執行 db-init

### 使用 OONI 資料時

- 需使用 s5cmd（不支援 s3cmd）或 boto3 存取公開 bucket
- 設定 `signature_version=UNSIGNED` 存取公開資料
- 注意已知問題：某些 ASN 的地區標籤可能不準確（如 AS38136）

## 程式碼風格

- Python: 使用 ruff 進行 linting（僅 pulse/backend 有設定）
  - 目標版本: Python 3.12
  - 行長度: 100 字元
  - 啟用規則: E (錯誤), F (pyflakes), I (import sorting)

- 文件：使用 `tools/docs_style_lint.py`，規則出自貢獻者百科，三語系都掃。error 級擋 merge，warn 級只提醒
- 使用 uv 管理所有 Python 專案依賴
- 所有專案使用 Python 3.12+
