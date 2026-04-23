---
title: What is Tor?
description: Tor (The Onion Router) is an open-source anonymous communication network that protects users' privacy through multi-layer encryption and randomized routing, making it very difficult to track IP addresses or online behavior.
icon: material/chat-question
---

# :simple-torproject: What is Tor?

<figure markdown="span">
    <a target="_blank"
       href="../assets/images/tor_diagram.original.webp">
        <img src="../assets/images/tor_diagram.original.webp"
            alt="How Tor Relay Works"
            title="How Tor Relay Works"
        >
    </a>
    <caption>How Tor Relay Works</caption>
</figure>

[Tor (The Onion Router)](https://www.torproject.org/){target="_blank"} is an open-source anonymous communication network designed to protect users' privacy and freedom online. Tor anonymizes internet activity through multi-layer encryption and randomized routing — making surveillance and traffic analysis very difficult.

Each request travels through a randomly selected path of three relay nodes. At each node, one layer of encryption is peeled away (like an onion), and every node only knows its immediate neighbors — not the full path. This prevents any single point from seeing where traffic comes from and where it goes.

Tor also supports `.onion` services: addresses only reachable within the Tor network, adding another layer of anonymity for both operators and visitors.

## Relay Types

The Tor network relies on volunteer-operated servers called **relays**, which fall into three roles:

- **Guard Relay** — the first node a user connects to. It knows the user's real IP address but not the final destination.
- **Middle Relay** — sits between the guard and exit. It sees neither the origin nor the destination, only its two neighbors.
- **Exit Relay** — the last node before traffic leaves Tor and enters the public internet. It knows the destination but not the user's real IP.

## Bridge Nodes

In regions where access to Tor is blocked, users can connect through **bridges** — unlisted relays whose IP addresses are not published in the public Tor directory. Bridges are harder for censors to detect and block.

Bridges often use **Pluggable Transports** (such as obfs4, meek, or [Snowflake](https://snowflake.torproject.org/){target="_blank"}) to disguise Tor traffic as ordinary HTTPS or other traffic types, making detection even harder.

[:fontawesome-brands-tor-browser: Visit the Tor Project](https://www.torproject.org/){ .md-button target="_blank" }

## :material-chat-question: Learn Together

<div class="grid cards" markdown>

- [:material-chat-question: Why does Internet Freedom matter?](./internet-freedom-matter.md)
- [:simple-torproject: How to Set Up a Tor Relay](./setup-tor-relay.md)

</div>

## :fontawesome-solid-diagram-project: Next Steps

<div class="grid cards" markdown>

- [:material-access-point-network: ASNs Observation Data Analysis](./ooni-asns-coverage.md)
- [:material-list-status: OONI Website Testing List](./ooni-weblists.md)
- [:material-translate-variant: L10n and Documentation Translation](./ooni-i18n.md)

</div>
