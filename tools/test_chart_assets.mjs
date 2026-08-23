#!/usr/bin/env node
/**
 * 圖表函式庫按需載入的守門測試。
 *
 * === 為什麼需要這支 ===
 *
 * vega、vega-lite、vega-embed 三個檔案加起來約 820 KB。放進 mkdocs.yml 的
 * extra_javascript 是官方建議的裝法，但那等於全站每一頁都載，而全站只有三頁畫圖表。
 *
 * 這件事沒有任何錯誤訊息，站台照樣建得起來、圖表照樣顯示，只是每個讀者在每一頁都
 * 付一次那 820 KB。乾淨連入時它會跟讀者點下去的下一頁搶頻寬。正因為沒有徵兆，
 * 日後照著 mkdocs-charts-plugin 的安裝說明「修好」設定是很自然的事，所以要有測試
 * 把當初的取捨記在這裡。
 *
 * 反過來也要守：圖表頁少了引用就變成空白區塊，那同樣不會有錯誤訊息。
 *
 * 用法：
 *   node tools/test_chart_assets.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const DOCS = path.join(ROOT, 'docs');
const CONFIGS = ['mkdocs.yml', 'mkdocs_en.yml', 'mkdocs_cn.yml'];
const SNIPPET = 'snippets/vega.md';

const read = (p) => fs.readFileSync(path.join(DOCS, p), 'utf8');
const mdFiles = (dir) => {
  const out = [];
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.md')) out.push(full);
    }
  };
  walk(path.join(DOCS, dir));
  return out;
};

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('三個設定檔都沒有把 vega 的 CDN 網址放回 extra_javascript', () => {
  // 放回去就是全站每一頁都載那 820 KB，而且不會有任何錯誤訊息
  for (const cfg of CONFIGS) {
    const text = read(cfg);
    const block = text.slice(text.indexOf('extra_javascript:'));
    const lines = block.split('\n').slice(1);
    const entries = [];
    for (const line of lines) {
      if (!line.startsWith('  - ')) break;
      entries.push(line.slice(4).trim());
    }
    assert.ok(entries.length, `${cfg} 的 extra_javascript 是空的`);
    for (const entry of entries) {
      assert.ok(!/cdn\.jsdelivr\.net.*vega/.test(entry),
                `${cfg} 又把 ${entry} 放進 extra_javascript 了`);
    }
  }
});

test('用來通過 plugin 相依檢查的那個檔案還在，檔名也還對', () => {
  // mkdocs-charts-plugin 的 on_config 用子字串比對，三個關鍵字缺一個就中止建置
  const shim = 'js/vega-vega-lite-vega-embed-ondemand.js';
  assert.ok(fs.existsSync(path.join(DOCS, 'zh-TW', shim)), `${shim} 不見了`);
  for (const dep of ['vega', 'vega-lite', 'vega-embed']) {
    assert.ok(shim.includes(dep), `檔名少了 ${dep}，plugin 的檢查會擋下建置`);
  }
  for (const cfg of CONFIGS) {
    assert.ok(read(cfg).includes(shim), `${cfg} 沒有引用 ${shim}`);
  }
  // 它只是為了通過檢查而存在，不該長出實際邏輯
  const body = read(path.join('zh-TW', shim))
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').trim();
  assert.equal(body, '', `${shim} 裡有程式碼，它應該只有註解`);
});

test('en 與 zh-CN 底下那個檔案是指向 zh-TW 的 symlink', () => {
  for (const lang of ['en', 'zh-CN']) {
    const p = path.join(DOCS, lang, 'js', 'vega-vega-lite-vega-embed-ondemand.js');
    assert.ok(fs.existsSync(p), `${lang} 少了那個檔案`);
    assert.ok(fs.lstatSync(p).isSymbolicLink(), `${lang} 的那一份不是 symlink，會變成兩份各自漂移`);
  }
});

test('snippet 引用三個函式庫，而且是 CDN 網址讓 privacy plugin 抓得到', () => {
  const snippet = read(SNIPPET);
  for (const dep of ['vega@5', 'vega-lite@5', 'vega-embed@6']) {
    assert.ok(snippet.includes(dep), `snippet 少了 ${dep}`);
  }
  // 寫本地路徑的話 privacy plugin 不會去抓，那三個檔案就不會出現在產物裡
  assert.ok(snippet.includes('https://cdn.jsdelivr.net/'), 'snippet 沒有用 CDN 網址');
});

test('每一頁有 vegalite 區塊的都引用了 snippet，反過來也成立', () => {
  // 少引用就是空白圖表區塊，多引用就是白載 820 KB，兩種都沒有錯誤訊息
  for (const lang of ['zh-TW', 'en', 'zh-CN']) {
    for (const file of mdFiles(lang)) {
      const text = fs.readFileSync(file, 'utf8');
      const hasChart = /```vegalite/.test(text);
      const hasSnippet = text.includes(SNIPPET);
      const rel = path.relative(DOCS, file);
      if (hasChart) assert.ok(hasSnippet, `${rel} 有圖表卻沒引用 snippet，圖會是空白的`);
      if (hasSnippet) assert.ok(hasChart, `${rel} 沒有圖表卻引用了 snippet，白載 820 KB`);
    }
  }
});

test('用得到圖表的頁面就是那幾頁，數量對得上', () => {
  const counts = {};
  for (const lang of ['zh-TW', 'en', 'zh-CN']) {
    counts[lang] = mdFiles(lang).filter((f) => /```vegalite/.test(fs.readFileSync(f, 'utf8'))).length;
  }
  for (const [lang, n] of Object.entries(counts)) {
    assert.equal(n, 3, `${lang} 有 ${n} 頁用圖表，預期 3 頁。多出來的頁面請一併確認有沒有引用 snippet`);
  }
});

// await 是必要的。原本寫 fn()，非同步的測試函式回一個 promise 就被當成通過，斷言
// 失敗變成 unhandled rejection，整支測試照樣印綠色。這個檔案是 ESM，頂層 await 可以
// 直接用。2026-08 在 test_qrread.mjs 先踩到一次，這裡是把同一個缺陷補齊。
for (const [name, fn] of tests) {
  try {
    await fn();
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
