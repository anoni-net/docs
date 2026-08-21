/*
 * 「你的瀏覽器透露了什麼」示範頁（utils/leaks.md）。
 *
 * 這一頁刻意做成一個指紋收集器，讓讀者親眼看到隨便一個網站不必問任何人就拿得到多少
 * 東西。每一項旁邊標出 Tor Browser 會怎麼處理，示範才不只是嚇人，而是指向解法。
 *
 * 三條自我約束：
 *
 *   1. 所有數值只留在畫面上，不送出、不寫進任何儲存。tools/test_leaks.mjs 有一項專門
 *      掃這份原始碼，出現 fetch、sendBeacon、WebSocket、localStorage 那幾個字就紅。
 *   2. 不提供匯出。那份檔案本身就是一份完整指紋，留在裝置上比不留更糟，跟 GPS 軌跡
 *      是同一個判準。
 *   3. 不給「你比 99.x% 的人獨特」那種數字。那需要母體資料，我們沒有，硬給就是編。
 *
 * 需要授權的項目（位置、媒體裝置名稱）預設不跑，按了才問，而且按之前就告訴讀者
 * 會拿到什麼。
 *
 * 三個語系共用這一份，docs/en/js/ 與 docs/zh-CN/js/ 底下是指向這裡的 symlink。
 */
(function () {
  "use strict";

  // --- 純邏輯（tools/test_leaks.mjs 從這裡原地抽出來測）---

  // 字串雜湊。canvas 與 audio 那兩項的原始資料是幾十 KB 的位元組，畫在頁面上沒有
  // 意義，取一個短雜湊讓讀者換瀏覽器比對就夠。FNV-1a，不是密碼學用途，只要穩定。
  function shortHash(text) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, "0");
  }

  // 量出來的寬度跟三種備援字型都不一樣，就代表系統裝了這個字型。
  //
  // 差一個像素就算，字型度量本來就是連續值，寬鬆比對會把裝了的字型判成沒裝。
  function fontDetected(widths, baselines) {
    // 第 i 個寬度是用第 i 個備援字型量的，要跟同一個備援的基準比。
    // 交叉比對的話任兩個備援之間本來就差很多，每一種字型都會被判成有裝。
    return widths.some((w, i) => Math.abs(w - baselines[i]) > 0.5);
  }

  // 把幾項穩定的值揉成一個短碼，讓讀者換瀏覽器只要比對這一個，不必記住十幾個值。
  //
  // 只收 stable 的項目。視窗尺寸拉一下就變、儲存配額會漂移、裝置插拔會變，那些混
  // 進來的話同一個瀏覽器每次開都給出不同的碼，比對就失去意義。
  //
  // 這個碼本身是指紋，所以跟其他數值一樣只顯示在畫面上，不儲存也不匯出。它的用途
  // 是讓讀者理解「這些值加起來就是一個識別碼」，親眼看到比讀說明有效。
  function digestOf(entries) {
    const parts = entries
      .filter((entry) => entry.stable)
      .sort((a, b) => (a.key < b.key ? -1 : 1))
      .map((entry) => `${entry.key}=${entry.value === null ? "" : entry.value}`);
    return shortHash(parts.join("\n"));
  }

  // 幾項數值湊出來的組合有多少種可能，用來說明「單看不起眼，加起來就認得出人」。
  // 只算我們列出來的這幾項，不是全網統計，所以文案上說的是「這幾項加起來」。
  function combinations(counts) {
    return counts.reduce((total, n) => total * Math.max(1, n), 1);
  }

  // --- 探測項目 ---
  //
  // 每一項都要有 tor（Tor Browser 怎麼處理）與 why（為什麼這算指紋）。
  // 少了任何一個，測試會紅：只丟一堆數值給讀者而不說明，這一頁就只是在嚇人。

  const PROBES = [
    {
      key: "timezone",
      needsPermission: false,
      stable: true,
      read: (t) => {
        const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        const offset = -new Date().getTimezoneOffset() / 60;
        return t.fmt.timezone(zone, (offset >= 0 ? "+" : "") + offset);
      },
    },
    {
      key: "language",
      needsPermission: false,
      stable: true,
      read: () => (navigator.languages || [navigator.language]).join(", "),
    },
    {
      key: "screen",
      needsPermission: false,
      stable: true,
      read: (t) =>
        t.fmt.screen(screen.width, screen.height, window.innerWidth, window.innerHeight, window.devicePixelRatio),
      // 視窗尺寸讀者一拉就變，摘要碼只取螢幕本身，不然每次開視窗大小不同就對不起來
      digest: () => `${screen.width}x${screen.height}x${window.devicePixelRatio}`,
    },
    {
      key: "hardware",
      needsPermission: false,
      stable: true,
      read: (t) =>
        t.fmt.hardware(
          navigator.hardwareConcurrency || "?",
          navigator.deviceMemory || null,
          navigator.maxTouchPoints
        ),
    },
    {
      key: "webgl",
      needsPermission: false,
      stable: true,
      read: () => {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (!gl) return null;
        const info = gl.getExtension("WEBGL_debug_renderer_info");
        if (!info) return gl.getParameter(gl.VENDOR) + " / " + gl.getParameter(gl.RENDERER);
        return (
          gl.getParameter(info.UNMASKED_VENDOR_WEBGL) +
          " / " +
          gl.getParameter(info.UNMASKED_RENDERER_WEBGL)
        );
      },
    },
    {
      key: "canvas",
      needsPermission: false,
      stable: true,
      read: () => {
        const canvas = document.createElement("canvas");
        canvas.width = 240;
        canvas.height = 60;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        ctx.textBaseline = "top";
        ctx.font = "16px 'Arial'";
        ctx.fillStyle = "#f60";
        ctx.fillRect(10, 10, 60, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("anoni.net 匿名網路", 12, 24);
        return shortHash(canvas.toDataURL());
      },
    },
    {
      key: "fonts",
      needsPermission: false,
      stable: true,
      read: () => {
        // 拿一段文字分別用備援字型與「目標字型加備援」量寬度。裝了目標字型的話
        // 寬度會跟三種備援都不一樣。
        const probe = "mmmmmmmmmmlli匿名網路";
        const baseFamilies = ["monospace", "sans-serif", "serif"];
        const candidates = [
          "微軟正黑體", "蘋方-繁", "PingFang TC", "思源黑體", "Noto Sans CJK TC",
          "標楷體", "Arial", "Helvetica Neue", "Segoe UI", "Roboto", "Ubuntu",
        ];
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        const measure = (family) => {
          ctx.font = `72px ${family}`;
          return ctx.measureText(probe).width;
        };
        const baselines = baseFamilies.map(measure);
        const found = candidates.filter((name) =>
          fontDetected(baseFamilies.map((base) => measure(`'${name}', ${base}`)), baselines)
        );
        return found.length ? found.join(t.fmt.listSeparator) : null;
      },
    },
    {
      key: "preferences",
      needsPermission: false,
      stable: true,
      read: (t) => {
        const asks = [
          ["prefers-color-scheme: dark", "dark"],
          ["prefers-reduced-motion: reduce", "motion"],
          ["prefers-contrast: more", "contrast"],
          ["forced-colors: active", "forced"],
        ];
        const on = asks
          .filter(([query]) => window.matchMedia(query).matches)
          .map(([, key]) => t.prefs[key]);
        return on.length ? on.join(t.fmt.listSeparator) : null;
      },
    },
    {
      key: "storage",
      needsPermission: false,
      read: async (t) => {
        if (!navigator.storage || !navigator.storage.estimate) return null;
        const { quota } = await navigator.storage.estimate();
        if (!quota) return null;
        return t.fmt.storage((quota / 1024 / 1024 / 1024).toFixed(1));
      },
    },
    {
      key: "clientHints",
      needsPermission: false,
      stable: true,
      read: async (t) => {
        const data = navigator.userAgentData;
        if (!data || !data.getHighEntropyValues) return null;
        const hints = await data.getHighEntropyValues([
          "platform", "platformVersion", "model", "architecture", "bitness",
        ]);
        return [
          hints.platform && hints.platformVersion
            ? `${hints.platform} ${hints.platformVersion}`
            : hints.platform,
          hints.model || null,
          hints.architecture && hints.bitness
            ? `${hints.architecture} ${hints.bitness} 位元`
            : null,
        ]
          .filter(Boolean)
          .join(t.fmt.listSeparator);
      },
    },
    {
      key: "clientRects",
      needsPermission: false,
      stable: true,
      read: () => {
        // 量一個帶小數尺寸的元素。同樣的 CSS，不同的字型堆疊與縮放會算出不同的
        // 小數位，而那幾位小數就是識別碼。
        const probe = document.createElement("div");
        probe.style.cssText =
          "position:absolute;left:-9999px;top:-9999px;width:12.3456px;height:7.891px;" +
          "font:11.7px 'Arial';padding:0.13em;transform:rotate(0.37deg);";
        probe.textContent = "anoni";
        document.body.appendChild(probe);
        const rect = probe.getBoundingClientRect();
        probe.remove();
        return shortHash([rect.width, rect.height, rect.x, rect.y].join(","));
      },
    },
    {
      key: "audio",
      needsPermission: false,
      stable: true,
      read: async () => {
        const Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        if (!Ctx) return null;
        const ctx = new Ctx(1, 44100, 44100);
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = 10000;
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -50;
        compressor.knee.value = 40;
        compressor.ratio.value = 12;
        compressor.attack.value = 0;
        compressor.release.value = 0.25;
        osc.connect(compressor);
        compressor.connect(ctx.destination);
        osc.start(0);
        const rendered = await ctx.startRendering();
        const data = rendered.getChannelData(0);
        // 取中段一小片就夠，整段四萬多個樣本沒有必要
        let sum = "";
        for (let i = 4500; i < 5000; i += 1) sum += Math.abs(data[i]).toFixed(8);
        return shortHash(sum);
      },
    },
    {
      key: "donottrack",
      needsPermission: false,
      stable: true,
      read: (t) => {
        const dnt = navigator.doNotTrack === "1" || window.doNotTrack === "1";
        const gpc = navigator.globalPrivacyControl === true;
        if (!dnt && !gpc) return null;
        return [dnt ? "Do Not Track" : null, gpc ? "Global Privacy Control" : null]
          .filter(Boolean)
          .join(t.fmt.listSeparator);
      },
    },
    {
      key: "devices",
      needsPermission: false,
      read: async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return null;
        const list = await navigator.mediaDevices.enumerateDevices();
        const count = (kind) => list.filter((d) => d.kind === kind).length;
        return t.fmt.devices(count("videoinput"), count("audioinput"), count("audiooutput"));
      },
    },
    {
      key: "location",
      needsPermission: true,
      read: (t) =>
        new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("unsupported"));
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude, accuracy } = pos.coords;
              resolve(
                t.fmt.location(latitude.toFixed(5), longitude.toFixed(5), Math.round(accuracy))
              );
            },
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 15000 }
          );
        }),
    },
  ];

  // --- 介面 ---

  const root = document.getElementById("leaks-tool");
  if (!root) return;

  const CSS = `
    #leaks-tool { margin: 1em 0; }
    #leaks-tool table { width: 100%; }
    #leaks-tool .lk-item {
      border-bottom: .05rem solid var(--md-default-fg-color--lightest);
      padding: .7rem 0;
    }
    #leaks-tool .lk-name { font-weight: 700; font-size: .78rem; }
    #leaks-tool .lk-summary { margin: 0 0 1.2rem; }
    #leaks-tool .lk-code {
      font-family: var(--md-code-font-family, monospace);
      font-size: 1.4rem; letter-spacing: .1em; margin: 0;
    }
    #leaks-tool .lk-code-why { font-size: .7rem; opacity: .75; line-height: 1.6; margin: .2rem 0 0; }
    #leaks-tool .lk-tor-label { opacity: .7; }
    #leaks-tool .lk-value {
      font-family: var(--md-code-font-family, monospace);
      font-size: .74rem; word-break: break-word; margin: .25rem 0;
    }
    #leaks-tool .lk-none { opacity: .6; font-family: inherit; }
    #leaks-tool .lk-why, #leaks-tool .lk-tor {
      font-size: .7rem; line-height: 1.6; margin: .2rem 0 0;
    }
    #leaks-tool .lk-why { opacity: .75; }
    #leaks-tool .lk-tor {
      opacity: .85; border-left: .15rem solid var(--md-primary-fg-color);
      padding-left: .5rem; margin-top: .35rem;
    }
    #leaks-tool button {
      font: inherit; color: inherit; cursor: pointer; background: none;
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .35rem .8rem; margin: .3rem 0;
    }
    #leaks-tool button:hover:not(:disabled) {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #leaks-tool .lk-note { font-size: .7rem; opacity: .7; line-height: 1.6; margin: 1rem 0 0; }
    #leaks-tool .lk-ask {
      border-left: .15rem solid var(--md-typeset-del-color, #f44336);
      padding: .1rem 0 .1rem .6rem; margin: 1rem 0;
    }
    @media (pointer: coarse) { #leaks-tool button { min-height: 2.2rem; } }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const FMT_ZH_TW = {
    listSeparator: "、",
    timezone: (zone, offset) => `${zone}（UTC${offset}）`,
    screen: (w, h, iw, ih, dpr) => `${w} × ${h}，視窗 ${iw} × ${ih}，像素比 ${dpr}`,
    hardware: (cores, memory, touch) =>
      [`${cores} 核心`, memory ? `${memory} GB 記憶體` : null, `觸控點 ${touch}`]
        .filter(Boolean)
        .join("，"),
    storage: (gb) => `這個網站可以用掉 ${gb} GB`,
    devices: (cam, mic, out) => `${cam} 個相機、${mic} 個麥克風、${out} 個喇叭`,
    location: (lat, lon, acc) => `${lat}, ${lon}，誤差約 ${acc} 公尺`,
  };
  const FMT_ZH = {
    listSeparator: "、",
    timezone: (zone, offset) => `${zone}（UTC${offset}）`,
    screen: (w, h, iw, ih, dpr) => `${w} × ${h}，窗口 ${iw} × ${ih}，像素比 ${dpr}`,
    hardware: (cores, memory, touch) =>
      [`${cores} 核心`, memory ? `${memory} GB 内存` : null, `触控点 ${touch}`]
        .filter(Boolean)
        .join("，"),
    storage: (gb) => `这个网站可以用掉 ${gb} GB`,
    devices: (cam, mic, out) => `${cam} 个相机、${mic} 个麦克风、${out} 个扬声器`,
    location: (lat, lon, acc) => `${lat}, ${lon}，误差约 ${acc} 米`,
  };
  const FMT_EN = {
    listSeparator: ", ",
    timezone: (zone, offset) => `${zone} (UTC${offset})`,
    screen: (w, h, iw, ih, dpr) => `${w} × ${h}, window ${iw} × ${ih}, pixel ratio ${dpr}`,
    hardware: (cores, memory, touch) =>
      [`${cores} cores`, memory ? `${memory} GB memory` : null, `${touch} touch points`]
        .filter(Boolean)
        .join(", "),
    storage: (gb) => `this site may use up to ${gb} GB`,
    devices: (cam, mic, out) => `${cam} cameras, ${mic} microphones, ${out} speakers`,
    location: (lat, lon, acc) => `${lat}, ${lon}, accurate to about ${acc} m`,
  };

  const STRINGS = {
    "zh-TW": {
      fmt: FMT_ZH_TW,
      torLabel: "Tor Browser 會顯示",
      summary: "上面 {n} 項穩定的值揉成的短碼。換一個瀏覽器打開這一頁，比對這一個就知道有沒有變。它本身就是一個識別碼，所以只出現在畫面上，沒有存起來也沒有匯出。",
      unavailable: "這個瀏覽器沒有提供",
      denied: "你拒絕了，或者系統擋住了",
      askTitle: "下面這一項要你按了才會問",
      askButton: "顯示我的位置",
      askNote: "按下去瀏覽器會跳出授權視窗。允許之後這一頁會拿到你的經緯度與誤差範圍，只顯示在畫面上，不會送出也不會存起來。重新整理就沒了。",
      note: "以上全部在你的瀏覽器裡取得，沒有送出任何一項，也沒有寫進任何儲存。斷網時這一頁照樣跑得出來，那也是「沒有偷送東西」的證明。這一頁刻意不提供匯出，那份檔案本身就是一份完整的指紋。",
      prefs: { dark: "深色模式", motion: "減少動態", contrast: "高對比", forced: "強制色彩" },
      names: {
        timezone: "時區", language: "語言偏好", screen: "螢幕與視窗", hardware: "硬體",
        webgl: "顯示卡", canvas: "Canvas 指紋", fonts: "裝了哪些字型",
        preferences: "系統偏好設定", storage: "可用的儲存空間", devices: "影音裝置數量",
        clientHints: "Client Hints",
        clientRects: "元素位置的小數位",
        audio: "音訊指紋",
        donottrack: "追蹤偏好訊號",
        location: "地理位置",
      },
      why: {
        timezone: "時區直接指出你大概在哪個經度，而且換 VPN 換不掉，它來自作業系統設定。",
        language: "語言清單的組合比想像中獨特，尤其同時裝了幾種語言的人。",
        screen: "視窗尺寸每個人都不一樣，而且你調整視窗大小它就跟著變，可以用來確認前後是同一個人。",
        hardware: "核心數與記憶體單看很粗略，跟其他項目湊在一起就變成有效的區分。",
        webgl: "顯示卡型號字串非常獨特，同型號的機器才會一樣。",
        canvas: "同樣一段繪圖指令，不同的顯示卡與字型渲染出來的像素有細微差異，取雜湊就成了識別碼。",
        fonts: "裝了哪些字型會透露作業系統、地區與你用過哪些軟體。中文字型組合對辨識所在地特別有效。",
        preferences: "無障礙設定也是指紋。開了輔助功能的人反而更容易被認出來。",
        storage: "配額跟裝置的可用空間有關，是一個會慢慢變動的粗略指標。",
        devices: "不需要授權就數得出你有幾個相機與麥克風，數量組合本身就是指紋的一部分。",
        clientHints: "Chrome 用來取代 User-Agent 的機制，拿得到作業系統版本、機型與位元數，比原本的 User-Agent 更精確。它被稱為隱私友善的替代方案，而網站不必問你就讀得到。",
        clientRects: "同一段 CSS 畫出來的方塊，在不同的字型堆疊與縮放下算出來的小數位不一樣。連一個看不見的方塊落在畫面上哪個位置都能當識別碼。",
        audio: "產生一段聽不到的音訊再取數值特徵。不同的音訊處理實作算出來的浮點數有細微差異，跟 canvas 是同一類手法，但更少人知道。",
        donottrack: "你送出的「請不要追蹤我」訊號。實務上幾乎沒有網站遵守，而送出這個訊號的人相對少，反而讓你更容易被認出來。",
        location: "最直接的一項，精確到公尺。這一項要授權，其他項目都不用。",
      },
      tor: {
        timezone: "UTC",
        language: "en-US（所以這個網站不看這個值來決定語言）",
        screen: "固定成幾種常見尺寸，其餘用留白補齊",
        hardware: "2 核心，不提供記憶體大小",
        webgl: "通用字串，看不出實際型號（Brave 1.93 起也是）",
        canvas: "預設擋掉，需要時會問你（Brave 改用加雜訊）",
        fonts: "一組固定的內建字型，所有人都一樣",
        preferences: "淺色、不減少動態，所有人都一樣",
        storage: "固定值",
        devices: "不提供",
        clientHints: "不提供，那個 API 在 Tor Browser 上不存在",
        clientRects: "加了雜訊，每個瀏覽階段的值都不同",
        audio: "加了雜訊，每個瀏覽階段的值都不同",
        donottrack: "預設送出 Do Not Track，所有使用者一致",
        location: "停用，連問都不會問",
      },
    },
    zh: {
      fmt: FMT_ZH,
      torLabel: "Tor Browser 会显示",
      summary: "上面 {n} 项稳定的值揉成的短码。换一个浏览器打开这一页，比对这一个就知道有没有变。它本身就是一个识别码，所以只出现在画面上，没有存起来也没有导出。",
      unavailable: "这个浏览器没有提供",
      denied: "你拒绝了，或者系统挡住了",
      askTitle: "下面这一项要你按了才会问",
      askButton: "显示我的位置",
      askNote: "按下去浏览器会跳出授权窗口。允许之后这一页会拿到你的经纬度与误差范围，只显示在画面上，不会送出也不会存起来。刷新就没了。",
      note: "以上全部在你的浏览器里取得，没有送出任何一项，也没有写进任何存储。断网时这一页照样跑得出来，那也是「没有偷送东西」的证明。这一页刻意不提供导出，那份文件本身就是一份完整的指纹。",
      prefs: { dark: "深色模式", motion: "减少动态", contrast: "高对比", forced: "强制色彩" },
      names: {
        timezone: "时区", language: "语言偏好", screen: "屏幕与窗口", hardware: "硬件",
        webgl: "显卡", canvas: "Canvas 指纹", fonts: "装了哪些字体",
        preferences: "系统偏好设置", storage: "可用的存储空间", devices: "影音设备数量",
        clientHints: "Client Hints",
        clientRects: "元素位置的小数位",
        audio: "音频指纹",
        donottrack: "追踪偏好信号",
        location: "地理位置",
      },
      why: {
        timezone: "时区直接指出你大概在哪个经度，而且换 VPN 换不掉，它来自操作系统设置。",
        language: "语言清单的组合比想象中独特，尤其同时装了几种语言的人。",
        screen: "窗口尺寸每个人都不一样，而且你调整窗口大小它就跟着变，可以用来确认前后是同一个人。",
        hardware: "核心数与内存单看很粗略，跟其他项目凑在一起就变成有效的区分。",
        webgl: "显卡型号字符串非常独特，同型号的机器才会一样。",
        canvas: "同样一段绘图指令，不同的显卡与字体渲染出来的像素有细微差异，取哈希就成了识别码。",
        fonts: "装了哪些字体会透露操作系统、地区与你用过哪些软件。中文字体组合对辨识所在地特别有效。",
        preferences: "无障碍设置也是指纹。开了辅助功能的人反而更容易被认出来。",
        storage: "配额跟设备的可用空间有关，是一个会慢慢变动的粗略指标。",
        devices: "不需要授权就数得出你有几个相机与麦克风，数量组合本身就是指纹的一部分。",
        clientHints: "Chrome 用来取代 User-Agent 的机制，拿得到操作系统版本、机型与位数，比原本的 User-Agent 更精确。它被称为隐私友善的替代方案，而网站不必问你就读得到。",
        clientRects: "同一段 CSS 画出来的方块，在不同的字体堆叠与缩放下算出来的小数位不一样。连一个看不见的方块落在画面上哪个位置都能当识别码。",
        audio: "生成一段听不到的音频再取数值特征。不同的音频处理实作算出来的浮点数有细微差异，跟 canvas 是同一类手法，但更少人知道。",
        donottrack: "你送出的「请不要追踪我」信号。实务上几乎没有网站遵守，而送出这个信号的人相对少，反而让你更容易被认出来。",
        location: "最直接的一项，精确到米。这一项要授权，其他项目都不用。",
      },
      tor: {
        timezone: "UTC",
        language: "en-US（所以这个网站不看这个值来决定语言）",
        screen: "固定成几种常见尺寸，其余用留白补齐",
        hardware: "2 核心，不提供内存大小",
        webgl: "通用字符串，看不出实际型号（Brave 1.93 起也是）",
        canvas: "预设挡掉，需要时会问你（Brave 改用加噪声）",
        fonts: "一组固定的内建字体，所有人都一样",
        preferences: "浅色、不减少动态，所有人都一样",
        storage: "固定值",
        devices: "不提供",
        clientHints: "不提供，那个 API 在 Tor Browser 上不存在",
        clientRects: "加了噪声，每个浏览阶段的值都不同",
        audio: "加了噪声，每个浏览阶段的值都不同",
        donottrack: "预设送出 Do Not Track，所有使用者一致",
        location: "停用，连问都不会问",
      },
    },
    en: {
      fmt: FMT_EN,
      torLabel: "Tor Browser shows",
      summary: "A short code folded from the {n} stable values above. Open this page in another browser and compare just this one to see whether anything changed. The code is itself an identifier, so it appears on screen only, with nothing stored and nothing exported.",
      unavailable: "not available in this browser",
      denied: "you declined, or the system blocked it",
      askTitle: "This one only runs when you press the button",
      askButton: "Show my location",
      askNote: "Pressing this brings up the browser's permission prompt. If you allow it, this page receives your latitude, longitude and accuracy, shows them on screen, and neither sends nor stores them. Reload and they are gone.",
      note: "Everything above was read inside your browser. None of it was sent anywhere and none of it was written to storage. This page still works with the network off, which is itself the proof that nothing is being sent. There is deliberately no export button: such a file would be a complete fingerprint sitting on your device.",
      prefs: { dark: "dark mode", motion: "reduced motion", contrast: "high contrast", forced: "forced colours" },
      names: {
        timezone: "Time zone", language: "Language preferences", screen: "Screen and window",
        hardware: "Hardware", webgl: "Graphics card", canvas: "Canvas fingerprint",
        fonts: "Installed fonts", preferences: "System preferences",
        storage: "Available storage", devices: "Audio and video devices",
        clientHints: "Client Hints", clientRects: "Sub-pixel element geometry",
        audio: "Audio fingerprint", donottrack: "Tracking preference signals",
        location: "Location",
      },
      why: {
        timezone: "Your time zone points at roughly which longitude you are on, and a VPN does not change it because it comes from the operating system.",
        language: "The combination of languages is more distinctive than people expect, especially for anyone with several installed.",
        screen: "Window size differs from person to person, and it changes as you resize, which makes it useful for confirming you are the same visitor as before.",
        hardware: "Core count and memory are coarse on their own, but combined with everything else they narrow things down.",
        webgl: "The graphics card string is highly distinctive. Only identical hardware reports the same thing.",
        canvas: "The same drawing instructions produce subtly different pixels on different graphics cards and font stacks, and a hash of those pixels becomes an identifier.",
        fonts: "Which fonts you have installed reveals your operating system, your region and what software you have used. CJK font combinations are particularly telling about where you are.",
        preferences: "Accessibility settings are a fingerprint too. Turning assistive features on makes you easier to recognise, not harder.",
        storage: "The quota relates to free space on the device, a coarse signal that drifts slowly over time.",
        devices: "No permission is needed to count your cameras and microphones, and that combination is part of the fingerprint.",
        clientHints: "Client Hints",
        clientRects: "Sub-pixel element geometry",
        audio: "Audio fingerprint",
        donottrack: "Tracking preference signals",
        clientHints: "Chrome's replacement for the User-Agent string. It exposes the operating system version, device model and word size, which is more precise than the header it replaces. It is presented as the privacy-friendly option, and sites read it without asking.",
        clientRects: "The same CSS produces boxes whose sub-pixel dimensions differ across font stacks and scaling. Even where an invisible box lands on screen works as an identifier.",
        audio: "Render an inaudible tone and take numeric features of the result. Different audio implementations produce slightly different floating point values. Same family as canvas, far less well known.",
        donottrack: "The signal that asks sites not to track you. Almost nothing honours it in practice, and relatively few people send it, so it makes you easier to pick out rather than harder.",
        location: "The most direct one, accurate to metres. This is the only item here that asks permission.",
      },
      tor: {
        timezone: "UTC",
        language: "en-US, which is why this site does not use it to pick a language",
        screen: "rounded to a few common sizes, the rest padded with letterboxing",
        hardware: "2 cores, with no memory figure",
        webgl: "a generic string that reveals no model (Brave does the same since 1.93)",
        canvas: "blocked by default, with a prompt when a site needs it (Brave adds noise instead)",
        fonts: "one fixed set of bundled fonts, identical for everyone",
        preferences: "light mode and no reduced motion, identical for everyone",
        storage: "a fixed quota",
        devices: "not exposed",
        clientHints: "not available, the API does not exist in Tor Browser",
        clientRects: "noised, differing every browsing session",
        audio: "noised, differing every browsing session",
        donottrack: "Do Not Track is sent by default, identically for every user",
        location: "disabled, without even asking",
      },
    },
  };

  const t = STRINGS[document.documentElement.lang] || STRINGS["zh-TW"];
  const fill = (key, vars) =>
    t[key].replace(/\{(\w+)\}/g, (_, name) => String(vars[name]));

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function renderItem(probe, value) {
    const item = el("div", "lk-item");
    item.appendChild(el("p", "lk-name", t.names[probe.key]));
    if (value === null || value === undefined) {
      item.appendChild(el("p", "lk-value lk-none", t.unavailable));
    } else if (value instanceof Error) {
      item.appendChild(el("p", "lk-value lk-none", t.denied));
    } else {
      item.appendChild(el("p", "lk-value", value));
    }
    // 對照值排在自己的值正下方，換瀏覽器時一眼看得出哪一項會變。原本只寫「Tor
    // Browser 會統一掉」，讀者得自己去記十幾個值才比對得起來。
    const tor = el("p", "lk-tor");
    tor.appendChild(el("span", "lk-tor-label", t.torLabel + "："));
    tor.appendChild(document.createTextNode(t.tor[probe.key]));
    item.appendChild(tor);
    item.appendChild(el("p", "lk-why", t.why[probe.key]));
    return item;
  }

  // 摘要碼要等所有項目都讀完才算得出來，先放一個占位，收集齊了再填。
  const summary = el("div", "lk-summary");
  root.appendChild(summary);

  const list = el("div");
  root.appendChild(list);

  const collected = [];
  const pending = [];

  for (const probe of PROBES) {
    if (probe.needsPermission) continue;
    let value;
    try {
      value = probe.read(t);
    } catch (err) {
      value = null;
    }
    const record = (resolved) => {
      // 摘要用 digest()，沒給就用畫面上那個值。screen 那一項的顯示值含視窗尺寸，
      // 讀者拉一下視窗就變，所以它另外給了一個只含螢幕的版本。
      let digestValue = resolved;
      if (probe.digest) {
        try {
          digestValue = probe.digest();
        } catch (err) {
          digestValue = null;
        }
      }
      collected.push({ key: probe.key, stable: probe.stable === true, value: digestValue });
    };
    if (value && typeof value.then === "function") {
      const holder = el("div");
      list.appendChild(holder);
      pending.push(
        value
          .then((resolved) => {
            holder.replaceWith(renderItem(probe, resolved));
            record(resolved);
          })
          .catch(() => {
            holder.replaceWith(renderItem(probe, null));
            record(null);
          })
      );
    } else {
      list.appendChild(renderItem(probe, value));
      record(value);
    }
  }

  Promise.all(pending).then(() => {
    const code = digestOf(collected);
    const counted = collected.filter((entry) => entry.stable).length;
    summary.appendChild(el("p", "lk-code", code));
    summary.appendChild(el("p", "lk-code-why", fill("summary", { n: counted })));
  });

  // 要授權的那些單獨放，按了才跑，而且按之前先說會拿到什麼
  const gated = PROBES.filter((probe) => probe.needsPermission);
  if (gated.length) {
    const ask = el("div", "lk-ask");
    ask.appendChild(el("p", "lk-name", t.askTitle));
    ask.appendChild(el("p", "lk-why", t.askNote));
    for (const probe of gated) {
      const button = el("button", null, t.askButton);
      button.type = "button";
      button.addEventListener("click", () => {
        button.disabled = true;
        Promise.resolve()
          .then(() => probe.read(t))
          .then((value) => ask.replaceWith(renderItem(probe, value)))
          .catch((err) => ask.replaceWith(renderItem(probe, err)));
      });
      ask.appendChild(button);
    }
    root.appendChild(ask);
  }

  root.appendChild(el("p", "lk-note", t.note));
})();
