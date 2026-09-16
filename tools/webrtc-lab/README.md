# WebRTC 實驗的回送檢查

頁面本身在 `docs/<lang>/lab/webrtc-transfer.md`，邏輯在 `docs/zh-TW/js/webrtc-lab.js`，對應 [issue #553](https://github.com/anoni-net/docs/issues/553)。這個目錄只放驗證用的腳本。

`run-loopback.mjs` 用 CDP 開兩個分頁，讓那一頁自己跟自己連一次，走完握手與傳輸。用途是確認頁面邏輯沒壞，以及先看一眼 SDP 的大小。

```bash
cd docs && SOCIAL_CARDS=false PRIVACY_ASSETS=false bash run.sh && cd ..
python3 -m http.server 8790 --directory docs/output &
google-chrome --headless=new --remote-debugging-port=9223 \
  --user-data-dir=/tmp/chrome-lab-profile about:blank &
node tools/webrtc-lab/run-loopback.mjs
```

跟 repo 裡其他 `check_*.mjs` 一樣要先開好伺服器與一顆 headless Chrome，不進 CI。

回送量到的數字只有兩種可以引用：SDP 的位元組數與換算出來的 QR 張數，以及 SHA-256 有沒有一致。吞吐量是本機記憶體之間的複製，握手耗時含了腳本自己的等待，兩者都不能拿來填 issue 的矩陣，那要在兩台實體裝置上量。
