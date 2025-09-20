---
date: 2025-09-21
authors:
    - toomore
categories:
    - 文章
    - Tor
slug: tor-sambent-onionmasq
image: "assets/images/tor.webp"
summary: "OnionMasq 透過內核級別網路隔離，確保所有應用程式流量都經由 Tor 路由的實驗性技術，提供比傳統方法更強的隱私與安全性"
description: "OnionMasq 透過內核級別網路隔離，確保所有應用程式流量都經由 Tor 路由的實驗性技術，提供比傳統方法更強的隱私與安全性"
---

# OnionMasq：Tor 為 VPN 式流量隔離實驗修正

_OnionMasq 透過將應用程式置於內核隔離的沙箱中，只存在經由 Tor 路由的網路介面，創造出類似 VPN 的行為，從而消除困擾代理解決方案的繞過漏洞。_

!!! info ""

    以下內容原文翻譯來自以下文章：

    - [OnionMasq: Tor's Experimental Fix for VPN-Style Traffic Isolation, Sam Bent, 2025-09-19](https://www.sambent.com/onionmasq-tors-experimental-fix-for-vpn-style-traffic-isolation/){target="_blank"}

![Tor OnionMasq: Hiding in Plain Sight / Tor OnionMasq：隱身於無形之中](https://www.sambent.com/content/images/size/w2000/2025/09/onion-masq-1.jpg){style="border-radius: 10px;"}

[OnionMasq](https://gitlab.torproject.org/tpo/core/onionmasq){target="_blank"} 是 Tor 專案試圖解決一個基本問題：讓您的應用程式的每個數據封包都無例外地通過 Tor。它是一個實驗性隧道介面，針對 [Arti](https://blog.torproject.org/arti_1_4_0_released/){target="_blank"}（以 Rust 實作的 Tor），透過內核級別的網路隔離來創造類似 VPN 的行為。

這項技術透過建立一個只存在於沙箱內的虛擬網路卡來實現。您的應用程式會將這個假網路介面視為正常使用，而 OnionMasq 攔截所有內容並將其經由 Tor 的加密路由。

<!-- more -->

## OnionMasq 解決的問題

傳統的 Tor 路由工具仰賴於代理攔截。已有 15 年歷史的 [Torsocks](https://gitlab.torproject.org/tpo/core/torsocks){target="_blank"} 使用 `LD_PRELOAD` 技術來攔截網路功能調用，並將它們重新導向至 Tor 的 SOCKS 代理。這種方法在以下三方面會失敗：

* **靜態二進制完全忽略函式庫介面層的攔截：**如果您的應用程式在編譯時就內置了網路程序代碼，而不是使用系統函式庫，torsocks 就無法攔截任何東西。
* **原始系統呼叫繞過使用者命名空間技術**：應用程式可以直接進行內核的呼叫，完全跳過庫函式。
* **配置錯誤會立即發生洩漏**：一個錯誤的代理設定會讓您的流量在明文狀態下傳輸。

OnionMasq 將透過移至 Linux 內核本身來消除這些失敗模式。

## 內核層級的運作方式

Linux **命名空間** 是限制進程可見與可訪問對象的隔離容器。網路環境的命名空間在 2000 年左右引入，創建了獨立的網路環境，讓進程只能使用特定的介面。

實作 OnionMasq 的命令列工具 [Oniux](https://blog.torproject.org/introducing-oniux-tor-isolation-using-linux-namespaces/){target="_blank"} 遵循以下步驟：

* **建立隔離環境**：Oniux 使用 `clone(2)` 系統呼叫將您的應用程式放在網路、掛載、PID 和使用者命名空間中，應用程式在一個封閉的容器中運行。
* **移除對真實網路的訪問**：在命名空間內，您的應用程式看不到 `eth0`、`wlan0` 或任何實體網路介面，正常的網際網路並不存在。
* **安裝虛擬網路卡**：OnionMasq 建立一個名為 `onion0` 的 **TUN 網路介面裝置**，對應用程式來說，它是一個看似真實卻由使用者命名空間軟體控制的假網路介面。
* **將所有流量路由通過 Tor**：TUN 網路介面裝置將所有網路數據封包傳送至 OnionMasq，後者使用 [smoltcp](https://github.com/smoltcp-rs/smoltcp){target="_blank"}（用 Rust 編寫的使用者命名空間網路堆疊）來重組數據資料流量並交給 Arti 引導至 Tor 路由。

## TUN 網路介面裝置說明

一個 **TUN 網路介面裝置** 是在內核和使用者命名空間應用程式之間建立管道的虛擬網路介面。當您的應用程式將 IP 數據封包發送至 TUN 介面時，內核會將其交給管理該介面的程式，而不是將其放到系統的網路介面上。

OnionMasq 管理 `onion0` TUN 介面。應用程式發送的每個數據封包都被攔截，經過 Tor 的路由處理，返回時就如同來自正常的網際網路連接一樣，應用程式完全感受不到差異。

這與一般的 VPN 根本不同，因為 VPN 通常會來自整個系統的路由流量。OnionMasq 則是為每個應用程式建立隔離，每個程式都有自己密閉的網路環境。

## 實際使用

安裝和使用 Oniux 需要 Rust，只在 Linux 上運行：

```bash linenums="1"
cargo install --git https://gitlab.torproject.org/tpo/core/oniux oniux@0.4.0
```

基本用法包括包裝任何指令：

```bash linenums="1"
# 透過 Tor 路由單個指令
oniux curl https://icanhazip.com
# 獲取您的 Tor 出口 IP
oniux curl https://ip.me/
# 訪問洋蔥服務
oniux curl http://duckduckgogg42ts72.onion
# 隔離整個 shell 會話
oniux bash
```

沙箱機制非常廣泛。即使您運行惡意軟體，企圖通過原始系統呼叫或直接網路訪問來繞過 Tor，內核也會阻止它看到除了 `onion0` 介面以外的任何東西。

## DNS 配置細節

在 Tor 環境中，DNS 解析需要特別處理。Oniux 在命名空間內建立了一個自定義的 `/etc/resolv.conf`，指向與 Tor 相容的名稱解析，防止 DNS 查詢通過您的正常解析器洩漏。

技術實作使用 `rtnetlink(7)` 操作來配置虛擬介面，分配 IP 地址和設定路由表。OnionMasq 隨後使用 Unix 域通訊端（Unix domain socket）在程序之間傳遞 TUN 介面文件描述符。

在底層，OnionMasq 通過建立的介面與 Arti 進行通訊。Arti 構建 Tor 連線、加密流量並處理匿名路由。OnionMasq 只是提供隧道管道，讓這些流程建立對應用程式來說是無須關注的。

## 限制與開發狀況

OnionMasq 的**實驗性**狀態是有原因的。Tor 專案明確表示，這不是一個已準備好可正式使用的軟體。[當前限制](./oniux-kernel-level-tor.md){target="_blank"}包括：

* **平台支援有限**：僅適用於 Linux，沒有計畫支援 Windows 或 macOS。
* **新代碼庫風險**：雖然 torsocks 已經過 15 年的實戰考驗，但 OnionMasq 構建在最近的 Rust 元件上，尚未經過真實世界同等級的壓力測試。
* **潛在的效能開銷**：為每一個應用程式建立隔離命名空間可能消耗比基於代理的方法更多的系統資源。
* **功能集不完整**：與已建立的工具相比，進階 Tor 功能和極端案例可能無法正常運作。

Tor 專案請求社群測試和臭蟲報告，以加速開發達到正式使用的準備。

## OnionMasq 與 Torsocks 的技術比較

![OnionMasq 與 Torsocks 的技術比較](https://www.sambent.com/content/images/2025/09/onion-masq.jpg){style="border-radius: 10px;"}

### 未來發展與規劃

Tor 的設計工作包括將 OnionMasq 的功能擴展到目前只支持 TCP 的狀態。[提案 348](https://spec.torproject.org/proposals/348-udp-app-support.html){target="_blank"} 描繪了對 UDP 支援的計劃，而[提案 352](https://spec.torproject.org/proposals/352-complex-dns-for-vpn.html){target="_blank"} 則針對包含 HTTPS/SVCB 等現代記錄類型的複雜 DNS 情境，對 HTTP/3 和 QUIC 協議至關重要。

這些增強功能針對 "VPN 式" 使用模式，使用者期望能夠全面支援至應用程式的使用，而不僅僅只是網頁瀏覽。

### 操作安全影響

OnionMasq 在以下攻擊向量提供了更強的保護：

* **應用程式層級的規避嘗試**：失敗，因為不論應用程式行為如何，內核都會阻止訪問非 Tor 網路。
* **DNS 洩漏防護**：透過命名空間隔離的解析來實現，而不僅依賴於適當的應用程式設定。
* **進程隔離**：意味著即使一個應用程式被攻破，它也無法干擾其他應用程式的 Tor 路由。

不過，實驗性狀態本身也帶來操作風險。需要高可靠性的正式環境應該繼續使用 torsocks，直到 OnionMasq 達到穩定狀態。

## 總結

OnionMasq 代表了 Tor 使用端技術從應用程式層級 Tor 整合轉向內核強制網路隔離的根本轉變。這種方法消除了困擾以往解決方案的整個類別的流量洩漏問題。

這個技術透過建立具有看似正常但將所有內容通過 Tor 路由的虛擬介面的每一應用程式網路沙箱來運作。Linux 內核命名空間提供了隔離，而 OnionMasq 則處理虛擬網路與 Tor 路由之間的隧道接駁。

早期測試顯示這個概念是可靠的，但達正式環境就緒仍需數月或數年。目前，OnionMasq 作為 Tor 使用端技術發展方向的預覽：趨向於更強、內核級別的流量隔離，讓其更難以繞過或配置錯誤。
