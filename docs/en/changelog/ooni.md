---
title: OONI Changelog
description: English summaries of OONI Probe, Explorer, and Run releases, the network censorship measurement tools developed by OONI, with notes on key changes and new features.
icon: material/access-point-network
---

# :material-access-point-network: OONI Changelog

[OONI](https://ooni.org/){target="_blank"} Probe, Explorer, and Run release summaries. Newest at the top. Each entry links back to the full translation.

## OONI Probe 6.0.2

> 2026-05-25 · [Upstream announcement](https://github.com/ooni/probe-multiplatform/releases/tag/v6.0.2){target="_blank"}

- Measurement engine remains on OONI Probe CLI v3.29.0.
- Cleaner UI for measurement results that contain errors.
- Updated translations: Japanese, Greek, Portuguese, German, Chinese.
- Secure storage implementation rolled out across Android, desktop (macOS, Linux, Windows), and iOS.
- Desktop adds Windows Store as a distribution channel and refactors the desktop distribution-channel architecture.
- Desktop tray menu adds a Force Quit option (revealed by holding Alt).
- Desktop database now uses WAL mode for steadier I/O.
- Toolchain upgraded to Java 25; Kotlin, Ktor, Sentry SDK, and Compose dependencies bumped accordingly.
- Various bug fixes and stability improvements.

!!! info "Earlier OONI Probe versions"

    OONI Probe 6.0.1, 6.0.0, and 5.3.0 release notes, plus the OONI Probe Desktop 6.0.1 beta and OONI Explorer thematic censorship pages translations, are currently available only in [traditional Chinese](https://anoni.net/docs/changelog/ooni/){target="_blank"}. English versions will be added as the community translates them.
