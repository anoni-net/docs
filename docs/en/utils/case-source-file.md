---
title: A file from a source
description: A source sends an internal deck, you need to verify it and quote from it, and nobody should be able to work out who handed it over. This walkthrough covers the order of operations after a file arrives, how document leak tracking works, why the invisible character detector can only prove presence, and why quoting has to go through retyping and redaction.
icon: material/file-account-outline
---

# :material-file-account-outline: A file from a source

## An internal deck arrives

Someone you have been talking to for three weeks sends a PDF today. Twenty-odd pages, apparently exported from an internal presentation.

Three things follow, and the order matters. Confirm the file arrived exactly as they sent it, work out what it carries, and then decide how the story quotes from it.

The third is the one that counts. When the same document goes to different people inside an organisation, each copy may differ, and the differences are far too fine to see. Handing the original on, or publishing it, points straight back at who gave it to you.

## Confirm both sides hold the same file

Ask the source to compute the file's SHA-256 on their end. Compute it on yours with [File hash comparison](hash.md) and compare the two strings.

The command line has always done this, and `sha256sum`, `shasum -a 256`, and `Get-FileHash` produce the same value as this page. When the other person is not comfortable on a command line, sending them this URL is faster than teaching them to open a terminal.

A match means the transfer was complete. A mismatch means something was lost along the way, so ask for it again. With this step done, anything you find afterwards definitely belongs to the original itself.

## See what the file carries

For a PDF, use "see what is inside" on [PDF page tidy-up](pdf-pages.md). It extracts the text of each page and counts attachments, annotations and form fields. For Office files and images, the [File metadata remover](strip-metadata.md) lists what each segment contains.

What turns up regularly: the author's account name, a company domain, the user name on a machine, creation and modification timestamps down to the second, and every piece of software that has touched the file. Those fields alone can narrow the field to a handful of people.

Annotations and revision history deserve the same attention. Speaker notes deleted from a deck but not actually removed, and passages in a PDF sitting under a black rectangle with the text layer intact, both count. Use the search box on the same page to look for text you believe is not visible, and it reports which page it is still on.

## How document leak tracking works

Send the same document to twenty people with each copy differing slightly, and the copy that surfaces later identifies which one leaked. This takes several forms, and invisible characters are one of them.

Zero-width characters sit between letters, show nothing at all on screen, and survive copy and paste. Homoglyphs swap in letters from another alphabet that look identical. Direction controls and tag characters can encode information too.

Paste the text into the [Invisible character detector](invisible.md) and it marks where these categories appear and explains what each one is.

The detector can prove presence, not absence. A clean result means none of these known categories are present. Markers built from word spacing, line break positions, or a handful of pixels inside an image are invisible to it, and those techniques are in use.

So the conclusion of a check is never "this file is safe to publish".

## Quoting means retyping and redacting

Since absence cannot be proven, the story should not carry the original file onward.

When quoting text, retype it rather than copying and pasting from the original. Retyping carries none of the embedded characters into your copy, and it is both the simplest and the most reliable step available.

When an image of the document is genuinely necessary, screenshot it and run it through [Screenshot redaction](redact.md) to fill what should not appear with solid black. The output is newly encoded, and neither the original metadata nor the original filename carries over.

Before handing material to an editor, a lawyer, or a collaborating reporter, ask whether that person needs the original at all. Usually what they need is the content, and every extra hand the original passes through adds another chance of identification.

## Keeping the original

Keep the original, because verification and any later dispute depend on it. Keep it encrypted on your own device.

Draw a passphrase from the [Passphrase and password generator](passphrase.md) and seal the file with [Local file encryption](age.md). The output is the age format, which any computer with the age command line tool can open, so changing equipment later does not tie you to this site.

## The same path applies well beyond internal documents

Any file you did not produce but intend to use works the same way:

- Photos, recordings and screenshots from readers or members of the public
- Records and minutes obtained through a freedom of information request
- Attachments arriving at an anonymous inbox
- Material from a collaborator that you will pass on again

These tools all run in your browser and the files never leave your device. Once the pages are saved to your device they work without a network connection. See [offline reading](../offline.md).
