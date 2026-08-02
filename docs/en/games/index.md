---
title: "Interactive: 3D Tor network visualisations and games"
description: Privacy and anonymity technology presented as 3D visuals and playable pieces. All three current works centre on Tor - a puzzle that walks you through three-hop onion routing, a live view of traffic meeting at rendezvous points, and a relay globe built from more than a dozen public datasets, which at Taiwan scale adds cable landing points and the power grid.
icon: material/cube-outline
social:
  cards: false
og:
  enabled: true
  image: https://assets.anoni.net/games/tor-network.png
  image_width: 2993
  image_height: 1713
---

# :material-cube-outline: Interactive

This section holds 3D pieces you can operate or simply watch, turning concepts from privacy and anonymity technology into something visible and clickable. Everything runs in the browser with three.js (WebGPU/TSL), no install required, on desktop and mobile alike. All three current works centre on Tor, with other privacy topics to follow.

## The works

All three pieces have an English interface. The three language editions share one copy of the program, with the language selected by a URL parameter.

<div class="grid cards" markdown>

-   :material-shuffle-variant:{ .lg .middle } __Tor Routing Puzzle__

    ---

    A hands-on puzzle. Get a message from you to a recipient across the water by picking 3 relays to form Tor's guard → middle → exit path, avoiding surveilled nodes, spreading the hops across different ASNs, and switching to bridges when blocked. Each of the four levels maps to a real path-selection concern.

    <a href="../../games/onion-routing/index.html?lang=en" class="md-button md-button--primary">:octicons-arrow-right-24: Play</a>

-   :material-lan:{ .lg .middle } __Tor Traffic Flow__

    ---

    A view to watch. Glowing particles and afterimages show the two shapes Tor traffic takes: connections to .onion services have both sides build a 3-hop circuit and meet at a randomly chosen rendezvous point, while connections to the clear web run out through a 3-hop exit and return the same way. Relay count, circuit count, already-flagged hostile nodes and traffic volume are all adjustable live.

    <a href="../../games/onion-rendezvous/index.html?lang=en" class="md-button md-button--primary">:octicons-arrow-right-24: Watch</a>

-   :material-earth:{ .lg .middle } __Tor Relay Globe__

    ---

    A globe built from real data. Nearly ten thousand running Tor relays placed inside their own national borders, coloured by guard, middle and exit, sized by bandwidth, with landmasses lit according to the selected metric. Alongside the relay distribution it integrates connection-blocking measurements, user estimates, shutdown records, submarine cables and internet-usage rates. Zoom in on Taiwan and it adds county boundaries, cable landing points, substations, power plants and the transmission grid.

    <a href="../../games/tor-network/index.html?lang=en" class="md-button md-button--primary">:octicons-arrow-right-24: Explore</a>

</div>

## Why build them as visuals and games

Text is good at definitions and arguments. Two things it cannot get across: sequence, and scale.

On sequence, Tor is the obvious example. A packet advances through three relays, shedding one layer of encryption at each hop, and only at the exit is the original request restored. Connecting to a .onion service adds another layer: both sides build a circuit and meet at some relay in the middle before any content is exchanged. Which layer comes off at which hop, and what each stop gets to see, all follow from that order. However carefully the text is written, a reader still has to animate that part in their own head, and no two readers produce quite the same version. An animation performs it directly.

Scale is even harder to convey in words. "Nearly ten thousand relays, heavily concentrated in a handful of countries" is a sentence you read past. Plot every single relay onto a globe and North America and Western Europe merge into one band of light while everywhere else shows a scattering of dots. The concentration becomes something you can see for yourself, without having to trust our adjectives.

Games add a third thing: trade-offs. An ASN is an Autonomous System, roughly a stretch of network run by one organisation or individual. The docs say "spread the three hops across different ASNs" and you read past it. Pick three relays yourself, watch the circuit fail because all three landed in the same ASN, and you will remember the reason next time.

These pieces are an entry point, not a replacement for the documentation. They make the abstract concrete first, and each one offers the matching further reading when you finish.

## What the globe brings together

Of the three works, the globe pulls in the most data. It puts public datasets scattered across different organisations onto one sphere, so that "where relays can be run" and "where Tor can be reached" can be read side by side. Zoom in on Taiwan and one more layer appears: the physical infrastructure those connections actually depend on.

### Relay distribution (Onionoo, CC0 1.0)

The main layer comes from an Onionoo relay snapshot, distilled down to country-level aggregates only, with no fingerprints, nicknames, IP addresses or contact details. It currently covers nearly ten thousand running relays across around eighty countries and more than nine hundred hosting providers, with the United States, Germany and the Netherlands together accounting for over sixty percent. These figures come from the most recent snapshot, whose generation time is shown on screen.

Each relay is one dot on the sphere, coloured by its four possible roles (guard, middle, exit, and guard plus exit) and sized by bandwidth. Landmass brightness switches between four metrics:

- **Relay count**: how many relays the country hosts
- **Consensus weight**: the share of traffic the country actually carries in the Tor network, which often diverges noticeably from the raw count
- **Single-provider concentration**: what fraction of a country's relays sit with its largest hosting provider, showing how dependent it is on one operator
- **User estimate**: the estimated number of Tor users, a demand-side figure

Clicking any country opens an information card with its role mix, bandwidth share, the proportion running the officially recommended version, its main hosting providers, and how it appears in the other datasets.

Pressing "Live update" makes your browser fetch and recompute the data directly from onionoo.anoni.net instead of reading the snapshot hosted here. That request lets the server see your IP address, so it is off by default and the choice is yours.

### Where connections run into trouble (OONI, CC BY-NC-SA 4.0)

Drawn from OONI's tor test results, this is the share of tests per country over the past 30 days that did not complete as expected, which OONI calls an anomaly. Causes include blocking, unstable networks and ISP faults, and the rate alone cannot separate them. The globe therefore marks only the few countries above an `85%` anomaly rate with a sufficient sample, and leaves mid-range values uncoloured entirely. The threshold sits that high because countries with no censorship concerns, such as Switzerland and Canada, routinely land around twenty percent, and colouring the middle of the range would amount to accusing them on the strength of noise. Marked countries are drawn with a red gradient fading inward from the border, so a neighbouring country that is not marked cannot be misread as equally affected.

### Users and bridges (Tor Metrics, CC0 1.0)

Two figures. One is the estimated number of Tor users per country, the other is bridge users broken down by pluggable transport into obfs4, snowflake, webtunnel and others, covering more than two hundred countries. Reading them together often reveals a meaningful gap: where direct connections are blocked, the bridge numbers run noticeably high.

### Shutdown records (Access Now #KeepItOn, CC BY 4.0)

Internet shutdowns from `2009` to `2025`, compiled and verified case by case, covering over fifty countries. This dataset differs in kind from OONI: every entry has a verified cause, so it can state plainly that a deliberate shutdown occurred. Outages caused by armed conflict or communal violence do not necessarily follow a government decision and may result from infrastructure damage, so the globe keeps them separate from information-control cases.

### Submarine cables and base geography (OpenStreetMap ODbL, Natural Earth public domain)

The finer lines over water are submarine cables, taken from the two hundred-odd routes mapped by OpenStreetMap contributors, with the best coverage across Europe, the Mediterranean and the Atlantic. The faintest layer sketches the major transoceanic corridors, drawn as great-circle arcs between publicly documented landing points, so only the general direction is reliable and actual routing should be checked against a dedicated cable map. Borders and coastlines come from Natural Earth.

### Internet usage rate (World Bank CC BY 4.0, Ministry of Digital Affairs)

The internet usage rate on each country card exists to serve as a denominator. "How many people in this country use Tor" is in large part a comparison of population size; knowing what share of a country is online is what tells you whether a gap between two countries reflects demand or just headcount. The World Bank series covers 208 economies but not Taiwan, so the Taiwanese figure comes from the Ministry of Digital Affairs' national digital access survey instead. The two use different methods — one aggregates national reporting through the ITU, the other is a telephone sample of people aged 12 and over — and the card says so, because they should not be compared directly.

### Taiwan's infrastructure (Open Government Data License, OpenStreetMap ODbL)

Zooming in on Taiwan brings up five more layers. It is the only region on this globe drawn down to county scale.

- **County boundaries** — the Ministry of the Interior's municipality and county boundaries, 22 counties across 84 rings. It doubles as Taiwan's coastline, because the global coastline is too coarse at this scale, so the rough outline is swapped for it as you approach.
- **Cable landing points** — 14 of them, a dataset we built ourselves. Landing point coordinates are part of TeleGeography's commercial product and OpenStreetMap does not carry them, so we took the Ministry of Digital Affairs' public cable list as the spine and cross-checked each coordinate, recording a precision grade and its own sources for every entry. This v1 is incomplete and the gaps are listed in the header of the source file.
- **Substations** — Taipower's installed and reliable capacity for secondary substation main transformers, 280 sites, 201 of which can be placed on the map. The gauge on the card turns N-1 into visible geometry: the hatched band between the reliable-capacity tick and installed capacity is exactly the largest main transformer, the part that disappears when it fails. Nationwide, 64 sites have a peak load above their reliable capacity, which means losing one transformer at peak would leave the rest short. That is a separate question from whether the site is overloaded today.
- **Power plants and the 345 kV backbone** — 105 plants and 242 transmission segments. Only 17 plants can be located, but those 17 already account for 71% of installed capacity; the ones that cannot are mostly offshore wind and small hydro. Nothing below 161 kV is drawn at all, so this is not a complete grid.
- **Demand and renewables** — 93 Taipower-owned renewable sites, 124 months of county-level electricity demand, and 212 days of this year's daily peak operating reserve margin. Demand can be viewed either as total consumption or as the industrial share, and switching to the latter makes the science parks visible.

The left-hand panel groups everything Taiwan-related together, and the "Focus Taiwan" button flies straight there. Adding `#tw` to the URL does the same thing, so a shared link can decide what the recipient sees first; other country codes such as `#jp` work the same way. Plants, substations, renewable sites, landing points and transmission lines can all be clicked for detail.

Every data file carries `source`, `sourceUrl`, `license` and `licenseUrl` fields, and the corresponding credits are listed below the globe. The full licence list lives in `NOTICE` at the root of the project.

## What moves on the globe

Beyond the datasets above, a few more layers are rendered rather than fetched.

The day-night terminator follows the subsolar point computed from UTC, so it tracks real time and the seasonal variation in day length falls out automatically, with no external request involved. There are also auroras, atmospheric rim light and stars.

The occasional Tor three-hop path animation sits between the two categories. Its endpoints are taken from real relay positions, so which countries get picked reflects the real distribution, but the combination of the three points is illustrative and does not model Tor's actual path-selection rules.

## Prefer to read first

These pages cover concepts that show up in the current works.

- Anonymity and what it does not cover: [Anonymity vs privacy](../basics/anonymity-vs-privacy.md)
- Running a relay and watching the network: [Tor relay watcher](../regional/tor-relay-watcher.md)
- Getting through when Tor is blocked: [Tor Snowflake bridges](../tools/tor-snowflake.md)

## Want to help build them

The source for all three pieces lives in the [anoni-net/docs](https://github.com/anoni-net/docs) repository under `docs/zh-TW/games/`, roughly 6,300 lines of JavaScript in total, of which the globe accounts for 4,300. There is no build step: the browser loads ES modules directly, so you edit a file, save, and reload. three.js is vendored locally, which keeps the onion and IPFS editions free of any external CDN.

The documentation content on this site is under [CC BY 4.0](https://github.com/anoni-net/docs/blob/main/LICENSE), and because the source for these three pieces sits under `docs/`, the same licence applies to it. The external datasets behind the globe keep their original licences, listed in `NOTICE` at the root of the repository. One of them, OONI, is CC BY-NC-SA 4.0 and prohibits commercial use.

Knowing JavaScript is enough to work on the copy, the level design and the interaction logic. Touching the rendering takes some three.js or WebGPU experience. The fourteen `gen_*.py` data generation scripts sit in `tools/` and use only the Python standard library plus curl, with no GIS dependency at all: even the county-boundary shapefile is parsed by hand with `struct`. The same directory holds four regression checks that lift functions straight out of `atlas.js` and replay events against them, or measure the rendered layout in headless Chrome, and CI runs them whenever the relevant files change. There is also a helper that nudges the cable corridors off land, and a shell script that publishes the data. None of them need anything installed.

## What comes next

These are the first three pieces, all focused on Tor. Plenty of other privacy topics deserve the same treatment: what metadata gives away, how a threat model shifts with your situation, what the money trail behind anonymous payments looks like. All of them are on the list. If you have an idea or want to build one with us, come find us in the [community](../community/index.md).

<!-- Structured data. The three works ship their own JSON-LD in their head, since
     they never pass through the mkdocs template, and point isPartOf back at the
     zh-TW #collection. This block lists them as an ItemList. Keep the @id values
     identical to the ones in each work's index.html. -->

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://anoni.net/docs/en/games/#collection",
      "name": "Interactive",
      "url": "https://anoni.net/docs/en/games/",
      "description": "Privacy and anonymity technology presented as 3D visuals and playable pieces. All three current works centre on Tor, and the globe integrates more than a dozen public datasets.",
      "inLanguage": "en",
      "publisher": { "@id": "https://anoni.net/#organization" },
      "mainEntity": { "@id": "https://anoni.net/docs/en/games/#works" }
    },
    {
      "@type": "ItemList",
      "@id": "https://anoni.net/docs/en/games/#works",
      "name": "The works",
      "numberOfItems": 3,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "VideoGame",
            "@id": "https://anoni.net/docs/games/onion-routing/#work",
            "name": "Tor Routing Puzzle",
            "url": "https://anoni.net/docs/games/onion-routing/?lang=en",
            "image": "https://assets.anoni.net/games/onion-routing.png",
            "description": "A playable puzzle. Pick three relays to form a Tor guard, middle and exit path, avoid monitored nodes, spread the three hops across different ASNs, and switch to a bridge when blocked."
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "WebApplication",
            "@id": "https://anoni.net/docs/games/onion-rendezvous/#work",
            "name": "Tor Traffic Flow",
            "url": "https://anoni.net/docs/games/onion-rendezvous/?lang=en",
            "image": "https://assets.anoni.net/games/onion-rendezvous.png",
            "applicationCategory": "EducationalApplication",
            "description": "A piece to watch rather than play. Glowing particles trace the two shapes Tor traffic takes, with .onion connections meeting at a rendezvous point picked at random."
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "WebApplication",
            "@id": "https://anoni.net/docs/games/tor-network/#work",
            "name": "Tor Relay Globe",
            "url": "https://anoni.net/docs/games/tor-network/?lang=en",
            "image": "https://assets.anoni.net/games/tor-network.png",
            "applicationCategory": "EducationalApplication",
            "description": "A globe built from real data. Nearly ten thousand running Tor relays placed inside their own borders, layered with connectivity observations, user estimates, shutdown records, submarine cables and internet-usage rates, plus county boundaries, cable landing points, substations, power plants and the grid at Taiwan scale."
          }
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Docs", "item": "https://anoni.net/docs/en/" },
        { "@type": "ListItem", "position": 2, "name": "Interactive" }
      ]
    }
  ]
}
</script>
