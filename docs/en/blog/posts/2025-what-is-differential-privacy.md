---
date: 2026-04-27
authors:
    - toomore
categories:
    - Technology
    - Privacy
slug: what-is-differential-privacy
summary: "Differential privacy makes it mathematically provable that collecting aggregate statistics from a population does not meaningfully compromise any individual's privacy. This explainer covers the history from k-anonymity to Google RAPPOR, Apple, and the U.S. Census — and what it means for Taiwan and the Chinese-speaking world."
description: "Differential privacy makes it mathematically provable that collecting aggregate statistics from a population does not meaningfully compromise any individual's privacy. This explainer covers the history from k-anonymity to Google RAPPOR, Apple, and the U.S. Census — and what it means for Taiwan and the Chinese-speaking world."
---

# What is Differential Privacy?

!!! info ""

    This article is based on the original explainer by fria at Privacy Guides:

    - [What is Differential Privacy?, fria, 2025-09-30](https://www.privacyguides.org/articles/2025/09/30/differential-privacy/){target="_blank"}

Can you collect data from a large group of people while still protecting each individual's privacy? Differential privacy answers yes — with a mathematical proof to back it up. This article introduces the concept, traces its history from early anonymization failures to real-world deployments, and explores what it means for users and policymakers in Taiwan and the broader Chinese-speaking world.

<!-- more -->

!!! info "A note for anonymous network users"

    Differential privacy and tools like Tor address different layers of privacy. Tor protects your *transmission* — it prevents an observer from knowing who you are communicating with. Differential privacy protects *data release* — it ensures that published statistics cannot be reversed to identify individuals. They are complementary, not interchangeable, and together cover different parts of a complete threat model.

    If you care about where your data ends up across services, platforms, or government datasets, differential privacy is worth understanding: even "anonymized" or "aggregate" data can be reversed through cross-referencing with other sources. This article helps you identify which privacy claims are verifiable — and which are marketing.

## Summary of the Original Article

The Privacy Guides explainer walks through the full arc of privacy-preserving data collection:

**The core problem.** Even seemingly harmless data points can identify individuals. Latanya Sweeney showed in 2000 that 87% of Americans can be re-identified from just three fields: ZIP code, date of birth, and sex.

**Failed approaches.** Before differential privacy, techniques like k-anonymity (every row has at least k-1 identical rows) and simple name-removal were considered sufficient. They weren't. The AOL search log release (2006) and the Strava heatmap incident (2018) are two famous examples of "anonymized" data that was trivially re-identified. In the Strava case, the platform did not deliberately expose anyone — aggregating millions of individual routes simply revealed patterns that only specific people would repeat. That is precisely the problem differential privacy is designed to prevent.

For k-anonymity specifically, researchers demonstrated the attack mechanism against the Harvard/MIT EdX dataset: they identified quasi-identifier combinations (course enrollment records) that resisted generalization, then matched them against publicly available LinkedIn profiles to narrow the candidate list to specific individuals. Cross-referencing with external data is k-anonymity's fundamental blind spot.

**Randomized response** (Warner, 1965) was an early building block: introduce deliberate randomness into survey answers so individual responses can't be trusted, but aggregate statistics remain accurate.

**Differential privacy** (Dwork et al., 2006) formalized this idea. It adds calibrated noise to data such that the output of any query looks essentially the same whether or not any particular individual's data was included. The privacy guarantee is controlled by ε (epsilon, the "privacy budget"): smaller ε means stronger privacy but less accurate results.

**Local vs. Central DP.** Central DP adds noise after data is collected, requiring trust in the central authority. Local DP (as implemented by Google's RAPPOR in 2014) adds noise on the device before transmission, eliminating the need to trust any server.

**Real deployments** include Google Chrome and Maps (RAPPOR), Apple's keyboard and emoji telemetry (Sketch/Matrix), Mozilla Firefox telemetry (Prio), and the U.S. 2020 Census Disclosure Avoidance System. Neither Google nor Apple publicly discloses the ε values used in their deployments. "We use local differential privacy" can be verified from published papers and code; "our ε is strong enough to protect you" remains a claim users cannot independently audit.

**OpenDP**, developed at Harvard, provides an open-source toolkit for applying differential privacy to arbitrary datasets.

**Where research is heading.** Machine learning models trained on personal data can leak information about their training set through *membership inference attacks* — an adversary probes the model to determine whether a specific record was included in the training data. Applying differential privacy during model training is the strongest known defense with formal guarantees. As AI systems increasingly rely on sensitive personal data, this application of differential privacy is growing in importance alongside the classical data-release use cases covered in the original article.

The full article is detailed, well-structured, and accessible to non-specialists — making it an excellent reference for anyone explaining privacy-enhancing technologies to a general audience.

## Taiwan Perspective

### Government Statistics and Open Data

Taiwan's open data platform (data.gov.tw) and national statistics releases rarely disclose how data is de-identified, let alone whether mathematically rigorous techniques are used. The U.S. 2020 Census case — where adopting differential privacy sparked public debate over how to set ε and who gets to decide — is directly relevant to Taiwan. As Taiwan's government expands data-sharing programs (health data, transportation, smart city initiatives), civil society advocates can use differential privacy as a concrete benchmark: not just "please anonymize it," but "prove the privacy guarantee and publish the parameters."

### Regulation and Industry

Taiwan's Personal Data Protection Act (個人資料保護法) requires de-identification but does not specify technical standards. The "local noise, then upload" model demonstrated by Google and Apple provides a template that Taiwanese regulators and companies could reference when drafting or evaluating compliance practices. Taiwanese mobile applications — many of which collect detailed behavioral telemetry — are rarely audited for whether their anonymization claims hold up to re-identification attacks of the kind described in this article.

### Civil Society and Health Data

Taiwan's National Health Insurance database is one of the richest health datasets in the world, and its secondary use for research has sparked repeated controversies around privacy. Differential privacy offers a path to publishing aggregate statistics from such databases while providing provable individual-level protection. Advocates working on health data governance, academic data sharing, or smart city projects can use this article as accessible educational material to raise the technical standard of the conversation.

### Online Resources from Taiwan

Taiwan's Ministry of Digital Affairs (數位發展部) has published a *Privacy Enhancing Technologies Application Guidelines* (隱私強化技術應用指引) on HackMD, covering five key PETs including differential privacy, synthetic data, and federated learning. The document provides application scenarios, technical workflows, and case studies grounded in a Taiwan policy context — one of the few Chinese-language PET guides that connects regulatory needs to specific technical choices. It is a useful reference for advocates, researchers, and policymakers working in Taiwan or other Chinese-speaking contexts.

Reference: [Privacy Enhancing Technologies Application Guidelines](https://hackmd.io/@petworks/rJ-UOh9Rn){target="_blank"}

## Perspective for Chinese-Speaking Regions

China's Personal Information Protection Law (PIPL, 个人信息保护法) defines anonymization as irreversible de-identification, but does not mandate specific technical approaches. The gap between regulatory language and cryptographically provable privacy guarantees is significant. Google RAPPOR and Apple's local differential privacy deployments demonstrate what "verifiable privacy" looks like in practice — a standard that Chinese regulators, researchers, and civil society organizations can point to when evaluating domestic data practices.

China's major platforms (WeChat, Alipay, Baidu) process enormous volumes of user data with limited public technical disclosure. The differential privacy framework, and tools like OpenDP, provide a common language for demanding transparency: not just "we protect your data," but "here is our ε, here is our model, here is what you can verify."

## Further Reading

- [Original article: What is Differential Privacy? (Privacy Guides)](https://www.privacyguides.org/articles/2025/09/30/differential-privacy/){target="_blank"}
- [Calibrating Noise to Sensitivity in Private Data Analysis (Dwork et al., 2006)](https://link.springer.com/chapter/10.1007/11681878_14){target="_blank"}
- [RAPPOR: Randomized Aggregatable Privacy-Preserving Ordinal Response (2014)](https://arxiv.org/abs/1407.6981){target="_blank"}
- [Learning with Privacy at Scale (Apple)](https://machinelearning.apple.com/research/learning-with-privacy-at-scale){target="_blank"}
- [OpenDP](https://opendp.org/){target="_blank"}
- [Differential privacy (Wikipedia)](https://en.wikipedia.org/wiki/Differential_privacy){target="_blank"}
- [Privacy Enhancing Technologies Application Guidelines (Ministry of Digital Affairs / petworks, HackMD)](https://hackmd.io/@petworks/rJ-UOh9Rn){target="_blank"}
