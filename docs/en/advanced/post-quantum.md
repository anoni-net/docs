---
title: Post-Quantum Cryptography
description: The NIST standards ML-KEM, ML-DSA, and SLH-DSA, the harvest-now-decrypt-later threat model, and where browsers, cloud providers, and messaging applications have got to in migrating.
icon: material/atom-variant
---

# :material-atom-variant: Post-Quantum Cryptography

Post-quantum cryptography (PQC) turns on three questions: whether current cryptography will be broken by quantum computers within the next decade, when that happens, and which algorithms to migrate first. A quantum computer large enough to break RSA and elliptic curves in practice is still some way off, and the threat of recording traffic now to decrypt later means migration cannot wait for that day. NIST finalized the first post-quantum standards in 2024, and browsers, TLS libraries, and the Signal Protocol have begun adopting them.

## Harvest now, decrypt later

Harvest now, decrypt later (HNDL) is the motivation behind the whole migration. An attacker records your encrypted traffic today, stores it, and years from now, with a large quantum computer, uses Shor's algorithm to break the key exchange and recover everything they recorded. Shor's algorithm factors large numbers quickly on a quantum computer, breaking RSA and elliptic curves, and does not work on the computers we have.

Who does this threat actually apply to?

- **Data with long-lived value**: government secrets, medical records, commercial intelligence, and long-term identifiers such as passport and national identity numbers
- **Attackers with storage capacity**: state intelligence agencies, with facilities such as the NSA's Bluffdale data centre widely assumed to be used this way
- **Content that cannot be re-encrypted today**: once ciphertext has left, it cannot be recalled, so future decryption is a certainty rather than a risk

For personal real-time chat and short-lived session tokens, HNDL risk is low, since the content expires. For financial identity documents, medical imaging, and a human rights worker's interview records, it is high.

NIST's IR 8547, still an initial public draft, proposes deprecating the old algorithms in 2030 and disallowing them by 2035, with the deprecation date applying to 112-bit security and the 2035 date applying across the board. ENISA's roadmap works to the same two years, and the NSA's CNSA 2.0 sets its own deadlines of 2030 and 2033[^1]. That timeline means new deployments should be planning a PQC path now.

<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/diagrams/pq-timeline.zh-TW.drawio.svg" alt="Post-quantum migration timeline: Signal PQXDH in 2023, NIST FIPS standards and browser rollout in 2024, major systems expected to complete migration between 2030 and 2035, hard deadline for legacy cryptography by 2040">
</figure>

## The three 2024 NIST standards

NIST opened its PQC competition in 2016, made preliminary selections in 2022, and published the FIPS standards in August 2024.

### ML-KEM (FIPS 203), key encapsulation

- Module-Lattice-based Key Encapsulation Mechanism, resting on lattice problems, a mathematical structure that is also hard for quantum computers
- Derived from CRYSTALS-Kyber
- Replaces RSA-OAEP and ECDH for key exchange in TLS, SSH, and encrypted messaging
- Public keys run 800 bytes at ML-KEM-512, 1,184 bytes at ML-KEM-768, and 1,568 bytes at ML-KEM-1024, all larger than X25519's 32 bytes. Packets grow slightly with no perceptible effect on ordinary connection speed, and the operations are fast and amenable to hardware acceleration

### ML-DSA (FIPS 204), digital signatures

- Module-Lattice-based Digital Signature Algorithm, derived from CRYSTALS-Dilithium
- Replaces RSA-PSS and ECDSA in certificates, software signing, and blockchains
- Signatures run roughly 2.4 to 4.6 KB depending on security level, against ECDSA's 64 bytes

### SLH-DSA (FIPS 205), hash-based signatures

- Stateless Hash-based Digital Signature Algorithm, derived from SPHINCS+
- A fallback for ML-DSA, with security resting only on the collision resistance of hash functions, which is the most conservative mathematical basis available
- Signatures run roughly 8 to 50 KB depending on parameter set, and signing is slow, which suits long-lived certificates rather than high-frequency signing

NIST's fourth round continued evaluating code-based algorithms as a long-term fallback, selecting HQC in March 2025 as a backup KEM to ML-KEM. It is selected rather than standardized, with the draft standard expected around 2027. The only isogeny-based candidate, SIKE, was broken and withdrawn in 2022[^2]. In the near term, ML-KEM with ML-DSA is what the industry is deploying.

## Where real systems have got to

### Browsers and TLS

- **Chrome 124** (April 2024): the draft X25519Kyber768Draft00 hybrid on by default, replaced by the standardized X25519MLKEM768 in **Chrome 131** (November 2024). The two use different TLS code points and are not wire-compatible, which is worth knowing when reading older coverage
- **Firefox 132** (October 2024): X25519MLKEM768 on by default
- **Safari**: following

Hybrid means performing both a classical ECDH exchange and an ML-KEM exchange and combining the results. If ML-KEM turns out to have a flaw, classical ECDH still protects the connection. This is the industry's standard insurance policy.

### Cloud providers

- Cloudflare has enabled post-quantum key agreement for inbound connections to sites behind it since 2022, added it for connections onward to customer origins in 2023, and completed the move from draft Kyber to standardized ML-KEM in 2024[^3]. It is among the most aggressive deployments anywhere
- AWS enabled ML-KEM for TLS connections to KMS, ACM, and Secrets Manager in April 2025[^4]
- Google Cloud offers PQC options to enterprise customers

### Signal Protocol

Signal published PQXDH (post-quantum extended Diffie-Hellman) in 2023, adding post-quantum key encapsulation to the key exchange, initially CRYSTALS-Kyber and later ML-KEM. It leaves forward secrecy and post-compromise security unchanged, adding the PQC layer at the initial handshake. This is the most direct answer to HNDL available to an ordinary user.

### SSH and PGP

OpenSSH 9.0 (2022) added the `sntrup761x25519` hybrid, and 9.9 (2024) added an ML-KEM hybrid. Newer tools such as age and Sequoia PGP have begun experimenting with PQC, while traditional GnuPG has moved more slowly.

### Blockchains

Bitcoin's ECDSA and Schnorr signatures are not secure against a large quantum computer, with the practical threat depending on when one exists. Ethereum has proposals discussing post-quantum signature options at a low priority for now. The zero-knowledge proof systems in privacy coins such as Zcash and Monero face their own migration.

## What individuals and organizations need to do

Handled for you already:

- Messaging through Signal and Matrix, where the change is invisible to users
- Ordinary web browsing in Chrome and Firefox, likewise

Needing active planning:

- **Enterprise PKI and certificates**: certificates used for signing, authentication, and long-term attestation need an ML-DSA or SLH-DSA path. The CA/Browser Forum has begun discussing PQC certificate standards
- **VPN and IPsec**: commercial VPN support for PQC is inconsistent and belongs in the evaluation when planning a corporate network
- **Long-term document encryption**: legal documents, medical records, and research data need the question asked directly, whether this document still has to be confidential in ten years. If yes, encrypt it with PQC
- **Hardware security modules**: HSMs in finance and healthcare depend on vendors shipping PQC algorithms, and the refresh cycle is long

## What this looks like across the region

Regulatory timelines here largely follow NIST and ENISA.

**Taiwan**: the Financial Supervisory Commission published post-quantum migration guidance for the financial sector in June 2026, following a pilot group that built the technical inventory. Formal regulatory requirements are not yet scheduled, and no agency has published a timeline for government communications generally. Healthcare may be the sector with the most immediate need, since the Medical Care Act requires records to be kept for at least seven years and imaging and follow-up data often considerably longer, which is precisely the profile HNDL targets.

**Hong Kong**: the Monetary Authority published a quantum readiness white paper and index in July 2026. The Securities and Futures Commission is the other relevant regulator, and retention rules for medical and financial records differ from Taiwan's.

**Singapore**: the Monetary Authority issued an advisory on quantum risk to financial institutions in February 2024, which was the region's first. It is advisory rather than mandatory and sets no deadline.

Across jurisdictions, the transferable judgement stays the same: follow the NIST and ENISA timelines, and handle the long-lived data with high HNDL exposure first.

For individuals and ordinary organizations, there is no urgency to deploy PQC by hand. Three things are worth doing:

- Use tools that will migrate to PQC on their own, which browsers, Signal, and major cloud providers already are
- Inventory your long-term confidential data and prioritize whatever carries real HNDL exposure
- Include a PQC roadmap in evaluations when buying hardware or SaaS

Related cryptographic background is in [how end-to-end encryption works](./e2ee.md) and [zero-knowledge identity and payments](./zk-identity-payments.md).

## :material-chat-question: Related concepts

<div class="grid cards" markdown>

- [:material-key-chain-variant: How end-to-end encryption works](./e2ee.md)
- [:material-shield-key-outline: Zero-knowledge identity and payments](./zk-identity-payments.md)
- [:material-web-box: Decentralized website publishing](./dweb-ipfs-onion.md)
- [:material-shield-account-outline: How to build a threat model](../basics/threat-model.md)

</div>

## :fontawesome-solid-diagram-project: Where to go next

<div class="grid cards" markdown>

- [:material-translate-variant: Localization and translation](../community/i18n.md)
- [:material-newspaper-variant-outline: Protecting your sources as a journalist](../scenarios/journalist.md)
- [:material-account-edit-outline: Digital preparation for activists](../scenarios/activist.md)

</div>

[^1]: [NIST IR 8547: Transition to Post-Quantum Cryptography Standards](https://nvlpubs.nist.gov/nistpubs/ir/2024/NIST.IR.8547.ipd.pdf){target="_blank"}, NIST
[^2]: [NIST IR 8545: Status Report on the Fourth Round of the PQC Standardization Process](https://nvlpubs.nist.gov/nistpubs/ir/2025/NIST.IR.8545.pdf){target="_blank"}, NIST
[^3]: [Post-quantum cryptography for all](https://blog.cloudflare.com/post-quantum-for-all/){target="_blank"}, Cloudflare
[^4]: [ML-KEM post-quantum TLS now supported in AWS KMS, ACM, and Secrets Manager](https://aws.amazon.com/blogs/security/ml-kem-post-quantum-tls-now-supported-in-aws-kms-acm-and-secrets-manager/){target="_blank"}, AWS
[^5]: Reported by iThome on the Financial Supervisory Commission's 2026 information security priorities, [金管會 2026 年六大資安重點](https://www.ithome.com.tw/news/173594){target="_blank"} (in Chinese)
