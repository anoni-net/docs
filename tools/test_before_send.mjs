#!/usr/bin/env node
/**
 * 送出前白名單（docs/overrides/main.html 的 anoniBeforeSend）的單元測試。
 *
 * === 為什麼需要這支 ===
 *
 * 2026-08 發現 mkdocs.yml 開著 search.highlight，Material 因此把讀者打的字寫進每一條
 * 搜尋結果連結的 ?h= 參數，而 umami 的 exclude-search 預設關閉，query string 原樣送出。
 * 讀者從搜尋結果點進任何一頁，搜尋詞就跟著 pageview 進了分析資料庫。這個站的讀者
 * 可能正在搜「防火長城」，那種記錄留在哪裡都是風險。
 *
 * anoniBeforeSend 是修法，也是之後所有分析改動的護欄。它的失效方式跟第一次那個一樣
 * 安靜：白名單漏一條，資料照常送，畫面一切正常，要到有人翻資料庫才會發現。所以每一
 * 條規則都要有測試盯著。
 *
 * === 怎麼驗 ===
 *
 * 跟這個 repo 其他幾支一樣，把函式從原始碼原地抽出來跑，不重寫一份。抽的來源是
 * overrides/main.html，那是實際出貨的那份。
 *
 * 用法：
 *   node tools/test_before_send.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OVERRIDES = ['overrides', 'overrides_cn', 'overrides_en'].map((d) =>
  path.join(HERE, '..', 'docs', d, 'main.html'));
const src = fs.readFileSync(OVERRIDES[0], 'utf8');

const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error(`overrides/main.html 裡找不到 ${re}`);
  return m[0];
};

const harness = `
  const window = { navigator: {} };
  ${grab(/^    var EVENTS = \[[\s\S]*?\n    \];/m)}
  ${grab(/^    var UTM = \[.*\];$/m)}
  ${grab(/^    var VALUE_RE = .*$/m)}
  ${grab(/^    function scrubUrl\(url\) \{[\s\S]*?\n    \}/m)}
  ${grab(/^    function coarseScreen\(screen\) \{[\s\S]*?\n    \}/m)}
  ${grab(/^    function scrubData\(data\) \{[\s\S]*?\n    \}/m)}
  ${grab(/^    window\.anoniBeforeSend = function \(type, payload\) \{[\s\S]*?\n    \};/m)}
  return { send: window.anoniBeforeSend, window, EVENTS, UTM, scrubUrl, coarseScreen, scrubData };
`;
const load = () => new Function(harness)();

let passed = 0;
const failures = [];
const check = async (label, fn) => {
  try { await fn(); passed += 1; console.log('  ✓ ' + label); }
  catch (err) { failures.push(`${label}\n    ${err.message}`); console.log('  ✗ ' + label); }
};

// 一個 pageview 長什麼樣，照 umami script.js 的 C() 組出來的形狀
const pageview = (url, extra = {}) => ({
  website: 'w', screen: '1920x1080', language: 'zh-TW', title: '標題',
  hostname: 'anoni.net', url, referrer: '', tag: 'abc1234', ...extra,
});

await check('讀者的搜尋詞不會被送出去（回報的那個外洩）', () => {
  const { send } = load();
  const out = send('event', pageview('/utils/leaks/?h=%E9%98%B2%E7%81%AB%E9%95%B7%E5%9F%8E&q=%E7%BF%BB%E7%89%86'));
  assert.equal(out.url, '/utils/leaks/');
  assert.ok(!/h=|q=/.test(out.url), `query 還在：${out.url}`);
});

await check('utm 活動參數留得下來，來源看得出是郵件還是社群', () => {
  const { send } = load();
  const out = send('event', pageview('/blog/x/?utm_source=newsletter&utm_medium=email&utm_campaign=gg2026'));
  assert.ok(out.url.includes('utm_source=newsletter'), out.url);
  assert.ok(out.url.includes('utm_medium=email'), out.url);
  assert.ok(out.url.includes('utm_campaign=gg2026'), out.url);
});

await check('utm_term 刻意擋掉，它在廣告場景裝的是關鍵字', () => {
  const { send } = load();
  const out = send('event', pageview('/x/?utm_source=a&utm_term=%E7%BF%BB%E7%89%86'));
  assert.ok(!out.url.includes('utm_term'), out.url);
  assert.ok(out.url.includes('utm_source=a'), out.url);
});

await check('utm 值過長就丟掉，外站塞不進一長串內容', () => {
  const { send } = load();
  const out = send('event', pageview('/x/?utm_campaign=' + 'A'.repeat(200)));
  assert.equal(out.url, '/x/');
});

await check('hash 一併清掉', () => {
  const { send } = load();
  assert.equal(send('event', pageview('/x/#%E7%A7%98%E5%AF%86')).url, '/x/');
  assert.equal(send('event', pageview('/x/?h=abc#frag')).url, '/x/');
});

await check('referrer 走同一套清洗，站內跳轉不會把上一頁的搜尋詞帶過來', () => {
  const { send } = load();
  const out = send('event', pageview('/b/', { referrer: '/a/?h=%E7%BF%BB%E7%89%86' }));
  assert.equal(out.referrer, '/a/');
});

await check('螢幕解析度捨去到百位', () => {
  const { send } = load();
  assert.equal(send('event', pageview('/x/')).screen, '1900x1000');
  assert.equal(send('event', pageview('/x/', { screen: '390x844' })).screen, '300x800');
  // 認不出來的格式原樣放行，寧可不動也不要弄出壞值
  assert.equal(send('event', pageview('/x/', { screen: 'weird' })).screen, 'weird');
});

await check('白名單外的事件整筆不送', () => {
  const { send } = load();
  assert.equal(send('event', pageview('/x/', { name: 'sneaky-event', data: { a: 'b' } })), null);
});

await check('白名單內的事件送得出去', () => {
  const { send } = load();
  const out = send('event', pageview('/x/', { name: 'qrread-kind', data: { group: 'credential' } }));
  assert.equal(out.name, 'qrread-kind');
  assert.deepEqual(out.data, { group: 'credential' });
});

await check('事件的值只收短列舉代號，夾帶內容的一律丟掉', () => {
  const { send } = load();
  const out = send('event', pageview('/x/', {
    name: 'stripmeta-ok',
    data: { kind: 'jpeg', name: '護照掃描.jpg', url: 'https://example.com/a?b=c' },
  }));
  assert.deepEqual(out.data, { kind: 'jpeg' }, '只該留下 kind');
});

await check('值全部不合格時 data 欄位整個拿掉，不送空物件', () => {
  const { send } = load();
  const out = send('event', pageview('/x/', { name: 'read-depth', data: { depth: '我的檔案.png' } }));
  assert.ok(!('data' in out), `data 不該存在：${JSON.stringify(out.data)}`);
});

await check('data 最多四個欄位', () => {
  const { send } = load();
  const out = send('event', pageview('/x/', {
    name: 'lang-switch', data: { a: 'x', b: 'x', c: 'x', d: 'x', e: 'x', f: 'x' },
  }));
  assert.equal(Object.keys(out.data).length, 4);
});

await check('pageview 不准夾帶 data', () => {
  const { send } = load();
  const out = send('event', pageview('/x/', { data: { secret: 'x' } }));
  assert.ok(!('data' in out), 'pageview 不該有 data');
});

await check('identify 整筆擋掉，讀者不會被標上持久識別', () => {
  const { send } = load();
  assert.equal(send('identify', pageview('/x/', { data: { userId: 'abc' } })), null);
});

await check('performance 放行，Web Vitals 收得到', () => {
  const { send } = load();
  const out = send('performance', pageview('/x/?h=%E7%BF%BB%E7%89%86', { lcp: 1200, cls: 0.02 }));
  assert.equal(out.lcp, 1200);
  assert.equal(out.url, '/x/', 'performance 的網址也要清洗');
});

await check('開了 Global Privacy Control 就一筆都不送', () => {
  const { send, window } = load();
  window.navigator.globalPrivacyControl = true;
  assert.equal(send('event', pageview('/x/')), null);
  assert.equal(send('performance', pageview('/x/')), null);
});

await check('壞掉的輸入不會讓它丟例外', () => {
  const { send } = load();
  assert.equal(send('event', null), null);
  assert.equal(send('event', 'string'), null);
  assert.doesNotThrow(() => send('event', pageview(undefined)));
});

await check('三個語系的 overrides 分析區塊逐位元組相同', () => {
  const blocks = OVERRIDES.map((f) => {
    const s = fs.readFileSync(f, 'utf8');
    const a = s.indexOf('<!-- anoni-analytics-start');
    const b = s.indexOf('<!-- anoni-analytics-end -->');
    assert.ok(a >= 0 && b > a, `${f} 少了 anoni-analytics 標記`);
    return s.slice(a, b);
  });
  assert.equal(blocks[1], blocks[0], 'overrides_cn 跟 overrides 不一致');
  assert.equal(blocks[2], blocks[0], 'overrides_en 跟 overrides 不一致');
});

if (failures.length) {
  console.log(`\n${passed} 通過，${failures.length} 失敗\n`);
  failures.forEach((f) => console.log('  ' + f));
  process.exit(1);
}
console.log(`\n${passed} 通過，0 失敗`);
