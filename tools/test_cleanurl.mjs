#!/usr/bin/env node
/**
 * 網址清理器（docs/zh-TW/js/cleanurl.js）的單元測試。
 *
 * === 為什麼需要這支 ===
 *
 * 這種工具最容易出的錯不是漏刪，是多刪。把 `?v=` 從 YouTube 網址上拿掉、把 `?page=2`
 * 從分頁上拿掉，讀者拿到一個打不開或指向錯誤內容的網址，而且不會聯想到是清理工具
 * 弄壞的，只會覺得對方給錯連結。所以下面「必要參數要留著」那幾項比「追蹤參數要刪掉」
 * 更重要。
 *
 * 另一半是拆包裝。Google 與 Facebook 的外連會先繞自己家的伺服器，那層包裝本身就是
 * 追蹤。拆錯的話會把讀者導到錯的地方。
 *
 * === 怎麼驗 ===
 *
 * 跟這個 repo 其他幾支一樣，把純邏輯從原始碼原地抽出來，不重寫一份。
 *
 * 用法：
 *   node tools/test_cleanurl.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import { domainToUnicode } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'docs', 'zh-TW', 'js', 'cleanurl.js');
const src = fs.readFileSync(SRC, 'utf8');
const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error(`cleanurl.js 裡找不到 ${re}`);
  return m[0];
};

const harness = `
  ${grab(/^  const TRACKERS = \{[\s\S]*?\n  \};/m)}
  ${grab(/^  const TRACKER_PREFIXES = \[[\s\S]*?\n  \];/m)}
  ${grab(/^  function trackerOwner\(name\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  const WRAPPERS = \[[\s\S]*?\n  \];/m)}
  ${grab(/^  function unwrap\(url\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function clean\(input\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  const PUBLIC_SUFFIXES = new Set\(\[[\s\S]*?\n  \]\);/m)}
  ${grab(/^  const BRANDS = \[[\s\S]*?\n  \];/m)}
  ${grab(/^  const CONFUSABLE_CYRILLIC = new Set\(\[[^\n]*\]\);/m)}
  ${grab(/^  function punycodeDecode\(input\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function labelScripts\(label\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function hostFacts\(url\) \{[\s\S]*?\n  \}/m)}
  return { TRACKERS, trackerOwner, clean, hostFacts, punycodeDecode, BRANDS };
`;
const tool = new Function('URL', harness)(URL);

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

const cleaned = (input) => tool.clean(input).url;
const removedNames = (input) => tool.clean(input).removed.map((r) => r.name).sort();

test('必要參數一個都不能少', () => {
  // 這一項比刪追蹤參數更重要。刪錯了讀者拿到打不開的網址，而且不會怪到工具頭上。
  const keep = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://example.com/list?page=2',
    'https://example.com/search?q=tor&lang=zh-TW',
    'https://example.com/a?id=42&sort=desc',
    'https://example.com/?t=120&start=30',
    'https://example.com/api?token=abc&format=json',
  ];
  for (const url of keep) {
    assert.equal(cleaned(url), url, `${url} 被改壞了`);
  }
});

test('YouTube 的分享網址只掉 si，影片 ID 與時間留著', () => {
  assert.equal(
    cleaned('https://youtu.be/dQw4w9WgXcQ?si=AbCdEfGh&t=42'),
    'https://youtu.be/dQw4w9WgXcQ?t=42'
  );
});

test('utm 那一整組不管變體都認得出來', () => {
  const url = 'https://example.com/a?utm_source=newsletter&utm_medium=email' +
    '&utm_campaign=spring&utm_content=header&utm_term=tor&utm_weird=x';
  assert.equal(cleaned(url), 'https://example.com/a');
  // utm_weird 沒有列在名單裡，靠前綴比對抓到
  assert.ok(removedNames(url).includes('utm_weird'));
});

test('各家廣告平台的點擊識別碼', () => {
  for (const [param, owner] of [
    ['fbclid', 'meta'], ['gclid', 'google'], ['msclkid', 'microsoft'],
    ['twclid', 'x'], ['ttclid', 'tiktok'], ['igshid', 'meta'],
    ['mc_eid', 'mailchimp'], ['yclid', 'yandex'],
  ]) {
    const url = `https://example.com/a?${param}=xyz`;
    assert.equal(cleaned(url), 'https://example.com/a', `${param} 沒被拿掉`);
    assert.equal(tool.trackerOwner(param), owner, `${param} 歸錯了`);
  }
});

test('大小寫不同的參數名照樣認得出來', () => {
  assert.equal(cleaned('https://example.com/a?FBCLID=x&UTM_Source=y'), 'https://example.com/a');
});

test('拆掉 Google 搜尋結果的轉址包裝', () => {
  const wrapped = 'https://www.google.com/url?q=https%3A%2F%2Fanoni.net%2Fdocs%2F&sa=U&ved=xyz';
  const result = tool.clean(wrapped);
  assert.equal(result.url, 'https://anoni.net/docs/');
  assert.deepEqual(result.unwrapped, ['www.google.com']);
});

test('拆掉 Facebook 的外連包裝', () => {
  const wrapped = 'https://l.facebook.com/l.php?u=https%3A%2F%2Fanoni.net%2F&h=AbCd';
  assert.equal(tool.clean(wrapped).url, 'https://anoni.net/');
});

test('包在包裝裡的追蹤參數也要清掉', () => {
  const wrapped =
    'https://www.google.com/url?q=https%3A%2F%2Fexample.com%2Fa%3Futm_source%3Dgoogle%26id%3D7';
  const result = tool.clean(wrapped);
  assert.equal(result.url, 'https://example.com/a?id=7');
  assert.deepEqual(result.removed.map((r) => r.name), ['utm_source']);
});

test('疊了好幾層的包裝一路拆到底，但不會無限拆', () => {
  const inner = 'https://anoni.net/';
  const once = 'https://l.facebook.com/l.php?u=' + encodeURIComponent(inner);
  const twice = 'https://www.google.com/url?q=' + encodeURIComponent(once);
  const result = tool.clean(twice);
  assert.equal(result.url, inner);
  assert.equal(result.unwrapped.length, 2);
});

test('包裝參數裡不是合法網址就當它不是包裝', () => {
  const url = 'https://www.google.com/url?q=not-a-url';
  assert.equal(tool.clean(url).url, url);
});

test('片段與路徑原樣保留', () => {
  assert.equal(
    cleaned('https://example.com/a/b?utm_source=x#section-3'),
    'https://example.com/a/b#section-3'
  );
});

test('參數清光之後不留一個孤零零的問號', () => {
  assert.equal(cleaned('https://example.com/a?fbclid=x'), 'https://example.com/a');
  assert.equal(cleaned('https://example.com/a?fbclid=x#top'), 'https://example.com/a#top');
});

test('沒有追蹤參數就回報「不用改」', () => {
  const result = tool.clean('https://anoni.net/docs/');
  assert.equal(result.changed, false);
  assert.equal(result.removed.length, 0);
});

test('不是網址就說清楚，不要靜靜吐一個怪東西', () => {
  assert.deepEqual(tool.clean('這不是網址'), { ok: false, reason: 'invalid' });
  assert.deepEqual(tool.clean('example.com'), { ok: false, reason: 'invalid' });
});

test('只處理 http 與 https', () => {
  // javascript: 與 data: 進到這裡沒有意義，而且複製出去會是個危險的東西
  for (const url of ['javascript:alert(1)', 'data:text/html,x', 'file:///etc/passwd']) {
    assert.equal(tool.clean(url).reason, 'scheme', `${url} 應該被擋掉`);
  }
});

test('每個追蹤參數都說得出是誰在追', () => {
  // 只列參數名而不說明是誰，讀者學不到東西，那就只是一個黑盒子
  for (const [name, owner] of Object.entries(tool.TRACKERS)) {
    assert.ok(owner && typeof owner === 'string', `${name} 沒有標出處`);
  }
});

test('短網址不展開', () => {
  // 展開 t.co 要連上去，那會把讀者想清理的網址送到第三方伺服器
  assert.ok(!code.includes('fetch('), '出現了 fetch');
  assert.ok(!code.includes('XMLHttpRequest'), '出現了 XMLHttpRequest');
  const url = 'https://t.co/AbCdEf';
  assert.equal(tool.clean(url).url, url);
});

// await 是必要的。原本寫 fn()，非同步的測試函式回一個 promise 就被當成通過，斷言
// 失敗變成 unhandled rejection，整支測試照樣印綠色。這個檔案是 ESM，頂層 await 可以
// 直接用。2026-08 在 test_qrread.mjs 先踩到一次，這裡是把同一個缺陷補齊。

// ---------------------------------------------------------------------------
// 主機真身
//
// 釣魚網址的手法都在主機名上，而清理器原本只看參數。這裡守三件事：註冊網域抓對、
// 冒充的寫法要抓到、正常的網址不能被嚇。誤報比漏報更傷這一頁的可信度，所以「不該警告」
// 的案例跟「該警告」的一樣多。
// ---------------------------------------------------------------------------

const host = (input) => tool.clean(input).host;
const kinds = (input) => host(input).warnings.map((w) => w.kind).sort();

test('註冊網域：一般 .com 取最後兩段，com.tw 這類兩段式後綴多取一段', () => {
  assert.equal(host('https://www.google.com/').registrable, 'google.com');
  assert.equal(host('https://mail.example.com.tw/x').registrable, 'example.com.tw');
  assert.equal(host('https://news.bbc.co.uk/').registrable, 'bbc.co.uk');
  assert.equal(host('https://evil.github.io/login').registrable, 'evil.github.io');
  assert.equal(host('https://anoni.net/docs/').registrable, 'anoni.net');
  assert.equal(host('https://localhost/').registrable, 'localhost');
});

test('正常的網址不給任何警告', () => {
  for (const url of [
    'https://www.google.com/search?q=x',
    'https://accounts.google.com.tw/',
    'https://www.paypal.com/signin',
    'https://line.me/ti/p/abc',
    'https://onlinegame.com/',       // line 是常用字，不在品牌表裡
    'https://anoni.net/docs/',
    'https://xn--kpry57d.tw/',       // 台灣.tw，純中文的 IDN 是正常用法
  ]) {
    const warns = kinds(url).filter((k) => k !== 'idn');
    assert.deepEqual(warns, [], `${url} 被警告了：${warns}`);
  }
});

test('品牌只出現在子網域時要指出真正的註冊網域', () => {
  const facts = host('https://google.com.evil.tw/login');
  assert.equal(facts.registrable, 'evil.tw');
  assert.ok(facts.warnings.some((w) => w.kind === 'brandSubdomain' && w.detail === 'google'));
  // 品牌自己的子網域不算
  assert.ok(!host('https://mail.google.com/').warnings.some((w) => w.kind === 'brandSubdomain'));
});

test('品牌旁邊加字的冒充網域', () => {
  assert.ok(host('https://paypal-secure.com/').warnings.some((w) => w.kind === 'brandLookalike' && w.detail === 'paypal'));
  assert.ok(host('https://login.apple-id-verify.net/').warnings.some((w) => w.kind === 'brandLookalike' && w.detail === 'apple'));
  // 品牌名黏在別的字母裡不算，那多半是別的字
  assert.ok(!host('https://pineapple.com/').warnings.some((w) => w.kind === 'brandLookalike'));
});

test('@ 前面的假主機', () => {
  const facts = host('https://google.com@evil.tw/');
  assert.equal(facts.registrable, 'evil.tw');
  assert.ok(facts.warnings.some((w) => w.kind === 'userinfo' && w.detail === 'google.com'));
});

test('IP 位址、非預設連接埠、沒加密的 http', () => {
  assert.deepEqual(kinds('http://203.0.113.5/login'), ['http', 'ip']);
  assert.deepEqual(kinds('https://example.com:8443/'), ['port']);
  assert.deepEqual(kinds('http://example.com/'), ['http']);
});

test('punycode 解碼跟 Node 的實作一致', () => {
  for (const label of ['xn--pple-43d', 'xn--80ak6aa92e', 'xn--kpry57d', 'xn--fiqs8s', 'xn--mnchen-3ya', 'xn--bcher-kva']) {
    assert.equal(tool.punycodeDecode(label.slice(4)), domainToUnicode(label), `${label} 解錯了`);
  }
  // 分隔號之前是照抄的 ASCII，之後才是編碼。沒有分隔號的話整段都是編碼，'abc' 會解成別的東西，那是規格的行為
  assert.equal(tool.punycodeDecode('abc-'), 'abc', '分隔號前的 ASCII 要照抄');
  assert.equal(tool.punycodeDecode('!!!'), null, '不是合法數字的字元要回 null，不要丟例外也不要亂解');
  assert.equal(tool.punycodeDecode('a-!'), null);
});

test('IDN 混用字母系統：西里爾 а 混在拉丁字母裡', () => {
  const facts = host('https://xn--pple-43d.com/');
  assert.equal(facts.display, domainToUnicode('xn--pple-43d.com'));
  assert.ok(facts.warnings.some((w) => w.kind === 'mixedScript'), `沒有抓到混用：${kinds('https://xn--pple-43d.com/')}`);
  assert.ok(facts.warnings.some((w) => w.kind === 'idn'));
});

test('IDN 整段都是長得像拉丁字母的西里爾字母（2017 年的 аррӏе.com）', () => {
  const facts = host('https://xn--80ak6aa92e.com/');
  assert.equal(facts.display, domainToUnicode('xn--80ak6aa92e.com'));
  assert.ok(facts.warnings.some((w) => w.kind === 'wholeScript'), `沒有抓到整段冒充：${kinds('https://xn--80ak6aa92e.com/')}`);
  assert.ok(!facts.warnings.some((w) => w.kind === 'mixedScript'));
});

test('IDN 顯示形式給讀者看，純中文網域只有說明沒有警告', () => {
  const facts = host('https://xn--kpry57d.tw/');
  assert.equal(facts.display, '台灣.tw');
  assert.equal(facts.registrableDisplay, '台灣.tw');
  assert.deepEqual(kinds('https://xn--kpry57d.tw/'), ['idn']);
});

test('主機真身跟著乾淨網址一起回，拆包裝之後看的是目的地的主機', () => {
  const result = tool.clean('https://www.google.com/url?q=https%3A%2F%2Fgoogle.com.evil.tw%2Fx&sa=U');
  assert.equal(result.host.registrable, 'evil.tw');
  assert.ok(result.host.warnings.some((w) => w.kind === 'brandSubdomain'));
});

test('每一種警告三個語系都有文案', () => {
  const strings = new Function(`${src.match(/^  const STRINGS = \{[\s\S]*?\n  \};/m)[0]}\n return STRINGS;`)();
  const kindsAll = ['userinfo', 'port', 'http', 'ip', 'idn', 'mixedScript', 'wholeScript', 'brandSubdomain', 'brandLookalike'];
  for (const lang of ['zh-TW', 'zh', 'en']) {
    for (const kind of kindsAll) {
      assert.ok(strings[lang].hostWarnings[kind], `${lang} 少了 ${kind} 的文案`);
    }
    assert.ok(strings[lang].hostTitle && strings[lang].hostFull && strings[lang].hostNote);
  }
});

test('品牌表裡沒有太短或本身是常用字的名字', () => {
  for (const brand of tool.BRANDS) {
    assert.ok(brand.length >= 5, `${brand} 太短，會誤報`);
    assert.ok(!['line', 'post', 'gov', 'meta', 'bank', 'mail'].includes(brand));
  }
});


for (const [name, fn] of tests) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed += 1;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message.split('\n').slice(0, 4).join('\n    ')}`);
    failed += 1;
  }
}
console.log(`\n${passed} 通過，${failed} 失敗`);
process.exit(failed ? 1 : 0);
