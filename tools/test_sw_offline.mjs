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
  ${grab(/^const precachedPrefixes = .*$/m)}
  ${grab(/^async function precacheFor\(prefix\) \{[\s\S]*?\n\}/m)}
  ${grab(/^function langPrefixOf\(url\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function guessLangPrefix\(\) \{[\s\S]*?\n\}/m)}
  ${grab(/^const RUNTIME_PAGES = .*$/m)}
  ${grab(/^const RUNTIME_ASSETS = .*$/m)}
  ${grab(/^const PAGES_MAX_ENTRIES = .*$/m)}
  ${grab(/^const ASSETS_MAX_ENTRIES = .*$/m)}
  ${grab(/^function cacheKeyCandidates\(pathname\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function matchCachedPage\(request\) \{[\s\S]*?\n\}/m)}
  ${grab(/^function offlinePathFor\(url\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function trimCache\(cacheName, maxEntries\) \{[\s\S]*?\n\}/m)}
  ${grab(/^async function migrateLegacyRuntime\(\) \{[\s\S]*?\n\}/m)}
  return {
    RUNTIME_PAGES, RUNTIME_ASSETS, PAGES_MAX_ENTRIES, PRECACHE,
    cacheKeyCandidates, matchCachedPage, offlinePathFor, migrateLegacyRuntime,
    langPrefixOf, precacheUrlsFor, precacheFor, guessLangPrefix,
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
  const fetchStub = async (url) => {
    fetched.push(url);
    return { ok: !(opts.notFound || []).includes(url), url };
  };
  const selfStub = {
    clients: {
      matchAll: async () => (opts.clients || []).map((url) => ({ url })),
    },
  };
  const sw = new Function('caches', 'SCOPE_PATH', 'fetch', 'self', harness)(
    caches, SCOPE_PATH, fetchStub, selfStub
  );
  return { sw, caches, fetched };
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

test('一次只抓一個語系的量', async (load) => {
  const { sw, fetched } = load();
  await sw.precacheFor('en/');
  assert.equal(fetched.length, sw.precacheUrlsFor('en/').length);
  assert.ok(
    fetched.every((url) => url.startsWith('/docs/en/') || url.startsWith('/docs/games/'))
  );
});

test('換語系時不重抓已經有的東西', async (load) => {
  const { sw, fetched } = load();
  await sw.precacheFor('');
  const firstRound = fetched.length;
  fetched.length = 0;

  await sw.precacheFor('en/');
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
  await sw.precacheFor('en/');
  const first = fetched.length;
  assert.ok(first > 0);

  // client 每次頁面載入都會送 PRECACHE_LANG，這裡模擬連續幾次
  fetched.length = 0;
  await sw.precacheFor('en/');
  await sw.precacheFor('en/');
  assert.equal(fetched.length, 0);
});

test('個別頁面 404 不會讓整批預快取失敗', async (load) => {
  const missing = '/docs/zh-cn/tools/what-is-cryptpad/';
  const { sw, caches } = load({ notFound: [missing] });
  await sw.precacheFor('zh-cn/');
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
