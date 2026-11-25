---
title: Device encryption and data erasure
description: Full-disk encryption keeps a lost, stolen, or seized computer or phone unreadable, and it is the only reliable way to delete data from a solid-state drive. This page covers where to keep the recovery key, how to turn on encryption on each platform, and what to do before discarding files or giving a device away.
icon: material/harddisk
---

# :material-harddisk: Device encryption and data erasure

Whether someone who gets hold of your laptop or phone, whether a thief, roommate, coworker, family member, or police officer, can read what is on it depends on full-disk encryption. With it on, the whole drive stays encrypted until you log in, and pulling the drive out and putting it in another computer does not help[^ssd-enc].

Encryption also matters for deletion. Emptying the trash leaves files on the disk, and on the solid-state drives (SSDs) in modern computers and phones, overwriting a single file reliably is close to impossible. For an SSD, encrypting first and then resetting the device is the practical way to delete[^ssd-del].

This page combines and adapts two EFF Surveillance Self-Defense guides, [How to: Encrypt Your Windows, Mac, or Linux Computer](https://ssd.eff.org/module/how-encrypt-your-windows-device){target="_blank"} and [How to: Delete Your Computer's Data Securely](https://ssd.eff.org/module/how-delete-your-data-securely-windows){target="_blank"}, adds phones, and updates the steps against vendor documentation. Changes are listed under [Sources and review](#Sources-and-review).

!!! tip "Short on time? Start here"

    - A phone with a passcode (iPhone) or screen lock (Android) is already encrypted, so make the passcode long
    - On a computer, check that Windows Device encryption or BitLocker, or FileVault on a Mac, is on
    - A recovery key stored in your Microsoft or Apple account is harder to lose, but the company then holds a key to your data
    - Before selling or giving away a device, make sure it is encrypted, then use the system's reset

## What full-disk encryption protects against

It protects a device that is off or locked. Once you are logged in, the data is decrypted, so encryption does not help if the device is taken while unlocked or you are made to unlock it[^ssd-enc]. Being asked to unlock at a border is covered in [device minimization and border crossings in Asia](../scenarios/asia-travel.md).

## Where to keep the recovery key

Turning on encryption creates a recovery key for when you forget your password. Lose both and the data is likely gone for good[^ssd-enc].

- **In your Microsoft or Apple account**: you can unlock with your account and the company can help you regain access. The trade-off is that the company holds a key it could be legally required to hand to law enforcement, though it still protects you against thieves and others[^ssd-enc]
- **Kept yourself**: the company has no copy, and if you lose it there is no recovery. Anyone who finds it can unlock your computer. Keep a printout in a fireproof safe or with a trusted person elsewhere, or a digital copy in a password manager whose login differs from your computer's, never on the same computer or your usual cloud storage[^ssd-enc]

## Turning it on

=== "Windows"

    Windows calls it Device encryption or BitLocker drive encryption. Device encryption works on Windows Home if the hardware supports it, and turns on automatically when you first sign in with a Microsoft account or a work or school account, with the recovery key attached to that account. It does not turn on automatically with a local account[^ms-enc]. Check under Settings > Privacy & security > Device encryption, signed in as an administrator. If it does not appear, the hardware may not support it[^ms-enc].

    BitLocker, in Pro, Enterprise, and Education, lets you save the recovery key to your Microsoft account, a file, or a printout[^ssd-enc]. Keys saved to your account are listed at [account.microsoft.com/devices/recoverykey](https://account.microsoft.com/devices/recoverykey){target="_blank"}[^ms-key]. If you have Windows Home on hardware without Device encryption, EFF suggests VeraCrypt instead[^ssd-enc].

=== "Mac"

    Macs with Apple silicon or a T2 chip encrypt data automatically. Turning on FileVault adds the requirement of your login password, and on other Macs it is what encrypts the data[^apple-fv]. Go to Apple menu > System Settings > Privacy & Security > FileVault, turn it on, then choose "Allow my iCloud account to unlock my disk" or "Create a recovery key and do not use my iCloud account". If you choose the recovery key, write it down and keep it away from the Mac[^apple-fv].

=== "Linux"

    Most distributions, including Ubuntu, Fedora, and Arch Linux, can only set up full-disk encryption (usually LUKS) during installation. If you skipped it, you will generally need to back up, wipe the drive, and reinstall. In the Ubuntu installer, choose LVM with encryption, set an encryption password, and optionally create a recovery key. You will then enter that password at every boot, separate from your login password[^ssd-enc].

=== "iPhone"

    Setting a passcode turns on Data Protection, which encrypts the iPhone with 256-bit AES[^apple-passcode]. Under Settings > Face ID & Passcode (or Touch ID & Passcode), Passcode Options lets you switch to a longer alphanumeric code.

=== "Android"

    New devices launching with Android 10 or later use file-based encryption[^aosp-enc]. Its protection depends on the screen lock: without a PIN, pattern, or password, anyone holding the phone can read it. See [phone privacy settings](./phone-privacy-settings.md).

## Why deleted files are not gone

Emptying the trash only hides a file and marks its space as reusable, which may not happen for months. Until then, recovery software or forensic tools can bring it back. A spinning hard drive can be overwritten, but SSDs, USB drives, and SD cards use wear leveling: the drive writes changes to new blocks and leaves old ones marked invalid, so overwriting a file does not guarantee the original block is erased. Most computers bought after about 2015 have an SSD. On these drives, encryption is more reliable than deletion[^ssd-del].

## Before selling, giving away, or discarding

- **Computer with an SSD**: make sure it is encrypted, then reset it[^ssd-del]
    - Windows: Reset this PC, choose Remove everything, and turn on Clean data. Microsoft notes this does not meet government or industry data-sanitization standards[^ms-reset]
    - Mac: System Settings > General > Transfer or Reset > Erase All Content and Settings[^apple-mac-erase]
- **Computer with a spinning hard drive**: overwrite the whole drive first. If it was always encrypted, destroying the key is much faster[^ssd-del]
- **iPhone**: sign out of your Apple Account, then Settings > General > Transfer or Reset iPhone > Erase All Content and Settings[^apple-iphone-sell]
- **Android**: note the Google Account and password on the phone, then factory reset. Menu locations vary by brand[^google-reset]
- **CDs and DVDs**: shred them, or break them into small pieces[^ssd-del]

On a spinning hard drive, the open-source [BleachBit](https://www.bleachbit.org/){target="_blank"} can securely delete individual files on Windows and Linux, clear traces left by specific programs (preview before deleting), and wipe free space. It gives no guarantee on SSDs, and macOS dropped secure deletion long ago, so rely on FileVault there[^ssd-del].

None of this removes copies elsewhere: backups, other drives, email servers, the cloud, or copies sent to others. File names can also linger in recent-documents lists and shell histories. The only way to be certain is to overwrite the whole disk and reinstall the operating system[^ssd-del].

## Sources and review

Adapted from two guides in EFF's [Surveillance Self-Defense](https://ssd.eff.org/){target="_blank"}, both licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/){target="_blank"}: [How to: Encrypt Your Windows, Mac, or Linux Computer](https://ssd.eff.org/module/how-encrypt-your-windows-device){target="_blank"} (last reviewed 2025-02-06) and [How to: Delete Your Computer's Data Securely](https://ssd.eff.org/module/how-delete-your-data-securely-windows){target="_blank"} (last reviewed 2025-05-08). We added phones and reset steps for selling a device, updated how Windows Device encryption behaves (on automatically with a Microsoft account, recovery key stored in the account), and left out the step-by-step BleachBit installation. Steps were checked in November 2026 against Microsoft Support, Apple's user guides and support articles, Android Help, and the Android Open Source Project. anoni.net is responsible for any differences from the original, and this page does not represent EFF's views.

## Where to go from here

- [What an ordinary person should actually do](../scenarios/everyday-baseline.md): where disk encryption fits in everyday preparation
- [Device minimization and border crossings in Asia](../scenarios/asia-travel.md): what encryption cannot do when you are asked to unlock
- [What is age](./what-is-age.md): encrypting a single file

[^ssd-enc]: [How to: Encrypt Your Windows, Mac, or Linux Computer](https://ssd.eff.org/module/how-encrypt-your-windows-device){target="_blank"} - EFF Surveillance Self-Defense, last reviewed 2025-02-06.
[^ssd-del]: [How to: Delete Your Computer's Data Securely](https://ssd.eff.org/module/how-delete-your-data-securely-windows){target="_blank"} - EFF Surveillance Self-Defense, last reviewed 2025-05-08.
[^ms-enc]: [Device Encryption in Windows](https://support.microsoft.com/en-us/windows/cf7e2b6f-3e70-4882-9532-18633605b7df){target="_blank"} - Microsoft Support.
[^ms-key]: [Find your BitLocker recovery key](https://support.microsoft.com/en-us/windows/6b71ad27-0b89-ea08-f143-056f5ab347d6){target="_blank"} - Microsoft Support.
[^ms-reset]: [Reset your PC](https://support.microsoft.com/en-us/windows/0ef73740-b927-549b-b7c9-e6f2b48d275e){target="_blank"} - Microsoft Support.
[^apple-fv]: [Protect data on your Mac with FileVault](https://support.apple.com/en-us/guide/mac-help/mh11785/mac){target="_blank"} - Mac User Guide.
[^apple-passcode]: [Set a passcode on iPhone](https://support.apple.com/en-us/guide/iphone/iph14a867ae/ios){target="_blank"} - iPhone User Guide.
[^apple-mac-erase]: [Erase your Mac and reset it to factory settings](https://support.apple.com/en-us/102664){target="_blank"} - Apple Support.
[^apple-iphone-sell]: [What to do before you sell, give away, or trade in your iPhone or iPad](https://support.apple.com/en-us/109511){target="_blank"} - Apple Support.
[^aosp-enc]: [Encryption](https://source.android.com/docs/security/features/encryption){target="_blank"} - Android Open Source Project.
[^google-reset]: [Reset your Android device to factory settings](https://support.google.com/android/answer/6088915?hl=en){target="_blank"} - Android Help.
