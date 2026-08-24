---
title: 郵件別名怎麼用，以及它把信任交給誰
description: 轉寄別名、自有網域 catch-all 與加號子地址的差別，別名在什麼場合有效、什麼場合接不上，以及台灣的實際情境。
icon: material/email-multiple-outline
---

# :material-email-multiple-outline: 郵件別名怎麼用，以及它把信任交給誰

「每個身分要有自己的 email」是 [怎麼維持多個網路身分](../basics/multiple-identities.md) 開出來的第一條要求，照字面執行會卡住：五個身分代表五個信箱、五組密碼、五組兩階段驗證，多數人開到第三個就放棄。郵件別名把要求降到可執行的程度，一個信箱底下產生任意多個對外地址，每個服務給一個，需要時單獨關掉。代價是往來紀錄集中到轉寄商手上。以下說明三種做法的差異、別名接不上的場合，以及台灣哪些情境用得上。開始之前可以先看 [威脅模型如何建立](../basics/threat-model.md)，確認自己在抗誰。

## 別名解決的三件事

### 減少服務之間的比對支點

[社群平台怎麼收集你的資料](../basics/platform-tracking.md) 裡列了一項擋不掉的比對：平台之間靠 email 與手機號互相對照，把你在不同服務的帳號串成同一個人。二十家服務收到二十個不同地址之後，email 這條線就對不起來了。手機號、裝置指紋、通訊錄上傳仍然存在，別名只處理其中一條。

### 外洩可以指名道姓

[一般人平常該做到什麼](../scenarios/everyday-baseline.md) 的第一步是到 Have I Been Pwned 查自己被哪幾次外洩波及。查得到事件，查不到是誰把地址流出去的。每個服務配一個獨立地址之後，垃圾信寄到哪個地址，就知道責任在哪一家。這是本尊地址永遠給不了的資訊。

### 撤銷不需要對方配合

關掉一個別名不必經過服務商同意，也不會通知對方。退訂鈕失效、客服不回、帳號刪不掉的時候，關別名是你單方面就能完成的動作，效果立刻生效。

## 三種做法

### 轉寄服務

由第三方營運，收到寄給別名的信之後轉進你原本的信箱。

[SimpleLogin](https://simplelogin.io/){target="_blank"} 由 Proton 營運、開源，免費方案 10 個別名與 1 個收件信箱，付費方案每年 36 美元，加上無限別名、自有網域、catch-all、PGP 加密轉寄[^sl-pricing]。

[addy.io](https://addy.io/){target="_blank"}（前身 AnonAddy）開源且可自架，需自備裝好 Postfix 的伺服器，官方另提供 Docker image。免費方案 10 個共用網域別名、每月 10 MB 轉寄流量，Lite 每月 1 美元、Pro 每月 3 美元。GPG 加密轉寄在所有方案都能用，信件預設不留存，只有在轉寄失敗且你自行開啟該選項時才會暫存[^addy-faq]。

[Firefox Relay](https://relay.firefox.com/){target="_blank"} 由 Mozilla 營運，免費方案 5 個遮罩地址，付費方案給無限遮罩、自訂子網域與號碼遮罩。付費方案的供應國家清單目前涵蓋歐洲多國、美加、紐西蘭、新加坡與馬來西亞，台灣不在其中，台灣使用者只能用免費的 5 個[^relay]。

[DuckDuckGo Email Protection](https://duckduckgo.com/email/){target="_blank"} 免費、數量無限，地址落在 `@duck.com`，分成一個個人地址與隨機產生的私密地址兩種。除了轉寄，它會移除信件裡的追蹤像素，並聲明轉寄過程不保存信件內容，連 to 與 from 標頭都不留[^ddg-privacy]。

Apple 的 Hide My Email 需要 iCloud+ 付費訂閱，整合在 Safari 表單、Mail 與 Sign in with Apple 的流程裡[^apple-hme]。方便，但它把身分綁在 Apple ID 底下，[怎麼維持多個網路身分](../basics/multiple-identities.md) 提醒過的「用 Apple 帳號登入」風險同樣適用。

### 自有網域的 catch-all

自己註冊一個網域，把所有寄給該網域的信件收進同一個信箱。地址隨手編，`bank@example.com`、`shop@example.com` 都直接生效，不必事先建立。

優點是不依賴任何轉寄商，也不會因為對方停止營運或封鎖你的帳號而失去全部地址，換信箱服務時把 MX 紀錄指過去即可。缺點是你要維護網域續約與 DNS，以及承擔垃圾信全數落地的後果，因為 catch-all 對還沒被使用的地址一律照收。

### 信箱服務內建的別名

Fastmail 的 Masked Email、Proton Pass 內建的別名（底層即 SimpleLogin）、iCloud+ 的 Hide My Email 都屬於這一類。設定成本最低，代價是別名與信箱綁在同一家，離開該服務時別名一起消失。

### 三種做法的取捨

| 面向 | 轉寄服務 | 自有網域 catch-all | 信箱內建 |
|---|---|---|---|
| 起步成本 | 註冊即用 | 買網域、設 MX | 已有帳號就能用 |
| 誰看得到往來紀錄 | 轉寄商 | 你的信箱服務商 | 信箱服務商 |
| 搬家難度 | 換轉寄商等於換掉所有地址 | 改 MX 指向即可 | 別名跟著帳號一起消失 |
| 被服務商擋掉 | 常見，共用網域列在封鎖清單上 | 少見 | 視網域而定 |
| 別名彼此可連 | 隨機字串產生時不易連 | 同網域，可連 | 視產生方式而定 |
| 適合 | 一般日常帳號隔離 | 長期經營、不願受制於人 | 已在該生態系內的使用者 |

## 加號子地址擋不住任何人

`you+shop@gmail.com` 常被當成免費的別名，實際上防護力接近零。RFC 5233 把 `+` 之後的字串定義為 detail、之前的部分定義為 user[^rfc5233]，任何取得地址的人做一次字串切割就還原出本尊 `you@gmail.com`。會賣名單或會被入侵的對象，正好就是最有動機做這個切割的一方。

加號子地址適合的用途是收件分類與規則設定，把訂閱信自動歸檔進資料夾。拿它做身分隔離無效，[怎麼維持多個網路身分](../basics/multiple-identities.md) 那套分層需求它一項都滿足不了。

## 別名把往來紀錄集中到一家

改用轉寄之後，二十家服務各自只知道你的一個別名，轉寄商知道全部二十家是誰、每封信什麼時候到、以及沒有加密時的信件內容。信任的總量沒有變少，換了受託對象。

要壓縮轉寄商看得到的範圍，有幾種做法。addy.io 全方案與 SimpleLogin 付費方案支援用你自己的 PGP 公鑰加密轉寄內容，轉寄商就讀不到內文。收發雙方、時間與信件大小仍然留在轉寄商那裡，[Metadata 是什麼](../basics/metadata.md) 描述的外圍資訊照樣完整。DuckDuckGo 的做法是聲明連標頭都不保存，你信不信任該聲明是另一回事。自架 addy.io 把受託對象換成你自己，代價是自己維護郵件伺服器。

選擇之前先問自己抗的是誰。抗資料仲介與垃圾信，轉寄服務綽綽有餘。抗有能力對轉寄商調資料的對手，加密轉寄或自架才有意義，[威脅模型如何建立](../basics/threat-model.md) 有判斷流程。

## 同一個網域底下的別名彼此可連

自有網域的 catch-all 換來獨立性，同時帶進一個容易被忽略的問題：`bank@example.com` 與 `dating@example.com` 共用一個網域，看到其中一個的人就知道另一個存在，加上網域註冊人資料與 DNS 歷史紀錄，整組地址可以連回同一個人。

抗垃圾信與外洩溯源時無所謂，做身分隔離時它會直接毀掉隔離。次要層要用自有網域的話，網域本身必須另外註冊、註冊人資料獨立、且不與長期層共用。同一個網域同時服務兩層，等於把兩層寫在同一張名片上。

## 別名接不上的場合

- **實名或 KYC 服務**：銀行、券商、電信、政府系統本來就掌握你的身分證字號與手機號，別名在這些地方不提供身分隔離，能提供的只有外洩溯源
- **被服務商擋掉**：轉寄服務的共用網域常被誤判為拋棄式信箱。SimpleLogin 為此設了回報管道，收到回報後逐一與網站聯繫要求解除封鎖，官方建議的繞法是改用自己的子網域或自有網域[^sl-block]。實際上主流的 `disposable-email-domains` 封鎖清單有意區隔兩者，收錄的 8,347 個網域裡（2026-08-24 查）不含 `duck.com`、`addy.io`、`mozmail.com` 等轉寄網域，該專案要求提交者附上「該網域可產生拋棄式地址」的截圖[^ded]，擋人的是各家自訂的規則
- **回信路徑**：從別名回信要走轉寄商提供的 reverse-alias 機制，直接用本尊信箱按回覆就會露出真實地址
- **帳號救援**：拿別名當救援信箱的服務，別名一關就救不回帳號。關閉之前先確認沒有服務依賴它
- **轉寄商本身的存續**：服務停止營運或封鎖你的帳號時，共用網域的地址全部失效。長期經營的身分放自有網域比較安全

## 台灣的幾個實際情境

電子發票手機條碼申請時要填手機號與 email 兩項，email 收驗證信[^einvoice]。手機號在台灣已經實名，別名在這裡買不到身分隔離，買到的是「財政部系統外洩時我知道是它」。判準通用：對方已經握有你的實名資料時，別名的價值只剩溯源。

個資法 2025 修法給了個人更明確的查詢、更正、刪除權，以及向個保會申訴的管道（見 [台灣個資法 2025 修法](../taiwan/pdpa-2025.md)）。這些權利要行使得出來，前提是你說得出對象是誰。別名把「我的地址不知道被誰賣了」變成「這個地址只給過某某公司」，是行使權利時拿得出來的具體事證。

電商、外送、購票、健身房會員這類會發促銷信也會外洩的服務，每家一個別名收益最高。銀行、券商、報稅、健保這類需要長期穩定且不能失聯的服務，用本尊地址，別為了隔離讓自己收不到重要通知。

## 撤銷一個別名的流程

順序錯了會把自己鎖在門外，四個步驟照做：

1. 先查有沒有其他服務拿它當救援信箱或兩階段驗證的備援管道，有的話先換掉
2. 到該服務把帳號地址改成新別名，完成驗證信確認新地址真的收得到
3. 回轉寄商把舊別名設成停用，不要刪除。停用的別名繼續擋住寄信，刪除之後共用網域的字串有機會被別人重新註冊
4. 自有網域的話改用明確的黑名單規則擋掉該地址，catch-all 不會因為你不再使用就停止接收

[家暴倖存者的數位準備](../scenarios/domestic-violence.md) 描述的離開後重建身分，用得上同一套流程。停用一個別名不會產生任何通知，對方看到的現象是信件退回，看不到你在什麼時候做了什麼。

## 怎麼開始

不必一次處理完所有帳號。挑一家最常寄促銷信的電商，換一個別名上去，觀察兩週。習慣之後照 [一般人平常該做到什麼](../scenarios/everyday-baseline.md) 的順序，趁密碼管理器逐站更換密碼時順手把地址一起換掉。

產生別名的部分可以交給密碼管理器。Bitwarden 的使用者名稱產生器內建 SimpleLogin、addy.io、Firefox Relay、Fastmail、Forward Email、DuckDuckGo 六家的整合，填入 API 金鑰之後，新增登入項目時可以直接產生別名並存進金庫[^bw-gen]。設定方式見 [密碼管理器入門](./password-manager.md)。

金庫本身要備份好。別名散在各處而你只記得幾個的狀況下，金庫是唯一一份「哪個地址對應哪個服務」的完整索引，弄丟它等於失去對自己身分的盤點能力。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-account-multiple-outline: 怎麼維持多個網路身分](../basics/multiple-identities.md)
- [:material-chat-question: Metadata 是什麼](../basics/metadata.md)
- [:material-key-variant: 密碼管理器入門](./password-manager.md)
- [:material-shield-account-outline: 社群平台怎麼收集你的資料](../basics/platform-tracking.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-shield-lock-outline: 個人隱私指引研究專題](../community/privacy-guide.md)
- [:material-lifebuoy: 緊急求救](../help/index.md)
- [:material-translate-variant: 中文化與文件翻譯](../community/i18n.md)

</div>

[^sl-pricing]: [SimpleLogin Pricing](https://simplelogin.io/pricing/){target="_blank"} - 免費與付費方案的別名數、信箱數、自有網域與 PGP 支援範圍在此頁。
[^addy-faq]: [addy.io FAQ](https://addy.io/faq/){target="_blank"} - GPG 加密轉寄的方案範圍、自架所需的 Postfix 設定與信件留存政策在此頁。方案限額見 [addy.io 首頁](https://addy.io/){target="_blank"}。
[^relay]: [Firefox Relay](https://relay.firefox.com/){target="_blank"} - Mozilla，免費方案 5 個遮罩與付費方案的供應國家清單在此頁。
[^ddg-privacy]: [Does DuckDuckGo save my email messages?](https://duckduckgo.com/duckduckgo-help-pages/email-protection/privacy/does-duckduckgo-save-my-messages){target="_blank"} - DuckDuckGo 說明頁，不保存信件與標頭的說明在此頁。地址型態見 [Duck Addresses](https://duckduckgo.com/duckduckgo-help-pages/email-protection/duck-addresses){target="_blank"}。
[^apple-hme]: [Set up and use Hide My Email in iCloud+](https://support.apple.com/guide/icloud/set-up-hide-my-email-mm9d9012c9e8/icloud){target="_blank"} - Apple Support，需要 iCloud+ 訂閱與可產生地址的位置在此頁。
[^rfc5233]: [RFC 5233: Sieve Email Filtering: Subaddress Extension](https://www.rfc-editor.org/rfc/rfc5233.html){target="_blank"} - IETF，user 與 detail 兩段的定義在此文件。
[^sl-block]: [Report blocking website](https://simplelogin.io/docs/report-blocking-website/){target="_blank"} - SimpleLogin 文件，回報流程與改用自有網域的建議在此頁。
[^ded]: [disposable-email-domains](https://github.com/disposable-email-domains/disposable-email-domains){target="_blank"} - 社群維護的拋棄式信箱網域清單，提交新網域需附上可產生拋棄式地址的截圖。
[^einvoice]: [手機條碼申請](https://www.einvoice.nat.gov.tw/accounts/signup/mw){target="_blank"} - 財政部電子發票整合服務平台，手機號與 email 兩項驗證流程在此頁。
[^bw-gen]: [Username Generator](https://bitwarden.com/help/generator/){target="_blank"} - Bitwarden 說明文件，六家轉寄服務的整合清單在此頁。
