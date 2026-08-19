---
title: Signal Proxy
description: Signal is blocked in Iran, China, and Russia. A proxy routes local users back to the service. How it works, how users apply one, what the operator can see, and what it takes to run one from an unfiltered network.
icon: material/transit-connection-variant
---
# :material-transit-connection-variant: Signal Proxy

A Signal Proxy is a relay host that sits in a place without blocking. A user in a censored region enters it into the Signal app, the app's connection goes to that host first, and the host passes it on to Signal's real servers. On the local network, it looks like the user is visiting an ordinary HTTPS website.

This page has two halves: the first for people who need a proxy to connect, the second for people who want to run one.

## Why Signal stops working in some places

Signal's server addresses are fixed, which makes it straightforward to block. The usual methods are dropping Signal's domains from DNS responses, blacklisting the server IPs, or reading the SNI field during the TLS handshake to identify the destination and cutting the connection. From the app's side, it just sits on "connecting" and messages never send.

Known blocking milestones:

- **Iran** — blocked at scale from February 2021. Signal responded by [asking the community to run proxies](https://signal.org/blog/help-iran-reconnect/){target="_blank"}.
- **China** — needs a proxy or other circumvention since March 2021, and the app was pulled from the China App Store.
- **Russia** — restricted by the regulator from August 2024.

A proxy addresses the connection, nothing else. Registration needs an SMS code that travels over the mobile network, which a proxy cannot help with. The main case is someone who already has an account and needs to reach the service again from a censored network.

## How it works

Signal's approach is a TLS proxy, and it differs from an ordinary HTTP proxy in one important way. Connecting through a standard HTTP proxy starts with a plaintext `CONNECT` request naming the destination, which tells any censorship system watching that a proxy is in use. Signal TLS Proxy has no such step: the whole connection is encrypted HTTPS from the first packet, and every proxy carries a valid TLS certificate, so on the wire it is hard to tell apart from ordinary web browsing.

The server side only forwards traffic to Signal's servers, and non-Signal traffic is rejected. This is not a general-purpose circumvention proxy — you cannot use it to reach other blocked sites.

End-to-end encryption is untouched throughout. Messages are encrypted on your device and decrypted on your contact's device; what passes through the proxy is TLS traffic it cannot read.

### Which kinds of blocking it defeats

A TLS proxy answers the "Signal's server addresses are blocked" family of censorship. When the system identifies destinations through DNS, IP blacklists, or SNI filtering, pointing the connection at a host that isn't on any list yet is enough to get around it.

Stronger censorship needs a separate assessment. China's Great Firewall performs active probing — connecting to suspicious hosts to test whether they are proxies — and its DPI is more capable than most. A Signal Proxy is not guaranteed to work there, and users in that situation need fallbacks: see [WebTunnel bridges](../community/setup-tor-webtunnel.md), [Tor Snowflake](./tor-snowflake.md), and the obfuscation-protocol section of [VPN: risks and how to choose](./vpn-guide.md).

## How users apply a proxy

### One-tap setup with a share link

Signal for Android and iOS both register to handle links on the `signal.tube` domain. An operator's share link looks like this:

```
https://signal.tube/#proxy.example.com
```

Tapping that link on a phone hands off to the Signal app, which fills the hostname after the `#` into its proxy setting. This is the least error-prone route, and it saves anyone from having to find the right menu.

### Entering it by hand

If what you have is a hostname rather than a link, find the proxy field in Signal's settings and enter it. On Android it lives under Data and Storage; on iOS, under Privacy then Advanced. Menu locations shift between app versions, so treat Signal's own [Proxy Support article](https://support.signal.org/hc/en-us/articles/360056052052-Proxy-Support){target="_blank"} as authoritative if you cannot find it.

Enter the hostname alone (`proxy.example.com`), with no `https://` and no port. After saving, the app attempts a connection, and once it is up an indicator appears at the top of the main screen.

### After you have a link

A proxy's IP goes on a blacklist once censors find it, so it is worth holding two or three addresses from different sources. When an operator changes IP or rebuilds the service, old links stop working and you need a fresh one.

## What to know before using one

- **The operator can see your IP and connection times.** They cannot see message content, who you talk to, or group membership — all of that is inside end-to-end encryption. Whose proxy you use decides who holds the record that "this IP connected to Signal at this time."
- **A proxy does not hide that you use Signal.** To your ISP the traffic looks like an ordinary website, but where using Signal at all is the risk, a proxy does not solve that problem. Hiding the behaviour itself calls for [Tor Browser](./tor-browser-advanced.md) or Orbot on mobile.
- **Publicly posted links have short lives.** Signal's own advice is to announce publicly that you run a proxy and hand out the address by direct message. An address that circulates widely on social platforms usually gets blocked quickly.
- **Provenance matters.** Anyone can run a proxy, so an address should come from an organization or person you recognize rather than an anonymous list.

## The anoni.net community proxy

!!! warning "Planned, not yet running"

    The community is evaluating running a public Signal Proxy. Once the service is up, this section will carry the share link, how to obtain the address, and how changes get announced. Until then this page is documentation only, with no address to hand out.

## Running one yourself

Signal maintains [Signal-TLS-Proxy](https://github.com/signalapp/Signal-TLS-Proxy){target="_blank"}, packaged with Docker Compose. As anti-censorship infrastructure goes, the setup barrier is on the low end. This half is for readers whose own connectivity is open and unfiltered, running a proxy for people whose connectivity is not.

### What you need

- A VPS with ports `80` and `443` reachable from the internet.
- A domain or subdomain with an A record pointing at that VPS.
- Docker installed on the host.

Requirements are modest. Signal noted back in 2021 that an inexpensive, small VPS can handle hundreds of concurrent users.

### Setup

```bash
git clone https://github.com/signalapp/Signal-TLS-Proxy.git
cd Signal-TLS-Proxy
./init-certificate.sh
docker compose up --detach
```

`init-certificate.sh` obtains a TLS certificate from Let's Encrypt, so confirm DNS has propagated before running it or the request will fail. Once it finishes the proxy is live, and the share link is `https://signal.tube/#<your-domain>`.

### Operational discipline

The repository carries a stability policy: Signal aims to publish compatibility changes at least thirty days before they become required. Operators are expected to check for updates at least every thirty days, since a proxy left un-updated too long can suddenly stop reaching the Signal service.

To update:

```bash
git pull
docker compose down
docker compose build
docker compose up --detach
```

Pair it with external monitoring that checks port `443` from a network other than the proxy's own, so an outage does not wait on a user to report it.

### Distribution strategy

The wider an address spreads, the faster it gets blocked. In practice, operators say publicly that they run a Signal proxy and pass the address itself through direct messages, encrypted mail, or small groups. A single host serving users concentrated in one country also draws the local censorship system's attention sooner.

At community scale the approach is several hosts across different network providers, rotating to the next when one gets blocked — the same logic as Tor bridge distribution.

### Assessing the risk of running one

A Signal Proxy forwards traffic only to Signal's servers, never to arbitrary destinations. That puts its legal exposure far below a [Tor exit relay](../community/setup-tor-relay.md), where arbitrary traffic from arbitrary users leaves under your IP. With a single fixed destination, the room for abuse is much smaller.

In a jurisdiction without censorship mandates — Taiwan, for instance — nothing currently restricts individuals or organizations from offering this kind of relay, and the practical constraints are your hosting provider's terms of service and the bandwidth allowance on your plan. In jurisdictions that regulate circumvention tools, the assessment is a different one and does not carry over.

## Questions

??? question "How is this different from a VPN?"

    A VPN carries every application's traffic on the device; a Signal Proxy serves connections from one app. The narrower scope brings two advantages: configuration happens inside the app without touching anything else, and the traffic profile is simple enough to be harder to identify than a VPN's. When what you need to route around applies to your whole network access, [VPN: risks and how to choose](./vpn-guide.md) is the more relevant page.

??? question "How much bandwidth does running one take?"

    Text messages use very little; voice and video calls are where bandwidth goes. The allowance bundled with a typical VPS plan is usually enough, and if the service grows past that, the provider's monthly traffic bill shows it first.

??? question "Can an operator be compelled to hand over user data?"

    What can exist on the server is connection IPs and timestamps. Message content and contacts are inside end-to-end encryption and technically out of reach. Keeping the exposure low means not enabling extra connection logging and not retaining logs.

??? question "Can I run one for just a few people?"

    Yes. Keeping the address unpublished and giving it only to specific people is Signal's own recommended distribution model, and a small private proxy tends to outlive addresses on public lists.

??? question "Compared with Tor Snowflake, which contributes more?"

    They serve different people. Snowflake helps those who cannot reach the Tor network at all, covering anonymity for general browsing. A Signal Proxy handles only Signal, a narrower scope that maps directly onto "I cannot reach my family and friends." On setup, Snowflake needs a browser tab while a Signal Proxy needs a VPS and a domain, closer to a [WebTunnel bridge](../community/setup-tor-webtunnel.md).

## :material-chat-question: Related reading

<div class="grid cards" markdown>

- [:material-chat-question: Secure messaging compared](./messaging-comparison.md)
- [:material-chat-question: Why networked freedom matters](../basics/internet-freedom.md)
- [:material-chat-question: How end-to-end encryption works](../advanced/e2ee.md)

</div>

## :fontawesome-solid-diagram-project: Projects to join next

<div class="grid cards" markdown>

- [:material-snowflake: Tor Snowflake bridge](./tor-snowflake.md)
- [:material-tunnel-outline: How to set up a Tor WebTunnel bridge](../community/setup-tor-webtunnel.md)
- [:material-server-network: How to set up a Tor relay](../community/setup-tor-relay.md)

</div>
