---
title: 密語與密碼產生器
description: 在瀏覽器裡產生 Diceware 密語與隨機密碼，用的是 asian-diceware 的 7776 字詞表與瀏覽器的密碼學亂數。全部在你的裝置上完成，沒有網路也能用。
icon: material/dice-multiple-outline
offline_assets:
  - utils/asian-diceware-7776.txt
---

# :material-dice-multiple-outline: 密語與密碼產生器

<div id="passphrase-tool"></div>

<script src="../../js/passphrase.js"></script>

## 這個工具在做什麼

「密語」模式從 [asian-diceware](../tools/asian-diceware.md) 的 7776 字詞表裡獨立抽幾個字串起來。那份詞表是社群參考 EFF Diceware 做的版本，混進了 `oolong`、`boba`、`tofu` 這類已經進英文字典的亞洲外來語，對在台灣與亞洲各地生活的人更好認、更好記。

「隨機密碼」模式從你勾選的字元集裡逐字抽。適合用密碼管理器保管、不需要用手打的場合。

兩個模式的亂數都來自 `crypto.getRandomValues`，那是瀏覽器提供的密碼學等級亂數，跟 `Math.random` 不同。取樣時把不能整除的尾巴丟掉重抽，讓每個字被抽中的機率完全相同。細節與測試見[原始碼](https://github.com/anoni-net/docs/blob/main/docs/zh-TW/js/passphrase.js){target="_blank"}。

## 熵那個數字

熵是「要猜多少次才猜得到」的度量，單位是位元。每多一個位元，猜的次數就要多一倍。

七千七百多個字裡抽六次，熵大約是 77.5 位元。那代表即使攻擊者知道你用的是這份詞表、知道你抽了六個字，仍然要在 2^77.5 種組合裡找。EFF 建議一般用途至少六個字，主密碼或加密磁碟這類長期不換的地方可以用七到八個。

字數少於五個的密語不要拿來保護重要的東西。工具會把它標成偏弱。

## 為什麼敢在網頁上做這件事

密碼產生器最大的疑慮是「這個網站會不會偷偷把產生的密碼送出去」。

這一頁的答案是：**把網路關掉，它照樣能用**。斷網的情況下瀏覽器送不出任何東西，而工具仍然抽得出密語，因為詞表與程式都已經存在你的裝置上（見[離線閱讀](../offline.md)）。這是任何說明文字都給不了的保證。

如果你連這個都不想信，最穩的做法是拿實體骰子照 [asian-diceware](../tools/asian-diceware.md) 那篇的方法查表。那不依賴任何軟體，也是 Diceware 原本的設計。這個工具的定位是在你趕時間、或手邊沒有骰子的時候頂替，不是取代它。

## 複製之後記得清剪貼簿

按「複製」會把結果放進系統剪貼簿，那裡的內容其他程式讀得到，有些輸入法與同步服務還會把它上傳。貼進密碼管理器之後，複製一段無關的文字蓋掉它。

手機上更要注意，剪貼簿常常跨 App 共用。

## 接下來

- 產生好的密語要有地方放，見[密碼管理器入門](../tools/password-manager.md)
- 詞表怎麼做出來的、選字有什麼原則，見 [Asian Diceware](../tools/asian-diceware.md)
- 想把這一頁帶著離線用，見[離線閱讀](../offline.md)
