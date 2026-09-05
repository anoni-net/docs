#!/usr/bin/env node
/**
 * 加密暫存區的核心測試。
 *
 * === 為什麼需要這支 ===
 *
 * 這一層的整個立論是「user.id 那 32 個位元組直接就是一把 age 私鑰」。編碼錯一個位元
 * 組，加密看起來照樣成功，讀者要等到換裝置解不開才發現，而那時候資料已經累積了一陣
 * 子。這裡把編碼、加密、解密的往返在 Node 上跑一遍，用的是 vendor 裡那份 typage。
 *
 * 另外守兩條規則：金鑰不進任何持久儲存，以及 passkey 一定要建成 discoverable。後者
 * 少了的話驗證時不會回傳 userHandle，整條路就斷了，而那在瀏覽器上不會報錯，只會拿到
 * 一個空值。
 *
 * === 怎麼驗 ===
 *
 * 跟 test_agecrypt.mjs 同一套做法：函式從 vault.js 原地抽出來執行，typage 從 vendor
 * 複製成 node_modules 的形狀載入。
 *
 * 用法：
 *   node tools/test_vault.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'docs', 'zh-TW', 'js', 'vault.js');
const VENDOR = path.join(HERE, '..', 'docs', 'zh-TW', 'utils', 'vendor', 'age');
const src = fs.readFileSync(SRC, 'utf8');

const PKG_DIRS = {
  'age-encryption': 'age-encryption',
  '@noble/ciphers': 'noble-ciphers',
  '@noble/curves': 'noble-curves',
  '@noble/hashes': 'noble-hashes',
  '@noble/post-quantum': 'noble-post-quantum',
  '@scure/base': 'scure-base',
};

function copyTree(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, entry.name);
    const b = path.join(to, entry.name);
    if (entry.isDirectory()) copyTree(a, b);
    else fs.copyFileSync(a, b);
  }
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'anoni-vault-'));
for (const [name, dir] of Object.entries(PKG_DIRS)) {
  copyTree(path.join(VENDOR, dir), path.join(tmp, 'node_modules', name));
}
const nm = (p) => pathToFileURL(path.join(tmp, 'node_modules', p)).href;
const age = await import(nm('age-encryption/dist/index.js'));
const base = await import(nm('@scure/base/index.js'));

const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error(`vault.js 裡找不到 ${re}`);
  return m[0];
};

// 抽出來的函式在 vault.js 裡靠 lib() 與 import("@scure/base") 拿相依，這裡直接餵進去
const harness = `
  const lib = async () => age;
  const importBase = async () => base;
  ${grab(/^  async function identityOf\(keyBytes\) \{[\s\S]*?\n  \}/m).replace('await import("@scure/base")', 'await importBase()')}
  ${grab(/^  async function recipientOf\(identity\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  async function encryptData\(data, keyBytes, backupRecipient\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  async function decryptData\(bytes, identity\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  const ENVELOPE_VERSION = .*$/m)}
  ${grab(/^  function wrapEnvelope\(data, backupRecipient\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function unwrapEnvelope\(obj\) \{[\s\S]*?\n  \}/m)}
  return { identityOf, recipientOf, encryptData, decryptData, wrapEnvelope, unwrapEnvelope, ENVELOPE_VERSION };
`;
const vault = new Function('age', 'base', harness)(age, base);

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('那 32 個位元組編出來的 identity 跟 typage 自己產的同一個形狀', async () => {
  const key = new Uint8Array(32).fill(7);
  const identity = await vault.identityOf(key);
  assert.match(identity, /^AGE-SECRET-KEY-1[0-9A-Z]+$/);

  const mine = await vault.identityOf(key);
  assert.equal(mine, identity, '同一把金鑰每次都要編出同一個 identity');

  // typage 自己產的那一把拿來比長度與前綴，確認我們沒有編成別的東西
  const theirs = await age.generateX25519Identity();
  assert.equal(identity.length, theirs.length);
});

test('金鑰算得出收件人，而且不同金鑰算出不同收件人', async () => {
  const a = await vault.recipientOf(await vault.identityOf(new Uint8Array(32).fill(1)));
  const b = await vault.recipientOf(await vault.identityOf(new Uint8Array(32).fill(2)));
  assert.match(a, /^age1[0-9a-z]+$/);
  assert.notEqual(a, b);
});

test('加密再解密，內容一個位元組不差', async () => {
  const key = crypto.getRandomValues(new Uint8Array(32));
  const data = { note: '一段有中文的內容\n第二行', list: [1, 2, 3], when: '2026-09-05' };
  const blob = await vault.encryptData(data, key, null);
  const back = await vault.decryptData(blob, await vault.identityOf(key));
  assert.deepEqual(back, data);
});

test('換一把金鑰解不開', async () => {
  const key = crypto.getRandomValues(new Uint8Array(32));
  const other = crypto.getRandomValues(new Uint8Array(32));
  const blob = await vault.encryptData({ a: 1 }, key, null);
  await assert.rejects(() => vault.decryptData(blob, vault.identityOf(other).then((i) => i)));
});

test('帶了備援公鑰時，備援私鑰也解得開同一份', async () => {
  // 這是 Tor Browser 那種沒有 WebAuthn 的環境唯一的路，也是 passkey 全丟時的救援
  const key = crypto.getRandomValues(new Uint8Array(32));
  const backupIdentity = await age.generateX25519Identity();
  const backupRecipient = await age.identityToRecipient(backupIdentity);
  const data = { note: '救援用' };

  const blob = await vault.encryptData(data, key, backupRecipient);
  assert.deepEqual(await vault.decryptData(blob, await vault.identityOf(key)), data);
  assert.deepEqual(await vault.decryptData(blob, backupIdentity), data);
});

test('沒帶備援公鑰時，備援私鑰解不開', async () => {
  const key = crypto.getRandomValues(new Uint8Array(32));
  const backupIdentity = await age.generateX25519Identity();
  const blob = await vault.encryptData({ a: 1 }, key, null);
  await assert.rejects(() => vault.decryptData(blob, backupIdentity));
});

test('輸出是標準 age 檔，命令列那邊也認得', async () => {
  const key = crypto.getRandomValues(new Uint8Array(32));
  const blob = await vault.encryptData({ a: 1 }, key, null);
  const head = Buffer.from(blob.slice(0, 30)).toString('latin1');
  assert.ok(head.startsWith('age-encryption.org/v1\n'), '檔頭不是 age 的版本行');
});

test('信封帶版本與備援公鑰，資料在 data 底下', () => {
  const env = vault.wrapEnvelope({ note: 'x' }, 'age1abc');
  assert.equal(env.v, vault.ENVELOPE_VERSION);
  assert.equal(env.backupRecipient, 'age1abc');
  assert.deepEqual(env.data, { note: 'x' });
  // 沒給備援就是 null，不是 undefined 也不是空字串，讀回來才好判斷
  assert.equal(vault.wrapEnvelope({}, '').backupRecipient, null);
  assert.equal(vault.wrapEnvelope({}, undefined).backupRecipient, null);
});

test('第一版之前的密文沒有信封，整個物件當資料，備援視為沒設', () => {
  // 讀者裝置上已經有那種形狀的密文，換版不能讓它讀不出來
  const legacy = vault.unwrapEnvelope({ note: '舊的' });
  assert.deepEqual(legacy.data, { note: '舊的' });
  assert.equal(legacy.backupRecipient, null);
  assert.deepEqual(vault.unwrapEnvelope(null).data, {});
});

test('備援公鑰跟著密文走：第二個 session 存的東西，備援私鑰照樣解得開', async () => {
  // 這是被修掉的那個 bug。原本 save 要呼叫端傳備援公鑰，重開頁面解鎖之後那個值是空
  // 的，之後每一次儲存都把備援收件人丟掉，備援私鑰只打得開建立當下那一份。
  const key = crypto.getRandomValues(new Uint8Array(32));
  const backupIdentity = await age.generateX25519Identity();
  const backupRecipient = await age.identityToRecipient(backupIdentity);

  // 第一個 session：建立時帶備援
  const first = await vault.encryptData(vault.wrapEnvelope({}, backupRecipient), key, backupRecipient);
  // 第二個 session：解開，讀出信封裡的備援公鑰，只憑它繼續加密
  const opened = vault.unwrapEnvelope(await vault.decryptData(first, await vault.identityOf(key)));
  assert.equal(opened.backupRecipient, backupRecipient, '解開後要讀得回備援公鑰');
  const second = await vault.encryptData(
    vault.wrapEnvelope({ note: '第二次存的' }, opened.backupRecipient),
    key,
    opened.backupRecipient
  );
  // 備援私鑰要打得開第二次存的那份，這正是原本壞掉的地方
  const viaBackup = vault.unwrapEnvelope(await vault.decryptData(second, backupIdentity));
  assert.deepEqual(viaBackup.data, { note: '第二次存的' });
});

test('save 只認記憶體裡的備援公鑰，呼叫端傳不進第二個參數', () => {
  // 讓「傳錯」這件事在型別上就不可能發生
  assert.ok(/async save\(data\) \{/.test(src), 'save 的簽名該只有 data');
  assert.ok(/wrapEnvelope\(data, currentBackup\), unlockedKey, currentBackup/.test(src), 'save 沒有用 currentBackup');
  assert.ok(/currentBackup = backup;/.test(src), 'unlock 沒有把備援公鑰讀回記憶體');
});

test('鑰匙頁只建鑰匙不留痕跡，暫存區頁能用已有的鑰匙開', () => {
  // createKey 給鑰匙頁用，那一頁承諾站上什麼都不存，所以它不能碰 writeBlob 也不能設
  // unlockedKey。openWithExisting 給在鑰匙頁建過的讀者，驗證一次拿回金鑰、寫一份空密文。
  const createKey = src.match(/async createKey\(\) \{[\s\S]*?\n    \}/)[0];
  assert.ok(!/writeBlob|api\.save|unlockedKey =/.test(createKey), 'createKey 不能留下任何東西');
  assert.ok(/return createCredential\(keyBytes\)/.test(createKey));

  const openExisting = src.match(/async openWithExisting\(backupRecipient\) \{[\s\S]*?\n    \}/)[0];
  assert.ok(/await keyFromCredential\(\)/.test(openExisting), '要用驗證拿回金鑰，不是建新的');
  assert.ok(!/createCredential/.test(openExisting), '不能建第二把');
  assert.ok(/await api\.save\(\{\}\)/.test(openExisting), '要寫一份空的密文');

  // 不同步裝置的那一支改了名，避免跟「用已有的鑰匙」混淆
  assert.ok(/async enrollDevice\(keyBytes\)/.test(src));
  assert.ok(!/async adopt\(/.test(src));
});

test('整支程式不把金鑰寫進任何持久儲存', () => {
  // 解鎖之後金鑰只活在記憶體裡，分頁關掉就沒了。這條規則寫壞了不會有任何症狀，
  // 只會讓一把長期有效的金鑰躺在裝置上。
  assert.ok(
    !/localStorage|sessionStorage|document\.cookie/.test(src),
    'vault.js 不該碰那幾種儲存'
  );
  // IndexedDB 只存密文，存進去的東西必須是 encryptData 的輸出
  assert.ok(/writeBlob\(bytes\)/.test(src));
  assert.ok(!/writeBlob\((unlockedKey|keyBytes)/.test(src), '金鑰不該被寫進資料庫');
});

test('passkey 一定建成 discoverable，否則驗證時拿不回 userHandle', () => {
  assert.ok(
    /residentKey: "required"/.test(src),
    'residentKey 不是 required 的話，驗證時 userHandle 會是空的，整條路會斷'
  );
  assert.ok(/userVerification: "required"/.test(src));
  // user.id 必須就是那把金鑰，放別的東西進去就沒有意義了
  assert.ok(/user: \{ id: keyBytes,/.test(src));
});

test('建立時同時要 PRF，拿不到也不失敗', () => {
  // 一把鑰匙服務兩件事：user.id 給暫存區，PRF 給本機檔案加密。讀者的密碼管理器裡
  // 因此只需要一筆。iPhone 配第三方密碼管理器拿不到 PRF，那時暫存區照樣要能用。
  const block = src.match(/async function createCredential\(keyBytes\) \{[\s\S]*?\n  \}/)[0];
  assert.ok(/extensions: \{ prf: \{\} \}/.test(block), '建立時沒有要求 PRF');
  assert.ok(
    !/prf.*enabled[\s\S]{0,40}throw/.test(block),
    'PRF 拿不到不該讓建立失敗，暫存區走的是 user.id 那條'
  );
  assert.ok(/hasPrf: !!\(results\.prf && results\.prf\.enabled\)/.test(block), '沒有把結果回報出去');
});

test('寫入等交易 commit 才回報成功', () => {
  // request.onsuccess 只代表請求被接受，資料還在交易裡。在那時回報成功的話，畫面會
  // 說「存好了」，而讀者這時重新整理就沒了。實際遇到的症狀是建立完存第一筆存不進去，
  // 重新整理再存一次才留得住。
  const block = src.match(/function withStore\(mode, run\) \{[\s\S]*?\n  \}/)[0];
  assert.ok(
    /tx\.oncomplete = \(\) => \{[\s\S]*?resolve\(result\)/.test(block),
    'resolve 要放在 tx.oncomplete 裡'
  );
  assert.ok(
    !/request\.onsuccess = \(\) => resolve/.test(block),
    'request.onsuccess 不能直接 resolve'
  );
  assert.ok(/tx\.onabort/.test(block), '交易被中止時要 reject，不能靜靜卡住');
});

test('拿回來的 userHandle 長度不對就當失敗', () => {
  // provider 動過那個欄位的話寧可停下來，不要拿一把錯的金鑰去解密
  assert.ok(/bytes\.length !== KEY_BYTES/.test(src));
});

for (const [name, fn] of tests) {
  try {
    await fn();
    passed += 1;
    console.log('  ✓ ' + name);
  } catch (err) {
    failed += 1;
    console.error('  ✗ ' + name);
    console.error('    ' + String(err.message).split('\n').join('\n    '));
  }
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${passed} 通過，${failed} 失敗`);
process.exit(failed ? 1 : 0);
