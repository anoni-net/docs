/*
 * anoni.net Docs PWA service worker
 *
 * 策略：
 * - 預快取：app shell（theme CSS/JS）+ 三語系核心章節 + offline fallback 頁
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
 * 注意：theme 資產的 hash 檔名需與 overrides/base.html 同步，
 * 升級 mkdocs-material 時要一併更新。
 */

const VERSION = "__BUILD_VERSION__";
const PRECACHE = "anoni-docs-precache-" + VERSION;
// runtime 拆兩個。原本導覽頁與圖片、字型共用同一個 200 筆上限，
// 圖多的頁面逛幾輪就會把讀者想留著離線看的頁面擠掉。
const RUNTIME_PAGES = "anoni-docs-pages-" + VERSION;
const RUNTIME_ASSETS = "anoni-docs-assets-" + VERSION;
const PAGES_MAX_ENTRIES = 120;
const ASSETS_MAX_ENTRIES = 200;

// SW scope 在正式站是 /docs/，本地開發（mkdocs serve）是 /
const SCOPE_PATH = new URL(self.registration.scope).pathname;

// 各語系 build 的根路徑前綴（相對於 scope）。站台跑三次 mkdocs build（run.sh、
// run_zh-cn.sh、run_en.sh），預設語系 zh-TW 由 run.sh 建在根路徑，另兩語各有前綴。
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

// en 是策展型原創軌道，頁面集合與 zh 版不同（沒有 tools/、taiwan/、advanced/、help/）。
// 只預快取目前實際存在的核心頁，en 之後新增核心頁時記得補進來。
const CORE_PAGES_EN = [
  "",
  "offline/",
  "about/",
  "basics/",
  "basics/internet-freedom/",
  // scenarios/lgbtq 同樣不預快取，理由見 CORE_PAGES_ZH 的說明
  "scenarios/",
  "scenarios/travel-ai-briefing/",
  "community/onionoo-mcp/",
  "regional/",
  "regional/tor-relay-watcher/",
  "games/",
];

// 三件互動作品的本體。
//
// 跟核心章節不同，這一批只放一份，不跟著 LANG_PREFIXES 複製。三個語系的 games
// 索引頁各自存在，但作品本身只由 run.sh 建置到根路徑 /docs/games/，其他語系是用
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
// 身分敏感度：照 CORE_PAGES_ZH 那條判準（讀者是不是特定受威脅身分）檢查過。這三件
// 是教學性質的視覺化，跟已經在預快取裡的 tools/what-is-tor/ 同一類，不指向特定身分，
// 所以可以放。
//
// 維護：新增作品或地球儀多一份資料檔時要補進這裡，漏了的話那一份會在離線時抓不到。
// seacable.json 刻意不在清單裡，那份沒有落地到 repo。
const GAME_APPS = [
  "games/onion-routing/index.html",
  "games/onion-routing/game.js",
  "games/onion-routing/i18n.js",
  "games/onion-routing/levels.js",
  "games/onion-rendezvous/index.html",
  "games/onion-rendezvous/scene.js",
  "games/onion-rendezvous/i18n.js",
  "games/tor-network/index.html",
  "games/tor-network/atlas.js",
  "games/tor-network/i18n.js",
  "games/tor-network/cables.json",
  "games/tor-network/continents.json",
  "games/tor-network/countries.json",
  "games/tor-network/netusers.json",
  "games/tor-network/ooni.json",
  "games/tor-network/shutdowns.json",
  "games/tor-network/snapshot.json",
  "games/tor-network/torusers.json",
  "games/tor-network/tw-admin.json",
  "games/tor-network/tw-energy.json",
  "games/tor-network/tw-grid.json",
  "games/tor-network/tw-landing.json",
  "games/tor-network/tw-power.json",
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

function precacheUrls() {
  const urls = [];
  for (const prefix of LANG_PREFIXES) {
    const pages = CORE_PAGES_BY_PREFIX[prefix] || CORE_PAGES_ZH;
    for (const page of pages) {
      urls.push(SCOPE_PATH + prefix + page);
    }
    for (const asset of SHELL_ASSETS) {
      urls.push(SCOPE_PATH + prefix + asset);
    }
  }
  // 作品本體只在根路徑 /docs/games/ 底下，所以擺在前綴迴圈外面
  for (const asset of GAME_APPS) {
    urls.push(SCOPE_PATH + asset);
  }
  return urls;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then(async (cache) => {
      // 逐一快取並容忍個別失敗（本地開發只有單一語系，其他語系路徑會 404）
      await Promise.allSettled(
        precacheUrls().map(async (url) => {
          const response = await fetch(url, { credentials: "same-origin" });
          if (response.ok) await cache.put(url, response);
        })
      );
      await self.skipWaiting();
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
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

function offlinePathFor(pathname) {
  const rel = pathname.slice(SCOPE_PATH.length);
  // 只列有前綴的兩語，zh-TW 落到最後的預設值（根路徑的 offline 頁）。
  for (const prefix of ["zh-cn/", "en/"]) {
    if (rel.startsWith(prefix)) return SCOPE_PATH + prefix + "offline/";
  }
  return SCOPE_PATH + "offline/";
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
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match(offlinePathFor(new URL(request.url).pathname));
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
