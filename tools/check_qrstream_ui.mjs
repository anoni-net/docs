#!/usr/bin/env node
/**
 * QR code 影格串流（docs/zh-TW/js/qrstream.js）的介面煙霧測試。
 *
 * === 為什麼需要這支 ===
 *
 * tools/test_qrstream.mjs 驗的是格式與拼接，那一段是純邏輯，抽出來就能測。介面
 * 那七百多行沒有任何東西碰得到：按鈕接錯事件、`dom` 少一個欄位、render 在某個
 * 狀態下丟例外，這些都會讓整頁在讀者面前完全不動，而所有單元測試照樣全綠。
 *
 * 這一區的其他工具靠人開瀏覽器看一眼補上這段。這一頁補不了，因為它要兩台裝置
 * 加一個鏡頭，本機沒辦法一個人試完一輪。
 *
 * === 怎麼驗 ===
 *
 * 用一份夠小的 DOM 替身把整支載進來跑，然後真的走一遍：丟檔案進傳送端、讓它把
 * 每一格畫到畫布上、把畫出來的像素當成拍到的照片餵回接收端、看它拼不拼得回來。
 *
 * 畫布是替身，但畫進去的像素是 drawMatrix 真的畫的，解碼是 vendor 的 jsQR 真的
 * 解的。中間沒有任何一步是模擬的，只有「畫布」與「相機」這兩個殼是假的。
 *
 * 替身刻意做得薄。目標是抓「載進來就爆」與「接線接錯」，不是重寫一個瀏覽器。
 *
 * 用法：
 *   node tools/check_qrstream_ui.mjs
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
const require_ = createRequire(import.meta.url);
const qrcode = require_(path.join(VENDOR, 'qrcode-generator.js'));
const jsQR = require_(path.join(VENDOR, 'jsQR.js'));

// ---------------------------------------------------------------------------
// DOM 替身
// ---------------------------------------------------------------------------

// 畫布只支援這一支真的會用到的四個操作：填色、填矩形、貼上另一張圖、讀回像素。
// 貼上的來源與目標同樣大小，所以不做縮放，那條路徑由 scaledSize 保證。
function makeContext(canvas) {
  return {
    fillStyle: '#000000',
    fillRect(x, y, w, h) {
      const [r, g, b] = this.fillStyle === '#ffffff' ? [255, 255, 255] : [0, 0, 0];
      for (let row = y; row < y + h; row += 1) {
        for (let col = x; col < x + w; col += 1) {
          const at = (row * canvas.width + col) * 4;
          canvas.pixels[at] = r;
          canvas.pixels[at + 1] = g;
          canvas.pixels[at + 2] = b;
          canvas.pixels[at + 3] = 255;
        }
      }
    },
    drawImage(source, x, y, w, h) {
      assert.equal(source.width, w, 'drawImage 被要求縮放，替身沒有實作那條路');
      assert.equal(source.height, h, 'drawImage 被要求縮放，替身沒有實作那條路');
      canvas.pixels.set(source.data);
    },
    getImageData(x, y, w, h) {
      return { data: canvas.pixels, width: w, height: h };
    },
  };
}

class Node {
  constructor(tag) {
    this.tagName = String(tag).toUpperCase();
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.className = '';
    this.hidden = false;
    this.disabled = false;
    this._text = '';
    // 步驟用 dataset.state 表示還沒輪到、現在要動、做完了
    this.dataset = {};
    this.classList = {
      add: (name) => this._classes().add(name) && this._writeClasses(),
      remove: (name) => this._classes().delete(name) && this._writeClasses(),
      contains: (name) => this._classes().has(name),
      toggle: (name, on) => {
        const set = this._classes();
        if (on === undefined ? set.has(name) : !on) set.delete(name);
        else set.add(name);
        this._writeClasses(set);
      },
    };
    if (this.tagName === 'CANVAS') {
      this.width = 0;
      this.height = 0;
      this.clientWidth = 400;
      Object.defineProperty(this, 'pixels', { writable: true, value: new Uint8ClampedArray(0) });
      this._ctx = makeContext(this);
      this.getContext = () => {
        // width 被指派過就重配一次緩衝區，跟真的畫布一樣，改尺寸等於清空
        if (this.pixels.length !== this.width * this.height * 4) {
          this.pixels = new Uint8ClampedArray(this.width * this.height * 4).fill(255);
        }
        return this._ctx;
      };
    }
  }
  _classes() {
    return new Set(String(this.className).split(/\s+/).filter(Boolean));
  }
  _writeClasses(set) {
    this.className = [...(set || this._classes())].join(' ');
    return true;
  }
  get textContent() {
    return this.children.length ? this.children.map((c) => c.textContent).join('') : this._text;
  }
  set textContent(value) {
    this.children = [];
    this._text = String(value);
  }
  appendChild(node) {
    this.children.push(node);
    return node;
  }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }
  removeAttribute(name) {
    delete this.attributes[name];
  }
  getAttribute(name) {
    return Object.prototype.hasOwnProperty.call(this.attributes, name) ? this.attributes[name] : null;
  }
  addEventListener(type, fn) {
    (this.listeners[type] = this.listeners[type] || []).push(fn);
  }
  dispatch(type, event) {
    for (const fn of this.listeners[type] || []) fn(event || { preventDefault() {} });
  }
  click() {
    this.dispatch('click');
  }
  *walk() {
    yield this;
    for (const child of this.children) yield* child.walk();
  }
  find(predicate) {
    for (const node of this.walk()) if (predicate(node)) return node;
    return null;
  }
  findAll(predicate) {
    return [...this.walk()].filter(predicate);
  }
}

class TextNode {
  constructor(text) {
    this._text = String(text);
  }
  get textContent() {
    return this._text;
  }
  *walk() {}
}

const root = new Node('div');
root.id = 'qr-stream-tool';

const blobs = [];
const document_ = {
  documentElement: { lang: 'zh-TW' },
  getElementById: (id) => (id === 'qr-stream-tool' ? root : null),
  createElement: (tag) => new Node(tag),
  createTextNode: (text) => new TextNode(text),
};

const timers = new Map();
let timerSeq = 0;
const pending = [];
const window_ = {
  qrcode,
  jsQR: (data, width, height, options) => jsQR(data, width, height, options),
  crypto: globalThis.crypto,
  devicePixelRatio: 1,
  CompressionStream: globalThis.CompressionStream,
  DecompressionStream: globalThis.DecompressionStream,
  addEventListener() {},
  // 播放迴圈與掃描迴圈都靠 setTimeout 自己接下一輪。真的排下去會讓這支永遠不結束，
  // 所以只記下來，測試自己決定要不要跑。
  setTimeout(fn, delay) {
    const id = (timerSeq += 1);
    timers.set(id, fn);
    pending.push(id);
    return id;
  },
  clearTimeout(id) {
    timers.delete(id);
  },
};

function runNextTimer() {
  while (pending.length) {
    const id = pending.shift();
    const fn = timers.get(id);
    if (fn) {
      timers.delete(id);
      fn();
      return true;
    }
  }
  return false;
}

const URL_ = {
  createObjectURL: (blob) => {
    blobs.push(blob);
    return 'blob:fake/' + blobs.length;
  },
  revokeObjectURL() {},
};

// createImageBitmap 拿到的是我們自己造的假檔案，位圖直接掛在上面。實際的解碼路徑
// （scaledSize、drawImage、getImageData、jsQR）一步都沒有跳過。
const createImageBitmap_ = async (file) => {
  if (!file.bitmap) throw new Error('不是圖片');
  return { ...file.bitmap, close() {} };
};

const load = (navigator_) =>
  new Function(
    'window',
    'document',
    'navigator',
    'URL',
    'Blob',
    'Response',
    'createImageBitmap',
    'TextEncoder',
    'TextDecoder',
    src
  )(
    window_,
    document_,
    navigator_,
    URL_,
    globalThis.Blob,
    globalThis.Response,
    createImageBitmap_,
    globalThis.TextEncoder,
    globalThis.TextDecoder
  );

// ---------------------------------------------------------------------------

const buttonSaying = (text) => root.find((n) => n.tagName === 'BUTTON' && n.textContent === text);
const settle = () => new Promise((resolve) => setImmediate(resolve));

// 壓縮與雜湊都走串流與 WebCrypto，中間要好幾輪事件迴圈才落地。等到條件成立為止，
// 而不是猜一個固定的輪數。
async function waitFor(predicate, what, tries = 400) {
  for (let i = 0; i < tries; i += 1) {
    const got = predicate();
    if (got) return got;
    await settle();
  }
  throw new Error(`等不到：${what}`);
}

// 訊息列有兩個，傳送端一個接收端一個。找的時候要指定是哪一邊，不然會撈到上一個
// 測試留在另一邊的字。
const messageIn = (panel) =>
  panel.findAll((n) => String(n.className).startsWith('qs-msg')).map((n) => n.textContent).join('');
const panels = () => root.findAll((n) => n.className === 'qs-panel');

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('載進來就把介面畫出來，兩個分頁都在', () => {
  load({});
  assert.ok(root.children.length, '什麼都沒畫出來');
  assert.ok(buttonSaying('傳送'), '找不到傳送分頁');
  assert.ok(buttonSaying('接收'), '找不到接收分頁');
  assert.equal(buttonSaying('傳送').getAttribute('aria-selected'), 'true', '預設應該停在傳送');
  assert.ok(buttonSaying('開始播放').disabled, '還沒選檔案就可以按開始播放');
  assert.ok(root.find((n) => n.tagName === 'CANVAS'), '找不到畫布');
});

test('步驟是照順序放行的，沒選檔案之前後兩步是關的', () => {
  // 使用者的回報是「就一堆按鈕，有些看起來是單選不能多選，介面混亂」。
  // 編號步驟加上「還沒輪到就淡出並擋掉點擊」是這件事的解法，而那個狀態機一旦
  // 接錯，畫面看起來照樣正常，只是所有東西又同時可以按。
  // 兩個面板各有三步，這裡只看傳送那一邊
  const steps = panels()[0].findAll((n) => n.className === 'qs-step');
  assert.equal(steps.length, 3, `傳送面板應該有三個步驟，找到 ${steps.length} 個`);
  assert.deepEqual(
    steps.map((x) => x.dataset.state),
    ['now', 'off', 'off'],
    '還沒選檔案，第二三步就已經可以動了'
  );
  const heads = steps.map((x) => x.find((n) => n.className === 'qs-step-no').textContent);
  assert.deepEqual(heads, ['1', '2', '3'], '步驟編號不對');
});

test('加密提醒長在第一步裡，不是只寫在文章', () => {
  // 工具的 div 在頁面最上面，在所有文字之前。只把警告寫進文章，等於只保護了
  // 會從頭讀到尾的人，而急著在現場操作、直接點「傳送」的人永遠看不到。
  // 讀者實測回報就是這一條：「工具永遠在最上面、永遠先被看到」。
  const first = panels()[0].findAll((n) => n.className === 'qs-step')[0];
  const note = first.find((n) => n.className === 'qs-note-warn');
  assert.ok(note, '第一步裡沒有加密提醒');
  assert.ok(note.textContent.includes('沒有加密'), `提醒內容不對：${note.textContent}`);
  const link = note.find((n) => n.tagName === 'A');
  assert.ok(link && link.href.startsWith('#'), '提醒沒有連到文章裡的說明');
});

test('四選一畫成一組 radiogroup，不是四顆獨立按鈕', () => {
  const groups = panels()[0].findAll((n) => n.getAttribute && n.getAttribute('role') === 'radiogroup');
  assert.equal(groups.length, 2, '每張資料量與播放速度各要一組');
  for (const g of groups) {
    const radios = g.children.filter((c) => c.getAttribute('role') === 'radio');
    assert.ok(radios.length >= 3, '選項太少');
    const checked = radios.filter((r) => r.getAttribute('aria-checked') === 'true');
    assert.equal(checked.length, 1, `一組裡應該剛好一個被選中，實際上有 ${checked.length} 個`);
    for (const r of radios) {
      assert.equal(r.getAttribute('aria-pressed'), null,
        'aria-pressed 是切換按鈕的語意，會讓人以為可以各按各的');
    }
  }
});

test('切到接收再切回來，兩邊都不會爆', () => {
  buttonSaying('接收').click();
  assert.equal(buttonSaying('接收').getAttribute('aria-selected'), 'true');
  const steps = panels()[1].findAll((n) => n.className === 'qs-step');
  assert.equal(steps.length, 3, '接收面板也要有三個步驟');
  assert.deepEqual(
    steps.map((x) => x.dataset.state),
    ['now', 'off', 'off'],
    '還沒開相機，後兩步就已經可以動了'
  );
  buttonSaying('傳送').click();
  assert.equal(buttonSaying('傳送').getAttribute('aria-selected'), 'true');
});

test('沒有相機的時候說得出來，不是整頁不動', async () => {
  buttonSaying('接收').click();
  buttonSaying('開相機').click();
  await waitFor(() => messageIn(panels()[1]).includes('沒有提供相機'), '沒有相機的說明');
  buttonSaying('傳送').click();
});

test('選了檔案就算得出張數與一輪要多久', async () => {
  const payload = new TextEncoder().encode('anoni.net 影格串流測試 '.repeat(120));
  const file = {
    name: 'stream-test.txt',
    size: payload.length,
    type: 'text/plain',
    arrayBuffer: async () => payload.buffer.slice(0, payload.length),
  };
  const drop = root.find((n) => n.id === 'qs-drop');
  drop.dispatch('drop', { preventDefault() {}, dataTransfer: { files: [file] } });
  const plan = await waitFor(
    () => root.find((n) => n.className === 'qs-hint' && n.textContent.includes('切成')),
    `切張的結果（傳送端訊息：${messageIn(panels()[0])}）`
  );
  assert.match(plan.textContent, /stream-test\.txt/);
  assert.match(plan.textContent, /切成 \d+ 張/);
  assert.match(plan.textContent, /一輪 \d+/);
  assert.ok(!buttonSaying('開始播放').disabled, '算完了卻還不能播');
});

test('播出來的每一張都讀得回來，拼回原檔一個位元組不差', async () => {
  // 這一條是整支的重點。傳送端真的把每一格畫到畫布上，畫出來的像素當成拍到的
  // 照片餵回接收端，走完 createImageBitmap、drawImage、jsQR、拼接與 SHA-256 比對。
  const canvas = root.find((n) => n.tagName === 'CANVAS');
  const plan = root.find((n) => n.className === 'qs-hint' && n.textContent.includes('切成'));
  const total = Number(plan.textContent.match(/切成 (\d+) 張/)[1]);

  buttonSaying('開始播放').click();
  const shots = [];
  for (let i = 0; i < total; i += 1) {
    // 每一格畫完就把畫布整個抄一份下來，然後讓播放迴圈往下一格走
    shots.push({
      width: canvas.width,
      height: canvas.height,
      data: Uint8ClampedArray.from(canvas.pixels),
    });
    assert.ok(canvas.width > 0, `第 ${i} 張沒有畫出東西`);
    assert.ok(runNextTimer(), `第 ${i} 張之後沒有排下一張`);
  }
  buttonSaying('暫停').click();
  const sizes = new Set(shots.map((s) => s.width));
  assert.equal(sizes.size, 1, '每一張畫出來的大小不一樣，相機會一直重新對焦');

  buttonSaying('接收').click();
  const input = root.find((n) => n.tagName === 'INPUT' && n.accept === 'video/*,image/*');
  input.files = shots.map((bitmap, i) => ({
    name: `shot-${i}.png`,
    type: 'image/png',
    bitmap,
  }));
  input.dispatch('change');
  // 收滿那一刻結果還沒出來，finish() 還要解壓再算一次 SHA-256，所以等的是結果本身
  const result = await waitFor(
    () => {
      const node = root.find((n) => String(n.className).startsWith('qs-result'));
      return node && !node.hidden ? node : null;
    },
    `拼完的結果（接收端訊息：${messageIn(panels()[1])}）`,
    total * 20 + 800
  );
  const progress = root.find((n) => n.textContent.startsWith('收到 '));
  assert.ok(progress, '沒有顯示進度');
  assert.match(progress.textContent, new RegExp(`收到 ${total} 張`), `進度停在 ${progress.textContent}`);
  assert.ok(result.className.includes('qs-ok'), `校驗結果是 ${result.className}`);
  assert.ok(result.textContent.includes('stream-test.txt'), '結果沒有帶檔名');
  assert.ok(result.textContent.includes('校驗碼相符'), '沒有說校驗碼相符');

  const link = result.find((n) => n.tagName === 'A');
  assert.ok(link, '沒有儲存按鈕');
  assert.equal(link.download, 'stream-test.txt');

  const saved = new Uint8Array(await blobs[blobs.length - 1].arrayBuffer());
  const original = new TextEncoder().encode('anoni.net 影格串流測試 '.repeat(120));
  assert.equal(saved.length, original.length, '拼回來的長度不對');
  assert.ok(saved.every((b, at) => b === original[at]), '拼回來的內容跟送出去的不一樣');
});

test('拍到雜訊不會被當成一張收下', async () => {
  buttonSaying('清掉重收').click();
  const input = root.find((n) => n.tagName === 'INPUT' && n.accept === 'video/*,image/*');
  input.files = [
    {
      name: 'noise.png',
      type: 'image/png',
      bitmap: { width: 60, height: 60, data: new Uint8ClampedArray(60 * 60 * 4).fill(255) },
    },
  ];
  input.dispatch('change');
  await waitFor(() => messageIn(panels()[1]).includes('沒有找到'), '找不到影格的說明');
});

for (const [name, fn] of tests) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed += 1;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${String(err && err.stack ? err.stack : err).split('\n').slice(0, 6).join('\n    ')}`);
    failed += 1;
  }
}
console.log(`\n${passed} 通過，${failed} 失敗`);
process.exit(failed ? 1 : 0);
