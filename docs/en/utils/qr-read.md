---
title: QR code reader
description: Read what is inside a QR code image without the image leaving your device. When the contents are a URL, the hostname is shown separately so you can check before opening it.
icon: material/qrcode-scan
---

# :material-qrcode-scan: QR code reader

<div id="qrread-tool"></div>

<script src="../vendor/jsQR.js"></script>
<script src="../../js/qrread.js"></script>

## When this helps

Someone sends you a screenshot of a QR code, or you photograph one on a wall. You want to know what is in it without using an app that uploads the image, and without a camera app following it before you can look.

This page reads it in your browser. The image does not leave your device.

## This page will not open the link for you

QR codes are a common phishing vector. A sticker over a payment code, a swapped image on a poster: the text looks like an official site while the host is something else. A camera app follows it immediately, leaving you no chance to check.

So when the contents are a URL, this page shows the **hostname separately** and deliberately offers no open button. Check the host, then open it yourself.

A hostname containing non-Latin letters appears in its `xn--` form. That usually means letters shaped like others are impersonating a different domain, the same homoglyph problem covered by the [invisible character detector](invisible.md).

## What you can do with the result

If it is a URL, the [URL cleaner](clean-url.md) strips the tracking parameters before you share it.

If it is text, the [invisible character detector](invisible.md) checks whether anything is hiding in it.

## When it will not read

QR codes carry error correction, but a blurred photo, a steep angle or too little surrounding white all defeat it. Cropping away everything but the code usually helps most.

## Whose code does the decoding

Decoding is handled by [jsQR](https://github.com/cozmo/jsQR){target="_blank"} (Apache-2.0), placed unmodified under `utils/vendor/` with the full licence text alongside it.

Decoding involves locating the code, correcting perspective and applying error correction, a considerably larger job than encoding. The tests generate codes with known contents using qrcode-generator from the [generator](qrcode.md) page and read them back with jsQR, so two independent libraries check each other.

## Works offline

Like the rest of this section, the code is stored on your device and runs without a network. What you scan may be exactly what you do not want leaving your machine, and working with the network off is the most direct proof that it does not.

To take this page with you, see [offline reading](../offline.md).
