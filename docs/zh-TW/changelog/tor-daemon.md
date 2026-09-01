---
title: tor daemon 更新日誌
description: Tor 的 C 語言實作 tor daemon 各版本的中文重點整理，說明每次安全釋出修了什麼、中繼與 onion 服務營運者需不需要立刻升級。
icon: material/server-network
---

# :material-server-network: tor daemon 更新日誌

tor daemon（社群慣稱 c-tor）是 [Tor](../tools/what-is-tor.md) 網路的 C 語言實作，中繼、橋接與 onion 服務都運作在它上面。這一頁整理每次釋出修了什麼、需不需要立刻升級，讀者主要是自己架設中繼或 onion 服務的人。用 Tor Browser 上網的讀者不需要看這一頁，瀏覽器會自己帶著對應版本，那些變動整理在 [Tor 更新日誌](./tor.md)。

新版本永遠在最上面。原始資料來自官方的 [ChangeLog](https://gitlab.torproject.org/tpo/core/tor/-/blob/main/ChangeLog){target="_blank"}。

## 急迫程度怎麼判斷

- <span class="urg-tag urg-tag--now">立刻</span>官方標為安全釋出（security release），通常帶 TROVE 編號。中繼與 onion 服務是長期在線的目標，這一級的問題多半可以被遠端觸發。
- <span class="urg-tag urg-tag--soon">儘快</span>影響連線品質或網路健康，但沒有可被遠端利用的安全問題。
- <span class="urg-tag urg-tag--routine">一般</span>其餘維護性釋出。

這一頁的「立刻」依據的是官方的發布形式（標為安全釋出、帶 TROVE 編號），不是已經有人在攻擊。中繼與 onion 服務長期在線，被掃到的機會遠高於個人裝置，所以門檻設得比 iOS 那幾頁低。判斷不確定時以較高一級為準。

2026 年上半的釋出幾乎都落在「立刻」。這段期間 Tor 的安全審視強度提高，連續修出多個可被遠端觸發的問題，分級反映的就是實際狀況。營運中繼的人這半年確實需要每次都跟上。

## 兩條維護線

`0.4.9.x` 是目前的主線，`0.4.8.x` 是長期支援線，安全修補會同步 backport。發行版套件常常停在 0.4.8.x，看到同一天發兩個版本是正常的，裝哪一條看你的套件來源。

## tor 0.4.9.11

> 2026-06-25 · [ChangeLog](https://gitlab.torproject.org/tpo/core/tor/-/blob/tor-0.4.9.11/ChangeLog){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>距離上一版只隔兩天的安全釋出，官方說明是又發現高優先級的問題，其中一個影響 onion 服務。
- 修掉一個競態條件：在特定情況下，會合點（rendezvous point）可以冒充用戶端想連的那個 onion 服務，形成中間人。架設 onion 服務的人這一版務必要升（bug 41297，問題從 0.3.5.3-alpha 就存在）。
- 用戶端遇到 onion 服務把某個引介點的公鑰編成全零時，不再直接中止結束（bug 41295）。
- 目錄權威不再接受離開政策裡把埠寫成 0 的寫法。原本的次要檢查誤把 `0` 解析成 `1-0` 這個埠範圍，產生 networkstatus 投票時會觸發 assert。

## tor 0.4.9.10

> 2026-06-23 · [ChangeLog](https://gitlab.torproject.org/tpo/core/tor/-/blob/tor-0.4.9.10/ChangeLog){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>安全釋出，官方強烈建議盡快升級。
- TROVE-2026-025：拒絕在已經有附掛串流的電路上收到的 `CONFLUX_LINK` 資料元。惡意用戶端可以先送 `RELAY_COMMAND_BEGIN` 再送 `CONFLUX_LINK`，掛上的離開串流最後會變成孤兒，留下懸空的電路反向指標，電路被釋放時形成 use-after-free（bug 41258）。
- 未設定 `SafeSocks` 時，恢復對不安全 SOCKS 協定（socks4 或不帶主機名的 socks5）的警告。這個警告消失了很久，而它防的是把要解析的網域直接洩漏給本機以外的地方（bug 41290）。
- 用戶端的入口守衛（entry guard）過期時間回到一致的 48 到 60 天。

## tor 0.4.9.9

> 2026-06-01 · [ChangeLog](https://gitlab.torproject.org/tpo/core/tor/-/blob/tor-0.4.9.9/ChangeLog){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>安全釋出，一次修掉三個主要問題。
- TROVE-2026-022：壓縮炸彈檢查可以被繞過。攻擊者把多個 gzip 或 zlib 子串流接在一起，每一段都剛好低於單串流的偵測門檻，整體就閃過了檢查（bug 41275，問題從 0.3.1.1-alpha 就存在）。
- TROVE-2026-021：解壓被截斷的 zlib/gzip 串流時陷入無窮迴圈。截斷的串流永遠到不了 `Z_STREAM_END`，zlib 回傳的 `Z_BUF_ERROR` 被誤判成輸出緩衝區滿了，於是無限重試（bug 41274）。
- TROVE-2026-017：送出 `CONFLUX_SWITCH` 資料元失敗時的 NULL write after free。送出失敗會關閉電路並移除該條腿，但回傳值被忽略，呼叫端接著往已經釋放的記憶體寫入而崩潰（bug 41263）。

## tor 0.4.9.8

> 2026-05-07 · [ChangeLog](https://gitlab.torproject.org/tpo/core/tor/-/blob/tor-0.4.9.8/ChangeLog){target="_blank"}

- <span class="urg-tag urg-tag--soon">儘快</span>前一版發出後的緊急補發，起因是 CI 建置過程的一個無聲錯誤，把備援目錄（fallback directory）清單整份清空了。
- 影響的是新安裝的用戶端：沒有備援目錄可用時，只能直接對目錄權威做 bootstrap，那幾台機器的負載與可觀測性都因此變差。
- 重新產生 2026 年 5 月 7 日版本的備援目錄清單。

## tor 0.4.9.7、0.4.8.24

> 2026-05-06 · [ChangeLog](https://gitlab.torproject.org/tpo/core/tor/-/blob/tor-0.4.9.7/ChangeLog){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>安全釋出，兩條維護線同時發布。
- TROVE-2026-011：處理 END、TRUNCATE 與 TRUNCATED 資料元時，若酬載裡沒有原因欄位會發生越界讀取。這個問題從 0.1.1.1-alpha 存在到現在（bug 41254）。
- TROVE-2026-008：不再透過 conflux 的分腿嘗試或接受 `BEGIN_DIR`（bug 41243）。
- TROVE-2026-010：清空 conflux 的亂序佇列時修正計數（bug 41251）。

## tor 0.4.9.6、0.4.8.23

> 2026-03-25 · [ChangeLog](https://gitlab.torproject.org/tpo/core/tor/-/blob/tor-0.4.9.6/ChangeLog){target="_blank"}

- <span class="urg-tag urg-tag--now">立刻</span>安全釋出，兩個問題都可能讓中繼被遠端弄崩。
- TROVE-2026-003：惡意的 `CREATED2` 造成 11 個位元組的堆疊溢位，結果是遠端崩潰（bug 41231）。
- TROVE-2026-004：conflux 子系統的記憶體比對用錯長度，同樣可能導致遠端崩潰（bug 41232）。
- 另外修了一批深度防禦性質的問題，以及 big-endian 平台上的 polyval 實作。
