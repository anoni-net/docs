---
date: 2026-09-11
authors:
    - anoni-net
categories:
    - Update
    - Tor
    - Translated Article
slug: 2026-tor-vpn-beta
image: "https://forum.torproject.org/uploads/default/original/2X/1/1705e443e3cb9fe39eedf2432cf559090323d6fe.png"
summary: "The Tor Project's Tor VPN Beta retrospective says the primary use case turned out to be unblocking the internet. We checked what that means across seven Asia-Pacific regions using Tor Metrics and OONI data, and the bridge share is the number that separates them: 67.8 percent in China against 2 to 8 percent everywhere else in our sample."
description: "Tor VPN Beta's first year taught the Tor Project that users wanted circumvention, not exit selection. We look at Tor usage across Taiwan, China, Hong Kong, Singapore, Malaysia, Japan and South Korea using Tor Metrics daily user estimates and OONI reachability measurements, explain which measurements we discarded and why, and set out the regulatory picture region by region. We also explain why we do not cite VPN adoption statistics."
---

# What Tor VPN Beta's first year looks like from the Sinophone Asia-Pacific

!!! info ""

    This post builds on the Tor Project announcement below. We also publish full translations of it:

    - Original: [Tor VPN Beta: What we've learned building our own VPN for Android from scratch | September 9, 2026](https://blog.torproject.org/tor-vpn-beta/){target="_blank"}, by pavel
    - Our 正體中文 translation: [從零打造 Android 上的 Tor VPN，Beta 一年下來學到的事](https://anoni.net/docs/blog/2026/09/2026-tor-vpn-beta/){target="_blank"}
    - Our 简体中文 translation: [从零打造 Android 上的 Tor VPN，Beta 一年下来学到的事](https://anoni.net/docs/zh-cn/blog/2026/09/2026-tor-vpn-beta/){target="_blank"}

![Tor VPN beta promotional image showing availability on download.torproject.org with F-Droid and Google Play badges, and a phone displaying the connected screen with upload and download counters](https://forum.torproject.org/uploads/default/original/2X/1/1705e443e3cb9fe39eedf2432cf559090323d6fe.png){style="border-radius: 10px;"}

The Tor Project's retrospective on the first year of Tor VPN Beta contains one finding that reframes the whole product. The team expected to learn from real-world use, and what they learned was that the primary use case is unblocking the internet — not the privacy features a commercial VPN would lead with. Early adoption concentrated in heavily censored regions, and that shaped what got built next.

That finding is the interesting part for us, because the regions we cover sit at very different points on that spectrum. This post checks the announcement against measurement data for seven Asia-Pacific regions, and sets out what the regulatory picture looks like in each.

<!-- more -->

## What the announcement says

The design detail that matters most: every app on the device gets its own Tor circuit rather than sharing one tunnel, an isolation model borrowed from Tor Browser's cross-site tracking protections. The Apps screen is now searchable, so picking which apps route through Tor is faster.

The lesson the team highlights is about exit selection. Giving users more control over exit location sounded reasonable on paper and confused people in practice: users trying to get around censorship were picking exit locations when what they needed were bridges. The current design therefore requires connecting to the Tor network before an exit can be selected.

The rest is infrastructure. Tor VPN is built on Arti[^arti], the Rust implementation of Tor, which the team credits for fewer crashes and better handling of changing network conditions. WebTunnel bridges[^webtunnel] arrived in the 1.4.0 beta, reproducible builds and an F-Droid listing[^fdroid] both landed, and congestion control has not yet been ported over from the C implementation. Full details are in the original announcement[^announcement], and our two Chinese translations cover it section by section.

## How many people use Tor across seven regions

We pulled Tor Metrics daily user estimates for the 90 days from 11 June to 9 September 2026, for both direct connections and bridges[^tormetrics].

| Region | Direct users (daily mean) | Bridge users (daily mean) | Bridge share |
|---|---:|---:|---:|
| China | 1,179 | 2,486 | **67.8%** |
| Hong Kong | 6,078 | 529 | 8.0% |
| Malaysia | 15,917 | 806 | 4.8% |
| Taiwan | 12,018 | 479 | 3.8% |
| Japan | 30,295 | 1,209 | 3.8% |
| Singapore | 21,812 | 516 | 2.3% |
| South Korea | 27,847 | 581 | 2.0% |

China is the only region in the sample where bridge users outnumber direct users. Everywhere else the bridge share sits between 2 and 8 percent. That single ratio is the clearest evidence for the announcement's point about exit selection versus bridges: in the one place where direct access to Tor mostly fails, bridges are not an advanced option, they are the only way in.

Two caveats before anyone reuses these numbers. Tor's user estimates are derived from directory requests and geolocated by IP address, so they are estimates rather than headcounts, and someone reaching Tor through a bridge or a commercial VPN may be attributed to the wrong place[^tormetrics]. The absolute counts are also not normalized by population, which is why Singapore's 21,812 direct users and Japan's 30,295 are not the comparison to draw. The bridge share is a ratio within each region, so it survives both problems.

## What OONI measurements add

OONI's `tor` test checks whether Tor directory authorities and default bridges are reachable. Over the same 90-day window[^ooni]:

| Region | Anomaly rate, OONI `tor` test | Measurements |
|---|---:|---:|
| China | 96.5% | 2,847 |
| South Korea | 9.6% | 4,407 |
| Japan | 5.6% | 10,052 |
| Taiwan | 5.2% | 15,582 |
| Hong Kong | 0.9% | 3,270 |
| Singapore | 0.9% | 3,557 |
| Malaysia | 0.7% | 10,288 |

China's 96.5 percent is a different category of result from everything below it. The single-digit rates in South Korea, Japan and Taiwan are consistent with ordinary network failures rather than a blocking regime, and they should not be read as partial censorship of Tor.

The same picture appears in OONI's `psiphon` test, which measures whether that circumvention tool can bootstrap. China sits at 23.2 percent anomalies across 3,326 measurements; the other six regions all come in at or below 2.1 percent[^ooni].

## Which measurements we discarded

Three OONI test families looked relevant and did not survive scrutiny, and saying so is more useful than publishing them.

The Snowflake test (`torsf`) reports a 70.6 percent anomaly rate in Taiwan across 517 measurements. Taiwan does not block Tor, and the OONI `tor` test in the same window agrees. An anomaly rate that high in a region with no blocking points at the reliability of the test, not at censorship, so we left the whole family out.

The `vanilla_tor` test carries more failures than anomalies in several regions — 4,304 failures out of 6,215 measurements in Taiwan, 3,200 out of 3,707 in Malaysia. Failures are measurement errors, so the anomaly rates computed on top of them are not comparable across regions.

The `riseupvpn` test had no measurements at all for China and Hong Kong in this window, and one or two for Singapore, Malaysia and South Korea. Absence of measurement is not evidence that a tool works.

## Why we do not cite VPN adoption numbers

Readers ask for VPN usage rates by country, and we do not publish them. The figures in circulation come from VPN vendors' own marketing reports and from download-tracker estimates, where the sample is the vendor's customers, the methodology is usually undisclosed, and the publisher sells the product being measured. Numbers built that way cannot support the comparisons people want to make with them.

What can be measured is whether specific circumvention tools work from inside a network, which is what the OONI numbers above do, and what the law says, which is the section below.

## Blocking and regulation region by region

Freedom House's Freedom on the Net 2025 covers 1 June 2024 to 31 May 2025, and gives us one consistent source for six of these seven regions. Hong Kong has no separate country report in that edition.

**China** — the national-level Great Firewall blocks thousands of domains, and the 2025 report also documents a provincial website-blocking system in Henan operating on top of it[^fotn-cn]. Separately, a 2017 Ministry of Industry and Information Technology circular requires approval from the telecommunications authority before building or leasing channels, VPNs included, to carry out cross-border business; the ministry's follow-up clarification described the target as entities operating cross-border telecom services without the relevant licence[^miit].

**Hong Kong** — no separate Freedom on the Net report, so we have only our own measurements: an 8.0 percent bridge share, the second highest in the sample, against a 0.9 percent anomaly rate on the OONI `tor` test. Direct access to Tor works.

**Taiwan** — mainstream services are not blocked and Tor connects directly. The governance question sits at the DNS layer, where TWNIC executes stop-resolution orders from competent authorities through a Response Policy Zone[^twnic]. Freedom on the Net 2025, citing TWNIC's first transparency report, records more than 50,000 websites designated for blocking in the first half of 2025, with the vast majority of designations not subject to judicial review, and notes an LGBT+ bulletin board blocked in February 2025 at the request of the Ministry of Health and Welfare[^fotn-tw]. In December 2025, CNA reported a one-year block of Xiaohongshu ordered by the Ministry of the Interior and executed through the same mechanism[^cna].

**Singapore** — the government blocked 10 websites in October 2024, saying they "could be used to mount hostile information campaigns against Singapore", with several of the domains appearing to impersonate Singapore-based sites[^fotn-sg].

**Malaysia** — the regulator continued removing content perceived as critical of the government, and legislation passed during the coverage period widened its censorship powers. In September 2024 the MCMC withdrew planned rules that would have required service providers to reroute DNS traffic to domestic servers, after civil society groups objected; DNS hijacking by two providers had been reported the month before[^fotn-my].

**Japan** — no website blocks, and the highest possible score on the blocking and filtering indicator[^fotn-jp].

**South Korea** — SNI-based filtering of HTTPS traffic has been in place since February 2019, the first countrywide deployment of that technique[^fotn-kr-2019]. More recently, the data protection authority blocked downloads of a Chinese AI company's app in February 2025, with access restored two months later after privacy changes[^fotn-kr].

## What this means for Tor VPN Beta

Bridges are the feature that matters in this region, and the design decision to require a Tor connection before exit selection is the right one for the place where it counts. For anyone introducing the app in China, bridge configuration is the first thing to teach and exit selection is a distraction. Our own guides on [Snowflake bridges](../../tools/tor-snowflake.md) and [running a WebTunnel bridge](../../community/setup-tor-webtunnel.md) cover the mechanics.

Install channels are not a side note either. Google Play is unavailable in China, so the F-Droid listing and the direct APK download are what make the app reachable at all — with the caveat that the download hosts themselves may be unreachable, which makes fetching and verifying the package in advance the practical approach.

In the low-blocking regions in this table the value proposition is different, and per-app routing is the reason to look at it: route the apps that need anonymity through Tor and leave the ones that need a local IP address on the normal network. Services in the region routinely reject Tor exit addresses, so the per-app switch is what makes mixed use workable at all.

The Beta warning still applies everywhere. The Tor Project's own support documentation states that the app may leak information and should not be used for anything sensitive[^tor-vpn-about]. For high-risk work, [Tor Browser](../../tools/what-is-tor.md) and [Tails](../../tools/what-is-tails.md) remain the mature options, and the tool choice should follow from a [threat model](../../basics/threat-model.md) rather than from a feature list. The independent audit of the Android app is covered in [our earlier post](./2026-code-audit-for-tor-vpn-completed-by-cure53.md), and the wider trade-offs are in our [VPN guide](../../tools/vpn-guide.md).

## Reproducing this analysis

Every number above comes from two public sources. Tor Metrics publishes per-country daily user estimates as CSV for both relay and bridge users, and OONI's aggregation API returns measurement and anomaly counts per country and test. The window used throughout is 11 June to 9 September 2026, and the figures are daily means over those 90 days. Anyone can re-run both queries and get the same table; if you do and the numbers have moved, the current data is authoritative and this post is a snapshot.

[^announcement]: [Tor VPN Beta: What we've learned building our own VPN for Android from scratch](https://blog.torproject.org/tor-vpn-beta/){target="_blank"} - The Tor Project blog, 9 September 2026, by pavel. Images in this post are the full-resolution files from [the companion forum thread](https://forum.torproject.org/t/tor-vpn-beta-what-weve-learned-building-our-own-vpn-for-android-from-scratch/22104){target="_blank"}. Retrieved 2026-09-11.
[^arti]: Arti is the Tor Project's Tor implementation written from scratch in Rust, structured primarily as a library so it can be embedded in other software. It is the engine underneath Tor VPN. See our [Arti changelog](../../changelog/arti.md) and the [source repository](https://gitlab.torproject.org/tpo/core/arti){target="_blank"} - Tor Project GitLab. Retrieved 2026-09-11.
[^webtunnel]: WebTunnel is a pluggable transport that wraps Tor traffic inside an HTTPS connection so it resembles traffic to an ordinary website. See [Hiding in plain sight: Introducing WebTunnel](https://blog.torproject.org/introducing-webtunnel-evading-censorship-by-hiding-in-plain-sight/){target="_blank"} - The Tor Project blog, 12 March 2024. Retrieved 2026-09-11.
[^fdroid]: [Tor VPN Beta on F-Droid](https://f-droid.org/en/packages/org.torproject.vpn/){target="_blank"} - F-Droid. Packages in F-Droid are built by F-Droid from source, and installing or updating from it does not require a Google account. Retrieved 2026-09-11.
[^tormetrics]: Daily user estimates from [userstats-relay-country](https://metrics.torproject.org/userstats-relay-country.html){target="_blank"} and [userstats-bridge-country](https://metrics.torproject.org/userstats-bridge-country.html){target="_blank"} - Tor Metrics, queried as CSV for the window 2026-06-11 to 2026-09-09. Tor derives these figures from directory requests and geolocates them by IP address, so they are estimates, and traffic arriving through a bridge or a commercial VPN can be attributed to the wrong region. Retrieved 2026-09-11.
[^ooni]: Measurement and anomaly counts from the [OONI aggregation API](https://api.ooni.io/api/v1/aggregation){target="_blank"} - Open Observatory of Network Interference, queried per region for `test_name` values `tor`, `vanilla_tor`, `torsf`, `psiphon` and `riseupvpn` over 2026-06-11 to 2026-09-09. An anomaly is OONI's own classification and is not by itself proof of blocking. Retrieved 2026-09-11.
[^fotn-cn]: [China: Freedom on the Net 2025](https://freedomhouse.org/country/china/freedom-net/2025){target="_blank"} - Freedom House. Coverage period 1 June 2024 to 31 May 2025. Retrieved 2026-09-11.
[^miit]: [工業和信息化部關於清理規範互聯網網絡接入服務市場的通知](https://www.cac.gov.cn/2017-01/23/c_1120366809.htm){target="_blank"} - Ministry of Industry and Information Technology, January 2017, republished by the Cyberspace Administration of China, with the ministry's [follow-up clarification](https://www.cac.gov.cn/2017-01/26/c_1120381529.htm){target="_blank"}. Retrieved 2026-09-11. <!-- docs-style-lint: disable-line -->
[^twnic]: [RPZ malicious domain interception service](https://rpz.twnic.tw/){target="_blank"} - TWNIC, which publishes the transparency reports for stop-resolution orders it executes. TWNIC's blog post of 4 December 2025, [TWNIC依法執行主管機關命令，啟動DNS RPZ技術屏蔽措施](https://twnic.tw/blog/contents.php?id=69){target="_blank"}, describes the mechanism as executing orders from competent authorities. Use the figures currently published on the transparency site rather than the ones quoted here. Retrieved 2026-09-11.
[^fotn-tw]: [Taiwan: Freedom on the Net 2025](https://freedomhouse.org/country/taiwan/freedom-net/2025){target="_blank"} - Freedom House, which attributes the blocking figures to TWNIC's first DNS RPZ transparency report. Retrieved 2026-09-11.
[^cna]: [內政部令小紅書暫封鎖1年 TWNIC：依法啟動屏蔽措施](https://www.cna.com.tw/news/asoc/202512040369.aspx){target="_blank"} - CNA, 4 December 2025. Retrieved 2026-09-11.
[^fotn-sg]: [Singapore: Freedom on the Net 2025](https://freedomhouse.org/country/singapore/freedom-net/2025){target="_blank"} - Freedom House. Retrieved 2026-09-11.
[^fotn-my]: [Malaysia: Freedom on the Net 2025](https://freedomhouse.org/country/malaysia/freedom-net/2025){target="_blank"} - Freedom House. Retrieved 2026-09-11.
[^fotn-jp]: [Japan: Freedom on the Net 2025](https://freedomhouse.org/country/japan/freedom-net/2025){target="_blank"} - Freedom House, which records no blocks on websites and a full score on indicator B1. Retrieved 2026-09-11.
[^fotn-kr]: [South Korea: Freedom on the Net 2025](https://freedomhouse.org/country/south-korea/freedom-net/2025){target="_blank"} - Freedom House. Retrieved 2026-09-11.
[^fotn-kr-2019]: [South Korea: Freedom on the Net 2019](https://freedomhouse.org/country/south-korea/freedom-net/2019){target="_blank"} - Freedom House, on the introduction of SNI-based filtering of HTTPS sites. Retrieved 2026-09-11.
[^tor-vpn-about]: [About Tor VPN](https://support.torproject.org/tor-vpn/getting-started/about-tor-vpn/){target="_blank"} - Tor Project support documentation, source of the Beta warning. Retrieved 2026-09-11.
