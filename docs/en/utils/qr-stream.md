---
title: QR code frame stream
description: Turn a file into a run of QR codes that flip past on screen, point another device's camera at it, and the file is rebuilt on the other side. No connection between the two devices, no Bluetooth, no shared Wi-Fi, only a screen and a lens.
icon: material/animation-play-outline
---

# :material-animation-play-outline: QR code frame stream

<div id="qr-stream-tool"></div>

<script src="../vendor/qrcode-generator.js"></script>
<script src="../vendor/jsQR.js"></script>
<script src="../../js/qrstream.js"></script>

## When you would reach for this

Three situations, shallow to deep. Matching only the first one is enough.

**Something on your phone needs to get onto the laptop next to you, and the network in the room is not yours**. A café, an airport, someone else's meeting room: you have no idea who runs that Wi-Fi. Messaging it to yourself leaves a copy on somebody's server, and a USB stick or a cable is only useful if you brought one. Plugging the phone into someone else's computer also brings up that dialogue asking whether to trust this device, which is a decision in its own right. This page lets you hold the phone screen up to the laptop's camera and the file goes across.

**You want to hand something to the person in front of you without either of you leaving a record of the exchange**. Swapping PGP public keys, passing a Tor bridge line, handing over a signed file. Send that through a chat app and the two accounts are now recorded as a pair on somebody's server.

**One of the machines is deliberately offline and something has to get in or out**. A machine kept off the network to hold keys or produce signatures: plugging in a USB stick defeats the reason it is offline. This page only needs it to have a screen or a camera. To use it on such a machine, [save this page for offline use](#What-is-left-on-the-devices-afterwards) before the machine goes offline, and it never needs to touch a network again.

What the three have in common: the file is small, both devices are within arm's reach, and you would rather it went nowhere near a network.

If you just need to send a colleague a file and you do not mind it crossing a network, use whatever you already use. This page gains you nothing and is slower.

## How it works

The file is cut into small pieces, each piece is drawn as a QR code, and the codes flip past on screen like a short animation. The other device points a camera at it, collects each code it sees, and once it has the whole set it rebuilds the original.

The two devices are never connected. Nothing is paired over Bluetooth, they need not share a Wi-Fi network, and no server is involved. Only light passes between them.

Three things people ask straight away:

- **One person is enough**. Both devices being your own is fine, and phone to laptop is the most common use
- **One to many works**. Ten phones can film the same screen at once and each collects the full set independently, so handing the same config to a whole workshop means playing it once. What limits this in practice is position: every phone needs to be close, square on, and filling half its view with the code, so the outer ring of a crowd will mostly fail. With a group, use a projector or a large screen and turn the data per frame down
- **Either direction**. Which device sends and which receives is your choice each time, and both sides live on this one page

## Two words

The rest of the page leans on these, so they are worth fixing first, otherwise the numbers will not make sense.

**A frame** is one QR code on the screen. A file is cut into many frames, played one after another.

**A module** is one of the small black or white squares inside a single QR code. One QR code is a grid of a few thousand modules.

## First, see what it is good for

This channel is slow. It carries roughly one to three KB per second. Slowness is the price of the approach, so look at the numbers before deciding to use it.

The table below uses the "medium" setting. Data per frame comes in small, medium, large and extra large, medium being the default, and [the full comparison is further down](#What-the-two-controls-actually-change). For now, what it can carry:

| What you are sending | Rough size | Frames | One full pass |
|---|---|---|---|
| One Tor bridge line | 0.2 KB | 2 | under a second |
| A PGP public key | 10 KB | 27 | 5 seconds |
| A signed text file | 50 KB | 129 | 26 seconds |
| A photo from a phone | 3 MB | over the limit | cannot be sent |

The tool refuses files over 512 KB. That number measures human patience rather than any technical ceiling: 512 KB at the default setting becomes 1302 frames and a four minute twenty pass, and collecting them usually takes more than one pass, so you would be holding two devices still for over ten minutes. The browser copes with far more. The person does not. The largest setting at the fastest speed brings a pass down to 42 seconds, though holding that steady takes good conditions.

The ceiling on this channel is roughly 12 KB per second. That comes from the largest setting (1264 bytes a frame) at the fastest speed (10 frames a second), assuming every frame is read. A 5 MB PDF would take seven minutes at that rate, with nothing dropped and nothing replayed, which in practice means holding two devices still for well over ten minutes. Files that size are beyond what this tool does, and beyond what it should try to do.

Send anything larger another way: [OnionShare](../tools/onionshare.md) if there is a network, a USB stick if there is not. This page suits things in the range of a few KB to a few tens of KB: keys, config files, signatures, short text.

Once you choose a file the tool works out how many frames it becomes and how long a pass takes. That figure beats the table above, because it is calculated from your file and your settings.

## How to use it

You need two devices, one holding the file and one receiving it. Open this page on both.

!!! warning "Decide whether what you are sending needs encrypting first"

    QR codes are not encrypted. Anyone who photographs the playback can rebuild the file. How to judge that, and what to do about it, is in [what you send is sitting in the open](#What-you-send-is-sitting-in-the-open).

**On the device holding the file**, tap "Send":

1. Choose a file, or drop one onto that area
2. Wait for it to finish working, and it will tell you the frame count and pass length
3. Tap "Start playing", then **hold the screen still**

**On the device receiving**, tap "Receive". That side is three steps too:

1. **Turn on the camera**. The browser asks for permission, so grant it
2. **Point it at the other screen**. Keep the whole QR code in view, filling half the frame or more. The count climbs in real time and the row of small squares below fills in one at a time
3. **Save once the set is complete**. The filename, the checksum result and a save button appear

Steps you have not reached yet are dimmed and cannot be clicked, so follow whichever one is lit.

Two things are worth knowing up front.

The sending device **has no idea how much has arrived**. All it can do is loop through the frames in order. So do not stop before the other side says it is done, and do not assume one pass is enough.

The screen going dark partway through is the most common interruption. Extend the screen lock timeout before you start.

### If you would rather not grant camera permission

The receiving side has a second route: "read a video or photos instead".

Record the other screen with your phone's ordinary camera app, then drop the video file onto this page and the tool walks through it frame by frame. That route never touches camera permission, and it works in Tor Browser. A burst of stills works too.

!!! danger "Delete the recording afterwards"

    That video lands in your camera roll, and camera rolls usually have cloud backup switched on. Avoiding the camera permission would then have uploaded the entire file to somebody else's server.

    **Order matters here: switch the camera roll's automatic backup off before you start recording.** Deleting afterwards does not catch a copy that already synced, and the upload can finish within seconds of you stopping the recording. Removing the local file leaves the cloud copy untouched. Deletion only guards against someone going through your camera roll later.

    Delete the video and empty "recently deleted" once the transfer is done as well, as a second layer. If this matters to you, the camera route is genuinely cleaner, because the picture never becomes a file at all.

## What the two controls actually change

"Data per frame" sets **how much each frame carries**. Carry more and each frame holds more modules, so each module is smaller and harder for a camera to resolve, but fewer frames are needed overall. Carry less and the opposite happens: the modules get bigger and easier to read, at the cost of more frames and a longer pass.

| Data per frame | Bytes per frame | Modules | Correction | Medium speed | Fastest |
|---|---|---|---|---|---|
| Small | 204 | 57 × 57 | M | 1.0 KB/s | 2.0 KB/s |
| Medium | 403 | 77 × 77 | M | 2.0 KB/s | 3.9 KB/s |
| Large | 849 | 97 × 97 | L | 4.1 KB/s | 8.3 KB/s |
| Extra large | 1264 | 117 × 117 | L | 6.2 KB/s | 12.3 KB/s |

The default "medium" is fine, and this table is for anyone who wants to know why. The correction column holds the level codes from the QR specification. There is nothing to choose there, since the tool derives it from the setting you pick.

The top two settings drop to the lower error correction level (L), which fits 28% more data into the same number of modules. What that costs is half the reflection the code can absorb, [measured below](#Why-a-frame-holds-so-little).

"Extra large" needs the conditions to be right: a larger screen on the sending side, decent light, the camera held close, and no lamp reflecting off the glass. When conditions are ordinary, use "medium", which holds up across devices and absorbs reflection.

"Playback speed" sets **how long each frame stays up**. Too fast and the frame is replaced before the camera has finished focusing and exposing, so what it captures is two frames smeared together and nothing is collected. Older phones and poorly lit rooms want the slow setting.

## When the other side cannot read the codes

Nothing arriving at all, or the count stalling halfway, in this order:

1. **Turn "data per frame" down**. This helps most. Bigger modules are far easier for a camera, and the only cost is a little more time
2. **Get closer**, so the code fills half of the other camera's view or more
3. **Turn "playback speed" down**, giving the camera longer to focus
4. **Raise the brightness on both screens** and move away from lights that reflect off the glass
5. **Shoot straight on**. A slight angle is fine, enough angle to lose the square is not

One more thing that helps: the receiving side lists **which frames are still missing**, written as numbers like `3-4` and `17`. Scattered gaps usually fill in on the next pass. A single long gap normally means the camera drifted or something blocked it for that stretch.

Photographing a screen produces the ripple pattern known as moiré. That is why the [QR code reader](qr-read.md) page tells you to screenshot rather than photograph a screen. Here there is no choice, so module size and distance matter more than they do there.

## Why it looks stalled partway through

The sending device cannot know what has arrived. All it does is loop `0`, `1`, `2` and around again. Whatever the receiving side missed only comes back on the next pass.

Mathematically this is the coupon collector problem: filling in a complete set gets harder the closer you are to finishing, because the ones you still need keep not showing up. The same thing happens here. The first ninety percent arrives quickly, and the last few take a while.

In good light at the right distance, one or two passes fill it. In poor conditions it stretches to three or four. It looks stalled, but the count on screen is still creeping up, so keep going and adjust distance and angle rather than stopping.

## What you send is sitting in the open

A QR code is a way of drawing data as a picture, not a way of encrypting it. Anyone who photographs the playback can rebuild your file: a camera on the wall, the other phone's automatic photo backup, the person standing behind you.

If what you are sending is sensitive, **encrypt it on your own device first** and send the encrypted file through this page, passing the password through a different channel. [End-to-end encryption](../advanced/e2ee.md) covers how that works. In practice the two usual routes are encrypting to the recipient's PGP public key, or putting it in a password-protected archive.

There is no fixed rule for what counts as sensitive. One question usually settles it: if a third person in the room photographed this, would anyone be affected? A public key is fine, since it is meant to be public. A Tor bridge line is not, because it could get that bridge blocked and cut other people off. Contact lists, drafts and unpublished documents all count.

The tool computes a checksum (SHA-256) of the file and puts it in the first frame. Think of a checksum as the file's fingerprint: the sending side takes one print and sends it along, the receiving side takes another once it has reassembled, and matching prints mean not a single bit went astray. The result is stated plainly on screen once the set is complete.

Note what the fingerprint does and does not show. It proves **the file did not get corrupted in transit**. It says nothing about **who gave it to you**, which you still have to establish some other way: checking a PGP fingerprint face to face, or confirming through a [channel where trust already exists](../tools/messaging-comparison.md).

## How does this compare to a USB stick

This is the comparison people actually reach for, since a USB stick also avoids the network and also emits no wireless signal. Honestly, each side wins some.

This page wins on three counts. You never hand over a physical object, so there is nothing to get back afterwards. You never put your stick into their machine or their stick into yours, and each of those is a two-way risk. And the sending side finishes without an extra physical object containing that file for anyone to find.

That third point holds for the sending side only. However the receiving side obtains a file, it ends up on their device, which [what is left on the devices afterwards](#What-is-left-on-the-devices-afterwards) covers.

The USB stick wins on three counts. It is far faster, moving several MB in a second. The gesture is small, over in a moment, rather than two people holding phones steady at each other. And there is no camera permission, no browser and no battery to worry about.

What is the same on both sides deserves stating plainly: once the file reaches the other device, it is sitting there in the clear. This page protects the transfer from crossing a network and from leaving a record of a connection. It does not protect the file from being read once it has arrived. If your worry is that the other device gets inspected later, encrypt first, which has nothing to do with whether you used a USB stick.

## What is left on the devices afterwards

This section is for anyone using it somewhere the devices might be inspected later.

The tool writes nothing to local storage. No localStorage, no IndexedDB, no cookies, and nothing put in a cache. The file you choose and the contents you receive live only in the tab's memory and are gone when the tab closes.

The saved file is an ordinary file. Once you press save it sits in the downloads folder like anything else and appears in the browser's download history, cleared the same way you clear any download.

A video recorded with the camera stays in the camera roll. See the "if you would rather not grant camera permission" section above. That is the residue most easily overlooked.

The per-transfer identifier is not a lead. Each frame carries a `sessionId` whose only job is letting the receiving side notice the other side switched files. It is drawn fresh at random for every file, tied to no device and never stored, so two files received on the same device carry unrelated identifiers and cannot be used to infer one operator behind both.

The page itself has to be loaded once. Opening it the first time needs a network, because the code is downloaded from the site. To use it somewhere genuinely offline, open this page while you still have a connection and [save it for offline use](../offline.md) beforehand.

## Why there is no Wi-Fi or Bluetooth version

The most frequent question. The short answer is that browsers do not have those capabilities, which has nothing to do with whether we want to build it.

### On the Bluetooth side

The Bluetooth features a browser can reach were designed for exchanging very short values with fitness bands, scales and similar small devices. File transfer is simply not in that specification. On top of that a web page can only play the role of connecting out to something else, never of being connected to, so two web pages never see each other. And Firefox does not implement the feature at all, which means Tor Browser, built on Firefox, does not either.

### On the Wi-Fi side

A web page cannot reach Wi-Fi at all. It cannot scan for nearby networks and it cannot open a channel for someone to connect into. The only peer-to-peer path on a local network is the technology behind video calls (WebRTC), and Tor Browser disables that outright because it leaks your real IP. Public Wi-Fi also routinely forbids devices on the same network from talking to each other, which is precisely the setting where you would want this.

Take those away and one channel remains: a screen and a lens. Slow, but reachable from a browser, and usable in Tor Browser.

Keeping every radio off carries a further benefit. There is no connection between the two devices for anyone to detect, and no wireless signal left behind. Where you are being watched, that outweighs speed.

---

## For anyone implementing the other side

What follows is the wire specification, for anyone writing their own implementation. Ordinary use does not need any of it, so feel free to skip to [whose code this uses](#Whose-code-this-uses).

Crossing a deliberately unbridged gap with a screen and a lens is called air-gapped transfer. A hardware wallet carrying transaction data into an offline machine to be signed, then carrying the signature back out, is doing exactly what this page does.

Every frame is raw bytes in QR byte mode. QR codes offer several ways of packing data, and byte mode is the one that accepts arbitrary bytes, so archives and signature files travel just as well as text.

| Offset | Size | Field |
|---|---|---|
| 0 | 1 | `0xA1`, magic and version |
| 1-2 | 2 | sessionId, used to notice the other side switching files |
| 3-4 | 2 | total frame count, frame `0` included |
| 5-6 | 2 | this frame's number |
| 7 on | variable | payload |
| last 2 | 2 | CRC-16/CCITT-FALSE over every byte before it |

A mismatch in either sessionId or the total frame count makes the receiving side discard everything it has collected and start over, saying so on screen. Both ends of this tool do that, so users have nothing to worry about here.

What matters if you are writing the other end is the consequence of skipping that check: frames from two different files mixed together reassemble into something nobody ever sent, and if the sending side attached no checksum the recipient never finds out.

Frame `0` carries JSON: `n` filename, `s` original size, `c` bytes actually sent (omitted when uncompressed), `h` SHA-256 of the original, `z` whether deflate-raw compression was applied. Frames from `1` onward concatenate in numerical order to give the file.

### Why a frame holds so little

The specification tops out at version 40 with level L: 2953 bytes. The largest setting here is 988, a third of that. Two reasons, both measured.

#### Version stops at 25 because anything higher fails to decode

What decides it is how many pixels one module occupies in the other camera's captured image. Holding the framing fixed (the code spanning 768 pixels of the capture, roughly 60% of the width) and sweeping versions, the cliff sits between 4.5 and 5 pixels per module:

| Version | Modules | Camera pixels per module | Decode rate |
|---|---|---|---|
| 25 | 117 × 117 | 6.1 | 100% |
| 30 | 137 × 137 | 5.3 | 90% |
| 35 | 157 × 157 | 4.7 | 70% |
| 40 | 177 × 177 | 4.2 | 0% |

Version 30 looks like it only loses ten percent, and the real cost is far worse. With no feedback channel, a per-frame success rate of 0.9 pushes the expected number of passes from one to over two, which the extra 38% per frame does not come close to repaying. Sending the same file at version 30 ends up more than fifty percent slower than at version 25. That is the coupon collector problem above, made concrete.

#### The lower two settings use M, the upper two use L

The same measurement shows L and M decoding identically once resolution runs short: the failure is that the whole code becomes unreadable, which error correction cannot address. What it does protect against is localised damage, such as the blown-out patch where a ceiling light reflects off the glass:

| Level | Bytes at version 25 | 5% blown out | 10% blown out | 15% blown out |
|---|---|---|---|---|
| L | 1264 | readable | fails | fails |
| M | 988 | readable | readable | fails |
| Q | 706 | readable | readable | mostly readable |

Moving from M to L at the same version leaves the module count untouched and adds 28% more data. In resolution terms it is free, and what it spends is the margin against reflection.

So the four settings split into two halves. The upper two use L: reaching for them means asking for speed, and they already need good conditions to work at all. The lower two keep M, because they are where you retreat to when nothing is being read, and a fallback should not itself be fragile. A reflection covering a tenth of the code is routine indoors, which is exactly the band where L dies and M survives.

The script behind these numbers is `tools/measure_qrstream_density.mjs` and can be re-run. It models defocus, sensor noise and reflection, but not moiré, perspective distortion or hand shake, so the figures are optimistic and real conditions are only worse. That is why the defaults keep a margin.

### Every frame still ends with a CRC

A CRC is a short check value confirming the frame was read correctly from start to finish. The QR layer already makes a mis-read unlikely, so this looks redundant, but the failure mode it removes is worth two bytes. Without it, one bad frame surfaces only when the whole set is in and the SHA-256 disagrees, by which point there is no way to tell which frame went wrong and the only option is to start over. With it, the bad frame is dropped on the spot and picked up again next pass.

### There is no fountain code

The coupon collector problem above has a purpose-built answer: a fountain code, where receiving enough frames reconstructs the file regardless of which ones arrived. It is not implemented here, because that format cannot be worked through by hand, and part of the point of this page is that anyone can check what it does.

## Whose code this uses

Encoding is handled by [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator){target="_blank"} (MIT) and decoding by [jsQR](https://github.com/cozmo/jsQR){target="_blank"} (Apache-2.0, [licence text](vendor/jsQR-LICENSE.txt)). Both sit unmodified under `utils/vendor/`, shared with the [generator](qrcode.md) and the [reader](qr-read.md). Every third-party component in this section is listed on the [tools index](index.md#Whose-code-this-uses).

The framing, reassembly and the checks around them are ours, tested in `tools/test_qrstream.mjs`. That suite drives the real path through both libraries (encode, rasterise, decode) and deliberately drops frames, reorders them, flips bytes and switches files mid-stream to confirm each one produces the outcome it should.

The interface has two more. `tools/check_qrstream_ui.mjs` runs the whole script against a DOM stand-in to check the wiring. `tools/check_qrstream_browser.mjs` drives a real browser, measures every piece of text against WCAG AA contrast, and feeds a Y4M file in as a fake camera so the receiving path runs from getUserMedia through to the saved file. That camera path cannot be tested without a real browser, and it is the main way this page gets used.

## Works offline

Like everything else in this section, the code is stored with the page and runs with no network. To carry it with you, see [reading offline](../offline.md).

Working offline means something extra here: two devices with their radios off can still complete a transfer, which is itself the proof that the file passed through no server. To check, put both into airplane mode and send it again.
