---
title: Shutdown response card
description: Fill in who you need to reach during a network outage, over which channels, where to meet, and how long to wait before acting. What goes on paper is code names and a place; how identity gets confirmed and what happens after stays in a separate plan.
icon: material/card-text-outline
---

# :material-card-text-outline: Shutdown response card

<div id="shutdown-card-tool"></div>

<script src="../../js/shutdown-card.js"></script>

When the network goes down, most people open a messaging app to see whether anything gets through, and only then realise they have no idea which street their friend lives on and no landline number for the house. The contact list is on the phone, the network is not, and so the contact list may as well not exist.

This tool collects what a contact list has no room for, and splits it in two: one part sparse enough to print and carry, and one part that stays somewhere you can protect.

## First, check that this card is for you

The card assumes the adversary is an accident: you go missing, end up in hospital, get separated from people. Whoever picks it up has no reason to go after anyone else named on it.

If you or anyone on the card lives somewhere you can be stopped and searched, have your home searched, or be questioned at a border, and where knowing the wrong people is itself treated as evidence, do not print the full card and carry it. The clearest thing digital security organisations actually recommend writing on paper is a single lawyer's hotline number on your arm. A card listing three to five contacts, a meeting time and place, and a way to verify identity is an order of magnitude denser than that.

In that situation, fill in code names and one meeting point, and keep the rest in your head.

## Why it comes in two parts

What reaches the paper is code names, channels, one meeting point and two waiting times. What stays in the plan is each person's role and where to find them, the steps to take once contact is lost, who decides and who notifies, and the questions that confirm identity.

Professional templates already work this way. The [Rory Peck Trust](https://rorypecktrust.org/get-help/safety/risk-assessment/creating-a-communications-plan/){target="_blank"} communications plan and proof-of-life document for freelance journalists are two separate files, not one. Wartime resistance networks followed the same logic: keep cells small, let each person know only their own single contact, so that an arrest gives up as little as possible.

Printing "who this is" and "how to prove it is them" on the same sheet hands whoever finds it both the list and the way past the check.

## Why now is the time to fill it in

There is very little you can do during an outage beyond carrying out what you prepared beforehand. The agreement has to be reached while both sides still have a connection, because reaching it takes communication. On the day you need the card, it is too late to write one.

A workable order is to fill in your own version first, then go through it with the people on it. Only a version you have gone through together counts. An agreement written down by one side is one the other side has never heard of.

## Why the waiting time comes in two stages

The tool asks twice: how long before you start preparing, and how long before you act.

With a single threshold there are only two states past that point, still waiting and something is wrong, and the stretch in between where you would quietly check the itinerary and call around without alerting anyone outside the group gets skipped. The two-stage form comes from the Rory Peck Trust template, which leaves both numbers blank for you to fill in rather than suggesting defaults.

One figure does have a source: [CPJ](https://cpj.org/2018/09/basic-preparedness-risk-assessment/){target="_blank"} recommends checking in every 24 hours on assignments lasting more than a day. The other options have no documented equivalent. The prevailing practice is to settle it with your contact before you go, which is why the tool leaves room for your own value.

## The backup channel has to fail differently

The most common way to fill this in is one messaging app as the main channel and a second messaging app as the backup. Both need the internet, so both go down on the same day, which leaves you with no backup at all.

The tool flags it once when both channels look like they need the internet, and it flags two more patterns:

- **Bluetooth and mesh tools**: these hop about a hundred metres at a time and rely on a dense crowd to relay, which works at a protest and does not work for reaching people spread across a city. Bridgefy saw a surge of downloads in Hong Kong in 2019; the following year a Royal Holloway team's reverse engineering showed users could be tracked, messages carried no authentication, and anyone could be impersonated. That work was later published at [USENIX Security 2022](https://www.usenix.org/conference/usenixsecurity22/presentation/albrecht){target="_blank"}
- **Broadcast**: Iran's data hidden in satellite television, the BBC's emergency shortwave service for Sudan, and Ukraine's statutory radio backup during blackouts were all genuinely used, and all run one way. Receiving a broadcast is a different thing from reaching a person

At least one backup should not go over the internet. Landlines and SMS stayed up in Cuba in 2021, in the first days after the 2021 coup in Myanmar, and in Iran in 2019, but Kashmir in August 2019 lost landlines, fixed broadband and mobile at the same time. A landline is not a guaranteed floor, it just fails under different conditions than the network.

## The verification field takes questions only

This field stays in the plan and never reaches the card, and the tool takes only the questions, not the answers.

An answer written down lets whoever finds it read the reply straight off the page. The established practice is that the person issuing the challenge does not know the correct response either, with the question and the answer held by different people. Kidnap-and-ransom negotiators use the same shape for proof-of-life forms: questions chosen by the subject, answers never circulated, each side holding one part.

There is an adjacent thing the tool deliberately does not turn into a field: a duress code, the signal for "this message is not something I said freely". Professional training consistently says to memorise it rather than write it down, because once it leaks the defending side has no way of knowing, and goes on trusting a signal the other party can now produce at will.

## Where the draft is kept is your choice

By default it is gone when you close the tab. Taking a phone call halfway through, or switching away to look something up and coming back, leaves the content intact.

One exception is worth stating plainly: a browser set to reopen your previous tabs restores the draft along with them. That is how `sessionStorage` is specified, and [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage){target="_blank"} puts it as surviving "over page reloads and restores".

If you want to come back tomorrow and keep editing, you can switch it to stay on the device. A third option writes nothing at any point. Which one is active is shown above the form at all times, with the clear button next to it.

This switch governs traces on the device. Once the card is printed and in your wallet, the real object is that piece of paper, and whether the draft was cleared stops mattering.

## The printed sheet

Printing gives you one A4 sheet with four identical cards and cut lines. The tool warns when the content runs past what one card holds, and that judgement has been calibrated against the real printed height.

All four are the same. Whether to hand them out is a trade-off: each extra copy is one more place the card can be found, and any single search exposes the whole thing. Against that, a single copy has no backup if it is lost or destroyed. There is no correct answer here, only which of the two you are more worried about.

Paper has direct advantages during an outage: no power, no unlocking, no dependence on a phone that still has battery. The flip side is that whoever picks it up can read it too.

## This page will not turn the card into a QR code

A QR code is plaintext. Printed on paper, it means anyone who photographs it walks away with the whole card. Turning a URL into a QR code for someone in front of you is a different job, and that is what the [QR code generator](qrcode.md) is for.

To be straight about it: leaving QR codes out does nothing for the risk of the content being read during a search, since printed text can be photographed and recognised just as easily. It only avoids the separate problem of someone swapping where a QR code points.

## This card has not been tested in the field

Across the documented shutdowns in Iran, Myanmar, Kashmir, Sudan, Ethiopia, Ukraine, Cuba and Hong Kong, there is no account of an individual using a paper contact list and it later being recorded as having helped. The one documented paper workaround is from the Tigray shutdown in Ethiopia, where the World Health Organization fell back on paper reports carried by hand, and that was institution-to-institution reporting.

The same holds for acting after a set period of silence. It is standard advice in American family preparedness templates, and none of those eight events has a first-hand account of it being carried out.

What is documented as having worked is a different set of things: landlines staying up in some events, physically travelling to where there is a connection (a train left Kashmir every morning carrying people out of the region to get online), and physical sites set up by institutions (Ukraine's Points of Invincibility, the media centre in Kashmir, the Red Cross satellite phone in Tigray).

So the honest description of this card is a reasonable precaution rather than a historically proven mainstay. Agreeing a meeting point in advance is documented in Pakistan in 2025, while the "be water" tactic in Hong Kong in 2019 deliberately avoided fixed assembly points, on the grounds that fixed leadership and locations in 2014 made people easier to target. The same practice cuts in opposite directions for finding family and for street protest.

## Works offline

Like everything else in this section, once the code is stored on your device it runs without a network. This page needs that more than any of the others, because the day you reach for it is likely to be a day the network is down.

Turn the network off, open this page, and check that you can fill it in and print it. That it still works is what tells you nothing you type here can be sent anywhere.

To take this page with you, see [Offline reading](../offline.md).

## Next

- [Threat model checklist](threat-model.md): the people, places and checks on this card are themselves a map of relationships, so work out who you are protecting yourself from first
- [Secure messaging compared](../tools/messaging-comparison.md): when picking a main channel, who sees the content and who sees the relationships
- [Metadata, and why it matters](../basics/metadata.md): why who contacts whom is information in itself
- [Journalists and source protection](../scenarios/journalist.md): first contact, exchanging files, and cleaning up after publication
