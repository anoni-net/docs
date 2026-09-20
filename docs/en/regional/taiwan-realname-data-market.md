---
title: Identity Binding and Taiwan's Data Market
description: Taiwan ranks first in Asia for internet freedom, yet every account is bound to a national ID number, and the records that binding produces are lawfully sold. Four purchase windows, one word doing the work.
icon: material/card-account-details-outline
---

# :material-card-account-details-outline: Identity Binding and Taiwan's Data Market

Taiwan has no law called a "real-name system." What it has is a row of separately enacted rules that require you to show identification when you get a mobile number, open an electronic payment account, place an online advertisement, or use a virtual asset service. Once the binding is done, three kinds of record start accumulating: where you are, what you connect to, what you buy. None of them requires any action from you, and none has a switch of its own.

What happens next splits two ways. On the state side, the Communications Security and Surveillance Act governs retrieval: 487,353 lines in 2025, of which 2.2% were issued by a court, and 87.2% carried no duty to notify the person concerned. On the commercial side, the phrase "de-identification" turns the same records into products. The government sells its own. Carriers sell theirs. Ad networks sell theirs. Open government data fills in the fields the others lack, free of charge.

Both sides share a structure. Everything that should be yours to decide has its default set to "continue," and nobody is required to come and ask you. This page takes that structure apart using forty-nine public sources, five years of official statistics, and 157,933 records recomputed from scratch, and ends with a question: who set these defaults, and who should change them.

<figure markdown="span">
    <img src="https://assets.anoni.net/diagrams/default-continue-v2.en.svg"
        alt="A top-to-bottom flow diagram. The top layer lists four situations requiring identification: getting a mobile number, opening an electronic payment account, placing an online advertisement, and using a virtual asset service. The middle layer lists three kinds of record produced continuously after binding: where you are, what you connect to, and what you buy. The lower layer splits in two. On the left, state retrieval, marked with 487,353 lines in 2025, of which 2.2 percent were issued by a court, and 87.2 percent carried no duty to notify. On the right, commercial sale, marked with the government selling its own product at 2,000 New Taiwan dollars per spatial unit, carriers' commercial footfall services, advertising identifiers, and free open government data. The bottom row notes that the defaults at all three stages are set to continue, and that the exit clause sits at Article 10, paragraph 3 of the carrier notice, which the individual has to go and find.">
    <figcaption>Three stages, every default set to continue, the exit left for you to find</figcaption>
</figure>

!!! info "Why an international reader might care"

    Taiwan ranks first in Asia and seventh worldwide on Freedom House's *Freedom on the Net 2025*, scoring 79 out of 100. That makes it a useful control case. The mechanisms described here are not operating under emergency powers or a censorship regime; they run inside a functioning democracy with an open internet, a free press, and competitive elections.

    That matters for anyone studying data governance comparatively. The Personal Information Protection Law in Mainland China pairs individual rights with broad state carve-outs. Hong Kong's ordinance dates from 1995 and gained doxxing offences in 2021. Singapore exempts most public agencies from its Personal Data Protection Act. Taiwan declines none of those protections on paper, and still arrives at an outcome where location, connection and transaction records are lawfully commercialised. The bottleneck is not the presence or absence of a privacy law. It is the statutory test that law applies to "de-identified" data, and the absence of any test for what happens when several datasets meet.

    If you work on data brokerage, telecom metadata retention, or statistical disclosure control, the Taiwanese case offers something rare: a fully documented, publicly priced government product built from carrier signalling data, with a published methodology you can check against the raw open data yourself.

## The same report scores Taiwan very differently by category

Freedom House splits the 79 points into three groups[^28].

| Group | Score | Maximum | Share |
|---|---|---|---|
| A. Obstacles to Access | 24 | 25 | 96% |
| B. Limits on Content | 29 | 35 | 83% |
| C. Violations of User Rights | 26 | 40 | 65% |

The questions are written as negatives, so a higher score means a better situation. Within group B, "do conditions impede users' ability to mobilize, form communities, and campaign" scores full marks. Within group C, "does state surveillance of internet activities infringe on users' right to privacy" scores 3 out of 6, and "does monitoring and collection of user data by service providers and other technology companies infringe on users' right to privacy" also scores 3 out of 6[^28].

Speech in Taiwan is protected close to the maximum. Who is speaking, what record the speech leaves behind, and who can obtain that record, score half. This page is about the second half.

## Where you must show identification

Four common situations, each with a different legal basis and a different verification target.

| Situation | Basis | What is checked | Since |
|---|---|---|---|
| Mobile subscription | Carrier verification rules set under regulatory requirement; since 2024 also the Fraud Crime Hazard Prevention Act, Article 19(3) | In person, two original identity documents[^48]. Since 2024, also a query against three government databases: household registration, police, and immigration | Two-document checks have been standard for years; database checks since 2024-11-19 |
| Placing online advertising | Fraud Crime Hazard Prevention Act, Articles 30 to 33, plus four pieces of secondary legislation | Identity of the party commissioning the advertisement and the party funding it, by FIDO, certificate, mobile identity, or in-person verification | Phased from 2025-01-01 |
| Opening an electronic payment account | Regulations Governing Identity Confirmation Mechanisms and Transaction Limits for Electronic Payment Institutions, Articles 4 and 5 | Authenticity of identity data, plus a query to the Joint Credit Information Center | Current |
| Using virtual asset services | Virtual Asset Service Act, see [Taiwan's 2026 Virtual Asset Service Act](./taiwan-vasp-2026.md) | Customer due diligence under anti-money-laundering rules | Transitional period |

Chunghwa Telecom's prepaid card application page states that the applicant must appear in person with two original identity documents at a company service counter[^42]. In many countries a prepaid SIM is the low-identity entry point. In Taiwan it runs through the same checks as a postpaid contract.

The advertising rules were summarised by the Ministry of Digital Affairs in four parts, including "verification of the identity of the party commissioning and the party funding the advertisement, and publication of an annual transparency report," and a requirement that foreign operators designate a legal representative inside Taiwan[^44]. Four verification methods are permitted: FIDO biometrics, digital signatures issued by an authority-approved certificate body, mobile identity and one-time passwords, or in-person presentation of a national ID card or passport[^43]. The initial scope covers high-risk advertising customers, for example advertisements featuring public figures and advertisers placing large volumes[^43].

These four rules answer different problems. The first two are anti-fraud measures, the last two anti-money-laundering. None was enacted to build a register of the population. The cumulative effect is still that every account resolves to one person.

## A puzzle, first

On 2024-05-27, a political party's policy staffer said on a television talk show that, based on mobile signal comparison, sixty percent of the crowd gathered outside the Legislative Yuan on 24 May were aged between 20 and 40, and that they were an entirely new group, different from the crowds at another party's event on 19 May and at an election-eve rally months earlier. The following day he told reporters the data had come through a contact in the private sector, and included the age or registered address recorded when the number's owner first obtained it[^21]. The Taipei District Prosecutors Office opened a case with an unnamed defendant, citing the Communications Security and Surveillance Act and the Personal Data Protection Act[^22]. All three major carriers told the National Communications Commission they had provided no such information to outside parties[^21]. No public record of the investigation's outcome could be found.

What data he actually used is a matter for the investigation, and this page takes no view on it. The statement works well as an exercise, because it lays out exactly what a crowd inference requires.

Supporting that statement needs four conditions.

| Condition | What the statement required |
|---|---|
| Space | A few city blocks around the Legislative Yuan |
| Time | That one evening, 2024-05-24 |
| Attribute | The ages of the people present |
| Individual linkage | Whether the people present were the same people as at the other two events |

The fourth condition depends on how rigorous the conclusion needs to be. Strictly establishing "the same people" requires individual-level linkage across dates. Saying on air that they were "an entirely new group" only requires comparing crowd sizes and age structures between events.

This puzzle is set around a crowd outside a parliament, but the same data becomes sharper where fewer people live. Taiwan is divided into 157,933 statistical areas, and 10,513 of them have a registered population in single digits. In a cell of about ten households, residents leaving in the morning and returning at night show up as movement in the numbers. If that describes where you live, the section on how small these units actually are is about your neighbourhood.

The price is set in regulation. Two thousand New Taiwan dollars per unit, available to anyone holding Taiwanese nationality, which works out to 315,866,000 for the whole country. How many of the four conditions that two thousand dollars buys, and where the rest are, is what the rest of this page takes apart. One of them is free and requires no application at all. Four separate windows each check only the dataset they hand over, and none asks what the applicant already holds. That is the real answer to the puzzle. The comparison table is in [Back to the puzzle](#Back-to-the-puzzle).

## After binding, records come in three kinds

Once a mobile number, payment account or advertising account is open, records start being produced. They are grouped here by where they are generated.

| Kind | Who holds it | Content |
|---|---|---|
| Where you are | Carrier core network | Which number was near which base station at which time |
| What you connect to | Carriers and public telecom network operators | Connection times, domain names, IP addresses, volumes, service types |
| What you buy | Electronic ticket and electronic payment institutions | Transit journeys, small purchases, bound devices and browsing traces |

All three are produced by the service itself. None requires any action from you, and none has a switch of its own.

### Where you are

As long as a phone is switched on, even when you are not on a call or looking at the screen, it keeps checking in with nearby base stations. The network has to know which station's range you are in before it can deliver an incoming call. These control messages, exchanged so that a connection can exist at all, are called signalling in the industry, and they travel on a different path from the content of your calls and messages.

Signalling belongs to the category of [metadata](../basics/metadata.md), the outside of the envelope. Without opening anything, it accumulates into a list of which number was near which base station at which time, and that list is what sits in the carrier's core network.

Taiwanese official documents use the term 信令, which translates as signalling. General reporting mostly uses the phrase "mobile phone signal." They refer to the same records. This page follows the official term so that readers can match it against the source documents.

Chunghwa Telecom's personal data collection notice, in the mobile broadband version, lists nine specified purposes with their statutory codes[^24]. Three of them bear on signalling-derived products.

| Code | Specified purpose | Wording in the notice |
|---|---|---|
| `133` | Operation of telecommunications and value-added network services | Provision of telecommunications services related to this service |
| `040` | Marketing | Provision of product, tariff and bundle information relevant to customer interests |
| `157` | Survey, statistics and research analysis | Statistical use and analysis of customer usage data, to plan the most suitable tariffs and products, and to offer customers tariff and preferential plan recommendations |

The notice divides collected personal data into seven categories. The fifth is location information and the sixth, billing information, includes communication records. Both are produced by signalling. The fourth, domain browsing information, covers connection times, data volumes, domains and signal status.

The third category deserves separate attention. The notice describes it as "network usage information: communication device identifiers, internet protocol addresses and location information, communication times, connection volumes and packet counts, domain names, application service types and protocols, generated by the public telecommunications network after your use of telecommunications services"[^24]. The stretch from "generated by the public telecommunications network" through "application service types and protocols" is word for word identical to the definition of network traffic records in Article 3-1 of the Communications Security and Surveillance Act[^29]. The same field list is, on the statutory side, material the carrier must retain for a year and hand over on request, and on the contractual side, the carrier's own asset. The section on what you connect to returns to this.

The same notice, at Article 10(3), sets out the processing and the recipients. The clause is headed "processing and use of data from which individuals cannot be directly identified," and has two points. The first reads[^24]:

> We will, by technical methods objectively available at the time, process your personal data into a form from which, as presented, no specific natural person can be directly identified, and apply de-identification or other data minimisation techniques (see clause eleven of this notice), so that the data appears as statistics, trend analysis, or other results from which individuals cannot be directly identified. The foregoing results may be provided to enterprise customers, content providers, or innovation experiment entities licensed by the competent authority, as a basis for commercial judgement or technological development (for example, allowing content providers to understand consumer click behaviour, or consumer age and gender distribution).

The parenthetical states the capability plainly: consumer age and gender distribution is among the results that may be handed to enterprise customers. The second point in the same clause is the stop provision[^24]:

> Should you wish to stop our processing and use of your personal data by the foregoing method from which individuals cannot be directly identified, you may notify us to stop via the contact methods in clause eight of this notice. This does not apply to processing or use already carried out before your request, or where otherwise provided by law.

An exit route exists, at Article 10(3) point 2. The default is that processing continues, it stops only if the individual actively gives notice, and the effect runs only from the notice onward.

Taiwan Mobile's personal data notice lists the same set of specified purpose codes, and the wording of those two points is identical to Chunghwa Telecom's[^25], down to the parenthetical example and the internal cross-reference to clause eleven. Two independently published documents carrying identical wording in the same clause indicates an industry template. The method lists at clause eleven do differ: Chunghwa Telecom lists suppression, pseudonymisation, generalisation, randomisation and aggregation; Taiwan Mobile lists pseudonymisation, masking, hashing and suppression or redaction, with examples such as retaining only the last six digits of a national ID number. Changing the shared template is a matter for the industry and the regulator, not something a single company's customer service can adjust.

A public statement issued by Chunghwa Telecom on 2024-05-30, in response to the mobile signal location controversy, uses a different formulation[^26]:

> The "big data crowd analysis service" we provide applies de-identification before any big data analysis is performed. The processed data consists solely of crowd volume and profile distribution statistics, from which no specific natural person can be directly or indirectly identified.

The company's own notice says "cannot be directly identified," without the word "indirectly." Indirect identification, as defined in Article 3 of the Enforcement Rules of the Personal Data Protection Act, is precisely the situation where identification requires cross-referencing, combination or linkage with other data. The press statement claims the stricter standard. The contractual document commits to the looser one.

### What you connect to

The amendment to the Communications Security and Surveillance Act promulgated on 2024-07-31 added a third category alongside the two that already existed. The three definitions appear in Article 3-1[^29]:

> Communication records means records generated by the public telecommunications network after a subscriber or telecommunications user has used telecommunications services, including the telecommunications numbers of the sending and receiving parties, communication times, duration of use, addresses, service types, mailboxes or location information.
>
> Communication user data means the name or title, identity document number, address, telecommunications number of a subscriber or telecommunications user, and the data entered when applying for each telecommunications service.
>
> Network traffic records means records generated by the public telecommunications network after a subscriber or telecommunications user has used telecommunications services, including communication device identifiers, internet protocol addresses and location information, communication times, connection volumes and packet counts, domain names, application service types and protocols, not involving the content of communications.

The third category is the list of domains you connected to, when, and how much data passed. The statute explicitly excludes content. What remains is enough to describe a person's daily rhythm and interests.

The same amendment added Article 14-1, making retention a carrier obligation[^29]:

> Telecommunications enterprises and public telecommunications network operators have the obligation to retain, and to assist in the execution of retrieval of, communication user data and communication records.
>
> Telecommunications enterprises and public telecommunications network operators designated by the establishing agency for communications surveillance have the obligation to retain, and to assist in the execution of retrieval of, network traffic records.

How long retention lasts was left to secondary legislation. The Regulations Governing the Management of Network Traffic Records, promulgated 2024-12-27, set out the fields and the period at Article 4[^30]:

> The network traffic records retained by telecommunications enterprises and public telecommunications network operators shall include communication device identifiers, internet protocol addresses and location information, communication times, connection volumes and packet counts, domain names, application service types and protocols, not involving the content of communications. The specific items shall be designated by the establishing agency in consultation with the telecommunications enterprises and public telecommunications network operators.
>
> The retention period for network traffic records under the preceding paragraph shall be at least one year from the time the record is generated.

"At least one year" states only a floor. Article 5 of the same regulations requires carriers to designate a dedicated receiving unit, with a 72-hour response for ordinary cases and 24 hours for urgent ones[^30].

That field list appeared earlier on this page. The third category of personal data in Chunghwa Telecom's collection notice, "network usage information," matches the statutory definition word for word from "generated by the public telecommunications network" through "application service types and protocols"[^24]. The same set of fields therefore carries two identities at once: to law enforcement it is material retained for a year and available on request, and to the carrier it is proprietary data whose stated collection purposes include marketing `040` and statistical analysis `157`. The de-identified statistics derived from it may be supplied to enterprise customers under Article 10(3), including that stop provision whose default is on.

#### Three routes to obtain these records

Article 11-1 sets different thresholds for the three categories[^29].

| Data | Who may obtain it | Court required |
|---|---|---|
| Communication user data | Prosecutors and judicial police officers | No. Paragraph 1 says they "may obtain it" |
| Communication records, network traffic records | Prosecutors | Yes. Paragraph 2 requires application to a court for a retrieval warrant |
| Communication records, network traffic records | Prosecutors ex officio, or judicial police officers with prosecutorial approval | No. Paragraph 4 lists a schedule of offences |

The paragraph 4 schedule covers offences carrying a minimum sentence of ten years or more, together with robbery, snatching, fraud, intimidation, kidnapping for ransom, offences against computer security, escape, and offences under the Human Trafficking Prevention Act, the Controlling Guns, Ammunition and Knives Act, the Statute for Punishment of Smuggling, the Narcotics Hazard Prevention Act, the Organized Crime Prevention Act, the Waste Disposal Act, the Child and Youth Sexual Exploitation Prevention Act, the Money Laundering Control Act, the National Security Act, the Anti-Infiltration Act, the presidential and public officials election acts, and specified provisions of the Farmers' Association Act and Fishermen's Association Act[^29].

The 2014 version of Article 11-1 also carried a schedule of this kind, and fraud was already on it. What this amendment changed is two other things. Communication user data moved from "requires a warrant, together with communication records" to direct retrieval under paragraph 1. The schedule itself gained offences against computer security, escape, the Waste Disposal Act, the Child and Youth Sexual Exploitation Prevention Act, the Money Laundering Control Act, the National Security Act, the Anti-Infiltration Act, the two election acts, and provisions of the farmers' and fishermen's association acts.

#### Which route was actually used

The Ministry of Justice publishes annual retrieval statistics, split across three tables by applicant, by offence, and by category of record. Exporting five years and recomputing gives the share that passed through a court[^31].

| Year | Total lines retrieved | Issued by a court | Share |
|---|---|---|---|
| 2021 | 285,294 | 14,575 | 5.1% |
| 2022 | 279,728 | 21,071 | 7.5% |
| 2023 | 291,240 | 17,830 | 6.1% |
| 2024 | 272,288 | 16,283 | 6.0% |
| 2025 | 487,353 | 10,702 | 2.2% |

2025 is the first full year under the amended Act. The total rose 79% over the previous year while the number of lines issued by a court fell to a five-year low, two movements in opposite directions. Counted by case rather than line, the year totals 165,001 cases, of which 2,981 were applications to a court, or 1.8%.

The court column includes rejections: in 2025, 9,715 lines approved and 987 rejected. Of the other two routes, "application for prosecutorial consent" is decided by a prosecutor, and "prosecutor ex officio" requires no application at all.

Splitting the same year by category of record shows the differences clearly[^31]. Communication records account for 379,663 lines, or 77.9%. Network traffic records account for 62,518 lines, or 12.8%. User data accounts for 43,542 lines, or 8.9%, with the remainder in an "other" column. The user data row shows the effect of the amendment most clearly: lines issued by a court fell from 3,536 in 2023 to 321 in 2025, a drop of ninety percent, matching the move to direct retrieval under paragraph 1.

??? note "Full 2025 figures by category of record"

    | Category | Lines | Share | Of which by court |
    |---|---|---|---|
    | Communication records | 379,663 | 77.9% | 8,215 (2.2%) |
    | Network traffic records | 62,518 | 12.8% | 1,953 (3.1%) |
    | User data | 43,542 | 8.9% | 321 (0.7%) |
    | Other | 1,630 | 0.3% | 213 |

    Network traffic records did not exist as a category in 2023. The figure was 5,340 lines in 2024 and 62,518 in 2025. Year-on-year comparison has to account for the "other" column in the same table, which the published notes describe as covering IP, Line and other communications since August 2019, and which fell from 56,564 lines in 2023 to 1,630 in 2025 as items were reclassified into the new category. Taking the two columns together gives 56,564 in 2023, 37,575 in 2024, and 64,148 in 2025.

Splitting by offence identifies the largest single ground[^31].

| Offence | Lines | Share of year | Of which by court |
|---|---|---|---|
| Fraud | 266,514 | 54.7% | 320 (0.12%) |
| Narcotics Hazard Prevention Act | 101,934 | 20.9% | 193 (0.19%) |

Anti-fraud accounts for more than half of all lines retrieved in 2025, and within that half the share reviewed by a court is roughly one in a thousand. Fraud sits on the Article 11-1(4) schedule, which does not require a warrant, so the figures track the statute.

The same Fraud Crime Hazard Prevention Act is also the legal basis for Taiwan's national-level DNS resolution blocking. The Criminal Investigation Bureau states in its open data documentation that suspension of resolution for fraud-related sites rests on Article 42 of that Act[^20], and TWNIC publishes annual statistics on its RPZ blocking through a transparency report[^47]. These three provisions were enacted separately, through separate legislative processes, and share the stated purpose of fraud prevention. Domain-level handling at the network layer, carrier queries against government identity databases, and fraud's place on the no-warrant schedule add up to a combined scope that no published document has assessed together. This page places the three side by side to point out that absence of combined review, and does not claim they arose from a single plan.

#### The duty to notify covers only one of the three

The amendment also added a passage to Article 15[^29]:

> The preceding six paragraphs shall apply mutatis mutandis where network traffic records of another person are retrieved under this Act. Where network traffic records are retrieved under Article 11-1, paragraph 4, notification shall be given by the executing agency.

So a person whose network traffic records have been retrieved should be notified. Article 11 of the Regulations Governing the Management of Network Traffic Records sets three different timelines by route[^30]. On the two court-issued routes, a prosecutor reports to the court within one month for the court to notify, and a judicial police officer within fifteen days through a prosecutor for the court to review and notify. On the paragraph 4 route, which needs no warrant, both prosecutors and judicial police officers notify the person directly within one month, with no court in between. Of the 62,518 lines of network traffic records in 2025, 60,565 went through paragraph 4, or 96.9%, so the last of the three is what applies in practice.

The closing part of the same article sets out two situations where no notification is required. The first reads[^30]:

> Where a prosecutor or judicial police officer retrieves communication records under this Act, and part of the data obtained constitutes network traffic records.

If the request is filed as communication records and network traffic records come back with them, the duty to notify does not arise. Notification attaches to the category named on the application, decoupled from what is actually received.

Communication records and communication user data carry no notification requirement of their own. Measured by lines in 2025, the category with a notification design accounts for 12.8%, leaving 87.2% outside it entirely, and that 12.8% is further reduced by the exception above.

### What you buy

Opening an electronic payment account requires identity confirmation. Article 4 of the Regulations Governing Identity Confirmation Mechanisms and Transaction Limits for Electronic Payment Institutions requires institutions to know the user's identity, retain identity data and confirm its authenticity. Article 5 requires a query to the Joint Credit Information Center covering four categories of data, with records kept[^32]. Registering a stored-value card falls under the same provision.

The records produced after registration are broader than most people expect. EasyCard Corporation's personal data notice lists the categories it collects, one stretch of which reads[^33]:

> Information relating to your online browsing behaviour when visiting our website (including official social media accounts) or mobile application, including but not limited to mobile device identifiers, mobile device location, social network information, internet protocol (IP) addresses, browsing traces on and off our sites, and cookies

Mobile device identifiers, device location and on-and-off-site browsing traces appear together on a transit card operator's list. The same document lists specified purposes including marketing `040` and survey, statistics and research analysis `157`[^33], the same codes as in Chunghwa Telecom's notice.

A press release issued by EasyCard Corporation on 2024-01-12 describes where those records go[^34]:

> EasyCard Corporation serves more than eighty percent of all categories of transport in Taiwan, holds diverse and precise journey data, and has accumulated 2.72 million members since entering the electronic payment market with EasyWallet. On a base of 109 million cards in circulation…

The same release describes the arrangement[^34]:

> Through big data and AI computation, Vpon applies de-identification to combine transit data and small-payment data with Vpon's audience data and point-of-interest data, analysing the preferences of different customer segments across business districts, metro stations, retail outlets and other dimensions, to deliver member offers at the right time and place.

That sentence joins four datasets: transit journeys, small purchases, a third party's audience data, and point-of-interest coordinates. Another line in the same release states the objective as combining "existing data with digital traces and external information" for rapid insight into the consumption behaviour of different user segments[^34]. Combining with external information appears in an official press release, described as de-identification.

## Four windows onto the same business

The three preceding sections look like three separate things: identity requirements, state retrieval, carrier collection. What joins them is the same field list and the same word. The third category of personal data Chunghwa Telecom collects matches the statutory definition of network traffic records word for word. On the legal side that list is material retained for a year and available on request; on the contractual side it is proprietary data that may be de-identified and supplied to enterprise customers. What follows is that second side.

Once the three kinds of record exist, there are four places that turn them into products. The application routes, prices and review processes differ. Two things they have in common: each explains itself using "de-identification," and none needs to ask the person concerned first.

### Window one, the government sells its own

The Ministry of the Interior works with the three major carriers to produce telecom signalling population statistics. The fee schedule is made under Article 22(2) of the Freedom of Government Information Act[^1]. The ministry describes the product's scale itself[^2]:

> Source data market share exceeds 85%, coverage spans Taiwan, Penghu, Kinmen and Matsu, covering all 22 cities and counties, 368 townships and districts, 7,760 villages and boroughs, and 157,933 smallest statistical areas, with 8 time slots per location (weekday/weekend, morning/noon/afternoon/evening) and 2 population statistics values (headcount and trips). Among nationwide large-scale statistical operations, it is the only one publishing spatial-temporal statistics at this level of detail.

The 85% figure is the three carriers' share of all mobile subscribers nationally, used to show how broad the sampling base is. It does not mean 85% of the population is tracked. Eight time slots multiplied by two values means each smallest statistical area carries sixteen numbers.

The price list is in regulation[^7].

| Applicant | Service fee | Royalty collected | Total per unit |
|---|---|---|---|
| Natural person | 500 | 1,500 | 2,000 |
| Legal person | 500 | 9,000 | 9,500 |

Figures are in New Taiwan dollars. A unit is one smallest statistical area or one village. City, county, township and district levels are free to download; village and smallest statistical area levels are paid. Eligibility is limited to the categories in Article 9 of the Freedom of Government Information Act: nationals with household registration, domestic legal persons and groups they establish, and nationals resident abroad holding a Taiwanese passport[^7]. The application page offers two data periods, November 2020 and November 2023[^7], each covering one month. Two snapshots of the same cells three years apart can be laid side by side, for 4,000.

Because the fee is per unit, wider coverage costs more.

| Scope | Units | Cost to a natural person |
|---|---|---|
| A single smallest statistical area | 1 | 2,000 |
| A median-sized township or district | 323 | 646,000 |
| The whole country | 157,933 | 315,866,000 |

A nationwide sweep is uneconomic. Watching a single location is inexpensive. The asymmetry may not be by design; the effect is that the cost of access rises steeply with scope and approaches zero as scope narrows.

The cost side can be compared. The ministry contracts the carriers annually. Open procurement records show that the 2025 contracts with Taiwan Mobile and Far EasTone were each tendered at 3,450,000, awarded on 2025-09-30 and 2025-09-26[^45]. The two together come to 6.9 million. Whether Chunghwa Telecom had a corresponding contract that year, and at what value, could not be determined. Against that sits the price of the same data sold in full to one natural person: 315.87 million.

The buyers are not only the ministry. Cross-checking vendor award records, two cases match case by case[^27].

| Agency | Case | Awarded to |
|---|---|---|
| Taipei City Government Department of Information Technology | 2022-23 Taipei City Government telecom signalling data service | Chunghwa Telecom Enterprise Business Group |
| Directorate General of Highways, MOTC | Extension of the project applying mobile network signalling detection (CVP) to improve traffic information services | Chunghwa Telecom Enterprise Business Group |

There is also a parallel commission outside the carriers. The ministry's methodology document states that a team at National Taipei University was separately engaged to integrate the signalling data supplied by the three carriers[^2], which the section on who performs the aggregation returns to.

Municipal government and transport both have procurement records, then. Announcement titles carry only the case name; what form of data each case actually received is not stated publicly. An earlier version of this page listed three further cases in tourism, healthcare and academia. Checking them one by one against vendor award records produced no match, so they have been withdrawn. See [Limits of this page](#Limits-of-this-page).

#### Who performs the aggregation

Whether individual signalling records ever leave the carrier's core network determines where the risk sits. The methodology document states the division of work[^2]:

> Drawing on research experience accumulated from 2017 to 2019 (…), the Ministry commissioned three carriers in 2020 to carry out processing of November 2020 telecom signalling data according to algorithmic logic and sampling methods provided by the Ministry, ensuring consistency of processing, and to supply validation samples and statistical results.

The algorithmic logic comes from the ministry and execution stays with the carriers, so what reaches the ministry is already aggregated. That part of the design is sound. The same passage continues[^2]:

> A team at National Taipei University was further commissioned to integrate the telecom signalling data supplied by the three carriers, in order to estimate the national static population situation, including night-time residence, daytime activity population and trips in specific areas, and to use the signalling data of validation sample subscribers for internal research on population movement behaviour.

The validation sample is drawn on an ID basis, totalling roughly 2.47 million subscribers across the three carriers, about ten percent of mobile users. It is subscriber-level signalling data, its stated use is research on population movement behaviour, and the party performing that work is the commissioned university team. The document separately records that in 2018 and 2019 the project "collected raw data from a single carrier and used raw point locations to estimate the population situation of Taipei and New Taipei"[^2], a stage at which raw point locations were obtained.

The product sold to the public is genuinely aggregated statistics produced at the carrier end. Across the research programme as a whole, subscriber-level sample data and raw point locations have both existed. How long that material is kept, who holds it, and how it is disposed of after research ends, are not addressed in the public documents.

### Window two, what the carriers sell directly

The government product has a price list fixed in regulation and two fixed data periods. The version carriers sell directly has neither constraint.

The Taiwan FactCheck Center's report of 2024-06-04 quotes Chunghwa Telecom's description of its crowd and customer-segment analysis platform, which produces footfall volumes and customer profiles for a given area by month, by day and by hour. One example in the report draws a boundary around a Christmas market plaza in New Taipei and estimates attendance from subscriber location data between 6pm and 9pm on 24 December[^21]. Choosing a date, a time window and a patch of ground is routine in the commercial service.

The same report records two further points: origin-to-destination signalling data carrying a UID can be used to analyse user behaviour, and a common advertising practice involves specifying target audiences by age, gender and prior presence at a particular venue to a data firm working with a carrier, then pushing SMS advertising when those people enter a defined area[^21].

There is a corresponding product on the online side. A 2017-07-05 report describes Chunghwa Telecom's Data Communication Business Group launching a service in partnership with eLAND Information's third-party audience database, PeopleView[^37]:

> The service combines telecom big data with eLAND's existing PeopleView audience database, taking online data such as the digital traces left by public browsing, applying semantic technology and machine learning to identify page content, tagging browsers by interest and lifestyle, then linking that to offline data such as physical footfall, to delineate clear customer segments.

Browsing records pass through semantic analysis to become interest tags, which are then linked to location data. That description dates from 2017. This page could not establish the service's current operational status; PeopleView remains listed among eLAND's products.

The EasyCard and Vpon arrangement described earlier sits on the same pattern: transit journeys and small purchases on one side, matching technology on the other, output delivered as group profiles.

### Window three, the advertising identifier

The data in the first two windows comes from your contractual relationship with a company. The third needs no contract.

The operating system generates an advertising identifier for each device, called IDFA on iOS and GAID on Android, so that different apps can recognise the same device. It is a software value, not a hardware serial fixed at manufacture, and the two platforms give users very different handling.

Since App Tracking Transparency arrived on iOS in 2021, apps must obtain consent before tracking across apps. The Electronic Frontier Foundation records that around twenty percent of users opted out before the change, and that after consent became affirmative the vast majority chose not to allow tracking[^46]. Android went the other way: since 2022-04-01 reading the identifier requires a declared permission but no prompt, and from Android 12 users can delete it permanently[^46].

How Taiwanese firms use that identifier is on the record. Reporting describes Vpon as having integrated user data through third-party cookies and advertising IDs, and as having separately developed an internal group identifier, Vpon ID[^35]:

> Vpon, a big data group focused on mobile device data analysis, has long integrated user data through third-party cookies or advertising IDs, segmenting users, profiling those segments, and targeting individuals on that basis.

The sources are not limited to one. The company's chief executive, in a media item paid for by the company, described the composition of its third-party database. This is the operator's own account of its product, not third-party verification[^36]:

> Beyond collecting data through the app advertising network, Vpon also builds on electronic invoice data and combines it with open government data, expanding the dimensions of collection so that the database covers offline consumption tendencies, geographic location, demographic profile, interest preferences, app usage behaviour and more.

App advertising network, electronic invoice data, open government data, in one database. The same item records the company's privacy position[^36]:

> Vpon has insisted from the outset on not collecting users' names, phone numbers or other personally identifying data. The database contains only anonymised device behaviour data.

The claim has the same shape as the two documents quoted earlier from the Ministry of the Interior and Chunghwa Telecom: remove names and phone numbers, declare what remains anonymous. A statement of what a company does not collect, published in content the company paid for, warrants discount, though it remains that company's public description of its own product's composition.

The United States Federal Trade Commission made a direct finding on claims of this shape when it acted against the data broker X-Mode Social and its successor Outlogic on 2024-01-09. The accompanying press release states[^38]:

> The raw location data that X-Mode/Outlogic has sold is associated with mobile advertising IDs, which are unique identifiers associated with each mobile device. This raw location data is not anonymized, and is capable of matching an individual consumer's mobile device with the locations they visited. In fact, some companies offer services that help companies match such data to individual consumers.

Raw location data tied to an advertising identifier is not anonymised, is sufficient to match a device to the places it went, and there is an existing market in services that complete the match to individual consumers. On 18 January of the same year the Commission issued a further order against InMarket Media, prohibiting the sale or licensing of precise location data[^39].

Breach events test the finding. The location data broker Gravy Analytics suffered a breach in January 2025; reporting records that the attackers claimed to have taken 17TB of data covering 3,455 apps, with games, dating and video-download tools among the categories named[^40]. That leaked data can be used to reconstruct individuals' homes and movements is itself evidence of what the data was before it leaked.

Taiwan has no registration regime for firms of this kind. California's Delete Act requires data brokers to register annually and, from 2026-01-01, to participate in a centralised deletion request platform, DROP, which brokers must begin processing from 2026-08-01, checking at least once every 45 days[^41]. The corresponding position in Taiwan is empty: no register, and nowhere to ask for deletion across the market at once.

### Window four, open data, free

The first three windows cost money or require a negotiated contract. The fourth does not.

The statistical area population dataset on Taiwan's open data platform publishes, at the smallest statistical area level, household counts, population, male population and female population[^4]. The statistical area population indicators dataset on the same platform publishes, at the same level and keyed on the same `CODEBASE` field, sex ratio, household size, population density, dependency ratio, child dependency ratio, aged dependency ratio and ageing index[^23]. Both are free downloads requiring no application.

The child dependency ratio is the population aged 0 to 14 divided by the population aged 15 to 64. The aged dependency ratio is the population aged 65 and over divided by the same denominator. Given the total population and those two ratios, the three age bands are three unknowns against three equations and can be solved directly.

This page ran that reconstruction across Hualien County's 4,632 smallest statistical areas. In 3,797 of them the three reconstructed bands sum to within one person of the total. The remaining 835 cannot be computed because registered population or the 15-to-64 band is zero. No reconstruction contradicted its total. For areas with a registered population in single digits, what comes out is the sex composition and the young-working-old structure of those few households.

The smallest statistical area code is a shared key. Window one sells headcounts and trips arranged by that key. Window four gives away sex and age structure arranged by the same key. The ministry's statement that the product "contains no personal data items such as gender, age or address" describes the product's field list, not the buyer's position after acquisition.

## What "de-identification" does in Taiwanese law

Each of the four windows says the same thing once. The Ministry of the Interior's methodology document says the product "contains no personal data items." Chunghwa Telecom's incident statement says no natural person can be "directly or indirectly identified." EasyCard's partnership release says the work is done "by way of de-identification." Vpon's chief executive says the database "contains only anonymised device behaviour data." Four parties, four kinds of data, one word.

The threshold sits in Article 17 of the Enforcement Rules of the Personal Data Protection Act[^15]:

> Personal data from which the specific individual cannot be identified, by means of codes, anonymisation, concealment of part of the data, or other methods

Coding is listed as an acceptable method. The provision sets no quantitative threshold and no methodological requirement. Assigning each subscriber a number and then asserting that the dataset is no longer personal data is defensible on that wording.

Article 3 of the same Enforcement Rules addresses the other side[^15]:

> The term "indirectly identified" in Article 2, subparagraph 1 of this Act means that the public or non-public agency holding the data cannot identify the specific individual from that data alone, and requires cross-reference, combination or linkage with other data before the specific individual can be identified.

A dataset that identifies nobody on its own, but does so once cross-referenced, combined or linked with other data, remains personal data. Cross-reference, combination and linkage are named in the text, at Article 3.

The two provisions differ in what they test. Article 17 examines a single dataset. Article 3 examines what happens when that dataset sits alongside others. All four windows answer only the Article 17 question.

The European Union draws the line elsewhere, at Recital 26 of the GDPR[^16]:

> Personal data which have undergone pseudonymisation, which could be attributed to a natural person by the use of additional information should be considered to be information on an identifiable natural person.

The test is "all the means reasonably likely to be used, such as singling out," accounting for cost, time and available technology. The FTC's finding on X-Mode runs the same way, asking whether a market exists in services that complete the match.

National standards do exist. CNS 29100, CNS 29191 and CNS 29100-2 cover a privacy framework, partially anonymous and unlinkable authentication, and requirements for a de-identification process management system[^17]. All three are voluntary certification rather than legal obligation.

How wide the threshold is can be read off the way the ministry's own methodology document describes industry capability[^2]:

> Taiwan Mobile has long invested in big data analysis, successfully identifying consumer profiles for clients through de-identified telecom data… analysing per-second movement trajectories of subscribers via base stations to define categories of exercise-oriented segments, maximising marketing effectiveness.

Per-second trajectory analysis is called de-identification, in the same document that concludes there is no privacy concern whatsoever. The two statements coexist without contradiction, because under the current provisions both hold.

## What aggregation actually protects

The window one product aggregates individual records into statistical values. That is a genuine privacy measure, and it works on one condition: that each cell contains enough people. Where a cell holds only a few households, movement in the number reflects the presence or absence of those households. So whether the product is safe depends on how small a cell can be.

The ministry's conclusion on the product is stated in absolute terms[^2]:

> No risk whatsoever of personal data disclosure: the population statistics supplied by the three major carriers consist solely of "statistical data" broken down by spatial statistical unit (city/county, township/district, village, smallest statistical area) and time slot (weekend/weekday, morning/noon/afternoon/evening), containing no personal data items such as gender, age or address. There is absolutely no personal data concern.

The reasoning rests on two things: the data is aggregated statistics, and the fields exclude gender, age and address. Nothing in between addresses how many people are in a cell.

### The rules set no minimum population

Another ministry document states the design intent for the smallest statistical area[^3]:

> The National Geographic Information System established a set of systematic, long-term fixed small or specific areas to serve as the smallest spatial unit for statistics, in order to protect the privacy of individual records.

If the spatial unit is the protection, the delineation standard sets the floor. Three area types each have a rule, and they share a structure: a low population alone is not enough, a second condition must also be met, and that second condition differs by area type. Mountain and rural areas look at whether the area is also small; urban areas look at whether the GIS address count is also low. So a mountain or rural cell with few people but a substantial area, and an urban cell with few people but a substantial address count, each satisfy their own rule and are not merged. A further rule states that cells with a population of zero must exceed one hectare, expressly permitting zero-population cells to exist.

??? note "The delineation standards by area type"

    The standards recorded in the same document[^3]:

    | Area type | Population rule | Small-value adjustment condition |
    |---|---|---|
    | Mountain | Target maximum 450 | Adjustment required where population is under 50 and area under 10 hectares |
    | Rural | Target maximum 450, target maximum 150 addresses | Adjustment required where population is under 50 and area is 10 hectares or less |
    | Urban | Target maximum 450, target maximum 200 addresses | All cells under 0.1 hectares reviewed, and cells with population under 100 and GIS address count under 100 merged |

    The mountain and rural threshold is a population under 50; the urban threshold is a population under 100 together with an address count under 100. The 0.1 hectare rule is a separate full-review trigger.

    An urban cell is designed around a target maximum of 200 addresses and 20 hectares, roughly one or two city blocks. Rural cells have a floor of 5 hectares and a target maximum of 30. The ministry's [statistical area map](https://segis.moi.gov.tw/STATCloud/Map){target="_blank"} can be zoomed to find your own cell.

450 is a ceiling. There is no floor. Neither the methodology document nor the fee schedule supplies one. Neither contains any provision for a minimum population threshold, small-value suppression, or statistical disclosure control.

### How small these units actually are

Since the rules set no floor, the actual distribution has to be computed. The data comes from the statistical area population dataset on Taiwan's open data platform, covering the smallest statistical area level across 22 cities and counties, for December 2024[^4].

The computation returns 157,933 smallest statistical areas nationally, with a total population of 23,390,517. The count matches the 157,933 recorded in the ministry's document exactly, two independent routes agreeing.

Zero-population areas have to be separated first. Nationally 17,297 areas have a registered population of zero, or 10.95%. Those cells have no residents and raise no privacy question. Folding them into the low-population count would overstate the risk, so the table below lists them on their own line and counts every other line from one upward.

| Condition | Areas | Share of national |
|---|---|---|
| Registered population 0 | 17,297 | 10.95% |
| Registered population 1 to 9 | 10,513 | 6.66% |
| Registered population 1 to 20 | 17,876 | 11.32% |
| Registered population 1 to 99 | 56,819 | 35.98% |

The median is 110, or 131 counting only inhabited areas. Most cells are large enough for aggregation to do its work. The question is the 10,513 cells holding populations in single digits.

A cell of around ten households carries a number for each of four time slots on weekdays and weekends. Residents who leave on weekday mornings and return in the evening produce movement across those sixteen numbers. One more person staying home long-term, one fewer returning at weekends, and at that cell size there is a chance of reading it off the figures. That inference follows from ordinary reasoning about sample size and variance; this page did not obtain actual activity population values to test it, and the section on what these numbers can and cannot show sets out the boundary.

### The gap concentrates in the east and in Chiayi

Aggregation protects less as cell population falls, so the more dispersed the settlement the weaker the protection. Breaking the figures down by county shows that the least densely populated counties are not necessarily the least protected, because sparseness comes in two forms. A cell with nobody in it and a cell with a handful of people in it are different things, and only the second raises a privacy question.

| Scope | Areas | Median population | Share at 0 | Share at 1 to 9 |
|---|---|---|---|---|
| Main island, 19 counties and cities | 155,289 | 111 | 10.6% | 6.6% |
| Outlying islands, 3 counties | 2,644 | 29 | 33.3% | 7.8% |
| Lienchiang County | 422 | 0 | 76.5% | 3.8% |
| Taitung County | 4,812 | 8 | 36.5% | 14.4% |
| Hualien County | 4,632 | 37 | 18.0% | 15.0% |
| Chiayi County | 5,593 | 42 | 22.0% | 12.8% |

Seventy-six percent of Lienchiang County's cells have no residents at all. Judged only on "very few people," it would rank highest nationally. In fact cells holding single-digit populations make up just 3.8% there, below the main-island average. Sparsely populated and extremely dispersed are two different things.

The real gap shows in Taitung and Hualien, where cells holding one to nine people account for 14.4% and 15.0%, more than double the main-island average of 6.6%. Chiayi County at 12.8% is also high. The same rules and the same price deliver, in those places, a considerably finer grain than in a city. Applying a fixed spatial unit to an unevenly distributed population necessarily produces this gap; it is not a deliberate policy choice. The official zero-risk conclusion applies nationally without distinguishing it.

### International practice includes this layer

Setting a minimum displayed count on aggregate statistics is standard practice in official statistics, known as small-value suppression or k-anonymity: each cell must contain at least k people, and cells falling short are left blank or merged with neighbours.

Eurostat's case documentation on processing mobile network operator data states that what a national statistical institute should receive is "non-personal aggregate data (fulfilling some k-anonymity condition)" rather than raw data[^5]. That document specifies no value for k. In practice the threshold varies by field; the suppression threshold used by the United States Centers for Disease Control and Prevention for cancer statistics is 15[^6].

Taiwan's product has no corresponding provision. No k value appears in the public documents, and neither does any indication of whether suppression is applied.

### What these numbers can and cannot show

The figures above are registered population. The product publishes activity population derived from signalling. They are different quantities. What the computation establishes is the size of the spatial units. How many people were actually present in a cell during a given time slot is data this page did not obtain.

In residential cells with only a few registered residents, late-night presence is unlikely to be far above the registered figure, and the two numbers should be close. Taitung and Hualien are tourist counties, where weekend-afternoon activity population may run far above registered population as visitors arrive, and cells in those slots hold more people rather than fewer. Both statements are ordinary inference rather than measurement.

The product supplies counts per time slot. The field design provides no key for linking the same person across cells, so what it supports is inferring whether particular households are present, not tracking where a given person went. Having no key by design and being impossible to reassemble in practice are not the same thing, and both the GDPR and FTC tests quoted above count the holder's other information. Under that test, how much distance remains between a ten-household cell and its residents once the holder's other information is added is a question that ought to be examined. **This page has not examined it**, and obtained no copy of any actual delivered dataset, so it stops at the observation that the test requires an assessment and no public document contains one.

Setting both of those aside, the gap in the official reasoning still stands: a conclusion drawn from aggregation and field lists alone, with no step anywhere testing cell population.

## Back to the puzzle

The specifications of all four windows have now been covered, so the four conditions can be checked one by one.

??? question "How many of the four does that two thousand dollars satisfy?"

    One.

    | Condition | Result | Reason |
    |---|---|---|
    | Space | Satisfied | The smallest statistical area is block-scale, averaging a little over a hundred residents |
    | Time | Not satisfied | Only two versions exist, November 2020 and November 2023, each a monthly aggregate, with time fields of weekday/weekend by morning/noon/afternoon/evening |
    | Attribute | Not satisfied | The only values are headcount and trips |
    | Individual linkage | Not satisfied | Aggregation leaves no identifier for linking across dates |

    The one condition satisfied is space, which is also the product's finest feature. The other three fields do not exist in this product, and buying more units under the same application will not produce them.

The methodology document devotes two chapters to the intended uses of this data: resource allocation, risk management, performance evaluation and construction planning for the public sector; marketing, staffing, site selection and property investment for the private sector[^2]. All of those are questions about choosing locations. A representative month describing a typical distribution is adequate for choosing a location and inadequate for reconstructing one particular evening.

### The missing three sit in the other three windows

Age does not have to be bought from a carrier. The free statistical area population indicators from window four reconstruct the sex composition and three age bands for every cell. Of the 10,513 cells with single-digit registered populations computed earlier, the age structure of each is already in public data.

The ministry produced age figures itself as well. Chapter two of the methodology document records preliminary research on Kaohsiung in 2017[^2]:

> This section takes Kaohsiung as an example for an initial examination of telecom signalling data. The research collected mobile telecom signalling point locations for Kaohsiung across seven statistical days spanning Monday to Sunday in September and October 2017 from three carriers, mapped the grid information onto the smallest statistical areas defined by the Ministry, and then, according to collection time, registration information and household registration status, computed and compiled secondary data for the department's research.

"Registration information" is what a subscriber entered when obtaining the number. That step attached subscriber attributes to signalling point locations. The output is Table 2-3 in the same document, a cross-tabulation of Kaohsiung's activity population by district, sex and five age bands, with a citywide average activity population of 1,508,177[^2]. Table 2-3 does not contradict the same document's statement that the product "contains no personal data items": the table is 2017 preliminary research on Kaohsiung, the statement refers to the nationwide product delivered in 2020. The step attaching sex and age to signalling was performed by the carriers. The capability sits at the carrier end.

The document adds a quality note. It appears in the section on resident population, measured between 2am and 3am, which is the other time slot of the same study alongside Table 2-3's activity population[^2]:

> The shares by sex and age group differ noticeably from registered population, possibly reflecting registration habits, for example that most minors' phones are registered under a parent's name, and that elderly people's applications are mostly handled on their behalf by their children.

The same section records a household registration match rate of 36.8% for Kaohsiung's resident population. On activity population the document says only that "the shares by sex and age group are similar to resident population"[^2], so the bias travels across through that sentence. The age field carries a bias of known direction: minors' signals are counted in their parents' band, elderly people's in their children's. Any conclusion about age distribution drawn from data of this kind inherits the same bias.

Time and individual linkage sit in windows two and three. Choosing a date, a time window and a patch of ground is routine in commercial footfall services, and both origin-destination signalling carrying a UID and advertising targeting by "has previously visited a specific venue" are recorded in the same fact-check report[^21]. That report also notes that mobile signalling is not the only route: analysing social media check-ins and on-site cameras can give a rough count and age range of participants on the day itself[^21].

A written report submitted by the Ministry of Digital Affairs to the Legislative Yuan's Transportation Committee on 2024-06-03 addresses the combination question directly, stating that it is technically possible to analyse users' personal data using mobile signals, and that the likelihood of an ordinary member of the public or a company simultaneously obtaining both "the subscriber numbers served by a base station" and "a telecom operator's customer database" in order to analyse the age profile of users in a specific area is extremely low[^21]. "Extremely low" measures the opportunity to obtain. It describes who has a chance of touching both datasets. It does not answer whether joining them is permitted.

### The answer

The inference can be reconstructed from purchasable data. The four conditions are simply distributed across different windows.

| Condition | Source | How to obtain |
|---|---|---|
| Space | Window one, telecom signalling population statistics at smallest statistical area level | Written application to the Ministry of the Interior, 2,000 per unit |
| Attribute | Window four, statistical area population statistics and indicators | Free download, joined on `CODEBASE` |
| Time | Window two, carriers' commercial footfall analysis services | Commercial purchase |
| Individual linkage | Windows two and three, commercial services and ad targeting | Commercial purchase |

The four windows are a paper application, an open data download, a sales conversation with a carrier, and an advertising platform's audience settings. Each checks the dataset it hands over. None asks what the applicant already holds. What determines the level of risk is how many datasets one party can obtain at once, and examining any single field list in isolation cannot produce that judgement.

Combination is addressed in Taiwanese law. What is missing is the step that applies Article 3. GDPR Recital 26 differs in who does the judging and how widely: it requires account to be taken of all means reasonably likely to be used by the controller or any other person, with cost, time and available technology factored in. The ministry's phrasing confines the scope to ordinary members of the public and companies. The text of Article 3 contains no such limitation.

## Verification continues after binding

Showing a document is a one-off act. Verification of identity is continuous. Both items in this section happen after your number is already active.

### Carriers query government databases

Article 19(3) of the Fraud Crime Hazard Prevention Act, passed in 2024, authorises the Regulations Governing Telecommunications Enterprises' Use of Designated Databases to Verify Subscriber Identity, promulgated 2024-11-19[^8]. Article 3 designates three databases for telecommunications enterprises to query: the national ID card issuance and replacement query function of the Ministry of the Interior's household registration system, the joint fraud risk management system database held at the National Police Agency, and the Immigration Agency's cloud query service.

Four trigger points are specified: on accepting an application for telecommunications service, on being notified that a service is suspected of involvement in fraud crime, before providing international roaming service with a high-risk foreign carrier designated by the competent authority, and on providing prepaid service to a non-national. Getting a number triggers a query. The roaming trigger is limited to specifically designated foreign carriers.

The regulations impose seven information security duties on telecommunications enterprises. None of them requires telling the subscriber that a query has taken place.

The National Communications Commission separately approved a high-risk subscriber notice on 2024-10-16: a person whose service has been suspended three times on judicial notification within three years is classified high-risk and may hold at most one subscriber number for three years from listing, with other carriers to apply the same listing once aware[^9]. Carriers have separately announced that from 2025-12-30, applying for a SIM replacement requires presenting the old SIM or other adequate proof of identity, and a lost SIM requires a police report first[^10]. The threshold for high-risk listing is judicial notification of suspension. A conviction is not required. The effect is a cross-carrier shared list and a three-year restriction on applications.

### Institutions query your number's status

MID Plus, operated by TWCA with the three major carriers, went live on 2026-07-01 using the GSMA Open Gateway specification. The first wave of adopting institutions includes First Bank, E.SUN Bank and Taiwan Business Bank[^11].

| API | What it returns |
|---|---|
| SIM Swap | Whether the number has recently changed SIM |
| Device Roaming Status | Whether the number is currently roaming abroad |
| Number Verification | Whether the number entered matches the number the device is currently connected on |
| KYC Match | Whether submitted identity data matches the carrier's records |

The three carriers plan 14 APIs in total, with 4 live[^12]. The earlier MID service, running since 2018, was initiated by the user: enter a national ID number and phone number, choose a carrier, then verify over the mobile connection[^13]. The user knows a check is happening. SIM Swap and Device Roaming Status work differently. They query the status of a number, and the institution can initiate them alone.

The CAMARA specification distinguishes authorisation models clearly. In a two-legged flow there is no user role at all: the system neither authenticates a user nor can capture or validate their consent, so such tokens may only be used for APIs that do not process personal data. APIs touching personal data should use three-legged authorisation, with the user participating through an OIDC or CIBA flow[^14]. Which model the Taiwanese deployment uses is not stated publicly.

??? quote "CAMARA's wording on two-legged tokens"

    > `Two-Legged Access Token`: an access token that involves two parties, the Authorization Server (operated by the Operator or Aggregator), and the client (the ASP's Application); the Two-Legged Access Token does not include a Resource Owner (User). The Authorization Server does not authenticate a User, nor can User Consent be captured or validated for Two-Legged Access Tokens; therefore Two-Legged Access Tokens must only be used for CAMARA APIs that do not process Personal Data.

    Sources reviewed include four media reports, TWCA's product page and MID number authentication page, CAMARA's identity and consent management documentation, and the GSMA Open Gateway API descriptions. This page stops at "could not be determined" and does not infer that operators are circumventing the specification.

## The gap common to all five

A low statutory threshold means current practice does not violate the Personal Data Protection Act. Taiwan's constitutional protection of information privacy is a separate and higher standard.

Interpretation No. 603, issued 2005-09-28, grounds privacy in Article 22 of the Constitution and states the content of informational privacy[^18]:

> …protects the people's right to decide whether to disclose their personal data, and to what extent, at what time, in what manner and to whom it is disclosed, and protects the people's right to know and control the use of their personal data, and to correct errors in the records.

You have the right to decide whether your data is given, how far, when and to whom, and the right to know how it is used. The right to decide and the right to know are two separate protections in the text. Measured against the three kinds of record and two kinds of verification this page has surveyed, the result is as follows.

| Your what | Do you know it is happening | Can you refuse |
|---|---|---|
| Where you are | Signalling is produced continuously with no prompt. The notice is published on a website; Article 10(3) states that statistical results may be supplied to enterprise customers | Signalling is generated whenever the phone is on. De-identified processing and use can be stopped on request, via Article 10(3) point 2 |
| What you connect to | Retention is a statutory duty with no notification design. On retrieval, network traffic records carry a notification rule; communication records do not | Retention cannot be refused. The carrier's de-identified use can be stopped under the same clause |
| What you buy | The notice is published on a website, listing device identifiers, location and on-and-off-site browsing traces among collected categories | Article 11 of the PDPA limits the right to stop to three enumerated situations: disputed accuracy, purpose expired, or unlawful collection. Provisos preserve business necessity |
| Who you are | You know identity is checked when getting a number. Which databases were queried and when is not covered by any notification rule | Not getting a number is the only way not to be checked |
| Your number's status | The consent model is not public; whether the person is notified is unknown | Unknown |

All five capabilities are built and running. The right to decide has a corresponding arrangement in the first three. The last two have none. The degree of certainty varies considerably: the scope of "where you are" can be computed from public data, "what you connect to" has five years of official statistics, and "your number's status" stops at an undisclosed consent model, which is what the last cell above means.

Interpretation No. 603 struck down a specific measure, compulsory nationwide fingerprinting, through a proportionality analysis addressing the legitimacy of the purpose, the necessity of the means, and the availability of less intrusive alternatives. This page conducts no such analysis and claims no constitutional violation. It points to something else: the Constitution writes knowledge and decision into the content of informational privacy, and every corresponding mechanism here has its default set to off. Whether aggregate statistics still count as personal data, and whether the same review framework should apply, also remain academically contested.

The carriers' stop provision deserves a look on its own. It sits at Article 10(3) of a twelve-clause notice, applies to already de-identified statistical processing, defaults to continuing, requires the individual to give notice, and takes effect only from that notice onward. Two carriers carry this passage word for word, marking it as a shared industry drafting.

The question is not whether a mechanism exists. It is where that mechanism sits, what its default is, and how far it reaches. A system that continuously produces individual movement and connection records and sells derived products from them, while writing the exit as a clause you have to go and find, raises a question about whether the default should instead be to ask. That question belongs to public debate, and it lands on the institutional design rather than on the conduct of any individual agency.

### Who set the defaults, and who should change them

The question from the opening can be answered here. The defaults sit in different places with different responsible agencies and different legal bases, so changing them has to be done separately too. The table below turns the gaps this page found into a form that can be filed. Every row rests on a section above.

| Target | Gap | Basis | What to ask for | Sequence |
|---|---|---|---|---|
| Ministry of the Interior, Department of Statistics | No minimum display threshold appears in the fee schedule, methodology document or delineation standards, and nothing indicates whether delivered values are rounded or perturbed | Freedom of Government Information Act, Article 10 | Publish the suppression and merging rules; absent any rule, set a floor following Eurostat and US CDC practice | Do first. One person can file, a statutory fifteen-day response applies, and all three possible answers are useful |
| Ministry of Justice and the Legislative Yuan | The notification duty reaches only network traffic records, leaving 87.2% of 2025 retrieved lines outside it, and no notice is required where traffic records arrive incidentally under a communication records request | CSSA Article 15, Network Traffic Records Regulations Article 11 | Extend the notification duty to communication records and communication user data, and address the incidental-acquisition exception | Widest impact, requires amendment, timeline measured in legislative sessions |
| The three major carriers | De-identified statistics to enterprise customers default on, third-party marketing defaults off, the two point opposite ways | Notice, Article 10(3) | Align the two defaults, and publish the usage count and response time for the stop provision | No amendment needed, it is a contract template issue, suited to public pressure first |
| NCC and Ministry of Digital Affairs | Whether MID Plus uses two-legged or three-legged authorisation is not public | CAMARA's restriction on two-legged tokens | Require disclosure of the authorisation model, and no two-legged tokens for APIs processing personal data | Single question with a yes-or-no answer, suited as a first enquiry |
| Personal Data Protection Commission | Article 17 tests a single dataset; Article 3's combined identification has no corresponding review procedure | PDPA Enforcement Rules, Articles 3 and 17 | Issue criteria for judging combined identification, requiring self-assessment by parties holding multiple datasets | The Commission is not yet formally established, timeline least certain |
| Competent authority undetermined | Taiwan has no data broker registration regime and no single route to request deletion across the market | Comparison with California's Delete Act and DROP | Study a registration regime and a centralised deletion mechanism, starting with an inventory of who operates in the market | Requires identifying a competent authority first, long-run |

The sequence column is ordered by filing cost and response certainty, not by importance. The difference between the first two rows is that one person can file the first, while the second needs a legislative session to move, and the two are not alternatives.

The subject of these asks has to be placed correctly. Current practice does not violate the Personal Data Protection Act. What is permissive is the statutory threshold itself, so the target is whoever writes the rules, not the operators following them. Framing it as corporate lawbreaking invites the reply that the practice satisfies Article 17 of the Enforcement Rules, and that reply is correct.

[What Taiwan's Digital Credential Wallet protects](./taiwan-digital-wallet-privacy.md) concludes that how far the technology goes depends on whether anyone asks. The difference here is that among the civil society statements, academic commentary and media reporting this page reviewed, none raised a corresponding demand about telecom signalling population statistics or network traffic record retention. The review was limited to public Chinese-language material, and discussions this page did not find cannot be ruled out.

## What you can verify and ask

This section covers auditing and accountability. Doing any of it will not change your own exposure. Personal defensive steps are written up separately in [What everyone should be doing](../scenarios/everyday-baseline.md), including the script for asking your carrier to stop, how to turn off the advertising identifier, and which of the four windows each of those actions reaches.

### Recompute it yourself

This is the only item on the page that costs nothing, waits on no agency, and can be confirmed the same day. [How the numbers were calculated](#How-the-numbers-were-calculated) sets out the full path, with dataset identifiers, field names and formulas. Download the two XML files from Taiwan's open data platform, join on `CODEBASE`, and you can work out how many households are in your own cell, its sex composition and its three age bands. Every original figure on this page was produced that way, and anyone repeating it should arrive at the same result. If your cell's population comes out in single digits, the section on how small these units actually are describes where you live.

City, county, township and district level results are free to download from the Ministry of the Interior's Social and Economic Data Service Platform, and the smart footfall statistics application indicator query system offers 12 public sector and 6 private sector application examples[^19]. The shape of the product is visible without paying.

The retrieval statistics are updated annually and can be exported directly from the communications surveillance statistics section of the Ministry of Justice's statistics site[^31]. Each year adds a row to the same tables, so recomputing the ratio yourself is an observation that can be repeated indefinitely.

### Ask the Ministry of the Interior the load-bearing question

This page searched the fee schedule, the methodology document and the delineation standards and found no small-value suppression rule. That can be asked directly under the Freedom of Government Information Act, without paying the 2,000. Article 10 requires a written application stating the applicant's name, date of birth, national ID number, registered or contact address and telephone number, the substance and quantity of the information sought, the purpose, and the date, sent to the agency holding the information, which here is the Ministry of the Interior's Department of Statistics.

There are two questions to ask. First, whether suppression or merging is applied to spatial units with low statistical values when the telecom signalling population statistics are delivered, and on what basis. Second, whether the delivered values are raw counts or have been rounded or otherwise perturbed.

The second matters more than the first. The inference on this page about small cells revealing daily rhythms holds only if the delivered numbers are raw counts. If they have been rounded or had noise added, the inference weakens substantially. The ministry's methodology document contains no mention of rounding, of perturbation, or of small-value suppression anywhere in its text, so which it is cannot be determined from public sources. Only the competent authority can answer. Under Article 12 the agency must respond within fifteen days, extendable once by a further fifteen.

### Ask operators and financial institutions

Registration for electronic tickets and electronic payment cannot be avoided; it is a statutory requirement. The right to stop or delete under Article 11 of the Personal Data Protection Act has conditions attached and is not a general right of withdrawal[^49].

| Situation | Basis | What may be requested |
|---|---|---|
| Accuracy of the data is disputed | Article 11(2) | Cease processing or use |
| The specified collection purpose has ceased or the period has expired | Article 11(3) | Delete, cease processing or use |
| Collection, processing or use violated the Act | Article 11(4) | Delete, cease collection, processing or use |

The provisos to the first two preserve business necessity and written consent. For simply expressing "I do not want to be used for marketing analysis," the current provisions offer no corresponding general right, which differs from the right to object under Article 21 of the GDPR.

Under the Personal Data Protection Act, a data subject has rights of enquiry and access to their own data. To find out how many times your number has been queried and against which databases, a request can be put to your carrier. If you bank or shop with an institution, you can ask whether it uses MID Plus, which authorisation model, and whether the person is notified at the time of the query.

None of the answers to these questions is currently in public sources, so any response is newly public information. Readers who obtain one are welcome to tell us through the channels on the [community services](../community/tools.md) page, and this page will be updated with attribution.

## Limits of this page

This section is for anyone intending to cite this page. It sets out item by item what was verified, what is inference, and what could not be found.

??? warning "Eleven open items and unreachable sources"

    Actual activity population counts were not obtained, and their relationship to registered population was not measured. See the section on what these numbers can and cannot show.

    The most important unverified item in the reasoning is the form of the delivered values. The inference about small cells revealing daily rhythms presupposes raw counts; if the figures are rounded or perturbed, it does not hold. The ministry's methodology document contains no mention of rounding, perturbation or small-value suppression, and this page obtained no copy of any delivered dataset, so this remains an open question rather than an established premise. The application template above includes it.

    An earlier version of the buyers table listed a Hakka Affairs Council tung blossom festival tourism value analysis case, a National Taiwan University Hospital Yunlin Branch Yunlin County signalling big data analysis case, and two National Chiao Tung University travel behaviour analysis cases. Checking each against the complete award records of the relevant subsidiaries of the three carriers produced no match, and web searches found no trace of the case names, so all were withdrawn. Withdrawn in the same round were a Taipei City Government Research, Development and Evaluation Commission commissioned study that twice failed to award, and the year-by-year details and awardee of the integration contract, for the same reason. Readers holding case numbers or award announcement links for any of these are welcome to send them; the page will restore the entries with attribution.

    The two data periods and the combined price of 4,000 come from the paid application list on the Ministry of the Interior's Social and Economic Data Service Platform. That list is loaded dynamically by the front end and requires a request code, so it could not be reproduced by automated means; only the November 2020 version could be confirmed from the static page.

    The National Communications Commission's website sits behind bot protection and could not be retrieved from a local machine, a headless browser, or a host located in Taiwan, so the high-risk subscriber notice and management guidelines are cited from media reporting and the original document numbers could not be checked. The Ministry of Digital Affairs' shared regulations system returns 403 to automated access, so only the names and media summaries of the two pieces of advertising platform secondary legislation could be read, and the provisions were not checked word for word.

    On the operator side, only Chunghwa Telecom's, Taiwan Mobile's and EasyCard Corporation's notices were obtained. Far EasTone's public privacy policy contains no corresponding list of specified purpose codes and no equivalent of those two points at Article 10. Procurement figures come from the tender amounts recorded on an open procurement site and were not checked line by line against the official award announcements; no figure was found for Chunghwa Telecom's corresponding contract that year. What form of data each case actually received could not be checked either.

    Specifications for commercial footfall analysis services come from the fact-check report and operators' public descriptions. No product specification sheet was obtained. The description of the Chunghwa big data and PeopleView partnership comes from 2017 reporting; no public statement on that service's current operational status or deliverables could be found. Vpon's database scale, consent flow and route to electronic invoice data rest only on the company's statements to media, with no independent corroboration.

    The three-band age reconstruction was validated against registered population. It was not compared side by side with actual delivered signalling values, so the relationship between the two remains inference. The MID Plus consent model produced no result. No public record of the outcome of the 2024 investigation could be found; this page covers that event only as far as the publicly known investigative stage, and omits the individual's name from the narrative. The source titles cited record it.

    This page did not put these findings to the Ministry of the Interior, the Ministry of Justice, the National Communications Commission, the Ministry of Digital Affairs, or any operator, and did not obtain a response. All official and corporate positions are quoted from existing public documents.

## How the numbers were calculated

The population distribution figures are reproducible. The statistical area population dataset sits on Taiwan's open data platform, with one XML file per city or county at the smallest statistical area level across 22 units. The field `CODEBASE` is the smallest statistical area code, `P_CNT` the population and `H_CNT` the household count. Merging all 22 and computing quantiles produces the tables on this page. Township and district membership is taken from the prefix of `CODEBASE`, which groups into 368 units, matching the official documents. The outlying island comparison uses the three files for Penghu, Kinmen and Lienchiang. Zero-population and low-population shares are computed separately, with `P_CNT` equal to 0 and between 1 and 9 forming distinct groups; combining them overstates the share of low-population areas. Interval upper bounds are exclusive, so "1 to 99" excludes the group at exactly 100. The median count of smallest statistical areas per township or district is exactly 322.5, shown as 323 in the table.

The three-band age reconstruction uses the same set of `CODEBASE` values from the statistical area population indicators. The denominators of both the child and aged dependency ratios are the population aged 15 to 64. Writing that band as `B` and the total population as `P`, then `B` equals `P` divided by one plus the child dependency ratio plus the aged dependency ratio, with the 0-to-14 and 65-and-over bands obtained by multiplying the two ratios back. Of Hualien County's 4,632 smallest statistical areas, 835 have a denominator or registered population of zero and cannot be solved; the remaining 3,797 reconstruct to within one person of their totals.

The retrieval statistics come from three tables in the communications surveillance section of the Ministry of Justice's statistics site, with `list_id` values `1355` (by applicant category), `1356` (by offence) and `1357` (by category of record). Each year from 2021 through 2025 was exported as ODS using the page's export function and parsed. The annual line total equals the sum of the three application routes, and each year's total was cross-checked against the totals in the category and offence tables, agreeing before rounding. The share passing through a court is the total column of "applications for court issuance and retrospective applications" divided by the sum of the three columns; that column includes both approvals and rejections.

## Further reading

<div class="grid cards" markdown>

- [:material-scale-balance: Taiwan's 2025 data protection overhaul](./taiwan-pdpa-2025.md)
- [:material-wallet-outline: What Taiwan's Digital Credential Wallet protects](./taiwan-digital-wallet-privacy.md)
- [:material-eye-outline: Surveillance capability](../basics/surveillance-capability.md)
- [:material-map-outline: Regional Observatory](./index.md)

</div>

[^1]: [Fee Standards for Telecom Signalling Population Statistics Data of the Ministry of the Interior](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0010123){target="_blank"} - Laws & Regulations Database of the Republic of China (Taiwan), amended 2022-07-27
[^2]: [Construction, Analysis and Application of Telecom Signalling Population Statistics](https://segis.moi.gov.tw/STATCloud/Signal){target="_blank"} - Ministry of the Interior, linked as an attachment on that page. Chinese-language source
[^3]: [Application of the Smallest Statistical Area in Statistics](https://ws.moi.gov.tw/001/Upload/OldFile/site_node_file/6289/%E6%9C%80%E5%B0%8F%E7%B5%B1%E8%A8%88%E5%8D%80%E5%9C%A8%E7%B5%B1%E8%A8%88%E9%A0%98%E5%9F%9F%E4%B9%8B%E6%87%89%E7%94%A8.pdf){target="_blank"} - Department of Statistics, Ministry of the Interior. See also the [statistical area classification system](https://segis.moi.gov.tw/STATCloud/StatClass){target="_blank"}. Chinese-language source
[^4]: [Statistical Area Population Statistics](https://data.gov.tw/dataset/18681){target="_blank"} - Taiwan open data platform, data period `113Y12M` (December 2024). Spatial data at [smallest statistical area map](https://data.gov.tw/dataset/25128){target="_blank"}
[^5]: [Eurostat: Processing of longitudinal mobile network operator data](https://unstats.un.org/wiki/display/UGTTOPPT/3.+Eurostat:+Processing+of+longitudinal+mobile+network+operator+data){target="_blank"} - UN Global Working Group on Big Data, updated 2023-02-09
[^6]: [Privacy guarantees for personal mobility data in humanitarian response](https://www.nature.com/articles/s41598-024-79561-2){target="_blank"} - Scientific Reports, records the suppression threshold of 15 used by the US Centers for Disease Control and Prevention for cancer statistics
[^7]: [Telecom Signalling Population Statistics Data](https://segis.moi.gov.tw/STATCloud/Signal){target="_blank"} - Social and Economic Data Service Platform, Ministry of the Interior, eligibility and application method. Chinese-language source
[^8]: [Regulations Governing Telecommunications Enterprises' Use of Designated Databases to Verify Subscriber Identity](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=K0060165){target="_blank"} - Laws & Regulations Database, promulgated 2024-11-19 under Article 19(3) of the Fraud Crime Hazard Prevention Act
[^9]: [NCC three-strikes rule for telecom services, high-risk subscribers limited to one number in three years](https://www.cna.com.tw/news/afe/202410160270.aspx){target="_blank"} - Central News Agency, 2024-10-16. Chinese-language source
[^10]: [Anti-fraud or inconvenience? Replacing a SIM card now means a trip to the police station first](https://technews.tw/2026/01/02/sim-card-replacement/){target="_blank"} - TechNews, 2026-01-02. Covers SIM replacement only; number changes are outside its scope. Chinese-language source <!-- docs-style-lint: disable-line -->
[^11]: [TWCA launches MID Plus with three major carriers and banks](https://mashdigi.com/say-goodbye-to-static-verification-twca-in-partnership-with-three-major-telecom-operators-and-banks-launches-mid-plus-authentication-service-incorporating-gsma-international-anti-fraud-technol/){target="_blank"} - mashdigi. Chinese-language source
[^12]: [Three carriers open APIs to the financial sector, TWCA builds a mobile identity ecosystem](https://www.cio.com.tw/115972/){target="_blank"} - CIO Taiwan. Chinese-language source
[^13]: [MID mobile number authentication](https://www.twca.com.tw/product/c0cf07bd-25ab-42d8-a1bd-3e6e71950113){target="_blank"} - TWCA. Chinese-language source
[^14]: [CAMARA API access and user consent](https://github.com/camaraproject/IdentityAndConsentManagement/blob/main/documentation/CAMARA-API-access-and-user-consent.md){target="_blank"} - CAMARA Project
[^15]: [Enforcement Rules of the Personal Data Protection Act](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0050022){target="_blank"} - Laws & Regulations Database, Articles 3 and 17
[^16]: [Recital 26, General Data Protection Regulation](https://gdpr-info.eu/recitals/no-26/){target="_blank"} - EU
[^17]: [National standards for anonymisation and de-identification](https://www.ithome.com.tw/news/98997){target="_blank"} - iThome, 2015-10-03. Records CNS 29100 published 2014-06-04 and CNS 29191 published on "6 June 10" of the year of publication, that is 2015-06-10, and states that national standards are not mandatory. CNS 29100-2 was published 2019-09-24 and falls outside that report, see [certification service for personal information de-identification process management systems](https://www.taftw.org.tw/report/2022/44/CNS-29100-2/){target="_blank"} - Taiwan Accreditation Foundation. Chinese-language sources
[^18]: [Interpretation No. 603](https://cons.judicial.gov.tw/jcc/zh-tw/jep03/show?expno=603){target="_blank"} - Judicial Yuan, 2005-09-28
[^19]: [Smart footfall statistics application indicator query system](https://semap.moi.gov.tw/STATSIGNAL/){target="_blank"} - Ministry of the Interior. Chinese-language source
[^20]: [165 anti-fraud hotline, domains suspended from resolution](https://data.gov.tw/){target="_blank"} - Criminal Investigation Bureau, National Police Agency. The dataset description records suspension of resolution under Article 42 of the Fraud Crime Hazard Prevention Act
[^21]: [Fact check: claims about analysing the age of crowds outside the Legislative Yuan using mobile signals](https://tfc-taiwan.org.tw/fact-check-reports/migration-10677/){target="_blank"} - Taiwan FactCheck Center, 2024-06-04. Chinese-language source
[^22]: [Prosecutors summon Wang Yi-chuan over mobile signal crowd analysis](https://www.cna.com.tw/news/aipl/202406110263.aspx){target="_blank"} - Central News Agency, 2024-06-11. Source title recorded as published; the narrative on this page omits the name. Chinese-language source
[^23]: [Statistical Area Population Indicators](https://data.gov.tw/dataset/18624){target="_blank"} - Taiwan open data platform, Department of Statistics, Ministry of the Interior, data period `113Y12M`. Smallest statistical area fields include child dependency ratio `A0A14_A15A65_RAT` and aged dependency ratio `A65UP_A15A64_RAT`
[^24]: [Chunghwa Telecom personal data collection notice](https://pdpn.cht.com.tw/){target="_blank"} - Chunghwa Telecom, mobile broadband service version, page marked as the 2026-07-30 edition. Chinese-language source
[^25]: [Personal data notice](https://www.taiwanmobile.com/footer/Personal-Information-Notices.html){target="_blank"} - Taiwan Mobile. Chinese-language source
[^26]: [Chunghwa Telecom statement on recent mobile signal location and telecom big data analysis service matters](https://www.cht.com.tw/zh-tw/home/cht/messages/2024/0530-1520){target="_blank"} - Chunghwa Telecom, 2024-05-30. Chinese-language source
[^27]: [Government e-Procurement System](https://web.pcc.gov.tw/){target="_blank"} - Public Construction Commission. The two cases listed here were checked case by case against vendor award history pages on the mirror [Open Government Tenders](https://pcc.mlwmlw.org/){target="_blank"}, which show both under Chunghwa Telecom Enterprise Business Group. Keyword search on the official site requires a maintained session and could not be reproduced here
[^28]: [Taiwan: Freedom on the Net 2025 Country Report](https://freedomhouse.org/country/taiwan/freedom-net/2025){target="_blank"} - Freedom House, coverage period 2024-06-01 to 2025-05-31, total score 79, subscores A 24/25, B 29/35, C 26/40
[^29]: [Communications Security and Surveillance Act](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=K0060044){target="_blank"} - Laws & Regulations Database, amended and promulgated 2024-07-31. Articles 3-1, 11-1, 14-1 and 15
[^30]: [Regulations Governing the Management of Network Traffic Records](https://mojlaw.moj.gov.tw/LawContent.aspx?LSID=FL104438){target="_blank"} - Ministry of Justice regulations system, promulgated 2024-12-27 under Article 14-1(6) of the Communications Security and Surveillance Act. Chinese-language source
[^31]: [Communications surveillance statistics](https://www.rjsd.moj.gov.tw/rjsdweb/common/WebList3_Report.aspx?list_id=1355){target="_blank"} - Department of Statistics, Ministry of Justice. Three tables on retrieval warrant applications, 2021 through 2025. Chinese-language source
[^32]: [Regulations Governing Identity Confirmation Mechanisms and Transaction Limits for Electronic Payment Institutions](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0380240){target="_blank"} - Laws & Regulations Database, Articles 4 and 5
[^33]: [EasyCard Corporation notice on collection, processing and use of personal data](https://www.easycard.com.tw/personalized){target="_blank"} - EasyCard Corporation, page marked revision 3, 2025-06-30. Chinese-language source
[^34]: [EasyCard partners with Vpon to build a cashless ecosystem with AI and big data](https://www.easycard.com.tw/new?cls=1&id=1705042262){target="_blank"} - EasyCard Corporation press release, 2024-01-12. Chinese-language source
[^35]: [Mobile advertising big data analytics firm Vpon on content matching, new algorithms and a group identifier](https://www.ithome.com.tw/news/146657){target="_blank"} - iThome, 2021-09-14. Chinese-language source
[^36]: [Connecting Asian markets with data: Vpon opens a cross-border growth route for brands](https://www.bnext.com.tw/article/84925/vpon_202510){target="_blank"} - Business Next, 2025-10-29. The page is marked `sponsored by VPON`, its metadata carries `is_ads` set to `1` and the editor byline is VPON. Operator-funded content. Chinese-language source
[^37]: [Chunghwa Telecom and eLAND launch a big data application](https://www.moneydj.com/kmdj/news/newsviewer.aspx?a=64cd4b04-eb62-4611-b735-0b940832e77b){target="_blank"} - MoneyDJ, 2017-07-05. Chinese-language source
[^38]: [FTC Order Prohibits Data Broker X-Mode Social and Outlogic from Selling Sensitive Location Data](https://www.ftc.gov/news-events/news/press-releases/2024/01/ftc-order-prohibits-data-broker-x-mode-social-outlogic-selling-sensitive-location-data){target="_blank"} - Federal Trade Commission, 2024-01-09
[^39]: [FTC Order Will Ban InMarket from Selling Precise Consumer Location Data](https://www.ftc.gov/news-events/news/press-releases/2024/01/ftc-order-will-ban-inmarket-selling-precise-consumer-location-data){target="_blank"} - Federal Trade Commission, 2024-01-18
[^40]: [Massive breach at location data seller](https://www.malwarebytes.com/blog/news/2025/01/massive-breach-at-location-data-seller){target="_blank"} - Malwarebytes, 2025-01-09, Gravy Analytics breach. The report records attackers claiming 17TB of data covering 3,455 apps
[^41]: [Data Broker Registry](https://cppa.ca.gov/data_broker_registry/){target="_blank"} - California Privacy Protection Agency. Under the Delete Act (SB 362), the DROP deletion request platform opens to consumers from 2026-01-01 and brokers must process requests from 2026-08-01
[^42]: [New prepaid card application](https://www.cht.com.tw/home/campaign/prepaidcard/applynew){target="_blank"} - Chunghwa Telecom online store. The application method states in-person presentation of two original designated identity documents. Chinese-language source
[^43]: [Advertising real-name rules take effect in 2025: how advertiser identity is verified](https://news.pts.org.tw/article/724139){target="_blank"} - Public Television Service News. Chinese-language source
[^44]: [Online advertising real-name rules set under the anti-fraud act](https://moda.gov.tw/ADI/news/latest-news/12816){target="_blank"} - Administration for Digital Industries, Ministry of Digital Affairs, 2024-05-19, source of the four-part summary. Four pieces of secondary legislation were promulgated 2024-11-28 and took effect 2024-11-30, per [this announcement](https://www.cip.gov.tw/zh-tw/news/data-list/6EBE68EA8288674E/BEA370C578BB137DF3827C43BE19244F-info.html){target="_blank"}: an amendment to subsidy and guidance regulations, the identity verification technology and transparency report format rules, the advertising information disclosure rules, and the notification deadline under Article 32(1)(1). The second and third bear directly on advertiser identity verification; the first concerns subsidies and is not authorised by Articles 30 to 33. Chinese-language sources
[^45]: [2025 Taiwan Mobile telecom signalling data processing outsourcing case](https://pcc.mlwmlw.org/tender/%E5%85%A7%E6%94%BF%E9%83%A8/114YH080603){target="_blank"} - Open Government Tenders, sourced from the Government e-Procurement System. The Far EasTone case of the same name carries reference `114YH080604`
[^46]: [How to Disable Ad ID Tracking on iOS and Android, and Why You Should Do It Now](https://www.eff.org/deeplinks/2022/05/how-disable-ad-id-tracking-ios-and-android-and-why-you-should-do-it-now){target="_blank"} - Electronic Frontier Foundation
[^47]: [RPZ malicious domain blocking service: 2025 transparency report](https://twnic.tw/blog/contents.php?id=103&lang=zh-tw&blog_lang=zh-tw){target="_blank"} - Taiwan Network Information Center. Chinese-language source
[^48]: [Identity document verification rules](https://www.cht.com.tw/home/campaign/document){target="_blank"} - Chunghwa Telecom online store. No citable official record of the year two-document checks began could be found. Chinese-language source
[^49]: [Personal Data Protection Act](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0050021){target="_blank"} - Laws & Regulations Database, Article 11
