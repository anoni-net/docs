#!/usr/bin/env node
/**
 * QR code 讀取器（docs/zh-TW/js/qrread.js）的單元測試。
 *
 * === 為什麼需要這支 ===
 *
 * 解碼交給 vendor 的 jsQR，這裡要驗的是「我們呼叫的方式對不對」與「讀回來的內容
 * 怎麼呈現給讀者」。後者比想像中重要：解出來的可能是釣魚網址，工具不該讓讀者一按
 * 就開，也不該把它渲染成可點的連結。
 *
 * === 往返怎麼做 ===
 *
 * 用 qrcode-generator 產生已知內容的碼、把模組矩陣放大成像素、再交給 jsQR 讀回來比對。
 * 編碼與解碼是兩個各自獨立的函式庫，互相驗證比拿同一份程式碼驗自己有意義。這也順便
 * 守住一件事：qrcode.js 產生的碼，qrread.js 讀得回來。
 *
 * 用法：
 *   node tools/test_qrread.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'docs', 'zh-TW', 'js', 'qrread.js');
const VENDOR = path.join(HERE, '..', 'docs', 'zh-TW', 'utils', 'vendor');
const src = fs.readFileSync(SRC, 'utf8');
const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const require_ = createRequire(import.meta.url);
const qrcode = require_(path.join(VENDOR, 'qrcode-generator.js'));
const jsQR = require_(path.join(VENDOR, 'jsQR.js'));
qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];

const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error(`qrread.js 裡找不到 ${re}`);
  return m[0];
};

const harness = `
  ${grab(/^  const SCALE = .*$/m)}
  ${grab(/^  const QUIET = .*$/m)}
  ${grab(/^  function classify\(text\) \{[\s\S]*?\n  \}/m)}
  return { SCALE, QUIET, classify };
`;
const tool = new Function(harness)();

// 把 qrcode-generator 的矩陣放大成 RGBA 像素，模擬讀者上傳的圖片
function render(text, level = 'M', scale = 6, quiet = 4) {
  const qr = qrcode(0, level);
  qr.addData(text);
  qr.make();
  const count = qr.getModuleCount();
  const size = (count + quiet * 2) * scale;
  const data = new Uint8ClampedArray(size * size * 4).fill(255);
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!qr.isDark(row, col)) continue;
      for (let y = 0; y < scale; y += 1) {
        for (let x = 0; x < scale; x += 1) {
          const px = ((row + quiet) * scale + y) * size + (col + quiet) * scale + x;
          data[px * 4] = 0;
          data[px * 4 + 1] = 0;
          data[px * 4 + 2] = 0;
        }
      }
    }
  }
  return { data, width: size, height: size };
}

const roundTrip = (text, level) => {
  const img = render(text, level);
  const result = jsQR(img.data, img.width, img.height);
  return result ? result.data : null;
};

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('產生的碼讀得回來，一字不差', () => {
  for (const text of [
    'hello',
    'https://anoni.net/docs/',
    'http://docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/',
    '匿名網路社群 anoni.net',
  ]) {
    assert.equal(roundTrip(text), text, `${text.slice(0, 20)} 對不上`);
  }
});

test('四種容錯度都讀得回來', () => {
  for (const level of ['L', 'M', 'Q', 'H']) {
    assert.equal(roundTrip('anoni.net', level), 'anoni.net', `${level} 級讀不回來`);
  }
});

test('長內容也讀得回來', () => {
  const bridge =
    'obfs4 192.0.2.1:9001 ABCDEF0123456789ABCDEF0123456789ABCDEF01 ' +
    'cert=aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789abcdefghijklmnopqrstuvwxyzAB iat-mode=0';
  assert.equal(roundTrip(bridge), bridge);
});

test('沒有 QR code 的圖回 null，不是丟例外', () => {
  const blank = new Uint8ClampedArray(100 * 100 * 4).fill(255);
  assert.equal(jsQR(blank, 100, 100), null);
});

test('內容分類：網址、onion、bridge、純文字', () => {
  assert.equal(tool.classify('https://anoni.net/').kind, 'url');
  assert.equal(tool.classify('http://example.onion/').kind, 'onion');
  assert.equal(tool.classify('obfs4 192.0.2.1:9001 ABCDEF cert=x iat-mode=0').kind, 'bridge');
  assert.equal(tool.classify('就是一段字').kind, 'text');
  assert.equal(tool.classify('WIFI:S:name;T:WPA;P:pass;;').kind, 'wifi');
});

test('網址分類會標出主機，讓讀者自己看清楚', () => {
  // 釣魚 QR 的重點就在這裡：內容看起來像官網，主機不是
  const info = tool.classify('https://аpple.com/login');
  assert.equal(info.kind, 'url');
  assert.equal(info.host, 'xn--pple-43d.com', '同形字主機要顯示成 punycode 才看得出問題');
});

test('不是網址的東西不會被誤判成網址', () => {
  for (const text of ['hello world', '這是一段中文', '12345', 'not a url at all']) {
    assert.equal(tool.classify(text).kind, 'text', `${text} 被誤判了`);
  }
});

test('放大倍率與留白留得夠，太小的話 jsQR 讀不到', () => {
  assert.ok(tool.SCALE >= 4, `SCALE 只有 ${tool.SCALE}`);
  assert.ok(tool.QUIET >= 4, `QUIET 只有 ${tool.QUIET}`);
});

test('沒有任何網路請求，圖片不上傳', () => {
  // 讀者掃的可能是他不想外流的東西
  for (const needle of ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket',
                        'localStorage', 'sessionStorage', 'indexedDB']) {
    assert.ok(!code.includes(needle), `出現了 ${needle}`);
  }
});

test('不把解出來的內容渲染成可點的連結', () => {
  // 解出來的可能是釣魚網址。顯示可以，一按就開不行。
  assert.ok(!/createElement\(["']a["']\)/.test(code), '出現了 createElement("a")');
  assert.ok(!code.includes('window.open'), '出現了 window.open');
  assert.ok(!code.includes('location.href ='), '出現了跳轉');
});

for (const [name, fn] of tests) {
  try {
    fn();
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
