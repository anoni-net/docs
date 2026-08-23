#!/usr/bin/env node
/**
 * 威脅模型清單（docs/zh-TW/js/threatmodel.js）的單元測試。
 *
 * === 為什麼需要這支 ===
 *
 * 這個工具沒有演算法可言，它的價值全在兩件事上：規則有沒有抓到真正的錯配，以及
 * 建議的連結會不會爛掉。兩件都是靜態內容，靜態內容最容易在改版時默默壞掉。
 *
 * 連結那一項特別值得守。規則表裡寫的是 ../../scenarios/journalist/ 這種相對路徑，
 * 對應的原始檔在 docs/zh-TW/scenarios/journalist.md。有人改檔名或搬章節時，工具
 * 這邊不會有任何錯誤訊息，讀者按下去才會看到 404。這支測試把每一條規則的目標檔案
 * 都對回原始檔，少一個就紅。
 *
 * 另一項是「答案不落地」。這一頁刻意不存任何東西，那是設計決定而不是還沒做，所以
 * 要有測試守著，避免日後有人為了體驗方便順手加上 localStorage。
 *
 * 用法：
 *   node tools/test_threatmodel.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.join(HERE, '..', 'docs');
const SRC = path.join(DOCS, 'zh-TW', 'js', 'threatmodel.js');
const src = fs.readFileSync(SRC, 'utf8');
const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error(`threatmodel.js 裡找不到 ${re}`);
  return m[0];
};

// ASSETS 到 summarize 結尾是一整段沒有 DOM 相依的純邏輯，整段抽出來比逐個函式抽穩。
const harness = `
  ${grab(/^  const ASSETS = \[[\s\S]*?\n  function summarize\(state, strings, today\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  const STRINGS = \{[\s\S]*?\n  \};/m)}
  return { ASSETS, ADVERSARIES, BUDGETS, RULES, evaluate, summarize, STRINGS, topPower };
`;
const tool = new Function(harness)();

const ids = (list) => list.map((x) => x.id);
const ask = (assets, adversaries, budget) =>
  tool.evaluate({ assets, adversaries, budget });

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('每一條建議指向的頁面在 docs/zh-TW 底下真的存在', () => {
  // 有人改檔名或搬章節時，工具這邊不會報錯，讀者按下去才看到 404
  const reads = tool.RULES.filter((r) => r.kind === 'read');
  assert.ok(reads.length >= 10, `建議規則只有 ${reads.length} 條`);
  for (const rule of reads) {
    // ../../scenarios/journalist/ 對回 docs/<lang>/scenarios/journalist.md
    const rel = rule.page.replace(/^\.\.\/\.\.\//, '').replace(/\/$/, '');
    const file = path.join(DOCS, 'zh-TW', rel + '.md');
    assert.ok(fs.existsSync(file), `規則 ${rule.id} 指向 ${rule.page}，但 ${rel}.md 不存在`);
  }
});

test('三個語系都找得到那些頁面，翻譯漏一頁就是死連結', () => {
  for (const lang of ['en', 'zh-CN']) {
    for (const rule of tool.RULES.filter((r) => r.kind === 'read')) {
      const rel = rule.page.replace(/^\.\.\/\.\.\//, '').replace(/\/$/, '');
      const file = path.join(DOCS, lang, rel + '.md');
      assert.ok(fs.existsSync(file), `${lang} 少了 ${rel}.md，規則 ${rule.id} 會連到 404`);
    }
  }
});

test('三個語系的文案 key 完全一致', () => {
  const langs = Object.keys(tool.STRINGS);
  assert.equal(langs.length, 3, `語系有 ${langs.length} 個`);
  const keysOf = (obj) => Object.keys(obj).sort().join(',');
  const base = tool.STRINGS[langs[0]];
  for (const lang of langs.slice(1)) {
    const other = tool.STRINGS[lang];
    assert.equal(keysOf(other), keysOf(base), `${lang} 的頂層 key 對不上`);
    for (const group of ['groups', 'assets', 'adversaries', 'budgets', 'warns', 'reads']) {
      assert.equal(keysOf(other[group]), keysOf(base[group]), `${lang} 的 ${group} 對不上`);
    }
  }
});

test('每個資產、對手、成本與規則 id 三個語系都查得到文案', () => {
  // 漏一個畫面上就是 undefined，而且只在那個語系看得到
  for (const [lang, s] of Object.entries(tool.STRINGS)) {
    for (const a of tool.ASSETS) assert.ok(s.assets[a.id], `${lang} 少了資產「${a.id}」`);
    for (const a of tool.ASSETS) assert.ok(s.groups[a.group], `${lang} 少了分類「${a.group}」`);
    for (const a of tool.ADVERSARIES) assert.ok(s.adversaries[a.id], `${lang} 少了對手「${a.id}」`);
    for (const b of tool.BUDGETS) assert.ok(s.budgets[b], `${lang} 少了成本「${b}」`);
    for (const r of tool.RULES) {
      const table = r.kind === 'warn' ? s.warns : s.reads;
      assert.ok(table[r.id], `${lang} 少了規則「${r.id}」的文案`);
    }
  }
});

test('對手能力取最高的那一級', () => {
  assert.equal(tool.topPower([]), 0);
  assert.equal(tool.topPower(['passerby']), 1);
  assert.equal(tool.topPower(['passerby', 'state']), 6);
  assert.equal(tool.topPower(['intimate', 'employer']), 3);
});

test('對手到執法或國家級、成本卻填最低，會標成錯配', () => {
  // 文章講的「一個你撐不到三個月的方案，等於沒有方案」
  assert.ok(ids(ask(['content'], ['state'], 'low').warns).includes('state-low-budget'));
  assert.ok(ids(ask(['content'], ['police'], 'low').warns).includes('state-low-budget'));
  assert.ok(!ids(ask(['content'], ['state'], 'high').warns).includes('state-low-budget'));
  assert.ok(!ids(ask(['content'], ['platform'], 'low').warns).includes('state-low-budget'));
});

test('要防親密關係卻沒把裝置列進來，會提醒', () => {
  // 這一級對手最常用的路徑是拿到你的手機，不是網路那一層
  assert.ok(ids(ask(['content'], ['intimate'], 'mid').warns).includes('intimate-without-device'));
  assert.ok(!ids(ask(['content', 'device'], ['intimate'], 'mid').warns).includes('intimate-without-device'));
});

test('只防隨意路人卻要大改工作流程，會標成過度防護', () => {
  assert.ok(ids(ask(['content'], ['passerby'], 'high').warns).includes('overkill'));
  assert.ok(!ids(ask(['content'], ['passerby'], 'low').warns).includes('overkill'));
  // 同時還有更強的對手就不算過度
  assert.ok(!ids(ask(['content'], ['passerby', 'police'], 'high').warns).includes('overkill'));
});

test('保護消息來源卻沒列聯絡關係，會提醒 metadata 那一層', () => {
  assert.ok(ids(ask(['sources'], ['police'], 'mid').warns).includes('sources-without-contacts'));
  assert.ok(!ids(ask(['sources', 'contacts'], ['police'], 'mid').warns).includes('sources-without-contacts'));
});

test('題目沒答完會標出來', () => {
  assert.ok(ids(ask([], ['intimate'], 'mid').warns).includes('no-asset'));
  assert.ok(ids(ask(['content'], [], 'mid').warns).includes('no-adversary'));
  assert.ok(!ids(ask(['content'], ['intimate'], 'mid').warns).includes('no-adversary'));
});

test('對手選太多會建議拆成兩份清單', () => {
  const many = ['passerby', 'intimate', 'employer', 'platform', 'police'];
  assert.ok(ids(ask(['content'], many, 'mid').warns).includes('too-many-adversaries'));
  assert.ok(!ids(ask(['content'], many.slice(0, 4), 'mid').warns).includes('too-many-adversaries'));
});

test('基線那一篇每個人都會拿到', () => {
  for (const state of [
    { assets: ['content'], adversaries: ['passerby'], budget: 'low' },
    { assets: ['device'], adversaries: ['state'], budget: 'high' },
    { assets: [], adversaries: [], budget: '' },
  ]) {
    assert.ok(ids(tool.evaluate(state).reads).includes('baseline'), '基線沒有出現');
  }
});

test('答案不同，建議也不同', () => {
  const reporter = ids(ask(['sources', 'contacts'], ['police'], 'high').reads);
  const everyday = ids(ask(['credentials'], ['passerby'], 'low').reads);
  assert.ok(reporter.includes('journalist'), '有消息來源卻沒建議記者那篇');
  assert.ok(!everyday.includes('journalist'), '沒有消息來源卻建議了記者那篇');
  assert.ok(everyday.includes('password-manager'), '憑證沒有對到密碼管理器');
  assert.ok(!reporter.includes('password-manager'), '沒選憑證卻建議了密碼管理器');
  assert.ok(reporter.includes('surveillance'), '對手到執法卻沒建議監控能力那篇');
});

test('親密關係會帶出家暴那一篇', () => {
  // 那一篇正好是這個對手層級寫的
  assert.ok(ids(ask(['device'], ['intimate'], 'mid').reads).includes('domestic'));
  assert.ok(!ids(ask(['device'], ['platform'], 'mid').reads).includes('domestic'));
});

test('摘要把三題與錯配都寫進去，而且是純文字', () => {
  const state = { assets: ['sources'], adversaries: ['police'], budget: 'low' };
  const text = tool.summarize(state, tool.STRINGS['zh-TW'], '2026-08-21');
  assert.ok(text.includes('2026-08-21'), '沒有日期，日後回看不知道是什麼時候填的');
  assert.ok(text.includes('誰是我的消息來源'), '第一題的答案沒進摘要');
  assert.ok(text.includes('一國執法'), '第二題的答案沒進摘要');
  assert.ok(text.includes('不想改變日常習慣'), '第三題的答案沒進摘要');
  assert.ok(text.includes('這個組合撐不住'), '錯配沒進摘要');
  assert.ok(!/<[a-z]/i.test(text), '摘要裡有標籤，那不是純文字');
});

test('三個語系都產得出摘要，不會出現 undefined', () => {
  const state = { assets: ['identity', 'device'], adversaries: ['intimate', 'platform'], budget: 'mid' };
  for (const [lang, strings] of Object.entries(tool.STRINGS)) {
    const text = tool.summarize(state, strings, '2026-08-21');
    assert.ok(!text.includes('undefined'), `${lang} 的摘要裡有 undefined`);
    assert.ok(text.length > 200, `${lang} 的摘要只有 ${text.length} 字，太短了`);
  }
});

test('沒答的題目在摘要裡標成沒填，不是留空行', () => {
  const text = tool.summarize({ assets: [], adversaries: [], budget: '' },
                              tool.STRINGS['zh-TW'], '2026-08-21');
  assert.equal((text.match(/（沒有填）/g) || []).length, 3, '三題都沒填就該出現三次');
});

test('答案不寫進任何儲存空間', () => {
  // 「我要防的是親密關係的人」這種答案留在裝置上，正好是最不該留的東西。
  // 這是設計決定，不是還沒做，所以要有測試擋住日後順手加上去。
  for (const needle of ['localStorage', 'sessionStorage', 'indexedDB', 'document.cookie',
                        'caches.open', 'IDBDatabase']) {
    assert.ok(!code.includes(needle), `出現了 ${needle}`);
  }
});

test('沒有任何網路請求', () => {
  for (const needle of ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket', 'new Image(']) {
    assert.ok(!code.includes(needle), `出現了 ${needle}`);
  }
});

test('改答案會讓已經產出的摘要失效', () => {
  // 摘要跟答案對不上是最糟的情況，讀者會拿著一份不是自己答案的清單去做事
  assert.ok(/state\.built = false;/.test(code), '改答案時沒有把 built 打回 false');
  const changeHandler = code.slice(code.indexOf('input.addEventListener("change"'));
  assert.ok(changeHandler.indexOf('state.built = false') < changeHandler.indexOf('render()'),
            '重畫之前沒有先讓舊摘要失效');
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
    console.log(`    ${err.message.split('\n').slice(0, 4).join('\n    ')}`);
    failed += 1;
  }
}
console.log(`\n${passed} 通過，${failed} 失敗`);
process.exit(failed ? 1 : 0);
