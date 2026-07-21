---
title: OONI Run v2 for regional measurement
icon: material/help-network
description: How a shared, dynamic OONI Probe test list lets a community observe whether specific sites are censored across a region, plus the one CLI gotcha we hit.
---

# :material-help-network: OONI Run v2 for regional measurement

You want to track whether a set of sites is blocked in a particular place, but you cannot test there yourself. OONI Run v2 lets you build a mobile link and add the sites you want tested. Share it with helpers on the ground: each one opens it in [OONI Probe](https://ooni.org/install/mobile){target="_blank"}, runs the test, and the result uploads in real time to OONI's public database.

This page is not a click-by-click tutorial. OONI's own [OONI Run](https://run.ooni.org/){target="_blank"} platform and [measurement-campaign guide](https://ooni.org/support/ooni-censorship-measurement-campaigns){target="_blank"} document the create-and-share flow well, and keep it current. What we add here is the regional-application framing and one operational gotcha, and we send you to OONI for the rest.

## What it is for, regionally

OONI Run suits anyone who needs to track the blocking status of specific sites over time: a researcher doing a longitudinal case study, a journalist gathering evidence of a blocking event in another country, an organizer running a community-driven measurement campaign. Communities in Venezuela, Malaysia, India, and elsewhere have long [used it for censorship-measurement campaigns](https://ooni.org/support/ooni-censorship-measurement-campaigns#examples-of-ooni-censorship-measurement-campaigns){target="_blank"}.

Version 2, [launched in October 2024](https://ooni.org/post/2024-launch-ooni-run-v2/){target="_blank"}, made the link shorter and dynamically updatable: once a helper has installed your link in the OONI Probe app, sites you add later sync automatically, with no need to redistribute. Coverage accumulates over time, and all results are public on [OONI Explorer](https://explorer.ooni.org/){target="_blank"}, searchable by the link's ID.

## What you should know

Before you create or share an OONI Run link, a few things make it safer:

- **The creator's email is bound to the link.** OONI uses the creator's email as the basis for helpers to trust the link's origin; it is shown on the link card and stored on the backend. Use an address you are willing to have associated with the campaign.
- **Results are fully public.** Every measurement appears on OONI Explorer, including the helper's ASN and a timestamp. OONI does not publish individual IPs, but ASN plus time can already suggest a helper's rough location.
- **Do not casually hand the link to helpers in high-censorship regions.** Before sharing, assess whether running OONI Probe is lawful where the helper is, whether their network operator might flag the traffic, and whether the helper understands that their ASN and a timestamp become public.
- **A VPN or Tor left on will not give you "local" results.** OONI measures the network the test device actually uses; with a VPN on you measure the VPN provider's location, and over Tor you measure the exit node's network, neither of which reflects the helper's local blocking.
- **Data persists after the link expires.** The link is a distribution mechanism; once expired, helpers can no longer join, but measurements already collected stay in OONI's public database permanently.

To assess these risks more systematically, see [how to build a threat model](../basics/threat-model.md).

## How our community uses it

The community runs an OONI Run link (`10328`, at [run.ooni.org/v2/10328](https://run.ooni.org/v2/10328){target="_blank"}) that checks the reachability of our own self-hosted services (the main site, CryptPad, Etherpad, SearXNG, Send, Matrix, and this docs site) from wherever a helper is. Each time a helper runs the test, it reports whether those services are reachable on their network, which is a low-cost way to confirm over time that our services are still reachable across different carriers in the region. If you want to help, install that link in OONI Probe (Android; check OONI for current iOS support) and run it. How that connects to broader ASN coverage is in the [regional observatory](../regional/index.md).

## The miniooni CLI gotcha

Beyond mobile, OONI has a command-line build, [miniooni](https://github.com/ooni/probe-cli){target="_blank"}, handy on a server, in a research script, or in automation. Feeding it an OONI Run v2 link has one trap worth knowing: **do not hand the web URL straight to `-i`.**

```bash
# Does not work: the CLI gets HTML, and JSON parsing fails
miniooni oonirun -i https://run.ooni.org/v2/<LINK_ID>

# Correct: point at the API's descriptor JSON
miniooni oonirun -i https://api.ooni.org/api/v2/oonirun/links/<LINK_ID>
```

miniooni's `-i` treats the URL you give it as a descriptor-JSON endpoint and GETs it expecting JSON back. `run.ooni.org/v2/<ID>` is a web page for browsers and returns HTML, so the CLI's parse fails. The actual descriptor is served by the API at `https://api.ooni.org/api/v2/oonirun/links/<LINK_ID>`, where `<LINK_ID>` is the trailing segment of the web URL. Desktop and mobile are unaffected: the OS hands `run.ooni.org/v2/<ID>` to OONI Probe to handle. This limit affects only the miniooni CLI.

## Learn alongside

<div class="grid cards" markdown>

- [:material-access-point-network: Regional observatory](../regional/index.md)
- [:material-snowflake: Tor Snowflake](./tor-snowflake.md)
- [:material-web: OONI](https://ooni.org/){target="_blank"}

</div>
