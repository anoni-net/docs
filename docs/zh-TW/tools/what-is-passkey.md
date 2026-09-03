---
title: 什麼是 passkey
description: passkey 是存在密碼管理器或鑰匙圈裡的一把憑證，配上 PRF 擴充就能算出加密金鑰。它為什麼能當站上資料的鑰匙、跟密語差在哪、限制在哪。
icon: material/fingerprint
---

# :material-fingerprint: 什麼是 passkey

passkey 是一把存在你裝置或密碼管理器裡的憑證。網站請它簽名時，你用指紋、臉或 PIN 同意，它就簽。它一般用來登入，站上的用法完全不同：沒有登入，沒有帳號，沒有伺服器。我們只用它做一件事，算出加密金鑰。

## 為什麼 passkey 能當鑰匙

WebAuthn 的 PRF 擴充讓 passkey 內部多藏一把秘密，永遠不離開驗證器。網頁每次驗證附一段輸入，你同意之後，驗證器回傳固定 32 位元組的輸出。同一把 passkey 配同一段輸入，永遠得到同一段輸出。passkey 因此變成一台「只在你按指紋時才回答的金鑰計算機」。

站上的[本機檔案加密](../utils/age.md)拿這段輸出去包 age 的 file key。沒有 passkey 就算不出金鑰，資料就是一堆密文。這跟「驗證通過才顯示」完全不同，後者是寫在網頁裡的門禁，誰都繞得過。前者是數學。

## 跟密語差在哪

| | 密語 | passkey |
|---|---|---|
| 要記什麼 | 一組六個詞以上的密語 | 不用記，指紋或 PIN |
| 強度來源 | 密語本身，scrypt 拖慢猜測 | 驗證器裡的隨機秘密，猜不了 |
| 跨裝置 | 密語跟著人走 | passkey 要同步過去，只在同步的裝置上有 |
| 能在哪裡解 | 任何裝了 age 命令列工具的電腦 | 只有 anoni.net 的網頁，而且瀏覽器要支援 |
| 丟了怎麼辦 | 忘了就永遠打不開 | 丟了就永遠打不開，所以要有備援金鑰 |
| Tor Browser | 可以 | 不行，WebAuthn 整個關閉 |

密語模式的檔案在任何地方都解得開，passkey 模式的檔案綁在這個網域與你的裝置上。兩種模式輸出的都是標準 age 檔，只是收件人不同。

## 限制

passkey 綁在 `anoni.net` 這個 RP ID 上。瀏覽器只允許在同一個網域使用，鏡像站與 onion 位址用不了。Tor Browser 整個關閉 WebAuthn，`security.webauth.webauthn` 在它的預設設定檔裡是 false。

PRF 擴充的支援面到 2026 年 3 月：macOS 15 以上的 Safari 18、Chrome 132、Firefox 139，iOS 18.4 以上，Android 的 Chrome 配 Google 密碼管理員，Windows 11 要 2026 年 2 月的更新之後。1Password、Bitwarden、Dashlane 支援。Firefox Android 與 Windows 10 不支援。

passkey 丟了、密碼管理員的帳號沒了、換到不支援 PRF 的環境，資料就永遠打不開。所以站上的流程強制搭一把 X25519 備援金鑰，檔案同時加密給 passkey 與它。備援金鑰放在跟密文不同的地方。

## 站上存了什麼

什麼都沒有。瀏覽器基於隱私不讓網頁查詢「這個網域有沒有 passkey」，任何查詢都會跳提示。所以站上連你有沒有建過都不知道，passkey 頁每次打開都是空的。每一次算金鑰都要你當場同意。

## 相關閱讀

- [passkey 鑰匙](../utils/passkey.md)：建立、試解鎖、產生備援金鑰。
- [什麼是 age](what-is-age.md)：passkey 包的是 age 的 file key。
- [本機檔案加密](../utils/age.md)：選「passkey」模式。
