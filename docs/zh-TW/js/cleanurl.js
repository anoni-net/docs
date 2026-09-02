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
 * 除了參數，也把主機名拆給人看：真正的註冊網域是哪一段、@ 前面是不是假主機、
 * xn-- 開頭的 IDN 實際顯示成什麼、有沒有混用字母系統或在品牌旁邊加字。見 hostFacts。
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
      host: hostFacts(url),
    };
  }

  // --- 主機真身 ---
  //
  // 釣魚網址的三種常見手法都在主機名上：google.com.evil.tw 把品牌放在子網域，
  // paypal-secure.com 在品牌旁邊加字，аpple.com 用長得像拉丁字母的西里爾字母。網址列上
  // 看起來都很像，把「真正的註冊網域」單獨拉出來標，其他部分才看得出是障眼法。
  // qr-read 的「主機獨立標出來」是同一個想法，這裡多做三件事：解開 IDN 的 xn-- 形式、
  // 找出混用的字母系統、對照常見品牌名。
  //
  // 註冊網域的判斷用一份簡短的兩段式後綴表（com.tw、co.uk 這類），不是完整的
  // Public Suffix List。那份表有上萬條，離線頁面揹不動，而這一頁的讀者遇到的多半是
  // 台灣、港澳、日韓與新馬的網域。表裡沒有的就取最後兩段，文案有說明這是近似。
  const PUBLIC_SUFFIXES = new Set([
    "com.tw", "org.tw", "net.tw", "edu.tw", "gov.tw", "idv.tw", "game.tw", "ebiz.tw", "club.tw",
    "com.hk", "org.hk", "net.hk", "edu.hk", "gov.hk", "com.mo", "org.mo", "gov.mo",
    "com.cn", "org.cn", "net.cn", "edu.cn", "gov.cn",
    "co.jp", "or.jp", "ne.jp", "ac.jp", "go.jp", "co.kr", "or.kr", "ne.kr", "go.kr", "ac.kr",
    "com.sg", "org.sg", "edu.sg", "gov.sg", "com.my", "org.my", "edu.my", "gov.my", "net.my",
    "co.uk", "org.uk", "ac.uk", "gov.uk", "me.uk", "com.au", "org.au", "net.au", "edu.au", "gov.au",
    "co.nz", "org.nz", "co.in", "org.in", "com.br", "com.mx", "com.ar", "co.za",
    "github.io", "gitlab.io", "pages.dev", "netlify.app", "vercel.app", "web.app", "firebaseapp.com",
    "blogspot.com", "wordpress.com", "herokuapp.com", "azurewebsites.net", "cloudfront.net", "amazonaws.com",
  ]);

  // 常見品牌。出現在子網域裡、或跟別的字黏在註冊網域的同一段裡，都是冒充的常見寫法。
  // 只列讀者真的會收到釣魚訊息的那些，不求完整。太短或本身是常用字的（line、gov、
  // post）不列，誤報比漏報更傷這一頁的可信度。
  const BRANDS = [
    "google", "gmail", "youtube", "facebook", "instagram", "whatsapp", "messenger",
    "apple", "icloud", "microsoft", "outlook", "office365", "amazon", "netflix", "paypal",
    "telegram", "signal", "twitter", "linkedin", "dropbox", "github", "shopee", "pchome",
    "taobao", "alipay", "wechat", "esunbank", "cathaybk", "ctbcbank", "taishinbank", "fubon",
    "megabank", "chunghwa", "hinet",
  ];

  // 長得像拉丁字母的西里爾字母（加一個希臘 ο）。整段都由這些字組成的 IDN 標籤，
  // 顯示出來跟真的網域一模一樣，2017 年公開示範的 аррӏе.com 就是這一種。
  const CONFUSABLE_CYRILLIC = new Set(["а", "е", "о", "р", "с", "у", "х", "і", "ј", "ѕ", "ԛ", "ԁ", "ԝ", "ӏ", "һ", "ԍ", "ѵ", "ѡ", "ο"]);

  // RFC 3492 的解碼。瀏覽器只給 xn-- 形式，沒有 API 解回來，自己寫一份，
  // 輸入是去掉 xn-- 之後的那段。解不開回 null。
  function punycodeDecode(input) {
    const base = 36;
    const tMin = 1;
    const tMax = 26;
    const skew = 38;
    const damp = 700;
    const output = [];
    let basic = input.lastIndexOf("-");
    if (basic < 0) basic = 0;
    for (let j = 0; j < basic; j += 1) {
      const code = input.charCodeAt(j);
      if (code >= 0x80) return null;
      output.push(code);
    }
    const digit = (code) => {
      if (code >= 48 && code <= 57) return code - 22;
      if (code >= 65 && code <= 90) return code - 65;
      if (code >= 97 && code <= 122) return code - 97;
      return base;
    };
    const adapt = (value, numPoints, first) => {
      let delta = first ? Math.floor(value / damp) : value >> 1;
      delta += Math.floor(delta / numPoints);
      let k = 0;
      while (delta > ((base - tMin) * tMax) >> 1) {
        delta = Math.floor(delta / (base - tMin));
        k += base;
      }
      return k + Math.floor(((base - tMin + 1) * delta) / (delta + skew));
    };
    let n = 128;
    let bias = 72;
    let i = 0;
    let index = basic > 0 ? basic + 1 : 0;
    while (index < input.length) {
      const oldi = i;
      let w = 1;
      for (let k = base; ; k += base) {
        if (index >= input.length) return null;
        const d = digit(input.charCodeAt(index));
        index += 1;
        if (d >= base) return null;
        i += d * w;
        const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
        if (d < t) break;
        w *= base - t;
      }
      const out = output.length + 1;
      bias = adapt(i - oldi, out, oldi === 0);
      n += Math.floor(i / out);
      i %= out;
      if (n > 0x10ffff) return null;
      output.splice(i, 0, n);
      i += 1;
    }
    return String.fromCodePoint.apply(null, output);
  }

  // 一段主機名用了哪些字母系統。只分拉丁、希臘、西里爾與其他，夠判斷混用了沒。
  function labelScripts(label) {
    const scripts = new Set();
    for (const ch of label) {
      const cp = ch.codePointAt(0);
      if (cp < 0x80) {
        if (/[a-z]/i.test(ch)) scripts.add("latin");
      } else if (cp >= 0xc0 && cp <= 0x24f) {
        scripts.add("latin");
      } else if (cp >= 0x370 && cp <= 0x3ff) {
        scripts.add("greek");
      } else if (cp >= 0x400 && cp <= 0x52f) {
        scripts.add("cyrillic");
      } else {
        scripts.add("other");
      }
    }
    return scripts;
  }

  // 主機名拆給人看。回 { host, display, registrable, registrableDisplay, warnings }，
  // warnings 每一項有 kind 與 detail，文案在 STRINGS.hostWarnings。
  function hostFacts(url) {
    const host = url.hostname;
    const facts = {
      host: host, display: host, registrable: host, registrableDisplay: host, warnings: [],
    };
    if (url.username || url.password) {
      facts.warnings.push({ kind: "userinfo", detail: url.username || "" });
    }
    if (url.port) facts.warnings.push({ kind: "port", detail: url.port });
    if (url.protocol === "http:") facts.warnings.push({ kind: "http", detail: "" });
    if (/^\[/.test(host) || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      facts.warnings.push({ kind: "ip", detail: host });
      return facts;
    }

    const labels = host.split(".");
    // 解開 IDN，每一段各自解，解不開的照原樣
    const shown = labels.map((label) => {
      if (label.indexOf("xn--") !== 0) return label;
      const decoded = punycodeDecode(label.slice(4));
      return decoded === null ? label : decoded;
    });
    facts.display = shown.join(".");
    let idn = false;
    for (let i = 0; i < labels.length; i += 1) {
      if (shown[i] === labels[i]) continue;
      idn = true;
      const scripts = labelScripts(shown[i]);
      const lookalike = Array.from(shown[i]).every(
        (ch) => CONFUSABLE_CYRILLIC.has(ch) || /[0-9-]/.test(ch)
      );
      if (scripts.has("latin") && (scripts.has("cyrillic") || scripts.has("greek"))) {
        facts.warnings.push({ kind: "mixedScript", detail: shown[i] });
      } else if (lookalike && !scripts.has("latin")) {
        facts.warnings.push({ kind: "wholeScript", detail: shown[i] });
      }
    }
    if (idn) facts.warnings.push({ kind: "idn", detail: facts.display });

    // 註冊網域：最後兩段，後綴表裡有的多取一段
    let take = 2;
    if (labels.length >= 3 && PUBLIC_SUFFIXES.has(labels.slice(-2).join("."))) take = 3;
    if (take > labels.length) take = labels.length;
    facts.registrable = labels.slice(-take).join(".");
    facts.registrableDisplay = shown.slice(-take).join(".");

    const head = labels[labels.length - take];
    const subLabels = labels.slice(0, labels.length - take);
    for (const brand of BRANDS) {
      if (head !== brand && subLabels.indexOf(brand) >= 0) {
        facts.warnings.push({ kind: "brandSubdomain", detail: brand });
        break;
      }
    }
    for (const brand of BRANDS) {
      if (head !== brand && new RegExp("(^|[^a-z])" + brand + "([^a-z]|$)").test(head)) {
        facts.warnings.push({ kind: "brandLookalike", detail: brand });
        break;
      }
    }
    return facts;
  }

  // --- 介面 ---

  const root = document.getElementById("cleanurl-tool");
  if (!root) return;

  const CSS = `
    #cleanurl-tool .cu-host {
      margin: .8rem 0 .2rem; padding: .5rem .7rem; font-size: .74rem; line-height: 1.7;
      border-left: .15rem solid var(--md-primary-fg-color);
      background: var(--md-code-bg-color); border-radius: .1rem;
    }
    #cleanurl-tool .cu-host p { margin: 0 0 .3rem; }
    #cleanurl-tool .cu-host p:last-child { margin-bottom: 0; }
    #cleanurl-tool .cu-host strong { font-family: var(--md-code-font-family, monospace); }
    #cleanurl-tool .cu-warn {
      border-left: .15rem solid #c62828; padding-left: .5rem;
    }
    #cleanurl-tool .cu-host__full { opacity: .75; }
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
      hostTitle: "真正的主機是",
      hostFull: "完整主機名 {host}",
      hostNote: "註冊網域用常見的兩段式後綴表判斷，不是完整的公開後綴清單，少見的網域可能多算或少算一段。",
      hostWarnings: {
        userinfo: "「@」前面（{detail}）是登入資訊，瀏覽器實際連到的是 @ 後面的主機。前面放什麼都可以，這是冒充的老手法。",
        port: "連的是非預設的連接埠 {detail}，正式服務很少這樣給連結。",
        http: "沒有加密的 http，路上的人看得到內容，也改得了內容。",
        ip: "主機是一個 IP 位址而非網域名稱，正式服務幾乎不會這樣給連結。",
        idn: "主機名含非拉丁字母，實際顯示為 {detail}。",
        mixedScript: "「{detail}」混了兩種字母系統，多半是用長得像的字母冒充別的網域。",
        wholeScript: "「{detail}」全部是長得像拉丁字母的西里爾字母，顯示出來跟真的網域一樣，連到的卻是另一個網域。",
        brandSubdomain: "「{detail}」只出現在子網域，真正的註冊網域在後面。子網域誰都能取這個名字。",
        brandLookalike: "註冊網域裡有「{detail}」但不等於它，多半是在品牌旁邊加字的冒充網域。",
      },
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
      hostTitle: "真正的主机是",
      hostFull: "完整主机名 {host}",
      hostNote: "注册域名用常见的两段式后缀表判断，不是完整的公开后缀清单，少见的域名可能多算或少算一段。",
      hostWarnings: {
        userinfo: "「@」前面（{detail}）是登录信息，浏览器实际连到的是 @ 后面的主机。前面放什么都可以，这是冒充的老手法。",
        port: "连的是非默认的端口 {detail}，正式服务很少这样给链接。",
        http: "没有加密的 http，路上的人看得到内容，也改得了内容。",
        ip: "主机是一个 IP 地址而非域名，正式服务几乎不会这样给链接。",
        idn: "主机名含非拉丁字母，实际显示为 {detail}。",
        mixedScript: "「{detail}」混了两种字母系统，多半是用长得像的字母冒充别的域名。",
        wholeScript: "「{detail}」全部是长得像拉丁字母的西里尔字母，显示出来跟真的域名一样，连到的却是另一个域名。",
        brandSubdomain: "「{detail}」只出现在子域名，真正的注册域名在后面。子域名谁都能取这个名字。",
        brandLookalike: "注册域名里有「{detail}」但不等于它，多半是在品牌旁边加字的冒充域名。",
      },
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
      hostTitle: "The real host is",
      hostFull: "full host name {host}",
      hostNote: "The registered domain is worked out from a short table of common two-part suffixes, not the full public suffix list, so unusual domains may be off by one label.",
      hostWarnings: {
        userinfo: "The part before the “@” ({detail}) is login information. The browser connects to the host after the @, and anything can be put in front. This is an old impersonation trick.",
        port: "This connects to the non-default port {detail}. Legitimate services rarely hand out links like this.",
        http: "Unencrypted http: anyone on the path can read the content, and change it.",
        ip: "The host is an IP address rather than a domain name. Legitimate services almost never hand out links like this.",
        idn: "The host name contains non-Latin letters and is displayed as {detail}.",
        mixedScript: "“{detail}” mixes two alphabets, which usually means look-alike letters are impersonating another domain.",
        wholeScript: "“{detail}” is made entirely of Cyrillic letters that look like Latin ones. It displays like the real domain but is a different one.",
        brandSubdomain: "“{detail}” only appears in a subdomain. The real registered domain comes after it, and anyone can name a subdomain like that.",
        brandLookalike: "The registered domain contains “{detail}” but is not it, which usually means an impersonating domain with extra words around the brand.",
      },
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

    // 主機真身。乾淨網址之下、複製鈕之上，讀者複製之前先看到自己要貼的是哪一家。
    const facts = result.host;
    if (facts) {
      const hostBox = el("div", "cu-host");
      const line = el("p");
      line.appendChild(document.createTextNode(t.hostTitle + " "));
      line.appendChild(el("strong", null, facts.registrableDisplay));
      if (facts.registrable !== facts.host) {
        line.appendChild(document.createTextNode("　"));
        line.appendChild(el("span", "cu-host__full", t.hostFull.replace("{host}", facts.display)));
      }
      hostBox.appendChild(line);
      for (const warning of facts.warnings) {
        const text = (t.hostWarnings[warning.kind] || warning.kind).replace("{detail}", warning.detail || "");
        hostBox.appendChild(el("p", warning.kind === "idn" ? null : "cu-warn", text));
      }
      body.appendChild(hostBox);
    }

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
