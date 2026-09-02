---
title: File metadata stripper
description: Remove EXIF, GPS, device model, producer software and comment fields from photos, video and PDFs. The file never leaves your device, and the compressed image data is not touched.
icon: material/image-off-outline
offline_assets:
  # The vendor file is loaded on demand when a PDF arrives, so the page carries no
  # script tag for it. Offline copies still need it, otherwise anyone who saved this
  # page cannot process a PDF while disconnected.
  - utils/vendor/pdf-lib.min.js
---

# :material-image-off-outline: File metadata stripper

<div id="stripmeta-tool"></div>

<script src="../../js/stripmeta.js"></script>

## When this helps

[What metadata is](../basics/metadata.md) notes that photos carry capture time, camera model and GPS coordinates. Stripping EXIF before uploading is something anyone can do today at almost no cost.

The difficulty is how. Online strippers almost all require uploading the file first, and the people who need to strip metadata are usually the ones who should not be handing over the original. This page works in your browser, the file never leaves your device, and what you get back is a new copy with the original left alone.

Three situations that come up:

- **You have just moved somewhere new and want to send a friend a photo to say you are safe**: Phones write GPS coordinates into the file by default. Your friend sees a photo, anyone looking for you sees a coordinate. Strip it before sending and the picture is unaffected.
- **You photographed something at a protest or an accident and want to submit it to a newsroom**: The capture time and coordinates together point at who was standing where, and when. Strip them and the desk still receives the same image.
- **You are about to send a petition, a whistleblowing letter or a CV as a PDF**: The author field often still holds the account name from your computer, and the producer field spells out your operating system and its version. Changing the name in the text leaves the old value in the fields.

Stripping metadata only deals with fields you cannot see. Street numbers, road signs, uniforms and the view out of the window are part of the image itself and survive the process, so look the picture over yourself before you share it. To cover something that is part of the picture, use [screenshot redaction](redact.md).

## Which files this handles

| Format | What comes out | Image data |
|---|---|---|
| `.jpg` | EXIF, XMP, IPTC and Photoshop fields, comments | Not one bit touched |
| `.png` | EXIF, text chunks, modification time | Not one bit touched |
| `.webp` | EXIF, XMP | Not one bit touched |
| `.gif` | Comments, application extensions (the animation loop setting stays) | Not one bit touched |
| `.mp4` `.mov` | User data, encoder name, track handler name | Not one bit touched |
| `.pdf` | Title, author, producer, timestamps, XMP | Rewritten in full, see below |

The first five formats have their descriptive sections removed whole, and the compressed image or audio-video data is left alone. PDF cannot offer the same guarantee, for the reason given under "PDF cannot be guaranteed lossless" below.

Other formats are not supported yet. The list and the workarounds are at the end of this page. When a file cannot be recognised, the page reports an error rather than quietly handing back something it never processed.

## What comes out, what stays

In a photo file, the image itself and the descriptive fields are stored separately. The descriptive fields come out whole and the image data is untouched.

| Removed | What is in it |
|---|---|
| EXIF | Capture time, camera model, GPS coordinates, and an uncropped thumbnail |
| XMP | Descriptions written by Adobe software, frequently including location and author |
| IPTC and Photoshop fields | Captions, author, keywords |
| Comment fields | Arbitrary text carried inside the file |
| Modification time | When the file was last saved |

| Kept | Why |
|---|---|
| Colour profile (ICC Profile) | Colours shift without it, and the contents are usually a standard such as sRGB, so it identifies little |
| Colour transform marker | CMYK files for print come out inverted without it |
| Basic compatibility data | Some viewers warn when it is missing |
| The image itself | Removing it leaves a file that will not open or that renders wrong |

The uncropped thumbnail inside EXIF deserves its own mention. Crop a photo in half, send it out, and the thumbnail may still hold the original full frame.

The page lists everything it removed and everything it kept, each entry tagged with its identifier in the file format and how much space it took.

## The cleaned image is identical to the original

The page does not re-encode. Image and audio-video data are copied verbatim from their fixed position in the file, so what comes out decodes to exactly what went in.

Tools that re-encode cannot promise that. Every re-compression costs quality, and the output carries the default compression parameters of whichever library did the work rather than the ones the camera wrote — visible in a comparison of the quantisation tables, and a recognisable trace in its own right.

Being lossless also means the cleaned file is only slightly smaller. A 630 KB photo with a full EXIF block comes out at 629 KB, and those 140 bytes are where the camera model and the coordinates used to be.

## Every cleaned file is opened once before you get it

The cleaned file is loaded once in the browser before it is handed to you. For video the check waits until the duration can be read, which is the classic symptom of a corrupted edit. If the code damaged the file, that step catches it and reports why, rather than letting you walk away with a photo that will not open.

## Video works the same way

Video shot on a phone records the location, the device model and the time exactly as photos do, and it is harder to notice because most people never look at a video's properties.

MP4 and MOV are containers nested inside containers, with the descriptive fields living in one of those layers. Removing that layer whole never touches the compressed audio-video data, which is the same approach used for photos.

Three things are removed:

- User data (user data atom): title, author, capture coordinates, device model
- Encoder name and version: this identifies the software or the phone model that processed the file
- Track handler name: platforms write this differently, which makes it a platform fingerprint

### One trace cannot be removed

Encoders write their own version into the compressed data itself. That string is not a descriptive field, it is part of the audio-video data, sitting among the picture content.

Removing it would require re-encoding, which costs quality and only swaps the old encoder's trace for a new one. The page does not do that, and lists the strings it found in the results instead.

## PDF is handled differently

A photo or a video can have a section cut straight out. A PDF cannot. The position of every object in a PDF is held in the cross-reference table, so removing a section shifts everything after it and the whole table has to be recalculated. Since PDF 1.5 it is also common to compress several objects into a single stream, where the contents cannot be read from the outside at all.

Parsing and rewriting are handled by [pdf-lib](https://github.com/Hopding/pdf-lib){target="_blank"} (MIT licence, [full text](vendor/pdf-lib-LICENSE.txt)), placed unmodified under `utils/vendor/`. Which fields come out is specified here on the page.

What is removed:

- Document title, author, subject, keywords
- The software that produced the document, a field that often carries the operating system and its version. Printing to PDF from a browser leaves the complete browser identification string there
- Creation and modification timestamps
- The XMP block, where location, author and editing history may all be recorded

### Removing the reference is not removing the content

Delete the reference to XMP from the document catalogue, save the file again, and the block is still there in full with nothing pointing at it. A text search tool will still turn up the author and the location. Removing it properly means deleting the object itself, which is what the page does.

### PDF cannot be guaranteed lossless

A PDF is rewritten in full, so it cannot carry the "not one bit touched" guarantee that photos and video get.

In testing the page content does not reflow and the rendered result is pixel-identical to the original. If your PDF has forms, digital signatures or unusual interactive elements, though, they may not survive the rewrite intact. Keep a copy of the original for anything important.

## Unsupported formats

**HEIC/HEIF**: the iPhone default. Its container structure is considerably more complex and the page cannot handle it yet. On an iPhone you can go to Settings → Camera → Formats and choose "Most Compatible", after which new photos are JPEG. For photos already taken, sending them to yourself over AirDrop or email will usually convert them.

TIFF, RAW, MKV, WebM, AVI and Office documents are also unsupported for now.

## What this page does not do

No face blurring. Face blurring needs a face detection model, which is an entirely different job, and it should not be folded into a tool under this name.

Annotations and attachments inside a PDF can each carry their own author and timestamps. The page only handles document-level descriptive fields and flags files that carry annotations in the results.

## Works offline

Like the other tools in this section, the code runs from your device once it has been stored, with no network needed. Working while disconnected is the most direct evidence there is that the file is not being sent anywhere.

To take this page with you, see [offline reading](../offline.md).
