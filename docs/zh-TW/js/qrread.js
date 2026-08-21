/*
 * QR code 讀取器（utils/qr-read.md）。
 *
 * 對方給你一張 QR code 的照片，你想知道裡面是什麼，但不想用一個會把圖片上傳的 App。
 * 這一頁在你的瀏覽器裡解，圖片不離開裝置。
 *
 * 解碼交給 utils/vendor/jsQR.js（Apache-2.0，原封不動）。那要處理定位、透視校正與
 * 糾錯，比編碼更大的工程，自己寫不切實際。
 *
 * 刻意不做的一件事：解出來是網址時不渲染成可點的連結，也不提供「開啟」按鈕。QR 是
 * 釣魚的常見載體，內容看起來像官網、主機卻是別的，一按就開等於幫忙完成攻擊。這一頁
 * 只顯示，並且把主機獨立標出來讓讀者自己看清楚。
 *
 * classify() 認得的不只網址。QR code 裡塞得進 Wi-Fi 設定、兩步驟驗證的綁定資料、
 * 預先寫好的信與簡訊、座標、名片，那些格式一般人看原始字串讀不出重點在哪：
 * WIFI:T:nopass;S:FreeWiFi;;
 * 的重點是 nopass，
 * otpauth://totp/GitHub:alice?secret=...
 * 的重點是那串 secret 等於第二因素本身。所以認出格式之後把欄位拆開來標，並針對真正
 * 有風險的組合給一句話說明。
 *
 * 分工上有一條線：qd-out 那一格永遠是一字不差的原始內容，不遮不改，那是這個工具的
 * 承諾。欄位表是「幫你讀懂」，那裡的密碼預設遮起來，要看得自己按一下，因為掃碼的
 * 場合旁邊常常有人。otpauth 的 secret 連欄位表都不列。
 *
 * 三個語系共用這一份，docs/en/js/ 與 docs/zh-CN/js/ 底下是指向這裡的 symlink。
 * 純邏輯由 tools/test_qrread.mjs 原地抽出來測，那支用 qrcode-generator 產生已知內容
 * 的碼再交給 jsQR 讀回來，兩個各自獨立的函式庫互相驗證。
 */
(function () {
  "use strict";

  // --- 純邏輯（tools/test_qrread.mjs 從這裡原地抽出來測）---

  // 畫進 canvas 時每個模組放多大、四周留幾格。太小的話 jsQR 對不到定位圖樣，
  // 留白不夠的話邊界找不到，兩者都會變成「讀不出來」而不是報錯。
  const SCALE = 6;
  const QUIET = 4;

  // 解出來的是什麼東西。分類決定要提醒什麼：網址要看主機、Wi-Fi 設定裡的加密方式
  // 決定連上去之後同一個網路的人看不看得到你、otpauth 裡那串是某個帳號的第二因素。
  //
  // 回傳的是純資料，不含任何在地化文字。kind 對應 STRINGS.kinds 的一段說明，fields
  // 是拆出來的欄位（key 對應 STRINGS.labels），warns 是要另外提醒的事（對應
  // STRINGS.warns）。三個語系共用同一份判斷，文案各自查表。

  // 這些 scheme 一按就執行，QR code 裡出現沒有正當理由。
  const DANGEROUS = ["javascript:", "data:", "vbscript:", "file:"];

  // 短網址服務。目的地要連上去才知道，這一頁不會替讀者連。前段是國際常見的，
  // 後段是台灣的社群與電商在用的。
  const SHORTENERS = [
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly",
    "cutt.ly", "rebrand.ly", "shorturl.at", "rb.gy", "s.id", "t.ly", "lnkd.in",
    "reurl.cc", "pse.is", "lihi.cc", "lihi1.cc", "lihi2.cc", "lihi3.cc",
    "myppt.cc", "0rz.tw", "ppt.cc", "piee.pw", "sc.piee.pw",
  ];

  // 只認最常見的幾個，用來提示「這裡有東西可以清」。完整的清單與解包規則在
  // 網址清理器（utils/clean-url.md）那邊，兩份不同步是刻意的：這一頁只負責指路。
  const TRACKERS = [
    "fbclid", "gclid", "gbraid", "wbraid", "msclkid", "ttclid", "twclid",
    "igshid", "mc_eid", "mc_cid", "yclid", "dclid", "_openstat",
  ];

  // WIFI: 與 MECARD: 用 ; 分段、\ 跳脫。SSID 裡出現分號或冒號是合法的，直接
  // split(";") 會把網路名切成兩半。
  function splitEscaped(text, sep) {
    const out = [];
    let cur = "";
    for (let i = 0; i < text.length; i += 1) {
      const ch = text.charAt(i);
      if (ch === "\\" && i + 1 < text.length) {
        cur += ch + text.charAt(i + 1);
        i += 1;
        continue;
      }
      if (ch === sep) {
        out.push(cur);
        cur = "";
        continue;
      }
      cur += ch;
    }
    out.push(cur);
    return out;
  }

  function unescapeValue(text) {
    return text.replace(/\\(.)/g, "$1");
  }

  // KEY:value;KEY:value; 這種格式，WIFI 與 MECARD 共用。同一個 key 出現兩次取第一個。
  function parsePairs(body) {
    const map = {};
    for (const part of splitEscaped(body, ";")) {
      const at = part.indexOf(":");
      if (at < 0) continue;
      const key = part.slice(0, at).toUpperCase();
      if (!(key in map)) map[key] = unescapeValue(part.slice(at + 1));
    }
    return map;
  }

  function parseWifi(text) {
    const map = parsePairs(text.slice(5));
    const raw = (map.T || "").toUpperCase();
    // 格式定義裡 T 留空就是沒有密碼。但省略 T 卻給了 P 的產生器實際上存在，那種
    // 情況說不準是哪一種，寧可顯示「沒有指明」也不要猜一個 WPA 讓人放心。
    const security =
      raw === "NOPASS" || (raw === "" && !map.P) ? "open" :
      raw === "" ? "unknown" :
      raw === "WEP" ? "wep" : "other";
    const fields = [];
    const warns = [];
    if (map.S) fields.push({ key: "ssid", value: map.S });
    if (security === "open") fields.push({ key: "security", token: "wifiOpen" });
    else if (security === "unknown") fields.push({ key: "security", token: "wifiUnknown" });
    else fields.push({ key: "security", value: raw });
    if (map.P) fields.push({ key: "password", value: map.P, secret: true });
    if ((map.H || "").toLowerCase() === "true") fields.push({ key: "hidden", token: "yes" });
    if (security === "open") warns.push("wifiOpen");
    if (security === "wep") warns.push("wifiWep");
    return { kind: "wifi", fields: fields, warns: warns };
  }

  function contactResult(info) {
    const fields = [];
    if (info.name) fields.push({ key: "name", value: info.name });
    if (info.org) fields.push({ key: "org", value: info.org });
    if (info.tel) fields.push({ key: "number", value: info.tel });
    if (info.email) fields.push({ key: "email", value: info.email });
    if (info.url) fields.push({ key: "link", value: info.url });
    return { kind: "contact", fields: fields, warns: [] };
  }

  // MECARD 的 N 是「姓,名」，逗號在這裡是分隔符號不是內容。
  function parseMecard(text) {
    const map = parsePairs(text.slice(7));
    return contactResult({
      name: map.N ? map.N.split(",").filter(Boolean).join(" ") : "",
      org: map.ORG, tel: map.TEL, email: map.EMAIL, url: map.URL,
    });
  }

  // vCard 是一行一個屬性，屬性名後面可以掛參數（TEL;TYPE=CELL:0912...）。
  // FN 是給人看的完整姓名，N 是拆成姓、名的結構化寫法，兩個都有時以 FN 為準。
  function parseVcard(text) {
    const out = {};
    for (const line of text.split(/\r?\n/)) {
      const at = line.indexOf(":");
      if (at < 0) continue;
      const name = line.slice(0, at).split(";")[0].toUpperCase();
      const value = line.slice(at + 1).trim();
      if (!value) continue;
      if (name === "FN") out.fn = value;
      else if (name === "N" && !out.n) out.n = value.split(";").filter(Boolean).reverse().join(" ");
      else if (name === "TEL" && !out.tel) out.tel = value;
      else if (name === "EMAIL" && !out.email) out.email = value;
      else if (name === "ORG" && !out.org) out.org = value.replace(/;+$/, "");
      else if (name === "URL" && !out.url) out.url = value;
    }
    return contactResult({
      name: out.fn || out.n, org: out.org, tel: out.tel, email: out.email, url: out.url,
    });
  }

  // otpauth://totp/發行者:帳號?secret=...。那串 secret 就是第二因素本身，拿到的人
  // 可以自己產出驗證碼，所以欄位表不列它，只提醒它在原始內容裡。
  function parseOtp(url) {
    const fields = [];
    const type = (url.hostname || "").toLowerCase();
    const label = decodeURIComponent(url.pathname.replace(/^\//, ""));
    const colon = label.indexOf(":");
    const issuer = url.searchParams.get("issuer") || (colon > 0 ? label.slice(0, colon) : "");
    const account = colon >= 0 ? label.slice(colon + 1) : label;
    if (issuer) fields.push({ key: "issuer", value: issuer });
    if (account) fields.push({ key: "account", value: account });
    if (type) fields.push({ key: "otpType", value: type.toUpperCase() });
    return { kind: "otp", fields: fields, warns: url.searchParams.get("secret") ? ["otpSecret"] : [] };
  }

  function parseMail(url) {
    const fields = [];
    const to = decodeURIComponent(url.pathname);
    const subject = url.searchParams.get("subject");
    const body = url.searchParams.get("body");
    if (to) fields.push({ key: "to", value: to });
    if (subject) fields.push({ key: "subject", value: subject });
    if (body) fields.push({ key: "body", value: body });
    return { kind: "mail", fields: fields, warns: body ? ["mailBody"] : [] };
  }

  function parseTel(url) {
    const number = decodeURIComponent(url.pathname);
    return { kind: "tel", fields: [{ key: "number", value: number }], warns: [] };
  }

  // sms:號碼?body=內文 與 smsto:號碼:內文 兩種寫法都有人用。
  function parseSms(url) {
    let number = decodeURIComponent(url.pathname);
    let body = url.searchParams.get("body");
    if (!body) {
      const at = number.indexOf(":");
      if (at >= 0) {
        body = number.slice(at + 1);
        number = number.slice(0, at);
      }
    }
    const fields = [{ key: "number", value: number }];
    if (body) fields.push({ key: "body", value: body });
    return { kind: "sms", fields: fields, warns: body ? ["smsBody"] : [] };
  }

  function decimals(text) {
    const dot = text.indexOf(".");
    return dot < 0 ? 0 : text.length - dot - 1;
  }

  // 小數點後每多一位，座標指到的範圍就縮小十倍。111320 是緯度一度在地表上的公尺數，
  // 拿它換算成距離，讀者才知道這組座標是指到一個城市還是指到某一戶門口。
  function precisionField(digits) {
    const metres = 111320 / Math.pow(10, digits);
    if (metres >= 1000) return { key: "precision", value: (metres / 1000).toFixed(1), unit: "km" };
    if (metres >= 10) return { key: "precision", value: String(Math.round(metres)), unit: "m" };
    return { key: "precision", value: metres.toFixed(1), unit: "m" };
  }

  function parseGeo(url) {
    const q = url.searchParams.get("q");
    const source = q && /^-?\d/.test(q) ? q : url.pathname;
    const coords = source.split("(")[0].split(",");
    const lat = (coords[0] || "").trim();
    const lon = (coords[1] || "").trim();
    if (!/^-?\d+(\.\d+)?$/.test(lat) || !/^-?\d+(\.\d+)?$/.test(lon)) {
      return { kind: "text", fields: [], warns: [] };
    }
    return {
      kind: "geo",
      fields: [
        { key: "lat", value: lat },
        { key: "lon", value: lon },
        precisionField(Math.max(decimals(lat), decimals(lon))),
      ],
      warns: ["geoLeak"],
    };
  }

  function countTracking(url) {
    let n = 0;
    url.searchParams.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (lower.indexOf("utm_") === 0 || TRACKERS.indexOf(lower) >= 0) n += 1;
    });
    return n;
  }

  function urlResult(url) {
    // hostname 已經是 punycode，同形字的主機會顯示成 xn-- 開頭，那正是要讓讀者看到的
    const host = url.hostname;
    if (/\.onion$/i.test(host)) return { kind: "onion", host: host, fields: [], warns: [] };
    const fields = [];
    const warns = [];
    if (SHORTENERS.indexOf(host.replace(/^www\./i, "").toLowerCase()) >= 0) warns.push("shortener");
    const tracking = countTracking(url);
    if (tracking) {
      fields.push({ key: "tracking", value: String(tracking), unit: "count" });
      warns.push("tracking");
    }
    return { kind: "url", host: host, fields: fields, warns: warns };
  }

  function classify(text) {
    const trimmed = text.trim();

    // 這幾種要在 new URL() 之前攔下來。WIFI:、MECARD:、BEGIN: 都會被當成 scheme
    // 解析成功，落到後面就分不出來了。
    if (/^WIFI:/i.test(trimmed)) return parseWifi(trimmed);
    if (/^MECARD:/i.test(trimmed)) return parseMecard(trimmed);
    if (/^BEGIN:VCARD/i.test(trimmed)) return parseVcard(trimmed);
    if (/^(obfs4|webtunnel|snowflake|meek_lite|obfs3|scramblesuit)\s/i.test(trimmed)) {
      return { kind: "bridge", fields: [], warns: [] };
    }

    let url = null;
    try {
      url = new URL(trimmed);
    } catch (err) {
      return { kind: "text", fields: [], warns: [] };
    }

    const scheme = url.protocol.toLowerCase();
    if (DANGEROUS.indexOf(scheme) >= 0) {
      return {
        kind: "danger",
        fields: [{ key: "scheme", value: scheme.replace(":", "") }],
        warns: ["danger"],
      };
    }
    if (scheme === "otpauth:") return parseOtp(url);
    if (scheme === "mailto:") return parseMail(url);
    if (scheme === "tel:") return parseTel(url);
    if (scheme === "sms:" || scheme === "smsto:") return parseSms(url);
    if (scheme === "geo:") return parseGeo(url);
    if (scheme !== "http:" && scheme !== "https:") return { kind: "text", fields: [], warns: [] };
    return urlResult(url);
  }

  // 原始內容那一格預設把密鑰與 Wi-Fi 密碼遮起來。叫讀者小心截圖，卻把那一串攤在
  // 畫面上，兩件事對不起來。按一下就展開，一字不差的內容仍然看得到。
  const DOTS = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";

  function maskRaw(text, info) {
    if (!info) return text;
    if (info.kind === "otp") {
      return text.replace(/([?&]secret=)[^&]+/i, "$1" + DOTS);
    }
    if (info.kind === "wifi") {
      // 密碼在原文裡是跳脫過的形式，拿欄位值去比對找不到，要照格式重新框出來
      return text.replace(/(^|;)(P:)(?:\\.|[^;\\])*/i, "$1$2" + DOTS);
    }
    return text;
  }

  // --- 介面 ---

  const root = document.getElementById("qrread-tool");
  if (!root) return;

  const CSS = `
    #qrread-tool { margin: 1em 0; }
    #qrread-tool .qd-drop {
      border: .1rem dashed var(--md-default-fg-color--lighter);
      border-radius: .2rem; padding: 1.6rem 1rem; text-align: center;
      font-size: .78rem; line-height: 1.8; cursor: pointer;
    }
    #qrread-tool .qd-drop--over {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #qrread-tool input[type="file"] { display: none; }
    #qrread-tool .qd-out {
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-left: .15rem solid #2e7d32;
      border-radius: .1rem; padding: .7rem; margin: .8rem 0 .4rem;
      font-family: var(--md-code-font-family, monospace);
      font-size: .74rem; line-height: 1.7; word-break: break-all; user-select: all;
    }
    #qrread-tool .qd-host {
      font-size: .78rem; margin: .6rem 0 .2rem; line-height: 1.7;
      border-left: .15rem solid #ef6c00; padding-left: .6rem;
    }
    #qrread-tool .qd-host code {
      font-family: var(--md-code-font-family, monospace);
      background: var(--md-default-fg-color--lightest); padding: 0 .2rem; border-radius: .1rem;
    }
    #qrread-tool .qd-kind { font-size: .72rem; opacity: .8; margin: .4rem 0 0; line-height: 1.7; }
    #qrread-tool .qd-row { display: flex; flex-wrap: wrap; gap: .5rem; margin: .4rem 0 0; }
    #qrread-tool .qd-fields {
      display: grid; grid-template-columns: max-content 1fr; gap: .35rem .9rem;
      margin: .8rem 0 0; font-size: .76rem; line-height: 1.7;
    }
    #qrread-tool .qd-fields dt { opacity: .7; }
    #qrread-tool .qd-fields dd { margin: 0; word-break: break-all; }
    #qrread-tool .qd-mask { font-family: var(--md-code-font-family, monospace); letter-spacing: .12em; }
    #qrread-tool button.qd-reveal {
      font-size: .68rem; padding: .1rem .45rem; margin-left: .5rem; vertical-align: .05rem;
    }
    #qrread-tool .qd-warn {
      font-size: .76rem; margin: .7rem 0 0; line-height: 1.7;
      border-left: .15rem solid #ef6c00; padding-left: .6rem;
    }
    /* 窄螢幕把標籤換到值的上一行。並排時中文標籤還好，英文的 Tracking parameters
       會把值擠成一個字一行。 */
    @media (max-width: 30em) {
      #qrread-tool .qd-fields { grid-template-columns: 1fr; gap: 0; }
      #qrread-tool .qd-fields dt { margin-top: .5rem; }
      #qrread-tool .qd-fields dt:first-child { margin-top: 0; }
    }
    #qrread-tool .qd-error {
      border-left: .15rem solid var(--md-typeset-del-color, #f44336);
      padding: .1rem 0 .1rem .6rem; margin: .8rem 0;
    }
    #qrread-tool button {
      font: inherit; color: inherit; cursor: pointer; background: none;
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .35rem .8rem; margin: .4rem .4rem 0 0;
    }
    #qrread-tool button:hover:not(:disabled) {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #qrread-tool button:disabled { opacity: .5; cursor: default; }
    #qrread-tool .qd-note { font-size: .7rem; opacity: .7; line-height: 1.6; margin: 1rem 0 0; }
    @media (pointer: coarse) { #qrread-tool button { min-height: 2.2rem; } }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const STRINGS = {
    "zh-TW": {
      drop: "把 QR code 的圖片拖進來，或點一下選檔案。也可以直接貼上（Ctrl+V）。",
      dropOver: "放開就開始解讀",
      reading: "解讀中",
      notFound: "這張圖裡找不到 QR code。試試裁掉周圍、或換一張更清楚的。",
      notImage: "那不是圖片檔。",
      copy: "複製內容",
      copyFull: "複製完整內容",
      copied: "已複製",
      hostLabel: "這個網址會把你帶到",
      punycode: "主機名裡有非拉丁字母，顯示成 xn-- 開頭的形式。那多半是用長得像的字母冒充別的網域。",
      note: "圖片在你的瀏覽器裡解讀，沒有送到任何地方。斷網時照樣可以用。",
      kinds: {
        url: "解出來的是一個網址。QR code 是釣魚常用的載體，內容看起來像官網、主機卻是別的。上面那個主機名確認過再自己開，這一頁刻意不提供開啟按鈕。",
        onion: "解出來的是一個 onion 網址。要用 Tor Browser 才開得起來。",
        bridge: "解出來的是一行 Tor bridge。那是給你自己用的，貼到公開的地方等於讓它被封鎖。",
        wifi: "解出來的是一組 Wi-Fi 設定。掃了直接連上去的 App 不會先讓你看到這些欄位。",
        otp: "解出來的是一組兩步驟驗證的設定，通常是綁定驗證器 App 時掃的那一張。",
        mail: "解出來的是一封已經寫好的信。",
        tel: "解出來的是一組電話號碼。掃了就撥的貼紙貼在公共場所，被換掉很容易。",
        sms: "解出來的是一則已經寫好的簡訊。",
        geo: "解出來的是一組地理座標。",
        contact: "解出來的是一張電子名片。存進通訊錄之前先看清楚欄位。",
        danger: "解出來的內容用的是會直接執行的協定。",
        text: "解出來的是一段文字。",
      },
      reveal: "顯示",
      hide: "遮住",
      labels: {
        ssid: "網路名稱", security: "加密方式", password: "密碼", hidden: "隱藏網路",
        name: "姓名", org: "單位", number: "號碼", email: "電子郵件", link: "網址",
        issuer: "發行者", account: "帳號", otpType: "驗證方式",
        to: "收件人", subject: "主旨", body: "內文",
        lat: "緯度", lon: "經度", precision: "精度",
        tracking: "追蹤參數", scheme: "協定",
      },
      tokens: { wifiOpen: "沒有加密", wifiUnknown: "沒有指明", yes: "是" },
      units: { m: " 公尺", km: " 公里", count: " 個" },
      warns: {
        wifiOpen: "這個網路沒有密碼。連上去之後，同一個網路裡的人有辦法看到你連了哪些主機。",
        wifiWep: "WEP 這個加密方式早就被破了。設了密碼，擋不住有心人。",
        otpSecret: "這張碼裡有一組兩步驟驗證的密鑰。取得那一串的人可以自己算出驗證碼，第二道關卡就形同虛設。上面的原始內容預設把那一串遮起來，按「顯示」才會展開。",
        mailBody: "這張碼已經把信的內容寫好了。按下去只差一個送出，送出之前逐字看過。",
        smsBody: "這張碼已經把簡訊內容寫好了。有些付費服務靠的就是一則你沒細看的簡訊開通。",
        geoLeak: "這是一組座標。轉貼出去等於告訴收到的人那個地點在哪裡。",
        shortener: "這是短網址。真正的目的地要連上去才知道，這一頁不會替你連。",
        tracking: "這個網址帶了追蹤參數。網址清理器可以拿掉那幾個再轉貼。",
        danger: "這個開頭的內容一按就在你的瀏覽器裡執行。QR code 裡出現它沒有正當理由。",
      },
    },
    zh: {
      drop: "把 QR code 的图片拖进来，或点一下选文件。也可以直接粘贴（Ctrl+V）。",
      dropOver: "放开就开始解读",
      reading: "解读中",
      notFound: "这张图里找不到 QR code。试试裁掉周围、或换一张更清楚的。",
      notImage: "那不是图片文件。",
      copy: "复制内容",
      copyFull: "复制完整内容",
      copied: "已复制",
      hostLabel: "这个网址会把你带到",
      punycode: "主机名里有非拉丁字母，显示成 xn-- 开头的形式。那多半是用长得像的字母冒充别的域名。",
      note: "图片在你的浏览器里解读，没有送到任何地方。断网时照样可以用。",
      kinds: {
        url: "解出来的是一个网址。QR code 是钓鱼常用的载体，内容看起来像官网、主机却是别的。上面那个主机名确认过再自己打开，这一页刻意不提供打开按钮。",
        onion: "解出来的是一个 onion 网址。要用 Tor Browser 才打得开。",
        bridge: "解出来的是一行 Tor bridge。那是给你自己用的，贴到公开的地方等于让它被封锁。",
        wifi: "解出来的是一组 Wi-Fi 设置。扫了直接连上去的 App 不会先让你看到这些字段。",
        otp: "解出来的是一组两步验证的设置，通常是绑定验证器 App 时扫的那一张。",
        mail: "解出来的是一封已经写好的邮件。",
        tel: "解出来的是一组电话号码。扫了就拨的贴纸贴在公共场所，被换掉很容易。",
        sms: "解出来的是一条已经写好的短信。",
        geo: "解出来的是一组地理坐标。",
        contact: "解出来的是一张电子名片。存进通讯录之前先看清楚字段。",
        danger: "解出来的内容用的是会直接执行的协议。",
        text: "解出来的是一段文字。",
      },
      reveal: "显示",
      hide: "遮住",
      labels: {
        ssid: "网络名称", security: "加密方式", password: "密码", hidden: "隐藏网络",
        name: "姓名", org: "单位", number: "号码", email: "电子邮件", link: "网址",
        issuer: "发行者", account: "账号", otpType: "验证方式",
        to: "收件人", subject: "主题", body: "正文",
        lat: "纬度", lon: "经度", precision: "精度",
        tracking: "跟踪参数", scheme: "协议",
      },
      tokens: { wifiOpen: "没有加密", wifiUnknown: "没有指明", yes: "是" },
      units: { m: " 米", km: " 公里", count: " 个" },
      warns: {
        wifiOpen: "这个网络没有密码。连上去之后，同一个网络里的人有办法看到你连了哪些主机。",
        wifiWep: "WEP 这个加密方式早就被破了。设了密码，挡不住有心人。",
        otpSecret: "这张码里有一组两步验证的密钥。取得那一串的人可以自己算出验证码，第二道关卡就形同虚设。上面的原始内容默认把那一串遮起来，按「显示」才会展开。",
        mailBody: "这张码已经把邮件的内容写好了。按下去只差一个发送，发送之前逐字看过。",
        smsBody: "这张码已经把短信内容写好了。有些付费服务靠的就是一条你没细看的短信开通。",
        geoLeak: "这是一组坐标。转发出去等于告诉收到的人那个地点在哪里。",
        shortener: "这是短网址。真正的目的地要连上去才知道，这一页不会替你连。",
        tracking: "这个网址带了跟踪参数。网址清理器可以拿掉那几个再转发。",
        danger: "这个开头的内容一按就在你的浏览器里执行。QR code 里出现它没有正当理由。",
      },
    },
    en: {
      drop: "Drop a QR code image here, or click to choose a file. Pasting works too (Ctrl+V).",
      dropOver: "Release to read it",
      reading: "Reading",
      notFound: "No QR code found in that image. Try cropping the surroundings, or use a sharper photo.",
      notImage: "That is not an image file.",
      copy: "Copy contents",
      copyFull: "Copy full contents",
      copied: "Copied",
      hostLabel: "This URL would take you to",
      punycode: "The hostname contains non-Latin letters and is shown in its xn-- form. That usually means letters shaped like others are impersonating a different domain.",
      note: "The image is read inside your browser and is not sent anywhere. It works with the network off.",
      kinds: {
        url: "This is a URL. QR codes are a common phishing carrier: the text looks like an official site while the host is something else. Check the hostname above and open it yourself. This page deliberately offers no open button.",
        onion: "This is an onion address. It only opens in Tor Browser.",
        bridge: "This is a Tor bridge line. It is meant for you alone. Posting it in public is what gets it blocked.",
        wifi: "This is a Wi-Fi configuration. An app that connects straight from the scan never shows you these fields first.",
        otp: "This is a two-factor authentication setup, usually the code you scan when binding an authenticator app.",
        mail: "This is an email already written for you.",
        tel: "This is a phone number. A scan-to-dial sticker in a public place is easy to swap out.",
        sms: "This is a text message already written for you.",
        geo: "This is a pair of geographic coordinates.",
        contact: "This is a contact card. Read the fields before saving it to your address book.",
        danger: "The content uses a scheme that executes directly.",
        text: "This is plain text.",
      },
      reveal: "Show",
      hide: "Hide",
      labels: {
        ssid: "Network name", security: "Encryption", password: "Password", hidden: "Hidden network",
        name: "Name", org: "Organization", number: "Number", email: "Email", link: "URL",
        issuer: "Issuer", account: "Account", otpType: "Type",
        to: "To", subject: "Subject", body: "Message",
        lat: "Latitude", lon: "Longitude", precision: "Precision",
        tracking: "Tracking parameters", scheme: "Scheme",
      },
      tokens: { wifiOpen: "none", wifiUnknown: "not specified", yes: "yes" },
      units: { m: " m", km: " km", count: "" },
      warns: {
        wifiOpen: "This network has no password. Once you join, anyone else on it can see which hosts you connect to.",
        wifiWep: "WEP was broken long ago. The password is set, and it will not stop anyone who tries.",
        otpSecret: "This code carries a two-factor secret. Whoever holds that string can generate the codes themselves, which leaves the second factor doing nothing. The raw content above masks it by default. Press \"Show\" to reveal it.",
        mailBody: "This code has the body of the email already written. Tapping it leaves only the send. Read it word by word first.",
        smsBody: "This code has the text message already written. Some premium services are activated by exactly one message you did not read closely.",
        geoLeak: "These are coordinates. Forwarding them tells the recipient where that place is.",
        shortener: "This is a shortened URL. The real destination is only known once you follow it, and this page will not follow it for you.",
        tracking: "This URL carries tracking parameters. The URL cleaner can strip them before you pass it on.",
        danger: "Content starting this way runs in your browser the moment it is opened. There is no legitimate reason for it to appear in a QR code.",
      },
    },
  };
  const t = STRINGS[document.documentElement.lang] || STRINGS["zh-TW"];

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const state = { status: "idle", text: "", info: null, copied: false, revealed: false };

  // 圖片畫進 canvas 取像素。大圖先縮到合理尺寸，不然手機拍的照片動輒四千萬像素，
  // 解起來會卡住整個分頁。
  function decode(source) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const max = 1600;
        const ratio = Math.min(1, max / Math.max(image.width, image.height));
        const w = Math.max(1, Math.round(image.width * ratio));
        const h = Math.max(1, Math.round(image.height * ratio));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(image, 0, 0, w, h);
        const pixels = ctx.getImageData(0, 0, w, h);
        URL.revokeObjectURL(image.src);
        resolve(window.jsQR ? window.jsQR(pixels.data, w, h) : null);
      };
      image.onerror = () => resolve(null);
      image.src = URL.createObjectURL(source);
    });
  }

  function handle(file) {
    if (!file || !/^image\//.test(file.type)) {
      state.status = "notImage";
      render();
      return;
    }
    state.status = "reading";
    render();
    decode(file).then((result) => {
      if (!result || !result.data) {
        state.status = "notFound";
        render();
        return;
      }
      state.status = "done";
      state.text = result.data;
      state.info = classify(result.data);
      state.copied = false;
      state.revealed = false;
      render();
    });
  }

  function render() {
    root.textContent = "";

    const picker = document.createElement("input");
    picker.type = "file";
    picker.accept = "image/*";
    picker.addEventListener("change", () => handle(picker.files && picker.files[0]));

    const drop = el("div", "qd-drop", state.status === "reading" ? t.reading : t.drop);
    drop.addEventListener("click", () => picker.click());
    drop.addEventListener("dragover", (event) => {
      event.preventDefault();
      drop.classList.add("qd-drop--over");
      drop.textContent = t.dropOver;
    });
    drop.addEventListener("dragleave", () => {
      drop.classList.remove("qd-drop--over");
      drop.textContent = t.drop;
    });
    drop.addEventListener("drop", (event) => {
      event.preventDefault();
      drop.classList.remove("qd-drop--over");
      const file = event.dataTransfer && event.dataTransfer.files[0];
      handle(file);
    });
    root.appendChild(picker);
    root.appendChild(drop);

    if (state.status === "notFound" || state.status === "notImage") {
      root.appendChild(el("p", "qd-error", t[state.status]));
    }

    if (state.status === "done") {
      // 只放文字節點。解出來的可能是釣魚網址，渲染成可點的連結等於幫忙完成攻擊。
      const masked = maskRaw(state.text, state.info);
      const hidden = masked !== state.text && !state.revealed;
      root.appendChild(el("div", "qd-out", hidden ? masked : state.text));

      const row = el("div", "qd-row");
      // 複製給的是完整內容。按鈕自己講清楚，不然讀者會以為複製到的是遮罩過的那一份。
      const copy = el("button", null, state.copied ? t.copied : hidden ? t.copyFull : t.copy);
      copy.type = "button";
      copy.addEventListener("click", () => {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(state.text).then(() => {
          state.copied = true;
          render();
        });
      });
      copy.disabled = !navigator.clipboard;
      row.appendChild(copy);

      // 一顆開關同時管原始內容與欄位表。掃碼的時候旁邊常常有人，要看得自己按一下。
      if (masked !== state.text) {
        const toggle = el("button", null, state.revealed ? t.hide : t.reveal);
        toggle.type = "button";
        toggle.addEventListener("click", () => {
          state.revealed = !state.revealed;
          render();
        });
        row.appendChild(toggle);
      }
      root.appendChild(row);

      if (state.info.host) {
        const line = el("p", "qd-host");
        line.appendChild(document.createTextNode(t.hostLabel + "　"));
        line.appendChild(el("code", null, state.info.host));
        root.appendChild(line);
      }

      // 拆出來的欄位。上面那一格是一字不差的原始內容，這裡是幫讀者讀懂它。
      const fields = state.info.fields || [];
      if (fields.length) {
        const list = el("dl", "qd-fields");
        for (const field of fields) {
          list.appendChild(el("dt", null, t.labels[field.key] || field.key));
          const value = el("dd", null);
          if (field.secret && !state.revealed) {
            value.appendChild(el("span", "qd-mask", "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"));
          } else if (field.token) {
            value.appendChild(document.createTextNode(t.tokens[field.token] || field.token));
          } else {
            const unit = field.unit ? t.units[field.unit] || "" : "";
            value.appendChild(document.createTextNode(field.value + unit));
          }
          list.appendChild(value);
        }
        root.appendChild(list);
      }

      // 同形字冒充的主機也是一種提醒，跟其他警告排在一起。
      const host = state.info.host || "";
      if (host.indexOf("xn--") === 0 || host.indexOf(".xn--") > 0) {
        root.appendChild(el("p", "qd-warn", t.punycode));
      }
      for (const code of state.info.warns || []) {
        root.appendChild(el("p", "qd-warn", t.warns[code] || code));
      }

      root.appendChild(el("p", "qd-kind", t.kinds[state.info.kind]));
    }

    root.appendChild(el("p", "qd-note", t.note));
  }

  // 直接貼上圖片。手機截圖之後最快的路徑。
  document.addEventListener("paste", (event) => {
    const items = event.clipboardData && event.clipboardData.items;
    if (!items) return;
    for (const item of items) {
      if (item.type && item.type.indexOf("image/") === 0) {
        handle(item.getAsFile());
        event.preventDefault();
        return;
      }
    }
  });

  render();
})();
