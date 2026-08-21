---
title: Threat model checklist
description: Answer the three questions (what you are protecting, who from, what you will spend) into a copyable checklist that also flags the mismatches in your answers. Nothing is saved; reloading clears it.
icon: material/clipboard-check-outline
---

# :material-clipboard-check-outline: Threat model checklist

<div id="threatmodel-tool"></div>

<script src="../../js/threatmodel.js"></script>

Two situations that bring people here:

- **Preparing to leave a controlling relationship while still living there**: The other person can still reach your phone and laptop during that period. Answering the three questions makes it plain: the device you are protecting and the person you are protecting against are under the same roof, and the budget question is really about not being noticed.
- **Newly joined an organisation and told to take security seriously, with no idea where to start**: Answer the questions, then read the mismatch section. Most people find they picked a pile of adversaries without a matching budget. That list is the starting point.

## What this page does

[How to build a threat model](../basics/threat-model.md) works through the three questions and then offers a procedure: take a sheet of paper or open a shared document and answer them in order. This page is that sheet.

The tiers match the article exactly: four categories of asset, six tiers of adversary, three levels of budget. Answering produces a plain-text summary you can copy, along with the pages worth reading first.

## The mismatches are the useful part

Each answer looks reasonable on its own. Put together they often do not hold. This page flags several combinations that come up repeatedly:

- **Law enforcement or state intelligence selected, with the lowest budget**: this is what the article means by "a plan you cannot keep up for three months is not a plan." One side has to move.
- **Protecting against someone close to you, without listing the device as an asset**: that tier's most common route is picking up your phone or laptop. A passcode and a screen lock usually matter more here than which messenger you choose.
- **Only a passer-by as adversary, yet planning to change how you work**: heavy machinery for a light problem, and the effort is usually abandoned within weeks.
- **Protecting the identity of sources, without listing contact relationships**: who talks to whom is itself the lead, and content encryption does not cover that layer.
- **Five or more adversaries selected**: one list per situation works better. Separate models for work and personal life are each clearer than one covering both.

Filling the form in, these are hard to spot. Listed side by side, they are obvious.

## Nothing is saved

What you enter stays in this tab. It is not written to localStorage, not to IndexedDB, not to a cookie, and not sent anywhere. Reloading returns the page to blank.

That is deliberate. An answer like "the person I am protecting against is someone close to me" is exactly the kind of thing that should not sit on the device, and that device may well be one the other person can reach. To keep a copy, press "Copy summary" and paste it somewhere you chose. That decision belongs to you.

One test in `tools/test_threatmodel.mjs` guards this, so that nobody later adds storage for the sake of convenience.

## This list is alive

Fill it in again when you change jobs, partners or cities, when you start working on something new and sensitive, or after a security incident. Each pass is not a rewrite; the question is whether what you wrote last time still holds.

## Next

Follow the suggested pages. When you get to choosing specific tools, every page in [the tools section](../tools/index.md) refers back to these three questions.

The other tools in this section line up with the answers too:

- Selected "who my sources are" in question one: the [invisible character detector](invisible.md) has a section on verifying a story without burning the source
- Selected "someone close to you" in question two: [what your browser reveals](leaks.md) shows what still identifies you after switching devices
- Selected "where I was and when" in question one: the [photo metadata remover](strip-metadata.md) covers the most common route by which that leaks
- Answered low in question three: the [passphrase and password generator](passphrase.md) is the smallest investment with the most direct effect

## Works offline

Like the rest of this section, the code is stored on your device and runs without a network. A blocked domain or a severed connection is exactly when this list most needs to open.

To take this page with you, see [offline reading](../offline.md).
