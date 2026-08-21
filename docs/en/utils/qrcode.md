---
title: QR code generator
description: Turn a piece of text into a QR code so the person in front of you can read it with a camera. Works for onion addresses, Tor bridges and one-off contact details. Everything is generated in your browser and it works with the network off.
icon: material/qrcode
---

# :material-qrcode: QR code generator

<div id="qrcode-tool"></div>

<script src="../vendor/qrcode-generator.js"></script>
<script src="../../js/qrcode.js"></script>

## When this helps

You need to hand someone a long string that is easy to mistype, and passing it over the network is awkward or unwise:

- An onion address: fifty-six random characters, and reading them aloud goes wrong
- A Tor bridge: one line holding an address, a fingerprint and a cert, where a single wrong character means no connection
- A temporary contact detail, such as a one-off Matrix room

The other person points a camera at your screen and has it. Nothing passes through a server, and no message log is left behind.

## What is inside a QR code is in the clear

This gets misunderstood often. A QR code is not encryption. It is a way of drawing text as squares. Anyone who photographs it can read the contents: the camera on the wall, the other person's photo backup, whoever is standing behind you.

If what you are handing over is sensitive in itself, check the room first and close the screen afterwards. Anything that genuinely needs to stay secret belongs in an [end-to-end encrypted messenger](../tools/messaging-comparison.md). QR codes suit strings that are public but hard to type.

## Choosing an error correction level

QR codes carry error correction, so a dirty or partly covered code still reads. Higher levels repair more damage but need a larger image for the same content.

| Level | Recovers | Suits |
|---|---|---|
| L | 7% | Scanned straight off a clean screen |
| M | 15% | General use, the default here |
| Q | 25% | Printed, where creases and dirt happen |
| H | 30% | Outdoors, or with a logo covering the middle |

For handing a code to someone off your screen, L or M is enough. The image stays smaller and the other camera locks on faster.

## Downloading as SVG

Download SVG saves a vector file, so it stays sharp at any size and prints cleanly. The file lands on your device without passing through any server.

For anything printed or turned into a sticker, raise the level to Q or H. Paper creases and gets dirty.

## Works offline

Like the rest of this section, the code is stored on your device and runs without a network. Try it with the network off: it still draws, which also means what you typed cannot have been sent anywhere.

To take this page with you, see [offline reading](../offline.md).

## Whose code does the encoding

Encoding is handled by [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator){target="_blank"} (MIT), placed unmodified under `utils/vendor/`. Getting QR encoding wrong typically produces a code that scans but carries the wrong content, which is worse than one that fails outright, so a mature implementation beats rewriting it.

We wrote a separate decoder inside the test suite that reads the generated image back into text and compares, so the way we call the library is covered. That test caught a real defect while it was being written: the library treats strings as Latin-1 by default, which mangles anything outside ASCII.
