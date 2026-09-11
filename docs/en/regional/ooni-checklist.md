---
title: OONI Website Testing List
description: How the Citizen Lab test list that OONI Probe measures against is maintained, why list quality sets a ceiling on measurement quality, and how volunteers can help review and update a country list. Uses Taiwan's tw.csv as a worked case.
icon: material/list-status
---
# :material-list-status: OONI Website Testing List

To find out whether websites in a country are censored, you first need a list of which websites to test. OONI Probe checks each URL on a pre-defined list every time it runs, so what the list contains, who maintains it, and how often it is updated set a ceiling on what any later analysis can show. A stale list makes a country look uncensored simply because nobody is testing the sites that would fail.

This is a shared problem across every country list, not a Taiwan-specific one. This page uses Taiwan's `tw.csv` as a worked case: how the list works, what shape it is currently in, and how you can help. You can apply the same review to `lists/<your-cc>.csv` for your own country.

<figure markdown="span">
    <a target="_blank"
       href="../../assets/images/ooni_asn.svg">
        <img src="../../assets/images/ooni_asn.svg"
            alt="OONI Probe Testing Process"
            title="OONI Probe Testing Process"
        >
    </a>
    <figcaption>OONI Probe Testing Process</figcaption>
</figure>

When OONI Probe runs a web connectivity test, it checks each site against a pre-defined test list. These lists are maintained by [Citizen Lab](https://citizenlab.ca/){target="_blank"} in the [test-lists](https://github.com/citizenlab/test-lists){target="_blank"} project, and cover both globally popular sites and country-specific ones.

The global list is mostly English-language sites. Country lists are maintained per region in the local language, and cover categories that matter locally. In countries with internet censorship, the country list also includes many sites known to be blocked.

URLs on the list fall into four categories:

1. **Political:** Websites expressing viewpoints that differ from the current government. Content related to human rights, freedom of expression, minority rights, and religious movements is also included.
2. **Social:** Includes topics about gender, gambling, illegal drugs and alcohol, and other subjects that may be considered sensitive or offensive in society.
3. **Conflict and Security:** Covers content related to armed conflicts, boundary disputes, separatist movements, and radical groups.
4. **Internet Tools:** Websites that provide email, cloud storage, search, translation, Voice over IP (VoIP) services, and censorship circumvention methods fall under this category.

## Categories decide how often a URL gets tested

The four categories look like filing labels, but they also determine how often each URL is tested. OONI Probe does not read the CSV directly: it asks the OONI API for an ordered list, and the ordering is computed in [`prio.py`](https://github.com/ooni/backend/blob/master/api/ooniapi/prio.py){target="_blank"} in two stages.

The first stage produces a priority for each URL. OONI maintains a set of rules, each matching on four fields: category, domain, full URL, and country code, where `*` means any. Every rule that matches is summed, rather than overriding the others. The global default rule `*/*/*/*` contributes 50, and the category rule is added on top, so a URL filed under news media (`NEWS`) has a priority of `50 + 100 = 150`, while one filed under e-commerce (`COMM`) has `50 + 20 = 70`.

The current category ladder, with the effective priority after the base of 50:

| Weight | Categories | Effective priority |
|---:|---|---:|
| +120 | `GRP` social networking | 170 |
| +100 | `ANON` anonymization and circumvention, `HUMR` human rights, `LGBT`, `NEWS` news media, `POLR` political criticism | 150 |
| +80 | `COMT` communication tools, `MMED` media sharing, `PUBH` public health, `SRCH` search engines | 130 |
| +60 | `ENV` environment, `HOST` hosting and blogging, `REL` religion, `XED` sex education | 110 |
| +40 | `CULTR` culture, `FILE` file sharing, `GOVT` government, `IGO` intergovernmental organisations | 90 |
| +30 | `ALDR` alcohol and drugs, `DATE` dating, `GMB` gambling, `HATE` hate speech, `MILX` militant groups, `PORN`, `PROV` provocative attire | 80 |
| +20 | `COMM` e-commerce, `CTRL` content control, `ECON` economics, `GAME` gaming, `HACK` hacking tools, `MISC` uncategorised | 70 |

Social platforms and speech-related categories sit at the top, commerce and entertainment at the bottom. The spread between highest and lowest is 2.4x — real, but well short of an order of magnitude.

The second stage divides the priority by the recent measurement count to get the actual sort key:

```
weight = priority / max(msmt_cnt, 0.1)
```

`msmt_cnt` is how many times that URL was measured during the current and previous week, scoped to the same country, or to the same ASN when the probe reports one. The more a URL is measured, the faster its weight decays, pushing it down the list and letting others surface.

The mechanism is therefore reactive. Priority sets a URL's budget; the measurement count spends it. What a high-weight category buys is a faster recovery, not a permanent seat at the front.

## The same rule table responds to sudden events

Beyond the category ladder, the rule table is used in two more ways. The first is pushing a single target to the very front. As of 2026-09, `www.aljazeera.net` has a priority of `9999999` in Israel, `orda.kz` has `99999` in Kazakhstan, `eltoque.com` has `6969` in Cuba, and Twitter, Facebook, Instagram and YouTube all carry `69999` globally. These values are orders of magnitude above the category ladder, which effectively pins the target at the top of every list — usually in response to blocking that is happening, or has just happened.

The second is setting a priority to a negative value to exclude a URL. Entries whose priority is zero or below are skipped and never handed to a probe. The only negative rules currently in place are for Afghanistan, where alcohol and drugs, dating, gambling, hate speech, `LGBT`, militant groups, `PORN` and sex education are all set to `-9999`. The intent is to protect volunteers running measurements locally, so that content which could put them at risk never reaches their network logs.

Taiwan has no country-level rules at all, so every entry in `tw.csv` is scored purely on "50 plus the category weight". That makes getting the category right the only lever available for influencing sampling. A miscategorised URL will not be noticed by anyone: it simply gets tested less often, or more often, than it should. When submitting list corrections, judging the category carefully is worth as much as finding a site worth adding.

The full rule table is available at [`api.ooni.io/api/_/url-priorities/list`](https://api.ooni.io/api/_/url-priorities/list){target="_blank"}, and the design rationale is described in OONI's [Building a smart URL list system](https://ooni.org/post/ooni-smart-url-list-system/){target="_blank"}.

## Current status of the Taiwan test list

Most of the current Taiwan list [tw.csv](https://github.com/citizenlab/test-lists/blob/master/lists/tw.csv){target="_blank"} was added in 2017. Without continuous maintenance, many entries now point to sites that have shut down, moved to a new domain, or are still listed under a dead or `http://`-only URL. Tidying up what is already on the list comes first.

!!! note "http:// → https://"

    Some websites do not redirect `http://` to `https://` automatically (via [`301 Moved Permanently`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301){target="_blank"} or [`308 Permanent Redirect`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/308){target="_blank"}), which produces misleading test errors. TLS certificates are now easy to obtain and encrypted transport is a baseline expectation, so `https://` should be the default form for URLs on the list.

## Updating the list

The first step is to check each site listed in [tw.csv](https://github.com/citizenlab/test-lists/blob/master/lists/tw.csv){target="_blank"} and mark it as needing an update or ready to be dropped. A [pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests){target="_blank"} then goes to [citizenlab/test-lists](https://github.com/citizenlab/test-lists){target="_blank"} with the proposed changes.

!!! info "PR #1444"

    Our community [submitted a list revision](https://github.com/citizenlab/test-lists/pull/1444){target="_blank"} on 28 September 2023. As of August 2026 it is still open and unmerged, with no reviewer activity since December 2024. Anyone who wants to help move it along is welcome to.

## Adding to the list

The list has not had a large-scale revision since it was created in 2017, so it needs a fresh review of which sites are worth adding. Candidates are screened against the four Citizen Lab categories above. This part is still under discussion in the community.

## How volunteers can help

List maintenance is a good entry point for new contributors. It needs no programming. What it does need:

- **An observant internet user's eye:** which sites are being discussed in the country, which have recently shut down, which are new and worth adding
- **Judgement on categories:** sorting candidates against the four Citizen Lab categories
- **Basic GitHub skills:** fork, edit a CSV, open a pull request

Where to start:

- **To help with list maintenance:** say so in the anoni-net public space on Matrix, see [Community](../community/index.md) for how to join. Someone will help you pick a slice to work on.
- **To help with the data analysis side:** see [ASN observation data analysis](./ooni-asn-coverage.md) and [ASN observation data retrieval and analysis](../community/asn-coverage-howto.md)
- **To read the measurement data itself:** see [Reading an OONI measurement](../community/ooni-data-format.md) and [How OONI decides a site is blocked](../community/ooni-blocking-determination.md)
- **To see what gets measured beyond this list:** see [OONI nettest quick reference](../community/ooni-nettests-map.md)
- **To understand how the community works:** see [How to contribute](../community/how-to-contribute.md)

## :fontawesome-solid-diagram-project: Where to go from here

<div class="grid cards" markdown>

- [:material-access-point-network: ASN observation data analysis](./ooni-asn-coverage.md) — what the measurements collected against this list actually cover
- [:material-radar: Regional Observatory](./index.md) — the rest of what we measure and publish
- [:material-chat-question: Why networked freedom matters](../basics/internet-freedom.md)

</div>
