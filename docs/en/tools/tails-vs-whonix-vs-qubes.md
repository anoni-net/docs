---
title: Tails vs Whonix vs Qubes
description: Three anonymity operating systems built on different philosophies (amnesia, isolation, compartmentalization), which threat each one fits, and where to go for setup depth.
icon: material/compare-horizontal
---

# :material-compare-horizontal: Tails vs Whonix vs Qubes

For most anonymous browsing, the [Tor Browser](./tor-browser-advanced.md) on your everyday computer is enough. Some work pulls the whole machine into the threat model: reviewing untrusted files, keeping a long-running workflow walled off from your daily identity, or doing sensitive tasks on hardware you do not control. At that point you isolate the operating system, not just the browser.

Three systems come up together for this: [Tails](https://tails.net/){target="_blank"}, [Whonix](https://www.whonix.org/){target="_blank"}, and [Qubes OS](https://www.qubes-os.org/){target="_blank"}. They are easy to read as a ranked ladder, with Qubes "best" and Tails "entry level." They are not a ladder. They solve different problems and answer to different threats, and the right one depends on what you are protecting and how much you can invest, which is the work of [threat modeling](../basics/threat-model.md).

This page is the neutral side-by-side. It does not re-document install steps; the projects' own docs do that better and keep it current. The depth links at the end route you there.

## Three philosophies, not three tiers

Each system is built around a different core idea.

- **Tails is amnesia.** It boots from a USB stick, runs in memory, writes nothing to the internal disk, and forgets everything at shutdown. All internet traffic is forced through Tor, and applications are blocked if they try to connect without it.[^1] The design goal is to use an untrusted machine for one session and leave no trace.
- **Whonix is isolation.** It splits the system into two virtual machines: a **Gateway** that runs Tor and is the only VM with network access, and a **Workstation** where you actually work. The Workstation can only reach the internet through the Gateway, so even a compromised application or root-level malware cannot discover your real IP address.[^2] Whonix runs on top of a host OS, commonly with VirtualBox or KVM, or inside Qubes.
- **Qubes OS is compartmentalization.** It uses the Xen hypervisor to isolate your activities into separate VMs ("qubes"), so a compromise in one (say, a risky download) does not reach the others (your banking, your work).[^3] Qubes does not force Tor by default. To get system-wide Tor it integrates Whonix as an officially supported template, which combines compartmentalization with forced-Tor isolation.[^4]

The shorthand: Tails forgets, Whonix routes, Qubes separates. Tails and Whonix are organized around Tor traffic. Qubes is organized around keeping unrelated activities from contaminating each other, and adds Tor by layering Whonix on top.

## Which one fits which threat

| If your situation is... | The fit is | Why |
|---|---|---|
| A short, high-sensitivity task on a machine you don't trust (a borrowed laptop, a hotel workstation) | **Tails** | Boots from USB, leaves nothing behind, forces Tor. Pull the stick and the session is gone. |
| A long-running Tor workflow you want to keep (same bookmarks, settings, files each day) on a host you control | **Whonix** | Persistent VMs, cross-platform host, and a Gateway that stops any app from leaking your real IP. |
| Strict separation of work, personal, banking, and high-risk activity on one machine, with Tor where you need it | **Qubes (with the Whonix template)** | Per-activity isolation plus forced-Tor for the qubes that need it. The strongest combination, at the highest cost. |

These map onto the roles in your [threat model](../basics/threat-model.md). A journalist meeting a source on the road leans Tails; an IT practitioner or researcher running a continuous sensitive workflow leans Whonix or Qubes. A user who only needs anonymous browsing needs none of the three: the [Tor Browser](./tor-browser-advanced.md) covers that.

## The trade-offs that actually decide it

The choice usually comes down to hardware and learning curve, not security philosophy.

- **Tails** asks the least of your hardware: a USB stick and a 64-bit x86-64 PC. Apple Silicon Macs (M1, M2, and later) are ARM and cannot run Tails.[^5] It is the fastest to learn, because there is little to configure. The cost is the flip side of amnesia: by default it remembers nothing, so a recurring workflow means reconfiguring each session or setting up encrypted Persistent Storage.
- **Whonix** needs a host capable of running VMs and enough memory to hold two of them at once. It is cross-platform (Windows, macOS, Linux hosts), which makes it the pragmatic path when finding dedicated x86-64 hardware is hard. The key limitation is that its security still rests on the host OS: if the host is compromised, the VMs are exposed in ways Qubes is designed to resist.
- **Qubes** is the most demanding. It requires a 64-bit Intel or AMD processor with hardware virtualization (VT-x or AMD-V) and IOMMU (VT-d or AMD-Vi), a minimum of 6 GB RAM with 16 GB recommended, and an SSD is strongly recommended.[^6] It does not support ARM, so Apple Silicon is out. The learning curve is real: deciding which qube each file and device belongs to takes time to internalize. Before buying or committing hardware, check the [Hardware Compatibility List](https://www.qubes-os.org/hcl/){target="_blank"}.

A reasonable progression for people without Qubes-ready hardware is to start with Tails for one-off tasks or Whonix for an ongoing workflow, then move to Qubes once the hardware and the time to learn it are both available.

## A note on Apple Silicon

If your only machine is an Apple Silicon Mac, the practical options narrow sharply. Tails and Qubes both require x86-64 and do not run on ARM.[^5][^6] Whonix has no ready-to-download prebuilt ARM image; running it on Apple Silicon means building from source, which the project flags as developer-oriented and not recommended for security-sensitive use. Most people who need serious whole-machine isolation keep a separate x86-64 PC for it (a used business-class laptop is a common choice; confirm any model against the Qubes HCL first).

## Where to go from here

This page is the comparison. For what each system *is* and how to install it, the projects' own documentation is the authority, and we don't try to duplicate it.

- [Privacy Guides: Desktop/PC](https://www.privacyguides.org/en/desktop/){target="_blank"} for the broader, regularly maintained recommendation set across operating systems.
- [Tails documentation](https://tails.net/doc/){target="_blank"} and the [Tails installation guide](https://tails.net/install/){target="_blank"} for getting a verified USB running.
- [Whonix wiki](https://www.whonix.org/wiki/Documentation){target="_blank"} and its [download page](https://www.whonix.org/wiki/Download){target="_blank"}; the VirtualBox path is the simplest first install.
- [Qubes OS documentation](https://www.qubes-os.org/doc/){target="_blank"}, the [Hardware Compatibility List](https://www.qubes-os.org/hcl/){target="_blank"}, and the [installation guide](https://www.qubes-os.org/doc/installation-guide/){target="_blank"}.

Whole-machine isolation is one layer of an anonymity setup. Pair it with the [Tor Browser advanced settings](./tor-browser-advanced.md) at the browser layer, and start from [Anonymity, privacy, pseudonymity, and confidentiality](../basics/anonymity-vs-privacy.md) and your [threat model](../basics/threat-model.md) so the whole stack fits the risk you actually face. The full [Tools](./index.md) index lists the rest.

[^1]: [How Tails works](https://tails.net/about/index.en.html){target="_blank"} and [Tor enforcement](https://tails.net/contribute/design/Tor_enforcement/){target="_blank"} - Tails. Tails runs from a USB stick, leaves no trace at shutdown, routes all internet traffic through Tor, and blocks applications that try to connect without it.

[^2]: [About Whonix](https://www.whonix.org/wiki/About){target="_blank"} and [Reliable IP Hiding](https://www.whonix.org/wiki/Reliable_IP_Hiding){target="_blank"} - Whonix. The Whonix-Workstation reaches the network only through the Whonix-Gateway, which runs Tor, so the Workstation never learns the real external IP and even root-level malware cannot leak it.

[^3]: [What is Qubes OS?](https://www.qubes-os.org/){target="_blank"} and [Introduction](https://doc.qubes-os.org/en/latest/introduction/intro.html){target="_blank"} - Qubes OS. Qubes uses Xen-based virtualization to isolate activities into separate qubes so that the compromise of one does not affect the rest of the system.

[^4]: [Whonix templates for Qubes OS](https://www.qubes-os.org/news/2024/02/05/whonix-17-templates-available-for-qubes-os-4-1/){target="_blank"} - Qubes OS, and [Qubes-Whonix](https://www.whonix.org/wiki/Qubes){target="_blank"} - Whonix. Qubes officially supports Whonix templates, which run the Whonix Gateway and Workstation as qubes to enable system-wide Tor.

[^5]: [System requirements](https://tails.net/doc/about/requirements/index.en.html){target="_blank"} - Tails. Tails requires a 64-bit x86-64 IBM PC compatible processor; Mac computers with an Apple processor (M1, M2, and so on) are incompatible.

[^6]: [System requirements](https://doc.qubes-os.org/en/latest/user/hardware/system-requirements.html){target="_blank"} - Qubes OS. Minimum: 6 GB RAM, 64-bit Intel or AMD processor with VT-x/AMD-V and VT-d/AMD-Vi (IOMMU), 32 GB storage. Recommended: 16 GB RAM and a fast SSD. ARM is not supported.
