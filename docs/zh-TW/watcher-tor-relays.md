---
title: Tor Relays 觀測點
description: 各項觀察指標瞭解目前臺灣 Tor Relays 運作狀況
icon: material/chart-bar

---

<div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1.25rem;">
  <span style="font-weight:500;font-size:.95rem;">觀測地區：</span>
  <select id="country-selector" style="padding:.35rem .7rem;border-radius:4px;border:1px solid var(--md-default-fg-color--light);background:var(--md-default-bg-color);color:var(--md-default-fg-color);font-size:.9rem;cursor:pointer;">
    <option value="tw" selected>🇹🇼 臺灣</option>
    <option value="jp">🇯🇵 日本</option>
    <option value="kr">🇰🇷 南韓</option>
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
    tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;padding:.6rem;color:var(--md-default-fg-color--light);">載入中...</td></tr>';
    fetch('https://anoni.net/api/vega/tor/relays/asn?country=' + country)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.length) {
          tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;padding:.6rem;">無資料</td></tr>';
          return;
        }
        var latestDate = data.reduce(function (m, d) { return d.created_at > m ? d.created_at : m; }, '');
        var latestDay = latestDate.slice(0, 10);
        if (caption) caption.textContent = '資料日期：' + latestDay;
        var rows = data
          .filter(function (d) { return d.created_at.slice(0, 10) === latestDay; })
          .sort(function (a, b) { return b.count - a.count; })
          .map(function (d) {
            var asnNum = d.asn.replace(/^AS/i, '');
            var asnLink = '<a href="https://radar.cloudflare.com/as' + asnNum + '" target="_blank" rel="noopener">' + d.asn + '</a>';
            return '<tr><td>' + asnLink + '</td><td>' + (d.as_name || '') + '</td><td style="text-align:right;">' + d.count + '</td></tr>';
          }).join('');
        tbody.innerHTML = rows || '<tr><td colspan="2" style="text-align:center;">無資料</td></tr>';
      })
      .catch(function () {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:var(--md-default-fg-color--light);">載入失敗</td></tr>';
      });
  }

  fetchAsnTable('tw');

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

此頁面持續追蹤各地區 Tor 中繼節點的運作狀況，資料每小時從 Tor 網路收集一次、以天為單位彙整呈現，涵蓋健康度、多樣性與版本分佈等面向。

## 健康狀態

中繼節點是否正常提供服務，以及整體貢獻的頻寬容量。

<div class="grid cards" markdown>

- 持續與停止運作的數量[^1]
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
      "y": {"field": "count", "type": "quantitative", "title": "數量"},
      "color": {
        "field": "running",
        "title": "運作狀態",
        "scale": {
          "domain": [false, true],
          "range": ["#ff6384", "#36a2eb"]
        },
        "legend": {
          "labelExpr": "datum.label == 'true' ? '運作中' : '已停止'"
        }
      }
    }
  }
```

- 每日提供的總頻寬[^2]
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
    "y": {"field": "observed_bandwidth", "type": "quantitative", "title": "頻寬（MB/s）"}
  }
}
```

</div>

## 多樣性指標

自治網路（ASN）的分散程度，以及不同節點角色的分佈狀況，反映網路的去中心化健康度。

<div class="grid cards" markdown>

- ASN 每日唯一數量[^4]
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
      "y": {"field": "asn_unique_count", "type": "quantitative", "title": "唯一 ASN 數量"}
    }
  }
```

- 中繼點類型數量[^5]
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
      "y": {"field": "count", "type": "quantitative", "title": "數量"},
      "color": { "field": "node", "title": "節點類型" }
    }
  }
```

</div>

<div style="margin-top:1.25rem;">
<p style="font-size:.85rem;color:var(--md-default-fg-color--light);margin-bottom:.5rem;" id="asn-table-date">資料日期：—</p>
<table>
  <thead>
    <tr>
      <th>ASN</th>
      <th>名稱</th>
      <th style="text-align:right;">中繼節點數</th>
    </tr>
  </thead>
  <tbody id="asn-table-body">
    <tr><td colspan="2" style="text-align:center;padding:.6rem;color:var(--md-default-fg-color--light);">載入中...</td></tr>
  </tbody>
</table>
</div>

## 版本與標籤

Tor 軟體版本的更新狀況，以及各節點所具備的能力標籤分佈。

<div class="grid cards" markdown>

- 版本數量[^3]
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
      "y": {"field": "count", "type": "quantitative", "title": "數量"},
      "color": { "field": "version", "title": "版本" }
    }
  }
```

- 標籤類型數量[^6]
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
      "y": {"field": "count", "type": "quantitative", "title": "數量"},
      "color": { "field": "flag", "title": "標籤" }
    }
  }
```

</div>

!!! example "持續開發中"

    - :tools: 目前此頁面的**觀察資料**與**呈現方式**都還在持續調整中，資料讀取的部分是透過[擷取資料 API 服務](https://anoni.net/api/readme){target="_blank"}提供，而 API 資料服務也還在持續開發中。

[^1]: 持續與停止運作的數量：計算每日在臺灣的 Tor Relay 運作狀態數量，計算區間每小時不重複的 Tor Relay。
[^2]: 每日提供的總頻寬：計算每日在臺灣**運作中**的 Tor Relay 總頻寬（MB/s），計算區間每小時不重複的 Tor Relay。
[^3]: 版本數量：計算每日在臺灣 Tor Relay 所使用的 Tor 版本號數量，計算區間每小時不重複的 Tor Relay。
[^4]: ASN 每日唯一數量：計算每日在臺灣的 Tor Relay 自治網路編號（ASN）的唯一數量，數值越高代表節點分散於更多不同的網路供應商，去中心化程度越佳。
[^5]: 中繼點類型數量：計算每日在臺灣的 Tor Relay 類型數量，計算區間每小時不重複的 Tor Relay。
[^6]: 標籤類型數量：計算每日在臺灣的 Tor Relay 標籤類型數量；各標籤不互斥，同一節點可同時具備多個標籤。
