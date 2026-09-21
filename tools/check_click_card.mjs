#!/usr/bin/env node
/**
 * 點國家標籤、點地表都要開得出卡片，從標籤上拖曳則不開。
 *
 * === 踩過的坑 ===
 *
 * #563 把拖曳改掛在 window，順手把 setPointerCapture 放在 pointerdown 的當下。
 * 之後兩條點擊的路同時斷掉，而拖曳、縮放、自轉全部正常，畫面上看不出哪裡壞了，
 * 回報的說法是「按地圖上的點點或是國家縮寫的字樣都不會出現資訊卡」。
 *
 *   點標籤    按下當下就捕捉到畫布，放開之後的 click 送到畫布，標籤的 click
 *             處理器收不到。只有滑鼠會這樣，觸控的 click 照樣送到手指底下的
 *             元素，手機上點標籤沒有壞。
 *   點地表    畫布的 pointerup 用 pointers.size > 0 判斷還有沒有別根手指。清
 *             pointers 的那支搬到 window 之後，冒泡順序排在畫布後面，跑到畫布
 *             那一支的時候這一根自己還在裡面，條件永遠成立。
 *
 * 兩條都跟事件的派送順序與捕捉有關，把函式抽出來注入假相依重放驗不到，瀏覽器
 * 怎麼決定 click 的目標也不在 atlas.js 裡。所以這支開 headless Chrome，用 CDP
 * 送真的滑鼠事件。
 *
 * 第三項反過來驗。標籤跟著地表移動，從標籤上拖曳時標籤會一路停在手指底下，放開
 * 的位置還是在標籤上。捕捉晚一步或是乾脆不捕捉，拖完就會開出一張卡片。
 *
 * 點地表那一項開 ?hex，走六角層命中國家那條路。登陸點與電廠也走同一個 pointerup，
 * 但 #568 之後預設關著，開了也不知道它們畫在螢幕的哪裡。候選點取大國的標籤旁邊，
 * 小國的標籤旁邊常常是海，點下去本來就沒有東西。
 *
 * 只送滑鼠事件。觸控有目標校正，點在小標籤旁邊的地表會被吸到標籤上，點地表那一項
 * 會在沒走到畫布的情況下通過。
 *
 * 沒有 google-chrome 或 WebGPU 起不來就跳過並回 0，跟 check_layers_toggle.mjs
 * 同一套環境判斷。
 *
 * 用法：
 *   node tools/check_click_card.mjs
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..', 'docs', 'zh-TW');
const PAGE = '/games/tor-network/play/';

try { execSync('command -v google-chrome', { stdio: 'ignore' }); }
catch { console.log('  找不到 google-chrome，跳過點擊開卡片的檢查'); process.exit(0); }

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
};
const srv = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]);
  if (u.endsWith('/')) u += 'index.html';
  const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(404); return res.end();
  }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const port = srv.address().port;

// Chrome 的參數與理由見 check_layers_toggle.mjs。除錯埠讓 Chrome 自己挑，
// 沒有顯示卡的機器靠 SwiftShader 走軟體路徑。
const prof = fs.mkdtempSync('/tmp/click-card-');
const chrome = spawn('google-chrome', ['--headless=new', '--remote-debugging-port=0',
  `--user-data-dir=${prof}`, '--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-webgpu',
  '--enable-features=Vulkan', '--use-angle=vulkan',
  '--enable-unsafe-swiftshader', '--use-webgpu-adapter=swiftshader',
  '--window-size=1280,900', 'about:blank'],
  { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
const bye = (code) => { try { ws && ws.close(); } catch {} chrome.kill(); srv.close(); process.exit(code); };

const portFile = path.join(prof, 'DevToolsActivePort');
let cdp = 0, wsUrl;
for (let i = 0; i < 60 && !cdp; i++) {
  await sleep(250);
  try { cdp = parseInt(fs.readFileSync(portFile, 'utf8').split('\n')[0], 10) || 0; } catch {}
}
for (let i = 0; i < 60 && cdp && !wsUrl; i++) {
  await sleep(250);
  try {
    wsUrl = (await (await fetch(`http://127.0.0.1:${cdp}/json/list`)).json())
      .find((x) => x.type === 'page')?.webSocketDebuggerUrl;
  } catch {}
}
if (!wsUrl) { console.error('Chrome 沒起來'); bye(1); }

ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pend = new Map();
const errs = [];
const NOISE = /WebGPU Device Lost|Instance dropped in popErrorScope/;
let collecting = true;
const note = (line) => { if (collecting && !NOISE.test(line)) errs.push(line); };
ws.addEventListener('message', (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pend.has(d.id)) { pend.get(d.id)(d.result); pend.delete(d.id); }
  if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') {
    note(d.params.args.map((a) => a.value || a.description || '').join(' '));
  }
  if (d.method === 'Runtime.exceptionThrown') {
    const x = d.params.exceptionDetails;
    note('未捕捉例外: ' + (x.exception?.description || x.text));
  }
});
const send = (method, params = {}) => new Promise((r) => {
  const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params }));
});
const ev = async (expression) =>
  (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.value;

await send('Runtime.enable');
await send('Page.enable');
await send('Page.navigate', { url: `http://127.0.0.1:${port}${PAGE}?debug&hex` });
let loaded = false;
for (let i = 0; i < 120 && !loaded; i++) {
  await sleep(500);
  loaded = !!(await ev(`!!document.querySelector('#loading.done')`));
}
if (!loaded) { console.error('作品沒有載入完成'); bye(1); }
if (!(await ev(`!!window.__atlas`))) {
  const why = await ev(`(async () => {
    if (!navigator.gpu) return 'navigator.gpu 不存在';
    try {
      const a = await navigator.gpu.requestAdapter();
      if (!a) return 'requestAdapter 回 null';
      return 'adapter 有了但 renderer.init 沒過：' + JSON.stringify(a.info || {});
    } catch (e) { return 'requestAdapter 丟出 ' + e.message; }
  })()`);
  console.log(`  WebGPU 起不來，跳過點擊開卡片的檢查（${why}）`);
  bye(0);
}
// 六角層建好之後按鈕才會露出來。建不起來的話點地表那一項沒有東西可以點
let hexReady = false;
for (let i = 0; i < 80 && !hexReady; i++) {
  hexReady = !!(await ev(`!document.getElementById('btn-hex').hidden`));
  if (!hexReady) await sleep(250);
}
// 等六角層淡入。pickHexCC 在透明度低於 0.3 時不回應
await sleep(1500);

const ok = [], fail = [];
const check = (c, m) => (c ? ok : fail).push(m);

const mouse = (type, x, y, extra = {}) =>
  send('Input.dispatchMouseEvent', { type, x, y, button: 'left', ...extra });
const tap = async (x, y) => {
  await mouse('mouseMoved', x, y, { buttons: 0 });
  await mouse('mousePressed', x, y, { buttons: 1, clickCount: 1 });
  await mouse('mouseReleased', x, y, { buttons: 0, clickCount: 1 });
  await sleep(400);
};
const cardShown = () => ev(`!document.getElementById('cc-card').hidden`);
const hideCard = () => ev(`document.getElementById('cc-card').hidden = true`);
const cardText = async () =>
  ((await ev(`document.getElementById('cc-card').textContent`)) || '').replace(/\s+/g, ' ').trim().slice(0, 24);

// 畫面上點得到的標籤：中心點 elementFromPoint 就是它自己，沒被面板或別的標籤蓋住
const labels = () => ev(`(() => {
  const out = [];
  for (const el of document.querySelectorAll('#labels .lb.on')) {
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    if (document.elementFromPoint(x, y) !== el) continue;
    out.push({ cc: el.dataset.cc, text: el.textContent, x, y, w: r.width });
  }
  return out.sort((a, b) => b.w - a.w);
})()`);
const labelAt = (cc) => ev(`(() => {
  const r = document.querySelector('#labels .lb[data-cc="${cc}"]').getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
})()`);

// ── 點國家標籤 ──────────────────────────────────────────────
{
  await hideCard();
  const lb = (await labels())[0];
  if (!lb) { console.error('畫面上找不到點得到的國家標籤'); bye(1); }
  await tap(lb.x, lb.y);
  const shown = await cardShown();
  check(shown, `點國家標籤 ${lb.text}，卡片出現${shown ? `（${await cardText()}）` : ''}`);
}

// ── 點地表 ──────────────────────────────────────────────────
check(hexReady, '六角層建得起來，點地表那一項才有東西可以點');
if (hexReady) {
  const big = ['ru', 'cn', 'us', 'ca', 'br', 'au', 'in', 'kz', 'mn', 'ar', 'dz', 'sa'];
  const cands = await ev(`(() => {
    const cv = document.querySelector('canvas');
    const out = [];
    for (const el of document.querySelectorAll('#labels .lb.on')) {
      if (!${JSON.stringify(big)}.includes(el.dataset.cc)) continue;
      const r = el.getBoundingClientRect();
      const x0 = r.left + r.width / 2, y0 = r.top + r.height / 2;
      for (const [dx, dy] of [[0, 16], [0, -16], [20, 0], [-20, 0]]) {
        const x = x0 + dx, y = y0 + dy;
        if (document.elementFromPoint(x, y) === cv) { out.push({ text: el.textContent, x, y }); break; }
      }
    }
    return out;
  })()`);
  let hit = null;
  for (const c of cands.slice(0, 4)) {
    await hideCard();
    await tap(c.x, c.y);
    if (await cardShown()) { hit = { ...c, card: await cardText() }; break; }
  }
  check(cands.length > 0, `畫面上有大國的標籤可以當候選（${cands.map((c) => c.text).join('、')}）`);
  check(!!hit, hit
    ? `點 ${hit.text} 旁邊的地表，卡片出現（${hit.card}）`
    : `點大國標籤旁邊的地表，${cands.length} 個候選都沒開出卡片`);
}

// ── 從標籤上拖曳 ────────────────────────────────────────────
{
  await hideCard();
  const lb = (await labels())[0];
  await mouse('mouseMoved', lb.x, lb.y, { buttons: 0 });
  await mouse('mousePressed', lb.x, lb.y, { buttons: 1, clickCount: 1 });
  for (let i = 1; i <= 10; i++) await mouse('mouseMoved', lb.x + i * 8, lb.y, { buttons: 1 });
  // 地表跟著手指走，標籤也跟著移動。放開在標籤最新的位置上，
  // 模擬的就是標籤一路停在手指底下的那個情況
  const now = await labelAt(lb.cc);
  await mouse('mouseMoved', now.x, now.y, { buttons: 1 });
  await mouse('mouseReleased', now.x, now.y, { buttons: 0, clickCount: 1 });
  await sleep(400);
  const moved = Math.hypot(now.x - lb.x, now.y - lb.y);
  check(moved > 20, `從標籤 ${lb.text} 上拖得動地球（標籤移動了 ${moved.toFixed(0)} px）`);
  check(!(await cardShown()), `從標籤 ${lb.text} 上拖曳再放開，不會開出卡片`);
}

collecting = false;

for (const m of ok) console.log(`  ok   ${m}`);
if (errs.length) {
  console.error('');
  for (const e of errs.slice(0, 10)) console.error(`  主控台錯誤 ${e}`);
}
if (fail.length) {
  console.error('');
  for (const m of fail) console.error(`  FAIL ${m}`);
  console.error(`\n${fail.length} 項沒過（共 ${ok.length + fail.length} 項）`);
  bye(1);
}
if (errs.length) { console.error(`\n點擊的過程中有 ${errs.length} 則主控台錯誤`); bye(1); }
console.log(`\n全部 ${ok.length} 項通過`);
bye(0);
