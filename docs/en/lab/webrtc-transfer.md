---
title: Device to device transfer
description: Two devices on the same network, a file moving straight from one to the other with no server in between. A lab measurement page for issue #553.
icon: material/lan-connect
search:
  exclude: true
---

# :material-lan-connect: Device to device transfer

Two devices join the same network and a file moves straight from one to the other. No server sits in between, and this site never receives a single byte of it.

This page belongs to the [lab](index.md). It exists to produce measurements rather than to be a tool you use every day.

<div id="webrtc-lab">
<noscript>
<div class="admonition warning">
<p class="admonition-title">This page needs JavaScript</p>
<p>The connection and the transfer both run on your device, so the browser has to execute code. Tor Browser also disables WebRTC completely, so that build cannot use this page even with JavaScript on.</p>
</div>
</noscript>
</div>

<script src="../../utils/vendor/qrcode-generator.js"></script>
<script src="../../utils/vendor/jsQR.js"></script>
<script src="../../js/webrtc-lab.js"></script>

## Why measure this

Offline content on this site can only be updated over the network today. The [QR code frame stream](../utils/qr-stream.md) carries one to three KB per second, which rules out moving a few MB of offline content.

A direct connection inside one local network is far faster. The cost is that both devices first have to exchange a description of the connection, and that step normally relies on a server. Squeeze that description small enough and it fits in a QR code, which removes the server from the path entirely. This page measures how large that description is and how fast the transfer actually runs.

## Running it on two devices

Put both devices on the same network. A hotspot you run yourself is the most predictable.

1. Press "Start" in step 1 on both devices. Step 2 shows each device's own QR code, and the camera opens
2. Point one device's camera at the other screen. The device that reads the code replies on its own, and its step 2 switches to a reply code
3. Point the other camera back at that reply. The connection opens as soon as it reads

Nobody has to agree on who goes first; either device can scan first. The camera asks for permission the first time it opens, and scanning only works once it is allowed. Camera frames are decoded inside this page and are not sent anywhere.

Step 3 can switch to the front camera. Hold two phones screen to screen and both front cameras see the other code at once, so the exchange in both directions happens in a single gesture. Front cameras are usually fixed focus, and how close they need to be is one of the numbers this round measures.

When the camera is not an option, copy the whole text block under step 2 to the other device, paste it into step 3 and press apply. The result is the same.

Once connected, either side can send. The receiving side computes SHA-256 and compares it against the source, and a run only counts when they match.

## Three devices or more

A third device does not need to scan every other device. One mutual scan with any device that is already connected is enough. Connected devices tell each other which devices they hold, and the device in the middle hands the connection descriptions across so the missing links open on their own. Step 4 marks each connection as either scanned directly or introduced by a named device.

Sending goes to every connected device at once, and step 5 lists timing and the hash check per device. Several devices share the same Wi-Fi channel, so each one runs slower than a one-to-one transfer, and how much slower is one of the numbers to measure.

## Comparing throughput

Step 5 has three transfer settings: chunk size, channels per connection, and parallel connections. The defaults are 64 KB, 1 channel and 1 connection. Change one at a time and leave the others at their defaults. Both sides log the settings used for each run, which is what lets the results show which setting made a difference.

Parallel connections open several connections between the same pair of devices, each with its own send window. When a phone's round trip time on Wi-Fi grows, the send window caps how much can go out per second, and more connections may help. The `rttMs` field in the log is that round trip time.

Before measuring, time an ordinary file download on the same network, for example by running `python3 -m http.server` on a computer and downloading a large file on the phone. That speed is roughly the ceiling of the network. Tuning the settings only matters when this page comes in well below it.

## Where it is known to fail

Public Wi-Fi usually isolates clients from each other, which is exactly the setting where this would be most useful. On such a network, if the connection has not opened 15 seconds after applying the reply, step 3 says so and suggests a hotspot you run yourself.

Tor Browser disables WebRTC because it leaks your real IP, so that build cannot use this page.

Corporate and some guest networks block multicast, which stops the `.local` names browsers use to find each other from resolving.

## This page sends nothing

There is no fetch, XMLHttpRequest, sendBeacon or WebSocket here, and no external resource is loaded. The connection settings carry no STUN and no TURN server, so a connection only happens through candidate addresses inside the same local network.

File contents move only between connected devices. When a device introduces two others, the connection descriptions pass only through that already connected device. On export, IP addresses and mDNS names are masked before anything is written to the file.

## Report what you find

Before sending, fill in the field in step 5 with this run's setup, for example "own hotspot, Mac Chrome to iPhone Safari". That line rides along with every log entry, which is what makes the results line up later.

Press "Export log", save the JSON, and attach it to [issue #553](https://github.com/anoni-net/docs/issues/553){target="_blank"}. Export from every device, so that timings from the sending and the receiving side are all there.

Failures are just as useful. One of the criteria is how quickly a failure becomes visible, and three minutes of a spinner is a very different experience from a clear message saying it will not work here.
