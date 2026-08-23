#!/usr/bin/env node
/**
 * 小工具索引頁的卡片順序要跟 nav 一致。
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

// nav 裡 utils/index.md 之後那一串就是這一區的順序
function navOrder(configFile) {
  const lines = fs.readFileSync(path.join(DOCS, configFile), 'utf8').split('\n');
  const out = [];
  let started = false;
  for (const line of lines) {
    const m = line.match(/^\s+- utils\/([a-z0-9-]+)\.md\s*$/);
    if (m) {
      if (m[1] === 'index') { started = true; continue; }
      if (started) out.push(m[1]);
    } else if (started && out.length) {
      break;
    }
  }
  return out;
}

// 索引頁的 grid cards 區塊裡，每張卡片連到哪一頁
function cardOrder(lang) {
  const text = fs.readFileSync(path.join(DOCS, lang, 'utils', 'index.md'), 'utf8');
  const start = text.indexOf('<div class="grid cards" markdown>');
  assert.ok(start >= 0, `${lang} 的索引頁沒有 grid cards 區塊`);
  const body = text.slice(start, text.indexOf('</div>', start));
  return [...body.matchAll(/^-\s+:[a-z0-9-]+:\s+\*\*\[[^\]]+\]\(([a-z0-9-]+)\.md\)\*\*/gm)].map((m) => m[1]);
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
