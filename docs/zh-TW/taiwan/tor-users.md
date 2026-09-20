---
title: 台灣有多少人在用 Tor
description: 用 Tor Metrics 的公開資料看台灣的 Tor 使用規模與四年趨勢，並說明 2025 年那次十倍跳升為什麼是計數錯誤。
icon: material/account-group-outline
---

# :material-account-group-outline: 台灣有多少人在用 Tor

從 [Tor Relays 觀測點](./tor-relay-watcher.md) 接續。前一頁看的是節點端，台灣架了多少中繼、分散在哪些 ASN、貢獻多少頻寬。本頁換到使用者端，看有多少人從台灣連上 [Tor](../tools/what-is-tor.md)、四年來如何變化、使用型態與其他地區的差異。

資料來自 Tor Metrics 的公開 CSV，授權是 CC0，取得方式列在頁尾，任何人都能自行重現。

台灣平均同時上線的 Tor 客戶端約 9,500 個，四年來從約 7,400 緩步上升，沒有哪一年出現跳躍。2025 年 9 月到 2026 年上半年，同一個數字一度衝上九萬，那一段是 Tor 自己的計數程式出錯，不能當成使用者成長。

## 使用者數是怎麼算出來的

Tor 沒有帳號，也不會統計裝置，所以「有多少使用者」是推算出來的。中繼會記錄收到多少次目錄請求，Tor Metrics 再從請求數反推人數，公式寫在官方的 Reproducible Metrics 文件裡[^1]：

```
r(N) = floor(r(R) / frac / 10)
```

`r(R)` 是某國某日回報成功的目錄請求總數，`frac` 是當天有回報統計的中繼佔比，除以 `10` 來自一項假設，文件裡的原文是「A client that is connected 24/7 makes about 15 requests per day, but not all clients are connected 24/7, so we picked the number 10 for the average client」。

估計值的限制寫在同一份文件裡：

> The result is an average number of concurrent users, estimated from data collected over a day. We can't say how many distinct users there are.

所以「台灣有 9,500 個 Tor 使用者」的準確說法是**平均同時上線約 9,500 個 Tor 客戶端**。一年之內在台灣開過 Tor Browser 的人數遠高於此，官方的方法算不出那個數字。

官方另外給了信心區間[^2]：

| 項目 | 2026 年 8 月之後的平均 |
|---|---|
| 估計值 | 9,541 |
| 區間下界 | 6,641 |
| 區間上界 | 13,823 |

單日更寬。2026-09-15 的估計值是 8,312，區間從 3,119 到 16,881。本頁的數字適合看方向與相對變化，當成精確人數會超出資料能支撐的範圍。

## 四年來緩慢上升

排除 2025 年 9 月起受計數錯誤影響的那一段，取每年同一段時間比較[^3]：

| 期間 | 平均同時上線 | 每十萬人 |
|---|---|---|
| 2023 年 6 到 8 月 | 7,420 | 31.9 |
| 2024 年 6 到 8 月 | 8,638 | 37.2 |
| 2025 年 6 到 8 月 | 8,794 | 37.8 |
| 2026 年 8 到 9 月 | 9,541 | 41.1 |

四年上升約 29%，三段年度區間換算年複合成長率約 8.7%，方向單調。

成長幅度能推到什麼程度，取決於拿什麼在比。官方信心區間在 2023 年夏天（4,782 到 10,233）與 2026 年夏天（6,641 到 13,823）是重疊的，單看絕對人數無法排除四年來沒有變化。同期日資料的均值 95% 區間（7,173 到 7,667 對 8,286 到 10,795）則不重疊，水準確實上升了[^10]。

兩者量的並不相同。官方區間含的是估計方法本身的系統性不確定，例如 `frac` 外推與每個客戶端每天 10 次請求的假設，同一套方法在各年之間同向，比較相對變化時大致會抵銷。在同一套估計方法之下，台灣的水準四年上升約 29%。

## 2025 年那次十倍跳升是計數錯誤

Tor Metrics 的台灣曲線在 2025 年 9 月起有一段陡升。逐日資料如下：

| 日期 | 台灣 | 全球 |
|---|---|---|
| 2025-08-30 | 8,429 | 1,932,889 |
| 2025-08-31 | 14,531 | 2,951,998 |
| 2025-09-01 | 82,626 | 14,824,760 |
| 2025-09-02 | 109,607 | 19,374,696 |

一天之內全球從 195 萬跳到 1,482 萬，台灣從 8,429 跳到 82,626。真實的採用曲線不會是這種形狀，而且全球一起跳，代表問題出在網路層，與台灣本地無關。

原因後來寫在 Tor `0.4.8.22` 的發行說明裡，兩條修正疊在一起[^4]。第一條是舊版客戶端連不上目錄伺服器：

> Allow old clients to fetch the consensus even if they use version 0 of the SENDME protocol. In mid 2025 we changed the required minimum version of the "FlowCtrl" protocol to 1, meaning directory caches hang up on clients that send a version 0 SENDME cell. Since old clients were no longer able to retrieve the consensus, they couldn't learn about this required minimum version -- meaning we've had many many old clients loading down directory servers for the past months.

第二條是統計把失敗算成成功：

> Don't count networkstatus serves until they finish. When we started serving a consensus document but the client didn't receive all of it, we were still counting that as a success in our stats. This mistake, which can be triggered for example by obsolete clients or by DPI-based censorship, led to wildly inflated user counts because we estimate total users in the world based on successful consensus fetches.

合起來的機制是，協定的最低版本一改，舊客戶端就被目錄伺服器中途掛斷。升級的要求寫在取不到的那份 consensus 裡，舊客戶端因此持續重試，而每一次沒下載完的請求都被記成一次成功，使用者估計值跟著等比例膨脹。

修正在 2026-01-28 釋出，效果隨中繼升級而逐步顯現。全網升級比例與台灣的數字對照如下：

| 時點 | 已升級到含修正的版本 | 台灣月均 |
|---|---|---|
| 2026-01-15 | 2.6% | 91,258 |
| 2026-03-15 | 65.8% | 25,906 |
| 2026-05-15 | 80.7% | 23,647 |
| 2026-07-15 | 89.0% | 11,075 |
| 2026-09-15 | 99.5% | 8,803 |

兩條曲線逐段對得上，而且回落的終點（約 8,800）與事件發生前的水準（2025 年 6 到 8 月平均 8,794）幾乎重合。到 2026 年 9 月中，全網 99.5% 的中繼已經運作在修正後的版本上。

各地膨脹的幅度不同。以 2025 年 8 月為基準看 2026 年 1 月，印尼 12.4 倍、泰國 10.8 倍、台灣 10.2 倍、越南 9.1 倍，而美國 1.6 倍、英國 1.5 倍、德國 1.4 倍。舊版客戶端集中的地區受影響最深。

下次遇到類似的跳動，檢查順序一樣。先比對同期的全球值與鄰近地區，全球一起動就不是在地事件，接著查 Tor 的發行說明，確認計數方式有沒有改過。任何跨越 2025 年 9 月到 2026 年 6 月的比較都要標註不可比。

## 台灣使用者的四個特徵

### 幾乎不需要 bridge

連不上公開中繼的人會改用 bridge，也就是沒有登記在公開名單上的入口。bridge 使用者佔總數的比例高，通常代表當地在封鎖 Tor[^5]：

| 地區 | 直連 | bridge | bridge 佔比 |
|---|---|---|---|
| 俄羅斯 | 22,224 | 90,192 | 80.2% |
| 中國 | 2,301 | 2,513 | 52.2% |
| 伊朗 | 64,619 | 21,943 | 25.4% |
| 香港 | 6,332 | 521 | 7.6% |
| 台灣 | 9,541 | 503 | 5.0% |
| 德國 | 307,354 | 6,063 | 1.9% |
| 越南 | 23,298 | 278 | 1.2% |

台灣的 5.0% 落在通暢環境的區間，與受封鎖地區差了一個數量級。

[OONI](../tools/what-is-ooni.md) 的實測結果一致。2023 年以來台灣累積 168,197 筆 `tor` 測試，確認封鎖為 `0` 筆[^6]：

| 年 | 測量筆數 | 異常比例 | 確認封鎖 |
|---|---|---|---|
| 2023 | 28,124 | 12.3% | 0 |
| 2024 | 60,930 | 13.3% | 0 |
| 2025 | 40,546 | 16.7% | 0 |
| 2026 | 38,597 | 8.2% | 0 |

異常比例是該測試的一般波動範圍，沒有系統性封鎖的跡象。

### 工作日型的使用曲線

把週六日的平均除以週一到五的平均，數字小於 1 代表週末用得少[^7]：

| 地區 | 比值 | 地區 | 比值 |
|---|---|---|---|
| 印尼 | 0.705 | 俄羅斯 | 0.995 |
| 泰國 | 0.735 | 美國 | 0.996 |
| 菲律賓 | 0.822 | 英國 | 1.000 |
| 印度 | 0.838 | 澳洲 | 1.005 |
| 越南 | 0.845 | 德國 | 1.016 |
| 韓國 | 0.854 | 新加坡 | 1.016 |
| 馬來西亞 | 0.905 | 伊朗 | 1.019 |
| 台灣 | 0.947 | 日本 | 1.028 |

歐美與日本落在 1.0 附近或以上，Tor 在當地比較接近個人日常上網的一部分。台灣的 0.947 偏向工作日，指向工作與研究場景的比重較高。

### 亞太區的中段位置

換算成每十萬人的使用者密度[^8]：

| 地區 | 每十萬人 | 地區 | 每十萬人 |
|---|---|---|---|
| 新加坡 | 437 | 台灣 | 43 |
| 德國 | 371 | 馬來西亞 | 37 |
| 英國 | 177 | 泰國 | 31 |
| 美國 | 164 | 日本 | 26 |
| 澳洲 | 139 | 越南 | 23 |
| 伊朗 | 94 | 印尼 | 22 |
| 香港 | 91 | 菲律賓 | 21 |
| 俄羅斯 | 78 | 印度 | 9 |
| 韓國 | 55 | 中國 | 0.3 |

台灣高於日本、東南亞各國與印度，低於韓國、香港與歐美。新加坡與德國特別高要留意機房因素，兩地都有大量雲端主機，運作在 VPS 上的客戶端會被算進當地。

### bridge 使用在 2026 年成長，原因還不清楚

台灣的 bridge 使用者季平均從 2025 年第二季的 137 上升到 2026 年第三季的 501。成長發生在計數錯誤修正之後，而且 bridge 的統計管道與直連不同，比較可能是真實變化。

依傳輸方式拆開來看[^9]：

| 季 | obfs4 | snowflake | webtunnel | 未混淆 | 合計 |
|---|---|---|---|---|---|
| 2025Q2 | 94 | 8 | 3 | 30 | 137 |
| 2026Q1 | 100 | 25 | 12 | 43 | 184 |
| 2026Q2 | 151 | 47 | 13 | 62 | 276 |
| 2026Q3 | 321 | 27 | 17 | 135 | 502 |

成長集中在 obfs4 與未混淆的 bridge，WebTunnel 那一欄從零起步到 17。各種傳輸方式的差別見 [Tor Browser 進階設定](../tools/tor-browser-advanced.md)。2026 年第三季只有不到三個月的資料，而且 Tor Metrics 的 News 頁面記了 2026 年 2 月與 3 月的幾次 Snowflake 統計問題修復，snowflake 那一欄的短期變動要保留懷疑。

## 使用的人多，提供中繼的人少

台灣使用者約佔全球的 0.33%，而台灣的中繼數只佔全網的 0.12%，消費與貢獻之間有大約三倍的落差[^11]。每個在地中繼對應的本地使用者數，台灣是 795，美國 168、德國 188。這個比值量的是責任分配，不是實際的流量負擔，Tor 選路不會優先挑同一個國家的中繼。節點端的即時數字與 ASN 分布在 [Tor Relays 觀測點](./tor-relay-watcher.md)，想增加一個節點可以看 [如何搭建 Tor Relay](../community/setup-tor-relay.md)。

!!! example "想自己重現？"

    本頁所有數字都來自兩份公開 CSV，不需要金鑰：

    ```bash
    curl -o tw-relay.csv "https://metrics.torproject.org/userstats-relay-country.csv?start=2023-01-01&end=2026-09-19&country=tw&events=off"
    curl -o tw-bridge.csv "https://metrics.torproject.org/userstats-bridge-combined.csv?start=2023-01-01&end=2026-09-19&country=tw"
    ```

    不帶 `start` 與 `end` 會回傳 2011 年至今的全部歷史，各約 37 MB。檔頭有幾行 `#` 註解，用 csv 模組讀之前要先濾掉。

## 下一步

<div class="grid cards" markdown>

- [:material-chart-bar: Tor Relays 觀測點](./tor-relay-watcher.md)
- [:material-access-point-network: ASN 自治網路觀測資料分析](./ooni-asn-coverage.md)
- [:material-server-network: 如何搭建 Tor Relay](../community/setup-tor-relay.md)
- [:material-school: Tor Relay 校園建立](../community/relay-on-campus.md)

</div>

[^1]: 公式與假設出自 Tor Metrics 的 [Reproducible Metrics](https://metrics.torproject.org/reproducible-metrics.html){target="_blank"}。`frac` 量的是當天全網有多少比例的中繼回報了統計，同一天所有國家的值相同，不是逐國的可信度，2023-06-15 全部是 `64`，2026-09-15 全部是 `56`。
[^2]: 信心區間取自 `userstats-relay-country.csv` 的 `lower` 與 `upper` 欄位，全期 97% 的日子有值。表中為 2026-08-01 到 2026-09-17 的平均。
[^3]: 每年取同一段月份以避開季節差異。2026 年改取 8 月到 9 月，理由是該年 6 到 8 月全網只有 80% 到 89% 的中繼升級到含修正的版本，那三個月會混進計數錯誤的殘留，要到 9 月中升級率達 99.5% 之後數字才乾淨。代價是 2026 年的窗口只有兩個月且月份與其他三年不同，季節效應沒有完全避開。人口以內政部統計的 23,235,002 人（2026 年 7 月）計算。
[^4]: 兩段引文出自 Tor `0.4.8.22` 的發行說明，2026-01-28 釋出，對應 [`41191`](https://gitlab.torproject.org/tpo/core/tor/-/issues/41191){target="_blank"} 與 [`41192`](https://gitlab.torproject.org/tpo/core/tor/-/issues/41192){target="_blank"} 兩則 issue。升級比例由 `versions.csv` 計算，以 `0.4.9` 系列與 `0.4.8.22` 為含修正的版本。Tor Metrics 的 News 頁面沒有替這段期間加註記。
[^5]: 直連與 bridge 皆取 2026-08-01 到 2026-09-17 的平均，資料來自 `userstats-relay-country.csv` 與 `userstats-bridge-country.csv`。
[^6]: 取自 OONI API 的 `aggregation` 端點，`probe_cc=TW` 且 `test_name=tor`。2026 年統計到 9 月 20 日。「確認封鎖」對應 OONI 的 `confirmed`，需要測到明確的封鎖頁面才會計入。
[^7]: 取 2023-01-01 到 2025-08-30 的日資料，避開計數錯誤的污染期。
[^8]: 使用者數取 2026-08-01 到 2026-09-17 的直連與 bridge 合計。台灣以外的人口採各地 2025 年的概略推估值，這一欄用於量級對照，不適合拿來做精確排名。
[^9]: 資料來自 `userstats-bridge-combined.csv`，該檔給的是 `low` 與 `high` 區間，表中取中點。「未混淆」對應檔案裡的 `<OR>`，指沒有掛可插拔傳輸的一般 bridge。bridge 不按傳輸方式回報目錄請求，官方的做法是用各傳輸方式的唯一 IP 位址佔比去近似，再套用與直連相同的公式，所以這張表是兩層近似疊在一起。
[^10]: 日資料高度自相關，直接用標準差除以天數的平方根會低估標準誤。這組區間以一階自相關係數校正有效樣本數，2023 年夏天 `ρ` 為 0.604，92 天的有效樣本降為 22.7，2026 年 `ρ` 為 0.782，48 天降為 5.9。校正後兩段仍不重疊。
[^11]: 兩個比例的時間窗不同。使用者佔比取 2026 年第三季的季平均，中繼佔比取 2026-09-19 的當下快照，前者來自 `userstats-relay-country.csv`，後者來自 Onionoo。跨時間窗比較只看量級，不看小數點。
