#!/usr/bin/env node
/**
 * 檢查「Tor 中繼地球儀」變電所卡片上那支容量計，在全部 280 座 × 三語系底下都畫得對。
 *
 * === 這張圖在講什麼 ===
 *
 * 裝置容量、可靠容量、前一年尖峰負載三個數字都是 MVA，擺在同一條軸上，N-1 的定義
 * 就變成看得到的幾何：可靠容量那道刻度到裝置容量之間的斜紋帶，寬度正好是最大那一台
 * 主變壓器，故障時消失的就是那一段。負載填色越過刻度，意思是尖峰時掉一台會撐不住。
 *
 * 上一版畫的是「負載除以可靠容量」，滿格 220%。100% 那條線落在軌道的 45.5% 卻沒有
 * 任何標記，而四分之三的站都在線內，看到的只是一截藍條，讀不出離線多遠。裝置容量
 * 更是完全沒出現在圖上。
 *
 * === 為什麼要開瀏覽器 ===
 *
 * 刻度標籤會不會擠在一起，取決於文字實際渲染出來多寬，那跟語言與字型都有關，用字數
 * 估不準。實測 rel/cap 為 0.75 的那 29 座只在英文版擠到，0.8333 的那一座三種語言都擠。
 * subGauge 因此不自己判斷，改由 fitGaugeScale 在 DOM 裡量完再決定要不要換行，這支
 * 也就得在真的瀏覽器裡驗。
 *
 * 驗的是真東西：subGauge 與 fitGaugeScale 從 atlas.js 原地抽出來，CSS 直接搬
 * index.html 的整份 <style>，字串載入真的 i18n.js。只有卡片外殼是這裡搭的。
 *
 * 掃全部 280 座而不是手挑幾個。會出事的都是邊界值，手挑就是在猜哪些是邊界。
 *
 * 用法：
 *   node tools/check_sub_gauge.mjs          # 三語系全掃
 *   node tools/check_sub_gauge.mjs --shot   # 另外存一張代表性樣本的截圖
 * 有問題時 exit 1。沒有 google-chrome 時跳過並回 0。
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, '..', 'docs', 'zh-TW', 'games', 'tor-network');
const PORT_CDP = 9412;
const LANGS = ['zh-TW', 'zh-cn', 'en'];
// 桌機寬度與手機寬度都要驗。卡片寬 min(94vw, 470px)，390px 的手機只剩 366px，
// 標籤能不能並排差很多，只驗寬的會漏掉手機上的擠壓。
const VIEWS = [{ w: 520, nm: '寬 520' }, { w: 390, nm: '窄 390' }];
const SHOT = process.argv.includes('--shot');
// 截圖用的代表性樣本：最低負載率、餘裕帶最寬、中位、剛過 100%、最高、
// 尖峰超過裝置容量、可靠容量等於裝置容量、單台主變。
const SAMPLE = ['嘉埔S/S', '博嘉S/S', '新埔S/S', '西屯S/S', '三和S/S', '新市S/S', '永和S/S', '光洲S/S', '佳安S/S', '仙洞S/S'];

try { execSync('command -v google-chrome', { stdio: 'ignore' }); }
catch { console.log('  找不到 google-chrome，跳過容量計的版面檢查'); process.exit(0); }

function extractFn(src, header) {
  const i = src.indexOf(header);
  if (i < 0) throw new Error(`atlas.js 裡找不到 ${header}`);
  let depth = 0, started = false;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') { depth++; started = true; }
    else if (src[j] === '}') { depth--; if (started && depth === 0) return src.slice(i, j + 1); }
  }
  throw new Error(`${header} 的大括號沒有配對成功`);
}

const atlas = fs.readFileSync(path.join(DIR, 'atlas.js'), 'utf8');
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
// 整份 style 原封搬過來。用正則挑規則挑錯就會漏掉多行寫法的，畫面看起來像功能壞了，
// 其實是這支自己沒套到 CSS。
const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
const fns = extractFn(atlas, 'function subGauge(d)') + '\n' + extractFn(atlas, 'function fitGaugeScale(bar)');
const subs = JSON.parse(fs.readFileSync(path.join(DIR, 'tw-power.json'), 'utf8')).subs;

const page = (lang, list) => `<!doctype html><html><head><meta charset="utf-8"><style>
${css}
html, body { overflow: visible !important; height: auto !important; background: #04060d; margin: 0; padding: 18px; }
.wrap { display: grid; gap: 14px; }
/* 寬度不覆寫。真規則是 min(94vw, 470px)，窄螢幕上刻度標籤擠不擠得下差很多，
   那正是要驗的東西。 */
#cc-card { position: static !important; transform: none !important; }
</style></head><body><div class="wrap" id="w"></div>
<script type="module">
import { t } from './i18n.js';
const LANG = ${JSON.stringify(lang)};
const S = (k, v) => t(LANG, k, v);
const COL = { powLo: 0x7ea8e0, powHi: 0xe8559a, powSolo: 0xd9d3c0 };
${fns}
const num = (x) => (x == null ? '–' : Math.round(x * 10) / 10);
const wrap = document.getElementById('w');
for (const d of ${JSON.stringify(list)}) {
  const ratio = d.ratio === null ? '–' : Math.round(d.ratio * 100);
  const body = d.solo ? S('pkSubSolo', { cap: num(d.cap), load: num(d.load) })
    : S(d.cap - d.rel < 1e-9 ? 'pkSubFlat' : 'pkSub', { ratio });
  const el = document.createElement('div');
  el.className = 'panel'; el.id = 'cc-card';
  el.innerHTML = '<div id="cc-head"><div id="cc-code">' + d.name + '</div>'
    + '<div id="cc-sub">' + d.county + '</div></div>'
    + '<div id="cc-bar" class="gauge">' + subGauge(d) + '</div>'
    + '<div id="cc-body">' + body + '</div>';
  wrap.appendChild(el);
}
for (const b of document.querySelectorAll('#cc-bar')) fitGaugeScale(b);
window.__ready = true;
</script></body></html>`;

// 量出來的東西：標籤有沒有兩軸都疊到、有沒有越出卡片、刻度有沒有被軌道切掉、
// 斜紋帶寬度是不是等於「裝置容量減可靠容量」。最後一項是幾何本身有沒有畫對。
const PROBE = `(function () {
  const out = [];
  for (const c of document.querySelectorAll('#cc-card')) {
    const nm = c.querySelector('#cc-code').textContent;
    const bar = c.querySelector('#cc-bar');
    const box = c.getBoundingClientRect(), tr = bar.querySelector('.tr').getBoundingClientRect();
    const bad = [];
    const ls = [...bar.querySelectorAll('.sc > span')].map((e) => {
      const r = e.getBoundingClientRect();
      return { t: e.textContent.trim(), l: r.left, r: r.right, tp: r.top, bt: r.bottom };
    });
    for (let i = 0; i < ls.length; i++) for (let j = i + 1; j < ls.length; j++) {
      const a = ls[i], b = ls[j];
      if (a.l < b.r + 6 && b.l < a.r + 6 && a.tp < b.bt && b.tp < a.bt) bad.push('標籤重疊 ' + a.t + ' / ' + b.t);
    }
    for (const e of ls) if (e.l < box.left + 17 - 0.5 || e.r > box.right - 17 + 0.5) bad.push('標籤越出卡片 ' + e.t);
    for (const e of bar.querySelectorAll('.tk')) {
      const r = e.getBoundingClientRect();
      if (r.width < 1 || r.left < tr.left - 0.5 || r.right > tr.right + 0.5) bad.push('刻度被切掉');
    }
    const n1 = bar.querySelector('.n1');
    if (n1) out.push({ nm, bad, n1: n1.getBoundingClientRect().width / tr.width, two: bar.classList.contains('two') });
    else out.push({ nm, bad, n1: null, two: bar.classList.contains('two') });
  }
  return JSON.stringify(out);
})()`;

const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/' || u.startsWith('/page-')) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(srv.pages[u] || '');
  }
  const f = path.join(DIR, u);
  if (!f.startsWith(DIR) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'application/json' });
  fs.createReadStream(f).pipe(res);
});
srv.pages = {};
for (const l of LANGS) srv.pages[`/page-${l}`] = page(l, subs);
if (SHOT) srv.pages['/page-shot'] = page('zh-TW', SAMPLE.map((n) => subs.find((s) => s.name === n)).filter(Boolean));
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const port = srv.address().port;

const prof = fs.mkdtempSync('/tmp/gauge-');
const chrome = spawn('google-chrome', ['--headless=new', `--remote-debugging-port=${PORT_CDP}`,
  `--user-data-dir=${prof}`, '--no-sandbox', 'about:blank'], { stdio: 'ignore' });
let wsUrl;
for (let i = 0; i < 80 && !wsUrl; i++) {
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${PORT_CDP}/json/list`)).json()).find((x) => x.type === 'page')?.webSocketDebuggerUrl; } catch {}
  if (!wsUrl) await new Promise((r) => setTimeout(r, 250));
}
if (!wsUrl) { console.error('Chrome 沒起來'); chrome.kill(); process.exit(1); }
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0; const pend = new Map(); const errs = [];
ws.addEventListener('message', (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pend.has(d.id)) { pend.get(d.id)(d.result); pend.delete(d.id); }
  if (d.method === 'Runtime.exceptionThrown') errs.push((d.params.exceptionDetails.exception?.description || '').slice(0, 200));
});
const send = (me, p = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: me, params: p })); });
const ev = async (x) => (await send('Runtime.evaluate', { expression: x, returnByValue: true })).result?.value;
await send('Runtime.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 520, height: 1000, deviceScaleFactor: 2, mobile: false });

const fail = [];
for (const view of VIEWS) {
await send('Emulation.setDeviceMetricsOverride', { width: view.w, height: 1000, deviceScaleFactor: 2, mobile: view.w < 500 });
for (const lang of LANGS) {
  await send('Page.navigate', { url: `http://127.0.0.1:${port}/page-${lang}` });
  for (let i = 0; i < 60 && !(await ev('window.__ready')); i++) await new Promise((r) => setTimeout(r, 250));
  const rows = JSON.parse(await ev(PROBE) || '[]');
  if (rows.length !== subs.length) { fail.push(`✗ ${view.nm} ${lang}：只畫出 ${rows.length} 張卡片，應該有 ${subs.length}`); continue; }
  const bad = rows.filter((r) => r.bad.length);
  // 斜紋帶寬度要等於「裝置容量減可靠容量」佔軸長的比例，那是這張圖的意義所在
  const geo = rows.filter((r) => {
    const d = subs.find((s) => s.name === r.nm);
    if (!d || d.solo || r.n1 === null) return false;
    const want = (d.cap - d.rel) / Math.max(d.cap, d.load);
    return Math.abs(r.n1 - want) > 0.005;
  });
  const tag = `${view.nm} ${lang}`;
  for (const r of bad.slice(0, 8)) fail.push(`✗ ${tag} ${r.nm}：${r.bad.join('、')}`);
  if (bad.length > 8) fail.push(`  ⋯ ${tag} 另有 ${bad.length - 8} 張同類問題`);
  for (const r of geo.slice(0, 5)) fail.push(`✗ ${tag} ${r.nm}：斜紋帶寬度不等於裝置容量減可靠容量`);
  if (!bad.length && !geo.length) {
    console.log(`  ✓ ${tag}：${rows.length} 座全部沒有標籤重疊、越界或刻度被切，`
      + `斜紋帶寬度都對（${rows.filter((r) => r.two).length} 座需要換兩行）`);
  }
}
}
await send('Emulation.setDeviceMetricsOverride', { width: 520, height: 1000, deviceScaleFactor: 2, mobile: false });

if (SHOT) {
  await send('Page.navigate', { url: `http://127.0.0.1:${port}/page-shot` });
  for (let i = 0; i < 60 && !(await ev('window.__ready')); i++) await new Promise((r) => setTimeout(r, 250));
  const h = await ev("document.getElementById('w').getBoundingClientRect().height");
  const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: 512, height: Math.ceil(h) + 36, scale: 2 } });
  const out = path.join(process.env.CLAUDE_JOB_DIR || '/tmp', 'sub-gauge.png');
  fs.writeFileSync(out, Buffer.from(r.data, 'base64'));
  console.log('  截圖：' + out);
}

if (errs.length) fail.push('✗ 頁面拋出例外：' + errs.join(' | '));
ws.close(); chrome.kill(); srv.close();
setTimeout(() => {
  try { fs.rmSync(prof, { recursive: true, force: true }); } catch {}
  if (fail.length) {
    console.error('\n' + fail.join('\n'));
    console.error('\n標籤是照軸上的位置擺的，字串變長就會擠在一起。改 i18n 的 gLoad / gRel / gCap');
    console.error('或改 subGauge 的錨定門檻之後，這支要重跑。');
    process.exit(1);
  }
  console.log('\n容量計在三語系底下的版面都沒問題。');
  process.exit(0);
}, 500);
