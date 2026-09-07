---
title: File hash comparison
description: Compute a file's SHA-256 and check it against the string you were given, to confirm that a hand-carried or downloaded file matches the original. Files are hashed in your browser, nothing is uploaded, and multi-gigabyte files work.
icon: material/file-compare
---

# :material-file-compare: File hash comparison

<div id="hash-tool"></div>

<script src="../../js/hash.js"></script>

## When this is useful

When a file travels without going over the network, the person receiving it has no way to confirm that what arrived is the whole thing.

- **A USB stick or memory card carried by hand:** it changed hands, it was crushed in a bag, it was pulled out mid-write. Any of these corrupts the file, and a corrupted file opens more often than you would expect, just with a section missing.
- **Sent with someone else:** what you want to confirm is that the copy that arrived matches the one you have.
- **An installer you downloaded:** Tor Browser, Tails and similar projects publish hashes, so check before installing.
- **After moving something between two devices:** once [QR code frame stream](qr-stream.md) or another method finishes, one check confirms the reassembled copy is complete.

During an outage this matters more; see [Preparing for and handling a network outage](../scenarios/shutdown.md). Physical delivery becomes the main channel, and the recipient does not get a second chance to ask for another copy.

## What a match means

Two files with the same SHA-256 have identical contents, down to the byte. Deliberately constructing two different files with the same SHA-256 is beyond what public research can currently do.

A mismatch means the contents differ. That could be an interrupted transfer, failing storage, or someone having altered it. The hash alone cannot tell you which.

## What this rests on

The whole value of the comparison rests on one thing: the hash in your hand really is the one they computed.

Whoever can swap the file can usually swap a hash sitting next to it. Put `hash.txt` on the USB stick alongside the file, and both get replaced together, and the comparison still matches.

So the hash has to travel a different route from the file: read it aloud in person, over a phone call, or through a messenger where you have already verified who you are talking to. This is the same reasoning as "the backup channel has to fail differently" on the [outage page](../scenarios/shutdown.md). Different failure conditions are what make it worth having.

Sixty-four characters is a lot to read out. In practice the first eight and last eight are enough to catch accidental corruption and casual substitution. Reading the whole string matters when the adversary could have done the computation in advance specifically for you.

## Encryption and hashing are separate jobs

[Local file encryption](age.md) keeps the contents from being read. A hash comparison confirms the contents did not change. The two are independent, an encrypted file can still be hashed, and it should be hashed after encryption, because the encrypted file is what actually travels.

## Why SHA-256

`MD5` and `SHA-1` both have published collisions: two different files can be made to produce the same value, which makes them unsafe for confirming a file was not altered. This page only does SHA-256.

SHA-256 is also what most projects publish. An `MD5` hash on a download page usually means the release information is old.

## Multi-gigabyte files work

The browser's built-in hashing interface wants the entire file at once. On a phone, reading a several-gigabyte video that way fails outright, and the failure looks like a tab that stopped responding.

This page implements SHA-256 itself and reads the file a block at a time, so memory use stays flat and progress can be shown. The risk of a hand-written implementation is that a wrong answer looks exactly as normal as a right one, so `tools/test_hash.mjs` cross-checks against three independent sources: the NIST test vectors, Node's built-in `crypto` module, and feeding the same data in different chunk sizes, which must all produce one value.

## You do not need this page

The command line already does this, and it requires trusting no web page at all:

- Linux and most BSDs: `sha256sum <file>`
- macOS: `shasum -a 256 <file>`
- Windows PowerShell: `Get-FileHash <file>`

All three produce the same value this page does. This page exists for when a browser is all you have: a borrowed computer, a tablet, or a colleague who does not work at a command line.

## Any format pastes fine

The hash you were given might be a bare string, `sha256sum` output (hash, two spaces, filename), or a whole list. Paste all of it. The tool pulls out every SHA-256 in there and checks whether your file's value is among them. Case does not matter.

## Works offline

Like the rest of this section, the code works with no network once it is on your device. Hand delivery tends to happen where there is no connection anyway. To take this page with you, see [Offline reading](../offline.md).

Files are hashed in your browser. Nothing is uploaded and nothing is written to any storage on the device. Closing the page clears it.
