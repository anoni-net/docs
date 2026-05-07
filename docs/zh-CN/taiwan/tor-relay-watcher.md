---
title: Tor Relays 观测点
description: 各项观察指标了解目前各地区 Tor Relays 的运作状况
icon: material/chart-bar

---

<div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1.25rem;">
  <span style="font-weight:500;font-size:.95rem;">观测地区：</span>
  <select id="country-selector" style="padding:.35rem .7rem;border-radius:4px;border:1px solid var(--md-default-fg-color--light);background:var(--md-default-bg-color);color:var(--md-default-fg-color);font-size:.9rem;cursor:pointer;">
    <option value="tw" selected>🇹🇼 台湾</option>
    <option value="jp">🇯🇵 日本</option>
    <option value="kr">🇰🇷 韩国</option>
    <option value="hk">🇭🇰 香港</option>
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
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:.6rem;color:var(--md-default-fg-color--light);">加载中...</td></tr>';
    fetch('https://anoni.net/api/vega/tor/relays/asn?country=' + country)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.length) {
          tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:.6rem;">无数据</td></tr>';
          return;
        }
        var latestDate = data.reduce(function (m, d) { return d.created_at > m ? d.created_at : m; }, '');
        var latestDay = latestDate.slice(0, 10);
        if (caption) caption.textContent = '数据日期：' + latestDay;
        var rows = data
          .filter(function (d) { return d.created_at.slice(0, 10) === latestDay; })
          .sort(function (a, b) { return b.count - a.count; })
          .map(function (d) {
            var asnNum = d.asn.replace(/^AS/i, '');
            var asnLink = '<a href="https://radar.cloudflare.com/as' + asnNum + '" target="_blank" rel="noopener">' + d.asn + '</a>';
            return '<tr><td>' + asnLink + '</td><td>' + (d.as_name || '') + '</td><td style="text-align:right;">' + d.count + '</td></tr>';
          }).join('');
        tbody.innerHTML = rows || '<tr><td colspan="3" style="text-align:center;">无数据</td></tr>';
      })
      .catch(function () {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--md-default-fg-color--light);">加载失败</td></tr>';
      });
  }

  fetchAsnTable('tw');

  var COUNTRIES = [
    { code: 'tw', label: '🇹🇼 台湾' },
    { code: 'jp', label: '🇯🇵 日本' },
    { code: 'kr', label: '🇰🇷 韩国' },
    { code: 'hk', label: '🇭🇰 香港' }
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
      rows.push('<tr style="font-weight:600;border-top:2px solid var(--md-default-fg-color--light);"><td>合计</td><td style="text-align:right;">' + totalRunning + '</td><td style="text-align:right;">' + totalStopped + '</td></tr>');
      tbody.innerHTML = rows.join('');
      if (caption && results[0].data.length) {
        var latestDay = results[0].data.reduce(function (m, d) { return d.created_at > m ? d.created_at : m; }, '').slice(0, 10);
        caption.textContent = '数据日期：' + latestDay;
      }
    }).catch(function () {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--md-default-fg-color--light);">加载失败</td></tr>';
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

此页面持续追踪各地区 Tor 中继节点的运作状况，数据每小时从 Tor 网络收集一次、以天为单位汇整呈现，涵盖健康度、多样性与版本分布等方面。

## 健康状态

中继节点是否正常提供服务，以及整体贡献的带宽容量。

<div class="grid cards" markdown>

- 持续与停止运作的数量[^1]
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
        "title": "日期"
      },
      "y": {"field": "count", "type": "quantitative", "title": "数量"},
      "color": {
        "field": "running",
        "title": "运作状态",
        "scale": {
          "domain": [false, true],
          "range": ["#ff6384", "#36a2eb"]
        },
        "legend": {
          "labelExpr": "datum.label == 'true' ? '运行中' : '已停止'"
        }
      }
    }
  }
```

- 每日提供的总带宽[^2]
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
      "title": "日期"
    },
    "y": {"field": "observed_bandwidth", "type": "quantitative", "title": "带宽（MB/s）"}
  }
}
```

</div>

## 多样性指标

自治网络（ASN）的分散程度，以及不同节点角色的分布状况，反映网络的去中心化健康度。

<div class="grid cards" markdown>

- ASN 每日唯一数量[^4]
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
        "title": "日期"
      },
      "y": {"field": "asn_unique_count", "type": "quantitative", "title": "唯一 ASN 数量"}
    }
  }
```

- 中继点类型数量[^5]
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
        "title": "日期"
      },
      "y": {"field": "count", "type": "quantitative", "title": "数量"},
      "color": { "field": "node", "title": "节点类型" }
    }
  }
```

</div>

<div style="margin-top:1.25rem;">
<p style="font-size:.85rem;color:var(--md-default-fg-color--light);margin-bottom:.5rem;" id="asn-table-date">数据日期：—</p>
<table>
  <thead>
    <tr>
      <th>ASN</th>
      <th>名称</th>
      <th style="text-align:right;">中继节点数</th>
    </tr>
  </thead>
  <tbody id="asn-table-body">
    <tr><td colspan="3" style="text-align:center;padding:.6rem;color:var(--md-default-fg-color--light);">加载中...</td></tr>
  </tbody>
</table>
</div>

## 版本与标签

Tor 软件版本的更新状况，以及各节点所具备的能力标签分布。

<div class="grid cards" markdown>

- 版本数量[^3]
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
        "title": "日期"
      },
      "y": {"field": "count", "type": "quantitative", "title": "数量"},
      "color": { "field": "version", "title": "版本" }
    }
  }
```

- 标签类型数量[^6]
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
        "title": "日期"
      },
      "y": {"field": "count", "type": "quantitative", "title": "数量"},
      "color": { "field": "flag", "title": "标签" }
    }
  }
```

</div>

## 各地区比较

各地区最新一日的中继节点运作数量一览，方便对照不同地区的贡献规模。

<p id="summary-table-date" style="font-size:.85rem;color:var(--md-default-fg-color--light);margin-bottom:.5rem;">数据日期：—</p>
<table>
  <thead>
    <tr>
      <th>地区</th>
      <th style="text-align:right;">运行中</th>
      <th style="text-align:right;">已停止</th>
    </tr>
  </thead>
  <tbody id="summary-table-body">
    <tr><td colspan="3" style="text-align:center;padding:.6rem;color:var(--md-default-fg-color--light);">加载中...</td></tr>
  </tbody>
</table>

!!! example "持续开发中"

    - :tools: 目前此页面的**观察数据**与**呈现方式**都还在持续调整中，数据读取的部分是通过[获取数据 API 服务](https://anoni.net/api/readme){target="_blank"}提供，而 API 数据服务也还在持续开发中。

[^1]: 持续与停止运作的数量：计算每日该地区的 Tor Relay 运作状态数量，计算区间每小时不重复的 Tor Relay。
[^2]: 每日提供的总带宽：计算每日该地区**运行中**的 Tor Relay 总带宽（MB/s），计算区间每小时不重复的 Tor Relay。
[^3]: 版本数量：计算每日该地区 Tor Relay 所使用的 Tor 版本号数量，计算区间每小时不重复的 Tor Relay。
[^4]: ASN 每日唯一数量：计算每日该地区的 Tor Relay 自治网络编号（ASN）的唯一数量，数值越高代表节点分散于更多不同的网络供应商，去中心化程度越佳。
[^5]: 中继点类型数量：计算每日该地区的 Tor Relay 类型数量，计算区间每小时不重复的 Tor Relay。
[^6]: 标签类型数量：计算每日该地区的 Tor Relay 标签类型数量；各标签不互斥，同一节点可同时具备多个标签。
