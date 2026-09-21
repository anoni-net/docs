# WebRTC 實驗的瀏覽器檢查

頁面本身在 `docs/<lang>/lab/webrtc-transfer.md`，邏輯在 `docs/zh-TW/js/webrtc-lab.js`，對應 [issue #553](https://github.com/anoni-net/docs/issues/553)。這個目錄只放驗證用的腳本，跟 repo 裡其他 `check_*.mjs` 一樣不進 CI，改頁面邏輯之後本機執行。

| 檔案 | 走哪一條路 |
|---|---|
| `run-loopback.mjs` | 複製貼上。一顆 Chrome 開兩個分頁，自己跟自己連一次 |
| `run-qr-camera.mjs` | 相機掃 QR。兩顆 Chrome 各接一個假攝影機，互掃對方的 QR code 連上線 |
| `test_compact.mjs` | QR 裡只帶欄位的封包。不開瀏覽器，也不需要建置產物 |

## 先建置並供裝

前兩支要讀建置產物。供裝綁 127.0.0.1，因為相機需要安全上下文，127.0.0.1 算，區網 IP 不算。

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

兩顆 Chrome 是獨立的行程，解析不到對方的 mDNS 名稱，所以這一支關掉 `WebRtcHideLocalIpsWithMdns`，候選直接帶 IP。另外 `--use-fake-ui-for-media-stream` 讓相機權限從頁面載入就是 `granted`，連線一建立就交出所有網卡。真機第一次使用時只交出一個 mDNS 名稱，那一種描述這一支走不到，交給 `test_compact.mjs`。

QR 裡的封包沒有用上只帶欄位的格式，而是退回完整描述時，這一支會判定失敗。退回之後照樣連得上，不在這裡攔的話，編碼壞掉也看不出來。

## 只帶欄位的封包

QR 優先放格式版本 2，只帶 `ice-ufrag`、`ice-pwd`、DTLS 指紋、候選與 `setup` 角色，其餘的行由接收端照固定樣板補回。欄位的排法寫在 `webrtc-lab.js` 的 `compact-codec-begin` 那一段開頭。

| 描述 | 完整描述 gzip 後 | 只帶欄位 | QR（容錯度 M） |
|---|---|---|---|
| Chrome，沒有相機權限，1 個 mDNS 名稱 | 474 B | 79 B | 第 17 版 → 第 5 版 |
| Chrome，有相機權限，濾完剩 1 個區網位址 | 595 B | 67 B | 第 19 版 → 第 5 版 |
| Firefox，1 個區網位址 | 488 到 490 B | 76 B | 第 17 版 → 第 5 版 |

數字是 2026-09-21 在 Chrome 153 與 Firefox 157 上量的，兩者互為發起方都連得上。

編不出來就退回格式版本 1 的完整描述，複製貼上那一格也維持完整描述。會退回的情況有：指紋不是 SHA-256、描述裡有媒體軌、`setup` 的值不符合角色，以及候選全被濾掉。

候選只留 UDP 的 host，並丟掉 `100.64.0.0/10`、Tailscale 的 `fd7a:115c:a1e0::/48`、loopback 與 link-local。濾掉的只有交出去的候選，瀏覽器從哪張網卡送連線檢查並不受影響。實測 Firefox 發起、Chrome 回應時，Chrome 從它的 Tailscale 位址送出檢查，Firefox 最後選中的就是那一個 prflx 候選。要完全避開 Tailscale，連線要在相機授權之前建立。

```bash
node tools/webrtc-lab/test_compact.mjs
```

每個編得出來的案例都驗「解回來再編一次，位元組完全相同」，再逐欄核對組回來的 SDP。改了格式或樣板之後，還要用兩個真的瀏覽器連一次，確認 `setRemoteDescription` 接受組回來的描述，這一支驗不到那一步。

## 哪些數字可以引用

SDP 的位元組數、QR 用到的版本與容錯度、SHA-256 有沒有一致，這三樣可以信。

吞吐量是本機記憶體之間的複製，掃描耗時是假攝影機一開就是清楚的畫面，兩者都不能拿來填 issue 的矩陣，那要在兩台實體裝置上量。
