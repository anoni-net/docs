---
title: What your browser gives away
description: A demonstration page listing what any website can read without asking, alongside how Tor Browser normalises each item. Everything is read in your browser, nothing is sent and nothing is stored.
icon: material/eye-outline
---

# :material-eye-outline: What your browser gives away

Everything below was available to this site the moment you opened the page, without asking you and without needing your consent. Any website gets the same.

<div id="leaks-tool"></div>

<script src="../../js/leaks.js"></script>

## When this helps

A new phone, a fresh reinstall, or someone telling you a particular browser is safer without explaining how. This page gives you something you can check yourself.

- **After leaving a relationship where you were monitored**, you have a new device and want to know whether you still look like the person you were. Open this page and note the short code at the top, then open it on the old device and compare. Different codes mean the two devices do not match on fingerprinting.
- **After a digital security workshop** where the trainer said Tor Browser is safer but did not say how. Note the time zone and fonts in your usual browser, then open the same page in Tor Browser. The time zone becomes UTC and the font list collapses to one set. You see the difference yourself.
- **Explaining to someone else why this matters**: Having this page open beats a slide deck. Every number on screen came from their own device.

## Individually dull, collectively identifying

Each item above looks ordinary on its own. There are dozens of time zones, hundreds of screen sizes, thousands of font combinations. They multiply. A few of them together take the pool of people you could be from millions down to dozens, and adding the times and order of your visits often leaves one.

This is browser fingerprinting. It needs no cookies and clearing your browsing data does not remove it, because those values live on your device to begin with. For how it works, see [browser fingerprinting](../basics/browser-fingerprinting.md).

## Open this again in another browser

Comparison is what makes this page useful, and there are two ways to do it.

The eight-character code at the top folds together the stable values below it. **Open the same page in another browser and compare the code** to see whether anything changed. Values that drift, such as window size and storage quota, are left out, so the same browser gives the same code every time. The code is itself an identifier: these values together are enough to recognise you.

To find out which item changed, read the reference line under each value. The time zone entry says "Tor Browser shows: UTC" rather than "this gets normalised", so you can check it on the spot.

Open this page in [Tor Browser](../tools/what-is-tor.md) and the time zone really does become UTC, the language en-US, the graphics card a generic string, and the font list one fixed set. Tor Browser normalises every user so they all look alike, and sites cannot tell them apart.

To adjust that behaviour, see [Tor Browser advanced settings](../tools/tor-browser-advanced.md).

## When to come back to this page

Fingerprints change, and usually without telling you. Moments worth checking the short code again:

- **After a new device or a clean install**: confirm whether the old and new machines look like the same person to a site
- **After leaving a monitored relationship**: the other person may remember the old code, and the new device needs to not match it
- **After installing a browser extension**: extensions change how pages behave, and some change the fingerprint outright
- **After changing system language, time zone or screen resolution**: all three feed the short code
- **Before explaining to someone why any of this matters**: every number on screen comes from their own device

The code is eight characters. Writing it on paper or in a note is enough, and there is no need to keep the whole page of values. Clicking the code selects all of it, the copying is yours to do, and this page never touches the clipboard.

## We are not collecting any of this

This page is deliberately built as a fingerprint collector, so you should be asking.

The answer: every value appears on screen and nowhere else. Nothing is sent and nothing is written to storage. The [code is here](https://github.com/anoni-net/docs/blob/main/docs/zh-TW/js/leaks.js){target="_blank"}, and one test scans that source specifically, turning CI red if any means of sending data or writing to storage appears in it.

### About the two requests you will see in devtools

Open the network tab and the clearnet build contacts two places.

**A subdomain of anoni.net** is our self-hosted Umami. It records which page was viewed, where the visit came from, the broad category of browser and operating system, a bucketed screen size, the country, and how fast the page loaded. It sets no cookies and does no cross-site tracking.

The screen size only became genuinely bucketed on 2026-08-23. This page had said "bucketed" for a while before that, while the exact width and height were what actually went out. Now every value is rounded down to the nearest hundred before sending, so 1440x900 leaves as 1400x900. This page explains that screen resolution is part of a fingerprint, which is inconsistent with collecting the exact value ourselves.

Load speed started on the same day. It covers a few standard measurements: First Contentful Paint, Largest Contentful Paint, and Cumulative Layout Shift. The English search index is 1.8 MB, and the first time you press search you download all of it. On a constrained or high-latency connection the wait is substantial, and right now there is no number to say whether reducing it is worthwhile.

Every record also carries a build tag such as `21eb17c`, the commit that produced the page you are reading. It keeps figures from before and after a change apart, so when load times get worse we can trace which change caused it. The tag says nothing about you. Every reader of the same build shares it.

**static.cloudflareinsights.com** is Cloudflare Web Analytics. Also traffic statistics, but third party: the data goes to Cloudflare rather than to our machine. The site already sits behind Cloudflare, so that company sees your request regardless; what this beacon adds for them is page-level performance and view counts.

Neither reads any of the values listed on this page.

### What we do send about your device and usage

To the self-hosted endpoint, each full page load sends one extra value, the "Display mode" row in the table above: whether you are reading in a browser tab or have installed the site as an app. That single enumerated value is all that goes, with no other fields.

Why we want the number: interface decisions depend on it. A standalone window has no address bar, which removes one of the cues for judging whether a link is genuine, so the wording in tools like the QR code reader and the invisible character detector has to carry more weight. How much content offline reading should store by default also depends on how many people genuinely use the site as an app. Without the number those decisions are guesswork.

The cost, stated plainly: few people install a site as an app, so the value on its own is a fairly distinguishing signal, the same kind of thing as everything else in the table. That is exactly why it is listed there rather than hidden.

#### How the tools are used

The Utilities section sends seven further events. They all serve the same purpose: knowing what is broken and where to spend effort. What goes out is always a fixed code, never a filename, a URL, or anything you typed or decoded.

| Event | When | Value |
|---|---|---|
| `stripmeta-ok` | Metadata stripping succeeded | A format code |
| `stripmeta-unsupported` | The metadata stripper meets a format it cannot handle | A format code such as `heic`, `pdf`, `unknown` |
| `stripmeta-verify-fail` | A cleaned file will not open | A format code |
| `qrread-fail` | A QR code could not be read | `cantOpen` or `notFound`, plus a format code |
| `qrread-kind` | A QR code was read | A coarse category of the contents, see below |
| `offline-action` | An action on the offline reading page | `add`, `remove`, `clear`, `auto-on`, `auto-off`, `images-on`, `images-off` |
| `display-mode` | Each full page load | The display mode described above |

A recent example shows why the numbers matter. For a while the QR code reader failed completely on HEIC photos from an iPhone. The screen said "No QR code found", so people cropped and re-shot the picture, which could never work, because the image had never been decoded at all. Nobody knew how long that had been happening until someone reported it. `qrread-fail` counts "the browser could not open the image" separately from "the image really has no code", so the next occurrence surfaces on its own.

`stripmeta-unsupported` answers whether HEIC support is worth building. The code already recognises the format and simply declines it, and that information used to be discarded.

`stripmeta-ok` was added on 2026-08-23 to serve as the denominator. Before it, only failures were counted, so "30 unsupported this month" gave no basis for judging whether that was a high or low share. A success count is what makes a failure rate computable.

The offline actions decide defaults. Automatic storage is on by default with a budget of about 29.5 MB. How many people turn it off, and how many press clear, tells us directly whether those two defaults are right.

#### The content categories are deliberately coarse

`qrread-kind` sends a category rather than the actual protocol:

| Category | Covers |
|---|---|
| `credential` | Two-factor secrets, Wi-Fi passwords |
| `network` | Onion addresses, Tor bridges |
| `contact` | Contacts, email, SMS, telephone |
| `location` | Coordinates |
| `link` | Ordinary URLs |
| `danger` | Protocols that execute directly |
| `text` | Everything else |

The merging is deliberate. Sent as exact types, one `otp` event would mean "this person just scanned a two-factor secret" and one `wifi` event would mean "this person is joining a network". Merged into `credential`, the question we need answered (which category needs better explanation) has the same answer, while a single event no longer points at a specific situation.

`danger` stays on its own: how often people scan a directly-executing protocol is itself a safety signal.

#### Five site-wide events

Five more started on 2026-08-23. These answer how the documentation itself should be written.

| Event | When it is sent | Value |
|---|---|---|
| `search-used` | Someone used site search | Length bucket `short`, `medium`, `long` |
| `search-zero` | That search returned nothing | Same |
| `search-hit` | A search result was clicked | `first`, `top3`, `rest` |
| `lang-switch` | The language menu was used | Source and target language codes |
| `read-depth` | You reached a quarter, half, three quarters, or the bottom | `25`, `50`, `75`, `100` |

Not a single character of your search terms is sent. You might be searching for "Great Firewall" or "circumvention", and a record of that is a risk wherever it sits, including in our own database. A length bucket is enough to answer whether the index is usable, and the terms themselves would answer nothing further. The share of zero-result searches indicates which content is missing, and click position reflects whether the ranking is sound.

Switch counts are the only signal that tells us whether a translation is being read at all, because the site ignores your browser's language setting and follows only what you picked. Readers moving from one language to another usually means the translation or the terminology has a problem, which is a pointer back to the content.

Read depth answers whether an article should be split. Pages shorter than the viewport are skipped, since such a page is at the bottom the moment it loads and counting it would only inflate the average.

#### Staying out of the count

On the clearnet build you can simply switch it off. The button below writes `umami.disabled` into this device's localStorage, and the Umami script checks that key before every send, refusing to send anything while it is set. The setting stays on this device, and clearing browser data resets it.

<div id="anoni-optout"></div>

If you see no button, you are most likely reading the onion build, which never loads the analytics script at all, so there is nothing to switch off.

Three further ways. Turn the network off and open the page again; with no connection there are no requests at all. Use [Tor Browser](../tools/what-is-tor.md) at the Safest level, where JavaScript is off and neither this page nor the analytics runs. Or use the onion build, which loads no analytics.

If your browser sends Do Not Track or Global Privacy Control, we send nothing at all as of 2026-08-23. The section "Think before enabling Do Not Track and GPC" below has the details.

No tool calls the analytics directly. They all go through one shared entry point, and that entry point lives in the same block as the analytics script, which the onion and IPFS builds strip out entirely. In those builds the tools have no way to send anything.

### The search-term leak we fixed

Before 2026-08-23, clicking through from a site search result carried what you had typed into our analytics database.

Two individually reasonable defaults combined. The documentation site has search highlighting enabled, so Material writes the matched terms into the `?h=` parameter of every search result link. Umami sends the full URL by default, including the query parameters after the question mark. Together they carried your search terms out of your browser.

Every record now passes an allowlist before it is sent. A URL keeps only four campaign parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`), every other query parameter and anything after `#` is stripped, and any event whose name or values fall outside the list is dropped whole. The allowlist lives in [main.html](https://github.com/anoni-net/docs/blob/main/docs/overrides/main.html){target="_blank"}, and a [test](https://github.com/anoni-net/docs/blob/main/tools/test_before_send.mjs){target="_blank"} checks it line by line, starting with the leak described above.

Records from before 2026-08-23 still hold those search terms. What to do about them has not been decided.

### The onion build has none of this

The onion build strips the whole analytics block, so neither the self-hosted analytics nor the Cloudflare beacon is present, and no display mode is sent.

Before 2026-08-23 the Cloudflare beacon sat outside the block that gets stripped, so the onion build loaded it anyway. That contradicted what this page said about the onion build loading no analytics. It was our oversight and it has been corrected.

### Counting visitors and identifying them

One site can both count how many people visited and identify who you are, and the first needs far less data than the second, which is the distinction that matters.

## What you can actually do

Of the fifteen items above, only three are ones you can switch off on your own device. Ordinary browsers offer no control over the rest, because those values are part of how the web platform works.

Menu paths shift between system and browser versions. Searching the settings for a keyword is usually faster than following a path.

### The single most effective step is changing browser

One action covers more items than anything else: use a browser with built-in defences. Three choices, for three situations:

| Your situation | Choice | Cost |
|---|---|---|
| An adversary able to spend resources on a specific target | [Tor Browser](../tools/what-is-tor.md) | Slower connections, some sites refuse to load |
| Leaving fewer traces in everyday browsing | Brave | Noise or normalisation for canvas, WebGL, fonts and audio, far less disruption |
| Staying on the Firefox you already use | Turn on `privacy.resistFingerprinting` | Only reachable through `about:config`, and it breaks the layout of some sites |


[Tor Browser](../tools/what-is-tor.md) normalises nearly every item above, at the cost of slower connections and some sites refusing to load. Brave adds noise or normalisation for canvas, WebGL, fonts and audio, with far less disruption to everyday browsing. Firefox has `privacy.resistFingerprinting`, close to Tor Browser's approach. It only appears if you type `about:config` into the address bar, and it is off by default. That settings page opens with a warning of its own, and changing other entries there can affect how the browser behaves elsewhere, so if `about:config` is unfamiliar territory, Tor Browser or Brave is the simpler route. Enabling it also breaks the layout of some sites.

The comparison in [browser fingerprinting](../basics/browser-fingerprinting.md) is worth reading first.

### Turning off location

This is the only item that raises a permission prompt, and the only one you can disable at system level.

=== "iOS and iPadOS"

    Settings → Privacy & Security → Location Services → find your browser → Never.

    Turning Location Services off entirely also works, but Maps and photo location tagging go with it.

=== "Android"

    Settings → Apps → your browser → Permissions → Location → Don't allow.

    Also inside the browser: Settings → Site settings → Location → off.

=== "macOS"

    System Settings → Privacy & Security → Location Services → untick your browser.

=== "Windows"

    Settings → Privacy & security → Location → turn off "Let apps access your location".

=== "Linux"

    Most desktop environments have no system-level location service, so the browser's own permission is all there is. The icon at the left of the address bar revokes permissions already granted.

Whatever the system setting, the browser asks every time. Decline, and the choice is remembered.

### Changing language preferences

The language list you send is yours to set, and narrowing it to one language leaks a little less.

=== "Chrome and Edge"

    Settings → Languages → remove the ones you do not need, leaving one.

=== "Firefox"

    Settings → General → scroll to Language → Choose → leave one.

=== "Safari"

    Safari follows the system language. On macOS: System Settings → General → Language & Region. On iOS: Settings → General → Language & Region.

The cost is that multilingual sites may serve you a version you did not want.

### Think before enabling Do Not Track and GPC

Both signals are switchable in browser settings, but **enabling them may not work in your favour**.

Almost nothing honours Do Not Track in practice, and relatively few people send it, so it becomes a distinguishing feature instead. Global Privacy Control carries legal weight in several US states and behaves much like DNT elsewhere.

This site honours both as of 2026-08-23. With either signal on, our analytics sends nothing at all. Most other sites will not follow suit, so elsewhere the signal usually leaves you with only that distinguishing feature.

If you want them: Chrome under Settings → Privacy and security, Firefox under Settings → Privacy & Security. Safari has removed the option.

### Time zone and system preferences are changeable but costly

Time zone follows the operating system. Setting it to UTC does remove one signal, and it also makes every app show the wrong time. Dark mode and reduced motion are accessibility settings, and turning them off affects your daily use directly.

For these two, the right answer is a browser that normalises them, not giving up how you use your device.

### Why the rest cannot be switched off

Screen resolution, CPU core count, graphics card model, the rendering differences behind canvas and audio, which fonts you have, Client Hints, sub-pixel element geometry: none of these has a switch, because they are capabilities the web platform hands to sites rather than something a user can disable individually. Drawing requires the graphics card to report what it can do, and laying out text requires measuring it.

Removing those capabilities breaks sites, so browsers do not let you turn them off individually. Browsers with defences take a different route: rather than removing the capability, they make everyone report the same value, or add noise that differs every session.

## Two things left out on purpose

### No export button

Such a file would be a complete fingerprint sitting on your device, which is worse than not having it. Compare by reading, or copy down a few values yourself.

### No uniqueness percentage

A figure like "you are more unique than 99.x% of visitors" requires a population database to compute. We do not have one, and we are not going to start collecting visitor data to build it. For that kind of statistic, [EFF's Cover Your Tracks](https://coveryourtracks.eff.org/){target="_blank"} is the long-running research project on the subject.

## About the location item

Location is the only one behind a button, because it triggers a permission prompt. Everything else is readable without asking.

Pressing it shows your latitude, longitude and accuracy, usually within a few tens of metres. Those numbers stay on screen like the rest and disappear on reload. Tor Browser disables the API outright and never asks.

## Works offline

Like the rest of this section, the code is stored on your device and runs without a network. Every item listed here is read from your own device, and it still reads with the network off.

To take this page with you, see [offline reading](../offline.md).
