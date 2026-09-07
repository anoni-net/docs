---
title: My preparation checklist
description: The site's action items gathered into one list you can tick off. Progress is encrypted with your passkey and stays on your device. No account, no server, nothing stored here.
icon: material/checkbox-marked-outline
offline_assets:
  # typage 與相依的 noble、scure 由 import map 接到 vendor/age/，hooks/offline_index.py 只認
  # <script src>，所以逐一列在下面。清單由 tools/test_agecrypt.mjs 對照 vendor 目錄。
  - utils/vendor/age/age-encryption/dist/armor.js
  - utils/vendor/age/age-encryption/dist/cbor.js
  - utils/vendor/age/age-encryption/dist/format.js
  - utils/vendor/age/age-encryption/dist/index.js
  - utils/vendor/age/age-encryption/dist/io.js
  - utils/vendor/age/age-encryption/dist/recipients.js
  - utils/vendor/age/age-encryption/dist/stream.js
  - utils/vendor/age/age-encryption/dist/webauthn.js
  - utils/vendor/age/age-encryption/dist/x25519.js
  - utils/vendor/age/noble-ciphers/_arx.js
  - utils/vendor/age/noble-ciphers/_poly1305.js
  - utils/vendor/age/noble-ciphers/chacha.js
  - utils/vendor/age/noble-ciphers/utils.js
  - utils/vendor/age/noble-curves/abstract/curve.js
  - utils/vendor/age/noble-curves/abstract/edwards.js
  - utils/vendor/age/noble-curves/abstract/fft.js
  - utils/vendor/age/noble-curves/abstract/hash-to-curve.js
  - utils/vendor/age/noble-curves/abstract/modular.js
  - utils/vendor/age/noble-curves/abstract/montgomery.js
  - utils/vendor/age/noble-curves/abstract/oprf.js
  - utils/vendor/age/noble-curves/abstract/weierstrass.js
  - utils/vendor/age/noble-curves/ed25519.js
  - utils/vendor/age/noble-curves/nist.js
  - utils/vendor/age/noble-curves/utils.js
  - utils/vendor/age/noble-hashes/_md.js
  - utils/vendor/age/noble-hashes/_u64.js
  - utils/vendor/age/noble-hashes/hkdf.js
  - utils/vendor/age/noble-hashes/hmac.js
  - utils/vendor/age/noble-hashes/pbkdf2.js
  - utils/vendor/age/noble-hashes/scrypt.js
  - utils/vendor/age/noble-hashes/sha2.js
  - utils/vendor/age/noble-hashes/sha3.js
  - utils/vendor/age/noble-hashes/utils.js
  - utils/vendor/age/noble-post-quantum/_crystals.js
  - utils/vendor/age/noble-post-quantum/hybrid.js
  - utils/vendor/age/noble-post-quantum/ml-kem.js
  - utils/vendor/age/noble-post-quantum/utils.js
  - utils/vendor/age/scure-base/index.js
  - utils/vendor/qrcode-generator.js
  - utils/vendor/jsQR.js
  - js/vault.js
  - js/checklist.js
---

# :material-checkbox-marked-outline: My preparation checklist

[What an ordinary person should actually do](../scenarios/everyday-baseline.md) and [Device minimization and border crossings in Asia](../scenarios/asia-travel.md) list what to do, but nothing keeps track of how far you got. This page gathers those headings into one list. A tick is encrypted and stored on this device with your passkey as the key, and one fingerprint next time brings your progress back. Nothing reaches the site; it cannot even tell whether you have a list.

No passkey yet? Create one on [Passkey as your key](passkey.md) first, or create one right here. What a passkey is and where its limits are: [What is a passkey?](../tools/what-is-passkey.md).

<script type="importmap">
{
  "imports": {
    "age-encryption": "../vendor/age/age-encryption/dist/index.js",
    "@noble/ciphers/chacha.js": "../vendor/age/noble-ciphers/chacha.js",
    "@noble/curves/abstract/edwards.js": "../vendor/age/noble-curves/abstract/edwards.js",
    "@noble/curves/abstract/fft.js": "../vendor/age/noble-curves/abstract/fft.js",
    "@noble/curves/abstract/montgomery.js": "../vendor/age/noble-curves/abstract/montgomery.js",
    "@noble/curves/abstract/weierstrass.js": "../vendor/age/noble-curves/abstract/weierstrass.js",
    "@noble/curves/ed25519.js": "../vendor/age/noble-curves/ed25519.js",
    "@noble/curves/nist.js": "../vendor/age/noble-curves/nist.js",
    "@noble/curves/utils.js": "../vendor/age/noble-curves/utils.js",
    "@noble/hashes/hkdf": "../vendor/age/noble-hashes/hkdf.js",
    "@noble/hashes/hkdf.js": "../vendor/age/noble-hashes/hkdf.js",
    "@noble/hashes/hmac": "../vendor/age/noble-hashes/hmac.js",
    "@noble/hashes/hmac.js": "../vendor/age/noble-hashes/hmac.js",
    "@noble/hashes/scrypt.js": "../vendor/age/noble-hashes/scrypt.js",
    "@noble/hashes/sha2": "../vendor/age/noble-hashes/sha2.js",
    "@noble/hashes/sha2.js": "../vendor/age/noble-hashes/sha2.js",
    "@noble/hashes/sha3.js": "../vendor/age/noble-hashes/sha3.js",
    "@noble/hashes/utils": "../vendor/age/noble-hashes/utils.js",
    "@noble/hashes/utils.js": "../vendor/age/noble-hashes/utils.js",
    "@noble/post-quantum/hybrid.js": "../vendor/age/noble-post-quantum/hybrid.js",
    "@scure/base": "../vendor/age/scure-base/index.js"
  }
}
</script>

<div id="checklist-tool"></div>
<script src="../vendor/qrcode-generator.js"></script>
<script src="../vendor/jsQR.js"></script>
<script src="../../js/vault.js"></script>
<script src="../../js/checklist.js"></script>

## How it works

- Ticks are encrypted and kept in the browser's IndexedDB. The key lives in your passkey and only exists in memory while unlocked; leaving this page drops it. That is why every item link opens in a new tab: keep this page open and you do not need to unlock again. After 5 idle minutes it locks by itself, saving your ticks first. Still press "Lock" before you walk away.
- If the passkey lives somewhere that syncs (iCloud, Google, Bitwarden), the other device already has it and nothing needs doing. What moves is the data on this device: export the ciphertext and import it there, unlocking with the same passkey, or press "Send to another device" and the [QR frame stream](qr-stream.md) plays it for the other device to scan; once complete that page offers "Import into my preparation checklist". The two devices need no shared network.
- The list only records what you ticked and on which day. If the passkey is lost and the list will not open, tick again; there is no backup key step here.
- Renaming an article heading does not affect existing ticks. Ticks follow the item's internal id.
- The yearly review group holds the nine questions from the baseline article. Anything untouched for over a year gets flagged, the filter narrows the list to those, and "Checked today" resets the date.
- When the passkey did not sync to another device (say a phone on the iCloud Keychain and a computer on Windows Hello), unlock here and press Enrol another device: a QR code and a string appear for one minute. On the other device press Enrol this device with a key from another, photograph or paste it, and that device gets a passkey with the same key. The data is still on the original device afterwards; move it with "Send to another device". The string is the data key itself, so use it only between your own two devices. Once photographed it cannot be recalled and cannot be rotated; the only remedy is to clear the stash and create a new passkey.
- The encryption here is only as strong as the place that keeps the passkey: someone who can reach this device and knows the unlock code or the password manager's master password sees what you ticked. In that situation read [digital preparation for survivors of domestic abuse](../scenarios/domestic-violence.md) first, and consider leaving no trace of your preparation on this device at all.
- [Threat model checklist](threat-model.md) is the other list-shaped tool here. It asks what you protect and from whom, and stores nothing. This page records how far you have got.
