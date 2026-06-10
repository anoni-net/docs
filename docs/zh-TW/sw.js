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
 * 注意：theme 資產的 hash 檔名需與 overrides/base.html 同步，
 * 升級 mkdocs-material 時要一併更新。
 */

const VERSION = "__BUILD_VERSION__";
const PRECACHE = "anoni-docs-precache-" + VERSION;
const RUNTIME = "anoni-docs-runtime-" + VERSION;
const RUNTIME_MAX_ENTRIES = 200;

// SW scope 在正式站是 /docs/，本地開發（mkdocs serve）是 /
const SCOPE_PATH = new URL(self.registration.scope).pathname;

// 各語系 build 的根路徑前綴（相對於 scope）。預設 build（zh-TW）在根。
const LANG_PREFIXES = ["", "zh-tw/", "zh-cn/", "en/"];

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

// zh 版（zh-TW 根、/zh-tw/、/zh-cn/）章節結構一致，預快取完整核心章節
const CORE_PAGES_ZH = [
  "",
  "offline/",
  "guides/",
  "basics/",
  "basics/internet-freedom/",
  "basics/anonymity-vs-privacy/",
  "basics/threat-model/",
  "basics/metadata/",
  "tools/",
  "tools/what-is-anonymity-network/",
  "tools/what-is-tor/",
  "tools/what-is-tails/",
  "tools/what-is-ooni/",
  "scenarios/",
  "scenarios/journalist/",
  "scenarios/activist/",
];

// en 是策展型原創軌道，頁面集合與 zh 版不同（沒有 tools/、basics 多數頁），
// 只預快取目前實際存在的核心頁。en 之後新增核心頁時記得補進來。
const CORE_PAGES_EN = [
  "",
  "offline/",
  "basics/",
  "basics/internet-freedom/",
  "scenarios/",
];

// 各語系前綴對應的核心章節清單
const CORE_PAGES_BY_PREFIX = {
  "": CORE_PAGES_ZH,
  "zh-tw/": CORE_PAGES_ZH,
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
          .filter((key) => key !== PRECACHE && key !== RUNTIME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

function offlinePathFor(pathname) {
  const rel = pathname.slice(SCOPE_PATH.length);
  for (const prefix of ["zh-tw/", "zh-cn/", "en/"]) {
    if (rel.startsWith(prefix)) return SCOPE_PATH + prefix + "offline/";
  }
  return SCOPE_PATH + "offline/";
}

async function trimRuntimeCache() {
  const cache = await caches.open(RUNTIME);
  const keys = await cache.keys();
  if (keys.length <= RUNTIME_MAX_ENTRIES) return;
  for (const key of keys.slice(0, keys.length - RUNTIME_MAX_ENTRIES)) {
    await cache.delete(key);
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME);
      await cache.put(request, response.clone());
      trimRuntimeCache();
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

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(RUNTIME);
        await cache.put(request, response.clone());
        trimRuntimeCache();
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
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});
