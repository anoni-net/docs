/*
 * 離線內容管理頁（offline.md）的介面。
 *
 * 資料有兩個來源：offline-index.json 說這個語系有哪些頁面、多大，service worker 說
 * 哪些已經在裝置上。管理頁把兩邊疊起來，讀者勾選之後由 service worker 實際存取。
 *
 * 為什麼需要這一頁：sw.js 的預設下載清單刻意排除了指導單一受威脅身分的頁面，
 * 因為那些頁面躺在 Cache Storage 裡本身就是指向性證據。排除是對的，但排除之後
 * 想離線帶著走的人就沒有辦法了。這一頁讓那個選擇回到讀者手上，預設仍然不下載。
 *
 * 三個語系共用這一份，docs/en/js/ 與 docs/zh-CN/js/ 底下是指向這裡的 symlink，
 * 跟 overrides_en/base.html 同一個做法。介面文字依 document.documentElement.lang
 * 挑，zh-CN 版那個值是 "zh"（mkdocs_cn.yml 的 theme.language）。
 */
(function () {
  const root = document.getElementById("offline-library");
  if (!root) return;

  // 樣式跟著這支走。三個語系的 stylesheets/extra.css 是各自獨立的檔案，寫在那裡
  // 要維護三份，而這些規則只有這一頁用得到。
  //
  // 章節列表刻意不用 <details> 也不用 .md-button。mkdocs-material 把每個原生
  // <details> 當成 admonition 渲染：藍色外框、note 圖示、展開箭頭、font-size .64rem，
  // 而那個圖示是絕對定位在 left .6rem 的 ::before，蓋在標題文字上。十八個章節排下來
  // 就是十八個警告框。這裡改用 div 加 button 自己畫，跟 theme 的元件樣式脫鉤。
  const CSS = `
    #offline-library { margin: 1em 0; }
    #offline-library button {
      font: inherit; color: inherit; cursor: pointer; background: none;
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .3rem .7rem;
    }
    #offline-library button:hover:not(:disabled) {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #offline-library button:disabled { opacity: .5; cursor: default; }
    #offline-library .ol-status { line-height: 1.8; margin: .4rem 0; }
    #offline-library .ol-message {
      border-left: .15rem solid var(--md-accent-fg-color);
      margin: .8rem 0; padding: .1rem 0 .1rem .6rem;
    }
    #offline-library .ol-auto { display: block; cursor: pointer; margin: 1em 0 .2rem; }
    #offline-library .ol-hint {
      margin: 0 0 1em 1.4rem; opacity: .7; font-size: .7rem; line-height: 1.6;
    }
    #offline-library .ol-actions {
      display: flex; flex-wrap: wrap; gap: .4rem; margin: 0 0 1.2rem;
    }
    #offline-library .ol-group {
      margin: 1.4rem 0 .1rem; font-weight: 700; font-size: .72rem;
      opacity: .7; letter-spacing: .04em;
    }
    #offline-library .ol-group:first-of-type { margin-top: .6rem; }
    /* 頂層章節底下只有一組時不掛標題，改用留白分隔，否則它會看起來像上一組的一部分 */
    #offline-library .ol-section--gap { margin-top: 1.4rem; }
    #offline-library .ol-section {
      border-bottom: .05rem solid var(--md-default-fg-color--lightest);
    }
    #offline-library .ol-toggle {
      display: flex; align-items: baseline; flex-wrap: nowrap; gap: .5rem;
      width: 100%; border: 0; border-radius: 0; padding: .45rem .2rem; text-align: left;
    }
    #offline-library .ol-toggle:hover:not(:disabled) {
      background: var(--md-default-fg-color--lightest); color: inherit;
    }
    #offline-library .ol-mark { flex: 0 0 .8rem; opacity: .55; }
    #offline-library .ol-name {
      flex: 1 1 auto; min-width: 0;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    #offline-library .ol-meta, #offline-library .ol-count,
    #offline-library .ol-size, #offline-library .ol-badge {
      flex: none; opacity: .6; font-size: .7rem;
    }
    #offline-library .ol-count { font-variant-numeric: tabular-nums; opacity: .85; }
    #offline-library .ol-body { padding: 0 0 .8rem 1.3rem; }
    #offline-library .ol-pages { list-style: none; margin: .5rem 0 0; padding: 0; }
    #offline-library .ol-pages li {
      display: flex; align-items: baseline; gap: .4rem; margin: 0 0 .25rem;
    }
    /* 勾選框的觸控範圍。撐開之後用負 margin 收回，免得每一列都變高 */
    #offline-library .ol-pick {
      flex: none; display: inline-flex; align-items: center;
      padding: .35rem .25rem; margin: -.35rem 0; cursor: pointer;
    }
    #offline-library .ol-pages input { flex: none; margin: 0; }
    #offline-library .ol-title {
      flex: 1 1 auto; min-width: 0;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    /* 還沒存下來的。連結留著，線上時點得開，視覺上退一階 */
    #offline-library .ol-title--absent { color: inherit; opacity: .55; }
    #offline-library .ol-filter { display: block; cursor: pointer; margin: 1.4rem 0 .2rem; }
    #offline-library .ol-legend { margin-bottom: .4rem; }
    #offline-library .ol-danger {
      border-color: var(--md-typeset-del-color, #f44336);
      color: #c62828;
    }
    #offline-library .ol-danger:hover:not(:disabled) {
      background: #c62828; border-color: #c62828; color: #fff;
    }
    /* 進度條。原本把進度寫在按鈕文字上，一邊跑一邊改字會讓按鈕寬度跟著跳。 */
    #offline-library .ol-progress { margin: .2rem 0 1rem; }
    #offline-library .ol-progress__track {
      height: .2rem; border-radius: .1rem; overflow: hidden;
      background: var(--md-default-fg-color--lightest);
    }
    #offline-library .ol-progress__fill {
      height: 100%; width: 0;
      background: var(--md-accent-fg-color); transition: width .2s ease;
    }
    #offline-library .ol-progress__track--idle .ol-progress__fill {
      width: 30%; animation: ol-sweep 1.1s ease-in-out infinite;
    }
    #offline-library .ol-progress__text {
      margin: .3rem 0 0; font-size: .7rem; opacity: .8;
    }
    @keyframes ol-sweep {
      0% { margin-left: -30%; }
      100% { margin-left: 100%; }
    }
    /* 做完的訊息閃一下。原本靜靜出現在狀態列下面，捲過去就看不到，
       按了半天不知道有沒有成功。 */
    @keyframes ol-flash {
      from { background: var(--md-accent-fg-color); filter: opacity(0.18); }
      to { background: transparent; }
    }
    #offline-library .ol-message { animation: ol-flash 1.4s ease-out; }
    @media (prefers-reduced-motion: reduce) {
      #offline-library .ol-message { animation: none; }
      #offline-library .ol-progress__fill { transition: none; }
      #offline-library .ol-progress__track--idle .ol-progress__fill {
        width: 100%; animation: none;
      }
    }
    #offline-library .ol-primary {
      border-color: var(--md-primary-fg-color);
      background: var(--md-primary-fg-color);
      color: var(--md-primary-bg-color);
    }
    @media screen and (max-width: 44.9375em) {
      #offline-library .ol-badge { display: none; }
      #offline-library .ol-body { padding-left: .6rem; }
    }
    #offline-library .ol-apply {
      position: sticky; bottom: 0; z-index: 1;
      background: var(--md-default-bg-color);
      border-top: .05rem solid var(--md-default-fg-color--lighter);
      margin: 0; padding: .7rem 0;
      /* 清除完成那則訊息有好幾行，不讓它吃掉整個畫面 */
      max-height: 45vh; overflow-y: auto;
    }
    #offline-library .ol-apply__row {
      display: flex; align-items: center; flex-wrap: wrap; gap: .6rem;
    }
    /* 進度條與訊息本來在文件流裡各自留了外距，進到這條就不需要了 */
    #offline-library .ol-apply .ol-progress,
    #offline-library .ol-apply .ol-message { margin: 0; }
    #offline-library .ol-apply .ol-apply__row + .ol-message { margin-top: .6rem; }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const STRINGS = {
    "zh-TW": {
      loading: "讀取中",
      preparing: "離線功能還在準備，裝置上的狀態稍後才會顯示。",
      noSupport:
        "這個瀏覽器沒有提供離線儲存，或者停用了 Service Worker（Tor Browser 屬於後者，onion 版本也不啟用）。這一頁其他段落的說明仍然適用。",
      noIndex: "讀不到頁面清單，可能是目前離線且這份清單還沒被存下來。恢復連線後重新整理即可。",
      savedCount: "你自己選存的 {n} 頁",
      autoCount: "網站自動存的 {n} 頁",
      usage: "本站在這台裝置上佔用 {used}",
      usageFree: "本站在這台裝置上佔用 {used}，可用空間還有 {free}",
      autoLabel: "自動存下目前語言的核心章節",
      autoHint: "關掉之後就不再自動存章節。這一頁本身與它需要的樣式仍會留著（約 0.5 MB），沒有網路時你才進得來。你自己勾的頁面不受影響。",
      imagesLabel: "連同核心章節的內文圖一起存",
      imagesHint: "網站自動存的那批章節預設只存文字，離線打開會缺圖。打開這個選項會連內文圖一起下載，大約多 7 MB，下次連上網時開始補。你自己勾的頁面本來就會連圖一起存。",
      refresh: "更新已存的內容",
      refreshing: "更新中",
      clear: "清除所有離線內容",
      clearConfirm: "確定清除",
      cancel: "取消",
      refreshEmpty: "你還沒有自己選存頁面。網站自動存的那批會在網站有新版本時一起更新。",
      failed: "沒有完成。可能是連線中斷，稍後再試一次。",
      clearing: "清除中",
      cleared: "已清除，自動存下章節也一併關掉了。下次連上網時會補回這一頁本身與它需要的樣式（約 0.5 MB），讓你在沒有網路時仍進得來。瀏覽記錄、DNS 快取與你下載過的檔案不在清除範圍內，那些要在瀏覽器或系統裡處理。",
      apply: "套用變更",
      applying: "處理中",
      pending: "待新增 {add} 頁，待移除 {remove} 頁",
      done: "完成。存下 {ok} 頁。",
      doneFailed: "完成。存下 {ok} 頁，{failed} 頁失敗。",
      removed: "已移除 {n} 頁。",
      selectAll: "整章勾選",
      pages: "{n} 頁",
      overview: "總覽",
      badgeAuto: "網站已存",
      onlyStored: "只列已經存下來的",
      legend: "淡色的標題還沒存到這台裝置，沒有網路時打不開。勾選框是灰的表示那一頁由上面的開關統一管，不用個別勾。",
      onlyStoredEmpty: "這個語言目前沒有存下任何頁面。",
      notStored: "還沒存到這台裝置，沒有網路時打不開",
      progress: "{done} / {total}",
    },
    zh: {
      loading: "读取中",
      preparing: "离线功能还在准备，设备上的状态稍后才会显示。",
      noSupport:
        "这个浏览器没有提供离线存储，或者停用了 Service Worker（Tor Browser 属于后者，onion 版本也不启用）。这一页其他段落的说明仍然适用。",
      noIndex: "读不到页面清单，可能是当前离线且这份清单还没有被存下来。恢复连接后刷新即可。",
      savedCount: "你自己选存的 {n} 页",
      autoCount: "网站自动存的 {n} 页",
      usage: "本站在这台设备上占用 {used}",
      usageFree: "本站在这台设备上占用 {used}，可用空间还有 {free}",
      autoLabel: "自动存下当前语言的核心章节",
      autoHint: "关掉之后就不再自动存章节。这一页本身与它需要的样式仍会留着（约 0.5 MB），没有网络时你才进得来。你自己勾的页面不受影响。",
      imagesLabel: "连同核心章节的内文图一起存",
      imagesHint: "网站自动存的那批章节预设只存文字，离线打开会缺图。打开这个选项会连内文图一起下载，大约多 7 MB，下次连上网时开始补。你自己勾的页面本来就会连图一起存。",
      refresh: "更新已存的内容",
      refreshing: "更新中",
      clear: "清除所有离线内容",
      clearConfirm: "确定清除",
      cancel: "取消",
      refreshEmpty: "你还没有自己选存页面。网站自动存的那批会在网站有新版本时一起更新。",
      failed: "没有完成。可能是连接中断，稍后再试一次。",
      clearing: "清除中",
      cleared: "已清除，自动存下章节也一并关掉了。下次连上网时会补回这一页本身与它需要的样式（约 0.5 MB），让你在没有网络时仍进得来。浏览记录、DNS 缓存与你下载过的文件不在清除范围内，那些要在浏览器或系统里处理。",
      apply: "应用变更",
      applying: "处理中",
      pending: "待新增 {add} 页，待移除 {remove} 页",
      done: "完成。存下 {ok} 页。",
      doneFailed: "完成。存下 {ok} 页，{failed} 页失败。",
      removed: "已移除 {n} 页。",
      selectAll: "整章勾选",
      pages: "{n} 页",
      overview: "总览",
      badgeAuto: "网站已存",
      onlyStored: "只列已经存下来的",
      legend: "淡色的标题还没存到这台设备，没有网络时打不开。勾选框是灰的表示那一页由上面的开关统一管，不用个别勾。",
      onlyStoredEmpty: "这个语言目前没有存下任何页面。",
      notStored: "还没存到这台设备，没有网络时打不开",
      progress: "{done} / {total}",
    },
    en: {
      loading: "Loading",
      preparing: "Offline support is still starting up. What is on this device will show shortly.",
      noSupport:
        "This browser has no offline storage available, or Service Workers are disabled (Tor Browser is the latter case, and the onion version does not enable them either). The rest of this page still applies.",
      noIndex: "The page list could not be loaded. You may be offline and it has not been stored yet. Reload once you are back online.",
      savedCount: "{n} pages you chose to keep",
      autoCount: "{n} pages stored automatically",
      usage: "This site uses {used} on this device",
      usageFree: "This site uses {used} on this device, with {free} still available",
      autoLabel: "Automatically store the core chapters for the current language",
      autoHint: "Turning this off stops the site from storing chapters. This page itself and the styles it needs stay (about 0.5 MB), so you can still get here without a network. Pages you ticked are unaffected.",
      imagesLabel: "Also store the images in the core chapters",
      imagesHint: "The chapters the site stores automatically are text only, so they lose their images offline. Turning this on downloads those images too, about 7 MB more, starting the next time you are online. Pages you tick already come with their images.",
      refresh: "Update what is stored",
      refreshing: "Updating",
      clear: "Clear all offline content",
      clearConfirm: "Yes, clear",
      cancel: "Cancel",
      refreshEmpty: "You have not picked any pages yet. What the site stores automatically updates when a new version of the site arrives.",
      failed: "That did not complete. The connection may have dropped. Try again in a moment.",
      clearing: "Clearing",
      cleared: "Cleared, and automatic storage of chapters is off. Next time you are online, this page itself and the styles it needs come back (about 0.5 MB) so you can still reach it without a network. Browsing history, DNS cache and files you downloaded are not covered here. Handle those in your browser or system settings.",
      apply: "Apply changes",
      applying: "Working",
      pending: "{add} to add, {remove} to remove",
      done: "Done. {ok} pages stored.",
      doneFailed: "Done. {ok} pages stored, {failed} failed.",
      removed: "{n} pages removed.",
      selectAll: "Select whole section",
      pages: "{n} pages",
      overview: "Overview",
      badgeAuto: "stored by the site",
      onlyStored: "Only show what is stored",
      legend: "Faded titles are not on this device yet and will not open without a network. A greyed-out checkbox means the toggle above covers that page, so you do not need to tick it.",
      onlyStoredEmpty: "Nothing is stored for this language yet.",
      notStored: "Not on this device yet, so it will not open without a network",
      progress: "{done} / {total}",
    },
  };

  const t = STRINGS[document.documentElement.lang] || STRINGS["zh-TW"];
  const fill = (key, vars) =>
    Object.keys(vars || {}).reduce(
      (text, name) => text.split("{" + name + "}").join(vars[name]),
      t[key]
    );

  const size = (bytes) => {
    if (bytes >= 1024 * 1024 * 1024) return (bytes / 1024 / 1024 / 1024).toFixed(1) + " GB";
    if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + " MB";
    return Math.round(bytes / 1024) + " KB";
  };

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function note(message) {
    root.textContent = "";
    root.appendChild(el("p", null, message));
  }

  if (!("serviceWorker" in navigator)) {
    note(t.noSupport);
    return;
  }

  // 等 registration 出現。
  //
  // 不能只等一小段固定時間就下判斷。Chrome 會把 register() 排到頁面 load 之後才真的
  // 跑，而這一頁要載完 material 的 bundle 與字型，正式站實測 getRegistration() 到
  // 十二秒才回得出東西。等太短就會對著一個好好的瀏覽器說「這裡沒有離線儲存」。
  //
  // 反過來，真的不註冊的環境（onion 版、IPFS gateway、停用 Service Worker 的瀏覽器）
  // 由 base.html 把 window.__anoniServiceWorker 設成 false，看到就直接放棄，不用空等。
  // 那支在 body 尾端，比這支晚執行，所以第一輪拿到 undefined 是正常的，繼續等就是。
  function waitForRegistration() {
    const deadline = Date.now() + 30000;
    const attempt = () => {
      if (window.__anoniServiceWorker === false) return Promise.resolve(null);
      return navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) return registration;
        if (Date.now() > deadline) return null;
        return new Promise((resolve) => setTimeout(resolve, 500)).then(attempt);
      });
    };
    return attempt();
  }

  // service worker 可以收指令了沒。
  //
  // 不能直接用 navigator.serviceWorker.ready：首次造訪時 install 要把整個語系的核心
  // 章節抓完（約十 MB）才會 activate，ready 也才 resolve，行動網路上那是好幾分鐘。
  // 這一頁的清單不需要等那個，所以拆成兩段，索引先畫、狀態晚點補。
  let readyPromise = null;
  function whenReady() {
    if (!readyPromise) {
      readyPromise = waitForRegistration().then((registration) => {
        if (!registration) throw new Error("no-service-worker-registration");
        return navigator.serviceWorker.ready;
      });
    }
    return readyPromise;
  }

  // 一次請求一個 MessageChannel。下載類的指令會在同一個 port 上多次回報進度，
  // 最後一則不是 progress，那時才算結束。
  function ask(message, onProgress) {
    return whenReady().then(
      (registration) =>
        new Promise((resolve, reject) => {
          const worker = registration.active;
          if (!worker) {
            reject(new Error("no-active-service-worker"));
            return;
          }
          const channel = new MessageChannel();
          channel.port1.onmessage = (event) => {
            const data = event.data || {};
            if (data.type === "progress") {
              if (onProgress) onProgress(data);
              return;
            }
            resolve(data);
          };
          worker.postMessage(message, [channel.port2]);
        })
    );
  }

  // 這一頁在 /docs/offline/、/docs/en/offline/ 或 /docs/zh-cn/offline/，
  // 索引檔在各自語系的根，所以往上一層就是。
  const indexUrl = new URL("../offline-index.json", location.href).href;

  const state = {
    index: null,
    saved: new Set(),
    precached: new Set(),
    autoPrecache: true,
    precacheImages: false,
    estimate: null,
    // 讀者這一輪勾選的變動，套用之前不動快取
    add: new Set(),
    remove: new Set(),
    // 展開中的章節。勾一個項目就整頁重畫，沒記著的話會全部收合回去
    open: new Set(),
    // 只列已經存下來的頁面。斷網進來時預設打開，見下方 applyOfflineDefault。
    onlyStored: false,
    // 「清除所有離線內容」按過第一次了沒。這個要跨重繪保留，不然按下去整頁一畫
    // 就退回未確認的樣子，讀者會以為沒作用。
    armedClear: false,
    // 正在跑的工作，有的話動作列停用並顯示進度條
    task: null,
    busy: false,
    // service worker 那半回來了沒。沒回來之前清單照樣可以看、可以勾，
    // 只是不知道裝置上已經有哪些。
    swReady: false,
    swMissing: false,
  };

  function refreshStatus() {
    return ask({ type: "OFFLINE_STATUS", url: location.href }).then((data) => {
      if (data.type !== "status") throw new Error("bad-status");
      state.saved = new Set(data.saved || []);
      state.precached = new Set(data.precached || []);
      state.autoPrecache = data.autoPrecache !== false;
      state.precacheImages = data.precacheImages === true;
      state.estimate = data.estimate || null;
      state.add.clear();
      state.remove.clear();
    });
  }

  // 網站自動存的那批也算在裝置上，勾選框對它們沒有意義，顯示成已存並停用
  const isStored = (path) => state.saved.has(path) || state.precached.has(path);
  const willBeStored = (path) =>
    state.add.has(path) || (isStored(path) && !state.remove.has(path));

  function setWanted(path, wanted) {
    state.add.delete(path);
    state.remove.delete(path);
    if (wanted && !isStored(path)) state.add.add(path);
    if (!wanted && state.saved.has(path)) state.remove.add(path);
  }

  function button(label, className, onClick) {
    const node = el("button", className, label);
    node.type = "button";
    node.addEventListener("click", onClick);
    return node;
  }

  function renderStatus() {
    const status = el("p", "ol-status");
    if (state.swMissing) {
      status.textContent = t.noSupport;
      return status;
    }
    if (!state.swReady) {
      status.textContent = t.preparing;
      return status;
    }
    status.appendChild(
      document.createTextNode(fill("savedCount", { n: state.saved.size }))
    );
    status.appendChild(document.createTextNode("、"));
    status.appendChild(
      document.createTextNode(fill("autoCount", { n: state.precached.size }))
    );
    if (state.estimate && state.estimate.usage) {
      const quota = state.estimate.quota;
      const free = quota && quota > state.estimate.usage ? quota - state.estimate.usage : null;
      status.appendChild(document.createElement("br"));
      status.appendChild(
        document.createTextNode(
          free === null
            ? fill("usage", { used: size(state.estimate.usage) })
            : fill("usageFree", { used: size(state.estimate.usage), free: size(free) })
        )
      );
    }
    return status;
  }

  // 索引裡的網址相對於該語系的建置根目錄，管理頁自己在那個根目錄的 offline/ 底下，
  // 所以往上一層。跟 indexUrl 同一個算法。
  const pageHref = (url) => new URL("../" + url, location.href).href;

  // 網址對到索引裡那一筆。勾一次就掃一遍整份索引太浪費，建一次表用到底，
  // 索引重讀時由 setIndex 清掉。
  let pageIndex = null;
  function pageFor(url) {
    if (!pageIndex) {
      pageIndex = new Map();
      for (const section of (state.index && state.index.sections) || []) {
        for (const page of section.pages) pageIndex.set(page.url, page);
      }
    }
    return pageIndex.get(url);
  }

  // 這批頁面需要哪些資產，去重。同一張圖被好幾頁引用時只會出現一次。
  function assetsOf(paths) {
    const out = new Set();
    for (const path of paths) {
      const page = pageFor(path);
      for (const asset of (page && page.assets) || []) out.add(asset);
    }
    return out;
  }

  // 一批頁面連同資產實際要下載多少。資產去重，頁面照 HTML 大小加總。
  function weightOf(paths) {
    let total = 0;
    for (const path of paths) {
      const page = pageFor(path);
      if (page) total += page.bytes || 0;
    }
    for (const asset of assetsOf(paths)) {
      // 索引沒有逐一資產的大小，只有每頁的合計，這裡用該頁的平均值估。
      // 差距只影響顯示，實際下載的是同一批檔案。
      total += assetWeight(asset);
    }
    return total;
  }

  // 資產多大，讀索引給的那張全域表。原本從每頁的合計除以資產數去估，同一張圖被
  // 好幾頁引用時會取到最大的那個估計值，實測差到兩倍以上，畫面上的數字對不起來。
  function assetWeight(asset) {
    const table = (state.index && state.index.assets) || {};
    return table[asset] || 0;
  }

  function renderSection(section, label, pages) {
    const stored = pages.filter((page) => isStored(page.url)).length;
    // 章節大小含資產，資產去重。讀者看到的要是「勾這一章實際會下載多少」。
    const bytes = weightOf(pages.map((page) => page.url));
    const wrapper = el("div", "ol-section");
    const open = state.open.has(section.key);

    const toggle = button("", "ol-toggle", () => {
      if (open) state.open.delete(section.key);
      else state.open.add(section.key);
      render();
    });
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    // 展開指示自己畫。material 的箭頭是 summary::after，這裡沒有 summary 可用，
    // 而 ::before/::after 在 md-typeset 底下容易被 theme 的規則波及。
    toggle.appendChild(el("span", "ol-mark", open ? "▾" : "▸"));
    toggle.appendChild(el("span", "ol-name", label));
    toggle.appendChild(
      el("span", "ol-meta", fill("pages", { n: pages.length }) + "・" + size(bytes))
    );
    toggle.appendChild(el("span", "ol-count", stored + " / " + pages.length));
    wrapper.appendChild(toggle);

    if (!open) return wrapper;

    const body = el("div", "ol-body");
    // 整章都是網站自動存的那批時不畫這顆。那些頁的勾選框本來就停用，按下去什麼
    // 都不會變，只是多一顆按不動的東西。斷網進來時篩選預設打開，看到的多半正好
    // 是這種章節。
    const pickable = pages.some((page) => !state.precached.has(page.url));
    if (!state.swMissing && pickable) {
      body.appendChild(
        button(t.selectAll, null, () => {
          const wanted = pages.some((page) => !willBeStored(page.url));
          for (const page of pages) setWanted(page.url, wanted);
          render();
        })
      );
    }

    const list = el("ul", "ol-pages");
    for (const page of pages) {
      const item = document.createElement("li");

      // 勾選框自己一塊。原本整列是一個 label，點文字就切換勾選，那時候標題還只是
      // 一段文字。標題改成連結之後兩個動作會打架，所以把可點的範圍分開：這一塊
      // 管勾選，標題管開頁。外圍的 padding 是給手指的，勾選框本身在手機上太小。
      const pick = el("label", "ol-pick");
      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = willBeStored(page.url);
      // 網站自動存的那批由上面的開關統一管，個別勾選沒有意義
      box.disabled = state.swMissing || state.precached.has(page.url);
      box.addEventListener("change", () => {
        setWanted(page.url, box.checked);
        render();
      });
      pick.appendChild(box);
      item.appendChild(pick);

      // 標題是連結。這一頁是斷網時的落腳處，讀者到這裡最想做的就是找一篇現在讀得到
      // 的，而原本整份清單一頁都點不開，只能回首頁自己碰運氣。已存的照一般連結畫，
      // 沒存的淡一階並在 title 上註明，離線時點下去只會被帶回這一頁。
      const inCache = isStored(page.url);
      const title = el("a", inCache ? "ol-title" : "ol-title ol-title--absent", page.title);
      title.href = pageHref(page.url);
      if (!inCache) title.title = t.notStored;
      item.appendChild(title);

      item.appendChild(el("span", "ol-size", size(page.bytes + (page.assetBytes || 0))));
      if (state.precached.has(page.url)) {
        item.appendChild(el("span", "ol-badge", t.badgeAuto));
      }
      list.appendChild(item);
    }
    body.appendChild(list);
    wrapper.appendChild(body);
    return wrapper;
  }

  // 底部那條。套用按鈕、進度條與完成訊息都放這裡，因為它 sticky 在畫面下緣，
  // 一定在視野內。原本進度與訊息畫在頁面頂端，而讀者按下套用時人在清單中段甚至
  // 更下面，按完畫面上什麼都沒發生，只能猜它到底有沒有在跑。
  function renderDock(message) {
    const dock = el("div", "ol-apply");

    if (state.task) {
      dock.appendChild(renderProgress());
    } else if (state.add.size || state.remove.size) {
      dock.appendChild(renderApply());
    }
    if (message) dock.appendChild(el("p", "ol-message", message));
    return dock;
  }

  function renderApply() {
    const bar = el("div", "ol-apply__row");
    const applyButton = button(t.apply, "ol-primary", () => {
        const toAdd = Array.from(state.add);
        const toRemove = Array.from(state.remove);
        // 移掉一頁不代表它的圖可以丟。留著的頁面還用得到的就不動，
        // 不然讀者移掉一篇文章，另一篇引用同一張圖的就變成破圖。
        const staying = new Set(state.saved);
        for (const path of toRemove) staying.delete(path);
        for (const path of toAdd) staying.add(path);
        const keep = assetsOf(Array.from(staying));
        const dropAssets = Array.from(assetsOf(toRemove)).filter((a) => !keep.has(a));
        const addAssets = Array.from(assetsOf(toAdd));
        runTask(t.applying, toAdd.length + addAssets.length, (report) =>
          Promise.resolve()
            .then(() =>
              toRemove.length
                ? ask({
                    type: "OFFLINE_REMOVE",
                    url: location.href,
                    paths: toRemove,
                    assets: dropAssets,
                  })
                : { removed: 0 }
            )
            .then((removeResult) =>
              (toAdd.length
                ? ask(
                    {
                      type: "OFFLINE_ADD",
                      url: location.href,
                      paths: toAdd,
                      assets: addAssets,
                    },
                    report
                  )
                : Promise.resolve({ ok: 0, failed: 0 })
              ).then((addResult) => ({
                message:
                  (addResult.failed
                    ? fill("doneFailed", { ok: addResult.ok, failed: addResult.failed })
                    : fill("done", { ok: addResult.ok })) +
                  (removeResult.removed
                    ? " " + fill("removed", { n: removeResult.removed })
                    : ""),
              }))
            )
      );
    });
    applyButton.disabled = state.busy;
    bar.appendChild(applyButton);
    const pending = fill("pending", { add: state.add.size, remove: state.remove.size });
    const weight = weightOf(Array.from(state.add));
    bar.appendChild(
      el("span", "ol-meta", weight ? pending + "・" + size(weight) : pending)
    );
    return bar;
  }

  function render(message) {
    root.textContent = "";
    root.appendChild(renderStatus());

    if (state.swMissing) return renderSections();

    const autoLabel = el("label", "ol-auto");
    const autoBox = document.createElement("input");
    autoBox.type = "checkbox";
    autoBox.checked = state.autoPrecache;
    autoBox.addEventListener("change", () => {
      ask({ type: "OFFLINE_AUTO", enabled: autoBox.checked })
        .then(refreshStatus)
        .then(() => render());
    });
    autoLabel.appendChild(autoBox);
    autoLabel.appendChild(document.createTextNode(" " + t.autoLabel));
    root.appendChild(autoLabel);
    root.appendChild(el("p", "ol-hint", t.autoHint));

    // 圖片是另一個開關。預設只存文字，那批圖有七 MB，會讓自動下載的量多六成，
    // 而多數讀者在行動網路上。想要完整離線閱讀的人自己打開。
    const imagesLabel = el("label", "ol-auto");
    const imagesBox = document.createElement("input");
    imagesBox.type = "checkbox";
    imagesBox.checked = state.precacheImages;
    imagesBox.disabled = !state.autoPrecache;
    imagesBox.addEventListener("change", () => {
      ask({ type: "OFFLINE_IMAGES", url: location.href, enabled: imagesBox.checked })
        .then(refreshStatus)
        .then(() => render());
    });
    imagesLabel.appendChild(imagesBox);
    imagesLabel.appendChild(document.createTextNode(" " + t.imagesLabel));
    root.appendChild(imagesLabel);
    root.appendChild(el("p", "ol-hint", t.imagesHint));

    root.appendChild(renderActions());

    if (state.index && state.swReady) {
      root.appendChild(renderFilter());
      root.appendChild(el("p", "ol-hint ol-legend", t.legend));
    }
    renderSections();
    if (state.task || message || state.add.size || state.remove.size) {
      root.appendChild(renderDock(message));
    }
  }

  function renderActions() {
    const wrap = el("div");
    const row = el("p", "ol-actions");

    // 更新的對象是讀者自己勾存的那批。網站自動存的那批跟著網站版本走，讀者
    // 按不出新的內容來，所以沒有自選內容時停用並說明，而不是按了沒有反應。
    const refresh = button(t.refresh, null, () => {
      const paths = Array.from(state.saved);
      const assets = Array.from(assetsOf(paths));
      return runTask(t.refreshing, paths.length + assets.length, (report) =>
        ask(
          {
            type: "OFFLINE_ADD",
            url: location.href,
            paths: paths,
            assets: assets,
            refresh: true,
          },
          report
        )
      );
    });
    refresh.disabled = state.busy || state.saved.size === 0;
    row.appendChild(refresh);

    if (!state.armedClear) {
      const clear = button(t.clear, null, () => {
        state.armedClear = true;
        render();
      });
      clear.disabled = state.busy;
      row.appendChild(clear);
    } else {
      // 兩段式確認。原本是同一顆按鈕換文字，讀者不見得注意到字變了，
      // 這裡改成兩顆並排，要按的那顆帶危險色。
      const confirm = button(t.clearConfirm, "ol-danger", () =>
        runTask(t.clearing, 0, () =>
          ask({ type: "OFFLINE_CLEAR" }).then(() => ({ message: t.cleared }))
        )
      );
      confirm.disabled = state.busy;
      row.appendChild(confirm);
      const cancel = button(t.cancel, null, () => {
        state.armedClear = false;
        render();
      });
      cancel.disabled = state.busy;
      row.appendChild(cancel);
    }

    wrap.appendChild(row);
    if (state.saved.size === 0) wrap.appendChild(el("p", "ol-hint", t.refreshEmpty));
    return wrap;
  }

  function renderFilter() {
    const label = el("label", "ol-filter");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = state.onlyStored;
    box.addEventListener("change", () => {
      setOnlyStored(box.checked);
      render();
    });
    label.appendChild(box);
    label.appendChild(document.createTextNode(" " + t.onlyStored));
    return label;
  }

  function renderProgress() {
    const wrap = el("div", "ol-progress");
    const track = el("div", "ol-progress__track");
    const fillBar = el("div", "ol-progress__fill");
    const task = state.task;
    if (task.total > 0) {
      fillBar.style.width = Math.round((task.done / task.total) * 100) + "%";
    } else {
      // 清除這種沒有頁數可數的工作，用來回掃動表示還在跑
      track.classList.add("ol-progress__track--idle");
    }
    track.appendChild(fillBar);
    wrap.appendChild(track);
    wrap.appendChild(
      el(
        "p",
        "ol-progress__text",
        task.total > 0
          ? task.label + "　" + fill("progress", { done: task.done, total: task.total })
          : task.label
      )
    );
    return wrap;
  }

  function renderSections() {
    if (!state.index) {
      root.appendChild(el("p", null, t.noIndex));
      return;
    }
    // 照 offline-index.json 給的順序，那是 nav 的順序，不另外排。原本按頁數排，
    // 結果是「近期公告」七十篇擺最上面、指南的章節散在中間，跟讀者在側邊欄記得的
    // 位置完全對不上，一打開不知道從何看起。
    //
    // 篩選開著時整章都沒東西的就不畫，連帶頂層標題的計數也要照篩過的算，否則會
    // 留下一個底下什麼都沒有的章節名。
    const sections = state.index.sections
      .map((section) => ({ section: section, pages: visiblePages(section) }))
      .filter((entry) => entry.pages.length);
    if (!sections.length) {
      root.appendChild(el("p", null, state.onlyStored ? t.onlyStoredEmpty : t.noIndex));
      return;
    }
    const perGroup = {};
    for (const entry of sections) {
      const group = entry.section.group || "";
      perGroup[group] = (perGroup[group] || 0) + 1;
    }

    let lastGroup = null;
    let first = true;
    for (const entry of sections) {
      const section = entry.section;
      const group = section.group || "";
      const changed = group !== lastGroup;
      // 一個頂層章節底下只有一組時不另外掛標題，兩行寫同一個名字沒有意義
      const titled = group && perGroup[group] > 1;
      if (titled && changed) root.appendChild(el("p", "ol-group", group));

      // 只有一頁又跟頂層同名的，那是這一節的總覽頁，照原名列會跟頂層標題重複
      const label =
        titled && section.title === group && section.pages.length === 1
          ? t.overview
          : section.title;
      const node = renderSection(section, label, entry.pages);
      // 沒有標題可以分隔時改用留白，不然它會看起來像上一組的最後一項
      if (changed && !titled && !first) node.classList.add("ol-section--gap");
      root.appendChild(node);

      lastGroup = group;
      first = false;
    }
  }

  function visiblePages(section) {
    if (!state.onlyStored) return section.pages;
    return section.pages.filter((page) => isStored(page.url));
  }

  // 切換「只列已存的」。開的時候順手把有東西的章節展開，斷網的讀者要的就是一份
  // 攤開來、現在讀得到的清單，還要一章一章點開找就失去意義了。
  function setOnlyStored(on) {
    state.onlyStored = on;
    state.open.clear();
    if (!on || !state.index) return;
    for (const section of state.index.sections) {
      if (visiblePages(section).length) state.open.add(section.key);
    }
  }

  // 工作跑起來之後停用動作、顯示進度，做完重讀狀態再整頁重畫。
  //
  // 進度顯示在獨立的進度條上，不去改按鈕文字。原本邊跑邊改按鈕文字，按鈕寬度會
  // 跟著跳，而清除那種沒有頁數可數的工作根本沒東西可顯示，按下去看起來就像沒反應。
  function runTask(label, total, run) {
    state.busy = true;
    state.task = { label: label, done: 0, total: total };
    render();

    const report = (data) => {
      state.task.done = data.done;
      state.task.total = data.total;
      // 只動進度條本身，不整頁重畫。逐頁重畫的話勾選與展開狀態都會閃。
      const bar = root.querySelector(".ol-progress__fill");
      if (bar && data.total) {
        bar.style.width = Math.round((data.done / data.total) * 100) + "%";
      }
      const line = root.querySelector(".ol-progress__text");
      if (line) {
        line.textContent =
          label + "　" + fill("progress", { done: data.done, total: data.total });
      }
    };

    return run(report)
      .then((result) => {
        state.busy = false;
        state.task = null;
        state.armedClear = false;
        return refreshStatus().then(() => render(result && result.message));
      })
      .catch(() => {
        state.busy = false;
        state.task = null;
        state.armedClear = false;
        render(t.failed);
      });
  }

  note(t.loading);

  // 索引不經過 service worker，來了就先把清單畫出來
  fetch(indexUrl, { credentials: "same-origin" })
    .then((response) => (response.ok ? response.json() : null))
    .catch(() => null)
    .then((index) => {
      state.index = index;
      pageIndex = null;
      // 索引跟 service worker 那半是各跑各的，誰先到都有可能。篩選先開起來的話
      // 那時還沒有章節可以展開，索引到了補做一次。
      if (state.onlyStored) setOnlyStored(true);
      render();
    });

  whenReady()
    .then(refreshStatus)
    .then(() => {
      state.swReady = true;
      // 斷網進來的讀者是被 service worker 帶到這一頁的，他要找的是現在還讀得到的
      // 東西。navigator.onLine 回 false 時是可信的（回 true 才不可信），拿來決定
      // 預設值剛好。讀者隨時可以自己關掉。
      if (navigator.onLine === false) setOnlyStored(true);
      render();
    })
    .catch(() => {
      state.swMissing = true;
      render();
    });
})();
