# WebRTC 實驗的瀏覽器檢查

頁面本身在 `docs/<lang>/lab/webrtc-transfer.md`，邏輯在 `docs/zh-TW/js/webrtc-lab.js`，對應 [issue #553](https://github.com/anoni-net/docs/issues/553)。這個目錄只放驗證用的腳本，跟 repo 裡其他 `check_*.mjs` 一樣不進 CI，改頁面邏輯之後本機執行。

| 檔案 | 走哪一條路 |
|---|---|
| `run-loopback.mjs` | 複製貼上。一顆 Chrome 開十個分頁，走經由介紹連上第三台、兩台同時互掃、同一張 QR code 被兩台掃到、連不上要在 15 秒內判定四種情況，並換三組傳輸參數送檔 |
| `run-qr-camera.mjs` | 相機掃 QR。兩顆 Chrome 各接一個假攝影機，兩邊只按開始，互掃對方的 QR code 連上線 |
| `test_compact.mjs` | QR 裡只帶欄位的封包。不開瀏覽器，也不需要建置產物 |

## 先建置並供裝

前兩支要讀建置產物。供裝綁 127.0.0.1，因為相機需要安全上下文，127.0.0.1 算，區網 IP 不算。

```bash
cd docs && SOCIAL_CARDS=false PRIVACY_ASSETS=false bash run.sh && cd ..
python3 -m http.server 8790 --bind 127.0.0.1 --directory docs/output &
```

## 複製貼上那條路

三種情況：

- A 與 B 互貼、C 與 B 互貼，A 與 C 要靠 B 轉交描述連上，連上之後 A 同時送檔給 B 與 C
- D 與 E 同時回應對方，兩條連線都可能開通，最後每一邊只能留一條
- G 與 H 回應同一張 F 的發起描述，晚一步的 H 要被認出來，改回應 F 換上的新描述後照樣連得上
- I 套上一份連不到的回應（候選換成 TEST-NET 位址、帳密也換掉），15 秒後要記一筆 `connect-timeout` 並收掉那一條

```bash
google-chrome --headless=new --remote-debugging-port=9223 \
  --user-data-dir=/tmp/chrome-lab-profile about:blank &
LAB_URL=http://127.0.0.1:8790/lab/webrtc-transfer/ node tools/webrtc-lab/run-loopback.mjs
```

## 相機掃 QR 那條路

兩邊都只按開始，不選角色。B 的鏡頭先看到一個網址的 QR code，再看到 A 的發起描述，B 自動回應，A 的鏡頭看到回應就連上。之後讓 A 的鏡頭看到 B 換回來的發起描述，確認 A 認得出已經連著 B，不會再開第二條。

這一支自己啟動兩顆 Chrome，不必先開。

```bash
node tools/webrtc-lab/run-qr-camera.mjs
```

Chrome 可以拿一個 Y4M 檔當鏡頭拍到的畫面，做法跟 `tools/check_qrstream_browser.mjs` 相同。A 的鏡頭看到 B 的 QR，B 的鏡頭看到 A 的。檔案在呼叫 `getUserMedia` 的時候才打開，所以等對面產生 QR 之後再寫就來得及。

網址的那一張是為了確認頁面認得出那不是自己產生的，繼續掃描而且沒有拿去套用。讀者在現場很可能掃到海報或桌牌上的碼。

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

回應描述多帶 2 B 的回應標記（旗標 bit4），指出它回應的是哪一張發起描述，取發起描述 `ice-ufrag` 的 FNV-1a 雜湊折成 16 位元。發起方畫面上的那一張被兩台同時掃到時，後掃回來的那一張靠它認出來。2026-09-25 以前的頁面不認得這個旗標，解不開新版的回應描述，兩台要用同一版頁面。

編不出來就退回格式版本 1 的完整描述，複製貼上那一格也維持完整描述，回應標記改放在 JSON 的 `for` 欄位。會退回的情況有：指紋不是 SHA-256、描述裡有媒體軌、`setup` 的值不符合角色，以及候選全被濾掉。

候選只留 UDP 的 host，並丟掉 `100.64.0.0/10`、Tailscale 的 `fd7a:115c:a1e0::/48`、loopback 與 link-local。濾掉的只有交出去的候選，瀏覽器從哪張網卡送連線檢查並不受影響。實測 Firefox 發起、Chrome 回應時，Chrome 從它的 Tailscale 位址送出檢查，Firefox 最後選中的就是那一個 prflx 候選。要完全避開 Tailscale，連線要在相機授權之前建立。

```bash
node tools/webrtc-lab/test_compact.mjs
```

每個編得出來的案例都驗「解回來再編一次，位元組完全相同」，再逐欄核對組回來的 SDP。改了格式或樣板之後，還要用兩個真的瀏覽器連一次，確認 `setRemoteDescription` 接受組回來的描述，這一支驗不到那一步。

## 傳輸參數

第五區的每塊大小、每條連線的通道數、並行連線數，由送出端決定，寫在 `start` 訊息裡，兩端的 `send-*` 與 `recv-*` 紀錄都會帶上。資料塊開頭有 12 bytes（傳輸編號加位置），接收端照位置寫回預先配好的緩衝區，所以多條通道、多條連線不必依序到達。2026-09-26 以前的頁面沒有這個開頭，兩台要用同一版。

額外的連線由送出端發起，描述走已經開通的控制通道，對方的 DTLS 指紋要跟裝置代號一致。計時從接收端回 `ready` 開始，到接收端回 `got`（收齊最後一個位元組）為止，SHA-256 的計算不算進去。

2026-09-26 在同一台 Linux 機器的兩個分頁之間，各組參數送 100 MB，每秒約 60 到 90 MB。本機的往返時間接近零，傳送窗口不會成為限制，多開連線反而因為搶 CPU 變慢，這組數字只能說明程式本身不是 Wi-Fi 上每秒 2.7 MB 的原因。

## 哪些數字可以引用

SDP 的位元組數、QR 用到的版本與容錯度、SHA-256 有沒有一致，這三樣可以信。

吞吐量是本機記憶體之間的複製，掃描耗時是假攝影機一開就是清楚的畫面，兩者都不能拿來填 issue 的矩陣，那要在兩台實體裝置上量。
