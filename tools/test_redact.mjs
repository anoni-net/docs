#!/usr/bin/env node
/**
 * 截圖遮蔽（docs/zh-TW/js/redact.js）的單元測試。
 *
 * === 為什麼需要這支 ===
 *
 * 這個工具的失敗方式跟 metadata 清除器一樣糟：讀者以為遮好了就把圖交出去。
 * 三種畫面上看不出來的錯：
 *
 *   - 方框邊緣少算一個像素，留下一條半遮的原內容。拖出來的座標是小數，取整的
 *     方向錯一邊就會發生，而在縮小顯示的畫布上一個像素根本看不見
 *   - 輸出檔名帶著原檔名。截圖的檔名常有 app 名稱與精確到秒的時間
 *   - 有人日後「順手」加一個模糊選項。模糊是可逆的，這一頁的整個立論建立在
 *     實心填色上，所以直接掃原始碼，出現模糊就紅
 *
 * === 怎麼驗 ===
 *
 * 純邏輯那一段原地抽出來執行，不重寫一份。逐像素驗證用手工造的 RGBA 陣列，
 * 真的解碼要瀏覽器，那一段由頁面自己在交付前做（verifyBlob）。
 *
 * 用法：
 *   node tools/test_redact.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'docs', 'zh-TW', 'js', 'redact.js');
const src = fs.readFileSync(SRC, 'utf8');
const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const start = src.indexOf('// --- 純邏輯');
const end = src.indexOf('// --- 介面');
assert.ok(start > 0 && end > start, 'redact.js 裡找不到純邏輯與介面的分界註解');
const logic = src.slice(start, end);
const tool = new Function(
  `${logic}\n return { FILL, FILL_RGB, MIN_SIDE, MAX_PIXELS, VERIFY, normalizeBox, toImagePoint, fitWithin, outputType, outputName, verifyBoxes };`
)();

const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error(`redact.js 裡找不到 ${re}`);
  return m[0];
};
const STRINGS = new Function(`${grab(/^  const STRINGS = \{[\s\S]*?\n  \};/m)}\n return STRINGS;`)();

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// ---------------------------------------------------------------------------
// 方框
// ---------------------------------------------------------------------------

test('任何方向拖出來的方框都一樣', () => {
  const a = tool.normalizeBox(10, 10, 50, 40, 100, 100);
  const b = tool.normalizeBox(50, 40, 10, 10, 100, 100);
  const c = tool.normalizeBox(50, 10, 10, 40, 100, 100);
  const d = tool.normalizeBox(10, 40, 50, 10, 100, 100);
  assert.deepEqual(a, { x: 10, y: 10, w: 40, h: 30 });
  assert.deepEqual(b, a);
  assert.deepEqual(c, a);
  assert.deepEqual(d, a);
});

test('小數座標往外取整，被碰到一部分的像素整個算進去', () => {
  // 拖到 10.7 與 50.2：左上要落在 10，右下要到 51，不然 10 與 50 那兩排像素
  // 只遮一半，縮小顯示時看不出來，放大就讀得出原內容
  const box = tool.normalizeBox(10.7, 10.3, 50.2, 40.9, 100, 100);
  assert.deepEqual(box, { x: 10, y: 10, w: 41, h: 31 });
});

test('超出畫布的座標夾回邊界', () => {
  const box = tool.normalizeBox(-20, -5, 130, 120, 100, 80);
  assert.deepEqual(box, { x: 0, y: 0, w: 100, h: 80 });
});

test('太小的方框當成誤觸，不收', () => {
  assert.equal(tool.normalizeBox(10, 10, 12, 30, 100, 100), null);
  assert.equal(tool.normalizeBox(10, 10, 30, 12, 100, 100), null);
  assert.equal(tool.normalizeBox(10, 10, 10, 10, 100, 100), null);
  // 剛好到門檻的收
  assert.ok(tool.normalizeBox(10, 10, 10 + tool.MIN_SIDE, 10 + tool.MIN_SIDE, 100, 100));
});

test('畫面座標照顯示比例換成影像座標，兩軸各自算', () => {
  // 2000×1000 的圖顯示成 500×250，畫面上 (100, 50) 對到影像的 (400, 200)
  const rect = { left: 0, top: 0, width: 500, height: 250 };
  assert.deepEqual(tool.toImagePoint(100, 50, rect, 2000, 1000), { x: 400, y: 200 });
  // 畫布不在頁面左上角時要先扣掉位移
  const shifted = { left: 20, top: 30, width: 500, height: 250 };
  assert.deepEqual(tool.toImagePoint(120, 80, shifted, 2000, 1000), { x: 400, y: 200 });
  // 拖出畫布外夾回邊界
  assert.deepEqual(tool.toImagePoint(-10, 999, rect, 2000, 1000), { x: 0, y: 1000 });
});

// ---------------------------------------------------------------------------
// 尺寸與格式
// ---------------------------------------------------------------------------

test('在上限以內不縮', () => {
  assert.deepEqual(tool.fitWithin(4000, 3000, 16000000), { w: 4000, h: 3000, scale: 1 });
});

test('超過上限等比縮到上限以內', () => {
  const fit = tool.fitWithin(8000, 6000, 16000000);
  assert.ok(fit.w * fit.h <= 16000000, `${fit.w}×${fit.h} 還是超過上限`);
  assert.ok(Math.abs(fit.w / fit.h - 8000 / 6000) < 0.01, '比例變了');
  assert.ok(fit.scale < 1);
});

test('JPEG 與 HEIC 輸出 JPEG，其他一律 PNG', () => {
  assert.equal(tool.outputType('image/jpeg'), 'image/jpeg');
  assert.equal(tool.outputType('image/heic'), 'image/jpeg');
  assert.equal(tool.outputType('image/heif'), 'image/jpeg');
  assert.equal(tool.outputType('image/png'), 'image/png');
  assert.equal(tool.outputType('image/webp'), 'image/png');
  assert.equal(tool.outputType('image/gif'), 'image/png');
  assert.equal(tool.outputType(''), 'image/png');
  assert.equal(tool.outputType(undefined), 'image/png');
});

test('輸出檔名固定，不帶原檔名也不帶時間', () => {
  assert.equal(tool.outputName('image/jpeg'), 'redacted.jpg');
  assert.equal(tool.outputName('image/png'), 'redacted.png');
  // 介面那半也只用 outputName 定檔名，沒有任何地方碰原檔名
  assert.ok(!code.includes('file.name'), '原始碼碰了原檔名');
  assert.ok(/link\.download = result\.name/.test(code), '下載檔名不是從 result.name 來的');
  assert.ok(/name: outputName\(type\)/.test(code), 'result.name 不是 outputName 算出來的');
});

// ---------------------------------------------------------------------------
// 逐像素驗證
// ---------------------------------------------------------------------------

// 造一張 width×height 的 RGBA，底色白，指定的方框填黑
function picture(width, height, blackBoxes) {
  const pixels = new Uint8ClampedArray(width * height * 4).fill(255);
  for (const box of blackBoxes) {
    for (let y = box.y; y < box.y + box.h; y += 1) {
      for (let x = box.x; x < box.x + box.w; x += 1) {
        const i = (y * width + x) * 4;
        pixels[i] = 0;
        pixels[i + 1] = 0;
        pixels[i + 2] = 0;
        pixels[i + 3] = 255;
      }
    }
  }
  return pixels;
}

test('每個方框都是純黑就過', () => {
  const boxes = [{ x: 2, y: 2, w: 10, h: 6 }, { x: 20, y: 5, w: 5, h: 5 }];
  const pixels = picture(40, 20, boxes);
  assert.deepEqual(tool.verifyBoxes(pixels, 40, boxes, tool.VERIFY['image/png']), { ok: true, bad: [] });
});

test('方框裡任何一個像素不是黑就不過，並指出是哪一個方框', () => {
  const boxes = [{ x: 2, y: 2, w: 10, h: 6 }, { x: 20, y: 5, w: 5, h: 5 }];
  const pixels = picture(40, 20, boxes);
  // 第二個方框右下角那個像素被留白
  const i = ((5 + 4) * 40 + (20 + 4)) * 4;
  pixels[i] = 255;
  pixels[i + 1] = 255;
  pixels[i + 2] = 255;
  assert.deepEqual(tool.verifyBoxes(pixels, 40, boxes, tool.VERIFY['image/png']), { ok: false, bad: [1] });
});

test('PNG 一個像素都不容許差，半透明的黑也不算', () => {
  const boxes = [{ x: 0, y: 0, w: 4, h: 4 }];
  const pixels = picture(4, 4, boxes);
  pixels[3] = 250; // alpha 差一點
  assert.equal(tool.verifyBoxes(pixels, 4, boxes, tool.VERIFY['image/png']).ok, false);
  const pixels2 = picture(4, 4, boxes);
  pixels2[0] = 1; // 紅色差一階
  assert.equal(tool.verifyBoxes(pixels2, 4, boxes, tool.VERIFY['image/png']).ok, false);
});

test('JPEG 容許邊緣的壓縮雜訊，但內部有原內容照樣紅', () => {
  const boxes = [{ x: 4, y: 4, w: 20, h: 20 }];
  const pixels = picture(40, 40, boxes);
  const rule = tool.VERIFY['image/jpeg'];
  // 邊緣一圈染成深灰，模擬 4:2:0 的色度溢出
  for (let x = 4; x < 24; x += 1) {
    for (const y of [4, 23]) {
      const i = (y * 40 + x) * 4;
      pixels[i] = 18; pixels[i + 1] = 12; pixels[i + 2] = 20;
    }
  }
  assert.equal(tool.verifyBoxes(pixels, 40, boxes, rule).ok, true, '邊緣雜訊不該擋下');
  // 方框中央一個像素是白的，那是漏遮
  const c = (14 * 40 + 14) * 4;
  pixels[c] = 255; pixels[c + 1] = 255; pixels[c + 2] = 255;
  assert.equal(tool.verifyBoxes(pixels, 40, boxes, rule).ok, false, '中央的原內容沒被抓到');
});

test('方框比 inset 還小的時候縮小 inset，不會因為沒東西可檢查而放行', () => {
  const boxes = [{ x: 0, y: 0, w: 4, h: 4 }];
  const pixels = picture(4, 4, []); // 全白，根本沒遮
  assert.equal(tool.verifyBoxes(pixels, 4, boxes, tool.VERIFY['image/jpeg']).ok, false);
});

// ---------------------------------------------------------------------------
// 原始碼掃描
// ---------------------------------------------------------------------------

test('原始碼裡沒有模糊、馬賽克或半透明的填法', () => {
  assert.ok(!/ctx\.filter|blur\(|pixelate|mosaic|globalAlpha/.test(code), '出現了模糊或半透明的手段');
  assert.equal(tool.FILL, '#000000');
  assert.deepEqual(tool.FILL_RGB, [0, 0, 0]);
  // 填色只用實心 fillRect
  assert.ok(/fillStyle = FILL/.test(code), '填色沒有用 FILL 常數');
});

test('原始碼裡沒有任何把資料送出去或留下來的手段', () => {
  for (const needle of ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket', 'anoniTrack']) {
    assert.ok(!code.includes(needle), `原始碼裡出現了 ${needle}`);
  }
  for (const needle of ['localStorage', 'sessionStorage', 'indexedDB', 'document.cookie', 'caches.open']) {
    assert.ok(!code.includes(needle), `原始碼裡出現了 ${needle}`);
  }
});

test('產生輸出時有轉圈與 aria-busy，交付前真的解開一次驗', () => {
  assert.ok(code.includes('anoni-spinner'), '沒有用全站共用的轉圈');
  assert.ok(code.includes('aria-busy'), '狀態沒有用 aria-busy 講出來');
  assert.ok(/async function verifyBlob/.test(code), '沒有把輸出解開驗證的那一步');
  // 驗證沒過就不給下載：result 只在 check.ok 之後才建
  assert.ok(/if \(!check\.ok\) \{\s*error = "verifyFailed";\s*\} else \{\s*result = \{/.test(code), '驗證失敗仍可能給出下載');
});

test('三個語系的字串表結構一致，沒有漏翻譯', () => {
  const shape = (obj) =>
    Object.keys(obj).sort().map((k) => (typeof obj[k] === 'object' ? `${k}:{${Object.keys(obj[k]).sort().join(',')}}` : k)).join('|');
  const base = shape(STRINGS['zh-TW']);
  assert.equal(shape(STRINGS.zh), base, 'zh 的字串表跟 zh-TW 對不上');
  assert.equal(shape(STRINGS.en), base, 'en 的字串表跟 zh-TW 對不上');
});

test('三個語系是各自的文案，不是同一份', () => {
  assert.notEqual(STRINGS['zh-TW'].hint, STRINGS.zh.hint);
  assert.notEqual(STRINGS['zh-TW'].hint, STRINGS.en.hint);
});

test('提示文字寫明馬賽克與模糊可被還原，讀者按之前就看見理由', () => {
  assert.ok(STRINGS['zh-TW'].hint.includes('還原'));
  assert.ok(/revers/i.test(STRINGS.en.hint));
});

// ---------------------------------------------------------------------------

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
