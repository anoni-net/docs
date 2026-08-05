---
title: How OONI decides a site is blocked
description: How the blocking field in Web Connectivity is computed, what evidence backs each of the four verdicts, and why a value in blocking is not a confirmed block. Five real measurements walk through the reading method and the usual sources of misreading.
icon: material/shield-search
---

# :material-shield-search: How OONI decides a site is blocked

[Reading an OONI measurement](./ooni-data-format.md) covers where the fields live. The next question is how their values are computed. Seeing `blocking: "dns"` is usually not enough to conclude that a site is blocked in a given country.

`blocking` only records that one measurement disagreed with its control, which is several steps short of a confirmed block. Below: how the verdict is reached, what evidence backs each of the four types, and what has to be added before a single measurement supports a credible conclusion.

## The basis of the verdict: a two-sided comparison

A Probe measuring a site on its own cannot tell "the site is being interfered with" apart from "the site is down". `web_connectivity` handles this by measuring the same URL twice, once from the Probe's network and once via an OONI test helper on an unrestricted network, then comparing the two.

A test helper is a measurement server OONI runs on an unrestricted network. Its observations are collected under `test_keys.control` and cover DNS resolution, TCP connection state and the HTTP response. Every verdict field is built on the difference between the two sides:

| Where the difference appears | Verdict |
|---|---|
| DNS resolution disagrees | `blocking: "dns"` |
| DNS agrees, the Probe cannot connect but the test helper can | `blocking: "tcp_ip"` |
| TCP connects, the HTTP stage fails | `blocking: "http-failure"` |
| HTTP responds, the content differs from what the test helper got | `blocking: "http-diff"` |
| Both sides fine and content matches | `blocking: false`, `accessible: true` |

The order runs top to bottom, and a failure at the DNS stage stops the comparison there. In the first three cases all four `*_match` fields are `null`, precisely because the comparison halted at an earlier stage.

!!! tip "Read `control` before `blocking`"

    `blocking` is the result of a two-sided comparison, not something the Probe observed on its own. When reading any anomalous measurement, first check what the test helper saw in `test_keys.control`, then go back to `blocking`. The `tcp_ip` example in the next section shows how skipping `control` turns a site's own problem into an apparent block.

## The evidence behind each verdict

The five measurements cited below are all public data from 2026-08-04, and the raw content can be looked up on [OONI Explorer](https://explorer.ooni.org/){target="_blank"}.

### `dns`: resolution disagrees

In a Taiwanese measurement of `https://ntc.party/`, the Probe's A and AAAA queries both returned `dns_nxdomain_error` (domain does not exist) while the test helper resolved it, so `dns_consistency` was marked `inconsistent`.

```json title="test_keys.queries"
{"query_type": "A", "failure": "dns_nxdomain_error", "answers": []}
{"query_type": "AAAA", "failure": "dns_nxdomain_error", "answers": []}
```

DNS verdicts need care about which resolver was in play. That measurement's `resolver_asn` is `AS13335` (Cloudflare) while `probe_asn` is `AS3462` (Chunghwa Telecom). When the measurer points DNS at an overseas service, an anomaly at the DNS stage does not necessarily reflect what the local carrier is doing.

### `tcp_ip`: cannot reach the target address

A Taiwanese measurement of `http://www.tkec.com.tw/` came back as `tcp_ip`. DNS resolved normally to `210.64.193.1`, and the Probe timed out connecting to port `80`.

Reading only the Probe side invites the conclusion that it was blocked. The control tells a different story:

```json title="test_keys.control.tcp_connect"
{"210.64.193.1:443": {"status": true,  "failure": null},
 "210.64.193.1:80":  {"status": false, "failure": "generic_timeout_error"}}
```

The test helper timed out on port `80` from the outside as well, so the site's port `80` was unreachable from anywhere, with nothing to do with the network in Taiwan. Port `443` on the same IP worked from both sides, which further points at that one port rather than the path.

### `http-failure`: connects but returns nothing

A Taiwanese measurement of `https://bit.ly/` came back as `http-failure`. DNS was fine, port `443` on both target IPs connected, `control` showed the same from the test helper's side, and the difference showed up as `generic_timeout_error` during the HTTP stage.

A working connection layer with a failing application layer is common with server-side rate limiting, refusal of service to particular sources, and breaks at the TLS layer. Telling those apart means reading the timing in `tls_handshakes` and `network_events`.

### `http-diff`: the content differs

Taiwan's data does contain `http-diff`, though not in this shape (see "What Taiwan's data looks like" below), so the example here comes from Indonesia to show what a block page looks like.

Of the four types only `http-diff` puts the four `*_match` fields to work. A measurement of `http://www.sportsinteraction.com/` in Indonesia is a textbook case:

| Observer | Status code | Title | Body length |
|---|---|---|---|
| Probe | `200` | `Trustpositif` | 7,044 |
| test helper | `403` | `Maintenance` | 7,067 |

The Probe's request was redirected to `http://lamanlabuh.aduankonten.id/`, an Indonesian government content-complaint domain, and the page title `Trustpositif` is the name of the country's content filtering system. An ISP steering users to a notice page mid-connection is the most typical cause of `http-diff`.

The same measurement demonstrates that no single field can be trusted alone:

```text title="The four *_match fields and body_proportion"
title_match: false        status_code_match: false
headers_match: true       body_length_match: true
body_proportion: 0.9967
```

`body_length_match` is `true` and `body_proportion` is close to `1` purely because the block page happens to be about as long as the control page. Reading length alone gives the wrong answer. Read all four together, and note that `title_match` and `status_code_match` usually discriminate best.

## Where misreadings come from

A value in `blocking` with no actual network interference behind it is normal in this dataset. The unreachable port `80` on `tkec.com.tw` above is one case. Here is a subtler one.

An Egyptian measurement of `http://www.newipnow.com/` came back as `http-diff`, with three of the four `*_match` fields not matching and `body_proportion` at just `0.02`. It looks like an injected block page. The actual content:

| Observer | Status code | Title |
|---|---|---|
| Probe | `520` | `newipnow.com \| 520: Web server is returning an unknown error` |
| test helper | `200` | `Buy Private Proxies: $0.88 per Dedicated Premium IP - NewIPNow` |

`520` is the error page Cloudflare returns when the origin server in front of the target site misbehaves, which means the site itself was failing at the time and Egyptian network controls had nothing to do with it. Worth noting too: that measurement's `probe_asn` is `AS13335` (Cloudflare), so the measuring end was also running on Cloudflare's network, which falls under the second category below.

Common sources of misreading group into a few kinds:

- **The origin site's own state**: server errors, maintenance pages, CDN error pages, geographic restrictions.
- **The measurement environment**: with a VPN or Tor running, the Probe measures the network at the exit instead.
- **Dynamic site content**: rotating ads, personalisation and A/B tests make the two sides differ by design.
- **A failing control**: when `control_failure` has a value, the comparison has no basis.

OONI handles the same class of problem at the dataset level. For how, see [OONI is guarding its data against bad measurements](../blog/posts/2026-ooni-faulty-measurements.md), which covers the heuristics OONI uses to filter anomalous submissions.

## From one measurement to a credible conclusion

Getting from an observation to "this site is blocked in this place" takes more than one measurement. In practice, add a few dimensions:

1. **Across time**: the same URL producing the same verdict repeatedly over days or weeks rules out a one-off outage.
2. **Across ASNs**: several carriers measuring the same result points at behaviour common to the network layer. A result confined to one ASN is more likely that operator's own configuration.
3. **Across resolvers**: still anomalous with a different DNS resolver rules out the resolver itself.
4. **Check the `confirmed` field**: OONI's backend matches measurements against known block-page fingerprints and marks `confirmed` as `true` on a hit. The field appears in [measurements API](https://api.ooni.io/api/v1/measurements){target="_blank"} responses as backend analysis, and is not part of the raw data the Probe produces.

To run comparisons across time or across ASNs yourself, [ASN observation data retrieval and analysis](./asn-coverage-howto.md) covers bulk retrieval.

!!! warning "`confirmed` being `true` does not mean `http-diff`"

    The two are easily conflated. `confirmed` is based on block fingerprint matching, and DNS steered to a known blocking IP is also marked `confirmed` while the verdict type stays `dns`. At the time of writing, a spot check of 5 `confirmed` measurements each from Iran, Russia, Turkey and China put every sample at `blocking: "dns"`. The sample is small, so it shows only that the two are not the same thing, and supports no general rule.

## What Taiwan's data looks like

The figures below come from the full 24 hours of Taiwanese `web_connectivity` data ending 2026-08-05, 22,105 measurements in total. Every measurement in that window was parsed line by line from S3 and its `test_keys.blocking` tallied per ASN:

| Verdict | Measurements | Share |
|---|---|---|
| `false` (no interference observed) | 21,029 | 95.13% |
| `none` (no verdict recorded) | 512 | 2.32% |
| `tcp_ip` | 312 | 1.41% |
| `dns` | 150 | 0.68% |
| `http-failure` | 67 | 0.30% |
| `http-diff` | 35 | 0.16% |

The four interference types add up to 564 measurements, 2.55% of the total. `none` covers measurements with missing `test_keys` or a `null` blocking, so an anomaly-rate calculation has to decide whether they belong in the denominator.

Separately, of 100 anomalous measurements checked, 0 had `confirmed` set to `true`, consistent with what [ASN observation data analysis](../regional/ooni-asn-coverage.md) has described all along.

!!! warning "A small sample gives the wrong distribution"

    An earlier draft of this page estimated the verdict distribution from 40 measurements sampled off the measurements API's anomaly listing, concluding that `dns` dominated and `http-diff` was absent. Full-population statistics contradict both: `tcp_ip` runs more than double `dns`, and `http-diff` does occur. The API's anomaly listing has its own ordering and does not behave as a random sample. For distributions, run the full-population count, as described in [ASN observation data retrieval and analysis](./asn-coverage-howto.md).

Taiwan's `http-diff` is not the same phenomenon as the Indonesian example above. Across 15 of them sampled from a four-hour window, `body_proportion` ran between `0.004` and `0.21`, meaning the Probe retrieved far less content than the control, the opposite of the block page pattern that sits close to `1`. Very short content usually points at an error page or an empty response. Establishing the cause needs the evidence layer checked measurement by measurement, which this page does not attempt.

To rerun the statistics above yourself:

```bash title="Get the verdict distribution"
uv run python ooni.py lookback --units=24 --loc=TW --frame=hours
```

The command prints the `blocking` totals and writes the per-ASN distribution into the CSV. Individual measurements still come from the API:

```bash title="List anomalous measurements from Taiwan"
curl -s "https://api.ooni.io/api/v1/measurements?probe_cc=TW&test_name=web_connectivity&anomaly=true&limit=100" \
  | python3 -m json.tool | head -40
```

This is a snapshot of a single 24-hour window, reflecting that day's shape and not enough to conclude anything about longer trends. Trends need a longer span, and Taiwan's observations carry their own limitation in how concentrated they are across ASNs. For detail, see [ASN observation data analysis](../regional/ooni-asn-coverage.md).

## Where to go from here

To run your own comparisons across time and across ASNs, start with the retrieval guide.

<div class="grid cards" markdown>

- [:material-database-search: ASN observation data retrieval and analysis](./asn-coverage-howto.md)
- [:material-code-json: Reading an OONI measurement](./ooni-data-format.md)
- [:material-table-search: OONI nettest quick reference](./ooni-nettests-map.md)
- [:material-access-point-network: ASN observation data analysis](../regional/ooni-asn-coverage.md)
- [:material-list-status: OONI Website Testing List](../regional/ooni-checklist.md)

</div>

The full verdict algorithm is defined upstream in [ts-017-web-connectivity](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"}, and the unified naming for failure strings is in [df-007-errors](https://github.com/ooni/spec/blob/master/data-formats/df-007-errors.md){target="_blank"}.
