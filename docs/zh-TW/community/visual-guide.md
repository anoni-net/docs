---
title: 文件站的視覺規範
description: 只在 anoni.net/docs 用到的視覺規格：側欄的指南分類色、Material 的介面色、示意圖的用色與製作方式，以及社群分享卡的版型。給要畫示意圖或調整文件站樣式的貢獻者。
icon: material/vector-square
---

# :material-vector-square: 文件站的視覺規範

這一頁收錄只在文件站用到的視覺規格：側欄的指南分類色、Material 主題的介面色、示意圖的用色與製作方式，以及社群分享卡的版型。logo、wordmark 與共用色票屬於整個社群，寫在 anoni.net 的[品牌素材](https://anoni.net/brand/){target="_blank"}。

<style scoped>
.color-swatch { display: inline-block; width: 18px; height: 18px; border: 1px solid #cdcdcd; border-radius: 3px; vertical-align: middle; margin-right: 8px; }
</style>

## :material-palette: 文件站專用的配色

### 指南分類色（側欄導覽）

桌面版左欄「指南」tab 底下的五個分類 chip（概念、工具、場景、進階、報告）各用一個顏色區隔，文字、圖示與框同色。這組是導覽介面的識別色，跟[品牌素材](https://anoni.net/brand/){target="_blank"}的結構性次色屬於不同層級，兩組不要互相挪用。

| Token | 亮色 | 暗色 | 分類 |
|---|---|---|---|
| `--guide-basics`    | `#0079a3` | `#4dbfff` | 概念，品牌 cyan 深一階以過 AA 對比 |
| `--guide-tools`     | `#2e7d32` | `#66bb6a` | 工具，比隱私綠 `#4caf50` 深 |
| `--guide-scenarios` | `#ad1457` | `#f06292` | 場景 |
| `--guide-advanced`  | `#4527a0` | `#b39ddb` | 進階，暗色提亮以過 AA 對比 |
| `--guide-reports`   | `#946c00` | `#e0b020` | 報告，琥珀金，刻意離開藍色系 |

暗色變體在 CSS 裡命名為 `--guide-*-d`。

- 只用在 `extra.css` 的側欄分類 chip。內容標籤、admonition 與三大主題標記用 `--cat-*`
- 避開保留的紫 `#7b1fa2` 與緊急紅 `#d32f2f`
- 五色的亮色在白底、暗色在 slate 底都過 WCAG AA 的 4.5:1。報告原本是藍色，跟概念的 cyan 在三種色盲模擬下幾乎同色（ΔE 最低 2.7），改成琥珀金之後，在紅綠色盲下與概念完全分開（ΔE 60 以上）。概念與進階在第一型色盲下偏近，工具與報告在紅綠色盲下偏近，這兩組靠圖示與文字標籤區分，顏色只是輔助線索（WCAG 1.4.1）
- CSS 依位置上色（`:nth-of-type(1)` 到 `(5)`，概念是 1、報告是 5），順序對應 `mkdocs.yml` 指南 tab 底下的分類排序，改排序時要同步調整 CSS

### 亮色模式的介面色

Material 預設的 light blue 當主色時，在白底的對比只有 2.71:1，過不了 WCAG AA。亮色模式把內文連結、accent、header 與麵包屑改用 cyan-800 `#006d99`（白底 5.76:1）。暗色模式維持 Material 預設，因為 cyan-800 在 slate 底只有 2.27:1。內容裡的小色標籤（首頁公告、活動頁徽章）也都調到 4.5:1 以上。

### 示意圖用色

`docs/diagrams/` 的手寫 SVG 是被 `img` 標籤引用的獨立檔案，取不到頁面的 CSS 變數，所以下面這一組沒有寫成 `var(--x)`，是直接抄 hex 進 SVG 的 `<style>`。class 名稱也照抄，三十幾張圖用的是同一套，換圖的人才不用重新認。

語意色，每一格是底色加框色：

| class | 用在哪 | 亮色 底 | 亮色 框 | 暗色 底 | 暗色 框 |
|---|---|---|---|---|---|
| `.card-c1` | 這一列是重點、主線路徑 | <span class="color-swatch" style="background:#e0f4ff"></span>`#e0f4ff` | <span class="color-swatch" style="background:#4dbfff"></span>`#4dbfff` | <span class="color-swatch" style="background:#0d2b38"></span>`#0d2b38` | <span class="color-swatch" style="background:#4dbfff"></span>`#4dbfff` |
| `.card-ok` | 可以、低成本、風險低 | <span class="color-swatch" style="background:#e8f5e9"></span>`#e8f5e9` | <span class="color-swatch" style="background:#4caf50"></span>`#4caf50` | <span class="color-swatch" style="background:#17301a"></span>`#17301a` | <span class="color-swatch" style="background:#4caf50"></span>`#4caf50` |
| `.card-w1` | 有條件、要注意、中等 | <span class="color-swatch" style="background:#fdf0e4"></span>`#fdf0e4` | <span class="color-swatch" style="background:#f8b878"></span>`#f8b878` | <span class="color-swatch" style="background:#2b1f16"></span>`#2b1f16` | <span class="color-swatch" style="background:#8a5420"></span>`#8a5420` |
| `.card-no` | 不行、高成本、風險高 | <span class="color-swatch" style="background:#fdecea"></span>`#fdecea` | <span class="color-swatch" style="background:#d32f2f"></span>`#d32f2f` | <span class="color-swatch" style="background:#35181a"></span>`#35181a` | <span class="color-swatch" style="background:#e57373"></span>`#e57373` |
| `.card` | 沒有好壞判斷的一般卡片 | <span class="color-swatch" style="background:#ffffff"></span>`#ffffff` | <span class="color-swatch" style="background:#cfd8dc"></span>`#cfd8dc` | <span class="color-swatch" style="background:#23292e"></span>`#23292e` | <span class="color-swatch" style="background:#4b565e"></span>`#4b565e` |
| `.card-n` | 弱化、次要、已排除 | <span class="color-swatch" style="background:#f4f6f7"></span>`#f4f6f7` | <span class="color-swatch" style="background:#b0bec5"></span>`#b0bec5` | <span class="color-swatch" style="background:#1c2226"></span>`#1c2226` | <span class="color-swatch" style="background:#46515a"></span>`#46515a` |

分層圖用的 cyan 三階，由淺到深對應由下到上或由外到內：

| class | 層級 | 亮色 底 | 亮色 框 | 暗色 底 | 暗色 框 |
|---|---|---|---|---|---|
| `.card-c1` | 最淺，第一層 | <span class="color-swatch" style="background:#e0f4ff"></span>`#e0f4ff` | <span class="color-swatch" style="background:#4dbfff"></span>`#4dbfff` | <span class="color-swatch" style="background:#0d2b38"></span>`#0d2b38` | <span class="color-swatch" style="background:#4dbfff"></span>`#4dbfff` |
| `.card-c2` | 中間層 | <span class="color-swatch" style="background:#b3e3ff"></span>`#b3e3ff` | <span class="color-swatch" style="background:#26b3ff"></span>`#26b3ff` | <span class="color-swatch" style="background:#10394b"></span>`#10394b` | <span class="color-swatch" style="background:#26b3ff"></span>`#26b3ff` |
| `.card-c3` | 最深，頂層 | <span class="color-swatch" style="background:#80d1ff"></span>`#80d1ff` | <span class="color-swatch" style="background:#0089bf"></span>`#0089bf` | <span class="color-swatch" style="background:#14495f"></span>`#14495f` | <span class="color-swatch" style="background:#4dbfff"></span>`#4dbfff` |

橘色三階給警示或成本遞增的分層，結構跟 cyan 三階一樣：

| class | 層級 | 亮色 底 | 亮色 框 | 暗色 底 | 暗色 框 |
|---|---|---|---|---|---|
| `.card-w1` | 最淺 | <span class="color-swatch" style="background:#fdf0e4"></span>`#fdf0e4` | <span class="color-swatch" style="background:#f8b878"></span>`#f8b878` | <span class="color-swatch" style="background:#2b1f16"></span>`#2b1f16` | <span class="color-swatch" style="background:#8a5420"></span>`#8a5420` |
| `.card-w2` | 中間層 | <span class="color-swatch" style="background:#f8b878"></span>`#f8b878` | <span class="color-swatch" style="background:#ef6c00"></span>`#ef6c00` | <span class="color-swatch" style="background:#7d4b19"></span>`#7d4b19` | <span class="color-swatch" style="background:#ff8c1a"></span>`#ff8c1a` |
| `.card-w3` | 最深，飽和底 | <span class="color-swatch" style="background:#ef6c00"></span>`#ef6c00` | <span class="color-swatch" style="background:#c85a00"></span>`#c85a00` | <span class="color-swatch" style="background:#ff8c1a"></span>`#ff8c1a` | <span class="color-swatch" style="background:#ffa64d"></span>`#ffa64d` |

底色越深，能放上去的文字色越少：

| 卡片 | 亮色 | 暗色 |
|---|---|---|
| `.card`、`.card-n`、`.card-c1`、`.card-w1`、`.card-ok`、`.card-no` | `.t-main` 與 `.t-mute` 都可以 | 同左 |
| `.card-c2`、`.card-c3`、`.card-w2` | 只用 `.t-main` | 只用 `.t-main` |
| `.card-w3` | `.t-onfill` <span class="color-swatch" style="background:#212121"></span>`#212121` | `.t-onfill` <span class="color-swatch" style="background:#241708"></span>`#241708` |

`.t-mute` 的 `#546e7a` 在 `.card-c2` 是 3.95:1、`.card-c3` 是 3.21:1、`.card-w2` 是 3.12:1，三個都過不了 AA，所以那三種底只放 `.t-main`（9.3 到 11.8:1）。

`.card-w3` 兩個模式要往相反方向走。亮色底 `#ef6c00` 配白字只有 3.08:1，配 `#212121` 是 5.23:1。暗色底 `#ff8c1a` 配 `#eceff1` 只有 2.02:1，配 `#241708` 是 7.51:1。舊的 `.t-inv` 是亮色白字配暗色 `#241708`，亮色那一半不夠，2026-09-19 的直式改版已經全部換成 `.t-onfill`，77 個手寫檔零殘留。

`.t-onfill` 在亮色模式的值跟 `.t-main` 相同，都是 `#212121`，只有暗色模式才分岔成 `#241708`。兩個 class 不能合併，合併之後暗色模式的 `.card-w3` 會掉到 2.02:1。

文字與線：

| class | 用途 | 亮色 | 暗色 |
|---|---|---|---|
| `.t-main` | 主要文字 | <span class="color-swatch" style="background:#212121"></span>`#212121` | <span class="color-swatch" style="background:#eceff1"></span>`#eceff1` |
| `.t-mute` | 次要文字、說明 | <span class="color-swatch" style="background:#546e7a"></span>`#546e7a` | <span class="color-swatch" style="background:#b0bec5"></span>`#b0bec5` |
| `.t-onfill` | 飽和底色上的文字，見上方配對表 | <span class="color-swatch" style="background:#ffffff"></span>`#ffffff` | <span class="color-swatch" style="background:#241708"></span>`#241708` |
| `.rule` | 分隔線 | <span class="color-swatch" style="background:#cfd8dc"></span>`#cfd8dc` | <span class="color-swatch" style="background:#46515a"></span>`#46515a` |
| `.arrow` | 流程箭頭 | <span class="color-swatch" style="background:#90a4ae"></span>`#90a4ae` | <span class="color-swatch" style="background:#6b7780"></span>`#6b7780` |

同一個角色的卡片與標籤不要疊在一起。`.card-w1` 的標籤放進 `.card-w1` 的卡片裡，兩者底色相同，只剩框線在撐，換一個角色或者把外層改成 `.card-n`。

顏色不能是唯一的語意載體。每一個色塊裡的文字要把語意寫完整，例如標籤寫「匿名度 高」而不是只靠綠色。紅配綠是色盲最難分的一組，文字寫完整之後顏色只是輔助，看不出顏色差別的人照樣讀得到內容。

對比實測，文字那幾組都過 WCAG AA 的 4.5:1：`#212121` 在六種亮色底上是 14.1 到 16.1，`#eceff1` 在六種暗色底上是 12.3 到 14.0，`#546e7a` 在白底 5.4、在中性卡 5.0、在 cyan 卡 4.8，`#b0bec5` 在暗色卡是 7.7 到 8.4。

`.t-mute` 訂為 `#546e7a`，它同時也是品牌素材中性色那一組的 `--neutral-muted`。舊值 `#607d8b` 在白底只有 4.37:1，AA 差一點，2026-09-19 的直式改版已經全部換掉，77 個手寫檔零殘留。

框色對頁面底色多半在 1.5 到 2.8:1，沒有到 WCAG 1.4.11 的 3:1。這一組的判斷是框色屬於加強，語意由框內的文字承擔，所以不強求。真的要靠顏色分辨的圖（散點圖、長條圖）不適用這個判斷，那種圖的每一個資料點都要標到文字。

## :material-share-variant-outline: 社群分享卡（Open Graph）

把文件站的任何一頁貼到 Mastodon、LinkedIn、X、Bluesky 或聊天室，對方看到的預覽圖由建置流程自動產生，三個語系各一份，不需要人工做圖。

版面沿用[品牌素材](https://anoni.net/brand/){target="_blank"}的色票。cyan-900 當底色，左緣三段色塊由上而下是 cyan-300、cyan-500、cyan-700，對應 logo 三個六角形的層次。左上角是 mono white logo 與站名，中間是頁面標題，下方依序是頁面描述與網址。頁面 front matter 有 `icon` 時，那個圖示會放大成 10% 透明的底紋擺在右側，沒有的話用 `material/hexagon-multiple-outline`，也就是 logo 的來源圖示。

底色沒有用品牌主色 cyan-500，理由是讀得到字。白字放在 cyan-500 上對比只有 2.5:1，縮到社群平台的預覽尺寸就糊成一團，換到 cyan-900 之後是 11.5:1。描述用 cyan-100，對比 8.4:1，頁尾網址用 cyan-300，對比 5.6:1。

版型檔案是 `docs/layouts/anoni.yml`，三個語系共用同一份。語系差異只有字型（Noto Sans TC、Noto Sans SC、Public Sans）與版面上顯示的站名，分別寫在 `mkdocs.yml`、`mkdocs_cn.yml`、`mkdocs_en.yml`。要調整版面就改那一份版型，不要各語系各存一份。

### 中文標題的換行

產卡片的外掛只在空白處換行。一整句中文沒有空白，會被當成一個詞，超過一行就切在畫布邊緣，連刪節號都不會有。改版之前，站上最長的那個文章標題只顯示得出前半段。

現在的作法是在全形逗號、頓號、冒號、句號、驚嘆號、問號後面補一個半形空白，給換行演算法可以斷的位置，補上的空白落在行尾就會被吃掉。代價是句子中間偶爾看得到多出來的空隙，換來的是三個語系目前每一則標題與描述都完整顯示。標題 14 字以內不處理，那個長度本來就放得下一行。

### 單頁換掉卡片內容

某一頁需要不一樣的標題、描述或底色時，在該頁 front matter 覆寫：

```yaml
social:
  cards_layout_options:
    title: 卡片上要顯示的標題
    description: 卡片上要顯示的描述
    background_color: "#003e57"
```

底圖也走同一個選項。`background_image` 的路徑相對於執行 mkdocs 的目錄，也就是 `docs/`，寫成 `zh-TW/assets/images/xxx.png` 這種形式，檔案找不到時建置會失敗。只填底圖的話，底色自動變成 80% 的 cyan-900 遮罩，白字在任何一張圖上都讀得到。想要原圖直出就多填一行 `background_color: transparent`，代價是淺色的圖會讓標題與頁尾網址消失。

整張圖要自己做的場合（活動主視覺、互動區）走另一種寫法，front matter 填 `og.enabled: true` 與 `og.image`，文件站的模板會改用指定的圖片，並跳過自動產生的那一張。COSCUP 活動頁與互動區目前就是這樣做。

## :material-vector-square: 貢獻技術圖示

技術圖示（流程圖、架構圖、對照矩陣、時間軸）有兩種做法：

- **drawio**：節點與連線多、結構複雜的圖，存成 `.drawio.svg` 雙重格式檔
- **手寫 SVG**：版型規則的圖，例如矩陣、分層、時間軸。直接寫比在畫布上拖拉快，檔案也小一到兩個數量級

兩種都是 SVG，瀏覽器、mkdocs、IPFS 鏡像、Onion 鏡像都直接渲染。

### 圖檔放在 assets.anoni.net

圖檔不進 `docs/<lang>/assets/images/`。三個語系的 `assets/images/` 是三份各自獨立的實體檔案，同一張圖要複製三次，漏掉一個語系就是一頁破圖，而且建置不會報錯。zh-CN 的七張 drawio 圖就是這樣壞了一段時間都沒有人發現。

| 東西 | 位置 |
|---|---|
| 原始檔（進版控，可 review、可回溯） | `docs/diagrams/` |
| 發布出去的副本 | m6 的 `/srv/images-anoni-net/diagrams/` |
| 文章裡引用的網址 | `https://assets.anoni.net/diagrams/<檔名>` |

`docs/diagrams/` 不在 `docs_dir` 底下（`docs_dir` 設成各語系自己的目錄），所以它不會被建置成產物，純粹是原始檔的存放處。

讀者不會直接連到 assets.anoni.net。mkdocs-material 的 privacy 外掛在建置時把外部資產抓成本地檔案，產物裡的 `img src` 是 `assets/external/assets.anoni.net/...` 這樣的相對路徑。Onion 版與 IPFS 鏡像照樣自足，不會有讀者向 clearnet 發請求。

代價是建置時 assets.anoni.net 必須連得到。privacy 外掛下載失敗時仍會把該檔登記進 files，接著 `copy_static_files` 找不到檔案就讓整個建置失敗，外掛本身沒有重試。

### 檔名帶語系

圖裡有中文字就要分語系，檔名寫成 `<slug>.<lang>.svg`：

- `anonymity-visibility-matrix.zh-TW.svg`
- `anonymity-visibility-matrix.zh-CN.svg`
- `anonymity-visibility-matrix.en.svg`

圖裡只有英文術語或完全沒有文字，三個語系共用一份，檔名就不帶語系，寫成 `<slug>.svg`。

還沒補齊三個語系的圖，先讓另外兩個語系引用 zh-TW 那一份，站上至少看得到圖。`docs/diagrams/` 底下帶 `.zh-TW.` 的檔案被 zh-CN 或 en 的頁面引用，就代表那張還沒補。

### 發布

```bash
./tools/publish_diagrams.sh --dry-run   # 只檢查 SVG 語法
./tools/publish_diagrams.sh             # 檢查、上傳、驗證每個網址回 200
```

順序不能反過來。先發布圖、確認網址回得了 200，才改 Markdown 的引用。反過來做會讓下一次建置直接失敗。

改同名檔案還要清 Cloudflare 快取，edge 的 max-age 是 12 小時。設好 `CF_ZONE_ID` 與 `CF_PURGE_TOKEN` 環境變數，發布腳本會順手清掉。

沒清快取就推 `docs` 分支的後果比「站上暫時看到舊版」嚴重。CI 建置時 privacy 外掛是從 edge 抓圖，抓到的舊版會被烘進 S3 產物，之後 edge 快取自己過期也不會修正站上的內容，因為站上讀的是產物那一份。

補救也比想像中難。清掉 edge 快取再重新建置一次是救不回來的：CI 另外快取了 `docs/.cache/plugin/privacy`（理由見 `build_docs.yml` 的註解），同一個網址在那裡已經有檔案，privacy 外掛就不會再去下載。要靠清快取解決，得把 GitHub Actions 上全部 `mkdocs-privacy-*` 的項目刪掉，restore-keys 會 fallback 所以只刪最新的沒有用，而代價是下一次建置要重新對十幾個外部主機碰運氣。

所以規則是不要覆蓋同名檔案。圖有實質改動就換一個檔名，連同 Markdown 的引用一起改，整條路徑上沒有任何一層會取得舊的。

這一輪在 2026-08-28 完整踩過：矩陣圖的配色改過並重新上傳，edge 還在 max-age 內，推了 `docs` 之後站上是舊版。清掉 edge 快取、`workflow_dispatch` 重建一次，站上仍是舊版，因為 CI 的 privacy 快取命中，產物內容沒變連上傳都被跳過。最後把檔名從 `anonymity-vs-privacy-matrix` 換成 `anonymity-visibility-matrix` 才修好。

### 如何儲存才會有 embedded XML

drawio.svg 與純 SVG 的關鍵差別，在於 drawio.svg 的 `<svg>` 根標籤上多了一個 `content="..."` 屬性，裡面是 escape 過的 drawio mxfile XML。drawio 會讀這個 XML 重建原本的結構化編輯體驗。沒有它，drawio 只能把 SVG 視為一堆獨立的 path / rect / text 散件，幾乎沒辦法重編。

drawio Desktop 的 Save 對話框有兩個關鍵欄位：

| 欄位 | 設定 |
|---|---|
| Filename | `xxx.drawio.svg`（雙副檔名，業界慣例） |
| Format dropdown | **Editable Vector Image (.drawio.svg)** |

**Format dropdown 才是決定性的設定**。如果 Filename 取 `xxx.drawio.svg` 但 Format 選了「SVG (.svg)」，會得到一個檔名長得像 `.drawio.svg`、但實際沒 XML 的純 SVG。最容易踩的雷。

drawio Desktop 預設 format 通常是 `.drawio`（純 XML，瀏覽器看不到圖），新建檔時記得手動切到「Editable Vector Image」。或在 Preferences 改 Default save format 永久預設 `.drawio.svg`。

### 不要用 Export

drawio 有兩個寫檔動作：

- **File → Save**（Cmd+S）：寫回原檔，**保留 XML**（前提是 format 是 `.drawio.svg`）
- **File → Export As → SVG**：產生新的純 SVG，**剝掉 XML**

進 repo 的圖示**只用 Save、不要用 Export**。Export As 是給「需要丟給 Photoshop 或其他 SVG viewer」這類場合用，不會放回文件站。

### 如何驗證有 XML

存完之後，終端機執行：

```bash
grep -c mxfile your-diagram.drawio.svg
```

預期出現 1 或更多。如果是 0，這個檔沒 embedded XML、不能重編，請開回 drawio Desktop 重存（記得 format dropdown 選對）。

### 配色一致性：drawio palette 預設

新圖示用[品牌素材](https://anoni.net/brand/){target="_blank"}的 brand cyan 9 階色票。建議在 drawio Desktop **Extras → Configuration** 貼上下方 JSON，把品牌色設為 picker 預設：

```json
{
  "presetColors": [
    "00aeff", "009ee6", "0089bf", "006d99", "003e57",
    "4dbfff", "26b3ff", "80d1ff", "b3e3ff", "e0f4ff",
    "ef6c00", "d32f2f", "4caf50", "7b1fa2", "546e7a", "cdcdcd"
  ],
  "defaultColors": [
    "00aeff", "009ee6", "ef6c00", "d32f2f",
    "4caf50", "7b1fa2", "546e7a", "ffffff"
  ]
}
```

設一次永久存入，畫圖時 picker 直接挑品牌色，不會誤用 Material 預設色。

### 手寫 SVG 的規則

手寫的圖是被 `img` 標籤引用的獨立檔案，取不到頁面的 CSS 變數，顏色只能寫死 hex，照本頁上方「示意圖用色」那一組抄，class 名稱也一起沿用。

#### 畫布寬度照手機訂

畫布抓 400 寬，資訊往下長。圖在頁面上被 `max-width: 100%` 夾進內容欄，縮放比只跟寬度有關，跟高度無關，所以畫布越寬，字縮得越狠，而手機是縮放比最糟的那一端。量過文件站各個視窗寬度的內容欄：

| 視窗寬 | 內容欄 | 940 畫布的縮放 | 400 畫布的縮放 |
|---|---|---|---|
| 1920 | 855 | 0.91 | 1.20 |
| 1440、1280 | 668 | 0.71 | 1.20 |
| 1024 | 750 | 0.80 | 1.20 |
| 768 | 736 | 0.78 | 1.20 |
| 414 | 382 | 0.41 | 0.96 |
| 390 | 358 | 0.38 | 0.90 |
| 360 | 328 | 0.35 | 0.82 |

本文字級桌機 16 到 17.6px，手機 16px。940 的畫布配 11.5px 的最小字，在 1440 渲染成 8.2px，在 360 的手機渲染成 4.0px，大約是旁邊本文的四分之一。2026-09-19 用 headless Chrome 掃過 `docs/diagrams/` 全部 81 個檔，最小字在 360 手機上落在 3.5 到 5.0px，沒有一張例外，而頁面沒有裝 lightbox，讀者只能整頁 pinch-zoom 再平移。

400 的畫布配 13px 的最小字，在 1440 渲染成 15.6px，在 390 手機是 11.6px，在 360 手機是 10.7px。桌機那一端靠 `.diagram-tall` 往上放大到 480px，用法見下方「套到 markdown 文章」。

字級與畫布寬度的關係用這一條算：

```
畫布寬 <= 手機內容欄 × 圖內最小字級 / 目標渲染字級
```

要在 360 手機（內容欄 328）讓最小字渲染到 11px 以上，12.5px 的字對應畫布上限約 372，14px 的字約 417。

#### 橫的東西都翻成直的

左到右的流程改成上到下，並排的欄位改成堆疊的卡片，橫向的時間軸改成直向的時間軸。對照矩陣的欄位標題在 400 寬塞不下的時候，把標題搬進每一格裡，例如四個評分欄改成卡片內的 2×2 標籤。

圖裡不要放整句的註腳。那一兩行散文是逼畫布變寬的主因之一，而且烘進圖片之後不能選取、不能被搜尋，翻譯的時候要整張重畫。把它搬到 `figcaption` 或內文。

`<picture>` 加 `srcset` 分手機與桌機兩份檔案這條路走不通。privacy 外掛只改寫 `img src`、`script src`、`a href` 與 SVG 的 `image href`，`srcset` 不會被在地化，onion 與 IPFS 版會留下對 assets.anoni.net 的 clearnet 請求。

#### 版型範本

下面這張圖把每個版型元件與每個色票 token 各用一次。做新圖時照它抄，尺寸、內距與色值都在裡面。

<figure markdown="span">
    <img class="diagram-tall" src="https://assets.anoni.net/diagrams/diagram-reference-v4.zh-TW.svg" alt="示意圖版型範本，由上而下依序是六塊。帶 eyebrow、title、sub 與 lines 的卡片。兩欄標籤的卡片，四個標籤分別是良好、中等、警示、中性。有小標分段的卡片。一個分節標題。上下流程的三個節點與置中連接線。cyan 三階與橘色三階各三張卡片。">
    <figcaption>每個元件與每個 token 各用一次，做新圖時照這張抄</figcaption>
</figure>

固定的數字：畫布 400 寬，外距 12，卡片內距 14，所以文字可用寬度是 348。卡片上緣到第一行文字 24px，行距 17px。

卡片之間的間距有三個值，依關係選：

| 間距 | 用在哪 |
|---|---|
| 8px | 同一族群的色階變體堆疊，例如三階分層的三張卡片 |
| 10px | 一般情況，語意不同的兩張卡片之間 |
| 14px | 段落或族群的邊界，例如從 cyan 三階跳到橘色三階 |

圓角有三個值，依形狀選：

| rx | 用在哪 |
|---|---|
| 8 | 卡片 |
| 6 | 流程節點與卡片內的小方框 |
| 高度的一半 | 膠囊狀標籤。標籤高 24 時 rx 是 12，不要寫死 6 |

字級只有 15、14、13 三個值。這套階層是「粗細乘顏色」兩個軸疊出來的，不是一路遞增的字級 scale：15 與 14 是粗體深色，13 同時出現在粗體（小標）與細體（內文）。想再加一層強調時改粗細或改顏色，不要插進 12.5 或 13.5 這種中間值，在 0.82 到 1.2 的縮放範圍內那 0.5px 沒有人看得出來。

#### eyebrow 用 muted，alt 是唯一的權威文字

卡片的 eyebrow 跟 sub 同一個顏色系（淺底用 `.t-mute`，`.card-c2`、`.card-c3`、`.card-w2` 用 `.t-main`，`.card-w3` 用 `.t-onfill`），只有 title 用深色。三行的層次是「淡的小標、深的標題、淡的副標」。eyebrow 跟 title 都用深色的話，兩行只差 1px 字級，在 328 寬看起來像標題被拆成兩行。

eyebrow 放的是分類或編號（「第一級」、「Send」、「環境層」），title 說明這一格的內容。如果某個字串單獨看就是這張卡的主要資訊，它應該是 title 而不是 eyebrow。

SVG 內只留一個簡短的 `<title>`，給直接開啟檔案網址的情境用，不要寫 `<desc>`。圖是被 `img` 標籤引用的，瀏覽器把它當成不透明的點陣圖，SVG 內部的 `title`、`desc`、`role`、`aria-*` 都不會被輔助科技讀到，讀者聽到的一律是 `img` 的 `alt`。完整的說明只寫在 `alt` 那一份，兩邊各寫一份的結果是內容各自漂移。

#### 流程用置中的連接線

上下流程的節點是滿版的圓角矩形，文字靠左。節點之間留 18px，中間放一條置中在畫布中線的連接線，線用 `.arrow`（stroke `#90a4ae`，暗色 `#6b7780`，寬 1.6），末端接一個 `.arrow-h` 的實心三角形。

不要拿「↓」這類文字字元當箭頭。字元的基線、字重與字級都跟著內文走，位置也對不齊節點中線，看起來像漏字而不像流程。

```
節點 rect x=26 width=348 rx=6
連接線   M200 y V y+12
箭頭     M196 y+11 L204 y+11 L200 y+18 Z
```

#### 斷行交給版面算

英文版排不下的時候讓圖長高，不要讓圖變寬。三個語系共用同一組欄位座標，長度差異靠折行吸收。資料裡一句就是一句，斷行的位置交給版面算，手寫斷行加上折行會長出 `the`、`on` 這種單字孤行，中文那一側則是整行只剩一個「。」，或者句號落在行首。`docs/diagrams/` 目前有 10 處這種痕跡，散在 `donation-channels`、`shutdown-levels`、`baseline-layers` 三組檔案裡。

定稿前用 headless 瀏覽器在 360 與 390 兩個寬度各量一次實際渲染字級。只看 SVG 檔本身量不出來，字級要乘上縮放比才是讀者看到的大小。

深色模式在 SVG 內用 `@media (prefers-color-scheme: dark)` 自己處理，色值照上方「示意圖用色」的暗色那兩欄抄。自己配的話原則是把主色提亮，例如 cyan-700 `#0089bf` 換成 cyan-300 `#4dbfff`。

站上的 palette 切換傳得進獨立的 SVG。Material 在 slate 主題下會對 `body` 設 `color-scheme: dark`，瀏覽器把這個值帶進 `img` 載入的 SVG 文件，讀者手動切到暗色的時候圖會跟著換。2026-09-19 在 Chromium 與 Firefox 兩邊都驗過：系統設亮色、文件站切 slate 的組合，圖照樣渲染成暗色那一組。七張 drawio 圖沒有這一段，在暗色底上會看到白底方塊。

色塊裡的文字用中性深色 `#212121` 或白色，不要拿主色當文字色。`#ef6c00` 與 `#4caf50` 這類顏色在白底的對比度不到 4.5:1，語意靠框色與文字本身表達就夠了。

`<style>` 區塊裡不要出現尖括號，連註解裡都不行。註解寫了帶角括號的標籤名，整份檔案就不是合法 XML，而瀏覽器照樣顯示得出來，只有 XML parser 抓得到。`publish_diagrams.sh` 會擋這個。

手寫的圖自帶外框與內距，不要再套 `.brand-frame`，那會變成雙框。drawio 匯出的圖沒有外框，維持套 `.brand-frame`。

圖裡的文字一樣適用寫作規範，但 `docs_style_lint.py` 只收 `.md` 與 `.js`，掃不到 SVG。文字定稿之前先自己對一次規範，口語詞那幾條最容易漏。發布之後才發現要改，就得換檔名，因為覆蓋同名檔案會撞上 edge 快取。

### 套到 markdown 文章

drawio 圖，套 `.brand-frame`：

```markdown
<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/diagrams/<name>.zh-TW.drawio.svg" alt="圖示說明">
</figure>
```

手寫 SVG，自帶外框，改用 figcaption，並且套 `.diagram-tall`：

```markdown
<figure markdown="span">
    <img class="diagram-tall" src="https://assets.anoni.net/diagrams/<name>.zh-TW.svg" alt="把圖的內容用文字說完整">
    <figcaption>一句話說明這張圖在講什麼</figcaption>
</figure>
```

`.diagram-tall` 做的事是 `width: 480px` 配 `max-width: 100%`，讓 400 的畫布在桌機放大到 480，在手機縮到內容欄寬。舊的橫式圖先不要套，它們的畫布是 880 到 1000，套上去會被夾到 480，字比現在更小。

`.brand-frame` 是 anoni.net 圖示的 utility class（cyan 邊框加軟陰影）。

alt 要把圖的內容說完整，不要只寫「示意圖」三個字。語音朗讀、Onion 版的低頻寬情境、圖抓不到的時候，讀者手上只剩這一段文字。

示意圖不要包 `<a>` 做點擊放大。SVG 在頁面裡本來就看得清楚，而 `<a href>` 不會被 privacy 外掛改寫，Onion 版的讀者點下去會跳出 Tor 連到 clearnet。截圖那類需要放大的圖才包 `<a>`，那些本來就是 PNG。

### 純 SVG / PNG export 的場合

如果某張圖也要做 SNS 卡片、印刷品、外部投影片用（不需要重編能力），再多 Export 一份純 SVG 或 PNG 即可。**這份 export 不要進 repo**（避免重複），放本機或社群素材庫即可。

## :material-link-variant: 接下來

- [貢獻者百科](contributor-handbook.md)：整體貢獻流程、PR 規範、翻譯流程
- [品牌素材](https://anoni.net/brand/){target="_blank"}：logo、wordmark、共用色票與各站的視覺分工
