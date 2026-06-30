---
title: COSCUP 2026 Anonymity Networks Community track
description: The Anonymity Networks Community (anoni.net) runs a two-day community track at COSCUP 2026 (Aug 8–9, NTUST, Taipei) — talks and workshops on Tor, Tails, OONI, browser tracking, campus Tor nodes, data-privacy rights, a personal privacy guide, and anonymous payments, including a session co-organized with ETHTaipei.
icon: material/calendar-star
social:
  cards: false
og:
  enabled: true
  image: https://assets.anoni.net/event/anoni-net-eth-taipei.png
  image_type: image/png
  image_width: 1536
  image_height: 1024
  twitter_card: summary_large_image
---

# :material-calendar-star: COSCUP 2026 Anonymity Networks Community track

![COSCUP 2026 Anonymity Networks Community track hero image](https://assets.anoni.net/event/anoni-net-eth-taipei.webp){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

Journalists need to protect sources, civil-society groups need to protect members and donors, and developers want to know whether the tools in their hands actually hold up against surveillance. Under spreading censorship and monitoring, these needs land on the same set of risks: traffic can be intercepted, identities can be traced, and the timing and amount of a single transfer can reconstruct an entire web of relationships — sometimes exposing an organization's member list and money flow without anyone noticing.

The **Anonymity Networks Community (anoni.net)** brings a year of hands-on work with **Tor**, **Tails**, **OONI**, personal privacy, and anonymous payments to the open-source floor of COSCUP 2026. The two days run from how the internet and censorship work, through protecting journalistic sources, campus Tor nodes, browser tracking, and data-privacy rights, to an anonymous-payments session co-organized with ETHTaipei. Whether you came looking for tools you can use right away or want to contribute to open-source projects, there is a session for you.

!!! info "Event details"

    - Dates: August 8 (Sat) and 9 (Sun), 2026
    - Venue: National Taiwan University of Science and Technology (NTUST), Taipei. The community track is in `TR-510`; the Aug 8 afternoon session co-organized with ETHTaipei is in `TR-511`.
    - Format: community talks, hands-on workshops, and an anonymous-payments session co-organized with ETHTaipei
    - Language: most sessions are in Mandarin. Raghu's "The Workings of the Internet" is in English.
    - Admission: COSCUP is free, and the community track needs no separate registration — just show up. Times may still shift before the event; the [official COSCUP schedule](https://pretalx.coscup.org/coscup-2026/){target="_blank"} is authoritative.

[COSCUP 2026 schedule](https://pretalx.coscup.org/coscup-2026/){ .md-button .md-button--primary target="_blank"} [Call for proposals](./coscup-2026-cfp.md){ .md-button }

!!! tip "Where to start, by who you are"

    - **Newsrooms and independent journalists**: "How journalists protect sources with open-source tools" (Aug 8 morning) is the most direct, paired with "Threat models and metadata 101". On Aug 9 afternoon, "After the health-insurance database case" and "Privacy guide 2026" extend into data-privacy rights and personal defense.
    - **Civil-society groups and NGOs**: the four Aug 8 morning primers map closely to organizational realities, and "Privacy guide 2026" covers preparing for legal data requests. To weigh anonymous donation channels, the Aug 8 afternoon ETHTaipei session (especially "I don't launder money — so why understand anonymous payments?") is a good entry point.
    - **Open-source and tech community**: Aug 9 is the most technical — OpenWRT, the NTNU Tor node, and browser-fingerprint research are all hands-on. The Aug 8 afternoon zero-knowledge Citizen Digital Certificate work, privacy-preserving KYC, and stealth addresses are the meatiest protocol-level content. To contribute, see [how to contribute](../community/how-to-contribute.md).
    - None of the sessions need separate registration — just show up, and feel free to bring colleagues.

## :material-calendar-text: Schedule overview

Below is the community track plan; actual times follow the [official COSCUP schedule](https://pretalx.coscup.org/coscup-2026/){target="_blank"}. Session titles are translated from the program (most talks are in Mandarin). Changeover breaks sit between sessions (10 minutes on Aug 8 morning, 5 minutes on Aug 9 to fit a fuller day).

### Day 1: 2026/08/08 (Sat)

Aug 8 morning is four open-source anonymity primers led by anoni.net community members — pitched as entry-level and well suited to civil-society groups, news media, and independent journalists, with open source as the through-line. From 13:00, the ETHTaipei co-organized "Anonymous Payments" session takes over with heavier protocol-level content.

**Morning 09:30–12:00 · community open-source anonymity primers (room `TR-510`)**

| Time | Session | Speaker |
|------|---------|---------|
| 09:30-10:00<br>30 min | <span class="sess-tag sess-tag--basic">General</span> :material-account-group: **Meet Anonymity Networks Community: open-source anonymity tools, community practice, and the three 2026 themes**<br>:material-arrow-right-bottom: Where the community came from, how it contributes upstream, and the three themes it is pushing in 2026 | anoni.net community |
| 10:10-10:40<br>30 min | <span class="sess-tag sess-tag--basic">General</span> :material-target-account: **Threat models and metadata 101: know your adversary, and why anonymity tools must be open source to be trustworthy**<br>:material-arrow-right-bottom: Build a decision framework, and see why a tool you can independently audit is what keeps you safe | anoni.net community |
| 10:50-11:20<br>30 min | <span class="sess-tag sess-tag--privacy">Privacy</span> :material-newspaper-variant-outline: **How journalists protect sources with open-source tools: from first contact to post-publication cleanup**<br>:material-arrow-right-bottom: Which open, auditable tool fits each step of a source's lifecycle | anoni.net community |
| 11:30-12:00<br>30 min | <span class="sess-tag sess-tag--payments">Payments</span> :material-cash-multiple: **Why anonymous payments matter: open, decentralized money flows and Taiwan's VASP Act 2026**<br>:material-arrow-right-bottom: Why money flow is the hardest metadata to shake — from donations to everyday transfers — and the open-source alternatives | anoni.net community |

**Afternoon 13:00–16:30 · ETHTaipei "Anonymous Payments" session (room `TR-511`, program arranged by ETHTaipei)**

| Time | Session | Speaker |
|------|---------|---------|
| 13:00-13:30<br>30 min | <span class="sess-tag sess-tag--payments">Payments</span> :material-card-account-details-outline: **Zero-knowledge proofs and Citizen Digital Certificate identity verification**<br>:material-arrow-right-bottom: Prove you are a Taiwanese citizen to a service without handing over any personal data | Ya-wen Jeng |
| 13:40-14:10<br>30 min | <span class="sess-tag sess-tag--payments">Payments</span> :material-account-check-outline: **The Privacy-preserving Identity Pipeline in KYC**<br>:material-arrow-right-bottom: A stack of cryptographic primitives that passes KYC without the server ever seeing your identity data | ryanycw (Ryan Wang) |
| 14:20-14:50<br>30 min | <span class="sess-tag sess-tag--payments">Payments</span> :material-link-off: **Starting from unlinkability: how stealth addresses solve on-chain financial privacy (Fluidkey case study)**<br>:material-arrow-right-bottom: Stealth addresses scatter one person's payments across unrelated addresses no outsider can link | Jennifer HSU |
| 15:00-15:30<br>30 min | <span class="sess-tag sess-tag--payments">Payments</span> :material-bitcoin: **"I don't launder money — so why understand anonymous payments?" A from-scratch intro to private crypto flows**<br>:material-arrow-right-bottom: Why advocacy groups and donors should grasp crypto's privacy risks, walked through in plain language | 黃豆泥 mashbean |
| 15:40-16:30<br>50 min | <span class="sess-tag sess-tag--payments">Payments</span> :material-hammer-wrench: **Hands-on private payments workshop: from Tornado Cash to Privacy Pool**<br>:material-arrow-right-bottom: Props and live demos of how Tornado Cash and Privacy Pool work, with the practical privacy caveats | Liangcc |

### Day 2: 2026/08/09 (Sun)

Aug 9 is a full day of seven accepted talks, spanning network and censorship basics, home networking and campus Tor nodes, on-chain identity, browser tracking, health-database privacy rights, and personal privacy. Technical and everyday-facing sessions alternate, so developers, journalists, and civil-society groups can each find sessions that fit.

**Morning 10:00–12:00 (room `TR-510`)**

| Time | Session | Speaker |
|------|---------|---------|
| 10:00-10:50<br>50 min | <span class="sess-tag sess-tag--basic">General</span> :material-web: **The Workings of the Internet: how the net works and how censors block you (in English)**<br>:material-arrow-right-bottom: A postcard analogy for who sits between you and a website, and what they can see or change | Raghu |
| 10:55-11:25<br>30 min | <span class="sess-tag sess-tag--basic">General</span> :material-router-network: **Building a home network with OpenWRT and other open-source software**<br>:material-arrow-right-bottom: Advanced router setups consumer gear won't give you: VLAN isolation, multi-WAN, site-to-site VPN, and Tor as upstream | Pellaeon Lin |
| 11:30-12:00<br>30 min | <span class="sess-tag sess-tag--payments">Payments</span> :material-fingerprint: **Open-standard real-identity methods on blockchain networks**<br>:material-arrow-right-bottom: After the VASP Act, which open standards will locate Taiwanese identities on-chain | Yusef Schultz |

(12:00–13:00 lunch)

**Afternoon 13:00–16:00 (room `TR-510`)**

| Time | Session | Speaker |
|------|---------|---------|
| 13:00-13:30<br>30 min | <span class="sess-tag sess-tag--relay">Tor Relay</span> :simple-torproject: **Growing onions on campus? Running an academic Tor node at NTNU and lessons from the EFF Tor University Challenge**<br>:material-arrow-right-bottom: The full journey of standing up an academic Tor node, from technical config to campus policy | NZ |
| 13:35-14:25<br>50 min | <span class="sess-tag sess-tag--privacy">Privacy</span> :material-eye-off-outline: **Browser tracking, anti-tracking strategies, and user autonomy**<br>:material-arrow-right-bottom: How your everyday browser gets fingerprinted and may leak who you contact, and how to push back | Pellaeon Lin |
| 14:30-15:00<br>30 min | <span class="sess-tag sess-tag--privacy">Privacy</span> :material-database-lock: **After the health-insurance database case: exercising the right to stop secondary use, and other large databases**<br>:material-arrow-right-bottom: From the opt-out lawsuit to the amended law, and how to exercise the right over your own medical data | Kuan-Ju Chou |
| 15:05-15:55<br>50 min | <span class="sess-tag sess-tag--privacy">Privacy</span> :material-shield-account-outline: **Privacy guide 2026**<br>:material-arrow-right-bottom: From a personal risk matrix, to NGO and newsroom prep for legal data requests, to threshold signatures and MPC | Justyn |

## :material-handshake: Cross-community collaboration: Anonymity Networks Community × ETHTaipei { #cross-community }

This year the community is partnering with [ETHTaipei](https://ethtaipei.org/){target="_blank"} (the Taipei Ethereum Community) on programming. The Aug 8 afternoon "Anonymous Payments" session puts people who care about digital rights and blockchain developers in the same room: NGOs and journalists can learn the privacy risks of donations and money flows, while developers get protocol-level zero-knowledge proofs and stealth-address implementations. Application-oriented and introductory talks sit in the Anonymity Networks Community track; technical and protocol-level talks may move to the ETHTaipei blockchain track (see the [joint review arrangement](./coscup-2026-cfp.md#anoni-netxETHTaipei)). Attendees are welcome to move between the two tracks.

## :material-link-variant: Related links

- [COSCUP 2026 Call for Proposals](./coscup-2026-cfp.md): topics, cross-community collaboration, and how to submit
- [Anonymous network workshop 2025 (event recap)](../event-workshop-2025.md): last year's two-day workshop and roundtables
- [From 2025 to 2026: privacy guidance, campus Tor relay contest, anonymous payments](../blog/posts/2025to2026.md)
- [About us](../about/index.md)
- [How to contribute](../community/how-to-contribute.md): the entry point for helping with Tor, OONI, translation, or running a node

!!! info "Updates and contact"

    Session details and times may still change before the event; the [official COSCUP schedule](https://pretalx.coscup.org/coscup-2026/){target="_blank"} is the latest source. To hear about community events, [stay in touch](../contact.md) through our newsletter and contact channels.
