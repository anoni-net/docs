# WebRTC 實驗的瀏覽器檢查

頁面本身在 `docs/<lang>/lab/webrtc-transfer.md`，邏輯在 `docs/zh-TW/js/webrtc-lab.js`，對應 [issue #553](https://github.com/anoni-net/docs/issues/553)。這個目錄只放驗證用的腳本，跟 repo 裡其他 `check_*.mjs` 一樣不進 CI，改頁面邏輯之後本機執行。

| 檔案 | 走哪一條路 |
|---|---|
| `run-loopback.mjs` | 複製貼上。一顆 Chrome 開兩個分頁，自己跟自己連一次 |
| `run-qr-camera.mjs` | 相機掃 QR。兩顆 Chrome 各接一個假攝影機，互掃對方的 QR code 連上線 |

## 先建置並供裝

兩支都要讀建置產物。供裝綁 127.0.0.1，因為相機需要安全上下文，127.0.0.1 算，區網 IP 不算。

```bash
cd docs && SOCIAL_CARDS=false PRIVACY_ASSETS=false bash run.sh && cd ..
python3 -m http.server 8790 --bind 127.0.0.1 --directory docs/output &
```

## 複製貼上那條路

```bash
google-chrome --headless=new --remote-debugging-port=9223 \
  --user-data-dir=/tmp/chrome-lab-profile about:blank &
LAB_URL=http://127.0.0.1:8790/lab/webrtc-transfer/ node tools/webrtc-lab/run-loopback.mjs
```

## 相機掃 QR 那條路

這一支自己啟動兩顆 Chrome，不必先開。

```bash
node tools/webrtc-lab/run-qr-camera.mjs
```

Chrome 可以拿一個 Y4M 檔當鏡頭拍到的畫面，做法跟 `tools/check_qrstream_browser.mjs` 相同。A 的鏡頭看到 B 的 QR，B 的鏡頭看到 A 的。檔案在呼叫 `getUserMedia` 的時候才打開，所以等對面產生 QR 之後再寫就來得及。

它另外驗一件事：先讓 B 的鏡頭看到一個網址的 QR code，確認頁面認得出那不是自己產生的，繼續掃描而且沒有拿去套用。讀者在現場很可能掃到海報或桌牌上的碼。

兩顆 Chrome 是獨立的行程，解析不到對方的 mDNS 名稱，所以這一支關掉 `WebRtcHideLocalIpsWithMdns`，候選直接帶 IP，描述也因此比真機大一些。

## 哪些數字可以引用

SDP 的位元組數、QR 用到的版本與容錯度、SHA-256 有沒有一致，這三樣可以信。

吞吐量是本機記憶體之間的複製，掃描耗時是假攝影機一開就是清楚的畫面，兩者都不能拿來填 issue 的矩陣，那要在兩台實體裝置上量。
