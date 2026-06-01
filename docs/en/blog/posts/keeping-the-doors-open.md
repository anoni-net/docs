---
date: 2026-06-01
authors:
    - toomore
categories:
    - News
    - Tor
    - Translated Article
slug: keeping-the-doors-open
image: "assets/images/tor.webp"
summary: "Unredacted runs 300+ servers powering FreeSocks, Tor bridges, Snowflake and more, and keeps 123 Tor exit relays running on roughly 400W. Set against the 12 Tor relays the anoni.net community currently observes in Taiwan (3 of them exits), regions with free outbound connectivity are well placed to host more circumvention infrastructure for the censored."
description: "Unredacted runs 300+ servers and 123 Tor exit relays on roughly 400W. Set against Taiwan's 12 observed relays, free-connectivity regions are well placed to host more circumvention infrastructure for the censored."
---

# How Unredacted Helps People in Censored Regions Reach the Open Internet

!!! info ""

    This post is based on a guest post on the Tor Blog by Unredacted, with an anoni.net community perspective added for Taiwan and the wider Sinophone region.

    - [Keeping the doors open, Tor Blog, by Unredacted.org, 2026-05-15](https://blog.torproject.org/keeping-the-doors-open-unredacted/){target="_blank"}

![Keeping the doors open](assets/images/tor.webp){style="border-radius: 10px;"}

[Unredacted](https://unredacted.org/){target="_blank"} is a US-based 501(c)(3) non-profit that runs a network of 300+ servers to keep people in heavily censored places connected to the open internet. Their guest post is part of the Tor Blog's spotlight series on organizations defending the free internet, and it opens with a line from a user in China: "You have helped many many people to overcome the great firewall." That kind of message is rare, because people living under censorship usually have no safe channel to send one.

This post highlights what Unredacted builds, and what it looks like from where the anoni.net community sits, in Taiwan.

<!-- more -->

## What Unredacted runs

**Unredacted Door** is their umbrella for circumvention services: FreeSocks proxies, messaging proxies for Signal and Telegram, Tor bridges, and Snowflake. Over a recent 30-day window these carried nearly 300 TiB for tens of thousands of people routing around censorship. The largest piece, FreeSocks, is built to look unremarkable on the wire, the opposite of a standard VPN that advertises itself through a known endpoint and handshake. FreeSocks v2 leans on **Xray** to make proxy traffic resemble ordinary HTTPS, paired with an open-source control plane that rotates endpoints automatically when a server gets blocked.

!!! note "What is Xray"

    Xray is a traffic-routing and obfuscation tool descended from the V2Ray project, widely used in heavily censored places like China and Iran. Protocols such as VLESS, Trojan, and Reality disguise proxy traffic as ordinary HTTPS / TLS, smoothing over the handshake and packet shapes a VPN gives away at a glance. See the [Xray-core project](https://github.com/XTLS/Xray-core){target="_blank"}.

**GreenWare** is their effort to run real relay capacity on low-power hardware. Instead of datacenter servers that draw power like a space heater, they run Tor exits on PoE-powered Raspberry Pi 5 boards and a 1U chassis of 20 ComputeBlade modules. As of their writing, all 123 of their Tor exit relays run on this combined setup, drawing roughly 400W in total, about what a few old incandescent bulbs burn. Lower cost and power per exit means more people can take on the hardest, most legally exposed part of running Tor.

## From the anoni.net community: a Taiwan vantage point

anoni.net is an anonymity-network community based in Taiwan, and that is the vantage point these notes are written from. Taiwan's network environment is relatively free: no Great Firewall, no mandatory VPN registration, no state censorship orders to ISPs. That is exactly why a place like Taiwan, with free outbound connectivity, is well positioned to host Tor relays and bridges and carry a share of the circumvention work. The people this infrastructure serves are in heavily censored places like mainland China and Iran. Other regions with equally free connectivity, like Singapore, Malaysia, and wherever the diaspora lives, are just as suitable as hosting locations.

The anoni.net community tracks the number and distribution of Tor relays in Taiwan through [Pulse live monitoring](https://api.anoni.net/api/readme){target="_blank"}. As of 2026-05-31, Onionoo (the Tor Project's relay data service) sees 12 running relays inside Taiwan, of which only 3 carry the Exit flag (initramfs, GuruKopi, jerryrelay). Set against Unredacted, a single organization running 123 exit relays and carrying nearly 300 TiB over 30 days, Taiwan's nationwide exit capacity is under 3% of theirs. We keep this number current on the [Tor Relays watch page](../../regional/tor-relay-watcher.md) and pair it with OONI's censorship observations for Taiwan and nearby regions.

For the Sinophone world, demand for circumvention has grown since 2020 across Hong Kong, Macau, and Mandarin-speaking communities in Southeast Asia, while circumvention resources written in Chinese remain comparatively scarce. Part of anoni.net's work is filling that gap with Chinese-language documentation, walking the same path as Unredacted Education.

## From the anoni.net community: GreenWare's feasibility for free-connectivity regions

Unredacted running 123 exit relays on 400W makes for friendly operating economics. At a typical Taiwan commercial electricity rate of roughly NT$3.5–6 per kWh (about US$0.11–0.19), 400W running year-round is about 3,500 kWh, or roughly NT$12,000–21,000 a year (about US$400–700).[^1] That is an affordable line item for a campus IT center or a community workspace. Readers elsewhere can convert their local rate; the order of magnitude usually lands in the same range.

The key is designing the hardware to scale. Raspberry Pi 5 is familiar to maker communities everywhere, and PoE+ HATs and PoE switches are easy to buy through ordinary electronics retail. ComputeBlade (the 20-module 1U chassis) has fewer retail channels and is usually obtained through official overseas ordering or a community group buy. An institutional server room suits this better than a home network, for three reasons: a static IP, institutional bandwidth, and someone on site to check the machines.

Campus Tor relays are one of anoni.net's three focus areas for 2026, and the community is collecting field experience into a setup playbook ([Campus Tor Relay research track](https://anoni.net/docs/community/relay-on-campus/){target="_blank"}, a zh-TW page with the English version pending, plus the writeup [Setting up a Tor relay at NTNU](ntnu-nz.md)). Unredacted's engineering approach with GreenWare is a useful reference point for the next school weighing a deployment: start with a single PoE-powered Raspberry Pi 5 middle relay, and once it runs stably, consider exits and chassis density.

For an individual or a small group, running a Snowflake proxy (a browser extension or Docker) carries almost no electricity cost and is the lowest-barrier entry into circumvention infrastructure (see [Snowflake](https://snowflake.torproject.org/){target="_blank"}).

## What you can do

If Unredacted's work makes you want to help people in censored regions reach the open internet, here are a few entry points:

- **Learn about Unredacted**: visit [unredacted.org](https://unredacted.org/){target="_blank"} for their services and transparency information, then decide whether to support their servers, bandwidth, and staffing through their official channels.
- **Run Snowflake**: the lowest-barrier contribution, run from a browser extension or Docker (see [Snowflake](https://snowflake.torproject.org/){target="_blank"}).
- **Run a Tor relay or bridge**: this needs a steady network and a little operational effort. The Tor Project's [relay guide](https://community.torproject.org/relay/){target="_blank"} walks through the setup, and the community wrote up [how to set up a Tor WebTunnel bridge](../../community/setup-tor-webtunnel.md).
- **Campus Tor relays**: if you work or study at a college or university, start your assessment from the [Campus Tor Relay research track](https://anoni.net/docs/community/relay-on-campus/){target="_blank"} (zh-TW page, English version pending).
- **Join the anoni.net community discussion**: trade notes with other members over Matrix; the entry point is on the [community page](../../community/index.md), and other contact channels are on the [contact page](../../contact.md).

## Related reading

- [Why internet freedom matters](../../basics/internet-freedom.md)
- [After Iran's 80-day blackout, traffic surged through our community's Tor WebTunnel bridge](iran-blackout-webtunnel.md)
- [Setting up a Tor relay at NTNU](ntnu-nz.md)
- [Tor Relays watch page](../../regional/tor-relay-watcher.md)
- Same series: [Defending the public's right to know (OONI)](https://blog.torproject.org/Defending-the-right-to-know/){target="_blank"}, [Preserving evidence: How OpenArchive fosters accountability and media sovereignty](https://blog.torproject.org/preserving-evidence-openarchive-fosters-accountability-media-sovereignty/){target="_blank"}

[^1]: Taiwan's 2026 average electricity rate is NT$3.7823 per kWh (frozen for April–September by the 2026-03-27 rate review); the actual per-kWh price varies by customer class and time-of-use tier. Source: [Taipower electricity rate schedule](https://www.taipower.com.tw/2289/2290/46940/){target="_blank"}.
