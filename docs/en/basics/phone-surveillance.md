---
title: How phones are tracked and monitored
description: A phone that is switched on keeps broadcasting signals that cell towers, fake base stations, Wi-Fi and Bluetooth, apps, and advertising IDs can all use to locate you. This page covers what each method can do and what you can do, plus sensors, biometrics, burner phones, and seized phones.
icon: material/cellphone-marker
---

# :material-cellphone-marker: How phones are tracked and monitored

A phone keeps announcing where you are through the signals it sends, and that is one of its deepest and least visible privacy risks. Beyond the location you share on purpose, there are at least four ways to track a phone: cell towers, fake base stations, Wi-Fi and Bluetooth, and location leaks from apps and websites[^ssd-loc].

This page combines and adapts the five-part mobile phone series in EFF's Surveillance Self-Defense (listed under [Sources and review](#Sources-and-review)), and adds context from Taiwan. For who can do what at what cost, see [what surveillance can actually do](./surveillance-capability.md). For the settings to change, see [phone privacy settings, step by step](../tools/phone-privacy-settings.md).

!!! tip "Short on time? Start here"

    - While your phone is on with a SIM card, the carrier knows roughly where you are. Not carrying the phone is the only way around it
    - Revoke location access wherever you can, prefer approximate location, and turn off the advertising ID
    - Where 2G has been shut down, as in Taiwan, a 2G signal on your phone likely means a fake base station
    - Ordinary calls and SMS are not secure. Use end-to-end encrypted apps for anything sensitive

## Cell towers

Carriers can calculate a phone's location from the signal its towers receive, to within about a kilometer with three towers, and newer networks can report GPS coordinates. Governments can demand real-time or historical location records, or a "tower dump" listing every phone at a place and time, such as a protest. Because this happens on the carrier's side, the only defense is leaving the phone behind[^ssd-loc].

## Fake base stations

Cell-site simulators (IMSI catchers, or Stingrays) are portable fake towers that make nearby phones connect to them, often by exploiting weaknesses in 2G[^ssd-loc]. Scam rings use them in Taiwan too: in 2024 police arrested people driving around with a transmitter that sent phishing texts spoofing the government's "111" short code, and the National Communications Commission reminded the public that Taiwan has shut down 2G, so a 2G signal is abnormal[^cna]. Supported Android phones can disable 2G, so they no longer scan for or connect to 2G networks except for emergency calls, and Android's documentation notes this still matters where carriers have dropped 2G. The switch is usually in the SIM or mobile network settings[^aosp-2g]. On iPhone, Lockdown Mode disables 2G along with many other features. End-to-end encrypted messaging keeps content safe even through a fake tower[^ssd-loc].

## Wi-Fi and Bluetooth

Both broadcast hardware (MAC) addresses that nearby receivers can see. Modern iOS and Android randomize the address used when scanning, but phones often keep a stable address with networks they join, so a network operator can recognize a returning device. iOS 18 and later rotate it roughly every two weeks, and Android offers randomized MACs per network. If this worries you, turn Wi-Fi and Bluetooth off temporarily[^ssd-loc]. Trackers planted on you are a separate problem, covered in [detecting and handling Bluetooth trackers](../tools/bluetooth-tracker.md).

## Apps, ads, and web browsing

Apps with location access may send it to their servers and partners, and location history can reveal beliefs, relationships, meetings, and journalists' sources. In the US, law enforcement has bought such data without a warrant. Revoke location access you are unsure about and prefer approximate location[^ssd-loc]. Advertising SDKs share app activity through real-time bidding, and the mobile advertising ID stitches it together across apps. iPhone apps must ask before reading it, while on Android every app can read it by default but you can delete it[^ssd-loc]. See steps 4 and 5 of [phone privacy settings](../tools/phone-privacy-settings.md).

## Calls and texts

Treat ordinary calls and SMS as unprotected against interception: encryption on mobile networks is uneven and sometimes absent. Use end-to-end encrypted apps such as Signal, WhatsApp, or iMessage between Apple devices[^ssd-spy]. See [Signal settings and group management](../tools/signal-guide.md).

## Sensors and biometrics

GPS satellites only transmit, so "GPS tracking" is apps reading your location and sending it on. NFC works within about four centimeters but can leave records of payments and building entry. Accelerometers and gyroscopes have been shown in research to infer keystrokes or pick up sound, though real-world risk is low[^ssd-sensors].

Fingerprint and face data stay encrypted in isolated hardware on the phone and do not reach Apple or Google. What biometrics cannot protect against is being pressured to unlock, by police or border agents, so use a PIN alone when that is a concern. Selfie checks for digital ID or age verification are a different system entirely[^ssd-bio]. See [device minimization and border crossings in Asia](../scenarios/asia-travel.md).

## Malware, burners, and seized phones

Phone malware can read messages, turn on the microphone or camera, and read Signal or WhatsApp messages as they are displayed. Lockdown Mode and Google's Advanced Protection Program raise the bar, and a Faraday bag blocks every signal even from a compromised phone[^ssd-other]. See [preventing and handling malware](../tools/malware.md).

Burner phones are hard to use well: carriers see which SIM was in which handset (eSIMs too), devices that travel together can be linked, and calling the same people from a new number gives it away. At minimum, never reuse SIMs or handsets, never carry devices together or use them in the same places, and never call the same contacts[^ssd-other]. In Taiwan, prepaid SIM cards also require real-name registration.

Forensic tools can extract call logs, photos, location history, and messages from encrypted apps on a seized phone, sometimes including deleted texts. Remote wiping helps if a phone is lost or stolen, but wiping a phone after police seize it can be charged as destroying evidence in some jurisdictions[^ssd-other]. Talk to a lawyer first.

## Sources and review

Adapted from five guides in EFF's [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"}, all licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/){target="_blank"}: [Mobile Phones: Location Tracking](https://ssd.eff.org/module/mobile-phones-location-tracking){target="_blank"}, [Spying on Mobile Communications](https://ssd.eff.org/module/mobile-phones-spying-mobile-communications){target="_blank"}, [Phone Components and Sensors](https://ssd.eff.org/module/mobile-phones-phone-components-and-sensors){target="_blank"}, and [Other Surveillance Techniques](https://ssd.eff.org/module/mobile-phones-malware){target="_blank"} (all last reviewed 2024-11-05), and [Device-Bound Biometrics](https://ssd.eff.org/module/mobile-phones-device-bound-biometrics){target="_blank"} (last reviewed 2026-10-28). We added Taiwan's fake base station case and the Android documentation on disabling 2G, and summarized US court cases and program names. anoni.net is responsible for any differences from the original, and this page does not represent EFF's views.

## Where to go from here

- [What surveillance can actually do](./surveillance-capability.md): the limits of platforms, carriers, states, and commercial spyware
- [Phone privacy settings, step by step](../tools/phone-privacy-settings.md): location, ad tracking, and theft protection
- [Metadata, and why it matters](./metadata.md): why records of contact say more than content

[^ssd-loc]: [Mobile Phones: Location Tracking](https://ssd.eff.org/module/mobile-phones-location-tracking){target="_blank"} - EFF Surveillance Self-Defense, last reviewed 2024-11-05.
[^ssd-spy]: [Mobile Phones: Spying on Mobile Communications](https://ssd.eff.org/module/mobile-phones-spying-mobile-communications){target="_blank"} - EFF Surveillance Self-Defense, last reviewed 2024-11-05.
[^ssd-sensors]: [Mobile Phones: Phone Components and Sensors](https://ssd.eff.org/module/mobile-phones-phone-components-and-sensors){target="_blank"} - EFF Surveillance Self-Defense, last reviewed 2024-11-05.
[^ssd-bio]: [Mobile Phones: Device-Bound Biometrics](https://ssd.eff.org/module/mobile-phones-device-bound-biometrics){target="_blank"} - EFF Surveillance Self-Defense, last reviewed 2026-10-28.
[^ssd-other]: [Mobile Phones: Other Surveillance Techniques](https://ssd.eff.org/module/mobile-phones-malware){target="_blank"} - EFF Surveillance Self-Defense, last reviewed 2024-11-05.
[^cna]: [刑事局破首宗假冒「111」政府簡訊騙個資 逮2嫌](https://www.cna.com.tw/news/asoc/202411220166.aspx){target="_blank"} - Central News Agency (Chinese), 2024-11-22.
[^aosp-2g]: [Disable 2G](https://source.android.com/docs/security/features/cellular-security/disable-2g){target="_blank"} - Android Open Source Project.
