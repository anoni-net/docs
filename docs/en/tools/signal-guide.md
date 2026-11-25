---
title: Signal settings and group management
description: Signal works out of the box, but Registration Lock, phone number visibility, disappearing messages, notification content, and backups are worth ten minutes. This page covers setup, recommended settings, settings for higher-risk situations, and running large groups.
icon: material/message-lock-outline
---

# :material-message-lock-outline: Signal settings and group management

Signal is an open-source, end-to-end encrypted messenger for text, media, files, and voice and video calls. Signal has told courts that the only user data it can provide to law enforcement is when an account was created and when it last connected[^ssd-signal].

This page is adapted from two EFF Surveillance Self-Defense guides, [How to: Use Signal](https://ssd.eff.org/module/how-to-use-signal){target="_blank"} and [Creating and Managing Signal Groups](https://ssd.eff.org/module/creating-and-managing-signal-groups){target="_blank"}, which walk through each step on Android and iPhone. This page condenses them into one checklist and links to our related pages: [secure messaging compared](./messaging-comparison.md), [the scope of end-to-end encryption](../basics/e2ee.md) for phone-number registration and safety numbers, and [Signal Proxy](./signal-proxy.md) for places where Signal is blocked, including mainland China.

!!! tip "Short on time? Start here"

    - Turn on Registration Lock and write down your Signal PIN
    - Set a username and check that "Who can see my number" is Nobody. To stop people who have your number from finding you, set "Who can find me by number" to Nobody too
    - Use disappearing messages for sensitive chats, remembering that anyone can still take a screenshot
    - In a large group, set permissions and admins first, and require admin approval for the group link

## Setup and everyday use

Signal can match your contacts through private contact discovery, deleting the uploaded data after matching, or you can deny the permission and enter numbers manually. Registration needs a phone number, which is not shown on your profile unless someone already has it saved. Your profile name is required but can be made up. The Signal PIN restores your settings on a new phone and powers Registration Lock[^ssd-signal]. Before discussing anything sensitive, you can compare safety numbers: tap the contact's name > View Safety Number, scan the QR code in person or read the numbers, then Mark as Verified[^ssd-signal].

## Recommended settings

Paths start from your profile picture in the chat list. On iPhone, tap Settings first[^ssd-signal].

- **Registration Lock** (Account): stops anyone registering your number on another phone without your PIN. Forgetting the PIN can lock you out for at least seven days
- **Username and number privacy**: tap your name for the username, which must end in at least two digits and can be changed anytime. Under Privacy > Phone Number, "Who can see my number" defaults to Nobody and "Who can find me by number" defaults to Everybody
- **Disappearing messages** (Privacy, or per chat): messages are deleted from both devices after the chosen time, counting from when they are read. This helps if someone gets hold of a phone, but not against the other person taking screenshots. View-once photos and videos work the same way
- **Notification content** (Notifications > Show): hide the name, the content, or both from the lock screen and from AI notification summaries
- **Backups**: Secure Backups are end-to-end encrypted and stored by Signal. The free tier covers all text and the last 45 days of media, and the recovery key is yours alone. Android also offers on-device backups. Backups are a new target, and a phishing campaign has gone after recovery keys, which is one more reason to turn on Registration Lock. Device transfer moves messages between phones on the same platform without a backup

## Higher-risk situations

Use these if your threat model calls for them ([threat modeling](../basics/threat-model.md))[^ssd-signal].

- **Screen Lock** (Privacy): require authentication again to open Signal
- **Hide Screen in App Switcher** (iPhone, Privacy), or Screen security on Android, which also blocks your own screenshots
- **Generate Link Previews** (Chats): off by default. Previews tell the site the link was shared on Signal, and tracking tokens in URLs can hint at who you talk to
- **Incognito keyboard** (Android, Privacy), and remove third-party keyboards you no longer use
- **Always Relay Calls** (Privacy > Advanced): hides your IP address from the person you call, at some cost to call quality
- **Linked Devices**: review it occasionally and unlink anything you do not recognize
- **Stories**: limit who sees My Story, turn off View Receipts, or turn off Stories entirely
- **Change Phone Number** (Account) when you move to a new or secondary number

## Running groups

Anything in a group can be screenshotted, and encryption does not help if a member's phone is seized and unlocked. Groups can hold up to 1,000 people. Once a group passes about 50 people, or its link is shared publicly, treat it like social media: anything in it may end up outside the group, including in a police file[^ssd-groups].

- **Check your profile first**: Every group sees your name and photo. Change them before joining, because later changes show up in the chat history. Remember that other people's names may be pseudonyms too[^ssd-groups]
- **Invites**: Adding members by number or username keeps track of who is in the group. Group links (`https://signal.group`) suit flyers and events. For higher-risk groups, keep links short-lived, reset them between events, turn them off after the first wave, and turn on Require Admin Approval[^ssd-groups]
- **Set the rules early**: Set the disappearing-message timer when you create the group, a day or a week for sensitive ones. Under Permissions, Add Members, Edit Group Info, and Send Messages can each be set to Only Admins, and setting all three makes an announcement-only channel. Appoint at least two trusted admins, agree on the workload, and consider rotating. Put the group's purpose and rules, including screenshot norms, in the group description. Pinned messages disappear on the same timer, and member labels help people tell each other apart[^ssd-groups]
- **Removing people**: Removing a member does not delete old messages from their phone, and neither does shortening the timer. Deleting your own message within 24 hours removes it for everyone. If a member is under criminal investigation or their phone has been seized, talk to a lawyer before changing group settings[^ssd-groups]
- **Staying organized**: Mute large groups. Use folders on Android, and nicknames to keep track of who is who, keeping in mind that notes on a nickname could expose someone if your phone is seized[^ssd-groups]

For group design in organizing work, see [activists and protest digital safety](../scenarios/activist.md).

## Sources and review

Adapted from two guides in EFF's [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"}, both licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/){target="_blank"}: [How to: Use Signal](https://ssd.eff.org/module/how-to-use-signal){target="_blank"} (last reviewed 2026-06-15) and [Creating and Managing Signal Groups](https://ssd.eff.org/module/creating-and-managing-signal-groups){target="_blank"} (last reviewed 2026-04-24). We merged the settings into one list, generalized the US neighborhood example in the group guide, and linked our existing pages on phone numbers, safety numbers, and Signal Proxy. This page has not been reviewed by EFF, and anoni.net is responsible for any differences from the original.

## Where to go from here

- [Secure messaging compared](./messaging-comparison.md): how Signal compares with SimpleX, Session, Briar, and Matrix
- [The scope of end-to-end encryption](../basics/e2ee.md): phone-number registration, safety numbers, and encrypted backups
- [Signal Proxy](./signal-proxy.md): reaching Signal where it is blocked

[^ssd-signal]: [How to: Use Signal](https://ssd.eff.org/module/how-to-use-signal){target="_blank"} - EFF Surveillance Self-Defense, last reviewed 2026-06-15.
[^ssd-groups]: [Creating and Managing Signal Groups](https://ssd.eff.org/module/creating-and-managing-signal-groups){target="_blank"} - EFF Surveillance Self-Defense, last reviewed 2026-04-24.
