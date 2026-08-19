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
    RUNTIME_PAGES, RUNTIME_ASSETS, PAGES_MAX_ENTRIES,
    cacheKeyCandidates, matchCachedPage, offlinePathFor, migrateLegacyRuntime,
  };
`;

/** 每個測試拿一組乾淨的快取，避免互相污染 */
const load = () => {
  const caches = new FakeCacheStorage();
  const sw = new Function('caches', 'SCOPE_PATH', harness)(caches, SCOPE_PATH);
  return { sw, caches };
};

const req = (pathname) => ({ url: ORIGIN + pathname });
const u = (pathname) => new URL(pathname, ORIGIN);

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('cacheKeyCandidates 補上另一種網址形狀', ({ sw }) => {
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

test('三個語系連出去的形狀都命中同一份預快取', async ({ sw, caches }) => {
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

test('分享網址帶的參數不影響命中', async ({ sw, caches }) => {
  const pages = await caches.open('anoni-docs-pages');
  await pages.put('/docs/tools/what-is-tor/', 'TOR');
  assert.equal(
    await sw.matchCachedPage(req('/docs/tools/what-is-tor/?utm_source=mastodon')),
    'TOR'
  );
});

test('離線頁依語系前綴挑', ({ sw }) => {
  assert.equal(sw.offlinePathFor(u('/docs/tools/what-is-tor/')), '/docs/offline/');
  assert.equal(sw.offlinePathFor(u('/docs/en/tools/what-is-tor/')), '/docs/en/offline/');
  assert.equal(sw.offlinePathFor(u('/docs/zh-cn/tools/what-is-tor/')), '/docs/zh-cn/offline/');
});

test('作品在根路徑，離線頁改看 ?lang=', ({ sw }) => {
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

test('路徑上的語系前綴比 query 優先', ({ sw }) => {
  // 前綴是站台建出來的，query 誰都能加。兩邊打架時信前綴。
  assert.equal(sw.offlinePathFor(u('/docs/en/tools/what-is-tor/?lang=zh-cn')), '/docs/en/offline/');
});

test('舊的帶版本快取搬進不帶版本的新快取', async ({ sw, caches }) => {
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

test('遷移不會把自己當成舊快取刪掉', async ({ sw, caches }) => {
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

test('搬進來超過上限時會裁到上限', async ({ sw, caches }) => {
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
    await fn(load());
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
