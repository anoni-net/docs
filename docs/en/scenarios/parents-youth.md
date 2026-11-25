---
title: Online privacy for parents and youth
description: Parental controls cannot catch everything, and young people are good at getting around them. This page starts from a family security plan and covers readiness, media literacy, what controls at the router, device, and app levels can do, quick privacy settings, and school-issued devices.
icon: material/human-male-child
---

# :material-human-male-child: Online privacy for parents and youth

Every family answers questions about games, video, and social media differently, and the answers change as children grow. Trying to protect against everything is impractical and exhausting. It works better to decide what matters most to your family and plan from there, using the same thinking as a personal security plan ([threat modeling](../basics/threat-model.md))[^ssd].

This page is adapted from EFF Surveillance Self-Defense's [Online Privacy for Parents and Youth](https://ssd.eff.org/module/online-privacy-for-parents-and-youth){target="_blank"} (last reviewed October 2026), which includes setup links for many devices, apps, and streaming services. This page summarizes the approach and adds context from Taiwan. It does not try to settle screen-time limits or which games are appropriate[^ssd].

!!! note "From the young person's side"

    The same controls can become a tool for coercion in other households. How Family Link and family sharing look from the monitored side is covered in [LGBTQ+ anonymous social life across the Sinophone region](./lgbtq.md) and [domestic violence and tech-enabled abuse](./domestic-violence.md).

!!! tip "Short on time? Start here"

    - List the devices and apps in your home and pick one or two concerns, instead of trying to block everything
    - Learning how your child's games and apps work beats any monitoring tool
    - Treat parental controls as conversation starters, not set-and-forget safety
    - Treat a school-issued tablet as monitored, and keep personal accounts off it

## A family security plan

Ask: what do I want to protect, from whom, how bad would it be, how likely is it, how much effort am I willing to spend, and who are my allies (a partner, grandparents, your child's friends and their parents)? Be specific, for example "my child's privacy and wellbeing while chatting with their best friend in Roblox", not just "my child". Revisit the answers as they grow, since a five-year-old and a seventeen-year-old need very different things, and the ongoing conversation builds the trust that makes them come to you when something odd happens[^ssd].

Before a new app or device, consider whether your child understands what private information is, can tell people from AI chatbots, can say when they are uncomfortable, knows people online may not be who they claim, and is ready to talk to strangers or should stick to family[^ssd].

## Media literacy, together

No tool replaces learning how the internet works and teaching it. Spend time in the games and apps your child uses (Minecraft is as much a social space as a game), and try to "find your way to a yes" together. Conversations can start indirectly, by watching them play or sharing a scam message you got, or directly: what do you like most about being online, how can you tell someone isn't who they say they are, and who would you talk to if something went wrong[^ssd]?

## What parental controls can and cannot do

Young people trade tricks for getting around controls and go online at school and friends' homes. Monitoring every site and conversation becomes a problem as they age, and young people who feel supported rather than watched are more likely to speak up[^ssd].

- **Router level**: content filters cover only devices on your home network, and randomized MAC addresses make per-device schedules unreliable. Broad categories often block support resources, identity information, and LGBTQ+ topics, and some parents use filters to control rather than support. DNS-level filtering is covered in [how to choose encrypted DNS](../tools/encrypted-dns.md)[^ssd]
- **Device level**: screen time, purchase limits, contact limits (which may need setting on the phone and in each app), content limits, and location tracking, which is worth explaining to your child along with when it will end. See Apple's [Use parental controls on your child's iPhone or iPad](https://support.apple.com/en-us/105121){target="_blank"} and Google's [Family Link](https://support.google.com/families/answer/7101025?hl=en){target="_blank"}. Third-party monitoring apps often collect more data than expected with weak security, the same category of software used for stalkerware[^ssd]
- **App and game level**: Roblox, Fortnite, Minecraft, TikTok, Instagram, WhatsApp, and Discord have their own controls for chat, content, and time. Streaming services offer kids' profiles with a PIN on adult profiles. Children also watch others play on YouTube and Twitch, so literacy matters more than locking down any one device[^ssd]

## Quick wins and bigger projects

Many steps protect you as well as your child: install EFF's Privacy Badger, disable the advertising ID (accounts under 13 do not have one, but 13 to 17 do), review app permissions, check AI features, turn off autoplay, set bedtime notification modes, and use filter lists to trim YouTube. Parents comfortable with technology can set up a family password manager, a home media server with Jellyfin or Plex, or a Pi-hole to block ads and trackers across the home network[^ssd].

## School devices and software

Treat school-issued devices as monitoring tools and keep personal accounts off them. Ask the school what software it uses, and work with other parents to push for better settings or opting out[^ssd]. In Taiwan, tablets issued under the Ministry of Education's "a tablet for every student" program report usage to a mobile device management (MDM) system[^udn].

## Getting help in Taiwan

Harmful content online can be reported to [iWIN](https://i.win.org.tw/iWIN/){target="_blank"}, Taiwan's internet content protection institution, hotline `(02)2577-5118`. For bullying, threats, or sexual exploitation, call the `113` protection hotline or the police.

## Sources and review

Adapted from [Online Privacy for Parents and Youth](https://ssd.eff.org/module/online-privacy-for-parents-and-youth){target="_blank"} in EFF's [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"}, last reviewed on 2026-10-21 and licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/){target="_blank"}. We added Taiwan's school tablet program and support resources, and left out the US resources and per-platform setup links, which the original lists in full. This page has not been reviewed by EFF, and anoni.net is responsible for any differences from the original.

## Where to go from here

- [Threat modeling](../basics/threat-model.md): the full version of the six questions
- [Phone privacy settings, step by step](../tools/phone-privacy-settings.md): permissions, ad tracking, and location sharing
- [LGBTQ+ anonymous social life across the Sinophone region](./lgbtq.md): accounts and local traces under family control, from the young person's side

[^ssd]: [Online Privacy for Parents and Youth](https://ssd.eff.org/module/online-privacy-for-parents-and-youth){target="_blank"} - EFF Surveillance Self-Defense, last reviewed 2026-10-21.
[^udn]: [為拉高生生用平板使用率...老師淪「開機員」？北市教育局曝原因](https://udn.com/news/story/7323/8368120){target="_blank"} - United Daily News (Chinese), 2024-11-18.
