---
title: Pre-departure digital safety — brief yourself with AI prompts
description: Copy-paste prompts to ask your own AI for a destination's censorship, legal, SIM, and emergency-contact picture before you travel — works for any country, and no query ever reaches us.
icon: material/shield-airplane-outline
---

# :material-shield-airplane-outline: Pre-departure digital safety — brief yourself with AI prompts

Before a trip you check visas, plug types, and currency. Few people check: *how is the internet controlled where I'm going? Is my work legal there? Who do I call if something goes wrong?* For journalists, human-rights defenders, NGO staff, researchers, and activists, those are the questions that actually affect your safety.

This page is **not** a per-country data table. It works for **any destination**: it gives you a set of copy-paste prompts you paste into **your own AI**, which then drafts a pre-departure digital and physical safety briefing for you.

!!! note "Why copy-paste prompts instead of an online lookup tool"
    We deliberately do **not** run this as an "enter a destination, get an answer" service. For this audience, the query itself — "I'm going to country X, I'm a journalist, dates are Y" — is sensitive intelligence. On any server it gets logged and could be subpoenaed or leaked. By having you copy text and ask **your own** AI, **your destination and identity never reach us**. The trade-off is that answer quality depends on which AI you use — so always cross-check against the primary sources at the bottom of this page.

!!! tip "Pasting into a cloud AI still leaks to that provider"
    Even though it doesn't go through us, pasting your query into a cloud AI (ChatGPT, Claude, Gemini, etc.) still lets that provider see it. For **sensitive destinations**, use a local/self-hosted model, or at least use the "low-data" priming prompt below: fill in only the country, never your name, organization, or exact dates.

## How to use it

1. **Fill in once**: in the "priming prompt", replace `{origin}`, `{destination}`, and `{length of stay}` with your details (dates and role are optional), then paste it into your AI.
2. **Copy questions as-is**: the questions below need no editing — paste them one at a time. The AI remembers the destination and origin from the priming prompt.
3. **Verify yourself**: check the AI's answers against the primary sources at the bottom. **Don't trust blindly.**

!!! warning "AI will fabricate phone numbers, laws, and prices"
    Language models are very good at sounding confident while being wrong. Treat the AI's reply as a starting list of *what to check next*, not as the final answer — especially emergency numbers, legal citations, visa rules, and tariffs. **Always** verify those against official primary sources.

## Priming prompt (paste this first)

=== "Full (self-hosted / local AI)"

    ```text
    You are an assistant helping a civil-society worker (journalist, human-rights
    defender, NGO staffer, researcher, activist) assess digital and physical safety
    before travel.

    I'm travelling from {origin} to {destination}, staying about {length of stay} days.
    (Optional) The dates are roughly {date range}; my line of work is {leave blank if unsure}.

    I'll paste questions one at a time — they won't repeat the destination or origin,
    so always use what I set above. For each, please:
    1. Cite verifiable primary sources where possible (OONI, Tor Metrics/Onionoo,
       Access Now, both countries' foreign ministries, RSF, Freedom House, CIVICUS),
       with links and the date of the data.
    2. Clearly separate "sourced fact" from "your inference".
    3. Say so when you're unsure — do not invent phone numbers, statute numbers, or prices.
    4. End each item with a one-line "so what should I do".
    ```

=== "Low-data (cloud AI)"

    ```text
    You are an assistant helping a civil-society worker assess digital and physical
    safety before travel. I'm going to {destination} (country level is enough); assume
    a short stay. I will not give my name, organization, or exact dates.

    I'll paste questions one at a time — they won't repeat the destination, so always
    use what I set above. For each, cite verifiable primary sources with links, separate
    fact from inference, say when you're unsure, and end with one actionable line.
    ```

## The questions (copy one at a time)

Each block below is one question. Send them one at a time: copy a question, send it, read the AI's answer and check it against the primary sources at the bottom, then paste the next one. The priming prompt is set up for one-at-a-time answers, so asking each question separately gives fuller answers and is easier to verify item by item. Pasting them all at once tends to produce a single vague, merged reply that is harder to check.

### 1. Digital environment: censorship, Tor, VPN, device search

```text
[Digital 1 / Censorship & blocking] Check OONI Explorer for the destination over the
last 6–12 months: are Tor, Signal, WhatsApp, Telegram, major VPNs (e.g. ProtonVPN),
and independent news / human-rights sites showing DNS/TCP/HTTP blocking or anomalies?
List confirmed/anomaly findings with dates and link to OONI Explorer.
```

```text
[Digital 2 / Tor reachability] How many running Tor relays and bridges, and roughly
how much bandwidth, does the destination have (per Tor Metrics / Onionoo)? Based on that,
can Tor connect directly, or will I need a pluggable transport (obfs4 / Snowflake /
WebTunnel)? Give me an on-arrival connection plan with a fallback order.
```

!!! tip "Want real Tor relay numbers? Connect onionoo MCP first"
    With no external data source, an AI will often invent the relay/bridge counts and bandwidth this question asks for (exactly the failure this page warns about). Our community-run [onionoo MCP](../community/onionoo-mcp.md) wraps Tor Project's public Onionoo data behind a single URL. Paste it into an assistant like claude.ai and it can pull real, citable numbers as of the moment you ask, instead of guessing.

```text
[Digital 3 / VPN legality & usability] Is using a VPN legal in the destination? Are
protocols like WireGuard or OpenVPN blocked or throttled? Are only government-approved
VPNs allowed? What should I install before departure, and what backups should I prepare?
```

```text
[Digital 4 / Border & device search] On entry to the destination, might customs search my
phone or laptop, or ask me to log into social accounts? Are there laws compelling
disclosure of passwords or encryption keys? Is possessing or using encrypted messaging
apps illegal? Any record of journalists or HRDs being denied entry or detained?
```

```text
[Digital 5 / Shutdown risk] Has the destination had internet shutdowns or throttling in
the past (see Access Now #KeepItOn)? If my stay overlaps an election, protests, or a
sensitive anniversary, how elevated is the risk? What offline fallbacks should I prepare?
```

### 2. Legal and political risk

```text
[Legal 6 / Travel advisory] What advisory level has my origin's foreign ministry issued
for the destination? Cross-check the current US State Department and UK FCDO advisories.
Any recent unrest, protests, or conflict? Include official links and update dates.
```

```text
[Legal 7 / Risk to my role] For journalists / NGOs / activists, what is the legal climate
in the destination? Reference the RSF Press Freedom Index, Freedom House "Freedom on the
Net", and the CIVICUS Monitor rating. Are there foreign-agent / NGO-registration laws,
defamation / lèse-majesté / blasphemy offences, or assembly restrictions? Which routine
activities of mine could break local law?
```

```text
[Legal 8 / Entry & identity] Entering the destination on my passport — what visa
or electronic travel authorization (ETA / ETIAS, etc.) is required? Does my length of
stay fit the visa-free allowance? Do my origin's and the destination's diplomatic
relations affect the consular help I can get?
```

### 3. Connectivity (SIM / eSIM)

```text
[Connectivity 9 / SIM & eSIM] Does buying a physical SIM in the destination require
real-name registration (passport / biometrics)? Given my length of stay and origin,
should I use a regional or single-country eSIM (e.g. Airalo)
or home-number roaming? List a few options with rough prices and the local carriers
they use — and remind me to use VoIP (Signal/WhatsApp) for voice over traditional roaming.
```

### 4. Emergency contacts and support network

```text
[Emergency 10 / Consular office] What are the 24-hour emergency line, general phone,
address, and office hours of my origin's embassy/representative office in the destination?
If my origin has no office there, which nearest accredited office covers it? Format it so
I can copy it onto a card.
```

```text
[Emergency 11 / Digital security & local support] Give me the Access Now Digital Security
Helpline contact (24/7, multilingual, help@accessnow.org, responds within two hours).
What local digital-rights, journalist-protection, or legal-aid organizations exist in
the destination? Who do I contact if a device is seized or an account is attacked?
```

```text
[Emergency 12 / Local emergency numbers & legal aid] What are the police, ambulance, and
fire numbers in the destination? If I'm stopped or detained, what local legal-aid or lawyer
hotlines can I reach in real time?
```

### 5. Physical and surveillance environment (optional)

```text
[Physical 13 / Surveillance & safety, optional] How pervasive is public surveillance in
the destination (CCTV, facial recognition)? What is the police attitude toward assemblies
and street photography? Which areas or behaviours carry higher risk for someone in my
line of work, and should be avoided?
```

## Turn the results into a pocket emergency card

After running the items above, copy the key contacts from section 4 (emergency contacts and support network) onto a card, print and laminate it, keep one in your wallet and one in your luggage, and also save it to an offline note on your phone and (if you use one) Tails. Blank template:

```text
[Digital security incident] Access Now Digital Security Helpline (24/7, multilingual)
  help@accessnow.org

[Consular | {destination}] {origin} office in {destination}
  Emergency 24h: ________________ (accidents / robbery / life-threatening only)
  General:       ________________ (hours ______)
  Address:       ________________

[{origin} foreign-ministry 24h emergency center]
  ________________

[Local police / ambulance / fire] ________ / ________ / ________

[Local digital / legal support] ________________________
```

## Primary sources (verify the AI against these)

- **OONI Explorer** — per-country censorship/blocking measurements: <https://explorer.ooni.org/>{target="_blank"}
- **Tor Metrics** — relays/bridges and per-country connections: <https://metrics.torproject.org/>{target="_blank"}
- **Access Now Digital Security Helpline** — 24/7 digital-safety help: <https://www.accessnow.org/help/>{target="_blank"}
- **Access Now #KeepItOn** — internet shutdown tracker: <https://www.accessnow.org/keepiton/>{target="_blank"}
- **Your foreign ministry** — travel advisories and consular emergency numbers
- **RSF Press Freedom Index**: <https://rsf.org/en/index>{target="_blank"}
- **Freedom House — Freedom on the Net**: <https://freedomhouse.org/report/freedom-net>{target="_blank"}
- **CIVICUS Monitor** — civic-space ratings: <https://monitor.civicus.org/>{target="_blank"}
- **EFF Surveillance Self-Defense**: <https://ssd.eff.org/>{target="_blank"}
- **Front Line Defenders**: <https://www.frontlinedefenders.org/>{target="_blank"}

## See also

- [Regional observatory](../regional/index.md) — empirical censorship and Tor-reachability observations for the region.
- [onionoo MCP — a query service for Tor relays](../community/onionoo-mcp.md) — hand "Digital 2" above to the AI directly. Connect this URL and your assistant can answer how many Tor relays a country has, how much bandwidth, and which networks host them, with numbers straight from Tor Project's Onionoo.
- [Basics: networked freedom](../basics/internet-freedom.md) — the conceptual frame behind these scenarios.
- [The thinking behind this page (blog)](../blog/posts/travel-ai-briefing.md) — why we package the questions worth asking into a prompt pack you run on your own trusted AI.

---

This page gives you the *questions*, not ready-made answers. If you have on-the-ground experience for a specific destination, come discuss it in our [Matrix room](../community/index.md), or send it anonymously to [whisper@anoni.net](mailto:whisper@anoni.net).
