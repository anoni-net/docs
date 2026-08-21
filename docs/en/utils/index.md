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

-   :material-dice-multiple-outline: **[Passphrase and password generator](passphrase.md)**

    Draw a passphrase from the 7776-word asian-diceware list, or a random password from the character sets you pick. Randomness comes from the browser's `crypto.getRandomValues`, and the tool tells you how much entropy you got.

-   :material-qrcode: **[QR code generator](qrcode.md)**

    Turn onion addresses, Tor bridges and other long, easily mistyped strings into a QR code the person in front of you can read with a camera, without anything passing through a server. Downloadable as SVG for printing.

</div>

## Taking them offline

The code and data behind these tools are stored along with the page. Tick this section in the [offline reading](../offline.md) list and they will open without a network afterwards.

## What is not here

Anything that needs an external service to work stays out, because that conflicts with both rules above. For network measurement use [OONI Probe](../tools/what-is-ooni.md), which is built for the job and documents what happens to the data.
