---
title: A link forwarded into a group chat
description: A neighbourhood group chat forwards a message about a limited-time registration, with a URL that looks like an official site and a QR code image. This walkthrough goes through the order of checks, why the registered domain is the only part worth reading, how to decode a QR code image without opening it, and what invisible characters can and cannot tell you.
icon: material/message-alert-outline
---

# :material-message-alert-outline: A link forwarded into a group chat

## What the message looks like

The neighbourhood group chat lit up this morning with a forward: a subsidy programme is open for registration, places are limited, complete it today. Below it a URL, and next to that a QR code image with a note saying scanning is faster.

The person who forwarded it is a neighbour you know. Where the message came from before that is several hands back. The URL looks like a government site, and the domain does contain those familiar letters.

Opening it is the worst available option. The moment you do, whoever is on the other end has your IP address, your device, and your browser details, and you still have not worked out what the thing is.

## Start with what is in the QR code

Save the image and drop it into the [QR code reader](qr-read.md). The image is decoded in your browser and is not uploaded.

When the result is a URL, the page displays the host on its own line, and it deliberately gives you no button to open it. That missing button is the design. During a check, the button is exactly where a hand slips.

A QR code offers no clues of its own. Printed on paper, stuck to a pole, or attached to a message, they all look the same and none of them reveals its destination. An app that scans and jumps straight there removes the moment of judgement entirely.

## The real destination is the registered domain

Paste the decoded URL into the [URL cleaner](clean-url.md). It does two things.

First, it isolates the registered domain. Nearly every impersonation plays with this position: putting an agency name in a subdomain (`gov-tw.example.com` actually lands on `example.com`), adding words alongside it (`gov-tw-service.com`), or swapping in a letter that looks like another one. Those familiar letters in the message may not appear anywhere in the registered domain.

Second, it pulls out tracking parameters and removes them, naming who is doing the tracking in each case. A URL forwarded through several hands often carries an identifier from each of them. If you want to forward the link to someone else to ask about it, clean it first, otherwise you add your own hand to the chain as you pass it on.

Google and Facebook redirect wrappers are unpacked too. Those URLs hide the real destination inside a parameter.

## The text of the message is worth a look as well

Paste the whole message into the [Invisible character detector](invisible.md). It marks the positions of zero-width characters, direction controls, tag characters, and homoglyphs, and explains what each category is.

Homoglyphs matter most here. Replace the Latin `a` with the Cyrillic `а` and the two look identical on screen while the domain is an entirely different one. Direction control characters can make a string display in the opposite order to the one it is stored in.

One limit needs stating plainly: this page can prove presence, not absence. A clean result means none of these known categories are present, and it does not mean the link is safe. It is one step in a check, not a conclusion.

## After the checks

With all three done, the judgement is usually clear. If the registered domain does not match the agency the message claims, or the text uses homoglyphs, the forward can stop with you.

If you want to explain it to the group, screenshot the part of the [URL cleaner](clean-url.md) that isolates the registered domain. That works far better than saying the link looks odd. Run the screenshot through [Screenshot redaction](redact.md) before sending it, because group chat screenshots usually carry other members' names and profile pictures.

If you genuinely need to do the thing, navigate to the agency's own site yourself. Searching for the official site runs into fake ones that bought the keywords, so your own existing bookmark is the most reliable route.

## One ordering problem if you use Tor Browser

Setting [Tor Browser's security level](../tools/tor-browser-advanced.md) to Safest disables JavaScript entirely, and these three tools stop responding.

Keep the two activities separate. Open the suspicious site at the high security level, copy out the text or image you want to check, switch back to Standard, check it, then set the level back. These three tools make no outbound connections, so opening them at Standard adds nothing to your exposure on that suspicious site.

## The same path applies well beyond group chat forwards

The same order works for anything that arrives without a clear provenance.

- A text message saying a delivery failed, please tap the link to reschedule
- An email saying your account has a problem, with a link to a login page
- A QR code on a pole, a flyer, or a restaurant table sticker
- A form URL inside a job posting that wants you to fill it in first

All three tools run in your browser and nothing you paste in is sent anywhere. Once the pages are saved to your device they work without a network connection. See [offline reading](../offline.md).
