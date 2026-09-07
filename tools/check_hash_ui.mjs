#!/usr/bin/env node
/**
 * 檔案雜湊比對（docs/zh-TW/js/hash.js）的介面煙霧測試。
 *
 * === 為什麼需要這支 ===
 *
 * tools/test_hash.mjs 驗的是 SHA-256 算得對不對、貼進來的東西抽不抽得出雜湊，那些
 * 是純邏輯。介面那一段沒有任何東西碰得到：按鈕接錯事件、render 在某個狀態下丟例外、
 * 讀檔案的迴圈少接一塊，這些都會讓整頁在讀者面前不動或給出錯的結論，而單元測試
 * 照樣全綠。
 *
 * 最傷的一種是「還沒貼東西」被畫成「不相符」。讀者會以為檔案在路上壞掉了，然後
 * 重新跑一趟實體遞送。純邏輯測 compareState 回傳 pending，但畫面有沒有照那個值
 * 畫出對應的文案，是另一回事。
 *
 * === 怎麼驗 ===
 *
 * 用一份薄的 DOM 替身把整支載進來跑，然後真的走一遍：丟一個內容已知的檔案替身
 * 進去、等它讀完、看畫面上那串雜湊對不對、再把不同格式的東西貼進比對框，看狀態
 * 文案跟著換。
 *
 * 檔案替身刻意一次只吐 7 個位元組，逼它走完跨塊邊界的路徑，那是瀏覽器讀大檔案的
 * 實際形狀。
 *
 * 用法：
 *   node tools/check_hash_ui.mjs
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

// --- DOM 替身。目標是抓「載進來就爆」與「接線接錯」，不是重寫一個瀏覽器 ---

class Node {
  constructor(tag) {
    this.tag = tag;
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.className = '';
    this.disabled = false;
    this.value = '';
    this.style = {};
    this.classList = {
      add: (name) => {
        const set = new Set(String(this.className).split(/\s+/).filter(Boolean));
        set.add(name);
        this.className = [...set].join(' ');
      },
      remove: (name) => {
        const set = new Set(String(this.className).split(/\s+/).filter(Boolean));
        set.delete(name);
        this.className = [...set].join(' ');
      },
    };
  }
  // 真實 DOM 裡指派 textContent 會變成一個文字子節點，之後 append 的東西接在它後面。
  // 替身如果把文字另外存一格，`el(tag, cls, text)` 之後再 append 就會讀不到前半段，
  // 而那正是這一頁顯示「檔名 大小」的寫法。
  get textContent() {
    return this.children.map((c) => c.textContent).join('');
  }
  set textContent(value) {
    const text = String(value);
    this.children = text === '' ? [] : [new TextNode(text)];
  }
  append(...nodes) {
    for (const node of nodes) {
      this.children.push(typeof node === 'string' ? new TextNode(node) : node);
    }
  }
  appendChild(node) {
    this.children.push(node);
    return node;
  }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
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

const hasClass = (node, name) =>
  String(node.className).split(/\s+/).filter(Boolean).includes(name);

/** 一次只吐幾個位元組的檔案替身，逼實作走完跨塊邊界的路徑 */
function fakeFile(name, bytes, chunk = 7) {
  return {
    name,
    size: bytes.length,
    stream() {
      let at = 0;
      return {
        getReader: () => ({
          async read() {
            if (at >= bytes.length) return { done: true, value: undefined };
            const end = Math.min(at + chunk, bytes.length);
            const value = new Uint8Array(bytes.subarray(at, end));
            at = end;
            return { done: false, value };
          },
        }),
      };
    },
  };
}

/** 讀不到的檔案，實體遞送常見的失敗方式 */
function brokenFile(name, size) {
  return {
    name,
    size,
    stream() {
      return {
        getReader: () => ({
          async read() {
            throw new Error('device I/O error');
          },
        }),
      };
    },
  };
}

function load(lang) {
  const root = new Node('div');
  root.id = 'hash-tool';
  const head = new Node('head');
  const document_ = {
    documentElement: { lang },
    head,
    getElementById: (id) => (id === 'hash-tool' ? root : null),
    createElement: (tag) => new Node(tag),
  };
  const clipboard = { written: [] };
  const navigator_ = {
    clipboard: {
      writeText: (text) => {
        clipboard.written.push(text);
        return Promise.resolve();
      },
    },
  };
  new Function('document', 'navigator', 'setTimeout', src)(
    document_,
    navigator_,
    (fn) => fn
  );
  return { root, head, clipboard };
}

/** 讓讀檔案那條 async 路徑跑完 */
async function settle(times = 200) {
  for (let i = 0; i < times; i++) await Promise.resolve();
  await new Promise((resolve) => setImmediate(resolve));
}

const textOf = (root, className) => {
  const node = root.find((n) => hasClass(n, className));
  return node ? node.textContent : null;
};

let pass = 0;
let fail = 0;
const test = async (name, fn) => {
  try {
    await fn();
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

console.log('載入與畫面');

await test('掛載之後拖放區、比對框與清空按鈕都在', async () => {
  const { root } = load('zh-TW');
  assert.ok(root.find((n) => hasClass(n, 'hs-drop')), '少了拖放區');
  assert.ok(root.find((n) => n.tag === 'textarea'), '少了比對框');
  assert.ok(root.find((n) => hasClass(n, 'hs-clear')), '少了清空按鈕');
  assert.ok(root.find((n) => hasClass(n, 'hs-note')), '少了不落地的說明');
});

await test('樣式掛上去，沒有靠外部 CSS', async () => {
  const { head } = load('zh-TW');
  const style = head.children.find((n) => n.tag === 'style');
  assert.ok(style, '沒有插入 style');
  assert.ok(style.textContent.includes('#hash-tool'), '樣式沒有限定在自己的容器裡');
});

await test('三個語系都載得起來，文案跟著換', async () => {
  const seen = new Set();
  for (const lang of ['zh-TW', 'zh-CN', 'en']) {
    const { root } = load(lang);
    const drop = textOf(root, 'hs-drop');
    assert.ok(drop && drop.length > 0, `${lang} 的拖放區沒有文字`);
    seen.add(drop);
  }
  assert.equal(seen.size, 3, '三個語系的文案有重複，代表某一個沒有翻到');
});

console.log('\n算一個檔案');

await test('雜湊算完之後顯示在畫面上，值跟 Node 的 crypto 一樣', async () => {
  const { root } = load('zh-TW');
  const data = bytes('隨身碟裡的那一份');
  root.find((n) => n.tag === 'input').files = [fakeFile('note.txt', data)];
  root.find((n) => n.tag === 'input').dispatch('change');
  await settle();
  assert.equal(textOf(root, 'hs-hash'), nodeHash(data));
});

await test('檔名與大小都顯示出來', async () => {
  const { root } = load('zh-TW');
  const data = new Uint8Array(2048).fill(9);
  root.find((n) => n.tag === 'input').files = [fakeFile('video.mp4', data)];
  root.find((n) => n.tag === 'input').dispatch('change');
  await settle();
  const name = textOf(root, 'hs-name');
  assert.ok(name.includes('video.mp4'), '沒有顯示檔名');
  assert.ok(name.includes('2.0 KB'), `沒有顯示大小，實際是 ${name}`);
});

await test('一次丟多個檔案，每一個都有自己的雜湊', async () => {
  const { root } = load('zh-TW');
  const a = bytes('a');
  const b = bytes('b');
  const input = root.find((n) => n.tag === 'input');
  input.files = [fakeFile('a.txt', a), fakeFile('b.txt', b)];
  input.dispatch('change');
  await settle();
  const hashes = root.findAll((n) => hasClass(n, 'hs-hash')).map((n) => n.textContent);
  assert.deepEqual(hashes, [nodeHash(a), nodeHash(b)]);
});

await test('拖放進來跟用選的走同一條路', async () => {
  const { root } = load('zh-TW');
  const data = bytes('dropped');
  root.find((n) => hasClass(n, 'hs-drop')).dispatch('drop', {
    preventDefault() {},
    dataTransfer: { files: [fakeFile('x.bin', data)] },
  });
  await settle();
  assert.equal(textOf(root, 'hs-hash'), nodeHash(data));
});

await test('讀不到的檔案給出錯誤訊息，不是一個空白的框', async () => {
  const { root } = load('zh-TW');
  const input = root.find((n) => n.tag === 'input');
  input.files = [brokenFile('broken.iso', 4096)];
  input.dispatch('change');
  await settle();
  assert.equal(root.find((n) => hasClass(n, 'hs-hash')), null, '算失敗卻顯示了雜湊');
  const state = root.find((n) => hasClass(n, 'hs-state--differ'));
  assert.ok(state && state.textContent.length > 0, '沒有顯示讀不到的訊息');
});

console.log('\n比對');

async function withFile(lang, data) {
  const { root } = load(lang);
  const input = root.find((n) => n.tag === 'input');
  input.files = [fakeFile('carry.zip', data)];
  input.dispatch('change');
  await settle();
  const box = root.find((n) => n.tag === 'textarea');
  const paste = async (text) => {
    box.value = text;
    box.dispatch('input');
    await settle(5);
  };
  return { root, paste };
}

const DATA = bytes('the payload that travelled by hand');
const WANT = nodeHash(DATA);

await test('還沒貼東西時是等待，不能畫成不相符', async () => {
  const { root } = await withFile('zh-TW', DATA);
  assert.ok(root.find((n) => hasClass(n, 'hs-state--pending')), '沒有等待狀態');
  assert.equal(root.find((n) => hasClass(n, 'hs-state--differ')), null, '還沒比對就說不相符');
});

await test('貼上相符的雜湊', async () => {
  const { root, paste } = await withFile('zh-TW', DATA);
  await paste(WANT);
  assert.ok(root.find((n) => hasClass(n, 'hs-state--match')), '相符卻沒有顯示相符');
  assert.equal(root.find((n) => hasClass(n, 'hs-state--differ')), null);
});

await test('貼上別的雜湊，明確說不相符', async () => {
  const { root, paste } = await withFile('zh-TW', DATA);
  await paste(nodeHash(bytes('something else entirely')));
  assert.ok(root.find((n) => hasClass(n, 'hs-state--differ')), '不相符卻沒有說');
  assert.equal(root.find((n) => hasClass(n, 'hs-state--match')), null);
});

await test('sha256sum 的輸出格式直接貼也認得', async () => {
  const { root, paste } = await withFile('zh-TW', DATA);
  await paste(`${WANT.toUpperCase()}  carry.zip\n`);
  assert.ok(root.find((n) => hasClass(n, 'hs-state--match')), '大寫加檔名的格式沒認出來');
});

await test('貼一整份清單，自己找出對得上的那一行', async () => {
  const { root, paste } = await withFile('zh-TW', DATA);
  const other = nodeHash(bytes('another file'));
  await paste(`${other}  a.zip\n${WANT}  carry.zip\n${nodeHash(bytes('third'))}  c.zip\n`);
  assert.ok(root.find((n) => hasClass(n, 'hs-state--match')));
  const found = textOf(root, 'hs-found');
  assert.ok(found && found.includes('3'), `找到的數量沒有顯示，實際是 ${found}`);
});

await test('貼進去的東西裡沒有雜湊時說清楚', async () => {
  const { root, paste } = await withFile('zh-TW', DATA);
  await paste('他說檔案在隨身碟裡');
  const found = textOf(root, 'hs-found');
  assert.ok(found && found.length > 0, '沒有告訴讀者貼進去的東西裡沒有雜湊');
  assert.ok(root.find((n) => hasClass(n, 'hs-state--pending')), '應該還是等待狀態');
});

await test('清空之後檔案與貼上的內容都不見了', async () => {
  const { root, paste } = await withFile('zh-TW', DATA);
  await paste(WANT);
  root.find((n) => hasClass(n, 'hs-clear')).dispatch('click');
  await settle(5);
  assert.equal(root.find((n) => hasClass(n, 'hs-hash')), null, '檔案還在');
  assert.equal(root.find((n) => n.tag === 'textarea').value, '', '比對框沒有清掉');
});

console.log('\n複製');

await test('複製的內容就是畫面上那一串', async () => {
  const { root, clipboard } = load('zh-TW');
  const input = root.find((n) => n.tag === 'input');
  input.files = [fakeFile('c.txt', DATA)];
  input.dispatch('change');
  await settle();
  root.find((n) => hasClass(n, 'hs-copy')).dispatch('click');
  await settle(5);
  assert.deepEqual(clipboard.written, [WANT]);
});

console.log(`\n${pass} 通過，${fail} 失敗`);
process.exit(fail ? 1 : 0);
