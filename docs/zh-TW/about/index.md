---
title: 關於文件站
description: anoni.net 文件站寫什麼、如何寫成、三個語系的關係、錯誤如何更正，以及內容的授權。社群本身的介紹在 anoni.net。
icon: material/book-information-variant
---

# :material-book-information-variant: 關於文件站

文件站整理匿名網路與隱私的知識，從概念、工具到不同處境的準備，也追蹤台灣的網路觀測與相關法規。內容由匿名網路社群 anoni.net 的成員撰寫與維護，原始檔與修改紀錄都公開在 [GitHub](https://github.com/anoni-net/docs){target="_blank"}。

社群的介紹、參與方式與自架服務在 [anoni.net](https://anoni.net/about/){target="_blank"}，這一頁只談文件站本身。

## 內容範圍

| 分類 | 內容 |
|---|---|
| [開始](../start/index.md) | 依身分整理的起步路徑，從公民團體、媒體到一般讀者 |
| [指南](../guides/index.md) | 概念、工具、場景、進階、報告五個層次，由淺到深 |
| [在地脈絡](../taiwan/index.md) | 台灣的連線觀測、法規與制度，以及讀懂觀測資料的方法 |
| [小工具](../utils/index.md) | 在瀏覽器裡執行的工具，資料不會上傳 |
| [資訊更新](../blog/index.md) | 社群公告、外部文章的翻譯與軟體更新日誌 |
| [架設與營運](../community/setup-tor-relay.md) | 架設 Tor 中繼節點、橋接、onion 服務與鏡像 |

關注的範圍是華語六地區（中國大陸、香港、澳門、新加坡、馬來西亞、台灣），以及在各地之間移動的華語使用者。台灣是社群唯一能以第一手經驗發言的地方，其他地區依據公開資料與當地聯絡人的說法撰寫，用到二手材料的段落會在頁面上標明。

## 寫作與審稿

寫作風格寫在社群首頁的[寫作風格規範](https://anoni.net/join/writing-style/){target="_blank"}，檔案格式與 PR 流程寫在[貢獻者百科](../community/contributor-handbook.md)。每一個修改都經過 PR，送出時先由 linter 檢查標點與句型，合併前經過維護者審閱。

社群不限制貢獻者使用哪一家的 AI 工具協助寫作與翻譯，AI 的產出跟人工撰寫走同一套流程。文章裡的數字、引文與來源連結，送出 PR 的人要實際點開核對，並為內容負責。

內容不提供可被濫用的操作配方，引用他人的觀測時不揭露個人帳號，涉及受害者與未公開研究的資料走[上傳機敏資訊流程](https://anoni.net/join/upload-sensitive/){target="_blank"}。

## 三個語系

- **正體中文**是正本，新文章先寫正體中文
- **簡體中文**從正體中文同步，詞彙與政治措辭調整成簡體中文讀者慣用的說法
- **英文**是另外整理的版本，不逐頁對應。英文世界已經有人寫得更完整的主題，英文版直接連過去

翻譯的做法與分工見[中文化與文件翻譯](../community/i18n.md)。三個語系不一定同時上線，簡體中文與英文依人力陸續補上。

## 更正

寫錯的地方直接修改原文，影響讀者做法的更正另外寫成公告。公告說明改了什麼、依據在哪裡，以及照著舊版做過準備的人要補上什麼，例如 [2026/08 的更正回顧](../blog/posts/docs-corrections-202608.md)與 [2026/09 的文件站更新回顧](../blog/posts/site-updates-202609.md)。

發現錯誤或過時的內容，可以到 [GitHub 開 Issue](https://github.com/anoni-net/docs/issues){target="_blank"}，或寫信到 <whisper@anoni.net>（PGP 公鑰見[聯絡頁](https://anoni.net/contact/#pgp){target="_blank"}）。

## 閱讀方式

文件站同時發布成標準網站、Tor onion 與 IPFS 鏡像三份，內容相同，差別在過程中誰可以看到什麼，見[你正在用哪一種方式閱讀](./how-you-are-reading.md)。標準網站另外可以存進裝置，沒有網路時照樣能讀，見[離線閱讀](../offline.md)。

## 授權

內容以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hant){target="_blank"} 授權，轉載或改作時註明出處即可，寫法是「anoni.net 文件站，頁面網址，CC BY 4.0」。

少數外部資料沿用原始的授權，例如互動作品用到的 OONI 資料是 CC BY-NC-SA 4.0，清單見 repo 根目錄的 [`NOTICE`](https://github.com/anoni-net/docs/blob/main/NOTICE){target="_blank"}。程式碼的授權另外標示，Tor 中繼節點觀測（Pulse）是 MIT，OONI 觀測涵蓋率（ASN Coverage）是 GPL-3.0。

## 相關閱讀

- [貢獻者百科](../community/contributor-handbook.md)
- [中文化與文件翻譯](../community/i18n.md)
- [文件站的視覺規範](../community/visual-guide.md)
- [品牌素材](https://anoni.net/brand/){target="_blank"}
- [社群首頁 anoni.net](https://anoni.net/){target="_blank"}
