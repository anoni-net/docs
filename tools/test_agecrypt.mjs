#!/usr/bin/env node
/**
 * 本機檔案加密（docs/zh-TW/js/agecrypt.js 與 utils/vendor/age/）的測試。
 *
 * === 為什麼需要這支 ===
 *
 * 這個工具的承諾是「輸出是標準的 age 格式，任何裝了命令列工具的電腦都能解開」。
 * 只用 typage 自己加密再自己解密，驗不到這件事：它跟自己當然相容。所以這裡用 Node
 * 內建的 crypto（scrypt、ChaCha20-Poly1305、HKDF、HMAC）照 age 規格獨立寫一份密語模式，
 * typage 的輸出要能被它解開，它的輸出也要能被 typage 解開，兩邊互驗才算數。
 *
 * 另一半守 vendor 的一致性。typage 與相依套件是原封不動的 ES module，靠三份清單接起來：
 * vendor/age/ 裡實際有的檔案、頁面的 import map、頁面 frontmatter 的 offline_assets。
 * 三邊對不上的症狀各不相同：少放檔案是線上 404，import map 少一條是載入時炸，
 * offline_assets 少一條是離線副本缺一塊。這裡從 import 重算一次閉包，跟三邊都比。
 *
 * 用法：
 *   node tools/test_agecrypt.mjs
 * 不需要建置產物。typage 從 vendor 目錄複製到暫存目錄以 node_modules 的形狀載入，
 * 因為 Node 解析 bare specifier 要靠那個結構，而 vendor 裡的檔案本身不動。
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
const SRC = path.join(DOCS, 'zh-TW', 'js', 'agecrypt.js');
const src = fs.readFileSync(SRC, 'utf8');
const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

// --- 純邏輯原地抽出來 ---
const start = src.indexOf('// --- 純邏輯');
const end = src.indexOf('// --- 介面');
assert.ok(start > 0 && end > start, 'agecrypt.js 裡找不到純邏輯與介面的分界註解');
const tool = new Function(`${src.slice(start, end)}\n return { AGE_HEADER, MAX_BYTES, SCRYPT_LOG2_N, WORDS_SUGGESTED, SCRYPT_LABEL, SCRYPT_MAX_LOG2_N, CALIBRATE_LOG2_N, SLOW_MS, isAgeFile, outputName, randomBelow, pickWords, scryptSalt, estimateMs, plannedMs, scryptRecipient, scryptIdentity, AGE_ARMOR, AGE_ARMOR_END, ARMOR_MAX_BYTES, TEXT_NAME, isArmored, classifyText, decodeUtf8Text };`)();
const STRINGS = new Function(`${src.match(/^  const STRINGS = \{[\s\S]*?\n  \};/m)[0]}\n return STRINGS;`)();

// ---------------------------------------------------------------------------
// age 密語模式的獨立實作（只用 Node 內建的 crypto，照 age-encryption.org/v1）
// ---------------------------------------------------------------------------

const CHUNK = 65536;
const VERSION = 'age-encryption.org/v1';
const b64 = (buf) => Buffer.from(buf).toString('base64').replace(/=+$/, '');
const unb64 = (text) => Buffer.from(text, 'base64');
const hkdf = (ikm, salt, info) => Buffer.from(crypto.hkdfSync('sha256', ikm, salt, info, 32));
const seal = (key, nonce, plain) => {
  const c = crypto.createCipheriv('chacha20-poly1305', key, nonce, { authTagLength: 16 });
  return Buffer.concat([c.update(plain), c.final(), c.getAuthTag()]);
};
const open = (key, nonce, data) => {
  const d = crypto.createDecipheriv('chacha20-poly1305', key, nonce, { authTagLength: 16 });
  d.setAuthTag(data.subarray(data.length - 16));
  return Buffer.concat([d.update(data.subarray(0, data.length - 16)), d.final()]);
};
const scryptKey = (passphrase, salt, logN) =>
  crypto.scryptSync(passphrase, Buffer.concat([Buffer.from(VERSION + '/scrypt'), salt]), 32,
    { N: 2 ** logN, r: 8, p: 1, maxmem: 1024 * 1024 * 1024 });
const chunkNonce = (counter, last) => {
  const n = Buffer.alloc(12);
  n.writeBigUInt64BE(BigInt(counter), 3);
  n[11] = last ? 1 : 0;
  return n;
};

function nodeAgeEncrypt(plain, passphrase, logN = 18) {
  const fileKey = crypto.randomBytes(16);
  const salt = crypto.randomBytes(16);
  const body = seal(scryptKey(passphrase, salt, logN), Buffer.alloc(12), fileKey);
  let header = `${VERSION}\n-> scrypt ${b64(salt)} ${logN}\n${b64(body)}\n---`;
  const mac = crypto.createHmac('sha256', hkdf(fileKey, Buffer.alloc(0), 'header')).update(header).digest();
  header += ` ${b64(mac)}\n`;
  const nonce = crypto.randomBytes(16);
  const payloadKey = hkdf(fileKey, nonce, 'payload');
  const chunks = [];
  let at = 0;
  let counter = 0;
  do {
    const stop = Math.min(plain.length, at + CHUNK);
    chunks.push(seal(payloadKey, chunkNonce(counter, stop >= plain.length), plain.subarray(at, stop)));
    at = stop;
    counter += 1;
  } while (at < plain.length);
  return Buffer.concat([Buffer.from(header), nonce, ...chunks]);
}

// ASCII armor：PEM 的嚴格子集，48 位元組一行（64 個 base64 字元），標準 base64 含補位
function nodeArmor(buf) {
  const lines = ['-----BEGIN AGE ENCRYPTED FILE-----'];
  for (let i = 0; i < buf.length; i += 48) lines.push(buf.subarray(i, i + 48).toString('base64'));
  lines.push('-----END AGE ENCRYPTED FILE-----');
  return lines.join('\n') + '\n';
}
function nodeDearmor(text) {
  const lines = text.trim().replace(/\r\n/g, '\n').split('\n');
  assert.equal(lines.shift(), '-----BEGIN AGE ENCRYPTED FILE-----', 'armor 頭行不對');
  assert.equal(lines.pop(), '-----END AGE ENCRYPTED FILE-----', 'armor 尾行不對');
  lines.forEach((l, i) => {
    assert.ok(/^[A-Za-z0-9+/=]+$/.test(l), 'armor 內容不是 base64');
    if (i < lines.length - 1) assert.equal(l.length, 64, 'armor 中間行要剛好 64 字');
    else assert.ok(l.length > 0 && l.length <= 64 && l.length % 4 === 0, 'armor 最後一行長度不對');
  });
  return Buffer.from(lines.join(''), 'base64');
}

function nodeAgeDecrypt(file, passphrase) {
  const text = file.toString('latin1');
  const lines = [];
  let cursor = 0;
  for (;;) {
    const nl = text.indexOf('\n', cursor);
    if (nl < 0) throw new Error('header never ends');
    const line = text.slice(cursor, nl);
    cursor = nl + 1;
    lines.push(line);
    if (line.startsWith('--- ')) break;
  }
  assert.equal(lines[0], VERSION, '版本行不對');
  const stanza = lines[1].split(' ');
  assert.equal(stanza[0], '->');
  assert.equal(stanza[1], 'scrypt', '不是 scrypt 段落');
  const salt = unb64(stanza[2]);
  const logN = Number(stanza[3]);
  assert.ok(logN > 0 && logN <= 22, `工作因數怪異：${logN}`);
  // 段落本體：64 字元一行，最後一行短於 64
  const bodyLines = [];
  let i = 2;
  for (; i < lines.length - 1; i += 1) {
    bodyLines.push(lines[i]);
    if (lines[i].length < 64) break;
  }
  assert.equal(i, lines.length - 2, 'scrypt 段落之後不該再有別的段落');
  const body = unb64(bodyLines.join(''));
  const fileKey = open(scryptKey(passphrase, salt, logN), Buffer.alloc(12), body);
  // MAC 算到 --- 為止，不含後面的空格
  const macLine = lines[lines.length - 1];
  const headerText = lines.slice(0, -1).join('\n') + '\n---';
  const expected = crypto.createHmac('sha256', hkdf(fileKey, Buffer.alloc(0), 'header')).update(headerText).digest();
  assert.ok(crypto.timingSafeEqual(expected, unb64(macLine.slice(4))), 'header MAC 對不上');
  const payload = file.subarray(cursor);
  const nonce = payload.subarray(0, 16);
  const payloadKey = hkdf(fileKey, nonce, 'payload');
  const out = [];
  let at = 16;
  let counter = 0;
  do {
    const stop = Math.min(payload.length, at + CHUNK + 16);
    const last = stop >= payload.length;
    out.push(open(payloadKey, chunkNonce(counter, last), payload.subarray(at, stop)));
    at = stop;
    counter += 1;
  } while (at < payload.length);
  return Buffer.concat(out);
}

// ---------------------------------------------------------------------------
// 從 vendor 載入原封不動的 typage
// ---------------------------------------------------------------------------

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

async function loadTypage() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'anoni-age-'));
  for (const [name, dir] of Object.entries(PKG_DIRS)) {
    copyTree(path.join(VENDOR, dir), path.join(tmp, 'node_modules', name));
  }
  const nm = (p) => pathToFileURL(path.join(tmp, 'node_modules', p)).href;
  const mod = await import(nm('age-encryption/dist/index.js'));
  // 介面自組 scrypt 段落時要用的三樣，跟 agecrypt.js 的 lib() 拿的是同一批檔案
  const scryptMod = await import(nm('@noble/hashes/scrypt.js'));
  const chachaMod = await import(nm('@noble/ciphers/chacha.js'));
  const baseMod = await import(nm('@scure/base/index.js'));
  const deps = { Stanza: mod.Stanza, scryptAsync: scryptMod.scryptAsync, chacha20poly1305: chachaMod.chacha20poly1305, base64nopad: baseMod.base64nopad };
  return { age: mod, deps, tmp };
}

// ---------------------------------------------------------------------------
// vendor 的閉包：從 index.js 沿著 import 走
// ---------------------------------------------------------------------------

function pkgOf(spec) {
  return Object.keys(PKG_DIRS).find((p) => spec === p || spec.startsWith(p + '/'));
}

function resolveBare(spec) {
  const pkg = pkgOf(spec);
  assert.ok(pkg, `vendor 裡沒有 ${spec} 這個套件`);
  const base = path.join(VENDOR, PKG_DIRS[pkg]);
  const sub = spec === pkg ? '.' : '.' + spec.slice(pkg.length);
  const meta = JSON.parse(fs.readFileSync(path.join(base, 'package.json'), 'utf8'));
  const ex = meta.exports;
  const pick = (e) => {
    if (!e) return null;
    if (typeof e === 'string') return e;
    const v = e.import || e.default;
    return typeof v === 'string' ? v : v && v.default;
  };
  let target = null;
  if (typeof ex === 'string') target = sub === '.' ? ex : null;
  else if (ex) target = pick(ex[sub]) || pick(ex[sub + '.js']);
  else if (sub === '.') target = meta.module || meta.main || './index.js';
  if (!target) target = sub;
  let full = path.join(base, target);
  if (fs.existsSync(full) && fs.statSync(full).isDirectory()) full = path.join(full, 'index.js');
  if (!fs.existsSync(full) && fs.existsSync(full + '.js')) full += '.js';
  return full;
}

function closure() {
  const seen = new Set();
  const bare = new Map();
  const walk = (file) => {
    file = path.normalize(file);
    if (seen.has(file)) return;
    seen.add(file);
    const text = fs.readFileSync(file, 'utf8');
    for (const m of text.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)) {
      const spec = m[1];
      let next;
      if (spec.startsWith('.')) {
        next = path.join(path.dirname(file), spec);
        if (fs.existsSync(next) && fs.statSync(next).isDirectory()) next = path.join(next, 'index.js');
        if (!fs.existsSync(next) && fs.existsSync(next + '.js')) next += '.js';
      } else {
        next = resolveBare(spec);
        bare.set(spec, next);
      }
      walk(next);
    }
  };
  // 入口本身也是頁面要用的 bare specifier，agecrypt.js 就是 import("age-encryption")。
  // 2026-09-03 第一版漏了這一條：閉包只收了 vendor 檔案彼此之間的名稱，import map 少了入口，
  // 單元測試全綠，頁面上 import 直接失敗。
  const entry = resolveBare('age-encryption');
  bare.set('age-encryption', entry);
  walk(entry);
  return { files: [...seen].map((f) => path.relative(VENDOR, f)).sort(), bare };
}

function listJs(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listJs(full));
    else if (entry.name.endsWith('.js')) out.push(path.relative(VENDOR, full));
  }
  return out.sort();
}

const frontmatter = (text) => text.split('\n---\n')[0];

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// ---------------------------------------------------------------------------
// 純邏輯
// ---------------------------------------------------------------------------

test('認得 age 檔：二進位與 ASCII armor 兩種開頭', () => {
  assert.equal(tool.isAgeFile(Buffer.from('age-encryption.org/v1\n-> scrypt')), true);
  assert.equal(tool.isAgeFile(Buffer.from('-----BEGIN AGE ENCRYPTED FILE-----\n')), true);
  assert.equal(tool.isAgeFile(Buffer.from('%PDF-1.7')), false);
  assert.equal(tool.isAgeFile(Buffer.from('age-encryption.org/v')), false);
  assert.equal(tool.isAgeFile(new Uint8Array(0)), false);
});

test('輸出檔名：加密加 .age，解密去 .age，沒有 .age 的解密加 .decrypted', () => {
  assert.equal(tool.outputName('backup.tar', 'encrypt'), 'backup.tar.age');
  assert.equal(tool.outputName('backup.tar.age', 'decrypt'), 'backup.tar');
  assert.equal(tool.outputName('BACKUP.AGE', 'decrypt'), 'BACKUP');
  assert.equal(tool.outputName('mystery', 'decrypt'), 'mystery.decrypted');
});

test('取樣沒有取模偏差，抽出來的都是詞表裡的字', () => {
  // 拒絕重抽：超過最後一個完整區間的值要丟掉，直接 % 就有偏差
  const words = Array.from({ length: 7776 }, (_, i) => 'w' + i);
  let calls = 0;
  const seq = [4294967295, 0, 7775, 7776, 1];
  const rng = () => seq[calls++ % seq.length];
  const picked = tool.pickWords(words, 3, rng);
  // 4294967295 超過 floor(2^32/7776)*7776，要被丟掉
  assert.deepEqual(picked, ['w0', 'w7775', 'w0']);
  assert.ok(picked.every((w) => words.includes(w)));
  assert.equal(tool.WORDS_SUGGESTED, 6);
});

test('貼進來的文字：armor 開頭就解密（允許前後空白與 CRLF），其餘原樣當明文加密', () => {
  const armored = '\n  -----BEGIN AGE ENCRYPTED FILE-----\r\nQUJD\r\n-----END AGE ENCRYPTED FILE-----\r\n\n';
  const d = tool.classifyText(armored);
  assert.equal(d.mode, 'decrypt');
  assert.equal(d.armored, true);
  assert.ok(Buffer.from(d.bytes).toString().startsWith('-----BEGIN AGE'), '解密輸入要從頭行開始');
  const plain = '  兩個空白開頭，尾巴有換行\n';
  const e = tool.classifyText(plain);
  assert.equal(e.mode, 'encrypt');
  assert.equal(e.armored, false);
  assert.equal(Buffer.from(e.bytes).toString(), plain, '明文一個字元都不能動');
  assert.equal(tool.isArmored(Buffer.from('-----BEGIN AGE ENCRYPTED FILE-----\n')), true);
  assert.equal(tool.isArmored(Buffer.from('age-encryption.org/v1\n')), false);
  assert.equal(tool.isAgeFile(Buffer.from('-----BEGIN AGE ENCRYPTED FILE-----\n')), true, 'armor 檔也要被認成 age 檔');
  assert.equal(tool.TEXT_NAME, 'note.txt');
  assert.equal(tool.outputName(tool.TEXT_NAME, 'encrypt'), 'note.txt.age');
});

test('解出來的東西只有合法 UTF-8、沒有控制字元、不超過上限才顯示成文字', () => {
  assert.equal(tool.decodeUtf8Text(Buffer.from('哈囉\tworld\r\n'), 1024), '哈囉\tworld\r\n');
  assert.equal(tool.decodeUtf8Text(Buffer.from([0xff, 0xfe, 0x00]), 1024), null, '不是 UTF-8 不顯示');
  assert.equal(tool.decodeUtf8Text(Buffer.from('a\u0000b'), 1024), null, '含 NUL 不顯示');
  assert.equal(tool.decodeUtf8Text(Buffer.from('x'.repeat(10)), 9), null, '超過上限不顯示');
  assert.equal(tool.ARMOR_MAX_BYTES, 64 * 1024);
});

test('scrypt 工作因數用 age 命令列的預設值，不偷降', () => {
  assert.equal(tool.SCRYPT_LOG2_N, 18);
  assert.ok(/addRecipient\(scryptRecipient\(deps, passphrase, SCRYPT_LOG2_N/.test(code), '介面沒有把工作因數交給自組的收件人');
  assert.ok(/addIdentity\(scryptIdentity\(deps, passphrase/.test(code), '解密沒有走自組的身分');
  assert.ok(/import\("age-encryption"\)/.test(code), '介面要用 import map 裡的入口名稱載入');
});

test('scrypt 走非同步版本，介面不再碰 typage 內建的同步密語模式', () => {
  // 2026-09-03 IronFox（預設關 JIT）上同步 scrypt 一次 50 秒，主執行緒整段卡住。
  // 之後的規則：scrypt 只能經由 scryptAsync，setPassphrase 與 addPassphrase 都不准出現。
  assert.ok(/scryptAsync/.test(code), '沒有用 scryptAsync');
  assert.ok(!/setPassphrase\(|addPassphrase\(|setScryptWorkFactor\(/.test(code), '介面又走回 typage 的同步 scrypt');
  assert.ok(/onProgress/.test(src.slice(start, end)), '收件人與身分要把進度回報接出去');
});

test('scrypt 在 module worker 裡算，worker 用相對路徑載入 vendor 的 noble scrypt，三語系與離線清單都有', () => {
  // noble 的 scryptAsync 只用 microtask 讓步，關 JIT 的 Firefox 實測主執行緒照樣卡 48 秒。
  // 只有 worker 才讓轉圈與進度畫得出來。
  const workerPath = path.join(DOCS, 'zh-TW', 'js', 'agecrypt-worker.js');
  const w = fs.readFileSync(workerPath, 'utf8');
  const m = w.match(/import \{ scrypt \} from "([^"]+)"/);
  assert.ok(m, 'worker 沒有載入 scrypt');
  assert.equal(fs.realpathSync(path.resolve(path.dirname(workerPath), m[1])), fs.realpathSync(path.join(VENDOR, 'noble-hashes', 'scrypt.js')), 'worker 載入的不是 vendor 那一份');
  assert.ok(/onProgress/.test(w) && /postMessage\(\{ id: job\.id, progress/.test(w), 'worker 沒有回報進度');
  assert.ok(/postMessage\(\{ id: job\.id, error/.test(w), 'worker 出錯沒有回報');
  assert.ok(/new Worker\(new URL\("agecrypt-worker\.js", scriptUrl\), \{ type: "module" \}\)/.test(code), '主程式沒有用 module worker');
  assert.ok(/scryptAsync: makeScrypt\(scryptMod\.scryptAsync\)/.test(code), '收件人與身分拿到的要是先試 worker 的那一個');
  assert.ok(/return scryptAsync\(passphrase, salt, params\)/.test(code), 'worker 起不來沒有退路');
  for (const lang of ['en', 'zh-CN']) {
    const link = path.join(DOCS, lang, 'js', 'agecrypt-worker.js');
    assert.ok(fs.lstatSync(link).isSymbolicLink(), `${lang} 的 worker 不是 symlink`);
    assert.equal(fs.realpathSync(link), fs.realpathSync(workerPath));
    assert.ok(fs.existsSync(path.resolve(path.join(DOCS, lang, 'js'), m[1])), `${lang} 底下 worker 的相對路徑解不到 vendor`);
  }
  for (const lang of ['zh-TW', 'zh-CN', 'en']) {
    const fm = frontmatter(fs.readFileSync(path.join(DOCS, lang, 'utils', 'age.md'), 'utf8'));
    assert.ok(/^\s*- js\/agecrypt-worker\.js$/m.test(fm), `${lang} 的 offline_assets 少了 worker`);
  }
});

test('校準與估時的算術：小工作因數量一次，推到 2^18，加密含比對算兩趟', () => {
  assert.equal(tool.CALIBRATE_LOG2_N, 12);
  assert.equal(tool.SCRYPT_MAX_LOG2_N, 20);
  assert.equal(tool.SLOW_MS, 20000);
  // 桌機關 JIT 實測：2^12 約 800 ms，推到 2^18 是 51.2 秒
  assert.equal(tool.estimateMs(800, 12, 18), 51200);
  assert.equal(tool.estimateMs(14, 12, 18), 896);
  assert.equal(tool.plannedMs(51200, 'encrypt', true), 102400);
  assert.equal(tool.plannedMs(51200, 'encrypt', false), 51200);
  assert.equal(tool.plannedMs(51200, 'decrypt', true), 51200);
  // 有 JIT 的手機：一次約 3 秒，兩趟 6 秒，不會被問
  assert.ok(tool.plannedMs(3000, 'encrypt', true) < tool.SLOW_MS);
  // 關 JIT 的桌機會被問，答應之後只做一趟
  assert.ok(tool.plannedMs(51200, 'encrypt', true) > tool.SLOW_MS);
  assert.ok(/plannedMs\(perScrypt, mode, true\) > SLOW_MS/.test(code), '介面的門檻沒有照 plannedMs 判斷');
  assert.ok(/const verify = mode === "encrypt" && !state\.slowAccepted/.test(code), '答應等的慢環境才省略比對，其他情況都要比對');
});

// ---------------------------------------------------------------------------
// 互通：typage 與獨立實作互相解開對方的輸出
// ---------------------------------------------------------------------------

const SIZES = [0, 1, 1000, 65535, 65536, 65537, 200000];
let typage = null;

test('typage 加密的檔案，獨立實作解得開，各種大小含空檔與 64 KiB 邊界', async () => {
  typage = await loadTypage();
  for (const size of SIZES) {
    const plain = crypto.randomBytes(size);
    const e = new typage.age.Encrypter();
    e.setPassphrase('correct horse battery staple six words');
    e.setScryptWorkFactor(12);
    const out = Buffer.from(await e.encrypt(new Uint8Array(plain)));
    const back = nodeAgeDecrypt(out, 'correct horse battery staple six words');
    assert.ok(back.equals(plain), `${size} 位元組解回來不一樣`);
  }
});

test('獨立實作加密的檔案，typage 解得開', async () => {
  for (const size of SIZES) {
    const plain = crypto.randomBytes(size);
    const out = nodeAgeEncrypt(plain, 'another passphrase with words', 12);
    const d = new typage.age.Decrypter();
    d.addPassphrase('another passphrase with words');
    const back = Buffer.from(await d.decrypt(new Uint8Array(out), 'uint8array'));
    assert.ok(back.equals(plain), `${size} 位元組 typage 解回來不一樣`);
  }
});

test('密語錯了兩邊都拒絕，改一個位元組也拒絕', async () => {
  const plain = crypto.randomBytes(3000);
  const out = nodeAgeEncrypt(plain, 'right', 12);
  assert.throws(() => nodeAgeDecrypt(out, 'wrong'));
  const d = new typage.age.Decrypter();
  d.addPassphrase('wrong');
  await assert.rejects(d.decrypt(new Uint8Array(out), 'uint8array'));
  const tampered = Buffer.from(out);
  tampered[tampered.length - 20] ^= 0x01;
  assert.throws(() => nodeAgeDecrypt(tampered, 'right'));
  const d2 = new typage.age.Decrypter();
  d2.addPassphrase('right');
  await assert.rejects(d2.decrypt(new Uint8Array(tampered), 'uint8array'));
});

test('自組的非同步 scrypt 收件人：typage 的密語模式與獨立實作都解得開，進度回報到 100%', async () => {
  const { age, deps } = typage;
  for (const size of [0, 1000, 65537]) {
    const plain = crypto.randomBytes(size);
    const seen = [];
    const e = new age.Encrypter();
    e.addRecipient(tool.scryptRecipient(deps, 'six words of passphrase here', 12, (r) => seen.push(r)));
    const out = Buffer.from(await e.encrypt(new Uint8Array(plain)));
    assert.ok(nodeAgeDecrypt(out, 'six words of passphrase here').equals(plain), `${size} 位元組獨立實作解回來不一樣`);
    const d = new age.Decrypter();
    d.addPassphrase('six words of passphrase here');
    assert.ok(Buffer.from(await d.decrypt(new Uint8Array(out), 'uint8array')).equals(plain), `${size} 位元組 typage 解回來不一樣`);
    assert.ok(seen.length > 10 && seen[seen.length - 1] === 1, '進度沒有回報到 1');
    assert.ok(seen.every((v, i) => i === 0 || v >= seen[i - 1]), '進度倒退');
  }
});

test('自組的非同步 scrypt 身分：解得開 typage 與獨立實作的輸出，密語錯了回 null', async () => {
  const { age, deps } = typage;
  const plain = crypto.randomBytes(5000);
  const fromTypage = (() => { const e = new age.Encrypter(); e.setPassphrase('pw one'); e.setScryptWorkFactor(12); return e.encrypt(new Uint8Array(plain)); })();
  const fromNode = nodeAgeEncrypt(plain, 'pw two', 12);
  for (const [file, pw] of [[Buffer.from(await fromTypage), 'pw one'], [fromNode, 'pw two']]) {
    const d = new age.Decrypter();
    d.addIdentity(tool.scryptIdentity(deps, pw));
    assert.ok(Buffer.from(await d.decrypt(new Uint8Array(file), 'uint8array')).equals(plain));
    const wrong = new age.Decrypter();
    wrong.addIdentity(tool.scryptIdentity(deps, 'nope'));
    await assert.rejects(wrong.decrypt(new Uint8Array(file), 'uint8array'), /no identity matched/);
  }
});

test('自組身分的檢查跟 typage 一致：多一個段落、鹽長度不對、工作因數太高、格式不對都拒絕', async () => {
  const { deps } = typage;
  const body = new Uint8Array(32);
  const salt = deps.base64nopad.encode(new Uint8Array(16));
  const ok = new deps.Stanza(['scrypt', salt, '12'], body);
  const id = tool.scryptIdentity(deps, 'pw');
  await assert.rejects(id.unwrapFileKey([ok, new deps.Stanza(['X25519', 'abc'], body)]), /not the only one/);
  await assert.rejects(id.unwrapFileKey([new deps.Stanza(['scrypt', salt], body)]), /invalid scrypt stanza/);
  await assert.rejects(id.unwrapFileKey([new deps.Stanza(['scrypt', salt, '012'], body)]), /invalid scrypt stanza/);
  await assert.rejects(id.unwrapFileKey([new deps.Stanza(['scrypt', deps.base64nopad.encode(new Uint8Array(10)), '12'], body)]), /invalid scrypt stanza/);
  await assert.rejects(id.unwrapFileKey([new deps.Stanza(['scrypt', salt, '21'], body)]), /too high/);
  await assert.rejects(id.unwrapFileKey([new deps.Stanza(['scrypt', salt, '12'], new Uint8Array(31))]), /invalid stanza/);
  // 不是 scrypt 的段落一律跳過，回 null 讓 typage 去報「沒有身分對上」
  assert.equal(await id.unwrapFileKey([new deps.Stanza(['X25519', 'abc'], body)]), null);
  // 鹽的組法：固定標籤接 16 位元組
  const s = tool.scryptSalt(new Uint8Array(16).fill(7));
  assert.equal(Buffer.from(s.subarray(0, 28)).toString(), 'age-encryption.org/v1/scrypt');
  assert.equal(s.length, 28 + 16);
  assert.equal(tool.SCRYPT_LABEL, 'age-encryption.org/v1/scrypt');
});

test('armor 兩邊互通：typage 包的獨立實作解得開，獨立實作包的 typage 解得開，格式逐字相同', async () => {
  const { age } = typage;
  const plain = Buffer.from('密碼管理器的安全筆記裡放這一段\n'.repeat(20));
  const e = new age.Encrypter();
  e.setPassphrase('pw'); e.setScryptWorkFactor(12);
  const bin = Buffer.from(await e.encrypt(new Uint8Array(plain)));
  const fromTypage = age.armor.encode(new Uint8Array(bin));
  assert.equal(fromTypage, nodeArmor(bin), '兩邊的 armor 文字要逐字相同');
  assert.ok(nodeAgeDecrypt(nodeDearmor(fromTypage), 'pw').equals(plain));
  const fromNode = nodeArmor(nodeAgeEncrypt(plain, 'pw2', 12));
  const d = new age.Decrypter(); d.addPassphrase('pw2');
  assert.ok(Buffer.from(await d.decrypt(age.armor.decode(fromNode), 'uint8array')).equals(plain));
  // 從密碼管理器貼回來常帶 CRLF 與前後空白，兩邊都要吃
  const messy = '\n' + fromNode.replace(/\n/g, '\r\n') + '  \n';
  assert.ok(Buffer.from(await d.decrypt(age.armor.decode(messy), 'uint8array')).equals(plain));
  assert.ok(nodeAgeDecrypt(nodeDearmor(messy), 'pw2').equals(plain));
  // 中間行被改短就要拒絕，不能默默解出錯的東西
  const broken = fromNode.split('\n'); broken[1] = broken[1].slice(0, 60);
  assert.throws(() => age.armor.decode(broken.join('\n')));
  assert.throws(() => nodeDearmor(broken.join('\n')));
});

test('typage 的輸出符合規格的形狀：版本行、單一 scrypt 段落、工作因數、MAC 行', async () => {
  const e = new typage.age.Encrypter();
  e.setPassphrase('pw');
  e.setScryptWorkFactor(12);
  const out = Buffer.from(await e.encrypt(new Uint8Array([1, 2, 3])));
  const head = out.toString('latin1').split('\n');
  assert.equal(head[0], 'age-encryption.org/v1');
  assert.ok(/^-> scrypt [A-Za-z0-9+/]{22} 12$/.test(head[1]), head[1]);
  assert.ok(/^[A-Za-z0-9+/]{43}$/.test(head[2]), head[2]);
  assert.ok(/^--- [A-Za-z0-9+/]{43}$/.test(head[3]), head[3]);
  // 自組收件人的輸出形狀一模一樣
  const e2 = new typage.age.Encrypter();
  e2.addRecipient(tool.scryptRecipient(typage.deps, 'pw', 12));
  const head2 = Buffer.from(await e2.encrypt(new Uint8Array([1, 2, 3]))).toString('latin1').split('\n');
  assert.equal(head2[0], 'age-encryption.org/v1');
  assert.ok(/^-> scrypt [A-Za-z0-9+/]{22} 12$/.test(head2[1]), head2[1]);
  assert.ok(/^[A-Za-z0-9+/]{43}$/.test(head2[2]), head2[2]);
  assert.ok(/^--- [A-Za-z0-9+/]{43}$/.test(head2[3]), head2[3]);
});

// ---------------------------------------------------------------------------
// vendor、import map、offline_assets 三邊一致
// ---------------------------------------------------------------------------

test('vendor/age 裡的 .js 正好是從 index.js import 得到的閉包，多一個少一個都不行', () => {
  const { files } = closure();
  assert.deepEqual(listJs(VENDOR), files);
});

test('頁面的 import map 涵蓋每一個 bare specifier，指到的檔案都存在', () => {
  const { bare } = closure();
  for (const lang of ['zh-TW', 'zh-CN', 'en']) {
    const page = fs.readFileSync(path.join(DOCS, lang, 'utils', 'age.md'), 'utf8');
    const m = page.match(/<script type="importmap">\s*([\s\S]*?)\s*<\/script>/);
    assert.ok(m, `${lang} 的頁面沒有 import map`);
    const map = JSON.parse(m[1]).imports;
    for (const [spec, full] of bare) {
      assert.ok(map[spec], `${lang} 的 import map 少了 ${spec}`);
      const target = path.resolve(path.join(DOCS, lang, 'utils', 'age'), map[spec]);
      assert.equal(fs.realpathSync(target), fs.realpathSync(full), `${lang} 的 ${spec} 指錯檔案`);
    }
    for (const spec of Object.keys(map)) assert.ok(bare.has(spec), `${lang} 的 import map 多了沒人用的 ${spec}`);
    // agecrypt.js 自己 import 的名稱也要在 map 裡，少一條是頁面上才炸
    for (const m2 of code.matchAll(/import\("([^"]+)"\)/g)) assert.ok(map[m2[1]], `${lang} 的 import map 少了介面用到的 ${m2[1]}`);
  }
});

test('offline_assets 逐一列出 vendor/age 的每一支 .js 與詞表', () => {
  const files = listJs(VENDOR).map((f) => 'utils/vendor/age/' + f);
  for (const lang of ['zh-TW', 'zh-CN', 'en']) {
    const fm = frontmatter(fs.readFileSync(path.join(DOCS, lang, 'utils', 'age.md'), 'utf8'));
    const listed = [...fm.matchAll(/^\s*- (utils\/[^\s]+)$/gm)].map((m) => m[1]);
    for (const f of files) assert.ok(listed.includes(f), `${lang} 的 offline_assets 少了 ${f}`);
    assert.ok(listed.includes('utils/asian-diceware-7776.txt'), `${lang} 的 offline_assets 少了詞表`);
    for (const f of listed) assert.ok(fs.existsSync(path.join(DOCS, 'zh-TW', f)), `${lang} 列了不存在的 ${f}`);
  }
});

test('每個 vendor 套件都帶著原封不動的 LICENSE 與 package.json，版本跟 README 一致', () => {
  const readme = fs.readFileSync(path.join(VENDOR, '..', 'README.md'), 'utf8');
  for (const dir of Object.values(PKG_DIRS)) {
    const pkg = JSON.parse(fs.readFileSync(path.join(VENDOR, dir, 'package.json'), 'utf8'));
    assert.ok(fs.statSync(path.join(VENDOR, dir, 'LICENSE')).size > 500, `${dir} 的 LICENSE 太短`);
    assert.ok(readme.includes(`\`age/${dir}/\``), `vendor/README.md 沒有登記 age/${dir}/`);
    assert.ok(readme.includes(`| ${pkg.version} |`), `vendor/README.md 登記的版本跟 ${dir} 的 package.json（${pkg.version}）對不上`);
  }
  for (const lang of ['zh-TW', 'zh-CN', 'en']) {
    const index = fs.readFileSync(path.join(DOCS, lang, 'utils', 'index.md'), 'utf8');
    for (const dir of Object.values(PKG_DIRS)) {
      const name = dir === 'age-encryption' ? 'typage' : dir;
      assert.ok(index.includes(name), `${lang} 的 index.md 沒有列出 ${name}`);
    }
  }
});

test('另兩語系的 vendor/age 是指向 zh-TW 的 symlink', () => {
  for (const lang of ['en', 'zh-CN']) {
    const link = path.join(DOCS, lang, 'utils', 'vendor', 'age');
    assert.ok(fs.lstatSync(link).isSymbolicLink(), `${lang} 的 vendor/age 不是 symlink`);
    assert.equal(fs.realpathSync(link), fs.realpathSync(VENDOR));
  }
});

// ---------------------------------------------------------------------------
// 原始碼
// ---------------------------------------------------------------------------

test('原始碼裡除了抓詞表之外沒有網路請求，也沒有任何留存資料的手段', () => {
  const fetches = [...code.matchAll(/fetch\(/g)];
  assert.equal(fetches.length, 1, '只該有抓詞表那一個 fetch');
  assert.ok(/fetch\(new URL\("\.\.\/asian-diceware-7776\.txt"/.test(code));
  for (const needle of ['XMLHttpRequest', 'sendBeacon', 'WebSocket', 'anoniTrack', 'localStorage', 'sessionStorage', 'indexedDB', 'document.cookie', 'caches.open']) {
    assert.ok(!code.includes(needle), `原始碼裡出現了 ${needle}`);
  }
  // 密語只在記憶體裡，介面沒有把它塞進網址、標題或任何屬性
  assert.ok(!/passphrase\s*[,)]?\s*\}?\)?\s*=>?\s*location|location\.(hash|search)\s*=/.test(code));
});

test('加密完先解回來比對，不一致就不給下載。只有讀者答應等的慢環境才省略', () => {
  assert.ok(/decrypter\.decrypt\(output/.test(code), '沒有把輸出解回來');
  assert.ok(/throw new Error\("verify"\)/.test(code), '比對不一致沒有攔下');
  assert.ok(/if \(verify\) \{/.test(code), '比對要由 verify 決定');
  assert.ok(/verified: verify/.test(code), '結果要記得有沒有比對過，文案才分得出來');
  assert.ok(code.includes('anoni-spinner') && code.includes('aria-busy'));
  assert.ok(code.includes('ag-progress'), '等待期間要有進度');
});

test('armor 進出都走 typage 的 armor 模組，剪貼簿只寫不讀，解出來的文字只在貼文字時顯示', () => {
  assert.ok(/input = age\.armor\.decode\(new TextDecoder\(\)\.decode\(input\)\)/.test(code), '解密前沒有把 armor 解回位元組');
  assert.ok(/resultText = age\.armor\.encode\(output\)/.test(code), '文字輸出沒有走 armor');
  assert.ok(/state\.file\.source === "text" \|\| state\.armorOut/.test(code), '文字輸入要一律輸出文字，檔案看勾選');
  assert.ok(/if \(state\.file\.source === "text"\) resultText = decodeUtf8Text\(output, ARMOR_MAX_BYTES\)/.test(code), '解出來的文字只在貼文字時顯示');
  assert.ok(code.includes('navigator.clipboard.writeText'), '沒有複製按鈕');
  assert.ok(!code.includes('readText'), '不准讀剪貼簿');
  assert.ok(/file\.size <= ARMOR_MAX_BYTES/.test(code), '大檔案不該提供文字輸出');
});

test('三個語系的字串表結構一致', () => {
  const shape = (o) => Object.keys(o).sort().map((k) => (typeof o[k] === 'object' ? `${k}:{${Object.keys(o[k]).sort().join(',')}}` : k)).join('|');
  assert.equal(shape(STRINGS.zh), shape(STRINGS['zh-TW']));
  assert.equal(shape(STRINGS.en), shape(STRINGS['zh-TW']));
});

for (const [name, fn] of tests) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed += 1;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message.split('\n').slice(0, 6).join('\n    ')}`);
    failed += 1;
  }
}
if (typage) fs.rmSync(typage.tmp, { recursive: true, force: true });
console.log(`\n${passed} 通過，${failed} 失敗`);
process.exit(failed ? 1 : 0);
