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

### 要防什麼

<div class="grid cards" markdown>

-   :material-clipboard-check-outline: **[威脅模型清單](threat-model.md)**

    把「要保護什麼、要防誰、願意付出多少」三題答成一份可複製的清單，並標出答案裡的錯配。答案預設不存，要留的話用 passkey 加密存在你的裝置上。

-   :material-checkbox-marked-outline: **[我的準備清單](checklist.md)**

    把站上的行動建議收成一份可勾的清單，勾了用 passkey 加密存在你的裝置上，下次按一次指紋就看得到進度。沒有帳號、沒有伺服器，站上什麼都不存。

</div>

### 密碼與加密

<div class="grid cards" markdown>

-   :material-dice-multiple-outline: **[密語與密碼產生器](passphrase.md)**

    用 asian-diceware 的 7776 字詞表抽密語，或從你選的字元集抽隨機密碼。亂數來自瀏覽器的 `crypto.getRandomValues`，並且會顯示產生出來的密碼熵有多少。

-   :material-lock-outline: **[本機檔案加密](age.md)**

    選一個檔案或貼一段文字，用密語、passkey 或收件人的 age 公鑰在瀏覽器裡加密成 age 格式，或把 age 檔解回來。密文可以輸出成文字，跟密語一起存進你的密碼管理器就能跨裝置。加密完先用同一組密語解回來比對才給下載。輸出是公開格式，任何裝了 age 命令列工具的電腦都能解開，不需要這個網站。

-   :material-fingerprint: **[passkey 鑰匙](passkey.md)**

    建立一把這個網站的 passkey，存進你的密碼管理器或鑰匙圈。只用清單的話按一次「建立 passkey」就夠，要用檔案加密才需要再試一次解鎖、產生備援金鑰。之後本機檔案加密可以用它當鑰匙，不用記密語，準備清單、威脅模型的存檔與收件人簿也用它加密存在你的裝置上。沒有帳號、沒有伺服器，站上什麼都不存。

</div>

### 當面傳東西

<div class="grid cards" markdown>

-   :material-qrcode: **[QR code 產生器](qrcode.md)**

    把 onion 網址、Tor bridge 等很長又容易打錯的字串變成 QR code，讓眼前的人用相機讀走，中間不經過任何伺服器。可以下載成 SVG 印出來。

-   :material-qrcode-scan: **[QR code 讀取器](qr-read.md)**

    讀出圖片裡 QR code 的內容，圖片不離開裝置。解出來是網址時把主機獨立標出來，並且不提供開啟按鈕。

-   :material-animation-play-outline: **[QR code 影格串流](qr-stream.md)**

    手機裡的東西要送進旁邊那台筆電，而現場的 Wi-Fi 不是你的。把檔案切成一連串 QR code 輪流播放，另一台用相機讀回來拼成原檔。兩台裝置之間沒有配對、沒有共用網路、沒有伺服器。

-   :material-file-compare: **[檔案雜湊比對](hash.md)**

    算出檔案的 SHA-256，跟對方給的那一串比對。隨身碟帶過去、託人帶過去、下載回來的安裝檔，都靠這一步確認取得的跟原本那份一樣。幾 GB 的檔案也算得動，過程中顯示進度。

</div>

### 送出去之前

<div class="grid cards" markdown>

-   :material-file-document-multiple-outline: **[PDF 頁面整理](pdf-pages.md)**

    合併好幾份 PDF、抽出或刪掉某幾頁、換順序、轉方向。輸出是新建的檔案，來源的標題、作者、製作軟體與建立時間都不會跟過來，交給你之前會重新讀一次確認頁數與方向都對。


-   :material-image-off-outline: **[檔案 metadata 清除器](strip-metadata.md)**

    拿掉照片、影片、錄音、Office 文件與 PDF 裡的 EXIF、GPS、裝置型號、製作軟體、作者與註解欄位，全程在本機處理。照片、影片與錄音的壓縮資料一個位元都沒動，每一段的去留都列給你看。

-   :material-selection-remove: **[截圖遮蔽](redact.md)**

    在截圖或照片上拉方框，把不該外流的名字、頭像與對話填成實心黑色，全程在本機處理。輸出重新編碼，原檔的 metadata 與檔名都不會帶過去，交給你之前會逐像素確認每一處都是純黑。

</div>

### 收到之後

<div class="grid cards" markdown>

-   :material-link-variant-off: **[網址清理器](clean-url.md)**

    把網址裡的追蹤參數挑出來並移除，每一個都說明是誰在追。拆掉 Google 與 Facebook 的轉址包裝，並把真正的註冊網域單獨標出來，品牌放在子網域、旁邊加字、用長得像的字母冒充都會說明。

-   :material-format-letter-matches: **[隱形字元偵測](invisible.md)**

    找出文字裡看不見的零寬字元、方向控制、標籤字元與同形字，標出位置並說明每一類是什麼。文件外流追蹤、釣魚網址，還有藏給 AI 讀的指令，都會利用看不見的字元。

-   :material-eye-outline: **[你的瀏覽器透露了什麼](leaks.md)**

    列出任何網站不必問你就拿得到的資訊，並標出 Tor Browser 會把哪些統一掉。換個瀏覽器再看一次，就知道 Tor Browser 實際上防住了什麼。

</div>

## 工具怎麼接起來

上面每一個工具負責一個動作，而你手上的一件事通常要走過兩三個。下面這幾條是常走的順序。

| 你手上的事 | 走的順序 |
|---|---|
| 第一次坐下來，要先釐清該做什麼 | [威脅模型清單](threat-model.md)答三題並看錯配，[我的準備清單](checklist.md)勾出接下來要做的，[passkey 鑰匙](passkey.md)把進度加密存在你的裝置上 |
| 想知道網站不必問就拿得到你什麼 | [你的瀏覽器透露了什麼](leaks.md)看一次，換一個瀏覽器再看一次做對照，[網址清理器](clean-url.md)查連結尾巴帶著誰的識別碼 |
| 照片或截圖要交給別人 | 畫面上有要遮的東西，用[截圖遮蔽](redact.md)，輸出已經不帶原檔的 metadata。畫面乾淨、只要去掉拍攝資訊的，用[檔案 metadata 清除器](strip-metadata.md) |
| 要交一份 PDF 出去 | [PDF 頁面整理](pdf-pages.md)排好頁面，再用同一頁的「看裡面有什麼」搜尋不該留下的字 |
| 收到來路不明的連結或 QR code | [QR code 讀取器](qr-read.md)解出內容，[網址清理器](clean-url.md)看註冊網域，[隱形字元偵測](invisible.md)查文字裡的同形字 |
| 收到別人給的檔案，要確認也要看清楚 | [檔案雜湊比對](hash.md)確認跟對方手上那份一樣，[檔案 metadata 清除器](strip-metadata.md)或 [PDF 頁面整理](pdf-pages.md)的「看裡面有什麼」列出裡面帶著什麼，[隱形字元偵測](invisible.md)查夾帶的字元 |
| 東西要給眼前的人或旁邊那台裝置 | 很長的字串用 [QR code 產生器](qrcode.md)，讓對方用相機讀走。幾 KB 的檔案用 [QR code 影格串流](qr-stream.md)，收齊時它自己比對 SHA-256 |
| 檔案要託人帶走或放進隨身碟 | [密語與密碼產生器](passphrase.md)抽一組密語，[本機檔案加密](age.md)封起來，[檔案雜湊比對](hash.md)讓收的人核對 |
| 臨時要一組之後找得回來的密碼 | [密語與密碼產生器](passphrase.md)抽，[passkey 鑰匙](passkey.md)當鑰匙，[我的準備清單](checklist.md)記下已經做到哪裡 |

走完一整條路徑長什麼樣，用九件具體的事各寫一篇。日常情境那組不需要你先有特殊身分或特別的處境，工作情境那組對著站上服務的幾種工作寫。

### 日常情境

<div class="grid cards" markdown>

-   :material-target-account: **[廣告好像知道你在想什麼](case-profile.md)**

    剛在別的地方看過的東西，轉頭就出現在動態牆的廣告裡。任何網站不必問就拿得到你哪些資訊、那些值加起來為什麼足以認出你，以及連結尾巴帶著誰的識別碼。

-   :material-file-send-outline: **[寄一份履歷出去](case-resume.md)**

    期限剩一個晚上，履歷是舊版改的，作品集分成三個檔，其中一頁是前公司還沒公開的畫面。轉出來的 PDF 為什麼帶著你電腦的帳號名稱，黑色方塊蓋住的字為什麼還在檔案裡。

-   :material-tag-outline: **[在二手平台賣東西](case-secondhand.md)**

    搬家前拍了十四張照片要上架，背景有門牌、對面大樓的招牌與桌上的帳單。截圖遮蔽與 metadata 清除器什麼時候該用哪一個，以及買家要你出示證件時該怎麼回。

-   :material-message-alert-outline: **[群組轉來的連結](case-link.md)**

    社區群組轉來一則限時登記的訊息，附一個看起來像官網的網址與一張 QR code 圖。註冊網域為什麼是唯一該看的部分，看不見的字元能查到什麼、查不到什麼。

</div>

### 工作情境

<div class="grid cards" markdown>

-   :material-account-plus-outline: **[帶新同事做一次裝置盤點](case-onboarding.md)**

    新人下週報到，權限開好了，而沒有人跟他談過裝置該怎麼準備。為什麼三題要有人在旁邊問，錯配清單為什麼比答案本身有用，以及進度為什麼存在他自己的裝置上。

-   :material-account-multiple-outline: **[把名單交給外部夥伴](case-roster.md)**

    年度申報要把捐款人名單交給會計師，往年都當附件寄出去。密語為什麼要走另一個管道，加密過的檔案為什麼還要算一次雜湊。

-   :material-presentation: **[工作坊現場要發東西給大家](case-workshop.md)**

    場地的 Wi-Fi 是主辦方的，二十個人的裝置各不相同。哪些東西該印成 QR code、哪些用螢幕跟鏡頭傳、哪些只能靠隨身碟。

-   :material-file-account-outline: **[收到來源給的檔案](case-source-file.md)**

    來源傳來一份內部簡報，你要查證它、要引用它，而且不能讓提供的人被指認出來。文件外流追蹤怎麼運作，為什麼引用要靠重打與遮蔽。

-   :material-folder-account-outline: **[把對話截圖整理成送件附件](case-evidence.md)**

    四十幾張對話截圖要整理成一份送出去的附件，畫面上有第三人的名字與頭像。遮蔽、合併與確認的順序，以及交出去之前最後那一步要查什麼。

</div>

## 要離線帶著走

工具的程式與資料會跟頁面一起存下來。[QR code 產生器](qrcode.md)、[讀取器](qr-read.md)、[影格串流](qr-stream.md)與[密語產生器](passphrase.md)四頁跟核心章節一起自動存進裝置，理由是它們在斷網現場會用到，見[網路中斷時的準備與應對](../scenarios/shutdown.md)。其餘幾頁在[離線閱讀](../offline.md)的清單裡勾起來，之後沒有網路也可以開啟。

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

分享連結也不會有。把結果存起來給別人看，聽起來只是方便，實際上是把內容送到伺服器，而工具本體仍然在瀏覽器裡運算，畫面上看不出差別。JSONFormatter 與 CodeBeautify 這兩個貼上型工具站就是這樣，政策裡寫著九成九的工具在瀏覽器裡處理，那句話是真的，但同時有一顆存檔按鈕，存下來的內容預設公開，搜尋引擎索引得到。資安團隊 watchTowr Labs 在 2025 年[從那裡取得八萬多份提交、超過 5 GB](https://labs.watchtowr.com/stop-putting-your-passwords-into-random-websites-yes-seriously-you-are-the-problem/){target="_blank"}，涵蓋五年份的內容，裡面有資料庫密碼、雲端金鑰與企業內部帳號。兩站的政策都寫著不要拿它存機密資料，看到的人不多。

所以這一區的規則沒有為了方便開的側門。要把結果給別人，自己存檔再用你信得過的管道傳。
