---
title: OONI Website Testing List
icon: material/list-status
---
# :material-list-status: OONI Website Testing List

<figure markdown="span">
    <a target="_blank"
       href="../assets/images/ooni_asn.svg">
        <img src="../assets/images/ooni_asn.svg"
            alt="OONI Probe Testing Process"
            title="OONI Probe Testing Process"
        >
    </a>
    <caption>OONI Probe Testing Process</caption>
</figure>

When using OONI Probe for "website" testing, the testing program checks each site according to a pre-defined "website list." This "website list" is maintained by [Citizen Lab](https://citizenlab.ca/){target="_blank"} and compiled in the [test-lists](https://github.com/citizenlab/test-lists){target="_blank"} project, which includes URLs of popular websites both locally and globally.

Most websites on the global list are presented in English. The local list is provided by regions, containing various categories relevant to local and regional levels, and is in the local language. In countries with internet censorship, the local list also includes many websites that have been blocked.

The criteria for list inclusion can be broadly categorized into four main categories:

1. **Political:** Focuses on websites that express viewpoints different from the current government. Content related to human rights, freedom of expression, minority rights, and religious movements are also considered.
2. **Social:** Includes topics about gender, gambling, illegal drugs and alcohol, and other subjects that may be considered sensitive or offensive in society.
3. **Conflict and Security:** Covers content related to armed conflicts, boundary disputes, separatist movements, and radical groups.
4. **Internet Tools:** Websites that provide email, cloud storage, search, translation, Voice over IP (VoIP) services, and censorship circumvention methods fall under this category.

## Current Status of the Taiwan Observation List

The current Taiwan list [tw.csv](https://github.com/citizenlab/test-lists/blob/master/lists/tw.csv){target="_blank"} was mostly added in 2017. However, due to a lack of continuous maintenance, many websites on the list have since closed down, changed their brand URLs, or have old URLs that are inactive or start with `http://`. It is necessary to first tidy up the current contents of the list.

!!! note "http:// → https://"

    Some websites do not automatically redirect the protocol from `http://` to `https://` (using redirection methods like [`301 Moved Permanently`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301){target="_blank"} or [`308 Permanent Redirect`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/308){target="_blank"}), leading to testing errors. With the thresholds for applying TLS/SSL certificates lower and encrypted transmission processes a basic requirement for website construction, `https://` should be the default format for inputting URLs.

## List Updates

To address the current issues, the first step is to individually check the status of the websites listed in [tw.csv](https://github.com/citizenlab/test-lists/blob/master/lists/tw.csv){target="_blank"}, marking them as needing updates or suitable for deprecation. Then, a [Pull Request](https://gitbook.tw/chapters/github/pull-request){target="_blank"} should be submitted to [citizenlab/test-lists](https://github.com/citizenlab/test-lists){target="_blank"} requesting these updates.

!!! info "PR #1444"

    On 2023/09/28, a [list revision](https://github.com/citizenlab/test-lists/pull/1444){target="_blank"} was submitted, but due to the lack of ongoing updates, a revised and correctly adjusted submission is planned for 2025.

## List Additions

Since the list was established in 2017, it has not been revised or adjusted for about 8 years, necessitating a review to add websites that also need to be included in the testing list.

!!! warning "Future Planning"

    How to add and recruit selections for this section needs further planning. It is expected that in 2025/Q2, after the initial list revisions, the "additions" will be planned.

## :fontawesome-solid-diagram-project: Next Step

<div class="grid cards" markdown>

- [:material-chat-question: What is OONI?](https://ooni.org/){target="_blank"}
- [:material-chat-question: Why does Internet Freedom matter?](../basics/internet-freedom.md)
- [:octicons-mark-github-24: Project Research Preparation](../community/setup-repo.md)

</div>
