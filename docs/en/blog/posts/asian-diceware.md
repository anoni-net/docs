---
date: 2026-09-02
authors:
    - anoni-net
categories:
    - Community
    - Technology
    - News
slug: asian-diceware
image: "assets/images/post-update.png"
summary: "The community built asian-diceware, a 7,776-word English passphrase wordlist that drops in for the EFF Large Wordlist and pins 292 dictionary-attested Asian loanwords. This post is about how the words were picked. The breakdown by source language is not what the people who built it expected: 102 from Japanese and 91 from South Asian languages, against 16 from Mandarin and exactly one from Hokkien. It also covers the two hard limits on word choice, why the share stops at 292 instead of rounding up to a tidy percentage, and how the build pipeline refuses to silently drop a pinned word. Code is MIT, the wordlist is CC-BY-4.0, and there is an A5 booklet PDF we also hand out at events."
description: "The community built asian-diceware, a 7,776-word English passphrase wordlist that drops in for the EFF Large Wordlist and pins 292 dictionary-attested Asian loanwords. This post is about how the words were picked. The breakdown by source language is not what the people who built it expected: 102 from Japanese and 91 from South Asian languages, against 16 from Mandarin and exactly one from Hokkien. It also covers the two hard limits on word choice, why the share stops at 292 instead of rounding up to a tidy percentage, and how the build pipeline refuses to silently drop a pinned word. Code is MIT, the wordlist is CC-BY-4.0, and there is an A5 booklet PDF we also hand out at events."
---

# How 292 Asian loanwords ended up in an English passphrase wordlist

We are a group of volunteers working on anonymity networks and internet freedom, based in Taiwan. We maintain [this documentation site](../../index.md). The community also built [asian-diceware](../../tools/asian-diceware.md), a 7,776-word English passphrase wordlist that drops straight in for the EFF Large Wordlist, with one difference: it pins 292 Asian loanwords that English dictionaries already carry. `tofu`, `oolong`, `boba`, and `kimchi` are all in there.

The tool page already covers how to use it, and the [passphrase generator](../../utils/passphrase.md) in the tools section is one click away. This post covers the other half: how the words were picked, and what got rejected along the way.

![How 292 Asian loanwords ended up in an English passphrase wordlist](./assets/images/post-update.png){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

<!-- more -->

## Why an English wordlist needs an Asian flavor at all

A passphrase is a handful of English words rolled off a fixed list and joined with a separator. The strength comes from the roll being genuinely random, not from which words come up. So if strength does not depend on the words, what does changing the list buy you?

It buys transcription. Passphrases get used where a human has to hold the thing in their head and type it by hand: the master password of a password manager, a full-disk encryption passphrase, the Wi-Fi password you enter one character at a time on a television or a games console. That is exactly why the EFF list avoids hard-to-spell words, profanity, and confusable homophones[^eff].

For someone living in Taiwan, Hong Kong, or anywhere else in Asia, `oolong` is easier to recognize than `oolite`, and `ramen` is easier to recall than `ramekin`. Drawing a word you see every day lowers the odds of writing it down wrong or misremembering it later. That is the entire argument for swapping the list contents, and passphrase strength does not move by a single bit.

## The list has to drop in for the EFF one

The first rule was fixed before anything else: exactly 7,776 words, no more and no fewer.

7,776 is 6^5, so five dice read left to right as a five-digit number land on exactly one word. Each word carries `log2(7776)` ≈ 12.925 bits, and six words give about 77.5 bits[^eff]. Hold the count at 7,776 and asian-diceware becomes a drop-in replacement for the EFF Large Wordlist: any workflow already built around the EFF list works unchanged, at identical strength.

Fixing the count turns word selection into a problem of limited seats. The 292 Asian loanwords take 292 seats, and the remaining 7,484 get filled with the highest-frequency, easiest-to-spell common English words. Every trade-off below comes back to those seats being finite.

## The breakdown by source language is not what we expected

The list was built in Taiwan, so the intuition was that Mandarin would dominate. Here is what the dictionary sweep actually produced:

| Source language | Words | Examples |
|---|---|---|
| Japanese | 102 | `sushi`, `ramen`, `tofu`, `matcha`, `karaoke`, `tsunami`, `emoji`, `umami` |
| South Asian and Sanskrit | 91 | `yoga`, `karma`, `guru`, `avatar`, `chai`, `masala`, `bazaar`, `cheetah` |
| Malay and Southeast Asian | 39 | `bamboo`, `curry`, `mango`, `durian`, `satay`, `gecko`, `shampoo`, `jungle` |
| Korean | 35 | `kimchi`, `bibimbap`, `soju`, `hangul`, `taekwondo`, `mukbang`, `bingsu` |
| Mandarin | 16 | `typhoon`, `oolong`, `pinyin`, `boba`, `lychee`, `mahjong`, `qigong` |
| Cantonese | 8 | `wok`, `wonton`, `hoisin`, `kumquat`, `loquat`, `cheongsam`, `longan` |
| Hokkien | 1 | `ketchup` |

Japanese contributes 102 and South Asian languages 91, together more than sixty percent of the total. Mandarin contributes 16. Hokkien contributes exactly one word.

The breakdown records what English absorbed, not what we wished it had absorbed. Japanese food, yoga, and Indian spices have been entering English for a long time through many channels, so the vocabulary piled up. A good share of the 35 Korean entries are recent, arriving through the OED's 2021, 2024, and 2026 batches of K-culture additions. The 16 Mandarin words skew old: `typhoon`, `ginseng`, and `kowtow` are leftovers from centuries of trade and diplomacy.

The Taiwan flavor lives inside those 16: `oolong` (the tea), `boba` (bubble tea, which originated in Taiwan), `typhoon`, and `pinyin`. Add the single Hokkien entry, `ketchup`, whose root traces back to Hokkien through the maritime trade, which is an etymology most people have never heard.

There is also a batch nobody guesses is Asian at all: `tycoon`, `honcho`, `shampoo`, `bungalow`, `jungle`, `loot`, `thug`, `atoll`, `gecko`, `cheetah`, `gong`, `dinghy`, `mongoose`. People use them daily and the origin has long since dissolved into English.

## Two hard limits on word choice

### Only single-token words a dictionary already carries

`feng shui`, `kung fu`, and `dim sum` are all well known in the English-speaking world. None of them made it in, because of the space in the middle.

A passphrase is built by joining drawn words with a separator such as `-`. Draw a word containing a space and the boundaries become ambiguous, which breaks transcription, dictation, and typing. The value of the list is that you can write it down and read it back, so a word that invites transcription errors cannot be included no matter how representative it is.

Dictionary attestation is the other hard requirement: all 292 were verified in the OED, Merriam-Webster, or Cambridge. That requirement is there to block the judgment call of "surely English speakers know this one", which is usually wrong.

### No home-grown romanization of Chinese

The alternative approach was to transliterate common Chinese words into Latin letters ourselves, which would have raised the Chinese share immediately. We did not take that route.

Taiwan runs Hanyu Pinyin, Wade-Giles, and Tongyong Pinyin side by side, and Hong Kong adds Jyutping for Cantonese. The same sound spells differently across systems, and different sounds can end up looking alike within one system. Ambiguity is the one thing a passphrase list cannot tolerate: give a word two plausible spellings and whoever wrote it down has a coin-flip chance of not opening their own disk.

Romanized syllables are a worthwhile project on their own. They belong in a separate one, after the choice of romanization standard has been settled, rather than smuggled into a list built on English.

## Why it stops at 292 instead of a round number

292 out of 7,776 works out to roughly 3.8%. The number looks arbitrary, and it is really just what was left after scraping the barrel.

An exhaustive sweep of the OED, Merriam-Webster, and Cambridge turns up about 330 Asian loanwords a reader in Taiwan, Hong Kong, or the wider Sinophone region would actually recognize. 292 are pinned into the list and about 40 are held in reserve, so the recognizable well is nearly dry. Version v0.4.0 expanded the set from 161 to 292 under a recognizability-first rule: verified-but-obscure words get parked rather than padded in to reach a tidy 4%[^repo].

Pushing higher, say to 10% or about 778 words, leaves two options. Flood the list with obscure entries such as `puttee`, `howdah`, `nilgai`, and `maund`, which most people cannot spell, say, or recall, destroying the property the list exists to preserve. Or switch to romanized Mandarin syllables, which is the separate project from the previous section.

The tool page compares the share to a beer's ABV: a deliberately chosen number, not a watered-down accident. The analogy breaks at the last step. Higher alcohol content changes something; a higher Asian share changes nothing. Whether you draw `tofu` or `the`, every word carries the same 12.925 bits. The entropy comes from the list being exactly 7,776 words with every roll uniform, never from where the words came from. When cultural coverage conflicts with usability, usability wins.

## What the build pipeline throws out

The list is not hand-assembled. It comes out of a repeatable pipeline in six stages: collect, normalize, quality-filter, prune, assemble, validate[^repo].

The frequency ranking comes from a vendored snapshot of [wordfreq](https://github.com/rspeer/wordfreq){target="_blank"}, used only as a ranking input. The quality filter strips proper nouns, acronyms, and junk, all of which look like English words while making a passphrase harder to type or harder to read back.

Prune is the awkward stage, because it handles prefix collisions. A good passphrase wordlist has the property that no word is the prefix of another, which means words can be concatenated without separators and still decoded unambiguously. Keeping that property means one of any two words where one prefixes the other has to go.

The problem is that the word being dropped might be one of the pinned loanwords. The rules are explicit:

- Pinned words are protected. When a prefix collision involves a pinned word and an unpinned one, the unpinned word is dropped.
- When two unpinned words collide, the lower-frequency one is dropped.
- When two pinned words collide with each other, the build fails outright and prints the offending pair, so a human edits the source data and decides which one goes.

The third rule is deliberate. Auto-dropping a pinned word would quietly cost the list an Asian loanword and nobody would notice. A failing build is loud, and loud is correct here: a missing word is exactly the kind of problem that needs a human to see it.

Validation closes the pipeline with eight acceptance tests plus an audit by the external `wla` tool, confirming a length of 7,776, unique decodability, 12.925 bits per word, and no duplicates. Nothing ships until that passes.

## Licensing, and how to get a copy

Code is MIT, wordlist data is CC-BY-4.0, and the source and full list live at [GitHub anoni-net/asian-diceware](https://github.com/anoni-net/asian-diceware){target="_blank"}. The frequency snapshot is a ranking input only; the words themselves are common English vocabulary.

CC-BY-4.0 means you can print it, hand it out, and modify it, as long as the attribution stays. We laid the 7,776 words out as an A5 dice-lookup booklet with a cover, instructions, a QR code, and a colophon. The [PDF is a direct download](https://assets.anoni.net/file/asian_diceware_7776_booklet_a5_v0.4.0.pdf){target="_blank"}, about 36 pages, printable on A4 at home or at a convenience store and folded into a booklet.

One practical detail from making the booklet is worth passing on. CJK fonts have to be embedded in the PDF, or the Chinese turns into empty boxes on someone else's computer, and the license for macOS's built-in PingFang does not permit embedding for redistribution. So the booklet uses Noto Sans TC and JetBrains Mono, both freely embeddable, and anyone can reprint it without a licensing problem. If you want other people to be free to redistribute your work, the font layer needs handling too.

The community brings printed copies to workshops, meetups, and conferences. If you pick one up at an event, or simply run into us, come and say hello. Ask about passphrases, ask about anonymity networks, or just chat. Where we will turn up next is on the [activity page](../../activity/index.md).

## Why a community like ours builds a wordlist

A passphrase wordlist looks like a detour from anonymity networks. The connection runs through a project still on the drawing board.

The Tor Project runs [AnonTicket](https://anonticket.torproject.org/){target="_blank"}, a service that lets people file issues to Tor's GitLab anonymously with no email, identified by a codename made of random English words[^anonticket]. SecureDrop, which lets journalists receive leaks, does the same thing with a seven-word login codename for every anonymous source[^securedrop]. Those codenames have to be sayable, writable, and hard to confuse, and they come from a curated wordlist.

The community wants to build something like AnonTicket, still at the planning stage. asian-diceware was prepared as the codename source for that kind of service, and became a usable passphrase wordlist along the way. Building an anonymous reporting channel that never asks for an email needs this piece among others.

## Related reading

- [Asian Diceware, an Asian-flavored passphrase wordlist](../../tools/asian-diceware.md): the full dice method, strength comparison, randomness rules, and the codebook technique
- [Eight new tools on the docs site, all running in the reader's own browser](./2026-browser-side-utils.md): how the passphrase generator works, including physical dice mode
- [Getting started with password managers](../../tools/password-manager.md): passphrases suit the few passwords you have to memorize; hand the rest to a manager
- [Threat modeling](../../basics/threat-model.md): work out how strong your passwords actually need to be

[^eff]: [EFF Dice-Generated Passphrases](https://www.eff.org/dice){target="_blank"} - Electronic Frontier Foundation
[^repo]: [anoni-net/asian-diceware](https://github.com/anoni-net/asian-diceware){target="_blank"}, `README.md` and `SPEC.md`, v0.4.0 (released 2026-06-25)
[^anonticket]: [Anonymous GitLab Ticketing: An Exciting New Project at Tor](https://blog.torproject.org/anonymous-gitlab/){target="_blank"} - The Tor Project
[^securedrop]: [SecureDrop](https://securedrop.org/){target="_blank"} - Freedom of the Press Foundation
