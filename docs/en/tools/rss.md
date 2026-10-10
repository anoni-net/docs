---
title: Following sites with RSS
description: A way to follow websites with no account, no ranking algorithm, and a subscription list that stays on your own device. Choosing a reader, subscribing, reading over Tor, piping feeds into team chat, and the feed addresses for every anoni.net site.
icon: material/rss
---

# :material-rss: Following sites with RSS

The usual ways to follow a website are to follow its social media account or to sign up for its newsletter. Following an account means having an account on that platform, and the platform's algorithm decides which posts you see. A newsletter means handing over an email address. RSS lets you add the sites you care about to a reader, where new articles show up in one place in the order they were published. There is nothing to sign up for, and the list of what you follow lives only on your own device.

The anoni.net docs site, the software changelog, and the news briefs all publish RSS feeds. Clicking an RSS link in a browser usually shows a page of raw code, because the file is meant for a reader app rather than for you. Install a reader, paste the address in, and new articles arrive on their own.

!!! tip "If you only have a minute"

    - Install a reader: Feeder on Android, NetNewsWire on iPhone, iPad and Mac, Thunderbird or Fluent Reader on a computer
    - Add a subscription in the reader and paste in a feed address ([the end of this page](#anoninet-feeds) lists the anoni.net ones)
    - Pick a local reader that needs no login, so the subscription list stays on your device
    - If you don't want the site to see your IP address, read the onion feeds over Tor
    - Teams can pipe feeds into Slack, Matrix, or similar chat tools, at the cost of handing the subscription list to the platform or a bot

## How RSS works

A website packages the titles, summaries, or full text of its latest articles into a file at a fixed address, called a feed. Your reader fetches that file every so often and adds anything new to your list. The traffic only goes one way: the reader asks, the site answers. The site cannot push anything to you and never learns how to contact you.

Atom and JSON Feed are formats of the same kind, and common readers handle all of them. This page calls them all RSS.

## The privacy trade-offs

### Compared with social media and newsletters

When you follow an account, the platform knows who you follow and how long you linger on each post, and it uses that record for ranking and ad targeting (see [how platforms collect your data](../basics/platform-tracking.md)). A newsletter needs your email address, and many newsletter services embed tracking pixels that record when you open each message. An RSS reader has no account. What the site sees is an IP address fetching a file on a schedule.

### What the site can still see

Each time your reader fetches a feed, the site and the CDN in front of it see the connecting IP address, the time, and the reader's name and version, exactly as they would for a page load in a browser. Images inside an article are downloaded separately when the reader displays them, which leaves another connection record. Opening the original article is ordinary browsing, and whatever analytics the page carries will load.

If you don't want the site to see your IP address, [read the feeds over Tor](#Reading-feeds-over-Tor).

### Local readers and cloud readers

Cloud readers such as Inoreader and Feedly fetch feeds from the provider's servers on your behalf. You get read status synced across devices, and the site sees the provider's servers rather than you. The price is that the provider knows every site you subscribe to and every article you read, all tied to your account. A local reader keeps the subscription list and read history on your device, and in exchange the site sees your IP address.

A subscription list shows which issues you follow and which devices and software you use. Subscribe to the software changelog by device, and the list spells out whether you carry an iPhone or an Android phone and whether you run Tails. Think about how sensitive that list is before handing it to a cloud provider.

## Choosing a reader

All of the readers below are open source and free, work without an account, and have shipped a new release within the past year:

- Android: [Feeder](https://github.com/spacecowboy/Feeder){target="_blank"}, from [F-Droid](https://f-droid.org/packages/com.nononsenseapps.feeder/){target="_blank"} or Google Play. Google Play is unavailable in Mainland China, where the APK from F-Droid or [the GitHub releases page](https://github.com/spacecowboy/Feeder/releases){target="_blank"} is the way in
- iPhone, iPad, Mac: [NetNewsWire](https://netnewswire.com/){target="_blank"}, from the App Store. The interface is English only
- Windows, Mac, Linux: [Thunderbird](https://www.thunderbird.net/){target="_blank"} or [Fluent Reader](https://hyliu.me/fluent-reader/){target="_blank"}

Thunderbird started as an email client, so if you already read mail in it there is nothing new to install. Fluent Reader is built only for RSS and looks more like a news app. NetNewsWire stores subscriptions on the device by default. Its settings also offer iCloud sync, which moves the subscription list to iCloud once you turn it on.

Feeder, Thunderbird, and Fluent Reader all ship with both Traditional and Simplified Chinese interfaces.

Apple's China App Store dropped Inoreader in 2017 and Reeder and Fiery Feeds in 2020, and Feedly was already unavailable there by then ([TechCrunch's report](https://techcrunch.com/2020/09/30/apple-removes-two-rss-feed-readers-from-china-app-store/){target="_blank"}). NetNewsWire was still available there in September 2026. If it disappears, an Apple account from another region or a desktop reader are the fallbacks.

## Subscribing

Buttons sit in different places in each reader, but the steps are the same:

1. Copy a feed address, either from [the list at the end of this page](#anoninet-feeds) or by right-clicking an RSS link on a website and choosing "Copy link"
2. Find where the reader adds subscriptions and paste the address. In Feeder it's "Add feed", and in Fluent Reader it's under "Manage sources". NetNewsWire uses `+` then "Add Feed" on iPhone and iPad, and "New Feed…" in the menu on Mac
3. Once the reader has fetched the feed it shows the site's name and recent articles. Confirm to add it

Some readers also accept a site's homepage address and find the feed on their own. If yours can't, paste the feed address instead.

### Thunderbird

Thunderbird needs a feed account first, and every subscription lives under it:

1. From the app menu in the top-right corner, choose "New Account", then "Feed", and give it a name
2. Select the new account in the left pane, and click "Manage feed subscriptions" on the account page
3. Paste the address into "Feed URL" and click "Add"

## Reading feeds over Tor

Every anoni.net feed has an onion version (addresses in [the list at the end of this page](#anoninet-feeds)). Reading the onion version over Tor means the site cannot see your IP address, and your internet provider can see only that you are using Tor. If your network blocks anoni.net, the onion feeds still work. Where Tor itself is blocked, as in Mainland China, Tor Browser needs a bridge before it can connect (see [relays and bridges](./what-is-tor.md#Relays-and-bridges)).

The reader has to support a SOCKS proxy to go through Tor. In Thunderbird:

1. Keep Tor Browser open. It provides a Tor connection at `127.0.0.1:9150` on your machine
2. Open Thunderbird's "Settings", then "General", scroll to the network section at the bottom, and click "Settings…"
3. Choose "Manual proxy configuration", enter `127.0.0.1` as the "SOCKS Host" and `9150` as the "Port", select SOCKS v5, and tick the option that sends DNS lookups through the SOCKS v5 proxy. Without it, onion addresses will not connect

The proxy applies to all of Thunderbird. If the same Thunderbird also handles your email, your mail goes over Tor too, and some mail providers respond by asking for extra verification or blocking the login. To send only RSS over Tor, create a separate Thunderbird profile just for feeds. With Tor Browser closed, a Thunderbird set up this way cannot connect at all.

For Tor itself, see [What Is Tor?](./what-is-tor.md).

## Feeds for a team

Most chat tools that organizations use can subscribe to RSS and post new articles into a chosen channel. One person sets it up once, everyone in the channel sees the posts, and nobody else needs to install a reader.

Once a feed goes into a chat tool, the fetching is done by the platform's servers or a third-party bot, and whoever runs them learns which sources your team follows. A team that subscribes to the software changelog by device is telling them which devices and software the team uses. The options below are grouped by who ends up holding that list.

### The list stays inside the organization

- Matrix: on a self-hosted server with [hookshot](https://matrix-org.github.io/matrix-hookshot/latest/setup/feeds.html){target="_blank"} installed and its feeds feature enabled, type `!hookshot feed <address>` in a room
- Zulip: the official [RSS integration](https://zulip.com/integrations/rss){target="_blank"} is a program you run on a schedule on your own machine, posting new articles into a chosen channel

Your own machines do the fetching, and no outside provider gets the subscription list. The cost is that someone has to set it up and keep it running.

### The list goes to the platform

- Slack: the official RSS app, used by typing `/feed subscribe <address>` in a channel (see [Slack's help page](https://slack.com/help/articles/218688467-Add-RSS-feeds-to-Slack){target="_blank"})
- Microsoft Teams: the old RSS connector was retired in May 2026. Use the RSS template in Workflows instead

Your team's conversations already live on these platforms. What you add is the subscription list.

### A third party joins in

- Discord: no built-in RSS. The usual routes are a bot such as [MonitoRSS](https://monitorss.xyz/){target="_blank"}, or a service like Zapier posting through a webhook (a private address that lets an outside service post into a channel)
- Telegram: also relies on third-party bots

The bot's operator knows what your team subscribes to and can post in your channel. MonitoRSS and [RSS-to-Telegram-Bot](https://github.com/Rongronggg9/RSS-to-Telegram-Bot){target="_blank"} are both open source and can be self-hosted, which removes the operator from the picture.

## anoni.net feeds

=== "Clearnet"

    News briefs:

    ```
    https://anoni.net/news/en/feed.xml
    ```

    News briefs in Traditional and Simplified Chinese:

    ```
    https://anoni.net/news/feed.xml
    ```

    ```
    https://anoni.net/news/zh-cn/feed.xml
    ```

    Docs site announcements:

    ```
    https://anoni.net/docs/en/feed_rss_created.xml
    ```

    Software changelog, every entry:

    ```
    https://anoni.net/docs/en/changelog/feed.xml
    ```

    Software changelog, only updates to install now or soon:

    ```
    https://anoni.net/docs/en/changelog/feed-urgent.xml
    ```

=== "Tor (onion)"

    News briefs:

    ```
    http://news.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/en/feed.xml
    ```

    News briefs in Traditional and Simplified Chinese:

    ```
    http://news.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/feed.xml
    ```

    ```
    http://news.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/zh-cn/feed.xml
    ```

    Docs site announcements:

    ```
    http://docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/en/feed_rss_created.xml
    ```

    Software changelog, every entry:

    ```
    http://docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/en/changelog/feed.xml
    ```

    Software changelog, only updates to install now or soon:

    ```
    http://docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/en/changelog/feed-urgent.xml
    ```

The software changelog also has separate feeds by device and use, for iPhone and iPad, Mac, Windows, Linux, Android, Tails, and more. The subscribe links sit next to each filter on the [Software Changelog](../changelog/index.md) page. Subscribe only to the ones you need, and your reader won't fill up with irrelevant updates.

## If you'd rather not install a reader

You can [subscribe to the newsletter](https://anoni.net/en/contact/){target="_blank"} instead, which brings project progress and event news to your inbox. To avoid handing over your everyday address, sign up with an [email alias](./email-alias.md) and switch the alias off when you no longer want the mail.

## Related reading

- [Software Changelog](../changelog/index.md) — version updates for anonymity tools and operating systems, with a feed per device
- [How platforms collect your data](../basics/platform-tracking.md) — what a platform records when you follow an account
- [Email aliases, and who you hand your trust to](./email-alias.md) — signing up for newsletters without giving out your real address
- [What Is Tor?](./what-is-tor.md) — what Tor protects, before you route your feeds through it
- [About Feeds](https://aboutfeeds.com/){target="_blank"} — a one-page general introduction to feeds in English
