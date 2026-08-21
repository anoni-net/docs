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

The eight-character code at the top folds together the stable values below it. **Open the same page in another browser and compare only that code** to see whether anything changed. Values that drift, such as window size and storage quota, are left out, so the same browser gives the same code every time. That code is itself an identifier, which is exactly the point: these values together are enough to recognise you.

To find out which item changed, read the reference line under each value. The time zone entry says "Tor Browser shows: UTC" rather than "this gets normalised", so you can check it on the spot.

Open this page in [Tor Browser](../tools/what-is-tor.md) and the time zone really does become UTC, the language en-US, the graphics card a generic string, and the font list one fixed set. Tor Browser is not withholding something from you: it makes every user look alike, so sites cannot tell them apart.

To adjust that behaviour, see [Tor Browser advanced settings](../tools/tor-browser-advanced.md).

## We are not collecting any of this

This page is deliberately built as a fingerprint collector, so you should be asking.

The answer: every value appears on screen and nowhere else. Nothing is sent and nothing is written to storage. The [code is here](https://github.com/anoni-net/docs/blob/main/docs/zh-TW/js/leaks.js){target="_blank"}, and one test scans that source specifically, turning CI red if any means of sending data or writing to storage appears in it.

### About the requests you will see in devtools

Open the network tab and you will find this page contacting a subdomain of anoni.net. That is our self-hosted site analytics, and it records that someone viewed a page. It has nothing to do with the values above: it neither receives them nor wants them. The onion build loads no analytics at all, so that version does not even make this one request.

Telling those two apart is exactly what this page is for. One site can both count how many people visited and identify who you are, and the first needs far less data than the second. To avoid the question entirely, turn the network off and use this page then. No requests happen at all.

## What you can actually do

Of the fifteen items above, only three are ones you can switch off on your own device. Ordinary browsers offer no control over the rest. That is not an oversight on our part: those values are part of how the web platform works.

Menu paths shift between system and browser versions. Searching the settings for a keyword is usually faster than following a path.

### The single most effective step is changing browser

One action covers more items than anything else: use a browser with built-in defences.

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

If you want them: Chrome under Settings → Privacy and security, Firefox under Settings → Privacy & Security. Safari has removed the option.

### Time zone and system preferences are changeable but costly

Time zone follows the operating system. Setting it to UTC does remove one signal, and it also makes every app show the wrong time. Dark mode and reduced motion are accessibility settings, and turning them off affects your daily use directly.

For these two, the right answer is a browser that normalises them, not giving up how you use your device.

### Why the rest cannot be switched off

Screen resolution, CPU core count, graphics card model, the rendering differences behind canvas and audio, which fonts you have, Client Hints, sub-pixel element geometry: none of these has a switch, because they are not settings. They are capabilities the web platform hands to sites. Drawing needs to know what the graphics card can do; laying out text needs to measure it.

Removing those capabilities breaks sites, so browsers do not let you turn them off individually. Browsers with defences take a different route: rather than removing the capability, they make everyone report the same value, or add noise that differs every session. That is what the "Tor Browser shows" line under each item describes.

## Two things left out on purpose

### No export button

Such a file would be a complete fingerprint sitting on your device, which is worse than not having it. Compare by reading, or copy down a few values yourself.

### No uniqueness percentage

A figure like "you are more unique than 99.x% of visitors" requires a population database to compute. We do not have one, and we are not going to start collecting visitor data to build it. For that kind of statistic, [EFF's Cover Your Tracks](https://coveryourtracks.eff.org/){target="_blank"} is the long-running research project on the subject.

## About the location item

Location is the only one behind a button, because it triggers a permission prompt. Everything else is readable without asking, which is the point this page is making.

Pressing it shows your latitude, longitude and accuracy, usually within a few tens of metres. Those numbers stay on screen like the rest and disappear on reload. Tor Browser disables the API outright and never asks.

## Works offline

Like the rest of this section, the code is stored on your device and runs without a network. Every item listed here is read from your own device, and it still reads with the network off, which is the most direct proof that none of these values are being sent anywhere.

To take this page with you, see [offline reading](../offline.md).
