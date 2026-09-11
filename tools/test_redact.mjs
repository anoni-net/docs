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

const CORE = path.join(HERE, '..', 'docs', 'zh-TW', 'js', 'redact-detect.js');
const coreSrc = fs.readFileSync(CORE, 'utf8');
const coreCode = coreSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
// 這一份是 worker 與退路共用的掃描核心，原地載進來真的執行
const core = new Function('self', `${coreSrc}\n return self.redactDetect;`)({});

const WORKER = path.join(HERE, '..', 'docs', 'zh-TW', 'js', 'redact-worker.js');
const workerSrc = fs.readFileSync(WORKER, 'utf8');
const workerCode = workerSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const start = src.indexOf('// --- 純邏輯');
const end = src.indexOf('// --- 介面');
assert.ok(start > 0 && end > start, 'redact.js 裡找不到純邏輯與介面的分界註解');
const logic = src.slice(start, end);
const tool = new Function(
  `${logic}\n return { FILL, FILL_RGB, MIN_SIDE, MAX_PIXELS, VERIFY, normalizeBox, toImagePoint, fitWithin, outputType, outputName, verifyBoxes, DETECT, detectionToBox, detectSize, isCovered, hitBox };`
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

test('偵測用的縮圖尺寸：超過上限才縮，比例算得回去', () => {
  const small = tool.detectSize(800, 600, 1280);
  assert.deepEqual(small, { width: 800, height: 600, scale: 1 });

  const big = tool.detectSize(4000, 3000, 1280);
  assert.equal(big.width, 1280);
  assert.equal(big.height, 960);
  // scale 是把偵測座標乘回原尺寸的倍率
  assert.ok(Math.abs(big.width * big.scale - 4000) < 1, '寬度乘回去對不上');
  assert.ok(Math.abs(big.height * big.scale - 3000) < 1, '高度乘回去對不上');

  // 直向的照片以長邊為準
  const tall = tool.detectSize(1000, 4000, 1280);
  assert.equal(tall.height, 1280);
  assert.ok(tall.width >= 1);
});

test('偵測結果換成方框：往外推、夾在影像內、座標放得回原尺寸', () => {
  // pico 回傳 [row, col, diameter, quality]
  const box = tool.detectionToBox([100, 200, 50, 300], 1, 640, 480);
  // 中心要落在原本的中心上
  assert.ok(Math.abs(box.x + box.w / 2 - 200) <= 1, '水平中心跑掉了');
  assert.ok(Math.abs(box.y + box.h / 2 - 100) <= 1, '垂直中心跑掉了');
  // 往外推過，比原本的直徑大
  assert.ok(box.w > 50, '沒有往外推');
  assert.ok(Math.abs(box.w - 50 * (1 + tool.DETECT.pad)) <= 2, '推的比例不對');

  // 縮圖上偵測到的座標要乘回原尺寸
  const scaled = tool.detectionToBox([100, 200, 50, 300], 2, 1280, 960);
  assert.ok(Math.abs(scaled.x + scaled.w / 2 - 400) <= 2, '放大之後中心不對');
  assert.ok(scaled.w > box.w, '放大之後方框沒有變大');
});

test('貼著邊緣的臉不會把方框推到影像外面', () => {
  // 左上角的臉。往外推之後左邊與上面都會超出去
  const box = tool.detectionToBox([10, 10, 60, 300], 1, 640, 480);
  assert.ok(box.x >= 0 && box.y >= 0, '方框跑到影像外面了');
  assert.ok(box.x + box.w <= 640 && box.y + box.h <= 480, '方框超出右下邊界');

  // 右下角的臉
  const corner = tool.detectionToBox([475, 635, 60, 300], 1, 640, 480);
  assert.ok(corner.x >= 0 && corner.y >= 0);
  assert.ok(corner.x + corner.w <= 640 && corner.y + corner.h <= 480);
});

test('已經被讀者遮過的地方不重複加框', () => {
  const existing = [{ x: 100, y: 100, w: 80, h: 80 }];
  // 中心落在既有方框裡
  assert.equal(tool.isCovered({ x: 120, y: 120, w: 20, h: 20 }, existing), true);
  // 中心在外面
  assert.equal(tool.isCovered({ x: 300, y: 300, w: 20, h: 20 }, existing), false);
  // 沒有既有方框
  assert.equal(tool.isCovered({ x: 120, y: 120, w: 20, h: 20 }, []), false);
});

test('偵測的門檻偏低是刻意的，漏抓比多抓貴', () => {
  // 多抓的候選框點一下就移掉（hitBox），漏抓的臉會跟著圖送出去。逐個移掉這件事
  // 是這個取捨的前提，所以下面還有一條測試盯著它別被拿掉
  // 上界：40 會讓細框眼鏡的臉跌破門檻（實測分數從 74 掉到 36、40 掉到 14），
  //       10 在遠景模糊的街拍場景比 6 少找到兩張
  // 下界：3 開始多框（街拍正立那一格從 2 個變 3 個）
  assert.ok(tool.DETECT.minQuality <= 6, '門檻太高，戴細框眼鏡與遠一點的臉會漏掉');
  assert.ok(tool.DETECT.minQuality >= 4, '門檻太低會開始把不是臉的地方框起來');
  assert.ok(tool.DETECT.pad > 0, '沒有往外推的話頭髮跟下巴會露在框外');
  // 街拍那種有近有遠的場景，40 會漏掉遠的（21 張只抓到 17），24 會開始多框
  assert.ok(tool.DETECT.minSize <= 32, '最小尺寸太大，遠一點的臉會漏掉');
  assert.ok(tool.DETECT.minSize >= 28, '最小尺寸太小會把不是臉的地方框起來');
  // 這個值決定多小的臉還抓得到，因為 minSize 量的是縮完之後的像素。量過 1280
  // 在 64 張小臉的合成場景只抓到 31 張，1920 全中，所以下限訂在 1920。
  assert.ok(tool.DETECT.maxSide >= 1920, '縮得太小，人多的時候會抓不到');
});

test('還沒選檔案的畫面就講出有自動找出人臉這個選項', () => {
  // 所有按鈕都要等圖片載進來才出現。文章的步驟寫著「先按自動找出人臉」，
  // 而讀者停在第一步時畫面上沒有那顆按鈕，實際回報過找不到。
  assert.ok(
    /if \(!source\) \{[\s\S]*?t\.beforeHint[\s\S]*?return;/.test(src),
    '載入前的畫面沒有把 beforeHint 放出來'
  );
  for (const lang of ['zh-TW', 'zh', 'en']) {
    const hint = STRINGS[lang].beforeHint;
    assert.ok(hint, `${lang} 沒有 beforeHint`);
    // 提示裡要出現那顆按鈕的字面，讀者才對得起來
    assert.ok(
      hint.includes(STRINGS[lang].findFaces),
      `${lang} 的 beforeHint 沒有寫出按鈕的名字`
    );
  }
});

test('結果訊息要講到墨鏡，那是實測完全抓不到的一類', () => {
  // 對照實驗：同一張臉疊上墨鏡，分數從 338 掉到 13，不設門檻也救不回來
  for (const lang of ['zh-TW', 'zh', 'en']) {
    const line = STRINGS[lang].foundSome;
    assert.ok(/墨鏡|墨镜|dark glasses/i.test(line), `${lang} 沒有提到墨鏡`);
  }
});

test('文案講出偵測抓不到什麼，不是只報找到幾張', () => {
  // 只講找到幾張會讓人以為剩下的都乾淨了
  // 這一份的鍵是 zh-TW、zh、en，簡體那一份的鍵沒有地區碼
  for (const lang of ['zh-TW', 'zh', 'en']) {
    const found = STRINGS[lang].foundSome;
    assert.ok(found, `${lang} 沒有 foundSome`);
    assert.ok(/\{n\}/.test(found), `${lang} 的 foundSome 沒有帶數量`);
    assert.ok(found.length > 30, `${lang} 的 foundSome 太短，放不下限制的說明`);
    assert.ok(STRINGS[lang].foundNone, `${lang} 沒有 foundNone`);
  }
});

test('原始碼裡沒有模糊、馬賽克或半透明的填法', () => {
  assert.ok(!/ctx\.filter|blur\(|pixelate|mosaic|globalAlpha/.test(code), '出現了模糊或半透明的手段');
  assert.equal(tool.FILL, '#000000');
  assert.deepEqual(tool.FILL_RGB, [0, 0, 0]);
  // 填色只用實心 fillRect
  assert.ok(/fillStyle = FILL/.test(code), '填色沒有用 FILL 常數');
});

test('原始碼裡沒有任何把資料送出去或留下來的手段', () => {
  for (const needle of ['XMLHttpRequest', 'sendBeacon', 'WebSocket', 'EventSource', 'anoniTrack']) {
    assert.ok(!code.includes(needle), `原始碼裡出現了 ${needle}`);
  }
  for (const needle of ['localStorage', 'sessionStorage', 'indexedDB', 'document.cookie', 'caches.open']) {
    assert.ok(!code.includes(needle), `原始碼裡出現了 ${needle}`);
  }
});

test('唯一的 fetch 是去拿本站的級聯資料，而且不帶任何內容出去', () => {
  // 2026-09 之前這裡連 fetch( 都直接禁掉。臉部偵測要讀級聯檔，所以改成精確的
  // 條件而不是放寬：只准一個 fetch，網址由 new URL 從相對路徑組出來（同源），
  // 而且不准有第二個參數，沒有第二個參數就不可能帶 method 或 body。
  const calls = [...code.matchAll(/fetch\(([^)]*)\)/g)].map((m) => m[1].trim());
  assert.equal(calls.length, 1, `fetch 出現 ${calls.length} 次，應該只有一次`);
  assert.equal(calls[0], 'url', 'fetch 的參數不是那個組好的 url 變數');
  assert.ok(
    /const url = new URL\("\.\.\/vendor\/pico\/facefinder", location\.href\)\.href;/.test(code),
    '級聯檔的網址不是用相對路徑組出來的'
  );
  // 整份原始碼不該有任何絕對網址（註解裡的說明不算）
  const withoutComments = code.replace(/^\s*\*.*$/gm, '');
  assert.ok(!/https?:\/\//.test(withoutComments), '原始碼裡出現絕對網址');
});

test('偵測用的程式與資料只從本站相對路徑載入', () => {
  // 載入器只有一處組網址，literal 在呼叫端
  assert.ok(
    /script\.src = new URL\(rel, location\.href\)\.href;/.test(code),
    'loadScript 不是用相對路徑從同源組出來的'
  );
  const rels = [...code.matchAll(/loadScript\((['"])([^'"]+)\1\)/g)].map((m) => m[2]);
  assert.deepEqual(
    rels.sort(),
    ['../../js/redact-detect.js', '../vendor/pico/pico.js'],
    '載入的相對路徑跟預期不一樣'
  );
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
// 候選框：偵測只提案，遮蔽由讀者按下去
// ---------------------------------------------------------------------------

test('點擊命中：後畫的疊在前面，先問最後一個', () => {
  const list = [
    { x: 0, y: 0, w: 100, h: 100 },
    { x: 40, y: 40, w: 20, h: 20 },
  ];
  assert.equal(tool.hitBox(list, 50, 50), 1, '兩個重疊時要命中後畫的那一個');
  assert.equal(tool.hitBox(list, 10, 10), 0, '只在大的裡面就命中大的');
});

test('點擊命中：點在外面回傳 -1，邊界算命中', () => {
  const list = [{ x: 10, y: 20, w: 30, h: 40 }];
  assert.equal(tool.hitBox(list, 5, 5), -1);
  assert.equal(tool.hitBox(list, 41, 30), -1, '右邊界外一格不該命中');
  assert.equal(tool.hitBox(list, 10, 20), 0, '左上角算命中');
  assert.equal(tool.hitBox(list, 40, 60), 0, '右下角算命中');
  assert.equal(tool.hitBox([], 1, 1), -1, '空清單不該爆掉');
});

test('偵測結果進 marks，不直接進 boxes', () => {
  // 這是這一輪修的核心。utils/redact.md 的「不做的事」寫著偵測只把框畫出來，
  // 舊版卻是按下去就整批填成實心黑，文件與行為相反。
  const found = src.match(/marks = found;/);
  assert.ok(found, 'findFaces 沒有把結果放進 marks');
  assert.ok(
    !/for \(const box of found\) boxes\.push/.test(src),
    '偵測結果又被直接推進 boxes 了，那等於跳過讀者確認'
  );
});

test('候選框只畫線不填色', () => {
  const draw = src.slice(src.indexOf('function draw(options)'), src.indexOf('function scheduleDraw'));
  assert.ok(draw.includes('for (const box of marks)'), 'draw 裡沒有畫候選框');
  const marksPart = draw.slice(draw.indexOf('for (const box of marks)'), draw.indexOf('if (dragging)'));
  assert.ok(marksPart.includes('strokeRect'), '候選框要用線畫出來');
  assert.ok(!marksPart.includes('fillRect'), '候選框被填成實心了，那就分不出提案與已遮');
});

test('輸出前重畫一次不帶候選框，藍線不會燒進交出去的圖', () => {
  const exp = src.slice(src.indexOf('async function exportImage'), src.indexOf('function bindPointer'));
  assert.ok(
    exp.includes('draw({ marks: false })'),
    '輸出前沒有跳過候選框，那幾條線會被編碼進輸出'
  );
  assert.ok(!/\bdraw\(\)/.test(exp), '輸出路徑上還有一個不帶參數的 draw()');
});

test('候選框還沒決定就不給產生輸出', () => {
  const exp = src.slice(src.indexOf('async function exportImage'), src.indexOf('function bindPointer'));
  assert.ok(
    /if \(!source \|\| !boxes\.length \|\| marks\.length \|\| working\) return;/.test(exp),
    'exportImage 沒有擋住候選框還在的情況'
  );
  assert.ok(
    /make\.disabled = [^\n]*marks\.length > 0/.test(src),
    '產生的按鈕沒有在候選框還在的時候停用'
  );
});

test('驗證只驗已經遮住的方框，候選框不算數', () => {
  const exp = src.slice(src.indexOf('async function exportImage'), src.indexOf('function bindPointer'));
  const calls = exp.match(/verifyBlob\([^)]*\)/g) || [];
  assert.ok(calls.length >= 1, '輸出路徑上找不到驗證');
  for (const call of calls) {
    assert.ok(call.includes('boxes'), `驗證沒有帶 boxes：${call}`);
    assert.ok(!call.includes('marks'), `驗證帶到候選框了：${call}`);
  }
});

test('點一下就移掉一個框，不必從最後一個一路復原回來', () => {
  const bind = src.slice(src.indexOf('function bindPointer'), src.indexOf('function button('));
  assert.ok(bind.includes('hitBox(marks'), '點擊沒有去問候選框');
  assert.ok(bind.includes('marks.splice('), '點到候選框沒有移掉它');
  assert.ok(bind.includes('hitBox(boxes'), '點擊沒有去問已經遮住的方框');
  assert.ok(bind.includes('boxes.splice('), '點到已經遮住的地方沒有移掉它');
});

test('全部遮起來會把候選框整批收進 boxes 並清空', () => {
  const cover = src.slice(src.indexOf('if (marks.length) {'), src.indexOf('const undo = button'));
  assert.ok(cover.includes('t.coverAll'), '沒有全部遮起來這顆按鈕');
  assert.ok(/for \(const box of marks\) boxes\.push\(box\);/.test(cover), '沒有把候選框收進 boxes');
  assert.ok(/marks = \[\];/.test(cover), '收完沒有清空候選框');
});

test('全部重來與換一張都要清掉候選框', () => {
  for (const label of ['t.reset', 't.another']) {
    const at = src.indexOf(`button(${label}`);
    assert.ok(at > 0, `找不到 ${label} 那顆按鈕`);
    const body = src.slice(at, at + 400);
    assert.ok(/marks = \[\];/.test(body), `${label} 沒有清掉候選框`);
  }
});

test('三個語系都講清楚候選框還沒有遮住任何東西', () => {
  for (const lang of ['zh-TW', 'zh', 'en']) {
    const s = STRINGS[lang];
    assert.ok(s.coverAll, `${lang} 少了 coverAll`);
    assert.ok(s.markLeft.includes('{n}'), `${lang} 的 markLeft 沒有帶數量`);
    assert.ok(s.markNone, `${lang} 少了 markNone`);
  }
  // 最容易出人命的一句：找到了但還沒遮，講成「已經框起來」會被當成已經安全
  assert.ok(
    /還沒有遮住/.test(STRINGS['zh-TW'].foundSome),
    'zh-TW 的 foundSome 沒有講出還沒有遮住'
  );
  assert.ok(
    /还没有遮住/.test(STRINGS.zh.foundSome),
    'zh-CN 的 foundSome 沒有講出還沒有遮住'
  );
  assert.ok(
    /nothing is covered yet/i.test(STRINGS.en.foundSome),
    'en 的 foundSome 沒有講出還沒有遮住'
  );
  for (const lang of ['zh-TW', 'zh']) {
    assert.ok(
      !/已經框起來。|已经框起来。/.test(STRINGS[lang].foundSome),
      `${lang} 的 foundSome 還在講「已經框起來」，讀者會以為遮好了`
    );
  }
});

test('提示文字要講出點一下可以移掉', () => {
  assert.ok(/點一下就移掉/.test(STRINGS['zh-TW'].hint));
  assert.ok(/点一下就移掉/.test(STRINGS.zh.hint));
  assert.ok(/tap one to take it away/i.test(STRINGS.en.hint));
});


// ---------------------------------------------------------------------------
// 掃描跑在 worker 裡，主執行緒不會凍住
// ---------------------------------------------------------------------------

test('按下去之後先讓瀏覽器畫一次，再開始工作', () => {
  // 這是回報「按下去沒反應」的根因。第二次按的時候 pico 已經在記憶體裡，
  // await 只讓出一個 microtask，整段偵測會在同一個工作裡做完，按鈕從頭到尾
  // 沒有變過。量過六倍節流下是按下去之後 2.5 秒才有第一個畫面。
  const fn = src.slice(src.indexOf('async function findFaces'), src.indexOf('async function exportImage'));
  const at = fn.indexOf('render();');
  const yieldAt = fn.indexOf('requestAnimationFrame(() => setTimeout(next, 0))');
  assert.ok(at > 0, 'findFaces 裡沒有 render()');
  assert.ok(yieldAt > at, 'render() 之後沒有等一次繪製，畫面來不及更新就開始算');
  assert.ok(
    yieldAt < fn.indexOf('detectInWorker'),
    '讓出的位置在開始工作之後，那就沒有用'
  );
});

test('掃描交給 worker，網址是本站的相對路徑', () => {
  const m = code.match(/new Worker\(new URL\((['"])([^'"]+)\1, location\.href\)\.href\)/);
  assert.ok(m, 'worker 不是用相對路徑從同源組出來的');
  assert.equal(m[2], '../../js/redact-worker.js');
  assert.ok(
    fs.existsSync(WORKER),
    'worker 檔案不存在'
  );
});

test('worker 起不來就退回頁面裡做，功能不會消失', () => {
  const fn = src.slice(src.indexOf('async function findFaces'), src.indexOf('async function exportImage'));
  assert.ok(/if \(!dets\) dets = await detectInPage\(plan, showPartial\);/.test(fn), '沒有退路');
  assert.ok(code.includes('workerDead'), '起不來之後沒有記下來，會一直重試');
  assert.ok(
    src.includes('async function detectInPage'),
    '退回頁面裡做的那一條不見了'
  );
});

test('偵測中畫布不收拖曳，跟按鈕的狀態一致', () => {
  const bind = src.slice(src.indexOf('function bindPointer'), src.indexOf('function button('));
  assert.ok(
    /pointerdown[\s\S]{0,400}?if \(!source \|\| working \|\| detecting\) return;/.test(bind),
    '偵測中還收得到拖曳，那一下會排隊到偵測結束才處理'
  );
});

test('偵測中每秒只換秒數，不重畫整個介面', () => {
  assert.ok(code.includes('elapsedNode'), '沒有單獨的秒數節點');
  const tick = src.slice(src.indexOf('function startElapsed'), src.indexOf('function stopElapsed'));
  assert.ok(tick.includes('elapsedNode.nodeValue'), '計時器沒有直接換文字節點');
  assert.ok(!/\brender\(\)/.test(tick), '計時器每秒重畫整個介面，底圖會跟著重畫');
});

test('三個語系都給了秒數與時間預期', () => {
  for (const lang of ['zh-TW', 'zh', 'en']) {
    assert.ok(STRINGS[lang].elapsed.includes('{s}'), `${lang} 的 elapsed 沒有帶秒數`);
    assert.ok(STRINGS[lang].findingNote, `${lang} 少了 findingNote`);
  }
  // 轉圈只說明「在做事」，沒有說明「要多久」。三個角度在手機上有五六秒
  assert.ok(/五到六秒/.test(STRINGS['zh-TW'].findingNote));
  assert.ok(/五到六秒/.test(STRINGS.zh.findingNote));
  assert.ok(/five to six seconds/i.test(STRINGS.en.findingNote));
});

test('worker 只從本站相對路徑載入 pico 與級聯資料', () => {
  const imp = workerCode.match(/importScripts\(([^)]*)\)/);
  assert.ok(imp, 'worker 沒有載入 pico');
  const rels = [...imp[1].matchAll(/(['"])([^'"]+)\1/g)].map((m) => m[2]);
  assert.deepEqual(
    rels,
    ['../utils/vendor/pico/pico.js', 'redact-detect.js'],
    'worker 載入的相對路徑跟預期不一樣'
  );
  assert.ok(
    /const url = new URL\("\.\.\/utils\/vendor\/pico\/facefinder", location\.href\)\.href;/.test(workerCode),
    '級聯檔的網址不是用相對路徑組出來的'
  );
  const calls = [...workerCode.matchAll(/fetch\(([^)]*)\)/g)].map((m) => m[1].trim());
  assert.equal(calls.length, 1, `worker 裡 fetch 出現 ${calls.length} 次，應該只有一次`);
  assert.equal(calls[0], 'url', 'fetch 的參數不是那個組好的 url 變數');
  assert.ok(!/https?:\/\//.test(workerCode), 'worker 原始碼裡出現絕對網址');
});

test('worker 裡沒有任何把資料送出去或留下來的手段', () => {
  // postMessage 是它回覆開啟它的頁面用的，不算送出去。其餘一律不准。
  for (const bad of [
    'XMLHttpRequest', 'sendBeacon', 'WebSocket', 'EventSource',
    'localStorage', 'sessionStorage', 'indexedDB', 'document.cookie', 'importScripts(http',
  ]) {
    assert.ok(!workerCode.includes(bad), `worker 裡出現 ${bad}`);
  }
  const posts = [...workerCode.matchAll(/postMessage\(/g)];
  assert.ok(posts.length >= 1, 'worker 沒有回傳結果');
  assert.ok(
    !/self\.postMessage\([^)]*rgba/.test(workerCode),
    'worker 把像素傳回去了，回去的應該只有座標'
  );
});

test('三語系的離線清單都收了 worker', () => {
  for (const [lang, dir] of [['zh-TW', 'zh-TW'], ['zh-CN', 'zh-CN'], ['en', 'en']]) {
    const md = fs.readFileSync(
      path.join(HERE, '..', 'docs', dir, 'utils', 'redact.md'), 'utf8'
    );
    assert.ok(
      md.includes('- js/redact-worker.js'),
      `${lang} 的 offline_assets 沒有收 worker，存下這一頁的人斷網時偵測會退回慢的那條`
    );
  }
  for (const dir of ['en', 'zh-CN']) {
    const link = path.join(HERE, '..', 'docs', dir, 'js', 'redact-worker.js');
    assert.ok(fs.existsSync(link), `${dir}/js/redact-worker.js 不存在`);
    assert.equal(
      fs.readlinkSync(link), '../../zh-TW/js/redact-worker.js',
      `${dir}/js/redact-worker.js 不是指向 zh-TW 的 symlink`
    );
  }
});


// ---------------------------------------------------------------------------
// 多角度掃描：抓得到頭是歪的臉
// ---------------------------------------------------------------------------

test('角度表的第一個一定是 0，中途回報的那一批才是直立的臉', () => {
  assert.equal(tool.DETECT.angles[0], 0, '第一個角度不是 0，中途回報的就不是直立的臉');
  assert.ok(tool.DETECT.angles.length >= 3, '只掃一兩個角度，傾斜的臉抓不回來');
});

test('角度左右對稱，幅度落在量過的範圍裡', () => {
  const tilts = tool.DETECT.angles.filter((deg) => deg !== 0);
  const mags = [...new Set(tilts.map(Math.abs))];
  assert.equal(mags.length, 1, `左右的幅度不一樣：${JSON.stringify(tilts)}`);
  assert.equal(tilts.reduce((a, b) => a + b, 0), 0, '角度沒有左右對稱，會偏向一邊');
  // 上界：30 度那一組多框從 6 跳到 16，召回只多一張
  // 下界：15 度那一組多框從 6 跳到 14
  assert.ok(mags[0] <= 25, '角度太大，多框會跳上去');
  assert.ok(mags[0] >= 20, '角度太小，多框會跳上去而召回沒有更好');
});

test('轉 0 度原封不動，轉一圈回到原點', () => {
  const w = 9, h = 9;
  const gray = new Uint8Array(w * h);
  for (let i = 0; i < gray.length; i += 1) gray[i] = i * 3;
  assert.equal(core.rotateGray(gray, w, h, 0), gray, '轉 0 度應該直接回傳同一個緩衝區');
  const round = core.rotateGray(gray, w, h, 360);
  // 中間那一塊不受邊界影響，逐點比對
  for (let y = 2; y < h - 2; y += 1) {
    for (let x = 2; x < w - 2; x += 1) {
      const i = y * w + x;
      assert.ok(Math.abs(round[i] - gray[i]) <= 1, `轉一圈之後 (${x},${y}) 差了太多`);
    }
  }
});

test('轉過去再轉回來，位置回得到原處', () => {
  // 亮點放在偏離中心的地方，轉 25 度之後找最亮的那一格，再用 mapBack 推回去
  const w = 61, h = 61, deg = 25;
  const px = 44, py = 18;
  const gray = new Uint8Array(w * h);
  gray[py * w + px] = 255;
  const out = core.rotateGray(gray, w, h, deg);
  let best = -1, bestAt = -1;
  for (let i = 0; i < out.length; i += 1) {
    if (out[i] > best) { best = out[i]; bestAt = i; }
  }
  assert.ok(best > 0, '轉完之後亮點不見了');
  const rx = bestAt % w, ry = (bestAt / w) | 0;
  const backTo = core.mapBack([ry, rx, 10, 5], deg, w, h);
  assert.ok(Math.abs(backTo[1] - px) <= 1.5, `x 推不回去：${backTo[1]} 應該接近 ${px}`);
  assert.ok(Math.abs(backTo[0] - py) <= 1.5, `y 推不回去：${backTo[0]} 應該接近 ${py}`);
  assert.equal(backTo[2], 10, 'size 被動到了，旋轉不該改變尺寸');
  assert.equal(backTo[3], 5, '分數被動到了');
});

test('每個角度各掃一次，最後只分一次群', async () => {
  const seen = [];
  let clustered = 0;
  const fakePico = {
    run_cascade: (image) => {
      seen.push(`${image.ncols}x${image.nrows}`);
      return [[10, 20, 30, 40]];
    },
    cluster_detections: (dets) => { clustered += 1; return dets; },
  };
  const params = { angles: [0, -25, 25], iou: 0.2, minQuality: 1, shiftFactor: 0.1, minSize: 32, scaleFactor: 1.1 };
  const gray = new Uint8Array(40 * 30);
  const out = await core.scanAngles(fakePico, {}, gray, 40, 30, params, {});
  assert.equal(seen.length, 3, `掃了 ${seen.length} 次，應該是三個角度各一次`);
  assert.equal(out.length, 3, '三個角度的偵測沒有全部收進來');
  // 中途回報那一次也會分群，所以是 2 而不是 4。重點是不會每個角度各分一次
  assert.ok(clustered <= 2, `分群跑了 ${clustered} 次，應該只在最後（加上中途回報那一次）`);
});

test('第一個角度掃完回報一次，而且只有一次', async () => {
  const fakePico = {
    run_cascade: () => [[10, 20, 30, 40]],
    cluster_detections: (dets) => dets,
  };
  const params = { angles: [0, -25, 25], iou: 0.2, minQuality: 1, shiftFactor: 0.1, minSize: 32, scaleFactor: 1.1 };
  const gray = new Uint8Array(40 * 30);
  const partials = [];
  await core.scanAngles(fakePico, {}, gray, 40, 30, params, {
    onPartial: (dets) => partials.push(dets.length),
  });
  assert.equal(partials.length, 1, `中途回報了 ${partials.length} 次，應該只有一次`);
  assert.equal(partials[0], 1, '中途回報的不是第一個角度的結果');

  // 只有一個角度的時候不該回報，那一批就是最終結果
  const once = [];
  await core.scanAngles(fakePico, {}, gray, 40, 30, { ...params, angles: [0] }, {
    onPartial: () => once.push(1),
  });
  assert.equal(once.length, 0, '只掃一個角度也回報中途結果，畫面會閃一下');
});

test('角度之間讓出一次，退回頁面裡做的時候畫面才有機會更新', async () => {
  const fakePico = { run_cascade: () => [], cluster_detections: (d) => d };
  const params = { angles: [0, -25, 25], iou: 0.2, minQuality: 1, shiftFactor: 0.1, minSize: 32, scaleFactor: 1.1 };
  let paused = 0;
  await core.scanAngles(fakePico, {}, new Uint8Array(16), 4, 4, params, {
    pause: async () => { paused += 1; },
  });
  assert.equal(paused, 2, `讓出了 ${paused} 次，三個角度之間應該是兩次`);
});

test('有了中途結果就不再顯示時間預期，兩段說明不疊在一起', () => {
  assert.ok(
    /if \(detecting && !detectNote\) \{/.test(code),
    '偵測中的時間預期沒有在拿到中途結果之後收掉'
  );
});

test('中途回報只換框，不解開動作按鈕', () => {
  const fn = src.slice(src.indexOf('async function findFaces'), src.indexOf('async function exportImage'));
  const partial = fn.slice(fn.indexOf('const showPartial'), fn.indexOf('let dets = null'));
  assert.ok(partial.includes('marks = toBoxes(dets)'), '中途回報沒有把框畫出來');
  assert.ok(
    !/detecting = false/.test(partial),
    '中途回報就把 detecting 關掉了，按了全部遮起來之後還會冒出新框'
  );
  assert.ok(partial.includes('t.foundPartial'), '中途回報沒有講出還在掃');
});

test('三個地方共用同一份掃描核心，沒有第二份實作', () => {
  // worker、退路、量測工具都指向 redact-detect.js。少掃一個角度的那一邊會讓讀者
  // 拿到一張少遮幾張臉的圖而完全不知情，所以不能有兩份實作
  assert.ok(coreCode.includes('function rotateGray'), '核心裡沒有 rotateGray');
  assert.ok(coreCode.includes('function scanAngles'), '核心裡沒有 scanAngles');
  for (const [label, text] of [['redact.js', code], ['redact-worker.js', workerCode]]) {
    assert.ok(
      !/function rotateGray|function mapBack/.test(text),
      `${label} 裡自己又寫了一份旋轉，應該共用 redact-detect.js`
    );
  }
  assert.ok(code.includes('core.scanAngles'), '退路沒有用共用的核心');
  assert.ok(workerCode.includes('self.redactDetect.scanAngles'), 'worker 沒有用共用的核心');
  const harness = fs.readFileSync(path.join(HERE, 'check_redact_detect.mjs'), 'utf8');
  assert.ok(
    harness.includes("'/redact-detect.js'") && harness.includes('self.redactDetect.scanAngles'),
    '量測工具沒有用共用的核心，量出來的就不是讀者拿到的結果'
  );
});

test('共用核心也收進三語系的離線清單，symlink 也在', () => {
  for (const dir of ['zh-TW', 'zh-CN', 'en']) {
    const md = fs.readFileSync(path.join(HERE, '..', 'docs', dir, 'utils', 'redact.md'), 'utf8');
    assert.ok(md.includes('- js/redact-detect.js'), `${dir} 的 offline_assets 沒有收掃描核心`);
  }
  for (const dir of ['en', 'zh-CN']) {
    const link = path.join(HERE, '..', 'docs', dir, 'js', 'redact-detect.js');
    assert.ok(fs.existsSync(link), `${dir}/js/redact-detect.js 不存在`);
    assert.equal(fs.readlinkSync(link), '../../zh-TW/js/redact-detect.js');
  }
});

test('共用核心裡沒有任何把資料送出去或留下來的手段', () => {
  for (const bad of [
    'fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket', 'EventSource',
    'localStorage', 'sessionStorage', 'indexedDB', 'document.cookie', 'postMessage',
  ]) {
    assert.ok(!coreCode.includes(bad), `掃描核心裡出現 ${bad}`);
  }
  assert.ok(!/https?:\/\//.test(coreCode), '掃描核心裡出現絕對網址');
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
