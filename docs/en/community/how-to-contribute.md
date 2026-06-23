---
title: How to Contribute
description: The practical mechanics of contributing to anoni.net — discuss first, the GitHub flow, what makes a change easy to accept, and licensing and attribution.
icon: material/source-pull
---

# :material-source-pull: How to Contribute

This page is the *how*: the working mechanics of getting a change into anoni.net. For the *what* (the structured workstreams you can join, from regional observation to translation to Tor relay support), see the [Community page's "Concrete ways to contribute"](./index.md). For who maintains the project and how decisions get made, see [governance](./governance.md) and the [About page](../about/index.md).

Everything below assumes you've already found something to work on. If you haven't, start with the Community page first.

## :material-message-fast-outline: Discuss first

For anything beyond a typo or a small fix, send a brief heads-up before you start. A two-line note saves you from rewriting work that doesn't fit, and it lets someone tell you if a piece is already underway.

- **Matrix** — the [Public Space at `#community:im.anoni.net`](https://matrix.to/#/#community:im.anoni.net){target="_blank"} is the fastest way to reach people. Account requests go to `whisper@anoni.net` (the homeserver is `im.anoni.net`, accounts are individually approved).
- **Encrypted email** — `whisper@anoni.net` works if you'd rather not be on Matrix, or if the topic is sensitive. PGP key is on the [contact page](../contact.md).

You don't need permission to fix an obvious error. The heads-up matters most when a change touches structure, scope, or claims that others may already be working on.

## :material-github: The GitHub flow

The site, Pulse, and the ASN coverage tooling all live in one repository: [github.com/anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"}.

1. **Open an issue first for non-trivial work.** Describe what you want to change and why. This is where scope gets agreed before code or prose is written. Small, self-evident fixes can skip straight to a pull request.
2. **Fork the repository** to your own account.
3. **Branch** off `main` with a short descriptive name.
4. **Make the change**, keeping it focused on one thing. Run `mkdocs serve` locally to preview documentation edits before you push.
5. **Open a pull request** against `main`. Link the issue it addresses, summarize what changed and why, and note which language editions are affected.
6. **Review and merge** is handled by core members, who hold merge authority. Expect questions or requested edits; that back-and-forth is normal and usually quick.

### What a good pull request looks like

- **One concern per PR.** A focused change is far easier to review than a sweep of unrelated edits.
- **A clear description.** Say what changed, why, and what a reviewer should check. Link the issue.
- **Scoped to a single language edition where possible.** If a change affects translations you can't make yourself, note it in the description so the gap is tracked (for example, "zh-CN and en still to sync").
- **Sources for any factual claim.** New facts, figures, dates, or legal references need a citation a reviewer can check.

## :material-format-list-bulleted: Types of contribution, at a glance

The full list with links lives on the [Community page](./index.md). In brief:

- **Regional observation** — primary observations and regulatory updates from your jurisdiction.
- **Translation** — bridging long-form regional research between Chinese and English, and refining the English regional voice.
- **Tor relay support** — campus-deployment write-ups, relay operations, bandwidth or hosting.
- **OONI Probe and ASN coverage** — running probes in the region and improving the coverage tooling.
- **Documentation fixes and additions** — corrections, new pages, and clearer explanations across the three editions.

## :material-check-decagram-outline: What makes a change easy to accept

- **Tight scope.** A change that does one thing well is accepted faster than one that does several things partway.
- **Sources for claims.** Anything presented as fact should be checkable. Link the report, the statute, the dataset.
- **Matching the writing conventions.** The site has a consistent voice and structure. Read a few existing pages in the same section before writing, and follow the same frontmatter, headings, and linking style. New documentation is written in Traditional Chinese (zh-TW) first as the source of truth; the English edition is curated independently rather than translated one-to-one.

## :material-license: Licensing and attribution

- **Documentation content is [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/){target="_blank"}.** When you contribute documentation, you're contributing it under that license: others may share and adapt it with attribution.
- **Code is licensed separately** — Pulse under MIT, the ASN coverage tooling under GPL-3.0. See the [About page](../about/index.md) for details.
- **Contributors are credited.** Your work is attributed to you (under your name or a pseudonym, as you prefer), and it stays visible in the GitHub commit history and contributor list.
- **We don't claim others' work.** When we translate or build on an external report, we attribute it to the original authors and link the source.

## :material-help-circle-outline: When you're unsure

Ask before you build. The [Public Space on Matrix](https://matrix.to/#/#community:im.anoni.net){target="_blank"} or `whisper@anoni.net` will get you a pointer toward whether a change fits, where it should live, and whether someone is already on it. A short question early is cheaper than a reworked pull request later.
