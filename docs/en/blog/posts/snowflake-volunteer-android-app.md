---
date: 2026-08-05
authors:
    - anoni-net
categories:
    - Update
    - Tor
    - Translated Article
slug: snowflake-volunteer-android-app
image: "assets/images/tor.webp"
summary: "Tor Project shipped Snowflake Volunteer, a standalone Android app for running a Snowflake bridge. In its first three months, daily volunteer proxies grew from about 1,300 to about 1,700, up 29% in a month."
description: "Snowflake Volunteer turns being a Snowflake bridge into a single-purpose Android app. We cover what it does, the early growth numbers, and who in our region is actually well positioned to run it."
---

# Snowflake gets a dedicated app, and the volunteer pool grew 29% in a month

!!! info ""

    This post is based on the Tor Project announcement:

    - [Snowflake Volunteer, an Android app to help people bypass censorship | August 3, 2026](https://blog.torproject.org/snowflake-volunteer-standalone-app-to-help-people-bypass-censorship/){target="_blank"}

<figure markdown="span">
    <a href="https://forum.torproject.org/uploads/default/original/2X/c/c9143874b416a1c6e0d676145c11846ad63bad39.jpeg" target="_blank">
        <img src="https://forum.torproject.org/uploads/default/original/2X/c/c9143874b416a1c6e0d676145c11846ad63bad39.jpeg"
            alt="Snowflake Volunteer promotional graphic showing several phone mockups of the app's enable toggle, settings screen, and statistics screen"
            style="border-radius: 10px;">
    </a>
    <figcaption>Image source: <a target="_blank" href="https://blog.torproject.org/snowflake-volunteer-standalone-app-to-help-people-bypass-censorship/">Tor Project Blog</a>.</figcaption>
</figure>

We've [written before](iran-blackout-webtunnel.md) that [Snowflake](../../tools/tor-snowflake.md) is the lowest-barrier way to help people reach Tor: open a browser tab, leave it running, and you're relaying anonymous traffic. On 3 August, Tor Project lowered that barrier again with **Snowflake Volunteer**, a standalone Android app whose only job is being a Snowflake bridge.

<!-- more -->

## Why a dedicated app

Snowflake works by disguising a user's traffic as a video call and routing it through volunteer-run proxies over short-lived connections, which makes it harder for censors to detect and block. That depends on a large, steady pool of volunteers. In the first half of 2026, the Snowflake broker saw an average of roughly 146,000 unique volunteer proxy IPs check in per day[^1], with about a third of that coming from [Orbot's Kindness Mode](https://orbot.app/en/kindness/){target="_blank"}.

Portuguese app studio [Bloco](https://www.bloco.io/){target="_blank"} noticed how much Kindness Mode alone contributed and asked whether a single-purpose app could do even more. Building on the Guardian Project's [IPtProxy](https://github.com/tladesignz/IPtProxy){target="_blank"} library, Bloco focused on three things: keeping the app alive in the background without draining the battery, making the settings legible enough that anyone can configure it correctly, and showing volunteers a running tally of how much they've helped.

<figure markdown="span">
    <a href="https://blog.torproject.org/snowflake-volunteer-standalone-app-to-help-people-bypass-censorship/features-overview.png" target="_blank">
        <img src="https://blog.torproject.org/snowflake-volunteer-standalone-app-to-help-people-bypass-censorship/features-overview.png"
            alt="Three screenshots of the Snowflake Volunteer app: the main screen showing people helped and traffic stats, the settings screen with background-run, Wi-Fi-only, and charging-only toggles, and a statistics screen listing daily connections and traffic"
            style="border-radius: 10px;">
    </a>
    <figcaption>The app's main screen, settings, and statistics view. Image source: <a target="_blank" href="https://blog.torproject.org/snowflake-volunteer-standalone-app-to-help-people-bypass-censorship/">Tor Project Blog</a>.</figcaption>
</figure>

The result gives volunteers real control: run only in the background, restrict to unmetered Wi-Fi, run only while charging, or cap how many people it helps at once.

## The number that matters is +29% in a month

Snowflake Volunteer launched publicly in April after a round of community testing. Daily unique volunteer IPs went from about 1,300 in May to about 1,700 in June, a 29% increase in one month, with single-day peaks above 2,100. That's a meaningful jump for a channel that previously only existed as a browser extension, a website widget, a desktop CLI tool, or Orbot's Kindness Mode. It suggests a chunk of would-be volunteers were simply waiting for an option that fit how they actually use their devices, phone-first, not desktop-first.

The app currently ships in 8 languages (Chinese, English, French, German, Japanese, Portuguese, Turkish, and Vietnamese), and the project is looking for more translators via [Weblate](https://hosted.weblate.org/projects/snowflake-volunteers/){target="_blank"}.

## Who in our region should actually install this

A phone that can run this app in the background needs unrestricted outbound connectivity, the same requirement as running Snowflake in a browser tab. That describes a lot of readers in Taiwan and across East and Southeast Asia, but not everyone: if your own network sits behind a national firewall, you may not be able to reach the Snowflake broker reliably in the first place, and running circumvention infrastructure from inside a heavily censored network carries risk that has nothing to do with the app's technical design.

For readers in Hong Kong specifically, the same caveat we've flagged for browser-based Snowflake still applies here: installing this app means your device is relaying Tor traffic on behalf of people in censored regions, and that fact alone could draw scrutiny if your device were ever searched under national-security-related powers. Weigh that before installing.

For everyone else with a spare Android phone and a connection that isn't itself under heavy censorship, this is about as close to zero-effort volunteering gets: install it, flip the toggle, and leave it charging overnight.

## Getting the app

Snowflake Volunteer is on [F-Droid](https://f-droid.org/en/packages/io.bloco.snowflake/){target="_blank"} and [Google Play](https://play.google.com/store/apps/details?id=io.bloco.snowflake){target="_blank"}, and the source is on [GitHub](https://github.com/blocoio/snowflake){target="_blank"} if you'd rather build it yourself or [file an issue](https://github.com/blocoio/snowflake/issues/new){target="_blank"}.

## Related reading

- [Tor Snowflake bridge](../../tools/tor-snowflake.md): how the browser-tab version works, and the Hong Kong risk note
- [After Iran's 80-day blackout, traffic surged through our community's Tor WebTunnel bridge](iran-blackout-webtunnel.md): why we already recommend Snowflake as the low-effort option
- [Set up a Tor relay](https://community.torproject.org/relay/){target="_blank"}: the next step up if you want to commit a server

[^1]: Based on 180 daily Snowflake broker reports covering 1 January through 30 June 2026, aggregated from the `snowflake-stats` descriptors in Tor Metrics' [CollecTor archive](https://metrics.torproject.org/collector/archive/snowflakes/){target="_blank"}.

!!! info "Source"

    Based on the official Tor Project post [Snowflake Volunteer, an Android app to help people bypass censorship](https://blog.torproject.org/snowflake-volunteer-standalone-app-to-help-people-bypass-censorship/){target="_blank"}.
