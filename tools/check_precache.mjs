#!/usr/bin/env node
/**
 * 檢查 PWA 預快取清單裡的每個 URL 都對得到建置產出的檔案。
 *
 * === 為什麼需要這支 ===
 *
 * sw.js 的 install 用 Promise.allSettled 逐一快取並容忍個別失敗。那是刻意的：
 * 本地開發只有單一語系，其他語系路徑本來就會 404，不該讓整個 install 掛掉。
 *
 * 代價是清單裡的錯字完全不會被發現。少快取一個檔案，線上看起來一切正常，只有離線
 * 的人會遇到破圖或空白，而那正是最難回報、也最沒辦法自己查的情境。
 *
 * 遊戲那一批（GAME_APPS）尤其容易漏：地球儀新增一份資料檔時要記得補進 sw.js，
 * 漏了的話那一層在離線時就是空的，而畫面其他部分照常運作，不會有任何錯誤訊息。
 *
 * === 怎麼驗 ===
 *
 * 把 sw.js 的清單與 precacheUrls() 原地抽出來執行，拿到跟瀏覽器一模一樣的 URL 清單，
 * 再對照 docs/output 的實際檔案。不重寫一份路徑組合邏輯，那樣只會驗到自己抄得對不對。
 *
 * URL 對檔案的規則跟靜態站一樣：結尾是 / 的找 index.html，其餘直接找該檔。
 *
 * 用法：
 *   cd docs && sh run.sh && sh run_zh-cn.sh && sh run_en.sh
 *   node tools/check_precache.mjs
 * 找不到 docs/output 時跳過並回 0（沒建置過就不該擋人）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SW = path.join(HERE, '..', 'docs', 'zh-TW', 'sw.js');
const OUT = path.join(HERE, '..', 'docs', 'output');

if (!fs.existsSync(OUT)) {
  console.log('  找不到 docs/output，先建置過再跑這支。跳過。');
  process.exit(0);
}

const src = fs.readFileSync(SW, 'utf8');

/** 從 sw.js 抓出宣告或函式的原始碼，不另外抄一份 */
const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error(`sw.js 裡找不到 ${re}`);
  return m[0];
};

// SCOPE_PATH 在 sw.js 裡是從 registration.scope 算的，這裡固定成正式站的 /docs/
const harness = `
  const SCOPE_PATH = "/docs/";
  ${grab(/^const LANG_PREFIXES = \[[^\]]*\];/m)}
  ${grab(/^const SHELL_ASSETS = \[[\s\S]*?\n\];/m)}
  ${grab(/^const CORE_PAGES_ZH = \[[\s\S]*?\n\];/m)}
  ${grab(/^const CORE_PAGES_EN = \[[\s\S]*?\n\];/m)}
  ${grab(/^const GAME_APPS = \[[\s\S]*?\n\];/m)}
  ${grab(/^const CORE_PAGES_BY_PREFIX = \{[\s\S]*?\n\};/m)}
  ${grab(/^function precacheUrlsFor\(prefix\) \{[\s\S]*?\n\}/m)}
  ${grab(/^function cacheKeyCandidates\(pathname\) \{[\s\S]*?\n\}/m)}
  // 執行期一次只預快取一個語系，檢查要涵蓋全部，所以逐一跑過再合併
  const byPrefix = LANG_PREFIXES.map((prefix) => [prefix, precacheUrlsFor(prefix)]);
  return { byPrefix, games: GAME_APPS.length, cacheKeyCandidates };
`;
const { byPrefix, games, cacheKeyCandidates } = new Function(harness)();
// 作品本體每個語系的清單裡都有，合併時去重
const urls = [...new Set(byPrefix.flatMap(([, list]) => list))];

/** URL 換成 docs/output 底下的實際檔案路徑 */
function resolve(url) {
  const rel = url.replace(/^\/docs\//, '');
  const p = path.join(OUT, rel);
  return rel === '' || rel.endsWith('/') ? path.join(p, 'index.html') : p;
}

const missing = [];
let bytes = 0;
for (const url of urls) {
  const f = resolve(url);
  if (fs.existsSync(f) && fs.statSync(f).isFile()) bytes += fs.statSync(f).size;
  else missing.push(url);
}

const mb = (n) => (n / 1024 / 1024).toFixed(2) + ' MB';
const sizeOf = (list) =>
  list.reduce((a, u) => {
    const f = resolve(u);
    return a + (fs.existsSync(f) && fs.statSync(f).isFile() ? fs.statSync(f).size : 0);
  }, 0);

// 讀者一次只下自己那個語系，所以分語系報比報總和有意義
console.log('  預快取（讀者只會下到自己那個語系那一份）');
for (const [prefix, list] of byPrefix) {
  const name = (prefix || 'zh-TW/').replace(/\/$/, '');
  console.log(`    ${name.padEnd(6)} ${mb(sizeOf(list))}（${list.length} 個 URL）`);
}

// 作品本體單獨報一次，那是最容易漏補的一批
const gameUrls = urls.filter((u) => u.startsWith('/docs/games/') && !u.endsWith('/games/'));
console.log(`  其中三件互動作品 ${mb(sizeOf(gameUrls))}（${games} 個檔案，三語共用）`);
console.log(`  全部語系去重後 ${mb(bytes)}，這是底下兩道檢查涵蓋的範圍`);

// 索引頁連出去的網址形狀，要能命中預快取的 key
//
// 預快取存的是 games/x/play/index.html，而 zh-TW 的互動作品索引頁連的是
// games/x/play/，en 與 zh-cn 連的是 games/x/play/index.html?lang=en。Cache Storage
// 比對的是完整網址字串，形狀不同就是不同的 key。這種錯配用上面那道「檔案存不存在」
// 驗不出來，兩種形狀都指得到同一個檔案，只有離線的讀者會發現作品打不開。
// sw.js 的 cacheKeyCandidates 負責在離線時補上另一種形狀，這裡驗它真的補得到。
const cachedKeys = new Set(urls);
const INDEX_PAGES = [
  ['games/index.html', '/docs/games/'],
  ['en/games/index.html', '/docs/en/games/'],
  ['zh-cn/games/index.html', '/docs/zh-cn/games/'],
];
const unreachable = [];
for (const [file, base] of INDEX_PAGES) {
  const indexFile = path.join(OUT, file);
  if (!fs.existsSync(indexFile)) continue;
  const html = fs.readFileSync(indexFile, 'utf8');
  const hrefs = new Set(
    [...html.matchAll(/href="([^"]*\/play\/[^"]*)"/g)].map((m) => m[1])
  );
  for (const href of hrefs) {
    const { pathname } = new URL(href, 'https://anoni.net' + base);
    if (!cacheKeyCandidates(pathname).some((c) => cachedKeys.has(c))) {
      unreachable.push(`${base} 連到 ${pathname}`);
    }
  }
}

if (missing.length) {
  console.error(`\n✗ ${missing.length} 個 URL 在 docs/output 裡找不到對應檔案：`);
  for (const u of missing.slice(0, 20)) console.error('  ' + u);
  if (missing.length > 20) console.error(`  ⋯ 另有 ${missing.length - 20} 個`);
  console.error('\nsw.js 的 install 用 allSettled 容忍失敗，所以這些會被靜默跳過，');
  console.error('線上看起來正常，只有離線的人會遇到破圖或空白。');
}
if (unreachable.length) {
  console.error(`\n✗ ${unreachable.length} 個索引頁連出去的網址對不到預快取的 key：`);
  for (const u of unreachable) console.error('  ' + u);
  console.error('\n檔案本身存在，線上一切正常，只有離線的讀者會打不開。');
  console.error('修法是讓 GAME_APPS 與索引頁的連結形狀一致，或補進 cacheKeyCandidates。');
}
if (missing.length || unreachable.length) process.exit(1);
console.log('\n預快取清單裡的每個 URL 都對得到檔案，索引頁連出去的網址也都命中。');
