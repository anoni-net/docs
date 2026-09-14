---
title: Handing things out at a workshop
description: The venue Wi-Fi belongs to the host, the projector works but file transfer does not, and twenty people have brought twenty different devices. This walkthrough covers what belongs on a printed QR code, what travels by screen and camera, what still needs a USB stick, and why the frame stream needs no separate hash check.
icon: material/presentation
---

# :material-presentation: Handing things out at a workshop

## Twenty people, one afternoon

The room is booked and the projector works. Participants bring their own devices: phones, laptops, tablets, at least three operating systems between them.

Several things have to reach them. A URL for the materials, a line of Tor bridge configuration, a configuration file of a few kilobytes, and a PDF of the materials that runs to forty-odd megabytes.

The venue Wi-Fi belongs to the host and the password is on the wall. Whether it can move files is one question. Whether you want twenty devices joining a network you do not control just to collect a file is another.

Anything that requires installing software is expensive here. Published training preparation guidance suggests budgeting 90 minutes to get a room of learners through installing one new tool, and the whole afternoon is three hours.

## Long strings go on a printed QR code

The materials URL, an onion address, and bridge configuration have one thing in common: they are long, easy to mistype, and nobody gets one right the first time.

Use the [QR code generator](qrcode.md) to turn the string into a QR code and download it as SVG. SVG scales without going fuzzy, so it is legible both projected on the screen and printed on A4 taped to the wall.

Nothing passes through a server along the way. A printed copy works in a venue with no connectivity, and the same sheet works again at the next session.

Bridge lines of eighty-odd characters especially deserve this treatment. Reading one out character by character produces a startling error rate, and the people who mistype it conclude the bridge is dead.

## Files of a few kilobytes travel by screen and camera

Configuration files, keys, and signatures in the range of a few to a few tens of kilobytes go through the [QR code frame stream](qr-stream.md). The file is split into a series of QR codes that cycle on your screen, and the other device reads them back with its camera and reassembles the original.

There is no pairing between the two devices, no shared network, and no server. Your laptop holds up its screen and the participant points a phone at it.

The channel is slow, roughly one to three kilobytes per second, and the tool refuses files over 512 KB. That number measures human patience rather than a technical ceiling: 512 KB at default settings plays for four minutes twenty, and one pass is usually not enough.

No separate hash check is needed afterwards. The sending side puts the original file's SHA-256 into the first frame, the receiving side computes it again once the pieces are assembled, and the screen tells you directly whether they match.

## Large files still need a USB stick

A forty-megabyte PDF is out of range for the frame stream, and forcing it would leave twenty people holding up phones for ten minutes.

If usable connectivity exists, [OnionShare](../tools/onionshare.md) is built for exactly this. Without connectivity, a USB stick going device to device is what is left.

That route adds a step. On your own machine, use [File hash comparison](hash.md) to compute the SHA-256 of the materials and project that string on the screen. Participants compute it again after copying and compare against what is on the wall.

This catches copy errors, and it also catches a stick whose contents were swapped somewhere along the way. Twenty people take turns with the same stick and you will not see what happens in between. Computing a hash requires no installation, [File hash comparison](hash.md) opens in a venue with no connectivity, and it handles files of several gigabytes.

## The same path applies well beyond workshops

Any setting where things go to the people in front of you works the same way:

- A club or reading group exchanging settings and links in the room
- A stall handing out an address to whoever walks up, with a printed QR code on the table
- Two people swapping keys in a café without going through the venue's Wi-Fi
- A venue losing connectivity, turning an online handout into an in-person one

These tools all run in your browser and nothing is sent out. Save the pages to your device beforehand and they work without a network connection. See [offline reading](../offline.md).
