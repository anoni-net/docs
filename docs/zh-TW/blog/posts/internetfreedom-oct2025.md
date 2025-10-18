---
date: 2025-10-18
authors:
    - toomore
categories:
    - 活動
slug: internetfreedom-oct2025
image: "assets/images/post-update.png"
summary: "快速回顧，國家級的監控，我們還可以採取怎樣的行動"
description: "快速回顧，國家級的監控，我們還可以採取怎樣的行動"
---

# 網路自由小聚 2025/10：數位威權主義商品化 - 網路政變報告分享會

<figure markdown="span">
  ![網路自由小聚 2025/10](https://assets.kktix.io/upload_images/244247/%E7%B6%B2%E8%B7%AF%E8%87%AA%E7%94%B1%E5%B0%8F%E8%81%9A_large.png){ style="border-radius: 10px;" }
  <figcaption>圖片引用自網路自由小聚 10 月：https://ocftw.kktix.cc/events/internetfreedom-oct2025 活動。</figcaption>
</figure>

在「[網路自由小聚](https://ocftw.kktix.cc/events/internetfreedom-oct2025){target="_blank"}」分享 [InterSecLab](https://interseclab.org/){target="_blank"} 針對中國防火長城資料外洩的[報告](../../report/index.md){target="_blank"}後，在活動當天後半段有許多討論，問題圍繞在面對國家級的監控手段與能力時，我們最後還可以做什麼？過往給予的資安防護建議也需要重新檢視與修正。

以下我們將針對當天有討論到的部分，透過文字再幫大家回顧一下，我們也建議這份報告值得花點時間閱讀，會有一個更清晰的輪廓勾勒我們所要面對的風險與挑戰。

<!-- more -->

## 開源軟體的濫用

在報告中[發現](../../report/interseclab-the-internet-coup/index_2.md){target="_blank"}，防火長城一系列的軟體，部分以現有的開源軟體所建立或以此基礎修改，這裡出現一個問題，許多工程人員對於其專業領域的開源貢獻後，被某些組織濫用，**完全忽視開源授權的規範**，或許這樣的規範本身無實質的強制約束能力，但就開源貢獻後的成果被使用在隱私監控的領域上，我們此刻無相應的抵制措施與反應作為。開源軟體濫用的狀況升級到國家規模的層級時，我們能有什麼辦法可以制衡與問責呢？

這個問題在當晚的討論時我們沒有一個答案，當追求**網路自由、民主自由**的過程中，我們可能只能暫時歸咎於工具的中立性，或許這與 Tor、onion 網路的使用也是相類似的狀況。

## 防火長城驗證難以有效阻擋的 WebTunnel

在報告中[提到](../../report/interseclab-the-internet-coup/index_7.md){target="_blank"}，目前常見的 VPN 協定都可識別與阻擋，但 Tor 橋接類型中的 WebTunnel 目前還無法進行有效的阻擋，由於資料外洩的時間點是在 2024/12 左右，但經過 10 個月的時間後，不確定防火長城的技術是否依舊無法阻擋，而與 WebTunnel 類似透過串流偽裝 Tor 連線的 Snowflake 也可規避封包檢測。

在當晚的活動，我們帶著大家快速介紹 [Snowflake](../../tor-snowflake.md){target="_blank"}，只要透過瀏覽器套件，開啟後建立一個類似視訊會議串流後，就可以透過瀏覽器搭建一個 Tor 橋接點，協助完全無法使用 Tor 的地區經過你的橋接中繼點連上 onion 網路。而對於有技術能力的參與者，我們也建議可以透過 Tor 官方包好的 [WebTunnel](https://community.torproject.org/relay/setup/webtunnel/docker/){target="_blank"}（Docker 映像檔），建立一個類似瀏覽某個網頁的行為，提供一個[橋接中繼點](../../what-is-tor.md){target="_blank"}。

## 採取行動

在當晚的討論，我們討論到是否要採取**「主動」**的行動，既然已知一些極端政府對於人民的監控與處置行為，**我們是否就直接採取主動的態勢改變現況**。當然，情緒激昂過後，我們也思考到所面臨的議題可能不是像程式碼佈署錯誤重新上傳、主機故障重開機即可的簡單問題，當捍衛人權的範疇納入思考後，我們可能需要面對的是現實世界的真實危險、性命問題。此時稍微的停頓片刻，現場參與者或許也在思考面對這樣的風險，我們還有多少決心願意採取行動。

為了稍微緩和一下沈重的議題，我們轉告了 InterSecLab 的下一步計畫，希望招募對於程式碼分析、研究感興趣的夥伴，在報告中有提到，目前外洩的資料中還有一大部分是還沒有挖掘與分析的，而在防火長城技術輸出的國家中，一個名為 A24 的代號也還未被辨識出來，或許不同專業領域的努力都能成為極端政權的有力反抗！

---

以上是「網路自由小聚」活動當晚的快速回顧，也感謝[開放文化基金會](https://ocf.tw/){target="_blank"}的邀約，給予「[匿名網路社群](../../about/index.md)」一個分享的機會。如果您還未閱讀我們已翻譯的報告，請透過[這裡閱讀](../../report/index.md)！我們也準備針對報告中的發現，嘗試建立一個一般大眾可以上手的抵禦能力，或許會先從**隱私保護**開始，有興趣的夥伴也可以透過[這個頻道](https://matrix.to/#/#interseclab-the-internet-coup:im.anoni.net){target="_blank"}來討論。

當然，也可以直接寄信給[我們](../../about/index.md)！
