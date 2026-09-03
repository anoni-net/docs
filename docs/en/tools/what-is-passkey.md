---
title: What is a passkey?
description: A passkey is a credential kept in your password manager or keychain. With the PRF extension it can derive an encryption key. Why it can act as the key to your data on this site, how it differs from a passphrase, and where the limits are.
icon: material/fingerprint
---

# :material-fingerprint: What is a passkey?

A passkey is a credential kept on your device or in your password manager. When a site asks it to sign, you approve with a fingerprint, your face or a PIN, and it signs. Passkeys are normally used to log in. This site uses them for something else entirely: no login, no account, no server. The passkey does one job here, deriving an encryption key.

## Why a passkey can be a key

The WebAuthn PRF extension gives the passkey an extra secret that never leaves the authenticator. Each time the page asks and you approve, the authenticator returns a fixed 32-byte output for the input the page supplied. The same passkey with the same input always yields the same output. The passkey becomes a key calculator that only answers when you touch the sensor.

[Local file encryption](../utils/age.md) on this site uses that output to wrap the age file key. Without the passkey, no key can be derived and the data is just ciphertext. That is different from "show it after verification", which is a gate written into the page that anyone can step around. This is arithmetic.

## How it differs from a passphrase

| | Passphrase | Passkey |
|---|---|---|
| What to remember | Six or more words | Nothing. A fingerprint or PIN |
| Where the strength comes from | The passphrase itself, with scrypt slowing guesses | A random secret inside the authenticator. Nothing to guess |
| Across devices | The passphrase travels with you | The passkey has to sync. It exists only on synced devices |
| Where it can be opened | Any computer with the age command-line tool | Only on the anoni.net site, in a browser that supports it |
| If lost | Forget it and the data is gone | Lose it and the data is gone, hence the backup key |
| Tor Browser | Works | Does not. WebAuthn is turned off entirely |

Files in passphrase mode open anywhere. Files in passkey mode are tied to this domain and your devices. Both modes produce standard age files. Only the recipient differs.

## Limits

The passkey is bound to the `anoni.net` RP ID. Browsers only allow it on the same domain, so mirrors and onion addresses cannot use it. Tor Browser turns WebAuthn off entirely, with `security.webauth.webauthn` set to false in its default profile.

PRF support as of March 2026: Safari 18, Chrome 132 and Firefox 139 on macOS 15 or later, iOS 18.4 or later, Chrome on Android with Google Password Manager, and Windows 11 only from the February 2026 update. 1Password, Bitwarden and Dashlane support it. Firefox on Android and Windows 10 do not.

If the passkey is lost, the password manager account disappears, or you move to an environment without PRF, the data is gone forever. That is why the flow on this site requires an X25519 backup key, and files are encrypted to both. Keep the backup key apart from the ciphertexts.

## What this site stores

Nothing. Browsers do not let a page ask whether a passkey exists for a domain, every such query shows a prompt, so the site cannot even tell whether you created one. The passkey page is empty every time you open it. Every key derivation needs your approval on the spot.

## Related reading

- [Passkey as your key](../utils/passkey.md): create, test an unlock, generate a backup key.
- [What is age?](what-is-age.md): the passkey wraps the age file key.
- [Local file encryption](../utils/age.md): choose the "passkey" mode.
