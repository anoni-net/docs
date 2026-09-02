---
title: Offline reading
description: Store this site on your device and read it without a network. Three steps to prepare and confirm it worked, manage what stays on the device, and the page you land on when there is no connection.
icon: material/wifi-off
hide:
  - navigation
---

# :material-wifi-off: Offline reading

The whole site can be stored on a phone or computer and opens without a network. This page explains how to prepare, how to confirm it worked, and is where you manage what stays on the device.

!!! info "Brought here with no network?"
    The page you wanted has not been stored on this device yet. The list below shows only what is still readable here, and the titles open. Reload once the connection is back to return to the normal content. For what else you can do without a network, see [things to try](#Things-to-try-without-a-network) at the end.

## Three steps to get ready

Do this while you still have a connection. Once the network is down, nothing more can be stored.

1. **Open the site**: use an ordinary browser such as Chrome, Edge, Firefox or Safari to open [anoni.net/docs](index.md), and leave Tor Browser aside for now (the reason is in the [install section](#Install-this-site-as-an-offline-app)). A card slides up from the bottom of the home page asking you to choose a reading language. Pick one. The core chapters for that language then download in the background, about 10 MB of text. If the card does not appear, open any second page in the same language and the download starts just the same.
2. **Decide how much to carry**: come back to this page and look at "Offline content on this device" below. When "pages stored automatically" shows a few dozen, step one is done. If the number is still small, the background download may still be running, so wait a moment and reload. To carry the whole site, press "Save everything". To carry only some sections, expand them, tick the pages and press "Apply changes". What the site stores automatically is cleared and downloaded again on every release. What you save yourself stays. If you already know your role, [Start by role](start/index.md) has a one-press button that stores everything that path links to.
3. **Confirm it worked**: switch the device to airplane mode, or turn off Wi-Fi and mobile data, then return to the [home page](index.md) and open a few pages. Stored pages open directly. Pages that were never stored bring you back here, and the list shrinks to what is still readable.

Spend another minute to [install it as an app](#Install-this-site-as-an-offline-app), so that with no connection you tap an icon instead of opening a browser and hunting for a bookmark.

## Offline content on this device

<div id="offline-library"></div>

<script src="../js/offline-library.js"></script>

## Install this site as an offline app

Installing is not required. Once the three steps above are done, the content is already on the device. What installing changes is the way in: the app gets its own icon and window, so with no connection you tap it directly instead of opening a browser and hunting for a bookmark.

!!! tip "Do it while you still have a connection"
    This is preparation. Installing after the network is already down is too late. One minute now keeps an offline copy of the guide on your device.

Open [anoni.net/docs](index.md) in an ordinary browser rather than Tor Browser, for the reason below:

- **Android (Chrome, Edge, Firefox, etc.)**: open the browser menu and choose "Install app", "Install" or "Add to Home screen".
- **Desktop (Chrome, Edge)**: an install icon appears at the right end of the address bar, or choose "Install anoni.net Docs" from the menu.
- **iPhone, iPad (Safari)**: tap "Share", then "Add to Home Screen".

Once installed, open the app once while you still have a connection and let it store the content. On iPhone and iPad the app and Safari keep separate storage, so what Safari stored does not carry over: repeat step one inside the app. On Android, long-press the app icon and the shortcut menu has "Offline reading", which opens this page directly.

Tor Browser and the onion and IPFS builds do not offer offline reading, for privacy reasons: those builds do not register a background Service Worker. Prepare from an ordinary browser on anoni.net when you need an offline fallback, and go back to Tor Browser for everyday anonymous reading.

## What gets stored on your device

Opening the site in an ordinary browser stores only this page and the styles it needs at first, about 0.5 MB, so that you can at least reach this page without a network. The core chapters for a language (concepts, tools, advanced, regional) download in the background only after you have picked a reading language on the home page, or opened a second page in that language. Nothing needs to be installed for this. The extra step is there so that someone who reads one page and leaves does not spend 10 MB of mobile data. Switching to another language downloads that language separately, so only the languages you actually read end up on your device. Pages you visit afterwards are stored as well. That part follows the same switch above as the core chapters: turn it off and the pages you read stop staying on the device.

The chapters the site stores for you follow the site version. Every release clears that copy and downloads it again, and the download only covers the language you have open at that moment. To make sure something stays on the device, use "Save everything" above the list. What that button stores is not affected by site releases.

"Save everything" only covers the language you are currently in. To carry all three languages, open the offline reading page in each language and press it once there.

Scenario pages for journalists, activists, LGBTQ+ readers and survivors of domestic abuse are **excluded from that background download**. They are only stored if you open them yourself, because the presence of those pages on a device can itself be a sensitive signal, and that choice should be yours. If you want them available offline, tick them in the list above and they will be stored. The "Save everything" button includes them, and says so next to the button. If your situation calls for picking, use the list instead.

The chapters the site stores automatically are text only, so they lose their images offline. There is an option above, "Also store the images in the core chapters", that downloads those images too, about 7 MB more, starting the next time you are online. It is off by default because most people are on mobile data, and the text alone still carries most of what a page says.

Pages you tick yourself are not affected by that option. They always come with their images, and the size shown on screen already counts them.

The reading language you pick from the language menu is stored in the same place. The site uses it to decide which language version to open when you arrive at the home page next time, and for nothing else. The language your browser reports is never read: on Tor Browser that value is always English, so acting on it would send readers in Taiwan to the English version.

"Clear all offline content" above removes both what the site stored and what you picked, and turns off automatic storage, so the pages you read after clearing do not stay on the device either. Turn the switch back on above to resume.

This page itself and the styles it needs are outside that switch, and come back the next time you are online (about 0.5 MB). They stay because the moment you want to clear what is on the device, or check what is still readable, is often the moment you have no connection, and without this page all that is left is the browser error screen.

What that button does not cover: browsing history, DNS cache, and files you downloaded from the site. Handle those in your browser or system settings. In Chrome this is Clear browsing data. In Firefox it is Clear recent history with "Cookies and site data" ticked under the details. Selecting only "Cached images and files" does not remove site storage.

## When the site has a new version

When a new version of the site is available, a notice slides up from the bottom of the screen, and it is applied only after you press Update, which reloads the page you are on. This keeps the content from being swapped out while you are reading. Ignoring the notice is fine: browsing online always gives you the latest content, and the offline copy on your device stays as it is until you press Update.

## Things to try without a network

- Return to the [home page](index.md) and browse what is stored
- Check your Wi-Fi or mobile data connection
- If you are in a network environment under blocking or interference, see the [concepts](basics/index.md) section once you are back online

Reload this page after the connection recovers to get back to the normal content.
