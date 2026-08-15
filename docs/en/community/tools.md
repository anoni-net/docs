---
title: Community Services
description: The Matrix, CryptPad, Etherpad, SearXNG, Send, and Formbricks instances anoni.net self-hosts, plus the external Jitsi we use, and how to get an account on each.
icon: material/server-network-outline
---

# :material-server-network-outline: Community Services

The community self-hosts six services (Matrix, CryptPad, Etherpad, SearXNG, Send, and Formbricks) and uses an external Jitsi for video calls. We run them ourselves to reduce our dependence on third parties and keep control of our own data, and to give community discussion and sensitive collaboration a foundation we can vouch for.

For why we self-host Matrix in particular, and the privacy trade-offs behind that decision, see [Why we self-host Matrix, starting from Discord's age verification](../blog/posts/2026-discord-matrix-statement.md).

## Real-time discussion and long-term collaboration

### Matrix (real-time discussion)

- **Use**: day-to-day discussion, expressing interest in a topic, per-topic rooms, and event coordination
- **Homeserver**: `im.anoni.net`
    - **Web (Element)**: [https://matrix.anoni.net/](https://matrix.anoni.net/){target="_blank"}
    - **App (Element X)**: [download the app](https://element.io/download), then set the homeserver to `im.anoni.net`.
    !!! note "If you already have a Matrix account"

        An existing `matrix.org` account works fine. Element federates whether you use the web client or the app, so you only need the homeserver setting to be correct.

- **Getting an account**: accounts on `im.anoni.net` are currently issued on request. Write to <whisper@anoni.net> and we will reply with the registration steps and what to be aware of.
- **Where to start**: the community runs a **[public Space](https://matrix.to/#/#community:im.anoni.net)** that lets you join the community rooms in one go.
- **How to join**: once registered, open the Space link above in Element, or join individual rooms as you need them.

### CryptPad (encrypted collaborative documents)

- **Use**: collaborative writing, event planning, and collaboration on material that needs encryption at rest
- **Entry point**: the community [CryptPad instance](https://cryptpad.anoni.net/)
- **Getting an account**: CryptPad accounts are also issued on request to <whisper@anoni.net>. The default quota is 50 MB and can be adjusted later.
- **Interface languages**: CryptPad ships in a wide range of languages, switchable from the settings page or by adding `?lang=` to the URL. Traditional Chinese (`zh_Hant`) became a built-in locale in CryptPad 2026.5.0 after two and a half years of upstream translation work by this community, which is written up in [CryptPad 2026.5.0 ships Traditional Chinese as a built-in locale](../blog/posts/2026-cryptpad-zh-hant.md).
- **How to use it**: once you have an account you can create pads, share links, and set permissions (view-only or editable). Links to event pads are usually posted in Matrix.

### Etherpad (lightweight shared notes)

- **Use**: taking notes together during an event, and quick throwaway drafts. Content is not encrypted and anyone with the link can read it, so it is not the place for anything sensitive.
- **Entry point**: [https://pad.anoni.net/](https://pad.anoni.net/){target="_blank"}
- **Getting an account**: none needed. Create a pad and share the link.
- **How to use it**: good for public, disposable content. Switch to CryptPad when you need the material to persist or to be encrypted.
- **As a throwaway chat**: when you meet someone in person and neither of you wants to exchange app accounts, open a new pad and hand over the URL. The built-in chat sidebar works as a one-off conversation space. Close the tab and clear the pad when you are done, keeping in mind that the content is unencrypted and the server can in principle see it.

## Personal privacy tools

### SearXNG (private search)

- **Use**: aggregates results from several search engines with no logging, no ads, and no third-party cookies.
- **Entry point**: [https://search.anoni.net/](https://search.anoni.net/){target="_blank"}
- **Getting an account**: none needed.
- **How to use it**: you can set it as your browser's default search engine, or append `?q=keyword` to the URL directly.

### Send (end-to-end encrypted file transfer)

- **Use**: temporary encrypted file transfer, with links that can carry a password, a download limit, and an expiry time.
- **Entry point**: [https://send.anoni.net/](https://send.anoni.net/){target="_blank"}
- **Getting an account**: none needed. Signing in generally raises the size quota and retention window, depending on configuration.
- **How to use it**: upload the file, choose an expiry, set a download limit, add a password if the material warrants one, and share the link. The file is deleted once it expires or hits the download limit. Step-by-step instructions are in [Sending us sensitive material](./upload-sensitive.md).

## Community operations

### Formbricks (privacy-respecting forms)

- **Use**: newsletter sign-ups, event registration, and community feedback. Self-hosting keeps respondents out of a third-party form provider's tracking. Our newsletter subscriptions run through this instance.
- **Entry point**: [https://form.anoni.net/](https://form.anoni.net/){target="_blank"}
- **Getting an account**: respondents just open the link and fill in the form. Maintainers who need to create a form should write to <whisper@anoni.net> for a backend account.
- **How to use it**: create a form, share the link, and read the collected responses or export them from the backend.

## Video calls (external)

### Jitsi

- **Use**: online meetings, topic discussions, and regular syncs
- **Service**: [https://jitsi.goodmeet.asia/](https://jitsi.goodmeet.asia/){target="_blank"}. Free to use, operated by a third party rather than by this community, so its terms and availability are theirs, not ours.
- **How to use it**: open the link, create or enter a room name, and share the link. Meeting links are announced in the relevant Matrix room.

---

**Further reading**: for the reasoning behind self-hosting Matrix, and how we try to hold privacy and community quality together, see [Why we self-host Matrix, starting from Discord's age verification](../blog/posts/2026-discord-matrix-statement.md).
