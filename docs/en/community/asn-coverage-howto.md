---
title: ASN observation data retrieval and analysis
description: How to set up and use the OONI data retrieval scripts in anoni-net/docs, covering the S3 public dataset's path layout, the trade-offs between the three ways in, the CSV fields the scripts output, and how coverage is calculated.
icon: material/database-search
---

# :material-database-search: ASN observation data retrieval and analysis

This page is the technical companion to [ASN observation data analysis](../regional/ooni-asn-coverage.md). When you want to pull OONI's public data yourself and work out the observation coverage of a region's ASNs, what follows covers how to set up and use the retrieval scripts in [anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"}.

Set up your environment first with [Development environment setup](./setup-repo.md).

!!! tip "Where to run these commands"

    Every command below runs from the `anoni-net-docs/asn_coverage/` directory. On first use, `cd` into it, run `uv sync` to install dependencies, then follow the examples below using `uv run python ooni.py ...`.

## Three ways in

OONI's observation data has three entry points serving quite different purposes. Pick the right one before starting:

| Entry point | Suits | Limitation |
|---|---|---|
| [AWS S3 public dataset](https://registry.opendata.aws/ooni/){target="_blank"} | Bulk analysis, full-population statistics, comparison over time | You parse it yourself, and downloads run to gigabytes |
| [OONI API](https://api.ooni.org/api/v1/measurements){target="_blank"} | Filtering by criteria, fetching one complete measurement | A cap on results per request |
| [OONI Explorer](https://explorer.ooni.org/){target="_blank"} | Looking things up by hand, checking individual measurements | Not suited to programmatic access |

`asn_coverage` takes the S3 route, since its purpose is coverage statistics rather than single lookups. For single measurements or small-scale filtering, [Reading an OONI measurement](./ooni-data-format.md) covers the API.

## What the scripts can answer

`ooni.py` currently produces coverage and verdict-distribution statistics. Its retrieval scope has three limits:

- **It reads the `webconnectivity` directory only**: The dozen-plus other nettests in the same hour are not included, so observations from `tor`, `telegram`, `signal` and the rest never reach the statistics. For what each nettest measures, see [OONI nettest quick reference](./ooni-nettests-map.md).
- **It takes three fields per measurement**, `probe_asn`, `annotations.network_type` and `test_keys.blocking`. It never reads the evidence layer (`queries`, `tcp_connect`, `requests`), so the output can answer "which ASNs have someone measuring, how often, and how the verdicts break down" but not "what does the evidence for one measurement look like".
- **It takes `.jsonl.gz` only**, skipping the `.tar.gz` files in the same directory.

`blocking` is the boolean `false` when no interference was observed and a string when there was. The tool normalises both into one key space before counting and records measurements with no verdict as `none`, so each ASN's verdict counts always add up to its measurement count. For how to read those verdicts, see [How OONI decides a site is blocked](./ooni-blocking-determination.md).

Going a layer deeper means pulling evidence-layer fields and comparing measurement by measurement, which needs a different storage design than plain counters can carry.

## How the S3 dataset is laid out

The bucket is `ooni-data-eu-fra` in `eu-central-1`, and public reads need no credentials. Paths nest four levels deep by date, hour, country code and nettest:

```text title="Path structure"
raw/{YYYYMMDD}/{HH}/{country}/{nettest}/{YYYYMMDDHH}_{country}_{nettest}.n{batch}.{seq}.jsonl.gz
```

!!! warning "Both date and hour are UTC"

    The `{YYYYMMDD}` and `{HH}` in the path, along with the `date` and `hour` fields in the CSV output further down, are all UTC. The scripts take time through `arrow.Arrow.utcnow()` throughout. When analysing "the observation distribution during a given local time window", convert for your own offset first, or the whole chart shifts.

The `.n{batch}.{seq}` at the end of the filename is OONI's internal batch numbering and can be ignored when parsing.

You can check what is in there before installing anything:

```bash title="List every nettest for one hour in Taiwan"
curl -s "https://ooni-data-eu-fra.s3.eu-central-1.amazonaws.com/?list-type=2&prefix=raw/20260804/00/TW/&delimiter=/" \
  | grep -oE '<Prefix>raw/[^<]+</Prefix>'
```

The response is XML on a single line, so the `grep` above pulls out just the directory names. Taiwan usually has a dozen-plus nettest directories within a single hour, with `webconnectivity` only one of them, alongside `tor`, `telegram`, `signal`, `whatsapp`, `dnscheck`, `echcheck`, `openvpn`, `psiphon`, `ndt` and `dash`.

Each nettest directory packages the same batch two ways, `.jsonl.gz` and `.tar.gz`. Unpacked, `.jsonl.gz` gives one measurement per line, which suits line-by-line parsing, and it is what the scripts read. Taking Taiwan's `webconnectivity` on 2026-08-04 as an example, a single file runs around 10 MB, which scales to a substantial figure across a full month of national data, so estimate bandwidth and runtime before a real run. The scripts stream, so raw files never land on disk and only the CSV comes out at the end.

For how to read each line's fields, see [Reading an OONI measurement](./ooni-data-format.md). For what the verdict fields mean, see [How OONI decides a site is blocked](./ooni-blocking-determination.md).

## Retrieval and analysis commands

### Look back over recent observations

```bash title="Look back over the last 36 hours"
uv run python ooni.py lookback --units=36 --loc=TW --frame=hours
```

All three arguments are optional and the example above is the default. `--frame` sets the unit for the total lookback span and accepts `hours`, `days`, `weeks` and so on. Whatever you pass, the data is always split by hour. Output filename format:

- `lookback_{loc}_{YYYYMMDD}_{units}_{frame}.csv`

The `{YYYYMMDD}` in the filename is the UTC date the script ran, not the range the data covers, so check the file contents for the actual range. The file is written to the current working directory.

### Retrieve a date range

```bash title="Retrieve a specified range"
uv run python ooni.py span --start=2026/08/01 --end=2026/08/03 --loc=TW --chunk=40
```

Give a start time (`start`) and end time (`end`) to retrieve hourly data across that period. `--chunk` controls how many hours are processed concurrently, defaulting to `40`, and should be lowered when network or memory is tight. Output filename format:

- `span_{loc}_{startYYYYMMDD}_{endYYYYMMDD}.csv`

### Convert to spreadsheet rows

```bash title="Expand into spreadsheet format"
uv run python ooni.py sheetrow --path=./span_TW_20260801_20260803.csv
```

Expands data you have already retrieved so it can be worked with in a spreadsheet. The output filename is the original prefixed with `rows_`, which for the example above is `rows_span_TW_20260801_20260803.csv`.

## The CSV output format

Files produced by `lookback` and `span` have four fields, one row per hour:

| Field | Contents |
|---|---|
| `loc` | Country code, for example `TW` |
| `date` | Date as `YYYY/MM/DD`, UTC |
| `hour` | Hour as `HH`, UTC |
| `statistics` | That hour's statistics, held as a JSON string |

`statistics` holds three counts: `counts` tallies measurements per ASN, `network_type` tallies by connection type, and `blocking` tallies the verdict distribution per ASN. Taking real data from hour `00` in Taiwan on 2026-08-04, with 551 measurements in that hour:

```json title="The statistics field expanded"
{"counts": {"AS3462": 300, "AS17716": 100, "AS18419": 100, "AS24158": 51},
 "network_type": {"mobile": 44, "no_internet": 7},
 "blocking": {"AS3462": {"false": 294, "dns": 1, "tcp_ip": 1, "none": 4},
              "AS17716": {"false": 94, "none": 6},
              "AS18419": {"false": 99, "none": 1},
              "AS24158": {"false": 51}}}
```

`counts` and `blocking` reconcile per ASN. `network_type` does not, and that is normal. It is annotated by the Probe itself, which mobile apps generally write and CLI and desktop versions mostly do not. Only 51 of the 551 measurements above carry the annotation, and the scripts skip measurements without one. Within that, `no_internet` means the Probe judged itself to be offline at measurement time. With annotation coverage below ten percent, the field suits trends rather than serving as a mobile-versus-fixed-line ratio.

`none` inside `blocking` means no verdict was recorded, covering both a missing `test_keys` and a `null` blocking. Eleven of the 551 measurements above fall into it. The share is small but it shows up in every ASN, so an anomaly-rate calculation has to decide whether those belong in the denominator.

Nested JSON is awkward to work with in a spreadsheet, which is what `sheetrow` flattens into one row per ASN:

| `loc` | `date` | `hour` | `asn` | `count` | `anomaly` | `blocking_false` | `blocking_dns` | `blocking_tcp_ip` |
|---|---|---|---|---|---|---|---|---|
| `TW` | `2026/08/04` | `00` | `AS3462` | `300` | `2` | `294` | `1` | `1` |
| `TW` | `2026/08/04` | `00` | `AS17716` | `100` | `0` | `94` | `0` | `0` |

The remaining columns are `blocking_http_failure`, `blocking_http_diff`, `blocking_none` and `blocking_other`, trimmed from the table above for width. `anomaly` sums the four interference types and can serve directly as the numerator in a spreadsheet. `blocking_other` catches values ts-017 does not define yet, so it should read `0`, and anything else means upstream has added a verdict type.

A worked example of the resulting spreadsheet (2023-09 to 2023-12):

[:material-google-spreadsheet: 20230901-20231204-TW](https://docs.google.com/spreadsheets/d/1lMDsqX8Oa3GKW68y8TuFeKQW2nKM7X0u4z-RopfJIaA/){ .md-button .md-button--primary target="_blank" }

## Calculating ASN coverage

Coverage needs two numbers: the count of distinct ASNs appearing in the observation data, and the total ASNs registered to that region. Get the first from the flattened CSV in the previous section with a pivot table, and the second from RIPE NCC via `ripe.py`:

```bash title="Fetch the full ASN list for a region"
uv run python ripe.py save --loc=TW
```

The output filename is `asns_{YYYYMMDDTHH}.csv`, with six fields: `no`, `location`, `org_id`, `registrar`, `reserved` and `name`.

!!! warning "The two ASN formats differ, so normalise before matching"

    The `no` field `ripe.py` outputs is a plain number (`3462`), while `probe_asn` in OONI data carries an `AS` prefix (`AS3462`). A VLOOKUP across them matches nothing, so add or strip the `AS` on one side first.

With both numbers in hand:

```text title="Coverage formula"
coverage = distinct ASNs appearing in observation data ÷ total ASNs registered to the region
```

Taking the 2023-12 report cited in [ASN observation data analysis](../regional/ooni-asn-coverage.md), Taiwan had roughly 437 ASNs at the time and the observation data covered 7.32% of them as distinct ASNs. You can rerun the same formula over a recent range to see whether coverage has improved.

## :fontawesome-solid-diagram-project: Where to go from here

With the data retrieved, the next step is reading the fields on each line.

<div class="grid cards" markdown>

- [:material-code-json: Reading an OONI measurement](./ooni-data-format.md)
- [:material-shield-search: How OONI decides a site is blocked](./ooni-blocking-determination.md)
- [:material-table-search: OONI nettest quick reference](./ooni-nettests-map.md)
- [:material-access-point-network: ASN observation data analysis](../regional/ooni-asn-coverage.md)
- [:material-list-status: OONI Website Testing List](../regional/ooni-checklist.md)
- [:octicons-mark-github-24: Development environment setup](./setup-repo.md)

</div>
