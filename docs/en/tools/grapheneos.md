---
title: "GrapheneOS: A Hardened Mobile Operating System"
description: GrapheneOS hardens Android substantially and removes the Google binding, making it the most thoroughly hardened mobile operating system available. As Google tightens AOSP and app vendors use attestation to lock out unofficial systems, it keeps a phone you control.
icon: material/cellphone-lock
---

# :material-cellphone-lock: GrapheneOS: A Hardened Mobile Operating System

A phone is the device closest to us: carried everywhere, connected constantly, holding location, contacts, messages, photos, and health records. Stock Android binds to a Google account by default, reports telemetry continuously in the background, and most applications collect identifying information of their own. For taking that device back, deciding for yourself which services it connects to and what leaves it, [GrapheneOS](https://grapheneos.org/){target="_blank"} is what the community most often recommends.

GrapheneOS is a mobile operating system based on the Android Open Source Project (AOSP), substantially hardened and with the Google binding removed, maintained by the non-profit GrapheneOS Foundation and developed in the open. It shrinks the attack surface of an Android phone, reinforces the paths through which data leaks, and returns the choice of whether and how to use Google services to you. Security and privacy are the point, not a nicer home screen.

!!! tip "The short version"

    - **What it is**: a hardened, de-Googled Android operating system, non-profit and open source
    - **What it protects**: a smaller attack surface, Google services confined to a sandbox, per-app network and sensor toggles
    - **What it does not**: GrapheneOS is not an anonymity tool and cannot stop your carrier locating you by cell tower. Anonymity still means [Tor](./what-is-tor.md)
    - **Hardware**: effectively Google Pixel only, since it is the one line offering a re-lockable bootloader, a secure element, and long-term updates together

## What it protects: the core design

The features fall into three groups: shrinking the attack surface, reducing dependence on Google, and accounting for physical and coercion risk. The descriptions below follow the official [features page](https://grapheneos.org/features){target="_blank"}.

### Shrinking the attack surface

- **hardened_malloc**: GrapheneOS's own memory allocator, defending against the most common class of vulnerability, memory corruption, and lowering the chance of compromise from underneath
- **MTE (Memory Tagging Extension)**: an ARM hardware feature that catches memory misuse as it happens, stopping a potential intrusion before it does damage. It requires the ARMv9 chips in Pixel 8 and later. On supported devices it is on by default at the system layer. For third-party apps the global default is off, with MTE forced on regardless for preinstalled apps, apps containing no native code, and apps that opt in, and a toggle under Exploit protection for the rest
- **Vanadium browser**: a hardened Chromium with the JavaScript JIT disabled by default, since just-in-time compilation is a common attack entry point. It can be enabled per site, which is worth doing for the few interaction-heavy pages where the difference is noticeable
- **Verified boot and re-locking the bootloader**: after installation, GrapheneOS walks you through re-locking the bootloader and disabling OEM unlocking, which is what fully enables verified boot, the layer-by-layer check at startup that the system has not been tampered with
- **Auditor app**: uses the phone's secure element to verify the authenticity and integrity of firmware and system at the hardware level

### Reducing dependence on Google

- **No Google services at all by default**: it boots into a system that does not report to Google
- **Sandboxed Google Play**: where Google apps are needed, GrapheneOS runs the entire Google Play services stack (Play services, the Play Store, the services framework) as ordinary unprivileged applications inside the standard app sandbox. The project's own wording is that Google Play receives absolutely no special access or privileges on GrapheneOS
- **Per-app network permission**: cut a single app off the network entirely. The system reports the network as unavailable to it, and indirect network access is blocked as well
- **Per-app sensors permission**: denies an app the accelerometer, gyroscope, compass, barometer, and thermometer, none of which Android controls with a separate permission
- **Storage Scopes and Contact Scopes**: grant an app specific files or specific contacts instead of the whole storage volume or the whole address book. Contact Scopes shows an app an empty address book by default

### Physical and coercion risk

- **Duress PIN or password**: optional and off by default, so it cannot be triggered accidentally. Once configured, entering that second credential at any unlock prompt irreversibly wipes the device, including installed eSIMs, for situations where you are forced to hand the phone over
- **Auto-reboot**: after 18 hours without an unlock, the device reboots into the encrypted before-first-unlock state, where data is considerably harder for forensic tools to extract. The interval is adjustable between 10 minutes and 72 hours, or can be disabled
- **USB-C control**: charging only while locked, by default, narrowing attacks through the port

## What it does not solve: the line at anonymity

The line between privacy and anonymity matters here. GrapheneOS is about privacy and security. It makes your phone harder to compromise and makes it harder for apps to collect data about you. It does not claim to make you anonymous.

Connecting to a carrier's mobile network means identifying yourself to that carrier, and GrapheneOS cannot change that. The only way to avoid cell-tower-level location is airplane mode. Anonymity at the network layer, meaning not revealing your real IP address and not being bound to a browsing identity, still runs through [Tor](./what-is-tor.md). The project states plainly that its built-in DNS-over-TLS is not a substitute for Tor or a VPN.

Read [the difference between anonymity and privacy](../basics/anonymity-vs-privacy.md) first to establish which protection you are after, then use [how to build a threat model](../basics/threat-model.md) to work out who you are defending against. On the desktop side, [Tails vs Whonix vs Qubes](./tails-vs-whonix-vs-qubes.md) covers whole-machine isolation. Mobile OS hardening and desktop anonymity operating systems address different layers and combine according to the threat model.

## Why it is effectively Pixel-only

The hardware requirements are strict and listed in the official [FAQ](https://grapheneos.org/faq){target="_blank"}: an unlockable bootloader that can be re-locked after flashing (re-locking is what fully enables verified boot), a secure element providing a StrongBox keystore and hardware key attestation, A/B slot updates with rollback protection for both firmware and OS, and a long security update commitment from the manufacturer. GrapheneOS requires at least 5 years. Pixel 8 and later carry a 7-year commitment, while the Pixel 6 and 7 series, still on the supported list, carry 5.

Google Pixel is effectively the only consumer phone line meeting all of these. Pixel shipped the Titan M2 secure element from the sixth generation through the Pixel 10 series, with the Pixel 11 series moving to Titan M3. Generations 3 through 5 carried the original Titan M. This is the root of trust for key protection and hardware attestation.

There is an irony worth naming: GrapheneOS runs only on Google's own hardware while the thing it addresses is Google services' reach into the phone. Every policy change Google makes to Pixel and Android lands directly on GrapheneOS, and since Android 17 the tightening has accelerated.

## Since Android 17: Google tightening AOSP and Pixel data

From 2025, Google raised the cost of third-party system development in two steps. In March 2025 it moved Android development to an internal branch, publishing source to AOSP only at release, so the development process is no longer publicly traceable. It remains open source, and the intermediate evolution is no longer visible from outside. Then with the Android 16 release in June 2025, it stopped publishing Pixel device trees, the configuration describing a model's hardware so the system can drive it, leaving third-party developers to reconstruct them.

GrapheneOS still completed its port on 16 June 2026, the day Android 17 was released, so the resilience holds. It has also started looking beyond Pixel, announcing a long-term partnership with Motorola in March 2026, the first hardware option outside the Pixel line. The project has said support is targeted at 2027 hardware, since no 2026 Motorola device meets its requirements. Specific models remain unannounced.

The other pressure is attestation, where apps check in the background whether the phone is in a manufacturer-approved state. Google's Play Integrity treats unofficial systems as failing, which leads some banking and enterprise apps to refuse to run on GrapheneOS even though it is more secure than the stock system.

The full timeline and analysis, covering both tightening steps, the Motorola partnership, and the Microsoft and EU developments, is in [GrapheneOS after Android 17](../blog/posts/2026-grapheneos-android-17.md).

## What this looks like in the Asia-Pacific

- **Getting the hardware**: Pixel is sold officially in Taiwan through the Google Store and local carriers, and availability across the rest of the region varies considerably, with parallel imports still the route in several markets. Check the official [FAQ](https://grapheneos.org/faq){target="_blank"} that the model is supported before buying, and with a used device confirm the bootloader is not permanently locked, which carrier-contract phones commonly are and which cannot be undone
- **App lockout in practice**: banking, government, and enterprise verification apps increasingly use attestation, so some will refuse to run. For anyone whose phone is their primary internet device, the move is worth planning around a list of daily-essential apps first
- **Sideloading restrictions are approaching**: Google is introducing a developer verification requirement for sideloaded applications, announced in August 2025 and enforced through a Play services component on certified devices running Android 7 or later rather than through any single OS version. Requirements take effect on 30 September 2026 in Brazil, Indonesia, Singapore, and Thailand, expanding globally in 2027. Two of the four first-wave countries are in this region, and while Taiwan is not among them, policies like this tend to widen to neighbouring markets
- All three point at the same question: who decides what system runs on a phone you bought, and what you may install on it. GrapheneOS keeps an option open outside the manufacturer's system

## Common questions

??? question "Do I have to buy a Pixel?"

    In practice, currently yes. Only Pixel meets the re-lockable bootloader, secure element, full verified boot, and long-term update requirements together. The Motorola partnership announced in March 2026 may provide options later, without announced models or dates, so using GrapheneOS today means a supported Pixel.

??? question "Can I still use Google Maps and Gmail?"

    Yes, through sandboxed Google Play. You can install the official Google apps, with the difference that the entire Play services stack runs as unprivileged applications in a sandbox with no system-level permissions. You can also install none of it, or install it only in the profiles where you need it.

??? question "Does GrapheneOS make me anonymous?"

    No, and it should not be expected to. It does hardening and de-Googling. Connecting to a mobile network identifies you to the carrier, which is outside what GrapheneOS addresses. For anonymity, combine it with [Tor](./what-is-tor.md) and read [the difference between anonymity and privacy](../basics/anonymity-vs-privacy.md) first.

??? question "Do banking and government apps work?"

    It depends on the category. Messaging, browsing, and most general apps work through sandboxed Google Play. The ones most likely to be blocked are banking, government, and payment apps using attestation such as Play Integrity, which may treat GrapheneOS as failing and refuse to run. Community reports on apps specific to Taiwan are still thin, so the reliable approach is listing the apps you cannot do without, searching the [GrapheneOS forum](https://discuss.grapheneos.org/){target="_blank"} for existing reports, and keeping an old phone available until the critical ones are confirmed working.

??? question "How does it compare with LineageOS, CalyxOS, and /e/OS?"

    The trade-offs differ. GrapheneOS is the most thoroughly hardened and requires re-locking the bootloader on a Pixel to keep the security model intact. CalyxOS takes a practical middle path with microG, an open source reimplementation of Google services, plus a re-locked bootloader. Worth knowing before choosing it: development paused from August 2025 and resumed in July 2026, and it is actively maintained again. LineageOS supports the widest range of devices without equivalent hardening, and on many devices unlocking the bootloader weakens Android's default protections. /e/OS prioritizes keeping older hardware usable and de-Googled defaults, without publishing hardening claims comparable to the others. For the highest security and privacy, GrapheneOS. For broader device support or an easier path, one of the others.

## Next steps

Installation flashes a Pixel from a computer using the official [web installer](https://grapheneos.org/install/web){target="_blank"}, which walks through the steps in the browser, can be retried if something fails partway, will not brick the phone if you follow the steps, and guides you through re-locking the bootloader. Work out your threat model first, then decide whether and how to use sandboxed Google Play.

Hardening the mobile OS is one part of a whole. [Tor](./what-is-tor.md) at the connection layer, [secure messaging compared](./messaging-comparison.md) at the communication layer, and [getting started with password managers](./password-manager.md) at the account layer combine according to your own threat model.

## :material-chat-question: Related concepts

<div class="grid cards" markdown>

- [:material-chat-question: How to build a threat model](../basics/threat-model.md)
- [:material-incognito: The difference between anonymity and privacy](../basics/anonymity-vs-privacy.md)
- [:material-compare-horizontal: Tails vs Whonix vs Qubes](./tails-vs-whonix-vs-qubes.md)

</div>

## :fontawesome-solid-diagram-project: Where to go next

<div class="grid cards" markdown>

- [:material-message-lock-outline: Secure messaging compared](./messaging-comparison.md)
- [:material-key-outline: Getting started with password managers](./password-manager.md)
- [:material-newspaper-variant-outline: GrapheneOS after Android 17](../blog/posts/2026-grapheneos-android-17.md)

</div>
