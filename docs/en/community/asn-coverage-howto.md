---
title: ASN observation data retrieval and analysis
description: Pull OONI's public measurement data from AWS S3 with the project's retrieval scripts and work out a region's ASN coverage, covering ooni.py lookback, span, and sheetrow plus ripe.py for the full ASN list.
icon: material/database-search
---
# :material-database-search: ASN observation data retrieval and analysis

This page covers the tooling for retrieving OONI's public measurement data and calculating ASN coverage for a region. For what the resulting numbers mean and why ASN diversity matters, start with [ASNs Observation Data Analysis](../regional/ooni-asn-coverage.md).


The data from tests conducted using OONI Probe is sent back for storage in OONI's [AWS S3 Open Data](https://registry.opendata.aws/ooni/){target="_blank"}. [OONI Docs](https://docs.ooni.org/data){target="_blank"} provides a simple tutorial on data retrieval, and you can also use our completed [retrieval script](https://github.com/anoni-net/docs/blob/main/asn_coverage/ooni.py){target="_blank"}. The data field structure can be referenced from [ooni/spec](https://github.com/ooni/spec){target="_blank"}.

Below is a guide on how to retrieve test observation data using the [retrieval script](https://github.com/anoni-net/docs/blob/main/asn_coverage/ooni.py){target="_blank"}.

!!! info "Where to run these commands"

    Set up the project environment first, see [Project research preparation](./setup-repo.md). All commands below run from the `asn_coverage/` directory of a cloned [anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"} checkout, after `uv sync` has installed the dependencies:

    ```bash
    cd anoni-net-docs/asn_coverage
    uv sync
    ```

```bash title="Look Back Observation Data"
python3 ./ooni.py lookback [--units=36] [--loc=TW] [--frame=hours]
```

The interval unit is hours, defaulting to 36 units (36 hours), and the region is Taiwan (TW). After execution, files are stored according to the format below:

- `lookback_{loc}_{YYYYMMDD}_{units}_{frame}.csv`

```bash title="Retrieve Interval Data"
python3 ./ooni.py span --start=YYYY/MM/DD --end=YYYY/MM/DD [--loc=TW]
```

Give a start date (`--start`) and end date (`--end`) to retrieve hourly data for the chosen region (`--loc`, defaults to `TW`).

```bash title="Convert to Spreadsheet Data"
python3 ./ooni.py sheetrow --path={data_path}
```

After extracting the data, it is expanded for ease of calculation in a spreadsheet and saved as a data file prefixed with `rows_`.

Run `Retrieve Interval Data` first, then `Convert to Spreadsheet Data`, to get how often each ASN appears along with the deduplicated counts. Combined with the full list of ASNs registered to a country, that gives you the coverage percentages.

`ripe.py` pulls that full ASN list for a country from the RIPE database, which is the denominator for the coverage figures above.

```bash title="ASN Statistical Calculation"
python3 ./ripe.py save --loc=TW
```

For a worked example of the resulting statistics, see:

[:material-google-spreadsheet: 20230901-20231204-TW](https://docs.google.com/spreadsheets/d/1lMDsqX8Oa3GKW68y8TuFeKQW2nKM7X0u4z-RopfJIaA/){ .md-button .md-button--primary target="_blank" }


## :fontawesome-solid-diagram-project: Where to go from here

<div class="grid cards" markdown>

- [:material-access-point-network: ASNs Observation Data Analysis](../regional/ooni-asn-coverage.md) — what the coverage numbers mean
- [:material-list-status: OONI Website Testing List](../regional/ooni-checklist.md) — the list these measurements run against
- [:octicons-mark-github-24: Project research preparation](./setup-repo.md) — environment setup

</div>
