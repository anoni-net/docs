---
title: Tails、Whonix、Qubes 的差別
description: 三套常見匿名作業系統的設計目標、適用情境與門檻比較。在台灣的記者、社運參與者、IT 從業者怎麼挑，跟單純用 Tor Browser 差在哪。
icon: material/compare-horizontal
---

# :material-compare-horizontal: Tails、Whonix、Qubes 的差別

多數匿名瀏覽需求，裝 [Tor Browser](./what-is-tor.md) 就夠用。但有些工作會把整台電腦的安全前提一起拖下水：審閱外來機敏檔案、長期維持一個跟你日常身分切開的工作流、要在不信任的硬體上做敏感任務。這時要連作業系統一起切。

社群最常被一起提到的三套匿名作業系統是 [Tails](https://tails.net/){target="_blank"}、[Whonix](https://www.whonix.org/){target="_blank"}、[Qubes OS](https://www.qubes-os.org/){target="_blank"}。它們的設計目標不同，適合的情境也不同。動手前先回頭看 [威脅模型怎麼想](../basics/threat-model.md)，把「我在抗誰、能投入多少」釐清，比直接挑工具更重要。

!!! tip "30 秒結論"

    - **短期高敏任務、不信任手邊電腦**：Tails。USB 開機、關機遺忘，1 小時上手。
    - **長期需要 Tor 工作流、希望保留設定與檔案**：Whonix。雙虛擬機跑在你日常作業系統裡，跨平台。
    - **願意付學習成本、要做嚴格 compartmentalization**：Qubes OS。整台電腦切成多個隔離 qube，IT 陣營與高敏感長期任務首選。

    展開細節見下方各節。

## 三套要解決的問題不一樣

整機隔離跟瀏覽器隔離的差別在攻擊面的大小。Tor Browser 處理的是網頁連線跟身分綁定那一層，但你電腦上其他應用程式（Email 客戶端、雲端硬碟、IDE、輸入法、剪貼簿、字型快取）都還在主機上，跟 Tor 流量並行，留下交叉識別的機會。

Tails、Whonix、Qubes 各自處理這個問題的方向不同。Tails 走拋棄式路線，整次工作階段在 USB 上跑，關機就消失。Whonix 換另一條路：在你日常作業系統裡架兩台虛擬機，一台 Gateway 鎖住所有對外流量強制走 Tor，一台 Workstation 給你做事，整套設定可以持久保留。Qubes 則拉到更上層，用 Xen hypervisor 把電腦切成多個 qube，每個任務在自己的 qube 裡跑，硬體層的攻擊更難跨界。

## 五個比較軸

讀每一套時可以對照這五個軸：

1. **隔離模型**：怎麼切「敏感任務」與「其他東西」的界線。
2. **持久性**：關機後是清空、還是保留你的工作。
3. **硬體需求**：能不能用你手邊的電腦。
4. **學習曲線**：第一次用要花多久才順手。
5. **Tor 整合方式**：流量強制走 Tor，還是要手動處理。

## 軸度速查表

| 軸度 | Tails | Whonix | Qubes OS |
|------|-------|--------|----------|
| 隔離模型 | 整機重置（amnesic） | 雙 VM：Gateway + Workstation | 多 VM compartmentalization |
| 持久性 | 預設遺忘，可選 Persistent Storage | 持久（VM 狀態保留） | 持久（template + qubes） |
| 硬體需求 | Intel x86-64，10 年內機種多數可 | 跨平台（Windows、macOS、Linux），有 VirtualBox 或 KVM 即可 | 對硬體挑剔，要 VT-x、VT-d、16 GB+ RAM、SSD |
| 學習曲線 | 1 小時上手 | 半天到一天理解雙 VM | 一週適應 qube 操作流程 |
| Tor 整合 | 強制全流量走 Tor | Gateway 強制 Workstation 走 Tor，主機 OS 不必走 | 預設不強制，需安裝 Whonix 模板才有 Tor |
| 對應角色 | 記者、社運短期任務、家暴倖存者準備離開 | 長期 Tor 工作流、IT 從業者、跨平台需求 | IT 陣營、高敏感長期任務、嚴格 compartmentalization |

## Tails

[Tails](./what-is-tails.md) 從 USB 隨身碟啟動，跑在電腦的記憶體裡，不寫硬碟。所有流量強制走 Tor。關機時記憶體清空，沒有任何使用紀錄。完整介紹見 [什麼是 Tails](./what-is-tails.md)。

**適合**：

- 記者採訪敏感議題，要保護消息來源、處理外來機敏檔案。
- 社運參與者在行動現場使用陌生網路、共用空間電腦。
- 家暴倖存者準備離開時，需要在加害者看不到的環境中聯繫支援機構（[家暴情境的數位準備](../scenarios/domestic-violence.md)）。
- 跟記者、爆料者初次接觸與檔案交換（搭配 [OnionShare](./onionshare.md)）。
- 不信任手邊電腦的單次任務（合作夥伴的筆電、出差住宿提供的工作站）。

**限制**：

- 不適合當日常作業系統。每次開機重置，要重設 Wi-Fi、重裝書籤、重做設定。
- 不支援 Apple Silicon（M1 到 M4），要找 Intel 時代的舊 Mac 或 PC。
- 預設無持久狀態，要做長期工作必須開 Persistent Storage（加密區），密碼遺失就資料全失。
- 對韌體層攻擊（BIOS、Intel ME）跟硬體鍵盤側錄器無防禦。

## Whonix

[Whonix](https://www.whonix.org/){target="_blank"} 把匿名作業系統拆成兩台虛擬機跑在你日常電腦上：

- **Gateway**：唯一連網的 VM。所有外向流量強制走 Tor。
- **Workstation**：你實際做事的 VM。它的網路只能透過 Gateway 出去，沒有其他出口。

這個雙 VM 架構保證 Workstation 上任何應用程式（即使是惡意軟體）都無法繞過 Tor 直接連網。Gateway 與 Workstation 都是 Debian 基底，跟 Tails 系出同源。可以跑在 [VirtualBox](https://www.whonix.org/wiki/VirtualBox)、[KVM](https://www.whonix.org/wiki/KVM)，或是後面會提到的 Qubes OS 上。

**適合**：

- 長期需要維持一個跟主機切開的 Tor 工作流（每天開機就有同樣的書籤、設定、檔案）。
- 已經會 VirtualBox 或 KVM 的 IT 從業者、開發者，導入成本低。
- 跨平台需求：Windows、macOS、Linux 主機都能跑。
- 在台灣不方便找 Intel x86-64 PC、但手邊有現成筆電的使用者，Whonix 是切進整機隔離的折衷選項。

**限制**：

- 安全前提依賴主機 OS。主機被入侵了，Whonix VM 內的工作也保護不到（Qubes 解這層）。
- VM 跑兩台會吃掉 4 GB+ 記憶體，舊機跑起來會明顯卡頓。
- 不像 Tails 關機就清空，Whonix 是持久環境，使用紀錄會累積在 VM 內。
- macOS 上 Apple Silicon 機型要用 [UTM](https://mac.getutm.app/){target="_blank"} 或 QEMU 跑 ARM64 版本，部分功能尚未完整支援，社群仍在追進度。

## Qubes OS

[Qubes OS](https://www.qubes-os.org/){target="_blank"} 處理的是更前面的問題：整台電腦的隔離。Tails、Whonix 主要圍繞 Tor 流量設計，Qubes 不預設走 Tor，要解決的是同一台電腦上工作、個人、銀行、敏感任務怎麼互不影響。它用 Xen hypervisor 把作業系統切成多個 qube，每個 qube 是一個獨立的 VM，有自己的顏色標示（紅 = 高敏感、黃 = 工作、綠 = 個人、藍 = 銀行等）。

設計重點：

- **Template VM**：一個基底（例如 Debian、Fedora），所有衍生 qube 共享這個 template 的應用程式，但各自有獨立的 home。修補一次 template，所有衍生 qube 一起更新。
- **Disposable VM**（dispVM）：開啟可疑檔案、瀏覽不信任網站時，建立一次性 qube，關閉時自動銷毀。
- **顏色 + 視窗邊框**：不同信任等級的 qube 視覺上分明，避免「我以為這是工作 qube 結果是個人 qube」的混淆。
- **sys-net、sys-firewall、sys-usb**：網路、防火牆、USB 三個系統 qube 各自隔離，惡意 USB 進來只能影響 sys-usb，沒辦法跨到工作 qube。

**Qubes 與 Whonix 的組合**：Qubes 預設不強制流量走 Tor，但官方支援 [安裝 Whonix template](https://www.whonix.org/wiki/Qubes){target="_blank"}，把 Whonix Gateway 與 Workstation 包進 Qubes 的 qube 框架。這是技術上「最強隔離 + Tor 整合」的組合，多數需要這層保護的人會走這條路。

**適合**：

- IT 陣營、安全研究員、長期高敏感任務工作者。
- 願意付學習成本，把 work / personal / banking / 高敏 / 一次性 五類任務嚴格分到不同 qube 的進階使用者。
- 已經有支援硬體（VT-d 必要、16 GB+ RAM、SSD），不用再為 Qubes 換機器。

**限制**：

- 對硬體挑剔。CPU 必須支援 VT-x 與 VT-d，記憶體建議 16 GB 以上，需要 SSD。買機前一定要查 [Hardware Compatibility List](https://www.qubes-os.org/hcl/){target="_blank"}。
- 學習曲線陡。第一週會在「我這個檔案要在哪個 qube 開」、「這個 USB 要怎麼跨 qube 傳檔」這類操作上摸索。
- 預設無 Tor 整合，要 Tor 必須額外裝 Whonix template。
- 不支援 Apple Silicon。

## 對應角色做選擇

依 [威脅模型](../basics/threat-model.md) 的角色思考：

- **一般使用者**（沒有特別敏感工作）：通常不需要這三套任何一套，[Tor Browser](./what-is-tor.md) + [密碼管理器](./password-manager.md) 已經涵蓋多數場景。
- **記者**（保護消息來源）：預設 Tails。詳細工作流見 [記者保護消息來源](../scenarios/journalist.md)。長期跑很多採訪、累積大量檔案，可考慮升級到 Whonix（搭配 [上傳機敏資訊流程](../community/upload-sensitive.md)）。
- **社運參與者**：行動現場 Tails（USB 帶著走，被臨檢時抽出來），長期協作回家用一般筆電 + Signal。詳細場景見 [社運行動者的數位準備](../scenarios/activist.md)。
- **家暴倖存者**（準備離開）：Tails 在加害者看不到的環境（圖書館、咖啡店）使用。詳細場景見 [家暴受害者的數位準備](../scenarios/domestic-violence.md)。
- **IT 從業者、安全研究員**：依硬體與時間投入挑 Whonix（低門檻）或 Qubes（高隔離）。需要把 work / personal / banking 嚴格分開的選 Qubes。
- **跨平台 macOS 使用者**：Apple Silicon 機型實際可選的只有 Whonix on UTM（仍實驗性）。要做嚴肅的整機隔離工作，多數人會準備一台 Intel PC。

## 在台灣的補充

- **取得管道**：Tails、Whonix、Qubes 三套官網在台灣都直連無問題，下載速度可考慮 [Tails 鏡像清單](https://tails.net/install/index.en.html){target="_blank"}。Tor Browser 不必橋接就能下載，這層門檻比審查地區低得多。
- **硬體取得**：台灣常見的 Intel-based ThinkPad（X、T、P 系列）多數在 Qubes HCL 上有相容紀錄。Apple Silicon 在 Tails 與 Qubes 上不可用，買機前一定先查 [HCL 官方頁](https://www.qubes-os.org/hcl/){target="_blank"}。Whonix 跨平台靈活，現有筆電多半能跑。
- **社群實踐**：anoni.net 社群長期推 Tails 工作坊，2025 年 2 月跟 Tails、Tor 團隊在台北辦過一場 [Pre-RightsCon 工作坊](../blog/posts/rightscon25-pre-event.md)。Whonix、Qubes 在台灣社群既有經驗較少，如果你長期使用任一套，歡迎到 [Matrix 公開 room](../community/tools.md) 分享經驗。

## 常見問題

??? question "我只是想匿名瀏覽，需要這麼複雜嗎？"

    多數情境不需要。[Tor Browser](./what-is-tor.md) 在你日常電腦上裝起來，就能解決「不洩漏 IP、不洩漏瀏覽身分」這層需求。會走到整機隔離這套討論，通常是因為「我電腦上其他應用、其他檔案會跟敏感任務交叉」「我不信任手邊這台電腦」「我長期維持一個跟日常身分切開的工作流」。如果你的需求是單次匿名瀏覽，不必動到 Tails、Whonix、Qubes 任何一套。

??? question "Tails 上能不能也跑 Whonix？"

    技術上可，實務上不建議。Tails 設計就是整台機器強制走 Tor、關機遺忘，再疊一層 Whonix 雙 VM 架構是把已經夠強的隔離又包一層。兩套設計目標不重疊。短期任務 Tails 自己就夠，長期 Tor 工作流改用 Whonix（直接裝在主機 OS 上）會比較順，要做嚴格 compartmentalization 應該整套換 Qubes（搭配 Whonix template）。混用沒有顯著好處且增加維運負擔。

??? question "Qubes 真的需要這麼好的硬體嗎？"

    要。Xen hypervisor 與多 qube 平行跑要 CPU 支援 VT-d（很多消費級 CPU 沒有，買前必查）、記憶體建議 16 GB 起跳（每個 qube 自己佔 1-2 GB）、SSD 必要（HDD 跑多 qube 會卡到崩潰）。沒有支援硬體就直接跑不起來，這是 Qubes 的硬性門檻。預算有限的話，從 Whonix 開始累積經驗，硬體升級後再轉 Qubes 是合理路徑。

??? question "Mac M 系列能跑哪一套？"

    - **Tails**：完全不能。Tails 不支援 Apple Silicon。
    - **Whonix**：可以透過 [UTM](https://mac.getutm.app/){target="_blank"} 跑 ARM64 版本，仍在社群實驗階段。日常可用但要追進度。
    - **Qubes**：完全不能。Qubes 需要 x86-64 + VT-d，Apple Silicon 是 ARM 架構，沒有計畫支援。

    多數 Apple Silicon 使用者要做整機隔離，會準備一台 Intel PC（二手 ThinkPad 是常見選擇）。

??? question "我已經會 Linux，能跳過 Tails 直接學 Qubes 嗎？"

    可以，但要評估三件事：硬體成本（Qubes-相容機可能要新買）、學習投入（一週內無法上手）、實際使用頻率（裝起來放著不用會浪費）。如果你的需求是「短期高敏任務」，跳過 Tails 直接 Qubes 過頭。如果你的需求是「長期嚴格 compartmentalization」，跳 Tails 直接 Qubes 是合理的。中間地帶可以從 Whonix 過渡。

## 接下來

Tails 的完整介紹與安裝步驟在 [什麼是 Tails](./what-is-tails.md)。Whonix 從 [官方下載頁](https://www.whonix.org/wiki/Download){target="_blank"} 起步，VirtualBox 路徑最簡單。Qubes 的硬體門檻高，建議先到 [Hardware Compatibility List](https://www.qubes-os.org/hcl/){target="_blank"} 確認手邊機器能不能跑，再去抓 [安裝鏡像](https://www.qubes-os.org/downloads/){target="_blank"}。

整機隔離只是匿名實踐的一塊。連線層的 [Tor](./what-is-tor.md)、瀏覽器層的 [Tor Browser 進階設定](./tor-browser-advanced.md)、檔案傳輸的 [OnionShare](./onionshare.md) 都是配套，要看自己的威脅模型整體配。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-chat-question: 威脅模型怎麼想](../basics/threat-model.md)
- [:simple-tails: 什麼是 Tails](./what-is-tails.md)
- [:material-share-variant-outline: OnionShare](./onionshare.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-newspaper-variant-outline: 記者保護消息來源](../scenarios/journalist.md)
- [:material-upload-outline: 上傳機敏資訊流程](../community/upload-sensitive.md)
- [:material-account-group-outline: 社運行動者的數位準備](../scenarios/activist.md)

</div>
