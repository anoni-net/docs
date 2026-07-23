---
title: Tor Snowflake
description: Open a browser tab and help Tor users in censored regions connect. If your own connectivity is unfiltered, it is the lowest-barrier way to contribute to internet freedom.
icon: material/snowflake
---
# :material-snowflake: Tor Snowflake bridge

Open a browser tab and help people in censored places connect to the Tor network. No install, no server; the tab running is the whole job.

## Why run Snowflake

In heavily censored places like Iran, China, or Belarus, Tor's entry nodes are detected and blocked over the long term. To reach Tor, local users have to route around this through "bridges" that outside volunteers provide. Snowflake turns your browser into a temporary bridge: a Tor user in a censored region connects to the Tor network through your browser. For the wider censorship picture, see the [regional observatory](../regional/index.md).

If your own connectivity is open and unfiltered, this is the lowest-barrier way to contribute to internet freedom:

- A region with low outbound censorship and ample bandwidth is a good source of bridges.
- It needs far less than running a Tor relay: no server, no dedicated bandwidth, no operations (the FAQ compares the two).
- It suits anyone who leaves a computer on during the day and can let a tab run in the background.

!!! warning "Hong Kong readers: assess the risk before taking part"

    The same technique works in Hong Kong, but factor national-security surveillance in first. Snowflake turns your browser into a node that forwards Tor traffic for others, and during pairing the user connecting through you can see your IP address. Under the 2020 National Security Law and the device-decryption powers that took effect in March 2026 — police investigating a national-security case can demand your device password under warrant, and refusing carries up to a year in prison — if your device is searched, the question of "why is your browser helping people in censored regions reach Tor" could draw extra attention. Running Snowflake is itself lawful; the risk is what a device search could construe from it. For the wider context, see the regional section of [VPN: risks and how to choose](./vpn-guide.md#Regional-context-the-Sinophone-Asia-Pacific).

## What you should know first

A few things to understand before you start Snowflake:

- **It does not leak your real IP to the destination.** After a Tor user in a censored region connects through you, their requests pass through Tor's layered encryption and leave from a Tor exit node. The destination site sees the exit node, not your IP.
- **You cannot see what anyone is doing.** Traffic is only relayed in your browser; the content is already Tor-encrypted and unreadable.
- **Your IP is not published as a fixed bridge, but the connecting client sees it during pairing.** Snowflake uses short-lived pairing, unlike the public list of traditional Tor bridges, so IPs churn. Its aim is to stay off public bridge lists, not to make your IP fully invisible; the client you pair with still sees your IP at that moment. (This is the fact the Hong Kong note above turns on.)
- **Bandwidth impact is small.** The default is barely noticeable for everyday browsing. The extension lets you cap traffic.
- **Check the policy on corporate or campus networks first.** Running Snowflake on a work or school network uses that network's IP to forward third-party traffic. In environments with strict information policy (finance, government, research), ask IT first.

## Start a browser-tab bridge

<div class="grid cards" markdown>

-   <iframe src="https://snowflake.torproject.org/embed.html" width="100%" height="250" frameborder="0" scrolling="no"></iframe>

-
    - Click the "ON" button in the widget.
    - This tab can run in the background without affecting other work.
    - Once on, the widget shows whether someone is connecting through you.
    - Closing the tab stops it; no settings are left behind.

</div>

??? note "No widget, or nothing happens when you press ON"

    - Confirm your browser allows WebRTC. Most browsers enable it by default; corporate or school networks may block it.
    - Try switching to a network without a forced captive portal (home, mobile).
    - Switch to the browser-extension version (see below).

## Better for an always-on machine: the browser extension

If your computer is on for long stretches, the extension version is better than a tab:

- Starts automatically, so you do not have to keep a tab open.
- Traffic cap and on/off are adjustable in settings.
- Runs directly after install, without affecting other browsing.

<div class="grid cards" markdown>

- [:material-firefox: Firefox extension](https://addons.mozilla.org/en-US/firefox/addon/torproject-snowflake/){target="_blank"}
- [:material-google-chrome: Chrome extension](https://chromewebstore.google.com/detail/snowflake/mafpmfcccpbjnhfhjnllmmalhifmlcie){target="_blank"}
- [:material-web: Official page](https://snowflake.torproject.org/){target="_blank"}

</div>

## FAQ

??? question "How long do I need to leave it on?"

    There is no minimum. It gets assigned connections whenever it is open. But flipping it on and off briefly is far less useful than a few continuous hours; leaving the tab running in the background during your working hours works best.

??? question "I use Tor myself. Does running Snowflake mix with my own traffic?"

    No. Snowflake is "outbound," turning your browser into a bridge that forwards others' traffic. Tor Browser is "inbound": you connect to the Tor network. On your machine they are separate processes and do not affect each other.

??? question "Can I run it on a phone?"

    Yes, but with limited effect. Mobile networks change IP often, and the OS cuts WebRTC connections once the app goes to the background. For sustained contribution, use a desktop or laptop.

??? question "How does it compare with running a Tor relay?"

    The contribution scale and the setup barrier are both very different. A Tor relay offers stable relaying capacity and needs a public IP and a server that runs around the clock. Snowflake offers a short-lived bridge and runs with a tab open, the lowest barrier there is. If you have stable upstream bandwidth and operations capacity, a relay contributes at a larger scale (see the [Tor Project relay guide](https://community.torproject.org/relay/){target="_blank"}). For an ordinary browsing connection, Snowflake is a fitting place to start.

??? question "Can I run Snowflake with a VPN on?"

    Technically yes, but the traffic goes through the VPN provider, so what bridges Tor is the VPN's IP and ASN, not your local network. If you want to keep your Snowflake IP from being observed, a VPN is a reasonable choice. If you want to contribute your local network's ASN diversity and bandwidth, run it on your local connection directly.

??? question "My home is IPv6-only or behind CGNAT. Can I run it?"

    Snowflake uses WebRTC with STUN/TURN traversal, so most home NAT setups work. CGNAT has a lower traversal success rate but does not fail outright. IPv6-only currently has some compatibility limits on the Snowflake side; see the [official Snowflake page](https://snowflake.torproject.org/){target="_blank"} for the latest status.

## Learn alongside

<div class="grid cards" markdown>

- [:material-chat-question: Why networked freedom matters](../basics/internet-freedom.md)
- [:material-web: Tor Project Support](https://support.torproject.org/){target="_blank"}
- [:material-toolbox-outline: Tools overview](./index.md)

</div>

## Projects you can join next

<div class="grid cards" markdown>

- [:material-tunnel-outline: How to run a Tor WebTunnel bridge](../community/setup-tor-webtunnel.md)
- [:material-server-network: Tor Project relay guide](https://community.torproject.org/relay/){target="_blank"}
- [:material-translate-variant: Localization and doc translation](../community/i18n.md)

</div>
