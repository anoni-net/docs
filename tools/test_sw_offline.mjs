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
    for (const cache of this.named.values()) {
      const hit = await cache.match(request, opts);
      if (hit) return hit;
    }
    return undefined;
  }
}

const harness = `
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
  ${grab(/^const precachedPrefixes = .*$/m)}
  ${grab(/^const VISITS_URL = .*$/m)}
  ${grab(/^async function noteVisit\(prefix\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function hadFullPrecache\(prefix\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function precacheFor\(prefix, wantFull\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function precacheOnNavigation\(prefix, settled\) \{[\s\S]*?\n\}/m)}
  ${grab(/^function langPrefixOf\(url\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function guessLangPrefix\(\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function installPrecache\(\) \{[\s\S]*?\n\}/m)}
  ${grab(/^const LIBRARY = .*$/m)}
  ${grab(/^const SETTINGS = .*$/m)}
  ${grab(/^const AUTO_PRECACHE_URL = .*$/m)}
  ${grab(/^async function autoPrecacheEnabled\(\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function setAutoPrecache\(enabled\) \{[\s\S]*?\n\}/m)}
  ${grab(/^function messagePrefix\(data\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function libraryEntries\(prefix\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function precachedEntries\(prefix\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function addToLibrary\(prefix, paths, refresh, report\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function removeFromLibrary\(prefix, paths\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function clearAllOffline\(\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function handleLibraryMessage\(data, port\) \{[\s\S]*?\n\}/m)}
  ${grab(/^const RUNTIME_PAGES = .*$/m)}
  ${grab(/^const RUNTIME_ASSETS = .*$/m)}
  ${grab(/^const PAGES_MAX_ENTRIES = .*$/m)}
  ${grab(/^const ASSETS_MAX_ENTRIES = .*$/m)}
  ${grab(/^function cacheKeyCandidates\(pathname\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function matchCachedPage\(request\) \{[\s\S]*?\n\}/m)}
  ${grab(/^function offlinePathFor\(url\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function trimCache\(cacheName, maxEntries\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function migrateLegacyRuntime\(\) \{[\s\S]*?\n\}/m)}
  ${grab(/^function keepAlive\(event, promise\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function networkFirst\(request, event\) \{[\s\S]*?\n\}/m)}
  return {
    RUNTIME_PAGES, RUNTIME_ASSETS, PAGES_MAX_ENTRIES, PRECACHE, LIBRARY, SETTINGS,
    cacheKeyCandidates, matchCachedPage, offlinePathFor, migrateLegacyRuntime,
    langPrefixOf, precacheUrlsFor, essentialUrlsFor, precacheFor, guessLangPrefix,
    noteVisit, hadFullPrecache, installPrecache, precacheOnNavigation,
    autoPrecacheEnabled, setAutoPrecache, libraryEntries, precachedEntries,
    messagePrefix, addToLibrary, removeFromLibrary, clearAllOffline,
    handleLibraryMessage, networkFirst,
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
  const net = { offline: !!opts.offline };
  const fetchStub = async (url) => {
    fetched.push(url);
    if (net.offline) throw new TypeError("Failed to fetch");
    return { ok: !(opts.notFound || []).includes(url), url };
  };
  const selfStub = {
    clients: {
      matchAll: async () => (opts.clients || []).map((url) => ({ url })),
    },
  };
  const navigatorStub = { storage: { estimate: async () => ({ usage: 1024, quota: 4096 }) } };
  const sw = new Function('caches', 'SCOPE_PATH', 'fetch', 'self', 'navigator', harness)(
    caches, SCOPE_PATH, fetchStub, selfStub, navigatorStub
  );
  return { sw, caches, fetched, net };
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
  assert.equal(fetched.length, sw.precacheUrlsFor('en/').length);
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
  await sw.addToLibrary('', ['scenarios/journalist/', 'scenarios/activist/'], false, () => {});

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
  await sw.addToLibrary('', ['scenarios/journalist/'], false, () => {});
  fetched.length = 0;

  await sw.addToLibrary('', ['scenarios/journalist/'], false, () => {});
  assert.deepEqual(fetched, []);

  await sw.addToLibrary('', ['scenarios/journalist/'], true, () => {});
  assert.deepEqual(fetched, ['/docs/scenarios/journalist/']);
});

test('下載過程逐頁回報進度', async (load) => {
  const { sw } = load();
  const seen = [];
  await sw.addToLibrary('', ['a/', 'b/', 'c/'], false, (data) => seen.push(data.done));
  // 整批可能要好幾分鐘，沒有進度讀者只會看到一個不動的按鈕
  assert.deepEqual(seen, [1, 2, 3]);
});

test('移除只動 library，數得出移掉幾頁', async (load) => {
  const { sw } = load();
  await sw.addToLibrary('', ['a/', 'b/'], false, () => {});
  const result = await sw.removeFromLibrary('', ['a/', 'never-stored/']);
  assert.equal(result.removed, 1);
  assert.deepEqual(await sw.libraryEntries(''), ['b/']);
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
  await sw.addToLibrary('', ['scenarios/journalist/'], false, () => {});
  await sw.addToLibrary('en/', ['scenarios/activist/'], false, () => {});

  assert.deepEqual(await sw.libraryEntries(''), ['scenarios/journalist/']);
  assert.deepEqual(await sw.libraryEntries('en/'), ['scenarios/activist/']);
});

test('移除也照語系走，不會誤刪另一個語系的同名頁', async (load) => {
  const { sw } = load();
  await sw.addToLibrary('', ['scenarios/journalist/'], false, () => {});
  await sw.addToLibrary('en/', ['scenarios/journalist/'], false, () => {});

  assert.equal((await sw.removeFromLibrary('en/', ['scenarios/journalist/'])).removed, 1);
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
  await sw.addToLibrary('', ['scenarios/journalist/'], false, () => {});
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
  await sw.addToLibrary('', ['scenarios/journalist/'], false, () => {});

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

test('連離線頁都沒快取到時才把錯誤丟出去', async (load) => {
  const { sw } = load({ offline: true });
  await assert.rejects(() => sw.networkFirst(req('/docs/basics/metadata/'), null));
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
