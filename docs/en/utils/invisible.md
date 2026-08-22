---
title: Invisible character detector
description: Find characters that are present but not visible: zero-width characters, bidirectional controls, tag characters, and homoglyphs mixed into Latin text. Everything happens in your browser and it works with the network off.
icon: material/format-letter-matches
---

# :material-format-letter-matches: Invisible character detector

<div id="invisible-tool"></div>

<script src="../../js/invisible.js"></script>

## Why text contains things you cannot see

### Tracking leaked documents

An organisation sends a document to twenty people and prepares twenty copies, each with a different combination of zero-width characters inserted at different positions. The content looks identical, prints identically, and the characters survive copy and paste. When the document leaks, comparing copies identifies which one it was.

Scan a document before forwarding it.

### Phishing URLs

`аpple.com` and `apple.com` look the same. The first letter of the former is Cyrillic а. Registrar defences against this are inconsistent, and the eye cannot tell.

### Direction overrides in source code

A right-to-left override in source code makes what a human sees in the editor differ from what the compiler reads. A comment appears to enclose a block of code while doing nothing of the sort. The technique has a name: Trojan Source.

## Situations where this actually comes up

### Verifying a leak with the organisation it came from

A journalist receives an internal document. Putting it to the organisation for comment is a professional requirement, and the natural way to do that is to show the document, or to quote an exact passage and ask whether it is genuine.

If the document is one of twenty copies each marked differently, showing it or quoting it hands the source to the people looking for them. Every step was done properly, and the source is burned at the moment of verification.

The order of operations:

1. Scan the document on arrival, before reading it through
2. If anything turns up, clean a working copy and file the original separately
3. Put the substance to the organisation in your own words rather than showing the document
4. When an exact quote is needed, retype it rather than copying and pasting

Step four is the one that gets missed. Zero-width characters travel with copy and paste, so pasting the passage into your email pastes the marking along with it.

The reverse holds too. Copy sent to the desk inside a newsroom, and embargoed releases sent to a press list, can carry the same markings, used to establish who published early. Anyone receiving an embargoed release can be traced the same way if it goes out early.

For the wider context, see [journalists protecting sources](../scenarios/journalist.md).

### Documents circulating between organisations

A draft joint statement going back and forth between several groups, an advocacy coalition's internal memo, background papers a government body sends to its advisory committee.

What these have in common is that they get forwarded repeatedly, and every forward preserves the original invisible characters intact. The fifth person to receive it has no idea what the first copy carried, or who they will be traced to when they pass it on.

Scan before forwarding to a partner organisation. It costs ten seconds.

### Bridge lines and onion addresses you were sent

Someone posts an obfs4 bridge line in a chat room, or an announcement includes an onion address. Both are long, impossible to memorise and only ever handled by copy and paste, which makes them a convenient place to hide characters.

An onion address is base32: only `a` to `z` and `2` to `7`. Cyrillic letters and invisible characters are not in that set, so pasting a tampered address into Tor Browser usually fails to connect rather than connecting somewhere else. Bridge lines are the more realistic risk: a long configuration string with an invisible character in the middle can fail to parse, or be truncated during forwarding into a different set of parameters that still looks plausible.

The attack that genuinely does connect you somewhere else falls outside what the detector covers. An adversary can compute a legitimate onion address whose prefix closely resembles the real one. It contains no hidden characters at all; every character is valid base32. Telling them apart means comparing all 56 characters, or fetching the address again from a source you trust.

## Screenshots are cleaner than copy and paste, at a price

Zero-width characters travel with copy and paste. They do not travel with a screenshot. So when passing on a piece of text whose origin you do not know, a screenshot is the cleaner option.

There are three costs, and all of them count:

- A screenshot is not searchable. Whoever receives it cannot search it, or copy a phrase out of it to check
- Screen readers cannot read text inside an image, a real accessibility regression
- The screenshot itself carries metadata, and very easily captures the notification bar, other conversation windows, or filenames on your desktop

The third is fixable: strip the EXIF with the [photo metadata remover](strip-metadata.md), and look at what else is on screen before you capture. The first two are not fixable, so the trade-off depends on the situation.

For sensitive content going to one person, a screenshot makes sense. For anything meant to be published and found, retyping beats screenshotting.

## Instructions for language models, hidden in the text

Invisible characters can carry an entire set of instructions inside a document, a GitHub issue or a commit message that looks completely ordinary. People cannot read them. Models can.

The tag character block is particularly suited to this. It can encode English one character at a time into something that displays as nothing at all, at any length, so an entire instruction fits. Characters in that block are flagged as suspicious, because ordinary text has no use for them.

Why this matters to people who are not developers: when you paste text of unknown origin into an AI assistant, anything hidden inside it becomes part of the model's input. Such an instruction can tell the model to disregard what came before, shift the stance of a summary, or work a particular link into the answer. You see ordinary text. The model sees ordinary text plus an instruction.

The reverse is also in use: some tools watermark AI-generated text with zero-width characters, to establish afterwards whether a passage came from a model. The same characters serve as a covert instruction in one direction and a marker in the other.

## What a scan cannot prove

If your conclusion after using this tool is "I scanned it, it is safe to forward", the tool has left you worse off than not using it.

Zero-width characters are the crudest way to mark a document, and it is precisely their crudeness that makes them detectable. Anyone seriously trying to trace a leak has options that fall outside detection entirely:

- Swap a few synonyms per copy: "immediately" against "right away", "approximately" against "about"
- Vary the number of blank lines between paragraphs, or where lines break
- Adjust punctuation, a comma in one copy and a semicolon in another
- Adjust the spacing between individual characters in a PDF, invisible to the eye and a different number in the file
- Place visual markings that are hard to see, such as one character a shade off in colour

And some markings are not in the text at all. Colour laser printers lay down a grid of yellow dots on every page, encoding the printer's serial number and the time of printing. The mechanism is called Machine Identification Code. Print a document and scan it back in, and the copy in your hands can still be traced.

### A scan can prove presence, not absence

Something turning up means the document was marked. Nothing turning up only means it was not marked in these particular ways, and not that it is clean.

For genuinely sensitive documents, the correct handling is to retype the content or convey it in your own words, rather than passing on the original file.

## Detection, not insertion

One technique, two uses. An organisation wanting to keep internal documents from leaking is a legitimate need; the same zero-width characters used to identify a whistleblower are an instrument of coercion. The technique cannot tell those apart. The people using it can.

The community's position is to explain how the technique works, so that whoever receives a document can protect themselves, while providing no way to produce marked copies.

Specifically not built: a generator that adds invisible markings to a piece of text, or a tool that produces multiple differently-marked copies in bulk.

"Load the sample text" gives you one fixed passage, and you cannot substitute your own. It contains two zero-width spaces, one Cyrillic letter impersonating part of a URL, and four tag characters, which is enough to see what a detection result looks like. That is all the teaching needs, and it cannot be turned on a real document. Anyone wanting to check the detection range more thoroughly can use the cases in the test file (`tools/test_invisible.mjs`).

The position is written down here so that later discussions have something to refer to.

## Checking suspicious content in Tor Browser

Setting [Tor Browser's security level](../tools/tor-browser-advanced.md) to Safest disables JavaScript, and detection stops working, which is awkward because receiving something of unknown origin is precisely when that page recommends raising the level.

Keep the suspicious site and the detector apart. Copy the text at the higher level, switch back to Standard, paste it here and scan, then raise the level again. The scan happens on your device and makes no outbound connections.

## False positives are this tool's biggest risk

Not every invisible character is a problem.

`👨‍👩‍👧` is three emoji joined by two zero-width joiners, and those joiners are required. Variation selectors are part of emoji. Arabic and Hebrew need directional marks. Cyrillic а in a paragraph of Russian is simply Russian.

Flagging all of it drains the warning of meaning, and nobody reads the output after the third time. So it works in two tiers: **orange is suspicious without needing context**, grey depends on what surrounds it. Joiners inside emoji, and directional marks in text that contains RTL, are never flagged as suspicious.

A whole group of tests guards this, the same size as the group that checks detection works.

## Cleaning

Two buttons. One removes only the suspicious characters, leaving emoji intact. The other removes every invisible character, which breaks emoji families apart but gives you text that is unambiguously clean.

Homoglyphs are **not** replaced automatically. They are visible characters, replacing them changes the meaning, and you may be working with genuine Russian. The tool marks where they are and which Latin letter each resembles, and leaves the decision to you.

## Works offline

Like the rest of this section, the code is stored on your device and runs without a network. What you paste here may be exactly what you do not want leaving your machine, so detection makes no network requests and writes nothing to storage, and it works with the network off.

To take this page with you, see [offline reading](../offline.md).
