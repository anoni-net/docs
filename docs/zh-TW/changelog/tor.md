---
title: Tor 更新日誌
description: Tor Browser、Tor daemon、Onion 服務與 Tor Project 周邊工具版本與重大發布的中文重點整理，從上游 release notes 翻譯而成，方便台灣讀者掌握關鍵變更與安全修補。
icon: simple/torbrowser
---

# :simple-torbrowser: Tor 更新日誌

[Tor Browser](../tools/what-is-tor.md)、Tor daemon、Onion 服務的版本發布整理，從上游 release notes 條列摘譯。新版本永遠在最上面。本頁同時收錄穩定版與 Alpha 測試通道，Alpha 條目會在標題標注。

## 兩個發布通道

- <span class="chan-tag chan-tag--stable">穩定版</span>一般使用者用這個，版本號形如 15.0.20。
- <span class="chan-tag chan-tag--alpha">Alpha</span>僅供測試，可能含影響可用性、安全與隱私的錯誤，版本號帶 a（例如 16.0a10）。需要強匿名保護的人不要用。

Alpha 從 16.0a6（2026 年 5 月）起改以 Firefox beta 為基底，逐版小步 rebase。追的那條 beta 線在 7 月成為新的 Firefox ESR 153，所以 16.0a9 之後的版號標示又回到 esr，那是同一條線的延續，不是換回舊基底。穩定版幾乎每次發布都帶 Firefox 或 tor daemon 的安全修補，看到新版就更新即可。Firefox 從 2026 年 9 月起改為兩週發布一次，Tor Browser 跟著改，穩定版的更新會比過去更密。

## Tor Browser 16.0a11（Alpha 測試通道）

> 2026-09-02 · [上游公告](https://blog.torproject.org/new-alpha-release-tor-browser-160a11/){target="_blank"}

- <span class="chan-tag chan-tag--alpha">Alpha</span>Alpha 通道僅供測試，一般使用者請繼續用穩定版（15.x）。
- Firefox 基底 rebase 至 153.2.0esr（tor-browser#45254），Android 版 GeckoView 同步，並從 Firefox 155 backport 安全修補（tor-browser#45259）。
- Android 版一律啟用本機網路存取（Local Network Access，LNA）限制，作為深度防禦（tor-browser#44155）。開啟後網頁不能直接連向區域網路或本機位址，少掉一條探測同一個網路內其他裝置的路。
- TorConnect 的重導改由父行程處理（tor-browser#45264），與穩定版 15.0.21 是同一項修正。
- 建置流程改從 gcc.gnu.org 取得 GCC 原始碼（tor-browser-build#41860），建置工具鏈的 Go 升至 1.26.8。

## Tor Browser 15.0.21

> 2026-09-01 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15021/){target="_blank"}

- <span class="chan-tag chan-tag--stable">穩定版</span>以 Firefox 安全修補為主的小版本。
- Firefox 基底 rebase 至 140.15.0esr（tor-browser#45253），Android 版 GeckoView 同步，並從 Firefox 155 backport 安全修補（tor-browser#45259）。
- 修好在非隱私瀏覽模式啟動瀏覽器時 `about:torconnect` 不顯示的問題（tor-browser#45223）。TorConnect 的重導改由父行程處理（tor-browser#45264）。
- NoScript 升至 13.6.32.1984，OpenSSL 升至 3.5.8，建置工具鏈的 Go 升至 1.25.14。
- 上游把 32 位元 Linux 的提示改成版本過期訊息，追蹤項目寫明這是 15.0 系列的最後一版（tor-browser#44996）。16.0 穩定版依 16.0a9 公告的規劃在 9 月接手，還在 15.x 的人可以準備換過去。

## Tor Browser 16.0a10（Alpha 測試通道）

> 2026-08-27 · [上游公告](https://blog.torproject.org/new-alpha-release-tor-browser-160a10/){target="_blank"}

- <span class="chan-tag chan-tag--alpha">Alpha</span>Alpha 通道僅供測試，一般使用者請繼續用穩定版（15.x）。
- 新增「使用通用視窗標題」選項，在設定的隱私與安全性、進階設定、防範第三方應用程式那一組，開啟後所有視窗標題一律顯示 Tor Browser Alpha。視窗標題預設跟著網頁的 title 變動，作業系統與其他程式不需特殊權限就讀得到，可以當成側錄瀏覽紀錄的旁通道。此功能已上游進 Firefox，一般 Firefox 使用者可在 `about:config` 把 `privacy.exposeContentTitleInWindow` 與 `privacy.exposeContentTitleInWindow.pbm` 設為 false。官方原本希望 16.0 穩定版就預設開啟，顧慮無障礙軟體與非標準桌面環境的相容性，改為先開放測試。
- 桌面版內建手冊改版，把更新過的官方說明內容包進瀏覽器取代舊版手冊，網址列輸入 `about:manual` 可直接開啟，介面上的「Learn more」也都指向新版。
- 設定頁改用 Mozilla 的新版 `about:preferences` 設計並預設啟用，連線、letterboxing、安全性等級等自訂項目都已搬到新版面。
- Firefox 基底 rebase 至 153.1.0esr（tor-browser#45205），並從 Firefox 154 backport 安全修補（tor-browser#45219）。
- 停用以語系為基礎的字型規則，作為瀏覽器指紋的深度防禦（tor-browser#44257）。
- NoScript 升至 13.6.31.90301984，OpenSSL 升至 3.5.8。
- tor daemon 崩潰時，`about:torconnect` 會顯示錯誤訊息（tor-browser#43570）。橋接連線失敗時也會更新橋接設定的顯示（tor-browser#43939）。

## Tor Browser 15.0.20

> 2026-08-18 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15020/){target="_blank"}

- <span class="chan-tag chan-tag--stable">穩定版</span>以 Firefox 安全修補為主的小版本。
- Firefox 基底 rebase 至 140.14.0esr（tor-browser#45204），桌面版與 Android 版 GeckoView 同步升至 140.14.0esr。
- 從 Firefox 154 backport 安全修補（tor-browser#45219）。
- libevent 升至 2.1.13（tor-browser-build#41839）。
- 建置工具鏈的 Go 升至 1.25.13（Windows、Linux、Android）。
- 更新建置流程的 torbrowser.gpg keyring，加入新子金鑰並調整主金鑰到期日（tor-browser-build#41850）。

## Tor Browser 16.0a9（Alpha 測試通道）

> 2026-07-23 · [上游公告](https://blog.torproject.org/new-alpha-release-tor-browser-160a9/){target="_blank"}

- <span class="chan-tag chan-tag--alpha">Alpha</span>Alpha 通道僅供測試，一般使用者請繼續用穩定版（15.x）。
- Firefox 基底來到 153.0esr，Android 版 GeckoView 同步（tor-browser#45101）。上游公告寫的「前一版為 140.0esr」是拿穩定版線來比，前一個 Alpha 是 152.0a1，這一輪是追了半年的 beta 線正式成為新 ESR。
- 官方說明這套持續追 beta 的做法會延續到 17.0 Alpha，取代過去一次跳過整年版本的舊模式，目標讓 16.0 穩定版於 9 月提前發布。
- NoScript 升至 13.6.30.90201984，建置工具鏈的 Go 升至 1.26.5，libevent 升至 2.1.13。
- 追蹤用途的相依套件僅剩 Mozilla Telemetry（預設停用）。
- 已知問題：部分畫面仍殘留 Firefox 品牌圖示。Android 版網址列圖示目前一律顯示「不安全」，需手動點擊查驗證書。

## Tor Browser 15.0.19

> 2026-07-21 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15019/){target="_blank"}

- <span class="chan-tag chan-tag--stable">穩定版</span>以 Firefox 安全修補為主的小版本，帶入來自 Firefox 的重要安全更新。
- Firefox 基底 rebase 至 140.13.0esr（tor-browser#45117），桌面版與 Android 版 GeckoView 同步升至 140.13.0esr。
- 從 Firefox 153 backport 安全修補（tor-browser#45124）。
- NoScript 升至 13.6.31.1984。
- 還原先前 Funding the Commons 相關的實作變更（tor-browser#44748）。

## Tor Browser 15.0.18

> 2026-07-14 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15018/){target="_blank"}

- <span class="chan-tag chan-tag--stable">穩定版</span>以 Firefox 安全修補為主的小版本。
- Firefox 基底維持 140.12.0esr，改以 cherry-pick 帶入 firefox/esr140 分支的後續修補（tor-browser#45111），未做 rebase。
- NoScript 升至 13.6.30.1984。
- 建置工具鏈的 Go 升至 1.25.12（Windows、Linux、Android）。
- 建置流程更新 boklm 的 GPG 子金鑰（tor-browser-build#41821）。

## Tor Browser 16.0a8（Alpha 測試通道）

> 2026-07-02 · [上游公告](https://blog.torproject.org/new-alpha-release-tor-browser-160a8/){target="_blank"}

- <span class="chan-tag chan-tag--alpha">Alpha</span>Alpha 通道僅供測試，可能含影響可用性、安全與隱私的錯誤，一般使用者請繼續用穩定版（15.x）。
- 重要的 Firefox 安全更新，rebase 至 Firefox 152.0a1（前一個 Alpha 16.0a7 為 151.0a1）。
- Android 版 GeckoView 同步升至 152.0a1。
- tor 用戶端升至 0.4.9.11。
- NoScript 升至 13.6.25.90301984。
- OpenSSL 升至 3.5.7。
- 建置工具鏈的 Go 升至 1.26.4。
- 修補跨站 oracle 漏洞，Safer Mode 下拒絕 worklet。
- 16.0 系列停用 XSLT。
- 桌面版停用 IP Protection，並修正 letterboxing 背景顯示與 Firefox 152 rebase 後的多項 regression。
- Android 版在 Tor connection assist 加入常用地區、移除預設瀏覽器功能，omni.ja 改用 xz 壓縮。

## Tor Browser 15.0.17

> 2026-06-28 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15017/){target="_blank"}

- <span class="chan-tag chan-tag--stable">穩定版</span>以 tor 安全更新為主的小版本，未變動 Firefox 基底。
- tor 用戶端升至 0.4.9.11。
- NoScript 升至 13.6.25.1984。
- 建置流程更新 boklm 的 GPG 子金鑰與 morgan 的續期金鑰（tor-browser-build#41821、#41827）。

## Tor Browser 15.0.16

> 2026-06-17 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15016/){target="_blank"}

- <span class="chan-tag chan-tag--stable">穩定版</span>重要的 Firefox 安全更新。
- rebase 至 Firefox 140.12.0esr（tor-browser#45046），並 backport 自 Firefox 152 的安全修補（tor-browser#45054）。
- Android 版 GeckoView 同步升至 140.12.0esr。
- NoScript 升至 13.6.24.1984，修正前一版 13.6.19.902 在 DocStartInjection 上的 regression（tor-browser#45044）。
- OpenSSL 升至 3.5.7。
- 簽章流程移除對 tor daemon 的依賴（tor-browser-build#41802）。
- 建置工具鏈的 Go 升至 1.25.11。

## Tor Browser 15.0.15

> 2026-06-03 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15015/){target="_blank"}

- <span class="chan-tag chan-tag--stable">穩定版</span>tor daemon 重要安全更新，並修正部分審查規避問題。
- tor 用戶端升至 0.4.9.9。
- NoScript 升至 13.6.20.1984。
- Moat 模組支援設定多組 (front, reflector) domain fronting 配對（tor-browser#42436）。
- 修正桌面版（Windows、macOS、Linux）Captcha 無法運作的問題（tor-browser#44997）。
- 通知 Linux i686 使用者不再提供更新（tor-browser#44886，backport #44361）。

## Tor Browser 16.0a7（Alpha 測試通道）

> 2026-06-03 · [dist 目錄](https://dist.torproject.org/torbrowser/16.0a7/){target="_blank"}

- <span class="chan-tag chan-tag--alpha">Alpha</span>Alpha 通道僅供測試，可能含影響可用性、安全與隱私的錯誤，一般使用者請繼續用穩定版（15.x）。
- 已在 dist 釋出二進位檔，官方部落格尚未發布對應公告。
- 改以 Firefox 151.0a1 為基底（前一個 Alpha 16.0a6 為 150.0a1）。

## Tor Browser 15.0.14

> 2026-05-19 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15014/){target="_blank"}

- <span class="chan-tag chan-tag--stable">穩定版</span>重要 Firefox 安全更新，backport 自 Firefox 151 的修補（tor-browser#44958）。
- rebase 至 Firefox 140.11.0esr。
- Android 版 GeckoView 同步升至 140.11.0esr。
- 建置工具鏈的 Go 升至 1.25.10。

## Tor Browser 15.0.13

> 2026-05-08 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15013/){target="_blank"}

- <span class="chan-tag chan-tag--stable">穩定版</span>tor 用戶端升至 0.4.9.8。
- NoScript 升至 13.6.19.1984。

## Tor Browser 16.0a6（Alpha 測試通道）

> 2026-05-07 · [上游公告](https://blog.torproject.org/new-alpha-release-tor-browser-160a6/){target="_blank"}

- <span class="chan-tag chan-tag--alpha">Alpha</span>Alpha 通道僅供測試，可能含影響可用性、安全與隱私的錯誤，一般使用者請繼續用穩定版（15.x）。
- 自此版起，Tor Browser Alpha 改以 Firefox beta 通道（150.0a1）為基底，過去是以 Firefox ESR 為基底。
- tor 用戶端升至 0.4.9.7。
- NoScript 升至 13.6.18.90101984。
- OpenSSL 升至 3.5.6。
- 預設橋接設定中的 Snowflake STUN 伺服器清單更新至 2026 版。
- Linux i686 使用者會收到「不再提供更新」的通知。
- Android 版 GeckoView 同步升至 150.0a1。

## Tor Browser 15.0.12

> 2026-05-07 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15012/){target="_blank"}

- <span class="chan-tag chan-tag--stable">穩定版</span>重要 Firefox 安全更新（rebase 至 Firefox 140.10.2esr）。
- tor 用戶端升至 0.4.9.7。
- Android 版 GeckoView 同步升至 140.10.2esr。
- 桌面與 Android 版加入 Funding the Commons 整合（tor-browser#44746、#44747）。

## Tor Browser 15.0.11

> 2026-04-28 · [上游公告](https://blog.torproject.org/new-release-tor-browser-15011/){target="_blank"}

- <span class="chan-tag chan-tag--stable">穩定版</span>重要 Firefox 安全更新（rebase 至 Firefox 140.10.1esr）。
- NoScript 升至 13.6.18.1984。
- Android 版 GeckoView 同步升至 140.10.1esr。
