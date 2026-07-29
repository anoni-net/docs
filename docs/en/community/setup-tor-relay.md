---
title: How to setup a Tor Relay
icon: simple/torproject
---

# :simple-torproject: How to Setup a Tor Relay

How to install a Tor Relay, Bridge, and Exit Node on a network in Taiwan.

## What is Tor?

<figure markdown="span">
    <a target="_blank"
       href="../assets/images/tor_diagram.original.webp">
        <img src="../assets/images/tor_diagram.original.webp"
            alt="How Tor Relay Works"
            title="How Tor Relay Works"
        >
    </a>
    <caption>How Tor Relay Works</caption>
</figure>

[Tor (The Onion Router)](https://www.torproject.org/){target="_blank"} is an open-source anonymous communication network designed to protect users' privacy and freedom. Tor anonymizes users' internet activity through multilayer encryption and routing technology, preventing network surveillance and traffic analysis.

- **Onion Routing:** Each time a user sends a request, the Tor client selects a random path and transmits data through multiple relay nodes. The packet data is encrypted and decrypted at each node, much like peeling an onion, until it reaches its destination. Each node only knows the previous and next nodes, preventing any single node from knowing the entire data transmission path.
- **Anonymity:** Users' IP addresses and network activities are hidden, enhancing anonymity. The Tor network makes it very difficult to trace users' online behavior.
- **Privacy Protection:** Tor protects users from being monitored by ISPs (Internet Service Providers), governments, and other surveillance entities. It also helps users bypass internet censorship and access restricted websites.
- **Dark Web:** Tor supports accessing .onion domains, which are only connectable within the Tor network, providing an additional layer of anonymity. The Dark Web has some legitimate uses, such as protecting freedom of speech and privacy, although it also hosts illegal activities.
- **Usage:** Users can download and install the Tor Browser, a modified version of Firefox, pre-configured to use the Tor network. Many users utilize the Tor Browser to surf the internet anonymously and protect personal privacy.

## Relay and Bridge

### What is Tor Relay?

<figure markdown="span">
    <a target="_blank"
       href="../assets/images/tor_relays.svg">
        <img src="../assets/images/tor_relays.svg"
            alt="Tor Relays"
            title="Tor Relays"
        >
    </a>
    <caption>Tor Relays</caption>
</figure>

In the Tor network, relays are volunteer-operated servers used to forward users' traffic to achieve anonymous network communication. These relays are a core component of the Tor network, working together to hide users' IP addresses and online activities. There are three types of relays: Guard Relay, Middle Relay, and Exit Relay. Each type plays a different role in the Tor network:

- **Guard Relay:** This is the first node to which a user connects in the Tor network. It knows the user's real IP address but does not know the user's final destination. Typically, the Tor client selects a set of trusted guard relays and reuses them over time to reduce the attack surface.
- **Middle Relay:** This relay is positioned between the guard relay and the exit relay, used to forward traffic. It only knows the previous and next nodes, unable to determine the user's real IP address or the final destination. This design ensures that even if the middle relay is attacked or monitored, the attacker cannot trace the entire path of network communication.
- **Exit Relay:** This is the last relay where user traffic exits the Tor network and enters the public internet. It knows the user's final destination but not the user's real IP address. Volunteers operating exit relays incur some risk, as the traffic leaving them may contain sensitive or illegal content.

### What is Bridge?

Apart from relays, the Tor network also has an important type of node called a Bridge. Bridges are specifically designed to circumvent network censorship or blockages against Tor usage. They play a special role in the Tor network, primarily aimed at helping people in countries or regions with strict restrictions to access Tor. Here are some key points about Bridges:

Features and Uses:

- **Secrecy:** Unlike regular relays, Bridges' IP addresses are not publicly listed in the Tor network's public index. This makes it difficult for censorship bodies to identify and block them, as these bodies often rely on public relay lists to enforce blockages.
- **Censorship Circumvention:** In certain countries and regions, governments or ISPs may block access to the Tor network. In such cases, users can use Bridges to bypass these blockages. Bridges serve as hidden entry points, assisting users in establishing initial connections, after which their traffic is forwarded to regular Tor relays.
- **Distribution Method:** Since Bridges' IP addresses are not public, users need specific methods to obtain these addresses. Users can acquire Bridge addresses through the Tor website, by sending an email, or using other channels such as Bridge distribution tools.

Pluggable Transports：

- To further evade censorship, Bridges often use Pluggable Transports, which are protocols that alter the characteristics of Tor traffic to make it appear like regular HTTPS traffic or other types. These technologies include Obfs4, meek, [Snowflake](https://snowflake.torproject.org/){target="_blank"}, and others, which can obfuscate Tor traffic, making detection and blocking more challenging.

## How to Setup a Middle Relay

Setting up a Middle Relay requires some technical knowledge and basic installation and configuration. It is recommended to use Debian or Ubuntu operating systems for installation, and the following examples will use Debian/Ubuntu as well.

!!! info "Other Operating Systems"

    For other operating systems or more detailed installation instructions, refer to the official documentation: [Tor Project | Middle/Guard relay](https://community.torproject.org/relay/setup/guard/){target="_blank"}。

!!! warning "Considerations Before Setting Up!"

    The following tutorial only uses Middle Relays as examples. If you wish to set up more advanced nodes, please consider the following questions and assess the risks you can undertake:

    - Do you want to run a Tor exit or non-exit (bridge/guard/middle) relay?
    - If you want to run an exit relay: Which ports do you want to allow in your exit policy? (More ports usually means potentially more abuse complaints.)
    - What external TCP port do you want to use for incoming Tor connections? ("ORPort" configuration: We recommend port 443 if that is not used by another daemon on your server already. ORPort 443 is recommended because it is often one of the few open ports on public WIFI networks. Port 9001 is another commonly used ORPort.)
    - What email address will you use in the ContactInfo field of your relay(s)? This information will be made public.
    - How much bandwidth/monthly traffic do you want to allow for Tor traffic?
    - Does the server have an IPv6 address?

### Install tor

```bash
apt update
apt install tor
```

!!! info "Choosing Different Versions"

    There might be situations where Tor is not the latest version in various Linux distributions. If you need to install the latest or testing version, you can refer to the official documentation to make adjustments: [Why and how can I enable the Tor Package Repository in Debian?](https://support.torproject.org/apt/tor-deb-repo/){target="_blank"}

### Setup

Edit configuration file: `/etc/tor/torrc`

```bash
Nickname    myNiceRelay # Adjust "myNiceRelay" to the name you want to display publicly.
ContactInfo your@e-mail # Contact information, will be displayed publicly.
                        # If you don't want it to be public, you can set it to none.
ORPort      9001        # The default Port is 9001.
                        # Using ports like 443 or 80, which appear to be commonly used
                        # web ports, can further assist users in restrictive countries.
                        # Also, remember to adjust firewall settings or open the external
                        # ports accordingly.
ExitRelay   0           # Do not become an Exit Relay.
SocksPort   0
Log notice file /var/log/tor/notices.log # Enable log recording
```

Restart Tor, with the default setting as `tor@default`

```bash
systemctl restart tor@default
```

Check the logs or system log `/var/log/syslog` for the text `Self-testing indicates your ORPort` and a message indicating `reachable`. About three hours later, you should be able to search for your Relay information on [Relay Search](https://metrics.torproject.org/rs.html){target="_blank"}.

!!! info "Post-installation Precautions"

    After installation, you can refer to the official documentation for important considerations: [Tor Project | Relay Post-install and good practices](https://community.torproject.org/relay/setup/post-install/){target="_blank"}.

## Use nyx for Monitoring

Use nyx to monitor the status and performance of your Relay:

```bash
apt install nyx
```

## Create Multiple Tor Configurations with `tor-instance-create`

`tor-instance-create` is a tool used to create multiple independent Tor instances on the same server. This is particularly useful in scenarios that require running multiple Tor instances to increase anonymity or distribute traffic. `tor-instance-create` is part of Tor and is typically installed along with the Tor package.

### Create a New Tor Instance

```bash
tor-instance-create tor@{instance-name}
tor-instance-create tor@mytor2
```

This will create a new Tor instance named `mytor2`, with its configuration directory created under `/var/lib/tor-instances/mytor2`.

### Configure the New Configuration File

The new configuration file is located at `/var/lib/tor-instances/mytor2/torrc`. In this configuration file, you can set various parameters, such as:

```bash
ORPort 9002  # Set a new ORPort, ensuring each instance uses a different port.
DataDirectory /var/lib/tor-instances/mytor2/data
Log notice file /var/lib/tor-instances/mytor2/notice.log
```

### Start

Start or restart the newly created Tor instance.

```bash
# systemctl start tor@{instance-name}
systemctl start tor@mytor2
```

### Use nyx to Monitor the New Configuration

```bash
nyx -s /run/tor-instances/{instance-name}/control
```

## Common Issues When Setting Up a Tor Relay

??? question "Will the police come after me for setting up a Tor Relay?"

    There are three types of relays: Guard Relay, Middle Relay, and Exit Relay. Guard and Middle Relays only serve to transmit traffic within the Tor network and do not connect directly to final destinations, so there is little risk of encountering law enforcement. However, running an Exit Relay carries potential legal risks and should be carefully considered.

??? question "Is it feasible to set up a relay using a home network?"

    Setting up a Tor Relay over a home network (e.g., using broadband or cable internet) may require configuring the router provided by your ISP, which can have some technical challenges. If you can manually set and adjust router configurations, ensure firewalls are enabled and incoming ports are specified, as the default is usually to block all incoming connections.

??? question "Why should I run a Tor Relay?"

    Running a Tor Relay helps expand the Tor network's bandwidth and stability, allowing more people to browse the internet safely and anonymously. This is vital for promoting internet freedom and privacy rights.

??? question "What benefits do I get from running a Tor Relay?"

    Although operating a Tor Relay doesn't offer direct financial rewards, it promotes global internet freedom, supports free speech, and privacy. It also makes you part of the open-source community, contributing to the infrastructure for an anonymous internet.

??? question "Does running a Tor Relay require extensive technical knowledge?"

    Not necessarily. Basic networking knowledge (like IP addresses and port settings) is helpful, but Tor provides detailed installation guides, and many community forums offer support. Anyone interested can learn and set up a Relay.

??? question "Is running a Tor Relay legal?"

    In Taiwan, the internet is relatively free, and it's currently allowed to use Tor Relays. However, legal situations can change, so it's good to stay informed about internet freedom issues and legislation. Running an Exit Relay might involve more legal risks; it's advisable to understand the relevant regulations first.

??? question "What are the requirements for running a Tor Relay?"

    Ensure your network has stable upload and download speeds, with at least 100 KB/s upload bandwidth and a static IP address. Also, check that your ISP permits such traffic and your network equipment (like a firewall and router) can correctly configure the required port forwarding.

??? question "Will a Tor Relay affect my internet speed?"

    A Tor Relay uses the maximum bandwidth you configure, so it won't consume all your network resources. However, you might notice slight speed reductions under heavy load. You can adjust the bandwidth limits in the settings as needed.

??? question "How do I protect my privacy while running a Tor Relay?"

    Tor Relays do not access or track users' traffic themselves, but it's advisable to be cautious with identifiable information, like not using an email address that contains personal details. Regularly update the Tor software for enhanced security.

??? question "How do I upgrade my Tor Relay software?"

    Keeping the Tor software updated is essential for security patches and new features. On most Linux systems, you can update Tor via the package manager. Windows and macOS users should regularly check the Tor website for updates.

??? question "How can I become a Guard Relay?"

    Guard Relays are automatically selected by the Tor network; users cannot manually configure this. If your node runs stably and has sufficient bandwidth, it may be chosen as a Guard Relay.