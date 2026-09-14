---
title: Handing a list to an outside partner
description: The annual filing means sending a donor list to your accountant, three hundred rows of names, phone numbers and addresses that used to travel as an email attachment. This walkthrough covers encrypting it first, why the passphrase has to travel by a different route, and why an encrypted file still gets a hash.
icon: material/account-multiple-outline
---

# :material-account-multiple-outline: Handing a list to an outside partner

## Three hundred rows in a spreadsheet

The filing deadline is close and the accountant wants the donation records. The file is on your computer: three hundred or so rows, each with a name, a phone number, an address, and an amount.

In previous years it went out as an email attachment. That file then exists in several places at once: their mailbox, your sent folder, the mail servers at both ends, and whatever automatic backup either side runs. The list itself is not encrypted, so anyone with access to those mailboxes has the list.

This happens once a year, and not only with accountants. Contracted designers, collaborating researchers, and partners on a joint application all end up needing a list from you.

## Draw a passphrase first

Go to the [Passphrase and password generator](passphrase.md) and draw one. The page shows how much entropy it has, which is roughly how many attempts guessing it would take.

Draw rather than invent, because what people come up with is not random enough. A birthday, the organisation's initials, or last year's passphrase with a digit appended all rank early in a dictionary attack.

## Encrypt before it leaves

Drag the spreadsheet into [Local file encryption](age.md), set the key type to passphrase, and paste in the one you just drew.

Once it finishes, the page decrypts the result with the same passphrase and compares it before offering the download. That step catches a mistyped or truncated passphrase, an error that looks like nothing at all at the time and surfaces days later when the other side cannot open the file.

The output is the age format, which any computer with the age command line tool can open. You do not have to come back to this site. If your accountant works on the command line, what you send is no different from what they usually receive.

## The passphrase takes a different route

Send the ciphertext by email and hand over the passphrase some other way: say it in person, read it out on a call, or use a different messaging app.

Putting both in the same email is the same as not encrypting it. Whoever reaches that email has both halves.

To keep the passphrase, store it in your password manager with a note saying which file it belongs to. The filing comes round again next year.

## An encrypted file still gets a hash

[Local file encryption](age.md) stops the contents being read. [File hash comparison](hash.md) confirms the contents have not changed. The two are independent of each other.

Compute the SHA-256 of the encrypted file and give that string to the recipient separately from the passphrase. They hash what arrives, compare, and only then decrypt.

What this buys you is the ability to tell two failures apart. If they cannot open it and the hash matches, the problem is the passphrase, so read it out again. If the hash does not match, the file was damaged or swapped in transit and resending is the only thing that helps. Without this step, two completely different problems look identical.

## A recipient with an age public key needs no passphrase

For a long-term partner, ask them to generate an age key and send you the public half. Switch the key type to "public key", paste theirs in, and they decrypt with their own private key. No passphrase to arrange.

Frequently used public keys can be named and stored in the recipient book, so next time you pick one from a list. The recipient book lives in the same passkey-encrypted store as [My preparation checklist](checklist.md).

When you encrypt only to someone else's public key, you have nothing locally that can decrypt it to verify. On a first exchange, send a test file and ask them to confirm it opens before you send the real one. To keep a copy you can open yourself, add your own public key on its own line.

## The same path applies well beyond annual filings

Any list or spreadsheet leaving the organisation works the same way:

- A roster for a contracted designer, or an address list for mailing labels
- Raw survey responses for a collaborating researcher
- Participant lists exchanged when applying for something jointly
- Event registrations going to a venue or an insurer

The whole path runs in your browser and the list never leaves your device. Once the pages are saved to your device they work without a network connection. See [offline reading](../offline.md).
