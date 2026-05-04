---
title: 去中心化網站發布
description: IPFS 與 Onion 服務的設計差異、合用場景，以及在 anoni.net 文件站的實際應用。
icon: material/web-box
---

# :material-web-box: 去中心化網站發布

!!! info "撰寫中（2026 Q3）"
    這篇文章還在準備中，下方段落是主題大綱。歡迎到 [Matrix 社群](../community/tools.md) 表達想看的角度，或參與撰寫，見 [如何參與](../community/how-to-contribute.md)。

「網站可以怎麼發布」這件事，過去十年多了不少選擇。IPFS 用內容定址讓檔案在多個節點之間流通，Onion 服務則讓網站直接以 .onion 域名運作於 Tor 網路中。兩者解決的問題不同：IPFS 著重抵抗刪除與審查，Onion 著重連線匿名與管制規避。這篇文章對照兩者的設計差異、效能特性、在實際系統中的常見組合，並以 anoni.net 文件站的 IPFS 與 Onion 部署作為例子，說明維運上的取捨與已知限制。
