---
date: 2026-08-10
authors:
    - anoni-net
categories:
    - News
    - Community
slug: docs-corrections-202608
image: "assets/images/post-update.png"
summary: "Hong Kong moved from medium to high risk for device inspection, the exemption for eSIMs bought outside Japan was withdrawn, a 2FA app we recommended had changed owners, and a distribution drawn from 40 samples was overturned by the full dataset. The docs site merged 50 pull requests between 27 July and 10 August, a sizeable share of them fixing what we had already published. Here is what changed on each page, the evidence behind it, and the five things to do if you followed the old guidance."
description: "Hong Kong moved from medium to high risk for device inspection, the exemption for eSIMs bought outside Japan was withdrawn, a 2FA app we recommended had changed owners, and a distribution drawn from 40 samples was overturned by the full dataset. The docs site merged 50 pull requests between 27 July and 10 August, a sizeable share of them fixing what we had already published. Here is what changed on each page, the evidence behind it, and the five things to do if you followed the old guidance."
---

# Retracting what we published, and what changed on the docs site in the past two weeks

![What changed on the docs site](./assets/images/post-update.png){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

Several pages changed over the past two weeks, and in most cases the change was to withdraw a passage rather than extend it. Hong Kong moved from medium to high risk for device inspection, the exemption for eSIMs bought outside Japan came out, a 2FA app we recommended turned out to have changed owners, and a blocking distribution drawn from 40 samples was recomputed over all 22,105. The site merged 50 pull requests between 27 July and 10 August, and a sizeable share of them went into corrections of this kind. What follows is page by page: what changed, what the evidence was, and a checklist in the middle for anyone who already prepared using the old guidance.

<!-- more -->

## Three claims withdrawn from the Asia travel guidance

We re-verified the Asia travel guidance in early August, and six independent fact-checking passes led us to withdraw three claims from the Traditional Chinese edition. The English edition is a separately curated article, [Device minimization and border crossings in Asia](../../scenarios/asia-travel.md), which received the Hong Kong correction and its footnote.

- **A Hong Kong border unlocking power effective 30 March "without requiring national security suspicion."** What we withdrew is the scope qualifier. The claim appeared only on travel-information aggregators, which contradicted each other on the effective date (28 vs 30 March) and the penalty (6 months vs 1 year), and the government gazette, Department of Justice materials and primary news reporting had no matching text. The 23 March national security amendment (`Legal Notice 27 of 2026`) itself is verifiable: in a national security investigation the authorities can demand a device password, refusal is a criminal offence, and travellers who merely clear immigration while transiting Hong Kong are covered.
- **eSIMs bought outside Japan falling outside the new rules**: Mori Hamada & Matsumoto explicitly notes that this point is "not stated in the documents," and we had written it up as advice a reader could rely on. The page now says that whether overseas providers are covered is left to a future ministerial ordinance, and that no one should travel on the assumption that an eSIM bought abroad is exempt.
- **Malaysia's ONSA processing more than 1,500 posts in its first week**: The 1,583 figure in the original source is the total of hate-content takedown requests from 1 January to 30 November 2025, which predates ONSA coming into force. The number was wrong, the law is not: the page keeps the Online Safety Act's January 2026 commencement, its scope over platform operators, and the practical effect of faster content removal.

The same pass replaced the source for the South Korea section. The Cybernews article originally cited carries no byline and no citations, and the site has a disclosed relationship with a VPN alliance. We replaced it with Lumen Database `#73101162` and The Korea Times, and an outdated "200,000 cases" figure became 356,945 cases reviewed in 2024.

Hong Kong also moved from medium to high risk for device inspection, on the strength of the same verifiable decryption obligation. Withdrawing an exaggerated claim while raising the risk level looks contradictory, and points at one thing: the obligation is real, only its scope was overstated.

## A 2FA app we recommended had changed owners

[Maintaining multiple online identities](../../basics/multiple-identities.md) recommended Raivo as a replacement for Authy. Raivo was acquired by Mobime in July 2023, and the acquirer's privacy policy introduced advertising trackers and log collection. The same line also explained that Authy's desktop client had been discontinued and therefore needed replacing, so the page argued against itself. The revision keeps only Aegis and 2FAS, and replaces the brand list with three durable criteria: open source, exportable backups, and no change of ownership.

Two more changes landed on the same page. "Open a fresh account in your existing Gmail without linking a phone" is not achievable in practice. The page now explains that mainstream free mail providers require phone verification at sign-up, and that accounts opened from the same device and IP may be linked by the provider anyway. The virtual number section warned only about WhatsApp bans, and now adds two decisive risks: paying by card reconnects the two layers, and recycled numbers get reassigned to someone who can then reset your accounts by SMS.

[How platforms collect your data](../../basics/platform-tracking.md) stated that large-scale research had found no evidence of covert recording, which is easily read as proof that it does not happen. The page now says plainly that finding no evidence and proving absence are separate things, and adds the 2024 Cox Media Group Active Listening pitch deck (Google subsequently removed Cox Media Group from its advertising partner programme, and the company denied any actual listening).

Two further problems were conflicts across pages. [Activists and protest digital safety](../../scenarios/activist.md) advised against buying prepaid SIMs under a real identity, which contradicted the per-jurisdiction SIM registration guidance newly expanded on the travel page, a page the new section pointed readers to twice. [Journalists and source protection](../../scenarios/journalist.md) framed the landline-and-SMS trade-off as permission, and now notes that a case can escalate to the level where call records are obtainable, and that call records are typically retained longer than a case runs.

All six came out of eight pages answering reader questions that went up between late July and early August. A review pass followed, with three reviewers working in parallel on structure, line editing and the target reader.

## If you followed the old guidance

Five of the items above change preparations a reader may already have made. Here is the current position and the action for each.

- **Travel to Hong Kong**: Device inspection moved from medium to high risk, and refusing to hand over a password during a national security investigation is itself a criminal offence. If you prepared at the medium-risk level, raise it to a clean device, and note that this applies even if you are only transiting through Hong Kong.
- **Japanese eSIMs bought abroad**: Drop the assumption that buying outside Japan puts you outside the rules. The law bringing data-only SIMs and eSIMs under identity verification has been published, its commencement is set by ordinance and falls no later than May 2027, and whether overseas providers are covered is still unsettled.
- **If you are already using Raivo**: Move to Aegis or 2FAS. TOTP secrets cannot be transferred directly, so you need to re-enrol each service through its own two-factor settings. Keep the old app until the new one produces correct codes, and confirm your recovery codes are still to hand.
- **Prepaid SIMs**: The registration layer cannot be avoided. What you can do is avoid registering the SIM under the same name as your main number, and decide what that number is used for on that basis.
- **Accounts registered with a virtual number**: Go through those accounts and check their SMS recovery settings, remove any number you no longer hold, and switch to TOTP or recovery codes.

## Taiwan's blocking determination, recomputed over the full dataset

[How OONI decides a site is blocked](../../community/ooni-blocking-determination.md) draws on OONI, a public measurement project for internet censorship in which volunteers around the world run tests and every result is published. The page had reported a sample of 40 anomalous measurements (31 `dns`, 6 `tcp_ip`, 3 `http-failure`, 0 `http-diff`) and concluded from that sample that Taiwan showed no block-page redirection pattern. Recomputing over the full 24 hours preceding 2026-08-05 (22,105 measurements) broke both the distribution and the sampling method behind it:

| Determination | Count | Share |
|---|---:|---:|
| `false` | 21,029 | 95.13% |
| `none` | 512 | 2.32% |
| `tcp_ip` | 312 | 1.41% |
| `dns` | 150 | 0.68% |
| `http-failure` | 67 | 0.30% |
| `http-diff` | 35 | 0.16% |

`tcp_ip` is more than twice as common as `dns`, and `http-diff` does occur, 35 times. The fault was in where those 40 rows came from: the anomaly listing of the measurements API, which has its own ordering and is unreliable as a random sample. The page now carries a warning box recording the correction, because the same trap is easy for anyone else to fall into.

What the recomputation overturned was the distribution and the sampling method. The conclusion itself, that Taiwan shows no block pages, still holds. Fifteen of those 35 `http-diff` cases were sampled from a four-hour window, and `body_proportion` (how much of the content the Probe received matches the control) fell between `0.004` and `0.21`. The Probe received far less content than the control, the opposite of a block page approaching `1`. Establishing the cause requires going through the evidence layer measurement by measurement, so the page reports the observed pattern without drawing a conclusion.

The recomputation became possible because the field tally was finally implemented. [Reading an OONI measurement](../../community/ooni-data-format.md) had said from day one that the smallest useful step was to also read `test_keys.blocking` during line-by-line parsing, which would extend the statistics from measurement counts to per-ASN anomaly distributions. (An ASN, or autonomous system number, identifies a block of IPs run by one operator or organisation.) The code never did it, and that was the one place where our documentation described something we had only written down. Adding it in early August contradicted the page above as soon as the first results came out.

## Seven corrections on the Interactive overview page

The overview page of the [Interactive](../../games/index.md) section was fact-checked the day after launch, and seven problems turned up: four factual errors and three overstatements.

In two of the four, the document disagreed with itself. The text described meteors in the globe view, when `buildSky()` draws only a static starfield and a Milky Way band and searching for `meteor` and `comet` returned nothing. The bright-headed comets belong to a different piece, onion-rendezvous, and the document had written the two up as one. Elsewhere it presented "two circuits meeting at a middle relay" as a general property of Tor, when it applies only to connections to .onion services, while a project card on the same page described it correctly.

The other two were disagreements between the document and the data. "Every data file carries four fields" was false because `cables.json` lacked `sourceUrl` and `licenseUrl`. We chose to complete the data and amend `tools/gen_cables.py` rather than soften the claim. "`tools/` uses only the Python standard library plus curl" had missed that `fix_trunk_land.mjs` is Node and `publish_games_data.sh` is shell.

Three statements were overstated:

- **"If any step is out of order, anonymity fails."** Anonymity can break through traffic correlation or exit monitoring, neither of which involves ordering, while a broken Tor ordering usually just results in a failed connection. The original narrowed the failure conditions to ordering alone, and now reads more carefully.
- **An ASN being "operated by a single provider."** The claim was contradicted by a comment in the project's own snapshot generator, which notes that an ASN can be registered by an individual.
- **"Eighty countries."** Hard-coding an exact integer goes stale whenever the snapshot is regenerated, so it now reads as approximately eighty with the source snapshot noted.

## Most English readers never reached an article

Cloudflare data for the trailing 90 days, excluding subdomains and bots, showed the English edition at 25.9% of docs traffic. Of 440 pageviews, only 70 (16%) reached an actual article, 290 landed on section index pages, and 80 were 404s.

Three causes turned up, two in the redirect configuration and one in an earlier navigation restructure. Four `redirect_maps` rules had existing English pages as their source, and the build tool generates a stub at that path which overwrites the real page, so all four were serving nothing but a redirect screen in production. Three more redirects pointed to section indexes even though the English content existed. The third cause was the navigation restructure of 2026-05-09, whose commit deleted 17 files from `docs/en/` and added none, roughly 115,000 characters, with a configuration comment stating that dropped pages redirect to the nearest live section index.

Five pages were restored based on measured traffic, raising the share of English pageviews reaching a real article from 16% to 64%. The four stub-covered pages were the smallest part of the problem, with index pages and 404s accounting for most of it, and twelve more deleted pages and the remaining 18% of 404s are still outstanding.

## Six new automated checks on the writing standards

The errors in the sections above share an upstream cause: when a standard is written but nothing enforces it, the content keeps drifting until someone reads it. Our writing standards say colloquial words should be rewritten in a formal register, while `docs_style_lint.py` had implemented that rule for exactly one character. A site-wide scan found 605 further instances of other colloquial words, and our own tooling reported `0 errors` and `0 warnings` on that state. (The full standard is maintained in the [Traditional Chinese contributor handbook](https://anoni.net/docs/community/contributor-handbook/){target="_blank"}.)

Counting the one character the tool already caught, the late-July sweep handled 669 instances across 158 files and added six linter rules, all of them warnings, because the right replacement depends on context and a machine should not apply it directly. Two mechanical replacements caused real damage during that sweep, both fixed and added to the exception list: 20 speaker introductions on the schedule page were mangled across two language editions, and a phrase meaning "had not understood" was turned into one meaning "had not handled cleanly."

While closing another pull request the same week, we found that the matching rule covered only traditional characters, leaving the simplified equivalent unchecked, which meant zh-CN effectively had no such rule. Scanning the whole site showed less debt than expected, with only 3 instances needing review and all of them legitimate. The real gain was the first regression test suite, since this linter was the only automated check on the site's writing standards and had no tests at all. Incomplete coverage is invisible to manual sampling, because every sample drawn happens to fall inside the covered range.

An earlier site-wide clean-up had already rewritten 266 paragraphs across 99 files for overuse of the character 這. In early August we added the density standard behind it, because the criteria actually used during copy-editing existed only in a commit message and would not apply the next time someone wrote a new page. They went into the contributor handbook, and the machine-checkable part became the `zhe-repeat` rule. The 8-character distance threshold was calibrated against 429 pages, widening it to 10 would start catching legitimate usage, and whole-document density needs semantic judgement and was deliberately left to humans.

## Two pages had drifted from their own current state

The [personal privacy guide](https://anoni.net/docs/community/privacy-guide/){target="_blank"} (the Mandarin edition) gained a "related articles" index on 6 August, and the progress section further down was never updated to match, so one page said two different things. The index listed eight concept-layer articles while the section below still read "five concept-layer articles published" and listed only the original five. The per-layer indexes had fallen behind as well: 18 tools articles with 7 listed, 10 scenario articles with 5, 5 advanced articles with 2. Fourteen were added back.

The same page lists four common misconceptions in a way that reads as though none had been started. Two were already written and simply never linked: "VPN ≠ anonymity" has a full article in the [VPN guide](../../tools/vpn-guide.md), and "decentralised ≠ anonymous" is covered for IPFS, Yggdrasil, DN42 and I2P in [Networks mistaken for anonymity](../../advanced/mistaken-for-anonymity.md). The other two have genuinely not been started, and the page now says so.

[Help pin the site's IPFS mirror](../../community/pin-ipfs-mirror.md) had three passages that no longer matched reality, two of them found by readers who actually followed the instructions.

The macOS section said `brew install ipfs`. The Homebrew formula has since been renamed to `kubo`. The old name still installs it, but `brew services` matches on the real formula name, so anyone who installed via the old instructions and then tried to set up a persistent daemon hit a name mismatch. The persistence advice said only "use `brew services` or launchd" without giving a command, when the formula itself already defines a service and `brew services start kubo` keeps it resident and starts it at login.

The second was a contributor who wanted to configure the community node as a fixed peer and put the page's IPNS name into kubo's `Peering.Peers`, which the tool rejected outright. The page explained CID and IPNS names and never mentioned the node's own Peer ID. All three identifiers look alike: the base36 form of the node Peer ID shares its first 12 characters with the site's IPNS name, both being public-key fingerprints in the same encoding, one pointing at content that changes and the other at a machine. The page now carries a comparison table for all three, plus an optional peering section.

The third was the opening line, "right now only the community's own node does". A DHT lookup found another provider serving the site's content from a third-party network, either someone else's mirror or a public gateway that had fetched the content and announced it. Either way the sentence no longer held, and it now reads that few nodes currently serve the mirror, with the community's own carrying most of it. No exact count is given, because `findprovs` is best-effort and returns whatever it finds before the query times out, so "only N" would be its own kind of inaccuracy.

## A white strip on narrow screens traced back to the language switcher

A reader reported a blank strip appearing to the right of the pinned announcement. Measurement showed the announcement was not the cause: with it hidden entirely, `documentElement.scrollWidth` still exceeded the viewport by 14px. Hiding candidate elements one at a time located the language switcher in the header, where the Chinese labels give the collapsed menu a width of 177px. On narrow screens the button sits close to the right edge, so the menu pushes the layout outwards. The announcement's dark background and the header's blue are only as wide as the viewport, so scrolling right exposes white underneath. The breakpoint falls exactly at 960px, where the header switches to its desktop layout. The fix anchors the menu to the button's right edge below that breakpoint and leaves the desktop centring alone. The same change raised the contrast of links inside the pinned announcement in light theme, previously `2.79:1` against the dark background.

Separately, two GitHub Actions were still on the Node 20 runtime, and the runner printed a deprecation warning on every run. `actions/cache` went from v4 to v6 and `actions/setup-node` from v4 to v7, with the release notes read version by version first to confirm that neither set of breaking changes reaches how this project uses them.

## Thanks to two community contributors

Two of the 50 pull requests came from community members.

[wu858430049](https://github.com/wu858430049){target="_blank"} contributed the Simplified Chinese edition of the [BECOME_ANONI](https://anoni.net/docs/zh-cn/community/become-anoni/){target="_blank"} protocol. The canonical file sits in the repository root mirroring the zh-TW layout, the docs page embeds it through snippets to keep a single source, and the same pull request fixed two configuration problems that were preventing the page from rendering. Translation is a long-standing gap here, with many pages still missing a Simplified Chinese or English counterpart.

[ChihChengLiang](https://github.com/ChihChengLiang){target="_blank"} updated the description of the privacy payments workshop at [COSCUP 2026](../../activity/coscup-2026.md). It had said that no laptop was needed and attendees could simply follow along, so anyone who intended to take part would have arrived under-prepared. A simulated network and simulated chain are in fact provided on site, and participants are encouraged to bring a laptop and work through it. That contribution required no code at all, only knowing what the workshop actually looks like and being willing to rewrite a paragraph.

Both pull requests removed content that would have led readers to a wrong decision. The lowest-effort way in is to open an issue naming the sentence that is wrong and the source you found. To change the content yourself, [How to contribute](../../community/how-to-contribute.md) covers choosing and claiming a topic, the pull request process, and what a good pull request looks like.

## The part you cannot check for yourself

The site is about privacy and security, and readers change their behaviour based on what it says, so the cost of a wrong sentence lands on the reader. The harder part is that readers cannot check for themselves: a distribution drawn from a sample, written up as a general rule, reads exactly like one computed over everything, and no reader can tell whether the conclusion came from 40 measurements or 22,105. So the corrections are published with their reasoning, including the original wording of what was withdrawn and why we did not accept it.

The same period also added a Taiwan infrastructure layer in the [Interactive](../../games/index.md) section, four [OONI technical documents](../../community/ooni-data-format.md), and a .onion build variant in CI. If you find something that does not match the facts, open an issue on [GitHub](https://github.com/anoni-net/docs/issues){target="_blank"} or send a pull request, and we will verify and update.

## Related reading

- [How OONI decides a site is blocked](../../community/ooni-blocking-determination.md): the page the full dataset overturned, now carrying a warning box about this correction
- [Reading an OONI measurement](../../community/ooni-data-format.md): the version after the field tally was completed
- [Device minimization and border crossings in Asia](../../scenarios/asia-travel.md): current guidance after the Hong Kong correction
- [Maintaining multiple online identities](../../basics/multiple-identities.md): TOTP app guidance is now criteria-based rather than brand-based
- [Help pin the site's IPFS mirror](../../community/pin-ipfs-mirror.md): the three-identifier comparison table and the new peering section
