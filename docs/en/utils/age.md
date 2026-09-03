---
title: Local file encryption
description: Pick a file, type a passphrase, and encrypt it to the age format in your browser, or open an age file. Neither the file nor the passphrase leaves the device, and any computer with the age command-line tool can open the result.
icon: material/lock-outline
offline_assets:
  # typage and the noble and scure libraries it depends on are ES modules wired up by the
  # page's import map under vendor/age/. hooks/offline_index.py only sees <script src>, so
  # they are listed here one by one for offline copies. tools/test_agecrypt.mjs checks the
  # list against the vendor directory.
  - utils/asian-diceware-7776.txt
  - js/agecrypt-worker.js
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
---

# :material-lock-outline: Local file encryption

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

<div id="age-tool"></div>

<script src="../../js/passkey.js"></script>
<script src="../../js/agecrypt.js"></script>

## How to use it

1. Drop a file in, click to choose one, or paste some text into the box below. The tool reads the start to decide: an age file or an age text file gets decrypted, anything else gets encrypted.
2. Type a passphrase. When encrypting, "Draw a passphrase" picks six words from the Asian Diceware list. Write it down. It is gone when you close the page.
3. Press "Encrypt and download". The page decrypts the output again with the same passphrase and checks it against the original before offering the download. The file name is the original with `.age` added. Decrypting removes the `.age`. In a slow environment the page shows an estimate first and lets you decide. If you go on, the check pass is skipped.

The output is a standard age file. Any computer with the command-line tool opens it, without this site:

```
age -d -o backup.tar backup.tar.age
```

What age is, what the format looks like and how it differs from PGP are on [What is age?](../tools/what-is-age.md).

## Across devices, through your password manager

Paste text to encrypt, or tick "Output as text" when encrypting a file, and you get plain text starting with `-----BEGIN AGE ENCRYPTED FILE-----`. Store it together with the passphrase in the password manager you already use (a secure note in Bitwarden, Proton Pass or 1Password all work). Open this page on another device, paste it back, type the passphrase, and it decrypts. Your manager does the syncing. This site stores nothing.

Saved to a file, the text form is still a standard age file and the command-line tool recognises it on its own:

```
age -d -o note.txt note.txt.age
```

The text form is a third larger than the binary, so files over 64 KB only get the binary download. Password manager notes rarely hold more than that anyway.

## Using a passkey as the key

Switch the key to "Passkey" when encrypting and there is no passphrase to remember. The browser shows a prompt, you approve once with a fingerprint or PIN, and the file is encrypted to your passkey. Before the first use, go to [Passkey as your key](passkey.md) to create one and generate a backup key. The backup key's public half is a required field here: if the passkey is lost or you move to an unsupported environment, only the backup secret opens the file. When decrypting, the tool reads the header to decide whether to ask for a passphrase, the passkey or the backup secret. Files encrypted with the age command line to an `age1` public key can be opened here by pasting the secret. Files in passkey mode only open on this site. The reasons are on [What is a passkey?](../tools/what-is-passkey.md).

## The passphrase is everything

This page does passphrase mode only, so there are no keys to manage, at the cost that the strength of the encryption is exactly the strength of the passphrase. scrypt makes every guess cost a fraction of a second, which holds against brute force but not against a guessable passphrase. Six words or more, not a quote or a lyric, never used elsewhere. The reasoning is in [Asian Diceware](../tools/asian-diceware.md). Nobody can recover a forgotten passphrase, so back up the passphrase too, on paper, somewhere other than where the backup is.

## Things to keep in mind

- The whole file is processed in memory, and anything over 200 MB is refused up front. Split large backups, or use the command-line tool directly.
- The file name is not inside the ciphertext. The output name is the original plus `.age`, visible to anyone. Give backups a name that gives nothing away.
- Files encrypted to a key (a public key starting with `age1`) cannot be opened here. That needs the private key and the command-line tool.
- The first use needs a connection to fetch the code. After that it stays on the device.
- Browsers with the JavaScript JIT off compute scrypt fifty times slower or more. One pass took 50 seconds on a desktop in testing. IronFox turns the JIT off by default (Settings, Security), and Tor Browser's Safer level does too. The tool measures first and shows an estimate. The page stays usable while it works.

## Works offline

Like the rest of this section, the code stays on your device once stored and works without a network. That is the most direct proof that neither the file nor the passphrase was sent anywhere.

To take this page with you, see [offline reading](../offline.md).
