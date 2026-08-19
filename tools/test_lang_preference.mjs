#!/usr/bin/env node
/**
 * 語言偏好導向規則的單元測試。
 *
 * === 為什麼需要這支 ===
 *
 * 站台不看 navigator.language，語言只跟著讀者自己選過的走（Tor Browser 預設開
 * privacy.spoof_english，那個值一律回報 en-US，照著猜會把整批用 Tor 的台灣讀者
 * 丟到英文版）。既然是照讀者的選擇動，判斷寫錯的表現就是「莫名其妙被帶去別的
 * 語言」或「選了卻沒作用」，兩種都很難從單次操作看出來，得把偏好、當前語系、
 * 是不是首頁這幾個條件的組合都走過一遍才知道。
 *
 * 最容易寫錯的是「分享出去的 /docs/en/ 不該被偏好蓋掉」這條。網址上有語系區段
 * 就是明確指定過，只有 /docs/ 這個沒有語系區段的入口才輪得到偏好決定。
 *
 * === 怎麼驗 ===
 *
 * 跟 check_focus.mjs、test_sw_offline.mjs 同一套做法：把 langRedirectTo 從
 * overrides/base.html 原地抽出來執行，不重寫一份判斷。DOM 那半（讀切換器、掛橫幅）
 * 留在瀏覽器裡，這裡只驗決策。
 *
 * 用法：
 *   node tools/test_lang_preference.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.join(HERE, '..', 'docs', 'overrides', 'base.html');
const src = fs.readFileSync(BASE, 'utf8');

const re = /^\s*function langRedirectTo\(isHome, currentLang, prefLang, defaultLang\) \{[\s\S]*?\n\s*\}/m;
const found = src.match(re);
if (!found) throw new Error('base.html 裡找不到 langRedirectTo');
const langRedirectTo = new Function(`${found[0]}\nreturn langRedirectTo;`)();

const ZH = 'zh-TW';

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('首頁沒有偏好就不動', () => {
  assert.equal(langRedirectTo(true, ZH, null, ZH), null);
  assert.equal(langRedirectTo(true, ZH, '', ZH), null);
});

test('偏好就是當前語言時不動', () => {
  assert.equal(langRedirectTo(true, ZH, ZH, ZH), null);
  assert.equal(langRedirectTo(true, 'en', 'en', ZH), null);
});

test('預設語系的首頁依偏好換一份', () => {
  assert.equal(langRedirectTo(true, ZH, 'en', ZH), 'en');
  assert.equal(langRedirectTo(true, ZH, 'zh-CN', ZH), 'zh-CN');
});

test('網址上已經有語系區段時不被偏好蓋掉', () => {
  // 別人分享的 /docs/en/ 是明確指定過的，讀者的偏好是中文也不該把他帶走
  assert.equal(langRedirectTo(true, 'en', ZH, ZH), null);
  assert.equal(langRedirectTo(true, 'zh-CN', 'en', ZH), null);
});

test('深連結不動，只有首頁才套用', () => {
  // 深連結是有指向性的，把人帶去另一個語言的首頁等於弄丟他要看的那一頁
  assert.equal(langRedirectTo(false, ZH, 'en', ZH), null);
  assert.equal(langRedirectTo(false, 'en', ZH, ZH), null);
});

test('認不出當前語言時不動', () => {
  // 切換器沒有一條 href 對得上目前網址，這時亂猜不如什麼都不做
  assert.equal(langRedirectTo(true, undefined, 'en', ZH), null);
  assert.equal(langRedirectTo(true, null, 'en', ZH), null);
});

for (const [name, fn] of tests) {
  try {
    await fn();
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
