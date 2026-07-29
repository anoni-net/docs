---
title: "Encrypted DNS: what it changes, how to choose, how to verify"
description: Typing 1.1.1.1 into your Wi-Fi settings is not encrypted DNS — it swaps which server answers you while the query still goes out in plaintext. This page covers DoH, DoT and DoQ, how to judge a resolver operator, how to confirm your setup actually took effect, and the Asia-Pacific measurement angle.
icon: material/dns
---

# :material-dns: Encrypted DNS: what it changes, how to choose, how to verify

Filling `1.1.1.1` into the DNS field of your phone's Wi-Fi settings is, for a lot of people, the first privacy setting they ever change. It swaps which server answers you. The query itself still leaves your device in plaintext, and every device along the path still reads the full domain name. To encrypt the query you have to enter a hostname or a URL, and your operating system and your browser usually keep separate settings for it.

This page covers three things: what DoH, DoT and DoQ actually are, how to judge the operator you are handing your queries to, and how to confirm your setup took effect. It also covers what encrypted DNS does *not* do — it does not make you anonymous, and it does not hide where you connect next.

!!! tip "No time to read it all? Start here."

    - An IP address is not encrypted DNS. Encryption needs a hostname (`dns.quad9.net`) or a URL (`https://dns.quad9.net/dns-query`)
    - After encryption, the party that sees your queries moves from your ISP to the resolver operator. It gets smaller, not zero
    - Choosing a resolver means choosing whose logs you are comfortable being in: jurisdiction, retention policy, independent audit
    - System-level and browser-level are two separate settings. Changing one leaves the other alone
    - Tor Browser ignores your system DNS entirely. Its name resolution happens inside the Tor circuit

## What the path sees without encryption

DNS queries default to plaintext on port 53. Every time your device asks "what is the IP for this domain", the home router, your ISP, and anything in between reads the full domain name. That list alone reconstructs which sites you visited and when, regardless of whether the sites themselves are encrypted. Where domain queries sit among the other things you leak is covered in [what metadata is and why it matters](../basics/metadata.md).

Plaintext queries have a second property that gets less attention: anyone on the path can also rewrite the answer. DNS-layer blocking works exactly this way, returning a wrong address for a specific domain so the connection fails.

## DoH, DoT and DoQ

All three encrypt the query. What differs is the protocol they are wrapped in, and that directly determines whether they survive on a restricted network.

| Protocol | Spec | Carried over | What it looks like on the wire |
|---|---|---|---|
| **DoH** (DNS over HTTPS) | `RFC 8484` | HTTPS, usually port 443 | Mixed in with ordinary web traffic, hard to single out and block |
| **DoT** (DNS over TLS) | `RFC 7858` | TLS on its own port 853 | Identifiable at a glance, easy for an operator to allow or block |
| **DoQ** (DNS over QUIC) | `RFC 9250`, published 2022 | QUIC | Newer; OS and resolver support is still thin |

On a network that blocks encrypted DNS, DoH survives better, because blocking it means picking it out of general HTTPS traffic first. The flip side is that on an enterprise or campus network that legitimately needs to manage internal resolution, DoT's dedicated port makes the situation clearer to both sides.

## The resolver is your new observer

Once queries are encrypted, one company receives all of them and knows who asked, what they asked, and when. Four things are worth checking before you pick one.

**Jurisdiction.** Who can compel the operator to hand data over depends on where it is incorporated and where the servers sit.

**What is logged and for how long.** The specifics matter more than the phrase "we don't log". Cloudflare's stated position for `1.1.1.1` is that it will not sell or share users' personal data, will not use it to target advertising, will not store the user's IP address in non-volatile storage, and deletes the relevant logs within 25 hours[^cf-privacy].

**Whether anyone independent checked.** A claim and an audited claim are different things. Cloudflare states it retained one of the top four accounting firms to audit the practice and publish a report[^cf-privacy].

**Whether it filters, and whether the list is public.** Filtering resolvers work by returning a false answer for specific domains, which is the same technical action as DNS-layer censorship. The trade-off is in the next section.

### Three operators people ask about

| Service | Jurisdiction | Non-filtering address | Filtering options |
|---|---|---|---|
| **Cloudflare** | United States | `1.1.1.1`, `1.0.0.1` (IPv6 `2606:4700:4700::1111`) | `1.1.1.2` blocks malware, `1.1.1.3` adds adult content[^cf-ip] |
| **Quad9** | Switzerland (foundation based in Zürich) | `9.9.9.10`, `149.112.112.10` | `9.9.9.9` blocks malware and validates DNSSEC, `9.9.9.11` adds ECS[^quad9] |
| **Mullvad** | Sweden | `194.242.2.2` (IPv6 `2a07:e340::2`) | `194.242.2.3` blocks ads, with four further levels up to `194.242.2.9`[^mullvad] |

Note the reversal: Quad9's headline address `9.9.9.9` is the *filtering* one, so unfiltered means `9.9.9.10`, the opposite convention to Cloudflare. Mullvad's resolver is usable without a Mullvad account[^mullvad].

Other operators worth a look include AdGuard, NextDNS, dns0.eu and Control D. Take their addresses and endpoints from their own documentation — reposted lists go stale quietly when an operator changes something.

### Self-hosting has a counterintuitive cost

Running your own recursive resolver (Unbound, dnscrypt-proxy) genuinely means no operator receives your queries. The cost is that your queries now go to each authoritative server from your own IP, and you become the only person on the internet sending that particular set of lookups. On a public resolver your queries sit inside millions of other people's. Which trade is right depends on who you are defending against; a pass through [building a threat model](../basics/threat-model.md) settles it faster than a feature comparison.

## Filtering resolvers cut both ways

A filtering resolver returns a dead address for blocked domains — Cloudflare returns `0.0.0.0`[^cf-ip]. That does stop a share of malicious domains, and for a household or a small organisation it is cheap protection.

The blocklist and the classification method are usually not published, so you cannot know in advance what is covered, and a false positive starts as an unexplained "why won't this site load". The second cost lands on measurement: running OONI Probe behind a filtering resolver produces anomalies that came from your own device rather than the network, covered in the regional section below.

If you are protecting people in a household, a filtering resolver is a reasonable choice. If you are trying to judge whether a network is being interfered with, it gets in the way.

## How to confirm you actually have encrypted DNS

**Look at what you typed in.** An IP address (`1.1.1.1`, `9.9.9.9`) is a plaintext query. Encryption takes a hostname or a URL, shaped like `dns.quad9.net`, `dns.mullvad.net`, `security.cloudflare-dns.com`, or `https://dns.quad9.net/dns-query`[^quad9][^mullvad][^cf-families]. If what you entered is dotted decimal, it is not encrypted DNS.

**Look at which layer you changed.** System settings and browser settings are independent. A browser with DoH on leaves every other app on the system resolver. A system configured correctly can still be bypassed by a browser that points at its own resolver. Check both.

Android's Private DNS is the system-level control, offering Off, Automatic, or a private DNS provider hostname — a hostname, not an IP — supported from Android 9 onward[^android][^google-dot]. Google's own description of the feature is refreshingly blunt: "Private DNS helps secure only DNS questions and answers. It can't protect anything else."

**Check what happens when it fails.** This is the step people skip. In Firefox's resolver modes, mode 2 means "Use TRR first, and only if the name resolve fails use the native resolver as a fallback", while mode 3 means "Only use TRR, never use the native resolver"[^mozilla-trr]. The first one means a failed encrypted query silently falls back to plaintext with no notice to you. Guaranteeing no fallback means choosing the encrypted-only mode, and accepting that a resolution failure becomes a page that simply does not load.

## When it breaks

**Enterprise and campus networks.** Internal domains only resolve against internal DNS; sending queries outside means internal resources disappear. These networks often block external encrypted DNS as well.

**Captive portals.** Hotel and airport Wi-Fi that makes you log in through a web page relies on intercepting your DNS responses. With encrypted DNS on, the login page frequently never appears — turn it off, log in, turn it back on.

**Encrypted DNS blocked outright.** DoT's port 853 is trivially blocked. DoH is harder to block wholesale, but a specific resolver's IPs and domains can still be blocked.

**Silent fallback to plaintext.** See the resolver modes above. When failure is silent, you keep believing you are encrypted.

## How this relates to ECH and to Tor

Encrypted DNS covers the query, and only the query. When you then open a TLS connection, the SNI field in the handshake still carries the destination hostname, and whoever holds that line reads it there instead. Encrypted Client Hello (ECH) is designed for that leg. It needs server-side support, it can be blocked by middleboxes, and you should not assume every connection's SNI is protected. Even with ECH working, the destination IP address is still in the packets.

Tor Browser is a separate case: it does not use your system DNS at all. Tor's SOCKS interface accepts hostnames and resolves them inside the Tor network, and the specification is explicit about why — "if clients do their own DNS lookup, the DNS server can learn which addresses the client wants to reach"[^tor-socks]. Changing your system DNS for the sake of Tor accomplishes nothing, because Tor Browser's traffic never touched it. It also means that on one device, Tor Browser and everything else are resolving names along two entirely different paths.

## Regional context: measurement in the Asia-Pacific

Across the region the common reasons for changing DNS are speed and reachability — some domain does not resolve on the ISP's resolver. Whether switching helps depends on which layer the blocking sits at. DNS-layer blocking is defeated by changing resolver; blocking at the IP or SNI layer is not, no matter who answers your queries.

If you run OONI Probe, this matters for the data. Web Connectivity resolves the domain with the system resolver, then compares against what a test helper resolves, and counts it consistent only when the addresses or the ASNs line up[^ooni-wc]. With a filtering resolver enabled, blocked domains resolve to `0.0.0.0`, that fails the comparison, and the measurement reads as local network interference. The community maintains the [Tor relay watcher](../regional/tor-relay-watcher.md) and related regional observations, where the whole point is the behaviour of the network itself — so this is not a recommendation to standardise on a foreign resolver, which would paper over genuine ISP-layer blocking. The fix is narrower: remove the filtering resolver *you* added and let the device fall back to that network's own configuration.

## FAQ

??? question "Should I change my DNS at all?"

    It depends what you are solving. To stop your ISP seeing which domains you look up, encrypted DNS works, at the price of handing that record to a different company. To get around blocking, first find out which layer the blocking is at. To become anonymous, this is the wrong tool — encrypted DNS does not hide your IP from anyone you connect to.

??? question "Is my ISP's resolver the worst option?"

    Not necessarily. Your ISP already sees every destination IP you connect to, so changing DNS does not stop it knowing where you went — it only removes the domain names from what it collects directly. Meanwhile, moving to an overseas resolver adds a party that previously saw nothing about you. Which is better depends on who you would rather not be legible to.

??? question "Why are these resolvers free?"

    The reasons differ. Some are run by infrastructure companies that get network measurement value out of it; some are run by non-profits or foundations on donations. There is no general rule here, so read the retention policy and the funding model rather than assuming free is either fine or suspicious.

??? question "I enabled encrypted DNS and my company's internal site broke"

    That is expected. Internal domains only resolve against the company's DNS, so a query sent outside finds nothing. Most operating systems let you disable encrypted DNS per network, or route specific domains to an internal resolver. Turning it off while on the corporate network is the simplest answer.

??? question "Is DNSSEC the same thing as encrypted DNS?"

    No, they solve different problems. Encrypted DNS is about whether the query can be read in transit; DNSSEC is about whether the answer was tampered with, using signatures so you can verify a response really came from that domain's authoritative server. They complement each other — Quad9's `9.9.9.9` does both encrypted transport and DNSSEC validation[^quad9].

## :material-chat-question: Related reading

<div class="grid cards" markdown>

- [:material-file-tree: What metadata is and why it matters](../basics/metadata.md)
- [:material-vpn: VPN: risks and how to choose](./vpn-guide.md)
- [:material-chat-question: Building a threat model](../basics/threat-model.md)

</div>

## :fontawesome-solid-diagram-project: Get involved

<div class="grid cards" markdown>

- [:material-access-point-network: OONI Run v2 for regional measurement](./ooni-run-v2.md)
- [:material-chart-bar: Tor relay watcher](../regional/tor-relay-watcher.md)
- [:material-snowflake: Tor Snowflake](./tor-snowflake.md)

</div>

[^cf-ip]: [1.1.1.1 IP addresses](https://developers.cloudflare.com/1.1.1.1/ip-addresses/){target="_blank"} and [1.1.1.1 Setup](https://developers.cloudflare.com/1.1.1.1/setup/){target="_blank"} - Cloudflare developer docs; the `0.0.0.0` behaviour is described in the latter.
[^cf-families]: [1.1.1.1 Setup](https://developers.cloudflare.com/1.1.1.1/setup/){target="_blank"} - Cloudflare developer docs; the for Families DoH and DoT endpoints are on this page.
[^cf-privacy]: [1.1.1.1 Public DNS Resolver privacy](https://developers.cloudflare.com/1.1.1.1/privacy/public-dns-resolver/){target="_blank"} - Cloudflare developer docs.
[^quad9]: [Service Addresses and Features](https://quad9.net/service/service-addresses-and-features/){target="_blank"} - Quad9.
[^mullvad]: [Mullvad DNS over HTTPS and DNS over TLS](https://mullvad.net/en/help/dns-over-https-and-dns-over-tls){target="_blank"} - Mullvad.
[^android]: [Change your Android device's Private DNS settings](https://support.google.com/android/answer/9089903){target="_blank"} - Google Support.
[^google-dot]: [DNS-over-TLS](https://developers.google.com/speed/public-dns/docs/dns-over-tls){target="_blank"} - Google Public DNS docs; Android 9 and later DoT support is noted here.
[^mozilla-trr]: [Trusted Recursive Resolver](https://wiki.mozilla.org/Trusted_Recursive_Resolver){target="_blank"} - Mozilla Wiki; the resolver modes are defined here.
[^tor-socks]: [SOCKS extensions](https://spec.torproject.org/socks-extensions.html){target="_blank"} - Tor specifications.
[^ooni-wc]: [ts-017-web-connectivity](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"} - OONI test specification.
