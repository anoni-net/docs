---
title: How to set up a Tor relay
description: Install and run a Tor middle relay on Debian or Ubuntu, from torrc configuration and nyx monitoring to running multiple instances. Includes an FAQ on legal risk, home networks, and bandwidth requirements, written from a Taiwan-based community's operating experience.
icon: simple/torproject
---

# :simple-torproject: How to set up a Tor relay

How to install and run a Tor middle relay, written from the operating experience of a Taiwan-based volunteer community. The installation itself is not region-specific, so the steps apply anywhere. Where local law or ISP conditions matter, we say so and point you to sources for your own jurisdiction.

!!! warning "Considerations before you start"

    If you are not yet familiar with how Tor works, start with [What is Tor?](https://support.torproject.org/about/what-is-tor/){target="_blank"} and [Types of relays on the Tor network](https://community.torproject.org/relay/types-of-relays/){target="_blank"} on the Tor Project's own site. They keep those current in a way we cannot match.

    <figure markdown="span">
        <a target="_blank"
        href="../../assets/images/tor_diagram.original.webp">
            <img src="../../assets/images/tor_diagram.original.webp"
                alt="How Tor Relay Works"
                title="How Tor Relay Works"
            >
        </a>
        <caption>How Tor Relay Works</caption>
    </figure>

    This guide only covers a middle relay. If you want to run something more exposed, work through these questions first and decide how much risk you are willing to accept:

    - Do you want to run a Tor exit or non-exit (bridge/guard/middle) relay?
    - If you want to run an exit relay: which ports do you want to allow in your exit policy? More ports usually means more abuse complaints.
    - What external TCP port do you want to use for incoming Tor connections? For the `ORPort` setting we recommend port 443 if no other daemon on your server is using it, because it is often one of the few ports left open on public Wi-Fi. Port 9001 is another common choice.
    - What email address will you use in the `ContactInfo` field of your relay? This information is public.
    - How much bandwidth and monthly traffic do you want to allow for Tor traffic?
    - Does the server have an IPv6 address?

## How to set up a middle relay

Setting up a middle relay takes some technical knowledge and a basic install-and-configure workflow. We recommend Debian or Ubuntu, and the examples below use them.

!!! info "Other operating systems"

    For other operating systems or more detailed installation instructions, refer to the official documentation: [Tor Project | Middle/Guard relay](https://community.torproject.org/relay/setup/guard/){target="_blank"}.

### Install Tor

```bash
apt update
apt install tor
```

!!! info "Choosing a different version"

    There might be situations where Tor is not the latest version in various Linux distributions. If you need to install the latest or testing version, you can refer to the official documentation to make adjustments: [Why and how can I enable the Tor Package Repository in Debian?](https://support.torproject.org/apt/tor-deb-repo/){target="_blank"}

### Setup

Edit configuration file: `/etc/tor/torrc`

```bash
Nickname    myNiceRelay # Adjust "myNiceRelay" to the name you want to display publicly.
ContactInfo your@e-mail # Contact information, will be displayed publicly.
                        # If you don't want it to be public, you can set it to none.
ORPort      9001        # The default port is 9001.
                        # Port 443 is often one of the few ports left open on
                        # restrictive networks, so using it can help users there
                        # reach your relay. Remember to open the matching port on
                        # your firewall and router.
ExitRelay   0           # Do not become an Exit Relay.
SocksPort   0
Log notice file /var/log/tor/notices.log # Enable log recording
```

Restart Tor, with the default setting as `tor@default`

```bash
systemctl restart tor@default
```

Check the logs or system log `/var/log/syslog` for the text `Self-testing indicates your ORPort` and a message indicating `reachable`. About three hours later, you should be able to search for your Relay information on [Relay Search](https://metrics.torproject.org/rs.html){target="_blank"}.

!!! info "Post-installation precautions"

    After installation, you can refer to the official documentation for important considerations: [Tor Project | Relay Post-install and good practices](https://community.torproject.org/relay/setup/post-install/){target="_blank"}.

## Monitor the relay with nyx

nyx is a terminal status monitor for Tor. Install it, then run `nyx` to watch your relay's bandwidth, connections, and log output live.

```bash
apt install nyx
nyx
```

## Run multiple relays with `tor-instance-create`

`tor-instance-create` creates multiple independent Tor instances on the same server, which keeps the configuration and logs of each relay separate and easier to manage. It ships with the `tor` package on Debian and Ubuntu.

Running several instances does not make any of them more anonymous. The benefit is operational: separate config, separate data directory, separate log.

### Create a new Tor instance

The command takes the instance name; the matching systemd unit is then `tor@<instance-name>`.

```bash
tor-instance-create {instance-name}
tor-instance-create mytor2
```

This will create a new Tor instance named `mytor2`, with its configuration directory created under `/var/lib/tor-instances/mytor2`.

### Edit the new instance configuration

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

### Monitor the new instance with nyx

```bash
nyx -s /run/tor-instances/{instance-name}/control
```

## Common questions

??? question "Will the police come after me for setting up a Tor Relay?"

    There are three types of relays: Guard Relay, Middle Relay, and Exit Relay. Guard and Middle Relays only serve to transmit traffic within the Tor network and do not connect directly to final destinations, so there is little risk of encountering law enforcement. However, running an Exit Relay carries potential legal risks and should be carefully considered.

??? question "Is it feasible to set up a relay using a home network?"

    Setting up a Tor relay over a home network (e.g., using broadband or cable internet) may require configuring the router provided by your ISP, which can have some technical challenges. Home routers block all inbound connections by default, so you need to allow inbound traffic on your ORPort in the firewall and forward that port on the router.

??? question "Why should I run a Tor Relay?"

    Running a Tor Relay helps expand the Tor network's bandwidth and stability, allowing more people to browse the internet safely and anonymously. This is vital for promoting internet freedom and privacy rights.

??? question "What benefits do I get from running a Tor Relay?"

    Although operating a Tor Relay doesn't offer direct financial rewards, it promotes global internet freedom, supports free speech, and privacy. It also makes you part of the open-source community, contributing to the infrastructure for an anonymous internet.

??? question "Does running a Tor Relay require extensive technical knowledge?"

    Not necessarily. Basic networking knowledge (like IP addresses and port settings) is helpful, but Tor provides detailed installation guides, and many community forums offer support. Anyone interested can learn and set up a Relay.

??? question "Is running a Tor Relay legal?"

    We can only speak to Taiwan, where the internet is relatively free and running a Tor relay is currently legal. Legal situations change, so it is worth following internet freedom issues and legislation where you are. Running an exit relay carries more legal risk, so read up on your local regulations first.

    For jurisdictions outside Taiwan, the EFF's [Legal FAQ for Tor Relay Operators](https://community.torproject.org/relay/community-resources/eff-tor-legal-faq/){target="_blank"} is the standard starting point.

??? question "What are the requirements for running a Tor Relay?"

    Make sure your network has stable upload and download speeds. The Tor Project recommends at least 10 Mbit/s (about 1.25 MB/s) in each direction for a relay, see [Relay requirements](https://community.torproject.org/relay/relays-requirements/){target="_blank"}. If you have more than 1 Mbit/s but less than 10 Mbit/s, the Tor Project suggests running an obfs4 bridge instead of a relay. You also need a static IP address. Check that your ISP permits this kind of traffic and that your network equipment (firewall and router) can be configured for the required port forwarding.

??? question "Will a Tor Relay affect my internet speed?"

    A Tor relay only uses up to the bandwidth limit you configure, so it will not consume all your available capacity. You might still notice slight speed reductions under heavy load. You can adjust the bandwidth limits in the settings as needed.

??? question "How do I protect my privacy while running a Tor Relay?"

    Tor Relays do not access or track users' traffic themselves, but it's advisable to be cautious with identifiable information, like not using an email address that contains personal details. Regularly update the Tor software for enhanced security.

??? question "How do I upgrade my Tor Relay software?"

    Keeping the Tor software updated is essential for security patches and new features. On most Linux systems, you can update Tor via the package manager. Windows and macOS users should regularly check the Tor website for updates.

??? question "How can I become a Guard Relay?"

    Guard Relays are automatically selected by the Tor network; users cannot manually configure this. If your node runs stably and has sufficient bandwidth, it may be chosen as a Guard Relay.

## :fontawesome-solid-diagram-project: Where to go from here

<div class="grid cards" markdown>

- [:material-tunnel-outline: How to set up a Tor WebTunnel bridge](./setup-tor-webtunnel.md) — for censored networks where a plain relay will not reach users
- [:material-radar: Tor relay watcher](../regional/tor-relay-watcher.md) — what relay operation looks like across the region
- [:material-account-group-outline: Join the community](./index.md) — our Matrix space, and how to reach us if you get stuck

</div>