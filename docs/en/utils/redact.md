---
title: Screenshot redaction
description: Draw boxes over names, avatars and messages that must not leave a screenshot or photo, and fill them with solid black, entirely on your device. The output is re-encoded so none of the original metadata or filename carries over, and every box is checked pixel by pixel before you download.
icon: material/selection-remove
---

# :material-selection-remove: Screenshot redaction

<div id="redact-tool"></div>

<script src="../../js/redact.js"></script>

## When it is useful

Several scenario pages share one step: handing a screenshot of a conversation or a threat to a third party. [Activists](../scenarios/activist.md) keep threatening messages as evidence, [LGBTQ+ readers](../scenarios/lgbtq.md) being doxxed record what was said, survivors of domestic abuse pass conversations to a social worker or lawyer. Besides the other party, a screenshot usually shows third people's names, avatars and phone numbers, and your own account.

- **A group chat screenshot goes to a lawyer or a platform report**: the other party's messages stay, the names and avatars of everyone else in the same frame should not go with them.
- **Asking for help in public about harassment**: before posting, cover your own phone number, the names of the other party's friends, and the carrier and clock in the status bar at the top.
- **A photo from the scene is submitted to a newsroom**: house numbers, licence plates and bystanders' faces are still in the picture after the metadata is gone, and need covering separately.

## How to use it

1. Drop the image in, click to choose a file, or paste it.
2. Press and drag over what needs covering. Release, and it is filled with black. Draw as many boxes as you need, and press "Undo last box" if one goes wrong.
3. Press "Create the redacted image". The page decodes the output once more, checks that every box is solid black, and only then offers the download.

The output filename is always `redacted.png` or `redacted.jpg`. Screenshot filenames tend to carry the app name and a timestamp to the second, which is a leak of its own.

## Why solid fill

Pixelation averages an area into large blocks. Blur mixes each pixel with its neighbours. Both keep statistical traces of the original content, and text in particular can be recovered. Open-source tools such as Depix, which recover pixelated text, have been public since 2020: guess the font and size and the blocks map back to characters. A semi-transparent highlighter is worse, a change of brightness and contrast shows the text directly.

Solid fill keeps nothing. Every pixel in the box is replaced with the same colour, and the output file has no trace of what was there. Before handing you the file, the page decodes the output once more and checks every box pixel by pixel. If the check fails, there is no download.

## The output is re-encoded

The [file metadata stripper](strip-metadata.md) guarantees the opposite: this page always re-encodes. Redaction changes pixels, so there is no lossless option. The upside is that none of the original file's EXIF, XMP, thumbnail or other fields carries over. The output holds the picture and nothing else.

The output format follows the input: JPEG in, JPEG out. Everything else becomes PNG. PNG is lossless, so screenshots lose no further quality. JPEG is re-compressed at quality 0.92, which is hard to tell apart on a photo, but every re-compression loses a little more, so do not run the same image through repeatedly.

Images above sixteen million pixels are scaled down to that limit first, because a phone's canvas cannot hold a larger surface. Scaling only affects output resolution. The covered areas are unaffected. Colour profiles are not preserved, so wide-gamut photos may shift slightly.

## What it does not do

No face detection and no automatic redaction. What needs covering depends on your situation, a model cannot decide that for you, and you carry the cost of the face it misses.

No blur and no pixelation, for the reason above.

No video.

## Works offline

Like the rest of this section, the code stays on your device once stored and works without a network. That is the most direct proof that the image was never sent anywhere.

To take this page with you, see [offline reading](../offline.md).
