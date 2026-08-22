---
title: File metadata remover
description: Strip EXIF, GPS, device model, authoring software and comment fields from photos, videos and PDFs without the file leaving your device. For photos and videos, not one byte of compressed data is touched.
icon: material/image-off-outline
offline_assets:
  # 這一份改成遇到 PDF 才動態載入，頁面裡沒有 script 標籤了。離線副本仍然要包含它，
  # 不然存下這一頁的人在斷網時處理不了 PDF。
  - utils/vendor/pdf-lib.min.js
---

# :material-image-off-outline: File metadata remover

<div id="stripmeta-tool"></div>

<script src="../../js/stripmeta.js"></script>

Two situations that come up:

- **You have just moved somewhere new and want to send a friend a photo to say you are safe**: Phones write GPS coordinates into the file by default. Your friend sees a photo; anyone looking for you sees a coordinate. Strip it before sending and the picture is unaffected.
- **You photographed something at an event and want to submit it to a newsroom**: The capture time and coordinates together point at who was standing where, and when. Strip them and the desk still receives the same image.

## When this helps

[What metadata is](../basics/metadata.md) notes that photos carry capture time, camera model and GPS coordinates, and that stripping EXIF before uploading is something anyone can do today at almost no cost.

The difficulty is how. Online strippers almost all require uploading the file first, and the people who need to strip metadata are precisely the ones who should not be handing over the original.

This page edits the file in your browser. Nothing leaves your device. The cleaned file is a new copy; your original is not touched.

## Which files this handles

| Format | What comes out | Image data |
|---|---|---|
| `.jpg` | EXIF, XMP, IPTC and Photoshop fields, comments | Not one byte touched |
| `.png` | EXIF, text fields, modification time | Not one byte touched |
| `.webp` | EXIF, XMP | Not one byte touched |
| `.gif` | Comments, application extensions (the animation loop setting stays) | Not one byte touched |
| `.mp4` `.mov` | User data area, encoder name, track handler name | Not one byte touched |
| `.pdf` | Title, author, authoring software, timestamps, XMP | Rewritten in full, see below |

For the first five, the descriptive sections come out whole and not one byte of the compressed image or media is touched, so the cleaned file decodes identically to the original. PDFs cannot carry that guarantee, for the reason given further down.

**Not handled**: HEIC/HEIF (what an iPhone shoots by default), TIFF, RAW, MKV, WebM, AVI and Office documents. When a file is not recognised the page says so, rather than quietly handing back something it did not process.

## What comes out, what stays

Inside a photo file, the image itself and the descriptive fields are stored separately. This page drops the descriptive part whole and does not touch a single byte of the image.

| Removed | What is inside |
|---|---|
| EXIF | Capture time, camera model, GPS coordinates, and a thumbnail that may never have been cropped |
| XMP | Descriptions written by Adobe software, often including location and author |
| IPTC and Photoshop fields | Caption, author, keywords |
| Comment fields | Arbitrary text carried inside the file |
| Modification time | When the file was last saved |

| Kept | Why |
|---|---|
| Colour profile | Removing it shifts the colours. These are usually standard profiles such as sRGB, which identify very little |
| Colour transform marker | Without it, a CMYK file destined for print comes out inverted |
| Basic compatibility information | Some viewers complain without it |
| The image itself | Removing it breaks the file |

That uncropped thumbnail deserves its own mention. Crop half a photo away and send it, and the thumbnail inside the EXIF may still hold the original full frame.

The tool lists every item removed and kept on screen, with the byte count of each and the segment identifier the file format uses. It does not decide these details on your behalf without showing you.

## Video works the same way

MP4 and MOV are handled too. A video shot on a phone records the location, device model and time just as a photo does, and it usually goes unnoticed for longer, because few people think to check a video's properties.

These files are containers nested one inside another, with the descriptive fields living in one of the layers. Dropping that layer whole requires no contact with the compressed audio or video, exactly as with photos, and the cleaned file decodes byte for byte identically to the original.

Three things come out:

- The user data area: title, author, capture coordinates, device model
- Encoder name and version, which points at the software or the phone model that processed the file
- The track's handler name, written differently by each platform, which amounts to a platform fingerprint

### One trace cannot be removed

Encoders write their own version into the compressed data itself. That is not a descriptive field; it is part of the audio and video data, interleaved with the picture.

Removing it means re-encoding, which costs quality and merely substitutes a new encoder's traces for the old ones. This page does not do that, but it does list what it found, so that you are not left believing the file came out clean.

## PDFs work differently

PDFs are handled too, but not the same way.

With photos and videos you can cut a section straight out. With a PDF you cannot. Every object in the format records its own byte position in a cross-reference table, so removing anything shifts everything after it and the whole table has to be rebuilt. Since PDF 1.5 it has also been common to compress several objects into a single stream, where the contents are not visible from outside at all.

So this part is handled by [pdf-lib](https://github.com/Hopding/pdf-lib){target="_blank"} (MIT, placed unmodified under `utils/vendor/`). It does the parsing and rewriting; this page only decides which fields come out.

What is removed:

- Document title, author, subject, keywords
- The software that produced the document, a field that often includes the operating system and version. Printing to PDF from a browser puts the full browser identification string here
- Creation and modification times
- The XMP block, where location, author and editing history can all be recorded

### Removing the reference is not removing the content

The XMP part holds a trap worth describing. Delete the reference that points to the XMP block from the document catalogue, save the file, and that content is still there in full. Nothing points at it, but open the file in a text search tool and the author and location are still findable.

Removing it properly means deleting the object itself from the document, which is what this tool does. One test in `tools/test_stripmeta.mjs` guards exactly that.

### PDFs come with no lossless guarantee

For photos and videos, not one byte of compressed data is touched and the cleaned file decodes identically to the original. PDFs cannot carry that guarantee, because the whole file is rewritten.

In testing, page content is not re-laid out and the rendered result is pixel-identical to the original. But if your PDF has forms, digital signatures or unusual interactive elements, a rewrite may not preserve them exactly. Keep the original of anything important.

## The cleaned image is identical to the original

This page does not re-encode. Image and media data start at a fixed point in the file and are copied byte for byte from there.

Re-encoding tools cannot make that claim. Each pass loses quality, and each leaves its own processing signature in the output, which is itself a distinguishing feature. A file cleaned with mat2 is recognisably a file cleaned with mat2.

Because it is lossless, the file barely shrinks. A 630 KB photo comes out at 629 KB once its EXIF is gone. Those 140 bytes were where the camera model and coordinates lived.

## Unsupported formats

**HEIC/HEIF**: what an iPhone shoots by default. Its container is considerably more involved than this page handles. On an iPhone, Settings → Camera → Formats → Most Compatible switches future photos to JPEG. For photos already taken, sending them to yourself over AirDrop or email usually converts them.

**Beyond HEIC/HEIF**, TIFF, RAW, MKV, WebM, AVI and Office documents are not handled either.

## What this page does not do

No face blurring. That requires a face detection model and is an entirely different job, one that should not ride along under the same tool's name.

Annotations and attachments inside a PDF can carry their own authors and timestamps. This page handles document-level descriptive fields only and says so on screen when it meets such a file.

Also worth saying: removing metadata does not make a file safe. Street signs, door numbers, uniforms, the view through a window are all in the image itself, and this page does not touch them. Look at the picture before you send it.

## The cleaned file is opened once before you get it

Every cleaned file is loaded in the browser before it is handed to you. For video it waits until the duration reads back, which is the symptom a damaged video shows first. If this page's code has damaged it, that step catches it and says so plainly rather than leaving you with a photo that will not open. Your original is untouched throughout.

## Works offline

Like the rest of this section, the code is stored on your device and runs without a network. Working with the network off is the most direct proof that nothing is being sent anywhere.

To take this page with you, see [offline reading](../offline.md).
