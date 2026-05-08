---
title: 去中心化網站發布
description: 從自架到 CDN、IPFS、Onion 服務的選擇空間。內容定址 vs 連線匿名兩種設計取捨，以及 anoni.net 文件站的 IPFS + Onion 部署實案。
icon: material/web-box
---

# :material-web-box: 去中心化網站發布

「網站可以怎麼發布」這件事，過去十年多了不少選擇。傳統的「自架伺服器 + DNS」之外，CDN 把內容快取到全球節點降低延遲，IPFS 用內容定址讓檔案在多個節點之間流通，Tor Onion 服務則讓網站直接以 .onion 域名運作於 Tor 網路。後兩者常被一起討論，但解決的問題其實不同：IPFS 著重抵抗刪除與審查，Onion 著重連線匿名與管制規避。這篇文章對照兩者的設計差異、真實世界的合用組合，並以 anoni.net 文件站的部署作為實例。

## 「網站可以怎麼發布」的選擇空間

把網站發布的選項展開，會看到一個從「中心化 + 高效能」到「去中心化 + 抗審查」的光譜：

- **自架伺服器**：自己有 IP、自己有 DNS。完全可控，也完全集中。被封 IP、被沒收伺服器就掛了。
- **CDN**（Cloudflare、Fastly、CloudFront）：邊緣節點代理流量。效能與抗 DDoS 強，但對 CDN 服務商與 root DNS 高度依賴。
- **靜態站託管**（GitHub Pages、Cloudflare Pages、Netlify）：簡化部署，但服務商可單方面下架。
- **IPFS**：內容用 hash 定址，理論上任何節點都可以代為提供。沒有單一可下架的點，但內容存活靠 pin。
- **Onion 服務**：網站直接運作於 Tor 網路，不需要公開 IP、不需要 DNS。連線匿名、抗 IP 封鎖，但效能差、跨設備連線有限。

實際選擇多半是混搭：主站走 CDN 求效能，IPFS 鏡像求抗刪除，Onion 鏡像求抗封鎖。

## IPFS 設計核心

IPFS（InterPlanetary File System）的核心是內容定址（content addressing）。

- **CID**（Content Identifier）：每個檔案算 hash，hash 就是它的位址。同樣的內容在任何節點都是同一個 CID。
- **DHT**（Distributed Hash Table）：節點之間用 Kademlia 演算法找「誰擁有這個 CID」。
- **IPNS**（InterPlanetary Name System）：把可變的「名字」對應到當前的 CID。內容更新時 CID 變，IPNS 紀錄更新。

對網站發布的意義：

1. **沒有單一可下架的位置**：只要有任何節點 pin 著這個 CID，內容就存活。
2. **內容竄改可被偵測**：CID 是 hash，任何竄改都會改變 CID，可被驗證。
3. **跨節點重複利用**：同一檔案不管被多少站引用，CID 唯一，可共用快取。

設計上的限制：

- **內容存活靠 pin**：沒有節點主動 pin 的內容會在垃圾回收中消失。「上 IPFS」不等於「永久保存」。
- **DHT 查詢延遲**：第一次取得內容比 HTTP 慢。
- **網關依賴**：多數使用者透過公開網關（ipfs.io、cf-ipfs.com）讀取，網關被封等於連不上。
- **動態內容受限**：IPFS 適合靜態，動態功能需要額外層。

## Onion 服務設計核心

Tor Onion 服務（v3）讓網站直接運作於 Tor 網路：

- **自描述地址**：.onion 地址本身就是公鑰的 hash，不需要 DNS、不需要憑證授權。
- **Descriptor publishing**：服務透過 Hidden Service Directories（HSDir）發布自己的位置描述。
- **Rendezvous protocol**：使用者與服務透過 Tor 網路內的會合點建立加密連線，雙方都不知道對方的 IP。

對網站發布的意義：

1. **完整連線匿名**：訪客的 IP 對網站不可見，網站的 IP 對訪客也不可見。
2. **不依賴 DNS**：.onion 地址自我驗證，沒有 CA 信任鏈問題。
3. **抗 IP 封鎖**：流量都在 Tor 網路內，封 IP 沒用。
4. **不依賴公開 IPv4**：可從 NAT 後、可從浮動 IP 啟動。

設計上的限制：

- **效能受限**：Tor 三層加密 + 會合點機制，延遲比直連高。
- **依賴 Tor 網路**：Tor Project 與 Tor 中繼網路被封禁時，整個 .onion 生態受影響。
- **不適合大量靜態資產**：圖片、影片走 Tor 成本高。
- **使用者門檻**：訪客需要 Tor Browser 或 Onion-aware 客戶端。

## 兩者解決不同問題

<figure markdown="span">
    <img class="brand-frame" src="../../assets/images/ipfs-vs-onion.drawio.svg" alt="IPFS 與 Onion 架構對照。IPFS 走 gateway → DHT → peer，主要解決抗刪除。Onion 走 Guard → Middle → Rendezvous → HSDir → 服務，主要解決連線匿名">
</figure>

| 維度 | IPFS | Onion |
|---|---|---|
| 主要解的問題 | 抗刪除、抗集中失效 | 連線匿名、抗 IP 封鎖 |
| 訪客匿名 | ❌ 無內建 | ✅ 預設提供 |
| 服務匿名 | ❌ 節點 IP 可見 | ✅ 預設提供 |
| 內容竄改檢測 | ✅（CID hash） | 透過 TLS / 簽章另外提供 |
| 抗下架 | ✅（多節點 pin） | 部分（單一服務可被人為關閉） |
| 大檔效能 | 中等 | 差 |
| 動態內容 | 困難 | 跟一般網站類似 |
| 訪客門檻 | 低（瀏覽器網關） | 高（要 Tor Browser） |

理解這個對照後，組合的邏輯就清楚了。要抗刪除用 IPFS，要連線匿名用 Onion，要兩者都顧就同站雙鏡像。

## 常見組合

### Onion + IPFS 雙鏡像

主站發布到一般 Web，同時：

- IPFS 鏡像：固定 CID 對應每次發布的內容，社群志工可協助 pin。
- Onion 鏡像：跟主站同內容、提供匿名訪問。

EFF、ProtonMail、紐約時報、BBC、CIA 都有 Onion 鏡像。Cloudflare 對 Top 1000 網站提供 .onion 自動鏡像服務。

### IPFS + ENS（以太坊網域系統）

把 IPFS 內容透過 ENS 給一個可記憶的名字（例如 `vitalik.eth`），用 ENS 上的紀錄指到當前 CID。每次更新內容更新 ENS 紀錄。

問題在 ENS 本身依賴以太坊鏈，且 ENS 名字需要付費，不是純粹去中心化。

### Cloudflare 1.1.1.1 onion

Cloudflare 提供其公開 DNS 服務的 .onion 端點，讓 Tor 使用者可以做到「DNS 解析也走 Tor 網路」，避免 DNS 層的監控。

## anoni.net 文件站的實際部署

anoni.net 文件站本身就是一個 IPFS + Onion 雙鏡像案例。簡化的流程：

<figure markdown="span">
    <img class="brand-frame" src="../../assets/images/anoni-deployment.drawio.svg" alt="anoni.net 文件站三軌部署：同一份 GitHub repo 透過三套 build script 處理路徑差異，分別部署到主站 anoni.net、IPFS 網路、.onion 隱藏服務">
</figure>


1. **Source**：MkDocs Material 寫的 markdown，repo 在 GitHub。
2. **Main build**：`build_docs_anoni.sh` 生成 zh-TW / zh-CN / en 三語系靜態網站，發布到 anoni.net。
3. **IPFS build**：`build_docs_anoni_ipfs.sh` 把同一份內容調整為 IPFS 友善的相對路徑，pin 到 IPFS 網路。
4. **Onion build**：`build_docs_anoni_onion.sh` 調整為 .onion 域名相對路徑，部署到 Tor 隱藏服務。

維運上的取捨：

- **IPFS pin 與內容存活**：社群成員可協助 pin 增加存活率，沒有官方保證。
- **Onion 鏡像延遲**：Tor 的延遲讓 SPA 或大型 JS 套件 UX 較差，所以文件站走純靜態 + minimal JS。
- **三套域名的 SEO 與 trust 處理**：搜尋引擎主要索引 anoni.net 主站，IPFS 與 Onion 是備援與抗封鎖層。

實際運作的限制：

- IPFS gateway（ipfs.io）有時不穩定，影響第一次訪問。
- Onion 鏡像的更新頻率比主站慢一拍（部署流程較重）。
- 多語系資源在 IPFS 上會放大 CID 數量，pin 列表變長。

## 已知限制與風險

兩個技術各自有「去中心化」承諾無法完全兌現的地方：

- **IPFS 的內容存活依賴主動 pin**：沒有 pin 就消失。Filecoin、Pinata 等付費 pin 服務在某種意義上重新中心化了。
- **Onion 依賴 Tor 網路**：Tor 中繼節點若大量被封禁、Tor Project 若解散，.onion 生態受影響。
- **兩者的入口仍多半是中心化服務**：使用者透過 ipfs.io 或 Tor Browser 訪問，這些入口本身仍是潛在攻擊面。
- **法律灰色地帶**：架設 Tor exit node、提供 IPFS pin 服務在不同司法管轄下風險不同。

關於 Tor 網路本身的設計與威脅，見 [什麼是 Tor](../tools/what-is-tor.md)。InterSecLab 對中國防火長城資料外洩的分析（[網路政變報告](../reports/interseclab-network-coup/index.md)）也說明了「集中化的審查基礎建設」如何成為去中心化策略的對手。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-chat-question: 什麼是 Tor](../tools/what-is-tor.md)
- [:material-snowflake: Tor Snowflake 橋接點](../tools/tor-snowflake.md)
- [:material-key-chain-variant: 端對端加密如何運作](./e2ee.md)
- [:material-atom-variant: 後量子密碼概觀](./post-quantum.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-server-network: 如何搭建 Tor Relay](../community/setup-tor-relay.md)
- [:material-school-outline: Tor Relay 校園建立](../community/relay-on-campus.md)
- [:material-translate-variant: 中文化與文件翻譯](../community/i18n.md)

</div>
