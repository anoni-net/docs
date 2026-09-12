---
title: What Taiwan's Digital Credential Wallet Protects
description: Reading the source code of Taiwan's government digital identity wallet to answer three separate privacy questions — whether the issuer sees your presentations, whether verifiers can link you across visits, and who is allowed to ask.
icon: material/wallet-outline
---

# :material-wallet-outline: What Taiwan's Digital Credential Wallet Protects

Taiwan's Ministry of Digital Affairs (moda) put its Digital Credential Wallet into trial operation at the end of 2025. Picking up a parcel at a convenience store no longer requires a physical ID card[^1]. The official framing centres on selective disclosure: hand over the fields a verifier needs, not the whole document. Civil society groups have concentrated their criticism on the legal side, arguing that no statute yet guarantees the privacy rights or the equal access to public services the system touches[^2].

Both positions are defensible, and neither answers the technical question. The wallet's source code is published under the MIT licence at [`moda-gov-tw/TWDIW-official-app`](https://github.com/moda-gov-tw/TWDIW-official-app){target="_blank"}[^3], so the technical question can be answered by reading it. This page separates three things that are usually collapsed into one: what the issuer can see, what verifiers can correlate, and who is allowed to ask.

!!! info "Why an international reader might care"

    Taiwan is running a national digital identity credential on the same open standards the EU mandates — W3C Verifiable Credentials, SD-JWT, OpenID4VCI and OpenID4VP — without an equivalent legal framework behind them. That makes it an unusually clean natural experiment. The EU wrote privacy properties into eIDAS 2.0 as binding obligations and the implementations followed. Taiwan adopted the same specifications as engineering choices. Comparing the two shows which properties appear because the technology suggests them, and which appear only when a law requires them.

    The regional contrast matters too. Singapore's Singpass, the case most often held up as the model for digital government, puts the government in the middle of every verification. Taiwan and South Korea did not. Anyone arguing about national digital identity design in the Asia-Pacific is arguing about that fork, and Taiwan is the case where the code is public.

!!! info "What this page is based on, and when it was written"

    Technical conclusions are read from commit `99e9deb105b6` (2026-07-27) of `moda-gov-tw/TWDIW-official-app`. Every code link on this page is pinned to that revision, so later changes upstream do not alter what the links show. Official positions are quoted from the technical introduction, FAQ and privacy policy pages at [wallet.gov.tw](https://wallet.gov.tw/){target="_blank"}, which may change at any time. Quotations from Chinese-language sources are translated here, with the originals in the Chinese version of this page.

## The problem the wallet is meant to solve

The opening line of the official policy page draws a boundary[^30]:

> The Digital Credential Wallet is not an electronic wallet or a digital ID card. It is a digital carrier for credentials of various kinds.

Presenting a physical document is all-or-nothing. Showing a driving licence hands over your name, date of birth, address and national ID number together. Traditional procedures often keep a photocopy, and a leaked photocopy invites impersonation. Each agency issues its own credential and its own app, none of which interoperate, so people install several.

The stated benefits are stronger personal data protection through selective disclosure, cross-border interoperability for the digital economy, and progress towards a digital society. The reasoning given is that "in future, most commercial activity and government services will take place online, and individuals will need to prove their eligibility to take part"[^30].

The wallet sits inside the Digital Innovation Critical Infrastructure Programme, running 2024 to 2027, with a cross-agency budget of NT$460 million and roughly NT$160 million in the first year. moda joined the W3C in 2023 to study decentralised identity management, which became the technical foundation[^31].

That first line, "not a digital ID card", appears in the policy document before the controversy it later had to answer.

## Where Taiwan's architecture sits in the region

Taiwan is not an EU member state, yet it adopted the EU's specifications. Membership has nothing to do with it. W3C Verifiable Credentials, the IETF's SD-JWT, and the OpenID Foundation's OpenID4VCI and OpenID4VP are open specifications that anyone can implement.

There are two ways to build digital identity, and they differ in whether the issuer is present at the moment you present a credential.

In the identity provider model, the verifier queries the government and the government answers with who you are. Singapore's Singpass works this way. Its official developer documentation states[^32]:

> Singpass is Singapore's national digital identity authentication provider using the OpenID Connect 1.0 protocol. It stores users' identity information and authenticates them for transactions with government agencies and private organizations online.

The verifier is a Relying Party in the protocol, requesting an ID token from Singpass. Singpass is therefore in the middle of every verification.

In the holder presentation model, the credential lives on the user's phone and is handed directly to the verifier, who checks it cryptographically. Taiwan and the EU took this route.

How nearby jurisdictions divide:

| Jurisdiction | Model | Issuer present at presentation |
|---|---|---|
| Singapore, Singpass | Central identity provider, OpenID Connect | Yes |
| Japan, My Number Card | Credential held in a card or phone secure element, central PKI (JPKI)[^33] | Partly |
| South Korea, Mobile ID | Blockchain-based DID, data distributed to phones[^34] | Closer to Taiwan |
| Taiwan, Digital Credential Wallet | Holder presentation, W3C Verifiable Credentials with SD-JWT | No |
| EU, EUDI Wallet | Holder presentation, same specifications | No |

Singpass is frequently held up as the model for digital government, and its adoption rate is genuinely high. But in that architecture the government sits in the middle of every verification. Copying the case wholesale produces a system in which the government can see every verification record.

Measured against its neighbours, Taiwan's architecture favours the holder, and South Korea's is similar. On this one axis Taiwan chose holder presentation, and the government cannot position itself in the middle of each verification the way Singpass does.

## Three questions worth asking separately

Presenting a physical document involves three distinct privacy concerns, and the digital version addresses each through a different mechanism.

1. **The issuer's view**: whether it learns when and where you presented. A physical driving licence does not report back to the licensing authority; the digital version depends on design
2. **Between verifiers**: whether they can link you. Whether proofs collected by two different shops can be matched to the same person
3. **Standing to ask**: who is entitled to request a presentation. In the physical world this is judged from context; in the digital world it is a protocol question

## The issuer cannot see when or where you present

The official technical page states that "in use, there is no need to connect to the issuing body for confirmation each time"[^4]. The source code agrees. On presentation the wallet generates a Verifiable Presentation from the credential already on the device, with no call back to the issuer.

Revocation checking avoids the same trap. When a credential is revoked or suspended, verifiers need a way to find out. The most direct approach — the verifier asks the issuer about a specific credential number — would notify the issuer of every single presentation. The wallet uses a status list instead[^5]. A comment in `StatusListPrepareTask` gives the minimum size[^6]:

```java
// generate 1st status list
// prepare initial bit string with 0s (min. size = 16 KB)
byte[] bytes = new byte[16 * 1024];
Arrays.fill(bytes, (byte) 0x00);
encodedList = ZipUtils.gzipCompressThenBase64(bytes);
```

16 KB is 131,072 bits. The implementation gives each credential one bit (`byteIndex = statusListIndex / 8`), so a single list covers the status of roughly 130,000 credentials. Revocation and suspension are kept in two separate lists.

For the holder, this means the verifier downloads a list shared by 130,000 people and checks one cell of it locally, rather than asking the issuer about your particular credential.

The issuer learns only that someone downloaded the list, not which entry was consulted. The specification calls this property herd privacy, and sets out its limits in the same section[^5]. The issuer can still identify the verifier from the source address of the HTTP request; herd privacy degrades badly for small issuers whose issuance volume is far below the list capacity; and an issuer that deliberately shards the list finely, down to one credential per list, defeats the protection entirely.

The privacy policy is consistent with the code: "in the authentication of verifiable credentials or the provision of personal data to external parties, this Ministry receives no personal data whatsoever"[^7].

## Different verifiers can link you

Selective disclosure uses SD-JWT (Selective Disclosure for JSON Web Tokens), which salts and hashes each field so that only the required ones are opened at presentation time[^8].

Hashing converts content into a fixed-length value from which the original cannot be recovered. Salting mixes in a random string first, so identical content produces a different value each time. The credential stores these values, and presentation reveals the plaintext only for the fields required, leaving the rest on the phone. So the question "what extra did I hand over" is genuinely addressed.

What is not addressed is "these two are the same person". Each time the same credential is presented, the issuer's signature, the hashes of all fields, the issuer identifier and the bound holder public key are constant. Two shops comparing the proofs they received, or one shop comparing your two visits, can tell they came from the same credential. Disclosing fewer fields does not help, because that constant set is itself an identifier. This is the wallet's most substantial privacy limitation today.

The specification is blunt about it[^8]:

> SD-JWT only conceals the value of claims that are not revealed. It does not meet the security properties for anonymous credentials. In particular, colluding Verifiers and Issuers can know when they have seen the same credential no matter what fields have been disclosed, even when none have been disclosed.

The established international answer is batch issuance of single-use credentials: the issuer hands over a stack, each one discarded after use, with no correlation between them[^9]. Taiwan's implementation has no such layer[^10]:

- `CredentialRequestDTO` carries only a single `credentialType`, `holderDid`, `holderPublicKey` and `nonce`, with no parameter for how many credentials to issue
- `CredentialService.generate()` returns a single string rather than a list
- Credentials carry an `expirationDate`, which is a validity-period model rather than a use-once model

The official technical page says the wallet "will also support Zero Knowledge Proof technology in future"[^4], which matches the state of the code. Zero-knowledge proofs are the other route: they can prove a condition holds without presenting the signature itself, and linkability disappears once that is achieved.

Zero-knowledge proofs have no mature large-scale deployment in digital identity wallets anywhere, so this is not a Taiwan-specific shortfall. eIDAS 2.0 lists them as an encouraged direction in Recital 14, without binding article text or implementing rules[^19], and the relevant technical specifications are still out for consultation[^11]. The difference is that the EU reduced the impact with batch issuance in the meantime, and the EU's own documentation describes that as only a partial mitigation[^9].

A separate moda project, `tw-did`, bridges the mobile Citizen Digital Certificate (TW FidO) to W3C decentralised identifiers. One of its modes uses Semaphore zero-knowledge proofs, and the README states that neither issuer nor verifier can tell which citizen is involved during verification[^35] — precisely the property the wallet lacks. The two projects share no code. `tw-did` is positioned as a bridge and a research exercise, operating under engineering constraints that differ from a production service, so it is not a template the wallet should simply be held to. It does show that the approach is within the same ministry's field of view.

## The wallet checks who is asking, then lets the request through anyway

When a verifier requests data, the request carries a `client_id` string asserting who it is. Anyone can put any string there, so whether that assertion means anything depends on whether the wallet can confirm the sender really is the entity the string names.

That depends on which kind of identifier the string is[^12]. Some kinds resolve to a public key, letting the wallet demand that the request be signed with the corresponding private key — a signature it can verify is the only thing that counts. Other kinds are just a URL, with no key to check against. Taiwan's server side supports four[^13]:

```java
PRE_REGISTERED("pre-registered")
REDIRECT_URI("redirect_uri")
DID("did")
VERIFIER_ATTESTATION("verifier_attestation")
```

An analogy: someone at your door claims to work for the water utility. `REDIRECT_URI` is a verbal claim and nothing more. `DID` is producing an ID badge whose number can be looked up and which they can prove is theirs. `VERIFIER_ATTESTATION` is that badge additionally countersigned by an authority you trust. `PRE_REGISTERED` is you already holding a list of who is expected.

Those four names come from an earlier OpenID4VP draft. The released 1.0 version renamed the concept to Client Identifier Prefix and changed `did` to `decentralized_identifier`[^12]. Checking against the current specification will not turn up the string `did`; this page follows the code the wallet actually runs.

The endpoints that generate authorization requests and QR codes both hardcode `DID`, with the `REDIRECT_URI` line left commented out in the source[^14]. Using the `DID` form requires the authorization request to be signed, which is a requirement of the OpenID4VP specification rather than an implementation choice[^12]; `VERIFIER_ATTESTATION` requires it too. Against `REDIRECT_URI`, where even request integrity cannot be verified, `DID` is clearly the stronger option.

But a DID proves consistency of identity, not trustworthiness. Anyone can generate a DID for themselves, and the signature only establishes "still the same identity as before". `VERIFIER_ATTESTATION` requires endorsement by a trusted party, an external review layer a bare DID cannot supply. The wallet queries a trust list after obtaining the DID, which plausibly relates to that gap, though the source code does not record the design rationale.

On receiving a request, the wallet looks up the verifier's DID in the trust list[^15]. The problem is what happens after the lookup. The Android string resources read[^16]:

> Please note: the organization you are about to provide data to is not yet on the trust list. We suggest confirming again whether to send the data.

A comment in `KxIdentifierManagerImpl.kt` is more direct[^17]:

> If the error code is 4012 and it is 401i, pop up the trusted-organization warning dialog and continue.

A verifier not on the list triggers a warning dialog, and the user can choose to proceed. The wallet hands the judgement back to the user, and the privacy policy takes the same position: "users should assess for themselves whether to share or disclose personal data to third parties through the mechanisms of the Digital Credential Wallet app"[^7].

The wallet queries the same central service at two different moments, asking different questions. On receiving a credential it asks whether the issuer is currently valid; on presenting one it asks only whether the DID is known[^15]:

| Moment | Condition tested | What is actually checked |
|---|---|---|
| Receiving a credential | `issStatus['data']['status'] == 1` | Whether the issuer's current status is valid |
| Presenting a credential | `issStatus['error'] != null` | Whether the DID is known to the service |

At presentation the check is existence only, with no look at status. A verifier that was registered but whose status is no longer valid triggers no warning at presentation time.

## The trust list's trust anchor is a central service

The official technical page describes how the trust list is stored[^4]:

> We also record the trust list — the roster of trusted credential issuers — on a blockchain, so the list is as though carved in stone, impossible for anyone to forge or tamper with.

What the wallet actually does is send an HTTP request to a central service at `GET {frontUrl}/api/did/{issDID}`[^18]. The published source contains no blockchain code at all; nothing turns up across the Java, Kotlin, Dart or Markdown files.

Public information cannot distinguish between two readings. The blockchain may be a separate component backing that central service, simply not open-sourced alongside the app, or the description may correspond to something else. Neither reading supports concluding that the official statement is untrue.

Whatever sits behind it, what the wallet trusts is that central service. If the service is compromised or compelled to cooperate, being carved in stone protects no one, because the wallet queries the service, never the stone.

## Taiwan suspended a digital identity programme once before

The wallet consistently stresses that it is not a digital ID card, and what was suspended in 2021 was exactly the digital ID card programme. The two turn on the same point of contention.

On 2021-01-21 the Executive Yuan announced suspension of the New eID rollout. Premier Su Tseng-chang set three conditions for resuming[^23]:

> Once the legal framework is complete... once all sectors of society understand it and have been consulted, then proceed... after the Executive Yuan council approves it and the Legislative Yuan completes three readings.

The Control Yuan's investigation report that March found that the Ministry of the Interior's planning had circumvented the existing legal framework and rested on insufficient statutory authority[^28].

The dedicated statute never reached the Legislative Yuan, remaining under internal executive deliberation. By 2024-07-31 the Ministry of the Interior's position was looser than in 2021[^29]:

> Having weighed the policy formation process and the degree of consensus across society, the National Development Council considers that enacting a dedicated statute is not the only option for the digital ID card programme.

The same press release said further progress would wait for the Personal Data Protection Commission to be established, after which policy, information security and legal views would be coordinated across agencies. That Commission is still a preparatory office, its organic act not yet through three readings. See [Taiwan's 2025 data protection overhaul](./taiwan-pdpa-2025.md).

The statute promised in 2021 never reached the legislature, by 2024 the competent authority had recast it as not the only option, and the precondition it named has not been met. Over the same period the Digital Credential Wallet moved from planning into live use in convenience stores.

moda's position is that the two are different things, and official documents repeatedly stress that the wallet issues no digital ID card and is merely a container integrating various digital documents. Technically that distinction holds; the wallet itself issues no identity credential. The contention is that the three conditions set in 2021 were about digital identity as a project, not about one particular document.

## Local debate has concentrated on the legal framework

On 2026-02-09 a statement initiated by the Taiwan Association for Human Rights and co-signed by several civil society organizations set out three demands[^24]:

1. moda should complete the legal framework governing the digital wallet
2. Before legislation exists, conduct personal data impact and human rights risk assessments at each stage of the digital identity programme
3. Implement international principles through institutional means

The wording of the third demand:

> Optimistically imagining that the technology will grow into compliance with international principles on its own.

In November 2024 the Taiwan Association for Human Rights filed a freedom of information request to moda for the staged deliverables of the wallet's design and construction contracts. After several rounds of correspondence, they remained unpublished as of 2026.

The precedent raised repeatedly is Taipei Pass. According to the same statement, between 2021 and early 2022 members of the public reported that basic public services such as borrowing library books required registering for Taipei Pass first[^24]. The most concrete local concern is compulsory use and access barriers, not cryptography.

### A more fundamental criticism points outside the wallet

On 2026-07-06 Radio Taiwan International collected the views of several legal scholars, making an argument that runs deeper than "no statutory basis"[^25].

Wu Chuan-feng, director of the Information Law Center at Academia Sinica's Institutum Iurisprudentiae, argued that decentralised security guarantees risk being formal only, because agencies already routinely link personal data without statutory rules or authorisation, and keep no access logs for accountability. The lawyer Huang Yu-chung pointed out that household registration, tax, vehicle, national health insurance and labour insurance records — all stored separately — can be linked through the Citizen Digital Certificate, and that the basis on which agencies access personal data "is all at the level of administrative orders, not statute". Fanchiang Chen-mei, a retired professor of law at Tunghai University, used M-Police as an example to question the legal basis for the Ministry of the Interior's facial recognition database.

The scholars' criticism complements the technical findings above. Storing credential data on the phone does avoid the single-database risk, but the source records the government already holds have not become any harder to link. The wallet's architecture governs what is handed over at presentation. It does not govern how agencies query each other in the first place.

### The technical community's assessment leans positive

In March 2025 a review in BlockTrend called the wallet a privacy revolution in self-sovereign identity, arguing that selective disclosure gives people precise control over what they share, that adopting W3C standards breaks the isolation between applications, and that data lives on the phone rather than in a central database. It used the analogy of a banknote watermark: the verifier needs no hotline to the issuer, because cryptography alone establishes authenticity[^26]. The same piece recorded reservations, noting that in the short term it suits only simple cases such as convenience store pickup, and that complex systems cannot integrate immediately.

That review also noted that the press conference did not say which blockchain was used. A commentator holding a positive view could not find it either, which corroborates the observation about the trust list above.

A third-party developer built an access-control and visitor-credential flow in a sandbox environment, acting as both issuer and verifier. The README records that selective disclosure works in practice[^27]:

> With the same employee card, only "is this a valid employee" is disclosed; name, date of birth, number of children and other fields all stay inside the wallet.

The same document records friction: required-field constraints in the credential template meant the developer had to fill visitor details into an employee card template as a workaround, and a proper visitor pass layout would require building a new template in the back office. The mechanism is usable, with details still to improve.

## The EU requires different things of the same technology

The EU Digital Identity Wallet uses the same standards as Taiwan. The difference is that eIDAS 2.0 writes several privacy properties into law as obligations, and the technical design follows from them.

EU rules come at three levels of force. Articles bind, recitals are explanatory, and the Architecture and Reference Framework (ARF) is implementation guidance. Each item below is marked with its source level.

On the verifier side, eIDAS 2.0 Article 5b(1) requires that "the relying party shall register in the Member State where it is established", and Article 5b(7) requires Member States to provide a common mechanism for identifying and authenticating relying parties[^19]. Issuance and revocation of the corresponding certificates are set out in Implementing Regulation (EU) 2025/848[^20]. Recital 17 states that registration "should not entail a pre-authorisation process"[^19], so the EU model is "if you want to ask, you must be identifiable and must have declared your purpose" — not a regime where the government approves who may ask.

Over-asking is handled in a high-level requirement in the ARF, a technical document rather than binding text[^22]:

> In a transaction, a wallet solution shall inform the wallet user whenever the wallet-relying party is asking for more information than what they have registered as intended use and the user will have possibility to reject the transaction.

The implementing regulation's recitals carry a weaker version, without the clause giving the user the ability to reject the transaction[^20].

The strongest level applies to unlinkability, in Article 5a(16)[^19]. It requires the technical framework to support privacy-preserving techniques ensuring unlinkability, and prohibits attestation providers from obtaining, after issuance, data that would allow user behaviour to be tracked, linked or correlated, unless the user expressly authorises it.

The four items side by side:

| Item | EU EUDI | Taiwan Digital Credential Wallet |
|---|---|---|
| Verifier registration | Required by article text, with a Member State mechanism for identification and authentication, and no pre-authorisation | Central trust list lookup; a warning when absent, and the user may continue |
| Fields that may be requested | Only those registered with a declared purpose; the wallet must inform the user of excess. Detail sits in the ARF | No corresponding mechanism found |
| Unlinkability | Required by Article 5a; implementations partly mitigate via batch issuance of single-use credentials | No batch issuance; zero-knowledge proofs stated as future work |
| Issuer must not track | Prohibited by Article 5a | No call back to the issuer on presentation; achieved technically |

One match, one weaker, two with no counterpart.

## The three answers

The conclusions to the three questions set out at the start:

| Question | Answer | Basis |
|---|---|---|
| Can the issuer see when and where you present? | No | No call back to the issuer on presentation; revocation is checked against a list shared by ~130,000 credentials |
| Can different verifiers link you? | Yes | No batch issuance of single-use credentials, the SD-JWT signature is constant, zero-knowledge proofs are future work |
| Who can require you to present? | Checked, but not blocked | `client_id` uses the `DID` form so the wallet can resolve the requester's public key; absence from the trust list produces a warning (error code `4012`) and the flow continues |

The three answers differ. Asking the undifferentiated question "is the wallet safe" returns all three blurred together.

## How far the technology goes depends on whether anyone requires it

Those four EU properties originate in law. eIDAS 2.0 wrote them as obligations first, and implementations followed. Taiwan has no equivalent legal requirement, which is exactly what civil society groups are criticising.

The gap is therefore not engineering capability. Batch issuance of single-use credentials is an off-the-shelf approach, registering verifier purposes is a mechanism anyone can write, and the EU's implementations are in public repositories. What differs is whether a document requires it, and who can assert a right when it is not delivered.

## What to take from this case

### For readers outside Taiwan

The architectural fork is the durable lesson. Holder presentation versus identity provider is decided early, is expensive to reverse, and determines whether a government can observe every verification. Taiwan and South Korea took one branch; Singapore took the other. That choice is worth examining in any jurisdiction debating national digital identity, and it is separable from any particular country's politics.

The second lesson is about the limits of standards adoption. Taiwan implemented the same specifications the EU uses and landed in a materially different place on three of four privacy properties. Conformance to W3C and OpenID specifications is not, on its own, a privacy guarantee. The properties that made it into Taiwan's implementation are the ones the specifications make natural; the ones that did not are the ones the EU had to compel.

### For readers in Taiwan

For one-off, low-risk situations such as convenience store pickup, the limitations listed here have limited effect. Linkability risk accumulates when the same credential is presented repeatedly to multiple verifiers, and collecting a parcel differs little from showing a physical document to a clerk. Anyone preferring caution can keep carrying physical documents; the wallet is currently an additional option.

The range of documents the wallet can hold and the situations it covers are both expanding. The more often the same credential is used, and the more varied the settings, the more complete the linkable profile becomes.

The warning dialog at presentation is currently the only gate the user controls, and the flow continues once it is dismissed. "Not yet on the trust list" means the requesting party is not registered.

Keep two things apart: which fields were handed over, and whether you were recognised as the same person. Selective disclosure addresses the first. The second has no mechanism at present, and situations requiring anonymity fall outside the wallet's design goals.

## Limits of this page

All conclusions come from published source code and official documents. The app's network behaviour was not tested empirically. The official FAQ states that the app uses GuardSquare DexGuard for anti-static and anti-dynamic analysis protection[^21], so whether the binary running on a phone corresponds to this source has not been independently verified. Publishing source and hardening the shipped build are compatible positions, and for anyone wanting to check for themselves the two mean different things.

The relationship between the central trust list service and a blockchain is likewise unresolved. Sources reviewed include the wallet's technical introduction, FAQ, privacy policy and policy pages, the in-app terms of use, the entire `TWDIW-official-app` source, every public repository under the `moda-gov-tw` organization, and Chinese-language media coverage. The terms of use contain the same sentence, worded identically to the technical introduction, with no further detail. Which chain, how it is anchored, and who operates it are not explained anywhere within that scope.

This page did not put these findings to moda for comment; every official position quoted comes from existing public pages. The trust list discrepancy in particular deserves an official explanation. Stopping at "public information cannot distinguish" does not mean there is no answer, only that this page did not ask the question.

## Related

- [Taiwan's 2025 data protection overhaul](./taiwan-pdpa-2025.md) tracks the legal framework whose absence is the substance of the local criticism here.
- [What is a passkey](../tools/what-is-passkey.md) covers the same cryptographic building blocks in a consumer authentication setting.
- [Multiple identities](../basics/multiple-identities.md) covers the linkability problem in general terms.
- [Regional Observatory](./index.md) sets this alongside the other jurisdictions we track.

The Chinese-language version of this page is at [數位憑證皮夾保護了什麼](https://anoni.net/docs/taiwan/digital-wallet-privacy/){target="_blank"}, which quotes the Chinese sources in their original wording.

If you have official clarification on the trust list's blockchain component, or measurements of the app's network behaviour, the channels on the [Community services](../community/tools.md) page reach us and we will update this page.

[^1]: [moda holds a press conference on the Digital Credential Wallet trial operation and application experience](https://moda.gov.tw/press/press-releases/18262){target="_blank"} - Ministry of Digital Affairs, 2025-12-17 (in Chinese)
[^2]: [The digital wallet lacks legal protection for fundamental rights and will become the next Taipei Pass](https://www.amnesty.tw/node/23762){target="_blank"} - Amnesty International Taiwan (in Chinese)
[^3]: [moda-gov-tw/TWDIW-official-app](https://github.com/moda-gov-tw/TWDIW-official-app){target="_blank"} - Ministry of Digital Affairs, MIT licence
[^4]: [Technical introduction](https://wallet.gov.tw/zh-tw/Developer.html){target="_blank"} - Digital Credential Wallet official site (in Chinese)
[^5]: [Token Status List](https://datatracker.ietf.org/doc/draft-ietf-oauth-status-list/){target="_blank"} - IETF OAuth working group, Privacy Considerations section. See also [Bitstring Status List](https://www.w3.org/TR/vc-bitstring-status-list/){target="_blank"} - W3C
[^6]: [`StatusListPrepareTask.java`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/core-system/twdiw-vc-handler/src/main/java/gov/moda/dw/issuer/vc/task/StatusListPrepareTask.java){target="_blank"} - TWDIW-official-app
[^7]: [Privacy policy](https://wallet.gov.tw/zh-tw/privacyPolicy.html){target="_blank"} - Digital Credential Wallet official site (in Chinese)
[^8]: [RFC 9901 Selective Disclosure for JSON Web Tokens (SD-JWT)](https://www.rfc-editor.org/rfc/rfc9901.html){target="_blank"} - IETF, section 10.1 Unlinkability
[^9]: [Re-issuance and batch issuance of PIDs and attestations](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/discussion-topics/b-re-issuance-and-batch-issuance-of-pids-and-attestations.md){target="_blank"} - EU Digital Identity Wallet ARF discussion topic, describing batch issuance as partly mitigating Relying Party linkability
[^10]: [`CredentialRequestDTO.java`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/core-system/twdiw-vc-handler/src/main/java/gov/moda/dw/issuer/vc/service/dto/CredentialRequestDTO.java){target="_blank"} and [`CredentialService.java`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/core-system/twdiw-vc-handler/src/main/java/gov/moda/dw/issuer/vc/service/CredentialService.java){target="_blank"} - TWDIW-official-app
[^11]: [G - Zero Knowledge Proof](https://eudi.dev/latest/discussion-topics/g-zero-knowledge-proof/){target="_blank"} - EU Digital Identity Wallet discussion topic
[^12]: [OpenID for Verifiable Presentations 1.0](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html){target="_blank"} - OpenID Foundation, Client Identifier Prefix section
[^13]: [`ClientIdScheme.java`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/core-system/twdiw-oid4vp-handler/src/main/java/gov/moda/dw/verifier/oidvp/model/oid4vp/ClientIdScheme.java){target="_blank"} - TWDIW-official-app
[^14]: [`OidvpEndpointController.java`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/core-system/twdiw-oid4vp-handler/src/main/java/gov/moda/dw/verifier/oidvp/web/rest/oidvp/OidvpEndpointController.java){target="_blank"} - TWDIW-official-app
[^15]: [`openid_vc_vp.dart`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/APP/APPSDK/lib/openid_vc_vp.dart){target="_blank"} - TWDIW-official-app
[^16]: [`sdk_error_code.xml`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/APP/moda-digitalwallet-holder-androidapp/app/src/main/res/values/sdk_error_code.xml){target="_blank"} - TWDIW-official-app
[^17]: [`KxIdentifierManagerImpl.kt`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/APP/moda-digitalwallet-holder-androidapp/app/src/main/java/tw/gov/moda/digitalwallet/core/identifier/KxIdentifierManagerImpl.kt){target="_blank"} - TWDIW-official-app
[^18]: [`http_service.dart`](https://github.com/moda-gov-tw/TWDIW-official-app/blob/99e9deb105b6bbd7d3bc103ab68d0417eb7e5767/APP/APPSDK/lib/http_service.dart){target="_blank"} - TWDIW-official-app
[^19]: [Regulation (EU) 2024/1183](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202401183){target="_blank"} - eIDAS 2.0. Article 5a(16) unlinkability, Article 5b(1) and 5b(7) relying party registration, Recital 14 zero-knowledge proofs, Recital 17 no pre-authorisation
[^20]: [Commission Implementing Regulation (EU) 2025/848](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202500848){target="_blank"} - issuance and revocation of access certificates; Recital 10 is the counterpart provision on over-asking
[^21]: [FAQ](https://wallet.gov.tw/zh-tw/qa.html){target="_blank"} - Digital Credential Wallet official site (in Chinese)
[^22]: [X relying party registration](https://eudi.dev/latest/discussion-topics/x-relying-party-registration/){target="_blank"} - EU Digital Identity Wallet Architecture and Reference Framework discussion topic, high-level requirement 8
[^23]: [Digital ID card issuance programme suspended; Premier Su: resume once the legal framework is complete](https://www.ey.gov.tw/Page/9277F759E41CCD91/e80e55a2-0102-4031-b6d3-a7c40f4cac6a){target="_blank"} - Executive Yuan, 2021-01-21 (in Chinese)
[^24]: [Joint statement: the digital wallet lacks legal protection for fundamental rights and will become the next Taipei Pass](https://www.tahr.org.tw/news/3845){target="_blank"} - Taiwan Association for Human Rights, 2026-02-09 (in Chinese)
[^25]: [Can the digital wallet resolve privacy concerns? Scholars: vague regulation is the root problem in Taiwan's data governance](https://tw.news.yahoo.com/%E6%95%B8%E4%BD%8D%E7%9A%AE%E5%A4%BE%E8%83%BD%E8%A7%A3%E9%9A%B1%E7%A7%81%E7%96%91%E6%85%AE-%E5%AD%B8%E8%80%85-%E6%B3%95%E8%A6%8F%E6%A8%A1%E7%B3%8A%E6%89%8D%E6%98%AF%E5%8F%B0%E7%81%A3%E8%B3%87%E6%96%99%E6%B2%BB%E7%90%86%E6%A0%B9%E6%9C%AC%E5%95%8F%E9%A1%8C-082000055.html){target="_blank"} - Radio Taiwan International, 2026-07-06 (in Chinese)
[^26]: [The Digital Credential Wallet: a new way to present documents, a privacy revolution in self-sovereign identity](https://www.blocktrend.today/p/676){target="_blank"} - BlockTrend, 2025-03-12 (in Chinese)
[^27]: [did-usecase-visitor](https://github.com/kkdai/did-usecase-visitor){target="_blank"} - sandbox example project by a third-party developer
[^28]: [Control Yuan investigation report 110-Nei-Tiao-0010](https://www.cy.gov.tw/CyBsBox.aspx?CSN=1){target="_blank"} - Control Yuan, published 2021-03-18 (in Chinese)
[^29]: [For a more comprehensive digital ID card policy, cross-agency coordination awaits the establishment of the Personal Data Protection Commission](https://www.moi.gov.tw/News_Content.aspx?n=8&s=318494){target="_blank"} - Ministry of the Interior, 2024-07-31 (in Chinese)
[^30]: [Digital Credential Wallet](https://moda.gov.tw/major-policies/wallet/1695){target="_blank"} - Ministry of Digital Affairs key policy page (in Chinese)
[^31]: [The Digital Credential Wallet builds a cornerstone of trust for the digital environment](https://www.ithome.com.tw/news/173833){target="_blank"} - iThome, programme timeline and budget (in Chinese)
[^32]: [Singpass API Introduction](https://docs.developer.singpass.gov.sg/docs/introduction){target="_blank"} - Singpass official developer documentation
[^33]: [Japanese Public Key Infrastructure (JPKI)](https://www.digital.go.jp/en/policies/mynumber/private-business/jpki-introduction){target="_blank"} - Digital Agency, Japan
[^34]: [Digital ID card applying blockchain-based DID technology](http://www.boannews.com/media/view.asp?idx=97149){target="_blank"} - Boan News, on the Korean Ministry of the Interior and Safety's mobile ID being based on blockchain DID (in Korean)
[^35]: [moda-gov-tw/tw-did](https://github.com/moda-gov-tw/tw-did){target="_blank"} - Ministry of Digital Affairs, bridging TW FidO to W3C DIDs, with a Semaphore zero-knowledge proof mode
