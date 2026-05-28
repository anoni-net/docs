---
date: 2026-05-28
authors:
    - toomore
categories:
    - News
    - Community
    - Tor
    - Relay
slug: iran-blackout-webtunnel
image: "assets/images/tor.webp"
summary: "Iran cut off the internet for more than 80 days. When it came back, traffic poured into a Tor WebTunnel bridge our community runs. Here is what we saw, and an invitation for people in other regions to run WebTunnel or Snowflake too."
description: "After Iran's 80-plus-day blackout ended, traffic surged through the Tor WebTunnel bridge our community operates. WebTunnel disguises Tor traffic as ordinary HTTPS, making it the hardest bridge to block in heavily censored places. Anywhere with a free, well-connected link is a good place to host one."
---

# After Iran's 80-day blackout, traffic surged through our community's Tor WebTunnel bridge

For people in Iran, the outside internet barely existed for nearly three months. When connectivity started to come back a few days ago, the Tor WebTunnel bridge our community runs began taking on a wave of traffic. That was Iranians who had found a way around the censorship and reconnected to Tor, getting back onto the wider internet.

!!! tip "Wherever you are, you can help"

    If you have a VPS (a small cloud server) or a physical machine, plus a domain name, you can run a Tor WebTunnel bridge and give people cut off by censorship a way back onto the open internet. Can't run a server? Open a browser tab and run [Snowflake](https://snowflake.torproject.org/){target="_blank"} instead, it contributes anonymous traffic just the same.

    Server specs, legal considerations, and the full setup steps are written up in [**How to set up a Tor WebTunnel bridge**](../../community/setup-tor-webtunnel.md).

<!-- more -->

## More than 80 days offline

Starting 28 February 2026, Iran cut its outbound connectivity during military operations. This was the whole country's link to the outside world going dark, close to nationwide, a different order of magnitude from the usual censorship that blocks individual sites. According to Cloudflare Radar, Iran's outbound traffic dropped to around 0.3% of its normal peak after the shutdown, effectively zero, and stayed pinned at that low through March and April[^1][^2]. It was not until around 26 May that traffic shot back up toward normal levels. From shutdown to reopening, more than 80 days.

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/iran-radar-cf.png" target="_blank">
        <img src="https://assets.anoni.net/blog/iran-radar-cf.png"
            alt="Cloudflare Radar timeline of Iran's outbound internet traffic: it collapses to near zero after the 28 February 2026 shutdown, stays low through March and April, and shoots back up around 26 May"
            title="Iran's outbound traffic seen by Cloudflare Radar: shut down 28 February, recovering around 26 May"
            class="brand-frame">
    </a>
    <figcaption>Iran's outbound internet traffic as observed by Cloudflare Radar. It fell to near zero after the 28 February 2026 shutdown, held at that low through March and April, and shot back up around 26 May.</figcaption>
</figure>

During the blackout, Iran was left with only a heavily filtered domestic network. Local services like banking and food delivery kept running, but connections to the outside were almost entirely severed. NetBlocks recorded it as one of the longest nationwide shutdowns in modern history; of the country's 90 million people, most went nearly three months with little or no access to the global internet[^3].

## Traffic jumped once Iran reopened

The Tor WebTunnel bridge our community runs sits in the background, helping people who cannot reach Tor get around censorship and connect. In the two days after Iran reopened, connections through that node jumped noticeably, with traffic well above its usual level. Seeing the traffic return was a relief, because it meant people were getting back online.

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/iran-blackout-webtunnel-cf.png" target="_blank">
        <img src="https://assets.anoni.net/blog/iran-blackout-webtunnel-cf.png"
            alt="Traffic chart for the community-run Tor WebTunnel bridge, showing connections jumping well above their usual level after Iran reopened"
            title="Traffic through the community WebTunnel bridge, jumping after Iran reopened"
            class="brand-frame">
    </a>
    <figcaption>Traffic through the community-run Tor WebTunnel bridge. Connections jumped clearly once Iran reopened.</figcaption>
</figure>

During the blackout, people there couldn't even reach Tor, because the entire outbound link was down. Once connectivity returned, many rushed to find out what had happened while they were cut off and to reconnect with family they had lost touch with. Journalists needed to get local news out, civil-society groups needed to coordinate with the outside, and all of that means reaching sites and services that have long been blocked. Getting around the censorship usually means Tor, and where Tor itself is blocked, it means bridges run by volunteers around the world. When people connected to Tor through a bridge, some of those connections came through the node our community hosts (the community also runs a node in Singapore, which didn't receive traffic this time).

Looking at the source networks behind the connections to this bridge, the top five are all major Iranian carriers, confirming the traffic really is coming from ordinary users on the ground there.

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/iran-asn.png" target="_blank">
        <img src="https://assets.anoni.net/blog/iran-asn.png"
            alt="Cloudflare dashboard source-ASN list: the top five source networks for the WebTunnel bridge are all Iranian carriers, led by MCI Mobile Communication at 144.7 GB, then TCI, Irancell, Aria Shatel, and Pasargad"
            title="Source ASNs for the WebTunnel bridge: the top five are all major Iranian carriers"
            class="brand-frame">
    </a>
    <figcaption>Source ASNs for connections to the WebTunnel bridge (Cloudflare dashboard). The top five are all major Iranian carriers: Mobile Communication Company of Iran (MCI), Iran Telecommunication Company (TCI), Irancell, Aria Shatel, and Pasargad, confirming the traffic comes from users inside Iran.</figcaption>
</figure>

The traffic didn't fade after those first two days. Connections have kept coming through this bridge since. According to monitors like NetBlocks, Iran's recovery is incomplete: mobile networks were still down for a stretch while home Wi-Fi came back first, blocks on major social platforms remain in place, and in some cases are tighter than before the shutdown, so reaching ordinary sites abroad often still requires tools like a VPN[^3][^4]. For many people, even with the internet "reopened," reaching the outside still means routing around a lot of blocking, and our WebTunnel bridge is one of those ways around.

With traffic still flowing through it day after day, a handful of bridges is clearly not enough. So we'd like to invite more people who are able to run bridges, in more places, so that more people who need to reach the outside can get through.

!!! info "Need a connection? Write to us"

    The community currently runs one Tor WebTunnel bridge each in Taiwan and Singapore. To keep censors from simply blocking the addresses, these bridge lines aren't posted publicly. If you or someone you know needs one, you're welcome to email <whisper@anoni.net> to request it (other ways to reach us are on the [contact page](../../contact.md)).

## Why WebTunnel

<figure markdown="span">
    <a href="https://assets.anoni.net/blog/iran-webtunnel.png" target="_blank">
        <img src="https://assets.anoni.net/blog/iran-webtunnel.png"
            alt="Diagram of WebTunnel: Tor traffic wrapped inside an ordinary HTTPS connection so it looks like normal web browsing and slips past censorship"
            title="WebTunnel disguises Tor traffic as an ordinary HTTPS connection"
            class="brand-frame">
    </a>
    <figcaption>WebTunnel wraps Tor traffic inside an ordinary HTTPS connection, so to a censor it looks like normal web browsing (illustration).</figcaption>
</figure>

Tor has several kinds of bridges, and they differ in how hard they are for a censor to block.

[Snowflake](https://snowflake.torproject.org/){target="_blank"} has the lowest barrier: open a browser tab and you're helping people connect, no server required, anyone can start in seconds, and it's useful in most censored places. It runs over WebRTC (the real-time connection technology browsers use for video calls), and that traffic doesn't quite look like normal web browsing, so in the most aggressively filtered environments it can be easier to spot. Another bridge type, obfs4, turns the traffic into a blob of patternless noise, but censorship systems using deep packet inspection (DPI, which analyzes connections one by one to decide what to allow) can still flag it as not-normal browsing and drop it.

WebTunnel takes a different approach: it wraps Tor traffic inside a genuine HTTPS connection (the kind with the padlock and the `https` prefix in your browser's address bar). To a censor, connecting to a WebTunnel bridge looks no different from visiting an ordinary website. To block it, they'd have to block large numbers of legitimate HTTPS sites along with it, a cost that censors usually won't pay. That makes WebTunnel one of the strongest bridges against this kind of filtering, and it's already in real use in China and Russia.

Iran's case this time was more extreme: the entire outbound link was severed, and during a full blackout no bridge can function at all. Bridges only become useful again once connectivity returns and the country is back to its everyday filtering. Iran's filtering is also trickier than China's or Russia's, since it uses a protocol allowlist that only lets specific kinds of connections through, and WebTunnel wasn't easy to run there at first.

As Tor moved to distributing bridges over Telegram and volunteers grew the number of nodes, from 2025 onward Tor has observed more and more Iranian users successfully reaching Tor over WebTunnel[^5], which lines up with what our community node saw after the reopening. Over the same period, Snowflake has been especially useful in Iran, with Tor describing it as one of the best connection tools available there[^6]. For internet freedom in Iran, both WebTunnel and Snowflake are working routes, and both welcome more people to join in.

## Run one from your region

Anywhere with free, well-connected outbound access is a good place to host a bridge. Censors keep blocking the bridge IPs they already know about, so the more WebTunnel bridges there are spread across different countries and different network providers, the more entry points people on the ground can use. Every additional node, in one more country, is one more way in that hasn't been blocked yet.

The barrier really isn't high:

- A small VPS with 512MB to 1GB of memory is enough to run one, with lower cost and less upkeep than a [Tor relay](https://community.torproject.org/relay/){target="_blank"}.
- You need a domain (or subdomain) and a TLS certificate (the certificate that lets a site use a secure `https` connection), which you can get for free from Let's Encrypt.
- The legal risk is low. A bridge is only a relay point; it never connects directly to the website a user ultimately visits. The destination site sees an exit from the Tor network, not your server, which makes it far safer than running a Tor exit node.

We've written up the whole process, from preparing a domain and getting a certificate to standing the bridge up, plus the firewall, cover page, monitoring, and ongoing operations:

- :material-tunnel-outline: [**How to set up a Tor WebTunnel bridge**](../../community/setup-tor-webtunnel.md)

If running a WebTunnel bridge isn't an option for you, you can still open a browser and run [Snowflake](https://snowflake.torproject.org/){target="_blank"}: leave the tab open and it contributes anonymous traffic, helping people who can't reach Tor get around censorship. When you're ready to commit a server, come back and set up a WebTunnel.

## Not just Iran

Iran's shutdown was extreme, but censorship and shutdowns aren't a distant exception. Myanmar, Belarus, and China sustain heavy filtering year-round, and every regional conflict, election, or protest tends to come with a tightening of the network. Hong Kong has gone from a fairly open internet to seeing national-security-law site blocking in recent years. Earthquakes and undersea-cable cuts can disrupt a region's outbound connectivity too. Helping people elsewhere get around censorship today is also how a community builds the experience of running and maintaining anonymity infrastructure for when it's needed closer to home.

One node doesn't change much, but many nodes spread across the world add up to a network a censor can't pull down all at once. If you have a spare VPS or physical machine, a domain, and a little time, we'd love for you to help stand up more bridges, wherever you are.

Community discussion happens on [Matrix](../../contact.md) (home server `im.anoni.net`); how to join and other ways to reach us are on that page.

## Related reading

- [How to set up a Tor WebTunnel bridge](../../community/setup-tor-webtunnel.md)
- [Snowflake (Tor Project)](https://snowflake.torproject.org/){target="_blank"}
- [Set up a Tor relay (Tor Project)](https://community.torproject.org/relay/){target="_blank"}
- [Why internet freedom matters](../../basics/internet-freedom.md)
- [Tor relay observation in Taiwan](../../regional/tor-relay-watcher.md)

[^1]: [Cloudflare Radar — Iran](https://radar.cloudflare.com/ir){target="_blank"} - Cloudflare Radar
[^2]: [Internet shutdown in Iran amid military actions](https://x.com/CloudflareRadar/status/2027709437981450502){target="_blank"} - Cloudflare Radar
[^3]: [Internet restored to tens of millions in Iran after three-month blackout](https://www.thenationalnews.com/news/mena/2026/05/27/internet-restored-to-tens-of-millions-in-iran-after-three-month-blackout/){target="_blank"} - The National
[^4]: [Iran's Internet restored for some after 88 days of blackout](https://www.upi.com/Top_News/World-News/2026/05/26/iran-internet-restored-88-days/9231779817270/){target="_blank"} - UPI
[^5]: [Staying ahead of censors in 2025: What we've learned from fighting censorship in Iran and Russia](https://blog.torproject.org/staying-ahead-of-censors-2025/){target="_blank"} - The Tor Project
[^6]: [How Iranians are overcoming unprecedented internet censorship](https://www.techradar.com/vpn/vpn-privacy-security/iranians-are-resilient-they-always-find-ways-to-speak-how-iranians-are-overcoming-unprecedented-internet-censorship){target="_blank"} - TechRadar
