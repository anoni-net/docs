#!/usr/bin/env node
/**
 * 第三方元件的標示與授權檔守門測試。
 *
 * === 為什麼需要這支 ===
 *
 * MIT 與 Apache-2.0 都要求散布時附上授權。檔案少一份、表格漏一列、頁面連錯路徑，
 * 站台照樣建得起來，沒有任何錯誤訊息，只有授權沒有被履行。
 *
 * 這件事在加新元件的時候特別容易漏：把 .js 放進 vendor、在頁面上引用，工具就會動了，
 * 而登記與授權那兩步不做也不會有人發現。
 *
 * 用法：
 *   node tools/test_vendor_attribution.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.join(HERE, '..', 'docs');
const VENDOR = path.join(DOCS, 'zh-TW', 'utils', 'vendor');
const LANGS = ['zh-TW', 'zh-CN', 'en'];

const read = (p) => fs.readFileSync(p, 'utf8');

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// vendor 目錄裡的每一個 .js 都是第三方元件
const vendorScripts = fs.readdirSync(VENDOR).filter((f) => f.endsWith('.js'));

test('vendor 目錄裡的每一支程式都被頁面引用，沒有孤兒檔案', () => {
  // 留著沒人用的第三方程式會被一起部署，也會進讀者的離線副本
  const pages = fs.readdirSync(path.join(DOCS, 'zh-TW', 'utils'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => read(path.join(DOCS, 'zh-TW', 'utils', f)))
    .join('\n');
  for (const script of vendorScripts) {
    assert.ok(pages.includes(script), `vendor/${script} 沒有任何頁面引用它`);
  }
});

test('每一支第三方程式的授權文字都拿得到', () => {
  // 要嘛檔案自己帶版權標頭，要嘛旁邊有一份授權檔，兩者都沒有就是沒有履行授權
  for (const script of vendorScripts) {
    const body = read(path.join(VENDOR, script));
    const inline = /copyright/i.test(body.slice(0, 4000));
    const base = script.replace(/\.min\.js$|\.js$/, '');
    const licence = fs.existsSync(path.join(VENDOR, base + '-LICENSE.txt'));
    assert.ok(inline || licence,
      `${script} 既沒有內嵌版權標頭，也沒有 ${base}-LICENSE.txt`);
  }
});

test('小工具首頁列出了每一支第三方程式', () => {
  // 散在各頁的說明讀者要一頁一頁翻，集中的那一份才是能查的
  for (const lang of LANGS) {
    const index = read(path.join(DOCS, lang, 'utils', 'index.md'));
    for (const script of vendorScripts) {
      const name = script.replace(/\.min\.js$|\.js$/, '');
      assert.ok(index.includes(name), `${lang} 的 index.md 沒有列出 ${name}`);
    }
    // 詞表是資料不是程式，一樣要標
    assert.ok(index.includes('asian-diceware'), `${lang} 的 index.md 沒有列出詞表`);
  }
});

test('首頁那份表格連到的授權檔案真的存在', () => {
  for (const lang of LANGS) {
    const index = read(path.join(DOCS, lang, 'utils', 'index.md'));
    const links = [...index.matchAll(/\]\((vendor\/[^)]+)\)/g)].map((m) => m[1]);
    assert.ok(links.length >= 3, `${lang} 的 index.md 只有 ${links.length} 個 vendor 連結`);
    for (const link of links) {
      const target = path.join(DOCS, 'zh-TW', 'utils', link);
      assert.ok(fs.existsSync(target), `${lang} 的 index.md 連到 ${link}，但檔案不存在`);
    }
  }
});

test('授權檔不是空的', () => {
  for (const f of fs.readdirSync(VENDOR).filter((x) => x.includes('LICENSE'))) {
    const size = fs.statSync(path.join(VENDOR, f)).size;
    assert.ok(size > 500, `${f} 只有 ${size} 位元組，不像一份完整的授權`);
  }
});

test('vendor 的 README 把每一支都登記了', () => {
  const readme = read(path.join(VENDOR, 'README.md'));
  for (const script of vendorScripts) {
    assert.ok(readme.includes(script), `vendor/README.md 沒有登記 ${script}`);
  }
});

test('三個語系的表格列出一樣多的元件', () => {
  // 少一列的那個語系，讀者就查不到那一項
  const counts = LANGS.map((lang) => {
    const index = read(path.join(DOCS, lang, 'utils', 'index.md'));
    return [...index.matchAll(/\]\(vendor\/[^)]+\)/g)].length;
  });
  assert.equal(new Set(counts).size, 1, `三個語系的 vendor 連結數不同：${counts}`);
});

test('三個語系的 vendor 目錄內容一致', () => {
  // 這一項是踩過才加的：pdf-lib 只放進 zh-TW，en 與 zh-CN 的 PDF 功能在正式站
  // 是壞的（script 404），而三語系建置全部通過、測試也全綠，因為端對端測試
  // 只跑了 zh-TW。少一個檔案不會有任何錯誤訊息。
  const base = fs.readdirSync(VENDOR).filter((f) => !f.endsWith('.md')).sort();
  for (const lang of ['en', 'zh-CN']) {
    const dir = path.join(DOCS, lang, 'utils', 'vendor');
    assert.ok(fs.existsSync(dir), `${lang} 沒有 vendor 目錄`);
    const here = fs.readdirSync(dir).sort();
    assert.deepEqual(here, base,
      `${lang} 的 vendor 少了：${base.filter((f) => !here.includes(f)).join('、') || '（無）'}`);
  }
});

test('其他語系的 vendor 檔案是指向 zh-TW 的 symlink', () => {
  // 複製一份的話兩邊會各自漂移，換版時只更新一邊不會有人發現
  for (const lang of ['en', 'zh-CN']) {
    const dir = path.join(DOCS, lang, 'utils', 'vendor');
    for (const f of fs.readdirSync(dir)) {
      assert.ok(fs.lstatSync(path.join(dir, f)).isSymbolicLink(),
        `${lang}/utils/vendor/${f} 是實體檔案，應該是 symlink`);
      assert.ok(fs.existsSync(path.join(dir, f)), `${lang}/utils/vendor/${f} 這個 symlink 指到不存在的地方`);
    }
  }
});

test('每一頁引用的 vendor 檔案在自己的語系底下都找得到', () => {
  // 頁面寫的是相對路徑，檔案要在同語系的 vendor 底下才連得到
  for (const lang of LANGS) {
    const dir = path.join(DOCS, lang, 'utils');
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const text = read(path.join(dir, file));
      for (const m of text.matchAll(/(?:src="|\]\()\.{0,2}\/?vendor\/([^"')]+)/g)) {
        const target = path.join(dir, 'vendor', m[1]);
        assert.ok(fs.existsSync(target),
          `${lang}/utils/${file} 引用 vendor/${m[1]}，但那個語系底下沒有這個檔案`);
      }
    }
  }
});

for (const [name, fn] of tests) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed += 1;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message.split('\n').slice(0, 3).join('\n    ')}`);
    failed += 1;
  }
}
console.log(`\n${passed} 通過，${failed} 失敗`);
process.exit(failed ? 1 : 0);
