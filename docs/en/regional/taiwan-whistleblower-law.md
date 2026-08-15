---
title: Taiwan's Whistleblower Protection Act, from a Technical Angle
description: What Taiwan's Public Interest Whistleblower Protection Act covers, the digital traces a disclosure leaves behind, and where anonymous channels fit into a system that requires you to give your name.
icon: material/account-voice
---

# :material-account-voice: Taiwan's Whistleblower Protection Act, from a Technical Angle

Whistleblower protection is a question of institutions, and every act of whistleblowing leaves digital traces: message logs, file downloads, login times, office network records. What the law protects is the whistleblower's position after being identified, against dismissal, demotion, and litigation. What anonymity tools address is not being identified during the act itself. The two cover different ground, and neither is complete alone.

This page starts from Taiwan's Public Interest Whistleblower Protection Act (PIWPA), in force since July 2025, covering who and what it protects, where technical anonymous channels fill the gaps, and how a whistleblower can prepare in practice.

This is not legal advice. For the operative provisions and their scope, the authority is the Ministry of Justice.

!!! info "Why an international reader might care"

    Taiwan passed its first dedicated whistleblower statute at the end of 2024 and brought it into force in July 2025, well after the EU's Directive 2019/1937 and the UK's Public Interest Disclosure Act. It covers the public sector, state-owned and government-controlled entities, and government contractors, leaving employees of purely private companies outside its protection. Reading which parts Taiwan adopted and which it left out shows what a late-arriving democracy considers politically achievable, and the gap it leaves is precisely where technical anonymity has to carry the weight. That pattern repeats across the region, in jurisdictions with far less legal protection than Taiwan's.

## The seam between institutions and technology

A whistleblower faces two different risks: the legal consequences of being identified (dismissal, demotion, litigation, criminal liability), and the digital traces that lead to identification (who touched which file on which machine, who contacted whom and when). The first is addressed after the fact through legal remedy. The second has to be handled at the time, and it is what this page focuses on.

A typical situation: a public sector employee finds their superior has misappropriated grant funds and wants to disclose it. Even with a legal guarantee of confidentiality and protection from dismissal, if they download the evidence on the office network, send it from a work email account, and photograph the screen on a personal phone in the office to send over Telegram, the traces can identify them internally before they ever enter the legal protection process.

This page sits alongside [Protecting your sources as a journalist](../scenarios/journalist.md) rather than duplicating it. That page covers the receiving end, the tools and workflow a journalist uses. This one covers the whistleblower's own legal position and preparation.

## From draft to force

Taiwan's whistleblower protection was long scattered across separate statutes: the duty of obedience in the Civil Service Act read in reverse, witness protection under the Code of Criminal Procedure, sentence reduction under the Anti-Corruption Act, and the tainted witness provisions of the Organized Crime Prevention Act. There was no integrated framework. Transparency International has repeatedly treated a dedicated whistleblower statute as a key integrity indicator, and Taiwan was repeatedly named on it.

The timeline:

- **2019**: the Executive Yuan approved a draft and sent it to the Legislative Yuan, where it lapsed at the end of the session
- **27 December 2024**: the Legislative Yuan passed the Public Interest Whistleblower Protection Act on third reading[^1]
- **22 July 2025**: entry into force, six months after promulgation
- **July 2025**: the Ministry of Justice published draft enforcement rules

This is Taiwan's **first statute dedicated to protecting whistleblowers**. The competent authority is the Ministry of Justice, with a Whistleblower Protection Committee handling protection matters.

## What the law protects

### Who is covered

PIWPA applies to the **broader public sector**:

- Public sector employees, meaning civil servants in central and local agencies
- Employees of state-owned enterprises
- Enterprises, organizations, and institutions under government control

**Employees of purely private companies are not covered**, though the boundary is less clean than the summaries suggest. The Act reaches contractors and their employees engaged by government agencies, and people providing paid services to state-owned and government-controlled entities, with the second category limited to a narrower list of reportable wrongdoing. Extending it to the private sector proper was debated, including an amendment that would have covered private companies while exempting small and medium enterprises capitalized under NT$100 million. It did not pass. That gap is the largest in the regime, discussed separately below.

### What can be disclosed

Protection covers disclosures of serious unlawful conduct: corruption, malfeasance, serious financial or budgetary illegality, serious waste of public funds, and other criminal conduct in the course of duties. The whistleblower must act in **good faith**, meaning an honest belief that the content is true. Fabrication or reporting known falsehoods falls outside protection.

### Channels, in tiers

PIWPA works through an escalating structure, internal first, then external, then the media:

1. **First tier, internal reporting**: to the employing agency or the agency designated to receive disclosures
2. **Second tier, external reporting**: where the receiving agency **fails to indicate within 20 days whether it accepts the case**, or **fails to notify the outcome of an investigation within 6 months**, the whistleblower may, after an appropriate prompting procedure, disclose under their own name to elected representatives, the media, and civil society organizations

The design reflects the legislature's reservations about going straight outside. In practice, a whistleblower has to complete the internal process and keep a record of the timing before external disclosure becomes lawful.

### Remedies

- **Confidentiality**: the receiving agency and its personnel may not disclose the whistleblower's identity without cause
- **Employment protection**: the employing agency may not dismiss, demote, cut the pay of, or transfer a whistleblower because of the disclosure
- **Criminal liability for breaching confidentiality**: a public servant who does so faces imprisonment of not less than 6 months and not more than 5 years, and may face a fine of up to NT$300,000

### Rewards

Where a disclosure leads to unlawful conduct being established, the whistleblower can receive up to **10% of the fine or confiscated amount**. The incentive borrows from the qui tam design of the US False Claims Act, which allows a person with knowledge to sue on the government's behalf and take a share of the recovery, at a considerably more conservative rate. The US share is typically 15 to 30%.

## Where the law does not reach

- **Employees of purely private companies**: the largest gap, covering ordinary private companies, Taiwan branches of foreign companies, and civil society organizations neither controlled nor funded by government. Contractors working for government agencies are inside the Act, so the line runs between who your employer works for rather than between public and private employment as such
- **Retirees**: the Act protects serving employees, and retrospective protection for disclosure after retirement is not clearly addressed
- **Disclosure inside NGOs**: many advocacy organizations are themselves the subject of disclosures, and internal whistleblowing there has no protection
- **Cross-domain disclosure**: where the content touches national security, military matters, or trade secrets, it runs into the Classified National Security Information Protection Act, the Trade Secrets Act, and the National Intelligence Services Act
- **Anonymous disclosure**: the Act requires disclosure **under one's own name** to enter the protection process. **Fully anonymous disclosure falls outside PIWPA entirely**

That last point matters most for a technical community. Under the current regime in Taiwan, anonymous whistleblowing rests on technical anonymity (Tor, SecureDrop, encrypted email) rather than legal protection. Anonymous disclosure still has value. What it does not have is the law standing next to it, which makes the technology the only line.

## The digital traces a disclosure leaves

From the decision to disclose through to sending the material, traces accumulate at several layers:

- **Corporate network**: data loss prevention (DLP) alerts on outbound files, proxy logs, firewall packet records, employee browsing history
- **Endpoints**: USB insertion records, printer logs, cloud clipboards, screenshot tool history
- **Messaging metadata**: send times, recipients, attachment names, and IP addresses across Slack, Teams, and email
- **Company-issued devices**: location history on phones and laptops, SIM binding, and everything mobile device management (MDM) monitors
- **Account and identity logs**: login times, source IP, device fingerprints, and the cross-service linkage single sign-on (SSO) produces
- **Cloud services**: download, sharing, and external access records in Google Workspace and Microsoft 365
- **Money**: transfer records for subsidies, source payments, or disclosure rewards (see [why anonymous payments matter](../basics/payments-anonymity.md))
- **Cross-institutional correlation**: everything done outside work on the same phone, the same credit card, or the same account can be linked back

The list exists to show why a whistleblower needs to think about traces before acting, not to talk anyone out of disclosing. The institution guarantees treatment after identification. Avoiding identification during the act needs tools.

## What technical channels can and cannot fill

Where a disclosure falls outside PIWPA, as with private sector employees, or where the whistleblower chooses anonymity, the common options:

- **SecureDrop**: the standard anonymous intake system deployed by news organizations, running as a Tor onion service, reachable only over Tor and with the server's location hidden
- **Signal and Wire**: the baseline for encrypted messaging, keeping in mind that Signal still leaves metadata about who contacted whom and when
- **Onion intake boxes**: `.onion` channels run by an organization or by individual journalists
- **Encrypted email (PGP)**: high autonomy, high difficulty, with key management the hardest part
- **A disposable device with [Tails](../tools/what-is-tails.md)**: the standard approach for sensitive situations, where the whole working environment runs from a USB stick and leaves nothing after shutdown

Each has a threat model boundary (see [how to build a threat model](../basics/threat-model.md)). SecureDrop addresses the network in between and leaks inside the news organization, and does nothing about the traces left when the whistleblower downloaded the material on the corporate network. Signal addresses the content being read, while the social graph, your contact with a journalist, remains observable. Tor addresses identification at the IP layer, and does nothing about the writing style, word choices, and metadata left in the documents themselves.

Technology does not substitute for institutions, and institutions do not substitute for technology. A complete strategy uses both.

## Preparing, as the whistleblower

### Before

- **Establish which protections apply to you**: public sector employees follow the PIWPA process. Private sector employees need a lawyer familiar with labour law and trade secrets law
- **Separate work and personal devices**: do no research on the corporate network, corporate equipment, or corporate accounts. Do not look up the relevant law, search for a journalist's contact details, or download anonymity tools there
- **Build an external channel**: a personal device, ideally a newly purchased disposable phone, on a home network or an assessed public Wi-Fi, with Tor and Tails as appropriate
- **Leave no trail of deliberation**: do not discuss it on corporate messaging, do not tell colleagues, do not post in groups connected to the disclosure

### During

- **Handle the documents**: strip metadata, meaning PDF author fields, Office revision history, and photo EXIF. Tools like [mat2](https://0xacab.org/jvoisin/mat2){target="_blank"} clean files in batches
- **Do not signal yourself through filenames**: avoid personal habits like `Doc1.docx` or `Final2.pdf`
- **Choose the channel**: for first contact, prefer SecureDrop or a journalist's published PGP key over a work email account or a personal messaging app
- **Choose the timing**: do not access the material on work devices during work hours, and do not upload from the corporate network
- **Keep the money separate**: avoid receiving subsidies or rewards into an account in your own name. The options in [why anonymous payments matter](../basics/payments-anonymity.md) apply

### After

- **Clean up locally**: once the material is out, clear browsing history, clipboard, temporary files, and recent-documents lists
- **Know when to bring in a lawyer**: if the PIWPA process is triggered, contact a lawyer in parallel and record when and how the receiving agency responded, preserving the evidence for a possible move to second-tier disclosure
- **Prepare for the length of it**: whistleblowing is not a single event. From report to investigation to closure runs months to years, with workplace pressure, litigation, and media exposure along the way. A support system arranged beforehand matters

## The journalist's side and the lawyer's side

Whistleblowers rarely act alone, and journalists and lawyers are the two nodes that matter:

- **Journalists**: the detailed intake workflow is in [Protecting your sources as a journalist](../scenarios/journalist.md), covering secure channel deployment, file handling, interview records, and the digital cleanup on both sides after publication
- **Lawyers**: find a firm familiar with whistleblower protection, labour law, and criminal procedure. Taiwanese NGOs that can advise include the Humanistic Education Foundation, the Taiwan Association for Human Rights, and the Citizen Congress Watch. Several take pro bono enquiries with limited capacity, so making contact before acting is worth the effort

## Why an anonymity community tracks whistleblower law

Advocating for Tor, Tails, SecureDrop, encrypted messaging, and threat modelling puts us at a different node of the same chain:

- **Institutions and technology each cover one segment, and are used together.** PIWPA covers the public sector whistleblower's position after identification. Anonymity tools cover the ability to avoid identification during the act
- **The private sector gap is where policy advocacy has room to work.** Comparatively, EU Directive 2019/1937 and the UK's Public Interest Disclosure Act both cover the private sector, and the US Sarbanes-Oxley Act covers employees of listed companies and their contractors. Taiwan's next round of amendments is worth tracking
- **Whistleblower protection is personal data and identity in a concrete setting.** It lands squarely on the ground covered in [why networked freedom matters](../basics/internet-freedom.md), where a technical community's tools and its policy advocacy meet

## Sources

- [Public Interest Whistleblower Protection Act, Ministry of Justice](https://mojlaw.moj.gov.tw/LawContent.aspx?LSID=FL104574){target="_blank"} (in Chinese)
- [Whistleblower protection bill clears legislative floor](https://focustaiwan.tw/politics/202412270020){target="_blank"}, Focus Taiwan
- [Q&A on the Public Interest Whistleblower Protection Act, July 2025 edition](https://www.osha.gov.tw/media/nbjnc2ja/%E5%85%AC%E7%9B%8A%E6%8F%AD%E5%BC%8A%E8%80%85%E4%BF%9D%E8%AD%B7%E6%B3%95%E5%95%8F%E7%AD%94%E8%BC%AF.pdf){target="_blank"}, Occupational Safety and Health Administration (in Chinese)
- [SecureDrop](https://securedrop.org/){target="_blank"}
- [EU Directive 2019/1937 on whistleblower protection](https://eur-lex.europa.eu/eli/dir/2019/1937/oj){target="_blank"}
- [US Whistleblower Protection Act](https://www.osc.gov/Services/Pages/WPA.aspx){target="_blank"}

The Chinese-language version of this page is at [揭弊者保護法的技術觀察](https://anoni.net/docs/taiwan/whistleblower-law/){target="_blank"}.

## Related

- [Protecting your sources as a journalist](../scenarios/journalist.md) covers the receiving end of the same problem.
- [How to build a threat model](../basics/threat-model.md) is where to start if the trace list above raised more questions than it answered.
- [Why anonymous payments matter](../basics/payments-anonymity.md) covers the money trail specifically.

[^1]: [Whistleblower protection act passes third reading, public servants who disclose a whistleblower's identity face up to 5 years](https://www.cna.com.tw/news/aipl/202412270281.aspx){target="_blank"}, Central News Agency (in Chinese).
