---
title: Tor Browser advanced settings
description: The security-level slider, fingerprinting protections, and the handful of choices people get wrong — plus bridges for where Tor is blocked across Asia-Pacific.
icon: material/cog-outline
---

# :material-cog-outline: Tor Browser advanced settings

Tor Browser ships with defaults that already cover most people most of the time. The few settings worth understanding are the ones where a wrong choice quietly costs you the protection you came for, and the one regional case the defaults can't always handle on their own: connecting when your network actively blocks Tor.

This page is a short, opinionated walkthrough of those choices. It does not reproduce step-by-step instructions, because the [Tor Browser manual](https://tb-manual.torproject.org/){target="_blank"} and [Tor Project Support](https://support.torproject.org/){target="_blank"} keep those current in a way we can't. We send you there for the specifics and spend our words on what to decide and what not to touch. If you haven't framed what you're defending against yet, start with [threat modeling](../basics/threat-model.md).

## The security-level slider

Tor Browser groups its risk trade-offs into one control, reached from the shield icon next to the address bar. Three levels[^1]:

| Level | What runs | What it disables | The cost |
|---|---|---|---|
| **Standard** (default) | All browser and website features enabled; JavaScript runs everywhere | Nothing extra | Sites work as designed; the largest attack surface |
| **Safer** | JavaScript disabled on non-HTTPS sites | Some fonts and math symbols; audio and video become click-to-play | Some interactive sites degrade |
| **Safest** | JavaScript disabled on all sites by default | Some fonts, icons, math symbols, and images; audio and video click-to-play | Only static sites and basic services are reliable; many forms and web apps break |

The honest framing is that higher levels shrink the attack surface (most browser exploits arrive through JavaScript) in exchange for breaking sites. Standard is the right default for everyday browsing and anything interactive. Step up to **Safer** or **Safest** for an untrusted `.onion` address, a link of unknown provenance, or a domain you don't recognize, where a single malicious script is the realistic threat. Switch by site, not once-and-forever.

Tor Browser still includes the NoScript extension, but the Tor Project's guidance is to drive everything through the slider and leave NoScript alone. Adjusting NoScript by hand makes your browser behave unlike everyone else's, which is exactly the problem the next section is about.

## Fingerprinting: why you should look like everyone else

Tor hides which network path your traffic takes. It does nothing about a website measuring your browser itself: screen size, installed fonts, language, the exact set of features your build exposes. Stitched together, those readings form a **fingerprint** that can follow you across sites and across circuits, defeating the anonymity Tor gave you.

Tor Browser's answer is to make its users hard to tell apart. Rather than making everyone literally identical (impractical), it reduces the number of distinguishable "buckets" for each measurable trait, and standardizes the obvious giveaways like the User-Agent string so a large set of users reports the same thing[^2]. The protection only holds if you don't break out of the crowd. The mistakes that do:

- **Don't install extensions.** Add-ons beyond what ships built in make your browser a near-unique combination almost immediately. The fingerprinting risk outweighs nearly any feature an extension adds.
- **Don't maximize or manually resize the window.** Window dimensions are a strong fingerprint. Tor Browser uses **letterboxing**, adding gray margins so the content area rounds to a multiple of 200×100 pixels and you share a size bucket with other users[^2]. It activates automatically when you resize, but the safest move is to leave the default window alone rather than rely on it.
- **Don't change fonts or zoom level.** Both are readable by sites and both make you more distinguishable. The defaults are part of the shared profile.

The rule of thumb: the more you personalize Tor Browser, the more personally identifiable it becomes. Leave it boring.

## Bridges, for where Tor is blocked

This is the part that matters most across our region. In places with an open network (Taiwan is the usual reference point) you connect to Tor directly and never need any of this. The moment you cross into a censored network (mainland China, Iran, Myanmar, and others move in and out of this category), an ISP or firewall may block the public entry points outright. **Bridges** are unlisted entry nodes, and **pluggable transports** disguise the traffic so the block has nothing obvious to match on.

Tor Browser's **Connection Assist** detects that you're being blocked and tries bridges or Snowflake automatically, so the first thing to try is simply letting it run[^3]. If you need to choose a transport yourself, these are the current options[^4], at a pointer level:

- **obfs4** — scrambles the traffic so it looks random, with bridge addresses that resist discovery by scanning. The long-standing default for most censored networks.
- **Snowflake** — routes you through short-lived volunteer proxies over WebRTC (the peer connection browsers use for video calls), so the entry point keeps moving. Useful where fixed bridge addresses get burned. [Running a Snowflake proxy](https://snowflake.torproject.org/){target="_blank"} is also the lowest-effort way for people on open networks to help.
- **WebTunnel** — the newest transport, stable since 2024. It wraps your connection to look like ordinary HTTPS web traffic and can even share an address with a real website, so to a censor it resembles a normal site visit. Effective against networks that allow-list known protocols and deny everything else[^5].
- **meek** — disguises traffic as a request to a large cloud provider. Slow and bandwidth-limited, so a last resort.

Don't over-think the choice. Try Connection Assist, then obfs4, then WebTunnel or Snowflake if obfs4 is blocked. When you need to fetch fresh bridge addresses by hand, the manual lists the channels (the web request form, email, and a Telegram bot); see [Bridges](https://tb-manual.torproject.org/bridges/){target="_blank"} and [Circumvention](https://tb-manual.torproject.org/circumvention/){target="_blank"}.

## New Identity and New Circuit

Two controls reset your connection, and they are not interchangeable[^6]:

- **New Identity** (hamburger menu) closes every tab and window, clears cookies and history, and builds new circuits for everything. It is a clean break, for when nothing you do next should be linkable to what you just did.
- **New Tor Circuit for this Site** (the shield in the address bar) rebuilds only the current tab's path through the network, keeping your tabs and logins intact. Reach for it when an exit relay is failing to load a site or a CAPTCHA loop won't clear, and you want a different route.

If you're switching between two separate personas, **New Identity** is the one you want. New Circuit alone leaves cookies and browser state in place, and that residue is enough to tie the personas together.

## The mistakes that actually deanonymize you

Most people who lose anonymity on Tor don't lose it to a broken setting. They lose it to behavior the browser can't fix:

- **Logging into an account tied to your real name.** A personal Gmail, a real-name social account, a bank login: the instant you sign in, that session and everything around it attach to your identity. Logging in over Tor is fine when the account *is* a pseudonym you mean to use; the danger is mixing a real-name account into anonymous activity.
- **Mixing identities in one session.** Acting as persona A and persona B without a New Identity in between lets cookies and state link them. Keep personas in separate, deliberately reset sessions.
- **Downloading a document and opening it outside Tor.** A PDF or office file can fetch remote content when opened in a normal application, reaching out over your ordinary connection and revealing your real IP. If you must open downloaded documents, do it offline, or on a system built for it such as [Tails or Qubes](./tails-vs-whonix-vs-qubes.md). The Tor Project warns about this directly on the download screen.

These come back to the same idea covered in [anonymity, privacy, pseudonymity, and confidentiality](../basics/anonymity-vs-privacy.md): Tor protects the *who-talked-to-what* of a connection, and you give that away the moment your own actions reattach a name to it.

## Where to go from here

- [Tor Browser manual](https://tb-manual.torproject.org/){target="_blank"} — the canonical, current step-by-step for every setting on this page, including exact bridge and security-level instructions.
- [Tor Project Support](https://support.torproject.org/){target="_blank"} — searchable answers for connection errors, censorship circumvention, and managing identities.
- [Threat modeling](../basics/threat-model.md) — decide which of these settings you actually need before changing anything.
- [Tails vs Whonix vs Qubes](./tails-vs-whonix-vs-qubes.md) — when the browser alone isn't enough and you want the operating system to enforce isolation.
- [Regional Observatory](../regional/index.md) — what is reachable, and where, across the region, which informs whether you'll need bridges.

[^1]: [Security Settings](https://support.torproject.org/security-settings/){target="_blank"} — Tor Project Support.
[^2]: [Anti-Fingerprinting](https://support.torproject.org/anti-fingerprinting/){target="_blank"} — Tor Project Support. Letterboxing rounds the content window to a multiple of 200×100 pixels to keep users in shared size buckets.
[^3]: [Connecting to Tor from censored regions](https://support.torproject.org/tor-browser/circumvention/connecting-from-censored-regions/){target="_blank"} — Tor Project Support.
[^4]: [What is lyrebird?](https://support.torproject.org/tbb/lyrebird/){target="_blank"} — Tor Project Support. Lyrebird is the program in Tor Browser that implements obfs4, meek, Snowflake, and WebTunnel.
[^5]: [Hiding in plain sight: Introducing WebTunnel](https://blog.torproject.org/introducing-webtunnel-evading-censorship-by-hiding-in-plain-sight/){target="_blank"} — The Tor Project Blog.
[^6]: [Managing identities](https://support.torproject.org/managing-identities/){target="_blank"} — Tor Project Support.
