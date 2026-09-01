---
title: OONI Changelog
description: English summaries of OONI Probe, Explorer, and Run releases, the network censorship measurement tools developed by OONI, with notes on key changes and new features.
icon: material/access-point-network
---

# :material-access-point-network: OONI Changelog

[OONI](https://ooni.org/){target="_blank"} Probe, Explorer, and Run release summaries, along with the underlying measurement engine. Newest at the top.

The app and the engine version independently. The cross-platform app is 6.x, while the measurement engine and command-line tool (OONI Probe CLI) are 3.x, and each app build bundles one engine version. If you analyse data or schedule your own measurements, read the engine entries: that is where changes to measurement behaviour land.

## OONI Probe 6.2.0

> 2026-08-13 · [Upstream announcement](https://github.com/ooni/probe-multiplatform/releases/tag/v6.2.0){target="_blank"}

- Measurement engine moves to OONI Probe CLI v3.30.0, the first engine bump of the 6.x series after every earlier release stayed on v3.29.0.
- Android adds in-app language selection, matching what desktop gained in 6.1.1.
- Improved offline handling and retry logic. Unparseable reports are handled gracefully during submission, and file writes are now atomic.
- Anonymous credentials gain a management UI and a reset function. Anonymous credentials let a submitter prove they are entitled to submit measurements without revealing who they are.
- Passport updated to 0.1.5, with support for proxies and timeouts.
- Secure storage on macOS and iOS gains error handling and a retry mechanism.
- Added an indexed query for counting unviewed completed results.
- Dependency updates: Kotlin to 2.4.10 and the Android Gradle Plugin to 9.1.1.
- Updated translations.

## OONI Probe CLI v3.30.0

> 2026-07-27 · [Upstream release](https://github.com/ooni/probe-cli/releases/tag/v3.30.0){target="_blank"}

- The measurement engine and the command-line tool share one version number, and this is what the cross-platform app has bundled since 6.2.0.
- The CLI gains an anonymous credentials submission path, matching the mechanism the app introduced in 6.1.0.
- Removes a stray debug print left in `GetFeatureFlag`.
- Android, iOS, and desktop `pom.xml` files are split apart, so releases on one platform no longer drag the others along.
- Toolchain updates: Go moved to 1.25.3 and then to 1.26.5 late in the cycle, the latest stable Android NDK, and bundled assets at probe-assets v0.31.

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
## OONI Probe CLI v3.29.1

> 2026-05-12 · [Upstream release](https://github.com/ooni/probe-cli/releases/tag/v3.29.1){target="_blank"}

- A maintenance release; upstream published no list of changes. App versions 6.0.x and 6.1.x all bundle the v3.29.x line.

## OONI Probe CLI v3.29.0

> 2026-02-10 · [Upstream release](https://github.com/ooni/probe-cli/releases/tag/v3.29.0){target="_blank"}

- Psiphon support ends. Per upstream's plan (issue 1761), both the psiphon tunnel and the psiphon experiment stopped working on 1 January 2026. Anyone analysing censorship measurement data should note that this test produces no new data from that point.
- Adds the internal `userauth` package, the foundation for anonymous credentials, which let a submitter prove they are entitled to submit without revealing who they are.
- Caps how much of an HTTP response body is read, so an abnormal or malicious response cannot exhaust memory.
- Updates bundled certificates and C dependencies.

