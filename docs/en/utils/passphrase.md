---
title: Passphrase and password generator
description: Generate Diceware passphrases and random passwords in your browser, using the 7776-word asian-diceware list and the browser's cryptographic random source. Everything happens on your device, and it works with the network off.
icon: material/dice-multiple-outline
offline_assets:
  - utils/asian-diceware-7776.txt
---

# :material-dice-multiple-outline: Passphrase and password generator

<div id="passphrase-tool"></div>

<script src="../../js/passphrase.js"></script>

## What this does

Passphrase mode draws words independently from the 7776-word [asian-diceware](../tools/asian-diceware.md) list. That list is the community's take on the EFF Diceware wordlist, mixing in loanwords that already sit in English dictionaries, such as `oolong`, `boba` and `tofu`, so that readers around Taiwan and the wider region find them easier to recognise and remember.

Password mode draws characters one at a time from the sets you tick. It suits anything you keep in a password manager and never type by hand.

Both modes draw from `crypto.getRandomValues`, the browser's cryptographic random source, which is not the same thing as `Math.random`. Sampling discards the values in the remainder that cannot divide evenly and draws again, so every word has exactly the same chance. The details and the tests are in the [source](https://github.com/anoni-net/docs/blob/main/docs/zh-TW/js/passphrase.js){target="_blank"}.

## About that entropy number

Entropy measures how many guesses it takes, in bits. Each extra bit doubles the work.

Drawing six times from 7776 words gives about 77.5 bits. That holds even if the attacker knows which list you used and how many words you drew: they still face 2^77.5 combinations. EFF suggests at least six words for ordinary use, and seven or eight for a master password or a disk key that you keep for years.

Do not protect anything important with fewer than five words. The tool marks those as weak.

## Why a web page can be trusted with this

The obvious worry about any password generator is whether the site quietly sends the result somewhere.

The answer here is that **it keeps working with the network off**. A browser with no network cannot send anything, and the tool still produces passphrases, because the word list and the code are already stored on your device (see [offline reading](../offline.md)). No amount of reassuring text can match that.

If you would rather not trust even this, switch to the physical dice mode.

## Physical dice, with nothing to trust on this machine

Diceware was always a dice method. The order of the wordlist is itself the encoding: the first word is `11111`, the last is `66666`, and everything between counts in base six.

Roll five dice, press the faces in the order you rolled them, and five presses look up one word. Repeat for as many words as you want.

In this mode the randomness comes from your hands rather than from this machine. Whether `crypto.getRandomValues` can be trusted, whether this page's code has been swapped out: neither question matters any more, because all the page does is look words up.

You can check that part too. "Download the full table" gives you a plain text file, 7776 lines, each one an encoding and its word. Print it or file it away, and this page stops being necessary.

A few practical notes:

- Dice should be fair. Cheap plastic dice are biased; casino-grade precision dice are the ones that are genuinely uniform. Ordinary dice are good enough for everyday use, but it is worth knowing the difference.
- Do not use a dice-rolling app. That loops straight back to trusting software.
- Rolling five dice at once beats rolling one five times, but you need to keep track of the order. Different coloured dice help.
- The entropy matches the generated mode exactly: each roll is log2(6^5), the same as drawing once from 7776 words, about 12.9 bits.

For where the list came from and how words were chosen, see [Asian Diceware](../tools/asian-diceware.md).

## Clear the clipboard afterwards

Copy puts the result on the system clipboard, where other programs can read it, and where some input methods and sync services upload it. Once it is in your password manager, copy something harmless to overwrite it.

Be extra careful on phones, where the clipboard is often shared across apps.

## Next

- Somewhere to keep what you generated: [password managers](../tools/password-manager.md)
- How the list was built and what the selection rules were: [Asian Diceware](../tools/asian-diceware.md)
- Taking this page with you: [offline reading](../offline.md)
