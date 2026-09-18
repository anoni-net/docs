---
title: Walking a new colleague through a device review
description: Someone starts next week, their account access is already provisioned, and nobody has talked to them about their laptop, their phone, or what the work they are about to touch actually requires. This walkthrough covers the three questions, picking what to do next, and leaving the progress on their own device, plus why this needs a second person in the room.
icon: material/account-plus-outline
---

# :material-account-plus-outline: Walking a new colleague through a device review

## One hour on their first day

Someone starts next week. Their shared drive access is provisioned and they have been added to the group chats. Nobody has talked to them about the laptop and phone in their hands, or about what the work they are about to touch actually requires.

The moment for this is before access is granted rather than after. Starting the conversation once they have already been reading three weeks of discussion means three weeks of exposure has already happened.

Book an hour, sit down together, and work through the [Threat model checklist](threat-model.md).

## The three questions need a second person asking

The checklist asks three things: what you are protecting, who you are protecting it from, and how much you are willing to spend.

Filled in alone, the answers come out generic. "Protect personal data", "keep hackers out", "as much as I can": all three are correct, and none of them leads to a next step. With someone asking follow-ups it goes differently. The "what" becomes which specific files on which machine. The "who" becomes whether it is a passing stranger or somebody who knows you. The "how much" becomes five extra minutes a day or a separate work machine.

The person asking does not need to be a security specialist. They need to be willing to ask "which one specifically" after each answer.

## The mismatch list is the useful part

Each of the three answers looks reasonable on its own, and together they often do not hold up. The checklist flags where they fail to line up.

The most common one is picking law enforcement or a state-level adversary while setting the cost to the lowest option. Several others recur too: protecting against someone in an intimate relationship without listing devices among the things to protect, defending only against passing strangers while planning to overhaul your entire workflow, and protecting a source's identity without counting who contacts whom.

Answering one question at a time hides the conflict. Laid out side by side, the gap surfaces on its own. That mismatch list is what the hour produces. The answers themselves matter less.

## Pick what the next three months hold

From the review, move to [My preparation checklist](checklist.md), which collects the site's recommended actions into something you can tick off.

Do not tick everything. Pick three to five items that address the gaps the mismatch list surfaced, which is roughly what three months can absorb. The rest stays on the list for a later pass.

Your new colleague should leave that hour holding specific things to do rather than a reading list.

## The progress stays on their device

Once the list is ticked, build a passkey for this site with [Passkey as your key](passkey.md) and use it to encrypt what they selected. A fingerprint gets them back to their progress next time.

Say this part plainly: there is no account, there is no server, and the site stores nothing. The organisation cannot see what they ticked, and neither can you. It is their list, not an audit form to hand back.

Store the passkey in their own password manager or keychain. [Local file encryption](age.md) can use the same key later, so there is no separate passphrase to remember.

## What that hour does not do

A review is not an audit and it produces nothing to report upward. Compliance documentation is a separate exercise. This one is for them.

The list is alive. Changing jobs, picking up a new project, or a change at home all move the threat model, and answers left untouched for three years are not answers. Sit down again six months later and it usually takes fifteen minutes.

## The same path applies well beyond onboarding

Any situation where you help someone else establish a starting point works the same way:

- A briefing before a volunteer joins
- A collaborator before you start exchanging material
- Family or friends asking where to begin
- Yourself, redoing it after a gap

All three tools run in the browser, and the answers and progress never leave their device. Once the pages are saved to the device they work without a network connection. See [offline reading](../offline.md).
