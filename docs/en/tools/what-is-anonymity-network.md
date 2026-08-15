---
title: What Is an Anonymity Network?
description: An anonymity network lets you connect, read, and collaborate without handing over your identity or leaving a complete trail by default. How the tool families divide the work, and what each one is for.
icon: material/chat-question
---

# :material-chat-question: What Is an Anonymity Network?

An **anonymity network** lets you reach the internet without handing over your identity or leaving a complete record of your behaviour as the price of entry, while still reading, communicating, and collaborating freely. The scope runs from how you connect, through the environment you work in, to making network interference observable and on the record.

## Anonymity, privacy, and circumvention are three different things

An anonymity network serves three related goals. **Anonymity** means others cannot establish who you are. **Privacy** means others cannot establish what you are doing. **Circumvention** means you can still reach restricted resources in an environment that blocks them. They overlap constantly, and which one is critical depends on your situation. Add pseudonymity and confidentiality, which get mixed into the same conversation, and the full set is covered in [anonymity, privacy, pseudonymity, and confidentiality](../basics/anonymity-vs-privacy.md).

## How this connects to networked freedom

**Networked freedom** is about whether people can use the network, obtain information, and express views without interference. Across much of Asia, censorship, blocking, and surveillance are narrowing that space.

Anonymity networks offer one concrete response. A combination of tools lets people keep their privacy and their connectivity in a constrained environment, while leaving verifiable records of the interference itself.

For the regional picture, see [why networked freedom matters](../basics/internet-freedom.md).

## Why different people end up needing this { #stakeholders-why }

News organizations, independent journalists, civil society groups, and open source communities come at this from different angles and hit the same three problems: exposure of identity and behaviour, whether the connection works at all, and whether open data can evidence that interference happened.

### News organizations

Reporting and editing routinely touch sensitive subjects, and both source protection and internal communication need to hold. An anonymity network lowers the risk of an organization or an individual being located and tracked by traffic and identity. Cross-border verification work runs into censorship and platform rules affecting what is reachable. Open measurement through OONI turns "the site became hard to reach" into a reproducible, citable observation, which makes it possible to explain the situation to others and to check it later. For single-use, high-risk situations, a working environment designed around privacy from the start becomes part of the answer.

### Independent journalists

Compared with a newsroom that has institutional backing, an independent journalist faces a gap in security and legal support, with a wider personal and collaborative exposure surface. An anonymity network helps with online investigation and with establishing a channel to a source, and lowers the chance of a connection or an identity being pinned down on a high-pressure subject. Where evidence is needed that a particular network environment is blocking or throttling, OONI's public data is where to look. Where the whole working environment and all its traffic should default to Tor and leave as little local trace as possible after shutdown, that is what Tails is for.

### Civil society groups

Advocacy, petitions, and cross-border collaboration involve protecting members and contacts. Organizational accounts, websites, and event pages sometimes become the object of interference at the traffic or policy level. Anonymity and circumvention help maintain external contact and access to resources under pressure. Turning blocking and throttling into a citable observation helps explain the situation to others, and gives international coordination something checkable to work from.

### Open source communities

Anonymity networks depend on verifiable code and reproducible builds. Maintaining and contributing to the infrastructure is itself part of letting others connect safely and see whether interference is happening. Running a Tor relay, a Snowflake bridge, OONI tests, or translating documentation connects an individual user's need back to the resilience and observability of the network as a whole.

## What this looks like across the Sinophone Asia-Pacific

The reason this site exists as a regional observatory rather than a general privacy resource is that the same tool means different things in different jurisdictions:

- **Mainland China**: the Great Firewall actively blocks Tor's public relays, so a direct connection generally fails and bridges (`obfs4`, Snowflake, WebTunnel) are the working configuration. Real-name registration on domestic platforms means the identity layer is already established before any network question arises
- **Hong Kong**: connections are largely unfiltered, and the pressure sits at the legal and platform level after 2020 rather than at the network layer. What people need most is often confidentiality and pseudonymity rather than circumvention
- **Taiwan**: among the region's most open connectivity environments, which is why the community can run relays and measurement infrastructure here at all. The threat model is dominated by data collection and cross-border exposure rather than blocking
- **Singapore and Malaysia**: selective blocking under specific statutes, with a deeply integrated national digital identity layer in Singapore's case. Anonymity questions here are usually about what is linked to a verified identity rather than about reachability
- **The diaspora**: family group chats, cross-border payments, and return trips home mean the threat model spans several jurisdictions at once, including ones the person is not currently in

Which tool matters, and how it needs to be configured, follows from which of these you are in.

## How the tool families divide the work

No single tool covers this. The site groups tools into four layers, each handling a class of problem. Read the group that matches your situation.

<div class="grid cards" markdown>

- **:simple-torproject: Connection layer: the Tor family**

    Hides a connection inside layered encryption and a randomized path, making the IP address and the behaviour hard to follow. Anonymous browsing, file transfer, and contributing bridges all start here.

    [:fontawesome-regular-circle-question: What is Tor?](./what-is-tor.md)

- **:simple-tails: Environment layer: anonymity operating systems**

    Moves the whole operating system onto an anonymous footing. Boot from USB, route through Tor by default, leave nothing behind at shutdown. Suited to interviews, handling files from outside, and working in the field.

    [:fontawesome-regular-circle-question: What is Tails?](./what-is-tails.md)

- **:material-access-point-network: Measurement layer: verifiable records of censorship**

    Turns the experience of blocking, throttling, and interference into public observations with a time, a place, and an autonomous system number attached, leaving a record that can be cited and reproduced.

    [:fontawesome-regular-circle-question: What is OONI?](./what-is-ooni.md)

- **:material-key-variant: Everyday privacy fundamentals**

    Which messaging app, how to manage passwords, what to use when a payment needs to be anonymous. Three independent subjects, all of which land in ordinary daily use.

    [:fontawesome-regular-circle-question: Secure messaging compared](./messaging-comparison.md)

</div>

The full article list for each family is on the [Tools index](./index.md).

## What the community is building out in 2026

Tools are the foundation, and using an anonymity network in practice is considerably more involved than installing an application. Three tracks this year aim at making the choices concrete:

- **A personal privacy guide**: operational guidance graded by situation, so people know how tools and behaviour should change under different levels of risk
- **Tor relays on campus**: getting relays deployed at universities in Taiwan, so local bandwidth becomes part of the global Tor network and the infrastructure gets more resilient
- **Anonymous payments**: what anonymous payment looks like outside cash, covering regulation, stablecoins, and on-chain applications, filling in the part of anonymity practice that usually gets skipped

The full description of all three is on the [Community](../community/index.md) page and in [From 2025 into 2026](../blog/posts/2025to2026.md).

## :material-chat-question: Related concepts

<div class="grid cards" markdown>

- [:material-chat-question: Why networked freedom matters](../basics/internet-freedom.md)
- [:material-chat-question: Anonymity, privacy, pseudonymity, and confidentiality](../basics/anonymity-vs-privacy.md)
- [:material-chat-question: How to build a threat model](../basics/threat-model.md)

</div>

## :fontawesome-solid-diagram-project: Tracks you can join

<div class="grid cards" markdown>

- [:material-shield-account-outline: Personal privacy guide](../community/privacy-guide.md)
- [:material-school-outline: Tor relays on campus](../community/relay-on-campus.md)
- [:material-currency-btc: Anonymous payments research](../community/payments-research.md)

</div>
