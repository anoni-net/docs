---
title: Windows 安全更新
description: Windows 每月更新的白話整理，說明這個月有沒有正在被利用的漏洞、影響的是桌面還是伺服器，以及需不需要馬上更新。
icon: material/microsoft-windows
digest:
  name: Windows
  devices: [windows]
  basis: 依微軟是否標注已被利用分級
---

# :material-microsoft-windows: Windows 安全更新

Windows 每月更新的整理。微軟固定在每月第二個星期二發布（社群慣稱 Patch Tuesday），單月的 CVE 數以千計，2026 年 8 月那一輪寫稿時就有 1506 個。

那個數字涵蓋微軟整個產品線，跟桌面 Windows 直接相關的只是其中一小部分。8 月的 1506 個裡，Windows 本體佔 248 個，Azure Linux（Mariner，用在雲端與容器）佔 698 個，從 Chromium 轉載的 Edge 漏洞佔 362 個，其餘是別的微軟產品。看到「單月上千個漏洞」的說法時，要先知道這件事。比例每個月都不一樣，2026 年 9 月就反過來，截至 9 月 23 日的 2001 個裡有 729 個落在 Windows 本體上。

這一頁只回答三個問題：這個月有沒有正在被實際利用的漏洞、那些漏洞影響桌面還是伺服器、需不需要馬上更新。新版本永遠在最上面。

原始資料來自微軟的 [MSRC 安全更新指南](https://msrc.microsoft.com/update-guide){target="_blank"}，數字是從它的 CVRF 資料整理的。微軟會在發布之後持續修訂當月文件、補進新的 CVE，所以每一則的數字是寫稿當下的快照，事後重數會有出入。9 月那一輪的差距特別大，9 月 11 日寫稿時是 1206 個，六天後重數已經是 1713 個，9 月 23 日再數是 2001 個，那一則因此改成附上查核日期的數字。

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

## 2026 年 10 月

> 2026-10-13 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>截至 10 月 21 日有 2575 個 CVE（Windows 本體 1171 個），206 個被評為 Critical，一個標為已被實際利用，打得到桌面版。CISA 在發布當天就把它收進 KEV。
- CVE-2026-96951：Windows Shell 的安全功能繞過，可以繞過網路標記（Mark of the Web）。從網路下載或從信件、即時訊息收到的檔案，Windows 會加上這個標記，開啟時跳出警告或改用受保護的檢視。攻擊者透過信件或即時訊息送出特製的檔案，使用者點開連結或附件就會觸發，那一層警告不會出現。微軟在資料裡標的是已偵測到利用行為，CVSS 8.8。
- 影響範圍從 Windows 10 的 1607、1809、21H2、22H2 到 Windows 11 的 23H2、24H2、25H2、26H1、26H2，以及 Windows Server 2012 R2 以後。它拿掉的是開啟檔案前的那一層警告，9 月那兩個則是取得權限之後的提權。收到不明來源的檔案就點開，是這類攻擊最常見的起點。
- Windows 本體的 1171 個比 9 月的 729 個又多了一截，幾乎都在 10 月 13 日發布當天就登錄，之後只多了 3 個。最多的四個元件是 DNS Server 52 個、Windows Kernel 46 個、Windows Installer 38 個與 Win32k 36 個。Windows 本體的 Critical 有 42 個，DHCP Server 的 5 個遠端執行程式碼與 VBS Enclave 的 5 個提權最集中。
- 另外兩個是公開揭露、還沒有被利用的。.NET Framework 的 CVE-2026-108398 可以繞過 Windows Defender 應用程式控制（WDAC），需要已經登入的本機攻擊者。CVE-2026-92707 是 .NET 的 SignalR 用的 MessagePack 套件阻斷服務，跟一般桌面使用者關係不大。
- 總數 2575 個裡，Azure Linux 佔 868 個、Edge 佔 255 個。發布當天的總數是 1758 個，之後增加的幾乎都落在這兩條產品線。
- 10 月 29 日再查一次，總數增加到 3327 個、Critical 231 個。10 月 21 日之後補進的 742 個裡，Edge 佔 451 個、Azure Linux 佔 284 個，其餘 7 個分散在其他產品，Windows 本體沒有增加。已被利用的仍只有 CVE-2026-96951。

## 2026 年 9 月

> 2026-09-08 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>截至 9 月 23 日有 2001 個 CVE（Windows 本體 729 個），159 個被評為 Critical，兩個標為已被實際利用，兩個都打得到桌面版。
- 9 月 11 日初次整理時是 1206 個、Critical 119 個，9 月 17 日是 1713 個、137 個。十二天內微軟補進 795 個，Windows 本體只多了 3 個，17 日之後就沒有再變，增加的幾乎都落在其他產品線（Azure Linux 現在佔 718 個）。已被利用的仍是下面兩個，影響範圍與 CVSS 分數也沒有變。
- CVE-2026-81963：Windows Update Stack 提權，影響 Windows 11 的 23H2、24H2、25H2、26H1 與 Windows Server 2025。微軟在資料裡標的是已偵測到利用行為。
- CVE-2026-85880：Windows ALPC（進階本機程序呼叫，系統元件之間互相呼叫的機制）提權，影響 Windows 10 的 1607、1809、21H2、22H2 與 Windows Server 2012 以後。
- 兩個合起來，從 Windows 10 1607 到 Windows 11 26H1 的桌面版都在範圍內。兩個都是提權，CVSS 都是 7.8，都需要先在機器上取得執行機會，配合瀏覽器或文件的漏洞就構成完整的接管。
- Windows 本體的 729 個是這半年最高的一次，同樣以 9 月 23 日的資料重數，8 月是 253 個、7 月是 439 個。數量集中在少數元件上：Windows Biometric Service 64 個、DHCP Server 36 個、NTFS 29 個、Win32k 23 個。
- 對用 Tor Browser 的人來說，這個月兩個被利用的都是提權，正是本頁開頭提到的那個情境：作業系統被取得權限之後，上面執行的匿名工具保護不了你。
- 9 月 25 日 CISA 另外把 8 月修掉的 CVE-2026-65660 收進 KEV。這是 SharePoint 的程式碼注入，影響 SharePoint Enterprise Server 2016、2019 與 Subscription Edition，CVSS 8.8，只打得到伺服器，桌面使用者不受影響。微軟在 8 月那份資料的修訂紀錄裡補了一句「As of 9/25/2026, Microsoft had reliable evidence of observed attacks」，已被利用的欄位卻仍是 No，只看那個欄位的話會漏掉。管理 SharePoint 的人要確認 8 月的更新已經裝上。
- 10 月 28 日微軟又修訂一次，總數增加到 2988 個、Critical 183 個。9 月 23 日之後補進的 977 個裡，Azure Linux 佔 640 個、Edge 佔 145 個，另有 192 個沒有列出受影響的產品，Windows 本體沒有增加。標為已被實際利用的仍是本則開頭那兩個。

## 2026 年 8 月

> 2026-08-11 · [MSRC](https://msrc.microsoft.com/update-guide){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>1506 個 CVE（Windows 本體 248 個），134 個被評為 Critical，一個標為已被實際利用。
- CVE-2026-68820：WinSock 的輔助功能驅動程式（Ancillary Function Driver）提權。影響 Windows 10 1607 以後的桌面版與 Windows Server 2012 以後，範圍一路涵蓋到現行版本，還在用舊機的人不要以為與自己無關。
- 提權類漏洞的典型用法是接在別的漏洞後面，先從瀏覽器或文件取得執行機會，再用它取得系統權限。單獨看它需要本機執行條件，串起來就是完整的接管。
- 8 月 18 日 CISA 另外把 4 月修掉的 CVE-2026-33824 收進 KEV，代表它已被實際利用。這是 Windows IKE 服務擴充元件（處理 IPsec 金鑰交換的系統服務）的重複釋放漏洞，未經驗證的攻擊者可以從網路遠端執行程式碼，CVSS 9.8，影響 Windows 10 1607 到 Windows 11 26H1 的桌面版與 Windows Server 2016 以後。4 月之後裝過任何一次每月更新的電腦都已涵蓋，還停在 3 月以前的要立刻更新。
- 這個月修掉的 SharePoint 漏洞 CVE-2026-65660 在 9 月 25 日被收進 KEV，寫在 2026 年 9 月那則。

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
- 同月修掉的 CVE-2026-33824（Windows IKE 服務擴充元件的遠端執行程式碼）當時沒有標為已被利用，8 月 18 日被 CISA 收進 KEV，細節見 8 月那則。
- 另外，4 月 13 日 CISA 把 2025 年 11 月就修掉的 CVE-2025-60710 收進 KEV，並標注已知被用在勒索軟體攻擊。這是 Windows 工作主機處理程序（Host Process for Windows Tasks）的連結追隨漏洞，已經能在電腦上執行程式的攻擊者可以藉此提權，影響 Windows 11 24H2、25H2 與 Windows Server 2025，微軟當時評為 Important。2025 年 11 月之後裝過任何一次每月更新的電腦都已涵蓋。
