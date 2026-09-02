---
title: 什麼是 age
description: age 是 2019 年出現的檔案加密格式與工具，規格只有一頁長，沒有選項可以設錯，金鑰只有一行。介紹它怎麼用、格式長什麼樣、跟 PGP 差在哪，以及站上規劃中的本機檔案加密工具為什麼選它而非 PGP。
icon: material/file-key-outline
---

# :material-file-key-outline: 什麼是 age？

出門前要把備份加密後放上雲端，或者要把一份檔案交給另一個人，多數人第一個想到 PGP，然後在產生金鑰、匯入公鑰、決定信任等級那幾步放棄。[age](https://github.com/FiloSottile/age){target="_blank"} 是為「把一個檔案加密給某個人或某組密語」重新設計的工具：金鑰只有一行，沒有選項，一個檔案格式，規格只有一頁長。

站上的[本機檔案加密](../utils/age.md)輸出的就是 age 格式。這一頁先說明 age 是什麼、怎麼用、跟 PGP 差在哪，以及為什麼選它。

## age 是什麼

age 由 Go 語言密碼學函式庫的維護者 Filippo Valsorda 設計，2019 年公開，格式規格由 [C2SP](https://github.com/C2SP/C2SP/blob/main/age.md){target="_blank"} 社群規格計畫維護，網址就是格式的第一行 `age-encryption.org/v1`。作者對它的描述是「簡單、現代、安全的檔案加密工具、格式與函式庫」，設計目標寫得很直白：小而明確的金鑰、沒有設定項、能跟 UNIX 管線組合。

三種實作可以互相解開彼此的檔案：

- [age](https://github.com/FiloSottile/age){target="_blank"}：Go 寫的參考實作與命令列工具。
- [rage](https://github.com/str4d/rage){target="_blank"}：Rust 實作，命令列介面相同。
- [typage](https://github.com/FiloSottile/typage){target="_blank"}：TypeScript 實作，在瀏覽器裡也能執行，站上的工具用的就是它。

外掛機制讓硬體金鑰（例如 YubiKey）也能當收件人，命令列工具另外支援直接用 SSH 公鑰加密。2025 年之後規格加入了後量子混合金鑰的收件人類型，命令列工具用 `-pq` 開啟。

## 怎麼用

安裝：macOS 與 Linux 用 `brew install age`，Debian 12 之後 `apt install age`，Windows 用 `winget install --id FiloSottile.age`。

密語模式，不需要任何金鑰：

```
age -p -o backup.tar.age backup.tar
age -d -o backup.tar backup.tar.age
```

第一行會問你密語兩次，第二行解密時問一次。密語的強度就是整份加密的強度，用[密語產生器](../utils/passphrase.md)抽六個詞以上，理由見 [Asian Diceware 密語字典](./asian-diceware.md)。

公鑰模式，把檔案加密給某個人：

```
age-keygen -o key.txt
age -r age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p -o file.age file
age -d -i key.txt -o file file.age
```

`age-keygen` 產生的私鑰檔裡附著公鑰，那一行 `age1` 開頭的 62 個字元就是可以公開貼給別人的收件人。`-r` 可以重複給好幾個收件人，同一份密文任何一位都能解開。加上 `-a` 輸出會變成純文字，可以貼進郵件或聊天視窗。

## 格式長什麼樣

age 檔案的前面幾行是純文字，用文字編輯器打開就能看見：

```
age-encryption.org/v1
-> X25519 <一段 base64 的臨時公鑰>
<一段 base64>
--- <header 的驗證碼>
```

第一行是版本。中間每一段 `->` 開頭的叫收件人段落，一位收件人一段，裡面是用該收件人的金鑰包起來的檔案金鑰。密語模式只有一段，型別是 `scrypt`，帶著 16 位元組的鹽與工作因數。`---` 那一行是整個 header 的 HMAC-SHA-256，改動任何一段都會被發現。

header 之後是密文本體。內容用 ChaCha20-Poly1305 切成每 64 KiB 一段加密，每一段都有自己的驗證標籤，段落順序與最後一段都編進 nonce 裡。這代表三件事：任何一個位元組被改過都會在解密時被擋下，大檔案可以邊讀邊解，不必整份載入記憶體，以及密文比原檔大一點（每 64 KiB 多 16 位元組，加上 header）。

公鑰模式的收件人段落只含一個臨時公鑰，不含收件人自己的公鑰，所以從密文本身無法看出是加密給誰，只看得出有幾位收件人。這一點跟 PGP 預設把收件人的金鑰 ID 寫進密文不同。

## 跟 PGP 差在哪

PGP 是 1991 年的軟體，OpenPGP 是它的公開標準，[RFC 9580](https://www.rfc-editor.org/rfc/rfc9580){target="_blank"}（2024 年）是最新版，取代 2007 年的 RFC 4880。它做的事比 age 多得多：加密、簽章、身分、信任網、金鑰伺服器，一份金鑰上掛著名字、電子郵件、期限與好幾把子金鑰。

| | age | OpenPGP |
|---|---|---|
| 做的事 | 只加密檔案 | 加密、簽章、身分與信任網 |
| 演算法 | 固定一組：X25519、ChaCha20-Poly1305、scrypt、HMAC-SHA-256 | 多種可選，雙方協商 |
| 金鑰長什麼樣 | 一行 62 個字元 | 一個區塊，上千字元，含身分與期限 |
| 設定項 | 沒有 | GnuPG 的設定檔有上百項 |
| 完整性 | 每 64 KiB 一段驗證，改一個位元組就解不開 | 舊格式的 MDC 只給警告，2024 年起才有 AEAD |
| 簽章 | 沒有 | 有 |
| 密文透露收件人 | 不透露 | 預設寫進金鑰 ID，要另外開選項才藏 |
| 規格長度 | 一頁 | 上百頁 |
| 實作 | Go、Rust、TypeScript 三份互通 | GnuPG 為主，其餘實作各自覆蓋部分規格 |

兩件 PGP 的歷史值得知道。1999 年的可用性研究「Why Johnny Can't Encrypt」找了十二個人用 PGP 5.0 寄一封加密信，多數人在九十分鐘內無法完成，還有人把私鑰寄了出去。2018 年的 [EFAIL](https://efail.de/){target="_blank"} 攻擊利用舊格式的密文可以被改動、郵件軟體對驗證失敗只給警告照樣顯示這兩件事，把加密郵件的內容從 HTML 外連裡偷出來。兩者的根源相同：選項太多、能設錯的地方太多、規格留給實作的自由度太大。age 的設計就是把那些地方全部拿掉。

age 也放棄了幾件事。它不簽章，能解開一個檔案不代表知道是誰加密的，來源要用別的方式確認。它沒有身分與信任模型，對方的公鑰要透過你信任的管道取得，通常是當面或既有的加密通訊。兩者都沒有前向保密：私鑰或密語一旦外洩，過去所有用它加密的檔案都能被解開。

## 為什麼站上的工具選 age

讀者三年後要解一份備份時，手上可能只剩一台裝了命令列工具的電腦，網站還在不在都不一定。age 是公開格式，三份獨立實作互通，任何一台電腦都能解開，這是選公開格式而非自訂格式的全部理由。

在公開格式裡選 age 而非 PGP，理由是上面那張表的每一列都指向同一件事：沒有選項就沒有設錯的機會，規格短就能在瀏覽器裡實作得小而能審，密語模式不需要任何金鑰管理。[本機檔案加密](../utils/age.md)只做密語模式，讀者要做的事只有選檔案、輸入密語、下載。

PGP 留在它該在的地方。站上的[敏感資料上傳](../community/upload-sensitive.md)流程用 PGP，因為那裡需要長期的身分、要跟郵件生態相容，而且對方是已經在用 PGP 的記者與組織。分工是：郵件與身分用 PGP，檔案與備份用 age。

## 注意

- 密語模式的安全全在密語。scrypt 讓每次猜測變慢，但無法抵擋一個弱密語。
- 檔名不在密文裡，你把加密檔存成什麼名字，別人就看到什麼名字。備份取一個不透露內容的檔名。
- 密文大小約略反映原檔大小，藏不了檔案有多大。
- 解密後的檔案落在磁碟上就是明文，用完要刪，磁碟本身沒有全碟加密的話刪了也可能被還原。

## 相關閱讀

- [Asian Diceware 密語字典](./asian-diceware.md)：密語模式要配夠強的密語
- [密語與密碼產生器](../utils/passphrase.md)：在瀏覽器裡抽一組，不送出任何資料
- [端對端加密](../advanced/e2ee.md)：加密在傳輸與儲存兩端各解決什麼
- [網路中斷時的準備與應對](../scenarios/shutdown.md)：加密備份要斷網也解得開，age 不需要連線
- [敏感資料上傳](../community/upload-sensitive.md)：站上用 PGP 的地方
