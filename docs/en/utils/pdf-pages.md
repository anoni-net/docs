---
title: PDF page tidy-up
description: Merge several PDFs, pull out or drop pages, reorder them, fix their orientation. Your files never leave your device. The output carries none of the original's title, author or producer fields, and it is read back once before you get it.
icon: material/file-document-multiple-outline
offline_assets:
  # pdf-lib is loaded on demand, so the page has no script tag for it. The offline
  # copy still needs it, otherwise saving this page leaves you with nothing usable.
  - utils/vendor/pdf-lib.min.js
  # The parser behind "Look inside", loaded only when that button is pressed,
  # about 1.8 MB in total. Saving the page offline saves it too, otherwise the
  # button does nothing with the network off.
  - utils/vendor/pdfjs/pdf.min.mjs
  - utils/vendor/pdfjs/pdf.worker.min.mjs
---

# :material-file-document-multiple-outline: PDF page tidy-up

<div id="pdfpages-tool"></div>

<script src="../../js/pdfpages.js"></script>

## When you need this

A PDF you are about to send is rarely right the first time. The scan came out as several files that need joining, the attachment only needs three of the pages, the photos you took are sideways, and the signature page at the end should not go with it.

- **Attachments for a complaint or a records request**: the office wants one PDF and you have four separate scans.
- **Sending only the pages that matter**: the other side needs appendix three, and the rest of the contract has no reason to travel with it.
- **Expenses and reimbursement**: receipts scanned in the wrong order, some of them rotated.
- **Submissions and applications**: pull the unpublished pages out of a portfolio before it goes.

Free online PDF services do the same job, and the price is that the whole file goes up to their servers first. One such service's privacy policy says files are deleted within two hours of processing — clearly written, but for those two hours the complete file sits on someone else's machine, and most people have never read the policy.

## How to use it

1. Drop PDFs in, or click to choose files. You can pick several at once.
2. Leave "Pages to keep" empty for the whole file, or type `1-3, 5, 8-`. You can also click the page numbers below it.
3. When merging, use "Move up" and "Move down" to get the order you want.
4. Press "Build the PDF".

`8-` means page 8 to the end, and `-3` means the start through page 3.

## The output is cleaner than the original

The result is a newly built document, so the source's document-level fields do not come along. Title, author, subject, keywords, producer and creation date are all left empty. Those fields routinely carry the account name on your computer, your organisation's name, your operating system version, and a timestamp accurate to the second.

The filename is always `pages.pdf`. Original filenames often carry a caseworker's name, a case number and a date, which is the same reason [screenshot redaction](redact.md) always writes `redacted.png`.

Anything inside the page content is out of scope here. To strip EXIF, GPS and author fields from photos and Office documents, use the [file metadata cleaner](strip-metadata.md). To cover a name that is visible on the page, use [screenshot redaction](redact.md).

## Checked once before you get it

After the file is assembled, the page reads it back in and compares the page count, orientation and size of every page against what you asked for. If anything fails to match, the download is withheld.

The reasoning is the same as the pixel-by-pixel check in screenshot redaction. A wrong output looks exactly like a correct one, nobody opens the result to check it, and by the time the recipient notices a missing page the file has already been sent.

## Look inside

"Look inside" does three things: pulls the text out of every page, counts attachments, annotations and form fields, and draws a thumbnail of each page. The first press loads about 1.8 MB of parser, which nobody who only wants to tidy pages ever touches.

The search box underneath is the useful part. Paste the name or number you thought was redacted and it tells you which pages still contain it. **A black box on screen does not mean the text is gone from the file.** A rectangle drawn over the visual layer while the text layer stays untouched is the most common way redaction fails, and whoever receives the file only has to copy and paste.

The comparison normalises case, full-width characters and whitespace first. Otherwise "not found" might only mean the other side typed it differently, which is false reassurance.

No extractable text usually means the file is a scan, so what you see is an image and not a text layer. This check cannot help with those; the image itself is what to look at.

Thumbnails are there to tell one page from another, not to read. They are skipped when a file has many pages, which would exhaust a phone's memory.

## What it does not do

No compression. Compressing means re-encoding every image inside, which is a different kind of work and blurs scanned text when done badly.

No format conversion. Turning a PDF into a Word file means rebuilding the layout, and it gets more wrong than right.

No password removal. Unlock a protected PDF with whatever you normally use to open it, then come back.

No automatic judgement about what is sensitive. "Look inside" lays the text out for you, but only you know which part matters.

## Works offline

Like everything else in this section, the code works with the network off once it is stored on your device, which is the most direct proof that your files are not being sent anywhere.

To take this page with you, see [offline reading](../offline.md).
