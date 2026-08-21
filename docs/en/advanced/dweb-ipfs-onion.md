---
title: Decentralized Website Publishing
description: The space between self-hosting, CDNs, IPFS, and onion services. Content addressing against connection anonymity, and how this documentation site actually deploys to all three.
icon: material/web-box
---

# :material-web-box: Decentralized Website Publishing

How to publish a website has acquired several new answers over the past decade. Beyond a self-hosted server with DNS, a CDN caches content to edge nodes worldwide, IPFS uses content addressing to move files between nodes, and Tor onion services let a site operate directly on the Tor network under a `.onion` address. The last two get discussed together and answer different questions: IPFS is about resisting deletion and takedown, onion services are about connection anonymity and reaching past blocking. This page sets out the design differences, the combinations that work in practice, and this site's own deployment as a worked example.

## The space of options

Publishing options form a spectrum from centralized and fast to decentralized and censorship-resistant:

- **Self-hosted**: your own IP address and DNS. Entirely under your control and entirely concentrated. A blocked IP address or a seized server takes the site offline
- **CDN** (Cloudflare, Fastly, CloudFront): edge nodes proxy the traffic. Strong performance and DDoS resistance, with heavy dependence on the CDN provider and on root DNS
- **Static hosting** (GitHub Pages, Cloudflare Pages, Netlify): simple deployment, and the provider can remove you unilaterally
- **IPFS**: content addressed by hash, so in principle any node can serve it. No single point to take down, and survival depends on pinning
- **Onion services**: the site runs on the Tor network with no public IP address and no DNS. Connection anonymity and resistance to IP blocking, at the cost of performance and reach

Real deployments usually mix them: a CDN for the main site's performance, an IPFS mirror against deletion, an onion mirror against blocking.

## What IPFS is built on

The core of IPFS is content addressing.

- **CID (content identifier)**: each file hashes to a fingerprint, and that hash is its address. Identical content produces an identical CID on every node
- **DHT (distributed hash table)**: nodes ask each other who holds a given CID, locating it through the Kademlia algorithm with no central registry
- **IPNS (InterPlanetary Name System)**: maps a mutable name to a current CID, so updating content changes the CID and the IPNS record follows

What that means for publishing:

1. **No single place to take down**: as long as some node pins the CID, the content survives
2. **Tampering is detectable**: the CID is a hash, so any modification changes it
3. **Reuse across nodes**: one file referenced by many sites has one CID and a shared cache

The limits:

- **Survival depends on pinning**: content nobody pins disappears in garbage collection. Putting something on IPFS is not the same as preserving it
- **DHT lookup latency**: first retrieval is slower than HTTP
- **Gateway dependence**: most people read through a public gateway, and a blocked gateway means no access
- **Dynamic content**: IPFS suits static sites, and anything dynamic needs another layer

## What onion services are built on

Tor onion services, version 3, put a site on the Tor network directly:

- **Self-describing addresses**: a v3 `.onion` address, 56 characters, is the service's ed25519 public key, requiring no DNS and no certificate authority. Removing DNS removes one place where name resolution can be intercepted or altered[^1]
- **Descriptor publishing**: the service publishes its location descriptor through hidden service directories
- **Rendezvous protocol**: user and service establish an encrypted connection through a rendezvous point inside the Tor network, with neither learning the other's IP address

What that means for publishing:

1. **Full connection anonymity**: the visitor's IP address is invisible to the site, and the site's IP address is invisible to the visitor
2. **No DNS dependence**: the address verifies itself, with no certificate authority trust chain
3. **Resistant to IP blocking**: traffic stays inside Tor, so blocking an address achieves nothing
4. **No public IPv4 needed**: it runs from behind NAT or on a dynamic address

The limits:

- **Performance**: an onion connection is three hops from the client and three from the service, six nodes plus the rendezvous mechanism, so latency is higher than a direct connection
- **Tor dependence**: heavy blocking of Tor relays affects the whole `.onion` ecosystem
- **Poor fit for heavy static assets**: images and video over Tor are expensive
- **Visitor barrier**: visitors need Tor Browser or an onion-aware client

## They solve different problems

<figure markdown="span">
    <img class="brand-frame" src="../../assets/images/ipfs-vs-onion.drawio.svg" alt="IPFS and onion architectures compared. IPFS goes gateway to DHT to peer, addressing deletion resistance. Onion goes guard to middle to rendezvous to hidden service directory to service, addressing connection anonymity">
</figure>

| Dimension | IPFS | Onion |
|---|---|---|
| The problem it solves | Deletion resistance, no central point of failure | Connection anonymity, resistance to IP blocking |
| Visitor anonymity | ❌ none built in | ✅ by default |
| Service anonymity | ❌ node IP visible | ✅ by default |
| Tamper detection | ✅ through the CID hash | Provided separately through TLS or signatures |
| Takedown resistance | ✅ through multiple pins | Partial, since a single service can be shut down by its operator |
| Large file performance | Moderate | Poor |
| Dynamic content | Difficult | Comparable to an ordinary site |
| Visitor barrier | Low, through a browser gateway | High, requires Tor Browser |

For deletion resistance, IPFS. For connection anonymity, onion. For both, mirror the same site to each.

## Known limits and risks

Before picking a combination, two places where the decentralization promise does not fully hold:

- **IPFS provides no connection anonymity at all**: The PeerID is long-lived, DHT lookups happen on the public network, and third parties can see which IP address is looking for which CID. This page is about how a publisher chooses to host. The full exposure analysis is in [networks mistaken for anonymity](./mistaken-for-anonymity.md)
- **IPFS content survives only while pinned**: Centralized pinning services, or decentralized storage protocols requiring token incentives, both put "permanent" back in the hands of a third party
- **Onion services depend on Tor**: Heavy blocking of relays, or the Tor Project ceasing operation, would affect the whole ecosystem
- **The entry points are mostly still centralized services**: People arrive through a public gateway or Tor Browser, and those entry points are themselves attack surface
- **Legal grey areas**: Running a Tor exit node or offering IPFS pinning carries different risk in different jurisdictions

## Combinations that work

### Onion plus IPFS mirroring

Publish the main site to the ordinary web, and alongside it:

- **An IPFS mirror**, with a CID for each release that community volunteers can pin. The instructions are in [pinning the documentation site's IPFS mirror](../community/pin-ipfs-mirror.md)
- **An onion mirror**, carrying the same content and offering anonymous access

EFF and Proton run official onion mirrors, and the New York Times ran one until closing it in March 2025[^2]. Cloudflare also offers onion routing, where a site behind Cloudflare can have Tor Browser visitors routed to a Cloudflare `.onion` endpoint rather than through an exit relay[^3].

### IPFS plus a naming layer

IPFS content can be given a memorable name through a blockchain naming system, with the record pointing at the current CID and updated on each release. The dependency moves to that chain, and the names generally cost money, so this is not decentralization without conditions.

## How this site deploys

The anoni.net documentation site is itself an IPFS and onion mirroring case.

<figure markdown="span">
    <img class="brand-frame" src="../../assets/images/anoni-deployment.drawio.svg" alt="Three-track deployment of the anoni.net documentation site: one GitHub repository, three build scripts handling path differences, deploying to the main site, the IPFS network, and a .onion hidden service">
</figure>

1. **Source**: markdown written for MkDocs Material, in a GitHub repository
2. **Main build**: `build_docs_anoni.sh` generates the zh-TW, zh-CN, and English sites and publishes them to anoni.net
3. **IPFS build**: `build_docs_anoni_ipfs.sh` adjusts the same content to IPFS-friendly relative paths and pins it
4. **Onion build**: `build_docs_anoni_onion.sh` adjusts paths for the `.onion` domain and deploys to the hidden service

The operational trade-offs:

- **Pinning and survival**: community members can pin to improve the odds ([instructions](../community/pin-ipfs-mirror.md)), and there is no guarantee from us
- **Onion latency**: Tor's latency makes single-page applications and heavy JavaScript unpleasant, which is why the site stays static with minimal JavaScript
- **Three domains, one trust story**: search engines index the main site, with IPFS and onion as the redundancy and anti-blocking layers

What actually goes wrong:

- Public IPFS gateways are sometimes unstable, which affects first visits
- The onion mirror updates a step behind the main site, since its deployment is heavier
- Three language sites multiply the CID count on IPFS, and the pin list grows accordingly

For the design of the Tor network itself, see [what is Tor](../tools/what-is-tor.md). InterSecLab's analysis of the leak from China's censorship infrastructure, which the [curated reports](../reports/index.md) index links, shows what centralized censorship infrastructure looks like as the adversary these strategies are built against.

## :material-chat-question: Related concepts

<div class="grid cards" markdown>

- [:material-chat-question: What is Tor](../tools/what-is-tor.md)
- [:material-snowflake: Tor Snowflake](../tools/tor-snowflake.md)
- [:material-key-chain-variant: How end-to-end encryption works](./e2ee.md)
- [:material-atom-variant: Post-quantum cryptography](./post-quantum.md)

</div>

## :fontawesome-solid-diagram-project: Where to go next

<div class="grid cards" markdown>

- [:simple-ipfs: Pin the documentation site's IPFS mirror](../community/pin-ipfs-mirror.md)
- [:material-server-network: How to run a Tor relay](../community/setup-tor-relay.md)
- [:material-school-outline: Tor relays on campus](../community/relay-on-campus.md)
- [:material-translate-variant: Localization and translation](../community/i18n.md)

</div>

[^1]: [V3 onion services usage](https://blog.torproject.org/v3-onion-services-usage/){target="_blank"}, The Tor Project
[^2]: [EFF Now Has Tor Onions](https://www.eff.org/deeplinks/2023/04/eff-now-has-tor-onions){target="_blank"}, Electronic Frontier Foundation
[^3]: [Onion Routing](https://developers.cloudflare.com/network/onion-routing/){target="_blank"}, Cloudflare
