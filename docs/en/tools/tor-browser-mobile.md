---
title: Tor on a phone
description: Android has an official Tor Browser from the Tor Project. iOS has none and cannot have one, leaving the community-maintained Onion Browser. How to install each, what to handle on first launch, how to confirm you are actually on Tor, and when to put the phone down and use a computer.
icon: material/cellphone-lock
---

# :material-cellphone-lock: Tor on a phone

You have an `.onion` address, your usual browser refuses to open it, and what you need is Tor. What to install differs by platform, and so does what you get once it is installed.

[What is Tor](./what-is-tor.md) covers the ground this page assumes. Bridges and security levels are in [Tor Browser advanced settings](./tor-browser-advanced.md); this page only covers what is different on a phone.

## The two platforms are not equivalent

Android has a Tor Browser published by the Tor Project itself, running the same Tor engine as the desktop build, with most of its settings present.

iOS has no official build. Apple requires every browser on iOS to render with WebKit, and Tor Browser's fingerprinting defences are built from changes to the browser engine — changes that cannot be made under WebKit. The limit comes from Apple's platform policy rather than from any version lagging behind. The Tor Project therefore points iOS readers to Onion Browser.[^1]

| | Android | iOS |
|---|---|---|
| Official build | Yes, from the Tor Project | No |
| App | Tor Browser for Android | Onion Browser |
| Traffic over Tor | Yes | Yes |
| Fingerprint resistance | Close to desktop | Not achievable under WebKit |
| Requirements | Android 5.0 or newer | As listed on the App Store |

Both route traffic over Tor, so opening an `.onion` address works on either. What differs is whether you also resist fingerprinting while you do it.

## Four ways to get it on Android

The Tor Project names Google Play, F-Droid, its own website, and GetTor.[^2]

**Google Play** is the most direct, and updates arrive through the system. It needs a Google account, and the download is recorded against that account.

**F-Droid** needs no Google account. Install F-Droid, add the Guardian Project repository under **My Apps** → **Repositories**, then search for Tor Browser for Android and install it.[^3]

**The Tor Project website** serves the APK directly, for when the first two are unreachable.

**GetTor** is the last resort for when the website itself is blocked, returning download links over email or another channel.

Which one to use follows from where you are. Avoiding a Google account points you to F-Droid. Under heavier blocking, Google Play and F-Droid may both be unreachable, which is when the website and GetTor matter.

One caveat on the direct APK: the Tor Project's signature verification instructions cover Windows, macOS and Linux, with no Android procedure.[^4] Once you hold an APK there is no documented official way to confirm it has not been altered. Prefer F-Droid or Google Play, where the store carries responsibility for integrity, and treat the direct download as the fallback for when neither is reachable.

## What to handle on first launch

Tor Browser for Android connects on startup. When it cannot, something on the network is usually blocking Tor. The app includes Connection Assist, and bridges can be selected by hand. Which bridge suits which kind of blocking is in [Tor Browser advanced settings](./tor-browser-advanced.md#Bridges-for-where-Tor-is-blocked).

The security level starts at **Standard**. Before raising it to **Safer** or **Safest**, read [what each level does](./tor-browser-advanced.md#The-security-level-slider): the higher you go, the more sites break, and whether that trade is worth making depends on who you are defending against.

## iOS means Onion Browser

Onion Browser is on the App Store, open source, with contributors including Mike Tigas, Benjamin Erhart and the Guardian Project. It is not a Tor Project product.

- Traffic goes over Tor, `.onion` addresses open, and your ISP cannot see which site you reached
- Fingerprint resistance falls short of the desktop browser. The odds of a site matching your browser fingerprint to the same person across visits are higher than on desktop Tor Browser
- Its release cadence is independent of the Tor Project's desktop and Android builds

For reading an `.onion` page on iOS, Onion Browser is enough. For holding an identity that stays unlinked across sessions, iOS cannot offer that guarantee.

## Confirming you are actually on Tor

Open [check.torproject.org](https://check.torproject.org/){target="_blank"}. When you are not on Tor, the page says Sorry. You are not using Tor. and prints your IP address.

Reading the onion edition of this site is worth one extra habit: compare the address in the address bar against the full address printed in the footer, character by character. An `.onion` address carries no certificate authority endorsement, so checking the address is the only verification available, and look-alike phishing addresses are a real technique. [How you are reading this](../about/how-you-are-reading.md) sets out the three editions side by side.

## When to move to a computer

Tor on a phone suits quick lookups and everyday reading. Where your threat model sits at the journalist or activist end, fingerprint resistance and operating-system level isolation both matter, and that calls for desktop Tor Browser or [Tails](./what-is-tails.md).

## Helping others reach Tor is a separate question

Reading over Tor and helping censored users reach Tor are two different activities, and a phone can do the second. The browser-tab version of [Snowflake](./tor-snowflake.md) is a poor fit on a phone, where Android routinely cuts the WebRTC connection once the tab goes to the background. The Tor Project also publishes a standalone Snowflake Volunteer app that runs as a background service and can be limited to Wi-Fi or to while charging, which is how a phone contributes over the long run.

## Where to go from here

With the browser installed, the settings themselves are in [Tor Browser advanced settings](./tor-browser-advanced.md). To work out how far you need to go, start from [threat modeling](../basics/threat-model.md).

## :material-chat-question: Related reading

<div class="grid cards" markdown>

- [:material-chat-question: What is Tor](./what-is-tor.md)
- [:material-cog-outline: Tor Browser advanced settings](./tor-browser-advanced.md)
- [:material-routes: How you are reading this](../about/how-you-are-reading.md)

</div>

## :fontawesome-solid-diagram-project: Projects you can join

<div class="grid cards" markdown>

- [:material-snowflake: Tor Snowflake bridges](./tor-snowflake.md)
- [:material-server-network: Running a Tor relay](../community/setup-tor-relay.md)
- [:material-translate-variant: Translation and localisation](../community/i18n.md)

</div>

[^1]: [Can I run Tor Browser on an iOS device?](https://support.torproject.org/tormobile/tormobile-3/){target="_blank"} — Tor Project Support. "Apple requires browsers on iOS to use something called Webkit, which prevents Onion Browser from having the same privacy protections as Tor Browser."
[^2]: [Tor Browser for Android](https://support.torproject.org/mobile-tor/){target="_blank"} — Tor Project Support. "Tor Browser for Android is available on the Play Store, F-Droid, the Tor Project website and GetTor", requiring Android 5.0 or newer.
[^3]: [How do I install Tor Browser for Android from F-Droid?](https://support.torproject.org/tormobile/tormobile-7/){target="_blank"} — Tor Project Support, including the step of adding the Guardian Project repository.
[^4]: [How can I verify Tor Browser's signature?](https://support.torproject.org/tbb/how-to-verify-signature/){target="_blank"} — Tor Project Support, which covers Windows, macOS and GNU/Linux only.
