---
title: 工具層
description: 匿名網路工具的入門索引，依連線、環境、觀測、日常基本功四個層次分群，幫你判斷自己這個情境該先讀哪幾篇。
icon: material/toolbox-outline
---

# :material-toolbox-outline: 工具層

讀完[概念層](../basics/index.md)後，這個分類介紹幾個在匿名網路討論中最常被提到的工具。12 篇文章按連線、環境、觀測、日常基本功四個層次排列，每個層次解決一類問題，挑跟你情境相關的那一群開始讀就好，不必整本看完。動工具之前可以先看 [威脅模型如何建立](../basics/threat-model.md)，確認自己在抗誰，避免「工具當答案」的誤區。

## 先看這篇

- [什麼是匿名網路](./what-is-anonymity-network.md)：匿名網路解決什麼問題、後續工具家族如何分工，第一次來建議先讀這篇。

## 連線層：Tor 工具家族

想匿名瀏覽、傳檔、或貢獻網路自由基礎建設的人，從這群開始。

- [什麼是 Tor](./what-is-tor.md)：Tor 如何使用、跟 VPN 差在哪、什麼時候不該用。
- [Tor Browser 進階設定](./tor-browser-advanced.md)：橋接、安全等級、Onion 站點與身分隔離。
- [Tor Snowflake](./tor-snowflake.md)：開瀏覽器分頁，幫受審查地區的使用者連上 Tor，台灣門檻最低的網路自由貢獻方式。
- [OnionShare](./onionshare.md)：透過 Tor 起臨時 onion service，匿名傳檔、收檔、架站、聊天。

## 環境層：匿名作業系統

要把整個作業系統一起切開的高敏感任務（採訪、處理外來檔案、行動現場），從這群開始。

- [什麼是 Tails](./what-is-tails.md)：從 USB 啟動、預設走 Tor、關機後不留痕跡的可攜式系統。
- [Tails、Whonix、Qubes 的差別](./tails-vs-whonix-vs-qubes.md)：三套常見匿名作業系統的取捨，依角色推薦適合的選擇。

## 觀測層：網路審查的可驗證紀錄

想把「連不上」、「跑很慢」變成可引用的公開資料，或想做封鎖測量活動的人，從這群開始。

- [什麼是 OONI](./what-is-ooni.md)：把網路干預變成有時間、地點、ASN 對得上的觀測紀錄。
- [OONI Run v2 操作說明](./ooni-run-v2.md)：建立動態檢測名單，協助觀察特定網站是否被審查或封鎖。
- [onionoo MCP：用中文查 Tor 中繼節點現況](../community/onionoo-mcp.md)：社群自架的查詢服務，不用寫程式，在 claude.ai 接上後盤點某國有多少 Tor 中繼、頻寬多大、落在哪些電信網路。

## 日常隱私基本功

想從通訊、帳號、金流先補齊基礎的人，從這群開始。三篇主題彼此獨立，不必照順序。

- [匿名通訊工具比較](./messaging-comparison.md)：Signal、SimpleX、Session、Briar、Matrix 的端對端加密、Metadata 與身分模型差異。
- [密碼管理器入門](./password-manager.md)：Bitwarden、KeePassXC、1Password、Apple Passwords 的取捨，加上 TOTP、Passkey、硬體金鑰。
- [加密貨幣的隱私光譜](./crypto-privacy-spectrum.md)：BTC、Monero、Zcash、穩定幣的隱私差異與自管錢包、multisig。
