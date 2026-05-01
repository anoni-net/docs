---
title: 後量子密碼概觀
description: NIST 後量子標準的選型結果、Harvest Now Decrypt Later 的威脅，以及實際系統的轉換時程。
icon: material/atom-variant
---

# :material-atom-variant: 後量子密碼概觀

「現在加密、未來解密（Harvest Now, Decrypt Later）」這個威脅模型，讓後量子密碼的轉換不再只是學術議題。NIST 在 2024 年確立了第一批後量子標準（ML-KEM、ML-DSA、SLH-DSA），主流瀏覽器、TLS 函式庫、Signal Protocol 也陸續導入混合金鑰交換。這篇文章整理三個面向：選型結果與其背後的安全假設、真實系統的轉換時程（瀏覽器、雲端、通訊應用、SSH）、以及一般人和組織需要關心的時間點。內容偏概念，不深入演算法細節，適合作為後續閱讀的入門。

<!-- 待補：完整內容尚未撰寫。新文章（Q3）。 -->
