---
title: A browser fingerprint cannot be cleared the way a cookie can
description: What a browser fingerprint is made of, why it resists the fixes that work on cookies, and what Tor Browser, Brave, Safari, Firefox, and Chrome each do about it by default as of August 2026.
icon: material/fingerprint
---

# :material-fingerprint: A browser fingerprint cannot be cleared the way a cookie can

Clear your cookies, open a private window, sign in with a different account, and a site can still recognise the machine. Nothing it relies on to do that is stored on your computer.

Every time your browser loads a page, the JavaScript on that page can ask it dozens of questions. How large is the screen, which time zone is set, which fonts are installed, which graphics card is present, which features it supports. Each individual answer is shared with a lot of other people. The combination is often shared with nobody.

!!! info "Start with Cover Your Tracks if the concept is new"

    EFF's [Cover Your Tracks](https://coveryourtracks.eff.org/){target="_blank"} tests your own browser and shows which of its signals carry the most identifying power, and [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"} covers the introductory ground. We don't reproduce that work. This page is about why the problem is structurally hard, and where each major browser currently stands.

## Cookies have a file, fingerprints do not

A cookie is a small piece of data a site stores in your browser. It has a file and an expiry date, and you can delete it, refuse it, or clear it on a schedule. Consent banners and the "clear browsing data" button both rest on the assumption that a user can manage it.

A fingerprint has no file behind it. It is measured and computed afresh on every page load, and closing the browser changes nothing. There is no "clear my fingerprint" action available, because nothing was stored to begin with.

Chrome's own engineering leadership described the gap in 2019. Justin Schuh, then director of Chrome engineering, wrote that unlike cookies, users cannot clear their fingerprint and therefore cannot control how their information is collected, and that "we think this subverts user choice and is wrong"[^google2019]. Where the same company stands now is covered further down.

## Dozens of small signals add up to one identifier

- **Screen and window**: resolution, colour depth, window size, device pixel ratio
- **System settings**: time zone, language, operating system and version
- **Font list**: every font you have installed can be enumerated, which makes designers' and developers' machines especially distinctive
- **Graphics hardware**: GPU vendor and model, and the list of supported features, exposed through WebGL and WebGPU
- **Canvas and audio**: ask the browser to draw a shape or process an audio buffer, and small differences between hardware and drivers produce a stable hash
- **The browser itself**: version, which APIs it supports, which extensions are installed, how it renders text

The unit of measurement is entropy, meaning how finely a single signal divides the population. A time zone shared across East Asia puts hundreds of millions of people in the same bucket, so it carries very little. A complete font list frequently narrows the field to single digits on its own.

Peter Eckersley's 2010 Panopticlick study collected 470,161 browser samples. Among them, 83.6% of fingerprints were unique, rising to 94.2% for samples with Flash or Java installed, and the distribution carried at least 18.1 bits of entropy[^eckersley]. Visitors to a test site select themselves, so the share of unique results runs higher than it would across the general population. Even with that caveat, a measurement from sixteen years ago is enough to establish the scale.

## Three reasons the problem resists a clean fix

### Websites need the same data the trackers use

Font lists, screen dimensions, and graphics capability feed real decisions about layout and rendering. Refuse to answer any of it and some sites stop working. Every defence has to trade usability against identifying power, and where it draws that line decides how much it can accomplish.

### Incomplete disguises make you easier to spot

Pierre Laperdrix, writing for the Tor Project, named this the Paradox of Fingerprintable Privacy Enhancing Technologies. His example is an extension that rewrites a batch of values but misses `navigator.platform`, producing a combination of traits that exists nowhere in reality and leaving the user easier to pick out than before[^tor].

### Trackers link fingerprints that have changed

Fingerprints shift as browsers update, screens change, and fonts get installed. A tracker does not need two readings to match exactly; closeness plus continuity in time is enough to attribute both to one machine. Vastel and colleagues collected close to 100,000 fingerprints from more than 1,900 browser instances, and half of those instances changed their fingerprint within five days. Their method still tracked a browser for 54.48 days on average, and past 100 days in some cases[^fpstalker].

Changing one or two signals does not reliably break the link.

## Two defences point in opposite directions

### Uniformity removes the entropy

Report the same value for every user and that signal's identifying power drops to zero. Tor Browser takes this route, reporting one operating system across all platforms, normalising the time zone, and using letterboxing to pad content with grey margins so the viewport snaps to fixed dimensions rather than revealing the screen size[^tor].

It works only if the population is large and genuinely uniform, which is what an anonymity set means. The cost lands on the user: changing settings, installing extensions, or maximising the window all make you stand out from the crowd you depend on.

### Randomization breaks the linkability

Return a different value to every site, in every session. The value still carries information, but two sites cannot line up what they received, which defeats linkability rather than entropy. Brave's farbling and Safari's noise injection both work this way.

Coverage has to be thorough for it to hold. Any signal left untouched becomes a stable anchor that undoes the randomised ones.

### Limiting the answer is a third option

Refuse to answer, or answer coarsely. Firefox disables the `WEBGL_debug_renderer_info` extension outright when `privacy.resistFingerprinting` is on, and Safari reports screen dimensions matching the window and pins the screen position to `(0, 0)`[^webkit].

## What each browser does by default, as of August 2026

| Browser | Default state | Main approach |
|---------|---------------|---------------|
| Tor Browser | Active in normal use | Uniformity |
| Brave | Active in normal windows | Mostly randomization, uniformity for some fields |
| Safari | On in Private Browsing, optional for all browsing | Noise injection plus limited reporting |
| Firefox | On in private windows and Strict mode | Script blocking plus limited reporting |
| Chrome | No built-in protection in normal windows | None |

**Tor Browser** pushes uniformity furthest, and the protection applies to everyone using it. The cost is a fixed window size and a slower connection, in exchange for anonymity at the connection layer that no other browser offers.

**Brave** has used farbling since 2020 to add slight randomization to the output of semi-identifying APIs, with a seed that differs per session and per site[^farbling]. Version `1.93` brought graphics into scope, replacing the WebGL vendor and renderer strings with generic values and adding noise to the WebGL extension list[^brave]. It is on by default in ordinary windows.

**Safari** has shipped advanced fingerprinting protection since `17.0`, adding small amounts of noise to canvas, WebGL readback, and WebAudio. It is on by default in Private Browsing, and a setting extends it to all browsing[^webkit].

**Firefox** added a second layer in version `145`. Known fingerprinting scripts are blocked through the same list that powers Enhanced Tracking Protection, and scripts not on that list are handled by limiting API output instead. Both are on by default in private windows and in Enhanced Tracking Protection's Strict mode. Mozilla's own measurement puts the drop in users seen as unique at close to half, and enabling the protections for everyone is still in progress[^mozilla]. A separate preference, `privacy.resistFingerprinting`, follows Tor Browser's uniformity approach, and it is off unless a user turns it on in `about:config`.

**Chrome** ships no fingerprinting protection in ordinary windows. IP Protection, rolling out from July 2025, applies to Incognito only, masks the IP address in third-party contexts, and explicitly does not address device fingerprinting[^ipprotection]. Privacy Sandbox, launched in 2019 with fingerprinting named as a problem to solve, wound down in April 2025 without shipping a fingerprinting-specific mitigation[^register].

One policy shift is worth holding onto alongside that. On 18 December 2024, Google announced a change to its advertising platform policies that removed the prohibition on device fingerprinting, effective 16 February 2025[^policy]. The UK Information Commissioner's Office (ICO) responded the following day, calling the decision irresponsible and setting out that advertisers deploying fingerprinting still have to demonstrate transparency, freely given consent, and respect for erasure rights under data protection law[^ico].

## Measure your own browser first

[Cover Your Tracks](https://coveryourtracks.eff.org/){target="_blank"} lists what your browser reports and scores the identifying power of each signal. [AmIUnique](https://amiunique.org/){target="_blank"} offers a second sample to compare against.

Two things help when reading the result. The sample comes from people who chose to visit a test site, so the share reported as unique is inflated. The useful part is the per-signal breakdown, because the highest-scoring fields are where a change buys you the most.

On Tor Browser, a result saying you look like everyone else is the expected one. A unique result there means something in the configuration has been altered.

## Three tiers of effort do different amounts of work

Each tier notes what it leaves untouched.

### Low effort

- **Switch to a browser that handles this by default**. Brave works out of the box, Firefox needs Enhanced Tracking Protection set to Strict, and Safari has a setting that extends the advanced protections to all browsing
- **Do not stack up privacy extensions that alter fingerprint values**. A disguise with gaps produces a distinctive combination and works against the goal

Left untouched: any account you sign into. Fingerprinting defences address unnamed cross-site correlation, and signing in tells the site who you are directly.

### Moderate effort

- **Separate purposes across different browsers**. Separate profiles within one browser do nothing here, because the hardware and system signals are identical across them
- **Block third-party scripts** with something like uBlock Origin, which reduces how many parties get to measure you at all
- **Reduce what can be enumerated** by removing fonts and extensions you don't need

This tier handles part of the cross-site correlation. It does not stop first-party measurement by the site you are actually visiting.

### High effort

- **Use Tor Browser and leave the settings alone**, covered in [Tor Browser advanced settings](../tools/tor-browser-advanced.md)
- **Use a separate device** for sensitive work

Left untouched: anything you hand over voluntarily. Changing devices and tools changes what can be correlated, not what a single site accumulates about you.

All three assume your jurisdiction permits the tools. Direct Tor connections are blocked in mainland China and require bridges or another entry method, and in several jurisdictions across the region the use of circumvention tools carries its own risk. [Threat modeling](./threat-model.md) covers how to weigh that.

## Four common measures do nothing for fingerprinting

- **Private or incognito windows** clear local history, cookies, and sign-in state. The fingerprint is computed the same way regardless. Private windows in Safari and Firefox do carry extra protection, and the benefit comes from those protections rather than from private mode itself
- **A VPN** changes the IP address and leaves the fingerprint untouched, covered in [VPNs, their risks and how to choose one](../tools/vpn-guide.md)
- **Editing the User-Agent by hand** usually makes you easier to identify, for the reason given above under incomplete disguises
- **Clearing cookies on a schedule** has no effect on fingerprinting

## This page will go out of date

Browsers ship every few weeks, and defaults and feature names move with them. What is written here is the mechanism and the way to judge a claim; check the current state against each vendor's own documentation. If something no longer matches what you see, tell us in the [community Matrix room](../community/tools.md).

## Where to go from here

- [How platforms collect your data, and the microphone question](./platform-tracking.md) — where device fingerprinting sits in the wider tracking ecosystem
- [Threat modeling](./threat-model.md) — establish who you are defending against before deciding what to spend
- [Maintaining multiple online identities](./multiple-identities.md) — the limits account separation runs into when fingerprinting is in play
- [Tor Browser advanced settings](../tools/tor-browser-advanced.md) — the uniformity approach in practice
- [What surveillance can actually do](./surveillance-capability.md) — fingerprinting placed against the four-layer capability comparison

[^google2019]: [Building a more private web](https://blog.google/products-and-platforms/products/chrome/building-a-more-private-web/){target="_blank"} — Justin Schuh, Google, 22 August 2019. "Unlike cookies, users cannot clear their fingerprint, and therefore cannot control how their information is collected. We think this subverts user choice and is wrong." Verified 2026-08-18.
[^eckersley]: [How Unique Is Your Web Browser?](https://coveryourtracks.eff.org/static/browser-uniqueness.pdf){target="_blank"} — Peter Eckersley, Electronic Frontier Foundation, PETS 2010. Source for the 470,161 samples, the 83.6% unique share, and the 18.1 bits of entropy.
[^tor]: [Browser Fingerprinting: An Introduction and the Challenges Ahead](https://blog.torproject.org/browser-fingerprinting-introduction-and-challenges-ahead/){target="_blank"} — Pierre Laperdrix, The Tor Project, 4 September 2019. Source for the uniformity approach, letterboxing, and the Paradox of Fingerprintable Privacy Enhancing Technologies. The specific measures described there match the Tor Browser version current at the time of writing.
[^fpstalker]: [FP-STALKER: Tracking Browser Fingerprint Evolutions](https://inria.hal.science/hal-01652021v1){target="_blank"} — Vastel, Laperdrix, Rudametkin, and Rouvoy, IEEE S&P 2018. Source for the sample size, the rate of fingerprint change, and the 54.48-day average tracking duration.
[^farbling]: [Fingerprinting Defenses 2.0](https://brave.com/privacy-updates/4-fingerprinting-defenses-2.0/){target="_blank"} — Brave privacy update 4, 2020. Source for the definition of farbling and the seed mechanism.
[^brave]: [Brave improves protections against GPU fingerprinting](https://brave.com/privacy-updates/38-webgl-webgpu-fingerprinting-protections/){target="_blank"} — Brave privacy update 38. Source for the three protections shipped in version `1.93`.
[^webkit]: [Private Browsing 2.0](https://webkit.org/blog/15697/private-browsing-2-0/){target="_blank"} — WebKit Blog, 16 July 2024. Source for Safari's advanced fingerprinting protection from `17.0`, the scope of noise injection, and the screen-dimension normalisation.
[^mozilla]: [Firefox expands fingerprint protections: advancing towards a more private web](https://blog.mozilla.org/en/firefox/fingerprinting-protections/){target="_blank"} — The Mozilla Blog, 10 November 2025. Source for the two layers shipped in Firefox `145`, the modes they are enabled in, and the near-halving of users seen as unique.
[^ipprotection]: [IP Protection](https://github.com/GoogleChrome/ip-protection/blob/main/README.md){target="_blank"} — GoogleChrome/ip-protection explainer. Scope limited to Incognito, masking the IP address in third-party contexts, with device fingerprinting out of scope. Verified 2026-08-18.
[^register]: [Google Chrome lacks browser fingerprinting defenses](https://www.theregister.com/security/2026/04/16/google-chrome-lacks-browser-fingerprinting-defenses/){target="_blank"} — The Register, 16 April 2026. The claim that Privacy Sandbox shipped no fingerprinting mitigation is attributed there to privacy consultant Alexander Hanff; Google declined to comment.
[^policy]: [Google to lift fingerprinting restrictions amid privacy concerns](https://ppc.land/google-to-lift-fingerprinting-restrictions-amid-privacy-concerns/){target="_blank"} — PPC Land, December 2024, for the 18 December 2024 announcement and the 16 February 2025 effective date. [Lukasz Olejnik's analysis](https://blog.lukaszolejnik.com/biggest-privacy-erosion-in-10-years-on-googles-policy-change-towards-fingerprinting/){target="_blank"} covers the removal of the "Google doesn't allow fingerprinting" clause.
[^ico]: [Our response to Google's policy change on fingerprinting](https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2024/12/our-response-to-google-s-policy-change-on-fingerprinting/){target="_blank"} — Information Commissioner's Office, 19 December 2024.
