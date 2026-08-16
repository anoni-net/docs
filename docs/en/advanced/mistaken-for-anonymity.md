---
title: Networks Mistaken for Anonymity
description: What encrypted DNS, IPFS, Yggdrasil, DN42, and I2P each solve, and what each leaves exposed. Their own documentation, set against Tor as the yardstick.
icon: material/incognito-off
---

# :material-incognito-off: Networks Mistaken for Anonymity

Changing the DNS resolver on your phone, publishing a site to IPFS, joining a volunteer-run overlay network: these get grouped together as ways to become harder to identify online. What they actually change about who can see what varies enormously. Some swap the observer from your telecommunications provider to a different company. Some remove no observer at all. IPFS additionally leaves a long-lived node identifier behind.

Yggdrasil's own FAQ has an entry titled "Is Yggdrasil anonymous?" and the first word of the answer is No[^ygg-faq]. The others do not say so as plainly, and the exposure is there either way. This page sets each project's stated design goals against what it leaves exposed, and ends with four questions you can apply to any tool.

Tor appears only as the yardstick. The full description is in [what is Tor](../tools/what-is-tor.md). To separate encryption from anonymity first, see [anonymity, privacy, pseudonymity, and confidentiality](../basics/anonymity-vs-privacy.md).

## Five systems, with Tor as the measure

| System | The problem it solves | Hides your IP | Hides what you are looking for | Anonymity is a design goal | Who still sees you |
|---|---|---|---|---|---|
| **Encrypted DNS** (DoH/DoT) | Domain queries not readable in transit | ❌ | Partly | ❌ | Your chosen resolver operator, your ISP |
| **IPFS** | Content addressing, takedown resistance | ❌ | ❌ | ❌ | Peers you exchange data with, anyone on the DHT |
| **Yggdrasil** | An encrypted IPv6 overlay network | ❌ | ❌ | ❌ | Direct peers, devices on the same local network |
| **DN42** | Experimenting with real routing technology | ❌ | ❌ | ❌ | Direct peers, any reader of the registry |
| **I2P** | Anonymous communication inside the network | ✅ | ✅ | ✅ | Your ISP sees that you are using I2P |
| **Tor** | Connection anonymity and circumvention | ✅ | ✅ | ✅ | Your ISP, the exit relay |

The real dividing line is the fifth column. The first four projects' own documentation does not list anonymity as a design goal. The last two do.

VPNs are not on this table, and their trade-offs have a page of their own in [VPN: risks and how to choose](../tools/vpn-guide.md). That page reaches the same conclusion this table does: what a VPN changes is who sees your traffic.

## Encrypted DNS changes who receives your queries

DNS queries travel in plaintext by default, so every device on the path reads each one. DoH (DNS over HTTPS, `RFC 8484`) wraps queries inside an ordinary HTTPS connection, and DoT (DNS over TLS, `RFC 7858`) uses TLS on a dedicated port. Both encrypt the segment between you and the resolver.

What encrypted DNS needs is a hostname or a URL, for example Cloudflare's DoT hostname `security.cloudflare-dns.com` or the DoH endpoint `https://security.cloudflare-dns.com/dns-query`[^cf-families]. This is the point people get wrong. Typing an IP address into a Wi-Fi setting or a router changes only which server answers you, while the query still goes out in plaintext on port 53 and anyone on the path still reads which domains you asked about. Actual encryption requires the operating system's or browser's encrypted DNS setting with a hostname in it, and the field differs considerably by platform.

The resolver receives every one of your queries and knows who asked. Switching from a carrier's resolver to a large public one changes whose hands those records land in. After the query is encrypted, the destination IP address is still in the packets, so whoever controls your line sees which server you connect to. The SNI field in the TLS handshake is also still there, and what SNI does and does not reveal is in [what metadata is](../basics/metadata.md). Which provider to choose and what each platform's field accepts is in [encrypted DNS: how to choose, and how to check it works](../tools/encrypted-dns.md).

### Filtering resolvers use the same mechanism as censorship, and they corrupt measurement

Alongside the unfiltered `1.1.1.1`, Cloudflare offers `1.1.1.2` (blocking malware) and `1.1.1.3` (also blocking adult content). The documentation states that domains judged malicious return `0.0.0.0` in place of the real address[^cf-families]. A device receiving that address connects to nothing, and the site looks unreachable.

Returning a false answer so the connection fails is exactly how DNS-layer censorship works. The technical action is identical, and what differs is who decides. You chose the filtering and can switch back to `1.1.1.1` at any time, and Cloudflare provides a channel for reporting false positives anonymously. The full blocklist and the classification method are not published, so you cannot know in advance which domains will be blocked.

Anyone running OONI Probe meets this difference directly. A filtering resolver returns `0.0.0.0` for blocked domains, which makes the measurement data look like local network interference when the source is the device's own configuration. How to tell them apart, and what to set before measuring, is in [encrypted DNS](../tools/encrypted-dns.md).

## IPFS is decentralized, and every query still carries your IP

How IPFS content addressing and the DHT (distributed hash table) work is covered in [decentralized website publishing](./dweb-ipfs-onion.md), written for publishers choosing how to host.

Running your own IPFS node exposes what the node has to announce. The metadata a node publishes to the DHT includes its peer identifier (PeerID) and the content identifiers (CIDs) it is providing, and the documentation states that both are public and that DHT queries happen on the public network, so third parties can monitor that traffic and determine which CIDs were requested, when, and by whom[^ipfs-privacy]. The same document notes that a single DHT lookup on your PeerID can reveal your IP address, particularly for a node running long-term from one location such as a home.

Most people who say they use IPFS run no node at all and simply open a public gateway URL. That situation has a different exposure profile: nothing about you appears on the DHT, and the gateway operator sees your IP address together with every CID you request. On the network you look like an ordinary HTTPS client, and the decentralized part has been traded back for a single operator.

Encryption is another gap. IPFS encrypts transport, and the content itself is unchanged, so anyone holding a CID can download and read it. The documented mitigations are disabling reproviding (the mechanism by which a node periodically re-announces what it holds), encrypting sensitive content yourself, or running a private IPFS network. Note that disabling reproviding only stops you announcing what you provide, while the DHT queries and peer connections you make while fetching still carry your IP address. To hand someone a file anonymously, [OnionShare](../tools/onionshare.md) is built for exactly that and is considerably safer than assembling it yourself on IPFS.

## Yggdrasil answers the question itself

Yggdrasil is an end-to-end encrypted IPv6 overlay network operating on top of the existing internet, with nodes peering over `tcp://` or `tls://`. Addresses sit in `0200::/7`, a range the IETF has deprecated, chosen to avoid collisions with existing addresses. Each node generates its own key pair, and its stable IPv6 address derives from that key with no central authority allocating anything[^ygg-about]. The addressing follows the same idea as Tor's v3 onion addresses, where the address itself carries verification material.

Communities use it to connect private networks in different locations, host internal services, and experiment with mesh networking. The purpose is connectivity.

On anonymity it goes a different way. The FAQ answers: "No, providing anonymity is not a goal of the Yggdrasil project. Your direct peers on the Internet can see your IP address, and may use this information to determine your location or identity", adding that peerings established automatically over multicast on the same local network typically expose your device's MAC address[^ygg-faq]. The project also labels itself alpha-stage software.

## DN42 publishes your registration by design

DN42 describes itself as a large dynamic VPN using internet technologies including BGP, whois databases, and DNS, for learning routing, connecting private networks, and running experiments, since a mistake inside it will not bring a major network operator to your door[^dn42-home].

Everything it uses comes from private ranges: `172.20.0.0/14` for IPv4, `fd00::/8` for IPv6, and autonomous system numbers between `4242420000` and `4242423999`. Joining means forking the official git registry, creating maintainer, contact, ASN, and network objects, signing them, and submitting a pull request[^dn42-start].

Anonymity runs in the opposite direction here. Registration requires a public contact object containing a name or handle and an email address, and the documentation's data privacy section states: "Please also note that the DN42 registry is a public resource, you must assume that any details provided will be made public and cannot be fully removed"[^dn42-start]. Peering is then negotiated one to one with named people, and it needs a router that stays on.

Not providing anonymity does not stop it being a good place to understand autonomous systems and BGP. The [interactive](../games/index.md) section of this site has a Tor routing puzzle built on spreading three hops across different ASNs, and the [ASN coverage](../regional/ooni-asn-coverage.md) analysis rests on the same unit. DN42 is one of the few places to hold an ASN of your own, announce routes, and watch routing decisions happen, where a misconfiguration reaches no real network.

## I2P is the one with anonymity in the design goals

I2P describes itself as an anonymous packet-switched network layer, scalable and self-organizing, on which applications concerned with anonymity or security can be built[^i2p-intro]. Its division of labour with Tor is stated directly: "I2P is not inherently an outproxy network", since data entering and leaving a mix network carries anonymity and security concerns, so the design concentrates on letting people finish what they are doing without leaving I2P. I2PTunnel still offers an optional outproxy, equivalent to a Tor exit relay, and by default nobody fills that role.

Tunnels in I2P are one-directional, outbound for sending and inbound for receiving, so each participant sees only half of any exchange. Messages use garlic routing, where one encrypted message can contain several complete messages with their own delivery instructions, so intermediate nodes cannot tell how many messages are inside or where they are going. The network database is held by routers called floodfills, which see who queried for which destination and not the message contents.

Even so, your ISP sees that you are using I2P, exactly as it sees Tor use. Both anonymize the content of a connection and who is talking to whom, without hiding that you are using the network. The difference is that Tor developed bridges and pluggable transports to address that, so using I2P in a blocking environment means first checking what currently works.

### Where the trade-offs differ from Tor

By I2P's own comparison, it optimizes for hidden services and peer-to-peer applications inside the network, while Tor optimizes for reaching ordinary websites through exit relays. I2P's ability to reach outward is limited and the project does not encourage it[^i2p-comparison]. One-directional tunnels make timing correlation harder, at the cost of more nodes per round trip than a Tor onion service circuit. The anonymity set differs too, and that comparison lists tens of thousands of active routers for I2P against millions of daily users for Tor. The number of people is itself part of the protection.

This page does not cover installation. Each project's own documentation is where to start.

## What this looks like across the region

The most common reason people in Taiwan change their DNS settings is resolution speed, or a domain that will not resolve on a carrier's resolver. Both are reasonable, and switching resolvers only helps against blocking at the DNS layer. Where the blocking happens at the IP or SNI layer, no resolver will connect you.

The picture changes across the region. In Mainland China, DNS tampering is one layer among several, so encrypted DNS alone changes little when IP blocking and TLS interference operate alongside it. In Hong Kong and Taiwan, where the network layer is largely unfiltered, the resolver question is closer to a privacy choice than a circumvention one. This is why the fourth question below matters more than the others: after installing this tool, who can still see you?

What DNS-layer protections you give up by switching, and how to configure a device before running OONI Probe, are in [encrypted DNS](../tools/encrypted-dns.md). The [ASN coverage](../regional/ooni-asn-coverage.md) work the community maintains depends on those measurements.

## Back to the threat model: four questions

Each column of the table above turns into a question you can ask of any tool claiming to protect privacy.

1. Can whoever I am communicating with still see my IP address (column three)
2. Can anyone tell what I am looking for and who I am connecting to (column four)
3. Does the project itself list anonymity as a design goal (column five)
4. After installing this, who can still see me (column six)

The third is the easiest to answer and the most often skipped, since a project's FAQ or design documentation usually says so outright, and both Yggdrasil and DN42 volunteer the warning. If the answer to either of the first two is yes, the tool addresses content or performance rather than identity. The answer people most often miss on the fourth is "one observer replaced another, and the count did not change." Run these four through [how to build a threat model](../basics/threat-model.md) and the answer falls out.

## Common questions

??? question "How do I know my DNS queries are actually encrypted?"

    Look at whether you entered a hostname or an IP address. Most platforms' ordinary DNS fields accept only an IP address, which means plaintext, with Windows the exception. What each platform's field accepts, whether it silently falls back to plaintext on failure, and how to test it afterwards are in [encrypted DNS](../tools/encrypted-dns.md).

??? question "Why isn't a VPN on the table?"

    Because it deserves a page of its own. The argument here applies to a VPN completely: what changes is who sees your traffic, moving from your carrier to the VPN provider. The full trade-offs, how to pick a service worth trusting, and when it is not enough are in [VPN: risks and how to choose](../tools/vpn-guide.md).

??? question "I only read IPFS through a public gateway. Is the exposure the same?"

    Different, and not better. Opening a gateway URL means you never join the DHT, so nothing about you appears there, at the cost of the gateway operator seeing your IP address together with every CID you request. Running your own node publishes information to many parties on the network. Using a gateway concentrates it in one company.

??? question "Does layering two of these help, for example running IPFS over Tor?"

    Do not assume it works. The difficulty is whether the underlying protocol bypasses the tunnel you think it is using, which is a known problem with IPFS transport and DHT: it looks wrapped, and traffic still takes the original path. To move a file anonymously, a tool built for it such as [OnionShare](../tools/onionshare.md) is more reliable than a combination you assembled.

## :material-chat-question: Related concepts

<div class="grid cards" markdown>

- [:material-incognito-circle: Anonymity, privacy, pseudonymity, and confidentiality](../basics/anonymity-vs-privacy.md)
- [:material-file-tree: What metadata is](../basics/metadata.md)
- [:material-radar: How platforms collect your data](../basics/platform-tracking.md)
- [:material-vpn: VPN: risks and how to choose](../tools/vpn-guide.md)

</div>

## :fontawesome-solid-diagram-project: Where to go next

<div class="grid cards" markdown>

- [:material-share-variant-outline: OnionShare](../tools/onionshare.md)
- [:material-chart-bar: ASN observation coverage](../regional/ooni-asn-coverage.md)
- [:material-shield-account-outline: Personal privacy guide](../community/privacy-guide.md)

</div>

[^ygg-faq]: [Yggdrasil Network FAQ](https://yggdrasil-network.github.io/faq.html){target="_blank"}, the "Is Yggdrasil anonymous?" entry.
[^ygg-about]: [About Yggdrasil](https://yggdrasil-network.github.io/about.html){target="_blank"}.
[^dn42-home]: [DN42 Home](https://dn42.dev/Home){target="_blank"}, the DN42 wiki.
[^dn42-start]: [DN42 Getting Started](https://dn42.dev/howto/Getting-Started){target="_blank"}, with the registry publicity warning in the data privacy section under Create person objects.
[^cf-families]: [1.1.1.1 Setup](https://developers.cloudflare.com/1.1.1.1/setup/){target="_blank"}, Cloudflare developer documentation, covering both the `0.0.0.0` behaviour and the DoH and DoT endpoints.
[^ipfs-privacy]: [Privacy and Encryption](https://docs.ipfs.tech/concepts/privacy-and-encryption/){target="_blank"}, IPFS documentation.
[^i2p-intro]: [Intro to I2P](https://i2p.net/en/docs/overview/intro){target="_blank"}.
[^i2p-comparison]: [I2P Compared to Tor](https://i2p.net/en/docs/overview/comparison){target="_blank"}, the source for the router and user figures.
