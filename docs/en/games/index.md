---
title: Interactive
description: Privacy and anonymity technology presented as 3D visuals and playable pieces. All three current works centre on Tor - a puzzle that walks you through three-hop onion routing, a live view of traffic meeting at rendezvous points, and a relay globe built from six public datasets.
icon: material/cube-outline
---

# :material-cube-outline: Interactive

This section holds 3D pieces you can operate or simply watch, turning concepts from privacy and anonymity technology into something visible and clickable. Everything runs in the browser with three.js (WebGPU/TSL), no install required, on desktop and mobile alike. All three current works centre on Tor, with other privacy topics to follow.

## Why build them as visuals and games

Text is good at definitions and arguments. It falls short on two things: sequence and scale. Visuals and games each cover one of them.

**Visuals cover sequence.** The protection in privacy technology usually lives in the flow. Take Tor: a packet advances through three relays, shedding one layer of encryption at each hop, and two circuits meet at some relay in the middle before any content is exchanged. The order is itself the source of the protection, and a single step out of place breaks anonymity. However carefully the text is written, a reader still has to animate that part in their own head, and no two readers produce quite the same version. An animation performs it directly: order, direction, and which layer comes off at which hop are all on screen.

**Visuals also cover scale.** "Nearly ten thousand relays, heavily concentrated in a handful of countries" is a sentence you read past. Plot every single relay onto a globe and North America and Western Europe merge into one band of light while everywhere else shows a scattering of dots. The concentration becomes something you can see for yourself, without having to trust our adjectives.

**Games cover trade-offs.** Using a tool well comes down to a chain of judgements, and there is a wide gap between reading about one and doing it. The docs say "spread the three hops across different ASNs" and you read past it. Pick three relays yourself, watch the circuit fail because all three landed in the same ASN, and you will remember the reason next time. The value of a game lies in making someone decide and then live with the consequence, which sticks far better than repeated reading.

**None of this replaces the documentation.** These pieces are an entry point: make the abstract concrete first, then follow the links back for detail. Each work offers the matching further reading when you finish.

## The works

All three pieces have an English interface. The three language editions share one copy of the program, with the language selected by a URL parameter.

<div class="grid cards" markdown>

-   :material-shuffle-variant:{ .lg .middle } __Tor Routing Puzzle__

    ---

    A hands-on puzzle. Get a message from you to a recipient across the water by picking 3 relays to form Tor's guard → middle → exit path, avoiding surveilled nodes, spreading the hops across different ASNs, and switching to bridges when blocked. Each of the four levels maps to a real path-selection concern.

    <a href="../../games/onion-routing/index.html?lang=en" class="md-button md-button--primary">:octicons-arrow-right-24: Play</a>

-   :material-lan:{ .lg .middle } __Tor Traffic Flow__

    ---

    A view to watch. Glowing particles and afterimages show the two shapes Tor traffic takes: connections to .onion services have both sides build a 3-hop circuit and meet at a randomly chosen rendezvous point, while connections to the clear web run out through a 3-hop exit and return the same way. Relay count, circuit count, hostile nodes and traffic volume are all adjustable live.

    <a href="../../games/onion-rendezvous/index.html?lang=en" class="md-button md-button--primary">:octicons-arrow-right-24: Watch</a>

-   :material-earth:{ .lg .middle } __Tor Relay Globe__

    ---

    A globe built from real data. Nearly ten thousand running Tor relays placed inside their own national borders, coloured by guard, middle and exit, sized by bandwidth, with landmasses lit according to the selected metric. Alongside the relay distribution it integrates five more datasets: connection-blocking measurements, user estimates, shutdown records and submarine cables.

    <a href="../../games/tor-network/index.html?lang=en" class="md-button md-button--primary">:octicons-arrow-right-24: Explore</a>

</div>

## What the globe brings together

Of the three works, the globe carries the most information. Its purpose is to put public data scattered across different organisations onto one sphere, so that "where relays can be run" and "where Tor can be reached" can be read side by side.

### Relay distribution (Onionoo, CC0 1.0)

The main layer comes from an Onionoo relay snapshot, distilled down to country-level aggregates only, with no fingerprints, nicknames, IP addresses or contact details. It currently covers nearly ten thousand running relays across eighty countries and more than nine hundred hosting providers, with the United States, Germany and the Netherlands together accounting for over sixty percent.

Each relay is one dot on the sphere, coloured by its four possible roles (guard, middle, exit, and guard plus exit) and sized by bandwidth. Landmass brightness switches between four metrics:

- **Relay count**: how many relays the country hosts
- **Consensus weight**: the share of traffic the country actually carries in the Tor network, which often diverges noticeably from the raw count
- **Single-provider concentration**: what fraction of a country's relays sit with its largest hosting provider, showing how dependent it is on one operator
- **User estimate**: the estimated number of Tor users, a demand-side figure

Clicking any country opens an information card with its role mix, bandwidth share, the proportion running the officially recommended version, its main hosting providers, and how it appears in the other datasets.

Pressing "Live update" makes your browser fetch and recompute the data directly from onionoo.anoni.net instead of reading the snapshot hosted here. That request lets the server see your IP address, so it is off by default and left to you.

### Where connections run into trouble (OONI, CC BY-NC-SA 4.0)

Drawn from OONI's tor test results, this is the share of tests per country over the past 30 days that did not complete as expected, which OONI calls an anomaly. Causes include blocking, unstable networks and ISP faults, and the rate alone cannot separate them. The globe therefore marks only the few countries above an `85%` anomaly rate with a sufficient sample, and leaves mid-range values uncoloured entirely. Marked countries are drawn with a red gradient fading inward from the border, so a neighbouring country that is not marked cannot be misread as one that is.

### Users and bridges (Tor Metrics, CC0 1.0)

Two figures. One is the estimated number of Tor users per country, the other is bridge users broken down by pluggable transport into obfs4, snowflake, webtunnel and others, covering more than two hundred countries. Reading them together often reveals a meaningful gap: where direct connections are blocked, the bridge numbers tend to run noticeably high.

### Shutdown records (Access Now #KeepItOn, CC BY 4.0)

Internet shutdowns from `2009` to `2025`, compiled and verified case by case, covering over fifty countries. This dataset differs in kind from OONI: every entry has a verified cause, so it can state plainly that a deliberate shutdown occurred. Outages caused by armed conflict or communal violence do not necessarily follow a government decision and may result from infrastructure damage, so the globe keeps them separate from information-control cases.

### Submarine cables and base geography (OpenStreetMap ODbL, Natural Earth public domain)

The finer lines over water are submarine cables, taken from the two hundred-odd routes mapped by OpenStreetMap contributors, with the best coverage across Europe, the Mediterranean and the Atlantic. The faintest layer sketches the major transoceanic corridors, drawn as great-circle arcs between publicly documented landing points, so only the general direction is reliable and actual routing should be checked against a dedicated cable map. Borders and coastlines come from Natural Earth.

Every data file carries `source`, `sourceUrl`, `license` and `licenseUrl` fields internally, and the corresponding credits are listed below the globe. The full licence list lives in `NOTICE` at the root of the project.

### What moves on screen

The day-night terminator follows the subsolar point computed from UTC, so it tracks real time and the seasonal variation in day length falls out automatically, with no external request involved. There are also auroras, atmospheric rim light, stars and meteors, and an occasional Tor three-hop path animation. The endpoints of that animation are taken from real relay positions, so which countries get picked reflects the real distribution, but the combination of the three points is illustrative and does not model Tor's actual path-selection rules.

## Prefer to read first

These pages cover concepts that show up in the current works.

- Anonymity and what it does not cover: [Anonymity vs privacy](../basics/anonymity-vs-privacy.md)
- Running a relay and watching the network: [Tor relay watcher](../regional/tor-relay-watcher.md)
- Getting through when Tor is blocked: [Set up a Tor WebTunnel bridge](../community/setup-tor-webtunnel.md)

## What comes next

These are the first three pieces, all focused on Tor. Plenty of other privacy topics deserve the same treatment: what metadata gives away, how a threat model shifts with your situation, what the money trail behind anonymous payments looks like. All of them are on the list. If you have an idea or want to build one with us, come find us in the [community](../community/index.md).
