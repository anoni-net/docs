---
title: Passkey as your key
description: Create a passkey for anoni.net, store it in your password manager or keychain, test an unlock, then generate a backup key. No account, no server, nothing stored on this site.
icon: material/fingerprint
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
---

# :material-fingerprint: Passkey as your key

Create a passkey for this site and store it in your password manager or keychain. Whenever this site needs to protect your data, it asks the passkey to derive a key, and every time you approve with a fingerprint or PIN. No account, no server, no identifier ever leaves your device. What a passkey is, why it can act as a key and where the limits are: see [What is a passkey?](../tools/what-is-passkey.md).

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

<div id="passkey-tool"></div>
<script src="../../js/passkey.js"></script>

## How to use it

1. Press "Create a passkey". The browser asks where to store it. Pick something that syncs (iCloud Keychain, Google Password Manager, Bitwarden, 1Password) so your other devices can use the same one.
2. Press "Test unlock" to check the fingerprint or PIN flow. On another synced device, press it again to confirm it works there too.
3. Press "Generate a backup key". Store the secret key in your password manager, apart from the ciphertexts. The public key is what you paste as the "Backup key" when encrypting.

Then go to [local file encryption](age.md) and choose the "passkey" mode.

## What this key can do

After those three steps you hold two things: a passkey stored in your password manager or keychain, and a backup key pair.

Local file encryption is the only place on this site that uses it so far. Switch the key to "passkey" and encryption takes one fingerprint touch, with no passphrase to think of or type. The file is encrypted to the passkey and the backup key at the same time, so either one opens it.

The passphrase mode is still the right choice in these cases:

- You need to decrypt on another computer with the age command line tool, and that computer does not have your passkey
- You are sending the file to someone else, who cannot have your passkey
- You use Tor Browser, which disables WebAuthn entirely
- The device you need lacks PRF support, see the table below

Both modes produce standard age files. The only difference is who the recipients are. Making one copy in each mode and keeping them in different places works too.

## Where to store it

| Location | Syncs to other devices | PRF support |
|---|---|---|
| iCloud Keychain | Yes, across Apple devices | macOS 15 and iOS 18.4 or later |
| Google Password Manager | Yes | Chrome on Android |
| Bitwarden, 1Password, Dashlane | Yes | Supported |
| Windows Hello | This computer only | Windows 11 with the February 2026 update or later |
| USB security key | Carried with you | Not supported on this page. It needs a different way of keeping the identity |

## More than one device

A file in passkey mode is encrypted to the passkey and the backup key at the same time, so there are two ways across devices, with different costs.

### Let the passkey travel with you

Store it somewhere that syncs, such as the iCloud Keychain, Google Password Manager, Bitwarden or 1Password, and another device opens the file straight away with nothing to paste. The cost is that the password manager account becomes a single point: lose the account and the key is gone from every device at once.

### Open it with the backup private key

In an environment that keeps the credential local, such as Windows Hello, the other device does not have that passkey, so decryption means pasting the backup private key. This way depends on no cloud account at all. The cost is that the private key ends up on the clipboard and the screen more often, and once it leaks the encryption may as well not have happened.

A synced passkey on your main device, with the backup private key kept in a password manager as the last resort and stored somewhere else, suits most people.

## Things to keep in mind

- The passkey is bound to the `anoni.net` domain. Mirrors and onion addresses cannot use it, and Tor Browser turns WebAuthn off entirely.
- If the passkey is lost or the password manager account is gone, only the backup key opens the data. Lose that too and nobody can help.
- This site stores nothing about the passkey and cannot tell whether you created one. This page is empty every time you open it, on purpose.
- The first use needs a connection to fetch the code. After that it stays on the device.
