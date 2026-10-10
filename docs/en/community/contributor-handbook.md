---
title: Contributor Handbook
description: File naming, links and page format, the PR process, issue labels, translation, and the questions new contributors hit in their first week, for people working on the English docs site. The writing style lives on the community site.
icon: material/book-open-variant
---

# :material-book-open-variant: Contributor Handbook

Any community that collaborates for long enough accumulates unwritten rules: how to name a file, what belongs in a pull request description, how issues get sorted, and the questions that come up in a contributor's first week. This handbook collects what would otherwise stay scattered across the README, issue comments, and Matrix conversations, so a new contributor can read it in one sitting and experienced members have something common to point at.

If this is your first time here, start with [How to contribute](./how-to-contribute.md) to pick a direction, then come back for the specifics. Account requests and service entry points are on [Community services](https://anoni.net/en/services/).

## Your first week

Sorted by what you want to do:

- **Read first, decide later**: pick anything from [Concepts](../basics/index.md), then use the [skill level self-assessment](./skill-level.md) to gauge how familiar you are with Tor, Tails, and OONI
- **Write or translate**: request a Matrix account (see [Community services](https://anoni.net/en/services/)), join the public Space, say what you would like to work on, and claim an issue
- **Technical maintenance**: request collaborator access to [anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"}, then follow [Development environment setup](./setup-repo.md)
- **Event organizing**: ask in the relevant Matrix room about what is coming up, and help with materials, on-site logistics, or registration

Every one of these starts with saying hello on Matrix. The community works asynchronously, so a reply landing a day or two later is the normal rhythm, not a snub.

## Writing style

The writing style is shared by all three anoni.net sites, and the full rule set is on the community site's [writing style](https://anoni.net/en/join/writing-style/) page. Chinese has its own set, on the [Chinese version](https://anoni.net/join/writing-style/) of that page. This section only covers running the linter on the docs site.

### Running the linter

The `docs-style-lint` job only fires on Markdown changes under `docs/zh-TW`, `docs/zh-CN`, and `docs/en`. After editing an explanatory file such as `README.md` or `CONTRIBUTING.md` at the root, run the linter yourself:

```bash
python3 tools/docs_style_lint.py README.md CONTRIBUTING.md
```

`NOTICE` has no `.md` extension and the linter only accepts `.md` and `.js`, so that one needs a human read.

One group of rules is explicitly grandfathered for existing content; right now that is only `title-colon` from "Headings" in the writing style. CI passes `--changed-since <base>` so those rules are reported only on lines the pull request actually touched. Leave the flag off locally to see the whole file:

```bash
python3 tools/docs_style_lint.py --changed-since origin/main docs/en/tools/vpn-guide.md
```

Without it, changing a single image reference surfaces annotations for every old heading in the file, none of them related to the author's change, and the ones that do need fixing get lost among them.

Rule documents spell out every banned punctuation mark and sentence pattern, so the linter would otherwise flag its own rule descriptions. The writing style page on the community site, this handbook and the workspace projection are exempted by filename through the linter's `RULE_DOCS`, and the rule table and known-limits section in `tools/README.md` are wrapped in `<!-- docs-style-lint: disable -->` and `enable`. Follow the same approach when writing rule documentation, and leave the quoted examples as they are.

## Files and directories

### Filenames

- All lowercase, hyphen-separated (`tor-browser-advanced.md`, `anonymity-vs-privacy.md`)
- Slugs in English
- Acronyms stay lowercase (`vasp-2026.md`, not `VASP-2026.md`)
- Numbers follow a hyphen directly (`roadmap-2026.md`, `updates-202506.md`)

### Directory structure

The structure stays flat. New articles go into an existing section:

| Section | Content |
|---|---|
| `basics/` | Concepts. The thinking tools behind anonymity and privacy |
| `tools/` | Specific tools, comparisons, and hardening guidance |
| `scenarios/` | Situations and roles, and what they change |
| `regional/` | Regional observation and local regulatory context across the Sinophone Asia-Pacific |
| `reports/` | Curated external research, indexed with links to the originals |
| `community/` | Guides to running nodes, reading measurement data, and the contribution and translation guidelines |
| `blog/` | Translations of outside articles, technical analysis, measurement reports and updates about the docs site |

The English site uses `regional/` where the Chinese site uses `taiwan/`. An English reader who sees `taiwan/` assumes a site about Taiwan, while the content spans several jurisdictions with Taiwan as the anchor point.

Pages and announcements about the community itself are not on the docs site. About, how to take part, community services, events and community updates live on [anoni.net](https://anoni.net/en/), with the source in [`anoni-net/www`](https://github.com/anoni-net/www). Community announcements such as events, project launches and progress reports go in that repository's `updates/` directory.

If you are not sure where an article belongs, ask on Matrix before opening a PR, rather than moving it afterwards.

### Moving, renaming, or deleting a page needs a redirect

When you move, rename, or delete a page that is already live, add the redirect in the same PR so the old URL does not turn into a 404. Old URLs live on in search engines, bookmarks, and other people's links.

- Redirects go in `plugins.redirects.redirect_maps` in the three mkdocs configs: `mkdocs.yml` for zh-TW (`/docs/`), `mkdocs_en.yml` for en, and `mkdocs_cn.yml` for zh-cn.
- The format is `old path: new path`, relative to each language's docs directory, without the `docs/<lang>/` prefix. For example, `'tools/what-is-ooni.md': 'tools/index.md'`.
- Where there is no one-to-one replacement, point at the section index (`community/index.md`, `tools/index.md`).
- Keep existing redirects. People keep arriving at old URLs. The one case for revisiting an entry is when its target page has itself been removed and the redirect now dead-ends.
- When you add a page at a path that an existing redirect points *away* from, remove that redirect entry in the same PR. Otherwise the redirect shadows the new page.

### Splitting or moving content needs the inbound links checked

A redirect handles a URL that disappears. It does nothing for the case where a page stays put and the content moves out of it, which is what a page split produces. The old page still returns 200, so nothing reports an error, while every button and link pointing at it now promises material that has gone somewhere else.

When you split a page, or move a section from one page to another, search the site for links to the source page in the same PR and repoint the ones whose text refers to what moved. Two things to know about this check:

- **Neither strict build nor the style linter catches it**: Both target files exist and both links resolve, so the failure is in what the link means rather than whether it works. Only reading the link text against the destination finds it.
- **Dated blog posts count**: A post that was accurate when published keeps its text, and a button in it is a functional entry point rather than part of the record. Repointing the button does not alter what the post said at the time, and leaving it broken means a reader following it lands somewhere that no longer holds what they were promised.

This came up in August 2026: a May 2025 split moved the workshop recruitment content into its own page, and two earlier posts kept pointing at the original, where the material no longer was.

## Images and assets

Screenshots and diagrams take different routes.

Screenshots (application windows, web pages) go in `docs/<lang>/assets/images/`:

- In markdown image syntax, the path is relative to the file: `../assets/images/filename` from a section directory such as `community/`.
- In raw HTML `<img src>` and `<a href>`, the path resolves against the generated URL, not the source file. From a page at `/docs/en/basics/internet-freedom/` that means `../../assets/images/filename`.
- Prefer webp or an optimized png. Do not commit unprocessed phone camera files.
- For a lightbox image, wrap `<img>` in `<figure>` and `<a href>`, and keep both relative paths aligned.
- The three language trees have independent copies of `assets/images/`. Adding a file to one means adding it to the other two. A missing copy produces no build error, just a broken image on the page. `python3 tools/check_image_refs.py` finds them.

Diagrams (flowcharts, architecture diagrams, comparison matrices, timelines) keep their source in `docs/diagrams/`, are published to assets.anoni.net, and are referenced by all three languages through the same URL. See "Contributing technical diagrams" in the [docs visual guide](visual-guide.md) for how to make, name, and publish one.

## Cross-file links

Internal links use relative paths, not absolute `/docs/en/...` paths:

- Same directory: `./other-file.md`
- Across directories: `../basics/anonymity-vs-privacy.md`
- Across depths: `../../blog/posts/2025to2026.md`

Link text describes the destination. Do not paste a bare URL into the body or use the URL itself as the link text: write `see the [community tools page](https://anoni.net/en/services/)`.

External links get `{target="_blank"}` so they open in a new tab: `[Freedom on the Net](https://freedomhouse.org/explore-the-map){target="_blank"}`.

Linking to a page that exists only in Chinese is the one case where you write a full URL, because the language sites build separately and no relative path reaches across them. Use `https://anoni.net/docs/community/privacy-guide/` and mark it `(in Chinese)` so the reader knows what they are clicking. The default language, zh-TW, carries no language segment in its URLs. zh-CN uses lowercase `https://anoni.net/docs/zh-cn/...` and English uses `https://anoni.net/docs/en/...`, while the source directories keep their original casing.

Ending an article with a short "Related" section linking two to four other pages helps. Sideways links between concepts, tools, scenarios, and regional material are worth more than one-directional references.

## Page format

### Front matter

Every page starts with front matter carrying at least three fields:

```yaml
---
title: Threat modelling
description: One complete sentence on what the page covers and what the reader gets from it
icon: material/shield-account-outline
---
```

- `title` takes no question mark and no site name. The page title and the social card add the site name automatically.
- `description` feeds search-result snippets and social cards. Write it as one complete sentence about what the reader gets from the page, not a restatement of the title.
- `icon` is usually a `material/` icon, occasionally `fontawesome-solid-` or `fontawesome-brands-`.
- The H1 follows the front matter directly as `# :material-icon-name: Title`, normally with the same icon as the `icon` field.
- Blog posts also need `date`, `slug`, `categories`, and `authors`.
- To change a page's social card title, description, or background, see "Social cards" in the [docs visual guide](./visual-guide.md).

### Footnotes

Cite research and reporting with Markdown footnotes, collected at the end of the article:

```markdown
The Great Firewall[^1] has long filtered a large share of international sites.

[^1]: [Original title](https://example.org/article){target="_blank"} - Publication
```

Avoid paywalled material as the main source. If a paywalled version is all you can find, add an archive.org link as well.

### Charts

The site supports Vega-Lite charts (`mkdocs-charts-plugin`) in code blocks tagged `vegalite`. The charts fetch their data in the reader's browser, so readers of the onion site also connect to the data source; keep the data on the site or at an address with an onion version. The Pulse charts moved to [Tor Relay Watch](https://anoni.net/en/projects/pulse/) on the community site in 2026-10, where they are rendered as static charts at build time.

### Structured data

The site-wide `Organization` JSON-LD lives in `docs/overrides/main.html`. Do not add `<script type="application/ld+json">` to individual articles.

## Pull requests

### Branch naming

- `blog/<short-slug>` for blog posts (`blog/throttle-drill-results`)
- `feat/<short-slug>` for new features, new sections, writing rules, and substantial rewrites of existing pages (`feat/title-colon-rule`)
- `fix/<short-slug>` for bugs, styling, and small corrections (`fix/table-width`)

`docs/` cannot be used as a prefix. `docs` is itself the build trigger branch, and git will not allow the same name to be both a ref and a directory of refs, so `git switch -c docs/vasp-2026-rewrite` fails with `cannot lock ref`.

### Commit messages

Conventional commits:

```
<type>(<scope>): <subject>

<body>
```

Common types: `docs`, `feat`, `fix`, `chore`, `refactor`. The scope is a language or sub-project name (`zh-TW`, `zh-CN`, `en`, `tools`).

### PR descriptions

A PR description covers at least:

- Why the change is being made, linking the issue or the community discussion
- What it touches: which files, which sections
- What it means for readers: whether links break, whether URLs change, whether other files need to change alongside it

### Review

- Translation and copy editing: request at least one reviewer who is not the author
- Structural changes such as moves or nav edits: propose on Matrix first, then open the PR
- Images and assets: check alt text, filename, and licensing yourself

Maintainers merge. Contributors, including AI assistants working on a contributor's behalf, do not self-merge, and pages touching security-sensitive material always get a maintainer's technical review.

## Issue labels

Issues use GitHub's default label set plus `l10n`. Opening an issue from one of the templates applies the type labels for you:

| Label | Use |
|---|---|
| `documentation` | New or revised page content |
| `enhancement` | Improvement proposals, tool proposals, technical evaluations |
| `bug` | Something on the site or in a tool behaves wrongly |
| `l10n` | Translation and localisation |
| `question` | Discussion |
| `good first issue` | Well scoped, no need to know the whole repo first |
| `help wanted` | More hands needed |
| `duplicate`, `invalid`, `wontfix` | Reason for closing |

There are no separate labels for language or section; put those in the issue title or body. If this is your first contribution, pick one from the [good first issue list](https://github.com/anoni-net/docs/labels/good%20first%20issue){target="_blank"} and leave a comment to claim it, so two people don't end up on the same task.

Search existing issues before opening a new one.

## How translation works

zh-TW is the single source of truth. zh-CN and en are derived from it. The full process is in [Localization and translation](./i18n.md):

- New articles are written in zh-TW first
- zh-CN uses tool-assisted first drafts plus human adjustment for vocabulary differences
- en takes more human work, because the cultural context has to be re-framed rather than converted
- zh-CN and en do not have to ship together with zh-TW. They roll out as people are available
- When reviewing an English page that derives from a zh-TW original, the class of error to look for is named information being replaced by a category term. [What goes missing when an English page derives from zh-TW](./i18n.md#What-goes-missing-when-an-English-page-derives-from-zh-TW) has the test and how to run it

The English site is a rewrite, not a word-for-word translation. A page whose value is entirely in its Chinese-language context does not automatically get an English version, and an English page can carry regional comparisons its Chinese source does not have. Where an upstream English original already exists, as with translated Tor Project, OONI, Tails, and Signal blog posts, the English site links to the original instead of translating it back.

## Working with AI tools

We do not restrict which AI service contributors use for writing, translation, or code. So that different people with different tools produce consistent work, the rules live in one place, this handbook, and every AI configuration file points back here.

### Entry files

- `AGENTS.md` at the repository root covers the repository layout, development commands, and the places where things tend to go wrong. Most AI tools read it automatically. `tools/` and `.github/` each have their own.
- `CLAUDE.md` imports `AGENTS.md` and adds notes on the subagents and skill under `.claude/`.
- If your tool does not read either file on its own, give it `AGENTS.md` and the "Writing style" part of this handbook before you start.

### Checking AI output

AI output goes through the same process as anything written by hand: run `docs_style_lint.py`, work through the pull request template, and go through review. The limits in "Writing about security and privacy" apply in the same way. Open and check every figure, quotation, and source link an AI gives you; the person who opens the pull request is responsible for its content.

### Roles

Writing an article can be split across a few roles, each doing one job. Contributors using Claude Code can call the matching subagent under `.claude/agents/`; with other tools, give the instructions below. Every role assumes the same readers: journalists, civil society groups, and open-source communities, with specialists in Tor, OONI, and digital rights reading too.

Three roles before writing:

- **Topic scout**: scans a given period (the past two weeks by default) for new events in anonymity tools, digital identity and eID, surveillance and censorship legislation, censorship measurement, payment privacy, whistleblowing and leak platforms, and digital rights in Taiwan and the Asia-Pacific, and drops hype, plain product launches, and unrelated items. For each candidate it reports the event in one line, the date, a primary-source link, why the community should cover it, any Taiwan or Asia-Pacific angle, and how time-sensitive it is, ranked by how worth writing it is, six at most. It does not write the article or choose the angle.
- **Angle adviser**: proposes three or four angles on one topic, saying for each what it approaches from, what the community can add, and whether there is a Taiwan or Asia-Pacific hook, in a suggested order. It offers options only; it does not decide for the author or start writing.
- **Research**: once a topic is chosen, gathers primary sources (official announcements, original documents, authoritative reporting) with links and publication dates, scans `docs/zh-TW/blog/posts/` for existing articles worth cross-linking with their relative paths, and marks the claims that will need a citation. If the site already has a very similar article, it says so. It does not write the article or choose the angle.

Four roles for review:

- **Structure review**: reads the whole piece, states its core argument and intended audience in one sentence, then checks whether each section serves that line, which should move, which can go, and where transitions are missing. It reports the reading of the argument, structural problems ordered by severity with their locations, and suggested changes. It does not edit sentences.
- **Line editing**: finds redundant words, vague phrasing, and logical jumps, checks that the tone stays consistent, and in bilingual documents confirms both versions say the same thing. For each problem it gives the location, the issue, and a rewrite, sentence by sentence, without rewriting whole paragraphs.
- **Fact check**: lists every checkable claim, including figures, dates, country cases, technical descriptions, and descriptions of projects or organisations, rates each as accurate, needs a source, possibly wrong, or overstated, and verifies the possibly wrong ones. For each problem it gives the location and claim, the rating, the evidence or source link, and a suggested fix (change the figure, add a source, soften the claim, or cut it). It does not polish prose or comment on style.
- **Target reader**: plays a reader who does not know the subject but will spend five minutes on the piece, and marks which sentences lose them, which arguments do not persuade, and what they remember and want to do afterwards. It gives reader reactions only, not editing advice.

## Where to look before asking

| Question | Page |
|---|---|
| How do I pick something to work on? | [How to contribute](./how-to-contribute.md) |
| How do I get a Matrix account? | [Community services](https://anoni.net/en/services/) |
| What suits my level? | [Skill level self-assessment](./skill-level.md) |
| How do I set up the development environment? | [Development environment setup](./setup-repo.md) |
| What are the translation rules? | [Localization and translation](./i18n.md) |

If none of those answer it, ask on Matrix. Include what you are trying to do, what you have already tried, and where you are stuck.

## Code of conduct, in brief

The community works on openness, mutual support, and staying within the law. This is the short version. The full text, including role definitions, decision-making, and dispute handling, is in the [governance charter](https://anoni.net/en/about/governance/), which takes precedence where the two differ.

- **Mutual respect**: members get the same treatment regardless of background or familiarity with the subject
- **Argue the issue, not the person**
- **Lawful purposes**: all discussion and collaboration presumes lawful use. We do not assist money laundering, tax evasion, harassment, stalking, or unauthorized intrusion
- **Disclosure**: anything involving personal data or sensitive material goes through [Sending us sensitive material](https://anoni.net/en/join/upload-sensitive/)
- **Disputes**: raise it on Matrix first. Without consensus there, it goes to the next community sync

Conduct that breaches these gets handled by core members under the governance charter.

## This handbook is a living document

If you hit something this page does not cover, or find a process that turns out to be under-documented, propose a change. Editing the contributor handbook is itself a good first issue.
