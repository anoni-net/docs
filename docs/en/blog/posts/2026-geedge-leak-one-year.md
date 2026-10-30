---
date: 2026-10-30
authors:
    - anoni-net
categories:
    - Observation
    - Tor
slug: geedge-leak-one-year
image: "https://assets.anoni.net/blog/2026-geedge-leak-one-year-map-e255e63a.webp"
summary: "In September 2025, internal files leaked from Geedge Networks, a company that builds internet censorship systems for China and other countries. Over the following year, investigations moved from what Geedge sold and to whom, to which parts are actually running: part of China's Great Firewall likely uses this system, while results for other countries are mostly inconclusive."
description: "A year of research on the Geedge leak, from document investigations and supply chain tracing to code comparison, and the effects on circumvention tools, Tor and VPNs."
---

# What a Year of Research on the Geedge Leak Found

In September 2025, internal files and source code (the text of a software program) leaked from Geedge Networks, a company that builds internet censorship systems for China and other countries. Until then, outsiders could only infer how the Great Firewall (the system China uses to censor and monitor the internet) works by testing it from outside; the leak let journalists and researchers compare the code of censorship equipment with real networks for the first time. Over the year, research moved from what Geedge sold and to whom, to which parts are actually running. What has been confirmed is narrower than the headlines suggested but more solid than earlier guesswork, and people who use circumvention tools, Tor or VPNs now have a clearer picture of what they are up against.

<!-- more -->

!!! abstract "The year at a glance"

    - 2025-09-09: InterSecLab publishes "The Internet Coup"
    - 2025-09-11: The leaked files are released in full
    - 2025-09-12: GFW Report publishes its analysis of the leak
    - 2025-10: The community releases its Chinese translation of "The Internet Coup"
    - 2026-02-19: A FOCI paper compares the domains in the leaked files
    - 2026-04-24: InterSecLab publishes "MADLink"
    - 2026-08-12: A USENIX Security paper compares the code with real networks
    - 2026-10-30: The community retranslates "The Internet Coup" and publishes its research review

## Starting from the Documents

In the first weeks, partner media outlets and the investigative organisation InterSecLab worked from the documents and tickets. InterSecLab published its report "The Internet Coup" in September 2025, setting out how Geedge sold its censorship system to the governments of Kazakhstan, Ethiopia, Pakistan and Myanmar, and built provincial firewalls in Xinjiang, Fujian and Jiangsu in China. Geedge works closely with the MESA Lab at the Chinese Academy of Sciences, and according to GFW Report, a group that studies the Great Firewall, Fang Binxing, known as the "father of the Great Firewall", is Geedge's chief scientist. The leak amounts to 572 GiB (about 600 GB), including source code, project management records and customer deployment configurations.

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/2026-geedge-leak-one-year-map-e255e63a.webp" target="_blank">
        <img src="https://assets.anoni.net/blog/2026-geedge-leak-one-year-map-e255e63a.webp"
            alt="Map of Geedge deployment locations recorded in the leaked documents"
            style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;">
    </a>
    <figcaption markdown="span">Geedge deployment locations recorded in the leaked documents: ① Kazakhstan, ② Ethiopia, ③ Pakistan and ④ Myanmar, with ⑤ to ⑦ marking Xinjiang, Fujian and Jiangsu in China. Boundaries from Natural Earth (public domain).</figcaption>
</figure>

The documents show who Geedge sold to and what its customers asked for; whether the deployed equipment actually runs the code had to be checked separately. GFW Report's analysis that same month also noted that the source code had not yet been carefully analysed. The community released a Traditional Chinese translation of [The Internet Coup](https://anoni.net/docs/reports/interseclab-network-coup/){target="_blank"} in October 2025 and [retranslated it in full](./interseclab-coup-retranslation.md) in October 2026.

## Tracing the Supply Chain to Taiwan

The documents also offered leads on the supply chain. In April 2026, InterSecLab published "MADLink", which used the leaked documents to trace where Geedge's hardware comes from. ADLINK, a Taiwanese company, shipped 1,708 network platforms to Geedge through its Beijing branch between 2019 and early 2020. They formed the hardware basis of Geedge's first-generation censorship system, and in the leaked documents this configuration was deployed only in Kazakhstan.

ADLINK's reply to InterSecLab says it screened against export control lists before shipping, and Geedge was not on any restricted list at the time. As of 30 October 2026, Geedge does not appear on the US and EU sanctions lists we checked. The community has also translated [MADLink](https://anoni.net/docs/reports/interseclab-madlink/){target="_blank"} in full into Traditional Chinese.

## Comparing the Code with Real Networks

Alongside the document work, a second line of research read the code itself. In August 2026, researchers from universities in the United States and Germany and from GFW Report published a paper. They built the leaked source code, tested Geedge's censorship system (known as TSG) in an isolated environment, and then compared how censorship equipment in different places responds on real networks. On DNS injection (sending back fake answers to website lookups) and cutting connections, three Great Firewall devices behave in ways that closely match TSG. The researchers conclude that the leaked code, or a close version of it, is likely deployed on part of the Great Firewall.

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/2026-geedge-stack-en-dd45509b.webp" target="_blank">
        <img src="https://assets.anoni.net/blog/2026-geedge-stack-en-dd45509b.webp"
            alt="Layered diagram of Geedge's censorship system"
            style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;max-width:420px;width:100%;">
    </a>
    <figcaption markdown="span">A layered view of Geedge's censorship system, as of the leaked version. Boxes are marked by where each component comes from: developed in-house, open source, proprietary, or hardware from Taiwanese and Chinese vendors. The technical article explains it in full.</figcaption>
</figure>

Other Great Firewall devices measured in the same way do not match TSG, and there is no public evidence of who supplied them. Results for Kazakhstan, Myanmar and Pakistan mostly stop at "possible" or "cannot confirm", and Ethiopia was not measured. In a report by the news site Risky Bulletin, TSG is "one of the Great Firewall's three known traffic filtering capabilities", wording that does not appear in the paper, and a researcher quoted in the same report noted that Geedge is only one of the vendors involved in the Great Firewall.

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/2026-geedge-modes-en-48601f1c.webp" target="_blank">
        <img src="https://assets.anoni.net/blog/2026-geedge-modes-en-48601f1c.webp"
            alt="Diagram of censorship equipment in mirrored and in-line mode"
            style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;max-width:480px;width:100%;">
    </a>
    <figcaption markdown="span">Two ways censorship equipment connects to a network. A device in mirrored mode only receives a copy of the traffic and can only race to send forged packets. An in-line device sits on the line and can drop packets directly, and from outside there is no way to tell which device dropped them, which is why some results for Kazakhstan and Pakistan are inconclusive.</figcaption>
</figure>

The subtitle of "The Internet Coup" describes how a Chinese company is exporting the Great Firewall to autocratic regimes, which is what the documents show about sales and deployments. The code comparison answers a different question, and its answer is that part of the Great Firewall uses Geedge's code, while deployments in other countries still await confirmation by measurement.

## Effects on Circumvention Tools, Tor and VPNs

The leaked material contains many records of efforts to block circumvention tools and VPNs (services that route your traffic through a server elsewhere to get around blocking). Client countries report which tools still connect and which blocks also hit other services, and Geedge adjusts its blocking rules in response. The circumvention tool Psiphon has no obvious traffic features, so Geedge blocks its server IP addresses (a server's address on the internet) instead. The leak also contains complete NordVPN server lists: server addresses themselves are targets of collection and blocking.

Tor is an anonymity network that hides your location and keeps your internet provider from seeing where you connect. The leaked material lists Tor among the tools to identify, but the paper does not describe how TSG identifies Tor and includes no tests of Tor connections. InterSecLab's report states that at the time of the leak Geedge appeared to have no effective way to block WebTunnel (a way of connecting to Tor that disguises traffic as ordinary web browsing), and InterSecLab found no evidence of Geedge discovering or exploiting undisclosed vulnerabilities in Tor.

If Tor will not connect on a censored network, the usual advice still applies: you can use a bridge (a Tor entry point whose address is not public); see [Tor Browser advanced settings](../../tools/tor-browser-advanced.md). "The Internet Coup" notes that on unencrypted connections TSG can intercept passwords and email content, so do not log in or enter personal information on sites your browser marks as "Not secure". Do not install a certificate (a digital document a website uses to prove its identity to your browser) from an unknown source either; once installed, it can let encrypted connections be fully decrypted. Even without one, TSG can still learn from encrypted connections which site you are visiting. Before choosing a VPN, read [VPN: risks and how to choose](../../tools/vpn-guide.md).

## Blocking That Measurement Misses

In another paper, from February 2026, researchers started from the domains that appear in the leaked files. More than 90% of the domains measured as blocked at their vantage points are on neither of the two website lists researchers commonly measure with. List-based tools such as [OONI](../../tools/what-is-ooni.md) (an open source tool for testing whether websites are blocked) only cover the sites on the list; anything outside it is not observed at all, so finding no blocking does not mean there is none. The community maintains the Taiwan portion of the Citizen Lab test lists, and a list can only cover the sites its maintainers think of, a limit we keep in mind as we maintain it.

## Open Source Shared by Censors and Circumventors

Geedge's system relies heavily on open source software such as Linux and Kafka (software for handling large volumes of real-time data), and InterSecLab suggests in its report that some of that code may have been used in breach of its licence terms (the conditions set for its use). Open source licences do not restrict use, so the censorship system and circumvention tools such as Tor are both built on open source software. The year's investigations relied on openness too: researchers used open source tools to process documents and published their measurement scripts, and InterSecLab released its reports under an open licence, which is what allowed the community to translate them.

## Open Questions

There is no public evidence of who supplied the rest of the Great Firewall's equipment. Kazakhstan and Ethiopia lack suitable vantage points, so deployments in the client countries cannot yet be confirmed by measurement. The leaked documents also mention a client code-named A24 whose identity is still unknown, and the leaked code has not been fully reviewed. Tor, Psiphon and VPN providers have not publicly described any changes made in response to the leak. The community will keep following the research, and you are welcome to join the discussion on [Matrix](https://anoni.net/en/contact/){target="_blank"}.

## The Full Analysis

The comparison tables, a diagram of the TSG system, the overview of open source software and the sources for every claim are in the technical article on the community homepage, [One Year of Research on the Geedge Leak](https://anoni.net/en/articles/geedge-leak-one-year/){target="_blank"}.

## Related Reading

- [Translated Reports](../../reports/index.md): Chinese translations of InterSecLab's two reports, The Internet Coup and MADLink
- [What Is Tor?](../../tools/what-is-tor.md): how Tor hides your location and who you connect to
- [Tor Browser advanced settings](../../tools/tor-browser-advanced.md): setting up a bridge when Tor will not connect
- [What Is OONI?](../../tools/what-is-ooni.md): testing whether websites are blocked with OONI
- [What surveillance can actually do](../../basics/surveillance-capability.md): what network surveillance can and cannot do
