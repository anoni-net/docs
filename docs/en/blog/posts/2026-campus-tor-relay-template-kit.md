---
date: 2026-05-21
authors:
    - toomore
categories:
    - Community
    - News
slug: 2026-campus-tor-relay-template-kit
image: "assets/images/post-update.png"
summary: "NZ has turned the NTNU campus Tor Relay rollout — proposal, outreach emails, deployment setup, FAQ — into a CC-BY 4.0 template kit other universities can adapt."
description: "NZ has turned the NTNU campus Tor Relay rollout — proposal, outreach emails, deployment setup, FAQ — into a CC-BY 4.0 template kit other universities can adapt."
---

# Campus Tor Relay templates: proposal, SOP, and FAQ now published

![Campus Tor Relay template kit](./assets/images/post-update.png){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

In November 2025, the first campus Tor Relay in Taiwan went live at National Taiwan Normal University's CSIE department. Over the past six months, community member NZ (Su En-Li) — the student who pushed the proposal through — worked with the community to turn that experience into a reusable template kit. The three documents are now published under CC-BY 4.0, with a long-form interview as the entry point.

The templates are ready. The next step is for more universities to take them up.

<!-- more -->

## The template kit

Three documents cover the three roles in the rollout sequence: proposal author, technical operator, and the university administration team that gets asked questions.

!!! note "English translation status"

    The three community documents below are currently only available in Mandarin. The Mandarin originals are the authoritative source and carry the full Taiwan-specific legal annotations. English versions will be added in a follow-up release.

- **Proposal template** (school-facing document, four outreach email patterns, two-month administrative timeline): [https://anoni.net/docs/zh-tw/community/campus-tor-relay-proposal/](https://anoni.net/docs/zh-tw/community/campus-tor-relay-proposal/){target="_blank"}
- **Deployment SOP** (torrc, UFW, status page architecture, monitoring runbook, IPv6, handover): [https://anoni.net/docs/zh-tw/community/campus-tor-relay-sop/](https://anoni.net/docs/zh-tw/community/campus-tor-relay-sop/){target="_blank"}
- **FAQ for university administration and legal counsel** (ten questions with Taiwan-specific annotations, plus two one-page summaries): [https://anoni.net/docs/zh-tw/community/campus-relay-faq/](https://anoni.net/docs/zh-tw/community/campus-relay-faq/){target="_blank"}

The hub page collects all three with case studies, project goals, and a backlog of external resources awaiting translation:

- [Tor Relay 校園建立研究專題](https://anoni.net/docs/zh-tw/community/relay-on-campus/){target="_blank"}

## For readers outside Taiwan

The case is grounded in Taiwan's TANet (the academic network) and Taiwanese legal context, but the kit transfers in pieces:

- The **proposal template's structure** — scope, technical resources, operational responsibility, legal positioning, academic value — is reusable across jurisdictions
- The **outreach email examples** show the registers that worked when approaching IT departments and faculty advisors; useful as a tone reference even when the local language and legal context differ
- The **torrc, UFW, and monitoring setups** in the SOP are jurisdiction-agnostic, and the graduation-handover discussion applies to any campus where students will eventually leave
- The **FAQ's Taiwan-specific legal annotations** need to be replaced with local equivalents, but the question structure of "what the university actually worries about" is the more portable part

If your university already runs a relay through EFF's Tor University Challenge program, we'd be glad to compare notes, particularly on how you handled the handover problem.

## Why Taiwan still needs more campus relays

Tor's anonymity rests on relay diversity. When relays concentrate in a few countries or network providers, the network's ability to resist traffic analysis weakens. Taiwan's relay count on Tor Metrics is still limited, and each stable node adds another margin of resistance. Real-time observation:

- [Tor Relays watcher](https://anoni.net/docs/zh-tw/taiwan/tor-relay-watcher/){target="_blank"}

University campuses are a reasonable place to close that gap: stable academic bandwidth, students and staff with the skill to operate the node, a clearer institutional review path than residential or small-company hosting, and direct alignment with EFF's [Tor University Challenge](https://toruniversity.eff.org/){target="_blank"}.

Taiwan's civil society has been raising attention to whistleblower protection, anti-stalking, and press freedom, areas where Tor's value to local users tracks with the global picture. A campus relay is the concrete contribution of "making this infrastructure usable in Taiwan," closer to the actual situation than an abstract statement about privacy.

## NZ's original materials

The templates are placeholder-scrubbed, sanitised versions. If you want to see what the real submission looked like, NZ has made the original Google Drive folder fully public:

- [NZ's original Google Drive folder](https://drive.google.com/drive/folders/1B9ysi2ELC9w46bD3o7TMsnv55nupI1nz){target="_blank"}

It contains the original NTNU project proposal (Google Doc), the slide deck from the December 21, 2025 on-campus sharing session, and on-site photos. The original Doc still carries NZ's personal email, advisor information, and the university's IP range. Please don't fork the raw Doc, change the school name, and submit it — it's easy to spot during review. The value of the archive is for comparing structure and wording. When you actually submit, use the placeholder-scrubbed templates on anoni.net.

The Taiwan case is also documented in English on the Tor Project blog, with NZ's first-hand account:

- [Setting up a Tor Relay at a university in Taiwan](https://blog.torproject.org/setting-up-tor-university-relay-taiwan/){target="_blank"}

The full long-form Mandarin interview with NZ on anoni.net covers the year-long arc through the proposal process. If you read Mandarin, this is the most complete record:

- [在台師大架設 Tor Relay：一段與學校溝通、留下可能性的實作經驗](https://anoni.net/docs/zh-tw/blog/posts/ntnu-nz/){target="_blank"}

## Acknowledgements

The kit's source materials were contributed by NZ (Su En-Li), drawn from his proposal, communication records, and operational experience at NTNU. NZ released the materials under CC-BY 4.0 as a template for other universities to adapt.

Every campus relay that goes live lowers the cost for the schools that follow. If you adapt the kit and roll out a relay at your university, in Taiwan or elsewhere, we'd be glad to hear about it. We can fold your case into the project page so the next wave has more reference points.

The template kit is a shared starting point. Any university can pick it up, rewrite it, and route it through its own internal review. The more schools take part, the more the shared template library grows, and the easier the work becomes for the ones who follow.
