---
title: What is a passkey?
description: A passkey is a credential kept in your password manager or keychain. This site uses it as the key to your data through two mechanisms, keeping a data key inside the passkey, or deriving a key on the spot with the PRF extension. Why each one holds, how it differs from a passphrase, and where the limits are.
icon: material/fingerprint
---

# :material-fingerprint: What is a passkey?

A passkey is a credential kept on your device or in your password manager. When a site asks it to sign, you approve with a fingerprint, your face or a PIN, and it signs. Passkeys are normally used to log in. This site uses them for something else entirely: no login, no account, no server. Here the passkey is the key to your data, through the two mechanisms below. One passkey can do both, and the [key page](../utils/passkey.md) tells you which abilities yours has when you create it.

## Use one, the data key travels inside the passkey

When a WebAuthn credential is created, it can carry a piece of identifying data, called the user handle in the specification and stored in the `user.id` field, and the authenticator returns it unchanged on every later verification. What this site puts there is a randomly generated data key. Verify once with the passkey on any device and the data key comes back to the page, which uses it to open the ciphertext kept on your device.

`user.id` is a core field. Every storage method returns it as the specification requires, including a third-party password manager on an iPhone. [My preparation checklist](../utils/checklist.md), saved answers on the [threat model checklist](../utils/threat-model.md) and the address book inside local file encryption all live in one such stash, sharing one ciphertext.

The cost is that the data key sits alongside the passkey in your password manager, so its security equals the manager's: whoever can unlock your password manager gets the key. That is the same level as the screen lock on your device, enough for most people, and not enough against an adversary who can reach your device and may be able to make you unlock it. The threat model checklist offers no save option against such adversaries.

## Use two, PRF derives a key on the spot

The WebAuthn PRF extension gives the passkey an extra secret that never leaves the authenticator. Each time the page asks and you approve, the authenticator returns a fixed 32-byte output for the input the page supplied. The same passkey with the same input always yields the same output. The passkey becomes a key calculator that only answers when you touch the sensor.

[Local file encryption](../utils/age.md) on this site uses that output to wrap the age file key. Without the passkey, no key can be derived and the data is just ciphertext. That is different from "show it after verification", which is a gate written into the page that anyone can step around. This is arithmetic.

One level stronger than use one, since the secret is never in the password manager's hands. The cost is that the storage method has to implement the extension; see the limits below for what supports it.

## How it differs from a passphrase

| | Passphrase | Passkey |
|---|---|---|
| What to remember | Six or more words | Nothing. A fingerprint or PIN |
| Where the strength comes from | The passphrase itself, with scrypt slowing guesses | A random secret in the authenticator (file encryption) or a data key in the password manager (stash). Nothing to guess either way |
| Across devices | The passphrase travels with you | Wherever the passkey has synced. For a device it did not sync to, the stash can enrol it and file encryption can take the backup secret key |
| Where it can be opened | Any computer with the age command-line tool | Only on the anoni.net site, in a browser that supports it |
| If lost | Forget it and the data is gone | Lose it and the data is gone. File encryption adds a backup key by default; for the stash, keep a second copy with export or send to another device |
| Tor Browser | Works | Does not. WebAuthn is turned off entirely |

Files in passphrase mode open anywhere. Files in passkey mode are tied to this domain and your devices. Both modes produce standard age files. Only the recipient differs.

## Limits

The passkey is bound to the `anoni.net` RP ID. Browsers only allow it on the same domain, so mirrors and onion addresses cannot use it. Tor Browser turns WebAuthn off entirely, with `security.webauth.webauthn` set to false in its default profile. Both of these apply to both uses.

What follows affects file encryption only. PRF support as of March 2026: Safari 18, Chrome 132 and Firefox 139 on macOS 15 or later, iOS 18.4 or later, Chrome on Android with Google Password Manager, and Windows 11 only from the February 2026 update. On the desktop the 1Password, Bitwarden and Dashlane browser extensions support it. Firefox on Android and Windows 10 do not.

iPhone and iPad carry two further limits. Apple's implementation does not pass the data PRF needs to anything other than the iCloud Keychain, so a passkey saved into a third-party password manager app on iOS is created successfully yet derives no key, and that one serves the stash only. The cross-device flow, meaning the one where you scan a QR code on another device, does not get PRF either. For file encryption on an iPhone, create the passkey on the iPhone and pick the iCloud Keychain.

If the passkey is lost, the password manager account disappears, or you move to an environment without PRF, files encrypted with it are gone forever. That is why the flow on this site adds an X25519 backup key by default, and files are encrypted to both. That half can be turned off in the encryption tool, which leaves the passkey as the only way in. Keep the backup key apart from the ciphertexts.

## What this site stores

Nothing. Browsers do not let a page ask whether a passkey exists for a domain, every such query shows a prompt, so the site cannot even tell whether you created one. The key page is empty every time you open it. Every unlock needs your approval on the spot.

## Related reading

- [Passkey as your key](../utils/passkey.md): create it, the next step for each use, where to store it, more than one device.
- [My preparation checklist](../utils/checklist.md): the first tool built on use one, ticks encrypted on your device.
- [Threat model checklist](../utils/threat-model.md): answers are not saved by default; keeping them puts them in the same stash.
- [Local file encryption](../utils/age.md): use two, choose the "passkey" mode.
- [What is age?](what-is-age.md): the passkey wraps the age file key.
