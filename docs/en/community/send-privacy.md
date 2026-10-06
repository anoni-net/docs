---
title: How send.anoni.net Handles Your Data
description: What the community-run encrypted file transfer service send.anoni.net stores, for how long, and who can see it. Files are encrypted in your browser, and the server keeps no routine access logs.
icon: material/file-lock-outline
---

# :material-file-lock-outline: How send.anoni.net Handles Your Data

[send.anoni.net](https://send.anoni.net/){target="_blank"} is the encrypted file transfer service the anoni.net community runs, built on [Send](https://github.com/anoni-net/send){target="_blank"}. This page lists what passes through or stays on the server while it runs, how long it is kept, and who can see it, so you can decide whether it suits the files you want to send. What the software does can be checked against its public source code; the server and Cloudflare settings are how we operate it.

## What the server cannot see

Files are encrypted in your browser before they are uploaded, so the server only ever receives encrypted data. The key that decrypts them sits in the part of the share link after the `#`, and browsers never send that part to any server. The operators therefore cannot see a file's contents, name or type, and have no way to decrypt it.

## What the server stores

Once an upload finishes, the server keeps two things:

- The encrypted file
- A record holding the expiry time, the download limit and how many downloads have happened, a token the uploader uses to delete the file or change its settings, the encrypted file details (name, size and type are all inside the encryption), the data used to check that a downloader holds the key, and whether a password is set

The uploader picks the expiry: 5 minutes, 1 hour, 1 day or 7 days, with 1 day as the default. The download limit can be 1 to 5, 20, 50 or 100, with 1 as the default.

When the download limit is reached or the uploader deletes the file early, the file and its record are removed at once. Expiry works slightly differently: the record disappears the moment it expires, and the encrypted file is removed by a periodic cleanup that runs up to about half an hour later.

The server can tell the size of the encrypted file, which is only slightly larger than the original, and when uploads and downloads happen. Anyone who knows a file's ID can ask the server whether that file still exists and whether it has a password.

The password is a gate on the server, not an extra layer of encryption. Someone who has the share link must also enter the right password before the server hands over the encrypted file.

## Access logs

send.anoni.net keeps no routine access logs. Since 6 October 2026, the nginx server in front of it no longer writes access logs for this service, and the logs collected before then have been deleted. Send itself does not log connections either. Its error messages contain no IP addresses, at most the ID and size of the file involved.

There are two exceptions:

- When a connection fails, for example during the few seconds the service restarts, nginx's error log records that connection's IP address and URL. Error logs are only written when something goes wrong, never for ordinary uploads and downloads.
- To stop any single source from overwhelming the service, the software counts requests per IP address in memory. Addresses and counts are never written to disk and are cleared whenever the service restarts.

## Cloudflare

send.anoni.net sits behind Cloudflare, and every connection passes through it. Cloudflare can see your IP address, when you connect and the URL, which includes the file ID but not the key after the `#`. How Cloudflare handles that data is governed by its own [privacy policy](https://www.cloudflare.com/privacypolicy/){target="_blank"}.

We have turned off Cloudflare's network error reporting (NEL), so your browser does not report connection errors to Cloudflare. Pages from Send are also marked `no-transform`, and in our testing Cloudflare does not insert any script into them, so the only code your browser runs is Send's own.

## What your browser stores

After an upload, your browser records the files you sent in localStorage (space the browser sets aside for a website's data): the file name, the share link and key, the management token and the expiry time. That lets you come back later to check the download count or delete a file early.

You can only manage a file from the browser you uploaded it with, and once you clear its browsing data you can no longer delete the file early or change its settings. On a shared or public computer, clear the browsing data when you are done, or use a private window from the start.

Send uses no cookies and no analytics or tracking tools.

## Requests for data

If we are asked to hand over data, all we can provide is what is listed above and has not yet been deleted: the encrypted file, its record, and any connections that happened to land in nginx's error log. We do not have the file contents or the keys.

## Staying more private

If who sends files to whom is itself sensitive, connect with Tor Browser (see [What Is Tor?](../tools/what-is-tor.md) for how to install and use it), and Cloudflare and we will only see a Tor exit relay's IP address. The share link is the key to the file, so send it to the recipient over an encrypted messenger such as Signal. For the step-by-step process, see [Sending Us Sensitive Material](./upload-sensitive.md).

## Contact and abuse reports

Send security issues and reports of abuse, such as someone using the service to spread harmful content, to [whisper@anoni.net](mailto:whisper@anoni.net). If you need encryption, use the PGP public key on our [contact page](../contact.md). When reporting a file, include only the part of the share link before the `#`. We delete by file ID and do not need the key.

More about the service is on [Community Services](./tools.md).
