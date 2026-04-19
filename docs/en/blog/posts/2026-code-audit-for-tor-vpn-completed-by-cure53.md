---
date: 2026-04-19
authors:
    - toomore
categories:
    - Update
    - Tor
slug: 2026-code-audit-for-tor-vpn-completed-by-cure53
image: "https://forum.torproject.org/uploads/default/original/2X/4/4825413b93e0884f51aed631e4111ded9a117e60.jpeg"
summary: "Cure53's independent audit of TorVPN for Android found core Tor routing solid — and identified specific areas worth watching for mobile privacy communities in Taiwan"
description: "Cure53 audited TorVPN for Android and the Onionmasq networking layer in June 2025. The core Tor integration held up well; the findings that matter most for Taiwan's privacy community are in DNS handling, mobile configuration storage, and what transparent audits mean for trust"
---

# What the Tor VPN security audit means for Taiwan's privacy community

!!! info ""

    This post is based on the Tor Project announcement:

    - [Code audit for Tor VPN completed by Cure53 | April 15, 2026](https://blog.torproject.org/code-audit-tor-vpn/){target="_blank"}

![TorVPN Cure53 Audit](https://forum.torproject.org/uploads/default/original/2X/4/4825413b93e0884f51aed631e4111ded9a117e60.jpeg){style="border-radius: 10px;"}

In June 2025, Cure53 completed a penetration test and source code review of **TorVPN for Android** and its underlying Rust networking layer, Onionmasq. The Tor Project published the results in April 2026. The headline finding: Tor's core tunnel establishment and routing logic held up well. But there are specific technical issues worth understanding if you're recommending or deploying this tool in Taiwan's context.

<!-- more -->

## What was audited

Two components were in scope:

1. **TorVPN for Android** — the mobile app that routes device traffic through Tor
2. **Onionmasq / Tunnel Interface for Arti** — the Rust-based layer handling TCP/UDP parsing, DNS resolution, and traffic forwarding into the Tor network

## What the audit found

The core conclusion is reassuring: "Tor's core integration remains robust, with no fundamental issues in tunnel establishment or routing." The findings that do exist fall into four categories.

**Input validation gaps** — incomplete validation in several places could cause unexpected behavior at edge cases.

**DNS handling weaknesses** — under specific and uncommon conditions, DNS resolution logic could trigger denial-of-service behavior. This is rare, but matters more in environments where DNS is already manipulated.

**Cryptographic recommendations** — the audit flagged missing certificate pinning and opportunities to improve randomness quality. Both are defensive hardening suggestions rather than active vulnerabilities.

**Mobile security gaps** — two standard Android concerns: plaintext configuration storage (configuration data stored unencrypted on the device) and absent root detection (no warning or mitigation when running on a rooted device).

All findings have been accepted into Tor Project's ongoing security improvement roadmap.

The full audit report is available here: [torvpn_cure53_audit.pdf](https://blog.torproject.org/code-audit-tor-vpn/torvpn_cure53_audit.pdf){target="_blank"}

## Why this matters specifically in Taiwan

**Independent audits are how trust is built, not assumed.** Taiwan has a technically engaged digital-rights and civic tech community — groups like g0v contributors, COSCUP participants, and digital journalists who recommend tools to people with real exposure. For those communities, "Tor is secure" is not a sufficient answer. A PDF with specific vulnerability IDs and a remediation roadmap is. This audit provides that foundation.

**DNS manipulation is not a hypothetical.** The DNS handling weakness identified in this audit is particularly worth noting in Taiwan's context. OONI measurement data from Taiwan shows that DNS interference does occur — not at the scale seen in heavily censored environments, but enough that understanding how a privacy tool behaves under DNS pressure has practical meaning.

**Plaintext configuration storage is a legal and practical concern.** Taiwan's Personal Data Protection Act places obligations on how applications handle user data stored on devices. The audit finding that TorVPN stores configuration in plaintext isn't just a technical footnote — it's a compliance-adjacent concern worth factoring into deployment recommendations, especially for users in higher-risk scenarios like journalists or activists.

!!! info "Source"

    Based on the official Tor Project post [Code audit for Tor VPN completed by Cure53](https://blog.torproject.org/code-audit-tor-vpn/){target="_blank"}.
