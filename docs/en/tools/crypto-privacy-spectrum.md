---
title: The cryptocurrency privacy spectrum
description: Where Bitcoin, Ethereum, stablecoins, Zcash, and Monero sit on a transparency-to-privacy axis, and why the on-ramp, not the chain, usually deanonymizes you.
icon: material/currency-btc
---

# :material-currency-btc: The cryptocurrency privacy spectrum

"Just pay in crypto" is a common piece of advice for someone who wants to donate to an advocacy group without it showing up on a bank statement, or move value across a border that the banking system won't carry. The advice treats "crypto" as one thing. It is not. The privacy gap between Bitcoin and Monero is about as wide as the gap between a public billboard and a sealed envelope, and most people never told which one they are using.

There is no neutral place that lays these assets out side by side. Privacy Guides covers Monero well and stops there, because for its threat model that is the honest answer. The "X versus Y coin" results that fill a search are mostly exchange marketing. This page builds the axis the comparison is missing: a single line from fully transparent to private by default, with each asset placed on it, and a clear statement of what is actually exposed at each point.

This is a properties-and-risk explainer. It describes what each design reveals and conceals, and the legal, seizure, and delisting risks that come with each. It is not a guide to evading law enforcement, sanctions, or money-laundering controls, and it does not give operational steps for doing so. Mixing and coordination services in particular carry real criminal exposure in many jurisdictions, covered below.

!!! info "Why this page exists"

    anoni.net is a volunteer community in the Sinophone Asia-Pacific. We see the "pay in crypto" advice given to journalists, activists, and people leaving abusive homes across the region, usually with no sense of which asset leaks what. For the mechanism details and tool recommendations, [Privacy Guides on cryptocurrency](https://www.privacyguides.org/en/cryptocurrency/){target="_blank"} and each project's own documentation are the authorities; the depth links below point there.

## The axis, at a glance

The single most useful mental model: a public blockchain is a permanent, searchable record. Most assets put the whole record in the open. A few hide parts of it. Almost none hide the most dangerous part, which is the link between a chain address and the legal identity that funded or cashed it out.

| Asset | Account (who holds it) | Amount | Transaction graph | Default privacy |
|---|---|---|---|---|
| Bitcoin (BTC) | Public | Public | Reconstructable | None |
| Ethereum (ETH) | Public | Public | Reconstructable | None |
| Stablecoins (USDT, USDC, DAI) | Public | Public | Reconstructable | None, plus issuer freeze |
| Zcash transparent (t-addr) | Public | Public | Reconstructable | None |
| Zcash shielded (z-addr) | Hidden | Hidden | Hidden inside the pool | Optional |
| Monero (XMR) | Hidden | Hidden | Decoy-obscured | On by default |

Four things are visible to anyone watching a public chain, and the table above is just these four scored per asset:

- **Account**: which address holds or moved value. On Bitcoin, Ethereum, and stablecoins this is fully public. Monero hides the recipient with a one-time stealth address; Zcash shielded transactions hide the address entirely.
- **Amount**: how much each transaction moved. Public on Bitcoin and most chains; hidden by Monero's RingCT and by Zcash shielded transactions.
- **Transaction graph**: the web of who-paid-whom over time. On Bitcoin and Ethereum the full graph is reconstructable; Monero injects decoys with ring signatures; Zcash's shielded pool is opaque from the inside.
- **Network metadata**: the IP, wallet client, and timing behind a broadcast. Every chain depends on the peer-to-peer layer for this, which is why pairing any wallet with Tor matters regardless of the asset.

## What chain analysis actually sees

Bitcoin and Ethereum keep a public ledger. Hand anyone an address and they can pull its full receive-and-send history, its balance, and every address it has touched. The address carries no name on its own. The deanonymization happens at the edges. Once that address has withdrawn from a KYC exchange, leaked an IP at broadcast, or paid an address already tagged in a dataset, chain-analysis firms such as Chainalysis and TRM Labs group addresses that belong to one entity (clustering) and tie the cluster to a real person.

This is the point most "pay in crypto" advice misses entirely:

**The on-ramp and off-ramp KYC layer, plus address reuse, deanonymize people far more often than the chain's cryptography does.** The single most identifying event in most people's crypto history is the withdrawal from the exchange where they verified a passport, because it welds the on-chain identity to the legal one. Reusing one address across donations, subscriptions, and savings then knits those activities into one profile. No privacy coin fixes a habit of cashing out at a KYC desk and reusing addresses.

How an asset is acquired shapes how traceable it is:

- **KYC exchanges**: require verified identity. The withdrawal to a self-custodied address binds the chain identity to the legal one.
- **Decentralized exchanges (DEX)**: on-chain swap protocols (Uniswap, Curve and similar) ask for no identity check, but the address you interact with stays public and sits on the graph.
- **Peer-to-peer (P2P)**: trades between individuals can route around KYC, at the cost of counterparty trust, wider spreads, and thinner liquidity.

In practice, on Bitcoin and Ethereum only the network-metadata dimension can be improved (by Tor); account, amount, and graph are public by design. Getting more privacy on those chains means an off-protocol mechanism, with the legal weather described below.

## Privacy-optional: Zcash, and why optional leaks

Zcash supports shielded transactions built on zk-SNARKs (zero-knowledge proofs that confirm a transaction is valid without revealing the sender, recipient, or amount).[^1] It also keeps a **transparent pool** (t-addresses, as public as Bitcoin) for compliance and exchange use. Privacy is a choice the user makes per transaction.

That choice is exactly the weakness. For most of Zcash's life the shielded pool sat largely empty: a 2023 analysis found only around 15% of transactions were fully shielded, with the bulk of value parked in transparent addresses.[^2] A small set of private users surrounded by a large transparent crowd is a small anonymity set, the group you blend into. The smaller it is, the more timing and amount correlation can narrow down who you are, no matter how strong the underlying proof.

Two things have shifted since:

- **Adoption is rising.** Reporting in late 2025 put 20–30% of circulating ZEC in shielded addresses, a meaningful jump from the single-digit and low-teens era.[^3] A larger anonymity set raises the practical difficulty of analysis. Because the figure moves, check current on-chain data before relying on it.
- **Halo 2 removed the trusted setup.** Zcash's earlier zk-SNARK construction needed a one-time "ceremony" whose secret data, if it leaked, could have allowed undetectable counterfeiting. The Halo 2 system used by the current shielded pool eliminates that trusted-setup requirement, a real piece of cryptographic-engineering progress.[^4]

The lesson generalizes past Zcash: optional privacy with low uptake protects you less than the math suggests, because anonymity is a property of the crowd, not of one transaction.

## Privacy by default: Monero

Monero builds the hiding of account, amount, and graph into every transaction, with no opt-in. Three mechanisms stack:[^5]

- **Stealth addresses**: the sender derives a fresh one-time address for each payment, so the recipient's published address never appears on-chain.
- **Ring signatures**: each spend is signed as one of a ring of plausible inputs, currently a mandatory minimum ring size of 16 (the real input plus 15 decoys), so an observer cannot tell which input was actually spent.
- **RingCT (Ring Confidential Transactions)**: hides the amount while still proving on-chain that no coins were created from nothing.

The chain shows "a one-time address received a hidden amount, spent by one of 16 possible senders." There is no Alice-to-Bob graph to reconstruct in the first place. For the mechanism details, the [Monero technical specification](https://docs.getmonero.org/technical-specs/){target="_blank"} is the authority.

The trade-off is acquisition friction and shrinking exchange support. Privacy by default is precisely what makes Monero hard for a regulated exchange to keep listed:

- Major KYC exchanges have moved to delist XMR. **Binance** completed a global delisting in early 2024; **Kraken** removed Monero for European Economic Area customers in late 2024 under MiCA-driven anti-money-laundering pressure, converting leftover balances to BTC; **OKX** delisted it alongside other privacy assets in January 2024.[^6]
- That pressure is why getting Monero increasingly happens through DEX (such as Haveno), P2P platforms, or atomic swaps from BTC, rather than a mainstream exchange order. The strength of the design and the narrowness of the legal on-ramp are the same fact seen from two sides.

## Pointers: Lightning, CoinJoin, and mixers

Two adjacent topics come up constantly, kept here at a pointer level.

**Lightning** is a payment layer on top of Bitcoin. Individual payments route through channels off the main chain and are not posted to the public ledger one by one, so a Lightning payment is less directly traceable than an on-chain Bitcoin send. It is not a privacy coin: channel opens and closes settle on-chain, routing nodes see what passes through them, and the funding still traces back to however the bitcoin was acquired. Treat it as a smoother payment rail with some incidental privacy, not as anonymity.

**CoinJoin and mixers** combine many users' coins into one transaction so outputs cannot be matched to inputs. This was Bitcoin's early privacy-enhancement route (Wasabi, Samourai's Whirlpool, and on Ethereum, Tornado Cash). The community no longer points people here as a primary tool, mainly because of the legal weather:

!!! warning "Mixing and coordination services carry real legal risk"

    - **Tornado Cash**: OFAC sanctioned the smart-contract addresses in August 2022 (the first time a protocol's code itself was listed). The Fifth Circuit ruled in November 2024 that OFAC had exceeded its authority, and Treasury delisted the addresses in March 2025.[^7] The sanction on the code is gone, but criminal prosecution of a developer proceeded separately, so coordinating a mixing service is a different risk from the protocol being on a list.
    - **Samourai Wallet**: U.S. prosecutors charged the founders and the service shut down in April 2024; in November 2025 the two co-founders were sentenced to five and four years in prison for operating an unlicensed money-transmitting business.[^8]
    - **Wasabi Wallet**: its operator, zkSNACKs, announced in 2024 that it was discontinuing its CoinJoin coordination service.

    The point for an at-risk reader: the cryptography is not what is criminalized. Operating or coordinating a mixing service draws the legal exposure, and in several jurisdictions so can knowingly handling mixed proceeds. The community treats this route as background knowledge, not a recommended tool.

## Stablecoins: convenient, freezable

Stablecoins (USDT, USDC, DAI) track a fiat currency and are easy to move across borders. Their privacy is just the privacy of whatever chain they run on, which means none by default, plus one risk the base assets do not carry: the issuer can freeze them.

- **USDT (Tether)** and **USDC (Circle)** are centrally issued. The issuer maintains a blacklist and can unilaterally freeze the balance at a named address, and has done so for sanctioned, hacked, and law-enforcement-flagged addresses.
- **DAI** began as a "decentralized, unfreezable" design, but as USDC came to back a large share of its collateral it became indirectly exposed to Circle's policies.

For value that has to keep moving, that freeze power is a feature for some users and a hazard for others. An advocacy group's treasury sitting in USDC can be frozen by a single issuer decision. Stablecoins are good at cross-border liquidity and bad at privacy and censorship-resistance, which is the opposite of what someone reaching for "anonymous crypto" usually wants.

## The regional picture

For the at-risk uses we see across Asia-Pacific (donations to advocacy organizations, censorship-resistant value transfer when banking rails are blocked or surveilled) the spectrum maps onto two honest takeaways.

First, the threat is usually the edges, not the chain. A donation routed through a reused address that once withdrew from a passport-verified exchange is effectively public, whatever asset it used. Privacy starts with not reusing addresses and not cashing out where your identity is on file, before it has anything to do with picking Monero over Bitcoin.

Second, the regulatory environment around regulated intermediaries is tightening. Jurisdictions across the region are rolling out virtual-asset service provider (VASP) registration and anti-money-laundering rules, and the broad direction is more identity collection at the exchange layer and more pressure on privacy assets to be delisted there. Hong Kong already shows what that looks like once it's fully in force, not just proposed: since its Securities and Futures Commission licensing regime for virtual asset trading platforms (VATPs) took effect in June 2023, retail investors may only trade tokens that clear an SFC eligibility bar, and privacy coins such as Monero and Zcash have in practice been unable to meet it, so no licensed Hong Kong platform lists them.[^10] The EU's anti-money-laundering regulation, adopted in 2024 and set to apply from mid-2027, goes further still: it bars regulated providers from holding anonymity-enhancing assets such as Monero and Zcash, while leaving individual ownership and self-hosted peer-to-peer transfers outside the ban.[^9] That distinction (intermediaries restricted, individuals and protocols not) is the pattern to watch as regional rules land, but the specifics differ by jurisdiction and change often, so check local law rather than this page. Self-custody and protocol use are generally not the regulated activity; running a service usually is.

None of this is legal advice. It is a map of where the exposure sits so the choice of asset is made with eyes open.

## Where to go from here

- [Privacy Guides on cryptocurrency](https://www.privacyguides.org/en/cryptocurrency/){target="_blank"} for the canonical, regularly updated recommendation on which asset and wallet to use, and why.
- The [Monero technical specification](https://docs.getmonero.org/technical-specs/){target="_blank"} and the Electric Coin Company's [Halo on Zcash explainer](https://electriccoin.co/blog/technical-explainer-halo-on-zcash/){target="_blank"} for the cryptography behind the privacy-by-default and privacy-optional ends of the axis.
- [Anonymity, privacy, pseudonymity, and confidentiality](../basics/anonymity-vs-privacy.md) for why "pseudonymous" (an address is not a name until it is) is the right word for a public chain, not "anonymous."
- [Why metadata matters](../basics/metadata.md) for the network-layer dimension that no choice of asset addresses on its own.
- [Threat modeling](../basics/threat-model.md) to decide which dimension actually matters for your situation before reaching for a tool.
- The [Scenarios](../scenarios/index.md) section for worked examples, including the [journalist](../scenarios/journalist.md) protecting a source and someone [leaving an abusive home](../scenarios/domestic-violence.md), where the choice of payment privacy has real stakes.
- [Other tool comparisons](./index.md) for the same treatment applied to messaging and anonymity operating systems.

[^1]: [What Are Zcash Shielded Pools and How Have They Evolved?](https://www.gemini.com/cryptopedia/what-are-zcash-shielded-pools-and-how-have-they-evolved){target="_blank"} - Gemini Cryptopedia.
[^2]: [Inside Zcash: Encrypted Money at Planetary Scale](https://www.coindesk.com/research/inside-zcash-encrypted-money-at-planetary-scale){target="_blank"} - CoinDesk Research, citing the historically low share of fully shielded transactions.
[^3]: [Why 30% of Zcash supply is now in the shielded pool](https://crypto.news/why-30-of-zcash-supply-is-now-in-the-shielded-pool/){target="_blank"} - crypto.news, late 2025. Shielded share moves over time; verify current on-chain figures before relying on them.
[^4]: [Technical explainer: Halo on Zcash](https://electriccoin.co/blog/technical-explainer-halo-on-zcash/){target="_blank"} - Electric Coin Company, on removing the trusted setup.
[^5]: [Monero Technical Specification](https://docs.getmonero.org/technical-specs/){target="_blank"} - Monero documentation, on stealth addresses, ring signatures (minimum ring size 16), and RingCT.
[^6]: [Monero, Zcash and Other Privacy Coins Face Highest Delisting in 2024](https://www.coinspeaker.com/monero-xmr-zcash-zec-privacy-coins-delisting/){target="_blank"} - Coinspeaker; and [Kraken to delist Monero in the European Economic Area](https://www.theblock.co/post/287801/kraken-delist-monero-ireland-belgium-convert-remaining-balances-bitcoin){target="_blank"} - The Block.
[^7]: [A Legal Whirlwind Settles: Treasury Lifts Sanctions on Tornado Cash](https://www.venable.com/insights/publications/2025/04/a-legal-whirlwind-settles-treasury-lifts-sanctions){target="_blank"} - Venable LLP, on the August 2022 sanction, the November 2024 Fifth Circuit ruling, and the March 2025 delisting.
[^8]: [Founders of Samourai Wallet cryptocurrency mixing service sentenced to five and four years in prison](https://www.justice.gov/usao-sdny/pr/founders-samourai-wallet-cryptocurrency-mixing-service-sentenced-five-and-four-years){target="_blank"} - U.S. Department of Justice, November 2025.
[^9]: [EU AML Rules to Ban Anonymous Accounts, Privacy Coins](https://thedefiant.io/news/regulation/eu-aml-rules-to-ban-anonymous-accounts-privacy-coins){target="_blank"} - The Defiant, on Regulation 2024/1624 (applicable from July 2027) barring regulated providers from anonymity-enhancing assets while exempting individual ownership and self-hosted peer-to-peer transfers.
[^10]: [New Hong Kong Regulatory Requirements and Licensing Regime for Virtual Asset Trading Platforms](https://www.gibsondunn.com/wp-content/uploads/2023/06/new-hong-kong-regulatory-requirements-and-licensing-regime-for-virtual-asset-trading-platforms-finalised-as-legislation-takes-effect.pdf){target="_blank"} - Gibson Dunn, on the VATP licensing regime taking effect in June 2023; see also the SFC's [list of licensed virtual asset trading platforms](https://www.sfc.hk/en/Welcome-to-the-Fintech-Contact-Point/Virtual-assets/Virtual-asset-trading-platforms-operators/Lists-of-virtual-asset-trading-platforms){target="_blank"} for which tokens currently qualify.
