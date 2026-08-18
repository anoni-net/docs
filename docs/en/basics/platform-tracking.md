---
title: How platforms collect your data, and the microphone question
description: What social platforms actually collect, why targeted ads feel like eavesdropping, what the research says about apps recording your microphone, and the regional twist that ties all of it to a legal identity.
icon: material/radar
---

# :material-radar: How platforms collect your data, and the microphone question

You mention something to a friend, and the ad shows up the next day. The experience is common enough that "my phone is listening" has become the default explanation.

This page does two things. It points to the canonical account of how third-party tracking actually works, and it addresses the microphone question directly, because that one is asked constantly and answered badly. Metadata your own communications and files carry is a separate topic, covered in [metadata](./metadata.md); this page is about what platforms actively collect.

!!! info "We point outward on the mechanics"

    EFF's [Behind the One-Way Mirror](https://www.eff.org/wp/behind-the-one-way-mirror){target="_blank"} is the reference for how corporate tracking works: invisible tracking pixels, browser fingerprinting, social widgets, mobile SDKs, and the data-broker ecosystem behind them. It reports that the average web page shares data with dozens of third parties, and that mobile apps do the same, many collecting location and call records even when not in use. We don't reproduce that work.

## Why targeted ads feel like eavesdropping

The inference does not need your voice. A few of the mechanisms that produce the "it heard me" effect:

- **Lookalike audiences.** An advertiser uploads a customer list and the platform finds people with similar behavior. You may never have expressed interest in anything; you simply resemble people who bought.
- **The social graph.** A friend searched for it, a friend bought it, or a friend's device sat on the same Wi-Fi as yours. The association doesn't have to originate with you.
- **Co-location.** Two devices repeatedly in the same place at the same time is itself a commercially valuable relationship.
- **Shared triggers.** You and your friend discussed the thing because you both saw the same news, event, or seasonal prompt. The ad system reacted to the same trigger, which reads as if it overheard the conversation.
- **Behavioral signals you don't think of as signals.** Dwell time on a post you didn't like, scroll-back, typing you deleted before sending, screenshots, and the hours you open the app.

None of that requires a microphone.

## Data brokers have names and enforcement records

EFF's report above dates from 2019 and stops short of the enforcement record that followed. Across five FTC cases since 2022, three collection routes appear, and a phone's owner can see only one of them[^ftc-brokers].

The first route is an embedded SDK. X-Mode Social shipped location code inside roughly 400 apps, among them the prayer app Muslim Pro. Lawyers for X-Mode confirmed that the company sold US phone data to US military customers through defense contractors. Muslim Pro, run from Singapore with more than 98 million downloads, ended the arrangement after Motherboard's reporting and denied selling data to the military[^xmode]. The FTC's January 2024 order against X-Mode and Outlogic was the first to prohibit the sale of sensitive location data outright, and InMarket Media drew a comparable order that month. Kochava is the oldest of the five, sued in August 2022 over location data precise enough to trace visits to reproductive health clinics and places of worship, and settled in May 2026 with a ban on selling location data without affirmative express consent.

The second route is the ad auction. When an app offers an ad slot on a real-time bidding (RTB) exchange, the bid request broadcasts the device's precise location and advertising identifier to every bidder in that auction. Between January 2018 and June 2020, Mobilewalla assembled more than 500 million advertising identifiers paired with precise locations, roughly 60 percent of that from RTB, and it kept the contents of bid requests it had lost. The FTC's December 2024 order was the first finding that retaining a losing bid request is itself an unfair practice[^ftc-brokers].

The third route is buying wholesale. Gravy Analytics purchased location data in bulk from other suppliers, then used geofencing to compile and sell lists of people who had visited health facilities and places of worship, with its subsidiary Venntel serving public-sector customers and government contractors. In January 2025 Gravy Analytics was itself breached. An attacker used a misappropriated key to reach its AWS environment, and at least 30 million location points leaked publicly, sourced from apps including Tinder, Grindr, Candy Crush, MyFitnessPal, and FlightRadar[^gravy].

An app's developers control only the first route. On the other two they need not know who is logging their users, and the device raises no permission prompt for either. Part of what leaked from Gravy Analytics was inferred from IP addresses, which needs no cooperation from an app at all[^gravy]. Turning off an advertising identifier, still worth doing, narrows the resulting profile rather than closing it.

No regulator across the Sinophone Asia-Pacific has brought a location-broker case on this scale. Taiwan's Personal Data Protection Commission is still waiting on its organizing statute, tracked in [Taiwan's 2025 data protection overhaul](../regional/taiwan-pdpa-2025.md), and enforcement sits with sector regulators in the meantime.

## What the evidence on microphones actually says

### Human review of voice assistants is real, and narrower than the rumor

Apple's August 2019 statement acknowledged that its Siri quality-evaluation process, which it calls grading, had contractors review under 0.2 percent of Siri request audio, including recordings produced by accidental activations. Apple suspended grading after the reporting, then made it opt-in, limited to Apple employees, with inadvertent-trigger recordings deleted[^apple-siri]. Amazon and Google ran comparable review programs in the same period. This is a real privacy failure, and it concerns a feature you deliberately authorized to listen for a wake word. It is not evidence that social apps record you continuously.

### Large-scale testing found no covert audio recording

A 2018 study published in PETS instrumented 17,260 Android apps and looked for exactly this: apps enabling the microphone and exfiltrating audio without the user's knowledge. It found no evidence of that. What it did find was several apps recording the user's *screen* and sending the video to third parties, a behavior that required no permission on Android at the time[^panoptispy].

That second finding is the useful one. The collection that is genuinely happening does not need the microphone, and triggers no permission prompt.

### "No evidence found" is not "proven absent"

That study sampled Android in 2018 and its coverage of encrypted traffic was limited. In August 2024, 404 Media obtained a pitch deck from the US advertiser Cox Media Group claiming its "Active Listening" product could capture conversations through smart-device microphones for ad targeting, naming Facebook, Google, and Amazon as partners. Google dropped the company from its partner program when asked, and the company denied listening to conversations[^cmg]. What that establishes is that someone is selling the concept, not that the technique operates at scale.

### You can check for yourself

On iOS 14 and later, an orange dot in the status bar means an app is using the microphone and a green dot means the camera[^apple-dot]; swipe down from Control Center to see which app. Android 12 and later shows the equivalent indicators plus a Privacy Dashboard listing microphone and camera access over the past 24 hours. If you suspect a specific app, watching the indicator for a few days beats speculating.

## The regional angle

The tracking mechanics are global. What differs across Sinophone Asia-Pacific is how directly the collected profile resolves to a legal person.

- **Real-name registration closes the gap.** Where SIM cards and major platform accounts are bound to identity documents by law, an advertising profile is not a pseudonymous blob; it attaches to a named individual whom local authorities can query. See [metadata](./metadata.md) for the same point about communication records.
- **The data can be compelled, not just sold**: in the commercial-surveillance frame that most English-language guidance assumes, the worst case is a data broker. Where platforms operate under local data-localization and disclosure obligations, the same profile is reachable by legal process.
- **Contact upload spreads exposure to people who never consented.** Your phone number can already sit in a platform's graph because someone else uploaded their address book, which matters more where a number maps to an identity document.

### Mainland Chinese platforms add a further layer

WeChat, Douyin, Xiaohongshu, and Weibo differ from the global platforms above in three ways, and this applies to diaspora users of those apps too.

- **The account resolves to a legal person**: accounts bind to a phone number and the number to an identity document, with the national Cyberspace ID added on top since July 2025. An ad profile that is a pseudonymous blob elsewhere is a named individual here.

- **The data sits in-jurisdiction and is reachable by legal process**: for global platforms the worst case is usually a data broker. For mainland platforms the data is held domestically and is also within scope of lawful access requests. That is a difference in kind, not degree.

- **The content is simultaneously censored**: Citizen Lab's WeChat research found that keyword filtering is enabled only for accounts registered with a mainland phone number and persists after relinking to an international one, that images are filtered by both OCR and visual-similarity matching, and that blocking is invisible to the sender. Content between non-mainland accounts is analyzed as well, and has been used to train the censorship system[^wechat].

The practical consequence: turning off the advertising identifier and refusing tracking does much less here, because the problem is not in the ad-tracking layer. Account layering is similarly limited — the methods in [maintaining multiple online identities](./multiple-identities.md) assume services outside the mainland, and the real-name chain cancels most of the benefit. What still works is behavioral separation: not reusing one account across purposes, and not cross-referencing between them. Full context in [posting on mainland Chinese platforms](../scenarios/mainland-speech.md).

Quitting is not an option for most people. If you keep using them, these adjustments are cheap and their effect is certain: restrict who can see your posts and history, revoke contacts and location permissions, reduce your visibility inside group chats (member lists, nickname, avatar are visible to strangers, and groups carry administrator liability), and keep sensitive matters off the platform entirely, including arranging when and what to discuss.

## What actually helps

- **Turn off the advertising identifier.** On iPhone, Settings → Privacy & Security → Tracking, then switch off "Allow Apps to Request to Track"; apps that ask are then denied the IDFA[^apple-att]. On Android 12 and later you can delete the advertising ID outright, after which apps receive a string of zeros[^google-adid].
- **Turn off contact upload.** This one protects your contacts, who never agreed to be uploaded.
- **Turn off precise location** where an approximate one will do, and review which apps hold microphone, camera, location, and contacts permissions.
- **Separate browsing contexts**, block third-party cookies and trackers, and avoid federated "sign in with" buttons, which join two records together.
- **Separate accounts** for genuinely distinct purposes, covered in [maintaining multiple online identities](./multiple-identities.md).

### See what a platform actually holds on you

Opening your own file beats trusting any explanation. Most platforms are required to offer data export and ad-preference pages:

- **Inferred ad interests**: Google's My Ad Center and Meta's ad preferences both list the topics the system thinks you care about. Reading that list usually lands harder than any description of the mechanism.
- **Data export**: Google Takeout, and "download your information" on Meta and Instagram, cover posts, searches, location, and ad interactions.
- **Login and device history**: most security settings include a list of devices and locations that have signed in.

The export itself is highly sensitive personal data. Store it encrypted, and keep it out of your downloads folder and cloud sync.

Note what this list does not claim: none of it stops behavioral profiling inside a platform you use, and revoking microphone access changes none of the mechanisms in the first section. It also assumes your jurisdiction does not restrict these tools; Tor cannot be reached directly from inside mainland China, and using circumvention carries its own risk there.

## This page will age

Platform settings and policies change every few months. The mechanisms are durable; the menu paths are not. Verify against each platform's current privacy settings before relying on a specific step, and tell us via the [Community](../community/index.md) page if something here no longer matches reality.

## Where to go from here

- [A browser fingerprint cannot be cleared the way a cookie can](./browser-fingerprinting.md) — expands the device-and-connection signals named on this page into why they cannot be cleared
- [What surveillance can actually do](./surveillance-capability.md) — places this page's platform layer alongside telecom, legal process, and commercial spyware
- [What an ordinary person should actually do](../scenarios/everyday-baseline.md) — puts this page's collection thread back into the overall ordering, next to fraud and targeted investigation
- [Metadata, and why it matters](./metadata.md) — the communication-side counterpart to platform-side collection
- [Threat modeling](./threat-model.md) — where "platform business model" sits as an adversary, and what it's worth spending to counter it
- [Maintaining multiple online identities](./multiple-identities.md) — separating contexts so one profile doesn't absorb everything
- [Using AI at work without leaking data](../tools/ai-privacy.md) — the same question applied to AI assistants: where the text goes, and who keeps it
- [Privacy Guides](https://www.privacyguides.org/){target="_blank"} — maintained tool recommendations, which we don't duplicate

[^apple-siri]: [Improving Siri's privacy protections](https://www.apple.com/newsroom/2019/08/improving-siris-privacy-protections/){target="_blank"} — Apple Newsroom, August 2019, on the grading program, the sampling rate, its suspension, and the move to opt-in.
[^panoptispy]: [Panoptispy: Characterizing Audio and Video Exfiltration from Android Applications](https://petsymposium.org/popets/2018/popets-2018-0030.php){target="_blank"} — Proceedings on Privacy Enhancing Technologies 2018; Pan, Ren, Lindorfer, Wilson, and Choffnes (Northeastern University and UC Santa Barbara), an automated analysis of 17,260 Android apps.
[^wechat]: [One App, Two Systems](https://citizenlab.ca/research/wechat-china-censorship-one-app-two-systems/){target="_blank"}, [How WeChat Filters Images for One Billion Users](https://citizenlab.ca/2018/08/how-wechat-filters-images-for-one-billion-users/){target="_blank"}, and [We Chat, They Watch](https://citizenlab.ca/2020/05/we-chat-they-watch/){target="_blank"} — The Citizen Lab.
[^cmg]: [Here's the Pitch Deck for 'Active Listening' Ad Targeting](https://www.404media.co/heres-the-pitch-deck-for-active-listening-ad-targeting/){target="_blank"} — 404 Media, August 2024, on the Cox Media Group pitch deck. Verified 2026-08.
[^apple-dot]: [About the orange and green indicators in your iPhone status bar](https://support.apple.com/en-us/108331){target="_blank"} — Apple Support.
[^apple-att]: [If an app asks to track your activity](https://support.apple.com/en-us/102420){target="_blank"} — Apple Support.
[^google-adid]: [Advertising ID](https://support.google.com/googleplay/android-developer/answer/6048248){target="_blank"} — Google Play Help; deletable from Android 12, after which apps receive zeros.
[^ftc-brokers]: The five FTC actions: [FTC Sues Kochava](https://www.ftc.gov/news-events/news/press-releases/2022/08/ftc-sues-kochava-selling-data-tracks-people-reproductive-health-clinics-places-worship-other){target="_blank"} (29 August 2022) and [FTC to Ban Kochava and Subsidiary](https://www.ftc.gov/news-events/news/press-releases/2026/05/ftc-ban-kochava-subsidiary-selling-sensitive-location-data){target="_blank"} (settlement, 7 May 2026); [X-Mode Social and Outlogic](https://www.ftc.gov/news-events/news/press-releases/2024/01/ftc-order-prohibits-data-broker-x-mode-social-outlogic-selling-sensitive-location-data){target="_blank"} (January 2024); [InMarket Media](https://www.ftc.gov/news-events/news/press-releases/2024/01/ftc-order-will-ban-inmarket-selling-precise-consumer-location-data){target="_blank"} (January 2024); [Gravy Analytics and Venntel](https://www.ftc.gov/news-events/news/press-releases/2024/12/ftc-takes-action-against-gravy-analytics-venntel-unlawfully-selling-location-data-tracking-consumers){target="_blank"} (December 2024); [Mobilewalla](https://www.ftc.gov/news-events/news/press-releases/2024/12/ftc-takes-action-against-mobilewalla-collecting-selling-sensitive-location-data){target="_blank"} (December 2024). The FTC's technologist blog post [Unpacking Real Time Bidding through FTC's case on Mobilewalla](https://www.ftc.gov/policy/advocacy-research/tech-at-ftc/2024/12/unpacking-real-time-bidding-through-ftcs-case-mobilewalla){target="_blank"} covers the bid-stream mechanism; the 500 million pairings and the 60 percent share are reported in [MediaPost](https://www.mediapost.com/publications/article/401568/ftc-restricts-mobilewalla-from-collecting-rtb-loca.html){target="_blank"}. EFF's [Federal Regulators Limit Location Brokers from Selling Your Whereabouts](https://www.eff.org/deeplinks/2024/12/federal-regulators-limit-location-brokers-selling-your-whereabouts-2024-review){target="_blank"} reviews the set. Verified 2026-08-18.
[^xmode]: [Muslim Pro Stops Sharing Location Data After Motherboard Investigation](https://www.vice.com/en/article/muslim-pro-location-data-military-xmode/){target="_blank"} and [How the U.S. Military Buys Location Data from Ordinary Apps](https://www.vice.com/en/article/us-military-location-data-xmode-locate-x/){target="_blank"} — Motherboard, Vice, November 2020. Source for the roughly 400 apps carrying the X-Mode SDK, Muslim Pro's transmission of location data, X-Mode's confirmation that it sold to US military customers through defense contractors, and Muslim Pro's denial and exit. Verified 2026-08-18.
[^gravy]: [Gravy Analytics data broker breach threatens the privacy of millions](https://techcrunch.com/2025/01/13/gravy-analytics-data-broker-breach-trove-of-location-data-threatens-privacy-millions/){target="_blank"} — Zack Whittaker, TechCrunch, 13 January 2025. Source for the breach account, the leaked volume, the apps involved, and the real-time-bidding and IP-inference collection routes. Verified 2026-08-18.
