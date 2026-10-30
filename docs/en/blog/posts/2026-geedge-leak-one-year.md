---
date: 2026-10-30
authors:
    - anoni-net
categories:
    - Observation
    - Tor
slug: geedge-leak-one-year
image: "https://assets.anoni.net/blog/2026-geedge-leak-one-year-map-e255e63a.webp"
summary: "In September 2025, internal files leaked from Geedge Networks, a company that builds internet censorship systems for China and other countries. A year on, researchers comparing the leaked source code with real networks find that part of China's Great Firewall likely runs this system, while results for other countries are mostly inconclusive. This post covers the findings and what people who use circumvention tools, Tor or VPNs should know."
description: "What a year of research on the Geedge leak has established and what it has not, and what it means for people who use circumvention tools, Tor or VPNs."
---

# What a Year of Research on the Geedge Leak Found

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/2026-geedge-leak-one-year-map-e255e63a.webp" target="_blank">
        <img src="https://assets.anoni.net/blog/2026-geedge-leak-one-year-map-e255e63a.webp"
            alt="Map of Geedge deployment locations recorded in the leaked documents"
            style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;">
    </a>
    <figcaption markdown="span">Geedge deployment locations recorded in the leaked documents: ① Kazakhstan, ② Ethiopia, ③ Pakistan and ④ Myanmar, with ⑤ to ⑦ marking Xinjiang, Fujian and Jiangsu in China. Boundaries from Natural Earth (public domain).</figcaption>
</figure>

In September 2025, internal files and source code (the text of a software program) leaked from Geedge Networks, a company that builds internet censorship systems for China and other countries. Until then, outsiders could only infer how the Great Firewall (the system China uses to censor and monitor the internet) works by testing it from outside; for the first time, researchers could read the code of censorship equipment directly. A year on, part of the Great Firewall likely runs Geedge's code, results for other countries are mostly inconclusive, and some news coverage has gone further than the research supports.

<!-- more -->

## What Leaked

Geedge works closely with the MESA Lab at the Chinese Academy of Sciences, and according to GFW Report, a group that studies the Great Firewall, Fang Binxing, known as the "father of the Great Firewall", is Geedge's chief scientist. The leak amounts to 572 GiB (about 600 GB), including source code, project management records and customer deployment configurations. According to the investigative organisation InterSecLab, Geedge sold its censorship system to the governments of Kazakhstan, Ethiopia, Pakistan and Myanmar, and built provincial firewalls in Xinjiang, Fujian and Jiangsu in China.

The community has translated InterSecLab's two reports into Traditional Chinese: "[The Internet Coup](https://anoni.net/docs/reports/interseclab-network-coup/){target="_blank"}" is about Geedge's products and customers, and "[MADLink](https://anoni.net/docs/reports/interseclab-madlink/){target="_blank"}" is about where Geedge's hardware comes from.

## What the Research Found

In August 2026, researchers from universities in the United States and Germany and from GFW Report published a paper. They built the leaked source code, tested Geedge's censorship system (known as TSG) in an isolated environment, and then compared how censorship equipment in different places responds on real networks. On DNS injection (sending back fake answers to website lookups) and cutting connections, three Great Firewall devices behave in ways that closely match TSG. The researchers conclude that the leaked code, or a close version of it, is likely deployed on part of the Great Firewall.

Other Great Firewall devices measured in the same way do not match TSG, and there is no public evidence of who supplied them. Results for Kazakhstan, Myanmar and Pakistan mostly stop at "possible" or "cannot confirm", and Ethiopia was not measured. The news site Risky Bulletin described TSG as "one of the Great Firewall's three known traffic filtering capabilities", wording that does not appear in the paper, and a researcher quoted in the same report noted that Geedge is only one of the vendors involved in the Great Firewall.

## Effects on Circumvention Tools, Tor and VPNs

The leaked material contains many records of efforts to block circumvention tools and VPNs (services that route your traffic through a server elsewhere to get around blocking). Client countries report which tools still connect and which blocks also hit other services, and Geedge adjusts its blocking rules in response. The circumvention tool Psiphon has no obvious traffic features, so TSG blocks its server IP addresses (a server's address on the internet) instead. The leak also contains complete NordVPN server lists: server addresses themselves are targets of collection and blocking.

Tor is an anonymity network that hides your location and keeps your internet provider from seeing where you connect. The leaked material lists Tor among the tools to identify, but the paper does not describe how TSG identifies Tor and includes no tests of Tor connections. InterSecLab's report states that at the time of the leak Geedge appeared to have no effective way to block WebTunnel (a way of connecting to Tor that disguises traffic as ordinary web browsing), and InterSecLab found no evidence of Geedge discovering or exploiting undisclosed vulnerabilities in Tor.

The usual advice still applies. If Tor will not connect on a censored network, you can use a bridge (a Tor entry point whose address is not public); see [Tor Browser advanced settings](../../tools/tor-browser-advanced.md). "The Internet Coup" notes that on unencrypted connections TSG can intercept passwords and email content, so do not log in or enter personal information on sites your browser marks as "Not secure". Installing a certificate (a digital document a website uses to prove its identity to your browser) from an unknown source can let encrypted connections be fully decrypted, so do not install one. Even without one, TSG can still learn from encrypted connections which site you are visiting. Before choosing a VPN, read [VPN: risks and how to choose](../../tools/vpn-guide.md).

## How Much Test Lists Cover

Another 2026 paper compared the domains in the leaked files and found that more than 90% of the domains measured as blocked at the researchers' vantage points are on neither of the two website lists researchers commonly measure with. List-based tools such as [OONI](../../tools/what-is-ooni.md) (an open source tool for testing whether websites are blocked) only cover the sites on the list; anything outside it is not observed at all, so finding no blocking does not mean there is none. The community also maintains the Taiwan portion of the Citizen Lab test lists.

## Open Source Shared by Censors and Circumventors

Geedge's system relies heavily on open source software such as Linux and Kafka (software for handling large volumes of real-time data). InterSecLab's report suggests that some of that code may have been used in breach of its licence terms (the conditions set for its use). Open source licences do not restrict use, so the censorship system and circumvention tools such as Tor are both built on open source software. The researchers, journalists and communities who exposed the system also investigated with open source tools and published their findings openly.

## The Taiwan Connection

According to the MADLink report, ADLINK, a Taiwanese company, shipped 1,708 network platforms to Geedge through its Beijing branch between 2019 and early 2020. They formed the hardware basis of Geedge's first-generation censorship system, and in the leaked documents this configuration was deployed only in Kazakhstan. ADLINK says it screened against export control lists before shipping, and Geedge was not on any restricted list at the time. As of 30 October 2026, Geedge does not appear on the US and EU sanctions lists we checked.

## The Full Analysis

The comparison tables, a diagram of the TSG system, the overview of open source software and the sources for every claim are in the technical article on the community homepage, [One Year of Research on the Geedge Leak](https://anoni.net/en/articles/geedge-leak-one-year/){target="_blank"}.

## Related Reading

- [Translated Reports](../../reports/index.md): Chinese translations of InterSecLab's two reports, The Internet Coup and MADLink
- [What Is Tor?](../../tools/what-is-tor.md): how Tor hides your location and who you connect to
- [Tor Browser advanced settings](../../tools/tor-browser-advanced.md): setting up a bridge when Tor will not connect
- [What Is OONI?](../../tools/what-is-ooni.md): testing whether websites are blocked with OONI
- [What surveillance can actually do](../../basics/surveillance-capability.md): what network surveillance can and cannot do
