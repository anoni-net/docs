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

// 頁面外殼。這裡照抄 mkdocs-material 的祖先鏈（body > .md-container > .md-main >
// .md-main__inner > .md-content > article.md-content__inner > 工具），因為列印那組
// 規則就是沿著這條路徑一層一層把旁邊的東西關掉的，鏈少一層就驗不到它有沒有生效。
//
// 長內容那一段是必要的。空白頁那個 bug 的樣子是「第一張紙有四張卡、後面跟著五六
// 張空白」，成因是原本用 visibility: hidden 把東西藏起來，版面高度還留著。文章
// 短的話高度本來就不到一頁，改壞了也看不出來。
const FILLER = Array.from({ length: 60 }, (_, i) =>
  `<p>第 ${i + 1} 段內文，用來把文章撐到好幾頁高，列印時這一段不該出現在紙上。</p>`).join('\n');

const page = (lang) => `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"></head>
<body>
<header class="md-header">站台頁首</header>
<div class="md-container"><main class="md-main"><div class="md-main__inner md-grid">
<div class="md-sidebar">側欄</div>
<div class="md-content"><article class="md-content__inner md-typeset">
<h1>斷網應變卡</h1>
<div id="shutdown-card-tool"></div>
<script src="/shutdown-card.js"></script>
${FILLER}
</article></div>
</div></main></div>
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
  // 桌機也要 16px。站上用的是 max(16px, .76rem) 而不是把它塞進 pointer: coarse，
  // 因為觸控筆電與 iPad 的桌面模式都會讓那個媒體查詢對不上，而代價只是字大一點
  check('輸入框字級不小於 16px', await ev(`(() => {
    const px = (sel) => parseFloat(getComputedStyle(document.querySelector(sel)).fontSize);
    return px('#shutdown-card-tool input[type=text]') >= 16
      && px('#shutdown-card-tool textarea') >= 16;
  })()`), await ev(`getComputedStyle(document.querySelector('#shutdown-card-tool input[type=text]')).fontSize`));
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

  // 分艙。計畫那一層的內容填進畫面之後，卡片與列印容器都不該出現它。
  // 單元測試驗的是 serializeCard 的輸出，這裡驗的是實際畫出來的那份
  await ev(`(() => {
    const areas = [...document.querySelectorAll('#shutdown-card-tool textarea')];
    const set = (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); };
    set(areas[0], 'PLAN-STEPS-CHECK');
    set(areas[1], 'PLAN-VERIFY-CHECK');
    return areas.length;
  })()`);
  await sleep(150);
  check('計畫層的內容不會流到卡片與紙上', await ev(`(() => {
    const card = document.querySelectorAll('#shutdown-card-tool .sc-preview')[0].textContent;
    const printed = [...document.querySelectorAll('#shutdown-card-tool .sc-card')]
      .map((c) => c.textContent).join('');
    const plan = document.querySelectorAll('#shutdown-card-tool .sc-preview')[1].textContent;
    return !card.includes('PLAN-VERIFY-CHECK') && !card.includes('PLAN-STEPS-CHECK')
      && !printed.includes('PLAN-VERIFY-CHECK') && !printed.includes('PLAN-STEPS-CHECK')
      && plan.includes('PLAN-VERIFY-CHECK') && plan.includes('PLAN-STEPS-CHECK');
  })()`));

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
  // 量的是 rect 而不是 computed display：被藏起來的是表單的外層容器，
  // fieldset 自己的 display 照樣是 block，只是祖先沒了所以佔不到版面
  check('列印時表單本身不上紙',
    await ev(`document.querySelector('#shutdown-card-tool fieldset').getBoundingClientRect().height === 0`));
  check('列印時站台的頁首與側欄不上紙', await ev(`
    getComputedStyle(document.querySelector('.md-header')).display === 'none'
    && getComputedStyle(document.querySelector('.md-sidebar')).display === 'none'`));
  check('列印時文章本文不上紙',
    await ev(`getComputedStyle(document.querySelector('.md-content__inner h1')).display === 'none'`));
  // 空白頁的回歸檢查。用 visibility 藏東西的話版面高度會留著，卡片後面跟著五六
  // 張空白紙，而那是印出來才會發現的
  check('列印時整份文件收斂成卡片那一頁', await ev(`(() => {
    const doc = document.documentElement.scrollHeight;
    const cards = document.querySelector('#shutdown-card-tool .sc-print').getBoundingClientRect().height;
    return doc <= cards + 40;
  })()`), await ev(`[document.documentElement.scrollHeight,
    Math.round(document.querySelector('#shutdown-card-tool .sc-print').getBoundingClientRect().height)]`));
  await send('Emulation.setEmulatedMedia', { media: '' });
}

// 手機。iOS Safari 在字級小於 16px 的輸入框聚焦時會自動放大整頁而且不縮回來，
// 使用者看到的是填一填版面就被撐開。Chrome 不會這樣做，所以這一項只能量字級，
// 量不到症狀本身
console.log('\n[手機視窗 390 × 844，觸控]');
await send('Emulation.setDeviceMetricsOverride',
  { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.navigate', { url: `${base}/?lang=zh-TW` });
await sleep(500);

check('觸控裝置上的輸入框字級不小於 16px', await ev(`(() => {
  const px = (el) => parseFloat(getComputedStyle(el).fontSize);
  return matchMedia('(pointer: coarse)').matches
    && px(document.querySelector('#shutdown-card-tool input[type=text]')) >= 16
    && px(document.querySelector('#shutdown-card-tool textarea')) >= 16;
})()`), await ev(`[matchMedia('(pointer: coarse)').matches,
  getComputedStyle(document.querySelector('#shutdown-card-tool input[type=text]')).fontSize]`));

await ev(`(() => {
  const set = (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); };
  const boxes = [...document.querySelectorAll('#shutdown-card-tool input[type=text]')];
  set(boxes[0], '編輯部共同約定 v2');
  set(boxes[2], '阿明'); set(boxes[3], 'Signal'); set(boxes[4], '到住處樓下按門鈴');
  set(boxes[5], '小美'); set(boxes[6], 'https://example.org/a/very/long/path/without-any-spaces-1234567890');
  set(boxes[7], 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  return true;
})()`);
await sleep(200);
check('填進長字串之後畫面不會被撐寬', await ev(`(() => {
  const doc = document.documentElement;
  return doc.scrollWidth <= doc.clientWidth + 1;
})()`), await ev(`[document.documentElement.scrollWidth, document.documentElement.clientWidth]`));
await send('Emulation.clearDeviceMetricsOverride');

// 卡片容量的估算校準。純邏輯用「折行之後佔幾行」估，這裡把估的結果跟實際印出來
// 會不會被裁掉對起來。兩邊對不上的話，使用者要嘛被無謂地擋、要嘛在印出來之後才
// 發現最後幾行不見了
console.log('\n[卡片容量估算與實際列印高度的校準]');
// 視窗要設成 A4 的尺寸才量得準。headless 的列印模擬用的是視窗寬度而不是紙張寬度，
// 預設視窗比 A4 寬，同一份內容折行較少，量出來的容量會偏樂觀
await send('Emulation.setDeviceMetricsOverride',
  { width: 794, height: 1123, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: `${base}/?lang=zh-TW` });
await sleep(500);

const fillCard = (rows, longBackup) => ev(`(() => {
  const set = (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); };
  let guard = 0;
  while (document.querySelectorAll('#shutdown-card-tool .sc-contact').length / 2 < ${rows} && guard++ < 6) {
    const btn = [...document.querySelectorAll('#shutdown-card-tool button')]
      .find((b) => b.textContent.trim() === '增加一位' && !b.disabled);
    if (!btn) break;
    btn.click();
  }
  const boxes = [...document.querySelectorAll('#shutdown-card-tool input[type=text]')];
  set(boxes[0], '編輯部共同約定 v2'); set(boxes[1], '2026-10-04');
  const backup = ${longBackup}
    ? '到住處樓下按門鈴，門牌是三樓之二，晚上七點以後通常在家。不在的話問一樓的鄰居，'
      + '他知道我大概什麼時候回來，也可以留話給他。真的找不到人就留紙條在信箱。'
    : '按門鈴';
  for (let i = 0; i < ${rows}; i += 1) {
    set(boxes[2 + i * 3], '代號' + i);
    set(boxes[3 + i * 3], '平常用的通訊軟體');
    set(boxes[4 + i * 3], backup);
  }
  const rest = 2 + ${rows} * 3;
  set(boxes[rest], '中正紀念堂五號出口');
  set(boxes[rest + 1], '每日 18:00 到 19:00');
  const pick = (name, n) => {
    const list = [...document.querySelectorAll('#shutdown-card-tool input[name="' + name + '"]')];
    if (!list[n]) return;
    list[n].checked = true;
    list[n].dispatchEvent(new Event('change', { bubbles: true }));
  };
  pick('sc-triggerPrepare', 0);
  pick('sc-triggerActivate', 2);
  return document.querySelectorAll('#shutdown-card-tool .sc-contact').length / 2;
})()`);

// 量的是文字實際佔的高度與卡片扣掉內距之後的可用高度。不能用 scrollHeight：
// 卡片是 overflow: hidden 的 grid item，量出來永遠等於 clientHeight，內容溢出多少
// 都看不出來，這一點本身就踩過一次
const overflowState = async () => {
  await send('Emulation.setEmulatedMedia', { media: 'print' });
  await sleep(200);
  const r = await ev(`(() => {
    const card = document.querySelector('#shutdown-card-tool .sc-card');
    if (!card) return null;
    const cs = getComputedStyle(card);
    const range = document.createRange();
    range.selectNodeContents(card);
    const textH = range.getBoundingClientRect().height;
    const inner = card.getBoundingClientRect().height
      - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const lineH = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.6;
    return {
      warned: !!document.querySelector('#shutdown-card-tool .sc-warn-hard'),
      cut: textH > inner + 1,
      lines: Math.round(textH / lineH),
      capacity: Math.floor(inner / lineH),
    };
  })()`);
  await send('Emulation.setEmulatedMedia', { media: '' });
  return r;
};

// 只驗一個方向：工具說放得下的時候，實際列印一定放得下。
//
// 反過來那個方向（工具說會超出、實際也超出）在不同機器上不成立，因為折行取決於
// 中文字實際渲染出來多寬，而那要看系統裝了哪些字型。同一份內容在有中文字型的
// 桌機上佔 27 行，在沒有中文字型的 CI runner 上只佔 17 行。估算因此刻意取保守值，
// 寧可偶爾多提醒一次，也不要讓使用者以為放得下、印出來卻少了最後幾行。
const three = await fillCard(3, false);
const small = await overflowState();
console.log(`    三位聯絡人、備援寫短：佔 ${small.lines} 行、卡片放得下 ${small.capacity} 行`);
check('三位聯絡人放得下，而且工具沒有誤擋', !small.cut && !small.warned, small);

const five = await fillCard(5, true);
const big = await overflowState();
console.log(`    ${five} 位聯絡人、備援寫成兩三句：佔 ${big.lines} 行、卡片放得下 ${big.capacity} 行`
  + `，工具${big.warned ? '有' : '沒有'}提醒`);
check('內容超出時工具擋得下來', big.warned, big);
check('沒有被工具擋下來的內容，實際列印一定放得下', big.warned || !big.cut, big);

check('三個語系的狀態列文案各不相同', new Set(statusTexts).size === 3, statusTexts);
check('全程沒有未處理的例外', errs.length === 0, errs);

await send('Emulation.clearDeviceMetricsOverride');

console.log(`\n${passed} 通過，${failed} 失敗`);
process.exit(failed ? 1 : 0);
