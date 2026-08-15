---
title: Campus Tor Relay Proposal Template
description: A proposal document, four communication emails, and an administrative timeline, drawn from the first successful case in Taiwan. Copy it, adapt it, and take it into your own institution's review process.
icon: material/file-document-edit-outline
---

# :material-file-document-edit-outline: Campus Tor Relay Proposal Template

This page provides a proposal document you can copy and adapt, assembled from community member NZ's work at National Taiwan Normal University. NZ took it through the full administrative process inside TANet, Taiwan's academic network, producing the country's first campus Tor relay. The account is in [an interview about setting up a Tor relay at NTNU](../blog/posts/ntnu-nz.md).

If you want to do this at your own institution, you do not have to start from nothing. Copy the template, replace each `<placeholder>` with your own details, attach the [FAQ for administrators and legal counsel](./campus-relay-faq.md) and the [deployment SOP](./campus-tor-relay-sop.md), and you have a complete proposal.

!!! note "Written from Taiwan, usable anywhere"

    The administrative structure here is Taiwan's: a university IT centre, a departmental network administrator, and an academic network with ministry-level oversight of outbound connectivity. The shape recurs across the region and beyond, with different names for the offices. The proposal body, the emails, and the pitfalls transfer directly. What needs replacing is the specific jurisdiction's legal framing and the names of the approving bodies.

## What this is

- **Contents**: a proposal document, four communication emails, a two-month administrative timeline, and the pitfalls
- **For**: students, research assistants, and staff at a university who want to run a Tor relay
- **Not**: the technical installation steps (see the [deployment SOP](./campus-tor-relay-sop.md)) or the institutional concerns (see the [FAQ](./campus-relay-faq.md))
- **Licence**: CC BY 4.0, so copy, modify, and submit it freely. Suggested attribution: "adapted from the anoni.net campus Tor relay template"

## How to use it

1. Copy the proposal body below into a document
2. Search for `<` to find every placeholder and replace each one
3. Attach the [FAQ](./campus-relay-faq.md) as appendix one
4. Attach the technical detail from the [SOP](./campus-tor-relay-sop.md) as appendix two
5. Find a faculty member willing to sponsor it, and review together
6. Submit it into your institution's review process

## The proposal body

??? example "Full proposal template (click to expand)"

    # Tor University Challenge at `<institution>`

    ## Project proposal

    **Establishing a Tor relay at `<institution>`**

    ---

    **Project lead**: `<department>` `<student number>` `<name>`
    **Faculty supervisor**: `<supervisor name>`
    **Team**: `<student society or laboratory>`

    ---

    ### 1. Background

    This project responds to the Electronic Frontier Foundation's [Tor University Challenge](https://toruniversity.eff.org/){target="_blank"}, which encourages universities worldwide to run Tor relays in support of privacy, information security education, and academic research.

    Tor (The Onion Router) originated at the US Naval Research Laboratory and is now maintained by the non-profit Tor Project. Its principal uses:

    - Protecting user privacy and anonymity
    - Helping journalists protect their sources
    - Helping people in censored environments reach information
    - Supporting lawyers, patients, and researchers in sensitive communication

    Universities worldwide participate, including MIT, Stanford, and Cambridge. Taiwan's first case is at the Computer Science and Information Engineering department of National Taiwan Normal University, documented in a [Tor Project blog guest post](https://blog.torproject.org/setting-up-tor-university-relay-taiwan/){target="_blank"}. Participation would strengthen this institution's teaching in information engineering and its practical commitment to information freedom and privacy.

    ### 2. Scope

    #### 2.1 Type of relay

    - This project deploys a **non-exit relay** only, functioning as a guard or middle relay
    - Such a node forwards encrypted traffic within the Tor network and never establishes connections to external sites directly, so it generates no abuse or liability issues

    #### 2.2 Resources required

    - **Server**: provided by `<supervisor, department, or self-provided>`
    - **Bandwidth**: whatever the deployment location supports, adjustable at the IT centre's request
    - **IP address**: one IPv4 address from the campus network. IPv6 can be requested separately for dual-stack

    #### 2.3 Operation

    - The project lead configures and maintains the relay
    - A Tor relay is low-maintenance, requiring only monitoring once deployed
    - Removal is straightforward and has no effect on the campus network
    - Before graduation, operation transfers to `<successor, society, or laboratory>`

    ### 3. Security and risk

    - **No abuse risk**: a non-exit relay does not interact with external services, so it receives no abuse notices and creates no legal disputes
    - **Traffic stays within Tor**: data is encrypted and encapsulated before entering or leaving the campus network
    - **Lawful**: universities and research institutions worldwide participate, and EFF provides legal and technical resources
    - **Reversible at any time**: at the institution's request, the service stops and the port closes within 10 minutes

    Detailed responses to institutional concerns are in appendix one.

    ### 4. Academic and institutional value

    - **Educational**: students learn how information security and anonymity networks work in practice
    - **Visibility**: demonstrates the institution's commitment to information freedom and privacy, in an internationally recognized programme
    - **Research**: usable as a case study and teaching material
    - **Community**: joins a global network of participating universities through the Tor University Challenge

    ### 5. Process

    1. Present the requirement to the IT centre (this document)
    2. Confirm network configuration feasibility with the departmental network administrator
    3. Build and test on a laboratory server under faculty supervision
    4. Apply to open the ORPort externally (443 or 9001) once live
    5. Report node status to the supervisor and the IT centre periodically

    ### 6. Contact

    - **Project lead**: `<name>`, `<department>` `<year>`, `<email>`
    - **Team**: `<society or laboratory>`, `<team email>`
    - **Faculty supervisor**: `<supervisor name>`, `<supervisor email>`

    We would welcome the IT centre's consideration and support, and will provide any further explanation or technical detail required.

    ### Appendices

    - Appendix one, frequently asked questions: the [campus Tor relay FAQ](https://anoni.net/docs/en/community/campus-relay-faq/){target="_blank"}
    - Appendix two, technical detail: the [campus Tor relay deployment SOP](https://anoni.net/docs/en/community/campus-tor-relay-sop/){target="_blank"}

## A typical administrative timeline

This timeline comes from the actual process at NTNU, running roughly two months from the first conversation with a supervisor to the node appearing in Relay Search. **Treat it as reference rather than a commitment.** Every institution moves at its own pace, and scheduling around holidays and exam periods helps.

| Stage | Approximate timing | Action |
|---|---|---|
| T+0 | Week 1 | Explain the plan to your project or thesis supervisor and get verbal support |
| T+1 week | Week 2 | Email the proposal to the head of the IT centre's network group |
| T+1 to 2 weeks | Weeks 2 to 3 | Prepare the next stage and obtain a machine from your supervisor for initial setup |
| T+2 to 3 weeks | Weeks 3 to 4 | Request rack space and one IPv4 address from the departmental network administrator |
| T+8 weeks | Week 9 | Schedule machine room access with the network administrator |
| T+9 weeks | Week 10 | Rack the machine and bring it online |
| T+9 weeks | Week 10 | The network administrator forwards the request to open external ports (9001, 443) |
| T+9 weeks | Week 10 | Tor Relay Search discovers the node within hours |
| T+13 weeks | Week 14 | The node is listed on the EFF Tor University Challenge site |

The largest delay is usually between requesting rack space and actually getting into the machine room, because it involves departmental resource scheduling and the IT centre's outbound connectivity review. **Allowing an extra two to three weeks is realistic.**

## Email templates

Four common points of contact. Adapt the structure to your own voice, and **replace every placeholder first**, particularly email domains, supervisor names, and IP ranges.

??? note "Template one: to your supervisor (T+0)"

    **Subject**: Proposal to run a Tor relay at `<institution>`

    Dear `<supervisor>`,

    I am `<name>`, a `<year>` student in `<department>`, currently researching anonymity networks. I would like to propose running a **non-exit relay** at `<institution>` in response to EFF's Tor University Challenge ([https://toruniversity.eff.org/](https://toruniversity.eff.org/){target="_blank"}).

    A relay of this type forwards encrypted traffic within the Tor network and **does not communicate with external sites directly**, so it attracts no abuse complaints or legal exposure. Universities including MIT, Stanford, and Cambridge participate, and National Taiwan Normal University's Computer Science and Information Engineering department was the first in Taiwan.

    If it goes ahead, I would:

    - Find a spare or self-provided machine, and I would welcome your thoughts on whether the department has suitable resources
    - Follow the IT centre's process for an outbound connectivity exception
    - Write a proposal document for the IT centre's review
    - Handle monitoring and maintenance once it is live

    Three questions:

    1. Would you be willing to act as supervisor for this project, so I can reference that when speaking to the IT centre?
    2. Is there a suitable machine available?
    3. Are there concerns I should address first?

    I have drafts of the proposal document and an FAQ, and can bring them to a meeting.

    `<name>`
    `<email>`

??? note "Template two: to the IT centre's network group (T+1 week)"

    **Subject**: Tor relay proposal for review, `<institution>`

    Dear `<head of network group>`,

    I am `<name>`, a `<year>` student in `<department>`, supervised by `<supervisor name>`. We would like to run a Tor relay in `<department or laboratory>`, in response to EFF's Tor University Challenge.

    **Summary**:

    - Type: a **non-exit relay**, forwarding encrypted traffic within the Tor network only, with no direct communication with external sites
    - Legal exposure: as a non-exit relay, it **receives no abuse notices and creates no legal disputes**
    - International precedent: MIT, Stanford, and Cambridge among others, with National Taiwan Normal University the first case in Taiwan
    - Operation: shared between myself and my supervisor, with the ability to go offline within 10 minutes

    The proposal, the FAQ, and the technical detail are attached:

    - Proposal: `<attachment or link>`
    - FAQ for administrators: `<attachment or link>`
    - Technical detail (configuration, firewall, monitoring): `<attachment or link>`

    If the IT centre has questions about any of it, I am happy to explain in person or provide further documentation.

    `<name>`
    `<email>`
    `<supervisor name>`
    `<supervisor email>`

??? note "Template three: requesting rack space and an IP address (T+2 to 3 weeks)"

    **Subject**: Request for rack space and one IPv4 address (Tor relay project)

    Dear `<network administrator>`,

    The IT centre has given preliminary approval to the Tor relay project proposed by `<supervisor name>` and myself (earlier correspondence attached). Moving to the hardware stage, I would like to request:

    1. **Rack space**: one 1U chassis or tower, to be placed in `<departmental machine room or laboratory>`
    2. **One static IPv4 address**: for the ORPort service

    Machine specification:

    - OS: Ubuntu Server 24.04 LTS
    - Services: Tor relay (non-exit) only, SSH restricted to the campus VPN range, and an Nginx status page
    - External ports: 9001/tcp (ORPort) and 443/tcp (HTTPS status page), everything else closed
    - SSH restricted to the campus VPN

    Please let me know when machine room access can be arranged.

    `<name>`
    `<email>`

??? note "Template four: opening external ports (T+9 weeks, forwarded by the network administrator)"

    **Subject**: Request to open external ports (Tor relay project, `<hostname or IP>`)

    Dear `<IT centre network group>`,

    The machine is online and tested. We now request the following ports be opened externally:

    | Port | Protocol | Purpose | Source |
    |---|---|---|---|
    | 9001 | TCP | Tor ORPort, TLS connections between relays | Anywhere |
    | 443 | TCP | HTTPS status page showing relay operation | Anywhere |
    | 80 | TCP | HTTP, for ACME challenge and a 301 redirect only | Anywhere |

    All other ports remain closed. SSH is restricted to the campus VPN range `<range>`.

    As a non-exit relay, this machine does not establish connections to external sites and forwards encrypted traffic within the Tor network only, so it **presents no abuse risk from outbound services**.

    Please let me know if anything further is needed.

    `<name>`
    `<email>`

## Before you start

Handling these first saves a lot of back and forth:

- [ ] **Find a faculty member willing to sponsor it.** University administration treats a proposal with a named academic behind it very differently
- [ ] **Check the outbound connectivity policy.** Most universities block outbound by default, with exceptions requiring formal application
- [ ] **Have a machine.** A supervisor's laboratory, a spare departmental machine, or your own VM all work. Resource requirements are low
- [ ] **Register a project email address.** Do not tie `ContactInfo` to a personal account. A society or project address survives graduation and makes handover work
- [ ] **Plan the handover before you propose it.** A successor, joint society operation, or transfer to the laboratory all work, and the proposal should say which
- [ ] **Read the [FAQ](./campus-relay-faq.md)**, so nothing in a meeting catches you out
- [ ] **Read the [SOP](./campus-tor-relay-sop.md)**, for the technical picture
- [ ] **Read the [NTNU interview](../blog/posts/ntnu-nz.md)**, for the tone and the pitfalls

## Pitfalls

From the first case, the places people get stuck:

- **Assuming technical correctness is enough.** On an academic network, the institution decides the outcome more often than the technology does. Patience with the paperwork is the skill
- **Underestimating oversight of the academic network.** Most institutions block by default, and an exception has to fit the reporting process
- **Not planning maintenance and accounts.** Account permissions after graduation directly determine whether the node survives. **Do not tie `ContactInfo` to a personal address**
- **Overselling it.** Do not describe Tor as something edgy or radical. Use language the institution can work with, and remember the goal is that whoever approves it can answer for it later
- **Not distinguishing a relay from an exit node.** This is the single most important thing to get across. State explicitly that it is a **non-exit relay**

!!! tip "Next step"

    1. **[The FAQ for administrators and legal counsel](./campus-relay-faq.md)**: read the ten questions so a meeting does not catch you out, and attach it as appendix one
    2. **[The deployment SOP](./campus-tor-relay-sop.md)**: once approved and once you have the IP address and rack space, deploy from there

    Suggested order: **proposal template, then FAQ, then SOP**.

## Related

- [The NTNU interview](../blog/posts/ntnu-nz.md): the full account of the first case
- [Campus Tor relay deployment SOP](./campus-tor-relay-sop.md): the technical detail
- [Campus Tor relay FAQ](./campus-relay-faq.md): the institutional concerns
- [Tor relays on campus track](./relay-on-campus.md): the community's entry point for this work
- [EFF Tor University Challenge](https://toruniversity.eff.org/){target="_blank"}: the international programme
- [Setting up a Tor university relay in Taiwan](https://blog.torproject.org/setting-up-tor-university-relay-taiwan/){target="_blank"}: the case on the Tor Project blog

## Sources and acknowledgements

This template comes from community member NZ, who provided the original proposal and presentation from National Taiwan Normal University. The material is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/){target="_blank"} with NZ's agreement, as a reference for other institutions.

!!! info "The original case files"

    NZ has published the original folder, [Tor relay deployment at NTNU](https://drive.google.com/drive/folders/1B9ysi2ELC9w46bD3o7TMsnv55nupI1nz){target="_blank"}, containing the original proposal document, slides from an internal presentation in December 2025, and photographs.

    **Adapt the placeholder version on this page rather than forking the original.** The original contains NZ's personal email address, supervisor details, and campus IP ranges, and missing one of those when submitting is an easy mistake. The archive is there so you can see what a real version looks like and learn the structure and register.

If you get a relay running at your own institution using this template, **tell us**. We will add your case to the [Tor relays on campus track](./relay-on-campus.md) so the third and fourth have more to work from. Contact routes are on [Community services](./tools.md).
