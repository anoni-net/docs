---
title: Networks Mistaken for Anonymity
description: What encrypted DNS, IPFS, Yggdrasil, DN42, and I2P each protect, who can still see you, and four questions for judging whether a tool makes you anonymous.
icon: material/incognito-off
---

# :material-incognito-off: Networks Mistaken for Anonymity

Changing the DNS setting on your phone, putting a website on IPFS, joining a volunteer-run network: these often get treated as the same kind of step, as if each one made you harder to recognize online. What they actually change varies a great deal. Some only move your browsing records from your telecom provider to a different company. Some remove no observer at all. IPFS also leaves behind a long-lived identifier that can be used to recognize you.

Encryption stops others reading the content. Anonymity stops others linking an activity to you as a person. They are different protections, and [anonymity, privacy, pseudonymity, and confidentiality](anonymity-vs-privacy.md) explains the difference. This page compares each project against the design goals written in its own documentation. Yggdrasil's FAQ has an entry titled "Is Yggdrasil anonymous?" and the first word of the answer is No[^ygg-faq]. The others do not say so outright, and the people who can see you are still there.

## Five systems compared with Tor

Tor sits in the last row as the point of comparison ([what is Tor](../tools/what-is-tor.md) explains how it works).

| System | What it is for | Hides your IP | Hides what you are looking for | Anonymity is a design goal | Who can still see you |
|---|---|---|---|---|---|
| **Encrypted DNS** (DoH/DoT) | Looking up domains without people on the path reading them | ❌ | Partly | ❌ | The DNS provider you chose, your internet provider |
| **IPFS** | Fetching files by their content, hard to take down | ❌ | ❌ | ❌ | Nodes you exchange data with, anyone querying the public index |
| **Yggdrasil** | An encrypted experimental network | ❌ | ❌ | ❌ | Nodes directly connected to you, devices on the same local network |
| **DN42** | Practising network routing | ❌ | ❌ | ❌ | Nodes directly connected to you, anyone reading the public registry |
| **I2P** | Anonymous communication inside the network | ✅ | ✅ | ✅ | Your internet provider can tell you are using I2P |
| **Tor** | Anonymous connections and getting around blocking | ✅ | ✅ | ✅ | Your internet provider, the exit relay |

The dividing line is the "Anonymity is a design goal" column. The documentation for the first four does not list anonymity as a design goal, and I2P and Tor do.

VPNs are not in the table because they have their own page, [VPN: risks and how to choose](../tools/vpn-guide.md). It reaches the same conclusion: a VPN only changes who can see your traffic.

## Encrypted DNS

Each time you open a website, your device first asks a DNS server (a resolver, which translates domain names into IP addresses) where that site is. By default the question is not encrypted, so the Wi-Fi operator, your telecom provider, and any equipment along the way can read which domains you looked up. Encrypted DNS encrypts the lookup between your device and the DNS server, usually through DoH (DNS over HTTPS) or DoT (DNS over TLS).

To turn it on, you enter a hostname or URL in the encrypted DNS setting of your operating system or browser, for example Cloudflare's `security.cloudflare-dns.com`[^cf-families]. Typing an IP address into a Wi-Fi setting or a router only changes which server answers you. The lookup is still unencrypted, and people on the path can still read which domains you asked about.

Once encrypted, the DNS provider still receives every lookup and knows who asked. Moving from your telecom provider to Cloudflare or Google changes who keeps those records. The IP address of the site you then connect to is not hidden either, so whoever provides your connection still knows which server you reached, and the SNI field at the start of the connection usually shows the site name as well (see [metadata, and why it matters](metadata.md)). Which provider to pick and how to set it up on each platform is in [how to choose encrypted DNS, and how to check it actually works](../tools/encrypted-dns.md).

### Filtering DNS services

Alongside the unfiltered `1.1.1.1`, Cloudflare offers `1.1.1.2` (blocking malware) and `1.1.1.3` (also blocking adult content). Domains judged malicious get `0.0.0.0` back instead of their real address[^cf-families], so the device connects to nothing and the site looks unreachable.

Returning a false answer so the connection fails is exactly how DNS-layer censorship works. The technique is the same, and what differs is who decides. You chose the filtering and can switch back to `1.1.1.1` at any time, but the full blocklist and how domains are classified are not published, so you cannot know in advance which domains will be blocked.

Keep this in mind if you run OONI Probe (an app that measures internet censorship). A domain blocked by a filtering DNS service looks like local network blocking in the measurement data, when the cause is your own device's setting. What to change before measuring is also in [the encrypted DNS guide](../tools/encrypted-dns.md).

## IPFS

IPFS finds files by an identifier (a CID) calculated from the file's content. Any node (a computer taking part in the network) that holds the file can serve it, with no single server to depend on, which makes content harder to take down. To find who holds a given CID, nodes query and announce through a shared public index called the DHT (distributed hash table). How a publisher chooses where to host is covered in [decentralized website publishing](https://anoni.net/en/articles/dweb-ipfs-onion/){target="_blank"} on the community site.

When you run your own IPFS node, it publishes its identifier (the PeerID) and the CIDs it provides to the DHT, and lookups happen on the public network. According to the IPFS documentation, this information is public, and third parties can monitor it to work out which CIDs were requested, when, and by whom[^ipfs-privacy]. The same document also covers how a single DHT lookup on your PeerID can reveal your IP address, particularly for a node that runs from one place, such as a home, for a long time.

Most people run no node and simply open a public gateway URL (a gateway turns IPFS content into an ordinary web page). Nothing about you appears on the DHT, and the gateway operator sees your IP address together with every CID you request. The decentralized part ends up back with a single operator.

IPFS encrypts only the transfer. The file itself is not encrypted, so anyone with the CID can download and read it. The documented mitigations are encrypting sensitive content yourself or running a private IPFS network, but the lookups and connections you make while downloading still carry your IP address. To hand someone a file anonymously, [OnionShare](../tools/onionshare.md) is built for that purpose and is far safer than assembling something yourself on IPFS.

## Yggdrasil

Yggdrasil is an encrypted experimental network running on top of the existing internet. Each node derives a fixed IPv6 address from a key it generates itself, and the network is mostly used to connect networks in different places[^ygg-about]. According to its FAQ, providing anonymity is not a goal of the project: nodes directly connected to you can see your IP address and may use it to work out your location or identity. Connections set up automatically on the same local network usually expose your device's MAC address (the hardware number of its network card)[^ygg-faq].

## DN42

DN42 is an experimental network where people practise network routing (BGP, for example, the protocol networks use to tell each other which addresses they can reach), and a misconfiguration inside it does not affect the real internet[^dn42-home]. Joining means entering a name or handle and an email address in a public registry, and the documentation carries a warning that you must assume anything you provide will be made public and cannot be fully removed[^dn42-start]. Participants also arrange connections one to one with other named members, so the design runs in the opposite direction from anonymity.

## I2P

I2P is the only system in the table besides Tor that lists anonymity as a design goal. It describes itself as an anonymous network layer that applications can be built on[^i2p-intro]. Traffic passes through several nodes in layers of encryption, each node sees only part of the exchange, and nodes in the middle cannot tell who is sending a message to whom. The design concentrates on services inside I2P itself. Reaching ordinary websites requires an exit (an outproxy) that someone else provides, and none is set by default.

Even so, your internet provider can tell that you are using I2P. Tor use is visible in the same way, and the difference is that Tor developed bridges and similar methods to hide it, so using I2P where networks are blocked means first checking what currently works.

### I2P and Tor trade-offs

By I2P's own comparison, I2P suits services and peer-to-peer applications inside its network, while Tor suits reaching ordinary websites through exit relays. I2P's ability to reach outside is limited, and the project does not encourage it[^i2p-comparison]. The same comparison shows the difference in size: tens of thousands of active routers for I2P against millions of daily users for Tor. The more people use a network, the harder it is to pick you out of the crowd, so the number of users is itself part of the protection.

This page does not cover installation. Each project's own documentation is the place to start.

## Regional context

The most common reason people in Taiwan change their DNS settings is faster lookups, or a domain that will not resolve on a telecom provider's DNS. Both are reasonable, but switching DNS only helps against blocking at the DNS layer. Where the blocking happens at the IP or SNI layer, no DNS provider will get you through.

The picture differs across the region. In Mainland China, DNS tampering is one layer among several, so encrypted DNS alone changes little when IP blocking and TLS interference operate alongside it. In Hong Kong, network-level filtering exists but is narrow: OONI has recorded a small number of sites blocked by DNS tampering across several operators, so a DNS change can matter for those sites while the broader pressure is legal. In Taiwan, the DNS-layer blocking that exists targets fraud domains through the response policy zone mechanism rather than political content, so choosing a DNS provider is closer to a privacy decision than a way around censorship.

What DNS-layer protections you give up by switching, and how to set up a device before running OONI Probe, are in [the encrypted DNS guide](../tools/encrypted-dns.md). The [ASN Diversity and Gaps in Taiwan's OONI Coverage](https://anoni.net/en/projects/asn-coverage/asn-diversity/){target="_blank"} work the community maintains depends on those measurements.

## Four questions for judging a tool

When a tool claims to protect your privacy, the columns of the table above become four questions:

1. Can whoever I am communicating with still see my IP address ("Hides your IP")
2. Can anyone tell what I am looking for and where I am connecting ("Hides what you are looking for")
3. Does the project itself list anonymity as a design goal ("Anonymity is a design goal")
4. After I start using this tool, who can still see me ("Who can still see you")

The third is the easiest to answer and the most often skipped. A project's FAQ or design documentation usually says so outright, and both Yggdrasil and DN42 volunteer the warning. If the answer to either of the first two is yes, the tool protects content or speed, and has nothing to do with your identity. The answer people most often miss on the fourth is that one observer replaced another and the count did not go down. Take these four through [threat modeling](threat-model.md) and you can decide whether a tool fits your situation.

## Common questions

??? question "How do I know my DNS queries are actually encrypted?"

    Check whether you entered a hostname or an IP address. Most platforms' ordinary DNS fields accept only an IP address, which means plaintext, with Windows the exception. What each platform's field accepts, whether it silently falls back to plaintext when encryption fails, and how to test it afterwards are in [the encrypted DNS guide](../tools/encrypted-dns.md).

??? question "Why isn't a VPN on the table?"

    VPNs have a page of their own, and the same test applies to them completely. With a VPN, the party that can see your traffic moves from your telecom provider to the VPN provider. How to pick a service worth trusting, and when a VPN is not enough, are in [VPN: risks and how to choose](../tools/vpn-guide.md).

??? question "I only read IPFS through a public gateway. Is the exposure the same?"

    Opening a gateway URL means you never join the DHT, so nothing about you appears there, at the cost of the gateway operator seeing your IP address together with every CID you request. Running your own node publishes information to many parties on the network, and using a gateway hands it all to one company. Neither makes you anonymous.

??? question "Does layering two of these help, for example running IPFS over Tor?"

    Layering is not necessarily safer, because the underlying protocol may bypass the tunnel you think it is using. IPFS transport and the DHT have this problem: everything appears to go through Tor, and some traffic still connects directly. To move a file anonymously, a tool built for it such as [OnionShare](../tools/onionshare.md) is more reliable than a combination you assembled.

## :material-chat-question: Related concepts

<div class="grid cards" markdown>

- [:material-incognito-circle: Anonymity, privacy, pseudonymity, and confidentiality](anonymity-vs-privacy.md)
- [:material-file-tree: Metadata, and why it matters](metadata.md)
- [:material-radar: How platforms collect your data](platform-tracking.md)
- [:material-vpn: VPN: risks and how to choose](../tools/vpn-guide.md)

</div>

## :fontawesome-solid-diagram-project: Where to go next

<div class="grid cards" markdown>

- [:material-share-variant-outline: OnionShare](../tools/onionshare.md)
- [:material-chart-bar: ASN observation coverage](https://anoni.net/en/projects/asn-coverage/asn-diversity/){target="_blank"}
- [:material-shield-account-outline: Personal privacy guide](https://anoni.net/en/join/privacy-guide/){target="_blank"}

</div>

[^ygg-faq]: [Yggdrasil Network FAQ](https://yggdrasil-network.github.io/faq.html){target="_blank"}, the "Is Yggdrasil anonymous?" entry.
[^ygg-about]: [About Yggdrasil](https://yggdrasil-network.github.io/about.html){target="_blank"}.
[^dn42-home]: [DN42 Home](https://dn42.dev/Home){target="_blank"}, the DN42 wiki.
[^dn42-start]: [DN42 Getting Started](https://dn42.dev/howto/Getting-Started){target="_blank"}, with the registry publicity warning in the data privacy section under Create person objects.
[^cf-families]: [1.1.1.1 Setup](https://developers.cloudflare.com/1.1.1.1/setup/){target="_blank"}, Cloudflare developer documentation, covering both the `0.0.0.0` behaviour and the DoH and DoT endpoints.
[^ipfs-privacy]: [Privacy and Encryption](https://docs.ipfs.tech/concepts/privacy-and-encryption/){target="_blank"}, IPFS documentation.
[^i2p-intro]: [Intro to I2P](https://i2p.net/en/docs/overview/intro){target="_blank"}.
[^i2p-comparison]: [I2P Compared to Tor](https://i2p.net/en/docs/overview/comparison){target="_blank"}, the source for the router and user figures.
