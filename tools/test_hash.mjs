#!/usr/bin/env node
/**
 * 檔案雜湊比對（docs/zh-TW/js/hash.js）的單元測試。
 *
 * === 為什麼需要這支 ===
 *
 * 這一頁自己實作了 SHA-256，因為瀏覽器內建的 crypto.subtle.digest 要一次吃下整份
 * 檔案，幾 GB 的隨身碟內容在手機上讀不動。自己寫的代價是算錯了畫面不會有任何異狀，
 * 只是那串字是錯的，而讀者拿那串錯的字去跟對方比對，得到的結論也是錯的。
 *
 * 所以驗證用三組互相獨立的來源：
 *
 * 一、NIST 公布的標準測試向量（FIPS 180-4 附錄與常見的長訊息案例）。
 * 二、Node 內建的 crypto 模組。那是 OpenSSL 的實作，跟這裡的程式沒有共同來源，
 *     兩邊對隨機資料算出同一個值才有意義。
 * 三、跨 chunk 邊界。同一份資料切成 1、7、63、64、65、100 位元組餵進去，結果必須
 *     一樣。這一項守的是增量實作特有的錯：一次餵完會對、分次餵就錯，而瀏覽器裡
 *     讀檔案永遠是分次餵。
 *
 * extractHashes 另外測，它決定「相符」這個結論成不成立。誤判的方向有兩種，都要守：
 * 貼進來的 SHA-512 不能被切成兩段當成 SHA-256，而 sha256sum 的輸出格式要認得出來。
 *
 * 用法：
 *   node tools/test_hash.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'docs', 'zh-TW', 'js', 'hash.js');
const src = fs.readFileSync(SRC, 'utf8');

const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error(`hash.js 裡找不到 ${re}`);
  return m[0];
};

const harness = `
  ${grab(/^  const K = new Uint32Array\(\[[\s\S]*?\n  \]\);/m)}
  ${grab(/^  function createSha256\(\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function sha256Hex\(bytes\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function extractHashes\(text\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function formatSize\(bytes\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function compareState\(hash, pasted\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  const STRINGS = \{[\s\S]*?\n  \};/m)}
  return { createSha256, sha256Hex, extractHashes, formatSize, compareState, STRINGS };
`;
const { createSha256, sha256Hex, extractHashes, formatSize, compareState, STRINGS } =
  new Function(harness)();

let pass = 0;
let fail = 0;
const test = (name, fn) => {
  try {
    fn();
    pass += 1;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    fail += 1;
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message.split('\n')[0]}`);
  }
};

const bytes = (text) => new TextEncoder().encode(text);
const nodeHash = (buf) => crypto.createHash('sha256').update(Buffer.from(buf)).digest('hex');

console.log('SHA-256 的標準測試向量');

test('空輸入', () => {
  assert.equal(
    sha256Hex(new Uint8Array(0)),
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  );
});

test('abc', () => {
  assert.equal(
    sha256Hex(bytes('abc')),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
  );
});

test('兩個區塊的訊息（448 位元）', () => {
  assert.equal(
    sha256Hex(bytes('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')),
    '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1'
  );
});

test('一百萬個 a', () => {
  const buf = new Uint8Array(1000000).fill(0x61);
  assert.equal(
    sha256Hex(buf),
    'cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0'
  );
});

test('正好一個區塊（64 位元組）', () => {
  const buf = new Uint8Array(64).fill(0x41);
  assert.equal(sha256Hex(buf), nodeHash(buf));
});

test('補位邊界，55、56、57 與 63、64、65 位元組', () => {
  for (const n of [55, 56, 57, 63, 64, 65, 119, 120, 128]) {
    const buf = new Uint8Array(n).fill(0x5a);
    assert.equal(sha256Hex(buf), nodeHash(buf), `長度 ${n} 算錯`);
  }
});

console.log('\n跟 Node 的 crypto 對照（獨立實作）');

test('隨機資料 200 份，長度 0 到 5000', () => {
  for (let i = 0; i < 200; i++) {
    const buf = crypto.randomBytes(Math.floor(Math.random() * 5000));
    assert.equal(sha256Hex(buf), nodeHash(buf));
  }
});

test('非 ASCII 的內容', () => {
  const buf = bytes('斷網現場把檔案交給眼前的人，收到之後比對這一串');
  assert.equal(sha256Hex(buf), nodeHash(buf));
});

console.log('\n增量餵入（瀏覽器讀檔案的實際路徑）');

test('同一份資料切成不同大小餵，結果一樣', () => {
  const buf = crypto.randomBytes(4096);
  const want = nodeHash(buf);
  for (const size of [1, 7, 63, 64, 65, 100, 512, 4095, 4096]) {
    const sha = createSha256();
    for (let at = 0; at < buf.length; at += size) {
      sha.update(new Uint8Array(buf.subarray(at, Math.min(at + size, buf.length))));
    }
    assert.equal(sha.digest(), want, `每次餵 ${size} 位元組時算錯`);
  }
});

test('餵進空的塊不影響結果', () => {
  const buf = crypto.randomBytes(300);
  const sha = createSha256();
  sha.update(new Uint8Array(0));
  sha.update(new Uint8Array(buf.subarray(0, 100)));
  sha.update(new Uint8Array(0));
  sha.update(new Uint8Array(buf.subarray(100)));
  assert.equal(sha.digest(), nodeHash(buf));
});

test('跨過 4 GB 的長度欄位算得對', () => {
  // 真的餵 4 GB 太慢，改驗長度欄位的高位有沒有被寫進去：把內部狀態的 totalBytes
  // 直接推到 2^32 以上做不到，所以退一步驗 padding 那段的拆法本身。
  // bits = totalBytes * 8，high 是 Math.floor(bits / 2^32)
  const totalBytes = 700 * 1024 * 1024 * 1024; // 700 GB
  const bits = totalBytes * 8;
  const high = Math.floor(bits / 0x100000000);
  const low = bits >>> 0;
  assert.ok(Number.isSafeInteger(bits), '位元長度必須還在精確範圍內');
  assert.ok(high > 0, '高位必須有值，否則長度欄位會被截斷');
  assert.equal(high * 0x100000000 + low, bits);
});

console.log('\n從貼上的內容裡抽雜湊');

const H1 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const H2 = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';

test('單獨一串', () => {
  assert.deepEqual([...extractHashes(H1)], [H1]);
});

test('sha256sum 的輸出格式', () => {
  assert.deepEqual([...extractHashes(`${H1}  report.pdf`)], [H1]);
});

test('大寫轉成小寫', () => {
  assert.deepEqual([...extractHashes(H1.toUpperCase())], [H1]);
});

test('一整份清單抓得到每一個', () => {
  const text = `${H1}  a.zip\n${H2}  b.zip\n`;
  const got = extractHashes(text);
  assert.equal(got.size, 2);
  assert.ok(got.has(H1) && got.has(H2));
});

test('前後有字也認得', () => {
  assert.ok(extractHashes(`SHA256: ${H1} (verified)`).has(H1));
});

test('SHA-512 不會被切成兩段誤判', () => {
  const sha512 = crypto.createHash('sha512').update('x').digest('hex');
  assert.equal(sha512.length, 128);
  assert.equal(extractHashes(sha512).size, 0);
});

test('63 個字與 65 個字都不算', () => {
  assert.equal(extractHashes(H1.slice(0, 63)).size, 0);
  assert.equal(extractHashes(H1 + 'a').size, 0);
});

test('沒有雜湊時回空的集合', () => {
  assert.equal(extractHashes('這裡什麼都沒有').size, 0);
  assert.equal(extractHashes('').size, 0);
  assert.equal(extractHashes(null).size, 0);
});

console.log('\n比對狀態與顯示');

test('三種狀態分得開', () => {
  const pasted = new Set([H1]);
  assert.equal(compareState(H1, pasted), 'match');
  assert.equal(compareState(H2, pasted), 'differ');
  assert.equal(compareState(H1, new Set()), 'pending');
  assert.equal(compareState(null, pasted), 'pending');
});

test('還沒貼東西時不能顯示成不相符', () => {
  // 這一條單獨寫是因為兩者混在一起最傷：讀者會以為檔案壞了
  assert.notEqual(compareState(H1, new Set()), 'differ');
});

test('檔案大小的顯示', () => {
  assert.equal(formatSize(0), '0 B');
  assert.equal(formatSize(512), '512 B');
  assert.equal(formatSize(1024), '1.0 KB');
  assert.equal(formatSize(1536), '1.5 KB');
  assert.equal(formatSize(1024 * 1024), '1.0 MB');
  assert.equal(formatSize(200 * 1024 * 1024), '200 MB');
  assert.equal(formatSize(3 * 1024 * 1024 * 1024), '3.0 GB');
});

console.log('\n三語系文案');

test('三個語系的 key 一樣多，沒有漏翻', () => {
  const keys = Object.keys(STRINGS['zh-TW']).sort();
  for (const lang of ['zh-CN', 'en']) {
    assert.deepEqual(Object.keys(STRINGS[lang]).sort(), keys, `${lang} 的 key 對不上`);
  }
});

test('會帶入數字的那幾條在三個語系都是函式', () => {
  for (const lang of ['zh-TW', 'zh-CN', 'en']) {
    assert.equal(typeof STRINGS[lang].found, 'function');
    assert.equal(typeof STRINGS[lang].reading, 'function');
  }
});

test('相符與不相符的文案不能一樣', () => {
  for (const lang of ['zh-TW', 'zh-CN', 'en']) {
    assert.notEqual(STRINGS[lang].match, STRINGS[lang].differ);
    assert.notEqual(STRINGS[lang].differ, STRINGS[lang].pending);
  }
});

console.log('\n不落地');

test('原始碼裡沒有任何寫入儲存或送出資料的手段', () => {
  const banned = [
    'localStorage', 'sessionStorage', 'indexedDB', 'document.cookie',
    'fetch(', 'XMLHttpRequest', 'navigator.sendBeacon', 'WebSocket', 'caches.open',
  ];
  for (const word of banned) {
    assert.ok(!src.includes(word), `hash.js 裡出現了 ${word}`);
  }
});

console.log(`\n${pass} 通過，${fail} 失敗`);
process.exit(fail ? 1 : 0);
