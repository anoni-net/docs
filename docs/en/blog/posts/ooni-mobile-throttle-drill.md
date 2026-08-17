---
date: 2026-08-11
authors:
    - anoni-net
categories:
    - Community
    - OONI
slug: ooni-mobile-throttle-drill
image: "assets/images/ooni-run-v2.webp"
summary: "On Thursday 13 August, 14:30-15:00 Taipei time (06:30-07:00 UTC), mobile networks across seven counties in northern Taiwan will be throttled for 30 minutes. The date, the window, the counties, the carriers, and the treatment intensity are all public in advance, and network throttling research rarely gets boundaries this sharp. The Executive Yuan describes the method as core-network rate limiting with downloads capped at 256KB, which gives a figure to expect when reading the data. Those thirty minutes can show whether the limiting sits at the bandwidth layer or the application layer, whether all three carriers drop by a similar order, whether Tor and Psiphon still connect under constrained bandwidth, and how fast speeds recover afterwards. This post covers what to run, the privacy trade-off to understand first, and what the resulting data can support. Of Taiwan's 548 mobile-side OONI performance measurements, 528 come from Taiwan Mobile alone, against 16 for Chunghwa Telecom Mobile and 4 for FarEasTone."
description: "On Thursday 13 August, 14:30-15:00 Taipei time (06:30-07:00 UTC), mobile networks across seven counties in northern Taiwan will be throttled for 30 minutes. The date, the window, the counties, the carriers, and the treatment intensity are all public in advance, and network throttling research rarely gets boundaries this sharp. The Executive Yuan describes the method as core-network rate limiting with downloads capped at 256KB, which gives a figure to expect when reading the data. Those thirty minutes can show whether the limiting sits at the bandwidth layer or the application layer, whether all three carriers drop by a similar order, whether Tor and Psiphon still connect under constrained bandwidth, and how fast speeds recover afterwards. This post covers what to run, the privacy trade-off to understand first, and what the resulting data can support. Of Taiwan's 548 mobile-side OONI performance measurements, 528 come from Taiwan Mobile alone, against 16 for Chunghwa Telecom Mobile and 4 for FarEasTone."
---

# A Throttle Announced in Advance: Recording 30 Minutes of Northern Taiwan's Mobile Networks on 13 August

![Measuring Taiwan's mobile network throttling drill](./assets/images/ooni-run-v2.webp){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

On Thursday 13 August, from 14:30 to 15:00 Taipei time (UTC+8), mobile networks in Keelung, Taipei, New Taipei, Taoyuan, Hsinchu City, Hsinchu County, and Yilan will be throttled for thirty minutes. The throttle is part of Taiwan's Urban Resilience Exercise, executed simultaneously by all three major carriers. Official announcements state that voice calls, SMS, and cell broadcast continue to work, and that high-bandwidth services degrade: video streaming, video calls, mobile payments, cloud sync.[^1] The NCC's advice for the window is to prepare in advance for going offline.[^2]

Officials have described the depth of the throttle twice. On 20 July, Defence Minister Wellington Koo [told the Legislative Yuan](https://www.ettoday.net/news/20260720/3204422.htm){target="_blank"} that speeds would drop to one percent of 4G and 5G capacity. After the central Taiwan drill on 10 August, the Executive Yuan [described the method](https://www.cna.com.tw/news/aipl/202608100327.aspx){target="_blank"}: carriers apply rate limiting in the core network, capping mobile download speeds at 256KB. The two statements are of the same order, and either one gives a figure to expect when the measurements come in.

The date, the window, the seven counties, the three carriers: every boundary of this throttle is public before it runs. Studies of network throttling rarely get that. In most cases users notice slowness first and researchers reconstruct the timeline afterwards, leaving the edges fuzzy. Pre-announced shutdowns are not new elsewhere, exam-period national shutdowns being the familiar example.[^6] On the publicly documented record, a pre-announced *throttle* is less common, particularly one with per-carrier granularity.

During the same window at the central Taiwan drill on 10 August, Taiwan's OONI observations contained no performance measurement from a mobile network at all. The northern drill is the last of this year's exercise, so after 13 August the opportunity does not come round again.

If you are in one of those seven counties, your phone is going to slow down for that half hour regardless. Rather than just waiting it out, you might as well leave a record behind.

<!-- more -->

??? info "Why throttle mobile networks at all: context for readers outside Taiwan"

    The Executive Yuan describes the drill as simulating an extreme scenario in order to verify the government's response capability under constrained communications, with the scenarios in mind including natural disaster, large-scale cyberattack, and compound disasters, and the stated goal being to strengthen overall communications and societal defence resilience.[^1] The announcement itself does not mention wartime or military exercises; the framing is civil defence and fallback capacity. The mobile throttle was added to the exercise for the first time, drawing on practice in Japan, South Korea, and the Nordic countries,[^1] which is a first for Taiwan rather than a global first.

    For Taiwan, communications loss is not a hypothetical problem. Taiwan is an island whose external connectivity depends on submarine cables, and the Ministry of Digital Affairs maintains a public page listing cable faults one by one, with fault location, alternative routing, and estimated repair date.[^7] In the update dated 28 July 2026, four cables were in a fault state, the most recent having occurred on 14 July with repair estimated for 14 August, the same week as the drill. To see where those cables actually run, open the <a href="../../../../../games/tor-network/play/index.html?lang=en">Tor Relay Globe</a>, which plots 228 submarine cable segments along with the fault status around Taiwan.

    A real incident is on a very different scale from the drill. The drill throttles for 30 minutes, covers fourteen counties in total, and leaves voice and SMS intact. A cable break can last weeks and affect connectivity for a whole region. The drill exists to verify fallback mechanisms and public preparedness, not to reproduce an incident.

## What to do on 13 August

All times are Taipei time (UTC+8), with UTC in the tables. The drill window is **14:30–15:00 (06:30–07:00 UTC)**.

### Before the day

Install [OONI Probe](https://ooni.org/install/){target="_blank"}: free and open source, on the App Store, Google Play, and F-Droid. It is built by OONI to turn network interference and connection quality into verifiable public data ([more about the project](https://ooni.org/about/){target="_blank"}). First launch runs through an onboarding flow, so installing on the day itself is cutting it too fine. Run it once after installing to confirm it completes normally.

Then set an alarm for `14:35`, the run that matters most, and add `14:15` and `15:10` if you can. The real obstacle is remembering mid-afternoon, not the tapping. Missing it entirely is fine too: take the `15:10` run instead, and a single measurement is still worth submitting.

### Step one: turn Wi-Fi and any VPN off, use mobile data

Wi-Fi served by a fixed line is unaffected by the drill, so a measurement taken over that kind of Wi-Fi contributes nothing. Phones routinely reconnect to office or home Wi-Fi on their own, so confirm you are on mobile data before starting. A hotspot shared from another phone runs over mobile underneath, but OONI still records the network type as Wi-Fi, so avoid that too.

Turn off both VPNs and Tailscale. A VPN routes traffic elsewhere, so the test measures the provider's link and records their ASN instead of your carrier's. Tailscale runs through the system VPN mechanism on iOS and Android even without an exit node, so OONI Probe records the network type as `vpn` rather than `mobile`, and the measurement can no longer be identified as coming from a mobile network. The app raises a warning when it detects a VPN, so switch it off before running if you see one. Remember to turn Tailscale back on afterwards, which is easy to forget if you rely on it to reach a work network.

After a run completes, the results page shows the network name and ASN (the global number for an autonomous network, held by carriers, companies, and universities alike), which confirms the measurement ran on mobile and on your own carrier.

!!! warning "Check your mobile data allowance first"

    The `ndt` test inside the Performance group measures throughput, so it deliberately saturates whatever bandwidth is available. The app states an estimate before you start, currently 5 to 200 MB and about 1 minute 30 seconds, with the actual figure scaling with connection speed. The run during the throttle costs least, because bandwidth is already constrained. Both 14:15 and 15:10 run at normal speed and will land at the top of that estimate.

    On a metered plan, run the one during the throttle and pick either 14:15 or 15:10 as the comparison; two runs are enough to compare.

### Step two: run the built-in Performance tests

Open the app, tap Tests, choose Performance, tick the tests you want, then tap run. The Performance group contains `ndt` (connection speed) and `dash` (which simulates adaptive video streaming and estimates the achievable bitrate), which are the two tests this needs, and it is available on both Android and iOS.

<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/blog/ooni-performance.png" alt="OONI Probe's Performance screen, showing an estimate of 5 to 200 MB and about 1 minute 30 seconds, the run button, and the previous test result" style="width:50%">
</figure>

### Step three: run once between 14:35 and 14:55 at minimum

The run taken during the throttle matters most. The drill starts at 14:30 and ends at 15:00, and leaving five minutes at each end avoids the ramp-up and recovery transitions, so any start between 14:35 and 14:55 works. `ndt` takes about 1 minute 30 seconds, so starting as late as 14:55 still finishes before the window closes.

A single run is worth submitting on its own, since it compares against other participants and against the same hour the day before. Add the other two when time allows, because a single phone's own before-and-after is the cleanest comparison.

| Taipei (UTC+8) | UTC | Purpose | Priority |
|---|---|---|---|
| `14:35` to `14:55` | `06:35` to `06:55` | during the throttle | essential |
| `14:15` | `06:15` | reference point before the throttle | if you can |
| `15:10` | `07:10` | after recovery | if you can |

What matters most is using the same handset and the same subscription for all three, and completing every run on mobile data. Staying in one place makes the results easier to compare, but moving between runs does not disqualify anything, as long as the phone has not slipped back onto Wi-Fi.

If you can spare one more, run the Performance card at `14:35` on Wednesday 12 August. One extra measurement gives the following day's comparison a same-time reference at no additional effort.

!!! note "Reading this after 14:30"

    Run it straight away if it is still before 14:55, or take 15:10 if that window has passed. A single measurement is still worth submitting.

!!! note "Upload failures during the throttle are expected"

    Results have to be uploaded, and bandwidth is deliberately constrained during the window, so the upload may stall or fail. There is no need to run the test again. OONI Probe queues results and submits them once the network recovers.

If you want to contribute more, add a run of the Circumvention group during the throttle. It includes Tor and Psiphon connectivity tests, which show whether the throttle reaches circumvention tools. That group does perform blocking determination, so connection failures caused by the throttle will be recorded as anomalies with bandwidth rather than censorship behind them, and the community write-up will say so explicitly.

## The privacy trade-off, before you tap run

The short version: the performance tests leave your current public IP in M-Lab's public dataset, while mobile IP addresses are dynamic and tied to no account, which makes linking a record to a person difficult in practice. If you would rather not leave that record, run the Websites group (`web_connectivity`) instead, which does not involve M-Lab. The full explanation follows.

Two separate databases are involved. OONI's own published measurements are all public, and they include the ASN you are on and a timestamp but not your personal IP address. The `ndt` test in the Performance group additionally sends data to [M-Lab](https://www.measurementlab.net/){target="_blank"}, a different organisation with a different dataset and different rules.

M-Lab's [privacy policy](https://www.measurementlab.net/privacy/){target="_blank"} states that test data is made public, that the disclosed data includes your IP address along with date and time, and that M-Lab retains collected data indefinitely for longitudinal study, without anonymising the public dataset. The erasure route the policy offers is framed around GDPR and LGPD, aimed primarily at data subjects in the EU and Brazil. M-Lab states the policy applies to users in all regions, but the text does not address standing for requests from third jurisdictions such as Taiwan, so whether such a request would be honoured in practice is unclear. The app's own Performance screen carries a matching disclaimer, noting that these tests run through third-party servers and that your IP address cannot be guaranteed to stay uncollected.

Running `ndt` therefore writes your current public IP address into a public, long-retained dataset. M-Lab does not authenticate users, does not keep per-user test histories, and mobile IP addresses are typically dynamic, so a third-party researcher or ordinary querier has a hard time relating a single IP back to an individual. That covers the M-Lab and OONI side of the question. Your own carrier can already map connection records to your subscription and IP, a record that exists regardless of whether you measure and that taking part does not add to. Whether to leave that record is your decision.

## During the central Taiwan drill, mobile networks recorded no performance measurement

The same throttle ran in seven central counties on 10 August, 14:30 to 15:00 Taipei time (`06:30`–`07:00` UTC). After it ended, we queried OONI's public database for what Taiwan recorded during that window.

| Test | Measurements, whole country | Network |
|---|---|---|
| `ndt` (connection speed) | 1 | `AS131584` Taiwan Intelligent Fiber Optic Network, fixed line |
| `dash` (streaming bitrate) | 1 | same fixed-line ASN |
| `web_connectivity` (site reachability) | 803 | almost entirely fixed line, 593 of them HiNet |

Chunghwa Telecom Mobile (`AS17421`) recorded zero. FarEasTone (`AS9674`) recorded zero.

The single speed measurement ran over fixed fibre, and that network was not throttled. Taiwan produced 902 OONI observations in total during those thirty minutes, and not one of them was a performance measurement on a mobile network. The exercise runs region by region in the order south, central, offshore islands, east, north, and the northern drill is the last one,[^3] so a throttle under these conditions will not come round again until next year.

## Taiwan's OONI coverage is 39.3% one ISP

The central Taiwan result reflects the long-running distribution of OONI data in Taiwan. Between 12 July and 11 August 2026 the country produced 645,039 `web_connectivity` measurements across 25 ASNs:

| Network | Measurements, 30 days | Share |
|---|---|---|
| `AS3462` HiNet | 253,546 | 39.3% |
| `AS131584` Taiwan Intelligent Fiber Optic Network | 191,257 | 29.7% |
| All three mobile carriers | 23,010 | 3.6% |
| 　└ `AS24158` Taiwan Mobile | 20,099 | |
| 　└ `AS17421` Chunghwa Telecom Mobile | 2,342 | |
| 　└ `AS9674` FarEasTone | 569 | |

The rest is also mostly fixed line: StarVerse and DaDa Broadband each contribute tens of thousands, alongside campus networks at Fu Jen Catholic University, TANet, and National Taiwan University.

For the performance tests this drill calls for, the totals are far smaller. The same period produced only 1,008 `ndt` measurements nationwide. Mobile appears to account for more than half at 548, but 528 of those come from Taiwan Mobile alone, against 16 for Chunghwa Telecom Mobile and 4 for FarEasTone. The gap sits with those last two.

So any current statement about the state of Taiwan's network rests on data that mostly describes residential fixed broadband. [NCC figures](https://www.ncc.gov.tw/chncc/app/data/list?id=570){target="_blank"} put Taiwan at roughly 28.33 million mobile subscriptions in Q1 2026, and most people spend the larger part of their day online through a mobile network, which is close to absent from public measurement data.

All three are national carriers, yet their OONI measurement counts differ by one to two orders of magnitude. Taiwan Mobile has 528 performance measurements against 16 for Chunghwa Telecom Mobile, a gap that subscriber numbers plainly do not explain.

Two limits belong alongside those figures. The public aggregation API reports measurement counts and not device counts, so the table above cannot rule out a small number of devices measuring repeatedly. Separately, Taiwan Mobile operates both mobile and fixed-line services, and so does Chunghwa Telecom, so a single measurement tagged `AS24158` cannot be sorted into phone or home router from the data alone.

## Why all three carriers, and why together

That identification problem is exactly why the window matters. The drill has a published time range and a published list of counties, so within that window and that area, mobile-side measurements appearing on `AS24158`, `AS17421`, and `AS9674` have a known situation to attach to, and the ASN becomes sufficient to attribute behaviour to a carrier. Measurements scattered across ordinary days have no such anchor.

To be clear about what this does and does not control: a shared window removes one variable, time. Location, cell load, handset model, and signal strength all remain. Thirty phones spread across seven counties still produce a set of points taken under different conditions, so conclusions have to stay coarse-grained, for example whether all three carriers show an observable drop in throughput and whether the magnitudes are broadly comparable. Any precise ranking of carriers goes beyond what this data can support.

Within those limits, three carriers facing one instruction in one thirty-minute window remains an unusual opportunity. One carrier measured densely still yields a single curve.

## What these thirty minutes can show

The method the Executive Yuan describes, core-network rate limiting with a fixed download cap, is blanket bandwidth management, which `ndt` should measure directly. The announcement separately lists affected service types (video streaming, video calls, mobile payments, cloud sync), which reads more like application-class handling, and the three carriers do not entirely agree on the affected scope either. Taiwan Mobile's notice lists messaging apps such as LINE, WhatsApp, and M+ among the services expected to see delays and instability,[^4] Chunghwa Telecom writes "video, video calls, mobile internet access, and some IoT applications",[^5] while the Executive Yuan's version has text transmission working normally.[^1] If the limiting sits at the bandwidth layer, `ndt` reflects it directly. If it leans towards application-class handling, `ndt` traffic to M-Lab may not fall into a restricted class and could come back near normal speed. The measurements themselves will show which it is, and that is the most interesting question of the half hour.

Whether Tor and Psiphon can still establish connections under constrained bandwidth is a long-standing question for this community, and Thursday afternoon is a ready-made test bed. How quickly speeds return to normal once the throttle lifts is answered by the 15:10 measurement.

Once normal and throttled conditions are both on record, Taiwan's mobile networks gain a reference baseline, and a future unexpected degradation has something to be compared against. This value scales with participation: a few dozen phones can answer whether all three carriers show a clear drop, while discussing distributions and confidence intervals needs several hundred.

`ndt` and `dash` can only look at the high-bandwidth side, since neither test touches the voice, SMS, or cell broadcast that the announcements say keep working. Only one edge of the stated boundary is observable, and observing it is still worth doing. A community able to describe the state of its own networks is part of resilience.

One caveat for interpretation: `ndt` measures against M-Lab servers, so the resulting figure includes both the last mile and the international path to the nearest M-Lab node, and a single measurement cannot separate the two. The officially stated 256KB serves here as the figure to expect, which makes the readings easier to place.

Participation density is a variable too. `ndt` saturates the available bandwidth, so several phones on the same cell running it in the same minute compete for whatever throughput remains, and part of any low reading would come from participants crowding each other rather than from the carrier. At the scale this campaign targets, ten phones per carrier spread across seven counties, collisions are unlikely, but the number of concurrent participants should still be recorded alongside the results.

## Join in

Three things can be done right now: install [OONI Probe](https://ooni.org/install/){target="_blank"} and run it once, set an alarm for `14:35`, and pass this on to anyone living or working in the seven northern counties. Chunghwa Telecom and FarEasTone subscribers are especially welcome, since the two carriers have 16 and 4 performance measurements respectively over the past 30 days. For FarEasTone, ten phones running three times each on Thursday afternoon would exceed its entire monthly total in one afternoon.

People outside the seven counties can measure at the same times too. Measurements from outside the throttled area act as a control group, helping separate changes caused by the drill from ordinary variation on the day.

Afterwards you can find your own measurement in [OONI Explorer](https://explorer.ooni.org/){target="_blank"} by ASN and time. The community will publish a follow-up post with the three time points broken down by carrier. Questions, or an interest in helping with the analysis, are welcome in the community [Matrix Public Space](https://matrix.to/#/#community:im.anoni.net){target="_blank"}.

## Frequently asked questions

??? question "Why only the Performance tests, instead of running everything once?"

    Every test group other than Performance performs blocking determination, and the throttle would make them produce false blocking signals.

    Take `web_connectivity`. It decides by comparing the phone's result against OONI's test helper server. The phone times out repeatedly under the rate limit while the test helper, sitting in a data centre, works fine, and that comparison gets labelled `tcp_ip` or `http-failure`, which is the signature of blocking. Several hundred people running blocking-determination tests under a rate limit at once amounts to injecting a batch of censorship-shaped records into Taiwan's public dataset.

    The Performance group produces no false blocking signal. `ndt` and `dash` have no blocking determination implemented in the backend, and across roughly 200,000 measurements each worldwide over the last 90 days the anomaly count is 0 for both. They leave throughput numbers and nothing else.

    Time does not allow it either. The Performance group takes about 1 minute 30 seconds and sits comfortably inside the window. The Websites group works through a URL list that takes several minutes even on a normal network, and under a rate limit it would very likely run past 15:00, mixing throttled and recovered conditions into one report.

??? question "How much mobile data will this use?"

    The app displays an estimate before running. Bandwidth is already constrained during the throttle, so that run costs least, while 14:15 and 15:10 run at normal speed and land at the top of the estimate. On a metered plan, prioritise the run during the throttle. The concrete figures are in the allowance warning above.

??? question "My IP becomes public. How much of a risk is that really?"

    The performance tests leave your IP in M-Lab's public dataset, retained long-term and not anonymised. Running the Websites tests instead avoids M-Lab entirely. The detail needed to judge the risk is in the privacy section above.

??? question "I am not in the seven northern counties. Should I still measure?"

    Yes, and it is useful. Data from outside the area serves as a control group for ruling out ordinary network variation on the day.

??? question "I was in a meeting and missed 14:35 to 14:55. What now?"

    Take 15:10 instead. Even a single late measurement compares against other participants and against the same hour the next day, so there is no need to complete all three for it to count.

??? question "Is there any legal risk in taking part?"

    The action is measuring your own connection speed on your own phone, no different from an ordinary speed-test app, and it neither interferes with the drill nor affects anyone else. OONI Probe is an open-source tool in long-standing use worldwide. If your organisation has its own compliance considerations, you can run the Websites tests only, or opt out.

??? question "Is this an attempt to fact-check the official 256KB figure?"

    The starting point is the rare set of observing conditions in these thirty minutes, with the time, the place, and the carriers all announced in advance. The official figure serves as the value to expect, so participants know roughly where the readings should land. The measurements describe network conditions, and the merits and necessity of the exercise are outside the scope.

??? question "How do I confirm my measurement worked?"

    The results page shows the network name and ASN once a run finishes, and it should read as your own carrier rather than Wi-Fi or a VPN. After submission you can also find your own record in [OONI Explorer](https://explorer.ooni.org/){target="_blank"}.

??? question "Anything to watch for on a dual-SIM phone?"

    Confirm which SIM mobile data is actually using. With two SIMs in one phone it is easy to assume you are testing one carrier while the data leaves through the other. The ASN on the results page is the final confirmation.

## Data and assumptions

The OONI figures in this post fall into three groups, all queried on 2026-08-11. The endpoints and parameters are below, so readers can re-run them.

**The central Taiwan 30-minute window** (902, 803, 593, and the two performance measurements in the table) uses the measurements endpoint with `probe_cc=TW`, `since=2026-08-10T06:30:00Z`, `until=2026-08-10T07:00:00Z`, querying `test_name` as `ndt`, `dash`, and `web_connectivity` in turn. Every returned record carries `probe_asn`.

**The 30-day ASN distribution** (645,039, 253,546, 191,257, 23,010, and the three carrier breakdowns) uses the aggregation endpoint with `probe_cc=TW`, `test_name=web_connectivity`, `axis_x=probe_asn`, `since=2026-07-12`, `until=2026-08-12`. The performance figures of 1,008, 548, 528, 16, and 4 use the same parameters with `test_name` set to `ndt`. The aggregation endpoint's `until` is exclusive, so `until=2026-08-12` covers through 11 August.

**Zero anomalies on the performance tests** uses the aggregation endpoint with no `probe_cc` for worldwide scope, `since=2026-05-13`, `until=2026-08-12`, and `test_name` of `ndt` and `dash`. The same parameters with `tor` and `web_connectivity` give the contrast, at 13.95% and 8.05% anomalies respectively.

These counts keep accumulating, so a later query returns slightly higher values while the shape of the distribution stays stable.

## Appendix: using OONI as research evidence

This campaign addresses one event, but the method is reusable. OONI data has four entry points, serving quite different purposes:

- **[OONI Explorer](https://explorer.ooni.org/){target="_blank"}**: a web interface for inspecting individual measurements and country or ASN trends, with no code required.
- **Aggregation API**: `https://api.ooni.org/api/v1/aggregation`, no authentication and no key, sliceable by country, test, and ASN. The 30-day ASN distribution and shares in this post come from it. Its `since` and `until` accept dates only, and passing a time returns a `date_from_datetime_inexact` error, so it suits day-level trends and coarser.
- **Measurements API**: `https://api.ooni.org/api/v1/measurements`, also unauthenticated, accepts second-precision windows and returns individual records. The central Taiwan 30-minute table in this post comes from it.
- **AWS S3 public dataset**: `ooni-data-eu-fra`, raw per-measurement JSON, for research needing measurement internals or large-scale analysis. Raw data is uploaded in hourly batches, landing in S3 with a lag of roughly half an hour to an hour or two. Access paths and CSV output formats are documented in [ASN observation data extraction and analysis](../../community/asn-coverage-howto.md), along with the community-maintained tooling.

For this drill specifically, a 30-minute window needs the measurements endpoint: `probe_cc=TW`, `test_name=ndt` (or `dash`), `since=2026-08-13T06:00:00Z`, `until=2026-08-13T08:00:00Z`. Each returned record carries `probe_asn`, which you then group into `24158`, `17421`, and `9674`. All times are UTC, which is Taipei time minus eight hours. To work out which test answers a given question, the [OONI nettest reference](../../community/ooni-nettests-map.md) lists what each test measures, its spec status, and whether Taiwan has data for it.

Two things to keep in mind when using this data.

The most common misreading is treating an anomaly as a block. OONI's `anomaly` flag only means a test did not complete as expected, and the causes include censorship, an unstable network, a transient ISP fault, and bugs in the test itself, so treating anomaly rates as blocking rates produces false accusations. Over the 30 days from 2026-07-12 to 2026-08-12 the `tor` test recorded `16.3%` in Canada (n=14,042), `22.1%` in Switzerland (n=3,231), and `20.1%` in New Zealand (n=562), none of which censor. That window differs from the 90-day one used for `ndt` and `dash` in the previous paragraph, so re-running these figures needs the 30-day parameters. Mid-range values are noise, and only the extreme high end corresponds to reality.

That applies only to tests that perform blocking determination. The performance tests have almost no `anomaly` logic implemented in the backend: worldwide over the last 90 days, 200,000 `ndt` measurements and 198,000 `dash` measurements both return an anomaly count of 0. To judge whether this drill throttled anything, read the throughput values directly rather than the `anomaly` flag.

On licensing, OONI's published measurement data is CC BY-NC-SA 4.0, which prohibits commercial use and requires derivative works to be released under the same licence. Cite the source when quoting figures, and note that merging OONI data with other sources into a new dataset brings the whole result under that licence.

Exercise details follow the [Executive Yuan announcement](https://www.ey.gov.tw/Page/9277F759E41CCD91/66c2bed1-6ca3-4c30-ba7c-4fa0f90e00ec){target="_blank"} and each carrier's own notice. If the schedule changes, the official announcements take precedence.

---

**Sources**: OONI aggregation and measurements API (query parameters in the Data and assumptions section above, measurement data licensed [CC BY-NC-SA 4.0](https://github.com/ooni/license/blob/master/data/LICENSE.md){target="_blank"}); ASN names from [RIPEstat](https://stat.ripe.net/){target="_blank"}; M-Lab data handling from the [M-Lab privacy policy](https://www.measurementlab.net/privacy/){target="_blank"}. Official and media sources for the exercise are in the footnotes below.

[^1]: [2026 Urban Resilience (Air Defence) Exercise: mobile network throttling drill](https://www.ey.gov.tw/Page/9277F759E41CCD91/66c2bed1-6ca3-4c30-ba7c-4fa0f90e00ec){target="_blank"} - Executive Yuan
[^2]: [NCC urges preparation for offline scenarios ahead of the resilience exercise throttle](https://www.cna.com.tw/news/ahel/202607220157.aspx){target="_blank"} - CNA
[^3]: [2026 Urban Resilience (Air Defence) Exercise schedule](https://adma.mnd.gov.tw/unit/100005/8182){target="_blank"} - All-out Defense Mobilization Agency
[^4]: [Notice on mobile network throttling in central and northern Taiwan for the 2026 Urban Resilience air defence exercise](https://www.taiwanmobile.com/csonline/service/ann/ann3_20260722_103509.html){target="_blank"} - Taiwan Mobile
[^5]: [2026 Urban Resilience (Air Defence) Exercise mobile network throttling drill](https://www.cht.com.tw/home/consumer/customer-service/announce/urban-resilience-exercise){target="_blank"} - Chunghwa Telecom
[^6]: [#KeepItOn](https://www.accessnow.org/campaign/keepiton/){target="_blank"} - Access Now
[^7]: [Submarine cable fault status](https://moda.gov.tw/major-policies/subseacable/fault/1749){target="_blank"} - Ministry of Digital Affairs
