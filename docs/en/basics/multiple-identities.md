---
title: Maintaining multiple online identities
description: How many layers you actually need, the tool boundary for each one, how outside observers correlate accounts, and the long-haul maintenance and exit that most guides skip.
icon: material/account-multiple-outline
---

# :material-account-multiple-outline: Maintaining multiple online identities

[Anonymity, privacy, pseudonymity, confidentiality](./anonymity-vs-privacy.md) defines a pseudonym as an identity whose actions can be linked to each other but not back to your legal identity. That linkability is the entire problem. Three years of posting under `cat_lover_7` accumulates a schedule, a vocabulary, and a set of interests rich enough to sketch a person — and from there, a single overlapping data point with your named identity connects the two.

This page is about keeping several identities from contaminating each other over time. The first half covers setup. The second half covers where people actually lose separation: months and years after the setup was done.

## Who needs separate identities

Compartmentalization sounds like something only high-risk workers do. In practice the situations are ordinary:

- A journalist approaching sources under one identity and living an ordinary life under another — see [journalists and source protection](../scenarios/journalist.md)
- An activist keeping an organizing role apart from a day job — see [activists and protest digital safety](../scenarios/activist.md)
- A survivor rebuilding contact details an abuser does not know — see [domestic violence survivors](../scenarios/domestic-violence.md)
- A conference attendee separating business contacts from personal accounts — see [business travel and conferences](../scenarios/asia-travel.md)
- LGBTQ+ people pacing disclosure — see [LGBTQ+ and sexual minorities](../scenarios/lgbtq.md)
- Anyone job-hunting who would rather their current employer not see it, or who does not want a shopping platform's recommendations reaching a work account

The adversaries differ. The work is largely the same, and the setup below applies to all of them.

## Decide how many layers first

Most failures start with over-segmentation. Every additional layer adds rules to remember daily, and a scheme you cannot sustain for three months gets quietly abandoned — usually by using the wrong account on a tired evening. Go back to the three questions in [how to build a threat model](./threat-model.md) (what are you protecting, from whom, at what cost) before choosing.

### Layer count by situation

| Situation | Suggested layers | Split |
|---|---|---|
| General reader | 2 | Named layer (work, family, banking) plus one unnamed everyday layer (forums, shopping, hobbies) |
| Business travel and conferences | 2 to 3 | Named, business-contact, plus an event-specific layer for sensitive topics |
| LGBTQ+ and sexual minorities | 2 to 3 | Everyday, community, plus a short-lived exploration layer |
| Journalist | 3 | Named (bylined), source-contact, plus a disposable layer for high-risk sources |
| Activist | 2 to 3 | Named, organizing, plus an action-duration layer when specifically at risk |
| Domestic-violence survivor | 2 | The old layer the abuser knows (kept looking normal at first) and a new layer they know nothing about |

Disposable and long-lived layers are maintained differently. A layer meant to run for years needs a stable email, password management, and recovery options. A disposable layer ends when the task ends, and should accumulate nothing trackable in the meantime.

### Rules between layers

Whatever the count, three rules hold:

- **Share no identifier**: email, phone number, username, password, the same password-manager vault, the same 2FA app group
- **Never open two layers at once**: the same browser window or handset logged into two layers is the most common failure
- **Never cross-reference**: don't repost between layers, and don't follow, like, or comment across them

## Tool boundaries per layer

Each layer should at minimum have its own:

- **Email**: don't register a secondary-layer account with a work address or a shared family inbox. ProtonMail or Tuta are reasonable privacy-respecting providers. Mainstream free providers generally demand phone verification at signup, and accounts opened from the same device and IP may be linked by the provider regardless, so expect that if you use one for a secondary layer.
- **Browser profile**: Firefox and Chrome both support multiple profiles, each with its own cookies, login state, and bookmarks. Open a layer's profile only for that layer, and don't run two profiles logged in simultaneously.
- **Password-manager vault**: Bitwarden and 1Password support collections and separate vaults. Put each layer in its own, so a breach of the main account doesn't take the rest with it. For background, see [Privacy Guides — password managers](https://www.privacyguides.org/en/passwords/){target="_blank"}.
- **Two-factor authentication**: Aegis (Android) and 2FAS (cross-platform) can group accounts. Don't put a secondary layer's TOTP secrets in the same group as your work email on the same handset. Judge a TOTP app on three things: open source, exportable backups, and stable ownership. Twilio retired Authy's desktop client in 2024, and Raivo was acquired by Mobime in July 2023, after which the privacy policy took on advertising trackers and log collection[^raivo]; neither is a good pick for new adopters.

When the separation needs to reach the operating system, [Tails vs Whonix vs Qubes](../tools/tails-vs-whonix-vs-qubes.md) covers Qubes' VM compartmentalization and Tails' amnesic model, and which threat each one fits.

## Links you leave while setting up a new identity

During registration and early use, the correlations that matter are the ones the platform can see and you cannot:

- **A shared phone number or email**: Instagram, X, and TikTok build "people you may know" from contact graphs and registration identifiers. A number that touched both accounts can join them.
- **Contact upload**: the "find friends" prompt on first launch uploads your entire address book, which drops the new identity straight into the old social graph. How platforms use that for reverse matching is in [how platforms collect your data](./platform-tracking.md).
- **Mutual follows and interactions**: two accounts liking or replying to each other collapse the separation on the platform's side in one query.

In practice:

- Register with a virtual number (MySudo, TextNow) rather than your real SIM. WhatsApp has been blocking VoIP numbers at scale — verify before relying on one. Two consequences are routinely missed: paid virtual numbers are bought with a card, which reconnects the layers through the money (see the payments section below), and virtual numbers get recycled to another customer later, who can then reset your accounts by SMS. Never set one as a recovery channel. JusTalk, once a common recommendation, was found in 2022 to have fake E2EE, with millions of plaintext messages and virtual-number-to-real-number mappings exposed online[^justalk]; avoid it.
- Use a non-face image: a pseudonym graphic, an abstract image, or a back / silhouette / pet photo
- Make the username structurally different, not a variation on shared initials
- Stagger posting times deliberately
- Leave contact upload off, don't follow across layers, and don't comment on the other layer's posts

## How outside observers correlate accounts

The section above is about not volunteering links. This one is about what happens once the accounts exist, and how to audit yourself the way an observer would.

### Reverse-image search of profile photos

Google Images, Yandex, TinEye, and PimEyes can reverse a single image, including a face, against the indexed web. PimEyes states it searches the open web only and excludes social media and video platforms, but combined with username matching it can still surface linked accounts.

- Profile photos must never overlap between layers
- Test by saving the image and running it through [Google Images](https://images.google.com/){target="_blank"} reverse search before posting
- Use drawn, abstract, or no-face images on secondary layers
- When shooting new profile photos, avoid identifiable backgrounds (your front door, a regular café, office signage)

### Reused usernames

`@tomtom_taipei` reused across Instagram, X, Bluesky, and Reddit is one search away from a complete identity graph. Give every platform a structurally distinct username; even shared digit suffixes correlate. A naming scheme that is easy for you to remember is equally easy to search. [Whatsmyname](https://whatsmyname.app/){target="_blank"} checks a username against a long list of platforms and is useful for self-auditing.

### Posting-time overlap

Two accounts active in tightly overlapping windows are statistically suspicious, and researchers, journalists, and marketing analysts use this routinely. Stagger posting times, avoid posting from both accounts within the same hour, and note that travel timezone shifts moving in lockstep are their own fingerprint.

### Stylometry: writing style and emoji

Vocabulary, punctuation habits, and emoji use are individually distinctive, and entry-level stylometry tools can recognize the same author across pseudonyms. The goal is awareness rather than performing a different person:

- Use shorter sentences with fewer specifics on the secondary layer
- Deliberately use a different emoji set (😂 vs. 🤣)
- Paraphrase rather than copy-paste when restating your own views across layers

## The long haul is the hard part

Setup can be done from a checklist. Maintenance cannot. An identity that runs for three years passes through new phones, job changes, travel, and changes in relationships, and each one is a moment where the separation has to be re-established. These are where it usually breaks.

### One cross-login undoes it

Two layers opened in the same browser profile share a cookie jar and login state. No clever analysis is required: one cookie, one session, one device fingerprint is enough to file both accounts together.

- Never open two layers in one profile; on mobile, separate them into different browser apps. Social apps are harder to separate than browsers: Android offers a work profile or vendor app-cloning, iOS has no system-level multi-user, so in practice a second handset is often the only clean answer
- "Sign in with Google" and "Sign in with Apple" are particularly dangerous, since one tap binds both layers to a single identity. Register secondary layers with email and a password.
- When you need stronger isolation, [Tor Browser](../tools/tor-browser-advanced.md)'s New Identity clears current state and builds a fresh circuit, which suits disposable layers

### Money is the stickiest link

One credit card, one bank account, or one wallet binds two layers directly, and financial records are typically retained far longer than social-platform data. When a secondary layer has to pay for something (a domain, a VPS, a subscription, platform membership), the available options and their trade-offs are in [why anonymous payment matters](./payments-anonymity.md). Offline, cash and gift cards remain the most mature choice.

### Schedule and timezone

The detection mechanism is covered under correlation above; what long-term maintenance has to handle is that you cannot suppress it. Reduce the observable sample instead: post less often on secondary layers, delay posts by hand rather than authorizing a third-party scheduler (which adds another service holding credentials for that layer), and let secondary layers go quiet while travelling.

### Device and browser fingerprints

The font list, screen resolution, timezone, and language settings a browser reports combine into a fingerprint that usually identifies a specific machine. Changing accounts without changing devices is changing the name but not the face. [VPN: risks and how to choose](../tools/vpn-guide.md) explains why a new IP does nothing for a fingerprint, and [Tor](https://www.torproject.org/){target="_blank"} takes the opposite approach by making all users look alike.

A dedicated device for the highest-risk layer is expensive and still the most reliable isolation available.

### Social-graph overlap

Heavy overlap between two accounts' follower lists is computable by the platform and by outside observers alike. Introducing a new identity to the same circle of friends completes the correlation by itself.

- Don't follow people your named layer knows from a secondary layer, and be careful about accepting them
- Two layers inside the same small community will overlap heavily, so keep only one there
- When you do bring friends to a new identity, say so offline or over an encrypted channel rather than on the platform

### A quarterly self-check

Put these in a calendar and answer them every few months. It is far cheaper than remediation:

- Has this layer acquired any email, phone number, or payment method shared with another layer in the last three months?
- Run the current username through Whatsmyname. Any unexpected hits?
- Reverse-image the profile photo. Does it reach another layer? Run both of these self-checks from a clean browser profile or Tor Browser, never from the browser where your named accounts are signed in
- Has follower overlap between layers increased?
- Does this layer still need to exist? If not, use the exit below.

## Retiring an identity

Deleting an account outright is usually the worst option. Disappearing is itself an event: anyone watching notes the date and compares it against changes elsewhere. Deletion also does nothing about platform-side records or the screenshots other people already hold.

A steadier sequence:

1. **Stop adding content** and let the account go quiet, without a farewell post
2. **Remove the material that supports reverse lookup**: profile photo, locations and occupations in the bio, EXIF-bearing photos, links pointing at other layers
3. **Unbind**: move the address to an email used only by this identity and never again, then remove the phone number and third-party login grants
4. **Check for dependencies**: is any other service using this address for account recovery?
5. **Keep the shell or delete it, as the risk warrants**: a dormant account still costs you a password and a 2FA entry to maintain, and the platform keeps associating it. An account still wired into recovery flows should certainly not be deleted

One situation inverts this. If you are already being harassed or threatened, or legal proceedings are plausible, the records are evidence and should be preserved. [Activists and protest digital safety](../scenarios/activist.md) makes the related point that a pre-agreed disappearing-message policy reads very differently from a sudden deletion after the fact. For urgent digital-security support, [Access Now Helpline](https://www.accessnow.org/help/){target="_blank"} operates 24/7 in multiple languages.

## Common misconceptions

- **Private browsing is a new identity**: it clears local traces on that device only. The platform still sees the account, and DNS and connection records are unaffected.
- **A different VPN is a different identity**: a VPN changes who watches your traffic, and leaves accounts, cookies, and fingerprints untouched. See [VPN: risks and how to choose](../tools/vpn-guide.md).
- **Two accounts on one phone are fine**: the advertising identifier, address book, backups, and keyboard history all live on the same handset.
- **More layers are safer**: maintenance cost rises with each one, and a scheme you cannot sustain is not a scheme. This is the third question in [how to build a threat model](./threat-model.md).

## Where to go from here

- [Anonymity, privacy, pseudonymity, confidentiality](./anonymity-vs-privacy.md) — draw the line between anonymity and pseudonymity first
- [How to build a threat model](./threat-model.md) — answer what, from whom, and at what cost before picking a layer count
- [What metadata is and why it matters](./metadata.md) — the timing, location, and device traces that join two layers
- [How platforms collect your data](./platform-tracking.md) — the signals platforms use to file two accounts together
- [Why anonymous payment matters](./payments-anonymity.md) — the hardest link to cut
- [Speaking online from Singapore and Malaysia](../scenarios/singapore-malaysia-speech.md) — where real-name identity layers make separation harder to sustain

[^raivo]: [PSA: Raivo OTP for iOS was acquired by Mobime a few months ago](https://www.ghacks.net/2023/12/19/psa-raivo-otp-for-ios-was-acquired-by-mobime-a-few-months-ago/){target="_blank"} — gHacks, December 2023. Privacy Guides community discussion at the time noted the new owner's policy covering Facebook and Google AdMob trackers and IP logging. Verified 2026-08.
[^justalk]: [Messaging app JusTalk is spilling millions of unencrypted messages](https://techcrunch.com/2022/07/22/justalk-unencrypted/){target="_blank"} — TechCrunch, July 2022, on JusTalk's false E2EE claims and the millions of plaintext messages and virtual-number mappings exposed online.
