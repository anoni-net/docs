/*
 * 網址清理器（utils/clean-url.md）。
 *
 * 貼一個網址進來，把追蹤參數挑出來、說明每一個是誰在追，然後給出乾淨的版本。
 *
 * 用白名單而不是黑名單：只移除認得出來的追蹤參數，其餘一律保留。反過來做的話，
 * `?v=`（YouTube 的影片 ID）、`?page=`、`?q=` 這些會一起被砍掉，讀者拿到一個
 * 打不開的網址，而且不會馬上發現是工具弄壞的。
 *
 * 純字串處理，沒有任何網路請求。t.co 那類短網址要連上去才知道指向哪裡，這一頁
 * 不做那件事，那會把讀者想清理的網址送到第三方伺服器上。
 *
 * 三個語系共用這一份，docs/en/js/ 與 docs/zh-CN/js/ 底下是指向這裡的 symlink。
 * 純邏輯由 tools/test_cleanurl.mjs 原地抽出來測。
 */
(function () {
  "use strict";

  // --- 純邏輯（tools/test_cleanurl.mjs 從這裡原地抽出來測）---

  // 認得出來的追蹤參數。key 是參數名稱或前綴，value 是它屬於誰，用來跟讀者說明
  // 「這個東西在告訴誰什麼」。只列真的用於追蹤的，功能性參數不進這份清單。
  const TRACKERS = {
    // Google Analytics 與 Urchin 時代留下來的一組，幾乎所有電子報都在用
    "utm_source": "utm", "utm_medium": "utm", "utm_campaign": "utm",
    "utm_term": "utm", "utm_content": "utm", "utm_id": "utm",
    "utm_name": "utm", "utm_cid": "utm", "utm_reader": "utm",
    "utm_referrer": "utm", "utm_social": "utm", "utm_brand": "utm",
    // 廣告平台的點擊識別碼，每一個都對得回一次曝光與一個人
    "gclid": "google", "dclid": "google", "gbraid": "google", "wbraid": "google",
    "gclsrc": "google", "gad_source": "google",
    "fbclid": "meta", "igshid": "meta", "igsh": "meta", "mibextid": "meta",
    "msclkid": "microsoft",
    "twclid": "x", "ttclid": "tiktok", "ttc": "tiktok",
    "li_fat_id": "linkedin", "epik": "pinterest", "yclid": "yandex",
    "rdt_cid": "reddit", "irclickid": "impact",
    // 電子報平台
    "mc_cid": "mailchimp", "mc_eid": "mailchimp",
    "_hsenc": "hubspot", "_hsmi": "hubspot", "hsctatracking": "hubspot",
    "vero_conv": "vero", "vero_id": "vero", "ck_subscriber_id": "convertkit",
    // 社群平台的分享識別碼，能把「誰分享的」跟「誰點的」串起來
    "ref_src": "x", "ref_url": "x", "__twitter_impression": "x",
    "si": "share", "share_id": "share", "share_token": "share",
    "spm": "alibaba", "scm": "alibaba",
    "_openstat": "openstat", "wickedid": "wicked",
  };

  // 前綴比對用的那幾組。utm_ 底下的變體太多，一個一個列不完。
  const TRACKER_PREFIXES = [
    ["utm_", "utm"],
    ["pk_", "matomo"],
    ["piwik_", "matomo"],
    ["mtm_", "matomo"],
    ["hsa_", "hubspot"],
  ];

  function trackerOwner(name) {
    const key = name.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(TRACKERS, key)) return TRACKERS[key];
    for (const [prefix, owner] of TRACKER_PREFIXES) {
      if (key.startsWith(prefix)) return owner;
    }
    return null;
  }

  // 把包在外面的重導向拆掉。Google 搜尋結果、Facebook 的外連都會先繞一次自己家的
  // 伺服器，那個包裝本身就記下了你點了什麼。
  //
  // 只拆得開「真實網址就寫在參數裡」的那幾種。t.co 這類要連上去才知道指向哪裡，
  // 不在這裡處理：解那個要把讀者想清理的網址送到第三方伺服器上。
  const WRAPPERS = [
    { host: /(^|\.)google\./, path: /^\/url$/, param: "q" },
    { host: /(^|\.)google\./, path: /^\/url$/, param: "url" },
    { host: /(^|\.)facebook\.com$/, path: /^\/l\.php$/, param: "u" },
    { host: /(^|\.)l\.facebook\.com$/, path: /.*/, param: "u" },
    { host: /(^|\.)l\.instagram\.com$/, path: /.*/, param: "u" },
    { host: /(^|\.)away\.vk\.com$/, path: /.*/, param: "to" },
    { host: /(^|\.)out\.reddit\.com$/, path: /.*/, param: "url" },
    { host: /(^|\.)href\.li$/, path: /.*/, param: null },
    { host: /(^|\.)steamcommunity\.com$/, path: /^\/linkfilter\/$/, param: "url" },
  ];

  function unwrap(url) {
    for (const rule of WRAPPERS) {
      if (!rule.host.test(url.hostname) || !rule.path.test(url.pathname)) continue;
      // href.li 的目標直接接在 ? 後面，沒有參數名稱
      const raw = rule.param ? url.searchParams.get(rule.param) : url.search.slice(1);
      if (!raw) continue;
      try {
        const inner = new URL(raw);
        if (inner.protocol === "http:" || inner.protocol === "https:") return inner;
      } catch (err) {
        // 拆不開就當它不是包裝，原樣往下走
      }
    }
    return null;
  }

  // 清理一個網址。回傳乾淨的網址、拿掉了哪些參數、拆開了幾層包裝。
  function clean(input) {
    let url;
    try {
      url = new URL(input.trim());
    } catch (err) {
      return { ok: false, reason: "invalid" };
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { ok: false, reason: "scheme" };
    }

    const unwrapped = [];
    // 包裝有可能疊好幾層，但不無限拆，免得構造出來的網址讓這裡繞不出去
    for (let i = 0; i < 5; i += 1) {
      const inner = unwrap(url);
      if (!inner) break;
      unwrapped.push(url.hostname);
      url = inner;
    }

    const removed = [];
    // 先收集再刪。邊走邊刪會跳過元素，那種錯在參數少的時候看不出來。
    for (const name of [...url.searchParams.keys()]) {
      const owner = trackerOwner(name);
      if (owner) removed.push({ name: name, owner: owner });
    }
    for (const item of removed) url.searchParams.delete(item.name);

    // 沒有參數了就把問號也拿掉，留一個光禿禿的 ? 很難看
    let output = url.toString();
    if (!url.searchParams.toString()) output = output.replace(/\?(?=#|$)/, "");

    return {
      ok: true,
      url: output,
      removed: removed,
      unwrapped: unwrapped,
      changed: removed.length > 0 || unwrapped.length > 0,
    };
  }

  // --- 介面 ---

  const root = document.getElementById("cleanurl-tool");
  if (!root) return;

  const CSS = `
    #cleanurl-tool { margin: 1em 0; }
    #cleanurl-tool textarea {
      width: 100%; box-sizing: border-box; font: inherit;
      font-family: var(--md-code-font-family, monospace);
      /* iOS 在輸入框字級小於 16px 時一聚焦就放大整頁，跟 qrcode.js 同一個處理 */
      font-size: max(16px, .78rem);
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .6rem; min-height: 4.5rem; resize: vertical;
      background: var(--md-default-bg-color); color: var(--md-default-fg-color);
    }
    #cleanurl-tool button {
      font: inherit; color: inherit; cursor: pointer; background: none;
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .35rem .8rem;
    }
    #cleanurl-tool button:hover:not(:disabled) {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #cleanurl-tool button:disabled { opacity: .5; cursor: default; }
    #cleanurl-tool .cu-row { display: flex; flex-wrap: wrap; gap: .5rem; margin: .8rem 0; }
    #cleanurl-tool .cu-out {
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .7rem; margin: .8rem 0 .4rem;
      font-family: var(--md-code-font-family, monospace);
      font-size: .74rem; line-height: 1.7; word-break: break-all; user-select: all;
    }
    #cleanurl-tool .cu-clean { border-left: .15rem solid #2e7d32; }
    #cleanurl-tool .cu-note { font-size: .7rem; opacity: .75; line-height: 1.6; margin: .3rem 0 0; }
    #cleanurl-tool .cu-removed { list-style: none; margin: .6rem 0 0; padding: 0; font-size: .72rem; }
    #cleanurl-tool .cu-removed li { margin: 0 0 .25rem; line-height: 1.6; }
    #cleanurl-tool .cu-param {
      font-family: var(--md-code-font-family, monospace);
      background: var(--md-default-fg-color--lightest); padding: 0 .2rem; border-radius: .1rem;
    }
    #cleanurl-tool .cu-error {
      border-left: .15rem solid var(--md-typeset-del-color, #f44336);
      padding: .1rem 0 .1rem .6rem; margin: .8rem 0;
    }
    @media (pointer: coarse) { #cleanurl-tool button { min-height: 2.2rem; } }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const STRINGS = {
    "zh-TW": {
      placeholder: "貼上要清理的網址",
      clean: "清理",
      copy: "複製",
      copied: "已複製",
      invalid: "這不像一個網址。要包含 https:// 或 http:// 開頭。",
      scheme: "只處理 http 與 https 的網址。",
      nothing: "這個網址沒有認得出來的追蹤參數，不用改。",
      removedTitle: "拿掉了這些：",
      unwrapped: "拆掉了 {n} 層轉址包裝（經過 {hosts}）。那個包裝本身就記下了你點過什麼。",
      note: "全部在你的瀏覽器裡處理，沒有把網址送到任何地方。短網址（t.co、bit.ly 這類）要連上去才知道指向哪裡，清理器刻意不做展開，因為展開等於把你想清理的網址送到第三方伺服器。",
      owners: {
        utm: "廣告與電子報的來源追蹤",
        google: "Google 廣告的點擊識別碼",
        meta: "Meta 的點擊識別碼，能把分享的人與點的人串起來",
        microsoft: "Microsoft 廣告的點擊識別碼",
        x: "X 的分享與曝光追蹤",
        tiktok: "TikTok 廣告的點擊識別碼",
        linkedin: "LinkedIn 廣告追蹤",
        pinterest: "Pinterest 追蹤",
        yandex: "Yandex 廣告追蹤",
        reddit: "Reddit 廣告追蹤",
        impact: "聯盟行銷的點擊識別碼",
        mailchimp: "Mailchimp 的收件人識別碼，能對回是誰開的信",
        hubspot: "HubSpot 的追蹤參數",
        vero: "Vero 的收件人識別碼",
        convertkit: "ConvertKit 的訂閱者識別碼",
        share: "分享識別碼，能對回是誰分享的",
        alibaba: "阿里系的來源追蹤",
        matomo: "Matomo 分析的來源追蹤",
        openstat: "OpenStat 追蹤",
        wicked: "Wicked Reports 追蹤",
      },
    },
    zh: {
      placeholder: "粘贴要清理的网址",
      clean: "清理",
      copy: "复制",
      copied: "已复制",
      invalid: "这不像一个网址。要包含 https:// 或 http:// 开头。",
      scheme: "只处理 http 与 https 的网址。",
      nothing: "这个网址没有认得出来的追踪参数，不用改。",
      removedTitle: "拿掉了这些：",
      unwrapped: "拆掉了 {n} 层转址包装（经过 {hosts}）。那个包装本身就记下了你点过什么。",
      note: "全部在你的浏览器里处理，没有把网址送到任何地方。短网址（t.co、bit.ly 这类）要连上去才知道指向哪里，清理器刻意不做展开，因为展开等于把你想清理的网址送到第三方服务器。",
      owners: {
        utm: "广告与电子报的来源追踪",
        google: "Google 广告的点击识别码",
        meta: "Meta 的点击识别码，能把分享的人与点的人串起来",
        microsoft: "Microsoft 广告的点击识别码",
        x: "X 的分享与曝光追踪",
        tiktok: "TikTok 广告的点击识别码",
        linkedin: "LinkedIn 广告追踪",
        pinterest: "Pinterest 追踪",
        yandex: "Yandex 广告追踪",
        reddit: "Reddit 广告追踪",
        impact: "联盟营销的点击识别码",
        mailchimp: "Mailchimp 的收件人识别码，能对回是谁开的信",
        hubspot: "HubSpot 的追踪参数",
        vero: "Vero 的收件人识别码",
        convertkit: "ConvertKit 的订阅者识别码",
        share: "分享识别码，能对回是谁分享的",
        alibaba: "阿里系的来源追踪",
        matomo: "Matomo 分析的来源追踪",
        openstat: "OpenStat 追踪",
        wicked: "Wicked Reports 追踪",
      },
    },
    en: {
      placeholder: "Paste a URL to clean",
      clean: "Clean",
      copy: "Copy",
      copied: "Copied",
      invalid: "That does not look like a URL. It needs to start with https:// or http://.",
      scheme: "Only http and https URLs are handled.",
      nothing: "No recognised tracking parameters here. Nothing to change.",
      removedTitle: "Removed:",
      unwrapped: "Unwrapped {n} redirect layer(s) via {hosts}. That wrapper is itself a record of what you clicked.",
      note: "Everything happens in your browser and no URL is sent anywhere. Shorteners such as t.co and bit.ly need a request to reveal their destination, which this page deliberately does not do: that would send the very URL you wanted to clean to a third-party server.",
      owners: {
        utm: "campaign source tracking for ads and newsletters",
        google: "Google Ads click identifier",
        meta: "Meta click identifier, which links who shared with who clicked",
        microsoft: "Microsoft Ads click identifier",
        x: "X share and impression tracking",
        tiktok: "TikTok Ads click identifier",
        linkedin: "LinkedIn ad tracking",
        pinterest: "Pinterest tracking",
        yandex: "Yandex ad tracking",
        reddit: "Reddit ad tracking",
        impact: "affiliate click identifier",
        mailchimp: "Mailchimp recipient identifier, which ties back to who opened the mail",
        hubspot: "HubSpot tracking parameters",
        vero: "Vero recipient identifier",
        convertkit: "ConvertKit subscriber identifier",
        share: "share identifier, which ties back to who shared it",
        alibaba: "Alibaba source tracking",
        matomo: "Matomo analytics source tracking",
        openstat: "OpenStat tracking",
        wicked: "Wicked Reports tracking",
      },
    },
  };
  const t = STRINGS[document.documentElement.lang] || STRINGS["zh-TW"];
  const fill = (key, vars) => t[key].replace(/\{(\w+)\}/g, (_, n) => String(vars[n]));

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const state = { input: "", result: null, copied: false };

  function render() {
    root.textContent = "";

    const box = document.createElement("textarea");
    box.placeholder = t.placeholder;
    box.value = state.input;
    box.spellcheck = false;
    box.addEventListener("input", () => {
      state.input = box.value;
      state.result = state.input.trim() ? clean(state.input) : null;
      state.copied = false;
      update();
    });
    root.appendChild(box);
    root.appendChild(el("div", "cu-body"));
    root.appendChild(el("p", "cu-note", t.note));
    update();
  }

  // 只重畫輸出。整頁重畫會讓輸入框失去焦點，打字打到一半就中斷。
  function update() {
    const body = root.querySelector(".cu-body");
    if (!body) return;
    body.textContent = "";
    const result = state.result;
    if (!result) return;

    if (!result.ok) {
      body.appendChild(el("p", "cu-error", t[result.reason]));
      return;
    }

    body.appendChild(el("div", "cu-out cu-clean", result.url));

    const row = el("div", "cu-row");
    const copy = el("button", null, state.copied ? t.copied : t.copy);
    copy.type = "button";
    copy.addEventListener("click", () => {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(result.url).then(() => {
        state.copied = true;
        update();
      });
    });
    copy.disabled = !navigator.clipboard;
    row.appendChild(copy);
    body.appendChild(row);

    if (result.unwrapped.length) {
      body.appendChild(
        el("p", "cu-note", fill("unwrapped", {
          n: result.unwrapped.length,
          hosts: result.unwrapped.join("、"),
        }))
      );
    }

    if (!result.changed) {
      body.appendChild(el("p", "cu-note", t.nothing));
      return;
    }
    if (!result.removed.length) return;

    body.appendChild(el("p", "cu-note", t.removedTitle));
    const list = el("ul", "cu-removed");
    for (const item of result.removed) {
      const li = document.createElement("li");
      li.appendChild(el("code", "cu-param", item.name));
      li.appendChild(document.createTextNode(" " + (t.owners[item.owner] || item.owner)));
      list.appendChild(li);
    }
    body.appendChild(list);
  }

  render();
})();
