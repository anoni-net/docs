---
date: 2026-08-19
authors:
    - anoni-net
categories:
    - 技術
    - 隱私
slug: brave-gpu-fingerprinting
summary: "Brave 從 1.93 版起預設抹平 WebGL 與 WebGPU 洩漏的顯示卡資訊。同一次更新裡同時用了一致化與隨機化兩種相反手法，分工的界線落在改動哪一項資料會弄壞網站功能"
description: "Brave 1.93 起預設抹平 WebGL 與 WebGPU 洩漏的顯示卡資訊。本文拆解三項防護的技術細節，說明一致化與隨機化為什麼在同一次更新裡分工，並對照 Tor Browser 與 Firefox 的做法。"
---

# :material-fingerprint: Brave 用兩種相反的手法抹平 GPU 指紋

打開一個網頁，網頁上的 JavaScript 就能取得你的顯示卡型號、驅動資訊，以及硬體支援哪些功能。答案在同一台電腦上幾乎不會變，追蹤公司把它們跟其他裝置特徵組合起來，就是一組不需要 cookie、不需要你同意、跨網站跟著你走的識別碼。

顯示卡是瀏覽器指紋的其中一項來源，字型清單、螢幕尺寸、時區、音訊運算結果同樣算在裡面。整套機制怎麼運作、為什麼清 cookie 沒有作用、各家瀏覽器的預設狀態差在哪，見 [瀏覽器指紋是什麼，為什麼很難擺脫](../../basics/browser-fingerprinting.md)。本文只處理顯示卡這一塊。

Brave 從 `1.93` 版起處理這組訊號，桌面版與 Android 版都預設開啟，分批推送[^brave]。做法有三項，WebGL 的廠商與繪圖器字串換成所有 Brave 使用者一致的通用字串、WebGPU 的硬體描述欄位清空、WebGL 支援的擴充清單注入雜訊。

前兩項讓所有使用者看起來一樣，第三項讓同一個使用者在每個網站看起來都不一樣。兩種方向相反的手法出現在同一次更新裡，各自負責不同的 API。分工的界線落在哪裡，也是 Brave 與 Tor Browser 在指紋抗性上分歧的起點。

<!-- more -->

## 顯示卡為什麼是一組好用的指紋

WebGL 與 WebGPU 讓網站使用硬體加速繪圖，地圖、遊戲、資料視覺化都靠它們。為了讓網站能針對硬體調整繪圖方式，兩組 API 也把底層的硬體細節開放給 JavaScript 查詢。

網站能取得的資訊有三類[^brave]：

- **廠商與繪圖器字串**：透過 `WEBGL_debug_renderer_info` 擴充提供的 `UNMASKED_VENDOR_WEBGL` 與 `UNMASKED_RENDERER_WEBGL` 兩個參數[^mdn]，網站會取得類似 `ANGLE (Apple, ANGLE Metal Renderer: Apple M5 Max)` 的字串，精確到晶片型號。除錯用的擴充最早是 Chrome 為了 Google Maps 開放，後來變成所有網站都能呼叫。
- **支援的擴充清單**：同一個 WebGL context 會回報它支援的完整擴充清單，內容隨 GPU 與驅動而異，追蹤者把整份清單 hash 成一組精簡的識別碼。
- **WebGPU 的硬體描述**：較新的 WebGPU API 會回傳 adapter 的 `vendor`、`architecture` 與 `device` 欄位，例如 `{vendor: 'apple', architecture: 'metal-3'}`。

顯示卡不會天天更換，所以這些值長期穩定，比 cookie 更難清除。使用者換帳號、開無痕視窗、清空瀏覽紀錄，API 回報的硬體特徵仍是同一組。

Brave 執行了一次小規模的網路爬取，分析每次呼叫前的呼叫堆疊（stack trace），觀察排行前段的網站怎麼使用這些 API，結論是多數網站呼叫它們的唯一用途就是瀏覽器指紋識別[^brave]。爬取規模與比例沒有寫在公告裡。

## 一致化與隨機化，各自處理哪一種資料

| 訊號 | Brave 的處理 | 手法性質 |
|------|--------------|----------|
| WebGL 廠商與繪圖器字串 | 換成單一通用字串，所有 Brave 使用者取得相同的值 | 一致化 |
| WebGPU 的 adapter 描述 | 清空 `vendor`、`architecture`、`device` | 一致化 |
| WebGL 擴充清單 | 注入雜訊，每個 session、每個網站（eTLD+1）、每個儲存區看到的值都不同 | 隨機化 |

第三項沿用 Brave 既有的 farbling 機制，2020 年的更新裡寫下的定義是「對半識別性的瀏覽器功能輸出做輕微隨機化，讓網站難以偵測，又不破壞良性、以使用者為本的網站」[^farbling]。

## farbling 的種子怎麼運作

farbling 的行為由種子的產生方式決定，瀏覽器啟動時產生一組隨機的 session token，與造訪的每個第一方頂層框架網域經 HMAC256 混合，得出每個網域一組、壽命與 session 相同的 token[^farbling]。同一個網站在同一個 session 內重複量測會取得完全相同的值，換一個網站取得不同的值，下一個 session 再全部換過。第三方 frame 與 script 沿用頂層 eTLD+1 的種子[^farbling]，嵌入第三方內容不會成為繞道。

指紋器會把大量半識別特徵 hash 成單一識別碼，只要其中一項被隨機化，整組 hash 就被汙染。技術源頭是 PriVaricator（Nikiforakis 等人，WWW 2015）與 FPRandom（Laperdrix 等人，ESSoS 2017）兩項研究[^farbling]。

## 為什麼不全部一致化

擴充清單為什麼走隨機化，公告裡沒有寫。從 API 的用途推測，改動兩種資料對網站功能的衝擊差距很大。

廠商與繪圖器字串主要用於效能調校與硬體黑名單。網站取得的字串不在既有清單裡，最壞的結果是走一般繪圖路徑。把值收斂成一個常數，該欄位對指紋的貢獻直接歸零，代價有限。

擴充清單用於功能協商。網站會依照清單裡有沒有某個擴充，決定要不要啟用某條繪圖路徑，或改走哪一種後備方案。給一份與硬體實況不符的統一清單，網站可能選到硬體無法支援的路徑，也可能放棄本來可用的加速。可行的做法只剩在保留可用性的前提下加入雜訊，讓 hash 出來的值不穩定。

兩種手法的防護目標也不同，一致化降低的是熵（entropy），讓某一項特徵失去區辨力，理想狀態是全世界的 Brave 使用者在該欄位完全相同。注入雜訊破壞的是可連結性（linkability），值仍然帶有資訊，但每站每次都不一樣，追蹤者無法把兩個網站上的你接成同一個人。

## Tor Browser 把一致化做到底

Pierre Laperdrix 2019 年替 Tor Project 寫的指紋介紹文章，開宗明義寫著「所有 Tor 使用者應該有完全相同的指紋」。當時的具體做法包含在所有平台回報同一組作業系統資訊、統一時區與螢幕解析度，以及 letterboxing 在內容周圍加上灰邊，把可視區域對齊到固定尺寸，避免最大化視窗洩漏螢幕大小[^tor]。

Laperdrix 也點出隨機化的風險，引用 Eckersley 提出的「可指紋化的隱私增強技術悖論」（Paradox of Fingerprintable Privacy Enhancing Technologies）。舉的例子是某個擴充套件改掉一批數值，卻漏改 `navigator.platform`，於是造出一組現實中不存在的特徵組合，使用者反而更容易被辨認出來[^tor]。隨機化要做對，覆蓋範圍必須夠完整，Brave 持續擴充 farbling 的端點清單也是同一個原因。

Firefox 系的處理方式又是另一種。`privacy.resistFingerprinting` 開啟時，`WEBGL_debug_renderer_info` 這個擴充直接停用，網站呼叫不到[^mdn]。該開關預設關閉，需要使用者自行到 `about:config` 開啟，各家瀏覽器預設做到哪裡的完整對照見 [瀏覽器指紋是什麼，為什麼很難擺脫](../../basics/browser-fingerprinting.md)。停用與回傳通用值各有代價，停用之後網站取不到值，需要自行處理空值的情況，回傳通用值則讓網站收到的資料與真實硬體無異，照常運作。Brave 選後者，一貫把功能損壞的風險壓到最低。公告裡另一項主張是防護要預設開啟，不藏在特殊模式或旗標後面[^brave]。

界線在 Brave 的文件裡也寫得清楚。2020 年說明 farbling 的更新裡有一句建議，需要對抗定向攻擊的使用者應該改用 Tor Browser[^farbling]。隨機化擋得住被廣泛部署的商業追蹤，不提供匿名集（anonymity set）。

## 台灣讀者可以怎麼用

日常瀏覽的層面，預設開啟是這次更新最實際的價值。多數人不會為了隱私去改 `about:config`、切換特殊模式或安裝擴充套件，公告裡也寫了擴充套件本身帶有安全與隱私問題[^brave]。防護在安裝完就生效，門檻接近零。

需要匿名的情境仍然要用 Tor Browser。Brave 的隨機化只處理跨站串接，IP 位址仍然直接暴露給網站，網路路徑上的觀察者也看得到你連了哪裡。記者、行動者、處理敏感題材的工作者，威脅模型不同，工具選擇也跟著不同，可以回頭看 [威脅模型如何建立](../../basics/threat-model.md)。

Tor 的可達性因地而異。中國大陸重度封鎖，需要橋接或其他接入方式，台灣、香港、澳門、新加坡、馬來西亞一般都可以直連，限制轉移到你發表了什麼與 SIM 實名登記留下的紀錄，香港另有 2026 年 3 月起在國安調查中要求交出裝置密碼的義務，連轉機旅客都適用。逐地的可達性與法規細節見 [出差與研討會的數位準備](../../scenarios/asia-travel.md)。Brave 的指紋防護屬於瀏覽器內建功能，不涉及接入方式，裝完就生效。

用 Tor Browser 的人要記得一致化路線靠整體一致性維持。安裝擴充套件、最大化視窗、改動字型設定，都會讓你從人群裡凸出來，細節見 [Tor Browser 進階設定](../../tools/tor-browser-advanced.md)。同一個動作在 Brave 上影響有限，在 Tor Browser 上會直接破壞防護的前提。

想確認自己的瀏覽器洩漏了什麼，EFF 的 [Cover Your Tracks](https://coveryourtracks.eff.org/){target="_blank"} 會列出瀏覽器回報的 WebGL 廠商與繪圖器字串，以及各項特徵的識別力。Brave 的更新完整推送到你的裝置之後，兩個欄位會塌成通用值[^brave]。

## 還沒做完的部分

WebGPU 支援的擴充清單目前還沒納入隨機化，公告裡寫了之後會補上[^brave]。圖形 API 仍是指紋研究的活躍領域，新的洩漏管道會持續出現。

網站功能受損的情況還在觀察期。Brave 保留了逐站調整防護的能力，遇到確實無法正常運作的網站，使用者可以單站關閉圖形防護、關閉指紋防護，或整個關掉 Shields[^brave]。保留這些開關代表取捨仍在，一致化與注入雜訊都無法保證所有網站維持原本的行為。

指紋識別不會因為一次瀏覽器更新而結束。顯示卡這一項被處理掉之後，字型清單、canvas 繪圖結果、音訊運算特徵仍在原地。能安全收斂成常數的訊號就收斂，牽涉功能協商的訊號就注入雜訊，這條分工線也適用於檢視其他標榜指紋抗性的工具。

## 延伸閱讀

- [瀏覽器指紋是什麼，為什麼很難擺脫](../../basics/browser-fingerprinting.md)：指紋由哪些特徵組成、為什麼結構上難以規避，以及各家瀏覽器的預設狀態
- [平台知道你多少事](../../basics/platform-tracking.md)：裝置指紋在整套追蹤生態裡的位置
- [Tor Browser 進階設定](../../tools/tor-browser-advanced.md)：指紋抗性與視窗大小的實際操作
- [威脅模型如何建立](../../basics/threat-model.md)：先確認在抗誰，再選工具

[^brave]: [Brave improves protections against GPU fingerprinting](https://brave.com/privacy-updates/38-webgl-webgpu-fingerprinting-protections/){target="_blank"} - Brave 隱私更新第 38 篇。本文引用的三項防護、爬取觀察、相容性處理與後續規劃皆出自此文。查證日 2026-08-14。
[^farbling]: [Fingerprinting defenses 2.0](https://brave.com/privacy-updates/4-fingerprinting-defenses-2.0/){target="_blank"} - Brave 隱私更新第 4 篇，2020 年。farbling 的定義、HMAC256 種子機制與研究出處出自此文，第三方 frame 沿用頂層種子的說明另見 Brave 的 [Fingerprinting Protections wiki](https://github.com/brave/brave-browser/wiki/Fingerprinting-Protections){target="_blank"}。wiki 頁面會被持續編輯，查證日 2026-08-18。
[^tor]: [Browser Fingerprinting: An Introduction and the Challenges Ahead](https://blog.torproject.org/browser-fingerprinting-introduction-and-challenges-ahead/){target="_blank"} - Pierre Laperdrix，The Tor Project 部落格，2019 年 9 月 4 日。一致化路線、letterboxing 與可指紋化隱私增強技術悖論的說明出自此文，文中的具體做法對應撰文當時的 Tor Browser 版本，該悖論一詞出自 Eckersley 的 PETS 2010 論文，由本文引用。查證日 2026-08-18。
[^mdn]: [WEBGL_debug_renderer_info](https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_debug_renderer_info){target="_blank"} - MDN Web Docs。兩個常數的定義，以及 Firefox 在 `privacy.resistFingerprinting` 為 true 時停用此擴充的說明。查證日 2026-08-18。
