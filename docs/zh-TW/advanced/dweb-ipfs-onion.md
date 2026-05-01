---
title: 去中心化網站發布
description: IPFS 與 Onion 服務的設計差異、合用場景，以及在 Anoni.net 文件站的實際應用。
icon: material/web-box
---

# :material-web-box: 去中心化網站發布

「網站可以怎麼發布」這件事，過去十年多了不少選擇。IPFS 用內容定址讓檔案在多個節點之間流通，Onion 服務則讓網站直接以 .onion 域名運作於 Tor 網路中。兩者解決的問題不同：IPFS 著重抵抗刪除與審查，Onion 著重連線匿名與管制規避。這篇文章對照兩者的設計差異、效能特性、在實際系統中的常見組合，並以 Anoni.net 文件站的 IPFS 與 Onion 部署作為例子，說明維運上的取捨與已知限制。

<!-- 待補：完整內容尚未撰寫。新文章（Q3）。 -->
