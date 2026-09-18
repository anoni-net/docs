---
title: Sending out a job application
description: The deadline is tonight, the CV is an edit of an old version, the portfolio is three separate files, and one page shows work a previous employer has not published. This walkthrough goes through the order of operations, why an exported PDF carries the account name from your computer, and why text under a black box is still in the file.
icon: material/file-send-outline
---

# :material-file-send-outline: Sending out a job application

## The deadline is midnight tonight

The CV is an edit of the version you wrote three months ago. The portfolio is three separate PDFs, and page 4 of one of them shows internal work your previous employer has not published. The two certificates you photographed with your phone came out sideways. The employer wants one file, not three attachments.

Search for "merge PDF" and the first page of results is almost entirely free online services. You upload your CV and portfolio to an unfamiliar server and get a merged file back. One of those services states in its privacy policy that files are deleted within two hours of processing. That sentence is clear, and it also means your complete file sits on someone else's server for those two hours.

## Three things, all on one page

Use [PDF page tidy-up](pdf-pages.md). All three happen in the same place.

1. Drag all three files in and use "move up" and "move down" to order the CV, portfolio, and certificates.
2. To drop the internal page, type `1-3, 5-` into the page range box for that file. Page 4 is skipped.
3. Rotate the two certificate pages.

After you generate the output, the page reads the result back in and compares the page count, rotation, and dimensions against what you selected. If they do not match, the download is not offered. A wrong output looks exactly like a correct one, most people do not open it to check, and by the time the recipient notices a missing page the file has already been sent.

## The author field says a different company

PDFs exported from a word processor or presentation tool usually carry document-level fields: the account name on your computer, a company name, an operating system version, and a creation timestamp down to the second. Applying to company A with an attachment whose author field names company B is an easy mistake to make, and the recipient sees it in the document properties.

The file you generate here is newly built. Title, author, subject, keywords, producer, and creation date are all left empty. The filename is always `pages.pdf`, because an original name like `CV_final_v3_edited.pdf` carries information of its own. Rename it to what you want before sending.

## Text under a black box is still in the file

If a client name in the portfolio was covered with a black rectangle in a presentation tool and then exported to PDF, that text is still in the file. Anyone who receives it can select and copy it out. This is the most common way redaction fails.

The "see what is inside" section on the same page has a search box. Paste in the client name, a case number, or anything you believe you covered up, and the result shows which page that text is still on. If it is still there, go back to the original presentation, delete those pages, and rebuild them. Do not cover it a second time in the PDF.

## Photo metadata has to be handled earlier

Whether EXIF data and GPS coordinates from your photos survive into a PDF depends on which software you use to export. To be sure, run the images through the [File metadata remover](strip-metadata.md) before you place them in the presentation. After the PDF exists, that step is too late.

The same applies to what is visible on screen. If a portfolio screenshot shows a colleague's name or a client's internal system, use [Screenshot redaction](redact.md) to fill it with solid black before placing it.

## The same path applies well beyond job applications

Any PDF you hand over follows the same order: arrange the pages, search to confirm, rename, then send.

- Attachments for a complaint or an appeal, where the recipient wants one file and you have several separate scans
- Expense claims, where receipt scans need to be merged in order and the sideways ones rotated
- A contract where the other side only needs annex three, and the remaining pages have no reason to travel with it
- A submission or application, where the portfolio should drop the pages that are not public yet

The whole path runs in your browser and the files never leave your device. Once the page is saved to your device it works without a network connection. See [offline reading](../offline.md).
