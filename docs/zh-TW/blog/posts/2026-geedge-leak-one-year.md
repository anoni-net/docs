---
date: 2026-10-30
authors:
    - anoni-net
categories:
    - 觀察
    - Tor
slug: geedge-leak-one-year
image: "https://assets.anoni.net/blog/2026-geedge-leak-one-year-map-e255e63a.webp"
summary: "2025 年 9 月，替中國與其他國家建置網路審查系統的 Geedge Networks 內部檔案外洩。一年來，研究者用外洩的原始碼對照真實的網路，中國防火長城有一部分設備很可能用了這套系統，其他國家多半還無法確認，部分報導也寫得比研究更肯定。"
description: "Geedge 外洩一年來的研究結果、還沒有答案的問題，以及翻牆工具、Tor 與 VPN 受到的影響。"
---

# Geedge 外洩一年後的研究重點

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/2026-geedge-leak-one-year-map-e255e63a.webp" target="_blank">
        <img src="https://assets.anoni.net/blog/2026-geedge-leak-one-year-map-e255e63a.webp"
            alt="外洩文件記錄的 Geedge 部署地點地圖"
            style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;">
    </a>
    <figcaption markdown="span">外洩文件記錄的 Geedge 部署地點：① 哈薩克、② 衣索比亞、③ 巴基斯坦、④ 緬甸，⑤ 到 ⑦ 是中國的新疆、福建與江蘇。國界資料來自 Natural Earth（公有領域）。</figcaption>
</figure>

2025 年 9 月，替中國與其他國家建置網路審查系統的 Geedge Networks（積至公司）發生外洩，內部檔案與原始碼（軟體的程式本文）都被公開。過去外界只能從牆外推測防火長城（中國用來審查與監控網路的系統）如何運作，這次研究者第一次可以直接讀審查設備的程式。一年下來，防火長城有一部分設備很可能用了 Geedge 的程式，其他國家多半還無法確認，部分報導也寫得比研究更肯定。

<!-- more -->

## 外洩的內容

Geedge 與中國科學院的 MESA 實驗室關係密切，依研究防火長城的 GFW Report 整理，被稱為「防火長城之父」的方濱興是 Geedge 的首席科學家。外洩的檔案共 572 GiB（約 600 GB），包含原始碼、專案管理紀錄與客戶的部署設定。依調查組織 InterSecLab 的報告，Geedge 把審查系統賣給哈薩克、衣索比亞、巴基斯坦與緬甸的政府，也在中國的新疆、福建與江蘇建置省級的防火牆。

社群翻譯了 InterSecLab 的兩份報告，〈[網路政變](../../reports/interseclab-network-coup/index.md)〉的主題是 Geedge 的產品與客戶，〈[MADLink](../../reports/interseclab-madlink/index.md)〉的主題是 Geedge 硬體的來源。

## 研究的結果

2026 年 8 月，美國與德國幾所大學和 GFW Report 的研究者發表論文。他們把外洩的原始碼實際建置起來，在隔離的環境測試 Geedge 的審查系統（簡稱 TSG），再到各地的網路上比對審查設備的反應。在 DNS 注入（搶先送回假的網址查詢結果）與中斷連線這兩項，防火長城有三台設備的行為與 TSG 高度吻合。研究者的結論是，外洩的程式碼或與它相近的版本，很可能部署在防火長城的一部分。

同樣量測過的其他防火長城設備與 TSG 不吻合，那些設備由誰提供，目前沒有公開的證據。哈薩克、緬甸與巴基斯坦的結果多半停在「可能」或「無法確認」，衣索比亞沒有量測。新聞網站 Risky Bulletin 的報導裡，TSG 是防火長城「三種已知流量過濾能力之一」，論文裡沒有這種寫法，同一篇報導引用的研究者也提到 Geedge 只是參與防火長城的廠商之一。

## 翻牆工具、Tor 與 VPN 受到的影響

外洩資料裡有大量封鎖翻牆工具與 VPN（把網路流量轉到其他地方的伺服器、藉此繞過封鎖的服務）的紀錄。客戶國家會回報哪些工具還能連線、哪些封鎖誤擋了其他服務，Geedge 再反覆調整封鎖規則。翻牆工具 Psiphon 的流量沒有明顯特徵，Geedge 就改用伺服器的 IP 位址（網路上的門牌號碼）封鎖。外洩檔案裡也有 NordVPN 的完整伺服器清單，伺服器的位址本身就是蒐集與封鎖的對象。

Tor 是隱藏使用者位置、讓網路業者無法得知你連去哪裡的匿名網路。外洩資料裡，Tor 列在要辨識的工具中，但論文裡沒有 TSG 如何辨識 Tor 的說明，也沒有 Tor 連線的測試。InterSecLab 的報告裡寫到，外洩時 Geedge 似乎還沒有有效封鎖 WebTunnel（Tor 把流量偽裝成一般網頁瀏覽的連線方式）的手段，InterSecLab 也沒有找到 Geedge 發現或利用 Tor 未公開漏洞的證據。

在受審查的網路無法連上 Tor 時，一般的做法仍然適用，可以改用橋接（不公開位址的 Tor 入口），設定方式見 [Tor Browser 進階設定](../../tools/tor-browser-advanced.md)。〈網路政變〉裡寫到，連線沒有加密時，TSG 能攔截密碼與信件內容，所以不要在瀏覽器標示「不安全」的網站登入或輸入個人資料。也不要安裝來路不明的憑證（網站向瀏覽器證明身分的數位文件），安裝之後，加密的連線可以被完整解密。即使沒有安裝，TSG 仍能從加密的連線取得連去哪個網站這類資訊。選擇 VPN 之前，可以先讀 [VPN 的風險與選擇](../../tools/vpn-guide.md)。

## 網站檢測清單的涵蓋範圍

另一篇 2026 年的論文裡，研究者比對外洩檔案裡的網域，在量測點實測被封鎖的網域，九成以上不在常用來量測的兩份網站清單裡。[OONI](../../tools/what-is-ooni.md)（檢測網站是否被封鎖的開源工具）這類依清單檢測的工具，結果只涵蓋清單裡的網站。清單以外的網站本來就不在觀測範圍內，沒有發現封鎖不等於沒有封鎖。社群也維護 Citizen Lab 檢測清單裡台灣的部分。

## 審查與規避共用的開源軟體

Geedge 的系統大量使用 Linux、Kafka（處理大量即時資料的軟體）等開源軟體。InterSecLab 在報告裡推測，部分程式碼的使用方式可能違反授權條款（規定使用條件的條文）。開源授權不限制用途，審查系統與 Tor 這類規避工具都建立在開源軟體上。揭露這套系統的研究者、記者與社群，也用開源工具做調查，並把研究成果公開。

## 與台灣的關聯

依 MADLink 報告，台灣的凌華科技在 2019 到 2020 年初，經由北京分公司向 Geedge 出貨 1,708 台網路設備。這批設備是 Geedge 第一代審查系統的硬體基礎，外洩文件裡這套配置只部署在哈薩克。凌華給 InterSecLab 的回覆寫到，出貨前做了出口管制名單的篩查，當時 Geedge 不在受限名單上。截至 2026 年 10 月 30 日，在我們比對的美國與歐盟制裁名單裡，都沒有 Geedge。

## 更完整的分析

比對結果的表格、TSG 的系統架構圖、開源軟體的整理，以及每個說法的出處，寫在社群首頁的技術文章[Geedge 外洩一年後的研究回顧](https://anoni.net/articles/geedge-leak-one-year/){target="_blank"}。

## 相關閱讀

- [研究報告中譯](../../reports/index.md)：網路政變與 MADLink 兩份 InterSecLab 報告的中譯
- [什麼是 Tor](../../tools/what-is-tor.md)：Tor 如何隱藏你的位置與連線對象
- [Tor Browser 進階設定](../../tools/tor-browser-advanced.md)：無法連上 Tor 時如何設定橋接
- [什麼是 OONI](../../tools/what-is-ooni.md)：用 OONI 檢測網站是否被封鎖
- [監控現在做得到什麼](../../basics/surveillance-capability.md)：網路監控的實際能力與限制
