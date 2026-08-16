---
title: What Is OONI?
description: OONI is a set of open tools and public datasets that make network censorship observable, turning "it won't load" and "it's slow" into records with a time, a place, and an autonomous system number attached.
icon: material/access-point-network
---

# :material-access-point-network: What Is OONI?

When a site will not load, the first instinct is usually to wonder whether it is your own connection. OONI (Open Observatory of Network Interference) exists to turn that experience into verifiable data. It provides an open source measurement tool, [OONI Probe](https://ooni.org/install/){target="_blank"}, and a public data platform, [OONI Explorer](https://explorer.ooni.org/){target="_blank"}, so anyone can run a test, look up records, and leave blocking, monitoring, and throttling with a trace that has a time, a location, and an autonomous system number (ASN) attached.

The value is that it moves an argument onto data. A site being unreachable does not have to stop at speculation about whether it was blocked. OONI leaves a record that communities, journalists, and researchers can cite and reproduce. That is also why [ASN observation coverage](../regional/ooni-asn-coverage.md) is worth tracking over time: the more varied the vantage points, the more representative the record.

## What the OONI project does

The work divides into four parts. At the core is [OONI Probe](https://ooni.org/install/){target="_blank"}, the measurement application that checks whether a particular site or online service is blocked. Results become a [public dataset](https://ooni.org/data/){target="_blank"} that anyone can [query and analyze online](https://explorer.ooni.org/){target="_blank"} to see [censorship conditions by country](https://explorer.ooni.org/countries){target="_blank"}. OONI works with researchers and advocates to analyze that data and track [regional and global trends](https://ooni.org/post/){target="_blank"}, and with [partner organizations](https://ooni.org/partners/){target="_blank"} and local communities to extend measurement into more corners of the network.

Running measurements adds your own network's observations to the public dataset. When someone else needs to evidence a blocking event, trace a cross-border difference, or compare conditions across ASNs, the record they cite is more varied for it.

## How it works

<figure markdown="span">
    <a href="../../assets/images/how-ooni-works.svg">
        <img src="../../assets/images/how-ooni-works.svg"
            alt="How OONI works, comparing page responses to infer whether content was interfered with"
            title="How OONI works, comparing page responses to infer whether content was interfered with"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 0%);">
    </a>
</figure>

- **Probe**: the measurement application, testing websites, messaging app connectivity, VPN connectivity, and performance
- **Censor**: whoever monitors traffic in transit, which could be a corporate IT network, a telecommunications company, or national infrastructure. The methods differ and the effect is the same, preventing the content from being seen:
    1. **DNS tampering**: resolving a name to the wrong address, so you reach a substitute page or nothing at all
    2. **IP blocking**: dropping traffic to the destination server's IP address
    3. **HTTP blocking**: intercepting at the web layer, commonly returning a block notice page
    4. **TLS-based interference**: cutting the connection as encryption is being negotiated, for example a reset or timeout right after the ClientHello
- **Tor**: the onion routing network, relaying requests through three nodes
- **Helper**: OONI's test helper servers on unaffected networks. After a probe tests a URL, the helper tests the same URL from a network without interference, and the difference between the two results is what the determination rests on. The full mechanism is in [how OONI determines that a site is blocked](../community/ooni-blocking-determination.md)

### Blocking is not always censorship, and the data does not pretend to know

One reason this site treats OONI as a regional instrument rather than an activism tool is that the same measurement means different things in different places. Taiwan is a useful demonstration because most of the DNS-layer blocking that shows up there is uncontroversial: Chunghwa Telecom's opt-in paid content filtering subscription for households, ad and malware blocking through [AdGuard](https://adguard.com/){target="_blank"} or [Pi-hole](https://pi-hole.net/){target="_blank"}, and the DNS response policy zone mechanism that the Taiwan Network Information Center (TWNIC) coordinates and participating ISPs execute against fraud domains, under orders from agencies including the Criminal Investigation Bureau. All of it can register as a DNS anomaly. None of it is political blocking.

Compare that with Mainland China, where the Great Firewall's interference spans DNS tampering, IP blocking, and TLS interruption at national scale, or with jurisdictions where specific statutes drive selective blocking of individual URLs. The measurement technique is identical. The interpretation is entirely contextual, and OONI deliberately leaves that interpretation to people.

!!! question "Is the network we are on actually free?"

    The examples above are mostly benign blocking aimed at malicious sites, ads, and phishing. The harder question is what happens when blocking is deliberate, or when it comes from an ASN nobody is measuring. **Current data for Taiwan shows no large-scale blocking**, with anomalies at roughly 3% and confirmed blocking well under 0.01% of web measurements over the past year. The largest single share of observations comes from one carrier, Chunghwa Telecom ([`AS3462`](https://radar.cloudflare.com/as3462){target="_blank"}), at about a third of the total, with a long tail of networks contributing far less. Evening out that distribution is what the [ASN coverage](../regional/ooni-asn-coverage.md) work exists to address, by identifying which networks in Taiwan still have no vantage point at all.

    Worth keeping apart: the fraud domains handled through DNS RPZ are not on OONI's test list for Taiwan, so that mechanism does not appear in these figures at all. No large-scale blocking is an accurate reading. No blocking would not be.

## What OONI is good for, and what it is not

OONI sits differently from [Tor](./what-is-tor.md) and [Tails](./what-is-tails.md). Those protect the person using them. OONI gives communities, journalists, and researchers a way to observe the network environment. Checking against [how to build a threat model](../basics/threat-model.md) first helps clarify whether your need is actually the one OONI addresses.

**Good for**:

- Evidencing a blocking event. A site unreachable at a particular time on a particular ASN leaves a citable record once a probe has run
- Watching one region's network environment change over time. Running OONI Probe on a schedule produces a trend over months
- Comparing across ASNs and across regions. OONI Explorer puts different ASNs side by side, showing which segment of the network differs
- Journalism, research, and advocacy. Where externally verifiable data is needed, a public dataset is a solid basis to cite

**Not good for**:

- Real-time alerting. Explorer data arrives close to real time through the fastpath, and it is not built for second-by-second alarms. The raw S3 dataset runs about an hour behind
- Diagnosing a compromised device or a local DNS misconfiguration. OONI looks at reachability at the network layer, not endpoint security
- Identifying the details of deep packet inspection. OONI observes outcomes, meaning whether the connection worked and whether the response looked anomalous, rather than the packet-level process
- Replacing Tor or a VPN. OONI does not anonymize your connection. It tells you whether the network is interfering

OONI Probe is available for [mobile](https://ooni.org/install/){target="_blank"} (Android, iOS), [desktop](https://ooni.org/install/){target="_blank"} (Windows 64-bit, macOS), and as a [command-line tool](https://ooni.org/install/cli){target="_blank"}.

<figure markdown="span">
    <a href="../../assets/images/ooni_screen_desktop.png">
        <img src="../../assets/images/ooni_screen_desktop.png"
            alt="The OONI Probe desktop application"
            title="The OONI Probe desktop application"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 50%);width:75%;">
    </a>
</figure>

On the command line, `ooniprobe run` executes all test suites. A cron job runs it automatically at quiet hours:

``` bash
# Run at 10 minutes past the 4th, 10th, and 22nd hour.
10 4,10,22 * * * ooniprobe run > /dev/null 2>&1 &
```

!!! warning "Automatic runs"

    The `ooniprobe autorun` command currently works only on macOS. Installing the CLI on Debian or Ubuntu enables periodic background testing by default, with no cron job needed. The example above is for environments without either.

## OONI Explorer

<figure markdown="span">
    <a href="../../assets/images/ooni_explorer.png">
        <img src="../../assets/images/ooni_explorer.png"
            alt="The OONI Explorer data site"
            title="The OONI Explorer data site"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 50%);width:75%;">
    </a>
</figure>

Measurements return to OONI's database and can be analyzed by region and by test through [OONI Explorer](https://explorer.ooni.org/){target="_blank"}. The raw data is also on [S3 through the Registry of Open Data on AWS](https://registry.opendata.aws/ooni/){target="_blank"}, about an hour behind, for deeper cross-analysis. Which one you want depends on whether the question calls for a quick look or a full dataset.

!!! info "Breaking results out by ASN"

    Setting the vertical axis to ASN separates the observations by network.

    <figure markdown="span">
        <a href="../../assets/images/ooni_explorer_asn.png">
            <img src="../../assets/images/ooni_explorer_asn.png"
                alt="OONI Explorer with the vertical axis set to ASN, separating observations by network"
                title="OONI Explorer with the vertical axis set to ASN, separating observations by network"
                style="border-radius: 10px;border:1px solid hsl(0, 0%, 50%);width:80%;">
        </a>
    </figure>

## Common questions

??? question "If I run OONI Probe at home, will my ISP flag me?"

    Probe's behaviour, connecting to sites on a public test list and recording the responses, differs little from ordinary browsing. In Taiwan there is no known case of an ISP blocking or warning a user for running OONI, and the default [test list](https://github.com/citizenlab/test-lists){target="_blank"} excludes most highly sensitive categories. "No known case" is an observation under Taiwan's threat model and does not transfer. In Hong Kong, monitoring and chilling effects rose after the 2020 National Security Law, and the Hong Kong section of [VPN: risks and how to choose](./vpn-guide.md) is worth reading before running measurements. In heavily censored countries the situation differs again, and OONI's own documentation carries additional risk guidance.

??? question "Does OONI produce false positives?"

    Yes. OONI sees that a connection result differs from the norm, and does not assert a cause. Common sources of error: the destination site being down, CDN load balancing changing IP addresses, a local DNS misconfiguration, and compliance filtering on a corporate or campus network. Explorer publishes the underlying observations at each layer (DNS, TCP, TLS, HTTP), so a false positive can be traced and corrected. Before drawing a firm conclusion, cross-check multiple ASNs and multiple time windows.

??? question "TWNIC's DNS blocking targets fraud sites. Does OONI count that as censorship?"

    OONI observes and records rather than adjudicates. A given site showing a DNS anomaly on a given network at a given time is what gets written down. Whether that is censorship, and whether it is reasonable, is for people to interpret. Fraud-domain blocking would appear in the data as a DNS anomaly and is not automatically labelled censorship, and in practice those domains are not on the test list, so they rarely appear at all. That is precisely where the value of the data lies: it is public and reproducible, rather than resting on anyone's authority.

??? question "Can I run OONI Probe and Tor at the same time?"

    Yes, with the purposes kept apart. Probe measures over your local ISP connection, which is what makes the observation about your local network environment. Routing OONI through Tor measures the Tor exit node's environment instead, which defeats the point. Tor Browser and OONI Probe coexist on the same machine and operate independently.

??? question "What is the easiest way to contribute?"

    Install [OONI Probe](https://ooni.org/install/){target="_blank"} on your phone and let it run once a day. If you have a Linux machine at home, the cron job above accumulates observations continuously. Going further, the [OONI Website Testing List](../regional/ooni-checklist.md) covers adding sites of local interest, and [ASN observation coverage](../regional/ooni-asn-coverage.md) shows which networks still lack a vantage point.

## :material-chat-question: Related concepts

<div class="grid cards" markdown>

- [:material-chat-question: How to build a threat model](../basics/threat-model.md)
- [:material-chat-question: Why networked freedom matters](../basics/internet-freedom.md)
- [:material-chat-question: What is an anonymity network](./what-is-anonymity-network.md)

</div>

## :fontawesome-solid-diagram-project: Where to go next

<div class="grid cards" markdown>

- [:material-list-status: OONI Website Testing List](../regional/ooni-checklist.md)
- [:material-access-point-network: ASN observation data analysis](../regional/ooni-asn-coverage.md)
- [:material-server-network: Tor relay watcher](../regional/tor-relay-watcher.md)

</div>

## :material-code-json: Reading the measurement data

<div class="grid cards" markdown>

- [:material-code-json: A tour of OONI measurement data](../community/ooni-data-format.md)
- [:material-shield-search: How OONI determines that a site is blocked](../community/ooni-blocking-determination.md)
- [:material-table-search: OONI test quick reference](../community/ooni-nettests-map.md)
- [:material-database-search: Extracting and analyzing ASN observation data](../community/asn-coverage-howto.md)

</div>
