---
title: Metadata, and why it matters
description: End-to-end encryption hides what you said, not who you talked to, when, or from where — and in this region that pattern often ties to a legal identity.
icon: material/file-tree
---

# :material-file-tree: Metadata, and why it matters

"I used end-to-end encryption, so no one can read my messages, so I'm safe." The first half is usually true. The second half is where metadata walks in.

Metadata is the data *about* your communication, as opposed to its content. When you make a call, the **content** is what you say. The **metadata** is who you called, when, how long you talked, and roughly where each phone was. Encryption can lock the content tight and leave all of that in the open. For many threat models, the metadata alone is enough to rebuild someone's social graph and daily pattern, no content required.

This page is a short explainer. EFF's curriculum already covers the topic in depth and in several regional languages, so we keep this tight and route the depth there.

## What "I used encryption" misses

Encryption protects the content from intermediaries. It rarely protects the envelope around it, and even when a tool tries to, the network usually still sees the shape:

- **Who talked to whom**: the sender and recipient sit in email headers and in connection records, plainly.
- **When and how often**: a burst of messages at 2 a.m., a 40-minute call the night before a story runs.
- **How long, how big**: call duration, message size, and timing patterns leak meaning on their own.
- **From where**: the IP address you connect from, and the cell tower your phone registered to, both map closely to location.

A PGP-encrypted email to a lawyer keeps the body unreadable, but "you have an ongoing correspondence with that law firm" is right there in the metadata, and that fact alone can reveal you are dealing with a legal matter. Nobody has to open the letter. The schedule is enough.

This is the depth target for the "confidential is not anonymous" point in [anonymity, privacy, pseudonymity, and confidentiality](./anonymity-vs-privacy.md). A tool can keep your content fully confidential and still expose who you are and who you reach.

## The regional sharpener: real-name SIM registration

In much of East and Southeast Asia, buying a SIM card means handing over an ID document. Mandatory SIM-card registration tied to identity is the norm across the region[^1]. That changes what metadata costs you.

When SIM registration is bound to your legal identity, the phone number behind your encrypted messenger often *is* you, on paper. The **call-detail records** held by carriers (who called whom, when, for how long, off which tower) and the **connection logs** that map IP sessions to a subscriber are no longer anonymous traffic statistics. They resolve to a named person, and they are exactly the records that get requested under legal or extralegal pressure. So even a messenger that minimizes its own metadata collection cannot undo the fact that the account was opened against a real-name SIM.

## What this means in practice

You cannot eliminate metadata, but knowing it exists changes how you reason about a tool. Before trusting "it's encrypted," ask the metadata questions: who can see *that* I'm talking to this person, how often, and from where? Carry that question into your [threat model](./threat-model.md), and use it when you read tool comparisons and the worked examples in [Scenarios](../scenarios/index.md).

## Where to go from here

- [Why Metadata Matters](https://ssd.eff.org/module/why-metadata-matters){target="_blank"} — EFF Surveillance Self-Defense, the canonical explainer, available in several regional languages.
- [Anonymity, privacy, pseudonymity, and confidentiality](./anonymity-vs-privacy.md) — why confidential content is not the same as an anonymous identity.
- [Your Security Plan](https://ssd.eff.org/module/your-security-plan){target="_blank"} — EFF SSD, to turn "what can the metadata reveal?" into a concrete plan.
- [Scenarios](../scenarios/index.md) — how this plays out for journalists, activists, and others under specific pressure.

[^1]: Mandatory SIM-card registration tied to identity is in force across much of the region, for example Thailand, Vietnam, Indonesia, Malaysia, and the Philippines (under the 2022 SIM Registration Act). See the GSMA overview of [mandatory SIM registration](https://www.gsma.com/public-policy/wp-content/uploads/2021/08/GSMA-Mandatory-Registration-of-Prepaid-SIM-Cards-2021.pdf){target="_blank"} for the regional picture.
