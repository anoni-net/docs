#!/usr/bin/env node
/**
 * 忙碌回饋的覆蓋檢查。
 *
 * === 為什麼需要這支 ===
 *
 * 站上每一個「按下去之後有段時間沒有結果可以顯示」的地方，都要在那段時間裡讓
 * 畫面說一聲。少了那一聲，讀者看到的是一個不動的頁面，合理的反應是再按一次，
 * 而他要的那件事其實早就在跑了。移除中繼資料會被重跑一遍整個檔案，換版提示會
 * 多送幾則 SKIP_WAITING。
 *
 * 這種問題只在慢裝置與慢網路上看得出來，本機開發永遠碰不到，改動的人不會知道
 * 自己弄丟了什麼。2026-08-29 的回報就是這樣來的：離線管理頁的進度條在收到第一
 * 筆回報之前是一條靜止的空槽，而 stripmeta 定義了 working 這個字串卻從來沒有
 * 用上，兩者都通過了當時的全部測試。
 *
 * === 怎麼驗 ===
 *
 * 逐檔檢查兩件事：轉圈用的是全站共用的 .anoni-spinner（樣式定義在
 * overrides/base.html，不要各自再寫一份 keyframes），以及狀態有用 aria-busy
 * 講出來，轉圈的圖案對讀螢幕的人沒有意義。
 *
 * 清單是人工維護的。新增一個會等待的互動時，把它加進來。
 *
 * 用法：
 *   node tools/test_busy_feedback.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.join(HERE, '..', 'docs');

// 每一筆都是一個會讓讀者等待的互動。why 寫的是「等的是什麼」，方便後來的人
// 判斷自己的改動有沒有動到這件事。
const WAITS = [
  {
    file: 'overrides/base.html',
    why: '換版提示按下更新之後，activate 加一次完整導覽',
  },
  {
    file: 'zh-TW/js/offline-library.js',
    why: '整批下載，一次四百多個請求',
  },
  {
    file: 'zh-TW/js/stripmeta.js',
    why: '把整個檔案讀進來、重編一次、再解一次驗證',
  },
  {
    file: 'zh-TW/js/qrread.js',
    why: '整張圖解開再掃過一次',
  },
  {
    file: 'zh-TW/js/leaks.js',
    why: '授權視窗跳出來，加上瀏覽器把座標算出來',
  },
  {
    file: 'zh-TW/js/passphrase.js',
    why: '七千多個詞的詞表要抓回來',
  },
  {
    file: 'zh-TW/js/shutdown-card.js',
    why: '按下列印到系統的列印畫面跳出來之間，手機上有好幾秒完全沒有反應',
  },
];

const read = (rel) => fs.readFileSync(path.join(DOCS, rel), 'utf8');

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

for (const entry of WAITS) {
  test(`${entry.file} 等待的時候有轉圈（${entry.why}）`, () => {
    const src = read(entry.file);
    assert.ok(
      src.includes('anoni-spinner'),
      '沒有用到全站共用的轉圈。樣式在 overrides/base.html，不要各自再寫一份'
    );
    assert.ok(
      src.includes('aria-busy'),
      '轉圈的圖案對讀螢幕的人沒有意義，狀態要用 aria-busy 講出來'
    );
  });
}

test('轉圈只定義一次，在 overrides/base.html', () => {
  // 八支小工具各自在 JS 裡注入樣式，各寫一份 keyframes 只會讓「轉多快、多大顆、
  // reduced-motion 要不要停」在八個地方各自漂移。
  const base = read('overrides/base.html');
  assert.ok(base.includes('.anoni-spinner {'), 'base.html 裡找不到 .anoni-spinner 的定義');
  assert.ok(base.includes('@keyframes anoni-spin'), '找不到轉圈的 keyframes');

  const dupes = [];
  for (const entry of WAITS) {
    if (entry.file === 'overrides/base.html') continue;
    if (/@keyframes\s+[\w-]*spin/i.test(read(entry.file))) dupes.push(entry.file);
  }
  assert.deepEqual(dupes, [], '這些檔案自己又寫了一份轉圈的 keyframes');
});

test('轉圈在 prefers-reduced-motion 底下停下來', () => {
  // 會被動態干擾的人不只是偏好問題，前庭系統的症狀是真的不舒服
  // base.html 裡不只一個 reduced-motion 區塊（toast 的進場動畫也有一個），
  // 所以要掃過每一個，不能只看第一個。
  const base = read('overrides/base.html');
  const blocks = [...base.matchAll(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n        \}/g)];
  assert.ok(blocks.length, '找不到 prefers-reduced-motion 的區塊');
  assert.ok(
    blocks.some((b) => /\.anoni-spinner\s*\{[^}]*animation:\s*none/.test(b[0])),
    'reduced-motion 底下轉圈沒有停'
  );
});

test('stripmeta 的 working 字串真的有用上', () => {
  // 三個語系都定義了這個字串，卻一直沒有人使用它，而那正是處理檔案時該顯示的
  // 那一行。定義了沒用的字串在 code review 裡看不出來，只有讀者會發現。
  const src = read('zh-TW/js/stripmeta.js');
  assert.ok(/working:\s*"/.test(src), '找不到 working 這個字串');
  assert.ok(src.includes('t.working'), 'working 定義了卻沒有任何地方用它');
});

for (const [name, fn] of tests) {
  try {
    fn();
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
