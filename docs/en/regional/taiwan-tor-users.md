---
title: How many people use Tor in Taiwan
description: Taiwan's Tor usage over four years, what the official numbers actually measure, and why the tenfold spike of 2025 was a counting bug rather than growth.
icon: material/account-group-outline
---

# :material-account-group-outline: How many people use Tor in Taiwan

[Tor relay watcher](./tor-relay-watcher.md) counts the relays a region contributes. This page looks at the other side of the same connection layer: how many people connect to [Tor](../tools/what-is-tor.md) (onion routing network) from Taiwan, how that has moved over four years, and what the shape of that usage says about the network environment around it.

We are a community based in Taiwan, and Taiwan is the one jurisdiction where we have first-hand standing. It is also useful to readers who work on other parts of the Sinophone Asia-Pacific, because it supplies something the region otherwise lacks: a baseline for what Tor usage looks like where nothing is blocking it. Mainland China, Hong Kong, and Taiwan share a language and much of a platform ecosystem while sitting in very different network conditions, so the same measurement taken in all three separates the effect of blocking from everything else. The comparisons below are there for that purpose.

Every figure comes from public Tor Metrics and OONI (Open Observatory of Network Interference) data under CC0 and an open licence. Retrieval commands are at the end of the page.

Taiwan averages about 9,500 Tor clients online at any given moment, up from roughly 7,400 four years ago. Between September 2025 and mid-2026 that figure briefly reached ninety thousand. That stretch was a bug in Tor's own counting code, not a surge in adoption.

## What the number actually measures

Tor has no accounts and does not count devices, so "how many users" is inferred. Relays record how many directory requests they serve, and Tor Metrics works backwards from the request count. The formula is in the project's Reproducible Metrics documentation[^1]:

```
r(N) = floor(r(R) / frac / 10)
```

`r(R)` is the number of successful directory requests reported from a country on a given day, `frac` is the share of relays reporting statistics that day, and the division by `10` comes from an assumption stated in the documentation: "A client that is connected 24/7 makes about 15 requests per day, but not all clients are connected 24/7, so we picked the number 10 for the average client."

The same document is explicit about the limit of the estimate:

> The result is an average number of concurrent users, estimated from data collected over a day. We can't say how many distinct users there are.

So the accurate phrasing is **an average of about 9,500 Tor clients concurrently online**, not 9,500 people. The number of people in Taiwan who opened Tor Browser at some point during a year is considerably higher, and this method cannot produce that figure.

The official confidence interval is wider than the point estimate suggests[^2]:

| Measure | Average since August 2026 |
|---|---|
| Estimate | 9,541 |
| Lower bound | 6,641 |
| Upper bound | 13,823 |

Single days are wider still. The estimate for 2026-09-15 is 8,312, against an interval running from 3,119 to 16,881. These figures carry direction and relative change; treated as a precise headcount they exceed what the data supports.

## Four years of slow growth

Excluding the stretch affected by the counting bug, taking the same months each year[^3]:

| Period | Average concurrent clients | Per 100,000 residents |
|---|---|---|
| June to August 2023 | 7,420 | 31.9 |
| June to August 2024 | 8,638 | 37.2 |
| June to August 2025 | 8,794 | 37.8 |
| August to mid-September 2026 | 9,541 | 41.1 |

That is roughly 29% over four years, or about 8.7% compounded across the three annual intervals, moving in one direction throughout.

Growth breaks into two separate questions with different answers.

The first is whether the absolute count is precise. The official confidence interval runs from 4,782 to 10,233 in summer 2023 and from 6,641 to 13,823 in summer 2026, and those overlap — the data cannot answer "how many thousand people in Taiwan use Tor" to any useful precision.

The second is whether the level moved. Daily means computed the same way land between 7,173 and 7,667 in 2023 and between 8,286 and 10,795 in 2026, and those do not overlap[^10]. The level did rise.

Both answers hold at once. A large part of the official interval comes from the estimation method itself — the `frac` extrapolation, the ten-requests-per-client assumption — and that component leans the same way every year. It largely cancels when asking how much this year exceeds earlier years, and does not cancel when asking how many people there are this year. The data supports "the level in Taiwan rose about 29% over four years". It does not support "Taiwan has 9,541 Tor users".

Put back into regional context, 28.6% is unremarkable. The same windows applied to nearby jurisdictions and a few reference countries[^12]:

| Region | Four-year change | Region | Four-year change |
|---|---|---|---|
| United Kingdom | +92.9% | Taiwan | +28.6% |
| Australia | +56.2% | Hong Kong | +7.6% |
| Singapore | +55.3% | United States | +4.2% |
| South Korea | +44.9% | Japan | −6.9% |

The median across those eight is 26.3%, which puts Taiwan almost exactly in the middle. Gradual growth is the common pattern across open network environments, and Taiwan is neither leading nor lagging.

## The tenfold spike was a counting bug

Taiwan's curve on Tor Metrics rises sharply from September 2025. The daily figures:

| Date | Taiwan | Worldwide |
|---|---|---|
| 2025-08-30 | 8,429 | 1,932,889 |
| 2025-08-31 | 14,531 | 2,951,998 |
| 2025-09-01 | 82,626 | 14,824,760 |
| 2025-09-02 | 109,607 | 19,374,696 |

Worldwide the count went from 1.95 million to 14.8 million in a single day, Taiwan from 8,429 to 82,626. Real adoption curves do not have that shape, and the simultaneity across every country points at the network layer rather than at anything local.

The cause is documented in the release notes for Tor `0.4.8.22`, where two fixes landed together[^4]. The first concerns old clients that could no longer reach a directory server:

> Allow old clients to fetch the consensus even if they use version 0 of the SENDME protocol. In mid 2025 we changed the required minimum version of the "FlowCtrl" protocol to 1, meaning directory caches hang up on clients that send a version 0 SENDME cell. Since old clients were no longer able to retrieve the consensus, they couldn't learn about this required minimum version -- meaning we've had many many old clients loading down directory servers for the past months.

The second concerns statistics counting failures as successes:

> Don't count networkstatus serves until they finish. When we started serving a consensus document but the client didn't receive all of it, we were still counting that as a success in our stats. This mistake, which can be triggered for example by obsolete clients or by DPI-based censorship, led to wildly inflated user counts because we estimate total users in the world based on successful consensus fetches.

Together: raising the minimum protocol version caused directory servers to hang up on old clients mid-transfer. The upgrade requirement was itself inside the consensus those clients could no longer fetch, so they retried indefinitely, and every incomplete request counted as a success, inflating the estimate proportionally.

The fix shipped on 2026-01-28 and took effect gradually as relays upgraded. Network-wide upgrade share against Taiwan's monthly average:

| Date | Relays running the fixed version | Taiwan monthly average |
|---|---|---|
| 2026-01-15 | 2.6% | 91,258 |
| 2026-03-15 | 65.8% | 25,906 |
| 2026-05-15 | 80.7% | 23,647 |
| 2026-07-15 | 89.0% | 11,075 |
| 2026-09-15 | 99.5% | 8,803 |

The two curves track each other segment by segment, and the endpoint of the decline (about 8,800) sits almost exactly at the pre-event level (8,794 averaged across June to August 2025). By mid-September 2026, 99.5% of the network was running a fixed version.

Inflation varied by region. Taking August 2025 as the baseline against January 2026: Indonesia 12.4x, Thailand 10.8x, Taiwan 10.2x, Vietnam 9.1x, against the United States at 1.6x, the United Kingdom at 1.5x, and Germany at 1.4x. Regions with more old clients were hit hardest.

The same check sequence works next time. Compare against the worldwide figure and neighbouring regions first — if everything moves together it is not a local event — then read Tor's release notes for changes to how counting works. Any comparison spanning September 2025 to June 2026 needs a note that the two sides are not comparable.

## What usage in Taiwan looks like

### Almost nobody needs a bridge

People who cannot reach public relays switch to bridges, the entry points not listed in the public directory. A high bridge share usually indicates that Tor is being blocked locally[^5]:

| Region | Direct | Bridge | Bridge share |
|---|---|---|---|
| Russia | 22,224 | 90,192 | 80.2% |
| Mainland China | 2,301 | 2,513 | 52.2% |
| Iran | 64,619 | 21,943 | 25.4% |
| Hong Kong | 6,332 | 521 | 7.6% |
| Taiwan | 9,541 | 503 | 5.0% |
| Germany | 307,354 | 6,063 | 1.9% |
| Vietnam | 23,298 | 278 | 1.2% |

This is the comparison that makes Taiwan useful as a regional reference. Three Sinophone jurisdictions appear here with bridge shares an order of magnitude apart: Mainland China at 52.2%, Hong Kong at 7.6%, Taiwan at 5.0%. Same language, overlapping platform habits, very different network conditions. Where more than half of connections need a bridge, the blocking is doing the shaping.

The indicator has limits. Vietnam's 1.18% sits below Germany's 1.93%, and Vietnam's network controls are generally considered the stricter of the two, so the share alone gives the wrong impression. Bridge use also has motives unrelated to national blocking: a corporate or campus network blocking Tor exit addresses, or someone not wanting the local network administrator to see Tor traffic, both push the share up. A high share almost always means something is in the way. A low share does not guarantee that nothing is.

Measurement from [OONI](../tools/what-is-ooni.md) points the same way. Across 168,197 `tor` tests from Taiwan since 2023, confirmed blocking stands at `0`[^6]:

| Year | Measurements | Anomaly rate | Confirmed blocking |
|---|---|---|---|
| 2023 | 28,124 | 12.3% | 0 |
| 2024 | 60,930 | 13.3% | 0 |
| 2025 | 40,546 | 16.7% | 0 |
| 2026 | 38,597 | 8.2% | 0 |

Those anomaly rates are within the test's ordinary variation and show no sign of systematic blocking.

### A weekday-shaped curve

Dividing the weekend average by the weekday average, below 1 means lighter weekend use[^7]:

| Region | Ratio | Region | Ratio |
|---|---|---|---|
| Indonesia | 0.705 | Russia | 0.995 |
| Thailand | 0.735 | United States | 0.996 |
| Philippines | 0.822 | United Kingdom | 1.000 |
| India | 0.838 | Australia | 1.005 |
| Vietnam | 0.845 | Germany | 1.016 |
| South Korea | 0.854 | Singapore | 1.016 |
| Malaysia | 0.905 | Iran | 1.019 |
| Taiwan | 0.947 | Japan | 1.028 |

Europe, North America, and Japan sit at or above 1.0, where Tor looks closer to part of ordinary personal browsing. Taiwan's 0.947 leans toward weekdays, which points to work and research settings carrying more of the weight. Neighbouring values in this table are close enough that the exact ordering should not be read as meaningful.

### Mid-range within the Asia-Pacific

Converted to users per 100,000 residents[^8]:

| Region | Per 100,000 | Region | Per 100,000 |
|---|---|---|---|
| Singapore | 437 | Taiwan | 43 |
| Germany | 371 | Malaysia | 37 |
| United Kingdom | 177 | Thailand | 31 |
| United States | 164 | Japan | 26 |
| Australia | 139 | Vietnam | 23 |
| Iran | 94 | Indonesia | 22 |
| Hong Kong | 91 | Philippines | 21 |
| Russia | 78 | India | 9 |
| South Korea | 55 | Mainland China | 0.3 |

Taiwan sits above Japan, Southeast Asia, and India, and below South Korea, Hong Kong, and the Western reference points. Singapore and Germany are high partly for infrastructure reasons: both host large volumes of cloud servers, and clients running on rented VPS instances count toward the country they are hosted in.

Mainland China's 0.3 is the number to read alongside the bridge table above. Direct connections there are not a measure of how many people want to use Tor, only of how many get through without a bridge.

### Bridge use grew during 2026 for reasons that are not clear

Taiwan's bridge users rose from a quarterly average of 137 in Q2 2025 to 501 in Q3 2026. The growth came after the counting bug was fixed, and bridge statistics travel a different path from direct-connection statistics, so this is more likely to be a real change.

Broken out by transport[^9]:

| Quarter | obfs4 | snowflake | webtunnel | unobfuscated | Total |
|---|---|---|---|---|---|
| 2025Q2 | 94 | 8 | 3 | 30 | 137 |
| 2026Q1 | 100 | 25 | 12 | 43 | 184 |
| 2026Q2 | 151 | 47 | 13 | 62 | 276 |
| 2026Q3 | 321 | 27 | 17 | 135 | 502 |

The growth concentrates in obfs4 and in unobfuscated bridges, with WebTunnel rising from zero to 17. See [Tor Browser advanced settings](../tools/tor-browser-advanced.md) for what separates these transports. Q3 2026 covers less than three months, and the Tor Metrics news page recorded several fixes to Snowflake statistics during February and March 2026, so short-term movement in that column deserves caution.

Worth noting for anyone reading this from a jurisdiction with heavier controls: in an environment where nothing is blocking Tor at the national level, bridge demand still exists and still moves. Institutional blocking, at workplaces and campuses, is a plausible driver and is not something national-level measurement can separate out. OONI probes run mostly on residential networks, so what happens inside corporate and campus networks sits outside their coverage.

## More people use the network than help carry it

Taiwan accounts for about 0.33% of Tor users worldwide while hosting about 0.12% of the network's relays, a gap of roughly three to one between consumption and contribution[^11]. Per local relay that works out to 795 local users, against 168 in the United States and 188 in Germany. The ratio measures how the load is distributed as a matter of fairness, not actual traffic: Tor path selection does not prefer relays in the user's own country.

The comparison needs one qualification. Relay counts in the United States and Germany are high partly because those are cheap, legally settled hosting markets where volunteers worldwide place their nodes, so the figure reflects hosting economics as much as local participation. Relay-side detail and the autonomous-system breakdown are on the [Tor relay watcher](./tor-relay-watcher.md) page, and [how to run a Tor relay](../community/setup-tor-relay.md) covers adding one.

## Reproducing this

All figures come from two public CSV endpoints, no key required:

```bash
curl -o tw-relay.csv "https://metrics.torproject.org/userstats-relay-country.csv?start=2023-01-01&end=2026-09-19&country=tw&events=off"
curl -o tw-bridge.csv "https://metrics.torproject.org/userstats-bridge-combined.csv?start=2023-01-01&end=2026-09-19&country=tw"
```

Both return the full history from 2011 onwards, about 37 MB each, if `start` and `end` are omitted. The files open with several `#` comment lines that need filtering before a CSV parser will read them. Substituting another two-letter country code reproduces any of the regional comparisons above.

## Next

<div class="grid cards" markdown>

- [:material-chart-bar: Tor relay watcher](./tor-relay-watcher.md)
- [:material-access-point-network: ASN observation data analysis](./ooni-asn-coverage.md)
- [:material-server-network: How to run a Tor relay](../community/setup-tor-relay.md)
- [:material-map-outline: Regional Observatory](./index.md)

</div>

[^1]: Formula and assumption from the Tor Project's [Reproducible Metrics](https://metrics.torproject.org/reproducible-metrics.html){target="_blank"}. `frac` measures the share of relays network-wide reporting statistics on a given day. Its value is identical across all countries on the same date, so it is not a per-country reliability score: on 2023-06-15 every country reads `64`, and on 2026-09-15 every country reads `56`.
[^2]: Confidence bounds are the `lower` and `upper` columns of `userstats-relay-country.csv`, present on 97% of days across the period. The table averages 2026-08-01 to 2026-09-17.
[^3]: Matching months each year avoids seasonal effects. The 2026 window moves to August and September because only 80% to 89% of the network had upgraded to a fixed version during that June to August, leaving residual counting-bug inflation in those months; the figures are clean only after the upgrade share reached 99.5% in mid-September. The cost is that the 2026 window covers two months rather than three and falls in different months, so the seasonal effect is not fully avoided. Population figures for Taiwan use the Ministry of the Interior count of 23,235,002 (July 2026).
[^4]: Both quotations come from the release notes for Tor `0.4.8.22`, published 2026-01-28, corresponding to issues [`41191`](https://gitlab.torproject.org/tpo/core/tor/-/issues/41191){target="_blank"} and [`41192`](https://gitlab.torproject.org/tpo/core/tor/-/issues/41192){target="_blank"}. Upgrade shares are computed from `versions.csv`, treating the `0.4.9` series and `0.4.8.22` as carrying the fix. The Tor Metrics news page carries no annotation for this period.
[^5]: Direct and bridge figures both average 2026-08-01 to 2026-09-17, from `userstats-relay-country.csv` and `userstats-bridge-country.csv`.
[^6]: From the OONI API `aggregation` endpoint with `probe_cc=TW` and `test_name=tor`. The 2026 row runs to September 20. "Confirmed blocking" is OONI's `confirmed` category, which requires a recognisable block page.
[^7]: Daily data from 2023-01-01 to 2025-08-30, avoiding the period affected by the counting bug. Block bootstrap resampling by week puts Taiwan's ratio at 0.947 with a 95% interval of 0.935 to 0.959, separable from Japan, South Korea, Malaysia, Thailand, Indonesia, and Germany, but overlapping with the United States.
[^8]: User counts combine direct and bridge connections, averaged 2026-08-01 to 2026-09-17. Population figures outside Taiwan are approximate 2025 estimates, so this column carries orders of magnitude rather than a precise ranking. Total population rather than online population is the denominator, which systematically understates density in Indonesia, Vietnam, and India.
[^9]: From `userstats-bridge-combined.csv`, which supplies `low` and `high` bounds; the table takes the midpoint. "Unobfuscated" is the file's `<OR>` category, meaning a plain bridge with no pluggable transport. Bridges do not report directory requests by transport, so the Tor Project approximates the split using each transport's share of unique IP addresses and then applies the same formula used for direct connections, layering two approximations.
[^10]: Daily figures are strongly autocorrelated, so dividing the standard deviation by the square root of the day count understates the standard error. These intervals correct the effective sample size using the first-order autocorrelation coefficient: `ρ` is 0.604 in summer 2023, reducing 92 days to an effective 22.7, and 0.782 in 2026, reducing 48 days to 5.9. The two intervals remain separate after the correction.
[^11]: The two shares use different windows. The user share is a Q3 2026 quarterly average from `userstats-relay-country.csv`; the relay share is a point-in-time snapshot from Onionoo on 2026-09-19. Comparing across windows carries the order of magnitude, not the decimal.
[^12]: Every region uses the same windows as Taiwan: June to August 2023 against August 1 to September 17, 2026. Germany and the worldwide total are excluded because both were affected by Germany's anomalously high user count in summer 2023, which makes that span non-comparable.
