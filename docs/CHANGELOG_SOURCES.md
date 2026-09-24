# changelog/ 的資料源與維護方式

`docs/<lang>/changelog/` 底下十四頁的上游在哪、怎麼取、判準怎麼定。這一份不會被建置（`docs_dir` 指向語系目錄），只給維護的人看。

## 資料源

| 頁面 | 上游 | 取得方式 |
|---|---|---|
| `tor.md` | Tor Browser 公告 | `blog.torproject.org/new-release-tor-browser-<版本無點號>/`，Alpha 是 `new-alpha-release-tor-browser-<版本>` |
| `tor-daemon.md` | c-tor ChangeLog | `gitlab.torproject.org/tpo/core/tor/-/raw/main/ChangeLog`（2 MB） |
| `anti-censorship.md` | Snowflake、lyrebird 的 ChangeLog | GitLab API 的 `repository/files/ChangeLog/raw?ref=main` |
| `arti.md` | Arti CHANGELOG | `gitlab.torproject.org/tpo/core/arti/-/raw/main/CHANGELOG.md` |
| `ooni.md` | probe-multiplatform 與 probe-cli | GitHub releases API，兩條線版本號不同 |
| `onionshare.md` | GitHub releases 與 GHSA | `api.github.com/repos/onionshare/onionshare/security-advisories/<GHSA>` |
| `tails.md` | Tails 公告 | `tails.net/news/version_7.11/`，版本號用點號 |
| `ios.md`、`macos.md` | Apple 安全性更新 | 總表 `support.apple.com/en-us/100100`，個別公告用數字 ID |
| `windows.md` | MSRC CVRF | `api.msrc.microsoft.com/cvrf/v3.0/cvrf/2026-Aug`，單月 4 到 12 MB |
| `android.md` | Android 安全公告與 Pixel 更新公告 | `source.android.com/docs/security/bulletin/2026/2026-08-01`，Pixel 的在 `bulletin/pixel/2026/2026-08-01`。Pixel 那份晚一週左右發布，利用狀態可能只寫在那一份（2026 年 9 月的 CVE-2026-58704），兩份都要看 |
| `grapheneos.md` | GrapheneOS 發布 | `grapheneos.org/releases.atom` |
| `browsers.md` | Chrome 桌面穩定版公告與 Mozilla 安全公告 | `chromereleases.googleblog.com/feeds/posts/default?alt=json`（一次最多 150 則，用 `start-index` 往前翻），Mozilla 的 `github.com/mozilla/foundation-security-advisories` 底下 `announce/<年>/mfsa<年>-<編號>.yml` |
| `messaging.md` | WhatsApp 安全公告與 Signal 的發布 | WhatsApp 以 NVD API 查 Meta 的 CNA（`sourceIdentifier=cve-assign@fb.com`），Signal 看三個 repo 的 GitHub releases 與 security advisories |

## 十個會踩的坑

### MSRC 的嚴重度是每個受影響產品各記一筆

同一顆 CVE 平均對應五個多產品，直接數 `Threat[Type=3]` 會膨脹好幾倍。統計 Critical 數要先用 CVE 編號去重。2026 年 8 月直接數是 721，以相異 CVE 計只有 134。

### MSRC 的項目總數涵蓋微軟整個產品線

2026 年 8 月的 1506 個 CVE 裡，Windows 本體只有 248 個，Azure Linux（Mariner）佔 698 個，Edge/Chromium 佔 362 個。寫「單月上千個漏洞」會誤導，要分層說明。

### Apple 同一輪的多條維護線，元件同名不代表修的是同一項

Apple 一天發三到五份公告時，各條線的公告會出現大量同名元件，用元件名稱比對歸屬會寫錯。2026 年 9 月 14 日那一輪，Accessibility 在 iOS 27、iOS 26.7 與三份 macOS 公告裡都有，但「app 可以查出使用者裝了哪些其他 app」只出現在 iOS 27。App Store 的常駐帳號識別碼問題在 macOS Golden Gate 27 與 Tahoe 26.7 有，Sequoia 15.8 沒有。歸屬要逐條看 `Impact:` 那一行，不要停在元件名稱。

同一輪各版本的 CVE 集合也不是包含關係。那一輪 iOS 26.7 有 7 個 CVE 沒有出現在 iOS 27 的清單裡，Sequoia 15.8 有 11 個沒有出現在 Golden Gate 27 的清單裡。寫成「舊線是新線的子集」會是錯的，兩邊都要各自算。

利用狀態同樣逐份確認，掃公告全文的 `exploited` 這個字。那一輪五份公告都沒有出現，才寫得出「Apple 沒有標注任何一項已被實際利用」。

### GrapheneOS 的「List of additional fixed CVEs」不是當月修補

那是 security preview release 提前套用未來數月公告的清單，會逐版累積，原文寫明涵蓋哪幾個月的公告。誤讀成當月涵蓋範圍會讓整頁的數據失去意義。

### Android 公告的網址 2026 年起多一層年份目錄

舊格式 `/bulletin/2026-08-01` 會 404，新格式是 `/bulletin/2026/2026-08-01`。另外 2026 年 7 月起公開頁面不再有 CVE 明細表，6 月那份還有 119 個，7 月與 8 月只剩說明文字，用瀏覽器完整渲染也一樣。

### c-tor 的 ChangeLog 在 `main` 分支不是最新的

2026 年 8 月時 `main` 上只到 0.4.9.9，0.4.9.10 與 0.4.9.11 要從各自的 tag 讀（`repository/files/ChangeLog/raw?ref=tor-0.4.9.11`）。只讀 `main` 會漏掉最新兩版。

### 同一個安全釋出常有多個 TROVE 編號

0.4.9.9 有十個（TROVE-2026-013 到 022），0.4.9.7 有六個。只挑前幾個寫會漏掉影響範圍不同的項目，例如 0.4.9.11 的 TROVE-2026-026 影響的是一般用戶端，不是 onion 服務營運者。

### WebTunnel 沒有維護 ChangeLog

那個檔案在 repo 裡是 404，只能看 tag 訊息與提交訊息，條目要寫明資料源比其他專案薄。

### Mozilla 公告裡的「could have been exploited」是固定套語

記憶體安全錯誤的彙總條目一律寫「we presume that with enough effort some of these could have been exploited」，代表理論上可能被利用，不代表有人在利用。拿「exploited」這個字去掃會把每一版都誤判成立刻，要看的是有沒有寫到 in the wild。2026 年 7 月的 Firefox 152.0.6 另有一種寫法，「exploit code for this is public however we are not aware of any attacks in the wild」，利用程式已公開但沒有攻擊，依判準仍是儘快。Chrome 的寫法固定是「Google is aware that an exploit for CVE-… exists in the wild」，而且嚴重度可能只有 Medium（2026 年 9 月的 CVE-2026-87491），不能用嚴重度篩。

### WhatsApp 的公告頁抓不到

`www.whatsapp.com/security/advisories/<年>/` 用 curl 抓會回 400，換 User-Agent 也一樣，有些網路的 DNS 甚至查不到這個主機名。同樣的內容可以從 NVD API 以 Meta 的 CNA 識別碼查（`sourceIdentifier=cve-assign@fb.com`），結果會混著 React 與 Proxygen 這類 Meta 其他專案，要篩描述裡的 WhatsApp。NVD 的查詢區間最多 120 天，超過會直接回 404。

## 急迫程度分級

有三色標籤的八頁：`ios`、`macos`、`windows`、`browsers`、`messaging`、`tails`、`tor-daemon`、`onionshare`。CSS 是 `docs/<lang>/stylesheets/extra.css` 裡的 `.urg-tag`，`tor.md` 另有 `.chan-tag` 標穩定版與 Alpha。

判準基礎不同，各頁開頭都寫明了，改的時候不要弄混：

- `ios`、`macos`、`windows`、`browsers`、`messaging` 的「立刻」需要證據，也就是上游標注可能已被實際利用，或進了 CISA 目錄
- `messaging` 不收沒有安全公告的版本，只會出現「立刻」與「儘快」
- `tails`、`tor-daemon` 的「立刻」看的是官方發布形式（緊急釋出、security release），不代表已有攻擊
- `onionshare` 的「儘快」涵蓋所有安全修補，不分類別，篩選比其他頁寬，且還沒有「立刻」

不套標籤的頁面：`arti`（開發進度）、`ooni`（量測工具）、`anti-censorship`（偽裝手法的來回調整）、`android`（拿不到利用狀態）、`grapheneos`（自動更新）。各頁都要說明為什麼沒有。

## 每則條目都要寫明利用狀態

措辭依確定性分三種，不要含糊帶過：

- 上游有標注機制、這次沒標：「Apple 沒有標注任何一項已被實際利用」
- 上游明說沒有：「上游明說目前尚未發現這些漏洞被實際利用」
- 上游根本沒提：「上游沒有提到已被實際利用」

沒有安全修補的版本另外寫「這一版沒有安全問題，也就沒有利用與否的問題」，避免用否定句誤導成查證後的結論。

## 寫作與流程

條目由新到舊排，所以術語的解釋要寫在最新的條目裡。寫在時間最舊的條目，讀者由上往下讀會先撞牆。

批次處理版本號時注意前綴匹配，`7.10` 的正則會吃到 `7.10.1`，要比對完整標題行。

front matter 的 `description` 若含半形冒號加空格，YAML 會當成巢狀 mapping，整組解析失敗，`title` 會落回從檔名推導、`icon` 消失，而 mkdocs 不報錯。值裡有冒號就用雙引號包起來。

推 `docs` 分支之後不要立刻抓 workflow run，新的 run 還沒建立，`gh run list --limit 1` 會回傳上一個早已完成的，導致誤判建置完成。用 commit SHA 過濾。
