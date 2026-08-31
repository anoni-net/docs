---
title: Shutdown response card
description: Fill in who you need to reach during a network outage, over which channels, where to meet, and how long to wait before acting. Print four copies on one sheet, cut them apart, and hand them out. Where the draft is kept is your choice, and you can clear it at any time.
icon: material/card-text-outline
---

# :material-card-text-outline: Shutdown response card

<div id="shutdown-card-tool"></div>

<script src="../../js/shutdown-card.js"></script>

When the network goes down, most people open a messaging app to see whether anything gets through, and only then realise they have no idea which street their friend lives on and no landline number for the house. The contact list is on the phone, the network is not, and so the contact list may as well not exist.

This card holds the things a contact list has no room for: where to wait for someone you cannot reach, how to tell whether the voice on an unfamiliar line really is them, and how long to wait before you stop waiting.

## Why now is the time to fill it in

There is very little you can do during an outage beyond carrying out what you prepared beforehand. The agreement has to be reached while both sides still have a connection, because reaching it takes communication. On the day you need the card, it is too late to write one.

A workable order is to fill in your own version first, then go through it with the people on it. Only a version you have gone through together counts. An agreement written down by one side is one the other side has never heard of.

## Why these fields

- **People**: those you have to reach during an outage, three to five of them. A longer list is one nobody remembers and nobody finishes working through
- **Main and backup channel**: the two should fail for different reasons, see the next section
- **Meeting place and time window**: what is left when no channel works. Somewhere you both know, at a fixed hour
- **How to confirm it is really them**: what tells you a message from an unfamiliar channel came from the person you think it did
- **How long without word before you act**: past that point you act on the agreement. Without this field, everybody waits a little longer when it actually happens, and the waiting eats the time you could have acted in
- **Not to be discussed over these channels**: assume every channel on the card is readable by someone else
- **Card label and date**: shared agreements get revised, and without a version marker two people end up holding different ones

## The backup channel has to fail differently

The most common way to fill this in is one messaging app as the main channel and a second messaging app as the backup. Both need the internet, so both go down on the same day, which leaves you with no backup at all.

At least one backup should not go over the internet: a landline, an SMS, knocking on their door, or an agreed physical location. Each has its own problems. Landlines and SMS go through a telecom operator, and turning up at someone's home is visible to their neighbours. What makes them useful is that they fail under different conditions than the network does.

The tool flags it once when both channels look like they need the internet. It matches against the names of common services, and it is only a prompt. What you write is your call.

## The verification field should hold a cue

This is the most sensitive field on the card. If it leaks, whoever impersonates you passes the check, and the person receiving the message believes they have verified you.

So write a cue rather than an answer. "What was the name of the place we went to last time" is safer than writing the name of the place, because the first requires a shared memory and the second can be read aloud by anyone holding the card.

## Where the draft is kept is your choice

By default it is gone when you close the tab. Taking a phone call halfway through, or switching away to look something up and coming back, leaves the content intact. Closing the tab or the browser clears it.

If you want to come back tomorrow and keep editing, you can switch it to stay on the device. If someone gets hold of the device, the draft is on it too, which is why that option starts off. The third option writes nothing at any point.

Which one is active is shown above the form at all times, with the clear button next to it. Once you print or download, the tool asks whether to clear the draft.

## The printed sheet

Printing gives you one A4 sheet with four identical cards and cut lines. The agreement is shared by three to five people and each of them needs a copy, so print once and cut them apart. The form itself and the site header and footer stay off the paper.

Paper has direct advantages during an outage: no power, no unlocking, and no dependence on a phone that still has battery. The flip side is that whoever picks it up can read it too, so keep the card somewhere you can protect, particularly because of the verification field.

You can also download it as plain text and paste it into a password manager or an encrypted note.

## This page will not turn the card into a QR code

A QR code is plaintext. Printed on paper, it means anyone who photographs it walks away with the whole map of relationships. The tool therefore does not offer a way to encode the card content as a QR code.

Turning a URL into a QR code for someone standing in front of you is a different job, and that is what the [QR code generator](qrcode.md) is for.

## Worth thinking through first

The people, places and verification methods on the card are themselves a map of relationships. Who belongs on it, how many copies to print and where to keep them all depend on who you are protecting yourself from. If you have not worked that out, the three questions in the [threat model checklist](threat-model.md) are a good place to start.

## Works offline

Like everything else in this section, once the code is stored on your device it runs without a network. This page needs that more than any of the others, because the day you reach for it is likely to be a day the network is down.

Turn the network off, open this page, and check that you can fill it in and print it. That it still works is what tells you nothing you type here can be sent anywhere.

To take this page with you, see [Offline reading](../offline.md).

## Next

- [Secure messaging compared](../tools/messaging-comparison.md): when picking a main channel, who sees the content and who sees the relationships
- [Metadata, and why it matters](../basics/metadata.md): why who contacts whom is information in itself
- [Journalists and source protection](../scenarios/journalist.md): first contact, exchanging files, and cleaning up after publication
- [Activists and protest digital safety](../scenarios/activist.md): before mobilisation, on the day, and afterwards
