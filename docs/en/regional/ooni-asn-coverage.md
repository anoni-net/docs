---
title: ASN observation data analysis
description: A coverage audit of OONI measurement data for Taiwan: 78.94% of observations come from just two ASNs and only 7.32% of the country's roughly 437 ASNs appear at all. Explains why ASN diversity limits what censorship measurement can show, and how to run the same audit for your own country.
icon: material/access-point-network
---

# :material-access-point-network: ASN observation data analysis

!!! info "About the figures on this page"

    The coverage analysis below was carried out between November 2023 and March 2024, and the report it draws on is from December 2023. The numbers describe that period. The method is what carries over: you can run the same audit against current data for any country.

## Why ASN diversity matters

The internet is a mesh of interconnected Autonomous Systems (AS). Each AS is a group of networks under one administration (a telecom operator, a university, a company, a CDN provider) with its own routing policy, exchanging traffic with other ASes over BGP, the protocol networks use to announce which addresses they can reach. Every AS has a unique number, its ASN.

<figure markdown="span" style="width: 80%;">
    <a target="_blank"
       href="https://www.cloudflare.com/learning/network-layer/what-is-an-autonomous-system/">
        <img src="../../assets/images/autonomous-system-diagram.svg"
            alt="How ASNs interconnect on the real network, diagram from cloudflare.com"
            title="How ASNs interconnect on the real network, diagram from cloudflare.com">
    </a>
    <figcaption>How ASNs interconnect on the real network ([image source](https://www.cloudflare.com/learning/network-layer/what-is-an-autonomous-system/){target="_blank"}).</figcaption>
</figure>

For OONI measurement, the ASN is the smallest useful unit of "which network did we see this censorship on". The same website may be unreachable on one carrier and fine on another, and you cannot tell those apart without breaking the data down by ASN. That is why OONI analysis keeps asking how many distinct ASNs a region's measurements come from. The higher that share, the better the data reflects the region's actual connectivity.

??? question "Want to know which ASN you are on?"

    - [ip.me](https://ip.me/){target="_blank"}: shows your current IP address and the ASN it belongs to
    - [Cloudflare Radar (AS3462)](https://radar.cloudflare.com/en-us/as3462){target="_blank"}: traffic trends and history for a given ASN
    - [Is BGP safe yet?](https://isbgpsafeyet.com/){target="_blank"}: checks whether your ISP has deployed RPKI route validation

??? question "Want to read about BGP hijacking and AS behaviour?"

    See Cloudflare Learning on [what an autonomous system is](https://www.cloudflare.com/learning/network-layer/what-is-an-autonomous-system/){target="_blank"} and [what BGP is](https://www.cloudflare.com/learning/security/glossary/what-is-bgp/){target="_blank"}.

## Taiwan: measurement concentrated in a few carriers

[OONI](https://ooni.org/){target="_blank"} is supported by a global network of volunteers who use [OONI Probe](https://ooni.org/install/){target="_blank"} to detect issues like internet blocking and content censorship in their regions. The test results from OONI Probe are uploaded to the project's [open data repository](https://registry.opendata.aws/ooni/){target="_blank"} for record-keeping and further analysis and use.

From November 2023 to March 2024, we analyzed the open data using our [retrieval scripts](https://github.com/anoni-net/docs/tree/main/asn_coverage){target="_blank"} to assess how complete the observation data was and where the gaps were.

According to findings in the [December 2023 report](https://ocf.tw/en/p/ooni/report/202312.html){target="_blank"} by the Open Culture Foundation (OCF), a Taiwan-based nonprofit supporting open-source and digital-rights work, Taiwan's observational data ranked among the top ten in the OONI Explorer database by volume, which looks adequate. The samples tell a different story once you break them down by network: most observations come from [AS3462](https://radar.cloudflare.com/en-us/as3462){target="_blank"} (Chunghwa Telecom, the incumbent national carrier) and [AS18041](https://radar.cloudflare.com/en-us/as18041){target="_blank"} (Taiwan Digital Streaming), which together account for about 78.94% of all observation data. Taiwan has roughly 437 ASNs, yet the measurements cover only 7.32% of them.

High volume concentrated in two networks cannot reflect Taiwan's internet landscape, which also includes cable broadband providers, fixed-line networks, and MVNOs (mobile virtual network operators, which resell service over infrastructure they do not own). A blocking event on a network nobody measures leaves no trace in the data.

For detailed content, please refer to the following report.

[:material-chart-bar: December 2023 Observation Report](https://ocf.tw/en/p/ooni/report/202312.html){ .md-button .md-button--primary target="_blank" }

## Reading a single measurement

!!! info "We are looking for volunteers"

    If you are interested in data tracing, research, and analysis, we would like to hear from you. Say hello in the anoni-net public space on Matrix, see [Community](../community/index.md) for how to join.

### Running a test yourself

If you haven't used OONI Probe yet, try understanding the process through the following steps:

1. Download OONI Probe, whether it's the mobile version or the desktop version.
2. Open OONI Probe, select the "Websites" category, and "Run" the test.
3. Once the test is complete, go to "Test Results" and find the recently completed "Websites" test result. Check for any items marked with "!" or "?".
4. Click on any "!" or "?" test item to view potential issues. There you will find links labeled "Data" and "Show in OONI Explorer."
5. Click on any link to view the original data test results.

### Reading the raw data

Take this measurement, identified by the UID:

- [`20241024185921.623617_TW_webconnectivity_578b6d3845fed2e2`](https://explorer.ooni.org/zh-Hant/m/20241024185921.623617_TW_webconnectivity_578b6d3845fed2e2){target="_blank"}

In this example, the result shows `Test failure on AS3462`, with the failure message `unknown_failure: dial tcp [scrubbed]: connect: host is down`, indicating the host did not respond at the time of the test. In the "DNS queries" section, `www.asap.com.tw` has a DNS `A` record pointing to `60.250.151.72` (AS3462, Chunghwa Telecom Co., Ltd.), resolved through Cloudflare DNS at `162.158.242.36`.

Finally, in the "Raw Measurement Data" section, you can find all the raw data of the test items. Some data might not be completely presented on the results page, but you can find more data for collection and analysis in the "Raw Measurement Data."

<figure markdown="span">
    <a target="_blank"
       href="../../assets/images/ooni_raw_data.png">
        <img src="../../assets/images/ooni_raw_data.png"
            alt="Information shown in the OONI Probe raw measurement data view"
            title="Information shown in the OONI Probe raw measurement data view"
            style="border: 1px solid #000000; border-radius: 10px;"
        >
    </a>
    <figcaption>Information on "Raw Measurement Data" in OONI Probe.</figcaption>
</figure>

!!! question "Detections Revealing Differences Between AS and DNS"

    This example shows that OONI Probe records the whole test path. Note that even though the connection went through Chunghwa Telecom's network, the DNS queries in the test data were answered by Cloudflare's DNS.

    - Question: If a website is blocked and cannot be accessed, is it an issue with the AS or the DNS?


## Want to run the analysis yourself?

If you want to retrieve and analyse OONI's public data to calculate ASN coverage for a region, the tooling setup and commands are here:

[:material-database-search: ASN observation data retrieval and analysis](../community/asn-coverage-howto.md){ .md-button .md-button--primary }

## :fontawesome-solid-diagram-project: Where to go from here

<div class="grid cards" markdown>

- [:material-list-status: OONI Website Testing List](./ooni-checklist.md) — the list these measurements are collected against, and how to help maintain it
- [:material-radar: Regional Observatory](./index.md) — the rest of what we measure and publish
- [:octicons-mark-github-24: Development environment setup](../community/setup-repo.md) — set up the environment to run the analysis yourself

</div>
