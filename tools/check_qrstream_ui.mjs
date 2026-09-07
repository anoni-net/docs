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
      // _classes() 每次回傳一份新的 Set，改完要把它交回去寫。原本寫的是
      // this._classes().add(name) && this._writeClasses()，後半段沒收到那份 Set，
      // 於是又從 className 重讀一次，加進去的名字就丟了。toggle 一直是對的，
      // 因為它有把 set 傳下去，所以這個洞在有人用 add 之前都不會被發現
      add: (name) => {
        const set = this._classes();
        set.add(name);
        this._writeClasses(set);
      },
      remove: (name) => {
        const set = this._classes();
        set.delete(name);
        this._writeClasses(set);
      },
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
  // parentNode 與 removeChild 是紙本那條路要用的：列印收工時把容器從 body 上拿掉，
  // 靠的是 printRoot.parentNode.removeChild(printRoot)。少了這兩個，clearPrint 的
  // 第一個判斷就是 false，容器會一直留著而測試看不出差別
  appendChild(node) {
    node.parentNode = this;
    this.children.push(node);
    return node;
  }
  removeChild(node) {
    const at = this.children.indexOf(node);
    if (at >= 0) this.children.splice(at, 1);
    node.parentNode = null;
    return node;
  }
  // 紙本輸出用 innerHTML 塞 SVG（來源是自己組的字串）。替身存起來，測試才驗得到
  // 印出去的是什麼
  set innerHTML(value) {
    this._html = String(value);
    this.children = [];
  }
  get innerHTML() {
    return this._html || '';
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
const body = new Node('body');
const document_ = {
  documentElement: { lang: 'zh-TW' },
  body,
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
  // 紙本那條路要 afterprint 才會把列印容器清掉，空實作的話測不到清乾淨沒有
  listeners: {},
  addEventListener(type, fn) {
    (this.listeners[type] = this.listeners[type] || []).push(fn);
  },
  printed: 0,
  print() {
    this.printed += 1;
  },
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

// ---------------------------------------------------------------------------
// 紙本輸出
//
// 排版錯了不會有任何錯誤訊息，只會印出一疊少了幾張的紙，而發現的時候人已經在
// 沒有網路的地方，手上只有那疊紙。所以這裡驗的是張數有沒有全部上紙、頁數對不對、
// 以及列印容器有沒有在收工之後清掉（留著的話下一次列印別的頁面會變成空白）。
// ---------------------------------------------------------------------------

/** 把一個檔案送進傳送端，回傳它切成幾張 */
async function loadForPrint(name, bytes, tries = 400) {
  // 前面的測試把分頁留在接收端，而 renderSend 在那個狀態下直接 return，畫面上的
  // 切張結果永遠不會更新
  buttonSaying('傳送').click();
  const file = {
    name,
    size: bytes.length,
    type: 'application/octet-stream',
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length),
  };
  root.find((n) => n.id === 'qs-drop').dispatch('drop', {
    preventDefault() {},
    dataTransfer: { files: [file] },
  });
  // 這一支的測試共用同一個 root，前一個測試留下的切張結果還掛在畫面上。只等
  // 「切成」兩個字的話會立刻拿到舊的那一行，而新檔案其實還在處理，接下來按的
  // 每一個按鈕都是對著舊狀態按的。等到檔名也換過去才算數
  const plan = await waitFor(
    () => {
      const node = root.find((n) => n.className === 'qs-hint' && n.textContent.includes('切成'));
      return node && node.textContent.includes(name) ? node : null;
    },
    `${name} 的切張結果（傳送端訊息：${messageIn(panels()[0])}）`,
    tries
  );
  return Number(plan.textContent.match(/切成 (\d+) 張/)[1]);
}

const printRootIn = () => body.children.find((n) => n.className === 'qs-print');
const fireAfterPrint = () => {
  for (const fn of window_.listeners.afterprint || []) fn();
  window_.listeners.afterprint = [];
};

test('沒選檔案之前印不了', () => {
  assert.ok(buttonSaying('印成紙本'), '找不到印成紙本的按鈕');
});

test('印成紙本把每一張都排上頁，頁數與張數都對得起來', async () => {
  const total = await loadForPrint('paper.txt', new TextEncoder().encode('paper mode '.repeat(60)));
  const printedBefore = window_.printed;
  buttonSaying('印成紙本').dispatch('click');

  const sheet = printRootIn();
  assert.ok(sheet, '按了沒有產生列印版面');
  const cells = sheet.findAll((n) => n.className === 'qs-cell');
  assert.equal(cells.length, total, `紙上有 ${cells.length} 張，實際切成 ${total} 張`);
  const sheets = sheet.findAll((n) => n.className === 'qs-sheet');
  assert.equal(sheets.length, Math.ceil(total / 4), '頁數不對');
  assert.equal(window_.printed, printedBefore + 1, '沒有叫出列印對話框');
});

test('每一格裡是 SVG，不是把畫布放大的點陣圖', () => {
  const cells = printRootIn().findAll((n) => n.className === 'qs-cell');
  for (const cell of cells) {
    const holder = cell.children.find((n) => n.className === 'qs-svg');
    assert.ok(holder, '格子裡沒有圖');
    assert.ok(holder.innerHTML.startsWith('<svg'), '圖不是 SVG');
    assert.ok(holder.innerHTML.includes('shape-rendering="crispEdges"'), '沒有關掉平滑，印出來會糊');
  }
});

test('編號印在每一張下面，收的人才知道漏了哪一張', () => {
  const nums = printRootIn().findAll((n) => n.className === 'qs-num').map((n) => n.textContent);
  assert.ok(nums.length > 0, '沒有編號');
  assert.ok(nums.every((text) => /編號 \d+/.test(text)), `編號的格式不對：${nums[0]}`);
  // 標的要是內部編號（0 起算），接收端說「還缺 3」的時候才找得到那一張
  assert.ok(nums.some((text) => text.includes('編號 0')), '沒有從 0 起算');
});

test('讀回的說明只印在第一頁', () => {
  const sheets = printRootIn().findAll((n) => n.className === 'qs-sheet');
  const howto = sheets.map((s) => s.findAll((n) => n.className === 'qs-sheet-howto').length);
  assert.equal(howto[0], 1, '第一頁沒有讀回的說明');
  for (let i = 1; i < howto.length; i += 1) {
    assert.equal(howto[i], 0, `第 ${i + 1} 頁也印了說明，那會吃掉版面`);
  }
});

test('列印期間站台其他部分靠 body 的 class 藏起來', () => {
  assert.ok(
    String(body.className).split(/\s+/).includes('qs-printing'),
    'body 上沒有掛列印用的 class，站台的導覽與頁尾會跟著印'
  );
});

test('收工之後把列印容器清掉，下一次列印別的頁面才不會變空白', () => {
  fireAfterPrint();
  assert.equal(printRootIn(), undefined, '列印容器還留在 body 上');
  assert.ok(!String(body.className).split(/\s+/).includes('qs-printing'), 'class 沒有清掉');
});

test('張數超過上限就不印，並且說得出為什麼', async () => {
  // 資料要壓不動，張數才是實打實的。(i * 31 + 7) & 0xff 那種週期 256 的序列會被
  // 壓成幾百個位元組，切出來只有三張；換成固定種子的 LCG 還是被壓到剩四十幾張。
  // 所以用真的亂數。
  //
  // 張數靠調小「每張資料量」湊，不靠丟一個大檔案。原本丟 200 KB 進來，壓縮與
  // SHA-256 要跑好幾百輪事件迴圈才落地，waitFor 那 400 次有時候等不到，這一條就
  // 隨機紅一次。60 KB 在最小的那一檔會切出三百多張，一樣超過上限，處理快得多。
  buttonSaying('傳送').click();
  buttonSaying('小').click();
  const big = new Uint8Array(60 * 1024);
  for (let i = 0; i < big.length; i += 1) big[i] = (Math.random() * 256) | 0;
  const total = await loadForPrint('too-many.bin', big, 3000);
  assert.ok(total > 120, `這個檔案只切成 ${total} 張，測不到上限`);
  const printedBefore = window_.printed;
  buttonSaying('印成紙本').dispatch('click');
  assert.equal(printRootIn(), undefined, '超過上限還是印了');
  assert.equal(window_.printed, printedBefore, '超過上限還是叫了列印對話框');
  const message = messageIn(panels()[0]);
  assert.ok(message.includes(String(total)), `訊息裡沒有說幾張：${message}`);
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
