---
title: 出國前數位安全：用 AI 自助產生目的地概況
description: 複製這些 prompt 去問你自己的 AI，出發前先摸清目的地的網路審查、法律、SIM 與緊急聯絡。適用任何國家，你的查詢不會經過我們。
icon: material/shield-airplane-outline
---

# :material-shield-airplane-outline: 出國前數位安全：用 AI 自助產生目的地概況

出國前你會查簽證、插頭、換匯，但很少有人查「我要去的地方，網路被怎麼管？我的工作在那裡合不合法？出事找誰？」對記者、人權工作者、NGO 成員、研究者與社運參與者來說，這些才是真正影響安全的問題。

這一頁**不是**一份各國資料表。那種預先整理好的版本請看 [出差與研討會的數位準備（東亞與東南亞）](./asia-travel.md)。這一頁適用**任何目的地**：我們給你一組可複製的提問（prompt），你把它貼進**自己的 AI**，由 AI 幫你產生一份行前的數位與人身安全概況。

!!! note "為什麼是『複製 prompt』而不是線上查詢工具"
    我們刻意**不**做成一個「輸入目的地就回答」的服務。因為對這群使用者來說，「我要去 X 國、我是記者、日期是 Y」這組查詢本身就是敏感情資，放上任何伺服器都會被 log、可能被調閱或外洩。改成你複製文字、回去問**自己的** AI，**你的目的地與身分就不會經過我們**。代價是答案的品質取決於你用哪個 AI，所以請務必對照本頁底部的「一手來源」自行核對。

## 怎麼用

1. **只填一次**：在「開場 prompt」裡把 `{出發地}`、`{目的地}`、`{停留天數}` 換成你的資訊（日期與身分可留白），貼給 AI。
2. **問題直接複製**：下面的調查項目不用再改字，逐項複製貼上即可，AI 會記得開場設定的目的地與出發地。
3. **自己驗證**：拿 AI 的答案去對照本頁底部的一手來源，**別盲信**。

!!! warning "AI 會編造電話、法條與費率"
    語言模型很會「講得很有把握其實是錯的」。把 AI 的回答當成「我接下來該查哪些東西」的起點，不要當成最終答案。尤其是緊急電話、法條編號、簽證規則與資費，**一定**回到官方一手來源核對。

!!! tip "貼進雲端 AI 仍會洩漏給該供應商"
    就算不經過我們，把 query 貼進雲端 AI（ChatGPT、Claude、Gemini 等）還是會讓那家供應商看到。**目的地敏感**時，建議用本地、自架模型，或至少用下方「低資料版」開場 prompt，只填到國家層級、不要寫自己的名字、組織、精確日期。

## 開場 prompt（先貼這個設定 AI 角色）

=== "完整版（自架、本地 AI）"

    ```text
    你是一位協助公民社會工作者（記者、人權工作者、NGO 成員、研究者、社運參與者）
    做出國前數位與人身安全評估的助理。

    我即將從 {出發地} 前往 {目的地}，停留約 {停留天數} 天。
    （可選）期間大約是 {日期區間}；我的工作性質是 {可留白}。

    接下來我會逐項貼上問題。問題裡不會再重複目的地與出發地，一律以上面這段為準。
    每一項請：
    1. 盡量引用可查證的一手來源（OONI、Tor Metrics／Onionoo、Access Now、雙方
       外交部、RSF、Freedom House、CIVICUS 等），附上連結與資料時間。
    2. 明確區分「有來源的事實」與「你的研判推測」。
    3. 不確定就說不確定——不要編造電話號碼、法條編號或費率。
    4. 每一項結尾用一句話總結「所以我該做什麼」。
    ```

=== "低資料版（雲端 AI）"

    ```text
    你是一位協助公民社會工作者做出國前數位與人身安全評估的助理。
    我要前往 {目的地}（國家層級即可），停留時間以「短期停留」為準。
    我不會提供姓名、組織或精確日期。

    接下來我會逐項貼問題。問題裡不會再重複目的地，一律以上面這段為準。
    每一項請引用可查證的一手來源並附連結、區分事實與研判、
    不確定就說不確定、結尾給一句行動建議。
    ```

## 調查項目（逐項複製）

### 一、數位環境：審查、Tor、VPN、設備搜查

```text
【數位環境 1／審查與封鎖】請查 OONI Explorer 關於目的地最近 6–12 個月的
量測：Tor、Signal、WhatsApp、Telegram、主流 VPN（如 ProtonVPN）、獨立新聞
與人權網站，是否出現 DNS／TCP／HTTP 封鎖或 anomaly？列出 confirmed／anomaly
與發生時間，並附 OONI Explorer 連結。
```

```text
【數位環境 2／Tor 可達性】目的地目前有多少運作中的 Tor relay 與 bridge、
總頻寬大約多少（參考 Tor Metrics／Onionoo）？據此判斷 Tor 能否直接連線，
或需要 obfs4／Snowflake／WebTunnel 等 pluggable transport。給我落地後的
連線策略與備援順序。
```

```text
【數位環境 3／VPN 合法性與可用性】在目的地使用 VPN 是否合法？WireGuard、
OpenVPN 等協定是否被封鎖或限速？是否只允許政府核可的 VPN？出發前該先裝好
哪些、並準備哪些備援？
```

```text
【數位環境 4／邊境與設備搜查】入境目的地時，海關是否可能搜查手機、筆電，
或要求登入社群帳號？當地是否有強制交出密碼或加密金鑰的法律？持有或使用
加密通訊 app 是否違法？是否有記者或人權工作者被拒入境、被拘留的紀錄？
```

```text
【數位環境 5／網路關閉風險】目的地過去是否發生過 internet shutdown 或
頻寬限速（參考 Access Now #KeepItOn）？若我停留期間與選舉、抗議或敏感
紀念日重疊，封鎖升高的風險如何？我該預先準備哪些離線備援？
```

### 二、法律與政治風險

```text
【法律與政治 6／旅遊警示】我出發地的外交部（領事事務局）目前對目的地發布
的旅遊警示燈號是什麼？對照美國國務院、英國 FCDO 的 advisory 現況。近期是否
有政治動盪、抗議或衝突？附官方連結與更新日期。
```

```text
【法律與政治 7／對我角色的法律風險】針對記者／NGO／行動者，目的地的法律
環境如何？請參考 RSF 新聞自由指數、Freedom House「Freedom on the Net」、
CIVICUS Monitor 評級。是否有 foreign-agent／NGO 註冊法、誹謗或冒犯王室／
褻瀆宗教罪、集會限制？哪些我習以為常的活動在當地可能觸法？
```

```text
【法律與政治 8／入境與身分】持我出發地的護照入境目的地，簽證或電子旅行
許可（ETA／ETIAS 等）要求為何？以我的停留天數計算，是否在免簽額度內？
出發地與目的地的外交關係是否會影響我能得到的領務協助？
```

### 三、連線與通訊（SIM、eSIM）

```text
【連線與通訊 9／SIM 與 eSIM】在目的地購買實體 SIM 是否需要實名登記
（護照／生物辨識）？依我的停留天數與出發地，建議用區域型或單國 eSIM
（如 Airalo）還是原號漫遊？請列幾個方案、大概價格與接取的當地電信，並
提醒：語音盡量走 Signal／WhatsApp 等 VoIP，少用傳統漫遊通話。
```

### 四、緊急聯絡與支援網絡

```text
【緊急聯絡 10／領務代表處】我出發地在目的地的代表處／大使館的「急難救助」
24 小時電話、一般聯絡電話、地址與上班時間為何？若目的地沒有設館，最近的
兼轄館處是哪一個？請整理成可抄寫的格式。
```

```text
【緊急聯絡 11／數位安全與在地支援】請列出 Access Now Digital Security Helpline
的聯絡方式（24/7、多語、help@accessnow.org，會在兩小時內回覆）。目的地有
哪些在地的數位人權、記者保護或法律支援組織？裝置被扣或帳號被攻擊時該找誰？
```

```text
【緊急聯絡 12／當地緊急號碼與法律援助】目的地的報案、救護、消防號碼各是
什麼？若被攔查或拘留，有哪些當地的法律援助或律師熱線可即時聯繫？
```

### 五、實體與監控環境（選用）

```text
【實體環境 13／監控與治安（選用）】目的地的公共監控程度如何（CCTV、
人臉辨識）？警方對集會、街頭拍攝的態度為何？哪些區域或行為對我這類工作者
風險較高、應該避免？
```

## 把結果整理成一張隨身緊急卡

跑完上面幾項後，把關鍵聯絡抄成一張卡片，印出來過塑、皮夾與行李各放一張，並同步存進手機離線筆記與（若你用）Tails。下面是空白模板：

```text
【數位安全事件】Access Now Digital Security Helpline（24/7・多語）
  help@accessnow.org

【領務｜{目的地}】{出發地} 駐 {目的地} 代表處
  急難 24h：________________（限車禍／搶劫／生命安危）
  一般：    ________________（上班時間 ______）
  地址：    ________________

【{出發地} 外交部 24h 緊急聯絡中心】
  ________________

【當地 報案／救護／消防】________ ／ ________ ／ ________

【在地數位／法律支援】________________________
```

## 一手來源（請自行核對 AI 的答案）

- **OONI Explorer**（各國網路審查、封鎖量測）：<https://explorer.ooni.org/>{target="_blank"}
- **Tor Metrics**（Tor relay、bridge、各國連線數）：<https://metrics.torproject.org/>{target="_blank"}（anoni 自己的 [Tor relay watcher](../taiwan/tor-relay-watcher.md) 也用同一套 Onionoo 資料）
- **Access Now Digital Security Helpline**（24/7 數位安全求助）：<https://www.accessnow.org/help/>{target="_blank"}
- **Access Now #KeepItOn**（網路關閉追蹤）：<https://www.accessnow.org/keepiton/>{target="_blank"}
- **你的國家外交部、領務局**：旅遊警示與駐外館處急難電話（台灣：[外交部領事事務局](https://www.boca.gov.tw/){target="_blank"}）
- **RSF 新聞自由指數**：<https://rsf.org/en/index>{target="_blank"}
- **Freedom House「Freedom on the Net」**：<https://freedomhouse.org/report/freedom-net>{target="_blank"}
- **CIVICUS Monitor**（公民社會空間評級）：<https://monitor.civicus.org/>{target="_blank"}
- **EFF Surveillance Self-Defense**：<https://ssd.eff.org/>{target="_blank"}
- **Front Line Defenders**：<https://www.frontlinedefenders.org/>{target="_blank"}

## 延伸閱讀

- [出差與研討會的數位準備（東亞與東南亞）](./asia-travel.md)：14 地的預填對照表，本頁是它的「任何目的地」通用版。
- [威脅模型](../basics/threat-model.md)：先想清楚對手是誰、能拿到什麼。
- [什麼是 OONI](../tools/what-is-ooni.md)、[什麼是 Tor](../tools/what-is-tor.md)、[Snowflake](../tools/tor-snowflake.md)、[通訊軟體比較](../tools/messaging-comparison.md)

---

這一頁給的是「該問的問題」，不是現成答案。若你有特定目的地的實地經驗想補進來，歡迎到 [Matrix 公開 room](../community/tools.md) 討論，或匿名寄到 [whisper@anoni.net](mailto:whisper@anoni.net)。
