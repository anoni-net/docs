---
title: How End-to-End Encryption Works
description: From Diffie-Hellman key exchange, forward secrecy, and the Double Ratchet through to the engineering trade-offs of group messaging and multi-device sync, set against Signal, MLS, SimpleX, and Session.
icon: material/key-chain-variant
---

# :material-key-chain-variant: How End-to-End Encryption Works

End-to-end encryption (E2EE) comes down to keys: who generates them, who holds them, and when they change. The same algorithms, in different protocols, defend against entirely different adversaries. This page starts from Diffie-Hellman key exchange in one-to-one messaging, explains forward secrecy and the Double Ratchet, covers the two approaches to group messaging and the trade-offs in multi-device sync, and finishes by comparing four protocols.

## Diffie-Hellman key exchange in one-to-one chat

Can two people who have never met, and who can only pass messages through someone listening, agree on a key that only they know? Diffie-Hellman key exchange, proposed in 1976, answers yes.

The intuitive analogy is mixing paint. Alice and Bob both start from a public base colour, each mixes in a secret colour only they know, and each sends the mixture over the public channel. Each then adds their own secret to what the other sent. Both end with the same colour, while an observer has seen only the intermediate mixtures and cannot work backwards to the secrets in any reasonable time. Mathematically, that difficulty rests on the discrete logarithm problem.

In practice, modern protocols use X25519, an elliptic-curve key exchange that is smaller and faster than the earlier finite-field versions and designed to reduce side-channel risk, meaning inference of a key from physical traces such as timing or power draw. Signal, Tor, TLS 1.3, and most modern SSH implementations use or prefer X25519.

<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/diagrams/dh-exchange.zh-TW.drawio.svg" alt="Diffie-Hellman key exchange: Alice and Bob pick secrets a and b, exchange G^a and G^b, each computes the shared key G^ab, and Eve seeing the intermediate messages cannot work backwards in reasonable time">
</figure>

Diffie-Hellman settles how to agree on a shared key. On its own it is not enough: once a key is long-lived, stealing it one day decrypts every message before and after. That is the next problem.

## Why forward secrecy lets yesterday's messages survive today's key theft

Forward secrecy ensures that recorded ciphertext stays unreadable even if an attacker later obtains the long-term key.

The mechanism is an ephemeral key for each connection, or each period, used to derive the working key for that moment, which is discarded after use. A long-term key an attacker obtains verifies identity, meaning whether this really is Alice, and does not reconstruct past working keys.

TLS 1.3 enables forward secrecy by default, and the old RSA key exchange without it has been retired. E2EE messaging protocols go further, changing keys not just per connection but per message. That is the Double Ratchet.

## The Double Ratchet gives every message its own key

The Double Ratchet is the core of the Signal Protocol, named for two key-update mechanisms running at once. A ratchet advances in one direction only, and old keys do not come back:

- **DH ratchet**: each time a message arrives from the other party, both sides perform a fresh Diffie-Hellman exchange and update the root key
- **Symmetric ratchet**: between two DH exchanges, each message sent derives the next key symmetrically and discards the previous one immediately

Three security properties follow directly:

1. **Full forward secrecy**: every message has its own symmetric key, so an attacker obtaining the current key still cannot read past or future messages
2. **Post-compromise security**: forward secrecy protects messages before a compromise, and post-compromise security protects those after. Even if a device is breached and keys are stolen, the security state repairs itself at the next DH exchange provided the attacker did not intercept it, since the stolen keys stop working
3. **Offline messages**: messages accumulate while the other party is offline and sync in a batch when they return, each still with its own key

<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/diagrams/double-ratchet.zh-TW.drawio.svg" alt="The Double Ratchet's two key-update mechanisms: the symmetric ratchet advances one step per message sent, the DH ratchet resets the chain when a message arrives, and each message has its own key">
</figure>

The Double Ratchet was integrated into the Signal Protocol in 2014[^1], and was subsequently adopted by WhatsApp, Facebook Messenger's Secret Conversations as an opt-in, and Skype Private Conversations.

## Two roads for group messaging

One-to-one is a solved problem. Groups are a different one. In a group of 100, does every message need 100 Diffie-Hellman operations? That cost is impractical, and the industry has two main approaches.

### Sender Keys, as used by Signal groups

Each sender holds a Sender Key, distributed to every member through the one-to-one encrypted channels when joining. Sending encrypts once with your own Sender Key, and every member decrypts with the copy they received.

The advantage is one encryption per message regardless of whether the group has 100 members or 1,000. The costs:

- A new member joining requires redistributing Sender Keys
- A member leaving requires rekeying everyone to guarantee they cannot read new messages
- Distribution cost grows with group size

### MLS (Messaging Layer Security, IETF RFC 9420)

MLS uses a tree-based key structure (TreeKEM) that keeps the cost of joining, leaving, and rekeying at O(log n) absent heavy concurrent updates, which in principle supports groups of tens of thousands while preserving post-compromise security. The design goal is moving E2EE from struggling at a few hundred members to working at organizational scale.

The IETF published RFC 9420 in 2023[^2]. Cisco Webex and Discord's DAVE protocol have adopted or announced adoption of MLS for group key exchange[^3].

The trade-off: Sender Keys are simple, mature, and suited to Signal's scale. MLS is more complex, cleaner at scale, and suited to managing large working groups.

## Multi-device trade-offs

Multi-device is the part of E2EE that gets least attention. When a phone, tablet, and laptop all need the same conversation, what happens to the keys?

Three strategies:

- **Device linking** (Signal, WhatsApp): each device has its own keys, and a new device syncs history from the primary through a QR code. Strong on privacy, higher sync cost, and a new device cannot see old messages unless the primary re-sends them
- **Encrypted cloud backup** (WhatsApp, iMessage): message history encrypted under a user-set password or key and stored in the cloud. Telegram's secret chats work the opposite way, staying on the two devices involved with no cloud backup at all. Convenient when changing phones, with strength bounded by the password, and a breach at the provider concentrates the exposure
- **A shared root key across devices** (early iMessage, some enterprise platforms): all devices share one long-term key, which makes sync simple and means one stolen device loses everything

Signal added encrypted backups in beta on Android in September 2025 and across platforms with Signal 8.0 in February 2026[^4]. The backup is protected by a 64-character recovery key generated on the device, which the user records and the provider never sees.

## Four protocols compared

| Protocol | One-to-one | Groups | Multi-device | Metadata exposure | Open source |
|---|---|---|---|---|---|
| **Signal** | Double Ratchet | Sender Keys | Device linking plus encrypted backup | Sealed Sender hides the sender | ✅ |
| **MLS** | TreeKEM | TreeKEM, its core strength | Implementation-dependent | Implementation-dependent | ✅ (IETF standard) |
| **SimpleX** | Double Ratchet variant | Two-layer ratchet | No central account, contact by invitation | No user identifier | ✅ |
| **Session** | Onion routing plus peer encryption | Semi-centralized | A 13-word mnemonic across devices | Tor-like network reduces metadata | ✅ |

Their trade-offs:

- **Signal**: mature, widely adopted, with a user experience close to mainstream messaging. Registration requires a phone number, and Sealed Sender hides the sender of an individual message rather than the account's metadata
- **MLS**: standardized at the protocol layer and being adopted, with few complete client implementations so far. It suits organizational settings
- **SimpleX**: having no user identifier is its largest design difference, and it is strong against metadata surveillance. The costs are a small ecosystem and an evolving user experience
- **Session**: routing over a Tor-like network reduces metadata, and a mnemonic makes multi-device access easy. The costs are higher message latency, and the move from the Signal Protocol to its own Session Protocol removed forward secrecy, which the released versions still lack pending a protocol revision

## What this looks like across the region

Messaging in this region concentrates in a small number of applications, and which one dominates changes the question entirely.

**Taiwan and Japan** run on LINE. Letter Sealing, LINE's end-to-end encryption, launched for one-to-one chats in 2015, extended to groups in 2016, and has been on by default on the main clients since July 2016, with the option to disable it removed in 2021[^5]. One-to-one voice and video calls are covered. The limits are what matter: groups above 50 members, and rooms containing an official account or bot, fall back to transport-layer encryption only, where the operator can provide contents in response to a legal request. The client is not open source, key management cannot be independently audited, and metadata passes through the servers regardless. Group voice and video calls, and LINE Meeting, are covered by transport encryption rather than end-to-end encryption.

**Hong Kong** runs on WhatsApp rather than LINE. During the 2019 protests, Telegram and Signal saw heavy adoption for group coordination and stronger encryption. Since the National Security Law, records on messaging and social platforms have become evidence in national security and sedition cases[^hk]. The value of Signal and Matrix is the same two layers, group encryption and metadata, against a threat model of national security surveillance rather than ordinary legal process.

**Mainland China** runs on WeChat, which has no end-to-end encryption at all and operates under real-name registration, which puts it in a different category from everything else on this page.

Against the four protocols above, the gap in the dominant regional platforms concentrates in group encryption and metadata. This community and most privacy-conscious users here take one of two paths:

- **Signal** for one-to-one and small groups, where the user experience is close enough to the incumbent that the barrier is low
- **Matrix**, including the homeserver this community operates, for open source, federated, self-hostable group and community discussion

In sensitive settings, protecting a journalist's sources, working on the ground as an activist, or seeking help as a domestic violence survivor, these two paths diverge further, which [protecting your sources as a journalist](../scenarios/journalist.md), [digital preparation for activists](../scenarios/activist.md), and [digital preparation for domestic violence survivors](../scenarios/domestic-violence.md) each take up.

Between the concepts here and picking a tool sits the question of which one, which [secure messaging compared](../tools/messaging-comparison.md) answers.

## :material-chat-question: Related concepts

<div class="grid cards" markdown>

- [:material-chat-question: What is an anonymity network](../tools/what-is-anonymity-network.md)
- [:material-message-lock-outline: Secure messaging compared](../tools/messaging-comparison.md)
- [:material-atom-variant: Post-quantum cryptography](./post-quantum.md)
- [:material-shield-key-outline: Zero-knowledge identity and payments](./zk-identity-payments.md)

</div>

## :fontawesome-solid-diagram-project: Where to go next

<div class="grid cards" markdown>

- [:material-newspaper-variant-outline: Protecting your sources as a journalist](../scenarios/journalist.md)
- [:material-account-edit-outline: Digital preparation for activists](../scenarios/activist.md)
- [:material-translate-variant: Localization and translation](../community/i18n.md)

</div>

[^1]: [Double Ratchet Algorithm](https://en.wikipedia.org/wiki/Double_Ratchet_Algorithm){target="_blank"}
[^2]: [RFC 9420: The Messaging Layer Security (MLS) Protocol](https://www.rfc-editor.org/info/rfc9420/){target="_blank"}, IETF
[^3]: [Bringing DAVE to all Discord platforms](https://discord.com/blog/bringing-dave-to-all-discord-platforms){target="_blank"}, Discord
[^4]: [Introducing Signal Secure Backups](https://signal.org/blog/introducing-secure-backups/){target="_blank"}, Signal
[^5]: [LINE Encryption Report](https://www.lycorp.co.jp/en/privacy-security/security/transparency/encryption-report/2025/){target="_blank"}, LY Corporation
[^hk]: On surveillance and speech prosecutions after Hong Kong's National Security Law, see [Internet censorship in Hong Kong](https://hongkongfp.com/2024/10/12/internet-censorship-in-hong-kong/){target="_blank"}, Hong Kong Free Press, and [Hong Kong: New Security Law a Full-Scale Assault on Rights](https://www.hrw.org/news/2024/03/19/hong-kong-new-security-law-full-scale-assault-on-rights){target="_blank"}, Human Rights Watch.
