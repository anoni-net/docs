#!/usr/bin/env node
/**
 * passkey 鑰匙（docs/zh-TW/js/passkey.js 與 utils/passkey.md）的測試。
 *
 * === 為什麼需要這支 ===
 *
 * 這一頁的承諾是「passkey 算出來的金鑰包住 age 的 file key，站上什麼都不存」。WebAuthn 在 Node
 * 裡跑不起來，所以這裡放一個替身的 navigator.credentials：create 回一把假憑證，get 照真驗證器的
 * hmac-secret 算 PRF（HMAC-SHA256 of 輸入）。typage 的 webauthn 模組原封不動跑在替身上，
 * 產生的段落再用 Node 內建的 crypto 獨立算一次：PRF 兩段接起來、HKDF-extract 以標籤當鹽、
 * ChaCha20-Poly1305 零 nonce 解開 file key。兩邊對得上，typage 的實作才算被驗過。
 *
 * 另一半守頁面：三語系的 utils/passkey.md 存在、import map 跟 age.md 相同、offline_assets
 * 列了 vendor 的每一支 js、nav 與索引都有、age.md 先載 passkey.js 再載 agecrypt.js。
 *
 * 用法：
 *   node tools/test_passkey.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.join(HERE, '..', 'docs');
const VENDOR = path.join(DOCS, 'zh-TW', 'utils', 'vendor', 'age');
const SRC = path.join(DOCS, 'zh-TW', 'js', 'passkey.js');
const src = fs.readFileSync(SRC, 'utf8');
const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const start = src.indexOf('// --- 純邏輯');
const end = src.indexOf('// --- 介面');
assert.ok(start > 0 && end > start, 'passkey.js 裡找不到純邏輯與介面的分界註解');
const tool = new Function(`${src.slice(start, end)}\n return { SITE_RP_ID, rpIdFor, looksLikeRecipient, looksLikeIdentity, looksLikePasskeyIdentity, prfSupport, classifyError, keyName };`)();
const STRINGS = new Function(`${src.match(/^  const STRINGS = \{[\s\S]*?\n  \};/m)[0]}\n return STRINGS;`)();

// ---------------------------------------------------------------------------
// 替身驗證器：一把憑證一把 hmac-secret，PRF = HMAC-SHA256(secret, input)
// ---------------------------------------------------------------------------

const authenticator = { creds: new Map(), calls: { create: 0, get: 0 } };
const toU8 = (x) => (x instanceof ArrayBuffer ? new Uint8Array(x) : new Uint8Array(x.buffer, x.byteOffset, x.byteLength));
function installFakeWebAuthn() {
  globalThis.window = { origin: 'https://anoni.net' };
  // Node 21 起 navigator 是全域的 getter，要用 defineProperty 蓋掉
  Object.defineProperty(globalThis, 'navigator', { configurable: true, writable: true, value: {
    credentials: {
      async create(opts) {
        authenticator.calls.create += 1;
        assert.equal(opts.publicKey.rp.id, 'anoni.net', 'RP ID 要是 anoni.net');
        assert.ok(opts.publicKey.extensions.prf, '建立時要要求 PRF');
        assert.equal(opts.publicKey.authenticatorSelection.userVerification, 'required');
        const id = crypto.randomBytes(16);
        authenticator.creds.set(id.toString('hex'), crypto.randomBytes(32));
        return { rawId: id.buffer.slice(id.byteOffset, id.byteOffset + 16), response: { getTransports: () => ['internal'] }, getClientExtensionResults: () => ({ prf: { enabled: true } }) };
      },
      async get(opts) {
        authenticator.calls.get += 1;
        assert.equal(opts.publicKey.rpId, 'anoni.net');
        assert.equal(opts.publicKey.userVerification, 'required');
        const allow = opts.publicKey.allowCredentials;
        const key = allow.length ? Buffer.from(toU8(allow[0].id)).toString('hex') : [...authenticator.creds.keys()][0];
        const secret = authenticator.creds.get(key);
        assert.ok(secret, '沒有這把憑證');
        const ev = opts.publicKey.extensions.prf.eval;
        const h = (input) => crypto.createHmac('sha256', secret).update(toU8(input)).digest();
        return { getClientExtensionResults: () => ({ prf: { results: { first: h(ev.first).buffer, second: h(ev.second).buffer } } }) };
      },
    },
  } });
}

// 獨立算法：從段落與驗證器秘密解出 file key
function nodeUnwrapPrf(stanza, secret) {
  const label = Buffer.from('age-encryption.org/fido2prf');
  assert.equal(stanza.args[0], 'age-encryption.org/fido2prf');
  const nonce = Buffer.from(stanza.args[1], 'base64');
  assert.equal(nonce.length, 16, 'nonce 要 16 位元組');
  const input = (tag) => Buffer.concat([label, Buffer.from([tag]), nonce]);
  const first = crypto.createHmac('sha256', secret).update(input(1)).digest();
  const second = crypto.createHmac('sha256', secret).update(input(2)).digest();
  const key = crypto.createHmac('sha256', label).update(Buffer.concat([first, second])).digest(); // HKDF-extract，鹽是標籤
  const body = Buffer.from(stanza.body);
  const d = crypto.createDecipheriv('chacha20-poly1305', key, Buffer.alloc(12), { authTagLength: 16 });
  d.setAuthTag(body.subarray(16));
  return Buffer.concat([d.update(body.subarray(0, 16)), d.final()]);
}

// 獨立算法：X25519 段落。bech32 只做 5→8 bit 轉換，checksum 不驗（typage 那邊驗）。
const B32 = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
function bech32Data(str) {
  const s = str.toLowerCase();
  const data = s.slice(s.lastIndexOf('1') + 1, -6).split('').map((c) => B32.indexOf(c));
  const out = []; let acc = 0; let bits = 0;
  for (const v of data) { acc = (acc << 5) | v; bits += 5; if (bits >= 8) { bits -= 8; out.push((acc >> bits) & 0xff); } }
  return Buffer.from(out);
}
const X25519_PRIV_DER = Buffer.from('302e020100300506032b656e04220420', 'hex');
const X25519_PUB_DER = Buffer.from('302a300506032b656e032100', 'hex');
function nodeUnwrapX25519(stanza, secretIdentity) {
  assert.equal(stanza.args[0], 'X25519');
  const eph = Buffer.from(stanza.args[1], 'base64');
  const scalar = bech32Data(secretIdentity);
  const priv = crypto.createPrivateKey({ key: Buffer.concat([X25519_PRIV_DER, scalar]), format: 'der', type: 'pkcs8' });
  const pub = crypto.createPublicKey(priv).export({ format: 'der', type: 'spki' }).subarray(-32);
  const shared = crypto.diffieHellman({ privateKey: priv, publicKey: crypto.createPublicKey({ key: Buffer.concat([X25519_PUB_DER, eph]), format: 'der', type: 'spki' }) });
  const key = Buffer.from(crypto.hkdfSync('sha256', shared, Buffer.concat([eph, pub]), 'age-encryption.org/v1/X25519', 32));
  const body = Buffer.from(stanza.body);
  const d = crypto.createDecipheriv('chacha20-poly1305', key, Buffer.alloc(12), { authTagLength: 16 });
  d.setAuthTag(body.subarray(16));
  return Buffer.concat([d.update(body.subarray(0, 16)), d.final()]);
}

const PKG_DIRS = { 'age-encryption': 'age-encryption', '@noble/ciphers': 'noble-ciphers', '@noble/curves': 'noble-curves', '@noble/hashes': 'noble-hashes', '@noble/post-quantum': 'noble-post-quantum', '@scure/base': 'scure-base' };
function copyTree(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, entry.name); const b = path.join(to, entry.name);
    if (entry.isDirectory()) copyTree(a, b); else fs.copyFileSync(a, b);
  }
}
async function loadTypage() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'anoni-passkey-'));
  for (const [name, dir] of Object.entries(PKG_DIRS)) copyTree(path.join(VENDOR, dir), path.join(tmp, 'node_modules', name));
  const age = await import(pathToFileURL(path.join(tmp, 'node_modules', 'age-encryption', 'dist', 'index.js')).href);
  return { age, tmp };
}
const frontmatter = (text) => text.split('\n---\n')[0];

let passed = 0; let failed = 0; const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// ---------------------------------------------------------------------------
// 純邏輯
// ---------------------------------------------------------------------------

test('RP ID：正式站與子網域都是 anoni.net，其他主機名用自己的', () => {
  assert.equal(tool.SITE_RP_ID, 'anoni.net');
  assert.equal(tool.rpIdFor('anoni.net'), 'anoni.net');
  assert.equal(tool.rpIdFor('docs.anoni.net'), 'anoni.net');
  assert.equal(tool.rpIdFor('ANONI.NET'), 'anoni.net');
  assert.equal(tool.rpIdFor('localhost'), 'localhost');
  assert.equal(tool.rpIdFor('notanoni.net'), 'notanoni.net', '字尾相似不算子網域');
  assert.equal(tool.rpIdFor('example.onion'), 'example.onion');
});

test('age1 公鑰與 AGE-SECRET-KEY-1 私鑰只認對的形狀', () => {
  const rec = 'age1' + 'q'.repeat(58);
  assert.equal(tool.looksLikeRecipient(rec), true);
  assert.equal(tool.looksLikeRecipient('  ' + rec + '\n'), true, '前後空白要容忍');
  assert.equal(tool.looksLikeRecipient('age1' + 'q'.repeat(57)), false);
  assert.equal(tool.looksLikeRecipient('age1' + 'b'.repeat(58)), false, 'b 不在 bech32 字元集');
  assert.equal(tool.looksLikeRecipient('AGE1' + 'Q'.repeat(58)), false, '公鑰是小寫');
  const sec = 'AGE-SECRET-KEY-1' + 'Q'.repeat(58);
  assert.equal(tool.looksLikeIdentity(sec), true);
  assert.equal(tool.looksLikeIdentity(sec.toLowerCase()), false, '私鑰是大寫');
  assert.equal(tool.looksLikeIdentity('AGE-SECRET-KEY-PQ-1' + 'Q'.repeat(58)), false, '後量子身分不是這一頁的');
  assert.equal(tool.looksLikePasskeyIdentity('AGE-PLUGIN-FIDO2PRF-1QQQ'), true);
  assert.equal(tool.looksLikePasskeyIdentity('AGE-SECRET-KEY-1QQQ'), false);
});

test('能力判讀：沒有 WebAuthn 就不能用，有 getClientCapabilities 就看 extension:prf，沒有就未知', () => {
  assert.deepEqual(tool.prfSupport(false, null), { webauthn: false, prf: false });
  assert.deepEqual(tool.prfSupport(true, null), { webauthn: true, prf: null });
  assert.deepEqual(tool.prfSupport(true, { 'extension:prf': true }), { webauthn: true, prf: true });
  assert.deepEqual(tool.prfSupport(true, { 'extension:prf': false }), { webauthn: true, prf: false });
  assert.deepEqual(tool.prfSupport(true, { conditionalGet: true }), { webauthn: true, prf: null }, '沒提到 prf 就是未知');
});

test('錯誤分類與金鑰名字', () => {
  const err = (name, message) => Object.assign(new Error(message || ''), { name });
  assert.equal(tool.classifyError(err('NotAllowedError')), 'cancelled');
  assert.equal(tool.classifyError(err('AbortError')), 'cancelled');
  assert.equal(tool.classifyError(err('Error', 'PRF extension not available (need macOS 15+, Chrome 132+)')), 'noPrf');
  assert.equal(tool.classifyError(err('SecurityError')), 'unsupported');
  assert.equal(tool.classifyError(err('TypeError', 'x')), 'failed');
  assert.equal(tool.classifyError(null), 'failed');
  assert.equal(tool.keyName(new Date('2026-09-04T12:00:00Z')), 'anoni.net 2026-09-04');
});

// ---------------------------------------------------------------------------
// typage 的 webauthn 模組跑在替身上，段落用獨立算法解回來
// ---------------------------------------------------------------------------

let typage = null;
test('建立憑證、包 file key、用 passkey 解回；替身秘密獨立算出同一把 file key', async () => {
  installFakeWebAuthn();
  typage = await loadTypage();
  const { age } = typage;
  const identity = await age.webauthn.createCredential({ keyName: 'anoni.net 2026-09-04', rpId: 'anoni.net', type: 'passkey' });
  assert.ok(identity.startsWith('AGE-PLUGIN-FIDO2PRF-1'), identity);
  assert.ok(tool.looksLikePasskeyIdentity(identity));
  const fileKey = crypto.randomBytes(16);
  const recipient = new age.webauthn.WebAuthnRecipient({ rpId: 'anoni.net' });
  const stanzas = await recipient.wrapFileKey(new Uint8Array(fileKey));
  assert.equal(stanzas.length, 1);
  assert.equal(stanzas[0].args.length, 2);
  const secret = [...authenticator.creds.values()][0];
  assert.ok(nodeUnwrapPrf(stanzas[0], secret).equals(fileKey), '獨立算法解出的 file key 不同');
  const back = await new age.webauthn.WebAuthnIdentity({ rpId: 'anoni.net' }).unwrapFileKey(stanzas);
  assert.ok(Buffer.from(back).equals(fileKey));
  // 帶識別字串也要能解，且會把憑證 ID 放進 allowCredentials
  const back2 = await new age.webauthn.WebAuthnIdentity({ identity }).unwrapFileKey(stanzas);
  assert.ok(Buffer.from(back2).equals(fileKey));
  // 錯的秘密解不開
  assert.throws(() => nodeUnwrapPrf(stanzas[0], crypto.randomBytes(32)));
});

test('整個檔案加密給 passkey 與 X25519 備援：passkey 解得開、typage 的備援身分解得開、獨立 X25519 算法也解得開', async () => {
  const { age } = typage;
  const secretId = await age.generateIdentity();
  const recipient = await age.identityToRecipient(secretId);
  assert.ok(tool.looksLikeIdentity(secretId) && tool.looksLikeRecipient(recipient), '產生的金鑰形狀要通過頁面的檢查');
  const plain = crypto.randomBytes(3000);
  const e = new age.Encrypter();
  e.addRecipient(new age.webauthn.WebAuthnRecipient({ rpId: 'anoni.net' }));
  e.addRecipient(recipient);
  const out = Buffer.from(await e.encrypt(new Uint8Array(plain)));
  const head = out.toString('latin1').split('\n');
  assert.equal(head[0], 'age-encryption.org/v1');
  const types = head.filter((l) => l.startsWith('-> ')).map((l) => l.slice(3).split(' ')[0]);
  assert.deepEqual(types.sort(), ['X25519', 'age-encryption.org/fido2prf']);
  const d1 = new age.Decrypter(); d1.addIdentity(new age.webauthn.WebAuthnIdentity({ rpId: 'anoni.net' }));
  assert.ok(Buffer.from(await d1.decrypt(new Uint8Array(out), 'uint8array')).equals(plain));
  const d2 = new age.Decrypter(); d2.addIdentity(secretId);
  assert.ok(Buffer.from(await d2.decrypt(new Uint8Array(out), 'uint8array')).equals(plain));
  // 獨立算法：從檔頭抓 X25519 段落，用私鑰解出 file key
  const xIdx = head.findIndex((l) => l.startsWith('-> X25519'));
  const xStanza = { args: head[xIdx].slice(3).split(' '), body: Buffer.from(head[xIdx + 1], 'base64') };
  const fileKey = nodeUnwrapX25519(xStanza, secretId);
  assert.equal(fileKey.length, 16);
  // 同一把 file key 也能從 passkey 段落解出來，兩邊一致
  const pIdx = head.findIndex((l) => l.startsWith('-> age-encryption.org/fido2prf'));
  const pStanza = { args: head[pIdx].slice(3).split(' '), body: Buffer.from(head[pIdx + 1], 'base64') };
  assert.ok(nodeUnwrapPrf(pStanza, [...authenticator.creds.values()][0]).equals(fileKey), '兩個段落包的不是同一把 file key');
  // 不對的私鑰
  const wrong = await age.generateIdentity();
  const d3 = new age.Decrypter(); d3.addIdentity(wrong);
  await assert.rejects(d3.decrypt(new Uint8Array(out), 'uint8array'), /no identity matched/);
});

// ---------------------------------------------------------------------------
// 頁面與接線
// ---------------------------------------------------------------------------

test('三語系的 utils/passkey.md：import map 跟 age.md 相同、offline_assets 列了 vendor 每一支、容器與 script 都在', () => {
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith('.js') ? [path.join(dir, e.name)] : []));
  const vendorJs = walk(VENDOR).map((f) => 'utils/vendor/age/' + path.relative(VENDOR, f)).sort();
  for (const lang of ['zh-TW', 'zh-CN', 'en']) {
    const page = fs.readFileSync(path.join(DOCS, lang, 'utils', 'passkey.md'), 'utf8');
    const agePage = fs.readFileSync(path.join(DOCS, lang, 'utils', 'age.md'), 'utf8');
    const map = (text) => text.match(/<script type="importmap">\s*([\s\S]*?)\s*<\/script>/)[1];
    assert.equal(map(page), map(agePage), `${lang} 的 import map 跟 age.md 不同`);
    const listed = [...frontmatter(page).matchAll(/^\s*- (utils\/[^\s]+)$/gm)].map((m) => m[1]);
    for (const f of vendorJs) assert.ok(listed.includes(f), `${lang} 的 offline_assets 少了 ${f}`);
    assert.ok(page.includes('<div id="passkey-tool"></div>'), `${lang} 沒有容器`);
    assert.ok(page.includes('<script src="../../js/passkey.js"></script>'), `${lang} 沒有載入 passkey.js`);
    assert.ok(/what-is-passkey\.md/.test(page), `${lang} 沒有連到介紹頁`);
    assert.ok(fs.existsSync(path.join(DOCS, lang, 'tools', 'what-is-passkey.md')), `${lang} 缺介紹頁`);
    // age.md 先載 passkey.js 再載 agecrypt.js
    const a = agePage.indexOf('js/passkey.js'); const b = agePage.indexOf('js/agecrypt.js');
    assert.ok(a > 0 && b > a, `${lang} 的 age.md 要先載 passkey.js`);
  }
  for (const lang of ['en', 'zh-CN']) {
    const link = path.join(DOCS, lang, 'js', 'passkey.js');
    assert.ok(fs.lstatSync(link).isSymbolicLink() && fs.realpathSync(link) === fs.realpathSync(SRC), `${lang} 的 passkey.js 不是指向 zh-TW 的 symlink`);
  }
  for (const yml of ['mkdocs.yml', 'mkdocs_cn.yml', 'mkdocs_en.yml']) {
    const s = fs.readFileSync(path.join(DOCS, yml), 'utf8');
    assert.ok(s.includes('- utils/passkey.md') && s.includes('- tools/what-is-passkey.md'), `${yml} 的 nav 少了 passkey 頁`);
    assert.ok(s.indexOf('- utils/age.md') < s.indexOf('- utils/passkey.md'), `${yml} passkey 要排在 age 之後`);
  }
});

test('原始碼：只有 import 那一個載入點，沒有網路請求，沒有任何留存資料的手段，WebAuthn 只經 typage 呼叫', () => {
  // credentials.create 與 .get 只能是能力偵測時的屬性參照，不能在這一支裡直接呼叫，呼叫在 typage 裡
  for (const needle of ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket', 'anoniTrack', 'localStorage', 'sessionStorage', 'indexedDB', 'document.cookie', 'caches.open', 'credentials.create(', 'credentials.get(']) {
    assert.ok(!code.includes(needle), `原始碼裡出現了 ${needle}`);
  }
  assert.ok(/import\("age-encryption"\)/.test(code));
  assert.ok(/rpId: rpId, type: "passkey"/.test(code), '建立時要指定 RP ID 與 passkey 類型');
  assert.ok(code.includes('anoni-spinner') && code.includes('aria-busy'));
  assert.ok(/window\.anoniPasskey = \{/.test(code), '沒有掛出共用介面');
  assert.ok(!code.includes('readText'), '不准讀剪貼簿');
});

test('三個語系的字串表結構一致', () => {
  const shape = (o) => Object.keys(o).sort().map((k) => (typeof o[k] === 'object' ? `${k}:{${Object.keys(o[k]).sort().join(',')}}` : k)).join('|');
  assert.equal(shape(STRINGS.zh), shape(STRINGS['zh-TW']));
  assert.equal(shape(STRINGS.en), shape(STRINGS['zh-TW']));
});

for (const [name, fn] of tests) {
  try { await fn(); console.log(`  ✓ ${name}`); passed += 1; }
  catch (err) { console.log(`  ✗ ${name}`); console.log(`    ${err.message.split('\n').slice(0, 6).join('\n    ')}`); failed += 1; }
}
if (typage) fs.rmSync(typage.tmp, { recursive: true, force: true });
console.log(`\n${passed} 通過，${failed} 失敗`);
process.exit(failed ? 1 : 0);
