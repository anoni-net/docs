---
title: OONI nettest quick reference
description: What each of the 41 nettests in ooni/spec measures, which ones still produce data, and which appear in Taiwan's dataset. Upstream spec links throughout, for picking a nettest or reading data you already have.
icon: material/table-search
---

# :material-table-search: OONI nettest quick reference

The `nettests` directory in [ooni/spec](https://github.com/ooni/spec/tree/master/nettests){target="_blank"} holds 41 nettest specifications, a fair share of which are no longer in use. When picking a nettest or making sense of data you already have, knowing which ones still produce measurements is more efficient than reading every specification.

This page condenses all 41 into one reference table, noting each one's upstream status, whether public data still exists, and which ones show up in Taiwan.

!!! info "How to read the status columns"

    **Spec status** comes from the `_status_` marker at the top of each specification, one of `current`, `experimental` or `obsolete`, reflecting how upstream positions that nettest.

    **Data in circulation** is measured, snapshotted on the day of writing (2026-08-04) by surveying each nettest's most recent public measurements through the [OONI API](https://api.ooni.io/api/v1/measurements){target="_blank"}.

    **Taiwan** comes from the S3 public dataset, spot-checking the nettest directories that appeared under Taiwan across five time slots on 2026-08-03.

## First, one thing: a status marker is not a data supply

Specification markers and actual data do disagree. Before the tables below, note the gap runs in both directions:

- **Marked `current` with no data to be found**: `tlsmiddlebox`, `portfiltering` and `captiveportal`.
- **Marked `experimental` with data every day**: `dnscheck`, `echcheck`, `openvpn`, `stunreachability` and `vanilla_tor` among others, at volumes comparable to some `current` nettests.

`experimental` reflects the maturity of the specification itself and implies nothing about data volume. To judge whether a nettest suits your analysis, querying the API for data beats reading the status marker.

## Grouped by purpose

Arriving with a question about what to observe, pick a direction here first and then check the tables for detail:

- **Website blocking detection**: `web_connectivity`
- **Middleboxes and interference techniques**: `http_header_field_manipulation`, `http_invalid_request_line`, `sni_blocking`, `echcheck`
- **Messaging app reachability**: `telegram`, `whatsapp`, `signal`, `facebook_messenger`
- **Circumvention tool availability**: `tor`, `vanilla_tor`, `torsf`, `psiphon`, `riseupvpn`, `openvpn`
- **DNS behaviour**: `dnscheck`, `dnsping`
- **Connection performance**: `ndt`, `dash`, `stunreachability`, `quicping`

## Nettests still producing data

Every nettest below had public measurements available on the day of writing. These are the ones you meet most often when reading OONI data.

| Nettest | What it measures | Spec status | Taiwan |
|---|---|---|---|
| [`web_connectivity`](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"} | Website reachability and block verdicts, by far the largest nettest by volume | current | yes |
| [`tor`](https://github.com/ooni/spec/blob/master/nettests/ts-023-tor.md){target="_blank"} | Reachability of Tor directory authorities and bridges | current | yes |
| [`vanilla_tor`](https://github.com/ooni/spec/blob/master/nettests/ts-016-vanilla-tor.md){target="_blank"} | Whether unobfuscated Tor can bootstrap a connection | experimental | yes |
| [`torsf`](https://github.com/ooni/spec/blob/master/nettests/ts-030-torsf.md){target="_blank"} | Tor over the Snowflake pluggable transport | experimental | no |
| [`telegram`](https://github.com/ooni/spec/blob/master/nettests/ts-020-telegram.md){target="_blank"} | Reachability of Telegram web and its data centre endpoints | current | yes |
| [`whatsapp`](https://github.com/ooni/spec/blob/master/nettests/ts-018-whatsapp.md){target="_blank"} | Reachability of WhatsApp endpoints and its registration service | current | yes |
| [`signal`](https://github.com/ooni/spec/blob/master/nettests/ts-029-signal.md){target="_blank"} | Reachability of Signal service endpoints | current | yes |
| [`facebook_messenger`](https://github.com/ooni/spec/blob/master/nettests/ts-019-facebook-messenger.md){target="_blank"} | Reachability of Facebook Messenger endpoints | current | yes |
| [`dnscheck`](https://github.com/ooni/spec/blob/master/nettests/ts-028-dnscheck.md){target="_blank"} | Behaviour of a given DNS resolver, covering encrypted queries (DoH, DoT) | experimental | yes |
| [`dnsping`](https://github.com/ooni/spec/blob/master/nettests/ts-035-dnsping.md){target="_blank"} | Latency and response behaviour of DNS queries | experimental | no |
| [`echcheck`](https://github.com/ooni/spec/blob/master/nettests/ts-039-echcheck.md){target="_blank"} | Support for and interference with Encrypted Client Hello (ECH) | experimental | yes |
| [`http_header_field_manipulation`](https://github.com/ooni/spec/blob/master/nettests/ts-006-header-field-manipulation.md){target="_blank"} | Whether middleboxes tamper with HTTP headers | current | yes |
| [`http_invalid_request_line`](https://github.com/ooni/spec/blob/master/nettests/ts-007-http-invalid-request-line.md){target="_blank"} | How middleboxes react to malformed request lines, used to detect transparent proxies | current | yes |
| [`openvpn`](https://github.com/ooni/spec/blob/master/nettests/ts-040-openvpn.md){target="_blank"} | Whether an OpenVPN handshake completes | experimental | yes |
| [`psiphon`](https://github.com/ooni/spec/blob/master/nettests/ts-015-psiphon.md){target="_blank"} | Whether the Psiphon circumvention tool can establish a connection | current | yes |
| [`riseupvpn`](https://github.com/ooni/spec/blob/master/nettests/ts-026-riseupvpn.md){target="_blank"} | Reachability of the RiseupVPN service | current | yes |
| [`stunreachability`](https://github.com/ooni/spec/blob/master/nettests/ts-025-stun-reachability.md){target="_blank"} | Reachability of STUN servers, which affects WebRTC calls | experimental | yes |
| [`ndt`](https://github.com/ooni/spec/blob/master/nettests/ts-022-ndt.md){target="_blank"} | Connection speed and performance diagnostics | current | yes |
| [`dash`](https://github.com/ooni/spec/blob/master/nettests/ts-021-dash.md){target="_blank"} | Video streaming playback quality | current | yes |
| [`browser_web`](https://github.com/ooni/spec/blob/master/nettests/ts-036-browser_web.md){target="_blank"} | Loading pages with a real browser engine | experimental | no |

!!! note "Abbreviations in the table"

    - **DoH, DoT**: DNS queries wrapped in HTTPS or TLS, so query contents do not cross the network in plaintext. See [Encrypted DNS](../tools/encrypted-dns.md).
    - **ECH (Encrypted Client Hello)**: the first message of a TLS handshake normally carries the destination domain in plaintext, and ECH encrypts that field.
    - **SNI (Server Name Indication)**: the destination domain sent in plaintext during a TLS handshake, frequently used as the basis for blocking decisions.
    - **STUN**: a protocol that helps a device discover its own public IP and port, used when WebRTC calls set up a connection.
    - **QUIC**: a UDP-based transport protocol that HTTP/3 is built on.

## Nettests with only occasional data

| Nettest | What it measures | Spec status | Most recent |
|---|---|---|---|
| [`quicping`](https://github.com/ooni/spec/blob/master/nettests/ts-031-quicping.md){target="_blank"} | Reachability of the QUIC protocol | experimental | 2026-07-30 |
| [`sni_blocking`](https://github.com/ooni/spec/blob/master/nettests/ts-024-sni-blocking.md){target="_blank"} | Blocking targeted at the TLS SNI field | experimental | 2026-07-20 |

## Nettests with no public data

The seven nettests below return no public measurements from the API. Their specifications remain in the upstream repository and are worth reading when designing a new nettest or a research method.

| Nettest | What it measures | Spec status |
|---|---|---|
| [`tlsmiddlebox`](https://github.com/ooni/spec/blob/master/nettests/ts-037-tlsmiddlebox.md){target="_blank"} | Middlebox behaviour along a TLS connection path | current |
| [`portfiltering`](https://github.com/ooni/spec/blob/master/nettests/ts-038-port-filtering.md){target="_blank"} | Whether specific ports are filtered | current |
| [`captiveportal`](https://github.com/ooni/spec/blob/master/nettests/ts-010-captive-portal.md){target="_blank"} | Whether the network requires a login to get out | current |
| [`urlgetter`](https://github.com/ooni/spec/blob/master/nettests/ts-027-urlgetter.md){target="_blank"} | A general-purpose fetching component reused by other nettests | experimental |
| [`tcpping`](https://github.com/ooni/spec/blob/master/nettests/ts-032-tcpping.md){target="_blank"} | Round-trip latency at the TCP layer | experimental |
| [`tlsping`](https://github.com/ooni/spec/blob/master/nettests/ts-033-tlsping.md){target="_blank"} | Round-trip latency of a TLS handshake | experimental |
| [`simplequicping`](https://github.com/ooni/spec/blob/master/nettests/ts-034-simplequicping.md){target="_blank"} | A simplified QUIC latency measurement | experimental |

## Historical nettests marked obsolete

Twelve specifications are marked `obsolete` upstream. Most of their functionality was absorbed into `web_connectivity`, or they retired as measurement methods evolved. Their records still turn up when working with historical data, and there is no reason to adopt them for new observation work.

| Nettest | Specification |
|---|---|
| bridgeT | [ts-001](https://github.com/ooni/spec/blob/master/nettests/ts-001-bridget.md){target="_blank"} |
| DNS Consistency | [ts-002](https://github.com/ooni/spec/blob/master/nettests/ts-002-dns-consistency.md){target="_blank"} |
| HTTP Requests | [ts-003](https://github.com/ooni/spec/blob/master/nettests/ts-003-http-requests.md){target="_blank"} |
| HTTP Host | [ts-004](https://github.com/ooni/spec/blob/master/nettests/ts-004-http-host.md){target="_blank"} |
| DNS Spoof | [ts-005](https://github.com/ooni/spec/blob/master/nettests/ts-005-dns-spoof.md){target="_blank"} |
| TCP Connect | [ts-008](https://github.com/ooni/spec/blob/master/nettests/ts-008-tcp-connect.md){target="_blank"} |
| Multi Protocol Traceroute | [ts-009](https://github.com/ooni/spec/blob/master/nettests/ts-009-multi-protocol-traceroute.md){target="_blank"} |
| Bridge Reachability | [ts-011](https://github.com/ooni/spec/blob/master/nettests/ts-011-bridge-reachability.md){target="_blank"} |
| DNS Injection | [ts-012](https://github.com/ooni/spec/blob/master/nettests/ts-012-dns-injection.md){target="_blank"} |
| Lantern | [ts-013](https://github.com/ooni/spec/blob/master/nettests/ts-013-lantern.md){target="_blank"} |
| Meek Fronted Requests | [ts-014](https://github.com/ooni/spec/blob/master/nettests/ts-014-meek-fronted-requests.md){target="_blank"} |
| OpenVPN Client Test (legacy) | [ts-016](https://github.com/ooni/spec/blob/master/nettests/ts-016-openvpn.md){target="_blank"} |

!!! note "Two OpenVPN specifications share a number"

    Upstream has two specifications numbered `ts-016`: `ts-016-openvpn.md`, marked `obsolete` in the table above, and `ts-016-vanilla-tor.md`, marked `experimental`. The current OpenVPN specification is `ts-040-openvpn.md`, so take care not to cite the old one.

## Which nettests show up in Taiwan

Spot-checking five time slots on 2026-08-03, 17 nettests appeared under Taiwan (written here in the API's underscore form): `web_connectivity`, `tor`, `vanilla_tor`, `telegram`, `whatsapp`, `signal`, `facebook_messenger`, `dnscheck`, `echcheck`, `http_header_field_manipulation`, `http_invalid_request_line`, `openvpn`, `psiphon`, `riseupvpn`, `stunreachability`, `ndt`, `dash`.

Directory names on S3 differ from `test_name`. Directory names carry no underscores (`webconnectivity`, `vanillator`, `facebookmessenger`) while API queries need the underscore form (`web_connectivity`, `vanilla_tor`, `facebook_messenger`). For the retrieval path in detail, see [ASN observation data retrieval and analysis](./asn-coverage-howto.md).

Taiwan's observations concentrate on `web_connectivity`, with small sample sizes for everything else. For widening local coverage, `tor` and `dnscheck` sit closest to the community's existing themes.

There are two ways to run a specific nettest. With [OONI Probe](https://ooni.org/install/){target="_blank"} on desktop or mobile, choose which nettests to enable in the settings. To invite others to measure a fixed list of URLs, use [OONI Run v2](../tools/ooni-run-v2.md) to create a shareable link. The link ID the community currently maintains is `10328`.

## Where to go from here

<div class="grid cards" markdown>

- [:material-code-json: Reading an OONI measurement](./ooni-data-format.md)
- [:material-shield-search: How OONI decides a site is blocked](./ooni-blocking-determination.md)
- [:material-database-search: ASN observation data retrieval and analysis](./asn-coverage-howto.md)
- [:material-help-network: OONI Run v2 for regional measurement](../tools/ooni-run-v2.md)
- [:material-list-status: OONI Website Testing List](../regional/ooni-checklist.md)

</div>

Each nettest's full algorithm is defined in the upstream [nettests](https://github.com/ooni/spec/tree/master/nettests){target="_blank"} directory. The fields their output shares are defined in [data-formats](https://github.com/ooni/spec/tree/master/data-formats){target="_blank"}.
