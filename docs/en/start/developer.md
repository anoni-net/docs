---
title: Open-source developers
description: "A participation path for open-source contributors. Four independent lines depending on what you have: running nodes, measurement analysis, campus deployments, and documentation."
icon: material/console
---

# :material-console: Developers start here

The other role pages describe how to protect yourself. This one describes where your skills connect. Most of the anonymity network's infrastructure is run by volunteers — relays, bridges, measurement pipelines, mirrors — and every one of them is short-handed.

Look at what you have, then pick a line. The four are independent; starting one is enough.

## Twenty minutes to pick a direction

1. [2026 roadmap](https://anoni.net/en/join/roadmap-2026/){target="_blank"}: this year's three themes and where each stands, to see whether one of them is yours
2. [How to contribute](../community/how-to-contribute.md): choosing a topic, saying so on Matrix, and what ongoing participation looks like
3. [Self-skills evaluation form](../community/skill-level.md): a self-assessment across Tor, Tails, and OONI, with reading listed under each level

## Four lines you can pick up

### A machine that stays on, with stable bandwidth

The most direct contribution. Start with a relay; switch to a bridge if bandwidth is limited or the address changes.

- [Tor Relay Setup Guide](https://anoni.net/en/join/setup-tor-relay/){target="_blank"}: full configuration
- [Tor WebTunnel Bridge Setup Guide](https://anoni.net/en/join/setup-tor-webtunnel/){target="_blank"}: far lower bandwidth requirements, and worth more in a censored environment
- [Tor Snowflake](../tools/tor-snowflake.md): the lowest barrier of all, keep the page open and you are already helping; install the extension to leave it running
- [Onion Service Setup Guide](https://anoni.net/en/join/setup-onion-service/){target="_blank"}: give a service you already run an onion entrance
- [Pinning the Docs Site's IPFS Mirror](https://anoni.net/en/join/pin-ipfs-mirror/){target="_blank"}: currently a single point, and each additional pin is redundancy
- [Tor Relay Watch](https://anoni.net/en/projects/pulse/){target="_blank"}: see how many relays exist in the region and which ASNs they sit in

### You write code and work with data

The measurement line needs people who can read raw results and turn them into analysis.

- [The Structure of an OONI Measurement](https://anoni.net/en/projects/asn-coverage/ooni-data-format/){target="_blank"}: what the raw fields look like
- [OONI Blocking Verdicts](https://anoni.net/en/projects/asn-coverage/ooni-blocking-determination/){target="_blank"}: understand the logic before reading the data, or you will misread it
- [OONI Nettest Quick Reference](https://anoni.net/en/projects/asn-coverage/ooni-nettests-map/){target="_blank"}: what each test actually measures
- [ASN Observation Data Retrieval and Analysis](https://anoni.net/en/projects/asn-coverage/howto/){target="_blank"}: how this community's retrieval tool is configured and used, including the S3 public dataset layout
- [ASN observation data analysis](../regional/ooni-asn-coverage.md): current coverage, where the gaps are the open questions
- [Tor relay lookup for AI assistants](https://anoni.net/en/projects/onionoo-mcp/){target="_blank"}: a community-run relay query service (onionoo MCP), and an interface worth extending
- [OONI website testing list](../regional/ooni-checklist.md): how the test list is maintained, where classification and updates need people

### Influence inside a university or a company

Campus relays need someone who can talk to administration and legal. The technical part is the easy half.

- [Campus Tor relay proposal template](../community/campus-tor-relay-proposal.md): a proposal document, four outreach emails, and an administrative timeline drawn from a successful deployment at National Taiwan Normal University, ready to adapt
- [Campus Tor relay deployment SOP](../community/campus-tor-relay-sop.md): the steps once a proposal clears
- [An FAQ for university administrators and legal counsel](../community/campus-relay-faq.md): the questions that come up in review, with answers

### You write documentation, or translate

- [Writing style](https://anoni.net/en/join/writing-style/){target="_blank"}: the writing rules shared by all three sites, read it before drafting
- [Contributor handbook](../community/contributor-handbook.md): file naming, link format, the PR process and translation
- [Localization and translation](../community/i18n.md): the workflow across three language editions
- [Development environment setup](../community/setup-repo.md): preparation before starting a new topic

## You need a baseline of your own

Technical ability and personal operational habits are separate things. Someone holding root and a pile of API keys is worth more to an attacker than an average user.

- [What an ordinary person should actually do](../scenarios/everyday-baseline.md): ordered by real-world effect, twenty minutes
- [Networks mistaken for anonymity](../advanced/mistaken-for-anonymity.md): how far blockchains, private browsing windows, and VPNs are overestimated

## What to take with you

- [Public Matrix room](https://anoni.net/en/services/){target="_blank"}: say what you are picking up before you start, so two people do not do the same work
- [anoni-net/docs on GitHub](https://github.com/anoni-net/docs): the site source and its issues, each written with the expected scope
- Community-run CryptPad and Etherpad are available for drafting proposals, see [community services](https://anoni.net/en/services/){target="_blank"}

## What this path does not cover

- **Legal risk assessment for running a relay**: exit relays and middle relays differ substantially, and so does the law where you are. The [campus relay FAQ](../community/campus-relay-faq.md) collects the legal questions, and individual operators should assess against their own jurisdiction
- **Tor protocol internals**: this site covers the tool and measurement layers. For specifications, go to the Tor Project's documentation
