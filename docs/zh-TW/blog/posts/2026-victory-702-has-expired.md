---
date: 2026-06-16
authors:
    - anoni-net
categories:
    - 更新
    - 翻譯文章
    - 隱私
slug: 2026-victory-702-has-expired
image: "https://assets.anoni.net/blog/2026-victory-702-has-expired.png"
summary: "FISA Section 702 讓美國情報機構不需令狀就能蒐集境外人士的通訊，2013 年史諾登揭露的 PRISM 與 Upstream 都建立在這條授權之上。2026 年 6 月 12 日午夜，它在國會僵局中暫時到期。對長期身為境外監控合法對象的台灣使用者，這篇說清楚這套權力的範圍、跟史諾登事件的關聯，以及為什麼 EFF 把暫時失效也視為一場勝利。"
description: "FISA Section 702 讓美國情報機構不需令狀就能蒐集境外人士通訊，2013 年史諾登揭露的 PRISM 與 Upstream 都建立在它之上。2026 年 6 月 12 日它暫時到期。台灣使用者本來就是境外監控的合法對象，這篇交代權力範圍、史諾登關聯，以及 EFF 視為勝利的理由。"
---

# :material-eye-off-outline: FISA 702 條款到期：美國無令狀蒐集境外通訊的授權，2026 年 6 月暫時失效

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/2026-victory-702-has-expired.png" target="_blank">
        <img src="https://assets.anoni.net/blog/2026-victory-702-has-expired.png"
            alt="EFF 的 NSA eagle 圖，把 NSA 標誌改畫成一隻老鷹用爪子接上電信線路，象徵無令狀的大規模監控"
            style="border-radius: 10px;">
    </a>
    <figcaption>圖片為 EFF 設計師 Hugh D'Andrade 繪製的「NSA eagle」，把 NSA 標誌改畫成老鷹用爪子接上電信線路，象徵無令狀的大規模監控。出自 [EFF 的 NSA 監控專題](https://www.eff.org/nsa-spying){target="_blank"}，授權為 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/){target="_blank"}[^img]。</figcaption>
</figure>

你寄一封信到 Gmail、用 iMessage 跟在美國的朋友聊天、用 WhatsApp 聯絡海外的家人，這些通訊只要有一端落在美國的服務或網路上，原本就可能被美國情報機構在不需令狀的情況下蒐集。授權這件事的法律叫 FISA Section 702（《外國情報監控法》第 702 條）。2026 年 6 月 12 日午夜，這條授權在美國國會的僵局中到期[^1]。

EFF（電子前線基金會）把這件事稱為一場勝利。要理解為什麼，得先知道 702 是什麼、它跟 2013 年史諾登（Edward Snowden）揭露的監控計畫是什麼關係，以及為什麼台灣使用者長期就是這套監控的合法對象，這次「暫時失效」對這個處境又意味著什麼。

<!-- more -->

## Section 702 是什麼

Section 702 由美國 2008 年的《FISA Amendments Act》（外國情報監控法修正案）設立[^3]。它允許美國情報機構在認定某位境外人士握有外國情報價值時，不經個別令狀就蒐集這個人的通訊，包含電子郵件、訊息與通話。

關鍵在「境外人士」這四個字。702 的設計對象是美國境外的所有人，所以美國境外的每一個人，包含台灣使用者，在法律上原本就是這套蒐集的合法目標。美國公民受美國憲法第四修正案保護，需要令狀，境外人士沒有這層保護。

實務上，702 還會大量「附帶蒐集」（incidental collection）到美國人的通訊。只要美國人跟被鎖定的境外目標有來往，他的郵件、訊息、通話就會一併被收進資料庫。這是後面爭議的起點。

702 授權之下有兩種具體的蒐集方式，名字許多人其實聽過：

- **下游蒐集（Downstream，舊稱 PRISM）**：政府要求 Google、Microsoft、Apple、Facebook、Yahoo 等科技公司，交出符合條件的使用者通訊[^2]。
- **上游蒐集（Upstream）**：NSA（國家安全局）直接從網際網路骨幹的纜線與交換器上擷取流量[^2]。

PRISM 與 Upstream 不是傳說中的代號。它們是 702 這條法律授權底下，實際在跑的兩個程式。

## 跟史諾登事件的關聯

史諾登在 2013 年揭露的監控計畫，法律基礎正是 Section 702。當年 6 月，這位前 NSA 約聘人員把一批內部簡報交給記者，PRISM 與 Upstream 這兩個名字就是從那批文件流入公眾視野的[^2]。全世界第一次看到「原來美國可以這樣蒐集全球的網路通訊」，看到的就是 702 在運作的樣子。

史諾登揭露的是「如何蒐集」，Section 702 則是「憑什麼能蒐集」的法律授權。

從立法到暫時失效，這套授權的幾個主要時間點：

- `2008` 年：《FISA Amendments Act》通過，設立 Section 702，讓原本游走在灰色地帶的無令狀蒐集有了明文授權。
- `2013` 年：史諾登揭露 PRISM 與 Upstream，702 第一次成為全球公共議題，各國才意識到自己是這套蒐集的對象。
- 之後十多年：702 經 `2012`、`2017`、`2024` 多次重新授權，每一次都伴隨改革派與情報機構的拉鋸，EFF 等團體持續要求加上令狀門檻。`2024` 年的 RISAA 把授權延到 `2026` 年 4 月，之後再靠臨時延長撐到 6 月。
- `2026` 年 6 月 12 日：在一場國會僵局中暫時到期。

史諾登當年揭露的計畫，過了十三年，它的法律授權第一次出現空窗。

## 後門搜尋（backdoor searches）為什麼是爭議核心

702 名義上鎖定境外人士，真正在美國國內引發憲法爭議的是後門搜尋（backdoor searches），官方稱為「美國人查詢」（US person queries）。

702 蒐集進來的龐大通訊資料庫裡，因為附帶蒐集而塞滿了美國人的通訊。FBI（美國聯邦調查局）、CIA（中央情報局）、NSA 之後可以用美國人的姓名、電子郵件、電話這類識別碼去查詢這個資料庫，不需要另外申請令狀。等於繞過了第四修正案對美國人的保護，從後門拿到資料。

規模不小，違規也不少：

- FBI 在 `2019` 到 `2022` 年間，對美國人做了將近 `500` 萬次查詢，這些查詢程序上多屬合法，爭議在於大多缺乏個案的合理說明[^4]。
- 政府在 `2022` 年 3 月通報，光是對 Section 702 資料庫的搜尋，就有超過 `278,000` 次不符規定[^4]。
- 2024 年國會通過《Reforming Intelligence and Securing America Act》（RISAA，情報改革與保障美國法），加了一些改革，但沒有解決無令狀查詢這個根本問題。到 `2024` 年 8 月，已經有報導指出 FBI 用了一個查詢工具繞過 RISAA 的限制[^4]。

EFF 長期主張，FBI 要查詢美國人在 702 之下被蒐集的通訊，應該先取得令狀。如果做不到這個門檻，那就讓整個方案到期，不要再續[^1]。

## 2026 年 6 月發生什麼

702 這次到期，導火線跟一樁人事任命有關。川普提名 Bill Pulte（時任聯邦住房金融局局長）暫代國家情報總監（DNI），接替宣布請辭的 Tulsi Gabbard[^1][^5]。DNI 監督的正是執行 702 的情報機構，把這個位子交給一位沒有情報資歷、又曾以房貸詐欺名義追查川普政敵的人選，讓參議院民主黨不願在這個時間點放行。他們以 Pulte 缺乏情報、軍事與國會經歷為由，拒絕推進自家版本的重新授權法案，眾議院則否決了短期續延[^1][^5]。國會幾次靠臨時延長把期限往後推，最後在 6 月 12 日午夜停在到期[^1]。

到期不等於監控當天就停。依現有報導，外國情報監控法院（FISC）對既有方案的重新認證效力延續到 2027 年 3 月，為這段期間的蒐集留下法律依據。有法律專家直言「702 不會就此停擺（go dark），那是迷思」[^5]。這次到期更接近一個法律與政治上的轉折點，而非開關被立刻關掉。

## 為什麼 EFF 把暫時失效也當成勝利

EFF 點出，這套權力的濫用風險從來不繫於某一個人或某一屆政府。如果國會擔心的是「某個人可能拿到美國人的敏感資訊」，負責任的做法是去強化制度層面的透明、究責與監督機制，而不是把希望寄託在換掉某個人選[^1]。

2026 年一整年，國會兩黨對改革的胃口都在變大，愈來愈多人反對在沒有令狀門檻的前提下重新授權 702[^1]。一條運作了十多年、史諾登揭露過、改革多次卡關的監控授權，能走到暫時失效這一步，本身就說明持續倡議是有用的。

## 回到台灣：你本來就是境外監控的合法對象

702 的失效對美國的倡議者是一場勝利，對台灣讀者能保護到的範圍卻很有限。702 這幾年的爭議重點是保護美國人，後門搜尋爭的是美國人受第四修正案保護、卻被繞過去查。台灣人本來就不在第四修正案的保護範圍內，要查詢台灣人在 702 之下被蒐集的通訊，對美國政府而言連後門都算不上，是正門。

### 你仍然是合法蒐集對象

很多人因為台美關係友好，覺得被美國蒐集總比被別人蒐集好，因此對 702 無感。隱私防護設防的對象是能力，不是當下的善意。一個機構今天友好，不代表它握有的蒐集能力會跟著縮手，蒐集的對象與用途也會隨政治情勢改變。把任何握有大規模蒐集能力的行為者放進同一套[威脅模型](../../basics/threat-model.md)，比依賴「現在是盟友」可靠。

就算 702 真的消失，蒐集境外人士的手段也不只這一條。NSA 海外訊號情報的主要法源是第 12333 號行政命令（Executive Order 12333，EO 12333，1981 年簽署），它沒有 FISC 的司法監督，國會監督也有限，而且完全不受這次 702 到期影響[^6]。對台灣人這種境外人士的蒐集，702 在不在都能繼續。這也是為什麼這場勝利對台灣讀者該慶祝的成分有限，隱私還是得靠自己用加密守住，不能寄望某一條法律。

### 真正的防線是端對端加密

台灣社會大量依賴美國的雲端與通訊服務，Google Workspace、Microsoft 365、iCloud、AWS、Meta 旗下的 WhatsApp 與 Instagram 都在其中。很多人以為資料放在台灣機房就安全，但只要服務商總部在美國，美國的 CLOUD Act（2018 年通過）就能要求它交出所掌控的資料，伺服器放哪裡不影響[^7]。歐盟為了同樣的問題跟美國周旋多年、打過好幾輪官司，台灣連對等的資料保護協定都沒有，處境更被動。真正有效的防線是端對端加密（E2EE），金鑰不在服務商手上，就算資料被交出、或在傳輸途中被擷取，沒有金鑰也讀不到內容，對附帶蒐集與後門搜尋都擋得住。

端對端加密保護的是通訊內容，Tor 進一步遮住連線本身。Upstream 從網路骨幹擷取流量，拿到的是你連去哪、跟誰往來這類連線資訊。台灣是海島，對外連線高度依賴國際海纜[^8]，通往美西、美東的跨太平洋纜線是重要幹道之一，連線只要目的地或路由經過美國骨幹，封包就落在 Upstream 的擷取範圍內。Tor 把流量加密後經多個中繼轉送，骨幹上只看得到一段加密的 Tor 流量，業者那邊也對不出真正的使用者，等於打斷 PRISM 與 Upstream 所仰賴的連線對應關係。Tor 擋得住這種大規模被動蒐集，但擋不了針對個人的主動入侵，例如利用瀏覽器漏洞去匿名化，史諾登文件裡 NSA 的 Tor Stinks 簡報就坦承，只能去匿名化一小部分使用者[^9]。運作原理見 [什麼是 Tor](../../tools/what-is-tor.md)。

### 誰的風險更高，社群能一起做什麼

需要跟海外編輯室、國際組織、消息來源往來的記者與公民團體，跨境通訊本來就多，附帶蒐集碰到他們的機率比一般人高，這些角色值得把防護等級拉高，敏感協作走 Tor、不要把消息來源名單放在美國企業的雲端，延伸的角色指南見 [記者如何保護消息來源](../../scenarios/journalist.md) 與 [社運行動者的數位準備](../../scenarios/activist.md)。匿名網路社群 anoni.net 把力氣放在去中心、自架與加密這些靠自己的能力上，而不是等哪條法律來保障，正是因為 702 到期當天蒐集照舊、EO 12333 不受影響這個現實。同樣的令狀門檻問題在台灣也有自己的版本，通訊保障及監察法、科技偵查相關立法的爭議都是本地戰場，相關討論見 [台灣個資法 2025 修法](../../taiwan/pdpa-2025.md) 與 [揭弊者保護法的技術觀察](../../taiwan/whistleblower-law.md)。

702 暫時失效不會讓監控立刻消失，跨境通訊的隱私風險也不會因此歸零。對每一個身在美國境外的人，真正要盯緊的是授權監控的法律結構，先確認自己在這套結構裡的位置。今天就能做的第一步，是把日常聯絡換成預設端對端加密的工具，敏感的對外連線走 Tor。

## 相關閱讀

- [端對端加密如何運作](../../advanced/e2ee.md)：為什麼加密過的內容就算被擷取也讀不到
- [什麼是 Tor](../../tools/what-is-tor.md)：多重中繼轉送如何打斷大規模被動蒐集靠的連線對應
- [匿名通訊工具比較](../../tools/messaging-comparison.md)：哪些通訊工具預設端對端加密、各自的取捨
- [為什麼 Metadata 比你想的更暴露](../../basics/metadata.md)：就算讀不到內容，「誰跟誰、何時何地」本身就足以下決定
- [威脅模型：先想清楚你在防誰](../../basics/threat-model.md)：把國家級監控放進自己的威脅模型
- [台灣個資法 2025 修法](../../taiwan/pdpa-2025.md)：在地的資料保護制度脈絡

---

> 本文編譯自 EFF Deeplinks 文章 [Victory! 702 has Expired!](https://www.eff.org/deeplinks/2026/06/victory-702-has-expired){target="_blank"}（作者 India McKinney，2026-06-12），並補上 Section 702 的背景、跟史諾登事件的關聯，以及台灣觀點。

[^1]: [Victory! 702 has Expired!](https://www.eff.org/deeplinks/2026/06/victory-702-has-expired){target="_blank"} - EFF Deeplinks（作者 India McKinney，2026-06-12）
[^2]: [Upstream vs. PRISM](https://www.eff.org/pages/upstream-prism){target="_blank"} - EFF（說明 702 之下 Upstream 與 PRISM 兩種蒐集方式，及其與 2013 年史諾登揭露的關係）
[^3]: [The 702 Ultimatum: Warrant Requirement or Bust](https://www.eff.org/deeplinks/2026/06/702-ultimatum-warrant-requirement-or-bust){target="_blank"} - EFF Deeplinks（EFF 對本次到期前的主張：加上令狀門檻，否則就讓它到期）
[^4]: [Section 702 of the Foreign Intelligence Surveillance Act, Explained](https://www.brennancenter.org/our-work/research-reports/section-702-foreign-intelligence-surveillance-act){target="_blank"} - Brennan Center for Justice（backdoor searches 次數、違規通報、RISAA 2024 背景）
[^5]: [A key spy authority, Section 702, expired due to inaction in Congress. Here's what happens next.](https://www.cbsnews.com/news/fisa-section-702-expiring-congress-what-that-means/){target="_blank"} - CBS News（到期時間線、Pulte 任命、既有認證延續至 2027 年 3 月）
[^6]: [Foreign Intelligence Surveillance (FISA Section 702, Executive Order 12333, and Section 215 of the Patriot Act)：A Resource Page](https://www.brennancenter.org/our-work/research-reports/foreign-intelligence-surveillance-fisa-section-702-executive-order-12333){target="_blank"} - Brennan Center for Justice（EO 12333 為 NSA 海外監控的主要法源，無 FISC 司法監督，不受 702 到期影響）
[^7]: [Cross-Border Data Sharing Under the CLOUD Act](https://www.congress.gov/crs-product/R45173){target="_blank"} - Congressional Research Service（CLOUD Act 可要求美國服務商交出其掌控的資料，與伺服器所在地無關）
[^8]: [海底電纜：藏在台灣深海的網路護國神山](https://www.bnext.com.tw/article/60585/taiwan-submarine-cable){target="_blank"} - 數位時代（台灣國際海纜主幹道走向）
[^9]: [NSA and GCHQ target Tor network that protects anonymity of web users](https://www.schneier.com/essays/archives/2013/10/nsa_and_gchq_target.html){target="_blank"} - Bruce Schneier（原載 The Guardian，說明 Tor Stinks 與 EgotisticalGiraffe 文件內容）
[^img]: 題圖 [NSA-eagle-2_0.png](https://www.eff.org/files/banner_library/NSA-eagle-2_0.png){target="_blank"}，出自 [EFF 的 NSA 監控專題](https://www.eff.org/nsa-spying){target="_blank"}，作者為 EFF 設計師 Hugh D'Andrade，授權 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/){target="_blank"}。
