---
title: OONI Changelog
description: English summaries of OONI Probe, Explorer, and Run releases, the network censorship measurement tools developed by OONI, with notes on key changes and new features.
icon: material/access-point-network
---

# :material-access-point-network: OONI Changelog

[OONI](https://ooni.org/){target="_blank"} Probe, Explorer, and Run release summaries. Newest at the top. Each entry links back to the full translation.

## OONI Probe 6.1.1

> 2026-07-07 · [Upstream announcement](https://github.com/ooni/probe-multiplatform/releases/tag/v6.1.1){target="_blank"}

- Measurement engine remains on OONI Probe CLI v3.29.0.
- Desktop adds in-app language selection, so the interface no longer has to follow the system locale.
- Android migrates to AGP 9 and adds the ProGuard rules needed for the JNA and UniFFI bindings.
- Database writes are now filtered before being applied, and an index was added on `Measurement.is_done`.
- Fixed incorrect scaling of usage figures at gigabyte size.
- Updated translations: German, Brazilian Portuguese, European Portuguese, and Turkish.

## OONI Probe 6.1.0

> 2026-06-25 · [Upstream announcement](https://github.com/ooni/probe-multiplatform/releases/tag/v6.1.0){target="_blank"}

- Measurement engine remains on OONI Probe CLI v3.29.0.
- Adds support for anonymous credentials, integrating the passport mechanism.
- Desktop adds a "Run at startup" preference.
- macOS desktop bundles and signs the JavaFX native libraries; JavaFX becomes optional for desktop distributions.
- Desktop database access is pinned to a single dedicated thread for stability.
- The descriptors screen gains a manual refresh button.
- Updated translations and bumped dependencies (Kotlin, Compose, and others).
- Various bug fixes and stability improvements.

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
