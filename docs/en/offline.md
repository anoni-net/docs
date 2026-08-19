---
title: Offline reading
description: Manage what this site keeps on your device, and the page you land on when there is no connection.
icon: material/wifi-off
hide:
  - navigation
---

# :material-wifi-off: Offline reading

If you were brought here because there is no network connection, the page you wanted has not been stored on this device yet. Pages you visited before are still readable, so go back or start from the [home page](index.md).

This page is also where offline content is managed. Below you can see what is currently stored on the device, pick what to keep, or clear all of it.

## Offline content on this device

<div id="offline-library"></div>

<script src="../js/offline-library.js"></script>

## Install this site as an offline app

Installing is not required for offline reading. Opening the site in an ordinary browser already stores the content listed above. What installing changes is the way in: the app gets its own icon and window, so with no connection you tap it directly instead of opening a browser and hunting for a bookmark.

!!! tip "Do it while you still have a connection"
    This is preparation. Installing after the network is already down is too late. One minute now keeps an offline copy of the guide on your device.

Open [anoni.net/docs](index.md) in an ordinary browser rather than Tor Browser, for the reason below:

- **Android (Chrome, Edge, etc.)**: open the browser menu and choose "Install app" or "Add to Home screen".
- **Desktop (Chrome, Edge)**: an install icon appears at the right end of the address bar, or choose "Install anoni.net Docs" from the menu.
- **iPhone, iPad (Safari)**: tap "Share", then "Add to Home Screen".

Once installed, long-press the app icon and the shortcut menu has "Offline reading", which opens this page directly.

Tor Browser and the onion and IPFS builds do not offer offline installation, for privacy reasons: those builds do not register a background Service Worker. Install from an ordinary browser on anoni.net when you need an offline fallback, and go back to Tor Browser for everyday anonymous reading.

## What gets stored on your device

The first time you open this site in an ordinary browser, the core chapters for the language you are reading are downloaded to your device cache in the background. This happens without you installing anything. Switching to another language downloads that language separately, so only the languages you actually read end up on your device. Pages you visit afterwards are stored as well.

Scenario pages for journalists, activists, LGBTQ+ readers and survivors of domestic abuse are **excluded from that background download**. They are only stored if you open them yourself, because the presence of those pages on a device can itself be a sensitive signal, and that choice should be yours. If you want them available offline, tick them in the list above and they will be stored.

The reading language you pick from the language menu is stored in the same place. The site uses it to decide which language version to open when you arrive at the home page next time, and for nothing else. The language your browser reports is never read: on Tor Browser that value is always English, so acting on it would send readers in Taiwan to the English version.

"Clear all offline content" above removes both what the site stored and what you picked, and stops the site from storing new chapters. Turn the switch back on above to resume.

This page itself and the styles it needs are outside that switch, and come back the next time you are online (about 0.5 MB). They stay because the moment you want to clear what is on the device, or check what is still readable, is often the moment you have no connection, and without this page all that is left is the browser error screen.

What that button does not cover: browsing history, DNS cache, and files you downloaded from the site. Handle those in your browser or system settings. In Chrome this is Clear browsing data. In Firefox it is Clear recent history with "Cookies and site data" ticked under the details. Selecting only "Cached images and files" does not remove site storage.

## When the site has a new version

When a new version of the site is available, a notice appears at the top of the page, and it is applied only after you press Update. This keeps the content from being swapped out while you are reading. Ignoring the notice is fine: browsing online always gives you the latest content, and the offline copy on your device stays as it is until you press Update.

## Things to try

- Return to the [home page](index.md) and browse cached content
- Check your Wi-Fi or mobile data connection
- If you are in a network environment under blocking or interference, see the [concepts](basics/index.md) section once you are back online

Reload this page after the connection recovers to get back to the normal content.
