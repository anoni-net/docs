#!/usr/bin/env node
/**
 * 斷網應變卡（docs/zh-TW/js/shutdown-card.js）在真的瀏覽器裡的行為檢查。
 *
 * === 為什麼這一支要開瀏覽器 ===
 *
 * tools/test_shutdown_card.mjs 把純邏輯原地抽出來測，那守得住序列化與儲存的決策，
 * 守不住兩件只在瀏覽器裡才成立的事：
 *
 * 1. 儲存模式的開關真的把資料寫到使用者選的那一邊。單元測試餵的是替身，替身照著
 *    storagePlan 走一定是對的，真正會出錯的是接線：radio 換了、state.mode 沒跟著
 *    改、或是某次重繪之後 saveDraft 沒被呼叫到。畫面上完全正常
 * 2. 列印版面。全站只有這一頁有 @media print，而列印的結果沒有任何程式讀得到，
 *    只有把媒體切成 print 再去量 computed style 才驗得到。印出來才發現站台的頁首
 *    佔掉半張紙、或是四張卡只出現一張，那時紙已經印掉了
 *
 * === 驗的是真東西 ===
 *
 * 載入的是真的 shutdown-card.js，只有頁面外殼是這裡搭的：一個 lang 屬性、一個假的
 * .md-header（用來驗列印時整站的東西都被藏起來）、一個工具要掛的容器。
 *
 * 三個語系各跑一輪。介面文字看 document.documentElement.lang，zh-CN 版那個值是
 * "zh"，跟其他兩個語系走同一條路徑但不同的文案分支。
 *
 * 用法：
 *   node tools/check_shutdown_card.mjs
 * 有問題時 exit 1。沒有 google-chrome 時跳過並回 0，本機沒裝不會擋人。
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'docs', 'zh-TW', 'js', 'shutdown-card.js');
const PORT_CDP = 9457;
const KEY = 'anoni-shutdown-card-draft';
const LANGS = ['zh-TW', 'zh', 'en'];

try {
  execSync('command -v google-chrome', { stdio: 'ignore' });
} catch {
  console.log('找不到 google-chrome，跳過斷網應變卡的瀏覽器檢查');
  process.exit(0);
}

// 頁面外殼。.md-header 是站台頁首的替身，列印時它要跟著被藏起來，
// 那條規則寫的是 body *，只驗工具自己的元素驗不到它有沒有波及整頁。
const page = (lang) => `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"></head>
<body>
<header class="md-header">站台頁首</header>
<div class="md-content"><div id="shutdown-card-tool"></div></div>
<script src="/shutdown-card.js"></script>
</body></html>`;

const srv = http.createServer((req, res) => {
  if (req.url.startsWith('/shutdown-card.js')) {
    res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' });
    res.end(fs.readFileSync(SRC));
    return;
  }
  const lang = new URL(req.url, 'http://x').searchParams.get('lang') || 'zh-TW';
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(page(lang));
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${srv.address().port}`;

const prof = fs.mkdtempSync(path.join('/tmp', 'chrome-card-'));
const chrome = spawn('google-chrome', ['--headless=new', '--no-sandbox', '--disable-gpu',
  '--disable-dev-shm-usage', `--remote-debugging-port=${PORT_CDP}`,
  `--user-data-dir=${prof}`, 'about:blank'], { stdio: 'ignore' });
process.on('exit', () => {
  try { chrome.kill(); } catch { /* 收掉就好 */ }
  try { srv.close(); } catch { /* 同上 */ }
});

let wsUrl;
for (let i = 0; i < 80 && !wsUrl; i += 1) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT_CDP}/json/list`)).json();
    wsUrl = list.find((x) => x.type === 'page')?.webSocketDebuggerUrl;
  } catch { /* 還沒起來 */ }
  if (!wsUrl) await new Promise((r) => setTimeout(r, 250));
}
if (!wsUrl) {
  console.error('Chrome 沒起來');
  process.exit(1);
}

const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pend = new Map();
const errs = [];
ws.addEventListener('message', (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pend.has(d.id)) { pend.get(d.id)(d.result); pend.delete(d.id); }
  if (d.method === 'Runtime.exceptionThrown') {
    errs.push((d.params.exceptionDetails.exception?.description || '').slice(0, 200));
  }
});
const send = (method, params = {}) => new Promise((r) => {
  const i = ++id;
  pend.set(i, r);
  ws.send(JSON.stringify({ id: i, method, params }));
});
const ev = async (expression) =>
  (await send('Runtime.evaluate', { expression, returnByValue: true })).result?.value;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await send('Runtime.enable');

let passed = 0;
let failed = 0;
const check = (name, ok, extra) => {
  if (ok) { console.log(`  ✓ ${name}`); passed += 1; return; }
  console.log(`  ✗ ${name}${extra === undefined ? '' : '  ' + JSON.stringify(extra)}`);
  failed += 1;
};

const statusTexts = [];

for (const lang of LANGS) {
  console.log(`\n[${lang}]`);
  await send('Page.navigate', { url: `${base}/?lang=${lang}` });
  await sleep(500);
  await ev(`window.KEY = ${JSON.stringify(KEY)}; localStorage.setItem('other-key', '1');`);

  check('表單畫得出來',
    await ev(`document.querySelectorAll('#shutdown-card-tool input[type=text]').length >= 12`),
    await ev(`document.querySelectorAll('#shutdown-card-tool input[type=text]').length`));
  check('狀態列常駐並且說得出目前是哪一態',
    await ev(`!!document.querySelector('#shutdown-card-tool .sc-status p').textContent.trim()`));
  check('確認本人那一欄的敏感提示常駐',
    await ev(`!!document.querySelector('#shutdown-card-tool .sc-sensitive')`));
  statusTexts.push(await ev(`document.querySelector('#shutdown-card-tool .sc-status p').textContent`));

  // 填一位聯絡人，兩個管道都填通訊軟體
  await ev(`(() => {
    const set = (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); };
    const boxes = [...document.querySelectorAll('#shutdown-card-tool input[type=text]')];
    set(boxes[0], 'CHECK-LABEL');
    set(boxes[2], 'CHECK-NAME'); set(boxes[3], 'Signal'); set(boxes[4], 'Telegram');
    return true;
  })()`);
  await sleep(120);

  check('預覽跟著輸入更新',
    await ev(`document.querySelector('#shutdown-card-tool .sc-preview').textContent.includes('CHECK-NAME')`));
  check('兩個管道都需要網路時提醒得出來',
    await ev(`document.querySelectorAll('#shutdown-card-tool .sc-warn').length >= 1`));
  check('列印容器是四張內容相同的卡', await ev(`(() => {
    const cards = [...document.querySelectorAll('#shutdown-card-tool .sc-card')];
    const preview = document.querySelector('#shutdown-card-tool .sc-preview').textContent;
    return cards.length === 4
      && new Set(cards.map((c) => c.textContent)).size === 1
      && cards[0].textContent === preview;
  })()`), await ev(`document.querySelectorAll('#shutdown-card-tool .sc-card').length`));

  check('預設把草稿寫進 sessionStorage，另一邊不碰',
    await ev(`!!sessionStorage.getItem(KEY) && !localStorage.getItem(KEY)`),
    await ev(`[Object.keys(sessionStorage), Object.keys(localStorage)]`));

  const pick = (n) => ev(`(() => {
    const r = [...document.querySelectorAll('#shutdown-card-tool input[name=sc-mode]')];
    r[${n}].checked = true;
    r[${n}].dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);

  await pick(1);
  await sleep(120);
  check('選了保留在裝置上之後改寫 localStorage，並清掉前一邊',
    await ev(`!!localStorage.getItem(KEY) && !sessionStorage.getItem(KEY)`),
    await ev(`[Object.keys(sessionStorage), Object.keys(localStorage)]`));

  await pick(2);
  await sleep(120);
  check('選了完全不暫存之後兩邊都沒有草稿',
    await ev(`!localStorage.getItem(KEY) && !sessionStorage.getItem(KEY)`));

  await pick(0);
  await sleep(120);
  await ev(`document.querySelector('#shutdown-card-tool .sc-status button').click()`);
  await sleep(150);
  check('清除之後草稿與表單都空了', await ev(`!sessionStorage.getItem(KEY) && !localStorage.getItem(KEY)
    && !document.querySelector('#shutdown-card-tool input[type=text]').value`));
  check('清除沒有動到同一個網域底下別人的 key',
    await ev(`localStorage.getItem('other-key') === '1'`));

  // 列印版面。切成 print 媒體再量 computed style，這是唯一驗得到的方式
  await ev(`(() => {
    const box = document.querySelector('#shutdown-card-tool input[type=text]');
    box.value = 'PRINT-CHECK';
    box.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  await sleep(120);
  await send('Emulation.setEmulatedMedia', { media: 'print' });
  await sleep(120);
  check('列印時四張卡看得見並排成兩欄', await ev(`(() => {
    const s = getComputedStyle(document.querySelector('#shutdown-card-tool .sc-print'));
    return s.display === 'grid' && s.visibility === 'visible'
      && s.gridTemplateColumns.split(' ').length === 2;
  })()`));
  check('列印時表單本身不上紙',
    await ev(`getComputedStyle(document.querySelector('#shutdown-card-tool fieldset')).visibility === 'hidden'`));
  check('列印時站台的頁首不上紙',
    await ev(`getComputedStyle(document.querySelector('.md-header')).visibility === 'hidden'`));
  await send('Emulation.setEmulatedMedia', { media: '' });
}

check('三個語系的狀態列文案各不相同', new Set(statusTexts).size === 3, statusTexts);
check('全程沒有未處理的例外', errs.length === 0, errs);

console.log(`\n${passed} 通過，${failed} 失敗`);
process.exit(failed ? 1 : 0);
