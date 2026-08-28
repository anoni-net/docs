---
title: Contributor Handbook
description: Writing style, naming rules, the PR process, issue labels, and the questions new contributors hit in their first week, for people working on the English site.
icon: material/book-open-variant
---

# :material-book-open-variant: Contributor Handbook

Any community that collaborates for long enough accumulates unwritten rules: how to phrase a heading, how to name a file, what belongs in a pull request description, how issues get sorted, and the questions that come up in a contributor's first week. This handbook collects what would otherwise stay scattered across the README, issue comments, and Matrix conversations, so a new contributor can read it in one sitting and experienced members have something common to point at.

If this is your first time here, start with [How to contribute](./how-to-contribute.md) to pick a direction, then come back for the specifics. Account requests and service entry points are on [Community services](./tools.md).

## Your first week

Sorted by what you want to do:

- **Read first, decide later**: pick anything from [Concepts](../basics/index.md), then use the [skill level self-assessment](./skill-level.md) to gauge how familiar you are with Tor, Tails, and OONI
- **Write or translate**: request a Matrix account (see [Community services](./tools.md)), join the public Space, say what you would like to work on, and claim an issue
- **Technical maintenance**: request collaborator access to [anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"}, then follow [Development environment setup](./setup-repo.md)
- **Event organizing**: ask in the relevant Matrix room about what is coming up, and help with materials, on-site logistics, or registration

Every one of these starts with saying hello on Matrix. The community works asynchronously, so a reply landing a day or two later is the normal rhythm, not a snub.

## Writing style

### English and Chinese have separate rule sets

Traditional Chinese (`docs/zh-TW`) is the source of truth for the site, and its style rules cover Chinese punctuation, classifier repetition, register, and translated terminology. Those rules do not transfer, and several are actively wrong when applied to English. Em dashes, for example, are banned in Chinese body text and are ordinary English typography.

What follows is the English rule set. If you are writing or reviewing Chinese, use the [Chinese contributor handbook](https://anoni.net/docs/community/contributor-handbook/){target="_blank"} (in Chinese) instead, which is the authority for `zh-TW` and `zh-CN`. Since 2026-08 the automated style linter in CI also covers `docs/en`, though only three of the English rules are mechanised so far (`bold-lead-sentence`, `title-colon`, `machine-field`). The rest of the English rules below rest on human review.

### What these rules cover

The rules apply to the documentation under `docs/` in all three locales, and to the repository's own explanatory files: `README.md`, `CONTRIBUTING.md`, `CLAUDE.md`, and `NOTICE` at the root, plus the `README.md` in each subdirectory. Readers meet the project through those files, so they follow the same standard as the site.

The `docs-style-lint` job only fires on Markdown changes under `docs/zh-TW`, `docs/zh-CN`, and `docs/en`. After editing an explanatory file, run the linter yourself:

```bash
python3 tools/docs_style_lint.py README.md CONTRIBUTING.md
```

`NOTICE` has no `.md` extension and the linter only accepts `.md` and `.js`, so that one needs a human read.

Rule documents spell out every banned punctuation mark and sentence pattern, so the linter flags its own rule descriptions. This handbook and the workspace projection are exempted by filename through the linter's `RULE_DOCS`, and the rule table and known-limits section in `tools/README.md` are wrapped in `<!-- docs-style-lint: disable -->` and `enable`. Follow the same approach when writing rule documentation, and leave the quoted examples as they are.

### Voice and positioning

The English site is written for international peers, researchers, journalists, and English-preferring readers across the Sinophone Asia-Pacific, by people working inside the region. The prose should sound like it.

- Refer to ourselves as "we, a community based in Taiwan". Avoid "In Taiwan, we...", which addresses the reader as though they were also in Taiwan.
- Where a passage is specific to Taiwan, add the regional comparison rather than leaving Taiwan as the implied default. Mainland China, Hong Kong and Macau, Singapore, Malaysia, and the diaspora each have their own picture.
- Do not translate Chinese conceptual shorthand literally. Phrases like 在地脈絡 or 公民團體 turn into stilted English when carried across word for word. Say what is actually meant.

### Terminology

- Write regulatory short names out in full on first use: PDPA becomes "the Personal Data Protection Act of Taiwan", VASP becomes "the virtual asset service provider regime".
- Write institution names out in full: 金管會 becomes "the Financial Supervisory Commission (FSC)".
- Give technical names a short expansion on first use: Tor (onion routing network), Tails (amnesic live operating system), OONI (Open Observatory of Network Interference).
- Cite English-language primary sources in footnotes. Do not cite the Chinese translation of a piece that exists in English.

### Headings

- Do not use the "Topic: explanation" colon construction. Write a heading as a complete statement instead.
    - :material-close: `Brave and GPU fingerprinting: uniformity and randomization in one release`
    - :material-check: `Brave flattens GPU fingerprints two opposite ways`
- This applies to article titles and to section headings at every level.
- Keep an external source's original title as-is when the link text quotes it.
- Existing articles do not need retrofitting. Apply this to new articles and substantial rewrites.

### Paragraph voice

- Write like a community member who knows the subject explaining it, not like an encyclopedia entry.
- Do not end every paragraph with a summarizing sentence. Let paragraphs stop when they are finished.
- Avoid openers like "It is worth noting that", "In conclusion", and "All in all".
- Avoid the over-symmetrical three-part structure that reads as machine-generated.
- Define a concept by stating it completely. Constructions like "what this is about is" or "this refers to" push the definition out of focus without adding anything.

### No animacy for things that are not people

Non-human subjects do not take human actions. The common cases and their fixes:

| Case | :material-close: | :material-check: |
|---|---|---|
| Organizations speaking | `Brave said it would follow up later` | `Brave's announcement said it would follow up later` |
| Documents speaking | `The report points out the risk` | `The risk is in the report's conclusion` |
| Software perceiving | `The site sees an unfamiliar string` | `The string the site receives is not in its existing list` |
| Abstractions having intent | `The toggle's existence says the trade-off remains` | `Keeping the toggle means the trade-off remains` |

Two exceptions. An organization acting as an agent keeps the plain verb when the action is something it can actually do (`Brave shipped the protection`, `the Tor Project released a new version`, `OONI collects measurements`). Direct quotations keep their original wording.

### Cutting the machine-written texture

The edits that come up most in review:

- Delete the throat-clearing opener. `Let us first lay out the basics of CryptPad. It is...` becomes `CryptPad is...`. Start with the content instead of announcing what is coming.
- Cut filler transitions: "essentially", "in other words", "to put it plainly". Delete rather than replace where possible.
- Replace an abstract placeholder with the actual content. `The next section explains why that conclusion does not hold` becomes `The usage figures in the next section contradict it`.
- Drop intensifiers and emotional colour. `battle-tested under real-world pressure` becomes `has a record of production use`. Ordinary terms do not need quotation marks for emphasis.
- Do not open a paragraph with a bolded complete sentence. Promote parallel items to headings, and write standalone paragraphs as ordinary prose. `**Location.** OONI records the country and ASN...` becomes a `### Location` heading followed by the text. Bold words as sentence elements or list labels are fine (`the **control day** uses the same parameters`, `**Data source**: ...`). The test is whether the bolded text is a complete sentence ending in a period.

### Numbers and identifiers

Mark list numbers, IDs, and serial numbers as inline code (`10006`, `10298`), so a reader can see at a glance that they are identifiers rather than quantities.

### Writing about security and privacy

Anonymity and privacy are the subject of this site, and the writing has to hold the same line:

- Do not publish recipes that can be misused. Even where the data and APIs are public, we do not walk readers through full enumeration, bulk scraping, de-anonymization, or bypassing a security control. State the result instead: `we took a snapshot of the full list on a given day`, rather than printing the command that iterates every identifier.
- Do not expose individual operators' accounts or handles. Refer to someone's observations by region or role (`an observer in Thailand`), and name people only when they are already public and naming them is necessary.
- Material involving victims, unpublished research, or personal data goes through [Sending us sensitive material](./upload-sensitive.md).

## Files and directories

### Filenames

- All lowercase, hyphen-separated (`tor-browser-advanced.md`, `anonymity-vs-privacy.md`)
- Slugs in English
- Acronyms stay lowercase (`vasp-2026.md`, not `VASP-2026.md`)

### Directory structure

The structure stays flat. New articles go into an existing section:

| Section | Content |
|---|---|
| `basics/` | Concepts. The thinking tools behind anonymity and privacy |
| `tools/` | Specific tools, comparisons, and hardening guidance |
| `scenarios/` | Situations and roles, and what they change |
| `regional/` | Regional observation and local regulatory context across the Sinophone Asia-Pacific |
| `reports/` | Curated external research, indexed with links to the originals |
| `community/` | Governance, process, and entry points |
| `blog/` | Posts and original commentary |

The English site uses `regional/` where the Chinese site uses `taiwan/`. An English reader who sees `taiwan/` assumes a site about Taiwan, while the content spans several jurisdictions with Taiwan as the anchor point.

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

Diagrams (flowcharts, architecture diagrams, comparison matrices, timelines) keep their source in `docs/diagrams/`, are published to assets.anoni.net, and are referenced by all three languages through the same URL. See "Contributing technical diagrams" in the [brand guide](brand-assets.md) for how to make, name, and publish one.

## Cross-file links

Internal links use relative paths, not absolute `/docs/en/...` paths:

- Same directory: `./other-file.md`
- Across directories: `../basics/anonymity-vs-privacy.md`
- Across depths: `../../blog/posts/2025to2026.md`

Linking to a page that exists only in Chinese is the one case where you write a full URL, because the language sites build separately and no relative path reaches across them. Use `https://anoni.net/docs/community/privacy-guide/` and mark it `(in Chinese)` so the reader knows what they are clicking. The default language, zh-TW, carries no language segment in its URLs. zh-CN uses lowercase `https://anoni.net/docs/zh-cn/...` and English uses `https://anoni.net/docs/en/...`, while the source directories keep their original casing.

Ending an article with a short "Related" section linking two to four other pages helps. Sideways links between concepts, tools, scenarios, and regional material are worth more than one-directional references.

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

Common types: `docs`, `feat`, `fix`, `chore`, `refactor`. The scope is a language or sub-project name (`zh-TW`, `zh-CN`, `en`, `pulse`, `asn_coverage`).

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

The label scheme, which is still settling:

- `type:docs` documentation
- `type:bug` incorrect behaviour
- `type:enhancement` improvement proposals
- `type:question` discussion
- `area:zh-TW` / `area:zh-CN` / `area:en` by language
- `area:tools` / `area:scenarios` and the rest by section
- `good first issue` for newcomers
- `help wanted` where more hands are needed

Search existing issues before opening a new one.

## How translation works

zh-TW is the single source of truth. zh-CN and en are derived from it. The full process is in [Localization and translation](./i18n.md):

- New articles are written in zh-TW first
- zh-CN uses tool-assisted first drafts plus human adjustment for vocabulary differences
- en takes more human work, because the cultural context has to be re-framed rather than converted
- zh-CN and en do not have to ship together with zh-TW. They roll out as people are available
- When reviewing an English page that derives from a zh-TW original, the class of error to look for is named information being replaced by a category term. [What goes missing when an English page derives from zh-TW](./i18n.md#What-goes-missing-when-an-English-page-derives-from-zh-TW) has the test and how to run it

The English site is a rewrite, not a word-for-word translation. A page whose value is entirely in its Chinese-language context does not automatically get an English version, and an English page can carry regional comparisons its Chinese source does not have. Where an upstream English original already exists, as with translated Tor Project, OONI, Tails, and Signal blog posts, the English site links to the original instead of translating it back.

## Where to look before asking

| Question | Page |
|---|---|
| How do I pick something to work on? | [How to contribute](./how-to-contribute.md) |
| How do I get a Matrix account? | [Community services](./tools.md) |
| What suits my level? | [Skill level self-assessment](./skill-level.md) |
| How do I set up the development environment? | [Development environment setup](./setup-repo.md) |
| What are the translation rules? | [Localization and translation](./i18n.md) |

If none of those answer it, ask on Matrix. Include what you are trying to do, what you have already tried, and where you are stuck.

## Code of conduct, in brief

The community works on openness, mutual support, and staying within the law. This is the short version. The full text, including role definitions, decision-making, and dispute handling, is in the [governance charter](./governance.md), which takes precedence where the two differ.

- **Mutual respect**: members get the same treatment regardless of background or familiarity with the subject
- **Argue the issue, not the person**
- **Lawful purposes**: all discussion and collaboration presumes lawful use. We do not assist money laundering, tax evasion, harassment, stalking, or unauthorized intrusion
- **Disclosure**: anything involving personal data or sensitive material goes through [Sending us sensitive material](./upload-sensitive.md)
- **Disputes**: raise it on Matrix first. Without consensus there, it goes to the next community sync

Conduct that breaches these gets handled by core members under the governance charter.

## This handbook is a living document

If you hit something this page does not cover, or find a process that turns out to be under-documented, propose a change. Editing the contributor handbook is itself a good first issue.
