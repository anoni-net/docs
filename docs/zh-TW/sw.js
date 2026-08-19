/*
 * anoni.net Docs PWA service worker
 *
 * 策略：
 * - 預快取：app shell（theme CSS/JS）+ 讀者當下語系的核心章節 + offline fallback 頁
 * - HTML（navigation）：network-first，離線時回快取，再不行回該語系 offline 頁
 * - 靜態資產：stale-while-revalidate，runtime 快取設上限避免膨脹
 * - 跨域請求（含 aa.anoni.net 分析）一律放行不快取
 *
 * __BUILD_VERSION__ 由 build_docs_anoni.sh 於部署時替換，
 * 換版後 activate 階段會清除舊快取。
 *
 * manifest 的 id：docs/zh-TW/manifest.webmanifest 由 run.sh 建到 /docs/，裡面的 id
 * 寫成 "/docs/"。規格上 id 相對 origin 解析，結果是 https://anoni.net/docs/。
 * en 與 zh-cn 各自有獨立的 manifest 與 id。
 *
 * manifest 的 scope：zh-TW 寫 "."（解析成 /docs/），en 與 zh-cn 寫 ".."（退一層，同樣
 * 是 /docs/）。JSON 沒地方寫註解，理由記在這裡：三件互動作品只建置一份在根路徑
 * /docs/games/，en 與 zh-cn 用 ?lang= 連過去共用同一份。那兩份 scope 若寫 "."，就只
 * 涵蓋自己的語系前綴（/docs/en/），讀者在已安裝的 app 裡點進作品會離開 scope，
 * Android Chrome 會掛出網址列，看起來像掉出 app。用相對值而不是寫死 "/docs/"，
 * 本地 mkdocs serve 在 "/" 底下跑的時候一樣解析得出有效的 scope。
 *
 * 注意：theme 資產的 hash 檔名需與 overrides/base.html 同步，
 * 升級 mkdocs-material 時要一併更新。
 */

const VERSION = "__BUILD_VERSION__";
const PRECACHE = "anoni-docs-precache-" + VERSION;
// runtime 拆兩個。原本導覽頁與圖片、字型共用同一個 200 筆上限，
// 圖多的頁面逛幾輪就會把讀者想留著離線看的頁面擠掉。
//
// 這兩個名稱刻意不帶 VERSION。VERSION 是分鐘級時間戳，每次部署必定改變，而
// activate 會刪掉所有不在保留名單裡的快取，等於讀者累積的離線頁面每次部署都
// 被清空一次，接著又要把整份預快取重下載一遍。頁面的新鮮度由 network-first
// 維持，不需要靠換快取名稱來換版。PRECACHE 保留版本後綴，那批是 hash 檔名的
// app shell，換版後舊的確實該整批丟掉。
const RUNTIME_PAGES = "anoni-docs-pages";
const RUNTIME_ASSETS = "anoni-docs-assets";
const PAGES_MAX_ENTRIES = 120;
const ASSETS_MAX_ENTRIES = 200;

// SW scope 在正式站是 /docs/，本地開發（mkdocs serve）是 /
const SCOPE_PATH = new URL(self.registration.scope).pathname;

// 各語系 build 的根路徑前綴（相對於 scope）。站台跑三次 mkdocs build（run.sh、
// run_zh-cn.sh、run_en.sh），預設語系 zh-TW 由 run.sh 建在根路徑，另兩語各有前綴。
//
// 執行期一次只預快取其中一個（見 precacheUrlsFor）。這份清單是語系有哪些的單一
// 來源，langPrefixOf 與 tools/check_precache.mjs 都讀它。
const LANG_PREFIXES = ["", "zh-cn/", "en/"];

// theme app shell（hash 檔名與 overrides/base.html 同步）
const SHELL_ASSETS = [
  "assets/stylesheets/main.484c7ddc.min.css",
  "assets/stylesheets/palette.ab4e12ef.min.css",
  "assets/javascripts/bundle.79ae519e.min.js",
  "assets/javascripts/workers/search.2c215733.min.js",
  "assets/images/logo-white.svg",
  "assets/images/favicon.svg",
  "assets/images/icon-192.png",
];

// zh 版（zh-TW 根、/zh-cn/）章節結構一致，預快取完整指南集 + 緊急頁。
// 個別語系若缺某頁（如 zh-CN 暫無 what-is-cryptpad），install 時 404 由 allSettled 容忍。
const CORE_PAGES_ZH = [
  "",
  "offline/",
  "guides/",
  "help/",
  // basics（概念，全部）
  "basics/",
  "basics/internet-freedom/",
  "basics/anonymity-vs-privacy/",
  "basics/threat-model/",
  "basics/metadata/",
  "basics/payments-anonymity/",
  // tools(工具，全部)
  "tools/",
  "tools/what-is-anonymity-network/",
  "tools/what-is-tor/",
  "tools/what-is-tails/",
  "tools/what-is-ooni/",
  "tools/what-is-cryptpad/",
  "tools/tor-browser-advanced/",
  "tools/tor-snowflake/",
  "tools/onionshare/",
  "tools/ooni-run-v2/",
  "tools/tails-vs-whonix-vs-qubes/",
  "tools/messaging-comparison/",
  "tools/password-manager/",
  "tools/crypto-privacy-spectrum/",
  "tools/encrypted-dns/",
  // scenarios（場景）
  //
  // 預快取是在讀者只開過首頁、沒點進去、也沒安裝 PWA 的情況下就發生的。
  // 有些頁面一旦躺在裝置的 Cache Storage 裡，本身就是指向性證據，會顯示
  // 「這台裝置下載過某某族群的保護指南全文」。這些文章自己就在教讀者清
  // 瀏覽器痕跡、提防裝置被檢查，站台不該一邊這樣教、一邊把文章推進讀者裝置。
  //
  // 判準（新增頁面時照這個問，不要只看它放在哪個資料夾）：
  //   這頁是不是用第二人稱或隱含第二人稱，指導「唯一一種身分的人」在採取
  //   某個具體行動前後該做什麼準備？
  //
  // 是的話就不要放進 CORE_PAGES。讀者主動點開時 runtime 快取仍會存下來離線
  // 可讀，那是他自己的選擇，不是站台替他決定的。
  //
  // 依這個判準，這次移除了 scenarios 的 journalist、activist、lgbtq，以及
  // taiwan/whistleblower-law（它放在法規資料夾，但整篇是揭弊者本人的行動準備
  // 清單，性質跟 journalist 一樣，按資料夾掃會漏掉）。
  // domestic-violence、election-observer 等頁本來就不在清單裡，同樣不要加。
  //
  // 旅行類保留：讀者是「任何出國的人」，不指向特定受威脅身分。
  // 工具與概念頁保留：那是說明書，讀者拿去做什麼是開放的，不鎖定身分。
  "scenarios/",
  "scenarios/asia-travel/",
  "scenarios/travel-ai-briefing/",
  // advanced（進階，全部）
  "advanced/",
  "advanced/e2ee/",
  "advanced/post-quantum/",
  "advanced/dweb-ipfs-onion/",
  "advanced/zk-identity-payments/",
  "advanced/mistaken-for-anonymity/",
  // taiwan（在地。whistleblower-law 依上面的判準排除，不是漏掉。
  // ooni-asn-coverage 與 tor-relay-watcher 的 vega 圖表離線不渲染，文字仍可讀）
  "taiwan/",
  "taiwan/ooni-checklist/",
  "taiwan/pdpa-2025/",
  "taiwan/vasp-2026/",
  "taiwan/ooni-asn-coverage/",
  "taiwan/tor-relay-watcher/",
  // community（社群，選錄離線可讀的工具頁）
  "community/onionoo-mcp/",
  // 互動與呈現的索引頁。作品本體不在這裡，見下面的 GAME_APPS。
  "games/",
];

// en 是策展型原創軌道，章節名稱與 zh 版不同（在地脈絡叫 regional/ 不叫 taiwan/），
// 但 2026-08 補齊後兩邊的覆蓋範圍已經接近，所以選錄邏輯跟 CORE_PAGES_ZH 一致：
// 完整指南集加緊急頁，身分敏感的頁面排除。
//
// 身分敏感度的判準與理由見 CORE_PAGES_ZH 上方那段長註解，新增頁面時照那個問，
// 不要只看它放在哪個資料夾。依那條判準，這裡排除了 scenarios 的 journalist、
// activist、lgbtq、domestic-violence、election-observer、mainland-speech、
// singapore-malaysia-speech、nonprofit-anonymous-donation，以及
// regional/taiwan-whistleblower-law（它放在法規資料夾，但整篇是揭弊者本人的
// 行動準備清單，按資料夾掃會漏掉，跟 zh 版排除 taiwan/whistleblower-law 同一個理由）。
const CORE_PAGES_EN = [
  "",
  "offline/",
  "about/",
  "guides/",
  "help/",
  // basics（概念，全部）
  "basics/",
  "basics/internet-freedom/",
  "basics/anonymity-vs-privacy/",
  "basics/threat-model/",
  "basics/metadata/",
  "basics/payments-anonymity/",
  "basics/platform-tracking/",
  "basics/surveillance-capability/",
  "basics/multiple-identities/",
  // tools（工具，全部）
  "tools/",
  "tools/what-is-anonymity-network/",
  "tools/what-is-tor/",
  "tools/what-is-tails/",
  "tools/what-is-ooni/",
  "tools/what-is-cryptpad/",
  "tools/tor-browser-advanced/",
  "tools/tor-snowflake/",
  "tools/onionshare/",
  "tools/grapheneos/",
  "tools/ooni-run-v2/",
  "tools/tails-vs-whonix-vs-qubes/",
  "tools/messaging-comparison/",
  "tools/password-manager/",
  "tools/asian-diceware/",
  "tools/crypto-privacy-spectrum/",
  "tools/encrypted-dns/",
  "tools/vpn-guide/",
  "tools/ai-privacy/",
  // scenarios（場景，只留不指向特定受威脅身分的）
  "scenarios/",
  "scenarios/asia-travel/",
  "scenarios/travel-ai-briefing/",
  // advanced（進階，全部）
  "advanced/",
  "advanced/e2ee/",
  "advanced/post-quantum/",
  "advanced/dweb-ipfs-onion/",
  "advanced/zk-identity-payments/",
  "advanced/mistaken-for-anonymity/",
  // regional（在地脈絡。taiwan-whistleblower-law 依上面的判準排除，不是漏掉。
  // ooni-asn-coverage 與 tor-relay-watcher 的 vega 圖表離線不渲染，文字仍可讀）
  "regional/",
  "regional/ooni-checklist/",
  "regional/taiwan-pdpa-2025/",
  "regional/taiwan-vasp-2026/",
  "regional/ooni-asn-coverage/",
  "regional/tor-relay-watcher/",
  // community（社群，選錄離線可讀的工具頁）
  "community/onionoo-mcp/",
  // 互動與呈現的索引頁。作品本體不在這裡，見下面的 GAME_APPS。
  "games/",
];

// 三件互動作品的本體。
//
// 跟核心章節不同，這一批只放一份，不跟著 LANG_PREFIXES 複製。三個語系的 games
// 索引頁各自存在，但作品本身只由 run.sh 建置到根路徑 /docs/games/<slug>/play/，其他語系是用
// ?lang= 連過去共用同一份程式。跟著前綴複製的話，另外兩個語系會抓到 404，白繞一圈。
//
// 為什麼值得預快取：這是站上唯一「已經做好、有人在用，卻沒被離線策略蓋到」的東西。
// 實際會用到的離線情境是工作坊沒有 wifi、教學現場網路很差，而那些場合正是要把畫面
// 翻給人看的時候。網頁載得出來但地球儀空白，比整頁打不開更難解釋。
//
// 成本：28 個檔案、2.33 MB。加進來之前整份預快取是 14.74 MB，所以這是 +15.8%。
// 拆開來看：
//
//   three.js vendor 1.05 MB（三件共用）
//   地球儀的資料檔   0.86 MB
//   地球儀的程式     0.30 MB
//   另外兩件         0.12 MB
//
// bathymetry.json 那 426 KB 刻意不放。它是海底等深線畫出來的深淺底色，是整批裡最大
// 的一份，而 atlas.js 抓它時帶 .catch(() => null)，最深那階的顏色又刻意等於海面的
// 單色，所以離線時少了它畫面跟以前一模一樣，不會看起來像壞掉。用最大的檔案換一層
// 純裝飾的質感，這個交換划算。
//
// 再往下砍就沒有這麼乾淨了。tw-admin（215 KB）與 countries（136 KB）是次大的兩份，
// 但前者拿掉就沒有縣市界、放大台灣只剩空白，後者是必要的，缺了整顆球都畫不出來。
// 那時畫面看起來像壞掉而不像少了東西，比整個不快取更糟。
//
// 數字用 tools/check_precache.mjs 量的，那支讀的是 apparent size，也就是實際要傳輸的
// 位元組。不要用 du 量，這台的檔案系統會共用 extent，du report 出來只有一半。
//
// 上面那組數字是作品加進來當時量的。2026-08 重量一次，整份預快取已經到 25.05 MB，
// 三件作品的 2.33 MB 佔比降到 9.3%。變大的原因是三個語系各存一份完整章節，而 en
// 那份在 2026-08 補齊之後跟 zh 差不多厚了。要縮的話該從「只預快取讀者當下的語系」
// 著手，砍作品這一批省不到多少。
//
// 身分敏感度：照 CORE_PAGES_ZH 那條判準（讀者是不是特定受威脅身分）檢查過。這三件
// 是教學性質的視覺化，跟已經在預快取裡的 tools/what-is-tor/ 同一類，不指向特定身分，
// 所以可以放。
//
// 維護：新增作品或地球儀多一份資料檔時要補進這裡，漏了的話那一份會在離線時抓不到。
// seacable.json 刻意不在清單裡，那份沒有落地到 repo。
const GAME_APPS = [
  "games/onion-routing/play/index.html",
  "games/onion-routing/play/game.js",
  "games/onion-routing/play/i18n.js",
  "games/onion-routing/play/levels.js",
  "games/onion-rendezvous/play/index.html",
  "games/onion-rendezvous/play/scene.js",
  "games/onion-rendezvous/play/i18n.js",
  "games/tor-network/play/index.html",
  "games/tor-network/play/atlas.js",
  "games/tor-network/play/i18n.js",
  "games/tor-network/play/cables.json",
  "games/tor-network/play/continents.json",
  "games/tor-network/play/countries.json",
  "games/tor-network/play/netusers.json",
  "games/tor-network/play/ooni.json",
  "games/tor-network/play/shutdowns.json",
  "games/tor-network/play/snapshot.json",
  "games/tor-network/play/torusers.json",
  "games/tor-network/play/tw-admin.json",
  "games/tor-network/play/tw-energy.json",
  "games/tor-network/play/tw-grid.json",
  "games/tor-network/play/tw-landing.json",
  "games/tor-network/play/tw-power.json",
  // three.js 是本地 vendor 的，三件共用。core 沒有寫在 importmap 裡，
  // 是被 webgpu 那份 import 進去的，少了它三件都起不來。
  "games/vendor/three.webgpu.min.js",
  "games/vendor/three.core.min.js",
  "games/vendor/three.tsl.min.js",
  "games/vendor/jsm/tsl/display/BloomNode.js",
  "games/vendor/jsm/tsl/display/AfterImageNode.js",
];

// 各語系前綴對應的核心章節清單
const CORE_PAGES_BY_PREFIX = {
  "": CORE_PAGES_ZH,
  "zh-cn/": CORE_PAGES_ZH,
  "en/": CORE_PAGES_EN,
};

// 單一語系要預快取的網址。
//
// 原本三個語系全下，2026-08 實測 25.05 MB，而讀者一次只讀一種語言，另外兩份純粹
// 佔裝置空間與行動網路流量。改成只下當下這個語系，讀者切語系時由 client 送
// PRECACHE_LANG 過來補。app shell 的 CSS 與 JS 三次 build 產出的內容一模一樣，只是
// 路徑前綴不同，所以原本連同一批位元組也下了三遍。
function precacheUrlsFor(prefix) {
  const urls = [];
  const pages = CORE_PAGES_BY_PREFIX[prefix] || CORE_PAGES_ZH;
  for (const page of pages) {
    urls.push(SCOPE_PATH + prefix + page);
  }
  for (const asset of SHELL_ASSETS) {
    urls.push(SCOPE_PATH + prefix + asset);
  }
  // 作品本體只建置一份在根路徑 /docs/games/，跟語系無關，三個語系共用
  for (const asset of GAME_APPS) {
    urls.push(SCOPE_PATH + asset);
  }
  return urls;
}

// 這個 SW 生命週期內已經補過的語系。每次導覽 client 都會送 PRECACHE_LANG 過來，
// 沒有這層就要對七十幾個網址各做一次 cache.match 才知道沒事可做。SW 被瀏覽器終止
// 後清空，下次重跑一輪也只是白查一次，不會抓重複的東西。
const precachedPrefixes = new Set();

// 補齊某個語系的預快取。已經在快取裡的跳過，所以換語系時只會抓新的那一份，作品
// 本體與抓過的東西不重來。
async function precacheFor(prefix) {
  if (precachedPrefixes.has(prefix)) return;
  precachedPrefixes.add(prefix);
  const cache = await caches.open(PRECACHE);
  // 逐一快取並容忍個別失敗（本地開發只有單一語系，其他語系路徑會 404）
  await Promise.allSettled(
    precacheUrlsFor(prefix).map(async (url) => {
      if (await cache.match(url)) return;
      const response = await fetch(url, { credentials: "same-origin" });
      if (response.ok) await cache.put(url, response);
    })
  );
}

// 網址對到建置路徑的語系前綴。zh-TW 由 run.sh 建在根路徑，另外兩語各有前綴。
// 不在 scope 內時回 null。
//
// 路徑前綴優先於 query。前綴是站台建出來的，query 誰都能加。三件互動作品只建置
// 一份在根路徑，語系靠 ?lang= 傳，所以路徑上沒有前綴時才看 query。
function langPrefixOf(url) {
  if (!url.pathname.startsWith(SCOPE_PATH)) return null;
  const rel = url.pathname.slice(SCOPE_PATH.length);
  for (const prefix of LANG_PREFIXES) {
    if (prefix && rel.startsWith(prefix)) return prefix;
  }
  const lang = url.searchParams.get("lang");
  if (lang && LANG_PREFIXES.includes(lang + "/")) return lang + "/";
  return "";
}

// install 階段還沒有 client 送訊息過來，先從開著的分頁網址推一個語系。三個語系
// 共用同一個 registration（scope 都是 /docs/），SW 沒辦法從自己的 scope 判斷。
//
// 一個站內分頁都找不到時回 null，install 就先不抓章節，等頁面載入後 client 送
// PRECACHE_LANG 過來再抓。猜錯的代價是讀者白下一整個語系（約 9 MB），寧可晚個
// 幾百毫秒。回空字串是「確定是根路徑的 zh-TW」，跟 null 不同。
async function guessLangPrefix() {
  const windows = await self.clients.matchAll({
    includeUncontrolled: true,
    type: "window",
  });
  for (const client of windows) {
    const prefix = langPrefixOf(new URL(client.url));
    if (prefix !== null) return prefix;
  }
  return null;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const prefix = await guessLangPrefix();
      if (prefix !== null) await precacheFor(prefix);
      // 這裡刻意不呼叫 skipWaiting。原本一裝好就搶著接管，讀者正在讀的分頁會在毫無
      // 徵兆的情況下換掉腳下的 SW，而 activate 又會清掉不在保留名單裡的快取。改成
      // 停在 waiting，等讀者在換版提示上按下更新，收到 SKIP_WAITING 才接管。
    })()
  );
});

// client 送過來的指令。唯一的來源是 overrides/base.html 裡的 PWA script。
self.addEventListener("message", (event) => {
  const data = event.data || {};

  if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  // 頁面載入時 client 送自己的網址過來，SW 據此補齊那個語系的預快取。
  //
  // 傳網址而不是語系代碼，是因為 document.documentElement.lang 在 zh-CN 版是 "zh"
  // （mkdocs_cn.yml 的 theme.language），跟 zh-TW 的 "zh-TW" 對不出建置路徑，而網址
  // 直接對得到 /docs/zh-cn/。判斷邏輯也就只留在 langPrefixOf 一處。
  if (data.type === "PRECACHE_LANG" && typeof data.url === "string") {
    const prefix = langPrefixOf(new URL(data.url));
    if (prefix !== null) event.waitUntil(precacheFor(prefix));
  }
});

// 一次性遷移：把帶版本後綴的舊 runtime 快取搬進不帶版本的新快取。
//
// 這次改動之前每次部署都換快取名稱，activate 會把讀者累積的離線頁面整批刪掉。修法
// 如果照舊直接刪，等於在升級的當下再清空一次，所以先搬過來。頁面與資產都要搬：舊頁面
// 引用的是舊 hash 的 CSS 與 JS，只搬頁面的話離線開起來會沒有樣式。
//
// 讀者都升過一輪之後（大約兩三次部署）這段就不會再命中任何東西，可以移除。
async function migrateLegacyRuntime() {
  const keys = await caches.keys();
  for (const [legacyPrefix, target] of [
    ["anoni-docs-pages-", RUNTIME_PAGES],
    ["anoni-docs-assets-", RUNTIME_ASSETS],
  ]) {
    const legacyKeys = keys.filter((key) => key.startsWith(legacyPrefix));
    if (!legacyKeys.length) continue;
    const cache = await caches.open(target);
    for (const key of legacyKeys) {
      const legacy = await caches.open(key);
      for (const request of await legacy.keys()) {
        // 新快取已經有的就不覆蓋，那份比較新
        if (await cache.match(request)) continue;
        const response = await legacy.match(request);
        if (response) await cache.put(request, response);
      }
      await caches.delete(key);
    }
  }
  await trimCache(RUNTIME_PAGES, PAGES_MAX_ENTRIES);
  await trimCache(RUNTIME_ASSETS, ASSETS_MAX_ENTRIES);
}

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await migrateLegacyRuntime();
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) => key !== PRECACHE && key !== RUNTIME_PAGES && key !== RUNTIME_ASSETS
          )
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

// 同一份 HTML 會被連成不同形狀的網址。互動作品的索引頁，zh-TW 連的是
// games/x/play/，en 與 zh-cn 連的是 games/x/play/index.html?lang=en，指的是同一個
// 檔案。Cache Storage 比對的是完整網址字串，形狀差一點就 miss，而預快取一份頁面
// 只能存一種形狀。離線時依序試這幾種，讓三個語系都命中同一份。
function cacheKeyCandidates(pathname) {
  if (pathname.endsWith("/index.html")) {
    return [pathname, pathname.slice(0, -"index.html".length)];
  }
  if (pathname.endsWith("/")) {
    return [pathname, pathname + "index.html"];
  }
  return [pathname];
}

// 離線時替一個導覽請求找出對應的快取。ignoreSearch 讓帶 ?lang= 或分享參數的網址
// 也命中，站上的 query 一律只由 client 端 JS 讀取，同一個路徑回傳的 HTML 是同一份。
async function matchCachedPage(request) {
  const url = new URL(request.url);
  for (const pathname of cacheKeyCandidates(url.pathname)) {
    const hit = await caches.match(url.origin + pathname, { ignoreSearch: true });
    if (hit) return hit;
  }
  return undefined;
}

// zh-TW 的 offline 頁在根路徑，另外兩語各在自己的前綴底下。langPrefixOf 回 null
// （scope 外）時落到 zh-TW，那種請求本來也走不到這裡。
function offlinePathFor(url) {
  return SCOPE_PATH + (langPrefixOf(url) || "") + "offline/";
}

// event 可能不存在（例如未來從別處呼叫），沒有就退回 fire-and-forget
function keepAlive(event, promise) {
  if (event && typeof event.waitUntil === "function") event.waitUntil(promise);
  return promise;
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  for (const key of keys.slice(0, keys.length - maxEntries)) {
    await cache.delete(key);
  }
}

async function networkFirst(request, event) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_PAGES);
      await cache.put(request, response.clone());
      // 用 waitUntil 而不是 await。純 fire-and-forget 的話 SW 可能在裁剪跑完前
      // 被瀏覽器終止，上限長期守不住；改成 await 又會讓每次導覽都等裁剪跑完才
      // 拿到回應。waitUntil 兩邊都要得到：SW 活到裁剪結束，回應不被卡住。
      keepAlive(event, trimCache(RUNTIME_PAGES, PAGES_MAX_ENTRIES));
    }
    return response;
  } catch (err) {
    const cached = await matchCachedPage(request);
    if (cached) return cached;
    const offline = await caches.match(offlinePathFor(new URL(request.url)));
    if (offline) return offline;
    throw err;
  }
}

async function staleWhileRevalidate(request, event) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(RUNTIME_ASSETS);
        await cache.put(request, response.clone());
        keepAlive(event, trimCache(RUNTIME_ASSETS, ASSETS_MAX_ENTRIES));
      }
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // 跨域（含 aa.anoni.net 分析）與 scope 外的請求一律放行
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(SCOPE_PATH)) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, event));
  } else {
    event.respondWith(staleWhileRevalidate(request, event));
  }
});
