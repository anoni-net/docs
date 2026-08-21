---
title: QR code reader
description: Read what is inside a QR code image without the image leaving your device. Recognises Wi-Fi configurations, two-factor bindings, contact cards, coordinates and more, breaking each into labelled fields. URLs get their hostname listed separately so you can check before opening.
icon: material/qrcode-scan
---

# :material-qrcode-scan: QR code reader

<div id="qrread-tool"></div>

<script src="../vendor/jsQR.js"></script>
<script src="../../js/qrread.js"></script>

## When this helps

Someone sends you a screenshot of a QR code, or you photograph one on a wall. You want to know what is in it without using an app that uploads the image, and without a camera app following it before you can look.

This page reads it in your browser. The image does not leave your device.

Two that come up in practice:

- **A QR code sticker on a parking meter** that looks just like the original payment code. Check here first: if the hostname does not match the official one, that sticker is a problem.
- **Someone you just met hands you a card with a QR code**, saying scan this to add me. Look at what is actually inside before deciding whether to add them.

## This page will not open the link for you

QR codes are a common phishing vector. A sticker over a payment code, a swapped image on a poster: the text looks like an official site while the host is something else. A camera app follows it immediately, leaving you no chance to check.

So when the contents are a URL, this page shows the hostname separately and deliberately offers no open button. Check the host, then open it yourself.

A hostname containing non-Latin letters appears in its `xn--` form. That usually means letters shaped like others are impersonating a different domain, the same homoglyph problem covered by the [invisible character detector](invisible.md).

## What it recognises, and what it pulls out

A QR code holds more than URLs. An app that acts straight from the scan never shows you what is inside first. This page does.

| Contents | Fields it labels |
|---|---|
| Wi-Fi configuration | Network name, encryption, password, whether it is hidden |
| Two-factor binding (`otpauth:`) | Issuer, account, type |
| Pre-written email (`mailto:`) | To, subject, message |
| Pre-written text message (`sms:`) | Number, message |
| Phone number (`tel:`) | Number |
| Geographic coordinates (`geo:`) | Latitude, longitude, precision in metres |
| Contact card (vCard, MECARD) | Name, organization, number, email |
| URL | Host, number of tracking parameters |

A few combinations get an extra warning:

- **Wi-Fi set to `nopass`**: that network has no password. Once you join, anyone else on it can see which hosts you connect to. `WEP` leaves the password doing nothing, as that cipher was broken long ago.
- **`otpauth:` carrying a `secret`**: that string is the two-factor secret itself. Whoever holds it can generate the codes, which leaves the second factor doing nothing. This is the code you scan when binding an authenticator app, so leaving that screenshot in your photo library is the same as writing a password on a sticky note.
- **An email or message already filled in**: tapping it leaves only the send. Some premium services are activated by exactly one message nobody read closely.
- **A shortened URL**: the destination is only known once you follow it, and this page will not follow it for you.
- **`javascript:` or `data:`**: these run in your browser the moment they are opened. There is no legitimate reason for them to appear in a QR code.

## Passwords are masked, the raw content is not

The password in the field list shows as `••••••••`. Press "Show" to reveal it. People stand near you when you scan things, so exposing it by default makes no sense.

The raw content above is never masked, so that you can confirm exactly what was decoded. So before screenshotting this page for someone, check what that box holds. The `otpauth:` secret is the one exception, left out of the field list entirely.

## What you can do with the result

If it is a URL, this page counts how many tracking parameters it carries, and the [URL cleaner](clean-url.md) strips them before you share it.

If it is text, the [invisible character detector](invisible.md) checks whether anything is hiding in it.

The precision figure for coordinates is calculated: each additional decimal place narrows the area tenfold. The fourth decimal place is roughly 11 metres of latitude, enough to point at one building. That is the other side of the location leak described in [what your browser reveals](leaks.md).

## Scanning a suspicious code in Tor Browser

Setting [Tor Browser's security level](../tools/tor-browser-advanced.md) to Safest disables JavaScript, and this page stops responding, which is awkward because receiving a QR code of unknown origin is precisely when that page recommends raising the level.

Save the image first, switch back to Standard to read it, then raise the level again. This page makes no outbound connections; the image is decoded on your device.

## When it will not read

QR codes carry error correction, but a blurred photo, a steep angle or too little surrounding white all defeat it. Cropping away everything but the code usually helps most.

## Whose code does the decoding

Decoding is handled by [jsQR](https://github.com/cozmo/jsQR){target="_blank"} (Apache-2.0, [full licence text](vendor/jsQR-LICENSE.txt)), placed unmodified under `utils/vendor/`. Everything third-party in this section is listed on the [tools index](index.md#whose-code-this-uses).

Decoding involves locating the code, correcting perspective and applying error correction, a considerably larger job than encoding. The tests generate codes with known contents using qrcode-generator from the [generator](qrcode.md) page and read them back with jsQR, so two independent libraries check each other.

## Works offline

Like the rest of this section, the code is stored on your device and runs without a network. What you scan may be exactly what you do not want leaving your machine, and working with the network off is the most direct proof that it does not.

To take this page with you, see [offline reading](../offline.md).
