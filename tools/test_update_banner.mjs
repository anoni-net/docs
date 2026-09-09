#!/usr/bin/env node
/**
 * 換版提示卡片的單元測試。
 *
 * === 為什麼需要這支 ===
 *
 * 按下「更新」到頁面真的換好，中間是 service worker 的 activate 加一次完整的
 * 導覽：清掉舊快取、重新取得整頁。網路好的時候那是一瞬間，網路差的時候是好幾秒
 * 的空白，而卡片上原本什麼都不會變。讀者的合理反應是再按一次，每按一次就多送
 * 一則 SKIP_WAITING，而他要的那件事其實早就在跑了。
 *
 * 這種問題只在慢網路上看得出來，本機開發永遠碰不到，所以值得有測試守著。
 *
 * === 怎麼驗 ===
 *
 * 跟 test_lang_preference.mjs 同一套做法，把 showUpdateBanner 與它用得到的那幾樣
 * 從 overrides/base.html 原地抽出來執行，不重寫一份。DOM 用最小替身，只實作這段
 * 真正用到的那幾個方法。
 *
 * === 抽屜裡那顆檢查更新 ===
 *
 * 換版提示是被動的，要等 service worker 自己裝好新版才浮出來。抽屜裡那顆是主動
 * 的入口，同一顆按鈕身兼兩種狀態：問伺服器，以及套用已經等在那裡的新版。狀態
 * 弄反的後果是讀者按了「更新」卻只是又問了一次，或者按「檢查更新」卻直接把頁面
 * 換掉，兩種都只在真的有新版時才看得到，本機開發碰不到。
 *
 * 用法：
 *   node tools/test_update_banner.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.join(HERE, '..', 'docs', 'overrides', 'base.html');
const src = fs.readFileSync(BASE, 'utf8');

const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error(`base.html 裡找不到 ${re}`);
  return m[0];
};

class FakeElement {
  constructor(tag) {
    this.tagName = tag;
    this.children = [];
    this.attributes = {};
    this.className = '';
    this.disabled = false;
    this.hidden = false;
    this._text = '';
    this._handlers = {};
  }
  set textContent(v) {
    this._text = v == null ? '' : String(v);
    this.children = [];
  }
  get textContent() {
    if (this.children.length) return this._text + this.children.map((c) => c.textContent).join('');
    return this._text;
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
  removeAttribute(name) {
    delete this.attributes[name];
  }
  addEventListener(type, fn) {
    this._handlers[type] = fn;
  }
  click() {
    if (this._handlers.click) this._handlers.click();
  }
  get descendants() {
    return this.children.flatMap((c) => [c, ...c.descendants]);
  }
  find(pred) {
    return this.descendants.find(pred);
  }
}

const load = () => {
  const created = [];
  const document = {
    createElement: (tag) => {
      const el = new FakeElement(tag);
      created.push(el);
      return el;
    },
    // 純文字節點只需要撐住 textContent 與 appendChild 的介面
    createTextNode: (text) => {
      const node = new FakeElement('#text');
      node.textContent = text;
      return node;
    },
    // 卡片還沒掛上去，所以永遠回 null，那正是要走的那條路
    getElementById: () => null,
  };
  const sessionStorage = { getItem: () => null, setItem: () => {} };
  let toasted = null;
  const window = { __anoniToast: (node) => { toasted = node; return () => {}; } };

  const harness = `
    ${grab(/var STRINGS = \{[\s\S]*?\n          \};/)}
    var t = STRINGS["zh-TW"];
    var DISMISS_KEY = "anoni-docs-update-dismissed";
    var reloadOnTakeover = false;
    ${grab(/function actionButton\(label, primary, onClick\) \{[\s\S]*?\n          \}/)}
    ${grab(/function showUpdateBanner\(waiting\) \{[\s\S]*?\n          \}/)}
    return { showUpdateBanner: showUpdateBanner, reloaded: function () { return reloadOnTakeover; } };
  `;
  const api = new Function('document', 'sessionStorage', 'window', harness)(
    document, sessionStorage, window
  );

  const sent = [];
  const waiting = { postMessage: (m) => sent.push(m) };
  api.showUpdateBanner(waiting);
  const banner = toasted;
  const buttonBy = (text) =>
    banner.find((n) => n.tagName === 'button' && n.textContent.includes(text));
  return { api, banner, sent, buttonBy };
};

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('卡片畫出更新與稍後兩顆', () => {
  const { buttonBy } = load();
  assert.ok(buttonBy('更新'), '找不到更新按鈕');
  assert.ok(buttonBy('稍後'), '找不到稍後按鈕');
});

test('按下更新會送出 SKIP_WAITING', () => {
  const { buttonBy, sent, api } = load();
  buttonBy('更新').click();
  assert.deepEqual(sent, [{ type: 'SKIP_WAITING' }]);
  assert.equal(api.reloaded(), true, '沒有標記接管後要重新載入');
});

test('按下更新之後那顆按鈕停用並顯示更新中', () => {
  // activate 加一次完整導覽，網路差的時候是好幾秒的空白。按鈕沒有變化的話讀者
  // 會以為沒按到而重複按，每按一次就多送一則 SKIP_WAITING。
  const { buttonBy } = load();
  const update = buttonBy('更新');
  update.click();

  assert.equal(update.disabled, true, '按下之後還能再按');
  assert.ok(update.textContent.includes('更新中'), update.textContent);
  assert.ok(
    update.children.some((c) => c.className === 'anoni-spinner'),
    '按鈕上沒有轉圈'
  );
  assert.equal(update.getAttribute('aria-busy'), 'true', '讀螢幕的人拿不到狀態');
});

test('按下更新之後稍後也停用', () => {
  // 那顆會關掉卡片，可是更新已經送出去了，頁面照樣會在幾秒後自己重新載入，
  // 關掉只會讓那次重載變得莫名其妙。
  const { buttonBy } = load();
  const later = buttonBy('稍後');
  buttonBy('更新').click();
  assert.equal(later.disabled, true, '更新跑著的時候還能按稍後');
});

test('沒按更新之前兩顆都是可以按的', () => {
  const { buttonBy } = load();
  assert.equal(buttonBy('更新').disabled, false);
  assert.equal(buttonBy('稍後').disabled, false);
});

// ---------------------------------------------------------------------------
// 抽屜裡的檢查更新
// ---------------------------------------------------------------------------

const loadCheck = ({ waiting = null, installing = null, updateFails = false, hasDom = true, swVersion = '202609091018', legacySw = false } = {}) => {
  const box = new FakeElement('div');
  // 樣板給的初始狀態就是 hidden，假替身要照著來，不然「有沒有拿掉」驗不到東西
  box.hidden = true;
  const button = new FakeElement('button');
  const status = new FakeElement('p');
  button.className = 'anoni-banner-action';
  button.textContent = '檢查更新';
  const byId = {
    '__anoni-update': box,
    '__anoni-update-check': button,
    '__anoni-update-status': status,
  };
  const document = {
    createElement: (tag) => new FakeElement(tag),
    createTextNode: (text) => {
      const node = new FakeElement('#text');
      node.textContent = text;
      return node;
    },
    getElementById: (id) => (hasDom ? byId[id] || null : null),
  };
  const sent = [];
  const registration = {
    waiting: waiting === null ? null : { postMessage: (m) => sent.push(m) },
    installing,
    update: () => (updateFails ? Promise.reject(new Error('offline')) : Promise.resolve()),
  };
  // MessagePort 的兩端在這裡不需要真的跨執行緒，接上就好
  class FakeChannel {
    constructor() {
      this.port1 = { onmessage: null };
      this.port2 = { deliver: (data) => { if (this.port1.onmessage) this.port1.onmessage({ data }); } };
    }
  }
  const asked = [];
  // swVersion 給 false 代表這一頁還沒被 service worker 接管，問不到任何東西。
  // legacySw 模擬舊版 sw.js：它不認得 VERSION，會掉到 library 的分派回 unknown-command。
  const controller = swVersion === false ? null : {
    postMessage: (message, ports) => {
      asked.push(message.type);
      if (message.type === 'VERSION') {
        ports[0].deliver(
          legacySw ? { type: 'error', reason: 'unknown-command' }
                   : { type: 'version', version: swVersion }
        );
        return;
      }
      ports[0].deliver({ type: 'status', version: swVersion });
    },
  };
  const navigator = { serviceWorker: { controller } };

  const harness = `
    ${grab(/var STRINGS = \{[\s\S]*?\n          \};/)}
    var t = STRINGS["zh-TW"];
    var reloadOnTakeover = false;
    var onUpdateReady = function () {};
    ${grab(/function formatVersion\(value\) \{[\s\S]*?\n          \}/)}
    ${grab(/function setupUpdateCheck\(registration\) \{[\s\S]*?\n          \}/)}
    return {
      setup: setupUpdateCheck,
      formatVersion: formatVersion,
      reloaded: function () { return reloadOnTakeover; },
      ready: function () { return onUpdateReady; }
    };
  `;
  const api = new Function('document', 'navigator', 'MessageChannel', 'location', harness)(
    document, navigator, FakeChannel, { href: 'https://anoni.net/docs/tools/what-is-tor/' }
  );
  api.setup(registration);
  return { api, box, button, status, sent, registration, asked };
};

// 讓 registration.update() 那條 promise 鏈跑完
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

test('沒有那塊 DOM 就什麼都不做', () => {
  // onion 與 IPFS 版一樣走這支 base.html，樣板哪天沒渲那塊也不該整段爆掉
  const { box } = loadCheck({ hasDom: false });
  assert.equal(box.hidden, true, '找不到按鈕卻還是把整塊顯示出來了');
});

test('註冊成功之後那塊才顯示', () => {
  // 樣板給的是 hidden，沒有 service worker 的環境不該看到按不動的按鈕
  const { box } = loadCheck();
  assert.equal(box.hidden, false, '註冊成功卻沒有把 hidden 拿掉');
});

test('上次按了稍後，抽屜一開就是可以直接更新', () => {
  const { button, status } = loadCheck({ waiting: true });
  assert.equal(button.textContent, '更新');
  assert.ok(button.className.includes('--primary'), button.className);
  assert.ok(status.textContent.includes('重新載入'), status.textContent);
});

test('沒有等待中的新版時是檢查狀態', () => {
  const { button, status } = loadCheck();
  assert.equal(button.textContent, '檢查更新');
  assert.equal(button.className, 'anoni-banner-action');
  assert.equal(status.textContent, '');
});

test('按下檢查會停用並顯示檢查中與轉圈', async () => {
  // 慢網路上 update() 要好幾秒，按鈕沒有變化讀者只會以為沒按到
  const { button } = loadCheck();
  button.click();
  assert.equal(button.disabled, true);
  assert.ok(button.textContent.includes('檢查中'), button.textContent);
  assert.ok(button.children.some((c) => c.className === 'anoni-spinner'), '按鈕上沒有轉圈');
  assert.equal(button.getAttribute('aria-busy'), 'true');
  await flush();
});

test('檢查完沒有新版就說已是最新版本', async () => {
  // 這一頁還沒被 service worker 接管的話問不到版本，那就只說結論
  const { button, status } = loadCheck({ swVersion: false });
  button.click();
  await flush();
  assert.equal(status.textContent, '已是最新版本');
  assert.equal(button.textContent, '檢查更新', '按鈕沒有還原成原本那串');
  assert.equal(button.disabled, false);
  assert.equal(button.getAttribute('aria-busy'), null);
});

test('版本號拆成看得懂的日期', () => {
  const { api } = loadCheck();
  assert.equal(api.formatVersion('202609091018'), '2026-09-09 10:18 UTC');
});

test('認不出來的版本字串不硬湊日期', () => {
  // 本機建置沒有替換佔位字串，走的就是這條。硬拆會給出一個看起來像真的假日期。
  const { api } = loadCheck();
  for (const bad of ['__BUILD_VERSION__', '', null, undefined, '20260909101', '2026090910180', '2026-09-09'])
    assert.equal(api.formatVersion(bad), null, String(bad));
});

test('已是最新版本會帶上日期', async () => {
  const { button, status, asked } = loadCheck();
  button.click();
  await flush();
  assert.equal(status.textContent, '已是最新版本（2026-09-09 10:18 UTC）');
  assert.deepEqual(asked, ['VERSION'], '第一問就該用輕量的那則');
});

test('舊的 service worker 不認得 VERSION 就退回 OFFLINE_STATUS', async () => {
  // 這顆按鈕上線的當下，讀者裝置上跑的還是舊版 sw.js，退路沒接好就整整一個
  // 版本週期看不到日期
  const { button, status, asked } = loadCheck({ legacySw: true });
  button.click();
  await flush();
  assert.deepEqual(asked, ['VERSION', 'OFFLINE_STATUS']);
  assert.equal(status.textContent, '已是最新版本（2026-09-09 10:18 UTC）');
});

test('檢查完抓不到 sw.js 就說連不上', async () => {
  const { button, status } = loadCheck({ updateFails: true });
  button.click();
  await flush();
  assert.ok(status.textContent.includes('連不上'), status.textContent);
  assert.equal(button.disabled, false, '失敗之後按鈕沒有解開，讀者再也試不了');
});

test('檢查完發現新版就換成更新', async () => {
  const { button, status, registration } = loadCheck();
  registration.update = () => {
    registration.waiting = { postMessage: () => {} };
    return Promise.resolve();
  };
  button.click();
  await flush();
  assert.equal(button.textContent, '更新');
  assert.ok(button.className.includes('--primary'), button.className);
  assert.ok(status.textContent.includes('重新載入'), status.textContent);
});

test('更新狀態按下去送 SKIP_WAITING 並標記重新載入', () => {
  const { api, button, sent } = loadCheck({ waiting: true });
  button.click();
  assert.deepEqual(sent, [{ type: 'SKIP_WAITING' }]);
  assert.equal(api.reloaded(), true, '沒有標記接管後要重新載入');
  assert.equal(button.disabled, true);
  assert.ok(button.textContent.includes('更新中'), button.textContent);
});

test('等待中的新版不見了就退回檢查，不送空訊息', () => {
  // 另一個分頁先按了更新，這邊的 registration.waiting 會變成 null
  const { button, status, sent, registration } = loadCheck({ waiting: true });
  registration.waiting = null;
  button.click();
  assert.deepEqual(sent, [], '對著不存在的 worker 送了訊息');
  assert.equal(button.textContent, '檢查更新');
  assert.equal(status.textContent, '已是最新版本');
});

test('換版提示那條路也接得到抽屜這顆', () => {
  // 讀者關掉卡片再打開抽屜，看到的要是「更新」而不是「檢查更新」
  const { api, button } = loadCheck();
  assert.equal(button.textContent, '檢查更新');
  api.ready()();
  assert.equal(button.textContent, '更新');
});

for (const [name, fn] of tests) {
  try {
    await fn();
    passed++;
    console.log('  ✓ ' + name);
  } catch (err) {
    failed++;
    console.error('  ✗ ' + name);
    console.error('    ' + String(err.message).split('\n').join('\n    '));
  }
}

console.log(`\n${passed} 通過，${failed} 失敗`);
process.exit(failed ? 1 : 0);
