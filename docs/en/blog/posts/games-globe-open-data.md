---
date: 2026-07-28
authors:
    - anoni-net
categories:
    - Updates
    - Tech
    - Tor
slug: games-globe-open-data
image: "https://assets.anoni.net/games/tor-network-en.png"
summary: "The docs site now has an Interactive section that renders anonymity network infrastructure as 3D visuals. Building the relay globe meant checking more than twenty public datasets, of which only six were usable. Almost nothing failed for technical reasons - the endpoints worked, the terms did not allow redistribution. This is a record of what we could and could not use, and why an open licence matters more than an open API."
description: "The docs site now has an Interactive section that renders anonymity network infrastructure as 3D visuals. Building the relay globe meant checking more than twenty public datasets, of which only six were usable. Almost nothing failed for technical reasons - the endpoints worked, the terms did not allow redistribution. This is a record of what we could and could not use, and why an open licence matters more than an open API."
---

# Drawing an anonymity network onto a globe, the Interactive section and the open-data walls we hit

![Tor Relay Globe](https://assets.anoni.net/games/tor-network-en.png){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

The docs site now has an [Interactive](../../games/index.md) section holding three pieces, all centred on Tor. The one carrying the most data is the <a href="../../../../../games/tor-network/play/index.html?lang=en">Tor Relay Globe</a>, which plots nearly ten thousand running relays onto a sphere. Over sixty percent of them sit in the United States, Germany and the Netherlands.

Building it meant checking more than twenty public datasets. Six made it in. Almost nothing failed for technical reasons: the APIs mostly worked and the formats were clean. What stopped us was terms that do not allow redistribution.

<!-- more -->

## Why build it as a visual

Anonymity network infrastructure is hard to describe in prose, and it fails on two things in particular: sequence, and scale.

On sequence, Tor is the obvious example. A packet advances through three relays, shedding one layer of encryption at each hop, and only at the exit is the original request restored. Which layer comes off at which hop, and what each stop gets to see, all follow from that order. However carefully the text is written, a reader still has to animate that part in their own head, and no two readers produce quite the same version.

Scale is harder still. "Nearly ten thousand relays, heavily concentrated in a handful of countries" is a sentence you read past. Plot every relay onto a globe and North America and Western Europe merge into one band of light while everywhere else shows a scattering of dots. The same numbers turned into a picture mean readers do not have to trust our adjectives.

## The six datasets behind the globe

| Data | Source | Licence |
|------|--------|---------|
| Relay distribution | [Onionoo](https://metrics.torproject.org/onionoo.html) | CC0 1.0 |
| User and bridge counts | [Tor Metrics](https://metrics.torproject.org/) | CC0 1.0 |
| Connection-blocking measurements | [OONI](https://ooni.org/) | CC BY-NC-SA 4.0 |
| Shutdown records | [Access Now KeepItOn](https://www.accessnow.org/keepiton-data-dashboard/) | CC BY 4.0 |
| Submarine cables | [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors | ODbL 1.0 |
| Borders and coastlines | [Natural Earth](https://www.naturalearthdata.com/) | public domain |

The Onionoo snapshot is distilled down to country-level aggregates, with no fingerprints, nicknames, IP addresses or contact details. ASN registration names are filtered as well, because an AS registered by an individual carries that person's legal name in the RIR record. For someone running a relay in a heavily censored country, that amounts to publishing which relay is theirs alongside the name on their ID.

Landmass brightness switches between four metrics. Relay count is the obvious one. Consensus weight shows the share of traffic a country actually carries, which often diverges from the raw count. Single-provider concentration is the fraction of a country's relays sitting with its largest hosting provider: the higher it goes, the more that country's anonymous traffic depends on one facility staying up and staying cooperative. The user estimate is a demand-side figure, and the gap between it and the three supply-side metrics is itself informative.

!!! info "Addendum, 2026-07-31: three more"

    Three more datasets went into the globe after this post was published. All of them cleared the same licence bar.

    | Data | Source | Licence |
    |------|--------|---------|
    | Share of population online | [World Bank](https://data.worldbank.org/indicator/IT.NET.USER.ZS) | CC BY 4.0 |
    | Same figure for Taiwan | [Ministry of Digital Affairs National Digital Access Survey](https://moda.gov.tw/digital-affairs/digital-service/operations/208) | Open Government Data Licence, version 1 |
    | Sea floor depth | [Natural Earth](https://www.naturalearthdata.com/) | public domain |

    The share of population online is there as a denominator. The globe used to say only "this many people use Tor here", and that number largely tracks population size. Knowing how many people are online at all is what lets you tell whether a gap between two countries is really about Tor.

    The World Bank figures have a gap that is awkward for a site based in Taiwan: Taiwan is not among the 217 economies. So that one figure comes from Taiwan's own government survey instead. The two are not the same kind of measurement, one is ITU compiling national reports and the other is a telephone survey of people aged 12 and over, and the globe says so where it shows the number. That is data politics of a different kind from the licence walls above, and it lands on downstream users just the same.

    Sea floor depth comes from the source already in the table, so there was no new licence to handle. Four contours at 200, 1000, 3000 and 5000 metres, the shallowest of which is the continental shelf. It is what gives the cable layer its meaning: submarine cables mostly follow the shelf and avoid the deep basins, and with both layers up you can see why the cables run where they do.

    That led to looking for cable landing points, the most fragile part of any cable and a live topic for Taiwan. OpenStreetMap does not have them. This is absence, not a failed download: a taginfo query for `man_made=cable_landing_point`, `seamark:type=landing_point` and three other candidates returns `0` worldwide for every one of them. Landing point coordinates are part of the TeleGeography product just as the cable geometry is, which is the same wall as above.

## Deliberate restraint in what gets drawn

OONI's data shows the trade-off best. It gives a per-country anomaly rate for the Tor test, and the numbers look like enough to draw a global censorship map. The middle of the range is measurement noise. Switzerland measures `22.2%`, Canada `21.2%`, New Zealand `41.1%`, and none of these countries has a censorship problem. Colouring the mid-range would amount to accusing them on the strength of noise.

The globe therefore marks only countries above an `85%` anomaly rate with a sufficient sample, leaves everything below uncoloured, and keeps the wording at "did not complete as expected". That `85%` threshold comes from no formula. We looked at the distribution and picked it. Noise tops out around forty percent, so `85%` leaves enough distance, and we would rather miss a few genuinely blocked countries than paint a clean one red.

Access Now's shutdown records work the other way round. Every entry is verified by hand and its cause is known, so the globe can state plainly that a deliberate shutdown happened there. Even so, outages caused by armed conflict or communal violence do not necessarily follow a government decision and may come from damaged infrastructure, so those are presented separately from information-control cases.

The same reasoning made us drop V-Dem's digital society indicators. That dataset's licence would have allowed it. We passed anyway. Each country-year is scored by around five experts and converted into a continuous scale by a statistical model. Painting expert scores onto a map would put our rendering behind one organisation's political judgement.

## The walls

### Submarine cables

The first candidate was [TeleGeography](https://www.submarinecablemap.com/)'s Submarine Cable Map, the authoritative dataset in this field. It turns out they now sell the coordinates as a product: [License TeleGeography's Map Data](https://www2.telegeography.com/license-geocoded-map-data) is an annual licence delivering GeoJSON over Amazon S3 or an API, pushed automatically on every update. The GeoJSON is the product.

Taiwan's [submarine cable map](https://smc.peering.tw/) took an approach worth recording, and it is the pragmatic choice when licensing is unclear: the code is MIT-licensed and open, while the geometry lives in a separate repository that returns 404. The main repo's README simply says "You can leave the folder empty".

The cables on our globe ultimately come from routes mapped by OpenStreetMap contributors, `228` segments in all. Coverage is best across Europe, the Mediterranean and the Atlantic, and the middle of the Pacific is close to empty. Digging up an OSM [mailing list thread from 2011](https://lists.openstreetmap.org/pipermail/talk/2011-October/060415.html), someone had proposed folding TeleGeography's data into OSM, and a community member's reading was that the licence forbids commercial use and derivatives, making it incompatible with ODbL. The proposal went nowhere. Fifteen years later the Pacific is still empty.

### Network infrastructure

This whole category came back nearly empty, and the reasons rhyme.

[RIPE Atlas](https://atlas.ripe.net/) probe data is lovely: querying in July `2026` returned close to sixty thousand probes worldwide with coordinates and ASNs, straight from the API. The service terms state that commercial use requires separate permission from the RIPE NCC, and there is no open licence declaration. PeeringDB's API works just as well, but its acceptable use policy forbids bulk redistribution to third parties. Packet Clearing House's IXP directory is CC BY-NC-SA 3.0 and Cloudflare Radar is CC BY-NC 4.0, and both non-commercial clauses would spread onto our content.

[IODA](https://ioda.inetintel.cc.gatech.edu/) is the one we regret most. It detects national outages from BGP withdrawals, active probing and darknet traffic anomalies, which makes it real measurement and a close fit for this site. The API returns data, and the response itself carries the line `Copyright (c) 2021-2025 Georgia Tech Research Corporation. All Rights Reserved.`

Then there is a worse category: no terms at all. The RIRs' delegated stats files download fine and open with nothing but a disclaimer, not one word about licensing. The root-servers.org node list has JSON endpoints and the site carries no licence declaration anywhere. Silence cannot be read as permission, and it is harder to handle than an explicit prohibition because there is nothing to base a judgement on. Every entry in this section is the same combination: open endpoint, retrievable data, no licence to redistribute.

### Index datasets

Freedom House's Freedom on the Net and Reporters Without Borders' Press Freedom Index are the two most frequently cited, and neither is usable. RSF's licence is CC BY-**ND**, which forbids derivatives, so converting it to JSON and re-presenting it would breach the terms. Freedom House publishes no licence statement on its site, and obtaining the data means writing to ask.

## We did not write and ask

For the organisations above, standard practice in open-data circles is to read the terms and then email anyway, since non-profit or research exemptions are often available. We deliberately did not.

What this project wanted to find out is exactly what a downstream reuser runs into. Solving each blocked dataset through individual negotiation would have produced a handful of friendly replies rather than an answer about how welcoming this ecosystem is to anyone who wants to build on it. The terms as written are what the overwhelming majority of people actually meet. Someone with no contacts, no institutional backing, and just an idea sees that one page of terms and nothing else, so this is a record of the terms rather than of a negotiation.

## What we took away

The biggest gap is that an open API is not the same as open data. We expected the difficulty to be technical, and instead most endpoints worked and most formats were clean, with everything blocking at the terms. The default posture at the RIRs, CAIDA, the RIPE NCC and PeeringDB is that you may look and you may research, but you may not carry it away wholesale, which is a different culture from Tor Metrics, OONI and Natural Earth. Datasets with no licence statement at all count here too, since in practice they are unusable. Plenty of tools in the industry do use those files, but each of them absorbs that risk privately, and a publicly published docs site cannot do the same.

Our own architecture leaves no room for hoping it is probably fine either. The docs site is static, the data files ship as they are, and they get pushed to IPFS. Content addressing means that once something is out, it stays out, and mirrors can persist indefinitely.

Looking at it from the other side, the globe exists largely because the Tor Project released Onionoo and Tor Metrics as CC0 and Natural Earth is public domain. Those decisions may have been a single line of configuration at the time, yet they let an unrelated community more than a decade later pick the data up directly, with no licensing correspondence and no worry about being asked to take it down.

One technical detail is worth recording separately. OONI's data is CC BY-NC-SA 4.0, and the ShareAlike term is incompatible with this site's CC BY 4.0. The handling is to keep `ooni.json` as its own file, never merging its contents into the other data files and only presenting it alongside the other sources, so that the whole qualifies as a collection under the CC definition and ShareAlike stops at that one file. That premise is now written into `NOTICE`, because otherwise the day someone merges an OONI field into the relay snapshot, the entire derivative falls under ShareAlike.

## The other two pieces

<a href="../../../../../games/onion-routing/play/index.html?lang=en">Tor Routing Puzzle</a> has you pick three relays to form a guard, middle and exit path, avoiding surveilled nodes, spreading the hops across different ASNs, and switching to bridges when blocked. Watching a circuit fail because all three hops landed in the same ASN sticks better than reading "spread them out" ten times.

<a href="../../../../../games/onion-rendezvous/play/index.html?lang=en">Tor Traffic Flow</a> uses glowing particles to show the difference between the two paths. Connecting to a .onion service has both sides build a three-hop circuit and meet at a randomly chosen rendezvous point. Connecting to the clear web runs three hops out to an exit and back the same way.

All three pieces run in the browser with three.js, need no install, and support Traditional Chinese, Simplified Chinese and English. The source lives in [anoni-net/docs](https://github.com/anoni-net/docs) under `docs/zh-TW/games/`, with no build step, so you edit a file, save, and reload.

If you have an idea or want to build one with us, come find us in the [community](../../community/index.md).
