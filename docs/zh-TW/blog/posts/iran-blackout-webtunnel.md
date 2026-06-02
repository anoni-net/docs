---
date: 2026-05-28
authors:
    - toomore
categories:
    - 更新
    - 社群
    - Tor
    - Relay
slug: iran-blackout-webtunnel
image: "assets/images/tor.webp"
summary: "伊朗在軍事行動期間封網 80 多天，重新開放後流量湧進社群架設的 Tor WebTunnel。這篇記下我們看到的現象，並號召台灣有能力的人一起架 WebTunnel 橋接。"
description: "伊朗封網 80 多天後重新開放，大量流量經過社群架設的 Tor WebTunnel。WebTunnel 把 Tor 流量偽裝成 HTTPS，是重度審查地區最難封鎖的橋接。台灣對外連線自由、頻寬充足，正是合適的橋接來源地。"
---

# 伊朗封網 80 多天後重新開放，流量湧進社群架設的 Tor WebTunnel

對伊朗的網路使用者來說，過去這近三個月，外面的網路幾乎不存在。直到前幾天連線稍微恢復，社群架設在台灣的 Tor WebTunnel 橋接開始湧進大量流量，那是想盡辦法繞過審查、連回 Tor 的伊朗人，重新連上了外面的網路。

!!! tip "在台灣，你也可以幫上忙"

    手上有一台 VPS（雲端主機）或實體主機，再加一個網域，就能架一個 Tor WebTunnel 橋接，讓被審查切斷的人能連回外面的網路。架不了伺服器也沒關係，打開瀏覽器跑 [Snowflake](../../tools/tor-snowflake.md) 一樣能貢獻匿名流量。

    伺服器規格、法律考量與完整架設步驟，都整理在 [**如何搭建 Tor WebTunnel 橋接**](../../community/setup-tor-webtunnel.md)。

<!-- more -->

## 封了 80 多天的網路

2026 年 2 月 28 日起，伊朗在軍事行動期間切斷了對外連線。這次斷的是整個國家對外的網路，接近全國規模，跟平常封鎖個別網站的審查是不同量級的事。根據 Cloudflare Radar 的觀測，伊朗對外的網路流量在斷網後掉到平常高點的 0.3% 上下，幾乎歸零，整個三月、四月都壓在這個低點[^1][^2]。一直到 5 月 26 日前後，流量才急速回升，重新接近正常水準。從斷網到重新開放，前後 80 多天。

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/iran-radar-cf.png" target="_blank">
        <img src="https://assets.anoni.net/blog/iran-radar-cf.png"
            alt="Cloudflare Radar 顯示伊朗對外網路流量的時間軸，2026 年 2 月 28 日斷網後驟降到接近零，整個三、四月維持在低點，到 5 月 26 日前後才急速回升"
            title="Cloudflare Radar 觀測到的伊朗對外流量，2 月 28 日斷網、5 月 26 日前後回升"
            class="brand-frame">
    </a>
    <figcaption>Cloudflare Radar 觀測到的伊朗對外網路流量。2026 年 2 月 28 日斷網後接近歸零，整個三、四月維持低點，5 月 26 日前後才急速回升。</figcaption>
</figure>

封網的這段期間，伊朗只剩一個被高度過濾的國內網路可用，銀行、外送這類本地服務還能運作，但對外的連線幾乎全斷。NetBlocks 把這次列為現代史上最長的全國性斷網，全國 9000 萬人口裡，大多數在這近三個月幾乎連不上國際網路[^3]。

## 社群的 WebTunnel 在伊朗重新開放網路後流量跳升

社群在台灣架設的 Tor WebTunnel 橋接，平常就在背景持續運作，幫連不上 Tor 的人繞過審查連進來。伊朗重新開放的那兩天，這個節點的連線明顯跳升，流量比平常高出許多。看到流量回來的當下，我們其實鬆了一口氣，那代表又有人能重新連上外面的網路。

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/iran-blackout-webtunnel-cf.png" target="_blank">
        <img src="https://assets.anoni.net/blog/iran-blackout-webtunnel-cf.png"
            alt="社群架設的 Tor WebTunnel 橋接在伊朗重新開放後的流量圖，連線量比平常明顯跳升"
            title="社群 WebTunnel 橋接的流量，伊朗重新開放後明顯跳升"
            class="brand-frame">
    </a>
    <figcaption>社群架設的 Tor WebTunnel 橋接流量。伊朗重新開放後，經過這個節點的連線明顯跳升。</figcaption>
</figure>

封網期間，當地人連 Tor 都連不上，因為整條對外連線都斷了。連線一恢復，很多人急著想知道外面這段期間發生了什麼、跟失聯的親友重新聯絡上。記者要把當地消息傳出去，公民團體需要和外界協調，這些都得連上那些被長期封鎖的網站和服務。要繞過審查，多半得靠 Tor，而在 Tor 本身也被封鎖的地方，還得透過各地志工架設的橋接才連得上。他們透過橋接連上 Tor 時，有一部分連線就經過社群架在台灣的這個節點（社群在新加坡也架了一台節點，這次沒有被分配到流量）。

從後台看連入這個橋接的來源網路，前五名全是伊朗的主要電信業者，流量確實來自當地的一般網路用戶。

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/iran-asn.png" target="_blank">
        <img src="https://assets.anoni.net/blog/iran-asn.png"
            alt="Cloudflare 後台的來源 ASN 列表，連入這個 WebTunnel 橋接的前五名來源網路全是伊朗電信業者：MCI 行動通訊 144.7 GB、伊朗電信 TCI、Irancell、Aria Shatel、Pasargad"
            title="連入 WebTunnel 橋接的來源 ASN，前五名全是伊朗主要電信業者"
            class="brand-frame">
    </a>
    <figcaption>連入這個 WebTunnel 橋接的來源 ASN（Cloudflare 後台）。前五名全是伊朗的主要電信業者：行動通訊公司（MCI）、伊朗電信（TCI）、Irancell、Aria Shatel、Pasargad，流量確實來自伊朗的網路用戶。</figcaption>
</figure>

流量並沒有在那兩天之後就退去。這幾天，連線持續經過這個橋接。根據 NetBlocks 等監測機構，伊朗這次的恢復並不完整，行動網路一度仍中斷、家用 Wi-Fi 才先恢復，主要社群平台的封鎖也還在，甚至比封網前更嚴，當地人要連到外面的一般網站，多半得靠 VPN 之類的工具才連得出去[^3][^4]。對很多人來說，就算網路「重新開放」，要連到外面還是得繞過大量封鎖，而社群的 WebTunnel 就是這些繞過封鎖的方式之一。

流量這幾天持續經過社群架設的 WebTunnel，這幾個節點顯然不夠用。所以我們想邀請更多有能力的人一起架設橋接，讓更多需要連到外面的人連得上。

!!! info "需要連線的人，可以來信索取"

    社群目前在台灣、新加坡各運作一個 Tor WebTunnel 橋接。為了不讓審查者直接把位址封掉，這些 bridge line 不會公開貼出來。你或你認識的人若需要，歡迎來信 <whisper@anoni.net> 索取（其他聯絡方式見[持續關注](../../contact.md)）。

## 為什麼是 WebTunnel

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/iran-webtunnel.png" target="_blank">
        <img src="https://assets.anoni.net/blog/iran-webtunnel.png"
            alt="WebTunnel 示意圖，Tor 流量被包進一般 HTTPS 連線、偽裝成普通網站瀏覽以繞過審查"
            title="WebTunnel 把 Tor 流量偽裝成一般 HTTPS 連線"
            class="brand-frame">
    </a>
    <figcaption>WebTunnel 把 Tor 流量包進一般 HTTPS 連線裡，在審查者眼中就像普通的網站瀏覽（示意圖）。</figcaption>
</figure>

Tor 的橋接有好幾種，差別在於「有多難被審查者封鎖」。

[Snowflake](../../tools/tor-snowflake.md) 門檻最低，開個瀏覽器分頁就能幫人連線，不必準備伺服器，誰都能馬上上手，在多數受審查的地方都很有用。它走 WebRTC（瀏覽器做視訊通話用的那種即時連線技術），這種流量跟一般瀏覽網頁長得不太一樣，在過濾特別嚴的環境裡比較容易被認出來。另一種叫 obfs4 的橋接，把流量變成一團看不出規律的雜訊，但審查系統用深度封包檢測（DPI，逐筆分析連線、判斷要不要放行的技術）仍可能認出它不像正常上網而擋掉。

WebTunnel 的做法不同，它把 Tor 流量包進一個真正的 HTTPS 連線裡（就是平常瀏覽器網址列上鎖、開頭 https 的那種安全連線）。在審查者眼中，連到 WebTunnel 橋接跟連到一個普通網站沒有兩樣。要封鎖它，就得連帶封掉大量正常的 HTTPS 網站，代價高到審查者通常下不了手。這讓 WebTunnel 成為對付這類過濾最強的橋接之一，在中國、俄羅斯都已經實際派上用場。

伊朗這次的情況更極端，整段對外連線都被切斷，斷網期間連橋接也無從運作。等連線回來、回到日常的過濾狀態，橋接才重新派得上用場。不過伊朗的過濾比中俄棘手，當地用協定白名單只放行特定幾種連線，WebTunnel 起初並不容易在那裡運作[^5]。

隨著 Tor 改用 Telegram 派發橋接、志工把節點數撐起來，2025 年起 Tor 觀察到越來越多伊朗使用者成功透過 WebTunnel 連上 Tor[^6]，也呼應了社群節點這次在重新開放後看到的流量。同一時期，Snowflake 也在伊朗特別好用，Tor 形容它是當地最好用的連線工具之一[^7]。對伊朗的網路自由來說，WebTunnel 和 Snowflake 都是有效的路，兩種都歡迎更多人一起加入。

## 在台灣，你也可以架一個

台灣對外連線自由、頻寬充足，是合適的橋接來源地。審查者會持續封鎖已知的橋接 IP，所以分散在不同國家、不同網路供應商的 WebTunnel 越多，當地人能用的入口就越多。台灣每多架一個節點，就是給當地人多一個還沒被封鎖、能連上 Tor 的入口。

門檻其實不高：

- 一台 512MB 到 1GB 記憶體的小型 VPS 就跑得動，成本和維護心力都比架 [Tor Relay](../../community/setup-tor-relay.md) 低。
- 需要一個網域（或子網域）和一張 TLS 憑證（讓網站能用 https 安全連線的憑證），用 Let's Encrypt 免費就能申請。
- 法律風險很低。橋接只是中轉站，不會直接連到使用者最後要造訪的網站，對外網站看到的是 Tor 網路的出口，不是你的伺服器，比架設 Tor 出口節點安全得多。

我們把完整的架設流程整理成一份指引，從準備網域、申請憑證、把橋接架起來，到防火牆、偽裝頁、監控與後續維運都寫進去了：

- :material-tunnel-outline: [**如何搭建 Tor WebTunnel 橋接**](../../community/setup-tor-webtunnel.md)

如果沒辦法協助架設 WebTunnel，也可以打開瀏覽器跑 [Snowflake](../../tools/tor-snowflake.md)，開著分頁就能貢獻匿名流量，幫連不上 Tor 的人繞過審查。等你準備好投入一台伺服器，再回來架 WebTunnel。

## 不只是伊朗

伊朗這次的斷網很極端，但網路審查與斷網不是遙遠的特例。緬甸、白俄羅斯、中國長期維持高強度的過濾[^8][^9][^10]，每一次區域衝突、選舉、抗爭，都伴隨著網路的收緊。與我們同樣使用正體中文的香港，也從過去開放的網路環境，這幾年開始出現依國安法的網站封鎖[^11]。台灣身處東亞，遇到地震、海纜中斷或區域緊張時，對外連線同樣可能中斷或被干擾[^12]。現在幫其他地方的人架起繞過審查的橋接，也是在替台灣累積架設與運維匿名網路的經驗。

一個節點不會改變什麼，但很多個分散在世界各地的節點加起來，就是審查者很難一次拔掉的網路。如果你有一台閒置的 VPS 或實體主機、一個網域，和一點時間，歡迎一起在台灣這端架起更多橋接。

社群討論在 [Matrix](../../contact.md)（家伺服器 `im.anoni.net`），加入方式與其他聯絡管道都在那頁。

## 相關閱讀

- [如何搭建 Tor WebTunnel 橋接](../../community/setup-tor-webtunnel.md)
- [Tor Snowflake 橋接點](../../tools/tor-snowflake.md)
- [如何搭建 Tor Relay](../../community/setup-tor-relay.md)
- [網路自由為什麼重要](../../basics/internet-freedom.md)
- [2025 年 10 月國際網路自由觀察](./internetfreedom-oct2025.md)

[^1]: [Cloudflare Radar（Iran）](https://radar.cloudflare.com/ir){target="_blank"} - Cloudflare Radar
[^2]: [Internet shutdown in Iran amid military actions](https://x.com/CloudflareRadar/status/2027709437981450502){target="_blank"} - Cloudflare Radar
[^3]: [Internet restored to tens of millions in Iran after three-month blackout](https://www.thenationalnews.com/news/mena/2026/05/27/internet-restored-to-tens-of-millions-in-iran-after-three-month-blackout/){target="_blank"} - The National
[^4]: [Iran's Internet restored for some after 88 days of blackout](https://www.upi.com/Top_News/World-News/2026/05/26/iran-internet-restored-88-days/9231779817270/){target="_blank"} - UPI
[^5]: [Hiding in plain sight: Introducing WebTunnel](https://blog.torproject.org/introducing-webtunnel-evading-censorship-by-hiding-in-plain-sight/){target="_blank"} - The Tor Project
[^6]: [Staying ahead of censors in 2025: What we've learned from fighting censorship in Iran and Russia](https://blog.torproject.org/staying-ahead-of-censors-2025/){target="_blank"} - The Tor Project
[^7]: [How Iranians are overcoming unprecedented internet censorship](https://www.techradar.com/vpn/vpn-privacy-security/iranians-are-resilient-they-always-find-ways-to-speak-how-iranians-are-overcoming-unprecedented-internet-censorship){target="_blank"} - TechRadar
[^8]: [Update: internet access, censorship, and the Myanmar coup](https://www.accessnow.org/press-release/update-internet-access-censorship-myanmar/){target="_blank"} - Access Now
[^9]: [Internet disruption hits Belarus on election day](https://netblocks.org/reports/internet-disruption-hits-belarus-on-election-day-YAE2jKB3){target="_blank"} - NetBlocks
[^10]: [China: Freedom on the Net 2025 Country Report](https://freedomhouse.org/country/china/freedom-net/2025){target="_blank"} - Freedom House
[^11]: [Hong Kong Website Blocked, Sparking Fears Over Great Firewall](https://www.rfa.org/english/news/china/blocked-01082021140451.html){target="_blank"} - Radio Free Asia
[^12]: [After Chinese Vessels Cut Matsu Internet Cables, Taiwan Seeks to Improve Its Communications Resilience](https://thediplomat.com/2023/04/after-chinese-vessels-cut-matsu-internet-cables-taiwan-shows-its-communications-resilience/){target="_blank"} - The Diplomat
