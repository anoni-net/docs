---
title: How network blocking works and how to get around it
description: When a site will not load, it may be down, or something on the network may be blocking it. This page covers where blocking happens, how DNS, IP, domain-name, and protocol blocking work, how to check with OONI Probe, and what encrypted DNS, VPNs, Tor, and messaging-app proxies can and cannot get around.
icon: material/wall-fire
---

# :material-wall-fire: How network blocking works and how to get around it

Governments, ISPs, schools, and employers can all block websites and services. Blocking something first requires seeing it, so censorship and surveillance rely on the same capability, and tools that hide more of your traffic also make selective blocking harder. You can almost always get around blocking, but each method has a cost: some only defeat one kind of blocking, many let the network operator see that you are circumventing, and in some countries circumvention itself carries legal risk[^ssd-cens].

This page adapts EFF Surveillance Self-Defense's [How to: Understand and Circumvent Network Censorship](https://ssd.eff.org/module/understanding-and-circumventing-network-censorship){target="_blank"} and adds context from Taiwan and mainland China (see [Sources and review](#Sources-and-review)).

!!! tip "Short on time? Start here"

    - First check whether a site is blocked or simply down. OONI Probe can test this, but running it is risky in some countries
    - If only DNS is blocked, encrypted DNS usually gets you through
    - VPNs and Tor defeat more kinds of blocking, but the network can usually tell you are using them
    - In mainland China, the regulations prohibit individuals from using unapproved channels to reach the international internet, and individuals have been fined

## Where blocking happens

Blocking can happen on your device (school or work devices, or spyware), on the local network (school, office, or café Wi-Fi), or at the ISP, which many governments require to filter and some ISPs sell as a service[^ssd-cens]. Taiwan has ISP-level blocking too: under Article 42 of the Fraud Crime Hazard Prevention Act, authorities can order ISPs to stop resolving fraud sites, which TWNIC coordinates through DNS RPZ under a Ministry of Digital Affairs procedure[^moda-rpz]. In December 2025 the Criminal Investigation Bureau applied it to Xiaohongshu[^xhs].

## How blocking works

- **DNS blocking**: the ISP's resolver returns a wrong answer or none. Switching resolvers does not help if DNS is unencrypted[^ssd-cens]
- **IP blocking**: traffic to listed addresses is dropped, which often over-blocks because many sites share an IP[^ssd-cens]
- **Domain-name filtering of HTTPS**: HTTPS hides the page but sends the domain name in the clear (SNI). Encrypted Client Hello (ECH), on by default in Chrome and Firefox and on Cloudflare's free plan, hides it, but China and Iran block it indirectly by blocking encrypted DNS[^cf-ech][^foci-ech]
- **Keyword filtering**: only works on unencrypted traffic, or on managed devices where an administrator has installed their own CA certificate[^ssd-cens]
- **Protocol and port blocking**: firewalls recognize VPN, VoIP, or peer-to-peer traffic and block the whole category[^ssd-cens]
- **Shutdowns and throttling**: cutting connectivity entirely, blocking all foreign IPs, or slowing services until they are unusable. See [preparing for a network shutdown](../scenarios/shutdown.md)

## Checking whether you are blocked

[OONI Probe](../tools/what-is-ooni.md)'s Web Connectivity test compares results from your network with a control server[^ooni-wc]. A single anomaly is not proof of censorship. Look at results over time on [OONI Explorer](https://explorer.ooni.org/){target="_blank"}, separated by network (ASN)[^ooni-interp]. Before running it, read OONI's risk page: anyone monitoring your connection can see you running it, active measurement may be illegal in some countries, and results are published by default with your approximate location and network[^ooni-risks].

## Ways around blocking

- **Encrypted DNS** defeats DNS-only blocking but not domain-name or IP blocking, and well-known resolvers are themselves blocked in some countries[^ssd-cens][^pam]. See [how to choose encrypted DNS](../tools/encrypted-dns.md)
- **A VPN** gets around IP and most domain-name blocking, but the network can usually tell you use one, and the provider sees where you go[^ssd-cens]. See [VPN: risks and how to choose](../tools/vpn-guide.md)
- **Tor Browser** handles protocol, IP, and DNS blocking. If Tor itself is blocked, Connection Assist picks a bridge, or choose obfs4, Snowflake, WebTunnel, or meek[^tor-pt]. For China, Tor Project suggests WebTunnel first, then Snowflake and meek, and you can get Tor Browser from `@gettor_bot` on Telegram if the website is blocked[^tor-cn]
- **Messaging-app proxies** such as Signal Proxy keep messages end-to-end encrypted, but the operator sees your IP. Proxies shared privately last longer than public ones[^signal-proxy]. See [Signal Proxy](../tools/signal-proxy.md)

## Risks of circumvention

Whoever runs your network may notice the tool you use and act against you or others[^ssd-cens]. In mainland China, Article 6 of the Interim Provisions on the Administration of International Networking of Computer Information Networks prohibits individuals from using other channels for international connections, and Article 14 allows a warning, a fine of up to 15,000 yuan, and confiscation of illegal income[^cn-reg]. Individuals have been fined: a man in Guangdong was fined 1,000 yuan in 2018[^sixthtone], and a programmer in Hebei was fined 200 yuan in 2023 and had about 1.05 million yuan of income confiscated[^cdt]. Country-by-country availability and device checks at borders are covered in [device minimization and border crossings in Asia](../scenarios/asia-travel.md).

## Sources and review

Adapted from [How to: Understand and Circumvent Network Censorship](https://ssd.eff.org/module/understanding-and-circumventing-network-censorship){target="_blank"} in EFF's [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"}, last reviewed on 2024-02-01 and licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/){target="_blank"}. We added Taiwan's blocking procedure, mainland China's regulations and cases, OONI's guidance on interpreting results and on risks, the current state of ECH, Tor Project's current bridge advice, and Signal Proxy details, each sourced in the footnotes. anoni.net is responsible for any differences from the original, and this page does not represent EFF's views.

## Where to go from here

- [What is OONI](../tools/what-is-ooni.md): where public censorship measurements come from
- [VPN: risks and how to choose](../tools/vpn-guide.md): choosing a provider, obfuscation, and regional availability
- [What is Tor](../tools/what-is-tor.md): using Tor Browser

[^ssd-cens]: [How to: Understand and Circumvent Network Censorship](https://ssd.eff.org/module/understanding-and-circumventing-network-censorship){target="_blank"} - EFF Surveillance Self-Defense, last reviewed 2024-02-01.
[^moda-rpz]: [運用 DNS RPZ 自律機制停止解析違法網站處理參考程序](https://www-api.moda.gov.tw/File/Get/moda/zh-tw/Qv1tZuiNEVfsLIl){target="_blank"} - Ministry of Digital Affairs (Chinese), January 2025.
[^xhs]: [小紅書遭依法中止連線 刑事局說明啟動處置原因](https://udn.com/news/story/124671/9185901){target="_blank"} - United Daily News (Chinese), 2025-12-06.
[^cf-ech]: [Encrypted Client Hello](https://developers.cloudflare.com/ssl/edge-certificates/ech/){target="_blank"} - Cloudflare Docs. Chrome: [Chrome Platform Status](https://chromestatus.com/feature/6196703843581952){target="_blank"}.
[^foci-ech]: [Encrypted Client Hello (ECH) in Censorship Circumvention](https://petsymposium.org/foci/2025/foci-2025-0016.php){target="_blank"} - Niere et al., FOCI 2025.
[^ooni-wc]: [Web Connectivity](https://ooni.org/nettest/web-connectivity/){target="_blank"} - OONI.
[^ooni-interp]: [Interpreting OONI data](https://ooni.org/support/interpreting-ooni-data/){target="_blank"} - OONI.
[^ooni-risks]: [Risks: Things you should know before running OONI Probe](https://ooni.org/about/risks/){target="_blank"} - OONI.
[^pam]: [Measuring the Accessibility of Domain Name Encryption and Its Impact on Internet Filtering](https://arxiv.org/abs/2202.00663){target="_blank"} - Hoang, Polychronakis, Gill, PAM 2022.
[^tor-pt]: [Unblocking Tor](https://support.torproject.org/tor-browser/circumvention/unblocking-tor/){target="_blank"} - Tor Project Support.
[^tor-cn]: [Connecting to Tor from censored regions](https://support.torproject.org/tor-browser/circumvention/connecting-from-censored-regions/){target="_blank"} - Tor Project Support.
[^signal-proxy]: [Proxy Support](https://support.signal.org/hc/en-us/articles/360056052052-Proxy-Support){target="_blank"} - Signal Support.
[^cn-reg]: [中华人民共和国计算机信息网络国际联网管理暂行规定](https://www.cac.gov.cn/1996-02/02/c_126468621.htm){target="_blank"} - Cyberspace Administration of China (Chinese).
[^sixthtone]: [Guangdong Man Fined $150 for Using a VPN](https://www.sixthtone.com/news/1003431){target="_blank"} - Sixth Tone, January 2019.
[^cdt]: [Chengde Seizes Three Years of "Illegal Income" from Programmer Who Used VPN for Overseas Work](https://chinadigitaltimes.net/2023/09/chengde-seizes-three-years-of-illegal-income-from-programmer-who-used-vpn-for-overseas-work/){target="_blank"} - China Digital Times, 2023-09-28.
