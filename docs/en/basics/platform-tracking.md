---
title: How platforms collect your data, and the microphone question
description: What social platforms actually collect, why targeted ads feel like eavesdropping, what the research says about apps recording your microphone, and the regional twist that ties all of it to a legal identity.
icon: material/radar
---

# :material-radar: How platforms collect your data, and the microphone question

You mention something to a friend, and the ad shows up the next day. The experience is common enough that "my phone is listening" has become the default explanation.

This page does two things. It points to the canonical account of how third-party tracking actually works, and it addresses the microphone question directly, because that one is asked constantly and answered badly.

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

## What the evidence on microphones actually says

**Human review of voice assistants is real, and narrower than the rumor.** Apple's August 2019 statement acknowledged that its Siri quality-evaluation process, which it calls grading, had contractors review under 0.2 percent of Siri request audio, including recordings produced by accidental activations. Apple suspended grading after the reporting, then made it opt-in, limited to Apple employees, with inadvertent-trigger recordings deleted[^apple-siri]. Amazon and Google ran comparable review programs in the same period. This is a real privacy failure, and it concerns a feature you deliberately authorized to listen for a wake word. It is not evidence that social apps record you continuously.

**Large-scale testing found no covert audio recording.** A 2018 study published in PETS instrumented 17,260 Android apps and looked for exactly this: apps enabling the microphone and exfiltrating audio without the user's knowledge. It found no evidence of that. What it did find was several apps recording the user's *screen* and sending the video to third parties, a behavior that required no permission on Android at the time[^panoptispy].

That second finding is the useful one. The collection that is genuinely happening does not need the microphone, and triggers no permission prompt.

**You can check for yourself.** On iOS 14 and later, an orange dot in the status bar means an app is using the microphone and a green dot means the camera[^apple-dot]; swipe down from Control Center to see which app. Android 12 and later shows the equivalent indicators plus a Privacy Dashboard listing microphone and camera access over the past 24 hours. If you suspect a specific app, watching the indicator for a few days beats speculating.

## The regional angle

The tracking mechanics are global. What differs across Sinophone Asia-Pacific is how directly the collected profile resolves to a legal person.

- **Real-name registration closes the gap.** Where SIM cards and major platform accounts are bound to identity documents by law, an advertising profile is not a pseudonymous blob; it attaches to a named individual whom local authorities can query. See [metadata](./metadata.md) for the same point about communication records.
- **The data can be compelled, not just sold.** In the commercial-surveillance frame that most English-language guidance assumes, the worst case is a data broker. Where platforms operate under local data-localization and disclosure obligations, the same profile is reachable by legal process.
- **Contact upload spreads exposure to people who never consented.** Your phone number can already sit in a platform's graph because someone else uploaded their address book, which matters more where a number maps to an identity document.

## What actually helps

- **Turn off the advertising identifier.** On iPhone, Settings → Privacy & Security → Tracking, then switch off "Allow Apps to Request to Track"; apps that ask are then denied the IDFA[^apple-att]. On Android 12 and later you can delete the advertising ID outright, after which apps receive a string of zeros[^google-adid].
- **Turn off contact upload.** This one protects your contacts, who never agreed to be uploaded.
- **Turn off precise location** where an approximate one will do, and review which apps hold microphone, camera, location, and contacts permissions.
- **Separate browsing contexts**, block third-party cookies and trackers, and avoid federated "sign in with" buttons, which join two records together.
- **Separate accounts** for genuinely distinct purposes, covered in [maintaining multiple online identities](./multiple-identities.md).

Note what this list does not claim: none of it stops behavioral profiling inside a platform you use, and revoking microphone access changes none of the mechanisms in the first section.

## This page will age

Platform settings and policies change every few months. The mechanisms are durable; the menu paths are not. Verify against each platform's current privacy settings before relying on a specific step, and tell us via the [Community](../community/index.md) page if something here no longer matches reality.

## Where to go from here

- [Metadata, and why it matters](./metadata.md) — the communication-side counterpart to platform-side collection
- [Threat modeling](./threat-model.md) — where "platform business model" sits as an adversary, and what it's worth spending to counter it
- [Maintaining multiple online identities](./multiple-identities.md) — separating contexts so one profile doesn't absorb everything
- [Using AI at work without leaking data](../tools/ai-privacy.md) — the same question applied to AI assistants: where the text goes, and who keeps it
- [Privacy Guides](https://www.privacyguides.org/){target="_blank"} — maintained tool recommendations, which we don't duplicate

[^apple-siri]: [Improving Siri's privacy protections](https://www.apple.com/newsroom/2019/08/improving-siris-privacy-protections/){target="_blank"} — Apple Newsroom, August 2019, on the grading program, the sampling rate, its suspension, and the move to opt-in.
[^panoptispy]: [Panoptispy: Characterizing Audio and Video Exfiltration from Android Applications](https://petsymposium.org/popets/2018/popets-2018-0030.php){target="_blank"} — Proceedings on Privacy Enhancing Technologies 2018; Pan, Ren, Lindorfer, Wilson, and Choffnes (Northeastern University and UC Santa Barbara), an automated analysis of 17,260 Android apps.
[^apple-dot]: [About the orange and green indicators in your iPhone status bar](https://support.apple.com/en-us/108331){target="_blank"} — Apple Support.
[^apple-att]: [If an app asks to track your activity](https://support.apple.com/en-us/102420){target="_blank"} — Apple Support.
[^google-adid]: [Advertising ID](https://support.google.com/googleplay/android-developer/answer/6048248){target="_blank"} — Google Play Help; deletable from Android 12, after which apps receive zeros.
