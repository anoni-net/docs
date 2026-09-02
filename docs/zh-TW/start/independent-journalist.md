---
title: 獨立記者
description: 給獨立記者與自由撰稿人的起步路徑。一台裝置同時處理工作與生活時怎麼分層，沒有機構信箱時怎麼收線索，出國採訪的裝置準備。
icon: material/account-edit-outline
# 這條路徑含有場景頁。start/index.md 的路徑下載按鈕旁會掛敏感提醒，
# 由 hooks/offline_index.py 經 offline-index.json 的 paths 帶過去。
offline_caution: true
---

# :material-account-edit-outline: 獨立記者從這裡開始

適用自由撰稿人、獨立媒體的一人團隊、公民記者。面對的威脅跟大型媒體的記者相同，可以投入的成本與能仰賴的支援差很多，所以優先順序需要重排。

有編輯台、法務與 IT 的組織，看[新聞媒體的起步路徑](./media.md)。下面每一條連結都指向站上既有的文章。

## 你大概正在處理的三件事

### 一台手機與一台筆電，承載採訪與生活的全部

同一支手機聯絡來源、聯絡家人、登入銀行。裝置遺失或被查扣時，失去的東西是整批的，來源的聯絡紀錄也在裡面。

先看[怎麼維持多個網路身分](../basics/multiple-identities.md)，分層的通用做法都在那一篇。

### 沒有機構信箱，來源只能從個人社群帳號找到你

對方在你的公開帳號私訊，訊息內容與雙方的關聯都留在平台上。你需要一條能公開貼出來、對方自己就能評估風險的通道。

看[公開的安全收件管道](../scenarios/journalist.md#公開的安全收件管道)，一個人也做得起來。

### 出國採訪，裝置要過海關

入境查驗裝置在部分地區是常態，解鎖與否都有代價。裡面若有來源的聯絡紀錄，風險由對方承擔。

看[出差與研討會的數位準備](../scenarios/asia-travel.md)，十四地逐一整理。

## 二十分鐘：先讀這三篇

1. [記者保護消息來源](../scenarios/journalist.md)：從第一次接觸到報導刊出的完整流程，先通讀一次建立全貌
2. [威脅模型清單](../utils/threat-model.md)：三題答完會標出答案裡的錯配，例如對手填到國家級、成本卻填最低。填的內容留在瀏覽器分頁裡，重新整理就沒了
3. [怎麼維持多個網路身分](../basics/multiple-identities.md)：一個人要撐起多重身分，靠的是規則而非工具

## 一週：把基本功補起來

### 把工作與生活分開

- [郵件別名怎麼用，以及它把信任交給誰](../tools/email-alias.md)：註冊用的信箱與採訪用的信箱分開，成本很低
- [密碼管理器入門](../tools/password-manager.md)：分層之後帳號會變多，人腦記不住
- [密語與密碼產生器](../utils/passphrase.md)：在瀏覽器裡產生，不送出任何資料
- [匿名通訊工具比較](../tools/messaging-comparison.md)：跟來源聯絡走哪一套

### 一個人也做得到的幾件事

- [什麼是 Tor](../tools/what-is-tor.md)：查資料時不讓對方看到你在查
- [OnionShare](../tools/onionshare.md)：來源不用註冊帳號就能傳檔案給你，不需要架伺服器
- [什麼是 Tails](../tools/what-is-tails.md)：處理特別敏感的素材時，換一個乾淨的作業環境
- [檔案 metadata 清除器](../utils/strip-metadata.md)：發稿前清掉照片與文件裡的座標與裝置資訊

### 出門採訪

- [出差與研討會的數位準備](../scenarios/asia-travel.md)：東亞與東南亞十四地的審查、SIM 實名與入境查機對照
- [出國前數位安全：用 AI 自助產生目的地概況](../scenarios/travel-ai-briefing.md)：目的地不在上一篇的清單裡時，複製 prompt 自己產生一份

### 台灣的法規

- [揭弊者保護法](../taiwan/whistleblower-law.md)：來源是內部員工時，法律保護到哪裡
- [法規與通訊紀錄](../scenarios/journalist.md#法規與通訊紀錄)：調取的門檻與實務

## 不分身分都要做到的

一個人工作的時候，你自己的習慣就是工作的防線，同一組帳號與同一台裝置兩邊都在用。下面兩篇跟身分無關，每一種處境都適用。

- [一般人平常該做到什麼](../scenarios/everyday-baseline.md)：依實際效果排序的做法，二十分鐘讀完
- [常被誤認為匿名的網路](../advanced/mistaken-for-anonymity.md)：區塊鏈、私密瀏覽視窗、VPN 這幾項常被高估到什麼程度

## 帶得走的東西

- 威脅模型清單答完按「複製摘要」，貼到你自己選的地方，換題目時回頭再填一次
- [隱形字元偵測](../utils/invisible.md)：取得文件先掃一次，隱形標記是常見的追人手法
- [社群自架服務](../community/tools.md)的 Matrix、CryptPad 與 Send 都開放使用，一人團隊不必自己架
- 有問題到 [Matrix 公開 room](../community/tools.md) 問，需要傳敏感檔案寄 [whisper@anoni.net](mailto:whisper@anoni.net)

## 這條路徑沒有處理的

- **機構層級的素材保存與調取應對**：見[新聞媒體的起步路徑](./media.md)
- **已經發生的資安事件**：先看[緊急求救](../help/index.md)，那一頁列出台灣的求助專線
- **香港與澳門的記者**：上面的法規段落全部以台灣脈絡撰寫。2020 年《國安法》與 2024 年《維護國家安全條例》之後，香港記者面對的風險層級與可用的求助管道都跟台灣差距很大，請對照自身處境重新評估
