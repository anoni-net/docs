---
title: Secure messaging compared
description: Signal, SimpleX, Session, Briar, and Matrix against a threat-model checklist, with the regional catch that phone-number registration ties to a legal identity under real-name SIM laws.
icon: material/message-lock-outline
---

# :material-message-lock-outline: Secure messaging compared

"End-to-end encrypted" is printed on the box of LINE, Telegram, WhatsApp, Signal, SimpleX, Session, Briar, and Matrix, and it means something different on each. The label answers one question (can an intermediary read the content?) and stays silent on the ones that decide whether a tool fits your situation: what the operator must learn about you to let you register, whether it can see who you talk to, whether encryption is on by default or an opt-in mode, and whether anything keeps working when the network is cut.

This page compares the tools against a threat-model checklist rather than a feature beauty-contest. We don't try to crown a winner. We line up what each tool exposes and what it protects, so you can match it to what *your* task needs to keep secret. For the underlying vocabulary, [anonymity, privacy, pseudonymity, and confidentiality](../basics/anonymity-vs-privacy.md) draws the lines this page assumes, and [metadata](../basics/metadata.md) explains why "who talks to whom" can matter more than message content.

!!! info "Why this page exists"

    No authoritative organization publishes a neutral cross-tool comparison aimed at this region. [Privacy Guides](https://www.privacyguides.org/en/real-time-communication/){target="_blank"} maintains the canonical recommendation list and does the per-tool depth far better than we could, but it doesn't run a head-to-head against a single checklist, and it deliberately excludes tools like Session. EFF's curriculum is concept-only. And none of it reaches readers in Southeast Asian languages. anoni.net is a volunteer community in the Sinophone Asia-Pacific; this page is the comparison that's missing, written for readers across the region who use English as a working language. For *which tool to install*, the depth links at the end send you back to Privacy Guides.

## The checklist that actually matters

Before the table, here is what each column is asking and why it changes your risk.

- **Identifier to register.** A phone number, an email, a random ID, or nothing at all. This is the column that decides whether the tool is an *anonymity* tool or only a *confidentiality* tool. Read the regional note below before you skip it.
- **Metadata exposure.** Whether the operator can see who-talks-to-whom, when, and how often. Strong content encryption with weak metadata protection still hands an adversary your social graph. This is the [metadata](../basics/metadata.md) problem.
- **E2EE by default.** Whether end-to-end encryption is always on, or a mode you have to switch into per chat. An opt-in scheme that most users never enable protects almost no one.
- **Forward secrecy.** Whether a compromised key exposes only a narrow window of past messages or the whole history. Modern protocols rotate keys constantly so that yesterday's stolen key can't decrypt last month's messages.
- **Network and censorship resistance.** Whether it runs over Tor, survives a network shutdown peer-to-peer (like Briar over Bluetooth), and how easily a national firewall can block it.
- **Centralization.** One operator, a federation of independent servers, a decentralized routing network, or no server at all. This decides who can be subpoenaed and who can pull the plug.
- **Multi-device and disappearing messages.** Practical hygiene: can you read on a laptop and a phone, and can messages auto-delete on a timer.

## At a glance

| Tool | Registration identifier | Metadata exposure | E2EE default | Forward secrecy | Tor / offline / blockable | Structure | Multi-device | Disappearing msgs |
|---|---|---|---|---|---|---|---|---|
| **Signal** | Phone number (username optional for contact)[^1] | Minimized: sealed sender, private contact discovery; server still sees the account exists | Yes | Yes (Double Ratchet) | No native Tor; central endpoints are blockable | Centralized (one operator) | Yes (linked devices) | Yes |
| **SimpleX** | None at all, not even a random ID[^2] | Designed away: per-connection queue IDs, no user profile on any server | Yes | Yes | Tor-capable; HTTPS relays usually pass; self-hostable | Decentralized relays, no accounts | Yes (manual key transfer) | Yes |
| **Session** | Random account ID (no phone/email) | Onion-routed over the Session Network; no central operator sees the graph[^3] | Yes | Yes, restored in Protocol V2 (Dec 2025), plus post-quantum[^4] | Routes over its own onion network; higher latency; relays blockable | Decentralized (Session Network) | Limited | Yes |
| **Briar** | On-device keypair (no account) | No central server to expose anything[^5] | Yes | Yes | Tor when online; Bluetooth / Wi-Fi mesh offline; Tor reachability is the choke point | Peer-to-peer, no server | No (one device = one identity) | Limited |
| **Matrix / Element** | Username on a homeserver (email optional) | Visible to participating homeservers: who's in a room, timestamps, message sizes[^6] | Per-room, opt-in | Yes when encrypted (Megolm; MLS in progress) | Reachable over Tor; homeservers are blockable; self-hostable | Federated (many homeservers) | Yes | Yes |
| *(baseline)* **WhatsApp** | Phone number | Broad: shared across Meta's graph (who/when/how often) | Yes (Signal Protocol) | Yes | No native Tor; blockable | Centralized (Meta) | Yes | Yes |
| *(baseline)* **Telegram** | Phone number | Broad: server sees everything outside Secret Chats | No (only in Secret Chats) | In Secret Chats only | No native Tor; blockable | Centralized | Yes (not for Secret Chats) | Yes |
| *(baseline)* **Threema** | Random Threema ID (no phone/email)[^7] | Minimized; Swiss jurisdiction | Yes | Yes | No native Tor; blockable | Centralized (paid) | Yes | Yes |

The baseline rows are there because most readers already use them. Their "E2EE default" entry describes message content only; it never implies the metadata layer is protected. Telegram's "no" is the important correction: ordinary chats, groups, and channels are not end-to-end encrypted, only the manually-enabled one-to-one Secret Chat is.

## The regional point that reorders the table

In much of the Asia-Pacific, registering a SIM ties the phone number to a legal identity. Mandatory real-name SIM registration is in force across the region, including Thailand, Vietnam, Indonesia, Malaysia, and the Philippines under its 2022 SIM Registration Act[^8]. Mainland China binds phone numbers and national ID to most online accounts as a matter of course.

The consequence is direct: **a tool that registers you by phone number is anchored to your real identity, no matter how strong its encryption is.** Signal, WhatsApp, Telegram, and LINE all sit on a phone number. Their content encryption can be excellent and they are still not anonymity tools, because the account *is* a legal identity in these jurisdictions. Signal's 2024 username feature lets you exchange contacts without revealing the number to the other party, but registration still passes through phone verification, so the link exists at the operator and the carrier even if it's hidden from your contacts[^1].

This is the same trap as mistaking *confidential* for *anonymous*, explained in [anonymity, privacy, pseudonymity, and confidentiality](../basics/anonymity-vs-privacy.md). If your threat model includes the carrier, the state, or anyone who can compel either, the identifier column outranks every other column. That is what moves SimpleX, Session, Briar, and Threema into a different category from the phone-anchored tools: they let you register without ever presenting a number that resolves to your name.

## The trade-offs, tool by tool

### Signal

[Signal](https://signal.org/){target="_blank"} is the consensus default for everyday encrypted messaging: a mature protocol, mainstream usability, and metadata minimized by design through sealed sender and private contact discovery. One-to-one chats use the Double Ratchet (a fresh key per message); groups use Sender Keys. The catch is the one above. Registration runs on a phone number, and the optional username changes only what your *contacts* see, not what the operator and carrier know[^1]. Use Signal where confidentiality is the goal and the phone-number anchor is acceptable: a long-term work channel, a first contact with a journalist who can take your username instead of your number.

### SimpleX

[SimpleX Chat](https://simplex.chat/){target="_blank"} makes the most aggressive identifier choice on the list: there is no user identifier at all, not even a random one[^2]. Instead of accounts, it uses temporary per-connection message queues, each with its own disposable address, rotated over time. The relay sees a message arriving for a queue and nothing about who owns it. You add a contact by exchanging an invitation link or QR code, which is exactly the property the [LGBTQ+ guide](../scenarios/lgbtq.md) leans on when neither party wants to hand over a phone number. The cost is a learning curve (people raised on contact lists find "no account" disorienting), a smaller user base, and multi-device that you manage by moving keys yourself.

### Session

[Session](https://getsession.org/){target="_blank"} drops the phone number for a random account ID and routes traffic over its own onion network. It originally ran on the Oxen Service Node Network and migrated to the renamed Session Network in May 2025, with the project moving to a Swiss jurisdiction in late 2024[^3]. Two caveats that earlier reviews got stuck on are now partly resolved: Session removed forward secrecy in 2021 for stability reasons, and restored it (alongside a post-quantum key exchange) in Session Protocol V2, announced December 2025[^4]. It buys you no-phone-number registration without SimpleX's mental model, at the price of higher message latency from multi-hop routing and weaker group features. Note that Privacy Guides deliberately does not recommend Session; if that matters to your trust model, weigh it.

### Briar

[Briar](https://briarproject.org/){target="_blank"} takes a different road entirely: no server exists. Identity is a keypair on the device, and messages sync directly between devices over Tor when online, or over Bluetooth and Wi-Fi when the internet is down[^5]. That offline mesh is the whole point. During a regional shutdown or a deliberate network cut, Briar still passes messages between nearby devices, within Bluetooth and Wi-Fi range. The trade-offs are steep for daily use: one device is one identity (lose the phone, lose the account, no multi-device), the recipient has to be online or in range for delivery, and Briar is Android-only. Treat it as field backup for protest and shutdown scenarios, not as your main channel. Its peer-to-peer cousin Bridgefy is best avoided after researchers found serious flaws in its encryption design[^9].

### Matrix / Element

[Matrix](https://matrix.org/){target="_blank"} is a federated open protocol, most often used through the [Element](https://element.io/){target="_blank"} client, structured like email: everyone has a homeserver, and homeservers talk to each other. That federation is its strength for community work, because no single operator can pull the plug, and it's the reason anoni.net runs its own homeserver for collaboration. The trade-offs sit in two places. Encryption is per-room and opt-in, not always-on, so a public room is typically unencrypted. And metadata stays visible to the participating homeservers: who joined which room, message timing, and message sizes are not hidden, even in encrypted rooms[^6]. The project is working on this (Megolm encryption is moving toward MLS, and encrypted room metadata is an experimental feature), but as of now Matrix is the right tool for durable multi-party collaboration rather than for hiding who is talking to whom.

## Where each tool fits

- **Everyday confidentiality, phone-number anchor acceptable:** Signal. The default for most people, most of the time.
- **No identity exposure, even a random one:** SimpleX, where neither side wants to reveal a phone number and the connection itself should leave no account trail.
- **No phone number, simpler than SimpleX:** Session, if you can accept higher latency and the recommendation caveat.
- **Network is cut, you need to reach people physically nearby:** Briar, over Bluetooth or Wi-Fi mesh.
- **Long-running multi-party collaboration across organizations:** Matrix / Element, accepting that homeservers see the metadata.

And the inverse, the mistakes this page is meant to prevent: don't treat a phone-anchored tool as anonymous under a real-name SIM regime, don't assume an opt-in encryption mode is on when you never switched it on, and don't read strong content encryption as protection for the social graph. Strong content encryption with exposed metadata is still confidentiality, not anonymity.

## Where to go from here

- [Privacy Guides — real-time communication](https://www.privacyguides.org/en/real-time-communication/){target="_blank"} — the canonical, regularly-updated tool recommendations; start here for *which one to install*.
- [Anonymity, privacy, pseudonymity, and confidentiality](../basics/anonymity-vs-privacy.md) — why a phone-anchored tool is confidential but not anonymous.
- [Metadata](../basics/metadata.md) — why "who talks to whom" is its own risk, independent of message content.
- [Threat modeling](../basics/threat-model.md) — work out which checklist column actually outranks the others for your situation.
- [Scenarios](../scenarios/index.md) — worked examples that put these choices to use for specific people.

[^1]: [Phone Number Privacy and Usernames](https://support.signal.org/hc/en-us/articles/6712070553754-Phone-Number-Privacy-and-Usernames){target="_blank"} — Signal Support. Usernames let you connect without sharing your number, but a phone number is still required to register.
[^2]: [SimpleX Chat: private and secure messenger without any user IDs](https://simplex.chat/){target="_blank"} — SimpleX. The network operates without user identifiers of any kind, using temporary per-connection message queues instead.
[^3]: [Migrating from the Oxen Network to Session Network](https://getsession.org/migrating-from-the-oxen-network-to-session-network){target="_blank"} — Session, on the May 2025 network migration; the project also moved to a Swiss jurisdiction in November 2024.
[^4]: [Session messenger adds PFS, PQE, and other improvements](https://www.privacyguides.org/news/2025/12/03/session-messenger-adds-pfs-pqe-and-other-improvements/){target="_blank"} — Privacy Guides, December 2025, on Session Protocol V2 restoring perfect forward secrecy and adding post-quantum key exchange after PFS was removed in 2021.
[^5]: [How it works](https://briarproject.org/how-it-works/){target="_blank"} — Briar. Peer-to-peer with no central server; syncs over Tor online, and over Bluetooth or Wi-Fi when the internet is unavailable.
[^6]: [Hiding room metadata from servers](https://element.io/blog/hiding-room-metadata-from-servers/){target="_blank"} — Element. Room metadata such as membership, timestamps, and sizes remains visible to homeservers; encrypted state events are an experimental effort to address this.
[^7]: [Threema Private](https://threema.com/en/products/private){target="_blank"} — Threema. Can be used anonymously with a randomly generated Threema ID, without a phone number or email.
[^8]: [GSMA — Mandatory Registration of Prepaid SIM Cards](https://www.gsma.com/public-policy/wp-content/uploads/2021/08/GSMA-Mandatory-Registration-of-Prepaid-SIM-Cards-2021.pdf){target="_blank"} — GSMA, for the regional picture of identity-linked SIM registration.
[^9]: [Anatomy of a bad idea: Bridgefy's broken encryption](https://blog.cryptographyengineering.com/2020/08/24/anatomy-of-a-bad-idea-bridgefys-broken-encryption/){target="_blank"} — Cryptography Engineering, on the 2020 findings against Bridgefy's encryption design.
