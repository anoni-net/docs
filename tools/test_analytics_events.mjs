#!/usr/bin/env node
/**
 * 埋在小工具裡的分析事件，只准送列舉值。
 *
 * === 為什麼需要這支 ===
 *
 * 站上對讀者的承諾寫在 utils/leaks 那一頁：送出去的只有固定的幾個代號，沒有檔名、
 * 網址或解出來的內容。那個承諾靠人工審查守不住，因為新增一個事件只要一行，而多送
 * 一個變數看起來跟少送一個沒有差別。
 *
 * 這支從原始碼檢查三件事：
 *
 * 1. 每一個 anoniTrack 呼叫的 data 只有字面值或安全的表達式，沒有夾帶變數內容
 * 2. 事件名稱是白名單裡的那幾個，新增要先想清楚並更新揭露
 * 3. 呼叫前都檢查過 window.anoniTrack 在不在（onion 版沒有那個函式）
 *
 * 用法：
 *   node tools/test_analytics_events.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const JS_DIR = path.join(HERE, '..', 'docs', 'zh-TW', 'js');

// 允許的事件名稱。新增一個就要同時更新 utils/leaks 三個語系的揭露，
// 那個成本是刻意的。
const ALLOWED = new Set([
  'display-mode',
  'stripmeta-unsupported',
  'stripmeta-verify-fail',
  'stripmeta-ok',
  'qrread-fail',
  'qrread-kind',
  'offline-action',
  'search-used',
  'search-zero',
  'search-hit',
  'lang-switch',
  'read-depth',
]);

// data 裡允許出現的值。字面字串、或這幾個回傳固定列舉的函式與欄位。
// 重點是不可以出現 file.name、state.text、result.data 這類會夾帶內容的東西。
const SAFE_VALUES = [
  /^"[A-Za-z0-9/-]+"$/,                     // 字面值（含 cantOpen 這種駝峰）
  /^[a-z]+ \? "[a-z-]+" : "[a-z-]+"$/,      // 三元的兩邊都是字面值
  /^result\.kind( \|\| "unknown")?$/,       // detect() 的回傳，固定幾個代號
  /^state\.format \|\| "unknown"$/,         // sniffFormat() 的回傳
  /^kindGroup\([^)]*\)$/,                   // 粗分類函式
  /^action$/,                               // trackOffline 的參數，呼叫端已檢查
  /^mode$/,                                 // display-mode
  /^queryBucket\([^)]*\)$/,                 // 搜尋字數級距，只回 short/medium/long
  /^rankBucket\([^)]*\)$/,                  // 點擊位置級距，只回 first/top3/rest
  /^from$|^to$/,                            // normalizeLang 的回傳，語系代號
  /^String\(marks\[i\]\)$/,                  // 閱讀深度，25/50/75/100
];

let passed = 0;
const failures = [];
const check = (label, fn) => {
  try { fn(); passed += 1; console.log('  ✓ ' + label); }
  catch (err) { failures.push(`${label}\n    ${err.message}`); console.log('  ✗ ' + label); }
};

const files = fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js'));
const sources = files.map((f) => [f, fs.readFileSync(path.join(JS_DIR, f), 'utf8')]);

// anoniTrack("name", { key: value, ... })
//
// 也要認得 const track = window.anoniTrack 這種別名。analytics.js 用了別名，而這支
// 原本只比對 anoniTrack(，那一整批事件因此完全沒被掃到，白名單等於對它不存在。
// 掃不到的規則跟沒有規則一樣，而且更糟，因為看起來像有守著。
const CALL_RE = /(?:window\.anoniTrack|\btrack)\(\s*"([a-z-]+)"\s*,\s*\{([^}]*)\}\s*\)/g;

// 整支檔案開頭就擋掉的寫法。analytics.js 是 if (typeof window.anoniTrack !== "function") return;
// 這種形式，後面每個呼叫都不必再檢查一次。
const FILE_GUARD_RE = /typeof\s+window\.anoniTrack\s*!==\s*["']function["'][\s\S]{0,40}?return/;

check('事件名稱都在白名單裡', () => {
  for (const [name, src] of sources) {
    for (const m of src.matchAll(CALL_RE)) {
      assert.ok(ALLOWED.has(m[1]),
        `${name} 送了未列入白名單的事件「${m[1]}」，新增前請先更新 utils/leaks 的揭露`);
    }
  }
});

check('data 只送列舉值，沒有夾帶檔名、網址或內容', () => {
  for (const [name, src] of sources) {
    for (const m of src.matchAll(CALL_RE)) {
      const body = m[2].trim().replace(/\s+/g, ' ');
      if (!body) continue;
      for (const pair of body.split(',')) {
        if (!pair.trim()) continue;
        const idx = pair.indexOf(':');
        assert.ok(idx > 0, `${name} 的 ${m[1]} 有看不懂的 data 片段：${pair}`);
        const value = pair.slice(idx + 1).trim();
        assert.ok(SAFE_VALUES.some((rx) => rx.test(value)),
          `${name} 的 ${m[1]} 送了不在安全清單裡的值：${value}\n` +
          `    只准送固定的列舉代號。要新增一種來源，先確認它不可能含有使用者內容，` +
          `再加進 SAFE_VALUES。`);
      }
    }
  }
});

check('呼叫前都確認過送出口存在（onion 版沒有）', () => {
  for (const [name, src] of sources) {
    // 檔案開頭已經擋過的就不必逐行再要求一次
    if (FILE_GUARD_RE.test(src)) continue;
    const lines = src.split('\n');
    lines.forEach((line, i) => {
      if (!/anoniTrack\(\s*"/.test(line)) return;
      // 往前找五行內有沒有 window.anoniTrack 的存在檢查
      // 守衛的寫法有好幾種：if (window.anoniTrack)、&& window.anoniTrack、
      // if (!window.anoniTrack) return。只要前五行內出現在條件裡就算數。
      const before = lines.slice(Math.max(0, i - 5), i).join(' ') +
        ' ' + lines[i].slice(0, lines[i].indexOf('anoniTrack("'));
      assert.ok(/window\.anoniTrack/.test(before),
        `${name}:${i + 1} 直接呼叫 anoniTrack，沒有先確認它存在。` +
        `onion 與 IPFS 版整段分析會被 sed 掉，那兩版會炸在這一行。`);
    });
  }
});

check('這份白名單跟 main.html 的 EVENTS 是同一份', () => {
  // 白名單有兩份：這裡擋原始碼寫錯，main.html 的 anoniBeforeSend 擋執行期送出。
  // 兩份分開放是必要的（一份要在瀏覽器裡跑），分開就會走偏。改一邊漏另一邊的後果
  // 是安靜的：事件照送，畫面正常，資料庫裡什麼都沒有，要到有人翻報表才發現。
  const html = fs.readFileSync(path.join(HERE, '..', 'docs', 'overrides', 'main.html'), 'utf8');
  const block = html.match(/^    var EVENTS = \[([\s\S]*?)\n    \];/m);
  assert.ok(block, 'main.html 裡找不到 EVENTS 陣列');
  const inHtml = [...block[1].matchAll(/"([a-z-]+)"/g)].map((m) => m[1]).sort();
  const inTest = [...ALLOWED].sort();
  assert.deepEqual(inHtml, inTest,
    `兩份白名單對不上。\n    main.html 有：${inHtml.join(', ')}\n    這支有：${inTest.join(', ')}`);
});

check('沒有工具直接碰 umami，一律走送出口', () => {
  for (const [name, src] of sources) {
    assert.ok(!/window\.umami/.test(src),
      `${name} 直接用了 window.umami。走 window.anoniTrack，那一層在 onion 版不存在，` +
      `工具因此自動什麼都不送。`);
  }
});

if (failures.length) {
  console.log(`\n${passed} 通過，${failures.length} 失敗\n`);
  failures.forEach((f) => console.log('  ' + f));
  process.exit(1);
}
console.log(`\n${passed} 通過，0 失敗`);
