---
date: 2026-04-10
authors:
    - toomore
categories:
    - 更新
    - Tor
    - Relay
slug: a-server-that-forgets-exploring-stateless-relays
summary: "Tor Project 討論 Stateless Relay：從扣押風險、TPM、遠端證明到 re-sealing 等未解題，評估無狀態中繼的安全與營運取捨。"
description: "完整翻譯 A Server That Forgets: Exploring Stateless Relays，整理無狀態 Tor Relay 的設計脈絡、現有路線與開放問題，文末補上台灣在地觀點。"
---

# 一台會遺忘的伺服器：探索 Stateless Relays

!!! info ""

    以下內容原文翻譯來自以下文章，主詞角色為 Tor Project 與本文作者群：

    - [A Server That Forgets: Exploring Stateless Relays | April 8, 2026](https://blog.torproject.org/exploring-stateless-relays/){target="_blank"}

    文末另有一節「**台灣在地觀點**」，整理這篇文章可延伸的本地討論方向，歡迎直接跳讀。

[![A Server That Forgets](https://forum.torproject.org/uploads/default/original/2X/e/ee9375b0ec3906d4a0338bc230d97d0a659d996a.jpeg){style="border-radius: 10px;"}](https://blog.torproject.org/exploring-stateless-relays/){target="_blank"}

營運 Tor relay 需要長期對抗敵手，這些敵手可能來自私人勢力，也可能來自國家級體系，目標是破壞整體網路，由攻擊其中的節點開始。此外，有些營運者還得面對扣押、搜查，或硬體遭到直接實體接觸。這些情況在[奧地利](https://www.zdnet.com/article/austrian-man-raided-for-operating-tor-exit-node/){target="_blank"}、[德國](https://forum.torproject.org/t/tor-relays-artikel-5-e-v-another-police-raid-in-germany-general-assembly-on-sep-21st-2024/14533){target="_blank"}、[美國](https://www.npr.org/sections/alltechconsidered/2016/04/04/472992023/when-a-dark-web-volunteer-gets-raided-by-the-police){target="_blank"}、[俄羅斯](https://torservers.net/blog/2017-04-14-freebogatov-relaymob/){target="_blank"} 都有先例，也很可能不只這些地方。在這些案例裡，伺服器本身就可能變成風險來源。

Tor 之所以存在，是因為我們希望保護網路使用者，免於不必要的監控。Tor 網路的設計前提是：任何單一營運者或單一伺服器，都不應該能重建「誰正在和誰通訊」。記者、行動者、吹哨者都仰賴這個前提成立。若 relay 被扣押後可交出內容，就會侵蝕整個系統所依賴的信任，而這正是我們想解決的問題。

在這篇文章裡，我們會探索無狀態、無磁碟作業系統如何提升 relay 安全，範圍從韌體一路到使用者空間，重點放在軟體完整性與對實體攻擊的抵抗能力。這份工作來自 [Osservatorio Nessuno](https://osservatorionessuno.org/){target="_blank"} 在義大利營運出口 relay 的經驗。relay 管理方式會因地區、技術能力、預算與司法環境而有很大差異。我們希望推動的是討論，而不是提出唯一解法。

<!-- more -->

## 什麼是無狀態

無狀態系統不會在重開機之間保留任何資料。每次開機都從固定、已知的映像開始，和 [Tails](https://tails.net/){target="_blank"} 的做法類似。把 Tor relay 全部跑在 RAM 的概念不是新提案。專為這個目的打造、基於 uClibc 的微型 Linux 發行版 [Tor-ramdisk](https://archive.torproject.org/websites/lists.torproject.org/pipermail/tor-talk/2015-July/038493.html){target="_blank"}，至少在 2015 年就已存在。

對 relay 營運者來說，這種設計用預設機制提高了安全門檻，也逼迫系統朝更好的操作習慣前進：

- **對實體攻擊的抵抗力**：機器若被扣押或複製，可能沒有可供分析的內容。依部署方式不同，抽取 relay 金鑰可能變得不可行。
- **宣告式設定**：系統透過版本控制管理。無狀態系統每次開機都重新套用宣告內容，不會默默偏離既定設定。
- **不可變執行環境**：檔案系統是唯讀。即便攻擊者拿到程式執行權，也難以把惡意內容跨重開機保留下來。
- **可重現性**：重開機後不改變的系統更容易驗證，也更有機會被重現與稽核。

## 為什麼 Tor relays 很難做到無狀態

Tor relay 的信譽會隨時間累積。穩定運作數月的 relay 會獲得頻寬旗標，對整體網路更有價值。這份信譽綁定在長期加密身份金鑰上。若遺失這些金鑰，relay 就失去身份，也等於失去在網路裡的信譽，必須從零開始。

因此，relay 身份必須在重開機後仍可延續，同時又不能被輕易抽取。把金鑰放在磁碟上可能被扣押與複製。把金鑰放進 TPM 這類安全晶片，對攻擊者來說可能更難下手。

除了身份金鑰，relay 還會累積包含頻寬歷史等臨時資訊的 state 檔。每次重開機都丟棄它會影響效能。若整套系統全在 RAM 執行，作業系統就必須塞進記憶體，無法依賴 swap。當行程超出可用記憶體，核心 OOM killer 會直接終止行程。實務上，把 glibc allocator 改成 jemalloc 或 mimalloc，已被證明可明顯[降低 Tor 記憶體占用](https://1aeo.com/blog/tor-memory-optizations-what-actually-works.html){target="_blank"}，在高負載 guard relay 上可由約 5.7 GB 降到低於 1.2 GB，主因是高 churn 目錄快取物件的碎片化減少。

## TPM 作為主要工具

TPM（Trusted Platform Module）是主機板上的專用硬體晶片，可儲存加密金鑰，並在不曝光私鑰給作業系統的前提下完成加密操作。TPM 可做 sealing，也就是把秘密綁定到機器的特定量測狀態，只有在 TPM 看見和建立金鑰時完全一致的軟體堆疊時，金鑰才可使用。

對無狀態 relay 而言，這代表身份金鑰可跨重開機存活，因為它存在硬體裡，但即使機器遭到實體接觸，也難以用一般方式抽取。TPM 也支援遠端證明，晶片可向外部系統證明機器實際啟動了哪些軟體，並以硬體根信任的簽章背書。這讓節點執行內容有機會在不信任營運者的前提下被驗證。

TPM 不是萬靈丹。Tor 使用的 ed25519 金鑰並不受 TPM 晶片原生支援，所以金鑰雖由 TPM 保護，但仍以位元組字串形式存放在非揮發記憶體，技術上仍可能被匯出。

此外，sealing 也要求你先決定 TPM 要信任哪些軟體狀態。當你更新 kernel 或 bootloader，量測狀態就會改變，必須重新 sealing，而且要能預測下次開機會長成什麼樣子。

## 既有做法

不同營運者在「簡單部署」與「安全深度」之間採取了不同取捨。

### 最小 RAM disk

最簡單的方式是把所有東西跑在 RAM，金鑰手動管理。從 2015 年開始，[Tor-ramdisk](https://archive.torproject.org/websites/lists.torproject.org/pipermail/tor-talk/2015-July/038493.html){target="_blank"} 就在做這件事。身份金鑰透過 SCP 匯出與匯入，若重開機前沒做就等於重新開始。沒有 TPM、沒有遠端證明、沒有 verified boot，只有「RAM 斷電即失」這個保證。即便如此，仍比傳統有磁碟狀態的部署更進一步。

### VM 型 RAM disk

[Emerald Onion](https://blog.emeraldonion.org/evolving-our-tor-relay-security-architecture){target="_blank"} 在 Proxmox hypervisor 上為每個 relay 跑 Alpine Linux 映像（每份 66 MB）。VM 全部開機進 RAM，且不掛持久儲存。身份透過 Tor 的 OfflineMasterKey 功能管理，長期 master key 離線生成，且不接觸 relay。更新靠重建映像，回滾容易，不需要特殊硬體。

### 裸機 + TPM 身份綁定

我們的工具 [Patela](https://github.com/osservatorionessuno/patela){target="_blank"} 走更偏硬體信任鏈的路。relay 透過 [stboot](https://docs.system-transparency.org/st-1.3.0/docs/reference/stboot-system/){target="_blank"} 開機，這個 bootloader 會抓取並驗證已簽署的 OS 映像，再交棒給系統。啟動後，節點透過 mTLS 從中央伺服器拉設定。若中央伺服器被入侵，攻擊者可拒絕服務，但不能把憑證推送到節點，也無法從節點抽取金鑰。relay 身份金鑰存在 TPM 的非揮發區，並綁定量測開機狀態。它可跨重開機存活，且即使遭到實體接觸也難以匯出。代價是營運複雜度變高，需要裸機環境，且每次更新後都要重新 sealing。

## 開放問題

有些問題只出現在我們目前部署裡，有些則是所有無狀態 relay 都會遇到。

### 更新後重新 sealing

當軟體堆疊改變，TPM 的量測狀態也會改變。如何自動化這件事，也就是預測更新後開機量測值，仍是最難的未解題之一。像 systemd-pcrlock 這類工具正在往這方向前進，但還不到開箱即用。

### 無狀態重開機與升級衝突

我們目前用標準 unattended upgrades 更新 Tor binary。但重開機會回到 OS 映像，映像裡可能仍是前一版，結果變成非預期降版。如何同時兼顧自動安全更新與無狀態映像，目前尚未完全解決。

### 記憶體限制

沒有 swap 代表只要超過可用記憶體，行程就可能在沒有預警下被殺掉。Tor 在執行時記憶體用量不易精準預測。前述 allocator 替換確實有很大幫助，但底層限制仍在。

### 網路穩定性

持久性更新要透過重建映像並再次開機套用。relay 若重啟過於頻繁，有機會失去 Stable 旗標，進而影響網路分配給它的流量。

## 未來方向

### 遠端證明

Sealing 是把金鑰綁在機器狀態。Attestation 則是讓節點向外部證明該狀態。驗證方像是設定伺服器，甚至未來可能是 Tor directory authorities，都可發出加密挑戰，只有跑在預期軟體堆疊上的節點能正確回應。這會把開機完整性由本地屬性提升成可遠端驗證屬性，降低對營運者的信任需求。

### 透明日誌

當你擁有可量測開機鏈，就可以把量測結果公開。relay 營運者提供可重現建置配方，任何人都能重算預期雜湊，檢查是否符合 TPM 回報結果。附加寫入型透明日誌可讓這些證明被公開稽核。Tor 社群可以運作獨立監測機制，跨整個 relay fleet 追蹤這些狀態。

### 機密運算

VM 路線可再延伸到 AMD SEV-SNP 這類技術，讓 guest VM 記憶體和 hypervisor 本身隔離。這同樣有助於降低對營運者的信任，也可縮小 VM 與裸機方案間的安全落差。

### 更小型硬體

Walking onions 是一個提議中的 Tor 協定延伸，目標是讓節點不必本地持有整個網路視圖。若 arti 與相關工具能在更小型硬體上運行，現有資源條件下無法承載 relay 的裝置，就可能被納入可行選項。

## 結語

對 Tor 這類系統而言，無狀態設計可以帶來多重收益，既降低攻擊成功機率，也降低營運失誤風險。若後續研究與工程持續推進，整體網路可驗證性與可信度仍有上升空間。

無狀態系統有真實營運成本，也有難度很高的未解題，就算對資源更充足的團隊也一樣。但它仍可作為隱私基礎設施改進的基礎，相關概念與框架也能套用到堆疊中的其他層。

這項工作起於 [Tor Community Gathering 2025](https://tcg2025.4711.se/sessions/stateless_tor_relay/){target="_blank"}，目前仍在進行中。若你有營運 relay、開發 Tor 工具，或對上述開放問題有想法，我們很希望聽到你的回饋。

## 參考資料（原文列舉）

- [Stateless Tor Relay – Tor Community Gathering 2025](https://tcg2025.4711.se/sessions/stateless_tor_relay/){target="_blank"}
- [Patela v1: A Basement Full of Amnesic Servers](https://osservatorionessuno.org/blog/2025/05/patela-a-basement-full-of-amnesic-servers/){target="_blank"}
- [Patela v2: From Certificates to Hardware](https://osservatorionessuno.org/blog/2025/12/patela-v2-from-certificates-to-hardware/){target="_blank"}
- [stboot System Documentation – System Transparency](https://docs.system-transparency.org/st-1.3.0/docs/reference/stboot-system/){target="_blank"}
- [Tor-ramdisk 20150714 Release Announcement](https://archive.torproject.org/websites/lists.torproject.org/pipermail/tor-talk/2015-July/038493.html){target="_blank"}
- [Evolving Our Tor Relay Security Architecture – Emerald Onion](https://blog.emeraldonion.org/evolving-our-tor-relay-security-architecture){target="_blank"}
- [Tor Memory Optimizations: What Actually Works – 1AEO](https://1aeo.com/blog/tor-memory-optizations-what-actually-works.html){target="_blank"}

!!! info "台灣在地觀點"

    放回台灣脈絡，這段討論聚焦在本地實作條件。台灣是高度連網、商業託管成熟，同時也處在區域資訊衝突壓力下的環境，技術方案常會同時面對「可快速落地」和「高壓測試」兩股力量。

    在順利情境下，台灣既有的小型主機供應、資料中心服務和公民科技社群，能讓營運者比較快建立標準化映像、事件應對流程與可驗證的運作紀錄。  
    在不順利情境下，relay 多由志願者分散維運，遇到濫用通報、設備處置要求或法律接觸時，若流程沒先準備好，技術設計再好也不會自動降低人的風險。

    把這篇文放回台灣脈絡，至少有三個延伸方向值得先做：

    1. **志工營運與法律程序**  
       若台灣有 relay 或 exit 營運者，可先整理機房通知、執法接觸、設備扣押的標準應對流程。技術上若先把可擷取資料降到最低，事件發生時才能減少營運者個人風險。

    2. **硬體取得與供應鏈成本**  
       TPM 主機、小型伺服器與代管服務在台灣可取得，但成本差距大。好的情況是，社群能整理出幾種可重現的硬體/映像組合，讓維運和稽核成本可控。若狀況不理想，每個團隊各自組一套，最後安全主張難比較，維護成本也會持續上升。

    3. **可驗證運算的公共討論**  
       可量測開機鏈、遠端證明、透明日誌這些概念，不只適合 Tor 技術圈，也跟公民科技、關鍵基礎設施透明度有關。最理想的結果，是它們變成社群共享、外界看得懂的證據。若落地不佳，就可能只剩少數技術人員看得懂，社會信任仍只能靠口碑。簡單說，就是不要只說「請相信我」，要拿得出外界可檢驗、可稽核的證據。
