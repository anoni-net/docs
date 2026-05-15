---
title: 校園 Tor Relay：給校方與法務的 FAQ
description: 整理校方資訊中心、法務、網管最常擔心的十個問題與回應建議。提案前可直接附在計畫書後面、面談前可先寄給對方先讀。每題都補上台灣脈絡，方便引用。
icon: material/chat-question-outline
---

# :material-chat-question-outline: 校園 Tor Relay：給校方與法務的 FAQ

這份 FAQ 整理校方資訊中心、法務、網管在面對「校園架設 Tor Relay」時最常擔心的十個問題。內容由 [校園 Tor Relay 提案範本](./campus-tor-relay-proposal.md) 衍生而來，補上台灣脈絡，可直接附在提案文件後面，或在面談前先寄給對方參考。

跟 [如何搭建 Tor Relay](./setup-tor-relay.md) 末尾的個人 operator 視角 FAQ 不同，這頁假設讀者是**學校行政、法務、網管**，重點放在「對學校的風險評估」與「對外被問到時怎麼回答」。

## 怎麼用這份 FAQ

- **提案時**：附在計畫書後面當作附錄一
- **面談前**：寄給資訊中心、網管、法務先讀一遍
- **被問到時**：點開對應問題、複製內容引用
- **頁尾的兩份「一頁摘要」**：30 秒讀完版，適合放在 mail 開頭或當作會議發給對方的 handout

## 常見疑慮 Q&A

??? question "為什麼大學是架設 Tor Relay 的好地方？"

    大學是架設 Tor Relay 的理想場域，因為通常具備良好的網路連線能力，並且擁有豐富的技術人力（包含教授、學生與 IT 團隊）。此外，大學普遍重視思想與言論自由。透過運行 Tor Relay，學校能直接展現自己作為「思想自由守護者」與「反審查先鋒」的形象。

    **台灣脈絡補充**

    台灣已有國立臺灣師範大學資訊工程學系完成首例（2025 年 11 月上線），詳見 [Tor Project blog 客座文章](https://blog.torproject.org/setting-up-tor-university-relay-taiwan/){target="_blank"} 與 [社群訪談](../blog/posts/ntnu-nz.md)。台灣高教體系本來就承載資訊工程、資訊安全、網路治理的教學任務，校園 Tor Relay 可作為實際的教學案例。

??? question "我們不想架 Exit Relay，這樣可以嗎？"

    沒問題。Tor 網路需要各種類型的 Relay 才能保持健康。預設情況下，你所架設的 Relay 會作為 Entry 或 Middle Relay，僅負責在 Tor 節點之間轉送加密流量。這是維護成本最低的 Relay 形式，並且確保你不需要面對任何投訴或其他問題。

    此外，你也可以選擇額外運行 Bridge 或 [Snowflake Proxy](../tools/tor-snowflake.md)，幫助身處網路審查地區的使用者連上 Tor。

    **台灣脈絡補充**

    台灣的校園案例（台師大）即為 **Non-Exit Relay**。建議所有台灣校園 Relay 計畫都先從 Non-Exit 開始，**不要嘗試 Exit Relay**。Exit Relay 需要處理的法律與行政成本遠超出個人或學生社團能負擔的範圍。

??? question "我願意運行 Relay，但不想處理濫用問題，怎麼處理？"

    這正是 Exit Policy（出口政策）存在的原因。每個 Tor Relay 都有 Exit Policy，用來指定允許或拒絕哪些向外的連線。這些設定會透過目錄服務傳送給 Tor 用戶端，確保它們自動避開會拒絕其連線的 Exit Relay。每個 Relay 可依照濫用風險或自身情況，決定允許的服務、主機與網路。

    預設 Exit Policy 允許存取許多常見服務（例如網頁瀏覽），但會限制部分濫用風險高的服務（例如郵件），以及 Tor 網路無法負荷的服務（例如檔案分享預設埠口）。

    若你允許部分出口連線，請務必確認 DNS 解析正常運作。

    **台灣脈絡補充**

    對校園計畫來說，最簡單的處理方式就是 `ExitPolicy reject *:*`，把所有對外連線全部關掉。這樣完全沒有濫用問題可以處理，因為流量根本出不去你的 Relay。詳細設定見 [校園 Tor Relay 架設 SOP](./campus-tor-relay-sop.md#torrc-參考設定)。

??? question "Tor 不是會讓犯罪份子做壞事嗎？"

    Tor 的使命是促進人權，並透過自由、開源的技術，讓使用者抵抗大規模監控與網路審查。Tor 社群對於任何將工具用於不法用途的行為，一向譴責。

    請從這個角度理解這個問題：**犯罪的意圖在於人。** 工具本身不會主動製造犯罪，就像加密、電話、現金都會被惡意使用一樣。如果移除 Tor，有惡意的人會改用其他工具，並不會因此停止。

    同時，Tor 與其他隱私工具能保護真正需要的人，包括防止身份盜竊、實體跟蹤等犯罪，也能協助執法單位調查案件、支持受害者。

    **台灣脈絡補充**

    台灣刑法第 358–363 條（妨害電腦使用罪章）規範的是「無故輸入他人帳號密碼」、「以電腦不正方法獲取他人電磁紀錄」等具體行為。**Middle Relay 不接觸內容、不解析使用者資料、不知道使用者身份**，在法律上跟「網路傳輸基礎設施」的性質類似，跟前述條款的犯罪行為構成要件無關。

    個人資料保護法第 2 條對「個人資料」的定義是「**得以直接或間接方式識別該個人之資料**」。Middle Relay 處理的是 Tor 網路的加密 cells，**沒有可識別資料**，因此不涉及個資處理。

??? question "那分散式阻斷服務攻擊（DDoS）呢？"

    DDoS 攻擊通常仰賴成千上萬台電腦同時發送 UDP 封包，以癱瘓受害者頻寬。

    Tor 僅傳輸正確的 TCP 連線，不傳輸所有 IP 封包。換言之，**Tor 無法傳送 UDP 封包，也無法進行 SYN Flood 等特殊攻擊**。常見的 DDoS 攻擊無法透過 Tor 完成。

    此外，Tor 不允許頻寬放大攻擊：你送進去多少資料，Tor 才會送出多少資料。若攻擊者真的擁有足夠頻寬發動 DDoS，他完全不需要依賴 Tor。

    **台灣脈絡補充**

    台灣 ISP 目前未見針對 Middle Relay 發出的 DDoS 投訴記錄。台師大案例自 2025 年 11 月上線以來，未收到任何 DDoS 相關通報。

??? question "那垃圾郵件（Spam）呢？"

    Tor 預設的 Exit Policy 拒絕所有 SMTP（25 埠口）流量，無法直接透過 Tor 傳送垃圾郵件。

    少數 Relay 可能會開啟 SMTP，但這跟架設一個開放式郵件伺服器沒有差別，並非 Tor 所造成的獨特風險。垃圾郵件發送者也可能透過 Tor 連到開放 HTTP Proxy，或利用安全性不足的 CGI 腳本寄信，甚至控制殭屍網路。事實上，他們在沒有 Tor 的情況下也能做到。

    更重要的是，許多垃圾郵件技術（例如偽造的 UDP 封包）無法透過 Tor，因為 Tor 僅支援 TCP。

    **台灣脈絡補充**

    校園 Relay 採用 `ExitPolicy reject *:*` 後，連 SMTP 也不會出去。Spam 在校園 Non-Exit Relay 上是不存在的問題。

??? question "Tor 常被濫用嗎？"

    Tor 採用 Exit Policy 來降低濫用風險。每個 Relay 都能決定允許或拒絕哪些服務，並公告給用戶端。同時，Tor 有專責的 Network Health 團隊，負責調查惡意 Relay 並將其移出網路。

    Tor 的設計使我們無法監控使用者的行為，這是刻意的。這樣的設計讓 Tor 能夠為人權工作者、記者、家暴倖存者、吹哨者、執法單位等提供強大的隱私與匿名保障。

    **台灣脈絡補充**

    對校園 Non-Exit Relay 而言，「濫用」這個概念本質上不適用，因為你的節點不會接觸任何「使用者最終要存取的內容」。所有經過你節點的流量都是其他 Tor 節點之間的加密轉送，跟「外部世界的內容」之間還隔了至少一層其他 Relay。

??? question "如果架設 Exit Relay，會遇到什麼情況？"

    若你的 Relay 允許出口連線，最終很可能會收到濫用投訴，例如：

    - 有人透過 Tor 連線至 Hotmail 發送勒索信，FBI 聯絡你，你解釋後通常會被接受
    - 有人用 Tor 發送垃圾訊息到 Google Groups，你的 ISP 收到投訴信
    - 有人用 Tor 在 IRC 裡搗亂，你的伺服器可能遭到 DDoS
    - 有人用 Tor 下載盜版電影，你的 ISP 可能收到 DMCA 侵權通知，依據 EFF 的建議模板，通常不會有法律責任

    不同的網路服務供應商對 Tor Exit Relay 的友善程度不同，部分可能支持，部分則較嚴格。你也可能發現，部分網站會封鎖你的 Exit Relay IP，這是常見情況。若要運行 Exit Relay，最好使用不影響其他業務的專用 IP。

    **台灣脈絡補充**

    **強烈不建議在台灣校園架設 Exit Relay**。理由：

    - 台灣校園網路（TANet）對外連線需經教育部審核，Exit Relay 的不可預期性與審核框架不相容
    - 沒有先例可以引用，會增加溝通成本
    - 學生或社團負責人通常無法承擔可能的法律或行政後果

    如果你對 Exit Relay 有興趣，建議用個人 VPS 在海外（與 Tor 友善的雲端供應商）試運行，不要把校園資源拉進來。

??? question "我要如何回應 ISP 的投訴？"

    Tor 專案社群已整理出一套完整的回覆範例，Relay 運營者可依照這些模板回覆 ISP。模板見 [EFF Tor Legal FAQ](https://community.torproject.org/relay/community-resources/eff-tor-legal-faq/){target="_blank"} 與 [Tor abuse-templates](https://community.torproject.org/relay/community-resources/tor-abuse-templates/){target="_blank"}。

    **台灣脈絡補充**

    對校園 Non-Exit Relay 而言，**理論上不會收到任何 ISP 投訴**，因為你的節點不會與外部網站直接通訊。如果真的收到投訴信（例如有人誤以為你是 Exit Relay），可以這樣回應：

    1. 確認對方投訴的事件時間與目的 IP/網址
    2. 出示你的 ContactInfo 與 `ExitPolicy reject *:*` 設定截圖
    3. 引用 [Tor Project 對 Non-Exit Relay 的說明](https://community.torproject.org/relay/types-of-relays/){target="_blank"}：「Non-Exit Relay 僅在 Tor 網路內轉送加密流量，不會與最終目的地建立連線」
    4. 必要時請指導教授或學校法務支援

??? question "Tor 如何處理技術被濫用的問題？"

    Tor 專案譴責任何將技術濫用於犯罪的行為。Tor 的目標是捍衛人權，並會在能力範圍內盡力處理惡意行為，例如封鎖惡意 Relay。

    由於設計原因，Tor 無法監控或禁止使用者的行為。這樣的設計雖可能被惡意利用，但更多時候它保護了真正需要的人，包括：

    - 人權活動家
    - 記者
    - 家暴倖存者
    - 吹哨者
    - 執法人員
    - 其他需要隱私保護的群體

    **台灣脈絡補充**

    台灣社會近年對「揭弊者保護」、「家暴與跟蹤騷擾防制」、「新聞自由」的關注持續上升。Tor 在這些情境中對台灣使用者的價值，跟全球趨勢一致。校園 Relay 是「讓這套基礎設施在台灣可用」的具體貢獻。

    延伸閱讀：[揭弊者保護法技術觀察](../taiwan/whistleblower-law.md)、[家暴受害者的數位準備](../scenarios/domestic-violence.md)（待補）。

## 給網管的一頁摘要

!!! info "30 秒讀完：給網管 / 資訊中心技術人員"

    **這是什麼**

    - Tor Relay（中繼節點），**非 Exit Node**
    - 僅在 Tor 網路內轉送加密流量，不與外部網站直接通訊

    **對外部署需求**

    - 一組固定 IPv4
    - 對外只開放 1 個 TCP port（ORPort 9001，或 443）
    - 選用：80/443 給狀態頁
    - 其餘 port 全封閉

    **不會發生的事**

    - 不解析、不記錄使用者流量
    - 不會收到濫用投訴（Non-Exit）
    - 不會增加校園邊界防火牆的工作負荷
    - 不會影響校園 DNS 或內容過濾政策

    **可逆性**

    - 可在 10 分鐘內下線（停止 systemd 服務）
    - 隨時可移除，不影響校園網路環境

    **參考**

    - 全球大學（Hamburg、Stanford、Cambridge、MIT 等）均有運行
    - 台灣首例：[國立臺灣師範大學資訊工程學系（2025/11 上線）](../blog/posts/ntnu-nz.md)
    - 國際計畫：[EFF Tor University Challenge](https://toruniversity.eff.org/zh-tw/){target="_blank"}

## 給校方行政與法務的一頁摘要

!!! info "30 秒讀完：給校方行政 / 法務"

    **這是什麼**

    校園架設 Tor Relay 是響應 EFF（Electronic Frontier Foundation）與 Tor Project 共同推動的 Tor University Challenge 國際計畫。全球已有多所大學參與（Hamburg、Stanford、Cambridge、MIT 等）。

    **對學校的法律意義**

    - 架設的是 Non-Exit Relay，**法律上類似網路傳輸基礎設施**
    - 不接觸使用者內容、不識別個人資料
    - 跟台灣刑法妨害電腦使用罪章、個資法的構成要件無關
    - EFF 提供完整法律與技術資源支持

    **對學校的形象意義**

    - 展現重視資訊自由與隱私保護的具體實踐
    - 國際接軌：加入全球大學校園網絡
    - 教學意義：作為資訊工程、資訊安全、網路治理的教學案例
    - 研究意義：可作為網路研究與課程素材

    **對學校的營運影響**

    - 可隨時下線（10 分鐘內）
    - 學生與指導教授共同維運，學校行政負擔極低
    - 不需修改現有校園防火牆或內容過濾政策

    **參考案例**

    - 國內：[國立臺灣師範大學資訊工程學系（2025/11 上線）](../blog/posts/ntnu-nz.md)
    - 國際：[Tor Project blog：Setting Up a Tor University Relay in Taiwan](https://blog.torproject.org/setting-up-tor-university-relay-taiwan/){target="_blank"}

!!! tip "下一步"

    讀完 FAQ 對校方疑慮有底之後，依你目前的進度往下：

    - **還沒寫提案**：回到 [校園 Tor Relay 提案範本](./campus-tor-relay-proposal.md)，把它改寫成你學校的版本，並把這份 FAQ 附在後面
    - **提案已通過**：到 [校園 Tor Relay 架設 SOP](./campus-tor-relay-sop.md) 開始技術上線
    - **單純被問到 Tor Relay**：把本頁的 [給網管的一頁摘要](#給網管的一頁摘要) 或 [給校方行政與法務的一頁摘要](#給校方行政與法務的一頁摘要) 直接轉貼給對方

## 相關閱讀

- [校園 Tor Relay 提案範本](./campus-tor-relay-proposal.md)：給其他學校 fork-and-fill 的提案文件
- [校園 Tor Relay 架設 SOP](./campus-tor-relay-sop.md)：技術細節（torrc、UFW、監控、事件處置）
- [台師大案例訪談](../blog/posts/ntnu-nz.md)：第一個成功案例的完整過程
- [什麼是 Tor](../tools/what-is-tor.md)：Tor 基本概念
- [EFF Tor Legal FAQ](https://community.torproject.org/relay/community-resources/eff-tor-legal-faq/){target="_blank"}：美國法觀點的完整法律 FAQ（待翻譯）

## 資料來源與致謝

本 FAQ 的 Q1-Q10 主體由社群夥伴 **蘇恩立（NZ）** 提供，整理自他在台灣師範大學的計畫書原始版本。台灣脈絡補充由匿名網路社群 anoni.net 整理。原始材料由 NZ 同意以本站 [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hant){target="_blank"} 授權釋出。
