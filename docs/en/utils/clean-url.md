---
title: URL cleaner
description: Pick out and remove tracking parameters from a URL, and unwrap Google and Facebook redirect wrappers. Everything happens in your browser and it works with the network off.
icon: material/link-variant-off
---

# :material-link-variant-off: URL cleaner

<div id="cleanurl-tool"></div>

<script src="../../js/cleanurl.js"></script>

## What that string of parameters tells whom

Open an article from Facebook, copy the URL, and you get something like this:

```
https://example.com/article?fbclid=IwAR3xK9mQ...
```

`fbclid` is Meta's identifier for that one click. Paste it into a group chat and everyone who follows it carries the same ID back to Meta, which then knows **who shared the link, how many followed it and who they were**. You thought you were sharing an article. You connected the group.

Newsletter `utm_source` works the same way: forwarding it tells the recipient which newsletter you subscribe to. `mc_eid` is more direct still, being Mailchimp's recipient identifier, which maps back to your email address.

## Redirect wrappers

A link in Google search results does not point where it appears to:

```
https://www.google.com/url?q=https%3A%2F%2Fanoni.net%2F&sa=U&ved=...
```

Copy that to someone and their click passes through Google first. Facebook's `l.php` and Instagram's outbound links do the same. This tool strips the wrapper and leaves the real destination.

## Only recognised parameters are removed

Removal works from an allow list: only parameters recognised as trackers come out, and everything else stays.

Doing it the other way round takes `?v=` (the YouTube video ID), `?page=2` and `?q=` with it. You end up with a URL that does not open, or opens the wrong thing, and nothing points back at the cleaner. The person on the other end simply thinks you sent a broken link. A whole group of tests guards this.

Each removed parameter is annotated with who is doing the tracking, which is more useful than silently handing back a clean URL: next time you see `gclid` somewhere else, you will know what it is.

## Shorteners are not expanded

`t.co`, `bit.ly` and the rest need a request before their destination is known. This page deliberately does not make it, because that would send the very URL you wanted to clean to a third-party server.

To check where a shortener leads, opening it in [Tor Browser](../tools/what-is-tor.md) is the safer route: at least the other end does not see your address.

## Works offline

Like the rest of this section, the code is stored on your device and runs without a network. Try it with the network off: it still cleans, which also means what you pasted cannot have gone anywhere.

To take this page with you, see [offline reading](../offline.md).
