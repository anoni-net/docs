---
title: What is age?
description: age is a file encryption format and tool from 2019 whose specification fits on one page, with no options to get wrong and keys that are a single line. How to use it, what the format looks like, how it differs from PGP, and why the planned local file encryption tool on this site chose it over PGP.
icon: material/file-key-outline
---

# :material-file-key-outline: What is age?

You need to encrypt a backup before it goes to the cloud, or hand a file to one other person. Most people think of PGP first, then give up somewhere between generating a key, importing the other side's key and choosing a trust level. [age](https://github.com/FiloSottile/age){target="_blank"} was designed from scratch for exactly that job, encrypting a file to a person or a passphrase: a key is one line, there are no options, there is one file format, and the specification fits on a page.

The [local file encryption tool](https://github.com/anoni-net/docs/issues/421){target="_blank"} planned for this site produces age files. This page covers what age is, how to use it, how it differs from PGP, and why it was chosen.

## What age is

age was designed by Filippo Valsorda, maintainer of the Go cryptography libraries, and published in 2019. The format is maintained under [C2SP](https://github.com/C2SP/C2SP/blob/main/age.md){target="_blank"}, the community cryptography specification project, and its URL is literally the first line of every file: `age-encryption.org/v1`. The author's own description is "a simple, modern and secure file encryption tool, format, and Go library", with design goals stated plainly: small explicit keys, no configuration options, UNIX-style composability.

Three implementations open each other's files:

- [age](https://github.com/FiloSottile/age){target="_blank"}: the reference implementation and command-line tool, in Go.
- [rage](https://github.com/str4d/rage){target="_blank"}: a Rust implementation with the same command-line interface.
- [typage](https://github.com/FiloSottile/typage){target="_blank"}: a TypeScript implementation that runs in the browser, which the tool on this site will use.

A plugin mechanism lets hardware keys such as a YubiKey act as recipients, and the command-line tool can also encrypt directly to SSH public keys. Since 2025 the specification includes post-quantum hybrid recipient types, enabled in the command-line tool with `-pq`.

## How to use it

Install with `brew install age` on macOS and Linux, `apt install age` on Debian 12 and later, or `winget install --id FiloSottile.age` on Windows.

Passphrase mode needs no keys at all:

```
age -p -o backup.tar.age backup.tar
age -d -o backup.tar backup.tar.age
```

The first line asks for the passphrase twice, the second asks once when decrypting. The strength of the passphrase is the strength of the whole file. Draw six words or more with the [passphrase generator](../utils/passphrase.md), for the reasons given in [Asian Diceware](./asian-diceware.md).

Public-key mode encrypts a file to a specific person:

```
age-keygen -o key.txt
age -r age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p -o file.age file
age -d -i key.txt -o file file.age
```

The private key file written by `age-keygen` also carries the public key. That 62-character line starting with `age1` is the recipient you can hand out openly. `-r` can be repeated for several recipients, and any of them can open the same ciphertext. Adding `-a` turns the output into plain text that can be pasted into an email or a chat window.

## What the format looks like

The first few lines of an age file are plain text and show up in any text editor:

```
age-encryption.org/v1
-> X25519 <base64 ephemeral public key>
<base64>
--- <header MAC>
```

The first line is the version. Each block starting with `->` is a recipient stanza, one per recipient, holding the file key wrapped with that recipient's key. Passphrase mode has exactly one stanza of type `scrypt`, carrying a 16-byte salt and the work factor. The `---` line is an HMAC-SHA-256 over the whole header, so any change to a stanza is detected.

After the header comes the payload, encrypted with ChaCha20-Poly1305 in 64 KiB chunks. Every chunk carries its own authentication tag, and the chunk order and the final-chunk marker are encoded in the nonce. Three things follow: any modified byte is rejected at decryption time, large files can be processed as a stream without loading them whole into memory, and the ciphertext is slightly larger than the original (16 bytes per 64 KiB plus the header).

In public-key mode the recipient stanza holds only an ephemeral public key, never the recipient's own, so the ciphertext does not reveal who it was encrypted to, only how many recipients there are. PGP, by default, writes recipient key IDs into the message.

## How it differs from PGP

PGP is software from 1991. OpenPGP is its public standard, and [RFC 9580](https://www.rfc-editor.org/rfc/rfc9580){target="_blank"} from 2024 is the current version, replacing RFC 4880 from 2007. It does far more than age: encryption, signatures, identity, a web of trust, key servers, with a key that carries names, email addresses, expiry dates and several subkeys.

| | age | OpenPGP |
|---|---|---|
| What it does | Encrypts files, nothing else | Encryption, signatures, identity, web of trust |
| Algorithms | One fixed set: X25519, ChaCha20-Poly1305, scrypt, HMAC-SHA-256 | Many to choose from, negotiated between the parties |
| What a key looks like | One line of 62 characters | A block of thousands of characters, with identity and expiry |
| Configuration | None | GnuPG's configuration file has hundreds of settings |
| Integrity | Every 64 KiB chunk is authenticated; one changed byte and it will not decrypt | The legacy format's MDC only produced a warning; AEAD arrived in 2024 |
| Signatures | No | Yes |
| Ciphertext reveals recipients | No | Key IDs by default, hidden only with an extra option |
| Length of the specification | One page | Hundreds of pages |
| Implementations | Go, Rust and TypeScript, all interoperable | Mostly GnuPG; other implementations cover parts of the spec |

Two pieces of PGP history are worth knowing. The 1999 usability study "Why Johnny Can't Encrypt" asked twelve people to send an encrypted email with PGP 5.0. Most could not do it within ninety minutes, and some mailed out their private key. The 2018 [EFAIL](https://efail.de/){target="_blank"} attacks combined two facts, that ciphertext in the legacy format could be modified and that mail clients showed the decrypted text anyway after merely warning about the failed integrity check, to leak the contents of encrypted mail through HTML external references. Both trace back to the same root: too many options, too many places to get wrong, too much left to the implementation. age's design removes those places.

age also gives some things up. It does not sign, so being able to open a file says nothing about who encrypted it, and the origin has to be confirmed some other way. It has no identity or trust model, so the other side's public key has to reach you through a channel you already trust, usually in person or over an existing encrypted messenger. Neither age nor PGP offers forward secrecy: once a private key or passphrase leaks, every file ever encrypted with it can be opened.

## Why the tool on this site chose age

When a reader needs to open a backup three years from now, they may have nothing but a computer with a command-line tool, and whether this site still exists is not guaranteed. age is a public format with three interoperable independent implementations, and any computer can open it. That is the entire argument for a public format over a custom one.

Among public formats, age over PGP comes down to every row of the table above pointing the same way: no options means nothing to misconfigure, a short specification means a browser implementation small enough to audit, and passphrase mode needs no key management at all. The tool on this site does passphrase mode only. The reader picks a file, types a passphrase, and downloads.

PGP stays where it belongs. The [sensitive upload](../community/upload-sensitive.md) process on this site uses PGP, because that needs a long-lived identity, has to work with the email ecosystem, and the people on the other end are journalists and organisations who already use PGP. The split is: PGP for mail and identity, age for files and backups.

## Things to keep in mind

- In passphrase mode, the passphrase is the whole of the security. scrypt slows each guess down but cannot save a weak passphrase.
- The file name is not inside the ciphertext. Whatever name you save the encrypted file under is what others see, so give backups a name that gives nothing away.
- The ciphertext size roughly reflects the original size, so it cannot hide that a file is large.
- A decrypted file on disk is plaintext. Delete it when done, and without full-disk encryption a deleted file may still be recoverable.

## Related reading

- [Asian Diceware](./asian-diceware.md): passphrase mode needs a strong passphrase
- [Passphrase and password generator](../utils/passphrase.md): draw one in the browser, nothing is sent anywhere
- [End-to-end encryption](../advanced/e2ee.md): what encryption solves in transit and at rest
- [Preparing for and handling network shutdowns](../scenarios/shutdown.md): encrypted backups have to open offline, and age needs no connection
- [Sensitive upload](../community/upload-sensitive.md): where this site uses PGP
