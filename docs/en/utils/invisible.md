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

This is not hypothetical. Scan a document before forwarding it.

### Phishing URLs

`аpple.com` and `apple.com` look the same. The first letter of the former is Cyrillic а. Registrar defences against this are inconsistent, and the eye cannot tell.

### Direction overrides in source code

A right-to-left override in source code makes what a human sees in the editor differ from what the compiler reads. A comment appears to enclose a block of code while doing nothing of the sort. The technique has a name: Trojan Source.

## False positives are what this tool has to get right

Not every invisible character is a problem.

`👨‍👩‍👧` is three emoji joined by two zero-width joiners, and those joiners are required. Variation selectors are part of emoji. Arabic and Hebrew need directional marks. Cyrillic а in a paragraph of Russian is simply Russian.

Flagging all of it turns the tool into a boy who cried wolf, and nobody reads the output after the third time. So it works in two tiers: **orange is suspicious without needing context**, grey depends on what surrounds it. Joiners inside emoji, and directional marks in text that contains RTL, are never flagged as suspicious.

A whole group of tests guards this, the same size as the group that checks detection works.

## Cleaning

Two buttons. One removes only the suspicious characters, leaving emoji intact. The other removes every invisible character, which breaks emoji families apart but gives you text that is unambiguously clean.

Homoglyphs are **not** replaced automatically. They are visible characters, replacing them changes the meaning, and you may be working with genuine Russian. The tool marks where they are and which Latin letter each resembles, and leaves the decision to you.

## Works offline

Like the rest of this section, the code is stored on your device and runs without a network. What you paste here may be exactly what you do not want leaving your machine, so this page makes no network requests and writes nothing to storage. It works with the network off, which is the most direct proof of both.

To take this page with you, see [offline reading](../offline.md).
