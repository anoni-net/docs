---
title: URL cleaner
description: Pick out and remove tracking parameters from a URL, and unwrap Google and Facebook redirect wrappers. Everything happens in your browser and it works with the network off.
icon: material/link-variant-off
---

# :material-link-variant-off: URL cleaner

<div id="cleanurl-tool"></div>

<script src="../../js/cleanurl.js"></script>

A common situation: someone at an NGO pastes a donation page URL into a group chat, having copied it out of a newsletter, so it still carries `utm_source` and `mc_eid`. When people click through, the back end sees not only that someone donated but which email it came from and who forwarded it. The cleaned URL still works for donations, minus the layer that traces back to a person.

## What the parameters on the end of a URL give away

Open an article from Facebook, copy the URL, and you get something like this:

```
https://example.com/article?fbclid=IwAR3xK9mQ...
```

`fbclid` is Meta's identifier for that one click. Paste it into a group chat and everyone who follows it carries the same ID back to Meta, which ties together who shared the link, how many followed it and who they were, all in one record.

Newsletter `utm_source` works the same way. Forwarding it lets the recipient see which newsletter you subscribe to. `mc_eid` is more direct still, being Mailchimp's recipient identifier, which maps back to your email address.

## Redirect wrappers

A link in Google search results does not point where it appears to:

```
https://www.google.com/url?q=https%3A%2F%2Fanoni.net%2F&sa=U&ved=...
```

Copy that to someone and their click passes through Google first. Facebook's `l.php` and Instagram's outbound links do the same. This tool strips the wrapper and leaves the real destination.

## Only recognised parameters are removed

Removal works from an allow list: only parameters recognised as trackers come out, and everything else stays.

Doing it the other way round takes `?v=` (the YouTube video ID), `?page=2` and `?q=` with it. You end up with a URL that does not open, or opens the wrong thing, and nothing suggests the cleaner is to blame. The person on the other end simply thinks you sent a broken link. YouTube videos, pagination and search URLs are all tested, so the parameters they need survive.

Each removed parameter is annotated with who is doing the tracking, which is more useful than silently handing back a clean URL. Next time you see `gclid` somewhere else, you will know what it is.

## Shorteners are not expanded

`t.co`, `bit.ly` and the rest need a request before their destination is known. The cleaner deliberately does not make that request, because it would send the very URL you wanted to clean to a third-party server.

To check where a shortener leads, opening it in [Tor Browser](../tools/what-is-tor.md) is the safer route: at least the other end does not see your address.

## Works offline

Like the rest of this section, the code is stored on your device and runs without a network. Try it with the network off: it still cleans, which also means what you pasted cannot have gone anywhere.

To take this page with you, see [offline reading](../offline.md).
