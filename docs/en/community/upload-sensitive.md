---
title: Sending Us Sensitive Material
description: How to send personal data, leaked material, or sensitive collaboration files to the anoni.net community using our self-hosted Send instance, with OnionShare as an alternative for higher-risk cases.
icon: material/file-lock
---
# :material-file-lock: Sending Us Sensitive Material

When you need to send personal data, source material, or sensitive collaboration files to a community member, and you want the transfer to stay out of reach of anyone who does not need to see it, the steps below give you a link that expires on its own and leaves nothing behind.

## Upload steps

1. Go to [Send](https://send.anoni.net/){target="_blank"}, one of the services the community self-hosts.
2. Select the file you want to upload.
3. Set the expiry options: **one download**, expiring after **7 days**.
4. Tick **:octicons-check-circle-24:{ style="color: green;" } Protect with password** and enter a password you have **agreed on separately** with the recipient.
5. Confirm the settings and click **Upload**.

The upload produces a share link. Copy it and send it to the recipient to complete the transfer.

The password matters more than it looks. A Send link on its own is a bearer token: anyone who obtains it can download the file. Agree on the password through a different channel from the one carrying the link, so that compromising one channel is not enough.

!!! info ""

    [Send](https://github.com/timvisee/send){target="_blank"} is a lightweight self-hosted file sharing application. It shares files under end-to-end encryption and hands out links that expire on their own. That design keeps the transfer private and stops the file from living permanently on the web or inside a mail service.

## Walkthrough

Go to Send.

![Step 1](https://assets.anoni.net/docs/send-censorship-1.png){style="border-radius: 10px;border: 1px solid black;"}

Select the file, set the expiry parameters, and submit.

![Step 2](https://assets.anoni.net/docs/send-censorship-2.png){style="border-radius: 10px;border: 1px solid black;"}

Copy the link and send it to the recipient.

![Step 3](https://assets.anoni.net/docs/send-censorship-3.png){style="border-radius: 10px;border: 1px solid black;"}

## When Send is not the right tool

Send runs on infrastructure the community operates, which means you are trusting us with the fact that a transfer happened, even though the file contents are encrypted in your browser before upload. For most collaboration material that trade-off is fine. Two cases where it is not:

- **You need the recipient not to learn your network location, or you need to stay anonymous to us.** Use [OnionShare](https://onionshare.org/){target="_blank"} over Tor instead. It serves the file directly from your own machine through an onion service, so no third party holds the file at any point.
- **The material would put someone at risk if the transfer itself were discovered.** Raise it in Matrix first without the details, so we can agree on a channel before anything moves. Contact routes are on the [Community services](./tools.md) page.

## Related

- [Community services](./tools.md) covers the rest of our self-hosted infrastructure, including how to request a Matrix or CryptPad account.
- [Governance charter](./governance.md) sets out how the community handles disclosure and disputes.
