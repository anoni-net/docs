---
title: General readers
description: For readers with no specific adversary. Daily changes ordered by real-world effect, the measures that are overestimated, and a few tools that run entirely in your browser.
icon: material/account-outline
---

# :material-account-outline: General readers start here

Nobody specific is watching you. You would just rather not be profiled by platforms and ad networks, and would rather not lose an account one day. This applies to most people, and it is the shared baseline under the other four roles.

For comprehensive general guidance, [EFF Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"} and [Privacy Guides](https://www.privacyguides.org/){target="_blank"} go deeper than this site does and we recommend them directly. The path below is the short version, written with regional context where it changes the answer.

## Three things you are probably dealing with

### Every site wants an account, and the same password goes everywhere

One site leaks and the same credentials fall everywhere else. For most people this is how the first security incident happens.

The [passphrase and password generator](../utils/passphrase.md) runs in your browser and uploads nothing.

### Apps keep asking for permissions and it is unclear which to refuse

Location, contacts, photos. Most apps ask for far more than they need, and refusing rarely affects use. Most people simply have not had time to go through them.

[How platforms collect your data](../basics/platform-tracking.md) covers how the collected pieces get combined.

### Claims about private browsing and VPNs, with no way to judge them

Both have real uses, and both cover a much narrower range than the marketing suggests. Applied to the wrong problem they produce false confidence.

[Networks mistaken for anonymity](../advanced/mistaken-for-anonymity.md) goes through what each one actually blocks.

## Three pages for your first twenty minutes

1. [What an ordinary person should actually do](../scenarios/everyday-baseline.md): ordered by real-world effect, and explicit about which measures are overestimated. If you read only one page, read this one
2. [Passphrase and password generator](../utils/passphrase.md): the lowest effort for the most direct effect, generate a few while you are there
3. [Networks mistaken for anonymity](../advanced/mistaken-for-anonymity.md): clear the misconceptions first, so effort does not go where it has no effect

## Building the foundation over a week

### Highest effect first

- [Getting started with password managers](../tools/password-manager.md): one password per site, held by a tool rather than by memory
- [Email aliases, and who you hand your trust to](../tools/email-alias.md): a signup address separate from your main one
- [Secure messaging compared](../tools/messaging-comparison.md): what to use day to day, and where each option stops

### Understanding what is happening

- [Anonymity, privacy, pseudonymity, and confidentiality](../basics/anonymity-vs-privacy.md): four words routinely used interchangeably, which leads to picking the wrong tool
- [Metadata, and why it matters](../basics/metadata.md): who contacted whom and when, a layer content encryption does not cover
- [How platforms collect your data](../basics/platform-tracking.md): how the fields you never filled in get inferred
- [A browser fingerprint cannot be cleared the way a cookie can](../basics/browser-fingerprinting.md): what remains after you clear everything

### Tools that run in your browser

All three run on your own device and upload nothing.

- [What your browser gives away](../utils/leaks.md): see right now what your device is disclosing
- [URL cleaner](../utils/clean-url.md): strip tracking parameters before sharing a link
- [File metadata stripper](../utils/strip-metadata.md): coordinates in a photo are the most common leak

### Going further

- [What is Tor?](../tools/what-is-tor.md): most people have heard the name, and the uses and limits are worth reading properly
- [Interactive visualisations](../games/index.md): walk through onion routing in 3D, faster than reading about it

## What to take with you

- [Threat model checklist](../utils/threat-model.md): three questions and you will know where your effort belongs. Answers are never stored and are gone on reload
- The tools section works offline, see [offline reading](../offline.md)
- Come talk in the [public Matrix room](../community/tools.md)

## What this path does not cover

- **Someone specific is watching you**: an ex-partner, an employer, or attention that comes with your work. Find the closest fit in [scenarios](../scenarios/index.md), or go back to [start by role](./index.md) for the other entry points
- **Speaking online from a jurisdiction with heavy platform controls**: see [posting on mainland Chinese platforms](../scenarios/mainland-speech.md) and [speaking online from Singapore and Malaysia](../scenarios/singapore-malaysia-speech.md)
- **An account already compromised, money already sent, a device lost, or stalking in progress**: go to [emergency help](../help/index.md) first. The helpline numbers there are Taiwan-specific, while the account, device, and connectivity sections apply anywhere
