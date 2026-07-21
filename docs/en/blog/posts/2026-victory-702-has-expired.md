---
date: 2026-07-23
authors:
    - anoni-net
categories:
    - Update
    - Privacy
    - Translated Article
slug: 2026-victory-702-has-expired
image: "https://assets.anoni.net/blog/2026-victory-702-has-expired.png"
summary: "FISA Section 702 lets US intelligence collect the communications of non-US persons abroad without a warrant, and the PRISM and Upstream programs Snowden exposed in 2013 both run on it. It lapsed at midnight on 12 June 2026. EFF calls it a victory — but everyone outside America, including readers across the Sinophone Asia-Pacific, was always a lawful target, and the lapse protects them far less than it protects Americans."
description: "A Sinophone Asia-Pacific read of the Section 702 lapse: what warrantless US surveillance of non-US persons actually covers, its link to Snowden's PRISM/Upstream disclosures, and why the 'victory' is thinner once you are outside the Fourth Amendment."
---

# Section 702 Has Expired: A Sinophone Asia-Pacific Read on Warrantless US Surveillance

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/2026-victory-702-has-expired.png" target="_blank">
        <img src="https://assets.anoni.net/blog/2026-victory-702-has-expired.png"
            alt="EFF's NSA eagle graphic, reworking the NSA seal into an eagle plugging its talons into telecom lines, representing warrantless mass surveillance"
            style="border-radius: 10px;">
    </a>
    <figcaption>Image: EFF designer Hugh D'Andrade's "NSA eagle," which reworks the NSA seal into an eagle plugging its talons into the nation's telecom lines. From [EFF's NSA spying work](https://www.eff.org/nsa-spying){target="_blank"}, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/){target="_blank"}[^img].</figcaption>
</figure>

!!! info ""

    This post is an anoni.net reading based on the EFF Deeplinks article:

    - [Victory! 702 has Expired! | June 12, 2026](https://www.eff.org/deeplinks/2026/06/victory-702-has-expired){target="_blank"} by India McKinney

At midnight on **12 June 2026**, Section 702 of the Foreign Intelligence Surveillance Act lapsed[^1]. EFF, which spent years arguing the program should require a warrant before the FBI reaches Americans' communications — or else expire — calls the lapse a victory[^1].

It is a real victory, and a narrow one. Section 702 was always built to collect the communications of *non-US persons* located abroad. That means everyone outside America — including readers in Taiwan, Hong Kong, mainland China, Macau, Singapore, and Malaysia — has always been a lawful target of this authority. The fight that just lapsed it was overwhelmingly a fight about protecting Americans. For the rest of us, the lapse changes much less than the headline suggests.

<!-- more -->

## What Section 702 is

Section 702 was created by the FISA Amendments Act of 2008[^3]. It lets US intelligence agencies collect the communications — emails, messages, calls — of foreigners abroad believed to hold foreign intelligence value, without an individual warrant. US citizens are shielded by the Fourth Amendment and a warrant requirement; non-US persons are not.

In practice, 702 also sweeps up large volumes of Americans' communications through what the government calls "incidental collection": whenever an American corresponds with a targeted foreigner, their side of the conversation lands in the database too. That is where the domestic controversy starts.

Two collection methods sit under 702, and the names are familiar:

- **Downstream (formerly PRISM):** the government compels companies such as Google, Microsoft, Apple, Facebook, and Yahoo to hand over matching user communications[^2].
- **Upstream:** the NSA collects traffic directly from the internet backbone — the cables and switches that carry it[^2].

## The Snowden connection

The link to Edward Snowden is direct. PRISM and Upstream are the two concrete programs the 2013 disclosures revealed[^2], and both run on Section 702 as their legal basis. When the world first learned in June 2013 that the US could collect global internet traffic at this scale, what it was looking at was Section 702 in operation. Snowden exposed *how* the collection works; Section 702 is *what makes it lawful*.

Thirteen years later, the authority behind those programs has lapsed for the first time.

## Backdoor searches: the core of the fight

702 nominally targets foreigners. What drew the constitutional fight inside the US is the **backdoor search** — officially a "US person query." Because incidental collection fills the 702 database with Americans' communications, the FBI, CIA, and NSA can query it using an American's name, email, or phone number, with no separate warrant — routing around the Fourth Amendment.

The numbers are large, and so are the compliance failures. The FBI ran close to 5 million US person queries between 2019 and 2022; the queries were mostly procedurally permitted, but the dispute is that most lacked a documented justification[^4]. In a single reporting period the government disclosed more than 278,000 noncompliant searches of the Section 702 database[^4]. The 2024 Reforming Intelligence and Securing America Act (RISAA) added modest reforms but left warrantless querying intact, and by August 2024 the FBI was reported to be using a tool that sidestepped even those limits[^4].

## What happened in June 2026

The lapse turned on a personnel fight. President Trump named Bill Pulte — then director of the Federal Housing Finance Agency — as acting Director of National Intelligence, replacing the departing Tulsi Gabbard[^1][^5]. The DNI oversees the agencies that run 702, and handing that post to someone with no intelligence background who had pursued the president's political opponents on mortgage-fraud allegations was enough that Senate Democrats refused to advance their reauthorization bill, while the House rejected even a short-term extension[^1][^5]. After several temporary extensions, the authority stopped at midnight on 12 June[^1].

Expiry does not mean collection stopped that day. The Foreign Intelligence Surveillance Court's existing certifications run through March 2027, giving collection a legal basis in the meantime; as one legal expert put it, "702 will not go dark — that is a myth"[^5]. The lapse is a legal and political turning point, not an off switch.

## Why EFF still calls it a victory

EFF's point is that the abuse risk never depended on any one person or administration. If Congress is worried that someone might reach Americans' sensitive data, the responsible fix is stronger structural transparency, accountability, and oversight — not swapping out a single nominee[^1]. Across 2026, bipartisan appetite for reform grew, with more members opposing any reauthorization that lacks a warrant requirement for backdoor searches[^1]. An authority that ran for over a decade, survived Snowden, and repeatedly beat back reform was forced into a lapse — that, by itself, shows sustained advocacy works.

## Seen from outside the US

If you are outside America, the most important thing to take from the lapse is your position in the structure. 702 targets non-US persons, so simply being in Taiwan, Hong Kong, mainland China, Macau, Singapore, or anywhere else outside the US already places you inside the lawful scope. The backdoor-search fight is about Americans whose Fourth Amendment protection was routed around. You were never inside that protection — querying your 702-collected communications is not even a back door for the US government; it is the front door.

A common reflex is to assume this does not matter because you are not personally a target. But privacy protects against *capability*, not against present intent. An agency that is not interested in you today does not thereby give up the capability, and the targets and uses of mass collection shift with politics. Putting any actor with mass-collection capability into the same threat model is more reliable than betting that you will stay uninteresting.

And the lapse does not close the other doors. The NSA's primary authority for overseas signals intelligence is **Executive Order 12333** (signed in 1981), which has no FISA Court supervision, limited congressional oversight, and is entirely unaffected by the 702 lapse[^6]. Collection of non-US persons can continue with or without 702. That is why the "victory" is thinner from outside America, and why the durable answer is encryption you control rather than any single statute.

Data residency is the next misunderstanding. Sinophone Asia-Pacific users lean heavily on US cloud and communication services — Google Workspace, Microsoft 365, iCloud, AWS, and Meta's WhatsApp and Instagram (some of which require getting around blocking inside mainland China, but are everyday tools in Hong Kong, Macau, Singapore, Malaysia, and the diaspora). Keeping data in a local data center does not exempt it: if the provider is headquartered in the US, the **CLOUD Act** (2018) can compel it to hand over data it controls regardless of where the servers sit[^7]. The EU spent years litigating this same problem with the US; the Sinophone region has no equivalent arrangement at all. The defense that actually holds is end-to-end encryption (E2EE): if the keys are not in the provider's hands, data handed over or intercepted in transit stays unreadable — which is what blunts both incidental collection and backdoor searches.

Encryption protects content; **Tor** also hides the connection itself. Upstream reads traffic off the backbone — where you connect, who you talk to. Places like Taiwan and Hong Kong route most international traffic over submarine cables[^8], and the trans-Pacific routes to the US west and east coasts are major trunks; whenever a connection's destination or path crosses a US backbone, the packets fall within Upstream's reach. Tor encrypts and relays traffic through multiple hops, so the backbone sees only encrypted Tor traffic and the provider cannot tie it to the real user, breaking the connection mapping that PRISM and Upstream rely on. Tor blunts this kind of bulk passive collection, though not targeted active attacks — the NSA's own "Tor Stinks" deck conceded it could only deanonymize a small fraction of users[^9].

Risk is not evenly spread. Journalists and civil-society groups who work with overseas newsrooms, international bodies, and sources already carry heavy cross-border traffic, so incidental collection reaches them more often; those roles are worth raising the bar for — sensitive collaboration over Tor, source lists kept off US-company clouds. And for many Sinophone users, the more immediate threat is domestic surveillance — from mainland China's censorship and real-name systems to the varying communications-interception regimes across the region — against which the same tools, E2EE and Tor, are the same line of defense. anoni.net invests in decentralization, self-hosting, and encryption precisely because, as 12 June showed, collection continues and EO 12333 is untouched: the prudent move is capability you hold yourself, not a law you hope holds.

The lapse will not make surveillance disappear, and it will not zero out the privacy risk on cross-border communication. For anyone outside the US, the thing to watch is the legal structure that authorizes collection — and the first concrete step is small: move everyday contact onto tools that are end-to-end encrypted by default, and route sensitive connections through Tor.

## Related reading

- [Why internet freedom matters](../../basics/internet-freedom.md): the structural framing behind authorities like 702
- [Upstream vs. PRISM](https://www.eff.org/pages/upstream-prism){target="_blank"} — EFF, on the two 702 collection methods
- [Section 702, Explained](https://www.brennancenter.org/our-work/research-reports/section-702-foreign-intelligence-surveillance-act){target="_blank"} — Brennan Center

_English coverage of the technical defenses here is still thin on this site; the deeper concept and tool pages exist in Mandarin and are on the roadmap for English._

[^1]: [Victory! 702 has Expired!](https://www.eff.org/deeplinks/2026/06/victory-702-has-expired){target="_blank"} - EFF Deeplinks (India McKinney, 2026-06-12)
[^2]: [Upstream vs. PRISM](https://www.eff.org/pages/upstream-prism){target="_blank"} - EFF (the two collection methods under 702 and their link to the 2013 Snowden disclosures)
[^3]: [The 702 Ultimatum: Warrant Requirement or Bust](https://www.eff.org/deeplinks/2026/06/702-ultimatum-warrant-requirement-or-bust){target="_blank"} - EFF Deeplinks
[^4]: [Section 702 of the Foreign Intelligence Surveillance Act, Explained](https://www.brennancenter.org/our-work/research-reports/section-702-foreign-intelligence-surveillance-act){target="_blank"} - Brennan Center for Justice (backdoor-search counts, compliance violations, RISAA background)
[^5]: [A key spy authority, Section 702, expired due to inaction in Congress. Here's what happens next.](https://www.cbsnews.com/news/fisa-section-702-expiring-congress-what-that-means/){target="_blank"} - CBS News (timeline, Pulte appointment, certifications continuing through March 2027)
[^6]: [Foreign Intelligence Surveillance (FISA Section 702, Executive Order 12333, and Section 215 of the Patriot Act): A Resource Page](https://www.brennancenter.org/our-work/research-reports/foreign-intelligence-surveillance-fisa-section-702-executive-order-12333){target="_blank"} - Brennan Center for Justice (EO 12333 as the primary overseas authority, without FISC oversight, unaffected by the 702 lapse)
[^7]: [Cross-Border Data Sharing Under the CLOUD Act](https://www.congress.gov/crs-product/R45173){target="_blank"} - Congressional Research Service (US providers can be compelled to disclose data they control regardless of server location)
[^8]: [Taiwan's undersea cables](https://taiwaninsight.org/2024/10/02/the-most-critical-resilience-questions-of-them-all-taiwans-undersea-cables/){target="_blank"} - Taiwan Insight (Taiwan's dependence on international submarine cables)
[^9]: [NSA and GCHQ target Tor network that protects anonymity of web users](https://www.schneier.com/essays/archives/2013/10/nsa_and_gchq_target.html){target="_blank"} - Bruce Schneier (originally in The Guardian, on the "Tor Stinks" and EgotisticalGiraffe documents)
[^img]: Header image [NSA-eagle-2_0.png](https://www.eff.org/files/banner_library/NSA-eagle-2_0.png){target="_blank"}, from [EFF's NSA spying work](https://www.eff.org/nsa-spying){target="_blank"}, by EFF designer Hugh D'Andrade, licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/){target="_blank"}.
