---
date: 2026-09-09
authors:
    - anoni-net
categories:
    - Technology
    - Privacy
slug: ublock-origin-mv3
summary: "Chrome users can no longer install the full uBlock Origin. Firefox, LibreWolf and Brave each keep it alive a different way, while Google spent the same year shutting down the project meant to replace third-party cookies."
description: "Why the full uBlock Origin no longer runs in Chrome, how Firefox, Brave and LibreWolf each keep it working, and what users give up when ad blocking moves from an extension into the browser core."
---

# :material-shield-off-outline: The full uBlock Origin no longer runs in Chrome

Chrome users can no longer install the full uBlock Origin. On 31 August 2026 the Chrome Web Store removed the last remaining Manifest V2 extensions[^chrome-timeline], uBlock Origin among them. Copies already installed on older Chrome builds stay in place but receive no further updates, and removing one means it cannot be installed again.

Manifest is the specification Google sets for Chrome extensions, and it decides what an extension is allowed to do. Version 2 let an extension inspect every connection request before the page loaded and decide on the spot whether to block it. Version 3 replaces that with a rule list declared in advance, leaving the matching and blocking to the browser. Ad blockers were built on the version 2 model.

The transition ran for more than four years, from the Chrome Web Store closing to new MV2 submissions in early 2022, through the full shutdown in July 2025, to this August's removal. Every step came with public documentation and a published timeline.

On 17 October 2025 Google retired ten Privacy Sandbox technologies[^ps-retire], ending the project meant to replace third-party cookies. Third-party cookies remain in Chrome.

Rule limits and the API differences sit in the second half of this piece; readers who only want to know which tool to switch to can skip that section.

<!-- more -->

## Four years of winding down

| Date | What happened |
|------|---------------|
| January and June 2022 | Chrome Web Store stops accepting new MV2 extensions |
| 3 June 2024 | Warning banners appear on the Beta, Dev and Canary channels |
| 9 October 2024 | Chrome stable begins disabling installed MV2 extensions in waves; enterprise policy exempt until June 2025 |
| 31 March 2025 | Disabled by default on all channels, with users still able to turn them back on |
| 24 July 2025 | Chrome 138 disables them everywhere with no way back; the enterprise policy is removed in Chrome 139 |
| 31 August 2026 | Chrome Web Store removes all remaining MV2 extensions |

## Browsers split three ways

| Browser | Full uBlock Origin | How |
|---------|-------------------|-----|
| Chrome | Unavailable | MV2 code removed from Chromium; only uBlock Origin Lite remains |
| Edge | Winding down | Consumer transition completes end of 2026, enterprise early 2027 |
| Firefox | Available | The Gecko engine keeps blocking `webRequest`, in MV3 as well |
| LibreWolf | Available | A Firefox fork that ships with uBlock Origin preinstalled |
| Brave | Available | Four MV2 extensions hosted on Brave's own servers |
| Safari | Unavailable | WebKit content blockers are declarative; uBlock Origin has not supported Safari since version 13 |

Microsoft's announcement of 7 August 2026 states that the consumer transition away from MV2 begins "in August 2026", with the goal to "complete the consumer transition by the end of 2026" and enterprise deprecation following in early 2027[^edge]. The stated reasons are security and performance improvements over MV2, and the announcement never mentions uBlock Origin by name.

Firefox runs its own engine and Mozilla implemented MV3 independently. The official post states that Firefox "will continue supporting both blockingWebRequest and declarativeNetRequest"[^mozilla]. Both APIs remain, and extension authors can choose.

Vivaldi and Opera are Chromium-based. Vivaldi's built-in blocker hooks into an internal Chromium API and is unaffected by MV3; the 2022 post says only that the team would consider keeping `webRequest` alive a while longer if an easy path existed, stopping short of a commitment[^vivaldi]. With no MV2 code left upstream, any browser tracking Chromium releases has to carry its own patches to keep support.

## What you can pick now

### Browser level

Firefox is the most direct choice. The full uBlock Origin installs on both desktop and Android, and the default filter lists are enough for most people.

Brave's built-in Shields work as soon as the browser is installed. For finer control, the MV2 build of uBlock Origin can be added from `brave://settings/extensions/v2`. Note that the project's own documentation advises against running two content blockers at once, since they can interfere with each other.

For anyone staying on Chrome, uBlock Origin Lite still blocks most ads, without the dynamic control or the live filter-list updates.

### Who LibreWolf suits

LibreWolf is a community fork of Firefox that ships with privacy settings already configured. The features page lists uBlock Origin preinstalled with its filter lists, Tracking Protection in strict mode, Total Cookie Protection, telemetry fully disabled, and RFP (Resist Fingerprinting) enabled, the anti-fingerprinting work that came out of the Tor Uplift project[^librewolf-features]. Install it and the whole set is already in place, with no trip through `about:config`.

RFP does break some sites: canvas access has to be granted per site, the language is always reported as en-US, and window dimensions are quantised. LibreWolf also has no auto-update mechanism. The FAQ states that updating "relies on package managers or users to apply them", with releases usually following a Firefox stable build within three days and sometimes the same day[^librewolf-faq]. Security updates are on you, or on your package manager. There is no Android build either; the FAQ says nobody is working on one and points Android users to IronFox[^librewolf-faq].

It suits desktop users who can live with the occasional broken site and who will keep up with updates. Anyone who would rather not manage the update cadence can stay on Firefox and install uBlock Origin themselves, for much the same protection in practice.

Mullvad Browser is the other option here. Built by Mullvad together with the Tor Project, it amounts to Tor Browser without the Tor network, ships with uBlock Origin, and uses techniques such as letterboxing to make its users look alike. It runs on Linux, macOS and Windows. Because it commits harder to the uniformity approach, sites break slightly more often than on LibreWolf.

Neither LibreWolf nor Mullvad Browser should be pointed at Tor. The LibreWolf FAQ answers that question with "Please don't", and directs anyone who wants anonymity to Tor Browser[^librewolf-faq].

### DNS level

NextDNS, AdGuard DNS and a self-hosted Pi-hole all sit at this layer. The advantage is coverage: one configuration applies to an entire device or an entire network, including ads inside mobile apps. The boundary is equally clear. DNS filtering only sees domain names, so it cannot touch content served from the same domain and cannot do cosmetic filtering. When the ads and the content share a domain, this layer cannot help.

### System level

The AdGuard desktop app and content-blocker apps on iOS sit here. The desktop version usually installs a local certificate to inspect encrypted traffic, which is the trade-off worth thinking through: it puts a component that can read all your HTTPS content inside your system.

### Mobile

Firefox on Android runs the full uBlock Origin, which is unusual among mobile browsers. iOS offers no equivalent because of platform restrictions, leaving Safari content-blocker apps or a DNS-level approach.

## Do not add extensions to Tor Browser

The Tor Project's support documentation is blunt about this. Installing new add-ons in Tor Browser, AdBlock Plus and uBlock Origin included, is strongly discouraged, because "installing new add-ons may affect Tor Browser in unforeseen ways and potentially make your Tor Browser fingerprint unique"[^tor-addons].

Tor Browser's protection rests on every user looking identical. Each extension you add lifts you out of that crowd. The bundled NoScript is the one extension that has been tested for it.

Blocking ads and resisting fingerprinting are two different jobs. Blocking ad requests does not make your fingerprint any less distinctive, and the more tools you install, the more distinctive it gets. On how the two relate, see [A browser fingerprint cannot be cleared the way a cookie can](../../basics/browser-fingerprinting.md).

## Brave's two layers of protection

Brave Shields is the blocker built into the browser, running the Rust `adblock-rust` engine patched directly into Chromium. The engine reads the same Adblock Plus syntax lists as everyone else, EasyList and EasyPrivacy among them, and supports cosmetic filtering and scriptlet injection[^adblock-rust]. Brave's post states that Shields "don't rely on MV2 _or_ MV3"[^brave-mv3], which leaves it untouched by changes to the extension platform.

Extensions are the second layer. Since `v1.81` Brave has hosted four MV2 extensions on its own backend, AdGuard, uBlock Origin, uMatrix and NoScript, installed from the `brave://settings/extensions/v2` page and kept separate from the Chrome Web Store builds[^brave-mv3]. `v1.92` added automatic migration; issue `56654` describes the behaviour as detecting installed Web Store MV2 extensions, backing up their settings, and swapping in the Brave-hosted equivalent[^brave-issue]. The same milestone turned that settings page on by default. Brave stable reached `v1.96` by September 2026, so both changes are in the shipping build.

Brave's stated commitment runs "for as long as we're able (and assuming the cooperation of the extension authors)". The same post adds that if an extension becomes outdated or unmaintained, Brave may drop support rather than ship an out-of-date and possibly unsafe build[^brave-mv3].

In June 2026 a report described the MV2 settings page in Brave beta turning up empty, with the extensions gone, while the nightly build of the same version worked and stable was unaffected[^piunika]. Brave restated its commitment in a post that August.

Updates used to come from the Chrome Web Store and now come from Brave's servers. The update source, the release cadence, and the decision to keep supporting any of it all sit with Brave. In 2020 Brave was caught appending its own referral codes to cryptocurrency exchange URLs typed by users; the CEO apologised publicly and the behaviour was removed. Brave Rewards, the BAT token and the built-in wallet are all opt-in, but the underlying business model, replacing Google's ad system with its own, has been argued over in privacy circles ever since.

## Google's security case and Google's ad business

The security argument holds up. An extension can read and rewrite every network request, so a compromised or malicious one has a great deal of room to work with. Incidents disclosed between 2025 and 2026 include a supply-chain attack that started with a phished OAuth authorisation and reached more than 30 extensions and roughly 2.6 million users, plus extensions that exfiltrated AI chat transcripts from around 900,000 people.

Chrome held roughly 65% of the global browser market in 2026, and about 70% on desktop. The company writing the rules for the extension platform is also the largest advertising company in the world, and in April 2025 a US federal court found it had illegally monopolised the publisher ad server and ad exchange markets, with remedies still undecided. When one company both sets the rules and sells the ads, a restriction imposed in the name of security is hard to take at face value.

The EFF's position is that the MV3 changes weaken the ability of extension developers to keep up with tracking techniques. Vivaldi called the rule limits artificial limitations set by Google, and closed that post by asking, "Perhaps, wise to move away from Chrome?"[^vivaldi].

## The other project shut down the same year

Privacy Sandbox began in 2019, presented as a set of technologies that would replace third-party cookies and let ad delivery and measurement work without tracking individuals. In July 2024 Google abandoned its plan to phase out third-party cookies. In April 2025 it dropped the fallback plan of prompting users to choose.

On 17 October 2025 it ended. Google retired ten technologies, Topics, Protected Audience, Attribution Reporting, IP Protection and Related Website Sets among them, giving as the reason that this followed "evaluating ecosystem feedback about their expected value and in light of their low levels of adoption"[^ps-retire]. Three survive: CHIPS, FedCM and Private State Tokens, described officially as having seen broad adoption including support from other browsers. On third-party cookies the wording is direct, with Chrome maintaining its current approach.

The same day, the UK Competition and Markets Authority released Google from its Privacy Sandbox commitments. AdExchanger reported that all 15 consultation responses the authority received opposed the release[^adexchanger].

Six years on, the user side has had its ad blocking narrowed to a declarative rule list, the industry side has watched the promised replacement for third-party cookies fold, and third-party cookies are still where they started.

## What a built-in blocker costs

Brave Shields, Vivaldi's built-in blocker and Safari's content blockers all point the same way, moving the blocking into the browser core. Once it is built in, the problem of over-privileged extensions disappears, and performance is usually better too.

The cost lands on control. Whether to block, how aggressively, and how often the lists update are all decided by the browser vendor. The per-site dynamic filtering in uBlock Origin, its point-and-click firewall, the freedom to swap in a different list at any time, rarely have equivalents in a built-in model. Users move from picking a tool and tuning it themselves to picking a vendor and accepting its defaults.

The difference shows up at the edges: a tracking technique that has just appeared and is not in the built-in list yet, or something you want blocked that the vendor would rather not block. Auditability shifts too. An open-source extension lets anyone read the rules and change them, while how far a built-in feature can be inspected or replaced varies from vendor to vendor.

## What actually changed, technically

### How the two APIs differ

MV2's `webRequest` is interceptive. The browser hands the full request details to the extension before sending it, and the extension's own logic decides whether to block. The extension can rewrite rules on the fly, read the surrounding context, and apply different rules depending on the state of the tab.

MV3's `declarativeNetRequest` is declarative. The extension registers its rules in advance, the browser does the matching and blocking, and the extension never receives the individual requests. Google's stated reasons are security and performance, since an extension no longer needs the contents of every network request.

The rule counts are capped. Constants in the official documentation include a maximum of 50 enabled static rulesets, a guaranteed minimum of 30,000 static rules, 30,000 dynamic rules (safe rules only), 5,000 unsafe dynamic rules, and 1,000 regular-expression rules[^dnr]. Google's May 2024 announcement notes that, after community feedback, the limits rose to "up to 330,000 static rules and 30,000 dynamically added rules"[^google-phaseout]. The figure of 30,000 rules that circulated in early coverage is out of date; the totals did go up.

### What uBlock Origin Lite gives up

Raymond Hill, the author of uBlock Origin, did not port the full extension to MV3 and built uBlock Origin Lite separately. The project FAQ lists what the MV3 architecture cannot support[^ubol-faq]:

- No dynamic filtering. `declarativeNetRequest` cannot enforce rules based on the top-level domain in the address bar
- No per-site no-remote-fonts or no-scripting switches
- No generic cosmetic filtering in the default mode; that requires Complete mode
- Many regex filters that work well in uBlock Origin are rejected by the API
- `redirect-rule=`, the regex form of `removeparam=`, `replace=`, `ipaddress=` and CNAME uncloaking are all unsupported

The way filter lists update changed as well. The FAQ states that "uBOL never makes network requests to any remote servers", so the rules only change when a new version of the extension ships. A list that used to update several times a day, tracking domain changes as advertisers made them, now moves at the pace of Chrome Web Store review. Google introduced an expedited review path for rule-only changes in 2024, and the announcement says those updates can clear in minutes[^google-phaseout].

### The escape hatches removed one by one

Four merged changes on Chromium's code review platform show the switches that could re-enable MV2 being taken out: the MV2 availability policy on 10 June 2025 (`6617410`), the `allow-legacy-mv2-extensions` developer flag on 4 November 2025 (`7113458`), the `kExtensionManifestV2Disabled` feature flag on 22 May 2026 (`7813942`), and the policy handling code on 4 June 2026 (`7890750`)[^gerrit]. The commit message on the third describes removing the feature "and the effectively-dead code".

## Where this goes next

How long Brave can keep hosting MV2 extensions comes down to maintenance cost. With no such code left upstream, every Chromium release Brave follows means a little more to patch back in.

Remedies in the Google ad tech antitrust case are still undecided, and the gap between a structural divestiture and behavioural fixes is wide. With third-party cookies staying put, fingerprinting and server-side identification techniques have not gone anywhere either.

The choice of tool will keep changing; the way to judge one is steadier. Work out who you are defending against, check what the tool in front of you actually blocks, and ask who holds that capability.

## Further reading

- [A browser fingerprint cannot be cleared the way a cookie can](../../basics/browser-fingerprinting.md) — why fingerprints persist, and where each browser stands by default
- [Brave flattens GPU fingerprints two opposite ways](./brave-gpu-fingerprinting.md) — how built-in protection works, and what it leaves untouched
- [How platforms collect your data, and the microphone question](../../basics/platform-tracking.md) — where ad tracking sits in the wider ecosystem
- [Threat modeling](../../basics/threat-model.md) — establish who you are defending against before picking tools
- [What your browser gives away](../../utils/leaks.md) — see for yourself what your browser reports

[^chrome-timeline]: [Manifest V2 support timeline](https://developer.chrome.com/docs/extensions/develop/migrate/mv2-deprecation-timeline){target="_blank"} — Chrome for Developers. Source for every date in the timeline table, the roles of Chrome 138 and 139, and the 31 August 2026 removal. Verified 2026-09-01.
[^gerrit]: Chromium code review, the four changes being [`6617410`](https://chromium-review.googlesource.com/c/chromium/src/+/6617410){target="_blank"}, [`7113458`](https://chromium-review.googlesource.com/c/chromium/src/+/7113458){target="_blank"}, [`7813942`](https://chromium-review.googlesource.com/c/chromium/src/+/7813942){target="_blank"} and [`7890750`](https://chromium-review.googlesource.com/c/chromium/src/+/7890750){target="_blank"}. Merge dates and commit messages retrieved through the Gerrit API. Verified 2026-09-01.
[^dnr]: [chrome.declarativeNetRequest](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest){target="_blank"} — Chrome for Developers. Source for the rule limit constants. Verified 2026-09-01.
[^google-phaseout]: [Manifest V2 phase-out begins](https://blog.google/chromium/manifest-v2-phase-out-begins/){target="_blank"} — Chromium official blog, May 2024. Source for the 330,000 static rules, the 30,000 dynamic rules, and the expedited review path. Verified 2026-09-01.
[^ubol-faq]: [uBlock Origin Lite FAQ](https://github.com/uBlockOrigin/uBOL-home/wiki/Frequently-asked-questions-(FAQ)){target="_blank"} — uBlock Origin Lite project wiki. Source for the unsupported capabilities and the filter list update model. The official home of uBlock Origin is [gorhill/uBlock](https://github.com/gorhill/uBlock){target="_blank"}. Verified 2026-09-01.
[^edge]: [Moving the Microsoft Edge extensions ecosystem forward with Manifest Version 3](https://blogs.windows.com/msedgedev/2026/08/07/moving-the-microsoft-edge-extensions-ecosystem-forward-with-manifest-version-3/){target="_blank"} — Microsoft Edge blog, 7 August 2026. Source for the consumer and enterprise timelines. Verified 2026-09-01.
[^mozilla]: [Mozilla's approach to Manifest V3](https://blog.mozilla.org/en/firefox/firefox-manifest-v3-adblockers/){target="_blank"} — The Mozilla Blog, 25 February 2025. Source for Firefox keeping both APIs. Verified 2026-09-01.
[^vivaldi]: [Manifest V3, webRequest, and ad blockers](https://vivaldi.com/blog/manifest-v3-webrequest-and-ad-blockers/){target="_blank"} — Vivaldi blog, 23 September 2022, updated June 2024. Source for how the built-in blocker is implemented and for the criticism of the rule limits. Verified 2026-09-01.
[^adblock-rust]: [Brave Improves Its Ad-Blocker Performance by 69x with New Engine Implementation in Rust](https://brave.com/blog/improved-ad-blocker-performance/){target="_blank"} and [brave/adblock-rust](https://github.com/brave/adblock-rust){target="_blank"}. Source for the engine implementation and the filter syntax it supports. Verified 2026-09-01.
[^brave-mv3]: [What Manifest V3 means for Brave Shields and the use of extensions in the Brave browser](https://brave.com/blog/brave-shields-manifest-v3/){target="_blank"} — Brave official blog. Source for Shields being independent of the extension platform, the four hosted extensions, the `v1.81` starting point, and the wording of the support commitment. Verified 2026-09-01.
[^brave-issue]: [Auto-replace known Web Store MV2 extensions with Brave-hosted equivalents](https://github.com/brave/brave-browser/issues/56654){target="_blank"} — brave-browser issue `56654`, milestone `1.92.x`. Source for the automatic migration behaviour; the settings page being enabled by default is covered in issue [`56799`](https://github.com/brave/brave-browser/issues/56799){target="_blank"}. Verified 2026-09-01.
[^piunika]: [Latest Brave Beta hints at Manifest V2 support drop](https://piunikaweb.com/2026/06/26/latest-brave-beta-manifest-support-drop/){target="_blank"} — PiunikaWeb, 26 June 2026. Source for the empty settings page in the beta build. Brave issued no statement about that change. Verified 2026-09-01.
[^ps-retire]: [Update on plans for Privacy Sandbox technologies](https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies){target="_blank"} — Privacy Sandbox official announcement, 17 October 2025. Source for the ten retired technologies, the three that remain, and the position on third-party cookies. Verified 2026-09-01.
[^adexchanger]: [Google Pulls The Plug On Topics, PAAPI And Other Major Privacy Sandbox APIs (As The CMA Says 'Cheerio')](https://www.adexchanger.com/privacy/google-pulls-the-plug-on-topics-paapi-and-other-major-privacy-sandbox-apis-as-the-cma-says-cheerio/){target="_blank"} — AdExchanger, October 2025. Source for the CMA releasing Google from its commitments and for the 15 opposing consultation responses. Verified 2026-09-01.
[^tor-addons]: [Should I install a new add-on or extension in Tor Browser, like AdBlock Plus or uBlock Origin?](https://support.torproject.org/tbb/tbb-14/){target="_blank"} — Tor Project support documentation. Source for the advice against installing extensions. Verified 2026-09-01.
[^librewolf-features]: [LibreWolf Features](https://librewolf.net/docs/features/){target="_blank"} — LibreWolf documentation. Source for the preinstalled uBlock Origin and its filter lists, strict-mode Tracking Protection, Total Cookie Protection, disabled telemetry, and RFP being enabled. Verified 2026-09-02.
[^librewolf-faq]: [LibreWolf FAQ](https://librewolf.net/docs/faq/){target="_blank"} — LibreWolf documentation. Source for the update cadence and lack of auto-update, the absence of an Android build and the IronFox recommendation, and the advice against pairing it with Tor. Verified 2026-09-02.
