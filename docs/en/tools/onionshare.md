---
title: OnionShare
description: Spin up a temporary onion service to send files, receive files, host a site, or chat, all over Tor. The session disappears when you close it, and no third-party server is involved.
icon: material/share-circle
---
# :material-share-circle: OnionShare: Anonymous Transfer over Tor

[OnionShare](https://onionshare.org/){target="_blank"} is an open source tool that starts a temporary Tor onion service on your own computer, letting you send files, receive files, host a site, or chat with someone anonymously. Nothing goes to the cloud, no account is created, and the traffic runs through Tor's layered encryption. Close the window and the onion service disappears with it.

## Why use it

- **No third-party platform to trust.** Files go from your computer to the other person's Tor Browser. No Google Drive, no Dropbox, and no anoni.net in between
- **No account, no identifier.** What the other person receives is a `.onion` address. They do not learn who you are or what your IP address is, and you do not learn who they are
- **The session is disposable.** Closing OnionShare takes the onion service offline and the address stops working. No backend logs, no metadata landing anywhere
- **Cross-platform.** GUI on macOS, Windows, Linux, and Tails, plus a command-line version for running a long-lived intake box on a server

## Before you start

- **Your IP address is not exposed to the other party.** Traffic goes through Tor and they see only the `.onion` address
- **The session leaves nothing behind.** Closing the window takes the service down, and the Tor network keeps no record that the onion existed
- **You have to deliver the address through a secure channel.** OnionShare does not distribute it for you. Sending the address over an insecure messaging app, which in this region usually means LINE or WeChat, makes that hop non-anonymous. Signal, CryptPad, or saying it in person are the usual approaches
- **The other person needs Tor Browser.** If they cannot or will not use Tor, OnionShare is the wrong tool. Use [send.anoni.net](https://send.anoni.net/){target="_blank"} or PGP-encrypted email instead
- **A long-running intake box needs dedicated hardware.** Leaving it on your main computer 24/7 makes that machine an attack surface. A Tails USB or a dedicated Linux box is better
- **It uses your own bandwidth.** A large download consumes your upload capacity, and speed is bounded by current Tor network conditions

## Four modes

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionshare-modes.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionshare-modes.png"
            alt="The four mode tabs in the OnionShare main window"
            title="The four mode tabs in the OnionShare main window"
            class="brand-frame">
    </a>
    <figcaption>The four mode tabs in the OnionShare main window: Share Files, Receive Files and Messages, Host a Website, and Chat Anonymously.</figcaption>
</figure>

### Share Files

Drop files into OnionShare, which produces a `.onion` address. Deliver the address through a secure channel, and the recipient opens it in Tor Browser and downloads.

- **Fits**: sending evidence to a lawyer, interview material to an editor, records distributed after an action, a one-off file to legal counsel
- **Limits**: the recipient needs Tor Browser, and you close OnionShare when the transfer is done, or set it to stop automatically after the download

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionshare-send-url.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionshare-send-url.png"
            alt="OnionShare Share Files mode showing the generated .onion URL and private key"
            title="OnionShare Share Files mode showing the generated .onion URL and private key"
            class="brand-frame">
    </a>
    <figcaption>Starting a share produces a .onion address and a private key. Delivering the address and the key through two different secure channels prevents substitution in the middle.</figcaption>
</figure>

<figure markdown="span">
    <a href="https://assets.anoni.net/docs/onionshare-receiver-view.png" target="_blank">
        <img src="https://assets.anoni.net/docs/onionshare-receiver-view.png"
            alt="The OnionShare download page as the recipient sees it in Tor Browser"
            title="The OnionShare download page as the recipient sees it in Tor Browser"
            class="brand-frame">
    </a>
    <figcaption>Opening the .onion address in Tor Browser gives the recipient an ordinary-looking download page, with nothing new to learn.</figcaption>
</figure>

### Receive Files and Messages

Open an upload interface at a `.onion` address. The sender opens it in Tor Browser, uploads, and the files arrive on your machine.

- **Fits**: a journalist's published intake box, an organization collecting anonymous submissions, a crisis reporting channel
- **Limits**: it needs to stay online, which is the case for dedicated hardware rather than your everyday computer. This is the self-hosted intake box referred to in [protecting your sources as a journalist](../scenarios/journalist.md)

### Host a Website

Drop in HTML, CSS, and JavaScript, and OnionShare serves a static onion site.

- **Fits**: publishing sensitive material temporarily, event-limited resources, research drafts that cannot go on the clearnet, a preview for specific people
- **Limits**: static only, with no backend or database, and throughput bounded by your own connection

### Chat

A multi-party encrypted chat room running in memory with no persistent record. When whoever started it closes it, the room is gone.

- **Fits**: coordination during an action, communication during a sensitive meeting, group discussion that should leave no transcript
- **Limits**: everyone needs Tor Browser, and no history is kept to look back at

## Installing

- **macOS, Windows, Linux desktop**: the official GUI from [onionshare.org](https://onionshare.org/){target="_blank"}
- **Flatpak or Snap**: more convenient packaging for Linux, under `org.onionshare.OnionShare`
- **Tails**: preinstalled, in the Applications menu. [What is Tails](./what-is-tails.md) covers how it fits the wider system
- **CLI**: for a long-lived intake box on a server, or integration into an automated workflow

## Choosing between this and the alternatives

| Tool | Fits | How it differs from OnionShare |
|---|---|---|
| [send.anoni.net](https://send.anoni.net/){target="_blank"} | One-off encrypted transfer from an ordinary browser | Neither party needs Tor, so the barrier is low. Files pass through an anoni.net server (end-to-end encrypted, password-protectable, auto-expiring), which is a larger trust boundary than OnionShare |
| [SecureDrop](https://securedrop.org/){target="_blank"} | An institutional intake system for news organizations | Requires professional deployment and ongoing operation, and is used by large international outlets including the New York Times, the Guardian, and the Washington Post. OnionShare's Receive mode is the lightweight version an individual journalist can run |
| Signal attachments | Transfer between parties who already trust each other | Signal is tied to a phone number, which the other party may not want to expose before first contact. OnionShare has no account and no identifier, which suits first contact |

The decision:

- The other party does not use Tor and the material is moderately sensitive: [send.anoni.net](https://send.anoni.net/){target="_blank"}
- An institution needs a long-term intake box with audit trails: SecureDrop
- You are already in a Signal conversation and just need to send a file: a Signal attachment
- First contact, the other party should not expose their identity, and no third party should be involved: OnionShare

## Common questions

??? question "The other person has never used Tor. How do I guide them?"

    Send them the introductory section of [Tor Browser advanced settings](./tor-browser-advanced.md), have them install Tor Browser, then open your `.onion` address. If they will not install Tor, use [send.anoni.net](https://send.anoni.net/){target="_blank"} or PGP-encrypted email instead.

??? question "How do I confirm they got the right address and it was not substituted?"

    Along with the address, OnionShare produces a private key, which Tor calls client authentication. Deliver the address and the private key through two separate channels, for example the address over Signal and the key in person, so that compromising one channel is not enough. Passwords were removed in OnionShare 2.4 and replaced by this mechanism, so there is no password option to enable. A service can be made public, disabling the private key, through the "This is a public OnionShare service" checkbox or `--public` on the command line, which is the setting you do **not** want for sensitive material.

??? question "How large a file can Receive mode take?"

    There is no technical size limit. In practice three things bound it: your upload bandwidth, current Tor network speed, and how long you are willing to leave OnionShare running. Above 1 GB, splitting the transfer or using another channel is more reliable.

??? question "How does Chat mode differ from Signal or SimpleX?"

    Signal and SimpleX are long-term accounts on long-term devices, suited to ongoing communication. OnionShare Chat is a one-off room with no account and no history, which disappears entirely when the host closes it. Good for one-time coordination, not for daily messaging. See [secure messaging compared](./messaging-comparison.md).

??? question "Does it work on a phone?"

    There is an official Android app on Google Play and F-Droid, still in beta, and an iOS app that has been on the App Store since 2023. The most reliable mobile use is still as the receiving side, opening someone's `.onion` address in Tor Browser for Android or Onion Browser for iOS. For the sending side, a desktop or Tails is the safer choice.

??? question "Is OnionShare related to Tor bridges or Snowflake?"

    Not directly. Bridges and [Snowflake](./tor-snowflake.md) are entry points helping other people reach the Tor network. OnionShare provides a service on the Tor network. They occupy different positions in the same ecosystem.

## Next steps

For a first sensitive transfer, try one mode end to end (Share Files is the simplest) and get comfortable with the pattern: generate the `.onion` address, deliver it through a secure channel. To fit it into a complete workflow, [protecting your sources as a journalist](../scenarios/journalist.md) and [sending us sensitive material](../community/upload-sensitive.md) are the next reads.

## :material-chat-question: Related concepts

<div class="grid cards" markdown>

- [:material-chat-question: What is Tor](./what-is-tor.md)
- [:material-chat-question: What is Tails](./what-is-tails.md)
- [:material-chat-question: Secure messaging compared](./messaging-comparison.md)

</div>

## :fontawesome-solid-diagram-project: Where to go next

<div class="grid cards" markdown>

- [:material-newspaper: Protecting your sources as a journalist](../scenarios/journalist.md)
- [:material-snowflake: Tor Snowflake bridges](./tor-snowflake.md)
- [:material-translate-variant: Localization and translation](../community/i18n.md)

</div>
