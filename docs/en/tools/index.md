---
title: Tools
description: Cross-tool comparisons and hardening guidance the single-tool docs don't give you, with Asia-Pacific framing; for what each tool is, we send you to the projects' own documentation.
icon: material/toolbox-outline
---

# :material-toolbox-outline: Tools

Like the [Concepts](../basics/index.md) section, this one is deliberately thin on introductions. For what a tool *is* and how to install it, the project's own documentation is the authority, and it is kept current in a way we can't match. We send you straight there:

- **Tor** — [Tor Project Support](https://support.torproject.org/){target="_blank"} and the [Tor Browser manual](https://tb-manual.torproject.org/){target="_blank"}
- **Tails** — [Tails documentation](https://tails.net/doc/){target="_blank"}
- **OONI** — [OONI](https://ooni.org/){target="_blank"} and [OONI Probe](https://ooni.org/install/){target="_blank"}
- **OnionShare** — [OnionShare documentation](https://docs.onionshare.org/){target="_blank"}
- **GrapheneOS** — [GrapheneOS](https://grapheneos.org/){target="_blank"} and [Privacy Guides](https://www.privacyguides.org/en/android/){target="_blank"}
- **CryptPad** — [CryptPad](https://cryptpad.org/){target="_blank"}

What we publish here is the layer the single-tool docs don't cover: **cross-tool comparisons** for the decisions you have to make across competing products, and **hardening guidance** where the regional threat picture changes the advice. These are the cases where no single project's documentation can help, because the question spans several of them.

## Articles

- [Secure messaging compared](./messaging-comparison.md) — Signal, SimpleX, Session, Briar, and Matrix against a threat-model checklist (metadata, identifiers, network resistance), with the regional twist that phone-number registration ties to a legal identity.
- [Asian Diceware passphrase wordlist](./asian-diceware.md) — a community-made, EFF-compatible Diceware list that blends in dictionary-attested Asian loanwords; how to roll up a memorable-yet-strong passphrase with dice or a secure RNG.
- [Cryptocurrency privacy spectrum](./crypto-privacy-spectrum.md) — where Bitcoin, Lightning, stablecoins, Monero, and Zcash actually sit on a transparency-to-privacy axis, and what that means for at-risk users in the region.
- [Tails vs Whonix vs Qubes](./tails-vs-whonix-vs-qubes.md) — three different anonymity-OS philosophies (amnesia, isolation, compartmentalization), which threat each fits, routing setup depth to the projects.
- [Tor Browser advanced settings](./tor-browser-advanced.md) — the security-level slider, fingerprinting protections, and the common hardening mistakes, pointing to the canonical Tor docs for specifics.
- [VPN: risks and how to choose](./vpn-guide.md) — what a VPN actually changes (it moves the party watching your traffic from your ISP to the provider, not away), how to judge a trustworthy service, the trade-offs of self-hosting, and how to tell whether a VPN is usable where you are.

## Contribute and measure regionally

Two hands-on guides that fit this site's regional-observatory work rather than the comparison table above:

- [Tor Snowflake](./tor-snowflake.md) — if your connectivity is open and unfiltered, the lowest-barrier way to help Tor users in censored regions connect, from a single browser tab.
- [OONI Run v2 for regional measurement](./ooni-run-v2.md) — how a shared, dynamic test list lets a community observe whether specific sites are censored across a region, plus the one CLI gotcha we hit.

## Where to go from here

- [Concepts](../basics/index.md) — the vocabulary and threat-modeling frame these tools serve
- [Scenarios](../scenarios/index.md) — worked examples that put these tools to use for specific people
- [Regional Observatory](../regional/index.md) — what is actually reachable, and where, in the region
- Project docs: [Tor](https://support.torproject.org/){target="_blank"}, [Tails](https://tails.net/doc/){target="_blank"}, [OONI](https://ooni.org/){target="_blank"}, and [Privacy Guides](https://www.privacyguides.org/){target="_blank"} for tool recommendations
