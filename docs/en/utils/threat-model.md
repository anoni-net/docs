---
title: Threat model checklist
description: Turn your answers to the three questions (what you are protecting, who from, what you will spend) into a copyable checklist that also flags the mismatches. Nothing is saved unless you choose to keep it, encrypted with a passkey on your device.
icon: material/clipboard-check-outline
offline_assets:
  # typage 與相依的 noble、scure 由 import map 接到 vendor/age/，hooks/offline_index.py 只認
  # <script src>，所以逐一列在下面。清單由 tools/test_agecrypt.mjs 對照 vendor 目錄。
  - utils/vendor/age/age-encryption/dist/armor.js
  - utils/vendor/age/age-encryption/dist/cbor.js
  - utils/vendor/age/age-encryption/dist/format.js
  - utils/vendor/age/age-encryption/dist/index.js
  - utils/vendor/age/age-encryption/dist/io.js
  - utils/vendor/age/age-encryption/dist/recipients.js
  - utils/vendor/age/age-encryption/dist/stream.js
  - utils/vendor/age/age-encryption/dist/webauthn.js
  - utils/vendor/age/age-encryption/dist/x25519.js
  - utils/vendor/age/noble-ciphers/_arx.js
  - utils/vendor/age/noble-ciphers/_poly1305.js
  - utils/vendor/age/noble-ciphers/chacha.js
  - utils/vendor/age/noble-ciphers/utils.js
  - utils/vendor/age/noble-curves/abstract/curve.js
  - utils/vendor/age/noble-curves/abstract/edwards.js
  - utils/vendor/age/noble-curves/abstract/fft.js
  - utils/vendor/age/noble-curves/abstract/hash-to-curve.js
  - utils/vendor/age/noble-curves/abstract/modular.js
  - utils/vendor/age/noble-curves/abstract/montgomery.js
  - utils/vendor/age/noble-curves/abstract/oprf.js
  - utils/vendor/age/noble-curves/abstract/weierstrass.js
  - utils/vendor/age/noble-curves/ed25519.js
  - utils/vendor/age/noble-curves/nist.js
  - utils/vendor/age/noble-curves/utils.js
  - utils/vendor/age/noble-hashes/_md.js
  - utils/vendor/age/noble-hashes/_u64.js
  - utils/vendor/age/noble-hashes/hkdf.js
  - utils/vendor/age/noble-hashes/hmac.js
  - utils/vendor/age/noble-hashes/pbkdf2.js
  - utils/vendor/age/noble-hashes/scrypt.js
  - utils/vendor/age/noble-hashes/sha2.js
  - utils/vendor/age/noble-hashes/sha3.js
  - utils/vendor/age/noble-hashes/utils.js
  - utils/vendor/age/noble-post-quantum/_crystals.js
  - utils/vendor/age/noble-post-quantum/hybrid.js
  - utils/vendor/age/noble-post-quantum/ml-kem.js
  - utils/vendor/age/noble-post-quantum/utils.js
  - utils/vendor/age/scure-base/index.js
  - js/vault.js
  - js/threatmodel.js
---

# :material-clipboard-check-outline: Threat model checklist

<script type="importmap">
{
  "imports": {
    "age-encryption": "../vendor/age/age-encryption/dist/index.js",
    "@noble/ciphers/chacha.js": "../vendor/age/noble-ciphers/chacha.js",
    "@noble/curves/abstract/edwards.js": "../vendor/age/noble-curves/abstract/edwards.js",
    "@noble/curves/abstract/fft.js": "../vendor/age/noble-curves/abstract/fft.js",
    "@noble/curves/abstract/montgomery.js": "../vendor/age/noble-curves/abstract/montgomery.js",
    "@noble/curves/abstract/weierstrass.js": "../vendor/age/noble-curves/abstract/weierstrass.js",
    "@noble/curves/ed25519.js": "../vendor/age/noble-curves/ed25519.js",
    "@noble/curves/nist.js": "../vendor/age/noble-curves/nist.js",
    "@noble/curves/utils.js": "../vendor/age/noble-curves/utils.js",
    "@noble/hashes/hkdf": "../vendor/age/noble-hashes/hkdf.js",
    "@noble/hashes/hkdf.js": "../vendor/age/noble-hashes/hkdf.js",
    "@noble/hashes/hmac": "../vendor/age/noble-hashes/hmac.js",
    "@noble/hashes/hmac.js": "../vendor/age/noble-hashes/hmac.js",
    "@noble/hashes/scrypt.js": "../vendor/age/noble-hashes/scrypt.js",
    "@noble/hashes/sha2": "../vendor/age/noble-hashes/sha2.js",
    "@noble/hashes/sha2.js": "../vendor/age/noble-hashes/sha2.js",
    "@noble/hashes/sha3.js": "../vendor/age/noble-hashes/sha3.js",
    "@noble/hashes/utils": "../vendor/age/noble-hashes/utils.js",
    "@noble/hashes/utils.js": "../vendor/age/noble-hashes/utils.js",
    "@noble/post-quantum/hybrid.js": "../vendor/age/noble-post-quantum/hybrid.js",
    "@scure/base": "../vendor/age/scure-base/index.js"
  }
}
</script>

<div id="threatmodel-tool"></div>
<script src="../../js/vault.js"></script>
<script src="../../js/threatmodel.js"></script>

Two situations where this comes up:

- **Preparing to leave a controlling relationship while still living there**: The other person can still reach your phone and laptop during that period. Answering the three questions makes it plain: the device you are protecting and the person you are protecting against are under the same roof, and the budget question is really about not being noticed.
- **Newly joined an organisation and told to take security seriously, with no idea where to start**: Answer the questions, then read the mismatch section. Most people find they picked a pile of adversaries without a matching budget. That list is the starting point.

## What this page does

[How to build a threat model](../basics/threat-model.md) works through the three questions and then offers a procedure: take a sheet of paper or open a shared document and answer them in order. This checklist is that sheet, on the web.

The tiers match the article exactly: four categories of asset, six tiers of adversary (from someone idly looking through your phone up to a state intelligence service), three levels of budget. Answering produces a plain-text summary you can copy, along with the pages worth reading first.

## The mismatches are the useful part

Each answer looks reasonable on its own. Put together they often do not hold. Several combinations that come up repeatedly get flagged:

- **Law enforcement or state intelligence selected, with the lowest budget**: this is what the article means by "a plan you cannot keep up for three months is not a plan." One side has to move.
- **Protecting against someone close to you, without listing the device as an asset**: that tier's most common route is picking up your phone or laptop. A passcode and a screen lock usually matter more here than which messenger you choose.
- **Only a passer-by as adversary, yet planning to change how you work**: heavy machinery for a light problem, and the effort is usually abandoned within weeks.
- **Protecting the identity of sources, without listing contact relationships**: who talks to whom is itself the lead, and content encryption does not cover that layer.
- **Five or more adversaries selected**: one list per situation works better. Separate models for work and personal life are each clearer than one covering both.

These are hard to spot while filling in the form. Listed side by side, they stand out: an adversary set to state level against the lowest budget, for instance.

## Nothing is saved by default

What you enter stays in the browser tab. It is not written to any form of browser storage and is not sent anywhere; reloading returns the page to blank. To keep a copy there are two routes: press "Copy summary" and paste it somewhere you chose, or press "Save to my stash" to keep it on this device encrypted with your [passkey](passkey.md), in the same ciphertext as [my preparation checklist](checklist.md). Both take a deliberate press; the page does not decide for you. Next time, the top of the page asks whether to fill in last time's answers.

One case gets no save option: someone close to you, law enforcement or state intelligence as an adversary. They can reach your device and may be able to make you unlock it, and a passkey is no stronger than the screen lock. A password manager with its own master password that has already locked adds one more step, but do not rest your safety on it. An answer like "the person I am protecting against is someone close to me" is exactly what should not sit on a device they can reach. Copy the summary instead, and paste it somewhere they cannot get to.

A test covers three things: this page touches no storage itself, saving only goes through the passkey stash, and the save option disappears for those adversaries.

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

Like the rest of this section, the code is stored on your device and runs without a network. A blocked domain or a severed connection is exactly when you'll most want this list open.

To take this page with you, see [offline reading](../offline.md).
