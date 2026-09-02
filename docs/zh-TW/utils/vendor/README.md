# vendor

第三方程式庫，原封不動放進來，不做任何修改。改過就失去「這是上游那一份」的可審性，
讀者要驗的時候只能相信我們的說法。

| 檔案 | 來源 | 版本 | 授權 |
|---|---|---|---|
| `qrcode-generator.js` | [kazuhikoarase/qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) | 1.4.4 | MIT |
| `jsQR.js` | [cozmo/jsQR](https://github.com/cozmo/jsQR) | 1.4.0 | Apache-2.0，授權全文見 `jsQR-LICENSE.txt` |
| `pdf-lib.min.js` | [Hopding/pdf-lib](https://github.com/Hopding/pdf-lib) | 1.17.1 | MIT，授權全文見 `pdf-lib-LICENSE.txt` |
| `age/age-encryption/` | [FiloSottile/typage](https://github.com/FiloSottile/typage)（npm `age-encryption`） | 0.3.1 | BSD-3-Clause，授權全文見 `age/age-encryption/LICENSE` |
| `age/noble-ciphers/` | [paulmillr/noble-ciphers](https://github.com/paulmillr/noble-ciphers) | 2.1.1 | MIT，`age/noble-ciphers/LICENSE` |
| `age/noble-curves/` | [paulmillr/noble-curves](https://github.com/paulmillr/noble-curves) | 2.0.1 | MIT，`age/noble-curves/LICENSE` |
| `age/noble-hashes/` | [paulmillr/noble-hashes](https://github.com/paulmillr/noble-hashes) | 2.0.1 | MIT，`age/noble-hashes/LICENSE` |
| `age/noble-post-quantum/` | [paulmillr/noble-post-quantum](https://github.com/paulmillr/noble-post-quantum) | 0.5.3 | MIT，`age/noble-post-quantum/LICENSE` |
| `age/scure-base/` | [paulmillr/scure-base](https://github.com/paulmillr/scure-base) | 2.0.0 | MIT，`age/scure-base/LICENSE` |

## 為什麼不自己寫

QR 編碼寫錯的典型後果是產生一個「掃得出來但內容錯」的碼，比壞掉更糟。Reed-Solomon
與遮罩選擇那兩段特別容易出錯，而錯了不會有任何徵兆。這一份用了十幾年、被大量專案
採用，比重寫一份可靠。

`tools/test_qrcode.mjs` 另外寫了一個獨立的解碼器，把產生出來的矩陣讀回字串再比對，
所以「我們呼叫的方式對不對」有測試守著，不是純粹相信上游。

`jsQR.js` 走的是相反方向：把影像解回文字。它要處理定位、透視校正與容錯還原，那是比編碼
更大的工程，自己寫不切實際。`tools/test_qrread.mjs` 用 `qrcode-generator` 產生已知內容
的碼、算成像素、再交給 jsQR 讀回來比對，兩個各自獨立的函式庫互相驗證。

`pdf-lib.min.js` 處理的是 PDF。那個格式的每個物件在交叉索引表裡都記著位元組位置，
拿掉一段東西之後整張表要重算，而 PDF 1.5 之後常見的物件流還會把好幾個物件壓進同一段
壓縮資料裡。自己寫一個能正確處理這些的解析器不切實際，寫半套的後果是「宣告清乾淨、
內容還在」，那比不清更危險。

Apache-2.0 與 MIT 都要求散布時附上授權副本，所以 `jsQR-LICENSE.txt` 與
`pdf-lib-LICENSE.txt` 也在這個目錄裡，不要刪。

## age/ 底下的 ES module

typage 與它相依的五個套件沒有單一檔案的發行版，所以照 npm tarball 裡的目錄結構原封不動放進
`age/`，每個套件自己的 `LICENSE` 與 `package.json` 跟著放。只放 `age-encryption/dist/index.js`
從 import 一路連到的 38 支 `.js`（typage 的 `.d.ts` 與套件裡沒有被 import 的其他模組不放），
清單由 `tools/test_agecrypt.mjs` 從 import 重算一次比對，多一個或少一個都會紅。

頁面用 `<script type="importmap">` 把 `age-encryption` 與 `@noble/...` 等名稱接到 `age/` 底下的檔案，
`js/agecrypt.js` 再 `import("age-encryption")`。要驗跟上游是不是同一份，拿下面的 tarball
雜湊去對：

| tarball | sha256 |
|---|---|
| `age-encryption-0.3.1.tgz` | `5a318d61f29bafc02810feef65dcf9d82b17a44d9c777eed658d2abea5f74bc5` |
| `noble-ciphers-2.1.1.tgz` | `1704cc39be04737a17f17c37b8556b195e2b6ed442ecc2b7be6230b2e26f0d82` |
| `noble-curves-2.0.1.tgz` | `1271ac0dfa27c93e464e64b65ff2a255eea52c449ca86c149cfb0b9786dd9029` |
| `noble-hashes-2.0.1.tgz` | `638ffb3053a7e7478c9e54a6e297f3601299ee570a41112e501af7050d086a0a` |
| `noble-post-quantum-0.5.3.tgz` | `30efd5f906fb181552a0ade106bb6d004725303360f6c041346fd578fff3438e` |
| `scure-base-2.0.0.tgz` | `758d9a74d504922c21f12afbb832a8da13634657fa842c1aee1ec3eac82c8902` |

```
npm pack age-encryption@0.3.1 @noble/ciphers@2.1.1 @noble/curves@2.0.1 @noble/hashes@2.0.1 @noble/post-quantum@0.5.3 @scure/base@2.0.0
```

換版時重新執行 `tools/test_agecrypt.mjs`，它用 Node 內建的 crypto 獨立實作了 age 的密語模式，
typage 的輸出要能被它解開、它的輸出也要能被 typage 解開，兩邊互驗才算通過。
