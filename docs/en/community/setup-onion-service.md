---
title: Setting up a .onion service
description: Set up a v3 onion service the way the Tor Project documents it, route it through nginx with subdomains, with permissions, logs, troubleshooting and what happens after it goes live, plus what a vanity address does and does not prove.
icon: material/onepassword
---

# :material-onepassword: Setting up a .onion service

An onion service lets people reach your server over Tor without the server's IP being public and without registering a domain with any certificate authority. Both ends of the connection stay inside the Tor network, and Tor handles the encryption.

This page walks through setting up a v3 onion service, routing it through nginx, handling subdomains, and knowing where to look when something breaks.

!!! info "This is not the same as running a relay or a bridge"

    [Tor Relay](./setup-tor-relay.md), [WebTunnel bridges](./setup-tor-webtunnel.md), and [Snowflake](../tools/tor-snowflake.md) all **contribute bandwidth to the Tor network** by carrying other people's traffic.

    An onion service **uses Tor to host your own site**. It serves only your content, carries nobody else's traffic, and adds nothing to the network's capacity. The risks, the legal position, and the operational burden are all different.

    For how onion services are designed, how they compare with IPFS, and how anoni.net runs its three-track deployment, see [Decentralized publishing: IPFS and Onion](../advanced/dweb-ipfs-onion.md). If you only want to share files or stand up a throwaway site, [OnionShare](../tools/onionshare.md) costs less than running your own service.

## What you need

- A server you control, Linux assumed
- `tor` installed. Check with `tor --version`; distribution packages are generally recent enough for v3
- A web service listening on `127.0.0.1`

### Check where your web service listens

```bash
sudo ss -ltnp | grep -E 'nginx|apache|caddy'
```

Look at the `Local Address` column. `127.0.0.1:80` means only the local machine can reach it, which is what we want here. `0.0.0.0:80` or `*:80` means it is open to the whole internet.

Either works with an onion service. If you want to keep the clearnet version of the site, leave it listening publicly, because Tor can still reach `127.0.0.1`. Only if your goal is for the server to be invisible from clearnet do you need to rebind the service to `127.0.0.1` and close the public port.

### Outbound connections have to work

Tor reaches the network by connecting outward. Your firewall needs **no inbound rule** for an onion service, but on a corporate network with restricted egress, Tor will never join the Tor network and nothing after this point will work. On internal networks this is the first thing that goes wrong.

## 1. The way the Tor Project documents it

The configuration file is `/etc/tor/torrc`. Edit it and add two lines. The example from the [Tor Project's setup guide](https://community.torproject.org/onion-services/setup/){target="_blank"}:

```
HiddenServiceDir /var/lib/tor/my_website/
HiddenServicePort 80 127.0.0.1:80
```

`HiddenServiceDir` is where Tor keeps this service's identity. In `HiddenServicePort`, the first number is the port exposed on the onion address, and what follows is where your backend actually listens.

One `torrc` can hold several, each with its own onion address:

```
HiddenServiceDir /var/lib/tor/site-a/
HiddenServicePort 80 127.0.0.1:8080

HiddenServiceDir /var/lib/tor/site-b/
HiddenServicePort 80 127.0.0.1:8081
```

Each `HiddenServicePort` belongs to the nearest `HiddenServiceDir` above it.

### Directory permissions

The official guide says one thing about this: the directory must be "readable/writeable by the user that will be running Tor". It gives no specific permission values. The actual threshold is clear enough: **the directory has to be `0700`**, and anything looser is rejected.

Packaged installs typically run as `debian-tor` or `tor`. To check which:

```bash
systemctl cat tor@default.service | grep -E 'User=|debian-tor'
ps -o user= -C tor
```

Setting and verifying the permissions:

```bash
sudo chown -R debian-tor:debian-tor /var/lib/tor/my_website
sudo chmod 0700 /var/lib/tor/my_website
sudo ls -ld /var/lib/tor/my_website
```

If Tor creates the directory itself, which it does once `torrc` names it and you restart, the permissions are already correct and the two commands above are only needed when you created the directory by hand.

If another process needs to read `hostname`, `torrc` has `HiddenServiceDirGroupReadable 1`, which lets the filesystem group read the directory and the `hostname` file. The default is `0`. The key files do not become group-readable through it.

### Applying the configuration

```bash
sudo tor --verify-config          # syntax check, leaves the running service alone
sudo systemctl restart tor@default
sudo systemctl status tor@default
```

!!! warning "Debian and Ubuntu ship two units, and restarting the wrong one changes nothing"

    The package provides both `tor.service` and `tor@default.service`. The one that actually runs is `tor@default.service`; `tor.service` is a shell that does nothing. Restarting only `tor.service` leaves your new configuration unapplied, and nothing on screen says so.

    When in doubt, `systemctl list-units 'tor*'` shows which one is `running`.

### Where the logs are

When Tor misbehaves the answer is almost always in the log. Under systemd:

```bash
sudo journalctl -u tor@default -n 50 --no-pager
sudo journalctl -u tor@default -f          # follow
```

`torrc` can also write its own log file, commented out by default:

```
Log notice file /var/log/tor/notices.log
```

The first thing to confirm is that Tor reached the Tor network at all. The log should contain:

```
Bootstrapped 100% (done): Done
```

Without that line Tor has not joined the network yet, and no onion address will appear no matter how correct `HiddenServiceDir` is. Blocked outbound traffic is the usual cause.

### Getting your address

Once Tor starts cleanly, `HiddenServiceDir` holds these files:

| File | Contents |
|---|---|
| `hostname` | the 56-character v3 address plus `.onion` |
| `hs_ed25519_public_key` | public key |
| `hs_ed25519_secret_key` | **private key, unrecoverable if it leaks** |
| `authorized_clients/` | directory for access control, empty by default |

The directory is `0700` and the files are `0600`, all created by Tor. Since only Tor's user can read them, use `sudo` to see the address:

```bash
sudo cat /var/lib/tor/my_website/hostname
```

The remaining files are the service's keys. The official warning is worth reading in full:

> The other files are your Onion Service keys, so it is imperative that these are kept private. If your keys leak, other people can impersonate your Onion Service, deeming it compromised, useless, and dangerous to visit.

A key leak has no remedy. The onion address is an encoding of the public key, there is no revocation mechanism, and no authority can retire it for you. All you can do is generate a new address and tell every reader, and telling them is exactly what tends to be impossible in a censored environment.

!!! tip "How to confirm you are currently fine"

    Run `sudo ls -la /var/lib/tor/my_website`. A directory shown as `drwx------`, files as `-rw-------`, and Tor's user as the owner is the normal state. Tor creates them that way, so nothing extra is needed.

    Back up the whole `HiddenServiceDir` directory. Protect wherever you put that backup to the same standard as the server or better, which in practice means encrypting it, for instance into an encrypted password manager or with `gpg -c`. It does not belong in ordinary cloud storage or a code repository.

## 2. Routing through nginx

The onion service only forwards connections to the address and port you name. Everything after that is nginx's decision.

On Debian and Ubuntu the convention is a file in `/etc/nginx/sites-available/` symlinked into `sites-enabled/`:

```bash
sudo nano /etc/nginx/sites-available/onion
sudo ln -s /etc/nginx/sites-available/onion /etc/nginx/sites-enabled/
sudo nginx -t                     # syntax check, always run this first
sudo systemctl reload nginx
```

The configuration itself:

```nginx
server {
    listen 127.0.0.1:80;
    server_name <your-address>.onion;

    root /var/www/site;
    index index.html;
}
```

`server_name` must carry the actual onion address. If this is the only server block on that `listen`, getting it wrong is harmless. Once several server blocks share the same `listen`, as in the subdomain section below, anything that fails to match lands on nginx's default server and returns the wrong content or a placeholder page.

### Using a Unix socket instead

If `torrc` points at a `unix:` path, nginx has to listen on that same socket, which keeps the backend off TCP entirely.

!!! danger "Do not use `/run/tor/`"

    That is Tor's own runtime directory, created at startup by systemd as `debian-tor`. The unit file spells it out: `ExecStartPre` runs `-o debian-tor -g debian-tor -d /run/tor`. nginx runs as `www-data` and cannot create a socket there.

Create a directory both can use:

```bash
sudo mkdir -p /run/onion
sudo chown www-data:debian-tor /run/onion
sudo chmod 0770 /run/onion
```

`/run` is a tmpfs and is wiped on reboot. To have the directory come back, add a tmpfiles rule:

```bash
echo 'd /run/onion 0770 www-data debian-tor -' | sudo tee /etc/tmpfiles.d/onion.conf
sudo systemd-tmpfiles --create
```

Then point both sides at the same path:

```
HiddenServicePort 80 unix:/run/onion/site.sock
```

```nginx
server {
    listen unix:/run/onion/site.sock;
    server_name <your-address>.onion;

    root /var/www/site;
    index index.html;
}
```

nginx creates the socket and Tor connects to it, so Tor's user has to be able to write to it. The `listen` directive has no parameter for the socket's owner, group, or mode, which leaves the containing directory as the only place to control access.

After reloading, check what you actually got rather than assuming the default works:

```bash
ls -l /run/onion/site.sock
```

Too strict and Tor cannot connect. Too loose and any local user reaches your backend. Both directions matter.

The `GroupWritable` and `WorldWritable` flags in `torrc` do not apply here. Those govern sockets Tor creates itself, such as `ControlSocket` and `SocksPort`.

### The HTTPS trade-off

A connection to an onion service is already end-to-end encrypted and authenticated, because the address is the public key. Wrapping it in TLS adds no cryptographic protection, so the default advice is to serve plain HTTP and let Tor handle encryption.

Two things are worth knowing before you settle on that:

- **Public certificate authorities can issue for `.onion`**: a 2021 CA/Browser Forum ballot allows DV certificates for v3 onion addresses, and commercial CAs offer this today for a fee. If an audit requirement says "TLS everywhere", that route exists
- **Tor Browser still flags plain HTTP onion sites**: a `.onion` served over HTTP is marked as not secure in Tor Browser, a known issue the project tracks (`#21321`). Cryptographically nothing is wrong, but non-technical users who see that wording tend to misread it and report a problem, which comes up especially with internal tools

### Where deployments usually go wrong

- **Clearnet URLs in backend responses**: links, form actions, and redirects that point at your original domain take the visitor straight out of Tor on the first click, and the anonymity is gone at that moment
- **External resources**: images, fonts, and analytics loaded from clearnet make the visitor's browser reach out the same way
- **Referrer leakage**: any link to a clearnet site sends a `Referer` by default, putting your `.onion` address in that site's logs. Add `add_header Referrer-Policy no-referrer;` or `rel="noreferrer"` on the links
- **`Host` header checks**: some application frameworks reject any `Host` not on an allowlist, so the onion address has to be added there
- **Every access log entry shows `127.0.0.1`**: all connections arrive through the local Tor daemon, so the log records the local address rather than the visitor. That is normal, not a broken log configuration

## 3. How subdomains work

An onion address can carry subdomains, and it needs no DNS registration or configuration of any kind. Tor passes the full `Host` through to the backend, and nginx decides how to route it.

The anoni.net docs site address is exactly this shape:

```
docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion
└┬─┘ └─────────────────── the 56-character v3 address ───────────────┘
 └── subdomain, routed by nginx's server_name
```

One onion address can host several subdomains:

```nginx
server {
    listen 127.0.0.1:80;
    server_name docs.<your-address>.onion;
    root /var/www/docs;
}

server {
    listen 127.0.0.1:80;
    server_name <your-address>.onion;
    root /var/www/main;
}
```

Nothing changes in `torrc`. One `HiddenServiceDir` and one `HiddenServicePort` cover all of them.

## 4. Restricting who can connect

If the service is not meant to be open to everyone, v3 onion services have access control built in, known as client authorization. Unauthorized connections are refused at the rendezvous stage and see nothing at all, which is far stronger than keeping the address quiet.

On the server side, authorized public keys go in `HiddenServiceDir/authorized_clients/`. On the client side, `torrc` sets `ClientOnionAuthDir` to a directory holding the private keys. Internal tools and mirrors meant for specific partners both fit this pattern.

Key generation and file formats are in the [Tor Project's client authorization guide](https://community.torproject.org/onion-services/advanced/client-auth/){target="_blank"}.

## 5. Vanity addresses (optional)

!!! info "You can skip this section"

    A vanity address only makes the opening characters memorable. It does not affect whether the service works or how secure it is. On a first deployment, skip it and come back once the service runs properly.

By default the address is 56 random characters. To get a recognisable string at the front, such as `anoninet` for anoni.net, you generate keys repeatedly until one starts the way you want.

[mkp224o](https://github.com/cathugger/mkp224o){target="_blank"} is the usual tool, and the [Tor Project's page on vanity addresses](https://community.torproject.org/onion-services/advanced/vanity-addresses/){target="_blank"} is built around it.

Install what it needs to build, as listed in its own documentation:

```bash
sudo apt install gcc libc6-dev libsodium-dev make autoconf
```

Building and running it:

```bash
./autogen.sh
./configure
make
./mkp224o -d nekokeys neko
```

On AMD64, adding `--enable-amd64-51-30k` to `configure` gets better throughput. On BSD, use `gmake` instead of `make`. The key directory it produces has the same layout as `HiddenServiceDir`, so move it into place and then fix the owner and permissions as described earlier.

### What it costs

The mkp224o documentation estimates a 6-character prefix at "shouldn't take more than few tens of minutes", though that figure comes with a condition the original states as `if using batch mode`, with the details in its `OPTIMISATION.txt`. Seven characters "can take hours to days". It also says the whole thing "depends on pure luck", so no figure is a promise.

Each additional character multiplies the search space by 32. The `anoninet` prefix anoni.net uses is 8 characters, meaning 32 times harder again than the 7 characters the documentation puts at "hours to days".

### The character set limits what is possible

Onion addresses use base32, whose alphabet is `a` through `z` and `2` through `7`. The digits `0`, `1`, `8`, and `9` do not exist in it, so no prefix containing them can ever be generated. mkp224o checks for this and fails early rather than searching forever.

### A vanity address proves nothing about identity

This is the part that gets misread. The Tor Project puts it this way:

> An attacker wishing to impersonate an existing onionsite by creating a fake version of it might use vanity addresses as an additional way to convince users that their address is the right one.

Anyone with ordinary computing resources can generate another address starting with `anoninet`. A matching prefix does not mean it is the same service. It is a memorability aid and carries no verification weight at all.

So if you run a vanity address, be clear with yourself about what it buys: readability, not trust. Publish the full 56 characters, and when you verify someone else's address, compare all of it rather than the opening.

The security properties are unaffected. Everything past the prefix is still randomly generated, and a vanity address is no easier to attack than any other.

## 6. Before you announce it

Work through these in order. Each has a definite pass condition.

**1. Tor reached the network**

```bash
sudo journalctl -u tor@default | grep -i bootstrapped | tail -1
```

You want `Bootstrapped 100% (done)`.

**2. The address exists**

```bash
sudo cat /var/lib/tor/my_website/hostname
```

56 characters plus `.onion`.

**3. The backend answers locally**

```bash
curl -sI http://127.0.0.1:80/ -H 'Host: <your-address>.onion' | head -1
```

You want `HTTP/1.1 200 OK`. Sending the `Host` header mimics what Tor will actually deliver and confirms `server_name` matches.

**4. It answers over Tor**

Open the `.onion` address in Tor Browser. On a headless server:

```bash
sudo apt install torsocks
torsocks curl -sI http://<your-address>.onion/ | head -1
```

!!! warning "Failing the first time usually means it is not ready yet"

    The service descriptor has to be published to the Tor network first, so the first few minutes after setup can fail. Wait a few minutes and try again before changing anything.

    Restarting Tor opens the same gap.

**5. Nothing reaches out to clearnet**

Read the page source and confirm images, fonts, and scripts do not load from clearnet. Click through the main links and confirm none of them leave Tor.

**6. The key is backed up**

See "How to confirm you are currently fine" above.

On the clearnet side, an `Onion-Location` header lets Tor Browser offer visitors the onion version automatically:

```nginx
add_header Onion-Location http://<your-address>.onion$request_uri;
```

Per the official guidance this header belongs on a **clearnet site served over HTTPS**. Setting it on the onion site itself does nothing.

## 7. When you get stuck

??? question "Tor will not start"

    Check the log first: `sudo journalctl -u tor@default -n 50`.

    `Permissions on directory ... are too permissive` is the directory permission problem. `sudo chmod 0700` on that directory fixes it.

    `Failed to parse/validate config` means a `torrc` syntax error, and `sudo tor --verify-config` points at the line.

??? question "I edited torrc but nothing changed"

    Usually this means restarting `tor.service` instead of `tor@default.service`. Confirm which one runs with `systemctl list-units 'tor*'`.

??? question "The log looks fine but I cannot reach the site"

    Rule things out in this order:

    1. Does the log show `Bootstrapped 100%`? If not, Tor never joined the network. Check outbound firewall rules
    2. Does `hostname` exist? If not, the `HiddenServiceDir` block never took effect
    3. Did you just set this up or restart? Descriptor publication takes time. Wait a few minutes
    4. Does the backend answer locally (step 3 of the previous section)? If not, the problem is nginx rather than Tor

??? question "Permissions look right but Tor still cannot access the directory"

    On a non-default path this is often AppArmor or SELinux. The failure does not look like a permission error, and `ls -l` shows nothing wrong.

    ```bash
    sudo journalctl -k | grep -i 'apparmor.*DENIED'
    sudo dmesg | grep -i denied
    ```

    If that matches, moving the path back under `/var/lib/tor/` is the quickest fix. The systemd unit's own sandboxing (`ProtectSystem`, `ReadWritePaths`) can block non-default paths too, so check that as well.

??? question "How do I debug the nginx side"

    ```bash
    sudo nginx -t
    sudo tail -50 /var/log/nginx/error.log
    ```

    With a Unix socket, confirm the socket exists and Tor's user can write to it: `ls -l /run/onion/site.sock`.

??? question "It broke after a reboot"

    A socket under `/run` lives on a tmpfs and is wiped on reboot. It comes back only with a rule in `/etc/tmpfiles.d/`, described in section 2.

    Also check the startup order of nginx and tor, since nginx has to create the socket before Tor can connect to it.

## 8. After it goes live

### The service will not tell you when it breaks

A running Tor process does not mean the descriptor is still published. Connecting from outside on a schedule is the most direct check, for instance a cron job running `torsocks curl`.

### Restarts leave a gap

Every restart republishes the descriptor, and the service is unreachable for a few minutes. That is not a fault.

### Latency is a fixed cost

Connections traverse several relays, and round trips typically run from a few hundred milliseconds to over a second. Interactive applications such as admin panels or live collaboration feel noticeably worse over onion than over clearnet, while static content suffers less. Weigh this before deciding a given service belongs on an onion address.

### Moving machines means moving HiddenServiceDir

The address is bound to the key, so copying the whole directory across with the right permissions keeps the address unchanged. This is also why that backup deserves to be treated as secret material.

### Taking it down deliberately

Remove the two lines from `torrc` and restart. Once an address stops answering there is no way to tell anyone what happened, so if readers depend on it, announce the change on the clearnet side first.

## 9. The Caddy route

If your environment already runs Caddy, [Onion mirror with Caddy](https://flower.codes/2025/10/23/onion-mirror.html){target="_blank"} is a walkthrough you can follow.

Caddy requests TLS certificates automatically by default, and you will want that switched off for the reason given in the HTTPS section above. The rest of the flow matches this page, and only the routing syntax differs.

## Related reading

- [Decentralized publishing: IPFS and Onion](../advanced/dweb-ipfs-onion.md): the design, the trade-offs between the two, and how anoni.net's three-track deployment fits together
- [Help pin the docs site's IPFS mirror](./pin-ipfs-mirror.md): a different way to run a censorship-resistant mirror
- [Setting up a Tor relay](./setup-tor-relay.md): contributing bandwidth to the Tor network, a different kind of task from this one
- [OnionShare](../tools/onionshare.md): share files and host a site without operating a service yourself

When one machine is no longer enough to carry an onion address, the Tor Project hosts [OnionBalance](https://gitlab.torproject.org/tpo/onion-services/onionbalance){target="_blank"} for distributing it across several. The project went quiet between 2021 and 2025, resumed releases in April 2025, and currently sits at `0.2.4`, so check its recent activity before committing to it.
