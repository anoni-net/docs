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
    update.children.some((c) => c.className === 'anoni-banner-spinner'),
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

for (const [name, fn] of tests) {
  try {
    fn();
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
