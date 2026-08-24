---
title: OONI Website Testing List
description: How the Citizen Lab test list that OONI Probe measures against is maintained, why list quality sets a ceiling on measurement quality, and how volunteers can help review and update a country list. Uses Taiwan's tw.csv as a worked case.
icon: material/list-status
---
# :material-list-status: OONI Website Testing List

To find out whether websites in a country are censored, you first need a list of which websites to test. OONI Probe checks each URL on a pre-defined list every time it runs, so what the list contains, who maintains it, and how often it is updated set a ceiling on what any later analysis can show. A stale list makes a country look uncensored simply because nobody is testing the sites that would fail.

This is a shared problem across every country list, not a Taiwan-specific one. This page uses Taiwan's `tw.csv` as a worked case: how the list works, what shape it is currently in, and how you can help. You can apply the same review to `lists/<your-cc>.csv` for your own country.

<figure markdown="span">
    <a target="_blank"
       href="../../assets/images/ooni_asn.svg">
        <img src="../../assets/images/ooni_asn.svg"
            alt="OONI Probe Testing Process"
            title="OONI Probe Testing Process"
        >
    </a>
    <figcaption>OONI Probe Testing Process</figcaption>
</figure>

When OONI Probe runs a web connectivity test, it checks each site against a pre-defined test list. These lists are maintained by [Citizen Lab](https://citizenlab.ca/){target="_blank"} in the [test-lists](https://github.com/citizenlab/test-lists){target="_blank"} project, and cover both globally popular sites and country-specific ones.

The global list is mostly English-language sites. Country lists are maintained per region in the local language, and cover categories that matter locally. In countries with internet censorship, the country list also includes many sites known to be blocked.

URLs on the list fall into four categories:

1. **Political:** Websites expressing viewpoints that differ from the current government. Content related to human rights, freedom of expression, minority rights, and religious movements is also included.
2. **Social:** Includes topics about gender, gambling, illegal drugs and alcohol, and other subjects that may be considered sensitive or offensive in society.
3. **Conflict and Security:** Covers content related to armed conflicts, boundary disputes, separatist movements, and radical groups.
4. **Internet Tools:** Websites that provide email, cloud storage, search, translation, Voice over IP (VoIP) services, and censorship circumvention methods fall under this category.

## Current status of the Taiwan test list

Most of the current Taiwan list [tw.csv](https://github.com/citizenlab/test-lists/blob/master/lists/tw.csv){target="_blank"} was added in 2017. Without continuous maintenance, many entries now point to sites that have shut down, moved to a new domain, or are still listed under a dead or `http://`-only URL. Tidying up what is already on the list comes first.

!!! note "http:// → https://"

    Some websites do not redirect `http://` to `https://` automatically (via [`301 Moved Permanently`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301){target="_blank"} or [`308 Permanent Redirect`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/308){target="_blank"}), which produces misleading test errors. TLS certificates are now easy to obtain and encrypted transport is a baseline expectation, so `https://` should be the default form for URLs on the list.

## Updating the list

The first step is to check each site listed in [tw.csv](https://github.com/citizenlab/test-lists/blob/master/lists/tw.csv){target="_blank"} and mark it as needing an update or ready to be dropped. A [pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests){target="_blank"} then goes to [citizenlab/test-lists](https://github.com/citizenlab/test-lists){target="_blank"} with the proposed changes.

!!! info "PR #1444"

    Our community [submitted a list revision](https://github.com/citizenlab/test-lists/pull/1444){target="_blank"} on 28 September 2023. As of August 2026 it is still open and unmerged, with no reviewer activity since December 2024. Anyone who wants to help move it along is welcome to.

## Adding to the list

The list has not had a large-scale revision since it was created in 2017, so it needs a fresh review of which sites are worth adding. Candidates are screened against the four Citizen Lab categories above. This part is still under discussion in the community.

## How volunteers can help

List maintenance is a good entry point for new contributors. It needs no programming. What it does need:

- **An observant internet user's eye:** which sites are being discussed in the country, which have recently shut down, which are new and worth adding
- **Judgement on categories:** sorting candidates against the four Citizen Lab categories
- **Basic GitHub skills:** fork, edit a CSV, open a pull request

Where to start:

- **To help with list maintenance:** say so in the anoni-net public space on Matrix, see [Community](../community/index.md) for how to join. Someone will help you pick a slice to work on.
- **To help with the data analysis side:** see [ASN observation data analysis](./ooni-asn-coverage.md) and [ASN observation data retrieval and analysis](../community/asn-coverage-howto.md)
- **To read the measurement data itself:** see [Reading an OONI measurement](../community/ooni-data-format.md) and [How OONI decides a site is blocked](../community/ooni-blocking-determination.md)
- **To see what gets measured beyond this list:** see [OONI nettest quick reference](../community/ooni-nettests-map.md)
- **To understand how the community works:** see [How to contribute](../community/how-to-contribute.md)

## :fontawesome-solid-diagram-project: Where to go from here

<div class="grid cards" markdown>

- [:material-access-point-network: ASN observation data analysis](./ooni-asn-coverage.md) — what the measurements collected against this list actually cover
- [:material-radar: Regional Observatory](./index.md) — the rest of what we measure and publish
- [:material-chat-question: Why networked freedom matters](../basics/internet-freedom.md)

</div>
