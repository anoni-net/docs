---
title: What an ordinary person should actually do
description: A baseline for readers with no special role, ordered by how much each measure actually blocks — the four things worth doing first, what deserves more time, what is overrated, and when to escalate.
icon: material/account-outline
---

# :material-account-outline: What an ordinary person should actually do

The other scenarios in this section are written for people with a named adversary: journalists, activists, survivors of domestic abuse. Readers with no such role are still subject to large-scale data collection — the composition of the adversary just differs, and so does the right response.

This page orders the common advice by how much it actually blocks, and states after each item what it does not block. You don't need to work through it in order; the first tier already helps.

## You are facing three different adversaries

They differ in intensity, in how often they show up, and in what they cost you, so they call for different defenses.

**Commercial data collection.** Platforms, ad networks, and data brokers do this continuously. It isn't aimed at you personally; the goal is classification and ad delivery. The feeling of "my phone is listening to me" almost always comes from this layer, because inference gets accurate enough to be unsettling. The mechanics are in [how social platforms collect your data](../basics/platform-tracking.md).

**Fraud and account takeover.** Mostly automated and untargeted, occasionally aimed at a specific person. This is the layer that actually costs people money. For scale, Taiwan recorded 162,000 reported fraud cases in 2025 with losses of NT$89.3 billion (roughly US$2.8 billion)[^165], in a population of 23 million.

**Targeted investigation.** An adversary with legal process or technical resources behind it. It is expensive, so the target list is short. Most people are not on it, but there are triggers — see [when to raise your standard](#when-to-raise-your-standard) below.

Putting all your effort into the third adversary does nothing about the losses the second one causes, and the reverse holds too. Work out which one you actually face before deciding how much to invest.

!!! warning "Where the third adversary is cheap, this ordering changes"

    The ranking below assumes targeted investigation is expensive and therefore rare. In jurisdictions with mandatory real-name registration, statutory data retention, and content moderation built into the platform layer, that threshold drops sharply and public speech alone can trigger it. The first two tiers still apply, but the premise that "most people are not on the list" needs re-examining. See [posting on mainland Chinese platforms](./mainland-speech.md) and [speaking online from Singapore and Malaysia](./singapore-malaysia-speech.md).

## How the ordering was decided

Two criteria: likelihood of the event multiplied by what it costs you, and how long a single configuration keeps working. Measures that are technically strong but rarely relevant sit lower. That is a statement about priority for most people, not about whether they work.

The full decision framework is in [threat modeling](../basics/threat-model.md); this page is the expanded version of the "general user" sketch on that page.

## Tier one: four things that block most of it

### A password manager, with a different password per site

After one site is breached, attackers replay the same credentials against every other service. Unique passwords stop the chain at the first site.

A password manager has a second, less-discussed effect: it only autofills when the domain matches. On a lookalike phishing site it stays silent, and that silence is the warning.

What it doesn't block: you copying the password out and pasting it into the fake site yourself. EFF's [Surveillance Self-Defense](https://ssd.eff.org/module/creating-strong-passwords){target="_blank"} covers tool selection and recovery planning.

### Two-factor authentication, as strong as the site allows

Strongest to weakest: passkeys, hardware security keys, a TOTP app, SMS. SMS still beats nothing — turn it on now and upgrade later.

Passkey coverage deserves an honest number. Vendor reports usually quote support among the largest sites, but a 2026 independent census of the Tranco top 100K found overall support at 11.3%, with even the top 100 sites at 20% and ranks 50K–100K down at 6.9%[^passkey-census]. The more revealing figure: among sites that do support passkeys, 75.2% implement them through an external identity provider, mostly Google's OAuth. A meaningful share of "sign in with a passkey" buttons are really "sign in with Google," which concentrates the linkage into a single account rather than removing it.

So enable passkeys where they exist and keep the password manager. The long tail is not catching up soon.

This tier blocks direct login after a password leak. It does not block real-time relay phishing, where the attacker forwards your code to the real site as you type it. Passkeys and hardware keys are bound to the domain and do stop that; TOTP and SMS do not.

### Keep the operating system and browser updated

Most vulnerabilities that get exploited in practice already have a patch available; what attackers rely on is the unpatched device. Turning on automatic updates beats remembering to check.

It does not block zero-days, but zero-days are expensive and generally reserved for specific targets.

### Verify anything urgent through a second channel

The only tier-one item that is a habit rather than a setting. Urgency is the common thread across fraud: manufacture a conflict, then demand a decision while you are still reacting to it.

When a message claims to come from your bank, a courier, customer support, or a government office, don't follow the link. Open the app yourself, or call the number you already had. Two extra minutes blocks more than the previous three items combined.

It does not block a fake site you go looking for — a fake support page in a search engine's ad slot, for instance. Reach official channels by typing the address or using a bookmark.

## Tier two: worth the time

### Full-disk encryption and a boot password

Usually on by default on phones and laptops, but worth confirming once. It protects against someone pulling the storage out of a lost or stolen device. It does not protect against being compelled to unlock it in front of someone, which is a separate problem covered in [cross-border travel and device searches](./asia-travel.md).

### Phone permissions and the advertising identifier

Turn off the advertising ID, contact-list upload, and precise location, then walk the permission list app by app. Concrete steps, and what each level still fails to block, are in [how social platforms collect your data](../basics/platform-tracking.md).

### Move everyday messaging to end-to-end encryption

Signal and comparable tools protect content, not the record of who contacted whom and when. Tool comparison is in [comparing anonymous messaging tools](../tools/messaging-comparison.md); why metadata often identifies you more precisely than content is in [why metadata matters](../basics/metadata.md).

### Backups

Ransomware, drive failure, a phone in a sink — backups are the only measure on this page that recovers anything after the fact. Keep at least two copies of anything important, with one of them not attached to the same device or the same account as the original.

### Take inventory of your accounts

Dormant accounts are a leak source, and you won't notice when one is compromised. List every account from the password manager and delete the ones you don't use; deletion beats a password change. Sequencing is covered under "retiring an identity" in [maintaining multiple online identities](../basics/multiple-identities.md).

## Tier three: only for specific situations

With tier two done, most of the everyday exposure surface is handled. The items below cost noticeably more and are worth it once you have a concrete reason.

- **Account layering**, keeping separate purposes on separate identities — see [maintaining multiple online identities](../basics/multiple-identities.md)
- **Separate devices** for sensitive work
- **Connection-layer anonymity** — see [Tor Browser, beyond the defaults](../tools/tor-browser-advanced.md). Tor protects where the connection appears to come from; the account you log into is still yours

## Overrated measures

These get treated as the main line of defense. They are useful, but for narrower purposes than the marketing suggests.

| Measure | What it actually does |
|---|---|
| VPN | Changes who can see your connection. The account you log into is still you. Selection criteria and the ownership problem are in [VPN risks and how to choose one](../tools/vpn-guide.md) |
| Private browsing mode | Clears local history. The platform, your ISP, and any service you log into still recognize you |
| Changing your phone number | Carriers recycle released numbers to the next customer, so unbind accounts from the old number first |
| Camera cover | Effective for the camera, but what most people worry about is the microphone. The evidence on that is in [how social platforms collect your data](../basics/platform-tracking.md) |
| Deleting an app | Data the platform already holds does not disappear. To actually reduce it, export your data to see what exists, then go through account deletion |

## When to raise your standard

The baseline above assumes no specific adversary. When one of the following becomes true, the threat model has changed and the corresponding page applies.

| Situation | Where to go |
|---|---|
| You start working on sensitive material, or someone offers you internal information | [journalists and source protection](./journalist.md) |
| You join organized action or attend protests | [activists and protest digital safety](./activist.md) |
| A partner or family member monitors your devices and location | [domestic violence and tech-enabled abuse](./domestic-violence.md) |
| You need to control the pace of disclosure, or use the internet under family monitoring | [LGBTQ+ and sexual minorities](./lgbtq.md) |
| You are traveling to a jurisdiction with border device searches | [cross-border travel and device searches in Asia](./asia-travel.md), [pre-departure briefing prompts](./travel-ai-briefing.md) |
| You plan to speak publicly under a real-name platform regime | [posting on mainland Chinese platforms](./mainland-speech.md), [speaking online from Singapore and Malaysia](./singapore-malaysia-speech.md) |
| An account is already compromised, a device is lost, or you are being stalked | [Access Now Digital Security Helpline](https://www.accessnow.org/help/){target="_blank"} — 24/7, multilingual |

## An annual pass

Not a redo. Just work through these questions once a year.

- Any reused passwords left in the manager? Most tools check this for you
- Any important accounts still on SMS that now support something stronger?
- Delete anything you haven't signed into in a year
- Review the phone permission list, especially for recently installed apps
- Can you actually restore from your backup? An untested backup is not a backup
- After a job change, a relationship change, or a move: do the assumptions above still hold?

## Local equivalents

The numbers cited here are Taiwanese because that is where this site is based. The categories transfer; the specific institutions do not. Wherever you are, it is worth knowing three things before you need them.

- **The national fraud reporting line and its published statistics.** Taiwan's is `165`, and its [public dashboard](https://165dashboard.tw/){target="_blank"} breaks down case counts and losses by fraud type, which is a fast way to see what is currently common. Most jurisdictions publish something comparable
- **Your data protection authority**, and whether it can actually act on a complaint
- **How fast your bank can freeze a transfer**, because with fraud the interval between the transfer and the report determines whether anything is recoverable

## Where to go from here

- [Threat modeling](../basics/threat-model.md) — what to protect, from whom, at what cost; the basis for the ordering on this page
- [How social platforms collect your data](../basics/platform-tracking.md) — the full version of the commercial-collection thread
- [Why metadata matters](../basics/metadata.md) — why encrypting content still leaves a great deal behind
- [Maintaining multiple online identities](../basics/multiple-identities.md) — account layering and retiring an identity
- [EFF Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"} — the canonical general-audience guide, available in 14 languages
- [Access Now Digital Security Helpline](https://www.accessnow.org/help/){target="_blank"} — 24/7 multilingual support when something has already gone wrong

[^165]: Figures from Taiwan's National Police Agency [165 anti-fraud dashboard](https://165dashboard.tw/){target="_blank"}: 162,000 cases and NT$89.326 billion in losses for calendar year 2025. Press summary: [Nationwide fraud losses approached NT$90 billion in 2025](https://news.ttv.com.tw/news/11501190003200W){target="_blank"} — TTV News, 19 January 2026. Verified 2026-08.

[^passkey-census]: Census of passkey support across the Tranco top 100K, based on a March 2025 snapshot: 11.3% overall, 20% among the top 100, 6.9% at ranks 50K–100K, and 75.2% of supporting sites implementing through an external identity provider. See [State of Passkey Authentication in the Wild: A Census of the Top 100K sites](https://arxiv.org/html/2602.15135v2){target="_blank"}. Verified 2026-08.
