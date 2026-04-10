---
date: 2026-04-10
authors:
    - toomore
categories:
    - Perspective
    - Tor
    - Relay
slug: a-server-that-forgets-exploring-stateless-relays
summary: "Why stateless, diskless Tor relays matter: seizure resistance, TPM-backed identity, and open operational trade-offs"
description: "A localized take on Tor Project's stateless relay post, focusing on trust assumptions, unresolved engineering work, and Taiwan-relevant operator context"
---

# A Server That Forgets: why this relay design deserves attention

The Tor Project post, [A Server That Forgets: Exploring Stateless Relays](https://blog.torproject.org/exploring-stateless-relays/){target="_blank"}, is grounded in real operator experience from [Osservatorio Nessuno](https://osservatorionessuno.org/){target="_blank"} in Italy. It is not just a technical tour. It asks a basic trust question: if a relay can be seized, searched, or physically cloned, what exactly can an adversary still learn?

## Why this is worth translating

First, the article starts from actual seizure and raid precedents. That makes the threat model concrete. Relay operators are not debating abstract malware only; many are planning for legal process and physical hardware exposure.

Second, it gives a rare end-to-end map of the stack: TPM, measured boot, remote attestation, RAM-only runtime, VM images, and tooling paths such as Patela and stboot. Most discussions in our region cover one layer at a time. This one connects them.

Third, it keeps the hard parts visible. Re-sealing after updates, conflicts between stateless images and unattended upgrades, memory ceilings without swap, and the risk of losing a Stable flag due to restarts are all left as open engineering work, not hidden in marketing language.

[![A Server That Forgets](https://forum.torproject.org/uploads/default/original/2X/e/ee9375b0ec3906d4a0338bc230d97d0a659d996a.jpeg){style="border-radius: 10px;"}](https://blog.torproject.org/exploring-stateless-relays/){target="_blank"}

## What "stateless relay" changes in practice

A stateless system reboots into a known image and does not keep writable disk state. In security terms, this shifts defaults:

- physical seizure yields less forensic material;
- configuration drift is constrained by declarative rebuilds;
- persistence across reboots becomes harder for attackers;
- reproducibility and auditability become more realistic goals.

For Tor relays, there is one unavoidable tension: **identity must survive reboots**. Relays build reputation over time through long-term keys. If keys disappear on every boot, the node loses its standing and utility.

That is where TPM-backed key handling matters. Keys can be bound to measured boot state and used without handing raw private key material to the operating system. Remote attestation can then let an external verifier check what software stack actually booted. But the limitations are real too, including key-type mismatches and operational complexity.

## Three deployment paths, three trade-offs

The post compares three practical models:

- minimal RAM-disk setups (simple, manual key operations);
- VM-based RAM images (easier rollback and image lifecycle);
- bare metal with TPM + verified boot (stronger trust chain, heavier operations).

No single model wins everywhere. The right choice depends on threat model, budget, hosting constraints, and team maturity.

<!-- more -->

## A Taiwan-local lens

For readers outside Taiwan, the practical question is not whether stateless relays are "good" in theory, but how they land in a place that is highly connected, commercially dense, and politically exposed in regional information conflicts.

Taiwan has strengths that can make this work easier than in some countries: mature datacenter services, access to commodity TPM-capable hardware, and a civic-tech culture that is comfortable with open documentation. In a favorable scenario, that means relay operators can standardize hardened images, publish clearer incident playbooks, and gradually build a small but credible trust layer around attestation and transparency reporting.

But there are downside paths too. Operationally, many local relay efforts are volunteer-run and time-constrained. Legal and hosting responses to complaints can be inconsistent. If a relay operator receives urgent abuse notices, equipment handling requests, or legal contact without a prepared process, "better architecture" does not automatically reduce human risk. Stateless design lowers some technical exposure, but coordination failure can still create real-world damage.

This topic is especially relevant if we connect it to those local conditions:

1. **Volunteer operations and legal handling**  
   A playbook for datacenter notices, law-enforcement contact, and equipment seizure can reduce panic and mistakes during incidents.

2. **Hardware and supply-chain feasibility**  
   TPM-capable mini-servers and hosting are available, but procurement, audit, and maintenance costs vary sharply. In a good case, operators can agree on a few reproducible hardware profiles and keep maintenance predictable. In a bad case, each team hand-rolls a different stack, audits become expensive, and security claims are hard to compare.

3. **Public accountability, not just private hardening**  
   Measured boot, attestation, and transparency logs can support broader civic-tech conversations about verifiable infrastructure claims, including open-source supply-chain trust. Best case: these tools become shared evidence that improves public trust. Worst case: they remain niche artifacts only specialists can read, so social trust still depends on reputation alone.

## What remains unsolved

The most important takeaway is not "problem solved." It is "problem scoped clearly." The unresolved items are exactly where collaboration is needed:

- predictable re-sealing workflows after stack changes;
- upgrade pipelines that do not silently roll back on reboot;
- memory tuning under strict no-swap constraints;
- uptime strategies that preserve relay usefulness and network flags.

## Closing thought

For privacy infrastructure, stateless design is not a silver bullet, but it is a meaningful way to reduce both attack surface and operator mistakes. This post helps move the conversation from slogans to engineering choices, with explicit costs and explicit trust boundaries.

!!! info "Source"

    - Tor Project, [A Server That Forgets: Exploring Stateless Relays](https://blog.torproject.org/exploring-stateless-relays/){target="_blank"}
    - Related: [Patela](https://github.com/osservatorionessuno/patela){target="_blank"}, [stboot](https://docs.system-transparency.org/st-1.3.0/docs/reference/stboot-system/){target="_blank"}, [Emerald Onion](https://blog.emeraldonion.org/evolving-our-tor-relay-security-architecture){target="_blank"}
