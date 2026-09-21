---
date: 2026-09-09
authors:
    - anoni-net
categories:
    - 技術
    - 隱私
slug: ublock-origin-mv3
summary: "Chrome 使用者已經裝不回完整版的 uBlock Origin。Firefox、LibreWolf 與 Brave 各用不同方式留住它，Google 則在同一年收掉了取代第三方 cookie 的整套計畫"
description: "完整版 uBlock Origin 為什麼不能在 Chrome 使用，Firefox、Brave 與 LibreWolf 分別用什麼方式留住它，以及擋廣告從擴充功能搬進瀏覽器核心之後，使用者失去了什麼。"
---

# :material-shield-off-outline: 完整版 uBlock Origin 已經無法在 Chrome 使用

Chrome 使用者現在裝不回完整版的 uBlock Origin。2026 年 8 月 31 日，Chrome Web Store 移除最後一批 Manifest V2 擴充功能[^chrome-timeline]，uBlock Origin 是其中一個。已經裝在舊版 Chrome 上的還留著，但無法再更新，移除之後也裝不回來。

Manifest 是 Google 替 Chrome 擴充功能訂的規格，決定擴充功能能做哪些事。第二版讓擴充功能在網頁載入前逐一檢查每個連線請求，當場決定要不要擋。第三版改成事先申報一份規則清單，比對與攔截交給瀏覽器執行。廣告攔截器原本靠第二版的做法運作。

過程走了四年多，從 2022 年初停收新的 MV2 擴充功能開始，到 2025 年 7 月全面停用，再到今年 8 月的下架。每一步都有公開文件與時程表。

2025 年 10 月 17 日，Google 退役十項 Privacy Sandbox 技術[^ps-retire]，原本要用來取代第三方 cookie 的整套計畫收在那一天。第三方 cookie 繼續留在 Chrome 裡。

規則上限與 API 差異整理在文章後半，只想知道該換什麼工具的讀者可以直接跳過。

<!-- more -->

## 四年的退場過程

| 日期 | 發生什麼 |
|------|----------|
| 2022 年 1 月與 6 月 | Chrome Web Store 停收新的 MV2 擴充功能 |
| 2024 年 6 月 3 日 | Beta、Dev、Canary 開始顯示警告橫幅 |
| 2024 年 10 月 9 日 | Chrome stable 分批停用已安裝的 MV2 擴充功能，企業政策可豁免到 2025 年 6 月 |
| 2025 年 3 月 31 日 | 全頻道預設停用，使用者仍可手動開回 |
| 2025 年 7 月 24 日 | Chrome 138 起一律停用且無法開回，企業政策在 Chrome 139 移除 |
| 2026 年 8 月 31 日 | Chrome Web Store 移除所有剩餘的 MV2 擴充功能 |

## 各家瀏覽器分成三條路

| 瀏覽器 | 完整版 uBlock Origin | 靠什麼 |
|--------|-----------|--------|
| Chrome | 不能用 | MV2 程式碼已從 Chromium 移除，只剩 uBlock Origin Lite |
| Edge | 退場中 | 消費者版 2026 年底完成，企業版 2027 年初 |
| Firefox | 可以用 | Gecko 引擎保留攔截式的 `webRequest`，MV3 也保留 |
| LibreWolf | 可以用 | Firefox 分支，安裝時就內建 uBlock Origin |
| Brave | 可以用 | 自架伺服器託管四個 MV2 擴充功能 |
| Safari | 不能用 | WebKit 的 content blocker 是申報式，uBlock Origin 在 Safari 13 之後就沒有支援 |

Microsoft 在 2026 年 8 月 7 日的公告寫，Edge 的消費者版 MV2 退場「Beginning in August 2026」開始，目標「complete the consumer transition by the end of 2026」，企業版接在 2027 年初[^edge]。公告寫的理由是 MV3 在安全與效能上優於 MV2，全文沒有提到 uBlock Origin。

Firefox 有自己的引擎，MV3 由 Mozilla 自行實作，官方文章寫 Firefox「will continue supporting both blockingWebRequest and declarativeNetRequest」[^mozilla]。兩個 API 都在，擴充功能作者可以選。

Vivaldi 與 Opera 屬於 Chromium 系。Vivaldi 的內建攔截器接的是 Chromium 內部 API，不受 MV3 影響，2022 年那篇說明文章的措辭是，如果有簡單的方法讓 `webRequest` 繼續運作一段時間會考慮，沒有做出承諾[^vivaldi]。上游已經沒有 MV2 程式碼，任何跟隨上游的分支要繼續支援，都得自己維護修改。

## 你現在可以怎麼選

### 瀏覽器層

Firefox 是最直接的選擇，完整版 uBlock Origin 在桌面與 Android 都能裝，安裝之後預設的過濾清單就夠用。

Brave 內建的 Shields 安裝後就生效，需要進階控制時再從 `brave://settings/extensions/v2` 裝 MV2 版的 uBlock Origin。要注意該專案的說明文件明確寫不要同時使用兩個內容攔截器，兩個一起開可能互相干擾。

留在 Chrome 的人，uBlock Origin Lite 擋得掉大部分廣告，動態控制與即時的清單更新沒有了。

### LibreWolf 適合什麼樣的人

LibreWolf 是 Firefox 的社群分支，把隱私設定預先調好再打包出貨。官方功能頁寫的預設值包含內建 uBlock Origin 並配好過濾清單、Tracking Protection 開在 strict 模式、Total Cookie Protection、完全停用遙測，以及啟用 RFP（Resist Fingerprinting）這項來自 Tor Uplift 專案的指紋防護[^librewolf-features]。裝完直接使用就有一整套設定，省去自行研究 `about:config` 的工夫。

RFP 會讓一部分網站顯示異常，canvas 存取需要逐站允許，語言統一回報成 en-US，視窗尺寸也被對齊。LibreWolf 也沒有自動更新功能，官方 FAQ 寫更新「relies on package managers or users to apply them」，跟上 Firefox 穩定版通常在三天內，有時同一天[^librewolf-faq]。安全性更新要自己記得裝，或交給套件管理員。Android 使用者則沒有這個選項，官方 FAQ 寫目前沒有人在開發，可改用 IronFox[^librewolf-faq]。

適合的是願意接受偶爾網站顯示異常、也會固定更新的桌面使用者。不想處理更新節奏的人留在 Firefox 自行安裝，實際防護差距不大。

Mullvad Browser 是另一個選項，由 Mullvad 與 Tor Project 合作開發，等於拿掉 Tor 網路的 Tor Browser，預設內建 uBlock Origin，用 letterboxing 之類的手法讓所有使用者的指紋看起來相近，支援 Linux、macOS 與 Windows。它走的是一致化路線，網站顯示異常的機率比 LibreWolf 更高一些。

LibreWolf 與 Mullvad Browser 都不要拿來連 Tor。LibreWolf 的官方 FAQ 在這一題底下寫的是「Please don't」，要匿名就用 Tor Browser[^librewolf-faq]。

### DNS 層

NextDNS、AdGuard DNS、自架的 Pi-hole 都屬於這一層。優點是整台裝置或整個網路一次生效，手機 app 裡的廣告也擋得到。界線很清楚，DNS 層依據的只有網域，處理不了同一個網域下的內容，也做不到外觀過濾。廣告與內容來自同一個網域的情況擋不下來。

### 系統層

AdGuard 桌面版與 iOS 上的 content blocker app 屬於這一層。桌面版通常需要安裝本機憑證來檢查加密流量，取捨在於，等於把一個能讀取所有 HTTPS 內容的元件裝進系統。

### 行動裝置

Android 上的 Firefox 支援完整版 uBlock Origin，在手機瀏覽器裡算少見。iOS 因為系統限制沒有這個選項，只剩 Safari 的 content blocker app 或 DNS 層方案。

## 用 Tor Browser 的人不要裝

Tor Project 的支援文件寫得很直接，強烈不建議在 Tor Browser 裡安裝新的擴充功能，包含 AdBlock Plus 與 uBlock Origin，理由是「Installing new add-ons may affect Tor Browser in unforeseen ways and potentially make your Tor Browser fingerprint unique」[^tor-addons]。

Tor Browser 的防護建立在所有使用者長得一樣，多裝一個擴充功能就是把自己從人群裡挑出來。內建的 NoScript 是唯一經過測試的那一個。

擋掉廣告請求不會讓你在指紋上變得不顯眼，擋廣告與抗指紋是兩件不同的事，工具裝得越多，指紋反而越獨特。兩者的關係見 [瀏覽器指紋是什麼，為什麼很難擺脫](../../basics/browser-fingerprinting.md)。

## Brave 的兩層防護

Brave Shields 是瀏覽器內建的攔截器，用 Rust 寫的 `adblock-rust` 引擎，直接修改在 Chromium 上。引擎讀取的是 EasyList、EasyPrivacy 那一套 Adblock Plus 語法的清單，支援外觀過濾與 scriptlet 注入[^adblock-rust]。Brave 的公告裡寫 Shields「don't rely on MV2 _or_ MV3」[^brave-mv3]，擴充功能平台怎麼改都影響不到它。

擴充功能是另外一層，Brave 從 `v1.81` 起在自家後端託管 AdGuard、uBlock Origin、uMatrix、NoScript 四個 MV2 擴充功能，使用者從 `brave://settings/extensions/v2` 頁面安裝，這幾份與 Chrome Web Store 上的版本各自獨立[^brave-mv3]。`v1.92` 新增自動遷移，專案的 issue `56654` 描述的行為是偵測已安裝的 Web Store MV2 擴充功能、備份設定、換裝 Brave 託管的對應版本[^brave-issue]。同一個里程碑把該設定頁改成預設啟用。Brave 的 stable 版在 2026 年 9 月已經到 `v1.96`，兩項變更都在正式版裡。

Brave 的公告寫的支援期限是「For as long as we're able (and assuming the cooperation of the extension authors)」，同一篇也寫，如果擴充功能過時或停止維護，Brave 可能會移除支援，理由是不想提供過時、甚至不安全的版本[^brave-mv3]。

2026 年 6 月有報導寫，Brave beta 的 MV2 設定頁變成空清單，擴充功能全部消失，同版本的 nightly 正常，stable 沒有受影響[^piunika]。Brave 在 8 月的貼文裡重申會繼續支援。

使用者原本從 Chrome Web Store 取得更新，現在從 Brave 的伺服器取得。更新來源、版本節奏、要不要繼續支援，決定權都在 Brave 手上。Brave 在 2020 年被發現在使用者輸入的加密貨幣交易所網址後面自動加上自家的推薦碼，執行長公開道歉並移除該行為。Brave Rewards、BAT 代幣與內建錢包都是選擇性啟用的功能，用自家廣告系統取代 Google 廣告系統這個商業模式本身，在隱私社群裡一直有爭論。

## Google 的安全理由與廣告生意

Google 在安全上的論點成立，擴充功能能取得並改寫每一個網路請求，一旦被入侵或本來就是惡意的，能做的事很多。2025 到 2026 年之間公開的事件包含一波從釣魚取得 OAuth 授權開始的供應鏈攻擊，波及超過 30 個擴充功能、約 260 萬名使用者，另有竊取 AI 對話內容的擴充功能影響約 90 萬人。

Chrome 在 2026 年握有全球約 65% 的瀏覽器市佔，桌面約 70%。制定擴充功能平台規則的公司，同時是全球最大的廣告公司，2025 年 4 月已經被美國聯邦法院認定在發布商廣告伺服器與廣告交易所市場違法壟斷，救濟措施到現在還沒定案。同一家公司同時決定規則與販售廣告，以安全為名的限縮就很難被單純接受。

EFF 的立場是 MV3 的改動會削弱擴充功能開發者因應追蹤技術變化的能力。Vivaldi 那篇文章把規則上限稱為 Google 設下的人為限制，那篇文章的結尾寫了一句「Perhaps, wise to move away from Chrome?」[^vivaldi]。

## 同一年收掉的另一套計畫

Privacy Sandbox 從 2019 年開始，對外的說法是要用一批新技術取代第三方 cookie，讓廣告投放與成效衡量在不追蹤個人的前提下運作。2024 年 7 月，Google 放棄淘汰第三方 cookie 的原定計畫。2025 年 4 月，跳出提示讓使用者自己選的方案也放棄了。

2025 年 10 月 17 日，Google 退役十項技術，包含 Topics、Protected Audience、Attribution Reporting、IP Protection 與 Related Website Sets，公告寫的理由是「After evaluating ecosystem feedback about their expected value and in light of their low levels of adoption」[^ps-retire]。留下來的只有 CHIPS、FedCM、Private State Tokens 三項，官方的說明是這幾項獲得了廣泛採用，包含其他瀏覽器的支援。第三方 cookie 的部分寫得很直接，Chrome 維持現行做法。

同一天，英國競爭與市場管理局解除了 Google 的 Privacy Sandbox 承諾。AdExchanger 的報導寫，該機關收到的 15 份諮詢回覆全部反對解除[^adexchanger]。

六年下來，使用者這一側的擋廣告工具被限縮到申報式的規則清單，產業那一側承諾要取代第三方 cookie 的替代方案收攤，第三方 cookie 留在原地。

## 內建攔截器的代價

Brave Shields、Vivaldi 的內建攔截器、Safari 的 content blocker，走的都是同一個方向，把攔截能力收進瀏覽器核心。內建之後，擴充功能權限過大的問題就不存在，效能通常也更好。

代價落在控制權上，擋不擋、擋到什麼程度、清單多久更新一次，全部由瀏覽器廠商決定。uBlock Origin 那種逐站的動態過濾、點對點的防火牆式控制、隨時換一份清單的自由，在核心內建的模型裡通常沒有對應物。使用者從自行挑選工具、自行調整規則，變成挑一家廠商，接受它的預設值。

差別在極端情況才顯現，例如某個追蹤手法剛出現而內建清單還沒跟上，或者你想擋的東西剛好是廠商不想擋的。可稽核性也跟著變化，開源的擴充功能誰都能讀規則、誰都能改，內建功能能不能檢查、能不能替換，各家程度不同。

## 技術上到底改了什麼

### 兩個 API 差在哪裡

MV2 的 `webRequest` 是攔截式的。瀏覽器在送出請求之前把完整的請求資訊交給擴充功能，由擴充功能的邏輯決定要不要擋。擴充功能能即時改寫規則，能取得上下文，能依照分頁當下的狀態套用不同規則。

MV3 的 `declarativeNetRequest` 是申報式的。擴充功能事先把規則交給瀏覽器，比對與攔截由瀏覽器執行，擴充功能取不到每一個請求的內容。Google 公告寫的理由是安全與效能，因為擴充功能不再需要取得每一個網路請求的內容。

規則數量有硬上限，官方文件裡的常數包含啟用中的靜態規則集最多 50 組、保證至少 30,000 條靜態規則、動態規則 30,000 條（限安全規則）、不安全的動態規則 5,000 條、正規表達式規則 1,000 條[^dnr]。Google 2024 年 5 月的公告寫，回應社群意見後把上限提高到「多達 330,000 個靜態規則，再加上動態新增 30,000 個」[^google-phaseout]。早年報導常寫的 MV3 只剩 30,000 條規則已經過時，總量確實提高了。

### uBlock Origin Lite 少掉的東西

uBlock Origin 的作者 Raymond Hill 沒有把完整版搬到 MV3，另外做了一個 uBlock Origin Lite。專案的 FAQ 裡逐條寫著 MV3 架構下做不到的能力[^ubol-faq]：

- 動態過濾做不到。`declarativeNetRequest` 無法依照網址列上的頂層網域強制套用規則
- 沒有逐站的 no remote fonts 與 no scripting 開關
- 預設模式沒有通用的外觀過濾（cosmetic filtering），要切到 Complete 模式才有
- 大量在 uBlock Origin 裡很有用的 regex 過濾器不被 API 接受
- `redirect-rule=`、regex 版本的 `removeparam=`、`replace=`、`ipaddress=`、CNAME 解除偽裝全部無法支援

清單更新的方式也跟著改變，FAQ 裡寫「uBOL never makes network requests to any remote servers」，過濾規則只在擴充功能改版時一併更新。原本一天可以更新好幾次、追著廣告商的網域變動調整的清單，現在要跟著版本走 Chrome Web Store 的審查流程。Google 在 2024 年推出過針對規則變更的加速審查，公告寫這類更新可以在數分鐘內通過[^google-phaseout]。

### 繞道的開關逐一被移除

Chromium 的 code review 平台上查得到四筆已合併的變更，移除的都是能讓 MV2 重新生效的開關：2025 年 6 月 10 日的 MV2 可用性政策（`6617410`）、2025 年 11 月 4 日的 `allow-legacy-mv2-extensions` 開發者旗標（`7113458`）、2026 年 5 月 22 日的 `kExtensionManifestV2Disabled` 功能開關（`7813942`）、2026 年 6 月 4 日的政策處理程式碼（`7890750`）[^gerrit]。第三筆的 commit message 寫的是移除該功能「and the effectively-dead code」。

## 接下來會怎麼走

Brave 的 MV2 託管能維持多久，取決於維護成本。Chromium 上游已經沒有相關程式碼，每跟一次上游版本，要自己補的東西就多一點。

Google 廣告技術反壟斷案的救濟措施還沒定案，分拆與行為面補救對廣告生態的影響差距很大。第三方 cookie 留下來之後，指紋識別與伺服器端的識別手法也還在原地。

工具的選擇會一直變，判斷的方式比較穩定。先確認自己在防誰，再看手上的工具實際擋得到什麼，以及這個能力握在誰手上。

## 延伸閱讀

- [瀏覽器指紋是什麼，為什麼很難擺脫](../../basics/browser-fingerprinting.md)：cookie 刪得掉，指紋刪不掉，以及各家瀏覽器的預設狀態
- [Brave 用兩種相反的手法抹平 GPU 指紋](./brave-gpu-fingerprinting.md)：內建防護怎麼運作，以及它處理不了什麼
- [社群平台怎麼收集你的資料](../../basics/platform-tracking.md)：廣告追蹤在整套生態裡的位置
- [威脅模型如何建立](../../basics/threat-model.md)：先確認在防誰，再選工具
- [你的瀏覽器透露了什麼](../../utils/leaks.md)：當場看一次自己的瀏覽器回報了哪些資訊

[^chrome-timeline]: [Manifest V2 support timeline](https://developer.chrome.com/docs/extensions/develop/migrate/mv2-deprecation-timeline){target="_blank"} - Chrome for Developers。本文時間線表格的所有日期、Chrome 138 與 139 的角色、2026 年 8 月 31 日的下架說明皆出自此頁。查證日 2026-09-01。
[^gerrit]: Chromium code review，四筆變更依序為 [`6617410`](https://chromium-review.googlesource.com/c/chromium/src/+/6617410){target="_blank"}、[`7113458`](https://chromium-review.googlesource.com/c/chromium/src/+/7113458){target="_blank"}、[`7813942`](https://chromium-review.googlesource.com/c/chromium/src/+/7813942){target="_blank"}、[`7890750`](https://chromium-review.googlesource.com/c/chromium/src/+/7890750){target="_blank"}。合併日期與 commit message 取自 Gerrit API。查證日 2026-09-01。
[^dnr]: [chrome.declarativeNetRequest](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest){target="_blank"} - Chrome for Developers。規則數量上限的常數定義出自此頁。查證日 2026-09-01。
[^google-phaseout]: [Manifest V2 phase-out begins](https://blog.google/chromium/manifest-v2-phase-out-begins/){target="_blank"} - Chromium 官方部落格，2024 年 5 月。330,000 靜態規則、30,000 動態規則與加速審查的說明出自此文。查證日 2026-09-01。
[^ubol-faq]: [uBlock Origin Lite FAQ](https://github.com/uBlockOrigin/uBOL-home/wiki/Frequently-asked-questions-(FAQ)){target="_blank"} - uBlock Origin Lite 專案 wiki。MV3 底下無法支援的能力清單與清單更新方式出自此頁。uBlock Origin 的官方入口是 [gorhill/uBlock](https://github.com/gorhill/uBlock){target="_blank"}。查證日 2026-09-01。
[^edge]: [Moving the Microsoft Edge extensions ecosystem forward with Manifest Version 3](https://blogs.windows.com/msedgedev/2026/08/07/moving-the-microsoft-edge-extensions-ecosystem-forward-with-manifest-version-3/){target="_blank"} - Microsoft Edge 部落格，2026 年 8 月 7 日。消費者版與企業版的時程出自此文。查證日 2026-09-01。
[^mozilla]: [Mozilla's approach to Manifest V3](https://blog.mozilla.org/en/firefox/firefox-manifest-v3-adblockers/){target="_blank"} - The Mozilla Blog，2025 年 2 月 25 日。Firefox 同時保留兩個 API 的說明出自此文。查證日 2026-09-01。
[^vivaldi]: [Manifest V3, webRequest, and ad blockers](https://vivaldi.com/blog/manifest-v3-webrequest-and-ad-blockers/){target="_blank"} - Vivaldi 部落格，2022 年 9 月 23 日，2024 年 6 月更新。內建攔截器的實作方式與對規則上限的批評出自此文。查證日 2026-09-01。
[^adblock-rust]: [Brave Improves Its Ad-Blocker Performance by 69x with New Engine Implementation in Rust](https://brave.com/blog/improved-ad-blocker-performance/){target="_blank"} 與 [brave/adblock-rust](https://github.com/brave/adblock-rust){target="_blank"}。引擎的實作與支援的過濾語法出自這兩處。查證日 2026-09-01。
[^brave-mv3]: [What Manifest V3 means for Brave Shields and the use of extensions in the Brave browser](https://brave.com/blog/brave-shields-manifest-v3/){target="_blank"} - Brave 官方部落格。Shields 與擴充功能平台無關的說明、四個託管的擴充功能、`v1.81` 的時點與支援期限的措辭皆出自此文。查證日 2026-09-01。
[^brave-issue]: [Auto-replace known Web Store MV2 extensions with Brave-hosted equivalents](https://github.com/brave/brave-browser/issues/56654){target="_blank"} - brave-browser issue `56654`，里程碑 `1.92.x`。自動遷移的行為描述出自此 issue，設定頁預設啟用另見 issue [`56799`](https://github.com/brave/brave-browser/issues/56799){target="_blank"}。查證日 2026-09-01。
[^piunika]: [Latest Brave Beta hints at Manifest V2 support drop](https://piunikaweb.com/2026/06/26/latest-brave-beta-manifest-support-drop/){target="_blank"} - PiunikaWeb，2026 年 6 月 26 日。beta 版設定頁變空的描述出自此篇報導，Brave 官方未就該次變動發表說明。查證日 2026-09-01。
[^ps-retire]: [Update on plans for Privacy Sandbox technologies](https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies){target="_blank"} - Privacy Sandbox 官方公告，2025 年 10 月 17 日。退役的十項技術、保留的三項與第三方 cookie 的處置出自此文。查證日 2026-09-01。
[^adexchanger]: [Google Pulls The Plug On Topics, PAAPI And Other Major Privacy Sandbox APIs (As The CMA Says 'Cheerio')](https://www.adexchanger.com/privacy/google-pulls-the-plug-on-topics-paapi-and-other-major-privacy-sandbox-apis-as-the-cma-says-cheerio/){target="_blank"} - AdExchanger，2025 年 10 月。英國 CMA 解除承諾與 15 份反對回覆的數字出自此篇報導。查證日 2026-09-01。
[^tor-addons]: [Should I install a new add-on or extension in Tor Browser, like AdBlock Plus or uBlock Origin?](https://support.torproject.org/tbb/tbb-14/){target="_blank"} - Tor Project 支援文件。不建議安裝擴充功能的理由出自此頁。查證日 2026-09-01。
[^librewolf-features]: [LibreWolf Features](https://librewolf.net/docs/features/){target="_blank"} - LibreWolf 官方文件。內建 uBlock Origin 與過濾清單、Tracking Protection strict 模式、Total Cookie Protection、停用遙測、啟用 RFP 的說明皆出自此頁。查證日 2026-09-02。
[^librewolf-faq]: [LibreWolf FAQ](https://librewolf.net/docs/faq/){target="_blank"} - LibreWolf 官方文件。更新節奏與無自動更新、無 Android 版與 IronFox 的建議、不建議搭配 Tor 使用的說明皆出自此頁。查證日 2026-09-02。
