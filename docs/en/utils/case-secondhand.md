---
title: Selling things on a secondhand marketplace
description: Before a move, you photograph furniture and appliances to list them, and the backgrounds contain a house number, the street outside, and a utility bill on the table. This walkthrough explains when to reach for screenshot redaction and when for the metadata remover, why most photos only need one of them, and what to say when a buyer asks you for ID.
icon: material/tag-outline
---

# :material-tag-outline: Selling things on a secondhand marketplace

## Fourteen photos ready to list

The moving date is set. The table, the cabinet, and a refrigerator need to go. You took fourteen photos on your phone and plan to list all of them.

The photos contain things you did not pay attention to. The one of the front door shows the house number. The refrigerator shot has a window behind it and the sign on the building opposite is perfectly readable. On the table in another shot lies a utility bill, addressee name facing up. Each file also records the GPS coordinates where it was taken, a timestamp down to the second, and the phone model.

Whether a marketplace strips capture data for you varies between platforms and changes between app versions. Handle it once yourself and you do not have to track what they do.

## Two tools, and usually you only need one

Two tools on the site cover this, and they handle different things.

[Screenshot redaction](redact.md) handles what is visible on screen: the house number, the sign, the name on the bill, a neighbour's face. These are in the picture itself, so removing capture data from the file does nothing for them.

[File metadata remover](strip-metadata.md) handles what is not visible: GPS coordinates, capture time, phone model, the name of any software that edited the file.

For the photos that need something covered, screenshot redaction alone is enough. Its output is a newly encoded file, and neither the original metadata nor the original filename carries over, so there is no need to run the remover afterwards. For photos with nothing to cover, where you only want the capture data gone, the remover on its own does the job.

## Drawing fewer boxes

Drag the image into [Screenshot redaction](redact.md) and press "find faces automatically" first. Detected faces are outlined in blue, and at that point nothing has been covered yet. Click any blue box that does not need covering to remove it, then press "redact all" for the rest.

Add what the detector missed yourself: press and drag a box over the house number or the name on the bill, and it fills with black when you release.

The boxes are filled with solid black, not pixelated and not blurred. Pixelation averages a region into large blocks and blurring mixes each pixel with its neighbours. Both preserve statistical features of the original content, and text is especially recoverable. Open source tools that reverse pixelated text have been public since 2020.

While blue boxes remain, "generate redacted image" stays disabled. That is deliberate. The detector found something and you have not decided about it yet, and an image handed over in that state is an unredacted image.

## The remover lists what stays and what goes

Drop the photos with nothing to cover into the [File metadata remover](strip-metadata.md). Not a single bit of the image compression data is touched. What comes off is the EXIF, GPS, and device model segments, and the picture itself is unchanged. When it finishes, it lists segment by segment what was kept and what was removed.

## When a buyer asks you for ID

A common message after listing is that the buyer, to confirm you are not a scammer, would like a photo of your ID card or driving licence first.

The safer answer is no. A secondhand sale does not require either side to produce identity documents, and the platform itself will not ask you to send them to another user. If you are genuinely asked, switch to the platform's own verification instead, so the platform does the confirming and no identity images pass between you and the other person.

If you already sent something, read [personal data exposed or published](../help/index.md#Personal-data-exposed-or-published-doxxing).

## The same path applies well beyond secondhand sales

Any situation where photos leave your hands works the same way. Look at the picture first, then at the file.

- Photos from a flat viewing, to discuss with the people you will live with
- Event photos for a submission or a social media post
- Conversation screenshots for a platform report or for a lawyer
- Damage photos for an insurance claim or a repair quote

Both tools run in your browser and the photos never leave your device. Once the pages are saved to your device they work without a network connection. See [offline reading](../offline.md).
