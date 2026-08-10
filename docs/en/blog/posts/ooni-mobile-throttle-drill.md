---
date: 2026-08-11
authors:
    - anoni-net
categories:
    - Community
    - OONI
slug: ooni-mobile-throttle-drill
image: "assets/images/og_home.png"
summary: "On Thursday 13 August at 14:30, mobile networks across seven counties in northern Taiwan will be throttled for 30 minutes as part of a national civil-defence exercise. The government published the time and the area, but not the target speed. Taiwan's OONI data is dominated by fixed-line broadband: HiNet alone accounts for 39.5% of measurements, all three mobile carriers together for 3.6%, and FarEasTone has produced 4 performance measurements in the last 30 days. During the identical drill in central Taiwan on 10 August, not one performance measurement was recorded on a mobile network anywhere in the country. Here is what to run, why all three carriers matter, and what this dataset is good for."
description: "On Thursday 13 August at 14:30, mobile networks across seven counties in northern Taiwan will be throttled for 30 minutes as part of a national civil-defence exercise. The government published the time and the area, but not the target speed. Taiwan's OONI data is dominated by fixed-line broadband: HiNet alone accounts for 39.5% of measurements, all three mobile carriers together for 3.6%, and FarEasTone has produced 4 performance measurements in the last 30 days. During the identical drill in central Taiwan on 10 August, not one performance measurement was recorded on a mobile network anywhere in the country. Here is what to run, why all three carriers matter, and what this dataset is good for."
---

# A Pre-announced 30-Minute Throttle: Help Measure Taiwan's Mobile Networks on Thursday

![Measuring Taiwan's mobile network throttling drill](./assets/images/og_home.png){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

At 14:30 on Thursday 13 August, mobile networks in Keelung, Taipei, New Taipei, Taoyuan, Hsinchu City, Hsinchu County, and Yilan will be throttled for thirty minutes. It is part of Taiwan's Urban Resilience Exercise, executed simultaneously by all three major carriers. The official announcements state that voice calls, SMS, and cell broadcast continue to work, and that the throttle bites on high-bandwidth services: video streaming, video calls, mobile payments, cloud sync. What the announcements do not state is the target speed. Chunghwa Telecom's notice contains no throughput figure anywhere, and neither does the Executive Yuan's. Right now, only the three carriers know what those thirty minutes actually look like.

<!-- more -->

## The central Taiwan drill already showed what happens

The same throttle ran in seven central counties on 10 August, 14:30 to 15:00. After it ended, we queried OONI's public database for what Taiwan had recorded during that window.

| Test | Measurements, whole country | Network |
|---|---|---|
| `ndt` (connection speed) | 1 | AS131584 Taiwan Intelligent Fiber Optic Network, fixed line |
| `dash` (video streaming quality) | 1 | same fixed-line ASN |
| `web_connectivity` (site reachability) | 803 | almost entirely fixed line, 593 of them HiNet |

Chunghwa Telecom Mobile (AS17421) recorded zero. FarEasTone (AS9674) recorded zero.

The single speed measurement ran over fixed fibre, and fixed lines were explicitly unaffected by the drill, so what it measured was a network where nothing happened. Those thirty minutes in central Taiwan produced no independent observation at all. The exercise ended, bandwidth returned, and the event is now unrecoverable.

Thursday is the last drill in this exercise.

## Taiwan's OONI data is 39.5% one ISP

That result is not surprising. It reflects the long-running shape of OONI data in Taiwan. Over the last 30 days the country produced 658,037 `web_connectivity` measurements across 25 ASNs:

| Network | Measurements, 30 days | Share |
|---|---|---|
| AS3462 HiNet | 259,987 | 39.5% |
| All three mobile carriers | 23,451 | 3.6% |
| 　└ AS24158 Taiwan Mobile | 20,481 | |
| 　└ AS17421 Chunghwa Telecom Mobile | 2,375 | |
| 　└ AS9674 FarEasTone | 595 | |

Most of the remaining 60% is also fixed line: Taiwan Intelligent Fiber Optic Network, StarVerse, and DaDa Broadband each contribute tens of thousands, alongside several university campus networks.

For the performance tests this drill actually calls for, the numbers get much smaller. The last 30 days produced 1,025 `ndt` measurements nationwide, of which Chunghwa Telecom Mobile accounts for 16 and FarEasTone for 4. Against 658,037 `web_connectivity` measurements in the same period, performance measurement density is roughly 15 per 10,000.

So any current statement about "the state of Taiwan's network" rests on data that mostly describes residential fixed broadband. Taiwan has over 30 million mobile subscriptions, and most people spend the larger part of their day online through a mobile network. That half of the picture is close to absent from public measurement data.

There is a further complication. Taiwan Mobile operates both mobile and fixed-line services, and so does Chunghwa Telecom, so a measurement tagged AS24158 cannot be sorted into "phone" or "home router" from the data alone. Running measurements deliberately, at a known time and under a known condition, is what produces cleanly labelled data that holds up later.

## Why all three carriers, and why together

Mobile measurements are normally hard to compare. Users sit on different cells, in different places, at different times, so a throughput difference between two carriers can come from almost anything. Comparing carrier behaviour needs a moment when all three face the same condition at the same time.

Thursday at 14:30 is exactly that moment. One thirty-minute window, one set of counties, one administrative instruction, and three carriers each implementing the throttle in their own way. Nobody has published how each carrier does it, what target they throttle to, or whether the three are consistent with one another. There is one way to find out: users on all three networks measuring simultaneously, with OONI tagging every measurement with its ASN automatically.

One carrier measured densely still yields one curve. Three measured together yields a comparison.

## What this dataset is good for

**A throttling dataset with a reliable ground-truth timestamp.** The hardest part of studying network throttling is not knowing when it started, when it stopped, or how far it reached. In most cases users notice slowness first and researchers reconstruct the timeline afterwards, leaving the boundaries permanently fuzzy. Here the government pre-announced the date, the window, the counties, and the carriers, and the thirty-minute edges are sharp. Samples with that kind of ground truth are rare in public datasets, and they are useful to researchers working with OONI and M-Lab data well beyond Taiwan.

**A baseline for Taiwan's mobile networks.** Once normal and throttled conditions are both on record, an unexpected degradation in the future has something to be compared against. Without a baseline, any future anomaly stops at "it felt slow".

**Independent verification of a public claim.** The announcements say voice, SMS, and text transmission keep working and only high-bandwidth services degrade. Where that line actually falls is an empirical question, and answering it takes independent measurement. Civil society being able to check the real effect of a public measure is itself part of resilience.

**A look at whether circumvention tools survive.** Whether Tor and Psiphon can still establish connections when bandwidth is squeezed is a long-standing question for this community, and this half hour is a ready-made test bed.

## Three things to do on Thursday

**One: turn Wi-Fi off and use mobile data.** Get this wrong and everything else is wasted. Fixed lines and Wi-Fi are entirely unaffected by the drill, which is precisely how the single measurement from the central Taiwan window was thrown away.

**Two: run OONI Probe's built-in Performance card.** Open the app, pick the Performance card, tap run. That card contains `ndt` and `dash`, which are the two tests this needs, and it is present on both Android and iOS.

!!! tip "Do not use an OONI Run link"

    The instinct is to share an [OONI Run v2](../../tools/ooni-run-v2.md) link. Please do not, this time. OONI Run v2 is currently Android-only, so iOS users cannot open it. The built-in Performance card exists on both platforms, so pointing people at that card is both simpler and wider.

**Three: run it three times, not once.**

| Time | Purpose |
|---|---|
| 14:15 | baseline, before the throttle |
| 14:35 | during the throttle |
| 15:10 | after recovery |

Without the 14:15 baseline, the number measured at 14:35 has nothing to be compared against, and therefore means nothing.

If you have not installed it yet, [OONI Probe](https://ooni.org/install/){target="_blank"} is free and open source, available on the App Store, Google Play, and F-Droid. If the tool is new to you, [OONI's own introduction](https://ooni.org/about/){target="_blank"} is a good starting point.

!!! warning "Failed uploads during the throttle are expected"

    Results have to be uploaded, and bandwidth is deliberately constrained during the window, so the upload may stall or fail. There is no need to run the test again. OONI Probe queues results and submits them automatically once the network recovers.

If you want to do more, add a run of the Circumvention card at 14:35. It includes Tor and Psiphon connectivity tests, which will show whether the throttle reaches circumvention tools.

## What to know about privacy

OONI measurements are all public. They include the ASN you are on and a timestamp, and they do not include your personal IP address. ASN plus timestamp can narrow down your rough location and your carrier. This is a pre-announced public exercise and the participants are ordinary users across seven northern counties, so exposure is low. It still needs saying plainly, and whether to leave that record is your decision.

## Using OONI as research evidence, after this

This campaign is one specific event, but the method is reusable. OONI data has three entry points, and they serve quite different purposes:

- **[OONI Explorer](https://explorer.ooni.org/){target="_blank"}**: a web interface, good for inspecting individual measurements and viewing trends for a country or ASN, with no code required.
- **Aggregation API**: `https://api.ooni.org/api/v1/aggregation`, no authentication and no key, sliceable by country, test, ASN, and time. Every figure in this post came from it.
- **AWS S3 public dataset**: `ooni-data-eu-fra`, raw per-measurement JSON, for research that needs measurement internals or large-scale analysis. Access paths and CSV output formats are documented in [ASN observation data extraction and analysis](../../community/asn-coverage-howto.md), along with the community-maintained extraction tooling.

To work out which test answers a given question, the [OONI nettest reference](../../community/ooni-nettests-map.md) lists what each test measures, its spec status, and whether Taiwan has data for it.

Two things to keep in mind when using this data.

**An anomaly is not a block.** OONI's `anomaly` flag only means a test did not complete as expected, and the causes include censorship, an unstable network, a transient ISP fault, and bugs in the test itself. Treating anomaly rates as blocking rates produces false accusations. In the last 30 days the `tor` test recorded 21.2% in Canada, 22.2% in Switzerland, and 41.1% in New Zealand, none of which censor. Mid-range values are noise, and only the extreme high end corresponds to reality.

**The licence is CC BY-NC-SA 4.0.** OONI's published measurement data prohibits commercial use, and derivative works must be released under the same licence. Cite the source when quoting figures, and note that merging OONI data with other sources into a new dataset brings the whole result under that licence.

## Join in

What it takes is three taps at three moments on Thursday afternoon. At the current density, ten phones per carrier would already be an order-of-magnitude improvement.

Please pass this on to anyone living or working in the seven northern counties, particularly Chunghwa Telecom and FarEasTone subscribers, whose networks have almost no performance measurements at all. If you have questions or want to help analyse the results, [get in touch](../../contact.md) or see [how to contribute](../../community/how-to-contribute.md).

Exercise details follow the [Executive Yuan announcement](https://www.ey.gov.tw/Page/9277F759E41CCD91/66c2bed1-6ca3-4c30-ba7c-4fa0f90e00ec){target="_blank"} and each carrier's own notice. If the schedule changes, the official announcements take precedence.

---

**Sources**: OONI aggregation and measurements API (queried 2026-08-10, measurement data licensed [CC BY-NC-SA 4.0](https://github.com/ooni/license/blob/master/data/LICENSE.md){target="_blank"}); ASN names from [RIPEstat](https://stat.ripe.net/){target="_blank"}; exercise details from the [Executive Yuan](https://www.ey.gov.tw/Page/9277F759E41CCD91/66c2bed1-6ca3-4c30-ba7c-4fa0f90e00ec){target="_blank"} and [Chunghwa Telecom's drill notice](https://www.cht.com.tw/home/consumer/customer-service/announce/urban-resilience-exercise){target="_blank"}.
