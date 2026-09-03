---
title: 本機檔案加密
description: 選一個檔案、輸入密語，在瀏覽器裡加密成 age 格式下載，或把 age 檔解回來。檔案與密語都不離開裝置，任何裝了 age 命令列工具的電腦都能解開。
icon: material/lock-outline
offline_assets:
  # 加解密用的 typage 與它相依的 noble、scure 函式庫是 ES module，由頁面的 import map
  # 接到 vendor/age/ 底下，hooks/offline_index.py 只認 <script src>，所以逐一列在下面，
  # 讀者把這一頁存下來時才會一起存。清單由 tools/test_agecrypt.mjs 對照 vendor 目錄。
  - utils/asian-diceware-7776.txt
  - js/agecrypt-worker.js
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
---

# :material-lock-outline: 本機檔案加密

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

<div id="age-tool"></div>

<script src="../../js/passkey.js"></script>
<script src="../../js/agecrypt.js"></script>

## 怎麼用

1. 把檔案拖進來，或點一下選，或把一段文字貼進下面的框。工具看開頭決定要做什麼：age 檔或 age 的文字密文就解密，其餘一律加密。
2. 輸入密語。加密時可以按「抽一組密語」，會從 Asian Diceware 詞表抽六個詞，抄下來，關掉頁面就沒了。
3. 按「加密並下載」。頁面會用同一組密語把輸出解回來比對，一致才給下載，檔名是原檔名加 `.age`。解密時檔名去掉 `.age`。環境太慢時會先告訴你預估時間，由你決定要不要等，等的話省略比對那一趟。

輸出是標準的 age 格式，任何裝了命令列工具的電腦都能解開，不需要這個網站：

```
age -d -o backup.tar backup.tar.age
```

age 是什麼、格式長什麼樣、跟 PGP 差在哪，見[什麼是 age](../tools/what-is-age.md)。

## 跨裝置，貼進你的密碼管理器

貼一段文字進來加密，或加密檔案時勾「輸出成文字」，得到的是 `-----BEGIN AGE ENCRYPTED FILE-----` 開頭的純文字。把它跟密語一起存進你已經在用的密碼管理器（Bitwarden、Proton Pass、1Password 的安全筆記都行），另一台裝置打開這一頁貼回來、輸入密語就解開。跨裝置同步由你信任的管理器負責，站上什麼都不存。

文字形式的密文存成檔案一樣是標準 age 檔，命令列會自己認出來：

```
age -d -o note.txt note.txt.age
```

文字形式比二進位大三分之一，所以檔案超過 64 KB 只給二進位下載。密碼管理器的筆記欄位多半也收不下更大的東西。

## 用 passkey 當鑰匙

加密時把鑰匙切到「passkey」，就不用記密語。瀏覽器會跳出提示，用指紋或 PIN 同意一次，檔案就加密給你的 passkey。第一次用之前先到 [passkey 鑰匙](passkey.md)建立一把、產生備援金鑰。備援金鑰的公鑰是這裡的必填欄位：passkey 丟了、換到不支援的環境，只剩備援私鑰能開。解密時工具看檔頭決定要問密語、passkey 還是備援私鑰，用 age 命令列加密給 `age1` 公鑰的檔案也能在這裡貼私鑰解開。passkey 模式的檔案只能在這個網站解，理由見[什麼是 passkey](../tools/what-is-passkey.md)。

## 密語就是全部

工具只做密語模式，沒有金鑰要管，代價是加密的強度完全等於密語的強度。scrypt 讓每一次猜測都要花零點幾秒，能拖慢暴力嘗試，但對一個好猜的密語沒有幫助。六個詞以上、不是名言或歌詞、沒有在別處用過，理由見 [Asian Diceware 密語字典](../tools/asian-diceware.md)。忘了密語沒有任何人能救，備份的密語自己也要備份，寫在紙上放在跟備份不同的地方。

## 注意

- 整份檔案在記憶體裡處理，超過 200 MB 會先擋下。大的備份先切小，或直接用命令列工具。
- 檔名不在密文裡，輸出檔名是原檔名加 `.age`，別人會看到。備份取一個不透露內容的檔名。
- 用金鑰（`age1` 開頭的公鑰）加密的檔案需要對應的私鑰，工具無法處理，用命令列工具解。
- 第一次使用需要連上網把程式抓回來，之後會留在裝置上。
- 關掉 JavaScript JIT 的瀏覽器算 scrypt 慢五十倍以上，桌機實測一次要 50 秒。IronFox 預設關閉，可在設定的 Security 開啟。Tor Browser 的「較安全」等級也會關。工具會先量一次再告訴你預估時間，期間頁面照常能操作。

## 離線可用

跟這一區其他工具一樣，程式存進裝置之後斷網也能用，那就是檔案與密語沒有偷偷送出去最直接的證明。

要把這一頁帶著走，見[離線閱讀](../offline.md)。
