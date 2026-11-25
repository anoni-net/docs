---
title: Social media privacy settings
description: Coworkers, exes, family, and strangers use the same platforms you do. This page covers the LINE, Facebook, Instagram, and Threads settings that decide who can find you and what they can see, plus running a Facebook group and keeping accounts from being linked.
icon: material/account-eye-outline
---

# :material-account-eye-outline: Social media privacy settings

On a social platform you may need protection from the platform itself, from other users, or both[^ssd-sn]. What platforms collect is covered in [how social platforms collect your data](../basics/platform-tracking.md). This page covers other users, on the platforms most used in Taiwan. Defaults lean public, so check three things: who sees your posts, whether people can find you by phone number or email, and whether your location is shared automatically[^ssd-sn].

It adapts two EFF Surveillance Self-Defense guides (see [Sources and review](#Sources-and-review)). Menu names come from each platform's help center and may differ in your app.

!!! tip "Short on time? Start here"

    - LINE: turn off adding you by ID and by phone number, and turn off auto-add friends so people in your contacts do not see you
    - Facebook: set future posts to Friends and stop people finding you by phone number or email
    - Instagram and Threads: make your account private and limit who can tag or mention you
    - Use a different profile photo and phone number for accounts you want to keep separate

## Creating an account

Phone numbers, email addresses, and photos are what link accounts together. Give only what is needed, use a separate email ([email aliases](./email-alias.md) work), and avoid giving a phone number where you can. Profile photos can reveal places through their metadata, backgrounds, street signs, and even reflections. Answers to password recovery questions can often be found in your posts, so use false answers stored in your password manager[^ssd-sn]. For keeping identities apart, see [maintaining multiple online identities](../basics/multiple-identities.md).

## LINE

- **Adding you by ID**: Home > Settings > Profile, turn off the option that lets others add you by your LINE ID[^line-add]
- **Adding you by phone number**: Home > Settings > Friends, turn off the option that lets others add you. If your own auto-add friends option stays on, people who have your number and also use auto-add may still see you in their list of people you may know, so turn both off[^line-add][^line-pymk]
- **Messages from non-friends**: Home > Settings > Privacy, turn on message filtering, which blocks messages from people in your "people you may know" list. The help center lists no setting to refuse all group invitations, and a group cannot be blocked, only left[^line-block][^line-group]
- **Birthday**: Home > Settings > Profile > Birthday, turn off showing it[^line-profile]
- **Hide and block**: neither notifies the other person, and you do not disappear from their friend list. The help center lists no option to turn off read receipts[^line-hide][^line-read]
- **OpenChat**: you can join without showing your LINE name and use a different profile in each community[^line-openchat]
- **Devices**: Home > Settings > Account shows devices logged in to your account. Log out the ones you do not recognize[^line-devices]

LINE VOOM ended in Taiwan on 2026-09-30, so advice about VOOM audience settings no longer applies[^line-voom].

## Facebook

Paths follow Facebook's desktop help pages. We did not check each path in the mobile app.

- **Post audience**: Settings > Audience and visibility > Posts, set future posts to Friends, and use "Limit past posts" to switch older public posts to Friends in one step[^fb-past]
- **Finding you**: under "How people find and contact you", set lookups by email and by phone number to the narrowest option ("no one"), and turn off search engine links to your profile[^fb-lookup]
- **Friends list and profile details**: the friends list is public by default, and each profile field has its own audience[^fb-friends]
- **Tags**: turn on tag review and profile review so tagged posts need your approval[^fb-tagreview]
- **Active status**: turn it off separately in Facebook and Messenger[^fb-active]

### Facebook groups

Groups were not designed for secure collaboration, and Facebook can see everything in them[^ssd-fbg]. In a private group, only members see posts and the member list, but admins and moderators are visible to everyone unless the group is hidden from search. A public group with over 10,000 members that is older than 30 days cannot be made private[^fb-groups]. Posting under a nickname hides your name from members but not from admins, moderators, or Facebook[^fb-anon]. SSD also advises setting rules against screenshots, having more than one admin, and keeping a separate member list in case the group is deleted[^ssd-fbg].

## Instagram and Threads

We could not confirm the Traditional Chinese menu names, so this follows archived copies of the English help center. Make your Instagram account private, share stories with Close Friends, control read receipts per chat, and check who can tag or mention you. Instagram's map feature is off by default, and the help page does not say whether it is available in Taiwan[^ig-private][^ig-map]. On Threads, your name, photo, username, and bio are always public, even with a private profile. Fediverse sharing lets users on other servers follow and reshare your posts, and turning it off does not guarantee they delete your data[^threads-private][^threads-fedi].

## Privacy is a team sport

Even without an account, friends can identify you in photos, reveal where you are, and make your connection public. Agree with them on what not to post[^ssd-sn]. Settings change as platforms update, so check again when a platform announces a privacy change.

## Sources and review

Adapted from two guides in EFF's [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"}, both licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/){target="_blank"}: [Protecting Yourself on Social Networks](https://ssd.eff.org/module/protecting-yourself-social-networks){target="_blank"} and [Facebook Groups: Reducing Risks](https://ssd.eff.org/module/facebook-groups-reducing-risks){target="_blank"} (both last reviewed 2023-10-13). We replaced the general advice with platform-by-platform settings from the LINE (Taiwan), Facebook (desktop), and Instagram (archived English pages) help centers, and updated Facebook group rules to the 2026 help center. English menu names for LINE and Facebook are our translations of the Traditional Chinese interface. anoni.net is responsible for any differences from the original, and this page does not represent EFF's views.

## Where to go from here

- [How social platforms collect your data](../basics/platform-tracking.md): what the platform itself takes
- [Maintaining multiple online identities](../basics/multiple-identities.md): layering accounts and how they get linked
- [Phone privacy settings, step by step](./phone-privacy-settings.md): location, contacts, and photo permissions

[^ssd-sn]: [Protecting Yourself on Social Networks](https://ssd.eff.org/module/protecting-yourself-social-networks){target="_blank"} - EFF Surveillance Self-Defense, last reviewed 2023-10-13.
[^ssd-fbg]: [Facebook Groups: Reducing Risks](https://ssd.eff.org/module/facebook-groups-reducing-risks){target="_blank"} - EFF Surveillance Self-Defense, last reviewed 2023-10-13.
[^line-add]: [拒絕被加入好友](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20000383){target="_blank"} - LINE Help Center (Chinese).
[^line-pymk]: [顯示在「您可能認識的人？」名單的條件](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20000382){target="_blank"} - LINE Help Center (Chinese).
[^line-block]: [如何避免被不認識的人邀請加入聊天室或群組？](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20027010){target="_blank"} - LINE Help Center (Chinese).
[^line-group]: [退出／刪除／封鎖群組的操作方法](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20000420){target="_blank"} - LINE Help Center (Chinese). <!-- docs-style-lint: disable-line -->
[^line-profile]: [個人檔案的基本說明](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20000134){target="_blank"} - LINE Help Center (Chinese).
[^line-hide]: [隱藏好友、封鎖好友與刪除好友的基本說明](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20000390){target="_blank"} - LINE Help Center (Chinese).
[^line-read]: [聊天訊息傳送狀況及已讀／未讀的確認方法](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20021705){target="_blank"} - LINE Help Center (Chinese). <!-- docs-style-lint: disable-line -->
[^line-openchat]: [社群的基本設計說明（社群成員用）](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20005375){target="_blank"} - LINE Help Center (Chinese).
[^line-devices]: [如何確認自己在哪些裝置上登入LINE或LINE相關服務？](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=20008468){target="_blank"} - LINE Help Center (Chinese).
[^line-voom]: [【結束服務】LINE VOOM結束服務公告](https://help.line.me/line/smartphone?country=TW&lang=zh-Hant&contentId=200000301){target="_blank"} - LINE Help Center (Chinese), updated 2026-11-02.
[^fb-past]: [選擇可以看到您先前 Facebook 貼文的對象](https://www.facebook.com/help/236898969688346?locale=zh_TW){target="_blank"} - Facebook Help Center (Chinese).
[^fb-lookup]: [控制 Facebook 能根據您的電子郵件地址或手機號碼向誰建議您的個人檔案](https://www.facebook.com/help/131297846947406?locale=zh_TW){target="_blank"} - Facebook Help Center (Chinese).
[^fb-friends]: [調整誰能在 Facebook 看到您的「朋友」區塊](https://www.facebook.com/help/115450405225661?locale=zh_TW){target="_blank"} - Facebook Help Center (Chinese).
[^fb-tagreview]: [檢閱用戶在您 Facebook 貼文新增的標籤](https://www.facebook.com/help/247746261926036?locale=zh_TW){target="_blank"} - Facebook Help Center (Chinese).
[^fb-active]: [Facebook 和 Messenger 上線狀態的運作方式](https://www.facebook.com/help/448141485230424?locale=zh_TW){target="_blank"} - Facebook Help Center (Chinese).
[^fb-groups]: [公開與私密 Facebook 社團的差異](https://www.facebook.com/help/220336891328465?locale=zh_TW){target="_blank"} - Facebook Help Center (Chinese).
[^fb-anon]: [在 Facebook 社團中使用暱稱參與互動](https://www.facebook.com/help/1997112804420300?locale=zh_TW){target="_blank"} - Facebook Help Center (Chinese).
[^ig-private]: [Instagram Help Center: Private account](https://help.instagram.com/448523408565555){target="_blank"} - read from a 2026 web archive copy of the English page.
[^ig-map]: [Instagram Help Center: Map](https://help.instagram.com/402343555458995){target="_blank"} - read from a 2026 web archive copy of the English page.
[^threads-private]: [Threads Help Center: Public and private profiles](https://help.instagram.com/756440792648838){target="_blank"} - read from a 2026 web archive copy of the English page.
[^threads-fedi]: [Threads Help Center: Fediverse sharing](https://help.instagram.com/760878905943039){target="_blank"} - read from a 2026 web archive copy of the English page.
