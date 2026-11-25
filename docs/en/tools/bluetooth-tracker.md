---
title: Detecting and handling Bluetooth trackers
description: When an AirTag or similar Bluetooth tracker is slipped into your bag or car, iPhone and Android can alert you automatically or scan on demand. This page covers which trackers each phone detects, how to find one after an alert, and why safety comes before disabling it.
icon: material/bluetooth
---

# :material-bluetooth: Detecting and handling Bluetooth trackers

Bluetooth trackers such as AirTag, Tile, and Samsung SmartTag are sold for finding keys and luggage. They are about the size of a coin, easy to hide in a bag lining, a coat pocket, or a car, and whoever planted one can follow its location on their own phone without the tracked person ever knowing.

This page is adapted from EFF Surveillance Self-Defense's [How to: Detect Bluetooth Trackers](https://ssd.eff.org/module/how-to-detect-bluetooth-trackers){target="_blank"}, which walks through each step with screenshots. The EFF guide was last reviewed in July 2024, so this page updates the steps against Apple's and Google's 2026 documentation and adds resources for East Asia. What changed is listed under [Sources and review](#Sources-and-review).

!!! warning "If a partner, ex-partner, or family member may have planted it"

    Once a tracker is disabled, the person who planted it will notice the location has stopped updating and may escalate. Before acting, read [leaving is the highest-risk moment](../scenarios/domestic-violence.md) in our domestic-violence guide, or talk to a local hotline about a safety plan.

!!! tip "Short on time? Start here"

    - On iOS 17.5 or later and Android 6.0 or later (with Google Play services), the system alerts you to AirTags and compatible trackers, as long as Bluetooth, location, and notifications are on
    - Alerts only appear after a tracker has moved with you for a while. If you are suspicious right now, run a manual scan
    - Android has a built-in manual scan. iPhone does not, so install AirGuard
    - If you find a tracker, screenshot its serial number and owner details before deciding whether to disable it

## How trackers report location

A tracker has no GPS and no cellular connection. It broadcasts a Bluetooth signal, nearby phones pick it up and report their own approximate location to the manufacturer, and the owner sees that location in an app. Apple's network is Find My, which every iPhone joins by default. Google's is Find Hub, and Samsung and Tile run their own. More participating phones means better accuracy, so in a busy city the location is usually quite precise[^ssd].

An AirTag owner sees only the current location, not a movement history. Tile and Samsung SmartTag may keep a history for the owner. An AirTag can also be shared with other people, who then get no alerts for it[^ssd].

## Automatic alerts

| | iPhone | Android |
|---|---|---|
| Requirements | iOS 14.5+ for AirTag and Find My accessories, iOS 17.5+ for compatible third-party trackers | Android 6.0+, delivered through Google Play services |
| Detects | AirTag, AirPods, Find My accessories, compatible Bluetooth trackers | AirTag, Find Hub-compatible trackers and headphones |
| Needs something else | Samsung SmartTag, Tile | Samsung SmartTag, Tile |

Neither Apple nor Google lists Samsung SmartTag or Tile as compatible[^apple][^google]. Phones sold in mainland China often ship without Google Play services and may not have Android's built-in alerts. In both cases, use AirGuard (see [manual scans](#Manual-scans)). When the shared standard launched in May 2024, EFF found newly supported third-party trackers were not always detected, and still recommends AirGuard alongside the built-in alerts[^ssd].

Neither company publishes how long a tracker must travel with you before an alert appears. In EFF's testing it took up to 24 hours[^ssd]. Borrowed keys or a companion's tracker can also trigger an alert.

=== "iPhone"

    Make sure the following are on[^apple]:

    1. Settings > General > About: iOS 17.5 or later detects third-party trackers
    2. Settings > Privacy & Security > Location Services: on, and under System Services, Significant Locations on
    3. Settings > Bluetooth: on
    4. Settings > Notifications > Tracking Notifications: Allow Notifications on
    5. Airplane Mode off

    Alerts read "AirTag Found Moving With You", "(Product name) Found Moving With You", or "Unknown Accessory Detected". Tapping one opens a map in Find My, where red dots show where your phone detected the item. The dots do not show when the owner looked at its location[^apple]. Tap Continue, then Play Sound, or Find Nearby to use Precision Finding with an AirTag on an Ultra Wideband iPhone. Past alerts are under Find My > Items > Unknown Items Detected with You[^apple].

=== "Android"

    Alerts are on by default. Check under Settings > Safety & emergency > Unknown tracker alerts, where Allow alerts should be on. On Android 11 and earlier, the path is Settings > Google > Personal & device safety > Unknown tracker alerts. Automatic alerts need location turned on[^google].

    Tapping an alert opens a map. Play sound makes the tracker ring without notifying the owner, and Next steps > Find nearby (Find Hub-compatible trackers only) shows how close you are. Each tracker triggers at most one alert per day, and past alerts are deleted after 48 hours[^google].

## Manual scans

Scan away from crowds. In a parking lot or apartment block, other people's trackers will show up, so scan more than once and compare[^ssd].

- **Android**: Settings > Safety & emergency > Unknown tracker alerts > Scan now takes about 10 seconds and lists trackers separated from their owners. On Android 11 and later it works without location turned on[^google]
- **iPhone**: there is no built-in scan. AirGuard, from a research team at TU Darmstadt, detects Samsung SmartTag and Tile on iPhone, and AirTag, SmartTag, and Find Hub trackers on Android, so it covers SmartTag where Android's built-in scan does not list it[^google]. Besides the app stores, the Android version is on F-Droid and GitHub[^airguard]. Its search screen shows signal strength as a percentage, and above about 90% the tracker is very close. EFF found it sometimes slow to flag a tracker, so do not rely on it alone[^ssd]
- **Samsung Galaxy**: the SmartThings app has Unknown tag detection in the SmartThings Find settings[^samsung]

## After you find a tracker

If a partner, ex-partner, or family member may have planted it, think about safety first. Disabling it tells them you found it[^ssd].

- **Keep evidence**: screenshot the alert and map. Hold the top of an iPhone or NFC-capable Android phone to the white side of an AirTag to open a page with its serial number and the last four digits of the registered phone number, which may be a secondary number[^apple][^ssd]. For other brands, follow the on-screen steps to get the device ID[^google]
- **Disabling**: tap Instructions to Disable and follow the steps, usually removing the battery. The owner stops getting updates but may still see the last location[^apple][^google]. Some trackers reset to factory settings when disabled and lose the link to their owner, so police can no longer ask the manufacturer who owns it. If you plan to report it, save the information first[^google]
- **Turning off Bluetooth or location on your phone does not stop the owner** from seeing the tracker, because other phones keep reporting it[^apple][^google]

If you are in immediate danger, go to a busy public place and call the local police. Police can request owner information from Apple and other manufacturers using the serial number or device ID[^apple]. In Taiwan, Article 3 of the [Stalking and Harassment Prevention Act](https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0080211&flno=3){target="_blank"} lists "monitoring, observing, following, or ascertaining a specific person's whereabouts" as stalking when it is repeated, unwanted, related to sex or gender, and causes fear. Whether it applies depends on the case[^stalking]. Hotlines for Taiwan, Hong Kong, Macau, and other places are listed in the [regional context](../scenarios/domestic-violence.md) section of our domestic-violence guide.

## Limits of detection

- Alerts are delayed, and Android sends at most one per tracker per day[^google]
- A tracker's Bluetooth identifier rotates, roughly once a day when it is away from its owner, after which it looks like a new tracker[^google]
- Only brands that follow the Apple–Google standard are detected by the phone itself
- GPS trackers with their own SIM card report over the cellular network, not through nearby phones, so none of the methods here will find them. Check bags and vehicles physically
- Stalkerware and shared-account location sharing are separate channels, covered in the [domestic-violence guide](../scenarios/domestic-violence.md) and step 7 of [phone privacy settings](./phone-privacy-settings.md)

## Sources and review

This page is adapted from [How to: Detect Bluetooth Trackers](https://ssd.eff.org/module/how-to-detect-bluetooth-trackers){target="_blank"} in EFF's [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"}, last reviewed on 2024-07-15 and licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/){target="_blank"}. We added regional resources and made three updates based on the vendors' documentation:

- Android has had built-in unknown tracker alerts since Android 6.0. The original says Android 14 or later
- Since iOS 17.5, iPhone detects compatible third-party trackers. The original's body says automatic alerts cover only AirTags, with a note at the top about the May 2024 cross-platform standard. We describe the system requirements from Apple's documentation and keep EFF's test results for newly supported trackers
- Some trackers reset to factory settings when disabled, so police can no longer look up the owner. The original does not mention this

anoni.net is responsible for any differences from the original, and this page does not represent EFF's views.

Steps were checked in November 2026 against Apple Support's "What to do if you get an alert that an AirTag, AirPods, Find My network accessory, or compatible Bluetooth location-tracking device is with you" (published 2026-09-24), the Android Help page "Find unknown trackers", and Samsung's US support page. If an option is not where this page says, let us know in our [public Matrix room](https://anoni.net/services/){target="_blank"} with your phone model and OS version.

## Where to go from here

- [Domestic violence](../scenarios/domestic-violence.md): shared accounts, stalkerware, and smart-home devices beyond location tracking
- [Phone privacy settings, step by step](./phone-privacy-settings.md): step 7 checks who can see your location
- [What surveillance can do today](../basics/surveillance-capability.md): the limits of platforms, carriers, states, and commercial spyware
- [Building a threat model](../basics/threat-model.md): work out who you are up against before deciding how far to go

[^ssd]: [How to: Detect Bluetooth Trackers](https://ssd.eff.org/module/how-to-detect-bluetooth-trackers){target="_blank"} - EFF Surveillance Self-Defense, last reviewed 2024-07-15.
[^apple]: [What to do if you get an alert that an AirTag, AirPods, Find My network accessory, or compatible Bluetooth location-tracking device is with you](https://support.apple.com/en-us/119874){target="_blank"} - Apple Support, published 2026-09-24.
[^google]: [Find unknown trackers](https://support.google.com/android/answer/13658562?hl=en){target="_blank"} - Android Help.
[^airguard]: [AirGuard](https://github.com/seemoo-lab/AirGuard){target="_blank"} - Secure Mobile Networking Lab, TU Darmstadt, plus the app listings on the App Store, Google Play, and [F-Droid](https://f-droid.org/packages/de.seemoo.at_tracking_detection/){target="_blank"}. The iPhone version was last updated in May 2025, the Android version in September 2026.
[^samsung]: [Use SmartThings Find with the SmartThings app](https://www.samsung.com/us/support/answer/ANS10004549/){target="_blank"} - Samsung US support.
[^stalking]: [Stalking and Harassment Prevention Act, Article 3](https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0080211&flno=3){target="_blank"} - Laws & Regulations Database of Taiwan (Chinese).
