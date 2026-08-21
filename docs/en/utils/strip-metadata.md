---
title: Photo metadata remover
description: Strip EXIF, GPS, camera model and comment fields from photos without the file leaving your device. The compressed image data is untouched, so the cleaned file is identical to the original.
icon: material/image-off-outline
---

# :material-image-off-outline: Photo metadata remover

<div id="stripmeta-tool"></div>

<script src="../../js/stripmeta.js"></script>

## When this helps

[What metadata is](../basics/metadata.md) notes that photos carry capture time, camera model and GPS coordinates, and that stripping EXIF before uploading is something anyone can do today at almost no cost.

The difficulty is how. Online strippers almost all require uploading the file first, and the people who need to strip metadata are precisely the ones who should not be handing over the original.

This page edits the file in your browser. Nothing leaves your device. The cleaned file is a new copy; your original is not touched.

## What comes out, what stays

A JPEG keeps its metadata in marker segments near the start of the file; a PNG keeps its in separate chunks. Either way, whole segments are dropped and the image itself is not touched.

| Removed | What is inside |
|---|---|
| EXIF (JPEG `APP1`, PNG `eXIf`) | Capture time, camera model, GPS coordinates, and a thumbnail that may never have been cropped |
| XMP | Descriptions written by Adobe software, often including location and author |
| IPTC and Photoshop fields (`APP13`) | Caption, author, keywords |
| Comment fields (JPEG `0xFFFE`, PNG `tEXt`, `zTXt`, `iTXt`) | Arbitrary text carried inside the file |
| Modification time (PNG `tIME`) | When the file was last saved |

| Kept | Why |
|---|---|
| ICC colour profile | Removing it shifts the colours. These profiles are usually standard ones such as sRGB, which identify very little |
| Adobe colour transform marker (`APP14`) | Without it, a CMYK JPEG comes out inverted |
| JFIF basics (`APP0`) | Some viewers complain without it |
| PNG image chunks (`IHDR`, `PLTE`, `IDAT`, `tRNS`, `gAMA`, `sRGB`, `iCCP` and so on) | These are the image. Removing them breaks it |

Every segment is listed on screen with its marker and byte count, kept and removed alike. The tool does not decide these details on your behalf without showing you.

## The cleaned image is identical to the original

This page does not re-encode. In a JPEG, everything from the SOS marker to the end of the file is copied byte for byte.

Re-encoding tools cannot make that claim. Each pass loses quality, and each leaves its own processing signature in the output, which is itself a distinguishing feature. A file cleaned with mat2 is recognisably a file cleaned with mat2.

Because it is lossless, the file barely shrinks. A 630 KB photo comes out at 629 KB once its EXIF is gone. Those 140 bytes were where the camera model and coordinates lived.

## Unsupported formats

**HEIC/HEIF**: what an iPhone shoots by default. Its container is considerably more involved than this page handles. On an iPhone, Settings → Camera → Formats → Most Compatible switches future photos to JPEG. For photos already taken, sending them to yourself over AirDrop or email usually converts them.

**WebP, GIF, PDF, video**: none of these are supported. This page handles JPEG and PNG. PDF metadata is scattered across several places and video metadata sits in the container structure; both need separate handling.

## What this page does not do

No face blurring. That requires a face detection model and is an entirely different job, one that should not ride along under the same tool's name.

Also worth saying: removing metadata does not make a photo safe. Street signs, door numbers, uniforms, the view through a window are all in the image itself, and this page does not touch them. Look at the picture before you send it.

## The cleaned file is opened once before you get it

Every cleaned file is loaded in the browser before it is handed to you. If this page's code has damaged it, that step catches it and says so plainly rather than leaving you with a photo that will not open. Your original is untouched throughout.

## Works offline

Like the rest of this section, the code is stored on your device and runs without a network. Working with the network off is the most direct proof that nothing is being sent anywhere.

To take this page with you, see [offline reading](../offline.md).
