---
date: 2026-02-12
authors:
    - toomore
categories:
    - News
slug: 2026-discord-matrix-statement
image: "assets/images/post-update.png"
summary: "From Discord's age verification to why we self-host Matrix: balancing privacy and community quality"
description: "From Discord's age verification to why we self-host Matrix: balancing privacy and community quality"
---

# From Discord’s Age Verification to Why We Self-Host Matrix

![From Discord's age verification to why we self-host Matrix](https://assets.anoni.net/blog/2026-discord-matrix-statement.png){style="border-radius: 5px;"}

On 2026/02/09, [Discord announced a global “teen-by-default” rollout](https://discord.com/press-releases/discord-launches-teen-by-default-settings-globally){target="_blank"} and stronger age verification (English coverage: [BBC](https://www.bbc.com/news/articles/c1d67vdlk1ko){target="_blank"}, [Medianama](https://www.medianama.com/2026/02/223-discord-teen-by-default-settings-globally-next-month/){target="_blank"}). New and existing users will default to a teen-oriented experience; to relax content filters or access age-gated spaces, users must complete verification via facial age estimation or by submitting ID. Discord frames this as a commitment to teen safety and Safer Internet Day, and will use an “age inference model” in the background to help assign age groups.

We are not dismissing Discord’s intent—youth protection and compliance are serious. But such measures also mean one thing: **large platforms will need more personal data and behavioural signals to “classify” users**. Whether via face scans, ID documents, or algorithmic inference, the result is handing over “who you are, how old you are, where you are” to the platform and its partners. For many people who just want to chat, game, or collaborate, that may be an acceptable trade-off; for others, it raises the question: is there another way?

## What we care about: who decides the rules, who holds the data

Commercial chat platforms have their own rules: terms of service, product direction, what data is retained, how algorithms and policies work—mostly driven by the company and shareholders, with little say for ordinary users and little visibility into how their data is used. This isn’t about “who is worse”; it’s about **who gets to decide**.

The anoni.net community has chosen a different path: **self-hosting a Matrix homeserver**. We run [tuwunel](https://github.com/matrix-construct/tuwunel){target="_blank"}, a high-performance Matrix homeserver implemented in Rust, on `im.anoni.net` for community discussion and 2026 theme collaboration. Server configuration, retention policy, and channel rules are decided by operators and the community together—smaller scope, more predictable, and more transparent. Our focus is clear: **internet freedom, anonymous networks, and privacy in practice**, not “anyone can join and talk about anything.” This is a themed, consensus-oriented workspace.

<!-- more -->

## Why we self-host Matrix (tuwunel + im.anoni.net)

[Matrix](https://matrix.org/) is an open, decentralised real-time communication protocol and ecosystem, enabling different platforms worldwide to communicate and interoperate securely. Anyone can run their own Matrix homeserver and set their own server rules, retention, and verification policy. We therefore self-host `im.anoni.net` and use [tuwunel](https://github.com/matrix-construct/tuwunel){target="_blank"} (a high-performance Matrix homeserver written in Rust) to serve the community.

We use a **registration-code system**: you obtain a registration code by emailing `whisper@anoni.net` or through another trusted channel, then use that code to register on Matrix. **At registration time** we do not require an email address; you choose your own username, and the server does not store identity-linked registration records. Codes are **reusable (not single-use)**, so they cannot be used to infer who registered or when. So: there is one point of contact when obtaining a code, but **inside the system**, registration and usage are not tied to email or real name—we keep “who is who” to the minimum needed to run the service.

The benefits of self-hosting and this flow are straightforward:

- **Minimal logging and tracking**: we keep “who did what when” to the smallest scope we can, and delete when we can.
- **No real-name or verification requirement**: no mandatory ID upload, no phone or email—just a registration code to sign up.
- **Policies designed for sensitive topics and anonymous research**: whether you work on anonymous networks, censorship measurement, or other high-sensitivity areas, you don’t have to worry about account exposure; we will adjust policy as the community needs.

So **we chose Matrix not simply because Discord is “bad”**—rather, large platforms must serve business and the general public, while we need a space where we decide the rules, minimise data collection, and prioritise anonymity and privacy.

## Between privacy and community quality: why we use an application process

So **Matrix (im.anoni.net) and [Cryptpad](https://cryptpad.anoni.net/) accounts both require a registration code**, which you get by emailing `whisper@anoni.net` or through another trusted channel. We (or that channel) reply with instructions or the code, and you then complete registration in the client. We do not allow open one-click signup, so we can reduce abuse while keeping “no identity stored at registration” as above.

A brief note on Cryptpad: **Cryptpad is an end-to-end encrypted, privacy-focused collaborative platform** for shared pads, real-time notes, documents, to-do lists, whiteboards, and more. Content is encrypted throughout; only participants can access it. Unlike Google Docs and similar tools, Cryptpad has no server-side decryption and does not require trusting the operator—well suited to confidential or privacy-sensitive collaboration. We self-host Cryptpad so the community can discuss, co-edit, and collaborate with minimal risk of third-party collection or surveillance.

Why an application process:

- **To avoid abuse**: open registration would quickly attract bots and bad actors; for a small self-hosted service, moderation would become unsustainable.
- **So everyone who joins knows what this space is**: applicants understand that this is for themes like “personal privacy guidelines,” “Tor relays on campus,” and “anonymous payments”—not a general-purpose chat. People who write in for a code usually already have some interest in these topics.
- **We’re protecting the space, not excluding people**: we don’t ask for real names or ID documents, only that you take a moment to write and briefly say what you’re interested in. If these themes matter to you, we welcome you to get in touch.

For how to request accounts and get started, see [Communication and Collaboration Tools](../../about/community/communication-tools.md).

## A word to people who use Discord

We don’t want this to feel like an either/or: many people need to stay on Discord for communities, games, or projects, and that’s fine. We’re saying: **when you need to discuss sensitive topics or want higher privacy and a predictable environment, there is a small, stable Matrix space here**.

- If you want to dive into the 2026 themes (personal privacy guidelines, Tor Relay on campus, anonymous payments) or run experiments around anonymous networks, you’re welcome to do that on [Matrix and Cryptpad](../../about/community/index.md).
- If you only want to follow along occasionally, staying on your current platform is fine. We’ll keep sharing progress on the site and at events; you can decide later whether to go further.

anoni.net’s door stays open. The difference is that we think about this path in terms of **who decides the rules and who holds the data**, and we use a self-hosted Matrix and an application-based account process to balance privacy and quality in a way we can live with.
