---
date: 2025-09-09
authors:
    - toomore
categories:
    - News
slug: updates-202508
image: "assets/images/post-update.png"
summary: "Current Project Status and Updates 2025/06/13"
description: "Current Project Status and Updates 2025/06/13"
---

# 2025/08 Project Update

![Project Update](./assets/images/post-update.png){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

The [workshop](../../event-workshop-2025.md){target="_blank"} held from 8/9 to 8/10 was successfully completed. We are currently preparing for post-workshop discussions and reviews, and considering future directions for improvement. Whether or not you participated in the two-day event, we sincerely thank you for your continued attention to our activities.

Up next, we would like to share some updates with you for the period in August 2025.

## Booth、Brochure

After the workshop event, we also participated in the conferences of [HITCON](https://hitcon.org/2025/){target="_blank"} and [PyConTW](https://tw.pycon.org/2025/){target="_blank"}. Although we did not apply for a booth, we created a brochure about 'Anonymous Networks.' This brochure includes an introduction to our community and explanations about Tor/Tails, OONI, internet freedom, and anonymous network topics. It also details which open-source software our community currently uses to build services. This brochure was available for attendees to pick up at the conference venue.

In the future, this brochure will only be available at in-person events, with a limited number printed each time. We will continually update it with new information. During the workshop, we provided each participant with a copy. Based on observations from this event, we found it helpful for participants to understand the community's message about 'anonymous networks and internet freedom.' For future conferences or community events of a similar nature, we will actively apply for a booth to continue promoting our message.

<!-- more -->

## Translated Articles

In August 2025, we are continuing to update information from the official websites of Tor/Tails and OONI. A significant amount of content was published this month, and we aim to have the articles translated, proofread, and published within a week. However, if you have research needs, you could also focus directly on the information releases from the official websites.

- [Test 7.0~rc2](https://tails.net/news/test_7.0-rc2/){target="_blank"}（[zh-TW](https://anoni.net/docs/blog/2025/08/tails-7-rc/){target="_blank"}, [zh-CN](https://anoni.net/docs/zh-cn/blog/2025/08/tails-7-rc/){target="_blank"}） - 2025/08/29
- [OMG! Summary of the 3rd Open Measurement Gathering (OMG) Ask Me Anything (AMA) event](https://ooni.org/post/2025-omg/){target="_blank"}（[zh-TW](https://anoni.net/docs/blog/2025/08/ooni-omg-2025/){target="_blank"}, [zh-CN](https://anoni.net/docs/zh-cn/blog/2025/08/ooni-omg-2025/){target="_blank"}）- 2025/08/29
- [Corruption and Control: How Turkmenistan turned internet censorship into a business](https://blog.torproject.org/Corruption-Control-Turkmenistan-internet-censorship-business/){target="_blank"}（[zh-TW](https://anoni.net/docs/blog/2025/08/tor-corruption-control/){target="_blank"}, [zh-CN](https://anoni.net/docs/zh-cn/blog/2025/08/tor-corruption-control/){target="_blank"}） - 2025/08/30
- [New Release: Tails 6.18](https://blog.torproject.org/new-release-tails-6_18/){target="_blank"}（[zh-TW](https://anoni.net/docs/blog/2025/07/tails-6-18-webtunnel/){target="_blank"}, [zh-CN](https://anoni.net/docs/zh-cn/blog/2025/07/tails-6-18-webtunnel/){target="_blank"}） - 2025/07/31

Additionally, we noticed that [The MIT Press Reader](https://thereader.mitpress.mit.edu/){target="_blank"} published a pretty good article. After obtaining permission from The MIT Press, we translated it into Chinese. In this translation, we not only focused on translating the content but also added annotations to supplement the historical context mentioned in the article.

- [The Secret History of Tor: How a Military Project Became a Lifeline for Privacy](https://thereader.mitpress.mit.edu/the-secret-history-of-tor-how-a-military-project-became-a-lifeline-for-privacy/){target="_blank"}（[zh-TW](https://anoni.net/docs/blog/2025/09/tor-military-to-privacy/){target="_blank"}, [zh-CN](https://anoni.net/docs/zh-cn/blog/2025/09/tor-military-to-privacy/){target="_blank"}） - 2025/09/07

## SearXNG

<center>
    <img width="50%" src="https://search.anoni.net/static/themes/simple/img/searxng.png" title="SearXNG" alt="SearXNG">
</center>

[SearXNG](https://searxng.org/){target="_blank"} is an open-source privacy-focused search engine designed to protect user privacy. It aggregates search results from various search sources without tracking users or collecting personal data. SearXNG can be self-hosted to enhance privacy protection and supports customizable settings, allowing users to choose their preferred search engines and filtering rules.

Given the limited number of servers available in Asia on the current [public server list](https://searx.space/){target="_blank"}, we [set up](https://search.anoni.net/){target="_blank"} SearXNG a week ago and [applied](https://github.com/searxng/searx-instances/issues/738){target="_blank"} to become a public server. We have met the basic technical requirements and are now in a two-week observation period. We welcome assistance in testing during this observation period to verify the host's capability to handle everyday usage.

## Tor WebTunnel

<figure markdown="span">
    <a target="_blank"
       href="../../../../assets/images/tor_relays.svg">
        <img src="../../../../assets/images/tor_relays.svg"
            alt="Tor Relay Types"
            title="Tor Relay Types"
        >
    </a>
    <caption>Tor Relay Types</caption>
</figure>

WebTunnel is one type of Tor bridge that assists users in connecting to the Onion routing network when they can't directly access it. WebTunnel acts as a proxy server to relay connections. Since [Tails 6.18 version](https://tails.net/news/version_6.18/){target="_blank"}, it also added support for connecting via WebTunnel bridges. Due to the critical role of bridge points, connection parameters are not readily available on the Tor official website and need to be [requested](https://bridges.torproject.org/){target="_blank"} directly.

Because of this, we cannot determine how many Tor WebTunnel bridges are currently established in Taiwan. If you are interested, you can refer to the "[WebTunnel Docker setup](https://community.torproject.org/relay/setup/webtunnel/docker/){target='_blank'}" to create one, or if you already have a service set up with nginx, you can [contribute a node](https://community.torproject.org/relay/setup/webtunnel/){target="_blank"} by providing a path for the WebTunnel bridge connection—we greatly appreciate such contributions!

Of course, there is an even easier way to contribute a bridge point: by using a browser to set up a [Tor Snowflake bridge](../../tor-snowflake.md){target="_blank"}!

## Conclusion

The above outlines the current progress of our community's work. If you have any suggestions or feedback, please feel free to [email us](../../about/index.md){target="_blank"} directly. Thank you!
