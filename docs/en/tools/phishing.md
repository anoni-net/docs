---
title: Recognizing and preventing phishing
description: Phishing reaches you by email, text message, chat app, or phone, and aims to steal your password or get you to install malware. This page explains how fake login pages and spearphishing work, and the defenses worth setting up ahead of time.
icon: material/hook
---

# :material-hook: Recognizing and preventing phishing

Phishing is a message or link that looks harmless but is malicious. It tries to get you to click a link, open a document, install software, or type your username and password into a fake site. A stolen password lets someone into your account, and installed malware can control your device, steal data, or spy on you[^ssd].

This page is adapted from EFF Surveillance Self-Defense's [How to: Avoid Phishing Attacks](https://ssd.eff.org/module/how-avoid-phishing-attacks){target="_blank"}, last reviewed in June 2024. The EFF guide covers the techniques in detail. This page summarizes them, updates the email image settings against Google's and Apple's current documentation, and adds the forms phishing takes in Taiwan and East Asia: fake delivery notices, fake bank alerts, fake customer service, and chat messages asking you to forward a one-time verification code. What to do in the moment, such as checking through another channel, is in [what an ordinary person should actually do](../scenarios/everyday-baseline.md).

!!! tip "Short on time? Start here"

    - Check the domain in the address bar before typing a password. Anyone can copy a logo
    - Let your password manager autofill. If it refuses on a site, stop and check
    - Use passkeys or a hardware security key on important accounts, so a fake site gets nothing usable
    - For notices from banks, couriers, or support desks, open the app or type the address yourself instead of tapping the link

## Common techniques

**Fake login pages**: The most common phishing sends a link to a lookalike login page that passes whatever you type straight to the attacker. Link text can differ from the real destination, so hover over a link on a computer to see where it goes. Lookalike domains swap a capital `I` for a lowercase `l` or change one character, and shortened URLs hide the destination, which a service such as [CheckShortURL](https://www.checkshorturl.com/){target="_blank"} can expand. Sender addresses can be forged as well[^ssd].

**Spearphishing**: Most phishing casts a wide net, but spearphishing is built around something the attacker already knows about you. A message that looks like it is from a relative, with an attachment of their children's photos, can display the photos while exploiting a bug in your PDF reader to install malware. Voice phishing may impersonate someone you know, even with an AI-cloned voice. If something feels off or the caller asks for money, ask them to prove who they are another way[^ssd].

**Text messages and chat apps**: Phishing works over SMS, phone calls, and any app with chat[^ssd]. A one-time verification code is only for your own login. Anyone or any page asking you to pass it on is trying to take over your account, even when the request comes from a friend's account, which may already be compromised.

## Defenses

Never clicking links or opening attachments would stop phishing, but that is unrealistic for most people[^ssd]. Each of these covers part of the problem.

- **Keep software updated**: Phishing that delivers malware usually exploits known bugs, and updates fix them[^ssd]. Version notes for each system are in our [software update log](../changelog/index.md)
- **Let a password manager autofill**: It only fills in passwords on the matching domain. If it refuses, double-check the site, and when in doubt, go to the login page yourself rather than through a link[^ssd]. See [getting started with password managers](./password-manager.md)
- **Verify through another channel**: If a message claims to be from your bank, call the bank or type its address yourself. If a relative sends an odd attachment, message them before opening it[^ssd]. In Taiwan, the `165` anti-fraud hotline can check whether something is a known scam
- **Open suspicious documents somewhere else**: People who must open documents from strangers, such as journalists, can upload them to Google Drive, which renders them as images or HTML, or submit files and links to [VirusTotal](https://www.virustotal.com/){target="_blank"}. Both hand the file to someone else's servers, so avoid them for sensitive material. Tails or Qubes limit the damage malware can do (see [Tails vs Whonix vs Qubes](./tails-vs-whonix-vs-qubes.md))[^ssd]
- **Use hardware keys and passkeys**: Security keys and passkeys are bound to the site's domain, so the browser will not hand a fake site the credentials for the real one. One-time codes from SMS or authenticator apps can be relayed by a real-time phishing site, so not all two-factor authentication stops phishing[^ssd]. See [what is a passkey](./what-is-passkey.md)
- **Be wary of instructions by email**: Messages that ask for your password, remote access for a "technician", or that you disable a security feature usually use urgency and fear. Most companies will not contact you to troubleshoot[^ssd]
- **Block remote images in email**: Images can track when you open a message. In Gmail on the web, go to Settings > See all settings, choose "Ask before displaying external images" under Images, and save[^gmail]. In Mail on iPhone, go to Settings > Apps > Mail > Privacy Protection and turn on Protect Mail Activity. It does not cover links or attachments[^apple-mail]

## If you already clicked or typed your password

From another device you trust, go directly to the real site and change the password, along with any other site that used the same one. Then check the account's signed-in devices, sign out anything you do not recognize, and turn on two-factor authentication. If a bank account or card is involved, call the number on the back of the card and report it to the police. If you opened an attachment or installed an unknown app, see [preventing and handling malware](./malware.md).

## Sources and review

Adapted from [How to: Avoid Phishing Attacks](https://ssd.eff.org/module/how-avoid-phishing-attacks){target="_blank"} in EFF's [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"}, last reviewed on 2024-06-21 and licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/){target="_blank"}. We replaced the examples with ones common in Taiwan and added the verification-code warning and the section on what to do after clicking. Settings were checked in November 2026 against Gmail Help and the iPhone User Guide. anoni.net is responsible for any differences from the original, and this page does not represent EFF's views.

## Where to go from here

- [What an ordinary person should actually do](../scenarios/everyday-baseline.md): password managers, two-factor authentication, and checking through another channel
- [Getting started with password managers](./password-manager.md): choosing a manager, plus TOTP, passkeys, and hardware keys
- [Preventing and handling malware](./malware.md): signs to watch for after opening a suspicious attachment

[^ssd]: [How to: Avoid Phishing Attacks](https://ssd.eff.org/module/how-avoid-phishing-attacks){target="_blank"} - EFF Surveillance Self-Defense, last reviewed 2024-06-21.
[^gmail]: [Turn images on or off in Gmail](https://support.google.com/mail/answer/145919?hl=en){target="_blank"} - Gmail Help.
[^apple-mail]: [Use Mail Privacy Protection on iPhone](https://support.apple.com/en-us/guide/iphone/iphf084865c7/ios){target="_blank"} - iPhone User Guide.
