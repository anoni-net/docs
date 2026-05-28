---
title: How to set up a Tor WebTunnel bridge
description: Set up a Tor WebTunnel bridge that disguises Tor traffic as ordinary HTTPS web traffic, helping users in heavily censored places like Iran and China reach Tor. Covers the full path from VPS, domain, TLS, and an nginx reverse proxy to Docker, plus operations guidance.
icon: material/tunnel-outline
---

# :material-tunnel-outline: How to set up a Tor WebTunnel bridge

WebTunnel is currently Tor's most censorship-resistant kind of bridge. It wraps Tor traffic inside an ordinary HTTPS connection, so to a censor it looks no different from a person browsing a website. When a censorship system uses deep packet inspection (DPI) to block protocols like obfs4 that "don't look like HTTPS," WebTunnel still gets through.

This guide walks you through standing up a WebTunnel bridge on a small VPS using the official Docker method, from the domain, TLS certificate, and nginx reverse proxy to verifying it's live, along with operational practices for monitoring, the cover page, the firewall, and incident handling.

!!! info "First, the difference between bridges and relays"

    If you're new to Tor, start with the Tor Project's [What is Tor](https://support.torproject.org/about/){target="_blank"} overview.

    There are several ways to contribute to Tor, with different barriers to entry and different levels of censorship resistance:

    - [Tor Snowflake](https://snowflake.torproject.org/){target="_blank"}: a temporary bridge you can run from a browser tab, the lowest barrier, but it runs over WebRTC and some censorship environments can detect it.
    - **WebTunnel (this guide)**: needs a VPS, a domain, and TLS; disguises itself as HTTPS; hardest to block in heavily censored places.
    - [Tor relay](https://community.torproject.org/relay/){target="_blank"}: a relay node that carries the bandwidth and diversity of the Tor network; it is not a bridge.

    A bridge, like a relay, never connects directly to the destination a user is heading for. The destination site sees a Tor exit node, not your server, so the legal risk of operating a bridge is on par with guard and middle nodes, and far lower than an exit node.

## Why we need more WebTunnel bridges

- **Places with low censorship and plenty of bandwidth make good bridge sources.** Free, well-connected outbound access is what a bridge needs.
- **IP and ASN diversity is valuable.** Censors block the bridge IPs they already know about, so the more bridges spread across different countries and network providers, the more entry points people on the ground can use.
- **It's cheaper than running a relay.** A VPS with 512MB to 1GB of RAM is enough, with lower cost and upkeep than a Tor relay.
- **It answers a real need.** In 2026 Iran cut its internet for nearly three months during military operations, and after reopening, traffic poured into volunteer-run WebTunnel bridges. Under extreme censorship, bridges like these are what decide whether people there can reach Tor at all.

## What to prepare before you start

- A VPS (Debian or Ubuntu, 512MB RAM or more; 1GB recommended to give the Tor process headroom).
- A domain or subdomain whose DNS you can edit.
- Port 443 open to the world (WebTunnel uses the standard HTTPS port so it looks like a normal site).
- A contact email, which will be public in the bridge's `ContactInfo`.

!!! tip "Domain and operational privacy"

    WebTunnel's disguise relies on the domain "just looking like an ordinary website." Recommendations:

    - Use a domain or subdomain that doesn't obviously read as a Tor bridge.
    - Serve a harmless page at the root path (`/`) (a personal homepage, a parking page, or a simple blog all work), so anyone scanning sees an ordinary website.
    - In a low-risk setting, a subdomain of an existing domain is usually fine. If you want stronger operational privacy, consider a separate, anonymously registered domain.

The whole process has two parts: first get the domain, TLS, and reverse proxy layer in place (so the server looks like a normal HTTPS website), then run the bridge with Docker.

## Part 1: domain, TLS, and the nginx reverse proxy

### Set up DNS

Add an A record to your domain's DNS, pointing the domain (or subdomain) at the VPS's IP. For example, point `bridge.example.com` at the server's public IP. Wait for DNS to propagate before moving on.

### Get a TLS certificate

WebTunnel needs a browser-trusted TLS certificate so the connection looks like it's reaching a real HTTPS website. Let's Encrypt is the easiest option.

```bash
apt update
apt install certbot python3-certbot-nginx
certbot --nginx -d bridge.example.com
```

The certbot package installs a systemd timer for automatic renewal, which you can confirm with:

```bash
systemctl status certbot.timer
```

!!! info "Other ways to get a certificate"

    You can also use an ACME client like `acme.sh` to sign a certificate; see the official docs: [Tor Project | WebTunnel Bridge](https://community.torproject.org/relay/setup/webtunnel/){target="_blank"}.

### Configure the nginx reverse proxy

The WebTunnel bridge listens on `127.0.0.1:15000` locally; nginx handles the public HTTPS and reverse-proxies a "secret path" through to the bridge. Pick a random string to use as that secret path; the example below uses `$PATH` to stand in for it.

In an existing vhost (or a new one), add this `location` block, making sure to include the WebSocket headers:

```nginx
location = /$PATH {
    proxy_pass http://127.0.0.1:15000;
    proxy_http_version 1.1;
    ### WebSocket headers ###
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    ### Proxy headers ###
    proxy_set_header Accept-Encoding "";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    add_header Front-End-Https on;
    proxy_redirect off;
    access_log off;
    error_log /dev/null;
}
```

Keep the root path `location /` serving a normal web page so the server as a whole looks like an ordinary site; only a Tor client that knows the secret path reaches the bridge. After editing, test the config and reload:

```bash
nginx -t && systemctl reload nginx
```

## Part 2: run the WebTunnel bridge with Docker

### Install Docker

```bash
apt install curl sudo
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh ./get-docker.sh
```

### Create the `.env` file

Set `URL` to your domain plus the secret path (matching the `$PATH` you used in the nginx config from Part 1), set `OPERATOR_EMAIL` to your contact address, then run:

```bash
truncate --size 0 .env
echo "URL=https://bridge.example.com/your-secret-path" >> .env
echo "OPERATOR_EMAIL=your@email.org" >> .env
echo "BRIDGE_NICKNAME=WTBr$(cat /dev/urandom | tr -cd 'qwertyuiopasdfghjklzxcvbnmMNBVCXZLKJHGFDSAQWERTUIOP0987654321'|head -c 10)" >> .env
echo "GENEDORPORT=4$(cat /dev/urandom | tr -cd '0987654321'|head -c 4)" >> .env
```

### Download the docker-compose config

```bash
curl https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/webtunnel/-/raw/main/release/container/docker-compose.yml?inline=false > docker-compose.yml
```

This compose file enables automatic updates by default, so the bridge updates itself to new versions with no extra action. Then start it:

```bash
docker compose up -d
```

### Get the bridge line and verify

```bash
docker compose exec webtunnel-bridge get-bridge-line.sh
```

Paste the bridge line it prints into Tor Browser's bridge settings to test whether it works.

!!! warning "If the command doesn't work"

    On newer container versions the container name may be `webtunnelBridge`, and the command above will fail. Use:

    ```bash
    docker exec webtunnelBridge get-bridge-line.sh
    ```

The IP in the bridge line (especially the IPv6 one) is a randomly generated placeholder and isn't actually used; the pluggable transport spec just requires an IP in that position. The real connection runs over your domain and secret path. By default, your bridge is automatically distributed to users who need it through [bridges.torproject.org](https://bridges.torproject.org/){target="_blank"}.

## Advanced operations

### Firewall

Open only the ports you need. WebTunnel only needs 443 (HTTPS) facing the world; keep SSH as required for management. The bridge's `15000` listener is bound to `127.0.0.1` and should not be exposed.

```bash
ufw allow 443/tcp
ufw allow OpenSSH
ufw enable
ufw status
```

### Designing the cover page

That "harmless page" at the root path is part of the disguise. Serve a static page with real content that won't raise suspicion (a personal portfolio, technical notes, or a placeholder page all work), and avoid a blank page or the default nginx welcome page, which stand out.

### Monitoring and health checks

- View container status and logs:

    ```bash
    docker compose ps
    docker compose logs -f
    ```

- Confirm the TLS certificate is still valid and renewing: `systemctl status certbot.timer`.
- A few hours after the bridge is live, you can test through the [bridges.torproject.org](https://bridges.torproject.org/){target="_blank"} flow or in Tor Browser whether it's being distributed and is reachable.

### Software updates

The compose file auto-updates the bridge itself. System-level Docker, nginx, and certbot still need periodic `apt update && apt upgrade`, while TLS renewal is handled by the certbot timer.

### Incident-handling runbook

- **Bridge unreachable**: check `docker compose logs` first, then confirm the nginx reverse-proxy secret path matches the `URL` path in `.env`, that the TLS certificate hasn't expired, and that 443 is open.
- **Certificate expired**: run `certbot renew`, then `systemctl reload nginx`.
- **Abuse or legal inquiries**: a bridge is a guard/middle role and never connects to the destination. Explain the role of a Tor bridge to whoever asks, and refer to the [EFF Tor relay operator legal FAQ](https://community.torproject.org/relay/community-resources/eff-tor-legal-faq/){target="_blank"}.
- **Taking it offline**: `docker compose down` stops the bridge; remove the nginx `location` block and reload.

## FAQ

??? question "How is WebTunnel different from Snowflake and obfs4?"

    All three are bridges that help people get around censorship and reach Tor. Snowflake runs over WebRTC (the real-time connection technology browsers use for video calls) and runs from a browser, but it's easier to detect. obfs4 turns traffic into random noise, but DPI can still recognize it as not-HTTPS and block it. WebTunnel wraps traffic inside a genuine HTTPS connection, so to block it a censor would have to block large numbers of legitimate sites along with it, which makes it most effective in places with strict DPI like China, Iran, and Kazakhstan.

??? question "Is operating a WebTunnel bridge legal? Will someone come knocking?"

    Like guard and middle nodes, a bridge doesn't connect to the final destination; the destination site sees a Tor exit node, not your server. In places where the internet is relatively free, operating these nodes is currently allowed, and the risk is far lower than an exit node. If you receive an inquiry, refer to the [EFF Tor relay operator legal FAQ](https://community.torproject.org/relay/community-resources/eff-tor-legal-faq/){target="_blank"}.

??? question "How big a server do I need?"

    A small VPS with 512MB RAM can run one, but 1GB is recommended, since the Tor process itself can use close to 1GiB of memory. CPU and bandwidth needs are both modest.

??? question "Can I run it on my home network?"

    Yes, but you'll need a static public IP, the ability to port-forward 443 on your router, and an ISP that permits this kind of traffic. A dynamic home IP makes the bridge address unstable. A VPS is usually simpler and more reliable.

??? question "Is the IP in the bridge line my server's IP?"

    No. The IP in a WebTunnel bridge line is a randomly generated placeholder, present only to satisfy the spec. The client actually connects through your domain and secret path.

??? question "Do I have to use Docker?"

    It's not the only way. You can also build and run the Go binary from source; see [Tor Project | Compile and run WebTunnel from source](https://community.torproject.org/relay/setup/webtunnel/source/){target="_blank"}. For most people, Docker is the easiest path.

## :material-chat-question: Learn more

<div class="grid cards" markdown>

- [:material-chat-question: Why internet freedom matters](../basics/internet-freedom.md)
- [:material-chat-question: What is Tor (Tor Project)](https://support.torproject.org/about/){target="_blank"}
- [:material-snowflake: Tor Snowflake (Tor Project)](https://snowflake.torproject.org/){target="_blank"}

</div>

## :fontawesome-solid-diagram-project: Next steps to get involved

<div class="grid cards" markdown>

- [:material-server-network: Set up a Tor relay (Tor Project)](https://community.torproject.org/relay/){target="_blank"}
- [:material-list-status: Tor relay observation in Taiwan](../regional/tor-relay-watcher.md)
- [:material-bullhorn: After Iran's blackout: traffic surged through our WebTunnel bridge](../blog/posts/iran-blackout-webtunnel.md)

</div>

## Official references

- [Tor Project | WebTunnel Bridge](https://community.torproject.org/relay/setup/webtunnel/){target="_blank"}: the main doc for domain, TLS, and nginx setup.
- [Tor Project | WebTunnel Docker setup](https://community.torproject.org/relay/setup/webtunnel/docker/){target="_blank"}: Docker deployment.
- [Tor Project | Compile and run WebTunnel from source](https://community.torproject.org/relay/setup/webtunnel/source/){target="_blank"}: building from source.
- [Introducing WebTunnel](https://blog.torproject.org/introducing-webtunnel-evading-censorship-by-hiding-in-plain-sight/){target="_blank"}: the design rationale behind WebTunnel.
