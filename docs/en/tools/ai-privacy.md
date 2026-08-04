---
title: Using AI at work without leaking data
description: Where the text you paste actually goes, why the consumer/business tier distinction decides most of it, why deleting a conversation doesn't delete the data, and what to ask a provider before trusting it with work material.
icon: material/robot-happy-outline
---

# :material-robot-happy-outline: Using AI at work without leaking data

Pasting work material into an AI assistant is routine now, and almost nobody stops to ask who handles that text next. This page covers where it goes, what should never go in, and what to ask a provider before you rely on one.

Specific policies change every few months, so the durable part is the set of questions at the end rather than any vendor's current answer.

## Where the text goes

**The provider sees plaintext.** A cloud model has to process your input to answer it. TLS protects the path, not the service. This is a different model from end-to-end encrypted messaging, where the operator cannot read content at all.

**Whether it trains the model depends on your tier.** This is the distinction that decides most of the risk, and the major providers converge on it: consumer and free tiers may use your content for model improvement, usually with a setting to turn it off; business, team, and API tiers default to no training and offer a data processing agreement. OpenAI states that consumer service content may be used for training while ChatGPT Team, Enterprise, and the API are excluded by default[^openai]. Anthropic states that commercial services (Claude for Work, the API) do not use inputs or outputs for training, with consumer services offered as a user choice[^anthropic]. Google's Gemini Apps have their own activity and improvement controls[^google].

Signing in with a company account on a business tier and signing in with a personal account on a free tier are materially different acts. The first is covered by a contract; the second is not.

**Deleting the conversation does not delete the data.** This one is widely misunderstood, and the published retention periods make the point concretely:

- Google states that conversations reviewed by human reviewers, along with related data such as language, device type, and location, are *not* deleted when you delete your activity, and are retained for up to three years[^google].
- Anthropic states that when a user opts in, de-identified content can persist in model training pipelines for up to five years[^anthropic].
- Content already incorporated into a trained model cannot be retroactively withdrawn. Turning a setting off applies going forward.

The practical consequence: set the training controls when you open the account, not after you've pasted something sensitive.

**Human review is normal.** Quality evaluation and abuse detection generally involve people. Google states that a subset of conversations is reviewed by humans, including trained service providers, with chats disconnected from the account before review[^google]. The arrangement is reasonable; the assumption that "only a machine sees it" is not.

**Your employer can see the business-tier logs.** A business tier solves the vendor-training problem, not internal visibility. Administrators can typically access usage records, which is necessary for compliance and is a separate exposure for you. Using the company AI account for personal matters is the same category of mistake as using the company laptop for them.

## What should not go in

- **Unpublished business information**: financials, deals, product specs, internal strategy
- **Credentials and keys**: API keys, passwords, connection strings, certificates. Treat anything pasted as burned and rotate it.
- **Personal data of customers and colleagues**: names, national ID numbers, addresses, medical and financial records
- **Material other people entrusted to you.** The most-overlooked item. You can decide to hand over your own data; you have no standing to consent on a third party's behalf. Sources, clients, interviewees, and people who came to you for help are the clearest cases. See [journalists and source protection](../scenarios/journalist.md) on the consent question.
- **Legally or contractually protected material**: medical records, case files, anything under an NDA
- **Combinations that re-identify.** Individually innocuous details that together point to one person.

## Before you paste

De-identify: real names to labels, company names to sector descriptions, exact figures to magnitudes, precise dates to relative ones, addresses to city level, and strip endpoints, keys, and internal hostnames from code. Then reread what's left and check whether it still points back to the source. Note that de-identification treats the content, not the account: the provider still knows it is you asking, and the subject of the question is itself information.

Paste only the passage the task needs, rather than the whole document.

And apply one test: if this text appeared in public search results tomorrow, what happens? If the answer is "nothing," paste it. If the answer is "that's a problem," de-identify first or handle it another way.

## Local models

Running a model on your own machine keeps content on the device, which suits genuinely sensitive work: client data, unpublished material, source-related content, or an environment where sending data abroad is itself the risk. The costs are real hardware requirements (memory is the practical ceiling), quality below the contemporary large commercial models, and setup you maintain yourself.

Local is not automatically safe. The conversation log still sits on your machine and is exposed if the device is seized or compromised, so full-disk encryption and device hygiene still apply. Self-hosted or organization-hosted deployments sit between the two options, moving the trust boundary from an external vendor to your own operations team.

## The regional angle

- **Jurisdiction of storage matters as much as the policy.** A provider's promise not to train on your data says nothing about which government can compel disclosure from the servers holding it. For cross-border work, check the data processing agreement and subprocessor list, not just the privacy page.
- **Reaching the service can itself be the exposure.** Where major AI services are blocked, users route around the block, and in some jurisdictions the circumvention carries more legal risk than the content of the query. See [cross-border travel and device searches](../scenarios/asia-travel.md).
- **A sensitive query is sensitive before it is answered.** "How do I protect a source in country X" reveals the work in progress regardless of what comes back. This is the reasoning behind keeping such queries on local or self-hosted models.

## What to ask a provider

| Question | Where to look |
|---|---|
| Is input on *my* plan used for training? | The provider's data usage policy |
| Where is the control to turn that off, and does it apply retroactively? | Same, usually under data controls or privacy settings |
| How long are conversations retained, and does deletion actually delete? | Data retention policy |
| When does human review happen, and how long is reviewed content kept? | Same |
| Which jurisdiction stores the data, and is it transferred across borders? | Data processing agreement and subprocessor list |
| Is a business tier with a DPA available? | Commercial terms |

Official entry points for the three largest: [OpenAI's data usage policy](https://openai.com/policies/how-your-data-is-used-to-improve-model-performance/){target="_blank"}, [Anthropic's Privacy Center](https://privacy.anthropic.com/){target="_blank"}, and the [Gemini Apps Privacy Hub](https://support.google.com/gemini/answer/13594961){target="_blank"}. For any other service, find the equivalent page; the absence of a clear public one is itself a signal.

## Confabulation is also a safety problem

Beyond leakage, wrong answers cause harm. Language models state incorrect things confidently, and phone numbers, statute numbers, tariffs, and emergency contacts are where this bites hardest. Treat output as a list of things to verify, and check each against a primary source. [Pre-departure digital safety](../scenarios/travel-ai-briefing.md) works through this in detail with copy-paste prompts.

## This page will age

AI terms and settings change quickly. Verified 2026-08. The mechanisms and the question list are built to last longer than any specific policy; check each vendor's current pages before relying on a detail, and tell us via the [Community](../community/index.md) page if something here no longer matches.

## Where to go from here

- [Pre-departure digital safety](../scenarios/travel-ai-briefing.md) — prompts for briefing yourself on a destination, with the same caution about what you reveal in the query
- [How platforms collect your data](../basics/platform-tracking.md) — the same "where does this actually go" question, applied to social platforms
- [Threat modeling](../basics/threat-model.md) — decide the adversary before deciding the tier
- [Journalists and source protection](../scenarios/journalist.md) — why source material is the clearest case of data you cannot consent to share

[^openai]: [How your data is used to improve model performance](https://openai.com/policies/how-your-data-is-used-to-improve-model-performance/){target="_blank"} — OpenAI, on the consumer/business distinction (ChatGPT Team, Enterprise, and the API excluded by default) and where the data controls sit. Verified 2026-08.
[^anthropic]: [Anthropic Privacy Center](https://privacy.anthropic.com/){target="_blank"} — Anthropic, on commercial services not being used for training, consumer services being a user choice, and de-identified content persisting up to five years in training pipelines once opted in. Verified 2026-08.
[^google]: [Gemini Apps Privacy Hub](https://support.google.com/gemini/answer/13594961){target="_blank"} — Google, on the scope of human review, disconnection from the account before review, and human-reviewed conversations being retained up to three years regardless of activity deletion. Verified 2026-08.
