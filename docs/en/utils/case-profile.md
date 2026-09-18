---
title: The ads seem to know what you are thinking
description: Something you looked at elsewhere turns up in your feed shortly afterwards. This walkthrough moves attention away from the microphone and uses two tools to let you see it for yourself: what any website receives without asking, why those values together are enough to recognise you, and whose identifier rides along on the end of every link you tap.
icon: material/target-account
---

# :material-target-account: The ads seem to know what you are thinking

## Accurate to an uncomfortable degree

Last week you mentioned a brand of shoes to a friend, and for the past few days your feed has kept showing them. You did not search for them and you did not open a single related page.

The first thought is usually that the phone is listening. That explanation is intuitive, and it is also the one with the least evidence behind it. [How platforms collect your data](../basics/platform-tracking.md) covers what the research actually found and what putting your attention on the microphone costs you. The short version: none of this requires a microphone, and the alternatives are far cheaper to run.

This page does something else. Rather than guessing whether anyone is listening, open a page and see for yourself what they actually receive.

## Handed over on page load, without a prompt

Open [What your browser gives away](leaks.md). Every item listed there reaches a website the moment you open a page, without asking you and without needing your consent. Every website receives the same things.

The list holds your operating system, browser version, screen dimensions, time zone, language, graphics card model, which fonts are installed, and battery status. Individually none of it stands out, and hundreds of millions of people share your operating system.

## Together they identify a person

Look at the eight-character short code at the top. It is computed from several of the stable values above.

The same browser produces the same code every time you open the page. Without logging in and without accepting a single cookie, those values already give you an identifier that follows you. That is the skeleton of a profile, and your behaviour across different sites can be strung onto the same code.

What an ad system wants is an identifier that connects "the person who looked at shoes last week" with "the person reading this feed now". Your name is of no use to it.

## Open it again in a different browser

Comparison is what makes this page useful.

Open the same page in another browser and see whether the short code changes. To find out which value moved, each item has a reference line underneath stating what Tor Browser reports instead.

Open it in [Tor Browser](../tools/what-is-tor.md) and the time zone becomes UTC, the language becomes en-US, the graphics card becomes a generic string, and the font list narrows to one fixed set. Its approach is to make every user look identical so sites cannot tell them apart. That works better than switching features off one by one, because switching something off is itself a distinguishing trait, and the more you disable the more recognisable you become.

For how it all works, see [browser fingerprinting](../basics/browser-fingerprinting.md).

## Links carry identifiers too

The other half of a profile lives in URLs.

Paste any link you received recently into the [URL cleaner](clean-url.md) and it pulls out the tracking parameters, naming who does the tracking in each case. Links copied out of social platforms are the clearest example, often trailing a long string of identifiers.

What that string does is record who handed the link to whom. Clean it before forwarding, otherwise passing it on adds your own hand to the chain.

## What this page cannot prove

The list covers what a website can receive, not who actually took it or what they did with it. Reading it does not mean you are being tracked, and it does not mean you are not.

That page collects none of the values it lists. The computation happens in your browser and nothing survives closing the tab.

For what to adjust once you know what is available, see [what an ordinary person should actually do](../scenarios/everyday-baseline.md), which ranks measures by real effect and names the ones that are overrated.

## The same path applies well beyond advertising

The same order works for any "how did it know" moment:

- A new device where the login page claims to recognise you
- Recommendations about you appearing while logged out
- Two accounts that never added each other being linked by a platform
- Simply wanting to know how identifiable you are on a given site

Both tools run in your browser and send nothing out. Once the pages are saved to your device they work without a network connection. See [offline reading](../offline.md).
