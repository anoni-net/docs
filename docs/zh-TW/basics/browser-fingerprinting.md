---
title: 瀏覽器指紋是什麼，為什麼很難擺脫
description: cookie 刪得掉，指紋刪不掉。說明指紋由哪些特徵組成、為什麼結構上難以規避，以及 Tor Browser、Brave、Safari、Firefox、Chrome 現在各自做到哪裡。
icon: material/fingerprint
---

# :material-fingerprint: 瀏覽器指紋是什麼，為什麼很難擺脫

清空 cookie、開無痕視窗、換一個帳號登入，網站仍然認得出來是同一台機器。原因在於辨認的依據沒有存在你的電腦裡。

瀏覽器每次載入網頁，網頁上的 JavaScript 可以問它幾十個問題：螢幕多大、時區設在哪、裝了哪些字型、顯示卡是哪一款、支援哪些功能。單獨看每個答案，跟你一樣的人很多。全部組合起來，跟你完全一樣的人可能一個都沒有。組合出來的識別碼就是瀏覽器指紋（browser fingerprint）。

本頁說明指紋由什麼組成、為什麼結構上難以規避，以及各家瀏覽器現在做到哪裡。平台側主動收集的資料屬於另一個主題，見 [社群平台怎麼收集你的資料](./platform-tracking.md)。

## cookie 刪得掉，指紋刪不掉

cookie 是網站存在你瀏覽器裡的一小段資料，有檔案、有過期時間，你可以刪掉它、拒絕它、定期清空。整套同意機制與「清除瀏覽資料」按鈕都建立在使用者能管理它的前提上。

指紋沒有對應的檔案。網站每次載入時當場量測、當場算出來，關掉瀏覽器再開，答案仍然一樣。沒有「清除指紋」這個操作可以執行，因為沒有東西被存下來。

Google 2019 年的部落格文章裡寫過同一個落差，使用者無法清除指紋，因此無法控制自己的資訊如何被收集，「我們認為這破壞了使用者的選擇權，是錯的」[^google2019]。同一家公司後來的政策走向見下方〈各家瀏覽器現在做到哪裡〉。

## 指紋由哪些東西組成

- **螢幕與視窗**：解析度、色彩深度、視窗尺寸、裝置像素比
- **系統設定**：時區、語言、作業系統與版本
- **字型清單**：裝過的每一套字型都可能被列舉，設計工作者與開發者的機器通常特別好認
- **繪圖硬體**：顯示卡廠牌與型號、支援的功能清單，經由 WebGL 與 WebGPU 取得
- **canvas 與音訊**：請瀏覽器畫一段圖形或運算一段音訊，不同硬體與驅動算出來的結果有微小差異，把結果 hash 成一組值
- **瀏覽器本身**：版本、支援哪些 API、安裝了哪些擴充套件、字型渲染方式

衡量的單位是熵（entropy），也就是一項特徵能把人群切成多少份。時區把整個東亞時區的使用者切在同一格，數以億計的人落在同一個值上，識別力很低。完整的字型清單常常一次就把範圍縮到個位數。

EFF 在 2010 年的 Panopticlick 研究收集了 470,161 個瀏覽器樣本，其中 83.6% 的指紋是唯一的，在裝有 Flash 或 Java 的樣本裡唯一比例升到 94.2%，整體分布至少帶有 18.1 bits 的熵[^eckersley]。樣本來自主動造訪測試站的人，唯一的比例會比真實母體偏高。十六年前的量測已經足以說明問題的規模。

<figure markdown="span">
    <img src="https://assets.anoni.net/diagrams/fingerprint-funnel.zh-TW.svg"
        alt="由上往下收窄的六階漏斗。最上面一階是所有人，往下每一階加入一項瀏覽器指紋的特徵，人群就縮小一次。加上時區之後剩下同一個時區的人，加上語言與作業系統之後還是很多人，加上螢幕與視窗尺寸之後範圍明顯縮小，加上繪圖硬體之後剩下不多，加上完整的字型清單之後常常就只剩你一個。每一階的寬度是示意，不是量測到的數字。">
    <figcaption>每加一項特徵，還跟你長得一樣的人就少一批</figcaption>
</figure>

上面那張圖就是熵的形狀。時區把你留在數以億計的人群裡，字型清單常常一步就把範圍縮到個位數。沒有任何一項特徵單獨認得出你，湊在一起就可以。

## 為什麼結構上難以規避

### 網站本來就要用這些資料

字型清單、螢幕尺寸、繪圖能力，網頁排版與繪圖需要它們決定走哪條路徑。全部拒絕回答，會有網站直接無法運作。任何防護都要在可用性與識別力之間取捨，取捨的位置決定了防護能做多深。

### 偽裝做不完整反而更好認

Pierre Laperdrix 替 Tor Project 寫的指紋介紹文章引用 Eckersley 的說法，把問題稱為可指紋化的隱私增強技術悖論（Paradox of Fingerprintable Privacy Enhancing Technologies）。舉的例子是某個擴充套件改掉一批數值，卻漏改 `navigator.platform`，造出一組現實中不存在的特徵組合，使用者反而更容易被辨認出來[^tor]。

### 追蹤者用的是模糊比對

指紋會隨著瀏覽器更新、換螢幕、安裝新字型而改變。追蹤方不需要前後完全一致，用相近程度加上時間連續性就能把兩組指紋接成同一台機器。FP-Stalker 研究收集了近十萬組指紋、超過 1,900 個瀏覽器實例，其中 50% 的實例在五天內指紋就變過。即使如此，該方法平均仍能追蹤 54.48 天，部分超過 100 天[^fpstalker]。

只改掉一兩項特徵，關聯不一定會斷。

## 三條防護路線

### 一致化

讓所有使用者在同一個欄位回報相同的值，該項特徵的識別力直接歸零。Tor Browser 走這條路，在所有平台回報同一組作業系統資訊、統一時區，並用 letterboxing 在內容周圍加上灰邊，把可視區域對齊到固定尺寸，避免視窗大小洩漏螢幕尺寸[^tor]。

成立條件是使用者群夠大且真的長得一樣，也就是匿名集（anonymity set）要夠厚。代價落在使用者身上，自己去改設定、裝擴充套件、把視窗拉到最大，都會讓你從人群裡凸出來。

### 隨機化

讓同一個人在每個網站、每個瀏覽階段看到的值都不同。值仍然帶有資訊，但兩個網站取得的值對不起來，破壞掉的是可連結性（linkability）。Brave 的 farbling 與 Safari 的雜訊注入走這條路。

這條路線要覆蓋所有欄位才成立。漏掉的欄位會變成穩定的錨點，讓隨機化過的部分失去意義。

### 直接限制

不回答，或只回答粗略值。Firefox 在 `privacy.resistFingerprinting` 開啟時停用 `WEBGL_debug_renderer_info` 擴充，Safari 把回報的螢幕尺寸對齊視窗尺寸、螢幕位置固定為 `(0, 0)`，都屬於這一類[^webkit]。

## 各家瀏覽器現在做到哪裡

| 瀏覽器 | 預設狀態 | 主要路線 |
|--------|----------|----------|
| Tor Browser | 一般使用即生效 | 一致化 |
| Brave | 一般視窗即生效 | 隨機化為主，部分欄位一致化 |
| Safari | 分兩層，指紋腳本封鎖在一般瀏覽預設開啟，雜訊注入預設限無痕視窗 | 腳本封鎖加上雜訊注入與限制回報 |
| Firefox | 無痕視窗與嚴格模式預設開啟 | 腳本封鎖加上限制回報 |
| Chrome | 一般視窗沒有內建防護 | 無 |

**Tor Browser** 的一致化做得最徹底，防護對所有使用者一律生效。代價是要接受固定的視窗尺寸與較慢的連線，換來的是連線層的匿名，其他瀏覽器都沒有提供。

**Brave** 從 2020 年起用 farbling 對半識別性的 API 輸出做輕微隨機化，種子每個瀏覽階段與每個網站各不相同[^farbling]。`1.93` 版把顯示卡資訊納入，WebGL 廠商與繪圖器字串換成通用值，WebGPU 的硬體描述欄位清空，WebGL 擴充清單注入雜訊[^brave]。防護預設開啟，一般視窗就生效。

**Safari** 的防護分兩層。`17.0` 起的進階指紋防護對 canvas、WebGL 讀回與 WebAudio 注入少量雜訊，預設只在無痕視窗開啟，設定裡可以套用到一般瀏覽[^webkit]。`26.0` 起另外加了一層指紋腳本封鎖，擋掉已知的指紋腳本讀取螢幕尺寸、處理器核心數、語音清單、Apple Pay 能力、WebAudio 讀回與 2D canvas，也擋它們寫入長效儲存。Apple 工程師說明這一層屬於智慧型防追蹤的一部分，由「防止跨網站追蹤」這個設定控制，而該設定在一般瀏覽本來就預設開啟[^webkit26]。

**Firefox** 在 `145` 版補上第二階段防護。已知的指紋腳本沿用加強型追蹤保護（Enhanced Tracking Protection）的清單封鎖，未列名的則改用限制 API 輸出的方式處理，兩項都在無痕視窗與加強型追蹤保護的嚴格模式預設開啟。Mozilla 的公告寫著被判定為唯一的使用者比例因此接近減半，全域預設開啟仍在進行中[^mozilla]。另外一個開關 `privacy.resistFingerprinting` 沿用 Tor Browser 的一致化路線，預設關閉，需要自行到 `about:config` 開啟。

**Chrome** 的一般視窗沒有針對指紋的內建防護。無痕視窗有 IP Protection，2025 年 7 月起推送，遮蔽的是第三方情境下的 IP 位址，處理範圍不含裝置指紋[^ipprotection]。2019 年啟動的 Privacy Sandbox 把指紋識別列為要解決的問題，到 2025 年 4 月計畫收束為止，沒有推出針對指紋的防護措施[^register]。

同一家公司的廣告政策走向相反。Google 在 2024 年 12 月 18 日公告修改廣告平台政策，移除禁止使用裝置指紋的條款，2025 年 2 月 16 日生效[^policy]。英國資訊專員辦公室（Information Commissioner's Office, ICO）隔日發布的回應寫著該決定不負責任，使用指紋識別的業者仍須證明符合資料保護法在透明、同意與可刪除等方面的要求[^ico]。

## 自己測一次

EFF 的 [Cover Your Tracks](https://coveryourtracks.eff.org/){target="_blank"} 會列出瀏覽器回報的各項特徵，並標出每一項的識別力。[AmIUnique](https://amiunique.org/){target="_blank"} 提供另一組樣本可以對照。

測試站的樣本來自主動造訪的人，判定為唯一的比例會偏高。逐項看哪幾個欄位識別力最高比較有用，那些欄位是你調整之後收益最大的地方。

在 Tor Browser 上測出「跟其他人一樣」才是預期結果，測出唯一反而代表設定被改動過。

## 你能做什麼

依成本分三級，每一級後面標出擋不掉什麼。

### 低成本

- **換一個預設就處理指紋的瀏覽器**：Brave 安裝完即生效，Firefox 把加強型追蹤保護切到嚴格模式，Safari 在設定裡把 `17.0` 那層進階防護也套用到一般瀏覽
- **不要為了隱私安裝一堆改指紋的擴充套件**：覆蓋不完整的偽裝會製造出獨特的組合，效果與目標相反

你主動登入的帳號擋不掉，指紋防護處理的是不具名的跨站關聯，登入行為本身直接告訴網站你是誰。

### 中成本

- **用途分開，用不同的瀏覽器**：同一個瀏覽器開不同 profile 對指紋沒有幫助，硬體與系統特徵在 profile 之間完全相同
- **擋掉第三方腳本**：uBlock Origin 之類的工具能減少有機會量測你的對象
- **減少可列舉的特徵**：非必要的字型與擴充套件移除掉

這一級處理掉一部分跨站關聯，擋不掉的是第一方網站自己執行的量測。

### 高成本

- **用 Tor Browser 並且不改設定**：見 [Tor Browser 進階設定](../tools/tor-browser-advanced.md)
- **敏感用途換一台裝置**

換裝置與換工具改變的是關聯，你在單一網站上留下的內容沒有因此減少，自願交出去的資訊也一樣。

這三級都假設你所在的法域不限制這些工具。中國大陸的 Tor 直連無法使用，需要 bridge 或其他接入方式，區域內也有幾個法域把使用規避工具本身列入風險，取捨見 [威脅模型如何建立](./threat-model.md)。

## 幾個沒有幫助的做法

- **無痕視窗**：清掉的是本機紀錄、cookie 與登入狀態，指紋照樣算得出來。Safari 與 Firefox 的無痕視窗確實帶有額外防護，效果來自那些防護本身
- **VPN**：換掉的是 IP 位址，指紋完全不變，見 [VPN 的風險與選擇](../tools/vpn-guide.md)
- **手動改 User-Agent**：多半讓你更好認，理由見上方〈偽裝做不完整反而更好認〉
- **定期清 cookie**：對指紋沒有作用

## 本頁會過期

瀏覽器每幾個月改版一次，預設值與功能名稱都會變動。本頁寫的是機制與判斷方式，實際狀態請以各瀏覽器當下的官方說明為準。發現描述與現況不符，歡迎到 [社群 Matrix 公開 room](../community/tools.md) 回報。

## 接下來

- [社群平台怎麼收集你的資料](./platform-tracking.md)：指紋在整套追蹤生態裡的位置
- [威脅模型如何建立](./threat-model.md)：先確認在防誰，再決定要付出多少成本
- [怎麼維持多個網路身分](./multiple-identities.md)：帳號分層碰上指紋時的限制
- [Tor Browser 進階設定](../tools/tor-browser-advanced.md)：一致化路線的實際操作
- [監控現在做得到什麼](./surveillance-capability.md)：把指紋放進四層能力對照

[^google2019]: [Building a more private web](https://blog.google/products-and-platforms/products/chrome/building-a-more-private-web/){target="_blank"} - Justin Schuh，Google，2019 年 8 月 22 日。原文為「Unlike cookies, users cannot clear their fingerprint, and therefore cannot control how their information is collected. We think this subverts user choice and is wrong.」查證日 2026-08-18。
[^eckersley]: [How Unique Is Your Web Browser?](https://coveryourtracks.eff.org/static/browser-uniqueness.pdf){target="_blank"} - Peter Eckersley，Electronic Frontier Foundation，PETS 2010。470,161 個樣本、83.6% 唯一、18.1 bits 熵的數字出自此文。
[^tor]: [Browser Fingerprinting: An Introduction and the Challenges Ahead](https://blog.torproject.org/browser-fingerprinting-introduction-and-challenges-ahead/){target="_blank"} - Pierre Laperdrix，The Tor Project，2019 年 9 月 4 日。一致化路線與 letterboxing 出自此文，該悖論一詞由此文引自 Eckersley 的 PETS 2010 論文。文中的具體做法對應撰文當時的 Tor Browser 版本。
[^fpstalker]: [FP-STALKER: Tracking Browser Fingerprint Evolutions](https://inria.hal.science/hal-01652021v1){target="_blank"} - Vastel、Laperdrix、Rudametkin、Rouvoy，IEEE S&P 2018。近十萬組指紋、1,900 個瀏覽器實例、平均追蹤 54.48 天的數字出自此文。
[^farbling]: [Fingerprinting defenses 2.0](https://brave.com/privacy-updates/4-fingerprinting-defenses-2.0/){target="_blank"} - Brave 隱私更新第 4 篇，2020 年。farbling 的定義與種子機制出自此文。
[^brave]: [Brave improves protections against GPU fingerprinting](https://brave.com/privacy-updates/38-webgl-webgpu-fingerprinting-protections/){target="_blank"} - Brave 隱私更新第 38 篇。`1.93` 版的三項防護出自此文。
[^webkit]: [Private Browsing 2.0](https://webkit.org/blog/15697/private-browsing-2-0/){target="_blank"} - WebKit Blog，2024 年 7 月 16 日。Safari `17.0` 起的進階指紋防護、雜訊注入範圍與螢幕尺寸對齊的說明出自此文。
[^webkit26]: [WebKit Features in Safari 26.0](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/){target="_blank"} - WebKit Blog，2025 年 9 月 15 日。指紋腳本封鎖擋下的 API 清單出自此文，該層屬於智慧型防追蹤、由「防止跨網站追蹤」控制的說明來自 Apple 工程師的公開回覆，見 [Safari 26 advanced fingerprinting protection](https://lapcatsoftware.com/articles/2025/9/4.html){target="_blank"} 的追查紀錄。查證日 2026-08-18。
[^mozilla]: [Firefox expands fingerprint protections: advancing towards a more private web](https://blog.mozilla.org/en/firefox/fingerprinting-protections/){target="_blank"} - The Mozilla Blog，2025 年 11 月 10 日。Firefox `145` 的兩層防護、預設開啟的範圍與唯一比例接近減半的數字出自此文。
[^ipprotection]: [IP Protection](https://github.com/GoogleChrome/ip-protection/blob/main/README.md){target="_blank"} - GoogleChrome/ip-protection，說明文件。適用範圍限無痕視窗、遮蔽第三方情境下的 IP 位址，不處理裝置指紋。查證日 2026-08-18。
[^register]: [Google Chrome lacks browser fingerprinting defenses](https://www.theregister.com/security/2026/04/16/google-chrome-lacks-browser-fingerprinting-defenses/5229136){target="_blank"} - The Register，2026 年 4 月 16 日。Privacy Sandbox 未推出指紋防護的說法引自隱私顧問 Alexander Hanff，Google 未對報導回應。
[^policy]: [Google to lift fingerprinting restrictions amid privacy concerns](https://ppc.land/google-to-lift-fingerprinting-restrictions-amid-privacy-concerns/){target="_blank"} - PPC Land，2024 年 12 月。政策公告日 2024-12-18、生效日 2025-02-16，原政策中「Google doesn't allow fingerprinting」條款被移除的分析另見 [Lukasz Olejnik 的說明](https://blog.lukaszolejnik.com/biggest-privacy-erosion-in-10-years-on-googles-policy-change-towards-fingerprinting/){target="_blank"}。
[^ico]: [Our response to Google's policy change on fingerprinting](https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2024/12/our-response-to-google-s-policy-change-on-fingerprinting/){target="_blank"} - Information Commissioner's Office，2024 年 12 月 19 日。
