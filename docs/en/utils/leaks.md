---
title: What your browser gives away
description: A demonstration page listing what any website can read without asking, alongside how Tor Browser normalises each item. Everything is read in your browser, nothing is sent and nothing is stored.
icon: material/eye-outline
---

# :material-eye-outline: What your browser gives away

Everything below was available to this site the moment you opened the page, without asking you and without needing your consent. Any website gets the same.

<div id="leaks-tool"></div>

<script src="../../js/leaks.js"></script>

## Individually dull, collectively identifying

Each item above looks ordinary on its own. There are dozens of time zones, hundreds of screen sizes, thousands of font combinations. They multiply. A few of them together take the pool of people you could be from millions down to dozens, and adding the times and order of your visits often leaves one.

This is browser fingerprinting. It needs no cookies and clearing your browsing data does not remove it, because those values live on your device to begin with. For how it works, see [browser fingerprinting](../basics/browser-fingerprinting.md).

## Open this again in another browser

Comparison is what makes this page useful. Look at it in your usual browser, note a few values, then open the same page in [Tor Browser](../tools/what-is-tor.md).

The time zone becomes UTC, the language becomes en-US, the graphics card turns into a generic string, and the font list shrinks to a fixed set. Tor Browser is not withholding something from you: it makes every user look alike, so sites cannot tell them apart. Each item is annotated with what it does.

To adjust that behaviour, see [Tor Browser advanced settings](../tools/tor-browser-advanced.md).

## We are not collecting any of this

This page is deliberately built as a fingerprint collector, so you should be asking.

The answer: every value appears on screen and nowhere else. Nothing is sent and nothing is written to storage. The [code is here](https://github.com/anoni-net/docs/blob/main/docs/zh-TW/js/leaks.js){target="_blank"}, and one test scans that source specifically, turning CI red if any means of sending data or writing to storage appears in it.

As with the rest of this section, the page still works with the network off, which is itself the proof that nothing is going out.

### About the requests you will see in devtools

Open the network tab and you will find this page contacting `aa.anoni.net`. That is our self-hosted site analytics, and it records that someone viewed a page. It has nothing to do with the values above: it neither receives them nor wants them.

Telling those two apart is exactly what this page is for. One site can both count how many people visited and identify who you are, and the first needs far less data than the second. To avoid the question entirely, turn the network off and use this page then. No requests happen at all.

## Two things left out on purpose

### No export button

Such a file would be a complete fingerprint sitting on your device, which is worse than not having it. Compare by reading, or copy down a few values yourself.

### No uniqueness percentage

A figure like "you are more unique than 99.x% of visitors" requires a population database to compute. We do not have one, and we are not going to start collecting visitor data to build it. For that kind of statistic, [EFF's Cover Your Tracks](https://coveryourtracks.eff.org/){target="_blank"} is the long-running research project on the subject.

## About the location item

Location is the only one behind a button, because it triggers a permission prompt. Everything else is readable without asking, which is the point this page is making.

Pressing it shows your latitude, longitude and accuracy, usually within a few tens of metres. Those numbers stay on screen like the rest and disappear on reload. Tor Browser disables the API outright and never asks.
