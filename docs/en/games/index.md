---
title: Interactive
description: Small 3D pieces you can play with, or just watch data move. All three current works revolve around Tor - a puzzle that walks you through three-hop onion routing, a live view of traffic meeting at rendezvous points, and the real-world distribution of nearly ten thousand relays.
icon: material/cube-outline
---

# :material-cube-outline: Interactive

This section holds small 3D pieces you can play with, or simply watch. They turn concepts from privacy and anonymity technology into something you can see and click. Everything runs in the browser with three.js (WebGPU/TSL), no install needed, and works on desktop and phone. All three current works revolve around Tor, with other privacy topics to follow.

## Why build them as visuals

The protection in privacy technology often lives in the sequence of events. Take Tor: a packet moves through three relays, shedding one layer of encryption at each hop, and two circuits meet at some relay in the middle before any content is exchanged. The order things happen in is the point. However carefully the text is written, a reader still has to animate that part in their own head. These pieces animate it for you.

Using a tool well is usually a chain of trade-offs, and reading about one differs from making it. The docs say "spread the three hops across different ASNs" and you read past it. Pick three relays yourself, watch the circuit fail because all three landed in the same ASN, and you will remember why next time.

Numbers alone also fail to convey scale. "Nearly ten thousand relays, heavily concentrated in a handful of countries" is one sentence. Plot every single one onto a globe, watch North America and Western Europe light up while everywhere else shows a scattering of dots, and the concentration becomes something you can see.

These pieces are not here to replace the documentation. They are an entry point: make the concept concrete first, then follow the links back to read the details.

## The works

The pieces themselves have a Traditional Chinese interface. All three language editions share one copy of the program.

<div class="grid cards" markdown>

-   :material-shuffle-variant:{ .lg .middle } __Tor Routing Puzzle__

    ---

    Hands-on puzzle. Get a message from you to a recipient across the water by picking 3 relays to form Tor's guard → middle → exit path, avoiding surveilled nodes, spreading the hops across different ASNs, and switching to bridges when blocked.

    <a href="../../games/onion-routing/index.html" class="md-button md-button--primary">:octicons-arrow-right-24: Play</a>

-   :material-lan:{ .lg .middle } __Tor Traffic Flow__

    ---

    A view to watch. Glowing particles and afterimages show the two shapes Tor traffic takes: connections to .onion services meet at a random rendezvous point, while connections to the clear web run out through a 3-hop exit and return the same way. Relay count, circuit count, hostile nodes and traffic volume are all adjustable live.

    <a href="../../games/onion-rendezvous/index.html" class="md-button md-button--primary">:octicons-arrow-right-24: Watch</a>

-   :material-earth:{ .lg .middle } __Tor Relay Globe__

    ---

    Real data. Nearly ten thousand running Tor relays scattered across their own national borders, coloured by guard, middle and exit, sized by bandwidth, with each country's landmass lit according to how many relays it hosts. Every country with relays is labelled with its code and count, making the concentration obvious at a glance. Data from Onionoo.

    <a href="../../games/tor-network/index.html" class="md-button md-button--primary">:octicons-arrow-right-24: Explore</a>

</div>

## Prefer to read first

These pages cover concepts that show up in the current works.

- Anonymity and what it does not cover: [Anonymity vs privacy](../basics/anonymity-vs-privacy.md)
- Running a relay and watching the network: [Tor relay watcher](../regional/tor-relay-watcher.md)
- Getting through when Tor is blocked: [Set up a Tor WebTunnel bridge](../community/setup-tor-webtunnel.md)

## What comes next

These are the first three pieces, all focused on Tor. Plenty of other privacy topics deserve the same treatment: what metadata gives away, how a threat model shifts with your situation, what the money trail behind anonymous payments looks like. All of them are on the list. If you have an idea or want to build one with us, come find us in the [community](../community/index.md).
