---
title: What surveillance can actually do
description: A layer-by-layer account of what platforms, telecoms, states, and commercial spyware can and cannot currently do, each claim dated and sourced, with "no evidence for" kept separate from "can do".
icon: material/cctv
---

# :material-cctv: What surveillance can actually do

Answers to "how far has surveillance actually gone" tend to swing between two extremes. Overstatement convinces people that nothing helps; understatement leaves them underprepared. Both lead to bad decisions.

What follows is a layer-by-layer account of where each adversary's capability ends, with a source and a verification date on every claim, and with "can do" kept separate from "no public evidence for". For what to do about it, see [what an ordinary person should actually do](../scenarios/everyday-baseline.md).

## How to read this page

Three things first.

- **Capability is not the same as being used on you.** Cost per target differs by orders of magnitude across these four layers. Commercial collection is close to free, so it covers everyone; a commercial spyware licence runs to tens of thousands of dollars, so the target list is short.
- **Capability moves fast, institutions move slowly.** Retention periods and warrant thresholds are more stable than the technical picture, so weight them more heavily when judging long-term risk.
- **Absence of evidence is not evidence of absence.** Only what has a public record is written down here; where nothing could be verified, that is stated.

!!! warning "The legal layer does not transfer across jurisdictions"

    The warrant thresholds, retention periods, and facial-recognition status below use Taiwan as the worked example, because that is this site's primary context. They are illustrative, not universal — check your own jurisdiction. Where real-name registration, statutory retention, and platform-level content moderation are in place, the third layer's threshold drops sharply and public speech alone can trigger it; see [posting on mainland Chinese platforms](../scenarios/mainland-speech.md) and [speaking online from Singapore and Malaysia](../scenarios/singapore-malaysia-speech.md). The platform and spyware layers do transfer.

## Platforms and advertisers

The widest layer. Everyone is in it.

### What it can do

**Infer attributes you never disclosed.** In June 2023 The Markup analysed a database of 650,000 advertising audience segments and found segments covering reproductive health, including heavy purchasers of pregnancy tests and groups tied to contraception and infertility[^markup]. The input is behavioral records, not anything you filled in.

**Join you together across apps and devices.** Phone numbers and email addresses are the usual join keys, and contact-list uploads pull in people who never created an account. The mechanics are in [how platforms collect your data](./platform-tracking.md).

**Know roughly where you are after you turn location off.** IP address, previously joined Wi-Fi networks, and cell towers all yield an approximate position. Turning off GPS removes metre-level precision, not location itself.

### What there is no evidence for

**Routine covert audio recording.** An automated analysis of 17,260 Android apps found no evidence of covert audio exfiltration; what it did find was screen recording sent to third parties. The full account, including the 2024 pitch-deck episode, is in [how platforms collect your data](./platform-tracking.md).

### Where the boundary sits

Inference is one thing; offering it to advertisers as a checkbox is another. Meta removed detailed targeting options for sensitive categories, including political affiliation, health causes, sexual orientation, and religion, in 2022. What was restricted is the interface sold to advertisers. The inference inside the platform did not go away.

## Telecom operators

### What it can do

**Communication records.** Who contacted whom and when, call duration, and which cell tower the device was attached to. Encryption of content does not affect this layer, because the record is generated on the network side.

**How far back it reaches is set by statutory retention.** Taiwan's rule is three months for local calls and six months for domestic long-distance, international, and mobile communications[^telecom]. Past that window, the carrier must respond in writing that the records cannot be provided. The number is practical: it is the ceiling on any after-the-fact investigation. Retention periods vary widely by country, so check your own.

### What it cannot do

Read end-to-end encrypted content. To a carrier, a Signal message is ciphertext. Note the scope: content is protected, the communication record above is generated regardless.

## States and law enforcement: Taiwan as the worked example

### Interception

Requires a judge-issued warrant, generally limited to offenses carrying a minimum sentence of three years or to an enumerated list, with time limits and a duty to report back to the court[^tsa]. Ordinary cases do not reach this bar.

### Retrieving communication records

A tier lower. A court-issued retrieval order is the default, but the same statute carves out offenses carrying a minimum sentence of three years along with an enumerated list including robbery, fraud, extortion, kidnapping for ransom, narcotics, and money laundering, for which a prosecutor or an authorized judicial police officer may retrieve records directly[^tsa]. Fraud sits inside that exception, and fraud is the case type an ordinary person is most likely to touch.

### Actual scale

Taiwan's Judicial Yuan publishes [annual communication-surveillance statistics](https://www.judicial.gov.tw/tw/lp-1759-1.html){target="_blank"}, year by year. For scale rather than doctrine, reading those figures beats any summary of them.

### Facial recognition

Taiwan's National Police Agency ran a live facial-matching function in its M-Police system, drawing on household-registration photographs. In December 2021 the function was suspended over questions of authority and legal basis, with the agency stating at the time that it would resume once the legal framework was completed[^mpolice]. No public announcement of resumption was found at the time of verification; treat the agency's own notices as authoritative.

## Commercial spyware

Highest cost, fewest targets, and the highest capability ceiling of the four.

### What it can do

**Compromise a device without you tapping anything.** Zero-click exploits remove the need for victim interaction. Once installed, the implant reads content that has already been decrypted on the device, so end-to-end encryption offers no protection at this layer: the message is read at the same moment you can read it.

In July 2026 Amnesty International published a full analysis of Pegasus's architecture, drawing on internal marketing and technical documents disclosed in WhatsApp's litigation against NSO Group[^amnesty]. In the same month, Citizen Lab reported that a former Member of the European Parliament's iPhone had been infected with Pegasus at least three times across 2022 and 2023[^citizenlab].

### Why most people are not on the list

Licences are expensive and operating the tooling takes staff, so operators choose targets. Publicly documented cases cluster among journalists, human rights workers, lawyers, politicians, and the people around them.

### Can it be detected

Yes, with the right tools and knowledge. Amnesty maintains the open-source Mobile Verification Toolkit (MVT), which checks iOS backups or Android forensic images against known indicators of compromise. If you suspect an implant, [Citizen Lab](https://citizenlab.ca/){target="_blank"} and the [Access Now Digital Security Helpline](https://www.accessnow.org/help/){target="_blank"} provide forensic help. Most Pegasus infection chains lack persistence, so a reboot clears that particular implant, though it does not prevent reinfection.

## Which measure stops which layer

| Measure | Platforms & ads | Telecom | Legal process | Commercial spyware |
|---|---|---|---|---|
| End-to-end encryption | Content protected | Content protected, records still generated | Content protected, records still obtainable | No protection, decrypted on device |
| VPN | Hides the connection from your ISP; the account is still you | Substitutes part of the connection record | No help against account-level requests | No protection |
| Tor | Breaks source-IP correlation | Carrier sees only that you use Tor | No help against account-level requests | No protection |
| Ad ID and permissions off | Reduces cross-app linkage | Not applicable | Not applicable | Not applicable |
| Account layering | Cuts some linkage | Not applicable | Raises the cost of correlation | No protection |
| Staying updated | Not applicable | Not applicable | Not applicable | Raises cost; no help against zero-days |

How to read the table: nothing works across every column, and the rightmost column is almost entirely "no protection". That does not make the other columns pointless. It means the layer you defend has to match the layer you actually face. The framework for deciding that is in [threat modeling](./threat-model.md).

## This page will age

Both capability and law keep moving, and the facial-recognition legislative track and individual spyware cases move fastest. Everything here reflects the state at the time of verification, and every claim carries a date. If something no longer matches reality, please report it in the [community Matrix room](../community/index.md).

## Where to go from here

- [What an ordinary person should actually do](../scenarios/everyday-baseline.md) — the corresponding measures, ordered by how much each one blocks
- [How platforms collect your data](./platform-tracking.md) — the full mechanics of the first layer
- [Threat modeling](./threat-model.md) — turning these capability limits into your own judgement
- [Why metadata matters](./metadata.md) — why communication records are often worth more than content

[^markup]: [From "Heavy Purchasers" of Pregnancy Tests to the Depression-Prone: We Found 650,000 Ways Advertisers Label You](https://themarkup.org/privacy/2023/06/08/from-heavy-purchasers-of-pregnancy-tests-to-the-depression-prone-we-found-650000-ways-advertisers-label-you){target="_blank"} — The Markup, 8 June 2023. Verified 2026-08.

[^telecom]: Taiwan's [Regulations on Telecom Enterprises Handling Agency Inquiries into Communication Records](https://law.moj.gov.tw/LawClass/LawAll.aspx?PCODE=K0060030){target="_blank"}, Article 5, as amended 15 June 2017: three months for local, six months for domestic long-distance, international, and mobile. Verified 2026-08.

[^tsa]: Taiwan's [Communication Security and Surveillance Act](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=K0060044){target="_blank"}. The interception threshold is Article 5; retrieval of communication records and its exceptions are Article 11-1. Verified 2026-08.

[^mpolice]: [Police agency takes M-Police facial matching offline pending regulatory work](https://news.ltn.com.tw/news/society/breakingnews/3780906){target="_blank"} — Liberty Times, December 2021 (in Chinese). For the human rights analysis, see [Privacy issues in public-sector use of facial recognition and CCTV](https://www.tahr.org.tw/news/3111){target="_blank"} — Taiwan Association for Human Rights. Verified 2026-08; no public announcement of resumption found.

[^amnesty]: [The Pegasus Project](https://securitylab.amnesty.org/case-study-the-pegasus-project/){target="_blank"} — Amnesty International Security Lab. Architecture analysis published 16 July 2026 from internal documents disclosed in WhatsApp's litigation against NSO Group. Verified 2026-08.

[^citizenlab]: [Citizen Lab](https://citizenlab.ca/){target="_blank"}, 3 July 2026, reporting that former MEP Stelios Kouloglou's iPhone was infected with Pegasus at least three times across 2022 and 2023. Verified 2026-08.
