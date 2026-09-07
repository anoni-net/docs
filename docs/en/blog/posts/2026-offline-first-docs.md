---
date: 2026-09-08
authors:
    - anoni-net
categories:
    - Community
    - Privacy
    - Technology
slug: 2026-offline-first-docs
image: "https://assets.anoni.net/blog/offline-library-2609-en.webp"
summary: "At Global Gathering 2026 in early September we joined the Circles and talked about how the privacy material on the docs site is written and layered. The responses were almost entirely positive and converged on one point: war, government interference and uneven distribution of network resources all degrade connectivity to where information and knowledge stop moving in time, and a guide that only opens on a healthy connection is unavailable exactly when it matters. The site now stores pages on the device as they are read, offers one button to take the whole site before a flight and another to clear it before a border, and the fourteen tools in the utilities section run with no network and no installation on any operating system with a browser. The second half covers the technical side: how six caches divide the work in the Service Worker, how stale content on a device gets updated, why the site's passkey has no account and no server, and why age was chosen for encryption. The tools are still basic components and whole-site offline reading is a working prototype, so we want more input on what people expect from it."
description: "At Global Gathering 2026 in early September we joined the Circles and talked about how the privacy material on the docs site is written and layered. The responses were almost entirely positive and converged on one point: war, government interference and uneven distribution of network resources all degrade connectivity to where information and knowledge stop moving in time, and a guide that only opens on a healthy connection is unavailable exactly when it matters. The site now stores pages on the device as they are read, offers one button to take the whole site before a flight and another to clear it before a border, and the fourteen tools in the utilities section run with no network and no installation. The second half covers the technical side: six caches in the Service Worker, updating stale content on a device, a passkey with no account and no server, and why age was chosen for encryption."
---

# Storing the whole docs site and its tools on a device, so they open with the network off

From 4 to 6 September we were at Global Gathering 2026 in Estoril, Portugal. Alongside our booth on the last day we joined the Circles, where we talked about how the privacy material on [the docs site](../../index.md) is written and how it is layered.

The conversation kept returning to one premise. The moment a reader needs these pages is not reliably a moment with a working connection.

![The top of the offline reading page: storage totals, the automatic-storage and inline-image switches, and the Save everything, Update what is stored and Clear all offline content buttons](https://assets.anoni.net/blog/offline-library-2609-en.webp){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

<!-- more -->

## What we heard at Global Gathering

The responses were almost entirely positive, and they converged on the same point. War, government interference and uneven distribution of network resources all degrade connectivity to where information and knowledge stop moving in time. A guide that only opens when the connection is healthy is unavailable exactly when it matters.

Offline reading already had a section in [the tools post](./2026-browser-side-utils.md) at the end of August. That feedback is why we moved it from a side feature to the main line of work, and everything added since has been built around it.

The first half below describes what a reader actually sees. The second half covers how it works.

## Pages are stored as you read them

Opening the docs site in an ordinary browser stores only the [offline reading](../../offline.md) page and the styles it needs, about 1 MB, so there is somewhere to land with the network off.

The core chapters for that language follow in the background once you pick a reading language on the home page or open a second page in the same language: roughly 12 MB of text covering concepts, tools, advanced and regional, plus the four utilities that get used during an outage, currently `56` pages in English. The extra step is deliberate, so that someone who reads one page and leaves never spends 12 MB of mobile data.

Only the language you switch to gets downloaded, so a device ends up holding only the languages actually read. Pages visited afterwards are stored too, under the switch on the offline reading page.

[Scenario pages](../../scenarios/index.md) for journalists, activists, LGBTQ readers and domestic abuse are excluded from that prefetch and only stored if a reader opens one. Their presence on a device is itself a signal, so keeping them is the reader's decision.

## One button before a flight

The **Save everything** button on the offline reading page stores every page in the current language, `196` pages in English at the time of the screenshot, which covers a flight, a train, or any stretch of a journey without coverage.

What that button stores survives a site release, while the chapters the site stores automatically are cleared and re-downloaded on each release. It handles one language at a time, so carrying all three means pressing it once on each language's offline reading page.

The automatically stored chapters are text only and lose their images offline. A separate option downloads the inline images of the core chapters as well, about 7 MB more, and it is off by default because most readers are on mobile data. Pages a reader ticks individually always come with their images.

To carry only part of the site, expand a chapter, tick pages, and apply the change. [Start from who you are](../../start/index.md) also has a one-press button that stores every page along that reading path.

## One button before a border

**Clear all offline content** on the same page removes what the site stored and what the reader picked, and switches automatic storage off, so pages read afterwards no longer stay on the device. Turning the switch back on restores the behaviour.

That button exists for a reason as concrete as the one above it. When a device may be inspected, a complete anonymity and privacy guide sitting on it is something you have to explain.

The offline reading page itself and the styles it needs are outside the switch and come back the next time you are online, about 1 MB. They stay because the moment you want to clear a device, or check what is still readable, is often the moment you have no connection, and without that page all that is left is the browser error screen.

## No installation, which matters more than it sounds

The [utilities section](../../utils/index.md) currently holds fourteen tools: a threat model checklist, a passphrase and password generator, local file encryption, a passkey page, a preparation checklist, QR code generation, reading and frame streaming, file hash comparison, a file metadata stripper, screenshot redaction, a URL cleaner, an invisible character detector, and a page listing what a browser gives away.

Each tool's code and data are stored alongside the page that carries it and keep working with the network off. The QR code generator, reader and frame streamer plus the passphrase generator are prefetched with the core chapters, because they get used [during an outage](../../scenarios/shutdown.md). The rest are ticked individually on the offline reading page.

Skipping installation removes several constraints at once:

- **Any operating system**: Windows, macOS, Linux, Android and iOS all behave the same, as long as there is a browser
- **No install rights needed**: a borrowed laptop, a public machine, or a managed device that forbids new software all work
- **No installation trace**: one more privacy app in a device's app list is itself a signal, and a web page skips that layer
- **No version drift**: nobody ends up carrying a three-year-old copy with a fixed problem still in it

A tool that keeps working with the network off is also the most direct evidence that it is not sending anything out. Open the network tab of the developer tools, run one piece of data through any of them, and watch for outbound requests. It takes under a minute, which is faster than reading the source.

![The passkey page, with three steps: create a passkey, try one unlock, and generate a backup key, each with its own explanation and button](https://assets.anoni.net/blog/utils-passkey-2609-en.webp){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

## The technical half

Everything above is what a reader sees. What follows is how it works, and the reasoning behind a few choices that look odd from the outside.

## Offline reading is a Service Worker storing pages one at a time

A Service Worker is a piece of background code the browser provides. Once registered it intercepts every request to that site and decides whether to go to the network or answer from a cache on the device. The docs site uses it for two things: putting pages on the device, and serving them from there when there is no network.

The code lives in [`docs/zh-TW/sw.js`](https://github.com/anoni-net/docs/blob/main/docs/zh-TW/sw.js){target="_blank"}, currently 1388 lines, and splits the storage into six caches:

- **PRECACHE**: the app shell and the core chapters of the current language, named with the build version, so a release drops the whole set and re-downloads it
- **RUNTIME_PAGES**: pages picked up as the reader browses, capped at 120
- **RUNTIME_ASSETS**: the images and fonts those pages reference, capped at 200
- **LIBRARY**: pages the reader ticked on the offline reading page
- **LIBRARY_ASSETS**: the images and scripts those pages reference, kept separate so the on-screen count of pages the reader picked stays accurate
- **SETTINGS**: the two switch values, automatic storage and inline images

Keeping the reader's own selection separate has two reasons. The runtime caches have entry limits, and a few rounds through image-heavy pages would evict exactly the pages someone meant to keep. PRECACHE follows the build version and is cleared on every deploy, and something a reader deliberately kept should not disappear because the site shipped.

The two runtime caches are only written while automatic storage is on. They used to be written unconditionally, which meant that after a reader pressed Clear all offline content, every page they read went straight back onto the device. Someone presses that button because their device may be inspected, and a stated no should hold.

The switch values live in Cache Storage rather than localStorage. A Service Worker cannot read localStorage during install, and the fact that a reader once cleared their offline content has to survive into the install of the next deploy. Otherwise it all comes back the following day and the clearing meant nothing.

Tor Browser and the onion and IPFS editions register no Service Worker at all, which is deliberate. The recommended pattern is to prepare the offline copy from anoni.net in an ordinary browser and return to Tor Browser for anonymous reading.

## How stale content on a device gets updated

Freshness comes from network-first. Navigation requests always go to the network, store what comes back, fall back to the cache on timeout or failure, and fall back again to that language's offline page. Reading online is therefore always current, and the only thing that goes stale is the offline copy on the device.

When a new version ships, a card floats up at the bottom of the screen reading "A newer version is available for offline reading. Updating reloads this page." Nothing is applied until the reader presses Update. Requiring that press is deliberate, because applying it reloads the current page and loses the reader's position, which is the one surprising part, so it is written on the card. Skipping it is fine, and the offline copy stays as it is until the reader decides.

Installing the site as an app introduces one extra problem. The browser's soft update is triggered by navigation, which happens constantly in a tab, but a PWA sitting in the background produces no new navigation when it returns to the foreground, so the update card never appears and the reader has no update button at all. The fix is asking for a new version explicitly on foreground, throttled so that switching apps does not fire a request every time.

Pages a reader ticked do not follow releases. The offline reading page carries a separate Update what is stored button that re-fetches them page by page.

One more layer concerns the HTTP cache. Every request the Service Worker issues carries `cache: "no-cache"` so that it bypasses the browser's own HTTP cache. A fetch without that option consults the device's HTTP cache first and answers from it on a hit, so network-first appears to have asked the network while it actually asked itself, and that stale response is then written back into the runtime cache, keeping old content on the device even longer.

That happened on 2026-08-28. A Cloudflare Cache Rule setting all HTML to `max-age=14400` kept newly published content out of the PWA for four hours. Readers in a Safari tab never noticed, because entering from the address bar or pulling to refresh bypasses the HTTP cache anyway, while a cold start of the installed app and in-site link clicks do not. On top of that, an iOS home screen app has its own storage partition, so fresh content fetched in Safari never reached it, and only the PWA stayed on the old version.

The fix that day landed in two layers. The nginx server sends `no-cache` for pages under `/docs/` and for the two index files, the Cloudflare rule was changed to respect the origin, and the Service Worker still carries its own `no-cache`. The two layers are independent, because upstream settings get changed by people who have no reason to know a Service Worker depends on them, and the symptom is readers not receiving freshly published content, which is hard to notice by clicking around in a browser.

## The site's passkey has no account and no server

A passkey is a credential held on a device or in a password manager. When a site asks it to sign, the reader approves with a fingerprint, a face or a PIN, and it signs. It is normally used for logging in. [The way the site uses it](../../tools/what-is-passkey.md) is entirely different: no login, no account, no server. We use it as the key to the reader's data, and the same passkey supports two mechanisms.

### One, the data key rides inside the passkey

Creating the passkey generates a random data key on the site and places it in the credential's `user.id` field. Every subsequent verification returns it verbatim from wherever the passkey is held. One verification on any device holding that passkey brings the data key back into the page, which then decrypts the ciphertext stored on the device.

[The preparation checklist](../../utils/checklist.md), saved [threat model](../../utils/threat-model.md) answers and the recipient book in local file encryption all share one vault and one ciphertext.

### Two, PRF derives the key on the spot

The WebAuthn PRF extension gives a passkey an extra internal secret that never leaves the authenticator. The page supplies an input on each verification, and after the reader approves, the authenticator returns a fixed 32-byte output. The same passkey with the same input always produces the same output, which turns the passkey into a key calculator that only answers when a finger is on the sensor.

[Local file encryption](../../utils/age.md) wraps age's file key with that output. Without the passkey the key cannot be derived and the data is just ciphertext. That is a different thing from "shown only after verification", which is a gate written into a web page and can be walked around by anyone.

### Why the vault deliberately takes the weaker of the two paths

The vault uses `user.id` rather than PRF. Apple's implementation does not pass the PRF inputs to any provider other than the iCloud Keychain, so an iPhone paired with Bitwarden can create a passkey but cannot derive a key. `user.id` is a core field that every provider is required to return, and we verified it on an iPhone with Bitwarden and on Chrome on a computer.

The cost is stated on the page. The data key sits in the password manager alongside the credential, so its security equals that manager's security. Whoever can unlock the password manager obtains the key, and an export file, a shared vault, or a server breach combined with a weak master password all lead to the same place. That is the same tier as a device's screen lock: enough for most people, not enough against an adversary who can reach the device and compel an unlock. The threat model checklist stops offering to save answers once that tier of adversary is selected.

Between coverage and the security ceiling we chose coverage. The design question we ask first is whether an approach works on an iPhone paired with a third-party password manager, and any design that requires memorising a passphrase gets rejected. Verifying is all the reader should have to do.

### Limits

- A passkey is bound to the `anoni.net` RP ID, browsers only allow it on that same origin, and mirrors and onion addresses cannot use it
- Tor Browser disables WebAuthn entirely, `security.webauth.webauthn` is false in its default profile
- Lose the passkey or the password manager account and the vault is gone, while files encrypted with it are left with only the backup key
- Browsers do not let a page ask whether a given origin has a passkey, so the site does not even know whether a reader created one, and the key page is empty on every visit

![Local file encryption, with passphrase, passkey and recipient key modes, a passphrase field below them, and the encrypt-and-download button](https://assets.anoni.net/blog/utils-age-2609-en.webp){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

## Why age was chosen for encryption

Three years from now, a reader opening a backup may have nothing but a laptop with a command-line tool, and this site may not exist. That single consideration decides in favour of a public format over a custom one.

Choosing [age](../../tools/what-is-age.md) over PGP within the public formats comes down to a short list of concrete differences:

| | age | OpenPGP |
|---|---|---|
| Scope | File encryption only | Encryption, signatures, identity and a web of trust |
| Algorithms | One fixed set: X25519, ChaCha20-Poly1305, scrypt, HMAC-SHA-256 | Several, negotiated between parties |
| What a key looks like | One line, 62 characters | A block of thousands of characters carrying identity and expiry |
| Configuration | None | Hundreds of options in a GnuPG config |
| Specification length | One page | Hundreds of pages |
| Implementations | Go, Rust and TypeScript, mutually compatible | GnuPG mainly, with other implementations covering parts |

Every row points the same way. Nothing to configure means nothing to misconfigure, a short specification can be implemented small enough to audit in a browser, and passphrase mode needs no key management at all. The 1999 usability study "Why Johnny Can't Encrypt" gave twelve people PGP 5.0 and ninety minutes to send one encrypted message, most could not finish, and one of them mailed out a private key. The 2018 EFAIL attack exploited the fact that old-format ciphertext could be altered while mail clients displayed content anyway after a failed check. Both trace back to the same root: too many options and too many places to get it wrong.

Local file encryption on the site outputs a standard age file, which any machine with the command-line tool can open without this site:

```
age -d -o backup.tar backup.tar.age
```

Three key modes cover different situations. Passphrase mode requires no key management and its strength is exactly the strength of the passphrase. Passkey mode requires memorising nothing, at the cost of the file only opening on this origin. Recipient mode encrypts to other people, one public key per line, accepting both `age1` X25519 keys and `age1pq1` post-quantum hybrid keys.

After encrypting, the page decrypts its own output with the same key and compares before offering the download. The typage library and its dependencies are vendored into `utils/vendor/age/` unmodified, so every file can be compared byte for byte against the same version's npm tarball, with hashes recorded in `vendor/README.md`. Modifying them would remove the ability to check against upstream, leaving a reader with nothing but our word for it.

PGP stays where it belongs. The [sensitive upload](../../community/upload-sensitive.md) process on the site uses PGP, because that context needs a long-lived identity and has to work with the mail ecosystem. Mail and identity use PGP, files and backups use age.

## Where this stands, and what we want to hear

The tools are still basic components. Each does one small thing well, none of them chain into each other, and there is no packaged workflow an organisation could adopt as it stands.

Whole-site offline reading is a working prototype. The core mechanism runs in production, while the prefetch boundaries, the granularity of clearing and the entry point after installation are all still moving.

Turning it into a finished product or service needs more input on what people expect from something like this:

- **Which pages you want to carry offline**: the prefetch is currently split by core chapter, and real needs may differ
- **What your offline situation looks like**: how much warning you get, what becomes risky to leave on a device, what has to happen first once connectivity returns
- **What a tool lacks in your situation**: an unrecognised field, a format that will not open, or an explanation that does not land
- **Where passkeys get stuck**: the wrong storage location at creation, a device that will not open the vault, or a page that does not explain itself

Anything you would rather not attach your name to can go to the anonymous address below.

## Channels

- Real-time discussion: public Matrix room (home server `im.anoni.net`, link on the [community tools page](../../community/tools.md))
- Anonymous tips: whisper@anoni.net ([GPG key](../../contact.md))
- Source and issues: [anoni-net/docs](https://github.com/anoni-net/docs){target="_blank"}
