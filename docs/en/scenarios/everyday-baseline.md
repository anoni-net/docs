---
title: What an ordinary person should actually do
description: A baseline for readers with no special role, ordered by how much each measure actually blocks — the four things worth doing first, what deserves more time, what is overrated, and when to escalate.
icon: material/account-outline
---

# :material-account-outline: What an ordinary person should actually do

The other scenarios in this section are written for people with a named adversary: journalists, activists, survivors of domestic abuse. Readers with no such role are still subject to large-scale data collection — the composition of the adversary just differs, and so does the right response.

The common advice is ordered below by how much it actually blocks, and each item states what it does not block. You don't need to work through it in order; the first tier already helps.

## You are facing three different adversaries

They differ in intensity, in how often they show up, and in what they cost you, so they call for different defenses.

**Commercial data collection.** Platforms, ad networks, and data brokers do this continuously. It isn't aimed at you personally; the goal is classification and ad delivery. The feeling that recommendations are unnervingly accurate comes from here, and that feeling is correct — the collection is real. What it mostly produces is classification and price discrimination, accumulating slowly and diffusely, and tier two is where you address it. The mechanics are in [how platforms collect your data](../basics/platform-tracking.md).

**Fraud and account takeover.** Mostly automated and untargeted, occasionally aimed at a specific person. This is the layer that actually costs people money. For scale: in a population of 23 million, Taiwan recorded 162,000 reported fraud cases in 2025, with losses of NT$89.3 billion (roughly US$2.8 billion)[^165].

**Targeted investigation.** An adversary with legal process or technical resources behind it. Where the rule of law holds, there is a real threshold: Taiwan's Communication Security and Surveillance Act, for instance, requires a judge-issued warrant, generally limited to offenses carrying a minimum sentence of three years or to an enumerated list, with time limits and reporting duties. Cost and procedure keep the target list short, so most people are not on it — but there are triggers, covered in [when to raise your standard](#when-to-raise-your-standard).

Putting all your effort into the third adversary does nothing about the losses the second one causes, and the reverse holds too.

!!! warning "Where the third adversary is cheap, this ordering changes"

    The ranking below assumes targeted investigation is expensive and therefore rare. Under mandatory real-name registration, statutory data retention, and content moderation built into the platform layer, that threshold drops sharply and public speech alone can trigger it. Hong Kong has measured national-security sentences in years since the 2020 National Security Law and the 2024 Safeguarding National Security Ordinance, and since March 2026 refusing to surrender a device password during a national-security investigation is itself an offense. The first two tiers still apply, but the premise that "most people are not on the list" needs re-examining. See [posting on mainland Chinese platforms](./mainland-speech.md), [speaking online from Singapore and Malaysia](./singapore-malaysia-speech.md), and the Hong Kong section of [cross-border travel and device searches](./asia-travel.md).

## How the ordering was decided

Two criteria: likelihood of the event multiplied by what it costs you, and how long a single configuration keeps working. Measures that are technically strong but rarely relevant sit lower. That is a statement about priority for most people, not about whether they work.

The decision framework itself is in [threat modeling](../basics/threat-model.md), which routes you to EFF's Your Security Plan for the walkthrough. This page is what that framework produces once it has already been worked out for a reader with no specific adversary.

## Tier one: blocking most account takeover and fraud loss

These four target the second adversary, the one that actually costs money. Commercial data collection is handled from tier two onward.

**Which account first:** email. Every other account's password reset lands there, so losing the main mailbox loses everything else with it. Then online banking, then the social accounts you use daily.

The four together take about an hour, and every tool involved has a workable free tier.

### A password manager, with a different password per site

After one site is breached, attackers replay the same credentials against every other service. Unique passwords stop the chain at the first site.

Start by finding out how exposed you already are. Enter your address at [Have I Been Pwned](https://haveibeenpwned.com/){target="_blank"} and it lists the public breaches it appears in. The number is usually higher than people expect, and it explains directly why unique passwords rank first. The lookup does require typing in an address; the maintainer states that searches are not logged, and if that bothers you, query your least sensitive mailbox.

If you have never used one, the manager built into your phone is enough to start with — the Passwords app on iOS, or Settings → Google → Autofill on Android. Choosing software can wait.

A password manager has a second, less-discussed effect: it only autofills when the domain matches. On a lookalike phishing site it stays silent, and that silence is the warning.

What it doesn't block: you copying the password out and pasting it into the fake site yourself. EFF's [Surveillance Self-Defense](https://ssd.eff.org/module/creating-strong-passwords){target="_blank"} covers tool selection and recovery planning.

### Two-factor authentication, as strong as the site allows

Two-factor authentication adds a second step beyond the password. Strongest to weakest:

- **Passkeys** — your phone or laptop's fingerprint or face unlock replaces the password; the key stays on the device and is bound to the domain
- **Hardware security keys** — a USB or NFC device such as a YubiKey, also bound to the domain, from US$58 at list price[^yubikey]
- **A TOTP app** — the kind that shows a rotating six-digit code; Aegis and 2FAS are common choices
- **SMS** — a code by text message

SMS still beats nothing, so turn it on now and upgrade later. It stops automated credential stuffing; it does not stop phishing aimed at you.

Plenty of banks and government services still offer nothing but SMS. Upgrade what you can, and note that the rest is not your decision to make.

**Save the backup codes first.** When you enable two-factor authentication the service issues one-time recovery codes, and they are how you get back in after losing or replacing the phone. Print them or write them down somewhere physical rather than leaving them only on the same device. Locking yourself out is the most common real loss people take after switching on 2FA.

Passkey coverage deserves an honest number. Vendor reports usually quote support among the largest sites, but a 2026 independent census of the Tranco top 100K found overall support at 11.3%, with even the top 100 sites at 20%[^passkey-census]. Among sites that do support passkeys, 75.2% implement them through an external identity provider, mostly Google's OAuth — so many "sign in with a passkey" buttons are really "sign in with Google," which concentrates the linkage into a single account rather than removing it. Enable passkeys where they exist, and keep the password manager.

Two-factor authentication blocks direct login after a password leak. It does not block real-time relay phishing, where the attacker forwards your code to the real site as you type it. Passkeys and hardware keys are bound to the domain and do stop that; TOTP and SMS do not.

### Keep the operating system and browser updated

Most vulnerabilities that get exploited in practice already have a patch available; what attackers go after is the unpatched device. Turning on automatic updates beats remembering to check. On iOS: Settings → General → Software Update → Automatic Updates. On Android: Settings → System → System update, with wording varying by manufacturer.

It does not block zero-days — vulnerabilities exploited before a patch exists — but those are expensive to acquire and generally reserved for specific targets.

### Verify anything urgent through a second channel

The only tier-one item that is a habit rather than a setting. Urgency is the common thread across fraud: manufacture a conflict, then demand a decision while you are still reacting to it.

When a message claims to come from your bank, a courier, customer support, or a government office, don't follow the link. Open the app yourself, or call the number you already had. Two extra minutes blocks more than the previous three items combined.

This one covers the fraud line specifically. It is not interchangeable with the previous three, which block a different class of thing.

It does not block a fake site you go looking for — a fake support page in a search engine's ad slot, for instance. Reach official channels by typing the address or using a bookmark.

## Tier two: worth the time

This is where the first adversary gets addressed — the one behind recommendations that feel too accurate.

### Phone permissions and the advertising identifier

Turn off the advertising ID, contact-list upload, and precise location, then walk the permission list app by app. Concrete steps for each platform are in [how platforms collect your data](../basics/platform-tracking.md), together with a clear statement of what none of them stops.

What it doesn't block: behavioral signals inside a platform you actively use, and the copy of you that arrives when someone else uploads their contacts.

### Full-disk encryption and a boot password

Protects against someone pulling the storage out of a lost or stolen device. On iPhone, setting a passcode enables it; on Android, check Settings → Security.

It does not protect against being compelled to unlock the device in front of someone, which is a separate problem covered in [cross-border travel and device searches](./asia-travel.md).

### Move everyday messaging to end-to-end encryption

Signal and comparable tools protect content, not the record of who contacted whom and when. Tool comparison is in [comparing anonymous messaging tools](../tools/messaging-comparison.md); why metadata often identifies you more precisely than content is in [why metadata matters](../basics/metadata.md).

### Backups

Ransomware, drive failure, a phone in a sink — backups are the only measure on this page that recovers anything after the fact. Keep at least two copies of anything important, with one of them not attached to the same device or the same account as the original.

They do nothing about data that has already left. Backups address loss, not exposure.

### Take inventory of your accounts

Dormant accounts are a common leak source, and you won't notice when one is compromised. List every account from the password manager and delete the ones you don't use; deletion beats a password change. Sequencing is covered under retiring an identity in [maintaining multiple online identities](../basics/multiple-identities.md).

Deletion stops future accumulation. It does not reclaim what has already been taken.

## Tier three: only for specific situations

With tiers one and two done, most of the everyday exposure surface is handled. What remains is behavioral profiling inside the platforms you use, their historical records, and whatever you hand over voluntarily — none of which a change of tools reaches.

This tier is the same set of measures listed at the end of [how platforms collect your data](../basics/platform-tracking.md) — separate browsing contexts and accounts, separate devices, connection-layer anonymity via Tor ([Tor Project Support](https://support.torproject.org/){target="_blank"} for the basics, [Tor Browser advanced settings](../tools/tor-browser-advanced.md) once you are using it). What differs here is the reason to reach for them, which is the table below.

## Overrated measures

Each of these has a clear use. They are just frequently mistaken for the main line of defense.

| Measure | What it actually does |
|---|---|
| VPN | Changes who can see your connection. Selection criteria and the ownership problem are in [VPN risks and how to choose one](../tools/vpn-guide.md) |
| Private browsing mode | Clears local history. The platform, your ISP, and any service you log into still recognize you |
| Changing your phone number | Carriers recycle released numbers to the next customer, so unbind accounts from the old number first |
| Camera cover | Effective for the camera, but what most people worry about is the microphone. The evidence on that is in [how platforms collect your data](../basics/platform-tracking.md) |
| Deleting an app | Stops future collection; data already held does not disappear. To actually reduce it, export your data to see what exists, then go through account deletion |

## A yearly review

Not a redo. Just work through these questions once a year.

- Any reused passwords left in the manager? Most tools check this for you
- Any important accounts still on SMS that now support something stronger?
- Can you still find your backup codes, especially after changing phones?
- Delete anything you haven't signed into in a year
- Review the phone permission list, especially for recently installed apps
- Can you actually restore from your backup? An untested backup is not a backup
- After a job change, a relationship change, or a move: do the assumptions above still hold?

## Local equivalents

The figures cited here are Taiwanese because that is where this site is based. The categories transfer; the specific institutions do not. Wherever you are, it is worth knowing three things before you need them.

- **The national fraud reporting line and its published statistics.** Taiwan's is `165`, and its [public dashboard](https://165dashboard.tw/){target="_blank"} breaks down case counts and losses by fraud type, which is a fast way to see what is currently common. Most jurisdictions publish something comparable
- **Your data protection authority**, and whether it can actually act on a complaint
- **How fast your bank can freeze a transfer**, because with fraud the interval between the transfer and the report determines whether anything is recoverable

## When to raise your standard

If something has already happened — an account compromised, a device lost, ongoing stalking — the table below does not apply. Contact the [Access Now Digital Security Helpline](https://www.accessnow.org/help/){target="_blank"} (24/7, multilingual) instead.

The baseline above assumes no specific adversary. When one of the following becomes true, the threat model has changed and the corresponding page applies.

| Situation | Where to go |
|---|---|
| You start working on sensitive material, or someone offers you internal information | [journalists and source protection](./journalist.md) |
| You join organized action or attend protests | [activists and protest digital safety](./activist.md) |
| A partner or family member monitors your devices and location | [domestic violence and tech-enabled abuse](./domestic-violence.md) |
| You need to control the pace of disclosure, or use the internet under family monitoring | [LGBTQ+ and sexual minorities](./lgbtq.md) |
| You are observing an election or recording at a polling station | [election observer self-protection](./election-observer.md) |
| You want to donate anonymously, or design a donation channel for an organization | [anonymous donation channels](./nonprofit-anonymous-donation.md) |
| You are traveling to a jurisdiction with border device searches | [cross-border travel and device searches in Asia](./asia-travel.md), [pre-departure briefing prompts](./travel-ai-briefing.md) |
| You plan to speak publicly under a real-name platform regime | [posting on mainland Chinese platforms](./mainland-speech.md), [speaking online from Singapore and Malaysia](./singapore-malaysia-speech.md) |

## Where to go from here

- [Threat modeling](../basics/threat-model.md) — what to protect, from whom, at what cost; the basis for the ordering on this page
- [How platforms collect your data](../basics/platform-tracking.md) — the full version of the commercial-collection thread
- [Why metadata matters](../basics/metadata.md) — why encrypting content still leaves a great deal behind
- [Maintaining multiple online identities](../basics/multiple-identities.md) — account layering and retiring an identity
- [EFF Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"} — the canonical general-audience guide, available in 14 languages
- [Access Now Digital Security Helpline](https://www.accessnow.org/help/){target="_blank"} — 24/7 multilingual support when something has already gone wrong

[^165]: Figures from Taiwan's National Police Agency [165 anti-fraud dashboard](https://165dashboard.tw/){target="_blank"}: 162,000 cases and NT$89.326 billion in losses for calendar year 2025. Press summary: [Nationwide fraud losses approached NT$90 billion in 2025](https://news.ttv.com.tw/news/11501190003200W){target="_blank"} — TTV News, 19 January 2026. Verified 2026-08.

[^yubikey]: [YubiKey 5 NFC](https://www.yubico.com/product/yubikey-5-series/yubikey-5-nfc/){target="_blank"} lists at US$58; other models in the series are priced differently. Verified 2026-08.

[^passkey-census]: Census of passkey support across the Tranco top 100K, based on a March 2025 snapshot: 11.3% overall, 20% among the top 100, 6.9% at ranks 50K–100K, and 75.2% of supporting sites implementing through an external identity provider. See [State of Passkey Authentication in the Wild: A Census of the Top 100K sites](https://arxiv.org/html/2602.15135v2){target="_blank"}. Verified 2026-08.
