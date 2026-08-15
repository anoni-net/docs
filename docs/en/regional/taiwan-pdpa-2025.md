---
title: Taiwan's 2025 Data Protection Overhaul
description: The 2025 amendments to Taiwan's Personal Data Protection Act — an independent supervisory authority, heavier penalties, tighter cross-border transfer rules, and breach notification, plus what has and has not taken effect.
icon: material/scale-balance
---

# :material-scale-balance: Taiwan's 2025 Data Protection Overhaul

The privacy policy checkbox you click on every website rests, in Taiwan, on the Personal Data Protection Act (PDPA). A significant round of amendments passed in 2025: heavier penalties continuing a trend of recent years, tighter cross-border transfer rules, mandatory breach notification, and a dedicated independent supervisory authority.

The gap between passage and effect is the part most summaries get wrong. The amendments were passed and promulgated in 2025, but the Executive Yuan has not yet designated a commencement date, and the Personal Data Protection Commission that will enforce them has not formally been established. The direction is settled. Most of the new obligations start running only once the Commission exists and the Executive Yuan sets the date.

This page is a long-term reference on what changed, and a tracker for the secondary legislation and the Commission's establishment. It is not legal advice. For the operative text and its scope, the authority is the competent agency: the Commission's preparatory office during the transition, and the Commission itself once established.

!!! info "Why an international reader might care"

    Taiwan is a useful reference point for the Sinophone Asia-Pacific because it is running the region's most GDPR-shaped reform in a democratic setting, in public, with the legislative timeline visible. Comparable jurisdictions arrived at data governance from different starting points: Mainland China's Personal Information Protection Law pairs individual protections with broad carve-outs for state organs, Hong Kong's Personal Data (Privacy) Ordinance dates from 1995 and was amended in 2021 to add doxxing offences and enforcement powers for the Privacy Commissioner, Singapore's Personal Data Protection Act governs the private sector while public agencies including the Singpass operator sit outside it, and Malaysia's 2024 amendments to its Personal Data Protection Act commenced in phases through 2025. Watching which GDPR mechanisms Taiwan adopts, and which it declines, shows what travels across legal traditions and what does not.

## Background to the amendments

Before this round, competent authority under the PDPA was split by sector: the Financial Supervisory Commission (FSC) for finance, the Ministry of Health and Welfare for healthcare, and so on. No single body produced consistent interpretation or penalties.

Two pressures converged. Externally, after the EU's General Data Protection Regulation (GDPR) took effect in 2018, whether Taiwan could obtain an adequacy decision (the European Commission's finding that a jurisdiction's protection is sufficient for personal data to flow there freely) became the practical question for cross-border data. Institutional lag turned into a commercial obstacle. Internally, the Constitutional Court's 2022 judgment in the National Health Insurance Database case required an independent supervisory mechanism.

What the amendments respond to:

- **An independent supervisory authority**: consolidating the scattered sectoral powers into one commission
- **International alignment**: moving toward GDPR on cross-border safeguards and on penalties with real deterrent weight
- **Individual remedies**: a clear breach notification duty and a simpler path to compensation

## Where the Commission stands

The Personal Data Protection Commission is designed as an independent agency under the Executive Yuan. Establishment runs in two stages and is still in the transition. Anyone researching this should notice that the body currently operating at `pdpc.gov.tw` is the **preparatory office**. The Commission itself waits on its organic act.

### Preparatory office (2023 to present)

The Constitutional Court's 2022 judgment (`111-Hsien-Pan-13`, the National Health Insurance Database case) required an independent data-protection supervisory mechanism within three years. The Executive Yuan set up the Personal Data Protection Commission Preparatory Office, inaugurated on 5 December 2023 as a third-level central agency, currently staffed at 36 with a planned expansion to 89. Its work covers drafting the organic act, planning the next round of PDPA amendments, and holding the relevant functions until the Commission proper exists.

### The Commission itself (not yet established)

The Constitutional Court's judgment implied establishment by 11 August 2025. It is held up in the legislature. The sequence:

- **27 March 2025**: the Executive Yuan approved the draft Organic Act of the Personal Data Protection Commission and draft amendments to the PDPA, and sent both to the Legislative Yuan
- **28 May 2025**: joint review of the organic act drafts (the Executive Yuan version and several legislators' versions) by the Judiciary and Organic Laws Committee and the Economics Committee
- **17 October 2025**: the PDPA amendments passed their third reading
- **11 November 2025**: the President promulgated the amendments
- The organic act cleared preliminary committee review and has not passed its third reading
- **11 February 2026**: the preparatory office pre-announced draft rules on inspecting non-government agencies' PDPA compliance, with the issuing authority listed as "the Personal Data Protection Commission (to be issued once established)"

The amended PDPA is promulgated but not in force. The Executive Yuan sets the commencement date separately, based on the organic act's progress and administrative readiness. Until then the pre-amendment provisions apply and competent authority remains with the sectoral ministries.

### What the Commission will do

- **Policy**: developing data protection policy and legislative amendments
- **Supervision and penalties**: investigating and penalizing violations
- **Guidance**: issuing administrative guidance and sector codes
- **Cross-border coordination**: acting as counterpart to foreign data protection authorities
- **Individual remedies**: receiving complaints

Powers currently spread across the FSC, the Ministry of Health and Welfare, the Ministry of Digital Affairs, and others transfer progressively once the Commission is established, on a schedule the Commission announces per subject area. Most of the obligations and rights described below start at that point.

## Cross-border transfers

**Status: new obligation, effective only after the Commission is established and the Executive Yuan designates the commencement date.** Organizations can align contracts and technical design ahead of time. Individuals cannot invoke the corresponding remedies until then.

The conditions become more explicit:

- Cross-border transfer requires the destination to be on an adequacy list published by the Commission, or to meet a specific exception (data subject consent, contractual necessity, public interest)
- For destinations not on the list, supplementary safeguards apply (standard contractual clauses, binding corporate rules), with the requirements to be issued by the Commission
- The Commission may order transfers to a particular jurisdiction suspended or restricted

For Taiwanese organizations on overseas cloud services (AWS, Google Cloud, Microsoft Azure), this reaches into contract terms and technical design: where data is stored, where encryption keys live.

## Penalties

The ceiling on administrative fines rises substantially:

- Before the 2023 amendments, most PDPA administrative fines capped at NT$500,000, widely criticized as no deterrent to a large company
- Successive amendments have raised penalties (2023 already lifted several caps), and the 2025 round continues in that direction. Whether turnover-proportionate calculation is adopted depends on the operative text and the Commission's interpretive rulings
- Failure to notify a breach as required, and processing beyond the purpose of collection, carry their own penalties

Specific amounts and calculation methods follow the operative text and the Commission's rulings.

## Breach notification

**Status: new obligation, effective only after establishment and the designated commencement date.** Organizations can build detection and notification procedures ahead of time rather than scrambling when the law starts running.

Two layers of duty become explicit:

- **Notify the Commission**: a data controller must notify within a prescribed period after discovering a breach. The parent act delegates the specific deadline to secondary legislation, and the draft is structured close to GDPR's 72 hours. The final text is pending
- **Notify data subjects**: where a breach is likely to pose serious risk to the individuals concerned

For organizations this means an internal standard operating procedure for detection, assessment, and notification. For individuals it means treating such a notice as real and acting on it: change the password, turn on two-factor authentication, check for unfamiliar sessions.

## What changes for individuals

- **Clearer rights of access, correction, and deletion**: controllers must respond within a set period, and missing it can be complained to the Commission
- **Stricter consent**: bundled consent (where declining means losing the service) is constrained, and collection purposes must be specifically enumerated
- **Data portability**: individuals may request their data in a structured, machine-readable format, following GDPR's direction
- **Collective redress**: group remedies through consumer protection organizations become easier to initiate

The threshold for exercising each right in practice depends on the implementing rules the Commission issues.

## What changes for organizations

### Process

- Collection notices must be more specific: purpose, retention period, cross-border handling, and how to exercise rights
- An internal personal data management system, with audit, becomes the de facto minimum
- Outsourced processing requires a data processing agreement setting out the processor's obligations

### Technical

- Data minimization gains a clearer legal basis
- Encryption, pseudonymization, and de-identification become evidence of "appropriate protective measures"
- Logging and audit trail retention requirements tighten

### Roles

- Large organizations are advised to appoint a Data Protection Officer (DPO)
- Cross-departmental data governance committees

## Compared with GDPR

The amended PDPA moves visibly toward GDPR while keeping differences:

| Dimension | GDPR | Amended Taiwan PDPA |
|---|---|---|
| Supervisory authority | Member state data protection authorities (DPAs) | Personal Data Protection Commission |
| Cross-border transfer | Adequacy decisions, standard contractual clauses, binding corporate rules | Commission-published adequacy list, plus supplementary safeguards |
| Maximum fine | 4% of global annual turnover or €20 million, whichever is higher | Fixed ceiling, per the operative text and rulings |
| Breach notification | 72 hours to the supervisory authority | Within a prescribed period to the Commission |
| DPO | Mandatory in specified circumstances | Advisory, potentially mandatory in specific sectors |
| Scope | Extraterritorial reach | Natural and legal persons processing personal data in Taiwan |

The comparison exists so organizations with cross-border operations can map their compliance work across. Resembling GDPR more closely is not itself the goal.

## Still to come

A substantial part of the regime depends on secondary legislation, implementing rules, and Commission interpretations:

- The adequacy list
- Specific breach notification deadlines and content
- Fine calculation formulas
- Sector-specific guidance (healthcare, finance, e-commerce, education)
- The Commission's internal structure and dispute review procedures

These are being issued progressively. The preparatory office's announcements and interpretive rulings sections are worth checking periodically, at the same address the Commission will keep.

## Why an anonymity community tracks data protection law

Promoting Tor, Tails, and OONI can look like the opposite of a data protection regime: one avoids identification, the other regulates it. They are two sides of the same question.

- What data protection law protects is data that can be linked to an identifiable person. What anonymity tools aim for is behaviour that cannot be linked to one
- Pseudonymization and de-identification are protective measures the law explicitly accepts, and they rest on the same technical ground as anonymity tools
- For an individual, data protection law provides a route to assert rights against an organization. Anonymity tools provide the option of not generating the data those rights would be about

Which one fits depends on the situation, and knowing both is what makes the choice available.

## Sources

- [Personal Data Protection Commission Preparatory Office](https://www.pdpc.gov.tw/){target="_blank"} (in Chinese; the Commission keeps this address once established)
- [Personal Data Protection Act, Laws and Regulations Database of the Republic of China (Taiwan)](https://law.moj.gov.tw/ENG/LawClass/LawAll.aspx?pcode=I0050021){target="_blank"} (English translation of the pre-amendment text)
- [Constitutional Court judgment 111-Hsien-Pan-13, the National Health Insurance Database case](https://cons.judicial.gov.tw/){target="_blank"} (in Chinese)
- [European Commission: adequacy decisions](https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/adequacy-decisions_en){target="_blank"}

The Chinese-language version of this page is at [台灣個資法 2025 修法](https://anoni.net/docs/taiwan/pdpa-2025/){target="_blank"}.

If you have the Commission's latest secondary legislation or rulings, the channels on the [Community services](../community/tools.md) page reach us and we will update this page.

## Related

- [Taiwan's 2026 VASP Act](./taiwan-vasp-2026.md) covers the parallel shift in financial regulation, where identity verification requirements bite hardest.
- [Regional Observatory](./index.md) sets this alongside the other jurisdictions we track.
