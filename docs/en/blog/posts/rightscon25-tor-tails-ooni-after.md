---
date: 2025-03-09
authors:
    - toomore
categories:
    - event
    - Community
slug: rightscon25-tor-tails-ooni-after
image: "assets/images/tor-tails-workshop-slide.webp"
summary: "Summary and recap of the events on 2025/02/23, including the Tor/Tails and OONI workshops and Roger's lecture."
description: "Summary and recap of the events on 2025/02/23, including the Tor/Tails and OONI workshops and Roger's lecture."
---

# Review: Internet Freedom Workshop: Tor、Tails、OONI

[The Tor/Tails and OONI workshops](./rightscon25-pre-event.md) successfully concluded on the afternoon and evening of February 23, 2025. Whether you participated in the entire event or not, we sincerely thank all the partners, volunteers, and the Tor and OONI teams for their involvement! To review the day's events, we have prepared a brief summary and the event presentation for your reference.

Event Agenda:

1. Workshop 14:00 – 17:30 Circumventing censorship and navigating anonymously with Tor
    - Raya, Education Coordinator @ The Tor Project
    - Gus, Community Team Lead @ The Tor Project
2. Workshop 18:00 – 19:00 Detecting and Measuring Internet Censorship with OONI
    - Elizaveta Yachmeneva, Research & Community Coordinator @ OONI
    - Maria Xynou, Director of Strategic Engagement @ OONI
3. Lecture 19:30 – 21:00 Tor: Defending your online privacy in a surveillance world
    - Roger Dingledine, Co-founder of The Tor Project

<!-- more -->

## Tor/Tails Workshop

![Tor/Tails Workshop](./assets/images/tor-tails-workshop-slide.webp){ style="border-radius: 5px; border: 1px solid #cdcdcd;" }

[Presentation Download (Google Slides)](https://docs.google.com/presentation/d/1UriBLwNR_DU5XuGufTS3RpI5CjEpjRzSFa-hhpkWaoE/edit?usp=sharing){ .md-button target="_blank" }

### Why You Need a Second Device

Due to budget constraints and user habits, personal and work tasks are often mixed on commonly used devices. Handling sensitive information for work and everyday personal use on the same device while neglecting cybersecurity measures can pose significant risks of data leakage. Therefore, using a second device for work or other critical tasks can be a better choice.

Commonly neglected cybersecurity threats include: malicious software or spyware that can exploit known or undisclosed vulnerabilities and malicious links to install tracking or backdoor control on the device.

### What is Tails?

Tails is an operating system that can be installed on a USB stick to boot on laptops or desktop computers. Unlike regular operating systems, each startup provides a fresh and clean environment, which can be used offline. If you want to connect to the internet, it is mandatory to use Tor's onion routing for anonymous browsing.

The Tails project was initiated in 2009 and [merged](https://blog.torproject.org/tor-tails-join-forces/){target="_blank"} into a sub-project of the Tor Project in 2024, sharing development and community resources.

Although Tails provides a new environment at each startup, it also offers an encrypted storage space for convenience. This can be mounted at startup, allowing data to be accessed and edited, even after the environment is restored to its original state.

Tails includes many security-focused open-source software applications that are ready to use once you start Tails (useful in completely offline scenarios). Due to its [security by design](https://en.wikipedia.org/wiki/Security_by_design){target="_blank"} approach, some commonly used software may not be immediately available in Tails. The team is working to adjust or adopt other technologies to meet anonymity and incognito requirements.

Tails does have some limitations. It cannot be used on some newer Mac computers (primarily due to ARM processors), the Tor network can be slightly slow, and it does not currently support commonly used [messaging software](https://tails.net/support/faq/index.en.html#messaging){target="_blank"} (WhatsApp, Telegram, Signal). Therefore, consider using Tails when you require strong protection in specific scenarios.

### What is Tor?

Since Tails integrates the [Tor Onion Routing](https://en.wikipedia.org/wiki/Tor_(anonymity_network)){target="_blank"}, all connections are forced through Tor to connect to the internet. Before knowing about Tor, we might have used VPNs to browse the internet. However, unlike Tor, VPNs only encrypt the data during transmission. The VPN service provider knows who you are, where you connect from, and where you're connecting to. They can also potentially identify you through payment information used when purchasing the service.

Tor, on the other hand, uses three nodes (Tor Relays) and encrypts data three times, with each relay only knowing part of your information. Since Tor Relays are established by volunteers worldwide, their decentralized and diverse nature makes it difficult to piece together a complete picture of you, thereby achieving a connection framework built on [Privacy by Design](https://en.wikipedia.org/wiki/Privacy_by_design){target="_blank"}.

### Tor Browser

The default browser in Tails is the [Tor Browser](https://www.torproject.org/){target="_blank"}, which focuses on blocking ads and tracking technologies. The Tor Browser doesn't make you invisible but instead makes you blend in with others by anonymizing your browsing activities among the vast data sets. The Tor Browser is based on Firefox and is an open-source software product.

### Using Tails

!!! warning "Download and Install USB Stick"

    Due to network bandwidth constraints at the event venue, the steps for downloading the image and creating a Tails USB stick are skipped, and participants will use pre-installed USB sticks instead. Creating the USB stick is not difficult and you can refer to the [installation guide](https://tails.net/install/index.en.html){target="_blank"} on the official website.

In the second half of the Tor/Tails workshop, around 30 USB sticks will be available for participants to use on their own laptops after rebooting. The first challenge participants usually face is how to set their laptops to boot from a USB stick. Depending on the brand of the computer, pressing F2 or F12 upon startup will allow you to choose to boot from USB.

!!! info "Content You Might Be Interested In"

    1. Tor Project and Tails Join Forces: <https://blog.torproject.org/tor-tails-join-forces/>{target="_blank"}
    2. [Arti Project](https://gitlab.torproject.org/tpo/core/arti){target="_blank"}, a project to reimplement Tor in the memory-safe Rust language.
    3. Google Summer of Code 2025: <https://blog.torproject.org/tor-in-google-summer-of-code-mentorship/>{target="_blank"}`

## OONI Workshop

![OONI Workshop Presentation](./assets/images/ooni-run-v2.webp){ style="border-radius: 5px;" }

[Download Presentation (Google Slides)](https://docs.google.com/presentation/d/1KkjhtBevT5oFCNI487PK2gCZ4tXL5wTMbzxZnjj2Nro/edit?usp=sharing){ .md-button target="_blank" }

[OONI](https://ooni.org/){target="_blank"} is a tool used to detect whether networks are subject to surveillance and censorship. In certain regions, network blockades using DNS or IP blocking methods result in some types of websites or services becoming inaccessible. By using OONI Probe to conduct tests and upload observation data in real-time, it is possible to map out the network blocking situation in the area.

This workshop demonstrated how to use [OONI Run](https://run.ooni.org/){target="_blank"}. Like OONI Probe, OONI Run is also a tool for detecting network conditions. The main difference is that OONI Run allows users to customize the list of websites to be tested and share it with anyone worldwide to assist with testing. Although OONI Probe has a predefined testing list, the process for updating and deploying it cannot be adjusted in real-time. OONI Run offers the flexibility to quickly test with a customizable list.

When creating a new list in OONI Run, users can also specify an associated number (Link ID), which allows them to quickly search for related test data on OONI Explorer and use simple charts to identify the current network conditions.

[![OONI Link ID 10137](./assets/images/ooni-link-id-10137.webp){style="border-radius: 5px; border: 1px solid #cdcdcd;"}](https://explorer.ooni.org/search?since=2025-02-23&until=2025-02-24&test_name=web_connectivity&failure=true&ooni_run_link_id=10137){target="_blank"}

!!! info "Content You Might Be Interested In"

    1. [What is OONI?](../../what-is-ooni.md){target="_blank"}
    2. OONI Run Link ID created on the event day is [10137](https://explorer.ooni.org/chart/mat?since=2025-02-22&until=2025-03-07&time_grain=day&axis_x=measurement_start_day&test_name=web_connectivity&ooni_run_link_id=10137){target="_blank"}. You can quickly understand the network situation through [crowd-assisted testing](https://explorer.ooni.org/search?since=2025-02-23&until=2025-02-24&test_name=web_connectivity&failure=true&ooni_run_link_id=10137){target="_blank"}.
    3. [Probe Security Without Identification, Michele Orrù, 2025-02-20](https://ooni.org/post/2025-probe-security-without-identification/){target="_blank"}: As OONI probes enhance network situation assessment, risks such as intentional or unintentional uploading of incorrect observation data by users could impact the credibility of OONI's observations. The article discusses how attackers may use fake data to pollute OONI's observation database to undermine platform trust, emphasizing transparency and exposing digital rights violations.
    4. 2024 OONI Review: <https://ooni.org/post/2024-year-in-review/>{target="_blank"}
    5. [Taiwan ASNs Overview in OONI Observational Data (2023/12)](../../ooni-asns-coverage.md){target="_blank"}

## Roger's Talk

![Roger's Talk Presentation Cover](./assets/images/slides-kaist25.pdf.webp){ style="border-radius: 5px; border: 1px solid #cdcdcd;" }

[Download Presentation (PDF)](https://gitlab.torproject.org/ahf/onion-tex/-/blob/main/src/pandoc/arma-kaist-2025/slides-kaist25.pdf){ .md-button target="_blank" }

This talk featured Roger, the founder of the Tor Project, sharing insights on the state of internet freedom and Tor's efforts in protecting user privacy. Below are the key points from the presentation.

1. Importance of Diversity: He emphasized that part of security comes from the diversity of online services and the diversity in how users access the internet. Roger explained that with tools like Tor, different people (such as regular users and political dissidents) can use online services on the same platform without making specific groups targets. Additionally, the diverse purposes of download (like accessing blocked websites) enable varied uses and provide a layer of protection against easy identification and attack of specific uses.

2. User Privacy Protection: Tor's goal is to let users decide who can access their data and communication metadata, preventing intentional collection and user identification.

3. Awareness of Technology Misuse: He discussed how technology can sometimes be misused or misunderstood, often due to stereotypes about the dark web presented in movies, highlighting the need to address and improve these perceptions.

Future Areas of Focus:

1. Privacy Regulations and Technological Advancements: Monitor changes in global privacy regulations and technological progress to understand how to protect individual online privacy.

2. Net Neutrality: Ensure that different types of content and technological applications can be freely accessed on the internet.

3. Education and Advocacy: Raise awareness among the public and policy makers about the importance of internet freedom and privacy protection.

Actions We Can Take:

- Transformative actions include promoting the use of internet anonymity tools, educating users on personal privacy protection, and supporting or participating in related policy advocacy efforts to advance reasonable internet freedom policies.

!!! info "Content You Might Be Interested In"

    1. During the talk, Roger also mentioned different ways to connect to Tor, with [Snowflake](https://snowflake.torproject.org/){target="_blank"} allowing connections disguised as streaming to assist Tor users. Snowflake is the easiest and most convenient way to contribute bandwidth to Tor, requiring only the installation and activation of a browser extension.
    2. [Tor University Challenge - Electronic Frontier Foundation](https://toruniversity.eff.org/administrators/){target="_blank"}: Initiated by the EFF, the "Tor University Challenge" aims to encourage more universities to run Tor relays to enhance Tor network stability and resistance to censorship. The website provides various resources to assist university administrators and technical teams in setting up and managing Tor relays, supporting efforts for internet freedom and anti-censorship.

---

!!! note "Future Plans "

    The Anoni.net will continue promoting the use of Tor/Tails and OONI in Taiwan, working on issues of internet freedom and censorship. If you're interested in participating or want to continue receiving our updates, please refer to the "[Stay Informed](../../contact.md)" section for how to join. We plan to hold Tor/Tails and OONI workshops at the COSCUP event in August 2025, conducted in **Mandarin**, with assistants to help participants (tentatively). Before the event, we will need to edit training materials, provide training, and make necessary preparations. If you are interested in participating in this event, please refer to the contact information in the "[Stay Informed](../../contact.md)" section to let us know.
