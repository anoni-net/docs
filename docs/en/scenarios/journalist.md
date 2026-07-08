---
title: Journalists and source protection
description: A concise, regional take on protecting sources across the source-protection lifecycle, with metadata and cross-border risk in Asia-Pacific, routing depth to FPF and EFF guides.
icon: material/newspaper-variant-outline
---

# :material-newspaper-variant-outline: Journalists and source protection

In investigative reporting the heaviest risk usually lands on the source, not the reporter. A reporter who gets noticed still has an editor, a media lawyer, and peers behind them. A source often does not: a mid-level employee, a civil servant handling a file, a monitored activist. When a source is identified, the consequences are theirs to carry.

This page is deliberately short. The canonical English-language playbooks are strong, and we route depth to them in [Where to go from here](#Where-to-go-from-here). What we add is a regional read: working with sources inside the less open jurisdictions of Asia-Pacific, where exposure can mean detention, where SIM and account registration is tied to a legal identity, and where cross-border data requests between governments are a real part of the threat model.

!!! info "Where the depth lives"

    The [Freedom of the Press Foundation's source-protection guides](https://freedom.press/digisec/guides/){target="_blank"} and [EFF Surveillance Self-Defense's *Journalist on the Move*](https://ssd.eff.org/playlist/journalist-move){target="_blank"} are the references we point to for tool-by-tool, step-by-step instructions. This page assumes you'll go there for specifics. It exists because FPF's guides are English and Spanish only, so a regional English page still helps reporters in this part of the world line the advice up with local conditions.

## The metadata problem comes first

Before any tool choice, the core risk to understand is metadata. Encrypting the *content* of a conversation does not hide *who contacted whom, when, and how often*. That pattern alone can burn a source: if a company's logs or a telco's records show that an employee messaged a known reporter the week before a story ran, the content of those messages is almost beside the point.

So source protection is mostly about not creating the linkable trace in the first place, not about encrypting it after the fact. For the underlying concepts, see [why metadata matters](../basics/metadata.md) and [anonymity, privacy, pseudonymity, and confidentiality](../basics/anonymity-vs-privacy.md), which is the distinction reporters most often get wrong: a confidential channel is not an anonymous one.

## The source-protection lifecycle

A useful way to think about it is as a lifecycle, from first contact to post-publication cleanup. Each stage asks the same question: *if an adversary later obtained communication logs, cloud backups, or a seized device, could they trace it back to the source?*

### First contact

Publish a way to be reached safely, rather than waiting for sources to improvise an insecure one. At a pointer level:

- **Signal** is the most common individual reporter inbox. It is end-to-end encrypted and the server can't read message content. Note that registration requires a phone number; the source's number can be hidden from you with a Signal username, but the number still anchors the account, which matters in jurisdictions with mandatory identity-linked SIM registration.
- **SecureDrop** is the institutional option: an open-source submission system maintained by the Freedom of the Press Foundation, where sources reach a newsroom over a Tor onion service so neither side sees the other's location or IP. It needs real infrastructure and maintenance, so it's typically run by larger outlets. Individual reporters do not need to feel they're failing for using Signal instead.
- **Onion services** more generally let a source connect without revealing where they are. A self-hosted onion inbox is a lighter-weight version of the same idea.

If a source reaches you first through an insecure channel (work email, a mainstream messenger), don't discuss anything substantive there. Move the conversation to a secure channel with a contentless first message, and don't forward their original message around the newsroom.

### Verifying identity without creating evidence

Confirming who a source is and protecting who they are are two sides of the same task. Cross-check the claim against public information (a stated role against a company site or past interviews; whether leaked documents match the organization's formats and terminology). What you should *not* do is ask for ID cards, badges, or pay slips as "proof": those become the very evidence that exposes the source if a device is later searched. A second set of eyes from an editor catches a lot of social-engineering attempts.

### Exchanging files

Treat every file as carrying metadata until proven otherwise. Office documents, PDFs, photos, and video routinely embed author names, GPS coordinates, device models, timestamps, and edit history. Strip it before opening or forwarding; FPF and EFF cover the specific tools. Store sensitive material in an encrypted container rather than on a desktop or in personal cloud sync, and when you pass files onward to an editor or lawyer, use an end-to-end encrypted transfer rather than a mainstream attachment or a cloud-drive share link, each of which leaves a record on the platform's side.

### Interview records

Keep only what you need to write the story. Use code names instead of real names, keep the code-name-to-identity mapping stored separately and encrypted, and avoid recording third parties (family, colleagues) who aren't part of the story. For high-risk recordings, a standalone, offline audio recorder keeps the file off a phone that is otherwise tied to your SIM, accounts, location history, and automatic cloud backup. Upload to an encrypted container promptly, then delete from the original device.

### Post-publication cleanup

Publication is often when source risk *rises*, because the subject organization starts an internal investigation and reviews who had access. Before the story runs, remind the source about likely access-log reviews and office monitoring, and agree on a quiet period with no contact. On your side, weigh keeping records (a defense against litigation) against destroying the link to the source, set disappearing messages on the relevant threads, and consider reimaging a reporting laptop after a high-sensitivity story. The public, citable evidence behind the story should be preserved; the private back-and-forth with the source should be cleared as early as it safely can be.

## The regional angle that changes the advice

The general lifecycle above holds everywhere. What shifts in this region is the *consequence* of exposure and the *reach* of the adversary.

- **Working with sources inside less open jurisdictions.** When a source is physically inside a jurisdiction where exposure can mean detention or worse, the source's local conditions dominate the threat model, not the reporter's. Network censorship can block the very tools you'd want to use, so confirm what actually works on the source's side before relying on it, and assume the source's device and home network are higher-risk than your own.
- **Identity-linked SIM and account registration.** Across much of Asia-Pacific, SIM cards and major platform accounts are bound to a legal identity by law. A phone number is often not a pseudonym but the legal person. This is exactly why phone-number-anchored tools, useful as they are, are not anonymity tools, and why the metadata trail matters more here than the guides written for other contexts assume.
- **Cross-border data requests are real.** Governments in the region do make formal and informal requests to each other and to platforms for user data. A channel that is safe against one government is not automatically safe once a second one can ask the first. For a source crossing a border, or a reporter traveling to meet one, treat the trip itself as a stage in the lifecycle.
- **Hong Kong's state-secrets offense reaches the source directly.** The 2024 Safeguarding National Security Ordinance ([the Article 23 legislation](https://hongkongfp.com/article23-security-law/){target="_blank"}) criminalizes unauthorized disclosure of information classified as a state secret, so a source's leak can itself be a crime, not just a firing offense, and a reporter who solicits or knowingly receives the material risks being treated as party to the same offense. The Hong Kong Journalists Association still operates and still publishes, but has absorbed years of doxxing campaigns and official pressure, so don't assume it's the safety net a press-freedom body would be in Taiwan or Japan. Route instead to [Reporters Without Borders](https://rsf.org/en){target="_blank"}, the [Committee to Protect Journalists](https://cpj.org/){target="_blank"}, and the [Access Now Digital Security Helpline](https://www.accessnow.org/help/){target="_blank"} (24/7, multilingual).

For the travel side of this, [pre-departure digital safety](./travel-ai-briefing.md) walks through briefing yourself on a destination's censorship, legal, and SIM picture before you go. For the empirical regional backdrop (what's actually blocked, where), see the [Regional Observatory](../regional/index.md). The companion [activists' digital preparation](./activist.md) scenario covers overlapping ground for sources who are themselves organizers.

## Where to go from here

- [Freedom of the Press Foundation — digital security guides](https://freedom.press/digisec/guides/){target="_blank"} — the source-protection, secure-communication, and reporting-in-the-field collections; the canonical reporter playbook (English and Spanish).
- [EFF Surveillance Self-Defense — Journalist on the Move](https://ssd.eff.org/playlist/journalist-move){target="_blank"} — threat modeling, secure communication, and circumventing censorship, available in 14 languages including Thai, Vietnamese, and Burmese, which makes it directly usable for sources across the region.
- [Why metadata matters](../basics/metadata.md) — the concept that drives most source-protection practice.
- [Anonymity, privacy, pseudonymity, and confidentiality](../basics/anonymity-vs-privacy.md) — so you don't mistake a confidential channel for an anonymous one.
- [Threat modeling](../basics/threat-model.md) — a short per-story pass on who the adversary is and what they can reach.
- [Access Now Digital Security Helpline](https://www.accessnow.org/help/){target="_blank"} — 24/7 multilingual support if a source or reporter is detained or a device is seized; the first call for Hong Kong readers under the exposure described above.
