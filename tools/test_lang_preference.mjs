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

// 導向前的那道確認也抽出來。PWA 的 start_url 是安裝當下那個語系的首頁，讀者的閱讀
// 語言是另一個的話，每次冷啟動都會走這一跳，而離線時跳到沒有副本的地方就是空白。
// 這個函式裡有巢狀的 function，非貪婪比對會停在裡面那個的結尾，所以用縮排定位
// 外層的收尾括號。base.html 裡它縮排十格。
const reRedirect = /^ {10}function redirectTo\(href\) \{[\s\S]*?\n {10}\}/m;
const foundRedirect = src.match(reRedirect);
if (!foundRedirect) throw new Error('base.html 裡找不到 redirectTo');
const loadRedirect = (opts) => {
  const calls = [];
  const location = { replace: (href) => calls.push(href) };
  const navigator = { onLine: opts.onLine };
  const caches = opts.noCaches
    ? undefined
    : { match: async (href) => (opts.cached || []).includes(href) ? 'HIT' : undefined };
  const window = { caches };
  const redirectTo = new Function(
    'window', 'caches', 'navigator', 'location',
    `${foundRedirect[0]}\nreturn redirectTo;`
  )(window, caches, navigator, location);
  return { redirectTo, calls };
};

const ZH = 'zh-TW';

const HOME_EN = 'https://anoni.net/docs/en/';


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

test('離線時跳過去的那一頁沒有副本就留在原地', async () => {
  // PWA 從 zh-TW 的首頁啟動，讀者的閱讀語言是 en，每次冷啟動都會走這一跳。裝置上
  // 沒有 en 首頁的時候跳過去只會停在空白，讀者反而失去手上這一頁看得到的內容。
  const { redirectTo, calls } = loadRedirect({ onLine: false, cached: [] });
  redirectTo(HOME_EN);
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(calls, []);
});

test('離線但裝置上有那一頁就照跳', async () => {
  const { redirectTo, calls } = loadRedirect({ onLine: false, cached: [HOME_EN] });
  redirectTo(HOME_EN);
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(calls, [HOME_EN]);
});

test('線上第一次造訪沒有副本也照跳', async () => {
  // 沒有副本是線上讀者的正常狀態，這裡不該擋
  const { redirectTo, calls } = loadRedirect({ onLine: true, cached: [] });
  redirectTo(HOME_EN);
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(calls, [HOME_EN]);
});

test('瀏覽器沒有 Cache Storage 時照舊直接跳', async () => {
  const { redirectTo, calls } = loadRedirect({ onLine: false, noCaches: true });
  redirectTo(HOME_EN);
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(calls, [HOME_EN]);
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
