---
title: "Interactive: 3D Tor network visualisations and games"
description: Privacy and anonymity technology presented as 3D visuals and playable pieces. All three current works centre on Tor - a puzzle that walks you through three-hop onion routing, a live view of traffic meeting at rendezvous points, and a relay globe built from more than a dozen public datasets, which at Taiwan scale adds cable landing points and the power grid.
icon: material/cube-outline
social:
  cards: false
og:
  enabled: true
  image: https://assets.anoni.net/games/tor-network-en.png
  image_width: 2560
  image_height: 1440
---

# :material-cube-outline: Interactive

This section holds 3D pieces you can operate or simply watch, turning concepts from privacy and anonymity technology into something visible and clickable. Everything runs in the browser with three.js (WebGPU/TSL), no install required, on desktop and mobile alike. All three current works centre on Tor, with other privacy topics to follow.

## The works

All three pieces have an English interface. The three language editions share one copy of the program, with the language selected by a URL parameter.

<div class="grid cards" markdown>

-   :material-shuffle-variant:{ .lg .middle } __Tor Routing Puzzle__

    ---

    A hands-on puzzle. Get a message from you to a recipient across the water by picking 3 relays to form Tor's guard → middle → exit path, avoiding surveilled nodes, spreading the hops across different ASNs, and switching to bridges when blocked. Each of the four levels maps to a real path-selection concern.

    [:octicons-arrow-right-24: Read more](onion-routing.md){ .md-button .md-button--primary }
    <a href="../../games/onion-routing/play/index.html?lang=en" class="md-button">Play</a>

-   :material-lan:{ .lg .middle } __Tor Traffic Flow__

    ---

    A view to watch. Glowing particles and afterimages show the two shapes Tor traffic takes: connections to .onion services have both sides build a 3-hop circuit and meet at a randomly chosen rendezvous point, while connections to the clear web run out through a 3-hop exit and return the same way. Relay count, circuit count, already-flagged hostile nodes and traffic volume are all adjustable live.

    [:octicons-arrow-right-24: Read more](onion-rendezvous.md){ .md-button .md-button--primary }
    <a href="../../games/onion-rendezvous/play/index.html?lang=en" class="md-button">Watch</a>

-   :material-earth:{ .lg .middle } __Tor Relay Globe__

    ---

    A globe built from real data. Nearly ten thousand running Tor relays placed inside their own national borders, coloured by guard, middle and exit, sized by bandwidth, with landmasses lit according to the selected metric. Alongside the relay distribution it integrates connection-blocking measurements, user estimates, shutdown records, submarine cables and internet-usage rates. Zoom in on Taiwan and it adds county boundaries, cable landing points, substations, power plants and the transmission grid.

    [:octicons-arrow-right-24: Read more](tor-network.md){ .md-button .md-button--primary }
    <a href="../../games/tor-network/play/index.html?lang=en" class="md-button">Explore</a>

</div>

## Why build them as visuals and games

Text is good at definitions and arguments. Two things it cannot get across: sequence, and scale.

On sequence, Tor is the obvious example. A packet advances through three relays, shedding one layer of encryption at each hop, and only at the exit is the original request restored. Connecting to a .onion service adds another layer: both sides build a circuit and meet at some relay in the middle before any content is exchanged. Which layer comes off at which hop, and what each stop gets to see, all follow from that order. However carefully the text is written, a reader still has to animate that part in their own head, and no two readers produce quite the same version. An animation performs it directly.

Scale is even harder to convey in words. "Nearly ten thousand relays, heavily concentrated in a handful of countries" is a sentence you read past. Plot every single relay onto a globe and North America and Western Europe merge into one band of light while everywhere else shows a scattering of dots. The concentration becomes something you can see for yourself, without having to trust our adjectives.

Games add a third thing: trade-offs. An ASN is an Autonomous System, roughly a stretch of network run by one organisation or individual. The docs say "spread the three hops across different ASNs" and you read past it. Pick three relays yourself, watch the circuit fail because all three landed in the same ASN, and you will remember the reason next time.

These pieces are an entry point, not a replacement for the documentation. They make the abstract concrete first, and each one offers the matching further reading when you finish.

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
            "image": "https://assets.anoni.net/games/onion-routing-en.png",
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
            "image": "https://assets.anoni.net/games/onion-rendezvous-en.png",
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
            "image": "https://assets.anoni.net/games/tor-network-en.png",
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
