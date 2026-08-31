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

  // 多久沒消息就照約定行動。時間長短沒有標準答案，給幾個常見的間隔加一個自訂。
  const TRIGGERS = [
    { id: "h6" },
    { id: "h12" },
    { id: "d1" },
    { id: "d3" },
    { id: "custom" },
  ];

  // 備援管道的檢查用這兩份清單。都是啟發式判斷，只用來提醒，不擋任何輸入。
  // 三個語系共用同一份，因為使用者填的字常常是英文的服務名混中文說明。
  const ONLINE_CHANNELS = /signal|telegram|whatsapp|wechat|微信|messenger|facebook|instagram|threads|discord|matrix|element|wire|keybase|skype|zoom|teams|slack|line|imessage|gmail|mail|郵件|信箱|臉書|推特|twitter|私訊|站內信|视频通话|視訊|網路電話|voip/i;
  const OFFLINE_CHANNELS = /面交|當面|見面|碰面|門鈴|按鈴|住處|家裡|家里|辦公室|办公室|紙條|纸条|留言板|布告欄|電話|电话|市話|市话|座機|座机|手機門號|簡訊|短信|sms|無線電|无线电|對講機|对讲机|walkie|ham|收音機|收音机|廣播|广播|briar|meshtastic|mesh|藍牙|蓝牙|bluetooth|離線|离线|紙本|纸本|信件|郵寄|邮寄|in person|face to face|door|paper|note|landline|phone call|radio|walk/i;

  // 欄位定義。表單、序列化、列印版面與三語系文案都從這裡長出來，
  // 加一欄只要改這裡與 STRINGS，測試會盯著兩邊有沒有對齊。
  const FIELDS = [
    { id: "label", block: "meta", kind: "text" },
    { id: "date", block: "meta", kind: "text" },
    {
      id: "contacts",
      block: "contacts",
      kind: "repeat",
      min: 3,
      max: 5,
      parts: ["name", "primary", "backup"],
    },
    { id: "meetPlace", block: "meet", kind: "text" },
    { id: "meetWindow", block: "meet", kind: "text" },
    { id: "verify", block: "verify", kind: "text", sensitive: true },
    { id: "trigger", block: "trigger", kind: "choice", custom: "triggerCustom" },
    { id: "avoid", block: "avoid", kind: "multiline" },
  ];

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
      verify: "",
      trigger: "",
      triggerCustom: "",
      avoid: "",
    };
    for (let i = 0; i < contacts.min; i += 1) {
      state.contacts.push({ name: "", primary: "", backup: "" });
    }
    return state;
  }

  // 有填任何一欄就算一筆。三個欄位全空的那幾列在輸出與提醒裡都不算數。
  function filledContacts(state) {
    const rows = Array.isArray(state.contacts) ? state.contacts : [];
    return rows.filter((row) => row && (clean(row.name) || clean(row.primary) || clean(row.backup)));
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
      // 兩個管道都是網路服務的話，斷網當天會一起失效，而這正是這張卡要避開的
      if (ONLINE_CHANNELS.test(primary) && ONLINE_CHANNELS.test(backup) && !OFFLINE_CHANNELS.test(backup)) {
        out.push({ id: "backup-online", index: index });
      }
    });

    if (rows.length > 0) {
      if (!clean(state.meetPlace)) out.push({ id: "no-meet" });
      const trigger = clean(state.trigger);
      if (!trigger || (trigger === "custom" && !clean(state.triggerCustom))) {
        out.push({ id: "no-trigger" });
      }
    }
    if (clean(state.verify)) out.push({ id: "verify-filled" });
    return out;
  }

  // 卡片的純文字版。列印版面與下載的檔案共用這一份，兩邊看到的東西才會一樣。
  // 空欄位整段不出現，卡片上留白比留下一排標題有用。
  function serialize(state, t) {
    const parts = [];
    const head = [clean(state.label), clean(state.date)].filter(Boolean);
    if (head.length) parts.push(head.join("\n"));

    const rows = filledContacts(state);
    if (rows.length) {
      const lines = [t.blocks.contacts];
      rows.forEach((row, index) => {
        const bits = [];
        if (clean(row.primary)) bits.push(t.parts.primary + "：" + clean(row.primary));
        if (clean(row.backup)) bits.push(t.parts.backup + "：" + clean(row.backup));
        const name = clean(row.name) || t.parts.name;
        lines.push("  " + (index + 1) + ". " + name + (bits.length ? "　" + bits.join("　") : ""));
      });
      parts.push(lines.join("\n"));
    }

    const place = clean(state.meetPlace);
    const window_ = clean(state.meetWindow);
    if (place || window_) {
      parts.push(t.blocks.meet + "\n  " + [place, window_].filter(Boolean).join("　"));
    }

    if (clean(state.verify)) parts.push(t.blocks.verify + "\n  " + clean(state.verify));

    const trigger = clean(state.trigger);
    if (trigger) {
      const text = trigger === "custom" ? clean(state.triggerCustom) : t.triggers[trigger];
      if (text) parts.push(t.blocks.trigger + "\n  " + text);
    }

    const avoid = clean(state.avoid);
    if (avoid) {
      const lines = avoid.split("\n").map((line) => "  " + line.trim()).filter((line) => line.trim());
      parts.push(t.blocks.avoid + "\n" + lines.join("\n"));
    }

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
  // 列印那一段是站上第一份 @media print。做法是把整頁的東西藏起來，只留下四張卡，
  // 因為 mkdocs-material 的頁首、側欄與頁尾在紙上沒有意義，而讀者按下列印時要的
  // 是可以裁開分掉的卡片，不是一份網頁的複本。
  const CSS = `
    #shutdown-card-tool { margin: 1em 0; }
    #shutdown-card-tool fieldset {
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .2rem; padding: .8rem 1rem 1rem; margin: 0 0 1rem;
    }
    #shutdown-card-tool legend { font-size: .8rem; font-weight: 700; padding: 0 .4rem; }
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
      font: inherit; font-size: .76rem; color: inherit; background: transparent;
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
    #shutdown-card-tool .sc-cols > * { flex: 1 1 12rem; }
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
    #shutdown-card-tool .sc-status p { margin: 0; }
    #shutdown-card-tool .sc-sensitive {
      font-size: .7rem; line-height: 1.7; margin: -.4rem 0 .6rem;
      border-left: .15rem solid #ef6c00; padding-left: .6rem;
    }
    #shutdown-card-tool .sc-warn {
      font-size: .76rem; margin: .5rem 0 0; line-height: 1.7;
      border-left: .15rem solid #ef6c00; padding-left: .6rem;
    }
    #shutdown-card-tool .sc-preview {
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-left: .15rem solid #2e7d32;
      border-radius: .1rem; padding: .7rem; margin: .8rem 0 .4rem;
      font-family: var(--md-code-font-family, monospace);
      font-size: .72rem; line-height: 1.8; white-space: pre-wrap;
      word-break: break-word;
    }
    #shutdown-card-tool .sc-empty { font-size: .76rem; opacity: .75; line-height: 1.7; }
    #shutdown-card-tool .sc-print { display: none; }
    @media (pointer: coarse) {
      #shutdown-card-tool button { min-height: 2.2rem; }
      #shutdown-card-tool .sc-choice { padding: .4rem 0; }
      /* iOS Safari 在字級小於 16px 的輸入框聚焦時，會自動把整頁放大到那一欄，
         而且退出之後不會縮回去。使用者看到的是填一填版面就被撐開，跟工具壞掉
         沒有兩樣。16px 是那個門檻，剛好踩線的 15.2px 一樣會被放大。 */
      #shutdown-card-tool input[type="text"],
      #shutdown-card-tool textarea { font-size: 16px; }
    }
    @media print {
      /* 只留下從 body 到卡片的那一條路徑，路徑外的東西一律 display: none。
         原本用的是 visibility: hidden，那會把版面高度留著：紙上第一張是四張
         卡，後面跟著五到六張空白紙，而印之前沒有人看得出來。 */
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
      modeTitle: "草稿要暫存在哪裡",
      modeHint: "預設只留在這個分頁裡。卡片上有聯絡人與確認方式，要留多久由你決定。",
      modes: {
        session: "關掉分頁就消失",
        device: "在這台裝置上保留草稿",
        off: "完全不要暫存",
      },
      modeNotes: {
        session: "重新整理、切到別的頁再回來都還在。關掉分頁或關掉瀏覽器就沒了。",
        device: "隔天回來繼續改的話選這一項。裝置被別人取得時，草稿也在裡面。",
        off: "全程不寫任何東西，重新整理就是空白。填完直接輸出的話選這一項。",
      },
      status: {
        session: "草稿暫存在這個分頁裡，關掉分頁就會消失。",
        device: "草稿留在這台裝置上，關掉瀏覽器再打開還會在。",
        off: "目前沒有暫存任何東西，重新整理就會回到空白。",
      },
      clear: "清除草稿",
      cleared: "已清除，兩種暫存都沒有留下東西。",
      fields: {
        label: "卡片標籤",
        date: "版本日期",
        contacts: "聯絡人",
        meetPlace: "會合地點",
        meetWindow: "時間窗",
        verify: "如何確認是本人",
        trigger: "多久沒消息就啟動",
        avoid: "不要透過卡上管道談的事",
      },
      hints: {
        label: "這張卡是誰的、第幾版。共同的約定會改版，沒有標示就會出現兩個人手上版本不同。",
        date: "改過內容就換一個日期，收到卡的人才知道手上是最新的那一份。",
        contacts: "中斷時你必須聯絡上的人。清單要短，三到五位，多了記不住也對不完。",
        meetPlace: "通訊全部中斷時去哪裡找對方。選雙方都熟、不必先確認就到得了的地方。",
        meetWindow: "每天或每週固定的一段時間，時間短一點比較容易守住。",
        verify: "透過陌生管道收到訊息時，用什麼確認對方確實是他。",
        trigger: "超過這段時間就照約定行動，不必再等確認。",
        avoid: "卡上的管道都假設不可信。一行一項。",
      },
      parts: {
        name: "名稱或代號",
        primary: "主要管道",
        backup: "備援管道",
      },
      placeholders: {
        label: "誰的卡、第幾版",
        date: "2026-10-04",
        name: "代號或小名",
        primary: "平常聯絡用的方式",
        backup: "不經過網際網路的方式",
        meetPlace: "雙方都熟的地點",
        meetWindow: "每日 18:00 到 19:00",
        verify: "只有你們知道的線索",
        triggerCustom: "自己填，例如兩個工作天",
        avoid: "一行一項",
      },
      blocks: {
        contacts: "聯絡人",
        meet: "會合點",
        verify: "確認本人",
        trigger: "沒消息多久就啟動",
        avoid: "不要在卡上的管道談",
      },
      triggers: {
        h6: "6 小時",
        h12: "12 小時",
        d1: "24 小時",
        d3: "3 天",
        custom: "自己填",
      },
      sensitiveNote: "這一欄外洩的話，冒充你的人就能通過驗證。寫線索，答案留在腦袋裡。",
      addContact: "增加一位",
      removeContact: "移除",
      contactLimit: "最多五位。清單短才記得住。",
      warnTitle: "填完值得再看一眼",
      warns: {
        "too-few-contacts": "目前只有一到兩位。清單短是對的，只有一個聯絡點的話，那個人自己失聯時整張卡就停住了。",
        "backup-same": "第 {n} 位的主要管道與備援管道填了同一個。備援的用處在於主要管道不通時還有路走。",
        "backup-online": "第 {n} 位的兩個管道都需要網路，斷網當天會一起失效。備援至少留一個不經過網際網路的方式，例如見面、市話或紙條。",
        "no-meet": "還沒填會合地點。通訊全部中斷時，一個雙方都知道的地點加上時間窗，是最後一條路。",
        "no-trigger": "還沒填多久沒消息就啟動。沒有時間界線的話，真的發生時每個人都會再等一下，而等待會拖掉可以行動的時間。",
        "verify-filled": "確認本人那一欄有內容了。這一欄外洩的話，冒充你的人就能通過驗證，印出來之後放在你保護得住的地方。",
      },
      previewTitle: "卡片內容",
      empty: "填幾欄之後，卡片的內容會出現在這裡。",
      print: "列印，一張 A4 四張卡",
      printBusy: "準備列印",
      printNote: "紙上只會有四張卡，表單與網站的頁首頁尾都不會印出來。四張內容一樣，裁開分給約定裡的其他人。手機上按了之後要等幾秒，列印選項通常在分享選單裡。",
      download: "下載純文字",
      downloadName: "shutdown-card.txt",
      afterOutput: "已經輸出。要清掉這台裝置上的草稿嗎",
      afterOutputYes: "清掉",
      afterOutputNo: "留著",
    },
    zh: {
      modeTitle: "草稿要暂存在哪里",
      modeHint: "默认只留在这个标签页里。卡片上有联系人与确认方式，要留多久由你决定。",
      modes: {
        session: "关掉标签页就消失",
        device: "在这台设备上保留草稿",
        off: "完全不要暂存",
      },
      modeNotes: {
        session: "刷新、切到别的页面再回来都还在。关掉标签页或关掉浏览器就没了。",
        device: "隔天回来继续改的话选这一项。设备被别人取得时，草稿也在里面。",
        off: "全程不写任何东西，刷新就是空白。填完直接输出的话选这一项。",
      },
      status: {
        session: "草稿暂存在这个标签页里，关掉标签页就会消失。",
        device: "草稿留在这台设备上，关掉浏览器再打开还会在。",
        off: "目前没有暂存任何东西，刷新就会回到空白。",
      },
      clear: "清除草稿",
      cleared: "已清除，两种暂存都没有留下东西。",
      fields: {
        label: "卡片标签",
        date: "版本日期",
        contacts: "联系人",
        meetPlace: "会合地点",
        meetWindow: "时间窗",
        verify: "如何确认是本人",
        trigger: "多久没消息就启动",
        avoid: "不要通过卡上渠道谈的事",
      },
      hints: {
        label: "这张卡是谁的、第几版。共同的约定会改版，没有标示就会出现两个人手上版本不同。",
        date: "改过内容就换一个日期，收到卡的人才知道手上是最新的那一份。",
        contacts: "中断时你必须联系上的人。清单要短，三到五位，多了记不住也对不完。",
        meetPlace: "通信全部中断时去哪里找对方。选双方都熟、不必先确认就到得了的地方。",
        meetWindow: "每天或每周固定的一段时间，时间短一点比较容易守住。",
        verify: "通过陌生渠道收到消息时，用什么确认对方确实是他。",
        trigger: "超过这段时间就照约定行动，不必再等确认。",
        avoid: "卡上的渠道都假设不可信。一行一项。",
      },
      parts: {
        name: "名称或代号",
        primary: "主要渠道",
        backup: "备用渠道",
      },
      placeholders: {
        label: "谁的卡、第几版",
        date: "2026-10-04",
        name: "代号或小名",
        primary: "平常联系用的方式",
        backup: "不经过互联网的方式",
        meetPlace: "双方都熟的地点",
        meetWindow: "每日 18:00 到 19:00",
        verify: "只有你们知道的线索",
        triggerCustom: "自己填，例如两个工作日",
        avoid: "一行一项",
      },
      blocks: {
        contacts: "联系人",
        meet: "会合点",
        verify: "确认本人",
        trigger: "没消息多久就启动",
        avoid: "不要在卡上的渠道谈",
      },
      triggers: {
        h6: "6 小时",
        h12: "12 小时",
        d1: "24 小时",
        d3: "3 天",
        custom: "自己填",
      },
      sensitiveNote: "这一栏外泄的话，冒充你的人就能通过验证。写线索，答案留在脑袋里。",
      addContact: "增加一位",
      removeContact: "移除",
      contactLimit: "最多五位。清单短才记得住。",
      warnTitle: "填完值得再看一眼",
      warns: {
        "too-few-contacts": "目前只有一到两位。清单短是对的，只有一个联系点的话，那个人自己失联时整张卡就停住了。",
        "backup-same": "第 {n} 位的主要渠道与备用渠道填了同一个。备用的用处在于主要渠道不通时还有路走。",
        "backup-online": "第 {n} 位的两个渠道都需要网络，断网当天会一起失效。备用至少留一个不经过互联网的方式，例如见面、固话或纸条。",
        "no-meet": "还没填会合地点。通信全部中断时，一个双方都知道的地点加上时间窗，是最后一条路。",
        "no-trigger": "还没填多久没消息就启动。没有时间界线的话，真的发生时每个人都会再等一下，而等待会拖掉可以行动的时间。",
        "verify-filled": "确认本人那一栏有内容了。这一栏外泄的话，冒充你的人就能通过验证，打印出来之后放在你保护得住的地方。",
      },
      previewTitle: "卡片内容",
      empty: "填几栏之后，卡片的内容会出现在这里。",
      print: "打印，一张 A4 四张卡",
      printBusy: "准备打印",
      printNote: "纸上只会有四张卡，表单与站点的页眉页脚都不会打印出来。四张内容一样，裁开分给约定里的其他人。手机上按了之后要等几秒，打印选项通常在分享菜单里。",
      download: "下载纯文本",
      downloadName: "shutdown-card.txt",
      afterOutput: "已经输出。要清掉这台设备上的草稿吗",
      afterOutputYes: "清掉",
      afterOutputNo: "留着",
    },
    en: {
      modeTitle: "Where the draft is kept",
      modeHint: "By default it stays in this tab only. The card holds contacts and a verification method, so how long to keep it is your call.",
      modes: {
        session: "Gone when you close the tab",
        device: "Keep the draft on this device",
        off: "Keep nothing at all",
      },
      modeNotes: {
        session: "Reloading or navigating away and back keeps it. Closing the tab or the browser clears it.",
        device: "Pick this if you want to come back tomorrow and edit. If someone gets the device, the draft is on it too.",
        off: "Nothing is written at any point, and a reload gives you a blank form. Pick this if you are filling it in and printing right away.",
      },
      status: {
        session: "The draft is held in this tab. Closing the tab clears it.",
        device: "The draft is kept on this device and survives closing the browser.",
        off: "Nothing is being kept. A reload gives you a blank form.",
      },
      clear: "Clear the draft",
      cleared: "Cleared. Neither kind of storage has anything left in it.",
      fields: {
        label: "Card label",
        date: "Version date",
        contacts: "People",
        meetPlace: "Meeting place",
        meetWindow: "Time window",
        verify: "How to confirm it is really them",
        trigger: "How long without word before you act",
        avoid: "Not to be discussed over the channels on this card",
      },
      hints: {
        label: "Whose card this is and which version. Shared agreements get revised, and without a label two people end up holding different versions.",
        date: "Change the date whenever the content changes, so whoever holds the card knows it is the current one.",
        contacts: "The people you have to reach during an outage. Keep the list short, three to five, or nobody will remember it.",
        meetPlace: "Where to find each other when every channel is down. Pick somewhere both of you know and can reach without checking first.",
        meetWindow: "A fixed slot each day or each week. A short one is easier to hold to.",
        verify: "What tells you a message from an unfamiliar channel really came from them.",
        trigger: "Past this point you act on the agreement without waiting for confirmation.",
        avoid: "Every channel on this card is assumed to be readable by someone else. One item per line.",
      },
      parts: {
        name: "Name or code name",
        primary: "Main channel",
        backup: "Backup channel",
      },
      placeholders: {
        label: "Whose card, which version",
        date: "2026-10-04",
        name: "Code name or nickname",
        primary: "How you normally reach them",
        backup: "Something that does not go over the internet",
        meetPlace: "A place you both know",
        meetWindow: "Daily, 18:00 to 19:00",
        verify: "A cue only the two of you would know",
        triggerCustom: "Your own, for example two working days",
        avoid: "One item per line",
      },
      blocks: {
        contacts: "People",
        meet: "Meeting point",
        verify: "Confirming identity",
        trigger: "Act after this long without word",
        avoid: "Not over the channels on this card",
      },
      triggers: {
        h6: "6 hours",
        h12: "12 hours",
        d1: "24 hours",
        d3: "3 days",
        custom: "Your own",
      },
      sensitiveNote: "If this field leaks, whoever impersonates you passes the check. Write a cue, and keep the answer in your head.",
      addContact: "Add a person",
      removeContact: "Remove",
      contactLimit: "Five at most. A short list is one you can remember.",
      warnTitle: "Worth a second look before you print",
      warns: {
        "too-few-contacts": "Only one or two people so far. A short list is right, but with a single point of contact the whole card stalls the moment that person is the one who is unreachable.",
        "backup-same": "Person {n} has the same entry for the main and the backup channel. A backup earns its place by working when the main one does not.",
        "backup-online": "Both channels for person {n} need the internet, so they fail together on the day it matters. Leave at least one backup that does not go over the internet, such as meeting in person, a landline, or a note.",
        "no-meet": "No meeting place yet. When every channel is down, a place both of you know plus a time window is the last route left.",
        "no-trigger": "No waiting time yet. Without one, everybody waits a little longer when it actually happens, and the waiting eats the time you could have acted in.",
        "verify-filled": "The verification field has content. If it leaks, whoever impersonates you passes the check, so keep the printed card somewhere you can protect.",
      },
      previewTitle: "Card content",
      empty: "Fill in a few fields and the card content appears here.",
      print: "Print, four cards per A4 sheet",
      printBusy: "Preparing",
      printNote: "Only the four cards reach the paper. The form and the site header and footer are left out. All four are identical, so cut them apart and hand them to the others in the agreement. On a phone it takes a few seconds, and the print option usually sits in the share menu.",
      download: "Download as plain text",
      downloadName: "shutdown-card.txt",
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
      base.contacts = saved.contacts.slice(0, contactSpec.max).map((row) => ({
        name: row && typeof row.name === "string" ? row.name : "",
        primary: row && typeof row.primary === "string" ? row.primary : "",
        backup: row && typeof row.backup === "string" ? row.backup : "",
      }));
      while (base.contacts.length < contactSpec.min) {
        base.contacts.push({ name: "", primary: "", backup: "" });
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

  const formBox = el("div");
  const contactsBox = el("div");
  const warnBox = el("div");
  const previewBox = el("div", "sc-preview");
  const askBox = el("div", "sc-row");
  const printBox = el("div", "sc-print");

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

  function renderContacts() {
    contactsBox.textContent = "";
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
    });

    const foot = el("div", "sc-row");
    const add = el("button", null, t.addContact);
    add.disabled = state.contacts.length >= contactSpec.max;
    add.addEventListener("click", () => {
      if (state.contacts.length >= contactSpec.max) return;
      state.contacts.push({ name: "", primary: "", backup: "" });
      renderContacts();
      refresh();
    });
    foot.appendChild(add);
    if (state.contacts.length >= contactSpec.max) {
      foot.appendChild(el("span", "sc-hint", t.contactLimit));
    }
    contactsBox.appendChild(foot);
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

    const meta = section(t.fields.label);
    meta.appendChild(labelled(t.fields.label, t.hints.label,
      textInput("label", (value) => { state.label = value; }, state.label)));
    meta.appendChild(labelled(t.fields.date, t.hints.date,
      textInput("date", (value) => { state.date = value; }, state.date)));
    formBox.appendChild(meta);

    const contacts = section(t.fields.contacts, t.hints.contacts);
    contacts.appendChild(contactsBox);
    formBox.appendChild(contacts);
    renderContacts();

    const meet = section(t.blocks.meet);
    meet.appendChild(labelled(t.fields.meetPlace, t.hints.meetPlace,
      textInput("meetPlace", (value) => { state.meetPlace = value; }, state.meetPlace)));
    meet.appendChild(labelled(t.fields.meetWindow, t.hints.meetWindow,
      textInput("meetWindow", (value) => { state.meetWindow = value; }, state.meetWindow)));
    formBox.appendChild(meet);

    const verify = section(t.fields.verify, t.hints.verify);
    verify.appendChild(textInput("verify", (value) => { state.verify = value; }, state.verify));
    // 敏感提示常駐，不等使用者填了才出現。填的當下才是需要看到它的時候
    verify.appendChild(el("p", "sc-sensitive", t.sensitiveNote));
    formBox.appendChild(verify);

    const trigger = section(t.fields.trigger, t.hints.trigger);
    for (const item of TRIGGERS) {
      trigger.appendChild(choice("sc-trigger", state.trigger === item.id, t.triggers[item.id], null, () => {
        state.trigger = item.id;
        refresh();
      }));
    }
    trigger.appendChild(textInput("triggerCustom", (value) => {
      state.triggerCustom = value;
      state.trigger = "custom";
    }, state.triggerCustom));
    formBox.appendChild(trigger);

    const avoid = section(t.fields.avoid, t.hints.avoid);
    const area = document.createElement("textarea");
    area.placeholder = t.placeholders.avoid;
    area.value = state.avoid;
    area.addEventListener("input", () => {
      state.avoid = area.value;
      refresh();
    });
    avoid.appendChild(area);
    formBox.appendChild(avoid);
  }

  function renderStatus() {
    statusText.textContent = t.status[state.mode] || t.status.off;
    clearButton.disabled = false;
  }

  function renderWarnings() {
    warnBox.textContent = "";
    const list = warnings(state);
    if (!list.length) return;
    warnBox.appendChild(el("p", "sc-hint", t.warnTitle));
    for (const item of list) {
      const text = fill(t.warns[item.id], { n: (item.index || 0) + 1 });
      warnBox.appendChild(el("p", "sc-warn", text));
    }
  }

  function renderPreview() {
    const text = serialize(state, t);
    previewBox.textContent = text;
    previewBox.className = text ? "sc-preview" : "sc-empty";
    if (!text) previewBox.textContent = t.empty;

    // 四張一樣的卡。約定是三到五個人共有的，一次印完裁開分掉
    printBox.textContent = "";
    if (!text) return;
    for (let i = 0; i < 4; i += 1) printBox.appendChild(el("div", "sc-card", text));
  }

  function refresh() {
    renderStatus();
    renderWarnings();
    renderPreview();
    saveDraft(state, stores);
  }

  // 輸出完主動問一次。彈窗會被順手關掉，所以問句就長在按鈕下面，
  // 選了哪一邊都把它收起來，不留一個永遠在那裡的提示
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
    renderStatus();
    renderWarnings();
    renderPreview();
    askBox.textContent = "";
    statusText.textContent = t.cleared;
  }

  clearButton.addEventListener("click", wipe);

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
        // 桌機的 print 回來時已經印完，手機是非同步的，這裡只負責把按鈕恢復。
        // 紙上印什麼由 CSS 決定，不受這個計時器影響
        window.setTimeout(done, 600);
      }
    }));
  });
  const downloadButton = el("button", null, t.download);
  downloadButton.addEventListener("click", () => {
    const text = serialize(state, t);
    if (!text) return;
    const blob = new Blob([text + "\n"], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = t.downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    askToClear();
  });
  actions.appendChild(printButton);
  actions.appendChild(downloadButton);

  // 有些瀏覽器不送 afterprint，那種情況就只是少問一次，不影響輸出
  window.addEventListener("afterprint", askToClear);

  root.appendChild(statusBox);
  root.appendChild(formBox);
  root.appendChild(warnBox);
  root.appendChild(el("p", "sc-hint", t.previewTitle));
  root.appendChild(previewBox);
  root.appendChild(actions);
  root.appendChild(askBox);
  root.appendChild(el("p", "sc-hint", t.printNote));
  root.appendChild(printBox);

  buildForm();
  refresh();
})();
