---
date: 2026-07-17
authors:
    - anoni-net
categories:
    - OONI
    - Technology
    - Privacy
slug: 2026-ooni-faulty-measurements
image: "assets/images/post-update.png"
summary: "We build on OONI's public dataset to observe a thinly-covered region, so we read its new bad-measurement defenses and anonymous-credential system from the consumer's seat: the well isn't poisoned, probe_cc still isn't ground truth, and — read against our own Run v2 census — data integrity and the barrier to new independent probes turn out to be the same problem."
description: "A data consumer's take on OONI's From Heuristics to Anonymous Credentials post: what its faulty-measurement findings and new anonymous-credential system mean for small observation communities in thinly-covered, higher-risk regions like APAC."
---

# OONI is guarding its data against bad measurements — what that means if you build on it

We build on OONI's public dataset. Our own work tracks how well Taiwan and the wider APAC region are actually observed in that data, and our [Run v2 census](./2026-ooni-run-v2-usage-patterns.md) mapped how the whole Run v2 ecosystem gets used. So when OONI published a long engineering post on [how it detects and mitigates faulty measurements][^1] — alongside a new anonymous-credential system now rolling into production — we read it not as OONI insiders but as people downstream who use this data to make claims about a thinly-observed part of the world.

Here is what stands out from that seat.

<!-- more -->

## The well isn't poisoned

The single most reassuring finding, for anyone who builds analysis on OONI's open data: OONI went looking for deliberate pollution and mostly did not find it. Across four heuristics — IP-geolocation mismatches, measurement-volume spikes, timestamp anomalies, and OS/version inconsistencies — the overwhelming majority of "faulty" measurements turned out to be benign. VPNs account for most of the geolocation mismatches (about 7.4% of one sample), a timezone misconfiguration on a partner's devices in Venezuela explained a cluster of timestamp anomalies, and a batch of odd Android-on-macOS records traced back to OONI's own developers' machines. There is no sign of large-scale tampering.

If you cite OONI data in reporting, litigation, or research, that conclusion matters more than any single chart in the post.

## The caveats we actually feel

Two of OONI's findings are not abstract for us.

First, **`probe_cc` is not ground truth**. A probe reports the country and network it thinks it is on, using a GeoIP database it ships locally, and VPNs routinely make that wrong — a probe "in" Canada egressing from a Russian Cloudflare WARP endpoint, and so on. When we read ASN-coverage numbers for Taiwan or APAC, this is exactly the noise we already filter out: a raw `probe_cc` count overstates how many independent local vantage points really exist.

Second, **volume is easy to fake and hard to attribute**. OONI has no reliable per-probe identity today, so a flood of measurements from one misconfigured or hostile client can skew a country's picture — the post catches an unofficial `ooniprobe-react-os` fork firing measurements at three per second, only for China. In a region where genuine coverage is already thin, a little junk goes a long way.

## Concentration and integrity are the same problem

This is where our own data comes in. When we [surveyed all 336 live Run v2 links](./2026-ooni-run-v2-usage-patterns.md), we found the ecosystem is extraordinarily concentrated: a Gini coefficient of 0.981, with just three lists driving 72% of all 14 million measurements. A handful of continuous, well-run backends carry the dataset; most lists run a few times and stop.

Set that next to OONI's integrity work and a tension appears. If the data leans on a few serious operators, then both the quality of those operators and the barrier to new ones become decisive. Anti-abuse rules that are too blunt — OONI gives the example of accepting only probes older than six months — would also shut out the fresh, independent probes that under-observed regions most need to add. OONI names this tradeoff plainly, which is the right instinct.

## Why the anonymous-credential design fits higher-risk regions

This is the part worth the attention of any small observation community, not just OONI. The new system scores trust from two attributes — how long a probe has existed and how many measurements it has submitted — and proves them cryptographically without ever storing them server-side or minting a stable global ID. It proves ranges, not exact values ("more than 1,000 measurements," "older than a week"), so the metadata cannot become a near-unique fingerprint. Pseudonyms are network-local: one identity per network, unlinkable across networks.

For observers in the global north, that is a pleasant privacy property. For a journalist or civil-society volunteer running a probe inside a hostile network, it is the difference between contributing safely and being singled out. A system that lets OONI say "only probes with real history in this network count" — without learning who those probes are — is exactly the shape a thin-coverage, higher-risk region should want. OONI is candid that full Sybil resistance still needs application-layer limits such as registration rate-limiting, but the credential raises the cost of gaming the dataset without a deanonymizing identity. The design rationale sits in OONI's two companion posts.[^2][^3]

## What we will be watching

As consumers, two numbers will tell the story over time: the ratio of verified to unverified to failed measurements, and whether the credential rollout quietly thins out fresh probes from precisely the networks that are already under-observed. If you also build on OONI data across APAC, we would like to compare notes.

## Related reading

- [We surveyed all 336 OONI Run v2 links, and three of them drive 72% of all measurements](./2026-ooni-run-v2-usage-patterns.md)

[^1]: [From Heuristics to Anonymous Credentials: Assessing OONI's Approach to Bad Measurements, OONI 2026-07-06](https://ooni.org/post/2026-faulty-measurements/){target="_blank"}
[^2]: [Requirements for OONI's anonymous credentials, OONI](https://ooni.org/post/2025-requirements-for-oonis-anonymous-credentials/){target="_blank"}
[^3]: [Announcing OONI's new anonymous credential system, OONI](https://ooni.org/post/2025-announcing-ooni-new-anonymous-credential-system/){target="_blank"}
