---
title: Preparing for and responding to a network shutdown
description: Shutdowns come in four levels, from slowdowns through blocked services and total regional outages to losing power as well. Each is judged differently and leaves you different options. Covers what to do beforehand, the risks in the moment connectivity returns, and Taiwan's undersea cable and grid context.
icon: material/lan-disconnect
---

# :material-lan-disconnect: Preparing for and responding to a network shutdown

The phone shows bars and the message still will not send. The first thing to work out is which kind of outage this is.

Treating "the network is down" as a single event produces preparation that fits none of the four levels. Someone buys satellite equipment and then runs into a blocked service. Someone cycles through VPNs when the line carries no signal at all. Both are misjudged levels.

This page sorts outages into four levels, with how to tell them apart, what each one leaves you, and the mistake people most often make. It then works through three moments: what to finish beforehand, how to work during an outage, and the risks at the moment connectivity returns. Within the first of those, agreeing things with other people is pulled out into its own section, because it involves other people and takes the longest to complete. Taiwan's physical infrastructure context comes last.

For why the strength of your preparation should follow your own situation, see [Threat modelling](../basics/threat-model.md). To store this site on your device so you can read it during an outage, see [Offline reading](../offline.md).

!!! tip "If you are short on time, do these three"

    One, store this site on your device (see [Offline reading](../offline.md)); installing it after the network drops is too late. Two, check that your backups open with no network, the encrypted ones especially. Three, find the three to five people you must be able to reach and agree one contact method that does not go over the internet, plus a place and time to meet. The rest of this page is why, and how to do it more thoroughly.

## Four levels

Sorting the outage into a level tells you what to do next. Get the level wrong and no amount of preparation helps.

<figure markdown="span">
    <img src="https://assets.anoni.net/diagrams/shutdown-levels.en.svg"
        alt="Four stacked bands running from light to dark, representing the four levels of a network shutdown, with fewer options available as you move down. Level one is throttling and intermittent loss, identified by small files getting through while large ones fail, leaving text messaging and offline editing; the common misreading is blaming your own device and rebooting repeatedly. Level two is specific services being blocked, identified by other sites loading on the same connection, leaving any channel that is not blocked; the common misreading is treating one broken app as a dead line. Level three is a regional blackout, identified by switching Wi-Fi and carriers with the same result while people nearby see the same thing, leaving whatever you stored in advance, Bluetooth and local networks, and physical delivery; the common misreading is assuming Bluetooth and local networks also stop working. Level four is a shutdown that takes the power with it, obvious without any diagnosis, leaving battery time, paper, and meeting arrangements agreed in advance; the common misreading is still focusing on communication tools instead of power management.">
    <figcaption>Read the level wrong and none of your preparation applies</figcaption>
</figure>

| Level | How to tell | What you still have | The most common mistake |
|---|---|---|---|
| One, slowdowns and intermittent drops | Small files get through, large ones do not | Text communication, editing offline and sending when conditions allow | Assuming your own device is broken, and rebooting it repeatedly |
| Two, specific services blocked | Other sites open over the same line | The channels that are not blocked | One app fails to open and you conclude the whole line is down |
| Three, total regional outage | Switching Wi-Fi or SIM changes nothing, and the people around you see the same | What you stored beforehand, Bluetooth and local networks, physical delivery | Assuming Bluetooth and local networks fail too |
| Four, power is out as well | No need to tell, it is obvious | However long the batteries last, paper, meeting arrangements made in advance | Preparation still focused on communication tools, not shifted to power management |

### Level one, slowdowns and intermittent drops

You are connected, and it is slow. Text messages get through, photos fail halfway, video calls connect and then break up.

**How to tell:** small files get through and large ones do not. Text-only services still work, bandwidth-hungry ones do not.

**What you still have:** text communication, low-bandwidth ways of working, editing offline and sending when conditions allow. There is still a lot you can do at this level, provided large transfers are pushed to the back of the queue.

**The common mistake:** assuming the problem is your own device, and repeatedly rebooting, reinstalling apps and resetting the router. None of that helps with congestion or throttling, and it burns time and battery. Ask the person next to you whether they see the same thing first. It saves a lot of effort.

### Level two, specific services blocked

Other sites work normally, a handful of services will not connect.

**How to tell:** other sites open over the same line. This is the only level you can confirm with measurement tools. Public measurement such as [OONI](../tools/what-is-ooni.md) (a tool anyone can run to test whether a site is being blocked where they are) shows whether it is only you, and whether others in the same area see it too.

**What you still have:** the channels that are not blocked, and circumvention tools. This page does not give a circumvention how-to, for reasons set out under "What this page does not do". To understand how these tools actually work, the site has [What Is Tor?](../tools/what-is-tor.md), [VPN: risks and how to choose](../tools/vpn-guide.md), and [Tor Snowflake](../tools/tor-snowflake.md), covering the mechanism and each one's failure conditions, not step-by-step instructions.

**The common mistake:** one app fails to open, you conclude the whole line is down, and you start the preparations meant for a total outage. Open two or three different services first. It takes less than a minute.

### Level three, total regional outage

The line carries no connection at all.

**How to tell:** switching networks (Wi-Fi to mobile, one operator's SIM to another) changes nothing, and the people around you see the same. A single device's fault does not happen to everyone at once.

This level is hardest to confirm when you have only one phone and nobody nearby to ask. Signal bars do not help: they show the radio link between the phone and the tower, not whether the network beyond that tower is up, and the phone has no way to display that. That is exactly why the opening scene of this page, bars showing and nothing sending, is the classic look of a total outage. On your own there are two steps to take. First turn off Wi-Fi and try mobile data alone, then do the reverse, Wi-Fi alone with mobile data off; if neither gets through, that rules out a single line being the problem. Next, try a phone call or a text message. Voice and SMS travel a different path from data, so if either goes through, the carrier network is still up and it is only data that has been cut. That result decides which kind of backup channel to reach for next.

**What you still have:**

- Whatever you stored on the device beforehand. Anything you did not store is out of reach now
- Short-range direct connections. Tools such as Briar can sync with people nearby over Bluetooth or a local network without a server. For how messaging tools differ, see [Comparing anonymous messaging tools](../tools/messaging-comparison.md)
- Physical delivery. USB sticks, paper, telling someone face to face. Think about the destination first. Physical delivery usually means carrying data to somewhere that still has a connection, and the far end still needs a point that can get online. In a total regional outage that connected point may lie outside the affected area, and how far away depends on how wide the outage is ([CPJ, the Committee to Protect Journalists, interviewed journalists in Iran, Gaza and Sudan in April 2026](https://cpj.org/2026/04/how-middle-east-journalists-report-during-internet-blackouts/){target="_blank"} about the methods they actually used during blackouts)

**The common mistake:** assuming every wireless function is dead. Bluetooth and local networks do not pass through an operator or the internet, so they keep working during a total outage. That is the biggest difference between level three and level four.

### Level four, power is out as well

Network and electricity are both gone.

**How to tell:** you will not need to. It is obvious.

**What you still have:** however long the batteries last, plus paper, plus whatever meeting arrangements you made in advance. See "Agreeing things with other people in advance" below.

What separates this level from the first three is the timescale. In the first three the problem is that messages will not send. Here the problem is that your devices switch off in a few hours. Preparation therefore shifts from communication tools to power management and offline carriers of information. A power bank, a car charger, dimming the screen, turning off background sync: minor details at the other levels, and at this one they decide how much time you have left.

## What to finish beforehand

Across those four levels, almost every entry under "what you still have" depends on what was finished before the outage. This section is the basic device and power checklist. Agreeing things with other people gets a section of its own, below.

### What needs to be on the device already

- **Documents you can read offline:** This whole site can be stored on your device, see [Offline reading](../offline.md). The same goes for any other reference material you rely on. Downloading it when you need it is already too late
- **Offline maps:** Every major mapping app supports downloading a specific area in advance
- **A contact list:** Numbers that live only in a cloud address book, with no offline copy, are out of reach during an outage. Copy them onto paper, or into a file held locally on the device

### Backups have to open without a connection

A backup that exists only in the cloud does not exist during an outage. Keep at least one copy locally or on external storage, and confirm that copy opens without needing to check in with a server.

Encrypted backups deserve a specific check here. Some encryption schemes verify a licence with a server when opening. You will not notice in normal times, and you will find out during the outage. Files encrypted in a public format such as [age](../tools/what-is-age.md) have no such dependency: any computer with the command-line tool opens them offline.

### Power

A power bank, a car charger, and knowing where there is electricity near where you live. Useful outside level four as well, because retrying repeatedly during a slowdown drains a battery faster than normal use.

### Agree who does what with the people you live with

Everything above is a solo job. The people you live with are different: when the outage happens they are in the same place as you, and what needs coordinating is who does what on the spot.

Start by checking whether the household has anything that cannot go without power: medical equipment that needs an outlet, medication that needs refrigeration, a family member with limited mobility in a building with no working lift. These determine how long level four is survivable, and whether to move somewhere else early.

Next, agree who picks up and looks after children and older relatives: what the school or care facility does when it cannot reach you, who goes to collect them, and where to wait if nobody can. The three-to-five-person list mentioned earlier solves who you can reach; this solves who does what on the ground. Keeping the two separate makes it less likely you miss something.

The household also needs information you can read without turning anything on: emergency contacts, medication names and dosages, where documents and insurance papers are kept. Write it on paper, keep it in a fixed place, and make sure everyone living there knows where that is.

## Agreeing things with other people in advance

The hardest part of an outage is usually not the missing tools, it is not being able to reach one specific person. The contact list is on the phone, the network is not, and all those numbers reach nobody. And a contact list was never going to hold something like "where to wait for them when you cannot get through".

This section is one task in five steps: agree it, write it down, go over it together, walk it once, and revisit it. Most people do half of the first step. For how well evidenced any of this is, see "How well evidenced this is" below.

### One, the six things to agree on

- **Who:** The people you have to reach during an outage. Keep the list short, three to five. A longer one is neither memorable nor workable
- **A main channel and a backup channel:** The two should fail for different reasons, see the next subsection
- **Where to look when you cannot get through:** A physical place plus a fixed window, for example between six and seven each evening
- **How to confirm it is really them:** What tells you a message arriving over an unfamiliar channel came from the person you think it did
- **How long without word before you prepare, and before you act:** Two stages rather than one
- **Who makes the call afterwards, and in what order people get contacted:** Several people knowing and nobody moving first is the most common way these arrangements fail

The two-stage timing comes from the communications plan template the [Rory Peck Trust](https://rorypecktrust.org/get-help/safety/risk-assessment/creating-a-communications-plan/){target="_blank"} gives freelance journalists. The wording sits in the PDF that page offers for download: "emergency preparations being considered after xx hours and activated after xx hours", with both figures left blank to fill in. With a single threshold there are only two states past that point, still waiting and something is wrong. The stretch in between, where you could check the itinerary and call around without alerting anyone outside the group, gets skipped.

There is no standard answer for how many hours. Neither [CPJ](https://cpj.org/2018/09/basic-preparedness-risk-assessment/){target="_blank"} nor the Rory Peck Trust template offers a default. Both leave the check-in frequency to be settled between you and your designated contact before you go.

As for the order in which people get contacted afterwards, most templates leave that blank too. A reasonable starting point is nearest first: a local contact or your own organisation, with official channels later. That ordering has no documented source behind it, so how you arrange it is your own call.

### Two, the backup channel has to fail differently

The most common way to fill this in is one messaging app as the main channel and a second messaging app as the backup. Both need the internet, so both go down on the same day, which leaves you with no backup at all.

Three things get mistaken for backups:

- **Direct Bluetooth apps such as Bridgefy:** These skip the carrier and the internet, passing a message from one nearby phone to the next. Each hop covers roughly a hundred metres and the relay depends on a dense crowd, which works at a protest and not for reaching people spread across a city. They are also less secure than an ordinary messaging app: academic work showed twice over that Bridgefy users could be tracked and messages forged, the second time after it had adopted Signal's encryption protocol ([reverse engineering in 2020](https://eprint.iacr.org/2021/214){target="_blank"}, [follow-up work in 2022](https://www.usenix.org/conference/usenixsecurity22/presentation/albrecht){target="_blank"}). Do not make it your only backup
- **Broadcast:** Iran's data hidden in satellite television signals, the shortwave service the BBC opened during the crisis in Sudan, and the Ukrainian government's requirement that radio stations hold at least three days of power during blackouts were all genuinely used. All of them run one way. Receiving a broadcast is a different thing from reaching a person
- **Anything that needs the other person online too:** That includes voice over IP and satellite internet terminals. A satellite terminal also needs power, so at level four it will not turn on either

At least one backup should not go over the internet. Myanmar in early 2021 is the clearest case on record: the operator confirmed voice and SMS stayed open after the coup while data was cut. How far a landline holds up varies by event: residents in Cuba in 2021 said theirs was down for half an hour, Iran in 2019 has [measurement showing a partial shutdown of telephony services](https://netblocks.org/reports/internet-disrupted-in-iran-amid-fuel-protests-in-multiple-cities-pA25L18b){target="_blank"}, and in Kashmir in August 2019 landlines, fixed broadband and mobile went down together. A landline is not a guaranteed floor. Its value is that it fails under different conditions than the network.

### Three, whoever checks has to know the answer already

After an outage you get a message from someone claiming to be one of the people in your arrangement, and you need to judge whether it really is them.

You ask a question only the two of you know the answer to. **Whoever is doing the checking has to know the correct answer**, otherwise asking settles nothing. So the answer stays with you. What it must not do is sit next to the question, because anything on the same piece of paper gets found together.

Military challenge and password work the same way. Both sides agree the words beforehand. The sentry knows the correct reply and does not offer it, waiting for the person approaching to say it first. On D-Day the challenge was "flash" and the reply "thunder".

Proof-of-life forms (used in kidnap negotiation to establish that a hostage is alive and that the words are really theirs, through a question agreed in advance) commonly write down both the questions and the answers, because that document exists to be handed to the negotiator who checks the replies against it. The price is that it has to be encrypted, access-controlled, and reviewed every three years.

The workable middle ground is to write the questions, agree the answers in person, and keep those in your heads. If you cannot hold them there, put them in a password manager or an encrypted note, stored apart from the questions.

**One limit to know going in:** if you cannot remember the answers for three to five different people, the check fails at the moment you need it. Pick questions whose answers you are certain to retain. A shared experience holds better than a fact, so "how late was the train we waited for" beats "what number is your street".

There is a related but different idea worth separating out, the duress code, meaning "am I saying this freely". People trained in this are consistent about it: memorise the code rather than write it down, because once it leaks, the defending side has no way of knowing, and goes on trusting a signal the other party can now produce at will.

### Four, the trade-off in writing it down

What you cannot remember is not a plan, and what you write down is one more thing that can be found on you. There is no correct answer here. It depends on who you are protecting yourself from.

**If what you are facing is an accident**, going missing, ending up in hospital, being separated from people, then whoever finds the paper has no reason to go after anyone else on it, and writing it out in full is fine.

**If you or anyone on the list can be stopped and searched, have their home searched, or be questioned at a border, and knowing the wrong people is itself treated as evidence**, then the full list should not travel with you. Protest safety guides commonly suggest writing a single legal hotline number on your arm in permanent marker, on the grounds that possessions are confiscated on arrest. A list of three to five contacts with meeting times, places and verification methods is an order of magnitude denser than that.

The middle ground is to split it:

- **What travels with you:** code names, channels, one meeting point and the two waiting times. No real names
- **What stays at home or with one person on the list:** who each person is and where to find them, the steps to take once contact is lost, and the questions that confirm identity

Professional templates already split it this way. The Rory Peck Trust communications plan and proof-of-life document are two separate files, not one. Wartime resistance networks followed the same logic, keeping cells down to a few people who each knew only their own single contact, so that an arrest gave up as little as possible.

### Five, three steps after the conversation

**Go over it together:** Fill in your own version, then read it through item by item with every person on the list. Only a version you have gone through together counts. An agreement written down by one side is one the other side has never heard of. Each side keeps the answers to the verification questions in their own head, rather than sending them over the same channel to confirm.

**Walk it once:** Actually go to the meeting point, and check it can be reached at night, at the weekend, and when the area is crowded. Try the backup channel once, and confirm the landline is still in service and that the person actually picks up. A backup channel that only exists on paper differs from no backup at all only in how it makes you feel.

**Revisit it:** Changing jobs, moving house, changing contact details, or a change in anyone's situation are all reasons to check the content still holds. When it changes, change the version date, and tell whoever holds the old copy that it is void. Otherwise two people end up with different meeting points.

## Working during an outage

During an outage most online tools have nothing to work with, and encryption cannot rescue a file that will not send. What this time is good for is writing things down and keeping them safe, then sending once connectivity returns.

### Break the work into units that finish offline

Writing, sorting, captioning photos: none of that needs a connection, so finish it first. Anything that needs a lookup before it can continue goes on a list to check in one pass once connectivity returns.

Retrying is the most common waste of both time and battery. Retries help neither the congestion of level one nor the total outage of level three, and at level four every retry shortens the time the device has left.

Work in progress needs to land in a local file. A cloud editor's tab still accepts typing while offline, but close the tab or let the device die and those words may not survive.

### Exchanging things with the person in front of you

Bluetooth and local networks do not pass through an operator, so they keep working during a total outage. Cameras and screens are another route, and several of the utilities on this site were written for exactly this situation. All of them compute in your browser and send nothing:

- **Moving a file between two devices:** [QR code frame stream](../utils/qr-stream.md) splits a file into a run of QR codes played in sequence, and the second device reads them back with its camera and reassembles the original. No pairing, no shared network
- **Reading a QR code off paper or someone else's screen:** [QR code reader](../utils/qr-read.md). The image never leaves the device, and when the result is a URL the host is called out on its own
- **Handing a long string to the person in front of you:** [QR code generator](../utils/qrcode.md). Onion addresses and bridge lines are easy to mistype, so let the other person read them with a camera
- **Needing a challenge phrase or a password on the spot:** [Passphrase and password generator](../utils/passphrase.md), for agreeing a phrase that confirms identity, or for a password for an encrypted backup

For a file going to someone who is not in front of you, on a USB stick or a memory card or carried by hand, seal it first with [local file encryption](../utils/age.md). The output is the age format, so whoever receives it can open it with the command-line tool without coming back to this site.

The four pages above and the utilities index are stored on the device automatically along with the core chapters, and they show up in the list on [Offline reading](../offline.md). Local file encryption and the rest of the utilities have to be ticked yourself, and remembering after the network drops is too late.

Exchanging things by camera and screen means one device's screen has to stay on and the other's camera has to stay running, which drains far more power than typing a message. When the battery is low, weigh whether the exchange is worth it first, especially at level four.

### Get what you are sending ready before connectivity returns

One thing that can be finished during the outage is cleaning up photos and screenshots. The [file metadata stripper](../utils/strip-metadata.md) removes GPS coordinates, device model and capture time, and [screenshot redaction](../utils/redact.md) fills names and avatars that should not leave with solid black. Both run locally.

Doing it during the outage matters because the first few minutes after a connection returns are busy enough; see the next section.

### When the outage runs into days

Three methods have clear documented use: landlines still worked in some events, physically moving outside the affected area, and physical hubs set up by institutions. For the limits of each, see "How well evidenced this is" below.

Past the first day, what gets used up shifts from power to attention. Checking for a signal every few minutes, or staying up all night by the one radio in the house, both spend tomorrow's energy today. With more than one person, take turns checking; alone, check a fixed number of times a day and leave the device off in between. At level four this is even more direct: every time the screen lights up, it takes a bite out of the time you have left.

Sleep and meals need to be planned in as well. After a few days the first thing to give out is usually judgement, and no tool helps at that stage.

### Where the tools do not help

At level four, once the device powers down every tool above is useless, and what is left is paper plus the meeting arrangements made in advance. Real preparation happens while there is still power and still a connection.

None of these utilities has documented use in a real shutdown. They sit exactly where "Agreeing things with other people in advance" sits: a plan that holds up mechanically. The methods with recorded use are the three in the previous subsection.

## The moment connectivity returns

This is the most overlooked stretch and the riskiest, because attention goes to what to do while it is down.

### Everything starts syncing at once

The moment the connection is back, every queued app on the device starts uploading and downloading together. Photo backup, the outbox, system updates, backup tools, all at the same time.

Two problems follow. First, the traffic signature at that moment is distinctive, and the period right after a network returns is exactly when observation is heaviest. Second, every photo taken during the outage, including the ones you had no intention of letting out, goes up with the rest, with no confirmation prompt in between.

The approach is to control the order of the return. When you notice connectivity is back, stay in flight mode or keep automatic sync off and open one channel to find out what the situation is outside. Only then decide item by item what to send.

### Location and time travel with the content

Among everything waiting to upload, photos carry the most attached information. Cameras write GPS coordinates and the capture time into every photo by default, and when connectivity returns, photo backup uploads those along with the image, so where you went and when during the outage ends up in the cloud regardless. Files you are handing to someone else can be cleaned first with the [file metadata stripper](../utils/strip-metadata.md); your own camera roll's automatic backup never goes through that step.

The device's own location history mostly stays local. Google announced in late 2023 that [Maps Timeline would move onto the phone](https://blog.google/products/maps/updates-to-location-history-and-new-controls-coming-soon-to-maps/){target="_blank"}, in the original wording, "soon your Timeline will be saved right on your device," with cloud backup an opt-in you turn on separately. iOS's Significant Locations are likewise encrypted on-device. What actually goes out the moment connectivity returns is whichever apps hold location permission and normally report in the background.

To control that, turn off automatic sync for photo backup and those apps before connectivity returns, and switch them back on one at a time once you have confirmed the situation outside.

### What is queued may no longer be safe to send

The messages you wrote during the outage were written against the situation as you understood it then. Hours or days later those assumptions may have moved: the person you are contacting has relocated, a channel that was safe is not, information you meant to publish would now put someone at risk.

Read each one before it goes. That is worth the extra minutes.

### Check on the other person before transferring anything

The first action after reconnecting is to check, not to transfer. Whether they are safe, whether the channel they are using is still trustworthy, whether they are still where they were. Decide what to send after that.

## Taiwan in context

Taiwan's external connectivity and electricity supply can both be seen in rough outline in public data. What that data is good for is judging what an outage might look like. It is not a prediction.

**Undersea cables and the grid:** The [Tor relay globe](../games/tor-network.md) zoomed to Taiwan shows cable landing points, substations, power plants and the 345kV (kilovolt, the voltage class of Taiwan's main high-voltage transmission lines) backbone, each layer labelled with its source and precision. Figures such as the number of landing points and the capacity headroom at substations give a sense of how concentrated external connectivity and power supply are.

**How far network measurement reaches:** [ASN measurement coverage in Taiwan](../regional/ooni-asn-coverage.md) sets out which autonomous systems (ASNs, blocks of the internet each administered by a single organisation such as a carrier) are actually being measured. That determines whether public data can corroborate an anomaly when one occurs.

**What this data cannot be used for:** It describes the current state and the degree of concentration. It does not support any inference about whether a particular event will happen, or when. Reading high concentration as a sign that an outage is imminent is over-reading it.

## How this differs by role

Priorities during an outage differ by who you are:

- Still filing during an outage while protecting sources, see [Journalists and source protection](./journalist.md)
- Keeping an organisation in contact internally during an outage, see [Activists and protest digital safety](./activist.md)
- Already living with blocked services long term, see [Sharing information on mainland Chinese platforms](./mainland-speech.md)
- Reporting observations continuously during an election, see [Election observer self-protection](./election-observer.md)
- No particular role, the baseline in [What everyone should be doing](./everyday-baseline.md) applies during an outage as much as at any other time

## How well evidenced this is

Across the documented shutdowns in Iran, Myanmar, Kashmir, Sudan, Ethiopia, Ukraine, Cuba and Hong Kong, there is no account of an individual using a paper contact list and it later being recorded as having helped. The one documented use of paper is from the Tigray shutdown in Ethiopia, where the World Health Organization fell back on paper reports carried by hand, and that was institution-to-institution reporting.

The same holds for acting after a set period of silence. It is standard advice in American family preparedness templates, and none of those eight events has a first-hand account of it being carried out.

What is documented as having worked is a different set of things: landlines staying up in some events, physically travelling to where there is a connection (after the 2019 Kashmir shutdown people travelled out of the restricted area on the existing regional train service to get online), and physical sites set up by institutions (Ukraine's Points of Invincibility, the media centre in Kashmir, the Red Cross satellite phone in Tigray). Points of Invincibility were emergency sites the Ukrainian government set up during power and network outages, offering electricity, heating and connectivity.

Organisers in Pakistan in 2025 are recorded as having agreed meeting points in advance. But the "be water" tactic in Hong Kong in 2019 deliberately avoided fixed assembly points, on the grounds that fixed leadership and locations in 2014 had made people easier to target. The same practice cuts in opposite directions for finding family and for street protest.

So the honest description of "Agreeing things with other people in advance" is a reasonable precaution rather than a historically proven mainstay. That does not make it not worth doing: going over it together and walking it once need nobody's validation, cost little, and once done are done. Without those two, however complete the content, it is only a piece of paper.

## What this page does not do

- **No circumvention how-to:** The methods change quickly and written instructions go stale, and a specific list leads the people following it to overestimate how safe they are, while they carry the consequences
- **No prediction of specific events:** This page describes known mechanisms and publicly verifiable infrastructure data
- **No legal advice:** Communications controls during an outage and the law around them vary by jurisdiction, so consult a lawyer or a rights organisation locally
- **No guarantee that anything here works:** Every backup channel has its own failure conditions, and this page tries to state them

## Three things you can do now

1. **Store this site on your device**, see [Offline reading](../offline.md). Installing it once the network is down is too late
2. **Confirm your backups open without a network**, particularly the encrypted ones
3. **Agree a second channel and a meeting point with three to five people you have to reach**, following the section above. Once agreed, go back and read it through with them. That step matters more than writing it down

## Where to get help

- [Taipower customer service line, 1911](https://www.taipower.com.tw/2289/2290/2317/3482/){target="_blank"}: Taiwan Power Company's line for outage status and reporting a line fault, 24/7 year-round, toll-free (except from public payphones), calls capped at 5 minutes
- If it is the network line itself that is down, call your own carrier's customer service. Numbers differ by carrier, so write yours down on paper beforehand; you will not be able to look it up once the network is down
- [Access Now #KeepItOn](https://www.accessnow.org/keepiton/){target="_blank"}: reporting and international assistance for network blocking and shutdowns
- [Access Now Digital Security Helpline](https://www.accessnow.org/help/){target="_blank"}: multilingual help for urgent digital security problems
- [Emergency help](../help/index.md): step-by-step lists for accounts, devices, harassment and outages

## Related reading

- [What everyone should be doing](./everyday-baseline.md): the shared baseline this page assumes you already have
- [Journalists and source protection](./journalist.md): the full workflow for filing during an outage while protecting sources
- [Activists and protest digital safety](./activist.md): another emergency contact and missing-person workflow, shaped by field conditions
- [Offline reading](../offline.md): storing this site on your device, and managing what is kept there
- [Utilities](../utils/index.md): everything computes in your browser, and they work with no network once stored
- [Tor relay globe](../games/tor-network.md): zoom to Taiwan for cable landing points, substations, power plants and the 345kV backbone
- [ASN measurement coverage in Taiwan](../regional/ooni-asn-coverage.md): which autonomous systems are actually being measured
- [Threat modelling](../basics/threat-model.md): deciding how far to prepare based on your own situation
