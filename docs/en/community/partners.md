---
title: Working with Organizations
description: How civil-society groups, newsrooms, researchers, and international organizations working on the Sinophone Asia-Pacific can work with anoni.net, from localization and regional context to measurement, and what we cannot take on.
icon: material/handshake-outline
---

# :material-handshake-outline: Working with Organizations

This page is for civil-society groups, advocacy organizations, newsrooms, independent media, researchers, and international organizations whose work touches the Sinophone Asia-Pacific. anoni.net is a small volunteer community in Taipei. What we can offer is mostly public documentation, one-off workshops, self-hosted services, and the regional layer: localization, local context, local research, and measurement from inside Taiwan. Both what we can do and what we cannot are laid out below, so you can judge the fit before writing to us.

Taiwan is the only jurisdiction where we have first-hand standing. Mainland China, Hong Kong, Macau, Singapore, and Malaysia we follow through public sources and contacts in the diaspora, and we say so whenever it matters to the work.

Apart from the public projects listed under [Partnerships and collaborations](../about/index.md#Partnerships-and-collaborations) on the About page, we don't publish which organizations have worked with us, and no page describes the tools a particular organization uses. For advocacy groups and newsrooms in the region, having asked a community for security help is itself something that can end up in a file.

## Who this is for

- Advocacy groups, social-service organizations, and research NGOs. The organizational groundwork is in the [civil society path](../start/civil-society.md)
- Newsrooms with an editorial desk, legal, and IT. The newsroom-level practices are in the [newsroom path](../start/media.md)
- Independent media and one-person teams. The individual practices are in the [independent journalist path](../start/independent-journalist.md)
- International organizations, researchers, and funders covering Internet freedom in the region. Our regional pages start at the [Regional Observatory](../regional/index.md)
- Universities considering a Tor relay. The campus track is at [Tor Relays on Campus](./relay-on-campus.md)

## Localization and regional expertise

### Localization

We can translate and adapt security guides, tool documentation, interface strings, and reports into Traditional Chinese written for Taiwan, or review a Chinese translation you already have. Terms follow a shared glossary (see [terminology and glossary consistency](./i18n.md#Terminology-and-glossary-consistency)), and we write 正體中文 rather than 繁體中文 for the reasons set out in [our naming note](./zh-hant-naming.md).

The track record is public. The About page lists our translation contributions to the Tor Project and OONI and the Traditional Chinese edition of the Tor University Challenge, and two long-form regional reports are available in full Traditional Chinese translation from [Curated Reports](../reports/index.md). Bridging regional research in the other direction, from Chinese into English, is part of the same work.

### Local context

Before you publish a report, a guide, or an advocacy piece that touches Taiwan, we can read it for how it lands in Taiwan's legal and platform environment: which statutes apply, which platforms people actually use, which terms read naturally. Our regulatory explainers cover the 2025 data-protection amendments, the 2026 virtual-asset law, whistleblower protection, and real-name requirements and data markets, all linked from the [Regional Observatory](../regional/index.md).

For the other jurisdictions we can point out where a draft conflicts with the public sources we follow, and we label that clearly as second-hand.

### Local research

The community's three 2026 tracks, the [personal privacy guide](./privacy-guide.md), [anonymous payments](./payments-research.md), and [Tor relays on campus](./relay-on-campus.md), each publish their research goals and work in progress. Co-researching one of those questions, or co-publishing on a related one, is open to organizations as well as individuals.

Researchers can use our underlying data in published work: the [ASN observation data analysis](../regional/ooni-asn-coverage.md) over OONI's public dataset, and the relay figures from the [Tor relay watcher](../regional/tor-relay-watcher.md). We attribute other people's work explicitly and don't claim a formal arrangement where none exists.

### Local observation

We run OONI Probe in Taiwan and contribute to the country test list described in [OONI Website Testing List](../regional/ooni-checklist.md). If sites relevant to your work fit the list's categories, write to us with them and we will review them for the next batch of list updates, after which their reachability across Taiwan's networks is measured and published over time.

The [Tor relay watcher](../regional/tor-relay-watcher.md) tracks relays in Taiwan, Japan, South Korea, and Hong Kong, and [How many people use Tor in Taiwan](../regional/taiwan-tor-users.md) is reproducible from two public CSV files. We are glad to explain how to read the numbers. We cannot run measurements from inside other jurisdictions ourselves.

## Other ways to work together

### Staff training and device reviews

We can walk your staff through a device review. The procedure is in [Walking a new colleague through a device review](../utils/case-onboarding.md): an hour, two people, the [Threat model checklist](../utils/threat-model.md), and [My preparation checklist](../utils/checklist.md) to record what comes next. It runs as a one-off workshop built entirely from public pages that keep working offline. Sessions depend on volunteer time and follow no fixed schedule.

### Self-hosted services for collaboration

The community self-hosts Matrix, CryptPad, Send, Etherpad, and a forms service, described in [Community Services](./tools.md). Send and Etherpad need no account, while Matrix and CryptPad accounts are issued on request. The services are run by volunteers with no service-level commitment, so they suit collaboration better than being your organization's system of record. For exchanging sensitive files, [Sending Us Sensitive Material](./upload-sensitive.md) describes our own process.

### Newsroom intake channels

The [first contact](../scenarios/journalist.md#First-contact) section of the source-protection guide compares Signal, SecureDrop, onion inboxes, and email aliases. [Setting up a .onion service](./setup-onion-service.md) and [OnionShare](../tools/onionshare.md) cover two of them. If you get stuck following the documentation, ask on Matrix or by email.

### Security update alerts

The [Software Changelog](../changelog/index.md#Security-contacts-in-organisations) has a section for the person who handles security in an organization: subscribe to the Now and Soon feed, and pass a Now item to the people it affects the same day.

### Anonymous accounts of practice

What your organization runs into in practice can be sent anonymously to [whisper@anoni.net](mailto:whisper@anoni.net). We fold it into scenario pages or new starting paths without identifying the organization or the people involved.

### Co-hosted events

The community has run a track at COSCUP two years in a row and has co-hosted sessions with other communities; past events are on the [Activity](../activity/index.md) page. Proposals for a joint session or workshop are welcome.

## What we cannot take on

- **Incident response and device forensics**: For a compromised account or suspected spyware, start with [Emergency Help](../help/index.md). International helplines, including Access Now, RSF, and CPJ, are listed in [the regional angle](../scenarios/journalist.md#The-regional-angle-that-changes-the-advice) of the source-protection guide
- **Legal advice**: The regulatory pages summarize and explain; they are not legal advice
- **Holding your data**: The self-hosted services are for collaboration, and your organization's records belong in systems you control
- **Long-term consulting or custom development**: Volunteer time is limited, so the work centers on public documentation and one-off sessions
- **First-hand work outside Taiwan**: Local context and observation for other jurisdictions come from public sources, not from our own presence there

## How collaboration works

1. Write to [whisper@anoni.net](mailto:whisper@anoni.net) with the kind of organization you are and what you have in mind. If you need encryption, use the PGP key on [Stay Informed](../contact.md)
2. We reply and set up a call on Jitsi, which the community uses for its own meetings
3. Before the call, each side fills in the threat model checklist and brings the copied summary
4. We agree on which pieces to take on, on a timeline set by volunteer availability

What you send us is used only to arrange the work. It is not passed to third parties and does not appear on any page of this site.

## Where to go from here

- [How to Contribute](./how-to-contribute.md): how individuals join the community's work
- [Regional Observatory](../regional/index.md): what we cover in each jurisdiction and how
- [About anoni.net](../about/index.md): the partnerships we have and how we are funded
