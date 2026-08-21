---
title: Threat model checklist
description: Answer the three questions (what you are protecting, who from, what you will spend) into a copyable checklist that also flags the mismatches in your answers. Nothing is saved; reloading clears it.
icon: material/clipboard-check-outline
---

# :material-clipboard-check-outline: Threat model checklist

<div id="threatmodel-tool"></div>

<script src="../../js/threatmodel.js"></script>

## What this page does

[How to build a threat model](../basics/threat-model.md) works through the three questions and then offers a procedure: take a sheet of paper or open a shared document and answer them in order. This page is that sheet.

The tiers match the article exactly: four categories of asset, six tiers of adversary, three levels of budget. Answering produces a plain-text summary you can copy, along with the pages worth reading first.

## The mismatches are the useful part

Each answer looks reasonable on its own. Put together they often do not hold. This page flags several combinations that come up repeatedly:

- **Law enforcement or state intelligence selected, with the lowest budget.** This is what the article means by "a plan you cannot keep up for three months is not a plan." One side has to move.
- **Protecting against someone close to you, without listing the device as an asset.** That tier's most common route is picking up your phone or laptop. A passcode and a screen lock usually matter more here than which messenger you choose.
- **Only a passer-by as adversary, yet planning to change how you work.** Heavy machinery for a light problem, and the effort is usually abandoned within weeks.
- **Protecting the identity of sources, without listing contact relationships.** Who talks to whom is itself the lead, and content encryption does not cover that layer.
- **Five or more adversaries selected.** One list per situation works better. Separate models for work and personal life are each clearer than one covering both.

Filling the form in, these are hard to spot. Listed side by side, they are obvious.

## Nothing is saved

What you enter stays in this tab. It is not written to localStorage, not to IndexedDB, not to a cookie, and not sent anywhere. Reloading returns the page to blank.

That is deliberate. An answer like "the person I am protecting against is someone close to me" is exactly the kind of thing that should not sit on the device, and that device may well be one the other person can reach. To keep a copy, press "Copy summary" and paste it somewhere you chose. That decision belongs to you.

One test in `tools/test_threatmodel.mjs` guards this, so that nobody later adds storage for the sake of convenience.

## This list is alive

Fill it in again when you change jobs, partners or cities, when you start working on something new and sensitive, or after a security incident. Each pass is not a rewrite; the question is whether what you wrote last time still holds.

## Next

Follow the suggested pages. When you get to choosing specific tools, every page in [the tools section](../tools/index.md) refers back to these three questions.

## Works offline

Like the rest of this section, the code is stored on your device and runs without a network. A blocked domain or a severed connection is exactly when this list most needs to open.

To take this page with you, see [offline reading](../offline.md).
