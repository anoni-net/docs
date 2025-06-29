---
title: ASNs Observation Data Analysis
icon: material/access-point-network
---

# :material-access-point-network: ASNs Observation Data Analysis

## What is an Autonomous System (AS)?

<figure markdown="span" style="width: 80%;">
    <a target="_blank"
       href="https://www.cloudflare.com/zh-tw/learning/network-layer/what-is-an-autonomous-system/">
        <img src="../assets/images/autonomous-system-diagram.svg"
            alt="ASNs are interconnected in real-world networks, image source: https://www.cloudflare.com/zh-tw/learning/network-layer/what-is-an-autonomous-system/"
            title="ASNs are interconnected in real-world networks, image source: https://www.cloudflare.com/zh-tw/learning/network-layer/what-is-an-autonomous-system/"
        >
    </a>
    <caption>ASNs are interconnected in real-world networks. ([image source](https://www.cloudflare.com/zh-tw/learning/network-layer/what-is-an-autonomous-system/){target="_blank"})</caption>
</figure>

The network that people use daily can be simply understood as a whole composed of many interconnected devices and systems, including computers, mobile devices, servers, routers, and switches. Its primary function is to allow data to be exchanged and transmitted between them.

When we talk about larger-scale networks, such as the Internet, it is essentially a global network composed of many smaller networks (e.g., corporate networks, home networks, telecommunications networks, etc.). Within such an architecture, the concept of an Autonomous System (AS) is crucial.

An AS can be understood as a group of networks controlled by a single administrative entity (such as a company, a university, or a country), possessing a unified routing policy (dictating where incoming and outgoing traffic should be directed). Each AS operates independently but is interconnected with other ASes through global routing protocols, forming the underlying infrastructure of the entire internet. Between ASes, a routing protocol called BGP (Border Gateway Protocol) is used for data exchange and route selection. BGP allows different ASes to know how to send data packets to their destinations and decide which path is the most efficient. Each AS has a unique identifier known as the AS Number (ASN), which is used within BGP to denote that system.

!!! tip "Postal System"

    We often use the postal system as an analogy for how AS operates. You can imagine an AS as a regional mail processing center. The responsibility of these mail processing centers is to gather mail from the same area and then efficiently deliver it to the correct destination based on their own transport strategies (comparable to the routing strategies of BGP). Once the mail reaches the mail processing center nearest to the recipient, the center further distributes the mail to more specific locations like streets and alleys.

    This process is very similar to how IP packet delivery works on the internet: when data packets arrive at the target AS, that AS will precisely transmit the data to the end user's device according to the IP address within the data packet, completing the entire data transmission task.

    Through this real-life example, we can more easily understand the role and importance of AS in the operation of the Internet: just as the postal system relies on processing centers to function, the Internet also depends on ASes to manage and facilitate data transmission.

## Do ASes Misbehave?

You might wonder, since ASes sound like very "autonomous" entities, could there be individuals or groups that intend to cause harm? Yes, ASes sometimes do engage in undesirable activities, either intentionally or due to accidents or errors. Here are some common cases and scenarios where ASes "misbehave":

1. **BGP Hijacking:** This is a common issue that can be intentional or accidental. An AS might incorrectly announce that it possesses the best route to certain IP addresses, causing other ASes to incorrectly forward data to that AS. This can lead to traffic disruption and potentially be exploited to intercept or tamper with data.

2. **BGP Leak:** This occurs when an AS accidentally re-announces certain routes to other ASes that should not receive this traffic information, potentially leading to widespread traffic redirection and network congestion.

3. **Propagation of Malicious Content or Active Attacks:** Some ASes may be involved in spreading malware, spam, or organizing DDoS attacks. This could be due to servers within the AS being exploited by attackers, or some ASes intentionally participating in these activities for illicit gains.

4. **Violation of Net Neutrality Rules:** Some ASes, especially large Internet Service Providers (ISPs), may restrict or prioritize certain types of traffic, affecting the fairness of the internet.

??? question "Who Makes Up an Autonomous System (AS)?"

    An Autonomous System (AS) is composed of different types of network management entities, with each AS potentially representing a single organization or a group of network entities.

    These constituents typically include:

    1. **Internet Service Providers (ISP):** These companies provide internet services to individuals, households, and businesses. Large ISPs often own multiple ASes to manage different geographical regions or services.
    2. **Academic Institutions and Universities:** Many universities and academic research institutions have their own AS to manage their campus networks and connect directly to the internet.
    3. **Enterprises and Corporations:** Large businesses may have their own AS to manage connections between their global or regional offices, ensuring operational and data security.
    4. **Content Delivery Network (CDN) Providers:** These companies focus on providing fast, reliable content delivery services and have their own AS layouts to effectively reach global users.
    5. **Government Organizations:** Some governmental bodies possess their own AS to manage internal networks and connections with other government or public services.
    6. **Non-Profit Organizations and Other Independent Entities:** For instance, certain research institutions, technical associations, or professional groups may have their own AS to support independent operations.

??? question "How to Check the Current ASN You're Using?"

    If you want to know which telecom and ASN number your current internet-connected IP is associated with, you can use the following services:

    1. [ip.me](https://ip.me/){target="_blank"}: After connecting to the website, it provides relevant information, including the ASN number.
    2. [Is BGP safe yet? No.](https://isbgpsafeyet.com/){target="_blank"}: This site offers services to check and query the status of the BGP for your current ISP.
    3. [Cloudflare Radar (AS3462)](https://radar.cloudflare.com/zh-tw/as3462){target="_blank"}: Alternatively, use Cloudflare Radar to observe ASN traffic trends and histories.

## OONI Probe Monitoring and Analysis

[OONI](http://ooni.org/){target="_blank"} is supported by a global network of volunteers who use the [Probe software](https://ooni.org/install/){target="_blank"} to detect issues like internet blocking and content censorship in their regions. The test results from OONI Probe are uploaded to the project's [open data repository](https://registry.opendata.aws/ooni/){target="_blank"} for record-keeping and further analysis and use.

From November 2023 to March 2024, we analyzed the open data using [scripted retrieval](https://github.com/anoni-net/docs/tree/main/asn_coverage){target="_blank"} to primarily assess the current state of observation data, whether there is a lack of data or other issues.

According to findings in the [December 2023 report](https://ocf.tw/p/ooni/report/202312.html){target="_blank"}, Taiwan's observational data is ranked among the top ten in the OONI Explorer database in terms of volume, indicating adequacy. However, the data samples reveal that most observations are concentrated on contributions from [AS3462](https://radar.cloudflare.com/zh-tw/as3462){target="_blank"} and [AS18041](https://radar.cloudflare.com/zh-tw/as18041){target="_blank"}, accounting for about 78.94% of all observation data. Taiwan currently has approximately 437 ASNs, yet the number of unique ASNs in the observational data is only 7.32%, highlighting a lack of diversity in the observations.

This data indicates that current observations are neither comprehensive nor diverse enough to truly reflect Taiwan's internet landscape, which includes major telecom operators, cable broadband services, fixed networks, and secondary telecommunications (virtual mobile network services), among others.

For detailed content, please refer to the following report.

[:material-chart-bar: December 2023 Observation Report](https://ocf.tw/en/p/ooni/report/202312.html){ .md-button .md-button--primary target="_blank" }

## Observation Data Analysis

!!! info "Recruitment"

    We are currently recruiting volunteer partners to join us. If you are interested in data tracing, research, and analysis, feel free to join us for discussions and study.

### How to Analyze?

If you haven't used OONI Probe yet, try understanding the process through the following steps:

1. Download OONI Probe, whether it's the mobile version or the desktop version.
2. Open OONI Probe, select the "Websites" category, and "Run" the test.
3. Once the test is complete, go to "Test Results" and find the recently completed "Websites" test result. Check for any items marked with "!" or "?".
4. Click on any "!" or "?" test item to view potential issues. There you will find links labeled "Data" and "Show in OONI Explorer."
5. Click on any link to view the original data test results.

### How to View Test Data?

For example, a measurement data item has the UID:

- [`20241024185921.623617_TW_webconnectivity_578b6d3845fed2e2`](https://explorer.ooni.org/zh-Hant/m/20241024185921.623617_TW_webconnectivity_578b6d3845fed2e2){target="_blank"}

In this example, the result shows `Test failure on AS3462`, with the failure message `unknown_failure: dial tcp [scrubbed]: connect: host is down`, indicating that the website is down and no longer providing service. In the "DNS queries" section, you can see that `www.asap.com.tw` has a DNS `A` record pointing to `60.250.151.72 (AS3462 (Chunghwa Telecom Co., Ltd.)`, which comes from a query result of `162.158.242.36` Cloudflare DNS.

Finally, in the "Raw Measurement Data" section, you can find all the raw data of the test items. Some data might not be completely presented on the results page, but you can find more data for collection and analysis in the "Raw Measurement Data."

<figure markdown="span">
    <a target="_blank"
       href="../assets/images/ooni_raw_data.png">
        <img src="../assets/images/ooni_raw_data.png"
            alt="Information on "Raw Measurement Data" in OONI Probe."
            title="Information on "Raw Measurement Data" in OONI Probe."
            style="border: 1px solid #000000; border-radius: 10px;"
        >
    </a>
    <caption>Information on "Raw Measurement Data" in OONI Probe.</caption>
</figure>

!!! question "Detections Revealing Differences Between AS and DNS"

    In this example explanation process, it can be observed that OONI Probe logs the entire testing process. For instance, we can find that even while accessing the internet through Chunghwa Telecom's network, the DNS queries in the test data are performed using Cloudflare's DNS.

    - Question: If a website is blocked and cannot be accessed, is it an issue with the AS or the DNS?

### Data Retrieval

The data from tests conducted using OONI Probe is sent back for storage in OONI's [AWS S3 Open Data](https://registry.opendata.aws/ooni/){target="_blank"}. [OONI Docs](https://docs.ooni.org/data){target="_blank"} provides a simple tutorial on data retrieval, and you can also use our completed [retrieval script](https://github.com/anoni-net/docs/blob/main/asn_coverage/ooni.py){target="_blank"}. The data field structure can be referenced from [ooni/spec](https://github.com/ooni/spec){target="_blank"}.

Below is a guide on how to retrieve test observation data using the [retrieval script](https://github.com/anoni-net/docs/blob/main/asn_coverage/ooni.py){target="_blank"}.

??? question "How to Set Up the Project Environment?"

Please refer to the "Project Research Preparation" section for setting up the project environment and installing required packages. The following explanation will skip the preliminary setup process.

```bash title="Look Back Observation Data"

python3 ./ooni.py lookback [--unit=36] [--loc=TW] [--frame=hours]
```

The interval unit is hours, defaulting to 36 units (36 hours), and the region is Taiwan (TW). After execution, files are stored according to the format below:

- `lookback_{loc}_{YYYYMMDD}_{units}_{frame}.csv`

```bash title="Retrieve Interval Data"
python3 ./ooni.py span --start=YYYY/MM/DD --end=YYYY/MM/DD [--loc=TW]
```

The interval unit is hours, with the start time (`start`) and end time (`end`), to obtain hourly interval data for Taiwan (`TW`).

```bash title="Convert to Spreadsheet Data"
python3 ./ooni.py sheetrow --path={data_path}
```

After extracting the data, it is expanded for ease of calculation in a spreadsheet and saved as a data file prefixed with `rows_`.

It is recommended to use `Retrieve Interval Data` followed by `Convert to Spreadsheet Data` to compile the frequency of ASNs occurrences and non-redundant statistics. By obtaining data on all ASNs in Taiwan, you can calculate percentages and other statistical data.

```bash title="ASN Statistical Calculation"
python3 ./ripe.py save --loc=TW
```

For detailed statistical calculations, please refer to the following resources:

[:material-google-spreadsheet: 20230901-20231204-TW](https://docs.google.com/spreadsheets/d/1lMDsqX8Oa3GKW68y8TuFeKQW2nKM7X0u4z-RopfJIaA/){ .md-button .md-button--primary target="_blank" }

## :fontawesome-solid-diagram-project: Next Step

<div class="grid cards" markdown>

- [:octicons-mark-github-24: Project Research Preparation](./setup-repo.md)
- [:material-chat-question: What is OONI?](./what-is-ooni.md)

</div>
