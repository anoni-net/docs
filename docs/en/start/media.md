---
title: Newsrooms
description: A starting path for news organizations. Build a public intake channel first, then material retention and disclosure requests, verification that does not burn the source, and the regional angle that changes the advice.
icon: material/newspaper-variant-outline
---

# :material-newspaper-variant-outline: Newsrooms start here

For organizations with an editorial desk, legal counsel, and IT. What an organization can do differs from what an individual can: intake channels, material retention, and post-publication cleanup all need cross-team agreement, and no single reporter changing tools will solve them.

For the individual layer, see the [independent journalist path](./independent-journalist.md). Every link below points at a page that already exists here.

## Three things you are probably dealing with

### The site lists a contact address that no source will use

Ordinary mail leaves a record at both ends, and the sender has no way to assess the risk. People with internal documents generally understand this, which is why they do not write.

See [first contact](../scenarios/journalist.md#First-contact) for what a channel has to offer before it is worth publishing.

### Material scattered across reporters' personal devices and assorted cloud accounts

Interview audio, photographed documents, message history, spread across personal phones, private cloud storage, and company mail. When a disclosure request arrives, the desk usually cannot say what still exists or who holds it.

See [post-publication cleanup](../scenarios/journalist.md#Post-publication-cleanup), which covers the organizational layer.

### A leaked document arrives and has to be verified without exposing the source

Verification itself leaves traces. How you phrase a question to a third party, and which details reach print, can narrow the field to a handful of people.

See [keeping multiple sources apart](../scenarios/journalist.md#Keeping-multiple-sources-apart).

## Three pages for your first twenty minutes

1. [The metadata problem comes first](../scenarios/journalist.md#The-metadata-problem-comes-first): the layer that content encryption does not reach, and the reason the rest of the workflow exists
2. [Threat model checklist](../utils/threat-model.md): three questions producing a summary suitable for an editorial meeting. What you type stays in the browser tab and is never stored
3. [Post-publication cleanup](../scenarios/journalist.md#Post-publication-cleanup): what the organization retains, and for how long, determines what it has to hand over

## Building the process over a week

### Setting up intake

- [OnionShare](../tools/onionshare.md): a source can send files without registering an account
- [Sending us sensitive material](../community/upload-sensitive.md): how the receiving end should be set up, including PGP
- [Secure messaging compared](../tools/messaging-comparison.md): what follow-up contact runs on

### Retention and cleanup

- [Metadata, and why it matters](../basics/metadata.md): what a file carries beyond its contents
- [File metadata stripper](../utils/strip-metadata.md): clean files in the browser before publishing, nothing is uploaded
- [Exchanging files](../scenarios/journalist.md#Exchanging-files): where material lives and who holds the keys

### Verification and publication

- [Invisible character detector](../utils/invisible.md): includes a section on verifying without burning the source, since invisible markers in a document are a common way to identify who leaked it
- [Keeping multiple sources apart](../scenarios/journalist.md#Keeping-multiple-sources-apart): which details narrow the field once published
- [Interview records](../scenarios/journalist.md#Interview-records): how notes are kept and what to leave out

### The regional angle

- [The regional angle that changes the advice](../scenarios/journalist.md#The-regional-angle-that-changes-the-advice): how the workflow shifts across the region
- [Taiwan's whistleblower protection act](../regional/taiwan-whistleblower-law.md): how far the law protects an employee who speaks, as a Taiwan-specific worked example
- [Posting on mainland Chinese platforms](../scenarios/mainland-speech.md): relevant when a source or collaborator is inside Mainland China

## What to take with you

- Press "copy summary" after the threat model checklist and paste it into the desk's shared notes
- The [invisible character detector](../utils/invisible.md) and [file metadata stripper](../utils/strip-metadata.md) both run in the browser and upload nothing, so they can be recommended to the whole desk as-is
- Ask in the [public Matrix room](../community/tools.md), or send sensitive files to [whisper@anoni.net](mailto:whisper@anoni.net)

## What this path does not cover

- **Compartmentalizing a reporter's own devices and accounts**: see the [independent journalist path](./independent-journalist.md)
- **Reporting trips and conferences abroad**: see [device minimization and border crossings in Asia](../scenarios/asia-travel.md)
- **An incident already in progress**: start at [emergency help](../help/index.md)
