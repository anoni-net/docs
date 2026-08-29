#!/usr/bin/env node
/**
 * 離線內容管理頁（docs/zh-TW/js/offline-library.js）的單元測試。
 *
 * === 為什麼需要這支 ===
 *
 * 那一頁是斷網時的落腳處，而它的行為只在「讀者手上有／沒有某些頁面」的組合下才
 * 分得出對錯，用瀏覽器點一輪要先把快取喬成特定狀態，成本高到不會有人每次改都做。
 * 實際踩過的：
 *
 *   - 「更新已存的內容」按下去沒反應，因為自選清單是空的就直接 return
 *   - 章節照頁數排序，跟讀者在側邊欄記得的位置完全對不上
 *   - 清單裡的頁面標題是純文字，斷網時一頁都點不開
 *   - 進度與完成訊息畫在頁面頂端，而按鈕 sticky 在底部，按完看不到任何回應
 *
 * === 這支守得住什麼、守不住什麼 ===
 *
 * 守得住：畫出來的節點結構、順序、連結、停用狀態、送給 service worker 的指令內容。
 * 守不住：版面與樣式。替身沒有 layout，「看不看得到」量不出來，那要靠實機截圖。
 * 上面第四項在這裡驗的是「進度條是不是底部那條的子節點」，位置本身仍要人看。
 *
 * === 怎麼驗 ===
 *
 * 跟 test_sw_offline.mjs 同一套做法：原始碼整份原地執行，不重寫一份邏輯。那支是
 * 抽函式，這支是 IIFE 又吃 DOM，所以改成餵一組最小替身進去。替身只實作這份原始碼
 * 真正用到的那些 API（見下方 FakeElement），不是通用 DOM。
 *
 * 用法：
 *   node tools/test_offline_library.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'docs', 'zh-TW', 'js', 'offline-library.js');
const src = fs.readFileSync(SRC, 'utf8');

// ---------------------------------------------------------------------------
// 最小 DOM 替身
// ---------------------------------------------------------------------------

class FakeElement {
  constructor(tag) {
    this.tagName = String(tag).toUpperCase();
    this.children = [];
    this.parent = null;
    this._text = '';
    this.className = '';
    this.attributes = {};
    this.listeners = {};
    this.style = {};
    this.disabled = false;
    this.checked = false;
    // 真的 DOM 上這幾個設 property 會同步到 attribute（a.href = x 之後
    // getAttribute('href') 拿得到），替身照做，測試兩種寫法都能用
    for (const name of ['href', 'title', 'id']) {
      Object.defineProperty(this, name, {
        get: () => this.attributes[name],
        set: (value) => {
          this.attributes[name] = String(value);
        },
        enumerable: true,
        configurable: true,
      });
    }
    this.classList = {
      add: (...names) => {
        const have = this.className ? this.className.split(/\s+/) : [];
        for (const n of names) if (!have.includes(n)) have.push(n);
        this.className = have.join(' ');
      },
      remove: (...names) => {
        const have = this.className ? this.className.split(/\s+/) : [];
        this.className = have.filter((n) => !names.includes(n)).join(' ');
      },
      contains: (name) => (this.className || '').split(/\s+/).includes(name),
    };
  }
  get classes() {
    return (this.className || '').split(/\s+/).filter(Boolean);
  }
  appendChild(node) {
    node.parent = this;
    this.children.push(node);
    return node;
  }
  removeChild(node) {
    this.children = this.children.filter((c) => c !== node);
  }
  remove() {
    if (this.parent) this.parent.removeChild(this);
  }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }
  getAttribute(name) {
    return name in this.attributes ? this.attributes[name] : null;
  }
  addEventListener(type, fn) {
    (this.listeners[type] = this.listeners[type] || []).push(fn);
  }
  // 測試用：觸發事件。真的 DOM 上 label 包 input 時點文字也會切換勾選，
  // 那層轉發這裡不做，測試直接對 input 本身操作。
  fire(type) {
    for (const fn of this.listeners[type] || []) fn({ target: this });
  }
  click() {
    this.fire('click');
  }
  set textContent(value) {
    this._text = String(value);
    // root.textContent = "" 是這份原始碼清空重畫的方式
    this.children = [];
  }
  get textContent() {
    if (this.children.length) return this.children.map((c) => c.textContent).join('');
    return this._text;
  }
  get descendants() {
    const out = [];
    const walk = (node) => {
      for (const c of node.children) {
        out.push(c);
        walk(c);
      }
    };
    walk(this);
    return out;
  }
  // 只支援 ".cls"、"tag"、"tag.cls"，測試與原始碼用到的就這幾種
  matches(selector) {
    for (const part of selector.trim().split(/\s+/).slice(-1)) {
      const m = part.match(/^([a-zA-Z]+)?((?:\.[\w-]+)*)$/);
      if (!m) throw new Error(`替身不支援的 selector：${selector}`);
      if (m[1] && this.tagName !== m[1].toUpperCase()) return false;
      for (const cls of (m[2] || '').split('.').filter(Boolean)) {
        if (!this.classList.contains(cls)) return false;
      }
      return true;
    }
    return false;
  }
  querySelectorAll(selector) {
    return this.descendants.filter((n) => n.matches(selector));
  }
  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }
}

class FakeText extends FakeElement {
  constructor(text) {
    super('#text');
    this._text = text;
  }
  set textContent(v) {
    this._text = String(v);
  }
  get textContent() {
    return this._text;
  }
}

const makeDocument = (root, lang) => ({
  documentElement: { lang },
  head: new FakeElement('head'),
  getElementById: (id) => (id === 'offline-library' ? root : null),
  createElement: (tag) => new FakeElement(tag),
  createTextNode: (text) => new FakeText(text),
});

// ---------------------------------------------------------------------------
// service worker 替身
// ---------------------------------------------------------------------------

/**
 * 一個假的 service worker，收得懂管理頁送的四種指令。
 * opts.saved / opts.precached 決定它回報裝置上有什麼。
 */
const makeServiceWorker = (opts) => {
  const sent = [];
  const state = {
    saved: [...(opts.saved || [])],
    precached: [...(opts.precached || [])],
    autoPrecache: opts.autoPrecache !== false,
    precacheImages: opts.precacheImages === true,
  };
  const active = {
    postMessage(message, ports) {
      sent.push(message);
      const port = ports && ports[0];
      if (!port) return;
      const reply = (data) => port.onmessage && port.onmessage({ data });
      queueMicrotask(() => {
        if (message.type === 'OFFLINE_STATUS') {
          reply({
            type: 'status',
            saved: [...state.saved],
            precached: [...state.precached],
            autoPrecache: state.autoPrecache,
            precacheImages: state.precacheImages,
            estimate: opts.estimate || null,
          });
        } else if (message.type === 'OFFLINE_ADD') {
          // 模擬網路很差：service worker 收到了，但一筆都還沒回報
          if (opts.holdAdd) return;
          let done = 0;
          for (const p of message.paths) {
            done += 1;
            if (!state.saved.includes(p)) state.saved.push(p);
            reply({ type: 'progress', done, total: message.paths.length });
          }
          reply({ type: 'done', ok: message.paths.length, failed: 0 });
        } else if (message.type === 'OFFLINE_REMOVE') {
          const before = state.saved.length;
          state.saved = state.saved.filter((p) => !message.paths.includes(p));
          reply({ type: 'done', removed: before - state.saved.length });
        } else if (message.type === 'OFFLINE_IMAGES') {
          state.precacheImages = message.enabled;
          reply({ type: 'done', precacheImages: message.enabled });
        } else if (message.type === 'OFFLINE_AUTO') {
          state.autoPrecache = message.enabled;
          reply({ type: 'done', autoPrecache: message.enabled });
        } else if (message.type === 'OFFLINE_CLEAR') {
          state.saved = [];
          state.precached = [];
          state.autoPrecache = false;
          state.precacheImages = false;
          reply({ type: 'done', cleared: true });
        } else {
          reply({ type: 'error', reason: 'unknown-command' });
        }
      });
    },
  };
  const registration = { active };
  return {
    sent,
    state,
    api: {
      getRegistration: async () => (opts.noRegistration ? null : registration),
      ready: Promise.resolve(registration),
    },
  };
};

// ---------------------------------------------------------------------------
// 載入被測的原始碼
// ---------------------------------------------------------------------------

const INDEX = {
  lang: 'zh-TW',
  // 資產大小的全域表，管理頁算「勾這幾頁實際會下載多少」時去重後查它
  assets: {
    'img/shared.png': 51200,
    'img/journalist.png': 51200,
  },
  sections: [
    {
      key: '|',
      title: '首頁',
      group: '',
      bytes: 100,
      pages: [{ url: '', title: '首頁', bytes: 100 }],
    },
    {
      key: '指南|概念',
      title: '概念',
      group: '指南',
      bytes: 300,
      pages: [
        { url: 'basics/', title: '概念層', bytes: 100 },
        { url: 'basics/metadata/', title: 'Metadata 是什麼', bytes: 200 },
      ],
    },
    {
      key: '指南|場景',
      title: '場景',
      group: '指南',
      bytes: 204800,
      assetBytes: 102400,
      pages: [
        {
          url: 'scenarios/journalist/',
          title: '記者保護消息來源',
          bytes: 102400,
          assets: ['img/shared.png', 'img/journalist.png'],
          assetBytes: 102400,
        },
        {
          url: 'scenarios/activist/',
          title: '社運行動者的數位準備',
          bytes: 102400,
          assets: ['img/shared.png'],
          assetBytes: 51200,
        },
      ],
    },
  ],
};

const tick = (n = 6) =>
  new Promise((resolve) => {
    let left = n;
    const step = () => (left-- <= 0 ? resolve() : queueMicrotask(step));
    step();
  });

/**
 * 跑一次那份原始碼，回傳 root 與幾個探針。
 *
 * opts.saved      讀者自己選存的（相對該語系根目錄的路徑）
 * opts.precached  網站自動存的
 * opts.online     navigator.onLine，預設 true
 * opts.noIndex    讓 offline-index.json 抓不到
 */
const load = async (opts = {}) => {
  const root = new FakeElement('div');
  const document = makeDocument(root, opts.lang || 'zh-TW');
  const sw = makeServiceWorker(opts);
  const navigator = {
    serviceWorker: sw.api,
    onLine: opts.online !== false,
  };
  const window = { __anoniServiceWorker: opts.swFlag !== false };
  const location = { href: 'https://anoni.net/docs/offline/' };
  const fetched = [];
  const fetchStub = async (url) => {
    fetched.push(url);
    if (opts.noIndex) return { ok: false };
    return { ok: true, json: async () => JSON.parse(JSON.stringify(INDEX)) };
  };
  // MessageChannel：port2 交給 worker，worker 回話走 port1.onmessage
  class MessageChannelStub {
    constructor() {
      const port1 = { onmessage: null };
      this.port1 = port1;
      this.port2 = {
        get onmessage() {
          return port1.onmessage;
        },
        set onmessage(fn) {
          port1.onmessage = fn;
        },
      };
      // worker 端拿到的 port 要能 postMessage 回來
      this.port2.postMessage = (data) => port1.onmessage && port1.onmessage({ data });
      Object.defineProperty(this.port2, 'onmessage', {
        get: () => port1.onmessage,
        set: (fn) => {
          port1.onmessage = fn;
        },
      });
    }
  }
  new Function(
    'document', 'window', 'navigator', 'location', 'fetch', 'MessageChannel', 'setTimeout', 'URL',
    src
  )(document, window, navigator, location, fetchStub, MessageChannelStub, setTimeout, URL);

  await tick(12);
  return { root, sw, fetched, document };
};

// 幾個常用探針
const sections = (root) => root.querySelectorAll('.ol-section');
const sectionNames = (root) => root.querySelectorAll('.ol-name').map((n) => n.textContent);
const expand = (root, name) => {
  const t = root.querySelectorAll('.ol-toggle').find((n) => n.textContent.includes(name));
  assert.ok(t, `找不到章節「${name}」`);
  t.click();
};
const clickButton = (root, text) => {
  const b = root.querySelectorAll('button').find((n) => n.textContent.includes(text));
  assert.ok(b, `找不到按鈕「${text}」`);
  b.click();
  return b;
};
const findButton = (root, text) =>
  root.querySelectorAll('button').find((n) => n.textContent.includes(text));

// ---------------------------------------------------------------------------
// 測試
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('章節照索引給的順序畫，不另外排', async () => {
  const { root } = await load();
  // INDEX 裡「場景」的 bytes 比「概念」大，照頁數或大小排都會換位置
  assert.deepEqual(sectionNames(root), ['首頁', '概念', '場景']);
  assert.equal(sections(root).length, 3);
});

test('頂層章節有兩組以上才掛標題', async () => {
  const { root } = await load();
  const groups = root.querySelectorAll('.ol-group').map((n) => n.textContent);
  // 「指南」底下有概念與場景兩組，「首頁」那組只有自己
  assert.deepEqual(groups, ['指南']);
});

test('頁面標題是連結，已存的與沒存的分得出來', async () => {
  const { root } = await load({ precached: ['basics/', 'basics/metadata/'] });
  expand(root, '概念');
  expand(root, '場景');
  const links = root.querySelectorAll('a');
  const byTitle = Object.fromEntries(links.map((a) => [a.textContent, a]));

  assert.equal(byTitle['概念層'].getAttribute('href'), 'https://anoni.net/docs/basics/');
  assert.ok(!byTitle['概念層'].classList.contains('ol-title--absent'));
  // 沒存的照樣是連結（線上點得開），但淡一階並註明
  assert.ok(byTitle['記者保護消息來源'].classList.contains('ol-title--absent'));
  assert.ok(byTitle['記者保護消息來源'].getAttribute('title'));
});

test('網站自動存的那批不給個別勾選', async () => {
  const { root } = await load({ precached: ['basics/', 'basics/metadata/'] });
  expand(root, '概念');
  expand(root, '場景');
  const boxes = root.querySelectorAll('input');
  const inSection = (name) => {
    const sec = sections(root).find((s) => s.textContent.includes(name));
    return sec.querySelectorAll('input');
  };
  assert.ok(inSection('概念').every((b) => b.disabled), '自動存的應該停用');
  assert.ok(inSection('場景').every((b) => !b.disabled), '沒存的應該可以勾');
  assert.ok(boxes.length > 0);
});

test('整章都是網站自動存的就不畫「整章勾選」', async () => {
  // 那顆按下去什麼都不會變，留著只是一顆按不動的東西
  const { root } = await load({ precached: ['basics/', 'basics/metadata/'] });
  expand(root, '概念');
  assert.equal(findButton(root, '整章勾選'), undefined);
  expand(root, '場景');
  assert.ok(findButton(root, '整章勾選'));
});

test('沒有自選頁面時「更新已存的內容」停用並說明原因', async () => {
  // 原本按下去直接 return，讀者只看到一顆沒反應的按鈕
  const { root } = await load({ precached: ['basics/'] });
  assert.equal(findButton(root, '更新已存的內容').disabled, true);
  assert.ok(root.textContent.includes('你還沒有自己選存頁面'));
});

test('有自選頁面時「更新已存的內容」可以按', async () => {
  const { root } = await load({ saved: ['scenarios/journalist/'] });
  assert.equal(findButton(root, '更新已存的內容').disabled, false);
});

test('一鍵存全部把清單裡缺的都送出，連同資產去重', async () => {
  // 一章一章展開再勾，趕在斷網之前存一份的人做不完，而那正是這個功能存在的理由。
  // 少送任何一頁的症狀都是讀者到了沒有網路的地方才發現缺。
  const { root, sw } = await load();
  clickButton(root, '全部存到裝置');
  await tick(30);

  const add = sw.sent.find((m) => m.type === 'OFFLINE_ADD');
  assert.ok(add, '沒有送出 OFFLINE_ADD');
  // 網址是 sw.js 用來補語系前綴的依據
  assert.equal(add.url, 'https://anoni.net/docs/offline/');
  assert.deepEqual(add.paths.sort(), [
    '',
    'basics/',
    'basics/metadata/',
    'scenarios/activist/',
    'scenarios/journalist/',
  ]);
  // 兩頁共用的那張只送一次
  assert.deepEqual(add.assets.sort(), ['img/journalist.png', 'img/shared.png']);
});

test('一鍵存全部跳過已經存進來的，但網站自動存的那批照樣送', async () => {
  // PRECACHE 的名字帶著網站版本，換版時 activate 會整個刪掉，新版的 install 只補得
  // 回當下開著的那一個語系。2026-08-29 有人上飛機前三個語系各按了一次，飛到一半發現
  // 只剩一個語系讀得到，被跳過的正好是核心章節那四十幾頁。
  //
  // 讀者按下這顆的意思是「這些要留在裝置上」，那就得存進不隨版本走的地方。
  const { root, sw } = await load({
    saved: ['scenarios/journalist/'],
    precached: ['', 'basics/'],
  });
  clickButton(root, '全部存到裝置');
  await tick(30);

  const add = sw.sent.find((m) => m.type === 'OFFLINE_ADD');
  // 已經在 LIBRARY 的那一頁不重送，網站自動存的兩頁照樣送
  assert.deepEqual(add.paths.sort(), ['', 'basics/', 'basics/metadata/', 'scenarios/activist/']);
});

test('清單都存進來之後不畫一鍵按鈕，改說明原因', async () => {
  // 按鈕就這樣消失而沒有交代，讀者只會以為是壞了
  const { root } = await load({
    saved: [
      '',
      'basics/',
      'basics/metadata/',
      'scenarios/journalist/',
      'scenarios/activist/',
    ],
  });
  assert.equal(findButton(root, '全部存到裝置'), undefined);
  assert.ok(root.textContent.includes('都已經存進這台裝置'));
});

test('整份清單都只是網站自動存的，一鍵按鈕照樣要出現', async () => {
  // 那批換版就沒了。看起來「都在裝置上」而不給按，讀者就沒有辦法把它們留住。
  const { root } = await load({
    precached: [
      '',
      'basics/',
      'basics/metadata/',
      'scenarios/journalist/',
      'scenarios/activist/',
    ],
  });
  const btn = findButton(root, '全部存到裝置');
  assert.ok(btn, '全是網站自動存的就不給按，那批換版之後會消失');
  assert.ok(btn.textContent.includes('5 頁'), btn.textContent);
});

test('一鍵按鈕上寫出頁數與要下載多少', async () => {
  // 按下去之前就知道會用掉多少流量，所以這一顆不再多一次確認
  const { root } = await load();
  const btn = findButton(root, '全部存到裝置');
  assert.ok(btn, '找不到一鍵按鈕');
  assert.ok(btn.textContent.includes('5 頁'), btn.textContent);
  assert.ok(/\d+(\.\d+)? (KB|MB|GB)/.test(btn.textContent), btn.textContent);
});

test('一鍵按鈕旁邊講明會一併存下敏感場景頁', async () => {
  // 那幾類頁面刻意不在預先下載的範圍內，一鍵存全部等於繞過那個決定。
  // 讀者按之前要看得見，不然裝置被檢查時才發現就來不及了。
  const { root } = await load();
  assert.ok(root.textContent.includes('記者、行動者、LGBTQ、家暴'), root.textContent);
});

test('索引還沒讀到時不說「都存好了」', async () => {
  // 那時候一頁都還沒列出來，說都存好了是假的
  const { root } = await load({ noIndex: true });
  assert.equal(findButton(root, '全部存到裝置'), undefined);
  assert.ok(!root.textContent.includes('都已經在這台裝置上'));
});

test('勾選之後才出現套用，計數跟著勾選走', async () => {
  const { root } = await load();
  assert.equal(findButton(root, '套用變更'), undefined);

  expand(root, '場景');
  const sec = sections(root).find((s) => s.textContent.includes('場景'));
  sec.querySelectorAll('input')[0].checked = true;
  sec.querySelectorAll('input')[0].fire('change');

  assert.ok(findButton(root, '套用變更'));
  assert.ok(root.querySelector('.ol-apply').textContent.includes('待新增 1 頁'));
});

test('套用把勾選的頁面送給 service worker，指令帶上這一頁的網址', async () => {
  // 網址是 sw.js 用來補語系前綴的依據，少了它 en 與 zh-cn 會存到 zh-TW 那一版
  const { root, sw } = await load();
  expand(root, '場景');
  const sec = sections(root).find((s) => s.textContent.includes('場景'));
  clickButton(sec, '整章勾選');
  clickButton(root, '套用變更');
  await tick(20);

  const add = sw.sent.find((m) => m.type === 'OFFLINE_ADD');
  assert.ok(add, '沒有送出 OFFLINE_ADD');
  assert.equal(add.url, 'https://anoni.net/docs/offline/');
  assert.deepEqual(add.paths.sort(), ['scenarios/activist/', 'scenarios/journalist/']);
  assert.deepEqual(sw.state.saved.sort(), ['scenarios/activist/', 'scenarios/journalist/']);
});

test('套用時把那些頁面需要的資產一起送出，去重', async () => {
  // 只抓 HTML 的話讀者離線打開會缺圖，互動類的頁面連跑都跑不起來
  const { root, sw } = await load();
  expand(root, '場景');
  const sec = sections(root).find((s) => s.textContent.includes('場景'));
  clickButton(sec, '整章勾選');
  clickButton(root, '套用變更');
  await tick(30);

  const add = sw.sent.find((m) => m.type === 'OFFLINE_ADD');
  assert.deepEqual(add.paths.sort(), ['scenarios/activist/', 'scenarios/journalist/']);
  // 兩頁共用的那張只送一次
  assert.deepEqual(add.assets.sort(), ['img/journalist.png', 'img/shared.png']);
});

test('移除頁面時，別頁還要用的資產不送去刪', async () => {
  // 移掉一篇文章不能把另一篇還在用的圖也刪了，那會變破圖
  const { root, sw } = await load({
    saved: ['scenarios/journalist/', 'scenarios/activist/'],
  });
  expand(root, '場景');
  const sec = sections(root).find((s) => s.textContent.includes('場景'));
  const box = sec.querySelectorAll('input')[0];
  box.checked = false;
  box.fire('change');
  clickButton(root, '套用變更');
  await tick(30);

  const remove = sw.sent.find((m) => m.type === 'OFFLINE_REMOVE');
  assert.deepEqual(remove.paths, ['scenarios/journalist/']);
  assert.deepEqual(remove.assets, ['img/journalist.png']);
});

test('「更新已存的內容」連資產一起更新', async () => {
  const { root, sw } = await load({ saved: ['scenarios/journalist/'] });
  clickButton(root, '更新已存的內容');
  await tick(30);

  const add = sw.sent.find((m) => m.type === 'OFFLINE_ADD' && m.refresh);
  assert.deepEqual(add.paths, ['scenarios/journalist/']);
  assert.deepEqual(add.assets.sort(), ['img/journalist.png', 'img/shared.png']);
});

test('大小含資產，章節的部分去重', async () => {
  // 場景章：HTML 兩頁各 100 KB，資產去重後 100 KB，合計 300 KB。
  // 不去重的話會是 350 KB，讀者以為要下載的比實際多。
  const { root } = await load();
  const meta = root
    .querySelectorAll('.ol-toggle')
    .find((n) => n.textContent.includes('場景'))
    .querySelector('.ol-meta');
  assert.ok(meta.textContent.includes('300 KB'), `章節大小是 ${meta.textContent}`);

  expand(root, '場景');
  const sec = sections(root).find((s) => s.textContent.includes('場景'));
  const sizes = sec.querySelectorAll('.ol-size').map((n) => n.textContent);
  // 個別頁面照自己的算，記者那頁 100 KB 內文加 100 KB 圖
  assert.deepEqual(sizes, ['200 KB', '150 KB']);
});

test('填了底色的按鈕不會被 hover 規則蓋掉文字色', () => {
  // 通用 hover 把文字色換成 accent，而它多一個 button 型別選擇器，特異性比
  // .ol-primary 與 .ol-danger 自己的 hover 都高。漏排除哪一個，哪一個的文字色就會
  // 被換成 accent。「套用變更」踩過一次，「確定清除」2026-08-29 又踩了一次，回報
  // 是紅底配藍字。觸控裝置點完會停在 hover 狀態，所以手機上按一下就變成那樣。
  assert.ok(
    src.includes('button:hover:not(:disabled):not(.ol-primary):not(.ol-danger)'),
    'hover 規則要排除每一顆填了底色的按鈕'
  );
  assert.ok(src.includes('.ol-primary:hover'), '.ol-primary 要有自己的 hover 回饋');
  assert.ok(src.includes('.ol-danger:hover'), '.ol-danger 要有自己的 hover 回饋');
});

test('確定清除平常就是紅底白字，不等 hover 才看得出危險', () => {
  // 清除是不可逆的，而觸控裝置沒有 hover 可用，靠 hover 表達危險等於在手機上
  // 表達不出來。#c62828 配白字的對比是 5.6:1，過 WCAG AA。
  const rule = src.match(/#offline-library \.ol-danger \{[^}]*\}/);
  assert.ok(rule, '找不到 .ol-danger 的樣式');
  assert.ok(/background:\s*#c62828/.test(rule[0]), rule[0]);
  assert.ok(/color:\s*#fff/.test(rule[0]), rule[0]);
});

test('按下之後那顆按鈕自己轉起來，不必等第一筆回報', async () => {
  // 進度條 sticky 在畫面下緣，而讀者的視線停在剛按下的那顆按鈕上。網路差的時候
  // 第一筆回報要等好幾秒，按鈕沒有變化的話人會以為沒按到，一直重複按。
  const { root } = await load({ holdAdd: true });
  clickButton(root, '全部存到裝置');
  await tick(10);

  const busy = root.querySelectorAll('button').find((b) => b.textContent.includes('處理中'));
  assert.ok(busy, '按下之後沒有任何一顆按鈕顯示狀態');
  assert.ok(busy.querySelector('.anoni-spinner'), '按鈕上沒有轉圈');
  assert.equal(busy.getAttribute('aria-busy'), 'true', '讀螢幕的人拿不到狀態');
});

test('第一筆回報之前進度條在掃動，不是一條靜止的空槽', async () => {
  // 比例是 0 的時候畫出來就是一條空槽，看起來跟沒反應一樣，而那正是讀者最想知道
  // 「到底有沒有按到」的時候。
  const { root } = await load({ holdAdd: true });
  clickButton(root, '全部存到裝置');
  await tick(10);

  const track = root.querySelector('.ol-progress__track');
  assert.ok(track, '沒有畫出進度條');
  assert.ok(
    track.classList.contains('ol-progress__track--idle'),
    '第一筆回報還沒到，進度條卻是靜止的'
  );
});

test('回報進來之後進度條切成實際比例', async () => {
  const { root } = await load();
  clickButton(root, '全部存到裝置');
  await tick(30);

  // 工作跑完了，進度條收掉，按鈕也回到原本的樣子
  assert.equal(root.querySelector('.ol-progress__track'), null);
  const still = root.querySelectorAll('button').find((b) => b.textContent.includes('處理中'));
  assert.equal(still, undefined, '工作結束了按鈕還卡在處理中');
});

test('進度與完成訊息都在底部那條裡，不是散在頁面頂端', async () => {
  // 那條 sticky 在畫面下緣，而套用按鈕就在上面。進度畫在頁面頂端的話，讀者按完
  // 什麼都看不到。位置本身要靠實機截圖，這裡守的是「它是那條的子節點」。
  const { root } = await load();
  expand(root, '場景');
  const sec = sections(root).find((s) => s.textContent.includes('場景'));
  clickButton(sec, '整章勾選');
  clickButton(root, '套用變更');

  const dock = root.querySelector('.ol-apply');
  assert.ok(dock.querySelector('.ol-progress'), '進度條不在底部那條裡');
  assert.equal(root.querySelectorAll('.ol-progress').length, 1);

  await tick(20);
  const after = root.querySelector('.ol-apply');
  assert.ok(after, '完成之後那條應該還在，訊息要有地方放');
  assert.ok(after.querySelector('.ol-message').textContent.includes('完成'));
  assert.equal(root.querySelectorAll('.ol-message').length, 1);
});

test('清除要按兩次，中途可以取消', async () => {
  const { root, sw } = await load({ saved: ['scenarios/journalist/'] });
  clickButton(root, '清除所有離線內容');
  assert.ok(findButton(root, '確定清除'), '第一次按下應該換成兩顆並排');
  assert.ok(findButton(root, '取消'));

  clickButton(root, '取消');
  assert.equal(findButton(root, '確定清除'), undefined);
  assert.equal(sw.sent.filter((m) => m.type === 'OFFLINE_CLEAR').length, 0);

  clickButton(root, '清除所有離線內容');
  clickButton(root, '確定清除');
  await tick(20);
  assert.equal(sw.sent.filter((m) => m.type === 'OFFLINE_CLEAR').length, 1);
  assert.deepEqual(sw.state.saved, []);
  assert.equal(sw.state.autoPrecache, false);
});

test('「只列已存的」把沒存的收起來，並展開有東西的章節', async () => {
  const { root } = await load({ precached: ['basics/'], saved: ['scenarios/journalist/'] });
  const filter = root.querySelector('.ol-filter').querySelector('input');
  filter.checked = true;
  filter.fire('change');

  const names = sectionNames(root);
  assert.deepEqual(names, ['概念', '場景'], '首頁沒存，整章不該出現');
  // 收起來之後那兩章只剩存過的那一頁
  const titles = root.querySelectorAll('a').map((a) => a.textContent);
  assert.deepEqual(titles.sort(), ['概念層', '記者保護消息來源']);
  assert.equal(root.querySelectorAll('.ol-title--absent').length, 0);
  // 有東西的章節自動展開，斷網的讀者要的是攤開的清單
  assert.equal(root.querySelectorAll('.ol-body').length, 2);
});

test('斷網進來預設只列已存的', async () => {
  const { root } = await load({ online: false, precached: ['basics/'] });
  assert.equal(root.querySelector('.ol-filter').querySelector('input').checked, true);
  assert.deepEqual(sectionNames(root), ['概念']);
});

test('線上進來不套篩選', async () => {
  const { root } = await load({ precached: ['basics/'] });
  assert.equal(root.querySelector('.ol-filter').querySelector('input').checked, false);
  assert.equal(sectionNames(root).length, 3);
});

test('自動存的開關切下去會送出指令並重讀狀態', async () => {
  const { root, sw } = await load({ precached: ['basics/'] });
  const auto = root.querySelector('.ol-auto').querySelector('input');
  assert.equal(auto.checked, true);
  auto.checked = false;
  auto.fire('change');
  await tick(20);

  const cmd = sw.sent.find((m) => m.type === 'OFFLINE_AUTO');
  assert.ok(cmd);
  assert.equal(cmd.enabled, false);
  assert.equal(root.querySelector('.ol-auto').querySelector('input').checked, false);
});

test('圖片開關預設關著，切下去會送出指令', async () => {
  // 核心章節那批圖有七 MB，預設下載的量會多六成，而多數讀者在行動網路上
  const { root, sw } = await load({ precached: ['basics/'] });
  const boxes = root.querySelectorAll('.ol-auto').map((l) => l.querySelector('input'));
  assert.equal(boxes.length, 2, '自動存與圖片各一個開關');
  assert.equal(boxes[1].checked, false);

  boxes[1].checked = true;
  boxes[1].fire('change');
  await tick(20);

  const cmd = sw.sent.find((m) => m.type === 'OFFLINE_IMAGES');
  assert.ok(cmd);
  assert.equal(cmd.enabled, true);
  assert.equal(cmd.url, 'https://anoni.net/docs/offline/');
  assert.equal(
    root.querySelectorAll('.ol-auto')[1].querySelector('input').checked,
    true
  );
});

test('自動存關掉時，圖片開關跟著停用', async () => {
  // 章節本身都不存了，只補它們的圖沒有意義
  const { root } = await load({ autoPrecache: false });
  const boxes = root.querySelectorAll('.ol-auto').map((l) => l.querySelector('input'));
  assert.equal(boxes[0].checked, false);
  assert.equal(boxes[1].disabled, true);
});

test('讀不到索引時說明原因，不是空白一片', async () => {
  const { root } = await load({ noIndex: true });
  assert.ok(root.textContent.includes('讀不到頁面清單'));
});

test('環境不註冊 service worker 時直接說明，不畫按了沒用的東西', async () => {
  // Tor Browser、onion 版與 IPFS gateway 都走這條。base.html 把旗標設成 false，
  // 這一頁看到就放棄，不用空等三十秒才對著一個好好的瀏覽器說話。
  const { root } = await load({ swFlag: false });
  assert.ok(root.querySelector('.ol-status').textContent.includes('沒有提供離線儲存'));
  assert.equal(root.querySelectorAll('input').length, 0, '沒有 SW 就不該有勾選框');
  assert.equal(findButton(root, '清除所有離線內容'), undefined);
  // 清單本身還是畫出來，線上讀者仍可以拿它當目錄
  assert.ok(sectionNames(root).length > 0);
});

test('service worker 還在準備時，清單先畫出來不必等它', async () => {
  // ready 要等 install 把整個語系抓完，行動網路上那是好幾分鐘。索引跟它是兩條路。
  const { root } = await load({ noRegistration: true });
  assert.ok(root.querySelector('.ol-status').textContent.includes('還在準備'));
  assert.deepEqual(sectionNames(root), ['首頁', '概念', '場景']);
});

test('三個語系各自挑到自己那組字串', async () => {
  for (const [lang, needle] of [['zh-TW', '網站自動存的'], ['zh', '网站自动存的'], ['en', 'stored automatically']]) {
    const { root } = await load({ lang, precached: ['basics/'] });
    assert.ok(
      root.querySelector('.ol-status').textContent.includes(needle),
      `${lang} 應該看到「${needle}」`
    );
  }
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
