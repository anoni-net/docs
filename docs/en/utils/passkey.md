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

Create a passkey for this site and store it in your password manager or keychain. Whenever this site needs to protect your data, it asks the passkey to unlock, and every time you approve with a fingerprint, your face or a PIN. No account, no server, no identifier ever leaves your device. The key is only as strong as the place that keeps it: anyone who knows your phone unlock code, or can open your password manager, can open it too. One passkey has two uses on this site, described separately below. What a passkey is, what mechanism each use relies on and where the limits are: see [What is a passkey?](../tools/what-is-passkey.md).

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
<script src="../../js/vault.js"></script>
<script src="../../js/passkey.js"></script>

## How to use it

1. Press "Create passkey". The browser asks where to store it. Choose something that syncs (iCloud Keychain, Google Password Manager, Bitwarden, 1Password) so your other devices can use the same one. Before creating it, make sure that account is not shared with the person you are protecting against: a shared iCloud or Google account syncs the passkey onto their devices too, see [digital preparation for survivors of domestic abuse](../scenarios/domestic-violence.md). On Windows the browser first offers to keep it on this computer (Windows Hello); to sync, pick your password manager or Google account instead. Once created, the page tells you which abilities this passkey has.
2. For the checklist and similar tools, you are done here. Open [my preparation checklist](checklist.md) and press "Open with my existing key".
3. For local file encryption, press "Test an unlock" first to confirm this environment can derive a key, then "Generate a backup key" and store the secret in your password manager, apart from the ciphertexts. Then go to [local file encryption](age.md) and choose the "passkey" mode.

## What this key can do

One passkey has two uses on this site. The mechanisms differ, and so do the environments each one works in.

### The stash

When the passkey is created, the site generates a data key and stores it inside the passkey, where it travels with it. Verify once on any device that has this passkey and the data key comes back; the site uses it to open the ciphertext kept on your device. [My preparation checklist](checklist.md), saved answers on the [threat model checklist](threat-model.md) and the address book inside local file encryption all live in this stash, sharing one ciphertext. The specification requires every storage method to return it, and we have verified it with Bitwarden on an iPhone and Chrome on a computer. The data key sits alongside the passkey in your password manager, so its security equals the manager's: anyone who knows your screen lock or master password, a shared vault, an export file, all reach it. Details on [What is a passkey?](../tools/what-is-passkey.md).

Lose the passkey and the stash cannot be opened. For the checklist, tick again. Saved threat model answers and the address book go with it, so if you want a way back, keep a second copy with "Export" or "Send to another device" on the checklist page.

### File encryption

[Local file encryption](age.md) asks the passkey to derive a key on the spot with PRF. The difference from the stash: the data key is a field inside the credential, visible to the password manager and possibly carried in exports, whereas the PRF secret only ever leaves the authenticator as a derived result, and neither the page nor any screen shows the secret itself. If the password manager itself is opened, neither use holds. The cost is that only some storage methods can do it, see the table below. By default the file is encrypted to the passkey and the backup key at the same time, so either one opens it. The backup half can be turned off, which leaves the passkey as the only way in; the encryption tool spells out that cost on screen.

A few situations still call for passphrase mode:

- You want to open it on another computer with the age command line, and that computer does not have your passkey
- You want to give it to someone else, who cannot have your passkey
- You use Tor Browser, which turns WebAuthn off entirely
- The device you need cannot derive the key, see the table below

Both modes produce standard age files; only the recipient differs. Making one copy each way and keeping them apart is also fine.

## Where to store it

Other sites use a passkey to sign in, which only needs a signature proving it is you, and any storage can do that. The stash needs nothing more. File encryption asks for one thing extra, deriving an encryption key, and that ability exists only where the storage method has implemented it. So the same passkey works fine on other sites and in the stash, yet may derive no key for file encryption. The table lists which ones can. If you only use stash tools such as the checklist, every row works; read the third column and ignore the fourth, which concerns file encryption only.

| Stored in | Syncs to other devices | Stash | Derives a key for file encryption |
|---|---|---|---|
| iCloud Keychain | Yes, between Apple devices | Yes | macOS 15, iOS 18.4 and later |
| Google Password Manager | Yes | Yes | Chrome on Android |
| Bitwarden, 1Password, Dashlane | Yes | Yes | Browser extensions on a computer yes, the iPhone and iPad apps no |
| Windows Hello | This computer only | Yes | Windows 11 from the February 2026 update |
| USB security key | Travels with you | Not on this page | Not on this page; it needs a different storage method |

### Only file encryption needs the iCloud Keychain on iPhone and iPad

For the stash alone, any storage will do. For file encryption, choose the iCloud Keychain when creating. Apple's implementation does not pass the data needed to derive a key to anything other than the iCloud Keychain, so with a third-party password manager app the passkey is created and the key page reports that it only works for the stash. The cross-device route, scanning a QR code on another device to create it, does not get it either. Create the passkey directly on whichever device you want file encryption on.

## More than one device

Three routes, for different situations.

### Let the passkey travel with you

Stored somewhere that syncs, another device opens the site and everything just opens, stash and file encryption alike. The cost is that the password manager account becomes a single point: lose the account and the keys on every device go with it.

### Enrol another device

When the passkey did not sync to the second device (say a phone on the iCloud Keychain and a computer on Windows Hello), unlock [my preparation checklist](checklist.md) and press "Enrol another device"; on the other device press "Enrol this device with a key from another", photograph the QR code or paste the string, and that device gets a passkey with the same data key. This route serves the stash only. The string on screen is the data key itself, so use it only between your own two devices. Move the stash data afterwards with "Send to another device". Once that string has been photographed it cannot be recalled, and there is no way to rotate it; the only remedy is to clear the stash, create a new passkey and move the data back. If you end up with more than one passkey, the password manager only shows the date and time each was created and cannot tell which one can do file encryption. The key page reads out the name and says whether this one can, right after creation; rename it in the password manager (say by adding "file encryption") so the picker tells them apart, and "Test an unlock" also tells them apart later.

### Open files with the backup secret key

In an environment like Windows Hello, where the passkey stays on one machine, the other device has no passkey, so paste the backup secret key when decrypting. This route serves file encryption only. It depends on no cloud account, at the cost that the secret key shows up on clipboards and screens more often, and once it leaks the encryption is as good as gone.

A syncing passkey on your main devices, with the backup secret key in a password manager as the last resort, stored apart from each other, suits most people.

## Things to keep in mind

- The passkey is bound to the `anoni.net` domain. Mirrors and onion addresses cannot use it, and Tor Browser turns WebAuthn off entirely.
- If the passkey is lost or the password manager account disappears, files encrypted with it open only with the backup key; lose that too and they are gone for good, and nobody can help. The stash is left with whatever copy you kept via export or send to another device.
- This site stores nothing about the passkey and cannot tell whether you created one. This page is empty every time you open it, on purpose.
- The first use needs a connection to fetch the code. After that it stays on the device.
- To delete the passkey: on iPhone search for anoni.net under Settings, Passwords; on Android, Google Password Manager; in Bitwarden or 1Password, its own item. "Clear the stash on this device" on the checklist page only deletes the ciphertext on that device; the passkey is deleted separately.
- Password manager exports and shared vaults carry the passkey, and with it the stash data key. Keep track of where they go.
- The checklist page does not lock by itself once unlocked. Press "Lock" before you walk away.
