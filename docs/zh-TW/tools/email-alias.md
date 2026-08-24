---
title: 郵件別名怎麼用，以及它把信任交給誰
description: 轉寄別名、自有網域 catch-all 與加號子地址的差別，別名在什麼場合有效、什麼場合接不上，以及台灣的實際情境。
icon: material/email-multiple-outline
---

# :material-email-multiple-outline: 郵件別名怎麼用，以及它把信任交給誰

「每個身分要有自己的 email」是 [怎麼維持多個網路身分](../basics/multiple-identities.md) 開出來的第一條要求，照字面執行會卡住：五個身分代表五個信箱、五組密碼、五組兩階段驗證，多數人開到第三個就放棄。郵件別名把要求降到可執行的程度，一個信箱底下產生任意多個對外地址，每個服務給一個，需要時單獨關掉。代價是往來紀錄集中到轉寄商手上。以下說明三種做法的差異、別名接不上的場合，以及台灣哪些情境用得上。開始之前可以先看 [威脅模型如何建立](../basics/threat-model.md)，確認自己在抗誰。

先劃清範圍。別名處理的是同一個地址在多個服務之間被串連，以及外洩之後查不出責任方。收件匣已經被詐騙信與釣魚信淹沒的話，別名幫不上忙，換一個地址也躲不掉已經流出去的名單，辨識與處置的做法在 [一般人平常該做到什麼](../scenarios/everyday-baseline.md)。

## 別名解決的三件事

### 減少服務之間的比對支點

[社群平台怎麼收集你的資料](../basics/platform-tracking.md) 裡列了一項擋不掉的比對：平台之間靠 email 與手機號互相對照，把你在不同服務的帳號串成同一個人。二十家服務收到二十個不同地址之後，email 這條線就對不起來了。手機號、[裝置與瀏覽器指紋](../basics/browser-fingerprinting.md)、通訊錄上傳仍然存在，別名只處理其中一條。

### 外洩可以指名道姓

[一般人平常該做到什麼](../scenarios/everyday-baseline.md) 的第一步是到 [Have I Been Pwned](https://haveibeenpwned.com/){target="_blank"} 查自己被哪幾次外洩波及。查得到事件，查不到是誰把地址流出去的。每個服務配一個獨立地址之後，垃圾信寄到哪個地址，就知道責任在哪一家。

舉個具體的用法。博客來、全聯 App、健身房會員各給一個別名，之後收到一封假冒某品牌、內容卻精準對得上你姓名與消費紀錄的詐騙信，看寄件地址就知道名單是哪一家流出去的，不必等對方自己公告。本尊地址永遠給不了。

### 撤銷不需要對方配合

關掉一個別名不必經過服務商同意，也不會通知對方。退訂鈕失效、客服不回、帳號刪不掉的時候，關別名是你單方面就能完成的動作，效果立刻生效。

常見的場面：報名一場活動之後被加進主辦方的長期電子報，信末的退訂連結指回一個要先註冊帳號才能操作的後台。關掉當初給出去的別名，比走完對方那套流程快得多。

## 三種做法

三種做法的技術門檻差很多。轉寄服務與信箱內建的別名註冊完就能用，自有網域那一種需要你能自己登入網域註冊商的後台改設定，沒有相關經驗的話看前兩種就好。

### 轉寄服務

由第三方營運，收到寄給別名的信之後轉進你原本的信箱。

[SimpleLogin](https://simplelogin.io/){target="_blank"} 由 Proton 營運、開源，免費方案給 10 個別名與 1 個收件信箱。付費方案每年 36 美元，解鎖無限別名、自有網域、catch-all（同一個網域底下的地址全部照收，見下一節），以及用你自己的金鑰把轉寄內容加密起來的 PGP 功能[^sl-pricing]。

[addy.io](https://addy.io/){target="_blank"}（前身 AnonAddy）開源，免費方案 10 個共用網域別名、每月 10 MB 轉寄流量，Lite 每月 1 美元、Pro 每月 3 美元。加密轉寄在所有方案都能用，把自己的公鑰貼進設定頁之後，轉寄商就讀不到內文。信件內容預設不留存，只有轉寄失敗且你自行開啟該選項時才會暫存[^addy-faq]。不留存的對象是信件內容，轉寄服務要運作就得知道哪個別名收到誰寄來的信，帳務與轉寄紀錄那一層的保留期間要另外看各家的隱私政策。

addy.io 也能自架，前提是你有能力維護一台郵件伺服器，官方文件要求自備裝好 Postfix（處理收發信的伺服器軟體）的機器，另提供 Docker 容器版本。沒有伺服器管理經驗就用官方託管的版本，功能一樣。

[Firefox Relay](https://relay.firefox.com/){target="_blank"} 由 Mozilla 營運，免費方案 5 個遮罩地址。付費分成兩級，Email Protection 解鎖無限遮罩與自訂子網域，再高一級的 Email & Phone Protection 才加上號碼遮罩。付費方案的供應範圍是 34 個國家與地區，涵蓋歐洲多國、美加、紐西蘭、新加坡與馬來西亞，台灣不在其中[^relay]。台灣使用者能用的就是免費的 5 個遮罩。

[DuckDuckGo Email Protection](https://duckduckgo.com/email/){target="_blank"} 免費、數量無限，地址落在 `@duck.com`，分成一個個人地址與隨機產生的私密地址兩種。除了轉寄，它會移除信件裡的追蹤像素（嵌在信件裡的一張看不見的圖片，用來回報你有沒有打開信件）。官方聲明轉寄過程不保存信件內容，連信件夾帶的寄件人與收件人欄位都不留[^ddg-privacy]。

Apple 的 Hide My Email 需要 iCloud+ 付費訂閱（iCloud 的付費方案）。它整合在 Safari 的表單自動填入、Mail 與「用 Apple 帳號登入」的流程裡[^apple-hme]，是三種轉寄服務裡操作最順的一個。代價是把身分綁在 Apple ID 底下，[怎麼維持多個網路身分](../basics/multiple-identities.md) 對第三方登入按鈕提出的警告同樣適用。

### 自有網域的 catch-all

三種做法裡門檻最高的一種，需要你能登入網域註冊商的後台修改 DNS 設定。沒有操作過的話跳過本節，前兩種已經夠用。

做法是自己註冊一個網域，把寄給該網域的信件全部收進同一個信箱，全部照收的設定就叫 catch-all。地址隨手編，`bank@example.com`、`shop@example.com` 不必事先建立就直接生效。

好處是不依賴任何轉寄商，對方停止營運或封鎖你的帳號都不會讓你失去全部地址。換信箱服務時，到當初買網域的平台的 DNS 設定頁面，把 MX 紀錄（指定某個網域的信要送去哪台伺服器的一項設定）改指向新服務就完成搬家。

兩個代價要先算清楚。

第一，catch-all 對還沒被使用的地址一律照收，機器人隨機猜測的地址寄來的信會全數落地，垃圾信量通常比原本的信箱高出一截。原本的困擾就是收件匣太吵的話，catch-all 會讓情況變糟。

第二，網域註冊資料（WHOIS）預設公開可查，註冊人姓名、地址與聯絡信箱都在裡面，等於把真名貼在所有別名旁邊。需要隱藏身分的話，註冊時務必加購註冊商提供的隱私保護，或改用預設就代為隱碼的註冊商，確認過再開始用。

### 信箱服務內建的別名

信箱或密碼管理器本身就附別名功能，例如 Fastmail 的 Masked Email、Proton Pass 內建的別名（底層即 SimpleLogin）與 iCloud+ 的 Hide My Email。設定成本最低，代價是別名與該服務綁在一起，離開時別名一併消失。

### 三種做法的取捨

| 面向 | 轉寄服務 | 自有網域 catch-all | 信箱內建 |
|---|---|---|---|
| 起步成本 | 註冊即用 | 買網域、改 DNS 設定 | 已有帳號就能用 |
| 誰看得到往來紀錄 | 轉寄商 | 你的信箱服務商 | 信箱服務商 |
| 搬家難度 | 換轉寄商等於換掉所有地址 | 改 MX 指向新服務 | 別名跟著帳號一起消失 |
| 被服務商擋掉 | 常見，共用網域被個別網站誤判 | 少見 | 視網域而定 |
| 別名彼此可連 | 隨機字串產生時不易連 | 同網域，可連 | 視產生方式而定 |
| 註冊資料是否公開 | 否 | 是，WHOIS 查得到註冊人姓名與地址 | 否 |
| 適合 | 一般日常帳號隔離 | 長期經營且能管 DNS 的人 | 已在該生態系內的使用者 |

## 加號子地址擋不住任何人

`you+shop@gmail.com` 常被當成免費的別名，實際上防護力接近零。加號後面那一段在郵件規格裡本來就定義成可有可無的備註，前面那一段才是真正的帳號[^rfc5233]。任何取得地址的人把加號後面刪掉，就還原出本尊 `you@gmail.com`。

實際會怎麼發生：你在蝦皮用 `you+shopee@gmail.com` 註冊，蝦皮的會員名單外洩後被整理轉賣，取得名單的人刪掉 `+shopee` 就得到你的正式地址。會賣名單與會被入侵的對象，正好是最有動機去刪的一方。

加號子地址適合的用途是收件分類與規則設定，把訂閱信自動歸檔進資料夾。拿它做身分隔離無效，[怎麼維持多個網路身分](../basics/multiple-identities.md) 那套分層需求它一項都滿足不了。

## 別名把往來紀錄集中到一家

改用轉寄之後，二十家服務各自只知道你的一個別名，轉寄商知道全部二十家是誰、每封信什麼時候到、以及沒有加密時的信件內容。信任的總量沒有變少，換了受託對象。

要壓縮轉寄商看得到的範圍，有幾種做法。addy.io 全方案與 SimpleLogin 付費方案支援用你自己的 PGP 公鑰加密轉寄內容，轉寄商就讀不到內文。前提是你已經有一組自己的 PGP 金鑰對並且保管得住私鑰，站上目前還沒有產生金鑰的教學，沒有金鑰的話這條路等於關著，改從司法管轄地與服務商的留存政策去挑，門檻低很多。收發雙方、時間與信件大小仍然留在轉寄商那裡，[Metadata 是什麼](../basics/metadata.md) 描述的外圍資訊照樣完整。DuckDuckGo 的做法是聲明連標頭都不保存，你信不信任該聲明是另一回事。自架 addy.io 把受託對象換成你自己，代價是自己維護郵件伺服器。

受託對象落在哪個司法管轄地也要算進去。SimpleLogin 的營運者 Proton 登記在瑞士[^sl-pricing]，addy.io 的服務條款以英格蘭與威爾斯法律為準據法、資料存放在荷蘭的伺服器[^addy-legal]，Mozilla 與 DuckDuckGo 都在美國。對手要透過司法途徑向轉寄商調資料時，走哪一國的程序、需要多久、你會不會被告知，差別都在這裡。

選擇之前先問自己抗的是誰。抗資料仲介與垃圾信，轉寄服務綽綽有餘。抗有能力對轉寄商調資料的對手，加密轉寄或自架才有意義，[威脅模型如何建立](../basics/threat-model.md) 有判斷流程。

### 別人主動寫信進來時，暴露的是對方

上面談的都是你去註冊服務時留下什麼。把別名當成公開的聯絡窗口、讓陌生人主動寫信進來，暴露的對象就換成寄信的那一方。轉寄商收到的是對方的原始寄件地址、寄信時間與來源 IP，你這端的別名反而是被保護的一邊。

替二十個消息來源各建一個別名也解決不了問題，因為二十個別名全部指向同一個信箱，轉寄商知道它們屬於同一個人。轉寄商被要求交出資料或本身遭到入侵時，二十個來源的關聯性會一次暴露給同一個對象。

需要對外掛一個公開收件窗口的話，郵件別名的位置是「比直接給主信箱好，比專為此設計的管道差」。完整取捨見 [記者保護消息來源](../scenarios/journalist.md)，該篇比較了 SecureDrop、Signal、Tor 上的隱蔽收件箱與 PGP 四種入口，也說明了消息來源不熟工具時該怎麼辦。

## 同一個網域底下的別名彼此可連

自有網域的 catch-all 換來獨立性，同時帶進一個容易被忽略的問題。`bank@example.com` 與 `dating@example.com` 共用一個網域，看到其中一個的人就知道另一個存在。再加上前面提過的公開註冊資料，以及有服務專門保存的網域設定變更歷史，整組地址可以連回同一個人。

抗垃圾信與外洩溯源時無所謂，做身分隔離時它會直接毀掉隔離。次要層要用自有網域的話，網域本身必須另外註冊、註冊人資料獨立、且不與長期層共用。同一個網域同時服務兩層，等於把兩層寫在同一張名片上。

## 別名接不上的場合

- **需要驗證身分的服務**：銀行、券商、電信、政府系統本來就掌握你的身分證字號與手機號（金融業把這套查驗稱為 KYC，認識你的客戶），別名在這些地方不提供身分隔離，能提供的只有外洩溯源
- **有強制力的對手**：法院命令、檢警調查或公司內部調查可以直接向轉寄商索取資料，別名擋不住。要看的是轉寄商在哪個司法管轄地、有沒有開加密轉寄，見上一節
- **被服務商擋掉**：轉寄服務的共用網域常被誤判為拋棄式信箱。SimpleLogin 為此設了回報管道，收到回報後逐一與網站聯繫要求解除封鎖，官方建議的繞法是改用自己的子網域或自有網域[^sl-block]。主流的 `disposable-email-domains` 封鎖清單有意區隔兩者，收錄的 8,347 個網域裡（2026-08-24 查）不含 `duck.com`、`addy.io`、`mozmail.com` 等轉寄網域。該專案要求提交者附上「該網域可產生拋棄式地址」的截圖才收[^ded]。擋人的是各家自訂的規則，不是這份公開清單
- **回信路徑**：直接在自己的信箱按回覆會露出真實地址。轉寄商的做法是給每個通信對象一組代寄地址（reverse-alias），你回信給它、它再用你的別名轉出去，位置在轉寄商的別名管理頁面，轉寄進來的信件裡通常也附了一個可直接回覆的地址
- **帳號救援**：拿別名當救援信箱的服務，別名一關就救不回帳號。關閉之前先確認沒有服務依賴它
- **轉寄商本身的存續**：服務停止營運或封鎖你的帳號時，共用網域的地址全部失效。長期經營的身分放自有網域比較安全

## 台灣的幾個實際情境

電子發票手機條碼申請時要填手機號與 email 兩項，email 收驗證信[^einvoice]。手機號在台灣已經實名，別名在這裡買不到身分隔離，買到的是「財政部系統外洩時我知道是它」。判準通用：對方已經握有你的實名資料時，別名的價值只剩溯源。

個資法 2025 修法給了個人更明確的查詢、更正、刪除權，以及向個保會申訴的管道（見 [台灣個資法 2025 修法](../taiwan/pdpa-2025.md)）。這些權利要行使得出來，前提是你說得出對象是誰。別名把「我的地址不知道被誰賣了」變成「這個地址只給過某某公司」，是行使權利時拿得出來的具體事證。

電商、外送、購票、健身房會員這類會發促銷信也會外洩的服務，每家一個別名收益最高。銀行、券商、報稅、健保這類需要長期穩定且不能失聯的服務，用本尊地址，別為了隔離讓自己收不到重要通知。

## 已經在用 Proton Mail 的話

台灣的公民團體用 Proton Mail 的比例不低，這批組織的起點跟前面預設的不同，手上已經有帳號，不必再去註冊一家轉寄服務。額度按方案分得很細，而且跟直覺相反的地方不只一處，以下拆開說明。

### 免費版就有 10 個別名

免費的 Proton 帳號附帶 Proton Pass，裡面的 hide-my-email 別名可以開 10 個，底層就是前面提過的 SimpleLogin。不必另外註冊 Proton Pass，同一組帳號登入就有[^proton-alias]。開的位置在 Proton Mail 網頁版右側的 Security Center（盾牌圖示），或 Proton Pass 的 App 與瀏覽器擴充功能，兩邊共用同一份額度。

加號子地址在所有方案都能用，而且不佔那 10 個額度。前面說過它擋不住任何人，拿來做收件分類仍然有效，兩者可以並用：別名給會外流的對象，加號地址給只需要分流歸檔的內部用途。

### 升級到最便宜的付費方案，別名不會變多

Mail Plus 的 hide-my-email 額度仍然是 10 個，與免費版相同。要無限別名得升到 Proton Unlimited，或單獨訂閱 Pass Plus[^proton-plans]。買 Mail Plus 換到的是信箱地址數與自有網域，別名數量原地不動。

付費方案配上自有網域之後可以設 catch-all，免費版不行[^proton-catchall]。代價與前面那節寫的一樣，垃圾信全數落地、網域註冊資料公開可查。

### 商務方案的入門檔反而沒有別名

組織買商務方案時最容易誤判的一點：**Mail Essentials 不含 Proton Pass**，等於不含 hide-my-email 別名[^proton-business]。它給的是每人 10 個信箱地址、3 個自有網域與 catch-all，別名功能完全不在裡面。組織升上商務方案之後，同仁能用的別名還是各自免費帳號附帶的那 10 個，組織層級沒有任何整合管理。

要在組織層級取得別名，路徑是 Workspace Standard 以上的整套方案，或單獨加購 Pass for Business（最低 3 席），兩者都給無限別名。

既有的獨立 SimpleLogin 帳號可以連結到 Proton 帳號。Proton 訂閱屬於 Unlimited、Proton for Business、Family 這幾種的話，連結後會自動升級成 SimpleLogin Premium，含無限別名、最多 5 個 catch-all 子網域與 PGP 加密轉寄。原本另外付費訂閱過 SimpleLogin Premium 的人記得取消，避免重複扣款[^proton-simplelogin]。

### 非營利折扣問得到價格，問不到規格

Proton 有非營利組織折扣，涵蓋 Mail、Drive、VPN、Pass 的商務版。官方頁面只寫「registered nonprofit organizations with proper documentation」，沒有指名國家、沒有指定認證機構、也沒有公布折扣幅度，全部要聯絡業務才拿得到報價[^proton-nonprofit]。台灣立案的團體符不符合資格，公開資訊答不出來，需要直接去問。

折扣影響的是價格，不改變別名功能的規則。洽談時要確認的是最後買到哪一個方案，Mail Essentials 打折之後仍然沒有別名。

### 人員流動的兩個坑

小型組織常見的做法是全體共用一組帳密。這種情況下 10 個別名全部掛在同一組帳號上，沒有分權限機制，交接時的風險等同交接整個信箱。

用 Pass for Business 的組織要注意金庫歸屬。共享金庫的擁有者刪除自己的 Proton 帳號時，該金庫連同裡面所有項目一併刪除，被分享的人也拿不回來[^proton-vault]。官方文件沒有寫明員工被管理員移除帳號時，他個人金庫裡建的別名會怎麼處理。組織共用用途的別名一律建在共享金庫，不要讓個別同仁用自己的個人金庫建，導入前先實測一次離職流程。

## 撤銷一個別名的流程

底下的流程針對某個服務的通知信箱，不涵蓋你長期對外公開的主要地址。已經印在名片、網站與報名表單上多年的組織聯絡信箱，換掉的成本落在找不到你的人身上，屬於改變對外聯絡方式，要另外規劃公告與並行期，別套用底下的步驟。

順序錯了會把自己鎖在門外，四個步驟照做：

1. 先查有沒有其他服務拿它當救援信箱或兩階段驗證的備援管道。查法是在信箱裡搜尋這個地址收過的驗證信與密碼重設信，寄件方就是依賴它的服務，逐一登入把聯絡地址換掉
2. 到該服務把帳號地址改成新別名，完成驗證信確認新地址真的收得到
3. 回轉寄商把舊別名設成停用，不要刪除。停用的別名繼續擋住寄信，刪除之後共用網域的字串有機會被別人重新註冊
4. 自有網域的話，到信箱服務的收件規則設定加一條把該地址丟進垃圾桶，catch-all 不會因為你不再使用就停止接收

[家暴倖存者的數位準備](../scenarios/domestic-violence.md) 描述的離開後重建身分，用得上同一套流程。停用一個別名不會產生任何通知，對方看到的現象是信件退回，看不到你在什麼時候做了什麼。

## 怎麼開始

不必一次處理完所有帳號。先開一個轉寄服務的帳號，門檻最低的是 DuckDuckGo Email Protection，免費、數量不限、不需要填付款資訊。接著挑一家最常寄促銷信的電商，把帳號的通知信箱換成新產生的別名，觀察兩週。

習慣之後照 [一般人平常該做到什麼](../scenarios/everyday-baseline.md) 的順序，趁密碼管理器逐站更換密碼時順手把地址一起換掉。

產生別名的部分可以交給密碼管理器。開源密碼管理器 Bitwarden 的使用者名稱產生器內建六家轉寄服務的整合：SimpleLogin、addy.io、Firefox Relay、Fastmail、Forward Email、DuckDuckGo[^bw-gen]。其中 Forward Email 是另一家開源轉寄服務，前面沒有單獨介紹。

設定時要先到轉寄服務的帳號設定頁面，找「API」或「開發者」分類產生一組金鑰，貼進 Bitwarden。之後新增登入項目時就能直接產生別名並存進金庫，操作位置見 [密碼管理器入門](./password-manager.md)。

金庫本身要備份好。別名散在各處而你只記得幾個的狀況下，金庫是唯一一份「哪個地址對應哪個服務」的完整索引，弄丟它等於失去對自己身分的盤點能力。備份與復原的具體做法見 [密碼管理器入門](./password-manager.md) 的「備援與恢復策略」一節。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-account-multiple-outline: 怎麼維持多個網路身分](../basics/multiple-identities.md)
- [:material-chat-question: Metadata 是什麼](../basics/metadata.md)
- [:material-key-variant: 密碼管理器入門](./password-manager.md)
- [:material-shield-account-outline: 社群平台怎麼收集你的資料](../basics/platform-tracking.md)
- [:material-newspaper-variant-outline: 記者保護消息來源](../scenarios/journalist.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-shield-lock-outline: 個人隱私指引研究專題](../community/privacy-guide.md)
- [:material-lifebuoy: 緊急求救](../help/index.md)
- [:material-translate-variant: 中文化與文件翻譯](../community/i18n.md)

</div>

[^sl-pricing]: [SimpleLogin Pricing](https://simplelogin.io/pricing/){target="_blank"} - 免費與付費方案的別名數、信箱數、自有網域與 PGP 支援範圍在此頁。
[^addy-faq]: [addy.io FAQ](https://addy.io/faq/){target="_blank"} - GPG 加密轉寄的方案範圍、自架所需的 Postfix 設定與信件留存政策在此頁。方案限額見 [addy.io 首頁](https://addy.io/){target="_blank"}。
[^addy-legal]: [addy.io Terms](https://addy.io/terms/){target="_blank"} 與 [Privacy](https://addy.io/privacy/){target="_blank"} - 準據法為英格蘭與威爾斯法律，資料存放於荷蘭的伺服器，兩項分別寫在這兩頁。
[^relay]: [Firefox Relay](https://relay.firefox.com/){target="_blank"} - Mozilla，免費方案 5 個遮罩與付費方案的供應國家清單在此頁。
[^ddg-privacy]: [Does DuckDuckGo save my email messages?](https://duckduckgo.com/duckduckgo-help-pages/email-protection/privacy/does-duckduckgo-save-my-messages){target="_blank"} - DuckDuckGo 說明頁，不保存信件與標頭的說明在此頁。地址型態見 [Duck Addresses](https://duckduckgo.com/duckduckgo-help-pages/email-protection/duck-addresses){target="_blank"}。
[^apple-hme]: [Set up and use Hide My Email in iCloud+](https://support.apple.com/guide/icloud/set-up-hide-my-email-mm9d9012c9e8/icloud){target="_blank"} - Apple Support，需要 iCloud+ 訂閱與可產生地址的位置在此頁。
[^rfc5233]: [RFC 5233: Sieve Email Filtering: Subaddress Extension](https://www.rfc-editor.org/rfc/rfc5233.html){target="_blank"} - IETF 的郵件規格文件，把加號前的部分定名為 user、加號後的部分定名為 detail。
[^sl-block]: [Report blocking website](https://simplelogin.io/docs/report-blocking-website/){target="_blank"} - SimpleLogin 文件，回報流程與改用自有網域的建議在此頁。
[^ded]: [disposable-email-domains](https://github.com/disposable-email-domains/disposable-email-domains){target="_blank"} - 社群維護的拋棄式信箱網域清單，提交新網域需附上可產生拋棄式地址的截圖。
[^einvoice]: [手機條碼申請](https://www.einvoice.nat.gov.tw/accounts/signup/mw){target="_blank"} - 財政部電子發票整合服務平台，手機號與 email 兩項驗證流程在此頁。
[^proton-alias]: [Hide-my-email aliases](https://proton.me/support/pass-email-alias){target="_blank"} - Proton 支援文件，免費方案與 Mail Plus 各 10 個、Pass Plus 與 Unlimited 無限，以及建立別名的介面位置在此頁。
[^proton-plans]: [Proton plans](https://proton.me/support/proton-plans){target="_blank"} - Proton 支援文件的方案對照表，各方案的信箱地址數與 hide-my-email 額度在此頁。
[^proton-catchall]: [Catch-all addresses](https://proton.me/support/catch-all){target="_blank"} - Proton 支援文件，catch-all 需搭配自有網域且限付費方案。
[^proton-business]: [Proton for Business](https://proton.me/support/proton-for-business){target="_blank"} - Proton 支援文件，Mail Essentials 的地址數與自有網域數，以及 Proton Pass 只在 Workspace 與 Pass for Business 方案的分野在此頁。
[^proton-simplelogin]: [Link your SimpleLogin account to your Proton Account](https://proton.me/support/link-simplelogin-account-proton-account){target="_blank"} - Proton 支援文件，自動升級的方案清單、SimpleLogin Premium 的內容與重複扣款提醒在此頁。
[^proton-nonprofit]: [Nonprofit discount](https://proton.me/business/nonprofit-discount){target="_blank"} - Proton 商務方案的非營利折扣頁，資格敘述與需聯絡業務取得報價在此頁。
[^proton-vault]: [Share vaults in Proton Pass](https://proton.me/support/pass-browser-share){target="_blank"} - Proton 支援文件，共享金庫擁有者刪除帳號會連帶刪除整個金庫的說明在此頁。
[^bw-gen]: [Username Generator](https://bitwarden.com/help/generator/){target="_blank"} - Bitwarden 說明文件，六家轉寄服務的整合清單在此頁。
