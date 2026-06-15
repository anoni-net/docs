---
date: 2025-12-30
authors:
    - anoni-net
categories:
    - News
    - Community
slug: ntnu-nz
image: "assets/images/post-update.png"
summary: "How can a computer science student, within the academic network system, make an anonymous network truly go live and operate?"
description: "How can a computer science student, within the academic network system, make an anonymous network truly go live and operate?"
---

# Setting Up a Tor Relay at National Taiwan Normal University: A Practical Experience of Communicating with the University and Leaving Open Possibilities

## Preface: Why Talk About Anonymous Networks on Campus?

In an era where the internet is highly monitored and centrally managed, anonymous communication has become a fundamental requirement for safe exploration, research, and expression. For Taiwan, this issue is especially tangible. Situated at a critical position in East Asia, internet freedom and communication resilience are core societal capabilities that get tested by real-world conditions.

Universities and academic networks have historically been the earliest places where new technologies and public infrastructure are experimented with. The following interview documents how a computer science student at National Taiwan Normal University, also a member of the anonymous network community, stepped into institutional reality on campus, communicated with the university, and attempted to actually set up a Tor Relay.

Within the anonymous network community, we often talk about technology and ideals. But the truly difficult question is often whether “this machine can survive in the real world.” Configuring the Tor Relay itself is comparatively straightforward.

This time, we interviewed a partner from the anonymous network community, NZ, who is currently studying in the Department of Computer Science at [National Taiwan Normal University](https://www.ntnu.edu.tw/){target="_blank"}. He successfully set up a Tor Relay on campus, **choosing to engage openly with the university system and complete the full administrative process, without going behind anyone's back**.

!!! info ""

    ![NZ Su En-Li](https://assets.anoni.net/blog/nz.jpg){ align=left width="30%" style="border-radius: 5px;"}

    **蘇恩立 (Su En-Li, NZ)** is currently a third-year undergraduate student in the Department of Computer Science and Information Engineering at National Taiwan Normal University. With a strong interest in information security and network governance, he is currently responsible for operating and maintaining the [first Tor node on Taiwan Academic Network (TANet)](https://metrics.torproject.org/rs.html#search/as:AS1659){target="_blank"}. In addition to hands-on technical practice, he is also dedicated to knowledge sharing, serving as an anonymous network course instructor in the GDGoC NTNU student club. He has long been involved in Taiwan’s open source and information security communities, and has volunteered multiple times at major technical conferences such as SITCON, HITCON, and COSCUP, demonstrating both community service experience and strong technical passion.

<!-- more -->

## Why Set Up a Tor Relay at a University?

His motivation was actually quite simple: if anonymous networks in Taiwan only ever exist within niche communities, on overseas VPSs, or are treated as tools in a legal or moral gray area, then they are unlikely to be taken seriously. Universities—especially academic networks like TANet—are inherently meant to support research, experimentation, and public interest. In theory, they should be able to accommodate attempts to deploy this kind of foundational infrastructure.

That said, he was also fully aware of the real-world constraints. Taiwan’s academic network is highly centralized, with outbound connectivity controlled by the Ministry of Education. Within such a structure, anonymous networks are inherently constrained and unable to realize their full potential.

But precisely because of these limitations, he wanted to find out: **“Under such constraints, can it at least exist?”**

## How Did He Talk to the University? The Key Wasn’t Persuasion, but Giving Them Something They Could Account For

<figure markdown="span">
  ![Project Proposal Document](https://assets.anoni.net/blog/nz-ntnu-4.png){ style="border-radius: 5px; border: 1px solid #999; width: 70%;" }<figcaption>Administrative Process Timeline</figcaption>
</figure>

When it came to taking action, he explained Tor in terms the university could understand, avoiding any framing that would make it sound “cool” or radical:

- This is a Tor **Relay**, not an Exit Node
- It does not directly provide content to external users
- It is an experiment in network infrastructure and anonymous communication

Process-wise, he engaged in actual email exchanges with network administrators, professors, and the department chair, ensuring that everyone who needed to sign off (or be “CC’d”) understood exactly what this machine was doing. The university’s stance landed on a single line: “if the Ministry of Education asks us about this, we need to be able to explain it.” It did not require them to fully understand Tor, and that became the entry point for communication.

## The Administrative Process Is Truly a Hassle, but Not a Dead End

<figure markdown="span">
  ![Administrative Process](https://assets.anoni.net/blog/nz-ntnu-3.png){ style="border-radius: 5px; border: 1px solid #999; width: 70%;" }<figcaption>Project Proposal Document</figcaption>
</figure>

At National Taiwan Normal University, all outbound connections are blocked by default. Any service requires applying for an exception, including specifying IP addresses, intended use, and supporting documentation, and ultimately ensuring it aligns with the university’s reporting procedures to the Ministry of Education. He described this process as “annoying, but predictable.”

As long as one is willing to write the paperwork and explain things clearly, this path does exist.

## Student Organizations and Outreach: Helping Tor Step Out of Its Label on Campus

<figure markdown="span">
  ![Student Organizations and Outreach](https://assets.anoni.net/blog/nz-ntnu-2.png){ style="border-radius: 5px; border: 1px solid #999;" }<figcaption>Student Organization Event: Anonymous Network Workshop</figcaption>
</figure>

Beyond the machine itself, he also organized anonymous network–related activities through student clubs on campus, introducing Tor, anonymous communication, and the design principles behind them. Even if participation wasn’t always large, it at least created space on campus to clearly explain that **“anonymous networks ≠ criminal tools,”** and to step beyond the usual stereotypes.

These accumulated efforts may not be highly visible, but they are important.

## Practical Advice and Pitfalls for Others

The following points are distilled from this experience, intended as a reference for anyone who wants to promote or deploy a Tor Relay on a university campus in the future.

### Actionable Advice

- Take the public route from the start: don’t wait until something goes wrong to explain—let network administrators and supervising professors know what you are doing early on.
- Clearly distinguish between a Tor Relay and an Exit Node: this is almost always the deciding factor in whether communication succeeds, so be explicit about the difference in risk.
- Explain things in a way the university can “account for”: the goal is to make sure they can answer questions when asked; you don’t need to win faculty over to anonymous network advocacy.
- Expect a lot of paperwork: IP addresses, outbound connectivity, and usage descriptions are all basic requirements.

### Common Pitfalls

- Assuming technical correctness is enough: within academic networks, institutional processes often determine success or failure before technology does.
- Underestimating the Ministry of Education’s level of control: most universities block outbound connections by default, and any exceptions must align with formal reporting procedures.
- Failing to plan for maintenance and account ownership: account privileges after graduation directly affect whether long-term operation is possible.

## Conclusion

This attempt to deploy a Tor Relay at National Taiwan Normal University is just one step in an ongoing process. It does not aim to define an endpoint, and it was never meant to become a standard answer. But it does prove at least one thing:

- Within Taiwanese universities, as long as one is willing to communicate and explain,
- Anonymous networks can still find a place to exist.

If we hope to see Tor Relays on more campuses in the future, these “uncool but time-consuming” efforts may well be the most important foundation of all.

!!! question "Further Reflection: Why Are Attempts Like This Worth Preserving?"

    After reading this interview, it is easy to focus on **“what he accomplished.”** But for the anonymous network community, what is truly worth recording is **how this was accomplished**.

    In Taiwan, anonymous networks do not lack technical documentation or ideological support. What is truly scarce are experiences of **“having walked through the real institutional system once.”** Especially in an environment where academic networks are highly centralized and outbound connectivity is tightly controlled, distributed anonymous infrastructure like Tor Relays is inherently difficult to sustain.

    This implementation at National Taiwan Normal University was a concrete attempt made within real-world institutions; its purpose was never to provide a final answer for anonymous networks. It may not immediately improve the performance or security of anonymous networks, and it may not transfer directly into a reproducible standard process, but it did leave behind a clearly visible path of practice: one that can be understood, referenced, and built upon.

    This path shows us that:

    - Anonymous networks can have a legitimate, public place on Taiwanese campuses
    - Campuses can be engaged in dialogue, as long as someone is willing to explain things properly
    - Administrative procedures are cumbersome, but they can actually be navigated through
    - Beyond technology, language, patience, and institutional understanding are equally important

    For Taiwan, the advancement of anonymous networks often emerges from the accumulation of these seemingly slow, tedious, and even somewhat clumsy attempts. A “killer application” is unlikely to be the starting point at all.

    If, in the future, we hope to see Tor Relays or other anonymous communication infrastructure across more universities and academic network nodes, then these early experiences—whether successful or obstructed—are all worth recording, discussing, and passing on.

    The existence of anonymous networks is the outcome of communities engaging in long-term communication, mutual understanding, and collaboration; individual actions are only one part of that. Through such processes, internet freedom can move from an abstract concept to a public infrastructure that can truly be put into practice.

!!! info "Tor × EFF University Challenge: Make Your Campus Part of the Anonymous Network"

    The [Tor Project](https://www.torproject.org/){target="_blank"} and the [Electronic Frontier Foundation (EFF)](https://www.eff.org/){target="_blank"} jointly run the **Tor University Challenge**, inviting university students around the world to set up Tor Relays on their campuses using academic networks. By successfully deploying and maintaining a Tor Relay within a university network, participating institutions can have their university names listed on the project’s official website—showing the world that their campus is actively contributing to the infrastructure of anonymous communication and internet freedom.

    This is both a technical challenge and a symbolic act: **it represents a university’s willingness to support the practice of privacy, anonymity, and an open internet within the realms of education and research.** In the National Taiwan Normal University case discussed here, we have already seen that **as long as there is a willingness to communicate and understand institutional constraints, Tor Relays do have a chance to exist on Taiwanese campuses.**

    If you are currently a university student with an interest in networking, cybersecurity, privacy, or public infrastructure, the Tor University Challenge offers a concrete and documentable starting point: **let your actions extend beyond your own computer and be seen by the world.**

    :point_right: Project website: <https://toruniversity.eff.org>{target="_blank"}

!!! info "The Role of Tor Relays in Academic Networks"

    Many people have heard of Tor, but do not necessarily understand its significance within **academic networks**.

    ??? question "What Is a Tor Relay?"

        Tor is an anonymous communication network that routes traffic through multiple nodes using layered encryption. A **Tor Relay** (middle relay) helps forward encrypted traffic and, by design, cannot see either the user’s source or the final destination.

        It functions purely as a traffic relay; it does not host content and does not act as an exit node.

    ??? question "Why Are Academic Networks Suitable for Discussing Tor Relays?"

        - Academic networks are inherently meant to support experimentation
        - Universities carry public responsibility and research legitimacy
        - Experience can be accumulated in a controlled environment, without having to rely solely on overseas resources

        At the same time, Taiwan’s academic network is highly centralized and externally controlled, which makes Tor’s presence here more like a “compressed experiment.”

    ??? question "Why Is It Still Worth Doing Even If the Impact Is Limited?"

        Because beyond performance, the work also helps to:

        - Leave behind an institutionally “viable path”
        - Accumulate experience in communicating with universities
        - Bring anonymous networks into public discussion, moving them out of underground territory and into open conversation
