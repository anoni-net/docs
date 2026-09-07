/*
 * 威脅模型清單（utils/threat-model.md）。
 *
 * basics/threat-model.md 講完三題之後給了一段操作流程：「拿一張紙或開個共筆，依序
 * 回答」。這一頁把那張紙變成可以按的東西，答完產出一份可複製的摘要，並指出答案裡
 * 的錯配。
 *
 * 分級語彙全部沿用那篇文章：資產四類（資訊、行為記錄、連結關係、能力與資源）、
 * 對手六級（隨意路人到國家級情報）、成本三級。這一頁不發明新詞，讀者在文章與工具
 * 之間來回時看到的是同一套說法。
 *
 * 真正的價值在 RULES 裡的 warn 那幾條。文章說「少了第二題，會用大砲打蚊子或用蚊香
 * 擋大砲」，這一頁把那句話變成具體的檢查：對手選了國家級情報卻只願意付出最低成本、
 * 要防親密關係卻沒把裝置列進資產、只防隨意路人卻打算大改工作流程。這些組合人自己
 * 填的時候看不出來，並排列出來就很明顯。
 *
 * === 預設不存，存要讀者自己按 ===
 *
 * 這一支自己不碰 localStorage、sessionStorage 或 IndexedDB，重新整理就沒了。要留一份
 * 有兩條路，都要讀者按：「複製摘要」貼到自己選的地方，或「存進我的暫存區」經
 * window.anoniVault（docs/zh-TW/js/vault.js）用 passkey 加密寫進這台裝置，跟我的準備
 * 清單同一份密文，這裡只動 threatModel 欄位。
 *
 * 對手含親密關係、一國執法或國家級時不提供存檔，規則在 canStore()。這幾種對手碰得到
 * 裝置，也可能要求解鎖，passkey 沒有比螢幕鎖更強。「我要防的是親密關係的人」這種
 * 答案留在對方碰得到的裝置上，正好是家暴情境裡最不該留的東西。那時只剩複製摘要。
 * tools/test_threatmodel.mjs 守這三件事：不直接碰儲存空間、只經 anoniVault、那幾種
 * 對手選了就不提供。
 *
 * 三個語系共用這一份，docs/en/js/ 與 docs/zh-CN/js/ 底下是指向這裡的 symlink。
 * 純邏輯由 tools/test_threatmodel.mjs 原地抽出來測。
 */
(function () {
  "use strict";

  // --- 純邏輯（tools/test_threatmodel.mjs 從這裡原地抽出來測）---

  // 資產分四類，跟 basics/threat-model.md 的第一題一致。group 只用來分組顯示。
  const ASSETS = [
    { id: "identity", group: "info" },
    { id: "content", group: "info" },
    { id: "credentials", group: "info" },
    { id: "browsing", group: "behaviour" },
    { id: "location", group: "behaviour" },
    { id: "contacts", group: "links" },
    { id: "sources", group: "links" },
    { id: "device", group: "capacity" },
  ];

  // 對手六級，power 是文章裡那條能力階梯的位置。數字只用來比大小，
  // 判斷「這份清單裡最強的對手是誰」。
  const ADVERSARIES = [
    { id: "passerby", power: 1 },
    { id: "intimate", power: 2 },
    { id: "employer", power: 3 },
    { id: "platform", power: 4 },
    { id: "police", power: 5 },
    { id: "state", power: 6 },
  ];

  const BUDGETS = ["low", "mid", "high"];

  const has = (list, id) => list.indexOf(id) >= 0;

  function topPower(adversaries) {
    let top = 0;
    for (const item of ADVERSARIES) {
      if (has(adversaries, item.id) && item.power > top) top = item.power;
    }
    return top;
  }

  // 這幾種對手碰得到裝置、也可能要求解鎖，答案留在裝置上等於交給對方。選了就不提供存檔。
  const NO_STORE = ["intimate", "police", "state"];
  function canStore(adversaries) {
    if (!adversaries.length) return false;
    return !NO_STORE.some((id) => has(adversaries, id));
  }

  // 每一條規則看同一份答案，各自決定要不要出聲。kind 是 warn 的排在建議前面，
  // 因為錯配比「還可以讀什麼」重要。
  //
  // page 是站上真的存在的頁面，相對路徑從 utils/threat-model/ 出發。
  // tools/test_threatmodel.mjs 會逐一檢查檔案在不在，連結爛掉會紅。
  const RULES = [
    {
      id: "no-adversary",
      kind: "warn",
      when: (s) => s.adversaries.length === 0,
    },
    {
      id: "state-low-budget",
      kind: "warn",
      when: (s) => (has(s.adversaries, "state") || has(s.adversaries, "police")) && s.budget === "low",
    },
    {
      id: "intimate-without-device",
      kind: "warn",
      when: (s) => has(s.adversaries, "intimate") && !has(s.assets, "device"),
    },
    {
      id: "overkill",
      kind: "warn",
      when: (s) => s.adversaries.length > 0 && topPower(s.adversaries) <= 1 && s.budget === "high",
    },
    {
      id: "sources-without-contacts",
      kind: "warn",
      when: (s) => has(s.assets, "sources") && !has(s.assets, "contacts"),
    },
    {
      id: "too-many-adversaries",
      kind: "warn",
      when: (s) => s.adversaries.length >= 5,
    },
    {
      id: "no-asset",
      kind: "warn",
      when: (s) => s.assets.length === 0,
    },
    {
      id: "baseline",
      kind: "read",
      page: "../../scenarios/everyday-baseline/",
      when: () => true,
    },
    {
      id: "journalist",
      kind: "read",
      page: "../../scenarios/journalist/",
      when: (s) => has(s.assets, "sources"),
    },
    {
      id: "domestic",
      kind: "read",
      page: "../../scenarios/domestic-violence/",
      when: (s) => has(s.adversaries, "intimate"),
    },
    {
      id: "activist",
      kind: "read",
      page: "../../scenarios/activist/",
      when: (s) => has(s.adversaries, "police") && has(s.assets, "contacts"),
    },
    {
      id: "metadata",
      kind: "read",
      page: "../../basics/metadata/",
      when: (s) => has(s.assets, "location") || has(s.assets, "contacts"),
    },
    {
      id: "platform-tracking",
      kind: "read",
      page: "../../basics/platform-tracking/",
      when: (s) => has(s.adversaries, "platform"),
    },
    {
      id: "multiple-identities",
      kind: "read",
      page: "../../basics/multiple-identities/",
      when: (s) => has(s.assets, "identity") &&
        (has(s.adversaries, "employer") || has(s.adversaries, "platform")),
    },
    {
      id: "surveillance",
      kind: "read",
      page: "../../basics/surveillance-capability/",
      when: (s) => topPower(s.adversaries) >= 5,
    },
    {
      id: "password-manager",
      kind: "read",
      page: "../../tools/password-manager/",
      when: (s) => has(s.assets, "credentials"),
    },
    {
      id: "messaging",
      kind: "read",
      page: "../../tools/messaging-comparison/",
      when: (s) => has(s.assets, "contacts") || has(s.assets, "content"),
    },
    {
      id: "tor",
      kind: "read",
      page: "../../tools/what-is-tor/",
      when: (s) => has(s.assets, "browsing") && topPower(s.adversaries) >= 3,
    },
    {
      id: "tails",
      kind: "read",
      page: "../../tools/what-is-tails/",
      when: (s) => has(s.assets, "device") && topPower(s.adversaries) >= 4,
    },
    {
      id: "compare-os",
      kind: "read",
      page: "../../tools/tails-vs-whonix-vs-qubes/",
      when: (s) => topPower(s.adversaries) >= 5 && s.budget === "high",
    },
    {
      id: "fingerprinting",
      kind: "read",
      page: "../../basics/browser-fingerprinting/",
      when: (s) => has(s.assets, "browsing") && has(s.adversaries, "platform"),
    },
  ];

  // 答案進來，出去的是分好類的規則 id。文案在 STRINGS 那邊查。
  function evaluate(state) {
    const answers = {
      assets: state.assets || [],
      adversaries: state.adversaries || [],
      budget: state.budget || "",
    };
    const warns = [];
    const reads = [];
    for (const rule of RULES) {
      if (!rule.when(answers)) continue;
      if (rule.kind === "warn") warns.push({ id: rule.id });
      else reads.push({ id: rule.id, page: rule.page });
    }
    return { warns: warns, reads: reads, answered: answers };
  }

  // 產出一段純文字，讓讀者自己決定要貼到哪裡。這一頁不替他保存。
  function summarize(state, strings, today) {
    const t = strings;
    const result = evaluate(state);
    const lines = [t.summaryTitle + "（" + today + "）", ""];

    const section = (heading, items, fallback) => {
      lines.push(heading);
      if (!items.length) lines.push("- " + fallback);
      else for (const item of items) lines.push("- " + item);
      lines.push("");
    };

    section(t.q1, (state.assets || []).map((id) => t.assets[id]), t.none);
    section(t.q2, (state.adversaries || []).map((id) => t.adversaries[id]), t.none);
    section(t.q3, state.budget ? [t.budgets[state.budget]] : [], t.none);
    if (result.warns.length) {
      section(t.warnTitle, result.warns.map((w) => t.warns[w.id]), t.none);
    }
    section(t.readTitle, result.reads.map((r) => t.reads[r.id]), t.none);
    lines.push(t.summaryFoot);
    return lines.join("\n");
  }

  // --- 介面 ---

  const root = document.getElementById("threatmodel-tool");
  if (!root) return;

  const CSS = `
    #threatmodel-tool { margin: 1em 0; }
    #threatmodel-tool fieldset {
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .2rem; padding: .8rem 1rem 1rem; margin: 0 0 1rem;
    }
    #threatmodel-tool legend { font-size: .8rem; font-weight: 700; padding: 0 .4rem; }
    #threatmodel-tool .tm-hint { font-size: .72rem; opacity: .75; line-height: 1.7; margin: 0 0 .6rem; }
    #threatmodel-tool .tm-group { font-size: .7rem; opacity: .6; margin: .7rem 0 .3rem; }
    #threatmodel-tool .tm-group:first-of-type { margin-top: 0; }
    #threatmodel-tool label {
      display: flex; gap: .5rem; align-items: flex-start;
      font-size: .76rem; line-height: 1.7; padding: .25rem 0; cursor: pointer;
    }
    #threatmodel-tool input[type="checkbox"], #threatmodel-tool input[type="radio"] {
      margin: .35rem 0 0; flex: none;
    }
    #threatmodel-tool .tm-note { font-size: .7rem; opacity: .7; }
    #threatmodel-tool button {
      font: inherit; color: inherit; cursor: pointer; background: none;
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .35rem .8rem;
    }
    #threatmodel-tool button:hover:not(:disabled) {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #threatmodel-tool button:disabled { opacity: .5; cursor: default; }
    #threatmodel-tool .tm-row { display: flex; flex-wrap: wrap; gap: .5rem; margin: 0 0 1rem; }
    #threatmodel-tool .tm-warn {
      font-size: .76rem; margin: .6rem 0 0; line-height: 1.7;
      border-left: .15rem solid #ef6c00; padding-left: .6rem;
    }
    #threatmodel-tool .tm-reads { list-style: none; margin: .6rem 0 0; padding: 0; }
    #threatmodel-tool .tm-reads li { font-size: .76rem; line-height: 1.7; margin: 0 0 .4rem; }
    #threatmodel-tool .tm-out {
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-left: .15rem solid #2e7d32;
      border-radius: .1rem; padding: .7rem; margin: .8rem 0 .4rem;
      font-family: var(--md-code-font-family, monospace);
      font-size: .72rem; line-height: 1.8; white-space: pre-wrap;
      word-break: break-word; user-select: all;
    }
    #threatmodel-tool .tm-empty { font-size: .76rem; opacity: .75; line-height: 1.7; }
    #threatmodel-tool .tm-store {
      border: .05rem dashed var(--md-default-fg-color--lighter);
      border-radius: .2rem; padding: .6rem .8rem; margin: .8rem 0 1rem;
    }
    #threatmodel-tool .tm-store .tm-group { margin-top: 0; }
    #threatmodel-tool .tm-store .tm-row { margin-bottom: 0; }
    #threatmodel-tool .tm-store .tm-warn { margin-bottom: .6rem; }
    #threatmodel-tool .tm-saved { font-size: .72rem; margin: 0 0 .5rem; }
    #threatmodel-tool button[aria-busy="true"] { opacity: .7; }
    @media (pointer: coarse) {
      #threatmodel-tool button { min-height: 2.2rem; }
      #threatmodel-tool label { padding: .4rem 0; }
    }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const STRINGS = {
    "zh-TW": {
      q1: "要保護什麼",
      q1hint: "挑最不想被別人取得、看到或破壞的那幾項。挑三到五項就夠，全選等於沒挑。",
      q2: "要防誰，他們有什麼能力",
      q2hint: "對手的能力決定工具怎麼選。同時防兩三個層級是常態，防五個以上通常表示這份清單想涵蓋太多場景。",
      q3: "願意付出多少成本",
      q3hint: "撐不到三個月的方案等於沒有方案。照實填，不要填理想值。",
      groups: {
        info: "資訊",
        behaviour: "行為記錄",
        links: "連結關係",
        capacity: "能力與資源",
      },
      assets: {
        identity: "身分相關（本名、住址、職業、家人位置）",
        content: "內容相關（私人對話、未公開的相片、研究中的草稿）",
        credentials: "憑證相關（登入憑證、銀行帳戶、加密貨幣金鑰）",
        browsing: "造訪過哪些網站、買了什麼",
        location: "何時何地出現過",
        contacts: "跟誰通訊、誰是我的聯絡人",
        sources: "誰是我的消息來源",
        device: "裝置本身（被拿去、被檢查、被扣押）",
      },
      adversaries: {
        passerby: "隨意路人：看得到公開貼文，沒有更深入的能力",
        intimate: "親密關係：能取得裝置、讀訊息、知道習慣與口令",
        employer: "雇主或學校：能控管工作裝置的網路流量、讀取公司帳號",
        platform: "平台業者：能看到你在他們服務上的所有活動，必要時依法令交出",
        police: "一國執法：能向業者調閱資料、必要時搜索扣押",
        state: "國家級情報：能做大規模流量監控、能對特定目標投入鎖定攻擊資源",
      },
      budgets: {
        low: "低：不想改變日常習慣，最多花一個下午設定一次",
        mid: "中：可以學新工具，接受每次多幾個步驟",
        high: "高：可以改變工作流程，接受明顯的不便",
      },
      warns: {
        "no-adversary": "第二題沒有選。少了對手這一題，工具選擇沒有對照的對象，最後會變成照別人的清單抄。",
        "no-asset": "第一題沒有選。少了資產這一題，會把力氣花在不重要的東西上。",
        "state-low-budget": "對手選到執法或國家級，成本卻填最低。這個組合撐不住，兩邊要動一邊：把對手範圍縮到真正會發生的那一級，或把成本上限拉高。",
        "intimate-without-device": "要防親密關係的人，卻沒有把裝置列進要保護的東西。這一級對手最常用的路徑就是取得你的手機或電腦，密碼與螢幕鎖通常比選什麼通訊軟體更關鍵。",
        overkill: "只防隨意路人，卻打算大改工作流程。這是用大砲打蚊子，投入的力氣多半會在幾週後放棄。",
        "sources-without-contacts": "要保護消息來源的身分，卻沒有把聯絡關係列進來。誰跟誰通訊本身就是線索，內容加密擋不住這一層。",
        "too-many-adversaries": "選了五個以上的對手。一份清單對應一個場景比較有用，工作與私人生活的威脅模型分開寫，各自都會更清楚。",
      },
      reads: {
        baseline: "一般人平常該做到什麼：所有情境都要做到的那些",
        journalist: "記者保護消息來源：接觸、交換檔案、刊出後的整理",
        domestic: "家暴受害者的數位準備：在對方碰得到裝置的前提下重建界線",
        activist: "社運行動者的數位準備：動員前、現場與行動之後",
        metadata: "Metadata 是什麼：為什麼位置與聯絡關係擋不住內容加密",
        "platform-tracking": "社群平台怎麼收集你的資料：他們實際拿得到什麼",
        "multiple-identities": "怎麼維持多個網路身分：要幾層、怎麼撐住",
        surveillance: "監控現在做得到什麼：按四層列出能力邊界與證據",
        "password-manager": "密碼管理器：憑證這一類資產的第一道",
        messaging: "通訊軟體比較：內容與聯絡關係各自被誰看得到",
        tor: "Tor 是什麼：把造訪紀錄跟你切開",
        tails: "Tails 是什麼：用完不留痕跡的作業系統",
        "compare-os": "Tails、Whonix 與 Qubes 比較：投入高成本時怎麼選",
        fingerprinting: "瀏覽器指紋：換 IP 擋不住的那一層",
      },
      summaryTitle: "我的威脅模型",
      summaryFoot: "這份清單是活的。換工作、換伴侶、換城市、開始參與新議題時回頭看一次。",
      warnTitle: "要注意的錯配",
      readTitle: "建議先讀",
      none: "（沒有填）",
      build: "產生摘要",
      rebuild: "重新產生",
      copy: "複製摘要",
      copied: "已複製",
      reset: "全部清掉",
      store: {
        title: "留一份在這台裝置（選用）",
        hint: "用你的 passkey 加密存進這台裝置的暫存區，跟我的準備清單同一份密文。站上什麼都不收。",
        notOffered: "對手選了親密關係、一國執法或國家級，這裡不提供存檔。他們碰得到你的裝置，也可能要求你解鎖，passkey 沒有比螢幕鎖更強。要留一份就按「複製摘要」，貼到對方碰不到的地方，例如抄在紙上收好，或貼進對方沒有密碼的帳號。",
        restore: "用 passkey 填回上次的答案",
        restoreHint: "這台裝置的暫存區有東西。上次存過威脅模型的話，解開就填回來。",
        restoreEmpty: "暫存區裡沒有存過威脅模型。",
        save: "存進我的暫存區",
        update: "更新存檔",
        savedOn: "已存，{date}。",
        remove: "刪掉存檔",
        removed: "刪掉了。暫存區裡其他東西沒動。",
        lock: "鎖上",
        openExisting: "用我已有的鑰匙開",
        createNew: "建一把新的鑰匙",
        chooseHint: "這台裝置還沒有暫存區。已經在鑰匙頁建過 anoni.net 的 passkey 就用它開，還沒有的話建一把新的。",
        waiting: "等你在瀏覽器的提示裡完成",
        errors: {
          cancelled: "你取消了，或瀏覽器沒有完成。再按一次。",
          unsupported: "這個環境不允許用 passkey。要在正式站、https 網址，瀏覽器也沒有把功能關掉。",
          failed: "沒有成功。換一個瀏覽器或密碼管理器試試。",
        },
      },
      empty: "三題都答完再按「產生摘要」。答案預設不存，重新整理就沒了。",
      note: "答案預設只留在這個分頁裡，不送出去。要留一份，按「複製摘要」貼到你自己選的地方，或用 passkey 加密存進這台裝置的暫存區。兩種都要你自己按。",
    },
    zh: {
      q1: "要保护什么",
      q1hint: "挑最不想被别人取得、看到或破坏的那几项。挑三到五项就够，全选等于没挑。",
      q2: "要防谁，他们有什么能力",
      q2hint: "对手的能力决定工具怎么选。同时防两三个层级是常态，防五个以上通常表示这份清单想涵盖太多场景。",
      q3: "愿意付出多少成本",
      q3hint: "撑不到三个月的方案等于没有方案。照实填，不要填理想值。",
      groups: {
        info: "信息",
        behaviour: "行为记录",
        links: "连结关系",
        capacity: "能力与资源",
      },
      assets: {
        identity: "身份相关（本名、住址、职业、家人位置）",
        content: "内容相关（私人对话、未公开的照片、研究中的草稿）",
        credentials: "凭证相关（登录凭证、银行账户、加密货币密钥）",
        browsing: "访问过哪些网站、买了什么",
        location: "何时何地出现过",
        contacts: "跟谁通讯、谁是我的联系人",
        sources: "谁是我的消息来源",
        device: "设备本身（被拿去、被检查、被扣押）",
      },
      adversaries: {
        passerby: "随意路人：看得到公开贴文，没有更深入的能力",
        intimate: "亲密关系：能取得设备、读消息、知道习惯与口令",
        employer: "雇主或学校：能管控工作设备的网络流量、读取公司账号",
        platform: "平台业者：能看到你在他们服务上的所有活动，必要时依法令交出",
        police: "一国执法：能向业者调阅资料、必要时搜索扣押",
        state: "国家级情报：能做大规模流量监控、能对特定目标投入锁定攻击资源",
      },
      budgets: {
        low: "低：不想改变日常习惯，最多花一个下午设置一次",
        mid: "中：可以学新工具，接受每次多几个步骤",
        high: "高：可以改变工作流程，接受明显的不便",
      },
      warns: {
        "no-adversary": "第二题没有选。少了对手这一题，工具选择没有对照的对象，最后会变成照别人的清单抄。",
        "no-asset": "第一题没有选。少了资产这一题，会把力气花在不重要的东西上。",
        "state-low-budget": "对手选到执法或国家级，成本却填最低。这个组合撑不住，两边要动一边：把对手范围缩到真正会发生的那一级，或把成本上限拉高。",
        "intimate-without-device": "要防亲密关系的人，却没有把设备列进要保护的东西。这一级对手最常用的路径就是取得你的手机或电脑，密码与屏幕锁通常比选什么通讯软件更关键。",
        overkill: "只防随意路人，却打算大改工作流程。这是用大炮打蚊子，投入的力气多半会在几周后放弃。",
        "sources-without-contacts": "要保护消息来源的身份，却没有把联系关系列进来。谁跟谁通讯本身就是线索，内容加密挡不住这一层。",
        "too-many-adversaries": "选了五个以上的对手。一份清单对应一个场景比较有用，工作与私人生活的威胁模型分开写，各自都会更清楚。",
      },
      reads: {
        baseline: "一般人平常该做到什么：所有情境共用的基线",
        journalist: "记者保护消息来源：接触、交换文件、刊出后的整理",
        domestic: "家暴受害者的数字准备：在对方碰得到设备的前提下重建界线",
        activist: "社运行动者的数字准备：动员前、现场与行动之后",
        metadata: "Metadata 是什么：为什么位置与联系关系挡不住内容加密",
        "platform-tracking": "社交平台怎么收集你的资料：他们实际拿得到什么",
        "multiple-identities": "怎么维持多个网络身份：要几层、怎么撑住",
        surveillance: "监控现在做得到什么：按四层列出能力边界与证据",
        "password-manager": "密码管理器：凭证这一类资产的第一道",
        messaging: "通讯软件比较：内容与联系关系各自被谁看得到",
        tor: "Tor 是什么：把访问纪录跟你切开",
        tails: "Tails 是什么：用完不留痕迹的操作系统",
        "compare-os": "Tails、Whonix 与 Qubes 比较：投入高成本时怎么选",
        fingerprinting: "浏览器指纹：换 IP 挡不住的那一层",
      },
      summaryTitle: "我的威胁模型",
      summaryFoot: "这份清单是活的。换工作、换伴侣、换城市、开始参与新议题时回头看一次。",
      warnTitle: "要注意的错配",
      readTitle: "建议先读",
      none: "（没有填）",
      build: "生成摘要",
      rebuild: "重新生成",
      copy: "复制摘要",
      copied: "已复制",
      reset: "全部清掉",
      store: {
        title: "留一份在这台设备（可选）",
        hint: "用你的 passkey 加密存进这台设备的暂存区，跟我的准备清单同一份密文。站上什么都不收。",
        notOffered: "对手选了亲密关系、一国执法或国家级，这里不提供存档。他们碰得到你的设备，也可能要求你解锁，passkey 没有比屏幕锁更强。要留一份就按「复制摘要」，贴到对方碰不到的地方，例如抄在纸上收好，或贴进对方没有密码的账号。",
        restore: "用 passkey 填回上次的答案",
        restoreHint: "这台设备的暂存区有东西。上次存过威胁模型的话，解开就填回来。",
        restoreEmpty: "暂存区里没有存过威胁模型。",
        save: "存进我的暂存区",
        update: "更新存档",
        savedOn: "已存，{date}。",
        remove: "删掉存档",
        removed: "删掉了。暂存区里其他东西没动。",
        lock: "锁上",
        openExisting: "用我已有的钥匙开",
        createNew: "创建一把新的钥匙",
        chooseHint: "这台设备还没有暂存区。已经在钥匙页创建过 anoni.net 的 passkey 就用它开，还没有的话创建一把新的。",
        waiting: "等你在浏览器的提示里完成",
        errors: {
          cancelled: "你取消了，或浏览器没有完成。再按一次。",
          unsupported: "这个环境不允许用 passkey。要在正式站、https 网址，浏览器也没有把功能关掉。",
          failed: "没有成功。换一个浏览器或密码管理器试试。",
        },
      },
      empty: "三题都答完再按「生成摘要」。答案预设不存，刷新就没了。",
      note: "答案预设只留在这个标签页里，不送出去。要留一份，按「复制摘要」贴到你自己选的地方，或用 passkey 加密存进这台设备的暂存区。两种都要你自己按。",
    },
    en: {
      q1: "What are you protecting",
      q1hint: "Pick the few things you least want taken, seen or destroyed. Three to five is enough. Selecting everything is the same as selecting nothing.",
      q2: "Who are you protecting it from, and what can they do",
      q2hint: "What an adversary can do decides which tools fit. Two or three tiers at once is normal. Five or more usually means one list is trying to cover too many situations.",
      q3: "How much are you willing to spend",
      q3hint: "A plan you cannot keep up for three months is not a plan. Answer honestly rather than aspirationally.",
      groups: {
        info: "Information",
        behaviour: "Behavioural records",
        links: "Connections",
        capacity: "Capacity and resources",
      },
      assets: {
        identity: "Identity (legal name, address, occupation, where family lives)",
        content: "Content (private conversations, unpublished photos, drafts in progress)",
        credentials: "Credentials (logins, bank accounts, cryptocurrency keys)",
        browsing: "Which sites I visited, what I bought",
        location: "Where I was and when",
        contacts: "Who I talk to, who my contacts are",
        sources: "Who my sources are",
        device: "The device itself (taken, inspected, seized)",
      },
      adversaries: {
        passerby: "A passer-by: sees your public posts, nothing deeper",
        intimate: "Someone close to you: can pick up your device, read your messages, knows your habits and passwords",
        employer: "An employer or school: controls network traffic on work devices, reads company accounts",
        platform: "A platform operator: sees everything you do on their service, hands it over when legally required",
        police: "National law enforcement: can compel operators to disclose, can search and seize",
        state: "State intelligence: mass traffic monitoring, dedicated resources against specific targets",
      },
      budgets: {
        low: "Low: no change to daily habits, one afternoon of setup at most",
        mid: "Medium: willing to learn new tools and accept a few extra steps each time",
        high: "High: willing to change how I work and accept real inconvenience",
      },
      warns: {
        "no-adversary": "Question two is blank. Without an adversary there is nothing to measure tool choices against, and the result is copying somebody else's list.",
        "no-asset": "Question one is blank. Without assets, effort goes into protecting things that do not matter to you.",
        "state-low-budget": "Law enforcement or state intelligence is selected while the budget is the lowest one. That combination does not hold. Move one side: narrow the adversary to the tier that will realistically come up, or raise what you are willing to spend.",
        "intimate-without-device": "You are protecting against someone close to you but have not listed the device as an asset. That tier's most common route is picking up your phone or laptop. A passcode and a screen lock usually matter more here than which messenger you choose.",
        overkill: "Only a passer-by is selected, yet the plan is to change how you work. That is heavy machinery for a light problem, and the effort tends to be abandoned within weeks.",
        "sources-without-contacts": "You are protecting the identity of sources but have not listed contact relationships. Who talks to whom is itself the lead, and content encryption does not cover that layer.",
        "too-many-adversaries": "Five or more adversaries are selected. One list per situation works better. Writing separate models for work and personal life makes each of them clearer.",
      },
      reads: {
        baseline: "What everyone should do: the baseline shared by every situation",
        journalist: "Journalists protecting sources: first contact, exchanging files, cleaning up after publication",
        domestic: "Digital preparation for abuse survivors: rebuilding boundaries when the other person can reach your devices",
        activist: "Digital preparation for activists: before mobilisation, on the day, and afterwards",
        metadata: "What metadata is: why location and contact relationships survive content encryption",
        "platform-tracking": "How social platforms collect your data: what they actually hold",
        "multiple-identities": "Keeping several online identities: how many layers, and how to sustain them",
        surveillance: "What surveillance can do today: capability boundaries and evidence, in four tiers",
        "password-manager": "Password managers: the first line for credentials",
        messaging: "Comparing messengers: who sees the content and who sees the relationships",
        tor: "What Tor is: separating your browsing record from you",
        tails: "What Tails is: an operating system that leaves nothing behind",
        "compare-os": "Tails, Whonix and Qubes compared: choosing when the budget is high",
        fingerprinting: "Browser fingerprinting: the layer a new IP address does not cover",
      },
      summaryTitle: "My threat model",
      summaryFoot: "This list is alive. Revisit it when you change jobs, partners or cities, or when you start working on something new and sensitive.",
      warnTitle: "Mismatches worth checking",
      readTitle: "Read these first",
      none: "(not answered)",
      build: "Build summary",
      rebuild: "Rebuild",
      copy: "Copy summary",
      copied: "Copied",
      reset: "Clear everything",
      store: {
        title: "Keep a copy on this device (optional)",
        hint: "Encrypted with your passkey into this device's stash, the same ciphertext as my preparation checklist. Nothing reaches the site.",
        notOffered: "With someone close to you, law enforcement or state intelligence as an adversary, there is no save option here. They can reach your device and may be able to make you unlock it, and a passkey is no stronger than the screen lock. To keep a copy, press \"Copy summary\" and paste it somewhere they cannot reach, such as on paper kept out of sight or in an account they have no password for.",
        restore: "Fill in last time's answers with passkey",
        restoreHint: "This device's stash has something in it. If you saved a threat model last time, unlocking fills it back in.",
        restoreEmpty: "No threat model has been saved in the stash.",
        save: "Save to my stash",
        update: "Update the saved copy",
        savedOn: "Saved, {date}.",
        remove: "Delete the saved copy",
        removed: "Deleted. Everything else in the stash is untouched.",
        lock: "Lock",
        openExisting: "Open with my existing key",
        createNew: "Create a new key",
        chooseHint: "There is no stash on this device yet. If you already created an anoni.net passkey on the key page, open with it; otherwise create a new one.",
        waiting: "Finish the prompt in your browser",
        errors: {
          cancelled: "You cancelled, or the browser did not finish. Press again.",
          unsupported: "This environment does not allow passkeys. It needs the production site, an https address, and a browser that has not turned the feature off.",
          failed: "It did not work. Try another browser or password manager.",
        },
      },
      empty: 'Answer all three questions, then press "Build summary". Nothing is saved by default: reloading clears it.',
      note: 'By default your answers stay in this tab and are not sent anywhere. To keep a copy, press "Copy summary" and paste it somewhere you chose, or save it to the stash on this device, encrypted with a passkey. Both take a deliberate press.',
    },
  };

  const t = STRINGS[document.documentElement.lang] || STRINGS["zh-TW"];

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  // 答案只在這裡，預設不落地。要存得經下面暫存區那段，讀者自己按。
  const state = { assets: [], adversaries: [], budget: "", built: false, copied: false };

  const toggle = (list, id, on) => {
    const at = list.indexOf(id);
    if (on && at < 0) list.push(id);
    if (!on && at >= 0) list.splice(at, 1);
  };

  // 日期給摘要用。填的當下是哪一天，是這份清單日後回看時最需要的一行。
  function today() {
    const now = new Date();
    const pad = (n) => (n < 10 ? "0" + n : String(n));
    return now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
  }


  // --- 存進暫存區（選用）---
  //
  // 預設什麼都不存。讀者按了才經 window.anoniVault 用 passkey 加密寫進這台裝置，
  // 跟我的準備清單同一份密文，這裡只動 threatModel 欄位。對手含親密關係、一國執法
  // 或國家級時 canStore() 是 false，整段不給存的按鈕。
  const vault = () => window.anoniVault;
  const vs = {
    support: null,   // null 還在查
    exists: false,   // 這台裝置有沒有暫存區
    unlocked: false,
    busy: null,      // "restore" | "save" | "remove"
    saved: null,     // 存檔的日期
    dirty: false,    // 存過之後答案有沒有改
    choosing: false, // 沒有暫存區時，正在選用舊鑰匙還是建新的
    error: null,
    message: "",
  };

  function classifyError(err) {
    const name = err && err.name;
    if (name === "NotAllowedError" || name === "AbortError") return "cancelled";
    if (name === "NotSupportedError" || name === "SecurityError") return "unsupported";
    return "failed";
  }
  async function vaultRefresh() {
    const v = vault();
    vs.support = !!(window.PublicKeyCredential && navigator.credentials && v && v.available());
    vs.exists = vs.support ? await v.exists() : false;
  }
  async function guarded(action, work) {
    vs.error = null;
    vs.message = "";
    vs.busy = action;
    render();
    try {
      await work();
    } catch (err) {
      vs.error = classifyError(err);
    }
    vs.busy = null;
    render();
  }
  function snapshot() {
    return { v: 1, assets: state.assets.slice(), adversaries: state.adversaries.slice(), budget: state.budget, savedAt: today() };
  }
  async function writeSnapshot() {
    const data = (await vault().read()) || {};
    data.threatModel = snapshot();
    await vault().save(data);
    vs.saved = data.threatModel.savedAt;
    vs.dirty = false;
    vs.exists = true;
  }
  // 讀回來的 id 只認現在有的，舊版存了已經拿掉的選項就略過
  function applySnapshot(saved) {
    const known = (list, ids) => (Array.isArray(ids) ? ids : []).filter((id) => list.some((x) => x.id === id));
    state.assets = known(ASSETS, saved.assets);
    state.adversaries = known(ADVERSARIES, saved.adversaries);
    state.budget = BUDGETS.indexOf(saved.budget) >= 0 ? saved.budget : "";
    state.built = !!(state.assets.length && state.adversaries.length && state.budget);
    state.copied = false;
    vs.saved = saved.savedAt || null;
    vs.dirty = false;
  }
  const restore = () =>
    guarded("restore", async () => {
      await vault().unlock();
      vs.unlocked = true;
      const data = (await vault().read()) || {};
      if (data.threatModel) applySnapshot(data.threatModel);
      else vs.message = t.store.restoreEmpty;
    });
  const saveNow = () =>
    guarded("save", async () => {
      if (!vs.unlocked) {
        await vault().unlock();
        vs.unlocked = true;
      }
      await writeSnapshot();
    });
  const saveWithExisting = () =>
    guarded("save", async () => {
      await vault().openWithExisting(null);
      vs.unlocked = true;
      vs.choosing = false;
      await writeSnapshot();
    });
  const saveWithNew = () =>
    guarded("save", async () => {
      await vault().create(null);
      vs.unlocked = true;
      vs.choosing = false;
      await writeSnapshot();
    });
  const remove = () =>
    guarded("remove", async () => {
      const data = (await vault().read()) || {};
      delete data.threatModel;
      await vault().save(data);
      vs.saved = null;
      vs.dirty = true;
      vs.message = t.store.removed;
    });
  function lock() {
    vault().lock();
    vs.unlocked = false;
    vs.choosing = false;
    vs.message = "";
    vs.error = null;
    render();
  }

  function tmButton(label, onClick) {
    const node = el("button", null, label);
    node.type = "button";
    node.addEventListener("click", onClick);
    return node;
  }
  function busyButton(label) {
    const node = tmButton(label, () => {});
    node.setAttribute("aria-busy", "true");
    node.disabled = true;
    return node;
  }
  // 頂部：有暫存區、還沒填任何答案時，先問要不要填回上次的。解開了卻沒有東西
  // 可填（暫存區裡沒存過威脅模型）也要留在這裡說，不然讀者按下去像沒反應。
  function restoreBox() {
    if (!vs.support || !vs.exists) return null;
    if (state.assets.length || state.adversaries.length || state.budget) return null;
    const box = el("div", "tm-store");
    const row = el("div", "tm-row");
    if (!vs.unlocked) {
      box.appendChild(el("p", "tm-hint", t.store.restoreHint));
      row.appendChild(vs.busy === "restore" ? busyButton(t.store.waiting) : tmButton(t.store.restore, restore));
    } else {
      row.appendChild(tmButton(t.store.lock, lock));
    }
    box.appendChild(row);
    if (vs.error) box.appendChild(el("p", "tm-warn", t.store.errors[vs.error] || t.store.errors.failed));
    if (vs.message) box.appendChild(el("p", "tm-hint", vs.message));
    return box;
  }
  // 摘要下方：存、更新、刪、鎖
  function storeSection() {
    if (!vs.support) return null;
    const box = el("div", "tm-store");
    box.appendChild(el("p", "tm-group", t.store.title));
    const allowed = canStore(state.adversaries);
    box.appendChild(allowed ? el("p", "tm-hint", t.store.hint) : el("p", "tm-warn", t.store.notOffered));
    if (vs.unlocked && vs.saved) box.appendChild(el("p", "tm-saved", t.store.savedOn.replace("{date}", vs.saved)));
    if (vs.choosing && !vs.busy) box.appendChild(el("p", "tm-hint", t.store.chooseHint));
    const row = el("div", "tm-row");
    if (vs.busy) row.appendChild(busyButton(t.store.waiting));
    else if (vs.choosing) {
      row.appendChild(tmButton(t.store.openExisting, saveWithExisting));
      row.appendChild(tmButton(t.store.createNew, saveWithNew));
    } else {
      if (allowed) {
        if (!vs.exists) row.appendChild(tmButton(t.store.save, () => { vs.choosing = true; render(); }));
        else {
          const b = tmButton(vs.saved ? t.store.update : t.store.save, saveNow);
          b.disabled = !!(vs.saved && !vs.dirty);
          row.appendChild(b);
        }
      }
      if (vs.unlocked && vs.saved) row.appendChild(tmButton(t.store.remove, remove));
      if (vs.unlocked) row.appendChild(tmButton(t.store.lock, lock));
    }
    box.appendChild(row);
    if (vs.error) box.appendChild(el("p", "tm-warn", t.store.errors[vs.error] || t.store.errors.failed));
    if (vs.message) box.appendChild(el("p", "tm-hint", vs.message));
    return box;
  }

  function choiceGroup(question) {
    const box = el("fieldset");
    box.appendChild(el("legend", null, t[question.key]));
    box.appendChild(el("p", "tm-hint", t[question.key + "hint"]));

    let lastGroup = null;
    for (const item of question.items) {
      if (item.group && item.group !== lastGroup) {
        box.appendChild(el("p", "tm-group", t.groups[item.group]));
        lastGroup = item.group;
      }
      const label = el("label");
      const input = document.createElement("input");
      input.type = question.multiple ? "checkbox" : "radio";
      if (!question.multiple) input.name = "tm-" + question.key;
      input.checked = question.checked(item.id);
      input.addEventListener("change", () => {
        question.onChange(item.id, input.checked);
        vs.dirty = true;
        // 重畫整份輸出。答案改了，之前那份摘要就不再是這份答案的摘要。
        state.built = false;
        state.copied = false;
        render();
      });
      label.appendChild(input);
      label.appendChild(el("span", null, question.label(item.id)));
      box.appendChild(label);
    }
    return box;
  }

  function render() {
    root.textContent = "";

    const top = restoreBox();
    if (top) root.appendChild(top);

    root.appendChild(choiceGroup({
      key: "q1",
      multiple: true,
      items: ASSETS,
      checked: (id) => has(state.assets, id),
      label: (id) => t.assets[id],
      onChange: (id, on) => toggle(state.assets, id, on),
    }));

    root.appendChild(choiceGroup({
      key: "q2",
      multiple: true,
      items: ADVERSARIES,
      checked: (id) => has(state.adversaries, id),
      label: (id) => t.adversaries[id],
      onChange: (id, on) => toggle(state.adversaries, id, on),
    }));

    root.appendChild(choiceGroup({
      key: "q3",
      multiple: false,
      items: BUDGETS.map((id) => ({ id: id })),
      checked: (id) => state.budget === id,
      label: (id) => t.budgets[id],
      onChange: (id) => { state.budget = id; },
    }));

    const row = el("div", "tm-row");
    const build = el("button", null, state.built ? t.rebuild : t.build);
    build.type = "button";
    build.disabled = !state.assets.length || !state.adversaries.length || !state.budget;
    build.addEventListener("click", () => {
      state.built = true;
      state.copied = false;
      render();
    });
    row.appendChild(build);

    const reset = el("button", null, t.reset);
    reset.type = "button";
    reset.addEventListener("click", () => {
      state.assets = [];
      state.adversaries = [];
      state.budget = "";
      state.built = false;
      state.copied = false;
      render();
    });
    row.appendChild(reset);
    root.appendChild(row);

    if (!state.built) {
      root.appendChild(el("p", "tm-empty", t.empty));
      root.appendChild(el("p", "tm-hint", t.note));
      return;
    }

    const result = evaluate(state);

    for (const warn of result.warns) {
      root.appendChild(el("p", "tm-warn", t.warns[warn.id]));
    }

    if (result.reads.length) {
      root.appendChild(el("p", "tm-group", t.readTitle));
      const list = el("ul", "tm-reads");
      for (const read of result.reads) {
        const li = el("li");
        // 這幾個連結都指向站內的頁面，渲染成可點的沒有問題
        const link = el("a", null, t.reads[read.id]);
        link.href = read.page;
        li.appendChild(link);
        list.appendChild(li);
      }
      root.appendChild(list);
    }

    const text = summarize(state, t, today());
    root.appendChild(el("div", "tm-out", text));

    const copyRow = el("div", "tm-row");
    const copy = el("button", null, state.copied ? t.copied : t.copy);
    copy.type = "button";
    copy.addEventListener("click", () => {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(text).then(() => {
        state.copied = true;
        render();
      });
    });
    copy.disabled = !navigator.clipboard;
    copyRow.appendChild(copy);
    root.appendChild(copyRow);

    const store = storeSection();
    if (store) root.appendChild(store);

    root.appendChild(el("p", "tm-hint", t.note));
  }

  render();
  vaultRefresh().then(render, render);
})();
