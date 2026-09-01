---
title: Windows 安全更新
description: Windows 每月更新的白話整理，說明這個月有沒有正在被利用的漏洞、影響的是桌面還是伺服器，以及需不需要馬上更新。
icon: material/microsoft-windows
---

# :material-microsoft-windows: Windows 安全更新

Windows 每月更新的整理。微軟固定在每月第二個星期二發布（社群慣稱 Patch Tuesday），單月的 CVE 數以千計，2026 年 8 月那一輪有 1506 個。

那個數字涵蓋微軟整個產品線，跟桌面 Windows 直接相關的只是其中一小部分。8 月的 1506 個裡，Windows 本體佔 248 個，Azure Linux（Mariner，用在雲端與容器）佔 698 個，從 Chromium 轉載的 Edge 漏洞佔 362 個，其餘是別的微軟產品。看到「單月上千個漏洞」的說法時，要先知道這件事。

這一頁只回答三個問題：這個月有沒有正在被實際利用的漏洞、那些漏洞影響桌面還是伺服器、需不需要馬上更新。新版本永遠在最上面。

原始資料來自微軟的 [MSRC 安全更新指南](https://msrc.microsoft.com/update-guide){target="_blank"}，數字是從它的 CVRF 資料整理的。

## 急迫程度怎麼判斷

- <span class="urg-tag urg-tag--now">立刻</span>該月有標為已被實際利用的漏洞，且影響範圍包含桌面版 Windows。
- <span class="urg-tag urg-tag--soon">儘快</span>有標為已被實際利用的漏洞，但只影響伺服器產品或自動更新的元件。桌面使用者跟著平常節奏即可，管理伺服器的人優先處理。
- <span class="urg-tag urg-tag--routine">一般</span>該月沒有已被利用的項目。

微軟自己有標 `Exploited:Yes`，這一頁的分級就建立在那個欄位上，再加一層「影響誰」的判斷。

要注意這一頁的「儘快」也可能代表已經有人在利用，只是打不到桌面使用者。看到琥珀色不要理解成「還沒有人在用」，那一級的證據有時候比其他頁面的「立刻」更硬，差別在關不關你的事。判斷不確定時以較高一級為準。

## 先看清楚受影響的是哪一種產品

每個月被實際利用的漏洞裡，很大一部分落在 SharePoint、Exchange、Active Directory Federation Services 這類伺服器產品上。用一般桌面 Windows 的讀者不受那些影響，看到新聞標題寫「微軟修補正在被利用的重大漏洞」不必先緊張，要先確認的是那個漏洞在什麼產品上。

另一個常見的誤會是 Microsoft Defender。它的漏洞修補走的是防毒定義檔的自動更新，不跟著 Patch Tuesday，也不需要使用者做任何事。

在 Windows 上使用 Tor Browser 或其他匿名工具的人另外要知道：作業系統被取得權限之後，上面執行的任何工具都保護不了你。提權（讓程式取得比原本更高的系統權限）類的修補對這個情境的重要性不亞於瀏覽器本身的漏洞。

## 2026 年 8 月

> 2026-08-11 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>1506 個 CVE（Windows 本體 248 個），134 個被評為 Critical，一個標為已被實際利用。
- CVE-2026-68820：WinSock 的輔助功能驅動程式（Ancillary Function Driver）提權。影響 Windows 10 1607 以後的桌面版與 Windows Server 2012 以後，範圍一路涵蓋到現行版本，還在用舊機的人不要以為與自己無關。
- 提權類漏洞的典型用法是接在別的漏洞後面，先從瀏覽器或文件取得執行機會，再用它取得系統權限。單獨看它需要本機執行條件，串起來就是完整的接管。

## 2026 年 7 月

> 2026-07-14 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>2003 個 CVE（Windows 本體 439 個），是這五個月裡最大的一輪，106 個被評為 Critical，三個標為已被實際利用。一般桌面使用者不受那三個影響，管理伺服器的人要優先處理。
- 三個都在伺服器產品上：Active Directory Federation Services 提權、SharePoint Server 提權、SharePoint 遠端執行程式碼。微軟的受影響清單裡，AD FS 那個也列了桌面版的 build，因為它們共用同一份檔案，而 AD FS 這個角色只存在於伺服器，桌面版沒有可利用的路徑。
- 桌面使用者不受這三個影響。管理 SharePoint 或 AD FS 的人要優先處理，SharePoint 的遠端執行程式碼是不需要憑證就能觸發的那一類。

## 2026 年 6 月

> 2026-06-09 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--routine">一般</span>1284 個 CVE（Windows 本體 123 個），82 個被評為 Critical，沒有標為已被實際利用的項目。
- Critical 的數量高不代表急迫。微軟的嚴重度評的是「如果被利用會多嚴重」，跟「有沒有人在用」是兩回事，這一頁的分級看的是後者。這裡的 Critical 數以相異 CVE 計，微軟原始資料是每個受影響的產品各記一筆，直接數會膨脹成好幾倍。

## 2026 年 5 月

> 2026-05-12 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>1129 個 CVE（Windows 本體 74 個），58 個被評為 Critical，三個標為已被實際利用。一般桌面使用者這個月跟著平常節奏即可，三個都打不到你。
- 兩個在 Microsoft Defender 的防護引擎上（阻斷服務與提權），走定義檔自動更新，使用者不需要做任何事。
- 一個是 Exchange Server 的偽冒漏洞，只影響自架 Exchange 的組織。

## 2026 年 4 月

> 2026-04-14 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>682 個 CVE（Windows 本體 139 個），32 個被評為 Critical，兩個標為已被實際利用。
- CVE-2026-32202：Windows Shell 的偽冒漏洞，影響 Windows 10 1607 以後的桌面版與 Windows Server 2012 以後。Shell 是檔案總管與捷徑處理的那一層，偽冒類問題讓惡意檔案在畫面上看起來像正常的東西。
- 另一個是 SharePoint Server 的偽冒漏洞，只影響伺服器。
