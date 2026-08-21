#!/usr/bin/env node
/**
 * 隱形字元偵測（docs/zh-TW/js/invisible.js）的單元測試。
 *
 * === 為什麼需要這支 ===
 *
 * 這一支的難處全在誤判。ZWJ 在 emoji 裡是正常的組字元件（👨‍👩‍👧 就是三個 emoji 用兩個
 * ZWJ 接起來的），變體選擇器是 emoji 的一部分，RTL 標記在阿拉伯文與希伯來文裡本來就
 * 該有，而西里爾字母的 а 出現在一整段俄文裡就只是俄文。全部報成可疑的話，這個工具
 * 會變成狼來了，讀者看幾次之後就不看了。
 *
 * 反過來漏報也糟：零寬字元組合是文件外流追蹤的實際手法，漏掉那個就是漏掉這支存在的
 * 理由。所以下面兩組案例一樣重要，一組驗抓得到，一組驗不亂抓。
 *
 * === 怎麼驗 ===
 *
 * 跟這個 repo 其他幾支一樣，把純邏輯從原始碼原地抽出來，不重寫一份。測試裡的隱形
 * 字元也一律用跳脫寫法，直接放字元的話這個檔案自己被編輯器清理過就會靜靜失效。
 *
 * 用法：
 *   node tools/test_invisible.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'docs', 'zh-TW', 'js', 'invisible.js');
const src = fs.readFileSync(SRC, 'utf8');
const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error(`invisible.js 裡找不到 ${re}`);
  return m[0];
};

const harness = `
  ${grab(/^  const HIDDEN = \{[\s\S]*?\n  \};/m)}
  ${grab(/^  const BIDI = \{[\s\S]*?\n  \};/m)}
  ${grab(/^  const HOMOGLYPHS = \{[\s\S]*?\n  \};/m)}
  ${grab(/^  function isEmojiLike\(code\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function scan\(text\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function homoglyphVerdict\(text, findings\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function strip\(text\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function stripSuspect\(text\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  const SAMPLES = \{[\s\S]*?\n  \};/m)}
  return { HIDDEN, BIDI, HOMOGLYPHS, isEmojiLike, scan, homoglyphVerdict, strip, stripSuspect, SAMPLES };
`;
const tool = new Function(harness)();

const ZWSP = '​';
const ZWJ = '‍';
const ZWNJ = '‌';
const BOM = '﻿';
const RLO = '‮';
const PDF = '‬';
const RLM = '‏';
const VS16 = '️';
const TAG_A = '\u{E0061}';

const kinds = (text) => tool.scan(text).map((f) => f.kind);
const suspects = (text) => tool.scan(text).filter((f) => f.level === 'suspect').map((f) => f.kind);

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// --- 抓得到 ---

test('零寬空格藏在字裡面', () => {
  // 文件外流追蹤的實際手法：每個人拿到的副本插入不同的組合
  assert.deepEqual(kinds(`機密${ZWSP}文件`), ['zwsp']);
  const many = `a${ZWSP}b${ZWSP}${ZWSP}c`;
  assert.equal(tool.scan(many).length, 3);
});

test('位置對得上讀者看到的字', () => {
  assert.deepEqual(tool.scan(`ab${ZWSP}c`).map((f) => f.index), [2]);
  // emoji 佔一個位置，不會被拆成兩半
  assert.deepEqual(tool.scan(`😀${ZWSP}x`).map((f) => f.index), [1]);
});

test('BOM 出現在文字中間', () => {
  assert.deepEqual(kinds(`前${BOM}後`), ['bom']);
});

test('方向覆寫（Trojan Source 那一類）', () => {
  // 程式碼裡放這個，人看到的順序跟編譯器讀到的不一樣
  assert.deepEqual(suspects(`if (admin${RLO}) {${PDF}`), ['rlo', 'pdf']);
});

test('標籤字元，整段隱藏訊息可以編碼在裡面', () => {
  assert.deepEqual(kinds(`hello${TAG_A}`), ['tag']);
});

test('混在拉丁字母裡的同形字', () => {
  // 釣魚網址最常用的手法，а 是西里爾字母
  const fake = 'https://аpple.com';
  const found = tool.scan(fake);
  assert.deepEqual(found.map((f) => f.kind), ['homoglyph']);
  assert.equal(found[0].looksLike, 'a');
  assert.equal(tool.homoglyphVerdict(fake, found), 'mixed');
});

// --- 不亂抓 ---

test('emoji 家族裡的 ZWJ 是正常的組字元件', () => {
  // 👨‍👩‍👧 是三個 emoji 用兩個 ZWJ 接起來的，報成可疑就是狼來了
  const family = `\u{1F468}${ZWJ}\u{1F469}${ZWJ}\u{1F467}`;
  assert.deepEqual(tool.scan(family), []);
});

test('中文字中間的 ZWJ 不是組字，要報', () => {
  assert.deepEqual(suspects(`機${ZWJ}密`), ['zwj']);
});

test('emoji 後面的變體選擇器是正常的', () => {
  assert.deepEqual(tool.scan(`❤${VS16}`), []);
  // 接在一般文字後面就不正常
  assert.deepEqual(kinds(`a${VS16}`), ['variation']);
});

test('阿拉伯文裡的方向標記是正常的', () => {
  const arabic = `مرحبا${RLM} anoni`;
  const found = tool.scan(arabic);
  assert.equal(found.length, 1);
  assert.equal(found[0].level, 'context', '有 RTL 文字時方向標記不該報成可疑');
});

test('沒有 RTL 文字的段落裡出現方向標記才可疑', () => {
  assert.deepEqual(suspects(`hello${RLM}world`), ['rlm']);
});

test('整段俄文裡的西里爾字母只是俄文', () => {
  const russian = 'Привет, как дела';
  assert.equal(tool.homoglyphVerdict(russian, tool.scan(russian)), 'script');
});

test('乾淨的文字什麼都不報', () => {
  for (const text of [
    '這是一段正常的中文，含標點。',
    'A perfectly ordinary English sentence.',
    'emoji 也可以 😀🎉 混在裡面',
    '日本語のテキストも問題ない',
    '한국어도 마찬가지',
  ]) {
    assert.deepEqual(tool.scan(text), [], `誤判了：${text}`);
  }
});

// --- 清理 ---

test('清掉所有看不見的字元，可見的字一個不動', () => {
  const dirty = `機${ZWSP}密${ZWJ}文${BOM}件${RLM}`;
  assert.equal(tool.strip(dirty), '機密文件');
});

test('同形字不自動換掉', () => {
  // 那是可見的字，換掉會改變原意，而讀者可能正在處理一段真的俄文
  const text = 'аpple';
  assert.equal(tool.strip(text), text);
});

test('只清可疑的那些時，emoji 保持完整', () => {
  const family = `\u{1F468}${ZWJ}\u{1F469}`;
  const text = `${family}${ZWSP}好`;
  assert.equal(tool.stripSuspect(text), `${family}好`);
  // 全部清掉的版本會把 emoji 拆散，所以兩種都要有
  assert.notEqual(tool.strip(text), `${family}好`);
});

test('清理過的文字再掃一次是乾淨的', () => {
  const dirty = `a${ZWSP}b${ZWNJ}c${BOM}d${TAG_A}`;
  assert.deepEqual(tool.scan(tool.strip(dirty)), []);
});

// --- 這一頁的自我約束 ---

test('沒有任何網路請求，也不寫進儲存', () => {
  // 讀者貼進來的可能正是他不想外流的東西
  for (const needle of ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket',
                        'localStorage', 'sessionStorage', 'indexedDB', 'document.cookie']) {
    assert.ok(!code.includes(needle), `出現了 ${needle}`);
  }
});

test('字元表用跳脫寫法，不放裸字元', () => {
  // 直接放字元的話，任何一次複製貼上或編輯器清理都可能把它們吃掉，
  // 而吃掉之後這份表看起來完全正常
  const table = src.match(/const HIDDEN = \{[\s\S]*?\n  \};/)[0];
  assert.ok(table.includes('\\u200B'), '零寬空格要寫成跳脫');
  assert.ok(!/[​-‏⁠﻿]/.test(table), '表裡出現了裸的隱形字元');
});

test('示範文字三個語系都有，而且三類東西都在裡面', () => {
  // 讀者手邊多半沒有帶標記的文字，這一段是他唯一看得到偵測結果的機會。
  // 少了哪一類，那一類的說明在頁面上就沒有對應的畫面。
  const langs = Object.keys(tool.SAMPLES).sort();
  assert.deepEqual(langs, ['en', 'zh', 'zh-TW'], `語系是 ${langs}`);
  for (const [lang, text] of Object.entries(tool.SAMPLES)) {
    const kinds = {};
    for (const f of tool.scan(text)) kinds[f.kind] = (kinds[f.kind] || 0) + 1;
    assert.ok(kinds.zwsp >= 2, `${lang} 的示範少了零寬空格`);
    assert.ok(kinds.homoglyph >= 1, `${lang} 的示範少了同形字`);
    assert.ok(kinds.tag >= 4, `${lang} 的示範少了標籤字元`);
  }
});

test('示範文字清完只剩同形字，那是刻意留的', () => {
  // strip 不換同形字：那是可見的字，換掉會改變原意，讀者可能正在處理一段真的俄文。
  // 示範文字正好讓這個設計在畫面上看得到，所以順便釘住它。
  for (const [lang, text] of Object.entries(tool.SAMPLES)) {
    const left = tool.scan(tool.strip(text));
    assert.ok(left.length > 0, `${lang} 的示範清完連同形字都沒了`);
    assert.ok(left.every((f) => f.kind === 'homoglyph'),
              `${lang} 的示範清完還剩 ${left.map((f) => f.kind).join('、')}`);
  }
});

test('這一頁不提供把標記放進讀者文字的功能', () => {
  // 立場寫在 utils/invisible.md 的「教偵測，不教植入」。示範是固定的一段，
  // 不接受外部輸入，也沒有反方向的函式。
  const from = code.indexOf('const SAMPLES');
  const block = code.slice(from, code.indexOf('const state =', from));
  assert.ok(!/state\.input|function |=>/.test(block), 'SAMPLES 那一段有可執行的東西');
  for (const needle of ['function insert', 'function mark', 'function embed', 'addMarking', 'function taint']) {
    assert.ok(!code.includes(needle), `出現了 ${needle}，這一頁不做植入`);
  }
});

for (const [name, fn] of tests) {
  try {
    fn();
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
