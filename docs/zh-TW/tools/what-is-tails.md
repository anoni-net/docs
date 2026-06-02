---
title: 什麼是 Tails
description: Tails 是從 USB 啟動、預設走 Tor、關機後不留痕跡的可攜式作業系統。在台灣的記者、研究者、行動現場工作者，可以用它把高敏感任務跟日常電腦徹底切開。
icon: simple/tails
---

# :simple-tails: 什麼是 Tails？

[Tails](https://tails.net/){target="_blank"}（The Amnesic Incognito Live System，無記憶的匿蹤系統）是一個從 USB 隨身碟或外接硬碟啟動的作業系統。它把 Tor、加密郵件、密碼管理器、檔案 Metadata 清除工具預先打包好，關機後整個記憶體被清空，不留下任何使用痕跡。

對在台灣的我們，Tails 解決的場景很具體：採訪敏感議題的記者要保護消息來源、研究員要處理外來檔案而不污染主機、行動現場要在不熟悉的網路環境工作、機敏檔案要審閱但不希望留在筆電上。這些場景下，「我這台日常電腦」的長期使用痕跡是個大破口，Tails 把任務切到一個臨時的乾淨環境，做完抽 USB 走人。

Tails 基於 [Debian Linux](https://zh.wikipedia.org/zh-tw/Debian){target="_blank"}，由獨立非營利組織開發，跟 Tor Project 長期合作。社群在 2025 年 2 月跟 Tails、Tor 團隊在台北辦過一場 [Pre-RightsCon 工作坊](../blog/posts/rightscon25-pre-event.md)，後續會持續推。

## Tails 的三個設計選擇

Tails 真正的價值在三個刻意的設計選擇所組合出來的工作環境。理解這三點，才知道什麼時候該用、什麼時候用了沒意義。

### 一、無記憶（Amnesic）

<figure markdown="span">
    <a href="../../assets/images/tails-amnesia.svg" target="_blank">
        <img src="../../assets/images/tails-amnesia.svg"
            alt="Tails 關閉後會自動遺忘，重啟後如同全新的環境不留下蹤跡"
            title="Tails 關閉後會自動遺忘，重啟後如同全新的環境不留下蹤跡"
            style="width: 80%;"
        >
    </a>
    <capture>Tails 關閉後會自動遺忘，重啟後如同全新的環境不留下蹤跡[^1]</capture>
</figure>

Tails 完全跑在記憶體裡，不寫硬碟。關機時記憶體清空，這台電腦沒有任何使用紀錄、沒有瀏覽歷史、沒有開過的檔案、沒有暫存。下次開機是全新環境。

對比一般作業系統，即使在「無痕模式」、即使刪除檔案，主機都會留下痕跡：你連過的 Wi-Fi、檔案系統的暫存、瀏覽器的 cookie 與快取、剪貼簿、開過的 USB 裝置。Tails 從根本上不寫，沒有這層問題。

例外是「永久儲存」（Persistent Storage），讓你在 USB 上保留一塊加密區存放金鑰、書籤、文件。需要時可以開、不需要時關掉，預設不啟用。

### 二、預設強制走 Tor

<figure markdown="span">
    <a href="../../assets/images/tails-footprints.svg" target="_blank">
        <img src="../../assets/images/tails-footprints.svg"
            alt="Tails 不留下蹤跡"
            title="Tails 不留下蹤跡"
            style="height: 350px;"
        >
    </a>
    <capture>Tails 在網際網路上不留下蹤跡[^1]</capture>
</figure>

Tails 的所有網路流量都經過 [Tor](./what-is-tor.md)。任何應用程式試圖繞過 Tor 直接連網，會被防火牆攔下並顯示警告。這跟「自己裝 Tor Browser 但其他應用走一般網路」的差別很大：你在 Tails 裡看到的網站不知道你的真實 IP、你下載的 Email 不洩漏連線位置、你連的雲端硬碟看不到你在哪。

審查嚴重地區的使用者，Tails 也支援開機時設定 [Tor 橋接（Bridge）](./what-is-tor.md#中繼點與橋接點)，把「正在使用 Tor」這件事本身藏起來。

### 三、從 USB 啟動，跟主機系統徹底分開

<figure markdown="span">
    <a href="../../assets/images/tails-laptop.svg" target="_blank">
        <img src="../../assets/images/tails-laptop.svg"
            alt="Tails 可運行在 USB 隨身碟或外接硬碟中。"
            title="Tails 可運行在 USB 隨身碟或外接硬碟中。"
            style="width: 80%;"
        >
    </a>
    <capture>Tails 可運行在 USB 隨身碟或外接硬碟中[^1]</capture>
</figure>

Tails 跑在 USB 上，開機選擇從 USB 啟動，主機原本的硬碟不會被讀寫。這意味著：

- 主機本來有惡意軟體，不會影響 Tails 工作階段（前提是惡意軟體沒滲到韌體層）。
- Tails 工作階段內做的事，不會留在主機上。
- 你可以在不信任的電腦上執行高敏感任務（網咖、合作夥伴的筆電），抽 USB 走後，現場那台電腦看不到你做了什麼。

要警告的是，Tails 對韌體層攻擊（BIOS、Intel ME 等）跟硬體鍵盤側錄器無法防禦。在最高威脅模型下，要連硬體都自己控。

## Tails 適合做什麼、不適合做什麼

Tails 是「特定情境的工具」，不是日常作業系統替代品。動手前回頭看 [威脅模型如何建立](../basics/threat-model.md) 對齊預期。

**適合**：

- 高風險的單次或短期任務：審閱外來機敏檔案、處理可疑附件、敏感主題的訪談紀錄。
- 不信任手邊電腦的場景：在合作夥伴電腦、出差住宿提供的工作站、共用空間電腦上工作。
- 行動現場的乾淨工作環境：抗議、選舉觀察、跨境採訪等。
- 跟記者、爆料者的初次接觸與檔案交換（搭配 [OnionShare](./onionshare.md) 在 Tor 上傳檔）。
- 想體驗一個強隱私預設的工作環境，不想動到日常電腦。

**不適合**：

- 日常作業系統。Tails 每次開機都重置，要重裝書籤、重設定、重連 Wi-Fi。長期持續工作用 Tails 很折磨，這是它的設計目標決定的。
- Apple Silicon（M1 到 M4）筆電。Tails 仍然不支援，要在 Mac 上用要找 Intel 時代的舊機。
- 智慧型手機與平板。Tails 是 x86-64 設計，不在 ARM 上跑（Raspberry Pi 也不行）。
- 需要持久狀態的工作。要寫長期專案、要持續的開發環境、要常用本機重型應用程式（例如 Adobe 全家桶、特定設計工具），就不要選 Tails。
- 已經被韌體攻擊或硬體側錄的場景。Tails 的安全保證從 USB 開機那一刻起算，硬體層被入侵就管不著。

## 跟 Whonix、Qubes 的差別

Tails、[Whonix](https://www.whonix.org/){target="_blank"}、[Qubes OS](https://www.qubes-os.org/){target="_blank"} 是匿名作業系統的三個常被比較對象，設計取捨不同：

- **Tails**：USB 啟動、即用即丟、關機遺忘。適合短期任務、不信任手邊主機。
- **Whonix**：兩台虛擬機（一台閘道走 Tor、一台工作站），跑在你日常作業系統裡。適合長期需要 Tor 環境又不想換主機。
- **Qubes OS**：把整台電腦切成多個隔離的虛擬機，每個應用程式群組跑在自己的「qube」裡。適合最高安全需求、願意付學習成本的進階使用者。

完整的選擇邏輯與適合誰見 [Tails、Whonix、Qubes 的差別](./tails-vs-whonix-vs-qubes.md)。

## 如何安裝

Tails 可以從 Windows、macOS、Ubuntu/Linux 製作 USB 開機磁碟，[官方安裝頁](https://tails.net/install/index.en.html){target="_blank"} 有逐步指引。下載大小約 1.6 GB，安裝時間約半小時。

??? warning "硬體相容性"

    Tails 可以運行在大部分不超過 10 年的 Intel 處理器電腦上。

    Tails 不能運行在：

    - Apple Silicon（M1 到 M4）。
    - 智慧型手機與平板。
    - Raspberry Pi、ARM 或 32 位元處理器。

    Tails 或許不能運行在：

    - 記憶體不足 2 GB 的舊電腦上。
    - 部分新顯示卡未被 Linux 良好支援的機型，特別是 Nvidia 與 AMD Radeon 顯示卡常有相容性問題。

    了解更多目前已知的[硬體問題](https://tails.net/support/known_issues/index.en.html){target="_blank"}。

??? info "建議的硬體需求"

    - 至少 8 GB 大小的 USB 隨身碟。安裝時 USB 上的資料會全部清空。
    - 可以從 USB 啟動的裝置。
    - 64 位元 [x86-64](https://zh.wikipedia.org/zh-tw/X86-64){target="_blank"} 處理器。
    - 至少 2 GB 的記憶體，避免使用時卡頓。

## 預裝的工具

Tails 內建一系列預設安全的開源工具：

- **Tor 瀏覽器**搭配 **uBlock Origin**：日常瀏覽。
- **Thunderbird**：加密電子郵件。
- **KeePassXC**：密碼管理（[密碼管理器入門](./password-manager.md) 有更多說明）。
- **LibreOffice**：文書處理。
- **[OnionShare](./onionshare.md)**：透過 Tor 起臨時 onion service 收發檔案、聊天、架站。
- **Metadata Cleaner**：清除檔案的 EXIF、文件作者等隱藏資訊（為什麼重要見 [Metadata 是什麼](../basics/metadata.md)）。
- 完整清單見 [Tails 官方功能頁](https://tails.net/doc/about/features/index.en.html){target="_blank"}。

預設的安全保證：應用程式試圖繞過 Tor 連網會被攔截、永久儲存內容自動加密、關機時記憶體清空。

## 常見問題

??? question "可以裝在 M 系列 Mac 上嗎？"

    目前不行。Tails 跟 Apple Silicon（M1 到 M4）不相容，原因是 Tails 用的 Linux 開機機制跟 Apple 的客製啟動流程不對接。要在 Mac 上跑 Tails 需要找 Intel 時代的舊機型。如果手邊沒有 Intel Mac，考慮在另一台 PC 上做這件事，或改用 Whonix（在現有作業系統裡跑虛擬機，跨平台支援好）。

??? question "Tails 跟 Tor Browser 的差別？"

    Tor Browser 是「我這台日常電腦上多裝一個瀏覽器」，它讓你的瀏覽走 Tor，但其他應用程式（Email、雲端、IDE）仍然走一般網路、仍然會在主機上留下使用痕跡。Tails 是「整個工作階段都在獨立環境裡」，整台機器的所有流量都走 Tor、關機後所有使用紀錄消失。要保護的是「單次瀏覽」就用 Tor Browser，要保護的是「整個工作流程」就用 Tails。

??? question "永久儲存（Persistent Storage）安全嗎？"

    永久儲存是 USB 上的一塊加密區，用 LUKS 全磁碟加密保護，需要密碼才能解鎖。設計上很堅固，但有兩個前提：你的密碼要夠強（建議用 [KeePassXC](./password-manager.md) 產生）、你的 USB 不能在沒鎖定的狀態下離開你（被插上其他電腦讀取就破功）。預設不啟用，需要時再開。

??? question "Wi-Fi 自動連線會不會洩漏我的位置？"

    Tails 預設啟動 MAC 位址隨機化，對 Wi-Fi 熱點而言，每次開機看到的是不同的硬體 ID。這對「你在哪裡」的辨識有幫助。但如果你連到一個跟你長期身分綁定的 Wi-Fi（例如你家或公司網路），Tails 沒辦法保護「這個地點存在過 Tails 連線」這件事。匿名性最高的場景是用陌生網路（咖啡店、圖書館、行動熱點）。

??? question "可以同時保留兩個 USB，一個工作一個個人嗎？"

    可以，這是社群常見做法。一個 USB 對應一個工作情境（例如「採訪 A 議題」、「行動現場 B」），各自的永久儲存獨立、各自的金鑰獨立。只要不在同一次開機裡混用兩個 USB 即可。

??? question "Tails 多久更新一次？"

    約四週一個更新週期[^2]。建議定期更新，每次新版會修補 Debian、Tor、瀏覽器的安全更新。Tails 內建的更新工具會在連網時提醒你。重大版本更新有時需要手動下載新版鏡像重做 USB。

## 接下來

下載 [Tails 安裝指引](https://tails.net/install/index.en.html){target="_blank"}，按官方步驟做一支 USB。如果你是記者、研究者、行動工作者，可以延伸看 [記者保護消息來源](../scenarios/journalist.md) 與 [上傳機敏資訊流程](../community/upload-sensitive.md) 把工作流程一起設計起來。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-chat-question: 威脅模型如何建立](../basics/threat-model.md)
- [:material-chat-question: Tails、Whonix、Qubes 的差別](./tails-vs-whonix-vs-qubes.md)
- [:material-share-variant-outline: OnionShare](./onionshare.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-newspaper-variant-outline: 記者保護消息來源](../scenarios/journalist.md)
- [:material-upload-outline: 上傳機敏資訊流程](../community/upload-sensitive.md)
- [:material-list-status: OONI 網站檢測清單](../taiwan/ooni-checklist.md)

</div>

[^1]: [圖片來源自 tails.net](https://tails.net/){target="_blank"}
[^2]: [Should I update Tails using apt upgrade or Synaptic?](https://tails.net/support/faq/index.en.html#upgrade){target="_blank"}
