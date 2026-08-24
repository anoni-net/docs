---
title: Email aliases, and who you hand your trust to
description: Forwarding aliases, catch-all on your own domain, and why plus-addressing protects nobody; where aliases work, where they break, and the regional situations that change the answer.
icon: material/email-multiple-outline
---

# :material-email-multiple-outline: Email aliases, and who you hand your trust to

"Every identity needs its own email" is the first requirement in [keeping several online identities apart](../basics/multiple-identities.md), and taken literally it stalls: five identities means five mailboxes, five passwords, five two-factor setups, and most people give up around the third. An email alias brings that requirement down to something you can actually do. One mailbox generates as many outward-facing addresses as you want, one per service, each revocable on its own. The cost is that your correspondence record concentrates in the hands of one forwarder.

Aliases address two things: the same address being correlated across services, and having no way to tell who leaked it. If your inbox is already drowning in phishing and fraud, aliases will not help, because a new address does not recall a list that has already circulated; [what an ordinary person should have in place](../scenarios/everyday-baseline.md) covers recognition and response. Starting from [how to build a threat model](../basics/threat-model.md) helps establish who you are defending against.

!!! tip "No time to read it all? Start here."

    - One mailbox, many outward addresses, one per service. When a leak happens, the address it arrives at tells you which company leaked it
    - Plus-addressing (`you+shop@gmail.com`) protects nobody: delete everything after the plus sign and you have the real address
    - A forwarding service concentrates your correspondence record with one operator. The total amount of trust does not shrink, it changes hands
    - Catch-all on your own domain has the highest barrier, and domain registration data is public by default, which pins your legal name next to every alias
    - For banks, brokerages, and government systems that already hold your verified identity, an alias buys no separation

## What using an alias actually looks like

You want to subscribe to an environmental group's newsletter and the form asks for an email address. You open your forwarding service, generate one, get `amaze-gem-spider@duck.com`, and submit that.

Their list now contains only `amaze-gem-spider@duck.com`. Your real `wang.xiaoming@gmail.com` never appears. When the newsletter goes out, the forwarding service receives it and passes it through to your ordinary Gmail inbox. You read it in the same app, with no second mailbox and no second password to remember.

Six months later, gym advertising and investment scams start arriving at `amaze-gem-spider@duck.com`. That address went to exactly one organization, so you know immediately where the list came from.

You open the forwarding service and switch the alias off. Mail to that address bounces from then on and the inbox goes quiet. Nobody had to be contacted, no unsubscribe link had to be found, no account had to be deleted, and your Gmail address never left your hands.

Replying to that organization takes one extra step, covered under "Where aliases break" below.

## What aliases actually buy you

### Fewer correlation handles between services

[How platforms collect your data](../basics/platform-tracking.md) lists one form of correlation you cannot block: platforms matching each other's records on email address and phone number to establish that accounts belong to the same person. Once twenty services hold twenty different addresses, the email handle stops matching. Phone numbers, [device and browser fingerprints](../basics/browser-fingerprinting.md), and contact-list uploads all remain, so an alias closes one path out of several.

### Leaks you can attribute by name

The first step in [what an ordinary person should have in place](../scenarios/everyday-baseline.md) is checking [Have I Been Pwned](https://haveibeenpwned.com/){target="_blank"} to see which breaches you appear in. It tells you the incident, not who sold your address on.

Give a separate alias to Shopee, a supermarket loyalty app, and a gym membership. When a scam arrives that impersonates a brand and knows your real name and purchase history, the address it was sent to identifies which of the three leaked, without waiting for a disclosure notice.

### Revocation that needs nobody's cooperation

Switching off an alias requires no consent from the service and generates no notification to them. When the unsubscribe button is broken, support does not answer, or the account cannot be deleted, killing the alias is something you can do unilaterally.

The everyday version: you sign up for one event and end up on the organizer's permanent newsletter, where the unsubscribe link leads to a portal that wants you to register an account first. Switching off the alias you gave them is faster than completing their process.

## Three ways to do it

The technical barriers differ sharply. Forwarding services and mailbox-native aliases work as soon as you register. The own-domain route requires you to log into a domain registrar and change DNS settings.

If you do not want to read the whole trade-off space, pick from these four lines:

- To cut spam and reduce data-broker correlation, use a forwarding service; the free tier is enough
- If you already have a Proton, Fastmail, or iCloud+ account, use its built-in aliases rather than adding another provider
- To run something for years without depending on one vendor, and you can manage DNS, use your own domain
- To publish an inbox that strangers write to, read [protecting sources as a journalist](../scenarios/journalist.md) first; aliases are the weakest option for that purpose

### Forwarding services

Operated by a third party. You generate an alias in their interface, mail sent to it is forwarded into your existing mailbox, and your real address never reaches the sender.

| Service | Free tier | Paid | Encrypted forwarding | Operator and jurisdiction |
|---|---|---|---|---|
| [DuckDuckGo Email Protection](https://duckduckgo.com/email/){target="_blank"} | Unlimited, addresses at `@duck.com` | No paid tier | None; instead a stated policy of not storing messages or headers[^ddg-privacy] | DuckDuckGo, United States |
| [SimpleLogin](https://simplelogin.io/){target="_blank"} | 10 aliases, 1 receiving mailbox | $36/year for unlimited aliases, custom domains, catch-all[^sl-pricing] | PGP on the paid tier | Proton, Switzerland |
| [addy.io](https://addy.io/){target="_blank"} | 10 aliases, 10 MB/month forwarding bandwidth | Lite $1/month, Pro $3/month | All tiers[^addy-faq] | Terms governed by the law of England and Wales, servers in the Netherlands[^addy-legal] |
| [Firefox Relay](https://relay.firefox.com/){target="_blank"} | 5 email masks | Two tiers: the lower gives unlimited masks and a custom subdomain, the higher adds phone masking. Available in 34 countries and territories, not including Taiwan[^relay] | None | Mozilla, United States |
| Apple Hide My Email | None, requires an iCloud+ subscription | Included with iCloud+[^apple-hme] | None | Apple, United States |

Three things separate them. Whether the free tier is enough: DuckDuckGo is unlimited, the rest give 5 to 10. Whether you need encrypted forwarding: addy.io includes it on the free tier, SimpleLogin charges for it, the other three do not offer it. And which jurisdiction the trustee sits in, which matters more than price if you are worried about an adversary with legal process available to them.

DuckDuckGo also strips tracking pixels, the invisible images embedded in a message that report back whether you opened it. What addy.io's "not stored" statement covers is message content; a forwarding service has to know which alias received mail from whom in order to work at all, and how long that layer of records is kept is a separate question for each provider's privacy policy. addy.io can also be self-hosted, provided you can maintain a machine running Postfix (the mail server software that handles delivery); an official Docker image exists, and without server experience the hosted version is identical in function.

Apple's Hide My Email is wired into Safari's form autofill, Mail, and Sign in with Apple[^apple-hme], which makes it the smoothest of the five to use. The cost is binding the identity to your Apple ID, where the warning about third-party sign-in buttons in [keeping several online identities apart](../basics/multiple-identities.md) applies unchanged.

### Catch-all on your own domain

The highest barrier of the three, because it requires logging into a domain registrar and editing DNS records. Skip this section if you have not done that before; the other two are sufficient.

You register a domain and route every message addressed to it into one mailbox. That accept-everything configuration is called catch-all. Addresses are invented on the spot: `bank@example.com` and `shop@example.com` work without being created in advance.

The advantage is independence from any forwarder. A provider shutting down or suspending your account cannot take all your addresses with it. Moving mail hosts means going to the DNS settings page at whichever platform you bought the domain from and repointing the MX record, the setting that says which server should receive mail for a domain.

Catch-all accepts mail for addresses that were never issued, so messages to bot-guessed addresses land too, and the spam volume is usually noticeably higher than an ordinary mailbox. If a noisy inbox was the problem you came here to solve, catch-all makes it worse.

Domain registration data (WHOIS) is public by default, including the registrant's name, address, and contact email, which effectively pins your legal name next to every alias on that domain. If you need the identity hidden, buy the registrar's privacy protection at registration or use a registrar that redacts by default, and confirm it before you start using the domain.

Aliases under one domain are also linkable to each other. `bank@example.com` and `dating@example.com` share a domain, so anyone who sees one knows the other exists; add public registration data and the DNS history that specialist services archive, and the whole set traces back to one person. That is harmless for spam control and leak attribution and fatal for identity separation. If a secondary layer from [keeping several online identities apart](../basics/multiple-identities.md) is going to use its own domain, that domain has to be registered separately, with separate registrant data, and never shared with the long-term layer.

### Aliases built into your mailbox

Some mail and password-manager products include the feature directly: Fastmail's Masked Email, the aliases built into Proton Pass (SimpleLogin underneath), and iCloud+'s Hide My Email. Setup cost is lowest, and the cost is that the aliases are tied to that provider and disappear when you leave.

### The trade-offs side by side

| Dimension | Forwarding service | Own-domain catch-all | Mailbox-native |
|---|---|---|---|
| Cost to start | Register and go | Buy a domain, edit DNS | Already have the account |
| Who sees the correspondence record | The forwarder | Your mail provider | Your mail provider |
| Cost of moving | Changing forwarders replaces every address | Repoint MX | Aliases die with the account |
| Blocked at signup | Common; shared domains get misjudged by individual sites | Rare | Depends on the domain |
| Aliases linkable to each other | Not easily, with random strings | Yes, same domain | Depends on how they are generated |
| Registration data public | No | Yes, WHOIS shows registrant name and address | No |
| Suits | Everyday account separation | Long-term use by someone who can manage DNS | People already inside that ecosystem |

## Plus-addressing protects nobody

`you+shop@gmail.com` gets treated as a free alias and offers close to zero protection. In the mail specification the part after the plus sign is an optional annotation and the part before it is the actual account[^rfc5233]. Anyone holding the address deletes everything after the plus and has the real one, `you@gmail.com`.

Concretely: you register at Shopee as `you+shopee@gmail.com`, the member list leaks and gets packaged for resale, and whoever buys it strips `+shopee` and has your working address. The parties who sell lists and the parties who get breached are exactly the ones with a motive to strip it.

Plus-addressing is genuinely useful for sorting incoming mail into folders with filter rules. As identity separation it does nothing, and it satisfies none of the layered requirements in [keeping several online identities apart](../basics/multiple-identities.md).

## The correspondence record concentrates with one company

After the switch, twenty services each hold one alias of yours, while the forwarder's records contain all twenty of them, when each message arrived, and, absent encryption, the message contents. The total amount of trust has not shrunk, it has changed hands.

Several things narrow what the forwarder can see. addy.io on all tiers and SimpleLogin on paid tiers support encrypting forwarded content to your own PGP public key, which puts message bodies out of reach. That presumes you already have a PGP key pair and can keep the private key safe; this site does not yet have a guide to generating one, so without a key that route is closed and choosing on jurisdiction and retention policy is a much lower barrier. Correspondents, timing, and message sizes stay with the forwarder regardless, exactly the outer envelope described in [what metadata is](../basics/metadata.md). DuckDuckGo's support pages state that even headers are not retained, and whether you trust that statement is a separate judgment. Self-hosting addy.io makes you the trustee instead, at the cost described in the previous section.

Which jurisdiction the trustee sits in belongs in the calculation too, which is what the last column of the table above records. When an adversary goes after the forwarder through legal process, which country's procedure applies, how long it takes, and whether you are notified all follow from where that trustee is.

Decide by asking who you are defending against. Against data brokers and spam, a forwarding service is more than sufficient. Against an adversary who can compel a forwarder to produce records, only encrypted forwarding or self-hosting changes anything, and [how to build a threat model](../basics/threat-model.md) has the decision process.

### When strangers write to you, the exposure is theirs

Everything above concerns what you leave behind when registering for services. Publish an alias as a contact point and let strangers write in, and the exposed party becomes the sender. The forwarder receives their originating address, the time they wrote, and their source IP, while your alias is the protected end.

Giving each of twenty sources their own alias does not solve this, because all twenty point at one mailbox and the forwarder's records show that they belong to one person. If that forwarder is compelled to produce data or is itself breached, the relationship between all twenty sources is exposed to the same party at once.

For a public intake channel, an email alias sits above handing out your main address and below anything purpose-built for the job. [Protecting sources as a journalist](../scenarios/journalist.md) has the full comparison, covering Signal, SecureDrop, and onion services, along with what to do when a source is not comfortable with the tools.

## Where aliases break

- **Services that verify identity**: banks, brokerages, telecoms, and government systems already hold your national ID number and phone number (the financial-sector term for this vetting is KYC, know your customer), so an alias buys no separation there and at most tells you which of them leaked
- **Adversaries with compulsion available**: a court order, a criminal investigation, or a corporate internal investigation can obtain records from the forwarder directly, and an alias does not stop that. What matters is the forwarder's jurisdiction and whether encrypted forwarding is on, as covered above
- **Being blocked at signup**: shared forwarding domains get misclassified as disposable mailboxes. SimpleLogin runs a reporting channel for this, contacts the sites individually to ask for removal, and its documentation suggests a custom subdomain or your own domain as the workaround[^sl-block]. The widely used `disposable-email-domains` blocklist deliberately separates the two categories: of the 8,347 domains it listed when checked on 2026-08-24, `duck.com`, `addy.io`, and `mozmail.com` were absent, and the project requires a screenshot proving a domain can generate disposable addresses before adding it[^ded]. What blocks people is each site's own rules, not that public list
- **Replying**: hitting reply from your own mailbox exposes your real address. Forwarders instead issue a per-correspondent relay address (a reverse-alias); you reply to that and it re-sends from your alias. It lives in the forwarder's alias management page, and forwarded messages usually carry a directly usable reply address too
- **Account recovery**: any service using the alias as its recovery address becomes unrecoverable once the alias is off. Confirm nothing depends on it before switching it off
- **The forwarder's own survival**: if the service shuts down or suspends your account, every address on its shared domains dies. Identities meant to last belong on your own domain

## Regional notes

**Taiwan**: applying for the Ministry of Finance's mobile barcode, the carrier that consolidates electronic invoices, requires both a phone number and an email address, with a verification message sent to the address[^einvoice]. Phone numbers in Taiwan are already identity-linked, so an alias buys no separation here; what it buys is knowing that a leak came from that system specifically. The general rule holds: once the other party already holds your verified identity, attribution is the only remaining value.

Taiwan's 2025 amendments to the Personal Data Protection Act give individuals clearer rights of access, correction, and deletion, plus a complaint route to the forthcoming data protection commission (see [Taiwan's PDPA 2025 amendments](../regional/taiwan-pdpa-2025.md)). Exercising any of them requires being able to name the party responsible. An alias turns "someone sold my address" into "this address only ever went to one company," which is the concrete evidence those rights need.

Across the region, the same split applies: e-commerce, food delivery, ticketing, and gym memberships send promotions and get breached, so one alias each pays off most. Banks, brokerages, tax filing, and national health insurance need to stay stable and reachable, so use the real address there rather than risking a missed notice for the sake of separation.

## If you already use Proton Mail

With an existing Proton account there is no need to register a separate forwarding service, since another provider means another trustee. Proton's alias quotas are divided finely by plan.

| Plan | hide-my-email aliases | Notes |
|---|---|---|
| Proton Free | 10 | The account already includes Proton Pass, with no separate signup[^proton-alias] |
| Mail Plus | 10 | Same as free. What the upgrade buys is mailbox addresses and a custom domain; the alias count does not move[^proton-plans] |
| Proton Unlimited | Unlimited | A standalone Pass Plus subscription is also unlimited |
| Mail Essentials (business entry tier) | None | Does not include Proton Pass, so no aliases[^proton-business] |
| Workspace Standard and above | Unlimited | Adding Pass for Business (3 seats minimum) also works |

Aliases are created from the Security Center (the shield icon) in the right-hand panel of Proton Mail on the web, or from the Proton Pass app and browser extension; both draw on the same quota. SimpleLogin, covered above, is what runs underneath.

Plus-addressing works on every plan and does not count against those 10. It protects nobody, as covered above, but it still sorts incoming mail, so the two combine: aliases for anything that might leak, plus-addresses for internal filing.

Paid plans with a custom domain can set up catch-all; free plans cannot[^proton-catchall]. The costs are the ones described earlier.

An existing standalone SimpleLogin account can be linked to a Proton account. On an Unlimited, Proton for Business, or Family subscription, linking upgrades it to SimpleLogin Premium automatically, with unlimited aliases, up to 5 catch-all subdomains, and PGP encryption. Anyone already paying separately for SimpleLogin Premium should cancel that to avoid double billing[^proton-simplelogin].

### The business tier that trips people up

Mail Essentials is the row most often misread. After an organization upgrades to a business plan, the aliases its members can use are still the 10 that come with their individual free accounts, with no organization-level management at all. Getting aliases at the organization level means Workspace Standard or above, or adding Pass for Business.

Proton offers a nonprofit discount covering the business versions of Mail, Drive, VPN, and Pass. The page states only that it is for "registered nonprofit organizations with proper documentation," naming no country, no certifying body, and no discount percentage, and directs everything to a sales conversation[^proton-nonprofit]. Whether the country of registration affects eligibility is not answerable from public information. The discount changes the price and not the alias rules.

### Shared accounts and staff turnover

If an organization shares one set of credentials, all 10 aliases hang off that single account with no permission separation, and handing them over carries the same risk as handing over the whole mailbox.

Organizations using Pass for Business should watch vault ownership. When the owner of a shared vault deletes their Proton account, the vault and every item in it is deleted with it, and the people it was shared with cannot retrieve them[^proton-vault]. The documentation does not state what happens to aliases created in a member's personal vault when an administrator removes that member. Keep aliases meant for shared organizational use in a shared vault, and rehearse the departure process before rolling it out.

## Retiring an alias

This applies to a notification address for a single service, not to a main address you have published for years. An organizational contact address printed on cards, a website, and registration forms costs the people who can no longer find you, which makes replacing it a change of contact details needing its own announcement and overlap period rather than the steps below.

Get the order wrong and you lock yourself out:

1. Check whether any other service uses it as a recovery address or a two-factor fallback. Search the mailbox for verification and password-reset messages sent to that address; the senders are the services depending on it. Log into each and change the contact address
2. Change the account address at the service to a new alias and complete the verification message to confirm the new one actually arrives
3. Set the old alias to disabled at the forwarder rather than deleting it. A disabled alias keeps rejecting mail, whereas deletion frees the string on a shared domain for someone else to register
4. On your own domain, add a rule at the mail provider sending that address to the trash. Catch-all does not stop accepting mail just because you stopped using an address

The rebuilding-afterwards stage in [digital preparation for domestic violence survivors](../scenarios/domestic-violence.md) uses the same procedure. Disabling an alias generates no notification; what the other party observes is mail bouncing, with no indication of when you did anything.

## Getting started

There is no need to convert every account at once. Open an account at one forwarding service; the lowest barrier is DuckDuckGo Email Protection, which is free, unlimited, and asks for no payment details. Then pick whichever online shop sends you the most promotional mail, change its notification address to a freshly generated alias, and watch for two weeks.

Once that feels routine, follow the order in [what an ordinary person should have in place](../scenarios/everyday-baseline.md) and swap addresses as your password manager walks you through changing passwords site by site.

Generating aliases can be delegated to the password manager. Bitwarden's username generator has built-in integrations with six forwarding services[^bw-gen]: SimpleLogin, addy.io, Firefox Relay, Fastmail, Forward Email, and DuckDuckGo. Forward Email on that list is another open-source forwarder, not covered separately above.

Setting it up means generating an API key from the forwarding service's account settings, usually under an "API" or "developer" heading, and pasting it into Bitwarden. New login entries can then generate an alias directly and store it in the vault.

Back up the vault itself. When aliases are scattered and you only remember a few of them, the vault is the only complete index of which address belongs to which service; [getting started with password managers](./password-manager.md) covers backup and recovery under "Backup and recovery".

## :material-chat-question: Related concepts

<div class="grid cards" markdown>

- [:material-chat-question: How to build a threat model](../basics/threat-model.md)
- [:material-account-multiple-outline: Keeping several online identities apart](../basics/multiple-identities.md)
- [:material-chat-question: What metadata is](../basics/metadata.md)
- [:material-key-variant: Getting started with password managers](./password-manager.md)
- [:material-newspaper-variant-outline: Protecting sources as a journalist](../scenarios/journalist.md)

</div>

## :fontawesome-solid-diagram-project: Where to go next

<div class="grid cards" markdown>

- [:material-shield-lock-outline: Personal privacy guidance track](../community/privacy-guide.md)
- [:material-lifebuoy: Emergency help](../help/index.md)
- [:material-translate-variant: Translation and localization](../community/i18n.md)

</div>

[^sl-pricing]: [SimpleLogin Pricing](https://simplelogin.io/pricing/){target="_blank"} — alias and mailbox counts per tier, custom domain and PGP availability. Proton's Swiss registration is stated on the [SimpleLogin home page](https://simplelogin.io/){target="_blank"}.
[^addy-faq]: [addy.io FAQ](https://addy.io/faq/){target="_blank"} — which tiers include GPG encryption, the Postfix requirement for self-hosting, and the message retention policy. Tier limits are on the [addy.io home page](https://addy.io/){target="_blank"}.
[^addy-legal]: [addy.io Terms](https://addy.io/terms/){target="_blank"} and [Privacy](https://addy.io/privacy/){target="_blank"} — governing law is that of England and Wales; data is stored on servers in the Netherlands.
[^relay]: [Firefox Relay](https://relay.firefox.com/){target="_blank"} — Mozilla; the 5-mask free tier, the difference between the two paid tiers, and the list of 34 countries and territories.
[^ddg-privacy]: [Does DuckDuckGo save my email messages?](https://duckduckgo.com/duckduckgo-help-pages/email-protection/privacy/does-duckduckgo-save-my-messages){target="_blank"} — the statement that neither messages nor headers are retained. Address types are described under [Duck Addresses](https://duckduckgo.com/duckduckgo-help-pages/email-protection/duck-addresses){target="_blank"}.
[^apple-hme]: [Set up and use Hide My Email in iCloud+](https://support.apple.com/guide/icloud/set-up-hide-my-email-mm9d9012c9e8/icloud){target="_blank"} — Apple Support; the iCloud+ requirement and where addresses can be generated.
[^rfc5233]: [RFC 5233: Sieve Email Filtering: Subaddress Extension](https://www.rfc-editor.org/rfc/rfc5233.html){target="_blank"} — IETF; names the part before the plus sign the user and the part after it the detail.
[^sl-block]: [Report blocking website](https://simplelogin.io/docs/report-blocking-website/){target="_blank"} — SimpleLogin documentation; the reporting process and the custom-domain workaround.
[^ded]: [disposable-email-domains](https://github.com/disposable-email-domains/disposable-email-domains){target="_blank"} — a community-maintained list of disposable mailbox domains; submissions require a screenshot showing the domain can generate disposable addresses.
[^einvoice]: [Mobile barcode registration](https://www.einvoice.nat.gov.tw/accounts/signup/mw){target="_blank"} — Ministry of Finance E-Invoice Platform, Taiwan; the phone and email verification steps.
[^proton-alias]: [Hide-my-email aliases](https://proton.me/support/pass-email-alias){target="_blank"} — Proton support; 10 each on Free and Mail Plus, unlimited on Pass Plus and Unlimited, and where aliases are created.
[^proton-plans]: [Proton plans](https://proton.me/support/proton-plans){target="_blank"} — Proton's plan comparison; mailbox address counts and hide-my-email quotas per plan.
[^proton-catchall]: [Catch-all addresses](https://proton.me/support/catch-all){target="_blank"} — Proton support; catch-all requires a custom domain and a paid plan.
[^proton-business]: [Proton for Business](https://proton.me/support/proton-for-business){target="_blank"} — Proton support; Mail Essentials address and domain counts, and the split that puts Proton Pass only in Workspace and Pass for Business plans.
[^proton-simplelogin]: [Link your SimpleLogin account to your Proton Account](https://proton.me/support/link-simplelogin-account-proton-account){target="_blank"} — Proton support; which plans upgrade automatically, what SimpleLogin Premium includes, and the double-billing warning.
[^proton-nonprofit]: [Nonprofit discount](https://proton.me/business/nonprofit-discount){target="_blank"} — Proton's nonprofit discount page for business plans; the eligibility wording and the requirement to contact sales for pricing.
[^proton-vault]: [Share vaults in Proton Pass](https://proton.me/support/pass-browser-share){target="_blank"} — Proton support; deleting a shared vault owner's account deletes the vault and its contents.
[^bw-gen]: [Username Generator](https://bitwarden.com/help/generator/){target="_blank"} — Bitwarden documentation; the list of six forwarding service integrations.
