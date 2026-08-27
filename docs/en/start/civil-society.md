---
title: Civil society
description: A starting path for advocacy groups and service NGOs. Data inventory first, then anonymous tip channels, anonymous donations, and the data-protection duties that constrain all three.
icon: material/account-group
---

# :material-account-group: Civil society starts here

For staff and long-term volunteers at advocacy groups, service NGOs, research organizations, and local community groups. An organization's position differs from an individual's: what you are protecting usually belongs to someone else — donors, service users, the employee willing to speak — and they are the ones who carry the consequences.

Every link below points at a page that already exists here. The twenty-minute pass establishes a basis for deciding; the week fills in enough to actually change how the organization works.

## Three things you are probably dealing with

### Organizational data scattered across free services

Shared forms, group chats, files forwarded through members' personal mail. When something goes wrong it is hard to inventory what still exists, who holds it, and whose access was never revoked. Write down what you are protecting and who you are protecting it from before choosing tools.

Fill in the [threat model checklist](../utils/threat-model.md) first. It produces a summary you can take into a meeting.

### Someone wants to pass you information but will not use a named channel

They may be an employee, a directly affected person, or a witness who does not want to be identified. Ordinary forms and mailboxes leave correlatable records, and the sender has no way to assess the risk. They need a channel they can evaluate for themselves.

See [sending us sensitive material](../community/upload-sensitive.md), which covers the PGP and OnionShare approaches and the trade-off between them.

### Donors do not want a record, and the organization still has to issue receipts

Charitable-solicitation rules, political-donation law, and anti-money-laundering requirements constrain each other here, and the workable space is narrower than most people expect.

See [anonymous donation channels for advocacy organizations](../scenarios/nonprofit-anonymous-donation.md), written separately for the organization and for the donor. The legal detail is Taiwan-specific; the structure of the problem is not.

## Three pages for your first twenty minutes

1. [Threat model checklist](../utils/threat-model.md): three questions, and it flags mismatches in your answers, such as naming a state-level adversary while budgeting the lowest possible effort. What you type stays in the browser tab and is gone on reload
2. [Activists and protest digital safety](../scenarios/activist.md): before, during, and after mobilization, usable as a shared baseline for everyone in the organization
3. [Secure messaging compared](../tools/messaging-comparison.md): read before deciding what the organization uses internally and externally

## Building the foundation over a week

### Internal collaboration

- [Threat modeling](../basics/threat-model.md): where the three questions come from, which you need when facilitating a team discussion
- [Metadata, and why it matters](../basics/metadata.md): who contacted whom and when, a layer content encryption does not cover
- [What is CryptPad?](../tools/what-is-cryptpad.md): an alternative for shared documents and forms
- [Community services](../community/tools.md): Matrix, CryptPad, Send, and forms, all community-run and open for use

### Intake and donations

- [Sending us sensitive material](../community/upload-sensitive.md): how the receiving end should be set up
- [File metadata stripper](../utils/strip-metadata.md): clean files in the browser before publishing, nothing is uploaded
- [Anonymous donation channels](../scenarios/nonprofit-anonymous-donation.md): the full workflow and its legal constraints

### Regulation, as a worked example

- [Taiwan's 2025 data protection overhaul](../regional/taiwan-pdpa-2025.md): what changed for organizations holding personal data
- [Taiwan's whistleblower protection act](../regional/taiwan-whistleblower-law.md): how far the law protects an employee who speaks
- [Governance charter](../community/governance.md): how this community makes decisions and handles disputes, useful as a reference when drafting your own

## What to take with you

- Press "copy summary" after the threat model checklist and paste it into the organization's notes, so the next person does not start over
- Matrix, CryptPad, and Send at [community services](../community/tools.md) are open for use, with nothing to self-host
- Ask in the [public Matrix room](../community/tools.md), or send sensitive files to [whisper@anoni.net](mailto:whisper@anoni.net)

## What this path does not cover

- **Individual members at a protest**: covered in [activists and protest digital safety](../scenarios/activist.md); the path above lists the organizational layer
- **An account already compromised or a device already lost**: start at [emergency help](../help/index.md)
- **Jurisdictions other than Taiwan**: the regulatory pages above are Taiwan-specific. Hong Kong since the 2020 National Security Law and the 2024 Safeguarding National Security Ordinance, and Mainland China throughout, put advocacy organizations at a risk level Taiwan's material does not model. See [posting on mainland Chinese platforms](../scenarios/mainland-speech.md) and [speaking online from Singapore and Malaysia](../scenarios/singapore-malaysia-speech.md) for the regional differences
