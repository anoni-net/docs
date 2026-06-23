---
title: Anonymity, privacy, pseudonymity, and confidentiality
description: Four words used interchangeably that protect different things against different threats — a single side-by-side explainer for picking the right tool, with Asia-Pacific examples.
icon: material/incognito-circle
---

# :material-incognito-circle: Anonymity, privacy, pseudonymity, and confidentiality

People use these four words as if they were synonyms. They are not. A tool can be highly **confidential** (nobody can read the content) and not **anonymous** at all (who is talking to whom is plain to see). An account can be **pseudonymous** (others only know you as "Alice") and have no **privacy** (every post and every like is public). When the words blur together, the usual result is the wrong tool for the job, and effort spent protecting the wrong thing.

This page puts the four side by side and draws the lines between them with concrete examples.

!!! info "Why this page exists"

    The major self-defense curricula explain each concept well in isolation, but rarely place all four in one comparison. anoni.net is a volunteer community in the Sinophone Asia-Pacific, and this page is written for readers across that region who read English as a working language. For the broader curriculum, [EFF Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"} and [Privacy Guides](https://www.privacyguides.org/){target="_blank"} remain the canonical starting points; the depth links below point there.

## The four concepts at a glance

| Concept | The question it answers | One-line definition |
|---|---|---|
| Anonymity | *Who is doing this?* | The link between an action and a real identity is broken. An observer can see that *someone* did something, but cannot say who. |
| Privacy | *Can I control who sees information about me?* | You hold the choice over how widely personal information is disclosed: to whom, when, and how much. |
| Pseudonymity | *Which persona is this, in this context?* | You act under a stable handle that is cut off from your real identity. Actions under one handle can be linked together, but not back to the person. |
| Confidentiality | *Can only authorized people read the content?* | A message or file is readable only by its intended recipient; it is not exposed to unauthorized parties in transit or at rest. |

## The same four, made concrete

### Sending a letter

- **Anonymity**: a letter with no sender name or return address. The recipient reads the content and knows someone wrote it, but not who.
- **Privacy**: a letter to a friend that you expect only the friend to read. If someone steams it open, that is a privacy violation, not an anonymity one.
- **Pseudonymity**: you sign with a pen name. Every letter under that pen name can be tied together, but not to the name on your ID.
- **Confidentiality**: you seal the envelope so nobody reads the content in transit. This is independent of who sent it, who received it, or how many letters there were.

### Posting on a forum

- **Anonymity**: no registration; every post is a fresh, unlinkable identity. An observer sees only "someone posted."
- **Privacy**: you register under your real name but control which posts are public and which are friends-only.
- **Pseudonymity**: you register as `cat_lover_7`, and every post hangs off that handle. Long-time readers can assemble the habits and schedule of `cat_lover_7` without knowing who you are.
- **Confidentiality**: the direct-message feature is end-to-end encrypted, so the forum's servers cannot read message content.

The key distinction here: **anonymity versus pseudonymity is about whether actions under one identity can be linked, not about whether a real name is used.** Anonymity demands that each action be unlinkable. Pseudonymity accepts that actions are linkable, as long as they do not reach the real person.

### Messaging tools

A quick look at which property each tool leans toward; the terms are covered in depth in the tools section, so don't worry if they're unfamiliar:

- **Signal** is strong on **confidentiality**: messages are end-to-end encrypted and the server cannot read them. It is **weak on anonymity**: registration is bound to a phone number, and who-contacts-whom (metadata) is still visible to whoever controls the connection. In much of Asia-Pacific this is sharper than it sounds, because SIM registration is tied to a real identity by law in many jurisdictions[^1], so the phone number behind the account often *is* the legal identity.
- **Onion services** (sites that run inside the Tor network, with addresses ending in `.onion`) are strong on **anonymity**: it is hard to trace who visited what. The moment a service requires a login, **pseudonymity** enters: actions get attached to an account and become linkable.
- A **PGP-encrypted email** (a common way to encrypt mail) is strong on **confidentiality**: the content is encrypted. It is **weak on anonymity**: the sender and recipient addresses sit in the message headers, so who-talks-to-whom is in the open.

## The most common mistake: treating confidential as anonymous

"I used end-to-end encryption, so I'm anonymous" is one of the most frequent errors. Encryption protects the **content** from intermediaries, but **who is talking to whom, when, how often, and for how long** is usually not encrypted, and even where it is, the server can still observe the shape of it. For many threat models, this metadata alone is enough to reconstruct a social graph and a pattern of behavior. See EFF's [Why Metadata Matters](https://ssd.eff.org/module/why-metadata-matters){target="_blank"} for the full case.

## Why the right word changes the tool you pick

- A journalist protecting a source needs **anonymity**, because a source who is identified faces real-world risk. Content confidentiality alone is not enough.
- Sharing photos with a partner needs **privacy**, because you don't want the photos spreading beyond them. Anonymity is irrelevant; you're happy for the partner to know it's you.
- Posting long-term on a sensitive-topic forum needs **pseudonymity**: a reputation you can build up, cut off from your real identity. Full anonymity would make it hard to earn readers' trust.
- Corresponding with a lawyer needs **confidentiality**: the content stays between you two. Anonymity and pseudonymity don't apply, since the lawyer has to know who you are to act for you.

Pick the wrong word and you pick the wrong tool: using Signal to solve an anonymity problem, Tor to solve a confidentiality problem, or a pen name to solve a privacy problem each leaves a gap where the risk you actually faced walks right through.

## No single tool does all four

In practice almost no tool maximizes all four properties at once, because they pull against each other:

- Strong anonymity usually means it's hard to build a continuing relationship, since you start from zero each time.
- Strong pseudonymity lets you accumulate a relationship, but everything under one handle is linkable.
- Strong confidentiality often needs a prior key exchange or identity check, which is in some tension with anonymity.
- Strong privacy needs fine-grained control over "who can see this," which usually means accounts, permissions, and platform rules.

Before choosing a tool, ask what *this* task needs to protect, then decide the trade-off. That question is the core of [threat modeling](https://ssd.eff.org/module/your-security-plan){target="_blank"}.

## Where to go from here

- Take these four concepts through EFF's [Your Security Plan](https://ssd.eff.org/module/your-security-plan){target="_blank"} to turn the abstract vocabulary into a concrete list of what you're protecting and from whom.
- Read [Why Metadata Matters](https://ssd.eff.org/module/why-metadata-matters){target="_blank"} for why "confidential" is not the same as "anonymous."
- See the [Scenarios](../scenarios/index.md) section for how these four play out for specific people: [LGBTQ+ digital safety](../scenarios/lgbtq.md) is a worked example.
- For how anoni.net frames all of this regionally, see [Why networked freedom matters](./internet-freedom.md).

[^1]: Mandatory SIM-card registration tied to identity is in force across much of the region — for example Thailand, Vietnam, Indonesia, Malaysia, and the Philippines (under the 2022 SIM Registration Act). See the GSMA overview of [mandatory SIM registration](https://www.gsma.com/public-policy/wp-content/uploads/2021/08/GSMA-Mandatory-Registration-of-Prepaid-SIM-Cards-2021.pdf){target="_blank"} for the regional picture.
