---
title: Tor リレー観測
description: 日本、台湾、韓国、香港の Tor リレーの稼働状況を Pulse API から取得して表示します。
icon: material/chart-bar
---

# :material-chart-bar: Tor リレー観測

各地域で Tor リレーがいくつ動いているか、どの自律システム（AS）の上に乗っているか、帯域をどれだけ供給しているか、そしてリレーのバージョンと役割の構成がどう変わってきたかを見るページです。台数はその地域の供給規模の目安に、ASN の分散は特定の事業者への依存度の目安になります。実際にどれだけ帯域を出しているかは、下の 2 番目のグラフで見られます。

**日本語版の既定表示は日本**です。下のセレクタで台湾、韓国、香港に切り替えられます。グラフと表は連動して更新されます。

!!! info "データの出所と限界"

    数値は私たちが運用している監視システム Pulse が、Tor Project の [Onionoo API](https://onionoo.torproject.org/){target="_blank"}（`/details` エンドポイント）から 1 時間ごとに取得し、日単位で重複を除いて集計したものです。**独立した測定ではなく、Tor Project が公開しているリレー情報の再集計**です。

    Tor Project 公式の [Tor Metrics](https://metrics.torproject.org/){target="_blank"} とは集計の単位と期間の取り方が違うため、数値をそのまま突き合わせることはできません。API が返すのは直近およそ 23 日分です。

    引用される場合は、下のスナップショット（取得日つき）をお使いください。**エンドポイントのスキーマは調整中で変わる可能性があります。**安定した参照が必要な場合は <whisper@anoni.net> までご連絡ください。取得時点のスナップショットをお渡しします。

<div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1.25rem;">
  <span style="font-weight:500;font-size:.95rem;">地域：</span>
  <select id="country-selector" style="padding:.35rem .7rem;border-radius:4px;border:1px solid var(--md-default-fg-color--light);background:var(--md-default-bg-color);color:var(--md-default-fg-color);font-size:.9rem;cursor:pointer;">
    <option value="jp" selected>🇯🇵 日本</option>
    <option value="tw">🇹🇼 台湾</option>
    <option value="kr">🇰🇷 韓国</option>
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
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:.6rem;color:var(--md-default-fg-color--light);">読み込み中...</td></tr>';
    fetch('https://anoni.net/api/vega/tor/relays/asn?country=' + country)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.length) {
          tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:.6rem;">データなし</td></tr>';
          return;
        }
        var latestDate = data.reduce(function (m, d) { return d.created_at > m ? d.created_at : m; }, '');
        var latestDay = latestDate.slice(0, 10);
        if (caption) caption.textContent = 'データ日付： ' + latestDay;
        var rows = data
          .filter(function (d) { return d.created_at.slice(0, 10) === latestDay; })
          .sort(function (a, b) { return b.count - a.count; })
          .map(function (d) {
            var asnNum = d.asn.replace(/^AS/i, '');
            var asnLink = '<a href="https://radar.cloudflare.com/as' + asnNum + '" target="_blank" rel="noopener">' + d.asn + '</a>';
            return '<tr><td>' + asnLink + '</td><td>' + (d.as_name || '') + '</td><td style="text-align:right;">' + d.count + '</td></tr>';
          }).join('');
        tbody.innerHTML = rows || '<tr><td colspan="3" style="text-align:center;">データなし</td></tr>';
      })
      .catch(function () {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--md-default-fg-color--light);">読み込みに失敗しました</td></tr>';
      });
  }

  // 日本語版の既定は日本。
  fetchAsnTable('jp');

  var COUNTRIES = [
    { code: 'jp', label: '🇯🇵 日本' },
    { code: 'tw', label: '🇹🇼 台湾' },
    { code: 'kr', label: '🇰🇷 韓国' },
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
      rows.push('<tr style="font-weight:600;border-top:2px solid var(--md-default-fg-color--light);"><td>合計</td><td style="text-align:right;">' + totalRunning + '</td><td style="text-align:right;">' + totalStopped + '</td></tr>');
      tbody.innerHTML = rows.join('');
      if (caption && results[0].data.length) {
        var latestDay = results[0].data.reduce(function (m, d) { return d.created_at > m ? d.created_at : m; }, '').slice(0, 10);
        caption.textContent = 'データ日付： ' + latestDay;
      }
    }).catch(function () {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--md-default-fg-color--light);">読み込みに失敗しました</td></tr>';
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

## 取得時点のスナップショット

グラフと表は JavaScript で取得します。無効にしている場合は表示されないので、直近の数値をここに置いておきます。引用にはこちらをお使いください。

| 地域 | 稼働中 | 停止中 | 合計帯域 | 取得日 |
|---|---:|---:|---:|---|
| 🇯🇵 **日本** | **66** | 16 | **464.5 MB/s** | 2026-07-03 |
| 🇰🇷 韓国 | 22 | 5 | 60.5 MB/s | 2026-07-06 |
| 🇭🇰 香港 | 21 | 5 | 92.1 MB/s | 2026-07-06 |
| 🇹🇼 台湾 | 13 | 3 | 72.5 MB/s | 2026-07-06 |

日本のリレーは **31 の自律システム（AS）**に分散しています（2026-07-06 時点）。台数の多い順に AS63806 Human-life Information Platforms Institute が 8 台、AS20473 The Constant Company が 7 台、AS63949 Akamai Technologies が 6 台、AS2527 Sony Network Communications と AS36007 Kamatera と AS4713 NTT Communications がそれぞれ 4 台です。

取得日が地域によって 3 日ずれているのは、収集側の都合によるものです。最新の値はグラフを参照してください。

## 稼働状況

その地域のリレーが動いているかどうかと、合計でどれだけの帯域を供給しているか。日本は台数でも帯域でも監視 4 地域のうち最大で、帯域は 2 位の香港のおよそ 5 倍にあたります。

<div class="grid cards" markdown>

- 稼働中と停止中のリレー数[^1]
```vegalite
  {
    "description": "Tor Relays Running (count), Japan",
    "data": {"url" : "https://anoni.net/api/vega/tor/relays/running?country=jp"},
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
        "title": "日付"
      },
      "y": {"field": "count", "type": "quantitative", "title": "台数"},
      "color": {
        "field": "running",
        "title": "状態",
        "scale": {
          "domain": [false, true],
          "range": ["#ff6384", "#36a2eb"]
        },
        "legend": {
          "labelExpr": "datum.label == 'true' ? '稼働中' : '停止中'"
        }
      }
    }
  }
```

- 日ごとの合計供給帯域[^2]
```vegalite
{
  "description": "Tor Relays Running (observed_bandwidth), Japan",
  "data": {"url" : "https://anoni.net/api/vega/tor/relays/running?country=jp"},
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
      "title": "日付"
    },
    "y": {"field": "observed_bandwidth", "type": "quantitative", "title": "帯域 (MB/s)"}
  }
}
```

</div>

## 分散度

リレーが自律システム（AS）にどれだけ散らばっているか、そしてノードの役割がどう分布しているか。散らばっているほど、その地域の寄与は特定の事業者に依存しにくくなります。日本は 31 の AS に分かれており、VPS 事業者と並んで Sony Network Communications や NTT Communications といった国内 ISP の回線上にもリレーが立っています。

<div class="grid cards" markdown>

- 日ごとのユニーク ASN 数[^4]
```vegalite
  {
    "description": "Tor Relays ASN unique count, Japan",
    "data": {"url" : "https://anoni.net/api/vega/tor/relays/asn?country=jp"},
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
        "title": "日付"
      },
      "y": {"field": "asn_unique_count", "type": "quantitative", "title": "ユニーク ASN 数"}
    }
  }
```

- ノード種別の分布[^5]
```vegalite
  {
    "description": "Tor Relays Node Type (count), Japan",
    "data": {"url" : "https://anoni.net/api/vega/tor/relays/node_type?country=jp"},
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
        "title": "日付"
      },
      "y": {"field": "count", "type": "quantitative", "title": "台数"},
      "color": { "field": "node", "title": "ノード種別" }
    }
  }
```

</div>

<div style="margin-top:1.25rem;">
<p style="font-size:.85rem;color:var(--md-default-fg-color--light);margin-bottom:.5rem;" id="asn-table-date">データ日付： —</p>
<table>
  <thead>
    <tr>
      <th>ASN</th>
      <th>名称</th>
      <th style="text-align:right;">リレー数</th>
    </tr>
  </thead>
  <tbody id="asn-table-body">
    <tr><td colspan="3" style="text-align:center;padding:.6rem;color:var(--md-default-fg-color--light);">読み込み中...</td></tr>
  </tbody>
</table>
</div>

## バージョンとフラグ

リレーが Tor ソフトウェアの更新をどれだけ速く取り込んでいるか、そしてどの役割フラグを持っているか。古いバージョンが長く残る地域は、既知の脆弱性を抱えたまま中継している台数が多いことになります。

<div class="grid cards" markdown>

- Tor バージョンの普及状況[^3]
```vegalite
  {
    "description": "Tor Relays Version (count), Japan",
    "data": {"url" : "https://anoni.net/api/vega/tor/relays/version?country=jp"},
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
        "title": "日付"
      },
      "y": {"field": "count", "type": "quantitative", "title": "台数"},
      "color": { "field": "version", "title": "バージョン" }
    }
  }
```

- リレーフラグの分布[^6]
```vegalite
  {
    "description": "Tor Relays Flags (count), Japan",
    "data": {"url" : "https://anoni.net/api/vega/tor/relays/flags?country=jp"},
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
        "title": "日付"
      },
      "y": {"field": "count", "type": "quantitative", "title": "台数"},
      "color": { "field": "flag", "title": "フラグ" }
    }
  }
```

</div>

## 4 地域の比較

監視している 4 地域について、最新日の稼働中と停止中の台数を並べたものです。

<p id="summary-table-date" style="font-size:.85rem;color:var(--md-default-fg-color--light);margin-bottom:.5rem;">データ日付： —</p>
<table>
  <thead>
    <tr>
      <th>地域</th>
      <th style="text-align:right;">稼働中</th>
      <th style="text-align:right;">停止中</th>
    </tr>
  </thead>
  <tbody id="summary-table-body">
    <tr><td colspan="3" style="text-align:center;padding:.6rem;color:var(--md-default-fg-color--light);">読み込み中...</td></tr>
  </tbody>
</table>

!!! example "手を動かしたい場合"

    - :material-server-network: **リレーを運用する**：[Tor Project のリレー運用ガイド](https://community.torproject.org/relay/){target="_blank"}（英語）が出発点です。日本は監視 4 地域のなかで最大の供給元ですが、66 台という規模は世界全体で見れば小さく、31 の AS のうち上位数社に偏りがあります。台数より**分散**を増やす余地があります。
    - :material-alert-outline: **出口ノードは別の判断が要ります**：出口ノードは通信の最終地点として外部に見えるため、運用者への問い合わせや苦情が届きます。契約している事業者の利用規約と、照会が来たときに手元に何が残る設計かを先に確認してください。まず中間リレーやブリッジから始めるほうが無理がありません。役割ごとの違いは Tor Project のガイドにあります。日本国内の法的な取り扱いについて、私たちは助言できる立場にありません。
    - :material-chart-bar: **元データ**：このページのグラフは [Pulse のバックエンド API](https://anoni.net/api/readme){target="_blank"} が配信しています。スキーマは調整中のため、エンドポイントは変わる可能性があります。

## 関連ページ

<div class="grid cards" markdown>

- [:material-map-outline: 地域観測](./index.md)
- [:material-lightbulb-outline: 基本概念](../basics/index.md)
- [:simple-torbrowser: Tor Project リレー運用ガイド](https://community.torproject.org/relay/){target="_blank"}
- [:material-api: Tor リレーを自然言語で問い合わせる](https://anoni.net/docs/en/community/onionoo-mcp/){target="_blank"}（英語）

</div>

[^1]: 稼働中と停止中の台数：その地域のリレーを日ごとに数え、報告された稼働状態で分けたものです。1 時間ごとのサンプルは日内で重複を除いています。
[^2]: 日ごとの合計帯域：その地域の**稼働中**リレーの `observed_bandwidth` を日ごとに合計し、MB/s で表したものです。1 時間ごとのサンプルは日内で重複を除いています。
[^3]: Tor バージョン：その地域のリレーが報告した Tor バージョンの種類ごとの台数を日単位で数えたものです。1 時間ごとのサンプルは重複を除いています。
[^4]: 日ごとのユニーク ASN 数：その地域で Tor リレーをホストしている自律システムの異なり数です。数が多いほど事業者への分散が進んでおり、一般に分散化の健全性が高いことを示します。
[^5]: ノード種別の分布：リレーの役割（guard、middle、exit など）ごとの台数を日単位で数えたものです。1 時間ごとのサンプルは重複を除いています。
[^6]: フラグの分布：リレーが持つ能力フラグごとの台数を日単位で数えたものです。フラグは排他的ではなく、1 台のリレーが複数を持つことがあります。

---

原文：[Tor 中繼觀測](https://anoni.net/docs/taiwan/tor-relay-watcher/){target="_blank"}（繁体字中国語）

この日本語訳は初稿で、日本語母語話者の校正を経ていません。気になる箇所は [Issue](https://github.com/anoni-net/docs/issues){target="_blank"} か <whisper@anoni.net> へ。方針は[訳語の方針](../translation-glossary.md)にあります。
