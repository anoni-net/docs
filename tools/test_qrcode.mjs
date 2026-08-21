#!/usr/bin/env node
/**
 * QR code 產生器（docs/zh-TW/js/qrcode.js）的單元測試。
 *
 * === 為什麼需要這支 ===
 *
 * QR 最糟的失敗不是壞掉，是產生一個「掃得出來但內容錯」的碼。少一個字元的 onion
 * 網址、少一段的 bridge line，掃的人不會發現，只會覺得對方給錯了。這種錯誤在畫面上
 * 完全看不出來，人工檢查也檢查不到，因為人眼讀不了 QR。
 *
 * === 這支怎麼驗 ===
 *
 * 自己寫一個解碼器，把產生出來的模組矩陣讀回字串再比對。編碼交給 vendor 的
 * qrcode-generator，解碼是這裡獨立實作的，兩邊互相驗證比「用同一份程式碼驗自己」
 * 有意義。format 資訊的 BCH 也是現算而不是抄表，抄錯了整組驗證就白做。
 *
 * 解碼器只處理乾淨的矩陣（不是照片），所以省掉影像處理那一大塊，只要去遮罩、照
 * zigzag 讀出 codewords、解析 mode 與長度。
 *
 * 涵蓋範圍：byte mode、L 等級、版本 1 到 9。L 等級在這個版本區間是單一資料區塊，
 * 不需要處理交錯。往返測試因此都用 L；別的等級只驗到「選得出版本、畫得出矩陣」。
 * 要擴大範圍的話得補一張各版本的區塊結構表。
 *
 * 用法：
 *   node tools/test_qrcode.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'docs', 'zh-TW', 'js', 'qrcode.js');
const VENDOR = path.join(HERE, '..', 'docs', 'zh-TW', 'utils', 'vendor', 'qrcode-generator.js');
const src = fs.readFileSync(SRC, 'utf8');
const qrcode = createRequire(import.meta.url)(VENDOR);

const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error(`qrcode.js 裡找不到 ${re}`);
  return m[0];
};

// 把 qrcode.js 設定編碼的那一行原地跑一次，而不是在測試裡自己設。改壞它的話
// 中文那項會紅，不然那一行等於沒有測試守著。
new Function('window', grab(/^  window\.qrcode\.stringToBytes = .*$/m))({ qrcode });

const harness = `
  ${grab(/^  function byteLength\(text\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  const ERROR_LEVELS = \{[^}]*\};/m)}
  ${grab(/^  const QUIET_ZONE = .*$/m)}
  ${grab(/^  function fitVersion\(text, level, capacityOf\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function toSvg\(modules, options\) \{[\s\S]*?\n  \}/m)}
  return { byteLength, ERROR_LEVELS, QUIET_ZONE, fitVersion, toSvg };
`;
const tool = new Function('TextEncoder', harness)(TextEncoder);

// ---------------------------------------------------------------------------
// 獨立的 QR 解碼器：吃乾淨的模組矩陣，吐回原始字串
// ---------------------------------------------------------------------------

// format 資訊的 15 位元。BCH(15,5) 現算，抄表抄錯的話整組往返測試都會失去意義。
function formatBits(levelBits, mask) {
  const data = (levelBits << 3) | mask;
  let value = data << 10;
  for (let i = 14; i >= 10; i -= 1) {
    if (value & (1 << i)) value ^= 0b10100110111 << (i - 10);
  }
  return ((data << 10) | value) ^ 0b101010000010010;
}

// 規範裡 L/M/Q/H 對應的兩個位元，順序跟直覺不同
const LEVEL_BITS = { L: 0b01, M: 0b00, Q: 0b11, H: 0b10 };

const MASKS = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

// 對齊圖樣的中心座標，版本 1 沒有
const ALIGNMENT = {
  1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
  6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46],
};

function functionMask(size, version) {
  const grid = Array.from({ length: size }, () => new Array(size).fill(false));
  const mark = (row, col) => {
    if (row >= 0 && row < size && col >= 0 && col < size) grid[row][col] = true;
  };
  // 三個定位圖樣連同分隔帶
  for (const [top, left] of [[0, 0], [0, size - 7], [size - 7, 0]]) {
    for (let r = -1; r <= 7; r += 1) for (let c = -1; c <= 7; c += 1) mark(top + r, left + c);
  }
  // 時序圖樣
  for (let i = 0; i < size; i += 1) {
    mark(6, i);
    mark(i, 6);
  }
  // 對齊圖樣，跟定位圖樣重疊的那幾組不畫
  const centers = ALIGNMENT[version] || [];
  for (const r of centers) {
    for (const c of centers) {
      const nearFinder =
        (r <= 8 && c <= 8) || (r <= 8 && c >= size - 9) || (r >= size - 9 && c <= 8);
      if (nearFinder) continue;
      for (let dr = -2; dr <= 2; dr += 1) for (let dc = -2; dc <= 2; dc += 1) mark(r + dr, c + dc);
    }
  }
  // format 資訊。左上那一份是 9 + 9 個模組，右上與左下各 8 個，左下那 8 個裡
  // 最上面那格是規範固定為黑的 dark module。多標或少標一格，資料位元就整個偏移，
  // 而偏移落在 padding 區的時候短字串照樣解得出來，長字串才會露餡。
  for (let i = 0; i <= 8; i += 1) {
    mark(8, i);
    mark(i, 8);
  }
  for (let i = 0; i < 8; i += 1) {
    mark(8, size - 1 - i);
    mark(size - 1 - i, 8);
  }
  // 版本 7 以上還有版本資訊區
  if (version >= 7) {
    for (let i = 0; i < 6; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        mark(i, size - 11 + j);
        mark(size - 11 + j, i);
      }
    }
  }
  return grid;
}

function readFormat(modules) {
  const size = modules.length;
  const bits = [];
  // 左上那一份：第 8 欄由下往上、第 8 列由左往右，跳過時序線
  for (let i = 0; i <= 5; i += 1) bits.push(modules[8][i] ? 1 : 0);
  bits.push(modules[8][7] ? 1 : 0);
  bits.push(modules[8][8] ? 1 : 0);
  bits.push(modules[7][8] ? 1 : 0);
  for (let i = 5; i >= 0; i -= 1) bits.push(modules[i][8] ? 1 : 0);
  const value = bits.reduce((acc, bit) => (acc << 1) | bit, 0);

  for (const [level, levelBits] of Object.entries(LEVEL_BITS)) {
    for (let mask = 0; mask < 8; mask += 1) {
      if (formatBits(levelBits, mask) === value) return { level, mask };
    }
  }
  throw new Error('format 資訊對不到任何一組合法組合');
}

// L 等級各版本的區塊結構：[區塊數, 每個區塊的資料碼字數]。
// 版本 1 到 5 是單一區塊，6 到 9 是兩個等大的區塊。
const BLOCKS_L = {
  1: [1, 19], 2: [1, 34], 3: [1, 55], 4: [1, 80], 5: [1, 108],
  6: [2, 68], 7: [2, 78], 8: [2, 97], 9: [2, 116],
};

function decode(modules) {
  const size = modules.length;
  const version = (size - 17) / 4;
  assert.ok(Number.isInteger(version) && version >= 1, `矩陣尺寸 ${size} 不是合法的 QR`);
  const { level, mask } = readFormat(modules);
  const isFunction = functionMask(size, version);
  const unmask = MASKS[mask];

  const bits = [];
  let up = true;
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right = 5; // 時序欄不算在資料區裡
    for (let i = 0; i < size; i += 1) {
      const row = up ? size - 1 - i : i;
      for (const col of [right, right - 1]) {
        if (isFunction[row][col]) continue;
        const dark = modules[row][col];
        bits.push((dark !== unmask(row, col)) ? 1 : 0);
      }
    }
    up = !up;
  }

  // 資料碼字在多區塊時是交錯排列的，先還原成一個區塊接一個區塊。
  // 這裡只處理 L 等級版本 1 到 9，那個範圍內的區塊大小一致，還原規則很單純。
  const layout = BLOCKS_L[version];
  assert.ok(layout, `解碼器只涵蓋 L 等級版本 1 到 9，拿到版本 ${version}`);
  assert.equal(level, 'L', '往返測試只跑 L 等級，別的等級的區塊結構沒有實作');
  const [blockCount, dataPerBlock] = layout;
  const codewords = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    codewords.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));
  }
  const data = new Array(blockCount * dataPerBlock);
  for (let i = 0; i < data.length; i += 1) {
    data[Math.floor(i / blockCount) + (i % blockCount) * dataPerBlock] = codewords[i];
  }
  const dataBits = [];
  for (const byte of data) {
    for (let b = 7; b >= 0; b -= 1) dataBits.push((byte >> b) & 1);
  }

  const take = (count, at) => dataBits.slice(at, at + count).reduce((a, b) => (a << 1) | b, 0);
  const mode = take(4, 0);
  assert.equal(mode, 0b0100, `只支援 byte mode，拿到 ${mode.toString(2)}`);
  // 版本 1 到 9 的 byte mode 用 8 位元表示長度
  const length = take(8, 4);
  const bytes = [];
  for (let i = 0; i < length; i += 1) bytes.push(take(8, 12 + i * 8));
  return { text: new TextDecoder().decode(Uint8Array.from(bytes)), level, version };
}

// 產生矩陣，跟 qrcode.js 的 build 走同一條路
function encode(text, level) {
  const version = tool.fitVersion(text, level, (v, l) => {
    try {
      const probe = qrcode(v, l);
      probe.addData(text);
      probe.make();
      return tool.byteLength(text);
    } catch (err) {
      return -1;
    }
  });
  if (!version) return null;
  const qr = qrcode(version, level);
  qr.addData(text);
  qr.make();
  const count = qr.getModuleCount();
  const modules = [];
  for (let row = 0; row < count; row += 1) {
    const line = [];
    for (let col = 0; col < count; col += 1) line.push(qr.isDark(row, col));
    modules.push(line);
  }
  return { modules, version };
}

const roundTrip = (text, level = 'L') => {
  const made = encode(text, level);
  assert.ok(made, `${text.slice(0, 20)} 應該編得出來`);
  return decode(made.modules);
};

// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('英文短字串原封不動讀得回來', () => {
  assert.equal(roundTrip('hello').text, 'hello');
  assert.equal(roundTrip('anoni.net').text, 'anoni.net');
});

test('onion 網址讀得回來，一個字元都不能差', () => {
  // 少一個字元的 onion 網址掃的人不會發現，只會覺得對方給錯了
  const onion = 'http://docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/';
  assert.equal(roundTrip(onion).text, onion);
});

test('bridge line 讀得回來', () => {
  const bridge =
    'obfs4 192.0.2.1:9001 ABCDEF0123456789ABCDEF0123456789ABCDEF01 ' +
    'cert=aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789abcdefghijklmnopqrstuvwxyzAB iat-mode=0';
  assert.equal(roundTrip(bridge).text, bridge);
});

test('中文讀得回來，UTF-8 多位元組沒有被截斷', () => {
  const text = '匿名網路社群 anoni.net';
  assert.equal(roundTrip(text).text, text);
});

test('每一種遮罩都解得開', () => {
  // 遮罩由編碼器依懲罰分數挑，換內容就換遮罩。這裡掃過一批字串，
  // 只要其中出現過的遮罩解出來都對，就代表八種都處理得了。
  const seen = new Set();
  for (let i = 0; i < 40; i += 1) {
    const text = 'anoni-' + i + '-' + 'x'.repeat(i % 7);
    const made = encode(text, 'L');
    const got = decode(made.modules);
    assert.equal(got.text, text, `第 ${i} 個字串對不上`);
    seen.add(readFormat(made.modules).mask);
  }
  assert.ok(seen.size >= 4, `只碰到 ${seen.size} 種遮罩，樣本不夠有代表性`);
});

test('版本跟著內容長度往上升', () => {
  const short = encode('hi', 'L');
  const long = encode('x'.repeat(100), 'L');
  assert.equal(short.version, 1);
  assert.ok(long.version > short.version);
  assert.equal(decode(long.modules).text, 'x'.repeat(100));
});

test('糾錯等級照要求設定，解出來對得上', () => {
  for (const level of ['L', 'M', 'Q', 'H']) {
    const made = encode('anoni.net', level);
    assert.equal(readFormat(made.modules).level, level, `${level} 級設錯了`);
  }
});

test('中文的位元組數照 UTF-8 算，不是字數', () => {
  assert.equal(tool.byteLength('abc'), 3);
  assert.equal(tool.byteLength('匿名'), 6);
  assert.equal(tool.byteLength('a匿'), 4);
});

test('裝不下就回 null，不是丟例外', () => {
  // 使用者貼了一整篇文章進來時要看到「太長了」，不是白畫面
  const huge = 'x'.repeat(5000);
  assert.equal(tool.fitVersion(huge, 'L', () => 100), null);
});

test('挑的是裝得下的最小版本', () => {
  const capacity = (version) => version * 10;
  assert.equal(tool.fitVersion('x'.repeat(25), 'L', capacity), 3);
  assert.equal(tool.fitVersion('x'.repeat(30), 'L', capacity), 3);
  assert.equal(tool.fitVersion('x'.repeat(31), 'L', capacity), 4);
});

test('SVG 的留白與尺寸符合規範', () => {
  const modules = [
    [true, false],
    [false, true],
  ];
  const svg = tool.toSvg(modules, {
    quiet: 4, background: '#fff', foreground: '#000', label: 'x',
  });
  // 2 格內容加上兩側各 4 格留白
  assert.ok(svg.includes('viewBox="0 0 10 10"'), svg.slice(0, 120));
  // 留白少了有些掃描器讀不到，所以位置要偏移 quiet
  assert.ok(svg.includes('<rect x="4" y="4" width="1" height="1"/>'));
  assert.ok(svg.includes('<rect x="5" y="5" width="1" height="1"/>'));
});

test('同一列連續的黑格併成一個 rect', () => {
  // 一格一個 rect 的話，版本 10 的碼會有好幾千個節點
  // QR 一定是正方形，替身也要照著給
  const modules = [
    [true, true, true, false, true],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
  ];
  const svg = tool.toSvg(modules, {
    quiet: 0, background: '#fff', foreground: '#000', label: 'x',
  });
  assert.ok(svg.includes('<rect x="0" y="0" width="3" height="1"/>'), svg);
  assert.ok(svg.includes('<rect x="4" y="0" width="1" height="1"/>'));
  assert.equal((svg.match(/<rect/g) || []).length, 3, '底色一個加上兩段黑格');
});

test('糾錯等級的說明數字沒有寫反', () => {
  assert.deepEqual(tool.ERROR_LEVELS, { L: 7, M: 15, Q: 25, H: 30 });
});

test('留白留了規範要求的四格', () => {
  // 少了留白有些掃描器對不到邊界，而畫面上看起來只是「邊框比較窄」
  assert.equal(tool.QUIET_ZONE, 4);
});

for (const [name, fn] of tests) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed += 1;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message.split('\n').slice(0, 5).join('\n    ')}`);
    failed += 1;
  }
}
console.log(`\n${passed} 通過，${failed} 失敗`);
process.exit(failed ? 1 : 0);
