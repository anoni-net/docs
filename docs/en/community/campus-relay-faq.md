---
title: Campus Tor Relay, an FAQ for university administrators and legal counsel
description: The ten concerns IT centres, legal offices, and network administrators raise about running a Tor relay on campus, with suggested responses. Attach it to a proposal, or send it ahead of a meeting.
icon: material/chat-question-outline
---

# :material-chat-question-outline: Campus Tor Relay, an FAQ for university administrators and legal counsel

This FAQ collects the ten questions university IT centres, legal offices, and network administrators most often raise about running a Tor relay on campus. It derives from the [campus Tor relay proposal template](./campus-tor-relay-proposal.md), and works as an appendix to a proposal or as reading sent ahead of a meeting.

It differs from the operator-facing FAQ at the end of [how to run a Tor relay](./setup-tor-relay.md). This page assumes the reader is **university administration, legal counsel, or network operations**, so it focuses on institutional risk assessment and on how to answer when someone else asks.

The regional notes throughout come from the Taiwanese case, where the first campus relay went live in November 2025. The general answers apply anywhere. The Taiwan-specific parts are marked, and a proposer elsewhere should replace them with their own jurisdiction's equivalents.

## How to use it

- **With a proposal**: attach it as an appendix
- **Before a meeting**: send it to the IT centre, network operations, and legal counsel to read first
- **When asked**: open the relevant question and quote it
- **The two one-page summaries at the end**: 30-second versions, for the top of an email or as a handout

## The questions

??? question "Why is a university a good place for a Tor relay?"

    The reasons land on things a university can assess directly. Academic networks have stable bandwidth, and computer science departments and IT centres already have the people to deploy and operate one. It can start from the lowest-risk configuration, a non-exit relay, which never touches exit traffic and generates no complaints about outbound connections. The node can be stopped at any time, which makes it a reversible decision. The deployment and operation are themselves a teaching case in anonymity networks, security, and open source governance. For an institution that values academic freedom and access to information, it puts that commitment into infrastructure.

    **Regional note**

    Taiwan's first case is at the Computer Science and Information Engineering department of National Taiwan Normal University, live since November 2025. It is written up in a [guest post on the Tor Project blog](https://blog.torproject.org/setting-up-tor-university-relay-taiwan/){target="_blank"} and in a [community interview](../blog/posts/ntnu-nz.md).

??? question "We do not want to run an exit relay. Is that acceptable?"

    Entirely. The Tor network needs every type of relay to stay healthy. By default, a relay you deploy acts as a guard or middle relay, forwarding encrypted traffic between Tor nodes only. That is the lowest-maintenance form and it ensures you never face complaints.

    You can additionally run a bridge or a [Snowflake proxy](../tools/tor-snowflake.md) to help users in censored regions reach Tor.

    **Regional note**

    The Taiwanese campus case is a **non-exit relay**. Every campus relay project should start non-exit, and **should not attempt an exit relay**. The legal and administrative costs of an exit relay exceed what an individual or a student group can carry.

??? question "I am willing to run a relay but do not want to handle abuse. How does that work?"

    That is what exit policy is for. Every Tor relay has one, specifying which outbound connections are permitted or refused. The policy is published through the directory service, so Tor clients automatically avoid exit relays that would refuse their connections. Each relay decides which services, hosts, and networks it allows based on abuse risk and its own circumstances.

    The default exit policy permits many common services such as web browsing, while restricting higher-abuse-risk services such as mail, and services the Tor network cannot absorb such as the default file-sharing ports.

    If you permit any outbound connections, confirm that DNS resolution works correctly.

    **Regional note**

    For a campus deployment the simplest approach is `ExitPolicy reject *:*`, refusing all outbound connections. Abuse complaints then essentially do not occur, because no traffic exits through your relay. Keeping EFF's abuse response templates on hand is still sensible. The configuration is in the [campus Tor relay deployment SOP](./campus-tor-relay-sop.md).

??? question "Doesn't Tor help criminals?"

    Tor's mission is to advance human rights and to let people resist mass surveillance and censorship through free, open source technology. The Tor community condemns unlawful use of the tools.

    **Criminal intent belongs to people, not to tools.** Encryption, telephones, and cash are all used maliciously, and Tor is no different. Removing Tor moves malicious actors to other tools rather than stopping them.

    At the same time, Tor and other privacy tools protect the people who need them, including protection against identity theft and physical stalking, and they support law enforcement investigations and victims.

    **Regional note**

    Taiwan's Criminal Code articles 358 to 363, covering offences against computer use, address specific conduct such as entering someone else's credentials without authority or obtaining another person's electromagnetic records by improper means. **A middle relay does not touch content, does not parse user data, and does not know user identities**, which places it legally closer to network transmission infrastructure and outside the elements of those offences.

    Article 2 of the Personal Data Protection Act defines personal data as data by which an individual can be identified directly or indirectly. A middle relay handles encrypted Tor cells with **no identifying data**, so no personal data processing is involved.

    This is the community's reading rather than formal legal advice. For questions about a specific situation, consult a lawyer.

??? question "What about distributed denial of service attacks?"

    DDoS attacks generally rely on thousands of machines sending UDP packets simultaneously to saturate a victim's bandwidth.

    Tor carries only well-formed TCP connections rather than arbitrary IP packets. **It cannot send UDP packets and cannot perform attacks such as SYN floods.** The common DDoS techniques do not work through Tor.

    Tor also does not permit bandwidth amplification. What goes in is what comes out. An attacker with enough bandwidth to mount a DDoS has no reason to route it through Tor.

    **Regional note**

    No DDoS complaints against middle relays have been recorded from ISPs in Taiwan, and the case at National Taiwan Normal University has received none since going live in November 2025.

??? question "What about spam?"

    Tor's default exit policy refuses all SMTP traffic on port 25, so spam cannot be sent through Tor directly.

    A few relays may enable SMTP, which is no different from running an open mail server and is not a risk Tor creates. Spammers can also connect through Tor to an open HTTP proxy, exploit insecure CGI scripts, or run a botnet, all of which they can do without Tor.

    Many spam techniques, such as forged UDP packets, do not work through Tor at all, because Tor carries only TCP.

    **Regional note**

    With `ExitPolicy reject *:*`, SMTP does not leave either. Spam is not a live concern for a campus non-exit relay.

??? question "Is Tor frequently abused?"

    Tor uses exit policies to reduce abuse risk, with each relay deciding which services it permits and publishing that to clients. The project also has a dedicated network health team that investigates malicious relays and removes them from the network.

    Tor's design prevents us from monitoring user behaviour, which is deliberate. It is what allows Tor to provide strong privacy and anonymity for human rights workers, journalists, domestic violence survivors, whistleblowers, and law enforcement.

    **Regional note**

    For a campus non-exit relay the concept of abuse essentially does not apply, because the node never touches the content a user is ultimately reaching. All traffic through it is encrypted forwarding between Tor nodes, separated from the outside world by at least one further relay.

??? question "What happens if we do run an exit relay?"

    A relay permitting outbound connections will eventually receive abuse complaints. The recurring patterns:

    - Someone sends a threatening message through Tor, and law enforcement contacts you. An explanation is generally accepted
    - Someone sends spam through Tor, and your ISP receives a complaint
    - Someone causes trouble on IRC through Tor, and your server may be attacked in response
    - Someone downloads copyrighted material through Tor, and your ISP receives an infringement notice. Following EFF's template responses, this generally carries no legal liability

    ISPs differ in how they treat exit relays. You will also find that some websites block your exit IP address, which is normal. If you run an exit relay, use a dedicated IP address that does not affect other services.

    **Regional note**

    **Running an exit relay on a campus in Taiwan is strongly discouraged**, for three reasons. Outbound connectivity on the academic network goes through ministry review, and an exit relay's unpredictability does not fit that framework. There is no precedent to cite, which raises the cost of every conversation. And a student or society lead generally cannot carry the legal or administrative consequences.

    Anyone interested in exit relays should try it on a personal VPS with a Tor-friendly hosting provider rather than bringing institutional resources into it.

??? question "How do we respond to an ISP complaint?"

    The Tor community maintains response templates for relay operators, in the [EFF Tor legal FAQ](https://community.torproject.org/relay/community-resources/eff-tor-legal-faq/){target="_blank"} and the [Tor abuse templates](https://community.torproject.org/relay/community-resources/tor-abuse-templates/){target="_blank"}.

    **Regional note**

    A campus non-exit relay should **receive no ISP complaints at all**, because the node never communicates directly with external sites. If one arrives anyway, from someone assuming you are an exit:

    1. Confirm the time of the reported incident and the destination IP or URL
    2. Provide your `ContactInfo` and a screenshot of `ExitPolicy reject *:*`
    3. Cite the [Tor Project's description of relay types](https://community.torproject.org/relay/types-of-relays/){target="_blank"}: a non-exit relay forwards encrypted traffic within the Tor network and does not establish connections to final destinations
    4. Bring in your supervising faculty member or the university's legal office if needed

??? question "How does Tor handle misuse of the technology?"

    The Tor Project condemns criminal misuse and addresses malicious behaviour where it can, including removing malicious relays.

    By design, Tor cannot monitor or prohibit user behaviour. That design can be exploited, and more often it protects the people who need it: human rights workers, journalists, domestic violence survivors, whistleblowers, law enforcement, and others who need privacy.

    **Regional note**

    Public attention in Taiwan to whistleblower protection, domestic violence and stalking prevention, and press freedom has risen in recent years. Tor's value in these situations matches the global pattern, and a campus relay is a concrete contribution to making that infrastructure available regionally.

    Further reading: [Taiwan's whistleblower protection act](../regional/taiwan-whistleblower-law.md) and [digital preparation for domestic violence survivors](../scenarios/domestic-violence.md).

## One-page summary for network administrators { #summary-for-network-administrators }

!!! info "30 seconds: for IT centre and network operations staff"

    **What it is**

    - A Tor relay, **not an exit node**
    - Forwards encrypted traffic within the Tor network only, with no direct communication with external sites

    **Deployment requirements**

    - One static IPv4 address
    - One inbound TCP port (ORPort 9001, or 443)
    - Optionally 80 or 443 for a status page
    - Everything else closed

    **What does not happen**

    - No parsing or logging of user traffic
    - No abuse complaints, on a non-exit relay
    - No additional load on the campus border firewall
    - No effect on campus DNS or content filtering policy

    **Reversibility**

    - Can be taken offline in 10 minutes by stopping the service
    - Removable at any time with no effect on the campus network

    **Precedent**

    - Universities worldwide run relays, including MIT, Stanford, Cambridge, and Carnegie Mellon
    - The first case in Taiwan: [National Taiwan Normal University, live November 2025](../blog/posts/ntnu-nz.md)
    - The international programme: [EFF Tor University Challenge](https://toruniversity.eff.org/){target="_blank"}

## One-page summary for administration and legal counsel { #summary-for-administration-and-legal }

!!! info "30 seconds: for university administration and legal counsel"

    **What it is**

    Running a Tor relay on campus responds to the Tor University Challenge, an international programme run by the Electronic Frontier Foundation with the Tor Project. Universities worldwide participate, including MIT, Stanford, Cambridge, and Carnegie Mellon.

    **Legal position**

    - What is deployed is a non-exit relay, **legally comparable to network transmission infrastructure**
    - It does not touch user content and does not identify personal data
    - It falls outside the elements of Taiwan's computer misuse offences and outside personal data processing under the Personal Data Protection Act
    - EFF provides legal and technical resources

    **Institutional standing**

    - A concrete demonstration of commitment to information freedom and privacy
    - International connection: joining a global network of universities
    - Teaching value: a case study for computer science, information security, and network governance
    - Research value: usable as material for research and coursework

    **Operational impact**

    - Can be taken offline at any time, within 10 minutes
    - Operated jointly by students and supervising faculty, with minimal administrative burden
    - No changes required to existing campus firewall or content filtering policy

    **Reference cases**

    - Locally: [National Taiwan Normal University, live November 2025](../blog/posts/ntnu-nz.md)
    - Internationally: [Setting up a Tor university relay in Taiwan](https://blog.torproject.org/setting-up-tor-university-relay-taiwan/){target="_blank"}, on the Tor Project blog

!!! tip "Next step"

    Once the FAQ has covered the institutional concerns, continue from where you are:

    - **No proposal written yet**: go to the [campus Tor relay proposal template](./campus-tor-relay-proposal.md), adapt it for your institution, and attach this FAQ
    - **Proposal approved**: go to the [campus Tor relay deployment SOP](./campus-tor-relay-sop.md) for the technical work
    - **Just asked about it**: forward one of the one-page summaries above

## Related

- [Campus Tor relay proposal template](./campus-tor-relay-proposal.md): a fork-and-fill proposal document
- [Campus Tor relay deployment SOP](./campus-tor-relay-sop.md): the technical detail
- [The National Taiwan Normal University interview](../blog/posts/ntnu-nz.md): the full account of the first case
- [What is Tor](../tools/what-is-tor.md): the underlying concepts
- [EFF Tor legal FAQ](https://community.torproject.org/relay/community-resources/eff-tor-legal-faq/){target="_blank"}: the full legal FAQ from a US law perspective

## Sources and acknowledgements

The ten questions come from community member NZ, drawn from the original proposal document at National Taiwan Normal University. The regional notes were added by anoni.net. The original material is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/){target="_blank"} with NZ's agreement.
