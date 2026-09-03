---
title: Tools
subtitle: Comparisons and hardening
description: Cross-tool comparisons and hardening guidance the single-tool docs don't give you, with Asia-Pacific framing; for what each tool is, we send you to the projects' own documentation.
icon: material/toolbox-outline
---

# :material-toolbox-outline: Tools

This section has two kinds of page. The introductions cover what a tool is and why it matters here, written from the vantage point of the Sinophone Asia-Pacific, so the configuration that works in Mainland China, the legal exposure in Hong Kong, and what is unremarkable in Taiwan are part of the explanation rather than a footnote. The comparisons and hardening guidance cover decisions that span several tools, where no single project's documentation can help.

For installation steps and the current state of any individual tool, the project's own documentation is the authority and stays fresher than ours:

- **Tor** — [Tor Project Support](https://support.torproject.org/){target="_blank"} and the [Tor Browser manual](https://tb-manual.torproject.org/){target="_blank"}
- **Tails** — [Tails documentation](https://tails.net/doc/){target="_blank"}
- **OONI** — [OONI](https://ooni.org/){target="_blank"} and [OONI Probe](https://ooni.org/install/){target="_blank"}
- **OnionShare** — [OnionShare documentation](https://docs.onionshare.org/){target="_blank"}
- **GrapheneOS** — [GrapheneOS](https://grapheneos.org/){target="_blank"} and [Privacy Guides](https://www.privacyguides.org/en/android/){target="_blank"}
- **CryptPad** — [CryptPad](https://cryptpad.org/){target="_blank"}

## Start here

Introductions with the regional context built in, for readers new to a tool or working out whether it fits their situation:

- [What is an anonymity network?](./what-is-anonymity-network.md) — the hub page, covering how anonymity, privacy, and circumvention differ, how the tool families divide the work, and what each of them means across the region.
- [What is Tor?](./what-is-tor.md) — onion routing, relays and bridges, which configuration works where in the region, and the situations Tor is wrong for.
- [What is Tails?](./what-is-tails.md) — the amnesic live operating system, its three design decisions, and the tasks it fits.
- [What is OONI?](./what-is-ooni.md) — turning censorship into citable measurement, and why the same DNS anomaly means different things in Taipei and in Beijing.
- [What is CryptPad?](./what-is-cryptpad.md) — zero-knowledge collaborative documents, the sharing model, and the Traditional Chinese localization this community contributed upstream.
- [OnionShare](./onionshare.md) — temporary onion services for sending files, receiving files, hosting, and one-off chat.
- [GrapheneOS](./grapheneos.md) — hardened, de-Googled Android, what it protects, and where the line at anonymity sits.
- [Getting started with password managers](./password-manager.md) — the four categories, TOTP, passkeys, hardware keys, and the regional situations international guides skip.

## Comparisons and hardening

- [Secure messaging compared](./messaging-comparison.md) — Signal, SimpleX, Session, Briar, and Matrix against a threat-model checklist (metadata, identifiers, network resistance), with the regional twist that phone-number registration ties to a legal identity.
- [Email aliases, and who you hand your trust to](./email-alias.md) — forwarding services, catch-all on your own domain, and why plus-addressing protects nobody; which party ends up holding your correspondence record, and where aliases break.
- [Asian Diceware passphrase wordlist](./asian-diceware.md) — a community-made, EFF-compatible Diceware list that blends in dictionary-attested Asian loanwords; how to roll up a memorable-yet-strong passphrase with dice or a secure RNG.
- [What is age?](./what-is-age.md) — a file encryption format with a one-page spec, one-line keys and no options; how to use it, what the format looks like, how it differs from PGP, and why this site's file encryption tool chose it.
- [What is a passkey?](./what-is-passkey.md) — a credential kept in your password manager that, with the PRF extension, derives an encryption key; why it can be the key to your data here, how it differs from a passphrase, and the domain-binding and loss limits.
- [Using AI at work without leaking data](./ai-privacy.md) — where pasted text goes, why the consumer/business tier decides most of the risk, why deleting a conversation doesn't delete the data (three- and five-year retention figures from the providers themselves), and the questions to ask before trusting a service with work material.
- [Cryptocurrency privacy spectrum](./crypto-privacy-spectrum.md) — where Bitcoin, Lightning, stablecoins, Monero, and Zcash actually sit on a transparency-to-privacy axis, and what that means for at-risk users in the region.
- [Tails vs Whonix vs Qubes](./tails-vs-whonix-vs-qubes.md) — three different anonymity-OS philosophies (amnesia, isolation, compartmentalization), which threat each fits, routing setup depth to the projects.
- [Tor Browser advanced settings](./tor-browser-advanced.md) — the security-level slider, fingerprinting protections, and the common hardening mistakes, pointing to the canonical Tor docs for specifics.
- [VPN: risks and how to choose](./vpn-guide.md) — what a VPN actually changes (it moves the party watching your traffic from your ISP to the provider, not away), how to judge a trustworthy service, the trade-offs of self-hosting, and how to tell whether a VPN is usable where you are.
- [Encrypted DNS: how to choose, and how to check it actually works](./encrypted-dns.md) — why typing `1.1.1.1` into Wi-Fi settings is not encrypted DNS, what shape each platform's field accepts, which defaults silently fall back to plaintext, and why a filtering resolver quietly corrupts your OONI measurements.

## Contribute and measure regionally

Two hands-on guides that fit this site's regional-observatory work rather than the comparison table above:

- [Tor Snowflake](./tor-snowflake.md) — if your connectivity is open and unfiltered, the lowest-barrier way to help Tor users in censored regions connect, from a single browser tab.
- [Signal Proxy](./signal-proxy.md) — how people reach Signal where it is blocked, and what it takes to run a proxy from an unfiltered network for people whose network is not.
- [OONI Run v2 for regional measurement](./ooni-run-v2.md) — how a shared, dynamic test list lets a community observe whether specific sites are censored across a region, plus the one CLI gotcha we hit.

## Where to go from here

- [Concepts](../basics/index.md) — the vocabulary and threat-modeling frame these tools serve
- [Scenarios](../scenarios/index.md) — worked examples that put these tools to use for specific people
- [Regional Observatory](../regional/index.md) — what is actually reachable, and where, in the region
- Project docs: [Tor](https://support.torproject.org/){target="_blank"}, [Tails](https://tails.net/doc/){target="_blank"}, [OONI](https://ooni.org/){target="_blank"}, and [Privacy Guides](https://www.privacyguides.org/){target="_blank"} for tool recommendations
