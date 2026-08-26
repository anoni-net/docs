---
title: How you are reading this
description: The site is published three ways at once — as a standard website, a Tor onion service, and an IPFS mirror. The content is identical; the path it takes to reach you, and who can see what along the way, are not.
icon: material/routes
---

# :material-routes: How you are reading this

The site is published three times over, with identical content. What differs is how that content reaches you and who can see what along the way. The chip in the top right of the header tells you which edition you are on; the standard site carries no chip.

## The three editions side by side

| | Standard site | Onion | IPFS mirror |
|---|---|---|---|
| Address | `anoni.net/docs` | `docs.…onion` | `ipfs.anoni.net` or another gateway |
| Who sees your IP address | our CDN and host | nobody | the gateway operator you connect to |
| Who knows which pages you read | same as above | nobody | same as above |
| What your ISP sees | that you reached anoni.net | that you are using Tor | that you reached that gateway |
| If the site is taken down | unreachable | unaffected | unaffected |
| What you need | an ordinary browser | Tor Browser | an ordinary browser |
| Offline reading | available | not offered | not offered |
| Traffic analytics | yes | no | no |

## Standard site

An ordinary connection to `anoni.net`. Fastest, most complete, and the only edition that offers [offline reading](../offline.md).

The cost is that our CDN and host see your IP address, and the site keeps traffic statistics that do not record personal identity. When the domain is blocked or taken down, this edition becomes unreachable.

## Onion

The site runs inside the Tor network. Visitor and site cannot see each other's IP addresses, no DNS is involved, and there is no certificate authority. Your ISP sees that you are using Tor and nothing about which site you reached or which page you read.

An `.onion` address carries no certificate authority endorsement, so checking the address itself is the only verification available. The full address is printed in the footer of every page: compare it against your address bar, and if they match you are on our site. That habit is worth forming, because look-alike phishing addresses are a real technique.

This edition loads no analytics and registers no background Service Worker, which is why offline reading is absent. Latency is higher than the standard site, as it is for Tor generally.

## IPFS mirror

Content is addressed by fingerprint (CID), so any node can serve the same copy and there is no single location to take down. Community members can help keep a copy alive, described in [pin the IPFS mirror](../community/pin-ipfs-mirror.md).

Note that reading over IPFS does not make the connection anonymous. You are using an ordinary browser to reach a gateway, that gateway sees your IP address and every address you request, and on the network you look like an ordinary HTTPS client. To get takedown resistance and connection anonymity together, open the onion edition in Tor Browser.

The full exposure picture is in [networks mistaken for anonymity](../advanced/mistaken-for-anonymity.md), and the publisher-side trade-offs are in [decentralized website publishing](../advanced/dweb-ipfs-onion.md).

## Which one to use

For everyday reading, the standard site is fine.

When it matters that the connection stays unseen, or you are on a network that is monitored, use the onion edition.

When the standard site is unreachable and Tor Browser is not at hand, the IPFS mirror gets you the content. Do not treat it as an anonymity measure.

## :fontawesome-solid-diagram-project: Related reading

<div class="grid cards" markdown>

- [:material-web-box: Decentralized website publishing](../advanced/dweb-ipfs-onion.md)
- [:material-incognito: Networks mistaken for anonymity](../advanced/mistaken-for-anonymity.md)
- [:simple-ipfs: Pin the IPFS mirror](../community/pin-ipfs-mirror.md)
- [:material-download: Offline reading](../offline.md)

</div>
