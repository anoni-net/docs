---
title: Tor relay watcher
description: Live observation of Tor relay activity across Taiwan, Japan, South Korea, and Hong Kong, drawn from the anoni.net Pulse API.
icon: material/chart-bar
---

# :material-chart-bar: Tor relay watcher

This page is the relay-side companion to our connection-layer work on [networked freedom](../basics/internet-freedom.md). It looks at how many Tor relays are operating in each watched region, which autonomous systems they sit on, how much bandwidth they contribute, and how the relay version and capability mix is changing. The number and dispersion of relays in a region is a direct indicator of that region's contribution to the global Tor network.

The default view is **Taiwan** — the jurisdiction we have first-hand standing in. Use the selector below to switch to Japan, South Korea, or Hong Kong, which we monitor as nearby regional reference points. Charts and tables update together.

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

The data is collected hourly from the Tor network and aggregated by day. The page covers three angles: relay health, network diversity, and version / flag distribution.

## Health

Whether relays in the region are running, and how much bandwidth they contribute in aggregate.

<div class="grid cards" markdown>

- Running and stopped relay counts[^1]
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
        "title": "State",
        "scale": {
          "domain": [false, true],
          "range": ["#ff6384", "#36a2eb"]
        },
        "legend": {
          "labelExpr": "datum.label == 'true' ? 'Running' : 'Stopped'"
        }
      }
    }
  }
```

- Daily total bandwidth contributed[^2]
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

## Diversity

How dispersed relays are across autonomous systems, and how relay node-types are distributed. A more dispersed picture means a more decentralization-resilient regional contribution.

<div class="grid cards" markdown>

- Daily count of unique ASNs[^4]
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
      "y": {"field": "asn_unique_count", "type": "quantitative", "title": "Unique ASNs"}
    }
  }
```

- Node-type distribution[^5]
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
      "color": { "field": "node", "title": "Node type" }
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
      <th style="text-align:right;">Relay count</th>
    </tr>
  </thead>
  <tbody id="asn-table-body">
    <tr><td colspan="3" style="text-align:center;padding:.6rem;color:var(--md-default-fg-color--light);">Loading...</td></tr>
  </tbody>
</table>
</div>

## Version and flags

How fast relays are adopting Tor software updates, and what role flags they carry.

<div class="grid cards" markdown>

- Tor version adoption[^3]
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

- Relay flag distribution[^6]
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
      "color": { "field": "flag", "title": "Flag" }
    }
  }
```

</div>

## Cross-region snapshot

Latest-day running and stopped counts across all four watched regions, side by side.

<p id="summary-table-date" style="font-size:.85rem;color:var(--md-default-fg-color--light);margin-bottom:.5rem;">Data date: —</p>
<table>
  <thead>
    <tr>
      <th>Region</th>
      <th style="text-align:right;">Running</th>
      <th style="text-align:right;">Stopped</th>
    </tr>
  </thead>
  <tbody id="summary-table-body">
    <tr><td colspan="3" style="text-align:center;padding:.6rem;color:var(--md-default-fg-color--light);">Loading...</td></tr>
  </tbody>
</table>

!!! example "Want to take action?"

    - :material-server-network: **Run a relay**: the [Tor Project relay guide](https://community.torproject.org/relay/){target="_blank"} is the canonical English starting point. Our community's campus-relay deployment writeup is currently in zh-TW only ([如何搭建 Tor Relay](https://anoni.net/docs/community/setup-tor-relay/){target="_blank"}); an English version is planned.
    - :material-chart-bar: **Underlying data**: the charts on this page are served by [the Pulse backend API](https://anoni.net/api/readme){target="_blank"}. The schema is still being adjusted, so endpoints may change.

## Related

<div class="grid cards" markdown>

- [:material-map-outline: Regional Observatory](./index.md)
- [:material-chat-question: Why networked freedom matters](../basics/internet-freedom.md)
- [:simple-torbrowser: Tor Project relay guide](https://community.torproject.org/relay/){target="_blank"}
- [:material-school: Tor University Challenge (EFF + Tor Project)](https://toruniversity.eff.org/){target="_blank"}

</div>

[^1]: Running and stopped counts: counts of distinct relays in the region per day, separated by reported running state. Hourly samples are de-duplicated within a day.
[^2]: Daily total bandwidth: sum of `observed_bandwidth` across **running** relays in the region per day, in MB/s. Hourly samples de-duplicated within a day.
[^3]: Tor version: counts of distinct Tor versions reported by relays in the region per day. Hourly samples de-duplicated.
[^4]: Daily unique ASN count: number of distinct autonomous systems hosting Tor relays in the region per day. Higher numbers indicate more dispersion across providers, which generally reflects healthier decentralization.
[^5]: Node-type distribution: counts by relay role (guard, middle, exit, etc.) per day. Hourly samples de-duplicated.
[^6]: Flag distribution: counts of relay capability flags per day. Flags are not mutually exclusive — one relay may carry several.
