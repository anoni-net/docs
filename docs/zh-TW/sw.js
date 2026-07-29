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
 * manifest 的 id：docs/zh-TW/manifest.webmanifest 同時被 run.sh（輸出到 /docs/）
 * 與 run_zh-tw.sh（輸出到 /docs/zh-tw/）使用，兩棵樹的內容逐位元組相同。裡面的
 * id 寫成 "/docs/"，而規格上 id 是相對 origin 解析，所以兩棵樹都會得到
 * https://anoni.net/docs/，瀏覽器視為同一個 App。這是刻意的：同一份內容不該
 * 出現兩個可安裝項目。en 與 zh-cn 各自有獨立的 manifest 與 id，不受影響。
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

// 各語系 build 的根路徑前綴（相對於 scope）。預設 build（zh-TW）在根。
//
// 這裡不放 "zh-tw/"。站台會建置四棵樹，但根路徑與 /zh-tw/ 是同一份 zh-TW 內容，
// 兩邊都預快取等於同樣的四十幾頁抓兩次。實測整份 precache 是 21.3 MB，其中
// 6.8 MB（31%）就是這份重複。讀者很可能在受限或計量的網路下第一次造訪，這個
// 浪費是實打實的。/zh-tw/ 的頁面若真的被造訪，runtime 快取仍會接住。
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

// zh 版（zh-TW 根、/zh-tw/、/zh-cn/）章節結構一致，預快取完整指南集 + 緊急頁。
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
  // 這裡沒有 "zh-tw/"。zh-tw 樹跟根路徑是同一份內容，precache 只收根路徑那份，
  // 導向 /zh-tw/offline/ 會落到一個不存在於快取的頁面，讀者就吃到瀏覽器原生
  // 的錯誤畫面。落到最後的預設值（根路徑的 offline 頁）內容完全一樣。
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
