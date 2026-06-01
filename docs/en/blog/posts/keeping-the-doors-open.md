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

    The body below is the original English text of a guest post on the Tor Blog, written by Unredacted. The three sections after the horizontal rule are additions from the anoni.net community: a Taiwan vantage point, GreenWare's feasibility for free-connectivity regions, and what you can do.

    - [Keeping the doors open, Tor Blog, by Unredacted.org, 2026-05-15](https://blog.torproject.org/keeping-the-doors-open-unredacted/){target="_blank"}

![Keeping the doors open](assets/images/tor.webp){style="border-radius: 10px;"}

This guest post is part of a spotlight series on the organizations defending the free internet.

A user in China once said this about our work:

> "You have helped many many people to overcome the great firewall. Without your help, I would be in the totally darkness trap and being brain-washed."

We don't hear from the people who use our services very often. Most of them can't or don't feel that they can safely send a message. When one comes through, it's a reminder of what's actually at stake.

<!-- more -->

We're [Unredacted](https://unredacted.org/){target="_blank"}, a US-based 501(c)(3) non-profit. We build and operate Internet infrastructure that helps people reach the open Internet and protect their right to privacy. We do this by operating a network of over 300 servers around the world. We're a way through when the front door is locked, and a place to communicate when the public square isn't safe. Most of the work is invisible: datacenter work, hardware, automation, open source software, bandwidth, abuse queues, monitoring alerts, and the late nights spent keeping all of it online.

What we do falls into three areas. Censorship Evasion is where Unredacted Door lives, our umbrella for the services designed to route around blocking. Secure Infrastructure is where we run things like [XMPP.is](https://xmpp.is/){target="_blank"} and our [Matrix homeserver](https://unredacted.org/services/si/matrix/){target="_blank"}, and other free services built with security and privacy in mind. Unredacted Education is the writing and documentation side: guides and explainers for the people who want to understand the work and replicate it. Alongside those, [Unredacted Labs](https://unredacted.org/blog/2025/05/unredacted-labs/){target="_blank"} is where we experiment with infrastructure ideas that aren't quite production-ready. GreenWare is one of those, our effort to run real network capacity on hardware that doesn't burn a lot of power.

## Unredacted Door

The name is literal. When the entrance to the open Internet gets walled off, people need another way in.

Unredacted Door brings together several of our circumvention services: FreeSocks, messaging proxies for Signal and Telegram, Tor bridges, and Snowflake proxies. In a recent 30-day window, these services carried nearly 300 TiB of traffic for tens of thousands of people routing around censorship in their countries. That's roughly the equivalent of bandwidth to stream tens of thousands of hours of 4K video. Demand isn't slowing, and we need to continue building more. Every new filter, every new law, every "for your safety" rollout sends more people looking for a route the censors haven't found yet.

The largest piece of Unredacted Door is [FreeSocks](https://freesocks.org/){target="_blank"}: free proxies for people in places where censorship is severe. If you've never run into one, a proxy is a relay point. Your app doesn't talk directly to the blocked service. It talks to a server that carries the connection past whatever filters are sitting between you and the wider Internet. FreeSocks is built to make that relay quietly unremarkable, which is exactly the trait a standard VPN tends to lack. A VPN advertises itself. There's a known endpoint, a known handshake, an obvious shape on the wire. Censors are very good at blocking things they can recognize.

No single tool covers every situation. Tor Browser gives you strong privacy and anonymity for browsing. Snowflake helps people reach Tor when access to the network itself is blocked. FreeSocks proxies push specific traffic through a route that's harder to spot. People living under censorship usually need a few of these on hand, because no single door stays open forever.

That's why we're putting serious work into the next version of FreeSocks (v2). It uses Xray, a powerful and versatile traffic-routing engine, which can make proxy traffic look more like ordinary web traffic, bundled with our open source [control plane](https://github.com/unredacted/freesocks-control-plane){target="_blank"} that allows us to rotate endpoints automatically when censors find and block a server. The less a user has to fiddle with their setup while they're already under pressure, the better.

!!! note "What is Xray"

    Xray is a traffic-routing and obfuscation tool descended from the V2Ray project, widely adopted by users in heavily censored places like China and Iran. It offers protocols such as VLESS, Trojan, and Reality that disguise proxy traffic as ordinary HTTPS / TLS, so it does not stand out to machine fingerprinting. The handshake and packet shapes a standard VPN gives away at a glance are exactly what Xray smooths over, which is why it has become a mainstay in the circumvention toolkit. See the [Xray-core project](https://github.com/XTLS/Xray-core){target="_blank"} for details. (This note is an addition from the anoni.net editors.)

## GreenWare: sustainable infrastructure, literally

Tor relays, bridges, proxies, and more. They run on hardware in datacenters, and that hardware has a real footprint: financial, operational, and environmental. If we want privacy infrastructure to last, we have to ask what's actually sustainable to operate.

[GreenWare](https://unredacted.org/blog/2025/05/unredacted-labs/#greenware){target="_blank"} is our attempt to shrink that footprint without shrinking what we can carry on it. The premise is straightforward: most Tor relay traffic doesn't need a server that draws power like a space heater. A relay needs a steady network, predictable CPU, and enough memory to hold its state. That's a workload a single-board computer can handle, if the chassis around it is built to take it seriously.

We started with Raspberry Pi 5 boards powered over PoE, fed entirely through their network cables. The idea worked. A typical server in a datacenter draws as much power as a small space heater. A Pi draws less than a lightbulb. But the first generation had ceilings. Density wasn't where we wanted it, and a few of the supporting components weren't built for the hours we were putting on them.

So we run two deployments in parallel now. The first is a 1U chassis with 20 ComputeBlade modules stacked into it. We deployed all 20 in our datacenter and moved a chunk of our Tor exit relays onto them. That chassis pulls a little over 100W under load, roughly what an old incandescent bulb burns. The second is a custom Raspberry Pi chassis we designed after the ComputeBlade work taught us what we actually wanted in the field. Both are live, and as of writing all 123 of our Tor exit relays run on this combined infrastructure, drawing roughly 400W in total. As time goes on, we'll have more to say about the chassis design and the project as it matures.

The Tor network runs on people and organizations willing to operate infrastructure for it. Exits are the hardest part of that job. They need bandwidth, maintenance, abuse handling, legal nerve, and money. If we can drop the cost and the power required to run real exit capacity, more people can take on a piece of the work and diversify and grow the network.

Our longer-term ambition is to keep pushing on efficient hardware, carbon tracking, and eventually renewable-powered micro points of presence. We'd be more than glad to partner with organizations and companies that want to see this grow.

The open Internet is kept open by many people and organizations investing energy, time, and effort: the [researchers measuring censorship](https://blog.torproject.org/Defending-the-right-to-know/){target="_blank"}, the [relay operators providing bandwidth](https://blog.torproject.org/exploring-stateless-relays/){target="_blank"}, and the communities that refuse to leave one another behind. At Unredacted, our part is building and maintaining the routes people may need when the obvious ones disappear.

---

## From the anoni.net community: a Taiwan vantage point

The message from the user in China that opens Unredacted's post is rare to see in public, because people living under censorship usually have no channel to speak out safely. anoni.net is an anonymity-network community based in Taiwan, and that is the vantage point these notes are written from. Taiwan's network environment is relatively free: no Great Firewall, no mandatory VPN registration, no state censorship orders to ISPs. That is exactly why a place like Taiwan, with free outbound connectivity, is well positioned to host Tor relays and bridges and carry a share of the circumvention work. The people this infrastructure serves are in heavily censored places like mainland China and Iran. Other regions with equally free connectivity, like Singapore, Malaysia, and wherever the diaspora lives, are just as suitable as hosting locations.

The anoni.net community tracks the number and distribution of Tor relays in Taiwan through [Pulse live monitoring](https://api.anoni.net/api/readme){target="_blank"}. As of 2026-05-31, Onionoo (the Tor Project's relay data service) sees 12 running relays inside Taiwan, of which only 3 carry the Exit flag (initramfs, GuruKopi, jerryrelay). Set against Unredacted, a single organization running 123 exit relays and carrying nearly 300 TiB over 30 days, Taiwan's nationwide exit capacity is under 3% of theirs. We keep this number current on the [Tor Relays watch page](../../regional/tor-relay-watcher.md) and pair it with OONI's censorship observations for Taiwan and nearby regions.

For the Sinophone world, demand for circumvention has grown since 2020 across Hong Kong, Macau, and Mandarin-speaking communities in Southeast Asia, while circumvention resources written in Chinese remain comparatively scarce. Part of anoni.net's work is filling that gap with Chinese-language documentation, walking the same path as Unredacted Education.

## From the anoni.net community: GreenWare's feasibility for free-connectivity regions

Unredacted running 123 exit relays on 400W makes for friendly operating economics. At Taiwan's industrial electricity rate of roughly NT$3.5–6 per kWh (about US$0.11–0.19), 400W running year-round is about 3,500 kWh, or roughly NT$12,000–21,000 a year (about US$400–700). That is an affordable line item for a campus IT center or a community workspace. Readers elsewhere can convert their local rate; the order of magnitude usually lands in the same range.

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
