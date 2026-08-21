---
title: Tools
description: Small tools that run in your browser. Nothing is sent anywhere, and once stored on your device they work with the network off.
icon: material/tools
---

# :material-tools: Tools

The articles on this site explain how to protect yourself. This section holds the things you can actually press. Three rules apply to all of them:

- Everything is computed in your browser, and nothing is sent anywhere
- Once stored on your device they work with the network off, and working offline is itself the proof that nothing is being sent
- The source is in [anoni-net/docs](https://github.com/anoni-net/docs/tree/main/docs/zh-TW/js){target="_blank"}, so anyone who reads code can check

## Available now

<div class="grid cards" markdown>

-   :material-clipboard-check-outline: **[Threat model checklist](threat-model.md)**

    Answer the three questions (what you are protecting, who from, what you will spend) into a copyable checklist, with the combinations that will not hold flagged. Nothing is saved; reloading clears it.

-   :material-dice-multiple-outline: **[Passphrase and password generator](passphrase.md)**

    Draw a passphrase from the 7776-word asian-diceware list, or a random password from the character sets you pick. Randomness comes from the browser's `crypto.getRandomValues`, and the tool tells you how much entropy you got.

-   :material-qrcode: **[QR code generator](qrcode.md)**

    Turn onion addresses, Tor bridges and other long, easily mistyped strings into a QR code the person in front of you can read with a camera, without anything passing through a server. Downloadable as SVG for printing.

-   :material-qrcode-scan: **[QR code reader](qr-read.md)**

    Read what is inside a QR code image without the image leaving your device. URLs get their hostname shown separately, and there is no open button.

-   :material-image-off-outline: **[Photo metadata remover](strip-metadata.md)**

    Strip EXIF, GPS, camera model and comment fields from photos without the file leaving your device. The compressed data is untouched, so the cleaned image is identical to the original, and every segment kept or removed is listed for you.

-   :material-link-variant-off: **[URL cleaner](clean-url.md)**

    Pick out and remove the tracking parameters in a URL, each annotated with who is doing the tracking. Unwraps Google and Facebook redirect wrappers too.

-   :material-format-letter-matches: **[Invisible character detector](invisible.md)**

    Find zero-width characters, bidirectional controls and homoglyphs hiding in text, with positions marked and each class explained. Both document leak tracking and phishing URLs rely on these.

-   :material-eye-outline: **[What your browser gives away](leaks.md)**

    Lists what any site can read without asking, annotated with how Tor Browser normalises each one. Open it in a second browser to see what those defences actually do.

</div>

## Taking them offline

The code and data behind these tools are stored along with the page. Tick this section in the [offline reading](../offline.md) list and they will open without a network afterwards.

## What is not here

Anything that needs an external service to work stays out, because that conflicts with both rules above. For network measurement use [OONI Probe](../tools/what-is-ooni.md), which is built for the job and documents what happens to the data.
