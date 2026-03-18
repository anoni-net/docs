---
date: 2026-03-19
authors:
    - toomore
categories:
    - Updates
    - Tor
slug: tpa-adr
image: "assets/images/tor.webp"
summary: "How Tor's TPA team moved from RFCs to ADRs, and why that inspired us to rethink how we record decisions."
description: "Reflections on Tor's TPA ADR model: why they moved away from RFCs, how other projects handle proposals and decisions, and why we think ADRs are a good fit for our own communities and projects."
---

# Learning from TPA's ADR model

In February 2026, anarcat from the Tor system administration team (TPA) published a post titled [\"Keeping track of decisions using the ADR model\"](https://blog.torproject.org/tpa-adr/){target="_blank"}.  
After reading it, we felt it offered a very practical way to think about proposals, decision-making, and how to write things down so that people can actually find and understand them later.

This post is **not** a translation of the original article. Instead, it is our own summary and reflection on:

- what problem TPA was trying to solve with ADRs,
- what they actually changed in their process,
- how other projects handle proposals and decisions, and
- how this connects to the context we are familiar with.

![Tor](./assets/images/tor.webp)

<!-- more -->

## What we took from TPA’s ADR post

If you want the full story, read the original:  
[Keeping track of decisions using the ADR model](https://blog.torproject.org/tpa-adr/){target="_blank"}.

For our purposes, the key takeaways are:

- **Short decision records over long RFCs** — keep it concise and digestible.
- **Decide who decides (RACI-like)** — make the decision maker and consulted/informed roles explicit.
- **Separate the record from the announcement** — write the ADR for durability, write comms for the audience.

## How other projects handle proposals and decisions

The TPA post also looks outward and compares different approaches in the wider open source ecosystem. Here is a short recap of some examples mentioned there, plus links if you want to dive deeper.

- **GOV.UK Design System** – Uses **RFCs** for proposals and **ADRs** to record final decisions. Proposals live in a public repo, such as [\"001-use-rfcs-and-adrs-to-discuss-proposals-and-record-decisions\"](https://github.com/alphagov/govuk-design-system-architecture/blob/main/proposals/001-use-rfcs-and-adrs-to-discuss-proposals-and-record-decisions.md){target="_blank"}. In other words: *RFCs for discussion, ADRs for the final record*.

- **Bitwarden** – Maintains ADR documentation (and an ADR index) at [contributing.bitwarden.com/architecture/adr/](https://contributing.bitwarden.com/architecture/adr/){target="_blank"}. ADRs are the primary way they record architectural decisions.

- **GitLab** – In some subprojects (for example the GitLab Helm charts), existing architecture documents are gradually being rewritten into ADR form. This is a way to \"ADR-ify\" existing documentation.

- **ADR community / MADR** – The site [adr.github.io](https://adr.github.io/){target="_blank"} provides the MADR (Markdown Architectural Decision Records) template and supporting tools that many projects use as a lightweight, general-purpose ADR format.

- **Rust** – Uses [RFCs](https://github.com/rust-lang/rfcs){target="_blank"} to propose and discuss changes to the language and standard library. RFCs are numbered, publicly discussed, and archived as part of the language's evolution.

- **Python** – Uses [PEPs](https://peps.python.org/){target="_blank"} (Python Enhancement Proposals) as the formal proposal and decision mechanism for language and standard library changes.

- **Kubernetes** – Uses [KEPs](https://github.com/kubernetes/enhancements){target="_blank"} (Kubernetes Enhancement Proposals) for major features and architectural changes.

In short, there is no single universal pattern. Some ecosystems combine **RFC-style proposals plus ADR-style records** (for example GOV.UK). Others use ADRs as their main internal mechanism (Bitwarden, now TPA). Large ecosystems often rely on numbered proposal documents (RFCs, PEPs, KEPs) with their own traditions and workflows.

What feels distinctive about TPA's approach is:

- the insistence on **explicitly choosing the decision maker**, and
- the strong emphasis on **separating the decision record from outward-facing communication**.

Those two elements are transferable even if a project does not adopt ADRs in name.

## Our context: communities and projects

In the communities and projects we are familiar with (for example, civic tech in Taiwan, government collaborations, and teams in local companies), there are already many forms of \"proposal → discussion → consensus\". What is often missing is not process, but **a stable, easy-to-find, and newcomer-friendly record of the decisions themselves**.

Some patterns we have seen:

- **Civic tech and community projects (for example g0v-related work)**  
  Proposals and decisions are often documented through a mix of proposal documents, shared notes (such as HackMD), hackathon sessions, and online meetings. The [g0v collaboration guide](https://g0v.hackmd.io/@jothon/g0v-cowork-guideline/){target=\"_blank\"} is a good example of how this culture is documented.  
  Architecturally important decisions, however, may end up scattered across notes, issues, pull requests, slides, and chat logs. After some time, it becomes hard to reconstruct *why* a system looks the way it does.

- **Government and public-sector collaborations**  
  These projects often produce specifications, system design documents, and final project reports. They look more like \"one big document\" created at certain milestones, rather than a continuous log of decisions over time.  
  Many of these documents are not fully public, which makes it hard for external contributors to see the trade-offs and constraints behind the system.

- **Open source projects run by local companies**  
  Some teams maintain internal decision records or design docs for architecture changes, but these live in internal knowledge bases. The public repository only shows the code, not the decision history that shaped it.

In all of these cases, it's not that there is no decision-making. It's that the **decision trail is fragmented and fragile**. Without a simple, repeatable format, it is easy for later contributors—or even future versions of the same team—to lose track of why certain paths were chosen.

This is where TPA's ADR model feels relevant to us:

- Each important decision becomes a small, self-contained file that explains *why*.
- It avoids the pressure to produce massive, perfect design documents.
- It is more durable and discoverable than leaving everything inside issues or chat logs.
- Newcomers and external contributors can read ADRs to quickly understand:  
  **\"This system looks like this today because of these past decisions.\"**

We see ADRs as one possible bridge between community-style collaboration and more formal project documentation.

### How these ideas translate here

- **Short records instead of big milestone docs**  
  For government-style projects that generate large reports, consider adding a lightweight `adr/` folder where each file captures a single decision and its reasoning.

- **Decide who decides, even in volunteer settings**  
  In civic tech teams with rotating contributors, explicitly naming a decision maker (timeboxed, or per module) reduces stalled discussions and clarifies accountability.

- **Separate ADRs from announcements**  
  Keep ADRs technical and durable; publish separate updates (blog posts, READMEs, release notes) tailored to the intended audience.

We suspect these tweaks are small enough to try without heavy process changes, and big enough to improve continuity.

## Closing thoughts

TPA's post was the trigger; our focus is on what we can apply locally. We'll start by:

- Piloting a minimal ADR template in selected repos (one file per decision).
- Naming a decision maker per ADR (and listing consulted/informed).
- Writing separate, audience-friendly updates when decisions affect users.

If you already use ADRs—or if this motivates you to try them—we'd love to hear your experiences, especially from Taiwan and neighboring communities. TPA is also collecting feedback; you can join their discussion: <https://gitlab.torproject.org/tpo/tpa/team/-/issues/41428>.

