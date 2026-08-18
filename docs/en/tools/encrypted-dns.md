---
title: How to choose encrypted DNS, and how to check it actually works
description: Typing 1.1.1.1 into Wi-Fi settings is not encrypted DNS — it swaps which server answers while the query still goes out in plaintext. DoH, DoT and DoQ; how to judge a resolver operator; what each platform's field accepts; which defaults silently fall back to plaintext; and how to test.
icon: material/dns
---

# :material-dns: How to choose encrypted DNS, and how to check it actually works

Filling `1.1.1.1` into the DNS field of your phone's Wi-Fi settings is, for many people, the first privacy setting they ever change. It swaps which server answers you. The query still leaves your device in plaintext, and every device along the path still reads the full domain name.

Whether you should do this at all depends on what you are solving. To stop your ISP seeing which domains you look up, encrypted DNS works, at the price of handing that record to a different company. To get around blocking, first find out which layer the blocking sits at. To become anonymous, this is the wrong tool — it does not hide your IP from anything you connect to.

This page does not walk through per-platform setup screens; those steps change with system versions and reposted instructions go stale quietly. What it gives instead is portable across platforms: what shape each field accepts, which defaults silently fall back to plaintext, and how to test once you are done.

!!! tip "No time to read it all? Start here."

    - Encrypted DNS needs a hostname or a URL. Most platforms' ordinary DNS field only takes an IP, and an IP means plaintext. Windows is the exception — it matches the IP against a built-in list of known DoH servers
    - After encryption, the party seeing your queries moves from your ISP to the resolver operator. It gets smaller, not zero
    - Choosing a resolver means choosing whose logs you are comfortable being in: jurisdiction, retention, independent audit, and whether it filters
    - **"Enabled" in the UI does not mean encrypted right now.** The default modes in Windows, Firefox and Chrome all fall back to plaintext on failure, without telling you
    - System-level and browser-level are separate settings. Changing one leaves the other alone
    - Test after you set it. Looking at what you typed cannot detect a silent fallback

## What the path sees, and can change, without encryption

DNS queries default to plaintext on port 53. Every time your device asks "what is the IP for this domain", the home router, your ISP, and everything in between reads the full domain name. The accumulated query log alone reconstructs which sites you visited and when, regardless of whether the connections themselves were encrypted. Where domain queries sit among the rest of what you leak is covered in [what metadata is and why it matters](../basics/metadata.md).

Anyone on the path can also rewrite the answer, not just read the question. Ordinary DNS-layer blocking works exactly that way: return a wrong address for a specific domain and the connection simply fails. The filtering resolvers and the measurement contamination discussed below all rest on that same mechanism.

## DoH, DoT and DoQ

All three encrypt the query. What differs is the protocol wrapped around it, which directly determines whether it survives on a restricted network.

| Protocol | Spec | Carried over | What it looks like on the wire |
|---|---|---|---|
| **DoH** (DNS over HTTPS) | `RFC 8484` | HTTPS, usually port 443 | Shares a port with ordinary web traffic; a blanket port block does not catch it |
| **DoT** (DNS over TLS) | `RFC 7858` | TLS on port 853 | Dedicated port, identifiable at a glance, easy to allow or block |
| **DoQ** (DNS over QUIC) | `RFC 9250` | QUIC, port 853 | Shares with QUIC traffic, identifiable by port |

DoQ was only finalised in 2022 and OS and resolver support is still thin.

DoH gets described as the censorship-resistant option, and that claim needs narrowing. What it defeats is the blanket port block, and nothing more: a DoH connection's own TLS handshake carries the resolver's hostname, so blocking by SNI or by the resolver's IP works fine. On a network that specifically targets encrypted DNS, do not count on DoH getting through.

There is also ODoH (Oblivious DoH, `RFC 9230`), aimed squarely at the problem in the next section. It puts a proxy between the two halves so that knowing *who you are* and knowing *what you asked* land on different servers; the spec's phrasing is that no single server entity is aware of both the client IP address and the content of the queries[^odoh]. Deployment is still thin, but it is the direction worth watching.

## The resolver is your new observer

Once queries are encrypted, one company receives all of them and knows who asked, what, and when.

#### Jurisdiction

Who can compel the operator to hand over data or to block a domain depends on where it is incorporated and where the servers sit. There is a real test case here: Quad9 has faced two European actions demanding it block domains — the German case brought by Sony Music ran until a favourable result in December 2023, and in December 2024 Canal+ filed a new one in France[^quad9-press]. Being registered in Switzerland does not confer immunity from another country's court order.

#### What is logged and for how long

The specifics matter more than the phrase "we don't log". Cloudflare's stated commitments for `1.1.1.1` include not selling or sharing users' personal data, not using it to target advertising, not storing the user's IP address in non-volatile storage, and deleting the relevant logs within 25 hours[^cf-privacy].

#### Whether anyone independent checked

A claim and an audited claim differ. Cloudflare states it retained one of the top four accounting firms to audit the practice and publish a report[^cf-privacy]. Reports of that kind assess stated practice at a point in time; they are not a continuing guarantee.

#### Whether it filters

See below.

### Filtering resolvers cut both ways

A filtering resolver returns a dead address for blocked domains — Cloudflare returns `0.0.0.0`[^cf-ip]. That does stop a share of malicious domains, and for a household or small organisation it is cheap protection. It is also the same technical action as DNS-layer censorship, differing in who decides.

The blocklist and the classification method are usually unpublished, so you cannot know in advance what is covered, and a false positive begins as an unexplained "why won't this site load". The second cost lands on measurement: run OONI Probe behind a filtering resolver and blocked domains get recorded as anomalies that came from your own resolver rather than the network.

If you are protecting people in a household, a filtering resolver is reasonable. If the same device is also meant to tell you whether a network is being interfered with, turn it off before measuring.

### Four operators checked line by line

Only four, because these are the ones whose addresses, encrypted endpoints and policies were checked against their own documentation. Checked `2026-07`.

| Service | Jurisdiction | Retention | Independent audit | Non-filtering address and endpoints | Filtering options |
|---|---|---|---|---|---|
| **Cloudflare** | United States | Not written to non-volatile storage; deleted within 25 hours[^cf-privacy] | Yes, a top-four firm[^cf-privacy] | `1.1.1.1`, `1.0.0.1`, `2606:4700:4700::1111` | `1.1.1.2` blocks malware, `1.1.1.3` adds adult content; encrypted endpoints `security.cloudflare-dns.com`, `family.cloudflare-dns.com`[^cf-families] |
| **Quad9** | Switzerland, foundation based in Zürich; has been sued in Germany and France over domain blocking[^quad9-press] | Not stated on the pages checked | Not stated on the pages checked | `9.9.9.10`, `149.112.112.10`, `dns10.quad9.net`, `https://dns10.quad9.net/dns-query` | `9.9.9.9` (the headline address) blocks malware and validates DNSSEC, `9.9.9.11` adds ECS[^quad9] |
| **Mullvad** | Sweden; usable without an account | Not stated on the pages checked | Not stated on the pages checked | `194.242.2.2`, `2a07:e340::2`, `dns.mullvad.net`, `https://dns.mullvad.net/dns-query` | `194.242.2.3` blocks ads, with four further levels up to `194.242.2.9` with every list on[^mullvad] |
| **Quad101** | Taiwan, operated by TWNIC | Temporary records kept up to 30 days, including source and destination IPs, queried domains and timestamps[^quad101-privacy] | Not stated on the pages checked | No non-filtering option. `101.101.101.101`, `101.102.103.104`, `2001:de4::101`, `2001:de4::102`; the site states DoH and DoT are supported but publishes no endpoint[^quad101] | Filters phishing, malware, botnet C&C, and "domains in violation of applicable law" by default[^quad101-terms] |

Two traps in that table. First, Quad9's headline `9.9.9.9` is the **filtering** one, so unfiltered means `9.9.9.10` — the opposite default to Cloudflare. Second, the ECS on `9.9.9.11` (EDNS Client Subnet) attaches a prefix of your IP address to queries sent onward to authoritative servers so a CDN can pick a closer node; the cost is that information previously known only to the resolver reaches the upstream too. In privacy terms that is a subtraction.

Quad101 is the only regionally-operated option among these four; see the regional section below. Other operators include AdGuard, NextDNS, dns0.eu and Control D — take addresses and endpoints from their own documentation, because reposted lists go stale silently. Google's `8.8.8.8` is heavily used across the region and also offers DoH and DoT[^google-dot]; it is absent from the table because its policies were not checked line by line this round, not because it was judged unsuitable.

## Self-hosting is not free either

Running your own recursive resolver — the kind that walks the root, TLD and authoritative servers itself, such as Unbound or Knot Resolver — genuinely means no operator receives your queries. It carries two costs, and the second is both less obvious and more serious.

Your queries now reach each authoritative server from your own IP, making you the only source on the internet sending that particular set of lookups. On a public resolver they sit inside millions of other people's.

More importantly, **the queries a recursive resolver sends outward are still overwhelmingly plaintext on port 53**. Authoritative servers largely do not support encrypted transport, so after self-hosting your ISP can once again see every domain you look up — the counterparty simply changed from one resolver to a whole row of authoritative servers. If your ISP is the adversary you care most about, self-hosting a recursive resolver exposes more than using one trustworthy operator's DoH.

To decide which fits, start from [building a threat model](../basics/threat-model.md). If the goal is to trust no single operator *and* keep your ISP out of it, the direction to look at is something like the ODoH design above, not self-hosted recursion.

(dnscrypt-proxy often gets mentioned alongside Unbound, but it is a local forwarding proxy: it encrypts queries and hands them to an upstream public resolver, so an operator still receives them. That is a different thing from the self-hosting discussed here.)

## What encrypted DNS does not cover

Encrypted DNS covers the query, and only the query. When you then open a TLS connection, the SNI field (Server Name Indication, which carries the destination hostname in plaintext during the handshake) still exposes the domain to anyone on the path. Even with SNI solved, the destination IP address is still in the packets.

Encrypted Client Hello (ECH) is designed for that leg. It needs server-side support, it can be blocked by middleboxes, and you should not assume every connection's SNI is protected. Conversely, ECH needs the server's published configuration to work, and that configuration is fetched over DNS — so encrypted DNS is a prerequisite for ECH rather than an alternative to it.

Tor Browser does not use your system DNS at all. Tor's SOCKS interface takes hostnames and resolves them inside the Tor network; the specification is explicit that if clients do their own DNS lookup, the DNS server learns which addresses the client wants to reach[^tor-socks]. Changing your system DNS for Tor's sake accomplishes nothing, because Tor Browser's traffic never touched that setting — only the other apps on the device are affected. This holds for Tor Browser specifically; Orbot's VPN mode, Tails and Whonix each resolve differently and need checking against their own documentation.

## What each platform takes, and what happens when it fails

The shape the field accepts decides whether you configured encryption or plaintext. Whether it falls back on failure decides whether you can trust the "on" indicator.

| Platform | What encrypted DNS takes | On failure |
|---|---|---|
| **Android Private DNS** (hostname) | A hostname, over DoT, supported from Android 9[^android][^google-dot] | Marks the network as having no internet rather than falling back to plaintext[^android-dot] |
| **Android Private DNS** (automatic) | Nothing to enter | Upgrades to encryption only when the network's resolver supports it, otherwise stays plaintext[^android-dot] |
| **iOS** | The built-in Wi-Fi DNS field takes only an IP and does not apply to cellular. Encryption requires the operator's app or a configuration profile[^cf-ios] | Depends on the app installed |
| **macOS** | The network settings DNS field likewise takes an IP; encryption is handled separately[^cf-macos] | Depends on the method |
| **Windows** | An IP — but one that appears in the built-in known-DoH-server list, with encryption chosen from a separate dropdown[^ms-doh] | "Encrypted preferred, unencrypted allowed" falls back, and Microsoft's documentation states plainly that you get no notification[^ms-doh] |
| **Firefox** | A resolver plus a resolution mode | Mode `2` falls back to the native resolver when resolution fails; mode `3` uses encryption only[^mozilla-trr] |
| **Chrome** | Current provider or a custom provider | Automatic mode reverts to unencrypted on trouble; a custom provider does not fall back[^chrome-dns] |

**Windows is the exception to "an IP means plaintext"** — it uses that built-in table to map the IP to an encrypted endpoint. **iOS has no built-in encrypted DNS field at all**, so typing `1.1.1.1` into Wi-Fi settings yields pure plaintext, and cellular is not covered in any case. **Most platforms' defaults fall back silently**: Windows, Firefox mode `2` and Chrome's automatic mode all do, while Android's hostname mode is the unusual one that fails closed instead.

Firefox also has a mechanism by which a network can signal it to disable encrypted DNS through a particular query response; the diagnostic codes call it the canary heuristic[^firefox-trr-skip]. Enterprise networks use it, and the cost is that your browser may drop back to plaintext without your knowing.

## How to check you got it right

#### Look at the shape of what you entered

Against the table above: a hostname, a URL, or an IP decides whether it is encrypted. Windows is the exception, where what matters is the encryption dropdown.

#### Look at which layer you changed

System and browser settings are independent — a browser with DoH on leaves every other app on the system resolver. The home router and DHCP are a third layer, and putting `9.9.9.9` into a router gives zero encryption, because most consumer routers will not do DoT or DoH on your behalf and the LAN hop to the router was never encrypted anyway. Covering a whole home or office means confirming that the device itself supports an encrypted upstream.

#### Test it once

The first two checks tell you what you typed; they cannot catch a silent fallback, a browser running its own resolver, or an app with one hardcoded. All three operators publish a check page: Cloudflare's [1.1.1.1/help](https://1.1.1.1/help){target="_blank"}, Quad9's [on.quad9.net](https://on.quad9.net/){target="_blank"}, and Mullvad's [connection check](https://mullvad.net/en/check){target="_blank"}. What you want is the resolver and encryption status it reports matching the operator you configured. Test once in your everyday browser and once outside it, since the two can differ.

## When it breaks

#### Enterprise and campus networks

Internal domains only resolve against internal DNS, so sending queries outside makes internal resources vanish. Most operating systems allow disabling encrypted DNS per network or routing specific domains to an internal resolver; at organisational scale the right answer is conditional forwarding or split-horizon resolution, not telling everyone to switch it off.

#### Captive portals

Hotel and airport Wi-Fi that requires a login page relies on the network blocking outbound traffic before you authenticate, so encrypted DNS cannot resolve and the login page never appears. Most operating systems now detect and handle this. If you do have to turn it off manually, remember two things: while it is off your queries are fully readable to that network, so avoid anything sensitive during that window, and confirm you turned it back on the moment you are through — this step is easy to forget.

#### Encrypted DNS blocked outright

DoT's port 853 is trivially blocked. DoH is harder to block by port, but a network operator can still block a specific resolver's IPs and domains.

## Regional context on measurement in the Asia-Pacific

Across the region the common reasons for changing DNS are speed and reachability — some domain does not resolve on the ISP's resolver. That second motive depends on which layer the blocking sits at: DNS-layer blocking is defeated by changing resolver, blocking at the IP or SNI layer is not, whoever answers you.

It is also worth knowing what you give up. In Taiwan, Chunghwa Telecom's content filter and the anti-fraud domain blocking run by the Ministry of Digital Affairs with TWNIC both operate at the DNS layer. Moving to an overseas resolver disables those alongside everything else: you gain queries your ISP cannot see, and lose the phishing and fraud domains those blocks were catching. For a household with children or older relatives that trade needs weighing, and a filtering resolver is one middle path.

For anyone who would rather keep the data in the region, TWNIC's Quad101 is the one public option, at `101.101.101.101` and `101.102.103.104`, with DNSSEC validation enabled[^quad101]. Run it past the four criteria above and three things stand out.

It has no non-filtering variant, and the published scope covers phishing, malware and botnet C&C plus a fourth category, "domains in violation of applicable law"[^quad101-terms]. That last one is considerably broader than the other three and, as with every operator here, the list itself is unpublished, so you cannot know in advance what it covers. If the device is also meant to tell you whether a network is being interfered with, or to run OONI Probe, that property changes the results directly.

Retention also runs longer than the overseas three: the stated policy is to keep only minimal query data, with temporary records held up to 30 days covering source and destination IPs, ports, query types, domain names, timestamps and response data, while what is kept long-term is a sample stripped of personal information[^quad101-privacy]. Set against Cloudflare's commitment to delete within 25 hours for `1.1.1.1`, that is the gap.

The encrypted endpoints are not published: the site states DoH and DoT are supported without giving a hostname or a URL[^quad101-terms]. By this page's own logic, entering only the IP `101.101.101.101` yields plaintext queries, so using encryption means asking TWNIC for the endpoint first.

Choosing Quad101 means keeping the data in Taiwan with a local institution, at the price of accepting a filtering set that includes legal compliance and a longer retention window than the overseas three. There is no single right answer to that trade, but it is not the same kind of product as the other three in the table, and it is worth knowing where the difference sits before choosing.

If you run OONI Probe, this matters for the data. Under the `ts-017` specification, Web Connectivity resolves the domain with the system resolver, then compares against a test helper, counting it consistent only when addresses or ASNs line up[^ooni-wc].

Any third-party resolver on the device skews the result, in two different directions. A filtering resolver makes blocked domains resolve to `0.0.0.0`, so the measurement reads as local interference — a false positive, which at least someone will investigate. A non-filtering overseas encrypted resolver is worse: it bypasses the ISP-layer blocking that is actually there, the measurement looks clean, and nobody notices what was missed. So when measuring, use the resolver handed out by that network's DHCP and turn off every third-party encrypted DNS, filtering or not.

Three easy misses: Android's Private DNS is a system-wide setting that applies across Wi-Fi and cellular alike. A Pi-hole or AdGuard Home at home filters resolution even though nothing is configured on the device. A clean laptop says nothing about the phone.

## The checklist to take away

Run these three after setting up; all three have to answer cleanly.

1. Does the field I filled take a hostname or URL? (Windows excepted — check the encryption dropdown)
2. Have I checked all three layers: system, browser, router?
3. Does the check page report the resolver and encryption status I configured?

Before running OONI Probe, run them in reverse: turn off every third-party resolver, on the phone as well as the laptop, and confirm nothing at the router is filtering.

## FAQ

??? question "Is my ISP's resolver the worst option?"

    Not necessarily. Your ISP already sees every destination IP you connect to, so changing DNS does not stop it knowing where you went — it only removes the domain names from what it collects directly. Moving to an overseas resolver adds a party that previously saw nothing about you. Which is better depends on who you would rather not be legible to.

??? question "What happens if I run encrypted DNS and a VPN together?"

    Usually the VPN wins. Most VPN clients take over the device's DNS and send queries down the tunnel to their own resolver, so the encrypted DNS you configured may not take effect at all. That is not necessarily bad — the queries are inside the tunnel — but the party you are trusting becomes the VPN provider. To find out what is actually happening, load one of the check pages above with the VPN on and see who it reports. The trade-offs are in [VPN: risks and how to choose](./vpn-guide.md).

??? question "Will it be slower?"

    Encryption adds a handshake, so the first query is usually slower and subsequent ones reuse the connection. What you actually feel depends more on how far that resolver sits from you on this particular line, and an overseas operator is not automatically faster than your ISP. Measuring it yourself beats reading benchmarks; the same line varies by time of day.

??? question "How should an organisation deploy this?"

    Decide the layer first. Per-device is the most reliable and the most work, though mobile device management (MDM) pushing configuration profiles solves that. The router is the least work, provided that device supports an encrypted upstream — otherwise the leg that matters stays plaintext. You also need a plan for internal domains, where conditional forwarding or split-horizon resolution is the right answer. Think about failover too: adding a second operator means splitting your queries between two companies, which discounts whatever privacy commitment you chose the first one for.

??? question "Why are these resolvers free?"

    The positions differ. Cloudflare is an infrastructure company that gets network performance measurement out of it. Quad9 is a Swiss non-profit foundation funded by donations and sponsorship. Mullvad is a paid VPN provider offering its resolver as a side service. Read the retention policy and the funding model rather than judging by price.

??? question "Is DNSSEC the same thing as encrypted DNS?"

    No. Encrypted DNS keeps the query from being read in transit; DNSSEC uses signatures to prove the answer was not tampered with. Two caveats: validation normally happens at the resolver, so what reaches your device is a "validated" flag, and without encrypted transport that flag can itself be forged by someone on the path. DNSSEC also only protects signed domains, and plenty of common domains are unsigned, so for those it does nothing at all.

## :material-chat-question: Related reading

<div class="grid cards" markdown>

- [:material-incognito-off: Networks mistaken for anonymity](../advanced/mistaken-for-anonymity.md)
- [:material-file-tree: What metadata is and why it matters](../basics/metadata.md)
- [:material-vpn: VPN: risks and how to choose](./vpn-guide.md)
- [:material-chat-question: Building a threat model](../basics/threat-model.md)

</div>

## :fontawesome-solid-diagram-project: Get involved

<div class="grid cards" markdown>

- [:material-access-point-network: What is OONI?](./what-is-ooni.md)
- [:material-help-network: OONI Run v2 for regional measurement](./ooni-run-v2.md)
- [:material-chart-bar: Tor relay watcher](../regional/tor-relay-watcher.md)
- [:material-snowflake: Tor Snowflake](./tor-snowflake.md)

</div>

[^cf-ip]: [1.1.1.1 IP addresses](https://developers.cloudflare.com/1.1.1.1/ip-addresses/){target="_blank"} and [1.1.1.1 Setup](https://developers.cloudflare.com/1.1.1.1/setup/){target="_blank"} - Cloudflare developer docs; the `0.0.0.0` behaviour is described in the latter.
[^cf-families]: [1.1.1.1 Setup](https://developers.cloudflare.com/1.1.1.1/setup/){target="_blank"} - Cloudflare developer docs; the for Families DoH and DoT endpoints are on this page.
[^cf-privacy]: [1.1.1.1 Public DNS Resolver privacy](https://developers.cloudflare.com/1.1.1.1/privacy/public-dns-resolver/){target="_blank"} - Cloudflare developer docs.
[^cf-ios]: [Set up 1.1.1.1 on iOS](https://developers.cloudflare.com/1.1.1.1/setup/ios/){target="_blank"} - Cloudflare developer docs; the manual method offers IP addresses only, and encryption requires the app.
[^cf-macos]: [Set up 1.1.1.1 on macOS](https://developers.cloudflare.com/1.1.1.1/setup/macos/){target="_blank"} - Cloudflare developer docs.
[^quad9]: [Service Addresses and Features](https://quad9.net/service/service-addresses-and-features/){target="_blank"} - Quad9.
[^quad9-press]: [Quad9 Press](https://quad9.net/news/press/){target="_blank"} - Quad9 press releases, which reference the successful result in the German Sony Music case in December 2023 and the new French case from Canal+ in December 2024.
[^mullvad]: [Mullvad DNS over HTTPS and DNS over TLS](https://mullvad.net/en/help/dns-over-https-and-dns-over-tls){target="_blank"} - Mullvad.
[^android]: [Change your Android device's Private DNS settings](https://support.google.com/android/answer/9089903){target="_blank"} - Google Support.
[^android-dot]: [DNS over TLS support in Android P](https://android-developers.googleblog.com/2018/04/dns-over-tls-support-in-android-p.html){target="_blank"} - Android Developers Blog; the difference between automatic upgrade and a specified hostname is described here.
[^google-dot]: [DNS-over-TLS](https://developers.google.com/speed/public-dns/docs/dns-over-tls){target="_blank"} - Google Public DNS docs; Android 9 and later DoT support is noted here.
[^ms-doh]: [Secure DNS Client over HTTPS (DoH)](https://learn.microsoft.com/en-us/windows-server/networking/dns/doh-client-support){target="_blank"} - Microsoft Learn; the known-DoH-server list and the three encryption settings are described here.
[^mozilla-trr]: [Trusted Recursive Resolver](https://wiki.mozilla.org/Trusted_Recursive_Resolver){target="_blank"} - Mozilla Wiki; the resolver modes are defined here.
[^firefox-trr-skip]: [TRR Skip Reasons](https://firefox-source-docs.mozilla.org/networking/dns/trr-skip-reasons.html){target="_blank"} - Firefox source docs; the canary heuristic diagnostic code appears here.
[^chrome-dns]: [Use secure DNS in Chrome](https://support.google.com/chrome/answer/10468685){target="_blank"} - Google Chrome Help; the fallback difference between automatic mode and a custom provider is described here.
[^tor-socks]: [SOCKS extensions](https://spec.torproject.org/socks-extensions.html){target="_blank"} - Tor specifications.
[^odoh]: [RFC 9230: Oblivious DNS over HTTPS](https://www.rfc-editor.org/rfc/rfc9230.html){target="_blank"} - IETF.
[^quad101]: [Quad101](https://101.101.101.101/){target="_blank"} - TWNIC's public DNS service.
[^quad101-terms]: [Quad101 terms of service](https://101.101.101.101/ann1.html){target="_blank"} - TWNIC; the four filtering categories are enumerated here.
[^quad101-privacy]: [Quad101 privacy policy](https://101.101.101.101/ann2.html){target="_blank"} - TWNIC; retention periods and DNSSEC validation are described here.
[^ooni-wc]: [ts-017-web-connectivity](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"} - OONI test specification.
