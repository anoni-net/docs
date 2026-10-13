---
title: Run a Node
description: Step-by-step guides to running a Tor relay, a WebTunnel bridge and an onion service, a proposal kit, SOP and FAQ for running a Tor relay on campus, and how to pin a copy of the docs site's IPFS mirror.
icon: material/hammer-wrench
---

# :material-hammer-wrench: Run a Node

Every Tor relay or bridge gives users in censored places one more way into Tor, and an onion service lets readers reach your site without leaving the Tor network. Each guide runs from installation through to operating the service once it is live.

## Tor nodes and onion services

- [Tor Relay Setup Guide](https://anoni.net/en/join/setup-tor-relay/){target="_blank"}: installing and running a middle relay, with an FAQ on legal risk, home networks and bandwidth.
- [Tor WebTunnel Bridge Setup Guide](https://anoni.net/en/join/setup-tor-webtunnel/){target="_blank"}: disguising Tor traffic as ordinary HTTPS, from VPS, domain and TLS through nginx and Docker.
- [Onion Service Setup Guide](https://anoni.net/en/join/setup-onion-service/){target="_blank"}: a v3 onion service set up the way the Tor Project documents it, routed through nginx with subdomains.

## Tor relays on campus

Running a relay at a university takes more time talking to the IT centre and legal office than it does on the technical work. These three pages come from a campus relay that is already running, and can be used in order.

- [Campus Tor Relay Proposal Template](../community/campus-tor-relay-proposal.md): a proposal document, four communication emails and an administrative timeline.
- [Campus Tor Relay Deployment SOP](../community/campus-tor-relay-sop.md): torrc, firewall rules, monitoring and an incident runbook.
- [Campus Tor Relay, an FAQ for university administrators and legal counsel](../community/campus-relay-faq.md): the ten concerns raised most often, with suggested responses.

## Mirroring the docs site

- [Pinning the Docs Site's IPFS Mirror](https://anoni.net/en/join/pin-ipfs-mirror/){target="_blank"}: one always-on IPFS node and a scheduled script that keep another copy of the docs site.
