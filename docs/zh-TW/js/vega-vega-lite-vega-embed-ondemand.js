/*
 * 這個檔案幾乎沒有內容，它存在的理由在檔名上。
 *
 * mkdocs-charts-plugin 的 on_config 會檢查 extra_javascript 裡有沒有 vega、
 * vega-lite、vega-embed 三個字串，缺一個就中止建置。它用的是子字串比對，所以這一個
 * 檔名同時滿足三項。
 *
 * 那個檢查的用意是確保圖表函式庫有載入。原本的做法是把三個 CDN 網址放進
 * extra_javascript，那等於全站每一頁都載 808 KB，而全站 198 頁裡只有 3 頁畫圖表。
 * 乾淨連入時那 808 KB 會跟讀者點下去的下一頁搶頻寬，點擊之後要等的就是那個。
 *
 * 現在改成那三頁各自在內文引用（snippets/vega.md），privacy plugin 照樣會把函式庫
 * 抓成本地檔案，只是現在只有需要的頁面才連過去。
 *
 * 三個語系共用這一份，docs/en/js/ 與 docs/zh-CN/js/ 底下是指向這裡的 symlink。
 */
