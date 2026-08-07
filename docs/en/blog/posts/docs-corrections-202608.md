---
date: 2026-08-07
authors:
    - anoni-net
categories:
    - News
    - Community
slug: docs-corrections-202608
image: "assets/images/post-update.png"
summary: "Between 27 July and 7 August the docs site merged 45 pull requests, and a sizeable share of them fixed things we had already published. A distribution drawn from 40 samples was overturned by the full dataset, three legal claims we could not source were withdrawn, a 2FA app we recommended had changed owners, and most English readers were landing on redirect stubs. Here is the correction log, plus two community contributors we want to thank."
description: "Between 27 July and 7 August the docs site merged 45 pull requests, and a sizeable share of them fixed things we had already published. A distribution drawn from 40 samples was overturned by the full dataset, three legal claims we could not source were withdrawn, a 2FA app we recommended had changed owners, and most English readers were landing on redirect stubs. Here is the correction log, plus two community contributors we want to thank."
---

# Retracting what we published: a correction log from the past two weeks

![Correction log for the docs site](./assets/images/post-update.png){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

Between 27 July and 7 August the docs site merged 45 pull requests and added 45 pages across three languages. The additions are visible on the site itself. The half that rarely gets written up is the other one: changing content that was already live, and in some cases withdrawing it entirely.

<!-- more -->

## The code caught up, and the docs turned out to be wrong

[Reading an OONI measurement](../../community/ooni-data-format.md) had said from day one that the smallest useful step was to also read `test_keys.blocking` during line-by-line parsing, which would extend the statistics from measurement counts to per-ASN anomaly distributions. The code never did it, and that was the one place where our documentation described something we had not built. Adding the field tally in early August immediately contradicted another page on the site.

[How OONI decides a site is blocked](../../community/ooni-blocking-determination.md) had reported a sample of 40 anomalous measurements: 31 `dns`, 6 `tcp_ip`, 3 `http-failure`, 0 `http-diff`, and concluded from that sample that Taiwan showed no block-page redirection pattern. Recomputing over the full 24 hours preceding 2026-08-05 (22,105 measurements) broke both claims:

| Determination | Count | Share |
|---|---:|---:|
| `false` | 21,029 | 95.13% |
| `none` | 512 | 2.32% |
| `tcp_ip` | 312 | 1.41% |
| `dns` | 150 | 0.68% |
| `http-failure` | 67 | 0.30% |
| `http-diff` | 35 | 0.16% |

`tcp_ip` runs to more than twice `dns`, and `http-diff` does occur. The fault was in where those 40 rows came from: the anomaly listing of the measurements API, which has its own ordering and is unreliable as a random sample. The page now carries a warning admonition recording the correction, because the same trap is easy for anyone else to fall into.

Taiwan's `http-diff` cases are a different phenomenon from Indonesian block pages. Across 15 measurements sampled from a four-hour window, `body_proportion` fell between `0.004` and `0.21`, meaning the Probe received far less content than the control, the opposite of a block page approaching `1`. Establishing the cause requires going through the evidence layer measurement by measurement, so the page reports the observed pattern without drawing a conclusion.

## If the source cannot be found, the claim comes out

The Asia travel page was re-verified in early August, and six parallel fact-checking passes led to three claims being withdrawn.

- **A Hong Kong border unlocking power effective 30 March "without requiring national security suspicion."** The claim appeared only on travel-information aggregators, which contradicted each other on the effective date (28 vs 30 March) and the penalty (6 months vs 1 year). The government gazette, Department of Justice materials and first-line media had no matching text. The page now cites only the 23 March national security amendment (`Legal Notice 27 of 2026`) and states why the other claim was not accepted.
- **eSIMs bought outside Japan falling outside the new rules.** Mori Hamada & Matsumoto explicitly notes that this point is "not stated in the documents." It had been written up as advice a reader could rely on.
- **Malaysia's ONSA processing more than 1,500 posts in its first week.** The 1,583 figure in the original source is the total of hate-content takedown requests from 1 January to 30 November 2025, predating ONSA taking effect.

The same pass replaced the source for the South Korea section. The Cybernews article originally cited carries no byline and no citations, and the site has a disclosed relationship with a VPN alliance. It was replaced with Lumen Database `#73101162` and The Korea Times, and an outdated "200,000 cases" figure became 356,945 cases reviewed in 2024. Hong Kong moved from medium to high risk.

The English edition carries a different article on the same subject, [Device minimization and border crossings in Asia](../../scenarios/asia-travel.md), which received the Hong Kong correction and the corresponding footnote.

## A page contradicting itself

The overview page of the [Interactive](../../games/index.md) section was fact-checked the day after launch, and four factual errors turned up. Two of them were the document disagreeing with itself.

The text described meteors in the globe view. In the source, `buildSky()` draws only a static starfield and a Milky Way band, and searching for `meteor` and `comet` returned nothing. The bright-headed comets belong to a different piece, onion-rendezvous, and the two had been written up as one. Elsewhere the page presented "two circuits meeting at a middle relay" as a general property of Tor, when it applies only to connections to .onion services, while a project card on the same page described it correctly.

The other two errors were the document disagreeing with the data. "Every data file carries four fields" was false because `cables.json` lacked `sourceUrl` and `licenseUrl`. We chose to complete the data and amend `tools/gen_cables.py` rather than soften the claim. "`tools/` uses only the Python standard library plus curl" had missed that `fix_trunk_land.mjs` is Node and `publish_games_data.sh` is shell.

Three further statements were overstated. "If any step is out of order, anonymity fails" became a more careful formulation, because a broken Tor ordering usually results in a failed connection, and anonymity can also break through traffic correlation or exit monitoring, neither of which involves ordering. The claim that an ASN is "operated by a single provider" was contradicted by a comment in the project's own snapshot generator noting that an ASN can be registered by an individual. "Eighty countries" hard-coded an exact integer that goes stale whenever the snapshot is regenerated, and now reads as approximately eighty with the source snapshot noted.

## A recommended alternative had changed owners

Eight pages answering reader questions went up between late July and early August. A review pass followed, run by three roles in parallel covering structure, line editing and target reader, and it surfaced six problems that could mislead readers.

[Maintaining multiple online identities](../../basics/multiple-identities.md) recommended Raivo as a replacement for Authy. Raivo was acquired by Mobime in July 2023, and the new owner's privacy policy introduced advertising trackers and log collection. The same line also explained that Authy had been discontinued and therefore needed replacing, so the page argued against itself. The revision keeps only Aegis and 2FAS and adds three durable criteria: open source, exportable backups, and no change of ownership.

Two more problems sat on the same page. "Open a fresh account in your existing Gmail without linking a phone" is not achievable in practice, and now explains that mainstream free mail providers require phone verification at sign-up, and that accounts opened from the same device and IP may be linked by the provider anyway. The virtual number section warned only about WhatsApp bans, and now adds two decisive risks: paying by card reconnects the two layers, and recycled numbers get reassigned to someone who can then reset your accounts by SMS.

[How platforms collect your data](../../basics/platform-tracking.md) stated that large-scale research had found no evidence of covert recording, which reads easily as proof that it does not happen. The page now says plainly that finding no evidence and proving absence are separate things, and adds the 2024 Cox Media Group Active Listening pitch deck (Google subsequently removed the company from its partner programme, and the company denied any actual listening).

[Activists and protest digital safety](../../scenarios/activist.md) advised against buying prepaid SIMs under a real identity, which directly contradicted the fourteen-jurisdiction registration table newly added to the travel page, a page the new section pointed readers to twice.

## English readers were landing on redirect stubs

Cloudflare data for the trailing 90 days, excluding subdomains and bots, showed the English edition at 25.9% of docs traffic. Of 440 pageviews, only 70 (16%) reached an actual article, 290 landed on section index pages, and 80 were 404s.

Three causes turned up. Four `redirect_maps` rules had existing English pages as their source, and mkdocs-redirects generates a stub at that path which overwrites the real page, so all four were serving nothing but a redirect screen in production. Three more redirects pointed to section indexes even though the English content existed. The third cause was the navigation restructure of 2026-05-09, whose commit deleted 17 files from `docs/en/` and added none, roughly 115,000 characters, with a configuration comment stating that dropped pages redirect to the nearest live section index.

Five pages were restored based on measured traffic, raising the share of English pageviews reaching a real article from 16% to 64%. Twelve more deleted pages and the remaining 18% of 404s are still outstanding.

## The rule was written down, the tool never implemented it

The contributor handbook says colloquial words should be replaced with formal register, while `docs_style_lint.py` had implemented that rule for exactly one character. A site-wide scan found 605 further instances, and our own tooling reported 0 errors and 0 warnings on that state. With the rule present and the check absent, the content drifts.

The late-July sweep handled 669 instances across 158 files and added six linter rules, all of them warnings, because the right replacement depends on context and a machine should not apply it directly. Two mechanical replacements caused real damage during that sweep, both fixed and added to the exception list:

- "主講" (to give a talk) was rewritten to "主提到", damaging 20 speaker introductions across two language editions of the schedule page. The exception list guarded the character that follows but not the one before.
- "沒搞清楚" (had not understood) became "沒處理清楚" (had not handled cleanly). Understanding and handling are different things.<!-- docs-style-lint: disable-line -->

While closing another pull request in late July, we found that the matching rule covered only traditional characters, leaving the simplified equivalent unchecked, which meant zh-CN effectively had no such rule. Scanning the whole site showed less debt than expected, with only 3 instances needing review and all of them legitimate. The real gain was the first regression test suite, since this linter is the gatekeeper for the site's writing standards and had no tests at all. Incomplete coverage is invisible to manual sampling, because every sample you draw happens to fall inside the covered range. The suite now holds 49 cases, each rule paired with what it must catch and what it must not, in both scripts.

Early August added a density standard for the character 這. The criteria actually used during copy-editing existed only in a commit message, which would not apply the next time someone wrote a new page, so they went into the contributor handbook, and the machine-checkable part became the `zhe-repeat` rule. The 8-character distance threshold was calibrated against 429 pages, and widening it to 10 starts catching legitimate usage. Whole-document density needs semantic judgement and was deliberately left to humans. An earlier site-wide clean-up had already rewritten 266 paragraphs across 99 files.

## Thanks to two community contributors

Two of the 45 pull requests came from community members.

wu858430049 contributed the Simplified Chinese edition of the [BECOME_ANONI](https://anoni.net/docs/zh-cn/community/become-anoni/){target="_blank"} protocol. The canonical file sits in the repository root mirroring the zh-TW layout, and the docs page embeds it through snippets to keep a single source. The same pull request fixed two configuration problems that were blocking the page: `pymdownx.snippets` in `mkdocs_cn.yml` had no `base_path`, and an old redirect rule sent that path to the community index.

ChihChengLiang updated the description of the privacy payments workshop at [COSCUP 2026](../../activity/coscup-2026.md). It had said that no laptop was needed and attendees could simply follow along, when in fact a simulated network and simulated chain are provided on site and participants are encouraged to bring a laptop and work through it. An outdated description leaves people who intended to participate under-prepared.

What both pull requests have in common is that they removed content that would have led readers to a wrong decision. [How to contribute](../../community/how-to-contribute.md) covers the pull request process and the writing standards, and more people are welcome to take part the same way.

## Why publish this at all

The site is about privacy and security, and readers change their behaviour based on what it says. An outdated legal description or a recommendation for an app that has changed hands is a cost the reader carries. When a distribution drawn from a sample is written as a general rule, a reader has no way to tell whether the conclusion came from 40 measurements or 22,105.

The same period also added eight pages answering reader questions, four OONI technical documents, a Taiwan infrastructure layer in the Interactive section, and a .onion build variant in CI, all of which are on the site. If you find something that does not match the facts, open an issue on [GitHub](https://github.com/anoni-net/docs/issues){target="_blank"} or send a pull request, and we will verify and update.

## Related reading

- [How OONI decides a site is blocked](../../community/ooni-blocking-determination.md)
- [Device minimization and border crossings in Asia](../../scenarios/asia-travel.md)
- [Maintaining multiple online identities](../../basics/multiple-identities.md)
- [How to contribute](../../community/how-to-contribute.md)
