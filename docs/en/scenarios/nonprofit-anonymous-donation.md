---
title: Anonymous donation channels for advocacy organizations
description: A working design for legally anonymous giving that protects donors while keeping the organization accountable, for both organizers and donors, with Sinophone Asia-Pacific banking, crypto, and cross-border context.
icon: material/hand-coin-outline
---

# :material-hand-coin-outline: Anonymous donation channels for advocacy organizations

Civic groups and advocacy organizations often need two things that look contradictory: protect supporters and donors from being identified, and maintain external financial transparency and stay compliant. These can coexist. A workable anonymous-donation design lets an organization account for its money to regulators and report aggregate income and spending to its community, while letting individual donors choose not to be named.

This guide is organized around two roles. The organizer side: how to stand up an *optional* anonymous receiving channel, and the trade-offs between cash, cryptocurrency, and prepaid instruments, plus the internal risk management that has to come with them. The donor side: how to pick a channel that matches your own threat model instead of the one that merely looks most anonymous. Underlying both roles is the Tornado Cash sanctions case, the reference point for judging where the legal line sits, which we come to after the two role sections. The prerequisite framing is [how to build a threat model](../basics/threat-model.md); the tool detail lives in [the cryptocurrency privacy spectrum](../tools/crypto-privacy-spectrum.md).

This is not legal advice. Charitable-solicitation, political-donation, anti-money-laundering, and tax rules differ sharply by jurisdiction, and the regional section below is honest about where we have first-hand standing versus where we are following. Confirm the specifics for your own jurisdiction before you act.

## Why this needs its own guide

"Isn't a donation just an account number and a receipt?" For neutral causes (disaster relief, education, animal medical care) that is roughly true. The situations below are not:

- **The cause itself is sensitive.** Human rights, gender and sexuality, labor rights, indigenous land, cross-strait issues: donors worry their stance will be seen by an employer, family, or elders.
- **A small community supporting a small cause.** Ethnic minorities, sexual minorities, parent networks for minor children: if a donor list leaks, the re-identification risk is far higher than for a general-purpose charity.
- **Cross-border support for a persecuted group abroad.** Giving to a Hong Kong journalists' fund, or to groups supporting people in Myanmar or Xinjiang, can put a donor's money trail in reach of a foreign jurisdiction's investigators. Hong Kong readers should also see the warning box below.
- **Internal supporters who cannot be seen.** Civil servants, teachers, and senior corporate staff may be unable to back a cause publicly but want to express support with money.
- **The reverse risk of a data breach.** Even if an organization protects its donor roster perfectly, one security incident can expose every supporter at once.
- **Payment processors can cut a channel off unilaterally.** PayPal, Stripe, and Patreon have repeatedly closed advocacy and creator accounts under vague rules, and some markets carry structural exclusion on top of that. Beyond anonymity, plan a fallback in case your main rail gets cut off: see [when financial companies act as censors](../blog/posts/2026-financial-companies-as-censors.md).

Put differently, a donor's identifying information is tied to their politics, sexuality, family structure, and community relationships, which makes it far more sensitive than an ordinary purchase record. Offering an optional anonymous channel is a basic form of respect for the people who support you. Everything below serves three requirements that have to hold at the same time — lawful, auditable, and protective of the vulnerable — which we return to at the end.

!!! warning "Hong Kong and cross-border readers: expect a higher risk tier"

    The design principles below assume a jurisdiction where anonymous giving to a lawful cause is itself lawful. Hong Kong's risk level is different, and much higher. In the 612 Humanitarian Relief Fund case, a crowdfunded fund that provided medical and legal aid to people arrested during the 2019 protests was investigated and wound down; five trustees, Cardinal Joseph Zen among them, were initially arrested on national-security grounds (suspected "collusion with foreign forces"), and were ultimately convicted, under the Societies Ordinance, of failing to register the fund as a society. Their appeal was heard by the High Court in late 2025 and a ruling is still pending. For Hong Kong organizations and donors, the core risk is that the *purpose* of the money can itself be characterized as a national-security offense, and no amount of clean anonymity engineering removes that layer. Cross-border donors who want to support Hong Kong civil society or organizations in exile should also weigh the possible extraterritorial reach of the National Security Law. Redo your threat model for your own location before you act.

    Source (reviewed 2026-07): [Hong Kong court convicts Cardinal Zen and 5 others over failing to register protester relief fund as society](https://hongkongfp.com/2022/11/25/breaking-hong-kong-court-convicts-cardinal-zen-and-5-others-over-failing-to-register-protester-relief-fund-as-society/){target="_blank"}, Hong Kong Free Press.

## Organizer side: build an optional anonymous channel

The word *optional* is the core of the design. People who want anonymity have a path, and people who want to be named can still be named; the two run in parallel. In practice most donors take the named path (for a receipt, for membership), and a minority take the anonymous path for the sensitive reasons above. Preparing both is more respectful of your supporters' circumstances than forcing everyone down one road.

### Three rails and their trade-offs

| Rail | Anonymity | Compliance load | Scales | Cross-border |
|------|-----------|-----------------|--------|--------------|
| Cash (drop box, event floor) | High | Medium | Low | No |
| Cryptocurrency | Medium to high | High | High | Yes |
| Prepaid gift card / convenience-store code | Medium | Low | Medium | Domestic mostly |

Every rail is a trade-off; there is no single "most anonymous" option. In practice most organizations mix: cash and prepaid for day-to-day, crypto for cross-border, bank transfer for named donors.

### Four internal-governance must-haves

Settle these before you accept the first anonymous donation, not after:

- **A public acceptance policy.** What sources you accept, what you refuse, and who has the final call. Common refusal conditions: an unusually large amount from an unknown source, a donor clearly at odds with the organization's values, or any source your local political-donation or charitable-solicitation law forbids.
- **Separation of ledger and wallet authority.** Who can see amounts, who can move private keys, who is responsible for disclosure. For crypto, use at least a 2-of-3 multisig (a wallet that needs 2 of 3 held keys to move any funds), and make sure at least one key-holder is outside the executive team (a board member or an external accountant).
- **An external transparency report.** Publish aggregate income and spending; do not disclose individual donors. The more solid this report is, the stronger the legitimacy of the anonymous channel when a regulator or a journalist asks.
- **A plan for compelled disclosure.** Decide in advance what you would do if a court or regulator ordered you to hand over donor identities: what you actually hold, what you genuinely do not hold, and who calls a lawyer. Designing the channel so that you *cannot* identify anonymous donors is stronger protection than promising that you will not, because there is then nothing to compel.

Write these into your internal charter as a standing rule.

## Organizer side: cash and prepaid combinations

Not every organization needs, or is suited to, accepting crypto. For a small domestic group, cash plus prepaid is often the most practical default, and most groups can stop here.

- **Public mailbox, on-site anonymous box.** Set out a physical donation box, opened after an event by two or more people who count on the spot and record immediately. Depending on your jurisdiction, a public box may fall under "soliciting from the general public" and require prior permission, so check first.
- **Convenience-store payment codes.** Through a third-party payment processor, issue a payment code that a donor pays in cash at a store; the organization sees only the code, not a name. Limits: the platform layer may still keep a record, and per-transaction caps usually apply.
- **Prepaid gift cards for cross-border giving.** When supporting an organization abroad, prepaid gift cards are sometimes one of the few workable options: the donor buys a card with cash and sends the serial number over an encrypted channel (Signal, OnionShare). This method has a strong association with scams, so explain the intended use clearly when you publish it.

## Organizer side: accepting cryptocurrency donations

Most groups will be fine with the cash-and-prepaid combination above. This section is for organizations that genuinely need cross-border reach or scale, which is where crypto does the most work and also carries the highest skill and compliance load. The example below assumes a small advocacy organization that does have a cross-border need.

### Self-custody versus custodial

- **Self-custody.** The organization holds its own private keys; common implementations are Bitcoin Core, Electrum, or Sparrow (BTC), MetaMask, Frame, or Rabby (ETH and stablecoins), and Cake Wallet or Feather (Monero). Pick one your team can actually operate, and for an organization holding funds as a treasury, keep the signing keys on hardware wallets (Ledger, Trezor, or Coldcard) rather than in a browser or phone hot wallet. Upside: no third-party dependence and no KYC (the identity verification a financial service requires, which leaves a record of the donor). Downside: key management is entirely the organization's responsibility, and a lost key means lost funds.
- **Custodial.** The organization receives donations through a regulated exchange's institutional account, then moves them to self-custody. Upside: support desk and insurance. Downside: the receiving account has been through KYC, and donor information may be retained by the exchange.

The practical recommendation is self-custody as the default, custodial as a backup: small everyday amounts to a self-custody wallet, large amounts or fast fiat conversion through an institutional account.

Multisig is the keyword here. A 2-of-3 design splits keys across three roles (for example director, accountant, external board member), so that any single person losing a key or leaving does not freeze the funds, and no single person can divert them. Bitcoin uses PSBT (a standard format for passing a partly-signed transaction between signers) and Ethereum uses Safe (formerly Gnosis Safe) as the two most common implementations.

### Publishing the receiving address

How you publish the donation address on your own site is an easily overlooked design question:

- **HTTPS is the baseline, an onion mirror is the upgrade.** When a donor connects to your site from abroad, or on a monitored network, HTTPS protects the content but not the fact that they connected to *you*. An onion mirror makes the connection itself anonymous (anoni.net's own site has an onion entry point).
- **Do not hard-code the address into an image.** A QR-code image generated once is painful to change years later. Publish plain text plus a dynamically generated QR code rendered from your database. If you do not have the engineering resources for that, the low-tech fallback is to publish a small number of addresses as plain text and update them by hand on a set schedule, and never bake an address into an image you cannot easily edit.
- **Give a fresh address each time (HD wallet).** BTC and ETH both support hierarchical wallets; a distinct address per donor avoids the correlation that address reuse invites. This raises your reconciliation burden, so confirm your accounting tooling can keep up first.
- **Plan reconciliation in advance.** Real-time notification helps (Mempool.space offers WebSocket address subscriptions; Etherscan has no native webhook, so you either poll it or use a third-party service such as Alchemy or Moralis). Without engineering resources, the low-tech fallback is a person checking a block explorer against your reconciliation list on a fixed schedule, say weekly.

### Conversion and accounting

Handling crypto after receipt is where the real compliance difficulty lives:

- **When to convert.** Volatility is high; not converting could mean a gain or a loss of half the value. Many small organizations set a default policy of converting to fiat within seven days of receipt, then adjust case by case.
- **Recognition timing and valuation.** Under ordinary accounting, the recognition point for crypto received is the fair market value in local currency at the moment of actual receipt. Keep the transaction screenshot, block-explorer link, and the exchange-rate source at that time.
- **Receipts.** When a donor chooses anonymity, the organization usually cannot issue a receipt eligible for a tax deduction. State this plainly on the public donation page: choosing anonymity means no named receipt, and donors who want a deduction should use the bank-transfer path.

Large crypto donations also carry a due-diligence dimension over the *source* of funds, which we return to in the Tornado Cash section below.

## Organizer side: common first-time mistakes

- **Listing only a crypto address with no usage note.** A donor seeing a string of characters does not know whether you can actually use it, whether you convert immediately, or whether you reconcile. Put a short note next to the address (use, reconciliation cadence, whether a receipt is available).
- **Concentrating all multisig keys in the executive team.** A 2-of-3 where all three signers sit in the same office is not risk distribution. At least one key must go to someone outside the executive team.
- **Opening an anonymous channel without talking to the regulator first.** In the grey zones of solicitation and political-donation law, explaining after the fact costs far more than consulting beforehand. Depending on your jurisdiction, the relevant body may be the charity or societies registrar, the tax authority, or the financial regulator; a half-hour call can save months of administrative back-and-forth.
- **Assuming "anonymous" means "no record."** Your external financial report, your internal reconciliation, and the public-by-design blockchain all leave records. Anonymity only reaches "we do not identify who the individual donor is"; the money still exists in the report, the reconciliation, and on-chain.
- **Ignoring whether the recipient can lawfully receive the money in cross-border giving.** Before sending money abroad, confirm the recipient can lawfully receive it under their local rules. A permissive home jurisdiction does not mean the other side is the same.

The common root of these mistakes is "build the tech first, think about policy and process later." Reverse the order: decide who you serve, which regulators you face, and how you separate internal authority, then decide whether and how to build the optional anonymous channel.

## Donor side: choosing a channel without exposing yourself

Switch to the donor's point of view. For the same organization offering the same rails, the best channel differs from one donor to the next.

### Assess your own threat model first

Ask two questions:

1. Who are you trying to stay out of view of? Family, an employer, a specific government body, the organization itself, or several at once?
2. What data can they obtain? Bank statements, social media, a shared device, a shared network?

Write the answers down before you pick a channel. Skip this step and most people reach straight for the tool that "looks most anonymous," which usually does not match their actual threat.

### Channel mapping

| Primary threat | Recommended | Avoid |
|----------------|-------------|-------|
| Hiding the money trail from family or an employer | Cash, prepaid, privacy coins | Credit card, shared bank account |
| Hiding your identity from the organization | Cash with no email, privacy coin to self-custody | Bank transfer (the account name is recorded) |
| Hiding from cross-border monitoring | Monero, Zcash shielded transactions | Bitcoin to a centralized exchange |
| Simple personal preference for no record | Any cash rail | Any electronic payment |

One trap in that table: Zcash only hides a transaction if you use a *shielded* (z-address) transaction. An ordinary transparent Zcash transaction is as visible as Bitcoin, so choosing Zcash without choosing the shielded path gives you no privacy.

### Worked flow: a small privacy-coin donation

First, to be clear: for small domestic support, cash, a store code, or a prepaid card is the least trouble, and you do not need to reach for cryptocurrency. The privacy-coin flow below is for the case of "supporting an organization abroad while maximizing anonymity," and the bar is noticeably higher.

Say a donor wants to give a small amount (roughly USD 15 to 150) to an advocacy organization abroad while maximizing anonymity:

1. **Acquire the privacy coin, carefully.** This is the hardest step, and the one that most often quietly breaks the anonymity of everything after it. If you buy mainstream coins (BTC, ETH) through a KYC exchange and then convert, that purchase already ties the coins to your identity. To avoid that, acquire Monero (XMR) through a decentralized exchange (Bisq or Haveno, which route trades over Tor and hold no custody of your funds) or a local peer-to-peer swap; peer-to-peer options change over time, so check current community discussion. A simpler alternative that shifts the work to the recipient: ask the organization to accept Bitcoin directly and let them convert it on their end.
2. **Initialize a self-custody wallet.** Install Cake Wallet or Feather (both community-recommended Monero clients), write the 25-word seed down offline, and store it somewhere it will not be stumbled upon. Do not keep the seed in the cloud or in a password manager linked to your main accounts.
3. **Send.** Get the organization's Monero address. If they also offer an onion mirror, connect over Tor Browser (see [Tor Browser advanced settings](../tools/tor-browser-advanced.md)) to the onion version to confirm the address and avoid a man-in-the-middle. Note the transaction hash and time, but you do not need to tell the organization.

The step most often underestimated is the first, acquiring the coin without leaving an identity trail. Many donors reach it, find the bar too high, and give up, which is exactly why low-barrier rails like prepaid cards and cash cannot be fully replaced by crypto.

## The Tornado Cash sanctions case: where the legal line sits

The most important recent indicator of the legal risk around crypto anonymity tools is Tornado Cash. This is a US case, but it matters well beyond the US: major exchanges apply OFAC sanctions globally, and regulators elsewhere often reason from the same precedents. For an advocacy organization it is not technical gossip; it is a concrete reference for judging whether what you are doing crosses a line.

### Timeline (current to July 2026; the Storm case is still moving)

- **August 2022:** The U.S. Treasury's OFAC added Tornado Cash smart-contract addresses to the SDN sanctions list, citing use in laundering, including for the North Korean Lazarus group.
- **August 2022:** Tornado Cash developer Alexey Pertsev was arrested in the Netherlands.
- **August 2023:** Another developer, Roman Storm, was indicted in the United States on charges including conspiracy to launder money and to violate sanctions.
- **May 2024:** Pertsev was sentenced in the Netherlands to 64 months for money laundering.
- **November 2024:** The U.S. Fifth Circuit Court of Appeals ruled in *Van Loon v. Treasury* that OFAC exceeded its authority in sanctioning immutable smart contracts.
- **March 2025:** OFAC removed the Tornado Cash smart-contract addresses from the SDN list, while litigation against individual developers continued.
- **August 2025:** A jury found Roman Storm guilty on one count (conspiracy to run an unlicensed money-transmitting business) but deadlocked on the two heavier counts (conspiracy to launder money and to violate sanctions). Prosecutors have sought a retrial on the undecided counts, reported for October 2026, with sentencing still pending.

### Three takeaways for advocacy organizations

- **A "mixer" and a "privacy coin" are two different legal categories.** Tornado Cash obscures the source after the fact (a mixer); Monero has privacy by design at the protocol layer. The former is more readily characterized as "helping to conceal the source of funds"; the latter more often reads as simply using a tool that happens to offer privacy. This line is not written in statute; it is a judgment built from case law and administrative practice.
- **A recipient's due-diligence duty over the source of funds.** When your organization receives a large crypto donation, even if you cannot technically identify the donor, you may still be expected to make a reasonable judgment about the source. A policy of "an unusual amount triggers internal review" is safer than pretending not to see.
- **Tool neutrality is not user neutrality.** A privacy tool is lawful in most jurisdictions, but using it for a specific act can be unlawful. Receiving small donations from ordinary supporters with Monero is neutral use; receiving laundering proceeds at scale with the same tool is not. What determines the legal risk is what you did with the tool.

These are US-derived judgments. Whether the same reasoning applies where you are is a question for a local lawyer. For ongoing legal analysis, follow [Coin Center](https://www.coincenter.org/){target="_blank"} and [EFF](https://www.eff.org/){target="_blank"}.

## The three trade-offs that must hold together

Lawful, auditable, and protective of the vulnerable have to be true at the same time:

- **Lawful.** Disclose what should be disclosed to regulators. AML, tax, solicitation, and political-donation rules all carry reporting duties; do not break them for the sake of anonymity.
- **Auditable.** An external transparency report for your community and donors: publish aggregate income and spending, categorize use clearly, disclose no individual donor. The better this report is, the more stable the legitimacy of the anonymous channel.
- **Protective of the vulnerable.** Individual donors are not identified. This is the reason the anonymous channel exists, and every design choice comes back to it.

These are not mutually exclusive. A well-designed anonymous channel satisfies all three; drop any one and the value of the other two is discounted.

## Regional context: Sinophone Asia-Pacific

Statutory detail is where "anonymous donation" stops being universal. We have first-hand standing in only one jurisdiction and are following the rest, so read this section as a map of where to look, not as the law itself.

- **Taiwan** (first-hand). The environment is relatively friendly to anonymous giving, but three specific statutes govern it: the Charity Donation Solicitation Act, the Political Donations Act (which caps anonymous political donations and bars donations from several categories of foreign and cross-strait sources), and the evolving VASP framework for crypto. Our Chinese edition carries the clause-level detail; this English page keeps to principles.
- **Hong Kong & Macau** (followed, highest risk). See the warning box above. Since the 2020 National Security Law, the binding constraint is the *purpose* of the funds, not the cleanliness of the channel, and cross-border donors should weigh extraterritorial reach. Where a scenario assumes a functioning local NGO safety net, that assumption often no longer holds; route instead to international organizations, as the [activist](./activist.md) and [journalist](./journalist.md) scenarios do.
- **Singapore** (followed, in-region verification wanted). Charitable fundraising and political donations are separately regulated, foreign political donations are restricted, and Singpass, a deeply integrated national digital identity, means a domestic electronic rail is rarely as anonymous as it looks. Treat the specifics as pending confirmation by someone on the ground.
- **Malaysia** (followed, in-region verification wanted). Societies registration and the enforcement environment are the threads that matter for an advocacy organization here; the practical detail needs an in-region co-author.
- **The diaspora and cross-border givers.** Often the most relevant layer for English-preferring readers: your money may cross two or three jurisdictions, and the strictest one governs. For example, a donor in Malaysia giving to a Hong Kong organization through a US-based exchange touches three legal regimes at once. See [cross-border travel and device searches in Asia](./asia-travel.md) for the adjacent OPSEC.

The universal principle underneath all of them: check your own jurisdiction's charitable-solicitation and political-donation statutes, and remember that *anonymous does not mean unreported*. The organization still reports aggregate anonymous income even when it cannot name the donor.

!!! warning "In-region verification wanted"

    The Singapore and Malaysia lines above are written at a remove, not from first-hand practice; treat them as followed-at-a-distance until a local source confirms them. Specifically, a partner in either jurisdiction should confirm the current charitable-fundraising and political-donation rules, whether and how foreign donations are restricted, and how the real-name identity layer (Singpass in Singapore) affects a domestic electronic donation rail. If you organize or give there and can help verify or co-author, reach us through the [Community](../community/index.md) page.

## What's next

- [Why anonymous payments matter](../basics/payments-anonymity.md): why the money trail is a distinct, sticky dimension of metadata.
- [How to build a threat model](../basics/threat-model.md): start by naming your adversary and the money-trail clues they can see.
- [The cryptocurrency privacy spectrum](../tools/crypto-privacy-spectrum.md): how BTC, ETH, Monero, Zcash, and stablecoins differ on privacy.
- [Secure messaging compared](../tools/messaging-comparison.md): for the encrypted channel you use to send a prepaid serial or coordinate quietly.
- [When financial companies act as censors](../blog/posts/2026-financial-companies-as-censors.md): why a payment rail can be severed, and why a fallback matters.
