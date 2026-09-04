#!/usr/bin/env node
/**
 * sw.js 離線路徑的單元測試。
 *
 * === 為什麼需要這支 ===
 *
 * 這幾個函式只在「讀者斷線」時才會執行，線上跑的永遠是 network-first 那一條，
 * 所以寫壞了在瀏覽器上點來點去看不出來。要人工驗得先關網路、清快取、逐語系點
 * 一輪，成本高到不會有人每次改都做，而回報這類問題的人本來就連不上網。
 *
 * 三件互動作品的網址形狀是最容易踩的一處：預快取存的 key 是 games/x/play/index.html，
 * zh-TW 的索引頁連的是 games/x/play/，en 與 zh-cn 連的是 play/index.html?lang=en。
 * Cache Storage 比對完整網址字串，三種形狀各是一個 key，指的卻是同一個檔案。
 *
 * migrateLegacyRuntime 則是唯一會動到讀者既有資料的一段，搬錯就是把人家存好的
 * 離線內容弄丟，值得有測試守著。
 *
 * === 怎麼驗 ===
 *
 * 跟 check_precache.mjs 同一套做法：把函式從 sw.js 原地抽出來執行，不重寫一份
 * 邏輯，那樣只會驗到自己抄得對不對。Cache Storage 用最小替身，只實作這些函式
 * 真正用到的 open/match/put/keys/delete。
 *
 * 用法：
 *   node tools/test_sw_offline.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SW = path.join(HERE, '..', 'docs', 'zh-TW', 'sw.js');
const src = fs.readFileSync(SW, 'utf8');

const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error(`sw.js 裡找不到 ${re}`);
  return m[0];
};

const ORIGIN = 'https://anoni.net';
const SCOPE_PATH = '/docs/';

// Cache Storage 會把字串 request 解析成絕對網址再當 key，替身照做，否則
// matchCachedPage 拿 url.origin 組出來的絕對網址會對不上測試存進去的相對路徑。
const urlOf = (request) =>
  new URL(typeof request === 'string' ? request : request.url, ORIGIN).href;
const normalize = (href, ignoreSearch) => (ignoreSearch ? href.split('?')[0] : href);

class FakeCache {
  constructor() {
    this.store = new Map();
  }
  async put(request, response) {
    this.store.set(urlOf(request), response);
  }
  async match(request, opts = {}) {
    const want = normalize(urlOf(request), opts.ignoreSearch);
    for (const [key, value] of this.store) {
      if (normalize(key, opts.ignoreSearch) === want) return value;
    }
    return undefined;
  }
  async keys() {
    // 真的 Cache.keys() 回的是 Request，這裡只需要 url 這個欄位
    return [...this.store.keys()].map((url) => ({ url }));
  }
  async delete(request) {
    return this.store.delete(urlOf(request));
  }
}

class FakeCacheStorage {
  constructor() {
    this.named = new Map();
    // 帶 ignoreSearch 的比對做過幾次。那條會讓 Cache Storage 放棄索引、線性掃過
    // 每一筆，四百多筆的裝置上是看得出來的延遲，所以要驗它沒有被無條件用上。
    this.ignoreSearchCalls = 0;
  }
  async open(name) {
    if (!this.named.has(name)) this.named.set(name, new FakeCache());
    return this.named.get(name);
  }
  async keys() {
    return [...this.named.keys()];
  }
  async has(name) {
    return this.named.has(name);
  }
  async delete(name) {
    return this.named.delete(name);
  }
  async match(request, opts) {
    if (opts && opts.ignoreSearch) this.ignoreSearchCalls += 1;
    for (const cache of this.named.values()) {
      const hit = await cache.match(request, opts);
      if (hit) return hit;
    }
    return undefined;
  }
}

const harness = `
  ${grab(/^const NO_HTTP_CACHE = .*$/m)}
  ${grab(/^const VERSION = .*$/m)}
  ${grab(/^const PRECACHE = .*$/m)}
  ${grab(/^const LANG_PREFIXES = \[[^\]]*\];/m)}
  ${grab(/^const SHELL_ASSETS = \[[\s\S]*?\n\];/m)}
  ${grab(/^const CORE_PAGES_ZH = \[[\s\S]*?\n\];/m)}
  ${grab(/^const CORE_PAGES_EN = \[[\s\S]*?\n\];/m)}
  ${grab(/^const GAME_APPS = \[[\s\S]*?\n\];/m)}
  ${grab(/^const CORE_PAGES_BY_PREFIX = \{[\s\S]*?\n\};/m)}
  ${grab(/^function precacheUrlsFor\(prefix\) \{[\s\S]*?\n\}/m)}
  ${grab(/^function essentialUrlsFor\(prefix\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function corePageAssets\(prefix, index\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function shellAssetsFor\(prefix, index\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function loadOfflineIndex\(prefix\) \{[\s\S]*?\n\}/m)}
  ${grab(/^const precachedPrefixes = .*$/m)}
  ${grab(/^const VISITS_URL = .*$/m)}
  ${grab(/^async function noteVisit\(prefix\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function hadFullPrecache\(prefix\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function precacheFor\(prefix, wantFull\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function precacheOnNavigation\(prefix, settled\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function visitedPrefixes\(\) \{[\s\S]*?\n\}/m)}
  ${grab(/^function langPrefixOf\(url\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function guessLangPrefix\(\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function installPrecache\(\) \{[\s\S]*?\n\}/m)}
  ${grab(/^const LIBRARY = .*$/m)}
  ${grab(/^const SETTINGS = .*$/m)}
  ${grab(/^const AUTO_PRECACHE_URL = .*$/m)}
  ${grab(/^let autoPrecacheMemo = .*$/m)}
  ${grab(/^async function autoPrecacheEnabled\(\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function setAutoPrecache\(enabled\) \{[\s\S]*?\n\}/m)}
  ${grab(/^const PRECACHE_IMAGES_URL = .*$/m)}
  ${grab(/^async function precacheImagesEnabled\(\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function setPrecacheImages\(enabled\) \{[\s\S]*?\n\}/m)}
  ${grab(/^function messagePrefix\(data\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function libraryEntries\(prefix\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function precachedEntries\(prefix\) \{[\s\S]*?\n\}/m)}
  ${grab(/^const LIBRARY_ASSETS = .*$/m)}
  ${grab(/^const LIBRARY_CONCURRENCY = .*$/m)}
  ${grab(/^async function runPool\(items, worker\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function addToLibrary\(prefix, paths, assets, refresh, report\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function removeFromLibrary\(prefix, paths, assets\) \{[\s\S]*?\n\}/m)}
  ${grab(/^const OWN_CACHE_PREFIX = .*$/m)}
  ${grab(/^async function ownCacheNames\(\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function cacheUsage\(\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function clearAllOffline\(\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function handleLibraryMessage\(data, port\) \{[\s\S]*?\n\}/m)}
  ${grab(/^const RUNTIME_PAGES = .*$/m)}
  ${grab(/^const RUNTIME_ASSETS = .*$/m)}
  ${grab(/^const PAGES_MAX_ENTRIES = .*$/m)}
  ${grab(/^const ASSETS_MAX_ENTRIES = .*$/m)}
  ${grab(/^function cacheKeyCandidates\(pathname\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function matchCachedPage\(request\) \{[\s\S]*?\n\}/m)}
  ${grab(/^function offlinePathFor\(url\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function offlineFallback\(url\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function trimCache\(cacheName, maxEntries\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function migrateLegacyRuntime\(\) \{[\s\S]*?\n\}/m)}
  ${grab(/^function keepAlive\(event, promise\) \{[\s\S]*?\n\}/m)}
  ${grab(/^const NAVIGATE_TIMEOUT_MS = .*$/m)}
  ${grab(/^const NETWORK_DOWN_TTL_MS = .*$/m)}
  ${grab(/^let networkDownSince = .*$/m)}
  ${grab(/^function networkLooksDown\(\) \{[\s\S]*?\n\}/m)}
  ${grab(/^const ASSET_TIMEOUT_MS = .*$/m)}
  ${grab(/^const NO_CACHE_TIMEOUT_MS = .*$/m)}
  ${grab(/^function assetUnavailable\(\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function networkFirst\(request, event\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function staleWhileRevalidate\(request, event\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function purgeStaleCaches\(\) \{[\s\S]*?\n\}/m)}
  return {
    RUNTIME_PAGES, RUNTIME_ASSETS, PAGES_MAX_ENTRIES, PRECACHE, LIBRARY, LIBRARY_ASSETS, SETTINGS,
    cacheKeyCandidates, matchCachedPage, offlinePathFor, migrateLegacyRuntime,
    langPrefixOf, precacheUrlsFor, essentialUrlsFor, corePageAssets, precacheFor, guessLangPrefix,
    shellAssetsFor, loadOfflineIndex, ASSET_TIMEOUT_MS, NO_CACHE_TIMEOUT_MS,
    visitedPrefixes, offlineFallback,
    noteVisit, hadFullPrecache, installPrecache, precacheOnNavigation,
    autoPrecacheEnabled, setAutoPrecache, precacheImagesEnabled, setPrecacheImages,
    libraryEntries, precachedEntries,
    messagePrefix, addToLibrary, removeFromLibrary, clearAllOffline,
    handleLibraryMessage, networkFirst, staleWhileRevalidate, NAVIGATE_TIMEOUT_MS,
    networkLooksDown,
    OWN_CACHE_PREFIX, ownCacheNames, cacheUsage, purgeStaleCaches,
  };
`;

/**
 * 每個測試拿一組乾淨的快取，避免互相污染。
 *
 * opts.clients 是「目前開著的分頁網址」，guessLangPrefix 會讀它。
 * 回傳的 fetched 是這一輪實際抓過的網址，用來驗預快取只下了該下的那些。
 */
const load = (opts = {}) => {
  const caches = new FakeCacheStorage();
  const fetched = [];
  // 每次 fetch 的第二個參數。用來驗每一條都繞過瀏覽器自己的 HTTP 快取。
  const fetchInits = [];
  const net = { offline: !!opts.offline };
  // 真的 Response 有 clone()，networkFirst 存快取時會用到。headers 與 blob 是給
  // cacheUsage 量大小用的：線上多數項目有 content-length，少數沒有的走 blob。
  // opts.noContentLength 讓整輪的回應都不帶那個標頭，用來驗退路那一條。
  const bytesOf = (url) => (opts.responseBytes === undefined ? 1024 : opts.responseBytes);
  const makeResponse = (url, ok) => ({
    ok,
    url,
    headers: {
      get: (name) =>
        name.toLowerCase() === 'content-length' && !opts.noContentLength
          ? String(bytesOf(url))
          : null,
    },
    blob: async () => ({ size: bytesOf(url) }),
    clone: () => makeResponse(url, ok),
  });
  // 同時在飛的請求數。addToLibrary 並行之後，「真的有並行」與「沒有無上限地開」
  // 這兩件事都要驗得到，而從 fetched 的順序看不出來。
  const peak = { max: 0 };
  let inFlight = 0;
  const fetchStub = async (input, init) => {
    inFlight += 1;
    if (inFlight > peak.max) peak.max = inFlight;
    try {
      return await rawFetch(input, init);
    } finally {
      inFlight -= 1;
    }
  };
  const rawFetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    fetched.push(url);
    fetchInits.push(init);
    if (net.offline) throw new TypeError("Failed to fetch");
    // 「連得上但很慢」。networkFirst 的逾時要比這個短才有得比。
    if (opts.networkDelay) await new Promise((r) => setTimeout(r, opts.networkDelay));
    // 預快取會去讀索引，從裡面挑核心章節那幾頁的內文圖
    if (url.endsWith('offline-index.json')) {
      if ((opts.notFound || []).includes(url)) return makeResponse(url, false);
      if (opts.brokenIndex) {
        return Object.assign(makeResponse(url, true), {
          json: async () => { throw new SyntaxError('unexpected token'); },
        });
      }
      const index = opts.index || { sections: [] };
      return Object.assign(makeResponse(url, true), { json: async () => index });
    }
    return makeResponse(url, !(opts.notFound || []).includes(url));
  };
  const selfStub = {
    clients: {
      matchAll: async () => (opts.clients || []).map((url) => ({ url })),
    },
  };
  // onLine 不給就是 undefined，跟瀏覽器沒有回報一樣，networkLooksDown 只認 false
  const navigatorStub = {
    storage: { estimate: async () => ({ usage: 1024, quota: 4096 }) },
    onLine: opts.onLine,
  };
  // NAVIGATE_TIMEOUT_MS 那個 setTimeout 由外面給。fastTimeout 讓它立刻觸發，
  // 配上 networkDelay 就能在幾十毫秒內驗完「網路太慢」那條路。
  const setTimeoutStub = opts.fastTimeout ? (fn) => setTimeout(fn, 0) : setTimeout;
  const sw = new Function(
    'caches', 'SCOPE_PATH', 'fetch', 'self', 'navigator', 'setTimeout', harness
  )(caches, SCOPE_PATH, fetchStub, selfStub, navigatorStub, setTimeoutStub);
  return { sw, caches, fetched, fetchInits, net, peak };
};

const req = (pathname) => ({ url: ORIGIN + pathname });
const u = (pathname) => new URL(pathname, ORIGIN);

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('cacheKeyCandidates 補上另一種網址形狀', (load) => {
  const { sw } = load();
  assert.deepEqual(sw.cacheKeyCandidates('/docs/games/tor-network/play/'), [
    '/docs/games/tor-network/play/',
    '/docs/games/tor-network/play/index.html',
  ]);
  assert.deepEqual(sw.cacheKeyCandidates('/docs/games/tor-network/play/index.html'), [
    '/docs/games/tor-network/play/index.html',
    '/docs/games/tor-network/play/',
  ]);
  // 一般檔案沒有第二種形狀
  assert.deepEqual(sw.cacheKeyCandidates('/docs/games/vendor/three.core.min.js'), [
    '/docs/games/vendor/three.core.min.js',
  ]);
});

test('三個語系連出去的形狀都命中同一份預快取', async (load) => {
  const { sw, caches } = load();
  const precache = await caches.open('anoni-docs-precache-202601010000');
  await precache.put('/docs/games/tor-network/play/index.html', 'GLOBE');

  // zh-TW 的索引頁連目錄式網址
  assert.equal(await sw.matchCachedPage(req('/docs/games/tor-network/play/')), 'GLOBE');
  // en 與 zh-cn 連的是 index.html 加 ?lang=
  assert.equal(
    await sw.matchCachedPage(req('/docs/games/tor-network/play/index.html?lang=en')),
    'GLOBE'
  );
  assert.equal(
    await sw.matchCachedPage(req('/docs/games/tor-network/play/index.html?lang=zh-cn')),
    'GLOBE'
  );
  // 沒快取過的頁面仍然要 miss，才輪得到離線頁接手
  assert.equal(await sw.matchCachedPage(req('/docs/basics/metadata/')), undefined);
});

test('分享網址帶的參數不影響命中', async (load) => {
  const { sw, caches } = load();
  const pages = await caches.open('anoni-docs-pages');
  await pages.put('/docs/tools/what-is-tor/', 'TOR');
  assert.equal(
    await sw.matchCachedPage(req('/docs/tools/what-is-tor/?utm_source=mastodon')),
    'TOR'
  );
});

test('離線頁依語系前綴挑', (load) => {
  const { sw } = load();
  assert.equal(sw.offlinePathFor(u('/docs/tools/what-is-tor/')), '/docs/offline/');
  assert.equal(sw.offlinePathFor(u('/docs/en/tools/what-is-tor/')), '/docs/en/offline/');
  assert.equal(sw.offlinePathFor(u('/docs/zh-cn/tools/what-is-tor/')), '/docs/zh-cn/offline/');
});

test('作品在根路徑，離線頁改看 ?lang=', (load) => {
  const { sw } = load();
  assert.equal(
    sw.offlinePathFor(u('/docs/games/tor-network/play/index.html?lang=en')),
    '/docs/en/offline/'
  );
  assert.equal(
    sw.offlinePathFor(u('/docs/games/tor-network/play/index.html?lang=zh-cn')),
    '/docs/zh-cn/offline/'
  );
  // 沒帶 lang 就是 zh-TW
  assert.equal(sw.offlinePathFor(u('/docs/games/tor-network/play/')), '/docs/offline/');
});

test('路徑上的語系前綴比 query 優先', (load) => {
  const { sw } = load();
  // 前綴是站台建出來的，query 誰都能加。兩邊打架時信前綴。
  assert.equal(sw.offlinePathFor(u('/docs/en/tools/what-is-tor/?lang=zh-cn')), '/docs/en/offline/');
});

test('舊的帶版本快取搬進不帶版本的新快取', async (load) => {
  const { sw, caches } = load();
  const legacyPages = await caches.open('anoni-docs-pages-202601010000');
  await legacyPages.put('/docs/basics/metadata/', 'OLD-META');
  await legacyPages.put('/docs/tools/what-is-tor/', 'OLD-TOR');
  const legacyAssets = await caches.open('anoni-docs-assets-202601010000');
  await legacyAssets.put('/docs/assets/stylesheets/main.abc.min.css', 'OLD-CSS');

  // 新快取已經有的那一份比較新，不該被舊的蓋掉
  const pages = await caches.open(sw.RUNTIME_PAGES);
  await pages.put('/docs/basics/metadata/', 'NEW-META');

  await sw.migrateLegacyRuntime();

  const migratedPages = await caches.open(sw.RUNTIME_PAGES);
  assert.equal(await migratedPages.match('/docs/basics/metadata/'), 'NEW-META');
  assert.equal(await migratedPages.match('/docs/tools/what-is-tor/'), 'OLD-TOR');
  const assets = await caches.open(sw.RUNTIME_ASSETS);
  assert.equal(await assets.match('/docs/assets/stylesheets/main.abc.min.css'), 'OLD-CSS');
  // 搬完要刪掉，否則下一次 activate 的清除迴圈才刪，等於白搬
  assert.equal(await caches.has('anoni-docs-pages-202601010000'), false);
  assert.equal(await caches.has('anoni-docs-assets-202601010000'), false);
});

test('遷移不會把自己當成舊快取刪掉', async (load) => {
  const { sw, caches } = load();
  // RUNTIME_PAGES 是 anoni-docs-pages，舊的是 anoni-docs-pages-<版本>，
  // 名稱只差一個連字號，判斷寫鬆一點就會把讀者的離線內容整份刪掉
  const pages = await caches.open(sw.RUNTIME_PAGES);
  await pages.put('/docs/basics/metadata/', 'KEEP');
  await sw.migrateLegacyRuntime();
  assert.equal(await caches.has(sw.RUNTIME_PAGES), true);
  // 重新 open，不能拿上面那個參考來驗。整份被刪掉又重建成空的時，舊參考照樣
  // 讀得到內容，斷言會綠得很沒道理。
  const survived = await caches.open(sw.RUNTIME_PAGES);
  assert.equal(await survived.match('/docs/basics/metadata/'), 'KEEP');
});

test('語系前綴從網址判斷，scope 外回 null', (load) => {
  const { sw } = load();
  assert.equal(sw.langPrefixOf(u('/docs/tools/what-is-tor/')), '');
  assert.equal(sw.langPrefixOf(u('/docs/en/tools/what-is-tor/')), 'en/');
  assert.equal(sw.langPrefixOf(u('/docs/zh-cn/tools/what-is-tor/')), 'zh-cn/');
  // 作品在根路徑，語系在 query 裡
  assert.equal(sw.langPrefixOf(u('/docs/games/tor-network/play/?lang=en')), 'en/');
  assert.equal(sw.langPrefixOf(u('/docs/games/tor-network/play/')), '');
  // query 的值直接拿去組路徑會變成穿越漏洞，只認白名單裡的
  assert.equal(sw.langPrefixOf(u('/docs/games/tor-network/play/?lang=../../etc')), '');
  // scope 外
  assert.equal(sw.langPrefixOf(u('/send/')), null);
});

test('預快取清單只含指定語系，作品本體三語共用', (load) => {
  const { sw } = load();
  const zh = sw.precacheUrlsFor('');
  const en = sw.precacheUrlsFor('en/');

  assert.ok(zh.includes('/docs/tools/what-is-tor/'));
  assert.ok(!zh.some((url) => url.startsWith('/docs/en/')));
  assert.ok(!zh.some((url) => url.startsWith('/docs/zh-cn/')));

  assert.ok(en.includes('/docs/en/tools/what-is-tor/'));
  assert.ok(!en.includes('/docs/tools/what-is-tor/'));

  // 作品只建置一份在根路徑，兩個清單都指向同一批
  assert.ok(zh.includes('/docs/games/tor-network/play/index.html'));
  assert.ok(en.includes('/docs/games/tor-network/play/index.html'));
});

test('首次造訪只抓底線那批，不在讀者選語言之前下整個語系', async (load) => {
  // install 幾乎是註冊完就開跑，而底部那張語言卡片要等 DOM 與 script 跑完才浮出來。
  // 讀者按下「English」的那幾秒，網站已經在下 zh-TW 的四十幾頁了，接著又下一份 en。
  const { sw, fetched } = load({ clients: ['https://anoni.net/docs/'] });
  await sw.installPrecache();
  await sw.precacheOnNavigation('', false);

  assert.deepEqual(fetched.slice().sort(), sw.essentialUrlsFor('').slice().sort());
  assert.ok(!fetched.includes('/docs/tools/what-is-tor/'));
  assert.ok(fetched.length < sw.precacheUrlsFor('').length);
});

test('同一個語系導覽到第二頁才下整份', async (load) => {
  const { sw, fetched } = load({ clients: ['https://anoni.net/docs/'] });
  await sw.installPrecache();
  await sw.precacheOnNavigation('', false);
  fetched.length = 0;

  // 讀者點進第二頁，client 又送一次 PRECACHE_LANG
  await sw.precacheOnNavigation('', false);
  assert.ok(fetched.includes('/docs/tools/what-is-tor/'));
});

test('install 自己不算一次造訪，否則門檻等於不存在', async (load) => {
  // 首次造訪是 install 加上第一次導覽兩次呼叫。計數放在 precacheFor 裡的話，
  // 讀者還沒翻第二頁就湊滿了。
  const { sw, fetched } = load({ clients: ['https://anoni.net/docs/'] });
  await sw.installPrecache();
  await sw.precacheOnNavigation('', false);
  assert.ok(!fetched.includes('/docs/tools/what-is-tor/'));
});

test('讀者選過閱讀語言就不用再等第二頁', async (load) => {
  const { sw, fetched } = load({ clients: ['https://anoni.net/docs/'] });
  await sw.installPrecache();
  await sw.precacheOnNavigation('', true);
  assert.ok(fetched.includes('/docs/tools/what-is-tor/'));
});

test('造訪次數分語系算，換一個語系要重新累積', async (load) => {
  const { sw } = load();
  assert.equal(await sw.noteVisit(''), 1);
  assert.equal(await sw.noteVisit('en/'), 1);
  assert.equal(await sw.noteVisit(''), 2);
});

test('install 在新裝置上只補底線，在換版的裝置上照舊補完整', async (load) => {
  // 讀者按下更新之後 activate 會清掉舊的 PRECACHE。換版也只抓底線的話，他原本
  // 存著的四十幾頁要等再導覽兩次才回得來，中間斷網就什麼都沒有。
  const here = ['https://anoni.net/docs/guides/'];

  const fresh = load({ clients: here });
  assert.equal(await fresh.sw.installPrecache(), '');
  assert.ok(!fresh.fetched.includes('/docs/tools/what-is-tor/'));
  assert.deepEqual(fresh.fetched.slice().sort(), fresh.sw.essentialUrlsFor('').slice().sort());

  const upgrade = load({ clients: here });
  await (await upgrade.caches.open('anoni-docs-precache-202601010000')).put('/docs/', 'HOME');
  assert.equal(await upgrade.sw.hadFullPrecache(''), true);
  assert.equal(await upgrade.sw.installPrecache(), '');
  assert.ok(upgrade.fetched.includes('/docs/tools/what-is-tor/'));
});

test('只存過底線那批的裝置不算有完整章節', async (load) => {
  const { sw, caches } = load();
  const previous = await caches.open('anoni-docs-precache-202601010000');
  for (const url of sw.essentialUrlsFor('')) await previous.put(url, 'X');

  assert.equal(await sw.hadFullPrecache(''), false);
});

test('一次只抓一個語系的量', async (load) => {
  const { sw, fetched } = load();
  await sw.precacheFor('en/', true);
  const want = sw.precacheUrlsFor('en/');
  assert.ok(want.every((url) => fetched.includes(url)));
  // 內文圖預設不補，所以這一輪連 offline-index.json 都不會去讀
  assert.equal(fetched.length, want.length);
  assert.ok(
    fetched.every((url) => url.startsWith('/docs/en/') || url.startsWith('/docs/games/'))
  );
});

test('換語系時不重抓已經有的東西', async (load) => {
  const { sw, fetched } = load();
  await sw.precacheFor('', true);
  const firstRound = fetched.length;
  fetched.length = 0;

  await sw.precacheFor('en/', true);
  // 作品本體第一輪就抓過了，第二輪只補 en 自己那一份
  assert.ok(fetched.every((url) => url.startsWith('/docs/en/')));
  assert.ok(fetched.length < firstRound);
  assert.equal(
    fetched.length,
    sw.precacheUrlsFor('en/').filter((url) => url.startsWith('/docs/en/')).length
  );
});

test('install 從開著的分頁推語系', async (load) => {
  const guess = (clients) => load({ clients }).sw.guessLangPrefix();
  assert.equal(await guess(['https://anoni.net/docs/en/guides/']), 'en/');
  assert.equal(await guess(['https://anoni.net/docs/zh-cn/guides/']), 'zh-cn/');
  assert.equal(await guess(['https://anoni.net/docs/guides/']), '');
  // 一個站內分頁都找不到時回 null，install 據此決定先不抓，不要瞎猜一個語系下載
  assert.equal(await guess([]), null);
  assert.equal(await guess(['https://anoni.net/send/']), null);
  // scope 外的分頁不算數，往後找到第一個站內的
  assert.equal(await guess(['https://anoni.net/send/', 'https://anoni.net/docs/en/']), 'en/');
});

test('同一個語系不會在每次導覽都重跑一輪', async (load) => {
  const { sw, fetched } = load();
  await sw.precacheFor('en/', true);
  const first = fetched.length;
  assert.ok(first > 0);

  // client 每次頁面載入都會送 PRECACHE_LANG，這裡模擬連續幾次
  fetched.length = 0;
  await sw.precacheFor('en/', true);
  await sw.precacheFor('en/', true);
  assert.equal(fetched.length, 0);
});

test('每頁都載入的樣式與腳本跟著預快取一起存', async (load) => {
  // 2026-09-04 之前這批沒有人負責：建置端把每頁都出現的資產從個別頁面移除（讀者
  // 勾一頁不該揹一份 Vega），而 SHELL_ASSETS 那份手寫清單也沒收。讀者按了「全部存
  // 到裝置」，兩百多頁的 HTML 一頁不缺，離線打開是白的，因為 stylesheets/extra.css
  // 是 render-blocking 的。
  const { sw, fetched } = load({
    index: { shell: ['stylesheets/extra.css', 'js/analytics.js'], sections: [] },
  });
  await sw.precacheFor('', true);
  assert.ok(fetched.includes('/docs/stylesheets/extra.css'));
  assert.ok(fetched.includes('/docs/js/analytics.js'));
});

test('底線那批也要有樣式，離線閱讀頁進得來才看得到東西', async (load) => {
  // essential 是「連不上網也進得來管理頁」那批。少了每頁共用的樣式，進得來也是白的。
  const { sw, fetched } = load({
    index: { shell: ['stylesheets/extra.css'], sections: [] },
  });
  await sw.precacheFor('', false);
  assert.ok(fetched.includes('/docs/stylesheets/extra.css'));
});

test('shell 跟著語系走，跟頁面同一套路徑規則', async (load) => {
  const { sw, fetched } = load({
    index: { shell: ['stylesheets/extra.css'], sections: [] },
  });
  await sw.precacheFor('en/', false);
  assert.ok(fetched.includes('/docs/en/stylesheets/extra.css'));
  assert.ok(!fetched.includes('/docs/stylesheets/extra.css'));
});

test('索引沒有 shell 欄位時照樣跑完', async (load) => {
  // 舊版建置產出的索引沒有這個欄位，讀者的裝置上可能還留著一份
  const { sw, fetched } = load({ index: { sections: [] } });
  await sw.precacheFor('', false);
  assert.ok(fetched.includes('/docs/offline/'));
});

test('核心章節的內文圖跟著預快取一起下', async (load) => {
  // 預快取原本只抓 HTML，網站自動存的那四十幾頁離線打開全部缺圖。像「什麼是
  // Tor？」那種以圖解為主的頁面，少了圖等於沒有存。
  const { sw, fetched } = load({
    index: {
      sections: [
        {
          pages: [
            { url: 'tools/what-is-tor/', assets: ['assets/images/tor.webp'] },
            // 不在核心清單裡的那些不下，那是讀者自己去勾的
            { url: 'scenarios/journalist/', assets: ['assets/images/j.png'] },
          ],
        },
      ],
    },
  });

  // 預設不補。那批圖有七 MB，會讓自動下載從十一 MB 變成十八 MB。
  await sw.precacheFor('', true);
  assert.ok(!fetched.includes('/docs/assets/images/tor.webp'));

  // 讀者自己打開才補，而且只補核心章節那幾頁的
  await sw.setPrecacheImages(true);
  fetched.length = 0;
  await sw.precacheFor('', true);
  assert.ok(fetched.includes('/docs/assets/images/tor.webp'));
  assert.ok(!fetched.includes('/docs/assets/images/j.png'));
});

test('圖片開關切換之後，下一次導覽才照新設定重跑', async (load) => {
  // 那一輪已經補過的記錄不作廢的話，開關打開也不會有動靜
  const { sw, fetched } = load({
    index: { sections: [{ pages: [{ url: '', assets: ['assets/images/home.png'] }] }] },
  });
  await sw.precacheFor('', true);
  await sw.setPrecacheImages(true);
  fetched.length = 0;
  await sw.precacheFor('', true);
  assert.ok(fetched.includes('/docs/assets/images/home.png'));
});

test('清除連圖片開關也一起關掉', async (load) => {
  const { sw } = load();
  await sw.setPrecacheImages(true);
  await sw.clearAllOffline();
  assert.equal(await sw.precacheImagesEnabled(), false);
});

test('底線那批不補圖，關掉自動存的人只留得下離線閱讀頁本身', async (load) => {
  const { sw, fetched } = load({
    index: {
      sections: [{ pages: [{ url: '', assets: ['assets/images/home.png'] }] }],
    },
  });
  await sw.setPrecacheImages(true);
  await sw.precacheFor('', false);
  assert.ok(!fetched.includes('/docs/assets/images/home.png'));
});

test('索引抓不到就只是這一輪沒補圖，頁面照樣存得下來', async (load) => {
  const { sw, fetched } = load({ notFound: ['/docs/offline-index.json'] });
  await sw.setPrecacheImages(true);
  await sw.precacheFor('', true);
  assert.ok(fetched.includes('/docs/tools/what-is-tor/'));
});

test('索引內容壞掉也一樣，不會讓整批預快取跟著陣亡', async (load) => {
  const { sw, fetched } = load({ brokenIndex: true });
  await sw.setPrecacheImages(true);
  await sw.precacheFor('', true);
  assert.ok(fetched.includes('/docs/tools/what-is-tor/'));
});

test('個別頁面 404 不會讓整批預快取失敗', async (load) => {
  const missing = '/docs/zh-cn/tools/what-is-cryptpad/';
  const { sw, caches } = load({ notFound: [missing] });
  await sw.precacheFor('zh-cn/', true);
  const cache = await caches.open(sw.PRECACHE);
  assert.equal(await cache.match(missing), undefined);
  // 同一批的其他頁面照樣進快取
  assert.notEqual(await cache.match('/docs/zh-cn/tools/what-is-tor/'), undefined);
});

test('搬進來超過上限時會裁到上限', async (load) => {
  const { sw, caches } = load();
  const legacy = await caches.open('anoni-docs-pages-202601010000');
  for (let i = 0; i < sw.PAGES_MAX_ENTRIES + 10; i++) {
    await legacy.put(`/docs/p${i}/`, `P${i}`);
  }
  await sw.migrateLegacyRuntime();
  const pages = await caches.open(sw.RUNTIME_PAGES);
  assert.equal((await pages.keys()).length, sw.PAGES_MAX_ENTRIES);
});

test('自動預快取預設開著，關掉之後記得住', async (load) => {
  const { sw } = load();
  assert.equal(await sw.autoPrecacheEnabled(), true);
  await sw.setAutoPrecache(false);
  assert.equal(await sw.autoPrecacheEnabled(), false);
  await sw.setAutoPrecache(true);
  assert.equal(await sw.autoPrecacheEnabled(), true);
});

test('讀者勾選的頁面存進 library，回相對路徑', async (load) => {
  const { sw, caches, fetched } = load();
  await sw.addToLibrary('', ['scenarios/journalist/', 'scenarios/activist/'], [], false, () => {});

  assert.deepEqual(fetched, ['/docs/scenarios/journalist/', '/docs/scenarios/activist/']);
  assert.deepEqual((await sw.libraryEntries('')).sort(), [
    'scenarios/activist/',
    'scenarios/journalist/',
  ]);
  // 跟預設下載那批分開放，才不會被 runtime 的筆數上限擠掉
  const library = await caches.open(sw.LIBRARY);
  assert.notEqual(await library.match('/docs/scenarios/journalist/'), undefined);
});

test('已經存過的不重抓，refresh 才強制重來', async (load) => {
  const { sw, fetched } = load();
  await sw.addToLibrary('', ['scenarios/journalist/'], [], false, () => {});
  fetched.length = 0;

  await sw.addToLibrary('', ['scenarios/journalist/'], [], false, () => {});
  assert.deepEqual(fetched, []);

  await sw.addToLibrary('', ['scenarios/journalist/'], [], true, () => {});
  assert.deepEqual(fetched, ['/docs/scenarios/journalist/']);
});

test('下載過程逐頁回報進度', async (load) => {
  const { sw } = load();
  const seen = [];
  await sw.addToLibrary('', ['a/', 'b/', 'c/'], [], false, (data) => seen.push(data.done));
  // 整批可能要好幾分鐘，沒有進度讀者只會看到一個不動的按鈕
  assert.deepEqual(seen, [1, 2, 3]);
});

test('移除只動 library，數得出移掉幾頁', async (load) => {
  const { sw } = load();
  await sw.addToLibrary('', ['a/', 'b/'], [], false, () => {});
  const result = await sw.removeFromLibrary('', ['a/', 'never-stored/'], []);
  assert.equal(result.removed, 1);
  assert.deepEqual(await sw.libraryEntries(''), ['b/']);
});

test('頁面的資產存進另一個 cache，不會讓「你自己選存的 N 頁」虛胖', async (load) => {
  const { sw, caches } = load();
  await sw.addToLibrary('', ['tools/what-is-tor/'], ['assets/images/tor.webp'], false, () => {});

  assert.deepEqual(await sw.libraryEntries(''), ['tools/what-is-tor/']);
  const assets = await caches.open(sw.LIBRARY_ASSETS);
  assert.ok(await assets.match('/docs/assets/images/tor.webp'));
  const pages = await caches.open(sw.LIBRARY);
  assert.equal(await pages.match('/docs/assets/images/tor.webp'), undefined);
});

test('資產跟著語系走，跟頁面同一套路徑規則', async (load) => {
  const { sw, caches } = load();
  await sw.handleLibraryMessage(
    {
      type: 'OFFLINE_ADD',
      url: 'https://anoni.net/docs/en/offline/',
      paths: ['tools/what-is-tor/'],
      assets: ['assets/images/tor.webp'],
    },
    { postMessage: () => {} }
  );
  const assets = await caches.open(sw.LIBRARY_ASSETS);
  assert.ok(await assets.match('/docs/en/assets/images/tor.webp'));
  assert.equal(await assets.match('/docs/assets/images/tor.webp'), undefined);
});

test('進度把資產也算進去，讀者才知道還剩多少', async (load) => {
  const { sw } = load();
  const totals = [];
  await sw.addToLibrary('', ['a/', 'b/'], ['x.png', 'y.png', 'z.png'], false, (d) =>
    totals.push(d.total)
  );
  assert.deepEqual(totals, [5, 5, 5, 5, 5]);
});

test('整批下載並行跑，同時在飛的請求有上限', async (load) => {
  // 管理頁的「全部存到裝置」一次是四百多個請求。循序跑光是往返就要一分多鐘，而按下
  // 那顆的人正趕在上飛機或進到收不到訊號的地方之前，慢到那個地步等於沒解決問題。
  //
  // 上限也要守著。無上限地開會跟同一條連線上的其他請求互搶，慢的網路上整批更容易逾時。
  const { sw, peak } = load({ networkDelay: 5 });
  const pages = ['a/', 'b/', 'c/', 'd/', 'e/', 'f/', 'g/', 'h/', 'i/', 'j/'];
  await sw.addToLibrary('', pages, [], false, () => {});
  assert.ok(peak.max > 1, `同時在飛的最多 ${peak.max} 個，等於還是一個一個排隊`);
  assert.ok(peak.max <= 6, `同時在飛的到了 ${peak.max} 個，超過上限`);
});

test('頁面先抓完才抓資產，中途斷線至少有幾頁是完整的', async (load) => {
  const { sw, fetched } = load();
  await sw.addToLibrary('', ['a/', 'b/'], ['x.png'], false, () => {});
  assert.deepEqual(fetched, ['/docs/a/', '/docs/b/', '/docs/x.png']);
});

test('離線時拿得到自己存下來的資產', async (load) => {
  // 少了這一條，讀者勾的頁面離線打開會缺圖，互動類的頁面連跑都跑不起來
  const { sw, caches, net } = load();
  await sw.addToLibrary('', ['tools/what-is-tor/'], ['assets/images/tor.webp'], false, () => {});
  net.offline = true;
  assert.ok(await caches.match('/docs/assets/images/tor.webp'));
});

test('移除頁面時只刪管理頁挑過的那些資產', async (load) => {
  // 兩頁共用一張圖，移掉其中一頁不能把圖也刪了，另一頁會變破圖。
  // 哪些能刪由管理頁算（它才知道讀者手上還留著什麼），SW 照單執行。
  const { sw, caches } = load();
  await sw.addToLibrary('', ['a/', 'b/'], ['shared.png', 'only-a.png'], false, () => {});
  const result = await sw.removeFromLibrary('', ['a/'], ['only-a.png']);

  assert.equal(result.removed, 1, '回報的數字只算頁面');
  const assets = await caches.open(sw.LIBRARY_ASSETS);
  assert.ok(await assets.match('/docs/shared.png'), '別頁還要用的圖不該被刪');
  assert.equal(await assets.match('/docs/only-a.png'), undefined);
});

test('en 讀者勾的頁面存進 en 的路徑，不是 zh-TW 那一版', async (load) => {
  // offline-index.json 的網址相對於各語系自己的建置根目錄，en 版寫的是
  // scenarios/journalist/ 而不是 en/scenarios/journalist/。三個語系共用同一個 scope，
  // 前綴沒補回去的話 en 讀者勾一頁下來存到的是 zh-TW 那一版，離線時導覽到
  // /docs/en/scenarios/journalist/ 依然落空，而管理頁上那一列還顯示已存。
  const { sw, caches } = load();
  await sw.handleLibraryMessage(
    {
      type: 'OFFLINE_ADD',
      url: 'https://anoni.net/docs/en/offline/',
      paths: ['scenarios/journalist/'],
    },
    { postMessage: () => {} }
  );

  const library = await caches.open(sw.LIBRARY);
  assert.ok(await library.match('/docs/en/scenarios/journalist/'));
  assert.equal(await library.match('/docs/scenarios/journalist/'), undefined);
});

test('狀態只回當下語系存的，別的語系不混進來', async (load) => {
  const { sw } = load();
  await sw.addToLibrary('', ['scenarios/journalist/'], [], false, () => {});
  await sw.addToLibrary('en/', ['scenarios/activist/'], [], false, () => {});

  assert.deepEqual(await sw.libraryEntries(''), ['scenarios/journalist/']);
  assert.deepEqual(await sw.libraryEntries('en/'), ['scenarios/activist/']);
});

test('移除也照語系走，不會誤刪另一個語系的同名頁', async (load) => {
  const { sw } = load();
  await sw.addToLibrary('', ['scenarios/journalist/'], [], false, () => {});
  await sw.addToLibrary('en/', ['scenarios/journalist/'], [], false, () => {});

  assert.equal((await sw.removeFromLibrary('en/', ['scenarios/journalist/'], [])).removed, 1);
  assert.deepEqual(await sw.libraryEntries(''), ['scenarios/journalist/']);
  assert.deepEqual(await sw.libraryEntries('en/'), []);
});

test('網站自動存的回實際在裝置上的，不是那份硬編清單', async (load) => {
  // 原本直接回 CORE_PAGES_BY_PREFIX，那是「打算要下載的」。讀者關掉自動下載或按過
  // 清除之後，管理頁照樣顯示幾十頁已存，而且那些頁的勾選框是停用的，想自己補存
  // 也按不動。管理頁把這份清單當成「哪些頁點得開」用，謊報就是給出打不開的連結。
  const { sw } = load();
  await sw.setAutoPrecache(false);
  await sw.precacheFor('');

  const essential = await sw.precachedEntries('');
  assert.ok(essential.includes('offline/'));
  assert.ok(!essential.includes('tools/what-is-tor/'));

  await sw.setAutoPrecache(true);
  await sw.precacheFor('', true);
  assert.ok((await sw.precachedEntries('')).includes('tools/what-is-tor/'));
});

test('舊版管理頁不帶網址時退回根路徑，zh-TW 讀者不受影響', async (load) => {
  // 管理頁的 js 是預快取的一部分，讀者按下更新之前用的還是舊版，那一版只有
  // OFFLINE_STATUS 帶網址。收不到就當根路徑，跟補這段之前的行為一樣。
  const { sw } = load();
  assert.equal(sw.messagePrefix({ type: 'OFFLINE_ADD', paths: [] }), '');
  assert.equal(sw.messagePrefix({ url: 'https://anoni.net/docs/offline/' }), '');
  assert.equal(sw.messagePrefix({ url: 'https://anoni.net/docs/en/offline/' }), 'en/');
  assert.equal(sw.messagePrefix({ url: 'https://anoni.net/docs/zh-cn/offline/' }), 'zh-cn/');
});

test('清除會清光所有快取，並把自動預快取關掉', async (load) => {
  const { sw, caches } = load();
  await sw.precacheFor('', true);
  await sw.addToLibrary('', ['scenarios/journalist/'], [], false, () => {});
  const pages = await caches.open(sw.RUNTIME_PAGES);
  await pages.put('/docs/basics/metadata/', 'VISITED');

  await sw.clearAllOffline();

  assert.deepEqual(await sw.libraryEntries(''), []);
  assert.equal((await (await caches.open(sw.PRECACHE)).keys()).length, 0);
  assert.equal((await (await caches.open(sw.RUNTIME_PAGES)).keys()).length, 0);
  // 按這顆的人多半是因為裝置可能被檢查。下次導覽又自動下載回來的話這顆等於沒作用
  assert.equal(await sw.autoPrecacheEnabled(), false);
});

test('清除之後只補離線提示頁那一批，章節不會整包抓回來', async (load) => {
  const { sw, fetched } = load();
  await sw.clearAllOffline();
  fetched.length = 0;

  // 模擬下一次導覽送 PRECACHE_LANG 過來
  await sw.precacheFor('');
  assert.deepEqual(fetched.slice().sort(), sw.essentialUrlsFor('').slice().sort());
  assert.ok(fetched.length < sw.precacheUrlsFor('').length);
  assert.ok(!fetched.includes('/docs/tools/what-is-tor/'));

  // 讀者自己在管理頁把開關打開才恢復完整
  await sw.setAutoPrecache(true);
  fetched.length = 0;
  await sw.precacheFor('', true);
  assert.ok(fetched.includes('/docs/tools/what-is-tor/'));
});

test('清除過的裝置離線時仍看得到離線提示頁', async (load) => {
  // 這一批底線存在的理由。少了它，沒快取過的網址在離線時會一路走到 networkFirst
  // 最後的 throw，讀者看到的是瀏覽器自己的網路錯誤畫面，不是站台的說明，而那一頁
  // 正好就是離線內容管理頁，想清東西的人往往正好連不上網。
  const { sw, net } = load();
  await sw.clearAllOffline();
  await sw.precacheFor('');
  net.offline = true;

  const response = await sw.networkFirst(req('/docs/tools/what-is-tor/'), null);
  assert.equal(response.url, '/docs/offline/');
});

test('關掉自動存之後，離線提示頁照樣留著', async (load) => {
  const { sw, net } = load();
  await sw.setAutoPrecache(false);
  await sw.precacheFor('');
  net.offline = true;

  assert.equal((await sw.networkFirst(req('/docs/basics/metadata/'), null)).url, '/docs/offline/');
});

test('狀態查詢回得出已存的、網站存的與空間用量', async (load) => {
  const { sw } = load();
  await sw.precacheFor('', true);
  await sw.addToLibrary('', ['scenarios/journalist/'], [], false, () => {});

  const replies = [];
  await sw.handleLibraryMessage(
    { type: 'OFFLINE_STATUS', url: 'https://anoni.net/docs/offline/' },
    { postMessage: (data) => replies.push(data) }
  );

  assert.equal(replies.length, 1);
  const status = replies[0];
  assert.equal(status.type, 'status');
  assert.deepEqual(status.saved, ['scenarios/journalist/']);
  // 網站預設存的只回頁面，app shell 與作品本體混進去只會讓數字虛胖
  assert.ok(status.precached.includes('tools/what-is-tor/'));
  assert.ok(!status.precached.some((path) => path.startsWith('assets/')));
  assert.ok(!status.precached.some((path) => path.startsWith('games/onion-routing/')));
  assert.equal(status.autoPrecache, true);
  assert.equal(status.estimate.usage, 1024);
});

test('狀態查詢依網址挑對語系的預設清單', async (load) => {
  const { sw } = load();
  await sw.precacheFor('en/', true);
  const replies = [];
  await sw.handleLibraryMessage(
    { type: 'OFFLINE_STATUS', url: 'https://anoni.net/docs/en/offline/' },
    { postMessage: (data) => replies.push(data) }
  );
  // en 的章節路徑跟 zh 不同（在地脈絡叫 regional/ 不叫 taiwan/）
  assert.ok(replies[0].precached.includes('regional/ooni-checklist/'));
  assert.ok(!replies[0].precached.includes('taiwan/ooni-checklist/'));
});

test('認不得的指令會回錯誤，不會靜靜沒反應', async (load) => {
  const { sw } = load();
  const replies = [];
  await sw.handleLibraryMessage({ type: 'NOPE' }, { postMessage: (d) => replies.push(d) });
  assert.equal(replies[0].type, 'error');
});

test('navigator.onLine 說沒有網路時直接給快取，不等那一輪逾時', async (load) => {
  // 讀者切到飛航模式之後每翻一頁都停一下，而裝置上四百多頁一頁不缺。onLine 回
  // false 是可信的（回 true 才不可信），拿來省掉那一輪等待剛好。
  //
  // networkDelay 比逾時短，少了這一條就會拿到網路那份，測得出差別。
  const { sw, caches, fetched } = load({ onLine: false, networkDelay: 200 });
  const pages = await caches.open(sw.RUNTIME_PAGES);
  await pages.put('/docs/tools/what-is-tor/', 'CACHED');

  assert.equal(await sw.networkFirst(req('/docs/tools/what-is-tor/'), null), 'CACHED');
  // 網路那條照樣發出去。它成功的話下一次導覽就是新的，讀者不必自己按什麼。
  assert.ok(fetched.includes(ORIGIN + '/docs/tools/what-is-tor/'), '背景那條沒有發出去');
});

test('等不到網路就記下來，下一頁不必重等一遍', async (load) => {
  // 連得上但出不去的網路（飛航模式底下 Wi-Fi 還開著、機上 Wi-Fi 沒買方案、公共
  // 熱點把流量攔在登入頁）下，navigator.onLine 回的是 true，每翻一頁都要陪著等
  // 滿逾時。四百多頁存在裝置上卻頁頁卡住，那是這個功能最沒有道理的失敗方式。
  const { sw, caches } = load({ networkDelay: 60, fastTimeout: true });
  const pages = await caches.open(sw.RUNTIME_PAGES);
  await pages.put('/docs/tools/what-is-tor/', 'CACHED');

  assert.equal(sw.networkLooksDown(), false);
  assert.equal(await sw.networkFirst(req('/docs/tools/what-is-tor/'), null), 'CACHED');
  assert.equal(sw.networkLooksDown(), true, '沒記下來的話，下一頁又要從頭等一次');
});

test('網路回來就把離線狀態清掉，讀者不必自己按什麼', async (load) => {
  const { sw, caches } = load({ networkDelay: 30, fastTimeout: true });
  const pages = await caches.open(sw.RUNTIME_PAGES);
  await pages.put('/docs/tools/what-is-tor/', 'CACHED');
  await sw.networkFirst(req('/docs/tools/what-is-tor/'), null);
  assert.equal(sw.networkLooksDown(), true);

  // 背景那條慢了一步，回來的時候網路其實是通的
  await new Promise((resolve) => setTimeout(resolve, 80));
  assert.equal(sw.networkLooksDown(), false, '網路回來了還當成離線，讀者會一直看到舊的');
});

test('沒有 query 的導覽不走 ignoreSearch 的線性掃描', async (load) => {
  // ignoreSearch 會讓 Cache Storage 放棄索引、掃過每一筆。存了四百多頁的裝置上
  // 每翻一頁掃兩輪，累積起來就是讀者說的那種停頓。站上絕大多數網址沒有 query。
  const { sw, caches } = load();
  const pages = await caches.open(sw.RUNTIME_PAGES);
  await pages.put('/docs/tools/what-is-tor/', 'CACHED');

  assert.equal(await sw.matchCachedPage(req('/docs/tools/what-is-tor/')), 'CACHED');
  assert.equal(caches.ignoreSearchCalls, 0, '沒有 query 也走了線性掃描');
});

test('精確那輪沒中就退回 ignoreSearch，帶 query 存下的照樣找得到', async (load) => {
  // 讀者從 /docs/x/?utm=... 之類的網址進來時，RUNTIME_PAGES 存下的就是那個形狀。
  // 下一次他從乾淨的網址進來，精確比對對不上，這時候線性掃描是唯一找得到的路。
  const { sw, caches } = load();
  const pages = await caches.open(sw.RUNTIME_PAGES);
  await pages.put(ORIGIN + '/docs/tools/what-is-tor/?utm_source=x', 'CACHED');

  assert.equal(await sw.matchCachedPage(req('/docs/tools/what-is-tor/')), 'CACHED');
  assert.ok(caches.ignoreSearchCalls > 0, '精確沒中卻沒有退回線性掃描');
});

test('網路太慢時先給裝置上那一份，不陪著等到瀏覽器放棄', async (load) => {
  // 完全斷線時 fetch 立刻失敗，逾時用不到。這條是為了「連得上但很慢」與「連線被
  // 干擾」那種狀態，而那正是這個網站的讀者比別人更常遇到的網路。
  const { sw, caches } = load({ networkDelay: 40, fastTimeout: true });
  const pages = await caches.open(sw.RUNTIME_PAGES);
  await pages.put('/docs/tools/what-is-tor/', 'CACHED');

  assert.equal(await sw.networkFirst(req('/docs/tools/what-is-tor/'), null), 'CACHED');
});

test('網路來得及就用網路那份，不會拿舊的給讀者', async (load) => {
  const { sw, caches } = load();
  const pages = await caches.open(sw.RUNTIME_PAGES);
  await pages.put('/docs/tools/what-is-tor/', 'STALE');

  const response = await sw.networkFirst(req('/docs/tools/what-is-tor/'), null);
  assert.notEqual(response, 'STALE');
  assert.equal(response.url, ORIGIN + '/docs/tools/what-is-tor/');
});

test('先給舊的之後，網路那份回來照樣寫進快取', async (load) => {
  // 逾時只是不讓讀者等，不是放棄這次更新。下一次導覽要拿到新的。
  const { sw, caches } = load({ networkDelay: 40, fastTimeout: true });
  const pages = await caches.open(sw.RUNTIME_PAGES);
  await pages.put('/docs/tools/what-is-tor/', 'CACHED');

  assert.equal(await sw.networkFirst(req('/docs/tools/what-is-tor/'), null), 'CACHED');
  await new Promise((resolve) => setTimeout(resolve, 120));
  assert.notEqual(await pages.match('/docs/tools/what-is-tor/'), 'CACHED');
});

test('逾時之後把網路那條掛在 waitUntil 上，SW 才活得到它回來', async (load) => {
  // 少了這一步，SW 有機會在網路那份回來之前就被瀏覽器終止，快取永遠停在舊的。
  const { sw, caches } = load({ networkDelay: 40, fastTimeout: true });
  const pages = await caches.open(sw.RUNTIME_PAGES);
  await pages.put('/docs/tools/what-is-tor/', 'CACHED');

  const kept = [];
  const event = { waitUntil: (promise) => kept.push(promise) };
  assert.equal(await sw.networkFirst(req('/docs/tools/what-is-tor/'), event), 'CACHED');
  assert.equal(kept.length, 1);
  await Promise.all(kept);
});

test('裝置上沒有的頁面照樣等網路，只是慢就等得到', async (load) => {
  // 快取裡什麼都沒有時早早放棄只會把讀者丟到落腳頁，而網路其實只是慢，
  // 再等一下就回來了。這裡不開 fastTimeout，走的是真的八秒上限。
  const { sw } = load({ networkDelay: 40 });
  const response = await sw.networkFirst(req('/docs/tools/what-is-tor/'), null);
  assert.equal(response.url, ORIGIN + '/docs/tools/what-is-tor/');
});

test('裝置上沒有的頁面等網路也有上限，一直不回來就給落腳頁', async (load) => {
  // 2026-09-04 的第二輪。讀者的裝置上有整套 zh-TW，en 一頁都沒有，在 en 底下離線
  // 冷啟動就落到這條路。原本是 await network，而連得上但沒有回應的網路不會讓 fetch
  // 失敗，它就是一直不回來，讀者看到的是四十五秒還在空白的畫面。
  const { sw, caches } = load({ networkDelay: 5000, fastTimeout: true });
  const precache = await caches.open(sw.PRECACHE);
  await precache.put('/docs/en/offline/', 'EN-OFFLINE');
  const response = await sw.networkFirst(req('/docs/en/tools/what-is-tor/'), null);
  assert.equal(response, 'EN-OFFLINE');
});

test('這個語系的落腳頁不在裝置上時，給別的語系那一份', async (load) => {
  // install 只補當下猜到的那一個語系，而換版時 activate 會清掉舊的預快取，所以
  // 「讀者用 en，裝置上只剩 zh-TW 的落腳頁」是真的會發生的狀態。看得懂與看不懂
  // 之間還有一個選項，總比瀏覽器的錯誤畫面好。
  const { sw, caches } = load({ offline: true });
  const precache = await caches.open(sw.PRECACHE);
  await precache.put('/docs/offline/', 'ZH-OFFLINE');
  assert.equal(await sw.offlineFallback(u('/docs/en/basics/')), 'ZH-OFFLINE');
  assert.equal(await sw.offlineFallback(u('/docs/zh-cn/basics/')), 'ZH-OFFLINE');

  // 自己那一份在的時候照樣優先
  await precache.put('/docs/en/offline/', 'EN-OFFLINE');
  assert.equal(await sw.offlineFallback(u('/docs/en/basics/')), 'EN-OFFLINE');
});

test('離線時沒快取過的頁面會落到離線頁', async (load) => {
  const { sw, caches } = load({ offline: true });
  const precache = await caches.open(sw.PRECACHE);
  await precache.put('/docs/offline/', 'ZH-OFFLINE');

  const response = await sw.networkFirst(req('/docs/basics/metadata/'), null);
  // 走到這裡代表 networkFirst 沒有把錯誤往外丟。丟出去的話 respondWith 會 reject，
  // 讀者看到的是瀏覽器自己的網路錯誤畫面，站台的離線頁等於白做。
  assert.equal(response, 'ZH-OFFLINE');
});

test('離線時快取過的頁面直接回快取，不落到離線頁', async (load) => {
  const { sw, caches } = load({ offline: true });
  const precache = await caches.open(sw.PRECACHE);
  await precache.put('/docs/offline/', 'ZH-OFFLINE');
  await precache.put('/docs/tools/what-is-tor/', 'TOR');

  assert.equal(await sw.networkFirst(req('/docs/tools/what-is-tor/'), null), 'TOR');
});

test('離線時各語系落到自己的離線頁', async (load) => {
  const { sw, caches } = load({ offline: true });
  const precache = await caches.open(sw.PRECACHE);
  await precache.put('/docs/offline/', 'ZH-OFFLINE');
  await precache.put('/docs/en/offline/', 'EN-OFFLINE');

  assert.equal(await sw.networkFirst(req('/docs/en/basics/metadata/'), null), 'EN-OFFLINE');
  assert.equal(await sw.networkFirst(req('/docs/basics/metadata/'), null), 'ZH-OFFLINE');
});

test('連落腳頁都沒有時給明確的網路錯誤，不停在空白', async (load) => {
  // 原本是把錯誤往外丟，respondWith 收到 reject 一樣是瀏覽器的錯誤畫面。改成回
  // Response.error() 的差別在意圖說得清楚，而且不會再有人以為這裡該繼續等網路。
  const { sw } = load({ offline: true });
  const response = await sw.networkFirst(req('/docs/basics/metadata/'), null);
  assert.equal(response.type, 'error');
});

test('install 把讀者用過的其他語系的落腳頁一起補回來', async (load) => {
  // 換版時 activate 清掉舊的預快取，install 只補當下猜到的那一個語系的話，讀者
  // 昨天讀的 en 就沒有落腳頁也沒有樣式了。補的是底線那批，不是整份章節。
  //
  // 三個語系一視同仁。這裡兩個都記，避免哪天有人只照 en 想事情，zh-cn 的讀者
  // 遇到同一件事卻沒有測試擋著。
  const { sw, fetched } = load({ clients: ['https://anoni.net/docs/'] });
  await sw.noteVisit('en/');
  await sw.noteVisit('zh-cn/');
  fetched.length = 0;
  await sw.installPrecache();
  assert.ok(fetched.includes('/docs/en/offline/'), 'en 的落腳頁沒有補回來');
  assert.ok(fetched.includes('/docs/zh-cn/offline/'), 'zh-cn 的落腳頁沒有補回來');
  assert.ok(fetched.includes('/docs/offline/'), 'zh-TW 自己那份也要有');
  // 完整章節仍然只跟著當下這一個語系，切過一次語言不該讓裝置上多出十 MB
  assert.ok(!fetched.includes('/docs/en/basics/threat-model/'));
  assert.ok(!fetched.includes('/docs/zh-cn/basics/threat-model/'));
});

test('選過閱讀語言的讀者也會留下造訪紀錄', async (load) => {
  // 原本 settled 為真時會短路掉 noteVisit，那些讀者在這台裝置上從來不留紀錄，
  // 而換版時要靠它才知道有哪些語系該保住落腳頁
  const { sw } = load();
  await sw.precacheOnNavigation('en/', true);
  assert.deepEqual(await sw.visitedPrefixes(), ['en/']);
});

// === 裝置佔用量 ===
//
// 管理頁上那行「本站在這台裝置上佔用」原本讀 navigator.storage.estimate().usage。
// 那個數字算的是整個 origin，而且跟 caches.delete() 之間有落差：實測按下「清除所有
// 離線內容」之後它要四十幾秒才跟上，讀者看到的是按之前的數字，合理的結論是沒清掉。

test('佔用量只算自己的快取，同一個 origin 上別人的不算', async (load) => {
  const { sw, caches } = load({ responseBytes: 500 });
  await sw.precacheFor('', false);
  const mine = (await (await caches.open(sw.PRECACHE)).keys()).length;

  const stranger = await caches.open('someone-elses-cache');
  await stranger.put('/whatever', { headers: { get: () => '999999' } });

  assert.equal(await sw.cacheUsage(), mine * 500);
});

test('佔用量沒有 content-length 時把 body 讀出來量', async (load) => {
  const { sw, caches } = load({ responseBytes: 300, noContentLength: true });
  await sw.precacheFor('', false);
  const n = (await (await caches.open(sw.PRECACHE)).keys()).length;
  assert.ok(n > 0);
  assert.equal(await sw.cacheUsage(), n * 300);
});

test('清除之後佔用量立刻歸零，不必等瀏覽器回收', async (load) => {
  const { sw } = load({ responseBytes: 4096 });
  await sw.precacheFor('', true);
  await sw.addToLibrary('', ['scenarios/journalist/'], ['assets/x.png'], false, () => {});
  assert.ok((await sw.cacheUsage()) > 0);

  await sw.clearAllOffline();

  // 剩下的只有 clearAllOffline 自己寫回去的兩筆設定，各是三個 byte 的 "off"。
  // 管理頁的 size() 以 KB 為單位四捨五入，讀者看到的是「佔用 0 KB」。
  const left = await sw.cacheUsage();
  assert.ok(left < 1024, `清完應該不到 1 KB，實際 ${left}`);
});

test('清除不動同一個 origin 上別人的快取', async (load) => {
  const { sw, caches } = load();
  await (await caches.open('anoni-site-shell')).put('/index.html', 'HOME');

  await sw.clearAllOffline();

  // 事後重新 open，不沿用先前那個物件。假的 Cache Storage 刪掉的是名字，
  // 先前拿到的參照還握著同一份資料，拿它來斷言等於什麼都沒驗到。
  assert.equal(await caches.has('anoni-site-shell'), true);
  assert.equal(await (await caches.open('anoni-site-shell')).match('/index.html'), 'HOME');
});

test('狀態回覆帶著佔用量', async (load) => {
  const { sw } = load({ responseBytes: 2048 });
  await sw.precacheFor('', false);
  const sent = [];
  await sw.handleLibraryMessage(
    { type: 'OFFLINE_STATUS', url: 'https://anoni.net/docs/offline/' },
    { postMessage: (m) => sent.push(m) }
  );
  assert.equal(sent.length, 1);
  assert.equal(typeof sent[0].usage, 'number');
  assert.ok(sent[0].usage > 0);
  assert.equal(sent[0].usage, await sw.cacheUsage());
});

// === 讀過的頁面要不要留在裝置上 ===
//
// runtime 快取原本無條件寫。讀者按了「清除所有離線內容」之後每讀一頁就又被存回去
// 一頁，上限 120 頁加 200 個資產，而管理頁只說會補回 0.5 MB。按那顆的人多半是因為
// 裝置可能被檢查，說了不留就不該留。

test('自動存下內容開著時，讀過的頁面留在裝置上', async (load) => {
  const { sw, caches } = load();
  await sw.networkFirst(req('/docs/basics/metadata/'), null);
  const pages = await caches.open(sw.RUNTIME_PAGES);
  assert.ok(await pages.match('/docs/basics/metadata/'));
});

test('自動存下內容關掉之後，讀過的頁面不留在裝置上', async (load) => {
  const { sw, caches } = load();
  await sw.setAutoPrecache(false);

  const response = await sw.networkFirst(req('/docs/basics/metadata/'), null);

  // 頁面照樣送到讀者眼前，只是不寫進快取
  assert.ok(response.ok);
  const pages = await caches.open(sw.RUNTIME_PAGES);
  assert.equal(await pages.match('/docs/basics/metadata/'), undefined);
});

test('離線時快取沒有的資產直接收尾，頁面才畫得完', async (load) => {
  // 冷啟動的第一個導覽已經把網路判成斷的，接下來每個快取沒有的資產都不必再等。
  // 少了這一條，render-blocking 的樣式會一直掛著，讀者看到的是一片空白。實測在
  // 連得上但沒有回應的網路底下，四十五秒還沒有任何內容。
  const { sw } = load({ onLine: false, networkDelay: 200 });
  const started = Date.now();
  const response = await sw.staleWhileRevalidate(req('/docs/stylesheets/extra.css'), null);
  assert.equal(response.status, 504);
  assert.ok(Date.now() - started < 100, '離線時還在等網路');
});

test('資產等網路有上限，逾時之後給明確的失敗', async (load) => {
  // 回 undefined 的話規格上是 network error，Gecko 還會在主控台印一行
  // 「resolved with non-Response value」，而頁面停在載入中
  const { sw } = load({ networkDelay: 200, fastTimeout: true });
  const response = await sw.staleWhileRevalidate(req('/docs/stylesheets/extra.css'), null);
  assert.equal(response.status, 504);
});

test('資產在裝置上有一份就先給，不受逾時影響', async (load) => {
  const { sw, caches } = load({ networkDelay: 200, fastTimeout: true });
  const assets = await caches.open(sw.RUNTIME_ASSETS);
  await assets.put('/docs/stylesheets/extra.css', 'CSS');
  const response = await sw.staleWhileRevalidate(req('/docs/stylesheets/extra.css'), null);
  assert.equal(response, 'CSS');
});

test('資產抓成功就把離線狀態清掉，讀者接回網路不必自己處理', async (load) => {
  const { sw } = load({ networkDelay: 5, fastTimeout: true });
  await sw.staleWhileRevalidate(req('/docs/stylesheets/extra.css'), null);
  assert.equal(sw.networkLooksDown(), true);
  // 網路那條照樣在背景跑完，它成功就把狀態清掉
  await new Promise((resolve) => setTimeout(resolve, 40));
  assert.equal(sw.networkLooksDown(), false);
});

test('圖與樣式跟著同一個開關，關掉就不留', async (load) => {
  const { sw, caches } = load();
  await sw.staleWhileRevalidate(req('/docs/assets/logo.png'), null);
  const assets = await caches.open(sw.RUNTIME_ASSETS);
  assert.ok(await assets.match('/docs/assets/logo.png'));

  await sw.setAutoPrecache(false);
  await sw.staleWhileRevalidate(req('/docs/assets/other.png'), null);
  assert.equal(await assets.match('/docs/assets/other.png'), undefined);
});

test('清除之後讀過的頁面也不留，直到讀者自己打開開關', async (load) => {
  const { sw, caches } = load();
  await sw.clearAllOffline();
  await sw.networkFirst(req('/docs/basics/metadata/'), null);
  const pages = await caches.open(sw.RUNTIME_PAGES);
  assert.equal(await pages.match('/docs/basics/metadata/'), undefined);

  await sw.setAutoPrecache(true);
  await sw.networkFirst(req('/docs/basics/metadata/'), null);
  assert.ok(await pages.match('/docs/basics/metadata/'));
});

test('設定改了記憶體那份也跟著改', async (load) => {
  // fetch handler 每一個請求都要問一次這個設定，所以在 SW 這輪生命週期內記著。
  // 忘了作廢的話讀者關掉開關之後，同一輪還是照存不誤。
  const { sw } = load();
  assert.equal(await sw.autoPrecacheEnabled(), true);
  await sw.setAutoPrecache(false);
  assert.equal(await sw.autoPrecacheEnabled(), false);
  await sw.setAutoPrecache(true);
  assert.equal(await sw.autoPrecacheEnabled(), true);
});

// === 換版時清哪些快取 ===

test('換版留下讀者自己勾的頁面，連同那些頁面的圖與程式', async (load) => {
  // LIBRARY_ASSETS 原本不在保留名單裡，每次部署都被清掉。頁面還在，離線打開卻
  // 沒有樣式也沒有圖，而下一次部署又會再發生一次。
  const { sw, caches } = load();
  await sw.addToLibrary('', ['scenarios/journalist/'], ['assets/photo.png'], false, () => {});

  await sw.purgeStaleCaches();

  assert.deepEqual(await sw.libraryEntries(''), ['scenarios/journalist/']);
  const assets = await caches.open(sw.LIBRARY_ASSETS);
  assert.ok(await assets.match('/docs/assets/photo.png'));
});

test('換版清掉上一版的預快取，設定與 runtime 快取留著', async (load) => {
  const { sw, caches } = load();
  const stale = await caches.open('anoni-docs-precache-200001010000');
  await stale.put('/docs/old/', 'OLD');
  await sw.setAutoPrecache(false);
  await (await caches.open(sw.RUNTIME_PAGES)).put('/docs/basics/metadata/', 'VISITED');

  await sw.purgeStaleCaches();

  assert.equal(await caches.has('anoni-docs-precache-200001010000'), false);
  assert.equal(await sw.autoPrecacheEnabled(), false);
  assert.equal(await (await caches.open(sw.RUNTIME_PAGES)).match('/docs/basics/metadata/'), 'VISITED');
});

test('換版不動同一個 origin 上別人的快取', async (load) => {
  const { sw, caches } = load();
  await (await caches.open('anoni-site-shell')).put('/index.html', 'HOME');

  await sw.purgeStaleCaches();

  assert.equal(await caches.has('anoni-site-shell'), true);
  assert.equal(await (await caches.open('anoni-site-shell')).match('/index.html'), 'HOME');
});

test('每一條網路請求都繞過瀏覽器自己的 HTTP 快取', async (load) => {
  // 少了 cache 選項的 fetch 會先問裝置上的 HTTP 快取，命中就不出門，network-first
  // 拿回來的是舊副本。2026-08-28 的實例是 Cloudflare 一條 browser_ttl 為
  // override_origin 的 Cache Rule 把 HTML 設成 max-age=14400，新發布的內容有四小時
  // 進不了 standalone 的 PWA，而同一個人用 Safari 分頁看就是新的，因為那邊的
  // cache mode 是 reload。
  //
  // 這一條守著 sw.js 裡每一個 fetch。少掉任何一個的 no-cache，症狀都是讀者拿不到
  // 剛發布的內容，而那在瀏覽器上點來點去看不出來。
  const { sw, fetchInits } = load({ clients: ['https://anoni.net/docs/'] });
  await sw.setPrecacheImages(true);
  await sw.installPrecache();
  await sw.precacheOnNavigation('', true);
  await sw.corePageAssets('');
  await sw.networkFirst(req('/docs/basics/threat-model/'));
  await sw.staleWhileRevalidate(req('/docs/assets/images/logo-white.svg'));
  await sw.addToLibrary('', ['taiwan/'], ['assets/images/logo-white.svg'], true, () => {});

  assert.ok(fetchInits.length > 0, '這一輪一個 fetch 都沒發出去，測試本身沒驗到東西');
  for (const init of fetchInits) {
    assert.equal(init && init.cache, 'no-cache');
  }
});

for (const [name, fn] of tests) {
  try {
    await fn(load);
    passed++;
    console.log('  ✓ ' + name);
  } catch (err) {
    failed++;
    console.error('  ✗ ' + name);
    console.error('    ' + String(err.message).split('\n').join('\n    '));
  }
}

console.log(`\n${passed} 通過，${failed} 失敗`);
process.exit(failed ? 1 : 0);
