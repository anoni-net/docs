---
title: Why does Internet Freedom matter?
description: How network censorship, surveillance, and platform pressure show up across Asia, and what OONI measurement and Tor can do in response.
icon: material/chat-question
---

# :material-chat-question: Why does Internet Freedom matter?

On this site, **internet freedom** means whether people can access information and speak out without undue interference, and whether they can choose tools and network paths they trust. It often comes up alongside anonymity, privacy, and circumvention, but the emphasis differs. See [What is an Anonymous Network?](./what-is-anonymous-network.md) for a side-by-side read.

State blocking and mass surveillance are part of the picture. So are cross-border platform rules, account enforcement, algorithmic reach, and data retention. Debates over defamation, national security, and information-governance laws in many places add institutional chilling effects. For readers in Taiwan, a relatively open connectivity environment still sits alongside heavy reliance on global platforms and sustained pressure on civil society, independent media, and advocates. All of this bears directly on how secure internet freedom really is.

The sections below sketch common patterns in East and Southeast Asia. News examples age quickly; pair them with [Freedom on the Net](https://freedomhouse.org/explore-the-map){target="_blank"} country pages and local reporting.

## East Asia

China's "Great Firewall[^1]" has long filtered many international sites and services, and domestic platforms face political, religious, and social censorship. North Korea keeps most residents off the global internet, with access limited to the state-controlled intranet "Kwangmyong[^2]."

Taiwan is often described as comparatively open in the region, yet it still faces questions about cross-border platform governance, information security, and political manipulation, alongside legal and public pressure on journalists and advocates. Scores and narratives shift with each survey year; see Freedom House's Taiwan profile[^10].

<figure markdown="span">
    <a href="https://freedomhouse.org/explore-the-map" target="_blank">
        <img src="../assets/images/freedom_house_explore_the_map.png"
            alt="Freedom House Freedom on the Net interactive map"
            title="Freedom House Freedom on the Net interactive map"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 100%);">
    </a>
    <capture>Freedom House "Freedom on the Net" map (country scores update with each annual report; screenshot is illustrative)</capture>
</figure>

## Southeast Asia

Vietnam has pressed international companies to remove content critical of the authorities[^3]. Indonesia has blocked or restricted certain classes of sites[^4]. Malaysia has blocked news sites and blogs, including outlets covering corruption[^5]. In the Philippines, elections and political stress have put news and social content under heavy scrutiny[^6]. Thailand's criminal provisions on royal insult have long shaped what can be said online[^7].

Since Myanmar's 2021 coup, repeated shutdowns, platform blocks, and crackdowns on independent media[^8][^9] show how severely networks can be weaponized under conflict and emergency rule.

## Measurement and anonymous connectivity

Public, verifiable records matter for documenting blocks and interference in the Asia-Pacific. [OONI](https://ooni.org/){target="_blank"} combines volunteer runs and probe data so reachability of sites and circumvention tools shows up in charts and open data. The screenshot below is a historical sample; for live charts and country filters, use [OONI Explorer](https://explorer.ooni.org/chart/circumvention?since=2025-07-01&until=2026-03-31&probe_cc=CN%2CHK%2CTW){target="_blank"}.

<figure markdown="span">
    <a href="https://explorer.ooni.org/chart/circumvention?since=2025-07-01&until=2026-03-31&probe_cc=CN%2CHK%2CTW" target="_blank">
        <img src="../assets/images/ooni_chart_circumvention.png"
            alt="OONI Explorer: circumvention tool measurements (CN, HK, TW sample)"
            title="OONI Explorer: circumvention tool measurements (CN, HK, TW sample)"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 100%);">
    </a>
    <capture>OONI Explorer: circumvention measurements (screenshot retained in-repo; ranges and data follow the live site)</capture>
</figure>

[Tor](https://www.torproject.org/){target="_blank"} uses layered routing and relays to help people stay anonymous and connected in high-risk environments, and running relays strengthens network resilience. Public relay and guard counts for Taiwan are listed on Tor Metrics.

<figure markdown="span">
    <a href="https://metrics.torproject.org/rs.html#search/country:tw" target="_blank">
        <img src="../assets/images/tor_relay_tw.png"
            alt="Tor Metrics: relays and guards in Taiwan"
            title="Tor Metrics: relays and guards in Taiwan"
            style="border-radius: 10px;border:1px solid hsl(0, 0%, 0%);">
    </a>
    <capture>Tor Metrics: relays and guards in Taiwan (view changes with the live network)</capture>
</figure>

Running OONI tests, operating Tor relays, or helping with translation and education all support internet freedom in concrete ways. Pick a starting point from the list below.

## :fontawesome-solid-diagram-project: Next steps

<div class="grid cards" markdown>

- [:material-chat-question: What is an Anonymous Network?](./what-is-anonymous-network.md)
- [:material-access-point-network: ASNs Observation Data Analysis](./ooni-asns-coverage.md)
- [:material-list-status: OONI Website Testing List](./ooni-weblists.md)
- [:material-translate-variant: L10n and Documentation Translation](./ooni-i18n.md)

</div>

[^1]: [University teams probe the Great Firewall at scale](https://www.thenewslens.com/article/153597){target="_blank"} (Chinese) - The News Lens. See also [Freedom House: China](https://freedomhouse.org/country/china/freedom-net/2024){target="_blank"}.
[^2]: [Reporting on surveillance expansion](https://global.udn.com/global_vision/story/8663/7970562){target="_blank"} (Chinese) - udn Global.
[^3]: [Amnesty International on Vietnam's internet controls](https://www.amnesty.tw/news/3805){target="_blank"} (Chinese).
[^4]: [Indonesia online rules coverage](https://www.thenewslens.com/article/164619){target="_blank"} (Chinese) - The News Lens. Verify current law against official sources.
[^5]: [Malaysia political crisis and media](https://zh.wikipedia.org/zh-tw/%E9%A9%AC%E6%9D%A5%E8%A5%BF%E4%BA%9A%E5%B1%80%E5%86%85%E4%BA%BA){target="_blank"} (Chinese Wikipedia).
[^6]: [Rappler and regulatory pressure](https://global.udn.com/global_vision/story/8663/6435){target="_blank"} (Chinese) - udn Global.
[^7]: [Thailand royal insult sentencing](https://udn.com/news/story/6812/7721452){target="_blank"} (Chinese) - UDN.
[^8]: [Myanmar: journalists sentenced](https://feja.org.tw/72219/){target="_blank"} (Chinese).
[^9]: [Shutdowns and censorship after the coup](https://lab.ocf.tw/2022/02/12/mymmar-block/){target="_blank"} (Chinese) - OCF Lab.
[^10]: [Freedom House: Taiwan (Freedom on the Net)](https://freedomhouse.org/country/taiwan/freedom-net/2024){target="_blank"} (URL updates with each report; if it breaks, start from the [map](https://freedomhouse.org/explore-the-map)).
