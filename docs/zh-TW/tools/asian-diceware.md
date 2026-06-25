---
title: Asian Diceware：帶亞洲味的英文密語字典
description: 匿名網路社群參考 EFF Diceware 做的開源密語字典，把 tofu、boba、oolong、kimchi 這類有字典背書的亞洲外來語混進 7776 字英文詞表，讓在台灣與亞洲生活的人更好記。這篇說明如何使用、何時使用、密語強度與隨機性，並提供 A5 小冊 PDF 下載。
icon: material/dice-multiple-outline
---

# :material-dice-multiple-outline: Asian Diceware：帶亞洲味的英文密語字典

又長又隨機的密碼最安全，但人腦記不住，於是多數人改用生日加寵物名字，還一組到處重複使用。有個更省力的方法，擲幾次骰子、從一份固定的詞表裡抽出幾個英文字串起來，當成你的密碼。這種「密語」（passphrase）好記、好輸入，強度卻遠高於一般人手打的密碼。這個做法你可能早就用過，下一節就列幾個你大概見過的例子。我們做的是一份帶亞洲味的版本，把已經進入英文字典的亞洲外來語混進去，對在台灣與亞洲生活的人更好認、更好記。動手前可以先看 [威脅模型如何建立](../basics/threat-model.md)，清楚自己要防範誰，再讀 [密碼管理器入門](./password-manager.md)，了解密語在整套密碼防線裡的位置。

## 你其實早就見過這個做法

把電腦產生的亂數換成幾個好記、好抄的英文字，這套做法出現在很多你用過的場景：

- **加密貨幣錢包的助記詞：**建立錢包時它要你抄下、收好的那 12 或 24 個英文字，就是這個做法最大規模的應用，把錢包的金鑰變成一串你抄得下來的字（這套標準叫 BIP-39，連繁體中文詞表都有）[^bip39]。背景可參考 [加密貨幣的隱私光譜](./crypto-privacy-spectrum.md)。
- **密碼管理器內建的產生器：**Bitwarden 的「Passphrase」、1Password 的「Memorable Password」點一下就產生一組這種密語，底層用的就是同類詞表，你現在打開手邊的管理器就能試[^pwmgr]。
- **不留個資的匿名帳號：**Tor 的 [AnonTicket](https://anonticket.torproject.org/){target="_blank"} 讓人不必提供 email 就能匿名回報問題，帳號代碼就是六個隨機英文字[^anonticket]。讓記者接收爆料的 SecureDrop 平台，會為每位匿名來源產生一組「七個隨機字」的登入代碼[^securedrop]。
- **那張著名的漫畫：**xkcd 的「correct horse battery staple」說的就是這件事，四個隨機英文字串起來，電腦難猜、人卻好記[^xkcd]。

Tails 在建立加密儲存時也會直接建議一組這樣的密語（5.12 起）[^tails]，要在電話裡核對一長串金鑰指紋時，把數字唸成字也比唸數字不容易出錯（PGP word list 的既有做法）[^pgpwords]。

這套做法有個名字，叫 Diceware，由 Arnold Reinhold 在 1995 年提出[^reinhold]。原理很單純，每個字配一組骰子點數，擲骰得到的數字去查表，查到的字就是密語的一部分，重複幾次組成一句。亂數來自真實的擲骰、不經過你的手，所以結果無法被你的習慣或偏好猜中。EFF 在 2016 年發布的 7776 字詞表，挑字時避開難拼字、髒話、容易混淆的同音字，是目前最常被推薦的英文版本[^eff]。我們做的，就是同一套做法、帶亞洲味的版本。

## 我們做了什麼：帶亞洲味的英文字典

asian-diceware 是一份 7776 字、與 EFF 相容的密語詞表，可以當成 EFF Large Wordlist 的直接替代品，安全性與可用性對齊。差別在用字，我們固定收錄 161 個有字典背書（OED、Merriam-Webster、Cambridge 查證）的亞洲外來語，其餘用最高頻、好拼寫的常見英文字填滿。

這些外來語對台灣與亞洲讀者特別好認：`tofu`、`ramen`、`miso`、`matcha`、`karaoke`、`tsunami`、`kimchi`、`bibimbap`、`typhoon`、`oolong`、`yoga`、`karma`、`curry`、`mango`。其中有不少台灣與華語圈的味道：`oolong`（烏龍茶）、`boba`（珍珠奶茶，源自台灣）、`ketchup`（源頭可追到閩南語）、`pinyin`（拼音）。也有一些你可能沒發現是亞洲外來語的字，像 `shampoo`、`bungalow`、`jungle`、`gecko`、`bazaar`、`guru`。

選字有兩個刻意的限制。第一，外來語一律收已經進英文字典的單一英文 token，不收 `feng shui`、`kung fu`、`dim sum` 這類有空格的詞。第二，我們不自己音譯華語，因為台灣同時有漢語拼音、威妥瑪、通用拼音幾套標準，拼法會打架，所以只收英文拼法已被字典固定下來的字。

這份詞表開源（程式碼採 MIT、詞表資料採 CC-BY-4.0），原始碼與完整詞表在 [GitHub anoni-net/asian-diceware](https://github.com/anoni-net/asian-diceware){target="_blank"}。詞表的功能是讓抽字這一步更好認好記，本身不涉及加密。真正的安全來自你如何產生、保管與使用密語。

## 如何使用

擲骰子查表是最直覺的方式，一把骰子加一張表就能開始，不必懂程式。要查的那張表有兩種取得方式。印一本 A5 小冊最方便（[直接下載 PDF](https://assets.anoni.net/file/asian_diceware_7776_booklet_a5_v0.3.1.pdf){target="_blank"}，更多說明見下方〈[印一本小冊帶著走](#印一本小冊帶著走)〉），或直接開啟 GitHub 上的 dice 檔 [`asian_diceware_7776_dice.txt`](https://raw.githubusercontent.com/anoni-net/asian-diceware/main/output/asian_diceware_7776_dice.txt){target="_blank"}。

**方法一，用實體骰子查表：**擲 5 顆骰，由左到右讀成一個五位數（每顆 1 到 6）。那張表是照代碼從小到大排列的，翻到、或用搜尋找到開頭是你這五位數的那一行，後面接的字就是抽到的字。重複 6 次，把 6 個字用 `-` 接起來。例如擲出 `6 3 4 4 4`，讀成 `63444`，查到 `tofu`。

沒有骰子也不必卻步。五顆骰子很便宜，文具店、超商、桌遊店都買得到，網路上幾十元就有一組，臨時沒有也能向人借，或用離線的擲骰 app（使用前先關閉網路）。骰子加一張表（印一本小冊就好）就是完整的做法，全程不需要電腦。真的想跳過擲骰、又懂一點程式，才需要看下面的捷徑。

??? note "給會寫程式的人：不用骰子的兩種捷徑"
    Python 的 `secrets` 是密碼學安全亂數，適合用來抽字。

    ```python
    import secrets

    words = open("asian_diceware_7776.txt").read().split()
    assert len(words) == 7776
    phrase = "-".join(secrets.choice(words) for _ in range(6))
    print(phrase)        # 例如 tofu-ramen-bazaar-oolong-gecko-haiku
    ```

    請用 `secrets`，不要用 `random`，後者不是密碼學安全的，產出的密語可能被預測。

    不必 clone，也可以直接下載 GitHub 上發布的詞表來抽字：

    ```bash
    curl -s https://raw.githubusercontent.com/anoni-net/asian-diceware/main/output/asian_diceware_7776.txt \
      | python3 -c "import secrets,sys;w=sys.stdin.read().split();print('-'.join(secrets.choice(w) for _ in range(6)))"
    ```

詞表有兩種大小，正式用途一律用預設的 `7776`（每字擲 5 顆骰）。另一份 `1296` 是它的子集、只要 4 顆骰，清單較短、適合測試、示範、教學。兩份的骰子代碼不同，用哪一份就查哪一份的表，不要拿錯。

網站若要求數字或符號，加入一個即可。想更強就多加幾個字，每多一個字就難猜得多。

## 哪些情況下使用

密語不只用來登入，這份「號碼對字」的表還能用在許多地方。

!!! note "還沒用密碼管理器？先把最重要的幾個帳號換成密語"
    我們還是建議用密碼管理器，它能為每個網站各產生一組不重複的隨機密碼。但如果你一時還跨不過那道門檻，也別因此就放棄加強密碼。至少把最重要的幾個帳號（電子郵件、能重設其他帳號的那一個、網銀）各設一組不重複的密語、記在腦中，這不靠管理器也做得到，而且比多數人慣用的密碼強得多。密語解決不了「幾十個網站各要一組不重複密碼」的問題，那是密碼管理器的工作。可以先把這幾個重要帳號改成密語，之後有機會再導入密碼管理器。

- **密碼管理器的主密碼：**主密碼是整套密碼系統的單一支點，值得用一組好記又夠強的密語。其餘每個網站的密碼交給管理器產生隨機長密碼即可，細節見 [密碼管理器入門](./password-manager.md)。
- **要自己手動輸入的密碼：**家裡 Wi-Fi 密碼、電視或遊戲主機上登入串流帳號、與家人共用的裝置，這些得一個字一個字敲進去的場合，一串亂碼很難輸入，密語好輸入又好唸。
- **加密磁碟、備份與金鑰的口令：**全碟加密、加密備份、PGP 私鑰這類「打錯就解不開、外洩就全暴露」的口令，適合用密語。
- **把號碼唸成字、不會聽錯：**要核對金鑰指紋、安全碼這類一長串數字時，先用這張表把號碼換算成字，唸字比唸數字不容易出錯。這也是 PGP word list 的做法[^pgpwords]。
- **和信任的人約定暗號：**把詞表當成只有你們懂的暗號本，用來確認身分或傳遞約定好的訊號，展開見下一節〈和信任的人約定一組暗號本〉。

## 六個字大概多強

六個隨機字串成的密語，強度與一串你根本記不住的亂碼相當，攻擊者只能逐一嘗試，幾乎試不完。EFF 把六個字訂為一般用途的基本建議，主密碼這種最重要的，可以增加到七、八個字。

如果你平常習慣 12 到 16 字元的密碼，可以這樣對照（左欄假設是密碼管理器產生的真隨機字串，含大小寫、數字與符號）：

| 隨機字元密碼 | 強度相當的 Asian Diceware 密語 |
|---|---|
| 12 字元 | 6 個字 |
| 14 字元 | 7 個字 |
| 16 字元 | 8 個字 |

到同樣強度，兩種方式相當，差別在於好不好記。12 到 16 字元的真隨機字串記不起來，需要靠密碼管理器保存。六到八個密語字達到一樣的強度，你卻記得住、也打得出來。密語適合少數必須用腦記的密碼（密碼管理器的主密碼、磁碟加密口令），其餘每個網站交給管理器產生隨機字元密碼即可，見 [密碼管理器入門](./password-manager.md)。主密碼與磁碟加密口令這兩種，密碼管理器本身幫不上忙，主密碼不能存進它自己保管的金庫，開機解碟也在管理器啟動之前。所以無論你用不用管理器，這份詞表都會派上用場。

上面的強度，你用骰子或程式擲出來的密語就算數，照這篇的方法做即可。要避免的是自己挑字、或把抽到的字改成順口的句子，那會讓強度大打折扣。自己憑空想的密碼（把 a 換成 @、字尾加個 1 那種）也因為有規律可循，通常比表上的數字弱得多。

??? note "想看背後的數字"
    密語的強度看「熵」（entropy，可以理解成攻擊者要猜中得試多少種可能）。每個字從 7776 個裡隨機抽，貢獻 `log2(7776)` ≈ 12.925 bits，六個字約 77.5 bits，等於 2 的 77.5 次方種組合[^eff]。即使一台機器每秒能試幾千億組（實際速率因雜湊演算法與硬體而差異很大）[^proton]，平均也要上千年才試得到。每多一個 `7776` 的字，多約 12.9 bits。

    含位元數的完整對照（字元密碼假設約 94 種可打字元）：

    | 隨機字元密碼 | 熵 | Asian Diceware 密語 | 熵 |
    |---|---|---|---|
    | 12 字元 | 約 79 bits | 6 個字 | 約 77.5 bits |
    | 14 字元 | 約 92 bits | 7 個字 | 約 90.5 bits |
    | 16 字元 | 約 105 bits | 8 個字 | 約 103 bits |

    自己想的密碼有規律可循，實際熵往往遠低於同長度的真隨機密碼。

## 隨機性才是關鍵

詞表再好，抽字若不夠隨機，整組密語就不堪一擊。

- **一定用真亂數：**實體骰子，或密碼學安全的亂數（Python 的 `secrets`、`/dev/urandom`）。不要用 `random` 這類非密碼學安全的亂數，不要自己挑字，也不要挑「看起來很隨機」的字。人挑的字猜起來容易得多。
- **不要改成有意義的句子：**抽到 `tofu-ramen-gecko` 覺得不順，想調成一句通順的話，這個動作會破壞隨機性。順序與用字都照抽到的結果。
- **不要重用：**一組密語只用在一個地方，主密碼尤其不能與任何其他服務共用。除非可能外洩，否則不必定期更換，頻繁換反而容易換成記不住、或偷懶重用。日後某個服務傳出外洩，再換掉那一個帳號的密語即可。
- **產生後立刻收好：**別截圖存在雲端相簿，別貼到聊天室。產出後立刻存進密碼管理器金庫，或寫在紙上鎖好。擲骰時也留意身後是否有人窺看（肩窺）。

## 和信任的人約定一組暗號本

想提升日常密碼的強度，讀到上一節就夠了。這節介紹這份詞表的進階用法，給有需要的人。

這份骰子表本質上是一份「號碼對字」的對照本，所以除了產密語，也能用來和信任的人約定一套只有你們懂的暗號。事先當面約定哪個字代表什麼意思，之後在公開管道（電話、簡訊、社群私訊）報那個字，旁人看到的是一個再普通不過的英文字，你們卻知道它代表什麼。

!!! warning "先認清它的界線"
    這種暗號是混淆，不是加密。它能擋住隨意旁觀的人，擋不過會把訊息錄下來慢慢比對、或事後取得你們約定內容的對手，更擋不住國家級的監控。內容確實不能外洩、或人身安全要靠它，就不要只靠它，務必搭配端對端加密的工具（見 [匿名通訊工具比較](./messaging-comparison.md)、[端對端加密如何運作](../advanced/e2ee.md)）與完整的安全計畫。下面的用法都建立在這個前提上。

日常、低風險的用法：

- **確認對方是不是本人：**見面時一起擲一組字、各自記住，日後在電話或訊息裡互報，確認沒被冒充。最好一次性使用，或分開報（你報前三個字，對方回後三個字）。
- **給人、檔案、專案取中性代號：**公民團體與記者常要替消息來源、敏感檔案、進行中的專案命名。用隨機抽的字當代號，比「某官員爆料檔」這種一看就懂的名字更不容易洩露線索，名單萬一被看到也猜不出對應誰。

下面幾種用在高風險的人身上，更要記得上面那則界線，暗號只是輔助，真正的內容與行蹤靠加密工具與安全計畫保護：

- **記者和消息來源的接頭信號：**第一次見面時約定幾個字，例如某個字代表「現在方便、可以聯絡」，另一個代表「我被盯上了，先別找我」。日後一通電話說一個字就帶過，不必在不安全的管道說白話。對應 [記者保護消息來源](../scenarios/journalist.md)。
- **行動現場的報平安與求救字：**社運行動者、選舉觀察員出勤時，向後勤約定一個報平安的字，定時回報。需要時換成另一個字，等於「情況不對，啟動應變」。因為字會換，逼你回報的人也無從假冒。對應 [社運行動者的數位準備](../scenarios/activist.md)、[選舉觀察員的自保](../scenarios/election-observer.md)。
- **危險關係裡的求救暗號：**正在脫離加害者的人，可以和信任的朋友約定一個求救字，傳出去就代表「請打給我」或「請報警」，不必在可能被翻看的手機上留下明顯字句。對應 [家暴受害者的數位準備](../scenarios/domestic-violence.md)。

想讓暗號本可靠，有幾點要記住。約定的意思當面說、別寫在會被翻閱的地方。用在小範圍、知道的人越少越安全。能換就換，尤其當你懷疑暗號可能被識破時。同一個字不要又當密語又當暗號，兩種用途分開。

## 印一本小冊帶著走

我們把 7776 詞表排成一本 A5 擲骰查表小冊，含封面、使用教學、QR 與版權頁。這就是上面〈如何使用〉方法一要查的那張表的紙本版，不必安裝程式、只想擲骰的人，印一本就能上手。

社群參加工作坊、小聚、研討會這類實體活動時，也會帶幾本印好的小冊到現場發送。如果你在活動裡拿到一本、或剛好遇到我們，非常歡迎過來聊聊，問密語、問匿名網路，或只是打聲招呼都可以。想知道我們最近會出現在哪，見 [活動參與](../activity/index.md)。想直接找我們，可以到社群的 Matrix（入口見 [社群自架服務](../community/tools.md)），或 [持續關注](../contact.md) 我們的後續消息。

!!! tip "下載 A5 小冊（PDF）"
    [asian_diceware_7776_booklet_a5_v0.3.1.pdf](https://assets.anoni.net/file/asian_diceware_7776_booklet_a5_v0.3.1.pdf){target="_blank"}（約 36 頁，用家裡或便利商店的印表機印 A4、對折成冊即可）。詞表資料採 CC-BY-4.0，歡迎自行列印、發放與再利用，請保留版權頁的出處標註。

## 我們想做的匿名服務平台

社群接下來也想做一個類似 [AnonTicket](https://anonticket.torproject.org/){target="_blank"} 的匿名服務平台（還在規劃階段）。AnonTicket 是 Tor Project 的匿名服務，讓人不必透露身分就能匿名向 Tor 的 GitLab 提交問題回報，用系統產生的一組隨機英文字代碼辨識身分，而非 email。這種帳號代碼正是從隨機詞表抽字組成的，這份 asian-diceware 詞表就是為了當未來這類服務的代碼字源而準備。AnonTicket 本身如何用在與 Tor 上游協作，見 [Tor Project 生態與對接](../community/tor-project-ecosystem.md)。

## :material-chat-question: 一同瞭解

<div class="grid cards" markdown>

- [:material-key-variant: 密碼管理器入門](./password-manager.md)
- [:material-chat-question: 威脅模型如何建立](../basics/threat-model.md)
- [:material-lock-outline: 端對端加密如何運作](../advanced/e2ee.md)

</div>

## :fontawesome-solid-diagram-project: 下一步可參與的專案

<div class="grid cards" markdown>

- [:material-source-branch: Tor Project 生態與對接](../community/tor-project-ecosystem.md)
- [:material-translate-variant: 中文化與文件翻譯](../community/i18n.md)
- [:material-hand-coin-outline: 匿名支付研究專題](../community/payments-research.md)

</div>

[^bip39]: [BIP-39: Mnemonic code for generating deterministic keys](https://github.com/bitcoin/bips/blob/master/bip-0039/bip-0039.mediawiki){target="_blank"} - Bitcoin Improvement Proposals（含多語詞表，繁體中文涵蓋台灣、香港、澳門）
[^pwmgr]: [Bitwarden Passphrase Generator](https://bitwarden.com/password-generator/){target="_blank"} 與 [1Password Password Generator](https://1password.com/password-generator/){target="_blank"}
[^anonticket]: [Anonymous GitLab Ticketing: An Exciting New Project at Tor](https://blog.torproject.org/anonymous-gitlab/){target="_blank"} - The Tor Project
[^securedrop]: [SecureDrop](https://securedrop.org/){target="_blank"} - Freedom of the Press Foundation
[^xkcd]: [Password Strength（xkcd 936）](https://xkcd.com/936/){target="_blank"} - xkcd
[^tails]: [Creating the Persistent Storage](https://tails.net/doc/persistent_storage/create/){target="_blank"} - Tails
[^eff]: [EFF Dice-Generated Passphrases](https://www.eff.org/dice){target="_blank"} - Electronic Frontier Foundation
[^reinhold]: [The Diceware Passphrase Home Page](https://theworld.com/~reinhold/diceware.html){target="_blank"} - Arnold G. Reinhold
[^proton]: [What is password entropy?](https://proton.me/blog/what-is-password-entropy){target="_blank"} - Proton
[^pgpwords]: [PGP word list](https://en.wikipedia.org/wiki/PGP_word_list){target="_blank"} - Wikipedia
