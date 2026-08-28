---
title: Threat modeling
description: Threat modeling is owned by EFF's Surveillance Self-Defense and translated into several regional languages; this page adds only the Asia-Pacific framing and points you there.
icon: material/target
---

# :material-target: Threat modeling

Threat modeling is the habit of asking, before you pick a tool, *what exactly am I protecting, and from whom?* It is the single most useful security skill, and also one of the few topics where the English-language canonical guide is genuinely hard to improve on.

!!! info "We point outward on this one"

    EFF's [Your Security Plan](https://ssd.eff.org/module/your-security-plan){target="_blank"} is the reference we use, and it is translated into Thai, Vietnamese, and Burmese among other languages. We don't reproduce it here. This page adds only the regional framing, then sends you there.

## The five questions

EFF frames threat modeling as five questions, worth keeping on a single sheet of paper:

- What do I want to protect? (your data, your location, who you talk to)
- Who do I want to protect it from? (the adversary)
- How likely is it that I will need to protect it?
- How bad are the consequences if I fail?
- How much trouble am I willing to go through to prevent those?

The [threat model checklist](../utils/threat-model.md) turns questions one, two and five into something you can click through, and flags the combinations that will not hold. It runs in your browser, saves nothing, and works offline. Questions three and four stay yours to judge, and the section below is why.

<figure markdown="span">
    <img src="https://assets.anoni.net/diagrams/threat-model-quadrant.en.svg"
        alt="A four-quadrant chart. The horizontal axis is how real a given asset and adversary pairing actually is, from low to high. The vertical axis is how strong your protection is today, from weak to strong. Top left is over-protected and can be let go, with a family group chat against state-level surveillance and viewing history against a law enforcement request. Top right is covered and worth keeping, with a bank account against scammers and a main email account against takeover. Bottom left is accepted, a known risk left alone, with public posts against a passing stranger and reading history against ad tracking. Bottom right is not covered yet and is the next step, with a cloud photo library against a platform breach and a reused password on an old account against credential stuffing.">
    <figcaption>Roughly what the answers look like once laid out. The pairings shown are invented.</figcaption>
</figure>

Laying the answers out this way turns a list into a decision. The horizontal axis carries questions three and four together, how likely a pairing is and how bad it would be. The vertical axis is what you already have in place. The bottom right box is the work queue, and the top left box is cost you can reclaim.

That top left box is the one people skip. Reviewing a security plan usually means hunting for gaps, and moving effort away from somewhere it earns nothing matters just as much, particularly when the answer to question five was already tight.

## Why the adversary is regional

The reason this matters on a Sinophone Asia-Pacific site: the adversary in question 2 changes shape across jurisdictions, and so does the cost in question 4. The same action, using a pseudonymous account, carrying a phone across a border, reaching a blocked service, carries very different consequences in Taipei, Hong Kong, Kuala Lumpur, or across the Myanmar border. A threat model built for one jurisdiction does not transfer unchanged to the next. When you move across the region, re-run the five questions for where you are now.

For the vocabulary the five questions assume, see [anonymity, privacy, pseudonymity, and confidentiality](./anonymity-vs-privacy.md).

## Where to go from here

- [Your Security Plan](https://ssd.eff.org/module/your-security-plan){target="_blank"} — the canonical walkthrough, in multiple languages
- [Anonymity, privacy, pseudonymity, and confidentiality](./anonymity-vs-privacy.md) — the four properties a plan trades between
- [How platforms collect your data, and the microphone question](./platform-tracking.md) — what the "platform business model" adversary actually reaches, and what the evidence says about microphones
- [Maintaining multiple online identities](./multiple-identities.md) — when the plan says some activity has to be kept off your named identity, this decides how many layers and how to sustain them
- [What surveillance can actually do](./surveillance-capability.md) — the capability limits behind question two, layer by layer and sourced
- [What an ordinary person should actually do](../scenarios/everyday-baseline.md) — the plan already worked out for a reader with no specific adversary, ordered by how much each measure blocks
- [Scenarios](../scenarios/index.md) — worked threat models for specific roles and situations
