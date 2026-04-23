---
date: 2025-05-16
authors:
    - toomore
categories:
    - 技術
    - Tor
    - 翻譯文章
slug: oniux-kernel-level-tor
image: "assets/images/oniux-kernel-level-tor.webp"
summary: "oniux：針對任何 Linux 應用程式的核心層級 Tor 隔離技術"
description: "oniux：針對任何 Linux 應用程式的核心層級 Tor 隔離技術"
---

# 介紹 oniux：針對任何 Linux 應用程式的核心層級 Tor 隔離技術

!!! info ""

    以下內容原文翻譯來自以下文章，主詞角色為 Tor：

    - [Introducing oniux: Kernel-level Tor isolation for any Linux app, cve 2025-05-14](https://blog.torproject.org/introducing-oniux-tor-isolation-using-linux-namespaces/){target="_blank"}

![介紹 oniux：針對任何 Linux 應用程式的核心層級 Tor 隔離技術](https://blog.torproject.org/introducing-oniux-tor-isolation-using-linux-namespaces/lead.webp){style="border-radius: 10px;"}

當啟動對隱私極為重要的應用程式和服務時，開發者希望確保每一個資料封包都確實經由 Tor 傳送。一個錯誤的代理設定，或一次不小心在 SOCKS 封包之外的系統呼叫，可能就會讓你的資料處於風險之中。

正因如此，今天我們很高興地介紹 oniux：這是一款小型的命令列工具，它利用 Linux 命名空間為第三方應用程式提供 Tor 網路隔離。oniux 建構於 Arti 和 onionmasq 之上，可以將任何 Linux 程式分隔到其專屬的網路命名空間中，透過 Tor 路由，並消除資料洩露的可能性。如果你的工作、活動或研究需要堅如磐石的流量隔離，oniux 就能夠滿足這個需求。

<!-- more -->

## 什麼是 Linux 命名空間？🐧

命名空間是 Linux 核心中的一項隔離功能，大約在 2000 年左右引入。它們提供了一種安全的方法，將應用程式的特定部分與系統的其餘部分隔離。命名空間有多種形式，例如網路命名空間、掛載命名空間、行程命名空間等等，每一種都把應用程式的某些系統資源隔離開來。

我們所說的「**系統資源**」指的是什麼呢？在 Linux 中，系統資源是由系統上的所有應用程式共用的。最顯著的例子可能是你的作業系統時鐘，但還有其他許多方面，例如所有行程的列表、檔案系統，以及使用者列表。

命名空間會將應用程式的某個部分與作業系統的其餘部分「容器化」；這也正是 Docker 用來提供其隔離機制的方法。

## Tor + 命名空間 = ❤️

如上所述，命名空間是一個強大的功能，它可以讓我們隔離任意應用程式的 Tor 網路存取。我們將每個應用程式放到一個不具系統範圍網路介面存取權的網路命名空間（例如 `eth0`），而是提供一個自訂的網路介面 `onion0`。

這樣我們就能夠在軟體層面上以最安全的方式透過 Tor 隔離任意應用程式，這主要是依賴於作業系統核心提供的安全基礎。不同於 SOCKS，在這種方式下，應用程式不會因為開發者的一時錯誤，導致未通過設定的 SOCKS 來建立某些連線而意外洩露資料。

## oniux vs. torsocks

你可能也聽說過一個具有類似目標的工具，稱為 `torsocks`，其運作方式是通過覆寫所有與網路相關的 libc 函數，將流量導向由 Tor 提供的 SOCKS 代理。雖然這種方法在跨平台上稍具優勢，但其明顯的缺點是，如果應用程式以非動態連結的 libc 方式進行系統呼叫，不論是惡意或者無意，將會導致資料洩露。這尤其將純靜態二進位檔和 Zig 生態系統中的應用程式排除在外。

以下是 _oniux_ 與 _torsocks_ 的基本比較：

| oniux                | torsocks                                           |
| -------------------- | -------------------------------------------------- |
| 獨立應用程式         | 需要運行 Tor 常駐程式                              |
| 使用 Linux 命名空間  | 使用 ld.so 預載入駭客技術                          |
| 適用於所有應用程式   | 僅適用於透過 libc 進行系統呼叫的應用程式           |
| 惡意應用程式無法洩漏 | 惡意應用程式可以透過直接的組合語言系統呼叫洩漏資料 |
| 僅限 Linux           | 跨平台                                             |
| 新專案且屬於實驗性質 | 經過超過 15 年的實作驗證                           |
| 使用 Arti 作為其引擎 | 使用 CTor 作為其引擎                               |
| 以 Rust 實作         | 以 C 實作                                          |

## 如何使用 oniux？🧅

首先，你需要一個已安裝 Rust 的 Linux 系統。之後，你可以透過以下指令來安裝 oniux：

``` bash
$ cargo install --git https://gitlab.torproject.org/tpo/core/oniux oniux@0.4.0
```

完成後，你就可以開始使用 oniux 了！🙂

使用 oniux 非常簡單：

``` bash
# 使用 oniux 進行簡單的 HTTPS 查詢！
$ oniux curl https://icanhazip.com
<A TOR EXIT NODE IP ADDRESS>

# oniux 當然也支援 IPv6！
$ oniux curl -6 https://ipv6.icanhazip.com
<A TOR EXIT NODE IPv6 ADDRESS>

# 沒有洋蔥服務的 Tor 就像一輛沒有引擎的車……
$ oniux curl http://2gzyxa5ihm7nsggfxnu52rck2vv4rvmdlkiu3zzui5du4xyclen53wid.onion/index.html

# 如果你是技術控，也可以啟用日誌紀錄功能。🤓
$ RUST_LOG=debug oniux curl https://icanhazip.com

# 如果你願意，你可以「Tor 化」整個 shell，將所有行程隔離在其中！
$ oniux bash

# 如果你在桌面環境中，你也可以隔離圖形應用程式！
$ oniux hexchat
```

## 這是如何在內部運作的呢？⚙️

_oniux_ 的運作方式是透過 `clone(2)` 系統呼叫立即產生一個子行程，該行程被隔離在其自己的網路、掛載、PID 和使用者命名空間中。然後，此行程會掛載其自己的 `/proc` 副本，接著按照父行程的 UID 和 GID 設定對應的 UID 和 GID 映射。

接著，該行程會建立一個臨時檔案，包含名稱伺服器（nameserver）項目，然後將這個檔案綁定掛載到 `/etc/resolv.conf` 上，使得在該空間運行的應用程式會使用支援經由 Tor 解析的自訂名稱解析器。

然後，子行程利用 onionmasq 建立一個名為 `onion0` 的 TUN 介面，接著透過一些必要的 `rtnetlink(7)` 操作來設置該介面，比如分配 IP 位址。

接下來，子行程會使用 Unix Domain socket 將 TUN 介面的檔案描述子（File descriptor）發送給一直在等待此訊息的父行程，自從執行最初的 `clone(2)` 後，父行程便在等待這個訊息。

完成這些步驟後，子行程會放棄因為身處使用者命名空間中的 root 行程而取得的所有特權。

最後，使用者提供的指令會透過 Rust 標準庫所提供的功能來執行。

## oniux 是實驗性質的工具 ⚠️

儘管這一部分不應該讓你對使用 _oniux_ 感到卻步，但你應該記住，這是一個相對較新的功能，使用了新的 Tor 軟體，例如 _Arti_ 和 _onionmasq_。目前，雖然功能如預期運作，但像 _torsocks_ 這類工具已經存在了超過 15 年，因此在實戰經驗上更為豐富。然而，我們希望 _oniux_ 能夠達到類似的穩定狀態，因此歡迎你前去嘗試看看！

## 致謝

非常感謝 `smoltcp` 的開發者，這是一個用 Rust 實作完整 IP 協定的 Rust crate，我們大量使用它來實現功能。

還要感謝 `7ppKb5bW`，他教導我們如何在不使用 `capabilities(7)` 的情況下，正確地使用 `user_namespaces(7)` 來實現功能。

最後但同樣重要的是，感謝所有財務上支持 Tor 的人和組織。The Tor Project, Inc. 是一個 501(c)(3) 非營利組織，致力於透過自由軟體和開放網路推動人權和保護線上隱私。oniux 的發佈由支持者的社群提供動力。請考慮今天[捐款](https://torproject.org/donate/donate-bp2-sc2025){target="_blank"}，繼續推進我們使隱私成為可能的工作。
