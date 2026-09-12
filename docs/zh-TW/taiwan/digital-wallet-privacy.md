---
title: 數位憑證皮夾保護了什麼
description: 從原始碼看數位憑證皮夾的三個隱私性質，發證方看不看得到出示紀錄、驗證方之間能不能串連、誰能要求你出示。
icon: material/wallet-outline
---

# :material-wallet-outline: 數位憑證皮夾保護了什麼

數位發展部的數位憑證皮夾 2025 年底進入試營運，超商取貨已經可以用它代替實體證件[^1]。官方說明的重點是選擇性揭露（Selective Disclosure），只給驗證需要的欄位，不必把整張證件交出去。公民團體的批評則集中在法制面，至今沒有法律規範保障其中的隱私權與平等近用公共服務[^2]。台灣的數位身分議題已經爭論過一次，2021 年的數位身分證計畫就是在同一個爭點上暫緩的。

兩邊的說法都成立，但都沒有回答技術上的具體問題。皮夾的原始碼以 MIT 授權公開在 [`moda-gov-tw/TWDIW-official-app`](https://github.com/moda-gov-tw/TWDIW-official-app){target="_blank"}[^3]，所以問題答得出來。本頁分開檢查發證方的視角、驗證方之間的串連、出示的資格三件事，各自給出結論。

!!! info "本頁的依據與寫作時間"

    技術結論讀自 `moda-gov-tw/TWDIW-official-app` 的 commit `99e9deb105b6`（2026-07-27），本頁的程式碼連結都釘在該版本，日後改版不影響連結指向的內容。官方說法引自 [wallet.gov.tw](https://wallet.gov.tw/){target="_blank"} 的技術介紹頁、常見問題頁與隱私權政策，該站內容可能隨時調整。

## 皮夾要解決的問題

官方政策頁的開頭寫明界線[^30]：

> 數位憑證皮夾不是電子錢包或數位身分證，而是各類「憑證」（Credentials）的數位載具 <!-- docs-style-lint: disable-line -->

出示實體證件時揭露是全有或全無，出示駕照就等於把姓名、生日、地址與身分證字號一併交出。傳統流程往往要留影本，影本外流就可能遭冒用。各機構各自核發憑證與 App，彼此不通，使用者需安裝多個。

官方列出的效益是選擇性揭露加強個資保護、跨國互通提升數位經濟效率、邁向數位社會，理由是「未來，大部分工商行為與政府服務皆在線上進行，個人需證明其參與資格」[^30]。

皮夾屬於「數位創新關鍵基礎建設計畫」的一環，推動期 2024 到 2027，跨部會總預算 4.6 億元，首年約 1.6 億元。數發部 2023 年加入 W3C 研究分散式身分管理，成為後來的技術基礎[^31]。

開頭那句「不是數位身分證」出現在政策文件的第一行，早於後來的爭議。

## 台灣採用的架構在區域裡的位置

台灣不是歐盟會員國，卻採用歐盟那套規格，原因與會員資格無關。W3C 的可驗證憑證（Verifiable Credential）、IETF 的 SD-JWT、OpenID Foundation 的 OpenID4VCI 與 OpenID4VP 都是公開規格，任何人都能實作。

數位身分有兩種做法，差別在出示的當下發證方在不在場。

身分提供者模式裡，驗證方向政府查詢，政府回覆對方是誰。新加坡的 Singpass 屬於前者，其官方開發者文件裡寫[^32]：

> Singpass is Singapore's national digital identity authentication provider using the OpenID Connect 1.0 protocol. It stores users' identity information and authenticates them for transactions with government agencies and private organizations online.

驗證方在協定裡是 Relying Party，向 Singpass 索取 ID token，因此每一次驗證 Singpass 都在流程中間。

持有者出示模式裡，憑證存在使用者手機上，直接交給驗證方，由密碼學驗證真偽，台灣與歐盟採用後者。

鄰近地區的分佈：

| 地區 | 模式 | 出示時發證方在不在場 |
|---|---|---|
| 新加坡 Singpass | 中央身分提供者，OpenID Connect | 在場 |
| 日本 マイナンバーカード | 憑證存在卡片或手機安全元件，採用中央 PKI（JPKI）[^33] | 部分在場 |
| 韓國 모바일 신분증 | 以區塊鏈 DID 為基礎，資料分散存在手機[^34] | 較接近台灣 |
| 台灣 數位憑證皮夾 | 持有者出示，W3C 可驗證憑證加 SD-JWT | 不在場 |
| 歐盟 EUDI | 持有者出示，同一套規格 | 不在場 |

Singpass 常被當成數位政府的模範，普及率也確實高，但在其架構裡，政府位於每一次驗證的中間。直接複製該案例，得到的會是一個政府看得見所有驗證紀錄的系統。

就鄰近地區而言，台灣採用的架構對持有者比較有利，韓國也採用類似的架構。單就架構一項來說，台灣選的是持有者出示模式，政府無法像 Singpass 那樣站在每一次驗證的中間。

## 三個該分開問的問題

出示實體證件時，隱私上牽涉三件事，數位版本各自對應不同的技術機制。

1. **發證方的視角**：知不知道你何時何地出示。實體駕照不會回報給監理所，數位版本要看設計
2. **驗證方之間**：能不能串連你。兩家店取得的證明能不能對上同一個人
3. **出示的資格**：誰有資格要求你出示。實體世界靠情境判斷，數位世界靠協定

## 發證方看不到你何時何地出示

官方技術介紹頁寫「使用時，無需每次都得透過發行單位連線確認」[^4]。原始碼與此一致，出示時皮夾用手上的憑證即時產生可驗證證明（Verifiable Presentation），不回頭連發證方。

撤銷狀態的查詢避開了同一個陷阱。憑證被撤銷或停權時要有機制讓驗證方知道，最直接的做法是驗證方用憑證編號詢問發證方，但那等於每次出示都通知發證方一次。皮夾採用的是狀態清單（status list）[^5]，`StatusListPrepareTask` 裡的註解寫明最小尺寸[^6]：

```java
// generate 1st status list
// prepare initial bit string with 0s (min. size = 16 KB)
byte[] bytes = new byte[16 * 1024];
Arrays.fill(bytes, (byte) 0x00);
encodedList = ZipUtils.gzipCompressThenBase64(bytes);
```

16 KB 是 131,072 個位元。皮夾的實作是每張憑證佔 1 個位元（`byteIndex = statusListIndex / 8`），所以一份清單涵蓋十三萬張憑證的狀態。撤銷與停權還分成兩份獨立的清單。

對持有者的意義是，驗證方下載的是一份十三萬人共用的清單，取回後自行比對其中一格，不必指名向發證方查詢你這一張。

驗證方取回整份清單後自行比對對應的位元，發證方只知道有人下載了清單，不知道查的是哪一張。規格把這個性質稱為群體隱私（herd privacy），同時也列出其邊界[^5]。發證方仍可從 HTTP 請求的來源位址辨識驗證方，發行量遠小於清單容量的小型發證方群體隱私會明顯變差，而發證方若刻意把清單切小甚至一張憑證一份清單，這層保護就失效。

隱私權政策的說法也相符：「可驗證憑證之認證或對外提供個人資料，本部均不會接收到任何個人資料」[^7]。

## 不同的驗證方能串連你

選擇性揭露用的格式是 SD-JWT（Selective Disclosure for JSON Web Tokens）。其做法是把每個欄位加鹽雜湊，出示時只揭開需要的那幾個[^8]。

雜湊是把一段內容換算成固定長度的亂碼，從亂碼回推不出原文。加鹽是換算前先摻一段隨機字串，讓同樣的內容每次算出來的亂碼都不同。憑證裡存的是這些亂碼，出示時才把需要的那幾格還原成原文，其餘留在手機裡。所以「你多給了什麼」確實被擋住了。

擋不住的是「這兩次是同一個人」。同一張憑證每次出示時，發證方的簽章、所有欄位的雜湊值、發證方識別碼與綁定的持有者公鑰都是固定的。兩家店比對收到的證明，或同一家店比對你兩次造訪，認得出來自同一張憑證。欄位揭露得再少都一樣，因為那組固定值本身就構成識別碼。這是皮夾目前最實質的隱私限制。

規格對此寫得很直接[^8]：

> SD-JWT only conceals the value of claims that are not revealed. It does not meet the security properties for anonymous credentials. In particular, colluding Verifiers and Issuers can know when they have seen the same credential no matter what fields have been disclosed, even when none have been disclosed.

國際上處理這件事的做法是批次發行一次性憑證，發證方一次給一疊，每張用過就丟，彼此之間看不出關聯[^9]。台灣的實作沒有這一層[^10]：

- `CredentialRequestDTO` 只有單一的 `credentialType`、`holderDid`、`holderPublicKey` 與 `nonce`，沒有批次發證用的憑證數量參數
- `CredentialService.generate()` 回傳單一字串而非清單
- 憑證帶 `expirationDate`，採用的是有效期模型而非用過即丟

官方技術介紹頁寫「數位憑證皮夾未來也將支援零知識證明（Zero Knowledge Proof）技術」[^4]，與原始碼的現況一致。零知識證明是另一條路徑，能在不出示簽章本身的前提下證明條件成立，做到之後可連結性才會消失。

零知識證明在數位身分皮夾上還沒有成熟的大規模實作，這不是台灣獨有的落後。eIDAS 2.0 的前言第 14 點把它列為鼓勵方向，但沒有寫成有拘束力的條文或施行細則[^19]，相關的技術規格也還在公開徵詢[^11]。差別在歐盟先用批次發行把影響降到最低，而歐盟自己的文件寫明那只是部分緩解（partly mitigate）[^9]。

數位發展部的另一個專案 `tw-did` 把行動自然人憑證（TW FidO）橋接到 W3C 的分散式識別碼，其中一種模式用 Semaphore 的零知識證明，README 寫明發證方與驗證方在驗證過程中都認不出是哪一位國民[^35]，而皮夾目前缺的正是這個性質。兩個專案在程式碼層面沒有關聯，`tw-did` 的定位是橋接與研究，規模與正式服務的工程約束不同，不宜當成皮夾應該比照的範例，但它說明該路徑在同一個部會的視野之內。

## 皮夾查詢驗證方身分卻不擋下請求

OpenID4VP 協定裡，驗證方用 `client_id` 表明身分，而 `client_id` 的形式決定皮夾能做多少驗證[^12]。形式決定皮夾能不能確認「對方是不是它自稱的那個人」。台灣的伺服器端支援四種[^13]：

```java
PRE_REGISTERED("pre-registered")
REDIRECT_URI("redirect_uri")
DID("did")
VERIFIER_ATTESTATION("verifier_attestation")
```

上面四個名稱來自 OpenID4VP 較早的草案。正式發布的 1.0 版把該概念改名為 Client Identifier Prefix，`did` 也改成 `decentralized_identifier`[^12]。用現行規格對照會找不到 `did` 字串，本頁以皮夾實際執行的程式碼為準。

實際產生授權請求與 QR Code 的端點都寫死 `DID`，`REDIRECT_URI` 的那一行留在原始碼裡被註解掉[^14]。用 `DID` 形式時授權請求必須簽章，這是 OpenID4VP 的規格要求而非實作選擇[^12]，`VERIFIER_ATTESTATION` 同樣要求。相對於連請求完整性都無法驗證的 `REDIRECT_URI`，`DID` 明顯偏強。

但 DID 證明的是身分的一致性，不是身分的可信度。任何人都能自己產生一個 DID，簽章只說明「持續是同一個身分」。`VERIFIER_ATTESTATION` 需要被信任方背書，那一層外部審核 DID 單獨無法提供。皮夾取得 DID 之後還要另外查詢信任清單，推測與這個落差有關，不過原始碼沒有寫明設計動機。

皮夾收到請求後會用驗證方的 DID 查詢信任清單[^15]。問題出在查詢之後怎麼處理，Android 的字串資源裡寫[^16]：

> 提醒您，您將提供資料的單位尚未列入【信任清單】，建議再次確認是否要『送出資料』

`KxIdentifierManagerImpl.kt` 裡的註解寫得更直白[^17]：

> 如果錯誤代碼是4012且是401i，則跳出信任單位警告視窗並且繼續往下走

未列入清單的驗證方會跳出警告視窗，使用者可以選擇繼續。皮夾把判斷交還給使用者，隱私權政策的立場也是同一個：「使用者應自行評估是否透過數位憑證皮夾APP的機制將個人資料分享或揭露予第三方」[^7]。

皮夾在兩個時機都查詢同一個中央服務，問的問題不一樣。收到憑證時問的是「這個發行方現在有效嗎」，出示憑證時只問「這個 DID 查得到嗎」[^15]：

| 時機 | 判斷條件 | 實際檢查的事 |
|---|---|---|
| 收到憑證時 | `issStatus['data']['status'] == 1` | 發行方目前的狀態是否有效 |
| 出示憑證時 | `issStatus['error'] != null` | 該 DID 是否為服務所知 |

出示時只確認查得到查不到，沒有再看狀態。清單裡登記過但狀態已非有效的驗證方，出示時不會觸發警告。

## 信任清單的信任錨點在一個中央服務

官方技術介紹頁描述信任清單的儲存方式[^4]：

> 此外我們將信任清單——可信任的憑證發行者列表——記錄在區塊鏈上，讓清單就像被刻在石碑上，無法被任何人偽造或篡改。 <!-- docs-style-lint: disable-line -->

皮夾實際查詢的方式是對一個中央服務發 HTTP 請求，路徑是 `GET {frontUrl}/api/did/{issDID}`[^18]。公開的原始碼裡沒有任何區塊鏈相關的程式碼，Java、Kotlin、Dart 與 Markdown 檔案裡都搜不到。

公開資料無法區分兩種解釋。區塊鏈可能是支撐該中央服務的獨立元件，只是沒有隨程式碼開源，也可能該描述對應的是別的東西。不宜據此推論官方說法不實。

不論背後是什麼，皮夾信任的是那個中央服務。服務若被攻破或被要求配合，刻在石碑上的性質保護不到使用者，因為皮夾查詢的對象是那個中央服務，從來不是石碑本身。

## 台灣的數位身分計畫暫緩過一次

皮夾一路強調自己不是數位身分證，而 2021 年暫緩的正是數位身分證計畫，兩者是同一個爭點。

2021-01-21 行政院宣布暫緩數位身分證（New eID）的換發。當時的院長蘇貞昌提出三個再推動的條件[^23]：

> 待整個法制完備後…與社會各界能夠瞭解及溝通再來推行…待行政院院會通過，送立法院三讀完成後再來進行

監察院同年三月的調查報告指出，內政部規劃過程規避既有法制、授權不足[^28]。

專法一直沒有送進立法院，停在行政部門內部研議。2024-07-31 內政部的說法比 2021 年寬鬆[^29]：

> 數位身分證計畫經國發會審度政策形成過程與社會各界共識，制定專法並非唯一選擇

同一則新聞稿裡寫，後續推動要等個人資料保護委員會成立之後，再做政策、資安與法制的跨部會意見整合。而個保會至今仍是籌備處，組織法尚未完成三讀，詳見 [台灣個資法 2025 修法](./pdpa-2025.md)。

2021 年承諾的專法沒有進立法院，2024 年主管機關改為表示專法並非唯一選擇，而其指定的前提條件個保會也還沒成立。同一段時間裡，數位憑證皮夾已經從規劃進入超商的實際運作。

數發部的立場是兩者不同，官方文件反覆強調數位憑證皮夾並非發行數位身分證，只是整合多種數位證件的容器。技術上這個區分成立，皮夾本身確實不發行身分識別。爭點在於 2021 年那三個條件是對「數位身分」這件事說的，而不是對某一張證件說的。

## 在地討論的焦點落在法制

2026-02-09 一份由台灣人權促進會發起、多個公民團體連署的聲明提出三項訴求[^24]：

1. 數位發展部應完善數位皮夾的法律制度
2. 在建立法律之前，於數位身分計畫的各個階段進行個資衝擊風險及人權風險評估
3. 以制度落實國際原則

第三項的原文是：

> 樂觀地空想技術會自己長成符合國際原則的樣子

台灣人權促進會 2024 年 11 月依政府資訊公開向數發部申請數位皮夾設計案與建置案的階段交付成果，經過數次溝通，到 2026 年仍未公布。

被反覆提起的前例是台北通。依同一份聲明，2021 到 2022 年初有民眾反應圖書館借書這類基本公共服務被要求先註冊台北通才能使用[^24]。在地最具體的擔憂落在強制使用與近用門檻，而非密碼學。

### 更根本的批評指向皮夾之外

2026-07-06 中央廣播電台的一則報導整理了幾位法律學者的意見，論點比「缺法源」更深一層[^25]。

中央研究院法律學研究所資訊法中心主任吳全峰認為去中心化的安全保障恐流於形式，理由是政府本來就常在缺乏法律規範與授權的情況下串接個資，而且沒有保留調取紀錄供問責。律師黃昱中指出戶籍、稅務、車籍、健保、勞保這些分散存放的資料，透過自然人憑證就串接得起來，而機關之間存取個資的依據「都是行政命令位階，不是法律位階」。東海大學法律系退休教授范姜真媺以 M-Police 為例，質疑內政部建立人臉資料庫的法律依據。

學者的批評跟本頁前面的技術檢查互補。皮夾把證件資料存在手機上確實避開了單一資料庫的風險，但政府手上的原始資料並沒有因此變得難以串接。皮夾的架構管得到「出示時給了什麼」，管不到「機關之間本來就怎麼調用」。

### 技術社群的評價偏正面

2025-03 區塊勢的一篇評論把皮夾稱為身分自主的隱私革命，論點是選擇性揭露讓民眾精準控制分享範圍、採用 W3C 標準打破各應用各自孤立的狀態、資料存在手機端而非中央資料庫，並以驗鈔的浮水印作比喻，驗證方不用與發行方建立熱線，用密碼學就確認得了證件真偽[^26]。該文同時寫出保留之處，短期只適用超商取貨這類簡單場景，複雜系統無法立刻整合。

同一篇也寫，記者會沒有說明採用的是哪一條區塊鏈。抱持正面態度的評論者一樣查不到，這與本頁前面對信任清單的觀察互相印證。

另有開發者用沙盒環境做出同時扮演發行方與驗證方的門禁與訪客發證流程，README 記下選擇性揭露在實務上確實運作[^27]：

> 同樣的員工卡，只揭露「是不是有效員工」，姓名 / 生日 / 子女數等欄位一律留在皮夾內

同一份文件也記下摩擦，憑證樣板的必填欄位限制讓開發者需先用員工卡樣板填入訪客資訊作為權宜做法，要正規的訪客通行證卡面需回後台另建樣板。整套機制堪用，細節仍有待改善。

## 歐盟對同一套技術的要求不同

歐盟的數位身分皮夾（EU Digital Identity Wallet）採用的標準與台灣同一套。差別在 eIDAS 2.0 把幾項隱私性質寫成法律義務，技術設計是為了滿足義務而來。

歐盟的規定分三種位階，條文（Article）有拘束力，前言（Recital）屬說明性質，技術文件（ARF）是實作指引。以下逐項標明各自的出處。

驗證方（Relying Party）那一端，eIDAS 2.0 第 5b 條第 1 項要求「the relying party shall register in the Member State where it is established」，同條第 7 項要求各成員國提供識別與驗證驗證方的共同機制[^19]。相關憑證的核發與撤銷規定在施行細則 Implementing Regulation (EU) 2025/848[^20]。前言第 17 點寫明註冊「should not entail a pre-authorisation process」[^19]，所以歐盟的模型是「要問就得可被識別並先宣告用途」，不含政府核准誰可以問的環節。

超額索取的處理寫在 ARF 的高階需求，屬技術文件而非條文[^22]：

> In a transaction, a wallet solution shall inform the wallet user whenever the wallet-relying party is asking for more information than what they have registered as intended use and the user will have possibility to reject the transaction.

施行細則的前言有語氣較弱的對應版本，沒有讓使用者拒絕交易那一句[^20]。

位階最高的是不可連結性，寫在第 5a 條第 16 項[^19]。該項要求技術框架須支援確保不可連結性的隱私技術，並禁止證明提供者於發證後取得可用以追蹤、連結或關聯使用者行為的資料，除非使用者明示授權。

四項對照：

| 項目 | 歐盟 EUDI | 台灣數位憑證皮夾 |
|---|---|---|
| 驗證方註冊 | 條文強制，並由成員國提供識別與驗證的共同機制，不採事前許可 | 查中央信任清單，未列入時警告而使用者可繼續 |
| 可要求的欄位 | 只能要求已登記且宣告用途者，超出時皮夾須告知。細節寫在 ARF 技術文件 | 未見對應機制 |
| 不可連結性 | 第 5a 條條文要求，實作用批次發行一次性憑證部分緩解 | 無批次發證，官方寫明零知識證明為未來工作 |
| 發證方不得追蹤 | 第 5a 條條文禁止 | 出示不回連發證方，技術上已達成 |

一項相同、一項較弱、兩項未見對應。

## 技術做到哪一步取決於有沒有人要求

歐盟那四項性質的來源是法律。eIDAS 2.0 先寫成義務，實作再依義務發展。台灣目前沒有對應的法律要求，公民團體批評的就是這一點。

所以問題不在工程能力。批次發行一次性憑證是現成的做法，驗證方登記用途也是寫得出來的機制，歐盟的實作就在公開的程式碼庫裡。差別在有沒有一份文件要求它做到，以及做不到的時候誰能主張權利。

本網站在地脈絡分類裡的其他議題也是同一個結構。能力已經建成，限制它的是授權與程序。

## 讀者可以做什麼

### 先看自己的用法

超商取貨這類一次性、低風險的場景，本頁列出的限制影響有限。可連結性的風險要在同一張憑證反覆出示給多個驗證方時才會累積，領一次包裹跟出示實體證件給店員看的差別不大。想更保守就繼續帶實體證件，皮夾目前是多一個選項。

可放進皮夾的證件種類與使用場合都在擴張，同一張憑證用得越頻繁、場合越多樣，被串連起來的輪廓就越完整。

### 知道自己在同意什麼

皮夾出示時的警告視窗按下之後流程就會繼續，該視窗是目前唯一由使用者決定的關口。看到「尚未列入信任清單」的提示時，意思是對方沒有登記在案。

### 分開想兩件事

「給了哪些欄位」與「被認出是同一個人」是兩回事。選擇性揭露解決前者，後者目前沒有對應的機制。需要匿名的場合不在數位憑證皮夾的設計目標之內。

### 追蹤法制進度

本頁的技術結論會隨版本改變，真正決定長期走向的是有沒有法律要求。相關的法制動態見 [台灣個資法 2025 修法](./pdpa-2025.md)。

## 本頁的限制

結論全部來自公開的原始碼與官方文件，沒有實測 App 的網路行為。官方常見問題頁說明 App 採用 GuardSquare DexGuard 提供反靜態分析與反動態分析的防護[^21]，所以「手機上執行的二進位檔是否等同這份原始碼」沒有被獨立驗證過。原始碼公開與發行檔加固可以同時成立，對想自行查核的人來說兩者意義不同。

中央信任清單服務與區塊鏈的關係同樣沒有結果。檢視過的來源包括皮夾的技術介紹頁、常見問題頁、隱私權政策、政策頁，App 內的使用者條款，`TWDIW-official-app` 全部原始碼，`moda-gov-tw` 組織底下的所有公開 repo，以及中文媒體報導。使用者條款裡出現同一句話，措辭與技術介紹頁完全相同，沒有補充細節。哪一條鏈、如何錨定、由誰維運，這三件事在上述範圍內都找不到說明。

本頁沒有就這些發現向數位發展部提出詢問並取得回覆，所有官方立場都引自既有的公開頁面。信任清單那一段的落差尤其應該有官方的說明，本頁停在「公開資料無法區分」，不代表沒有答案，只代表本頁沒有提出詢問。

## 延伸閱讀

<div class="grid cards" markdown>

- [:material-key-chain: 什麼是 passkey](../tools/what-is-passkey.md)
- [:material-account-multiple-outline: 多重身分](../basics/multiple-identities.md)
- [:material-scale-balance: 台灣個資法 2025 修法](./pdpa-2025.md)
- [:material-island: 在地脈絡](./index.md)

</div>

[^1]: [數位發展部舉辦「數位憑證皮夾」試營運暨應用體驗記者會 打造全民數位生活新紀元](https://moda.gov.tw/press/press-releases/18262){target="_blank"} - 數位發展部，2025-12-17
[^2]: [數位皮夾缺乏法律保障基本權，將淪為下一個台北通](https://www.amnesty.tw/node/23762){target="_blank"} - 國際特赦組織台灣分會
[^3]: [moda-gov-tw/TWDIW-official-app](https://github.com/moda-gov-tw/TWDIW-official-app){target="_blank"} - 數位發展部，MIT 授權
[^4]: [技術介紹](https://wallet.gov.tw/zh-tw/Developer.html){target="_blank"} - 數位憑證皮夾官方網站
[^5]: [Token Status List](https://datatracker.ietf.org/doc/draft-ietf-oauth-status-list/){target="_blank"} - IETF OAuth 工作組，Privacy Considerations 一節。另見 [Bitstring Status List](https://www.w3.org/TR/vc-bitstring-status-list/){target="_blank"} - W3C
[^6]: [`StatusListPrepareTask.java`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/core-system/twdiw-vc-handler/src/main/java/gov/moda/dw/issuer/vc/task/StatusListPrepareTask.java){target="_blank"} - TWDIW-official-app
[^7]: [隱私權政策](https://wallet.gov.tw/zh-tw/privacyPolicy.html){target="_blank"} - 數位憑證皮夾官方網站
[^8]: [RFC 9901 Selective Disclosure for JSON Web Tokens (SD-JWT)](https://www.rfc-editor.org/rfc/rfc9901.html){target="_blank"} - IETF，第 10.1 節 Unlinkability
[^9]: [Re-issuance and batch issuance of PIDs and attestations](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/discussion-topics/b-re-issuance-and-batch-issuance-of-pids-and-attestations.md){target="_blank"} - EU Digital Identity Wallet 的 ARF 討論文件，批次發行的目的寫為 partly mitigate Relying Party linkability
[^10]: [`CredentialRequestDTO.java`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/core-system/twdiw-vc-handler/src/main/java/gov/moda/dw/issuer/vc/service/dto/CredentialRequestDTO.java){target="_blank"} 與 [`CredentialService.java`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/core-system/twdiw-vc-handler/src/main/java/gov/moda/dw/issuer/vc/service/CredentialService.java){target="_blank"} - TWDIW-official-app
[^11]: [G - Zero Knowledge Proof](https://eudi.dev/latest/discussion-topics/g-zero-knowledge-proof/){target="_blank"} - EU Digital Identity Wallet 討論章節
[^12]: [OpenID for Verifiable Presentations 1.0](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html){target="_blank"} - OpenID Foundation，Client Identifier Prefix 一節
[^13]: [`ClientIdScheme.java`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/core-system/twdiw-oid4vp-handler/src/main/java/gov/moda/dw/verifier/oidvp/model/oid4vp/ClientIdScheme.java){target="_blank"} - TWDIW-official-app
[^14]: [`OidvpEndpointController.java`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/core-system/twdiw-oid4vp-handler/src/main/java/gov/moda/dw/verifier/oidvp/web/rest/oidvp/OidvpEndpointController.java){target="_blank"} - TWDIW-official-app
[^15]: [`openid_vc_vp.dart`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/APP/APPSDK/lib/openid_vc_vp.dart){target="_blank"} - TWDIW-official-app
[^16]: [`sdk_error_code.xml`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/APP/moda-digitalwallet-holder-androidapp/app/src/main/res/values/sdk_error_code.xml){target="_blank"} - TWDIW-official-app
[^17]: [`KxIdentifierManagerImpl.kt`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/APP/moda-digitalwallet-holder-androidapp/app/src/main/java/tw/gov/moda/digitalwallet/core/identifier/KxIdentifierManagerImpl.kt){target="_blank"} - TWDIW-official-app
[^18]: [`http_service.dart`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/APP/APPSDK/lib/http_service.dart){target="_blank"} - TWDIW-official-app
[^19]: [Regulation (EU) 2024/1183](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202401183){target="_blank"} - eIDAS 2.0。第 5a 條第 16 項（不可連結性）、第 5b 條第 1 項與第 7 項（驗證方註冊）、前言第 14 點（零知識證明）、前言第 17 點（不採事前許可）
[^20]: [Commission Implementing Regulation (EU) 2025/848](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202500848){target="_blank"} - 存取憑證的核發與撤銷，前言第 10 點為超額索取的對應規定
[^21]: [常見問題](https://wallet.gov.tw/zh-tw/qa.html){target="_blank"} - 數位憑證皮夾官方網站
[^23]: [暫緩數位身分證發行計畫 蘇揆：完善法制後再推動](https://www.ey.gov.tw/Page/9277F759E41CCD91/e80e55a2-0102-4031-b6d3-a7c40f4cac6a){target="_blank"} - 行政院，2021-01-21
[^24]: [【聯合聲明】數位皮夾缺乏法律保障基本權，將淪為下一個台北通](https://www.tahr.org.tw/news/3845){target="_blank"} - 台灣人權促進會，2026-02-09
[^25]: [數位皮夾能解隱私疑慮？ 學者：法規模糊才是台灣資料治理根本問題](https://tw.news.yahoo.com/%E6%95%B8%E4%BD%8D%E7%9A%AE%E5%A4%BE%E8%83%BD%E8%A7%A3%E9%9A%B1%E7%A7%81%E7%96%91%E6%85%AE-%E5%AD%B8%E8%80%85-%E6%B3%95%E8%A6%8F%E6%A8%A1%E7%B3%8A%E6%89%8D%E6%98%AF%E5%8F%B0%E7%81%A3%E8%B3%87%E6%96%99%E6%B2%BB%E7%90%86%E6%A0%B9%E6%9C%AC%E5%95%8F%E9%A1%8C-082000055.html){target="_blank"} - 中央廣播電台，2026-07-06
[^29]: [數位身分證政策為更周全完善，待個資保護委員會成立進行跨部會意見整合](https://www.moi.gov.tw/News_Content.aspx?n=8&s=318494){target="_blank"} - 內政部，2024-07-31
[^35]: [moda-gov-tw/tw-did](https://github.com/moda-gov-tw/tw-did){target="_blank"} - 數位發展部，把 TW FidO 橋接到 W3C DID 的專案，支援 Semaphore 零知識證明模式
[^30]: [數位憑證皮夾](https://moda.gov.tw/major-policies/wallet/1695){target="_blank"} - 數位發展部重點政策頁
[^31]: [數位憑證皮夾打造數位環境的信任基石](https://www.ithome.com.tw/news/173833){target="_blank"} - iThome，計畫期程與經費
[^32]: [Singpass API Introduction](https://docs.developer.singpass.gov.sg/docs/introduction){target="_blank"} - Singpass 官方開發者文件
[^33]: [Japanese Public Key Infrastructure (JPKI)](https://www.digital.go.jp/en/policies/mynumber/private-business/jpki-introduction){target="_blank"} - 日本デジタル庁
[^34]: [블록체인 기반 DID 기술 적용한 디지털 신분증](http://www.boannews.com/media/view.asp?idx=97149){target="_blank"} - 보안뉴스，韓國行政安全部的行動身分證以區塊鏈 DID 為基礎
[^28]: [監察院調查報告 110內調0010](https://www.cy.gov.tw/CyBsBox.aspx?CSN=1){target="_blank"} - 監察院，2021-03-18 公告
[^26]: [數位憑證皮夾：出示證件的新方法、身分自主的隱私革命](https://www.blocktrend.today/p/676){target="_blank"} - 區塊勢，2025-03-12
[^27]: [did-usecase-visitor](https://github.com/kkdai/did-usecase-visitor){target="_blank"} - 第三方開發者以沙盒環境實作的範例專案
[^22]: [X relying party registration](https://eudi.dev/latest/discussion-topics/x-relying-party-registration/){target="_blank"} - EU Digital Identity Wallet 的 Architecture and Reference Framework 討論文件，高階需求第 8 條
