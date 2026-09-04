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
import crypto from 'node:crypto';
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
  ${grab(/^const CROSS_LANG_PREFIXES = \[[\s\S]*?\n\];/m)}
  ${grab(/^function crossLangAsset\(asset\) \{[\s\S]*?\n\}/m)}
  ${grab(/^function assetUrlFor\(prefix, asset\) \{[\s\S]*?\n\}/m)}
  ${grab(/^const SHELL_ASSETS = \[[\s\S]*?\n\];/m)}
  ${grab(/^const CORE_PAGES_ZH = \[[\s\S]*?\n\];/m)}
  ${grab(/^const CORE_PAGES_EN = \[[\s\S]*?\n\];/m)}
  ${grab(/^const GAME_APPS = \[[\s\S]*?\n\];/m)}
  ${grab(/^const CORE_PAGES_BY_PREFIX = \{[\s\S]*?\n\};/m)}
  ${grab(/^function precacheUrlsFor\(prefix\) \{[\s\S]*?\n\}/m)}
  ${grab(/^function essentialUrlsFor\(prefix\) \{[\s\S]*?\n\}/m)}
  ${grab(/^function cacheKeyCandidates\(pathname\) \{[\s\S]*?\n\}/m)}
  // 執行期一次只預快取一個語系，檢查要涵蓋全部，所以逐一跑過再合併
  const byPrefix = LANG_PREFIXES.map((prefix) => [prefix, precacheUrlsFor(prefix)]);
  const essentialByPrefix = LANG_PREFIXES.map((prefix) => [prefix, essentialUrlsFor(prefix)]);
  return {
    byPrefix, essentialByPrefix, games: GAME_APPS.length, cacheKeyCandidates,
    SHELL_ASSETS, GAME_APPS, CROSS_LANG_PREFIXES, crossLangAsset, assetUrlFor,
  };
`;
const {
  byPrefix, essentialByPrefix, games, cacheKeyCandidates, SHELL_ASSETS, GAME_APPS,
  CROSS_LANG_PREFIXES, crossLangAsset, assetUrlFor,
} = new Function(harness)();

// 每頁都載入的那批寫在各語系索引的 shell 欄位，執行期由 shellAssetsFor 讀出來補進
// 預快取。清單在建置產物裡，不在 sw.js，所以底下的檢查與統計都要自己讀一次。
const indexes = new Map();
for (const [prefix] of byPrefix) {
  const file = path.join(OUT, prefix, 'offline-index.json');
  if (fs.existsSync(file)) indexes.set(prefix, JSON.parse(fs.readFileSync(file, 'utf8')));
}
const shellFor = (prefix) => {
  const index = indexes.get(prefix);
  // 路徑交給 sw.js 自己那支決定，三語系共用的那批走根路徑
  return index ? (index.shell || []).map((asset) => assetUrlFor(prefix, asset)) : [];
};
const byPrefixFull = byPrefix.map(([prefix, list]) => [prefix, [...list, ...shellFor(prefix)]]);
const essentialFullBy = essentialByPrefix.map(([prefix, list]) => [prefix, [...list, ...shellFor(prefix)]]);
const essentialFull = essentialFullBy.find(([prefix]) => prefix === '')[1];

// 作品本體每個語系的清單裡都有，合併時去重
const urls = [...new Set(byPrefixFull.flatMap(([, list]) => list))];

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
for (const [prefix, list] of byPrefixFull) {
  const name = (prefix || 'zh-TW/').replace(/\/$/, '');
  console.log(`    ${name.padEnd(6)} ${mb(sizeOf(list))}（${list.length} 個 URL）`);
}

// 切過語言的讀者要多下多少。三語系位元組相同的那批走根路徑，第一個語系下過就不必
// 再下，而 install 換版時會替讀者用過的每個語系補回底線那批，所以這個數字有人在付。
const first = byPrefixFull.find(([prefix]) => prefix === '');
if (first) {
  const already = new Set(first[1]);
  for (const [prefix, list] of byPrefixFull) {
    if (!prefix) continue;
    const extra = list.filter((url) => !already.has(url));
    const name = prefix.replace(/\/$/, '');
    console.log(`    下過 zh-TW 再切到 ${name.padEnd(5)} 多 ${mb(sizeOf(extra))}（${extra.length} 個 URL）`);
  }
}

// 作品本體單獨報一次，那是最容易漏補的一批
const gameUrls = urls.filter((u) => u.startsWith('/docs/games/') && !u.endsWith('/games/'));
console.log(`  其中三件互動作品 ${mb(sizeOf(gameUrls))}（${games} 個檔案，三語共用）`);
// 讀者關掉自動存或清空過內容時只會有這一批。少了它離線就沒有站台的說明頁可看，
// 落到瀏覽器自己的錯誤畫面，所以它不受那個開關管。
console.log(
  `  關掉自動存時仍保留的底線 ${mb(sizeOf(essentialFull))}（${essentialFull.length} 個 URL）`
);
// install 換版時替讀者用過的每個語系補的就是底線那批，這是切過語言的人要付的
{
  const already = new Set(essentialFull);
  for (const [prefix, list] of essentialFullBy) {
    if (!prefix) continue;
    const extra = list.filter((url) => !already.has(url));
    const name = prefix.replace(/\/$/, '');
    console.log(
      `    換版時替 ${name.padEnd(5)} 補的底線 ${mb(sizeOf(extra))}（${extra.length} 個 URL）`
    );
  }
}
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

// 反過來驗：頁面實際載入的東西都要有人負責
//
// 上面那道的方向是清單往檔案，「清單裡的 URL 都對得到檔案」。反過來的漏洞它看不見：
// 頁面需要某個檔案，而清單裡從頭到尾沒有它。2026-09-04 遇到的正是這種。站台自己的
// stylesheets/extra.css 每一頁都載入，SHELL_ASSETS 沒收，建置端又因為「每頁都出現」
// 把它從個別頁面的資產裡移除，兩邊都以為對方負責。那一份是 render-blocking 的，
// 離線打開任何一頁都是白的，而線上一切正常，讀者也說不出哪裡壞了。
//
// 只驗 CSS、JS 與 manifest。圖片缺了是破圖，讀者看得出來也讀得下去，而且預設本來
// 就不下載內文圖（那七 MB 由「連同內文圖一起存」那個開關管）。
const RENDER_REFS = [
  /<script[^>]+src="([^"]+)"/g,
  /<link[^>]+rel="(?:stylesheet|manifest)"[^>]*href="([^"]+)"/g,
  /<link[^>]+href="([^"]+)"[^>]*rel="(?:stylesheet|manifest)"/g,
];

function renderRefs(html, pageUrl) {
  const found = new Set();
  for (const re of RENDER_REFS) {
    for (const m of html.matchAll(re)) {
      const raw = m[1];
      if (/^(https?:)?\/\//.test(raw) || raw.startsWith('data:')) continue;
      const { pathname } = new URL(raw, 'https://anoni.net/' + pageUrl);
      found.add(pathname.replace(/^\//, ''));
    }
  }
  return found;
}

// 每個沒人負責的檔案記一次，附上有幾頁需要它。同一份 extra.css 報兩百多次沒有用
const uncovered = new Map();
if (indexes.has('')) {
  const index = indexes.get('');
  const covered = new Set([...SHELL_ASSETS, ...(index.shell || []), ...GAME_APPS]);
  const pages = index.sections.flatMap((section) => section.pages);
  // 管理頁自己不在索引裡（它就是列出那份清單的那一頁），而離線時最需要打得開的
  // 正是它，所以另外補上
  pages.push({ url: 'offline/', assets: [] });
  for (const page of pages) {
    const file = path.join(OUT, page.url, 'index.html');
    if (!fs.existsSync(file)) continue;
    const own = new Set(page.assets || []);
    for (const ref of renderRefs(fs.readFileSync(file, 'utf8'), page.url)) {
      if (covered.has(ref) || own.has(ref)) continue;
      uncovered.set(ref, (uncovered.get(ref) || 0) + 1);
    }
  }
  console.log(`  反向檢查涵蓋 ${pages.length} 頁的樣式、腳本與 manifest`);
} else {
  console.log('  找不到 offline-index.json，跳過反向檢查');
}

// 三語系共用的那批要真的位元組相同
//
// CROSS_LANG_PREFIXES 讓預快取只存根路徑那一份，讀者切過語言之後不必再下一次。前提
// 是三次 build 產出的內容確實一模一樣，而那是 mkdocs-material 與 privacy plugin 的
// 行為，升級之後可能改變。assets/javascripts/bundle.*.js 就是活生生的反例：雜湊檔名
// 三語系相同，內容卻不同，privacy plugin 在地化第三方資源時嵌進了帶語系前綴的絕對
// 網址。那一支靠著不在共用目錄底下才沒出事，換成別的檔案開始這樣就沒人擋得住。
const crossLangMismatch = [];
{
  const candidates = new Set();
  for (const [prefix] of byPrefix) {
    const index = indexes.get(prefix);
    for (const asset of [...SHELL_ASSETS, ...((index && index.shell) || [])]) {
      if (crossLangAsset(asset)) candidates.add(asset);
    }
  }
  for (const asset of candidates) {
    const digests = new Set();
    for (const [prefix] of byPrefix) {
      const f = path.join(OUT, prefix, asset);
      if (!fs.existsSync(f)) continue;
      digests.add(crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'));
    }
    if (digests.size > 1) crossLangMismatch.push(asset);
  }
  console.log(`  三語系共用 ${candidates.size} 個資產，各語系的位元組都比對過`);
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
if (uncovered.size) {
  console.error(`\n✗ ${uncovered.size} 個檔案是頁面載入時要用的，卻沒有人負責預快取：`);
  for (const [ref, n] of [...uncovered].sort((a, b) => b[1] - a[1])) {
    console.error(`  ${ref}（${n} 頁引用）`);
  }
  console.error('\n離線打開那些頁面會少掉這些東西，樣式類的會是一片空白。');
  console.error('修法是補進 sw.js 的 SHELL_ASSETS，或讓建置把它算進索引的 shell。');
}
if (crossLangMismatch.length) {
  console.error(`\n✗ ${crossLangMismatch.length} 個資產被當成三語系共用，實際上內容不同：`);
  for (const asset of crossLangMismatch) console.error('  ' + asset);
  console.error('\n讀者切過語言之後會拿到別的語系那一份。修法是把它移出 sw.js 的');
  console.error('CROSS_LANG_PREFIXES，或找出建置為什麼開始讓它分語系。');
}
if (missing.length || unreachable.length || uncovered.size || crossLangMismatch.length) {
  process.exit(1);
}
console.log('\n預快取清單裡的每個 URL 都對得到檔案，索引頁連出去的網址也都命中，');
console.log('頁面載入時要用的樣式與腳本都有人負責。');
