---
title: Setting up a .onion service
description: Set up a v3 onion service the way the Tor Project documents it, route it through nginx with subdomains, and understand what a vanity address does and does not prove.
icon: material/onepassword
---

# :material-onepassword: Setting up a .onion service

An onion service lets people reach your server over Tor without the server's IP being public and without registering a domain with any certificate authority. Both ends of the connection stay inside the Tor network, and Tor handles the encryption.

This page walks through setting up a v3 onion service, routing it through nginx, handling subdomains, and generating a vanity address. It also covers what a vanity address does not prove, which is the part people most often get wrong.

!!! info "Read the design first if you have not"

    This page is the procedure. For how onion services are designed, how they compare with IPFS, and how anoni.net runs its three-track deployment, see [Decentralized publishing: IPFS and Onion](../advanced/dweb-ipfs-onion.md).

    If you only want to share files or stand up a throwaway site, [OnionShare](../tools/onionshare.md) costs less than running your own service. This page is about something you intend to keep running.

## What you need

- A server you control, Linux assumed
- `tor` installed, distribution packages are generally recent enough for v3
- A web service already listening on `127.0.0.1`

No domain, no public IP, no TLS certificate.

## 1. The way the Tor Project documents it

Edit `torrc` and add two lines. The example from the [Tor Project's setup guide](https://community.torproject.org/onion-services/setup/){target="_blank"}:

```
HiddenServiceDir /var/lib/tor/my_website/
HiddenServicePort 80 127.0.0.1:80
```

`HiddenServiceDir` is where Tor keeps this service's identity. In `HiddenServicePort`, the first number is the port exposed on the onion address, and what follows is where your backend actually listens.

A Unix socket works too, which keeps the backend off TCP entirely:

```
HiddenServiceDir /var/lib/tor/my-website/
HiddenServicePort 80 unix:/var/run/tor/my-website.sock
```

### Directory permissions

The official guide says one thing about this: the directory must be "readable/writeable by the user that will be running Tor". It gives no specific permission values.

In practice only Tor's own user may read or write that directory. By default, loosening it makes Tor refuse to start and say so in its log. Packaged installs typically run as `debian-tor` or `tor`, and the service unit for your distribution will tell you which.

If another process needs to read `hostname`, `torrc` has `HiddenServiceDirGroupReadable 1`, which lets the filesystem group read the directory and the `hostname` file. The default is `0`. The key files do not become group-readable through it.

When Tor will not start, the owner and mode of this directory is the first thing to check.

### Getting your address

After restarting `tor`, several files appear under `HiddenServiceDir`. The one named `hostname` holds the service's v3 address, 56 characters plus `.onion`.

The rest are the service's keys. The official warning is worth reading in full:

> The other files are your Onion Service keys, so it is imperative that these are kept private. If your keys leak, other people can impersonate your Onion Service, deeming it compromised, useless, and dangerous to visit.

A key leak has no remedy. The onion address is an encoding of the public key, there is no revocation mechanism, and no authority can retire it for you. All you can do is generate a new address and tell every reader, and telling them is exactly what tends to be impossible in a censored environment.

Back up the whole `HiddenServiceDir` directory, and protect wherever you put that backup to the same standard as the server itself, or better.

## 2. Routing through nginx

The onion service only forwards connections to the address and port you name. Everything after that is nginx's decision.

Bind the backend to `127.0.0.1` only, with no port exposed externally. Your firewall needs no inbound rule for the onion service at all, because Tor makes outbound connections rather than accepting inbound ones.

```nginx
server {
    listen 127.0.0.1:80;
    server_name <your-address>.onion;

    root /var/www/site;
    index index.html;
}
```

`server_name` must carry the actual onion address. Without it the request lands on nginx's default server and usually returns the wrong content or a placeholder page.

### Using a Unix socket instead

If `torrc` points at a `unix:` path, nginx has to listen on that same socket, which keeps the backend off TCP entirely.

```nginx
server {
    listen unix:/var/run/tor/my-website.sock;
    server_name <your-address>.onion;

    root /var/www/site;
    index index.html;
}
```

The two paths must match exactly: the `unix:` path in `HiddenServicePort` and the one in nginx's `listen unix:`.

nginx creates the socket and Tor connects to it, so Tor's user has to be able to write to it. The `listen` directive has no parameter for the socket's owner, group, or mode, so this can only be handled from the filesystem side:

- Put the socket in a directory that only nginx and Tor can enter
- After reloading nginx, check the socket's actual owner and mode rather than assuming the default works
- When Tor cannot connect, its log shows a connection refused message, which is usually a permission problem

The `GroupWritable` and `WorldWritable` flags in `torrc` do not apply here. Those govern sockets Tor creates itself, such as `ControlSocket` and `SocksPort`.

### Do not add HTTPS on top

A connection to an onion service is already end-to-end encrypted and authenticated, because the address is the public key. Wrapping it in TLS creates two problems and solves none: public certificate authorities generally do not issue certificates for `.onion`, and a self-signed certificate puts a browser warning in front of every visitor.

Serve plain HTTP and let Tor do the encryption.

### Where deployments usually go wrong

- **Clearnet URLs in backend responses**: links, form actions, and redirects that point at your original domain take the visitor straight out of Tor on the first click, and the anonymity is gone at that moment
- **External resources**: images, fonts, and analytics loaded from clearnet make the visitor's browser reach out the same way
- **`Host` header checks**: some application frameworks reject any `Host` not on an allowlist, so the onion address has to be added there

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

## 4. Vanity addresses

By default the address is 56 random characters. To get a recognisable string at the front, such as `anoninet` for anoni.net, you generate keys repeatedly until one starts the way you want.

[mkp224o](https://github.com/cathugger/mkp224o){target="_blank"} is the usual tool, and the [Tor Project's page on vanity addresses](https://community.torproject.org/onion-services/advanced/vanity-addresses/){target="_blank"} is built around it.

Building and running it:

```bash
./autogen.sh
./configure
make
./mkp224o -d nekokeys neko
```

On AMD64, adding `--enable-amd64-51-30k` to `configure` gets better throughput. On BSD, use `gmake` instead of `make`. The key directory it produces has the same layout as `HiddenServiceDir`, so you can move it straight into place.

### What it costs

The mkp224o documentation estimates that a 6-character prefix "shouldn't take more than few tens of minutes, if using batch mode", and that 7 characters "can take hours to days". It also says the whole thing "depends on pure luck", so no figure is a promise.

Each additional character multiplies the search space by 32. The `anoninet` prefix anoni.net uses is 8 characters, an order of magnitude past the 7 characters the documentation puts at "hours to days".

### The character set limits what is possible

Onion addresses use base32, whose alphabet is `a` through `z` and `2` through `7`. The digits `0`, `1`, `8`, and `9` do not exist in it, so no prefix containing them can ever be generated. mkp224o checks for this and fails early rather than searching forever.

### A vanity address proves nothing about identity

This is the part that gets misread. The Tor Project puts it this way:

> An attacker wishing to impersonate an existing onionsite by creating a fake version of it might use vanity addresses as an additional way to convince users that their address is the right one.

Anyone with ordinary computing resources can generate another address starting with `anoninet`. A matching prefix does not mean it is the same service. It is a memorability aid and carries no verification weight at all.

So if you run a vanity address, be clear with yourself about what it buys: readability, not trust. Publish the full 56 characters, and when you verify someone else's address, compare all of it rather than the opening.

The security properties are unaffected. Everything past the prefix is still randomly generated, and a vanity address is no easier to attack than any other.

## 5. Before you announce it

- Connect once with Tor Browser and confirm the content is right
- Read the page source and confirm nothing loads from clearnet
- Click through the main links and confirm none of them leave Tor
- Confirm `HiddenServiceDir` is backed up and the backup is protected

On the clearnet side, an `Onion-Location` header lets Tor Browser offer visitors the onion version automatically.

## 6. The Caddy route

If your environment already runs Caddy, [Onion mirror with Caddy](https://flower.codes/2025/10/23/onion-mirror.html){target="_blank"} is a walkthrough you can follow.

Caddy requests TLS certificates automatically by default, and you will want that switched off here for the reason given in the nginx section above. The rest of the flow matches this page, and only the routing syntax differs.

## Related reading

- [Decentralized publishing: IPFS and Onion](../advanced/dweb-ipfs-onion.md): the design, the trade-offs between the two, and how anoni.net's three-track deployment fits together
- [Help pin the docs site's IPFS mirror](./pin-ipfs-mirror.md): a different way to run a censorship-resistant mirror
- [Setting up a Tor relay](./setup-tor-relay.md): another way to contribute capacity to the Tor network
- [OnionShare](../tools/onionshare.md): share files and host a site without operating a service yourself
