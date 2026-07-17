---
title: Help pin the site's IPFS mirror
description: Run one always-on IPFS node plus a scheduled script to pin the latest anoni.net docs mirror and raise its resistance to takedown. For node contributors on Windows, Linux, and macOS, with and without Docker.
icon: simple/ipfs
---

# :simple-ipfs: Help pin the site's IPFS mirror

Alongside the main site, the anoni.net docs are also published as an IPFS mirror, so the content stays readable when the main site is blocked or taken down. Content on IPFS only survives while some node pins it, and right now only the community's own node does. Every extra node that helps pin is one more complete copy on the network, and more resistance to takedown.

This page walks you through running one always-on IPFS node plus a small scheduled script that keeps up with the latest version automatically. It works the same on Windows, Linux, and macOS, with or without Docker.

!!! tip "What you need to help"

    - A computer that stays on most of the day and can reach the network (a desktop, a home server, or a small always-on box).
    - IPFS installed (this page shows you how).
    - A scheduled script that pins the latest version every few hours.

    Can't run a node? The "No node" section at the end covers pinning through a service instead.

## Why the CID changes every time (30-second IPFS primer)

If IPFS is new to you, one idea makes the rest of this page make sense. For the deeper design, see the [IPFS content addressing docs](https://docs.ipfs.tech/concepts/content-addressing/){target="_blank"}; here is just enough to work with.

- IPFS hashes a file's content into a CID (Content Identifier), and that CID *is* the content's address. Identical content always has the same CID.
- Change the content and the CID changes with it. Every time the docs site updates and republishes, a brand-new CID is produced.
- IPNS (InterPlanetary Name System) is a fixed name that always points to the *current* CID. The site's IPNS name is the `k51…` string below.
- Pinning means "guarantee this specific CID stays available." A pin is bound to a CID and does not follow IPNS on its own. So the moment the site publishes a new version, what you pinned last time is still the old CID.

That is exactly what the script does: resolve IPNS to the current CID, pin that new CID, then drop the old one. Because the CID changes, this has to run periodically, which is why it's scheduled.

## How it works (why a schedule is enough, no notification needed)

Nobody has to tell you "a new version is out." IPNS is the shared sync point, and your script resolves it to get the latest CID by itself. When the site publishes, it just updates IPNS as usual; your side resolves every few hours, notices the change, and pins the new version. No manual coordination anywhere.

!!! info ""

    The site's IPFS coordinates (public values, use them directly):

    - IPNS name: `k51qzi5uqu5dlfm2jj0f70ex3r3babmwy8qh071inwknttr7wqa3uhdwvlmrmw`
    - Open in a browser: [https://anoni-net.ipns.dweb.link/](https://anoni-net.ipns.dweb.link/){target="_blank"}

Each run does this: resolve IPNS to the current CID, pin the new CID, unpin the previous one, reclaim space. The script confirms the new version pinned successfully *before* dropping the old one. If resolving or fetching fails, it keeps the copy you already have and never empties your node.

## Step 1: Run an always-on IPFS node

For pinning to fetch the content, your machine needs a continuously running IPFS daemon. Pick one setup below.

=== "Linux / macOS"

    Install [kubo](https://docs.ipfs.tech/install/command-line/){target="_blank"}, IPFS's official command-line implementation. On macOS you can use Homebrew:

    ```bash
    brew install ipfs
    ```

    On Linux, download the kubo build for your architecture from the [official guide](https://docs.ipfs.tech/install/command-line/){target="_blank"}. Then initialize and start the daemon:

    ```bash
    ipfs init          # first time only
    ipfs daemon
    ```

    To keep the daemon running long-term, use a systemd user service on Linux, or `brew services` / launchd on macOS. For a quick test, running `ipfs daemon` in the background is fine.

=== "Windows"

    The easiest option is [IPFS Desktop](https://docs.ipfs.tech/install/ipfs-desktop/){target="_blank"}. It bundles kubo and, once you log in, stays running in the system tray with the daemon always on.

    After installing, make sure `ipfs` is callable from the command line. A standalone kubo install needs `ipfs.exe` added to your PATH; with IPFS Desktop, if PATH can't find `ipfs`, use the full path in the script instead.

=== "Docker"

    Run kubo with a `docker-compose.yml`, naming the container `ipfs_host`:

    ```yaml
    services:
      ipfs_host:
        image: ipfs/kubo:latest
        restart: always
        volumes:
          - ./ipfs-data:/data/ipfs
        ports:
          - "4001:4001"   # swarm; exposing it helps reach other nodes
    ```

    Start it:

    ```bash
    docker compose up -d
    ```

    From here, run IPFS commands through the container by setting an environment variable the script picks up automatically (used in the next step):

    ```bash
    export IPFS_CMD="docker exec ipfs_host ipfs"
    ```

## Step 2: Get the pin script

The script resolves IPNS, pins the new version, and unpins the old one on its own. The IPNS name is hard-coded in it, so there's nothing to edit. Docker users: set `IPFS_CMD` from the previous step first.

### Linux, macOS, Docker: `anoni-pin.sh`

[:material-download: Download anoni-pin.sh](https://raw.githubusercontent.com/anoni-net/docs/main/docs/_scripts/anoni-pin.sh){ .md-button }

```bash
--8<-- "_scripts/anoni-pin.sh"
```

Save it and make it executable:

```bash
chmod +x anoni-pin.sh
./anoni-pin.sh          # run once by hand to check it works
```

### Windows: `anoni-pin.ps1`

[:material-download: Download anoni-pin.ps1](https://raw.githubusercontent.com/anoni-net/docs/main/docs/_scripts/anoni-pin.ps1){ .md-button }

```powershell
--8<-- "_scripts/anoni-pin.ps1"
```

Run it once by hand to check it works (PowerShell blocks scripts by default, so `-ExecutionPolicy Bypass` allows this one run):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\anoni-pin.ps1
```

## Step 3: Schedule it

Have the script run every few hours. The site doesn't update often, so every 6 hours is plenty; shorten it if you want to keep up faster.

=== "Linux / macOS"

    Use cron. Edit your crontab:

    ```bash
    crontab -e
    ```

    Add a line that runs every 6 hours and writes output to a log:

    ```bash
    0 */6 * * * /path/to/anoni-pin.sh >> $HOME/.anoni-pin/log 2>&1
    ```

    To also catch up on missed runs after a reboot, use a systemd timer with `Persistent=true` instead, which is more reliable.

=== "Windows"

    Use Task Scheduler. The quickest way is to create it from the command line, running every 6 hours:

    ```powershell
    schtasks /Create /TN "anoni-ipfs-pin" `
      /TR "powershell -NoProfile -ExecutionPolicy Bypass -File C:\Tools\anoni-pin.ps1" `
      /SC HOURLY /MO 6 /RL LIMITED
    ```

    Replace `C:\Tools\anoni-pin.ps1` with wherever you saved it. You can also use the Task Scheduler GUI: set the program to `powershell` and the arguments to `-NoProfile -ExecutionPolicy Bypass -File your-path`.

=== "Docker"

    Schedule according to your host OS (cron on Linux/macOS, Task Scheduler on Windows; see the two tabs above). The only difference is setting `IPFS_CMD` before the script runs, for example via a small wrapper:

    ```bash
    #!/usr/bin/env bash
    export IPFS_CMD="docker exec ipfs_host ipfs"
    exec /path/to/anoni-pin.sh
    ```

    Point cron at this wrapper.

## Step 4: Verify

Confirm the content is actually pinned. Resolve the current CID, then check it's in the pin list:

```bash
CID=$(ipfs name resolve --nocache /ipns/k51qzi5uqu5dlfm2jj0f70ex3r3babmwy8qh071inwknttr7wqa3uhdwvlmrmw)
ipfs pin ls --type=recursive | grep "${CID#/ipfs/}"
```

You can also open it on your local gateway and check it renders: `http://127.0.0.1:8080${CID}/`. Docker users: replace `ipfs` above with `docker exec ipfs_host ipfs`.

## Maintenance and notes

- **It keeps up automatically.** When the site changes its CID, the next scheduled run pins the new version and drops the old one. You do nothing.
- **Disk use stays flat.** After unpinning the old version the script runs a garbage collection, so only the latest version takes space. The site is a plain static site and isn't large.
- **It won't lose the copy you have.** The script pins the new version successfully before dropping the old one, and keeps your existing copy if resolving or downloading fails.
- **To stop helping:** unpin the current version and remove the schedule. It doesn't affect any other node.
- **Privacy and risk:** what you pin is public documentation, so there's no privacy concern. Offering IPFS pinning carries different legal risk across jurisdictions, so weigh that for where you operate.

## No node: pin through a service instead

If you'd rather not maintain a daemon and a schedule, use a pinning service like [Pinata](https://www.pinata.cloud/){target="_blank"} or [Storacha](https://storacha.network/){target="_blank"}. Paste the current CID into their interface to pin it manually, or script their API to feed it new CIDs, with the same logic as this page (resolve IPNS to a CID, hand the CID to the service).

The trade-off is that survival now depends on a third-party provider rather than your own node. Fine as a backup; for real decentralization, running your own node is the most direct.

## :fontawesome-solid-diagram-project: Related reading

<div class="grid cards" markdown>

- [:material-tunnel-outline: Set up a Tor WebTunnel bridge](./setup-tor-webtunnel.md)
- [:material-download: Install the site as an offline app](../offline-install.md)
- [:material-hand-heart-outline: How to contribute](./how-to-contribute.md)

</div>
