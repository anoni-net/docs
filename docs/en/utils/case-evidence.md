---
title: Turning conversation screenshots into a submission
description: A support worker has to turn dozens of a client's conversation screenshots into one attachment fit to submit, with third parties' names and avatars in frame and text possibly still under the black boxes. This walkthrough covers redacting, merging and confirming, why the fill is solid black, and what the last check before sending looks for.
icon: material/folder-account-outline
---

# :material-folder-account-outline: Turning conversation screenshots into a submission

## Dozens of screenshots

The client sends over the conversation screenshots from their phone. Forty-odd of them, spanning several months. They have to become one attachment for the handling agency or the lawyer assisting.

The frames hold more than the client and the other party. Names and avatars of everyone else in a group chat, forwarded messages from third parties, and the client's own phone number and account handle are all in the same picture. None of those people agreed to appear in a document that gets submitted.

The order is the picture first, then the file, then a confirmation. All three happen in your browser and the screenshots are never uploaded. A client's conversations cannot be recalled once they leave the device, which is what makes where the processing happens matter so much here.

## Cover what should not appear

Drag a screenshot into [Screenshot redaction](redact.md). Press "find faces automatically" first: detected faces get a hollow blue outline, and at that point nothing is covered. Click any blue box that does not need covering to remove it, then press "redact all" for the rest.

The detector only looks for faces. Names, phone numbers, account handles and the status bar are yours to add: press and drag a box over each one and it fills with black on release.

The boxes fill with solid black, and neither pixelation nor blur is offered. Pixelation averages a region into large blocks and blurring mixes each pixel with its neighbours, and both preserve statistical features of the original. Open source tools that reverse pixelated text have been public since 2020, and with the right guess at font and size they map the blocks back to characters.

While blue boxes remain, "generate redacted image" stays disabled. That is deliberate: the detector found something you have not ruled on, and an image handed over in that state is an unredacted image.

Before offering the download, the page decodes its own output and checks every box pixel by pixel for pure black. If the check fails, there is no download. The output filename is always `redacted.png`, because original screenshot filenames tend to carry an app name and a timestamp down to the second.

## Merge into one file in date order

The redacted images have to become a PDF. Place them in a document, export to PDF, then use [PDF page tidy-up](pdf-pages.md) to merge, order, and rotate whatever came out sideways.

Handling agencies generally want one file rather than forty-odd attachments, and getting the chronology right saves whoever reads it from cross-referencing repeatedly.

The file you generate is newly built. Title, author, subject, keywords, producer and creation date are all left empty, and those fields routinely carry your organisation's name, the account name on your computer, and a timestamp down to the second.

## The last check before it goes

Press "see what is inside" and use the search box underneath.

Paste in the names, phone numbers and handles you already covered, and it reports which page each is still on. A black box on screen does not mean the text left the file. If any step along the way involved drawing a black rectangle in a document editor and exporting, the text layer is untouched and whoever receives it can select and copy it.

If something is still there, redo that page by filling solid black on the image in [Screenshot redaction](redact.md). Do not cover it a second time in the PDF.

## The originals stay

What gets submitted is the processed version, and the original screenshots stay intact, because any later dispute or request for further material depends on them.

Keep them encrypted on the device. Draw a passphrase from the [Passphrase and password generator](passphrase.md) and seal them with [Local file encryption](age.md). The output is the age format, which any computer with the age command line tool can open.

Store the originals and the processed version in separate folders. Attaching the wrong file at submission is a thing that genuinely happens.

## The same path applies well beyond submissions

Any document assembled from someone else's screen and destined for a third party works the same way:

- Conversation records attached to a platform report
- Message threads for a lawyer to read
- Screens attached to an insurance claim or a repair request
- Supporting material for an internal investigation

For the full preparation around the person concerned, see [domestic violence and tech-enabled abuse](../scenarios/domestic-violence.md) and [stalking and online harassment](../help/index.md#Stalking-and-online-harassment).

These tools all run in your browser and the screenshots never leave your device. Once the pages are saved to your device they work without a network connection. See [offline reading](../offline.md).
