#!/usr/bin/env node
/**
 * 小工具索引頁的卡片順序與分組要跟 nav 一致。
 *
 * === 為什麼需要這支 ===
 *
 * 讀者從左側目錄看到的順序，跟從索引頁卡片看到的順序，是同一區的兩個入口。兩邊不
 * 一樣的時候沒有任何錯誤訊息，站台照樣建得起來，只有讀者會覺得東西「換位置了」。
 *
 * 這個不一致很容易發生：新增一個工具要改 nav（三個設定檔）跟索引頁（三個語系），
 * 六個地方各自插入，插錯位置不會有人發現。實際上這一區短時間內就發生過兩次。
 *
 * 順序以 nav 為準，索引頁跟著它走。
 *
 * 2026-09-10 起 nav 把十四支工具收成五組，索引頁用同名的 ### 小標題分同樣的組。
 * 分組是第二個會走鐘的地方：改了 nav 的組別而忘記搬索引頁的卡片，兩個入口就會給
 * 出不同的分法，一樣不會有錯誤訊息。所以除了順序，組名與每一組的成員也要比對。
 *
 * 用法：
 *   node tools/test_utils_index_order.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.join(HERE, '..', 'docs');
const PAIRS = [
  ['mkdocs.yml', 'zh-TW'],
  ['mkdocs_en.yml', 'en'],
  ['mkdocs_cn.yml', 'zh-CN'],
];

// nav 的小工具那一區，回傳 [{ name, slugs }]。
//
// 用縮排界定範圍，不靠「遇到第一個非 utils 的行就停」。那個寫法在分組之後會停在
// 第一個組名上，只讀得到第一組。這裡改成從 NAV_UTILS 那一行的縮排往下收，縮排回到
// 同層或更外層就結束，中間的組名、註解與空行各自處理。
function navGroups(configFile) {
  const lines = fs.readFileSync(path.join(DOCS, configFile), 'utf8').split('\n');
  const start = lines.findIndex((l) => l.includes('NAV_UTILS'));
  assert.ok(start >= 0, `${configFile} 找不到 NAV_UTILS`);
  const baseIndent = lines[start].search(/\S/);

  const groups = [];
  const loose = [];
  let current = null;
  for (const line of lines.slice(start + 1)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (line.search(/\S/) <= baseIndent) break;

    const page = line.match(/^\s+- utils\/([a-z0-9-]+)\.md\s*$/);
    if (page) {
      if (page[1] === 'index') continue;
      (current ? current.slugs : loose).push(page[1]);
      continue;
    }
    const group = line.match(/^\s+- "(.+)":\s*$/);
    if (group) {
      current = { name: group[1], slugs: [] };
      groups.push(current);
      continue;
    }
    // !ENV 的分組是「互動與呈現」，它底下是 games/*.md，不屬於這一區
    current = null;
  }
  assert.deepEqual(loose, [], `${configFile} 有沒有被收進分組的工具：${loose.join('、')}`);
  return groups;
}

function navOrder(configFile) {
  return navGroups(configFile).flatMap((g) => g.slugs);
}

// 索引頁每一個 grid cards 區塊，連同它上面那個 ### 小標題，回傳 [{ name, slugs }]
function cardGroups(lang) {
  const text = fs.readFileSync(path.join(DOCS, lang, 'utils', 'index.md'), 'utf8');
  assert.ok(text.includes('<div class="grid cards" markdown>'), `${lang} 的索引頁沒有 grid cards 區塊`);

  const groups = [];
  let heading = null;
  let current = null;
  for (const line of text.split('\n')) {
    const h = line.match(/^###\s+(.+?)\s*$/);
    if (h) { heading = h[1]; continue; }
    if (line.startsWith('<div class="grid cards" markdown>')) {
      current = { name: heading, slugs: [] };
      groups.push(current);
      continue;
    }
    if (line.startsWith('</div>')) { current = null; continue; }
    const card = line.match(/^-\s+:[a-z0-9-]+:\s+\*\*\[[^\]]+\]\(([a-z0-9-]+)\.md\)\*\*/);
    if (card && current) current.slugs.push(card[1]);
  }
  return groups;
}

function cardOrder(lang) {
  return cardGroups(lang).flatMap((g) => g.slugs);
}

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('三個語系的索引頁卡片順序都跟自己的 nav 一致', () => {
  for (const [config, lang] of PAIRS) {
    const nav = navOrder(config);
    const cards = cardOrder(lang);
    assert.deepEqual(cards, nav,
      `${lang} 的順序對不上\n      nav  ：${nav.join('、')}\n      卡片：${cards.join('、')}`);
  }
});

test('三個語系的索引頁分組都跟自己的 nav 分組一致', () => {
  // 組名也要一樣。側邊欄寫「當面把東西傳過去」而索引頁寫別的字，讀者會以為是兩區
  for (const [config, lang] of PAIRS) {
    assert.deepEqual(cardGroups(lang), navGroups(config),
      `${lang} 的分組對不上`);
  }
});

test('三個語系的 nav 分組數與成員數彼此一致', () => {
  // 組名各語系不同，能比的是有幾組、每一組幾頁
  const shape = (config) => navGroups(config).map((g) => g.slugs.join('、'));
  const [base, ...rest] = PAIRS.map(([config]) => shape(config));
  for (let i = 0; i < rest.length; i += 1) {
    assert.deepEqual(rest[i], base, `${PAIRS[i + 1][0]} 的分組跟 mkdocs.yml 不同`);
  }
});

test('三個語系的 nav 順序彼此一致', () => {
  // 語系之間排法不同，讀者切換語言時會覺得東西跑掉了
  const [base, ...rest] = PAIRS.map(([config]) => navOrder(config));
  for (let i = 0; i < rest.length; i += 1) {
    assert.deepEqual(rest[i], base, `${PAIRS[i + 1][0]} 的 nav 順序跟 mkdocs.yml 不同`);
  }
});

test('nav 裡的每一頁都有對應的檔案與卡片', () => {
  for (const [config, lang] of PAIRS) {
    for (const slug of navOrder(config)) {
      const file = path.join(DOCS, lang, 'utils', slug + '.md');
      assert.ok(fs.existsSync(file), `${lang} 的 nav 有 ${slug} 但檔案不存在`);
    }
    assert.ok(navOrder(config).length >= 6, `${lang} 的 nav 只有 ${navOrder(config).length} 個工具`);
  }
});

test('索引頁沒有多出 nav 以外的卡片', () => {
  // 多出來的卡片在左側目錄裡找不到，讀者按了之後回不去
  for (const [config, lang] of PAIRS) {
    const nav = new Set(navOrder(config));
    for (const slug of cardOrder(lang)) {
      assert.ok(nav.has(slug), `${lang} 的索引頁有 ${slug} 的卡片，但 nav 裡沒有這一頁`);
    }
  }
});

// await 是必要的。原本寫 fn()，非同步的測試函式回一個 promise 就被當成通過，斷言
// 失敗變成 unhandled rejection，整支測試照樣印綠色。這個檔案是 ESM，頂層 await 可以
// 直接用。2026-08 在 test_qrread.mjs 先踩到一次，這裡是把同一個缺陷補齊。
for (const [name, fn] of tests) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed += 1;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message.split('\n').slice(0, 5).join('\n    ')}`);
    failed += 1;
  }
}
console.log(`\n${passed} 通過，${failed} 失敗`);
process.exit(failed ? 1 : 0);
