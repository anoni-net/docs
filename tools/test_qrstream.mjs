#!/usr/bin/env node
/**
 * QR code 影格串流（docs/zh-TW/js/qrstream.js）的單元測試。
 *
 * === 為什麼需要這支 ===
 *
 * 這個工具最糟的失敗是「說收齊了，拼出來的檔案卻是壞的」。使用它的場合往往是把
 * 公鑰、bridge 設定或簽章交給眼前的人，收的人多半不會再驗一次，壞掉的內容會被
 * 直接拿去用。中間又沒有任何連線可以重傳，發現得晚就等於白做一次。
 *
 * 所以這裡驗的不只是「一切正常時拼得回來」，更重要的是幾種真的會發生的壞情況：
 * 漏格、亂序、重複、對面中途換檔案、以及一格被改掉。
 *
 * === 往返怎麼做 ===
 *
 * 拿真的兩個函式庫走完整條路：qrcode-generator 編碼、放大成像素、jsQR 讀回來。
 * 編碼與解碼是兩份各自獨立的程式，互相驗證比拿同一份程式碼驗自己有意義。這一趟
 * 順便守住一件事：qrstream.js 產生的碼，qrstream.js 自己讀得回來。
 *
 * 用法：
 *   node tools/test_qrstream.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'docs', 'zh-TW', 'js', 'qrstream.js');
const VENDOR = path.join(HERE, '..', 'docs', 'zh-TW', 'utils', 'vendor');
const src = fs.readFileSync(SRC, 'utf8');

// 掃描用的版本：剝掉註解。註解裡本來就會寫出「不會出現哪些東西」，那些字不該讓
// 自我檢查失效。跟 test_qrcode.mjs、test_leaks.mjs 同一個做法。
const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const require_ = createRequire(import.meta.url);
const qrcode = require_(path.join(VENDOR, 'qrcode-generator.js'));
const jsQR = require_(path.join(VENDOR, 'jsQR.js'));

const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error(`qrstream.js 裡找不到 ${re}`);
  return m[0];
};

// 把 qrstream.js 設定編碼的那一行原地跑一次，而不是在測試裡自己設。這一支要送的是
// 原始位元組，而函式庫預設那一份剛好是「每個字元取低八位」，換成 UTF-8 版就全毀。
// 原地跑等於讓那一行有測試守著。
new Function('window', grab(/^  window\.qrcode\.stringToBytes = .*$/m))({ qrcode });

const harness = `
  ${grab(/^  const MAGIC = .*$/m)}
  ${grab(/^  const HEADER_BYTES = .*$/m)}
  ${grab(/^  const CRC_BYTES = .*$/m)}
  ${grab(/^  const OVERHEAD = .*$/m)}
  ${grab(/^  const MAX_CHUNKS = .*$/m)}
  ${grab(/^  const MANIFEST_INDEX = .*$/m)}
  ${grab(/^  function crc16\(bytes, length\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function packFrame\(session, total, index, payload\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function parseFrame\(bytes\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function safeName\(raw\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function shortenName\(name, keep\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function buildManifest\(info, budget\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function parseManifest\(payload\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function planStream\(dataLength, payloadSize\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function assemble\(chunks, total, size\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function collect\(state, frame\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function missingSummary\(have, total, limit\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function bytesToLatin1\(bytes\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function toHex\(buffer\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function formatSize\(bytes\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function formatDuration\(seconds\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  const DENSITY = \[[\s\S]*?\n  \];/m)}
  ${grab(/^  const SPEED = \[[\s\S]*?\n  \];/m)}
  ${grab(/^  const QUIET = .*$/m)}
  ${grab(/^  const MAX_INPUT_BYTES = .*$/m)}
  ${grab(/^  const STRINGS = \{[\s\S]*?\n  \};/m)}
  return { MAGIC, HEADER_BYTES, CRC_BYTES, OVERHEAD, MAX_CHUNKS, MANIFEST_INDEX,
           crc16, packFrame, parseFrame, safeName, shortenName, buildManifest,
           parseManifest, planStream, assemble, collect, missingSummary,
           bytesToLatin1, toHex, formatSize, formatDuration,
           DENSITY, SPEED, QUIET, MAX_INPUT_BYTES, STRINGS };
`;
const tool = new Function('TextEncoder', 'TextDecoder', harness)(TextEncoder, TextDecoder);

// ---------------------------------------------------------------------------
// 走完整條路的輔助：位元組 -> QR -> 像素 -> jsQR -> 位元組
// ---------------------------------------------------------------------------

// 每個版本在 M 等級裝得下多少位元組。跟工具裡同一套問法，二分搜尋問函式庫。
const capacityCache = new Map();
function capacityOf(version, level) {
  const key = version + level;
  if (capacityCache.has(key)) return capacityCache.get(key);
  let low = 0;
  let high = 3000;
  while (low < high) {
    const mid = Math.ceil((low + high + 1) / 2);
    try {
      const qr = qrcode(version, level);
      qr.addData('x'.repeat(mid));
      qr.make();
      low = mid;
    } catch (err) {
      high = mid - 1;
    }
  }
  capacityCache.set(key, low);
  return low;
}

// 模組矩陣放大成像素。scale 給 4：版本 20 有 97 格，倍率再小 jsQR 的定位就開始
// 抓不到，那會變成測試在測放大倍率而不是在測這個工具。
const SCALE = 4;
function renderFrame(bytes, version, level) {
  const qr = qrcode(version, level);
  qr.addData(tool.bytesToLatin1(bytes));
  qr.make();
  const count = qr.getModuleCount();
  const size = (count + tool.QUIET * 2) * SCALE;
  const data = new Uint8ClampedArray(size * size * 4).fill(255);
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!qr.isDark(row, col)) continue;
      for (let y = 0; y < SCALE; y += 1) {
        for (let x = 0; x < SCALE; x += 1) {
          const px = ((row + tool.QUIET) * SCALE + y) * size + (col + tool.QUIET) * SCALE + x;
          data[px * 4] = 0;
          data[px * 4 + 1] = 0;
          data[px * 4 + 2] = 0;
        }
      }
    }
  }
  return { data, width: size, height: size, modules: count };
}

// 收的一端怎麼讀，這裡就怎麼讀，包含 dontInvert 那個選項。
function readFrame(image) {
  const found = jsQR(image.data, image.width, image.height, { inversionAttempts: 'dontInvert' });
  return found && found.binaryData ? Uint8Array.from(found.binaryData) : null;
}

// 把一份資料切成一串框，模擬傳送端做的事。
function streamOf(data, name, version, session, level) {
  const payloadSize = capacityOf(version, level) - tool.OVERHEAD;
  const manifest = tool.buildManifest(
    { name, size: data.length, stream: data.length, hash: '', compressed: false },
    payloadSize
  );
  assert.ok(manifest, '第 0 格塞不下');
  const plan = tool.planStream(data.length, payloadSize);
  assert.ok(plan, '切不出格數');
  const frames = [];
  for (let index = 0; index < plan.total; index += 1) {
    const payload =
      index === tool.MANIFEST_INDEX
        ? manifest
        : data.subarray((index - 1) * payloadSize, Math.min(index * payloadSize, data.length));
    frames.push(tool.packFrame(session, plan.total, index, payload));
  }
  return { frames, plan, payloadSize, version, level };
}

const newState = () => ({ session: null, total: 0, manifest: null, chunks: new Map(), have: new Set() });

// 把一串框餵進收的一端，回傳拼出來的位元組。order 可以指定送達順序。
function receiveAll(stream, order) {
  const state = newState();
  for (const index of order || stream.frames.map((_, i) => i)) {
    const bytes = readFrame(renderFrame(stream.frames[index], stream.version, stream.level));
    assert.ok(bytes, `第 ${index} 格讀不回來`);
    const frame = tool.parseFrame(bytes);
    assert.ok(frame, `第 ${index} 格拆不開`);
    tool.collect(state, frame);
  }
  return { state, data: state.manifest ? tool.assemble(state.chunks, state.total, state.manifest.stream) : null };
}

const bytesOf = (text) => new TextEncoder().encode(text);
const sameBytes = (a, b) => a.length === b.length && a.every((value, at) => value === b[at]);

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// ---------------------------------------------------------------------------
// 框格式
// ---------------------------------------------------------------------------

test('CRC-16/CCITT 算出來的值跟公開的驗證向量一致', () => {
  // 這一組是 CRC-16/CCITT-FALSE 的標準檢查值。抄錯多項式或初值的話這裡就會紅，
  // 而且別人拿任何一份 CRC 工具驗這個格式也會得到同樣的數。
  assert.equal(tool.crc16(bytesOf('123456789'), 9), 0x29b1);
});

test('組出來的框拆得回來，欄位一個不差', () => {
  const payload = Uint8Array.from({ length: 200 }, (_, i) => i % 256);
  const frame = tool.packFrame(0xbeef, 300, 137, payload);
  assert.equal(frame.length, tool.OVERHEAD + payload.length);
  const parsed = tool.parseFrame(frame);
  assert.ok(parsed);
  assert.equal(parsed.session, 0xbeef);
  assert.equal(parsed.total, 300);
  assert.equal(parsed.index, 137);
  assert.ok(sameBytes(parsed.payload, payload));
});

test('任何一個位元組被改掉，這一格就會被丟掉', () => {
  // 這是 CRC 存在的唯一理由。少了它，壞掉的那一格會被當成好的收下，等到全部收完
  // 比對 SHA-256 才發現，而那時候已經不知道是哪一格壞了。
  const payload = bytesOf('bridge 192.0.2.1:443 0123456789ABCDEF0123456789ABCDEF01234567');
  const frame = tool.packFrame(1, 4, 2, payload);
  for (let at = 0; at < frame.length; at += 1) {
    const broken = frame.slice();
    broken[at] ^= 0x01;
    assert.equal(tool.parseFrame(broken), null, `改掉第 ${at} 個位元組還是收下了`);
  }
});

test('不是這個工具產生的東西一律不收', () => {
  const good = tool.packFrame(1, 3, 1, bytesOf('hello'));
  // 標記不對：相機掃到路邊的別張 QR code
  const wrongMagic = good.slice();
  wrongMagic[0] = 0x42;
  assert.equal(tool.parseFrame(wrongMagic), null);
  // 太短：連框頭都放不下
  assert.equal(tool.parseFrame(good.slice(0, tool.OVERHEAD - 1)), null);
  assert.equal(tool.parseFrame(new Uint8Array(0)), null);
  assert.equal(tool.parseFrame(null), null);
  // 序號超出總數：拿去當索引會在收的一端拼出洞來
  assert.equal(tool.parseFrame(tool.packFrame(1, 3, 5, bytesOf('x'))), null);
  // 總格數小於 2：連檔案資訊加一格資料都不夠
  assert.equal(tool.parseFrame(tool.packFrame(1, 1, 0, bytesOf('x'))), null);
});

// ---------------------------------------------------------------------------
// 檔名
// ---------------------------------------------------------------------------

test('收回來的檔名洗得掉路徑、控制字元與方向覆寫', () => {
  // 斜線先換成底線，開頭的點最後才剝，所以 `../../` 收斂成 `_.._`。
  // 重點在結果裡沒有任何路徑分隔字元，剝完剩什麼形狀不重要。
  assert.equal(tool.safeName('../../etc/passwd'), '_.._etc_passwd');
  assert.equal(tool.safeName('/tmp/x.asc'), '_tmp_x.asc');
  assert.equal(tool.safeName('..'), 'received.bin');
  assert.equal(tool.safeName(''), 'received.bin');
  assert.equal(tool.safeName(null), 'received.bin');
  assert.equal(tool.safeName('a bc.txt'), 'abc.txt');
  // 方向覆寫可以讓執行檔在檔案總管裡顯示成圖片，副檔名被反著畫出來
  // \u202e 是方向覆寫，可以讓執行檔在檔案總管裡顯示成圖片，副檔名被反著畫出來
  assert.equal(tool.safeName('photo\u202egnp.exe'), 'photognp.exe');
  // \u200b 零寬空格與 \ufeff BOM，肉眼看不見，留著會變成檔名的一部分
  assert.equal(tool.safeName('a\u200bb\ufeffc.png'), 'abc.png');
});

test('檔名砍短的時候留住副檔名', () => {
  const long = 'a'.repeat(200) + '.asc';
  const safe = tool.safeName(long);
  assert.ok(safe.length <= 80);
  assert.ok(safe.endsWith('.asc'), `砍掉了副檔名：${safe}`);
});

// ---------------------------------------------------------------------------
// 第 0 格
// ---------------------------------------------------------------------------

test('第 0 格塞得進最小的那一檔密度', () => {
  // 最小的那一檔預算最緊。檔案資訊放不進一格的話，這個工具在那一檔完全不能用，
  // 而畫面上只會看起來卡住。
  const budget = capacityOf(tool.DENSITY[0].version, tool.DENSITY[0].level) - tool.OVERHEAD;
  const manifest = tool.buildManifest(
    { name: 'anoni-net-public-key.asc', size: 40960, stream: 40960, hash: 'a'.repeat(64), compressed: false },
    budget
  );
  assert.ok(manifest, `最小密度只有 ${budget} 個位元組，檔案資訊塞不下`);
  assert.ok(manifest.length <= budget);
});

test('檔名再長也擠得進預算，只是會被砍短', () => {
  const budget = 120;
  const manifest = tool.buildManifest(
    { name: '報告' .repeat(60) + '.pdf', size: 1, stream: 1, hash: 'b'.repeat(64), compressed: false },
    budget
  );
  assert.ok(manifest);
  assert.ok(manifest.length <= budget, `${manifest.length} 超過 ${budget}`);
  assert.ok(tool.parseManifest(manifest));
});

test('第 0 格拆得回來，沒壓縮的時候自己補上 c', () => {
  const manifest = tool.buildManifest(
    { name: 'key.asc', size: 1234, stream: 1234, hash: 'c'.repeat(64), compressed: false },
    400
  );
  const parsed = tool.parseManifest(manifest);
  assert.equal(parsed.name, 'key.asc');
  assert.equal(parsed.size, 1234);
  assert.equal(parsed.stream, 1234, '沒壓縮時 c 應該等於 s');
  assert.equal(parsed.compressed, false);
  assert.equal(parsed.hash, 'c'.repeat(64));

  const zipped = tool.buildManifest(
    { name: 'key.asc', size: 1234, stream: 700, hash: 'd'.repeat(64), compressed: true },
    400
  );
  const parsedZip = tool.parseManifest(zipped);
  assert.equal(parsedZip.compressed, true);
  assert.equal(parsedZip.size, 1234);
  assert.equal(parsedZip.stream, 700);
});

test('第 0 格的內容不成形就整個不認', () => {
  assert.equal(tool.parseManifest(bytesOf('這不是 JSON')), null);
  assert.equal(tool.parseManifest(bytesOf('[]')), null);
  assert.equal(tool.parseManifest(bytesOf('{"s":-1}')), null);
  assert.equal(tool.parseManifest(bytesOf('{"s":"abc"}')), null);
  assert.equal(tool.parseManifest(bytesOf('{"s":10,"z":1}')), null, '說壓縮過卻沒給 c');
  // 雜湊長度不對就當作沒有雜湊，後面會照實說「這一份沒有校驗碼」
  assert.equal(tool.parseManifest(bytesOf('{"s":10,"h":"xyz"}')).hash, '');
});

// ---------------------------------------------------------------------------
// 切格與拼回
// ---------------------------------------------------------------------------

test('格數算得對，含第 0 格', () => {
  assert.equal(tool.planStream(1000, 100).total, 11);
  assert.equal(tool.planStream(1000, 100).dataChunks, 10);
  assert.equal(tool.planStream(1001, 100).dataChunks, 11, '除不盡要進位');
  assert.equal(tool.planStream(1, 100).total, 2);
  assert.equal(tool.planStream(0, 100).total, 2, '空檔案也要有一格資料');
  assert.equal(tool.planStream(100, 0), null);
  assert.equal(tool.planStream(tool.MAX_CHUNKS * 100, 1), null, '超過格數上限要擋下來');
});

test('少一格就拼不出來，不會給出中間有洞的檔案', () => {
  const chunks = new Map([
    [1, bytesOf('aaa')],
    [3, bytesOf('ccc')],
  ]);
  assert.equal(tool.assemble(chunks, 4, 9), null);
  chunks.set(2, bytesOf('bbb'));
  const out = tool.assemble(chunks, 4, 9);
  assert.equal(new TextDecoder().decode(out), 'aaabbbccc');
});

test('還缺哪幾格摺成區間', () => {
  const have = new Set([0, 1, 2, 5, 9]);
  assert.equal(tool.missingSummary(have, 10, 8), '3-4、6-8');
  assert.equal(tool.missingSummary(new Set([0, 2]), 3, 8), '1');
  assert.equal(tool.missingSummary(new Set([0, 1, 2]), 3, 8), '', '收滿了就沒有缺的');
  // 段數太多就截斷，一行塞不下幾十段
  const sparse = new Set();
  for (let i = 0; i < 40; i += 2) sparse.add(i);
  assert.ok(tool.missingSummary(sparse, 40, 3).endsWith('…'));
});

// ---------------------------------------------------------------------------
// 收格的狀態機
// ---------------------------------------------------------------------------

test('重複收到同一格不會重複計數', () => {
  const state = newState();
  const manifest = tool.buildManifest(
    { name: 'a.txt', size: 3, stream: 3, hash: '', compressed: false },
    400
  );
  const first = tool.collect(state, tool.parseFrame(tool.packFrame(7, 3, 0, manifest)));
  assert.equal(first.added, true);
  assert.equal(first.restarted, true);
  assert.equal(first.discarded, false, '第一格不算丟掉東西');
  const again = tool.collect(state, tool.parseFrame(tool.packFrame(7, 3, 0, manifest)));
  assert.equal(again.added, false);
  assert.equal(state.have.size, 1);
});

test('對面換了檔案就把手上的清掉，兩份不會混在一起', () => {
  const state = newState();
  const manifestA = tool.buildManifest({ name: 'a.txt', size: 6, stream: 6, hash: '', compressed: false }, 400);
  tool.collect(state, tool.parseFrame(tool.packFrame(11, 3, 0, manifestA)));
  tool.collect(state, tool.parseFrame(tool.packFrame(11, 3, 1, bytesOf('aaa'))));
  assert.equal(state.have.size, 2);

  const manifestB = tool.buildManifest({ name: 'b.txt', size: 3, stream: 3, hash: '', compressed: false }, 400);
  const step = tool.collect(state, tool.parseFrame(tool.packFrame(22, 2, 0, manifestB)));
  assert.equal(step.restarted, true);
  assert.equal(step.discarded, true, '手上有東西被丟掉了，要跟讀者說');
  assert.equal(state.have.size, 1, '舊的那一份應該整個清掉');
  assert.equal(state.total, 2);
  assert.equal(state.manifest.name, 'b.txt');
});

test('第 0 格內容壞掉時當作沒收到，下一輪還能補', () => {
  const state = newState();
  // sessionId 與總格數是對的，內容不是 JSON
  const step = tool.collect(state, tool.parseFrame(tool.packFrame(5, 2, 0, bytesOf('壞掉的內容'))));
  assert.equal(step.added, false);
  assert.equal(state.have.has(0), false, '標成收到的話這一份永遠拼不出來');
  // 下一輪同一個 session 送來正常的第 0 格
  const manifest = tool.buildManifest({ name: 'a.txt', size: 3, stream: 3, hash: '', compressed: false }, 400);
  assert.equal(tool.collect(state, tool.parseFrame(tool.packFrame(5, 2, 0, manifest))).added, true);
  assert.equal(state.manifest.name, 'a.txt');
});

// ---------------------------------------------------------------------------
// 走真的兩個函式庫的完整往返
// ---------------------------------------------------------------------------

test('切成一串碼再讀回來，位元組一個不差', () => {
  const data = bytesOf(
    '-----BEGIN PGP PUBLIC KEY BLOCK-----\n' +
      'mDMEZ' + 'A'.repeat(500) + '\n' +
      '-----END PGP PUBLIC KEY BLOCK-----\n'
  );
  const stream = streamOf(data, 'anoni.asc', tool.DENSITY[1].version, 0x4242, tool.DENSITY[1].level);
  assert.ok(stream.plan.total > 2, '這一份應該切成好幾格才測得到拼接');
  const { state, data: out } = receiveAll(stream);
  assert.equal(state.manifest.name, 'anoni.asc');
  assert.ok(sameBytes(out, data), '拼回來的內容跟送出去的不一樣');
});

test('二進位內容也傳得過去，包含 0x00 與 0xFF', () => {
  // byte mode 送的是原始位元組，換成 UTF-8 那一份編碼就會在這裡爛掉。
  const data = Uint8Array.from({ length: 256 }, (_, i) => i);
  const stream = streamOf(data, 'all-bytes.bin', tool.DENSITY[0].version, 0x0001, tool.DENSITY[0].level);
  const { data: out } = receiveAll(stream);
  assert.ok(sameBytes(out, data));
});

test('亂序送達照樣拼得回來', () => {
  const data = bytesOf('anoni.net'.repeat(80));
  const stream = streamOf(data, 'x.txt', tool.DENSITY[0].version, 0x1111, tool.DENSITY[0].level);
  const order = stream.frames.map((_, i) => i).reverse();
  const { data: out } = receiveAll(stream, order);
  assert.ok(sameBytes(out, data));
});

test('第一輪漏格、第二輪補上，收得齊', () => {
  // 這是實際上最常發生的一種。播放端不知道對面收到多少，只能一直輪，
  // 對面缺的那幾格靠下一輪補回來。
  const data = bytesOf('bridge line'.repeat(120));
  const stream = streamOf(data, 'bridges.txt', tool.DENSITY[1].version, 0x2222, tool.DENSITY[1].level);
  const all = stream.frames.map((_, i) => i);
  assert.ok(all.length >= 4, '格數太少測不出漏格');
  const firstPass = all.filter((i) => i % 3 !== 1);
  const { state, data: out } = receiveAll(stream, firstPass.concat(all));
  assert.equal(state.have.size, state.total);
  assert.ok(sameBytes(out, data));
});

test('同一份串流的每一格畫出來一樣大', () => {
  // 格子大小會變的話，相機每一格都要重新對焦，一輪下來讀得到的沒幾格。
  const data = bytesOf('y'.repeat(1500));
  const version = tool.DENSITY[1].version;
  const level = tool.DENSITY[1].level;
  const stream = streamOf(data, 'y.txt', version, 0x3333, level);
  const sizes = new Set(stream.frames.map((frame) => renderFrame(frame, version, level).modules));
  assert.equal(sizes.size, 1, `畫出了 ${[...sizes].join('、')} 這幾種大小`);
});

// ---------------------------------------------------------------------------
// 設定值與自我檢查
// ---------------------------------------------------------------------------

test('三檔密度都裝得下框頭，而且由小到大', () => {
  const payloads = tool.DENSITY.map((entry) => capacityOf(entry.version, entry.level) - tool.OVERHEAD);
  for (const size of payloads) assert.ok(size > 0, '這一檔連框頭都放不下');
  for (let i = 1; i < payloads.length; i += 1) {
    assert.ok(payloads[i] > payloads[i - 1], '密度的順序反了，畫面上的小中大會對不上');
  }
});

test('播放速度由慢到快，而且都是正數', () => {
  const rates = tool.SPEED.map((entry) => entry.fps);
  for (const fps of rates) assert.ok(fps > 0);
  for (let i = 1; i < rates.length; i += 1) assert.ok(rates[i] > rates[i - 1]);
});

test('上限講得出來的時間是誠實的', () => {
  // 最大的檔案配最小的密度與最慢的速度，一輪要多久。這個數字如果算出來是幾十分鐘，
  // 上限就訂得太寬鬆，讀者會試了才發現不可行。
  const payload = capacityOf(tool.DENSITY[0].version, tool.DENSITY[0].level) - tool.OVERHEAD;
  const total = tool.planStream(tool.MAX_INPUT_BYTES, payload).total;
  assert.ok(total <= tool.MAX_CHUNKS, '最大的檔案切出來超過格數上限');
  assert.ok(tool.formatDuration(total / tool.SPEED[1].fps).length > 0);
});

test('三個語系的字串鍵一模一樣', () => {
  const langs = Object.keys(tool.STRINGS);
  assert.deepEqual(langs.sort(), ['en', 'zh-CN', 'zh-TW']);
  const base = Object.keys(tool.STRINGS['zh-TW']).sort();
  for (const lang of langs) {
    assert.deepEqual(Object.keys(tool.STRINGS[lang]).sort(), base, `${lang} 的字串對不上 zh-TW`);
  }
  for (const lang of langs) {
    for (const [key, value] of Object.entries(tool.STRINGS[lang])) {
      assert.ok(String(value).trim(), `${lang} 的 ${key} 是空的`);
    }
  }
});

test('程式裡沒有任何把資料送出去的路徑', () => {
  // 小工具區的招牌是「不送出任何資料」，而這一支是唯一會碰到相機的。碰得到鏡頭
  // 又能連外的組合最需要有東西盯著，靠人工複查會漏。
  for (const banned of [
    'fetch(',
    'XMLHttpRequest',
    'WebSocket',
    'RTCPeerConnection',
    'sendBeacon',
    'EventSource',
    'importScripts',
  ]) {
    assert.ok(!code.includes(banned), `出現了 ${banned}`);
  }
  // Response 是用來接 CompressionStream 的，那是本機的串流轉換，不會連外。
  // 這一條盯著它沒有被拿去當 HTTP 用。
  assert.ok(!/new Response\((?!bytes|stream)/.test(code), 'Response 被拿去做別的事了');
});

test('掃描迴圈是目標間隔，不是解完再固定等一段', () => {
  // 這一條擋的是實測過的效率缺陷。原本寫成「解完之後等 90 毫秒」，而 jsQR 在 1280 寬
  // 的畫面上要 32 毫秒，實際掃描率因此只有每秒 8.2 次，比播放端最快的每秒 10 張還慢，
  // 每一輪都會結構性漏掉一批。慢的裝置漏得更兇，因為固定的等待疊在更久的解碼上面。
  //
  // 同一份 33 張的素材，改成扣掉解碼時間之後，收齊從 2.55 輪降到 1.05 輪，快 2.4 倍。
  // 這種缺陷不會壞掉、不會報錯，只會讓人覺得這個工具很慢。
  assert.ok(/const SCAN_TARGET_MS = \d+;/.test(code), '找不到掃描的目標間隔');
  const tick = code.match(/function cameraTick\(\) \{[\s\S]*?\n  \}/);
  assert.ok(tick, '找不到 cameraTick');
  assert.ok(
    /performance\.now\(\)/.test(tick[0]),
    'cameraTick 沒有量自己花了多久，那就沒辦法扣掉解碼時間'
  );
  assert.ok(
    /setTimeout\([\s\S]*?Math\.max\(0, SCAN_TARGET_MS - /.test(tick[0]),
    '下一次掃描沒有扣掉這一次解碼花掉的時間，等於又變回固定等待'
  );
});

test('警告文字沒有拿半透明的色票當文字色', () => {
  // material 的 --md-typeset-del-color 是 #f5503d26、--md-typeset-ins-color 是
  // #0bd57026、--md-typeset-mark-color 是 #ffff0080，三個都帶 alpha，設計上是拿來
  // 當 <del>、<ins>、<mark> 的底色。當背景或邊框剛好，當文字色會淡到讀不了。
  //
  // 這條規則是踩到才補的：第一版把 .qs-msg.qs-bad 的 color 設成 del 那一個，結果
  // 「這個檔案超過上限」淡到看不見，而那句話正是使用者非讀不可的一句。CSS 是注入
  // 在 JS 裡的字串，沒有樣式表 linter 掃得到，DOM 替身也不算色彩，只能在這裡擋。
  const tints = ['--md-typeset-del-color', '--md-typeset-ins-color', '--md-typeset-mark-color'];
  const declarations = [...code.matchAll(/(^|[;{\n])\s*(color|-webkit-text-fill-color)\s*:([^;}]*)/g)];
  for (const match of declarations) {
    for (const tint of tints) {
      assert.ok(
        !match[3].includes(tint),
        `${tint} 是半透明底色，不能當文字色用：${match[0].trim().slice(0, 70)}`
      );
    }
  }
  // 順帶確認它有被用在該用的地方，不然這條規則可能只是因為整個色票沒人用而通過
  assert.ok(/border-left:[^;]*--md-typeset-del-color/.test(code), 'del 色票應該用在 border-left');
});

test('相機一定會被關掉，三條離開路徑都有', () => {
  // 相機開著而讀者以為關了是這一頁最糟的隱私失誤。切分頁、按鈕、離開頁面，
  // 三條路徑都要走到 stopScanning。
  assert.ok(/getTracks\(\)\.forEach\(\(track\) => track\.stop\(\)\)/.test(code), '沒有真的停掉軌道');
  assert.ok(/pagehide["'],\s*stopScanning/.test(code), '離開頁面時沒有關相機');
  assert.ok(/if \(which === "send"\) stopScanning\(\);/.test(code), '切到傳送分頁時沒有關相機');
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
console.log(`\n${passed} 通過，${failed} 失敗`);
process.exit(failed ? 1 : 0);
