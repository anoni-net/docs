---
title: Phone privacy settings, step by step
description: Work through your phone's privacy settings in numbered steps, with matching paths for iPhone, Android, and Samsung Galaxy. Each step says where the setting is, what it looks like when done, and what it does not block. The core of every step takes about thirty minutes.
icon: material/cellphone-cog
---

# :material-cellphone-cog: Phone privacy settings, step by step

Most phones stay on their factory defaults long after they are unboxed. Apps get your precise location, an advertising identifier lets different apps stitch your activity together, and the name of your personal hotspot shows your real name. None of this requires you to do anything wrong; it stays on simply because nobody went back to change it.

This page puts the settings worth changing into ten steps, with matching paths for iPhone, Android, and Samsung Galaxy. In a workshop you can follow the instructor's step numbers; at home you can work through it on your own. Each step leads with the item that matters most, which takes about thirty minutes in total. Anything marked "later, at home" does not need to be done on the spot.

Why these settings matter, and which ones make the biggest difference, is in [what an ordinary person should actually do](../scenarios/everyday-baseline.md). This page only covers where to tap.

!!! warning "Does a partner or family member look through your phone?"

    Turning off location sharing or removing a device you don't recognize may be noticed by the other person. If that is a concern, do only steps 1 and 3 for now, and read [checking for monitoring without alerting the abuser](../scenarios/domestic-violence.md#Checking-for-monitoring-without-alerting-the-abuser) before deciding on the rest.

## Before you start

Pick your phone type once, and every step on the page switches to the same tab.

=== "iPhone"

    Open **Settings** → **General** → **About** and check the iOS version. The paths on this page follow iOS 26 and iOS 27. On an older version some options sit elsewhere, so do step 1 first and update to the latest release.

    If you can't find an option, type its name into the search field at the top of **Settings**, for example `Location Services`.

=== "Android"

    Open **Settings** → **About phone** → **Android version** and check the dates for **Android version** and **Android security update**. The paths on this page follow Google Pixel phones.

    OPPO, Xiaomi, ASUS, and other brands arrange their menus differently, so every step also gives keywords you can type into the search field at the top of **Settings**. If an option's name differs slightly from this page, look for the one with the same meaning.

=== "Samsung Galaxy"

    Open **Settings** → **About phone** → **Software information** and check the One UI version. The paths on this page follow One UI 8 and later.

    Samsung's menu names vary between versions and regions. If a menu isn't where this page says, tap the magnifying glass at the top of **Settings** and type the keywords given in each step.

Two things to leave alone during a workshop:

- Changing the unlock passcode you already use. A longer one is a good idea, but change it on the spot, forget it that evening, and the phone won't open. Choose one at home, write it down, then change it
- Setting a SIM PIN. It is the optional step at the end of this page, and the reasons are explained there

It helps to open this page on a second phone or a computer, so the phone you are adjusting can stay in **Settings** the whole time.

## The ten steps

| # | Step | Time |
|---|---|---|
| 1 | [System updates](#1-System-updates) | 2 min |
| 2 | [Device name](#2-Device-name) | 2 min |
| 3 | [Lock screen and notification previews](#3-Lock-screen-and-notification-previews) | 2 min |
| 4 | [Location permissions](#4-Location-permissions) | 5 min |
| 5 | [Ad tracking](#5-Ad-tracking) | 2 min |
| 6 | [Camera, microphone, and other permissions](#6-Camera-microphone-and-other-permissions) | 5 min |
| 7 | [Who can see your location](#7-Who-can-see-your-location) | 3 min |
| 8 | [Analytics and diagnostics](#8-Analytics-and-diagnostics) | 1 min |
| 9 | [Account sign-in protection](#9-Account-sign-in-protection) | 4 min |
| 10 | [Loss and theft](#10-Loss-and-theft) | 3 min |

### 1. System updates

Updates patch security vulnerabilities, the flaws in the system that someone could use to break into the phone. Set them to install automatically and you no longer have to remember. In a workshop, just switch automatic updates on. If an update is waiting to download and install, do it at home on a charger and Wi-Fi; the phone restarts and is unusable for a few minutes.

=== "iPhone"

    1. Open **Settings** → **General** → **Software Update** → **Automatic Updates**
    2. Under **iOS Updates**, turn on **Automatically Install**. These are iOS version updates
    3. Under **System Files**, also turn on **Automatically Install**. These update system components
    4. Go back to **Settings** → **Privacy & Security** → **Background Security Improvements** and turn on **Automatically Install**. These are small security fixes Apple ships without waiting for a full release. The option appeared in iOS 26.1, so skip it if you don't see it

    When it's done: both **Automatically Install** switches and **Background Security Improvements** are on.

=== "Android"

    1. Open **Settings** → **System** → **Software updates** (the wording differs on some models) and see whether an update is waiting
    2. Open **Settings** → **About phone** → **Android version** and tap **Google Play system update** to check once. Google ships these system-component updates separately
    3. When an update finishes downloading and asks to restart, restart as soon as you are home; the update only applies after a restart

    When it's done: the **Android security update** date is within the last two or three months.

    On other brands, search for `software update` or `system update`.

=== "Samsung Galaxy"

    1. Open **Settings** → **Software update** and turn on **Auto download over Wi-Fi**. The phone then downloads updates on its own and still asks before installing
    2. On the same screen, tap **Download and install** (some versions word this differently) and see whether an update is waiting
    3. Open **Settings** → **Security and privacy** → **Updates** and check both **Security update** and **Google Play system update**. Google ships Google Play system updates separately

    When it's done: the software update screen says your software is up to date.

Automatic updates do not block a vulnerability that has only just been discovered and that the vendor hasn't patched yet. What each update fixes, and whether it needs installing right away, is tracked in [iOS security updates](../changelog/ios.md) and [Android security patch levels](../changelog/android.md).

### 2. Device name

Many phones are named "Jane Doe's iPhone" or "Jane Doe's Galaxy". That name shows up in Bluetooth pairing, AirDrop, and as the network name of your personal hotspot[^ios-name][^ios-hotspot]. In a café, on the metro, or at a conference venue, anyone nearby who opens their Wi-Fi or Bluetooth list can see it. If your phone's name is already just the model and doesn't include your name, skip this step.

=== "iPhone"

    1. Open **Settings** → **General** → **About** → **Name**
    2. Change it to something without your real name, for example "iPhone" or a word with no connection to you
    3. Open **Settings** → **Wi-Fi**, tap ⓘ next to the network you're on, and check **Private Wi-Fi Address**. **Fixed** or **Rotating** are both fine, as long as it isn't **Off**

    Your personal hotspot uses the device name, so renaming the phone renames the hotspot too. A private Wi-Fi address gives the phone a different identifier on each Wi-Fi network, and while it is on, the network you join can't see the name you gave the phone either[^ios-dhcp].

=== "Android"

    1. Open **Settings** → **About phone** → **Device name** and change it to something without your real name. The Bluetooth and hotspot names change with it[^aosp-name]
    2. Open **Settings** → **Network & internet** → **Internet** and tap the Wi-Fi network you're on
    3. Under **Privacy**, confirm the MAC setting is **Use randomized MAC**, so the phone uses a random identifier on this network
    4. On Android 15 and later the same screen has **Send device name**. Turn it off. While it's on, the phone hands its device name to the network when it connects, and stock Android ships with it on[^aosp-dhcp]

    **Send device name** is a separate switch for each Wi-Fi network, so turn it off once for each network you use regularly, such as home and work.

    On other brands, search for `device name` or `phone name`.

=== "Samsung Galaxy"

    1. Open **Settings** → **About phone** and change the phone name to something without your real name. If you can't find where to edit it, search Settings for `name`
    2. Open Wi-Fi settings and tap the gear icon next to the network you're on. Expand the advanced options, find the MAC address type, and choose the randomized option. The phone then uses a random identifier on this network
    3. If the same screen has an option to send the device name, or something similar, turn it off

    If you can't find these, search for `phone name` and `MAC`.

Renaming the phone does not change its identifiers on the mobile network (the IMEI, which is the handset's serial number, and your phone number). That layer has nothing to do with the name.

### 3. Lock screen and notification previews

While the phone is locked, message contents shouldn't appear on the screen. Verification codes, private messages, and bank notifications often sit right there on the lock screen, readable at a glance by anyone nearby.

If you already have an unlock passcode, don't change it now. If the phone has no lock at all, set a 6-digit PIN you can remember.

=== "iPhone"

    1. Open **Settings** → **Notifications** → **Show Previews** and choose **When Unlocked**
    2. Open **Settings** → **Display & Brightness** → **Auto-Lock** and choose 1 minute. The shorter the time the phone sits unlocked on a table, the less chance someone picks it up and scrolls through it
    3. Open **Settings** → **Face ID & Passcode** (**Touch ID & Passcode** on older models). It asks for your passcode first. If you can get in and see **Change Passcode**, a passcode is set. Don't tap anything else on this screen

    When it's done: lock the phone and ask someone next to you to send you a message. The lock screen shows only the app name, not the content. If an app such as LINE or WhatsApp still shows content, go to **Settings** → **Notifications**, tap that app, and set its own **Show Previews** to **When Unlocked**.

=== "Android"

    1. Open **Settings** → **Notifications** → **Notifications on lock screen** and turn off **Show sensitive content**
    2. Open **Settings** → **Security & privacy** → **Device unlock** → **Screen lock**. The screen shows your current lock method. A PIN, password, or pattern is fine. If there is no lock, or only a swipe, the phone isn't locked

    When it's done: lock the phone and ask someone next to you to send you a message. The lock screen doesn't show the content.

    On other brands, search for `lock screen` or `sensitive content`.

=== "Samsung Galaxy"

    1. Open **Settings** → **Notifications**, tap **Hide content while locked**, and choose **Hide when locked**
    2. Open **Settings** → **Security and privacy** → **Lock screen** → **Screen lock**. The screen shows your current lock method. A PIN, password, or pattern is fine. If there is no lock, or only a swipe, the phone isn't locked

    On versions before One UI 8, if you can't find the first item, search for `notifications` and `hide content`.

    When it's done: lock the phone and ask someone next to you to send you a message. The lock screen doesn't show the content.

Once a lock is set, iPhones and recent Android phones encrypt the data on the device, so if the phone is lost, nobody can read its contents by pulling out the storage. Encryption is no help when you are made to unlock the phone on the spot.

### 4. Location permissions

A week of location history is enough to work out where you live, where you work, and where you go regularly. Most apps only need a rough location, and only while you are using them. Precise location can be accurate to within a few meters, while approximate location only shows which area you are in; Google describes it as an area of about 3 square kilometers[^google-location]. Weather, news, and shopping apps manage fine with approximate location.

If you have a lot of apps, deal only with the ones set to **Always** or **Allowed all the time** for now, and go through the rest at home.

=== "iPhone"

    1. Open **Settings** → **Privacy & Security** → **Location Services**. Each app's permission is listed to the right of its name
    2. Tap each app marked **Always** and change it to **While Using the App** (location only while the app is open) or **Ask Next Time Or When I Share** (it asks you every time). For apps that never need your location, choose **Never**
    3. On the same screen, turn off **Precise Location** for every app other than maps, ride-hailing, and food delivery
    4. Later, at home: scroll to the bottom of the list, tap **System Services**, and turn off **Significant Locations & Routes**. The iPhone uses it to remember places you go often and to make suggestions in Maps and Calendar; turning it off means fewer of those suggestions

    When it's done: in the Location Services list, only apps that truly need it are marked **Always**.

=== "Android"

    1. Open **Settings** → **Location** → **App location permissions**. The list is grouped into **Allowed all the time**, **Allowed only while in use**, **Ask every time or allow when I share**, and **Not allowed**
    2. Tap each app under **Allowed all the time** and change it to **Allowed only while in use** or **Ask every time or allow when I share**. For apps that never need your location, choose **Not allowed**
    3. On the same screen, turn off **Use precise location** for every app other than maps, ride-hailing, and food delivery
    4. Later, at home: open Google Maps and tap your profile picture in the top-right corner → **Your Timeline** → **More** → **Location & privacy settings**. If you don't use Timeline, tap **Timeline is on** to turn it off. Timeline keeps a record on the phone of every place you've been[^google-timeline]

    When it's done: only apps that truly need it are left under **Allowed all the time**.

    On other brands, search for `location`, then look for the app permissions list inside it.

=== "Samsung Galaxy"

    1. Search Settings for `location` and open the app permissions list. Apps are grouped by permission
    2. Tap each app under **Allowed all the time** and change it to allow only while in use, or to ask every time. For apps that never need your location, choose **Not allowed**
    3. On the same screen there is a switch for precise location; turn it off for every app other than maps, ride-hailing, and food delivery
    4. Later, at home: open Google Maps and tap your profile picture in the top-right corner → **Your Timeline** → **More** → **Location & privacy settings**. If you don't use Timeline, tap **Timeline is on** to turn it off. Timeline keeps a record on the phone of every place you've been[^google-timeline]

    Option names vary slightly between versions; the meaning is what matters.

    When it's done: only apps that truly need it are left under **Allowed all the time**.

This step controls the location that apps and advertisers get. Your carrier knows which area you're in from the cell towers, which is a separate channel; what that record can and cannot reveal is covered under [telecom carriers in what surveillance can actually do](../basics/surveillance-capability.md#Telecom-carriers).

### 5. Ad tracking

The advertising identifier (on Android, the advertising ID) is a number on the phone set aside for advertisers. When different apps report back with the same number, advertisers and data brokers can join your behavior across those apps into one profile. Delete or disable it and your apps keep working; they just can't use that number to link you up any more.

=== "iPhone"

    1. Open **Settings** → **Privacy & Security** → **Tracking** and turn off **Allow Apps to Request to Track**. This switch controls the iPhone's advertising identifier. With it off, apps no longer show the "allow tracking" prompt and are treated as not allowed[^ios-att]
    2. Back in **Privacy & Security**, tap **Apple Advertising** and turn off **Personalized Ads**

    You won't see fewer ads; they just stop being chosen based on your data[^ios-ads].

=== "Android"

    1. Open **Settings** → **Google** → **All services**, and under **Privacy & security** tap **Ads**
    2. Tap **Delete advertising ID** and confirm. Afterwards, apps reading the advertising ID get a string of zeros[^google-adid]
    3. Later, at home: in a browser, open **My Ad Center** (myadcenter.google.com) and turn off **Personalized ads**

    You won't see fewer ads; they just stop being chosen based on your data.

    On other brands, search for `ads`.

=== "Samsung Galaxy"

    1. Open **Settings** → **Security and privacy** → **More privacy settings**, and in the Google section tap **Ads**. If you can't find it, search for `ads`
    2. Tap **Delete advertising ID** and confirm. Afterwards, apps reading the advertising ID get a string of zeros[^google-adid]
    3. Later, at home: in a browser, open **My Ad Center** (myadcenter.google.com) and turn off **Personalized ads**

    You won't see fewer ads; they just stop being chosen based on your data.

What a platform records about you inside its own app, and matching on your email address and phone number, are beyond this step. The mechanics are in [how platforms collect your data](../basics/platform-tracking.md).

### 6. Camera, microphone, and other permissions

Most people forget about the permissions they granted at install time. The test is whether the app's features actually need them: LINE needs the camera and microphone for video calls, while a flashlight app has no use for your contacts. Switching off the wrong one does no harm; the app asks again next time it needs it, and you can allow it then.

If you have a lot of apps, check Contacts and Microphone first and leave the rest for home.

=== "iPhone"

    1. Open **Settings** → **Privacy & Security**
    2. Tap **Contacts**, **Microphone**, **Camera**, and **Photos** in turn, and switch off the apps that don't need them
    3. For apps listed under **Contacts**, you can tap in and choose **Limited Access**, which shares only the contacts you pick
    4. Later, at home: look through **Bluetooth** and **Local Network** too (Local Network lets apps find devices such as your TV or speakers at home). Leave Bluetooth on for the apps of your earbuds and watch
    5. Later, at home: back in **Privacy & Security**, tap **App Privacy Report** and choose **Turn On App Privacy Report**. It records which permissions each app used and which websites it contacted; come back and look after a week or two

=== "Android"

    1. Open **Settings** → **Security & privacy** → **Privacy** → **Permission manager**
    2. Go through the contacts, microphone, camera, and photos permissions in turn, and set apps that don't need them to **Not allowed**
    3. Later, at home: look through the nearby devices permission too (it lets apps find Bluetooth earbuds, watches, and similar devices). Leave it on for the apps of your earbuds and watch
    4. Later, at home: back in **Privacy**, tap **Privacy dashboard** to see which apps recently used your location, camera, and microphone
    5. Later, at home: open the apps list in Settings, tap into apps you haven't used for a long time, and turn on **Pause app activity if unused**. The system then takes back their permissions after a while

    On other brands, search for `permission manager`.

=== "Samsung Galaxy"

    1. Open **Settings** → **Security and privacy** → **Privacy** → **Permission manager**. If you can't find it, search for `permission manager`
    2. Go through the contacts, microphone, camera, and photos permissions in turn, and set apps that don't need them to **Not allowed**
    3. Later, at home: look through the nearby devices permission too (it lets apps find Bluetooth earbuds, watches, and similar devices). Leave it on for the apps of your earbuds and watch

    Permission names vary slightly between versions; the meaning is what matters.

Contacts deserve special care. Letting an app upload your address book hands over the details of everyone in it, none of whom agreed to that.

### 7. Who can see your location

Location sharing is often switched on once and forgotten. Family sharing, a friend during a night out, an ex from before you changed phones: any of these may still be running.

When you stop sharing, the other person can no longer see your location on their screen and may notice. If that is a concern, just look at the list for now without tapping stop, and go back to the warning at the top of this page.

=== "iPhone"

    1. Open the **Find My** app, tap **Me**, and check whether **Share My Location** is on
    2. Tap **People** and see who is listed. For anyone you no longer need to share with, tap their name and choose **Stop Sharing My Location**
    3. If you use Family Sharing, open **Settings** → **Family** → **Location Sharing** and check each member. If you don't use Family Sharing, this screen won't exist; skip it
    4. Later, at home: **Settings** → **Privacy & Security** → **Safety Check** lets you review all sharing and access in one pass. It requires the two-factor authentication from step 9. Tap **Manage Sharing & Access** and follow the screens. The **Quick Exit** button in the top-right corner closes it immediately[^ios-safety]

=== "Android"

    1. Open **Settings** → **Location** → **Location services** → **Google Location Sharing**
    2. See who is listed. For anyone you no longer need to share with, tap **Stop** next to their name

    On other brands, search for `location sharing`.

=== "Samsung Galaxy"

    1. Search Settings for `location sharing` and open **Google Location Sharing**
    2. See who is listed. For anyone you no longer need to share with, tap **Stop** next to their name
    3. If you share your location with family through Samsung Find (Samsung's find-my-phone service, formerly SmartThings Find), open Samsung Find and check who you share with there too

### 8. Analytics and diagnostics

By default the phone sends usage data and crash logs back to the manufacturer to improve its products. Turning this off doesn't affect any feature, and every report not sent is data that never leaves the phone. This step has the smallest effect, so skip it if time is short.

=== "iPhone"

    1. Open **Settings** → **Privacy & Security** → **Analytics & Improvements**
    2. Turn off **Share iPhone Analytics**; you can turn off the other switches on the same screen that start with "Share" as well

=== "Android"

    1. Open **Settings** → **Google**, tap the **More** icon in the top-right corner → **Usage & diagnostics**
    2. Turn it off

    On other brands, search for `diagnostics`.

=== "Samsung Galaxy"

    1. Open **Settings** → **Security and privacy** → **More privacy settings**
    2. In the Google section, turn off **Usage & diagnostics**
    3. In the Samsung section, turn off **Send diagnostic data** and any similar switch

    If you can't find these, search for `diagnostics`.

### 9. Account sign-in protection

The Apple, Google, or Samsung account on your phone is tied to your backups, photos, location, and every device you own. Someone signing into that account can do more damage than someone stealing the phone. Two-step verification (Apple calls it two-factor authentication) means that signing in takes a confirmation on your phone in addition to the password.

In a workshop, just check the status. If it's off, turn it on at home, after making sure the phone number on the account is correct and can receive codes, so you don't lock yourself out.

=== "iPhone"

    1. Open **Settings**, tap your name at the top → **Sign-In & Security**, and check that **Two-Factor Authentication** shows as on
    2. Back on your name's screen, scroll to the device list at the bottom. Old phones and tablets appear here too. Only for a device you're sure you no longer use, or don't recognize at all, tap in and choose **Remove from Account**

=== "Android"

    1. Open **Settings** → **Google** and go to your Google Account, then **Security & sign-in**, and check that **2-Step Verification** is on
    2. On the same screen, under **Your devices**, tap **Manage all devices**. Old phones and tablets appear here too. Only for a device you're sure you no longer use, or don't recognize at all, tap in and sign it out

    You can do the same check in a browser at myaccount.google.com.

=== "Samsung Galaxy"

    1. Samsung account: open **Settings**, tap your account name at the top → **Security and privacy**, and check that **Two-step verification** is on. If you aren't signed into a Samsung account, skip this item
    2. Google account: search Settings for `Google`, go to your Google Account, then **Security & sign-in**, and check that **2-Step Verification** is on
    3. On the same screen, under **Your devices**, tap **Manage all devices**. Old phones and tablets appear here too. Only for a device you're sure you no longer use, or don't recognize at all, tap in and sign it out

For accounts that still receive verification codes by SMS, switch to an authenticator app or a passkey where you can. The difference is covered in [what is a passkey?](./what-is-passkey.md) and [getting started with password managers](./password-manager.md). The signed-in devices list in LINE and other messaging apps deserves the same look; it is part of the yearly review in [my preparation checklist](../utils/checklist.md).

### 10. Loss and theft

Phones are often snatched while unlocked. This step makes it hard for whoever takes the phone to change your account password or reset the device, and makes sure you can locate or remotely lock it.

Keep find-my-phone on; it lets you locate, lock, or erase a lost phone. Anyone who knows your account password can also see where the phone is, which is what the two-step verification in step 9 protects against.

=== "iPhone"

    1. Open **Settings** → **Face ID & Passcode** → **Stolen Device Protection**, turn it on, and choose **Away from Familiar Locations**
    2. Open **Settings**, tap your name → **Find My** → **Find My iPhone**, and confirm it's on

    With Stolen Device Protection on, sensitive actions such as changing your passcode require Face ID or Touch ID whenever the phone is away from familiar locations like home or work, and some of them also involve a one-hour delay[^ios-sdp]. Nothing changes when you're at home. Without Face ID or Touch ID set up, the option doesn't appear; skip it.

=== "Android"

    1. Open **Settings** → **Google** → **All services** → **Theft protection** (on some phones it sits under **Security & privacy**)
    2. Turn on **Theft Detection Lock**, which locks the screen if the phone looks like it has been snatched from your hand and carried off quickly
    3. Turn on **Offline Device Lock**, which locks the phone if it is cut off from the network for a while when unlocked
    4. On models that have it, also turn on **Identity Check**, so sensitive actions outside trusted places accept only a fingerprint or face unlock
    5. Search for `Find Hub` and confirm **Allow device to be located** is on

    If the phone locks by mistake, unlock it the usual way[^google-theft].

    On other brands, search for `theft` and `find`.

=== "Samsung Galaxy"

    1. Open **Settings** → **Security and privacy** → **Lost device protection** → **Theft protection**
    2. Turn on **Theft detection lock**, which locks the screen if the phone looks like it has been snatched from your hand and carried off quickly
    3. Turn on **Offline device lock**, which locks the phone if it is cut off from the network for a while when unlocked
    4. Turn on **Identity check**. Outside the safe places you set (such as home), sensitive actions like turning off find-my-phone need a fingerprint or face unlock, and some also involve a one-hour delay[^samsung-theft]
    5. Back in **Lost device protection**, confirm **Allow this phone to be found** is on

    If the phone locks by mistake, unlock it the usual way.

## SIM PIN (optional)

If someone pulls out your SIM card and puts it in another phone, they receive the verification codes texted to you. With a SIM PIN set, the PIN has to be entered every time the phone starts or the SIM is moved to a different phone.

Have two numbers ready before you start. The PIN unlocks the SIM card; enter it wrong three times in a row and the SIM is locked, and only the PUK (a second code used to unlock it) can open it again[^samsung-puk]. Enter the PUK wrong too many times and the SIM is permanently disabled, and you need a new card[^ios-simpin]. Your carrier can tell you both numbers. Some carriers use a default PIN that is public, so change it to your own while you're setting this up[^google-theft].

=== "iPhone"

    Open **Settings** → **Cellular** → **SIM PIN**, turn it on, and enter the current PIN. On a dual-SIM phone, tap the line you want to protect first, then **SIM PIN**.

=== "Android"

    Open **Settings** → **Security & privacy** → **More security settings** → **SIM lock**, turn on **Lock SIM**, and enter the current PIN.

    On other brands, search for `SIM`.

=== "Samsung Galaxy"

    Search Settings for `SIM lock`, turn the lock on, and enter the current PIN.

## After the ten steps

With all ten steps done, most of the data flows a phone ships with turned on are now closed. From here, three directions:

- Come back once a year. Permissions, location sharing, and signed-in devices creep back over time, and the yearly review in [my preparation checklist](../utils/checklist.md) covers them
- Traveling abroad: what your home number, a travel eSIM, and hotel Wi-Fi each expose is in [phone numbers and connectivity abroad](../scenarios/travel-connectivity.md)
- If your risk is higher than most people's, for example as a journalist or advocate who might be targeted with spyware, the iPhone's Lockdown Mode and Android's Advanced Protection switch off some features in exchange for a smaller attack surface. Most people don't need them. Work out whether you do with [threat modeling](../basics/threat-model.md) first

Lockdown Mode is under **Settings** → **Privacy & Security** → **Lockdown Mode** on the iPhone; once it is on, apps, websites, and some features are strictly limited[^ios-lockdown]. Advanced Protection is on Android 16 and later under **Settings** → **Security & privacy** → **Other settings** → **Advanced Protection**, where you turn on **Device protection**. A screen lock has to be set first[^google-ap].

## Versions and sources checked

Phone systems change every year, and setting names and locations move with them. This page follows each manufacturer's official documentation, and the paths in the tabs are based on these versions:

- iPhone: iOS 26 and iOS 27, from Apple's iPhone User Guide and support articles, checked October 2026
- Android: Android 16 and Android 17 on Google Pixel, from Google's Android Help, Pixel Help, and the Android Open Source Project, checked October 2026
- Samsung Galaxy: One UI 8 and later, from Samsung's official support pages, checked October 2026. Where a menu name couldn't be confirmed in official documentation, the step relies on search keywords

If you follow along and can't find an option, search for its name in Settings first. If it still isn't there, tell us your phone model and system version in the community chat (the [public Matrix room](../community/tools.md)), and we'll check and update the page.

## Where to go from here

- [What an ordinary person should actually do](../scenarios/everyday-baseline.md) — why each step on this page matters, and what tier two and tier three add
- [How platforms collect your data](../basics/platform-tracking.md) — what platforms collect beyond the advertising identifier and permissions
- [Phone numbers and connectivity abroad](../scenarios/travel-connectivity.md) — roaming, travel eSIMs, local SIM cards, and hotel networks
- [My preparation checklist](../utils/checklist.md) — tick off what you've done and compare a year later

[^ios-name]: [Change the name of your iPhone](https://support.apple.com/guide/iphone/iphf256af64f/ios){target="_blank"} - iPhone User Guide. The name is used by iCloud, AirDrop, Bluetooth, Personal Hotspot, and your computer.
[^ios-hotspot]: [Share your internet connection from your iPhone](https://support.apple.com/guide/iphone/iph45447ca6/ios){target="_blank"} - iPhone User Guide. The Personal Hotspot name is the same as the device name.
[^ios-dhcp]: [About private Wi-Fi addresses and enterprise networks](https://support.apple.com/en-us/102076){target="_blank"} - Apple Support. When a private Wi-Fi address is used, the device uses a generic hostname in DHCP requests.
[^ios-att]: [Control app tracking permissions on iPhone](https://support.apple.com/guide/iphone/iph4f4cbd242/ios){target="_blank"} - iPhone User Guide.
[^ios-ads]: [Control how Apple delivers advertising to you on iPhone](https://support.apple.com/guide/iphone/iphf60a6a256/ios){target="_blank"} - iPhone User Guide.
[^ios-safety]: [Safety Check for an iPhone with iOS 16 or later](https://support.apple.com/guide/personal-safety/ips2aad835e1/web){target="_blank"} - Apple Personal Safety User Guide.
[^ios-sdp]: [Use Stolen Device Protection on iPhone](https://support.apple.com/guide/iphone/iph17105538b/ios){target="_blank"} - iPhone User Guide.
[^ios-simpin]: [Use a SIM PIN for your iPhone or iPad](https://support.apple.com/en-us/118228){target="_blank"} - Apple Support.
[^ios-lockdown]: [Harden your iPhone from a cyberattack with Lockdown Mode](https://support.apple.com/guide/iphone/iph845f6f40c/ios){target="_blank"} - iPhone User Guide.
[^aosp-name]: [DeviceNamePreferenceController.java](https://android.googlesource.com/platform/packages/apps/Settings/+/refs/heads/main/src/com/android/settings/deviceinfo/DeviceNamePreferenceController.java){target="_blank"} - Android Open Source Project. Renaming the device also sets the Bluetooth name and the hotspot name.
[^aosp-dhcp]: [WifiConfiguration.java](https://android.googlesource.com/platform/packages/modules/Wifi/+/refs/heads/main/framework/java/android/net/wifi/WifiConfiguration.java){target="_blank"} - Android Open Source Project; `mIsSendDhcpHostnameEnabled` defaults to `true`. Phone manufacturers can change the default.
[^google-location]: [Manage location permissions for apps](https://support.google.com/android/answer/6179507?hl=en){target="_blank"} - Android Help.
[^google-timeline]: [Manage your Google Maps Timeline](https://support.google.com/maps/answer/6258979?hl=en&co=GENIE.Platform%3DAndroid){target="_blank"} - Google Maps Help.
[^google-adid]: [Advertising ID](https://support.google.com/googleplay/android-developer/answer/6048248?hl=en){target="_blank"} - Play Console Help.
[^google-theft]: [Protect your personal data against theft](https://support.google.com/android/answer/15146908?hl=en){target="_blank"} - Android Help.
[^google-ap]: [Improve device security with Advanced Protection for Android](https://support.google.com/android/answer/16339980?hl=en){target="_blank"} - Android Help.
[^samsung-theft]: [How to use security settings on your phone](https://www.samsung.com/uk/support/mobile-devices/how-to-use-security-settings/){target="_blank"} - Samsung UK support.
[^samsung-puk]: [What is a PUK code?](https://www.samsung.com/africa_en/support/mobile-devices/what-is-a-puk-code/){target="_blank"} - Samsung Africa support.
