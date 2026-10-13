---
title: The Scope of End-to-End Encryption
description: What transport encryption, end-to-end encryption, and encryption at rest each protect against, and the parts that sit outside encryption altogether, from backups and metadata to phone-number registration and safety numbers.
icon: material/key-chain-variant
---

# :material-key-chain-variant: The Scope of End-to-End Encryption

An app that says "encrypted" may still let the provider read your messages. There are several kinds of encryption, and the difference is who holds the keys. If the provider holds them, the provider can decrypt the content. If only your device and the other person's device hold them, the provider handles nothing but unreadable data. End-to-end encryption (E2EE) is the second kind. It protects message content, and leaves backups, records of who talks to whom, and account identity to be dealt with separately.

## Boundaries of the three kinds of encryption

| Kind | Protects against | Does not protect against | Common examples |
|---|---|---|---|
| Transport encryption | People along the connection, such as others on the same Wi-Fi or your internet provider | The service itself, since the data is decrypted on arrival at the server | HTTPS in the address bar, LINE groups above 50 members, cloud AI services |
| End-to-end encryption | People along the connection, and the provider | Someone who gets into either device, and metadata | Signal, one-to-one chats on LINE |
| Encryption at rest | Someone who steals the disk or the server | Whoever holds the key, including the provider when it manages the key | Device encryption on phones and computers, typical cloud drives |

### Transport encryption

HTTPS in the browser's address bar is transport encryption (TLS), covering the stretch between your device and the server. Others on the same café Wi-Fi, or your internet provider, can see which site you connect to but not the content. Once the data reaches the server it is decrypted, and the provider can read it, keep it, and hand it over in response to a legal request. Cloud AI services follow the same model, since the service has to read your input to respond (see [using AI at work without leaking data](../tools/ai-privacy.md)).

### End-to-end encryption

The message is encrypted on your device and only the recipient's device can decrypt it. The server in between only relays it and has no key, so a provider served with a request for content has none to give. Protection ends at the two devices: if a phone is taken and unlocked, the conversation history is readable.

### Encryption at rest

Device encryption on phones and computers protects the files on a device that is lost or stolen. Most cloud drives also encrypt stored files, but the provider holds the key and can still read them. To keep the provider out as well, use an end-to-end encrypted service such as [CryptPad](../tools/what-is-cryptpad.md), or encrypt files on your own device with a tool like [age](../tools/what-is-age.md) before uploading.

## Shared keys between two devices

Two people who can only talk through a server need to agree on a key the server never learns, and the usual analogy is mixing paint. Both start from the same public base colour, each mixes in a secret colour only they know, and each sends the mixture to the other. Each then adds their own secret to what they received. Both end with the same colour, while anyone relaying the mixtures cannot work backwards to the secrets in any reasonable time. The mathematics behind this is Diffie-Hellman key exchange.

Tools like Signal also change keys with every message, so a key stolen today does not decrypt yesterday's messages. That property is forward secrecy. The Double Ratchet, group encryption, and a comparison of the main protocols are covered in [end-to-end encryption protocols](https://anoni.net/en/articles/e2ee-protocols/){target="_blank"} on the community site.

## Metadata outside the encryption

End-to-end encryption protects message content. Who messaged whom, when, how often, and from which IP address is metadata, and it still passes through the server. The pattern of contacts alone can reconstruct someone's social network and daily routine (see [metadata, and why it matters](./metadata.md)). Signal's Sealed Sender hides the sender of an individual message, while the account's own metadata stays on the server. On LINE, all of it passes through the servers. SimpleX and Session are designed to reduce what the server side holds, with trade-offs covered in [secure messaging compared](../tools/messaging-comparison.md).

## Multi-device and backup trade-offs

When a phone, tablet, and computer all need the same conversation, or old messages need to come along to a new phone, keys have to leave the original device. There are three common approaches:

- **Linked devices** (Signal, WhatsApp): each device has its own keys, and a new device joins by scanning a QR code on the primary. This is the strongest on privacy, and a new device usually cannot see messages from before it joined unless the primary sends them over
- **Encrypted cloud backup** (WhatsApp, iMessage): message history is encrypted under a password or key you set and stored in the cloud. Changing phones is easy, the protection is only as strong as the password, and a breach at the provider exposes everyone's ciphertext in one place
- **One long-term key shared across all devices** (early iMessage, some enterprise messaging platforms): sync is simplest, and one stolen device exposes every conversation

Telegram's secret chats work the opposite way. They stay on the two devices involved with no cloud backup, and do not move to a new phone.

Signal introduced encrypted backups (Secure Backups) in September 2025, first in the Android beta; by the time the iOS version shipped in September 2026 they were available on every platform[^1]. The backup is unlocked by a 64-character recovery key generated on your device. Signal's servers never receive it, so Signal cannot recover it for you if it is lost. The free tier covers all text messages and the last 45 days of media, and older media needs the US$1.99 monthly plan.

## LINE, WhatsApp, WeChat, and Signal across the region { #what-this-looks-like-across-the-region }

Messaging in this region concentrates in a small number of applications, and which one dominates changes the question.

Taiwan and Japan run on LINE. Letter Sealing, LINE's end-to-end encryption, launched as an option in 2015, extended to groups in 2016, and has been on by default on the main clients since that year, with the option to turn it off removed in 2021[^2]. One-to-one text, media, and voice and video calls are covered. In the following cases there is only transport encryption, and LINE can provide the content in response to a legal request:

- Groups above 50 members
- Chats an official account or bot has joined, from the moment it joins
- Group voice calls, group video calls, and LINE Meeting

The LINE client is not open source, key management cannot be independently audited, and metadata passes through the servers regardless.

Hong Kong runs on WhatsApp. Since the National Security Law, records on messaging and social platforms have become evidence in national security and sedition cases[^hk], so the threat model there is national security surveillance rather than ordinary legal process. Mainland China runs on WeChat, which has no end-to-end encryption and operates under real-name registration, which puts it in a different category from everything else on this page.

Across the dominant platforms, the gaps concentrate in group encryption and metadata. We, a community based in Taiwan, suggest two paths:

- **Signal** for one-to-one and small groups, where the experience is close enough to mainstream messaging that the barrier is low
- **Matrix**, open source, federated, and self-hostable, for group and community discussion, including the homeserver anoni.net operates

In sensitive settings the two paths diverge further, which [journalists and source protection](../scenarios/journalist.md), [activists and protest digital safety](../scenarios/activist.md), and [digital safety for survivors of domestic violence](../scenarios/domestic-violence.md) each take up.

## Phone numbers and number-free registration on Signal

Signal accounts have long been tied to a phone number. Buying a SIM in Taiwan, Hong Kong, Macau, or mainland China requires real-name registration, so however strong the message encryption, the account still leads back to a named person through the carrier's records. Since 2024 Signal has offered usernames: contacts can exchange usernames instead of numbers, and you can set your number so nobody can see it, while Signal's servers still store the number bound to every account[^3].

In September 2026 Signal's Android beta opened a way to register without a phone number, called Signal Login, for a one-time fee (US$2.99 on the support page), paid for now only through Google Play[^4]. Zero-knowledge credentials separate the payment from the account, so Signal cannot match an account to the purchase that created it, but the payment date stays attached to the account and Google keeps a record of the purchase. Registering with a phone number remains free and remains the main route, and as of September 2026 there was no announced timeline for the stable release or for iOS. What the payment record leaves behind, and how to choose for your threat model, is covered in [Signal Login and the payment trail it leaves](../blog/posts/2026-signal-login-numberless.md).

## Safety number checks

End-to-end encryption guarantees that only the two ends can decrypt a message, on the assumption that the other end really is the person you think. Signal gives each conversation a safety number. On the contact's profile, open "View safety number", then scan each other's QR codes in person or compare the digits over a separate channel you trust[^5].

A safety number change notice means the contact's key has changed. That may be a new phone or a reinstall, or it may be someone else taking over the account. Stop, confirm through another channel, and only then carry on with anything sensitive.

In August 2026 Signal added automatic key verification, in which the app and third-party auditors check that a contact's public key is consistent across the whole system, without arranging to meet[^6]. It works only when you have the contact's phone number, so contacts you know only by username still need the safety number check.

## Related reading

- [Secure messaging compared](../tools/messaging-comparison.md): identity, metadata, and group design across Signal, SimpleX, Session, Briar, and Matrix
- [Metadata, and why it matters](./metadata.md): the contact patterns encryption leaves exposed
- [What is an anonymity network?](../tools/what-is-anonymity-network.md): a separate layer that hides where a connection comes from
- [End-to-end encryption protocols](https://anoni.net/en/articles/e2ee-protocols/){target="_blank"}: the Double Ratchet, Sender Keys, MLS, and four protocols compared
- [Post-quantum cryptography](https://anoni.net/en/articles/post-quantum/){target="_blank"}: the quantum threat to current encryption and the migration timeline
- [Zero-knowledge identity and payments](https://anoni.net/en/articles/zk-identity-payments/){target="_blank"}: proving identity or payment without revealing anything else
- [Journalists and source protection](../scenarios/journalist.md) and [activists and protest digital safety](../scenarios/activist.md): encrypted messaging in practice
- [Localization and translation](../community/i18n.md): you are welcome to join the docs site's translation work

[^1]: [Introducing Signal Secure Backups](https://signal.org/blog/introducing-secure-backups/){target="_blank"}, Signal
[^2]: [LINE Encryption Report](https://www.lycorp.co.jp/en/privacy-security/security/transparency/encryption-report/2025/){target="_blank"}, LY Corporation
[^3]: [Keep your phone number private with Signal usernames](https://signal.org/blog/phone-number-privacy-usernames/){target="_blank"}, Signal
[^4]: [Phone Numberless Registration for Android](https://support.signal.org/hc/en-us/articles/11197884108826-Phone-Numberless-Registration-for-Android){target="_blank"}, Signal Support
[^5]: [What is a safety number and why do I see that it changed?](https://support.signal.org/hc/en-us/articles/360007060632-What-is-a-safety-number-and-why-do-I-see-that-it-changed){target="_blank"}, Signal Support
[^6]: [Introducing Automatic Key Verification](https://signal.org/blog/automatic-key-verification/){target="_blank"}, Signal
[^hk]: On surveillance and speech prosecutions after Hong Kong's National Security Law, see [Internet censorship in Hong Kong](https://hongkongfp.com/2024/10/12/internet-censorship-in-hong-kong/){target="_blank"}, Hong Kong Free Press, and [Hong Kong: New Security Law a Full-Scale Assault on Rights](https://www.hrw.org/news/2024/03/19/hong-kong-new-security-law-full-scale-assault-on-rights){target="_blank"}, Human Rights Watch.
