---
title: Governance Charter
description: How the anoni.net community makes decisions: roles, consensus and voting, dispute resolution, code of conduct, and how the charter itself is amended.
icon: material/gavel
---

# :material-gavel: Governance Charter

!!! warning "Draft, under community review"

    This charter is still a draft. It has not yet been formally ratified by community partners, and clauses may change. Until it is ratified, the community treats this draft as the working reference and resolves disputes by it. Discussion is welcome in the Matrix public rooms or via GitHub issues. The amendment process is described in [Amending this charter](#Amending-this-charter) below.

Once a community grows past a certain size, it helps to write down how decisions get made so the same basic principles don't get re-argued every time. This charter sets out anoni.net's roles, decision-making, dispute resolution, and code of conduct. It is a living document. Significant changes are discussed openly in Matrix before any revision is merged.

This is the full charter behind the governance headlines on the [About page](../about/index.md). Two ways to read it: first-time participants can skim the [Roles](#Roles) and [Code of conduct](#Code-of-conduct) sections to understand the basic expectations of joining. Long-time members, proposal authors, and core members who handle disputes should read it through once.

## Scope

This charter applies to collaboration and interaction within:

- The anoni.net documentation site (zh-TW, zh-CN, en)
- Our self-hosted infrastructure: the Matrix homeserver `im.anoni.net`, Cryptpad, Etherpad, Send, SearXNG, and Formbricks
- Workshops, meetups, and conference sessions held under the anoni.net name
- Representing anoni.net when collaborating with international organizations such as EFF, the Tor Project, and OONI
- Pull requests, issues, and discussions in the community's GitHub repositories

It does not cover what members say or do as individuals on outside platforms, but conduct inside anoni.net spaces must follow this charter.

## Roles

The community keeps a low-formalism role system to avoid hierarchy that alienates newcomers. The practical differences between roles are at the account level (who can merge a PR, who reviews Matrix account requests), not in how much anyone's voice counts.

### Core members

Long-term members who have invested in operations and earned enough technical and community trust. They are responsible for:

- Operating the self-hosted services and reviewing account requests
- Merge authority on the GitHub repositories
- Representing anoni.net in dealings with international organizations
- Final review of proposed charter amendments
- Handling disputes that involve breaches of the code of conduct

Core membership is added by consensus of existing core members. There is currently no public application process.

### Contributors

Members with concrete output: writing articles, translating, writing code, organizing events, design, or research. They participate actively in the relevant rooms inside the Matrix Public Space.

How to join: claim a topic, open a PR, or help organize an event. See [How to contribute and claim a topic](./how-to-contribute.md). There is no formal barrier to entry.

### Observers

Members who subscribe to the newsletter and join the Public Space but don't yet have concrete output. They are equally welcome. The community works asynchronously and doesn't expect everyone to be active.

### Visitors

People who read the documentation and blog, or write in to discuss, without joining Matrix. Messages to <whisper@anoni.net> are handled by core members on rotation.

### Moving between roles

The roles describe activity, not rank. A visitor who joins Matrix and starts participating becomes an observer or contributor without any formal step. A contributor moves toward core membership through sustained work and trust, and is added by consensus of current core members. Nothing forces anyone to move: an observer who only wants to follow along is welcome to stay one.

## Decision-making

### Consensus by default

The community runs on consensus. Here, consensus means a state where no relevant member objects, not unanimous agreement. In practice:

1. The proposer raises the proposal in the relevant Matrix room, with context and options.
2. At least 3 days are given for anyone with concerns to respond.
3. If no objection is raised, the proposal passes.
4. If there is an objection, it goes to discussion until both sides reach a version they can accept.

This process fits most content, process, and design decisions.

### Voting (the exception)

Voting only happens when consensus is clearly stuck, or when time pressure calls for a fast conclusion. Conditions:

- Initiated by at least two core members
- Eligible voters: all contributors (members with concrete output in the last 6 months)
- Method: a public Matrix poll, or a semi-anonymous Cryptpad form
- Passing threshold: a simple majority (more than half)
- Major decisions (charter amendments, adding or removing a core member) require a 2/3 majority of active contributors

In practice the community has rarely needed to vote. Consensus resolves most situations.

### The proposal process

| Scope of impact | Proposal channel | Decision method |
|---|---|---|
| Single-article content, translation word choice | GitHub PR / Matrix room | review consensus |
| Structural change (nav, moving files, renaming) | Discuss in Matrix first, then PR | consensus, 3-day window |
| Adding, removing, or changing policy on a self-hosted service | Core Matrix room and public room in parallel | core-member consensus |
| Charter and code-of-conduct amendments | GitHub issue and Matrix in tandem | consensus, at least 7-day window |
| Public positions (statements, protests, letters of support) | Matrix public room | core members plus a majority of contributors |

## Dispute resolution

Disputes fall into two kinds: substantive disputes (how to do something) and interpersonal disputes (conflict between people, or a breach of the code of conduct).

### Substantive disputes

These follow the ordinary proposal process: raise the disagreement in Matrix, lay out both sides' arguments, and find consensus. If no consensus emerges, vote. Technical disputes can keep the disagreement open and let each side experiment, then re-evaluate by the results after a while.

### Interpersonal disputes

Conflicts between members are triaged by severity:

1. **Minor misunderstanding** — the members involved can sort it out privately.
2. **Clear breach of the code of conduct** — the affected party can report it to core members, who help resolve it (a private conversation, a public warning, temporary isolation).
3. **Serious incident** (harassment, stalking, physical threats) — core members immediately remove the offending member's access, give a brief account of the response in a public room afterward without revealing the affected party's identity, and help the affected party contact authorities or support resources as needed.

Disputes that involve a core member themselves are handled by the other core members, who may invite outside arbitration where necessary.

## Code of conduct

### Principles of interaction

- **Mutual respect** — members of different backgrounds, technical levels, and political views are treated alike.
- **Address the idea, not the person** — critique proposals, not identities.
- **Assume good faith** — start from the assumption that the other person's proposal is well-intentioned, then discuss the details.
- **Transparency** — keep relevant decisions in public rooms where possible, and sync private coordination back to the public afterward.
- **Newcomer-friendly** — stay patient with basic questions and break down complex context clearly.

### Lawful use is a precondition

All collaboration and discussion presumes lawful use. The community does not assist with, or provide instruction for, any of the following:

- Money laundering, tax evasion, or sanctions evasion
- Harassment, stalking, physical threats, or unauthorized intrusion
- Distribution of child sexual abuse material (CSAM), human trafficking, or drug trafficking
- Intelligence gathering against, or interference in the internal affairs of, another state's citizens (foreign-state intelligence operations)

Anonymity and privacy tools are used by all kinds of people. The audience the community works to serve is journalists, civil-society groups, researchers, and individuals who need to protect themselves. If a collaborator turns out to have any of the unlawful intents above, the collaboration ends immediately.

### Handling sensitive information

- Content involving personal data, unpublished research, or sensitive victim identities goes through the sensitive-submission process on the [Community page](./index.md).
- Don't post victims' personal data or unpublished source material directly in public rooms.
- When citing sensitive reporting, preserve the original author and source, and don't summarize sensitive details without authorization.

### Speaking on behalf of the community

Representing anoni.net publicly (media interviews, event remarks, community accounts) requires:

- Not advancing political positions that the community hasn't discussed
- Getting a member's consent before quoting their private opinion
- Syncing in Matrix before negotiating with international organizations (EFF, Tor Project, OONI)

When speaking as an individual, note that it's "a personal position, not the community's."

## Enforcement

Responses to a breach of the code of conduct are decided by core members case by case, from lightest to most severe:

1. **Private reminder** — a core member sends a private note, with no public record.
2. **Public warning** — the breach is recorded openly in the relevant Matrix room.
3. **Temporary isolation** — Matrix account, Cryptpad access, and GitHub permissions are suspended for days to weeks.
4. **Permanent removal** — revocation of all self-hosted-service accounts, the collaboration relationship, and eligibility to take part in community activities.

The response weighs the severity of the breach, whether it is a repeat offense, and the person's attitude. The decision in a serious incident is briefly described in a public room without revealing the affected party's identity.

## Amending this charter

This charter is a living document. Anyone can propose an amendment. The process:

1. Open a GitHub issue describing what should change and why.
2. Post a notice in the Matrix public room in parallel.
3. Allow at least a 7-day discussion period.
4. Once consensus is reached, a core member merges it into `main` and posts a short note on the blog explaining the change.

In an emergency (for example, a new form of harassment that calls for an immediate update to the enforcement principles), core members may update the charter on a temporary basis and return to the regular process for review within 7 days.

## Related documents

- [Community & Collaboration](./index.md) — how to reach us and what we welcome
- [How to contribute and claim a topic](./how-to-contribute.md) — the entry path for first-time participants
- [Translation and localization](./i18n.md) — how the three editions relate
- [About anoni.net](../about/index.md) — the governance headlines this charter expands on
