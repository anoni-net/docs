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

If you would rather not trust even this, roll physical dice and look the words up as described in [asian-diceware](../tools/asian-diceware.md). That depends on no software at all and is how Diceware was meant to work. This tool is for when you are in a hurry or have no dice at hand, and it does not replace that.

## Clear the clipboard afterwards

Copy puts the result on the system clipboard, where other programs can read it, and where some input methods and sync services upload it. Once it is in your password manager, copy something harmless to overwrite it.

Be extra careful on phones, where the clipboard is often shared across apps.

## Next

- Somewhere to keep what you generated: [password managers](../tools/password-manager.md)
- How the list was built and what the selection rules were: [Asian Diceware](../tools/asian-diceware.md)
- Taking this page with you: [offline reading](../offline.md)
