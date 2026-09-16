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

<script src="../../js/webrtc-lab.js"></script>

## Why measure this

Offline content on this site can only be updated over the network today. The [QR code frame stream](../utils/qr-stream.md) carries one to three KB per second, which rules out moving a few MB of offline content.

A direct connection inside one local network is far faster. The cost is that both devices first have to exchange a description of the connection, and that step normally relies on a server. Squeeze that description small enough and it fits in a QR code, which removes the server from the path entirely. This page measures how large that description is and how fast the transfer actually runs.

## Running it on two devices

Put both devices on the same network. A hotspot you run yourself is the most predictable. On one device press "I start", then hand the whole description to the other device. On the other press "The other side starts", paste, apply, and hand its description back.

The description can travel any way you like: written on paper, turned into an image with the [QR code generator](../utils/qrcode.md) for the other device to scan, or copied and pasted when both devices are yours.

Once connected, either side can send. The receiving side computes SHA-256 and compares it against the source, and a run only counts when they match.

## Where it is known to fail

Public Wi-Fi usually isolates clients from each other, which is exactly the setting where this would be most useful. On such a network this page finishes gathering candidates and then fails to connect.

Tor Browser disables WebRTC because it leaks your real IP, so that build cannot use this page.

Corporate and some guest networks block multicast, which stops the `.local` names browsers use to find each other from resolving.

## This page sends nothing

There is no fetch, XMLHttpRequest, sendBeacon or WebSocket here, and no external resource is loaded. The connection settings carry no STUN and no TURN server, so a connection only happens through candidate addresses inside the same local network.

File contents move only between the two devices. On export, IP addresses and mDNS names are masked before anything is written to the file.

## Report what you find

Before sending, fill in the field in step 5 with this run's setup, for example "own hotspot, Mac Chrome to iPhone Safari". That line rides along with every log entry, which is what makes the results line up later.

Press "Export log", save the JSON, and attach it to [issue #553](https://github.com/anoni-net/docs/issues/553){target="_blank"}. Export from both devices, so that timings from the sending and the receiving side are both there.

Failures are just as useful. One of the criteria is how quickly a failure becomes visible, and three minutes of a spinner is a very different experience from a clear message saying it will not work here.
