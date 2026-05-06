---
title: 什麼是 Tails？
description: Tails，全名為「The Amnesic Incognito Live System」（無記憶的匿蹤系統），是一個以提升使用者的隱私與網路匿名性為目標的操作系統。
icon: material/chat-question

---
# :material-chat-question: 什麼是 Tails？

<figure markdown="span">
    <a href="https://upload.wikimedia.org/wikipedia/commons/9/99/Tails-logo-flat-inverted.svg" target="_blank">
        <img src="https://upload.wikimedia.org/wikipedia/commons/9/99/Tails-logo-flat-inverted.svg"
            alt="Tails 是一個可攜式作業系統，能抵禦網路監控與審查。"
            title="Tails 是一個可攜式作業系統，能防範監控與審查。"
        >
    </a>
    <capture>Tails 是一個可攜式作業系統，能防範監控與審查[^1]</capture>
</figure>

[Tails](https://tails.net/){target="_blank"}，全名為「The Amnesic Incognito Live System」（無記憶的匿蹤系統），是一個以提升使用者的隱私與網路匿名性為目標的操作系統。基於 [Debian Linux](https://zh.wikipedia.org/zh-tw/Debian){target="_blank"}，Tails 可從 USB 隨身碟或外接硬碟中啟動，無需安裝在電腦硬碟上，並在關閉後不留下任何使用者痕跡。這樣的設計使其成為追求隱私和對抗監控的使用者的理想選擇。

Tails 的核心功能是通過預先安裝好的 Tor 網路來匿名化網路流量。Tor 能夠隱藏使用者的 IP 地址，並加密傳輸數據資料，使其難以被追蹤或監控。Tails 也內建多種隱私保護工具，包括加密的電子郵件軟體、用於安全地刪除文件的工具以及使文件匿名化的應用軟體。

<figure markdown="span">
    <a href="https://tails.net/index/laptop.svg" target="_blank">
        <img src="https://tails.net/index/laptop.svg"
            alt="Tails 可運行在 USB 隨身碟或外接硬碟中。"
            title="Tails 可運行在 USB 隨身碟或外接硬碟中。"
            style="width: 80%;"
        >
    </a>
    <capture>Tails 可運行在 USB 隨身碟或外接硬碟中[^1]</capture>
</figure>

Tails 也注重使用者的便利性，提供一套完整且熟悉的桌面環境，讓使用者能夠在安全的情況下使用日常的應用軟體。為了應對不斷變化的網絡威脅，Tails 定期更新（通常四週為一個更新週期[^2]），以持續提升其安全性。

在現今注重網路自由與隱私的時代，Tails 成為那些面對網路審查、新聞媒體、獨立記者、公民團體以及任何重視個人隱私的使用者的重要工具。透過與 Tor 和 OONI 等組織的合作，Tails 努力保障每一個人都能在網路世界中自由自在地交流與表達意見。

!!! info "工作坊活動"

    我們曾經在 2025/02/23 與 Tor/Tails 團隊舉辦過一場[工作坊活動](../blog/posts/rightscon25-pre-event.md)，活動對象針對在臺灣的新聞媒體、獨立記者、公民團體的日常使用情境推廣使用。預計規劃在臺灣舉辦更多的工作坊活動，可以透過這裡持續關注我們。

## 如何運作

### 何處都是你的電腦

Tails 的下載大小為 1.6 GB，安裝時間約為半小時。Tails 可以安裝在任何至少 8 GB 的 USB 隨身碟上。可在大多數不超過 10 年的電腦上運行。關閉 Tails 後，即可重新啟動該電腦上原本的作業系統。

您不必擔心電腦中有病毒，因為 Tails 是獨立於其他作業系統運行的，並且從不使用該電腦的硬碟（因為是運行在記憶體中）。但是，如果您從有病毒的電腦上初次安裝 Tails，或者在具有惡意硬體（例如鍵盤記錄器）的電腦上使用 Tails，它不一定能夠始終保護您。

### 自動遺忘

<figure markdown="span">
    <a href="https://tails.net/about/amnesia.svg" target="_blank">
        <img src="https://tails.net/about/amnesia.svg"
            alt="Tails 關閉後會自動遺忘，重啟後如同全新的環境不留下蹤跡"
            title="Tails 關閉後會自動遺忘，重啟後如同全新的環境不留下蹤跡"
            style="width: 80%;"
        >
    </a>
    <capture>Tails 關閉後會自動遺忘，重啟後如同全新的環境不留下蹤跡[^1]</capture>
</figure>

Tails 總是從原始乾淨狀態開始，當您關閉 Tails 時，您所做的一切都會自動消失。沒有使用 Tails 的情況下，幾乎您做的每件事情都可能在電腦上留下痕跡：

- 您曾造訪的網站，即使是在隱私模式下
- 您開啟過的檔案，即使您已刪除它們
- 密碼，即使您使用密碼管理器
- 您使用過的所有裝置和 Wi-Fi 網路

相反地，Tails 從不將任何資料寫入硬碟，而是僅從電腦的記憶體中運行。當您關閉 Tails 時，記憶體會被完全刪除，抹去所有可能的痕跡。

### 數位安全工具包

Tails 包含了一系列開源應用軟體，用於處理機敏文件和安全的通訊。所有應用程式均為即時可用，並設置為安全的預設值以防止後續調整錯誤。

Tails 包含：

- **Tor 瀏覽器**搭配 **uBlock**，一個安全的瀏覽器和廣告攔截器
- **Thunderbird**，用於加密電子郵件
- **KeePassXC**，用於創建和儲存強密碼
- **LibreOffice**，一套辦公室軟體套件
- **[OnionShare](./onionshare.md)**，透過 Tor 起臨時 onion service，傳檔、收檔、架站、聊天
- **Metadata Cleaner**，用於移除檔案中的中繼資料
- ... 以及[其他更多的軟體](https://tails.net/doc/about/features/index.en.html){target="_blank"}。

為了防止錯誤：

- 應用程式若試圖不透過 Tor 連接到網際網路則會自動被斷線。
- 永久儲存中的所有內容都會自動加密。
- Tails 不會將任何內容寫入硬碟，關機時記憶體會被完全刪除。

### 在網際網路上不留下蹤跡

<figure markdown="span">
    <a href="https://tails.net/about/footprints.svg" target="_blank">
        <img src="https://tails.net/about/footprints.svg"
            alt="Tails 不留下蹤跡"
            title="Tails 不留下蹤跡"
            style="height: 350px;"
        >
    </a>
    <capture>Tails 不留下蹤跡[^1]</capture>
</figure>

- Tails 進行的網路活動都會經由 Tor 網路，Tor 通過三個中繼節點來加密和匿名化您的連線。每個中繼節點都由世界各地的不同個人或組織運營。單個中繼節點永遠不會同時知道加密連線的來源和目的地，即使某些節點具有惡意，Tor 透過其設計確保安全。Tor 網路擁有超過 6,000 個中繼節點，運營這些節點的組織多樣，包括 MIT 等大學、Riseup 等科技社群、Derechos Digitales 等非營利組織，以及 Private Internet Access 等網際網路託管公司等。運營 Tor 節點的多樣性增加了其安全性和可持續性。
- Tails 可以防止他人監視您的網路連線，從而得知您在網路上的活動。因為審查者無法知道您正在造訪哪些網站，可藉此規避網路審查。如果您所在的地區無法連接 Tor 或連接 Tor 具有危險性（例如在某些審查嚴重的國家），您可以使用 "橋接（bridge）" 來隱藏您已連接到 Tor 網路的事實。
- Tails 可以防止您造訪的網站知道您的所在位置和身份，同時可以匿名瀏覽網站或更改身份。追蹤者和廣告商將無法追踪您的網路活動。您可以使用 Tails 完全匿名地瀏覽或管理社群媒體，只要您僅在 Tails 上訪問它，這些活動就無法與您相關聯。您可以在永久儲存中存放與此不同身份相關的文件和圖片，使用 KeePassXC 保管密碼，並在 Thunderbird 裡使用專門的電子郵件等。

## 如何安裝

Tails 可從 Windows、macOS、Ubuntu/Linux 作業系統中製作 USB 開機磁碟，詳細的安裝過程與步驟可以[參考網站上介紹](https://tails.net/install/index.en.html){target="_blank"}。

??? warning "硬體系統要求"

    Tails 可以運行在：

    - 大部分不超過 10 年的電腦。
    - 一些使用 Intel 處理器的舊電腦上。

    Tails 不能運行在：

    - 新的蘋果電腦，如 M 系列晶片上（M1 ~ M4）。
    - 智慧型手機與平板。
    - Raspberry Pi。

    Tails 或許不能運行在：

    - 記憶體不足 2 GB 的舊電腦上。
    - 某些較新的電腦，舉例來說，如果其顯示卡與 Linux 不兼容，可能會有問題。Nvidia 或 AMD Radeon 顯示卡在 Tails 中常常無法正常運作。

    了解更多目前已知的[硬體問題](https://tails.net/support/known_issues/index.en.html){target="_blank"}。

??? info "建議的硬體需求"

    - 至少 8 GB 大小的 USB 隨身碟。（安裝時 USB 上的資料會全部清空）
    - 可以從 USB 啟動的裝置。
    - 64 位元 [x86-64](https://zh.wikipedia.org/zh-tw/X86-64){target="_blank"} 或 [IBM PC 相容](https://zh.wikipedia.org/zh-tw/IBM_PC%E5%85%BC%E5%AE%B9%E6%9C%BA){target="_blank"} 的處理器。
        - Tails 無法在 [ARM](https://zh.wikipedia.org/zh-tw/ARM%E6%9E%B6%E6%A7%8B){target="_blank"}、[PowerPC](https://zh.wikipedia.org/zh-tw/PowerPC){target="_blank"} 或 32 位元的處理器上執行。
    - 至少 2 GB 的記憶體大小在該電腦裝置上，避免使用時會卡頓或系統崩解。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-chat-question: 網路自由為什麼重要](../basics/internet-freedom.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-access-point-network: ASNs 自治網路觀測資料分析](../taiwan/ooni-asn-coverage.md)
- [:material-list-status: OONI 網站檢測清單](../taiwan/ooni-checklist.md)
- [:material-translate-variant: 中文化與文件翻譯](../community/i18n.md)

</div>

[^1]: [圖片來源自 tails.net](https://tails.net/)
[^2]: [Should I update Tails using apt upgrade or Synaptic?](https://tails.net/support/faq/index.en.html#upgrade)
