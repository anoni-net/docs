---
title: Why We Say "Orthodox Chinese" Rather Than "Complex Chinese"
description: In our own translations, documentation, and upstream contributions, the community uses 正體中文 (orthodox Chinese) rather than 繁體中文 (complex Chinese). The history, the linguistics, and why we do not ask English to change.
icon: material/format-letter-case
---

# :material-format-letter-case: Why We Say "Orthodox Chinese" Rather Than "Complex Chinese"

This page explains a naming choice inside Chinese, written in English because the people it most affects are often not Chinese readers: upstream maintainers reviewing our localization pull requests, translation coordinators deciding what a locale should be called, and anyone wondering why a string in one of our contributions changed from one Chinese label to another.

In our own writing, translations, and upstream contributions, the community uses **正體中文** (`zhèngtǐ`, "orthodox" or "proper form" Chinese) in preference to **繁體中文** (`fántǐ`, "complex form" Chinese).

## The position

Where we can use 正體 in our own content, we do.

- Documentation, blog posts, and community discussion: 正體中文
- Upstream translations such as CryptPad, Tor documentation, and OONI: strings we can change become 中文(正體)
- System settings and third-party menus that still say 繁體中文: we do not press for change
- English usage, where "Traditional Chinese" is standard: **we do not ask English to change**

That last point is the one upstream maintainers usually want answered. This is not a request to rename anything in English.

## Why

### What 繁 implies

The term 繁體中文 presupposes a comparison: relative to another script (simplified), this one is 繁, meaning complex, cumbersome, heavy.

In Taiwan, Hong Kong, and Macau, this script is the continuation of the Han character tradition. Chronologically:

- Han characters evolved over millennia, and until the mid-twentieth century this was the script
- In 1956 the People's Republic of China published its character simplification scheme, followed by the complete list of simplified characters in 1964, systematically simplifying character forms
- The contrast between "complex" and "simplified" only exists after that scheme

Naming the pre-existing script "complex" applies a label backwards, from the perspective of a later comparison.

### Naming shapes understanding

A child learning to write for the first time absorbs how their textbook names the script. 繁體 suggests "complicated", "harder to learn", "relative to a simplified version". 正體 suggests "orthodox", "continuing the tradition".

Both names carry a position and neither is neutral. Our community adopting 正體 deliberately puts the fact that this script continues the Han tradition back into what it is called, rather than accepting the comparative frame 繁體 implies.

### It is part of the advocacy work

Operating systems, third-party software, and the media generally still use 繁體中文. Asking everyone to change is neither realistic nor our aim. **Using the script's own name in the translations and content we contribute ourselves** is something anyone can do in passing, and it accumulates.

CryptPad 2026.5.0 changing its menu entry from 中文(繁體) to 中文(正體) is one concrete result. The story is in [CryptPad 2026.5.0 ships Traditional Chinese as a built-in locale](../blog/posts/2026-cryptpad-zh-hant.md).

## How this relates to `zh_Hant` and `zh_Hans`

At the locale identifier level, we follow BCP 47:

| Locale code | Chinese name we use |
|---|---|
| `zh_Hant` | 中文(正體) |
| `zh_Hans` | 中文(簡體) |
| `zh_TW` | A region tag (Taiwan). Not deprecated, and it means a region rather than a script. New content prefers the script tag `zh_Hant`, with `zh-Hant-TW` where a region genuinely matters |
| `zh_CN` | A region tag (China), with the same reasoning in favour of `zh_Hans` |

The subtags themselves, `Hant` and `Hans`, correspond to "Han Traditional" and "Han Simplified", and the English labels are "Traditional Chinese" and "Simplified Chinese". We do not try to change English usage. **The asymmetry, where the Chinese label says 正體 and the English label says Traditional Chinese, is acceptable**, because the two languages carry different histories.

## Common responses

??? question "Isn't 正體 a politically loaded term?"

    The term was progressively promoted in Taiwanese government documents and Ministry of Education usage from the 2000s onward, with historical and political factors behind that. The argument on this page is not a political claim. It is an observation about the comparative frame a name implies, and the same argument holds in a purely lexicographic context.

    We do not ask any reader to adopt this usage, and we do not claim it is the only correct name. This page describes the choice we make in content we contribute ourselves, and why.

??? question "繁體 is standard in Mainland China. Does using 正體 create a communication barrier?"

    In everyday conversation with people who use simplified Chinese, following the other person's usage is generally smoother. The position here concerns **content we contribute**: translations, documentation, upstream pull requests, not casual conversation.

    Using 正體 in content does not make it unreadable for simplified Chinese readers. The term is understood in simplified-script contexts too, just not as the default.

??? question "Unicode says Traditional and Simplified. Doesn't that settle it?"

    Unicode uses `Hant` and `Hans`, which correspond to Traditional and Simplified in Latin script. That is fine as English. What this page discusses is **the Chinese side**: what the script should be called in Chinese. The English label is a choice within another language, and it is a separate question from what Chinese speakers call their own script.

??? question "What if an upstream maintainer asks for 繁體中文 in my contribution?"

    Follow the upstream decision. Our position is to change it where we can, not to insist. Where upstream specifies terminology, that specification wins. In the CryptPad case, the community proposed 中文(正體) in the pull request, upstream agreed, and that is why it merged.

## Citing this

To reference this position elsewhere, link to the Chinese original, which is the canonical statement:

```
https://anoni.net/docs/community/zh-hant-naming/
```

## Related

- [Localization and translation](./i18n.md)
- [CryptPad 2026.5.0 ships Traditional Chinese as a built-in locale](../blog/posts/2026-cryptpad-zh-hant.md)
- [Contributor handbook](./contributor-handbook.md)
