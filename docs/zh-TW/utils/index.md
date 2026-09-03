---
title: 小工具
subtitle: 離線可用的工具與 3D 互動
description: 在瀏覽器裡直接執行的小工具，全部不送出任何資料，存進裝置之後沒有網路也能用。
icon: material/tools
---

# :material-tools: 小工具

站上的文章說明怎麼保護自己，小工具區放的是可以直接按的東西。共同的規則有四條：

- 全部在你的瀏覽器裡運算，不送出任何資料
- 存進裝置之後沒有網路也能用，斷網可用本身就是「沒有偷送東西」的證明
- 原始碼在 [anoni-net/docs](https://github.com/anoni-net/docs/tree/main/docs/zh-TW/js){target="_blank"}，看得懂的人可以自己驗
- 都需要瀏覽器開著 JavaScript，因為運算是在你的裝置上做的

## 用 Tor Browser 的話有一個衝突要知道

[Tor Browser 的安全等級](../tools/tor-browser-advanced.md)調到 Safest 會把 JavaScript 全部關掉，小工具區的工具就整頁不動。

衝突在於，安全等級頁的指引寫的是在「來路不明的釣魚連結、不熟悉的網域」時把等級調高，而收到可疑連結正是最需要用[隱形字元偵測](invisible.md)或 [QR code 讀取器](qr-read.md)查一下的時候。

處理方式是把兩件事分開。可疑的網站用高安全等級去開，把要查的文字或圖片複製出來之後切回 Standard，查完再調回去。小工具區的工具不連外，在 Standard 等級下打開它們不會增加你在該可疑網站上的暴露。

## 目前有的

<div class="grid cards" markdown>

-   :material-clipboard-check-outline: **[威脅模型清單](threat-model.md)**

    把「要保護什麼、要防誰、願意付出多少」三題答成一份可複製的清單，並標出答案裡的錯配。答案不存起來，重新整理就沒了。

-   :material-dice-multiple-outline: **[密語與密碼產生器](passphrase.md)**

    用 asian-diceware 的 7776 字詞表抽密語，或從你選的字元集抽隨機密碼。亂數來自瀏覽器的 `crypto.getRandomValues`，並且會顯示產生出來的密碼熵有多少。

-   :material-lock-outline: **[本機檔案加密](age.md)**

    選一個檔案或貼一段文字、輸入密語，在瀏覽器裡加密成 age 格式，或把 age 檔解回來。密文可以輸出成文字，跟密語一起存進你的密碼管理器就能跨裝置。加密完先用同一組密語解回來比對才給下載。輸出是公開格式，任何裝了 age 命令列工具的電腦都能解開，不需要這個網站。

-   :material-fingerprint: **[passkey 鑰匙](passkey.md)**

    建立一把這個網站的 passkey，存進你的密碼管理器或鑰匙圈，試一次解鎖，再產生備援金鑰。之後本機檔案加密可以用它當鑰匙，不用記密語。沒有帳號、沒有伺服器，站上什麼都不存。

-   :material-qrcode: **[QR code 產生器](qrcode.md)**

    把 onion 網址、Tor bridge 等很長又容易打錯的字串變成 QR code，讓眼前的人用相機讀走，中間不經過任何伺服器。可以下載成 SVG 印出來。

-   :material-qrcode-scan: **[QR code 讀取器](qr-read.md)**

    讀出圖片裡 QR code 的內容，圖片不離開裝置。解出來是網址時把主機獨立標出來，並且不提供開啟按鈕。

-   :material-animation-play-outline: **[QR code 影格串流](qr-stream.md)**

    手機裡的東西要送進旁邊那台筆電，而現場的 Wi-Fi 不是你的。把檔案切成一連串 QR code 輪流播放，另一台用相機讀回來拼成原檔。兩台裝置之間沒有配對、沒有共用網路、沒有伺服器。

-   :material-image-off-outline: **[檔案 metadata 清除器](strip-metadata.md)**

    拿掉照片、影片、錄音、Office 文件與 PDF 裡的 EXIF、GPS、裝置型號、製作軟體、作者與註解欄位，全程在本機處理。照片、影片與錄音的壓縮資料一個位元都沒動，每一段的去留都列給你看。

-   :material-selection-remove: **[截圖遮蔽](redact.md)**

    在截圖或照片上拉方框，把不該外流的名字、頭像與對話填成實心黑色，全程在本機處理。輸出重新編碼，原檔的 metadata 與檔名都不會帶過去，交給你之前會逐像素確認每一處都是純黑。

-   :material-link-variant-off: **[網址清理器](clean-url.md)**

    把網址裡的追蹤參數挑出來並移除，每一個都說明是誰在追。拆掉 Google 與 Facebook 的轉址包裝，並把真正的註冊網域單獨標出來，品牌放在子網域、旁邊加字、用長得像的字母冒充都會說明。

-   :material-format-letter-matches: **[隱形字元偵測](invisible.md)**

    找出文字裡看不見的零寬字元、方向控制、標籤字元與同形字，標出位置並說明每一類是什麼。文件外流追蹤、釣魚網址，還有藏給 AI 讀的指令，都會利用看不見的字元。

-   :material-eye-outline: **[你的瀏覽器透露了什麼](leaks.md)**

    列出任何網站不必問你就拿得到的資訊，並標出 Tor Browser 會把哪些統一掉。換個瀏覽器再看一次，就知道 Tor Browser 實際上防住了什麼。

</div>

## 要離線帶著走

工具的程式與資料會跟頁面一起存下來。在[離線閱讀](../offline.md)的清單裡勾起小工具區的頁面，之後沒有網路也打得開。

## 用了誰的程式

小工具區大部分的程式是自己寫的，放在 [anoni-net/docs](https://github.com/anoni-net/docs/tree/main/docs/zh-TW/js){target="_blank"} 底下。有幾樣東西來自別人，原封不動放進來，不做任何修改：

| 元件 | 用在 | 授權 | 授權文字在哪 |
|---|---|---|---|
| [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator){target="_blank"} 1.4.4 | [QR code 產生器](qrcode.md)、[影格串流](qr-stream.md) | MIT | [檔案開頭的標頭](vendor/qrcode-generator.js) |
| [jsQR](https://github.com/cozmo/jsQR){target="_blank"} 1.4.0 | [QR code 讀取器](qr-read.md)、[影格串流](qr-stream.md) | Apache-2.0 | [jsQR-LICENSE.txt](vendor/jsQR-LICENSE.txt) |
| [pdf-lib](https://github.com/Hopding/pdf-lib){target="_blank"} 1.17.1 | [檔案 metadata 清除器](strip-metadata.md)的 PDF 部分 | MIT | [pdf-lib-LICENSE.txt](vendor/pdf-lib-LICENSE.txt) |
| [asian-diceware](https://github.com/anoni-net/asian-diceware){target="_blank"} 的 7776 字詞表 | [密語與密碼產生器](passphrase.md) | 詞表資料 CC-BY-4.0，程式 MIT | [上游的 repo](https://github.com/anoni-net/asian-diceware){target="_blank"} |
| [typage](https://github.com/FiloSottile/typage){target="_blank"}（npm 的 age-encryption）0.3.1 | [本機檔案加密](age.md) | BSD-3-Clause | [LICENSE](vendor/age/age-encryption/LICENSE) |
| typage 相依的 [noble-ciphers](https://github.com/paulmillr/noble-ciphers){target="_blank"} 2.1.1、[noble-curves](https://github.com/paulmillr/noble-curves){target="_blank"} 2.0.1、[noble-hashes](https://github.com/paulmillr/noble-hashes){target="_blank"} 2.0.1、[noble-post-quantum](https://github.com/paulmillr/noble-post-quantum){target="_blank"} 0.5.3、[scure-base](https://github.com/paulmillr/scure-base){target="_blank"} 2.0.0 | [本機檔案加密](age.md) | MIT | [noble-ciphers](vendor/age/noble-ciphers/LICENSE)、[noble-curves](vendor/age/noble-curves/LICENSE)、[noble-hashes](vendor/age/noble-hashes/LICENSE)、[noble-post-quantum](vendor/age/noble-post-quantum/LICENSE)、[scure-base](vendor/age/scure-base/LICENSE) |

`pdf-lib.min.js` 裡面還打包了微軟的 tslib（Apache-2.0），它的版權標頭跟著留在檔案裡，沒有被壓縮工具剝掉。

不做修改是刻意的。改過就失去可對照上游版本的可審性，讀者要驗的時候只能相信我們的說法。檔案都在 `utils/vendor/` 底下，可以自己跟上游的版本比對。typage 與它的相依是 ES module，沒有單一檔案的發行版，所以連同 `package.json` 與授權原封不動放進 `vendor/age/`，頁面用 import map 接起來，每一個檔案都能跟 npm 上同版本的 tarball 逐位元組比對，雜湊記在 `vendor/README.md`。

為什麼不自己寫，各頁最後一節都有說明。共通的理由是外部函式庫寫錯不會當掉，只會產生看起來正常但實際上錯的結果，比壞掉更難發現，QR code 產生器那一頁就記了一次實際遇到的例子。

## 沒有收進來的東西

需要連到外部服務才能運作的功能不會收進小工具區，因為連線本身就違反「離線可用」與「不送出資料」兩條規則。網路測量請用 [OONI Probe](../tools/what-is-ooni.md)，它是設計來做網路測量的工具，資料的處理方式也公開。
