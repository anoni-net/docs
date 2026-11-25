---
title: 社群平台的隱私設定
description: 同事、前任、家人與陌生人，跟你用的是同一個平台。本頁整理 LINE、Facebook、Instagram、Threads 上決定別人能不能找到你、看得到你什麼的設定，加上 Facebook 社團的管理方式，以及建立帳號時就該避開的串連點。
icon: material/account-eye-outline
---

# :material-account-eye-outline: 社群平台的隱私設定

用社群平台時要防的對象有兩種，一種是平台本身，另一種是同一個平台上的其他人：同事、前任、家人，或者有你電話號碼的陌生人[^ssd-sn]。平台收集哪些資料見 [社群平台怎麼收集你的資料](../basics/platform-tracking.md)，本頁處理後者，整理台灣常用的 LINE、Facebook、Instagram、Threads 上，決定別人能不能找到你、看得到你什麼的設定。

預設值通常偏向公開，值得逐項檢查的有三件事：貼文給誰看、別人能不能用電話號碼或 email 找到你，以及位置有沒有自動分享出去[^ssd-sn]。

本頁依 EFF Surveillance Self-Defense 的〈Protecting Yourself on Social Networks〉與〈Facebook Groups: Reducing Risks〉改寫，各平台的選單名稱依官方說明中心的正體中文（出處見[本頁的來源與核對](#本頁的來源與核對)）。

!!! tip "時間有限的話，先看這幾點"

    - LINE：關閉「允許利用ID加入好友」與「允許被加入好友」，不想讓通訊錄裡的人看到你，再關閉「自動加入好友」
    - Facebook：把未來貼文的分享對象改成朋友，關閉用電話號碼與 email 找到你
    - Instagram 與 Threads：改成私人帳號，標註改成需要你同意
    - 不同用途的帳號，頭像與電話號碼都不要重複

## 建立帳號時

帳號建立之後，最容易把你跟其他帳號串在一起的是電話號碼、email 與照片[^ssd-sn]：

- **名字**：部分平台的實名規定已經放寬，不想用本名就不要用。想用暱稱時，先想一下認得這個暱稱的有哪些人[^ssd-sn]
- **電話號碼與 email**：只給必要的資料。想跟主要身分分開的帳號，用另一個 email，能不給電話就不給。email 別名可以替每個帳號產生不同的地址，見 [郵件別名怎麼用](./email-alias.md)。別名服務看得到經過它的信，等於多信任一家業者[^ssd-sn]
- **頭像**：照片的 metadata 可能有拍攝時間與地點，畫面本身也會透露資訊，例如家門口、公司、門牌、路標，連玻璃上的反射都可能認出地點[^ssd-sn]
- **密碼提示問題**：「出生的城市」、「寵物的名字」這類答案常常能從你的貼文找到。可以填一個假答案，存在密碼管理器的備註欄[^ssd-sn]（見 [密碼管理器入門](./password-manager.md)）
- **登入保護**：每個平台都用不重複的強密碼，開啟兩步驟驗證[^ssd-sn]

想讓兩個帳號分開，兩邊的頭像要用沒在其他地方出現過的照片。可以用以圖搜圖檢查一張照片還出現在哪裡，也可以用 username 檢查服務找出自己忘記的舊帳號[^ssd-sn]。找到不想公開的資料時，一次處理一筆即可，不必一口氣把自己從網路上清掉[^ssd-sn]。分層經營帳號的完整做法見 [怎麼維持多個網路身分](../basics/multiple-identities.md)。

新興的社群平台在安全、隱私與檢舉工具上可能比較陽春，隱私政策也比較常改。Mastodon 這類聯邦式的平台運作方式不同，貼文可能被複製到其他伺服器，要用另一套方式思考隱私[^ssd-sn]。

## LINE

LINE 的隱私設定集中在「主頁 > 設定」底下，多數要在手機上操作，電腦版與平板只有部分選項。2026 年 10 月改版後，好友分頁移到「聊天」頁的上方[^line-ui]。

### 用 ID 或電話號碼加你

- **允許利用ID加入好友**：主頁 > 設定 >「個人檔案」，關閉之後，包含好友在內，沒有人可以用 LINE ID 搜尋到你。LINE ID 設定之後就不能更改[^line-add]
- **允許被加入好友**：主頁 > 設定 >「好友」，關閉之後，有你電話號碼的人無法用號碼加你[^line-add]
- **行動條碼與邀請連結**：給過別人的 QR code 與連結會一直有效，到「聊天 > ＋ > 顯示行動條碼」按「更新」，舊的才會失效[^line-add]

### 通訊錄與「您可能認識的人？」

「自動加入好友」在主頁 > 設定 >「好友」，開啟之後，LINE 會把你手機通訊錄裡有用 LINE 的人加成你的好友，通訊錄也會上傳到 LINE 的伺服器比對（官方說明號碼加密保存，不會顯示給其他使用者）[^line-contacts]。

只關「允許被加入好友」還不夠。你的「自動加入好友」如果開著，通訊錄裡存了你號碼的人，仍然可能在他的「您可能認識的人？」名單看到你，顯示的是你在 LINE 上設的名稱[^line-pymk]。不想讓前任或同事從通訊錄找到你，兩個開關都要關。LINE 的說明也寫明，要讓自己完全不出現在別人的好友或「您可能認識的人？」名單，只能刪除帳號[^line-contacts]。

### 非好友的訊息與群組邀請

- **阻擋訊息**：主頁 > 設定 >「隱私設定」，開啟之後不會收到「您可能認識的人？」名單上的人傳來的訊息，已經是好友的人不受影響[^line-block]
- **未讀聊天邀請**：非好友的訊息與群組邀請集中在「聊天」頁上方的「未讀聊天邀請」，可以逐一加入好友、封鎖、接受或拒絕群組邀請。LINE 沒有拒絕所有群組邀請的設定，也沒辦法封鎖一個群組，只能退出，退出時所有成員都會看到你已退出[^line-invite][^line-group]

### 個人檔案與生日

好友點你的頭像就看得到你的個人圖片、名稱、封面、狀態消息與生日，LINE 沒有分項設定誰可以看哪一欄[^line-profile]。生日在主頁 > 設定 >「個人檔案」>「生日」，關閉「顯示我的生日」之後別人就看不到[^line-profile]。

LINE VOOM 在台灣已於 2026 年 9 月 30 日結束服務，貼文、限時動態與追蹤功能都一起停止，網路上教 VOOM 公開範圍的文章已經不適用[^line-voom]。

### 隱藏、封鎖與已讀

在好友名單長按對方，可以選「隱藏」、「封鎖」或「刪除」。隱藏之後仍然會收到對方的訊息與通話，封鎖之後收不到。三種操作都不會通知對方，你也不會從對方的好友名單消失。被封鎖的人在你們共同的群組裡發的訊息，你仍然看得到[^line-hide]。

LINE 沒有關閉已讀的設定。對方的通知跳出時，系統就可能判定為已讀，群組裡顯示的是已讀的人數[^line-read]。

### 社群用另一個個人檔案

LINE 社群（OpenChat）可以不公開你的 LINE 帳號名稱加入，每個社群可以設定不同的暱稱與圖片[^line-openchat]。想在興趣社群裡發言、又不想讓人連到你的主要帳號，就在加入時換一個個人檔案，頭像也不要沿用主要帳號的照片。

### 密碼鎖定與其他裝置

- **密碼鎖定**：主頁 > 設定 >「隱私設定」，開啟之後打開 LINE 要輸入密碼，可以搭配 Face ID 或指紋。忘記密碼只能重裝 App，沒備份的聊天記錄會消失[^line-lock]
- **允許自其他裝置登入**：主頁 > 設定 >「我的帳號」，控制電腦與平板能不能用你的帳號登入。同一頁的「登入中的裝置」可以看到目前登入的裝置，逐一登出或全部登出[^line-devices]。家人或伴侶可能在你不知情時登入電腦版，定期檢查這份清單

## Facebook

Facebook 的設定都從右上角的大頭貼照進入「設定和隱私 > 設定」，大部分在「分享對象和能見度」底下。下面的路徑依 Facebook 說明中心的電腦版說明，手機 App 的位置相近。Facebook 也有「隱私設定檢查」，用問答的方式一步步檢查分享對象與別人如何找到你，第一次調整時可以從那裡開始[^fb-checkup]。

### 貼文的分享對象

- **往後的貼文**：設定 > 分享對象和能見度 >「貼文」>「誰可以查看你往後的貼文？」，改成「朋友」。發文時也可以逐則調整[^fb-future]
- **舊貼文**：同一頁的「限制舊貼文分享對象」會把所有公開或朋友的朋友可見的舊貼文一次改成「朋友」，無法一鍵復原。別人發文標註你的貼文不受影響，由發文的人決定[^fb-past]
- **打卡**：打卡的地點跟著那則貼文的分享對象。公開的打卡貼文，地點粉絲專頁的管理員也看得到[^fb-checkin]

### 別人如何找到你

- **用電話號碼與 email 找到你**：分享對象和能見度 >「其他人如何尋找和聯絡你」，「擁有你電子郵件地址的用戶」與「擁有你手機號碼的用戶」兩列都改成「沒有人」。說明中心寫明，email 地址裡如果含有你的全名，仍可能被搜到[^fb-lookup]
- **搜尋引擎**：同一頁關閉「是否要讓 Facebook 以外的搜尋引擎連結你的個人檔案？」。已經公開的資訊仍可能被搜尋引擎另外收錄[^fb-search]
- **朋友名單**：同一頁的「誰可以查看你的朋友名單？」預設是公開，可以改成只限本人。朋友把自己的名單設為公開時，你們的朋友關係仍然看得到[^fb-friends]
- **個人資料**：個人檔案 >「關於」>「聯絡和基本資料」，工作經歷、學歷、感情狀況、家庭成員、地點與生日可以逐欄設定公開、朋友或只限本人[^fb-about]

### 標註與上線狀態

- **標籤檢閱**：分享對象和能見度 >「個人檔案和標籤」，開啟「檢閱其他人對你貼文新增的標籤」與「檢閱你被標註在內的貼文」，別人標註你之後要你同意才會顯示在你的個人檔案上。被標註的貼文仍可能出現在搜尋與動態消息[^fb-tagreview][^fb-timeline]
- **上線狀態**：Facebook 與 Messenger 要分別關閉，只關一邊，另一邊仍可能顯示你在線上。關閉之後你也看不到別人的上線狀態[^fb-active]

Facebook 另有「鎖住個人檔案」，鎖住之後非朋友只看得到有限的內容，但說明中心寫明只開放部分國家或地區，在台灣能否使用請以你的 App 為準[^fb-lock]。

### Facebook 社團

許多倡議與社區組織用 Facebook 社團聯絡，但社團的設計不是為了安全協作，Facebook 本身看得到所有內容，也可能收到政府要求交出內容或成員資料[^ssd-fbg]。話題敏感的話，可以考慮改用端對端加密的工具（見 [匿名通訊工具比較](./messaging-comparison.md)），成員無法離開 Facebook 時，下面幾點可以降低風險[^ssd-fbg]。

- **公開或私密**：公開社團的貼文所有人都看得到，私密社團只有成員看得到貼文與成員名單，管理員可以再選擇「開放搜尋」或「隱藏」。私密社團設為開放搜尋時，管理員與版主是誰所有 Facebook 使用者都看得到，設為隱藏才只有成員與受邀的人看得到[^fb-groups]
- **改成私密的限制**：公開社團要改成私密，限成員少於 10,000 人或成立不滿 30 天[^fb-groups]，所以建立前就要想好社團的主題、誰該知道它的存在、成員想不想讓別人知道自己加入[^ssd-fbg]
- **用暱稱發文**：其他成員看不到你的主要個人檔案，管理員、版主與 Facebook 系統仍然看得到你的姓名與大頭貼照[^fb-anon]
- **社團規則**：截圖與轉傳在技術上擋不掉，可以在社團說明寫明不得截圖外流，違反者移出社團[^ssd-fbg]
- **管理員**：至少要有兩位管理員，最好其中一位用本名。Facebook 要求使用真實身分，用假名的管理員可能被檢舉停權，社團的管理權會因此轉到其他人手上[^ssd-fbg]
- **移出與封鎖**：只有管理員可以移除成員。不想讓退出的人再看到社團，要封鎖對方，暫時處理可以先停權[^ssd-fbg]
- **另外保存成員名單**：Facebook 可能刪除違反規定的社團，討論紀錄與成員名單會一起消失。沒有另外留存聯絡方式，就無法再聯繫社群[^ssd-fbg]

## Instagram

我們沒能從官方說明中心取得 Instagram 正體中文介面的選單名稱，下面依英文版說明描述功能，實際名稱以你的 App 為準。

- **私人帳號**：在設定的帳號隱私開啟私人帳號，只有你核准的追蹤者看得到貼文與限時動態。未滿 18 歲的帳號預設就是私人帳號，商業帳號不能設成私人帳號[^ig-private]
- **摯友**：限時動態可以只分享給摯友名單，加入或移出名單都不會通知對方[^ig-close]
- **已讀**：可以對所有聊天室或單一聊天室關閉已讀回條，單一聊天室的設定優先[^ig-read]
- **地圖**：Instagram 的地圖功能預設不分享位置。開啟之後，每次打開 App 會更新位置，分享對象在地圖的設定裡選擇，這個設定跟手機的定位權限分開[^ig-map]
- **標註與提及**：可以限制誰能標註或提及你[^ig-tags]

## Threads

Threads 也一樣，我們沒能取得正體中文的選單名稱，下面依官方說明描述功能。

- **名稱、大頭貼照、使用者名稱與自我介紹一律公開**，在 Threads 以外與 Facebook 等 Meta 的產品上都看得到，改成私人個人檔案也一樣[^threads-private]
- **私人個人檔案**：只有你核准的追蹤者，以及你回覆過的人，看得到你的貼文，別人也不能把你的貼文分享到 Instagram 或 Facebook 的限時動態[^threads-private]
- **聯邦宇宙分享**：開啟之後，Mastodon 等其他伺服器的使用者可以搜尋、追蹤、轉分享你的貼文。改回私人個人檔案會關閉分享，並要求其他伺服器刪除你的資料，但不保證都會刪除[^threads-fedi]

## 朋友之間的隱私

保護隱私是朋友之間互相的事。即使你沒有帳號，或者把自己的標註拿掉，朋友仍然可能在照片裡認出你、透露你在哪裡、公開你們的關係[^ssd-sn]。可以跟朋友談好哪些事不要貼出來，例如聚會的地點、合照裡有誰、孩子的照片。家人與伴侶共用裝置或帳號時的狀況，另見 [家暴受害者的數位準備](../scenarios/domestic-violence.md)。

各平台的設定會隨改版變動，有時變得更保護隱私，有時把原本不公開的資訊變成公開，或者多出新的開關，平台公告隱私政策更新時值得回來檢查一次[^ssd-sn]。

## 本頁的來源與核對

本頁依 EFF [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"} 的兩篇指南改寫，兩篇都以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hant){target="_blank"} 授權：

- 〈[Protecting Yourself on Social Networks](https://ssd.eff.org/module/protecting-yourself-social-networks){target="_blank"}〉，審閱日 2023-10-13
- 〈[Facebook Groups: Reducing Risks](https://ssd.eff.org/module/facebook-groups-reducing-risks){target="_blank"}〉，審閱日 2023-10-13

跟原文不同的地方：原文以通則說明各平台常見的設定，本頁改成 LINE、Facebook、Instagram、Threads 逐項的設定，選單名稱與功能依 LINE 支援中心（台灣）、Facebook 說明中心（正體中文）與 Instagram 說明中心（英文）。Facebook 社團的設定以 2026 年的說明中心為準，例如公開社團改成私密的門檻已經從原文的 5,000 名成員改成 10,000 名。原文建議讀隱私政策、封鎖第三方 cookie 與關閉廣告識別碼的段落，文件站已經寫在 [社群平台怎麼收集你的資料](../basics/platform-tracking.md) 與 [手機隱私設定逐步指引](./phone-privacy-settings.md)，本頁不重複。與原文不同之處由匿名網路社群 anoni.net 負責，不代表 EFF 的立場。

選單名稱 2026 年 11 月核對。平台改版頻繁，照著做卻找不到選項，歡迎到社群的線上聊天室（[Matrix 公開 room](https://anoni.net/services/){target="_blank"}）告訴我們。

## 相關閱讀

- [社群平台怎麼收集你的資料](../basics/platform-tracking.md)：平台本身取得哪些資料
- [怎麼維持多個網路身分](../basics/multiple-identities.md)：帳號分層與外部觀察者的反查手法
- [手機隱私設定逐步指引](./phone-privacy-settings.md)：App 的位置、通訊錄與照片權限
- [Signal 的設定與群組管理](./signal-guide.md)：敏感的對話與群組改用端對端加密

[^ssd-sn]: [Protecting Yourself on Social Networks](https://ssd.eff.org/module/protecting-yourself-social-networks){target="_blank"} - EFF Surveillance Self-Defense，審閱日 2023-10-13。
[^ssd-fbg]: [Facebook Groups: Reducing Risks](https://ssd.eff.org/module/facebook-groups-reducing-risks){target="_blank"} - EFF Surveillance Self-Defense，審閱日 2023-10-13。
[^line-ui]: [LINE頁面更新相關說明](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=200001630){target="_blank"} - LINE 支援中心。
[^line-add]: [拒絕被加入好友](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20000383){target="_blank"} - LINE 支援中心。
[^line-contacts]: [使用通訊錄資料的相關說明](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=10002423){target="_blank"} - LINE 支援中心。
[^line-pymk]: [顯示在「您可能認識的人？」名單的條件](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20000382){target="_blank"} - LINE 支援中心。
[^line-block]: [如何避免被不認識的人邀請加入聊天室或群組？](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20027010){target="_blank"} - LINE 支援中心。
[^line-invite]: [如何管理來自非好友用戶的邀請？](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=200002115){target="_blank"} - LINE 支援中心。
[^line-group]: [退出／刪除／封鎖群組的操作方法](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20000420){target="_blank"} - LINE 支援中心。 <!-- docs-style-lint: disable-line -->
[^line-profile]: [個人檔案的基本說明](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20000134){target="_blank"} - LINE 支援中心。
[^line-voom]: [【結束服務】LINE VOOM結束服務公告](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=200000301){target="_blank"} - LINE 支援中心，更新日 2026-11-02。
[^line-hide]: [隱藏好友、封鎖好友與刪除好友的基本說明](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20000390){target="_blank"} - LINE 支援中心。
[^line-read]: [聊天訊息傳送狀況及已讀／未讀的確認方法](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20021705){target="_blank"} - LINE 支援中心。 <!-- docs-style-lint: disable-line -->
[^line-openchat]: [社群的基本設計說明（社群成員用）](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20005375){target="_blank"} - LINE 支援中心。
[^line-lock]: [如何設定LINE的密碼鎖定功能？](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20023658){target="_blank"} - LINE 支援中心。
[^line-devices]: [如何確認自己在哪些裝置上登入LINE或LINE相關服務？](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20008468){target="_blank"} - LINE 支援中心。另見[允許自追加裝置（電腦／平板電腦）登入的設定變更方法](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20000112){target="_blank"}。 <!-- docs-style-lint: disable-line -->
[^fb-checkup]: [Facebook 隱私設定檢查](https://www.facebook.com/help/443357099140264?locale=zh_TW){target="_blank"} - Facebook 說明中心。
[^fb-future]: [設定 Facebook 貼文的預設分享對象](https://www.facebook.com/help/336801584336688?locale=zh_TW){target="_blank"} - Facebook 說明中心。
[^fb-past]: [選擇可以看到您先前 Facebook 貼文的對象](https://www.facebook.com/help/236898969688346?locale=zh_TW){target="_blank"} - Facebook 說明中心。
[^fb-checkin]: [如何使用 Facebook 在附近地點打卡](https://www.facebook.com/help/174846215904356?locale=zh_TW){target="_blank"} - Facebook 說明中心。
[^fb-lookup]: [控制 Facebook 能根據您的電子郵件地址或手機號碼向誰建議您的個人檔案](https://www.facebook.com/help/131297846947406?locale=zh_TW){target="_blank"} - Facebook 說明中心。
[^fb-search]: [如果不想要搜尋引擎連結你的 Facebook 個人檔案，該怎麼做](https://www.facebook.com/help/124518907626945?locale=zh_TW){target="_blank"} - Facebook 說明中心。
[^fb-friends]: [調整誰能在 Facebook 看到您的「朋友」區塊](https://www.facebook.com/help/115450405225661?locale=zh_TW){target="_blank"} - Facebook 說明中心。
[^fb-about]: [如何編輯 Facebook 個人檔案資料及其分享對象](https://www.facebook.com/help/276177272409629?locale=zh_TW){target="_blank"} - Facebook 說明中心。
[^fb-tagreview]: [檢閱用戶在您 Facebook 貼文新增的標籤](https://www.facebook.com/help/247746261926036?locale=zh_TW){target="_blank"} - Facebook 說明中心。
[^fb-timeline]: [在您被標註的貼文出現在您的個人檔案中之前先行查看](https://www.facebook.com/help/168229546579373?locale=zh_TW){target="_blank"} - Facebook 說明中心。
[^fb-active]: [Facebook 和 Messenger 上線狀態的運作方式](https://www.facebook.com/help/448141485230424?locale=zh_TW){target="_blank"} - Facebook 說明中心。
[^fb-lock]: [鎖住您的 Facebook 個人檔案](https://www.facebook.com/help/196419427651178?locale=zh_TW){target="_blank"} - Facebook 說明中心。
[^fb-groups]: [公開與私密 Facebook 社團的差異](https://www.facebook.com/help/220336891328465?locale=zh_TW){target="_blank"} - Facebook 說明中心。
[^fb-anon]: [在 Facebook 社團中使用暱稱參與互動](https://www.facebook.com/help/1997112804420300?locale=zh_TW){target="_blank"} - Facebook 說明中心。
[^ig-private]: [Make your Instagram account private](https://help.instagram.com/448523408565555){target="_blank"} - Instagram Help Center。
[^ig-close]: [Close Friends](https://help.instagram.com/476003390920140){target="_blank"} - Instagram Help Center。
[^ig-read]: [Read receipts](https://help.instagram.com/1586876252167004){target="_blank"} - Instagram Help Center。
[^ig-map]: [Instagram Map](https://help.instagram.com/402343555458995){target="_blank"} - Instagram Help Center。
[^ig-tags]: [Who can mention or tag you on Instagram](https://help.instagram.com/345505572238391){target="_blank"} - Instagram Help Center。
[^threads-private]: [Public and private profiles on Threads](https://help.instagram.com/756440792648838){target="_blank"} - Threads Help Center。
[^threads-fedi]: [Fediverse sharing on Threads](https://help.instagram.com/760878905943039){target="_blank"} - Threads Help Center。
