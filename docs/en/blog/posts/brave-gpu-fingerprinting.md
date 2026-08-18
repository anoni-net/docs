---
date: 2026-08-19
authors:
    - anoni-net
categories:
    - Technology
    - Privacy
slug: brave-gpu-fingerprinting
summary: "Brave 1.93 turns on protection against the graphics-card details WebGL and WebGPU leak. One release uses uniformity and randomization at the same time, and the line between them falls where changing a value would break a site."
description: "Brave 1.93 flattens the graphics-card details leaked through WebGL and WebGPU. This piece takes apart the three protections, explains why uniformity and randomization divide the work between them, and sets the approach against Tor Browser and Firefox."
---

# :material-fingerprint: Brave flattens GPU fingerprints two opposite ways

Open a web page and the JavaScript on it can read your graphics card model, its driver details, and the hardware features it supports. Those answers barely change on a given machine, so a tracking company can combine them with other device traits into an identifier that needs no cookie, asks for no consent, and follows you between sites.

The graphics card is one source among many. Font lists, screen dimensions, time zone, and audio processing all feed the same identifier. [A browser fingerprint cannot be cleared the way a cookie can](../../basics/browser-fingerprinting.md) covers how the whole mechanism works, why clearing cookies does nothing, and where each browser currently stands. This piece stays with the graphics card.

Brave has handled these signals since version `1.93`, on by default on desktop and Android, rolling out in stages[^brave]. Three protections ship together: the WebGL vendor and renderer strings become one generic string shared by every Brave user, the WebGPU hardware description fields are cleared, and the list of supported WebGL extensions gets noise added to it.

The first two make every user look alike. The third makes one user look different on every site. Two opposite techniques arrived in the same release, each assigned to a different API, and where that line falls is also where Brave and Tor Browser part company on fingerprinting.

<!-- more -->

## A graphics card makes an unusually good fingerprint

WebGL and WebGPU give sites hardware-accelerated graphics, which maps, games, and data visualization all depend on. To let a site adapt its rendering to the hardware, both APIs also expose low-level hardware detail to JavaScript.

Three kinds of information are available to a site[^brave]:

- **Vendor and renderer strings**, through the `UNMASKED_VENDOR_WEBGL` and `UNMASKED_RENDERER_WEBGL` parameters that the `WEBGL_debug_renderer_info` extension provides[^mdn]. A site receives something like `ANGLE (Apple, ANGLE Metal Renderer: Apple M5 Max)`, precise down to the chip model. Chrome originally opened this debugging extension for Google Maps, and it ended up callable by any site.
- **The list of supported extensions**, which a WebGL context reports in full. Its contents vary with GPU and driver, and a tracker hashes the whole list into one compact identifier.
- **The WebGPU hardware description**, where the newer API returns the adapter's `vendor`, `architecture`, and `device` fields, for instance `{vendor: 'apple', architecture: 'metal-3'}`.

Graphics cards do not change often, so these values stay stable for years and outlast a cookie. Switch accounts, open a private window, clear the browsing history, and the hardware traits the API reports are the same ones.

Brave ran a small-scale web crawl, analyzing the call stack behind each invocation to see how highly ranked sites use these APIs. The conclusion in Brave's announcement is that for most sites calling them, browser fingerprinting is the only purpose[^brave]. The size of the crawl and the proportions behind that finding are not in the announcement.

## Uniformity and randomization each take different signals

| Signal | What Brave does | Type of technique |
|--------|-----------------|-------------------|
| WebGL vendor and renderer strings | Replaced with one generic string, identical for every Brave user | Uniformity |
| WebGPU adapter description | `vendor`, `architecture`, and `device` cleared | Uniformity |
| WebGL extension list | Noise added, differing per session, per site (eTLD+1), and per storage partition | Randomization |

The third protection reuses farbling, which Brave already had. In the 2020 update that introduced it, the technique is defined as "slightly randomizing the output of semi-identifying browser features, in a way that's difficult for websites to detect, but doesn't break benign, user-serving websites"[^farbling].

## The farbling seed changes per session and per site

How the seed is generated determines what farbling does. On startup the browser generates a random session token, then mixes it with each first-party, top-frame domain it visits through HMAC256, producing a per-domain token that lives as long as the session[^farbling]. Measure the same site twice within one session and the values match exactly; move to another site and they differ; start a new session and all of them change. Third-party frames and scripts inherit the top-level eTLD+1 seed[^farbling], so embedding third-party content offers no way around it.

A fingerprinter hashes many semi-identifying traits into a single identifier, and randomizing any one of them poisons the whole hash. The technique traces back to two research papers, PriVaricator (Nikiforakis and colleagues, WWW 2015) and FPRandom (Laperdrix and colleagues, ESSoS 2017)[^farbling].

## Uniformity everywhere would break feature negotiation

Brave's announcement does not say why the extension list gets randomization instead. Judging by what each API is for, changing the two kinds of data carries very different consequences for a site.

Vendor and renderer strings mostly serve performance tuning and hardware blocklists. When the string a site receives is not in its existing list, the worst outcome is a fall back to the ordinary rendering path. Collapsing the value to a constant drops that field's contribution to a fingerprint to zero at a limited cost.

The extension list serves feature negotiation. A site checks whether a given extension is present before enabling a rendering path or choosing a fallback. Hand it a uniform list that does not match the hardware and the site may pick a path the hardware cannot support, or abandon acceleration that was actually available. That leaves adding noise while preserving usability, which keeps the resulting hash unstable.

The two techniques differ in what they protect against. Uniformity reduces entropy, stripping a trait of its power to distinguish, with every Brave user in the world ideally identical on that field. Added noise undermines linkability instead: the value still carries information, but it differs on every site and every time, so a tracker cannot link what it sees on one site to what it sees on another.

## Tor Browser takes uniformity all the way

Pierre Laperdrix wrote the fingerprinting introduction for the Tor Project in 2019. Its opening position is that all Tor users should have exactly the same fingerprint. The measures described there include reporting one operating system across every platform, normalizing the time zone and screen resolution, and letterboxing, which pads content with gray margins so the viewport snaps to fixed dimensions and a maximized window stops revealing the screen size[^tor].

Laperdrix also names the risk in randomization, citing what Eckersley called the Paradox of Fingerprintable Privacy Enhancing Technologies. His example is an extension that rewrites a batch of values but misses `navigator.platform`, producing a combination of traits that exists nowhere in reality and leaving the user easier to identify than before[^tor]. Randomization done properly needs thorough coverage, which is why Brave keeps extending the list of endpoints farbling touches.

Firefox handles it a third way, in that with `privacy.resistFingerprinting` on, the `WEBGL_debug_renderer_info` extension is disabled outright and a site cannot call it[^mdn]. That preference is off unless a user turns it on in `about:config`, and [A browser fingerprint cannot be cleared the way a cookie can](../../basics/browser-fingerprinting.md) has the full comparison of what each browser does by default. Disabling and returning a generic value each cost something: with the extension gone a site gets nothing and has to handle the empty case, while a generic value is indistinguishable from real hardware and lets the site carry on. Brave chose the latter, consistent with keeping breakage as low as possible. Another position in the announcement is that protection should be on by default rather than hidden behind a special mode or a flag[^brave].

That boundary sits in Brave's own documentation: for users facing targeted attacks, the recommendation in the 2020 farbling update is to switch to Tor Browser[^farbling]. Randomization holds up against broadly deployed commercial tracking, and it provides no anonymity set.

## Which one to use depends on your threat model

For everyday browsing, shipping on by default is the practical value here. Most people will not edit `about:config`, switch to a special mode, or install an extension for privacy, and extensions carry their own security and privacy problems, a point the announcement also makes[^brave]. The protection works from installation, with a threshold close to zero.

Anything that calls for anonymity still calls for Tor Browser, because Brave's randomization addresses cross-site correlation only. The IP address still goes straight to the site, and an observer on the network path still sees where the connection went. Journalists, activists, and anyone handling sensitive material work under a different threat model and pick different tools; [threat modeling](../../basics/threat-model.md) covers how to make that call.

Availability varies by jurisdiction and belongs in the same calculation. Direct Tor connections are blocked in mainland China, where connecting needs bridges or another entry method, and in several jurisdictions across the region the use of circumvention tools carries risk in itself. Brave's fingerprinting protection is a browser feature that touches none of that, and it works from installation.

Anyone using Tor Browser should remember that the uniformity route depends on everyone staying uniform. Installing extensions, maximizing the window, or changing font settings all make you stand out, and [Tor Browser advanced settings](../../tools/tor-browser-advanced.md) covers the specifics. The same action costs little in Brave and undermines the entire premise in Tor Browser.

To see what your own browser gives away, EFF's [Cover Your Tracks](https://coveryourtracks.eff.org/){target="_blank"} lists the WebGL vendor and renderer strings your browser reports along with the identifying power of each trait. Once Brave's update reaches your device in full, both fields collapse to the generic value[^brave].

## Parts of the problem stay open

The list of supported WebGPU extensions is not randomized yet, and Brave's announcement says that change is planned[^brave]. Graphics APIs remain an active area of fingerprinting research, and new leak channels keep appearing.

Brave kept the ability to adjust protection per site while site breakage is still under observation, so a user meeting a site that genuinely will not work can disable graphics protection for that site, disable fingerprinting protection, or turn off Shields entirely[^brave]. Keeping those switches means the trade-off is still live, and neither uniformity nor added noise can guarantee that every site behaves as before.

Fingerprinting does not end with one browser update, and with the graphics card handled, font lists, canvas rendering output, and audio processing traits are all still there. Signals that can safely collapse to a constant should collapse; signals tied to feature negotiation get noise instead. That dividing line works just as well for examining any other tool that claims fingerprinting resistance.

## Where to go from here

- [A browser fingerprint cannot be cleared the way a cookie can](../../basics/browser-fingerprinting.md) — what a fingerprint is made of, why it resists a clean fix, and where each browser stands by default
- [How platforms collect your data, and the microphone question](../../basics/platform-tracking.md) — where device fingerprinting sits in the wider tracking ecosystem
- [Tor Browser advanced settings](../../tools/tor-browser-advanced.md) — fingerprinting resistance and window size in practice
- [Threat modeling](../../basics/threat-model.md) — establish who you are defending against before picking tools

[^brave]: [Brave improves protections against GPU fingerprinting](https://brave.com/privacy-updates/38-webgl-webgpu-fingerprinting-protections/){target="_blank"} — Brave privacy update 38. Source for the three protections, the crawl observation, the compatibility handling, and the plans described here. Verified 2026-08-14.
[^farbling]: [Fingerprinting Defenses 2.0](https://brave.com/privacy-updates/4-fingerprinting-defenses-2.0/){target="_blank"} — Brave privacy update 4, 2020. Source for the definition of farbling, the HMAC256 seed mechanism, and the research lineage. The note that third-party frames inherit the top-level seed also appears in Brave's [Fingerprinting Protections wiki](https://github.com/brave/brave-browser/wiki/Fingerprinting-Protections){target="_blank"}, a page subject to ongoing edits. Verified 2026-08-18.
[^tor]: [Browser Fingerprinting: An Introduction and the Challenges Ahead](https://blog.torproject.org/browser-fingerprinting-introduction-and-challenges-ahead/){target="_blank"} — Pierre Laperdrix, The Tor Project blog, 4 September 2019. Source for the uniformity route, letterboxing, and the Paradox of Fingerprintable Privacy Enhancing Technologies. The specific measures described there match the Tor Browser version current at the time of writing. The paradox itself is credited there to Eckersley, PETS 2010. Verified 2026-08-18.
[^mdn]: [WEBGL_debug_renderer_info](https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_debug_renderer_info){target="_blank"} — MDN Web Docs. Source for the definitions of both constants and for Firefox disabling the extension when `privacy.resistFingerprinting` is true. Verified 2026-08-18.
