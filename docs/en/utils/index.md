---
title: Utilities
subtitle: Offline browser tools and 3D interactives
description: Small tools that run in your browser. Nothing is sent anywhere, and once stored on your device they work with the network off.
icon: material/tools
---

# :material-tools: Utilities

The articles on this site explain how to protect yourself. This section holds the tools you can use directly. Four rules apply to all of them:

- Everything is computed in your browser, and nothing is sent anywhere
- Once stored on your device they work with the network off, and working offline is itself the proof that nothing is being sent
- The source is in [anoni-net/docs](https://github.com/anoni-net/docs/tree/main/docs/zh-TW/js){target="_blank"}, so anyone who can read code can verify it
- All of them need JavaScript enabled, because the computation happens on your device

## One conflict to know about if you use Tor Browser

Setting [Tor Browser's security level](../tools/tor-browser-advanced.md) to Safest disables JavaScript entirely, and the tools in this section stop responding.

The conflict is that the same page's guidance is to raise the level for "unfamiliar onion sites, links of unknown origin, unfamiliar domains", and receiving a suspicious link is exactly when you would want the [invisible character detector](invisible.md) or the [QR code reader](qr-read.md).

Handle the two separately. Open the suspicious site at the higher level, copy out the text or image you want to check, switch back to Standard to examine it, then raise the level again. The tools here make no outbound connections, so opening them at Standard does not add to your exposure on that site.

## Available now

<div class="grid cards" markdown>

-   :material-clipboard-check-outline: **[Threat model checklist](threat-model.md)**

    Turn your answers to the three questions (what you are protecting, who from, what you will spend) into a copyable checklist, with the mismatches flagged. Nothing is saved, and reloading clears it.

-   :material-card-text-outline: **[Shutdown response card](shutdown-card.md)**

    Fill in who you need to reach during a network outage, over which channels, where to meet, and how long to wait before acting. Print four copies on one sheet and cut them apart. Where the draft is kept is your choice.

-   :material-dice-multiple-outline: **[Passphrase and password generator](passphrase.md)**

    Draw a passphrase from the 7776-word asian-diceware list, or a random password from the character sets you pick. Randomness comes from the browser's `crypto.getRandomValues`, and the tool tells you how much entropy you got.

-   :material-qrcode: **[QR code generator](qrcode.md)**

    Turn onion addresses, Tor bridges and other long, easily mistyped strings into a QR code the person in front of you can read with a camera, without anything passing through a server. Downloadable as SVG for printing.

-   :material-qrcode-scan: **[QR code reader](qr-read.md)**

    Read what is inside a QR code image without the image leaving your device. URLs get their hostname shown separately, and there is no open button.

-   :material-image-off-outline: **[File metadata remover](strip-metadata.md)**

    Strip EXIF, GPS, device model, authoring software and comment fields from photos, videos and PDFs without the file leaving your device. For photos and videos not one byte of compressed data is touched, and every segment kept or removed is listed for you.

-   :material-link-variant-off: **[URL cleaner](clean-url.md)**

    Pick out and remove the tracking parameters in a URL, each annotated with who is doing the tracking. Unwraps Google and Facebook redirect wrappers too.

-   :material-format-letter-matches: **[Invisible character detector](invisible.md)**

    Find zero-width characters, bidirectional controls and homoglyphs hiding in text, with positions marked and each class explained. Both document leak tracking and phishing URLs rely on these.

-   :material-eye-outline: **[What your browser gives away](leaks.md)**

    Lists what any site can read without asking, annotated with how Tor Browser normalises each one. Open it in a second browser to see what those defences actually do.

</div>

## Taking them offline

The code and data behind these tools are stored along with the page. Tick this section in the [offline reading](../offline.md) list and the pages will open without a network afterwards.

## Whose code this uses

Most of the code in this section is our own, under [anoni-net/docs](https://github.com/anoni-net/docs/tree/main/docs/zh-TW/js){target="_blank"}. Four things come from elsewhere, included unmodified:

| Component | Used by | Licence | Where the licence text is |
|---|---|---|---|
| [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator){target="_blank"} 1.4.4 | [QR code generator](qrcode.md) | MIT | [the header at the top of the file](vendor/qrcode-generator.js) |
| [jsQR](https://github.com/cozmo/jsQR){target="_blank"} 1.4.0 | [QR code reader](qr-read.md) | Apache-2.0 | [jsQR-LICENSE.txt](vendor/jsQR-LICENSE.txt) |
| [pdf-lib](https://github.com/Hopding/pdf-lib){target="_blank"} 1.17.1 | The PDF part of the [file metadata remover](strip-metadata.md) | MIT | [pdf-lib-LICENSE.txt](vendor/pdf-lib-LICENSE.txt) |
| The 7776-word list from [asian-diceware](https://github.com/anoni-net/asian-diceware){target="_blank"} | [Passphrase and password generator](passphrase.md) | Word data CC-BY-4.0, code MIT | [the upstream repository](https://github.com/anoni-net/asian-diceware){target="_blank"} |

The `pdf-lib.min.js` build also bundles Microsoft's tslib (Apache-2.0), whose copyright header survives in the file rather than being stripped by the minifier.

Leaving these unmodified is deliberate. Editing them would forfeit their upstream provenance, leaving readers who want to check with nothing but our word for it. The files sit under `utils/vendor/` and can be diffed against upstream.

Why each of these is not written from scratch is explained at the bottom of the relevant page. The shared reason is that getting them wrong does not crash anything. It produces output that looks right and is not, which is harder to notice than a failure, and the QR code generator page records one such case we hit ourselves.

## What is not here

Anything that needs an external service to work stays out, because the connection itself breaks both the offline rule and the no-data rule. For network measurement use [OONI Probe](../tools/what-is-ooni.md), which is built for network measurement and documents what happens to the data.
