---
title: 家暴受害者的數位準備
description: 家暴離開前後的數位界線重建：共用裝置、雲端定位、追蹤類 App、求助管道的對外不留痕跡。對台灣讀者搭配 113 保護專線、保護令申請、現代婦女基金會等在地資源。
icon: material/shield-account-outline
---

# :material-shield-account-outline: 家暴受害者的數位準備

!!! warning "人身安全永遠優先"

    如果情況急迫，請先撥打 `110` 或 `113` 求助，再回頭看本頁。這頁不取代專業協助。

家暴情境的數位風險，多半不是來自高明的技術攻擊。加害者擁有共用裝置、共用帳號、家庭方案的存取權，知道你的密碼，看過你解鎖手機。防得住陌生人的措施，防不住一個看過你輸入 PIN 的人。

本頁說明各個管道怎麼運作、怎麼在不驚動對方的前提下確認自己的處境，以及重建獨立數位身分的順序。整篇最重要的一句話寫在前面：**偵測與移除是兩個不同的決定**，第二個決定要放進安全計畫裡再做。

要先理解風險為什麼存在，可以回頭看 [威脅模型如何建立](../basics/threat-model.md) 與 [Metadata 是什麼](../basics/metadata.md)。緊急應對的整體清單見 [緊急求救](../help/index.md)。

## 科技濫用的實際管道

這些手法多半不需要特殊技術。它們用的是為家庭與伴侶設計的一般消費性功能，反過來對付家裡的某一個人。

### 帳號存取與共用方案

- **知道或猜得到的密碼**：親密伴侶往往已經知道或猜得出你的信箱、手機解鎖與網銀密碼
- **共用的 Apple ID 或 Google 帳號**：以「家庭方便」為名的安排，代表訊息、照片、瀏覽紀錄與聯絡人會自動同步到對方手上的裝置。iCloud 與 Google Drive 預設就會備份這些
- **家庭方案**：Apple 家人共享與電信的家庭方案會暴露購買紀錄、App 安裝紀錄，有時還有位置。Google Family Link 原本是給家長管理未成年子女的，帳號管理者握有直接的控制權與位置可見度，用在成年人身上就成了監控工具
- **救援管道**：密碼重設信寄到共用手機號碼或共用信箱，代表你就算改了密碼，對方仍然拿得回存取權

### 位置追蹤

- **尋找（Find My）與 Google 地圖的位置分享**：當初以「彼此都知道對方在哪」為由開啟的分享會一直持續，對方看得到你的即時位置，而且不會再有任何通知
- **藍牙追蹤器**：AirTag、Tile 或類似裝置放進包包、車內或孩子的物品裡就能持續回報位置。2024 年 5 月起 Apple 與 Google 推出跨平台的共同標準，iPhone 與 Android 都能在偵測到不明追蹤器長時間跟著你時發出警示[^2]。iPhone 會自動偵測相容的追蹤器，Android 可以用內建的「不明追蹤器警示」或 Apple 的 Tracker Detect App
- **車聯網 App**：許多車款有對應的 App，掌握帳號的人看得到車輛即時位置與行程紀錄
- **共用日曆與照片的地理標記**：共用日曆會透露你接下來會在哪裡。照片上傳或同步時經常帶著 GPS 座標，足以定位一個原本以為保密的新住處

### 裝置上的追蹤類 App

追蹤類 App（stalkerware，也稱 spouseware）通常在對方短暫取得你的手機時安裝，之後暗中把訊息、通話紀錄、照片、瀏覽行為與位置轉發出去[^3]，而且可以完全不顯示圖示。

可能的跡象包括電池比平常快沒電、待機時機身發熱、無法解釋的數據用量，或裝置行為異常。這些都不是確定的證據，**最可靠的訊號往往是對方知道了他不該知道的事**[^4]。

### 智慧家庭與共用裝置

- **智慧鎖、攝影機、門鈴與溫控**：掌握控制帳號的人看得到攝影機畫面、知道門什麼時候開，也可以把你鎖在外面。分居之後這些裝置經常還連在對方的帳號上
- **語音助理**：共用的 Alexa 或 Google Home 帳號會暴露例行事項、提醒，某些設定下還有互動紀錄
- **共用的串流與定位社交 App**：觀看紀錄、登入位置與聯絡人分享功能，都會洩漏日常作息

## 怎麼在不驚動對方的前提下確認

這是全篇最需要謹慎的地方。**移除或關閉監控本身就可能帶來危險**，刪掉追蹤類 App 或關掉位置分享，對方可能立刻收到通知，後果從爭執到肢體暴力都有可能[^5]。

把偵測與移除當成兩個分開的決定，第二個決定只在安全計畫的一部分裡做，最好有專業工作者陪同。

依序進行：

1. **盡可能用安全的裝置查資料**。懷疑自己的手機被監控時，先在對方碰不到的裝置上研究[^1]
2. **只看，先不要動**。在自己的手機上安靜地檢視哪些 App 有位置與無障礙權限（iOS 與 Android 都在「設定」的隱私權底下）、哪些裝置登入了你的 Apple ID 或 Google 帳號、「尋找」與 Google 地圖裡有誰在分享你的位置。把看到的記下來，先不要更動任何設定
3. **假設移除會被看見**。刪除追蹤類 App、把某台裝置登出、關掉位置分享都可能觸發通知。Coalition Against Stalkerware 明確建議，只有在你認為安全時才嘗試移除，而且要先做好安全計畫[^5]
4. **行動前先找專業工作者談**。家暴社工可以協助你安排更動的順序，讓對方在你安全之前不會察覺。台灣的 `113` 保護專線提供匿名諮詢與轉介
5. **換一台乾淨的裝置往往比清理更安全**。與其清理一台已經被入侵的手機，取得一台對方從沒見過、也從沒碰過的便宜新機，用全新帳號設定，放在對方找不到的地方，可以整個繞過「他會知道我移除了」這個問題

逐步的偵測指引，見 Safety Net Project 的 [spyware and phone surveillance](https://www.techsafety.org/spyware-and-stalkerware-phone-surveillance){target="_blank"} 與 Coalition Against Stalkerware 的 [survivor information](https://stopstalkerware.org/information-for-survivors/){target="_blank"}。

## 帳號與密碼怎麼安全地分開

重建一個對方沒有路徑進入的數位生活，技術步驟不難，難的是不要做得太早或太明顯。順序與時機跟操作本身一樣重要。

### 先在旁邊把新身分建起來

- **開一個新的信箱帳號**，在對方看不到的裝置與網路上完成，不要綁定現有的手機號碼或救援信箱。之後所有新帳號都以它為救援錨點
- **取得一個對方不知道的門號**。預付卡或放在另一台裝置上的第二門號，可以讓即時位置與通話紀錄離開共用的電信帳戶。台灣的實名制限制見下方在地脈絡
- **使用密碼管理器**，讓新帳號都有夠強而且不重複的密碼。工具選擇見 [密碼管理器入門](../tools/password-manager.md)。要在新身分裡設定它，不要沿用舊的那一份

### 更換帳號的優先順序

準備好、而且計畫已經就位時，依這個順序更換，因為前兩項是打開其他一切的鑰匙：

1. **信箱與雲端帳號**（救援錨點）。改密碼、移除對方的裝置、換掉共用的救援手機或信箱。新的對外地址用 [郵件別名](../tools/email-alias.md) 產生，之後停用某一個別名不會發出任何通知，對方看到的只是信件退回
2. **兩階段驗證從簡訊改成 App**。簡訊驗證碼會送到對方可能控制或看得到的號碼。改用驗證器 App（Android 的 Aegis、iOS 的 2FAS 或 Raivo）或硬體金鑰
3. **銀行與金融帳戶**，注意共用的帳單與聯名卡會透露新的消費與新住址
4. **社群媒體**，接著是購物與串流

### 共用帳號留到最後，而且要小心

登出共用的 Apple ID、退出家庭方案、取消位置分享，這些都是看得見的動作。可能的話，等你人身安全之後再做，或是把它們安排成跟離開同一時間的一組協調動作，不要當成零星的更動，那等於公告「我在準備離開」。

## 保全證據而不打草驚蛇

證據可以支撐保護令、監護權與刑事告訴。蒐集的方式本身不能變成新的風險。

- **保留，不要刪除**。威脅訊息、位置追蹤的截圖、通話紀錄，日後都是證據。不要為了「清乾淨」而大量刪除騷擾訊息，也不要刪掉原始訊息
- **完整擷取上下文**。截圖要含訊息本身、寄件者、時間戳記與前後對話。平台允許的話匯出原始檔。用另一支相機拍下螢幕也比什麼都沒有好
- **不要存進共用的雲端**。證據不要備份到對方看得到的 iCloud 或 Google 帳號，放在對方碰不到的裝置或儲存空間，或交給信任的人與社工
- **維持一份有日期的紀錄**。逐次記下事件、日期與經過，這份紀錄在法律程序上本身就有用，也比要求自己完美截圖每一件事容易維持
- **對質之前先諮詢**。讓對方知道你在蒐證可能會使情況升溫。把證據交給社工、律師或警方，不要交給對方

## 離開是風險最高的時刻

這頁最重要的一件事不是任何技術步驟。**離開受暴關係的前後是最危險的時期**，抽象上安全的數位更動，在這個時間點可能正好是暴露計畫的引信。安全計畫（safety planning）存在的理由就是這個，把每一個動作包含數位動作的順序都排好，讓對方在你安全之前不會知道你要離開。

實務上的意涵：

- 突然一連串改密碼、被刪掉的追蹤 App、包包裡被發現的新手機，讀起來都是「這個人要走了」。這些動作要配合你的計畫安排時間，不是讀到這頁的當下就做
- 新信箱、新號碼、求助專線與保存的證據，都放在對方找不到的裝置上
- 圍繞實體接觸來規劃。對方拿得到又解得開的東西就不是私密的，跟上面執行什麼軟體無關
- 可以的話，跟受過訓練的社工一起做安全計畫。技術步驟是用來支撐安全計畫的，取代不了它

## 在地脈絡

以下是台灣與鄰近地區的實際狀況，會改變上面的建議怎麼落地。**這是一般性的說明，不是法律意見**，個別情況請諮詢在地的社工或律師。

### 門號實名制

亞太多數地區的預付卡都依法綁定身分，台灣也是[^6]。所謂「新的、秘密的」號碼仍然登記在真實身分底下，在對方經手家中文件或共用電信帳戶的家庭裡，新辦的門號有被發現的可能。

這不代表另辦號碼沒有意義，而是它帶來的區隔是操作上的而非絕對的，也因此更需要熟悉在地電信實務的社工協助。

### 共用裝置與大家庭

三代同堂與共用家庭裝置在台灣很常見，這擴大了「有正當理由實體接觸你的手機、帳號與路由器」的人數。施暴的未必只有伴侶，其他家庭成員也可能參與監控或控制。

「用對方碰不到的裝置」這個原則，在整個家戶共用硬體與帳號的情況下更難達成，所以公共圖書館的電腦或信任親友的裝置，在這裡比在單一家戶的情境中更重要。

### 台灣的求助管道與法律

- **`113` 保護專線**：衛生福利部的全國 24 小時專線，涵蓋家庭暴力、性侵害與性騷擾。提供匿名諮詢與社工轉介，並有多語服務（含英語、越南語、印尼語、泰語、日語），電話與線上聊天皆可，無法使用語音者可用簡訊[^7]
- **緊急保護令**：依 [家庭暴力防治法](https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050071&flno=16){target="_blank"} 第 16 條，法院認被害人有受家暴急迫危險者，應於 4 小時內以書面核發緊急保護令[^8]。透過警察、社政或地方法院家事庭提出
- **跟蹤騷擾防制法**：2022 年 6 月 1 日施行，對反覆的跟監、守候、騷擾通訊等行為提供刑事追訴依據，含以電子方式為之者[^9]
- **現代婦女基金會**：[https://www.38.org.tw/](https://www.38.org.tw/){target="_blank"}
- **婦女救援基金會**：[https://www.twrf.org.tw/](https://www.twrf.org.tw/){target="_blank"}
- **勵馨基金會**：[https://www.goh.org.tw/](https://www.goh.org.tw/){target="_blank"}
- 各縣市政府社會局的家庭暴力暨性侵害防治中心

### 香港的落差

香港至今沒有專門的反跟蹤騷擾罪。法改會 2000 年建議立法後遭擱置，被跟蹤或被起底（未經同意公開他人個人資料、意圖造成傷害）時，只能援引民事侵權、性騷擾法規或 2021 年新增的「起底」刑事罪名間接處理，保護力道比台灣的跟騷法明顯較弱[^11]。

以下管道相對不受《國安法》直接衝擊，家暴屬於非政治化的公共服務：

- **社會福利署 24 小時熱線**：`2343 2255`
- **和諧之家（Harmony House）**：24 小時婦女熱線 `2522 0434`、男士熱線 `2295 1386`
- **風雨蘭（RainLily）**：香港首間性暴力危機支援中心，`2375 5322`
- **明愛向晴軒（向晴熱線）**：`18288`，24 小時危機支援[^10]

### 區域與國際資源

數位安全的緊急狀況可以找 [Access Now Helpline](https://www.accessnow.org/help/){target="_blank"}，24 小時多語支援並優先處理高風險者。其他地區的在地家暴服務，[Find a Helpline](https://findahelpline.com/){target="_blank"} 依國家列出經過查核的熱線。

## 相關閱讀

- [一般人平常該做到什麼](./everyday-baseline.md)：不分身分都要做到的那些，這一頁假設你已經做到
- [緊急求救](../help/index.md)：帳號被盜、裝置遺失、跟蹤騷擾、被斷網的綜合應對清單
- [怎麼維持多個網路身分](../basics/multiple-identities.md)：建立一組對方完全不知道的新帳號，以及避免新舊身分被平台串起來
- [LGBTQ+ 與性少數的匿名社交](./lgbtq.md)：家人控管下的本機痕跡管理，與共用家戶的情境高度重疊
- [威脅模型如何建立](../basics/threat-model.md)：判斷「誰能存取什麼、後果是什麼」的整體框架
- [Safety Net Project](https://www.techsafety.org/resources-survivors){target="_blank"}：美國 NNEDV 維運，英文世界最完整的家暴科技安全指引
- [Coalition Against Stalkerware](https://stopstalkerware.org/information-for-survivors/){target="_blank"}：追蹤類 App 的偵測、安全移除，以及移除監控的升溫風險

[^1]: [Information for survivors](https://stopstalkerware.org/information-for-survivors/){target="_blank"} - Coalition Against Stalkerware，關於求助時要使用加害者未曾接觸過的裝置。
[^2]: [Apple and Google deliver support for unwanted tracking alerts in iOS and Android](https://www.apple.com/newsroom/2024/05/apple-and-google-deliver-support-for-unwanted-tracking-alerts-in-ios-and-android/){target="_blank"} - Apple Newsroom，2024-05-13。
[^3]: [Spyware and Stalkerware: Phone Surveillance](https://www.techsafety.org/spyware-and-stalkerware-phone-surveillance){target="_blank"} - Safety Net Project（NNEDV）。
[^4]: [What is stalkerware and signs of it](https://stopstalkerware.org/information-for-survivors/){target="_blank"} - Coalition Against Stalkerware，關於偵測的困難與行為面的警訊。
[^5]: [Information for survivors](https://stopstalkerware.org/information-for-survivors/){target="_blank"} - Coalition Against Stalkerware，關於移除追蹤類 App 的升溫風險，以及先做安全計畫的建議。
[^6]: [Mandatory Registration of Prepaid SIM Cards](https://www.gsma.com/public-policy/wp-content/uploads/2021/08/GSMA-Mandatory-Registration-of-Prepaid-SIM-Cards-2021.pdf){target="_blank"} - GSMA，亞太地區預付卡實名登記的概況。
[^7]: [113 Protection Hotline](https://findahelpline.com/organizations/113-protection-hotline){target="_blank"} - Find a Helpline，以及 [Taiwan's domestic abuse hotline available in 7 languages](https://www.taiwannews.com.tw/news/3984218){target="_blank"} - Taiwan News。
[^8]: [家庭暴力防治法](https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=D0050071){target="_blank"} - 全國法規資料庫，急迫危險情況下 4 小時內核發緊急保護令。
[^9]: [跟蹤騷擾防制法](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0080211){target="_blank"} - 全國法規資料庫，2022-06-01 施行。
[^10]: [風雨蘭服務](https://rainlily.org.hk/chi/service){target="_blank"} - ACSVAW 關注婦女性暴力協會，以及 [24-Hour Harmony House Woman Hotline](https://findahelpline.com/organizations/24-harmony-house-24-hour-woman-hotline){target="_blank"} - Find a Helpline。
[^11]: [Stalking](https://familyclic.hk/en/category/topics/daily-lives-legal-issues/stalking/){target="_blank"} - Family CLIC，關於香港缺乏專門反跟蹤罪，以及仰賴民事救濟與 2021 年起底罪的現況。
