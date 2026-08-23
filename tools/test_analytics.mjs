#!/usr/bin/env node
/**
 * 站台層行為量測（docs/zh-TW/js/analytics.js）的單元測試。
 *
 * === 為什麼需要這支 ===
 *
 * 這支腳本站在讀者的搜尋框旁邊，而搜尋框裡可能正打著「防火長城」。承諾是關鍵字一個
 * 字都不送，只送字數級距。那個承諾靠讀程式碼守不住，因為把 queryBucket(q.length) 寫成
 * q 只差幾個字元，畫面上看不出任何差別。
 *
 * 級距函式本身也要盯。搞錯邊界不會讓頁面壞掉，只會讓之後看到的數字是錯的，而錯的
 * 數字比沒有數字更糟，它會讓人有信心地做錯決定。
 *
 * === 怎麼驗 ===
 *
 * 跟這個 repo 其他幾支一樣，把純函式從原始碼原地抽出來跑。需要 DOM 的那幾個 setup
 * 不在這裡測，由實機驗證負責。
 *
 * 用法：
 *   node tools/test_analytics.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LOCALES = ['zh-TW', 'zh-CN', 'en'];
const SRC = path.join(HERE, '..', 'docs', 'zh-TW', 'js', 'analytics.js');
const src = fs.readFileSync(SRC, 'utf8');
const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error(`analytics.js 裡找不到 ${re}`);
  return m[0];
};

const harness = `
  ${grab(/^  function queryBucket\(length\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function rankBucket\(index\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function normalizeLang\(lang\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function depthReached\(scrollTop, viewport, docHeight\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function worthMeasuring\(viewport, docHeight\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  const OPT_OUT_KEY = .*$/m)}
  ${grab(/^  const OPT_OUT_STRINGS = \{[\s\S]*?\n  \};/m)}
  ${grab(/^  function readOptOut\(storage\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function writeOptOut\(storage, disabled\) \{[\s\S]*?\n  \}/m)}
  return { queryBucket, rankBucket, normalizeLang, depthReached, worthMeasuring,
           OPT_OUT_KEY, OPT_OUT_STRINGS, readOptOut, writeOptOut };
`;
const M = new Function(harness)();

let passed = 0;
const failures = [];
const check = async (label, fn) => {
  try { await fn(); passed += 1; console.log('  ✓ ' + label); }
  catch (err) { failures.push(`${label}\n    ${err.message}`); console.log('  ✗ ' + label); }
};

await check('搜尋關鍵字一個字都沒有離開這支腳本', () => {
  // track 的第二個參數只准出現級距函式的回傳，不准出現 query、box.value 這些
  const calls = [...code.matchAll(/track\(\s*"[a-z-]+"\s*,\s*\{([^}]*)\}\s*\)/g)].map((m) => m[1]);
  assert.ok(calls.length >= 5, `只找到 ${calls.length} 個 track 呼叫，抽取可能失效了`);
  for (const body of calls) {
    assert.ok(!/\bquery\b(?!\.length)/.test(body), `track 的 data 裡出現了 query：${body}`);
    assert.ok(!/\.value\b/.test(body), `track 的 data 裡出現了 .value：${body}`);
    assert.ok(!/textContent|innerText|innerHTML/.test(body), `track 的 data 裡出現了頁面文字：${body}`);
  }
});

await check('字數級距的邊界', () => {
  assert.equal(M.queryBucket(0), 'short');
  assert.equal(M.queryBucket(1), 'short');
  assert.equal(M.queryBucket(2), 'medium');
  assert.equal(M.queryBucket(4), 'medium');
  assert.equal(M.queryBucket(5), 'long');
  assert.equal(M.queryBucket(200), 'long');
});

await check('點擊位置級距的邊界', () => {
  assert.equal(M.rankBucket(0), 'first');
  assert.equal(M.rankBucket(1), 'top3');
  assert.equal(M.rankBucket(2), 'top3');
  assert.equal(M.rankBucket(3), 'rest');
  // 找不到元素時 indexOf 回 -1，不該當成第四名以後
  assert.equal(M.rankBucket(-1), 'first');
});

await check('級距的值都通得過 anoniBeforeSend 的 VALUE_RE', () => {
  // main.html 那道白名單只收 [A-Za-z0-9/_-]。這裡用了 + 或空白就會整筆被丟掉，
  // 而丟掉不會有任何錯誤訊息，數字只是永遠是零。
  const VALUE_RE = /^[A-Za-z0-9/_-]{1,32}$/;
  const values = [
    M.queryBucket(1), M.queryBucket(3), M.queryBucket(9),
    M.rankBucket(0), M.rankBucket(1), M.rankBucket(5),
    M.normalizeLang('zh-TW'), M.normalizeLang('zh'), M.normalizeLang('en'),
    '25', '50', '75', '100',
  ];
  for (const v of values) assert.ok(VALUE_RE.test(v), `「${v}」會被白名單擋掉`);
});

await check('語系代號統一成選單用的那套', () => {
  // documentElement.lang 是 zh-TW / zh / en，hreflang 是 zh-TW / zh-CN / en
  assert.equal(M.normalizeLang('zh'), 'zh-CN', 'zh-cn 版的 html lang 是 zh');
  assert.equal(M.normalizeLang('zh-CN'), 'zh-CN');
  assert.equal(M.normalizeLang('zh-TW'), 'zh-TW');
  assert.equal(M.normalizeLang('en'), 'en');
  assert.equal(M.normalizeLang('en-US'), 'en');
  assert.equal(M.normalizeLang(''), 'unknown');
  assert.equal(M.normalizeLang('ja'), 'other');
});

await check('閱讀深度的邊界', () => {
  // 視窗 800、文件 4000。每個門檻都驗兩側，只驗剛好踩到的那一點的話，門檻被改動
  // 一兩個百分點測試照樣綠，而之後看到的數字已經是錯的。
  assert.equal(M.depthReached(0, 800, 4000), 0);       // 20%
  assert.equal(M.depthReached(199, 800, 4000), 0);     // 24.975%
  assert.equal(M.depthReached(200, 800, 4000), 25);    // 25%
  assert.equal(M.depthReached(1199, 800, 4000), 25);   // 49.975%
  assert.equal(M.depthReached(1200, 800, 4000), 50);
  assert.equal(M.depthReached(2199, 800, 4000), 50);   // 74.975%
  assert.equal(M.depthReached(2200, 800, 4000), 75);
  assert.equal(M.depthReached(3159, 800, 4000), 75);   // 98.975%
  assert.equal(M.depthReached(3160, 800, 4000), 100);  // 99%
  assert.equal(M.depthReached(3200, 800, 4000), 100);  // 視窗底部碰到文件底部
  assert.equal(M.depthReached(0, 800, 0), 0, '文件高度為零不該除以零');
});

await check('一屏看得完的頁面不量深度', () => {
  assert.equal(M.worthMeasuring(800, 900), false);
  assert.equal(M.worthMeasuring(800, 1200), false);
  assert.equal(M.worthMeasuring(800, 1300), true);
  // 比視窗還短的頁面若照量，載入當下就是 100，平均值會被灌爆
  assert.equal(M.depthReached(0, 800, 600), 100, '比視窗短的頁面一載入就是 100');
});

await check('退出開關讀寫的是 umami 內建的那個鍵', () => {
  // script.js 的 U() 檢查 localStorage 的 umami.disabled，有值就一筆都不送
  assert.equal(M.OPT_OUT_KEY, 'umami.disabled');
  const store = new Map();
  const storage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  assert.equal(M.readOptOut(storage), false);
  assert.equal(M.writeOptOut(storage, true), true);
  assert.equal(store.get('umami.disabled'), '1');
  assert.equal(M.readOptOut(storage), true);
  M.writeOptOut(storage, false);
  assert.equal(M.readOptOut(storage), false);
  assert.equal(store.has('umami.disabled'), false, '關掉之後要真的移除，不是留一個空值');
});

await check('localStorage 被瀏覽器擋住時不丟例外', () => {
  const blocked = {
    getItem() { throw new Error('SecurityError'); },
    setItem() { throw new Error('SecurityError'); },
    removeItem() { throw new Error('SecurityError'); },
  };
  assert.equal(M.readOptOut(blocked), false);
  assert.equal(M.writeOptOut(blocked, true), false);
  assert.equal(M.readOptOut(null), false);
});

await check('退出開關三個語系都有，沒有漏翻譯', () => {
  const keys = Object.keys(M.OPT_OUT_STRINGS['zh-TW']).sort();
  assert.deepEqual(Object.keys(M.OPT_OUT_STRINGS), ['zh-TW', 'zh-CN', 'en'],
    '語系鍵要跟 normalizeLang 的回傳對得上');
  for (const lang of ['zh-CN', 'en']) {
    assert.deepEqual(Object.keys(M.OPT_OUT_STRINGS[lang]).sort(), keys, `${lang} 的欄位跟 zh-TW 不一致`);
    for (const k of keys) {
      assert.ok(M.OPT_OUT_STRINGS[lang][k], `${lang}.${k} 是空的`);
      assert.notEqual(M.OPT_OUT_STRINGS[lang][k], M.OPT_OUT_STRINGS['zh-TW'][k],
        `${lang}.${k} 跟 zh-TW 一模一樣，多半是忘了翻`);
    }
  }
});

await check('zh-CN 與 en 的 analytics.js 是指向 zh-TW 的 symlink', () => {
  // 這個 repo 的慣例是只有 zh-TW 一份真檔，其餘語系用 symlink 指過去（其他九支 js
  // 都是這樣）。用 cp 複製也能通過內容比對，但那一刻起兩份就會各自漂移，而漂移
  // 之後兩邊都還是「正確的 JavaScript」，只有讀者會拿到舊版。
  const files = LOCALES.map((l) => path.join(HERE, '..', 'docs', l, 'js', 'analytics.js'));
  for (const f of files) assert.ok(fs.existsSync(f), `${f} 不存在`);
  assert.ok(!fs.lstatSync(files[0]).isSymbolicLink(), 'zh-TW 那份應該是真檔');
  for (let i = 1; i < files.length; i++) {
    assert.ok(fs.lstatSync(files[i]).isSymbolicLink(),
      `${LOCALES[i]} 那份是實體檔案，應該改成指向 zh-TW 的 symlink`);
    assert.equal(fs.realpathSync(files[i]), fs.realpathSync(files[0]),
      `${LOCALES[i]} 的 symlink 指到了別的地方`);
  }
  // 慣例本身也要對得上：其他 js 都是同一套做法
  const peer = path.join(HERE, '..', 'docs', 'en', 'js', 'leaks.js');
  assert.ok(fs.lstatSync(peer).isSymbolicLink(), '參照對象 en/js/leaks.js 不是 symlink，慣例可能已經改了');
});

await check('沒有寫入 cookie，也沒有動 localStorage 的其他鍵', () => {
  assert.ok(!/document\.cookie/.test(code), '出現了 document.cookie');
  const keys = [...code.matchAll(/(?:setItem|getItem|removeItem)\(\s*([^,)]+)/g)].map((m) => m[1].trim());
  for (const k of keys) {
    assert.equal(k, 'OPT_OUT_KEY', `動到了 OPT_OUT_KEY 以外的儲存鍵：${k}`);
  }
});

if (failures.length) {
  console.log(`\n${passed} 通過，${failures.length} 失敗\n`);
  failures.forEach((f) => console.log('  ' + f));
  process.exit(1);
}
console.log(`\n${passed} 通過，0 失敗`);
