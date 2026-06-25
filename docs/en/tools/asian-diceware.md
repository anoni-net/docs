---
title: "Asian Diceware: an Asian-flavored passphrase wordlist"
description: A community-made open-source passphrase wordlist that blends common English with dictionary-attested Asian loanwords (tofu, boba, oolong, kimchi), built as an EFF-compatible drop-in. How to use it, when to use it, how strong it is, and why randomness is the whole point.
icon: material/dice-multiple-outline
---

# :material-dice-multiple-outline: Asian Diceware: an Asian-flavored passphrase wordlist

A long random password is the safest, but nobody can remember one, so most people fall back on a birthday plus a pet's name and reuse it everywhere. There is an easier way: roll a few dice, pull a handful of English words from a fixed list, and string them together as your password. This kind of "passphrase" is easy to remember and easy to type, yet far stronger than a hand-picked password. You have probably met this idea already (the next section lists a few examples). What we made is an Asian-flavored version, blending in Asian loanwords that English already absorbed, so the words feel familiar to people who grew up around Asian languages and food. Before you start, read [Threat modeling](../basics/threat-model.md) to be clear about who you are defending against.

## You have already seen this idea

Turning a string of computer-generated randomness into a few memorable, writable English words shows up in many places you have used:

- **The seed phrase from a crypto wallet:** the 12 or 24 English words your wallet told you to write down and keep safe are the largest deployment of this idea, turning the wallet's key into a string you can copy onto paper (the standard is called BIP-39, with wordlists in many languages)[^bip39]. See [The cryptocurrency privacy spectrum](./crypto-privacy-spectrum.md) for background.
- **The generator built into your password manager:** Bitwarden's "Passphrase" and 1Password's "Memorable Password" produce one of these with a click, backed by the same kind of wordlist — open the manager you already have and try it now[^pwmgr].
- **Accounts that take no personal data:** Tor's [AnonTicket](https://anonticket.torproject.org/){target="_blank"} lets people file reports anonymously with no email; the identifier is just six random English words[^anonticket]. SecureDrop, which lets journalists receive leaks, generates a "seven random words" login codename for each anonymous source[^securedrop].
- **That famous comic:** xkcd's "correct horse battery staple" is exactly this — four random English words a computer struggles to guess but a human can remember[^xkcd].

Tails suggests one of these passphrases when you create its encrypted storage (since 5.12)[^tails], and reading a long key fingerprint aloud as words rather than digits is less error-prone on a phone call (the old PGP word list trick)[^pgpwords]. What we made is the same idea, with an Asian flavor.

## It is called Diceware

The technique has a name, Diceware, proposed by Arnold Reinhold in 1995[^reinhold]. The idea is simple: each word maps to a set of dice values, you roll the dice, look the number up in the table, and the word you find becomes part of your passphrase; repeat a few times to build a phrase. The randomness comes from real dice and never passes through your hands, so the result cannot be guessed from your habits or preferences. The 7,776-word list EFF released in 2016 — picking words that avoid hard spellings, profanity, and confusable homophones — is the most widely recommended English version[^eff].

## What we made

asian-diceware is a 7,776-word, EFF-compatible wordlist that works as a drop-in replacement for the EFF Large Wordlist, matching its security and usability. The difference is the vocabulary: we pin 161 dictionary-attested Asian loanwords (verified against OED, Merriam-Webster, and Cambridge) and fill the rest with the most common, easy-to-spell English words.

These loanwords are especially recognizable to readers across the Sinophone world and Asia: `tofu`, `ramen`, `miso`, `matcha`, `karaoke`, `tsunami`, `kimchi`, `bibimbap`, `typhoon`, `oolong`, `yoga`, `karma`, `curry`, `mango`. Some carry a Sinophone flavor — `oolong`, `boba` (bubble tea, which originated in Taiwan), `ketchup` (whose root traces to Hokkien), `pinyin`. Others you might not realize are Asian loanwords at all, like `shampoo`, `bungalow`, `jungle`, `gecko`, `bazaar`, and `guru`.

Two limits on word choice are deliberate. First, a loanword must be a single English-dictionary token, so spaced forms like `feng shui`, `kung fu`, and `dim sum` are out. Second, we do not transliterate Mandarin ourselves, because several competing romanizations (Hanyu Pinyin, Wade-Giles, Tongyong) coexist, so we only accept words whose English spelling is already fixed in a dictionary.

The wordlist is open source (code under MIT, the wordlist data under CC-BY-4.0); the source and full list are at [GitHub anoni-net/asian-diceware](https://github.com/anoni-net/asian-diceware){target="_blank"}. The list itself only makes the word-picking step easy to recognize and remember; it provides no encryption. The real security comes from how you generate, store, and use the passphrase.

## How to use it

Rolling dice against a table is the most direct way; a handful of dice plus one table is enough, no coding required. There are two ways to get the table: print the A5 booklet ([download the PDF](https://assets.anoni.net/file/asian_diceware_7776_booklet_a5_v0.3.1.pdf){target="_blank"}, more in [Print a booklet](#Print-a-booklet) below), or open the dice file [`asian_diceware_7776_dice.txt`](https://raw.githubusercontent.com/anoni-net/asian-diceware/main/output/asian_diceware_7776_dice.txt){target="_blank"} on GitHub.

**Method 1 — physical dice.** Roll 5 dice and read them left to right as a five-digit number (each die 1–6). The table is sorted by code, so flip or search to the line that starts with your five digits; the word after it is the one you drew. Repeat six times and join them with `-`. For example, rolling `6 3 4 4 4` reads as `63444`, which maps to `tofu`.

No dice? They are cheap — stationery shops, convenience stores, and game shops all carry them, a set costs next to nothing, you can borrow some, or use an offline dice-roll app (turn off the network first). Dice plus a table (print a booklet and you are set) is the complete method, with no computer needed at any point. Only if you want to skip the dice and you can code a little do you need the shortcuts below.

??? note "For developers: two no-dice shortcuts"
    Python's `secrets` is a cryptographically secure RNG, suitable for drawing words.

    ```python
    import secrets

    words = open("asian_diceware_7776.txt").read().split()
    assert len(words) == 7776
    phrase = "-".join(secrets.choice(words) for _ in range(6))
    print(phrase)        # e.g. tofu-ramen-bazaar-oolong-gecko-haiku
    ```

    Use `secrets`, not `random` — the latter is not cryptographically secure and its output can be predicted.

    No clone needed; pull the published list straight from GitHub:

    ```bash
    curl -s https://raw.githubusercontent.com/anoni-net/asian-diceware/main/output/asian_diceware_7776.txt \
      | python3 -c "import secrets,sys;w=sys.stdin.read().split();print('-'.join(secrets.choice(w) for _ in range(6)))"
    ```

The list comes in two sizes; for real use always pick the default `7776` (5 dice per word). The other, `1296`, is a strict subset that needs only 4 dice and prints shorter — handy for tests, demos, and teaching. The dice codes differ between the two, so always read the file that matches the list you chose.

If a site demands a digit or symbol, add one. Want more strength? Add words — each extra word makes it far harder to guess.

## When to use it

A passphrase is not only for logins; this "number-to-word" table is useful in several places.

!!! note "Not using a password manager yet? Upgrade your few most important accounts first"
    We still recommend a password manager — it makes a unique random password for every site. But if you cannot cross that hurdle yet, do not let it stop you from making your passwords stronger. At least give your most important accounts (email, the one that can reset the others, online banking) each a unique passphrase and memorize them. You can do this without a manager, and it is far stronger than what most people use. It does not solve the "dozens of sites each need a unique password" problem — that is the manager's job — so treat this as a first step and adopt a manager later.

- **The master password for a password manager.** The master password is the single pivot of your whole system, worth a memorable, strong passphrase; let the manager generate random long passwords for every other site.
- **Passwords you have to type by hand.** A home Wi-Fi password, signing in to a streaming account on a TV or game console, a device shared with family — anywhere you have to enter it character by character, a random string is painful, while a passphrase is easy to type and say.
- **Passphrases for encrypted disks, backups, and keys.** Full-disk encryption, encrypted backups, a PGP private key — anything where a typo locks you out and a leak exposes everything — fits a passphrase.
- **Reading a number aloud without mistakes.** To check a key fingerprint or safety number, encode the number with this table and read the words instead of the digits; it is far less error-prone. This is what the PGP word list does[^pgpwords].
- **Agreeing on a codebook with someone you trust.** Use the list as a private codebook to confirm identity or pass a pre-arranged signal — see the next section.

## How strong is six words

Six random words give a passphrase as strong as a random string you could never remember; an attacker can only try one combination at a time, essentially forever. EFF treats six words as the baseline for general use; for the most important secret, like a master password, go to seven or eight.

If you are used to 12–16 character passwords, here is the rough equivalence (the left column assumes a truly random string from a password manager, with mixed case, digits, and symbols):

| Random character password | Equivalent Asian Diceware passphrase |
|---|---|
| 12 characters | 6 words |
| 14 characters | 7 words |
| 16 characters | 8 words |

At the same strength the two are about equal; the difference is memorability. A truly random 12–16 character string is unmemorable and has to live in a manager. Six to eight passphrase words reach the same strength while you can still remember and type them. So a passphrase suits the few secrets you must memorize (a manager's master password, a disk-encryption passphrase), while the manager generates random character passwords for everything else. Those few are exactly what a manager cannot store for you — the master password cannot live inside the vault it guards, and disk unlock happens before the manager starts. So this list earns its place whether or not you use a manager.

One caveat: the equivalence above only holds for truly random generation. A password you think up yourself (swapping `a` for `@`, adding a `1` at the end) follows patterns and is usually much weaker. A passphrase's strength holds as long as you draw the words with real randomness — what you rolled with dice or `secrets` counts, while hand-picking or choosing nice-looking words does not.

??? note "The numbers behind it"
    Passphrase strength is measured in entropy (roughly, how many possibilities an attacker must try). Each word drawn from 7,776 contributes `log2(7776)` ≈ 12.925 bits, so six words are about 77.5 bits, or 2 to the power of 77.5 combinations[^eff]. Even at hundreds of billions of guesses per second (a rate depending heavily on the hashing algorithm and hardware)[^proton], the average time to find it runs to thousands of years. Each extra `7776` word adds about 12.9 bits.

    The full comparison with bit values (character passwords assume a ~94-character set):

    | Random character password | Entropy | Asian Diceware passphrase | Entropy |
    |---|---|---|---|
    | 12 characters | ~79 bits | 6 words | ~77.5 bits |
    | 14 characters | ~92 bits | 7 words | ~90.5 bits |
    | 16 characters | ~105 bits | 8 words | ~103 bits |

    A self-invented password follows patterns, so its real entropy is often far below a truly random string of the same length.

## Randomness is what matters

However good the list, if the word-picking is not random the whole passphrase falls apart.

- **Always use true randomness.** Physical dice, or a cryptographically secure RNG (Python's `secrets`, `/dev/urandom`). Do not use a non-secure RNG like `random`, do not hand-pick words, and do not choose ones that "look random" — human-picked words are far easier to guess.
- **Do not rewrite it into a sentence.** If `tofu-ramen-gecko` reads awkwardly and you smooth it into a fluent phrase, you have destroyed the randomness. Keep the order and words exactly as drawn.
- **Do not reuse.** One passphrase, one place; a master password especially must not be shared with any other service. Unless it may have leaked, you do not need to rotate it on a schedule — frequent changes tend to become unmemorable or reused. If a service does report a breach, just change that one account.
- **Store it immediately.** Do not screenshot it to a cloud photo album or paste it into a chat. Save it straight into your password manager's vault, or write it on paper and lock it away. When rolling, watch for shoulder surfers.

## Agreeing on a codebook with someone you trust

To make daily passwords stronger, the section above is enough. This section covers an advanced use of the list, for those who need it.

The dice table is really a "number-to-word" codebook, so beyond passphrases it can serve as a private code agreed with someone you trust. Decide in person what each word means; later, over a public channel (phone, text, social DM), you say that word, and an onlooker sees an utterly ordinary English word while the two of you know what it means.

!!! warning "Know its limits first"
    This kind of code is obfuscation, not encryption. It stops a casual onlooker, but not an adversary who records messages to compare later or who obtains what you agreed on, and certainly not state-level surveillance. If the content truly cannot leak, or someone's safety depends on it, do not rely on this alone — pair it with end-to-end encrypted tools (see [Secure messaging compared](./messaging-comparison.md)) and a complete safety plan. The uses below all assume this.

Everyday, low-risk uses:

- **Confirming someone is really them.** Roll a set of words together in person and each keep it; later, exchange them over a call or message to confirm you are not being impersonated. Prefer one-time use, or split it (you say the first three words, they reply with the next three).
- **Neutral codenames for people, files, and projects.** Civil-society groups and journalists often need to name a source, a sensitive file, or an ongoing project. A random word as a codename leaks less than an obvious name like "official's leak file," and a list that is seen reveals nothing about who is who.

The uses below are for higher-risk people, where the limit above matters even more — the code is only a helper, and the real content and whereabouts are protected by encryption tools and a safety plan:

- **A contact signal between a journalist and a source.** Agree on a few words at the first meeting — one for "free to talk now," another for "I'm being watched, don't reach out." Later a single word on a call covers it, with no plain talk over an unsafe channel. See [Journalists and source protection](../scenarios/journalist.md).
- **Check-in and distress words in the field.** Activists and election observers can agree on a check-in word with their logistics team and report in on a schedule; switching to another word means "something is wrong, start the plan." Because the word changes, anyone forcing you to report cannot fake it. See [Activists and protest digital safety](../scenarios/activist.md) and [Election observer self-protection](../scenarios/election-observer.md).
- **A distress code in a dangerous relationship.** Someone leaving an abuser can agree on a distress word with a trusted friend; sending it means "call me" or "call the police," with no obvious words left on a phone that might be checked. See [Domestic violence and tech-enabled abuse](../scenarios/domestic-violence.md).

A few things keep a codebook workable: agree on meanings in person and do not write them where they can be found; keep the circle small; change words when you suspect they have been figured out; and do not use the same word as both a passphrase and a code.

## Print a booklet

We laid the 7,776-word list out as an A5 dice-lookup booklet with a cover, how-to, QR, and a copyright page. It is the printed version of the table Method 1 above looks words up in, so anyone who would rather not install anything and just roll dice can print one and get started.

When the community joins in-person events (workshops, meetups, conferences), we bring printed copies to hand out. If you pick one up at an event, or run into us, you are very welcome to come and chat — about passphrases, about anonymity networks, or just to say hello. To see where we will be next, see [Activity](../activity/index.md). To reach us, see [How to Contribute](../community/how-to-contribute.md) or [Stay Informed](../contact.md) for updates.

!!! tip "Download the A5 booklet (PDF)"
    [asian_diceware_7776_booklet_a5_v0.3.1.pdf](https://assets.anoni.net/file/asian_diceware_7776_booklet_a5_v0.3.1.pdf){target="_blank"} (about 36 pages; print on A4 with any home or shop printer and fold into a booklet). The wordlist data is CC-BY-4.0, so you are welcome to print, hand out, and reuse it — please keep the attribution on the colophon page.

## An anonymous-service platform we want to build

The community also wants to build an anonymous-service platform along the lines of [AnonTicket](https://anonticket.torproject.org/){target="_blank"} (still at the planning stage). AnonTicket is a Tor Project service that lets people file reports to Tor's GitLab anonymously, identified by a system-generated string of random English words rather than an email. That kind of account code is drawn from a random wordlist — and this asian-diceware list is meant to serve as the word source for such codes in the future.

## :material-chat-question: Related reading

<div class="grid cards" markdown>

- [:material-chat-question: Threat modeling](../basics/threat-model.md)
- [:material-message-lock-outline: Secure messaging compared](./messaging-comparison.md)
- [:material-bitcoin: The cryptocurrency privacy spectrum](./crypto-privacy-spectrum.md)

</div>

## :fontawesome-solid-diagram-project: Get involved

<div class="grid cards" markdown>

- [:material-hand-heart-outline: How to Contribute](../community/how-to-contribute.md)
- [:material-translate-variant: Localization and Translation](../community/i18n.md)
- [:material-calendar-star: Activity](../activity/index.md)

</div>

[^bip39]: [BIP-39: Mnemonic code for generating deterministic keys](https://github.com/bitcoin/bips/blob/master/bip-0039/bip-0039.mediawiki){target="_blank"} - Bitcoin Improvement Proposals (wordlists in many languages, including Traditional and Simplified Chinese)
[^pwmgr]: [Bitwarden Passphrase Generator](https://bitwarden.com/password-generator/){target="_blank"} and [1Password Password Generator](https://1password.com/password-generator/){target="_blank"}
[^anonticket]: [Anonymous GitLab Ticketing: An Exciting New Project at Tor](https://blog.torproject.org/anonymous-gitlab/){target="_blank"} - The Tor Project
[^securedrop]: [SecureDrop](https://securedrop.org/){target="_blank"} - Freedom of the Press Foundation
[^xkcd]: [Password Strength (xkcd 936)](https://xkcd.com/936/){target="_blank"} - xkcd
[^tails]: [Creating the Persistent Storage](https://tails.net/doc/persistent_storage/create/){target="_blank"} - Tails
[^eff]: [EFF Dice-Generated Passphrases](https://www.eff.org/dice){target="_blank"} - Electronic Frontier Foundation
[^reinhold]: [The Diceware Passphrase Home Page](https://theworld.com/~reinhold/diceware.html){target="_blank"} - Arnold G. Reinhold
[^proton]: [What is password entropy?](https://proton.me/blog/what-is-password-entropy){target="_blank"} - Proton
[^pgpwords]: [PGP word list](https://en.wikipedia.org/wiki/PGP_word_list){target="_blank"} - Wikipedia
