---
title: Campus Tor Relay Deployment SOP
description: The full technical procedure for running a Tor relay on a university network — torrc configuration, firewall rules, status page options, monitoring, an incident runbook, and acceptance testing.
icon: material/server-network-outline
---

# :material-server-network-outline: Campus Tor Relay Deployment SOP

This procedure supplements [how to run a Tor relay](./setup-tor-relay.md) with what is specific to **a university network**. It comes from community member NZ's deployment at National Taiwan Normal University, and works alongside the [proposal template](./campus-tor-relay-proposal.md) and the [FAQ](./campus-relay-faq.md).

If you are still working out whether to do this or how to persuade the institution, go back to the [proposal template](./campus-tor-relay-proposal.md). This page assumes approval is in hand.

## How a campus differs from a personal deployment

Several structural differences drive the technical choices:

- **The IP address comes from the institution**, usually one static IPv4 address through a formal request
- **IPv6 needs a separate request**, since most campuses do not enable it by default
- **Outbound connectivity is blocked by default** on an academic network, so every externally reachable service goes through an exception process
- **SSH should be restricted to the campus VPN range** rather than exposed to the internet
- **The institution expects everything to be explicable**: every open port and every traffic flow should map to something in the proposal
- **Long-term operation has to survive graduation**, so `ContactInfo` does not go to a personal address

## Scope and non-scope

When talking to an IT centre, **stating what you will not do matters more than stating what you will**.

**In scope**

- A non-exit relay only, functioning as guard and middle relay
- One public artifact: a node status page containing no user data

**Out of scope**

- No VPN, proxy, or Tor client services (no SocksPort, no DNSPort)
- No onion services
- No changes to the campus border firewall, DNS resolution, or content filtering policy
- No deep packet inspection

**Reversibility**

- Offline within 10 minutes at any time: stop the service and close the ORPort

## Services and connections

### Inbound

| Service | Port and protocol | Source | Notes |
|---|---|---|---|
| Tor ORPort | 9001/tcp | Internet | TLS between relays, the only strictly required inbound port |
| HTTP (ACME) | 80/tcp | Internet | Let's Encrypt issuance and a 301 redirect |
| HTTPS (status page) | 443/tcp | Internet | The public status page |
| SSH | 22/tcp | Campus VPN range | Management only |
| DirPort | Closed | – | Left disabled to reduce attack surface |

The principle: **expose exactly one Tor-related TCP port**. If 443 is free, moving the ORPort to 443 makes the relay easier to reach from heavily censored networks.

### Outbound

| Purpose | Port and protocol | Destination |
|---|---|---|
| Directory consensus and contacting other relays | TCP 443 and 9001, dynamic | Directory authorities and relays |
| System updates | TCP 80 and 443 | Package mirrors |
| Time synchronization | UDP 123 | Designated NTP server |

### Explicitly blocked

- All UDP except the designated NTP destination
- Mail ports: SMTP 25, 465, 587
- IRC 6667 and 6697, and common peer-to-peer ports
- SocksPort, DNSPort, and HTTPTunnelPort all left disabled

## Operating system baseline

Ubuntu Server 24.04 LTS, minimal install:

1. **Minimal packages**: `tor`, `nginx`, `certbot`, `fail2ban`, `unattended-upgrades`, `rsyslog`, `auditd`, `chrony`, plus `prometheus-node-exporter` if needed
2. **SSH configuration**
    - Keys only: `PasswordAuthentication no`
    - No direct root login: `PermitRootLogin no`
    - Restricted users: `AllowUsers <account>`
    - Timeout: `ClientAliveInterval 300`
3. **Automatic security updates** through `unattended-upgrades`
4. **Time synchronization** with `chrony`, logging in UTC so incident timelines line up
5. **Hardening**: AppArmor enabled, `fs.protected_*` parameters set
6. **Persistent logs**: `journald` with `Storage=persistent`, optionally forwarded to an institutional SIEM through `rsyslog`
7. **File integrity (optional)**: AIDE with periodic baseline comparison
8. **Disk encryption (optional)**: LUKS on the whole disk where the hardware allows, or at least protecting `/var/lib/tor`
9. **Backups**: offline or off-site copies of `/etc/tor/torrc` and `/var/lib/tor/keys/`, with the **identity key kept strictly confidential**

## Installing Tor

- **Package source**: prefer the [Tor Project's own repository](https://support.torproject.org/apt/tor-deb-repo/){target="_blank"}, since distribution packages usually lag by a version or two
- **Service account**: run as the packaged `debian-tor` account, **never as root**
- **Non-exit only**: declare it explicitly with `ExitRelay 0` and `ExitPolicy reject *:*`, so nothing mistakes it for an exit relay

## torrc reference

At `/etc/tor/torrc`:

```bash
# Identity
Nickname    <YourSchoolRelayName>
ContactInfo <project-email@example.edu> - Non-exit relay at <Dept/School>; Abuse: <noc@example.edu>

# Guard and middle only, never exit
ExitRelay   0
ExitPolicy  reject *:*

# ORPort: the only required inbound service
ORPort      0.0.0.0:9001

# No directory mirror
DirPort     0

# No local SOCKS proxy
SocksPort   0
SocksPolicy reject *

# Control port, local only, for nyx and operations
ControlPort           127.0.0.1:9051
CookieAuthentication  1
CookieAuthFileGroupReadable 1
DataDirectoryGroupReadable  1

# Bandwidth, adjusted to institutional policy
# Example: 80 MB/s sustained, 120 MB/s burst
RelayBandwidthRate    80 MB
RelayBandwidthBurst   120 MB

# Logging at notice level, avoiding sensitive detail
Log notice file /var/log/tor/notices.log

# MetricsPort (optional): local or internal monitoring only, never exposed
# MetricsPort       127.0.0.1:9035
# MetricsPortPolicy accept 127.0.0.1
```

**On `ContactInfo`**:

- Do not use a personal address. A project or society address survives graduation
- Include an abuse contact so the Tor network health team can reach someone
- This field appears publicly in Relay Search. **Treat it as public information**

**On `MetricsPort`**:

`MetricsPort` lets Prometheus scrape relay metrics, and [the Tor Project strongly advises against exposing it](https://support.torproject.org/relay-operators/relay-bridge-overloaded/){target="_blank"}. For remote scraping, restrict the source strictly through both the firewall and `MetricsPortPolicy`, behind a TLS proxy.

## Firewall

Default policy:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw logging on
```

SSH restricted to the campus VPN range (replace `<campus CIDR>`):

```bash
sudo ufw allow from <campus CIDR> to any port 22 proto tcp comment 'SSH from campus VPN'
sudo ufw limit 22/tcp comment 'Rate-limit SSH'
```

Web (status page):

```bash
sudo ufw allow 80/tcp  comment 'HTTP for ACME/redirect'
sudo ufw allow 443/tcp comment 'HTTPS status site'
```

Tor ORPort:

```bash
sudo ufw allow 9001/tcp comment 'Tor ORPort'
```

MetricsPort, closed by default, opened only to an internal monitoring host:

```bash
sudo ufw allow from <monitoring host IP> to any port 9035 proto tcp comment 'Prometheus -> Tor MetricsPort'
```

Enable and verify:

```bash
sudo ufw enable
sudo ufw status numbered
```

## The public status page

Letting the institution and outsiders confirm the relay is running helps build trust. Either architecture works.

### Option A: Nginx and Onionoo (simple, low risk, recommended)

- Nginx serves an HTTPS status page
- The page pulls public data for your own fingerprint from the [Tor Onionoo API](https://metrics.torproject.org/onionoo.html){target="_blank"}: traffic, flags, uptime
- Only public information is shown, and no internal endpoint is exposed

Advantages: simple, no internal risk, purely client-side. Disadvantage: less flexible charting.

### Option B: MetricsPort, Prometheus, and Grafana (full observability)

- Enable `MetricsPort 127.0.0.1:9035` locally, **never externally**
- Scrape `/metrics` from Prometheus locally or on the internal network
- Grafana for dashboards
- Only Grafana may face outward, and **only with**:
    1. Read-only accounts with strong passwords or single sign-on
    2. HTTPS
    3. Dashboards containing nothing sensitive
    4. Prometheus **not** exposed
    5. MetricsPort **never** exposed

### Nginx and TLS

- `certbot --nginx` for issuance and renewal
- TLS 1.2 and 1.3 only, weak ciphers disabled
- HSTS, `X-Content-Type-Options: nosniff`, and a Content Security Policy
- `X-Robots-Tag: noindex, nofollow` to stay out of search indexes
- `/.well-known/acme-challenge/` over port 80, everything else on 80 redirected 301 to 443

## Monitoring, logging, and incident response

### Logs

- `journald` persistent, forwarded through `rsyslog` where required
- Separate files for Nginx and Tor, with `logrotate`
- Tor at `Log notice`, avoiding sensitive detail
- Raise the level temporarily during an incident and restore it afterwards

### Host observability

- `node_exporter` bound to `127.0.0.1:9100`
- Local Prometheus scraping, Grafana displaying, read-only if exposed

### Audit

- `auditd` recording changes to `/etc/tor/torrc` and `/var/lib/tor/keys/`
- AIDE comparing periodically, with results emailed to the operations address

### Backups and key protection

- Offline or off-site copies of `torrc` and `/var/lib/tor/keys/`
- Losing the identity key means the relay restarts as a new identity, which costs its accumulated reputation

### Incident runbook

On an alert:

1. **Triage**:
    ```bash
    sudo ss -tnlp | egrep ':22|:80|:443|:9001|:9035'
    sudo journalctl -u tor -n 200
    sudo ufw status numbered
    ```
2. **Reduce exposure quickly**:
    ```bash
    sudo systemctl stop tor@default
    ```
    Preserve complete snapshots of `/var/log` and `/var/lib/tor/`
3. **Notify internally**: a preliminary incident report within 30 minutes covering impact, cause, action taken, and expected recovery
4. **If compromise is suspected**: preserve evidence, isolate, rebuild, and restore from the backed-up identity key, provided the key is known not to have leaked

**Conditions for taking it offline**: impact on institutional networks, a security anomaly, or a request from the institution or supervisor.

## Acceptance testing

1. **Verify the configuration**:
    ```bash
    sudo -u debian-tor tor --verify-config
    ```
2. **Confirm ORPort reachability** from a host outside the campus:
    ```bash
    nmap -p 9001 <public IP>
    ```
    An `ORPort reachability` warning in the Tor log usually means the firewall or the external exception has not gone through
3. **Confirm the relay is live**: after several minutes, look up your fingerprint in [Tor Metrics Relay Search](https://metrics.torproject.org/rs.html){target="_blank"}

## IPv6 (optional)

Request an IPv6 address from the IT centre, then add to `torrc`:

```bash
ORPort [<your IPv6>]:9001
```

Allow the corresponding traffic in the firewall. IPv6 is optional and contributes substantially to the network's diversity, which makes it worth pushing for.

## Handover and life after graduation

The difference between a campus relay and a personal one is that **people graduate**. Prepare from day one:

- **`ContactInfo` on a shared address**: a society, project, or team mailbox
- **At least two key backups**: one with the operator, one in the supervisor's laboratory
- **A handover checklist**: `torrc`, firewall rules, SSH keys, monitoring accounts, and the password for the contact mailbox
- **Find a successor early**: a semester before graduation
- **Write a handover document**: this machine's history, the problems already hit, and the agreed operational rhythm

!!! tip "Next step"

    Once the relay is live, the case exists inside the Tor network.

    - **Tell us**: get in touch through [Community services](./tools.md) and we will add your case to the [Tor relays on campus track](./relay-on-campus.md), so the next institution has more to work from
    - **Ongoing operation**: the FAQ at the end of [how to run a Tor relay](./setup-tor-relay.md) covers monitoring with nyx, package upgrades, and how the guard relay mechanism works
    - **Doing more**: running a [Tor Snowflake bridge](../tools/tor-snowflake.md) alongside it helps users in censored regions reach Tor

    Each campus relay that goes live makes the next one cheaper.

## Related

- [How to run a Tor relay](./setup-tor-relay.md): the basic installation from a personal perspective
- [Campus Tor relay proposal template](./campus-tor-relay-proposal.md): the proposal document
- [Campus Tor relay FAQ](./campus-relay-faq.md): the institutional concerns
- [Tor relays on campus track](./relay-on-campus.md): the community's entry point
- [Tor Project relay operator guides](https://community.torproject.org/relay/){target="_blank"}: the official documentation
- [Relay post-install and good practices](https://community.torproject.org/relay/setup/post-install/){target="_blank"}

## Sources and acknowledgements

This procedure comes from community member NZ, who provided the original design documentation and operational experience from the deployment at National Taiwan Normal University. The material is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/){target="_blank"} with NZ's agreement.

If you follow this and find a step that does not fit your institution, or something worth adding, **tell us**. We keep updating it. Contact routes are on [Community services](./tools.md).
