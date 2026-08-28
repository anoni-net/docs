---
title: What surveillance can actually do
description: A layer-by-layer account of what platforms, telecoms, states, and commercial spyware can and cannot currently do, each claim dated and sourced, with "no evidence for" kept separate from "can do".
icon: material/cctv
---

# :material-cctv: What surveillance can actually do

Answers to "how far has surveillance actually gone" tend to swing between two extremes. Overstatement convinces people that nothing helps, understatement leaves them underprepared, and both lead to bad decisions.

Two numbers to start with. One advertising audience list in circulation contains 650,000 segments, one of which is labelled "I generally get a raw deal out of life"[^markup]. Taiwanese prosecutors and police applied for 16,663 communication-record retrieval orders in 2025, covering 147,422 phone lines[^rjsd]. The two are entirely different in kind, and they call for different defenses.

What follows covers four layers: platforms and data brokers, telecom carriers, states and law enforcement, and commercial spyware. For what to do about it, see [what an ordinary person should actually do](../scenarios/everyday-baseline.md).

## How to read this page

- **Capability is not the same as being used on you**: Cost per target differs by orders of magnitude across these four layers. Commercial collection is close to free, so it covers everyone; a commercial spyware licence runs to tens of thousands of dollars, so the target list is short.
- **Capability moves fast, institutions move slowly**: Retention periods and warrant thresholds are more stable than the technical picture, so weight them more heavily when judging long-term risk.
- **Absence of evidence is not evidence of absence**: Only claims with a public record appear here. Where nothing could be verified, the page says so.

Two adversaries fall outside this page. Fraud and account takeover cost ordinary people the most money in practice; see [what an ordinary person should actually do](../scenarios/everyday-baseline.md). An employer-issued device, or tracking software a partner or parent installs on your phone, costs a few dollars or is built in already, and sits far closer to most people than any state-level capability; see [domestic violence and tech-enabled abuse](../scenarios/domestic-violence.md).

The other groupings on this site line up with these layers. [Threat modeling](./threat-model.md) sorts adversaries into six tiers and [what an ordinary person should actually do](../scenarios/everyday-baseline.md) into three kinds. Layer one here corresponds to their "platform operators" and "commercial data collection", layers three and four to "national law enforcement" and "targeted investigation", and telecom is the shared infrastructure underneath the first two.

!!! warning "The legal layer does not transfer across jurisdictions"

    The warrant thresholds, retention periods, and facial-recognition status below use Taiwan as the worked example, because that is this site's primary context. They are illustrative, not universal — check your own jurisdiction. In mainland China, mandatory real-name registration, statutory data retention, and content moderation built into the platform layer drop that threshold sharply, and public speech alone can be enough to open a case; see [posting on mainland Chinese platforms](../scenarios/mainland-speech.md) and [speaking online from Singapore and Malaysia](../scenarios/singapore-malaysia-speech.md). Hong Kong has measured national-security sentences in years since the 2020 National Security Law and the 2024 Safeguarding National Security Ordinance, and since March 2026 refusing to surrender a device password during a national-security investigation is itself an offense, including for passengers merely transiting through the airport; see the Hong Kong section of [cross-border travel and device searches](../scenarios/asia-travel.md). The platform and spyware layers do transfer.

<figure markdown="span">
    <img src="https://assets.anoni.net/diagrams/surveillance-cost-reach.en.svg"
        alt="Four paired bars, left to right: platforms and ads, telecoms, state and law enforcement, and commercial spyware. The upward bar is how many people the layer reaches and gets shorter to the right. The downward bar is the cost of using it on one person and gets longer to the right. Platforms and ads cost almost nothing and reach everyone; a commercial spyware licence runs to tens of thousands of dollars and works from a short list.">
    <figcaption>Cost and reach run in opposite directions across the four layers</figcaption>
</figure>

The first point above, drawn out. The cheaper a layer is per target, the more people it covers, which makes it the layer you actually meet. The right-hand column has the strongest capability and, because of the price, the shortest list.

## Platforms, advertisers, and data brokers

The widest layer. Marginal cost per person is close to zero, so everyone is in it.

### What it can do

#### Infer attributes you never disclosed

In June 2023 The Markup obtained the audience-segment list of the ad exchange Xandr: 650,000 segments, supplied by data brokers including Oracle, Experian, and Acxiom — companies that run no website or app of their own and whose business is collecting and selling personal data — with Oracle alone accounting for 36% of them[^markup]. Most are mundane to the point of comedy: "Heavy Purchaser – Meat Pies – Refrigeration", "Indulgent Dog Owners", "Tattoo Addicts", "Past Purchases > Autos > Makes > Subaru", "Newly Engaged". Others are less funny: "Credit Crunched – City Families", "Tough Times" (the list's own gloss: older, lower income, ethnically diverse singles), "Neuroticism – Easily Deflated", "I generally get a raw deal out of life", and health segments broken down by medication and diagnosis. The input is behavioral records, not anything you filled in.

That particular list is a US-market artifact, and no comparable public list exists for most other countries. The same brokers operate elsewhere, but the scale and segment detail are not on the public record.

#### Join you together across apps and devices

Phone numbers and email addresses are the usual join keys, and contact-list uploads pull in people who never created an account. The mechanics are in [how platforms collect your data](./platform-tracking.md).

#### Know roughly where you are after you turn location off

IP addresses, previously joined Wi-Fi networks, and cell towers all yield an approximate position. Turning off GPS removes meter-level precision, and the position is still derivable.

### What there is no evidence for

Routine covert audio recording belongs here. An automated analysis of 17,260 Android apps found no evidence of covert audio exfiltration; what it did find was screen recording sent to third parties. Targeting gets its accuracy from the two capabilities above, behavioral records and cross-device joining, neither of which needs a microphone or trips any permission prompt. The full account, including the 2024 pitch-deck episode, is in [how platforms collect your data](./platform-tracking.md).

### Where the boundary sits

Inference is one thing, offering it to advertisers as a checkbox is another. Meta removed detailed targeting options for sensitive categories, including political affiliation, health causes, sexual orientation, and religion, in 2022[^meta]. What was restricted is the interface sold to advertisers. The inference inside the platform did not go away.

## Telecom carriers

Covers everyone with a phone number. The records are generated automatically, without anyone needing to take an interest in you.

### What it can do

#### Communication records

Content is not in them; nearly everything else is. One entry looks roughly like this: on a given day at 21:04, your number dialled another number, the call lasted 4 minutes 12 seconds, and the handset was attached to a particular cell tower. Tower precision depends on density, from a few hundred meters in a city to several kilometers in rural areas. Encryption of content does not affect this layer, because the record is generated on the network side.

#### How far back it reaches is set by statutory retention

Taiwan's rule is three months for local calls and six months for domestic long-distance, international, and mobile communications[^telecom]. In plain terms: going back six months, what time you leave home, where you go at weekends, and which week you suddenly started calling someone frequently are all reconstructable. Past that window the carrier must respond in writing that the records cannot be provided, so the retention period is the ceiling on any after-the-fact investigation. Periods vary widely by country, so check the rule where you live.

### What it cannot do

Carriers cannot read end-to-end encrypted content. To a carrier, a Signal message is ciphertext.

They also cannot read your messages inside a messaging app. What the carrier sees is that you connected to that service; the message content and the other party live on the platform side, and obtaining them means approaching a different holder. Telecom communication records, network connection logs, and platform-side message records are three different things held by three different parties.

## States and law enforcement

Bounded by legal process, which puts a ceiling on volume. Taiwan is the worked example below.

### Interception

Interception requires a judge-issued warrant, generally limited to offenses carrying a minimum sentence of three years or to an enumerated list. Authorization is time-limited, and the agency must report back to the court afterwards[^tsa]. Ordinary cases do not reach this bar.

### Retrieving communication records

A tier lower. A court-issued retrieval order is the default. The same statute, however, carves out an exception: offenses carrying a minimum sentence of ten years, plus an enumerated list that includes robbery, snatching, fraud, extortion, kidnapping for ransom, narcotics, and money laundering. For those, a prosecutor or an authorized judicial police officer may retrieve records without going to a court[^tsa]. Fraud sits inside that exception, and it is the case type an ordinary person is most likely to touch.

### Actual scale

Taiwan's Ministry of Justice reports 16,663 retrieval-order applications in 2025, covering 147,422 phone lines[^rjsd]. Against a population of 23 million that is a small proportion, and still far from rare enough to ignore. Year-by-year figures are at the [Ministry of Justice statistics site](https://www.rjsd.moj.gov.tw/rjsdweb/){target="_blank"}, and interception figures at the Judicial Yuan's [communication-surveillance statistics](https://www.judicial.gov.tw/tw/lp-1759-1.html){target="_blank"}.

### Buying from the commercial layer

Warrant thresholds govern requests to carriers and platforms. The data brokers in layer one sell on an open market, outside that process entirely. This route is routinely left out of discussions about the scale of surveillance.

### Facial recognition

Taiwan's National Police Agency ran a live facial-matching function in its M-Police system, drawing on household-registration photographs. In December 2021 the function was suspended over questions of authority and legal basis, with the agency stating at the time that it would resume once the legal framework was completed[^mpolice]. No public announcement of resumption was found at the time of verification; treat the agency's own notices as authoritative. What was suspended is live matching against household-registration photographs. Street camera networks operate under separate legal bases and are outside this section.

### What there is no evidence for

No public record indicates blanket real-time content interception in Taiwan. Two institutional limits are real: interception is authorized case by case and reported back to the court, and communication records past the retention window simply cannot be produced.

### Other jurisdictions

Mainland China and Hong Kong differ enough that none of the above transfers. See the warning box near the top of this page.

## Commercial spyware

Highest cost, fewest targets, and the highest capability ceiling of the four.

### What it can do

Zero-click exploits compromise a device without you tapping anything. Once a device is compromised, end-to-end encryption stops protecting anything, because the implant reads content that has already been decrypted on the device: the message is read at the same moment you can read it.

In July 2026 Amnesty International published a full analysis of Pegasus's architecture, drawing on internal marketing and technical documents disclosed in WhatsApp's litigation against NSO Group[^amnesty]. In the same month, Citizen Lab reported that the iPhone of a former Member of the European Parliament had been infected with Pegasus at least three times across 2022 and 2023[^citizenlab].

### Why most people are not on the list

Licenses are expensive and operating the tooling takes staff, so buyers choose targets. Publicly documented cases number in the thousands, against billions of handsets, which puts the odds for any given person extremely low. Those cases cluster among journalists, human rights workers, lawyers, politicians, and the people around them.

### Common misconceptions

- **Turning it off and on fixes it**: Most infection chains do not persist, so a reboot clears that particular implant. What it clears is only that one instance; the same chain can reinfect immediately, so rebooting is not a defence.
- **A new phone means a clean slate**: Replacing the handset deals with the implant already on it, not with being targeted again.
- **Antivirus software will catch it**: Consumer antivirus does nothing at this layer.

### The one thing an ordinary person can do

Lockdown Mode on iPhone and Advanced Protection on Android switch off a batch of commonly exploited features, at the cost of some functionality. Apple's own guidance is explicit: most people do not need it, and it exists for people who may be targeted by state-level or mercenary spyware, such as journalists, activists, and government officials[^lockdown]. To decide whether that includes you, start from [threat modeling](./threat-model.md).

## How would I know if I were targeted

Each layer has one action you can take yourself.

- **Platform layer**: Open Google's My Ad Center and Meta's ad preferences to see the topics the system thinks you care about, then use data export for the full record. The steps are in [how platforms collect your data](./platform-tracking.md). Nothing else on this site shows you your own profile as directly.
- **Telecom layer**: Request your own call detail records from your carrier; the scope is broadly what a retrieval order would produce.
- **State and law enforcement layer**: Under Article 15 of Taiwan's Communication Security and Surveillance Act, the executing agency must report after surveillance ends and the court notifies the person who was surveilled. Notification can be deferred where it would defeat the purpose, but the grounds must be reassessed every three months and notice must still follow once they lapse[^tsa15]. Lawful interception, in other words, has a built-in path to being told afterwards. Whether an equivalent exists where you live is worth checking.
- **Device layer**: Review the active-session list on each service and turn on unknown-tracker alerts for AirTags and on Android. If you suspect commercial spyware, [Citizen Lab](https://citizenlab.ca/){target="_blank"} and the [Access Now Digital Security Helpline](https://www.accessnow.org/help/){target="_blank"} both provide forensic help. Amnesty's open-source [Mobile Verification Toolkit](https://github.com/mvt-project/mvt){target="_blank"} (MVT) checks a phone backup against known traces of compromise, and takes some technical background to run.

## Which measure stops which layer

Read it this way. The two left-hand columns are the ones you are most likely to face, and the first four rows are largely effective there. The rightmost column costs too much to be aimed at most people; treat it as the ceiling on capability rather than as your expected risk.

The table covers communication and account measures only. Facial recognition and physical camera networks are not on it, and the equivalent for fraud and account takeover is in [what an ordinary person should actually do](../scenarios/everyday-baseline.md).

| Measure | Platforms & ads | Telecom | State & law enforcement | Commercial spyware |
|---|---|---|---|---|
| End-to-end encryption | Message content protected; behavioral signals and linkage still collected | Content protected, records still generated | Content protected, records still obtainable | No protection, decrypted on device |
| VPN | Substitutes the source IP the platform sees; the account is still you | Your carrier sees only that you connect to a VPN; call records and cell-site data are unaffected | No help against account-level requests | No protection |
| Tor | Breaks source-IP correlation; once you log in it is still you | Carrier sees only that you use Tor | No help against account-level requests | No protection |
| Ad ID and permissions off | Reduces cross-app linkage | Not applicable | Not applicable | Not applicable |
| Account layering | Cuts some linkage | Not applicable | Raises the cost of correlation | No protection |
| Staying updated | Not applicable | Not applicable | Not applicable | Raises cost; no help against zero-days |

The layer you defend has to match the layer you actually face. The framework for deciding that is in [threat modeling](./threat-model.md).

## This page will age

Both capability and law keep moving, and the facial-recognition legislative track and individual spyware cases change fastest. Everything here reflects the state at the time of verification, and every claim carries a date. If something no longer matches reality, please report it in the [community Matrix room](../community/index.md).

## Where to go from here

- [What an ordinary person should actually do](../scenarios/everyday-baseline.md) — the corresponding measures, ordered by how much each one blocks
- [How platforms collect your data](./platform-tracking.md) — the full mechanics of the first layer
- [Threat modeling](./threat-model.md) — turning these capability limits into your own judgment
- [Why metadata matters](./metadata.md) — why communication records are often worth more than content
- [Networks mistaken for anonymity](../advanced/mistaken-for-anonymity.md) — changing tools does not by itself reduce the number of observers
- [VPN risks and how to choose one](../tools/vpn-guide.md) — what the VPN row in the table above does and does not buy you

[^markup]: [From "Heavy Purchasers" of Pregnancy Tests to the Depression-Prone: We Found 650,000 Ways Advertisers Label You](https://themarkup.org/privacy/2023/06/08/from-heavy-purchasers-of-pregnancy-tests-to-the-depression-prone-we-found-650000-ways-advertisers-label-you){target="_blank"} — The Markup, 8 June 2023. The reporting is based on the audience-segment list of the ad exchange Xandr, drawn from close to a hundred data suppliers. Segment names are quoted as they appear in that list. Verified 2026-08.

[^rjsd]: [Ministry of Justice statistics](https://www.rjsd.moj.gov.tw/rjsdweb/common/WebList3_Report.aspx?list_id=1355){target="_blank"} (Taiwan): 16,663 retrieval-order applications in 2025, covering 147,422 phone lines. The same page allows switching between 2021 and 2025. Verified 2026-08.

[^meta]: Meta announced in January 2022 that, effective 19 January that year, it would remove detailed targeting options relating to health, race, political affiliation, religion, and sexual orientation. Verified 2026-08.

[^telecom]: Taiwan's [Regulations on Telecom Enterprises Handling Agency Inquiries into Communication Records](https://law.moj.gov.tw/LawClass/LawAll.aspx?PCODE=K0060030){target="_blank"}, Article 5, as amended 15 June 2017: three months for local, six months for domestic long-distance, international, and mobile. Verified 2026-08.

[^tsa]: Taiwan's [Communication Security and Surveillance Act](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=K0060044){target="_blank"}. The interception threshold is Article 5. Retrieval of communication records is Article 11-1, paragraphs 2 and 3, and the exception permitting retrieval without a court order is paragraph 4. Verified 2026-08.

[^tsa15]: [Article 15 of Taiwan's Communication Security and Surveillance Act](https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=K0060044&flno=15){target="_blank"}. The executing agency must report after surveillance ends and the court notifies the person surveilled; deferral requires stated grounds, reassessment every three months, and notice once the grounds lapse. Verified 2026-08.

[^mpolice]: [Police agency takes M-Police facial matching offline pending regulatory work](https://news.ltn.com.tw/news/society/breakingnews/3780906){target="_blank"} — Liberty Times, December 2021 (in Chinese). For the human rights analysis, see [Privacy issues in public-sector use of facial recognition and CCTV](https://www.tahr.org.tw/news/3111){target="_blank"} — Taiwan Association for Human Rights. Verified 2026-08; no public announcement of resumption found.

[^amnesty]: [Inside Pegasus: The evolution of the world's most notorious spyware system](https://securitylab.amnesty.org/latest/2026/07/inside-pegasus-the-evolution-of-the-worlds-most-notorious-spyware/){target="_blank"} — Amnesty International Security Lab. Architecture analysis published 16 July 2026 from internal documents disclosed in WhatsApp's litigation against NSO Group. Verified 2026-08.

[^citizenlab]: [Espionage Against the European Parliament: Member of Committee Investigating Spyware Hacked with Pegasus](https://citizenlab.ca/research/member-of-committee-investigating-spyware-hacked-with-pegasus/){target="_blank"}, 3 July 2026, reporting that former MEP Stelios Kouloglou's iPhone was infected with Pegasus at least three times across 2022 and 2023. Verified 2026-08.

[^lockdown]: [About Lockdown Mode](https://support.apple.com/en-us/105120){target="_blank"} — Apple Support. Apple describes it as an extreme, optional protection that most people will never need, intended for individuals who may be personally targeted by state-level or mercenary spyware. The Android counterpart is Advanced Protection. Verified 2026-08.
