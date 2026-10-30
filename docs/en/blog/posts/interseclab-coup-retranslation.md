---
date: 2026-10-30
authors:
    - anoni-net
categories:
    - News
slug: interseclab-coup-retranslation
image: "assets/images/post-update.png"
summary: "Our Traditional Chinese translation of InterSecLab's The Internet Coup has been retranslated in full from the original report. The first version, released in October 2025, left out passages and mistranslated others, including what the report says about Tor, what Geedge's gateway can intercept on unencrypted connections, who can access users' data, and how companies answered the consortium's questions."
description: "Our Traditional Chinese translation of The Internet Coup has been retranslated in full, restoring omitted passages, all four country timelines and the companies' replies as written."
---

# A Full Retranslation of The Internet Coup

![The Internet Coup report cover](https://assets.anoni.net/the-internet-coup/The-Internet-Coup-InterSecLab-2048x986.png){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

In September 2025 InterSecLab published [The Internet Coup](https://interseclab.org/research/the-internet-coup/){target="_blank"}, an analysis of more than 100,000 leaked documents from Geedge Networks, the Chinese company selling Great Firewall technology to governments in Kazakhstan, Ethiopia, Pakistan and Myanmar. A month later we released a [Traditional Chinese translation](https://anoni.net/docs/reports/interseclab-network-coup/){target="_blank"} for readers in Taiwan, Hong Kong, Macau and elsewhere. That first version had gaps that could mislead readers about the risks, so we have retranslated all eight chapters from the original PDF. The addresses have not changed.

<!-- more -->

## What the First Version Got Wrong

Several passages were missing. The Key Findings chapter lacked the whole section on data sovereignty, and the Tor section of chapter 7 lacked its closing paragraph: InterSecLab coordinated responsible disclosure with the Tor Project and found no evidence that Geedge has discovered or is exploiting unknown vulnerabilities in Tor. None of the four timelines that open the Kazakhstan, Ethiopia, Pakistan and Myanmar sections had been translated.

Other passages said something different from the report:

- The report says Mesalab students were researching how to block WebTunnel, and that Geedge had no effective countermeasure at the time of the leak. The first version said their research showed WebTunnel to be effective.
- When a connection is not encrypted with TLS, the report says Geedge's gateway can intercept passwords, email addresses, attachments and email content. The first version left out passwords and email content, and rendered attachments as attachment metadata.
- Where the report hedges with "appears" or "seems", the first version sometimes stated the claim as fact.
- In the annex, the replies from companies were mistranslated in places. In AppLogic Networks' reply on behalf of Sandvine, the statement that none of Sandvine's products "had or has" the capability to decrypt user data could be read in the first version as saying they can.

The new translation follows the companies' letters sentence by sentence without smoothing their wording, and adds translator's notes where the current public PDF has typos, such as Fang Binxing's name.

## For Readers and Partners

Old links and section anchors still resolve. If you spot an error, every page has an edit icon that opens the source on GitHub, or you can join the discussion room listed on the translation's front page.

## Related Reading

- [Translated Reports](../../reports/index.md): our translations of InterSecLab's The Internet Coup and MADLink
- [Tor Browser advanced settings](../../tools/tor-browser-advanced.md): setting up bridges when Tor cannot connect
- [Metadata, and why it matters](../../basics/metadata.md): what an encrypted connection still reveals
- [The original launch note](https://anoni.net/en/updates/2025/10/report-the-internet-coup/){target="_blank"} from October 2025
