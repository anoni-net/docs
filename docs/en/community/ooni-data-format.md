---
title: Reading an OONI measurement
description: What fields make up a single OONI measurement, and how to read "who measured from where" and "what did they find" out of it. Two real Taiwanese measurements compared side by side, each field mapped to its upstream ooni/spec document.
icon: material/code-json
---

# :material-code-json: Reading an OONI measurement

[ASN observation data retrieval and analysis](./asn-coverage-howto.md) covers how to pull OONI's public data. Once you have it, the next problem shows up: a single measurement carries more than twenty top-level fields, with another twenty-odd inside `test_keys`. Which ones matter?

Below, two real measurements from Taiwan are compared side by side to explain how a Web Connectivity (`web_connectivity`) measurement is put together, and which upstream [ooni/spec](https://github.com/ooni/spec){target="_blank"} document defines each field. Once the layout is clear you can judge for yourself what a measurement says, and decide which fields your analysis code needs to read.

!!! info "Where these examples come from"

    Both are public measurements produced by OONI Probe in Taiwan on 2026-08-04. You can look up the raw content on [OONI Explorer](https://explorer.ooni.org/){target="_blank"}.

    | | Passed | Flagged as anomalous |
    |---|---|---|
    | Target | `http://presidentlee.tw/` | `https://ntc.party/` |
    | `measurement_uid` | `20260804085935.603513_TW_webconnectivity_4a5fd27dec0b32f6` | `20260804084548.416537_TW_webconnectivity_f4e7b0ab3d0251bf` |

## Three layers in one measurement

There is no need to memorise every field up front. A measurement reads as three layers:

1. **The envelope**: who measured, from where, with which software, and when. Every nettest shares this same set of fields, defined in [df-000-base](https://github.com/ooni/spec/blob/master/data-formats/df-000-base.md){target="_blank"}.
2. **The verdict**: the conclusion the measurement reached. These fields vary by nettest and all live under `test_keys`. For `web_connectivity` they are defined in [ts-017](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"}.
3. **The evidence**: the raw record behind the conclusion, covering every DNS query, TCP connection, TLS handshake and HTTP request, plus the control's equivalent records. Also under `test_keys`, each with its own `df-` specification.

The verdict layer tells you the conclusion. The evidence layer lets you check it. Read them separately and each field's role becomes clear.

## Pull one for yourself

Following along with a sample in hand is much faster. You do not need a local environment first, since the public API returns a single measurement directly. Start by listing measurements that match your criteria:

```bash title="List recent Web Connectivity measurements from Taiwan"
curl -s "https://api.ooni.io/api/v1/measurements?probe_cc=TW&test_name=web_connectivity&limit=5" \
  | python3 -m json.tool | head -40
```

The `measurement_uid` in the response gets you the full content:

```bash title="Fetch one complete measurement"
curl -s "https://api.ooni.io/api/v1/raw_measurement?measurement_uid=<measurement_uid>" \
  | python3 -m json.tool | head -60
```

The raw response is one long unbroken string, which is painful to read in a terminal, so both commands above pipe it through `python3 -m json.tool`. Adding `anomaly=true` returns only measurements flagged as anomalous, which is handy for finding contrasting examples. Swap `probe_cc` for your own region and `probe_asn` for your own network to see what has been observed locally.

For bulk processing, the AWS S3 public dataset is far more efficient. See [ASN observation data retrieval and analysis](./asn-coverage-howto.md).

## The envelope: who measured from where

Envelope fields are identical across every nettest. These are the ones you reach for most often:

| Field | Passed | Flagged as anomalous | Meaning |
|---|---|---|---|
| `probe_cc` | `TW` | `TW` | Country code where the measurement happened |
| `probe_asn` | `AS3462` | `AS3462` | ASN of the network running the measurement |
| `probe_network_name` | `Chunghwa Telecom Co., Ltd.` | `Chunghwa Telecom Co., Ltd.` | Organisation name for that ASN |
| `resolver_asn` | `AS3462` | `AS13335` | ASN of the DNS resolver actually used |
| `resolver_network_name` | `Chunghwa Telecom Co., Ltd.` | `Cloudflare Inc` | Organisation name for the resolver |
| `input` | `http://presidentlee.tw/` | `https://ntc.party/` | URL being measured |
| `test_name` | `web_connectivity` | `web_connectivity` | Nettest name |
| `software_name` | `ooniprobe-cli` | `ooniprobe-desktop-unattended` | Which kind of Probe produced the data |
| `software_version` | `3.29.1` | `3.26.0` | Probe version |
| `measurement_start_time` | `2026-08-04 08:59:30` | `2026-08-04 08:45:45` | Start time in UTC |
| `report_id` | `20260804T062033Z_webconnectivity_TW_3462_n4_uEH5rGoD07cN2oYQ` | `20260804T084446Z_webconnectivity_TW_3462_n4_dFfWCDrwouM0TsT2` | Shared by every measurement from the same run |

`probe_asn` and `resolver_asn` can differ, as the table shows. Both measurements ran on Chunghwa Telecom's network, but one of the users had pointed DNS at Cloudflare. Keep the two apart in ASN analysis, because conflating them distorts any claim about what is visible on a given carrier's network.

!!! note "`probe_ip` is always `127.0.0.1`"

    OONI deliberately does not collect the measurer's real IP, so `probe_ip` is hardcoded to the loopback address. Tracing a measurement back to its source relies on `probe_asn` plus timing. The same privacy boundary is why [OONI Run v2 for regional measurement](../tools/ooni-run-v2.md) asks people to think about what they are asking helpers to run.

## The verdict: what the measurement concluded

Verdict fields all live under `test_keys`. One thing to know before reading them: `web_connectivity` reaches its verdict by comparison. After the Probe finishes, an OONI test helper on an unrestricted network measures the same URL again, and the difference between the two sides is what the verdict is built from. The test helper's side is recorded under `test_keys.control`, which is what "the control" refers to below.

Eight fields carry the verdict and the content comparison. Side by side, the difference is obvious:

| Field | Passed | Flagged as anomalous | Meaning |
|---|---|---|---|
| `blocking` | `false` | `"dns"` | Type of interference found. Possible values are `dns`, `tcp_ip`, `http-failure` and `http-diff`, or the boolean `false` when nothing was observed |
| `accessible` | `true` | `false` | Whether a sensible response was obtained |
| `dns_consistency` | `"consistent"` | `"inconsistent"` | Whether the Probe's DNS result agrees with the control |
| `title_match` | `true` | `null` | Whether the page title matches the control |
| `headers_match` | `true` | `null` | Whether response headers match |
| `status_code_match` | `true` | `null` | Whether the HTTP status code matches |
| `body_length_match` | `true` | `null` | Whether body lengths are close |
| `body_proportion` | `1` | `0` | Body length as a ratio against the control |

Three more fields record where things failed, and belong in the same reading:

| Field | What it records |
|---|---|
| `dns_experiment_failure` | Failure during the DNS stage. `"dns_nxdomain_error"` in the anomalous measurement |
| `http_experiment_failure` | Failure during the HTTP stage, for example `"generic_timeout_error"` |
| `control_failure` | Whether the control itself failed. When this has a value, the comparison has no basis and the verdict cannot be trusted |

The four values of `blocking` map to failures at different stages. `dns` means the resolution disagreed with the control, `tcp_ip` means packets never reached the target address, `http-failure` means the connection was established but the HTTP stage failed, and `http-diff` means the content retrieved differs from the control, which commonly indicates a block page. OONI's own [glossary](https://ooni.org/support/glossary/){target="_blank"} introduces these interference techniques at a conceptual level.

!!! tip "Two type traps worth knowing about"

    `blocking` is the boolean `false` when no interference was observed, and a string when there was. Normalise it before running statistics, or `false` and `"dns"` end up counted as two unrelated categories.

    The four values are not named consistently: `tcp_ip` uses an underscore while `http-failure` and `http-diff` use hyphens. That is how upstream defines them, so copy them verbatim rather than tidying them up.

All four `*_match` fields are `null` in the anomalous measurement, because the DNS stage already failed, no connection was made, and there was nothing left to compare. When you see a row of `null`, go back and find the first failure field with a value in the measurement flow. That is where the problem happened.

!!! warning "Anomalous does not mean blocked"

    A value in `blocking` only means this measurement disagreed with the control. Establishing that network interference actually occurred takes more evidence. In the anomalous measurement above, the Probe's A and AAAA queries for `ntc.party` both returned `dns_nxdomain_error` (domain does not exist), yet at the time of writing the domain resolved to an IPv6 address through several public resolvers. A single measurement cannot separate network interference from a resolver's momentary state or a change in the domain's own configuration.

    Concluding that something is blocked needs measurements cross-referenced over time, across ASNs and across resolvers. For the full breakdown of the verdict mechanism and where misreadings come from, see [How OONI decides a site is blocked](./ooni-blocking-determination.md). For quality control at the dataset level, see [OONI is guarding its data against bad measurements](../blog/posts/2026-ooni-faulty-measurements.md).

## The evidence: the raw record behind the verdict

Several more fields under `test_keys` record every network operation the measurement performed. Each has its own specification:

| Field | Contents | Specification |
|---|---|---|
| `queries` | Question, answer and failure for every DNS query | [df-002-dnst](https://github.com/ooni/spec/blob/master/data-formats/df-002-dnst.md){target="_blank"} |
| `tcp_connect` | Target and outcome of every TCP connection attempt | [df-005-tcpconnect](https://github.com/ooni/spec/blob/master/data-formats/df-005-tcpconnect.md){target="_blank"} |
| `tls_handshakes` | Parameters, certificates and outcome of every TLS handshake | [df-006-tlshandshake](https://github.com/ooni/spec/blob/master/data-formats/df-006-tlshandshake.md){target="_blank"} |
| `requests` | Full content of every HTTP request and response | [df-001-httpt](https://github.com/ooni/spec/blob/master/data-formats/df-001-httpt.md){target="_blank"} |
| `network_events` | Timed events across the connection, for analysing latency and where things broke | [df-008-netevents](https://github.com/ooni/spec/blob/master/data-formats/df-008-netevents.md){target="_blank"} |
| `control` | The control's equivalent records, structured to mirror the Probe side. Every verdict field is derived from the difference between the two | [ts-017](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"} |
| `failure` strings throughout | Unified naming for every failure reason, such as `dns_nxdomain_error`, `generic_timeout_error` and `ssl_unknown_authority` | [df-007-errors](https://github.com/ooni/spec/blob/master/data-formats/df-007-errors.md){target="_blank"} |

Laying the two measurements' `queries` side by side shows exactly what the verdict rests on:

```json title="Passed: address resolved"
{
  "hostname": "presidentlee.tw",
  "query_type": "A",
  "failure": null,
  "answers": [{"answer_type": "A", "ipv4": "43.254.17.201"}]
}
```

```json title="Anomalous: query came back empty"
{
  "hostname": "ntc.party",
  "query_type": "A",
  "failure": "dns_nxdomain_error",
  "answers": []
}
```

`dns_consistency` in the verdict layer is the conclusion. `queries` and `control` are what it is based on. To check whether a verdict is reasonable, go down to the evidence layer.

## Versions and compatibility

Checking versions before reading the spec saves a good deal of confusion:

- **`data_format_version` is currently `0.2.0`.** Envelope field definitions are stable, so [df-000-base](https://github.com/ooni/spec/blob/master/data-formats/df-000-base.md){target="_blank"} can be read directly against real data.
- **The `test_version` actually in circulation for `web_connectivity` is `0.4.3`.** [ts-017](https://github.com/ooni/spec/blob/master/nettests/ts-017-web-connectivity.md){target="_blank"} has been updated to describe the v0.5 algorithm, while production still runs mostly on v0.4. The spec requires a new algorithm to use different test_keys fields, so the v0.4 definitions stay compatible and the field readings above apply to both versions.
- **Fields starting with `x_` are not in the spec.** Real data contains `x_dns_runtime`, `x_status`, `x_th_runtime` and others. They are experimental implementation extensions that come and go between versions, so analysis code should not depend on them.

The spec's master branch has had no new merges since 2025-06, though issues and pull requests are still under discussion, including proposals for an ICMP data format and a DPI fragmentation nettest. The spec works well as a stable reference for now. Link back to the upstream text when citing it, rather than copying specification content that will drift once upstream moves.

## Where to go from here

With the fields understood, the next question is how the verdict fields are computed, and why a value does not mean a block.

<div class="grid cards" markdown>

- [:material-shield-search: How OONI decides a site is blocked](./ooni-blocking-determination.md)
- [:material-table-search: OONI nettest quick reference](./ooni-nettests-map.md)
- [:material-database-search: ASN observation data retrieval and analysis](./asn-coverage-howto.md)
- [:material-access-point-network: ASN observation data analysis](../regional/ooni-asn-coverage.md)
- [:material-list-status: OONI Website Testing List](../regional/ooni-checklist.md)

</div>

The full upstream index is at [ooni/spec](https://github.com/ooni/spec){target="_blank"}, where [data-formats](https://github.com/ooni/spec/tree/master/data-formats){target="_blank"} holds the data formats and [nettests](https://github.com/ooni/spec/tree/master/nettests){target="_blank"} holds each nettest's algorithm definition.
