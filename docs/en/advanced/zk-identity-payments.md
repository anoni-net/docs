---
title: Zero-Knowledge Identity and Payments
description: From Monero's ring signatures and Zcash's zk-SNARKs to what chain analysis can and cannot do, extended to zero-knowledge identity in private KYC, selective disclosure, and anonymous donations.
icon: material/shield-key-outline
---

# :material-shield-key-outline: Zero-Knowledge Identity and Payments

On-chain privacy is a misleading phrase. Bitcoin's ledger is entirely public, with every transaction and every address balance available to anyone, which is one extreme. Zcash's shielded transactions hide even the amount, which is the other. Most cases sit in between: addresses obscured, amounts hidden, and the graph still inferable. This page separates on-chain privacy into a visibility spectrum, covers the two main approaches taken by Monero and Zcash, sets out what chain analysis can and cannot do, and extends to zero-knowledge identity in payment settings.

## The visibility spectrum

An observer watching a chain sees four layers:

1. **Accounts**: who holds which address. Public on Bitcoin, hidden on Monero through stealth addresses
2. **Amounts**: how much moved. Public on Bitcoin, hidden on Monero through RingCT, entirely hidden in Zcash shielded transactions
3. **Transaction graph**: the path of transfers between parties. Fully reconstructible on Bitcoin, obscured on Monero through ring signatures with decoys, invisible in Zcash shielded transactions
4. **Metadata**: which IP address, which wallet client, and what time a transaction was broadcast from. Every chain depends on privacy at the peer-to-peer layer, whether through Tor or a protocol such as Dandelion++ that scatters the broadcast path to hide the origin

Privacy-focused designs generally hide some of these four layers rather than all of them, and designs covering all four are rare. Monero and Zcash chose different combinations.

## How Monero does it

Monero's design comes from the 2013 CryptoNote whitepaper, with three mechanisms:

- **Stealth addresses**: each transaction generates a fresh one-time receiving address, so the chain never shows that a particular person's address received an amount, only that a one-time address did. The recipient identifies which one-time addresses are theirs using their own private key
- **Ring signatures**: the sender's real signature is mixed with decoys drawn from past transaction outputs. An observer can establish that one of the outputs in the ring is real without establishing which. Monero's current default ring size is 16
- **RingCT (ring confidential transactions)**: Pedersen commitments, a form of homomorphic commitment allowing sums to be verified without revealing the numbers, hide the amounts, with Bulletproofs+ range proofs ensuring each amount is non-negative and the whole proving that inputs equal outputs so no money is created

<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/diagrams/monero-ring.zh-TW.drawio.svg" alt="A Monero ring signature: the sender's real signature mixed among 15 decoys for a ring size of 16, where an observer can verify that one of the 16 is genuine without determining which">
</figure>

Together, what appears on the chain is that a one-time address received a hidden amount, sent by one of 16 possible senders. There is no notion of named parties. Against the four layers, stealth addresses cover accounts, RingCT covers amounts, ring signatures obscure the graph, and metadata still needs Tor.

The costs are a larger blockchain, heavier verification, and transactions that are difficult to reconcile with know-your-customer requirements. Exchanges requiring KYC began delisting Monero from 2021, with the largest wave across 2023 and 2024, including Binance, OKX, and Kraken in Europe[^1].

## How Zcash does it

Zcash takes a more radical route. A shielded transaction uses zk-SNARKs, a cryptographic construction proving that you know a secret without revealing the secret, to prove that:

- You are authorized to spend this note
- The new notes you create sum to the notes you consumed
- Nothing is being double-spent

<figure markdown="span">
    <img class="brand-frame" src="https://assets.anoni.net/diagrams/zcash-shielded.zh-TW.drawio.svg" alt="A Zcash shielded transaction: sender and recipient connected through a zk-SNARK proof. Visible on chain are the proof, nullifier, commitment, and fee. Not visible are the sender address, recipient address, amount, and graph relationship">
</figure>

The whole proof occupies only a few hundred bytes on chain, and the verifier needs neither the amount nor the addresses nor the source. What the chain shows is that a shielded transaction occurred. Against the four layers, one shielded transaction covers accounts, amounts, and graph, with metadata again left to the network layer.

Zcash has been through several generations of zk-SNARK:

- **Sprout** (2016): required a trusted setup[^2]
- **Sapling** (2018): moved to Groth16, with a smaller trusted setup and substantially better performance
- **Halo 2** (activated with the NU5 upgrade in May 2022): removed the need for a trusted setup entirely, which is a significant piece of cryptographic engineering

Zcash's long-running problem has been usage. The shielded pool saw far fewer users than the transparent pool for years, and most transactions remained transparent. The shielded share has risen noticeably since 2025 without becoming universal. However good the cryptographic guarantee, without enough shielded traffic to blend into, analysis remains a risk.

## What chain analysis can and cannot do

Chain analysis is an industry built around tracing cryptocurrency flows for governments and financial institutions, with firms such as Chainalysis, Elliptic, and TRM Labs turning on-chain data into intelligence that supports prosecution, freezing, and tracing. What they publicly claim:

**Achievable**:

- Full graph reconstruction on Bitcoin, clustering addresses belonging to the same entity across many transactions
- Matching against labelled addresses for known exchanges, mixing services, and darknet markets
- Boundary analysis on Zcash, where the shielded pool's interior is invisible while amounts and times entering and leaving it are not
- Partial recovery on Monero from the era of small ring sizes. After the ring size rose to 11 and then 16, the difficulty of known probabilistic methods increased substantially[^3]

**Not achievable**:

- Identifying the true sender on Monero with certainty at the current ring size. Probabilistic work does better than chance: Monero's own OSPEAD research published in April 2025 found a decoder that identifies the real spend roughly one time in four against the one in sixteen a random guess would give, which is a meaningful erosion of the guarantee without being identification
- Recovering fully shielded Zcash transactions
- Activity that never reaches a public chain, such as direct peer-to-peer trades or the interior of payment channels

The effectiveness of blending depends on how many people are doing it. When everyone uses the shielded pool, the anonymity set is large and analysis is extremely difficult. When only a few do, using it is itself a flag.

Chain analysis has boundaries, and compliance requirements do not go away. Separating proving that you comply from disclosing who you are is exactly where zero-knowledge proofs apply to identity.

## Zero-knowledge identity proves an attribute without revealing it

zk-SNARKs are not limited to payments. Applied to identity, they produce a capability that did not previously exist: proving you have an attribute without revealing its value.

For example:

- **Proof of age**: proving you are over 18 without revealing your date of birth
- **Proof of citizenship**: proving you hold a particular citizenship without revealing an identity number
- **Proof of uniqueness**: proving you are a distinct human rather than a bot, without revealing which human

Systems in development:

- **World ID**: uses an iris scan to generate a uniqueness credential, with the user proving personhood through a zero-knowledge proof rather than revealing the iris data
- **Privado ID**, formerly Polygon ID: built on the Iden3 framework, turning verifiable credentials issued by governments, banks, and healthcare institutions into zero-knowledge proofs
- **Anon Aadhaar**: a zero-knowledge wrapper around India's national identity system, letting a user prove they hold a valid credential without revealing the number

Maturity varies widely. Polygon ID has the most complete ecosystem and requires decentralized identifier infrastructure. Anon Aadhaar serves one national system. World ID is the most general and its iris scanning is the most contested. Taiwan currently has no equivalent local service.

What these share is separating "I prove X" from "I disclose X to you". Traditional know-your-customer is handing over a passport copy and letting the other party decide whether to trust it. Zero-knowledge identity is handing over a proof they can verify without obtaining the underlying data.

## What this could do for payments

- **Private KYC**: proving a transaction comes from a KYC-verified individual without revealing which individual. Compliance for the exchange, identity protection for the user
- **Selective disclosure to regulators**: during an audit, disclosing specific attributes while everything else stays private
- **Anonymous donations**: a donor proving they donated a lawful, deductible amount without revealing themselves, protecting the donor while the organization can still account for the total to regulators
- **Salary privacy**: an employee proving eligibility for a grant-funded stipend without revealing their salary

Clean in theory, and the practical bottleneck is that the verifier has to trust the underlying zero-knowledge system. Trusted setups, implementation bugs, and the long-term quantum threat to elliptic curves are all risks to manage.

## What this looks like across the region

### Taiwan

The [Virtual Asset Service Act](../regional/taiwan-vasp-2026.md) pushes KYC and the Travel Rule down to the exchange level. It passed the Executive Yuan in April 2026, cleared committee review in June, and passed its third reading on 30 June 2026, with the commencement date still to be set by the Executive Yuan[^4]. Three effects on private payments:

1. **Exchanges**: local platforms offering privacy features such as Monero or Zcash shielded transactions face clear regulatory pressure, and delisting or restriction is likely
2. **Users**: holding privacy coins through decentralized exchanges or peer-to-peer remains open, and converting to and from local currency narrows
3. **Advocacy organizations**: an NGO accepting crypto donations has to balance donor anonymity against accounting disclosure. A group wanting to accept Monero donations to protect its funders will find most local exchanges have already delisted it, leaving overseas platforms or peer-to-peer conversion, and accounting for the total to regulators becomes awkward. Zero-knowledge identity could become an option here, where a donor proves a lawful deductible amount while the organization still discloses the total, and the ecosystem is not there yet

### Hong Kong

The framework and the risk level are different. Virtual asset trading platform licensing has been in force since June 2023 under the Anti-Money Laundering and Counter-Terrorist Financing Ordinance, administered by the Securities and Futures Commission, with fiat-referenced stablecoin issuance licensed separately by the Monetary Authority since August 2025. Retail users can only trade eligible tokens on licensed platforms, and privacy coins conflict with anti-money-laundering and KYC requirements to the point of being practically unlistable[^hk].

The core risk for donation-based advocacy there is not the payment mechanism. It is that the purpose of the funds may itself be characterized as endangering national security. In the case of the 612 Humanitarian Relief Fund, which supported people arrested during the 2019 protests, the fund was investigated and ceased operating. Five trustees, among them Cardinal Joseph Zen, were arrested under Article 29 of the National Security Law, and six defendants were ultimately convicted under the Societies Ordinance for failing to register the fund, with fines rather than custodial sentences. An appeal was argued in December 2025 and judgment is pending. What zero-knowledge identity offers is keeping a donor's identity out of records that a security investigation could later reach. What it cannot do is address the characterization of the funds themselves, and no amount of clean technology substitutes for a legal risk assessment.

### Mainland China

Crypto business activity is comprehensively banned, which puts the question outside the regulatory frame entirely rather than inside a stricter version of it.

For why anonymous payments matter to advocacy work generally, see [why anonymous payments matter](../basics/payments-anonymity.md). The community tracks this area in the [anonymous payments track](../community/payments-research.md).

## :material-chat-question: Related concepts

<div class="grid cards" markdown>

- [:material-cash-multiple: Why anonymous payments matter](../basics/payments-anonymity.md)
- [:material-currency-btc: The cryptocurrency privacy spectrum](../tools/crypto-privacy-spectrum.md)
- [:material-key-chain-variant: How end-to-end encryption works](./e2ee.md)
- [:material-atom-variant: Post-quantum cryptography](./post-quantum.md)

</div>

## :fontawesome-solid-diagram-project: Where to go next

<div class="grid cards" markdown>

- [:material-cash-multiple: Anonymous payments track](../community/payments-research.md)
- [:material-scale-balance: Taiwan's 2026 Virtual Asset Service Act](../regional/taiwan-vasp-2026.md)
- [:material-handshake-outline: Anonymous donations for advocacy organizations](../scenarios/nonprofit-anonymous-donation.md)

</div>

[^1]: [Monero, Zcash and other privacy coins face delisting wave](https://www.coinspeaker.com/monero-xmr-zcash-zec-privacy-coins-delisting/){target="_blank"}, Coinspeaker
[^2]: [Zcash Counterfeiting Vulnerability Successfully Remediated](https://electriccoin.co/blog/zcash-counterfeiting-vulnerability-successfully-remediated/){target="_blank"}, Electric Coin Company
[^3]: [The rise of Monero: traceability challenges and research review](https://www.trmlabs.com/resources/blog/the-rise-of-monero-traceability-challenges-and-research-review){target="_blank"}, TRM Labs
[^4]: [Executive Yuan approves the draft Virtual Asset Service Act](https://www.ey.gov.tw/Page/9277F759E41CCD91/bfd446a7-ce23-4308-9347-9ce6e6c44196){target="_blank"} (in Chinese)
[^hk]: On Hong Kong's virtual asset trading platform licensing regime in force since June 2023, see [New Hong Kong Regulatory Requirements and Licensing Regime for Virtual Asset Trading Platforms](https://www.gibsondunn.com/wp-content/uploads/2023/06/new-hong-kong-regulatory-requirements-and-licensing-regime-for-virtual-asset-trading-platforms-finalised-as-legislation-takes-effect.pdf){target="_blank"}, Gibson Dunn, and the [list of licensed platforms](https://www.sfc.hk/en/Welcome-to-the-Fintech-Contact-Point/Virtual-assets/Virtual-asset-trading-platforms-operators/Lists-of-virtual-asset-trading-platforms){target="_blank"}, SFC. On the humanitarian fund case, see [Cardinal Zen and 4 others appeal against conviction over failing to register protester relief fund as society](https://hongkongfp.com/2022/12/14/cardinal-zen-and-4-others-appeal-against-conviction-over-failing-to-register-protester-relief-fund-as-society/){target="_blank"}, Hong Kong Free Press.
