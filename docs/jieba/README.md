# jieba 繁體大詞典

站內搜尋的中文斷詞用的詞典，由 `docs/mkdocs.yml` 的 `search.jieba_dict` 指定，只有正體中文版使用（#690）。

`dict.txt.big` 取自 [jieba](https://github.com/fxsjy/jieba) 的 `extra_dict/dict.txt.big`，最後一次修改是上游 commit `237dc662`（2013-06-26），之後沒有再變動。jieba 內建的詞典斷繁體常切錯（例如「腦記」、「數人」），這一份可以切出「人腦」、「記不住」這類正確的詞。

| 檔案 | 來源 | 授權 |
|------|------|------|
| `dict.txt.big` | [fxsjy/jieba](https://github.com/fxsjy/jieba) `extra_dict/dict.txt.big`，commit `237dc662` | MIT，全文見同目錄的 `LICENSE` |
| `LICENSE` | 同上，commit `67fa2e36` | MIT |

`dict.txt.big` 的 SHA-256 是 `b16011275c42955ccd81fc1adecc93a59dbb7926af69d93fc95d4943d40f6aad`，大小 8,583,143 bytes。

站上的專有名詞（洋蔥路由、出口節點等）目前沒有另外補進使用者詞典。這些詞在大詞典裡會拆成合理的兩段，讀者搜尋時，瀏覽器端會拿索引裡的詞把查詢切開再比對，拆開照樣找得到。補成完整的詞反而會讓只搜「節點」這類較短關鍵字的讀者比對不到，要補的話先準備搜尋的評估題目，比較補詞前後的結果。
