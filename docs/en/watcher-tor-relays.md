---
title: Tor Relays
description: Various observation indicators to understand the current operation status of Tor Relays across regions.
icon: material/chart-bar

---

<div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1.25rem;">
  <span style="font-weight:500;font-size:.95rem;">Region:</span>
  <select id="country-selector" style="padding:.35rem .7rem;border-radius:4px;border:1px solid var(--md-default-fg-color--light);background:var(--md-default-bg-color);color:var(--md-default-fg-color);font-size:.9rem;cursor:pointer;">
    <option value="tw" selected>🇹🇼 Taiwan</option>
    <option value="jp">🇯🇵 Japan</option>
    <option value="kr">🇰🇷 South Korea</option>
    <option value="hk">🇭🇰 Hong Kong</option>
  </select>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
  if (!window.vegaEmbed) return;
  var charts = [];
  var _orig = window.vegaEmbed;

  window.vegaEmbed = function (el, spec, opts) {
    if (spec && typeof spec === 'object') {
      charts.push({ el: el, spec: JSON.parse(JSON.stringify(spec)), opts: opts || {} });
    }
    return _orig.apply(this, arguments);
  };

  function fetchAsnTable(country) {
    var tbody = document.getElementById('asn-table-body');
    var caption = document.getElementById('asn-table-date');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:.6rem;color:var(--md-default-fg-color--light);">Loading...</td></tr>';
    fetch('https://anoni.net/api/vega/tor/relays/asn?country=' + country)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.length) {
          tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:.6rem;">No data</td></tr>';
          return;
        }
        var latestDate = data.reduce(function (m, d) { return d.created_at > m ? d.created_at : m; }, '');
        var latestDay = latestDate.slice(0, 10);
        if (caption) caption.textContent = 'Data date: ' + latestDay;
        var rows = data
          .filter(function (d) { return d.created_at.slice(0, 10) === latestDay; })
          .sort(function (a, b) { return b.count - a.count; })
          .map(function (d) {
            var asnNum = d.asn.replace(/^AS/i, '');
            var asnLink = '<a href="https://radar.cloudflare.com/as' + asnNum + '" target="_blank" rel="noopener">' + d.asn + '</a>';
            return '<tr><td>' + asnLink + '</td><td>' + (d.as_name || '') + '</td><td style="text-align:right;">' + d.count + '</td></tr>';
          }).join('');
        tbody.innerHTML = rows || '<tr><td colspan="3" style="text-align:center;">No data</td></tr>';
      })
      .catch(function () {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--md-default-fg-color--light);">Failed to load</td></tr>';
      });
  }

  fetchAsnTable('tw');

  var COUNTRIES = [
    { code: 'tw', label: '🇹🇼 Taiwan' },
    { code: 'jp', label: '🇯🇵 Japan' },
    { code: 'kr', label: '🇰🇷 South Korea' },
    { code: 'hk', label: '🇭🇰 Hong Kong' }
  ];

  function fetchSummaryTable() {
    var tbody = document.getElementById('summary-table-body');
    var caption = document.getElementById('summary-table-date');
    if (!tbody) return;
    Promise.all(COUNTRIES.map(function (c) {
      return fetch('https://anoni.net/api/vega/tor/relays/running?country=' + c.code)
        .then(function (r) { return r.json(); })
        .then(function (data) { return { country: c, data: data }; });
    })).then(function (results) {
      var totalRunning = 0, totalStopped = 0;
      var rows = results.map(function (result) {
        var data = result.data;
        var c = result.country;
        if (!data.length) return '<tr><td>' + c.label + '</td><td style="text-align:right;">—</td><td style="text-align:right;">—</td></tr>';
        var latestDay = data.reduce(function (m, d) { return d.created_at > m ? d.created_at : m; }, '').slice(0, 10);
        var latest = data.filter(function (d) { return d.created_at.slice(0, 10) === latestDay; });
        var running = (latest.find(function (d) { return d.running === true; }) || {}).count || 0;
        var stopped = (latest.find(function (d) { return d.running === false; }) || {}).count || 0;
        totalRunning += running; totalStopped += stopped;
        return '<tr><td>' + c.label + '</td><td style="text-align:right;">' + running + '</td><td style="text-align:right;">' + stopped + '</td></tr>';
      });
      rows.push('<tr style="font-weight:600;border-top:2px solid var(--md-default-fg-color--light);"><td>Total</td><td style="text-align:right;">' + totalRunning + '</td><td style="text-align:right;">' + totalStopped + '</td></tr>');
      tbody.innerHTML = rows.join('');
      if (caption && results[0].data.length) {
        var latestDay = results[0].data.reduce(function (m, d) { return d.created_at > m ? d.created_at : m; }, '').slice(0, 10);
        caption.textContent = 'Data date: ' + latestDay;
      }
    }).catch(function () {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--md-default-fg-color--light);">Failed to load</td></tr>';
    });
  }

  fetchSummaryTable();

  var sel = document.getElementById('country-selector');
  if (!sel) return;
  sel.addEventListener('change', function () {
    var country = this.value;
    var snapshot = charts.slice();
    charts.length = 0;
    snapshot.forEach(function (c) {
      var newSpec = JSON.parse(
        JSON.stringify(c.spec).replace(/country=[a-z]{2}/g, 'country=' + country)
      );
      window.vegaEmbed(c.el, newSpec, c.opts);
    });
    fetchAsnTable(country);
  });
});
</script>

This page continuously tracks the operation status of Tor relay nodes across regions. Data is collected hourly from the Tor network and aggregated by day, covering health, diversity, and version distribution.

## Health Status

Whether relay nodes are providing service normally and the overall bandwidth contribution.

<div class="grid cards" markdown>

- Number of Active and Inactive Relays[^1]
```vegalite
  {
    "description": "Tor Relays Running (count), Taiwan",
    "data": {"url" : "https://anoni.net/api/vega/tor/relays/running?country=tw"},
    "mark": {
      "type": "bar",
      "tooltip": true
    },
    "encoding": {
      "x": {
        "field": "created_at",
        "type": "temporal",
        "timeUnit": "yearmonthdate",
        "axis": {"format": "%m/%d"},
        "title": "Date"
      },
      "y": {"field": "count", "type": "quantitative", "title": "Count"},
      "color": {
        "field": "running",
        "title": "Status",
        "scale": {
          "domain": [false, true],
          "range": ["#ff6384", "#36a2eb"]
        },
        "legend": {
          "labelExpr": "datum.label == 'true' ? 'Active' : 'Inactive'"
        }
      }
    }
  }
```

- Total Daily Bandwidth[^2]
```vegalite
{
  "description": "Tor Relays Running (observed_bandwidth), Taiwan",
  "data": {"url" : "https://anoni.net/api/vega/tor/relays/running?country=tw"},
  "transform": [
    {"filter": "datum.running == true"},
    {"calculate": "datum.observed_bandwidth/1000000", "as": "observed_bandwidth"}
  ],
  "mark": {
    "type": "area",
    "tooltip": true,
    "interpolate": "monotone",
    "point": true,
    "line": true
  },
  "encoding": {
    "x": {
      "field": "created_at",
      "type": "temporal",
      "timeUnit": "yearmonthdate",
      "axis": {"format": "%m/%d"},
      "title": "Date"
    },
    "y": {"field": "observed_bandwidth", "type": "quantitative", "title": "Bandwidth (MB/s)"}
  }
}
```

</div>

## Diversity Metrics

The distribution of Autonomous Systems (ASN) and different node roles, reflecting the decentralization health of the network.

<div class="grid cards" markdown>

- Daily Unique ASN Count[^4]
```vegalite
  {
    "description": "Tor Relays ASN unique count, Taiwan",
    "data": {"url" : "https://anoni.net/api/vega/tor/relays/asn?country=tw"},
    "transform": [
      {
        "aggregate": [{"op": "count", "as": "asn_unique_count"}],
        "groupby": ["created_at"]
      }
    ],
    "mark": {
      "type": "line",
      "tooltip": true,
      "point": true,
      "interpolate": "monotone"
    },
    "encoding": {
      "x": {
        "field": "created_at",
        "type": "temporal",
        "timeUnit": "yearmonthdate",
        "axis": {"format": "%m/%d"},
        "title": "Date"
      },
      "y": {"field": "asn_unique_count", "type": "quantitative", "title": "Unique ASN Count"}
    }
  }
```

- Relay Node Type Count[^5]
```vegalite
  {
    "description": "Tor Relays Node Type (count), Taiwan",
    "data": {"url" : "https://anoni.net/api/vega/tor/relays/node_type?country=tw"},
    "mark": {
      "type": "bar",
      "tooltip": true
    },
    "encoding": {
      "x": {
        "field": "created_at",
        "type": "temporal",
        "timeUnit": "yearmonthdate",
        "axis": {"format": "%m/%d"},
        "title": "Date"
      },
      "y": {"field": "count", "type": "quantitative", "title": "Count"},
      "color": { "field": "node", "title": "Node Type" }
    }
  }
```

</div>

<div style="margin-top:1.25rem;">
<p style="font-size:.85rem;color:var(--md-default-fg-color--light);margin-bottom:.5rem;" id="asn-table-date">Data date: —</p>
<table>
  <thead>
    <tr>
      <th>ASN</th>
      <th>Name</th>
      <th style="text-align:right;">Relay Count</th>
    </tr>
  </thead>
  <tbody id="asn-table-body">
    <tr><td colspan="3" style="text-align:center;padding:.6rem;color:var(--md-default-fg-color--light);">Loading...</td></tr>
  </tbody>
</table>
</div>

## Versions & Flags

The update status of Tor software versions and the distribution of capability flags across nodes.

<div class="grid cards" markdown>

- Version Count[^3]
```vegalite
  {
    "description": "Tor Relays Version (count), Taiwan",
    "data": {"url" : "https://anoni.net/api/vega/tor/relays/version?country=tw"},
    "mark": {
      "type": "line",
      "tooltip": true,
      "point": true,
      "interpolate": "monotone"
    },
    "encoding": {
      "x": {
        "field": "created_at",
        "type": "temporal",
        "timeUnit": "yearmonthdate",
        "axis": {"format": "%m/%d"},
        "title": "Date"
      },
      "y": {"field": "count", "type": "quantitative", "title": "Count"},
      "color": { "field": "version", "title": "Version" }
    }
  }
```

- Flag Type Count[^6]
```vegalite
  {
    "description": "Tor Relays Flags (count), Taiwan",
    "data": {"url" : "https://anoni.net/api/vega/tor/relays/flags?country=tw"},
    "mark": {
      "type": "line",
      "tooltip": true,
      "point": false,
      "interpolate": "monotone"
    },
    "encoding": {
      "x": {
        "field": "created_at",
        "type": "temporal",
        "timeUnit": "yearmonthdate",
        "axis": {"format": "%m/%d"},
        "title": "Date"
      },
      "y": {"field": "count", "type": "quantitative", "title": "Count"},
      "color": { "field": "flag", "title": "Flags" }
    }
  }
```

</div>

## Regional Comparison

A snapshot of relay node counts for the latest day across all regions, for quick comparison of contribution scale.

<p id="summary-table-date" style="font-size:.85rem;color:var(--md-default-fg-color--light);margin-bottom:.5rem;">Data date: —</p>
<table>
  <thead>
    <tr>
      <th>Region</th>
      <th style="text-align:right;">Active</th>
      <th style="text-align:right;">Inactive</th>
    </tr>
  </thead>
  <tbody id="summary-table-body">
    <tr><td colspan="3" style="text-align:center;padding:.6rem;color:var(--md-default-fg-color--light);">Loading...</td></tr>
  </tbody>
</table>

!!! example "In ongoing development"

    - :tools: The **observation data** and **presentation format** on this page are still being adjusted. Data retrieval is provided through the [Data Extraction API Service](https://anoni.net/api/readme){target="_blank"}, which is also under continuous development.

[^1]: Number of Active and Inactive Relays: Daily count of Tor Relay operational status in the selected region, counting each unique Tor Relay once per hour.
[^2]: Total Daily Bandwidth: Daily total bandwidth (MB/s) of **active** Tor Relays in the selected region, counting each unique Tor Relay once per hour.
[^3]: Version Count: Daily count of Tor software versions used by Tor Relays in the selected region, counting each unique Tor Relay once per hour.
[^4]: Daily Unique ASN Count: Daily count of unique Autonomous System Numbers (ASN) for Tor Relays in the selected region. A higher value indicates nodes are distributed across more network providers, reflecting better decentralization.
[^5]: Relay Node Type Count: Daily count of Tor Relay types in the selected region, counting each unique Tor Relay once per hour.
[^6]: Flag Type Count: Daily count of Tor Relay flag types in the selected region. Flags are not mutually exclusive — a single node may carry multiple flags simultaneously.
