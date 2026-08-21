# vendor

第三方程式庫，原封不動放進來，不做任何修改。改過就失去「這是上游那一份」的可審性，
讀者要驗的時候只能相信我們的說法。

| 檔案 | 來源 | 版本 | 授權 |
|---|---|---|---|
| `qrcode-generator.js` | [kazuhikoarase/qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) | 1.4.4 | MIT |

## 為什麼不自己寫

QR 編碼寫錯的典型後果是產生一個「掃得出來但內容錯」的碼，比壞掉更糟。Reed-Solomon
與遮罩選擇那兩段特別容易出錯，而錯了不會有任何徵兆。這一份用了十幾年、被大量專案
採用，比重寫一份可靠。

`tools/test_qrcode.mjs` 另外寫了一個獨立的解碼器，把產生出來的矩陣讀回字串再比對，
所以「我們呼叫的方式對不對」有測試守著，不是純粹相信上游。
