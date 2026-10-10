---
title: About the Docs
description: What the anoni.net Docs cover, how pages are written and reviewed, how the three language editions relate, how corrections work, and how the content is licensed. The community itself is introduced on anoni.net.
icon: material/book-information-variant
---

# :material-book-information-variant: About the Docs

The anoni.net Docs collect what we know about anonymity networks and privacy, from concepts and tools to preparing for specific situations, and track network measurement and regulation in Taiwan and the wider Sinophone Asia-Pacific. Members of the anoni.net community write and maintain the pages, and the source and full edit history are public on [GitHub](https://github.com/anoni-net/docs){target="_blank"}.

Who we are, how to take part and the services we run are on [anoni.net](https://anoni.net/en/about/). This page is about the documentation site itself.

## What the site covers

| Section | What is in it |
|---|---|
| [Start](../start/index.md) | Starting paths by role, from civil society and newsrooms to everyday readers |
| [Guides](../guides/index.md) | Concepts, tools, scenarios, advanced topics and reports, from basic to in-depth |
| [Regional](../regional/index.md) | Network measurement and regulation in Taiwan, and how to read the measurement data |
| [Utilities](../utils/index.md) | Tools that run in your browser and never upload your data |
| [Updates](../blog/index.md) | Community news, translated articles and software changelogs |
| [Run a Node](../community/setup-tor-relay.md) | Setting up Tor relays, bridges, onion services and mirrors |

The region we cover is Mainland China, Hong Kong, Macau, Singapore, Malaysia, Taiwan, and the Chinese-speaking diaspora moving between them. Taiwan is the only place we can speak to first-hand. Everything else rests on public sources and contacts in those places, and pages say so where they rely on second-hand material.

## How pages are written and reviewed

The writing style is set out on the community site's [writing style](https://anoni.net/en/join/writing-style/){target="_blank"} page, and file formats and the pull request flow in the [Contributor Handbook](../community/contributor-handbook.md). Every change goes through a pull request, a linter checks punctuation and phrasing when it is submitted, and a maintainer reviews it before merging.

Contributors may use any AI tool to help with writing or translation, and AI output goes through the same process as anything written by hand. Whoever opens the pull request has to check every number and quotation and open every source link, and is responsible for the content.

We don't publish step-by-step recipes that could be misused, we don't expose the personal accounts of people whose observations we cite, and material about victims or unpublished research goes through our [sensitive material process](https://anoni.net/en/join/upload-sensitive/).

## Three editions

- **Traditional Chinese** is the source of truth, and new pages are written there first
- **Simplified Chinese** is synced from it, with vocabulary and political wording adapted for Simplified Chinese readers
- **English** is a separate, curated edition rather than a page-by-page translation. Where EFF, the Tor Project, OONI or others have already covered a topic better in English, this edition links to them instead of rewriting it

How translation is done and who does what is in [Localization and Translation](../community/i18n.md). The editions don't always go live together, and the Simplified Chinese and English pages follow as people have time.

## Corrections

We fix mistakes in the page itself. When a correction changes what readers should do, we also publish a note saying what changed, what the change is based on, and what anyone who followed the old version should do now, as in [the August 2026 corrections](../blog/posts/docs-corrections-202608.md) and [the September 2026 site update](../blog/posts/site-updates-202609.md).

If you find something wrong or out of date, [open an issue on GitHub](https://github.com/anoni-net/docs/issues){target="_blank"} or email <whisper@anoni.net> (the PGP key is on the [contact page](https://anoni.net/en/contact/#pgp)).

## Ways to read

The site is published three ways with the same content: the standard website, a Tor onion service and an IPFS mirror. They differ in who can see what along the way, as explained in [How you are reading this](./how-you-are-reading.md). The standard website can also be saved to your device and read without a connection, see [Offline reading](../offline.md).

## Licensing

The content is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/){target="_blank"}. You can share and adapt it with attribution, in the form "anoni.net Docs Project, URL of the page, CC BY 4.0".

A few pieces of outside data keep their original licenses. For example, the OONI data used in the interactive pieces is CC BY-NC-SA 4.0, and the full list is in the [`NOTICE`](https://github.com/anoni-net/docs/blob/main/NOTICE){target="_blank"} file at the root of the repository. Code is licensed separately: Pulse is MIT and ASN Coverage is GPL-3.0.

## Related reading

- [Contributor Handbook](../community/contributor-handbook.md)
- [Localization and Translation](../community/i18n.md)
- [Docs Visual Guide](../community/visual-guide.md)
- [Brand Assets](https://anoni.net/en/brand/)
- [The anoni.net community](https://anoni.net/en/)
