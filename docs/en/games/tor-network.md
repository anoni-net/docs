---
title: Tor Relay Globe
description: A globe built from real data. Nearly ten thousand running Tor relays placed inside their own borders, with censorship observations, user estimates, shutdown records, submarine cables and internet usage layered on top, plus county boundaries, cable landing points, substations, power plants and the grid when you zoom in on Taiwan.
icon: material/earth
social:
  cards: false
og:
  enabled: true
  image: https://assets.anoni.net/games/tor-network-en.png
  image_width: 2560
  image_height: 1440
---

# :material-earth: Tor Relay Globe

![The Tor Relay Globe with the sphere turned to Asia, relays drawn as coloured dots inside their borders, and the left panel listing relay counts per country and a hosting provider ranking](https://assets.anoni.net/games/tor-network-globe-en.webp){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

Of the three works, the globe pulls in the most data. It puts public datasets scattered across different organisations onto one sphere, so that "where relays can be run" and "where Tor can be reached" can be read side by side. Zoom in on Taiwan and one more layer appears: the physical infrastructure those connections actually depend on.

<a href="../../games/tor-network/play/index.html?lang=en" class="md-button md-button--primary">:octicons-arrow-right-24: Explore</a>

## What is on the sphere

Each relay is one dot placed inside its own country's border, coloured by its four possible roles (guard, middle, exit, and guard plus exit) and sized by bandwidth. Landmass brightness carries a separate metric, relay count by default.

Drag to rotate, scroll or pinch to zoom and more country labels surface. Adding `#tw` to the URL flies straight to Taiwan on load, and other country codes such as `#jp` work the same way, so a shared link can decide what the recipient sees first.

### Landmass brightness switches between four metrics

![Landmass brightness switched to consensus weight, with country labels now showing percentages, Germany at 29.5% and Sweden at 6.1%](https://assets.anoni.net/games/tor-network-weight-en.webp){style="border-radius: 10px;"}

- **Relay count**: how many relays the country hosts
- **Consensus weight**: the share of traffic the country actually carries in the Tor network, which often diverges noticeably from the raw count
- **Single-provider concentration**: what fraction of a country's relays sit with its largest hosting provider, showing how dependent it is on one operator
- **User estimate**: the estimated number of Tor users, a demand-side figure

The gap between count and weight is worth switching over to see once. The United States hosts the most relays, but under consensus weight Germany moves ahead, which means each German relay carries more traffic.

### Clicking a country label opens its card

![Germany's information card, showing 1,715 relays, 16.9% of the network, 29.5% consensus weight, the role mix, hosting providers and OONI test results](https://assets.anoni.net/games/tor-network-country-en.webp){style="border-radius: 10px;"}

The card carries its role mix, bandwidth share, the proportion running the officially recommended version, its main hosting providers, and how the country appears in the other datasets: user estimates, the OONI anomaly rate, and the pluggable transport breakdown of bridge usage.

## What the globe brings together

### Relay distribution (Onionoo, CC0 1.0)

The main layer comes from an Onionoo relay snapshot, distilled down to country-level aggregates only, with no fingerprints, nicknames, IP addresses or contact details. It currently covers nearly ten thousand running relays across around eighty countries and more than nine hundred hosting providers, with the United States, Germany and the Netherlands together accounting for over sixty percent. These figures come from the most recent snapshot, whose generation time is shown on screen.

Pressing "Live update" makes your browser fetch and recompute the data directly from onionoo.anoni.net instead of reading the snapshot hosted here. That request lets the server see your IP address, so it is off by default and the choice is yours.

### Where connections run into trouble (OONI, CC BY-NC-SA 4.0)

Drawn from OONI's tor test results, this is the share of tests per country over the past 30 days that did not complete as expected, which OONI calls an anomaly. Causes include blocking, unstable networks and ISP faults, and the rate alone cannot separate them. The globe therefore marks only the few countries above an `85%` anomaly rate with a sufficient sample, and leaves mid-range values uncoloured entirely. The threshold sits that high because countries with no censorship concerns, such as Switzerland and Canada, routinely land around twenty percent, and colouring the middle of the range would amount to accusing them on the strength of noise. Marked countries are drawn with a red gradient fading inward from the border, so a neighbouring country that is not marked cannot be misread as equally affected.

### Users and bridges (Tor Metrics, CC0 1.0)

Two figures. One is the estimated number of Tor users per country, the other is bridge users broken down by pluggable transport into obfs4, snowflake, webtunnel and others, covering more than two hundred countries. Reading them together often reveals a meaningful gap: where direct connections are blocked, the bridge numbers run noticeably high.

### Shutdown records (Access Now #KeepItOn, CC BY 4.0)

Internet shutdowns from `2009` to `2025`, compiled and verified case by case, covering over fifty countries. This dataset differs in kind from OONI: every entry has a verified cause, so it can state plainly that a deliberate shutdown occurred. Outages caused by armed conflict or communal violence do not necessarily follow a government decision and may result from infrastructure damage, so the globe keeps them separate from information-control cases.

### Submarine cables and base geography (OpenStreetMap ODbL, Natural Earth public domain)

The finer lines over water are submarine cables, taken from the two hundred-odd routes mapped by OpenStreetMap contributors, with the best coverage across Europe, the Mediterranean and the Atlantic. The faintest layer sketches the major transoceanic corridors, drawn as great-circle arcs between publicly documented landing points, so only the general direction is reliable and actual routing should be checked against a dedicated cable map. Borders and coastlines come from Natural Earth.

### Internet usage rate (World Bank CC BY 4.0, Ministry of Digital Affairs)

The internet usage rate on each country card exists to serve as a denominator. "How many people in this country use Tor" is in large part a comparison of population size; knowing what share of a country is online is what tells you whether a gap between two countries reflects demand or just headcount. The World Bank series covers 208 economies but not Taiwan, so the Taiwanese figure comes from the Ministry of Digital Affairs' national digital access survey instead. The two use different methods — one aggregates national reporting through the ITU, the other is a telephone sample of people aged 12 and over — and the card says so, because they should not be compared directly.

## Zooming in on Taiwan

![The globe zoomed to Taiwan, with county boundaries and 345 kV transmission lines over the island and relays concentrated down the western half](https://assets.anoni.net/games/tor-network-taiwan-en.webp){style="border-radius: 10px;"}

Taiwan is the only region on this globe drawn down to county scale, and approaching it brings up five more layers. The left-hand panel groups everything Taiwan-related together, and the "Focus Taiwan" button flies straight there.

- **County boundaries** — the Ministry of the Interior's municipality and county boundaries, 22 counties across 84 rings. It doubles as Taiwan's coastline, because the global coastline is too coarse at this scale, so the rough outline is swapped for it as you approach.
- **Cable landing points** — 14 of them, a dataset we built ourselves. Landing point coordinates are part of TeleGeography's commercial product and OpenStreetMap does not carry them, so we took the Ministry of Digital Affairs' public cable list as the spine and cross-checked each coordinate, recording a precision grade and its own sources for every entry. This v1 is incomplete and the gaps are listed in the header of the source file.
- **Substations** — Taipower's installed and reliable capacity for secondary substation main transformers, 280 sites, 201 of which can be placed on the map. The gauge on the card turns N-1 into visible geometry: the hatched band between the reliable-capacity tick and installed capacity is exactly the largest main transformer, the part that disappears when it fails. Nationwide, 64 sites have a peak load above their reliable capacity, which means losing one transformer at peak would leave the rest short. That is a separate question from whether the site is overloaded today.
- **Power plants and the 345 kV backbone** — 105 plants and 242 transmission segments. Only 17 plants can be located, but those 17 already account for 71% of installed capacity; the ones that cannot are mostly offshore wind and small hydro. Nothing below 161 kV is drawn at all, so this is not a complete grid.
- **Demand and renewables** — 93 Taipower-owned renewable sites, 124 months of county-level electricity demand, and 212 days of this year's daily peak operating reserve margin.

Plants, substations, renewable sites, landing points and transmission lines can all be clicked for detail.

### Demand reads two ways

![The left panel switched to industrial share, with Hsinchu County first at 80.4%, Tainan at 78.5% and Miaoli at 77.9% behind it](https://assets.anoni.net/games/tor-network-industry-en.webp){style="border-radius: 10px;"}

By total consumption the six special municipalities lead. Switch to industrial share and Hsinchu County jumps to the top, which is what the science parks look like in this dataset. The park straddles East District in Hsinchu City and Baoshan Township in Hsinchu County, two separate administrative rows, so a total splits it in half while a share does not.

The thin bars underneath are this year's daily peak operating reserve margin, with anything below `10%` turned orange, Taipower's own threshold for a tight supply day.

## What moves on the globe

Beyond the datasets above, a few more layers are rendered rather than fetched.

The day-night terminator follows the subsolar point computed from UTC, so it tracks real time and the seasonal variation in day length falls out automatically, with no external request involved. There are also auroras, atmospheric rim light and stars.

The occasional Tor three-hop path animation sits between the two categories. Its endpoints are taken from real relay positions, so which countries get picked reflects the real distribution, but the combination of the three points is illustrative and does not model Tor's actual path-selection rules.

## Sources and licensing

Every data file carries `source`, `sourceUrl`, `license` and `licenseUrl` fields, and the corresponding credits are listed below the globe. The full licence list lives in `NOTICE` at the root of the project, where the OONI entry is CC BY-NC-SA 4.0 and prohibits commercial use.

## Further reading

- Where the globe's data comes from: [Where the globe's data comes from](../blog/posts/games-globe-open-data.md)
- How Tor actually works: [What is Tor?](../tools/what-is-tor.md)
- Anonymity and what it does not cover: [Anonymity vs privacy](../basics/anonymity-vs-privacy.md)
- Running a relay and watching the network: [Tor relay watcher](../regional/tor-relay-watcher.md)
- The other two works: [Interactive](index.md)

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://anoni.net/docs/games/tor-network/#work",
      "name": "Tor Relay Globe",
      "alternateName": ["Tor 中繼地球儀", "Tor 中继地球仪"],
      "url": "https://anoni.net/docs/games/tor-network/play/?lang=en",
      "mainEntityOfPage": "https://anoni.net/docs/en/games/tor-network/",
      "description": "A globe built from real data. Nearly ten thousand running Tor relays placed inside their own borders, with censorship observations, user estimates, shutdown records, submarine cables and internet usage layered on top, plus county boundaries, cable landing points, substations, power plants and the grid when you zoom in on Taiwan.",
      "image": "https://assets.anoni.net/games/tor-network-en.png",
      "inLanguage": ["en", "zh-Hant", "zh-Hans"],
      "applicationCategory": "EducationalApplication",
      "browserRequirements": "A browser with WebGPU or WebGL2 support, no installation needed",
      "isAccessibleForFree": true,
      "license": "https://github.com/anoni-net/docs/blob/main/LICENSE",
      "author": { "@id": "https://anoni.net/#organization" },
      "publisher": { "@id": "https://anoni.net/#organization" },
      "isPartOf": { "@id": "https://anoni.net/docs/games/#collection" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Docs", "item": "https://anoni.net/docs/en/" },
        { "@type": "ListItem", "position": 2, "name": "Interactive", "item": "https://anoni.net/docs/en/games/" },
        { "@type": "ListItem", "position": 3, "name": "Tor Relay Globe" }
      ]
    }
  ]
}
</script>
