---
date: 2025-01-06
authors:
    - toomore
categories:
    - News
    - Community
image: "assets/images/post-update.png"
---

# Project Relaunch 2025

Hello everyone, Anoni.net Docs is set to reboot in 2025, with three sub-projects currently planned as the focus and goals for our 2025 research. If you are interested in this topic, consider joining us to explore, discuss, and work on issues related to ["Internet Freedom"](../../internet-freedom-matter.md){target="_blank"}.

This document site will also serve as a place for ongoing updates, event announcements, and the publication of research results. We recommend subscribing to the [mailing list](../../contact.md){target="_blank"}, as we will use it to send notifications about any new information updates.

<!-- more -->

## Project Plan

The Anoni.net Docs project currently comprises three sub-projects, covering data analysis, assisting with the maintenance and update of localized website testing lists, and promoting localization and document translation. Regardless of your background or location, if you are interested in the following sub-projects, you are welcome to participate! Below is a brief introduction to the sub-projects and the goals we aim to achieve.

### ASN Autonomous System Network Observation Data Analysis

Building on the 2023 and 2024 research project "[ASN Autonomous Network Observation Data Coverage](https://ocf.tw/p/ooni/report/202312.html){target="_blank"}," the report will continue investigating the relationship between ASN autonomous network systems and factors such as internet censorship and interference. Additionally, we will study ASN coverage in other regions to determine whether a lack of data diversity affects OONI's ability to interpret observation data.

We plan to establish a data pipeline architecture for automating the data collection and organization process during research, potentially allowing real-time presentation of results with OONI Data.

[:material-arrow-right-circle-outline: Learn more about this project](../../ooni-asns-coverage.md){ .md-button target="_blank" }

??? note "Data Pipeline Architecture"

    Possible but not limited approaches:

    1. Use Airflow to visually organize the data processing workflow, focusing on data compilation and report generation.
    2. Alternatively, a simple API-based method to provide data for front-end chart presentations or other back-end applications may be used.

### OONI Website Testing List

The OONI Probe website testing relies on lists provided by various regions. The Taiwan list (`tw.csv`) hasn't been updated or reviewed since its last update in 2017. The websites on the list can affect the results of the observation program, so it is necessary to spend some time correcting and adjusting the current list, followed by identifying new sites for observation inclusion in 2025.

[:material-arrow-right-circle-outline: Learn more about this project](../../ooni-weblists.md){ .md-button target="_blank" }

??? note "Current Status of the Testing List"

    1. No review or update since 2017, resulting in many sites no longer existent or URLs changed.
    2. Many URLs starting with `http` have not been corrected to `https`.

### Localization and Document Translation

OONI's services and tools are expanding, and ongoing localization will help maintain local terminology and usage. Additionally, we plan to translate key announcements and technical documents to lower the barriers for understanding and participation, hoping to attract more people to join the research and contribute.

[:material-arrow-right-circle-outline: Learn more about this project](../../ooni-i18n.md){ .md-button target="_blank" }

## How to Participate

This document site is established to attract more partners interested in topics like "internet freedom" and "content censorship" to join us. It aims to provide a starting point for participants with hands-on documents for reading or to complement the current project progress. The document site will serve as the project's gateway, and subscribing to the [mailing list](https://groups.google.com/g/ocftw/ocftw-ooni-research){target="_blank"} will help you stay updated. In the future, [Github](https://github.com/anoni-net/docs){target="_blank"} will be used for task assignments, working towards a collaborative approach to knowledge sharing.

## Event Announcements

As [RightsCon 2025](https://rightscon.summit.tc/catalog/rightscon-2025){target="_blank"} will be held in Taipei, many international project teams and communities will come to Taipei at the end of February to attend the event. We are fortunate to host a workshop and lecture event with the teams of Tor and OONI before the conference. The event is currently scheduled for the afternoon and evening of 2025/02/23. If you are interested in learning more about the Tor and OONI projects or wish to interact with project team members, please seize this opportunity!

??? question "How to Register?"

    Since the event registration process is still being prepared, you can first subscribe to the [mailing list](../../contact.md){target="_blank"}. Once the event location and registration methods are confirmed, a reminder notification will be sent via the project mailing list. Don't miss it!
