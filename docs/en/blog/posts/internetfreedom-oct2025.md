---
date: 2025-10-18
authors:
    - toomore
categories:
    - event
slug: internetfreedom-oct2025
image: "assets/images/post-update.png"
summary: "Quick Recap: What Actions Can We Take Against State-Level Surveillance?"
description: "Quick Recap: What Actions Can We Take Against State-Level Surveillance?"
---

# Taipei Coffee and Circumvention Meetup 2025/10

<figure markdown="span">
  ![Taipei Coffee and Circumvention Meetup 2025/10](https://assets.kktix.io/upload_images/244247/%E7%B6%B2%E8%B7%AF%E8%87%AA%E7%94%B1%E5%B0%8F%E8%81%9A_large.png){ style="border-radius: 10px;" }
  <figcaption>Image credited to Taipei Coffee and Circumvention Meetup 2025/10 https://ocftw.kktix.cc/events/internetfreedom-oct2025</figcaption>
</figure>

After presenting InterSecLab's [report](https://interseclab.org/research/the-internet-coup/){target="_blank"} on data leakage related to the Great Firewall of China at the "[Taipei Coffee and Circumvention Meetup 2025/10](https://ocftw.kktix.cc/events/internetfreedom-oct2025){target="_blank"}," there were many discussions during the latter part of the event. The questions centered around what actions we can ultimately take in the face of state-level surveillance methods and capabilities.

The previously provided cybersecurity recommendations also need to be revisited and revised. Below, we will review some of the topics discussed that day through text. We also recommend taking some time to read this report, as it will provide a clearer outline of the risks and challenges we are facing.

<!-- more -->

## Abuse of Open Source Software

The report found that some software used in the Great Firewall is built upon or modified from existing open source software. This raises a concern: many engineers contribute to open source projects in their fields, only to see their work misused by certain organizations **that completely disregard open source licensing guidelines**. Although these guidelines may lack substantial enforcement power, when contributions are used for privacy surveillance, we currently lack measures to resist or respond. When the misuse of open-source software escalates to a national level, how can we balance and hold accountable such actions?

During the discussion that evening, we did not arrive at an answer. **In the pursuit of internet freedom and democratic liberties**, we may have to temporarily attribute this situation to the neutrality of tools, a scenario that resembles the use of Tor and onion networks.

## WebTunnel, Which the Great Firewall Struggles to Effectively Block

The report mentions that while common VPN protocols can be identified and blocked, the Great Firewall currently cannot effectively block WebTunnel, a type of Tor bridge. Since the data leak occurred around December 2024, it remains uncertain whether, after 10 months, the Great Firewall's technology still cannot block it. Similarly, Snowflake, which disguises Tor connections through streaming, can also evade packet detection.

During the event that evening, we quickly introduced [Snowflake](../../tor-snowflake.md){target="_blank"} to everyone. By using a browser extension, you can create a Tor bridge by establishing a stream similar to a video conference. This helps users in regions where Tor is completely inaccessible connect to the onion network through your bridge relay. For participants with technical capabilities, we also suggested setting up a bridge relay using the Tor-official [WebTunnel (Docker image)](https://community.torproject.org/relay/setup/webtunnel/docker/){target="_blank"}. This setup mimics browsing a website, thereby providing a bridge relay point.

## Taking Action

During the evening discussion, we explored whether we should take "**proactive**" measures. Given the known surveillance and repressive actions by some authoritarian governments, should we actively seek to change the current situation? Of course, after the initial surge of emotions, we realized that the issues we face might **not be as simple as** correcting a code deployment error or rebooting a server. When factoring in the defense of human rights, we might be confronted **with real-world dangers and threats to our lives**. At that moment, a brief pause allowed participants to reflect on the risks and assess **how determined we are to take action**.

To slightly ease the heavy atmosphere of the topic, we shared InterSecLab's next steps. They aim to recruit partners interested in **code analysis and research**. The report mentioned that a significant portion of the leaked data remains unexplored and unanalyzed. Moreover, in the countries where the Great Firewall technology has been exported, an entity code-named A24 has yet to be identified. Perhaps efforts from various professional fields can become a powerful form of resistance against authoritarian regimes!

---

This is a quick recap of the "Taipei Coffee and Circumvention Meetup 2025/10" event. We also extend our gratitude to the [Open Culture Foundation](https://ocf.tw/en/){target="_blank"}（開放文化基金會） for the invitation, providing the "[Anonymous Network Community](../../about/index.md)" an opportunity to share. If you haven’t read our **translated report** yet, you can access it [here](https://anoni.net/docs/report/interseclab-the-internet-coup/){target="_blank"}! We are also preparing to develop user-friendly defensive capabilities based on the report's findings, possibly starting with privacy protection. Interested individuals are welcome to join the discussion through [this channel](https://matrix.to/#/#interseclab-the-internet-coup:im.anoni.net){target="_blank"}.

Of course, you can also [email us](../../about/index.md) directly!
