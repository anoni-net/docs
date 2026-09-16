# WebRTC 實驗台

[issue #553](https://github.com/anoni-net/docs/issues/553) 的量測工具，回答一個問題：兩台裝置在沒有網際網路的現場，能不能用 WebRTC 的 DataChannel 把幾 MB 的離線包傳過去，而交換連線描述那一步完全不靠伺服器。

這一頁不屬於文件站。它放在 `tools/` 底下，mkdocs 看不到，所以不進 nav、不進 sitemap、不會被預快取清單收走，正式站上沒有這個網址。實驗結束就整個刪掉。

## 檔案

| 檔案 | 用途 |
|---|---|
| `index.html` | 實驗台本體，單一檔案，沒有任何外部相依 |
| `run-loopback.mjs` | CDP 驅動兩個分頁自己跟自己連一次，確認頁面邏輯沒壞 |

## 兩台裝置怎麼測

用一台當來源，把這個目錄供裝出去，兩台都連上同一個網路（自己開的熱點最可控）。

```bash
python3 -m http.server 8790 --directory tools/webrtc-lab
```

一邊按「我是發起方」，把產生的描述整段給另一邊。另一邊按「我是回應方」，貼上、套用，把產生的回應描述給回去。連上之後任一邊都可以送檔案，收的一端會算 SHA-256 跟來源比對。

手機那端要用 http 或 https 開，`file://` 拿不到同一份頁面。跨裝置量測的完整矩陣寫在 issue 裡。

## 本機回送檢查

先自己開好伺服器與一顆 headless Chrome，跟 repo 裡其他 `check_*.mjs` 同一個模式。

```bash
python3 -m http.server 8790 --directory tools/webrtc-lab &
google-chrome --headless=new --remote-debugging-port=9223 \
  --user-data-dir=/tmp/chrome-lab-profile about:blank &
node tools/webrtc-lab/run-loopback.mjs
```

回送量到的數字只有兩種可以引用：SDP 的位元組數與換算出來的 QR 張數，以及 SHA-256 有沒有一致。吞吐量是本機記憶體之間的複製，握手耗時含了腳本自己的等待，兩者都不能拿來填 issue 的矩陣。

## 這一頁不送任何資料

整頁沒有 fetch、XMLHttpRequest、sendBeacon 與 WebSocket，也不載入任何外部資源。`RTCPeerConnection` 的 `iceServers` 是空的，沒有 STUN 也沒有 TURN，連得上就是靠同一個區網裡的 host candidate。

量測結果要自己按「匯出紀錄」存成 JSON。匯出前會把 IPv4、IPv6 與 mDNS 名稱遮掉，那些值指得回裝置。
