---
title: Phone numbers and connectivity abroad
description: Roaming on your home number, a travel eSIM, or a local SIM card abroad — who registers your identity, which country your traffic exits from, what the local network can see, and how to choose. Plus the two lines on a dual-SIM phone, what hotel Wi-Fi exposes, and what a travel router does and does not block.
icon: material/sim-outline
---

# :material-sim-outline: Phone numbers and connectivity abroad

Most people pick a SIM for a trip on price and signal. The same choice also decides who registers your identity, which country your internet traffic leaves from, and whether the destination's website filtering and record-keeping rules reach you. At the hotel or the conference venue, Wi-Fi is a further layer, and every device you bring leaves its name on that network.

This page covers both layers from the technical side and applies to any destination. Real-name SIM rules and border device searches in Asia are covered jurisdiction by jurisdiction in [device minimization and border crossings in Asia](./asia-travel.md); for a destination that page doesn't cover, [pre-departure briefing prompts](./travel-ai-briefing.md) help you build your own overview.

!!! tip "Three things to do before you leave"

    1. Decide which kind of number to use for this trip, using [how to choose](#How-to-choose) below
    2. Rename your phone and laptop so the names don't include your real name, as described under [device names](#Device-names)
    3. Move whatever two-step verification you can from SMS to an authenticator app or a passkey, as described under [the two lines on a dual-SIM phone](#The-two-lines-on-a-dual-SIM-phone)

    Once you arrive, turn off Wi-Fi and check which country your connection exits from, as described under [checking your exit point on arrival](#Checking-your-exit-point-on-arrival).

## Three terms first

- **Exit point**: the carrier and country where your traffic finally connects to the internet. Websites see the IP address at that end, so wherever your exit point is, that is where websites think you are, and that country's filtering and record-keeping rules reach this traffic
- **IMSI**: an identifier stored on the SIM card that the mobile network uses to recognize which subscriber this is. It is a different number from your phone number, but both point to the same person
- **IMEI**: the hardware identifier of the handset itself, one per phone. Changing the SIM card does not change it

## Three kinds of number, and how their traffic travels

### Roaming on your home number

The main way data roaming works is home routing: your traffic travels over a private network between carriers back to your home carrier, and connects to the internet from your home country[^rfc7445]. The exit point is at home, websites see you as being at home, the destination's website filtering mostly can't reach you, and the detour makes it a little slower. Most carriers do not publish where roaming data exits, so checking it yourself once you arrive is the most reliable way to know.

An exit point at home does not make you invisible locally. Your phone still connects to the local carrier's cell towers, so the local carrier knows your IMSI, your IMEI, and which tower you are near[^3gpp-attach]. Ordinary calls and SMS pass through the local network. International mobile standards require the local carrier to be able to intercept inbound roamers: when a roamer under interception enters or leaves the local network, law enforcement must be notified, and the carrier must be able to provide location without the home carrier's help[^3gpp-li]. Whether that capability is used, and on whom, depends on each country's laws and procedures.

Calls and messages in apps such as Signal and LINE travel over the internet with their content encrypted. The local network can see that you are online and how much data you use, but not the content.

### Travel eSIMs

Most travel eSIMs are roaming too, except that the "home network" is whichever carrier the seller partners with, which may be in a third country, and that is where your exit point ends up. Holafly's own documentation says some of its partners assign IP addresses from their own infrastructure, regardless of where you physically are[^holafly].

A research team at Northeastern University measured a set of travel eSIMs in the United States and published the results at USENIX Security 2025[^esim-paper]. Almost none exited where the user was; most exited in a third country. At the time of measurement, Holafly (headquartered in Ireland) and CMLink (part of China Mobile) both exited through China Mobile International's network, routed via Hong Kong. The carrier at the exit point is the one that puts your traffic onto the internet, so where you connect and when all pass through it. That was one location over one period, and sellers change partners, so the results cannot be applied directly to today.

The same study also recorded what sellers get. Most websites and apps that sell eSIMs are resellers, buying wholesale from carriers and reselling. The researchers became a reseller with nothing more than an email address and a payment method, and the platform then provided the IMSI and phone number of every active eSIM; one platform also provided each device's approximate location, in tests sometimes within 0.5 miles (about 800 meters). Resellers can also send SMS messages to users.

A travel eSIM spares you local real-name registration, and in exchange you get a path you can't see clearly. A few things help:

- Before buying, check whether the seller's information pages name their partner carrier or exit country. If they don't, check the exit point yourself once you arrive
- The email address and payment method on the account are what tie the eSIM to you. If that matters to you, use an email address not linked to your main identity
- Get the installation QR code only from the seller's official channel. Now and then, look at the cellular or SIM list in your phone's settings for any eSIM you didn't install
- Many eSIMs can only be installed once and can't be reinstalled after deletion, so don't delete one before the trip is over

Real-name requirements are starting to reach eSIMs too. Japan has amended its law to bring data-only SIMs and eSIMs under identity verification, so check the destination's current rules before you go.

### Local SIM cards

A local SIM card's traffic exits straight from the local carrier, so the exit point is local. Local website filtering, record retention, and law-enforcement requests apply to you exactly as they do to residents. Getting the card usually means real-name registration with your passport, and in some places a face scan as well, which puts your passport and the number together into the local carrier's and the government's databases.

### The three side by side

| | Home number roaming | Travel eSIM | Local SIM card |
|---|---|---|---|
| Who registers your identity | Your home carrier | The eSIM seller (email and payment) | The local carrier, usually with your passport |
| Exit point | Usually your home country | Often a third country, rarely disclosed by the seller | Local |
| Local website filtering | Mostly doesn't reach you | Depends on where the exit point is | Fully applies |
| What the local mobile network sees | IMSI, IMEI, location, ordinary calls and SMS | Same | Same, plus all your browsing records |
| Carriers handling your traffic | Your home carrier and the local carrier | Seller, partner carrier, and local carrier, possibly across three countries | The local carrier |
| Cost and convenience | Most expensive, no SIM swap, your home number keeps receiving SMS | Cheap, installed on the phone before departure | Cheap, gives you a local number, bought at a store or counter |

The local mobile network row is the same for all three. As long as the phone connects to local towers, its location and IMEI are in the local carrier's hands, whichever kind of number you choose. The only way to keep the local towers from seeing the phone at all is airplane mode, at the cost of not receiving calls or SMS.

## How to choose

Choose by what this trip needs most:

- You must receive SMS codes on your home number, for example from your bank, or the trip is only two or three days and you don't want to think about it: roam on your home number
- You mainly need data and want to control the cost: a travel eSIM. Whether to keep your home number on at the same time is covered in the next section
- You need a local number for ride-hailing, restaurant bookings, or for organizers to reach you: a local SIM card, accepting passport registration as the price
- Your destination is one where [device minimization and border crossings in Asia](./asia-travel.md) describes broad search or decryption powers: start with the preparation on that page; the choice of number is only one part of it

A common combination is a travel eSIM for data with your home number left on for SMS. It covers both needs, at the cost of your home number also connecting to the local network, which may incur separate roaming charges.

## The two lines on a dual-SIM phone

When you use a travel eSIM for data and leave your home number on, both lines connect to the local network and both can receive calls and SMS[^apple-esim-travel]. Turn the home number off and you stop receiving SMS verification codes sent to it.

Switch what you can before you leave. For Google, Apple, social media, and other services that support an authenticator app or a passkey, move two-step verification off SMS, so turning off your home number won't lock you out. An authenticator app generates a new number every 30 seconds on your phone; a passkey is a sign-in credential stored on your phone or in a password manager. Neither needs SMS, and the difference is covered in [what is a passkey?](../tools/what-is-passkey.md). Where to check your Apple, Google, or Samsung account's current setting is in the [account sign-in step](../tools/phone-privacy-settings.md#9-Account-sign-in-protection) of phone privacy settings, step by step. Services such as banks that only offer SMS can't be switched, so keep your home number on for those.

To turn off your home number:

=== "iPhone"

    Open **Settings** → **Cellular**, tap your home line, and turn off **Turn On this Line**.

    iMessage and FaceTime run over the internet, so with your home line off you can still send and receive as your home number[^apple-esim-travel].

=== "Android"

    Open **Settings** → **Network & internet**, tap your home line, and turn off the switch for using that SIM.

    On other brands, search for `SIM`.

=== "Samsung Galaxy"

    Search Settings for `SIM`, open the SIM management screen, tap your home line, and turn it off.

A line that is turned off no longer connects to the local network. The research team also observed, in their test environment, that a disabled eSIM detaches from the network[^esim-paper].

## Checking your exit point on arrival

Turn off Wi-Fi first, so the phone is on mobile data, then open [ipinfo.io](https://ipinfo.io/what-is-my-ip){target="_blank"} or [ifconfig.co](https://ifconfig.co/){target="_blank"} in a browser and see which country and which carrier the IP address belongs to. The two sites use different geolocation databases and occasionally disagree on the country; the carrier name tells you more about who is handling your traffic than the country does.

Reading the result:

- Roaming on your home number shows your home country, as expected
- A travel eSIM showing a third country means a carrier in that country is handling your traffic. Most web and app content is encrypted, so what that carrier can see is which sites you connect to and when
- If you don't want that carrier to see this, turn on a VPN; the exit point becomes the VPN provider. Check again to confirm. Choosing a VPN is covered in [VPN: risks and how to choose](../tools/vpn-guide.md)

Do the same check after you connect to the hotel Wi-Fi.

## Device names

Your phone's name shows up in Bluetooth, AirDrop, and your personal hotspot, and on an iPhone the hotspot name is the device name[^apple-hotspot]. When a computer joins Wi-Fi, Windows gives the network the computer's name[^ms-dhcp], and a Mac uses its computer name so that other devices on the same network can recognize it[^mac-hostname]. From Android 15, each Wi-Fi network has a **Send device name** switch, and stock Android ships with it on[^aosp-hostname].

Many people's phones and computers carry their own name. Microsoft's documentation also notes that default device names can give hints about the device or user and may be a security risk[^ms-rename]. Before you leave, rename everything so it doesn't include your real name:

- Phone: see the device name step in [phone privacy settings, step by step](../tools/phone-privacy-settings.md#2-Device-name), which also turns off Android's **Send device name**
- Windows: open **Settings** → **System** → **About**, choose **Rename this PC**, then restart[^ms-rename]
- Mac: choose **Apple menu** → **System Settings** → **General** → **About**, and change the computer's name[^mac-hostname]

## Hotel and venue Wi-Fi

Hotel Wi-Fi is fine to use, with a few things in mind.

Most websites and apps now encrypt their connections, which is why the US Federal Trade Commission (FTC) considers public Wi-Fi generally safe to use, with the main risk being fake websites[^ftc-wifi]. Encryption protects content; the hotel network still sees which sites you connect to and when.

Other guests' devices are on the same hotel network. Some networks block devices on the same network from reaching each other, which is called client isolation, but a 2026 study tested many routers and networks and found at least one way around it on every one[^airsnitch]. So before you go out, turn off file sharing on your computer (network discovery and file sharing on Windows, file sharing on a Mac), so people on the same network can't read the folders you share[^cisa-wireless].

The FBI's advice on hotel Wi-Fi[^fbi-hotel] adds two points:

- Confirm the hotel's official network name at the front desk. People set up fake Wi-Fi with similar names, and once you connect, your traffic passes through them
- Turn off Bluetooth when you aren't using it, along with your phone's and computer's discoverability to nearby devices

A login page that asks for your room number and name ties this device to your stay. Devices join Wi-Fi using the network adapter's hardware address (the MAC address), and phones by default use a different random address for each network, so the login page records that random address together with your room number.

## Travel routers

A travel router is a palm-sized wireless router. It connects to the hotel's Wi-Fi and broadcasts a Wi-Fi network of your own, which your phone, laptop, and tablet join instead.

### When it is worth bringing

It helps most if you stay a long time in a hotel room or one venue and bring two or three devices that use Wi-Fi. If you spend most of the trip moving around on mobile data, a router won't do much for you, and getting the phone settings right is the more practical step.

### What it blocks

- The hotel network sees only one device, the router. Your phone's and laptop's names and addresses stay behind it. Taking common GL.iNet models as the example, the default mode puts your devices on a separate small network between the hotel network and them[^glinet-repeater]
- Other guests on the hotel network can't reach the devices behind the router
- You only log in to the captive portal once, rather than leaving one record per device
- With a VPN set up on the router, every device behind it goes through the VPN, including devices such as e-readers that can't run a VPN themselves

The examples below use GL.iNet's official documentation because it covers the hotel use case most thoroughly. That is not an endorsement of the brand, and most other brands have equivalent features.

### What to set up before you leave

- Update the router's system software (firmware), and change the default Wi-Fi name and password. The default Wi-Fi name usually includes the brand and model and is printed on the label on the bottom of the unit[^glinet-setup]
- Set a long admin password, which is the password for the router's settings page
- Set up the VPN. Routers use WireGuard or OpenVPN, two VPN protocols, and most VPN providers let you download matching configuration files from their website to upload to the router. The VPN account itself comes from the VPN provider
- Turn on the kill switch, which blocks all connections when the VPN drops, so devices don't fall back to going out over the hotel network directly. On GL.iNet firmware 4.8 and later it is on by default when a VPN is enabled[^glinet-killswitch]. Test it at home before you leave by turning the VPN connection off: none of your devices should be able to get online

Some hotels allow only two devices per room, counting by MAC address. The router can clone your phone's MAC address so the hotel thinks the phone is what's connected, and you won't be blocked[^glinet-portal].

### Getting past the captive portal

A hotel's captive portal only appears over a plain web connection and often won't open while a VPN is on. GL.iNet's approach is to switch temporarily to a public hotspot login mode, and its documentation states that during this time your network activity may be visible to the hotel or venue[^glinet-portal]. So the order is:

1. Connect your phone to the router, open a browser, and log in when the hotel's portal appears
2. As soon as you're logged in, turn the VPN back on in the router's settings page
3. Check once as described in [checking your exit point on arrival](#Checking-your-exit-point-on-arrival), and confirm the exit point is the VPN provider

### What it does not block

- Your phone's mobile connection. As long as mobile data is on, the phone stays connected to local towers, and its location and IMEI stay with the local carrier
- The phone falling back to mobile data when the Wi-Fi signal is weak. To make sure everything in your room goes through the router, turn off mobile data. To stay off local towers entirely, turn on airplane mode and then turn Wi-Fi back on, at the cost of not receiving calls or SMS
- Bluetooth. The router only handles Wi-Fi, and your Bluetooth device names are still visible to people nearby
- The VPN provider. Once traffic goes through the VPN, the party that can see your connection records changes from the hotel to the VPN provider
- Border inspection. A router preconfigured with a VPN is recognizable as a connectivity tool at a glance. For destinations where border device searches are a serious risk, see the [per-jurisdiction border context](./asia-travel.md#Per-jurisdiction-border-context-Asia) in device minimization and border crossings in Asia

A router left in the room all day, unattended, could in principle be tampered with. On an ordinary business trip the chance is small; when traveling somewhere high-risk, take it with you when you go out.

## Before you leave

- Decide which kind of number to use, using [how to choose](#How-to-choose); for a travel eSIM, check first whether the seller names its partner carrier
- Move whatever two-step verification you can from SMS to an authenticator app or a passkey
- Rename your phone and computer so the names don't include your real name, and turn off file sharing on the computer
- If you're bringing a travel router: update the firmware, change the default name and password, set up the VPN and kill switch, and test it once at home
- Once you arrive, check the exit point once each for mobile data, hotel Wi-Fi, and the VPN

## Where to go from here

- [Device minimization and border crossings in Asia](./asia-travel.md) — device preparation for any border, plus Asia-specific border-search context and the burner question
- [Pre-departure digital safety — brief yourself with AI prompts](./travel-ai-briefing.md) — a way to generate a destination overview that works for anywhere
- [Phone privacy settings, step by step](../tools/phone-privacy-settings.md) — get the phone's basic settings done before you leave
- [VPN: risks and how to choose](../tools/vpn-guide.md) — before using a VPN at the hotel or on a router, pick a provider worth trusting
- [Metadata, and why it matters](../basics/metadata.md) — the layer the mobile network can still see after content is encrypted

[^rfc7445]: [RFC 7445: Analysis of Failure Cases in IPv6 Roaming Scenarios](https://www.rfc-editor.org/rfc/rfc7445.html){target="_blank"} - IETF (2015). Section 2.1.1 describes the home-routed mode, in which the device's IP address is assigned by the home network and all traffic is routed back through it, as the main mode for international data roaming.
[^3gpp-attach]: [3GPP TS 23.401](https://www.3gpp.org/ftp/Specs/archive/23_series/23.401/){target="_blank"} - 3GPP. Section 5.3.2.1: the network retrieves the equipment identity when the phone attaches.
[^3gpp-li]: [3GPP TS 33.126](https://www.3gpp.org/ftp/Specs/archive/33_series/33.126/){target="_blank"} - 3GPP. Requirements R6.3-110, R6.3-130, and R6.3-330 in section 6.3 cover, respectively, the visited carrier's ability to intercept inbound roamers, to notify law enforcement when a target enters or leaves the network, and to provide location on its own under a warrant.
[^holafly]: [Traffic Routing: How We Keep Your Mobile Data Secure Abroad](https://esim.holafly.com/faq/about-esims/traffic-routing/){target="_blank"} - Holafly.
[^esim-paper]: Motallebighomi, Veara, Bitsikas, Ranganathan, [eSIMplicity or eSIMplification? Privacy and Security Risks in the eSIM Ecosystem](https://www.usenix.org/conference/usenixsecurity25/presentation/motallebighomi){target="_blank"} - USENIX Security 2025. Measurements were taken at a single location in the United States over four months; the exit IP attribution is in Table 1 of the paper.
[^apple-esim-travel]: [Use eSIM while traveling internationally with your iPhone](https://support.apple.com/en-us/118227){target="_blank"} - Apple Support.
[^apple-hotspot]: [Share your internet connection from your iPhone](https://support.apple.com/guide/iphone/iph45447ca6/ios){target="_blank"} - iPhone User Guide.
[^aosp-hostname]: [WifiConfiguration.java](https://android.googlesource.com/platform/packages/modules/Wifi/+/refs/heads/main/framework/java/android/net/wifi/WifiConfiguration.java){target="_blank"} - Android Open Source Project; `mIsSendDhcpHostnameEnabled` defaults to `true`. Manufacturers can change the default, and GrapheneOS switched it off by default in its [October 2024 release](https://grapheneos.org/releases){target="_blank"}.
[^ms-dhcp]: [MS-DHCPE Appendix A](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-dhcpe/73d899d4-6978-4328-a151-5d20f3ef8271){target="_blank"} - Microsoft. The DHCP client sends its host name when requesting an IP address.
[^ms-rename]: [Rename Your Windows Device](https://support.microsoft.com/en-us/help/4558981){target="_blank"} - Microsoft Support.
[^mac-hostname]: [Change your computer’s name or local hostname on Mac](https://support.apple.com/guide/mac-help/mchlp2322/mac){target="_blank"} - Mac User Guide.
[^ftc-wifi]: [Are Public Wi-Fi Networks Safe? What You Need To Know](https://consumer.ftc.gov/articles/are-public-wi-fi-networks-safe-what-you-need-know){target="_blank"} - FTC.
[^airsnitch]: [AirSnitch: Demystifying and Breaking Client Isolation in Wi-Fi Networks](https://ndss-symposium.org/ndss-paper/airsnitch-demystifying-and-breaking-client-isolation-in-wi-fi-networks/){target="_blank"} - NDSS 2026.
[^cisa-wireless]: [Using Wireless Technology Securely](https://www.cisa.gov/sites/default/files/publications/Wireless-Security.pdf){target="_blank"} - CISA.
[^fbi-hotel]: [A COVID 19-Driven Increase in Telework from Hotels Could Pose a Cyber Security Risk for Guests](https://www.ic3.gov/PSA/2020/PSA201006){target="_blank"} - FBI IC3 (2020).
[^glinet-repeater]: [Repeater](https://docs.gl-inet.com/router/en/4/interface_guide/internet_repeater/){target="_blank"} - GL.iNet documentation.
[^glinet-setup]: [First time setup](https://docs.gl-inet.com/router/en/4/faq/first_time_setup/){target="_blank"} - GL.iNet documentation.
[^glinet-killswitch]: [VPN Kill Switch](https://docs.gl-inet.com/router/en/4/faq/block_non_vpn_traffic/){target="_blank"} - GL.iNet documentation.
[^glinet-portal]: [Connect to public hotspot with Captive Portal](https://docs.gl-inet.com/router/en/4/faq/connect_to_a_hotspot_with_captive_portal/){target="_blank"} - GL.iNet documentation.
