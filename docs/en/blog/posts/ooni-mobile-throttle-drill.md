---
date: 2026-08-11
authors:
    - anoni-net
categories:
    - Community
    - OONI
slug: ooni-mobile-throttle-drill
image: "assets/images/ooni-run-v2.webp"
summary: "On Thursday 13 August, 14:30–15:00 Taipei time (06:30–07:00 UTC), mobile networks across seven counties in northern Taiwan will be throttled for 30 minutes as part of a national civil-defence exercise. The government published the window and the area, but not the target speed. Taiwan's OONI data is dominated by fixed-line broadband: HiNet alone accounts for 39.5% of measurements and all three mobile carriers together for 3.6%, with FarEasTone producing 4 performance measurements in the last 30 days. During the identical drill in central Taiwan on 10 August, not one performance measurement was recorded on a mobile network anywhere in the country. This post covers what to run, the privacy trade-off to understand first, why all three carriers matter, and what the resulting dataset can and cannot support."
description: "On Thursday 13 August, 14:30–15:00 Taipei time (06:30–07:00 UTC), mobile networks across seven counties in northern Taiwan will be throttled for 30 minutes as part of a national civil-defence exercise. The government published the window and the area, but not the target speed. Taiwan's OONI data is dominated by fixed-line broadband: HiNet alone accounts for 39.5% of measurements and all three mobile carriers together for 3.6%, with FarEasTone producing 4 performance measurements in the last 30 days. During the identical drill in central Taiwan on 10 August, not one performance measurement was recorded on a mobile network anywhere in the country. This post covers what to run, the privacy trade-off to understand first, why all three carriers matter, and what the resulting dataset can and cannot support."
---

# A Pre-announced 30-Minute Throttle With No Published Target Speed: Help Measure All Three Carriers on 13 August

![Measuring Taiwan's mobile network throttling drill](./assets/images/ooni-run-v2.webp){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

On Thursday 13 August, from 14:30 to 15:00 Taipei time (UTC+8), mobile networks in Keelung, Taipei, New Taipei, Taoyuan, Hsinchu City, Hsinchu County, and Yilan will be throttled for thirty minutes. The throttle is part of Taiwan's Urban Resilience Exercise, executed simultaneously by all three major carriers. Official announcements state that voice calls, SMS, and cell broadcast continue to work, and that high-bandwidth services degrade: video streaming, video calls, mobile payments, cloud sync.

The announcements from the Executive Yuan, the NCC, and the carriers all set out the window and the affected services, and none of them contains a throughput figure. Chunghwa Telecom's and Taiwan Mobile's drill notices never state how far the speed drops, and the NCC's public description goes no further than "simulating restricted mobile network use".

One figure is in circulation. [The Record reported](https://therecord.media/taiwan-mobile-5g-speed-reductions-han-kuang){target="_blank"} that speeds will drop to about 1% of normal capacity, citing local media citing government planning documents. It has not been officially confirmed and appears in none of the announcements. What those thirty minutes will actually look like has no verifiable public record. This post is about whether a public measure can be verified, not about whether the exercise itself is warranted.

<!-- more -->

## What to do on 13 August

All times are Taipei time (UTC+8), with UTC in the tables. The drill window is **14:30–15:00 (06:30–07:00 UTC)**.

### Before the day

Install [OONI Probe](https://ooni.org/install/){target="_blank"}: free and open source, on the App Store, Google Play, and F-Droid. It is built by OONI to turn network interference and connection quality into verifiable public data ([more about the project](https://ooni.org/about/){target="_blank"}). First launch runs through an onboarding flow, so installing on the day itself is cutting it too fine. Run it once after installing to confirm it completes normally.

Then set three alarms for `14:15`, `14:35`, and `15:10`. The real obstacle is remembering mid-afternoon, not the tapping.

### One: turn Wi-Fi and any VPN off, use mobile data

Fixed lines and Wi-Fi are entirely unaffected by the drill, so a measurement taken over Wi-Fi contributes nothing. Phones routinely reconnect to office or home Wi-Fi on their own, so confirm you are on mobile data before starting.

Turn any VPN off. With a VPN in the path, the test measures the provider's link rather than your carrier's, and the recorded ASN becomes theirs, so the throttle never shows up. Tailscale by default only carries traffic between your own devices and leaves ordinary outbound traffic alone, but switch it off too if you use an exit node.

After a run completes, the results page shows the network name and ASN (the global number for an autonomous network, held by carriers, companies, and universities alike), which confirms the measurement ran on mobile and on your own carrier.

!!! warning "Check your mobile data allowance first"

    The `ndt` test inside the Performance group measures throughput, so it deliberately saturates whatever bandwidth is available. The app states an estimate before you start, currently 5 to 200 MB and about 1 minute 30 seconds, with the actual figure scaling with connection speed. The 14:35 run during the throttle costs least, because bandwidth is already constrained. Both 14:15 and 15:10 run at normal speed and will land at the top of that estimate.

    On a metered plan, run 14:35 and pick either 14:15 or 15:10 as the comparison; two runs are enough to compare.

### Two: run the built-in Performance tests

Open the app, tap Tests, choose Performance, tick the tests you want, then tap run. The Performance group contains `ndt` (connection speed) and `dash` (which probes available bandwidth the way an adaptive video stream would), which are the two tests this needs, and it is available on both Android and iOS.

<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/blog/ooni-performance.png" alt="OONI Probe's Performance screen, showing an estimate of 5 to 200 MB and about 1 minute 30 seconds, the run button, and the previous test result" style="width:50%">
</figure>

### Three: run it at all three times

| Taipei (UTC+8) | UTC | Purpose |
|---|---|---|
| `14:15` | `06:15` | reference point before the throttle |
| `14:35` | `06:35` | during the throttle |
| `15:10` | `07:10` | after recovery |

What matters most is using the same handset and the same subscription for all three, and completing every run on mobile data. Staying in one place makes the results easier to compare, but moving between runs does not disqualify anything, as long as the phone has not slipped back onto Wi-Fi.

If you can spare one more, run the Performance card at `14:35` on Wednesday 12 August. One extra measurement gives the following day's comparison a same-time reference at no additional effort.

!!! note "Catching only one of the three still helps"

    If you are reading this at or after 14:30, run 14:35 first and add 15:10 afterwards. A single time point still compares against other participants and against the previous day's run at the same hour.

!!! note "Upload failures during the throttle are expected"

    Results have to be uploaded, and bandwidth is deliberately constrained during the window, so the upload may stall or fail. There is no need to run the test again. OONI Probe queues results and submits them once the network recovers.

If you want to contribute more, add a run of the Circumvention group at 14:35. It includes Tor and Psiphon connectivity tests, which show whether the throttle reaches circumvention tools.

## The privacy trade-off, before you tap run

Two separate databases are involved, and the distinction decides whether you want to run this. OONI's own published measurements are all public, and they include the ASN you are on and a timestamp but not your personal IP address. The `ndt` test in the Performance group additionally sends data to [M-Lab](https://www.measurementlab.net/){target="_blank"}, a different organisation with a different dataset and different rules.

M-Lab's [privacy policy](https://www.measurementlab.net/privacy/){target="_blank"} states that test data is made public, that the disclosed data includes your IP address along with date and time, and that M-Lab retains collected data indefinitely for longitudinal study, without anonymising the public dataset. The erasure route the policy offers runs through GDPR and LGPD, which cover data subjects in the EU and Brazil; users in Taiwan fall outside both, and whether an equivalent request would be honoured is unclear. The app's own Performance screen carries a matching disclaimer, noting that these tests run through third-party servers and that your IP address cannot be guaranteed to stay uncollected.

Running `ndt` therefore writes your current public IP address into a public, long-retained dataset. M-Lab does not authenticate users, does not keep per-user test histories, and mobile IP addresses are typically dynamic, so relating a record to a specific individual is difficult in practice. Whether to leave that record is your decision.

Anyone who wants to contribute reachability data without leaving an IP record can run the Websites group (`web_connectivity`) instead, which does not involve M-Lab.

## The central Taiwan drill already showed what happens

The same throttle ran in seven central counties on 10 August, 14:30 to 15:00 Taipei time (`06:30`–`07:00` UTC). After it ended, we queried OONI's public database for what Taiwan recorded during that window.

| Test | Measurements, whole country | Network |
|---|---|---|
| `ndt` (connection speed) | 1 | `AS131584` Taiwan Intelligent Fiber Optic Network, fixed line |
| `dash` (streaming bandwidth probe) | 1 | same fixed-line ASN |
| `web_connectivity` (site reachability) | 803 | almost entirely fixed line, 593 of them HiNet |

Chunghwa Telecom Mobile (`AS17421`) recorded zero. FarEasTone (`AS9674`) recorded zero.

The single speed measurement ran over fixed fibre, and that network was not throttled. Those thirty minutes produced no independent observation, and once bandwidth returned the event became unrecoverable. Thursday is the last drill in this exercise.

## Taiwan's OONI coverage is 39.5% one ISP

The central Taiwan result reflects the long-running distribution of OONI data in Taiwan. Over the last 30 days the country produced 658,037 `web_connectivity` measurements across 25 ASNs:

| Network | Measurements, 30 days | Share |
|---|---|---|
| `AS3462` HiNet | 259,987 | 39.5% |
| All three mobile carriers | 23,451 | 3.6% |
| 　└ `AS24158` Taiwan Mobile | 20,481 | |
| 　└ `AS17421` Chunghwa Telecom Mobile | 2,375 | |
| 　└ `AS9674` FarEasTone | 595 | |

Most of the remaining 60% is also fixed line: Taiwan Intelligent Fiber Optic Network, StarVerse, and DaDa Broadband each contribute tens of thousands, alongside several university campus networks.

For the performance tests this drill calls for, the numbers are much smaller. The last 30 days produced 1,025 `ndt` measurements nationwide, of which Chunghwa Telecom Mobile accounts for 16 and FarEasTone for 4, against 658,037 `web_connectivity` measurements over the same period.

So any current statement about the state of Taiwan's network rests on data that mostly describes residential fixed broadband. [NCC figures](https://www.ncc.gov.tw/chncc/app/data/list?id=570){target="_blank"} put Taiwan at roughly 28.33 million mobile subscriptions in Q1 2026, and most people spend the larger part of their day online through a mobile network, which is close to absent from public measurement data.

The three carriers are comparable in size over the same period, at roughly 11.29 million for Chunghwa Telecom, 8.94 million for Taiwan Mobile, and 8.14 million for FarEasTone. Their OONI measurement counts run in the opposite direction: Chunghwa Telecom, the largest, has 2,375; FarEasTone, the smallest, has 595; Taiwan Mobile has 20,481.

Two limits belong alongside those figures. The public aggregation API reports measurement counts and not device counts, so the table above cannot rule out a small number of devices measuring repeatedly. Separately, Taiwan Mobile operates both mobile and fixed-line services, and so does Chunghwa Telecom, so a single measurement tagged `AS24158` cannot be sorted into phone or home router from the data alone.

## Why all three carriers, and why together

That identification problem is exactly why the window matters. The drill has a published time range and a published list of counties, so within that window and that area, mobile-side measurements appearing on `AS24158`, `AS17421`, and `AS9674` have a known situation to attach to, and the ASN becomes sufficient to attribute behaviour to a carrier. Measurements scattered across ordinary days have no such anchor.

To be clear about what this does and does not control: a shared window removes one variable, time. Location, cell load, handset model, and signal strength all remain. Ten phones spread across seven counties still produce a set of points taken under different conditions, so conclusions have to stay coarse-grained, for example whether all three carriers show an observable drop in throughput and whether the magnitudes are broadly comparable. Any precise ranking of carriers goes beyond what this data can support.

Within those limits, three carriers facing one instruction in one thirty-minute window remains an unusual opportunity. One carrier measured densely still yields a single curve.

## What the dataset can support

The hardest part of studying network throttling is not knowing when it began, when it ended, or how far it reached. In most cases users notice slowness first and researchers reconstruct the timeline afterwards, leaving the boundaries fuzzy. Here the government pre-announced the date, the window, the counties, and the carriers, so the thirty-minute edges are sharp. The known part covers when and where the policy takes effect; it does not cover treatment intensity, since officials published no target speed. The reported 1% figure is concrete enough to test, and the measurements will either support it or contradict it, which is a sharper task than open-ended exploration. Pre-announced shutdowns are not new elsewhere, exam-period national shutdowns being the familiar example. What is less common is a pre-announced *throttle* with per-carrier granularity.

Once normal and throttled conditions are both on record, Taiwan's mobile networks gain a reference baseline, and a future unexpected degradation has something to be compared against. This value scales with participation: 30 phones is an anecdote, 300 starts to be a dataset.

One side of the official claim also becomes checkable. The announcements say voice, SMS, and cell broadcast keep working and only high-bandwidth services degrade. The descriptions do not entirely agree with one another: Taiwan Mobile's notice lists messaging apps such as LINE, WhatsApp, and M+ among the services expected to see delays and instability, while the Executive Yuan's version has text transmission working normally. `ndt` and `dash` can only examine the high-bandwidth side, since neither test touches voice, SMS, or cell broadcast. One edge of the stated boundary is checkable, and checking it is still worth doing. Civil society being able to verify the real effect of a public measure is part of resilience.

The throttle's reach into circumvention tools is a separate question. Whether Tor and Psiphon can still establish connections under constrained bandwidth is a long-standing question for this community, and this half hour is a ready-made test bed.

One caveat for interpretation: `ndt` measures against M-Lab servers, so the resulting figure includes both the last mile and the international path to the nearest M-Lab node, and a single measurement cannot separate the two.

One more variable shapes the outcome. The official announcements list affected service types, which reads like application-class traffic management, while the reported 1% figure reads like a blanket bandwidth cap. The two mean different things here: under a blanket cap, `ndt` measures the throttle directly; under service classification, `ndt` traffic to M-Lab may not fall into a restricted class and could come back near normal speed. That cannot be settled in advance, and the measurements themselves will show which it is.

## Join in

Three things can be done right now: install [OONI Probe](https://ooni.org/install/){target="_blank"} and run it once, set alarms for `14:15`, `14:35`, and `15:10`, and pass this on to anyone living or working in the seven northern counties. Chunghwa Telecom and FarEasTone subscribers are especially welcome, since both carriers have almost no performance measurements at all. At the current density, ten phones per carrier would already be an order-of-magnitude improvement.

People outside the seven counties can measure at the same times too. Measurements from outside the throttled area act as a control group, helping separate changes caused by the drill from ordinary variation on the day.

Afterwards you can find your own measurement in [OONI Explorer](https://explorer.ooni.org/){target="_blank"} by ASN and time. The community will publish a follow-up post with the three time points broken down by carrier. Questions, or an interest in helping with the analysis, are welcome in the community [Matrix Public Space](https://matrix.to/#/#community:im.anoni.net){target="_blank"}.

## Appendix: using OONI as research evidence

This campaign addresses one event, but the method is reusable. OONI data has three entry points, serving quite different purposes:

- **[OONI Explorer](https://explorer.ooni.org/){target="_blank"}**: a web interface for inspecting individual measurements and country or ASN trends, with no code required.
- **Aggregation API**: `https://api.ooni.org/api/v1/aggregation`, no authentication and no key, sliceable by country, test, and ASN. The 30-day ASN distribution and shares in this post come from it. Its `since` and `until` accept dates only, and passing a time returns a `date_from_datetime_inexact` error, so it suits day-level trends and coarser.
- **Measurements API**: `https://api.ooni.org/api/v1/measurements`, also unauthenticated, accepts second-precision windows and returns individual records. The central Taiwan 30-minute table in this post comes from it.
- **AWS S3 public dataset**: `ooni-data-eu-fra`, raw per-measurement JSON, for research needing measurement internals or large-scale analysis. Raw data lands in S3 with a lag of several hours to about a day. Access paths and CSV output formats are documented in [ASN observation data extraction and analysis](../../community/asn-coverage-howto.md), along with the community-maintained tooling.

For this drill specifically, a 30-minute window needs the measurements endpoint: `probe_cc=TW`, `test_name=ndt` (or `dash`), `since=2026-08-13T06:00:00Z`, `until=2026-08-13T08:00:00Z`. Each returned record carries `probe_asn`, which you then group into `24158`, `17421`, and `9674`. All times are UTC, which is Taipei time minus eight hours. To work out which test answers a given question, the [OONI nettest reference](../../community/ooni-nettests-map.md) lists what each test measures, its spec status, and whether Taiwan has data for it.

Two things to keep in mind when using this data.

The most common misreading is treating an anomaly as a block. OONI's `anomaly` flag only means a test did not complete as expected, and the causes include censorship, an unstable network, a transient ISP fault, and bugs in the test itself, so treating anomaly rates as blocking rates produces false accusations. Over the last 30 days the `tor` test recorded `16.3%` in Canada, `22.0%` in Switzerland, and `20.2%` in New Zealand, none of which censor. Mid-range values are noise, and only the extreme high end corresponds to reality.

On licensing, OONI's published measurement data is CC BY-NC-SA 4.0, which prohibits commercial use and requires derivative works to be released under the same licence. Cite the source when quoting figures, and note that merging OONI data with other sources into a new dataset brings the whole result under that licence.

Exercise details follow the [Executive Yuan announcement](https://www.ey.gov.tw/Page/9277F759E41CCD91/66c2bed1-6ca3-4c30-ba7c-4fa0f90e00ec){target="_blank"} and each carrier's own notice. If the schedule changes, the official announcements take precedence.

---

**Sources**: OONI aggregation and measurements API (queried 2026-08-10, measurement data licensed [CC BY-NC-SA 4.0](https://github.com/ooni/license/blob/master/data/LICENSE.md){target="_blank"}); ASN names from [RIPEstat](https://stat.ripe.net/){target="_blank"}; M-Lab data handling from the [M-Lab privacy policy](https://www.measurementlab.net/privacy/){target="_blank"}; exercise details from the Executive Yuan, the NCC, [Taiwan Mobile](https://www.taiwanmobile.com/csonline/service/ann/ann3_20260722_103509.html){target="_blank"}, and [Chunghwa Telecom's drill notice](https://www.cht.com.tw/home/consumer/customer-service/announce/urban-resilience-exercise){target="_blank"}.
