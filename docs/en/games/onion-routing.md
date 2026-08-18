---
title: Tor Routing Puzzle
description: A hands-on puzzle. Pick 3 relays to form Tor's guard, middle and exit path, avoid surveilled nodes, spread the 3 hops across different ASNs, and switch to bridges when blocked. Each of the four levels maps to a real path-selection constraint.
icon: material/shuffle-variant
social:
  cards: false
og:
  enabled: true
  image: https://assets.anoni.net/games/onion-routing-en.png
  image_width: 2560
  image_height: 1440
---

# :material-shuffle-variant: Tor Routing Puzzle

![The opening board of the Tor Routing Puzzle, with the sender on the left, the recipient on the right, and five differently coloured relays floating in between](https://assets.anoni.net/games/onion-routing-board-en.webp){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

Send a message from you on the left to the recipient on the right, choosing 3 relays to form the path. Each of the four levels blocks you once, and what it blocks is a constraint Tor genuinely has to handle when it selects a path.

<a href="../../games/onion-routing/play/index.html?lang=en" class="md-button md-button--primary">:octicons-arrow-right-24: Play</a>

## How it works

The floating spheres are relays, coloured by the ASN they sit in. Click three in order and they become the guard, middle and exit hops in that order; click one again to deselect it. Drag to rotate the view, scroll or pinch to zoom. Press "Send message" and the message travels along the path you drew.

![Three hops selected, with a curve running from the sender through three relays to the recipient, and the slots below reading Taiwan AS3462, Japan AS2914 and Netherlands AS16276](https://assets.anoni.net/games/onion-routing-path-en.webp){style="border-radius: 10px;"}

The three slots at the bottom show where each hop lands and which ASN it belongs to. All three must be filled before the message can go, and a path that breaks the rules is stopped with an explanation.

## What the four levels teach

### Level 1: three hops, the basics

Any 3 relays are valid, so this level is about getting used to the controls. Tor's default circuit length is exactly 3 hops, a number that balances anonymity against latency: one hop fewer removes a layer of separation between entry and exit, one hop more adds latency without a proportional gain in anonymity.

### Level 2: avoid surveilled relays

Red relays appear on the board, marking ones known to be watched. Pick a path that avoids them entirely. Real Tor has no such explicit marking — directory authorities only flag relays that misbehave or are known to be harmful, and an ordinary user cannot see who is watching a given relay. This level puts that information on screen to build the intuition that every stop on the path sees a piece of the picture.

### Level 3: spread the hops across ASNs

![All three hops picked from Taiwan, with all three slots reading Taiwan AS3462 and a red message below explaining that the hops are not spread across three different ASNs](https://assets.anoni.net/games/onion-routing-asn-en.webp){style="border-radius: 10px;"}

Matching colours mean the same ASN. An ASN (Autonomous System) can be read loosely as a stretch of network under one organisation or person. If all three hops land in the same ASN, an adversary watching that one ASN sees both entry and exit traffic at once, and the stops in between stop mattering.

Documentation says "spread the three hops across different ASNs" and it reads straight past you. Pick a path once, get blocked once, and the reason sticks. Real Tor clients also avoid relays in the same `/16` and the same family by default, so the actual test is stricter than this level.

### Level 4: use a bridge when blocked

![The level 4 board, with two relays ringed in red to mark them as blocked and two diamond-shaped bridge nodes on the left](https://assets.anoni.net/games/onion-routing-bridge-en.webp){style="border-radius: 10px;"}

Direct entry is blocked, marked with red rings, and the first hop has to be one of the diamond-shaped bridge nodes. Bridges are entry points that are not published in the directory, so whoever is doing the blocking cannot get a complete list and cannot block them cleanly. The two bridges on the board are labelled Snowflake and obfs4, two pluggable transports that differ in what the traffic is disguised as.

## How it differs from real Tor

This is a puzzle rather than a simulator. The deliberate simplifications:

- Real path selection is automatic and users never pick relays one by one. A guard is also kept for months at a time, which reduces the exposure that comes from constantly changing entry points
- A level holds five to eight relays; the real network has nearly ten thousand
- Relay bandwidth and consensus weight affect selection probability, which is not modelled here
- Surveillance is explicitly marked on screen, and no such signal exists in practice

All three language versions share one program. The language is set by a URL parameter and can also be switched inside the work.

## Further reading

- How Tor actually works: [What is Tor?](../tools/what-is-tor.md)
- Anonymity and what it does not cover: [Anonymity vs privacy](../basics/anonymity-vs-privacy.md)
- Running a relay and watching the network: [Tor relay watcher](../regional/tor-relay-watcher.md)
- Getting through when Tor is blocked: [Tor Snowflake bridges](../tools/tor-snowflake.md)
- The other two works: [Interactive](index.md)

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "VideoGame",
      "@id": "https://anoni.net/docs/games/onion-routing/#work",
      "name": "Tor Routing Puzzle",
      "alternateName": ["Tor 路由解謎", "Tor 路由解谜"],
      "url": "https://anoni.net/docs/games/onion-routing/play/?lang=en",
      "mainEntityOfPage": "https://anoni.net/docs/en/games/onion-routing/",
      "description": "A hands-on puzzle. Pick 3 relays to form Tor's guard, middle and exit path, avoid surveilled nodes, spread the 3 hops across different ASNs, and switch to bridges when blocked. Each of the four levels maps to a real path-selection constraint.",
      "image": "https://assets.anoni.net/games/onion-routing-en.png",
      "inLanguage": ["en", "zh-Hant", "zh-Hans"],
      "genre": ["Puzzle", "Educational"],
      "applicationCategory": "GameApplication",
      "gamePlatform": "Web browser",
      "playMode": "SinglePlayer",
      "browserRequirements": "A browser with WebGPU or WebGL2 support, no installation needed",
      "isAccessibleForFree": true,
      "isFamilyFriendly": true,
      "license": "https://github.com/anoni-net/docs/blob/main/LICENSE",
      "author": { "@id": "https://anoni.net/#organization" },
      "publisher": { "@id": "https://anoni.net/#organization" },
      "isPartOf": { "@id": "https://anoni.net/docs/games/#collection" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Docs", "item": "https://anoni.net/docs/en/" },
        { "@type": "ListItem", "position": 2, "name": "Interactive", "item": "https://anoni.net/docs/en/games/" },
        { "@type": "ListItem", "position": 3, "name": "Tor Routing Puzzle" }
      ]
    }
  ]
}
</script>
