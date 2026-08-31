/*
 * 斷網應變卡產生器（utils/shutdown-card.md）。
 *
 * scenarios/shutdown.md 的「與人事先約好的事」列了五項要在還連得上的時候談好：
 * 誰、用什麼管道、聯絡不上時去哪裡找、如何確認是本人、多久沒消息就啟動。這一頁
 * 把那幾項變成可以填、可以印、可以裁開分給其他人的一張卡。
 *
 * 約定是三到五個人共有的，每個人手上都要有一份，所以列印版面是一張 A4 印四張
 * 一樣的卡，印完裁開分掉。
 *
 * === 為什麼可以暫存 ===
 *
 * 這一區其他工具刻意什麼都不存，這一頁不同。八個欄位填到一半切走、回來全空的
 * 工具沒有人會用第二次，而沒有人填的應變卡，安全效益是零。
 *
 * 做法照 offline.md 那一套：存了什麼看得到、隨時清得掉、還有一個開關。預設是
 * 關掉分頁就消失的那種暫存，想留到隔天要自己去開，也可以整個關掉。目前是哪一種
 * 常駐顯示在表單上方，旁邊就是清除按鈕。
 *
 * === 這一頁不做的事 ===
 *
 * 不把卡片內容變成 QR。QR 是明文，印在紙上等於任何人拍到就讀走整張關係圖。
 * 頁面上的 QR 只用來指向這一頁本身，那是 utils/qrcode.md 的工作。
 *
 * 輸出的純文字裡不放站名與網址。卡片會被放進皮夾，上面多一行來源，等於替撿到的
 * 人指出這張紙是什麼。
 *
 * 除了兩種瀏覽器 Storage 之外，這支程式不寫入也不送出任何東西：沒有 fetch、沒有
 * XMLHttpRequest、沒有 sendBeacon、沒有 cookie。tools/test_shutdown_card.mjs 掃
 * 原始碼守著這件事，也守著模式開關真的管得住每一次寫入。
 *
 * 三個語系共用這一份，docs/en/js/ 與 docs/zh-CN/js/ 底下是指向這裡的 symlink。
 * 純邏輯由 tools/test_shutdown_card.mjs 原地抽出來測。
 */
(function () {
  "use strict";

  // --- 純邏輯（tools/test_shutdown_card.mjs 從這裡原地抽出來測）---

  const STORAGE_KEY = "anoni-shutdown-card-draft";

  // 三態。session 是預設，關掉分頁就沒了。device 要使用者自己去開。off 全程不寫。
  const MODES = ["session", "device", "off"];

  // 時間界線分兩段，照 Rory Peck Trust 的 Communications Plan 範本：先「開始準備」，
  // 再「正式啟動」。單一門檻的問題是超過那個時間之後只有兩種狀態，而真實情況裡
  // 中間那段是「先聯絡看看、先確認行程、先別驚動任何人」。
  //
  // 24 小時那一檔有出處：CPJ 對多日出差的建議是每 24 小時回報一次。其餘幾檔沒有
  // 文獻對應，業界的主流做法是行前跟指定聯絡人談定，所以留一個自訂。
  const TRIGGERS = [
    { id: "h6" },
    { id: "h12" },
    { id: "d1" },
    { id: "d3" },
    { id: "custom" },
  ];

  // 管道分類。四份都是啟發式判斷，只用來提醒，不擋任何輸入。
  //
  // mesh 與廣播單獨列出來，因為它們最容易被填在備援欄而使用者以為安全：
  // 藍牙 mesh 單跳約一百公尺，要靠人群密度接力，只在示威現場那種場合有效，
  // 聯絡分散在城市各處的人不適用（Bridgefy 的加密宣稱另外被 USENIX Security
  // 2022 的逆向分析推翻）。廣播是單向的，收得到廣播跟聯絡得到人是兩件事。
  const ONLINE_CHANNELS = /signal|telegram|whatsapp|wechat|微信|messenger|facebook|instagram|threads|discord|matrix|element|wire|keybase|skype|zoom|teams|slack|line|imessage|gmail|mail|郵件|信箱|臉書|推特|twitter|私訊|站內信|视频通话|視訊|網路電話|voip|zello|starlink/i;
  const MESH_CHANNELS = /bridgefy|briar|firechat|meshtastic|mesh|藍牙|蓝牙|bluetooth|airdrop|隔空投送/i;
  const BROADCAST_CHANNELS = /廣播|广播|收音機|收音机|短波|中波|shortwave|toosheh|電視|电视/i;
  const OFFLINE_CHANNELS = /面交|當面|见面|見面|碰面|門鈴|按鈴|住處|家裡|家里|辦公室|办公室|紙條|纸条|留言板|布告欄|電話|电话|市話|市话|座機|座机|固话|簡訊|短信|sms|無線電|无线电|對講機|对讲机|walkie|收發報|衛星電話|卫星电话|satellite phone|信件|郵寄|邮寄|in person|face to face|door|paper|note|landline|phone call/i;

  // 欄位分兩層，這個分層本身就是設計主張。
  //
  // card 那層會印在隨身卡上，資訊密度要低到卡片被撿到也拼不出一張關係圖：代號、
  // 管道、一個會合點、兩段時間。plan 那層留在完整計畫裡，交給約定中的指定聯絡人
  // 保管或自己加密存放，不建議印出來隨身帶。
  //
  // 分層的理由是分艙：專業範本（Rory Peck Trust 的 Communications Plan 與 Proof of
  // Life 是兩份獨立文件）與二戰反抗組織的做法一致，都不把「這是誰」跟「怎麼證明
  // 是這個人」放在同一份會被搜到的物件上。
  const FIELDS = [
    { id: "label", layer: "card", kind: "text" },
    { id: "date", layer: "card", kind: "text" },
    {
      id: "contacts",
      layer: "card",
      kind: "repeat",
      min: 3,
      max: 5,
      parts: ["codename", "primary", "backup"],
      planParts: ["role", "reach"],
    },
    { id: "meetPlace", layer: "card", kind: "text" },
    { id: "meetWindow", layer: "card", kind: "text" },
    { id: "triggerPrepare", layer: "card", kind: "choice", custom: "triggerPrepareCustom" },
    { id: "triggerActivate", layer: "card", kind: "choice", custom: "triggerActivateCustom" },
    { id: "steps", layer: "plan", kind: "multiline" },
    { id: "decider", layer: "plan", kind: "text" },
    { id: "verify", layer: "plan", kind: "multiline", sensitive: true },
    { id: "avoid", layer: "plan", kind: "multiline" },
  ];

  // 隨身卡放得下多少內容。A6 卡片扣掉邊界之後內容寬約 85mm，8.5pt 的等寬字下
  // 一行大約是 CARD_LINE_UNITS 個半形單位（中文字算兩個），高度大約放得下
  // CARD_MAX_LINES 行。超出的部分被裁掉，而畫面上的預覽看不出來，印出來才發現
  // 最後幾行不見了。
  //
  // 這裡估的是折行之後的視覺行數，不是換行符號的數量。備援管道寫成一句完整的話
  // （「到住處樓下按門鈴，門牌是三樓之二」）就會佔掉兩行，只數換行符號的話這種
  // 內容永遠不會被判定為超出。估得準不準由 tools/check_shutdown_card.mjs 在真的
  // 瀏覽器裡量一次校準。
  // 這兩個數字由 tools/check_shutdown_card.mjs 在 A4 尺寸的視窗下量出來：卡片扣掉
  // 內距之後可用高度 454px、行高 18.1px，放得下 25 行。
  //
  // 一行的寬度不能用「內容寬 352px 除以字級 11.3px」去算，那樣會得到 31 個中文字，
  // 而實測是 22 個。等寬字族在中文字上會 fallback 到別的字型，字寬比字級大。
  // 44 是實測折算回來的值，同一份內容估出來的行數跟瀏覽器量到的一致。
  //
  // 上限取 22 而不是 25，留三行的餘裕給不同系統的字型差異。
  const CARD_LINE_UNITS = 44;
  const CARD_MAX_LINES = 22;

  // 全形字佔兩個半形單位。這個範圍涵蓋中日韓文字、全形標點與假名
  function visualWidth(text) {
    let units = 0;
    for (const ch of String(text)) {
      units += /[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/.test(ch) ? 2 : 1;
    }
    return units;
  }

  // 卡片實際會佔幾行，含折行
  function cardHeight(state, t) {
    return cardLines(state, t).reduce(
      (sum, line) => sum + Math.max(1, Math.ceil(visualWidth(line) / CARD_LINE_UNITS)), 0);
  }

  const clean = (value) => (typeof value === "string" ? value.trim() : "");

  function emptyState() {
    const contacts = FIELDS.find((field) => field.id === "contacts");
    const state = {
      mode: MODES[0],
      label: "",
      date: "",
      contacts: [],
      meetPlace: "",
      meetWindow: "",
      triggerPrepare: "",
      triggerPrepareCustom: "",
      triggerActivate: "",
      triggerActivateCustom: "",
      steps: "",
      decider: "",
      verify: "",
      avoid: "",
    };
    for (let i = 0; i < contacts.min; i += 1) {
      state.contacts.push({ codename: "", primary: "", backup: "", role: "", reach: "" });
    }
    return state;
  }

  // 有填任何一欄就算一筆。整筆空白的那幾列在輸出與提醒裡都不算數。
  function filledContacts(state) {
    const rows = Array.isArray(state.contacts) ? state.contacts : [];
    return rows.filter((row) => row && (clean(row.codename) || clean(row.primary)
      || clean(row.backup) || clean(row.role) || clean(row.reach)));
  }

  // 每一種模式各自寫到哪裡、要清掉哪裡。認不得的模式一律當成不寫，
  // 壞掉的草稿不該讓資料落到使用者沒有選的地方。
  function storagePlan(mode) {
    if (mode === "session") return { write: "session", clear: ["local"] };
    if (mode === "device") return { write: "local", clear: ["session"] };
    return { write: null, clear: ["session", "local"] };
  }

  // 儲存被瀏覽器擋掉是常態，不是例外。Safari 的私密瀏覽與部分企業設定會讓
  // removeItem 直接丟例外，而這一頁的使用者本來就偏向把瀏覽器鎖緊。
  function drop(store) {
    if (!store) return;
    try {
      store.removeItem(STORAGE_KEY);
    } catch (err) {
      // 擋掉就算了，本來就沒有寫成功過
    }
  }

  function saveDraft(state, stores) {
    const plan = storagePlan(state && state.mode);
    for (const name of plan.clear) drop(stores[name]);
    if (!plan.write || !stores[plan.write]) return false;
    try {
      stores[plan.write].setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (err) {
      return false;
    }
  }

  // 讀回草稿時 localStorage 優先。使用者主動留下的那一份，比分頁裡的暫存更接近
  // 他要的東西，而模式跟著草稿一起存，讀回來就知道當初選的是哪一種。
  function loadDraft(stores) {
    for (const name of ["local", "session"]) {
      const store = stores[name];
      if (!store) continue;
      let raw = null;
      try {
        raw = store.getItem(STORAGE_KEY);
      } catch (err) {
        continue;
      }
      if (!raw) continue;
      try {
        const data = JSON.parse(raw);
        if (data && typeof data === "object") return data;
      } catch (err) {
        // 壞掉的草稿當成沒有，不要讓整頁停在這裡
      }
    }
    return null;
  }

  function clearAll(stores) {
    for (const name of ["session", "local"]) drop(stores[name]);
  }

  // 某個時間欄位換算成小時，用來檢查兩段式界線的先後。自訂值看不懂就回 null，
  // 那種情況不猜，交給使用者自己判斷。
  function triggerHours(state, id) {
    const value = clean(state[id]);
    if (!value) return null;
    if (value === "custom") {
      const text = clean(state[id + "Custom"]);
      const hit = text.match(/(\d+(?:\.\d+)?)\s*(小時|小时|hours?|hrs?|h|天|日|days?|d)/i);
      if (!hit) return null;
      const n = parseFloat(hit[1]);
      return /天|日|d/i.test(hit[2]) ? n * 24 : n;
    }
    const table = { h6: 6, h12: 12, d1: 24, d3: 72 };
    return table[value] === undefined ? null : table[value];
  }

  // 填的當下看不出來、湊起來才明顯的那幾種。這一頁的提醒都不擋輸入，
  // 因為使用者的處境只有他自己清楚，這裡能做的是把落差指出來。
  function warnings(state) {
    const out = [];
    const rows = filledContacts(state);
    if (rows.length > 0 && rows.length < 3) out.push({ id: "too-few-contacts" });

    const contacts = Array.isArray(state.contacts) ? state.contacts : [];
    contacts.forEach((row, index) => {
      if (!row) return;
      const primary = clean(row.primary);
      const backup = clean(row.backup);
      if (!primary || !backup) return;
      if (primary.toLowerCase() === backup.toLowerCase()) {
        out.push({ id: "backup-same", index: index });
        return;
      }
      if (OFFLINE_CHANNELS.test(backup)) return;
      // 備援寫成 mesh 或廣播時，使用者通常以為那是斷網也能用的東西
      if (MESH_CHANNELS.test(backup)) {
        out.push({ id: "backup-mesh", index: index });
        return;
      }
      if (BROADCAST_CHANNELS.test(backup)) {
        out.push({ id: "backup-broadcast", index: index });
        return;
      }
      if (ONLINE_CHANNELS.test(primary) && ONLINE_CHANNELS.test(backup)) {
        out.push({ id: "backup-online", index: index });
      }
    });

    if (rows.length > 0) {
      if (!clean(state.meetPlace)) out.push({ id: "no-meet" });
      const prepare = clean(state.triggerPrepare);
      const activate = clean(state.triggerActivate);
      if (!prepare || !activate) out.push({ id: "no-trigger" });
      const a = triggerHours(state, "triggerPrepare");
      const b = triggerHours(state, "triggerActivate");
      if (a !== null && b !== null && a >= b) out.push({ id: "trigger-order" });
      if (!clean(state.steps)) out.push({ id: "no-steps" });
    }
    if (clean(state.verify)) out.push({ id: "verify-filled" });

    // 卡片放不下時要在畫面上就說，印出來才發現最後幾行被裁掉已經來不及
    if (cardHeight(state) > CARD_MAX_LINES) out.push({ id: "card-too-long" });
    return out;
  }

  // 隨身卡的內容。只有 card 那層，而且刻意不放驗證線索與暗語，
  // 那兩樣一旦跟聯絡人印在同一張紙上，撿到卡片的人就同時拿到了名單與通關方式。
  function cardLines(state, t) {
    const s = t || { blocks: {}, parts: {}, triggers: {} };
    const label = (key) => (s.blocks && s.blocks[key]) || key;
    const part = (key) => (s.parts && s.parts[key]) || key;
    const out = [];
    const head = [clean(state.label), clean(state.date)].filter(Boolean);
    if (head.length) out.push(head.join("　"));

    const rows = filledContacts(state);
    if (rows.length) {
      out.push(label("contacts"));
      rows.forEach((row, index) => {
        const bits = [];
        if (clean(row.primary)) bits.push(clean(row.primary));
        if (clean(row.backup)) bits.push(clean(row.backup));
        const name = clean(row.codename) || part("codename");
        out.push("  " + (index + 1) + ". " + name + (bits.length ? "　" + bits.join(" / ") : ""));
      });
    }

    const place = clean(state.meetPlace);
    const window_ = clean(state.meetWindow);
    if (place || window_) {
      out.push(label("meet"));
      out.push("  " + [place, window_].filter(Boolean).join("　"));
    }

    const stage = (id) => {
      const value = clean(state[id]);
      if (!value) return "";
      return value === "custom" ? clean(state[id + "Custom"]) : (s.triggers && s.triggers[value]) || value;
    };
    const prepare = stage("triggerPrepare");
    const activate = stage("triggerActivate");
    if (prepare || activate) {
      out.push(label("trigger"));
      if (prepare) out.push("  " + part("prepare") + "：" + prepare);
      if (activate) out.push("  " + part("activate") + "：" + activate);
    }
    return out;
  }

  function serializeCard(state, t) {
    return cardLines(state, t).join("\n");
  }

  // 完整計畫。卡片那幾項加上留在計畫裡的部分，給約定中的指定聯絡人保管。
  // 這一份預設只提供下載，不做列印版面，因為它不該被帶在身上。
  function serializePlan(state, t) {
    const parts = [];
    const card = cardLines(state, t);
    if (card.length) parts.push(card.join("\n"));

    const rows = filledContacts(state).filter((row) => clean(row.role) || clean(row.reach));
    if (rows.length) {
      const lines = [t.blocks.roles];
      rows.forEach((row) => {
        const bits = [];
        if (clean(row.role)) bits.push(clean(row.role));
        if (clean(row.reach)) bits.push(clean(row.reach));
        lines.push("  " + (clean(row.codename) || t.parts.codename) + "　" + bits.join("　"));
      });
      parts.push(lines.join("\n"));
    }

    const block = (id, key) => {
      const value = clean(state[id]);
      if (!value) return;
      const lines = value.split("\n").map((line) => "  " + line.trim()).filter((line) => line.trim());
      parts.push(t.blocks[key] + "\n" + lines.join("\n"));
    };
    block("steps", "steps");
    if (clean(state.decider)) parts.push(t.blocks.decider + "\n  " + clean(state.decider));
    block("verify", "verify");
    block("avoid", "avoid");
    return parts.join("\n\n");
  }


  // --- 介面 ---

  const root = document.getElementById("shutdown-card-tool");
  if (!root) return;

  // 瀏覽器的兩個 Storage 只在這裡取得，其他地方一律經過 stores 參數。
  // 模式開關管得住每一次寫入，靠的就是這個收口。
  function browserStores() {
    return { session: window.sessionStorage, local: window.localStorage };
  }

  // 樣式跟著這支走。三個語系的 stylesheets/extra.css 是各自獨立的檔案，寫在那裡
  // 要維護三份，而這些規則只有這一頁用得到。
  //
  // 列印那一段是站上第一份 @media print。做法是沿著 body 到卡片的那一條路徑，
  // 一層層把旁邊的東西關掉，只留下四張卡。
  const CSS = `
    #shutdown-card-tool { margin: 1em 0; }
    #shutdown-card-tool fieldset {
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .2rem; padding: .8rem 1rem 1rem; margin: 0 0 1rem;
    }
    #shutdown-card-tool legend { font-size: .8rem; font-weight: 700; padding: 0 .4rem; }
    #shutdown-card-tool .sc-layer {
      border-left: .15rem solid var(--md-default-fg-color--lighter);
      padding: 0 0 0 .9rem; margin: 0 0 1.4rem;
    }
    #shutdown-card-tool .sc-layer-head {
      font-size: .78rem; font-weight: 700; margin: 0 0 .2rem;
    }
    #shutdown-card-tool .sc-layer-note {
      font-size: .72rem; opacity: .75; line-height: 1.7; margin: 0 0 .8rem;
    }
    #shutdown-card-tool .sc-hint {
      display: block; font-size: .72rem; opacity: .75; line-height: 1.7; margin: .1rem 0 .6rem;
    }
    #shutdown-card-tool .sc-field { display: block; font-weight: 700; font-size: .74rem; }
    #shutdown-card-tool label { display: block; font-size: .76rem; line-height: 1.7; }
    #shutdown-card-tool .sc-choice {
      display: flex; gap: .5rem; align-items: flex-start; padding: .25rem 0; cursor: pointer;
    }
    #shutdown-card-tool .sc-choice input { margin: .35rem 0 0; flex: none; }
    #shutdown-card-tool input[type="text"], #shutdown-card-tool textarea {
      font: inherit; color: inherit; background: transparent;
      /* iOS 在輸入框字級小於 16px 時一聚焦就放大整頁，而且退出之後不會縮回去，
         使用者看到的是填一填版面就被撐開。跟 cleanurl.js、qrcode.js 同一個處理 */
      font-size: max(16px, .76rem);
      border: .05rem solid var(--md-default-fg-color--lighter); border-radius: .1rem;
      padding: .3rem .4rem; width: 100%; box-sizing: border-box; margin: .2rem 0 .6rem;
    }
    #shutdown-card-tool textarea { min-height: 4.5rem; line-height: 1.7; resize: vertical; }
    #shutdown-card-tool .sc-contact {
      border-left: .15rem solid var(--md-default-fg-color--lightest, #ddd);
      padding-left: .7rem; margin: 0 0 .8rem;
    }
    #shutdown-card-tool .sc-contact-head {
      display: flex; justify-content: space-between; align-items: center;
      font-size: .72rem; opacity: .7; margin: 0 0 .2rem;
    }
    #shutdown-card-tool .sc-cols { display: flex; flex-wrap: wrap; gap: 0 .8rem; }
    #shutdown-card-tool .sc-cols > * { flex: 1 1 12rem; min-width: 0; }
    #shutdown-card-tool button {
      font: inherit; font-size: .76rem; color: inherit; cursor: pointer; background: none;
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .35rem .8rem;
    }
    #shutdown-card-tool button:hover:not(:disabled) {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #shutdown-card-tool button:disabled { opacity: .5; cursor: default; }
    #shutdown-card-tool .sc-mini { font-size: .68rem; padding: .15rem .5rem; }
    #shutdown-card-tool .sc-row { display: flex; flex-wrap: wrap; gap: .5rem; margin: 0 0 1rem; }
    #shutdown-card-tool .sc-status {
      display: flex; flex-wrap: wrap; gap: .5rem; align-items: center;
      justify-content: space-between;
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-left: .15rem solid #1565c0;
      border-radius: .1rem; padding: .5rem .7rem; margin: 0 0 1rem;
      font-size: .72rem; line-height: 1.7;
    }
    #shutdown-card-tool .sc-status p { margin: 0; min-width: 0; }
    #shutdown-card-tool .sc-threat {
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-left: .15rem solid #c62828;
      border-radius: .1rem; padding: .6rem .8rem; margin: 0 0 1.2rem;
      font-size: .74rem; line-height: 1.8;
    }
    #shutdown-card-tool .sc-threat p { margin: 0 0 .4rem; }
    #shutdown-card-tool .sc-threat p:last-child { margin: 0; }
    #shutdown-card-tool .sc-sensitive {
      font-size: .7rem; line-height: 1.7; margin: -.4rem 0 .6rem;
      border-left: .15rem solid #ef6c00; padding-left: .6rem;
    }
    #shutdown-card-tool .sc-warn {
      font-size: .76rem; margin: .5rem 0 0; line-height: 1.7;
      border-left: .15rem solid #ef6c00; padding-left: .6rem;
    }
    #shutdown-card-tool .sc-warn-hard { border-left-color: #c62828; }
    #shutdown-card-tool .sc-preview {
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-left: .15rem solid #2e7d32;
      border-radius: .1rem; padding: .7rem; margin: .4rem 0 1rem;
      font-family: var(--md-code-font-family, monospace);
      font-size: .72rem; line-height: 1.8; white-space: pre-wrap;
      word-break: break-word;
    }
    #shutdown-card-tool .sc-empty { font-size: .76rem; opacity: .75; line-height: 1.7; }
    #shutdown-card-tool .sc-print { display: none; }
    @media (pointer: coarse) {
      #shutdown-card-tool button { min-height: 2.2rem; }
      #shutdown-card-tool .sc-choice { padding: .4rem 0; }
    }
    @media print {
      /* 只留下從 body 到卡片的那一條路徑，路徑外的東西一律 display: none。
         用 visibility 藏東西的話版面高度會留著，卡片後面跟著五六張空白紙，
         而那是印出來才會發現的。 */
      body > *:not(.md-container),
      .md-container > *:not(.md-main),
      .md-main > *:not(.md-main__inner),
      .md-main__inner > *:not(.md-content),
      .md-content > *:not(.md-content__inner),
      .md-content__inner > *:not(#shutdown-card-tool),
      #shutdown-card-tool > *:not(.sc-print) { display: none !important; }
      .md-container, .md-main, .md-main__inner, .md-content, .md-content__inner {
        display: block !important; margin: 0 !important; padding: 0 !important;
        max-width: none !important; width: auto !important;
      }
      #shutdown-card-tool { margin: 0 !important; }
      #shutdown-card-tool .sc-print {
        display: grid !important;
        grid-template-columns: 1fr 1fr; grid-auto-rows: 132mm; gap: 0;
      }
      #shutdown-card-tool .sc-card {
        border: .2mm dashed #767676; padding: 6mm; box-sizing: border-box;
        overflow: hidden; break-inside: avoid; page-break-inside: avoid;
        color: #000; background: #fff;
        font-family: var(--md-code-font-family, monospace);
        font-size: 8.5pt; line-height: 1.6; white-space: pre-wrap; word-break: break-word;
      }
      @page { size: A4 portrait; margin: 8mm; }
    }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const STRINGS = {
    "zh-TW": {
      threatTitle: "先確認這張卡適合你",
      threatBody1: "這張卡假設的對手是意外，例如你失聯、住院、走失，撿到卡片的人沒有動機去追卡上的其他人。",
      threatBody2: "如果你或卡上任何一位的處境是會被搜身、搜屋、過境盤查，而且對方把「認識誰」本身當成證據，完整的卡片不要印出來隨身帶。那種情況只填代號與一個會合點，其餘記在腦裡。",
      modeTitle: "草稿要暫存在哪裡",
      modeHint: "預設只留在這個分頁裡。要留多久由你決定。",
      modes: {
        session: "關掉分頁就消失",
        device: "在這台裝置上保留草稿",
        off: "完全不要暫存",
      },
      modeNotes: {
        session: "重新整理、切到別的頁再回來都還在。關掉分頁就沒了，唯一的例外見下方狀態列。",
        device: "隔天回來繼續改的話選這一項。裝置被別人取得時，草稿也在裡面。",
        off: "全程不寫任何東西，重新整理就是空白。填完直接輸出的話選這一項。",
      },
      status: {
        session: "草稿暫存在這個分頁裡，關掉分頁就會消失。例外是瀏覽器設定成還原上次開啟的分頁時，重開會把它一起還原回來。",
        device: "草稿留在這台裝置上，關掉瀏覽器再打開還會在。",
        off: "目前沒有暫存任何東西，重新整理就會回到空白。",
      },
      clear: "清除草稿",
      cleared: "已清除，兩種暫存都沒有留下東西。",
      layers: {
        card: {
          title: "會印在隨身卡上",
          note: "這一區的內容會出現在紙上。密度要低到卡片被撿到也拼不出一張關係圖，所以只填代號，不填真名。",
        },
        plan: {
          title: "留在完整計畫裡，不建議印出來隨身帶",
          note: "這一區交給約定裡的指定聯絡人保管，或自己放進加密筆記。分開存放的理由是卡片被搜到時，對方取得的只有代號與地點，沒有取得怎麼證明身分、失聯之後誰要做什麼。",
        },
      },
      fields: {
        label: "卡片標籤",
        date: "版本日期",
        contacts: "聯絡人",
        meetPlace: "會合地點",
        meetWindow: "時間窗",
        triggerPrepare: "多久沒消息開始準備",
        triggerActivate: "多久沒消息正式啟動",
        steps: "失聯之後的行動步驟",
        decider: "誰負責拍板與通報",
        verify: "確認本人的問題",
        avoid: "不要透過卡上管道談的事",
      },
      hints: {
        label: "這張卡是誰的、第幾版。共同的約定會改版，沒有標示就會出現兩個人手上版本不同。",
        date: "改過內容就換一個日期，收到卡的人才知道手上是最新的那一份。",
        contacts: "中斷時你必須聯絡上的人。清單要短，三到五位。卡片上只寫代號，那是為了卡片被撿到時看不出是誰。",
        meetPlace: "通訊全部中斷時去哪裡找對方。選雙方都熟、不必先確認就到得了的地方。",
        meetWindow: "每天或每週固定的一段時間，時間短一點比較容易守住。",
        triggerPrepare: "超過這段時間就開始確認行程、聯絡其他人，還不驚動外部單位。",
        triggerActivate: "超過這段時間就照約定行動，不必再等確認。兩段式的寫法出自 Rory Peck Trust 的通訊計畫範本。",
        steps: "接收方在超過時間之後要做什麼，依順序寫。專業範本的順序是在地窗口、機構或編輯台、現場的人、最後才是官方單位。",
        decider: "好幾個人同時知情卻沒人先動，是這類約定最常見的失效方式。先約定好誰拍板。",
        verify: "透過陌生管道收到訊息時，用什麼確認對方確實是他。這裡只寫問題，答案雙方各自記在腦裡。",
        avoid: "卡上的管道都假設有第三方讀得到。一行一項。",
      },
      parts: {
        codename: "代號",
        primary: "主要管道",
        backup: "備援管道",
        role: "關係或角色",
        reach: "所在地或其他找得到他的方式",
        prepare: "開始準備",
        activate: "正式啟動",
      },
      placeholders: {
        label: "誰的卡、第幾版",
        date: "2026-10-04",
        codename: "代號，不要寫真名",
        primary: "平常聯絡用的方式",
        backup: "不經過網際網路的方式",
        role: "同事、家人、鄰居",
        reach: "住處大概位置、上班的地方",
        meetPlace: "雙方都熟的地點",
        meetWindow: "每日 18:00 到 19:00",
        triggerPrepareCustom: "自己填，例如 8 小時",
        triggerActivateCustom: "自己填，例如兩個工作天",
        steps: "一行一步，照順序",
        decider: "誰拍板、誰負責去通報",
        verify: "一行一題，只寫問題",
        avoid: "一行一項",
      },
      blocks: {
        contacts: "聯絡人",
        meet: "會合點",
        trigger: "沒消息多久就行動",
        roles: "聯絡人是誰、去哪裡找",
        steps: "失聯之後怎麼做",
        decider: "誰拍板與通報",
        verify: "確認本人的問題",
        avoid: "不要在卡上的管道談",
      },
      triggers: {
        h6: "6 小時",
        h12: "12 小時",
        d1: "24 小時",
        d3: "3 天",
        custom: "自己填",
      },
      sensitiveNote: "只寫問題，不要寫答案。答案寫下來的話，撿到的人就能照著回答通過驗證。問題與答案分開持有是既有做法，這一欄照那個做法設計。",
      addContact: "增加一位",
      removeContact: "移除",
      contactLimit: "最多五位。清單短才記得住。",
      warnTitle: "填完值得再看一眼",
      warns: {
        "too-few-contacts": "目前只有一到兩位。清單短是對的，只有一個聯絡點的話，那個人自己失聯時整張卡就停住了。",
        "backup-same": "第 {n} 位的主要管道與備援管道填了同一個。備援的用處在於主要管道不通時還有路走。",
        "backup-online": "第 {n} 位的兩個管道都需要網路，斷網當天會一起失效。備援至少留一個不經過網際網路的方式，例如見面、市話或紙條。",
        "backup-mesh": "第 {n} 位的備援填的是藍牙或 mesh 類的工具。這一類單跳距離大約一百公尺，要靠人群密度接力，在示威現場那種場合有用，聯絡分散在各處的人不適用。",
        "backup-broadcast": "第 {n} 位的備援填的是廣播類。廣播是單向的，收得到廣播跟聯絡得到那個人是兩件事。",
        "no-meet": "還沒填會合地點。通訊全部中斷時，一個雙方都知道的地點加上時間窗，是最後一條路。",
        "no-trigger": "兩段時間還沒填完。只有一個門檻的話，超過之後就只剩「還在等」與「出事了」兩種狀態，中間那段可以先確認、先聯絡的時間會被跳過。",
        "trigger-order": "開始準備的時間比正式啟動晚，或兩個一樣長。順序反過來的話，準備那一段就沒有作用。",
        "no-steps": "還沒寫失聯之後要做什麼。時間到了卻沒有人知道下一步，約定就停在那裡。二戰時有整批人依約定發出示警，接收端誤判成疏忽，照常聯繫。",
        "verify-filled": "確認本人那一欄有內容了。請再確認寫的是問題，答案沒有跟著寫進去。",
        "card-too-long": "隨身卡的內容超過一張卡放得下的量，印出來最後幾行會被裁掉。減少聯絡人筆數，或把備援管道寫短一點。",
      },
      previewCard: "隨身卡的內容",
      previewPlan: "完整計畫的內容",
      empty: "填幾欄之後，內容會出現在這裡。",
      print: "列印隨身卡，一張 A4 四張",
      printBusy: "準備列印",
      printNote: "紙上只會有四張卡，表單與網站的頁首頁尾都不會印出來。手機上按了之後要等幾秒，列印選項通常在分享選單裡。四張是同一份，要分給約定裡的其他人的話，先想清楚每多一份就多一個被搜到的地方。",
      downloadCard: "下載隨身卡文字",
      downloadPlan: "下載完整計畫",
      downloadCardName: "shutdown-card.txt",
      downloadPlanName: "shutdown-plan.txt",
      afterOutput: "已經輸出。要清掉這台裝置上的草稿嗎",
      afterOutputYes: "清掉",
      afterOutputNo: "留著",
    },
    zh: {
      threatTitle: "先确认这张卡适合你",
      threatBody1: "这张卡假设的对手是意外，例如你失联、住院、走失，捡到卡片的人没有动机去追卡上的其他人。",
      threatBody2: "如果你或卡上任何一位的处境是会被搜身、搜屋、过境盘查，而且对方把「认识谁」本身当成证据，完整的卡片不要打印出来随身带。那种情况只填代号与一个会合点，其余记在脑里。",
      modeTitle: "草稿要暂存在哪里",
      modeHint: "默认只留在这个标签页里。要留多久由你决定。",
      modes: {
        session: "关掉标签页就消失",
        device: "在这台设备上保留草稿",
        off: "完全不要暂存",
      },
      modeNotes: {
        session: "刷新、切到别的页面再回来都还在。关掉标签页就没了，唯一的例外见下方状态栏。",
        device: "隔天回来继续改的话选这一项。设备被别人取得时，草稿也在里面。",
        off: "全程不写任何东西，刷新就是空白。填完直接输出的话选这一项。",
      },
      status: {
        session: "草稿暂存在这个标签页里，关掉标签页就会消失。例外是浏览器设置成还原上次打开的标签页时，重开会把它一起还原回来。",
        device: "草稿留在这台设备上，关掉浏览器再打开还会在。",
        off: "目前没有暂存任何东西，刷新就会回到空白。",
      },
      clear: "清除草稿",
      cleared: "已清除，两种暂存都没有留下东西。",
      layers: {
        card: {
          title: "会打印在随身卡上",
          note: "这一区的内容会出现在纸上。密度要低到卡片被捡到也拼不出一张关系图，所以只填代号，不填真名。",
        },
        plan: {
          title: "留在完整计划里，不建议打印出来随身带",
          note: "这一区交给约定里的指定联系人保管，或自己放进加密笔记。分开存放的理由是卡片被搜到时，对方取得的只有代号与地点，没有取得怎么证明身份、失联之后谁要做什么。",
        },
      },
      fields: {
        label: "卡片标签",
        date: "版本日期",
        contacts: "联系人",
        meetPlace: "会合地点",
        meetWindow: "时间窗",
        triggerPrepare: "多久没消息开始准备",
        triggerActivate: "多久没消息正式启动",
        steps: "失联之后的行动步骤",
        decider: "谁负责拍板与通报",
        verify: "确认本人的问题",
        avoid: "不要通过卡上渠道谈的事",
      },
      hints: {
        label: "这张卡是谁的、第几版。共同的约定会改版，没有标示就会出现两个人手上版本不同。",
        date: "改过内容就换一个日期，收到卡的人才知道手上是最新的那一份。",
        contacts: "中断时你必须联系上的人。清单要短，三到五位。卡片上只写代号，那是为了卡片被捡到时看不出是谁。",
        meetPlace: "通信全部中断时去哪里找对方。选双方都熟、不必先确认就到得了的地方。",
        meetWindow: "每天或每周固定的一段时间，时间短一点比较容易守住。",
        triggerPrepare: "超过这段时间就开始确认行程、联系其他人，还不惊动外部单位。",
        triggerActivate: "超过这段时间就照约定行动，不必再等确认。两段式的写法出自 Rory Peck Trust 的通信计划范本。",
        steps: "接收方在超过时间之后要做什么，依顺序写。专业范本的顺序是本地窗口、机构或编辑部、现场的人、最后才是官方单位。",
        decider: "好几个人同时知情却没人先动，是这类约定最常见的失效方式。先约定好谁拍板。",
        verify: "通过陌生渠道收到消息时，用什么确认对方确实是他。这里只写问题，答案双方各自记在脑里。",
        avoid: "卡上的渠道都假设有第三方读得到。一行一项。",
      },
      parts: {
        codename: "代号",
        primary: "主要渠道",
        backup: "备用渠道",
        role: "关系或角色",
        reach: "所在地或其他找得到他的方式",
        prepare: "开始准备",
        activate: "正式启动",
      },
      placeholders: {
        label: "谁的卡、第几版",
        date: "2026-10-04",
        codename: "代号，不要写真名",
        primary: "平常联系用的方式",
        backup: "不经过互联网的方式",
        role: "同事、家人、邻居",
        reach: "住处大概位置、上班的地方",
        meetPlace: "双方都熟的地点",
        meetWindow: "每日 18:00 到 19:00",
        triggerPrepareCustom: "自己填，例如 8 小时",
        triggerActivateCustom: "自己填，例如两个工作日",
        steps: "一行一步，照顺序",
        decider: "谁拍板、谁负责去通报",
        verify: "一行一题，只写问题",
        avoid: "一行一项",
      },
      blocks: {
        contacts: "联系人",
        meet: "会合点",
        trigger: "没消息多久就行动",
        roles: "联系人是谁、去哪里找",
        steps: "失联之后怎么做",
        decider: "谁拍板与通报",
        verify: "确认本人的问题",
        avoid: "不要在卡上的渠道谈",
      },
      triggers: {
        h6: "6 小时",
        h12: "12 小时",
        d1: "24 小时",
        d3: "3 天",
        custom: "自己填",
      },
      sensitiveNote: "只写问题，不要写答案。答案写下来的话，捡到的人就能照着回答通过验证。问题与答案分开持有是既有做法，这一栏照那个做法设计。",
      addContact: "增加一位",
      removeContact: "移除",
      contactLimit: "最多五位。清单短才记得住。",
      warnTitle: "填完值得再看一眼",
      warns: {
        "too-few-contacts": "目前只有一到两位。清单短是对的，只有一个联系点的话，那个人自己失联时整张卡就停住了。",
        "backup-same": "第 {n} 位的主要渠道与备用渠道填了同一个。备用的用处在于主要渠道不通时还有路走。",
        "backup-online": "第 {n} 位的两个渠道都需要网络，断网当天会一起失效。备用至少留一个不经过互联网的方式，例如见面、固话或纸条。",
        "backup-mesh": "第 {n} 位的备用填的是蓝牙或 mesh 类的工具。这一类单跳距离大约一百米，要靠人群密度接力，在示威现场那种场合有用，联系分散在各处的人不适用。",
        "backup-broadcast": "第 {n} 位的备用填的是广播类。广播是单向的，收得到广播跟联系得到那个人是两件事。",
        "no-meet": "还没填会合地点。通信全部中断时，一个双方都知道的地点加上时间窗，是最后一条路。",
        "no-trigger": "两段时间还没填完。只有一个门槛的话，超过之后就只剩「还在等」与「出事了」两种状态，中间那段可以先确认、先联系的时间会被跳过。",
        "trigger-order": "开始准备的时间比正式启动晚，或两个一样长。顺序反过来的话，准备那一段就没有作用。",
        "no-steps": "还没写失联之后要做什么。时间到了却没有人知道下一步，约定就停在那里。二战时有整批人依约定发出示警，接收端误判成疏忽，照常联系。",
        "verify-filled": "确认本人那一栏有内容了。请再确认写的是问题，答案没有跟着写进去。",
        "card-too-long": "随身卡的内容超过一张卡放得下的量，打印出来最后几行会被裁掉。减少联系人笔数，或把备用渠道写短一点。",
      },
      previewCard: "随身卡的内容",
      previewPlan: "完整计划的内容",
      empty: "填几栏之后，内容会出现在这里。",
      print: "打印随身卡，一张 A4 四张",
      printBusy: "准备打印",
      printNote: "纸上只会有四张卡，表单与网站的页眉页脚都不会打印出来。手机上按了之后要等几秒，打印选项通常在分享菜单里。四张是同一份，要分给约定里的其他人的话，先想清楚每多一份就多一个被搜到的地方。",
      downloadCard: "下载随身卡文本",
      downloadPlan: "下载完整计划",
      downloadCardName: "shutdown-card.txt",
      downloadPlanName: "shutdown-plan.txt",
      afterOutput: "已经输出。要清掉这台设备上的草稿吗",
      afterOutputYes: "清掉",
      afterOutputNo: "留着",
    },
    en: {
      threatTitle: "First, check that this card is for you",
      threatBody1: "This card assumes the adversary is an accident: you go missing, end up in hospital, get separated from people. Whoever picks the card up has no reason to go after anyone else named on it.",
      threatBody2: "If you or anyone on the card lives somewhere you can be stopped and searched, have your home searched, or be questioned at a border, and where knowing the wrong people is itself treated as evidence, do not print the full card and carry it. In that situation fill in code names and one meeting point, and keep the rest in your head.",
      modeTitle: "Where the draft is kept",
      modeHint: "By default it stays in this tab. How long to keep it is your call.",
      modes: {
        session: "Gone when you close the tab",
        device: "Keep the draft on this device",
        off: "Keep nothing at all",
      },
      modeNotes: {
        session: "Reloading or navigating away and back keeps it. Closing the tab clears it, with one exception noted in the status line below.",
        device: "Pick this if you want to come back tomorrow and edit. If someone gets the device, the draft is on it too.",
        off: "Nothing is written at any point, and a reload gives you a blank form. Pick this if you are filling it in and printing right away.",
      },
      status: {
        session: "The draft is held in this tab and closing the tab clears it. The exception is a browser set to reopen your previous tabs, which restores this along with them.",
        device: "The draft is kept on this device and survives closing the browser.",
        off: "Nothing is being kept. A reload gives you a blank form.",
      },
      clear: "Clear the draft",
      cleared: "Cleared. Neither kind of storage has anything left in it.",
      layers: {
        card: {
          title: "Goes on the printed card",
          note: "Everything in this section ends up on paper. Keep the density low enough that whoever finds the card cannot reconstruct a map of relationships from it, which is why this section takes code names rather than real names.",
        },
        plan: {
          title: "Stays in the full plan, not meant to be printed and carried",
          note: "Give this section to the one contact you have agreed on, or keep it in an encrypted note. Keeping them apart means that a card found on you yields code names and a place, and not how identity gets confirmed or what happens once you are out of touch.",
        },
      },
      fields: {
        label: "Card label",
        date: "Version date",
        contacts: "People",
        meetPlace: "Meeting place",
        meetWindow: "Time window",
        triggerPrepare: "Start preparing after",
        triggerActivate: "Act on the plan after",
        steps: "What to do once contact is lost",
        decider: "Who decides and who notifies",
        verify: "Questions that confirm it is really them",
        avoid: "Not to be discussed over the channels on this card",
      },
      hints: {
        label: "Whose card this is and which version. Shared agreements get revised, and without a label two people end up holding different versions.",
        date: "Change the date whenever the content changes, so whoever holds the card knows it is the current one.",
        contacts: "The people you have to reach during an outage. Keep the list short, three to five. The card carries code names only, so that finding it does not tell anyone who they are.",
        meetPlace: "Where to find each other when every channel is down. Pick somewhere both of you know and can reach without checking first.",
        meetWindow: "A fixed slot each day or each week. A short one is easier to hold to.",
        triggerPrepare: "Past this point you start checking the itinerary and calling around, without alerting anyone outside the group.",
        triggerActivate: "Past this point you act on the agreement without waiting for confirmation. The two-stage form comes from the Rory Peck Trust communications plan template.",
        steps: "What the person receiving your check-ins does once the time passes, in order. Professional templates run local contact, then the organisation or desk, then people on the ground, and official channels last.",
        decider: "Several people knowing and nobody moving first is the most common way these agreements fail. Settle who calls it.",
        verify: "What tells you a message from an unfamiliar channel really came from them. Write only the questions here, and keep the answers in your heads.",
        avoid: "Assume every channel on this card is readable by someone else. One item per line.",
      },
      parts: {
        codename: "Code name",
        primary: "Main channel",
        backup: "Backup channel",
        role: "Relationship or role",
        reach: "Where they are, or another way to find them",
        prepare: "Start preparing",
        activate: "Act",
      },
      placeholders: {
        label: "Whose card, which version",
        date: "2026-10-04",
        codename: "A code name, not a real one",
        primary: "How you normally reach them",
        backup: "Something that does not go over the internet",
        role: "Colleague, family, neighbour",
        reach: "Roughly where they live, where they work",
        meetPlace: "A place you both know",
        meetWindow: "Daily, 18:00 to 19:00",
        triggerPrepareCustom: "Your own, for example 8 hours",
        triggerActivateCustom: "Your own, for example two working days",
        steps: "One step per line, in order",
        decider: "Who calls it, who makes the notification",
        verify: "One question per line, questions only",
        avoid: "One item per line",
      },
      blocks: {
        contacts: "People",
        meet: "Meeting point",
        trigger: "Act after this long without word",
        roles: "Who they are and where to find them",
        steps: "Once contact is lost",
        decider: "Who decides and notifies",
        verify: "Questions that confirm identity",
        avoid: "Not over the channels on this card",
      },
      triggers: {
        h6: "6 hours",
        h12: "12 hours",
        d1: "24 hours",
        d3: "3 days",
        custom: "Your own",
      },
      sensitiveNote: "Questions only, no answers. An answer written down lets whoever finds it read the reply straight off the page. Holding the question and the answer separately is the established practice, and this field follows it.",
      addContact: "Add a person",
      removeContact: "Remove",
      contactLimit: "Five at most. A short list is one you can remember.",
      warnTitle: "Worth a second look before you print",
      warns: {
        "too-few-contacts": "Only one or two people so far. A short list is right, but with a single point of contact the whole card stalls the moment that person is the one who is unreachable.",
        "backup-same": "Person {n} has the same entry for the main and the backup channel. A backup earns its place by working when the main one does not.",
        "backup-online": "Both channels for person {n} need the internet, so they fail together on the day it matters. Leave at least one backup that does not go over the internet, such as meeting in person, a landline, or a note.",
        "backup-mesh": "The backup for person {n} is a Bluetooth or mesh tool. Those hop about a hundred metres at a time and rely on a dense crowd to relay, which works at a protest and does not work for reaching people spread across a city.",
        "backup-broadcast": "The backup for person {n} is a broadcast channel. Broadcast runs one way, and receiving one is a different thing from reaching that person.",
        "no-meet": "No meeting place yet. When every channel is down, a place both of you know plus a time window is the last route left.",
        "no-trigger": "The two waiting times are not both filled in. With a single threshold there are only two states, still waiting and something is wrong, and the stretch in between where you could check quietly gets skipped.",
        "trigger-order": "The preparing time falls later than the acting time, or the two are equal. Reversed like that, the preparing stage does nothing.",
        "no-steps": "Nothing written yet for what happens once contact is lost. If the time passes and nobody knows the next step, the agreement stops there. In one wartime case a whole network sent the agreed distress signal and the receiving end read it as sloppiness and carried on.",
        "verify-filled": "The verification field has content. Check that what you wrote are questions, and that no answers came along with them.",
        "card-too-long": "The card content runs past what one card holds, so the last lines get cut off in print. Drop a contact or shorten the backup channels.",
      },
      previewCard: "What goes on the card",
      previewPlan: "What is in the full plan",
      empty: "Fill in a few fields and the content appears here.",
      print: "Print the cards, four per A4 sheet",
      printBusy: "Preparing",
      printNote: "Only the four cards reach the paper. The form and the site header and footer are left out. On a phone it takes a few seconds, and the print option usually sits in the share menu. All four are identical, so before handing them out, be clear that each extra copy is one more place the card can be found.",
      downloadCard: "Download the card as text",
      downloadPlan: "Download the full plan",
      downloadCardName: "shutdown-card.txt",
      downloadPlanName: "shutdown-plan.txt",
      afterOutput: "Output done. Clear the draft from this device?",
      afterOutputYes: "Clear it",
      afterOutputNo: "Keep it",
    },
  };

  const t = STRINGS[document.documentElement.lang] || STRINGS["zh-TW"];
  const contactSpec = FIELDS.find((field) => field.id === "contacts");
  const stores = browserStores();

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const fill = (text, vars) =>
    Object.keys(vars || {}).reduce(
      (out, name) => out.split("{" + name + "}").join(vars[name]),
      text
    );

  function today() {
    const now = new Date();
    const pad = (n) => (n < 10 ? "0" + n : String(n));
    return now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
  }

  // 讀回來的草稿不能直接當成 state 用。它可能是舊版本存的、可能被手動改過，
  // 缺欄位或型別不對的話後面每一個函式都要各自防禦，不如在入口就補齊。
  function restore() {
    const base = emptyState();
    base.date = today();
    const saved = loadDraft(stores);
    if (!saved) return base;
    for (const key of Object.keys(base)) {
      if (key === "contacts") continue;
      if (typeof saved[key] === "string") base[key] = saved[key];
    }
    if (MODES.indexOf(base.mode) < 0) base.mode = MODES[0];
    if (Array.isArray(saved.contacts) && saved.contacts.length) {
      const keep = (row, key) => (row && typeof row[key] === "string" ? row[key] : "");
      base.contacts = saved.contacts.slice(0, contactSpec.max).map((row) => ({
        codename: keep(row, "codename"),
        primary: keep(row, "primary"),
        backup: keep(row, "backup"),
        role: keep(row, "role"),
        reach: keep(row, "reach"),
      }));
      while (base.contacts.length < contactSpec.min) {
        base.contacts.push({ codename: "", primary: "", backup: "", role: "", reach: "" });
      }
    }
    return base;
  }

  let state = restore();

  const statusBox = el("div", "sc-status");
  const statusText = el("p");
  const clearButton = el("button", null, t.clear);
  statusBox.appendChild(statusText);
  statusBox.appendChild(clearButton);

  const threatBox = el("div", "sc-threat");
  threatBox.appendChild(el("p", "sc-layer-head", t.threatTitle));
  threatBox.appendChild(el("p", null, t.threatBody1));
  threatBox.appendChild(el("p", null, t.threatBody2));

  const formBox = el("div");
  const contactsBox = el("div");
  const planContactsBox = el("div");
  const warnBox = el("div");
  const cardPreview = el("div", "sc-preview");
  const planPreview = el("div", "sc-preview");
  const askBox = el("div", "sc-row");
  const printBox = el("div", "sc-print");
  // 聯絡人在計畫那一區也有兩欄，標題要跟著卡片那區的代號走
  const planTitles = [];

  function textInput(key, onInput, value) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = t.placeholders[key] || "";
    input.value = value;
    input.addEventListener("input", () => {
      onInput(input.value);
      refresh();
    });
    return input;
  }

  function area(key, onInput, value) {
    const node = document.createElement("textarea");
    node.placeholder = t.placeholders[key] || "";
    node.value = value;
    node.addEventListener("input", () => {
      onInput(node.value);
      refresh();
    });
    return node;
  }

  // label 包住輸入框，點說明文字也會聚焦。說明用 span 而不是 p，
  // p 放進 label 裡不合語法，瀏覽器會把它拆到外面去。
  function labelled(text, hint, control) {
    const wrap = el("label");
    wrap.appendChild(el("span", "sc-field", text));
    if (hint) wrap.appendChild(el("span", "sc-hint", hint));
    wrap.appendChild(control);
    return wrap;
  }

  function choice(name, checked, label, note, onPick) {
    const row = el("label", "sc-choice");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = name;
    input.checked = checked;
    input.addEventListener("change", () => {
      if (input.checked) onPick();
    });
    const body = el("span");
    body.appendChild(el("span", null, label));
    if (note) body.appendChild(el("span", "sc-hint", note));
    row.appendChild(input);
    row.appendChild(body);
    return row;
  }

  function section(legendText, hintText) {
    const box = el("fieldset");
    box.appendChild(el("legend", null, legendText));
    if (hintText) box.appendChild(el("p", "sc-hint", hintText));
    return box;
  }

  // 分層的視覺呈現。哪些東西會上紙、哪些不會，是這個工具最需要讓人一眼看懂的事
  function layer(key) {
    const box = el("div", "sc-layer");
    box.appendChild(el("p", "sc-layer-head", t.layers[key].title));
    box.appendChild(el("p", "sc-layer-note", t.layers[key].note));
    return box;
  }

  // 兩段式的時間界線各一組選項，共用這個產生器
  function triggerGroup(id) {
    const box = section(t.fields[id], t.hints[id]);
    for (const item of TRIGGERS) {
      box.appendChild(choice("sc-" + id, state[id] === item.id, t.triggers[item.id], null, () => {
        state[id] = item.id;
        refresh();
      }));
    }
    box.appendChild(textInput(id + "Custom", (value) => {
      state[id + "Custom"] = value;
      state[id] = "custom";
    }, state[id + "Custom"]));
    return box;
  }

  function renderContacts() {
    contactsBox.textContent = "";
    planContactsBox.textContent = "";
    planTitles.length = 0;

    state.contacts.forEach((row, index) => {
      const item = el("div", "sc-contact");
      const head = el("div", "sc-contact-head");
      head.appendChild(el("span", null, t.fields.contacts + " " + (index + 1)));
      if (state.contacts.length > contactSpec.min) {
        const remove = el("button", "sc-mini", t.removeContact);
        remove.addEventListener("click", () => {
          state.contacts.splice(index, 1);
          renderContacts();
          refresh();
        });
        head.appendChild(remove);
      }
      item.appendChild(head);
      const cols = el("div", "sc-cols");
      for (const part of contactSpec.parts) {
        cols.appendChild(labelled(t.parts[part], null,
          textInput(part, (value) => { row[part] = value; }, row[part])));
      }
      item.appendChild(cols);
      contactsBox.appendChild(item);

      const planItem = el("div", "sc-contact");
      const planHead = el("div", "sc-contact-head");
      const title = el("span", null, "");
      planHead.appendChild(title);
      planTitles.push({ node: title, index: index });
      planItem.appendChild(planHead);
      const planCols = el("div", "sc-cols");
      for (const part of contactSpec.planParts) {
        planCols.appendChild(labelled(t.parts[part], null,
          textInput(part, (value) => { row[part] = value; }, row[part])));
      }
      planItem.appendChild(planCols);
      planContactsBox.appendChild(planItem);
    });

    const foot = el("div", "sc-row");
    const add = el("button", null, t.addContact);
    add.disabled = state.contacts.length >= contactSpec.max;
    add.addEventListener("click", () => {
      if (state.contacts.length >= contactSpec.max) return;
      state.contacts.push({ codename: "", primary: "", backup: "", role: "", reach: "" });
      renderContacts();
      refresh();
    });
    foot.appendChild(add);
    if (state.contacts.length >= contactSpec.max) {
      foot.appendChild(el("span", "sc-hint", t.contactLimit));
    }
    contactsBox.appendChild(foot);
    renderPlanTitles();
  }

  function renderPlanTitles() {
    for (const entry of planTitles) {
      const row = state.contacts[entry.index];
      const name = row ? clean(row.codename) : "";
      entry.node.textContent = name || (t.fields.contacts + " " + (entry.index + 1));
    }
  }

  function buildForm() {
    formBox.textContent = "";

    const modes = section(t.modeTitle, t.modeHint);
    for (const mode of MODES) {
      modes.appendChild(choice("sc-mode", state.mode === mode, t.modes[mode], t.modeNotes[mode], () => {
        state.mode = mode;
        refresh();
      }));
    }
    formBox.appendChild(modes);

    const cardLayer = layer("card");

    const meta = section(t.fields.label);
    meta.appendChild(labelled(t.fields.label, t.hints.label,
      textInput("label", (value) => { state.label = value; }, state.label)));
    meta.appendChild(labelled(t.fields.date, t.hints.date,
      textInput("date", (value) => { state.date = value; }, state.date)));
    cardLayer.appendChild(meta);

    const contacts = section(t.fields.contacts, t.hints.contacts);
    contacts.appendChild(contactsBox);
    cardLayer.appendChild(contacts);

    const meet = section(t.blocks.meet);
    meet.appendChild(labelled(t.fields.meetPlace, t.hints.meetPlace,
      textInput("meetPlace", (value) => { state.meetPlace = value; }, state.meetPlace)));
    meet.appendChild(labelled(t.fields.meetWindow, t.hints.meetWindow,
      textInput("meetWindow", (value) => { state.meetWindow = value; }, state.meetWindow)));
    cardLayer.appendChild(meet);

    cardLayer.appendChild(triggerGroup("triggerPrepare"));
    cardLayer.appendChild(triggerGroup("triggerActivate"));
    formBox.appendChild(cardLayer);

    const planLayer = layer("plan");

    const roles = section(t.blocks.roles, t.hints.contacts);
    roles.appendChild(planContactsBox);
    planLayer.appendChild(roles);

    const steps = section(t.fields.steps, t.hints.steps);
    steps.appendChild(area("steps", (value) => { state.steps = value; }, state.steps));
    steps.appendChild(labelled(t.fields.decider, t.hints.decider,
      textInput("decider", (value) => { state.decider = value; }, state.decider)));
    planLayer.appendChild(steps);

    const verify = section(t.fields.verify, t.hints.verify);
    verify.appendChild(area("verify", (value) => { state.verify = value; }, state.verify));
    // 敏感提示常駐，不等使用者填了才出現。填的當下才是需要看到它的時候
    verify.appendChild(el("p", "sc-sensitive", t.sensitiveNote));
    planLayer.appendChild(verify);

    const avoid = section(t.fields.avoid, t.hints.avoid);
    avoid.appendChild(area("avoid", (value) => { state.avoid = value; }, state.avoid));
    planLayer.appendChild(avoid);

    formBox.appendChild(planLayer);
    renderContacts();
  }

  function renderStatus() {
    statusText.textContent = t.status[state.mode] || t.status.off;
  }

  function renderWarnings() {
    warnBox.textContent = "";
    const list = warnings(state);
    if (!list.length) return;
    warnBox.appendChild(el("p", "sc-hint", t.warnTitle));
    for (const item of list) {
      const text = fill(t.warns[item.id], { n: (item.index || 0) + 1 });
      const hard = item.id === "card-too-long";
      warnBox.appendChild(el("p", hard ? "sc-warn sc-warn-hard" : "sc-warn", text));
    }
  }

  function renderPreview() {
    const card = serializeCard(state, t);
    cardPreview.textContent = card || t.empty;
    cardPreview.className = card ? "sc-preview" : "sc-empty";
    const plan = serializePlan(state, t);
    planPreview.textContent = plan || t.empty;
    planPreview.className = plan ? "sc-preview" : "sc-empty";

    // 四張一樣的卡。要不要真的分給別人是使用者的取捨，說明寫在按鈕下面
    printBox.textContent = "";
    if (!card) return;
    for (let i = 0; i < 4; i += 1) printBox.appendChild(el("div", "sc-card", card));
  }

  function refresh() {
    renderStatus();
    renderPlanTitles();
    renderWarnings();
    renderPreview();
    saveDraft(state, stores);
  }

  // 輸出完主動問一次。彈窗會被順手關掉，所以問句就長在按鈕下面
  function askToClear() {
    askBox.textContent = "";
    if (storagePlan(state.mode).write === null) return;
    askBox.appendChild(el("span", "sc-hint", t.afterOutput));
    const yes = el("button", null, t.afterOutputYes);
    yes.addEventListener("click", () => {
      askBox.textContent = "";
      wipe();
    });
    const no = el("button", null, t.afterOutputNo);
    no.addEventListener("click", () => {
      askBox.textContent = "";
    });
    askBox.appendChild(yes);
    askBox.appendChild(no);
  }

  // 清除不做二次確認。往安全方向走的動作應該按一下就成立，
  // 而這一頁的內容重填得回來，被別人看到收不回來
  function wipe() {
    clearAll(stores);
    const mode = state.mode;
    state = emptyState();
    state.mode = mode;
    state.date = today();
    buildForm();
    renderWarnings();
    renderPreview();
    askBox.textContent = "";
    statusText.textContent = t.cleared;
  }

  clearButton.addEventListener("click", wipe);

  function saveText(text, name) {
    if (!text) return;
    const blob = new Blob([text + "\n"], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    askToClear();
  }

  const actions = el("div", "sc-row");
  const printButton = el("button", null, t.print);
  // 手機上按下去到系統的列印畫面跳出來之間有好幾秒完全沒有反應，讀者合理的
  // 反應是再按一次。轉圈要在呼叫 print 之前就畫出來，而 print 在桌機是同步
  // 阻塞的，同一個 tick 裡設好狀態畫面不會更新，所以隔兩層 rAF 才呼叫。
  printButton.addEventListener("click", () => {
    if (printButton.disabled) return;
    renderPreview();
    printButton.disabled = true;
    printButton.textContent = "";
    printButton.appendChild(el("span", "anoni-spinner"));
    printButton.appendChild(el("span", null, t.printBusy));
    printButton.setAttribute("aria-busy", "true");
    const done = () => {
      printButton.removeAttribute("aria-busy");
      printButton.disabled = false;
      printButton.textContent = t.print;
    };
    requestAnimationFrame(() => requestAnimationFrame(() => {
      try {
        window.print();
      } finally {
        window.setTimeout(done, 600);
      }
    }));
  });
  const downloadCard = el("button", null, t.downloadCard);
  downloadCard.addEventListener("click", () => {
    saveText(serializeCard(state, t), t.downloadCardName);
  });
  const downloadPlan = el("button", null, t.downloadPlan);
  downloadPlan.addEventListener("click", () => {
    saveText(serializePlan(state, t), t.downloadPlanName);
  });
  actions.appendChild(printButton);
  actions.appendChild(downloadCard);
  actions.appendChild(downloadPlan);

  // 有些瀏覽器不送 afterprint，那種情況就只是少問一次，不影響輸出
  window.addEventListener("afterprint", askToClear);

  root.appendChild(threatBox);
  root.appendChild(statusBox);
  root.appendChild(formBox);
  root.appendChild(warnBox);
  root.appendChild(el("p", "sc-hint", t.previewCard));
  root.appendChild(cardPreview);
  root.appendChild(el("p", "sc-hint", t.previewPlan));
  root.appendChild(planPreview);
  root.appendChild(actions);
  root.appendChild(askBox);
  root.appendChild(el("p", "sc-hint", t.printNote));
  root.appendChild(printBox);

  buildForm();
  refresh();
})();
